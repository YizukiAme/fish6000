// 只渲染「捌 · 年画」那一块画（固定取景，不跟镜头走），专门用来和原画对照
//   node tools/s8_panel.js 111.6 112.2 …
//   → cmp/s8_111.6.jpg …，另写 cmp/s8_meta.json（取景参数，tools/nianhua_compare.py 要用）
// 时间是成片里的真实秒数，和 render.js stills 一样。这一段里：真实秒数 = 片内时间 + 5.35
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '..');
const launch = require(path.join(ROOT, 'browser'));
(async () => {
  const ts = process.argv.slice(2).map(Number).filter(x => !isNaN(x));
  if (!ts.length) { console.log('用法：node tools/s8_panel.js 112.2 [更多时间…]'); return; }
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.error('页面出错:', e.message));
  p.on('console', m => { if (m.type() === 'error') console.error('控制台:', m.text()); });
  await p.goto(pathToFileURL(path.join(ROOT, 'film.html')).href + '?render');
  await p.evaluate(() => window.prepare());
  const out = path.join(ROOT, 'cmp'); fs.mkdirSync(out, { recursive: true });
  for (const tr of ts) {
    const r = await p.evaluate(tr => {
      window.render(tr);                                   // 先照常渲一帧，把这一刻的状态都算好
      TREAL = tr; TNOW = WE(tr); const t = W5(TNOW);
      const PW = S8W, PH = (typeof S8H !== 'undefined') ? S8H : S8W;
      const z = Math.min(W / (PW + 40), H / (PH + 40));
      const cam = { x: S8X, y: S8Y, z, e: {} }, TR = [z, 0, 0, z, W / 2 - S8X * z, H / 2 - S8Y * z];
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgb(214,208,198)'; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(...TR); drawS8Panel(t, cam, TR); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const meta = { z, W, H, S8X, S8Y, PRX: PR8, PRY: (typeof PR8Y !== 'undefined') ? PR8Y : PR8, SC8, DY8, panelW: PW, panelH: PH, RP8K: (typeof RP8K !== 'undefined') ? RP8K : null };
      return { url: document.getElementById('cv').toDataURL('image/jpeg', 0.93), meta, t };
    }, tr);
    const f = path.join(out, `s8_${tr}.jpg`);
    fs.writeFileSync(f, Buffer.from(r.url.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(out, 's8_meta.json'), JSON.stringify(r.meta, null, 1));
    console.log(`${f}  （片内时间 ${r.t.toFixed(2)}）`);
  }
  await b.close();
})();
