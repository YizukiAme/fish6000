// ================= 陆、柒 的登记：把样片 v3 接进全片 =================
const S6X=V3.SCX+OFF6,S7X=V3.PCX+OFF6;
const camV=cam=>({x:cam.x-OFF6,y:cam.y,z:cam.z,e5:cam.e.s6||0,e7:cam.e.s7||0});
const trV=cam=>{const z=cam.z;return[z,0,0,z,W/2-(cam.x-OFF6)*z,H/2-cam.y*z];};
const T7L=T6+V3.T_LEAVE;
// 主角：从磁州窑游过来，接上样片里的路线；在盘里定住，眨一下尾，再从盘面上浮起来离开
GK.push([55.4,-2962,22]);
for(const [tv,x,y] of V3.KNOTS){if(tv<4.4||tv>27)continue;GK.push([tv+T6,x+OFF6,y]);}
GK.push([T6+44.0,-4130.6,-5],[T7L,-4131.2,-5],[T7L+0.35,-4152,-6],[T7L+0.8,-4205,-4],[T7L+1.35,-4268,0],[T7L+2.0,-4340,3],[T7L+2.8,-4420,2],[T7L+3.7,-4505,0]);
HL.push([54.6,116],[56.2,150],[T6+21.0,150],[T6+24.0,230],[T7L+0.4,230],[T7L+2.6,150]);
HAMP.push(t=>(1-smooth(T6+V3.T_FREEZE-0.6,T6+V3.T_FREEZE,t)*(1-smooth(T7L-0.15,T7L+0.25,t)))*(1+0.5*smooth(T7L,T7L+0.2,t)*(1-smooth(T7L+0.8,T7L+1.6,t))));
HFB.push(t=>2.0*smooth(T7L,T7L+0.2,t)*(1-smooth(T7L+0.7,T7L+1.4,t)));
WINKS.push(T6+V3.T_WINK);
// 青花瓷的小鱼：白釉的身子、钴蓝的画，浮在墙面上，带影子
const PORC=mk(W,H),pcx2=PORC.getContext('2d');
function yuanSil(c,p,fill='#fff'){const pr=PROF.yuan;c.fillStyle=fill;bodyFill(c,edges(p,pr));c.fill();tailYuanPath(c,p);c.fill();finPath(c,finPts(p,pr,0.19,0.47,0.1,1,0.9));c.fill();finPath(c,finPts(p,pr,0.52,0.66,0.07,-1,1.3));c.fill();}
function porcelainFish(t,cam,TR,p,h,clip){const z=cam.z;
  layerBegin(pcx2,TR);if(clip){pcx2.beginPath();pcx2.rect(...clip);pcx2.clip();}yuanSil(pcx2,p);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.42*h;ctx.filter=`brightness(0) blur(${((2+5*h)*z).toFixed(1)}px)`;ctx.drawImage(PORC,-7*h*z,12*h*z);ctx.restore();
  layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}
  hctx.save();yuanSil(hctx,p);hctx.restore();
  hctx.globalCompositeOperation='source-in';const g=hctx.createLinearGradient(x0,y1,x1,y0);g.addColorStop(0,'#c9cfd2');g.addColorStop(0.5,'#eef0ee');g.addColorStop(1,'#fbfcfa');hctx.fillStyle=g;hctx.fillRect(x0-100,y0-100,x1-x0+200,y1-y0+200);
  hctx.globalCompositeOperation='source-atop';drawYuan(hctx,p,V3.BLUE,1,0.7*z);
  const s=spineAt(p,0.35);hctx.globalAlpha=0.55;hctx.strokeStyle='#fff';hctx.lineWidth=p.L*0.02;hctx.lineCap='round';hctx.beginPath();const a=bodyAt(p,PROF.yuan,0.22,0.55),b=bodyAt(p,PROF.yuan,0.5,0.6);hctx.moveTo(a[0],a[1]);hctx.quadraticCurveTo(s.x+s.nx*p.L*0.07,s.y+s.ny*p.L*0.07,b[0],b[1]);hctx.stroke();hctx.globalAlpha=1;
  hctx.globalCompositeOperation='source-over';blitLayer(HEROC,1);}
function drawHero67(t,cam,TR,p){const tv=t-T6;if(tv<V3.T_LEAVE){ctx.setTransform(...trV(cam));V3.drawHeroOutside(tv,camV(cam),trV(cam));return;}
  ctx.setTransform(...TR);porcelainFish(t,cam,TR,p,smooth(T7L,T7L+0.5,t));}
function styleSong(t,cam,TR,p,clip){const e=cam.e.s6||0;const w=lerp(600,1066.67,e);const px0=S6X-w/2;
  V3.inkLayer(TR,c=>{c.save();if(clip){c.beginPath();c.rect(...clip);c.clip();}c.beginPath();c.rect(-30000,-3000,60000,6000);c.rect(px0-9,-309,w+18,618);c.clip('evenodd');drawSong(c,p,cam.z);c.restore();});}
function styleYuanP(t,cam,TR,p,clip){porcelainFish(t,cam,TR,p,1,clip);}
function prep67(){const tr=HERO.tr;V3.setHero({tr:Object.assign({},tr,{T0:tr.T0-T6,X:tr.X.map(x=>x-OFF6)}),L:tv=>HERO.L(tv+T6),amp:tv=>HERO.amp(tv+T6),winks:WINKS.map(w=>w-T6)});}
STN.push({key:'s6',cx:S6X,hw:533,x0:OFF6,x1:-2880,draw:(t,cam)=>{ctx.setTransform(...trV(cam));V3.drawSongPanel(t-T6,camV(cam),trV(cam));},
  owns:t=>t>=T6+V3.T_INSIDE&&t<T7L+1.3,drawHero:drawHero67,style:styleSong,prep:prep67});
STN.push({key:'s7',cx:S7X,hw:533,x0:-4400,x1:OFF6,draw:(t,cam)=>{ctx.setTransform(...trV(cam));V3.drawQingPanel(t-T6,camV(cam));},
  post:(t,cam)=>{V3.kilnFX(t-T6,camV(cam));},style:styleYuanP});
LABELS.push([S6X,600,600,'陆','落花游鱼','宋 · 绢本设色'],[S7X,600,600,'柒','青花鱼藻纹盘','元 · 景德镇窑']);
LIGHTS.push({x:S6X,y:-10,r:840,k:t=>smooth(53.6,56.0,t)},{x:S7X,y:-10,r:840,k:t=>smooth(T6+20.0,T6+22.6,t)});
for(const [a0,a1,s] of V3.LINES3)LINES.push([a0+T6,a1+T6,s,262,350,'rgba(232,224,210,A)']);
CK.push({t:56.7,x:V3.SCX+OFF6+6,y:-7,z:2.0,e:{s6:1}});
for(const [tv,x,y,z,e5,e7] of V3.CK3){if(tv<7||tv>42.6)continue;CK.push({t:tv+T6,x:x+OFF6,y,z,e:{s6:e5,s7:e7}});}
CK.push({t:T6+44.0,x:S7X-12,y:0,z:1.95,e:{s7:1}},{t:T7L+0.2,x:S7X-30,y:0,z:1.95,e:{s7:1}},{t:T7L+1.6,z:1.45,e:{s7:0.45},f:1,ox:-110,oy:0},{t:T7L+3.0,z:1.15,e:{s7:0},f:1,ox:-150,oy:-10});
