(() => {
  const initialize=()=>{
    const section=document.querySelector('#products');
    if(!section)return;
    const showcase=section.querySelector('.product-showcase');
    if(!showcase||showcase.dataset.stackReady)return;
    const tabs=showcase.querySelector('.product-tabs');
    const buttons=[...tabs.querySelectorAll('[role="tab"]')];
    if(buttons.length!==4)return;
    showcase.dataset.stackReady='true';
    // Reuse the current product banner media inside the existing selectable cards.
    const artwork=[
      "<svg class=\"product-card-cutout\" viewBox=\"-42 -42 808 808\" preserveAspectRatio=\"xMidYMid meet\"><image href=\"/deeplink-redesign-preview/products/assets/training-card-ice-crop-20261103.png\" width=\"724\" height=\"724\"/></svg>",
      "<svg class=\"product-card-cutout\" viewBox=\"-42 -42 808 808\" preserveAspectRatio=\"xMidYMid meet\"><image href=\"/deeplink-redesign-preview/products/assets/kernelswift-card-ice-crop-20261103.png\" width=\"724\" height=\"724\"/></svg>",
      "<svg class=\"product-card-cutout\" viewBox=\"-42 -42 808 808\" preserveAspectRatio=\"xMidYMid meet\"><image href=\"/deeplink-redesign-preview/products/assets/fusion-card-ice-crop-20261103.png\" width=\"724\" height=\"724\"/></svg>",
      "<svg viewBox=\"1230 90 1740 1400\" preserveAspectRatio=\"xMidYMid meet\"><image href=\"/deeplink-redesign-preview/products/assets/verification-online-banner-20261103.png\" width=\"2880\" height=\"1492\"/></svg>"
];
    buttons.forEach((button,index)=>{
      const name=button.textContent.trim();
      button.setAttribute('aria-label',name);
      const art=document.createElement('span');
      art.className='product-card-art';
      art.setAttribute('aria-hidden','true');
      art.innerHTML=artwork[index];
      const label=document.createElement('span');
      label.className='product-card-title';
      label.textContent=name;
      button.replaceChildren(art,label);
    });
    showcase.classList.add('product-stack-showcase');
    section.classList.add('product-stack-section');
    section.closest('.home-surface').classList.add('home-product-stack-surface');
    const update=()=>{
      const active=buttons.findIndex(button=>button.getAttribute('aria-selected')==='true');
      buttons.forEach((button,index)=>{
        const slot=(index-active+4)%4;
        button.dataset.stackSlot=String(slot);
        button.setAttribute('aria-hidden',String(slot>2));

      });
    };
    tabs.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button||button.dataset.stackSlot!=='0')return;
      event.preventDefault();
      event.stopImmediatePropagation();
      buttons[(buttons.indexOf(button)+1)%buttons.length].click();
    },true);
    update();
    new MutationObserver(update).observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  };
  initialize();
  new MutationObserver(initialize).observe(document.documentElement,{childList:true,subtree:true});
})();
