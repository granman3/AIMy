#include <stdio.h>
#include <string.h>

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"

#include "main.h"

#define STATUS_TEXT_MAX_LEN 160
#define QR_TEXT_MAX_LEN 1024

typedef struct {
  SemaphoreHandle_t mutex;
  char status_text[STATUS_TEXT_MAX_LEN];
  char qr_text[QR_TEXT_MAX_LEN];
  bool connect_requested;
  bool restart_requested;
  bool connect_started;
  bool is_connected;
  bool qr_visible;
  bool dirty;
} screen_state_t;

static screen_state_t g_screen = {};

static uint16_t color_background() {
  return M5.Display.color565(12, 26, 44);
}

static uint16_t color_panel() {
  return M5.Display.color565(24, 46, 73);
}

static uint16_t color_button() {
  return M5.Display.color565(93, 234, 203);
}

static uint16_t color_button_outline() {
  return M5.Display.color565(205, 255, 246);
}

static uint16_t color_restart_button() {
  return M5.Display.color565(255, 119, 87);
}

static uint16_t color_restart_outline() {
  return M5.Display.color565(255, 214, 205);
}

static uint16_t color_muted_text() {
  return M5.Display.color565(168, 190, 216);
}

static void draw_restart_button(uint16_t bg) {
  const int width = 92;
  const int height = 28;
  const int x = M5.Display.width() - width - 14;
  const int y = 12;

  M5.Display.fillRoundRect(x, y, width, height, 14, color_restart_button());
  M5.Display.drawRoundRect(x, y, width, height, 14, color_restart_outline());
  M5.Display.setTextColor(BLACK, color_restart_button());
  M5.Display.setTextDatum(textdatum_t::middle_center);
  M5.Display.setTextSize(1);
  M5.Display.drawString("RESTART", x + (width / 2), y + (height / 2));
}

static void copy_text(char *dest, size_t dest_len, const char *src) {
  if (dest == NULL || dest_len == 0) {
    return;
  }

  if (src == NULL) {
    dest[0] = '\0';
    return;
  }

  snprintf(dest, dest_len, "%s", src);
}

static void draw_status_footer(const char *status_text, uint16_t background,
                               uint16_t text_color) {
  const int width = M5.Display.width();
  const int height = M5.Display.height();
  const int footer_height = 36;

  M5.Display.fillRect(0, height - footer_height, width, footer_height,
                      background);
  M5.Display.setTextColor(text_color, background);
  M5.Display.setTextSize(1);
  M5.Display.setTextDatum(textdatum_t::top_center);
  M5.Display.drawCenterString(status_text, width / 2, height - footer_height + 8);
}

static void draw_help_screen(const char *status_text) {
  const int width = M5.Display.width();
  const int button_width = 230;
  const int button_height = 72;
  const int button_x = (width - button_width) / 2;
  const int button_y = 98;
  const uint16_t bg = color_background();
  const uint16_t panel = color_panel();

  M5.Display.fillScreen(bg);
  M5.Display.fillRoundRect(20, 18, width - 40, 54, 18, panel);
  M5.Display.setTextColor(WHITE, panel);
  M5.Display.setTextSize(1);
  M5.Display.setTextDatum(textdatum_t::top_center);
  M5.Display.drawCenterString("Pipecat ESP32 Helper", width / 2, 30);
  draw_restart_button(bg);
  M5.Display.setTextColor(color_muted_text(), bg);
  M5.Display.drawCenterString("Tap the button or press a hardware key to call for help.",
                              width / 2, 82);

  M5.Display.fillRoundRect(button_x, button_y, button_width, button_height, 20,
                           color_button());
  M5.Display.drawRoundRect(button_x, button_y, button_width, button_height, 20,
                           color_button_outline());
  M5.Display.setTextColor(BLACK, color_button());
  M5.Display.setTextDatum(textdatum_t::middle_center);
  M5.Display.setTextSize(2);
  M5.Display.drawString("CLICK FOR HELP", width / 2,
                        button_y + (button_height / 2) - 2);

  M5.Display.setTextSize(1);
  draw_status_footer(status_text, bg, color_muted_text());
}

static void draw_connecting_screen(const char *status_text, bool is_connected) {
  const int width = M5.Display.width();
  const uint16_t bg = color_background();
  const uint16_t accent = is_connected ? M5.Display.color565(60, 214, 110)
                                       : M5.Display.color565(255, 199, 80);

  M5.Display.fillScreen(bg);
  draw_restart_button(bg);
  M5.Display.fillCircle(width / 2, 92, 28, accent);
  M5.Display.setTextColor(WHITE, bg);
  M5.Display.setTextDatum(textdatum_t::top_center);
  M5.Display.setTextSize(2);
  M5.Display.drawCenterString(is_connected ? "Connected" : "Connecting...",
                              width / 2, 138);
  M5.Display.setTextColor(color_muted_text(), bg);
  M5.Display.setTextSize(1);
  M5.Display.drawCenterString(
      is_connected ? "Waiting for server actions." : "Requesting a WebRTC session.",
      width / 2, 172);

  draw_status_footer(status_text, bg, color_muted_text());
}

static void draw_qr_screen(const char *qr_text, const char *status_text) {
  const int width = M5.Display.width();
  const int qr_size = 184;
  const int qr_x = (width - qr_size) / 2;
  const int qr_y = 28;

  M5.Display.fillScreen(WHITE);
  draw_restart_button(WHITE);
  M5.Display.setTextColor(BLACK, WHITE);
  M5.Display.setTextDatum(textdatum_t::top_center);
  M5.Display.setTextSize(2);
  M5.Display.drawCenterString("Scan for Help", width / 2, 4);
  M5.Display.qrcode(qr_text, qr_x, qr_y, qr_size, 1, true);
  M5.Display.setTextSize(1);
  M5.Display.drawCenterString("Use your phone camera to open the code.", width / 2,
                              216);

  draw_status_footer(status_text, WHITE, BLACK);
}

static void render_locked() {
  if (g_screen.qr_visible) {
    draw_qr_screen(g_screen.qr_text, g_screen.status_text);
  } else if (!g_screen.connect_started) {
    draw_help_screen(g_screen.status_text);
  } else {
    draw_connecting_screen(g_screen.status_text, g_screen.is_connected);
  }
}

static bool point_in_help_button(int x, int y) {
  const int width = M5.Display.width();
  const int button_width = 230;
  const int button_height = 72;
  const int button_x = (width - button_width) / 2;
  const int button_y = 98;

  return x >= button_x && x <= button_x + button_width && y >= button_y &&
         y <= button_y + button_height;
}

static bool point_in_restart_button(int x, int y) {
  const int width = 92;
  const int height = 28;
  const int button_x = M5.Display.width() - width - 14;
  const int button_y = 12;

  return x >= button_x && x <= button_x + width && y >= button_y &&
         y <= button_y + height;
}

static bool should_request_connect() {
  if (g_screen.connect_started || g_screen.qr_visible) {
    return false;
  }

  if (M5.BtnA.wasClicked() || M5.BtnB.wasClicked() || M5.BtnC.wasClicked() ||
      M5.BtnPWR.wasClicked()) {
    return true;
  }

  auto touch = M5.Touch.getDetail();
  return touch.wasClicked() && point_in_help_button(touch.x, touch.y);
}

static bool should_request_restart() {
  auto touch = M5.Touch.getDetail();
  return touch.wasClicked() && point_in_restart_button(touch.x, touch.y);
}

void pipecat_init_screen() {
  g_screen.mutex = xSemaphoreCreateMutex();
  copy_text(g_screen.status_text, sizeof(g_screen.status_text),
            "Initializing device...");
  g_screen.connect_requested = false;
  g_screen.restart_requested = false;
  g_screen.connect_started = false;
  g_screen.is_connected = false;
  g_screen.qr_visible = false;
  g_screen.dirty = true;

  M5.Display.setTextWrap(false, false);
  M5.Display.setTextFont(2);
  M5.Display.setTextSize(1);
  M5.Display.fillScreen(color_background());
}

void pipecat_screen_loop() {
  M5.update();

  if (g_screen.mutex == NULL) {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  if (should_request_restart()) {
    g_screen.restart_requested = true;
    copy_text(g_screen.status_text, sizeof(g_screen.status_text),
              "Restart requested...");
    g_screen.dirty = true;
  }
  if (should_request_connect()) {
    g_screen.connect_requested = true;
    g_screen.connect_started = true;
    g_screen.is_connected = false;
    g_screen.qr_visible = false;
    copy_text(g_screen.status_text, sizeof(g_screen.status_text),
              "Connecting to the help server...");
    g_screen.dirty = true;
  }

  if (g_screen.dirty) {
    render_locked();
    g_screen.dirty = false;
  }
  xSemaphoreGive(g_screen.mutex);
}

bool pipecat_screen_take_connect_request() {
  bool connect_requested = false;

  if (g_screen.mutex == NULL) {
    return false;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  connect_requested = g_screen.connect_requested;
  g_screen.connect_requested = false;
  xSemaphoreGive(g_screen.mutex);

  return connect_requested;
}

bool pipecat_screen_take_restart_request() {
  bool restart_requested = false;

  if (g_screen.mutex == NULL) {
    return false;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  restart_requested = g_screen.restart_requested;
  g_screen.restart_requested = false;
  xSemaphoreGive(g_screen.mutex);

  return restart_requested;
}

void pipecat_screen_system_log(const char *text) {
  if (g_screen.mutex == NULL) {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  copy_text(g_screen.status_text, sizeof(g_screen.status_text), text);
  g_screen.dirty = true;
  xSemaphoreGive(g_screen.mutex);
}

void pipecat_screen_new_log() {
  pipecat_screen_system_log("");
}

void pipecat_screen_log(const char *text) {
  if (g_screen.mutex == NULL || text == NULL) {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  size_t current_len = strlen(g_screen.status_text);
  size_t free_len = sizeof(g_screen.status_text) - current_len;
  if (free_len > 1) {
    snprintf(g_screen.status_text + current_len, free_len, "%s", text);
  }
  g_screen.dirty = true;
  xSemaphoreGive(g_screen.mutex);
}

void pipecat_screen_show_connecting() {
  if (g_screen.mutex == NULL) {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  g_screen.connect_started = true;
  g_screen.is_connected = false;
  g_screen.qr_visible = false;
  copy_text(g_screen.status_text, sizeof(g_screen.status_text),
            "Connecting to the help server...");
  g_screen.dirty = true;
  xSemaphoreGive(g_screen.mutex);
}

void pipecat_screen_show_connected() {
  if (g_screen.mutex == NULL) {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  g_screen.connect_started = true;
  g_screen.is_connected = true;
  copy_text(g_screen.status_text, sizeof(g_screen.status_text),
            "Connected. Waiting for QR code or agent action.");
  g_screen.dirty = true;
  xSemaphoreGive(g_screen.mutex);
}

void pipecat_screen_show_qr_code(const char *text) {
  if (g_screen.mutex == NULL || text == NULL || text[0] == '\0') {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  g_screen.connect_started = true;
  g_screen.is_connected = true;
  g_screen.qr_visible = true;
  copy_text(g_screen.qr_text, sizeof(g_screen.qr_text), text);
  copy_text(g_screen.status_text, sizeof(g_screen.status_text),
            "Scan the QR code with your phone.");
  g_screen.dirty = true;
  xSemaphoreGive(g_screen.mutex);
}

void pipecat_screen_hide_qr_code() {
  if (g_screen.mutex == NULL) {
    return;
  }

  xSemaphoreTake(g_screen.mutex, portMAX_DELAY);
  g_screen.qr_visible = false;
  if (g_screen.is_connected) {
    copy_text(g_screen.status_text, sizeof(g_screen.status_text),
              "Connected. Waiting for QR code or agent action.");
  }
  g_screen.dirty = true;
  xSemaphoreGive(g_screen.mutex);
}
