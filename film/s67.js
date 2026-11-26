// ================= 陆、柒 的登记：把样片 v3 接进全片 =================
const S6X=V3.SCX+OFF6,S7X=V3.PCX+OFF6;
const camV=cam=>({x:cam.x-OFF6,y:cam.y,z:cam.z,e5:cam.e.s6||0,e7:cam.e.s7||0});
const trV=cam=>{const z=cam.z;return[z,0,0,z,W/2-(cam.x-OFF6)*z,H/2-cam.y*z];};
const T7L=T6+V3.T_LEAVE;
// 主角：从磁州窑游过来，接上样片里的路线；在盘里定住，眨一下尾，再从盘面上浮起来离开
GK.push([55.4,-2962,22]);
for(const [tv,x,y] of V3.KNOTS){if(tv<4.4||tv>27.5)continue;GK.push([tv+T6,x+OFF6,y]);}
GK.push([T6+44.0,-4130.6,-5],[T7L,-4131.2,-5],[T7L+0.35,-4152,-6],[T7L+0.8,-4205,-4],[T7L+1.35,-4268,0],[T7L+2.0,-4340,3],[T7L+2.8,-4420,2],[T7L+3.7,-4505,0]);
HL.push([54.6,116],[56.2,150],[T6+21.0,150],[T6+24.0,230],[T7L+0.4,230],[T7L+2.6,150]);
HAMP.push(t=>(1-smooth(T6+V3.T_FREEZE-0.6,T6+V3.T_FREEZE,t)*(1-smooth(T7L-0.15,T7L+0.25,t)))*(1+0.5*smooth(T7L,T7L+0.2,t)*(1-smooth(T7L+0.8,T7L+1.6,t))));
HFB.push(t=>2.0*smooth(T7L,T7L+0.2,t)*(1-smooth(T7L+0.7,T7L+1.4,t)));
WINKS.push(T6+V3.T_WINK);
// 青花瓷的小鱼：白釉的身子、钴蓝的画，浮在墙面上，带影子
const PORC=mk(W,H),pcx2=PORC.getContext('2d');
// 白釉的外形：和 drawYuan 画的鳍一一对上（硬棘背鳍、后背鳍、臀鳍、腹鳍），蓝彩才不会画到釉外面去，釉上也不会空出一块白
function yuanSil(c,p,fill='#fff'){yuanBrushFish(c,p,[0,0,0],1,fill);}
function floatingCobalt(c,p) {
  const scale=650;
  if(!floatingCobalt.cache){
    const n=512,values=new Int8Array(n*n),seed=rng(293);
    const broad=noise2(805,40,40),mid=noise2(812,40,40),fine=noise2(867,93,93);
    const darkPool=noise2(854,68,68);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const a=broad(x/51,y/35),b=mid(x/18.3,y/15.2),d=fine(x/5.7,y/5.9),sp=darkPool(x/8.8,y/7.9);
      const v=(a-.5)*37+(b-.5)*29+(d-.5)*17+(seed()-.5)*14-21*smooth(.75,.89,sp);
      values[(y<<9)+x]=Math.round(v);
    }
    const plate=document.createElement('canvas'),g=plate.getContext('2d',{willReadFrequently:true});
    floatingCobalt.cache={values,plate,g};
  }
  const {values,plate,g}=floatingCobalt.cache,L=p.L,k=scale/L,head=spineAt(p,0);
  const bx=-head.tx,by=-head.ty,dx=-head.nx,dy=-head.ny;
  let minX=0,maxX=0,minY=0,maxY=0;
  for(const q of p.sp){
    const x=(q.x-head.x)*k,y=(q.y-head.y)*k;
    const across=bx*x+by*y,below=dx*x+dy*y;
    minX=Math.min(minX,across);maxX=Math.max(maxX,across);minY=Math.min(minY,below);maxY=Math.max(maxY,below);
  }
  minX=Math.floor(minX-18);maxX=Math.ceil(maxX+18);
  minY=Math.floor(minY-.26*scale);maxY=Math.ceil(maxY+.23*scale);
  const w=maxX-minX,h=maxY-minY;
  if(plate.width!==w)plate.width=w;
  if(plate.height!==h)plate.height=h;
  g.reset();g.setTransform(bx*k,dx*k,by*k,dy*k,-(head.x*bx+head.y*by)*k-minX,-(head.x*dx+head.y*dy)*k-minY);
  drawYuan(g,p,[0,0,0],1,0);
  const image=g.getImageData(0,0,w,h),d=image.data;
  // Strong washes acquire a deep indigo core. Light press marks stay transparent
  // enough to show the clear glaze beneath, and the pores sit within the cobalt.
  for(let y=0,idx=0;y<h;y++){
    const row=((y+minY+229)&511)<<9;
    for(let x=0;x<w;x++,idx+=4){
      const aa=d[idx+3];if(aa===0)continue;
      const a=aa/255,grain=values[row+((x+minX+41)&511)],k=.35+.65*a;
      d[idx]=83-37*a+grain*k;
      d[idx+1]=104-42*a+grain*k;
      d[idx+2]=145-31*a+grain*k*.95;
      d[idx+3]=Math.round(aa*(.87+.105*a));
    }
  }
  g.putImageData(image,0,0);
  c.save();c.transform(bx/k,by/k,dx/k,dy/k,head.x+(bx*minX+dx*minY)/k,head.y+(by*minX+dy*minY)/k);
  c.drawImage(plate,0,0);c.restore();

  function xy(u,v){const q=spineAt(p,u);return[q.x-q.nx*v*L,q.y-q.ny*v*L];}
  const eye=xy(.121,-.050);
  c.beginPath();c.ellipse(eye[0]-.0008*L,eye[1]+.0016*L,.0094*L,.0091*L,0,0,Math.PI*2);
  c.fillStyle='rgba(23,32,63,.94)';c.fill();
  // A short broken specular sits on a dark wash. The original broad, solid white
  // bar erased the liquid character of the upper strokes during the lift.
  const dest=(uv)=>uv.map(q=>xy(q[0],q[1]));
  ribbon(c,curvePts(dest([[.26,-.127],[.3,-.129],[.335,-.126],[.368,-.12]]),19),t=>L*.0038*Math.pow(Math.sin(Math.PI*t),.7),'rgba(217,227,232,.21)',41);
}
function porcelainFish(t,cam,TR,p,h,clip,al=1){const z=cam.z;
  layerBegin(pcx2,TR);if(clip){pcx2.beginPath();pcx2.rect(...clip);pcx2.clip();}yuanSil(pcx2,p);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.42*h*al;ctx.filter=`brightness(0) blur(${((2+5*h)*z).toFixed(1)}px)`;ctx.drawImage(PORC,-7*h*z,12*h*z);ctx.restore();
  layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}
  hctx.save();yuanSil(hctx,p);hctx.restore();
  hctx.globalCompositeOperation='source-in';const g=hctx.createLinearGradient(x0,y1,x1,y0);g.addColorStop(0,'#c9cfd2');g.addColorStop(0.5,'#eef0ee');g.addColorStop(1,'#fbfcfa');hctx.fillStyle=g;hctx.fillRect(x0-100,y0-100,x1-x0+200,y1-y0+200);
  hctx.globalCompositeOperation='source-atop';floatingCobalt(hctx,p);
  hctx.globalCompositeOperation='source-over';

    blitLayer(HEROC,al);}
function drawHero67(t,cam,TR,p){const tv=t-T6;if(tv<V3.T_LEAVE){ctx.setTransform(...trV(cam));V3.drawHeroOutside(tv,camV(cam),trV(cam));return;}
  ctx.setTransform(...TR);porcelainFish(t,cam,TR,p,smooth(T7L,T7L+0.5,t),null,smooth(T7L-0.02,T7L+0.24,t));}
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
