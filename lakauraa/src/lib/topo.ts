// Lignes topographiques : courbes de niveau d'un relief abstrait, calculées UNE FOIS à la construction
// (marching squares sur un champ lisse). Résultat : un seul chemin SVG léger, sans JavaScript côté visiteur.
type Bump = { x: number; y: number; r: number; h: number };

function field(bumps: Bump[]) {
  return (x: number, y: number) => bumps.reduce((s, b) => s + b.h * Math.exp(-(((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.r * b.r))), 0);
}

/** Générateur pseudo-aléatoire déterministe : le dessin est identique à chaque construction. */
function rng(seed: number) { let a = seed; return () => ((a = (a * 1664525 + 1013904223) % 4294967296) / 4294967296); }

export function topoPath(opts: { w?: number; h?: number; seed?: number; bumps?: Bump[]; levels?: number; step?: number } = {}) {
  const { w = 1000, h = 700, seed = 7, levels = 14, step = 14 } = opts;
  const r = rng(seed);
  const bumps = opts.bumps ?? Array.from({ length: 7 }, () => ({ x: r() * w, y: r() * h, r: 120 + r() * 200, h: 0.5 + r() * 0.8 }));
  const f = field(bumps);
  const cols = Math.ceil(w / step) + 1, rows = Math.ceil(h / step) + 1;
  const grid: number[][] = [];
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < rows; j++) { grid[j] = []; for (let i = 0; i < cols; i++) { const v = f(i * step, j * step); grid[j][i] = v; if (v < min) min = v; if (v > max) max = v; } }
  const d: string[] = [];
  for (let L = 1; L <= levels; L++) {
    const t = min + ((max - min) * L) / (levels + 1);
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
      const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], dd = grid[j + 1][i];
      const idx = (a > t ? 8 : 0) | (b > t ? 4 : 0) | (c > t ? 2 : 0) | (dd > t ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x0 = i * step, y0 = j * step;
      const lerp = (p: number, q: number) => (t - p) / (q - p);
      const top = [x0 + step * lerp(a, b), y0], right = [x0 + step, y0 + step * lerp(b, c)], bottom = [x0 + step * lerp(dd, c), y0 + step], left = [x0, y0 + step * lerp(a, dd)];
      const seg = (p: number[], q: number[]) => d.push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
      switch (idx) {
        case 1: case 14: seg(left, bottom); break;
        case 2: case 13: seg(bottom, right); break;
        case 3: case 12: seg(left, right); break;
        case 4: case 11: seg(top, right); break;
        case 5: seg(left, top); seg(bottom, right); break;
        case 6: case 9: seg(top, bottom); break;
        case 7: case 8: seg(left, top); break;
        case 10: seg(top, right); seg(left, bottom); break;
      }
    }
  }
  return { d: d.join(''), w, h };
}
