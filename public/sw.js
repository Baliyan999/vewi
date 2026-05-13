/* eslint-disable no-restricted-globals */
/**
 * Service Worker для VEWI.
 *
 * Цели:
 *   1. Сделать камеру оффлайн-устойчивой: кэшируем shell гостевой страницы,
 *      статические ассеты и иконки.
 *   2. Поддержать `BackgroundSyncPlugin` — в Chromium фон-синхронизация
 *      разбудит SW, когда сеть вернётся. На iOS Safari BG Sync нет;
 *      там работает ручной flush из upload-queue.
 *
 * Это нарочно минималистично: бизнес-логика очереди живёт в IndexedDB,
 * SW лишь триггерит её, когда видит `sync` событие или `message`.
 */

const VERSION = "v1";
const STATIC_CACHE = `qr-static-${VERSION}`;
const RUNTIME_CACHE = `qr-runtime-${VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache the upload endpoint or any API
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for static assets
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ??
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Stale-while-revalidate for navigation requests
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    );
  }
});

// Background sync — Chromium/Android only
self.addEventListener("sync", (event) => {
  if (event.tag === "qr-photo-queue-flush") {
    event.waitUntil(notifyClientsToFlush());
  }
});

async function notifyClientsToFlush() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((c) => c.postMessage({ type: "flush-queue" }));
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "skipWaiting") self.skipWaiting();
});
