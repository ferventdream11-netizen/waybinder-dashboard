'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export default function StickerPrint({ code }: { code: string }) {
  const sp = useSearchParams();

  const handleClick = useCallback(() => {
    const qp = new URLSearchParams();

    // pass through current gate params so scans land unlocked
    const token = sp.get('token');
    const pin = sp.get('pin');
    if (token) qp.set('token', token);
    if (pin) qp.set('pin', pin);

    // (optional) later we can prompt for custom labels and add qp.set('labels', 'Washer|Thermostat|Trash')
    const href = `/api/stickers/${encodeURIComponent(code)}?${qp.toString()}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  }, [code, sp]);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 12px' }}>
      <button
        onClick={handleClick}
        className="wb-button"
        style={{
          padding: '8px 14px',
          borderRadius: 999,
          border: '1px solid var(--card-border)',
          background: 'var(--brand)',
          color: 'white',
          fontSize: 12,
          cursor: 'pointer',
          boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
        }}
      >
        Print QR Stickers
      </button>
    </div>
  );
}
