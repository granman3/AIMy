import { NextRequest, NextResponse } from 'next/server';
import { executeConversationTool } from '@/lib/conversation/executor';
import { setPlan } from '@/lib/sessions';

const VALID_TOOLS = ['find_items', 'add_item', 'remove_item', 'generate_plan'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  try {
    const { tool } = await params;

    if (!VALID_TOOLS.includes(tool)) {
      return NextResponse.json(
        { error: `Unknown tool: ${tool}` },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { sessionId, ...toolInput } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    const toolResult = executeConversationTool(tool, toolInput, sessionId);

    if (toolResult.plan) {
      setPlan(sessionId, toolResult.plan);
    }

    return NextResponse.json(toolResult.result);
  } catch (error) {
    console.error('Tool API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute tool' },
      { status: 500 }
    );
  }
}
