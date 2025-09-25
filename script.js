 /* ========= helpers ========= */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========= active link on scroll (section spy) ========= */
(() => {
  const links = $$('.menu a');
  const map = new Map(
    links.map(a => a.getAttribute('href'))
         .filter(h => h && h.startsWith('#'))
         .map(h => [h.slice(1), links.find(a => a.getAttribute('href')===h)])
  );

  const spy = new IntersectionObserver((entries) => {
    const visible = entries.filter(e=>e.isIntersecting)
      .sort((a,b)=> b.intersectionRatio - a.intersectionRatio
        || Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
    if (!visible.length) return;
    const id = visible[0].target.id;
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href')==='#'+id));
  }, { rootMargin: '-20% 0px -70% 0px', threshold:[0,.25,.5,.75,1] });

  $$('section[id]').forEach(s => spy.observe(s));

  // Smooth scroll met offset (nav ~92px)
  links.forEach(a => {
    const href = a.getAttribute('href')||'';
    if (!href.startsWith('#')) return;
    on(a, 'click', (e) => {
      const el = $(href); if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + scrollY - 92;
      scrollTo({ top:y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.pushState(null,'',href);
    });
  });

  on(window,'hashchange',()=>{
    const el = $(location.hash); if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY - 92;
    scrollTo({ top:y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();

/* ========= mobile menu ========= */
(() => {
  const burger = $('[data-burger]'); const menu = $('[data-menu]');
  if (!burger || !menu) return;

  const open = () => { menu.classList.add('open'); burger.setAttribute('aria-expanded','true'); document.body.classList.add('no-scroll'); trapFocus(menu); };
  const close = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded','false'); document.body.classList.remove('no-scroll'); releaseFocus(); burger.focus(); };

  on(burger,'click',()=> menu.classList.contains('open') ? close() : open());
  $$('.menu a').forEach(a => on(a,'click',close));
  on(document,'keydown',(e)=>{ if(e.key==='Escape' && menu.classList.contains('open')) close(); });

  let prevFocus=null;
  function trapFocus(container){
    prevFocus=document.activeElement;
    const focusables = $$('a,button,select,textarea,input,[tabindex]:not([tabindex="-1"])',container).filter(el=>!el.disabled);
    focusables[0]?.focus();
    const first=focusables[0], last=focusables.at(-1);
    const handler=(e)=>{
      if(e.key!=='Tab' || !focusables.length) return;
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    };
    container.__trapHandler = handler;
    on(container,'keydown',handler);
  }
  function releaseFocus(){
    const h = menu.__trapHandler; if(h) menu.removeEventListener('keydown',h), delete menu.__trapHandler;
    prevFocus?.focus?.();
  }
})();

/* ========= reveal on scroll ========= */
(() => {
  const els = $$('.reveal'); if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('_in'); io.unobserve(e.target); }});
  }, { rootMargin:'0px 0px -10% 0px', threshold:.2 });
  els.forEach(el=>io.observe(el));
})();

/* ========= project video handling ========= */
(() => {
  const cards = $$('.projects .card'); if(!cards.length) return;

  cards.forEach(card=>{
    const v = $('video',card); if(!v) return;
    const play = ()=> v.play().catch(()=>{});
    const stop = ()=> { v.pause(); v.currentTime = 0; };

    on(card,'mouseenter',play);
    on(card,'mouseleave',stop);
    on(card,'click',()=> v.paused ? v.play() : v.pause());
  });

  // pauzeer als kaart buiten beeld is
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(({isIntersecting,target})=>{
      const v = $('video',target); if(!v) return;
      if(!isIntersecting) v.pause();
    });
  },{threshold:.05});
  cards.forEach(c=>io.observe(c));
})();

/* ========= rotating favicon (canvas) =========
   - gebruikt <link id="favicon" href="...">
   - pauzeert bij tab in achtergrond
   - respecteert prefers-reduced-motion en Save-Data
================================================ */
(() => {
  const link = $('#favicon'); if(!link) return;
  const saveData = (navigator.connection && navigator.connection.saveData) ? true : false;
  if (prefersReducedMotion || saveData) return; // respect user settings

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = link.getAttribute('href') || './favicon/android-chrome-512x512.png';

  const dpr = Math.min(Math.max(Math.round(devicePixelRatio || 1),1),3);
  const size = 32 * dpr; // crisp op hiDPI
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  let angle = 0, rafId=null, running=false;

  function frame(ts){
    ctx.clearRect(0,0,size,size);
    ctx.save();
    ctx.translate(size/2,size/2);
    // easing: versnelt/vertr; sinus voor action vibe
    const speed = 0.06 + 0.02*Math.sin(ts/480);
    angle = (angle + speed) % (Math.PI*2);
    ctx.rotate(angle);
    ctx.drawImage(img, -size/2, -size/2, size, size);
    ctx.restore();
    link.href = canvas.toDataURL('image/png');
    rafId = requestAnimationFrame(frame);
  }
  function start(){ if(running) return; running=true; rafId = requestAnimationFrame(frame); }
  function stop(){ running=false; if(rafId) cancelAnimationFrame(rafId); }

  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
  img.onload = start;
})();
 
