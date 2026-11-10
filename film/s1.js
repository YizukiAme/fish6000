// ================= 壹 · 人面鱼纹彩陶盆（仰韶文化 · 半坡类型，仿） =================
const S1X=0,S1Y=0;
const RB=262,RI=0.86*RB,RBOT=0.36*RB,RC=0.47*RB,BH=17,DEP=0.45*RB,LIP=7,LIPO=6;
const L0=140;
const MSB=3.2,BW=Math.ceil(2*(RB+12)*MSB),BHALF=BW/2;
const LGT=(()=>{const v=[0.42,-0.52,0.745];const l=Math.hypot(...v);return v.map(a=>a/l);})();
const LXYN=Math.hypot(LGT[0],LGT[1]),LXY=[LGT[0]/LXYN,LGT[1]/LXYN],TANE=LGT[2]/LXYN;
const HV=(()=>{const v=[LGT[0],LGT[1],LGT[2]+1];const l=Math.hypot(...v);return v.map(a=>a/l);})();
const SLOT=Math.PI/2*RC; // 每条鱼在纹带里的位置长度
const PHI_F=Math.PI+0.62; // 主角在纹带里的“本位”（鱼头角度）

// 盆的剖面：沿=0，向下为负
function bprof(r){
  if(r>=RB-LIPO){const q=Math.min(1,(r-(RB-LIPO))/LIPO);const sq=Math.sqrt(Math.max(1e-4,1-q*q));return{h:-LIPO+LIPO*sq,dh:-Math.min(6,q/sq)};}
  if(r>=RI){const q=Math.min(1,(RI+LIP-r)/LIP);if(q<=0)return{h:0,dh:0};const sq=Math.sqrt(Math.max(1e-4,1-q*q));return{h:-LIP+LIP*sq,dh:Math.min(6,q/sq)};}
  if(r>RBOT){const s=(r-RBOT)/(RI-RBOT);const sq=Math.sqrt(Math.max(1e-4,1-s*s));return{h:-LIP-(DEP-LIP)*sq,dh:Math.min(6,(DEP-LIP)*s/sq/(RI-RBOT))};}
  return{h:-DEP,dh:0};}
function shadeAt(x,y){const r=Math.hypot(x,y);if(r>RB)return 1;const pr=bprof(r);const c=r>0?x/r:0,s=r>0?y/r:0;
  let nx=-pr.dh*c,ny=-pr.dh*s,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
  const ndl=nx*LGT[0]+ny*LGT[1]+nz*LGT[2];let sh=clamp(0.30+0.70*Math.max(0,ndl)/0.80,0,1);
  if(r<RI+LIP*0.6){const b=x*LXY[0]+y*LXY[1],cc=r*r-RI*RI;const sd=-b+Math.sqrt(Math.max(0,b*b-cc));const dep=-pr.h;sh*=1-0.6*smooth(-5,9,dep-sd*TANE);}
  sh*=1-0.12*Math.exp(-Math.pow((r-RBOT)/14,2));return sh;}

// ---------- 半坡鱼：形体定义在 (u, Y) 平面上，再贴到弯曲的脊线上 ----------
function BP(p,u,y){const s=spineAt(p,u);return[s.x+s.nx*y,s.y+s.ny*y];}
function bpPoly(c,p,pts,H){c.beginPath();let first=true;const n0=pts.length;
  for(let i=0;i<n0;i++){const a=pts[i],b=pts[(i+1)%n0];const n=Math.max(1,Math.ceil(Math.abs(b[0]-a[0])*60));
    for(let j=0;j<n;j++){const v=j/n;const q=BP(p,lerp(a[0],b[0],v),lerp(a[1],b[1],v)*H);if(first){c.moveTo(q[0],q[1]);first=false;}else c.lineTo(q[0],q[1]);}}c.closePath();}
function bpLine(c,p,pts,H){c.beginPath();for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const n=Math.max(1,Math.ceil(Math.abs(b[0]-a[0])*60));
  for(let j=(i?1:0);j<=n;j++){const v=j/n;const q=BP(p,lerp(a[0],b[0],v),lerp(a[1],b[1],v)*H);(i||j)?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}}}
const mrph=(A,B,w)=>A.map((q,i)=>[lerp(q[0],B[i][0],w),lerp(q[1],B[i][1],w)]);
const BPS={
  headA:[[0.0,0.26],[0.035,0.52],[0.1,0.78],[0.18,0.95],[0.265,1.03],[0.265,-1.0],[0.18,-0.9],[0.1,-0.72],[0.03,-0.48],[0.004,-0.26]],
  headB:[[0.0,0.0],[0.05,0.185],[0.11,0.407],[0.19,0.704],[0.27,1.0],[0.27,-1.0],[0.19,-0.704],[0.11,-0.407],[0.05,-0.185],[0.0,0.0]],
  mouthA:[[-0.012,0.21],[0.088,-0.01],[-0.012,-0.23]],mouthB:[[-0.01,0.0],[0.0,0.0],[-0.01,0.0]],
  gillA:[[0.218,0.94],[0.19,0.46],[0.181,0.0],[0.19,-0.46],[0.218,-0.92]],gillB:[[0.276,1.02],[0.276,0.5],[0.276,0.0],[0.276,-0.5],[0.276,-1.02]],
  bodyA:[[0.25,1.03],[0.33,1.06],[0.42,1.04],[0.52,0.95],[0.62,0.8],[0.72,0.6],[0.8,0.43],[0.845,0.35],[0.845,-0.33],[0.8,-0.41],[0.72,-0.57],[0.62,-0.76],[0.52,-0.9],[0.42,-0.99],[0.33,-1.02],[0.25,-1.0]],
  bodyB:[[0.29,1],[0.36,1],[0.44,1],[0.52,1],[0.6,1],[0.68,1],[0.76,1],[0.82,1],[0.82,-1],[0.76,-1],[0.68,-1],[0.6,-1],[0.52,-1],[0.44,-1],[0.36,-1],[0.29,-1]],
  fins:[[[[0.36,0.99],[0.445,1.8],[0.5,0.96]],1],[[[0.58,0.83],[0.64,1.4],[0.68,0.7]],1],[[[0.4,-0.96],[0.47,-1.64],[0.52,-0.9]],-1],[[[0.62,-0.74],[0.675,-1.26],[0.71,-0.62]],-1]],
  tailA:[[0.82,0.37],[1.0,1.2],[0.935,0.02],[1.0,-1.14],[0.82,-0.35]],tailB:[[0.84,0.0],[1.0,1.0],[1.0,0.0],[1.0,-1.0],[0.84,0.0]]};
// a：0 写实的半坡鱼 → 1 三角几何纹（只剩一只眼）
function drawBanpo(c,p,a,o={}){const H=(o.H||BH),L=p.L;const col=o.col||'#000';c.save();c.fillStyle=col;c.strokeStyle=col;c.lineJoin='round';c.lineCap='round';
  const Wm=(a0,a1)=>smooth(a0,a1,a);
  // 鳍
  const wf=Wm(0.2,0.55);for(const [f,sg] of BPS.fins){const B=f.map(q=>[q[0],sg]);bpPoly(c,p,mrph(f,B,wf),H);c.fill();}
  // 尾
  bpPoly(c,p,mrph(BPS.tailA,BPS.tailB,Wm(0.35,0.72)),H);c.fill();
  // 身：轮廓 + 网格
  const body=mrph(BPS.bodyA,BPS.bodyB,Wm(0.3,0.72));
  c.save();bpPoly(c,p,body,H);c.clip();
  const sp=lerp(9.5,13,Wm(0.3,0.8));c.lineWidth=H*0.065*(o.lw||1);
  for(const sg of [1,-1]){for(let cc=0.16*L-2.5*H;cc<0.9*L+2.5*H;cc+=sp){const pts=[];for(let u=0.22;u<=0.88;u+=0.012){const Y=sg*(u*L-cc)/H;if(Y<-1.25||Y>1.25){if(pts.length>1)break;pts.length=0;continue;}pts.push([u,Y]);}
    if(pts.length>1){bpLine(c,p,pts,H);c.stroke();}}}
  const wt=Wm(0.45,0.86);if(wt>0){c.beginPath();const t0=[0.29,1.05],t1=[lerp(0.29,0.83,wt),1.05],t2=[0.29,lerp(1.05,-1.05,wt)];bpPoly(c,p,[t0,t1,t2],H);c.fill();}
  c.restore();
  c.lineWidth=H*0.14*(o.lw||1);bpPoly(c,p,body,H);c.stroke();
  // 头
  bpPoly(c,p,mrph(BPS.headA,BPS.headB,Wm(0.1,0.45)),H);c.fill();
  // 留白：口、鳃、眼
  c.globalCompositeOperation='destination-out';
  const mw=Wm(0.05,0.3);if(mw<0.98){bpPoly(c,p,mrph(BPS.mouthA,BPS.mouthB,mw),H);c.fill();}
  c.lineWidth=H*lerp(0.1,0.085,a);bpLine(c,p,mrph(BPS.gillA,BPS.gillB,Wm(0.15,0.45)),H);c.stroke();
  const ew=Wm(0.1,0.45);const eu=lerp(0.088,0.15,ew),ey=lerp(0.40,0.0,ew);const E=BP(p,eu,ey*H);c.beginPath();c.arc(E[0],E[1],H*lerp(0.22,0.24,ew),0,7);c.fill();
  c.globalCompositeOperation='source-over';
  c.beginPath();c.arc(E[0],E[1],H*lerp(0.105,0.1,ew),0,7);c.fill();
  // 牙
  const tw=1-Wm(0.0,0.2);if(tw>0.02&&mw<0.95){const M=mrph(BPS.mouthA,BPS.mouthB,mw);for(const [A,B,sg] of [[M[0],M[1],-1],[M[2],M[1],1]]){for(const f of [0.22,0.48,0.74]){
    const u=lerp(A[0],B[0],f),Y=lerp(A[1],B[1],f);const q0=BP(p,u-0.012,(Y)*H),q1=BP(p,u+0.012,(Y+sg*0.02)*H),q2=BP(p,u,(Y+sg*0.17*tw)*H);c.beginPath();c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1]);c.lineTo(q2[0],q2[1]);c.closePath();c.fill();}}}
  c.restore();}
// 用于静态纹样（人面口边的鱼）的直骨架
function straightPose(x,y,ang,L,flip){const N=16,sp=[];const dx=Math.cos(ang),dy=Math.sin(ang);const f=flip?-1:1;for(let i=0;i<=N;i++){const u=i/N;sp.push({x:x-dx*u*L,y:y-dy*u*L,nx:-dy*f,ny:dx*f});}return{sp,N,L,t:0,sn:0,flut:0};}
function arcPose(cx,cy,r,th0,L,dir){const N=24,sp=[];for(let i=0;i<=N;i++){const th=th0+dir*(i/N)*L/r;const x=cx+r*Math.cos(th),y=cy+r*Math.sin(th);const tx=-Math.sin(th)*dir,ty=Math.cos(th)*dir;sp.push({x,y,nx:ty,ny:-tx});}
  // 法向：指向圆外
  for(const q of sp){const ox=q.x-cx,oy=q.y-cy;const l=Math.hypot(ox,oy);q.nx=ox/l;q.ny=oy/l;}return{sp,N,L,t:0,sn:0,flut:0};}

// ---------- 人面 ----------
function drawFace(c,cx,cy,rf,ang){c.save();c.translate(cx,cy);c.rotate(ang+Math.PI/2);c.scale(rf,rf);c.fillStyle='#000';c.strokeStyle='#000';c.lineCap='round';c.lineJoin='round';
  // 尖顶冠
  c.beginPath();c.moveTo(-0.5,-0.86);c.lineTo(0,-1.42);c.lineTo(0.5,-0.86);c.closePath();c.fill();
  c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(-0.3,-0.9);c.lineTo(0,-1.24);c.lineTo(0.3,-0.9);c.closePath();c.fill();c.globalCompositeOperation='source-over';
  c.save();c.beginPath();c.moveTo(-0.3,-0.9);c.lineTo(0,-1.24);c.lineTo(0.3,-0.9);c.closePath();c.clip();c.lineWidth=0.045;for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(i*0.09-0.5,-0.9);c.lineTo(i*0.09+0.5,-1.6);c.stroke();c.beginPath();c.moveTo(i*0.09+0.5,-0.9);c.lineTo(i*0.09-0.5,-1.6);c.stroke();}c.restore();
  c.lineWidth=0.07;c.beginPath();c.moveTo(0,-1.4);c.lineTo(0,-1.6);c.stroke();c.beginPath();c.moveTo(-0.11,-1.52);c.lineTo(0.11,-1.52);c.stroke();
  for(const s of [-1,1]){c.beginPath();c.moveTo(s*0.46,-0.88);c.quadraticCurveTo(s*0.85,-0.98,s*1.0,-1.14);c.quadraticCurveTo(s*0.8,-0.96,s*0.4,-0.8);c.closePath();c.fill();
    for(let i=0;i<4;i++){const v=0.2+i*0.2;const bx=lerp(s*0.5,s*0.02,v),by=lerp(-0.88,-1.38,v);c.lineWidth=0.05;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+s*0.2,by-0.06);c.stroke();}}
  // 脸
  c.lineWidth=0.075;c.beginPath();c.arc(0,0,0.97,0,7);c.stroke();
  c.save();c.beginPath();c.arc(0,0,0.95,0,7);c.clip();
  c.beginPath();c.rect(-1,-1,2,0.8);c.fill();
  c.globalCompositeOperation='destination-out';c.beginPath();c.arc(0.42,-0.2,0.34,Math.PI,0);c.closePath();c.fill();c.fillRect(-0.03,-1,0.06,0.8);
  c.globalCompositeOperation='source-over';c.restore();
  c.lineWidth=0.08;for(const s of [-1,1]){c.beginPath();c.moveTo(s*0.2,0.05);c.quadraticCurveTo(s*0.41,0.11,s*0.63,0.05);c.stroke();}
  c.lineWidth=0.065;c.beginPath();c.moveTo(0,-0.08);c.lineTo(0,0.34);c.stroke();c.beginPath();c.moveTo(-0.17,0.34);c.lineTo(0.17,0.34);c.stroke();
  c.beginPath();c.moveTo(-0.38,0.46);c.lineTo(0,0.62);c.lineTo(0.38,0.46);c.lineTo(0.38,0.78);c.lineTo(0,0.62);c.lineTo(-0.38,0.78);c.closePath();c.fill();
  // 耳边的小钩
  for(const s of [-1,1]){c.lineWidth=0.07;c.beginPath();c.moveTo(s*0.97,-0.08);c.lineTo(s*1.2,-0.08);c.quadraticCurveTo(s*1.3,0.0,s*1.22,0.16);c.stroke();c.beginPath();c.moveTo(s*1.22,0.16);c.lineTo(s*1.12,0.3);c.lineTo(s*1.32,0.26);c.closePath();c.fill();}
  // 口衔双鱼
  for(const s of [-1,1]){const fp=straightPose(s*0.34,0.62,s>0?Math.PI-0.22:0.22,1.2,s<0);drawBanpo(c,fp,0.25,{H:0.2,lw:1.2});}
  c.restore();}

// ---------- 预渲染：陶胎、阴影、高光、磨损、修补 ----------
const BASIN={};
function bctxOf(cv){const x=cv.getContext('2d');x.setTransform(MSB,0,0,MSB,BHALF,BHALF);return x;}
const CRACKS=(()=>{const r=rng(411);const walk=(r0,th0,steps,dth,end)=>{const pts=[];let rr=r0,th=th0;for(let i=0;i<steps;i++){pts.push([rr*Math.cos(th),rr*Math.sin(th)]);rr-=3.2+r()*1.4;th+=dth/steps+(r()-.5)*0.03;if(end&&rr<end)break;}return pts;};
  const c1=walk(RB+2,Math.PI*0.94,70,0.35,22);const c2=walk(RB+2,Math.PI*0.33,70,0.5,22);
  const j=c2[Math.floor(c2.length*0.45)];const th3=Math.atan2(j[1],j[0]);const c3=[];{let rr=Math.hypot(j[0],j[1]),th=th3;for(let i=0;i<40&&rr<RB+2;i++){c3.push([rr*Math.cos(th),rr*Math.sin(th)]);rr+=3.4+r()*1.2;th-=0.012+(r()-.5)*0.03;}}
  return[c1,c2,c3];})();
const PATCH=(()=>{const r=rng(431);const V=[[RB+4,-0.29],[RB+4,-0.075],[0.9*RB,-0.06],[0.815*RB,-0.115],[0.835*RB,-0.2],[0.885*RB,-0.285]];const pts=[];
  for(let i=0;i<V.length;i++){const a=V[i],b=V[(i+1)%V.length];const outer=i===0;const n=outer?10:6;for(let j=0;j<n;j++){const v=j/n;const rr=lerp(a[0],b[0],v),th=lerp(a[1],b[1],v);const jj=outer?0:(r()-.5)*2.6;pts.push([(rr+jj)*Math.cos(th),(rr+jj)*Math.sin(th)]);}}return pts;})();
function prepBasin(){
  const n1=noise2(301,6,6),n2=noise2(302,24,24),n3=noise2(303,90,90),n4=noise2(304,320,320),nf=noise2(305,5,5),nb=noise2(306,40,7),nw=noise2(307,50,50),nw2=noise2(308,14,14),nwc=noise2(310,150,150);const r=rng(309);
  const base=mk(BW,BW),shade=mk(BW,BW),spec=mk(BW,BW),wear=mk(BW,BW);
  const bi=base.getContext('2d').createImageData(BW,BW),si=shade.getContext('2d').createImageData(BW,BW),pi=spec.getContext('2d').createImageData(BW,BW),wi=wear.getContext('2d').createImageData(BW,BW);
  const B=bi.data,S=si.data,P=pi.data,Wd=wi.data;
  for(let py=0;py<BW;py++){for(let px=0;px<BW;px++){const x=(px-BHALF)/MSB,y=(py-BHALF)/MSB;const rr=Math.hypot(x,y);const i=(py*BW+px)*4;if(rr>RB+1.2)continue;
    const edge=clamp((RB+0.6-rr)*MSB/1.6);const u=px/BW,v=py/BW;const th=Math.atan2(y,x);
    const m=n1(u*6,v*6),mm=n2(u*24,v*24),f=n3(u*90,v*90),g=n4(u*320,v*320);
    let lum=1+(m-0.5)*0.17+(mm-0.5)*0.09+(f-0.5)*0.05+(g-0.5)*0.07;
    let R0=172,G0=90,B0=56;
    const fc=clamp((nf(u*5,v*5)-0.6)*3.2);R0=lerp(R0,118,fc*0.6);G0=lerp(G0,82,fc*0.6);B0=lerp(B0,64,fc*0.6);
    if(rr<RI&&rr>RBOT){lum*=1+(nb(((th+Math.PI)/(2*Math.PI))*40,rr/RB*7)-0.5)*0.07;}
    if(rr<=RBOT){lum*=0.95;R0-=6;}
    if(rr>RI+LIP){lum*=1.03;}
    if(r()<0.0016){lum*=1.25+r()*0.25;}else if(r()<0.0012){lum*=0.62;}
    B[i]=clamp(R0*lum,0,255);B[i+1]=clamp(G0*lum,0,255);B[i+2]=clamp(B0*lum,0,255);B[i+3]=255*edge;
    const sh=shadeAt(x,y);S[i]=255*sh;S[i+1]=255*Math.pow(sh,1.04);S[i+2]=255*Math.pow(sh,1.1);S[i+3]=255*edge;
    // 高光（磨光陶的缎面光泽）
    const pr=bprof(rr);const c0=rr>0?x/rr:0,s0=rr>0?y/rr:0;let nx=-pr.dh*c0,ny=-pr.dh*s0,nz=1;const l=Math.hypot(nx,ny,nz);
    const ndh=(nx*HV[0]+ny*HV[1]+nz*HV[2])/l;const bur=0.55+0.9*nw2(u*14,v*14);let sp=Math.pow(Math.max(0,ndh),24)*0.26*bur*(sh>0.5?1:sh*2);
    P[i]=255;P[i+1]=242;P[i+2]=222;P[i+3]=255*clamp(sp)*edge;
    // 磨损（施于黑彩）
    let w=0;if(r()<0.04)w+=0.2+r()*0.4;const pw=nwc(u*150,v*150)*0.5+nw(u*50,v*50)*0.5;w+=clamp((pw-0.67)*6)*0.85;w+=clamp((nw2(u*14,v*14)-0.45)*1.4)*0.18;if(rr>RI)w+=0.18+clamp((nw2(u*14,v*14)-0.5)*2)*0.35;
    Wd[i+3]=255*clamp(w);}}
  base.getContext('2d').putImageData(bi,0,0);shade.getContext('2d').putImageData(si,0,0);spec.getContext('2d').putImageData(pi,0,0);wear.getContext('2d').putImageData(wi,0,0);
  // 划痕
  {const x=bctxOf(wear);x.strokeStyle='rgba(0,0,0,0.75)';x.lineCap='round';for(let k=0;k<12;k++){const th=r()*Math.PI*2,rr=RBOT+r()*(RB-RBOT);const len=6+r()*22;x.lineWidth=0.25+r()*0.4;x.beginPath();x.arc(0,0,rr,th,th+len/rr);x.stroke();}}
  // 静态黑彩：人面、口沿符号
  const sp=mk(BW,BW);const sx=bctxOf(sp);
  for(const fa of [-50*Math.PI/180,130*Math.PI/180]){const fr=0.703*RB;drawFace(sx,fr*Math.cos(fa),fr*Math.sin(fa),26,fa);}
  sx.fillStyle='#000';sx.strokeStyle='#000';sx.lineCap='butt';
  for(let k=0;k<8;k++){const th=-Math.PI/2+k*Math.PI/4+Math.PI/8;
    if(k%2===0){for(let j=-2;j<=2;j++){const a=th+j*0.026;sx.lineWidth=2.0;sx.beginPath();sx.moveTo((RI+LIP+3)*Math.cos(a),(RI+LIP+3)*Math.sin(a));sx.lineTo((RB-LIPO-1)*Math.cos(a),(RB-LIPO-1)*Math.sin(a));sx.stroke();}}
    else{const r0=RI+LIP+4,r1=RB-LIPO-2;sx.beginPath();sx.moveTo(r0*Math.cos(th-0.07),r0*Math.sin(th-0.07));sx.lineTo(r1*Math.cos(th-0.07),r1*Math.sin(th-0.07));sx.lineTo(((r0+r1)/2)*Math.cos(th+0.08),((r0+r1)/2)*Math.sin(th+0.08));sx.closePath();sx.fill();
      sx.lineWidth=1.6;sx.beginPath();sx.moveTo(((r0+r1)/2)*Math.cos(th+0.08),((r0+r1)/2)*Math.sin(th+0.08));sx.lineTo(((r0+r1)/2)*Math.cos(th+0.2),((r0+r1)/2)*Math.sin(th+0.2));sx.stroke();}}
  // 修补处：没有彩
  sx.globalCompositeOperation='destination-out';sx.beginPath();PATCH.forEach((q,i)=>i?sx.lineTo(q[0],q[1]):sx.moveTo(q[0],q[1]));sx.closePath();sx.fill();
  sx.setTransform(1,0,0,1,0,0);sx.drawImage(wear,0,0);sx.globalCompositeOperation='source-over';
  BASIN.paintS=sp;
  const bx=base.getContext('2d');
  // 彩边微晕（薄处偏褐）
  const tint=(src,col)=>{const c=mk(BW,BW);const x=c.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,BW,BW);return c;};
  bx.save();bx.filter=`blur(${(1.1*MSB).toFixed(1)}px)`;bx.globalAlpha=0.35;bx.drawImage(tint(sp,'rgb(74,40,26)'),0,0);bx.restore();
  bx.globalAlpha=0.93;bx.drawImage(tint(sp,'rgb(30,21,17)'),0,0);bx.globalAlpha=1;
  // 修补的石膏块：颜色略平、略粉
  {const x=bctxOf(base);x.save();x.beginPath();PATCH.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();x.clip();
    x.fillStyle='rgb(176,104,70)';x.fillRect(-RB-10,-RB-10,2*RB+20,2*RB+20);x.globalAlpha=0.28;x.fillStyle=PLATEGRAIN;x.globalCompositeOperation='multiply';x.fillRect(-RB-10,-RB-10,2*RB+20,2*RB+20);x.restore();
    x.save();x.globalCompositeOperation='destination-out';x.beginPath();x.arc(0,0,RB+0.3,0,7);x.arc(0,0,RB+30,0,7,true);x.fill();x.restore();}
  // 顶层：裂缝（粘接线）、土沁（预先乘了明暗）
  const top=mk(BW,BW);const tx=bctxOf(top);tx.lineCap='round';tx.lineJoin='round';
  const crackLine=(pts,w0)=>{for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const s=shadeAt((a[0]+b[0])/2,(a[1]+b[1])/2);
      tx.strokeStyle=`rgba(${200*s|0},${160*s|0},${128*s|0},0.55)`;tx.lineWidth=w0*2.3;tx.beginPath();tx.moveTo(a[0],a[1]);tx.lineTo(b[0],b[1]);tx.stroke();}
    for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const s=shadeAt((a[0]+b[0])/2,(a[1]+b[1])/2);tx.strokeStyle=`rgba(${46*s|0},${26*s|0},${18*s|0},0.75)`;tx.lineWidth=w0*(0.7+0.5*r());tx.beginPath();tx.moveTo(a[0],a[1]);tx.lineTo(b[0],b[1]);tx.stroke();}};
  for(const c of CRACKS)crackLine(c,0.75);crackLine(PATCH.slice(10).concat([PATCH[0]]),0.8);
  for(let cl=0;cl<26;cl++){let cx0,cy0;if(cl<14){const c=CRACKS[cl%2];const q=c[Math.floor(r()*c.length*0.8)];cx0=q[0]+(r()-.5)*10;cy0=q[1]+(r()-.5)*10;}else{const th=2.0+r()*1.6,rr=r()*RBOT*1.1;cx0=rr*Math.cos(th);cy0=rr*Math.sin(th);}
    if(Math.hypot(cx0,cy0)>RB-8)continue;const s=shadeAt(cx0,cy0);tx.save();tx.filter=`blur(${(2.2*MSB).toFixed(1)}px)`;tx.fillStyle=`rgba(${206*s|0},${190*s|0},${166*s|0},${0.07+r()*0.06})`;blob(tx,cx0,cy0,5+r()*7,cl*31+5);tx.fill();tx.restore();
    const nn=4+Math.floor(r()*6);for(let k=0;k<nn;k++){const x0=cx0+(r()-.5)*12,y0=cy0+(r()-.5)*12;tx.fillStyle=`rgba(${214*s|0},${200*s|0},${178*s|0},${0.08+r()*0.13})`;blob(tx,x0,y0,0.5+r()*1.6,cl*97+k*13+7);tx.fill();}}
  tx.setTransform(1,0,0,1,0,0);tx.globalCompositeOperation='destination-out';tx.globalAlpha=0.35;tx.fillStyle=INKGRAIN;tx.fillRect(0,0,BW,BW);
  Object.assign(BASIN,{base,shade,spec,wear,top});}

// ---------- 布景：亚麻衬板 ----------
const LINEN=(()=>{const w=2134,h=1200;const c=mk(w,h);const x=c.getContext('2d');const img=x.createImageData(w,h);const d=img.data;const n1=noise2(501,8,5),n2=noise2(502,60,400),n3=noise2(503,400,60);const r=rng(504);
  for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const u=xx/w,v=y/h;const wv=((xx>>1)+(y>>1))%2?1:-1;
    let lum=1+(n1(u*8,v*5)-0.5)*0.06+wv*0.018+(n2(u*60,v*400)-0.5)*0.05+(n3(u*400,v*60)-0.5)*0.04+(r()-.5)*0.03;
    const i=(y*w+xx)*4;d[i]=clamp(222*lum,0,255);d[i+1]=clamp(212*lum,0,255);d[i+2]=clamp(192*lum,0,255);d[i+3]=255;}
  x.putImageData(img,0,0);return c;})();

// ---------- 鱼群：四条首尾相接，绕盆逆时针游 ----------
const s1Speed=t=>smooth(11.2,12.8,t)*(1-smooth(19.3,20.9,t));
const S1G=(()=>{const dt=1/120,T0=-8,T1=60;const n=Math.round((T1-T0)/dt)+1;const G=new Float64Array(n);for(let k=n-2;k>=0;k--)G[k]=G[k+1]+s1Speed(T0+(k+0.5)*dt)*dt;return{dt,T0,n,G};})();
const OMEGA=0.74;
const PhiOf=t=>{const f=clamp((t-S1G.T0)/S1G.dt,0,S1G.n-1);const k=Math.min(S1G.n-2,Math.floor(f));return PHI_F+OMEGA*lerp(S1G.G[k],S1G.G[k+1],f-k);};
const aOf=(k,t)=>k===0?0:smooth(12.9+0.35*k,20.0+0.3*k,t);
function heroA(t){let a=0.6*smooth(13.4,20.1,t);a+=0.05*Math.sin((t-20.4)*9.5)*smooth(20.4,20.8,t)*(1-smooth(21.7,21.9,t));return a*(1-smooth(21.9,22.27,t));}
const T_X=22.3; // 主角离开纹带
function heroPhi(t){let ph=PhiOf(t)+0.045*Math.sin(t*1.9+0.4)*smooth(11.4,12.6,t)*(1-smooth(19.5,20.5,t));
  // 挣扎：独自往前顶，一顿一顿
  ph-=0.16*smooth(20.3,22.0,t)+0.02*Math.sin((t-20.3)*13)*smooth(20.3,20.7,t)*(1-smooth(21.8,22.1,t))+0.18*smooth(21.9,22.3,t);
  return ph;}
const s1Circ=(ph)=>[S1X+RC*Math.cos(ph),S1Y+RC*Math.sin(ph)];
function withHistory(f,T0,phStart){return t=>{if(t<T0+2){const v=(t-T0)/2;return s1Circ(phStart+1.9*(1-v));}return f(t);};}
const S1F=[0,1,2,3].map(k=>{if(k===0)return null;const base=k*Math.PI/2;const ph0=PhiOf(-8)+base;const dk=[0,0.9,2.1,3.3][k];
  const f=t=>{const a=aOf(k,t);const dv=0.05*Math.sin(t*1.6+dk)*(1-a)*smooth(11.4,12.6,t);return s1Circ(PhiOf(t)+base+dv);};
  return{tr:makeTrackF(withHistory(f,-8,ph0),-8,60),L:t=>lerp(L0,SLOT,smooth(0.55,1.0,aOf(k,t))),freeze:20.9,wink:11.05+0.22*k,amp:t=>smooth(11.05+0.22*k,11.9+0.22*k,t)*(1-smooth(0.5,0.95,aOf(k,t))),k};});
// 主角：越出纹带、跃过盆沿、落到衬板上，往左游向下一站（全片的路线在 hero.js 里拼起来）
for(const dt of [-0.9,-0.6,-0.3,0]){const t=T_X+dt;const q=s1Circ(heroPhi(t));GK.push([t,q[0],q[1]]);}
GK.push([T_X+0.12,-122.5,-20],[T_X+0.25,-140,-8],[T_X+0.42,-185,2],[T_X+0.6,-228,12],[T_X+0.8,-265,22],[T_X+1.05,-300,30],[T_X+1.6,-350,34],[T_X+2.4,-412,30]);
HFB.push(t=>2.4*smooth(20.3,20.7,t)*(1-smooth(21.8,22.2,t))+3.2*smooth(T_X-0.08,T_X+0.08,t)*(1-smooth(T_X+0.5,T_X+0.9,t)));
HAMP.push(t=>t>T_X+6?1:smooth(11.0,11.8,t)*(1+1.4*smooth(20.3,20.7,t)*(1-smooth(21.8,22.2,t))+0.7*smooth(T_X-0.1,T_X+0.1,t)*(1-smooth(T_X+0.7,T_X+1.6,t)))*(1-0.6*smooth(0.5,0.95,heroA(t))));
const leapH=t=>{const v=(t-(T_X+0.42))/0.72;return v<=0||v>=1?0:Math.pow(Math.sin(Math.PI*v),1.3);};
// 挣脱时甩出的彩点：落在盆面上，留下来
const FLECKS=(()=>{const r=rng(611);const out=[];for(let i=0;i<46;i++){const t0=21.95+r()*0.3;out.push({t0,u:0.08+r()*0.9,side:r()<.5?1:-1,sp:40+r()*130,dir:(r()-.5)*1.2,sz:0.5+r()*1.7,seed:i});}return out;})();
function fleckPos(f){const p=fishPose(HERO,f.t0);const s=spineAt(p,f.u);const ang=Math.atan2(s.ny*f.side,s.nx*f.side)+f.dir;const x0=s.x+s.nx*f.side*BH*0.8,y0=s.y+s.ny*f.side*BH*0.8;return{x0,y0,dx:Math.cos(ang),dy:Math.sin(ang)};}
let FLK=null;
// 纹带边线：像有人拿笔绕盆画了一圈
const borderP=t=>smooth(15.8,20.6,t);
const BREAK_TH=Math.PI+0.04,breakW=t=>0.13*smooth(T_X+0.2,T_X+0.32,t);
function s1Paint(c,t){
  const bp=borderP(t);if(bp>0){c.save();c.strokeStyle='#000';c.fillStyle='#000';c.lineCap='round';
    for(const [rr,lw,th0,lag] of [[RC+1.24*BH,1.7,PHI_F+0.3,0],[RC-1.24*BH,1.5,PHI_F+2.2,0.08]]){const q=clamp((bp-lag)/(1-lag));if(q<=0)continue;
      const span=q*Math.PI*2;const gap=rr>RC?breakW(t):0;c.lineWidth=lw;
      if(gap>0){const a0=th0,a1=th0-span;const norm=x=>{while(x>a0)x-=Math.PI*2;while(x<a0-Math.PI*2)x+=Math.PI*2;return x;};const G0=norm(BREAK_TH+gap/2),G1=G0-gap;const segs=[];
        if(G0<a0&&G1>a1){segs.push([a0,G0]);segs.push([G1,a1]);}else segs.push([a0,a1]);
        for(const [s0,s1] of segs){c.beginPath();c.arc(S1X,S1Y,rr,s0,s1,true);c.stroke();}
        const r2=rng(77);for(let i=0;i<9;i++){const th=BREAK_TH+(r2()-.5)*gap*1.6;const d=r2()*7;c.beginPath();c.arc(S1X+(rr+d*(r2()-.3))*Math.cos(th),S1Y+(rr+d*(r2()-.3))*Math.sin(th),0.4+r2()*1.1,0,7);c.fill();}}
      else{c.beginPath();c.arc(S1X,S1Y,rr,th0,th0-span,true);c.stroke();}}
    c.restore();}
  for(const F of S1F){if(!F)continue;const p=fishPose(F,t);drawBanpo(c,p,aOf(F.k,t));}
  // 主角空出来的位置：只剩一道淡淡的起稿线
  const gh=smooth(T_X+0.9,T_X+2.2,t);if(gh>0){c.save();c.globalAlpha=0.45*gh;c.strokeStyle='#000';c.lineWidth=0.8;const p=arcPose(S1X,S1Y,RC,PHI_F,SLOT,1);
    for(const sh of [BPS.headB,BPS.bodyB,BPS.tailB]){bpPoly(c,p,sh,BH);c.stroke();}c.beginPath();const q0=BP(p,0.82,BH),q1=BP(p,0.29,-BH);c.moveTo(q0[0],q0[1]);c.lineTo(q1[0],q1[1]);c.stroke();c.restore();}
  if(t>21.94){if(!FLK)FLK=FLECKS.map(f=>({...f,...fleckPos(f)}));c.save();c.fillStyle='#000';
    for(const f of FLK){if(t<f.t0)continue;const d=t-f.t0;const k=4.5;const tr=f.sp*(1-Math.exp(-k*d))/k;const x=f.x0+f.dx*tr,y=f.y0+f.dy*tr;const land=smooth(0.25,0.45,d);
      c.beginPath();c.ellipse(x,y,f.sz*(1+0.8*(1-land)),f.sz*(1-0.3*(1-land)),Math.atan2(f.dy,f.dx),0,7);c.fill();}c.restore();}}
const PAINTC=mk(W,H),pctx=PAINTC.getContext('2d');
function layerWear(x,TR,k){if(k<=0)return;x.setTransform(...TR);x.globalCompositeOperation='destination-out';x.globalAlpha=k;x.drawImage(BASIN.wear,S1X-BHALF/MSB,S1Y-BHALF/MSB,BW/MSB,BW/MSB);x.globalAlpha=1;x.globalCompositeOperation='source-over';}
function drawS1Panel(t,cam,TR){const e=cam.e.s1||0;const w=lerp(P,P*16/9,e),x0=S1X-w/2,y0=S1Y-300;
  panelShadow(x0,y0,w,P);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,P);ctx.clip();
  ctx.drawImage(LINEN,S1X-533.33,S1Y-300,1066.67,600);
  ctx.save();ctx.filter=`blur(${(22*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(60,40,26,0.42)';ctx.beginPath();ctx.arc(S1X-16,S1Y+22,RB*0.99,0,7);ctx.fill();ctx.restore();
  ctx.save();ctx.filter=`blur(${(5*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(50,32,20,0.35)';ctx.beginPath();ctx.arc(S1X-5,S1Y+7,RB,0,7);ctx.fill();ctx.restore();
  const bx=S1X-BHALF/MSB,by=S1Y-BHALF/MSB,bw=BW/MSB;
  ctx.drawImage(BASIN.base,bx,by,bw,bw);
  layerBegin(pctx,TR);s1Paint(pctx,t);layerWear(pctx,TR,1);layerColor(pctx,'rgb(30,21,17)');blitLayer(PAINTC,0.93);
  ctx.globalCompositeOperation='multiply';ctx.drawImage(BASIN.shade,bx,by,bw,bw);ctx.globalCompositeOperation='source-over';
  ctx.drawImage(BASIN.top,bx,by,bw,bw);
  ctx.globalCompositeOperation='screen';ctx.drawImage(BASIN.spec,bx,by,bw,bw);ctx.globalCompositeOperation='source-over';
  ctx.restore();
  ctx.strokeStyle='rgba(70,60,45,0.35)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,w,P);}
// 主角在盆里时：随盆面磨损、受光；跃起时离开盆面，带着影子
function drawS1Hero(t,cam,TR,p){const a=heroA(t);const h=leapH(t);const head=spineAt(p,0.3);
  const inBasin=Math.hypot(head.x-S1X,head.y-S1Y)<RB;const wearK=inBasin?1-smooth(T_X+0.4,T_X+0.6,t):0;
  const sc=1+0.13*h;const cx=head.x,cy=head.y;
  if(h>0.01){layerBegin(hctx,TR);hctx.translate(cx-9*h,cy+13*h);hctx.scale(sc,sc);hctx.translate(-cx,-cy);drawBanpo(hctx,p,a);layerColor(hctx,'rgb(40,26,18)');
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.filter=`blur(${(2+5*h)*cam.z}px)`;ctx.globalAlpha=0.32*h;ctx.globalCompositeOperation='multiply';ctx.drawImage(HEROC,0,0);ctx.restore();}
  layerBegin(hctx,TR);hctx.translate(cx,cy);hctx.scale(sc,sc);hctx.translate(-cx,-cy);drawBanpo(hctx,p,a);layerWear(hctx,TR,wearK);if(!inBasin)layerGrain(hctx,TR,0.18);
  const s=inBasin?lerp(1,shadeAt(head.x-S1X,head.y-S1Y),1-h):1;const k=Math.round(30*s),k2=Math.round(21*s),k3=Math.round(17*s);layerColor(hctx,`rgb(${k},${k2},${k3})`);blitLayer(HEROC,0.94);}
// 半坡画风（在墙上）：黑彩，带一点颗粒
function styleBanpo(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}drawBanpo(hctx,p,0);layerGrain(hctx,TR,0.18);layerColor(hctx,'rgb(32,22,17)');blitLayer(HEROC,0.94);}

// ---------------- 片名（开场） ----------------
const TITLE_X=920,TITLE_Y=-10;
const SEAL_TITLE=mkSeal({chars:['知','魚','之','樂'],type:'bai',size:420,seed:3});
function drawTitle(t){const cols=['一条鱼','游过六千年'];let k=0;const tf=1-smooth(139.9,140.6,t);if(tf<=0)return;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 52px ${SERIF}`;
  cols.forEach((col,ci)=>{const x=TITLE_X+44-ci*86,y0=TITLE_Y-196+ci*58;[...col].forEach((ch,i)=>{const t0=2.2+k*0.2;k++;const a=smooth(t0,t0+0.7,t);if(a<=0)return;
    ctx.save();ctx.globalAlpha=a*tf;ctx.filter=a<1?`blur(${((1-a)*2.5).toFixed(2)}px)`:'none';ctx.fillStyle='#2b241d';ctx.fillText(ch,x,y0+i*64);ctx.restore();});});
  const sa=smooth(4.3,5.4,t)*tf;if(sa>0){ctx.globalAlpha=sa*0.9;ctx.fillStyle='#8a7e6e';ctx.font=`400 17px ${SERIF}`;[...'约公元前四千年至今'].forEach((ch,i)=>ctx.fillText(ch,TITLE_X-108,TITLE_Y-96+i*23));}
  ctx.restore();
  const ts=4.75;if(t>ts){const d=t-ts;const s=1+0.07*Math.exp(-d*30);const al=0.9*smooth(0,0.07,d)*tf;stampSeal(ctx,SEAL_TITLE,TITLE_X-42,TITLE_Y+180,52*s,al,0.012);}}

// ---------------- 壹 的登记 ----------------
STN.push({key:'title',cx:TITLE_X,hw:200,draw:(t)=>drawTitle(t)});
STN.push({key:'s1',cx:S1X,hw:533,x0:-380,x1:1e9,draw:drawS1Panel,owns:t=>t<T_X+1.1,drawHero:drawS1Hero,style:styleBanpo,prep:prepBasin});
LABELS.push([S1X,P,P,'壹','人面鱼纹彩陶盆','新石器时代 · 仰韶文化']);
LIGHTS.push({x:TITLE_X,y:-20,r:540,k:t=>smooth(1.0,3.8,t)},{x:S1X,y:-10,r:840,k:t=>smooth(6.0,8.8,t)});
LINES.push([15.3,19.3,['画着画着','鱼就成了纹']]);
CK.push({t:0,x:TITLE_X,y:-10,z:1.30},{t:6.3,x:TITLE_X-26,y:-10,z:1.40},{t:9.4,x:0,y:14,z:0.92},{t:11.0,x:0,y:0,z:1.8,e:{s1:1}},{t:16.0,x:-4,y:-2,z:1.84,e:{s1:1}},{t:19.6,x:-10,y:-6,z:1.9,e:{s1:1}},
  {t:20.5,x:-10,y:-6,z:2.8,e:{s1:1},f:1,ox:10,oy:8},{t:22.0,z:3.0,e:{s1:1},f:1,ox:-10,oy:4},{t:23.4,z:2.0,e:{s1:1},f:1,ox:-60,oy:0},{t:24.8,z:1.3,e:{s1:0.35},f:1,ox:-130,oy:-10});
