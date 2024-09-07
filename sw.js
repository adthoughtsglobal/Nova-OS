const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'https://fonts.gstatic.com/s/materialicons/v55/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  'https://fonts.gstatic.com/s/materialsymbolsrounded/v40/q5uGsIx7OiYB2gC28_obelqYtdKCRBhM-LWaFTGn6kcR.woff2',
  'https://cdn.jsdelivr.net/npm/mime-db@1.52.0/db.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap',
  '/system32.js',
  '/style.css',
  '/N.webp',
  '/nova.css',
  'https://code.jquery.com/jquery-3.6.4.min.js',
  '/scripts/edgecases.js',
  '/scripts/scripties.js',
  '/script.js',
  '/scripts/LZ-utf8.js',
  '/scripts/kernel.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache)
            .catch((error) => {
              console.error('Failed to cache some resources:', error);
              return Promise.all(urlsToCache.map(url => {
                return cache.add(url).catch(err => console.error('Failed to cache', url, err));
              }));
            });
        })
    );
  });
  

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If there is a cached response, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request)
          .then((response) => {
            // Check if we got a valid response.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to ensure it's usable multiple times.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});