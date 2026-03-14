#include <opus.h>

#include <atomic>
#include <cstdint>
#include <cstdio>
#include <cstring>

#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#include "esp_check.h"
#include "esp_heap_caps.h"
#include "esp_log.h"
#include "main.h"

#define SAMPLE_RATE 16000
#define FRAME_MS 20
#define FRAME_SAMPLES ((SAMPLE_RATE * FRAME_MS) / 1000)
#define FRAME_BYTES (FRAME_SAMPLES * sizeof(int16_t))
#define PLAYBACK_BUFFERS 3

#define OPUS_BUFFER_SIZE 1276
#define OPUS_ENCODER_BITRATE 30000
#define OPUS_ENCODER_COMPLEXITY 5

std::atomic<bool> is_playing = false;
unsigned int silence_count = 0;

static opus_int16 *decoder_buffers[PLAYBACK_BUFFERS] = {NULL};
static size_t decoder_buffer_index = 0;

void set_is_playing(int16_t *in_buf, size_t in_samples) {
  bool any_set = false;
  for (size_t i = 0; i < in_samples; i++) {
    if (in_buf[i] != -1 && in_buf[i] != 0 && in_buf[i] != 1) {
      any_set = true;
      break;
    }
  }

  if (any_set) {
    silence_count = 0;
  } else {
    silence_count++;
  }

  if (silence_count >= 20 && is_playing) {
    M5.Speaker.end();
    M5.Mic.begin();
    is_playing = false;
  } else if (any_set && !is_playing) {
    M5.Mic.end();
    M5.Speaker.begin();
    is_playing = true;
  }
}

void pipecat_init_audio_capture() {
  auto spk_cfg = M5.Speaker.config();
  spk_cfg.sample_rate = SAMPLE_RATE;
  spk_cfg.stereo = false;
  spk_cfg.dma_buf_len = 512;
  spk_cfg.dma_buf_count = 10;
  spk_cfg.task_priority = 6;
  M5.Speaker.config(spk_cfg);
  M5.Speaker.setVolume(112);

  auto mic_cfg = M5.Mic.config();
  mic_cfg.sample_rate = SAMPLE_RATE;
  mic_cfg.stereo = false;
  mic_cfg.magnification = 8;
  mic_cfg.noise_filter_level = 8;
  mic_cfg.dma_buf_len = 256;
  mic_cfg.dma_buf_count = 8;
  mic_cfg.task_priority = 6;
  M5.Mic.config(mic_cfg);
}

OpusDecoder *opus_decoder = NULL;

void pipecat_init_audio_decoder() {
  int decoder_error = 0;
  opus_decoder = opus_decoder_create(SAMPLE_RATE, 1, &decoder_error);
  if (decoder_error != OPUS_OK) {
    printf("Failed to create OPUS decoder\n");
    return;
  }

  for (size_t i = 0; i < PLAYBACK_BUFFERS; ++i) {
    decoder_buffers[i] =
        (opus_int16 *)heap_caps_malloc(FRAME_BYTES, MALLOC_CAP_8BIT);
  }
}

void pipecat_audio_decode(uint8_t *data, size_t size) {
  opus_int16 *out = decoder_buffers[decoder_buffer_index];
  if (!out) {
    return;
  }

  int decoded_samples =
      opus_decode(opus_decoder, data, size, out, FRAME_SAMPLES, 0);
  if (decoded_samples <= 0) {
    return;
  }

  set_is_playing(out, decoded_samples);

  if (is_playing) {
    if (M5.Speaker.playRaw(out, decoded_samples, SAMPLE_RATE, false, 1, -1,
                           false)) {
      decoder_buffer_index = (decoder_buffer_index + 1) % PLAYBACK_BUFFERS;
    }
  }
}

OpusEncoder *opus_encoder = NULL;
uint8_t *encoder_output_buffer = NULL;
int16_t *read_buffer = NULL;

void pipecat_init_audio_encoder() {
  int encoder_error = 0;
  opus_encoder =
      opus_encoder_create(SAMPLE_RATE, 1, OPUS_APPLICATION_VOIP, &encoder_error);
  if (encoder_error != OPUS_OK) {
    printf("Failed to create OPUS encoder\n");
    return;
  }

  opus_encoder_ctl(opus_encoder, OPUS_SET_BITRATE(OPUS_ENCODER_BITRATE));
  opus_encoder_ctl(opus_encoder, OPUS_SET_COMPLEXITY(OPUS_ENCODER_COMPLEXITY));
  opus_encoder_ctl(opus_encoder, OPUS_SET_SIGNAL(OPUS_SIGNAL_VOICE));

  read_buffer = (int16_t *)heap_caps_malloc(FRAME_BYTES, MALLOC_CAP_8BIT);
  encoder_output_buffer = (uint8_t *)malloc(OPUS_BUFFER_SIZE);
}

void pipecat_send_audio(PeerConnection *peer_connection) {
  if (is_playing) {
    memset(read_buffer, 0, FRAME_BYTES);
    vTaskDelay(pdMS_TO_TICKS(20));
  } else {
    if (!M5.Mic.record(read_buffer, FRAME_SAMPLES, SAMPLE_RATE)) {
      return;
    }
  }

  int encoded_size = opus_encode(opus_encoder, (const opus_int16 *)read_buffer,
                                 FRAME_SAMPLES, encoder_output_buffer,
                                 OPUS_BUFFER_SIZE);

  if (encoded_size > 0) {
    peer_connection_send_audio(peer_connection, encoder_output_buffer,
                               encoded_size);
  }
}
