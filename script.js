
    // Active link highlight on scroll
    const sections=[...document.querySelectorAll('section[id]')];
    const links=[...document.querySelectorAll('.menu a')];
    const setActive=()=>{const y=scrollY+120;let cur=sections[0]?.id;sections.forEach(s=>{if(s.offsetTop<=y)cur=s.id});links.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+cur));};
    setActive(); addEventListener('scroll',setActive);

    // Mobile menu
    const burger=document.querySelector('[data-burger]');
    const menu=document.querySelector('[data-menu]');
    burger?.addEventListener('click',()=>{menu.classList.toggle('open'); burger.setAttribute('aria-expanded',menu.classList.contains('open')); document.body.classList.toggle('no-scroll', menu.classList.contains('open'));});
    links.forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open'); burger?.setAttribute('aria-expanded','false'); document.body.classList.remove('no-scroll');}));

    // Reveal on scroll
    const io=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('_in'); io.unobserve(e.target)}})},{threshold:.24});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

    // Autoplay hover for project videos
    document.querySelectorAll('.projects .card video').forEach(v=>{
      const play=()=>{v.play().catch(()=>{})};
      const stop=()=>{v.pause(); v.currentTime=0};
      v.closest('.card').addEventListener('mouseenter', play);
      v.closest('.card').addEventListener('mouseleave', stop);
      // tap to toggle on mobile
      v.closest('.card').addEventListener('click', ()=>{ if(v.paused) v.play(); else v.pause();});
    });
 