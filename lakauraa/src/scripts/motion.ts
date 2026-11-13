// Moteur d’animation du site : GSAP + ScrollTrigger + Lenis, synchronisés sur le même « ticker ».
// - Lenis est créé une seule fois et survit aux changements de page (View Transitions).
// - Les animations de chaque page vivent dans un gsap.context(), annulé avant chaque changement de page.
// - prefers-reduced-motion : pas de Lenis (défilement natif), contenus affichés immédiatement.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lenisOptions, ease, reveal, titleWords, counters } from '../lib/motion-config';

gsap.registerPlugin(ScrollTrigger);

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedQuery.matches;

declare global {
  interface Window { __lenis?: Lenis | null }
}

/* ---------- Défilement fluide (Lenis) synchronisé avec GSAP ---------- */
let lenis: Lenis | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

function startLenis() {
  if (lenis || reduced()) return;
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
  gsap.set('.reveal, .split-word > span, [data-count]', { clearProps: 'all' });
  document.querySelectorAll('.reveal, [data-split]').forEach((el) => el.classList.add('is-in'));
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (el.textContent = el.dataset.count ?? el.textContent));
  document.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => el.style.setProperty('--p', '1'));
  document.querySelectorAll('[data-step]').forEach((el) => el.classList.add('is-on'));
}

/* ---------- Animations de la page ---------- */
let ctx: gsap.Context | null = null;

function pageAnimations() {
  // 1. Titres de section : mots qui montent un à un
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((title) => {
    const words = title.querySelectorAll('.split-word > span');
    gsap.fromTo(words, { y: 0, yPercent: 105 }, {
      yPercent: 0,
      duration: titleWords.duration,
      ease: ease.expo,
      stagger: titleWords.stagger,
      scrollTrigger: { trigger: title, start: titleWords.start, once: true },
      onStart: () => title.classList.add('is-in'),
    });
  });

  // 2. Apparitions : fondu + léger mouvement vertical, décalées par groupe (cartes, grilles)
  ScrollTrigger.batch('.reveal', {
    start: reveal.start,
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: reveal.duration,
        ease: ease.out,
        stagger: { each: reveal.stagger, from: 'start' },
        overwrite: true,
        onComplete: () => batch.forEach((el) => { el.classList.add('is-in'); gsap.set(el, { clearProps: 'filter,transform' }); }),
      });
    },
  });

  // 3. Compteurs : progression fluide jusqu’à la valeur exacte
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || target === 0) { el.textContent = String(target); return; }
    const state = { v: 0 };
    el.textContent = '0';
    gsap.to(state, {
      v: target,
      duration: counters.duration,
      ease: counters.ease,
      scrollTrigger: { trigger: el, start: counters.start, once: true },
      onUpdate: () => (el.textContent = String(Math.round(state.v))),
      onComplete: () => (el.textContent = String(target)),
    });
  });

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
    gsap.to('.hero__show', {
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

function init() {
  ctx?.revert();
  ctx = null;
  if (reduced()) { showEverything(); return; }
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
document.addEventListener('astro:before-swap', () => { ctx?.revert(); ctx = null; });
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
