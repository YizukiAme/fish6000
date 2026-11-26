// Run inside the delivered source project after python3 build.py.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const master = fs.readFileSync(path.join(root, 'film.html'), 'utf8');
const sourceView = require('./codefish.cjs');
const layouts = require('./finale-layouts.json');
for (const view of ['spine','sections']) {
  fs.writeFileSync(path.join(root,'film-'+view+'.html'),sourceView(master,view));
}
const anchor='const FISH_SLOTS='+JSON.stringify(layouts.balanced)+';';
if (master.split(anchor).length!==2) throw Error('Cannot find the main arrangement in film.html');
const alternate=master.replace(anchor,'const FISH_SLOTS='+JSON.stringify(layouts.chronological)+';');
fs.writeFileSync(path.join(root,'film-chronological.html'),alternate);
for (const name of ['pillow','blue-rim']) {
  const file = path.join(__dirname,name+'.cjs');
  if (fs.existsSync(file)) {
    fs.writeFileSync(path.join(root,'film-'+name+'.html'),require(file)(master));
  }
}
