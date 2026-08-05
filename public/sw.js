/* Instant SWMS service worker
 *
 * Strategy — deliberately conservative so it can never break the builder
 * or payment flows:
 *  - Only GET requests are ever touched. Everything runs network-first.
 *  - Successful responses for document-hub pages, sign-off data, and static
 *    assets are cached; the cache is only served when the network fails
 *    (i.e. the tradie is offline on site).
 *  - PDFs saved via the document hub live in the "swms-docs" cache and are
 *    written by page code, not by this worker.
 */

const SHELL_CACHE = "swms-shell-v1";
const DOCS_CACHE = "swms-docs";

// Paths worth having when offline
const OFFLINE_CACHEABLE = [
  /^\/documents\//,
  /^\/sign\//,
  /^\/api\/sign\/status/,
  /^\/api\/sign\/talk/,
  /^\/icon-/,
  /^\/_next\/static\//,
  /^\/manifest\.webmanifest/,
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop old shell cache versions
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("swms-shell-") && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Saved PDFs: cache-only synthetic keys written by the documents hub
  if (url.pathname.startsWith("/offline-pdf/")) {
    event.respondWith(
      caches.open(DOCS_CACHE).then((c) => c.match(req)).then(
        (hit) => hit || new Response("Not saved on this device", { status: 404 })
      )
    );
    return;
  }

  const cacheable = OFFLINE_CACHEABLE.some((re) => re.test(url.pathname));
  if (!cacheable) return;

  // Network-first, cache fallback
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(SHELL_CACHE);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        const hit = await caches.match(req);
        if (hit) return hit;
        throw new Error("offline and not cached");
      }
    })()
  );
});
