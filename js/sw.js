// ═══════════════════════════════════════════════════════════════
//  ENJC Bible App — Service Worker (offline shell cache)
//  Scope: app only (Home shell, Bible reader, Scripture Cards studio)
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'enjc-app-v4';
const DATA_CACHE = 'enjc-app-data-v1';

// Static shell — cache on install, serve from cache always.
const SHELL_ASSETS = [
  './',
  'index.html',
  'bible.html',
  'imagegen.html',
  'more.html',
  'manifest.json',
  'data/bible-data.json',
  'data/tamil-bible.json',
  'css/main.css',
  'css/tools.css',
  'css/design-system.css',
  'css/premium-v2.css',
  'css/mobile-fix.css',
  'js/site.js',
  'js/bible.js',
  'js/bible-mobile.js',
  'js/imagegen-mobile.js',
  'js/imagegen-main.js',
  'js/imagegen-canvas.js',
  'js/imagegen-data.js',
  'js/imagegen-export.js',
  'js/imagegen-ui.js',
  'images/logo/logo.png',
  'images/icons/icon-192.png',
  'images/icons/icon-512.png',
  'images/icons/icon-192-maskable.png',
  'images/icons/icon-512-maskable.png',
  'images/icons/apple-touch-icon.png',
];

// ── INSTALL — pre-cache shell ────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        SHELL_ASSETS.map(url =>
          fetch(url).then(res => {
            if (res.ok) cache.put(url, res);
          }).catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE — clean up old caches ──────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== DATA_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH — cache-first for shell, network-first for large Bible text ──
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // skip cross-origin (bolls.life, bible-api.com, fonts, etc.)

  // Large Bible text data: network-first, fall back to cache (keeps content fresh)
  if (url.pathname.includes('/data/english_kjv') ||
      url.pathname.includes('/data/tamil_full')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache =>
        fetch(request)
          .then(res => { cache.put(request, res.clone()); return res; })
          .catch(() => cache.match(request))
      )
    );
    return;
  }

  // Everything else: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (res.ok && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then(c => c.put(request, res.clone()));
        }
        return res;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
