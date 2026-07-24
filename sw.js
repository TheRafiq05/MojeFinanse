const CACHE_NAME = 'rentney-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  // Otwieramy cache i dodajemy do niego podstawowe pliki (App Shell)
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Zapisywanie plików w cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[ServiceWorker] Usuwanie starego cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignorowanie zapytań do zewnętrznych API, jeśli dodasz takie w przyszłości
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jeśli plik jest w cache, zwróć go
        if (response) {
          return response;
        }
        // Jeśli nie, pobierz z sieci
        return fetch(event.request).then(
          function(response) {
            // Sprawdź, czy odpowiedź jest prawidłowa
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klonujemy odpowiedź, ponieważ request/response to strumienie (stream)
            // i można je odczytać tylko raz. Jedna kopia leci do przeglądarki, druga do cache'u.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Niekeszuj zasobów z zewnętrznych CDN w sposób wymuszony, 
                // ale jeśli chcesz aplikację całkowicie offline, możesz odkomentować poniższą linię.
                // cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }).catch(() => {
        // Co zrobić gdy nie ma neta i pliku w cache (np. powrót do index.html)
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
      })
  );
});
