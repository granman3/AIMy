# AIMy - Pet Store Help Kiosk

A voice AI kiosk built on Pipecat for a pet store. Shoppers press the ESP32 button, ask for products, add confirmed items to a list, and then scan a QR code for a shopping map.

## Architecture

```
ESP32 SmallWebRTC → Deepgram Flux STT → Claude (+ tools) → Deepgram TTS → ESP32
```

**Tools available to the agent:**
- `find_item` — search the in-store catalog
- `add_item` — add a confirmed product to the current session list
- `get_shopping_map` — generate a QR-linked shopping map for the current list

## Setup

```bash
# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Fill in all values in .env

# 4. Run the kiosk bot
cd server
uv sync
uv run bot.py --transport webrtc --esp32 --host <your-lan-ip>
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key |
| `DEEPGRAM_API_KEY` | Deepgram API key (STT) |
| `DEEPGRAM_TTS_VOICE` | Deepgram TTS voice |
| `KIOSK_PUBLIC_BASE_URL` | Optional public URL encoded into kiosk QR codes |

## Project Structure

```
AIMy/
├── server/           # SmallWebRTC kiosk bot and local map API
├── pipecat-esp32/    # ESP32 kiosk firmware
├── agent.py          # Older Daily-based prototype
└── README.md
```

## Team

Add your names here!

## Imported Pipecat Demo

This repository includes the Pipecat ESP32 SmallWebRTC kiosk flow used for the pet-store experience.

### Added directories

- `server/` - Python bot server for the SmallWebRTC pipeline
- `pipecat-esp32/` - ESP32-side project assets and configuration

### Demo configuration

- Bot Type: Web
- Transport: SmallWebRTC
- Pipeline: Cascade
- STT: Deepgram Flux
- LLM: Anthropic Claude
- TTS: Deepgram

### Demo setup

```bash
cd server
uv sync
cp .env.example .env
uv run bot.py
```
