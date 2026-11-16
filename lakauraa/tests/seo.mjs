// Contrôles SEO techniques (lecture seule : uniquement des requêtes GET).
// BASE=http://localhost:4400 node tests/seo.mjs   — ou BASE=https://… pour vérifier la production.
const B = (process.env.BASE ?? 'http://localhost:4400').replace(/\/$/, '');
const VERBOSE = process.env.VERBOSE === '1';
let pass = 0, fail = 0;
const ok = (cond, name, info = '') => { if (cond) { pass++; if (VERBOSE) console.log('PASS', name); } else { fail++; console.log('FAIL', name, info && '→ ' + info); } };
// COOKIE : facultatif, pour une préversion Vercel protégée (cookie _vercel_jwt). Jamais enregistré.
const H = process.env.COOKIE ? { Cookie: process.env.COOKIE } : {};
const get = (p, opt = {}) => fetch(p.startsWith('http') ? p : B + p, { redirect: 'manual', headers: H, ...opt });
const attr = (tag, name) => (tag.match(new RegExp(`${name}="([^"]*)"`)) ?? [])[1];
const meta = (html, key) => { const t = (html.match(new RegExp(`<meta[^>]+(?:name|property)="${key}"[^>]*>`)) ?? [])[0]; return t ? attr(t, 'content') : undefined; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// 1. Découverte : sitemap
const idx = await (await get('/sitemap-index.xml')).text();
const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(maps.length > 0, 'sitemap-index.xml liste au moins un sitemap');
let urls = [];
for (const m of maps) urls.push(...[...(await (await get(new URL(m).pathname)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
const paths = urls.map((u) => new URL(u).pathname);
ok(paths.includes('/') && paths.includes('/services') && paths.includes('/projets') && paths.includes('/contact'), 'sitemap : pages principales présentes', paths.join(' '));
ok(paths.some((p) => /^\/projets\/[^/]+$/.test(p)), 'sitemap : pages de projets publiées présentes');
ok(!paths.some((p) => /admin|\/api\/|\/avis\/.+|\/media\//.test(p)), 'sitemap : aucune URL privée (admin, api, lien d’avis)');
ok(paths.every((p) => p === '/' || !p.endsWith('/')), 'sitemap : URL sans barre oblique finale (comme les canoniques)');
ok(new Set(urls).size === urls.length, 'sitemap : aucun doublon');
const robots = await (await get('/robots.txt')).text();
ok(/Sitemap:\s*https?:\/\/\S+sitemap-index\.xml/.test(robots) && /Disallow:\s*\/admin/.test(robots), 'robots.txt : sitemap déclaré, /admin exclu du crawl');

// 2. Chaque page du sitemap
const titles = new Map(), descs = new Map(), links = new Set();
for (const p of paths) {
  const r = await get(p); const html = await r.text();
  const title = decode((html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '');
  const desc = decode(meta(html, 'description') ?? '');
  const canon = attr((html.match(/<link rel="canonical"[^>]*>/) ?? [''])[0], 'href') ?? '';
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  ok(r.status === 200, `${p} : 200`, String(r.status));
  ok(title.length >= 20 && title.length <= 65, `${p} : titre de 20 à 65 caractères`, `${title.length} « ${title} »`);
  ok(desc.length >= 70 && desc.length <= 165, `${p} : description de 70 à 165 caractères`, `${desc.length}`);
  ok(new URL(canon || 'http://x').pathname === p, `${p} : canonique = l’URL elle-même`, canon);
  ok(h1 === 1, `${p} : un seul H1`, String(h1));
  ok(!/<meta name="robots" content="noindex/.test(html), `${p} : indexable (pas de noindex)`);
  ok(/<html lang="fr/.test(html), `${p} : langue déclarée`);
  for (const k of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) ok(Boolean(meta(html, k)), `${p} : ${k}`);
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });
  ok(lds.length > 0 && lds.every(Boolean), `${p} : données structurées JSON valides`);
  if (p !== '/') ok(lds.flatMap((x) => x['@graph'] ?? [x]).some((x) => x['@type'] === 'BreadcrumbList'), `${p} : fil d’Ariane structuré`);
  const noAlt = (html.match(/<img(?![^>]*\salt=)[^>]*>/g) ?? []).length;
  ok(noAlt === 0, `${p} : toutes les images ont un attribut alt`, String(noAlt));
  const noSize = (html.match(/<img(?![^>]*\swidth=)(?=[^>]*\ssrc=)[^>]*>/g) ?? []).length; // images remplies par JS (visionneuse) exclues
  ok(noSize === 0, `${p} : images avec dimensions (pas de saut de mise en page)`, String(noSize));
  (titles.get(title) ?? titles.set(title, []).get(title)).push(p);
  (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(p);
  for (const m of html.matchAll(/<a\s[^>]*href="(\/[^"#?]*)/g)) links.add(m[1]);
}
ok([...titles.values()].every((v) => v.length === 1), 'titres tous différents', [...titles.values()].filter((v) => v.length > 1).join(' | '));
ok([...descs.values()].every((v) => v.length === 1), 'descriptions toutes différentes', [...descs.values()].filter((v) => v.length > 1).join(' | '));

// 3. Liens internes, pages orphelines
const broken = [];
for (const l of links) { const r = await get(l); if (r.status !== 200) broken.push(`${l} (${r.status})`); }
ok(broken.length === 0, `liens internes : ${links.size} vérifiés, aucun cassé`, broken.join(', '));
const orphans = paths.filter((p) => p !== '/' && !links.has(p));
ok(orphans.length === 0, 'aucune page orpheline (chaque page du sitemap reçoit un lien)', orphans.join(', '));

// 4. Doublons, erreurs, pages privées
let r = await get('/contact/');
ok([301, 308].includes(r.status) && r.headers.get('location')?.endsWith('/contact'), '/contact/ → redirection permanente vers /contact', `${r.status} ${r.headers.get('location')}`);
r = await get('/page-qui-n-existe-pas');
ok(r.status === 404, 'page inexistante → vrai 404 (pas de redirection vers l’accueil)', String(r.status));
ok(/noindex/.test(await r.text()), 'page 404 : noindex');
r = await get('/admin/login');
ok(/noindex/.test(r.headers.get('x-robots-tag') ?? ''), 'admin : X-Robots-Tag noindex');
r = await get('/?utm_source=test');
ok(attr(((await r.text()).match(/<link rel="canonical"[^>]*>/) ?? [''])[0], 'href')?.endsWith('/') === true, 'paramètres d’URL ignorés par la canonique');

console.log(`\nSEO : ${pass} réussis, ${fail} échoués (${paths.length} pages, base ${B})`);
process.exit(fail ? 1 : 0);
