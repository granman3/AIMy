# AIMy - Pet Store Help Kiosk

A voice AI kiosk for a pet store. Shoppers tap the ESP32 screen, describe what they need, hear product recommendations, and scan a QR code on the device screen to view their shopping plan on their phone.

## Architecture

Two-layer system: **Pipecat** handles real-time voice via WebRTC, **Next.js** handles state, tools, and the phone-facing plan page.

```
ESP32 mic --> [WebRTC audio] --> Pipecat :7860
  --> Deepgram STT (speech to text)
  --> Claude Haiku (text to tool calls)
  --> HTTP to Next.js :3000/api/tools/*
  --> Deepgram TTS (text to speech)
  --> [WebRTC audio] --> ESP32 speaker
  --> [RTVI datachannel] --> QR code on ESP32 screen

Phone scans QR --> Cloudflare Tunnel --> Next.js :3000/plan/{sessionId}
```

**Tools available to the agent:**
- `find_items` -- search the in-store catalog
- `add_item` -- add a confirmed product to the session list
- `remove_item` -- remove an item from the session list
- `generate_plan` -- generate a QR-linked shopping plan for the current list

## Quick Start (Step-by-Step)

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [uv](https://docs.astral.sh/uv/) (Python package manager: `brew install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) (`brew install cloudflared`)
- API keys: [Anthropic](https://console.anthropic.com/) and [Deepgram](https://console.deepgram.com/)
- For ESP32: [ESP-IDF toolchain](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/linux-macos-setup.html)

### Step 1: Find your LAN IP

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

Note this IP (e.g. `192.168.1.42`). You'll need it for Pipecat and ESP32.

### Step 2: Configure Next.js

```bash
cd aimy
pnpm install
cp .env.example .env.local
```

Edit `.env.local` and fill in your Anthropic key:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Leave `NEXT_PUBLIC_URL` commented out for now -- you'll set it after starting the tunnel.

### Step 3: Configure Pipecat

```bash
cd aimy/server
uv sync
cp .env.example .env
```

Edit `server/.env` and fill in both API keys:

```env
DEEPGRAM_API_KEY=your_deepgram_key
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 4: Start Next.js (Terminal 1)

```bash
cd aimy
pnpm dev
```

Verify: open http://localhost:3000 in your browser. You should see the kiosk chat page.

### Step 5: Start Pipecat (Terminal 2)

```bash
cd aimy/server
uv run bot.py --transport webrtc --esp32 --host <your-lan-ip> --port 7860
```

Replace `<your-lan-ip>` with the IP from Step 1. **Do NOT use `0.0.0.0`** -- the `--host` value is advertised in the WebRTC SDP so the ESP32 can reach your machine over local WiFi.

### Step 6: Start Cloudflare Tunnel (Terminal 3)

```bash
cloudflared tunnel --url http://localhost:3000
```

It will print a URL like:

```
https://inspired-automobile-experiment-barrier.trycloudflare.com
```

Copy that URL.

### Step 7: Set the tunnel URL and restart

Add the tunnel URL to **both** env files:

**`aimy/.env.local`** -- add/uncomment:
```env
NEXT_PUBLIC_URL=https://your-tunnel-url.trycloudflare.com
```

**`aimy/server/.env`** -- add/uncomment:
```env
NEXTJS_PUBLIC_URL=https://your-tunnel-url.trycloudflare.com
```

Now **restart both** Terminal 1 (`pnpm dev`) and Terminal 2 (`uv run bot.py ...`). The tunnel URL gets baked into the Next.js client bundle and Pipecat config at startup.

**Leave the tunnel running** in Terminal 3.

### Step 8: Verify

1. Open the tunnel URL in your browser -- the kiosk chat page should load
2. Open the tunnel URL on your phone (use cell data, not WiFi) -- confirms the tunnel works publicly
3. If you have an ESP32 connected: tap the screen, speak, verify voice + QR code

## ESP32 Firmware (M5Stack CoreS3)

### Build and flash

```bash
# Source ESP-IDF
source ~/esp/esp-idf/export.sh  # adjust to your ESP-IDF install path

# Set config (use your LAN IP from Step 1)
export WIFI_SSID="YourWiFiNetwork"
export WIFI_PASSWORD="YourWiFiPassword"
export PIPECAT_SMALLWEBRTC_URL="http://192.168.x.x:7860/api/offer"

# Build
cd aimy/pipecat-esp32/esp32-m5stack-cores3
idf.py --preview set-target esp32s3
idf.py build

# Flash (macOS auto-detects USB port)
idf.py flash

# Monitor serial output (optional, useful for debugging)
idf.py monitor
```

### How it works

1. Device boots and connects to WiFi automatically
2. Screen shows "CLICK FOR HELP" button
3. User taps the screen -- ESP32 sends a WebRTC offer to `PIPECAT_SMALLWEBRTC_URL`
4. WebRTC connection established -- user speaks, voice AI responds
5. When a shopping plan is generated, a QR code appears on the device screen
6. User scans QR with their phone -- opens the plan page through the Cloudflare Tunnel

**Note:** The WiFi SSID, password, and Pipecat URL are compiled into the firmware binary. If your LAN IP or WiFi network changes, you must rebuild and re-flash.

## Environment Variables

### Next.js (`aimy/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `NEXT_PUBLIC_URL` | For demo | Public URL for QR code links (tunnel URL). Falls back to `window.location.origin` |

### Pipecat (`aimy/server/.env`)

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `DEEPGRAM_API_KEY` | Yes | Deepgram API key (STT + TTS) |
| `NEXTJS_URL` | No | Internal URL for tool API calls (default: `http://localhost:3000`) |
| `NEXTJS_PUBLIC_URL` | For demo | Public URL for QR codes (should match `NEXT_PUBLIC_URL`) |

### ESP32 (compile-time)

| Variable | Required | Description |
|---|---|---|
| `WIFI_SSID` | Yes | WiFi network name |
| `WIFI_PASSWORD` | Yes | WiFi password |
| `PIPECAT_SMALLWEBRTC_URL` | Yes | Pipecat WebRTC endpoint (e.g. `http://192.168.1.42:7860/api/offer`) |

## Network Topology

```
                    +-- Cloudflare Tunnel (HTTPS) ----------------------+
                    |                                                    |
Phone (scans QR) ---|  https://your-tunnel.trycloudflare.com            |
                    |       |                                           |
                    |  Laptop :3000 (Next.js)                           |
                    |  Plan pages, chat API, tool APIs                  |
                    +---------------------------------------------------+

                    +-- Local WiFi (direct) ----------------------------+
                    |                                                    |
ESP32 (voice) ------|  http://192.168.x.x:7860/api/offer               |
                    |       |                                           |
                    |  Laptop :7860 (Pipecat)                           |
                    |  WebRTC audio + RTVI datachannel                  |
                    |       | (internal HTTP)                           |
                    |  Laptop :3000 (Next.js /api/tools/*)              |
                    +---------------------------------------------------+
```

- **Cloudflare Tunnel** carries HTTPS only (phone to plan page)
- **Local WiFi** carries WebRTC UDP (ESP32 to Pipecat voice)
- **localhost** carries HTTP (Pipecat to Next.js tool APIs)

## Demo Operator Notes

- **Keep Next.js running** throughout the demo. Sessions live in-memory; restarting loses all state.
- If you see a "Next.js fallback" log during a live session, **abort and start a fresh session**. Mixed state means the QR code may point to the wrong URL.
- **Test the full flow before demo:** speak, get QR, scan on phone through the tunnel, verify plan page loads with items.
- If the tunnel URL changes (ephemeral quick tunnels do this), update both `.env.local` and `server/.env`, then restart both services. For a stable demo, use a named Cloudflare Tunnel with a fixed hostname.
- The ESP32 and your laptop **must be on the same WiFi network**.

## Project Structure

```
aimy/
├── src/                  # Next.js app (state, tools, plan pages)
│   ├── app/
│   │   ├── api/tools/    # Tool endpoints called by Pipecat
│   │   ├── api/plan/     # Plan data endpoint
│   │   └── plan/         # Phone-facing plan page
│   └── lib/              # Business logic, store data, sessions
│       ├── actions/      # Plan generation
│       ├── conversation/ # Tool executor, prompt, state management
│       └── data/         # Store catalog and map data
├── server/               # Pipecat voice pipeline
│   └── bot.py            # Main bot entry point
├── pipecat-esp32/        # ESP32 kiosk firmware
│   ├── esp32-m5stack-cores3/  # M5Stack CoreS3 build
│   ├── esp32-s3-box-3/        # ESP32-S3-BOX-3 build
│   └── README.md              # ESP32-specific docs
└── README.md
```

## Troubleshooting

| Problem | Fix |
|---|---|
| "Plan Not Found" on phone | Next.js was restarted and lost session state. Start a new conversation. |
| ESP32 can't connect | Verify ESP32 and laptop are on same WiFi. Check `PIPECAT_SMALLWEBRTC_URL` IP matches your current LAN IP. |
| QR code goes to `localhost` | `NEXT_PUBLIC_URL` / `NEXTJS_PUBLIC_URL` not set or services not restarted after setting them. |
| Tunnel URL changed | Update both `.env.local` and `server/.env`, restart `pnpm dev` and `uv run bot.py`. |
| No voice response | Check Deepgram API key in `server/.env`. Check Pipecat terminal for errors. |
