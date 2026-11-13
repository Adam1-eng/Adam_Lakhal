// Réglages centralisés de toutes les animations du site.
// Modifier ici suffit pour changer le rythme global (durées, courbes, décalages, couleurs).

export const brand = {
  black: '#0b0b0f',
  blue: '#1e6bff',
  red: '#e0122f',
};

/** Défilement fluide (Lenis) — ordinateur seulement ; le tactile garde le défilement natif. */
export const lenisOptions = {
  lerp: 0.09, // inertie : plus petit = plus doux
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: false, // mobile : défilement natif, plus naturel et sans latence
  anchorOffset: -96, // décalage pour les ancres (hauteur de l’en-tête)
};

/** Courbes et durées (GSAP). */
export const ease = {
  out: 'power3.out',
  outSoft: 'power2.out',
  expo: 'expo.out',
};

export const reveal = {
  y: 28, // mouvement vertical léger
  blur: 6, // léger flou de départ (px)
  duration: 1.05,
  stagger: 0.09, // décalage entre éléments d’un même groupe (cartes, grilles)
  start: 'top 88%', // déclenchement quand le haut de l’élément atteint 88 % de l’écran
};

export const titleWords = {
  duration: 1.1,
  stagger: 0.05,
  start: 'top 88%',
};

export const counters = {
  duration: 1.8,
  ease: 'power2.out',
  start: 'top 85%',
};

/** Titre du hero (React Bits · BlurText). */
export const heroTitle = {
  delay: 90, // ms entre deux mots
  stepDuration: 0.5,
  blur: 12,
  distance: 26,
};

/** Rayons lumineux du hero (React Bits · LightRays) — discrets pour garder le texte lisible. */
export const heroRays = {
  raysColor: brand.blue,
  raysSpeed: 0.6,
  lightSpread: 0.9,
  rayLength: 2.4,
  intensity: 0.75,
  glow: 0.45,
  haze: 0.2,
  opacity: 0.8,
  followMouse: true,
  mouseInfluence: 0.06,
  cursorShadow: false,
  clickPulse: false,
  maxDevicePixelRatio: 1.5,
  mobileMaxDevicePixelRatio: 1,
};

/** Bordure étoilée du bouton principal (React Bits · StarBorder). */
export const ctaStar = {
  color: '#ffffff',
  trailColor: brand.red,
  duration: 5,
  thickness: 1.5,
  radius: 999,
  glow: 0.55,
  backgroundColor: brand.blue,
  textColor: '#ffffff',
};
