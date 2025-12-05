// public/service-worker.js

// Nombre del "cache" (a futuro, para caching offline)
const CACHE_NAME = 'wine-pick-qr-v1';

// Por ahora no cacheamos nada, pero dejamos el esqueleto listo.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalado');
  // A futuro se puede hacer:
  // event.waitUntil(
  //   caches.open(CACHE_NAME).then((cache) => {
  //     return cache.addAll([
  //       './',
  //       './index.php',
  //       './css/styles.css',
  //       './js/app.js',
  //       './js/router.js',
  //       // etc...
  //     ]);
  //   })
  // );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activado');
  // Limpieza de caches antiguos si hiciera falta.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // De momento, dejamos pasar todas las requests (sin cache).
  // A futuro: responder desde cache o hacer estrategias offline.
  // console.log('[Service Worker] Fetch:', event.request.url);
});
