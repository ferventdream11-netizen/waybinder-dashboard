'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type Props = {
  code: string;
  hint?: string;
};

export default function PinGate({ code, hint }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [token, setToken] = useState(sp.get('token') ?? '');
  const [pin, setPin] = useState(sp.get('pin') ?? '');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qp = new URLSearchParams();
    if (token) qp.set('token', token);
    if (pin) qp.set('pin', pin);
    router.push(`/g/${encodeURIComponent(code)}?${qp.toString()}`);
  };

  return (
    <div className="card" style={{ maxWidth: 460 }}>
      <h2>Enter access details</h2>
      {hint ? <p style={{ opacity: 0.8, marginTop: 4 }}>{hint}</p> : null}
      <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Token</div>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="wb-input"
            placeholder="e.g. abc"
          />
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>PIN</div>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="wb-input"
            placeholder="e.g. 1234"
            type="password"
          />
        </label>
        <button className="wb-button" type="submit">Unlock</button>
      </form>
      <style jsx>{`
        .wb-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          color: var(--fg);
        }
        .wb-button {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid var(--card-border);
          background: var(--brand);
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
