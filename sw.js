const CACHE_NAME = 'cube-timer-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/styles.css',
  './src/timer-engine.js',
  './src/scramble-service.js',
  './src/scramble-queue.js',
  './src/session-store.js',
  './src/persistence.js',
  './src/post-solve-insights.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
