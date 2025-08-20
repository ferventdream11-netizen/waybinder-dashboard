'use client';

import { useEffect, useState } from 'react';

export default function OfflineBadge() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const label = online ? 'Offline-ready (demo)' : 'Offline mode';

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        aria-live="polite"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 999,
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
          fontSize: 12,
          opacity: online ? 0.95 : 1,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 8,
            background: online ? 'var(--mint)' : '#F04D4D',
          }}
        />
        <span>{label}</span>
      </div>
    </div>
  );
}
