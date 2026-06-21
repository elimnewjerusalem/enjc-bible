# ENJC Bible App

Standalone mobile-first app: Bible Reader (Tamil & English, 11 versions) and
Verse Card Studio (Scripture image maker), by Elim New Jerusalem Church.

Fully independent from the main church website — no shared navigation,
no cross-links, installable as its own PWA.

## Deploy
Push this folder's contents to the root of the `enjc-bible` GitHub repo,
enable GitHub Pages (branch: main, folder: /root).

Live at: `https://elimnewjerusalem.github.io/enjc-bible/`

## Pages
- `app.html` — Home shell (entry point, mobile-only; desktop visitors see a
  "please open on your phone" notice)
- `bible.html` — Bible reader. Works on both desktop ("Manuscript Reader"
  design) and mobile (native-app shell via `bible-mobile.js`).
- `imagegen.html` — Verse Card / Scripture image studio. Works on both
  desktop and mobile (native-app shell via `imagegen-mobile.js`).

## Structure
```
app.html, bible.html, imagegen.html
css/    — main.css, tools.css, design-system.css, premium-v2.css, mobile-fix.css
js/     — bible.js, bible-mobile.js,
          imagegen-main.js (ES module, imports data/canvas/export/ui),
          imagegen-mobile.js, site.js, design-upgrade.js, sw.js
data/   — manifest.json, bible-data.json, tamil-bible.json, tamil_full.json,
          english_kjv.json, bible-topics.json, book_index.json
images/ — logo only
```

## Bible versions
3 Tamil (OV, BL98, IRV) + 8 English (KJV, WEB, BBE, ASV, NKJV, NASB,
Amplified, ERV). KJV is bundled locally (`data/english_kjv.json`); all
others fetch from bolls.life / bible-api.com at read time.

## Notes
- Service worker registers at `js/sw.js` (relative path).
- No website (church repo) links anywhere in this app — fully standalone.
