const CACHE_NAME = "default-v3.04";
const DYNAMIC_CACHE_NAME = "dynamic-v3.01";
const urls = ["/"];

// install ServiceWorker
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(urls);
    })
  );
});
//listen for notification
self.addEventListener("push", async (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: "./images/logo.png",
  });
});
// activate service worke
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", async (e) => {
  // if (e.request.url.indexOf("/user") === -1) {
  //   e.respondWith(
  //     caches.match(e.request).then((cacheRes) => {
  //       return (
  //         cacheRes ||
  //         fetch(e.request).then((fetRes) => {
  //           return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
  //             cache.put(e.request.url, fetRes.clone());
  //             return fetRes;
  //           });
  //         })
  //       );
  //     })
  //   );
  // }
});
