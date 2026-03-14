import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.services.anthropic import AnthropicLLMService
from pipecat.services.edge import EdgeTTSService
from pipecat.services.whisper import WhisperSTTService
from pipecat.transports.services.daily import DailyParams, DailyTransport

load_dotenv()

SYSTEM_PROMPT = """You are AIMy, an intelligent AI management assistant.
You help users coordinate, monitor, and interact with AI workflows.
Be concise, helpful, and proactive. You are speaking via voice, so keep
responses brief and conversational — avoid markdown or bullet lists."""

TOOLS = [
    {
        "name": "get_datetime",
        "description": "Get the current date and time.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "create_note",
        "description": "Save a note for the user.",
        "input_schema": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "The note content to save."}
            },
            "required": ["content"],
        },
    },
    {
        "name": "list_notes",
        "description": "List all saved notes.",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
]

# In-memory note store (replace with persistent storage as needed)
_notes: list[dict] = []


async def handle_get_datetime(function_name, tool_call_id, arguments, llm, context, result_callback):
    now = datetime.now().strftime("%A, %B %d, %Y at %I:%M %p")
    await result_callback(now)


async def handle_create_note(function_name, tool_call_id, arguments, llm, context, result_callback):
    note = {
        "id": len(_notes) + 1,
        "content": arguments["content"],
        "created_at": datetime.now().isoformat(),
    }
    _notes.append(note)
    await result_callback(f"Note #{note['id']} saved.")


async def handle_list_notes(function_name, tool_call_id, arguments, llm, context, result_callback):
    if not _notes:
        await result_callback("You have no saved notes.")
    else:
        lines = [f"{n['id']}. {n['content']}" for n in _notes]
        await result_callback("\n".join(lines))


async def main():
    transport = DailyTransport(
        os.getenv("DAILY_ROOM_URL"),
        os.getenv("DAILY_API_TOKEN"),
        "AIMy",
        DailyParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            vad_enabled=True,
            vad_analyzer=SileroVADAnalyzer(),
        ),
    )

    stt = WhisperSTTService()

    llm = AnthropicLLMService(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        model="claude-opus-4-6",
    )
    llm.register_function("get_datetime", handle_get_datetime)
    llm.register_function("create_note", handle_create_note)
    llm.register_function("list_notes", handle_list_notes)

    tts = EdgeTTSService(voice=os.getenv("EDGE_TTS_VOICE", "en-US-AndrewNeural"))

    context = OpenAILLMContext(
        messages=[{"role": "system", "content": SYSTEM_PROMPT}],
        tools=TOOLS,
    )
    context_aggregator = llm.create_context_aggregator(context)

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            context_aggregator.user(),
            llm,
            tts,
            transport.output(),
            context_aggregator.assistant(),
        ]
    )

    task = PipelineTask(pipeline, PipelineParams(allow_interruptions=True))

    @transport.event_handler("on_first_participant_joined")
    async def on_first_participant_joined(transport, participant):
        await transport.capture_participant_transcription(participant["id"])
        await task.queue_frames([context_aggregator.user().get_context_frame()])

    runner = PipelineRunner()
    await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
