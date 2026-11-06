(() => {
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  document.querySelectorAll('.training-partner-row').forEach(row => {
    const strip = row.querySelector('.training-partner-strip');
    if (!strip || strip.classList.contains('is-static')) return;
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      row.classList.toggle('is-running', entries[0].isIntersecting && !reduced.matches);
    }).observe(row);
    else row.classList.toggle('is-running', !reduced.matches);
    strip.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      row.classList.add('is-paused');
      strip.scrollBy({left:event.key === 'ArrowRight' ? 176 : -176,behavior:reduced.matches ? 'instant' : 'smooth'});
    });
    strip.addEventListener('blur', () => {
      row.classList.remove('is-paused');
      strip.scrollTo({left:0,behavior:'instant'});
    });
  });
})();
