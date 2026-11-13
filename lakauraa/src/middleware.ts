import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from './lib/auth';
import { getSettings, defaultSettings } from './lib/content';
import { securityEvent, maskIp } from './lib/security-log';
import { clientIp } from './lib/admin';

const OPEN_ADMIN = new Set(['/admin/login', '/admin/setup']);
const DEV = import.meta.env.DEV;

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/**
 * Politique de sécurité du contenu (CSP).
 * 'unsafe-inline' reste nécessaire pour les scripts : les transitions de page (ClientRouter) et l'hydratation
 * des îlots React utilisent des scripts intégrés, et la CSP par empreintes d'Astro est incompatible avec ClientRouter.
 * Tout le reste est verrouillé : aucun script/style/police externe, pas d'iframe, pas de <base> piégé, pas de plugin.
 */
function csp(frameAncestors: "'self'" | "'none'") {
  const blob = 'https://*.public.blob.vercel-storage.com';
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${blob}`,
    `media-src 'self' https: ${blob}`, // vidéo de démonstration : lien https saisi dans l'admin
    "font-src 'self' data:",
    `connect-src 'self'${DEV ? ' ws: wss:' : ''}`,
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    `frame-ancestors ${frameAncestors}`,
    ...(DEV ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

function securityHeaders(h: Headers, admin: boolean) {
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()');
  h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  h.set('X-Frame-Options', admin ? 'DENY' : 'SAMEORIGIN');
  h.set('Content-Security-Policy', csp(admin ? "'none'" : "'self'"));
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/') || pathname === '/api/admin';
  const secure = ctx.url.protocol === 'https:';
  ctx.locals.admin = null;
  // Paramètres du site pour toutes les pages (y compris 404/500). Jamais d'échec : valeurs par défaut en secours.
  ctx.locals.settings = defaultSettings;
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/media/') && !pathname.startsWith('/_astro/')) {
    ctx.locals.settings = await getSettings();
  }

  if (isAdminPage || isAdminApi) {
    // Anti-CSRF : toute écriture doit venir du site lui-même (en plus du cookie SameSite=Strict)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(ctx.request.method)) {
      const origin = ctx.request.headers.get('origin');
      if (origin !== ctx.url.origin) {
        securityEvent('csrf.blocked', { path: pathname, method: ctx.request.method, origin: origin ?? 'absente', ip: maskIp(clientIp(ctx.request)) });
        return json(403, 'Origine refusée.');
      }
    }

    let user = null;
    try {
      user = await getSessionUser(ctx.cookies, secure);
    } catch (e) {
      console.error('[auth] base de données indisponible', e instanceof Error ? e.message : 'erreur');
      if (isAdminApi) return json(503, 'Service momentanément indisponible.');
    }
    ctx.locals.admin = user;

    if (!user && !OPEN_ADMIN.has(pathname)) {
      if (isAdminApi) {
        securityEvent('access.denied', { path: pathname, method: ctx.request.method, ip: maskIp(clientIp(ctx.request)) });
        return json(401, 'Authentification requise.');
      }
      const nextUrl = pathname + ctx.url.search;
      return ctx.redirect(`/admin/login?next=${encodeURIComponent(nextUrl)}`, 302);
    }

    const res = await next();
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Vary', 'Cookie');
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    securityHeaders(res.headers, true);
    return res;
  }

  const res = await next();
  securityHeaders(res.headers, false);
  // Pages publiques : cache CDN court → un projet publié apparaît en quelques secondes, sans redéploiement.
  if (ctx.request.method === 'GET' && res.status === 200 && !res.headers.has('Cache-Control') && (res.headers.get('content-type') ?? '').includes('text/html')) {
    res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=50');
  }
  return res;
});
