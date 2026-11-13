import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from './lib/auth';
import { getSettings } from './lib/content';

const OPEN_ADMIN = new Set(['/admin/login', '/admin/setup']);

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

function securityHeaders(h: Headers) {
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/') || pathname === '/api/admin';
  const secure = ctx.url.protocol === 'https:';
  ctx.locals.admin = null;
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/media/') && !pathname.startsWith('/_')) {
    ctx.locals.settings = await getSettings();
  }

  if (isAdminPage || isAdminApi) {
    // Anti-CSRF : toute écriture doit venir du site lui-même
    if (!['GET', 'HEAD', 'OPTIONS'].includes(ctx.request.method)) {
      const origin = ctx.request.headers.get('origin');
      if (origin !== ctx.url.origin) return json(403, 'Origine refusée.');
    }

    let user = null;
    try {
      user = await getSessionUser(ctx.cookies, secure);
    } catch (e) {
      console.error('[auth] base de données indisponible', e);
      if (isAdminApi) return json(503, 'Base de données indisponible.');
    }
    ctx.locals.admin = user;

    if (!user && !OPEN_ADMIN.has(pathname)) {
      if (isAdminApi) return json(401, 'Authentification requise.');
      const nextUrl = pathname + ctx.url.search;
      return ctx.redirect(`/admin/login?next=${encodeURIComponent(nextUrl)}`, 302);
    }

    const res = await next();
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    securityHeaders(res.headers);
    return res;
  }

  const res = await next();
  securityHeaders(res.headers);
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Pages publiques : cache CDN court → un projet publié apparaît en quelques secondes, sans redéploiement.
  if (ctx.request.method === 'GET' && res.status === 200 && !res.headers.has('Cache-Control') && (res.headers.get('content-type') ?? '').includes('text/html')) {
    res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=50');
  }
  return res;
});
