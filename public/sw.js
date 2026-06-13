const CACHE_NAME = "along-v2";
const STATIC_CACHE_NAME = "along-static-v2";
const DYNAMIC_CACHE_NAME = "along-dynamic-v2";
const API_CACHE_NAME = "along-api-v2";

// Files to cache on install
const STATIC_ASSETS = [
  "/",
  "/home",
  "/explore",
  "/bookmarks",
  "/notifications",
  "/profile",
  "/marketplace",
  "/manifest.json",
  "/offline.html",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        // Use addAll with error handling
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.error("[Service Worker] Failed to cache some assets:", error);
          // Cache individual assets that succeed
          return Promise.allSettled(
            STATIC_ASSETS.map((url) =>
              cache.add(url).catch((err) => {
                console.warn(`[Service Worker] Failed to cache ${url}:`, err);
              })
            )
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Helper function to create offline response
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: "Offline",
      message:
        "You are currently offline. This content is not available in cache.",
      offline: true,
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 503,
    }
  );
}

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip chrome extension requests
  if (url.protocol === "chrome-extension:") {
    return;
  }

  // Handle API requests (network-first strategy with better error handling)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful GET responses
          if (response && response.status === 200 && request.method === "GET") {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((error) => {
                console.warn(
                  "[Service Worker] Failed to cache API response:",
                  error
                );
              });
            });
          }
          return response;
        })
        .catch((error) => {
          console.log(
            "[Service Worker] API fetch failed, trying cache:",
            error.message
          );
          // Return cached version if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("[Service Worker] Serving API from cache");
              return cachedResponse;
            }
            // Return offline response
            return createOfflineResponse();
          });
        })
    );
    return;
  }

  // Handle static assets (cache-first strategy)
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "manifest"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            // Only cache successful GET responses
            if (response && response.status === 200 && request.method === "GET") {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, responseClone).catch((error) => {
                  console.warn(
                    "[Service Worker] Failed to cache static asset:",
                    error
                  );
                });
              });
            }
            return response;
          })
          .catch((error) => {
            console.log(
              "[Service Worker] Static asset fetch failed:",
              error.message
            );
            // Return a fallback for images
            if (request.destination === "image") {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
                { headers: { "Content-Type": "image/svg+xml" } }
              );
            }
            return new Response("Offline", { status: 503 });
          });
      })
    );
    return;
  }

  // Handle pages (stale-while-revalidate strategy with better error handling)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          // Only cache successful GET responses
          if (response && response.status === 200 && request.method === "GET") {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((error) => {
                console.warn("[Service Worker] Failed to cache page:", error);
              });
            });
          }
          return response;
        })
        .catch((error) => {
          console.log("[Service Worker] Page fetch failed:", error.message);
          // Return offline page if navigation fails and no cache
          if (request.mode === "navigate" && !cachedResponse) {
            return caches.match("/offline.html").then((offlinePage) => {
              return (
                offlinePage || new Response("You are offline", { status: 503 })
              );
            });
          }
          return new Response("Offline", { status: 503 });
        });

      // Return cached version immediately if available, update cache in background
      return cachedResponse || fetchPromise;
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event);

  let notificationData = {
    title: "Along",
    body: "You have a new notification",
    icon: "/assets/icons/icon-192x192.png",
    badge: "/assets/icons/icon-72x72.png",
    data: {
      url: "/notifications",
    },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: notificationData.badge,
        data: {
          url: data.url || notificationData.data.url,
        },
      };
    } catch (e) {
      console.error("[Service Worker] Error parsing push data:", e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      tag: "along-notification",
      requireInteraction: false,
    })
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (for future offline post queue)
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-posts") {
    event.waitUntil(
      // Implement background sync logic here
      Promise.resolve()
    );
  }
});
