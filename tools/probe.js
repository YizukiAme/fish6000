// 在页面里算一个表达式，打印结果。例：node tools/probe.js "heroPoseNow(46).sp[0]"
const launch = require('../browser'); const path = require('path'); const { pathToFileURL } = require('url');
(async () => {
  const b = await launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on('pageerror', e => console.error('页面出错:', e.message));
  await pg.goto(pathToFileURL(path.resolve(__dirname, '..', process.env.SCENE || 'film.html')).href + '?render');
  await pg.evaluate(() => window.prepare());
  console.log(await pg.evaluate(ex => JSON.stringify(eval(ex)), process.argv[2]));
  await b.close();
})();
