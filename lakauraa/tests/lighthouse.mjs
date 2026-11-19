// Contrôle de performance : npm run test:perf   (ou  BASE=https://lakauraa.com npm run test:perf)
// Lance Lighthouse (téléchargé à la demande par npx, aucune dépendance ajoutée au projet) sur les pages principales,
// au cellulaire et sur ordinateur, et échoue si un score tombe sous le seuil.
// Variables : BASE (adresse du site), CHROME (chemin de Chrome/Chromium), MIN (seuil, 90 par défaut).
// Un score varie de quelques points d'un passage à l'autre : le seuil laisse une marge, la valeur retenue est la médiane de 3.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const BASE = (process.env.BASE ?? 'https://lakauraa.com').replace(/\/$/, '');
const MIN = Number(process.env.MIN ?? 90);
const CHROME = process.env.CHROME ?? '';
const PAGES = ['/', '/services', '/projets/autorefaatart', '/a-propos', '/contact'];
const dir = mkdtempSync(path.join(tmpdir(), 'lh-'));
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

let bad = 0;
for (const page of PAGES) {
  for (const device of ['mobile', 'desktop']) {
    const scores = { performance: [], accessibility: [], 'best-practices': [], seo: [] };
    for (let i = 0; i < 3; i++) {
      const out = path.join(dir, `r-${i}.json`);
      const args = ['--yes', 'lighthouse', BASE + page, '--output=json', `--output-path=${out}`, '--quiet',
        '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new --no-sandbox'];
      if (device === 'desktop') args.push('--preset=desktop');
      if (CHROME) args.push(`--chrome-path=${CHROME}`);
      try { execFileSync('npx', args, { stdio: 'ignore', timeout: 180000 }); } catch { continue; }
      const c = JSON.parse(readFileSync(out, 'utf8')).categories;
      for (const k of Object.keys(scores)) if (c?.[k]?.score != null) scores[k].push(Math.round(c[k].score * 100));
    }
    const line = Object.entries(scores).map(([k, v]) => (v.length ? `${k}=${median(v)}` : `${k}=?`)).join(' ');
    const fail = Object.values(scores).some((v) => !v.length || median(v) < MIN);
    if (fail) bad++;
    console.log(`${fail ? 'ÉCHEC' : 'OK   '} ${page.padEnd(26)} ${device.padEnd(8)} ${line}`);
  }
}
console.log(bad ? `${bad} combinaison(s) sous ${MIN}` : `Tout est ≥ ${MIN} (${PAGES.length} pages × 2 appareils)`);
process.exit(bad ? 1 : 0);
