// Journal des événements de sécurité.
// Écrit une ligne JSON par événement dans les journaux du serveur (Vercel → Logs), filtrable avec « [security] ».
// Ne JAMAIS y mettre : mot de passe, jeton, cookie, secret, contenu de formulaire.

export type SecurityEvent =
  | 'login.success'
  | 'login.failure'
  | 'login.locked'
  | 'logout'
  | 'logout.all'
  | 'setup.admin_created'
  | 'setup.refused'
  | 'password.changed'
  | 'password.change_failed'
  | 'admin.created'
  | 'admin.removed'
  | 'access.denied'
  | 'csrf.blocked'
  | 'project.deleted'
  | 'content.seeded'
  | 'server.error';

type Details = Record<string, string | number | boolean | null | undefined>;

const SENSITIVE = /pass|token|secret|cookie|authorization|session/i;

/** Masque partiellement une adresse IP (conserve le réseau, retire la fin). */
export function maskIp(ip: string | null | undefined) {
  if (!ip) return undefined;
  if (ip.includes(':')) return ip.split(':').slice(0, 3).join(':') + '::…';
  const parts = ip.split('.');
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.x` : 'masquée';
}

/** Masque une adresse courriel : a***@domaine.com */
export function maskEmail(email: string | null | undefined) {
  if (!email) return undefined;
  const [user, domain] = email.split('@');
  return domain ? `${user.slice(0, 1)}***@${domain}` : '***';
}

export function securityEvent(event: SecurityEvent, details: Details = {}) {
  const safe: Details = {};
  for (const [k, v] of Object.entries(details)) safe[k] = SENSITIVE.test(k) ? '[masqué]' : v;
  const level = event.endsWith('failure') || event.endsWith('locked') || event.endsWith('blocked') || event === 'access.denied' || event === 'server.error' || event === 'setup.refused' || event === 'password.change_failed' ? 'warn' : 'info';
  const line = JSON.stringify({ tag: 'security', event, at: new Date().toISOString(), ...safe });
  if (level === 'warn') console.warn('[security]', line);
  else console.info('[security]', line);
}
