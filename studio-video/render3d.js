// Rend comp3d.html image par image → vidéo H.264 haute qualité
// usage : node render3d.js preview 1,5,10   |   node render3d.js video out/image.mp4 [fps]
const { chromium } = require('playwright'); const fs = require('fs'); const { spawn } = require('child_process');
const [mode, arg, fpsArg] = process.argv.slice(2); const FPS = +(fpsArg || 30);
(async () => {
  const tl = JSON.parse(fs.readFileSync('timeline.json')); const rec = JSON.parse(fs.readFileSync('rec/log.json'));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  p.on('pageerror', e => console.log('ERREUR page :', e.message));
  await p.goto('file://' + __dirname + '/comp3d.html');
  const info = await p.evaluate(([a, r]) => window.setup(a, r), [tl, rec]);
  console.log('vitesse par scène :', info.scenes.map(s => s.rate.toFixed(2)).join(' '));
  await p.evaluate(() => document.fonts.ready);
  fs.writeFileSync('events.json', JSON.stringify(await p.evaluate(() => window.EVENTS)));
  if (mode === 'preview') {
    fs.mkdirSync('prev', { recursive: true });
    for (const t of arg.split(',').map(Number)) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: `prev/${t}.jpg`, type: 'jpeg', quality: 85 }); }
  } else {
    fs.mkdirSync('out', { recursive: true });
    const N = Math.round(tl.total * FPS);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-pix_fmt', 'yuv420p', arg], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) {
      await p.evaluate(t => window.render(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 300 === 0) console.log(`image ${f}/${N}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
