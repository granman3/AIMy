import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Try to generate artistic QR via HuggingFace Gradio
    try {
      const { Client } = await import('@gradio/client');
      const client = await Client.connect('Oysiyl/AI-QR-code-generator');

      // Discover available endpoints — the Space may use different names
      const endpoints = client.view_api ? await client.view_api() : null;
      const namedEndpoints = endpoints?.named_endpoints
        ? Object.keys(endpoints.named_endpoints)
        : [];

      // Find a plausible endpoint name
      const endpoint =
        namedEndpoints.find(e => e.includes('generate') || e.includes('qr') || e.includes('predict')) ??
        namedEndpoints[0];

      if (!endpoint) {
        return NextResponse.json({ success: false, error: 'No endpoints available on Space' });
      }

      const result = await client.predict(endpoint, {
        url: url,
        prompt: 'cute pet store with paw prints, colorful, friendly, cartoon style',
        negative_prompt: 'ugly, blurry, low quality',
        guidance_scale: 10,
        controlnet_conditioning_scale: 1.5,
        seed: -1,
        num_inference_steps: 30,
      });

      const data = result.data as Array<{ url?: string; path?: string }>;
      if (data && data[0]) {
        const imageUrl = data[0].url || data[0].path;
        if (imageUrl) {
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(imageBuffer).toString('base64');
          return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${base64}`,
          });
        }
      }

      return NextResponse.json({ success: false, error: 'No image generated' });
    } catch (gradioError) {
      // Gracefully fall back — artistic QR is a stretch goal
      console.warn('Artistic QR unavailable:', (gradioError as Error).message);
      return NextResponse.json({
        success: false,
        error: 'Artistic QR generation unavailable',
      });
    }
  } catch (error) {
    console.error('QR API error:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
