/**
 * Tests du site Miya signature.
 *   npm test   (construit le site puis vérifie dist/)
 * Vérifie : contenu interdit, politique mot pour mot, prix et durées,
 * boutons Réserver -> Acuity, SEO, liens internes, accessibilité (axe),
 * débordement horizontal (360/390/768/1440), aucune requête externe.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';
import { identity, policy, services, status, shop, styleGroups, trainings, faq, lookLadder, refillGuide } from '../src/config/miya.ts';
import { duration, price } from '../src/lib/format.ts';

const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
const { AxeBuilder } = await import('@axe-core/playwright');

const DIST = new URL('../dist/', import.meta.url).pathname;
let failures = 0;
let passes = 0;
const ok = (cond, msg) => {
  if (cond) passes++;
  else {
    failures++;
    console.log('  ✗ ' + msg);
  }
};
const section = (t) => console.log('\n▶ ' + t);

if (!process.argv.includes('--no-build')) {
  section('Build');
  execSync('npx astro build', { stdio: 'pipe' });
  console.log('  ✓ build OK');
}

// ---------- Lecture du HTML ----------
const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(DIST);
const routeOf = (p) => '/' + p.slice(DIST.length).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
const decode = (s) =>
  s
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;| |&#160;/g, ' ');
const textOf = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
const html = Object.fromEntries(pages.map((p) => [routeOf(p) || '/', readFileSync(p, 'utf8')]));
const routes = Object.keys(html).filter((r) => r !== '/404');
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim();
const squash = (s) => norm(s).replace(/\s+/g, '');

section('Contenu');
for (const [r, h] of Object.entries(html)) {
  const t = textOf(h);
  ok(!/lorem|ipsum|\bXXX\b|\[À compléter\]|undefined|\bnull\b|NaN/i.test(t), `${r} : texte de remplissage ou valeur manquante`);
  if (status.demo) ok(t.includes(norm(status.demoBanner)), `${r} : bandeau maquette absent`);
  ok((h.match(/<h1[\s>]/g) || []).length === 1, `${r} : doit avoir exactement un H1`);
  ok(!/<img[^>]+instagram|cdninstagram|fbcdn/i.test(h), `${r} : image Instagram détectée`);
}
ok(/extensions de cils à Laval/i.test(textOf(html['/'].match(/<h1[\s\S]*?<\/h1>/)[0])), 'H1 accueil doit contenir « extensions de cils à Laval »');
ok(!routes.includes('/boutique') || shop.enabled, 'boutique générée alors que shop.enabled = false');
if (!shop.enabled) ok(!Object.values(html).some((h) => h.includes('href="/boutique"')), 'lien vers /boutique alors que masquée');
ok(!html['/'].includes('id="reviews-title"'), 'section avis présente sans avis réels');

section('Politique de rendez-vous (mot pour mot)');
const allItems = policy.sections.flatMap((s) => s.items);
for (const r of ['/contact', '/politique-de-rendez-vous']) {
  const t = squash(textOf(html[r]));
  ok(t.includes(squash(policy.intro)), `${r} : introduction modifiée`);
  ok(t.includes(squash(policy.closing)), `${r} : conclusion modifiée`);
  for (const it of allItems) ok(t.includes(squash(it)), `${r} : phrase manquante « ${it.slice(0, 50)}… »`);
}
for (const s of policy.summary) ok(allItems.some((i) => i.includes(s)), `résumé non extrait mot pour mot : « ${s.slice(0, 50)}… »`);
for (const [r, h] of Object.entries(html))
  for (const blk of h.matchAll(/class="policy-sum[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/g))
    for (const li of blk[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g))
      ok(policy.summary.some((x) => squash(x) === squash(textOf(li[1]))), `${r} : résumé affiché modifié « ${textOf(li[1]).slice(0, 60)}… »`);

section('Prix et durées');
const items = html['/services'].split('class="svc__item').slice(1).map((b) => textOf('<' + b.split('</li>\n')[0]));
const flat = services.flatMap((c) => c.services);
ok(items.length === flat.length, `nombre de services affichés (${items.length}) ≠ config (${flat.length})`);
for (const s of flat) {
  const it = items.find((i) => i.includes(norm(s.name)) && !items.some((o) => o !== i && o.includes(norm(s.name)) && o.length < i.length));
  ok(it && it.includes(norm(duration(s.minutes))) && it.includes(norm(price(s.price))), `prix/durée erroné : ${s.name}`);
}
const fText = textOf(html['/formations']);
ok(fText.includes(norm(price(trainings.lashBoss.price))) && fText.includes('3 jours'), 'formation : prix ou durée absents');
const stText = textOf(html['/styles']);
for (const g of styleGroups) for (const s of g.styles) ok(stText.includes(s.name), `style absent : ${s.name}`);
ok(stText.includes('9–13 mm') && stText.includes('8–14 mm') && stText.includes('7–11 mm'), 'longueurs des styles absentes');

section('Guide, FAQ');
{
  const flatS = services.flatMap((c) => c.services);
  const ladder = textOf(html['/services'].split('class="ladder"')[1]?.split('</ol>')[0] ?? '');
  for (const l of lookLadder) {
    const sv = flatS.find((x) => x.name === l.service);
    ok(sv && ladder.includes(norm(sv.name)), `guide : service inconnu ou absent « ${l.service} »`);
  }
  const svcT = squash(textOf(html['/services']));
  for (const f of faq) for (const p of f.a) ok(svcT.includes(squash(p)), `FAQ absente : ${f.q}`);
  const pol = policy.sections.flatMap((x) => x.items);
  for (const f of faq.filter((x) => /payer|annuler/.test(x.q))) for (const p of f.a) ok(pol.includes(p), `FAQ « ${f.q} » ne cite pas la politique mot pour mot`);
  const ld = [...html['/services'].matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  ok(ld.some((d) => d['@type'] === 'FAQPage' && d.mainEntity.length === faq.length), 'FAQPage JSON-LD absent');
  for (const byW of Object.values(refillGuide.rules)) for (const r of Object.values(byW)) if (r.service) ok(flatS.some((x) => x.name === r.service), `calculateur : service inconnu « ${r.service} »`);
}

section('SEO');
const titles = new Set();
const descs = new Set();
for (const r of routes) {
  const h = html[r];
  const title = h.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1];
  ok(title && title.length >= 15 && title.length <= 70, `${r} : titre absent ou longueur hors 15–70 (${title?.length})`);
  ok(desc && desc.length >= 70 && decode(desc).length <= 170, `${r} : description absente ou longueur hors 70–170 (${desc && decode(desc).length})`);
  ok(!titles.has(title), `${r} : titre dupliqué`);
  ok(!descs.has(desc), `${r} : description dupliquée`);
  titles.add(title);
  descs.add(desc);
  ok(/<link rel="canonical" href="https:\/\//.test(h), `${r} : canonical absent`);
  ok(/property="og:image"/.test(h) && /property="og:title"/.test(h), `${r} : Open Graph incomplet`);
  ok(/<html lang="fr-CA"/.test(h), `${r} : lang absent`);
  if (status.demo) ok(/name="robots" content="noindex/.test(h), `${r} : maquette doit être noindex`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1]);
      if (d['@type'] === 'BeautySalon') {
        ok(!d.telephone && !d.openingHours && !d.openingHoursSpecification && !d.address.streetAddress, `${r} : JSON-LD contient des infos inconnues`);
        ok(d.address.addressLocality === 'Laval' && d.email === identity.email && d.sameAs.includes(identity.instagram.url), `${r} : JSON-LD incomplet`);
      }
    } catch {
      ok(false, `${r} : JSON-LD invalide`);
    }
  }
}
ok(existsSync(join(DIST, 'sitemap-index.xml')) && existsSync(join(DIST, 'sitemap-0.xml')), 'sitemap absent');
const sm = existsSync(join(DIST, 'sitemap-0.xml')) ? readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8') : '';
ok(!sm.includes('404') && !sm.includes('boutique'), 'sitemap contient 404 ou boutique');
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
ok(status.demo ? /Disallow: \//.test(robots) : /Sitemap:/.test(robots), 'robots.txt incorrect');
ok(existsSync(join(DIST, 'og.png')) && existsSync(join(DIST, 'favicon.svg')), 'og.png ou favicon absent');

// ---------- Serveur local ----------
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(DIST, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  else if (!existsSync(f) && existsSync(f + '.html')) f += '.html';
  if (!existsSync(f)) {
    res.writeHead(404, { 'Content-Type': types['.html'] });
    return res.end(readFileSync(join(DIST, '404.html')));
  }
  res.writeHead(200, { 'Content-Type': types[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4399, r));
const BASE = 'http://localhost:4399';

section('Liens internes');
{
  const seen = new Set();
  for (const r of Object.keys(html)) {
    for (const m of html[r].matchAll(/href="([^"]+)"/g)) {
      const href = decode(m[1]);
      if (/^(https?:|mailto:|tel:)/.test(href) || seen.has(href)) continue;
      seen.add(href);
      const [path, hash] = href.split('#');
      const target = path || r;
      const res = await fetch(BASE + target);
      ok(res.status === 200, `lien cassé ${href} (depuis ${r}) : ${res.status}`);
      if (hash && res.status === 200) {
        const body = await res.text();
        ok(body.includes(`id="${hash}"`), `ancre introuvable ${href}`);
      }
    }
  }
  const ext = new Set(Object.values(html).flatMap((h) => [...h.matchAll(/href="(https?:[^"]+)"/g)].map((m) => decode(m[1]))));
  const extOk = [...ext].every((u) => u.startsWith('https://miyasignature.as.me') || u.startsWith('https://www.instagram.com/miya.signature') || u.startsWith('https://ig.me/m/miya.signature') || u.startsWith('https://www.google.com/maps/') || u.startsWith(identity.siteUrl));
  ok(extOk, 'lien externe inattendu : ' + [...ext].join(', '));
}

section('Navigateur : Réserver, accessibilité, débordement, requêtes externes');
const browser = await chromium.launch();
for (const r of Object.keys(html)) {
  for (const width of [360, 390, 768, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const external = [];
    const errors = [];
    page.on('request', (q) => { if (!q.url().startsWith(BASE) && !q.url().startsWith('data:')) external.push(q.url()); });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE + r, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
    await page.waitForTimeout(1100);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflow <= 0, `${r} @${width}px : débordement horizontal de ${overflow}px`);

    if (width === 390 || width === 1440) {
      ok(external.length === 0, `${r} @${width} : requêtes externes ${external.join(', ')}`);
      ok(errors.length === 0, `${r} @${width} : erreurs JS ${errors.join(' | ')}`);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze();
      for (const v of axe.violations) ok(false, `${r} @${width} axe : ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target}`);
      if (!axe.violations.length) passes++;
    }

    if (width === 390) {
      const res = await page.evaluate((url) => {
        const out = [];
        const reserve = [...document.querySelectorAll('a, button')].filter((a) => /r[ée]serv/i.test(a.textContent || '') && !a.closest('.policy-sum') && !a.closest('nav'));
        for (const a of reserve) out.push({ kind: 'text', ok: a.getAttribute('href') === url, txt: a.textContent.trim() });
        for (const a of document.querySelectorAll('[data-booking]')) {
          const sec = a.closest('section') || document.body;
          const before = [...sec.querySelectorAll('.policy-sum, .policy')].some((p) => p.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
          out.push({ kind: 'policy', ok: before && a.getAttribute('href') === url, txt: a.textContent.trim() });
        }
        return out;
      }, identity.bookingUrl);
      for (const x of res) ok(x.ok, `${r} : bouton « ${x.txt} » ${x.kind === 'policy' ? 'sans résumé de politique avant / mauvais lien' : 'ne pointe pas vers Acuity'}`);
    }
    await ctx.close();
  }
}

// Menu mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await page.click('.nav-toggle');
  await page.waitForTimeout(450);
  ok(await page.isVisible('#nav-list a[href="/services"]'), 'menu mobile : liens invisibles après ouverture');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  ok(!(await page.isVisible('#nav-list a[href="/services"]')), 'menu mobile : ne se ferme pas avec Échap');
  await ctx.close();
}
// Carte : rien d'externe avant le clic, iframe OpenStreetMap après
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const ext = [];
  page.on('request', (q) => { if (!q.url().startsWith(BASE)) ext.push(q.url()); });
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle' });
  ok(ext.length === 0, 'carte : requête externe avant le clic');
  for (const w of [360, 390, 768]) {
    await page.setViewportSize({ width: w, height: 800 });
    const fits = await page.evaluate(() => [...document.querySelectorAll('.map__frame, .map__hint, .map__load, .map__info')].every((e) => e.getBoundingClientRect().right <= document.querySelector('.map').getBoundingClientRect().right + 0.5));
    ok(fits, `carte @${w}px : contenu coupé (dépasse du cadre)`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('.map__load');
  const src = await page.getAttribute('.map__frame iframe', 'src');
  ok(/openstreetmap\.org\/export\/embed\.html.*marker=45\.56/.test(src || ''), 'carte : iframe OpenStreetMap absente après clic');
  ok(await page.isVisible('.map__note') === !identity.location.geo, 'carte : mention « repère, pas l’adresse exacte » manquante');
  await ctx.close();
}
// Calculateur de remplissage
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/services#calculateur');
  const flatS = services.flatMap((c) => c.services);
  for (const [type, byW] of Object.entries(refillGuide.rules)) {
    for (const [w, r] of Object.entries(byW)) {
      await page.check(`.calc input[name=type][value=${type}]`, { force: true });
      await page.check(`.calc input[name=weeks][value="${w}"]`, { force: true });
      const title = (await page.textContent('[data-out-title]')).trim();
      const meta = norm(await page.textContent('[data-out-meta]'));
      const bookVisible = await page.isVisible('[data-out-book]');
      if (r.service) {
        const sv = flatS.find((x) => x.name === r.service);
        ok(title === sv.name && meta === norm(`${duration(sv.minutes)} · ${price(sv.price)}`) && bookVisible, `calculateur ${type}/${w} : « ${title} ${meta} »`);
      } else ok(title === r.message && !bookVisible, `calculateur ${type}/${w} : message attendu`);
    }
  }
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(600);
  ok(await page.isVisible('.mbar'), 'barre de réservation mobile invisible à 390 px après défilement');
  ok((await page.getAttribute('.mbar__book', 'href')) === '/contact#reserver', 'barre mobile : mauvais lien');
  await page.setViewportSize({ width: 1440, height: 900 });
  ok(!(await page.isVisible('.mbar')), 'barre mobile visible sur bureau');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/');
  await page.waitForTimeout(600);
  ok(!(await page.isVisible('.mbar')), 'barre mobile visible en haut de l’accueil (cache le bouton Réserver)');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/styles');
  await page.click('.filters button[data-filter=couleurs]');
  const vis = await page.evaluate(() => [...document.querySelectorAll('[data-group]')].filter((g) => !g.hidden).map((g) => g.dataset.group));
  ok(vis.length === 1 && vis[0] === 'couleurs', 'filtres styles : ' + vis.join(','));
  await page.click('.filters button[data-filter=all]');
  ok((await page.evaluate(() => [...document.querySelectorAll('[data-group]')].filter((g) => !g.hidden).length)) === styleGroups.length, 'filtre « Tous » ne réaffiche pas tout');
  await ctx.close();
}
// prefers-reduced-motion
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  const op = await page.evaluate(() => getComputedStyle(document.querySelector('.reveal')).opacity);
  ok(op === '1', 'prefers-reduced-motion : contenu masqué');
  await ctx.close();
}
await browser.close();
server.close();

console.log(`\n${failures ? '✗' : '✓'} ${passes} vérifications réussies, ${failures} échec(s).`);
process.exit(failures ? 1 : 0);
