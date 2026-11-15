// ================= 玖 · 剪纸「双鱼」（民间，仿） =================
// 红纸对折。主角钻进纸下面，剪刀先沿着它的轮廓走一圈，再从头到尾把眼、鳃、鳞、鳍条一刀刀剪出来，碎纸屑往下掉；
// 余纸落下，纸展开成一对双鱼，停一会儿让人看清；然后右边那条——主角——从纸上揭起来飞走
const S9X=-5270,S9Y=0,S9W=420,AR9=55;
const T9IN=110.3,T9CUT=[111.0,112.1],T9DET=[112.15,113.1],T9DROP=[113.15,113.65],T9OPEN=[113.75,114.65],T9LIFT=116.0;
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
// 鱼身上所有的刀口，各带一个“在鱼身上多靠后”的位置 u：细剪的时候剪刀从头扫到尾，扫到哪儿哪儿的刀口就出来
function cutList9(p){const pr=PROF_CUT,L=p.L,out=[];
  const ey=bodyAt(p,pr,0.085,0.3);out.push({k:'eye',u:0.085,c:ey,r:0.027*L});
  // 鳃：一道弯的长刀口
  {const g0=bodyAt(p,pr,0.19,0.78),g2=bodyAt(p,pr,0.19,-0.74),g1=bodyAt(p,pr,0.235,0);const m=[(g0[0]+g2[0])/2,(g0[1]+g2[1])/2];const l=Math.hypot(g2[0]-g0[0],g2[1]-g0[1])||1;
   const nx=-(g2[1]-g0[1])/l,ny=(g2[0]-g0[0])/l;const kv=((g1[0]-m[0])*nx+(g1[1]-m[1])*ny)/l;out.push({k:'slit',u:0.2,a:g0,b:g2,w:0.012*L,kv,c:g1});}
  // 鳞：三排月牙，错开半格
  for(const v of [0.46,0.0,-0.46])for(let u=0.3;u<0.77;u+=0.075){const uu=u+(v===0?0.037:0);if(uu>0.76)continue;const q=bodyAt(p,pr,uu,v);const sa=spineAt(p,uu);out.push({k:'cres',u:uu,c:q,r:0.032*L,ang:Math.atan2(-sa.ty,-sa.tx),th:0.34});}
  // 鳍上的鳍条
  for(const [f,d,u0,u1] of FINS9(p,pr).map((F,i)=>[F[0],F[1],[0.26,0.3,0.6][i],[0.6,0.4,0.72][i]]))for(let i=3;i<f.base.length-2;i+=3){const a=f.base[i],o=f.out[i];
    const A=[lerp(a[0],o[0],0.18),lerp(a[1],o[1],0.18)],B=[lerp(a[0],o[0],0.66),lerp(a[1],o[1],0.66)];out.push({k:'slit',u:lerp(u0,u1,i/(f.base.length-1)),a:A,b:B,w:0.006*L,kv:0,c:B});}
  // 尾上的刀口：从尾柄放射出去，剪到离边一点就停
  {const F=tail9(p,pr).F;for(const g of [0.13,0.065,0,-0.065,-0.13]){const A=F(0.03,g*0.2),B=F(0.155-Math.abs(g)*0.25,g*1.15);out.push({k:'slit',u:0.9+0.02*Math.abs(g)/0.13,a:A,b:B,w:0.006*L,kv:0,c:B});}}
  return out.sort((x,y)=>x.u-y.u);}
// us：剪刀扫到了鱼身的哪儿（不给就是全部剪完）
function paperCuts(c,p,us){c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';
  for(const q of cutList9(p)){const g=us===undefined?1:clamp((us-q.u)/0.03);if(g<=0)continue;const e=1-(1-g)*(1-g);
    if(q.k==='eye'){c.beginPath();c.arc(q.c[0],q.c[1],q.r*e,0,7);c.fill();}
    else if(q.k==='cres')crescent9(c,q.c[0],q.c[1],q.r*(0.55+0.45*e),q.ang,q.th*e);
    else slit9(c,q.a,[lerp(q.a[0],q.b[0],e),lerp(q.a[1],q.b[1],e)],q.w,q.kv);}
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
const US9=t=>lerp(0.03,1.04,clamp((t-T9DET[0])/(T9DET[1]-T9DET[0])));   // 细剪时剪刀扫到鱼身的哪儿
function drawPaper9(t,cam,TR){const z=cam.z;const cut=clamp((t-T9CUT[0])/(T9CUT[1]-T9CUT[0])),det=t>=T9DET[0],drop=smooth(T9DROP[0],T9DROP[1],t),open=smooth(T9OPEN[0],T9OPEN[1],t),lifted=t>=T9LIFT;
  if(!POSE9)POSE9=fishPose(HERO,T9LIFT-0.05);
  const half=(c,withFish)=>{c.save();c.beginPath();c.rect(S9X,S9Y-400,400,800);c.clip();c.fillStyle=RED9;frameHalf(c);if(withFish){paperSil(c,POSE9);if(drop>0.02||open>0)paperCuts(c,POSE9);c.globalCompositeOperation='source-over';}c.restore();};
  layerBegin(c9,TR);
  // 折着的纸：先是一整张，剪完以后余纸落下
  if(drop<1){c9.save();c9.globalAlpha=1-drop;c9.translate(0,drop*drop*60);c9.fillStyle=RED9;c9.beginPath();c9.rect(S9X,S9Y-150,130,300);c9.fill();
    c9.globalCompositeOperation='destination-out';c9.translate(0,-drop*drop*60);c9.globalAlpha=1;half(c9,true);c9.restore();}
  half(c9,!lifted);
  // 细剪：纸还折着，刀口一个个打穿
  if(det&&drop<=0.02)paperCuts(c9,POSE9,US9(t));
  // 展开的另一半：绕折线翻过来；翻平以后轻轻弹一下才服帖
  const dq=t-T9OPEN[1],wob=dq>0?0.06*Math.exp(-5.5*dq)*Math.abs(Math.sin(9*dq)):0;
  if(open>0){const sx=Math.cos(Math.PI*(1-open))-wob;c9.save();c9.translate(S9X,0);c9.scale(sx,1);c9.translate(-S9X,0);c9.save();c9.translate(2*S9X,0);c9.scale(-1,1);half(c9,true);c9.restore();c9.restore();}
  c9.setTransform(...TR);c9.globalCompositeOperation='source-atop';c9.globalAlpha=0.6;const pt=c9.createPattern(PAPERTEX,'repeat');c9.fillStyle=pt;c9.fillRect(S9X-200,-200,400,400);c9.globalAlpha=1;
  if(open>0&&(open<1||wob>0.002)){const sx=Math.cos(Math.PI*(1-open))-wob;c9.fillStyle=`rgba(40,0,0,${0.35*(1-Math.abs(sx))})`;c9.fillRect(S9X-130*Math.max(0,sx),-160,130*Math.abs(sx),320);}
  c9.globalCompositeOperation='source-over';
  // 剪刀走过的线：沿鱼的轮廓
  if(cut>0&&drop<1){const e=edges(POSE9,PROF_CUT);const pts=e.top.concat(e.bot.slice().reverse());const n=Math.floor(pts.length*cut);const trace=()=>{c9.beginPath();for(let i=0;i<n;i++)i?c9.lineTo(pts[i][0],pts[i][1]):c9.moveTo(pts[i][0],pts[i][1]);c9.stroke();};c9.lineJoin='round';
    c9.save();c9.translate(0.5,0.7);c9.strokeStyle=`rgba(70,0,0,${0.55*(1-drop)})`;c9.lineWidth=1.8;trace();c9.restore();c9.strokeStyle=`rgba(255,238,224,${0.92*(1-drop)})`;c9.lineWidth=1.4;trace();
    if(n>0&&cut<1){const q=pts[n-1];c9.fillStyle='rgba(255,250,240,0.95)';c9.beginPath();c9.arc(q[0],q[1],2.2,0,7);c9.fill();}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.35;ctx.filter=`brightness(0) blur(${(2.5*z).toFixed(1)}px)`;ctx.drawImage(C9,-2*z,4*z);ctx.restore();
  blitLayer(C9,1);
  // 细剪掉下来的碎纸屑：每剪出一个月牙，就有一小片往下掉、转着、淡掉
  if(det&&t<T9DET[1]+0.7){const span=T9DET[1]-T9DET[0];ctx.save();ctx.setTransform(...TR);
    cutList9(POSE9).forEach((q,i)=>{if(q.k==='slit'&&i%2)return;const d=t-(T9DET[0]+(q.u-0.03)/1.01*span)-0.03;if(d<=0||d>0.62)return;const h=((i*37)%17)/17-0.5,r=(q.r||5)*0.8;
      ctx.save();ctx.translate(q.c[0]+h*26*d,q.c[1]+10*d+150*d*d);ctx.rotate((q.ang||0)+h*9*d);ctx.globalAlpha=1-smooth(0.34,0.62,d);
      ctx.fillStyle='rgba(60,0,0,0.25)';ctx.beginPath();ctx.ellipse(0.6,1.2,r,r*0.42,0,0,7);ctx.fill();ctx.fillStyle=h>0?'rgb(206,44,44)':'rgb(176,24,30)';ctx.beginPath();ctx.ellipse(0,0,r,r*0.42*Math.abs(Math.cos(d*11+i)),0,0,7);ctx.fill();ctx.restore();});
    ctx.restore();}
  // 剪刀：先沿轮廓走一圈（刀尖跟着剪痕），再从鱼头扫到鱼尾细剪；每“咔”一声合一次
  const sa=smooth(T9CUT[0]-0.3,T9CUT[0]-0.05,t)*(1-smooth(T9DET[1]+0.02,T9DET[1]+0.32,t));
  if(sa>0.003){const e=edges(POSE9,PROF_CUT);const pts=e.top.concat(e.bot.slice().reverse());const n=Math.max(1,Math.floor(pts.length*cut));const q=pts[n-1],q0=pts[Math.max(0,n-7)];
    let x=q[0],y=q[1],ang=n>1?Math.atan2(q[1]-q0[1],q[0]-q0[0]):Math.atan2(pts[3][1]-pts[0][1],pts[3][0]-pts[0][0]);
    if(t>T9CUT[1]){// 细剪：刀尖沿脊线从头到尾，左右来回够着两边的鳞
      const us=clamp(US9(t)),sp=spineAt(POSE9,us),side=Math.sin((t-T9DET[0])*19)*0.07*POSE9.L*(us<0.8?1:0.4);const k=smooth(T9CUT[1],T9DET[0]+0.08,t);
      const sp2=spineAt(POSE9,Math.min(1,us+0.06)),sp1=spineAt(POSE9,Math.max(0,us-0.06));const a2=Math.atan2(sp2.y-sp1.y,sp2.x-sp1.x);x=lerp(x,sp.x+sp.nx*side,k);y=lerp(y,sp.y+sp.ny*side,k);ang=ang+Math.atan2(Math.sin(a2-ang),Math.cos(a2-ang))*k;}
    const away=smooth(T9DET[1],T9DET[1]+0.32,t),pre=1-smooth(T9CUT[0]-0.3,T9CUT[0],t);
    const ph=(((t-T9CUT[0]-0.05)/0.1)%1+1)%1,busy=(cut>0&&cut<1)||(t>=T9DET[0]&&t<T9DET[1]),op=busy?0.46*Math.pow(Math.sin(Math.PI*ph),0.7):0.34;
    layerBegin(c9,TR);scissors9(c9,x+26*away+18*pre,y-30*away-22*pre,ang,op);
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
  if(t>=T9IN&&t<T9DROP[1]){ctx.setTransform(...TR);const p=heroPoseNow(t);splitStyle(t,cam,TR,p,[S9X,-3000,30000,6000],PAPER9_PATH,Infinity,styleNianPlain,null);}   // 纸底下那一截不用画：纸盖着；剪出来的刀口里透出来的是墙
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
LIGHTS.push({x:S9X,y:-10,r:600,k:t=>smooth(108.2,110.2,t)});
{const P=(deg)=>arcPt9(deg);GK.push([110.2,S9X+170,40],[110.55,S9X+100,62],[110.75,S9X+60,62],[110.9,...P(60)],[111.05,...P(30)],[111.2,...P(0)],[111.35,...P(-30)],[111.5,...P(-60)],[111.65,...P(-80)],
  [112.6,...P(-80.3)],[113.7,...P(-80.6)],[114.9,...P(-80.9)],[T9LIFT,...P(-81.2)],[T9LIFT+0.15,...P(-95)],[T9LIFT+0.32,...P(-118)],[T9LIFT+0.55,S9X-62,S9Y-52],[T9LIFT+0.9,S9X-128,S9Y-42],[T9LIFT+1.35,S9X-205,S9Y-30],[T9LIFT+1.9,S9X-290,S9Y-18]);}
HL.push([109.6,150],[110.5,150]);
HAMP.push(t=>(1-0.95*smooth(111.6,111.8,t)*(1-smooth(T9LIFT-0.05,T9LIFT+0.1,t)))*(1+1.2*smooth(T9LIFT,T9LIFT+0.2,t)*(1-smooth(T9LIFT+1.5,T9LIFT+2.5,t))));
HFB.push(t=>1.6*smooth(T9LIFT,T9LIFT+0.2,t)*(1-smooth(T9LIFT+1.6,T9LIFT+2.6,t)));
// 镜头：剪的时候凑近看折着的那半张纸；展开时退后，把整幅双鱼留在画面中间
CK.push({t:110.0,x:S9X+70,y:0,z:1.5,f:0.4,ox:-40},{t:111.0,x:S9X+22,y:0,z:2.1},{t:112.2,x:S9X+44,y:2,z:2.7},{t:113.2,x:S9X+46,y:2,z:2.78},{t:114.5,x:S9X-4,y:0,z:2.3},{t:115.9,x:S9X-6,y:0,z:2.38},{t:116.9,x:S9X-80,y:-20,z:1.6,f:0.4,ox:-60});
