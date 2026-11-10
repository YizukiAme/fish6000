// ---------------- 鱼：轨迹、骨架 ----------------
function hermite(K){return t=>{const n=K.length;
  if(t<=K[0][0]){const dt=K[1][0]-K[0][0];return[K[0][1]+(K[1][1]-K[0][1])/dt*(t-K[0][0]),K[0][2]+(K[1][2]-K[0][2])/dt*(t-K[0][0])];}
  if(t>=K[n-1][0])return[K[n-1][1],K[n-1][2]];
  let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const p0=K[Math.max(0,i-1)],p1=K[i],p2=K[i+1],p3=K[Math.min(n-1,i+2)];const h=p2[0]-p1[0];const s=(t-p1[0])/h;
  const m1=[(p2[1]-p0[1])/((p2[0]-p0[0])||1),(p2[2]-p0[2])/((p2[0]-p0[0])||1)],m2=[(p3[1]-p1[1])/((p3[0]-p1[0])||1),(p3[2]-p1[2])/((p3[0]-p1[0])||1)];
  const s2=s*s,s3=s2*s;const h00=2*s3-3*s2+1,h10=s3-2*s2+s,h01=-2*s3+3*s2,h11=s3-s2;
  return[h00*p1[1]+h10*h*m1[0]+h01*p2[1]+h11*h*m2[0],h00*p1[2]+h10*h*m1[1]+h01*p2[2]+h11*h*m2[1]];};}
function makeTrack(K,T0=-6,T1=24,dt=1/120){return makeTrackF(hermite(K),T0,T1,dt);}
function makeTrackF(f,T0,T1,dt=1/120,fb=null){const n=Math.round((T1-T0)/dt)+1;
  const X=new Float64Array(n),Y=new Float64Array(n),S=new Float64Array(n),PH=new Float64Array(n),SP=new Float64Array(n);
  for(let k=0;k<n;k++){const p=f(T0+k*dt);X[k]=p[0];Y[k]=p[1];if(k){S[k]=S[k-1]+Math.hypot(X[k]-X[k-1],Y[k]-Y[k-1]);SP[k]=(S[k]-S[k-1])/dt;}}
  SP[0]=SP[1];for(let k=1;k<n;k++){const sn=clamp(SP[k]/170);PH[k]=PH[k-1]+2*Math.PI*(0.45+2.0*sn+(fb?fb(T0+k*dt):0))*dt;}
  return{T0,dt,n,X,Y,S,PH,SP};}
function posAtS(tr,s){if(s<=tr.S[0])return[tr.X[0],tr.Y[0]];let lo=0,hi=tr.n-1;if(s>=tr.S[hi])return[tr.X[hi],tr.Y[hi]];
  while(hi-lo>1){const m=(lo+hi)>>1;if(tr.S[m]<s)lo=m;else hi=m;}const a=(s-tr.S[lo])/((tr.S[hi]-tr.S[lo])||1);return[lerp(tr.X[lo],tr.X[hi],a),lerp(tr.Y[lo],tr.Y[hi],a)];}
// 把鱼身拉直一些：保留鱼头的位置和朝向，按比例减小各节相对鱼头的转角（k=0 原样，k=1 笔直）
function stiffenPose(p,k){if(!(k>0))return p;const sp=p.sp,N=p.N;const seg=[],ang=[];
  for(let i=1;i<=N;i++){const A=sp[i-1],B=sp[i];seg.push(Math.hypot(B.x-A.x,B.y-A.y));ang.push(Math.atan2(B.y-A.y,B.x-A.x));}
  for(let i=1;i<N;i++){const d=ang[i]-ang[i-1];ang[i]=ang[i-1]+Math.atan2(Math.sin(d),Math.cos(d));}
  const nh=Math.max(1,Math.round(N*0.2));let a0=0;for(let i=0;i<nh;i++)a0+=ang[i];a0/=nh;
  const out=[{...sp[0]}];for(let i=1;i<=N;i++){const a=a0+(1-k)*(ang[i-1]-a0),P=out[i-1];out.push({...sp[i],x:P.x+seg[i-1]*Math.cos(a),y:P.y+seg[i-1]*Math.sin(a)});}
  for(let i=0;i<=N;i++){const A=out[Math.max(0,i-1)],B=out[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sg=(sp[i].nx*(-dy)+sp[i].ny*dx)>=0?1:-1;out[i].nx=-dy*sg;out[i].ny=dx*sg;}
  return{...p,sp:out};}
// 鱼身是沿着走过的路排开的。路线急拐（掉头、原地转身、绕小圈）时，身子硬跟着路线走就会折成两截或卷成一圈。
// 这里只看这一刻排出来的这根线：先把急弯摊到前后几节上，再把整条身子相对鱼头的总弯曲轻轻限制在约 100° 以内。
// 不依赖上一帧，所以逐帧连续，不会来回翻。
function tameSpine(P){const N=P.length-1;const ang=[],len=[];
  for(let i=1;i<=N;i++){const dx=P[i][0]-P[i-1][0],dy=P[i][1]-P[i-1][1];const l=Math.hypot(dx,dy);len.push(l);ang.push(l>1e-6?Math.atan2(dy,dx):null);}
  for(let i=0;i<N;i++)if(ang[i]===null){let j=i-1;while(j>=0&&ang[j]===null)j--;if(j<0){j=i+1;while(j<N&&ang[j]===null)j++;}ang[i]=j>=0&&j<N&&ang[j]!==null?ang[j]:0;}
  const turn=[0];for(let i=1;i<N;i++){const d=ang[i]-ang[i-1];turn.push(Math.atan2(Math.sin(d),Math.cos(d)));}
  const R=5,sm=[0];for(let i=1;i<N;i++){let s=0,w=0;for(let k=-R;k<=R;k++){const j=i+k;if(j<1||j>=N)continue;const wk=R+1-Math.abs(k);s+=turn[j]*wk;w+=wk;}sm.push(s/w);}
  const A0=1.0,AM=1.75,soft=x=>{const ax=Math.abs(x);return ax<=A0?x:Math.sign(x)*(A0+(AM-A0)*Math.tanh((ax-A0)/(AM-A0)));};
  let phi=0;for(let i=1;i<=N;i++){if(i>1)phi+=sm[i-1];const a=ang[0]+soft(phi);P[i]=[P[i-1][0]+len[i-1]*Math.cos(a),P[i-1][1]+len[i-1]*Math.sin(a)];}}
function fishPose(def,t){const tr=def.tr;const L=def.L(t);const fk=(t-tr.T0)/tr.dt;const k=clamp(Math.floor(fk),0,tr.n-2);const a=fk-k;
  const s=lerp(tr.S[k],tr.S[k+1],a),ph=lerp(tr.PH[k],tr.PH[k+1],a),sp=lerp(tr.SP[k],tr.SP[k+1],a);const sn=clamp(sp/170);
  const still=def.freeze?1-smooth(def.freeze-0.6,def.freeze,t):1;const I=(0.32+0.68*sn)*still*(def.amp?def.amp(t):1);
  const N=32;const raw=[];for(let i=0;i<=N;i++)raw.push(posAtS(tr,s-i/N*L));
  const stiff=def.stiff?def.stiff(t):1;
  if(stiff>0){const dl=L*0.02,rc=[];for(let i=0;i<=N+8;i++){let x=0,y=0;for(let k=-2;k<=2;k++){const q=posAtS(tr,Math.min(s,s-i/N*L+k*dl));x+=q[0];y+=q[1];}rc.push([x/5,y/5]);}tameSpine(rc);for(let i=0;i<=N;i++)raw[i]=[lerp(raw[i][0],rc[i][0],stiff),lerp(raw[i][1],rc[i][1],stiff)];}
  const pts=[];
  for(let i=0;i<=N;i++){const A=raw[Math.max(0,i-1)],B=raw[Math.min(N,i+1)];let dx=A[0]-B[0],dy=A[1]-B[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    const u=i/N;let off=L*(0.012+0.08*u*u)*I*Math.sin(2*Math.PI*0.9*u-ph);
    for(const wk of (def.winks||(def.wink?[def.wink]:[]))){const w=t-wk;if(w>0&&w<0.9)off+=L*0.10*u*u*Math.sin(Math.PI*w/0.9)*Math.sin(2*Math.PI*0.8*u-w*15);}
    pts.push({x:raw[i][0]-dy*off,y:raw[i][1]+dx*off});}
  for(let i=0;i<=N;i++){const A=pts[Math.max(0,i-1)],B=pts[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy);if(l<1e-6&&i>0){pts[i].nx=pts[i-1].nx;pts[i].ny=pts[i-1].ny;continue;}dx/=(l||1);dy/=(l||1);pts[i].nx=-dy;pts[i].ny=dx;
    if(i>0&&pts[i].nx*pts[i-1].nx+pts[i].ny*pts[i-1].ny<-0.2){pts[i].nx=-pts[i].nx;pts[i].ny=-pts[i].ny;}}
  let flut=still;for(const wk of (def.winks||(def.wink?[def.wink]:[]))){const w=t-wk;if(w>0&&w<0.9)flut=Math.max(flut,Math.sin(Math.PI*w/0.9));}
  return{sp:pts,N,L,sn,ph,t,flut};}
function spineAt(p,u){const f=clamp(u)*p.N;const i=Math.min(p.N-1,Math.floor(f));const a=f-i;const A=p.sp[i],B=p.sp[i+1];
  let nx=lerp(A.nx,B.nx,a),ny=lerp(A.ny,B.ny,a);const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;return{x:lerp(A.x,B.x,a),y:lerp(A.y,B.y,a),nx,ny,tx:ny,ty:-nx};}
function mkProf(dw,bw,p,q,minw){let mx=0;for(let i=1;i<1000;i++){const x=i/1000;const v=Math.pow(x,p)*Math.pow(1-x,q);if(v>mx)mx=v;}
  const sh=u=>{const x=clamp(u/0.8);let v=Math.pow(x,p)*Math.pow(1-x,q)/mx;if(x>0.7)v=Math.max(v,minw);return v;};
  return{d:(u,L)=>L*dw*sh(u),b:(u,L)=>L*bw*sh(u)};}
const PROF={song:mkProf(0.12,0.10,0.5,0.75,0.2),yuan:mkProf(0.165,0.135,0.55,0.62,0.22)};
function bodyAt(p,pr,u,v){const s=spineAt(p,u);const w=v>=0?pr.d(u,p.L)*v:pr.b(u,p.L)*v;return[s.x+s.nx*w,s.y+s.ny*w];}
function finPts(p,pr,u0,u1,hm,side,back){const base=[],out=[];const M=16;for(let i=0;i<=M;i++){const v=i/M,u=lerp(u0,u1,v);const b=bodyAt(p,pr,u,side*0.94);const s=spineAt(p,u);
  const h=hm*p.L*Math.pow(Math.sin(Math.PI*v),0.75)*(1-0.3*v);base.push(b);out.push([b[0]+s.nx*side*h-s.tx*back*h*0.5,b[1]+s.ny*side*h-s.ty*back*h*0.5]);}return{base,out};}
function finPath(c,f){c.beginPath();f.base.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=f.out.length-1;i>=0;i--)c.lineTo(f.out[i][0],f.out[i][1]);c.closePath();}
function finRays(c,f,st){for(let i=st;i<f.base.length-1;i+=st){c.beginPath();c.moveTo(f.base[i][0],f.base[i][1]);c.lineTo(lerp(f.base[i][0],f.out[i][0],.92),lerp(f.base[i][1],f.out[i][1],.92));c.stroke();}}
function bandPath(c,p,pr,u0,u1,v0,v1){const M=24;c.beginPath();for(let i=0;i<=M;i++){const q=bodyAt(p,pr,lerp(u0,u1,i/M),v0);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}for(let i=M;i>=0;i--){const q=bodyAt(p,pr,lerp(u0,u1,i/M),v1);c.lineTo(q[0],q[1]);}c.closePath();}
function ribbon(c,pts,wf,col,seed,gap=0){const r=rng(seed);const n=pts.length;const segs=[];let cur=[];let skip=0;
  for(let i=0;i<n;i++){if(skip>0){skip--;continue;}if(gap>0&&i>2&&i<n-3&&r()<gap){if(cur.length>1)segs.push(cur);cur=[];skip=1+Math.floor(r()*2);continue;}cur.push(i);}if(cur.length>1)segs.push(cur);
  c.fillStyle=col;for(const sg of segs){const Lp=[],Rp=[];for(const i of sg){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=wf(i/(n-1))/2;Lp.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);Rp.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);}
    c.beginPath();Lp.forEach((q,j)=>j?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let j=Rp.length-1;j>=0;j--)c.lineTo(Rp[j][0],Rp[j][1]);c.closePath();c.fill();}}
function blob(c,x,y,r,seed){const g=rng(seed);const M=10;const rr=[];for(let i=0;i<M;i++)rr.push(r*(0.7+0.5*g()));c.beginPath();for(let i=0;i<=M;i++){const a=i/M*Math.PI*2;const q=rr[i%M];const px=x+Math.cos(a)*q,py=y+Math.sin(a)*q*0.8;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();}
function pect(c,p,pr,u,k,fill,stroke,len){const s=spineAt(p,u);const b=bodyAt(p,pr,u,-0.3);const a=0.55+0.28*Math.sin(p.t*2*Math.PI*1.2+u*10)*(1-0.6*p.sn)*p.flut;
  const bx=-s.tx,by=-s.ty,nx=-s.nx,ny=-s.ny;const dx=bx*Math.cos(a)+nx*Math.sin(a),dy=by*Math.cos(a)+ny*Math.sin(a);const L=p.L*len;const tip=[b[0]+dx*L,b[1]+dy*L];const px=-dy,py=dx;const wd=L*0.3;
  c.beginPath();c.moveTo(b[0],b[1]);c.quadraticCurveTo(b[0]+dx*L*0.5+px*wd,b[1]+dy*L*0.5+py*wd,tip[0],tip[1]);c.quadraticCurveTo(b[0]+dx*L*0.5-px*wd*0.45,b[1]+dy*L*0.5-py*wd*0.45,b[0],b[1]);c.closePath();
  c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=0.6*k;c.stroke();}
function edges(p,pr){const M=40,top=[],bot=[];for(let i=0;i<=M;i++){const u=0.8*i/M;top.push(bodyAt(p,pr,u,1));bot.push(bodyAt(p,pr,u,-1));}return{top,bot,M};}
function bodyFill(c,e){c.beginPath();e.top.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=e.M;i>=0;i--)c.lineTo(e.bot[i][0],e.bot[i][1]);c.closePath();}

// 宋画：绢本水墨淡彩的鲤
function tailSongPath(c,p){const L=p.L,pr=PROF.song;const Pp=(u,v)=>{const s=spineAt(p,u);return[s.x+s.nx*v*L,s.y+s.ny*v*L];};
  const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1),tt=Pp(1,0.17),tb=Pp(1,-0.16),nt=Pp(0.925,0),c1=Pp(0.87,0.075),c2=Pp(0.965,0.05),c3=Pp(0.965,-0.045),c4=Pp(0.87,-0.07);
  c.beginPath();c.moveTo(bt[0],bt[1]);c.quadraticCurveTo(c1[0],c1[1],tt[0],tt[1]);c.quadraticCurveTo(c2[0],c2[1],nt[0],nt[1]);c.quadraticCurveTo(c3[0],c3[1],tb[0],tb[1]);c.quadraticCurveTo(c4[0],c4[1],bb[0],bb[1]);c.closePath();
  return{tt,tb,nt,base:Pp(0.8,0)};}
function drawSong(c,p,z,al=1){const L=p.L,k=L/150,pr=PROF.song;const ink=a=>`rgba(36,27,20,${a*al})`;const e=edges(p,pr);
  c.save();c.lineCap='round';c.lineJoin='round';
  const dors=finPts(p,pr,0.3,0.58,0.085,1,1),anal=finPts(p,pr,0.63,0.73,0.055,-1,1.3),pelv=finPts(p,pr,0.44,0.51,0.055,-1,1.8);
  for(const f of [dors,anal,pelv]){finPath(c,f);c.fillStyle=ink(.10);c.fill();}
  c.strokeStyle=ink(.26);c.lineWidth=0.5*k;for(const f of [dors,anal,pelv])finRays(c,f,1);
  for(const f of [dors,anal,pelv])ribbon(c,f.out,v=>0.9*k*Math.min(1,v*5+.1,(1-v)*5+.1),ink(.42),7);
  pect(c,p,pr,0.21,k,ink(.12),ink(.4),0.12);
  const tl=tailSongPath(c,p);c.fillStyle=ink(.11);c.fill();c.strokeStyle=ink(.42);c.lineWidth=0.8*k;c.stroke();
  c.strokeStyle=ink(.25);c.lineWidth=0.5*k;for(let j=1;j<10;j++){const v=j/10;const q=v<.5?[lerp(tl.tt[0],tl.nt[0],v/.5),lerp(tl.tt[1],tl.nt[1],v/.5)]:[lerp(tl.nt[0],tl.tb[0],(v-.5)/.5),lerp(tl.nt[1],tl.tb[1],(v-.5)/.5)];c.beginPath();c.moveTo(tl.base[0],tl.base[1]);c.lineTo(lerp(tl.base[0],q[0],.93),lerp(tl.base[1],q[1],.93));c.stroke();}
  bodyFill(c,e);c.fillStyle=ink(.14);c.fill();
  c.save();bodyFill(c,e);c.clip();
  c.filter=`blur(${(2.6*z).toFixed(1)}px)`;
  bandPath(c,p,pr,0.03,0.8,1.15,0.15);c.fillStyle=ink(.30);c.fill();
  bandPath(c,p,pr,0.06,0.74,1.15,0.62);c.fillStyle=ink(.24);c.fill();
  bandPath(c,p,pr,0.1,0.72,0.25,-0.55);c.fillStyle=`rgba(150,96,44,${0.15*al})`;c.fill();
  c.filter='none';
  c.strokeStyle=ink(.12);c.lineWidth=0.45*k;
  for(const v of [0.66,0.36,0.06,-0.24]){for(let u=0.24+(v<0.3?0.022:0);u<0.72;u+=0.044){const q=bodyAt(p,pr,u,v);const s=spineAt(p,u);const ang=Math.atan2(-s.ty,-s.tx);c.beginPath();c.arc(q[0],q[1],0.021*L,ang-Math.PI/2,ang+Math.PI/2);c.stroke();}}
  c.restore();
  ribbon(c,e.top,v=>lerp(0.7,1.9,0.5+0.5*Math.sin(v*8+1))*k*Math.min(1,v*12+.25,(1-v)*4+.25),ink(.78),11,0.035);
  ribbon(c,e.bot,v=>lerp(0.45,1.1,0.5+0.5*Math.sin(v*6+2))*k*Math.min(1,v*12+.25,(1-v)*4+.25),ink(.5),12,0.07);
  const g0=bodyAt(p,pr,0.185,0.82),g1=bodyAt(p,pr,0.215,0.05),g2=bodyAt(p,pr,0.185,-0.78);c.strokeStyle=ink(.5);c.lineWidth=0.9*k;c.beginPath();c.moveTo(g0[0],g0[1]);c.quadraticCurveTo(g1[0],g1[1],g2[0],g2[1]);c.stroke();
  const ey=bodyAt(p,pr,0.075,0.34);c.strokeStyle=ink(.65);c.lineWidth=0.65*k;c.beginPath();c.arc(ey[0],ey[1],0.02*L,0,7);c.stroke();c.fillStyle=ink(.92);c.beginPath();c.arc(ey[0],ey[1],0.0105*L,0,7);c.fill();
  const m0=bodyAt(p,pr,0.004,0),m1=bodyAt(p,pr,0.04,-0.3);c.strokeStyle=ink(.6);c.lineWidth=0.75*k;c.beginPath();c.moveTo(m0[0],m0[1]);c.lineTo(m1[0],m1[1]);c.stroke();
  c.restore();}

// 元青花：鳜鱼
function tailYuanPath(c,p){const L=p.L,pr=PROF.yuan;const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);const edge=[];
  for(let j=0;j<=10;j++){const v=1-2*j/10;const s=spineAt(p,0.93+0.07*(1-v*v));edge.push([s.x+s.nx*v*0.135*L,s.y+s.ny*v*0.135*L]);}
  const s8=spineAt(p,0.86);c.beginPath();c.moveTo(bt[0],bt[1]);c.quadraticCurveTo(s8.x+s8.nx*0.085*L,s8.y+s8.ny*0.085*L,edge[0][0],edge[0][1]);for(let j=1;j<=10;j++)c.lineTo(edge[j][0],edge[j][1]);c.quadraticCurveTo(s8.x-s8.nx*0.085*L,s8.y-s8.ny*0.085*L,bb[0],bb[1]);c.closePath();
  const s0=spineAt(p,0.8);return{edge,base:[s0.x,s0.y]};}
function jit(pts,amp,seed){return pts.map((q,i)=>[q[0]+amp*Math.sin(i*1.7+seed)*Math.sin(i*0.37+seed*2),q[1]+amp*Math.cos(i*1.3+seed)*Math.sin(i*0.53+seed)]);}
function drawYuan(c,p,rgb,al,bl){const L=p.L,k=L/190,pr=PROF.yuan;const cs=a=>`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a*al})`;const e=edges(p,pr);
  c.save();c.lineCap='round';c.lineJoin='round';
  // 硬棘背鳍：鳍膜 + 渐细的棘
  const sp=[];for(let j=0;j<=11;j++){const v=j/11,u=lerp(0.19,0.47,v);const b=bodyAt(p,pr,u,0.92);const s=spineAt(p,u);const h=0.12*L*(0.55+0.45*Math.sin(Math.PI*(0.12+0.85*v)))*(1-0.2*v);
    sp.push({b,t:[b[0]+s.nx*h-s.tx*h*0.3,b[1]+s.ny*h-s.ty*h*0.3],m:[b[0]+s.nx*h*0.68-s.tx*h*0.22,b[1]+s.ny*h*0.68-s.ty*h*0.22],s});}
  c.beginPath();sp.forEach((q,i)=>i?c.lineTo(q.b[0],q.b[1]):c.moveTo(q.b[0],q.b[1]));
  for(let i=sp.length-1;i>=0;i--){const q=sp[i];c.lineTo(q.m[0],q.m[1]);if(i>0){const q2=sp[i-1];c.lineTo((q.m[0]+q2.m[0])/2-q.s.nx*L*0.016,(q.m[1]+q2.m[1])/2-q.s.ny*L*0.016);}}c.closePath();
  c.fillStyle=cs(.26);c.fill();
  for(const q of sp)ribbon(c,[q.b,[lerp(q.b[0],q.t[0],.5),lerp(q.b[1],q.t[1],.5)],q.t],v=>lerp(2.0,0.5,v)*k,cs(.95),3);
  const sd=finPts(p,pr,0.49,0.70,0.09,1,1),an=finPts(p,pr,0.58,0.72,0.075,-1,1.2),pv=finPts(p,pr,0.31,0.39,0.065,-1,1.7);
  for(const f of [sd,an,pv]){finPath(c,f);c.fillStyle=cs(.24);c.fill();c.strokeStyle=cs(.55);c.lineWidth=0.7*k;finRays(c,f,2);ribbon(c,jit(f.out,0.6*k,3),v=>1.3*k*Math.min(1,v*5+.2,(1-v)*5+.2),cs(.9),5);}
  const tl=tailYuanPath(c,p);c.fillStyle=cs(.26);c.fill();
  c.strokeStyle=cs(.55);c.lineWidth=0.7*k;for(let j=1;j<tl.edge.length-1;j++){const q=tl.edge[j];c.beginPath();c.moveTo(tl.base[0],tl.base[1]);c.lineTo(lerp(tl.base[0],q[0],.94),lerp(tl.base[1],q[1],.94));c.stroke();}
  ribbon(c,jit(tl.edge,0.7*k,9),v=>1.5*k*(0.7+0.3*Math.sin(v*9)),cs(.92),9);
  pect(c,p,pr,0.25,k,cs(.24),cs(.8),0.14);
  bodyFill(c,e);c.fillStyle=cs(.22);c.fill();
  c.save();bodyFill(c,e);c.clip();
  if(bl>0)c.filter=`blur(${bl.toFixed(1)}px)`;bandPath(c,p,pr,0.03,0.8,1.15,0.25);c.fillStyle=cs(.24);c.fill();bandPath(c,p,pr,0.0,0.2,1.15,-1.15);c.fillStyle=cs(.12);c.fill();c.filter='none';
  // 鳞：斜向网格（元青花鱼的画法），随身体弯曲
  c.strokeStyle=cs(.36);c.lineWidth=0.6*k;
  for(const sgn of [1,-1])for(let v0=-4.2;v0<=4.2;v0+=0.24){c.beginPath();let on=false;for(let u=0.21;u<=0.79;u+=0.008){const v=v0+sgn*(u-0.5)*6;if(v<-1||v>1){on=false;continue;}const q=bodyAt(p,pr,u,v);if(!on){c.moveTo(q[0],q[1]);on=true;}else c.lineTo(q[0],q[1]);}c.stroke();}
  c.fillStyle=cs(.40);for(const [u,v,r,s2] of [[0.3,0.42,.045,1],[0.42,-0.05,.04,2],[0.52,0.5,.042,3],[0.6,-0.32,.036,4],[0.68,0.25,.03,5],[0.37,-0.55,.03,6],[0.24,-0.12,.03,7],[0.56,0.05,.028,8]]){const q=bodyAt(p,pr,u,v);blob(c,q[0],q[1],r*L,s2*17);c.fill();}
  c.restore();
  ribbon(c,jit(e.top,0.7*k,1),v=>lerp(1.6,3.2,0.5+0.5*Math.sin(v*7+.5))*k*Math.min(1,v*12+.3,(1-v)*4+.3),cs(1),21,0.025);
  ribbon(c,jit(e.bot,0.7*k,2),v=>lerp(1.1,2.3,0.5+0.5*Math.sin(v*6+1.3))*k*Math.min(1,v*12+.3,(1-v)*4+.3),cs(.92),22,0.04);
  for(const [uu,a2,w2] of [[0.2,.95,1.6],[0.235,.55,1.0]]){const pts=[];for(let i=0;i<=10;i++){const v=lerp(0.85,-0.8,i/10);pts.push(bodyAt(p,pr,uu+0.035*Math.sin(Math.PI*i/10),v));}ribbon(c,pts,v=>w2*k*Math.min(1,v*4+.3,(1-v)*4+.3),cs(a2),31);}
  // 嘴：上颌线长，下颌微突，张口
  ribbon(c,[bodyAt(p,pr,0.0,0.06),bodyAt(p,pr,0.05,-0.05),bodyAt(p,pr,0.12,-0.14)],v=>1.8*k*(1-0.5*v),cs(1),41);
  ribbon(c,[bodyAt(p,pr,0.01,-0.2),bodyAt(p,pr,0.07,-0.24)],v=>1.2*k*(1-0.5*v),cs(.85),42);
  // 过眼的暗纹 + 小眼
  ribbon(c,[bodyAt(p,pr,0.02,0.32),bodyAt(p,pr,0.09,0.42),bodyAt(p,pr,0.17,0.62),bodyAt(p,pr,0.24,0.85)],v=>lerp(2.6,1.0,v)*k,cs(.45),43);
  const ey=bodyAt(p,pr,0.085,0.42);c.strokeStyle=cs(1);c.lineWidth=1.1*k;c.beginPath();c.arc(ey[0],ey[1],0.021*L,0,7);c.stroke();c.fillStyle=cs(1);c.beginPath();c.arc(ey[0]-0.003*L,ey[1],0.011*L,0,7);c.fill();
  c.restore();}

