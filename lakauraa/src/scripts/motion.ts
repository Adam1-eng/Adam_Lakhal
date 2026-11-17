// Moteur d’animation du site : GSAP + ScrollTrigger + Lenis, synchronisés sur le même « ticker ».
// - Lenis est créé une seule fois et survit aux changements de page (View Transitions).
// - Les animations de chaque page vivent dans un gsap.context(), annulé avant chaque changement de page.
// - prefers-reduced-motion : pas de Lenis (défilement natif), contenus affichés immédiatement.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lenisOptions, ease, reveal } from '../lib/motion-config';

gsap.registerPlugin(ScrollTrigger);

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedQuery.matches;

declare global {
  interface Window { __lenis?: Lenis | null }
}

/* ---------- Défilement fluide (Lenis) synchronisé avec GSAP ---------- */
let lenis: Lenis | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

// Écrans tactiles : défilement natif du téléphone (Lenis n'y apporte rien et recalculait toute la page
// à chaque changement de page — ≈ 140 ms de blocage mesurés sur un téléphone moyen).
const touchOnly = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function startLenis() {
  if (lenis || reduced() || touchOnly()) return;
  lenis = new Lenis({
    lerp: lenisOptions.lerp,
    wheelMultiplier: lenisOptions.wheelMultiplier,
    smoothWheel: lenisOptions.smoothWheel,
    syncTouch: lenisOptions.syncTouch,
    anchors: { offset: lenisOptions.anchorOffset },
    autoRaf: false,
    // Fenêtres modales, menu mobile et zones marquées : défilement natif
    prevent: (node: HTMLElement) => Boolean(node.closest?.('dialog, .mmenu, [data-lenis-prevent]')),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;
}

function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
  window.__lenis = null;
}

// L’utilisateur peut activer « réduire les animations » pendant sa visite
reducedQuery.addEventListener('change', () => {
  if (reduced()) { stopLenis(); showEverything(); } else startLenis();
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

/* ---------- Animations de la page ---------- */
let ctx: gsap.Context | null = null;

function pageAnimations() {
  // 4. Processus : la ligne se remplit au rythme du défilement, les étapes s’allument
  gsap.utils.toArray<HTMLElement>('[data-progress]').forEach((list) => {
    const steps = list.querySelectorAll<HTMLElement>('[data-step]');
    ScrollTrigger.create({
      trigger: list,
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.6,
      onUpdate: (self) => {
        list.style.setProperty('--p', self.progress.toFixed(3));
        steps.forEach((s, k) => s.classList.toggle('is-on', self.progress >= k / steps.length));
      },
    });
  });

  // 5. Hero : la vitrine s’éloigne doucement au défilement (transition vers la suite)
  const hero = document.querySelector<HTMLElement>('.hero');
  if (hero) {
    // fromTo : départ explicite (l'apparition CSS du hero est peut-être encore en cours à cet instant)
    gsap.fromTo('.hero__show', { yPercent: 0, opacity: 1 }, {
      yPercent: -8,
      opacity: 0.55,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero__bg', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // 6. Images des cartes de projets : léger zoom arrière à l’apparition
  gsap.utils.toArray<HTMLElement>('.pcard__media > img, .cs__shot img').forEach((img) => {
    gsap.fromTo(img, { scale: 1.08 }, {
      scale: 1,
      duration: 1.4,
      ease: ease.outSoft,
      clearProps: 'transform',
      scrollTrigger: { trigger: img, start: reveal.start, once: true },
    });
  });
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
  ctx?.revert();
  ctx = null;
  if (reduced()) { showEverything(); return; }
  revealOnScroll();
  if (touchOnly()) { lightProcess(); return; }
  startLenis();
  lenis?.resize();
  try {
    ctx = gsap.context(pageAnimations);
  } catch (e) {
    console.error('[animations]', e);
    showEverything();
  }
  // Recalcule les positions une fois les polices et images chargées (évite les déclenchements décalés)
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

// Changement de page : on nettoie les animations, Lenis repart en haut
document.addEventListener('astro:before-swap', () => { ctx?.revert(); ctx = null; revealCleanup?.(); pio?.disconnect(); pio = null; });
document.addEventListener('astro:after-swap', () => lenis?.scrollTo(0, { immediate: true, force: true }));
document.addEventListener('astro:page-load', init);
window.addEventListener('load', () => ScrollTrigger.refresh());

// La hauteur de la page change (FAQ, filtres, images) : on recalcule
let refreshTimer = 0;
export function refreshScroll() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => { lenis?.resize(); ScrollTrigger.refresh(); }, 120);
}
document.addEventListener('toggle', refreshScroll, true);
document.addEventListener('lk:layout', refreshScroll);
