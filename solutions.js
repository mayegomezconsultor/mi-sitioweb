(() => {
  const deck = document.querySelector('.solutions-deck');
  if (!deck) return;
  const cards = [...deck.querySelectorAll('.solution-card')];
  const filters = [...document.querySelectorAll('[data-filter].filter-button')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new Set();
  const motions = new Map();
  function animate(card, frames, delay = 0, duration = 750) {
    motions.get(card)?.cancel();
    if (reduced.matches || !card.animate) return;
    const motion = card.animate(frames, {duration, delay, easing:'cubic-bezier(.16,1,.3,1)', fill:'both'});
    motions.set(card, motion);
    motion.onfinish = () => {motion.cancel(); if (motions.get(card) === motion) motions.delete(card);};
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entering = entries.filter(entry => entry.isIntersecting && !entry.target.hidden && !seen.has(entry.target));
      entering.forEach((entry, index) => {
        const card = entry.target;
        seen.add(card); observer.unobserve(card);
        const side = cards.indexOf(card) % 2 ? -1 : 1;
        const desktop = matchMedia('(min-width:701px)').matches;
        animate(card, [{opacity:0, transform:`translate(${desktop ? side * 65 : 0}px, 65px) rotate(${desktop ? side * 3 : 0}deg) scale(.95)`}, {opacity:1, transform:'none'}], index * 110);
      });
    }, {threshold:0.08, rootMargin:'0px 0px -25px 0px'});
    cards.forEach(card => observer.observe(card));
    // Keyboard users never land on a transparent, moving link.
    deck.addEventListener('focusin', event => {
      const card = event.target.closest('.solution-card');
      if (card) { seen.add(card); observer.unobserve(card); motions.get(card)?.cancel(); }
    });
  }
  filters.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    motions.forEach(motion => motion.cancel()); motions.clear();
    const previous = new Map(cards.filter(card => !card.hidden).map(card => [card, card.getBoundingClientRect()]));
    const selected = button.dataset.filter;
    filters.forEach(filter => {const active = filter === button; filter.classList.toggle('is-active', active); filter.setAttribute('aria-pressed', String(active));});
    cards.forEach(card => {card.hidden = selected !== 'all' && !card.dataset.category.split(' ').includes(selected);});
    const visible = cards.filter(card => !card.hidden);
    deck.dataset.filter = selected; deck.dataset.count = visible.length;
    visible.forEach((card, index) => {
      seen.add(card);
      const before = previous.get(card), after = card.getBoundingClientRect();
      animate(card, [{opacity:before ? 1 : 0, transform:before ? `translate(${before.left-after.left}px, ${before.top-after.top}px)` : 'translateY(28px) scale(.97)'}, {opacity:1,transform:'none'}], index * 55, 480);
    });
    document.querySelector('#filter-status').textContent = `${visible.length} soluciones en ${button.textContent.trim().toLowerCase()}.`;
  }));
  reduced.addEventListener('change', () => {if (reduced.matches) {motions.forEach(motion => motion.cancel()); motions.clear();}});
})();
