const BUILD_ID = 'd9ea2bd882dba38d';
const SHELL_CACHE = `wagsignals-shell-${BUILD_ID}`;
const IMAGE_CACHE = 'wagsignals-images-v1';
const SHELL_URLS = [
  './', './index.html', './daily.html', './quiz.html', './signals.html', './behaviors.html',
  './training.html', './challenges.html', './body-map.html', './saved.html', './scenarios.html',
  './cheat-sheet.html', './sources-safety.html', './styles.css', './app.js', './signals.js',
  './training-data.js', './guided-reader.js', './training.js', './challenge-data.js', './challenges.js',
  './pwa-register.js', './install.js', './manifest.webmanifest', './favicon.svg',
  './assets/wagsignals-192.png', './assets/wagsignals-512.png', './assets/wagsignals-maskable-512.png',
  './assets/dog-language-hero.webp'
];

function cacheKey(request) {
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  return url.href;
}

function isWithinScope(requestUrl) {
  const request = new URL(requestUrl);
  const scope = new URL(self.registration.scope);
  return request.origin === scope.origin && request.pathname.startsWith(scope.pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('wagsignals-shell-') && name !== SHELL_CACHE)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range') || !isWithinScope(request.url)) return;

  const key = cacheKey(request);
  const isImage = request.destination === 'image' || /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(new URL(request.url).pathname);
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') {
        const cacheName = isImage ? IMAGE_CACHE : SHELL_CACHE;
        try {
          const cache = await caches.open(cacheName);
          await cache.put(key, response.clone());
        } catch {
          // Storage can be unavailable or full; keep the online response usable.
        }
      }
      return response;
    } catch {
      const preferredCache = await caches.open(isImage ? IMAGE_CACHE : SHELL_CACHE);
      const cached = await preferredCache.match(key);
      if (cached) return cached;
      if (isImage) {
        const shell = await caches.open(SHELL_CACHE);
        const shellImage = await shell.match(key);
        if (shellImage) return shellImage;
      }
      return Response.error();
    }
  })());
});
