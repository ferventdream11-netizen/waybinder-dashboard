'use client';

import { useMemo } from 'react';

type Tone = 'info' | 'success' | 'warning';

export default function StatusBanner({
  message,
  tone = 'info',
  untilISO,
}: {
  message: string;
  tone?: Tone;
  /** If set, banner hides itself after this UTC time */
  untilISO?: string;
}) {
  const expired = useMemo(() => {
    if (!untilISO) return false;
    const t = Date.parse(untilISO);
    return Number.isFinite(t) ? Date.now() > t : false;
  }, [untilISO]);

  if (expired) return null;

  const colors: Record<Tone, { stripe: string; text: string; bg: string; border: string }> = {
    info:    { stripe: 'var(--sky)',   text: 'var(--fg)', bg: 'var(--card-bg)', border: 'var(--card-border)' },
    success: { stripe: 'var(--mint)',  text: 'var(--fg)', bg: 'var(--card-bg)', border: 'var(--card-border)' },
    warning: { stripe: '#F4D24B',      text: 'var(--fg)', bg: 'var(--card-bg)', border: 'var(--card-border)' },
  };

  const c = colors[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        border: `1px solid ${c.border}`,
        background: c.bg,
        borderRadius: 12,
        boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
        margin: '16px 0 20px',
      }}
    >
      <div style={{ width: 6, alignSelf: 'stretch', borderRadius: 6, background: c.stripe }} />
      <div style={{ color: c.text }}>{message}</div>
      {untilISO ? (
        <div style={{ marginLeft: 'auto', opacity: 0.7, fontSize: 12 }}>
          until {new Date(untilISO).toLocaleString()}
        </div>
      ) : null}
    </div>
  );
}
