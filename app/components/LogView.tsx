'use client';

import { useEffect } from 'react';

export default function LogView({ code }: { code: string }) {
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: controller.signal,
      // We purposely don’t send anything else: no IP, no UA, no cookies
    }).catch(() => {});
    return () => controller.abort();
  }, [code]);

  return null;
}
