// 渲染：
//   node render.js stills 35 42.5 ...                出静帧 → stills/t_35.jpg ...
//   node render.js video 输出.mp4 [时长秒] [--jobs N] [--from 起始秒] [--fps 30] [--scale 1] [--crf 18] [--preset veryfast]
//        时长默认全片；--jobs 同时开几个浏览器分段渲染再拼起来（默认按 CPU 核数自动选，核多就快）
//        4K 60 帧：--scale 2 --fps 60（构图不变，像素翻倍）；--crf/--preset 是 x264 的画质和速度
//   node render.js mux 无声.mp4 score_full.wav 成片.mp4  加配乐（带母带处理）
// 需要：Node.js 18+、ffmpeg（在 PATH 里，或设置 FFMPEG=路径）、Chrome 或 Edge
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), { pathToFileURL } = require('url');
const launch = require('./browser');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const HTML = path.resolve(__dirname, process.env.SCENE || 'film.html');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const SCALE = +opt('--scale', 1), CRF = String(opt('--crf', 18)), PRESET = String(opt('--preset', 'veryfast'));

async function openPage() {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('页面出错:', e.message));
  await page.goto(pathToFileURL(HTML).href + '?render' + (SCALE !== 1 ? '&scale=' + SCALE : ''));
  await page.evaluate(() => window.prepare());
  return { browser, page };
}
const grab = (page, t) => page.evaluate(t => { window.render(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.92); }, t);
const KIDS = [];
process.on('exit', () => { for (const k of KIDS) try { k.kill(); } catch (e) {} });
const run = (cmd, args) => new Promise((ok, bad) => { const p = spawn(cmd, args, { stdio: 'inherit' }); KIDS.push(p); p.on('error', bad); p.on('close', c => c === 0 ? ok() : bad(new Error(`${cmd} 退出码 ${c}`))); });

async function encode(out, f0, f1, fps, tag, faststart) {
  // 浏览器每渲一批帧就重开一次（4K 时更勤），中途崩了就重开再试这一帧：长时间渲染不会因为内存越占越多而前功尽弃
  const RECYCLE = SCALE > 1 ? 900 : 4000;
  let s = await openPage(), since = 0;
  const reopen = async () => { try { await s.browser.close(); } catch (e) {} s = await openPage(); since = 0; };
  const ff = spawn(FFMPEG, ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-crf', CRF, '-preset', PRESET, '-pix_fmt', 'yuv420p', ...(faststart ? ['-movflags', '+faststart'] : []), out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  ff.on('error', e => { console.error('启动 ffmpeg 失败：', e.message); process.exit(1); });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    let url;
    for (let tries = 0; ; tries++) {
      try { url = await grab(s.page, f / fps); break; }
      catch (e) { if (tries >= 3) throw e; console.error(`${tag}第 ${f} 帧出错（${String(e.message).split('\n')[0]}），重开浏览器再试`); await reopen(); }
    }
    if (++since >= RECYCLE) await reopen();
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 90 === 0) { const done = f - f0, el = (Date.now() - t0) / 1000; console.log(`${tag}第 ${f}/${f1} 帧${done ? `，约 ${Math.round(el / done * (f1 - f))} 秒后完成` : ''}`); }
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  try { await s.browser.close(); } catch (e) {}
  if (code !== 0) throw new Error('ffmpeg 退出码 ' + code);
}

(async () => {
  const mode = argv.shift();
  if (mode === 'stills') {
    const { browser, page } = await openPage();
    fs.mkdirSync('stills', { recursive: true });
    for (const a of argv) { const url = await grab(page, parseFloat(a)); fs.writeFileSync(`stills/t_${a}.jpg`, Buffer.from(url.split(',')[1], 'base64')); console.log(`stills/t_${a}.jpg`); }
    await browser.close();
  } else if (mode === '__chunk') {                       // 内部用：渲一段
    const [out, fa, fb, fps, tag] = argv; await encode(out, +fa, +fb, +fps, tag + ' ', false);
  } else if (mode === 'video') {
    const fps = +opt('--fps', 30), from = +opt('--from', 0);
    const auto = Math.max(1, Math.min(8, Math.floor(os.cpus().length / 2)));
    const jobs = Math.max(1, +opt('--jobs', auto));
    const out = path.resolve(argv[0] || 'film_silent.mp4');
    const dur = argv[1] !== undefined ? parseFloat(argv[1]) : 154.0 - from;
    const F0 = Math.round(from * fps), F1 = F0 + Math.round(dur * fps);
    const t0 = Date.now();
    console.log(`渲染 ${(F1 - F0)} 帧，${jobs} 路并行 → ${out}`);
    if (jobs === 1) {
      const tmp = out.replace(/\.mp4$/i, '') + '.part.mp4';
      await encode(tmp, F0, F1, fps, '', true); fs.renameSync(tmp, out);
    } else {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fish-'));
      const n = F1 - F0, parts = [];
      for (let j = 0; j < jobs; j++) parts.push([F0 + Math.round(n * j / jobs), F0 + Math.round(n * (j + 1) / jobs), path.join(dir, `part${j}.mp4`)]);
      await Promise.all(parts.map(([a, b, p], j) => run(process.execPath, [__filename, '__chunk', p, a, b, fps, `[${j + 1}/${jobs}]`, '--scale', SCALE, '--crf', CRF, '--preset', PRESET])));
      const list = path.join(dir, 'list.txt');
      fs.writeFileSync(list, parts.map(p => `file '${p[2].replace(/\\/g, '/')}'`).join('\n'));
      await run(FFMPEG, ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out]);
      fs.rmSync(dir, { recursive: true, force: true });
    }
    console.log(`完成，用时 ${Math.round((Date.now() - t0) / 1000)} 秒`);
  } else if (mode === 'mux') {
    const [v, a, o] = argv;
    await run(FFMPEG, ['-y', '-v', 'error', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-af', 'volume=-0.5dB,alimiter=limit=0.8:level=0:attack=3:release=60', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', o || 'film_full.mp4']);
    console.log('完成 →', o || 'film_full.mp4');
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 7).join('\n'));
  }
})().catch(e => { console.error(e.message || e); process.exit(1); });
