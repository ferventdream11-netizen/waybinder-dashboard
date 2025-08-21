'use client';

import { useEffect } from 'react';

export default function AnalyticsPing({ code }: { code: string }) {
  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      keepalive: true,            // lets it finish even on tab close
      signal: controller.signal,
    }).catch(() => { /* ignore */ });

    return () => controller.abort();
  }, [code]);

  return null;
}
