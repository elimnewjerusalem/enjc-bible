
// ── INIT ──────────────────────────────────────────────────────────
// ── THEME TOGGLE ──────────────────────────────────────────────────
export let _studioTheme = localStorage.getItem('enjc_studio_theme') || 'dark';
export function toggleStudioTheme(){
  _studioTheme = _studioTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('enjc_studio_theme', _studioTheme);
  applyStudioTheme(_studioTheme);
}
export function applyStudioTheme(theme){
  const btn = document.getElementById('theme-toggle-btn');
  if(theme === 'light'){
    document.documentElement.setAttribute('data-theme','light');
    if(btn) btn.textContent = '☀';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if(btn) btn.textContent = '🌙';
  }
}

export let _drawPending=false;
export function debounceDraw(){
  if(_drawPending)return;
  _drawPending=true;
  requestAnimationFrame(()=>{_drawPending=false;draw();});
}

export function initStudio(){
  // Apply saved theme on load
  applyStudioTheme(_studioTheme);

  // Preload ENJC logo for canvas header
  window._logoImg = new Image();
  window._logoImg.onload = ()=>debounceDraw();
  window._logoImg.src = 'images/logo/logo.png';

  buildTemplates();
  buildFonts();
  buildTCdots();
  buildPresets();
  buildGallery();
  buildGradPresets();
  buildSzBtns();
  // Defaults for new state fields
  if(ST.textPos===undefined) ST.textPos=0.5;
  if(ST.autoFit===undefined) ST.autoFit=true;
  buildQuickTpl();
  buildVerseTags();
  buildQuickVerses();
  biRenderBooks();
  readURL();
  loadSavedDesign(); // auto-restore last design
  updateBadges();
  draw();
  syncMobile();
  // Auto-save on any draw
  setInterval(saveDesign, 3000);
}


// ── AUTO-SAVE DESIGN ────────────────────────────────────────────
export function saveDesign(){
  try{
    const state={
      sz:ST.sz, bgMode:ST.bgMode, bgColor:ST.bgColor,
      font:ST.font, taSize:parseInt(g('ta-size')?.value||52),
      enSize:parseInt(g('en-size')?.value||32),
      txColor:ST.txColor, showTa:ST.showTa, showEn:ST.showEn,
      showRef:ST.showRef, showWM:ST.showWM, textGlow:ST.textGlow,
      activeTpl:ST.activeTpl, verseIdx:ST.verseIdx,
      wmName:g('wm-name')?.value||'', wmSub:g('wm-sub')?.value||'',
      gradMode:ST.gradMode||false,
      grad1:ST.grad1||'#1a0a3a', grad2:ST.grad2||'#0a1a3a', gradAngle:ST.gradAngle||135,
      safeZone:ST.safeZone||false,
      textPos:ST.textPos||0.5,
      autoFit:ST.autoFit!==false,
    };
    localStorage.setItem('enjc_studio_state', JSON.stringify(state));
  }catch(e){}
}

export function loadSavedDesign(){
  try{
    const saved = localStorage.getItem('enjc_studio_state');
    if(!saved){ applyTemplate(TEMPLATES[0], false); return; }
    const s = JSON.parse(saved);

    // Restore size
    if(s.sz){
      ST.sz = s.sz;
      document.querySelectorAll('[data-sz]').forEach(b=>b.classList.toggle('on',b.dataset.sz===s.sz));
    }
    // Restore bg color
    if(s.bgColor) setColorHex(s.bgColor, false);
    // Restore bgMode
    if(s.bgMode) setBG(s.bgMode, false);
    // Restore font
    if(s.font) setFont(s.font);
    // Restore text color
    if(s.txColor) setTC(s.txColor);
    // Restore toggles
    if(s.showTa!==undefined){ ST.showTa=s.showTa; g('tog-ta')?.classList.toggle('on',s.showTa); }
    if(s.showEn!==undefined){ ST.showEn=s.showEn; g('tog-en')?.classList.toggle('on',s.showEn); }
    if(s.showRef!==undefined){ ST.showRef=s.showRef; g('tog-ref')?.classList.toggle('on',s.showRef); }
    if(s.showWM!==undefined){ ST.showWM=s.showWM; g('tog-wm')?.classList.toggle('on',s.showWM); }
    if(s.textGlow!==undefined){ ST.textGlow=s.textGlow; g('tog-glow')?.classList.toggle('on',s.textGlow); }
    // Restore size sliders
    if(s.taSize&&g('ta-size')){ g('ta-size').value=s.taSize; g('ta-size-v').textContent=s.taSize+'px'; }
    if(s.enSize&&g('en-size')){ g('en-size').value=s.enSize; g('en-size-v').textContent=s.enSize+'px'; }
    // Restore watermark text
    if(s.wmName&&g('wm-name')) g('wm-name').value=s.wmName;
    if(s.wmSub&&g('wm-sub'))   g('wm-sub').value=s.wmSub;
    // Restore gradient
    if(s.gradMode!==undefined) ST.gradMode=s.gradMode;
    if(s.grad1) ST.grad1=s.grad1;
    if(s.grad2) ST.grad2=s.grad2;
    if(s.gradAngle) ST.gradAngle=s.gradAngle;
    // Restore safe zone
    if(s.safeZone!==undefined) ST.safeZone=s.safeZone;
    if(s.autoFit!==undefined){ ST.autoFit=s.autoFit; g('tog-autofit')?.classList.toggle('on',s.autoFit); }
    if(s.textPos!==undefined){
      ST.textPos=s.textPos;
      const sl=g('text-pos-sl'); if(sl) sl.value=Math.round(s.textPos*100);
    }
    // Restore template highlight
    if(s.activeTpl){
      ST.activeTpl=s.activeTpl;
      document.querySelectorAll('.tpl').forEach(el=>el.classList.toggle('on',el.id==='tpl-'+s.activeTpl));
    }
    // Restore verse
    if(s.verseRef){
      const found=QUICK_VERSES.find(v=>(v.tref||'')+'|'+(v.ref||'')===s.verseRef);
      if(found){ST.verse=found;ST.verseIdx=QUICK_VERSES.indexOf(found);}
      else if(s.verseIdx!==undefined&&QUICK_VERSES[s.verseIdx]){ST.verseIdx=s.verseIdx;ST.verse=QUICK_VERSES[s.verseIdx];}
    } else if(s.verseIdx!==undefined&&QUICK_VERSES[s.verseIdx]){
      ST.verseIdx=s.verseIdx;ST.verse=QUICK_VERSES[s.verseIdx];
    }
    toast('🔄 Last design restored',1500);
  }catch(e){ applyTemplate(TEMPLATES[0], false); }
}

// ── URL PARAM (verse passed from bible.html) ──────────────────────
export function readURL(){
  try{
    const stored=localStorage.getItem('enjc_ig_verse');
    if(stored){
      const v=JSON.parse(stored);
      if(v&&v.ta){
        QUICK_VERSES.unshift(v);
        ST.verse=v; ST.verseIdx=0;
        localStorage.removeItem('enjc_ig_verse');
        return;
      }
    }
    const p=new URLSearchParams(location.search);
    if(p.get('ta')){
      const v={ta:decodeURIComponent(p.get('ta')),tref:decodeURIComponent(p.get('tref')||''),
               en:decodeURIComponent(p.get('en')||''),ref:decodeURIComponent(p.get('ref')||'')};
      QUICK_VERSES.unshift(v);
      ST.verse=v; ST.verseIdx=0;
    }
  }catch(e){}
}

// ── TABS ──────────────────────────────────────────────────────────
export function switchTab(el){
  document.querySelectorAll('.lp-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  g('tab-'+el.dataset.tab)?.classList.add('on');
}

// ── TEMPLATES ─────────────────────────────────────────────────────
export function buildTemplates(){
  g('tpl-grid').innerHTML=TEMPLATES.map(t=>`
    <div class="tpl${ST.activeTpl===t.id?' on':''}" id="tpl-${t.id}" onclick='applyTemplate(${JSON.stringify(t)})'>
      <div class="tpl-preview" style="background:${t.bg}">
        <div class="tpl-ta" style="color:${t.accent};font-size:9px">வேத வாக்கு</div>
        <div style="width:20px;height:1px;background:${t.accent};margin:4px auto;opacity:.6"></div>
        <div style="font-size:6px;color:rgba(255,255,255,.5)">Bible Verse</div>
      </div>
      <div class="tpl-name" style="color:${t.accent}">${t.name}</div>
    </div>`).join('');
}

export function snapshotST(){
  ST._prev = JSON.stringify({
    activeTpl:ST.activeTpl, bgColor:ST.bgColor, bgMode:ST.bgMode,
    txColor:ST.txColor, grad1:ST.grad1, grad2:ST.grad2, gradAngle:ST.gradAngle,
    font:ST.font, showTa:ST.showTa, showEn:ST.showEn, showRef:ST.showRef,
    showWM:ST.showWM, textGlow:ST.textGlow, textPos:ST.textPos||0.5,
  });
}

export function undoLast(){
  if(!ST._prev){ toast('Nothing to undo'); return; }
  const p = JSON.parse(ST._prev);
  Object.assign(ST, p);
  setColorHex(ST.bgColor, false);
  setBG(ST.bgMode, false);
  setFont(ST.font);
  setTC(ST.txColor);
  document.querySelectorAll('.tpl').forEach(el=>el.classList.toggle('on',el.id==='tpl-'+ST.activeTpl));
  ['tog-ta','tog-en','tog-ref','tog-wm'].forEach((id,i)=>{
    const keys=['showTa','showEn','showRef','showWM'];
    g(id)?.classList.toggle('on', ST[keys[i]]);
  });
  g('tog-glow')?.classList.toggle('on', ST.textGlow);
  if(g('text-pos-sl')) g('text-pos-sl').value = Math.round((ST.textPos||0.5)*100);
  ST._prev = null;
  draw();
  toast('↩ Undone');
}

export function applyTemplate(t, doToast=true){
  snapshotST();
  ST.activeTpl=t.id;
  setColorHex(t.bg, false);
  ST.txColor=t.tc||'#fff';
  document.querySelectorAll('.tcd').forEach(d=>d.classList.toggle('on',d.dataset.c===ST.txColor));
  setBG('solid', false);
  document.querySelectorAll('.tpl').forEach(el=>el.classList.toggle('on',el.id==='tpl-'+t.id));
  draw();
  if(doToast) toast('✨ '+t.name);
}

// ── FONTS ─────────────────────────────────────────────────────────
export function buildFonts(){
  g('font-grid').innerHTML=Object.entries(FONTS).map(([k,f])=>`
    <div class="fb${ST.font===k?' on':''}" onclick="setFont('${k}')">
      <div class="fb-name" style="font-family:${f.fam}">${f.label}</div>
      <div class="fb-hint">${f.hint}</div>
    </div>`).join('');
}
export function setFont(k){
  if(k!==ST.font) snapshotST();
  ST.font=k;
  document.querySelectorAll('.fb').forEach((el,i)=>el.classList.toggle('on',Object.keys(FONTS)[i]===k));
  draw();
}

// ── TEXT COLORS ───────────────────────────────────────────────────
export function buildTCdots(){
  g('tc-row').innerHTML=TC_COLORS.map(c=>`
    <div class="tcd${ST.txColor===c?' on':''}" style="background:${c}" data-c="${c}" onclick="setTC('${c}')"></div>`).join('');
}
export function setTC(c){
  if(c!==ST.txColor) snapshotST();
  ST.txColor=c;
  document.querySelectorAll('.tcd').forEach(d=>d.classList.toggle('on',d.dataset.c===c));
  draw();
}

// ── COLOR PRESETS ─────────────────────────────────────────────────
export function buildPresets(){
  g('preset-dots').innerHTML=PRESETS.map(c=>`
    <div class="pdot" style="background:${c}" onclick="setColorHex('${c}')"></div>`).join('');
}

export function setColorHex(hex, redraw=true){
  if(redraw && hex!==ST.bgColor) snapshotST();
  ST.bgColor=hex;
  const r=parseInt(hex.slice(1,3),16)||0;
  const gv=parseInt(hex.slice(3,5),16)||0;
  const b=parseInt(hex.slice(5,7),16)||0;
  const ri=g('sl-r'),gi=g('sl-g'),bi=g('sl-b');
  if(ri){ri.value=r;g('sl-rv').textContent=r;}
  if(gi){gi.value=gv;g('sl-gv').textContent=gv;}
  if(bi){bi.value=b;g('sl-bv').textContent=b;}
  const cp=g('col-prev');if(cp)cp.style.background=hex;
  const hv=g('hex-val');if(hv)hv.textContent=hex.toUpperCase();
  const hi=g('hex-inp'); if(hi) hi.value=hex.toUpperCase();
  const cw=g('col-wheel'); if(cw) cw.value=hex;
  document.querySelectorAll('.pdot').forEach(el=>{
    const bg=el.style.backgroundColor;
    const elhex='#'+[...new Array(3)].map((_,i)=>parseInt(bg.split(',')[i]?.replace(/\D/g,'')||0).toString(16).padStart(2,'0')).join('');
    el.classList.toggle('on', elhex.toLowerCase()===hex.toLowerCase());
  });
  if(redraw) debounceDraw();
}

// ── MOBILE SYNC ───────────────────────────────────────────────────
export let _mobActive = null;

export function mobOpen(el, title){
  const panelId = el.dataset.panel;
  if(_mobActive === panelId){ mobClose(); return; }
  _mobActive = panelId;
  // Re-sync mobile content so state reflects latest changes
  if(panelId === 'm-style') syncMobileStyle();
  if(panelId === 'm-bg') {
    syncMobileBG();
  }
  if(panelId === 'm-text')  syncMobileText();
  if(panelId === 'm-verse') {
    // Sync verse display
    const mvd=g('m-verse');
    if(mvd){
      const ta=mvd.querySelector('#mvd-ta');
      const ref=mvd.querySelector('#mvd-ref');
      if(ta)ta.textContent=ST.verse?.ta?.substring(0,90)+(ST.verse?.ta?.length>90?'…':'');
      if(ref)ref.textContent='— '+(ST.verse?.tref||ST.verse?.ref||'');
    }
  }
  // Highlight tab
  document.querySelectorAll('.mob-tab').forEach(t=>t.classList.remove('on'));
  el.classList.add('on');
  // Set title
  const titleEl = g('mob-sheet-title');
  if(titleEl) titleEl.textContent = title;
  // Show correct panel content
  ['m-style','m-bg','m-text','m-verse','m-export'].forEach(id=>{
    const el = g(id);
    if(el) el.style.display = id===panelId ? 'block' : 'none';
  });
  // Open sheet + backdrop
  g('mob-sheet')?.classList.add('on');
  g('mob-backdrop')?.classList.add('on');
  document.body.style.overflow='hidden';
}

export function mobClose(){
  _mobActive = null;
  g('mob-sheet')?.classList.remove('on');
  g('mob-backdrop')?.classList.remove('on');
  document.querySelectorAll('.mob-tab').forEach(t=>t.classList.remove('on'));
  document.body.style.overflow='';
}

// Swipe down sheet to close
(function(){
  let startY=0, isDragging=false;
  document.addEventListener('DOMContentLoaded',()=>{
    const sheet=g('mob-sheet');
    if(!sheet)return;
    sheet.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;isDragging=true;},{passive:true});
    sheet.addEventListener('touchmove',e=>{
      if(!isDragging)return;
      const dy=e.touches[0].clientY-startY;
      if(dy>0)sheet.style.transform=`translateY(${Math.min(dy,200)}px)`;
    },{passive:true});
    sheet.addEventListener('touchend',e=>{
      isDragging=false;
      const dy=e.changedTouches[0].clientY-startY;
      sheet.style.transform='';
      if(dy>80)mobClose();
    });
  });
})();

export function syncMobileStyle(){
  const el=g('m-style');if(!el)return;
  el.querySelectorAll('[onclick*="applyTemplate"]').forEach((btn,i)=>{
    const tId=TEMPLATES[i]?.id;
    if(tId)btn.style.borderColor=ST.activeTpl===tId?'var(--gd)':'var(--bd)';
  });
  // Also sync glow and safe zone toggles
  const toggs=el.querySelectorAll('.tog');
  if(toggs[0])toggs[0].classList.toggle('on',ST.textGlow);
  if(toggs[1])toggs[1].classList.toggle('on',ST.safeZone);
}
export function syncMobileText(){
  const el=g('m-text');if(!el)return;
  // Update toggle states to match current ST
  const toggs=el.querySelectorAll('.tog');
  if(toggs[0])toggs[0].classList.toggle('on',ST.showTa);
  if(toggs[1])toggs[1].classList.toggle('on',ST.showEn);
  if(toggs[2])toggs[2].classList.toggle('on',ST.showRef);
  if(toggs[3])toggs[3].classList.toggle('on',ST.showWM);
  if(toggs[4])toggs[4].classList.toggle('on',ST.textGlow);
  // Update text size values
  const taInput=el.querySelector('input[type="range"][min="28"]');
  const enInput=el.querySelector('input[type="range"][min="16"]');
  if(taInput) taInput.value=parseInt(g('ta-size')?.value||52);
  if(enInput) enInput.value=parseInt(g('en-size')?.value||32);
}
export function syncMobile(){
  // Mobile panels (#m-style, #m-bg, #m-text, #m-verse) are built asynchronously
  // by imagegen-mobile.js shortly after DOMContentLoaded. If this runs before
  // they exist (e.g. the very first call from initStudio()), bail out quietly —
  // imagegen-mobile.js's igmTab() retries this call once the user opens a tab.
  if(!g('m-style')||!g('m-bg')||!g('m-text')||!g('m-verse'))return;
  // Style
  g('m-style').innerHTML=`
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:8px">Templates</p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
      ${TEMPLATES.map(t=>`
        <div onclick='applyTemplate(${JSON.stringify(t)})'
          style="border:1.5px solid ${ST.activeTpl===t.id?'var(--gd)':'var(--bd)'};border-radius:8px;overflow:hidden;cursor:pointer;aspect-ratio:3/4">
          <div style="background:${t.bg};height:calc(100% - 22px);display:flex;align-items:center;justify-content:center;padding:6px">
            <div style="font-size:8px;color:${t.accent};text-align:center;font-family:var(--tamil)">வேதம்</div>
          </div>
          <div style="font-size:9px;font-weight:600;text-align:center;padding:3px 4px;background:rgba(0,0,0,.6);color:${t.accent}">${t.name}</div>
        </div>`).join('')}
    </div>
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin:12px 0 8px">Options</p>
    <div onclick="togOpt(this.querySelector('.tog'),'textGlow')" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);cursor:pointer"><span style="font-size:12px;color:var(--tx)">Text Glow</span><div class="tog${ST.textGlow?' on':''}" data-key="textGlow"></div></div>
    <div onclick="togOpt(this.querySelector('.tog'),'safeZone')" style="display:flex;justify-content:space-between;padding:8px 0;cursor:pointer"><span style="font-size:12px;color:var(--tx)">Safe Zone Guide</span><div class="tog${ST.safeZone?' on':''}" data-key="safeZone"></div></div>`

  // BG
  g('m-bg').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px">
      <button onclick="setBG('solid')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='solid'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='solid'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='solid'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">🎨</span>Colour</button>
      <button onclick="setBG('gradient')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='gradient'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='gradient'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='gradient'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">🌈</span>Gradient</button>
      <button onclick="setBG('photo')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='photo'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='photo'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='photo'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">📷</span>My Photo</button>
      <button onclick="setBG('gallery')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='gallery'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='gallery'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='gallery'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">🌄</span>Gallery</button>
    </div>
    <div id="m-bg-solid" class="m-bg-section" data-mode="solid" style="display:${ST.bgMode==='solid'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Colour Presets</p>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">
        ${PRESETS.map(c=>`<div onclick="setColorHex('${c}')" style="width:24px;height:24px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${ST.bgColor.toLowerCase()===c.toLowerCase()?'var(--gd)':'transparent'};transition:all .18s"></div>`).join('')}
      </div>
    </div>
    <div id="m-bg-gradient" class="m-bg-section" data-mode="gradient" style="display:${ST.bgMode==='gradient'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Gradient</p>
      <div id="m-grad-preview" style="height:56px;border-radius:12px;border:1px solid var(--bd2);margin-bottom:10px;background:linear-gradient(${ST.gradAngle}deg,${ST.grad1},${ST.grad2})"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div id="m-grad-c1-dot" onclick="g('m-grad-c1-inp').click()" style="width:22px;height:22px;border-radius:50%;background:${ST.grad1};border:2px solid var(--bd2);cursor:pointer"></div>
        <span style="font-size:11px;color:var(--tx2);flex:1">Colour 1</span>
        <span id="m-grad-c1-hex" style="font-size:10px;color:var(--gd);font-family:monospace">${ST.grad1.toUpperCase()}</span>
        <input type="color" id="m-grad-c1-inp" value="${ST.grad1}" style="opacity:0;width:0;height:0;position:absolute" oninput="onGradColor(1,this.value)">
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div id="m-grad-c2-dot" onclick="g('m-grad-c2-inp').click()" style="width:22px;height:22px;border-radius:50%;background:${ST.grad2};border:2px solid var(--bd2);cursor:pointer"></div>
        <span style="font-size:11px;color:var(--tx2);flex:1">Colour 2</span>
        <span id="m-grad-c2-hex" style="font-size:10px;color:var(--gd);font-family:monospace">${ST.grad2.toUpperCase()}</span>
        <input type="color" id="m-grad-c2-inp" value="${ST.grad2}" style="opacity:0;width:0;height:0;position:absolute" oninput="onGradColor(2,this.value)">
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:11px;color:var(--tx2);flex:1">Direction</span>
        <span id="m-grad-angle-v" style="font-size:10px;color:var(--gd);font-family:monospace">${ST.gradAngle}°</span>
      </div>
      <input id="m-grad-angle-sl" type="range" min="0" max="360" value="${ST.gradAngle}" oninput="onGradAngle(this.value)" style="width:100%;-webkit-appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,.12);outline:none">
    </div>
    <div id="m-bg-photo" class="m-bg-section" data-mode="photo" style="display:${ST.bgMode==='photo'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Upload</p>
      <div style="margin-bottom:12px">
        <div class="photo-drop" onclick="pickPhoto()" style="cursor:pointer">
          <img id="m-photo-thumb" class="photo-thumb" style="display:${ST.userPhoto?'block':'none'}">
          <div style="font-size:26px;margin-bottom:6px">📷</div>
          <div style="font-size:11px;color:var(--gd);font-weight:500">Tap to choose photo</div>
          <div style="font-size:9px;color:var(--tx3);margin-top:3px">Gallery · Camera · Files</div>
        </div>
        <div class="ov-row" style="margin-top:10px">
          <span class="ov-lbl">Overlay</span>
          <input type="range" class="ov-sl" id="m-photo-ov" min="0" max="90" value="${parseInt(g('photo-ov')?.value||55)}" step="5" oninput="setPhotoOverlay(this.value)">
          <span class="ov-val" id="m-photo-ov-v">${parseInt(g('photo-ov')?.value||55)}%</span>
        </div>
      </div>
    </div>
    <div id="m-bg-gallery" class="m-bg-section" data-mode="gallery" style="display:${ST.bgMode==='gallery'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:8px">Nature Photos</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
        ${(window.GALLERY_GROUPS||['All','Nature','Faith']).map(grp=>`<button class="bgmode-btn${(ST._galGroup||'All')===grp?' on':''}" onclick="setGalGroup('${grp}')">${grp==='Faith'?'✝ '+grp:'🌿 '+grp}</button>`).join('')}
      </div>
      ${GALLERY.filter(c=>(ST._galGroup||'All')==='All'||c.group===(ST._galGroup||'All')).map((c,i)=>{const ri=GALLERY.indexOf(c);return `<div onclick="loadGal(${ri})" style="border:1.5px solid ${ST.galIdx===ri?'var(--gd)':'var(--bd)'};border-radius:6px;cursor:pointer;overflow:hidden;aspect-ratio:9/16;position:relative;background:var(--bg3)">
          <img src="${c.url}" loading="lazy" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;display:block;opacity:.85" onerror="this.style.display='none'">
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);font-size:7px;color:#fff;text-align:center;padding:2px;font-weight:500">${c.name}</div>
          ${ST.galIdx===ri?'<div style="position:absolute;inset:0;border:2px solid var(--gd);border-radius:5px;pointer-events:none"></div>':''}
        </div>`;}).join('')}
      </div>
      <div class="ov-row" style="margin-top:10px">
        <span class="ov-lbl">Overlay</span>
        <input type="range" class="ov-sl" id="m-gal-ov" min="0" max="80" value="${parseInt(g('gal-ov')?.value||50)}" oninput="g('gal-ov').value=this.value;g('gal-ov-v').textContent=this.value+'%';draw()" style="flex:1;-webkit-appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,.12);outline:none">
        <span class="ov-val" id="m-gal-ov-v">${parseInt(g('gal-ov')?.value||50)}%</span>
      </div>
    </div>`;

  // Text
  g('m-text').innerHTML=`
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:8px">Font</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px">
      ${Object.entries(FONTS).map(([k,f])=>`
        <div onclick="setFont('${k}')" style="border:1.5px solid var(--bd);border-radius:8px;padding:8px 6px;cursor:pointer;text-align:center">
          <div style="font-size:11px;color:var(--tx2);font-family:${f.fam}">${f.label}</div>
          <div style="font-size:8px;color:var(--tx3)">${f.hint}</div>
        </div>`).join('')}
    </div>
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:6px">Text Colour</p>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px">
      ${TC_COLORS.map(c=>`<div onclick="setTC('${c}')" data-c="${c}" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${ST.txColor===c?'var(--gd)':'transparent'};transition:all .15s"></div>`).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <input type="color" id="m-tc-wheel" value="${ST.txColor||'#ffffff'}"
        oninput="setTC(this.value)"
        style="width:36px;height:30px;border:1px solid var(--bd2);border-radius:var(--r6);cursor:pointer;padding:2px;background:var(--bg2)">
      <span style="font-size:10px;color:var(--tx2)">Custom colour</span>
      <span style="font-size:11px;color:var(--gd);font-family:monospace;margin-left:auto">${(ST.txColor||'#fff').toUpperCase()}</span>
    </div>
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:8px">Options</p>
    <div onclick="togOpt(this.querySelector('.tog'),'showTa')" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);cursor:pointer"><span style="font-size:12px;color:var(--tx)">Show Tamil</span><div class="tog${ST.showTa?' on':''}" data-key="showTa"></div></div>
    <div onclick="togOpt(this.querySelector('.tog'),'showEn')" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);cursor:pointer"><span style="font-size:12px;color:var(--tx)">Show English</span><div class="tog${ST.showEn?' on':''}" data-key="showEn"></div></div>
    <div onclick="togOpt(this.querySelector('.tog'),'showRef')" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bd);cursor:pointer"><span style="font-size:12px;color:var(--tx)">Show Reference</span><div class="tog${ST.showRef?' on':''}" data-key="showRef"></div></div>
    <div onclick="togOpt(this.querySelector('.tog'),'textGlow')" style="display:flex;justify-content:space-between;padding:8px 0;cursor:pointer"><span style="font-size:12px;color:var(--tx)">Text Glow</span><div class="tog${ST.textGlow?' on':''}" data-key="textGlow"></div></div>
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin:12px 0 8px">Text Size</p>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="font-size:11px;color:var(--tx2);min-width:50px">Tamil</span>
      <input type="range" min="28" max="200" value="${parseInt(g('ta-size')?.value||52)}" step="2"
        oninput="g('ta-size').value=this.value;g('ta-size-v').textContent=this.value+'px';draw()"
        style="flex:1;-webkit-appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,.12);outline:none">
      <span style="font-size:11px;color:var(--gd);min-width:32px;text-align:right;font-family:monospace">${parseInt(g('ta-size')?.value||52)}px</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
      <span style="font-size:11px;color:var(--tx2);min-width:50px">English</span>
      <input type="range" min="16" max="150" value="${parseInt(g('en-size')?.value||32)}" step="2"
        oninput="g('en-size').value=this.value;g('en-size-v').textContent=this.value+'px';draw()"
        style="flex:1;-webkit-appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,.12);outline:none">
      <span style="font-size:11px;color:var(--gd);min-width:32px;text-align:right;font-family:monospace">${parseInt(g('en-size')?.value||32)}px</span>
    </div>`;

  // Verse
  g('m-verse').innerHTML=`
    <div class="vd" style="margin-bottom:10px">
      <div class="vd-ta" id="mvd-ta">${ST.verse?.ta?.substring(0,80)||'Select verse...'}</div>
      <div class="vd-ref" id="mvd-ref">${ST.verse?.tref?'— '+ST.verse.tref:''}</div>
    </div>
    <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
      <button class="bgmode-btn" onclick="prevVerse()">← Prev</button>
      <button class="bgmode-btn on" onclick="useVOTD()">⭐ VOTD</button>
      <button class="bgmode-btn" onclick="nextVerse()">Next →</button>
      <button class="bgmode-btn" onclick="shuffleVerse()" title="Random verse">🔀</button>
    </div>

    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:6px">Custom Verse</p>
    <textarea id="m-custom-ta" placeholder="Tamil verse text..." rows="2"
      style="width:100%;background:var(--bg2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:16px;padding:7px 9px;font-family:var(--tamil);resize:none;margin-bottom:5px;outline:none"></textarea>
    <input id="m-custom-en" type="text" placeholder="English verse (optional)..."
      style="width:100%;background:var(--bg2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:16px;padding:7px 9px;margin-bottom:5px;outline:none">
    <div style="display:flex;gap:5px;margin-bottom:14px">
      <input id="m-custom-ref" type="text" placeholder="Reference (e.g. John 3:16)"
        style="flex:1;background:var(--bg2);border:1px solid var(--bd2);border-radius:8px;color:var(--tx);font-size:16px;padding:7px 9px;outline:none">
      <button class="bgmode-btn on" onclick="mUseCustomVerse()" style="white-space:nowrap">✅ Use</button>
    </div>

    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:8px">📖 Bible Index — all 66 books</p>
    <input class="inp" id="mbi-search" type="search" placeholder="🔍 Book search — Genesis, யோவான்..."
      oninput="mbiSearch(this.value)" style="margin-bottom:8px" autocomplete="off">
    <div style="display:flex;gap:4px;margin-bottom:8px">
      <button class="bgmode-btn on" id="mbi-all" onclick="mbiFilter('all')">All 66</button>
      <button class="bgmode-btn" id="mbi-ot"  onclick="mbiFilter('OT')">OT 39</button>
      <button class="bgmode-btn" id="mbi-nt"  onclick="mbiFilter('NT')">NT 27</button>
    </div>
    <div id="mbi-books" style="max-height:220px;overflow-y:auto;margin-bottom:10px"></div>
    <div id="mbi-ch-area" style="display:none;margin-bottom:10px">
      <button onclick="mbiBackBooks()" class="bgmode-btn" style="margin-bottom:8px;width:auto;padding:5px 12px;font-size:10px">← Books</button>
      <div id="mbi-ch-title" style="font-size:11px;font-weight:600;color:var(--gd);margin-bottom:8px"></div>
      <div id="mbi-ch-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;max-height:160px;overflow-y:auto"></div>
    </div>
    <div id="mbi-v-area" style="display:none;margin-bottom:10px">
      <button onclick="mbiBackCh()" class="bgmode-btn" style="margin-bottom:8px;width:auto;padding:5px 12px;font-size:10px">← Chapters</button>
      <div id="mbi-v-title" style="font-size:11px;font-weight:600;color:var(--gd);margin-bottom:8px"></div>
      <div id="mbi-v-loading" style="text-align:center;padding:16px;color:var(--tx3);display:none">
        <div style="width:16px;height:16px;border:2px solid var(--bd2);border-top-color:var(--gd);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 6px"></div>Loading...
      </div>
      <div id="mbi-v-list" style="max-height:220px;overflow-y:auto"></div>
    </div>

    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin:14px 0 8px;padding-top:10px;border-top:1px solid var(--bd)">⭐ Quick Verses</p>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
      ${VERSE_TAGS.map(t=>`<button class="bgmode-btn m-vtag${(ST._verseTag||'All')===t?' on':''}" data-tag="${t}" onclick="setVerseTag('${t}',this)">${t}</button>`).join('')}
    </div>
    <div id="m-verse-list">
      ${QUICK_VERSES.map((v,i)=>({v,i})).filter(({v})=>(ST._verseTag||'All')==='All'||(v.tags&&v.tags.includes(ST._verseTag||'All'))).map(({v,i})=>`
        <div class="vi${ST.verseIdx===i?' on':''}" data-idx="${i}" onclick="selVerse(${i})">
          <div class="vi-ref">${v.tref} · ${v.ref}</div>
          <div class="vi-ta">${(v.ta||v.en||'').substring(0,70)}${(v.ta||v.en||'').length>70?'…':''}</div>
        </div>`).join('')}
    </div>`;

  // Wire mobile bible index after render
  setTimeout(()=>{
    mbiRenderBooks();
  }, 50);

  // Export
  g('m-export').innerHTML=`
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx2);margin-bottom:8px">Download</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px">
      <button class="exp-btn e-png" onclick="dlIG('png')">↓ PNG</button>
      <button class="exp-btn e-jpg" onclick="dlIG('jpg')">↓ JPG</button>
      <button class="exp-btn e-webp" onclick="dlIG('webp')">↓ WebP</button>
      <button class="exp-btn e-copy" onclick="copyImg()">📋 Copy</button>
    </div>
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Share</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:12px">
      <button class="sh sh-wa" onclick="shareWA()">🟢 WhatsApp</button>
      <button class="sh sh-ig" onclick="shareApp('ig')">📸 Instagram</button>
      <button class="sh sh-yt" onclick="shareApp('yt')">▶ YouTube</button>
      <button class="sh sh-nat" onclick="shareNative()">↗ Share</button>
    </div>
    <button onclick="if(confirm('Reset design to default?')){localStorage.removeItem('enjc_studio_state');location.reload();}" style="width:100%;border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:8px;font-size:11px;color:#fca5a5;background:transparent;cursor:pointer;font-family:var(--sans);margin-bottom:10px">↺ Reset Design</button>
    <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">📐 Canvas Size</p>
    <div style="display:flex;flex-direction:column;gap:4px">
      ${Object.entries(SIZES).map(([k,s])=>`
        <button data-sz="${k}" onclick="setSz(this,'${k}')" style="border-radius:8px;padding:8px 10px;font-size:11px;border:1.5px solid ${ST.sz===k?'var(--gd)':'var(--bd)'};background:${ST.sz===k?'var(--gdm)':'transparent'};color:${ST.sz===k?'var(--gd)':'var(--tx2)'};cursor:pointer;font-family:var(--sans);text-align:left;display:flex;justify-content:space-between;transition:all .15s">
          <span>${k} ${s.label}</span><span style="opacity:.5;font-size:9px">${s.hint}</span>
        </button>`).join('')}
    </div>`;
}

// ── MISSING FUNCTIONS ──────────────────────────────────────────────────────────

export function setSz(el, sz){
  ST.sz = sz;
  // Update topbar buttons
  document.querySelectorAll('.tb-sz').forEach(btn=>{
    btn.classList.toggle('on', btn.dataset.sz === sz);
  });
  // Update mobile buttons
  document.querySelectorAll('[data-sz]').forEach(btn=>{
    btn.style.borderColor = btn.dataset.sz === sz ? 'var(--gd)' : 'var(--bd)';
    btn.style.background = btn.dataset.sz === sz ? 'var(--gdm)' : 'transparent';
    btn.style.color = btn.dataset.sz === sz ? 'var(--gd)' : 'var(--tx2)';
  });
  debounceDraw();
}


export function setBG(mode, redraw=true){
  ST.bgMode = mode;
  // Update ALL bgmode-btn buttons (desktop + mobile)
  document.querySelectorAll('.bgmode-btn').forEach(btn=>{
    const t = btn.textContent;
    const btnMode = t.includes('Colour') ? 'solid' :
                    t.includes('Gradient') ? 'gradient' :
                    t.includes('Photo') ? 'photo' :
                    t.includes('Gallery') ? 'gallery' : null;
    if(btnMode) btn.classList.toggle('on', btnMode === mode);
  });
  // Show/hide desktop sections
  ['solid','gradient','photo','gallery'].forEach(m=>{
    const el = g('bg-'+m);
    if(el) el.style.display = m === mode ? 'block' : 'none';
  });
  // Show/hide mobile sections (exist when BG sheet is open)
  ['solid','gradient','photo','gallery'].forEach(m=>{
    const el = g('m-bg-'+m);
    if(el) el.style.display = m === mode ? 'block' : 'none';
  });
  if(redraw) debounceDraw();
}

export function togOpt(togEl, key){
  snapshotST();
  const on = togEl.classList.toggle('on');
  ST[key] = on;
  debounceDraw();
}

export function prevVerse(){
  ST.verseIdx = ST.verseIdx > 0 ? ST.verseIdx - 1 : QUICK_VERSES.length - 1;
  ST.verse = QUICK_VERSES[ST.verseIdx];
  updateVerseDisplay();
  debounceDraw();
}

export function nextVerse(){
  ST.verseIdx = (ST.verseIdx + 1) % QUICK_VERSES.length;
  ST.verse = QUICK_VERSES[ST.verseIdx];
  updateVerseDisplay();
  debounceDraw();
}

export function useVOTD(){
  ST.verseIdx = 0;
  ST.verse = QUICK_VERSES[0];
  updateVerseDisplay();
  debounceDraw();
}

export function syncMobileBG(){
  const el = g('m-bg');
  if(!el) return;
  // Rebuild the BG panel HTML with current ST values
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px">
      <button onclick="setBG('solid')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='solid'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='solid'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='solid'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">🎨</span>Colour</button>
      <button onclick="setBG('gradient')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='gradient'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='gradient'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='gradient'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">🌈</span>Gradient</button>
      <button onclick="setBG('photo')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='photo'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='photo'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='photo'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">📷</span>My Photo</button>
      <button onclick="setBG('gallery')" style="padding:12px 8px;border-radius:10px;border:2px solid ${ST.bgMode==='gallery'?'var(--gd)':'var(--bd)'};background:${ST.bgMode==='gallery'?'var(--gdm)':'var(--bg3)'};color:${ST.bgMode==='gallery'?'var(--gd)':'var(--tx2)'};font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:all .15s;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="font-size:20px">🌄</span>Gallery</button>
    </div>
    <div id="m-bg-solid" class="m-bg-section" data-mode="solid" style="display:${ST.bgMode==='solid'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Colour Presets</p>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">
        ${PRESETS.map(c=>`<div onclick="setColorHex('${c}')" style="width:24px;height:24px;border-radius:4px;background:${c};cursor:pointer;border:2px solid ${ST.bgColor.toLowerCase()===c.toLowerCase()?'var(--gd)':'transparent'};transition:all .18s"></div>`).join('')}
      </div>
    </div>
    <div id="m-bg-gradient" class="m-bg-section" data-mode="gradient" style="display:${ST.bgMode==='gradient'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Gradient</p>
      <div id="m-grad-preview" style="height:56px;border-radius:12px;border:1px solid var(--bd2);margin-bottom:10px;background:linear-gradient(${ST.gradAngle}deg,${ST.grad1},${ST.grad2})"></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div id="m-grad-c1-dot" onclick="g('m-grad-c1-inp').click()" style="width:22px;height:22px;border-radius:50%;background:${ST.grad1};border:2px solid var(--bd2);cursor:pointer"></div>
        <span style="font-size:11px;color:var(--tx2);flex:1">Colour 1</span>
        <span id="m-grad-c1-hex" style="font-size:10px;color:var(--gd);font-family:monospace">${ST.grad1.toUpperCase()}</span>
        <input type="color" id="m-grad-c1-inp" value="${ST.grad1}" style="opacity:0;width:0;height:0;position:absolute" oninput="onGradColor(1,this.value)">
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <div id="m-grad-c2-dot" onclick="g('m-grad-c2-inp').click()" style="width:22px;height:22px;border-radius:50%;background:${ST.grad2};border:2px solid var(--bd2);cursor:pointer"></div>
        <span style="font-size:11px;color:var(--tx2);flex:1">Colour 2</span>
        <span id="m-grad-c2-hex" style="font-size:10px;color:var(--gd);font-family:monospace">${ST.grad2.toUpperCase()}</span>
        <input type="color" id="m-grad-c2-inp" value="${ST.grad2}" style="opacity:0;width:0;height:0;position:absolute" oninput="onGradColor(2,this.value)">
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:11px;color:var(--tx2);flex:1">Direction</span>
        <span id="m-grad-angle-v" style="font-size:10px;color:var(--gd);font-family:monospace">${ST.gradAngle}°</span>
      </div>
      <input id="m-grad-angle-sl" type="range" min="0" max="360" value="${ST.gradAngle}" oninput="onGradAngle(this.value)" style="width:100%;-webkit-appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,.12);outline:none">
    </div>
    <div id="m-bg-photo" class="m-bg-section" data-mode="photo" style="display:${ST.bgMode==='photo'?'block':'none'}">
      <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin-bottom:8px">Upload</p>
      <div style="margin-bottom:12px">
        <div class="photo-drop" onclick="pickPhoto()" style="cursor:pointer">
          <img id="m-photo-thumb" class="photo-thumb" style="display:${ST.userPhoto?'block':'none'}">
          <div style="font-size:26px;margin-bottom:6px">📷</div>
          <div style="font-size:11px;color:var(--gd);font-weight:500">Tap to choose photo</div>
          <div style="font-size:9px;color:var(--tx3);margin-top:3px">Gallery · Camera · Files</div>
        </div>
        <div class="ov-row" style="margin-top:10px">
          <span class="ov-lbl">Overlay</span>
          <input type="range" class="ov-sl" id="m-photo-ov" min="0" max="90" value="${parseInt(g('photo-ov')?.value||55)}" step="5" oninput="setPhotoOverlay(this.value)">
          <span class="ov-val" id="m-photo-ov-v">${parseInt(g('photo-ov')?.value||55)}%</span>
        </div>
      </div>
    </div>
    <div id="m-bg-gallery" class="m-bg-section" data-mode="gallery" style="display:${ST.bgMode==='gallery'?'block':'none'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <p style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--tx3);margin:0">Gallery</p>
        <button onclick="addToGallery()" style="background:var(--gd);border:none;border-radius:8px;padding:5px 12px;font-size:11px;font-weight:700;color:#07090f;cursor:pointer">+ Upload</button>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
        ${(window.GALLERY_GROUPS||['All','My Photos','Nature','Faith']).map(grp=>`<button class="bgmode-btn${(ST._galGroup||'All')===grp?' on':''}" onclick="setGalGroup('${grp}')">${grp==='Faith'?'✝ '+grp:grp==='My Photos'?'📱 '+grp:'🌿 '+grp}</button>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${GALLERY.filter(c=>(ST._galGroup||'All')==='All'||c.group===(ST._galGroup||'All')).map((c,i)=>{const ri=GALLERY.indexOf(c);return `<div onclick="loadGal(${ri})" style="border:1.5px solid ${ST.galIdx===ri?'var(--gd)':'var(--bd)'};border-radius:6px;cursor:pointer;overflow:hidden;aspect-ratio:9/16;position:relative;background:var(--bg3)">
          <img src="${c.url}" loading="lazy" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;display:block;opacity:.85" onerror="this.style.display='none'">
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);font-size:7px;color:#fff;text-align:center;padding:2px;font-weight:500">${c.name}</div>
          ${ST.galIdx===ri?'<div style="position:absolute;inset:0;border:2px solid var(--gd);border-radius:5px;pointer-events:none"></div>':''}
        </div>`;}).join('')}
      </div>
      <div class="ov-row" style="margin-top:10px">
        <span class="ov-lbl">Overlay</span>
        <input type="range" class="ov-sl" id="m-gal-ov" min="0" max="80" value="${parseInt(g('gal-ov')?.value||50)}" oninput="g('gal-ov').value=this.value;g('gal-ov-v').textContent=this.value+'%';draw()" style="flex:1;-webkit-appearance:none;height:3px;border-radius:99px;background:rgba(255,255,255,.12);outline:none">
        <span class="ov-val" id="m-gal-ov-v">${parseInt(g('gal-ov')?.value||50)}%</span>
      </div>
    </div>`;
}


// ── MISSING FUNCTIONS ─────────────────────────────────────────────

export function buildSzBtns(){
  const el = g('sz-btns');
  if(!el) return;
  el.innerHTML = Object.entries(SIZES).map(([k,s])=>`
    <button data-sz="${k}" onclick="setSz(this,'${k}')"
      class="${ST.sz===k?'on':''}"
      style="border-radius:8px;padding:8px 10px;font-size:11px;
             border:1.5px solid ${ST.sz===k?'var(--gd)':'var(--bd)'};
             background:${ST.sz===k?'var(--gdm)':'transparent'};
             color:${ST.sz===k?'var(--gd)':'var(--tx2)'};
             cursor:pointer;font-family:var(--sans);width:100%;
             text-align:left;display:flex;justify-content:space-between;
             margin-bottom:4px;transition:all .15s">
      <span>${k} — ${s.label}</span>
      <span style="opacity:.5;font-size:9px">${s.hint}</span>
    </button>`).join('');
}

export function buildQuickTpl(){
  // Quick-template strip (not currently used in HTML, safe no-op if el absent)
  const el = g('quick-tpl');
  if(!el) return;
  el.innerHTML = TEMPLATES.map(t=>`
    <div class="tpl${ST.activeTpl===t.id?' on':''}" id="qtpl-${t.id}"
         onclick='applyTemplate(${JSON.stringify(t)})'>
      <div style="width:32px;height:40px;background:${t.bg};border-radius:4px;
                  display:flex;align-items:center;justify-content:center;
                  font-size:8px;color:${t.accent}">${t.name}</div>
    </div>`).join('');
}

export function buildVerseTags(){
  const el = g('verse-tag-row');
  if(!el) return;
  el.innerHTML = VERSE_TAGS.map(t=>`
    <button class="bgmode-btn vtag${(ST._verseTag||'All')===t?' on':''}"
      onclick="setVerseTag('${t}',this)">${t}</button>`).join('');
}

export function buildQuickVerses(){
  const el = g('quick-verses');
  if(!el) return;
  const activeTag = ST._verseTag||'All';
  const filtered = QUICK_VERSES.map((v,i)=>({v,i})).filter(({v})=>
    activeTag==='All' || (v.tags&&v.tags.includes(activeTag))
  );
  el.innerHTML = filtered.map(({v,i})=>`
    <div class="vi${ST.verseIdx===i?' on':''}" data-idx="${i}" onclick="selVerse(${i})">
      <div class="vi-ref">${v.tref} · ${v.ref}</div>
      <div class="vi-ta">${(v.ta||v.en||'').substring(0,70)}${(v.ta||v.en||'').length>70?'…':''}</div>
    </div>`).join('');
}

export function setVerseTag(tag, el){
  ST._verseTag = tag;
  document.querySelectorAll('.vtag').forEach(b=>b.classList.remove('on'));
  if(el) el.classList.add('on');
  buildQuickVerses();
  // sync mobile
  document.querySelectorAll('.m-vtag').forEach(b=>b.classList.toggle('on', b.dataset.tag===tag));
  rebuildMobileVerseList();
}

export function shuffleVerse(){
  const tag = ST._verseTag||'All';
  const pool = tag==='All' ? QUICK_VERSES : QUICK_VERSES.filter(v=>v.tags&&v.tags.includes(tag));
  if(!pool.length) return;
  const pick = Math.floor(Math.random()*pool.length);
  const idx  = QUICK_VERSES.indexOf(pool[pick]);
  selVerse(idx>=0?idx:0);
  toast('🔀 Random verse!');
}

export function useCustomVerse(){
  const ta  = (g('custom-ta')?.value||'').trim();
  const en  = (g('custom-en')?.value||'').trim();
  const ref = (g('custom-ref')?.value||'').trim();
  if(!ta && !en){ toast('⚠ Enter Tamil or English text'); return; }
  const v = {ta, tref:ref, en, ref, tags:[]};
  QUICK_VERSES.unshift(v);
  selVerse(0);
  toast('✅ Custom verse applied!');
}

export function mUseCustomVerse(){
  const ta =(g('m-custom-ta')?.value||'').trim();
  const en =(g('m-custom-en')?.value||'').trim();
  const ref=(g('m-custom-ref')?.value||'').trim();
  if(!ta&&!en){toast('⚠ Enter Tamil or English text');return;}
  const v={ta,tref:ref,en,ref,tags:[]};
  QUICK_VERSES.unshift(v); selVerse(0);
  toast('✅ Custom verse applied!');
}

let LOCAL_TAMIL_DB = null;
let LOCAL_TAMIL_FULL = null;

async function loadLocalTamilFile(path){
  try{
    const res = await fetch(path);
    if(!res.ok) return null;
    return await res.json();
  }catch(e){
    return null;
  }
}

async function getLocalTamilText(bookId, ch, verse){
  const book = BOOKS.find(b=>b.id===bookId);
  const bookNum = book?.n || (BOOKS.findIndex(b=>b.id===bookId)+1);
  const key = `${bookNum}_${ch}`;

  if(LOCAL_TAMIL_DB===null){
    LOCAL_TAMIL_DB = await loadLocalTamilFile('data/tamil-bible.json') || {};
  }
  if(LOCAL_TAMIL_DB?.[key]){
    const item = LOCAL_TAMIL_DB[key].find(a=>a[0]===verse);
    if(item && item[1]) return item[1].trim();
  }

  if(LOCAL_TAMIL_FULL===null){
    LOCAL_TAMIL_FULL = await loadLocalTamilFile('data/tamil_full.json') || {};
  }
  if(LOCAL_TAMIL_FULL?.[key]){
    const item = LOCAL_TAMIL_FULL[key].find(a=>a[0]===verse);
    if(item && item[1]) return item[1].trim();
  }

  return '';
}

async function getLocalTamilChapter(bookId, ch){
  const book = BOOKS.find(b=>b.id===bookId);
  const bookNum = book?.n || (BOOKS.findIndex(b=>b.id===bookId)+1);
  const key = `${bookNum}_${ch}`;

  if(LOCAL_TAMIL_DB===null){
    LOCAL_TAMIL_DB = await loadLocalTamilFile('data/tamil-bible.json') || {};
  }
  if(LOCAL_TAMIL_DB?.[key]){
    return LOCAL_TAMIL_DB[key].map(a=>a[1]?.trim()||'');
  }

  if(LOCAL_TAMIL_FULL===null){
    LOCAL_TAMIL_FULL = await loadLocalTamilFile('data/tamil_full.json') || {};
  }
  if(LOCAL_TAMIL_FULL?.[key]){
    return LOCAL_TAMIL_FULL[key].map(a=>a[1]?.trim()||'');
  }

  return null;
}

function rebuildMobileVerseList(){
  const el = g('m-verse-list');
  if(!el) return;
  const tag = ST._verseTag||'All';
  const filtered = QUICK_VERSES.map((v,i)=>({v,i})).filter(({v})=>
    tag==='All' || (v.tags&&v.tags.includes(tag))
  );
  el.innerHTML = filtered.map(({v,i})=>`
    <div class="vi" data-idx="${i}" onclick="selVerse(${i})">
      <div class="vi-ref">${v.tref} · ${v.ref}</div>
      <div class="vi-ta">${(v.ta||v.en||'').substring(0,70)}${(v.ta||v.en||'').length>70?'…':''}</div>
    </div>`).join('');
}

export function selVerse(i){
  ST.verseIdx = i;
  ST.verse = QUICK_VERSES[i];
  if(!ST.verse) return;
  const ta = ST.verse.ta||ST.verse.en||'';
  const ref = ST.verse.tref||ST.verse.ref||'';
  // Update desktop verse card
  const vdTa = g('vd-ta'); if(vdTa) vdTa.textContent = ta;
  const vdRef = g('vd-ref'); if(vdRef) vdRef.textContent = '— '+ref;
  // Update mobile verse card
  const mvdTa = g('mvd-ta'); if(mvdTa) mvdTa.textContent = ta.substring(0,90)+(ta.length>90?'…':'');
  const mvdRef = g('mvd-ref'); if(mvdRef) mvdRef.textContent = '— '+ref;
  // Highlight selected in all verse lists
  document.querySelectorAll('.vi').forEach(el=>{
    const vidx = parseInt(el.dataset.idx);
    el.classList.toggle('on', vidx===i);
  });
  debounceDraw();
}

export function updateBadges(){
  const el = g('info-badges');
  if(!el) return;
  const sz = SIZES[ST.sz]||SIZES['9:16'];
  el.innerHTML = '<span class="badge">'+sz.w+'×'+sz.h+'</span><span class="badge">'+sz.label+'</span>';
}

// Update all verse display widgets without full panel rebuild
export function updateVerseDisplay(){
  const v = ST.verse;
  if(!v) return;
  const ta = v.ta||v.en||''; const ref = v.tref||v.ref||'';
  // Desktop verse card
  const vdTa=g('vd-ta'); if(vdTa) vdTa.textContent=ta;
  const vdRef=g('vd-ref'); if(vdRef) vdRef.textContent='— '+ref;
  // Mobile verse card (if sheet is open)
  const mvdTa=g('mvd-ta'); if(mvdTa) mvdTa.textContent=ta.substring(0,90)+(ta.length>90?'…':'');
  const mvdRef=g('mvd-ref'); if(mvdRef) mvdRef.textContent='— '+ref;
  // Quick verse list highlight
  document.querySelectorAll('#quick-verses .vi, #m-verse .vi').forEach((el,i)=>
    el.classList.toggle('on', i===ST.verseIdx)
  );
}

// ── CANVAS TOUCH ──────────────────────────────────────────────────
let _tsX=0, _tsT=0;
export function onTS(e){
  _tsX = e.touches[0]?.clientX||0;
  _tsT = Date.now();
}
export function onTE(e){
  const dx = (e.changedTouches[0]?.clientX||0) - _tsX;
  const dt = Date.now() - _tsT;
  if(dt < 400 && Math.abs(dx) > 40){
    dx < 0 ? nextVerse() : prevVerse();
  } else if(dt < 300 && Math.abs(dx) < 15){
    nextVerse(); // tap = cycle
  }
}

// ── BIBLE INDEX (desktop) ─────────────────────────────────────────
export function biRenderBooks(){
  const el = g('bi-books');
  if(!el) return;
  const filter = BI._filter||'all';
  const search = (BI._search||'').toLowerCase();
  const list = BOOKS.filter(b=>{
    if(filter==='OT' && b.t!=='OT') return false;
    if(filter==='NT' && b.t!=='NT') return false;
    if(search && !b.en.toLowerCase().includes(search) && !b.ta.includes(search)) return false;
    return true;
  });
  el.innerHTML = list.map(b=>`
    <div class="bi-book" onclick="biSelectBook('${b.id}')"
         style="display:flex;justify-content:space-between;padding:6px 8px;
                border-radius:6px;cursor:pointer;font-size:11px;
                border-bottom:1px solid var(--bd);transition:background .15s"
         onmouseover="this.style.background='var(--bg2)'"
         onmouseout="this.style.background='transparent'">
      <span style="color:var(--tx)">${b.ta}</span>
      <span style="color:var(--tx3);font-size:10px">${b.en}</span>
    </div>`).join('');
}

export function biSearch(q){
  BI._search = q;
  biRenderBooks();
}

export function biFilter(f){
  BI._filter = f;
  ['all','OT','NT'].forEach(k=>{
    const btn = g('bi-'+k.toLowerCase());
    if(btn) btn.classList.toggle('on', k===f||k.toLowerCase()===f);
  });
  biRenderBooks();
}

export function biSelectBook(bookId){
  BI.book = BOOKS.find(b=>b.id===bookId);
  if(!BI.book) return;
  g('bi-books').style.display='none';
  const ca = g('bi-ch-area'); if(ca) ca.style.display='block';
  const ct = g('bi-ch-title'); if(ct) ct.textContent = BI.book.ta+' — '+BI.book.en;
  const cg = g('bi-ch-grid');
  if(cg){
    cg.innerHTML = Array.from({length:BI.book.ch},(_,i)=>`
      <button onclick="biSelectCh(${i+1})"
        style="border:1px solid var(--bd);border-radius:6px;padding:6px;
               font-size:11px;color:var(--tx2);background:transparent;
               cursor:pointer;font-family:var(--sans);transition:all .15s"
        onmouseover="this.style.background='var(--bg2)'"
        onmouseout="this.style.background='transparent'">${i+1}</button>`).join('');
  }
}

export function biBackBooks(){
  const ca = g('bi-ch-area'); if(ca) ca.style.display='none';
  const va = g('bi-v-area'); if(va) va.style.display='none';
  const bb = g('bi-books'); if(bb) bb.style.display='';
}

export async function biSelectCh(ch){
  BI.ch = ch;
  g('bi-ch-area').style.display='none';
  const va = g('bi-v-area'); if(va) va.style.display='block';
  const vt = g('bi-v-title'); if(vt) vt.textContent = BI.book.ta+' '+ch;
  const vl = g('bi-v-list'); if(vl) vl.innerHTML='';
  const vld = g('bi-v-loading'); if(vld) vld.style.display='block';

  // Load local Tamil data first — show immediately without waiting for API
  const localTexts = await getLocalTamilChapter(BI.book.id, ch) || [];
  if(vld) vld.style.display='none';

  function renderVerseList(texts, enVerses){
    const versesToShow = enVerses.length
      ? enVerses
      : texts.map((text,i)=>({verse:i+1,text}));
    if(!versesToShow.length){
      if(vl) vl.innerHTML='<div style="padding:12px;color:var(--tx3);font-size:11px">Could not load — check connection.</div>';
      return;
    }
    if(vl) vl.innerHTML = versesToShow.map(v=>{
      const tamilText = texts[v.verse-1] || '';
      const displayText = tamilText || v.text?.trim() || '';
      const clickText = v.text?.trim() || tamilText || '';
      const safe = encodeURIComponent(clickText);
      return `
        <div class="vi" onclick="biUseVerse('${BI.book.id}',${ch},${v.verse},decodeURIComponent('${safe}'),'${BI.book.en}')"
             style="padding:8px;border-bottom:1px solid var(--bd);cursor:pointer;font-size:11px;color:var(--tx2)">
          <span style="color:var(--gd);font-size:10px;font-weight:600">${v.verse}.</span>
          ${displayText}
        </div>`;
    }).join('');
  }

  // Show Tamil verses immediately if local data available
  if(localTexts.length){
    renderVerseList(localTexts, []);
  }

  // Fetch English in background and enhance display (non-blocking)
  fetch(`https://bible-api.com/${BI.book.id}+${ch}?translation=kjv`)
    .then(r=>r.ok?r.json():null)
    .catch(()=>null)
    .then(englishData=>{
      const verses = englishData?.verses||[];
      if(verses.length){
        renderVerseList(localTexts, verses);
      } else if(!localTexts.length){
        if(vl) vl.innerHTML='<div style="padding:12px;color:var(--tx3);font-size:11px">Could not load — check connection.</div>';
      }
    });
}

export function biBackCh(){
  const va = g('bi-v-area'); if(va) va.style.display='none';
  const ca = g('bi-ch-area'); if(ca) ca.style.display='block';
}

export async function biUseVerse(bookId, ch, v, enText, enBook){
  const book = BOOKS.find(b=>b.id===bookId);
  const ref  = `${enBook} ${ch}:${v}`;
  const tref = `${book?.ta||enBook} ${ch}:${v}`;
  // Show English immediately while Tamil loads
  const verse = {ta:'', tref, en:enText.trim(), ref};
  QUICK_VERSES.unshift(verse);
  ST.verse = verse; ST.verseIdx = 0;
  buildQuickVerses();
  selVerse(0); // highlight the newly added verse in quick list
  const vdTa = g('vd-ta'); if(vdTa) vdTa.textContent = enText.trim();
  const vdRef = g('vd-ref'); if(vdRef) vdRef.textContent = '— '+ref;
  debounceDraw();
  toast('📖 '+ref+' — fetching Tamil…');

  const localThai = await getLocalTamilText(bookId, ch, v);
  if(localThai){
    verse.ta = localThai;
    if(ST.verse===verse){ debounceDraw(); }
    const vdTa2=g('vd-ta'); if(vdTa2) vdTa2.textContent=verse.ta;
    const mvd=g('mvd-ta'); if(mvd) mvd.textContent=verse.ta.substring(0,90);
    buildQuickVerses();
    toast('✅ '+tref+' loaded!');
    return;
  }

  const bkIdx = BOOKS.find(b=>b.id===bookId)?.n || (BOOKS.findIndex(b=>b.id===bookId)+1);
  fetch(`https://bolls.life/get-text/TAMILBSI/${bkIdx}/${ch}/${v}/`)
    .then(r=>r.json())
    .then(d=>{
      const taText = (Array.isArray(d)?d[0]?.text:d?.text)||'';
      if(taText){
        verse.ta = taText.replace(/<[^>]+>/g,'').trim();
        if(ST.verse===verse){ debounceDraw(); }
        const vdTa2=g('vd-ta'); if(vdTa2) vdTa2.textContent=verse.ta;
        const mvd=g('mvd-ta'); if(mvd) mvd.textContent=verse.ta.substring(0,90);
        buildQuickVerses(); // refresh list so vi-ta shows Tamil
        toast('✅ '+tref+' loaded!');
      } else {
        verse.ta = enText.trim(); // fallback: use English as Tamil
        buildQuickVerses();
      }
    })
    .catch(()=>{ /* Tamil unavailable — English already shown */ });
}

// ── BIBLE INDEX (mobile, mbi*) ─────────────────────────────────────
export function mbiRenderBooks(){
  const el = g('mbi-books');
  if(!el) return;
  const filter = BI._filter||'all';
  const search = (BI._search||'').toLowerCase();
  const list = BOOKS.filter(b=>{
    if(filter==='OT' && b.t!=='OT') return false;
    if(filter==='NT' && b.t!=='NT') return false;
    if(search && !b.en.toLowerCase().includes(search) && !b.ta.includes(search)) return false;
    return true;
  });
  el.innerHTML = list.map(b=>`
    <div onclick="mbiSelectBook('${b.id}')"
         style="display:flex;justify-content:space-between;padding:7px 6px;
                border-radius:6px;cursor:pointer;font-size:11px;
                border-bottom:1px solid var(--bd)">
      <span style="color:var(--tx)">${b.ta}</span>
      <span style="color:var(--tx3);font-size:10px">${b.en}</span>
    </div>`).join('');
}

export function mbiSearch(q){
  BI._search = q;
  mbiRenderBooks();
}

export function mbiFilter(f){
  BI._filter = f;
  ['all','OT','NT'].forEach(k=>{
    const btn = g('mbi-'+k.toLowerCase());
    if(btn) btn.classList.toggle('on', k===f||k.toLowerCase()===f);
  });
  mbiRenderBooks();
}

export function mbiSelectBook(bookId){
  BI.book = BOOKS.find(b=>b.id===bookId);
  if(!BI.book) return;
  const el = g('mbi-books'); if(el) el.style.display='none';
  const ca = g('mbi-ch-area'); if(ca) ca.style.display='block';
  const ct = g('mbi-ch-title'); if(ct) ct.textContent = BI.book.ta+' — '+BI.book.en;
  const cg = g('mbi-ch-grid');
  if(cg){
    cg.innerHTML = Array.from({length:BI.book.ch},(_,i)=>`
      <button onclick="mbiSelectCh(${i+1})"
        style="border:1px solid var(--bd);border-radius:6px;padding:6px;
               font-size:11px;color:var(--tx2);background:transparent;
               cursor:pointer;font-family:var(--sans)">${i+1}</button>`).join('');
  }
}

export function mbiBackBooks(){
  const el = g('mbi-books'); if(el) el.style.display='';
  const ca = g('mbi-ch-area'); if(ca) ca.style.display='none';
  const va = g('mbi-v-area'); if(va) va.style.display='none';
}

export async function mbiSelectCh(ch){
  BI.ch = ch;
  const ca = g('mbi-ch-area'); if(ca) ca.style.display='none';
  const va = g('mbi-v-area'); if(va) va.style.display='block';
  const vt = g('mbi-v-title'); if(vt) vt.textContent = BI.book.ta+' '+ch;
  const vl = g('mbi-v-list'); if(vl) vl.innerHTML='';
  const vld = g('mbi-v-loading'); if(vld) vld.style.display='block';

  const localTexts = await getLocalTamilChapter(BI.book.id, ch) || [];
  const englishPromise = fetch(`https://bible-api.com/${BI.book.id}+${ch}?translation=kjv`)
    .then(r=>r.ok?r.json():null)
    .catch(()=>null);

  const englishData = await englishPromise;
  if(vld) vld.style.display='none';

  const verses = englishData?.verses||[];
  const versesToShow = verses.length ? verses : localTexts.map((text,i)=>({verse:i+1,text}));
  if(vl) vl.innerHTML = versesToShow.map(v=>{
    const tamilText = localTexts[v.verse-1] || '';
    const displayText = tamilText || v.text.trim();
    const clickText = v.text?.trim() || tamilText || '';
    const safe = encodeURIComponent(clickText);
    return `
      <div class="vi" onclick="mbiUseVerse('${BI.book.id}',${ch},${v.verse},decodeURIComponent('${safe}'),'${BI.book.en}')"
           style="padding:8px;border-bottom:1px solid var(--bd);cursor:pointer;font-size:11px;color:var(--tx2)">
        <span style="color:var(--gd);font-size:10px;font-weight:600">${v.verse}.</span>
        ${displayText}
      </div>`;
  }).join('');

  if(!verses.length && !localTexts.length){
    if(vl) vl.innerHTML='<div style="padding:12px;color:var(--tx3);font-size:11px">Could not load — check connection.</div>';
  }
}

export function mbiBackCh(){
  const va = g('mbi-v-area'); if(va) va.style.display='none';
  const ca = g('mbi-ch-area'); if(ca) ca.style.display='block';
}

export function mbiUseVerse(bookId, ch, v, enText, enBook){
  biUseVerse(bookId, ch, v, enText, enBook);
}

// ── PHOTO UPLOAD ──────────────────────────────────────────────────
export function pickPhoto(){
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='image/*';
  inp.onchange = e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const img = new Image();
      img.onload = ()=>{
        ST.userPhoto = img;
        // Show thumbs
        ['photo-thumb','m-photo-thumb'].forEach(id=>{
          const th = g(id);
          if(th){ th.src = ev.target.result; th.style.display='block'; }
        });
        setBG('photo');
        debounceDraw();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

export function loadGal(idx){
  ST.galIdx = idx;
  const galItem = GALLERY[idx];
  if(!galItem) return;
  const img = new Image();
  img.crossOrigin='anonymous';
  img.onload = ()=>{ ST.galImg = img; debounceDraw(); };
  img.onerror = ()=>toast('⚠ Could not load gallery image');
  img.src = galItem.url || ('https://picsum.photos/seed/'+galItem.seed+'/1080/1920');
  setBG('gallery');
  toast('🌄 Loading '+galItem.name+'…');
  // Update gallery item selection in-place for BOTH desktop and mobile grids
  ['gal-grid','m-bg-gallery'].forEach(gridId=>{
    const grid = g(gridId);
    if(!grid) return;
    grid.querySelectorAll('[onclick*="loadGal"]').forEach((el,i)=>{
      el.style.borderColor = i===idx ? 'var(--gd)' : 'var(--bd)';
      el.style.background  = i===idx ? 'var(--gdm)' : 'transparent';
    });
  });
}

export function buildGallery(){
  const wrap = g('gal-wrap');
  const el   = g('gal-grid');
  if(!el) return;

  // Add 'My Photos' group if not already there
  if(!window.GALLERY_GROUPS.includes('My Photos')){
    window.GALLERY_GROUPS = ['All','My Photos','Nature','Faith'];
  }

  // Build group tabs if not yet built
  if(wrap && !wrap.querySelector('.gal-group-tabs')){
    const groups = window.GALLERY_GROUPS;
    const tabsEl = document.createElement('div');
    tabsEl.className = 'gal-group-tabs';
    tabsEl.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px';
    tabsEl.innerHTML = groups.map(g=>`
      <button class="bgmode-btn gal-gtab${(ST._galGroup||'All')===g?' on':''}"
        data-group="${g}" onclick="setGalGroup('${g}')">${g==='Faith'?'✝ '+g:g==='My Photos'?'📱 '+g:'🌿 '+g}</button>`
    ).join('');
    wrap.insertBefore(tabsEl, el);
  } else if(wrap) {
    wrap.querySelectorAll('.gal-gtab').forEach(b=>
      b.classList.toggle('on', b.dataset.group===(ST._galGroup||'All'))
    );
  }

  const activeGroup = ST._galGroup||'All';
  const myPhotos = (window.ST._myPhotos||[]);
  const filtered = GALLERY.map((c,i)=>({c,i}))
    .filter(({c})=> activeGroup==='All' || c.group===activeGroup);

  // My Photos section
  let myPhotosHTML = '';
  if(activeGroup==='All'||activeGroup==='My Photos'){
    const uploadBtn = `<div onclick="addToGallery()"
      style="border:2px dashed var(--gd);border-radius:6px;cursor:pointer;
             background:var(--gdm);transition:all .15s;aspect-ratio:9/16;
             position:relative;display:flex;flex-direction:column;
             align-items:center;justify-content:center;gap:4px">
      <span style="font-size:24px">+</span>
      <span style="font-size:8px;color:var(--gd);font-weight:600;text-align:center;padding:0 4px">Upload Photo</span>
    </div>`;
    const myItems = myPhotos.map((p,idx)=>{
      const galIdx = GALLERY.length + idx;
      return `<div onclick="loadGalCustom(${idx})"
        style="border:1.5px solid ${ST.galIdx===galIdx?'var(--gd)':'var(--bd)'};
               border-radius:6px;cursor:pointer;overflow:hidden;
               background:var(--bg3);aspect-ratio:9/16;position:relative">
        <img src="${p.thumb}" style="width:100%;height:100%;object-fit:cover;display:block;opacity:.85">
        <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);
                    font-size:8px;color:#fff;text-align:center;padding:3px 2px;font-weight:500">📱 ${p.name}</div>
        <button onclick="event.stopPropagation();removeMyPhoto(${idx})"
          style="position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;
                 background:rgba(255,0,0,.7);border:none;color:#fff;font-size:10px;
                 cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">✕</button>
        ${ST.galIdx===galIdx?'<div style="position:absolute;inset:0;border:2px solid var(--gd);border-radius:5px;pointer-events:none"></div>':''}
      </div>`;
    }).join('');
    myPhotosHTML = uploadBtn + myItems;
  }

  el.innerHTML = myPhotosHTML + filtered.map(({c,i})=>`
    <div onclick="loadGal(${i})"
         style="border:1.5px solid ${ST.galIdx===i?'var(--gd)':'var(--bd)'};
                border-radius:6px;cursor:pointer;overflow:hidden;
                background:var(--bg3);transition:all .15s;aspect-ratio:9/16;position:relative">
      <img src="${c.url}" loading="lazy" alt="${c.name}"
        style="width:100%;height:100%;object-fit:cover;display:block;opacity:.85"
        onerror="this.parentElement.style.opacity='.4'">
      <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.6);
                  font-size:8px;color:#fff;text-align:center;padding:3px 2px;font-weight:500">${c.label} ${c.name}</div>
      ${ST.galIdx===i?'<div style="position:absolute;inset:0;border:2px solid var(--gd);border-radius:5px;pointer-events:none"></div>':''}
    </div>`).join('');
}

export function addToGallery(){
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='image/*'; inp.multiple=true;
  inp.onchange = e=>{
    const files = [...e.target.files];
    if(!files.length) return;
    if(!window.ST._myPhotos) window.ST._myPhotos = [];
    let loaded = 0;
    files.forEach(file=>{
      const reader = new FileReader();
      reader.onload = ev=>{
        const img = new Image();
        img.onload = ()=>{
          window.ST._myPhotos.push({
            name: file.name.replace(/\.[^.]+$/,'').substring(0,12),
            thumb: ev.target.result,
            img: img,
          });
          loaded++;
          if(loaded === files.length){
            ST._galGroup = 'My Photos';
            buildGallery();
            // Auto-load first uploaded
            loadGalCustom(window.ST._myPhotos.length - files.length);
            toast(`📱 ${files.length} photo${files.length>1?'s':''} added!`);
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  inp.click();
}

export function loadGalCustom(idx){
  const photos = window.ST._myPhotos||[];
  if(!photos[idx]) return;
  const galIdx = GALLERY.length + idx;
  ST.galIdx = galIdx;
  ST.galImg = photos[idx].img;
  setBG('gallery');
  debounceDraw();
  // Highlight
  buildGallery();
  toast('📱 '+photos[idx].name);
}

export function removeMyPhoto(idx){
  if(!window.ST._myPhotos) return;
  window.ST._myPhotos.splice(idx,1);
  if(ST.galIdx === GALLERY.length + idx) {
    ST.galIdx = -1; ST.galImg = null;
  }
  buildGallery();
  debounceDraw();
}

export function setGalGroup(group){
  ST._galGroup = group;
  buildGallery();
}

export function buildGradPresets(){
  const el = g('grad-presets-grid');
  if(!el) return;
  const presets=[
    ['#1a0a3a','#0a1a3a'],['#1a0500','#3a0a00'],['#020d1a','#0a2a1a'],
    ['#020208','#1a0820'],['#1a1500','#3a2a00'],['#0a0a1a','#1a0a2a'],
    ['#0d2447','#1a0a3a'],['#14451f','#061009'],
  ];
  el.innerHTML = presets.map(([c1,c2])=>`
    <div onclick="setGradPreset('${c1}','${c2}')"
         style="height:32px;border-radius:6px;cursor:pointer;
                border:1px solid var(--bd);
                background:linear-gradient(135deg,${c1},${c2});
                transition:all .15s"
         onmouseover="this.style.borderColor='var(--gd)'"
         onmouseout="this.style.borderColor='var(--bd)'"></div>`).join('');
}

export function setGradPreset(c1,c2){
  ST.grad1=c1; ST.grad2=c2;
  const i1=g('grad-c1-inp'); if(i1) i1.value=c1;
  const i2=g('grad-c2-inp'); if(i2) i2.value=c2;
  const d1=g('grad-c1-dot'); if(d1) d1.style.background=c1;
  const d2=g('grad-c2-dot'); if(d2) d2.style.background=c2;
  const h1=g('grad-c1-hex'); if(h1) h1.textContent=c1.toUpperCase();
  const h2=g('grad-c2-hex'); if(h2) h2.textContent=c2.toUpperCase();
  updateGradPreview();
  debounceDraw();
}

export function updateGradPreview(){
  const grad = 'linear-gradient('+( ST.gradAngle||135)+'deg,'+ST.grad1+','+ST.grad2+')';
  const pr = g('grad-preview'); if(pr) pr.style.background=grad;
  const mpr = g('m-grad-preview'); if(mpr) mpr.style.background=grad;
}

export function onHexInput(val){
  val = val.trim().replace(/[^0-9a-fA-F#]/g,'');
  if(!val.startsWith('#')) val='#'+val;
  if(/^#[0-9a-fA-F]{6}$/.test(val)){
    setColorHex(val);
  }
}

export function onRGB(){
  const r=parseInt(g('sl-r')?.value||0);
  const gv=parseInt(g('sl-g')?.value||0);
  const b=parseInt(g('sl-b')?.value||0);
  if(g('sl-rv')) g('sl-rv').textContent=r;
  if(g('sl-gv')) g('sl-gv').textContent=gv;
  if(g('sl-bv')) g('sl-bv').textContent=b;
  const hex='#'+[r,gv,b].map(x=>x.toString(16).padStart(2,'0')).join('');
  setColorHex(hex);
}

export function onGradColor(idx, color){
  ST['grad'+idx]=color;
  // Update desktop pickers
  const dot=g('grad-c'+idx+'-dot'); if(dot) dot.style.background=color;
  const hex=g('grad-c'+idx+'-hex'); if(hex) hex.textContent=color.toUpperCase();
  // Update mobile pickers in-place (avoid full rebuild)
  const mdot=g('m-grad-c'+idx+'-dot'); if(mdot) mdot.style.background=color;
  const mhex=g('m-grad-c'+idx+'-hex'); if(mhex) mhex.textContent=color.toUpperCase();
  const minp=g('m-grad-c'+idx+'-inp'); if(minp) minp.value=color;
  updateGradPreview();
  debounceDraw();
}

export function onGradAngle(val){
  ST.gradAngle=parseInt(val);
  // Desktop label
  const lbl=g('grad-angle-v'); if(lbl) lbl.textContent=val+'°';
  // Mobile angle label in-place
  const mlbl=g('m-grad-angle-v'); if(mlbl) mlbl.textContent=val+'°';
  // Sync mobile range slider value
  const msl=g('m-grad-angle-sl'); if(msl) msl.value=val;
  updateGradPreview();
  debounceDraw();
}

export function setPhotoOverlay(val){
  const inp=g('photo-ov'); if(inp) inp.value=val;
  const lbl=g('photo-ov-v'); if(lbl) lbl.textContent=val+'%';
  const mlbl=g('m-photo-ov-v'); if(mlbl) mlbl.textContent=val+'%';
  debounceDraw();
}
