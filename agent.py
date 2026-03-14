import asyncio
import os
from dotenv import load_dotenv

from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.services.anthropic import AnthropicLLMService
from pipecat.transports.local.audio import LocalAudioTransport
from pipecat.audio.vad.silero import SileroVADAnalyzer

load_dotenv()

SYSTEM_PROMPT = """You are AIMy, an intelligent AI management assistant.
You help users coordinate, monitor, and interact with AI workflows.
Be concise, helpful, and proactive."""


async def main():
    transport = LocalAudioTransport(
        LocalAudioTransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            vad_enabled=True,
            vad_analyzer=SileroVADAnalyzer(),
        )
    )

    llm = AnthropicLLMService(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        model="claude-opus-4-6",
    )

    context = OpenAILLMContext(
        messages=[{"role": "system", "content": SYSTEM_PROMPT}]
    )
    context_aggregator = llm.create_context_aggregator(context)

    pipeline = Pipeline(
        [
            transport.input(),
            context_aggregator.user(),
            llm,
            context_aggregator.assistant(),
            transport.output(),
        ]
    )

    task = PipelineTask(
        pipeline,
        PipelineParams(allow_interruptions=True),
    )

    runner = PipelineRunner()
    await runner.run(task)


if __name__ == "__main__":
    asyncio.run(main())
