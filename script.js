(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const progressBar = document.querySelector('.reading-progress span');
  const menuButton = document.querySelector('.menu-toggle');
  const navPanel = document.querySelector('.nav-panel');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const productCards = [...document.querySelectorAll('.product-card')];
  const filterStatus = document.querySelector('#filter-status');
  const year = document.querySelector('#year');
  const fieldZone = document.querySelector('.field-backdrop-zone');
  const fieldImage = document.querySelector('.field-backdrop img');

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    if (!menuButton || !navPanel) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    navPanel.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
      navPanel.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    navPanel.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menuButton.getAttribute('aria-expanded') === 'true' && !navPanel.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  // Desktop & mobile megamenu interaction
  const megamenuItem = document.querySelector('.megamenu-item');
  const megamenuTrigger = document.querySelector('.megamenu-trigger');
  const megamenuPanel = document.querySelector('.megamenu-panel');

  if (megamenuItem && megamenuTrigger) {
    let hoverTimeout;
    const openMegamenu = () => {
      clearTimeout(hoverTimeout);
      megamenuItem.classList.add('is-active');
      megamenuTrigger.setAttribute('aria-expanded', 'true');
    };
    const closeMegamenu = () => {
      clearTimeout(hoverTimeout);
      megamenuItem.classList.remove('is-active');
      megamenuTrigger.setAttribute('aria-expanded', 'false');
    };

    megamenuTrigger.addEventListener('click', (e) => {
      if (window.innerWidth >= 960) {
        e.preventDefault();
        const isOpen = megamenuItem.classList.contains('is-active');
        if (isOpen) closeMegamenu();
        else openMegamenu();
      }
    });

    megamenuItem.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 960) openMegamenu();
    });
    megamenuItem.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 960) {
        hoverTimeout = setTimeout(closeMegamenu, 180);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && megamenuItem.classList.contains('is-active')) {
        closeMegamenu();
        megamenuTrigger.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (megamenuItem.classList.contains('is-active') && !megamenuItem.contains(e.target)) {
        closeMegamenu();
      }
    });

    if (megamenuPanel) {
      megamenuPanel.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          closeMegamenu();
          closeMenu();
        });
      });
    }
  }

  let scrollQueued = false;
  const updateScrollChrome = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 56);
    if (fieldZone && fieldImage && !prefersReducedMotion) {
      const bounds = fieldZone.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        const travel = Math.max(-60, Math.min(60, (window.innerHeight / 2 - bounds.top - bounds.height / 2) * 0.045));
        fieldImage.style.setProperty('--field-shift', `${travel.toFixed(2)}px`);
      }
    }
    scrollQueued = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      window.requestAnimationFrame(updateScrollChrome);
      scrollQueued = true;
    }
  }, { passive: true });
  updateScrollChrome();
  window.addEventListener('resize', () => {
    if (window.innerWidth > 560) closeMenu();
    updateScrollChrome();
  }, { passive: true });

  if (filterButtons.length && productCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedFilter = button.dataset.filter;
        let visibleCount = 0;
        filterButtons.forEach((item) => {
          const isSelected = item === button;
          item.classList.toggle('is-active', isSelected);
          item.setAttribute('aria-pressed', String(isSelected));
        });
        productCards.forEach((card) => {
          const categories = (card.dataset.category || '').split(/\s+/);
          const shouldShow = selectedFilter === 'all' || categories.includes(selectedFilter);
          card.hidden = !shouldShow;
          if (shouldShow) {
            visibleCount += 1;
            card.classList.add('is-visible');
          }
        });
        const label = button.textContent.trim();
        if (filterStatus) filterStatus.textContent = `${visibleCount} soluciones en ${label.toLowerCase()}.`;
      });
    });
  }

  const revealElements = [...document.querySelectorAll('.reveal')];
  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealElements.length) {
    document.body.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -38px 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!prefersReducedMotion && finePointer) {
    const glassDiagram = document.querySelector('.glass-diagram');
    if (glassDiagram) {
      glassDiagram.addEventListener('pointermove', (event) => {
        const bounds = glassDiagram.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        glassDiagram.style.setProperty('--glass-x', `${x}%`);
        glassDiagram.style.setProperty('--glass-y', `${y}%`);
      });
      glassDiagram.addEventListener('pointerleave', () => {
        glassDiagram.style.removeProperty('--glass-x');
        glassDiagram.style.removeProperty('--glass-y');
      });
    }

    productCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 2.5}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 2.5}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
  }
})();
