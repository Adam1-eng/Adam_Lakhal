// Navigation instantanée entre les pages.
// 1. Pré-chargement en mémoire des pages du menu (60 s) : quand on touche un lien, la page est déjà là.
//    (Le cache HTTP ne peut pas servir : les pages sont « à revérifier » pour que les nouveaux projets
//    apparaissent tout de suite. On garde donc notre propre copie, très courte.)
// 2. Réaction immédiate au toucher : fine barre de chargement + page actuelle estompée.
const TTL = 60_000;
type Entry = { at: number; html: Promise<string | null> };
const cache = new Map<string, Entry>();
const preloadedCss = new Set<string>();

const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData) || /(^|-)2g$/.test(c?.effectiveType ?? '');
};

const keyOf = (href: string) => {
  try {
    const u = new URL(href, location.href);
    if (u.origin !== location.origin) return null;
    if (/^\/(admin|api|media|avis\/)/.test(u.pathname) || /\.[a-z0-9]+$/i.test(u.pathname)) return null;
    return u.pathname.replace(/(.)\/+$/, '$1') + u.search;
  } catch { return null; }
};

function preloadStyles(html: string) {
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/g)) {
    const href = m[1];
    if (preloadedCss.has(href) || document.querySelector(`link[rel=stylesheet][href="${href}"]`)) continue;
    preloadedCss.add(href);
    const l = document.createElement('link');
    l.rel = 'preload'; l.as = 'style'; l.href = href;
    document.head.append(l);
  }
}

export function warm(href: string) {
  const key = keyOf(href);
  if (!key || key === location.pathname + location.search || !navigator.onLine) return;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return;
  const html = fetch(key, { credentials: 'same-origin', priority: 'low' } as RequestInit)
    .then(async (r) => {
      if (!r.ok || r.redirected || !(r.headers.get('content-type') ?? '').includes('text/html')) return null;
      const text = await r.text();
      preloadStyles(text);
      return text;
    })
    .catch(() => null);
  cache.set(key, { at: Date.now(), html });
}

// Le routeur d'Astro utilise notre copie si elle existe (sinon, chargement normal).
document.addEventListener('astro:before-preparation', (e) => {
  const ev = e as Event & { to: URL; formData?: FormData; loader: () => Promise<void>; newDocument: Document; preventDefault(): void };
  document.documentElement.classList.add('is-navigating');
  if (ev.formData) return;
  const key = keyOf(ev.to.href);
  const entry = key ? cache.get(key) : undefined;
  if (!entry || Date.now() - entry.at > TTL) return;
  const original = ev.loader;
  ev.loader = async () => {
    const html = await entry.html;
    if (!html) return original();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('noscript').forEach((n) => n.remove());
    if (!doc.querySelector('[name="astro-view-transitions-enabled"]')) { ev.preventDefault(); return; }
    ev.newDocument = doc;
    // Feuilles de style de la nouvelle page (déjà préchargées) : on attend qu'elles soient prêtes
    const waits: Promise<unknown>[] = [];
    for (const l of doc.querySelectorAll<HTMLLinkElement>('head link[rel=stylesheet]')) {
      const href = l.getAttribute('href');
      if (!href || document.querySelector(`link[rel=stylesheet][href="${href}"]`)) continue;
      const p = document.createElement('link');
      p.rel = 'preload'; p.as = 'style'; p.href = href;
      waits.push(new Promise((res) => { p.onload = p.onerror = res; }));
      document.head.append(p);
    }
    await Promise.all(waits);
  };
});

const done = () => document.documentElement.classList.remove('is-navigating');
document.addEventListener('astro:after-swap', done);
document.addEventListener('astro:page-load', done);

// Quand pré-charger
function warmNav() {
  if (saveData()) return;
  document.querySelectorAll<HTMLAnchorElement>('#mobile-menu nav a, .hdr__nav a').forEach((a) => warm(a.href));
}
// Menu ouvert : tout de suite
document.addEventListener('click', (e) => {
  if ((e.target as Element | null)?.closest?.('[data-menu-toggle]')) warmNav();
}, { capture: true });
// Doigt ou souris qui s'approche d'un lien interne
const onIntent = (e: Event) => {
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (a && !a.hasAttribute('data-astro-reload') && !a.target) warm(a.href);
};
document.addEventListener('touchstart', onIntent, { passive: true, capture: true });
document.addEventListener('pointerover', onIntent, { passive: true });
// Téléphone, page au repos : les pages du menu, en arrière-plan (sur ordinateur, le survol suffit).
// Une seule fois par session et par page grâce au cache de 60 s.
const touchOnly = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;
document.addEventListener('astro:page-load', () => {
  if (!touchOnly()) return;
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (idle) idle(warmNav, { timeout: 4000 }); else setTimeout(warmNav, 2500);
});
