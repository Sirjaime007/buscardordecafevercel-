const CACHE_NAME = 'cafe-v6'; // Subimos la versión para aplicar los cambios limpios

// Agregamos los recursos visuales básicos para que la app no se vea rota offline
const assets = [
  './',
  './index.html',
  './manifest.json',
  'https://i.postimg.cc/yxbDGB7P/COFITECA-LOGO-02.png',
  'https://i.postimg.cc/6qm8PwBc/COFITECA-FONDO.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Fuerza al navegador a usar esta nueva versión inmediatamente
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});

// NUEVO: Limpiamos las versiones viejas del caché para no ocupar memoria inútil
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Borra cafe-v5, cafe-v4, etc.
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de la página inmediatamente
});

self.addEventListener('fetch', e => {
  // Si la petición es un POST (como Supabase o emails), el Service Worker no se mete
  if (e.request.method !== 'GET') return;

  // Red primero; si falla (por estar offline), busca en el caché
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
