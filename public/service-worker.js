// public/service-worker.js

// Nombre del "cache" (a futuro, para caching offline)
const CACHE_NAME = 'wine-pick-qr-v1';

// Por ahora no cacheamos nada, pero dejamos el esqueleto listo.
self.addEventListener('install', (event) => {
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
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
});
