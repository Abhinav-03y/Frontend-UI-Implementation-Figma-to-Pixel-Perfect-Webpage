const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Recommendations carousel =====
const viewport = document.querySelector('.reviews-viewport');
const track = document.querySelector('.reviews-track');
const slides = track ? Array.from(track.children) : [];
const dots = document.querySelectorAll('.slider-dot');
let currentIndex = 2;                       // 3rd dot is active in the design

function updateSlide(index, animate = true) {
  currentIndex = Math.max(0, Math.min(index, slides.length - 1));

  // scale the 1246px design down on narrow screens (never below 0.85),
  // so the cut-off cards at both edges stay visible
  const scale = Math.min(1, Math.max(0.85, viewport.clientWidth / 1246));
  viewport.parentElement.style.setProperty('--s', scale);

  // centre the active review card inside the (unscaled) stage
  const slide = slides[currentIndex];
  const card = slide.firstElementChild;
  const stageWidth = viewport.clientWidth / scale;
  // design sits 1px left of true centre
  const offset = Math.floor((stageWidth - card.offsetWidth) / 2) - 1 - slide.offsetLeft;

  track.classList.toggle('is-ready', animate);
  track.style.transform = `translateX(${offset}px)`;

  dots.forEach((dot, i) => {
    const isActive = i === currentIndex;
    dot.classList.toggle('active', isActive);
    if (isActive) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}

if (track) {
  dots.forEach((dot, index) => dot.addEventListener('click', () => updateSlide(index)));

  // keyboard: arrow keys when the carousel has focus
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') updateSlide(currentIndex + 1);
    if (e.key === 'ArrowLeft') updateSlide(currentIndex - 1);
  });

  // touch / mouse swipe
  let startX = null;
  viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  viewport.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 50) updateSlide(currentIndex + (delta < 0 ? 1 : -1));
    startX = null;
  });

  window.addEventListener('resize', () => updateSlide(currentIndex, false));
  window.addEventListener('load', () => updateSlide(currentIndex, false));
  updateSlide(currentIndex, false);
}

// ===== Contact form validation =====
(() => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  const status = document.getElementById('formStatus');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // required fields and their messages
  const rules = {
    fullName: { required: 'Please enter your full name.' },
    email:    { required: 'Please enter your email address.',
                invalid: 'Please enter a valid email address.' },
    message:  { required: 'Please write a message.' },
  };

  function showError(input, text) {
    const error = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', 'true');
    error.textContent = text;
    error.hidden = false;
  }

  function clearError(input) {
    const error = document.getElementById(`${input.id}-error`);
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    error.hidden = true;
  }

  // returns true when the field is valid
  function validateField(input) {
    const rule = rules[input.id];
    const value = input.value.trim();

    if (!value) { showError(input, rule.required); return false; }
    if (input.id === 'email' && !emailPattern.test(value)) {
      showError(input, rule.invalid);
      return false;
    }
    clearError(input);
    return true;
  }

  // fix errors as the visitor types
  Object.keys(rules).forEach((id) => {
    const input = contactForm.querySelector(`#${id}`);
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const inputs = Object.keys(rules).map((id) => contactForm.querySelector(`#${id}`));
    const results = inputs.map(validateField);

    if (results.includes(false)) {
      inputs[results.indexOf(false)].focus();        // jump to the first problem
      status.classList.add('is-error');
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    // Simulated submission feedback
    submitBtn.disabled = true;
    submitBtn.innerText = 'SENDING...';

    setTimeout(() => {
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerText = 'SEND MESSAGE';
      status.classList.add('is-success');
      status.textContent = 'Message received! Thank you for getting in touch.';
    }, 1000);
  });
})();