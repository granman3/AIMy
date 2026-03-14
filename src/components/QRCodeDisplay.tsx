'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  planUrl: string;
}

export default function QRCodeDisplay({ planUrl }: QRCodeDisplayProps) {
  const [artisticQR, setArtisticQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateArtisticQR = async () => {
      try {
        const res = await fetch('/api/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: planUrl }),
        });
        const data = await res.json();
        if (data.success && data.image) setArtisticQR(data.image);
      } catch {
        // standard QR stays
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => setLoading(false), 30000);
    generateArtisticQR();
    return () => clearTimeout(timeout);
  }, [planUrl]);

  return (
    <div className="qr-card p-6 flex flex-col items-center gap-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Your plan is ready
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Scan with your phone to take it with you
        </p>
      </div>

      <div className="bg-white p-4 rounded" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
        {artisticQR ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artisticQR} alt="QR Code to shopping plan" className="w-52 h-52 object-contain" />
        ) : (
          <QRCode value={planUrl} size={208} level="M" />
        )}
      </div>

      {loading && !artisticQR && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          <div
            className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
          Generating QR...
        </div>
      )}

      <a
        href={planUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline"
        style={{ color: 'var(--primary)' }}
      >
        Or tap here to open your plan
      </a>
    </div>
  );
}
