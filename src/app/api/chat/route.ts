import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '@/lib/claude';
import { toolDefinitions } from '@/lib/tools/definitions';
import { executeTool } from '@/lib/tools/executor';
import { getOrCreateSession, addMessage, setPlan } from '@/lib/sessions';
import { ToolCallInfo } from '@/lib/types';

const anthropic = new Anthropic();

const MAX_ITERATIONS = 10;

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing message or sessionId' }, { status: 400 });
    }

    const session = getOrCreateSession(sessionId);

    // Add user message
    addMessage(sessionId, {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = session.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let iterations = 0;
    let finalText = '';
    const allToolCalls: ToolCallInfo[] = [];
    let planId: string | undefined;

    // Agentic loop: keep calling Claude until it responds with just text (no tool calls)
    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: toolDefinitions,
        messages,
      });

      // Collect text and tool use blocks
      const textBlocks: string[] = [];
      const toolUseBlocks: Anthropic.ContentBlock[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          textBlocks.push(block.text);
        } else if (block.type === 'tool_use') {
          toolUseBlocks.push(block);
        }
      }

      if (textBlocks.length > 0) {
        finalText += textBlocks.join('\n');
      }

      // If no tool calls, we're done
      if (toolUseBlocks.length === 0) {
        break;
      }

      // Execute tool calls
      // Add assistant message with all content blocks
      messages.push({
        role: 'assistant',
        content: response.content,
      });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        if (block.type !== 'tool_use') continue;

        const toolResult = executeTool(
          block.name,
          block.input as Record<string, unknown>,
          sessionId
        );

        allToolCalls.push({
          tool: block.name,
          input: block.input as Record<string, unknown>,
          result: toolResult.result,
        });

        // If this tool call generated a plan, save it
        if (toolResult.plan) {
          setPlan(sessionId, toolResult.plan);
          planId = toolResult.plan.id;
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(toolResult.result),
        });
      }

      // Add tool results to messages
      messages.push({
        role: 'user',
        content: toolResults,
      });

      // If stop reason is end_turn AND we had tool calls, do one more loop for final text
      if (response.stop_reason === 'end_turn') {
        continue;
      }
    }

    // Save assistant message
    addMessage(sessionId, {
      role: 'assistant',
      content: finalText,
      toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: finalText,
      toolCalls: allToolCalls,
      planId,
      sessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
