// ================= 肆 · 双鱼铜洗（东汉，仿） =================
// 洗底铸着一对鱼，中间铭“大吉羊”。主角游进来停在两条鱼中间，像第三条；两条铜鱼转过头来看它
const S4X=-2010,S4Y=0,S4W=420,R4=182,MS4=3,B4H=Math.ceil((R4+40)*MS4);
const B4W=2*B4H;
const L4=normalize3([0.45,-0.55,0.7]),H4=normalize3([0.45,-0.55,1.7]);
function normalize3(v){const l=Math.hypot(...v);return v.map(a=>a/l);}
let BRZ=null;
const PATINA=(()=>{const c=mk(256,256);const x=c.getContext('2d');const r=rng(451);const n=noise2(452,6,6);
  for(let i=0;i<900;i++){const u=r(),v=r();const k=n(u*6,v*6);if(r()>0.35+0.5*k)continue;const col=r()<0.75?`rgba(${70+r()*30|0},${118+r()*30|0},${90+r()*25|0},${0.25+r()*0.5})`:`rgba(60,104,122,${0.3+r()*0.4})`;
    x.fillStyle=col;for(const [ox,oy] of [[0,0],[256,0],[0,256],[256,256],[-256,0],[0,-256]]){x.beginPath();x.arc(u*256+ox,v*256+oy,0.5+r()*2.2,0,7);x.fill();}}return c;})();
function prepBronze(){const Wd=B4W,Hd=B4W;const hm=new Float32Array(Wd*Hd);const inside=new Uint8Array(Wd*Hd);
  // 铭文的凸起：先画进遮罩
  const im=mk(Wd,Hd);const ix=im.getContext('2d');ix.setTransform(MS4,0,0,MS4,Wd/2,Hd/2);ix.fillStyle='#fff';ix.strokeStyle='#fff';ix.lineWidth=1.2;ix.lineJoin='round';
  ['大','吉','羊'].forEach((ch,i)=>{const p=sealGlyphPath(ch,-15,-60+i*40,30,36,1.25);ix.fill(p);ix.stroke(p);});
  const ib=mk(Wd,Hd);const ibx=ib.getContext('2d');ibx.filter=`blur(${0.6*MS4}px)`;ibx.drawImage(im,0,0);const ID=ibx.getImageData(0,0,Wd,Hd).data;
  for(let py=0;py<Hd;py++)for(let px=0;px<Wd;px++){const x=(px-Wd/2)/MS4,y=(py-Hd/2)/MS4;const r=Math.hypot(x,y);const i=py*Wd+px;let h=-99;
    if(r<=R4){inside[i]=1;
      if(r>0.84*R4){h=0;if(r>R4-5){const q=(r-(R4-5))/5;h=-5+5*Math.sqrt(Math.max(0,1-q*q));}if(r<0.84*R4+4){const q=(0.84*R4+4-r)/4;h=Math.min(h,-4+4*Math.sqrt(Math.max(0,1-q*q)));}
        h+=1.3*Math.exp(-Math.pow((r-0.955*R4)/1.3,2));}
      else if(r>0.62*R4){const q=(0.84*R4-r)/(0.22*R4);h=-4-22*Math.pow(q,0.8);}
      else{h=-26;h+=1.25*Math.exp(-Math.pow((r-0.565*R4)/0.9,2))+1.25*Math.exp(-Math.pow((r-0.525*R4)/0.9,2));h+=1.5*ID[i*4]/255;}}
    // 铺首衔环：左右两个铜环
    for(const sx of [-1,1]){const cx=sx*(R4+17),d=Math.hypot(x-cx,y);const tube=Math.abs(d-14);if(tube<3.2){const hh=-6+Math.sqrt(3.2*3.2-tube*tube)*1.2;if(hh>h){h=hh;inside[i]=2;}}}
    hm[i]=h;}
  // 凹处（铜锈积在低洼里）
  const blurH=new Float32Array(Wd*Hd);{const R=Math.round(4*MS4);const tmp=new Float32Array(Wd*Hd);
    for(let y=0;y<Hd;y++){let s=0,c=0;for(let x=-R;x<Wd+R;x++){if(x+R<Wd&&hm[y*Wd+x+R]>-90){s+=hm[y*Wd+x+R];c++;}if(x-R-1>=0&&hm[y*Wd+x-R-1]>-90){s-=hm[y*Wd+x-R-1];c--;}if(x>=0&&x<Wd)tmp[y*Wd+x]=c?s/c:-26;}}
    for(let x=0;x<Wd;x++){let s=0,c=0;for(let y=-R;y<Hd+R;y++){if(y+R<Hd){s+=tmp[(y+R)*Wd+x];c++;}if(y-R-1>=0){s-=tmp[(y-R-1)*Wd+x];c--;}if(y>=0&&y<Hd)blurH[y*Wd+x]=s/c;}}}
  const c=mk(Wd,Hd);const cx=c.getContext('2d');const img=cx.createImageData(Wd,Hd);const d=img.data;
  const n1=noise2(461,7,7),n2=noise2(462,30,30),n3=noise2(463,120,120),n4=noise2(464,5,5),n5=noise2(465,16,16);const r=rng(466);
  for(let py=1;py<Hd-1;py++)for(let px=1;px<Wd-1;px++){const i=py*Wd+px;if(!inside[i])continue;const x=(px-Wd/2)/MS4,y=(py-Hd/2)/MS4;const rr=Math.hypot(x,y);
    const hx=(hm[i+1]-hm[i-1])*MS4/2,hy=(hm[i+Wd]-hm[i-Wd])*MS4/2;const gx=Math.abs(hx)>40?0:hx,gy=Math.abs(hy)>40?0:hy;
    let nx=-gx,ny=-gy,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    let dif=Math.max(0,nx*L4[0]+ny*L4[1]+nz*L4[2]);const ndh=Math.max(0,nx*H4[0]+ny*H4[1]+nz*H4[2]);
    // 沿口在洗内投下的影
    if(inside[i]===1&&rr<0.84*R4+2){const b=(x*L4[0]+y*L4[1])/Math.hypot(L4[0],L4[1]);const cc=rr*rr-Math.pow(0.84*R4,2);const sd=-b+Math.sqrt(Math.max(0,b*b-cc));const dep=-hm[i];dif*=1-0.55*smooth(-3,6,dep-sd*1.0);}
    if(inside[i]===1&&rr<0.64*R4)dif*=1-0.18*Math.exp(-Math.pow((rr-0.62*R4)/8,2));
    const u=px/Wd,v=py/Hd;const cav=clamp((blurH[i]-hm[i])*0.6);
    let pat=0.18+clamp((n1(u*7,v*7)-0.45)*2.4)*0.7+cav*0.8+clamp((n2(u*30,v*30)-0.6)*3)*0.35;if(inside[i]===2)pat*=0.6;
    if(rr>0.84*R4&&inside[i]===1)pat*=0.75;pat=clamp(pat);
    const blue=clamp((n4(u*5,v*5)-0.62)*3);const red=clamp((n5(u*16,v*16)-0.74)*4)*(1-pat);const earth=clamp((n3(u*120,v*120)-0.7)*3)*0.5;
    let R=98,G=80,B=52;const nz2=(n2(u*30,v*30)-0.5)*0.12+(r()-.5)*0.06;
    R=lerp(R,lerp(72,58,blue),pat);G=lerp(G,lerp(124,104,blue),pat);B=lerp(B,lerp(92,122,blue),pat);
    R=lerp(R,124,red);G=lerp(G,66,red);B=lerp(B,44,red);R=lerp(R,150,earth);G=lerp(G,132,earth);B=lerp(B,104,earth);
    const lum=(0.26+0.8*dif)*(1+nz2);const metal=(1-pat)*(1-earth);
    const s1=Math.pow(ndh,70)*0.65,s2=Math.pow(ndh,9)*0.09;
    const k=(py*Wd+px)*4;d[k]=clamp(R*lum+metal*(255*s1+220*s2),0,255);d[k+1]=clamp(G*lum+metal*(232*s1+186*s2),0,255);d[k+2]=clamp(B*lum+metal*(180*s1+128*s2),0,255);
    d[k+3]=inside[i]===2?255:255*clamp((R4+0.5-rr)*MS4/1.5);}
  cx.putImageData(img,0,0);BRZ=c;}
// ---------- 铜鱼：凸起的铸纹，边缘受光 / 背光，带锈 ----------
const PROF_BRZ=mkProf(0.15,0.15,0.52,0.6,0.24);
const EB0=mk(W,H),eb0=EB0.getContext('2d'),EB1=mk(W,H),eb1=EB1.getContext('2d');
function bronzeSil(c,p,fill='#fff'){const pr=PROF_BRZ,L=p.L;c.fillStyle=fill;
  for(const f of [finPts(p,pr,0.3,0.52,0.1,1,1.1),finPts(p,pr,0.58,0.7,0.07,1,1.3),finPts(p,pr,0.36,0.46,0.07,-1,1.6),finPts(p,pr,0.62,0.72,0.06,-1,1.4)]){finPath(c,f);c.fill();}
  const Pp=(u,v)=>{const s=spineAt(p,u);return[s.x+s.nx*v*L,s.y+s.ny*v*L];};const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1),tt=Pp(1,0.19),tb=Pp(1,-0.18),nt=Pp(0.92,0);
  c.beginPath();c.moveTo(bt[0],bt[1]);c.lineTo(tt[0],tt[1]);c.lineTo(nt[0],nt[1]);c.lineTo(tb[0],tb[1]);c.lineTo(bb[0],bb[1]);c.closePath();c.fill();
  bodyFill(c,edges(p,pr));c.fill();}
function bronzeDetail(c,p){const pr=PROF_BRZ,L=p.L,k=L/120;
  const ridge=(fn,w)=>{c.save();c.translate(-0.55*k,0.65*k);fn();c.strokeStyle='rgba(30,20,10,0.7)';c.lineWidth=w;c.stroke();c.restore();c.save();c.translate(0.45*k,-0.55*k);fn();c.strokeStyle='rgba(255,226,160,0.55)';c.lineWidth=w*0.8;c.stroke();c.restore();};
  const g0=bodyAt(p,pr,0.2,0.85),g1=bodyAt(p,pr,0.24,0),g2=bodyAt(p,pr,0.2,-0.85);ridge(()=>{c.beginPath();c.moveTo(g0[0],g0[1]);c.quadraticCurveTo(g1[0],g1[1],g2[0],g2[1]);},1.4*k);
  for(const v of [0.5,0,-0.5])for(let u=0.3;u<0.76;u+=0.07){const q=bodyAt(p,pr,u+(v===0?0.035:0),v);const s=spineAt(p,u);const ang=Math.atan2(-s.ty,-s.tx);ridge(()=>{c.beginPath();c.arc(q[0],q[1],0.03*L,ang-1.15,ang+1.15);},1.0*k);}
  const ey=bodyAt(p,pr,0.085,0.3);c.fillStyle='rgba(30,20,10,0.7)';c.beginPath();c.arc(ey[0]-0.5*k,ey[1]+0.6*k,0.03*L,0,7);c.fill();c.fillStyle='rgba(255,230,170,0.8)';c.beginPath();c.arc(ey[0]+0.4*k,ey[1]-0.5*k,0.022*L,0,7);c.fill();
  c.fillStyle='rgba(40,28,16,0.9)';c.beginPath();c.arc(ey[0],ey[1],0.012*L,0,7);c.fill();}
// 一组铜鱼的浮雕：先画投影，再画受光
function bronzeRelief(poses,TR,cam,alpha=1){const z=cam.z;
  layerBegin(eb0,TR);for(const p of poses)bronzeSil(eb0,p);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.6*alpha;ctx.filter=`brightness(0) blur(${(1.4*z).toFixed(1)}px)`;ctx.drawImage(EB0,-1.8*z,2.2*z);ctx.restore();
  layerBegin(hctx,TR);for(const p of poses){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}
    const g=hctx.createLinearGradient(x0,y1,x1,y0);g.addColorStop(0,'#4c3d25');g.addColorStop(0.55,'#735d38');g.addColorStop(1,'#9a7d4c');bronzeSil(hctx,p,g);}
  const edge=(sx,sy,col,al)=>{eb1.reset();eb1.drawImage(EB0,0,0);eb1.globalCompositeOperation='destination-out';eb1.drawImage(EB0,sx,sy);eb1.globalCompositeOperation='source-in';eb1.fillStyle=col;eb1.fillRect(0,0,W,H);
    hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.globalCompositeOperation='source-atop';hctx.globalAlpha=al;hctx.filter=`blur(${(0.9*z).toFixed(1)}px)`;hctx.drawImage(EB1,0,0);hctx.restore();};
  const dz=2.4*z;edge(-0.63*dz,0.77*dz,'rgb(236,206,146)',0.75);edge(0.63*dz,-0.77*dz,'rgb(26,18,10)',0.75);
  hctx.setTransform(...TR);hctx.globalCompositeOperation='source-atop';for(const p of poses)bronzeDetail(hctx,p);
  const pt=hctx.createPattern(PATINA,'repeat');pt.setTransform(new DOMMatrix([0.5,0,0,0.5,0,0]));hctx.fillStyle=pt;hctx.globalAlpha=0.85;hctx.fillRect(-30000,-3000,60000,6000);hctx.globalAlpha=1;hctx.globalCompositeOperation='source-over';
  blitLayer(HEROC,alpha);}
// 头部转动：以 u0 处为轴，把鱼头往一侧掰
function bendPose(p,u0,th){const N=p.N,piv=p.sp[Math.round(u0*N)];const sp=p.sp.map((q,i)=>{const u=i/N;if(u>=u0)return{...q};const a=th*Math.pow((u0-u)/u0,0.8);const dx=q.x-piv.x,dy=q.y-piv.y;const c=Math.cos(a),s=Math.sin(a);return{x:piv.x+dx*c-dy*s,y:piv.y+dx*s+dy*c};});
  for(let i=0;i<=N;i++){const A=sp[Math.max(0,i-1)],B=sp[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sg=(p.sp[i].nx*(-dy)+p.sp[i].ny*dx)>=0?1:-1;sp[i].nx=-dy*sg;sp[i].ny=dx*sg;}
  return{...p,sp};}
const T4LOOK0=44.55,T4LOOK1=45.1,T4GONE=46.6;
function twinPoses(t){const look=smooth(T4LOOK0,T4LOOK1,t)*(1-smooth(T4GONE+0.2,T4GONE+1.6,t));const follow=smooth(46.0,46.7,t)*(1-smooth(48.2,49.6,t));
  const lf=bendPose(straightPose(S4X-66,S4Y-66,-Math.PI/2,124,true),0.4,0.42*look-0.5*follow);
  const rt=bendPose(straightPose(S4X+66,S4Y-66,-Math.PI/2,124,false),0.4,-0.42*look);
  return[lf,rt];}
function drawS4Panel(t,cam,TR){const x0=S4X-S4W/2,y0=S4Y-S4W/2;panelShadow(x0,y0,S4W,S4W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S4W,S4W);ctx.clip();
  ctx.drawImage(LINEN,0,0,840,840,x0,y0,S4W,S4W);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(70,68,66)';ctx.fillRect(x0,y0,S4W,S4W);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.filter=`blur(${(10*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(8,6,4,0.65)';ctx.beginPath();ctx.arc(S4X-9,S4Y+12,R4+2,0,7);ctx.fill();ctx.restore();
  ctx.drawImage(BRZ,S4X-B4H/MS4,S4Y-B4H/MS4,B4W/MS4,B4W/MS4);
  bronzeRelief(twinPoses(t),TR,cam);
  ctx.restore();ctx.strokeStyle='rgba(30,26,22,0.5)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S4W,S4W);}
function styleBronze(t,cam,TR,p,clip){// 跨界时：只画自己这一侧
  if(clip){ctx.save();ctx.beginPath();ctx.rect(...clip);ctx.clip();}
  bronzeRelief([p],TR,cam);if(clip)ctx.restore();}

// ---------------- 肆 的登记 ----------------
STN.push({key:'s4',cx:S4X,hw:S4W/2,x0:-2300,x1:-1720,draw:drawS4Panel,style:styleBronze,prep:prepBronze});
LABELS.push([S4X,S4W,S4W,'肆','双鱼铜洗 · 大吉羊','东汉']);
LIGHTS.push({x:S4X,y:-10,r:600,k:t=>smooth(39.8,42.0,t)});
GK.push([41.8,-1800,32],[42.25,-1838,-28],[42.7,-1880,28],[43.15,-1922,96],[43.55,-1975,126],[43.9,S4X-2,104],[44.25,S4X,52],[44.6,S4X,-18],[44.9,S4X,-66],[45.3,S4X,-90],[45.9,S4X-1,-100],
  [46.2,S4X-5,-131],[46.45,S4X-26,-164],[46.75,S4X-67,-187],[47.0,S4X-113,-187],[47.25,S4X-148,-169],[47.6,S4X-200,-135],[48.05,S4X-262,-96],[48.4,S4X-320,-62]);
// 铜鱼刚活过来，身子还是硬的：转弯时少弯一点，游出去以后慢慢软下来
HSTIFF.push(t=>0.22*smooth(45.6,45.95,t)*(1-smooth(46.7,47.5,t)));
// 一下子活过来：起步的几下尾巴摆得又快又有劲，是尾巴把它推出去的
HFB.push(t=>1.6*smooth(45.65,45.9,t)*(1-smooth(46.3,46.9,t)));
HL.push([41.0,118],[42.2,108],[47.6,108]);
HAMP.push(t=>(1-0.45*smooth(45.0,45.3,t)*(1-smooth(45.55,45.85,t)))*(1+0.25*smooth(45.7,45.9,t)*(1-smooth(46.2,46.7,t))));
CK.push({t:42.0,x:S4X+60,y:0,z:1.5,f:0.3,ox:-40},{t:43.2,x:S4X+6,y:S4Y-2,z:1.95},{t:46.0,x:S4X,y:S4Y-8,z:2.05},{t:47.0,x:S4X-60,y:-30,z:1.6,f:0.3,ox:-60},{t:48.1,z:1.3,f:1,ox:-120,oy:0});
