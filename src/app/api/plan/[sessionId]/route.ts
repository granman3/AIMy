import { NextRequest, NextResponse } from 'next/server';
import { getPlan } from '@/lib/sessions';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const plan = getPlan(sessionId);

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  return NextResponse.json(plan);
}
