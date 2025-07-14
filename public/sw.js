/**
 * Coordinates - Service Worker
 * Provides offline functionality and caching for the public website
 * IDX-SW-001: Service worker implementation
 */

const CACHE_NAME = 'coordinates-v1.0.0';
const STATIC_CACHE = 'coordinates-static-v1.0.0';
const DYNAMIC_CACHE = 'coordinates-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/css/main.css',
    '/css/game-launcher.css',
    '/js/main.js',
    '/js/game-launcher.js',
    '/assets/favicon.ico',
    '/assets/apple-touch-icon.png',
    '/robots.txt',
    '/sitemap.xml'
];

// API endpoints to cache
const API_CACHE = [
    '/api/status',
    '/api/players',
    '/api/servers'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Caching static files...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Cache installation failed:', error);
            })
    );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Remove old caches
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== CACHE_NAME) {
                            console.log('🗑️ Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Handle different types of requests
    if (isStaticFile(url.pathname)) {
        event.respondWith(handleStaticFile(request));
    } else if (isAPIRequest(url.pathname)) {
        event.respondWith(handleAPIRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// ===== REQUEST HANDLERS =====
function handleStaticFile(request) {
    return caches.match(request)
        .then((response) => {
            if (response) {
                return response;
            }
            
            return fetch(request)
                .then((response) => {
                    // Cache successful responses
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(STATIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Return offline page for navigation requests
                    if (request.destination === 'document') {
                        return caches.match('/offline.html');
                    }
                });
        });
}

function handleAPIRequest(request) {
    return fetch(request)
        .then((response) => {
            // Cache successful API responses
            if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                        cache.put(request, responseClone);
                    });
            }
            return response;
        })
        .catch(() => {
            // Return cached API response if available
            return caches.match(request);
        });
}

function handleDynamicRequest(request) {
    return fetch(request)
        .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                        cache.put(request, responseClone);
                    });
            }
            return response;
        })
        .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
                return caches.match('/offline.html');
            }
        });
}

// ===== UTILITY FUNCTIONS =====
function isStaticFile(pathname) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => pathname.endsWith(ext)) || 
           STATIC_FILES.includes(pathname) ||
           pathname === '/';
}

function isAPIRequest(pathname) {
    return pathname.startsWith('/api/') || API_CACHE.includes(pathname);
}

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(performBackgroundSync());
    }
});

function performBackgroundSync() {
    // Perform background tasks like updating game data
    return fetch('/api/background-sync')
        .then((response) => {
            if (response.ok) {
                console.log('✅ Background sync completed');
            }
        })
        .catch((error) => {
            console.error('❌ Background sync failed:', error);
        });
}

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/notification-icon.png',
        badge: '/assets/badge-icon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Game',
                icon: '/assets/action-icon.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/close-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Coordinates', options)
    );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/game/')
        );
    }
});

// ===== MESSAGE HANDLING =====
self.addEventListener('message', (event) => {
    console.log('💬 Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATED') {
        // Handle cache update notifications
        console.log('📦 Cache updated:', event.data.cacheName);
    }
});

// ===== ERROR HANDLING =====
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker unhandled rejection:', event.reason);
});

// ===== CACHE CLEANUP =====
function cleanupOldCaches() {
    return caches.keys()
        .then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && 
                        cacheName !== DYNAMIC_CACHE && 
                        cacheName !== CACHE_NAME) {
                        console.log('🧹 Cleaning up old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        });
}

// ===== PERIODIC CLEANUP =====
setInterval(() => {
    cleanupOldCaches();
}, 24 * 60 * 60 * 1000); // Clean up every 24 hours 