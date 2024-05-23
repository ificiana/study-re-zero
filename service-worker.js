const VERSION = 1;
const CACHE_NAME = `rzs-v${VERSION}`;
const urlsToCache = ["index.html", "studied.html", "script.js", "words.min.js"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        }),
    );
});
