// Interactions globales du site. Ré-initialisées à chaque navigation (View Transitions).

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

type Cleanup = () => void;
let cleanups: Cleanup[] = [];
const on = <K extends keyof WindowEventMap>(t: Window, ev: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
  t.addEventListener(ev, fn, opts);
  cleanups.push(() => t.removeEventListener(ev, fn));
};

/* ---------- En-tête : état au défilement + masquage intelligent ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    const menuOpen = header.querySelector('[data-menu]')?.classList.contains('is-open');
    if (!menuOpen) header.classList.toggle('is-hidden', y > 400 && y > lastY + 4);
    if (y < lastY - 4 || y < 400) header.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  };
  update();
  on(window, 'scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  // Pastille animée sous les liens de navigation
  const list = header.querySelector<HTMLElement>('[data-nav-pill]');
  const pill = header.querySelector<HTMLElement>('[data-pill]');
  if (list && pill) {
    const links = [...list.querySelectorAll<HTMLAnchorElement>('a')];
    const moveTo = (a?: HTMLElement | null) => {
      if (!a) { pill.style.opacity = '0'; return; }
      const lr = list.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      pill.style.width = `${r.width}px`;
      pill.style.transform = `translateX(${r.left - lr.left}px)`;
      pill.style.opacity = '1';
    };
    const active = () => links.find((l) => l.getAttribute('aria-current') === 'page');
    requestAnimationFrame(() => moveTo(active()));
    links.forEach((l) => {
      l.addEventListener('mouseenter', () => moveTo(l));
      l.addEventListener('focus', () => moveTo(l));
    });
    list.addEventListener('mouseleave', () => moveTo(active()));
    on(window, 'resize', () => moveTo(active()));
  }

  // Menu mobile
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  if (toggle && menu) {
    const setOpen = (open: boolean) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.sr-only')!.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add('is-open'));
        menu.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
      } else {
        menu.classList.remove('is-open');
        window.setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduced() ? 0 : 650);
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    on(window, 'keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    cleanups.push(() => { document.documentElement.style.overflow = ''; });
  }
}

/* ---------- Apparitions au défilement ---------- */
function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal, [data-split]');
  if (reduced() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ---------- Projecteur sur les cartes ---------- */
function initSpotlight() {
  if (!finePointer()) return;
  const handler = (e: PointerEvent) => {
    const card = (e.target as HTMLElement)?.closest?.<HTMLElement>('.spot');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - r.left}px`);
    card.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  document.addEventListener('pointermove', handler, { passive: true });
  cleanups.push(() => document.removeEventListener('pointermove', handler));
}

/* ---------- Boutons magnétiques ---------- */
function initMagnetic() {
  if (!finePointer() || reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = 0.28;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * strength}px`);
      el.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * strength}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

/* ---------- Inclinaison 3D légère ---------- */
function initTilt() {
  if (!finePointer() || reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = Number(el.dataset.tilt) || 6;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1100px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- Aura qui suit le curseur (hero) ---------- */
function initAura() {
  if (!finePointer() || reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-aura-zone]').forEach((zone) => {
    let raf = 0;
    zone.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = zone.getBoundingClientRect();
        zone.style.setProperty('--ax', `${((e.clientX - r.left) / r.width) * 100}%`);
        zone.style.setProperty('--ay', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });
  });
}

/* ---------- Compteurs ---------- */
function initCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length) return;
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    if (reduced() || target === 0) { el.textContent = String(target); return; }
    const dur = 1400;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ---------- Carrousel de maquettes du hero ---------- */
function initRotator() {
  document.querySelectorAll<HTMLElement>('[data-rotator]').forEach((root) => {
    const parts = [...root.querySelectorAll<HTMLElement>('[data-slide], [data-slide-label]')];
    const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-dot]')];
    const total = dots.length;
    if (total < 2) return;
    let i = 0;
    let timer = 0;
    const show = (n: number) => {
      i = (n + total) % total;
      parts.forEach((p) => p.classList.toggle('is-active', Number(p.dataset.slide ?? p.dataset.slideLabel) === i));
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const play = () => {
      if (reduced()) return;
      window.clearInterval(timer);
      timer = window.setInterval(() => show(i + 1), 3600);
    };
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); play(); }));
    root.addEventListener('pointerenter', () => window.clearInterval(timer));
    root.addEventListener('pointerleave', play);
    document.addEventListener('visibilitychange', () => (document.hidden ? window.clearInterval(timer) : play()));
    show(0);
    play();
    cleanups.push(() => window.clearInterval(timer));
  });
}

/* ---------- Filtres du portfolio ---------- */
function initFilters() {
  document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-cat]')];
    const count = root.querySelector<HTMLElement>('[data-filter-count]');
    const apply = (f: string) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
      let shown = 0;
      items.forEach((it) => {
        const match = f === 'all' || (it.dataset.cat ?? '').split(' ').includes(f);
        if (match) shown++;
        if (reduced()) { it.hidden = !match; return; }
        if (match) {
          it.hidden = false;
          it.animate([{ opacity: 0, transform: 'translateY(16px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)', delay: Math.min(shown, 8) * 40, fill: 'backwards' });
        } else {
          it.hidden = true;
        }
      });
      if (count) count.textContent = `${shown} projet${shown > 1 ? 's' : ''}`;
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter ?? 'all')));
  });
}

/* ---------- FAQ : ouverture animée ---------- */
function initFaq() {
  document.querySelectorAll<HTMLDetailsElement>('[data-faq] details').forEach((d) => {
    const summary = d.querySelector('summary')!;
    const body = d.querySelector<HTMLElement>('.faq__a')!;
    summary.addEventListener('click', (e) => {
      if (reduced()) return;
      e.preventDefault();
      if (d.open) {
        const h = body.scrollHeight;
        body.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = () => { d.open = false; };
        d.classList.remove('is-open');
      } else {
        d.open = true;
        d.classList.add('is-open');
        const h = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
    if (d.open) d.classList.add('is-open');
    d.addEventListener('toggle', () => d.classList.toggle('is-open', d.open));
  });
}

/* ---------- Ligne de progression (processus) ---------- */
function initProgress() {
  const els = document.querySelectorAll<HTMLElement>('[data-progress]');
  if (!els.length) return;
  let ticking = false;
  const update = () => {
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
      el.style.setProperty('--p', reduced() ? '1' : p.toFixed(3));
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((s, k, all) => {
        s.classList.toggle('is-on', p >= k / all.length);
      });
    });
    ticking = false;
  };
  update();
  on(window, 'scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
}

function init() {
  cleanups.forEach((c) => c());
  cleanups = [];
  document.documentElement.classList.remove('no-js');
  initHeader();
  initReveal();
  initSpotlight();
  initMagnetic();
  initTilt();
  initAura();
  initCounters();
  initRotator();
  initFilters();
  initFaq();
  initProgress();
}

document.addEventListener('astro:page-load', init);
