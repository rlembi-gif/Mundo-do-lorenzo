// Mundo do Lorenzo — service worker (modo offline)
const CACHE = 'mdl-v6';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // Nunca cachear chamadas ao Supabase (dados sempre frescos)
  if (u.hostname.endsWith('supabase.co')) return;
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request);
      const net = fetch(e.request).then(res => {
        if (res && res.status === 200 && u.protocol === 'https:') cache.put(e.request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
