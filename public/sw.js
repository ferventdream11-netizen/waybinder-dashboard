/* Waybinder SW: 7-day offline pack (same-origin GET requests) */
const CACHE_NAME = 'wb-offline-v1';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

self.addEventListener('install', (event) => {
  // Take control immediately
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME)); // warm cache handle
});

self.addEventListener('activate', (event) => {
  // Claim pages + drop old caches
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only manage same-origin GETs
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // For navigations: network-first, fall back to cache, then tiny offline page
    if (req.mode === 'navigate') {
      try {
        const net = await fetch(req);
        // Cache a fresh copy for offline
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

    // For other same-origin GETs: stale-while-revalidate with 7-day TTL
    const cached = await cache.match(req);
    if (cached) {
      const stamp = Number(cached.headers.get('X-SW-Cached-At') || '0');
      const freshEnough = stamp && (Date.now() - stamp) < TTL_MS;

      // Kick off a background refresh
      fetch(req)
        .then((net) => putWithStamp(cache, req, net))
        .catch(() => {});

      // Serve cached if within TTL; otherwise try network first
      if (freshEnough) return cached;
      try {
        const net = await fetch(req);
        await putWithStamp(cache, req, net.clone());
        return net;
      } catch {
        return cached; // last-resort stale
      }
    } else {
      // No cache yet → fetch and store
      try {
        const net = await fetch(req);
        await putWithStamp(cache, req, net.clone());
        return net;
      } catch {
        // Nothing cached and network failed
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    }
  })());
});
