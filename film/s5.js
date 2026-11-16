// ================= 伍 · 磁州窑白地黑花枕（宋金，仿） =================
// 主角游进开光，慢慢停住。一支看不见的笔追上来，几笔把它画成：一按是头，一拖是身子（拖到后半截，笔里的墨不够了，
// 露出一道道飞白），几下点出鳍，最后两笔甩出尾巴；顺手撇出水草和水纹。再用针剔出白的鳃、鳞，最后点睛——鱼活了，游出去。
const S5X=-2590,S5Y=0,S5W=420,MS5=3;
const T5P=49.0;   // 主角的头碰到枕面（之后枕面里那部分先是一道淡影子）

// ---------- 时间：画鱼的时候，全片的钟慢慢停下来，画完再慢慢走 ----------
// 别的站全按原来的时间走；只有这一站用真实的钟（TNOW）。这样插进来的 D5 秒不会碰到后面任何一站的时间。
const W5R0=50.9,W5A=0.9,W5H=2.5,D5=W5A+W5H;     // 从 50.9 秒起用 0.9 秒慢下来，停 2.5 秒，再用 0.9 秒恢复：一共多出 3.4 秒
let TNOW=0,TREAL=0;                              // TREAL：真正的播放时间；TNOW：去掉前面两处停顿以后的时间（磁州窑这一站按它画）
// 前面再停两处（只按“原来的时间”标位置）：甲骨裂开以后、铜洗里三条鱼并排的时候。tau 是停住的那一刻，A 是慢下来/快起来各用多久，H 是停多久
const PAUSES=[{tau:30.625,A:0.35,H:0.5},{tau:44.9,A:0.35,H:0.75}];
const DE=PAUSES.reduce((s,p)=>s+p.A+p.H,0);
function rampI(u,A,H){if(u<A){const x=u/A;return A*(x*x*x-x*x*x*x/2);}if(u<A+H)return A/2+(u-A);const x=(u-A-H)/A;return A/2+H+A*(x-(x*x*x-x*x*x*x/2));}
function WE(r){let off=0;for(const P of PAUSES){const r0=P.tau-P.A/2+off,u=r-r0;if(u<=0)return r-off;if(u<2*P.A+P.H)return r-off-rampI(u,P.A,P.H);off+=P.A+P.H;}return r-off;}
function pauseReal(i){let off=0;for(let j=0;j<i;j++)off+=PAUSES[j].A+PAUSES[j].H;return PAUSES[i].tau-PAUSES[i].A/2+off;}   // 第 i 处停顿开始慢下来的真实时刻
function W5(r){if(r<=W5R0)return r;const u=r-W5R0;if(u>=2*W5A+W5H)return r-D5;let I;
  if(u<W5A){const x=u/W5A;I=W5A*(x*x*x-x*x*x*x/2);}else if(u<W5A+W5H)I=W5A/2+(u-W5A);else{const x=(u-W5A-W5H)/W5A;I=W5A/2+W5H+W5A*(x-(x*x*x-x*x*x*x/2));}
  return r-I;}
const T5HOLD=W5R0+W5A/2;                          // 停住的那一刻（原来的时间）：51.35
const T5R=51.0,T5LIVE=W5R0+W5A+W5H;               // 真实时间：第一笔落下；点睛完、鱼活过来（54.3）
const CAMHOOK=[];                                 // 镜头的附加量（真实时间）：停住的时候慢慢推近一点
CAMHOOK.push(r=>{const b=smooth(51.3,54.1,r)*(1-smooth(54.3,55.7,r));return[-3*b,1*b,1+0.075*b];});
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
// ---------- 枯笔：一笔由几十根笔毛组成；墨不够的笔毛先断，断开的地方露出白地，就是飞白 ----------
const INK5='rgba(24,18,13,0.97)',INK5T='rgba(74,52,32,0.7)';
const BRISTLES=new Map();
function bristles(seed,nb){const key=seed*100+nb;if(BRISTLES.has(key))return BRISTLES.get(key);const r=rng(seed);const out=[];
  for(let b=0;b<nb;b++){const a=[],j=[];for(let i=0;i<26;i++){a.push(r());j.push(r());}out.push({off:((b+0.5)/nb)*2-1+(r()-0.5)*1.1/nb,load:0.85+0.4*r(),a,j});}
  BRISTLES.set(key,out);return out;}
function nzA(a,v){const f=clamp(v)*24;const i=Math.min(23,Math.floor(f)),x=f-i;const s=x*x*(3-2*x);return a[i]+(a[i+1]-a[i])*s;}
// pts：笔走过的中线；wf(v)：v 处的笔宽；q：画到哪儿（0..1）；o：{seed,nb,d0 从哪儿开始干,dry 干得多快,edge 两边比中间先干多少,round 起笔是不是圆的,core 实心的那一层占多宽}
function dryStroke(c,pts,wf,q,o){if(q<=0)return;const n=pts.length;const mf=(n-1)*clamp(q);const m=Math.floor(mf);
  const P=[],V=[];for(let i=0;i<=m;i++){P.push(pts[i]);V.push(i/(n-1));}
  if(mf>m&&m<n-1){const a=mf-m,A=pts[m],B=pts[m+1];P.push([lerp(A[0],B[0],a),lerp(A[1],B[1],a)]);V.push(mf/(n-1));}
  if(P.length<2)return;const K=P.length;const N=[];
  for(let i=0;i<K;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(K-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;N.push([-dy/l,dx/l]);}
  const d0=o.d0??1,dry=o.dry??0,edge=o.edge??1,nb=o.nb||20,core=o.core??0.9;
  const band=(lo,hi,col)=>{c.fillStyle=col;c.beginPath();for(let i=0;i<K;i++){const w=wf(V[i])/2,x=P[i][0]+N[i][0]*w*lo(V[i]),y=P[i][1]+N[i][1]*w*lo(V[i]);i?c.lineTo(x,y):c.moveTo(x,y);}
    for(let i=K-1;i>=0;i--){const w=wf(V[i])/2;c.lineTo(P[i][0]+N[i][0]*w*hi(V[i]),P[i][1]+N[i][1]*w*hi(V[i]));}c.closePath();c.fill();};
  // 实心的一层：墨足的地方是满的，越往后越窄
  const cf=v=>core*(1-0.72*smooth(d0,1,v));band(v=>-cf(v),v=>cf(v),INK5);
  // 笔毛
  for(const br of bristles(o.seed,nb)){const bw=1.15/nb;const runs=[];let cur=null;
    for(let i=0;i<K;i++){const v=V[i];const ink=br.load-dry*Math.max(0,v-d0)*(0.45+edge*(o.side?Math.max(0,br.off*o.side):Math.abs(br.off)))-0.55*(nzA(br.a,v)-0.5)*(v>d0-0.15?1:0.25);
      if(ink>0.3){if(!cur){cur={i0:i,ink:0,k:0};runs.push(cur);}cur.i1=i;cur.ink+=ink;cur.k++;}else cur=null;}
    for(const rn of runs){if(rn.i1<=rn.i0)continue;const mi=rn.ink/rn.k;c.fillStyle=mi>0.62?INK5:INK5T;c.beginPath();
      for(let i=rn.i0;i<=rn.i1;i++){const w=wf(V[i])/2;const off=br.off+0.08*(nzA(br.j,V[i])-0.5);const h=w*Math.min(1,0.4+mi)*bw;const x=P[i][0]+N[i][0]*(off*w-h),y=P[i][1]+N[i][1]*(off*w-h);i>rn.i0?c.lineTo(x,y):c.moveTo(x,y);}
      for(let i=rn.i1;i>=rn.i0;i--){const w=wf(V[i])/2;const off=br.off+0.08*(nzA(br.j,V[i])-0.5);const h=w*Math.min(1,0.4+mi)*bw;c.lineTo(P[i][0]+N[i][0]*(off*w+h),P[i][1]+N[i][1]*(off*w+h));}
      c.closePath();c.fill();}}
  if(o.round){c.fillStyle=INK5;c.beginPath();c.arc(P[0][0],P[0][1],wf(0)/2,0,7);c.fill();}
  // 笔还在走：笔尖处的墨是湿的，聚成一团
  if(q<1&&K>1){const e=P[K-1],w=wf(V[K-1])/2*cf(V[K-1])/core,a=Math.atan2(N[K-1][1],N[K-1][0]);c.fillStyle=INK5;c.beginPath();c.ellipse(e[0],e[1],w,w*0.62,a,0,7);c.fill();}}
// 快笔（旧的，画枕面四角的卷草用）
function brush(c,pts,w,seed,col='rgba(24,20,18,0.95)',q=1){if(q<=0)return;const n=Math.max(2,Math.ceil(pts.length*q));const sub=pts.slice(0,n);ribbon(c,sub,v=>w*(v<0.15?0.4+4*v:1)*(1-0.75*Math.pow(v,3)),col,seed);}

// ---------- 鱼：身子的厚薄、笔画的顺序 ----------
const CZD=[[0,0.05],[0.05,0.16],[0.1,0.235],[0.18,0.3],[0.3,0.34],[0.42,0.325],[0.54,0.275],[0.66,0.2],[0.76,0.125],[0.84,0.08],[0.9,0.07],[1,0.07]];
function czDepth(u){u=clamp(u);let i=0;while(i<CZD.length-2&&u>CZD[i+1][0])i++;const a=CZD[i],b=CZD[i+1];const x=(u-a[0])/(b[0]-a[0]);const s=x*x*(3-2*x);return lerp(a[1],b[1],s);}
function XP(p,u,y){if(u<=1)return BP(p,u,y);const s=spineAt(p,1),s0=spineAt(p,0.96);let dx=s.x-s0.x,dy=s.y-s0.y;const l=Math.hypot(dx,dy)||1;const e=(u-1)*p.L;return[s.x+dx/l*e+s.nx*y,s.y+dy/l*e+s.ny*y];}
function alongPts(p,u0,u1,yf,n){const out=[];for(let i=0;i<n;i++){const u=lerp(u0,u1,i/(n-1));out.push(XP(p,u,yf?yf(u)*p.L:0));}return out;}
function flickPts(p,a,b,c2,n=14){return curvePts([XP(p,a[0],a[1]*p.L),XP(p,b[0],b[1]*p.L),XP(p,c2[0],c2[1]*p.L)],n);}
// 每一笔：[真实开始时刻, 时长, 画法]。全在 2.5 秒里画完——磁州窑的画工就是这么快
const CZ5=[];
CZ5.push([51.00,0.22,(c,p,q)=>dryStroke(c,alongPts(p,0.0,0.27,null,22),v=>czDepth(v*0.27)*p.L*1.05,q,{seed:501,nb:18,round:true,core:0.96})]);                       // 一按：头
CZ5.push([51.28,0.40,(c,p,q)=>dryStroke(c,alongPts(p,0.14,0.88,null,40),v=>czDepth(lerp(0.14,0.88,v))*p.L,q,{seed:502,nb:30,d0:0.42,dry:1.7,edge:1.3,core:0.92})]);  // 一拖：身子
// 鳍：一笔扫出整片（贴着身子的那边是满的，外缘的笔毛先干，自然就是毛毛糙糙的一道边），再在上面补几下短促的尖
// side：笔毛哪一侧朝外。用中段的法线和鱼的背/腹方向比一比就知道
function finSide(p,pts,toBack){const m=Math.floor(pts.length/2);const a=pts[m-1],b=pts[m+1];const nx=-(b[1]-a[1]),ny=b[0]-a[0];const s=spineAt(p,0.45);return -(Math.sign(nx*s.nx*toBack+ny*s.ny*toBack)||1);}
function finStroke(c,p,q,us,hs,yb,w0,w1,seed,toBack){const pts=curvePts(us.map((u,i)=>XP(p,u,(yb(u)+hs[i])*p.L)),18);
  dryStroke(c,pts,v=>p.L*lerp(w0,w1,v),q,{seed,nb:14,d0:0.05,dry:1.5,edge:1.6,core:0.62,side:finSide(p,pts,toBack)});}
const hdU=u=>czDepth(u)/2;
function backFin(p,u0,u1,wfun,n=20){const out=[];for(let i=0;i<n;i++){const v=i/(n-1),u=lerp(u0,u1,v);out.push(XP(p,u,(hdU(u)-0.02+wfun(v)/2)*p.L));}return out;}
const DFW=v=>lerp(0.16,0.045,v)*Math.min(1,0.3+v*5);
CZ5.push([51.72,0.14,(c,p,q)=>{const pts=backFin(p,0.27,0.66,DFW);dryStroke(c,pts,v=>DFW(v)*p.L,q,{seed:510,nb:14,d0:0.05,dry:1.5,edge:1.6,core:0.62,side:finSide(p,pts,1)});}]);  // 背鳍：从前往后一扫
for(let k=0;k<4;k++){const u=0.3+0.075*k,h=0.1-0.018*k;                                                                                              // 再补四下短尖
  CZ5.push([51.84+0.022*k,0.045,(c,p,q)=>{const b0=hdU(u)-0.02+DFW((u-0.27)/0.39)*0.85;dryStroke(c,flickPts(p,[u,b0],[u+0.025,b0+h*0.6],[u+0.06,b0+h]),v=>p.L*0.04*(1-0.8*v),q,{seed:515+k,nb:6,d0:0.4,dry:1.4,edge:0.6,core:0.75});}]);}
CZ5.push([51.96,0.08,(c,p,q)=>finStroke(c,p,q,[0.35,0.41,0.47],[-0.04,-0.1,-0.15],u=>-hdU(u)+0.01,0.1,0.03,520,-1)]);                                // 腹鳍
CZ5.push([52.08,0.07,(c,p,q)=>finStroke(c,p,q,[0.6,0.66,0.72],[-0.035,-0.08,-0.11],u=>-hdU(u)+0.01,0.085,0.025,522,-1)]);                            // 臀鳍
for(const [t0,d,sg,s] of [[52.20,0.12,1,530],[52.34,0.12,-1,532]]){                                                                                 // 最后两笔一甩：尾巴，一笔一片
  CZ5.push([t0,d,(c,p,q)=>{const pts=curvePts([XP(p,0.82,-sg*0.01*p.L),XP(p,0.9,sg*0.06*p.L),XP(p,0.97,sg*0.15*p.L),XP(p,1.02,sg*0.23*p.L)],18);
    dryStroke(c,pts,v=>p.L*(0.17-0.09*v)*Math.min(1,0.45+v*4),q,{seed:s,nb:16,d0:0.25,dry:1.8,edge:1.0,core:0.7,side:finSide(p,pts,sg)});}]);}
const T5STROKE_END=52.5;
// 针：剔出白线。[真实开始时刻, 时长, 线（取点的函数）, 线宽]
const CUT5=[];
CUT5.push([53.36,0.08,p=>curvePts([BP(p,0.2,czDepth(0.2)*p.L*0.4),BP(p,0.228,0),BP(p,0.2,-czDepth(0.2)*p.L*0.4)],12),1.3]);   // 鳃
{let k=0;for(const [y,u0,cnt] of [[0.08,0.3,5],[0,0.337,6],[-0.08,0.3,5]])for(let i=0;i<cnt;i++){const u=u0+0.075*i,yy=y;
  CUT5.push([53.46+0.026*k,0.045,p=>{const ce=BP(p,u,yy*p.L);const s=spineAt(p,u);const ang=Math.atan2(-s.ty,-s.tx);const r=0.034*p.L;const out=[];for(let j=0;j<=8;j++){const a=ang-1.2+2.4*j/8;out.push([ce[0]+Math.cos(a)*r,ce[1]+Math.sin(a)*r]);}return out;},1.0]);k++;}}
{const R=[];for(let k=0;k<5;k++){const u=0.3+0.075*k;R.push(p=>{const b=hdU(u)+0.012,h=[0.13,0.13,0.11,0.085,0.055][k];return[XP(p,u,b*p.L),XP(p,u+0.04,(b+h)*p.L)];});}       // 背鳍的鳍条
  for(const sg of [1,-1])for(let k=0;k<3;k++)R.push(p=>{const a=0.06+0.07*k;return[XP(p,0.86,sg*0.02*p.L),XP(p,1.0,sg*(a+0.04)*p.L)];});                       // 尾鳍的鳍条
  R.push(p=>[XP(p,0.37,-(hdU(0.37)+0.01)*p.L),XP(p,0.44,-(hdU(0.37)+0.11)*p.L)],p=>[XP(p,0.62,-(hdU(0.62)+0.01)*p.L),XP(p,0.68,-(hdU(0.62)+0.08)*p.L)]); // 腹鳍、臀鳍
  for(const [uu,yy] of [[0.28,-0.11],[0.31,-0.09],[0.33,-0.06]])R.push(p=>[BP(p,0.21,-0.02*p.L),BP(p,uu,yy*p.L)]);                                          // 胸鳍
  R.forEach((f,k)=>CUT5.push([53.88+0.019*k,0.03,f,0.75]));}
CUT5.push([54.18,0.1,p=>{const e=BP(p,0.075,0.035*p.L),r=0.026*p.L;const out=[];for(let j=0;j<=16;j++){const a=-Math.PI/2+j/16*Math.PI*2;out.push([e[0]+Math.cos(a)*r,e[1]+Math.sin(a)*r]);}return out;},1.1]);  // 最后点睛
function partial(pts,q){const n=pts.length;const f=(n-1)*clamp(q);const m=Math.floor(f);const out=pts.slice(0,m+1);if(f>m&&m<n-1){const a=f-m;out.push([lerp(pts[m][0],pts[m+1][0],a),lerp(pts[m][1],pts[m+1][1],a)]);}return out;}
// 针尖刮下来的碎釉渣：往外蹦一下，落下去
function cutChips(c,p,r){const k0=p.L/120;let idx=0;for(const [t0,d,f] of CUT5){idx++;if(r<t0||r>t0+d+0.4)continue;const pts=f(p);const g=rng(900+idx);const nch=d>0.08?5:2;
  for(let j=0;j<nch;j++){const ts=t0+d*(j+0.5)/nch;const age=r-ts;if(age<0||age>0.35)continue;const q=partial(pts,(j+0.5)/nch);const o=q[q.length-1];
    const ang=-Math.PI/2+(g()-0.5)*2.6,sp=(22+40*g())*k0;const x=o[0]+Math.cos(ang)*sp*age,y=o[1]+Math.sin(ang)*sp*age+0.5*240*k0*age*age;
    c.fillStyle=`rgba(46,32,20,${(0.9*(1-age/0.35)).toFixed(3)})`;c.beginPath();c.arc(x,y,(0.35+0.5*g())*k0,0,7);c.fill();}
  if(r<t0+d){const q=partial(pts,(r-t0)/d);const o=q[q.length-1];c.fillStyle='rgba(255,250,236,0.95)';c.beginPath();c.arc(o[0],o[1],0.7*k0,0,7);c.fill();}}}
// 还没画到的地方：一道淡影子（鱼游进了白地，等着被画）
function czGhost(c,p,al){if(al<=0.003)return;const M=30;c.save();c.globalAlpha=al;c.fillStyle='rgb(126,104,82)';c.filter=`blur(${(0.012*p.L*Math.abs(c.getTransform().a)).toFixed(1)}px)`;c.beginPath();
  for(let i=0;i<=M;i++){const u=i/M*0.86;const q=BP(p,u,czDepth(u)*p.L/2);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}
  for(const q of [XP(p,0.98,0.17*p.L),XP(p,1.04,0.27*p.L),XP(p,0.95,0.02*p.L),XP(p,1.04,-0.27*p.L),XP(p,0.98,-0.17*p.L)])c.lineTo(q[0],q[1]);
  for(let i=M;i>=0;i--){const u=i/M*0.86;const q=BP(p,u,-czDepth(u)*p.L/2);c.lineTo(q[0],q[1]);}c.closePath();c.fill();
  c.beginPath();for(let i=0;i<=12;i++){const u=lerp(0.27,0.65,i/12);const q=XP(p,u,(hdU(u)+lerp(0.15,0.04,i/12))*p.L);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}for(let i=12;i>=0;i--){const u=lerp(0.27,0.65,i/12);const q=XP(p,u,hdU(u)*p.L*0.9);c.lineTo(q[0],q[1]);}c.closePath();c.fill();
  c.restore();}
// r：真实时间（画得到哪儿由它决定；比 T5LIVE+1 晚就是画完了的鱼）
function drawCizhouFish(c,p,r){c.save();
  czGhost(c,p,0.2*(1-smooth(51.3,51.9,r)));
  for(const [t0,d,f] of CZ5){const q=clamp((r-t0)/d);if(q>0)f(c,p,q);}
  if(r>CUT5[0][0]){const k0=p.L/120;c.globalCompositeOperation='destination-out';c.lineCap='round';c.lineJoin='round';c.strokeStyle='#000';
    for(const [t0,d,f,lw] of CUT5){const q=clamp((r-t0)/d);if(q<=0)continue;const pts=partial(f(p),q);c.lineWidth=lw*k0;c.beginPath();pts.forEach((s,i)=>i?c.lineTo(s[0],s[1]):c.moveTo(s[0],s[1]));c.stroke();}
    c.globalCompositeOperation='source-over';if(r<T5LIVE+0.5)cutChips(c,p,r);}
  c.restore();}
// 水草：一丛丛撇出来；水纹：几下短笔。画完以前都是静的，鱼活过来，整幅画也跟着活了
const GRASS5=[[-118,84,1,1],[-98,86,1,0.8],[112,84,-1,0.78],[128,82,-1,0.6],[20,88,1,0.55],[-30,90,-1,0.5]];
const WAVES5=[[-60,70,40],[0,78,46],[60,66,36],[-20,58,24],[34,54,20],[-84,62,22]];
const G5T=[52.62,52.70,52.84,52.92,53.02,53.08];      // 每一丛开始撇的真实时刻
function drawWater5(c,t,hp){c.save();c.translate(S5X,S5Y+6);ptsPath(c,CART2);c.clip();c.globalCompositeOperation='multiply';const r=TNOW;const live=smooth(T5LIVE-0.1,T5LIVE+0.8,r);
  const hd=hp?[hp.sp[0].x-S5X,hp.sp[0].y-S5Y-6]:null,mid=hp?[spineAt(hp,0.5).x-S5X,spineAt(hp,0.5).y-S5Y-6]:null;
  GRASS5.forEach(([gx,gy,dir,s],j)=>{for(let k=0;k<4;k++){const gq=clamp((r-(G5T[j]+0.035*k))/0.09);if(gq<=0)continue;const h=(46+k*12)*s;const lean=dir*(8+k*7);const bx=gx+k*4*dir;
    const ph=r*1.9+gx*0.05+k*0.7;const sw=live*((5+k*1.6)*s*Math.sin(ph)+2.2*Math.sin(r*3.1+k+gx));
    let push=0;if(live>0)for(const q of [hd,mid]){if(!q)continue;const dx=bx+lean-q[0],dy=gy-h*0.7-q[1];const d=Math.hypot(dx,dy);push+=live*Math.sign(dx||1)*22*s*Math.exp(-d*d/(2*34*34));}
    const off=v=>(sw+push)*Math.pow(v,1.5);
    const pts=curvePts([[bx,gy],[bx+lean*0.3+off(0.4),gy-h*0.4],[bx+lean*0.8+off(0.75),gy-h*0.75+Math.abs(off(0.75))*0.15],[bx+lean*1.4+off(1),gy-h+Math.abs(off(1))*0.25]],18);
    dryStroke(c,pts,v=>(3.4+0.5*(k%2))*(1-0.85*v),gq,{seed:700+j*8+k,nb:6,d0:0.45,dry:1.5,edge:0.6,core:0.7});}});
  WAVES5.forEach(([wx,wy,wl],i)=>{const wq=clamp((r-(53.12+0.05*i))/0.1);if(wq<=0)return;const dr=live*4*Math.sin(r*1.1+wx*0.07),b=live*2.2*Math.sin(r*2.3+wx);const x0=wx+dr;
    dryStroke(c,curvePts([[x0-wl/2,wy+b*0.3],[x0-wl/6,wy-3+b],[x0+wl/6,wy+1-b],[x0+wl/2,wy-2+b*0.4]],14),v=>2.1*(1-0.6*v),wq,{seed:800+i,nb:5,d0:0.5,dry:1.4,edge:0.5,core:0.7});});
  c.restore();}
function drawS5Panel(t,cam,TR){const x0=S5X-S5W/2,y0=S5Y-S5W/2;panelShadow(x0,y0,S5W,S5W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S5W,S5W);ctx.clip();
  ctx.drawImage(LINEN,0,0,840,840,x0,y0,S5W,S5W);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(150,154,146)';ctx.fillRect(x0,y0,S5W,S5W);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.filter=`blur(${(9*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(20,18,14,0.5)';ptsPath(ctx,PIL,S5X-8,S5Y+6+11);ctx.fill();ctx.restore();
  ctx.drawImage(PILC,S5X-P5W/2/MS5,S5Y+6-P5H/2/MS5,P5W/MS5,P5H/MS5);
  drawWater5(ctx,t,(t>47.5&&t<55.5)?heroPoseNow(t):null);
  ctx.restore();ctx.strokeStyle='rgba(60,64,58,0.4)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S5W,S5W);}
// 釉面的光：鱼画在釉下，枕面上那块亮光也落在鱼身上
function glaze5(TR,al){ctx.save();ctx.setTransform(...TR);ptsPath(ctx,PIL,S5X,S5Y+6);ctx.clip();const g=ctx.createRadialGradient(S5X+70,S5Y-54,10,S5X+70,S5Y-54,200);
  g.addColorStop(0,`rgba(255,252,240,${0.3*al})`);g.addColorStop(0.45,`rgba(255,252,240,${0.08*al})`);g.addColorStop(1,'rgba(255,252,240,0)');ctx.globalCompositeOperation='screen';ctx.fillStyle=g;ctx.fillRect(S5X-200,S5Y-150,400,300);ctx.restore();}
function styleCizhou(t,cam,TR,p,clip){const entering=t<50.6;
  if(entering){ctx.save();if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.beginPath();ctx.rect(-40000,-4000,80000,8000);PIL.forEach((q,i)=>i?ctx.lineTo(q[0]+S5X,q[1]+S5Y+6):ctx.moveTo(q[0]+S5X,q[1]+S5Y+6));ctx.closePath();ctx.clip('evenodd');bronzeRelief([p],TR,cam);ctx.restore();}
  if(t<T5P)return;
  layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}if(entering){ptsPath(hctx,PIL,S5X,S5Y+6);hctx.clip();}drawCizhouFish(hctx,p,TNOW);layerGrain(hctx,TR,0.08);blitLayer(HEROC,1);
  if(t<56&&!clip)glaze5(TR,1);}

// ---------------- 伍 的登记 ----------------
STN.push({key:'s5',cx:S5X,hw:S5W/2,x0:-2880,x1:-2300,draw:drawS5Panel,style:styleCizhou,prep:prepPillow});
LABELS.push([S5X,S5W,S5W,'伍','白地黑花鱼藻纹枕','宋金 · 磁州窑']);
LIGHTS.push({x:S5X,y:-10,r:600,k:t=>smooth(46.4,48.6,t)});
// 路线（原来的时间）：游进开光，沿一道浅弧慢下来，停在正中（身子顺着这道弧，微微拱起）；醒过来，往下一沉、贴着水草游出去
GK.push([48.7,-2380,-40],[49.1,-2420,-28],[49.6,-2478,-9],[50.1,-2546,-3],[50.6,-2603,-4],[51.0,-2640,-9],[T5HOLD,-2656,-12],
  [51.6,-2664,-12],[52.0,-2684,-3],[52.5,-2700,15.4],[53.0,-2738,0.3],[53.4,-2770,-3],[53.85,-2800,-6],[54.6,-2884,0]);
HL.push([49.2,116],[50.4,140],[53.2,140],[54.4,116]);
HAMP.push(t=>(1-smooth(50.1,51.3,t)*(1-smooth(T5HOLD+0.02,T5HOLD+0.32,t)))*(1+0.7*smooth(T5HOLD+0.05,T5HOLD+0.25,t)*(1-smooth(51.9,52.6,t))));
HFB.push(t=>1.1*smooth(T5HOLD+0.02,T5HOLD+0.18,t)*(1-smooth(51.8,52.4,t)));
// 游出去的时候尾巴稍微摆快一点：把这一站慢下来少摆的那点相位补回来，后面每一站鱼的姿态就和原来一模一样（PHASE5 是量出来的）
const PHASE5=0.3163;HFB.push(t=>PHASE5*smooth(52.5,52.9,t)*(1-smooth(53.4,53.8,t)));
CK.push({t:49.0,x:S5X+70,y:0,z:1.45,f:0.35,ox:-50},{t:T5HOLD,x:S5X+2,y:S5Y+8,z:2.95},{t:54.2,z:1.25,f:1,ox:-150,oy:-10});   // 推近、停住、一口气拉开（中间不再停顿）
