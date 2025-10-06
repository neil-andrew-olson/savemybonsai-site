// Service Worker for Save My Bonsai
const CACHE_NAME = 'save-my-bonsai-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.svg',
  '/offline.html'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event - Serve from cache, fall back to network
self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          }

          return fetch(event.request).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Cache important resources (but not the offline page)
              var responseToCache = response.clone();
              if (event.request.url.includes('/care-basics/') ||
                  event.request.url.includes('/species/') ||
                  event.request.url.includes('/bonsai/problems/')) {
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(event.request, responseToCache);
                  });
              }

              return response;
            }
          ).catch(function() {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
        })
    );
  }
});

// Update Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
