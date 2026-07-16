// Mundo do Lorenzo — service worker (modo offline)
// Estratégia: rede primeiro (sempre busca a versão mais nova quando há internet),
// e só usa o que está guardado se o aparelho estiver offline.
const CACHE = 'mdl-v7';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    // Remove caches de versões antigas do app
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  // Nunca cachear chamadas ao Supabase (dados sempre frescos)
  if (u.hostname.endsWith('supabase.co')) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && u.protocol === 'https:') {
          caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(e.request)) // offline → usa o que tiver guardado
  );
});
