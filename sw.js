const staticCacheName = 'restaurant-1';
const resourcesToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'css/styles.min.css',
  'js/idb.js',
  'js/dbhelper.js',
  'js/restaurant_info.js',
  'js/main.js',
  'sw.js',
  'img/1.jpg',
  'img/1_small.jpg',
  'img/1_medium.jpg',
  'img/1_large.jpg',
  'img/2.jpg',
  'img/2_small.jpg',
  'img/2_medium.jpg',
  'img/2_large.jpg',
  'img/3.jpg',
  'img/3_small.jpg',
  'img/3_medium.jpg',
  'img/3_large.jpg',
  'img/4.jpg',
  'img/4_small.jpg',
  'img/4_medium.jpg',
  'img/4_large.jpg',
  'img/5.jpg',
  'img/5_small.jpg',
  'img/5_medium.jpg',
  'img/5_large.jpg',
  'img/6.jpg',
  'img/6_small.jpg',
  'img/6_medium.jpg',
  'img/6_large.jpg',
  'img/7.jpg',
  'img/7_small.jpg',
  'img/7_medium.jpg',
  'img/7_large.jpg',
  'img/8.jpg',
  'img/8_small.jpg',
  'img/8_medium.jpg',
  'img/8_large.jpg',
  'img/9.jpg',
  'img/9_small.jpg',
  'img/9_medium.jpg',
  'img/9_large.jpg',
  'img/10.jpg',
  'img/10_small.jpg',
  'img/10_medium.jpg',
  'img/10_large.jpg',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll(resourcesToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('restaurant-') && cacheName !== staticCacheName;
        }).map(cacheName => {
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});
/*
* checks for a request in cache, return response if found
* or save it for later use
*/
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request).then(res => {
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request, res.clone());
          return res;
        })
      });
    })
  );
});
