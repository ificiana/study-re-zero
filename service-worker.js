const CACHE_NAME = "rzs-v1";

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return fetch(event.request.url)
                    .then((fetchedResponse) => {
                        cache.put(event.request, fetchedResponse.clone());
                        return fetchedResponse;
                    })
                    .catch(() => {
                        return cache.match(event.request.url);
                    });
            }),
        );
    } else {
        return;
    }
});
