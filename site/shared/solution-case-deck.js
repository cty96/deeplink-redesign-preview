(() => {
  if(customElements.get('deeplink-case-deck'))return;
  class CaseDeck extends HTMLElement {
    async connectedCallback(){
      this.active=0;this.drag=null;this.motion=matchMedia('(prefers-reduced-motion:reduce)');
      this.hovered=false;this.focused=false;this.visible=!('IntersectionObserver' in window);
      try {
        const url=this.getAttribute('src');if(!url)return;
        const response=await fetch(url);if(!response.ok)throw new Error('Case data unavailable');
        this.items=await response.json();if(!this.isConnected)return;
        const escape=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
        this.setAttribute('role','region');this.setAttribute('aria-roledescription','轮播');this.setAttribute('aria-label','案例和用户评价');
        this.innerHTML='<div class="v2-case-viewport" tabindex="0" aria-label="左右方向键或拖动切换案例">'+this.items.map((item,i)=>'<article class="v2-case-card" role="group" aria-label="'+(i+1)+' / '+this.items.length+'"><h3><img src="'+escape(item.logo)+'" alt="'+escape(item.name)+'" draggable="false"></h3>'+item.paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('')+'</article>').join('')+'</div><div class="v2-case-controls"><button type="button" class="v2-case-prev" aria-label="上一个案例"><img src="/deeplink-redesign-preview/home-assets/figma-v2-20261117/solution-cases/7e2e0.svg" width="20" height="20" alt=""></button><div class="v2-case-dots">'+this.items.map((item,i)=>'<button type="button" aria-label="第'+(i+1)+'个案例：'+escape(item.name)+'" data-index="'+i+'"></button>').join('')+'</div><button type="button" class="v2-case-next" aria-label="下一个案例"><img src="/deeplink-redesign-preview/home-assets/figma-v2-20261117/solution-cases/a9102.svg" width="20" height="20" alt=""></button></div><p class="v2-case-live" aria-live="polite"></p>';
        this.cards=[...this.querySelectorAll('.v2-case-card')];this.cards.forEach((card,i)=>card.onclick=()=>{if(this.dragged){this.dragged=false;return;}if(i!==this.active)this.select(i);});this.dots=[...this.querySelectorAll('[data-index]')];
        this.querySelector('.v2-case-prev').onclick=()=>this.select(this.active-1);this.querySelector('.v2-case-next').onclick=()=>this.select(this.active+1);
        this.dots.forEach((button,i)=>button.onclick=()=>this.select(i));
        const viewport=this.querySelector('.v2-case-viewport');
        viewport.onkeydown=event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();this.select(this.active+(event.key==='ArrowRight'?1:-1));}};
        viewport.onpointerdown=event=>{if(event.isPrimary){this.dragged=false;this.drag={x:event.clientX,y:event.clientY};this.schedule();}};
        viewport.onpointerup=event=>{if(!this.drag)return;const dx=event.clientX-this.drag.x,dy=event.clientY-this.drag.y;this.drag=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){this.dragged=true;this.select(this.active+(dx<0?1:-1));}else this.schedule();};viewport.onpointercancel=()=>{this.drag=null;this.schedule();};
        this.onpointerenter=event=>{if(event.pointerType!=='touch'){this.hovered=true;this.schedule();}};
        this.onpointerleave=()=>{this.hovered=false;this.schedule();};
        this.onfocusin=()=>{this.focused=true;this.schedule();};
        this.onfocusout=event=>{if(!this.contains(event.relatedTarget)){this.focused=false;this.schedule();}};
        this.onVisibility=()=>this.schedule();this.onMotion=()=>this.schedule();
        document.addEventListener('visibilitychange',this.onVisibility);
        this.motion.addEventListener('change',this.onMotion);
        if('IntersectionObserver' in window){
          this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.schedule();},{threshold:.2});
          this.observer.observe(this);
        }
        this.select(0);
      }catch(error){this.innerHTML='<p class="v2-case-error">案例暂时无法加载，请刷新页面重试。</p>';}
    }
    disconnectedCallback(){clearTimeout(this.timer);this.observer?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);this.motion?.removeEventListener('change',this.onMotion);}
    schedule(){
      clearTimeout(this.timer);
      if(this.isConnected&&this.items?.length>1&&this.visible&&!this.hovered&&!this.focused&&!this.drag&&!document.hidden&&!this.motion.matches){
        this.timer=setTimeout(()=>this.select(this.active+1,false),2000);
      }
    }
    select(index,announce=true){const count=this.items.length;this.active=(index+count)%count;this.cards.forEach((card,i)=>{const distance=((i-this.active+count+Math.floor(count/2))%count)-Math.floor(count/2);card.style.setProperty('--case-offset',distance);card.style.setProperty('--case-x',([0,411.6,537.6,243.6][Math.abs(distance)]*Math.sign(distance))+'px');card.style.setProperty('--case-y',[0,-36,-111,-151][Math.abs(distance)]+'px');card.style.setProperty('--case-opacity',[1,.84,.55,.35][Math.abs(distance)]);card.style.setProperty('--case-scale',[1,.78,.56,.45][Math.min(3,Math.abs(distance))]);card.style.zIndex=10-Math.abs(distance);card.classList.toggle('is-active',distance===0);card.setAttribute('aria-hidden',String(distance!==0));this.dots[i].setAttribute('aria-current',String(i===this.active));});if(announce)this.querySelector('.v2-case-live').textContent=this.items[this.active].name+'，'+(this.active+1)+' / '+count;this.schedule();}
  }
  customElements.define('deeplink-case-deck',CaseDeck);
})();
