// Rend la composition image par image et l'envoie à ffmpeg
// usage : node render.js ar preview 1,5,10   |   node render.js ar video out.mp4
const { chromium } = require('playwright'); const fs = require('fs'); const { spawn } = require('child_process');
const [lang, mode, arg] = process.argv.slice(2); const FPS = 30;
(async () => {
  const tl = JSON.parse(fs.readFileSync(`timeline_${lang}.json`)); const tx = JSON.parse(fs.readFileSync('texts.json'))[lang];
  const wa = fs.readFileSync('wa_message.txt', 'utf8').trim();
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
  await p.goto('file://' + __dirname + '/comp.html');
  await p.evaluate(([a, b, c, d]) => window.setup(a, b, c, d), [tl, tx, lang, wa]);
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
  fs.writeFileSync(`events_${lang}.json`, JSON.stringify(await p.evaluate(() => window.EVENTS)));
  if (mode === 'preview') {
    for (const t of arg.split(',').map(Number)) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: `prev/${lang}_${t}.jpg`, type: 'jpeg', quality: 80 }); }
  } else {
    const N = Math.round(tl.total * FPS);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', arg], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) {
      await p.evaluate(t => window.render(t), f / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`image ${f}/${N}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
