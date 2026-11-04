(() => {
  'use strict';
  const main=document.querySelector('body.prd-strict > main');
  if(!main||main.dataset.scrollRevealReady)return;
  main.dataset.scrollRevealReady='true';
  if(!('IntersectionObserver' in window))return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const groups=[...main.querySelectorAll('section.content > .wrap, .prd-introduction > .introduction-detail')];
  const targets=[];
  groups.forEach(group=>{
    [...group.children].filter(el=>!el.matches('script,style,nav')).forEach((el,index)=>{
      el.style.setProperty('--dl-reveal-delay',index===0?'0ms':'80ms');
      targets.push(el);
    });
  });
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)entry.target.classList.add('is-revealed');
      // Like the homepage, replay when scrolling down to a group again after
      // it has moved fully below the viewport. Keep groups above the view readable.
      else if(entry.boundingClientRect.top>=innerHeight)entry.target.classList.remove('is-revealed');
    });
  },{threshold:0,rootMargin:'0px 0px -24px 0px'});
  const configure=()=>{
    observer.disconnect();
    targets.forEach(el=>{
      el.classList.remove('dl-scroll-reveal','is-revealed');
      if(!reduced.matches){el.classList.add('dl-scroll-reveal');observer.observe(el);}
    });
  };
  // Keyboard navigation must never land on visually hidden content.
  main.addEventListener('focusin',event=>{
    const target=event.target.closest('.dl-scroll-reveal');
    if(target)target.classList.add('is-revealed');
  });
  reduced.addEventListener('change',configure);
  configure();
})();
