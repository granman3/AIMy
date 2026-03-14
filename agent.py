import asyncio
import os
from dotenv import load_dotenv

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.services.anthropic import AnthropicLLMService
from pipecat.services.whisper import WhisperSTTService
from pipecat.services.gtts import GTTSTTSService
from pipecat.transports.local.audio import LocalAudioTransport, LocalAudioTransportParams

from prompts import PET_STORE_SYSTEM_PROMPT
from tools import PET_STORE_TOOLS, register_all_tools

load_dotenv()


async def main():
    transport = LocalAudioTransport(
        LocalAudioTransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            vad_enabled=True,
            vad_analyzer=SileroVADAnalyzer(),
        )
    )

    stt = WhisperSTTService(model="base")

    llm = AnthropicLLMService(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        model="claude-opus-4-6",
    )
    register_all_tools(llm)

    tts = GTTSTTSService(lang="en", tld="com")

    context = OpenAILLMContext(
        messages=[
            {"role": "system", "content": PET_STORE_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": "Please greet the customer and ask how you can help them and their pet today.",
            },
        ],
        tools=PET_STORE_TOOLS,
    )
    context_aggregator = llm.create_context_aggregator(context)

    pipeline = Pipeline([
        transport.input(),
        stt,
        context_aggregator.user(),
        llm,
        tts,
        transport.output(),
        context_aggregator.assistant(),
    ])

    task = PipelineTask(
        pipeline,
        PipelineParams(allow_interruptions=True),
    )

    # Trigger the opening greeting immediately on startup
    await task.queue_frames([LLMRunFrame()])

    runner = PipelineRunner()
    await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
