(() => {
  const products = [{"name": "混合训推一体工具链", "description": "支持国产多芯片异构、跨域的训推一体化工具链。", "href": "/deeplink-redesign-preview/products/training.html", "art": "training-card-ice-crop-20261103.png"}, {"name": "智能算子迁移系统", "description": "KernelSwift，让高性能算子开发从手工编码走向一键生成。", "href": "/deeplink-redesign-preview/products/kernelswift.html", "art": "kernelswift-card-ice-crop-20261103.png"}, {"name": "超智融合平台", "description": "打通超算与智算壁垒，构建超级算力枢纽。", "href": "https://deepfusion.deeplink.org.cn/#/login", "art": "fusion-card-ice-crop-20261103.png"}, {"name": "全环节软硬件验证平台", "description": "构建中立、可信、开放的人工智能验证生态体系。", "href": "/deeplink-redesign-preview/deepeval", "art": "verification-user-20261105.png"}];
  const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-5-5 5 5-5 5"/></svg>';
  const external = item => item.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : '';
  const initialize = () => {
    const root = document.querySelector('#products .product-showcase');
    if (!root || root.classList.contains('product-scene')) return;
    root.className = 'product-showcase product-scene';
    root.setAttribute('aria-label','系列产品互动展示');
    const panels = products.map((item,index) => {
      const art = index === 3
        ? `<svg viewBox="960 150 1088 820" aria-hidden="true"><image href="/deeplink-redesign-preview/products/assets/${item.art}" width="2048" height="1060"/></svg>`
        : `<img src="/deeplink-redesign-preview/products/assets/${item.art}" alt="" width="724" height="724" decoding="async">`;
      return `<div class="product-scene-panel${index === 0 ? ' is-active' : ''}" id="product-scene-panel-${index}" role="tabpanel" aria-labelledby="product-scene-tab-${index}" aria-hidden="${index !== 0}"${index ? ' inert' : ''}><span class="product-scene-watermark" aria-hidden="true">${index === 1 ? 'KernelSwift' : 'DeepLink'}</span><div class="product-scene-illustration">${art}</div></div>`;
    }).join('');
    const tabs = products.map((item,index) => `<button class="product-scene-tab" id="product-scene-tab-${index}" type="button" role="tab" aria-controls="product-scene-panel-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${item.name}</button>`).join('');
    root.innerHTML = `<div class="product-scene-stage">${panels}<button class="product-scene-arrow is-prev" type="button" aria-label="上一个产品">${chevron}</button><button class="product-scene-arrow is-next" type="button" aria-label="下一个产品">${chevron}</button></div><div class="product-scene-footer"><div class="product-scene-caption"><span class="product-scene-brand">DeepLink</span><h3 class="product-scene-title"></h3><p class="product-scene-description" aria-live="polite" aria-atomic="true"></p><a class="product-scene-cta">了解产品 ${arrow}</a></div><div class="product-scene-navigation"><div class="product-scene-tabs" role="tablist" aria-label="选择产品" aria-orientation="horizontal"><span class="product-scene-indicator" aria-hidden="true"></span>${tabs}</div></div></div>`;
    const buttons = [...root.querySelectorAll('[role="tab"]')];
    const panelElements = [...root.querySelectorAll('[role="tabpanel"]')];
    const reduced = matchMedia('(prefers-reduced-motion:reduce)');
    const hover = matchMedia('(hover:hover) and (pointer:fine)');
    const compact = matchMedia('(max-width:768px)');
    const stage = root.querySelector('.product-scene-stage');
    const caption = root.querySelector('.product-scene-caption');
    const cta = root.querySelector('.product-scene-cta');
    let active = -1, hoverTimer = null, start = null;
    const cancelHover = () => { clearTimeout(hoverTimer);hoverTimer = null; };
    const activate = (index,focus = false) => {
      cancelHover();
      index = (index + products.length) % products.length;
      if (index === active) return;
      const previous = active;active = index;
      root.style.setProperty('--product-active',String(index));
      root.dataset.activeProduct = String(index);
      buttons.forEach((button,i) => {
        const selected = i === index;
        button.setAttribute('aria-selected',String(selected));button.tabIndex = selected ? 0 : -1;
        panelElements[i].classList.toggle('is-active',selected);
        panelElements[i].setAttribute('aria-hidden',String(!selected));panelElements[i].inert = !selected;
      });
      const item = products[index];
      root.querySelector('.product-scene-title').textContent = item.name;
      root.querySelector('.product-scene-description').textContent = item.description;
      root.querySelector('.product-scene-brand').textContent = index === 1 ? 'KernelSwift' : 'DeepLink';
      cta.href = item.href;
      if (item.href.startsWith('https:')) { cta.target = '_blank';cta.rel = 'noopener noreferrer'; }
      else { cta.removeAttribute('target');cta.removeAttribute('rel'); }
      if (previous !== -1 && !reduced.matches && caption.animate) {
        caption.getAnimations().forEach(animation => animation.cancel());
        caption.animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.5,1,.89,1)'});
      }
      if (focus) buttons[index].focus({preventScroll:true});
      if (compact.matches && focus) buttons[index].scrollIntoView({block:'nearest',inline:'nearest'});
    };
    buttons.forEach((button,index) => {
      button.addEventListener('click',() => activate(index));
      button.addEventListener('pointerenter',() => { if (hover.matches) {cancelHover();hoverTimer = setTimeout(() => activate(index),120);} });
      button.addEventListener('pointerleave',cancelHover);
      button.addEventListener('keydown',event => {
        let next;
        if (event.key === 'ArrowRight') next = index + 1;
        if (event.key === 'ArrowLeft') next = index - 1;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = products.length - 1;
        if (next === undefined) return;
        event.preventDefault();activate(next,true);
      });
    });
    root.querySelector('.is-prev').addEventListener('click',() => activate(active - 1));
    root.querySelector('.is-next').addEventListener('click',() => activate(active + 1));
    stage.addEventListener('pointerdown',event => { if (!event.target.closest('button') && event.isPrimary) start = {x:event.clientX,y:event.clientY,id:event.pointerId}; });
    stage.addEventListener('pointerup',event => {
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x,dy = event.clientY - start.y;start = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) activate(active + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel',() => {start = null;});
    root.addEventListener('pointerleave',cancelHover);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => root.classList.toggle('is-inview',entries[0].isIntersecting),{threshold:.15}).observe(root);
    else root.classList.add('is-inview');
    activate(0);
  };
  initialize();
  new MutationObserver(initialize).observe(document.documentElement,{childList:true,subtree:true});
})();
