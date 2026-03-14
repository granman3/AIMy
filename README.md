# AIMy - AI Management System

A voice AI agent built on Pipecat, powered by Claude, Deepgram, and Cartesia.

## Architecture

```
Daily Room → Deepgram STT → Claude claude-opus-4-6 (+ tools) → Cartesia TTS → Daily Room
```

**Tools available to the agent:**
- `get_datetime` — current date and time
- `create_note` — save a note
- `list_notes` — recall saved notes

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

# 4. Run the agent
python agent.py
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key |
| `DAILY_ROOM_URL` | Daily.co room URL (e.g. `https://your-domain.daily.co/room`) |
| `DAILY_API_TOKEN` | Daily.co API token |
| `DEEPGRAM_API_KEY` | Deepgram API key (STT) |
| `CARTESIA_API_KEY` | Cartesia API key (TTS) |
| `CARTESIA_VOICE_ID` | Cartesia voice ID (optional, has default) |

## Project Structure

```
AIMy/
├── agent.py          # Pipeline, tools, and agent logic
├── requirements.txt
├── .env.example
└── .gitignore
```

## Team

Add your names here!
