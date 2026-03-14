import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Artistic QR via HuggingFace is a stretch goal.
    // The standard QR code (react-qr-code) renders instantly on the client.
    // This endpoint is a placeholder for when the Space API is properly configured.
    return NextResponse.json({
      success: false,
      error: 'Artistic QR not configured — using standard QR',
    });
  } catch (error) {
    console.error('QR API error:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
