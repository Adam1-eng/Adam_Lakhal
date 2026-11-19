// Animations « ordinateur » : GSAP + ScrollTrigger + Lenis (défilement fluide), synchronisés sur le même « ticker ».
// Ce module n'est chargé QUE sur ordinateur (souris) et si les animations ne sont pas réduites :
// les téléphones et tablettes ne téléchargent ni GSAP ni Lenis (≈ 40 Ko de moins, moins de blocage).
// - Lenis est créé une seule fois et survit aux changements de page (View Transitions).
// - Les animations de chaque page vivent dans un gsap.context(), annulé avant chaque changement de page.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { lenisOptions, ease, reveal } from '../lib/motion-config';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window { __lenis?: Lenis | null }
}

let lenis: Lenis | null = null;
const tick = (time: number) => lenis?.raf(time * 1000);

export function startLenis() {
  if (lenis) return;
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

export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
  window.__lenis = null;
}

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

/** Page affichée : (re)démarre le défilement fluide et les animations de la page. */
export function enter() {
  ctx?.revert();
  ctx = null;
  startLenis();
  lenis?.resize();
  ctx = gsap.context(pageAnimations);
  // Recalcule les positions une fois les polices et images chargées (évite les déclenchements décalés)
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Avant un changement de page : on annule les animations de la page. */
export function leave() {
  ctx?.revert();
  ctx = null;
}

/** Après un changement de page : retour en haut, ou directement à la section demandée (#ancre). */
export function afterSwap() {
  if (!lenis) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  lenis.resize();
  lenis.scrollTo(target ?? 0, { immediate: true, force: true, offset: target ? lenisOptions.anchorOffset : 0 });
}

/** La hauteur de la page change (FAQ, filtres, images) : on recalcule. */
export function refresh() {
  lenis?.resize();
  ScrollTrigger.refresh();
}
