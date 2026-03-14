#include "main.h"

#include <esp_event.h>
#include <esp_log.h>
#include <peer.h>

#ifndef LINUX_BUILD
#include "nvs_flash.h"

extern "C" void app_main(void) {
  esp_err_t ret = nvs_flash_init();
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES ||
      ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  auto cfg = M5.config();
  M5.begin(cfg);

  M5.Display.setBrightness(70);
  pipecat_init_screen();
  pipecat_screen_system_log("Pipecat ESP32 client initialized.");
  pipecat_screen_loop();

  ESP_ERROR_CHECK(esp_event_loop_create_default());
  peer_init();
  pipecat_init_audio_capture();
  pipecat_init_audio_decoder();
  pipecat_screen_system_log("Connecting to WiFi...");
  pipecat_screen_loop();
  pipecat_init_wifi();
  pipecat_screen_system_log("WiFi connected. Tap CLICK FOR HELP.");

  bool webrtc_started = false;

  while (1) {
    pipecat_screen_loop();
    if (!webrtc_started && pipecat_screen_take_connect_request()) {
      pipecat_init_webrtc();
      webrtc_started = true;
    }
    pipecat_webrtc_loop();
    vTaskDelay(pdMS_TO_TICKS(TICK_INTERVAL));
  }
}
#else
int main(void) {
  ESP_ERROR_CHECK(esp_event_loop_create_default());
  peer_init();
  pipecat_webrtc();

  while (1) {
    pipecat_webrtc_loop();
    vTaskDelay(pdMS_TO_TICKS(TICK_INTERVAL));
  }
}
#endif
