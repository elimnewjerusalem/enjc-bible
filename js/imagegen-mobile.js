// ═══════════════════════════════════════════════════════════════
//  ENJC ImageGen — imagegen-mobile.js
//  Mobile-only studio UI: canvas fills screen, 4-tab bottom bar,
//  sliding half-sheets, full-width action bar.
//  Runs only on ≤640px. Hooks into imagegen state (ST, draw, etc.)
// ═══════════════════════════════════════════════════════════════
(function () {
  if (window.innerWidth > 640) return;

  // ── Inject hide-desktop styles immediately ───────────────────
  const hide = document.createElement('style');
  hide.id = 'ig-mob-hide';
  hide.textContent = `
    @media (max-width: 640px) {
      .topbar, .studio, .mob-bar, .mob-sizes-row,
      .mob-action-bar, .mob-backdrop, .mob-sheet,
      .site-footer, header, .mob-nav, .wa-float,
      .scroll-top-btn, .canvas-fullscreen-btn,
      .tb-actions--mobile, .tb-sizes--desktop,
      .tb-actions--desktop { display: none !important; }
      body { overflow: hidden !important; background: #07090f !important; }
      #ig-mob { display: flex !important; }
    }
  `;
  document.head.appendChild(hide);

  // ── Build shell after DOM ready ──────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(buildIgMobile, 80);
  });

  function buildIgMobile() {
    const shell = document.createElement('div');
    shell.id = 'ig-mob';
    shell.innerHTML = `
      <!-- TOP BAR: size pills + back -->
      <div class="igm-top">
        <a href="index.html" class="igm-back" aria-label="Home">‹</a>
        <div class="igm-sizes" id="igm-sizes">
          <button class="igm-sz on" data-sz="9:16" onclick="igmSetSz(this,'9:16')">9:16</button>
          <button class="igm-sz" data-sz="3:4"   onclick="igmSetSz(this,'3:4')">3:4</button>
          <button class="igm-sz" data-sz="1:1"   onclick="igmSetSz(this,'1:1')">1:1</button>
          <button class="igm-sz" data-sz="16:9"  onclick="igmSetSz(this,'16:9')">Wide</button>
        </div>
        <button class="igm-undo" onclick="if(typeof undoLast==='function')undoLast()">↩</button>
      </div>

      <!-- CANVAS AREA -->
      <div class="igm-canvas-area" id="igm-canvas-area">
        <div class="igm-canvas-wrap" id="igm-canvas-wrap">
          <!-- real canvas moved here by JS -->
        </div>
        <button class="igm-fullscreen-btn" onclick="igmOpenFullscreen()" aria-label="Full preview">⛶</button>
      </div>

      <!-- TAB BAR -->
      <div class="igm-tabbar" id="igm-tabbar">
        <button class="igm-tab" data-panel="m-style" onclick="igmTab(this,'🎨 Style')">
          <span class="igm-tab-ic">🎨</span>
          <span class="igm-tab-lbl">Style</span>
        </button>
        <button class="igm-tab" data-panel="m-bg" onclick="igmTab(this,'🖼 Background')">
          <span class="igm-tab-ic">🖼</span>
          <span class="igm-tab-lbl">BG</span>
        </button>
        <button class="igm-tab" data-panel="m-text" onclick="igmTab(this,'✍ Text')">
          <span class="igm-tab-ic">✍</span>
          <span class="igm-tab-lbl">Text</span>
        </button>
        <button class="igm-tab" data-panel="m-verse" onclick="igmTab(this,'📖 Verse')">
          <span class="igm-tab-ic">📖</span>
          <span class="igm-tab-lbl">Verse</span>
        </button>
      </div>

      <!-- ACTION BAR -->
      <div class="igm-actbar">
        <button class="igm-act-wa" onclick="if(typeof shareWA==='function')shareWA()">🟢 WhatsApp</button>
        <button class="igm-act-dl" onclick="if(typeof dlIG==='function')dlIG('png')">⬇ Save</button>
      </div>

      <!-- SHEET BACKDROP -->
      <div class="igm-backdrop" id="igm-backdrop" onclick="igmClose()"></div>

      <!-- BOTTOM SHEET -->
      <div class="igm-sheet" id="igm-sheet">
        <div class="igm-sheet-handle"></div>
        <div class="igm-sheet-head">
          <span class="igm-sheet-title" id="igm-sheet-title">Style</span>
          <div class="igm-sheet-mini" id="igm-sheet-mini">
            <!-- mini canvas preview rendered by JS -->
          </div>
          <button class="igm-sheet-close" onclick="igmClose()">✕</button>
        </div>
        <div class="igm-sheet-body" id="igm-sheet-body">
          <div id="m-style"></div>
          <div id="m-bg" style="display:none"></div>
          <div id="m-text" style="display:none"></div>
          <div id="m-verse" style="display:none"></div>
          <div id="m-export" style="display:none"></div>
        </div>
      </div>

      <!-- FULLSCREEN PREVIEW -->
      <div class="igm-full-overlay" id="igm-full-overlay" onclick="igmCloseFullscreen()">
        <button class="igm-full-close" onclick="igmCloseFullscreen()">✕</button>
        <canvas id="igm-full-cv"></canvas>
        <div class="igm-full-hint">Pinch to zoom · Tap to close</div>
      </div>
    `;
    document.body.appendChild(shell);
    injectIgMobileCSS();
    hookCanvas();
    setupSwipe();
  }

  // ── Move the real canvas into our wrapper ────────────────────
  function hookCanvas() {
    const realCV = document.getElementById('igcv');
    const wrap = document.getElementById('igm-canvas-wrap');
    if (realCV && wrap) {
      wrap.appendChild(realCV);
      // Ensure canvas fills the wrapper
      realCV.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;border-radius:8px;';
    }
    // Observe canvas changes to update mini preview
    if (realCV) {
      const obs = new MutationObserver(() => renderMiniPreview());
      obs.observe(realCV, { attributes: true });
      // Also hook draw() to refresh mini
      const origDraw = window.draw;
      if (origDraw) {
        window.draw = function (...args) {
          const r = origDraw.apply(this, args);
          setTimeout(renderMiniPreview, 50);
          return r;
        };
      }
    }
  }

  function renderMiniPreview() {
    const src = document.getElementById('igcv');
    const mini = document.getElementById('igm-sheet-mini');
    if (!src || !mini || !mini.offsetParent) return;
    if (!mini._cv) {
      const cv = document.createElement('canvas');
      cv.style.cssText = 'width:100%;height:100%;display:block;border-radius:4px;';
      mini.appendChild(cv);
      mini._cv = cv;
    }
    const cv = mini._cv;
    cv.width = src.width; cv.height = src.height;
    cv.getContext('2d')?.drawImage(src, 0, 0);
  }

  // ── Tab handling ─────────────────────────────────────────────
  let _activePanel = null;

  window.igmTab = function (el, title) {
    const panelId = el.dataset.panel;
    if (_activePanel === panelId) { igmClose(); return; }
    _activePanel = panelId;

    document.querySelectorAll('.igm-tab').forEach(t => t.classList.remove('on'));
    el.classList.add('on');

    // Show correct panel first (so content appears in right div)
    ['m-style','m-bg','m-text','m-verse','m-export'].forEach(id => {
      const p = document.getElementById(id);
      if (p) p.style.display = id === panelId ? 'block' : 'none';
    });

    document.getElementById('igm-sheet-title').textContent = title;
    document.getElementById('igm-sheet').classList.add('on');
    document.getElementById('igm-backdrop').classList.add('on');
    document.body.style.overflow = 'hidden';

    // Sync panel content — retry if not ready yet, or if it throws (state not ready)
    function doSync(attempt) {
      attempt = attempt || 0;
      if (typeof window.syncMobile === 'function') {
        try {
          window.syncMobile();
          setTimeout(renderMiniPreview, 80);
        } catch (e) {
          // Studio state (ST/GALLERY/canvas) not fully ready yet — retry a few times
          if (attempt < 20) {
            setTimeout(() => doSync(attempt + 1), 100);
          } else {
            console.error('ENJC ImageGen: syncMobile failed after retries', e);
          }
        }
      } else if (attempt < 30) {
        setTimeout(() => doSync(attempt + 1), 100);
      }
    }
    doSync(0);
  };

  window.igmClose = function () {
    _activePanel = null;
    document.getElementById('igm-sheet')?.classList.remove('on');
    document.getElementById('igm-backdrop')?.classList.remove('on');
    document.querySelectorAll('.igm-tab').forEach(t => t.classList.remove('on'));
    document.body.style.overflow = '';
  };

  // ── Size pills ───────────────────────────────────────────────
  window.igmSetSz = function (el, sz) {
    document.querySelectorAll('.igm-sz').forEach(b => b.classList.remove('on'));
    el.classList.add('on');
    // Also sync old mob-sz-pill and tb-sz buttons so imagegen-ui.js picks them up
    document.querySelectorAll('.mob-sz-pill,.tb-sz').forEach(b => {
      b.classList.toggle('on', b.dataset.sz === sz);
    });
    // Call the real setSz — it needs an element with dataset.sz
    if (typeof setSz === 'function') setSz(el, sz);
    // Re-sync canvas after resize
    setTimeout(() => {
      const realCV = document.getElementById('igcv');
      const wrap = document.getElementById('igm-canvas-wrap');
      if (realCV && wrap) {
        realCV.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;border-radius:8px;';
      }
    }, 100);
  };

  // ── Fullscreen preview ───────────────────────────────────────
  window.igmOpenFullscreen = function () {
    const src = document.getElementById('igcv');
    const dst = document.getElementById('igm-full-cv');
    if (!src || !dst) return;
    dst.width = src.width; dst.height = src.height;
    dst.getContext('2d')?.drawImage(src, 0, 0);
    document.getElementById('igm-full-overlay').classList.add('on');
  };

  window.igmCloseFullscreen = function () {
    document.getElementById('igm-full-overlay').classList.remove('on');
  };

  // ── Swipe sheet down to close ────────────────────────────────
  function setupSwipe() {
    document.addEventListener('DOMContentLoaded', () => {
      const sheet = document.getElementById('igm-sheet');
      if (!sheet) return;
      let sy = 0;
      sheet.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true });
      sheet.addEventListener('touchmove', e => {
        const dy = e.touches[0].clientY - sy;
        if (dy > 0) sheet.style.transform = `translateY(${Math.min(dy, 200)}px)`;
      }, { passive: true });
      sheet.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - sy;
        sheet.style.transform = '';
        if (dy > 80) igmClose();
      });
    });
  }

  // ── CSS ──────────────────────────────────────────────────────
  function injectIgMobileCSS() {
    const s = document.createElement('style');
    s.textContent = `
/* ══════════════════════════════════════
   ImageGen Mobile Shell
══════════════════════════════════════ */
#ig-mob {
  display: none;
  position: fixed; inset: 0; z-index: 1500;
  flex-direction: column;
  background: #07090f;
  font-family: var(--sans, 'DM Sans', sans-serif);
  overflow: hidden;
}

/* Top bar */
.igm-top {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px;
  background: #0c0f1a;
  border-bottom: 1px solid #1a1f35;
  flex-shrink: 0; height: 48px;
}
.igm-back {
  background: transparent; border: 1px solid #1a1f35;
  border-radius: 8px; color: #8090b0; font-size: 18px;
  padding: 4px 10px; cursor: pointer; line-height: 1;
  text-decoration: none; display: flex; align-items: center;
}
.igm-sizes { display: flex; gap: 5px; flex: 1; justify-content: center; }
.igm-sz {
  padding: 5px 11px; border-radius: 99px;
  border: 1px solid #1a1f35; background: rgba(255,255,255,.04);
  color: #8090b0; font-size: 11px; font-weight: 700; cursor: pointer;
  font-family: var(--sans); transition: all .15s;
}
.igm-sz.on { background: var(--gd, #c9a84c); color: #07090f; border-color: var(--gd, #c9a84c); }
.igm-undo {
  background: transparent; border: 1px solid #1a1f35;
  border-radius: 8px; color: #8090b0; font-size: 16px;
  padding: 4px 10px; cursor: pointer;
}

/* Canvas area — fills all space between top bar and tab bar */
.igm-canvas-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 12px; background: #07090f; position: relative; min-height: 0;
}
.igm-canvas-wrap {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  width: 100%; height: 100%;
}
.igm-canvas-wrap canvas {
  display: block;
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0,0,0,.6);
}
.igm-fullscreen-btn {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(0,0,0,.55); border: 1px solid rgba(255,255,255,.12);
  border-radius: 8px; color: rgba(255,255,255,.7);
  padding: 6px 10px; font-size: 16px; cursor: pointer; z-index: 10;
}

/* Tab bar */
.igm-tabbar {
  display: flex; flex-shrink: 0;
  background: #0c0f1a; border-top: 1px solid #1a1f35;
  height: 56px;
}
.igm-tab {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  background: transparent; border: none;
  border-top: 2px solid transparent;
  cursor: pointer; padding: 6px 0;
  transition: all .15s; -webkit-tap-highlight-color: transparent;
}
.igm-tab.on {
  border-top-color: var(--gd, #c9a84c);
  background: rgba(201,168,76,.07);
}
.igm-tab-ic { font-size: 18px; line-height: 1; }
.igm-tab-lbl {
  font-size: 10px; font-weight: 600;
  color: #5a6a8a; font-family: var(--sans);
}
.igm-tab.on .igm-tab-lbl { color: var(--gd, #c9a84c); }

/* Action bar */
.igm-actbar {
  display: flex; gap: 8px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  background: #0c0f1a; border-top: 1px solid #1a1f35;
  flex-shrink: 0;
}
.igm-act-wa, .igm-act-dl {
  flex: 1; padding: 13px 8px; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: var(--sans); transition: opacity .15s;
}
.igm-act-wa { background: #25d366; color: #fff; }
.igm-act-dl { background: var(--gd, #c9a84c); color: #07090f; }
.igm-act-wa:active, .igm-act-dl:active { opacity: .8; }

/* Sheet backdrop */
.igm-backdrop {
  display: none; position: fixed; inset: 0; z-index: 1600;
  background: rgba(0,0,0,.6);
}
.igm-backdrop.on { display: block; }

/* Bottom sheet */
.igm-sheet {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 1700;
  background: #0f1220;
  border-radius: 16px 16px 0 0;
  border-top: 1px solid #1a1f35;
  max-height: 72vh;
  display: flex; flex-direction: column;
  transform: translateY(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
  padding-bottom: env(safe-area-inset-bottom);
}
.igm-sheet.on { transform: translateY(0); }

.igm-sheet-handle {
  width: 36px; height: 4px; border-radius: 99px;
  background: #1a1f35; margin: 10px auto 0; flex-shrink: 0;
}
.igm-sheet-head {
  display: flex; align-items: center;
  padding: 8px 14px 8px;
  border-bottom: 1px solid #1a1f35;
  flex-shrink: 0; gap: 10px;
}
.igm-sheet-title {
  font-size: 13px; font-weight: 700;
  color: var(--gd, #c9a84c); flex: 1;
}
.igm-sheet-mini {
  width: 36px; height: 48px;
  border-radius: 5px; overflow: hidden;
  border: 1px solid #1a1f35; flex-shrink: 0;
  background: #07090f;
}
.igm-sheet-close {
  background: transparent; border: none;
  color: #5a6a8a; font-size: 18px; cursor: pointer; padding: 0 2px;
  min-width: 32px; min-height: 32px;
}
.igm-sheet-body {
  overflow-y: auto; flex: 1; padding: 14px 14px 16px;
  -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
}

/* Fullscreen overlay */
.igm-full-overlay {
  display: none; position: fixed; inset: 0; z-index: 9000;
  background: #000; align-items: center; justify-content: center;
  flex-direction: column; gap: 12px;
  touch-action: pinch-zoom;
}
.igm-full-overlay.on { display: flex; }
.igm-full-overlay canvas {
  max-width: 100vw; max-height: 85vh; object-fit: contain;
}
.igm-full-close {
  position: fixed; top: 14px; right: 14px;
  background: rgba(255,255,255,.12); border: none;
  color: #fff; width: 44px; height: 44px;
  border-radius: 50%; font-size: 18px; cursor: pointer; z-index: 9001;
}
.igm-full-hint {
  font-size: 11px; color: rgba(255,255,255,.3);
  font-family: var(--sans); text-align: center;
}
    `;
    document.head.appendChild(s);
  }

})();
