/* Service Worker — Bolão dos Babes (PWA) */
const CACHE = "babes-v8";
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
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // cacheia individualmente e ignora falhas (não trava a instalação)
      Promise.all(ASSETS.map((u) =>
        fetch(new Request(u, { cache: "reload" }))
          .then((res) => (res && res.ok && !res.redirected) ? c.put(u, res.clone()) : null)
          .catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// reconstrói respostas redirecionadas (o iOS recusa servi-las pelo SW)
function semRedirect(res) {
  if (!res || !res.redirected) return res;
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // dados ao vivo do Supabase: nunca passa pelo cache
  if (url.hostname.includes("supabase.co") || url.hostname.includes("supabase.in")) return;

  // Navegação (abrir o app): rede primeiro, à prova de redirecionamento
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => semRedirect(res))
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Demais arquivos do próprio site: cache primeiro
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res && res.status === 200 && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
