/* Service Worker — Bolão dos Babes (PWA) */
const CACHE = "babes-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./config.js",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Não cacheia chamadas ao Supabase (dados ao vivo)
  if (url.hostname.includes("supabase.co") || url.hostname.includes("supabase.in")) return;
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const live = fetch(e.request).then((res) => {
        if (res && res.status === 200 && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || live;
    })
  );
});
