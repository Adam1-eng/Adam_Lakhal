// Moteur d’animation du site, partie LÉGÈRE (chargée partout) :
// - apparitions au défilement (IntersectionObserver), processus animé sur écran tactile, animations réduites ;
// - sur ordinateur seulement, le module « motion-desktop » (GSAP + ScrollTrigger + Lenis) est chargé à la demande.
// - prefers-reduced-motion : pas de Lenis (défilement natif), contenus affichés immédiatement.

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedQuery.matches;

// Écrans tactiles : défilement natif du téléphone (Lenis n'y apporte rien et recalculait toute la page
// à chaque changement de page — ≈ 140 ms de blocage mesurés sur un téléphone moyen).
const touchOnly = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

type Desktop = typeof import('./motion-desktop');
let desk: Desktop | null = null;
let seq = 0;
const loadDesktop = () => (desk ? Promise.resolve(desk) : import('./motion-desktop').then((m) => (desk = m)));

// L’utilisateur peut activer « réduire les animations » pendant sa visite
reducedQuery.addEventListener('change', () => {
  if (reduced()) { desk?.leave(); desk?.stopLenis(); showEverything(); }
  else if (!touchOnly()) loadDesktop().then((d) => d.startLenis()).catch(() => {});
});

/* ---------- Affichage immédiat (animations réduites ou erreur) ---------- */
function showEverything() {
  document.querySelectorAll('.pre').forEach((el) => el.classList.remove('pre'));
  document.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => el.style.setProperty('--p', '1'));
  document.querySelectorAll('[data-step]').forEach((el) => el.classList.add('is-on'));
}

/* ---------- Apparitions au défilement (tous les écrans) ----------
   Seuls les blocs situés SOUS l'écran au chargement sont masqués (.pre) ; ce qui est visible
   au chargement n'est jamais caché. Double déclencheur : IntersectionObserver + vérification
   au défilement (si l'observateur ne se déclenche pas, le contenu s'affiche quand même). */
let io: IntersectionObserver | null = null;
let revealCleanup: (() => void) | null = null;
function revealOnScroll() {
  revealCleanup?.();
  if (reduced() || !('IntersectionObserver' in window)) return;
  const vh = window.innerHeight;
  const pending = new Set<HTMLElement>();
  const show = (el: HTMLElement) => { el.classList.remove('pre'); pending.delete(el); io?.unobserve(el); };
  io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && show(e.target as HTMLElement)), { rootMargin: '0px 0px 0px 0px' });
  document.querySelectorAll<HTMLElement>('.reveal, [data-split]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0 && r.top > vh * 0.94) { el.classList.add('pre'); pending.add(el); io!.observe(el); }
  });
  let raf = 0;
  const check = () => {
    raf = 0;
    const h = window.innerHeight;
    pending.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < h && r.bottom > 0) show(el); });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener('scroll', onScroll, { passive: true });
  revealCleanup = () => { window.removeEventListener('scroll', onScroll); io?.disconnect(); io = null; pending.forEach((el) => el.classList.remove('pre')); pending.clear(); revealCleanup = null; };
}

/* ---------- Écrans tactiles : processus animé sans GSAP (pas de mesure de toute la page) ---------- */
let pio: IntersectionObserver | null = null;
function lightProcess() {
  document.documentElement.classList.add('io-motion');
  pio?.disconnect();
  pio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target as HTMLElement; pio!.unobserve(el);
      el.style.setProperty('--p', '1');
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((st, k) => setTimeout(() => st.classList.add('is-on'), 200 + k * 250));
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => pio!.observe(el));
}

function init() {
  desk?.leave();
  const mine = ++seq;
  if (reduced()) { showEverything(); return; }
  revealOnScroll();
  if (touchOnly()) { lightProcess(); return; }
  // Ordinateur : GSAP/Lenis démarrent quand le navigateur est libre (après l'affichage), pas pendant le chargement
  const start = () => loadDesktop()
    .then((d) => { if (mine === seq) d.enter(); })
    .catch((e) => { console.error('[animations]', e); showEverything(); });
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 800 }); else window.setTimeout(start, 200);
}

// Changement de page : on nettoie les animations, Lenis repart en haut
document.addEventListener('astro:before-swap', () => { desk?.leave(); revealCleanup?.(); pio?.disconnect(); pio = null; });
document.addEventListener('astro:after-swap', () => desk?.afterSwap());
document.addEventListener('astro:page-load', init);
window.addEventListener('load', () => desk?.refresh());

// La hauteur de la page change (FAQ, filtres, images) : on recalcule
let refreshTimer = 0;
export function refreshScroll() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => desk?.refresh(), 120);
}
document.addEventListener('toggle', refreshScroll, true);
document.addEventListener('lk:layout', refreshScroll);
