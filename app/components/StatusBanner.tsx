'use client';

import UntilTime from './UntilTime';

type Props = {
  message: string;
  tone?: 'info' | 'success' | 'warning';
  untilISO?: string; // ISO string from the server (or undefined)
};

export default function StatusBanner({ message, tone = 'info', untilISO }: Props) {
  const border =
    tone === 'success'
      ? 'var(--success, #39D98A)'
      : tone === 'warning'
      ? 'var(--warning, #F7B955)'
      : 'var(--card-border, rgba(255,255,255,.12))';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 12,
        border: `1px solid ${border}`,
        background: 'var(--card-bg, rgba(255,255,255,.04))',
        margin: '12px 0 20px',
        boxShadow: '0 10px 24px rgba(0,0,0,.18)',
      }}
    >
      <span style={{ fontWeight: 600 }}>{message}</span>

      {untilISO ? (
        <small
          style={{ marginLeft: 'auto', opacity: 0.7 }}
          // allow text to differ between SSR and client; client value is authoritative
          suppressHydrationWarning
        >
          until <UntilTime iso={untilISO} />
        </small>
      ) : null}
    </div>
  );
}
