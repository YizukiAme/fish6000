// ================= 叁 · 汉画像石（拓片） =================
// 渔人在船上起罾，主角被网兜出水面，从网眼里钻出去，掉回水里溜走
const S3X=-1340,S3Y=0,S3W=600,S3H=400,RUBW=540,RUBH=330;
const MS3=3;
const INK3=[30,28,27];
// 拓片的墨色：扑墨的斑驳 + 纸纹
const RUBTEX=(()=>{const w=RUBW*MS3,h=RUBH*MS3;const c=mk(w,h);const x=c.getContext('2d');const img=x.createImageData(w,h);const d=img.data;const n1=noise2(331,12,8),n2=noise2(332,60,40),n3=noise2(333,300,200);const r=rng(334);
  for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const u=xx/w,v=y/h;let a=0.06+0.3*clamp((n1(u*12,v*8)-0.42)*1.6)+0.18*clamp((n2(u*60,v*40)-0.5)*2)+(n3(u*300,v*200)-0.5)*0.25;if(r()<0.04)a+=0.35*r();d[(y*w+xx)*4+3]=255*clamp(a);}
  x.putImageData(img,0,0);return c;})();
// 背景：剔地留下的竖向凿痕
const RUBBG=(()=>{const w=RUBW*MS3,h=RUBH*MS3;const c=mk(w,h);const x=c.getContext('2d');const img=x.createImageData(w,h);const d=img.data;const n1=noise2(341,30,6),n2=noise2(342,600,10),n3=noise2(343,8,6);const r=rng(345);
  for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const u=xx/w,v=y/h;const stri=Math.pow(clamp((n2(u*600,v*10)-0.35)*1.6),2);let k=0.08+0.32*stri*(0.6+0.8*n1(u*30,v*6))+0.12*n3(u*8,v*6)+(r()-.5)*0.06;
    const i=(y*w+xx)*4;d[i]=INK3[0];d[i+1]=INK3[1];d[i+2]=INK3[2];d[i+3]=255*clamp(k);}
  x.putImageData(img,0,0);return c;})();
// ---------- 汉画的鱼：敦实的黑剪影，阴刻白线 ----------
const PROF_HAN=mkProf(0.17,0.15,0.55,0.62,0.24);
function drawHanFish(c,p){const pr=PROF_HAN,L=p.L;const e=edges(p,pr);c.save();c.fillStyle='#000';c.strokeStyle='#000';c.lineJoin='round';c.lineCap='round';
  for(const f of [finPts(p,pr,0.3,0.55,0.11,1,1.2),finPts(p,pr,0.6,0.72,0.07,-1,1.4),finPts(p,pr,0.38,0.47,0.07,-1,1.8)]){finPath(c,f);c.fill();}
  // 尾
  const Pp=(u,v)=>{const s=spineAt(p,u);return[s.x+s.nx*v*L,s.y+s.ny*v*L];};const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1),tt=Pp(1,0.2),tb=Pp(1,-0.19),nt=Pp(0.93,0);
  c.beginPath();c.moveTo(bt[0],bt[1]);c.lineTo(tt[0],tt[1]);c.lineTo(nt[0],nt[1]);c.lineTo(tb[0],tb[1]);c.lineTo(bb[0],bb[1]);c.closePath();c.fill();
  bodyFill(c,e);c.fill();
  // 阴刻：眼、鳃、鳞、鳍条、嘴
  c.globalCompositeOperation='destination-out';const k=L/140;
  const ey=bodyAt(p,pr,0.08,0.3);c.lineWidth=1.3*k;c.beginPath();c.arc(ey[0],ey[1],0.026*L,0,7);c.stroke();
  const g0=bodyAt(p,pr,0.2,0.85),g1=bodyAt(p,pr,0.235,0),g2=bodyAt(p,pr,0.2,-0.8);c.lineWidth=1.5*k;c.beginPath();c.moveTo(g0[0],g0[1]);c.quadraticCurveTo(g1[0],g1[1],g2[0],g2[1]);c.stroke();
  c.lineWidth=1.1*k;for(const v of [0.45,-0.05,-0.55])for(let u=0.3;u<0.74;u+=0.075){const q=bodyAt(p,pr,u+(v===-0.05?0.035:0),v);const s=spineAt(p,u);const ang=Math.atan2(-s.ty,-s.tx);c.beginPath();c.arc(q[0],q[1],0.028*L,ang-1.2,ang+1.2);c.stroke();}
  c.lineWidth=0.9*k;const tb2=spineAt(p,0.86);for(let j=-2;j<=2;j++){const q=Pp(0.985,j*0.07);c.beginPath();c.moveTo(tb2.x,tb2.y);c.lineTo(lerp(tb2.x,q[0],0.85),lerp(tb2.y,q[1],0.85));c.stroke();}
  const m0=bodyAt(p,pr,0.0,0.05),m1=bodyAt(p,pr,0.06,-0.2);c.lineWidth=1.2*k;c.beginPath();c.moveTo(m0[0],m0[1]);c.lineTo(m1[0],m1[1]);c.stroke();
  c.restore();}
// ---------- 场景（拓片局部坐标：x -270..270，y -165..165） ----------
// 石头上的东西都活过来：水在流、雁在飞、鹭在点头、船在晃、小鱼在游；渔人起罾，正好把主角兜出水
const T3C=36.52,T3IN=35.9,T3LIFT0=36.3,T3LIFT1=37.0,T3F1=37.12,T3F2=37.62,T3JUMP=38.2,T3ENT=38.98,T3OWN1=39.32;
const H3=[60,44],NETW=50,RIMD=96,SAG=20,WATER3=22;
function rubPath(c,pts){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));}
function wave3(y0,amp,ph,x0=-262,x1=262){const pts=[];for(let x=x0;x<=x1;x+=4)pts.push([x,y0+amp*Math.sin(x*0.055+ph)+amp*0.4*Math.sin(x*0.13+ph*2)]);return pts;}
const lift3=t=>smooth(T3LIFT0,T3LIFT1,t)*(1-0.9*smooth(39.7,41.4,t));
const boat3=t=>({dy:1.6*Math.sin(1.5*t),rot:0.014*Math.sin(1.5*t+0.8)-0.035*smooth(T3LIFT0-0.1,T3LIFT0+0.35,t)*(1-smooth(T3LIFT1,T3LIFT1+0.9,t))});
const NETTIP=t=>{const l=lift3(t);return[64-4*l,-34-76*l+1.2*Math.sin(1.5*t)-7*bmp(t,T3C-0.04,0.26)];};
const bmp=(t,t0,d)=>t>t0&&t<t0+d?Math.sin(Math.PI*(t-t0)/d):0;
const hop3=t=>26*bmp(t,T3F1,0.42)+20*bmp(t,T3F2,0.42);
// 被网兜住的那一下：一点没准备，被颠起来一小下，再落回网里
const toss3=t=>19*bmp(t,T3C,0.4);
// 鱼是游着进网的：碰到网的时候还带着往左的速度，在网里滑一小段才停下
let C3=null;
function catch3(){if(!C3){const a=poseCenter(fishPose(HERO,T3C-0.05)),b=poseCenter(fishPose(HERO,T3C+0.05));const xc=(a[0]+b[0])/2-S3X,v=(b[0]-a[0])/0.1,xr=H3[0]-4;
  C3={xc,v,xr,tau:clamp((xc-xr)/Math.max(20,-v),0.12,0.4)};}return C3;}
const fishX3=t=>{const c=catch3();return t<T3C?c.xc+c.v*(t-T3C):c.xr+(c.xc-c.xr)*Math.exp(-(t-T3C)/c.tau);};
// 主角的身体中心在网兜里的高度：网没升上来时悬在网上方；网口越过它之后就被兜着走
const scoopY=t=>{const [tx,ty]=NETTIP(t);return Math.min(H3[1],ty+RIMD+SAG-9);};
// 自己生成一条鱼的姿态：中心、朝向、弯曲度、摆尾
function procPose(cx,cy,ang,L,curv,amp,ph,t){const N=32,sp=[];const fx=Math.cos(ang),fy=Math.sin(ang),lx=-fy,ly=fx;
  for(let i=0;i<=N;i++){const u=i/N;const s=(0.45-u)*L;let a,b;if(Math.abs(curv)<1e-5){a=s;b=0;}else{a=Math.sin(curv*s)/curv;b=(1-Math.cos(curv*s))/curv;}
    const off=L*(0.012+0.08*u*u)*amp*Math.sin(2*Math.PI*0.9*u-ph);b+=off;sp.push({x:cx+fx*a+lx*b,y:cy+fy*a+ly*b});}
  for(let i=0;i<=N;i++){const A=sp[Math.max(0,i-1)],B=sp[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;sp[i].nx=-dy;sp[i].ny=dx;}
  return{sp,N,L,t,sn:0.6,ph,flut:1};}
function blendPose(a,b,k){const sp=a.sp.map((q,i)=>({x:lerp(q.x,b.sp[i].x,k),y:lerp(q.y,b.sp[i].y,k)}));const N=a.N;
  for(let i=0;i<=N;i++){const A=sp[Math.max(0,i-1)],B=sp[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;sp[i].nx=-dy;sp[i].ny=dx;}
  return{...b,sp};}
const poseCenter=p=>{const s=spineAt(p,0.45);return[s.x,s.y];};
const poseAng=p=>Math.atan2(p.sp[0].y-p.sp[p.N].y,p.sp[0].x-p.sp[p.N].x);
// 跳出去的弧线（局部坐标）
let LEAP3=null;
function leap3(t){if(!LEAP3){const L=fishPose(HERO,T3JUMP).L;const c0=[fishX3(T3JUMP)+2,scoopY(T3JUMP)];const c1=[-6,48];LEAP3={c0,c1,h:96,L};}
  const {c0,c1,h}=LEAP3;const u=clamp((t-T3JUMP)/(T3ENT-T3JUMP));const x=lerp(c0[0],c1[0],u),y=lerp(c0[1],c1[1],u)-4*h*u*(1-u);
  const vx=c1[0]-c0[0],vy=c1[1]-c0[1]-4*h*(1-2*u);return{x,y,ang:Math.atan2(vy,vx),u};}
// 主角在拓片里的姿态（局部坐标里算，最后加上 S3X,S3Y）
function heroPose3(t,trackP){const L=trackP.L;const ph=trackP.ph;let cx,cy,ang,curv=0,amp=0.5,ph2=ph;
  if(t<T3JUMP){cx=fishX3(t);cy=scoopY(t)-hop3(t)-toss3(t);ang=Math.PI;
    const f1=bmp(t,T3F1,0.42),f2=bmp(t,T3F2,0.42);const inBag=smooth(T3C-0.05,T3C+0.3,t);
    const ut=(t-T3C)/0.4;if(ut>0&&ut<1)ang+=0.2*Math.sin(2*Math.PI*ut);
    ang+=0.34*Math.sin(2*Math.PI*(t-T3F1)/0.42)*f1-0.3*Math.sin(2*Math.PI*(t-T3F2)/0.42)*f2;
    curv=inBag*(0.005+0.009*Math.sin(2*Math.PI*(t-T3LIFT1)/0.5)*smooth(T3LIFT1-0.1,T3F1,t));
    amp=0.7+0.7*inBag;ph2=ph+inBag*(t-T3C)*2*Math.PI*1.6;}
  else{const q=leap3(t),q2=leap3(t+0.01);cx=q.x;cy=q.y;ang=q.ang;const da=Math.atan2(Math.sin(q2.ang-q.ang),Math.cos(q2.ang-q.ang));const v=Math.hypot(q2.x-q.x,q2.y-q.y)||1;curv=clamp(da/v,-0.03,0.03);amp=0.9;ph2=ph+(t-T3JUMP)*2*Math.PI*2.2;}
  return procPose(cx+S3X,cy+S3Y,ang,L,curv,amp,ph2,t);}
function heroPoseS3(t){const tp=heroPoseNow(t);if(t<T3C-0.12||t>T3OWN1)return tp;
  const pp=heroPose3(Math.min(t,T3ENT),tp);
  if(t<T3C+0.1){const k=smooth(T3C-0.12,T3C+0.1,t);return blendPose(tp,pp,k);}
  if(t>T3ENT){return blendPose(pp,tp,smooth(T3ENT,T3OWN1,t));}
  return pp;}
// 入水点：头第一次穿过水面的位置（第一次用时算出来）
let SPL3=null;
function splash3(){if(SPL3)return SPL3;SPL3={t:T3ENT,x:-14};for(let t=T3JUMP+0.2;t<T3ENT;t+=1/240){const p=heroPose3(t,fishPose(HERO,t));const hy=p.sp[0].y-S3Y;if(hy>WATER3){SPL3={t,x:p.sp[0].x-S3X};break;}}return SPL3;}
// 小鱼：沿水带慢慢游，到头绕回来
const SMALL3=[[-150,82,46,1,0.9],[150,122,40,-1,1.3],[-40,128,38,1,0.7],[190,60,34,1,1.1],[60,100,30,-1,0.8]];
function hanStatic(c,t){c.fillStyle='#000';c.strokeStyle='#000';c.lineCap='round';c.lineJoin='round';
  // 边框与垂幛纹
  c.lineWidth=9;c.strokeRect(-265.5,-160.5,531,321);c.lineWidth=1.6;c.strokeRect(-256,-151,512,302);
  for(let x=-250;x<250;x+=20){c.beginPath();c.moveTo(x,-151);c.lineTo(x+20,-151);c.lineTo(x+10,-134);c.closePath();c.fill();}
  c.lineWidth=1.4;c.beginPath();c.moveTo(-256,-128);c.lineTo(256,-128);c.stroke();
  c.save();c.beginPath();c.rect(-254,-126,508,275);c.clip();
  // 水：几道起伏的阳线，一直在流
  c.lineWidth=2.6;for(const [y0,a,ph] of [[22,3,0.3],[62,3.5,1.7],[104,3,3.1],[140,2.6,4.4]]){rubPath(c,wave3(y0,a,ph+1.15*t,-250,250));c.stroke();}
  // 天上两只雁：往左飞，翅膀一扇一扇
  for(const [bx0,by,s,k] of [[214,-96,1,0],[262,-80,0.8,1.7]]){const bx=bx0-15*(t-31);const f=Math.sin(7.2*t+k);c.save();c.translate(bx,by+1.5*Math.sin(3.6*t+k));c.scale(s,s);
    c.beginPath();c.moveTo(-22,2+7*f);c.quadraticCurveTo(-8,-14-8*f,0,-2);c.quadraticCurveTo(8,-16-8*f,24,-4+7*f);c.quadraticCurveTo(8,-6,2,4);c.quadraticCurveTo(-6,6,-22,2+7*f);c.fill();c.restore();}
  // 左岸的鹭：长腿立在水里，慢慢点头
  {const nod=Math.sin(1.3*t)*0.5+0.5;c.save();c.translate(-205,0);c.lineWidth=2.4;c.beginPath();c.moveTo(-4,30);c.lineTo(-6,96);c.moveTo(6,30);c.lineTo(10,96);c.stroke();
   c.beginPath();c.ellipse(0,18,20,13,-0.35,0,7);c.fill();c.beginPath();c.moveTo(-16,16);c.lineTo(-34,30);c.lineTo(-12,24);c.closePath();c.fill();
   c.save();c.translate(12,10);c.rotate(0.22*nod);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(10,-22,0,-38);c.lineTo(5,-41);c.quadraticCurveTo(18,-22,6,2);c.closePath();c.fill();
   c.translate(2,-42);c.rotate(0.25*nod);c.beginPath();c.arc(0,0,6,0,7);c.fill();c.beginPath();c.moveTo(4,-2);c.lineTo(30,4);c.lineTo(4,3);c.closePath();c.fill();
   c.save();c.translate(30,8);c.rotate(0.6+0.25*Math.sin(5*t));c.beginPath();c.ellipse(0,0,7,3,0,0,7);c.fill();c.beginPath();c.moveTo(-6,0);c.lineTo(-11,-3);c.lineTo(-11,3);c.closePath();c.fill();c.restore();
   c.restore();c.restore();}
  // 水里的小鱼
  for(const [fx0,fy,fl,dir,sp] of SMALL3){let fx=fx0-dir*sp*14*(t-31);fx=((fx+245)%490+490)%490-245;const ph=t*2*Math.PI*1.4+fx0;
    const p=procPose(fx,fy+2*Math.sin(t*0.9+fx0),dir>0?Math.PI:0,fl,0,0.9,ph,t);if(dir<0)for(const q of p.sp){q.nx=-q.nx;q.ny=-q.ny;}drawHanFish(c,p);}
  c.restore();}
function hanDynamic(c,t){c.fillStyle='#000';c.strokeStyle='#000';c.lineCap='round';c.lineJoin='round';
  const B=boat3(t);const [tx,ty]=NETTIP(t);
  // 船和渔人：一起晃；起罾时整个人往后仰
  c.save();c.translate(-70,22+B.dy);c.rotate(B.rot);c.translate(70,-22);
  c.beginPath();c.moveTo(-150,12);c.quadraticCurveTo(-140,30,-120,30);c.lineTo(-20,30);c.quadraticCurveTo(0,30,8,10);c.lineTo(-6,16);c.lineTo(-138,16);c.closePath();c.fill();
  const lean=-0.28*smooth(T3LIFT0-0.15,T3LIFT0+0.3,t)*(1-0.6*smooth(T3LIFT1+0.2,T3LIFT1+1.2,t));
  c.save();c.translate(-62,14);c.rotate(lean);c.translate(0,-14);c.beginPath();c.moveTo(-26,16);c.quadraticCurveTo(-30,-14,-12,-32);c.lineTo(8,-32);c.quadraticCurveTo(22,-12,20,16);c.closePath();c.fill();
  c.beginPath();c.arc(-2,-42,10,0,7);c.fill();c.beginPath();c.moveTo(-8,-50);c.lineTo(4,-62);c.lineTo(10,-48);c.closePath();c.fill();
  c.restore();c.restore();
  // 杆：支点在船头（船的变换在局部坐标里算）
  const Bm=new DOMMatrix().translate(-70,22+B.dy).rotate(B.rot*180/Math.PI).translate(70,-22);
  const Fm=Bm.translate(-62,14).rotate(lean*180/Math.PI).translate(0,-14);
  const pv=new DOMPoint(-40,-14).matrixTransform(Bm);const dx=tx-pv.x,dy=ty-pv.y;const l=Math.hypot(dx,dy);const ux=dx/l,uy=dy/l;const back=[pv.x-ux*34,pv.y-uy*34];
  c.lineWidth=3;c.beginPath();c.moveTo(back[0],back[1]);c.lineTo(tx,ty);c.stroke();
  // 手臂：从肩膀拉住杆尾（肩膀跟着身体后仰）
  const shp=new DOMPoint(4,-22).matrixTransform(Fm);
  c.lineWidth=5;c.beginPath();c.moveTo(shp.x,shp.y);c.quadraticCurveTo((shp.x+back[0])/2,(shp.y+back[1])/2-6,back[0],back[1]);c.stroke();
  // 罾：两道弯竹 + 网兜
  const CL=[tx-NETW,ty+RIMD],CR=[tx+NETW,ty+RIMD];c.lineWidth=3;c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(tx-44,ty+14,CL[0],CL[1]);c.moveTo(tx,ty);c.quadraticCurveTo(tx+44,ty+14,CR[0],CR[1]);c.stroke();
  const bag=bag3(t,CL,CR);
  c.save();c.beginPath();c.moveTo(CL[0],CL[1]);bag.forEach(q=>c.lineTo(q[0],q[1]));c.closePath();c.clip();meshLines(c,tx,CL[1]);c.restore();
  c.lineWidth=2.4;c.beginPath();c.moveTo(CL[0],CL[1]);bag.forEach(q=>c.lineTo(q[0],q[1]));c.stroke();c.lineWidth=2;c.beginPath();c.moveTo(CL[0],CL[1]);c.lineTo(CR[0],CR[1]);c.stroke();
  // 网出水：往下滴水
  const r=rng(377);const wet=smooth(36.55,36.75,t)*(1-smooth(37.6,38.2,t));if(wet>0){for(let i=0;i<16;i++){const ph=((t*1.7+r())%1);const x=lerp(CL[0]+10,CR[0]-10,r());const y0=bag[Math.round(clamp((x-CL[0])/(CR[0]-CL[0]))*20)][1];const yy=y0+ph*ph*110;if(yy<WATER3){c.globalAlpha=wet*(1-ph*0.5);c.beginPath();c.ellipse(x,yy,0.9,1.8+ph*2,0,0,7);c.fill();}}c.globalAlpha=1;}
  // 扑腾：甩出的水珠
  for(const t0 of [T3F1,T3F2]){const d=t-t0;if(d>0&&d<0.6){const r2=rng(380+t0*10|0);const fy=scoopY(t0)-6;for(let i=0;i<9;i++){const a=-Math.PI*(0.1+0.8*r2());const sp=50+r2()*70;const xx=H3[0]-30+r2()*60+Math.cos(a)*sp*d,yy=fy+Math.sin(a)*sp*d+160*d*d;c.globalAlpha=1-d/0.6;c.beginPath();c.arc(xx,yy,1+r2()*1.3,0,7);c.fill();}c.globalAlpha=1;}}
  // 跳回水里：水花 + 涟漪
  const S=splash3();const sd=t-S.t;if(sd>0&&sd<1.4){const k=1-sd/1.4;c.lineWidth=1.7;for(const [r0,sc] of [[8,1],[18,0.7],[4,1.4]]){c.globalAlpha=k;c.beginPath();c.ellipse(S.x,WATER3,r0+sd*44*sc,(r0+sd*44*sc)*0.26,0,Math.PI,2*Math.PI);c.stroke();}
    const r3=rng(371);for(let i=0;i<14;i++){const a=-Math.PI*(0.12+0.76*r3());const sp=50+r3()*80;const xx=S.x+Math.cos(a)*sp*sd,yy=WATER3+Math.sin(a)*sp*sd+150*sd*sd;if(yy<WATER3+2){c.globalAlpha=k;c.beginPath();c.arc(xx,yy,1.2+r3()*1.6,0,7);c.fill();}}c.globalAlpha=1;}}
// 网兜的形状：自然下垂；鱼躺在里面时那里被压得更深，落下时弹一下
function bag3(t,CL,CR){const out=[];const inBag=t>T3C&&t<T3JUMP+0.05;const hp=hop3(t)+1.6*toss3(t);const land=Math.max(bmp(t,T3C+0.36,0.22),bmp(t,T3F1+0.36,0.25),bmp(t,T3F2+0.36,0.25));const fx=fishX3(Math.min(t,T3JUMP));
  for(let i=0;i<=20;i++){const v=i/20;const x=lerp(CL[0],CR[0],v);let y=lerp(CL[1],CR[1],v)+SAG*Math.pow(Math.sin(Math.PI*v),0.45);if(inBag)y+=(5-hp*0.15+5*land)*Math.exp(-Math.pow((x-fx)/26,2));out.push([x,y]);}return out;}
function meshLines(c,tx,y0){c.lineWidth=1.5;for(let k=-8;k<=8;k++){const x0=tx+k*11;c.beginPath();c.moveTo(x0-34,y0-6);c.lineTo(x0+34,y0+40);c.stroke();c.beginPath();c.moveTo(x0+34,y0-6);c.lineTo(x0-34,y0+40);c.stroke();}}
const RUBC=mk(W,H),rctx=RUBC.getContext('2d');
function drawS3Panel(t,cam,TR){const x0=S3X-S3W/2,y0=S3Y-S3H/2;panelShadow(x0,y0,S3W,S3H);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S3W,S3H);ctx.clip();
  ctx.fillStyle='#ebe6da';ctx.fillRect(x0,y0,S3W,S3H);ctx.globalAlpha=0.5;ctx.drawImage(LINEN,0,0,1200,800,x0,y0,S3W,S3H);ctx.globalAlpha=1;
  ctx.drawImage(RUBBG,S3X-RUBW/2,S3Y-RUBH/2,RUBW,RUBH);
  // 黑：静物 + 会动的罾，一起上拓片的墨色
  layerBegin(rctx,TR);rctx.translate(S3X,S3Y);hanStatic(rctx,t);hanDynamic(rctx,t);
  rctx.setTransform(...TR);rctx.globalCompositeOperation='destination-out';rctx.drawImage(RUBTEX,S3X-RUBW/2,S3Y-RUBH/2,RUBW,RUBH);
  layerColor(rctx,`rgb(${INK3})`);blitLayer(RUBC,0.94);
  // 藏印
  stampSeal(ctx,SEAL_HAN,S3X+245,S3Y+128,24,0.85,0.02);
  ctx.restore();
  ctx.strokeStyle='rgba(70,60,45,0.3)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S3W,S3H);}
const SEAL_HAN=mkSeal({chars:['水','千'],cols:1,rows:2,aspect:1.7,type:'zhu',size:200,seed:17});
function styleHan(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}drawHanFish(hctx,p);
  if(t>T3C&&t<T3JUMP+0.03){const [tx,ty]=NETTIP(t);const CL=[tx-NETW,ty+RIMD],CR=[tx+NETW,ty+RIMD];const bag=bag3(t,CL,CR);
    hctx.save();hctx.translate(S3X,S3Y);hctx.beginPath();hctx.moveTo(CL[0],CL[1]);bag.forEach(q=>hctx.lineTo(q[0],q[1]));hctx.closePath();hctx.clip();
    hctx.globalCompositeOperation='destination-out';hctx.strokeStyle='#000';hctx.globalAlpha=0.85;meshLines(hctx,tx,CL[1]);hctx.lineWidth=1.6;hctx.beginPath();hctx.moveTo(CL[0],CL[1]);hctx.lineTo(CR[0],CR[1]);hctx.stroke();hctx.restore();}
  hctx.setTransform(...TR);hctx.globalCompositeOperation='destination-out';hctx.globalAlpha=0.9;hctx.fillStyle=ctx.createPattern(RUBTEX,'repeat');
  const pt=hctx.fillStyle;pt.setTransform(new DOMMatrix([1/MS3,0,0,1/MS3,0,0]));hctx.fillRect(-30000,-3000,60000,6000);hctx.globalAlpha=1;
  layerColor(hctx,`rgb(${INK3})`);blitLayer(HEROC,0.94);}

// ---------------- 叁 的登记 ----------------
STN.push({key:'s3',cx:S3X,hw:S3W/2,x0:-1720,x1:-960,draw:drawS3Panel,style:styleHan,owns:t=>t>=T3C-0.12&&t<=T3OWN1,drawHero:(t,cam,TR,p)=>styleHan(t,cam,TR,heroPoseS3(t),null)});
LABELS.push([S3X,S3W,S3H,'叁','捕鱼画像石 · 拓片','东汉']);
LIGHTS.push({x:S3X,y:-10,r:640,k:t=>smooth(31.6,33.8,t)});
GK.push([33.7,S3X+300,50],[34.6,S3X+222,58],[35.3,S3X+142,52],[35.9,S3X+88,46],[36.3,S3X+53,44],[T3C,S3X+34,44],[36.8,S3X+12,44],[37.3,S3X+18,44],[T3JUMP,S3X+24,44],
  [38.55,S3X+30,-40],[38.8,S3X+5,30],[T3ENT,S3X-18,86],[39.2,S3X-40,100],[39.45,S3X-82,104],[39.9,S3X-150,94],[40.4,S3X-235,76],[40.85,S3X-325,58],[41.3,S3X-400,48]);
HL.push([33.0,124],[34.4,90],[35.4,72],[39.4,72],[40.6,112]);
CK.push({t:34.4,x:S3X+60,y:10,z:1.45,f:0.4,ox:-40},{t:35.6,x:S3X+30,y:12,z:1.75},{t:38.2,x:S3X+20,y:6,z:1.8},{t:39.4,x:S3X-60,y:10,z:1.55,f:0.3,ox:-60},{t:40.6,z:1.2,f:1,ox:-150,oy:-10});
