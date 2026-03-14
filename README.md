# AIMy - AI Management System

A Claude-powered agent built to run inside a Pipecat workflow.

## Setup

```bash
# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# 4. Run the agent
python agent.py
```

## Project Structure

```
AIMy/
├── agent.py          # Main Pipecat pipeline + Claude agent
├── requirements.txt
├── .env.example
└── .gitignore
```

## Architecture

```
Audio Input → VAD → Claude (claude-opus-4-6) → Audio Output
```

The agent uses Pipecat's `AnthropicLLMService` to run Claude inside a
real-time pipeline with voice activity detection (VAD).

## Team

Add your names here!
