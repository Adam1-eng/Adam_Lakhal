// Usage : node tests/shot.mjs <url> <out.png> [width] [fullPage] [scale]
import { createRequire } from 'node:module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
const [url, out, width = '1440', full = '1', scale = '1'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +width, height: +width < 600 ? 844 : 900 }, deviceScaleFactor: +scale });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible')));
await p.waitForTimeout(300);
await p.screenshot({ path: out, fullPage: full === '1' });
await b.close();
