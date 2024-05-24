const CACHE_NAME = "rzs-v1";

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    const cacheFirst = url.searchParams.has("cache");

    if (event.request.mode === "navigate") {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const clonedURL = new URL(url.toString());
                if (cacheFirst) {
                    clonedURL.searchParams.delete("cache");
                }
                const cachedResponse = await cache.match(clonedURL);

                if (cachedResponse) {
                    console.log("hit cache", url);
                    return cachedResponse;
                } else {
                    try {
                        const fetchedResponse = await fetch(event.request);
                        cache.put(clonedURL, fetchedResponse.clone());
                        return fetchedResponse;
                    } catch {
                        return cache.match(clonedURL);
                    }
                }
            }),
        );
    } else {
        return;
    }
});

async function fetchAndCache(request, cache) {
    try {
        const fetchedResponse = await fetch(request.url);
        cache.put(request, fetchedResponse.clone());
        return fetchedResponse;
    } catch {
        return cache.match(request.url);
    }
}
