import { NextRequest, NextResponse } from 'next/server';
import { runConversationLoop } from '@/lib/conversation/loop';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Missing message or sessionId' },
        { status: 400 }
      );
    }

    const result = await runConversationLoop(message, sessionId);

    return NextResponse.json({
      message: result.message,
      toolCalls: result.toolCalls,
      planId: result.planId,
      sessionId: result.sessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
