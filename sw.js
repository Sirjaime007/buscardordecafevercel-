const CACHE_NAME = 'cafe-v5';
const assets = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting(); // Fuerza al navegador a usar esta nueva versión inmediatamente
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});

self.addEventListener('fetch', e => {
  // CLAVE: Si la petición es un POST (como enviar un email), el Service Worker no se mete
  if (e.request.method !== 'GET') return;

  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
