// KILL SWITCH — this service worker unregisters itself and clears all
// caches on activation, then reloads every open client. After it runs
// once, there is no service worker and every load comes fresh from the
// network. index.html no longer registers an SW, so nothing re-installs.
//
// NOTE: localStorage is untouched. Journal entries are safe.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Wipe every cache this origin owns
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));

    // Take control of any open pages
    await self.clients.claim();

    // Unregister self
    await self.registration.unregister();

    // Force a hard reload of every open client so they pick up fresh HTML
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((client) => {
      try { client.navigate(client.url); } catch (_) {}
    });
  })());
});

// Passthrough fetch — never intercept, never cache
self.addEventListener('fetch', (e) => {
  // Let the browser handle everything normally
});
