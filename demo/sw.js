/* Offline. This file has to sit next to the planner on the host: a service
   worker cannot live inside the single HTML file it is caching.

   Bump CACHE on every upload, or returning buyers keep the old version. */
const CACHE = 'guloona-adhd-budget-planner-demo-v5';

/* Nothing is named here on purpose. Listing files to precache means renaming the
   HTML breaks installation silently, so pages are cached as they are fetched. */
self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Network first so a fix reaches buyers on their next open, cache second so
   there is always something to open with no signal. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      /* ignoreSearch, or the cache only answers the exact address it was
         filled from. Open the link once with anything after the ?, which is
         what a link from the delivery PDF or a shared URL carries, then open
         the bare address with no signal, and the browser showed its no
         connection page with the whole planner sitting in the cache. */
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(r => r || caches.match('./index.html')))
  );
});
