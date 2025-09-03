
// /kiosk/sw.js (교체본)
const CACHE = 'ai-kiosk-v2';
const LOCAL_ASSETS = [
  '/kiosk/',
  '/kiosk/index.html',
  '/kiosk/manifest.json',
  '/kiosk/index-CSGA77Bk.js',
  '/kiosk/index-BzEULWtA.css',
  '/kiosk/icon-192.png',
  '/kiosk/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(LOCAL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === location.origin && url.pathname.startsWith('/kiosk/');

  if (isLocal) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetched = fetch(event.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
          return resp;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return resp;
      }).catch(() => caches.match(event.request))
    );
  }
});
