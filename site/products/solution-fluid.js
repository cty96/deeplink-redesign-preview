/* Track only the active card; the idle page runs no animation loop. */
(() => {
  const cards = document.querySelectorAll('.solutions [data-fluid-card]');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let activeCard = null;
  let pointerX = 0;
  let pointerY = 0;
  const paint = () => {
    frame = 0;
    if (!activeCard || !finePointer.matches || reducedMotion.matches) return;
    const bounds = activeCard.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (pointerX - bounds.left) / bounds.width * 100));
    const y = Math.max(0, Math.min(100, (pointerY - bounds.top) / bounds.height * 100));
    activeCard.style.setProperty('--fluid-x', `${x.toFixed(2)}%`);
    activeCard.style.setProperty('--fluid-y', `${y.toFixed(2)}%`);
  };
  const move = (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    activeCard = event.currentTarget;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const reset = (event) => {
    event.currentTarget.style.removeProperty('--fluid-x');
    event.currentTarget.style.removeProperty('--fluid-y');
    if (activeCard === event.currentTarget) {
      activeCard = null;
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  cards.forEach(card => {
    card.addEventListener('pointerenter', move, { passive: true });
    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerleave', reset, { passive: true });
    card.addEventListener('pointercancel', reset, { passive: true });
  });
})();
