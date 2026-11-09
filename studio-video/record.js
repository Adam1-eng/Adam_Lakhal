// ENREGISTREMENT RÉEL du site, comme un vrai client sur son téléphone :
// vrais touchers, vrais défilements, vraies sélections, vraie saisie au clavier.
// - Écran de l'iPhone 16 Pro Max (440x956 points) filmé en 880x1912 px, au ralenti x3 puis remis à vitesse normale
// - Chaque geste est noté (journal) pour dessiner le doigt, les menus et le clavier dans la vidéo
// - WhatsApp est intercepté : une page maquette locale s'affiche, RIEN n'est envoyé au magasin
const { chromium } = require('playwright');
const fs = require('fs');
const U = 'https://www.autorefaatart.com';
const OUT = 'rec';
const VW = 440, VH = 956;          // écran de l'iPhone 16 Pro Max (en points)
const DPR = 2;                     // netteté x2 (880x1912 px)
const SLOW = 3;                    // ralenti x3 pendant l'enregistrement → images fluides, remis à vitesse normale au montage
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT + '/frames', { recursive: true });

const now = () => Date.now() / 1000;
const LOG = [];                  // journal des gestes
const FRAMES = [];               // {f: fichier, t: horodatage}
let clip = null;
const sleep = ms => new Promise(r => setTimeout(r, ms * SLOW));   // toutes les attentes sont ralenties

// Page maquette "WhatsApp" (affichée à la place de wa.me, rien ne sort de l'ordinateur)
function waPage(text, photo) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const fmt = s => esc(s).replace(/\*(.+?)\*/g, '<b>$1</b>').replace(/_(.+?)_/g, '<i>$1</i>');
  return `<!doctype html><html><head><meta name=viewport content="width=device-width,initial-scale=1"><style>
  *{box-sizing:border-box;margin:0}body{font-family:-apple-system,Roboto,Arial,sans-serif;background:#0b141a;color:#e9edef;height:100vh;display:flex;flex-direction:column}
  header{background:#1f2c34;padding:46px 14px 12px;display:flex;align-items:center;gap:12px}
  .av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#a51f43,#e0315f);display:grid;place-items:center;font-weight:900;color:#e8b04a}
  header b{display:block;font-size:17px}header small{color:#8696a0;font-size:12.5px}
  main{flex:1;overflow:hidden;padding:14px 10px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;
    background:radial-gradient(circle at 20% 30%,rgba(255,255,255,.035),transparent 55%),#0b141a}
  .day{align-self:center;background:#182229;color:#8696a0;font-size:12px;padding:5px 10px;border-radius:8px;margin-bottom:auto}
  .b{align-self:flex-end;max-width:84%;background:#005c4b;border-radius:10px 2px 10px 10px;padding:8px 10px 18px;font-size:13.5px;line-height:1.38;white-space:pre-wrap;position:relative;animation:pop .25s ease-out}
  .b .tk{position:absolute;right:8px;bottom:3px;font-size:11px;color:#8bb3ab}.b .tk.ok{color:#53bdeb}
  .b img{display:block;width:220px;border-radius:8px;margin:-2px -4px 2px}
  @keyframes pop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
  footer{display:flex;gap:8px;align-items:flex-end;padding:8px 8px 26px;background:#0b141a}
  #in{flex:1;background:#1f2c34;border-radius:22px;padding:10px 14px;font-size:14px;line-height:1.35;max-height:210px;overflow:hidden;white-space:pre-wrap}
  #send{width:48px;height:48px;border-radius:50%;background:#00a884;border:0;display:grid;place-items:center}
  </style></head><body>
  <header><div class=av>AR</div><div><b>AutoRefaatArt</b><small>en ligne</small></div></header>
  <main id=m><div class=day>AUJOURD'HUI</div></main>
  <footer><div id=in>${fmt(text)}</div><button id=send aria-label=Envoyer><svg width=22 height=22 viewBox="0 0 24 24" fill="#fff"><path d="M2 21 23 12 2 3v7l15 2-15 2z"/></svg></button></footer>
  <script>
  document.getElementById('send').onclick=()=>{
    const m=document.getElementById('m'), d=document.createElement('div'); d.className='b';
    d.innerHTML=document.getElementById('in').innerHTML+'<span class=tk>13:42 ✓✓</span>'; m.appendChild(d);
    document.getElementById('in').innerHTML='<span style="color:#8696a0">Message</span>';
    setTimeout(()=>d.querySelector('.tk').classList.add('ok'),700);
    ${photo ? `setTimeout(()=>{const p=document.createElement('div');p.className='b';p.innerHTML='<img src="${photo}"><span class=tk>13:42 ✓✓</span>';m.appendChild(p);},650);` : ''}
  };</script></body></html>`;
}

(async () => {
  const b = await chromium.launch({ args: [`--force-device-scale-factor=${DPR}`] });
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  let photo = '';
  await ctx.route(/wa\.me|whatsapp\.com/, r => {
    const url = new URL(r.request().url());
    const txt = url.searchParams.get('text') || '';
    LOG.push({ k: 'wa', t: now(), text: txt });
    r.fulfill({ contentType: 'text/html; charset=utf-8', body: waPage(txt, /pièce/i.test(txt) && !/COMMANDE/.test(txt) ? photo : '') });
  });
  await ctx.addInitScript(() => { window.open = u => { location.href = u; return null; }; });
  const p = await ctx.newPage();
  p.on('request', r => { if (!['GET', 'HEAD'].includes(r.method())) console.log('⚠️ requête', r.method(), r.url()); });
  const cdp = await ctx.newCDPSession(p);
  let n = 0;
  cdp.on('Page.screencastFrame', async f => {
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    if (!clip) return;
    const file = `frames/${String(n++).padStart(5, '0')}.jpg`;
    fs.writeFileSync(`${OUT}/${file}`, Buffer.from(f.data, 'base64'));
    FRAMES.push({ f: file, t: f.metadata.timestamp, clip: clip.id });
  });

  // ---------- gestes ----------
  async function slowmo() { await cdp.send('Animation.enable').catch(() => {}); await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / SLOW }).catch(() => {}); }
  p.on('framenavigated', f => { if (f === p.mainFrame()) slowmo(); });
  async function startClip(id) { await slowmo(); clip = { id, t0: now() }; await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: VW * DPR, maxHeight: VH * DPR }); await sleep(250); }
  async function endClip() { await sleep(150); await cdp.send('Page.stopScreencast'); LOG.push({ k: 'clip', id: clip.id, t0: clip.t0, t1: now() }); clip = null; }
  async function center(loc) { await loc.scrollIntoViewIfNeeded().catch(() => {}); const bb = await loc.boundingBox(); return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }; }
  async function tap(loc, { real = true } = {}) {
    const c = await center(loc);
    LOG.push({ k: 'tap', t: now() + 0.32 * SLOW, x: c.x, y: c.y });   // le doigt arrive, puis touche
    await sleep(320);
    if (real) await p.touchscreen.tap(c.x, c.y);
    await sleep(180);
  }
  async function swipe(toY, dur = 900) {      // défilement fluide, comme un geste du pouce
    const y0 = await p.evaluate(() => window.scrollY);
    const t = now(); dur *= SLOW; LOG.push({ k: 'swipe', t0: t, t1: t + dur / 1000, dy: toY - y0 });
    await p.evaluate(async ({ toY, dur }) => {
      const y0 = window.scrollY, t0 = performance.now();
      await new Promise(r => { const st = () => { const u = Math.min(1, (performance.now() - t0) / dur);
        const e = 1 - Math.pow(1 - u, 3); window.scrollTo(0, y0 + (toY - y0) * e); u < 1 ? requestAnimationFrame(st) : r(); }; st(); });
    }, { toY, dur });
  }
  const yOf = txt => p.getByText(txt).first().evaluate(e => e.getBoundingClientRect().top + window.scrollY);
  async function pick(sel, value, label) {   // menu déroulant : le doigt touche, la liste s'ouvre, on choisit
    const c = await center(sel);
    const opts = await sel.locator('option').evaluateAll(o => o.filter(x => x.value).map(x => x.textContent.trim()));
    const t = now(); LOG.push({ k: 'tap', t: t + 0.32 * SLOW, x: c.x, y: c.y });
    LOG.push({ k: 'picker', t0: t + 0.45 * SLOW, t1: t + 1.05 * SLOW, options: opts.slice(0, 7), chosen: Math.max(0, opts.slice(0, 7).indexOf(label)) });
    await sleep(1050);
    await sel.selectOption(value);
    await sleep(350);
  }
  async function type(loc, text, delay = 60) {
    await tap(loc); const t = now(); await loc.pressSequentially(text, { delay: delay * SLOW });
    LOG.push({ k: 'kb', t0: t - 0.2 * SLOW, t1: now() + 0.25 * SLOW });
  }

  // ===== 1. ACCROCHE : page d'accueil (animations du site en direct) =====
  await p.goto(U, { waitUntil: 'networkidle' }); await sleep(600);
  await startClip('hook'); await sleep(5200); await endClip();

  // ===== 2. VISITE : 3 coups de pouce jusqu'aux rayons =====
  await startClip('intro');
  await sleep(500); await swipe(620, 1000); await sleep(650);
  await swipe(1260, 1000); await sleep(650);
  await swipe((await yOf('Nos rayons')) - 70, 1100); await sleep(1300);
  await endClip();

  // ===== 3. MON VÉHICULE : Dacia → Logan II → 1.5 dCi → Trouver =====
  await p.goto(U + '/mon-vehicule', { waitUntil: 'networkidle' }); await sleep(600);
  const sels = p.locator('main select');
  await startClip('vehicule');
  await sleep(400);
  await pick(sels.nth(0), 'dacia', 'Dacia');
  await pick(sels.nth(1), 'logan-ii', 'Logan II (2012–2020)');
  await pick(sels.nth(2), '1.5 dCi diesel', '1.5 dCi diesel');
  await tap(p.getByRole('button', { name: /Trouver mes pièces/ }).first());
  await p.waitForLoadState('networkidle'); await sleep(900);
  await swipe((await yOf('Pièces compatibles')) - 90, 1000); await sleep(900);
  await endClip();

  // ===== 4. CONSEILLER HUILE =====
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(500);
  await startClip('huile');
  await sleep(300);
  await tap(p.getByText(/Quelle huile pour ma/).first());
  await p.waitForLoadState('networkidle'); await sleep(900);
  await swipe(250, 800); await sleep(1200);
  await endClip();

  // ===== 5. COMMANDE : produit compatible → panier → formulaire → WhatsApp =====
  await p.goto(U + '/produit/phare-logan', { waitUntil: 'networkidle' }); await sleep(600);
  photo = await p.locator('main img').first().evaluate(i => i.currentSrc || i.src).catch(() => '');
  await startClip('commande');
  await sleep(250); await swipe(470, 700); await sleep(350);
  await tap(p.getByRole('button', { name: /Ajouter au panier/ }).first()); await sleep(800);
  await tap(p.locator('header a[href="/panier"]').first());
  await p.waitForLoadState('networkidle'); await sleep(500);
  const f = p.locator('main input, main textarea, main select');
  await swipe((await f.nth(0).evaluate(e => e.getBoundingClientRect().top + window.scrollY)) - 260, 800); await sleep(200);
  await type(f.nth(0), 'Client Démo', 45);
  // remplissage automatique (comme l'autocomplétion du téléphone)
  const t0 = now(); await f.nth(1).fill('06 00 00 00 00'); await sleep(120);
  const villes = await f.nth(2).locator('option').evaluateAll(o => o.map(x => x.value));
  await f.nth(2).selectOption(villes.find(v => /casa/i.test(v)) || villes[1]); await sleep(120);
  await f.nth(3).fill('Dacia Logan 2018'); await sleep(120); await f.nth(4).fill('Maârif, rue 12'); await sleep(150);
  LOG.push({ k: 'autofill', t: t0 });
  const send = p.getByRole('button', { name: /WhatsApp/i }).last();
  await swipe((await send.evaluate(e => e.getBoundingClientRect().top + window.scrollY)) - 560, 1000); await sleep(400);
  await tap(send); await sleep(1100);
  await tap(p.locator('#send')); await sleep(1300);
  await endClip();

  // ===== 6. PIÈCE INTROUVABLE → photo sur WhatsApp =====
  await p.goto(U, { waitUntil: 'networkidle' });
  const yi = await yOf('Pièce introuvable');
  await p.evaluate(y => window.scrollTo(0, y), yi - 900); await sleep(900);
  await startClip('introuvable');
  await sleep(300); await swipe(yi - 160, 1100); await sleep(500);
  await p.evaluate(() => document.querySelectorAll('a[target]').forEach(a => a.removeAttribute('target')));
  await tap(p.getByText('Pièce introuvable').first().locator('xpath=ancestor::*[.//a[contains(@href,"wa.me")]][1]').locator('a[href*="wa.me"]').first()); await sleep(1100);
  await tap(p.locator('#send')); await sleep(1500);
  await endClip();

  fs.writeFileSync(`${OUT}/log.json`, JSON.stringify({ vw: VW, vh: VH, slow: SLOW, frames: FRAMES, log: LOG }, null, 1));
  const parClip = {}; FRAMES.forEach(x => parClip[x.clip] = (parClip[x.clip] || 0) + 1);
  console.log('images par scène :', parClip);
  console.log('WhatsApp (maquette) :', LOG.filter(l => l.k === 'wa').map(l => l.text.slice(0, 60).replace(/\n/g, ' ')));
  await b.close();
})();
