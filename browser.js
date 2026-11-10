// 找一个能用的 Chrome / Edge 来渲染（Windows / macOS / Linux 都行）
// 找不到的话：设置环境变量 CHROME=浏览器程序的完整路径
const { chromium } = require('playwright-core');
const fs = require('fs');
module.exports = async function launch() {
  const args = ['--no-sandbox', '--force-device-scale-factor=1'];
  const tries = [];
  if (process.env.CHROME) tries.push({ executablePath: process.env.CHROME });
  for (const p of ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'])
    if (fs.existsSync(p)) tries.push({ executablePath: p });
  tries.push({ channel: 'chrome' }, { channel: 'msedge' });
  let last;
  for (const o of tries) { try { return await chromium.launch({ ...o, args }); } catch (e) { last = e; } }
  throw new Error('找不到 Chrome / Edge。请安装 Chrome，或设置环境变量 CHROME=浏览器路径。\n' + (last && last.message));
};
