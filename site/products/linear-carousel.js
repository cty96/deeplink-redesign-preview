'use strict';
// Finite horizontal track: a featured case with a preview of the next one.
document.querySelectorAll('.linear-carousel').forEach(carousel=>{
  const viewport=carousel.querySelector('.case-viewport');
  const track=carousel.querySelector('.case-track');
  const slides=[...track.children],dots=[...carousel.querySelectorAll('.case-dot')];
  const prev=carousel.querySelector('.case-prev'),next=carousel.querySelector('.case-next');
  const caption=carousel.querySelector('.case-current-title');
  if(!slides.length)return;
  let current=0,step=0,start=null;
  const paint=()=>{
    const offset=Math.min(current*step,Math.max(0,track.scrollWidth-viewport.clientWidth));
    track.style.transform=`translateX(${-offset}px)`;
    carousel.dataset.activeIndex=current;
    carousel.dataset.atEnd=String(current===slides.length-1);
    slides.forEach((slide,i)=>{
      slide.setAttribute('aria-hidden',String(i!==current));
      slide.querySelectorAll('a,button').forEach(link=>{link.tabIndex=i===current?0:-1;});
    });
    dots.forEach((dot,i)=>{if(i===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
    prev.disabled=current===0;next.disabled=current===slides.length-1;
    const title=slides[current].querySelector('h3').textContent;
    if(caption)caption.textContent=title;
    carousel.querySelector('.case-live').textContent=title;
  };
  const go=index=>{current=Math.max(0,Math.min(slides.length-1,index));paint();};
  const layout=()=>{step=slides[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);paint();};
  prev.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
  carousel.addEventListener('keydown',e=>{
    const index=e.key==='ArrowLeft'?current-1:e.key==='ArrowRight'?current+1:e.key==='Home'?0:e.key==='End'?slides.length-1:null;
    if(index!==null){e.preventDefault();go(index);}
  });
  viewport.addEventListener('pointerdown',e=>{
    if(e.target.closest('a,button')||(e.pointerType==='mouse'&&(e.button!==0||e.target.closest('.case-copy'))))return;
    start={x:e.clientX,y:e.clientY};e.target.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener('pointerup',e=>{
    if(!start)return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)go(current+(dx<0?1:-1));
  });
  viewport.addEventListener('pointercancel',()=>{start=null;});
  let wheel=0,lastWheel=0;
  viewport.addEventListener('wheel',e=>{
    if(e.ctrlKey||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
    e.preventDefault();if(Date.now()-lastWheel<500)return;
    wheel+=e.deltaX;
    if(Math.abs(wheel)>60){go(current+(wheel>0?1:-1));wheel=0;lastWheel=Date.now();}
  },{passive:false});
  if('ResizeObserver' in window)new ResizeObserver(layout).observe(viewport);
  else window.addEventListener('resize',layout);
  layout();
});
