// ================= 预览播放器 =================
// 直接用浏览器打开 film.html 时出现；渲染脚本打开时（无头浏览器 / 地址里带 ?render）不出现，不影响出片。
(()=>{if(navigator.webdriver||/[?&]render/.test(location.search))return;
const CHAP=[[0,'壹 · 彩陶'],[23.8,'贰 · 甲骨'],[32.4,'叁 · 拓片'],[40.7,'肆 · 铜洗'],[47.8,'伍 · 磁州窑'],[54.1,'陆 · 宋画'],[71.7,'柒 · 青花'],
  [99.8,'捌 · 年画'],[106.5,'玖 · 剪纸'],[113.4,'拾 · 像素'],[132.2,'拾壹 · 代码'],[139.9,'终章']];
const st=document.createElement('style');st.textContent=`
html,body{height:100%;overflow:hidden;font:14px/1.4 system-ui,"PingFang SC","Microsoft YaHei",sans-serif;color:#e8e2d6}
#cv{position:fixed;inset:0;margin:auto;width:min(100vw,177.78vh);height:min(56.25vw,100vh)}
#pl{position:fixed;left:0;right:0;bottom:0;padding:26px 18px 12px;background:linear-gradient(transparent,rgba(0,0,0,.72));transition:opacity .3s}
#pl.hide{opacity:0}#pl .row{display:flex;align-items:center;gap:10px}
#pl input[type=range]{flex:1;accent-color:#c8402a;height:4px}
#pl button,#pl select{background:rgba(255,255,255,.1);color:inherit;border:1px solid rgba(255,255,255,.18);border-radius:6px;padding:4px 10px;font:inherit;cursor:pointer}
#pl button:hover,#pl select:hover{background:rgba(255,255,255,.2)}#pl select option{color:#000}
#pl .tm{font-variant-numeric:tabular-nums;min-width:118px;text-align:center}#pl .hint{opacity:.55;font-size:12px;margin-top:6px}
#ld{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#000;color:#bbb;letter-spacing:.1em}`;
document.head.appendChild(st);
const ld=document.createElement('div');ld.id='ld';ld.textContent='准备中……第一次打开要算几秒';document.body.appendChild(ld);
const pl=document.createElement('div');pl.id='pl';pl.innerHTML=`<div class="row">
<button id="pp" title="播放 / 暂停（空格）">▶</button><span class="tm" id="tm">00:00.0</span>
<input type="range" id="sk" min="0" max="${T_END}" step="${1/30}" value="0">
<select id="ch" title="跳到某一站（[ ] 上一站 / 下一站）">${CHAP.map(([t,n])=>`<option value="${t}">${n}</option>`).join('')}</select>
<select id="sp" title="速度"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option></select>
<button id="mu" title="静音（M）">♪</button><button id="sv" title="把这一帧存成 PNG（S）">存图</button><button id="fs" title="全屏（F）">⛶</button></div>
<div class="hint">空格 播放/暂停 · ← → 前后 1 秒（按住 Shift 5 秒）· , . 逐帧 · [ ] 跳站 · S 存图 · F 全屏 · M 静音　|　配乐读同一文件夹里的 score_full.wav，没有它就静音播放</div>`;
document.body.appendChild(pl);
const $=id=>document.getElementById(id);
const au=new Audio();au.preload='auto';let hasAu=false;au.addEventListener('canplay',()=>{hasAu=true;});au.addEventListener('error',()=>{hasAu=false;});au.src='score_full.wav';
let playing=false,t=0,t0=0,base=0,rate=1,dirty=true,ready=false;
const now=()=>{if(!playing)return t;if(hasAu&&!au.paused&&!au.ended)return au.currentTime;return t0+(performance.now()-base)/1000*rate;};
function play(){if(t>=T_END-0.05)t=0;playing=true;t0=t;base=performance.now();if(hasAu){au.currentTime=t;au.playbackRate=rate;au.play().catch(()=>{});}$('pp').textContent='❚❚';}
function pause(){t=now();playing=false;au.pause();$('pp').textContent='▶';dirty=true;}
function seek(x){t=clamp(x,0,T_END);if(playing){t0=t;base=performance.now();if(hasAu)au.currentTime=t;}dirty=true;}
const chapAt=x=>{let k=0;for(let i=0;i<CHAP.length;i++)if(x>=CHAP[i][0]-0.01)k=i;return k;};
const fmt=x=>{const m=Math.floor(x/60),s=x-60*m;return `${String(m).padStart(2,'0')}:${s.toFixed(1).padStart(4,'0')}`;};
let dragging=false;
$('pp').onclick=()=>playing?pause():play();
$('sk').addEventListener('input',e=>{dragging=true;seek(+e.target.value);});$('sk').addEventListener('change',()=>{dragging=false;});
$('ch').onchange=e=>{seek(+e.target.value);e.target.blur();};
$('sp').onchange=e=>{const tt=now();rate=+e.target.value;au.playbackRate=rate;t0=tt;base=performance.now();e.target.blur();};
$('mu').onclick=()=>{au.muted=!au.muted;$('mu').textContent=au.muted?'✕':'♪';};
$('sv').onclick=()=>{render(now());cv.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`鱼_${now().toFixed(2)}s.png`;a.click();},'image/png');};
$('fs').onclick=()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();};
addEventListener('keydown',e=>{if(!ready)return;const k=e.key;
  if(k===' '||k==='k'){e.preventDefault();playing?pause():play();}
  else if(k==='ArrowRight')seek(now()+(e.shiftKey?5:1));else if(k==='ArrowLeft')seek(now()-(e.shiftKey?5:1));
  else if(k==='.'||k==='>'){if(playing)pause();seek(t+1/30);}else if(k===','||k==='<'){if(playing)pause();seek(t-1/30);}
  else if(k===']'){const i=chapAt(now());if(i<CHAP.length-1)seek(CHAP[i+1][0]);}else if(k==='['){const x=now(),i=chapAt(x);seek(x-CHAP[i][0]>1.5?CHAP[i][0]:CHAP[Math.max(0,i-1)][0]);}
  else if(k==='Home')seek(0);else if(k==='End')seek(T_END);
  else if(k==='s'||k==='S')$('sv').click();else if(k==='f'||k==='F')$('fs').click();else if(k==='m'||k==='M')$('mu').click();
  poke();});
let idle=0;const poke=()=>{pl.classList.remove('hide');document.body.style.cursor='';clearTimeout(idle);idle=setTimeout(()=>{if(playing){pl.classList.add('hide');document.body.style.cursor='none';}},2200);};
addEventListener('mousemove',poke);
function frame(){if(ready){if(playing){t=now();if(t>=T_END){t=T_END;pause();}}
    if(playing||dirty){render(t);dirty=false;$('tm').textContent=`${fmt(t)} / ${fmt(T_END)}`;if(!dragging)$('sk').value=t;const i=chapAt(t);if($('ch').selectedIndex!==i)$('ch').selectedIndex=i;}}
  requestAnimationFrame(frame);}
window.prepare().then(()=>{ready=true;ld.remove();dirty=true;poke();});requestAnimationFrame(frame);
})();
