import type { APIRoute } from 'astro';
import { destroySession } from '../../lib/auth';

export const POST: APIRoute = async ({ cookies, url, redirect }) => {
  await destroySession(cookies, url.protocol === 'https:');
  return redirect('/admin/login', 303);
};
