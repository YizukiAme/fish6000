// ================= 拾 · 像素（显像管，高潮） =================
// 鱼一碰到玻璃，屏幕亮了。它成了 1 位的像素鱼；每吃一颗豆，画面升一级：1 位黑白 → 4 色绿屏 → 16 色 → 256 色。
// 右上角的“分数”其实是年份。吃到最后一颗，画面撑不住了：撕裂、串色、塌缩成一个亮点——鱼从屏幕里钻了出来
const S10X=-5940,S10Y=0,S10W=600;
const SCR={x:S10X,y:-24,w:300,h:225};   // 屏幕在世界里的位置
const SBW=640,SBH=480;                   // 屏幕缓冲
const T10ON=115.0,T10UP=[118.55,121.95,125.55],T10EAT4=129.1,T10TEAR=129.25,T10OFF=130.75,T10OUT=130.9;
const YEARS=[1980,1989,1995,2003,2026];
const LV=[{rx:40,ry:30},{rx:80,ry:60},{rx:160,ry:120},{rx:320,ry:240}];
const PAL_GB=[[15,56,15],[48,98,48],[139,172,15],[155,188,15]];
const PAL_EGA=[[0,0,0],[0,0,170],[0,170,0],[0,170,170],[170,0,0],[170,0,170],[170,85,0],[170,170,170],[85,85,85],[85,85,255],[85,255,85],[85,255,255],[255,85,85],[255,85,255],[255,255,85],[255,255,255]];
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+0.5)/16-0.5);
const PELLETS=[[-5995,-35],[-5900,20],[-6030,-10],[-5940,-24]];
const SB=mk(SBW,SBH),sbx=SB.getContext('2d');
const LVC=LV.map(l=>{const c=mk(l.rx,l.ry);return{c,x:c.getContext('2d',{willReadFrequently:true})};});
const toBuf=(x,y)=>[(x-(SCR.x-SCR.w/2))/SCR.w*SBW,(y-(SCR.y-SCR.h/2))/SCR.h*SBH];
function levelAt(t){let k=0;for(const tu of T10UP)if(t>=tu)k++;return k;}
function yearAt(t){const k=levelAt(t);if(t>=T10EAT4)return Math.round(lerp(2003,2026,smooth(T10EAT4,T10EAT4+0.6,t)));return YEARS[k];}
// 3×5 的点阵数字
const DIG={0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001111',L:'100100100100111',V:'101101101101010'};
function pixText(c,s,x,y,px,col){c.fillStyle=col;let cx=x;for(const ch of s){const g=DIG[ch];if(!g){cx+=2*px;continue;}for(let i=0;i<15;i++)if(g[i]==='1')c.fillRect(cx+(i%3)*px,y+Math.floor(i/3)*px,px,px);cx+=4*px;}}
// 把主角画进某一级的小画布（缓冲坐标 → 小画布坐标）
function fishToBuf(p){const sc=SBW/SCR.w;const ox=SCR.x-SCR.w/2,oy=SCR.y-SCR.h/2;return{...p,L:p.L*sc,sp:p.sp.map(q=>({x:(q.x-ox)*sc,y:(q.y-oy)*sc,nx:q.nx,ny:q.ny}))};}
function drawLevelScene(k,t,c,p){const l=LV[k];c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,l.rx,l.ry);c.setTransform(l.rx/SBW,0,0,l.rx/SBW,0,0);
  // 背景
  if(k===0){c.fillStyle='#000';c.fillRect(0,0,SBW,SBH);}
  else if(k===1){c.fillStyle='#9bbc0f';c.fillRect(0,0,SBW,SBH);c.fillStyle='#8bac0f';for(let i=0;i<6;i++){c.fillRect(0,330+i*26,SBW,10);}c.fillStyle='#306230';for(const sx of [70,120,520,580]){for(let j=0;j<6;j++)c.fillRect(sx+12*Math.sin(j*0.9+t*1.5),480-j*28,14,26);}}
  else if(k===2){const g=c.createLinearGradient(0,0,0,SBH);g.addColorStop(0,'#2a6ad8');g.addColorStop(1,'#0a1a60');c.fillStyle=g;c.fillRect(0,0,SBW,SBH);c.fillStyle='#c09040';c.fillRect(0,430,SBW,50);
    c.fillStyle='#20a040';for(const sx of [60,110,540,590]){for(let j=0;j<7;j++)c.fillRect(sx+16*Math.sin(j*0.8+t*1.4),430-j*30,18,30);}
    c.fillStyle='#a0e0ff';for(let i=0;i<10;i++){const bx=(i*97+40)%SBW,by=SBH-((t*60+i*53)%SBH);c.fillRect(bx,by,8,8);}}
  else{const g=c.createLinearGradient(0,0,0,SBH);g.addColorStop(0,'#3aa0e8');g.addColorStop(0.55,'#145aa8');g.addColorStop(1,'#06204c');c.fillStyle=g;c.fillRect(0,0,SBW,SBH);
    c.globalAlpha=0.18;c.fillStyle='#fff';for(let i=0;i<5;i++){c.beginPath();const x0=80+i*120+30*Math.sin(t*0.5+i);c.moveTo(x0,0);c.lineTo(x0+40,0);c.lineTo(x0-60,SBH);c.lineTo(x0-120,SBH);c.closePath();c.fill();}c.globalAlpha=1;
    const sg=c.createLinearGradient(0,420,0,SBH);sg.addColorStop(0,'#d8b070');sg.addColorStop(1,'#806030');c.fillStyle=sg;c.fillRect(0,420,SBW,60);
    for(const [sx,h,ph] of [[50,200,0],[100,150,1],[560,220,2],[610,160,3]]){c.strokeStyle='#1e8c46';c.lineWidth=12;c.beginPath();c.moveTo(sx,450);for(let j=1;j<=10;j++)c.lineTo(sx+20*Math.sin(j*0.6+t*1.3+ph),450-j*h/10);c.stroke();}
    c.fillStyle='rgba(220,240,255,0.7)';for(let i=0;i<14;i++){const bx=(i*83+20)%SBW+6*Math.sin(t*2+i),by=SBH-((t*70+i*41)%SBH);c.beginPath();c.arc(bx,by,4+i%3*2,0,7);c.fill();}}
  // 豆
  for(let i=k;i<4;i++){if(i===3&&t>=T10EAT4)continue;const [px,py]=toBuf(...PELLETS[i]);const big=i===3;const pul=1+0.15*Math.sin(t*8);const r=(big?16:7)*pul;
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
  {const px=[8,8,4,3][k];const col=k===1?'#0f380f':'#fff';pixText(sbx,String(yearAt(t)),SBW-18*px,px*3,px,col);pixText(sbx,'LV'+(k+1),px*3,px*3,px,col);}
  const tu=T10UP[k-1];if(k>0&&t<tu+0.35){const q=(t-tu)/0.35;drawLevelScene(k-1,t,LVC[k-1].x,p);const yy=Math.floor(q*SBH);sbx.drawImage(LVC[k-1].c,0,yy*LV[k-1].ry/SBH,LV[k-1].rx,LV[k-1].ry*(1-q),0,yy,SBW,SBH-yy);sbx.fillStyle='rgba(255,255,255,0.85)';sbx.fillRect(0,yy-3,SBW,6);}
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
      if(tear>0){const r=rng(Math.floor(t*24));const n=10;for(let i=0;i<n;i++){const y0s=i/n*SBH,hs=SBH/n;const dx=(r()-.5)*90*tear*(r()<0.6?1:0);scx.drawImage(SB,0,y0s,SBW,hs,SCR.x-SCR.w/2+dx*SCR.w/SBW,SCR.y-SCR.h/2+y0s*SCR.h/SBH*hh+SCR.h*(1-hh)/2,SCR.w,hs*SCR.h/SBH*hh);}
        scx.globalCompositeOperation='lighter';scx.globalAlpha=0.5*tear;scx.filter='hue-rotate(90deg)';scx.drawImage(SB,SCR.x-SCR.w/2-6*tear,SCR.y-SCR.h/2,SCR.w,SCR.h);scx.filter='hue-rotate(-90deg)';scx.drawImage(SB,SCR.x-SCR.w/2+6*tear,SCR.y-SCR.h/2,SCR.w,SCR.h);scx.filter='none';scx.globalAlpha=1;scx.globalCompositeOperation='source-over';
        const r2=rng(Math.floor(t*30)+7);for(let i=0;i<40*tear;i++){scx.fillStyle=`rgba(255,255,255,${r2()*0.6})`;scx.fillRect(SCR.x-SCR.w/2+r2()*SCR.w,SCR.y-SCR.h/2+r2()*SCR.h,r2()*30,1+r2()*2);}}
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
  const r=rng(Math.floor(t*20));ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<6;i++){const y=r()*H,h=4+r()*14;ctx.drawImage(HEROC,0,y,W,h,(r()-.5)*24*z*(amp/7),y,W,h);}ctx.restore();blitLayer(HEROC,0.9);}
const SCR_PATH=c=>c.rect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
function style10(t,cam,TR,p,clip){if(t<T10ON)stylePaper(t,cam,TR,p,clip);else if(t>=T10OUT)styleSignal(t,cam,TR,p,clip);}

// ---------------- 拾 的登记 ----------------
STN.push({key:'s10',cx:S10X,hw:S10W/2,x0:-6320,x1:-5560,draw:drawS10Panel,owns:t=>t>=T10ON&&t<T10OUT,drawHero:(t,cam,TR,p)=>{if(t<T10ON+0.3){const q=smooth(T10ON,T10ON+0.28,t);const s=1-0.95*q;const c0=spineAt(p,0.1);const p2={...p,L:p.L*s,sp:p.sp.map(o=>({...o,x:c0.x+(o.x-c0.x)*s,y:c0.y+(o.y-c0.y)*s}))};splitStyle(t,cam,TR,p2,null,SCR_PATH,Infinity,stylePaper,styleMosaic);}},style:style10});
LABELS.push([S10X,S10W,S10W,'拾','游','电子游戏 · 像素']);
LIGHTS.push({x:S10X,y:-10,r:820,k:t=>smooth(112.8,114.8,t)});
GK.push([114.6,-5700,-10],[115.0,-5790,-20],[115.4,-5830,-22],[116.3,-5880,10],[117.0,-5930,20],[117.8,-5970,-5],[118.5,...PELLETS[0]],
  [119.2,-6030,-60],[119.9,-6050,-20],[120.6,-6020,30],[121.2,-5960,45],[121.9,...PELLETS[1]],
  [122.6,-5860,-20],[123.3,-5880,-70],[124.0,-5950,-90],[124.7,-6010,-60],[125.5,...PELLETS[2]],
  [126.3,-6000,40],[127.0,-5930,55],[127.7,-5870,20],[128.4,-5880,-30],[T10EAT4,-5938,-24],[129.6,-5946,-26],[130.2,-5960,-26],[T10OUT,-6000,-24],[131.3,-6080,-20],[131.8,-6180,-12],[132.3,-6262,-6],[132.8,-6330,0]);
HL.push([114.0,150],[115.0,150],[115.35,90],[129.1,90],[130.6,150],[131.2,140]);
HAMP.push(t=>1+0.8*smooth(T10EAT4,T10EAT4+0.2,t)*(1-smooth(T10OUT+0.6,T10OUT+1.6,t)));
HFB.push(t=>2.5*smooth(T10EAT4,T10EAT4+0.2,t)*(1-smooth(T10OUT+0.6,T10OUT+1.6,t)));
for(const tu of T10UP)SHAKES.push([tu,3]);SHAKES.push([T10OFF,9],[T10EAT4,4]);
CK.push({t:113.8,z:1.2,f:1,ox:-150,oy:-10},{t:114.8,x:S10X+30,y:-20,z:1.7},{t:115.6,x:SCR.x,y:SCR.y,z:4.7},{t:128.9,x:SCR.x,y:SCR.y,z:4.75},{t:129.8,x:SCR.x,y:SCR.y+4,z:3.6},{t:T10OUT,x:SCR.x-10,y:SCR.y+10,z:2.3},{t:131.6,x:S10X-120,y:0,z:1.6,f:0.4,ox:-80},{t:132.8,z:1.2,f:1,ox:-150,oy:-10});
