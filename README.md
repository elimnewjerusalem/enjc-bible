# ENJC Bible App

Standalone mobile-first app: Bible Reader (Tamil & English, 11 versions) and
Verse Card Studio (Scripture image maker), by Elim New Jerusalem Church.

Installable as its own PWA. Links out to the main church website via the
**More** tab (opens in a new tab — app itself has no shared nav/content).

## Deploy
Push this folder's contents to the root of the `enjc-bible` GitHub repo,
enable GitHub Pages (branch: main, folder: /root).

Live at: `https://elimnewjerusalem.github.io/enjc-bible/`

## Pages
- `index.html` — Home shell (entry point, mobile-only; desktop visitors see a
  "please open on your phone" notice)
- `bible.html` — Bible reader. Works on both desktop ("Manuscript Reader"
  design) and mobile (native-app shell via `bible-mobile.js`).
- `imagegen.html` — Verse Card / Scripture image studio. Works on both
  desktop and mobile (native-app shell via `imagegen-mobile.js`).
- `more.html` — Church website link, install prompt, social/contact links.

## Structure
```
index.html, bible.html, imagegen.html, more.html
css/    — main.css, tools.css, design-system.css, premium-v2.css, mobile-fix.css
js/     — bible.js, bible-mobile.js,
          imagegen-main.js (ES module, imports data/canvas/export/ui),
          imagegen-mobile.js, site.js, design-upgrade.js, sw.js
data/   — manifest.json, bible-data.json, tamil-bible.json, tamil_full.json,
          english_kjv.json, bible-topics.json, book_index.json
images/ — logo/ (original wordmark), icons/ (square app icons + maskable,
          generated from the wordmark for manifest/favicon/home-screen use)
```

## Bible versions
3 Tamil (OV, BL98, IRV) + 8 English (KJV, WEB, BBE, ASV, NKJV, NASB,
Amplified, ERV). KJV is bundled locally (`data/english_kjv.json`); all
others fetch from bolls.life / bible-api.com at read time.

## Notes
- Service worker registers at `js/sw.js` (relative path) from every page,
  including `index.html` (was missing before, needed for install eligibility).
- Church website link lives only on `more.html` (new tab); rest of the app
  has no shared nav/content with the main site.
- App icons: `images/icons/icon-*.png` (square, generated from the wide
  `images/logo/logo.png` wordmark — used for favicon/manifest/home-screen).
  `images/logo/logo.png` itself is kept only for OG/social preview images.
