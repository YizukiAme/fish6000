// ================= 拾 · 像素（显像管，高潮） =================
// 鱼一碰到玻璃，屏幕亮了。它成了 1 位的像素鱼；每吃一颗豆，画面升一级：1 位黑白 → 4 色绿屏 → 16 色 → 256 色。
// 右上角的“分数”其实是年份。吃到最后一颗，画面撑不住了：撕裂、串色、塌缩成一个亮点——鱼从屏幕里钻了出来
const S10X=-5940,S10Y=0,S10W=600;
const SCR={x:S10X,y:-24,w:300,h:225};   // 屏幕在世界里的位置
const SBW=640,SBH=480;                   // 屏幕缓冲
const T10ON=119.0,T10UP=[122.55,125.95,129.55],T10EAT4=133.1,T10TEAR=133.25,T10OFF=134.75,T10OUT=134.9;
const YEARS=[1980,1989,1995,2003,2026];
const LV=[{rx:40,ry:30},{rx:80,ry:60},{rx:160,ry:120},{rx:320,ry:240}];
const PAL_GB=[[15,56,15],[48,98,48],[139,172,15],[155,188,15]];
const PAL_EGA=[[0,0,0],[0,0,170],[0,170,0],[0,170,170],[170,0,0],[170,0,170],[170,85,0],[170,170,170],[85,85,85],[85,85,255],[85,255,85],[85,255,255],[255,85,85],[255,85,255],[255,255,85],[255,255,255]];
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+0.5)/16-0.5);
const PELLETS=[[-5995,-35],[-5900,20],[-6004,17],[-5940,-24]];   // 每一关的终点豆（第三关的放在绕完一圈的出口）
const SB=mk(SBW,SBH),sbx=SB.getContext('2d');
const LVC=LV.map(l=>{const c=mk(l.rx,l.ry);return{c,x:c.getContext('2d',{willReadFrequently:true})};});
const toBuf=(x,y)=>[(x-(SCR.x-SCR.w/2))/SCR.w*SBW,(y-(SCR.y-SCR.h/2))/SCR.h*SBH];
function levelAt(t){let k=0;for(const tu of T10UP)if(t>=tu)k++;return k;}
function yearAt(t){const k=levelAt(t);if(t>=T10EAT4)return Math.round(lerp(2003,2026,smooth(T10EAT4,T10EAT4+0.6,t)));return YEARS[k];}
// 3×5 的点阵数字
const DIG={0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001111',L:'100100100100111',V:'101101101101010',E:'111100111100111','+':'000010111010000','!':'010010010000010'};
function pixText(c,s,x,y,px,col){c.fillStyle=col;let cx=x;for(const ch of s){const g=DIG[ch];if(!g){cx+=2*px;continue;}for(let i=0;i<15;i++)if(g[i]==='1')c.fillRect(cx+(i%3)*px,y+Math.floor(i/3)*px,px,px);cx+=4*px;}}
// 把主角画进某一级的小画布（缓冲坐标 → 小画布坐标）
function fishToBuf(p){const sc=SBW/SCR.w;const ox=SCR.x-SCR.w/2,oy=SCR.y-SCR.h/2;return{...p,L:p.L*sc,sp:p.sp.map(q=>({x:(q.x-ox)*sc,y:(q.y-oy)*sc,nx:q.nx,ny:q.ny}))};}
// ---------- 每一关是那一年的一种游戏 ----------
// 1980 吃豆：一排豆，主题的十个音一个音吃一颗（吃豆的“咔”就是旋律）  1989 横版：背景跟着鱼往后卷，一路吃金币
// 1995 躲钩子：鱼钩垂下来，鱼一惊、扭开，钩子空提上去                   2003 大鱼吃小鱼：吃一条长大一点
// 豆、金币、小鱼都按鱼原来的路线摆：鱼在哪一拍游到哪，东西就放在哪——鱼的路线一点没改
const MUS10=[[T10ON+0.45,T10UP[0]],[T10UP[0]+0.25,T10UP[1]],[T10UP[1]+0.25,T10UP[2]],[T10UP[2]+0.25,T10EAT4]];   // 每一关芯片音乐的起止（和 score_full.py 的 chip_level 一致）
const cellT=(k,c)=>MUS10[k][0]+c*(MUS10[k][1]-MUS10[k][0])/16;                                                    // 第 k 关第 c 格（一小节 16 格）
const HOOK10={x:-5836,yTop:-150,y0:-50,tIn:[126.42,126.8],tAlert:126.8,tStrike:127.26,tUp:0.2};
const head10=t=>{const p=heroPoseNow(t);return[p.sp[0].x,p.sp[0].y];};
let EV10C=null,SC2X0=0;
function scroll2(t){return -1.7*(head10(t)[0]-SC2X0);}                                                                  // 1989：背景卷动的量（世界坐标）
function EV10(){if(EV10C)return EV10C;SC2X0=head10(T10UP[0])[0];const E={dots:[],coins:[],minnows:[],pts:[]};
  for(const c of [0,2,4,5,6,8,9,10,12,14]){const te=cellT(0,c);const w=head10(te);E.dots.push({te,w});E.pts.push({te,n:10,w,k:0});}
  E.pts.push({te:T10UP[0],n:50,w:head10(T10UP[0]),k:0});
  for(let c=2;c<=14;c+=2){const te=cellT(1,c);const w=head10(te);E.coins.push({k:1,te,w,sc:scroll2(te)});E.pts.push({te,n:100,w,k:1});}
  E.pts.push({te:T10UP[1],n:500,w:head10(T10UP[1]),k:1});
  E.pts.push({te:HOOK10.tStrike+0.12,n:500,w:[HOOK10.x-10,HOOK10.y0+6],k:2});
  for(const c of [8,10,12,14]){const te=cellT(2,c);const w=head10(te);E.coins.push({k:2,te,w,sc:0});E.pts.push({te,n:100,w,k:2});}
  E.pts.push({te:T10UP[2],n:500,w:head10(T10UP[2]),k:2});
  for(const c of [4,8,12]){const te=cellT(3,c);const a=head10(te),b=head10(te-0.12);const dx=a[0]-b[0],dy=a[1]-b[1],l=Math.hypot(dx,dy)||1;E.minnows.push({te,w:a,d:[dx/l,dy/l],v:0.4*l/0.12});E.pts.push({te,n:200,w:a,k:3});}
  E.pts.push({te:T10EAT4,n:5000,w:head10(T10EAT4),k:3});
  EV10C=E;return E;}
function score10(t){let s=0;for(const e of EV10().pts)if(t>=e.te)s+=e.n*Math.min(1,(t-e.te)/0.3);return Math.round(s);}
function hookY(t){const H=HOOK10;if(t<H.tIn[0])return H.yTop;if(t<H.tStrike){const q=clamp((t-H.tIn[0])/(H.tIn[1]-H.tIn[0]));return lerp(H.yTop,H.y0,1-Math.pow(1-q,3))+1.5*Math.sin((t-H.tIn[0])*7);}
  const q=clamp((t-H.tStrike)/H.tUp);return lerp(H.y0,H.yTop-40,q*q);}
// 鱼一惊：往钩子的反方向一缩（整条鱼平移，不碰路线），尾巴乱摆一下
HAMP.push(t=>(1-0.5*smooth(126.35,126.7,t)*(1-smooth(127.12,127.2,t)))*(1+0.6*smooth(127.15,127.25,t)*(1-smooth(127.6,127.95,t))));   // 1995：凑近饵时屏住，逃的时候尾巴猛摆
HFB.push(t=>1.6*smooth(127.15,127.25,t)*(1-smooth(127.55,127.9,t)));
{const B=[130.625,131.45,132.275,133.1];HAMP.push(t=>{let a=1;for(const b of B)a+=0.55*Math.exp(-(((t-b+0.06)/0.12)**2));return a*(1-0.35*smooth(132.5,132.8,t)*(1-smooth(132.98,133.06,t)));});   // 2003：每一扑尾巴猛甩；盯住大豆子那一下屏住
  HFB.push(t=>{let a=0;for(const b of B)a+=1.2*Math.exp(-(((t-b+0.08)/0.13)**2));return a;});}
// 游出显像管以后尾巴稍微摆快一点，把这一站多游的那段路、多摆的那些下补齐到整圈：后面代码站和终章里鱼的姿态和原来一模一样（PHASE10 是量出来的）
const PHASE10=0.2935;HFB.push(t=>PHASE10*smooth(135.3,135.7,t)*(1-smooth(136.2,136.6,t)));
function gameLayer(k,t,c,p,ta){const E=EV10();
  if(k===0){c.fillStyle='#fff';for(const [x,y,w,h] of [[16,64,608,16],[16,448,608,16],[16,64,16,400],[608,64,16,400],[96,128,160,16],[96,128,16,64],[384,384,176,16],[544,336,16,64]])c.fillRect(x,y,w,h);   // 迷宫的墙
    for(const d of E.dots){if(t>=d.te)continue;const [x,y]=toBuf(...d.w);c.fillRect(Math.floor(x/16)*16,Math.floor(y/16)*16,16,16);}}
  if(k===1||k===2){const sc=k===1&&p?scroll2(t):0;for(const o of E.coins){if(o.k!==k||t>=o.te)continue;const [x,y]=toBuf(o.w[0]+(sc-o.sc),o.w[1]);const sp=Math.abs(Math.cos(ta*5+o.te*3));
      if(k===1){c.fillStyle='#0f380f';c.beginPath();c.ellipse(x,y,20*sp+4,20,0,0,7);c.fill();c.fillStyle='#9bbc0f';c.beginPath();c.ellipse(x,y,9*sp+2,9,0,0,7);c.fill();}
      else{c.fillStyle='#ffd040';c.beginPath();c.ellipse(x,y,11*sp+2,11,0,0,7);c.fill();c.fillStyle='#fff8b0';c.fillRect(x-2*sp,y-7,3*sp+1,6);}}}
  if(k===2){const hy=hookY(t);if(hy>HOOK10.yTop-35){const [bx,by]=toBuf(HOOK10.x+2*Math.sin(ta*2.2),hy);c.strokeStyle='#e8e8e8';c.lineWidth=4;c.beginPath();c.moveTo(bx,-4);c.lineTo(bx,by);c.stroke();
      c.strokeStyle='#b8b8c8';c.lineWidth=5;c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by+22);c.arc(bx-10,by+22,10,0,Math.PI);c.lineTo(bx-20,by+12);c.stroke();
      if(t<HOOK10.tStrike+0.05){c.fillStyle='#ff6aa0';for(let i=0;i<4;i++){c.beginPath();c.arc(bx-6-4*Math.sin(ta*9+i),by+26+i*7,6,0,7);c.fill();}}}}
  if(k===3){for(const m of E.minnows){if(t>=m.te)continue;const dt=t-m.te;const nx=-m.d[1],ny=m.d[0];const wob=3*Math.sin(ta*6+m.te*5);
      const [x,y]=toBuf(m.w[0]+m.d[0]*m.v*dt+nx*wob,m.w[1]+m.d[1]*m.v*dt+ny*wob);const a=Math.atan2(m.d[1],m.d[0]);c.save();c.translate(x,y);c.rotate(a);c.scale(1.7,1.7);
      c.fillStyle='#4f86b8';c.beginPath();c.moveTo(-14,0);c.lineTo(-30,-11+3*Math.sin(ta*14+m.te));c.lineTo(-30,11+3*Math.sin(ta*14+m.te));c.closePath();c.fill();
      c.fillStyle='#bfe2f6';c.beginPath();c.ellipse(0,0,18,9,0,0,7);c.fill();c.fillStyle='#5a8cb8';c.beginPath();c.ellipse(-1,-3,16,5,0,Math.PI,0);c.fill();
      c.fillStyle='#10202c';c.beginPath();c.arc(10,-2,2.4,0,7);c.fill();c.restore();}}}
// 屏幕上的计分板：分数、命、吃到东西的“+10”、升级时的大字卡、看见钩子时的“！”
function fishIcon(c,x,y,px,col){c.fillStyle=col;const R=['.###.#','#.####','.###.#'];R.forEach((r,j)=>{for(let i=0;i<6;i++)if(r[i]==='#')c.fillRect(x+i*px,y+j*px,px,px);});}
function hud10(t,k,p){const px=[8,8,4,3][k],col=k===1?'#0f380f':'#fff';
  pixText(sbx,String(yearAt(t)),SBW-18*px,px*3,px,col);pixText(sbx,'LV'+(k+1),px*3,px*3,px,col);
  const sc=String(score10(t)).padStart(6,'0');pixText(sbx,sc,SBW/2-12*px,px*3,px,col);
  const ip=Math.max(2,Math.round(px*0.45));for(let i=0;i<3;i++)fishIcon(sbx,px*3+12*px+px*1.5+i*7*ip,px*3+px*1.2,ip,col);   /* 命：三条小鱼，跟在 LV 后面 */
  for(const e of EV10().pts){const dt=t-e.te;if(dt<0||dt>0.7||e.k!==k)continue;if(dt>0.45&&Math.floor(dt*16)%2)continue;const [x,y]=toBuf(...e.w);const fp=[6,5,4,3][k];
    pixText(sbx,'+'+e.n,x-((String(e.n).length+1)*4*fp)/2,y-34-60*dt,fp,k===1?'#0f380f':k===2?'#ffff55':'#fff');}
  if(k===2&&p&&t>=HOOK10.tAlert&&t<HOOK10.tStrike+0.12&&Math.floor((t-HOOK10.tAlert)*12)%2===0){const [x,y]=toBuf(p.sp[0].x,p.sp[0].y);pixText(sbx,'!',x-10,y-90,7,'#ffff55');}
  if(k>0){const dt=t-T10UP[k-1]-0.3;if(dt>=0&&dt<0.6&&(dt<0.35||Math.floor(dt*10)%2===0)){const fp=[0,12,10,9][k],txt='LEVEL '+(k+1),w=(txt.length*4-1)*fp;
    sbx.fillStyle=k===1?'rgba(155,188,15,0.92)':'rgba(0,0,0,0.6)';sbx.fillRect(SBW/2-w/2-fp*2,SBH*0.42-fp*2,w+fp*4,fp*9);pixText(sbx,txt,SBW/2-w/2,SBH*0.42,fp,k===1?'#0f380f':k===2?'#ffff55':'#fff');}}}
// 升级、吃大豆子的那一下：镜头往前一顿
CAMHOOK.push(r=>{const t=W5(r);let b=0;for(const tu of [...T10UP,T10EAT4])if(t>=tu)b=Math.max(b,Math.exp(-(t-tu)*9));return[0,0,1+0.03*b];});
function drawLevelScene(k,t,c,p){const l=LV[k],ta=t-T10ON+115;/* ta：屏里动画用的钟（水草、气泡、豆子的闪） */c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,l.rx,l.ry);c.setTransform(l.rx/SBW,0,0,l.rx/SBW,0,0);
  // 背景
  if(k===0){c.fillStyle='#000';c.fillRect(0,0,SBW,SBH);}
  else if(k===1){const off=(p?scroll2(t):0)*SBW/SCR.w;const wr=(x,P)=>((x%P)+P)%P;c.fillStyle='#9bbc0f';c.fillRect(0,0,SBW,SBH);c.fillStyle='#8bac0f';for(let i=0;i<6;i++){c.fillRect(0,330+i*26,SBW,10);}
    for(let i=0;i<8;i++){const bx=wr(i*97+30+off*0.4,720)-40,by=60+((i*71)%220);c.fillRect(bx,by,10,10);}          /* 远处的气泡：卷得慢 */
    c.fillStyle='#306230';for(let i=0;i<5;i++){const rx=wr(i*190+20+off,950)-120;for(let j=0;j<4;j++)c.fillRect(rx+j*14,480-24-j*12,96-j*28,24+j*12);}   /* 礁石 */
    for(let i=0;i<6;i++){const sx=wr(i*131+70+off,786)-80;for(let j=0;j<6;j++)c.fillRect(sx+12*Math.sin(j*0.9+ta*1.5+i),480-j*28,14,26);}}
  else if(k===2){const g=c.createLinearGradient(0,0,0,SBH);g.addColorStop(0,'#2a6ad8');g.addColorStop(1,'#0a1a60');c.fillStyle=g;c.fillRect(0,0,SBW,SBH);c.fillStyle='#c09040';c.fillRect(0,430,SBW,50);
    c.fillStyle='#20a040';for(const sx of [60,110,540,590]){for(let j=0;j<7;j++)c.fillRect(sx+16*Math.sin(j*0.8+ta*1.4),430-j*30,18,30);}
    c.fillStyle='#a0e0ff';for(let i=0;i<10;i++){const bx=(i*97+40)%SBW,by=SBH-((ta*60+i*53)%SBH);c.fillRect(bx,by,8,8);}}
  else{const g=c.createLinearGradient(0,0,0,SBH);g.addColorStop(0,'#3aa0e8');g.addColorStop(0.55,'#145aa8');g.addColorStop(1,'#06204c');c.fillStyle=g;c.fillRect(0,0,SBW,SBH);
    c.globalAlpha=0.18;c.fillStyle='#fff';for(let i=0;i<5;i++){c.beginPath();const x0=80+i*120+30*Math.sin(ta*0.5+i);c.moveTo(x0,0);c.lineTo(x0+40,0);c.lineTo(x0-60,SBH);c.lineTo(x0-120,SBH);c.closePath();c.fill();}c.globalAlpha=1;
    const sg=c.createLinearGradient(0,420,0,SBH);sg.addColorStop(0,'#d8b070');sg.addColorStop(1,'#806030');c.fillStyle=sg;c.fillRect(0,420,SBW,60);
    for(const [sx,h,ph] of [[50,200,0],[100,150,1],[560,220,2],[610,160,3]]){c.strokeStyle='#1e8c46';c.lineWidth=12;c.beginPath();c.moveTo(sx,450);for(let j=1;j<=10;j++)c.lineTo(sx+20*Math.sin(j*0.6+ta*1.3+ph),450-j*h/10);c.stroke();}
    c.fillStyle='rgba(220,240,255,0.7)';for(let i=0;i<14;i++){const bx=(i*83+20)%SBW+6*Math.sin(ta*2+i),by=SBH-((ta*70+i*41)%SBH);c.beginPath();c.arc(bx,by,4+i%3*2,0,7);c.fill();}}
  // 豆
  gameLayer(k,t,c,p,ta);
  for(let i=k;i<=k;i++){if(i===3&&t>=T10EAT4)continue;const [px,py]=toBuf(PELLETS[i][0]+(k===1&&p?scroll2(t)-scroll2(T10UP[1]):0),PELLETS[i][1]);const big=i===3;const pul=1+0.15*Math.sin(ta*8);const r=(big?16:7)*pul;
    if(k===0){c.fillStyle='#fff';c.fillRect(px-r,py-r,2*r,2*r);}
    else if(k===1){c.fillStyle='#0f380f';c.fillRect(px-r,py-r,2*r,2*r);}
    else{c.fillStyle=big?'#ffe060':'#fff060';c.beginPath();c.arc(px,py,r,0,7);c.fill();if(k===3){c.fillStyle='rgba(255,255,255,0.8)';c.beginPath();c.arc(px-r*0.3,py-r*0.3,r*0.35,0,7);c.fill();}}}
  // 鱼
  if(p){const b=fishToBuf(p);
    if(k<=1){yuanSil(c,b,k===0?'#fff':'#0f380f');if(k===1){c.fillStyle='#306230';c.save();bodyFill(c,edges(b,PROF.yuan));c.clip();const s=spineAt(b,0.5);c.fillRect(0,0,SBW,SBH);c.restore();
        c.save();bodyFill(c,edges(b,PROF.yuan));c.clip();c.fillStyle='#8bac0f';const e=edges(b,PROF.yuan);c.beginPath();e.bot.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=e.M;i>=0;i--){const s=spineAt(b,i/e.M*0.8);c.lineTo(s.x,s.y);}c.closePath();c.fill();c.restore();}
      const ey=bodyAt(b,PROF.yuan,0.09,0.3);c.fillStyle=k===0?'#000':'#9bbc0f';c.beginPath();c.arc(ey[0],ey[1],b.L*0.035,0,7);c.fill();}
    else{for(const blk of ['yellow','red']){c.fillStyle=blk==='yellow'?'#f0c030':'#e03020';nianFishParts(c,b,blk);}c.fillStyle='#200808';c.strokeStyle='#200808';nianFishParts(c,b,'line');}}
  // 量化到这一级的调色板
  const img=c.getImageData(0,0,l.rx,l.ry),d=img.data;
  for(let i=0;i<d.length;i+=4){const pi=i/4,xx=pi%l.rx,yy=(pi/l.rx)|0;const bay=BAYER4[(yy%4)*4+(xx%4)];let r=d[i],g=d[i+1],bl=d[i+2];
    if(k===0){const v=(r*0.3+g*0.59+bl*0.11)>127?255:0;d[i]=d[i+1]=d[i+2]=v;}
    else if(k===1){const lum=(r*0.3+g*0.59+bl*0.11)/255;const q=clamp(Math.round(lum*3+bay*0.6),0,3);[d[i],d[i+1],d[i+2]]=PAL_GB[q];}
    else if(k===2){r+=bay*80;g+=bay*80;bl+=bay*80;let best=0,bd=1e9;for(let j=0;j<16;j++){const P=PAL_EGA[j];const dd=(r-P[0])**2+(g-P[1])**2+(bl-P[2])**2;if(dd<bd){bd=dd;best=j;}}[d[i],d[i+1],d[i+2]]=PAL_EGA[best];}
    else{d[i]=clamp(Math.round((r+bay*36)/36.4)*36.4,0,255);d[i+1]=clamp(Math.round((g+bay*36)/36.4)*36.4,0,255);d[i+2]=clamp(Math.round((bl+bay*80)/85)*85,0,255);}d[i+3]=255;}
  c.putImageData(img,0,0);}
// 屏幕缓冲：按当前关卡出图；升级时一道扫描线从上往下刷新
function renderScreen(t,p){const k=levelAt(t);sbx.setTransform(1,0,0,1,0,0);sbx.imageSmoothingEnabled=false;
  drawLevelScene(k,t,LVC[k].x,p);sbx.drawImage(LVC[k].c,0,0,SBW,SBH);
  const tu=T10UP[k-1];if(k>0&&t<tu+0.35){const q=(t-tu)/0.35;drawLevelScene(k-1,t,LVC[k-1].x,p);const yy=Math.floor(q*SBH);sbx.drawImage(LVC[k-1].c,0,yy*LV[k-1].ry/SBH,LV[k-1].rx,LV[k-1].ry*(1-q),0,yy,SBW,SBH-yy);sbx.fillStyle='rgba(255,255,255,0.85)';sbx.fillRect(0,yy-3,SBW,6);}
  hud10(t,k,p);
  const fl=Math.max(...T10UP.map(tu=>Math.exp(-Math.max(0,t-tu)*14)*(t>=tu?1:0)));if(fl>0.02){sbx.fillStyle=`rgba(255,255,255,${0.5*fl})`;sbx.fillRect(0,0,SBW,SBH);}}
// ---------- 显像管：外壳、玻璃、扫描线、开机与塌缩 ----------
const SCRC=mk(W,H),scx=SCRC.getContext('2d');
function crtHousing(c){const x0=SCR.x-SCR.w/2-38,y0=SCR.y-SCR.h/2-34,w=SCR.w+76,h=SCR.h+100;
  let g=c.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'#d9d2c0');g.addColorStop(1,'#b5ad98');c.fillStyle=g;c.beginPath();c.roundRect(x0,y0,w,h,18);c.fill();
  c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=1.5;c.beginPath();c.roundRect(x0+1.5,y0+1.5,w-3,h-3,17);c.stroke();
  g=c.createLinearGradient(0,SCR.y-SCR.h/2-16,0,SCR.y+SCR.h/2+16);g.addColorStop(0,'#3c3a36');g.addColorStop(1,'#56524a');c.fillStyle=g;c.beginPath();c.roundRect(SCR.x-SCR.w/2-16,SCR.y-SCR.h/2-16,SCR.w+32,SCR.h+32,14);c.fill();
  c.fillStyle='rgba(60,56,48,0.5)';for(let i=0;i<9;i++)c.fillRect(x0+w-120+i*11,y0+h-34,6,18);
  c.fillStyle='#8a8370';c.beginPath();c.arc(x0+40,y0+h-26,8,0,7);c.fill();c.fillStyle='rgba(255,255,255,0.35)';c.beginPath();c.arc(x0+38,y0+h-28,3,0,7);c.fill();}
function crtGlass(c){c.beginPath();c.roundRect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h,16);}
function drawS10Panel(t,cam,TR){const x0=S10X-S10W/2,y0=S10Y-S10W/2,z=cam.z;panelShadow(x0,y0,S10W,S10W);
  const on=smooth(T10ON,T10ON+0.08,t),off=t>=T10OFF;
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S10W,S10W);ctx.clip();
  const bg=ctx.createRadialGradient(S10X,-20,40,S10X,0,520);bg.addColorStop(0,'#2a2c33');bg.addColorStop(1,'#111216');ctx.fillStyle=bg;ctx.fillRect(x0,y0,S10W,S10W);
  // 屏幕的光照在周围
  if(on>0&&!off){const k=levelAt(t);const col=[[200,220,255],[150,200,90],[120,160,255],[110,180,255]][k];ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(SCR.x,SCR.y,60,SCR.x,SCR.y,360);g.addColorStop(0,`rgba(${col},${0.22*on})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x0,y0,S10W,S10W);ctx.restore();}
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=24*z;ctx.shadowOffsetY=10*z;crtHousing(ctx);ctx.restore();crtHousing(ctx);
  ctx.restore();
  // 屏幕内容
  const p=(t>=T10ON+0.35&&t<T10OUT)?heroPoseNow(t):null;
  ctx.save();crtGlass(ctx);ctx.clip();ctx.fillStyle='#14171a';ctx.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
  if(t>=T10ON&&t<T10OFF+0.5){
    if(t<T10OFF){renderScreen(t,p);
      // 开机：先是一道横线，再撑开
      const op=smooth(T10ON,T10ON+0.32,t);const hh=Math.max(0.012,op);
      layerBegin(scx,TR);scx.imageSmoothingEnabled=false;
      // 撕裂：横向错位的条带
      const tear=smooth(T10TEAR,T10OFF,t);
      if(tear>0){const r=rng(Math.floor((t-T10ON+115)*24));const n=10;for(let i=0;i<n;i++){const y0s=i/n*SBH,hs=SBH/n;const dx=(r()-.5)*90*tear*(r()<0.6?1:0);scx.drawImage(SB,0,y0s,SBW,hs,SCR.x-SCR.w/2+dx*SCR.w/SBW,SCR.y-SCR.h/2+y0s*SCR.h/SBH*hh+SCR.h*(1-hh)/2,SCR.w,hs*SCR.h/SBH*hh);}
        scx.globalCompositeOperation='lighter';scx.globalAlpha=0.5*tear;scx.filter='hue-rotate(90deg)';scx.drawImage(SB,SCR.x-SCR.w/2-6*tear,SCR.y-SCR.h/2,SCR.w,SCR.h);scx.filter='hue-rotate(-90deg)';scx.drawImage(SB,SCR.x-SCR.w/2+6*tear,SCR.y-SCR.h/2,SCR.w,SCR.h);scx.filter='none';scx.globalAlpha=1;scx.globalCompositeOperation='source-over';
        const r2=rng(Math.floor((t-T10ON+115)*30)+7);for(let i=0;i<40*tear;i++){scx.fillStyle=`rgba(255,255,255,${r2()*0.6})`;scx.fillRect(SCR.x-SCR.w/2+r2()*SCR.w,SCR.y-SCR.h/2+r2()*SCR.h,r2()*30,1+r2()*2);}}
      else scx.drawImage(SB,SCR.x-SCR.w/2,SCR.y-SCR.h/2+SCR.h*(1-hh)/2,SCR.w,SCR.h*hh);
      if(op<1){scx.fillStyle=`rgba(255,255,255,${0.9*(1-op)})`;scx.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h*hh/2-1,SCR.w,SCR.h*hh+2);}
      // 扫描线与荧光点
      scx.globalCompositeOperation='multiply';scx.fillStyle='rgba(0,0,0,0.28)';for(let y=SCR.y-SCR.h/2;y<SCR.y+SCR.h/2;y+=SCR.h/SBH*2)scx.fillRect(SCR.x-SCR.w/2,y,SCR.w,SCR.h/SBH);scx.globalCompositeOperation='source-over';
      blitLayer(SCRC,1);blitLayer(SCRC,0.45,'lighter',`blur(${(3*z).toFixed(1)}px)`);}
    else{// 关机：塌成一条线，再缩成一个亮点
      const q=(t-T10OFF)/0.5;const lw=SCR.w*Math.max(0.01,1-q*1.6),lh=Math.max(0.6,SCR.h*0.02*(1-q));ctx.fillStyle=`rgba(255,255,255,${1-q*0.6})`;ctx.fillRect(SCR.x-lw/2,SCR.y-lh/2,lw,lh);
      const g=ctx.createRadialGradient(SCR.x,SCR.y,0,SCR.x,SCR.y,30*(1-q)+2);g.addColorStop(0,`rgba(220,240,255,${1-q})`);g.addColorStop(1,'rgba(220,240,255,0)');ctx.fillStyle=g;ctx.fillRect(SCR.x-40,SCR.y-40,80,80);}}
  // 玻璃：鼓起来的弧面、反光、暗角
  let g=ctx.createRadialGradient(SCR.x,SCR.y,SCR.w*0.25,SCR.x,SCR.y,SCR.w*0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.55)');ctx.fillStyle=g;ctx.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
  g=ctx.createLinearGradient(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.x,SCR.y);g.addColorStop(0,'rgba(255,255,255,0.16)');g.addColorStop(0.5,'rgba(255,255,255,0.03)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
  ctx.restore();
  // 电源灯
  ctx.fillStyle=on>0&&!off?'rgba(80,255,120,0.95)':'rgba(40,60,40,0.9)';ctx.beginPath();ctx.arc(SCR.x+SCR.w/2+12,SCR.y+SCR.h/2+44,3.2,0,7);ctx.fill();
  ctx.strokeStyle='rgba(30,26,22,0.5)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S10W,S10W);}
// ---------- 墙上的样子：进屏前是马赛克，出屏后是串色的信号 ----------
const MOS=mk(240,135),mosx=MOS.getContext('2d');
function styleMosaic(t,cam,TR,p,clip){// 以世界坐标 6 个单位为一格
  const cell=6;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}x0=Math.floor((x0-p.L*0.4)/cell)*cell;y0=Math.floor((y0-p.L*0.4)/cell)*cell;
  const gw=Math.min(240,Math.ceil((x1-x0+p.L*0.8)/cell)),gh=Math.min(135,Math.ceil((y1-y0+p.L*0.8)/cell));mosx.setTransform(1,0,0,1,0,0);mosx.clearRect(0,0,240,135);mosx.setTransform(1/cell,0,0,1/cell,-x0/cell,-y0/cell);mosx.fillStyle=RED9;paperSil(mosx,p);
  const img=mosx.getImageData(0,0,gw,gh);const d=img.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>110?255:0;mosx.putImageData(img,0,0);
  ctx.save();ctx.setTransform(...TR);if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.imageSmoothingEnabled=false;ctx.shadowColor='rgba(0,0,0,0.3)';ctx.shadowBlur=6*cam.z;ctx.shadowOffsetY=6*cam.z;ctx.drawImage(MOS,0,0,gw,gh,x0,y0,gw*cell,gh*cell);ctx.restore();}
function styleSignal(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}for(const blk of ['yellow','red']){hctx.fillStyle=blk==='yellow'?'#f0c030':'#e03020';nianFishParts(hctx,p,blk);}hctx.fillStyle='#200808';hctx.strokeStyle='#200808';nianFishParts(hctx,p,'line');
  const z=cam.z;const amp=lerp(7,2.5,smooth(T10OUT,T10OUT+2.5,t));ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.5;ctx.filter='hue-rotate(150deg)';ctx.drawImage(HEROC,-amp*z,0);ctx.filter='hue-rotate(-150deg)';ctx.drawImage(HEROC,amp*z,0);ctx.restore();
  const r=rng(Math.floor((t-T10ON+115)*20));ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<6;i++){const y=r()*H,h=4+r()*14;ctx.drawImage(HEROC,0,y,W,h,(r()-.5)*24*z*(amp/7),y,W,h);}ctx.restore();blitLayer(HEROC,0.9);}
const SCR_PATH=c=>c.rect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
function style10(t,cam,TR,p,clip){if(t<T10ON)stylePaper(t,cam,TR,p,clip);else if(t>=T10OUT)styleSignal(t,cam,TR,p,clip);}

// ---------------- 拾 的登记 ----------------
STN.push({key:'s10',cx:S10X,hw:S10W/2,x0:-6320,x1:-5560,draw:drawS10Panel,owns:t=>t>=T10ON&&t<T10OUT,drawHero:(t,cam,TR,p)=>{if(t<T10ON+0.3){const q=smooth(T10ON,T10ON+0.28,t);const s=1-0.95*q;const c0=spineAt(p,0.1);const p2={...p,L:p.L*s,sp:p.sp.map(o=>({...o,x:c0.x+(o.x-c0.x)*s,y:c0.y+(o.y-c0.y)*s}))};splitStyle(t,cam,TR,p2,null,SCR_PATH,Infinity,stylePaper,styleMosaic);}},style:style10});
LABELS.push([S10X,S10W,S10W,'拾','游','电子游戏 · 像素']);
LIGHTS.push({x:S10X,y:-10,r:820,k:t=>smooth(116.8,118.8,t)});
GK.push([118.6,-5700,-10],[119,-5790,-20],[119.4,-5830,-22],[120.3,-5880,10],[121,-5930,20],[121.8,-5970,-5],[122.5,...PELLETS[0]],
  [123.2,-6030,-60],[123.9,-6050,-20],[124.6,-6020,30],[125.2,-5960,45],[125.9,...PELLETS[1]],
  // 1995：凑到饵跟前、一动不动；“！”——钩子一提，鱼猛地一折身（鱼受惊时真是这么逃的），冲出去，绕一个整圈把一圈金币吃掉，扑向豆子
  [126.1,-5882,2],[126.3,-5866,-16],[126.55,-5857,-29],[126.8,-5852,-34],[127.0,-5850,-35],[127.14,-5848,-34],
  [127.22,-5845,-29],[127.3,-5849,-19],[127.38,-5862,-11],[127.47,-5886,-5],[127.6,-5928,10],[127.73,-5968,22],[127.875,-6010,27],
  [128.08,-6042,14],[128.29,-6055,-20],[128.5,-6042,-52],[128.71,-6010,-65],[128.92,-5978,-52],[129.13,-5965,-20],[129.32,-5978,6],[129.5,...PELLETS[2]],
  // 2003：一条一条地追：先慢慢靠近，猛一扑，咬到了往前滑一下，急转去追下一条；最后绕回来，盯住大豆子，一口吞下
  [129.7,-6031,12],[129.9,-6049,-8],[130.08,-6046,-32],[130.25,-6026,-44],[130.42,-6009,-39],[130.625,-5955,-12],[130.85,-5935,-2],[131.1,-5916,9],[131.3,-5902,20],
  [131.45,-5856,39],[131.62,-5838,37],[131.85,-5828,15],[132.05,-5843,-3],[132.275,-5888,-36],[132.45,-5906,-44],[132.75,-5915,-40],[132.95,-5924,-33],[T10EAT4,-5938,-24],[133.6,-5946,-26],[134.2,-5960,-26],[T10OUT,-6000,-24],[135.3,-6080,-20],[135.8,-6180,-12],[136.3,-6262,-6],[136.8,-6330,0]);
HL.push([118.0,150],[119.0,150],[119.35,90],[130.6,90],[130.8,97],[131.43,97],[131.63,104],[132.25,104],[132.45,111],[133.1,111],[134.6,150],[135.2,140]);   // 2003：吃一条小鱼长大一点
HAMP.push(t=>1+0.8*smooth(T10EAT4,T10EAT4+0.2,t)*(1-smooth(T10OUT+0.6,T10OUT+1.6,t)));
HFB.push(t=>2.5*smooth(T10EAT4,T10EAT4+0.2,t)*(1-smooth(T10OUT+0.6,T10OUT+1.6,t)));
for(const tu of T10UP)SHAKES.push([tu,3]);SHAKES.push([T10OFF,9],[T10EAT4,4]);
CK.push({t:117.8,z:1.2,f:1,ox:-150,oy:-10},{t:118.8,x:S10X+30,y:-20,z:1.7},{t:119.6,x:SCR.x,y:SCR.y,z:4.7},{t:132.9,x:SCR.x,y:SCR.y,z:4.75},{t:133.8,x:SCR.x,y:SCR.y+4,z:3.6},{t:T10OUT,x:SCR.x-10,y:SCR.y+10,z:2.3},{t:135.6,x:S10X-120,y:0,z:1.6,f:0.4,ox:-80},{t:136.8,z:1.2,f:1,ox:-150,oy:-10});
