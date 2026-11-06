'use strict';
const mobileToggle=document.querySelector('.mobile-toggle');
mobileToggle?.addEventListener('click',()=>{const open=mobileToggle.getAttribute('aria-expanded')!=='true';mobileToggle.setAttribute('aria-expanded',String(open));document.querySelector('.main-nav').classList.toggle('open',open);});
document.addEventListener('click',e=>{document.querySelectorAll('.nav-product[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.nav-product[open]').forEach(d=>d.open=false);document.querySelector('.main-nav')?.classList.remove('open');mobileToggle?.setAttribute('aria-expanded','false');}});
document.querySelectorAll('[role=tablist]').forEach(list=>{
 const tabs=[...list.querySelectorAll('[role=tab]')];
 const activate=tab=>{tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;const description=t.querySelector('.feature-description');if(description)description.hidden=!selected;});};
 tabs.forEach(tab=>tab.addEventListener('focus',()=>tab.scrollIntoView({block:'nearest',inline:'nearest'})));
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{const vertical=list.getAttribute('aria-orientation')==='vertical';let n;if(e.key===(vertical?'ArrowDown':'ArrowRight'))n=(i+1)%tabs.length;if(e.key===(vertical?'ArrowUp':'ArrowLeft'))n=(i-1+tabs.length)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();activate(tabs[n]);tabs[n].focus();}});});
});
if('IntersectionObserver' in window){
 const navLinks=[...document.querySelectorAll('.subnav a[href^="#"]:not(.sub-cta)')];
 const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{rootMargin:'-145px 0px -58% 0px',threshold:0});
 navLinks.forEach(a=>{const s=document.querySelector(a.hash);if(s)navObserver.observe(s);});
 if(!matchMedia('(prefers-reduced-motion:reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.04});document.querySelectorAll('.reveal').forEach(e=>{e.classList.add('js-reveal');observer.observe(e);});}
}

// Keep the homepage-style section capsule available beyond the intro section.
const sectionNav=document.querySelector('.section-nav');
const sectionDock=document.querySelector('.section-nav-dock');
if(sectionNav&&sectionDock){
 const sectionLinks=[...sectionNav.querySelectorAll('a[href^="#"]')];
 const targets=sectionLinks.map(link=>document.getElementById(link.hash.slice(1)));
 const setCurrent=index=>sectionLinks.forEach((link,i)=>{
  link.classList.toggle('active',i===index);
  if(i===index)link.setAttribute('aria-current','location');
  else link.removeAttribute('aria-current');
 });
 const currentOffset=()=>parseFloat(getComputedStyle(document.body).getPropertyValue('--anchor-top'))||80;
 const updateCurrent=()=>{
  let current=0;
  targets.forEach((target,i)=>{if(target&&target.getBoundingClientRect().top<=currentOffset()+100)current=i;});
  setCurrent(current);
 };
 sectionLinks.forEach((link,i)=>{
  link.addEventListener('click',()=>setCurrent(i));
  link.addEventListener('focus',()=>link.scrollIntoView({block:'nearest',inline:'nearest'}));
 });
 let dockObserver,headingObserver;
 const observeNavigation=()=>{
  if(dockObserver)dockObserver.disconnect();
  if(headingObserver)headingObserver.disconnect();
  const offset=currentOffset();
  dockObserver=new IntersectionObserver(entries=>{
   const entry=entries[0];
   sectionNav.classList.toggle('is-fixed',!entry.isIntersecting&&entry.boundingClientRect.top<offset);
  },{rootMargin:`-${offset}px 0px 0px 0px`,threshold:0});
  dockObserver.observe(sectionDock.querySelector('.section-nav-sentinel'));
  headingObserver=new IntersectionObserver(updateCurrent,{rootMargin:`-${offset}px 0px -60% 0px`,threshold:[0,1]});
  targets.forEach(target=>{if(target)headingObserver.observe(target.querySelector('.section-head, .solution-module-heading')||target);});
  updateCurrent();
 };
 if('IntersectionObserver' in window){
  observeNavigation();
  let resizeFrame;
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(observeNavigation);});
  let scrollFrame;
  window.addEventListener('scroll',()=>{cancelAnimationFrame(scrollFrame);scrollFrame=requestAnimationFrame(updateCurrent);},{passive:true});
 }
}
const productDisclosure=document.querySelector('.nav-product');
if(productDisclosure){
 const trigger=productDisclosure.querySelector('summary');
 trigger.setAttribute('aria-expanded',String(productDisclosure.open));
 productDisclosure.addEventListener('toggle',()=>trigger.setAttribute('aria-expanded',String(productDisclosure.open)));
 productDisclosure.addEventListener('keydown',event=>{
  if(event.key==='Escape'){productDisclosure.open=false;trigger.focus();}
 });
 productDisclosure.querySelectorAll('.product-mega-card').forEach(link=>link.addEventListener('click',()=>{productDisclosure.open=false;}));
}

// Spotlight the ten regional centers; manual selection pauses the tour.
document.querySelectorAll('.geo-stage').forEach(stage=>{
 const buttons=[...stage.querySelectorAll('.geo-label')];
 const regions=[...stage.querySelectorAll('.geo-region')];
 const centers=regions.filter(region=>!region.classList.contains('geo-campus')).map(region=>region.dataset.region);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let selected=null,hovered=null,focused=null,index=0,visible=!('IntersectionObserver' in window),timer=null;
 const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
 const paint=()=>{
  const name=focused||hovered||selected||(visible?centers[index]:null);
  stage.dataset.activeRegion=name||'';
  regions.forEach(region=>region.classList.toggle('is-active',region.dataset.region===name));
  buttons.forEach(button=>button.classList.toggle('is-spotlight',button.dataset.region===name));
 };
 const schedule=()=>{
  stop();
  if(centers.length&&visible&&!document.hidden&&!reduced.matches&&!selected&&!hovered&&!focused){
   timer=setTimeout(()=>{timer=null;index=(index+1)%centers.length;paint();schedule();},2400);
  }
 };
 buttons.forEach(button=>{
  const name=button.dataset.region;
  button.addEventListener('pointerenter',()=>{hovered=name;paint();schedule();});
  button.addEventListener('pointerleave',()=>{hovered=null;paint();schedule();});
  button.addEventListener('focus',()=>{focused=name;paint();schedule();});
  button.addEventListener('blur',()=>{focused=null;paint();schedule();});
  button.addEventListener('click',()=>{
   selected=selected===name?null:name;
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.region===selected)));
   paint();schedule();
  });
 });
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   visible=entries[0].isIntersecting;stage.classList.toggle('is-visible',visible);paint();schedule();
  },{threshold:.2});
  observer.observe(stage);
 }
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{paint();schedule();});
 paint();schedule();
});

// Case carousels share controls, keyboard and swipe handling; layout is set by their class.
document.querySelectorAll('.case-carousel:not(.linear-carousel)').forEach(carousel=>{
 const viewport=carousel.querySelector('.case-viewport');
 const slides=[...carousel.querySelectorAll('.case-slide')];
 const dots=[...carousel.querySelectorAll('.case-dot')];
 const live=carousel.querySelector('.case-live');
 let current=0,start=null,wheelAmount=0,lastWheel=-Infinity;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let enabled=!reduced.matches,hoveredCard=null,focused=false,visible=!('IntersectionObserver' in window),timer=null;
 const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
 const schedule=()=>{
  stop();
  if(enabled&&!hoveredCard&&!focused&&!start&&visible&&!document.hidden){
   timer=setTimeout(()=>{timer=null;update(current+1);schedule();},4000);
  }
 };
 carousel.addEventListener('focusin',event=>{focused=Boolean(event.target?.matches?.(':focus-visible'));schedule();});
 carousel.addEventListener('focusout',event=>{focused=Boolean(carousel.contains(event.relatedTarget)&&event.relatedTarget?.matches?.(':focus-visible'));schedule();});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{enabled=!reduced.matches;schedule();});
 if('IntersectionObserver' in window){
  const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.2});
  visibility.observe(carousel);
 }
 const update=index=>{
  current=(index+slides.length)%slides.length;
  if(hoveredCard!==slides[current])hoveredCard=null;
  dots.forEach((dot,i)=>{if(i===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
  slides.forEach((slide,i)=>{
   let distance=(i-current+slides.length)%slides.length;
   if(distance>slides.length/2)distance-=slides.length;
   const position=({'0':'active','1':'next','2':'next-far','3':'next-back','-1':'previous','-2':'previous-far','-3':'previous-back'})[distance]||'hidden';
   slide.setAttribute('data-position',position);
   slide.setAttribute('aria-hidden',String(i!==current));
   slide.querySelectorAll('a,button').forEach(link=>{link.tabIndex=i===current?0:-1;});
  });
 };
 const go=index=>{update(index);schedule();live.textContent=`${current+1} / ${slides.length}，${slides[current].querySelector('h3').textContent}`;};
 carousel.querySelector('.case-prev').addEventListener('click',()=>go(current-1));
 carousel.querySelector('.case-next').addEventListener('click',()=>go(current+1));
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
 slides.forEach((slide,i)=>{
  slide.addEventListener('click',()=>{if(i!==current)go(i);});
  slide.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&i===current){hoveredCard=slide;stop();}});
  slide.addEventListener('pointerleave',()=>{if(hoveredCard===slide){hoveredCard=null;schedule();}});
 });
 carousel.addEventListener('keydown',event=>{
  const index=event.key==='ArrowLeft'?current-1:event.key==='ArrowRight'?current+1:event.key==='Home'?0:event.key==='End'?slides.length-1:null;
  if(index!==null){event.preventDefault();go(index);}
 });
 viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&(event.button!==0||event.target?.closest?.('.case-copy')))return;
  start={x:event.clientX,y:event.clientY};stop();
  if(event.pointerId!==undefined)event.target?.setPointerCapture?.(event.pointerId);
 });
 viewport.addEventListener('pointercancel',()=>{start=null;schedule();});
 viewport.addEventListener('lostpointercapture',()=>{if(start){start=null;schedule();}});
 viewport.addEventListener('pointerup',event=>{
  if(!start)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;schedule();
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){
   go(current+(dx<0?1:-1));
   // Suppress the synthesized tap after a swipe, without blocking normal side-card taps.
   const suppress=event=>{event.preventDefault();event.stopPropagation();};
   viewport.addEventListener('click',suppress,{capture:true,once:true});
   setTimeout(()=>viewport.removeEventListener('click',suppress,true),350);
  }
 });
 viewport.addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;
  event.preventDefault();
  const now=Date.now();
  if(now-lastWheel<500)return;
  wheelAmount+=event.deltaX;
  if(Math.abs(wheelAmount)>=60){go(current+(wheelAmount>0?1:-1));wheelAmount=0;lastWheel=now;}
 },{passive:false});
 update(0);schedule();
});

// Feature cards: native horizontal scrolling, with buttons and keyboard access.
document.querySelectorAll('.feature-rail').forEach(rail=>{
 const track=rail.querySelector('.product-features');
 const cards=[...track.querySelectorAll('.product-feature')];
 const previous=rail.querySelector('.feature-prev');
 const next=rail.querySelector('.feature-next');
 const progress=rail.querySelector('progress');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const update=()=>{
  const max=Math.max(0,track.scrollWidth-track.clientWidth);
  previous.disabled=track.scrollLeft<=2;
  next.disabled=track.scrollLeft>=max-2;
  progress.value=max?Math.min(1,Math.max(0,track.scrollLeft/max)):1;
 };
 const move=direction=>{
  const gap=parseFloat(getComputedStyle(track).columnGap)||0;
  const step=cards[0].getBoundingClientRect().width+gap;
  track.scrollBy({left:step*direction,behavior:reduced.matches?'instant':'smooth'});
 };
 previous.addEventListener('click',()=>move(-1));
 next.addEventListener('click',()=>move(1));
 track.addEventListener('keydown',event=>{
  if(event.target!==track)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();move(event.key==='ArrowRight'?1:-1);
  }else if(event.key==='Home'||event.key==='End'){
   event.preventDefault();track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:reduced.matches?'instant':'smooth'});
  }
 });
 track.addEventListener('scroll',update,{passive:true});
 window.addEventListener('resize',update);
 update();
});

// Run the optimization flow only while it is on screen and the page is visible.
document.querySelectorAll('.evolution-flow').forEach(flow=>{
 let visible=!('IntersectionObserver' in window);
 const update=()=>flow.classList.toggle('is-flow-active',visible&&!document.hidden);
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.2});
  observer.observe(flow);
 }
 document.addEventListener('visibilitychange',update);
 update();
});
