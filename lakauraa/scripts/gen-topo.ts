// Génère les fichiers de lignes topographiques (public/topo/*.svg). À relancer seulement pour changer le dessin :  npx tsx scripts/gen-topo.ts
import { writeFileSync } from 'node:fs';
import { topoPath } from '../src/lib/topo';
const make = (name: string, o: Parameters<typeof topoPath>[0], stroke: string) => {
  const t = topoPath(o);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.w} ${t.h}" preserveAspectRatio="xMidYMid slice"><path d="${t.d}" fill="none" stroke="${stroke}" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>`;
  writeFileSync(`public/topo/${name}.svg`, svg);
  console.log(name, Math.round(svg.length / 1024), 'Ko');
};
make('aura', { w: 1400, h: 900, seed: 7, levels: 12, step: 24 }, '#5b93ff');
make('terrain', { w: 1400, h: 700, seed: 21, levels: 10, step: 24 }, '#7b8cff');

// Texture « herbe » minimaliste : lames fines et irrégulières, dégradé bleu → violet (palette Lakauraa).
{
  let a = 11; const r = () => ((a = (a * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const W = 1600, H = 240; const blades: string[] = [];
  for (let i = 0; i < 230; i++) {
    const x = (i / 230) * W + (r() - 0.5) * 14, hgt = 40 + Math.pow(r(), 1.6) * 190, lean = (r() - 0.5) * 70, w = 2.2 + r() * 3.2;
    const tipX = x + lean, tipY = H - hgt, cx = x + lean * 0.15, cy = H - hgt * 0.6;
    blades.push(`M${(x - w).toFixed(1)} ${H}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)}Q${(cx + w * 1.6).toFixed(1)} ${(cy + 6).toFixed(1)} ${(x + w).toFixed(1)} ${H}Z`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1e6bff" stop-opacity=".0"/><stop offset=".45" stop-color="#3f6dff" stop-opacity=".38"/><stop offset="1" stop-color="#7b3fd6" stop-opacity=".78"/></linearGradient></defs><path d="${blades.join('')}" fill="url(#g)"/></svg>`;
  writeFileSync('public/texture/herbe.svg', svg); console.log('herbe', Math.round(svg.length / 1024), 'Ko');
}
