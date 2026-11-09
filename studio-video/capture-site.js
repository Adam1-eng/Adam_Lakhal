// ÉTAPE 1 — Capture des écrans du vrai site, en format téléphone (390x844, x3 = 1170x2532 px)
// Lancer : node capture-site.js
// Sécurité : on bloque l'ouverture de WhatsApp → aucune commande n'est envoyée au magasin.
const { chromium } = require('playwright');
const U = 'https://www.autorefaatart.com';

// Fait défiler la page pour déclencher les animations d'apparition, puis remonte en haut
async function warm(p) {
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 300) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(100); }
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
}
// Fait défiler jusqu'à un texte, puis prend une capture
async function shotAt(p, text, file) {
  await p.getByText(text).first().scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -90)); await p.waitForTimeout(900);
  await p.screenshot({ path: file });
}

(async () => {
  require('fs').mkdirSync('cap', { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  await ctx.route(/wa\.me|whatsapp\.com/, r => r.abort());   // ← rien ne part vers WhatsApp
  const p = await ctx.newPage();

  // 1. Accueil
  await p.goto(U, { waitUntil: 'networkidle' }); await warm(p);
  await p.screenshot({ path: 'cap/home_hero.png' });
  await p.screenshot({ path: 'cap/home_long.png', clip: { x: 0, y: 0, width: 390, height: 2700 } , fullPage: true });
  await shotAt(p, 'Pièce introuvable', 'cap/home_introuvable.png');

  // 2. Mon véhicule : Dacia → Logan II → 1.5 dCi
  await p.goto(U + '/mon-vehicule', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const s = p.locator('main select');
  await p.screenshot({ path: 'cap/veh_0.png' });
  await s.nth(0).selectOption({ label: 'Dacia' }); await p.waitForTimeout(500); await p.screenshot({ path: 'cap/veh_1.png' });
  await s.nth(1).selectOption('logan-ii'); await p.waitForTimeout(500);
  await s.nth(2).selectOption('1.5 dCi diesel'); await p.waitForTimeout(500); await p.screenshot({ path: 'cap/veh_2.png' });
  await p.getByRole('button', { name: /Trouver mes pièces/ }).first().click(); await p.waitForTimeout(1500); await warm(p);
  await p.screenshot({ path: 'cap/veh_result_full.png', fullPage: true });

  // 3. Conseiller huile (le véhicule est mémorisé par le site)
  await p.getByText(/Quelle huile pour ma/).first().click(); await p.waitForLoadState('networkidle'); await warm(p);
  await p.screenshot({ path: 'cap/huile_result.png' });

  // 4. Produit compatible → panier
  await p.goto(U + '/produit/phare-logan', { waitUntil: 'networkidle' }); await warm(p);
  await p.evaluate(() => window.scrollBy(0, 520)); await p.waitForTimeout(700);
  await p.screenshot({ path: 'cap/prod2_compat.png' });
  await p.getByRole('button', { name: /Ajouter au panier/ }).first().click(); await p.waitForTimeout(1300);
  await p.screenshot({ path: 'cap/prod2_ajoute.png' });

  // 5. Panier : données FICTIVES (le formulaire n'est jamais envoyé)
  await p.goto(U + '/panier', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const f = p.locator('main input, main textarea, main select');
  await f.nth(0).fill('Client Démo'); await f.nth(1).fill('06 00 00 00 00');
  const villes = await f.nth(2).locator('option').evaluateAll(o => o.map(x => x.value));
  await f.nth(2).selectOption(villes.find(v => /casa/i.test(v)) || villes[1]);
  await f.nth(3).fill('Dacia Logan 2018'); await f.nth(4).fill('Maârif, rue 12');
  const send = p.getByRole('button', { name: /WhatsApp/i }).last();
  await send.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -300)); await p.waitForTimeout(700);
  await p.screenshot({ path: 'cap/panier_send.png' });
  await b.close();
  console.log('Captures terminées dans cap/');
})();
