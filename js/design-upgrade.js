/* ================================================================
   ENJC — Design System Upgrade JS
   Premium interactions, scroll effects, and UX enhancements.
================================================================ */

(function () {
  'use strict';

  /* ── SMOOTH HOVER LIFT ── */
  document.querySelectorAll('.card, .min-card, .tool-card, .video-card, .schedule-card, .deliv-card').forEach(card => {
    card.style.willChange = 'transform';
  });

  /* ── IMAGE LAZY LOAD FADE ── */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; });
    if (img.complete) img.style.opacity = '1';
  });

  /* ── COUNTER ANIMATION FOR STATS ── */
  function animateCounter(el, target, suffix) {
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          const num = parseInt(text);
          const suffix = text.replace(/[0-9]/g, '');
          if (!isNaN(num) && num > 0) {
            animateCounter(el, num, suffix);
          }
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));
  }

  /* ── SERVICE TIMES COUNTDOWN ── */
  function updateCountdown() {
    const cdD = document.getElementById('cd-d');
    const cdH = document.getElementById('cd-h');
    const cdM = document.getElementById('cd-m');
    const cdS = document.getElementById('cd-s');
    if (!cdD || !cdH || !cdM || !cdS) return;

    function getNextSunday(h, m) {
      const now = new Date();
      const day = now.getDay();
      const daysUntil = (7 - day) % 7;
      const next = new Date(now);
      next.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil));
      next.setHours(h, m, 0, 0);
      return next;
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const now = new Date();
      const target = getNextSunday(8, 30);
      let diff = Math.max(0, Math.floor((target - now) / 1000));
      const d = Math.floor(diff / 86400); diff -= d * 86400;
      const h = Math.floor(diff / 3600); diff -= h * 3600;
      const m = Math.floor(diff / 60); diff -= m * 60;
      const s = diff;
      cdD.textContent = pad(d);
      cdH.textContent = pad(h);
      cdM.textContent = pad(m);
      cdS.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  }

  updateCountdown();

  /* ── LIGHTBOX (gallery) ── */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const galleryItems = Array.from(document.querySelectorAll('.gal-item'));

  let lbIndex = 0;

  if (lightbox && lbImg) {
    function openLightbox(idx) {
      lbIndex = idx;
      const item = galleryItems[idx];
      const img = item.querySelector('img');
      const caption = item.querySelector('.gal-item__caption');
      lbImg.src = img ? img.src : '';
      lbImg.alt = img ? img.alt : '';
      if (lbCaption) lbCaption.textContent = caption ? caption.textContent : '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      lbImg.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (galleryItems[lbIndex]) galleryItems[lbIndex].focus();
    }

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);

    if (lbPrev) lbPrev.addEventListener('click', () => {
      lbIndex = (lbIndex - 1 + galleryItems.length) % galleryItems.length;
      openLightbox(lbIndex);
    });

    if (lbNext) lbNext.addEventListener('click', () => {
      lbIndex = (lbIndex + 1) % galleryItems.length;
      openLightbox(lbIndex);
    });

    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lbPrev) lbPrev.click();
      if (e.key === 'ArrowRight' && lbNext) lbNext.click();
    });
  }

  /* ── GALLERY FILTER ── */
  const filterBtns = document.querySelectorAll('[data-filter]');
  const galleryAllItems = document.querySelectorAll('[data-category]');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('enjc-filter-active'));
        btn.classList.add('enjc-filter-active');
        const filter = btn.dataset.filter;
        galleryAllItems.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }
})();
