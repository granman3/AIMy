import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './prompt';
import { conversationTools } from './tools';
import { executeConversationTool, ToolResult } from './executor';
import { getShoppingList, setPetContext } from './state';
import { getOrCreateSession, addMessage, setPlan } from '../sessions';
import { ToolCallInfo } from '../types';

const anthropic = new Anthropic();
const MAX_ITERATIONS = 10;

interface ConversationResult {
  message: string;
  toolCalls: ToolCallInfo[];
  planId?: string;
  sessionId: string;
}

export async function runConversationLoop(
  userMessage: string,
  sessionId: string
): Promise<ConversationResult> {
  const session = getOrCreateSession(sessionId);

  // Add user message
  addMessage(sessionId, {
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  });

  // Extract pet context from conversation (case-insensitive)
  extractPetContext(userMessage, sessionId);

  // Build messages for Claude
  const messages: Anthropic.MessageParam[] = session.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let iterations = 0;
  let finalText = '';
  const allToolCalls: ToolCallInfo[] = [];
  let planId: string | undefined;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Rebuild system prompt each iteration with current shopping list state
    const shoppingList = getShoppingList(sessionId);
    const systemPrompt = buildSystemPrompt(shoppingList);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools: conversationTools,
      messages,
    });

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

    // No tool calls means we're done
    if (toolUseBlocks.length === 0) {
      break;
    }

    // Add assistant message with all content blocks
    messages.push({
      role: 'assistant',
      content: response.content,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      if (block.type !== 'tool_use') continue;

      const toolResult: ToolResult = executeConversationTool(
        block.name,
        block.input as Record<string, unknown>,
        sessionId
      );

      allToolCalls.push({
        tool: block.name,
        input: block.input as Record<string, unknown>,
        result: toolResult.result,
      });

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

    messages.push({
      role: 'user',
      content: toolResults,
    });

    // Tool results have been fed back; let Claude process them in the next
    // iteration regardless of stop_reason (Claude sometimes sets end_turn
    // alongside tool_use blocks).
  }

  // Safety net: if we hit the iteration cap without producing a final
  // text response, give the customer something usable instead of silence.
  if (!finalText.trim()) {
    finalText =
      "I've put together what I could! Let me know if you'd like to adjust anything or generate your shopping plan.";
  }

  // Save assistant message
  addMessage(sessionId, {
    role: 'assistant',
    content: finalText,
    toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
    timestamp: new Date().toISOString(),
  });

  return {
    message: finalText,
    toolCalls: allToolCalls,
    planId,
    sessionId,
  };
}

function extractPetContext(message: string, sessionId: string): void {
  const lower = message.toLowerCase();
  const petPatterns = [
    /i (?:just )?got (?:a |an |some )?(.+?)(?:\.|!|$)/i,
    /i have (?:a |an |some )?(.+?)(?:\.|!|$)/i,
    /(?:new |my )(.+?)(?:\.|!|$)/i,
    /setting up (?:a |an )?(?:tank |aquarium )?for (?:a |an |my )?(.+?)(?:\.|!|$)/i,
  ];

  const petKeywords = [
    'goldfish', 'betta', 'fish', 'tropical', 'dog', 'puppy',
    'cat', 'kitten', 'hamster', 'bird', 'parrot',
  ];

  for (const pattern of petPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const context = match[1].trim();
      if (petKeywords.some((kw) => context.includes(kw))) {
        setPetContext(sessionId, context);
        return;
      }
    }
  }

  // Fallback: extract just the pet keyword and its immediate context
  for (const kw of petKeywords) {
    if (lower.includes(kw)) {
      setPetContext(sessionId, kw);
      return;
    }
  }
}
