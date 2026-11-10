// ================= 玖 · 剪纸「双鱼」（民间，仿） =================
// 红纸对折。主角钻进纸下面，剪刀沿着它的轮廓走一圈，余纸落下，纸展开成一对双鱼；右边那条——主角——从纸上揭起来飞走，纸上只剩一个鱼形的空洞
const S9X=-5270,S9Y=0,S9W=420,AR9=55;
const T9IN=108.7,T9CUT=[109.4,110.3],T9DROP=[110.3,110.75],T9OPEN=[110.8,111.65],T9LIFT=112.0;
const RED9='rgb(196,30,34)';
function arcPt9(deg){const a=deg*Math.PI/180;return[S9X+AR9*Math.cos(a),S9Y+AR9*Math.sin(a)];}
// 剪纸鱼：一整张红纸剪出来。锯齿只剪在鳍和尾的外缘，身上的纹都是两头尖的小刀口（月牙、短线），
// 不把纸剪断，所以鱼是完整的一片；尾巴按尾柄那一段的走向搭一个自己的小坐标，身子弯得再厉害也不会拧碎
const PROF_CUT=mkProf(0.16,0.15,0.5,0.62,0.24);
function tail9(p,pr){const L=p.L,a=spineAt(p,0.72),b=spineAt(p,1);let tx=b.x-a.x,ty=b.y-a.y;const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;let nx=-ty,ny=tx;const s8=spineAt(p,0.8);if(nx*s8.nx+ny*s8.ny<0){nx=-nx;ny=-ny;}
  const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);const o=[(bt[0]+bb[0])/2,(bt[1]+bb[1])/2];return{bt,bb,F:(f,g)=>[o[0]+tx*f*L+nx*g*L,o[1]+ty*f*L+ny*g*L]};}
function qPts(a,c,b,n){const out=[];for(let i=0;i<=n;i++){const v=i/n,w=1-v;out.push([w*w*a[0]+2*w*v*c[0]+v*v*b[0],w*w*a[1]+2*w*v*c[1]+v*v*b[1]]);}return out;}
// 沿一段边剪锯齿：奇数点沿边的法线往里收一点
function sawEdge(c,pts,center,depth){for(let i=0;i<pts.length;i++){const q=pts[i];if(i%2&&i<pts.length-1){const a=pts[i-1],b=pts[i+1];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if((center[0]-q[0])*nx+(center[1]-q[1])*ny<0){nx=-nx;ny=-ny;}c.lineTo(q[0]+nx*depth,q[1]+ny*depth);}else c.lineTo(q[0],q[1]);}}
function tailPath9(c,p,pr){const L=p.L,T=tail9(p,pr),F=T.F;const U=F(0.21,0.22),N=F(0.12,0),D=F(0.21,-0.22),ctr=F(0.1,0);
  const up=qPts(U,F(0.15,0.09),N,10),dn=qPts(N,F(0.15,-0.09),D,10).slice(1);
  c.moveTo(T.bt[0],T.bt[1]);qPts(T.bt,F(0.06,0.12),U,8).slice(1).forEach(q=>c.lineTo(q[0],q[1]));sawEdge(c,up.slice(1),ctr,0.018*L);sawEdge(c,dn,ctr,0.018*L);
  qPts(D,F(0.06,-0.12),T.bb,8).slice(1).forEach(q=>c.lineTo(q[0],q[1]));c.closePath();}
function finSaw9(c,f,depth){const n=f.out.length;c.moveTo(f.base[0][0],f.base[0][1]);
  for(let i=0;i<n-1;i++){const a=f.out[i],b=f.out[i+1],ba=f.base[i],bb=f.base[i+1];c.lineTo(a[0],a[1]);if(depth>0){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],mb=[(ba[0]+bb[0])/2,(ba[1]+bb[1])/2];c.lineTo(lerp(m[0],mb[0],depth),lerp(m[1],mb[1],depth));}}
  c.lineTo(f.out[n-1][0],f.out[n-1][1]);for(let i=n-1;i>=0;i--)c.lineTo(f.base[i][0],f.base[i][1]);c.closePath();}
const FINS9=(p,pr)=>[[finPts(p,pr,0.26,0.6,0.12,1,1.0),0.3],[finPts(p,pr,0.3,0.4,0.085,-1,1.6),0],[finPts(p,pr,0.6,0.72,0.075,-1,1.4),0.28]];
function paperSil(c,p){const pr=PROF_CUT;bodyFill(c,edges(p,pr));c.fill();c.beginPath();tailPath9(c,p,pr);c.fill();for(const [f,d] of FINS9(p,pr)){c.beginPath();finSaw9(c,f,d);c.fill();}}
// 一道两头尖的刀口（a→b，中间最宽 w；k 让它弯一点）
function slit9(c,a,b,w,k=0){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,mx=(a[0]+b[0])/2+nx*k*l,my=(a[1]+b[1])/2+ny*k*l;
  c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(mx+nx*w,my+ny*w,b[0],b[1]);c.quadraticCurveTo(mx-nx*w,my-ny*w,a[0],a[1]);c.fill();}
// 月牙：外弧和内弧在两头收成尖
function crescent9(c,cx,cy,r,ang,th){c.beginPath();const K=10;for(let i=0;i<=K;i++){const a=ang-1.05+2.1*i/K;c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}
  for(let i=K;i>=0;i--){const a=ang-1.05+2.1*i/K,rr=r*(1-th*Math.sin(Math.PI*i/K));c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.closePath();c.fill();}
function paperCuts(c,p){const pr=PROF_CUT,L=p.L;c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';
  const ey=bodyAt(p,pr,0.085,0.3);c.beginPath();c.arc(ey[0],ey[1],0.027*L,0,7);c.fill();
  // 鳃：一道弯的长刀口
  {const g0=bodyAt(p,pr,0.19,0.78),g2=bodyAt(p,pr,0.19,-0.74),g1=bodyAt(p,pr,0.235,0);const m=[(g0[0]+g2[0])/2,(g0[1]+g2[1])/2];const l=Math.hypot(g2[0]-g0[0],g2[1]-g0[1])||1;
   const nx=-(g2[1]-g0[1])/l,ny=(g2[0]-g0[0])/l;const k=((g1[0]-m[0])*nx+(g1[1]-m[1])*ny)/l;slit9(c,g0,g2,0.012*L,k);}
  // 鳞：三排月牙，错开半格
  for(const v of [0.46,0.0,-0.46])for(let u=0.3;u<0.77;u+=0.075){const uu=u+(v===0?0.037:0);if(uu>0.76)continue;const q=bodyAt(p,pr,uu,v);const s=spineAt(p,uu);const ang=Math.atan2(-s.ty,-s.tx);crescent9(c,q[0],q[1],0.032*L,ang,0.34);}
  // 鳍上的鳍条
  for(const [f] of FINS9(p,pr))for(let i=3;i<f.base.length-2;i+=3){const a=f.base[i],o=f.out[i];slit9(c,[lerp(a[0],o[0],0.18),lerp(a[1],o[1],0.18)],[lerp(a[0],o[0],0.66),lerp(a[1],o[1],0.66)],0.006*L);}
  // 尾上的刀口：从尾柄放射出去，剪到离边一点就停
  {const F=tail9(p,pr).F;for(const g of [0.13,0.065,0,-0.065,-0.13])slit9(c,F(0.03,g*0.2),F(0.155-Math.abs(g)*0.25,g*1.15),0.006*L);}
  c.restore();}
function mirrorPose(p,ax){return{...p,sp:p.sp.map(q=>({x:2*ax-q.x,y:q.y,nx:-q.nx,ny:q.ny}))};}
// 右半边的纹样（鱼以外）：外圈、顶上的花、底下的浪、连到鱼背的水草
function frameHalf(c){c.fillStyle=RED9;c.strokeStyle=RED9;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.arc(S9X,S9Y,126,-Math.PI/2,Math.PI/2);c.arc(S9X,S9Y,117,Math.PI/2,-Math.PI/2,true);c.closePath();c.fill();
  c.lineWidth=5;c.beginPath();c.moveTo(S9X,S9Y-117);c.lineTo(S9X,S9Y-86);c.stroke();
  for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*0.62;if(Math.cos(a)<-0.05)continue;c.beginPath();c.ellipse(S9X+Math.cos(a)*10,S9Y-76+Math.sin(a)*10,9,5.5,a,0,7);c.fill();}c.beginPath();c.arc(S9X,S9Y-76,6,-Math.PI/2,Math.PI/2);c.fill();
  for(let j=0;j<3;j++){const y0=S9Y+80+j*12;c.beginPath();c.moveTo(S9X,y0);for(let x=0;x<=118;x+=4)c.lineTo(S9X+x,y0+4*Math.sin(x*0.13+j*1.4));c.lineWidth=4.2;c.stroke();}
  c.lineWidth=4;for(const [a0,a1] of [[-38,-30],[2,6],[38,34]]){const p0=[S9X+118*Math.cos(a0*Math.PI/180),S9Y+118*Math.sin(a0*Math.PI/180)],p1=[S9X+86*Math.cos(a1*Math.PI/180),S9Y+86*Math.sin(a1*Math.PI/180)];
    c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo((p0[0]+p1[0])/2+6,(p0[1]+p1[1])/2-6,p1[0],p1[1]);c.stroke();}}
const PAPERTEX=(()=>{const c=mk(256,256);const x=c.getContext('2d');const r=rng(931);for(let i=0;i<2600;i++){x.fillStyle=`rgba(${r()<.5?255:60},${r()<.5?220:20},${r()<.5?200:20},${0.04+r()*0.06})`;x.fillRect(r()*256,r()*256,1+r()*2,1);}return c;})();
const C9=mk(W,H),c9=C9.getContext('2d');
let POSE9=null;
function drawPaper9(t,cam,TR){const z=cam.z;const cut=smooth(T9CUT[0],T9CUT[1],t),drop=smooth(T9DROP[0],T9DROP[1],t),open=smooth(T9OPEN[0],T9OPEN[1],t),lifted=t>=T9LIFT;
  if(!POSE9)POSE9=fishPose(HERO,T9LIFT-0.05);
  const half=(c,withFish)=>{c.save();c.beginPath();c.rect(S9X,S9Y-400,400,800);c.clip();c.fillStyle=RED9;frameHalf(c);if(withFish){paperSil(c,POSE9);if(drop>0.02||open>0)paperCuts(c,POSE9);c.globalCompositeOperation='source-over';}c.restore();};
  layerBegin(c9,TR);
  // 折着的纸：先是一整张，剪完以后余纸落下
  if(drop<1){c9.save();c9.globalAlpha=1-drop;c9.translate(0,drop*drop*60);c9.fillStyle=RED9;c9.beginPath();c9.rect(S9X,S9Y-150,130,300);c9.fill();
    c9.globalCompositeOperation='destination-out';c9.translate(0,-drop*drop*60);c9.globalAlpha=1;half(c9,true);c9.restore();}
  half(c9,!lifted);
  // 展开的另一半：绕折线翻过来
  if(open>0){const sx=Math.cos(Math.PI*(1-open));c9.save();c9.translate(S9X,0);c9.scale(sx,1);c9.translate(-S9X,0);c9.save();c9.translate(2*S9X,0);c9.scale(-1,1);half(c9,true);c9.restore();c9.restore();}
  c9.setTransform(...TR);c9.globalCompositeOperation='source-atop';c9.globalAlpha=0.6;const pt=c9.createPattern(PAPERTEX,'repeat');c9.fillStyle=pt;c9.fillRect(S9X-200,-200,400,400);c9.globalAlpha=1;
  if(open>0&&open<1){const sx=Math.cos(Math.PI*(1-open));c9.fillStyle=`rgba(40,0,0,${0.35*(1-Math.abs(sx))})`;c9.fillRect(S9X-130*Math.max(0,sx),-160,130*Math.abs(sx),320);}
  c9.globalCompositeOperation='source-over';
  // 剪刀走过的线：沿鱼的轮廓
  if(cut>0&&drop<1){const e=edges(POSE9,PROF_CUT);const pts=e.top.concat(e.bot.slice().reverse());const n=Math.floor(pts.length*cut);const trace=()=>{c9.beginPath();for(let i=0;i<n;i++)i?c9.lineTo(pts[i][0],pts[i][1]):c9.moveTo(pts[i][0],pts[i][1]);c9.stroke();};c9.lineJoin='round';
    c9.save();c9.translate(0.5,0.7);c9.strokeStyle=`rgba(70,0,0,${0.55*(1-drop)})`;c9.lineWidth=1.8;trace();c9.restore();c9.strokeStyle=`rgba(255,238,224,${0.92*(1-drop)})`;c9.lineWidth=1.4;trace();
    if(n>0&&cut<1){const q=pts[n-1];c9.fillStyle='rgba(255,250,240,0.95)';c9.beginPath();c9.arc(q[0],q[1],2.2,0,7);c9.fill();}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.35;ctx.filter=`brightness(0) blur(${(2.5*z).toFixed(1)}px)`;ctx.drawImage(C9,-2*z,4*z);ctx.restore();
  blitLayer(C9,1);
  // 剪刀：刀尖跟着剪痕走，每“咔”一声合一次
  const sa=smooth(T9CUT[0]-0.3,T9CUT[0]-0.05,t)*(1-smooth(T9CUT[1]+0.05,T9CUT[1]+0.35,t));
  if(sa>0.003){const e=edges(POSE9,PROF_CUT);const pts=e.top.concat(e.bot.slice().reverse());const n=Math.max(1,Math.floor(pts.length*cut));const q=pts[n-1],q0=pts[Math.max(0,n-7)];
    let ang=n>1?Math.atan2(q[1]-q0[1],q[0]-q0[0]):Math.atan2(pts[3][1]-pts[0][1],pts[3][0]-pts[0][0]);
    const away=smooth(T9CUT[1],T9CUT[1]+0.35,t),pre=1-smooth(T9CUT[0]-0.3,T9CUT[0],t);
    const ph=(((t-109.45)/0.1)%1+1)%1,op=cut>0&&cut<1?0.46*Math.pow(Math.sin(Math.PI*ph),0.7):0.34;
    layerBegin(c9,TR);scissors9(c9,q[0]+26*away+18*pre,q[1]-30*away-22*pre,ang,op);
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.32*sa;ctx.filter=`brightness(0) blur(${(3*z).toFixed(1)}px)`;ctx.drawImage(C9,5*z,10*z);ctx.restore();blitLayer(C9,sa);}}
// 一把老式铁剪刀（张小泉式的大圆把手），刀尖在 (x,y)，沿 ang 方向
function scissors9(c,x,y,ang,open){c.save();c.translate(x,y);c.rotate(ang);c.translate(-21,0);c.lineCap='round';c.lineJoin='round';
  for(const sg of [1,-1]){c.save();c.rotate(sg*open/2);
    c.fillStyle='#2b2623';c.beginPath();c.moveTo(-2,-sg*0.8);for(let i=0;i<=12;i++){const u=i/12;c.lineTo(u*21,sg*(3.1*Math.pow(1-u,0.75)+0.2));}c.lineTo(21.4,0);c.lineTo(-2,-sg*0.4);c.closePath();c.fill();
    c.strokeStyle='rgba(235,228,220,0.28)';c.lineWidth=0.45;c.beginPath();c.moveTo(1.5,sg*1.5);c.lineTo(16,sg*0.55);c.stroke();
    c.strokeStyle='#2b2623';c.lineWidth=2.4;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-6,-sg*1.2,-10.5,-sg*3.6);c.stroke();
    c.lineWidth=2.2;c.beginPath();c.ellipse(-16.5,-sg*5.6,6.6,4.4,-sg*0.28,0,7);c.stroke();
    c.strokeStyle='rgba(235,228,220,0.18)';c.lineWidth=0.5;c.beginPath();c.ellipse(-16.5,-sg*5.6,7.3,5.1,-sg*0.28,Math.PI*1.1,Math.PI*1.7);c.stroke();c.restore();}
  c.fillStyle='#9a9088';c.beginPath();c.arc(0,0,1.2,0,7);c.fill();c.restore();}
function drawS9Panel(t,cam,TR){const x0=S9X-S9W/2,y0=S9Y-S9W/2;panelShadow(x0,y0,S9W,S9W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S9W,S9W);ctx.clip();ctx.drawImage(LINEN,0,0,840,840,x0,y0,S9W,S9W);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(238,232,220)';ctx.fillRect(x0,y0,S9W,S9W);ctx.globalCompositeOperation='source-over';ctx.restore();
  // 主角钻进纸下面：先画它，再盖上纸
  if(t>=T9IN&&t<T9DROP[1]){ctx.setTransform(...TR);const p=heroPoseNow(t);splitStyle(t,cam,TR,p,[S9X,-3000,30000,6000],PAPER9_PATH,Infinity,styleNianPlain,(t,cam,TR,p)=>paperFish(t,cam,TR,p,0.25));}
  ctx.setTransform(...TR);drawPaper9(t,cam,TR);
  ctx.strokeStyle='rgba(70,60,45,0.35)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S9W,S9W);}
// 飞起来的纸鱼：带影子，像纸一样扇动
function paperFish(t,cam,TR,p,lift,clip){const z=cam.z;layerBegin(c9,TR);if(clip){c9.beginPath();c9.rect(...clip);c9.clip();}c9.fillStyle=RED9;paperSil(c9,p);paperCuts(c9,p);
  c9.setTransform(...TR);c9.globalCompositeOperation='source-atop';c9.globalAlpha=0.6;c9.fillStyle=c9.createPattern(PAPERTEX,'repeat');c9.fillRect(p.sp[0].x-300,p.sp[0].y-300,600,600);c9.globalAlpha=1;
  const s=spineAt(p,0.4);const g=c9.createLinearGradient(s.x+s.nx*40,s.y+s.ny*40,s.x-s.nx*40,s.y-s.ny*40);g.addColorStop(0,'rgba(255,200,190,0.18)');g.addColorStop(1,'rgba(40,0,0,0.22)');c9.fillStyle=g;c9.fillRect(p.sp[0].x-300,p.sp[0].y-300,600,600);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.38;ctx.filter=`brightness(0) blur(${((1.5+5*lift)*z).toFixed(1)}px)`;ctx.drawImage(C9,(-2-8*lift)*z,(3+16*lift)*z);ctx.restore();blitLayer(C9,1);}
const PAPER9_PATH=c=>c.rect(S9X,S9Y-150,130,300);
function stylePaper(t,cam,TR,p,clip){paperFish(t,cam,TR,p,0.3+0.7*smooth(T9LIFT,T9LIFT+0.45,t),clip);}

// ---------------- 玖 的登记 ----------------
STN.push({key:'s9',cx:S9X,hw:S9W/2,x0:-5560,x1:-4980,draw:drawS9Panel,owns:t=>t>=T9IN&&t<T9LIFT,drawHero:()=>{},style:stylePaper});
LABELS.push([S9X,S9W,S9W,'玖','双鱼','民间剪纸']);
LIGHTS.push({x:S9X,y:-10,r:600,k:t=>smooth(106.6,108.6,t)});
{const P=(deg)=>arcPt9(deg);GK.push([108.6,S9X+170,40],[108.95,S9X+100,62],[109.15,S9X+60,62],[109.3,...P(60)],[109.45,...P(30)],[109.6,...P(0)],[109.75,...P(-30)],[109.9,...P(-60)],[110.05,...P(-80)],
  [111.0,...P(-80.6)],[T9LIFT,...P(-81.2)],[T9LIFT+0.15,...P(-95)],[T9LIFT+0.32,...P(-118)],[T9LIFT+0.55,S9X-62,S9Y-52],[T9LIFT+0.9,S9X-128,S9Y-42],[T9LIFT+1.35,S9X-205,S9Y-30],[T9LIFT+1.9,S9X-290,S9Y-18]);}
HL.push([108.0,150],[108.9,150]);
HAMP.push(t=>(1-0.95*smooth(110.0,110.2,t)*(1-smooth(T9LIFT-0.05,T9LIFT+0.1,t)))*(1+1.2*smooth(T9LIFT,T9LIFT+0.2,t)*(1-smooth(T9LIFT+1.5,T9LIFT+2.5,t))));
HFB.push(t=>1.6*smooth(T9LIFT,T9LIFT+0.2,t)*(1-smooth(T9LIFT+1.6,T9LIFT+2.6,t)));
CK.push({t:108.4,x:S9X+70,y:0,z:1.5,f:0.4,ox:-40},{t:109.4,x:S9X+10,y:0,z:2.05},{t:111.9,x:S9X-6,y:0,z:2.1},{t:112.9,x:S9X-80,y:-20,z:1.6,f:0.4,ox:-60});
