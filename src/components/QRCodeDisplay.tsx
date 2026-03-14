'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

interface QRCodeDisplayProps {
  planUrl: string;
}

export default function QRCodeDisplay({ planUrl }: QRCodeDisplayProps) {
  const [artisticQR, setArtisticQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setVisible(true), 50);

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
        // Standard QR stays
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => setLoading(false), 30000);
    generateArtisticQR();

    return () => {
      clearTimeout(timeout);
      clearTimeout(timer);
    };
  }, [planUrl]);

  return (
    <div
      className={`flex flex-col items-center gap-4 p-6 bg-gradient-to-b from-purple-900/30 to-gray-800/50 rounded-2xl border border-purple-500/30 transition-all duration-700 ${
        visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}
    >
      {/* Celebration header */}
      <div className="text-center">
        <p className="text-3xl mb-2">🎉</p>
        <h3 className="text-xl font-bold text-white">Your Shopping Plan is Ready!</h3>
        <p className="text-base text-gray-300 mt-1">
          Scan with your phone to take it with you
        </p>
      </div>

      {/* QR code — always scannable */}
      <div className={`bg-white p-5 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-500 ${
        visible ? 'scale-100' : 'scale-90'
      }`}>
        {artisticQR ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisticQR}
            alt="QR Code to shopping plan"
            className="w-56 h-56 object-contain"
          />
        ) : (
          <QRCode value={planUrl} size={224} level="M" />
        )}
      </div>

      {/* Non-blocking status text */}
      {loading && !artisticQR && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />
          Generating artistic QR...
        </div>
      )}

      <a
        href={planUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-purple-400 hover:text-purple-300 active:text-purple-200 underline"
      >
        Or tap here to open your plan
      </a>
    </div>
  );
}
