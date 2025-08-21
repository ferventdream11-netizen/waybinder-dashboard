'use client';

import { useCallback } from 'react';

export default function PdfExport({ code }: { code: string }) {
  const handleClick = useCallback(() => {
    const guest = window.prompt('Guest name for the watermark (e.g., Alex Chen)') || '';
    const checkout = window.prompt('Checkout date (YYYY-MM-DD)') || '';
    const qp = new URLSearchParams();
    if (guest) qp.set('guest', guest);
    if (checkout) qp.set('checkout', checkout);
    const href = `/api/pdf/${encodeURIComponent(code)}?${qp.toString()}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  }, [code]);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0 4px' }}>
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
        Download PDF
      </button>
    </div>
  );
}
