/* Waybinder SW: 7-day offline pack (same-origin GET requests) */
const CACHE_NAME = 'wb-offline-v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('wb-offline-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
  })());
});

/** Put a response with a timestamp so we can enforce TTL */
async function putWithStamp(cache, req, res) {
  const body = await res.clone().arrayBuffer();
  const stamped = new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
  stamped.headers.append('X-SW-Cached-At', Date.now().toString());
  await cache.put(req, stamped);
}

/** Handle a message from the page to pre-cache a given URL */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'PRECACHE_URL') return;
  const url = data.url;
  if (!url) return;

  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      const req = new Request(url, { method: 'GET', credentials: 'same-origin' });
      const res = await fetch(req);
      await putWithStamp(cache, req, res);
    } catch {
      // ignore
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only manage same-origin GETs
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (req.mode === 'navigate') {
      try {
        const net = await fetch(req);
        putWithStamp(cache, req, net.clone()).catch(() => {});
        return net;
      } catch {
        const cached = await cache.match(req);
        if (cached) return cached;
        return new Response(
          `<!doctype html><meta charset="utf-8"><title>Offline</title>
           <style>body{font:16px system-ui;margin:2rem;color:#222} .pill{display:inline-block;padding:.35rem .6rem;border:1px solid #ccc;border-radius:999px}</style>
           <h1>Offline</h1>
           <p>This page is cached and will work again when you're back online.</p>
           <p class="pill">Waybinder – Offline mode</p>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    }

    // SWR with TTL for other GETs
    const cached = await cache.match(req);
    if (cached) {
      const stamp = Number(cached.headers.get('X-SW-Cached-At') || '0');
      const freshEnough = stamp && (Date.now() - stamp) < TTL_MS;

      fetch(req)
        .then((net) => putWithStamp(cache, req, net))
        .catch(() => {});

      if (freshEnough) return cached;
      try {
        const net = await fetch(req);
        await putWithStamp(cache, req, net.clone());
        return net;
      } catch {
        return cached;
      }
    } else {
      try {
        const net = await fetch(req);
        await putWithStamp(cache, req, net.clone());
        return net;
      } catch {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    }
  })());
});
