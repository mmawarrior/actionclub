// Mobile menu
// Mobile menu
const burger = document.querySelector('[data-burger]');
const menu = document.querySelector('[data-menu]');

if (burger && menu) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open); // voeg ook open-class toe
    burger.setAttribute('aria-expanded', open);
  });

  // Sluit menu bij klik op een link
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
}


// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('_in');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Hover/tap play for case videos
document.querySelectorAll('[data-hover="play"]').forEach((v) => {
  v.addEventListener('mouseenter', () => v.play().catch(() => {}));
  v.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
  v.addEventListener('touchstart', () => v.play().catch(() => {}), { passive: true });
});

// Respect reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
}

// Nav drop shadow on scroll
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
}

// Contact: autogrow + counter + toast
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const ta = form.querySelector('textarea.js-autogrow');
  const counter = document.getElementById('msgCount');

  const update = () => {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
    if (counter) counter.textContent = String(ta.value.length);
  };
  if (ta) {
    ta.addEventListener('input', update);
    window.addEventListener('load', update);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.company && form.company.value) return; // honeypot
    const toast = form.querySelector('.toast');
    if (toast) {
      toast.hidden = false;
      toast.textContent = 'Bedankt! We nemen snel contact op.';
      setTimeout(() => { toast.hidden = true; }, 3500);
    }
    form.reset();
    update();
  });
})();
