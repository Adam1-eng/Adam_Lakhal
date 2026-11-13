import type { APIRoute } from 'astro';
import { destroySession } from '../../lib/auth';
import { securityEvent } from '../../lib/security-log';

export const POST: APIRoute = async ({ cookies, url, redirect, locals }) => {
  await destroySession(cookies, url.protocol === 'https:');
  securityEvent('logout', { admin: locals.admin?.id });
  return redirect('/admin/login', 303);
};
