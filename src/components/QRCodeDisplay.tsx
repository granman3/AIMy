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
        if (data.success && data.image) {
          setArtisticQR(data.image);
        }
      } catch {
        // Artistic QR failed, standard QR stays
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => setLoading(false), 30000);
    generateArtisticQR();

    return () => clearTimeout(timeout);
  }, [planUrl]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
      <h3 className="text-lg font-semibold text-white">Your Shopping Plan is Ready!</h3>
      <p className="text-sm text-gray-400 text-center">
        Scan with your phone to take your plan with you
      </p>

      {/* QR code — always scannable, no overlay */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        {artisticQR ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisticQR}
            alt="QR Code to shopping plan"
            className="w-48 h-48 object-contain"
          />
        ) : (
          <QRCode value={planUrl} size={192} level="M" />
        )}
      </div>

      {/* Non-blocking status text below the QR */}
      {loading && !artisticQR && (
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />
          Generating artistic QR...
        </div>
      )}

      <a
        href={planUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-purple-400 hover:text-purple-300 underline"
      >
        Or click here to open your plan
      </a>
    </div>
  );
}
