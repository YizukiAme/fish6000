// ================= 伍 · 磁州窑白地黑花枕（宋金，仿） =================
// 主角游进开光，被一支看不见的笔几笔画成：头、身、背鳍、尾，再用针剔出白色的鳞
const S5X=-2590,S5Y=0,S5W=420,MS5=3;
const T5P=49.0;   // 主角的头碰到枕面：开始被画
const P5W=Math.ceil(400*MS5),P5H=Math.ceil(300*MS5);
function pillowPts(sc=1){const pts=[];for(let i=0;i<=120;i++){const th=i/120*Math.PI*2;const c=Math.cos(th),s=Math.sin(th);let x=180*Math.sign(c)*Math.pow(Math.abs(c),0.62),y=118*Math.sign(s)*Math.pow(Math.abs(s),0.62);
  if(y<0)y+=24*Math.exp(-Math.pow(x/95,2))*Math.pow(Math.abs(s),0.5);else y+=6*Math.exp(-Math.pow(x/120,2));pts.push([x*sc,y*sc+(sc<1?10*(1-sc)*2:0)]);}return pts;}
const PIL=pillowPts(1),PIL_IN=pillowPts(0.94),CART=pillowPts(0.74),CART2=pillowPts(0.705);
function ptsPath(c,pts,ox=0,oy=0){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0]+ox,q[1]+oy):c.moveTo(q[0]+ox,q[1]+oy));c.closePath();}
// 快笔：一笔一笔的带锋的线
function brush(c,pts,w,seed,col='rgba(24,20,18,0.95)',q=1){if(q<=0)return;const n=Math.max(2,Math.ceil(pts.length*q));const sub=pts.slice(0,n);ribbon(c,sub,v=>w*(v<0.15?0.4+4*v:1)*(1-0.75*Math.pow(v,3)),col,seed);}
function curvePts(ctrl,n=24){const out=[];for(let i=0;i<n;i++){const f=i/(n-1)*(ctrl.length-1);const a=Math.min(ctrl.length-2,Math.floor(f)),v=f-a;const P0=ctrl[Math.max(0,a-1)],P1=ctrl[a],P2=ctrl[a+1],P3=ctrl[Math.min(ctrl.length-1,a+2)];
  const h=(p0,p1,p2,p3)=>0.5*((2*p1)+(-p0+p2)*v+(2*p0-5*p1+4*p2-p3)*v*v+(-p0+3*p1-3*p2+p3)*v*v*v);out.push([h(P0[0],P1[0],P2[0],P3[0]),h(P0[1],P1[1],P2[1],P3[1])]);}return out;}
let PILC=null;
function prepPillow(){const c=mk(P5W,P5H);const x=c.getContext('2d');const T=()=>x.setTransform(MS5,0,0,MS5,P5W/2,P5H/2);T();
  // 化妆土 + 透明釉：米白，边缘略黄，有冰裂和铁斑
  x.save();ptsPath(x,PIL);x.clip();
  const img=x.getImageData(0,0,P5W,P5H);x.setTransform(1,0,0,1,0,0);
  {const d=img.data;const n1=noise2(551,6,5),n2=noise2(552,40,30),n3=noise2(553,200,150);const r=rng(554);
   for(let py=0;py<P5H;py++)for(let px=0;px<P5W;px++){const u=px/P5W,v=py/P5H;const xx=(px-P5W/2)/MS5,yy=(py-P5H/2)/MS5;const e=Math.min(1,Math.pow(xx/180,2)+Math.pow(yy/118,2));
     let lum=1+(n1(u*6,v*5)-0.5)*0.05+(n2(u*40,v*30)-0.5)*0.03+(n3(u*200,v*150)-0.5)*0.025+(r()-.5)*0.02;
     const i=(py*P5W+px)*4;d[i]=clamp(238*lum-e*10,0,255);d[i+1]=clamp(228*lum-e*16,0,255);d[i+2]=clamp(204*lum-e*26,0,255);d[i+3]=255;}}
  x.putImageData(img,0,0);T();
  // 冰裂纹
  {const r=rng(561);x.strokeStyle='rgba(120,100,70,0.16)';x.lineWidth=0.35;for(let k=0;k<70;k++){let px=(r()-.5)*360,py=(r()-.5)*230;x.beginPath();x.moveTo(px,py);let a=r()*Math.PI*2;for(let j=0;j<6;j++){a+=(r()-.5)*1.2;px+=Math.cos(a)*(6+r()*12);py+=Math.sin(a)*(6+r()*12);x.lineTo(px,py);}x.stroke();}
   for(let k=0;k<26;k++){x.fillStyle=`rgba(${90+r()*40|0},${60+r()*20|0},${30},${0.3+r()*0.4})`;x.beginPath();x.arc((r()-.5)*350,(r()-.5)*220,0.4+r()*1.1,0,7);x.fill();}}
  // 黑边框
  x.lineJoin='round';ptsPath(x,PIL);ptsPath(x,PIL_IN);x.fillStyle='rgba(26,21,18,0.95)';
  x.beginPath();PIL.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();PIL_IN.slice().reverse().forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.fill('evenodd');
  // 开光：一粗一细两道线
  ptsPath(x,CART);x.strokeStyle='rgba(26,21,18,0.95)';x.lineWidth=3.6;x.stroke();ptsPath(x,CART2);x.lineWidth=1.2;x.stroke();
  // 四角卷草：快笔
  for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const bx=sx*140,by=sy*(sy<0?68:88);
    brush(x,curvePts([[bx,by],[bx-sx*14,by-sy*4],[bx-sx*24,by+sy*8],[bx-sx*16,by+sy*14]],18),3.2,600+sx*3+sy);
    for(let k=0;k<3;k++){const a0=[bx-sx*(8+k*7),by-sy*(2+k*2)];brush(x,curvePts([a0,[a0[0]+sx*6,a0[1]-sy*8],[a0[0]+sx*14,a0[1]-sy*9]],10),2.4,610+k+sx*5+sy*9);}}
  x.restore();
  // 釉面光泽 + 边缘磨损（露出灰胎）
  x.save();ptsPath(x,PIL);x.clip();let g=x.createRadialGradient(70,-60,10,70,-60,200);g.addColorStop(0,'rgba(255,252,240,0.38)');g.addColorStop(0.4,'rgba(255,252,240,0.1)');g.addColorStop(1,'rgba(255,252,240,0)');
  x.globalCompositeOperation='screen';x.fillStyle=g;x.fillRect(-200,-150,400,300);x.globalCompositeOperation='source-over';
  g=x.createRadialGradient(0,0,90,0,0,215);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(80,60,40,0.3)');x.fillStyle=g;x.fillRect(-200,-150,400,300);
  {const r=rng(571);for(let k=0;k<50;k++){const q=PIL[Math.floor(r()*PIL.length)];x.fillStyle=`rgba(${150+r()*30|0},${140+r()*20|0},${126},${0.5+r()*0.4})`;blob(x,q[0]*0.995,q[1]*0.995,0.8+r()*2.2,k*7+3);x.fill();}}
  x.restore();
  x.lineWidth=1.4;ptsPath(x,PIL);x.strokeStyle='rgba(70,54,38,0.55)';x.stroke();
  PILC=c;}
// ---------- 磁州窑画风的鱼：几笔黑彩 + 剔出的白线 ----------
const CZ_STROKES=[ // [开始, 时长, 生成笔画点的函数, 宽度系数]
  [0.0,0.2,'head'],[0.15,0.42,'body'],[0.52,0.18,'dorsal'],[0.66,0.14,'tailU'],[0.76,0.14,'tailD'],[0.86,0.12,'pelv'],[0.94,0.12,'anal']];
function czPts(p,k){const L=p.L,P=(u,Y)=>BP(p,u,Y*0.2*L);
  switch(k){case 'head':return curvePts([P(0.0,0.05),P(0.06,0.25),P(0.15,0.15),P(0.17,-0.2),P(0.06,-0.28),P(0.02,-0.05)],18);
    case 'body':return curvePts([P(0.12,0.05),P(0.3,0.08),P(0.5,0.05),P(0.68,0.0),P(0.82,-0.02)],26);
    case 'dorsal':return curvePts([P(0.33,0.62),P(0.41,1.3),P(0.52,1.22),P(0.62,0.6)],14);
    case 'tailU':return curvePts([P(0.8,0.05),P(0.9,0.5),P(1.0,1.05)],12);
    case 'tailD':return curvePts([P(0.8,-0.05),P(0.9,-0.48),P(1.0,-0.95)],12);
    case 'pelv':return curvePts([P(0.36,-0.6),P(0.43,-1.2),P(0.5,-1.05)],10);}}
const CZ_FINS={
  dorsal:[[[0.29,0.6],[0.37,0.62],[0.45,0.62],[0.55,0.6],[0.63,0.56]],[[0.29,0.62],[0.35,1.3],[0.45,1.24],[0.55,1.0],[0.63,0.6]]],
  tailU:[[[0.78,0.0],[0.84,0.02],[0.9,0.03],[0.94,0.02]],[[0.78,0.2],[0.87,0.52],[1.02,1.06],[0.94,0.04]]],
  tailD:[[[0.78,0.0],[0.84,-0.02],[0.9,-0.03],[0.94,-0.02]],[[0.78,-0.2],[0.87,-0.5],[1.02,-1.0],[0.94,-0.04]]],
  pelv:[[[0.35,-0.56],[0.39,-0.6],[0.44,-0.6],[0.47,-0.56]],[[0.35,-0.6],[0.42,-0.92],[0.51,-1.12],[0.47,-0.6]]],
  anal:[[[0.62,-0.42],[0.66,-0.43],[0.7,-0.39],[0.73,-0.33]],[[0.62,-0.46],[0.68,-0.76],[0.76,-0.86],[0.73,-0.35]]]};
function czFinPts(p,k){const L=p.L,P=(u,Y)=>BP(p,u,Y*0.2*L);const [b,e]=CZ_FINS[k];return[curvePts(b.map(a=>P(a[0],a[1])),18),curvePts(e.map(a=>P(a[0],a[1])),18)];}
function czFin(c,p,k,q){if(q<=0)return;const [nb,ne]=czFinPts(p,k);const n=Math.max(2,Math.ceil(nb.length*q));
  c.beginPath();for(let i=0;i<n;i++){const a=nb[i];i?c.lineTo(a[0],a[1]):c.moveTo(a[0],a[1]);}for(let i=n-1;i>=0;i--)c.lineTo(ne[i][0],ne[i][1]);c.closePath();c.fill();
  // 收笔的锋：沿外缘再描一道细笔
  c.lineWidth=p.L*0.012;c.strokeStyle='rgba(24,20,18,0.96)';c.beginPath();for(let i=0;i<n;i++){const a=ne[i];i?c.lineTo(a[0],a[1]):c.moveTo(a[0],a[1]);}c.stroke();}
function czWidth(k,L){return{head:0.13,body:0.3,dorsal:0.09,tailU:0.08,tailD:0.08,pelv:0.07}[k]*L;}
function drawCizhouFish(c,p,tp){// tp：从开始被画起的秒数（大于 3 就是画完了）
  const L=p.L;c.save();
  for(const [t0,d,k] of CZ_STROKES){const q=clamp((tp-t0)/d);if(q<=0)continue;const pts=(k==='head'||k==='body')?czPts(p,k):null;const w=czWidth(k,L);
    if(k==='body'){const n=Math.max(2,Math.ceil(pts.length*q));ribbon(c,pts.slice(0,n),v=>w*(0.55+0.45*Math.sin(Math.PI*Math.min(1,0.12+v*0.95)))*(1-0.55*Math.pow(v,2.5)),'rgba(24,20,18,0.96)',901);}
    else if(k==='head'){if(q<1){brush(c,pts,w,902,undefined,q);}else{c.fillStyle='rgba(24,20,18,0.96)';c.beginPath();pts.forEach((s,i)=>i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]));c.closePath();c.fill();c.lineWidth=w*0.4;c.strokeStyle='rgba(24,20,18,0.96)';c.stroke();}}
    else{c.fillStyle='rgba(24,20,18,0.96)';czFin(c,p,k,q);}}
  // 剔划：针尖刮出白线（从笔画画完之后开始）
  c.globalCompositeOperation='destination-out';c.lineCap='round';const k0=L/120;
  const sg=(t0,d)=>clamp((tp-t0)/d);
  const gq=sg(1.15,0.16);if(gq>0){const pts=curvePts([BP(p,0.19,0.95*0.2*L*0.95),BP(p,0.215,0),BP(p,0.19,-0.9*0.2*L)],12);const n=Math.max(2,Math.ceil(pts.length*gq));c.lineWidth=1.3*k0;c.beginPath();pts.slice(0,n).forEach((s,i)=>i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]));c.stroke();}
  let idx=0;for(const Y of [0.45,0.0,-0.45])for(let u=0.28;u<0.74;u+=0.075){const q=sg(1.3+idx*0.035,0.08);idx++;if(q<=0)continue;const ce=BP(p,u+(Y===0?0.035:0),Y*0.2*L);const s=spineAt(p,u);const ang=Math.atan2(-s.ty,-s.tx);
    c.lineWidth=1.0*k0;c.beginPath();c.arc(ce[0],ce[1],0.032*L,ang-1.2*q,ang+1.2*q);c.stroke();}
  const eq=sg(2.15,0.12);if(eq>0){const e=BP(p,0.075,0.08*0.2*L*2);c.lineWidth=1.1*k0;c.beginPath();c.arc(e[0],e[1],0.028*L,0,7*eq);c.stroke();}
  const rq=sg(1.95,0.2);if(rq>0){for(const k of ['dorsal','tailU','tailD','pelv','anal']){const [nb,ne]=czFinPts(p,k);const st=k==='dorsal'?3:(k.startsWith('tail')?3:5);
      for(let i=st;i<nb.length-2;i+=st){if(i/nb.length>rq)break;const a=nb[i],b=ne[i];c.lineWidth=0.7*k0;c.beginPath();c.moveTo(lerp(a[0],b[0],0.22),lerp(a[1],b[1],0.22));c.lineTo(lerp(a[0],b[0],0.86),lerp(a[1],b[1],0.86));c.stroke();}}
    const pq=sg(2.05,0.12);if(pq>0){const L2=0.2*L;const a=BP(p,0.2,-0.1*L2),pts=[BP(p,0.27,-0.55*L2),BP(p,0.31,-0.48*L2),BP(p,0.33,-0.3*L2)];c.lineWidth=0.8*k0;for(const b of pts.slice(0,Math.ceil(3*pq))){c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();}}}
  c.restore();}
const GRASS5=[[-118,84,1,1],[-98,86,1,0.8],[112,84,-1,1],[128,82,-1,0.75],[20,88,1,0.6],[-30,90,-1,0.5]];
const WAVES5=[[-60,70,40],[0,78,46],[60,66,36],[-20,58,24],[34,54,20],[-84,62,22]];
function drawWater5(c,t,hp){c.save();c.translate(S5X,S5Y+6);ptsPath(c,CART2);c.clip();c.globalCompositeOperation='multiply';
  const hd=hp?[hp.sp[0].x-S5X,hp.sp[0].y-S5Y-6]:null,mid=hp?[spineAt(hp,0.5).x-S5X,spineAt(hp,0.5).y-S5Y-6]:null;
  GRASS5.forEach(([gx,gy,dir,s],j)=>{for(let k=0;k<4;k++){const gq=clamp((t-(T5P+0.12+0.13*j+0.05*k))/0.2);if(gq<=0)continue;const h=(46+k*12)*s;const lean=dir*(8+k*7);const bx=gx+k*4*dir;
    const ph=t*1.9+gx*0.05+k*0.7;const sw=(5+k*1.6)*s*Math.sin(ph)+2.2*Math.sin(t*3.1+k+gx);
    let push=0;for(const q of [hd,mid]){if(!q)continue;const dx=bx+lean-q[0],dy=gy-h*0.7-q[1];const d=Math.hypot(dx,dy);push+=Math.sign(dx||1)*22*s*Math.exp(-d*d/(2*34*34));}
    const off=v=>(sw+push)*Math.pow(v,1.5);
    brush(c,curvePts([[bx,gy],[bx+lean*0.3+off(0.4),gy-h*0.4],[bx+lean*0.8+off(0.75),gy-h*0.75+Math.abs(off(0.75))*0.15],[bx+lean*1.4+off(1),gy-h+Math.abs(off(1))*0.25]],20),2.6+0.4*(k%2),700+gx+k,undefined,gq);}});
  WAVES5.forEach(([wx,wy,wl],i)=>{const wq=clamp((t-(T5P+0.85+0.09*i))/0.16);if(wq<=0)return;const dr=4*Math.sin(t*1.1+wx*0.07),b=2.2*Math.sin(t*2.3+wx);const x0=wx+dr;
    brush(c,curvePts([[x0-wl/2,wy+b*0.3],[x0-wl/6,wy-3+b],[x0+wl/6,wy+1-b],[x0+wl/2,wy-2+b*0.4]],14),1.8,800+wx,undefined,wq);});
  c.restore();}
function drawS5Panel(t,cam,TR){const x0=S5X-S5W/2,y0=S5Y-S5W/2;panelShadow(x0,y0,S5W,S5W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S5W,S5W);ctx.clip();
  ctx.drawImage(LINEN,0,0,840,840,x0,y0,S5W,S5W);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(150,154,146)';ctx.fillRect(x0,y0,S5W,S5W);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.filter=`blur(${(9*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(20,18,14,0.5)';ptsPath(ctx,PIL,S5X-8,S5Y+6+11);ctx.fill();ctx.restore();
  ctx.drawImage(PILC,S5X-P5W/2/MS5,S5Y+6-P5H/2/MS5,P5W/MS5,P5H/MS5);
  drawWater5(ctx,t,(t>47.5&&t<55.5)?heroPoseNow(t):null);
  ctx.restore();ctx.strokeStyle='rgba(60,64,58,0.4)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S5W,S5W);}
function styleCizhou(t,cam,TR,p,clip){const entering=t<T5P+2.6;
  if(entering){ctx.save();if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.beginPath();ctx.rect(-40000,-4000,80000,8000);PIL.forEach((q,i)=>i?ctx.lineTo(q[0]+S5X,q[1]+S5Y+6):ctx.moveTo(q[0]+S5X,q[1]+S5Y+6));ctx.closePath();ctx.clip('evenodd');bronzeRelief([p],TR,cam);ctx.restore();}
  if(t<T5P)return;
  layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}if(entering){ptsPath(hctx,PIL,S5X,S5Y+6);hctx.clip();}drawCizhouFish(hctx,p,t-T5P);layerGrain(hctx,TR,0.1);blitLayer(HEROC,1);}

// ---------------- 伍 的登记 ----------------
STN.push({key:'s5',cx:S5X,hw:S5W/2,x0:-2880,x1:-2300,draw:drawS5Panel,style:styleCizhou,prep:prepPillow});
LABELS.push([S5X,S5W,S5W,'伍','白地黑花鱼藻纹枕','宋金 · 磁州窑']);
LIGHTS.push({x:S5X,y:-10,r:600,k:t=>smooth(46.4,48.6,t)});
GK.push([48.7,-2380,-40],[49.1,-2420,-28],[49.3,-2440,-21],[49.8,-2482,-6],[50.4,-2530,14],[51.0,-2574,28],[51.6,-2618,22],[52.2,-2652,2],[52.8,-2696,-12],[53.4,-2748,-12],[53.85,-2800,-6],[54.6,-2884,0]);
HL.push([48.3,108],[49.2,116],[54.0,116]);
HAMP.push(t=>1-0.35*smooth(T5P-0.1,T5P+0.2,t)*(1-smooth(T5P+1.2,T5P+1.8,t)));
CK.push({t:49.0,x:S5X+70,y:0,z:1.45,f:0.35,ox:-50},{t:50.2,x:S5X+40,y:S5Y+4,z:2.25},{t:51.6,x:S5X+8,y:S5Y+8,z:2.1},{t:52.9,x:S5X-30,y:S5Y,z:1.75},{t:54.2,z:1.25,f:1,ox:-150,oy:-10});
