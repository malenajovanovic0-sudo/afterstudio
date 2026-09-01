(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------- Typewriter -------------------- */
  function runTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el) return;

    const text = el.textContent;

    if (prefersReduced) {
      // Show full content immediately
      el.textContent = text;
      return;
    }

    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    el.appendChild(cursor);

    let i = 0;
    const speed = 15;

    function step() {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text.charAt(i));
        i++;
        setTimeout(step, speed);
      } else {
        // Hold cursor for a beat, then remove
        setTimeout(() => cursor.remove(), 1400);
      }
    }
    step();
  }

  /* -------------------- Reveal on scroll -------------------- */
  function setupReveal() {
    const reveals = document.querySelectorAll('[data-reveal]');
    const staggers = document.querySelectorAll('[data-stagger]');

    if (prefersReduced || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('is-in'));
      staggers.forEach(el => el.classList.add('is-in'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => revealObserver.observe(el));

    // Stagger services: when the list section comes into view, fade each row in
    const list = document.querySelector('.services-list');
    if (list) {
      const rows = list.querySelectorAll('[data-stagger]');
      const listObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              rows.forEach((row, idx) => {
                setTimeout(() => row.classList.add('is-in'), idx * 80);
              });
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      listObserver.observe(list);
    }
  }

  /* -------------------- Gallery (CSS auto-scroll marquee) --------------------
     The strip scrolls itself continuously via CSS animation — no scroll
     hijacking, nothing tied to page scroll position. It just runs.
  ------------------------------------------------------------------------- */
  function setupGallery() {
    const track = document.querySelector('.gallery-track');
    if (!track) return;
    // Pause while the tab is hidden so it doesn't drift/jump on return.
    document.addEventListener('visibilitychange', function () {
      track.style.animationPlayState = document.hidden ? 'paused' : '';
    });
  }

  /* -------------------- Magnetic Contact CTA -------------------- */
  function setupMagneticCTA() {
    const btn = document.getElementById('open-contact');
    if (!btn || prefersReduced) return;

    const RADIUS = 80;
    const MAX_PULL = 8;
    let rect = null;

    function refreshRect() { rect = btn.getBoundingClientRect(); }

    function onMove(e) {
      if (!rect) refreshRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > RADIUS) {
        btn.style.transform = '';
        return;
      }
      const strength = 1 - dist / RADIUS;
      const tx = Math.max(-MAX_PULL, Math.min(MAX_PULL, dx * strength * 0.6));
      const ty = Math.max(-MAX_PULL, Math.min(MAX_PULL, dy * strength * 0.6));
      btn.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
    }

    function reset() { btn.style.transform = ''; }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', refreshRect, { passive: true });
    window.addEventListener('resize', refreshRect);
    btn.addEventListener('mouseleave', reset);
    refreshRect();
  }

  /* -------------------- Parallax on AFTR logo -------------------- */
  function setupParallax() {
    const logo = document.querySelector('.aftr-logo');
    if (!logo || prefersReduced) return;

    const MAX_OFFSET = 30;
    let ticking = false;

    function update() {
      const rect = logo.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: -1 when far below viewport, 0 near center, 1 when far above
      const center = rect.top + rect.height / 2;
      const progress = (vh / 2 - center) / vh;
      const offset = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, progress * MAX_OFFSET * 2));
      logo.style.transform = 'translate3d(0, ' + offset.toFixed(2) + 'px, 0)';
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* -------------------- Init -------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    runTypewriter();
    setupReveal();
    setupGallery();
    setupMagneticCTA();
    setupParallax();
  });
})();
