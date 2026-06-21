/**
 * ENJC — Shared site scripts
 * Animations: fade-up · roll-in · wipe-reveal
 */
(function () {
  'use strict';

  /* ── THEME ── */
  const THEME_KEY = 'enjc-theme';
  function applyTheme(t) {
    t === 'light'
      ? document.documentElement.setAttribute('data-theme','light')
      : document.documentElement.removeAttribute('data-theme');
  }
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  window.toggleTheme = function () {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    applyTheme(next); localStorage.setItem(THEME_KEY, next);
  };

  /* ── MOBILE MENU (main.css hamburger) ── */
  function getMenuBtn() { return document.querySelector('.nav-hamburger'); }
  function getMenu()    { return document.getElementById('mobile-menu'); }
  window.toggleMenu = function () {
    const m = getMenu(), b = getMenuBtn(); if (!m) return;
    const opening = !m.classList.contains('is-open');
    m.classList.toggle('is-open', opening);
    if (b) b.setAttribute('aria-expanded', opening ? 'true' : 'false');
  };
  function closeMenu() {
    const m = getMenu(), b = getMenuBtn();
    if (!m || !m.classList.contains('is-open')) return;
    m.classList.remove('is-open');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  /* ── SCROLL TO TOP ── */
  window.goTop = function () { window.scrollTo({ top:0, behavior:'smooth' }); };

  /* ── SERVICE WORKER ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('js/sw.js').catch(function(){});
    });
  }

  /* ══════════════════════════════════════════════════════
     ALL DOM-READY LOGIC
  ══════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {

    /* ── Close menu on Escape / outside click ── */
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });
    document.addEventListener('click', function(e){
      const m = getMenu(), b = getMenuBtn();
      if (!m || !m.classList.contains('is-open')) return;
      if (m.contains(e.target) || (b && b.contains(e.target))) return;
      closeMenu();
    });

    /* ── mob-toggle / #nav-links (per-page mobile nav) ── */
    var mobBtn   = document.getElementById('mob-toggle');
    var navLinks = document.getElementById('nav-links');
    if (mobBtn && navLinks) {
      mobBtn.addEventListener('click', function(e){
        e.stopPropagation();
        var open = navLinks.classList.toggle('mob-open');
        mobBtn.classList.toggle('active', open);
      });
      navLinks.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          navLinks.classList.remove('mob-open');
          mobBtn.classList.remove('active');
        });
      });
      document.addEventListener('click', function(e){
        if (!navLinks.classList.contains('mob-open')) return;
        if (navLinks.contains(e.target) || mobBtn.contains(e.target)) return;
        navLinks.classList.remove('mob-open');
        mobBtn.classList.remove('active');
      });
    }

    /* ── Scroll-to-top button ── */
    window.addEventListener('scroll', function(){
      var btn = document.getElementById('scroll-top-btn');
      if (btn) btn.classList.toggle('is-visible', window.scrollY > 320);
    }, { passive:true });

    /* ════════════════════════════════════════════════════
       UNIFIED REVEAL-ON-SCROLL SYSTEM
       Supports:
         .reveal / .reveal-on-scroll  — fade-up (legacy)
         .anim-fade-up                — fade up
         .anim-roll-left              — slide from left
         .anim-roll-right             — slide from right
         .anim-wipe                   — clip-path wipe
         .anim-scale                  — scale + fade
         .anim-breath                 — padding breathing (studio.site style)
         .anim-stagger > children     — auto stagger child items
       All → add .anim-in + .is-visible + .visible on enter
    ════════════════════════════════════════════════════ */

    /* Fallback — no IntersectionObserver */
    if (!window.IntersectionObserver) {
      document.querySelectorAll(
        '.reveal,.reveal-on-scroll,.anim-fade-up,.anim-roll-left,.anim-roll-right,.anim-wipe,.anim-scale,.anim-breath,.anim-stagger'
      ).forEach(function(el){ el.classList.add('anim-in','is-visible','visible'); });
      return;
    }

    /* Stagger children: auto-assign --anim-delay to direct children */
    document.querySelectorAll('.anim-stagger').forEach(function(parent){
      var items = parent.querySelectorAll(':scope > *');
      items.forEach(function(child, i){
        child.classList.add('anim-stagger-child');
        child.style.setProperty('--anim-delay', (i * 110) + 'ms');
      });
    });

    /* Single shared observer for ALL animation elements */
    var allAnimSel = [
      '.reveal','.reveal-on-scroll',
      '.anim-fade-up','.anim-roll-left','.anim-roll-right',
      '.anim-wipe','.anim-scale','.anim-breath',
      '.anim-stagger-child'
    ].join(',');

    var mainObs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          en.target.classList.add('anim-in','is-visible','visible');
          mainObs.unobserve(en.target);
        }
      });
    }, { threshold:0.09, rootMargin:'0px 0px -40px 0px' });

    document.querySelectorAll(allAnimSel).forEach(function(el){
      mainObs.observe(el);
    });

  }); /* end DOMContentLoaded */

})();

/* ── EFFECT 2: Stained Glass Divider ── */
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.stained-cv').forEach(function(cv){
    var W=cv.offsetWidth||680,H=64;
    cv.width=W;cv.height=H;
    var ctx=cv.getContext('2d');
    var cols=['rgba(201,168,76,','rgba(80,120,220,','rgba(160,80,200,','rgba(80,180,160,'];
    var shards=[];
    for(var i=0;i<18;i++)shards.push({x:Math.random()*W,w:20+Math.random()*50,col:cols[Math.floor(Math.random()*cols.length)],phase:Math.random()*6.28});
    var t=0;
    (function draw(){
      ctx.clearRect(0,0,W,H);
      shards.forEach(function(s){var a=0.04+0.04*Math.sin(t*0.4+s.phase);ctx.fillStyle=s.col+a+')';ctx.fillRect(s.x-s.w/2,0,s.w,H);});
      var mg=ctx.createLinearGradient(0,H/2-1,0,H/2+1);
      mg.addColorStop(0,'rgba(201,168,76,0.4)');mg.addColorStop(0.5,'rgba(201,168,76,0.9)');mg.addColorStop(1,'rgba(201,168,76,0.4)');
      ctx.fillStyle=mg;ctx.fillRect(0,H/2-1,W,2);
      t+=0.02;requestAnimationFrame(draw);
    })();
  });
/* ── EFFECT 3: Constellation Nav ── */
  (function(){
    var cv=document.getElementById('const-cv');
    if(!cv)return;
    var nav=cv.parentElement;
    cv.width=nav.offsetWidth||680;cv.height=nav.offsetHeight||60;
    var W=cv.width,H=cv.height,ctx=cv.getContext('2d'),stars=[],t=0;
    for(var i=0;i<40;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:0.4+Math.random()*0.8,phase:Math.random()*6.28});
    (function draw(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<stars.length;i++)for(var j=i+1;j<stars.length;j++){
        var dx=stars[i].x-stars[j].x,dy=stars[i].y-stars[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<90){ctx.beginPath();ctx.moveTo(stars[i].x,stars[i].y);ctx.lineTo(stars[j].x,stars[j].y);ctx.strokeStyle='rgba(201,168,76,'+((1-d/90)*0.1)+')';ctx.lineWidth=0.5;ctx.stroke();}
      }
      stars.forEach(function(s){var a=0.15+0.45*Math.abs(Math.sin(t*0.5+s.phase));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fillStyle='rgba(201,168,76,'+a+')';ctx.fill();});
      t+=0.02;requestAnimationFrame(draw);
    })();
  })();
});

/* ── Mouse-tracking glow (page-hero) ── */
(function(){
  var sec=document.querySelector('.page-hero');
  var cv=document.getElementById('hero-glow-cv');
  if(!sec||!cv)return;
  cv.width=sec.offsetWidth;cv.height=sec.offsetHeight;
  var ctx=cv.getContext('2d');
  var mx=-999,my=sec.offsetHeight/2,active=false;
  var cx=-999,cy=sec.offsetHeight/2,alpha=0,hue=40;
  sec.addEventListener('mousemove',function(e){
    var r=sec.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;active=true;
  });
  sec.addEventListener('mouseleave',function(){active=false;});
  (function draw(){
    cx+=(mx-cx)*0.07;cy+=(my-cy)*0.07;
    alpha+=((active?1:0)-alpha)*0.05;
    hue=(hue+0.4)%360;
    ctx.clearRect(0,0,cv.width,cv.height);
    if(alpha>0.01){
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,280);
      g.addColorStop(0,'hsla('+hue+',70%,65%,'+(alpha*0.18)+')');
      g.addColorStop(0.4,'hsla('+hue+',60%,50%,'+(alpha*0.06)+')');
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);
      /* secondary lobe */
      var g2=ctx.createRadialGradient(cx,cy,0,cx,cy,280*0.4);
      g2.addColorStop(0,'hsla('+((hue+120)%360)+',90%,70%,'+(alpha*0.08)+')');
      g2.addColorStop(1,'transparent');
      ctx.fillStyle=g2;ctx.fillRect(0,0,cv.width,cv.height);
    }
    requestAnimationFrame(draw);
  })();
})();

/* ── NAV SCROLL STATE ── */
(function(){
  var nav = document.querySelector('.site-nav');
  if(!nav) return;
  function onScroll(){
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
