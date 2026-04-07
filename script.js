/* =========================================================
   PORTFOLIO V5 — script.js
   All V4 features + 3D Tilt, Ripple Buttons, Parallax
   ========================================================= */

/* ---------- Theme color helper (MUST be hoisted function) ---------- */
function updateParticleColors() {
  if (!window.particleSystem) return;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  window.particleSystem.colors = {
    particle: isDark ? 'rgba(59,130,246,__A__)' : 'rgba(37,99,235,__A__)',
    line:     isDark ? 'rgba(59,130,246,__A__)' : 'rgba(37,99,235,__A__)',
  };
}

/* ---------- Apply theme immediately (no flash) ---------- */
function applyTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateParticleColors();
}
applyTheme();
/* ---------- Wallpaper: start animations ---------- */
function initWallpaper() {
  const overlay = document.getElementById('wallpaper-overlay');
  if (!overlay) return;

  const nums  = overlay.querySelectorAll('.wp-stat-num');
  const rings = overlay.querySelectorAll('.wp-ring-fill');
  const CIRCUM = 276.46;

  setTimeout(() => {
    nums.forEach((el, i) => {
      const target = parseInt(el.dataset.target) || 0;
      let cur = 0;
      const step = target / 40;

      const id = setInterval(() => {
        cur += step;
        if (cur >= target) {
          cur = target;
          clearInterval(id);
          el.textContent = target + '+';
          el.style.textShadow = '0 0 22px rgba(59,130,246,.85)';
          setTimeout(() => (el.style.textShadow = ''), 700);
        } else {
          el.textContent = Math.floor(cur) + '+';
        }
      }, 50);

      if (rings[i]) {
        const offset = CIRCUM * (1 - target / 10);
        rings[i].style.strokeDashoffset = offset;
      }
    });
  }, 700);

  overlay._parallax = (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    const bg = overlay.querySelector('.wp-bg');
    if (bg) bg.style.transform = `translate(${x * 28}px, ${y * 28}px)`;
  };
  overlay.addEventListener('mousemove', overlay._parallax);
}

/* ---------- Wallpaper: reset for next open ---------- */
function resetWallpaper() {
  const overlay = document.getElementById('wallpaper-overlay');
  if (!overlay) return;

  overlay.querySelectorAll('.wp-stat-num').forEach(el => {
    el.textContent = '0';
    el.style.textShadow = '';
  });
  overlay.querySelectorAll('.wp-ring-fill').forEach(r => {
    r.style.strokeDashoffset = '276.46';
  });
  const bg = overlay.querySelector('.wp-bg');
  if (bg) bg.style.transform = '';

  if (overlay._parallax) {
    overlay.removeEventListener('mousemove', overlay._parallax);
    overlay._parallax = null;
  }
}


/* ================================================================
   DOMContentLoaded — everything else
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ====== LOADER ====== */
  setTimeout(() => document.querySelector('.loader')?.classList.add('hidden'), 1200);

  /* ====== THEME TOGGLE ====== */
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateParticleColors();
    });
  }

  /* ====== HERO TYPING EFFECT ====== */
  const typingEl = document.getElementById('typing-name');
  if (typingEl) {
    const name = typingEl.dataset.name || 'John Lopez';
    let i = 0;
    typingEl.textContent = '';
    (function typeChar() {
      if (i < name.length) { typingEl.textContent += name[i++]; setTimeout(typeChar, 90); }
    })();
  }

  /* ====== PARTICLE CANVAS ====== */
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  if (canvas && ctx) {
    let W, H;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT     = 90;
    const CONNECT_DIST       = 150;
    const MOUSE_ATTRACT_STR  = 0.025;
    const MOUSE_REPEL_DIST   = 70;
    const MOUSE_CONNECT_DIST = 180;
    const BG_LINE_OPACITY_DARK  = 0.40;
    const BG_LINE_OPACITY_LIGHT = 0.28;

    const mouse = { x: null, y: null };
    canvas.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        this.vx = (Math.random() - .5) * .35;
        this.vy = (Math.random() - .5) * .35;
        this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        this.pulse += 0.02;
        this.size = this.baseSize + Math.sin(this.pulse) * .5;

        if (mouse.x !== null) {
          const dx = mouse.x - this.x, dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_REPEL_DIST) {
            this.vx -= (dx / dist) * 0.6;
            this.vy -= (dy / dist) * 0.6;
          } else if (dist < 250) {
            this.vx += (dx / dist) * MOUSE_ATTRACT_STR;
            this.vy += (dy / dist) * MOUSE_ATTRACT_STR;
          }
        }
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.5) { this.vx *= 0.95; this.vy *= 0.95; }

        this.x += this.vx; this.y += this.vy;
        if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
      }
    }

    window.particleSystem = {
      particles: Array.from({ length: PARTICLE_COUNT }, () => new Particle()),
      colors: {}
    };
    updateParticleColors();

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      const ps = window.particleSystem;
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const lineOpacity = isDark ? BG_LINE_OPACITY_DARK : BG_LINE_OPACITY_LIGHT;
      const particles = ps.particles;

      // inter-particle lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * lineOpacity;
            ctx.strokeStyle = ps.colors.line.replace('__A__', alpha.toFixed(2));
            ctx.lineWidth = .6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // mouse connection lines
      if (mouse.x !== null) {
        for (const p of particles) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_CONNECT_DIST) {
            const alpha = (1 - dist / MOUSE_CONNECT_DIST) * 0.5;
            ctx.strokeStyle = ps.colors.line.replace('__A__', alpha.toFixed(2));
            ctx.lineWidth = .8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (const p of particles) {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = ps.colors.particle.replace('__A__', '0.85');
        ctx.shadowColor = ps.colors.particle.replace('__A__', '0.6');
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ====== SCROLL: NAV HIGHLIGHT + BACK-TO-TOP ====== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const btt = document.querySelector('.back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop, h = sec.offsetHeight, id = sec.id;
      navLinks.forEach(l => {
        if (l.getAttribute('href') === '#' + id) {
          l.classList.toggle('active', scrollY >= top && scrollY < top + h);
        }
      });
    });
    btt?.classList.toggle('show', window.scrollY > 500);
  });
  btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ====== INTERSECTION OBSERVER — fade-in ====== */
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => fadeObs.observe(el));

  /* ====== SKILL BARS (observer driven) ====== */
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.width;
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(b => skillObs.observe(b));

  /* ====== STAT COUNTER ANIMATION ====== */
  const statEls = document.querySelectorAll('[data-count]');
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = +e.target.dataset.count;
        let cur = 0;
        const step = Math.ceil(target / 40);
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) { cur = target; clearInterval(t); }
          e.target.textContent = cur + '+';
        }, 30);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => statObs.observe(el));

  /* ====== SECTION DIVIDER DRAW ON SCROLL ====== */
  const dividers = document.querySelectorAll('.section-divider');
  const divObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        divObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  dividers.forEach(d => divObs.observe(d));

  /* ====== PROJECT FILTERS ====== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projCards  = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projCards.forEach(c => {
        c.classList.toggle('hidden', f !== 'all' && c.dataset.category !== f);
      });
    });
  });

  /* ====== MODALS ====== */
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      document.getElementById(trigger.dataset.modal)?.classList.add('active');
    });
  });
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', e => { if (e.target === bd) bd.classList.remove('active'); });
    bd.querySelector('.modal-close')?.addEventListener('click', () => bd.classList.remove('active'));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.active').forEach(m => m.classList.remove('active'));
  });

  /* ====== CONTACT FORM (placeholder) ====== */
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Message sent! (This is a placeholder — connect a real backend.)');
    form.reset();
  });

  /* ====== KONAMI CODE ====== */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;
  const konamiHint = document.getElementById('konami-hint');

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === Math.floor(KONAMI.length / 2)) {
        konamiHint?.classList.add('flash');
        setTimeout(() => konamiHint?.classList.remove('flash'), 2000);
      }
      if (konamiIdx === KONAMI.length) { konamiIdx = 0; openWallpaper(); }
    } else { konamiIdx = 0; }
  });

    /* ====== WALLPAPER MODE ====== */
  const wpOverlay = document.getElementById('wallpaper-overlay');

  function openWallpaper() {
    if (!wpOverlay) return;
    wpOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    initWallpaper();
  }

  function closeWallpaper() {
    if (!wpOverlay) return;
    wpOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetWallpaper();
  }

  document.getElementById('wp-close')?.addEventListener('click', closeWallpaper);

  // ESC key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wpOverlay?.classList.contains('active')) {
      closeWallpaper();
    }
  });

  /* ====== V5: 3D CARD TILT EFFECT ====== */
  const tiltCards = document.querySelectorAll('.skill-card, .project-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * 6;   // max 6 deg
      const rotateX = ((midY - y) / midY) * 6;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease-out';
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
      setTimeout(() => { card.style.transition = ''; }, 400);
    });
  });

  /* ====== V5: RIPPLE BUTTON EFFECT ====== */
  document.querySelectorAll('.btn, .filter-btn, .social-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ====== V5: PARALLAX DEPTH LAYERS ====== */
  const heroSection  = document.querySelector('.hero');
  const heroContent  = document.querySelector('.hero-content');
  const heroCanvas   = document.getElementById('hero-canvas');

  if (heroSection && heroContent && heroCanvas) {
    window.addEventListener('scroll', () => {
      const scrollY  = window.scrollY;
      const heroH    = heroSection.offsetHeight;
      if (scrollY < heroH) {
        heroCanvas.style.transform  = `translateY(${scrollY * 0.3}px)`;
        heroContent.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
    });
  }

});
