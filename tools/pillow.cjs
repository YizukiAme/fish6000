'use strict';
const path=require('node:path'),fs=require('node:fs');
module.exports = function legacyPillow(scene) {
  const start=scene.indexOf("// ================= 伍 · 磁州窑白地黑花枕（宋金，仿） ================="), end=scene.indexOf("// ================= 陆 · 宋画 + 柒 · 元青花（沿用样片 v3，整体平移到全片的坐标和时间上） =================",start);
  if(start<0 || end<=start) throw Error('Cannot locate stage five in film.html');
  return scene.slice(0,start)+fs.readFileSync(path.join(__dirname,'pillow-legacy.js'),'utf8')+'\n'+scene.slice(end);
};
