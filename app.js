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
    nav_about:'¿Qué es?', nav_sessions:'Sesiones', nav_benefits:'Beneficios',
    nav_team:'Facilitadoras', nav_book:'Agendar', nav_cta:'Empezar ahora',
    hero_eyebrow:'¿Qué experiencia estás buscando?',
    hero_h1a:'Una mejor manera', hero_h1b:'sanar',
    hero_sub:'Sumérgete en un viaje de vibraciones curativas. Sesiones de sound bath diseñadas para restaurar tu mente, cuerpo y espíritu.',
    hero_cta1:'Agenda tu sesión', hero_cta2:'Conoce más',
    svc_individual:'Individual', svc_grupal:'Grupal', svc_retiro:'Retiro',
    svc_empresarial:'Empresarial', svc_virtual:'Virtual',
    trust_label:'Avalado por profesionales de la salud integrativa',
    trust_cert:'Certificación IAST', trust_med:'Medicina Integrativa',
    trust_hol:'Bienestar Holístico', trust_neuro:'Neurociencia del Sonido', trust_sessions:'500+ Sesiones',
    about_eyebrow:'¿Qué es Sound Healing?', about_stat:'de satisfacción',
    about_h2a:'Finalmente—una experiencia', about_h2b:'para tu alma',
    about_body:'Estamos aquí para acompañarte a liberar el estrés, recuperar tu equilibrio y sanar desde adentro. A través del sonido, tu sistema nervioso encuentra el descanso profundo que merece.',
    about_li1_title:'Ondas cerebrales theta', about_li1_p:'Estado meditativo profundo sin esfuerzo consciente',
    about_li2_title:'Regulación del sistema nervioso', about_li2_p:'Activa tu modo natural de descanso y recuperación',
    about_li3_title:'Reducción de cortisol comprobada', about_li3_p:'Vibraciones que disminuyen la hormona del estrés',
    sessions_eyebrow:'Nuestras sesiones', sessions_h2a:'No sanes solo/a.', sessions_h2b:'Te acompañamos.',
    sessions_sub:'No dejes que el estrés se convierta en un obstáculo. Te conectamos con la experiencia que mejor se adapte a ti.',
    card1_title:'Sesión Individual', card1_p:'Una experiencia íntima y completamente personalizada de 60 minutos.', card1_link:'Explorar sesión individual',
    card2_title:'Sesión Grupal', card2_p:'Comparte la magia del sound bath con otras personas en 90 minutos.', card2_link:'Explorar sesión grupal',
    card3_title:'Retiro de un Día', card3_p:'Jornada completa de 6 horas con sound bath, yoga y alimentación consciente.', card3_link:'Explorar retiro',
    card4_title:'Empresarial', card4_p:'Sesiones de bienestar para equipos de trabajo, in-situ o en nuestro espacio.', card4_link:'Explorar corporativo',
    card5_title:'Sesión Virtual', card5_p:'Vive la experiencia de sanación desde cualquier lugar del mundo.', card5_link:'Explorar virtual',
    card6_title:'Sesión Nocturna', card6_p:'Especialmente diseñada para mejorar el sueño y la recuperación nocturna.', card6_link:'Explorar nocturna',
    testimonial_text:'Sound Healing es increíblemente cercano y flexible según mis necesidades. Pero lo que más valoro es su compromiso genuino con mi bienestar. Se sienten como una extensión de mi equipo de salud.',
    testimonial_name:'María Claudia Restrepo', testimonial_role:'Directora de Bienestar, Empresa Nacional',
    team_h2a:'Un mundo más amplio', team_h2b:'sanación',
    team_p:'¿Cuáles son las probabilidades de que el talento que necesitas viva en tu ciudad? Nuestro equipo de facilitadoras certificadas trabaja en múltiples idiomas, husos horarios y modalidades, lo que significa mayor alcance, sesiones más profundas y resultados más transformadores.',
    team_callout:'Es hora de ir más allá de lo local. Sin límites geográficos.', team_cta:'Empezar ahora',
    steps_eyebrow:'Así de simple', steps_h2a:'Agenda en', steps_h2b:'4 pasos simples',
    steps_p:'Diseñamos el proceso para que llegues a tu sesión sin fricciones, solo con intención.', steps_cta:'Ver disponibilidad',
    step1_title:'Cuéntanos sobre ti', step1_p:'Comparte tus objetivos de bienestar y lo que buscas sanar.',
    step2_title:'Elige tu tipo de sesión', step2_p:'Individual, grupal, retiro o virtual — selecciona la que más resuena contigo.',
    step3_title:'Escoge fecha y hora', step3_p:'Selecciona el horario que mejor se adapte a tu agenda.',
    step4_title:'Recibe tu confirmación', step4_p:'Te enviamos la invitación de Google Calendar y todo lo que necesitas saber.',
    people_eyebrow:'Nuestro equipo', people_h2a:'Nuestras facilitadoras son', people_h2b:'personas reales',
    people_p1:'Durante casi una década, hemos acompañado el crecimiento personal, el bienestar y el desarrollo interior de cientos de personas a través del poder del sonido.',
    people_p2:'Y si te unes a nosotros, tampoco serás un número — serás parte de la familia.', people_cta:'Conoce al equipo',
    grow_eyebrow:'Únete a la comunidad', grow_h2a:'Una mejor manera de crecer…', grow_h2b:'por dentro',
    grow_p1:'Nuestra pasión por el crecimiento se alimenta de nuestra cultura. Celebramos tu progreso y te damos la oportunidad de descubrir las prácticas más poderosas del bienestar sonoro.',
    grow_p2:'¿Quieres unirte a nuestra comunidad? Descubre nuestros talleres y formaciones.', grow_cta:'Ver formaciones abiertas',
    booking_eyebrow:'Reserva tu espacio', booking_h2a:'Empieza a construir', booking_h2b:'paz interior',
    booking_p:'Diseñamos la sesión perfecta para ti. Solo necesitas dar el primer paso.',
    form_firstname:'Nombre', form_lastname:'Apellido', form_email:'Correo electrónico',
    form_phone:'WhatsApp', form_session:'Tipo de sesión', form_date:'Fecha', form_time:'Hora',
    form_notes:'¿Algo que debamos saber?', form_submit:'Confirmar reserva',
    form_notice:'Tu información es privada. Recibirás confirmación con invitación de Google Calendar.',
    form_session_ph:'Selecciona una sesión', form_time_ph:'Selecciona hora',
    form_s_individual:'Sesión Individual (60 min)', form_s_grupal:'Sesión Grupal (90 min)',
    form_s_retiro:'Retiro de un Día (6 horas)', form_s_empresarial:'Sesión Empresarial', form_s_virtual:'Sesión Virtual',
    ph_firstname:'Tu nombre', ph_lastname:'Tu apellido', ph_notes:'Condiciones de salud, intenciones, preguntas...',
    success_title:'¡Reserva confirmada!', success_p:'Revisa tu correo — te enviamos la invitación de Google Calendar.', success_btn:'Hacer otra reserva',
    bd_loc_title:'Ubicación', bd_loc_p:'Centro de Bienestar Sound Healing · Calle 93 #15-47, Bogotá',
    bd_hours_title:'Horarios', bd_hours_p:'Lunes a Sábado · 8:00 AM – 7:00 PM',
    bd_wear_title:'¿Qué llevar?', bd_wear_p:'Ropa cómoda. Tapete opcional. Llegá 10 min antes.',
    footer_tagline:'Transformando vidas a través del poder curativo del sonido.',
    footer_col1:'Sesiones', footer_col2:'Empresa', footer_col3:'Recursos', footer_col4:'Síguenos',
    footer_blog:'Blog', footer_guide:'Guía de Sound Bath', footer_faq:'Preguntas frecuentes',
    footer_med:'Meditaciones gratis', footer_cert:'Certificaciones',
    footer_copy:'© 2025 kaia WELLNESS. Todos los derechos reservados.',
    footer_made:'Hecho con ♥ para tu bienestar',
  },
  en: {
    nav_about:'About', nav_sessions:'Sessions', nav_benefits:'Benefits',
    nav_team:'Facilitators', nav_book:'Book', nav_cta:'Get Started',
    hero_eyebrow:'What kind of experience are you looking for?',
    hero_h1a:'A better way', hero_h1b:'to heal',
    hero_sub:'Immerse yourself in a journey of healing vibrations. Sound bath sessions designed to restore your mind, body, and spirit.',
    hero_cta1:'Book your session', hero_cta2:'Learn more',
    svc_individual:'Individual', svc_grupal:'Group', svc_retiro:'Retreat',
    svc_empresarial:'Corporate', svc_virtual:'Virtual',
    trust_label:'Endorsed by integrative health professionals',
    trust_cert:'IAST Certification', trust_med:'Integrative Medicine',
    trust_hol:'Holistic Wellness', trust_neuro:'Sound Neuroscience', trust_sessions:'500+ Sessions',
    about_eyebrow:'What is Sound Healing?', about_stat:'satisfaction rate',
    about_h2a:'Finally — an experience', about_h2b:'for your soul',
    about_body:'We are here to help you release stress, restore balance, and heal from within. Through sound, your nervous system finds the deep rest it deserves.',
    about_li1_title:'Theta brainwaves', about_li1_p:'A deep meditative state with no conscious effort',
    about_li2_title:'Nervous system regulation', about_li2_p:'Activates your natural rest and recovery mode',
    about_li3_title:'Proven cortisol reduction', about_li3_p:'Vibrations that lower your body\'s stress hormone',
    sessions_eyebrow:'Our sessions', sessions_h2a:'You don\'t heal alone.', sessions_h2b:'We walk with you.',
    sessions_sub:'Don\'t let stress hold you back. We connect you with the experience that suits you best.',
    card1_title:'Individual Session', card1_p:'An intimate, fully personalized 60-minute experience.', card1_link:'Explore individual session',
    card2_title:'Group Session', card2_p:'Share the magic of the sound bath with others in 90 minutes.', card2_link:'Explore group session',
    card3_title:'Full-Day Retreat', card3_p:'A complete 6-hour journey with sound bath, yoga, and mindful nutrition.', card3_link:'Explore retreat',
    card4_title:'Corporate', card4_p:'Wellness sessions for teams, on-site or at our space.', card4_link:'Explore corporate',
    card5_title:'Virtual Session', card5_p:'Experience healing from anywhere in the world.', card5_link:'Explore virtual',
    card6_title:'Evening Session', card6_p:'Specially designed to improve sleep quality and nighttime recovery.', card6_link:'Explore evening',
    testimonial_text:'Sound Healing is incredibly personal and flexible around my needs. But what I value most is their genuine commitment to my well-being. They feel like an extension of my healthcare team.',
    testimonial_name:'María Claudia Restrepo', testimonial_role:'Head of Wellness, National Company',
    team_h2a:'A wider world', team_h2b:'of healing',
    team_p:'What are the odds that the talent you need lives in your city? Our team of certified facilitators works across multiple languages, time zones, and modalities — bringing you greater reach, deeper sessions, and more transformative results.',
    team_callout:'It\'s time to go beyond the local. No geographic limits.', team_cta:'Get Started',
    steps_eyebrow:'Simple as that', steps_h2a:'Book in', steps_h2b:'4 easy steps',
    steps_p:'We designed the process so you arrive at your session without friction — only intention.', steps_cta:'View availability',
    step1_title:'Tell us about yourself', step1_p:'Share your wellness goals and what you\'re looking to heal.',
    step2_title:'Choose your session type', step2_p:'Individual, group, retreat, or virtual — pick the one that resonates with you.',
    step3_title:'Select date and time', step3_p:'Choose the schedule that works best for you.',
    step4_title:'Receive your confirmation', step4_p:'We send you a Google Calendar invitation and everything you need to know.',
    people_eyebrow:'Our team', people_h2a:'Our facilitators are', people_h2b:'real people',
    people_p1:'For nearly a decade, we have supported the personal growth, well-being, and inner development of hundreds of people through the power of sound.',
    people_p2:'And if you join us, you won\'t be a number either — you\'ll be part of the family.', people_cta:'Meet the team',
    grow_eyebrow:'Join the community', grow_h2a:'A better way to grow…', grow_h2b:'from within',
    grow_p1:'Our passion for growth is fueled by our culture. We celebrate your progress and give you the opportunity to discover the most powerful sound wellness practices.',
    grow_p2:'Want to join our community? Explore our workshops and training programs.', grow_cta:'View open programs',
    booking_eyebrow:'Reserve your space', booking_h2a:'Start building your', booking_h2b:'inner peace',
    booking_p:'We design the perfect session for you. All you need to do is take the first step.',
    form_firstname:'First name', form_lastname:'Last name', form_email:'Email address',
    form_phone:'WhatsApp', form_session:'Session type', form_date:'Date', form_time:'Time',
    form_notes:'Anything we should know?', form_submit:'Confirm booking',
    form_notice:'Your information is private. You will receive a confirmation with a Google Calendar invitation.',
    form_session_ph:'Select a session', form_time_ph:'Select a time',
    form_s_individual:'Individual Session (60 min)', form_s_grupal:'Group Session (90 min)',
    form_s_retiro:'Full-Day Retreat (6 hours)', form_s_empresarial:'Corporate Session', form_s_virtual:'Virtual Session',
    ph_firstname:'Your first name', ph_lastname:'Your last name', ph_notes:'Health conditions, intentions, questions...',
    success_title:'Booking confirmed!', success_p:'Check your inbox — we\'ve sent your Google Calendar invitation.', success_btn:'Book another session',
    bd_loc_title:'Location', bd_loc_p:'Sound Healing Wellness Center · Calle 93 #15-47, Bogotá',
    bd_hours_title:'Hours', bd_hours_p:'Monday to Saturday · 8:00 AM – 7:00 PM',
    bd_wear_title:'What to bring?', bd_wear_p:'Comfortable clothing. Optional mat. Arrive 10 min early.',
    footer_tagline:'Transforming lives through the healing power of sound.',
    footer_col1:'Sessions', footer_col2:'Company', footer_col3:'Resources', footer_col4:'Follow us',
    footer_blog:'Blog', footer_guide:'Sound Bath Guide', footer_faq:'Frequently asked questions',
    footer_med:'Free meditations', footer_cert:'Certifications',
    footer_copy:'© 2025 kaia WELLNESS. All rights reserved.',
    footer_made:'Made with ♥ for your well-being',
  },
  pt: {
    nav_about:'O que é?', nav_sessions:'Sessões', nav_benefits:'Benefícios',
    nav_team:'Facilitadoras', nav_book:'Agendar', nav_cta:'Começar agora',
    hero_eyebrow:'Que experiência você está buscando?',
    hero_h1a:'Uma maneira melhor', hero_h1b:'de curar',
    hero_sub:'Mergulhe em uma jornada de vibrações curativas. Sessões de sound bath para restaurar sua mente, corpo e espírito.',
    hero_cta1:'Agende sua sessão', hero_cta2:'Saiba mais',
    svc_individual:'Individual', svc_grupal:'Grupo', svc_retiro:'Retiro',
    svc_empresarial:'Empresarial', svc_virtual:'Virtual',
    trust_label:'Aprovado por profissionais de saúde integrativa',
    trust_cert:'Certificação IAST', trust_med:'Medicina Integrativa',
    trust_hol:'Bem-estar Holístico', trust_neuro:'Neurociência do Som', trust_sessions:'500+ Sessões',
    about_eyebrow:'O que é Sound Healing?', about_stat:'de satisfação',
    about_h2a:'Finalmente — uma experiência', about_h2b:'para sua alma',
    about_body:'Estamos aqui para ajudá-lo a liberar o estresse, recuperar o equilíbrio e curar por dentro. Através do som, seu sistema nervoso encontra o descanso profundo que merece.',
    about_li1_title:'Ondas cerebrais theta', about_li1_p:'Estado meditativo profundo sem esforço consciente',
    about_li2_title:'Regulação do sistema nervoso', about_li2_p:'Ativa seu modo natural de descanso e recuperação',
    about_li3_title:'Redução de cortisol comprovada', about_li3_p:'Vibrações que diminuem o hormônio do estresse',
    sessions_eyebrow:'Nossas sessões', sessions_h2a:'Não cure sozinho/a.', sessions_h2b:'Estamos com você.',
    sessions_sub:'Não deixe o estresse se tornar um obstáculo. Conectamos você à experiência mais adequada.',
    card1_title:'Sessão Individual', card1_p:'Uma experiência íntima e completamente personalizada de 60 minutos.', card1_link:'Explorar sessão individual',
    card2_title:'Sessão em Grupo', card2_p:'Compartilhe a magia do sound bath com outras pessoas em 90 minutos.', card2_link:'Explorar sessão em grupo',
    card3_title:'Retiro de Um Dia', card3_p:'Jornada completa de 6 horas com sound bath, yoga e alimentação consciente.', card3_link:'Explorar retiro',
    card4_title:'Empresarial', card4_p:'Sessões de bem-estar para equipes de trabalho, in loco ou em nosso espaço.', card4_link:'Explorar corporativo',
    card5_title:'Sessão Virtual', card5_p:'Viva a experiência de cura de qualquer lugar do mundo.', card5_link:'Explorar virtual',
    card6_title:'Sessão Noturna', card6_p:'Especialmente projetada para melhorar o sono e a recuperação noturna.', card6_link:'Explorar noturna',
    testimonial_text:'O Sound Healing é incrivelmente próximo e flexível de acordo com minhas necessidades. Mas o que mais valorizo é o compromisso genuíno com o meu bem-estar. Parecem uma extensão da minha equipe de saúde.',
    testimonial_name:'María Claudia Restrepo', testimonial_role:'Diretora de Bem-estar, Empresa Nacional',
    team_h2a:'Um mundo mais amplo', team_h2b:'de cura',
    team_p:'Qual a probabilidade de que o talento que você precisa viva na sua cidade? Nossa equipe trabalha em múltiplos idiomas, fusos horários e modalidades, trazendo alcance maior, sessões mais profundas e resultados transformadores.',
    team_callout:'É hora de ir além do local. Sem limites geográficos.', team_cta:'Começar agora',
    steps_eyebrow:'Simples assim', steps_h2a:'Agende em', steps_h2b:'4 passos simples',
    steps_p:'Projetamos o processo para que você chegue à sua sessão sem fricções, apenas com intenção.', steps_cta:'Ver disponibilidade',
    step1_title:'Conte-nos sobre você', step1_p:'Compartilhe seus objetivos de bem-estar.',
    step2_title:'Escolha seu tipo de sessão', step2_p:'Individual, grupo, retiro ou virtual — escolha a que mais ressoa com você.',
    step3_title:'Selecione data e hora', step3_p:'Escolha o horário que melhor se adapta à sua agenda.',
    step4_title:'Receba sua confirmação', step4_p:'Enviamos o convite do Google Calendar e tudo que você precisa saber.',
    people_eyebrow:'Nossa equipe', people_h2a:'Nossas facilitadoras são', people_h2b:'pessoas reais',
    people_p1:'Por quase uma década, acompanhamos o crescimento pessoal e o bem-estar de centenas de pessoas através do poder do som.',
    people_p2:'E se você se juntar a nós, também não será um número — será parte da família.', people_cta:'Conheça a equipe',
    grow_eyebrow:'Junte-se à comunidade', grow_h2a:'Uma maneira melhor de crescer…', grow_h2b:'por dentro',
    grow_p1:'Nossa paixão pelo crescimento é alimentada pela nossa cultura. Celebramos seu progresso e damos a você a oportunidade de descobrir as práticas mais poderosas do bem-estar sonoro.',
    grow_p2:'Quer se juntar à nossa comunidade? Descubra nossos workshops e formações.', grow_cta:'Ver formações abertas',
    booking_eyebrow:'Reserve seu espaço', booking_h2a:'Comece a construir sua', booking_h2b:'paz interior',
    booking_p:'Desenhamos a sessão perfeita para você. Só precisa dar o primeiro passo.',
    form_firstname:'Nome', form_lastname:'Sobrenome', form_email:'E-mail',
    form_phone:'WhatsApp', form_session:'Tipo de sessão', form_date:'Data', form_time:'Hora',
    form_notes:'Algo que devemos saber?', form_submit:'Confirmar reserva',
    form_notice:'Suas informações são privadas. Você receberá uma confirmação com convite do Google Calendar.',
    form_session_ph:'Selecione uma sessão', form_time_ph:'Selecione um horário',
    form_s_individual:'Sessão Individual (60 min)', form_s_grupal:'Sessão em Grupo (90 min)',
    form_s_retiro:'Retiro de Um Dia (6 horas)', form_s_empresarial:'Sessão Empresarial', form_s_virtual:'Sessão Virtual',
    ph_firstname:'Seu nome', ph_lastname:'Seu sobrenome', ph_notes:'Condições de saúde, intenções, perguntas...',
    success_title:'Reserva confirmada!', success_p:'Verifique seu e-mail — enviamos o convite do Google Calendar.', success_btn:'Fazer outra reserva',
    bd_loc_title:'Localização', bd_loc_p:'Centro de Bem-estar Sound Healing · Calle 93 #15-47, Bogotá',
    bd_hours_title:'Horários', bd_hours_p:'Segunda a Sábado · 8:00 AM – 7:00 PM',
    bd_wear_title:'O que trazer?', bd_wear_p:'Roupas confortáveis. Tapete opcional. Chegue 10 min antes.',
    footer_tagline:'Transformando vidas através do poder curativo do som.',
    footer_col1:'Sessões', footer_col2:'Empresa', footer_col3:'Recursos', footer_col4:'Siga-nos',
    footer_blog:'Blog', footer_guide:'Guia de Sound Bath', footer_faq:'Perguntas frequentes',
    footer_med:'Meditações grátis', footer_cert:'Certificações',
    footer_copy:'© 2025 kaia WELLNESS. Todos os direitos reservados.',
    footer_made:'Feito com ♥ para o seu bem-estar',
  },
  fr: {
    nav_about:'À propos', nav_sessions:'Séances', nav_benefits:'Bienfaits',
    nav_team:'Facilitatrices', nav_book:'Réserver', nav_cta:'Commencer',
    hero_eyebrow:'Quelle expérience recherchez-vous?',
    hero_h1a:'Une meilleure façon', hero_h1b:'de guérir',
    hero_sub:'Plongez dans un voyage de vibrations curatives. Des séances de sound bath pour restaurer votre esprit, corps et âme.',
    hero_cta1:'Réserver une séance', hero_cta2:'En savoir plus',
    svc_individual:'Individuelle', svc_grupal:'Groupe', svc_retiro:'Retraite',
    svc_empresarial:'Entreprise', svc_virtual:'Virtuelle',
    trust_label:'Approuvé par des professionnels de la santé intégrative',
    trust_cert:'Certification IAST', trust_med:'Médecine Intégrative',
    trust_hol:'Bien-être Holistique', trust_neuro:'Neuroscience du Son', trust_sessions:'500+ Séances',
    about_eyebrow:'Qu\'est-ce que le Sound Healing?', about_stat:'de satisfaction',
    about_h2a:'Enfin — une expérience', about_h2b:'pour votre âme',
    about_body:'Nous sommes ici pour vous aider à libérer le stress, retrouver l\'équilibre et guérir de l\'intérieur. Grâce au son, votre système nerveux trouve le repos profond qu\'il mérite.',
    about_li1_title:'Ondes cérébrales thêta', about_li1_p:'État méditatif profond sans effort conscient',
    about_li2_title:'Régulation du système nerveux', about_li2_p:'Active votre mode naturel de repos et récupération',
    about_li3_title:'Réduction du cortisol prouvée', about_li3_p:'Des vibrations qui réduisent l\'hormone du stress',
    sessions_eyebrow:'Nos séances', sessions_h2a:'Ne guérissez pas seul(e).', sessions_h2b:'Nous vous accompagnons.',
    sessions_sub:'Ne laissez pas le stress devenir un obstacle. Nous vous connectons à l\'expérience qui vous convient.',
    card1_title:'Séance Individuelle', card1_p:'Une expérience intime et entièrement personnalisée de 60 minutes.', card1_link:'Explorer la séance individuelle',
    card2_title:'Séance de Groupe', card2_p:'Partagez la magie du sound bath avec d\'autres personnes en 90 minutes.', card2_link:'Explorer la séance de groupe',
    card3_title:'Retraite d\'une Journée', card3_p:'Journée complète de 6 heures avec sound bath, yoga et alimentation consciente.', card3_link:'Explorer la retraite',
    card4_title:'Entreprise', card4_p:'Séances de bien-être pour les équipes, sur site ou dans notre espace.', card4_link:'Explorer entreprise',
    card5_title:'Séance Virtuelle', card5_p:'Vivez l\'expérience de guérison depuis n\'importe où dans le monde.', card5_link:'Explorer virtuel',
    card6_title:'Séance du Soir', card6_p:'Spécialement conçue pour améliorer le sommeil et la récupération nocturne.', card6_link:'Explorer soirée',
    testimonial_text:'Sound Healing est incroyablement proche et flexible selon mes besoins. Mais ce que j\'apprécie le plus, c\'est leur engagement sincère envers mon bien-être. Ils ressemblent à une extension de mon équipe de santé.',
    testimonial_name:'María Claudia Restrepo', testimonial_role:'Directrice du Bien-être, Entreprise Nationale',
    team_h2a:'Un monde plus vaste', team_h2b:'de guérison',
    team_p:'Quelles sont les chances que le talent dont vous avez besoin vive dans votre ville? Notre équipe travaille en plusieurs langues, fuseaux horaires et modalités, offrant une plus grande portée et des résultats plus transformateurs.',
    team_callout:'Il est temps d\'aller au-delà du local. Sans limites géographiques.', team_cta:'Commencer',
    steps_eyebrow:'Aussi simple que ça', steps_h2a:'Réservez en', steps_h2b:'4 étapes simples',
    steps_p:'Nous avons conçu le processus pour que vous arriviez à votre séance sans friction — seulement avec intention.', steps_cta:'Voir les disponibilités',
    step1_title:'Parlez-nous de vous', step1_p:'Partagez vos objectifs de bien-être.',
    step2_title:'Choisissez votre type de séance', step2_p:'Individuelle, groupe, retraite ou virtuelle — choisissez celle qui vous convient.',
    step3_title:'Choisissez la date et l\'heure', step3_p:'Sélectionnez l\'horaire qui vous convient le mieux.',
    step4_title:'Recevez votre confirmation', step4_p:'Nous vous envoyons l\'invitation Google Calendar et tout ce que vous devez savoir.',
    people_eyebrow:'Notre équipe', people_h2a:'Nos facilitatrices sont', people_h2b:'de vraies personnes',
    people_p1:'Depuis près d\'une décennie, nous accompagnons la croissance personnelle et le bien-être de centaines de personnes grâce au pouvoir du son.',
    people_p2:'Et si vous nous rejoignez, vous ne serez pas un numéro — vous ferez partie de la famille.', people_cta:'Rencontrez l\'équipe',
    grow_eyebrow:'Rejoignez la communauté', grow_h2a:'Une meilleure façon de grandir…', grow_h2b:'de l\'intérieur',
    grow_p1:'Notre passion pour la croissance est alimentée par notre culture. Nous célébrons vos progrès et vous offrons l\'opportunité de découvrir les pratiques de bien-être sonore les plus puissantes.',
    grow_p2:'Vous souhaitez rejoindre notre communauté? Découvrez nos ateliers et formations.', grow_cta:'Voir les formations ouvertes',
    booking_eyebrow:'Réservez votre place', booking_h2a:'Commencez à construire votre', booking_h2b:'paix intérieure',
    booking_p:'Nous concevons la séance parfaite pour vous. Il vous suffit de faire le premier pas.',
    form_firstname:'Prénom', form_lastname:'Nom', form_email:'Adresse e-mail',
    form_phone:'WhatsApp', form_session:'Type de séance', form_date:'Date', form_time:'Heure',
    form_notes:'Quelque chose à nous dire?', form_submit:'Confirmer la réservation',
    form_notice:'Vos informations sont privées. Vous recevrez une confirmation avec une invitation Google Calendar.',
    form_session_ph:'Sélectionnez une séance', form_time_ph:'Sélectionnez une heure',
    form_s_individual:'Séance Individuelle (60 min)', form_s_grupal:'Séance de Groupe (90 min)',
    form_s_retiro:'Retraite d\'une Journée (6 heures)', form_s_empresarial:'Séance Entreprise', form_s_virtual:'Séance Virtuelle',
    ph_firstname:'Votre prénom', ph_lastname:'Votre nom', ph_notes:'Conditions de santé, intentions, questions...',
    success_title:'Réservation confirmée!', success_p:'Vérifiez votre e-mail — nous avons envoyé votre invitation Google Calendar.', success_btn:'Faire une autre réservation',
    bd_loc_title:'Emplacement', bd_loc_p:'Centre de Bien-être Sound Healing · Calle 93 #15-47, Bogotá',
    bd_hours_title:'Horaires', bd_hours_p:'Lundi au Samedi · 8h00 – 19h00',
    bd_wear_title:'Quoi apporter?', bd_wear_p:'Vêtements confortables. Tapis optionnel. Arrivez 10 min avant.',
    footer_tagline:'Transformer des vies grâce au pouvoir curatif du son.',
    footer_col1:'Séances', footer_col2:'Entreprise', footer_col3:'Ressources', footer_col4:'Suivez-nous',
    footer_blog:'Blog', footer_guide:'Guide Sound Bath', footer_faq:'Questions fréquentes',
    footer_med:'Méditations gratuites', footer_cert:'Certifications',
    footer_copy:'© 2025 kaia WELLNESS. Tous droits réservés.',
    footer_made:'Fait avec ♥ pour votre bien-être',
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

/* ── MODALES ─────────────────────────────────────────────── */
const modalOverlay = document.getElementById('modalOverlay');
const modalBody    = document.getElementById('modalBody');
const modalClose   = document.getElementById('modalClose');

const NO_SCROLL_MODALS = ['brand-collab', 'community', 'kaia-tech-lab', 'team'];

function openModal(key) {
  const source = document.getElementById('modal-' + key);
  if (!source) return;
  modalBody.innerHTML = source.innerHTML;
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  const panel = document.getElementById('modalPanel');
  if (NO_SCROLL_MODALS.includes(key)) {
    panel.classList.add('modal-no-scroll');
  } else {
    panel.classList.remove('modal-no-scroll');
  }
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('modalPanel').classList.remove('modal-no-scroll');
  setTimeout(() => { modalBody.innerHTML = ''; }, 300);
}

document.querySelectorAll('[data-modal]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openModal(link.dataset.modal);
  });
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ── HERO SERVICE BUTTONS → BOOKING ─────────────────────── */
document.querySelectorAll('.hero-svc[data-session]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sessionType = document.getElementById('sessionType');
    if (sessionType) sessionType.value = btn.dataset.session;
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  });
});

function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
}
