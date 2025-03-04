const CACHE_NAME = 'college-management-v1';
const STATIC_ASSETS = [
    '/college-management/',
    '/college-management/index.html',
    '/college-management/login.html',
    '/college-management/register.html',
    '/college-management/assets/css/main.css',
    '/college-management/assets/css/login.css',
    '/college-management/assets/js/firebase-config.js',
    '/college-management/assets/js/router.js',
    '/college-management/assets/js/pages/auth.js',
    '/college-management/assets/js/pages/dashboard.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes vers Firebase
    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('www.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retourner la réponse du cache si elle existe
                if (response) {
                    return response;
                }

                // Cloner la requête
                const fetchRequest = event.request.clone();

                // Faire la requête réseau
                return fetch(fetchRequest)
                    .then(response => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse
                        const responseToCache = response.clone();

                        // Mettre en cache la nouvelle ressource
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Retourner une page d'erreur personnalisée si hors ligne
                        if (event.request.mode === 'navigate') {
                            return caches.match('/college-management/offline.html');
                        }
                    });
            })
    );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/college-management/assets/img/icon.png',
            badge: '/college-management/assets/img/badge.png'
        };

        event.waitUntil(
            self.registration.showNotification('College Management', options)
        );
    }
});
