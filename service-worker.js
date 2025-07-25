const CACHE_NAME = 'my-cache-v1';
const RESOURCES = [
  '/index.html',
  '/styles.css',
  '/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(RESOURCES);
      console.log('Erőforrások cache-elve');
    } catch (err) {
      console.error('Cache addAll hiba:', err);
    }
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return fetch(event.request);
  })());
});
