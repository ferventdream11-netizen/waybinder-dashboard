'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        const sw = reg.active || reg.waiting || reg.installing;
        // When there’s a controller, send the current URL to pre-cache
        const send = () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'PRECACHE_URL',
              url: location.href, // includes token/pin
            });
          }
        };
        // If controller exists now, send immediately; otherwise wait for controlling SW
        if (navigator.serviceWorker.controller) {
          send();
        } else {
          navigator.serviceWorker.addEventListener('controllerchange', () => send(), { once: true });
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
