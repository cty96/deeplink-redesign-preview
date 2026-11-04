(() => {
  const initialize = () => document.querySelectorAll('.core-feature-grid:not([data-accordion-ready])').forEach(grid => {
    grid.dataset.accordionReady = 'true';
    grid.classList.add('core-feature-accordion');
    const cards = [...grid.querySelectorAll('.core-feature-card')];
    // Figma 5502:6115 supplies distinct masks/crops for both accordion states.
    // Match the illustrations to their content: servers = cross-domain, infinity = fusion.
    const artwork = ['502b8.png', '10803.png', '91233.png', 'f1619.png'];
    cards.forEach((card, index) => {
      const media = card.querySelector('.core-feature-media');
      const image = media && media.querySelector('.core-feature-art');
      if (!image || !artwork[index]) return;
      media.setAttribute('aria-hidden', 'true');
      image.src = `/deeplink-redesign-preview/home-assets/core-feature-figma/${artwork[index]}`;
      const rest = document.createElement('div');
      rest.className = 'core-feature-figure core-feature-figure-rest';
      rest.appendChild(image);
      const expanded = rest.cloneNode(true);
      expanded.className = 'core-feature-figure core-feature-figure-expanded';
      media.replaceChildren(rest, expanded);
    });
    let selected = null;
    const expand = card => {
      selected = card;
      grid.classList.toggle('has-expanded', !!card);
      cards.forEach(item => {
        const open = item === card;
        item.classList.toggle('is-expanded', open);
        item.setAttribute('aria-expanded', String(open));
        item.querySelector('.core-feature-tagline').setAttribute('aria-hidden', 'false');
        item.querySelector('.core-feature-description').setAttribute('aria-hidden', String(!open));
      });
    };
    cards.forEach((card,index) => {
      card.tabIndex = 0;
      card.setAttribute('role','button');
      card.setAttribute('aria-label',card.querySelector('h3').textContent.trim());
      const ids=[];
      card.querySelectorAll('.core-feature-tagline,.core-feature-description').forEach((p,part)=>{p.id=`core-feature-${index}-${part}`;ids.push(p.id);});
      card.setAttribute('aria-controls',ids.join(' '));
      card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')expand(card);});
      card.addEventListener('focus',()=>{if(matchMedia('(hover:hover)').matches)expand(card);});
      card.addEventListener('click',()=>{if(!matchMedia('(hover:hover)').matches)expand(selected===card?null:card);});
      card.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();expand(selected===card?null:card);}
        if(e.key==='Escape'){e.preventDefault();expand(null);}
      });
    });
    grid.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!cards.some(card=>card.matches(':focus-visible')))expand(null);});
    grid.addEventListener('focusout',e=>{if(!grid.contains(e.relatedTarget))expand(null);});
    expand(null);
  });
  initialize();
  new MutationObserver(initialize).observe(document.documentElement,{childList:true,subtree:true});
})();
