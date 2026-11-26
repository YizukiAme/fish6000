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
  return{sp:pts,N,L,sn,ph,t,flut,s,I,spd:sp};}
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
function tailSongPath(c,p) {
  const L=p.L;
  const rail=(u,v)=>{const s=spineAt(p,u);return [s.x+s.nx*v*L,s.y+s.ny*v*L];};
  const bt=bodyAt(p,PROF.song,.752,.89),bb=bodyAt(p,PROF.song,.752,-.85);
  const tt=rail(.999,.130),tb=rail(.984,-.112),nt=rail(.914,.009);
  c.beginPath();c.moveTo(...bt);c.bezierCurveTo(...rail(.850,.024),...rail(.947,.078),...tt);
  c.bezierCurveTo(...rail(.987,.090),...rail(.944,.024),...nt);
  c.bezierCurveTo(...rail(.932,-.008),...rail(.965,-.075),...tb);
  c.bezierCurveTo(...rail(.949,-.079),...rail(.839,-.021),...bb);c.closePath();
  return {tt,tb,nt,base:rail(.747,0)};
}
function silkTurnSpine(p,effort) {
  const sp=[p.sp[0]];
  for(let i=1;i<=p.N;i++){
    const u=(i-.5)/p.N,s=p.sp[i],prev=p.sp[i-1],attached=sp[i-1];
    if(u<.34){sp.push(s);continue;}
    const angle=effort*(.84*smooth(.34,.78,u)-.12*smooth(.86,1,u));
    const dx=s.x-prev.x,dy=s.y-prev.y,cs=Math.cos(angle),sn=Math.sin(angle);
    sp.push({x:attached.x+dx*cs+dy*sn,y:attached.y-dx*sn+dy*cs});
  }
  for(let i=0;i<=p.N;i++){
    if(sp[i]===p.sp[i])continue;
    const a=sp[i-1],b=sp[Math.min(p.N,i+1)];
    const dx=a.x-b.x,dy=a.y-b.y,l=Math.hypot(dx,dy)||1;
    sp[i].nx=-dy/l;sp[i].ny=dx/l;
  }
  return {...p,sp};
}
function swimSilkCarp(c,p,opacity,variant) {
  const L=p.L;
  const turning=!variant && TREAL>67.23 && TREAL<69.82;
  const sink=turning?smooth(67.23,68.09,TREAL)*(1-smooth(68.32,69.28,TREAL)):0;
  // The existing tail already rises after the head has pitched down. Fade the
  // added effort as that rise reaches the caudal root so the gesture never doubles.
  const recovered=turning?smooth(.005,.245,(spineAt(p,.44).y-spineAt(p,.82).y)/L):0;
  const roll=turning?smooth(67.44,68.25,TREAL)*(1-smooth(68.47,69.61,TREAL))*(1-recovered):0;
  const fan=turning?smooth(67.60,68.45,TREAL)*(1-smooth(68.62,69.82,TREAL)):0;
  if(roll>0)p=silkTurnSpine(p,roll);
  const knots=[0,.018,.055,.115,.20,.33,.46,.59,.70,.765,.80,.825,.852];
  const dorsal=[0,.036,.070,.100,.122,.133,.129,.108,.073,.040,.027,.017,.001];
  const ventral=[0,.025,.046,.058,.075,.094,.099,.079,.049,.031,.021,.012,.001];
  function breadth(u,row){
    let j=0;
    while(j+2<knots.length && u>knots[j+1])j++;
    const t=clamp((u-knots[j])/(knots[j+1]-knots[j]));
    const left=row[j],right=row[j+1];
    const slope0=j?(right-row[j-1])/(knots[j+1]-knots[j-1]):(right-left)/knots[1];
    const slope1=j+2<knots.length?(row[j+2]-left)/(knots[j+2]-knots[j]):(right-left)/(knots[j+1]-knots[j]);
    const d=knots[j+1]-knots[j], s=t*t;
    return (2*t*s-3*s+1)*left+(t*s-2*s+t)*d*slope0+(-2*t*s+3*s)*right+(t*s-s)*d*slope1;
  }
  const back=u=>breadth(u,dorsal);
  const throat=u=>smooth(.115,.265,u)*(1-smooth(.32,.59,u));
  const belly=u=>breadth(u,ventral)*(1+.39*sink*throat(u));
  const form=(variant==='vermilion'?.84:variant==='distant'?.87:1);
  const rail=(u,v)=>{
    const s=spineAt(p,u);
    if(fan===0 || u<=.81)return [s.x+s.nx*v*L,s.y+s.ny*v*L];
    const tip=smooth(.81,.997,u)*fan, far=Math.tanh(v/.053);
    const reach=L*tip*(.006-.036*far);
    const span=v*L*(1-tip*(.26*far-.03));
    return [s.x+s.nx*span-s.tx*reach,s.y+s.ny*span-s.ty*reach];
  };
  const surf=(u,v)=>rail(u,v*(v<0?belly(u):back(u))*form);
  const rose=variant==='vermilion', distant=variant==='distant';
  const density=opacity*(rose?.73:distant?.80:1);
  const pigment=(r,g,b,a)=>'rgba('+r+','+g+','+b+','+a*density+')';
  const ink=alpha=>rose?pigment(153,71,47,alpha):pigment(34,45,46,alpha);
  const warm=alpha=>rose?pigment(185,96,54,alpha):pigment(117,88,59,alpha);
  const line=(points,fat,color)=>ribbon(c,curvePts(points,Math.max(12,points.length*3)),v=>L*fat*(.12+.88*Math.pow(Math.sin(Math.PI*v),.68)),color,43);
  const at=(uv)=>rail(uv[0],uv[1]);
  const stroke=(uv,fat,color)=>line(uv.map(at),fat,color);
  const uvPen=(pairs,fat,color)=>line(pairs.map(q=>surf(...q)),fat,color);
  const mix=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
  function pathFrom(points) {
    c.beginPath();points.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.closePath();
  }
  // A wash builds out from the joint. The silk between the fine fin rays remains visible.
  function web(root,outline,reach,depth,near=false) {
    const base=root.map(at),rim=curvePts(outline.map(at),34);
    // Successively shorter washes leave the tips almost transparent. Their lengths
    // differ around the fan, avoiding a single hard line at its margin.
    const rootAt=t=>mix(base[0],base[1],t);
    for(let layer=0;layer<13;layer++){
      const v=layer/12;
      const edge=rim.map((q,i)=>{
        const t=i/(rim.length-1), retract=.76*v*(.86+.14*Math.cos(Math.PI*2*t));
        return mix(rootAt(t),q,1-retract);
      });
      pathFrom(base.concat(edge.reverse()));
      c.fillStyle=layer%4===0?warm(depth*.068):ink(depth*(.037+.047*v));c.fill();
    }
    pathFrom(base.concat(rim.slice().reverse()));c.save();c.clip();
    for(let j=0;j<reach;j++){
      const t=(j+.40+.16*Math.sin(j*18.2))/reach;
      const raw=rim[Math.min(rim.length-1,Math.floor(t*(rim.length-1)))];
      const b=mix(base[0],base[1],t),a=mix(base[0],base[1],.24+.54*t);
      const tip=mix(a,raw,.88+.10*Math.sin(j*4.13)**2);
      const mid=mix(mix(a,tip,.46),mix(b,tip,.53),.73);
      const rayTone=c.createLinearGradient(...a,...tip), strength=depth*(.29+.39*Math.sin(j*4+.3)**2);
      rayTone.addColorStop(0,ink(strength*.24));rayTone.addColorStop(.32,ink(strength));
      rayTone.addColorStop(.72,ink(strength*.83));rayTone.addColorStop(1,ink(.009));
      line([a,mid,tip],(.0029+.0017*Math.sin(j*7.1)**2)*(near?1.05:.83),rayTone);
      if(j%3===1){
        const secondary=mix(tip,rim[Math.min(rim.length-1,Math.floor(t*(rim.length-1))+1)],.8);
        line([mid,mix(mid,secondary,.47),secondary],.00125,ink(depth*.25));
      }
    }
    c.restore();
  }
  c.save();c.lineCap='round';c.lineJoin='round';
  const positions=Array.from({length:70},(_,j)=>.852*(j/69)**1.38);
  const boundary=positions.map(u=>surf(u,1)).concat(positions.slice().reverse().map(u=>surf(u,-1)));
  c.save();c.beginPath();c.rect(p.sp[0].x-3*L,p.sp[0].y-3*L,6*L,6*L);
  boundary.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.closePath();c.clip('evenodd');
  const pad=(u,plus)=>[u,(plus?back(u):-belly(u))*form*.84];
  web([pad(.25,true),pad(.57,true)],[[.246,.115*form],[.292,.139*form],[.327,.178*form],[.350,.196*form],[.377,.191*form],[.412,.174*form],[.467,.158*form],[.51,.144*form],[.56,.117*form]],21,.61);
  web([pad(.40,false),pad(.50,false)],[[.40,-.079*form],[.425,-.106*form],[.486,-.143*form],[.519,-.144*form],[.529,-.135*form],[.496,-.076*form]],12,.43);
  web([pad(.615,false),pad(.721,false)],[[.616,-.056*form],[.650,-.082*form],[.711,-.112*form],[.744,-.112*form],[.750,-.106*form],[.717,-.038*form]],13,.47);
  c.restore();
  // Each caudal lobe spreads into a broad membrane with a soft, slightly scalloped end.

  const upper=[[.738,.034],[.795,.024],[.850,.039],[.900,.080],[.951,.129],[.980,.149],[.996,.145],[.997,.119],[.985,.091],[.980,.075],[.957,.045],[.925,.008]];
  const lower=[[.925,.008],[.934,-.016],[.963,-.042],[.986,-.064],[.997,-.090],[.991,-.112],[.974,-.124],[.944,-.113],[.912,-.091],[.867,-.052],[.806,-.023],[.740,-.026]];
  const topRim=curvePts(upper.map(at),52),bottomRim=curvePts(lower.map(at),50);
  for(const [rim,sign,tip] of [[topRim,1,rail(.987,.141)],[bottomRim,-1,rail(.985,-.117)]]){
    const midBase=rail(.738,.001),centre=rail(.85,.002);
    const membrane=sign>0?rim.concat([centre,midBase]):[midBase,centre].concat(rim);
    pathFrom(membrane);
    const tailWash=c.createLinearGradient(...rail(.754,0),...tip);
    tailWash.addColorStop(0,ink(0));tailWash.addColorStop(.24,ink(.45));tailWash.addColorStop(.46,ink(.45*(1-sign*.18*fan)));
    tailWash.addColorStop(.63,warm(.38*(1-sign*.18*fan)));tailWash.addColorStop(.82,ink(.22*(1-sign*.24*fan)));tailWash.addColorStop(1,ink(.032));
    c.fillStyle=tailWash;c.fill();
  }
  pathFrom(topRim.concat(bottomRim));
  c.save();c.clip();
  for(const side of [1,-1]){
    const rim=side===1?upper.slice(5).reverse():lower.slice(0,7);
    const rpts=curvePts(rim.map(at),22);
    for(let j=0;j<19;j++){
      const t=(j+.2)/19, end=rpts[Math.floor(t*(rpts.length-1))],a=rail(.717,side*(.001+t*.028));
      const mid=rail(.847+t*.026,side*(.002+t*(side>0?.043:.037)));
      const tailRay=c.createLinearGradient(...a,...end);
      tailRay.addColorStop(0,ink(0));tailRay.addColorStop(.32,ink(.09));tailRay.addColorStop(.65,ink(.21+.19*Math.sin(j*3.6+side)**2));tailRay.addColorStop(1,ink(.018));
      line([a,rail(.79,side*(.004+t*.014)),mid,mix(mid,end,.48),end],.0029+.0015*t,tailRay);
      if(j%2===0)line([mid,mix(mid,end,.6),mix(end,rpts[Math.min(rpts.length-1,Math.floor(t*rpts.length)+1)],.68)],.0015,tailRay);
    }
  }
  c.restore();
  // Nested washes are bounded by different head and caudal offsets, so the belly
  // and throat do not acquire a uniform contour around the whole silhouette.
  pathFrom(boundary);c.save();c.clip();
  c.fillStyle=warm(.10);c.fill();
  const M=46,us=positions;
  const dorsalEdge=us.map(u=>surf(u,1.02));
  for(let layer=0;layer<M;layer++){
    const f=layer/(M-1);
    const bottom=us.map(u=>{
      const cheek=Math.exp(-((u-.092)*(u-.092))/.0044);
      const tract=1-.35*Math.exp(-((u-.05)*(u-.05))/.0062)-.18*smooth(.65,.80,u);
      const width=(-1.03+1.97*f) + cheek*(.30+.23*Math.sin(Math.PI*f))-(tract-.9)*.84 +smooth(.76,.854,u)*1.25+.032*Math.sin(u*13+layer*.037);
      return surf(u,Math.min(.98,width));});
    pathFrom(dorsalEdge.concat(bottom.reverse()));
    c.fillStyle=ink(.0163+.025*Math.sin(Math.PI*f)**.85);c.fill();
  }
  // Short, offset crescents sit in the wash. Marks become incomplete on the belly.
  const cheekAxis=spineAt(p,.128), forehead=surf(.129,.33);
  c.save();c.translate(...forehead);c.transform(cheekAxis.tx,cheekAxis.ty,cheekAxis.nx,cheekAxis.ny,0,0);c.scale(L,L*.64);
  const headInk=c.createRadialGradient(0,0,.009,0,0,.125);
  headInk.addColorStop(0,ink(.28));headInk.addColorStop(.65,ink(.14));headInk.addColorStop(1,ink(0));
  c.fillStyle=headInk;c.fillRect(-.128,-.128,.256,.256);c.restore();
  const random=rng(4721);
  for(let row=0;row<10;row++){
    for(let j=0;j<21;j++){
      const u=.180+.0281*j+(row%2)*.014+(random()-.5)*.005, v=.91-row*.190+(random()-.5)*.042;
      const alpha=(.57-row*.036)*(.63+random()*.58)*smooth(.16,.27,u)*(1-.75*smooth(.60,.775,u));
      const span=.108+random()*.04, reach=.014+random()*.004;
      if(random()<.06+row*.022)continue;
      const pairs=[[u-.004,v+span],[u+.006,v+.78*span],[u+reach,v+.23*span],[u+reach*.96,v-.30*span],[u+.006,v-.74*span],[u-.003,v-span]];
      uvPen(pairs,.0033+.0020*random(),ink(alpha*.62));
      if(row<7 && random()>.29){
        uvPen([[u+.002,v+span],[u+.010,v+.66*span],[u+reach+.003,v+.11*span],[u+.013,v-.36*span]],.0065,ink(alpha*.25));
      }
      if(row>4 && random()<.36)uvPen([[u+.003,v-.08],[u+.008,v-.064],[u+.014,v-.037]],.0018,pigment(210,175,126,alpha*.92));
    }
  }
  c.restore();
  // A soft partial operculum and a broad, jointed pectoral leave the cheek open.
  uvPen([[.143,.54],[.169,.34],[.180,.08],[.178,-.105],[.163,-.29]],.013,warm(.19));
  uvPen([[.164,.33],[.18,.12],[.183,-.09],[.173,-.33],[.154,-.52]],.0053,ink(.35));
  // The pectoral folds backwards and broadens behind the operculum.
  web([[.167,-.030],[.193,-.043]],[[.167,-.031],[.190,-.034],[.216,-.045],[.245,-.073],[.277,-.102],[.302,-.126],[.301,-.147],[.286,-.158],[.262,-.159],[.240,-.144],[.215,-.109],[.192,-.066]],21,.63,true);
  const eye=surf(.078,-.10),basis=spineAt(p,.078);
  c.save();c.translate(...eye);c.transform(basis.tx,basis.ty,basis.nx,basis.ny,0,0);c.scale(L,L);
  const socket=c.createRadialGradient(.000,.006,.002,-.001,.005,.029);
  socket.addColorStop(0,pigment(175,154,112,.70));socket.addColorStop(.63,pigment(161,147,106,.51));socket.addColorStop(1,pigment(142,126,92,0));c.fillStyle=socket;c.beginPath();c.ellipse(0,.002,.031,.027,0,0,2*Math.PI);c.fill();
  c.fillStyle=pigment(163,146,104,.67);c.beginPath();c.ellipse(.000,0,.017,.0148,-.09,0,2*Math.PI);c.fill();
  c.beginPath();c.moveTo(-.019,.004);c.bezierCurveTo(-.017,.015,-.003,.019,.005,.014);c.bezierCurveTo(.012,.012,.017,.005,.018,.000);c.strokeStyle=ink(.53);c.lineWidth=.0031;c.stroke();
  c.fillStyle=pigment(39,38,33,.99);c.beginPath();c.ellipse(.003,-.003,.0103,.0084,-.09,0,2*Math.PI);c.fill();c.restore();
  uvPen([[.002,-.01],[.013,-.032],[.024,-.070],[.040,-.102]],.0041,ink(.42));
  uvPen([[.009,-.10],[.018,-.13],[.030,-.13]],.0036,warm(.30));
  c.restore();
}
function silkAttendant(c,p,opacity,variant) {
  const red=variant==='vermilion',L=p.L;
  const outline=red?[
    [0,0,0],[.022,.032,.020],[.077,.069,.048],[.15,.104,.073],[.28,.146,.092],
    [.40,.148,.100],[.52,.130,.092],[.62,.091,.073],[.71,.046,.044],[.77,.024,.024],[.81,.018,.013]
  ]:[
    [0,0,0],[.013,.012,.008],[.034,.023,.019],[.09,.035,.030],[.16,.050,.039],[.25,.053,.041],
    [.38,.045,.032],[.54,.031,.023],[.67,.018,.016],[.77,.009,.008],[.82,.006,.005]
  ];
  function width(u,k) {
    let i=0;while(i<outline.length-2 && outline[i+1][0]<u)i++;
    const a=outline[i],b=outline[i+1],pr=outline[Math.max(0,i-1)],ne=outline[Math.min(outline.length-1,i+2)];
    const d=b[0]-a[0],f=clamp((u-a[0])/d),f2=f*f,f3=f2*f;
    return a[k]*(2*f3-3*f2+1)+b[k]*(3*f2-2*f3)
      +d*((f3-2*f2+f)*(b[k]-pr[k])/(b[0]-pr[0])+(f3-f2)*(ne[k]-a[k])/(ne[0]-a[0]));
  }
  const end=outline[outline.length-1][0],last=spineAt(p,0);
  const axis=Math.abs(last.tx)>.05?(last.tx<0?1:-1):1;
  const wave=red?Math.sin(p.t*2.32+.6)*(.54+.28*Math.sin(p.t*.99)):
    Math.sin(p.t*6.16-.7)*(.22+.71*Math.pow(.5+.5*Math.sin(2.3*p.t+.8),2));
  function point(u,v) {
    const s=spineAt(p,u),tail=smooth(red?.57:.61,1,u),shift=axis*(v+(red?.021:.026)*tail*wave);
    return [s.x+s.nx*L*shift,s.y+s.ny*L*shift];
  }
  const body=(u,h)=>point(u,h*(h>0?width(u,1):width(u,2)));
  const ink=(a)=>red?'rgba(145,65,40,'+a*opacity+')':'rgba(39,54,57,'+a*opacity+')';
  const pigment=(a)=>red?'rgba(200,92,46,'+a*opacity+')':'rgba(57,71,78,'+a*opacity+')';
  const umber=(a)=>'rgba(126,98,61,'+a*opacity+')';
  const silk=(a)=>'rgba(191,158,104,'+a*opacity+')';
  const mix=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
  const path=points=>{c.beginPath();points.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.closePath();};
  const brush=(points,w,color)=>ribbon(c,points,s=>L*w*Math.pow(Math.max(0,Math.sin(Math.PI*s)),.65),color,17);
  const stroke=(pairs,w,color,proj=point)=>brush(curvePts(pairs.map(q=>proj(...q)),22),w,color);
  function membrane(base,edge,depth,rays,ground=0) {
    const a=point(...base[0]),b=point(...base[1]),rim=curvePts(edge.map(q=>point(...q)),22);
    if(ground){path([a,b,...rim.slice().reverse()]);c.fillStyle=pigment(ground);c.fill();}
    for(let i=0;i<8;i++) {
      const w=1-i/10;
      const edge=rim.map((q,j)=>mix(mix(a,b,j/(rim.length-1)),q,w));
      path([a,b,...edge.reverse()]);c.fillStyle=pigment(depth*(.04+.067*i/7));c.fill();
    }
    if(rays)for(let i=0;i<rays;i++){
      const f=(i+.44)/rays,root=mix(a,b,.26+f*.50),tip=mix(root,rim[Math.round(f*(rim.length-1))],.93-.11*Math.sin(i*1.36)**2);
      brush(curvePts([root,mix(mix(a,b,f),tip,.48),tip],12),red?.0030:.0023,ink(depth*((ground>.13?.22:.35)+.14*Math.cos(i))));
    }
  }
  // Upper and lower fan leaves share a wet root. The slim fork has much longer points.
  if(red) {
    membrane([[.753,.022],[.805,-.005]],[[.75,.019],[.82,.054],[.89,.108],[.951,.14],[.977,.118],[.976,.085],[.951,.048],[.902,.020],[.86,.000]],1.10,11,.26);
    membrane([[.765,.004],[.793,-.018]],[[.815,.004],[.88,-.010],[.946,-.032],[.999,-.077],[.985,-.115],[.945,-.127],[.887,-.102],[.829,-.059],[.776,-.025]],1.10,10,.26);
    membrane([[.285,.123],[.62,.076]],[[.29,.130],[.364,.170],[.419,.193],[.461,.186],[.536,.143],[.63,.076]],.79,15,.13);
    membrane([[.410,-.074],[.451,-.081]],[[.431,-.087],[.455,-.144],[.487,-.176],[.508,-.170],[.506,-.14],[.474,-.086]],.81,6);
    membrane([[.596,-.066],[.672,-.048]],[[.615,-.080],[.662,-.149],[.691,-.158],[.700,-.142],[.683,-.091],[.665,-.050]],.83,7);
  } else {
    membrane([[.755,.008],[.827,-.003]],[[.765,.008],[.861,.033],[.933,.065],[1,.117],[.985,.076],[.953,.042],[.888,.014],[.815,0]],.91,6,.080);
    membrane([[.76,.002],[.812,-.006]],[[.777,0],[.87,-.008],[.953,-.040],[.992,-.087],[.927,-.057],[.856,-.030],[.79,-.009]],.76,5,.066);
    membrane([[.40,.038],[.576,.021]],[[.393,.041],[.434,.061],[.493,.098],[.525,.103],[.510,.075],[.532,.047],[.576,.023]],.68,5);
    membrane([[.505,-.021],[.550,-.015]],[[.509,-.024],[.564,-.066],[.59,-.066],[.575,-.041],[.55,-.017]],.51,3);
    membrane([[.618,-.016],[.696,-.012]],[[.628,-.017],[.681,-.040],[.707,-.054],[.700,-.029],[.691,-.012]],.44,3);
  }
  function band(upper,lower) {
    const verts=[];
    for(let i=0;i<=38;i++)verts.push(body(end*i/38,upper));
    for(let i=38;i>=0;i--)verts.push(body(end*i/38,lower));
    path(verts);
  }
  c.save();band(1,-1);c.clip();
  band(1,-1);c.fillStyle=red?'rgba(194,115,65,'+opacity*.22+')':'rgba(151,143,113,'+opacity*.18+')';c.fill();
  // Overlapping veils carry pigment down from the spine and retain silk through the belly.
  for(let j=0;j<21;j++){
    const lower=-.91+j*(red?1.14:1.43)/20;
    band(red?.99:.96,lower);c.fillStyle=(j<5?umber:red?pigment:ink)(red?.052:.081);c.fill();
  }
  if(red) {
    for(let row=-2;row<=4;row++)for(let i=0;i<17;i++){
      const u=.167+i*.032+(row%2?.013:0),h=row*.195,tip=h-.160+.025*Math.sin(2.1*i+row);
      if(h>.57 && (i===0||u>.59))continue;
      stroke([[u,h],[u+.009,h-.027],[u+.013,(h+tip)*.5],[u+.012,tip]],.0053,pigment(.46),body);
      if(row>0 && i%3!==1)stroke([[u+.014,h-.05],[u+.017,h-.105],[u+.015,tip]],.0026,silk(.39),body);
    }
    stroke([[.18,.16],[.29,.12],[.41,.050],[.54,.020],[.65,.05],[.731,.10]],.0031,ink(.26),body);
  } else {
    stroke([[.07,.48],[.18,.61],[.32,.60],[.49,.46],[.67,.53],[.76,.40]],.012,pigment(.51),body);
    stroke([[.13,-.24],[.21,-.18],[.32,-.17],[.445,-.25],[.565,-.13],[.69,-.07]],.0074,silk(.76),body);
    for(let i=0;i<21;i++){
      const u=.19+.019*i,h=.19+.23*Math.sin(i*2.1);
      stroke([[u,h],[u+.006,h-.08],[u+.009,h-.245]],.0029,ink(.27),body);
    }
  }
  c.restore();
  if(red){
    stroke([[.130,.075],[.153,.029],[.157,-.011],[.143,-.044],[.121,-.060]],.005,ink(.36));
    membrane([[.159,-.045],[.208,-.065]],[[.164,-.050],[.182,-.079],[.229,-.129],[.235,-.132],[.242,-.107],[.224,-.074],[.2,-.059]],.94,7);
  } else {
    stroke([[.115,.019],[.128,.007],[.136,-.003],[.144,-.012],[.131,-.027]],.0037,ink(.56));
    membrane([[.119,-.014],[.163,-.022]],[[.123,-.015],[.142,-.036],[.178,-.069],[.201,-.085],[.200,-.059],[.188,-.038],[.165,-.019]],.73,4);
  }
  const u=red?.082:.061,s=spineAt(p,u),eye=point(u,red?-.015:-.006);
  c.save();c.translate(...eye);c.transform(s.tx,s.ty,s.nx*axis,s.ny*axis,0,0);c.scale(L,L);
  const e=red?.0115:.0094;
  c.beginPath();c.ellipse(-e*.09,e*.04,e*1.58,e*1.35,-.12,0,Math.PI*2);c.fillStyle=silk(.76);c.fill();
  c.beginPath();c.ellipse(e*.15,-e*.05,e,e*.87,-.12,0,Math.PI*2);c.fillStyle='rgba(47,42,32,'+.83*opacity+')';c.fill();c.restore();
  stroke(red?[[0,0],[.014,-.008],[.031,-.011],[.04,-.013]]:[[0,0],[.012,-.002],[.029,-.007]],.0035,ink(.45));
}
function drawSong(c,p,z,al=1,variant) {
  if(TREAL>=55 && TREAL<110){
    if(variant==="distant" || variant==="vermilion")return silkAttendant(c,p,al,variant);
    return swimSilkCarp(c,p,al,variant);
  }
  const L=p.L,k=L/150,pr=PROF.song,e=edges(p,pr),col=(r,g,b,a)=>'rgba('+[r,g,b,a*al].join(',')+')';
  const silkScene = TREAL >= 55 && TREAL < 110;
  const a=(u,v)=>bodyAt(p,pr,u,v),at=q=>a(...q);
  const pen=(points,w,tone,seed=1)=>ribbon(c,curvePts(points,Math.max(14,3*points.length)),v=>w*k*(.12+.88*Math.pow(Math.sin(Math.PI*v),.65)),tone,seed);
  const UV=(points,w,tone,seed)=>pen(points.map(at),w,tone,seed);
  const dark=(alpha)=>col(41,45,40,alpha),brown=(alpha)=>col(116,78,44,alpha);
  c.save();c.lineCap='round';c.lineJoin='round';
  const fins=[[.27,.56,.069,1,1],[.585,.717,.050,-1,1.5],[.409,.509,.059,-1,1.7]];
  for(const [u0,u1,h,side,back] of fins) {
    const f=finPts(p,pr,u0,u1,h,side,back);
    finPath(c,f);const q=f.base[7],v=f.out[7],wash=c.createLinearGradient(...q,...v);
    wash.addColorStop(0,dark(.35));wash.addColorStop(.56,brown(.21));wash.addColorStop(1,dark(.12));c.fillStyle=wash;c.fill();
    for(let i=2;i<15;i+=2){
      const b=f.base[Math.max(0,i-1)],end=f.out[i],m=[lerp(b[0],end[0],.53),lerp(b[1],end[1],.48)];
      pen([b,m,end],i%4===0?.84:.49,dark(.31),i);
    }
    pen(f.out.slice(2,13),.70,dark(.36));
  }
  const tail=tailSongPath(c,p),rail=(u,v)=>{const q=spineAt(p,u);return[q.x+q.nx*v*L,q.y+q.ny*v*L];};
  const wash=c.createLinearGradient(...tail.base,...rail(.992,0));
  wash.addColorStop(0,dark(.43));wash.addColorStop(.43,brown(.27));wash.addColorStop(1,dark(.30));
  c.fillStyle=wash;c.fill();
  c.save();c.clip();
  for(const sign of [1,-1])for(let j=0;j<9;j++){
    const t=(j+.5)/9,reach=.910+.087*t,spread=sign*(.010+.12*t)*Math.pow(t,.42);
    pen([rail(.755,sign*.012),rail(.838,sign*(.004+.014*t)),rail(.891,spread*.29),rail(reach,spread)],j===7?1.15:.62,dark(j===7?.52:.31),23+j);
  }
  c.restore();
  const belly=col(183,156,106,.22);
  bodyFill(c,e);c.fillStyle=col(134,122,91,.21);c.fill();
  c.save();bodyFill(c,e);c.clip();
  // Transverse washes run with the spine even when the fish turns downwards.
  if (silkScene) {
    // Successive broad ink washes share the dorsal edge. Their opacity accumulates
    // towards the back while the ventral silk shows through.
    for (let j=0;j<42;j++) {
      const v=-.97+1.93*j/41;
      bandPath(c,p,pr,.0001,.799,1.08,v);
      c.fillStyle=col(40,52,49,.018+.020*Math.max(0,1-Math.abs(v-.23)));
      c.fill();
    }
  } else for(let j=0;j<21;j++) {
    const v0=1.05-j*.092,v1=v0-.155;
    const blend=Math.max(0,Math.min(1,(v0+1)/2));
    bandPath(c,p,pr,.001,.799,v0,v1);
    c.fillStyle=col(50+Math.round(85*(1-blend)),61+Math.round(56*(1-blend)),56+Math.round(24*(1-blend)),.035+.33*Math.pow(blend,1.50));
    c.fill();
  }
  for(let row=0;row<8;row++)for(let i=0;i<17;i++){
    const u=.213+i*.0333+(row%2)*.016,v=.87-row*.207;
    const weight=Math.min(1,(.792-u)*10)*(.55+.45*Math.cos((u-.40)*5));
    if(weight<=.05)continue;
    const mark=(1+.12*Math.sin(i*19+row*7)),spread=.080+.073*weight;
    const q=a(u,v),m=a(u+.022*mark,v-.008),b=a(u-.001,v-spread);
    c.beginPath();c.moveTo(...a(u-.003,v+spread));c.quadraticCurveTo(...m,...b);
    c.strokeStyle=dark((.060+.225*(1-row/8))*weight);c.lineWidth=k*(.5+.42*weight);c.stroke();
    if(row<4 && (i+row)%3!==0)pen([a(u-.001,v+.05),q,a(u+.006,v-.03)],.75,dark(.23*weight),i);
  }
  UV([[.095,.65],[.14,.77],[.23,.75],[.36,.71],[.48,.70],[.62,.58],[.73,.45]],3.5,col(78,100,91,.14));
  UV([[.19,-.52],[.27,-.57],[.39,-.66],[.55,-.69],[.67,-.51]],2.4,belly);
  c.restore();
  if (silkScene) {
    pen(e.top.slice(3,32),.82,dark(.32),21);
    pen(e.top.slice(27,39),.53,dark(.28),22);
  } else pen(e.top.slice(1,39),1.26,dark(.64),21);
  pen(e.bot.slice(1,13),.91,brown(.52));pen(e.bot.slice(18,38),.58,brown(.38));
  if (silkScene) {
    UV([[.146,.62],[.168,.43],[.183,.16],[.183,-.085]],1.50,brown(.20));
    UV([[.177,.36],[.188,.10],[.185,-.14],[.174,-.32],[.153,-.46]],.82,dark(.33));
  } else {
    UV([[.124,.79],[.154,.68],[.177,.38],[.186,-.01],[.166,-.40],[.144,-.52]],1.09,dark(.56));
    UV([[.118,.59],[.143,.36],[.152,.16]],.74,brown(.39));
  }
  // The near fin grows from the operculum. Its buried shoulder carries the body colour.
  const root=a(.168,-.39),q1=a(.202,-.39),far=a(.312,-1.36),q2=a(.209,-1.03);
  const pectoral=c.createLinearGradient(...root,...far);
  pectoral.addColorStop(0,dark(.36));pectoral.addColorStop(.56,brown(.32));pectoral.addColorStop(1,dark(.24));
  c.beginPath();c.moveTo(...root);c.bezierCurveTo(...q1,...a(.280,-.82),...far);
  c.bezierCurveTo(...a(.282,-1.30),...q2,...root);c.fillStyle=pectoral;c.fill();
  for(let i=0;i<5;i++)UV([[.17,-.42],[.210,-.60-.04*i],[.249,-.80-.054*i],[.301-.003*i,-1.22-.018*i]],.5,dark(.31),i);
  if (silkScene) {
    // The contact at the snout stays at its existing point. Only pigment is changed.
    UV([[.003,-.005],[.011,.017],[.023,-.004],[.038,-.068]],.81,dark(.40));
    UV([[.010,-.10],[.021,-.115],[.028,-.095]],.57,brown(.22));
    const eye=a(.085,.09),axis=spineAt(p,.085);
    c.save();c.translate(...eye);c.transform(axis.tx,axis.ty,axis.nx,axis.ny,0,0);c.scale(L,L);
    const socket=c.createRadialGradient(.001,-.004,.002,-.001,.001,.029);
    socket.addColorStop(0,col(192,170,121,.76));
    socket.addColorStop(.59,col(172,150,104,.57));
    socket.addColorStop(1,col(120,110,79,0));
    c.fillStyle=socket;c.beginPath();c.ellipse(0,0,.030,.024,0,0,2*Math.PI);c.fill();
    c.beginPath();c.ellipse(0,-.0005,.0178,.0129,.05,0,2*Math.PI);
    c.fillStyle=col(173,151,107,.60);c.fill();
    // Partial upper rim lies close to the iris and disappears into the forehead.
    c.beginPath();c.moveTo(-.022,.002);c.bezierCurveTo(-.021,.012,-.011,.016,.000,.015);
    c.bezierCurveTo(.009,.015,.015,.010,.018,.006);
    c.strokeStyle=dark(.34);c.lineWidth=.0025;c.stroke();
    c.beginPath();c.ellipse(.0009,-.0024,.0113,.0072,.03,0,2*Math.PI);
    c.fillStyle=dark(.93);c.fill();
    c.restore();
  } else {
  UV([[.015,.025],[.029,.13],[.049,.10],[.065,.035]],.85,dark(.76));
  UV([[.006,-.006],[.021,-.13],[.044,-.14],[.062,-.10]],.71,brown(.58));
  const eye=a(.074,.325);
  c.beginPath();c.arc(...eye,.018*L,0,Math.PI*2);c.fillStyle=col(171,148,94,.76);c.fill();
  c.beginPath();c.arc(...eye,.012*L,0,Math.PI*2);c.fillStyle=dark(.94);c.fill();
  pen([a(.049,.43),a(.065,.57),a(.083,.56),a(.092,.45)],.92,dark(.72));
  const shine=a(.069,.36);c.beginPath();c.arc(...shine,.0034*L,0,Math.PI*2);c.fillStyle=col(233,218,175,.72);c.fill();
  }
  c.restore();
}
// 元青花：鳜鱼
function tailYuanPath(c,p){
  const xy=(u,v)=>{const s=spineAt(p,u);return[s.x+s.nx*v*p.L,s.y+s.ny*v*p.L];};
  // 尾柄收紧后才缓慢展开；顺着末梢脊线弯成圆钝的单叶。
  c.beginPath();c.moveTo(...xy(.787,.033));
  c.bezierCurveTo(...xy(.825,.030),...xy(.831,.043),...xy(.86,.056));
  c.bezierCurveTo(...xy(.897,.078),...xy(.931,.090),...xy(.956,.083));
  c.bezierCurveTo(...xy(.984,.078),...xy(1,.058),...xy(1,.021));
  c.bezierCurveTo(...xy(1,-.018),...xy(.984,-.050),...xy(.959,-.062));
  c.bezierCurveTo(...xy(.929,-.075),...xy(.895,-.068),...xy(.862,-.052));
  c.bezierCurveTo(...xy(.832,-.040),...xy(.818,-.026),...xy(.787,-.029));
  c.closePath();return xy;
}
function jit(pts,amp,seed){return pts.map((q,i)=>[q[0]+amp*Math.sin(i*1.7+seed)*Math.sin(i*0.37+seed*2),q[1]+amp*Math.cos(i*1.3+seed)*Math.sin(i*0.53+seed)]);}

function blueSpines(p){
 const pr=PROF.yuan;
 return [[.185,.105,-.013],[.218,.126,-.007],[.252,.119,.003],[.284,.109,.009],[.313,.11,.013],[.353,.094,.016],[.39,.086,.019],[.43,.079,.020],[.468,.067,.022]].map(([u,h,sweep])=>{
   const s=spineAt(p,u), b=bodyAt(p,pr,u,.93), tip=[b[0]+p.L*(s.nx*h-s.tx*sweep),b[1]+p.L*(s.ny*h-s.ty*sweep)];return {b,tip,s,h};
 });
}
function blueFinWeb(c,sp){
 c.beginPath(); c.moveTo(...sp[0].b);c.lineTo(...sp[0].tip);
 for(let i=1;i<sp.length;i++){const prev=sp[i-1],e=sp[i];
   const sag=.38*Math.hypot(e.tip[0]-e.b[0],e.tip[1]-e.b[1]);
   const x=lerp(prev.tip[0],e.tip[0],.64)-e.s.nx*sag;
   const y=lerp(prev.tip[1],e.tip[1],.64)-e.s.ny*sag;
   c.quadraticCurveTo(x,y,...e.tip);
 }
 for(let i=sp.length-1;i>=0;i--)c.lineTo(...sp[i].b);c.closePath();
}
function heldPorcelainPetal(c,p,rgb,mode='ink') {
  const bite=yuanBite(p), n=spineAt(p,0), length=p.L;
  const angle=Math.atan2(n.ty,n.tx)-.27, f=length*.137;
  c.save(); c.translate(bite.x,bite.y); c.rotate(angle);c.scale(f,f);
  c.beginPath();c.moveTo(-.017,0);
  c.bezierCurveTo(.10,-.013,.22,-.079,.39,-.116);
  c.bezierCurveTo(.57,-.167,.77,-.200,.92,-.171);
  c.bezierCurveTo(1.02,-.153,1.00,-.080,.942,-.025);
  c.bezierCurveTo(.904,.015,.846,.030,.819,.048);
  c.quadraticCurveTo(.885,.077,.917,.122);
  c.bezierCurveTo(.80,.20,.62,.229,.468,.177);
  c.bezierCurveTo(.310,.139,.207,.049,.103,.035);
  c.quadraticCurveTo(.030,.014,-.017,0);c.closePath();
  const paint=(a)=>'rgba('+rgb.join(',')+','+a+')';
  if(mode==='free'){
    const wash=c.createLinearGradient(.12,-.12,.72,.23);
    wash.addColorStop(0,'#aab7c6');wash.addColorStop(.52,'#d7dee1');wash.addColorStop(1,'#adbed3');
    c.fillStyle=wash;
  }else c.fillStyle=paint(.23);
  c.fill();c.lineJoin='round';c.lineWidth=.019;c.strokeStyle=paint(.88);c.stroke();
  // One folded edge is heavier, then loses the brush before the split petal tip.
  c.beginPath();c.moveTo(.06,.010);c.bezierCurveTo(.26,-.004,.51,.063,.77,.012);
  c.quadraticCurveTo(.525,.088,.298,.047);c.quadraticCurveTo(.16,.021,.06,.010);c.fillStyle=paint(.66);c.fill();
  c.beginPath();c.moveTo(.49,.115);c.quadraticCurveTo(.62,.151,.74,.118);c.lineWidth=.009;c.strokeStyle=paint(.35);c.stroke();
  c.restore();
}
function yuanBite(p) {
  const s=spineAt(p,.025);return {x:s.x-s.nx*p.L*.027,y:s.y-s.ny*p.L*.027};
}
function yuanLipOver(c,p,rgb,al=1) {
  const L=p.L,at=(x,y)=>{const s=spineAt(p,x);return[s.x-s.nx*L*y,s.y-s.ny*L*y]};
  const pts=curvePts([[.002,.015],[.014,.020],[.027,.026],[.040,.032],[.048,.034]].map(q=>at(...q)),17);
  ribbon(c,pts,t=>L*(.00055+.0042*Math.sin(Math.PI*t)), 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+al+')',47);
}
function yuanBrushFish(c,p,rgb,alpha,shapeOnly) {
  const L=p.L, s=L/1000;
  const ink=a=>'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+(a*alpha)+')';
  let livingFin=false;
  const pulse=smooth(95.0,96.15,TREAL)*(1-smooth(104.8,106.3,TREAL));
  const turn=pulse*(.135*Math.sin((TREAL-95.2)*4.3)+.045*Math.sin((TREAL-95.2)*8.6-.52));
  function at(x,y) {
    if(livingFin && pulse){const dx=x-188,dy=y-91,angle=turn*smooth(0,55,dy);
      x=188+dx*Math.cos(angle)-dy*Math.sin(angle);y=91+dy*Math.cos(angle)+dx*Math.sin(angle);}
    const u=clamp(x/1000),q=spineAt(p,u),ext=(x/1000-u)*L;
    return [q.x-q.tx*ext-q.nx*y*s,q.y-q.ty*ext-q.ny*y*s];
  }
  // Map each control point into the moving fish. The stroke narrows through each turn.
  function trace(points,close=false,ctx=c) {
    const a=points.map(q=>at(q[0],q[1]));
    const limit=close?a.length:a.length-1;
    const point=i=>a[close?(i+a.length)%a.length:Math.max(0,Math.min(a.length-1,i))];
    ctx.moveTo(...a[0]);
    for(let i=0;i<limit;i++) {
      const h=point(i-1),b=point(i),d=point(i+1),f=point(i+2);
      ctx.bezierCurveTo(b[0]+(d[0]-h[0])*.13,b[1]+(d[1]-h[1])*.13,d[0]-(f[0]-b[0])*.13,d[1]-(f[1]-b[1])*.13,...d);
    }
    if(close)ctx.closePath();
  }
  function fill(points,strength) {
    c.beginPath();trace(points,true);c.fillStyle=ink(strength);c.fill();
  }
  function pen(points,width,strength,seed=6) {
    const rail=curvePts(points.map(q=>at(...q)),Math.max(10,points.length*3));
    ribbon(c,rail,t=>s*width*(.13+.87*Math.pow(Math.sin(Math.PI*t),.52))*(1+.09*Math.sin(8*t+.4*seed)),ink(strength),seed);
  }
  const top=[[-6,14],[10,5],[34,-26],[62,-55],[110,-82],[177,-113],[267,-136],[362,-141],[455,-123],[530,-100],[606,-68],[701,-42],[761,-37],[803,-38]];
  const bottom=[[805,33],[760,48],[688,68],[626,95],[546,124],[465,145],[376,156],[297,149],[213,126],[144,101],[94,72],[54,54],[18,32],[-10,22]];
  const gape=[[-1,21],[11,25],[27,31],[40,35],[44,33],[28,26],[13,20],[2,16]];
  const body=top.concat(bottom,gape);
  const tail=[[759,-28],[805,-37],[848,-65],[891,-87],[939,-91],[975,-72],[995,-40],[994,4],[974,30],[942,55],[904,66],[856,63],[817,48],[773,44]];
  const paired=[
    [[135,82],[148,99],[133,113],[122,137],[139,158],[171,168],[211,159],[238,146],[260,120],[225,103],[190,92]],
    [[354,126],[357,146],[381,171],[411,192],[446,202],[490,200],[501,188],[492,169],[469,144],[430,133]],
    [[672,77],[671,95],[702,111],[759,119],[802,113],[814,97],[801,79],[769,65],[725,62]],
  ];
  const dorsal=[
    [[389,-128],[397,-177],[406,-236],[411,-205],[420,-169],[430,-132]],
    [[421,-130],[426,-164],[433,-229],[439,-196],[451,-163],[459,-123]],
    [[453,-121],[465,-169],[477,-226],[481,-190],[494,-145],[504,-114]],
    [[498,-110],[506,-151],[520,-209],[525,-171],[539,-136],[549,-94]],
    [[539,-95],[550,-137],[564,-188],[569,-155],[580,-118],[594,-78]],
    [[581,-78],[600,-127],[610,-163],[616,-131],[628,-96],[636,-66]],
    [[625,-64],[643,-100],[657,-147],[660,-114],[670,-82],[683,-57]],
    [[671,-53],[691,-93],[705,-130],[709,-100],[718,-76],[730,-49]],
    [[717,-46],[740,-87],[755,-116],[758,-91],[771,-66],[784,-43]],
  ];
  const fanBase=[[382,-128],[398,-157],[406,-222],[413,-176],[426,-168],[434,-213],[446,-170],[462,-168],[477,-211],[485,-169],[506,-151],[519,-196],[530,-154],[549,-137],[564,-180],[576,-135],[596,-122],[610,-156],[621,-118],[640,-103],[657,-138],[672,-108],[695,-94],[704,-123],[718,-95],[739,-85],[755,-108],[764,-86],[779,-86],[794,-96],[804,-84],[799,-60],[774,-34],[689,-31],[591,-65],[501,-92]];
  if(shapeOnly) {
    c.fillStyle=shapeOnly;
    for(const pts of [body,tail,fanBase,...paired,...dorsal]){livingFin=pts===paired[0];c.beginPath();trace(pts,true);c.fill();}livingFin=false;
    return;
  }
  c.save();c.lineJoin='round';c.lineCap='round';
  fill(fanBase,.24);
  for(let i=0;i<dorsal.length;i++){
    const v=dorsal[i]; const [x,y]=v[2]; const [bx,by]=v[0];
    fill(v,.41+(i%3)*.09);
    pen([[bx,by],[(bx+x)/2+3,(by+y)/2+7],[x,y],[x+2,y+11]],7-(i%3)*.65,.94,19+i);
    pen([[bx+12,by+2],[x+5,(by+y)/2+2],[x+1,y+19]],2.6,.77);
  }
  function rayPad(points,root,stops) {
    fill(points,.54);c.save();c.beginPath();trace(points,true);c.clip();
    for(let i=0;i<stops.length;i++){
      const [dx,dy]=stops[i];const [ox,oy]=root;
      pen([[ox-3,oy-1],[(ox+dx)*.5-3,(oy+dy)*.5-4],[dx,dy]],i%3===0?5.4:2.9,.68);
    }
    c.restore();pen(points.concat([points[0]]),3.1,.82);
  }
  livingFin=true;rayPad(paired[0],[191,96],[[124,132],[128,145],[141,154],[153,160],[171,166],[190,160],[211,153],[229,145]]);
  livingFin=false;rayPad(paired[1],[365,139],[[425,196],[441,198],[458,198],[475,198],[490,195],[500,187],[493,176]]);
  rayPad(paired[2],[677,83],[[796,77],[808,86],[810,94],[807,102],[794,110],[778,115],[759,117]]);
  fill(tail,.46);c.save();c.beginPath();trace(tail,true);c.clip();
  fill([[762,-26],[820,-47],[865,-64],[922,-69],[963,-47],[948,-56],[900,-50],[843,-27],[797,-6]],.61);
  const tailRand=rng(922);
  for(let i=0;i<67;i++){
    const x=807+tailRand()*192,y=-80+tailRand()*142;
    const size=2.1+tailRand()*6.5;
    const pts=[[x-size,y],[x-1,y-size*.93],[x+size*.84,y-size*.5],[x+size*.55,y+size*.54],[x-1,y+size*.16]];
    fill(pts,.34+tailRand()*.59);
    if(i%5===0)pen([[x+1,y+2],[x+size,y+7],[x+size*1.54,y+8]],2.2,.77);
  }
  for(const [a,b] of [[-37,-72],[-26,-52],[-11,-29],[5,-4],[14,20],[25,47]]){
    pen([[790,a],[834,a+1],[881,b+4],[942,b]],3.6,.46);
  }
  c.restore();pen(tail.concat([tail[0]]),5.3,.8);

  const eye=at(121,-50);
  // Two porcelain reserves run round the gill, the second interrupted by a bony ridge.
  const reserves=[
    [[192,-52],[203,-59],[200,-20],[195,12],[176,52],[149,69],[124,72],[150,63],[168,45],[179,24],[186,3]],
    [[260,-67],[278,-50],[291,-11],[300,11],[283,45],[256,71],[213,90],[172,92],[200,81],[240,63],[263,40],[276,16],[272,-7],[264,-37]],
    [[213,-26],[221,-37],[234,-44],[228,-30],[221,-20],[219,-7]],
  ];
  c.save();c.beginPath();trace(body,true);c.clip();c.beginPath();c.rect(-1e5,-1e5,2e5,2e5);
  for(const r of reserves)trace(r,true);
  c.moveTo(eye[0]+s*17.4,eye[1]);c.arc(eye[0],eye[1],s*17.4,0,Math.PI*2);
  c.clip('evenodd');fill(body,.058);
  const dorsalGround=[[-4,14],[66,-62],[175,-120],[281,-148],[372,-150],[541,-116],[707,-54],[808,-45],[820,-3],[738,14],[622,23],[543,33],[449,31],[358,58],[266,52],[228,75],[139,85],[106,69],[69,47],[23,27]];
  fill(dorsalGround,.49);
  c.save();c.beginPath();c.rect(-1e5,-1e5,2e5,2e5);
  for(const stroke of [
    [[69,-19],[94,8],[119,28],[125,38],[110,35],[84,13],[63,-11]],
    [[160,-37],[153,-10],[131,18],[123,24],[136,8],[149,-18]],
    [[226,-54],[239,-60],[258,-42],[269,-18],[258,-28],[248,-46]],
    [[295,-96],[325,-99],[369,-93],[396,-84],[368,-85],[331,-92]],
    [[357,-76],[395,-71],[436,-64],[470,-47],[438,-54],[401,-63]],
    [[314,-43],[344,-47],[391,-34],[411,-22],[377,-28],[344,-38]],
    [[420,-48],[474,-37],[510,-24],[555,-23],[518,-17],[465,-29]],
    [[480,-13],[535,-9],[581,-14],[619,-12],[580,-6],[535,-2]],
    [[578,-37],[607,-35],[624,-29],[596,-29]],
    [[674,-17],[718,-23],[745,-25],[722,-17]],
  ]) trace(stroke,true);
  c.clip('evenodd');
  // A firm edge of cobalt on the back dissolves in broken dabs across the flank.
  fill([[-5,14],[10,4],[37,-32],[68,-67],[173,-117],[282,-145],[367,-147],[470,-131],[608,-72],[733,-51],[803,-44],[816,-6],[753,2],[679,0],[612,14],[549,19],[488,37],[411,31],[360,51],[287,58],[245,47],[187,54],[138,58],[98,37]],.56);
  fill([[-5,14],[10,3],[36,-31],[70,-62],[147,-98],[248,-141],[352,-145],[452,-127],[560,-99],[629,-71],[746,-43],[801,-40],[813,-19],[749,-22],[676,-14],[611,-6],[546,6],[489,-1],[446,9],[383,11],[325,21],[300,-12],[280,-48],[255,-62],[228,-49],[209,-8],[195,40],[162,65],[132,84],[106,85],[105,62],[136,48],[147,24],[160,-2],[151,9],[123,32],[93,29],[61,1]],.87);
  fill([[276,-88],[321,-116],[386,-111],[478,-90],[566,-54],[674,-31],[779,-34],[764,-18],[650,3],[560,-7],[479,-34],[409,-57],[339,-71]],.65);
  fill([[76,-53],[102,-82],[148,-106],[190,-111],[169,-72],[157,-48],[144,-23],[127,-6],[119,24],[101,27],[95,13],[112,-21]],.64);
  fill([[196,-54],[228,-64],[251,-63],[269,-24],[274,4],[260,32],[225,63],[179,82],[151,82],[168,72],[198,55],[211,35],[220,17],[207,11],[216,-1],[207,-12],[216,-22],[205,-28]],.82);
  pen([[335,-114],[403,-105],[467,-80],[516,-65],[568,-46]],12,.61);
  pen([[350,-70],[435,-44],[501,-27],[581,-18],[633,-20]],11,.68);
  pen([[412,-31],[478,-18],[526,-11],[563,-13]],5,.58);
  c.restore();
  pen([[46,-16],[57,-7],[87,18],[102,27]],7.8,.60);
  pen([[164,-57],[163,-35],[154,-18],[143,3]],4.2,.72);
  pen([[247,-62],[259,-45],[267,-21]],4.1,.62);
  // Vary the scale groups in density and tilt as they round the body.
  const grain=rng(3891);
  for(let row=0;row<5;row++){
    const lo=[258,306,354,425,491][row],hi=[780,815,804,747,683][row];
    for(let x=lo;x<hi;x+=17+grain()*15){
      const y=2+row*12+13*Math.sin((x-179)/147)-27*(x-420)/400+(grain()-.5)*11;
      if(row===4&&grain()<.42)continue;
      const w=(3.4+grain()*7.1)*(1-row*.066),h=2.3+grain()*6.9;
      if(grain()<.34){
        fill([[x-w*.64,y],[x-w*.18,y-h*.68],[x+w*.49,y-h*.42],[x+w*.68,y+h*.08],[x+w*.23,y+h*.76],[x-w*.61,y+h*.36]],.45+grain()*.55);
      }else{
        fill([[x-w,y-1],[x-w*.2,y-2],[x+w,y-h*.49],[x+w*.35,y+h*.45],[x-w*.15,y+h],[x-w*.53,y+h*.25]],.45+grain()*.55);
      }
    }
  }
  // Sparse, fine fissures sit on groups of scales, not all across the underbelly.
  for(let i=0;i<60;i++){
    const x=291+grain()*503,y=-87+grain()*69;
    if(Math.sin(x*.034+y*.023)<.15) continue;
    pen([[x-4,y-1],[x+2,y+6],[x+9,y+5],[x+12,y+1]],1.65+grain()*1.45,.32+grain()*.5);
  }
  c.restore();
  // Partial contours carry more ink on the upper lip, jaw hinge, and back.
  pen(top.slice(0,8),6.3,.93);pen(top.slice(7),4.8,.92);
  pen(bottom.slice(0,8),3.5,.72);pen(bottom.slice(7),4.3,.78);
  pen([[-10,22],[12,24],[42,34],[68,40],[100,47],[128,42],[148,27]],5.1,.94);
  pen([[-8,22],[25,35],[61,54],[104,72],[138,73]],2.5,.81);
  pen([[-6,14],[11,4],[25,-11],[39,-23],[66,5],[91,28],[115,37]],4.8,.89);
  pen([[55,-39],[71,-14],[84,0],[97,18]],2.15,.7);
  pen([[191,-64],[184,-31],[181,6],[170,36],[146,59],[116,65]],4.5,.88);
  pen([[224,-56],[216,-43],[203,-32],[211,-26],[201,-12],[208,-8],[200,7],[208,13],[196,34],[177,58]],5.9,.95);
  pen([[256,-64],[276,-41],[295,5],[295,20],[272,53],[247,70],[195,92],[170,93]],4.2,.9);
  pen([[266,-46],[280,-12],[283,6],[272,34],[254,49]],2,.63);
  c.beginPath();c.arc(eye[0]-.8*s,eye[1]+1.6*s,8.8*s,0,Math.PI*2);c.fillStyle=ink(.98);c.fill();
  pen([[94,-53],[107,-69],[123,-72],[140,-63]],2.5,.83);
  // The rounded pectoral fin is laid on after the scales, at the lower edge of the gill.
  const pectoral=[[288,61],[316,47],[353,43],[385,42],[413,44],[431,53],[435,62],[424,73],[395,90],[356,100],[312,102],[289,93],[283,84]];
  rayPad(pectoral,[285,79],[[406,42],[420,48],[435,54],[436,64],[428,71],[420,80],[402,87],[387,93],[374,99]]);
  pen([[274,80],[284,73],[292,66],[300,61]],4.3,.85);
  c.restore();yuanLipOver(c,p,rgb,alpha);
}
function drawYuan(c,p,rgb,al,bl){yuanBrushFish(c,p,rgb,al,null);}
