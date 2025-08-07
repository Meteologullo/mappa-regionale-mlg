/* SW – cache “add-only”, nessuna modifica al codice originale */
const VERSION = 'mlg-sw-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

// domini “statici” tipici (aggiungi se ne hai altri)
const STATIC_HOSTS = new Set([
  self.location.host,            // questo sito (GitHub Pages del repo)
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'tile.openstreetmap.org',
]);

self.addEventListener('install', (evt) => {
  // niente precache aggressivo: la pagina originale è dinamica
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => !k.startsWith(VERSION))
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* helper: cache-first */
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) {
    // aggiorna in background
    fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
    }).catch(()=>{});
    return hit;
  }
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

/* helper: network-first con fallback al cache */
async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req, { ignoreVary: true });
    if (hit) return hit;
    throw e;
  }
}

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);

  // Solo GET
  if (evt.request.method !== 'GET') return;

  // Per l’HTML del sito (incluso /src/mlgmap.html): cache-first
  if (url.origin === location.origin && url.pathname.endsWith('.html')) {
    evt.respondWith(cacheFirst(evt.request, STATIC_CACHE));
    return;
  }

  // Risorse statiche note (leaflet, css/js cdn, tiles): cache-first
  if (STATIC_HOSTS.has(url.host)) {
    evt.respondWith(cacheFirst(evt.request, STATIC_CACHE));
    return;
  }

  // Tutto il resto (API, json dinamici): network-first con fallback
  evt.respondWith(networkFirst(evt.request, RUNTIME_CACHE));
});
