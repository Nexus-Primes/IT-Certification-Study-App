const CACHE = 'cert-study-v212';
const ASSETS = ['/', '/app/index.html', '/app/styles.css', '/app/app.js', '/app/utils.js', '/data/concepts.js', '/data/labs.js', '/data/aplus-guide.js', '/data/networkplus.js', '/data/networkplus-labs.js', '/data/networkplus-guide.js', '/data/securityplus.js', '/data/securityplus-labs.js', '/data/securityplus-guide.js', '/data/3cx-basic.js', '/data/3cx-basic-labs.js', '/data/3cx-basic-guide.js', '/data/3cx-advanced.js', '/data/3cx-advanced-labs.js', '/data/3cx-advanced-guide.js', '/data/winserver-hybrid.js', '/data/winserver-hybrid-labs.js', '/data/winserver-hybrid-guide.js', '/data/dp300.js', '/data/dp300-labs.js', '/data/dp300-guide.js', '/data/blender-fundamentals.js', '/data/blender-fundamentals-labs.js', '/assets/icon.svg', '/manifest.webmanifest'];

// skipWaiting + clients.claim make a new service worker take over immediately instead of
// sitting in "waiting" until every open tab is manually closed — without these, a page edit
// can ship correctly and still never reach an open browser tab.
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return; // progress data must always hit the live server
  // ignoreSearch: the page requests assets with a `?v=N` cache-buster but ASSETS precaches
  // them query-less — without this the precache is never consulted for JS/CSS and a
  // cold install that loses the network mid-load leaves a broken app. Freshness is still
  // handled by bumping CACHE, which wipes and re-precaches on activate.
  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => {
    // Only fall back to the shell for a page navigation — never hand HTML back in place
    // of a failed script/style/data request (that just produces confusing MIME errors).
    if (event.request.mode === 'navigate') return caches.match('/app/index.html');
    return Response.error();
  })));
});
