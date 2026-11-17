// Tests de bout en bout (Playwright) : responsive sur 6 tailles, cibles tactiles, mesure des contacts, GPC, clavier.
// npm run test:e2e   (serveur de dev lancé sur le port 4400)  —  BASE=https://… pour une autre adresse.
const { chromium } = require('playwright');
const B = (process.env.BASE ?? 'http://localhost:4400').replace(/\/$/, '');
const sizes = [['petit-tel', 320, 640], ['tel', 390, 844], ['tablette-p', 768, 1024], ['tablette-l', 1024, 768], ['portable', 1366, 768], ['grand', 1920, 1080]];
const pages = ['/', '/services', '/projets', '/projets/autorefaatart', '/a-propos', '/contact', '/avis', '/confidentialite'];
let fails = 0; const bad = (m) => { fails++; console.log('FAIL', m); };
(async () => {
  const b = await chromium.launch();
  // 1. Responsive : aucun débordement horizontal, aucune erreur console, aucun texte coupé visible
  for (const [n, w, h] of sizes) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', hasTouch: w < 1024 });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    for (const path of pages) {
      await p.goto(B + path, { waitUntil: 'networkidle' });
      const r = await p.evaluate(() => {
        const over = document.documentElement.scrollWidth - innerWidth;
        const culprits = over > 1 ? [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('[aria-hidden="true"], .rw__marquee, .marquee, [class*="marquee"]'); }).slice(0, 3).map((e) => e.tagName + '.' + e.className) : [];
        // Cibles tactiles visibles trop petites (WCAG 2.5.8 : 24×24 px minimum)
        const small = [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')].filter((e) => {
          const b = e.getBoundingClientRect(); if (!b.width || !b.height || getComputedStyle(e).visibility === 'hidden') return false;
          if (e.closest('p, li, dd, td, .lg-s')) return false; // liens dans un texte : exemptés par WCAG
          if (e.matches('input[type=radio], input[type=checkbox]') && e.closest('label')) return false;
          return b.width < 24 || b.height < 24;
        }).slice(0, 3).map((e) => `${e.tagName}.${e.className}(${Math.round(e.getBoundingClientRect().width)}×${Math.round(e.getBoundingClientRect().height)})`);
        return { over, culprits, small };
      });
      if (r.over > 1) bad(`${n} ${path} débordement ${r.over}px ${r.culprits.join(', ')}`);
      if (r.small.length) bad(`${n} ${path} cibles < 24px : ${r.small.join(', ')}`);
    }
    if (errs.length) bad(`${n} erreurs console : ${[...new Set(errs)].slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
  // 2. Mesure des contacts : chaque action envoie bien un événement (requêtes interceptées)
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); const sent = [];
  await p.route('**/api/evt', async (r) => { sent.push(JSON.parse(r.request().postData())); await r.continue(); });
  await ctx.route(/wa\.me|^tel:|^sms:|^mailto:/, (r) => r.abort());
  p.on('popup', (pp) => pp.close().catch(() => {}));
  await p.goto(B + '/services', { waitUntil: 'networkidle' });
  await p.locator('main a[href="/contact"]').first().click(); await p.waitForURL('**/contact');
  await p.waitForTimeout(300);
  await p.fill('#cf-commerce', 'Test'); await p.fill('#cf-nom', 'Test'); await p.fill('#cf-joindre', '5145550123');
  await p.click('.cf__submit button'); await p.waitForSelector('[data-done]:not([hidden])');
  await p.evaluate(() => document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], a[href^="sms:"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault())));
  await p.locator('main a[href^="tel:"]:visible').first().click();
  await p.locator('main a[href^="mailto:"]:visible').first().click();
  await p.locator('main [data-wa-open]:visible').first().click();
  await p.waitForSelector('dialog[open]');
  const hint = await p.locator('[data-wa-hint]').textContent();
  const lines = await p.locator('dialog[open] [data-wa-line]').evaluateAll((l) => l.map((a) => a.dataset.waLine + ':' + a.getAttribute('href').slice(0, 30)));
  await p.locator('dialog[open] [data-wa-line="ma"]').click();
  await p.waitForTimeout(800);
  const evs = sent.map((x) => `${x.e}@${x.p}`);
  console.log('événements envoyés :', evs.join(', '));
  console.log('choix WhatsApp :', lines.join(' | '), '· conseil :', hint);
  for (const want of ['cta_contact@/services', 'form_ready@/contact', 'call@/contact', 'email@/contact', 'whatsapp_ma@/contact']) if (!evs.includes(want)) bad('événement manquant ' + want);
  if (new Set(evs).size !== evs.length) bad('événement envoyé en double');
  // 3. Respect de Global Privacy Control
  const ctx2 = await b.newContext(); await ctx2.addInitScript(() => Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true }));
  const p2 = await ctx2.newPage(); let n2 = 0; await p2.route('**/api/evt', (r) => { n2++; r.continue(); });
  await p2.goto(B + '/services', { waitUntil: 'networkidle' }); await p2.locator('main a[href="/contact"]').first().click(); await p2.waitForTimeout(800);
  if (n2) bad('GPC ignoré : ' + n2 + ' événement(s) envoyé(s)'); else console.log('GPC respecté : 0 événement');
  // 3 bis. Menu mobile : ouverture, navigation, fermeture, défilement rétabli
  const pm = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
  await pm.goto(B + '/', { waitUntil: 'networkidle' });
  for (const target of ['/services', '/projets', '/contact']) {
    await pm.locator('[data-menu-toggle]').click();
    await pm.waitForSelector('#mobile-menu.is-open');
    await pm.locator(`#mobile-menu nav a[href="${target}"]`).click();
    await pm.waitForURL('**' + target);
    await pm.waitForTimeout(500);
    const st = await pm.evaluate(() => ({ open: !!document.querySelector('#mobile-menu.is-open'), hidden: document.querySelector('#mobile-menu').hidden, overflow: document.documentElement.style.overflow, y: scrollY }));
    if (st.open || !st.hidden || st.overflow) bad(`menu après navigation vers ${target} : ${JSON.stringify(st)}`);
  }
  await pm.locator('[data-menu-toggle]').click(); await pm.waitForSelector('#mobile-menu.is-open');
  await pm.locator('#mobile-menu [data-wa-open]').click(); await pm.waitForSelector('dialog[open]');
  await pm.locator('dialog[open] [data-wa-close]').click(); await pm.waitForTimeout(500);
  const wa = await pm.evaluate(() => ({ open: !!document.querySelector('#mobile-menu.is-open'), overflow: document.documentElement.style.overflow }));
  if (wa.open || wa.overflow) bad('WhatsApp depuis le menu : menu resté ouvert ou page bloquée ' + JSON.stringify(wa));
  console.log('menu mobile : 3 navigations + WhatsApp OK');

  // 4. Clavier : lien d'évitement + focus visible
  const p3 = await (await b.newContext()).newPage(); await p3.goto(B + '/', { waitUntil: 'networkidle' });
  await p3.keyboard.press('Tab');
  const skip = await p3.evaluate(() => ({ t: document.activeElement?.textContent?.trim(), ol: getComputedStyle(document.activeElement).outlineStyle, vis: document.activeElement.getBoundingClientRect().top >= 0 }));
  console.log('1re tabulation :', JSON.stringify(skip));
  if (!/Aller au contenu/.test(skip.t ?? '')) bad('lien d’évitement absent');
  for (let i = 0; i < 6; i++) await p3.keyboard.press('Tab');
  const f = await p3.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return { tag: e.tagName, txt: e.textContent.trim().slice(0, 30), outline: s.outlineStyle + ' ' + s.outlineWidth, shadow: s.boxShadow !== 'none' }; });
  console.log('focus après 7 tabulations :', JSON.stringify(f));
  if (f.outline.startsWith('none') && !f.shadow) bad('focus non visible');
  console.log(fails ? `\n${fails} problème(s)` : '\nTout est OK'); process.exitCode = fails ? 1 : 0;
  await b.close();
})();
