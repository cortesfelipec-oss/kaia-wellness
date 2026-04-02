/* ============================================
   ZONBAT · app.js — Interactividad completa
   ============================================ */

/* ── PARTÍCULAS ────────────────────────────── */
(function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['#c084fc', '#e879a0', '#a855f7', '#f9a8d4', '#d8b4fe'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 14 + 4;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 18 + 10}s;
      animation-delay:${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
})();

/* ── NAVBAR SCROLL ─────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ── HAMBURGER ─────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

/* ── CONTADORES ANIMADOS ────────────────────── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

const countersObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      countersObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => countersObserver.observe(el));

/* ── REVEAL ON SCROLL ───────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.benefit-card, .session-card, .gallery-item, .about-images, .about-content, .info-card, .feature-item'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ── TABS DE BENEFICIOS ─────────────────────── */
const tabBtns    = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const target = document.getElementById('tab-' + btn.dataset.tab);
    if (target) target.classList.add('active');
  });
});

/* ── GALERÍA / LIGHTBOX ─────────────────────── */
const galleryImages = Array.from(
  document.querySelectorAll('.gallery-item img')
).map(img => img.src);

let currentLightboxIndex = 0;
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');

document.querySelectorAll('.gallery-item').forEach((item, idx) => {
  item.addEventListener('click', () => openLightbox(idx));
});

function openLightbox(idx) {
  currentLightboxIndex = idx;
  lightboxImg.src = galleryImages[idx];
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

const lightboxCloseBtn = document.getElementById('lightboxClose');
if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);

const lightboxPrevBtn = document.getElementById('lightboxPrev');
if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.src = galleryImages[currentLightboxIndex];
});

const lightboxNextBtn = document.getElementById('lightboxNext');
if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
  lightboxImg.src = galleryImages[currentLightboxIndex];
});

if (lightbox) lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox || !lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft' && lightboxPrevBtn) lightboxPrevBtn.click();
  if (e.key === 'ArrowRight' && lightboxNextBtn) lightboxNextBtn.click();
});

/* ── TESTIMONIOS SLIDER ─────────────────────── */
let currentTestimonial = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots             = document.querySelectorAll('.dot');

function showTestimonial(idx) {
  if (!testimonialCards.length) return;
  testimonialCards.forEach(c => c.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if (testimonialCards[idx]) testimonialCards[idx].classList.add('active');
  if (dots[idx]) dots[idx].classList.add('active');
  currentTestimonial = idx;
}

dots.forEach(dot => {
  dot.addEventListener('click', () => showTestimonial(+dot.dataset.index));
});

// Auto-rotate cada 5 s
if (testimonialCards.length) {
  setInterval(() => {
    showTestimonial((currentTestimonial + 1) % testimonialCards.length);
  }, 5000);
}

/* ── SOUND WAVE BAR ─────────────────────────── */
const soundWaveBar = document.getElementById('soundWaveBar');
window.addEventListener('scroll', () => {
  soundWaveBar.classList.toggle('visible', window.scrollY > 300);
});

/* ── FECHA MÍNIMA (hoy) ─────────────────────── */
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

/* ── BOOKING FORM ───────────────────────────── */
const bookingForm   = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const submitBtn     = document.getElementById('submitBtn');

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      firstName:   document.getElementById('firstName').value.trim(),
      lastName:    document.getElementById('lastName').value.trim(),
      email:       document.getElementById('email').value.trim(),
      phone:       document.getElementById('phone').value.trim(),
      sessionType: document.getElementById('sessionType').value,
      date:        document.getElementById('date').value,
      time:        document.getElementById('time').value,
      notes:       document.getElementById('notes').value.trim(),
    };

    // Validación básica
    if (!formData.firstName || !formData.email || !formData.sessionType || !formData.date || !formData.time) {
      showToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Estado de carga
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando reserva...';

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        bookingForm.style.display = 'none';
        bookingSuccess.classList.add('show');
      } else {
        throw new Error(result.message || 'Error al procesar la reserva');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Ocurrió un error. Por favor intenta de nuevo.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmar reserva';
    }
  });
}

function resetForm() {
  bookingForm.reset();
  bookingForm.style.display = 'flex';
  bookingSuccess.classList.remove('show');
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmar reserva';
}

/* ── NEWSLETTER ─────────────────────────────── */
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    if (email) {
      showToast('¡Gracias! Te has suscrito exitosamente 🎵', 'success');
      newsletterForm.reset();
    }
  });
}

/* ── TOAST NOTIFICATIONS ────────────────────── */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;

  const style = document.createElement('style');
  if (!document.querySelector('#toast-styles')) {
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 80px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 22px;
        border-radius: 50px;
        font-size: 0.9rem;
        font-weight: 500;
        color: white;
        z-index: 9999;
        animation: slideInUp 0.4s ease, fadeOut 0.4s ease 3.5s forwards;
        max-width: 360px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      }
      .toast-success { background: linear-gradient(135deg, #7c3aed, #a855f7); }
      .toast-error   { background: linear-gradient(135deg, #e879a0, #be185d); }
      @keyframes slideInUp {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity:1; }
        to   { opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/* ── SMOOTH ANCHOR LINKS ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── PARALLAX HERO CIRCLES ──────────────────── */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const c1 = document.querySelector('.c1');
  const c2 = document.querySelector('.c2');
  if (c1) c1.style.transform = `translateY(${scrollY * 0.1}px) scale(1)`;
  if (c2) c2.style.transform = `translateY(${-scrollY * 0.08}px) scale(1)`;
}, { passive: true });

/* ── ACTIVE NAV LINK ON SCROLL ──────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active-nav'));
      const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (match) match.classList.add('active-nav');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => activeObserver.observe(s));

/* ── LANGUAGE SWITCHER ──────────────────────── */
const translations = {
  es: {
    nav_about: '¿Qué es?', nav_sessions: 'Sesiones', nav_benefits: 'Beneficios',
    nav_team: 'Facilitadoras', nav_book: 'Agendar', nav_cta: 'Empezar ahora',
    hero_eyebrow: '¿Qué experiencia estás buscando?',
    hero_h1a: 'Una mejor manera', hero_h1b: 'sanar',
    hero_sub: 'Sumérgete en un viaje de vibraciones curativas. Sesiones de sound bath diseñadas para restaurar tu mente, cuerpo y espíritu.',
    hero_cta1: 'Agenda tu sesión ', hero_cta2: 'Conoce más',
  },
  en: {
    nav_about: 'What is it?', nav_sessions: 'Sessions', nav_benefits: 'Benefits',
    nav_team: 'Facilitators', nav_book: 'Book', nav_cta: 'Start now',
    hero_eyebrow: 'What experience are you looking for?',
    hero_h1a: 'A better way', hero_h1b: 'to heal',
    hero_sub: 'Immerse yourself in a journey of healing vibrations. Sound bath sessions designed to restore your mind, body and spirit.',
    hero_cta1: 'Book your session ', hero_cta2: 'Learn more',
  },
  pt: {
    nav_about: 'O que é?', nav_sessions: 'Sessões', nav_benefits: 'Benefícios',
    nav_team: 'Facilitadoras', nav_book: 'Agendar', nav_cta: 'Começar agora',
    hero_eyebrow: 'Que experiência você está buscando?',
    hero_h1a: 'Uma maneira melhor', hero_h1b: 'de curar',
    hero_sub: 'Mergulhe em uma jornada de vibrações curativas. Sessões de sound bath para restaurar sua mente, corpo e espírito.',
    hero_cta1: 'Agende sua sessão ', hero_cta2: 'Saiba mais',
  },
  fr: {
    nav_about: 'Qu\'est-ce?', nav_sessions: 'Séances', nav_benefits: 'Bienfaits',
    nav_team: 'Facilitatrices', nav_book: 'Réserver', nav_cta: 'Commencer',
    hero_eyebrow: 'Quelle expérience cherchez-vous?',
    hero_h1a: 'Une meilleure façon', hero_h1b: 'de guérir',
    hero_sub: 'Plongez dans un voyage de vibrations curatives. Des séances de sound bath pour restaurer votre esprit, corps et âme.',
    hero_cta1: 'Réserver une séance ', hero_cta2: 'En savoir plus',
  },
};

const langBtn      = document.getElementById('langBtn');
const langSwitcher = document.getElementById('langSwitcher');
const langDropdown = document.getElementById('langDropdown');
const langCurrent  = document.getElementById('langCurrent');

if (langBtn) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcher.classList.toggle('open');
  });

  document.addEventListener('click', () => langSwitcher.classList.remove('open'));

  langDropdown.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      langDropdown.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      langCurrent.textContent = lang.toUpperCase();
      langSwitcher.classList.remove('open');
      applyTranslations(lang);
    });
  });
}

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      if (el.tagName === 'A' && el.querySelector('i')) {
        el.innerHTML = t[key] + '<i class="fas fa-arrow-right"></i>';
      } else {
        el.textContent = t[key];
      }
    }
  });
}
