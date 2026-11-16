// Mesure anonyme des actions de contact (voir src/lib/stats.ts). Aucun cookie, aucun identifiant.
// Respecte « Global Privacy Control » : si le navigateur le demande, rien n'est envoyé.
type Ev = 'whatsapp_ma' | 'whatsapp_ca' | 'call' | 'sms' | 'email' | 'cta_contact' | 'form_ready';

const optOut = () => (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

export function track(e: Ev) {
  if (optOut()) return;
  try {
    fetch('/api/evt', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ e, p: location.pathname }) }).catch(() => {});
  } catch { /* la mesure ne doit jamais gêner la navigation */ }
}

function fromLink(a: HTMLAnchorElement): Ev | null {
  const href = a.getAttribute('href') ?? '';
  if (href.startsWith('https://wa.me/')) return a.dataset.waLine === 'ma' ? 'whatsapp_ma' : 'whatsapp_ca';
  if (href.startsWith('tel:')) return 'call';
  if (href.startsWith('sms:')) return 'sms';
  if (href.startsWith('mailto:')) return 'email';
  if (/^\/contact(\?|#|$)/.test(href) && location.pathname !== '/contact') return 'cta_contact';
  return null;
}

// Un seul écouteur pour tout le site (survit aux changements de page).
document.addEventListener('click', (ev) => {
  const a = (ev.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  const e = a && fromLink(a);
  if (e) track(e);
}, { capture: true });

// Actions déclenchées par script (WhatsApp ouvert directement, formulaire validé)
document.addEventListener('lk:track', (ev) => {
  const e = (ev as CustomEvent<Ev>).detail;
  if (e) track(e);
});
