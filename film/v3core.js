// ================= 陆 · 宋画 + 柒 · 元青花（沿用样片 v3，整体平移到全片的坐标和时间上） =================
const T6=51.7,OFF6=-3640;
const V3=(()=>{

const P=600,R=255,ZW=0.8;
const SCX=380,PCX=-380,PCY=0;
const MS=3,MH=260*MS,MW=520*MS;
const T_INSIDE=14.6,T_FREEZE=26.85,TP=26.2,T_WINK=44.8,T_LEAVE=45.9;
const RAW=[64,60,58],BLUE=[34,62,160];   // 淡处是清亮的蓝，浓处靠积料那两层压深

const SILK=(()=>{const w=2560,h=1440;const c=mk(w,h);const x=c.getContext('2d');const img=x.createImageData(w,h);const d=img.data;
  const n1=noise2(21,9,5),n2=noise2(22,40,22),n3=noise2(23,180,100);const r=rng(24);
  const row=new Float32Array(h),col=new Float32Array(w);for(let i=0;i<h;i++)row[i]=r();for(let i=0;i<w;i++)col[i]=r();
  const creases=[0.19,0.52,0.83];
  for(let y=0;y<h;y++){const v=y/h;for(let xx=0;xx<w;xx++){const u=xx/w;
    const st=n1(u*9,v*5)*0.65+n2(u*40,v*22)*0.35;
    let lum=(st-0.5)*0.20+(n3(u*180,v*100)-0.5)*0.05;
    lum+=(row[y]-0.5)*0.022+(col[xx]-0.5)*0.016+((y%4===0)?-0.007:0)+((xx%4===1)?-0.005:0);
    const dx=u-0.5,dy=v-0.5;lum-=(dx*dx*0.55+dy*dy*0.9)*0.55;
    for(const cp of creases){const dd=Math.abs(u-cp)*w;if(dd<6)lum-=(1-dd/6)*0.045;else if(dd<11)lum+=(1-(dd-6)/5)*0.012;}
    const k=1+lum;const i=(y*w+xx)*4;
    d[i]=clamp(198*k,0,255);d[i+1]=clamp(180*k*(1-st*0.05),0,255);d[i+2]=clamp(142*k*(1-st*0.10),0,255);d[i+3]=255;}}
  x.putImageData(img,0,0);
  for(let i=0;i<60;i++){const px=r()*w,py=r()*h,rad=2+r()*12;const g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,`rgba(110,72,36,${0.07+r()*0.10})`);g.addColorStop(1,'rgba(110,72,36,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rad,0,7);x.fill();}
  return c;})();

// 鉴藏印：朱文“觀魚”、白文“游心”
const SEAL1=mkSeal({chars:['觀','魚'],cols:1,rows:2,aspect:1.7,type:'zhu',size:240,seed:5}),SEAL2=mkSeal({chars:['游','心'],cols:1,rows:2,aspect:1.8,type:'bai',size:220,seed:9,sw:0.04});

// ---------------- 鱼的路线 ----------------
let hero=null;const V3KNOTS=[[-8,1300,260],[-4,1080,200],[0,860,160],[2.5,720,110],[4.5,600,40],[6.3,510,-50],[7.6,450,-105],[8.3,421,-128],[8.75,407,-136],[9.45,404,-138],[9.95,400,-131],[10.6,382,-106],[11.4,333,-62],[12.4,262,-22],[13.6,182,8],[15.0,122,22],[16.6,82,22],[18.2,52,15],[19.4,27,10],[20.4,2,6],[21.4,-38,0],[22.4,-108,-10],[23.2,-178,-20],[23.9,-232,-22],[24.5,-270,4],[24.95,-315,18],[25.4,-360,14],[25.75,-405,-4],[26.0,-436,-10],[26.2,-458,-9],[26.4,-474,-7],[26.6,-484,-5.6],[26.85,-489,-5.1],[27.2,-490,-5],[60,-490,-5]];
// 两条伴游的小鱼一直游到片尾（终章的鱼形展墙上，这幅画里也还有鱼在游）
const compB={tr:makeTrack([[-8,1250,290],[-4,1050,255],[0,880,236],[4,720,205],[8,600,226],[12,500,190],[16,430,214],[20,370,186],[24,320,206],[28,280,190],[32,250,205],[38,220,192],[44,200,204],[50,180,196],
  [56,152,172],[62,140,124],[68,162,80],[74,212,56],[80,276,60],[86,340,84],[92,398,120],[98,440,164],[104,474,204],[110,506,236],[116,540,262]],-8,116),L:()=>125};
const compC={tr:makeTrack([[-8,1300,95],[-4,1100,72],[0,950,56],[4,820,104],[8,700,76],[12,620,118],[16,560,86],[20,505,124],[24,470,96],[28,445,120],[32,425,100],[38,410,116],[44,400,104],[50,392,110],
  [56,378,96],[62,356,66],[68,328,28],[74,302,-14],[80,284,-62],[86,276,-110],[92,294,-150],[98,332,-176],[104,382,-188],[110,432,-182],[116,478,-166]],-8,116),L:()=>108};

// ---------------- 镜头（关键帧） ----------------
const CK=[[0,395,0,1.95,1,0],[7.4,382,-10,2.03,1,0],[9.0,418,-112,3.0,1,0],[10.3,414,-108,3.05,1,0],[11.8,375,-35,2.05,1,0],[14.4,330,0,2.0,1,0],
  [17.4,150,30,0.8,0,0],[19.0,70,30,0.8,0,0],[20.4,22,8,1.35,0,0],[22.4,-70,0,1.35,0,0],[24.2,-380,0,1.8,0,1],[31.0,-380,0,1.86,0,1],[38.8,-380,0,1.9,0,1],
  [41.0,-398,-6,3.0,0,1],[42.5,-366,6,3.1,0,1],[44.5,0,30,0.8,0,0],[60,0,30,0.8,0,0]];
// ---------------- 展墙 ----------------
function panelShadow(x,y,w,h){ctx.save();ctx.shadowColor='rgba(40,30,20,0.35)';ctx.shadowBlur=30*mosaicShadowScale;ctx.shadowOffsetY=12*mosaicShadowScale;ctx.fillStyle='#000';ctx.fillRect(x,y,w,h);ctx.restore();}
// ---------------- 伍 · 宋画 ----------------
const FLOAT=[[-250,-205,0.5,10],[-120,-232,2.2,9],[235,-178,4.1,11],[300,-38,1.3,10],[-35,198,3.3,10],[125,248,5.0,9],[262,228,0.9,11],[-330,95,2.7,10],[-420,-150,1.9,9],[440,120,3.6,10]].map(a=>[a[0]+SCX,a[1],a[2],a[3]]);
const FALL=[{x:SCX+270,y:10,t:2.2,s:11,r:0.4,ph:0.3},{x:SCX+150,y:-235,t:3.6,s:10,r:2.6,ph:2.2},{x:SCX+25,y:-139,t:5.0,s:12,r:2.1,ph:1.7,nib:true},
  {x:SCX-150,y:140,t:7.4,s:10,r:4.0,ph:2.9},{x:SCX+380,y:-190,t:9.2,s:11,r:1.2,ph:4.1},{x:SCX-60,y:-40,t:11.0,s:11,r:5.2,ph:0.9}];
const NIB=FALL[2];
function petalPath(c,s){c.beginPath();c.moveTo(0,s);c.bezierCurveTo(s*0.95,s*0.4,s*0.75,-s*0.85,s*0.18,-s*0.95);c.lineTo(0,-s*0.68);c.lineTo(-s*0.18,-s*0.95);c.bezierCurveTo(-s*0.75,-s*0.85,-s*0.95,s*0.4,0,s);c.closePath();}
function petal(c,x,y,rot,s,al,flip){c.save();c.translate(x,y);c.rotate(rot);c.scale(Math.max(0.12,Math.abs(flip)),1);
  const g=c.createLinearGradient(0,-s,0,s);g.addColorStop(0,`rgba(246,238,226,${0.94*al})`);g.addColorStop(1,`rgba(228,176,164,${0.92*al})`);
  petalPath(c,s);c.fillStyle=g;c.fill();c.strokeStyle=`rgba(120,72,60,${0.34*al})`;c.lineWidth=0.7;c.stroke();c.strokeStyle=`rgba(190,110,100,${0.22*al})`;c.lineWidth=0.5;c.beginPath();c.moveTo(0,s*0.8);c.lineTo(0,-s*0.4);c.stroke();c.restore();}
function petalInk(c,x,y,rot,s,rgb,al,lw=1){c.save();c.translate(x,y);c.rotate(rot);petalPath(c,s);c.fillStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.26*al})`;c.fill();
  c.strokeStyle=`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.95*al})`;c.lineWidth=1.1*lw;c.lineJoin='round';c.stroke();c.lineWidth=0.6*lw;c.beginPath();c.moveTo(0,s*0.75);c.quadraticCurveTo(s*0.1,0,0,-s*0.45);c.stroke();c.restore();}
function fallState(p,t){if(t<p.t){const d=p.t-t;return{x:p.x+22*Math.sin(d*2.1+p.ph)-d*14,y:p.y-d*95,rot:p.r+d*1.7,flip:Math.cos(d*3.3+p.ph)};}
  const d=t-p.t;let x=p.x+4*Math.sin(d*0.35+p.ph)+d*1.5,y=p.y+2*Math.sin(d*0.5+p.ph),rot=p.r+0.06*Math.sin(d*0.4+p.ph);
  if(p.nib&&t>8.75){const q=t-8.75;y+=2.6*Math.sin(q*13)*Math.exp(-q*2.2);x+=1.2*Math.sin(q*9)*Math.exp(-q*2.2);rot+=0.15*Math.sin(q*8)*Math.exp(-q*2);}
  return{x,y,rot,flip:1};}
function mouthOf(pose){const s0=spineAt(pose,0);return{x:s0.x+s0.tx*pose.L*0.05,y:s0.y+s0.ty*pose.L*0.05,rot:Math.atan2(s0.ty,s0.tx)+Math.PI/2+0.35};}
function nibPetal(t,pose) {
  const fl=fallState(NIB,t);if(t<9.45)return {...fl,s:NIB.s};
  const p=pose||fishPose(hero,t),s=spineAt(p,0),m=mouthOf(p),take=smooth(9.45,9.95,t);
  // Use the original catch and rotation. Seat the basal tip beneath the lips once the fish turns away.
  const settled=smooth(10.0,11.65,t),porcelain=1-smooth(R+24,R+101,Math.hypot(s.x-PCX,s.y-PCY));
  const q=bodyAt(p,PROF.song,.011,-.055),b=yuanBite(p),rx=lerp(q[0],b.x,porcelain),ry=lerp(q[1],b.y,porcelain);
  const rot=m.rot-.57*porcelain,sz=lerp(12,10.6,porcelain)*p.L/150;
  const x=lerp(m.x,rx+Math.sin(rot)*sz,settled),y=lerp(m.y,ry-Math.cos(rot)*sz,settled);
  return{x:lerp(fl.x,x,take),y:lerp(fl.y,y,take),rot:lerp(fl.rot,rot,take),flip:1,s:sz};
}
function ring(c,x,y,t0,t,maxr,dur,al){const d=t-t0;if(d<0||d>dur)return;const p=d/dur;const r=3+maxr*(1-Math.pow(1-p,2));c.strokeStyle=`rgba(40,32,24,${al*(1-p)})`;c.lineWidth=0.8;c.beginPath();c.arc(x,y,r,0,7);c.stroke();}
function blossomBough(c) {
  // Only the thin near end of the flowering branch enters the upper right of the scroll.
  c.save();c.translate(SCX+533,-300);
  const ink=(v)=>'rgba(90,64,42,'+v+')';
  const rails=[[[2,34],[-40,43],[-77,53],[-108,67],[-138,78],[-163,80]],
    [[-39,43],[-51,63],[-72,77],[-87,95]], [[-77,53],[-86,32],[-108,18]],
    [[-106,67],[-128,58],[-144,51]], [[-13,37],[-35,17],[-51,10]]];
  rails.forEach((r,i)=>ribbon(c,curvePts(r,35),v=>(i===0?3.1:1.5)*(.11+.89*Math.pow(1-v,.77)),ink(i===0?.68:.52),12+i));
  const tips=[[-39,44],[-68,53],[-90,59],[-114,68],[-141,78],[-150,77],[-71,77],[-87,92],[-104,21],[-142,52],[-45,16],[-18,39],[-94,41]];
  const r=rng(4216);
  for(const [x,y] of tips){
    const rot=r()*6.28;
    for(let j=0;j<3;j++){
      c.save();c.translate(x+6*(r()-.5),y+6*(r()-.5));c.rotate(rot+j*2.07);
      c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-1.6,-3.7,-2.1,-7.6,.2,-10.9-r()*4);c.quadraticCurveTo(3,-3,0,0);
      c.fillStyle='rgba(70,91,65,'+(.33+r()*.16)+')';c.fill();c.restore();
    }
    for(let j=0;j<2;j++){
      const xx=x+8*(r()-.5),yy=y+8*(r()-.5),scale=1.6+r()*1.7;
      for(let k=0;k<5;k++){const ang=rot+k*1.257;c.beginPath();c.ellipse(xx+scale*.77*Math.cos(ang),yy+scale*.77*Math.sin(ang),scale*1.07,scale*.66,ang,0,7);c.fillStyle='rgba(157,79,79,'+(.31+r()*.23)+')';c.fill();}
      c.beginPath();c.arc(xx,yy,scale*.36,0,7);c.fillStyle='rgba(141,104,44,.64)';c.fill();
    }
  }
  c.restore();
}
function weedsSong(t){blossomBough(ctx);ctx.save();ctx.lineCap='round';
  for(const [lx,ly,r,sw] of [[SCX-232,232,22,0.4],[SCX-172,262,18,1.1],[SCX-118,214,16,2.0],[SCX-300,190,14,2.7]]){
    ctx.strokeStyle='rgba(50,44,28,0.22)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(lx,ly);ctx.quadraticCurveTo(lx+20*Math.sin(t*0.4+sw),ly+40,lx-10,310);ctx.stroke();
    ctx.save();ctx.translate(lx,ly);ctx.scale(1,0.82);ctx.rotate(sw+0.05*Math.sin(t*0.5+sw));ctx.beginPath();ctx.moveTo(0,0);for(let i=0;i<=30;i++){const a=-Math.PI/2+0.16+i/30*(2*Math.PI-0.32);const rr=r*(1+0.04*Math.sin(i*1.9+sw));ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();
    const lg2=ctx.createRadialGradient(0,0,r*0.1,0,0,r);lg2.addColorStop(0,'rgba(132,138,90,0.22)');lg2.addColorStop(1,'rgba(92,98,58,0.42)');ctx.fillStyle=lg2;ctx.fill();ctx.strokeStyle='rgba(44,36,24,0.42)';ctx.lineWidth=0.7;ctx.stroke();
    ctx.strokeStyle='rgba(44,36,24,0.12)';ctx.lineWidth=0.5;for(let i=0;i<5;i++){const a=-Math.PI/2+0.9+i*1.15;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*0.8,Math.sin(a)*r*0.8);ctx.stroke();}ctx.restore();}
  for(const [bx,h,ph] of [[SCX+232,150,0],[SCX+258,120,1.4],[SCX+285,170,2.6],[SCX+470,160,0.8]]){const pts=[];for(let i=0;i<=30;i++){const v=i/30;pts.push([bx+14*Math.sin(v*3+ph+t*0.6)*v,300-h*v]);}
    ribbon(ctx,pts,v=>lerp(2.2,0.6,v),'rgba(46,40,26,0.42)',Math.floor(bx));
    for(let i=3;i<30;i+=2){const a=pts[i],b=pts[i+1],sd=(i/2|0)%2?1:-1;const ang=Math.atan2(b[1]-a[1],b[0]-a[0])+sd*0.7;leafShape(ctx,a[0],a[1],ang,lerp(13,6,i/30),lerp(3.4,2,i/30));ctx.fillStyle='rgba(92,96,56,0.30)';ctx.fill();ctx.strokeStyle='rgba(44,38,24,0.35)';ctx.lineWidth=0.5;ctx.stroke();}}
  ctx.restore();}
const INKC=mk(W,H);const inkx=INKC.getContext('2d');
function inkLayer(TR,fn){inkx.setTransform(1,0,0,1,0,0);inkx.globalCompositeOperation='source-over';inkx.filter='none';inkx.clearRect(0,0,W,H);inkx.setTransform(...TR);fn(inkx);
  inkx.setTransform(1,0,0,1,0,0);inkx.globalCompositeOperation='destination-out';inkx.globalAlpha=0.22;inkx.fillStyle=INKGRAIN;inkx.fillRect(0,0,W,H);inkx.globalAlpha=1;inkx.globalCompositeOperation='source-over';
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.filter='blur(0.5px)';ctx.drawImage(INKC,0,0);ctx.restore();}
function drawSongPanel(t,cam,TR){const w=lerp(P,P*16/9,cam.e5),x0=SCX-w/2,y0=-300;
  panelShadow(x0-9,y0-9,w+18,P+18);ctx.fillStyle='#ccd0c4';ctx.fillRect(x0-9,y0-9,w+18,P+18);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,P);ctx.clip();
  ctx.drawImage(SILK,SCX-533.33,-300,1066.67,600);
  ctx.globalCompositeOperation='multiply';weedsSong(t);ctx.globalCompositeOperation='source-over';
  inkLayer(TR,c=>{drawSong(c,fishPose(compB,t),cam.z,1,'distant');drawSong(c,fishPose(compC,t),cam.z,1,'vermilion');if(t<T_INSIDE)drawSong(c,fishPose(hero,t),cam.z);});
  ctx.globalCompositeOperation='multiply';
  for(const p of FALL){ring(ctx,p.x,p.y,p.t,t,52,2.6,0.32);ring(ctx,p.x,p.y,p.t+0.35,t,36,2.2,0.24);}
  ring(ctx,NIB.x,NIB.y,8.75,t,30,1.8,0.3);ring(ctx,NIB.x,NIB.y,9.1,t,22,1.6,0.24);
  ctx.globalCompositeOperation='source-over';
  for(const [x,y,r,s] of FLOAT)petal(ctx,x+3*Math.sin(t*0.3+r),y+1.5*Math.sin(t*0.4+r*2),r+0.04*Math.sin(t*0.35+r),s,1,1);
  for(const p of FALL){if(p.nib)continue;const st=fallState(p,t);if(st.y<-330)continue;petal(ctx,st.x,st.y,st.rot,p.s,1,st.flip);}
  if(t<T_INSIDE){const np=nibPetal(t);if(np.y>-330)petal(ctx,np.x,np.y,np.rot,np.s,1,np.flip);}
  stampSeal(ctx,SEAL1,SCX-273,-262,24,0.86,0.01);stampSeal(ctx,SEAL2,SCX+270,-264,21,0.9,-0.01);
  ctx.restore();
  ctx.strokeStyle='rgba(70,60,45,0.35)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,w,P);}

// ---------------- 柒 · 元青花 ----------------
const INK=mk(MW,MW);const ictx=INK.getContext('2d');const COL=mk(MW,MW);const cctx=COL.getContext('2d');
function leafShape(c,x,y,ang,len,wid){const cx=Math.cos(ang),sx=Math.sin(ang);const tx=x+cx*len,ty=y+sx*len;const mx=x+cx*len*0.5,my=y+sx*len*0.5;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(mx-sx*wid,my+cx*wid,tx,ty);c.quadraticCurveTo(mx+sx*wid,my-cx*wid,x,y);c.closePath();}
const STR=[['rib',[-0.40,0.44],[-0.646,0.09],[-0.563,-0.20],0.3],['frond',[-0.31,0.50],[-0.45,0.39],[-0.435,0.26],1.1],['frond',[-0.17,0.56],[-0.27,0.44],[-0.13,0.30],2.0],['frond',[-0.06,0.58],[0.04,0.48],[-0.05,0.37],3.3],
  ['frond',[0.06,0.58],[0.16,0.47],[0.07,0.36],2.8],['rib',[0.17,0.56],[0.25,0.45],[0.18,0.33],0.7],['frond',[0.29,0.51],[0.41,0.38],[0.30,0.25],1.7],['frond',[0.38,0.45],[0.47,0.33],[0.40,0.22],0.2],['rib',[0.45,0.37],[0.56,0.12],[0.49,-0.13],2.4]];
const strands=STR.map(([type,a,b,cc,ph])=>{const pts=[];const N=60;for(let i=0;i<=N;i++){const v=i/N;const x=(1-v)*(1-v)*a[0]+2*(1-v)*v*b[0]+v*v*cc[0],y=(1-v)*(1-v)*a[1]+2*(1-v)*v*b[1]+v*v*cc[1];
  pts.push({x:(x+0.012*Math.sin(v*9+ph))*R,y:y*R,w:type==='rib'?lerp(7.5,1.2,v)*(0.75+0.25*Math.sin(v*8+ph))*Math.min(1,0.3+v*9):lerp(2.6,0.8,v)});}return{type,pts};});
const DUCK=[[-0.22,-0.47,0.3],[-0.03,-0.53,1.2],[0.14,-0.49,2.0],[0.06,-0.40,2.6],[-0.12,-0.36,0.9],[0.3,0.08,1.5]];
const BUB=[[-0.47,-0.12,3.2],[-0.5,-0.2,4.4],[-0.47,-0.29,2.8]];
const BUBL=[];{const r=rng(81);for(let i=0;i<700;i++){const rr=R*0.97*Math.sqrt(r()),th=r()*Math.PI*2;BUBL.push([Math.cos(th)*rr,Math.sin(th)*rr,0.25+r()*0.8]);}}
let SPECK=null;
function drawRimDiaper(c, reveal) {
  if (reveal <= 0) return;
  if (!drawRimDiaper.mask) {
    const mask = mk(MW, MW);
    const ink = mask.getContext('2d');
    ink.setTransform(MS, 0, 0, MS, MH, MH);
    ink.lineCap = 'round'; ink.lineJoin = 'round';
    const count = 48;
    const step = 2 * Math.PI / count;
    const pitch = R * .927 * step;
    const halfHeight = R * .0400;
    function station(i) {
      // Measured in cells. A periodic displacement guarantees a clean seam.
      return i + .025 * Math.sin(3 * i * step) + .016 * Math.cos(8 * i * step);
    }
    function point(i, u, h) {
      const angle = -Math.PI / 2 + (station(i) + (station(i+1) - station(i)) * u) * step;
      const r = R*.926 + halfHeight*h + .17 * Math.sin(5 * angle);
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    }
    function lobe(i, u) {
      // Round the turn at the crown and leave the long sides almost straight.
      const arc = Math.sin(Math.PI*u);
      const shoulder = .071 * Math.sin(2*Math.PI*u) * Math.sin(i*.88);
      return arc * (.68+.32*arc) + shoulder;
    }
    function cord(i,u,side) {
      return point(i,u,lobe(i,u)*side*.93);
    }
    function brush(points,width,alpha) {
      ink.beginPath(); ink.moveTo(...points[0]);
      for(let j=1;j<points.length;j++) ink.lineTo(...points[j]);
      ink.lineWidth=width; ink.strokeStyle='rgba(0,0,0,'+alpha+')'; ink.stroke();
    }
    // Each half of a crossing is paired with the opposite half in the next
    // cell. The short cutback allows a glaze-white sliver under the upper cord.
    for (let i=0;i<count;i++) {
      for (const side of [-1,1]) {
        const pts=[];
        for(let j=0;j<=24;j++) pts.push(cord(i,j/24,side));
        brush(pts,1.26+.12*Math.sin(i*1.72+side),.9);
        brush(pts.map((_,j)=>point(i,j/24,lobe(i,j/24)*side*.93-side*.20)),.57,.80);
      }
    }
    for (let i=0;i<count;i++) {
      const side=i%2 ? -1:1, pts=[];
      for(let j=0;j<=5;j++)pts.push(cord((i+count-1)%count,.91+.09*j/5,-side));
      for(let j=1;j<=5;j++)pts.push(cord(i,.09*j/5,side));
      ink.save(); ink.globalCompositeOperation='destination-out';brush(pts,2.18,1); ink.restore();
      brush(pts,1.24,.95);
      // Small reserved four-leaf fleurettes inside the lozenges; a brush roll
      // leaves the fattened outer end of each mark darker than its root.
      const u=.5+.011*Math.sin(i*1.12), angle=-Math.PI/2+(station(i)+(station(i+1)-station(i))*u)*step;
      ink.save(); ink.translate(...point(i,u,.012*Math.sin(i)));
      ink.rotate(angle+Math.PI/2+.06*Math.cos(i*1.81));
      ink.scale(pitch/32,halfHeight/9.7);
      for (const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
        ink.save(); ink.scale(dx,dy);
        const breadth=1+.075*Math.sin(i*.9+dx+3*dy);
        ink.scale(breadth,1/breadth);
        ink.beginPath(); ink.moveTo(.32,.18);
        ink.bezierCurveTo(1.86,-.34,3.17,.77,4.62,.56);
        ink.bezierCurveTo(7.03,.69,7.28,2.75,5.77,3.80);
        ink.bezierCurveTo(4.21,5.03,1.83,3.90,1.60,2.57);
        ink.quadraticCurveTo(1.93,1.42,.32,.18);
        ink.fillStyle='rgba(0,0,0,'+(.91+.08*Math.sin(i+.58*dx*dy))+')'; ink.fill();
        // A flick through the loaded head leaves a tapered fleck of white.
        ink.save(); ink.globalCompositeOperation='destination-out';
        ink.beginPath(); ink.moveTo(2.44,1.55); ink.quadraticCurveTo(4.82,.92,5.80,2.25);
        ink.quadraticCurveTo(4.14,2.28,2.44,1.55); ink.fill(); ink.restore();
        ink.restore();
      }
      ink.beginPath(); ink.ellipse(0,0,.76,.65,0,0,Math.PI*2); ink.fill();
      ink.restore();
      // Short leaf-like dabs between touching diamonds, below each rule.
      for (const dir of [-1,1]) {
        const pos=(u,h)=>point(i,u,h*dir);
        for (const flip of [false,true]) {
          const q=(u,h)=>pos(flip?1-u:u,h);
          ink.beginPath(); ink.moveTo(...q(.014,.57));
          ink.bezierCurveTo(...q(.062,.54),...q(.112,.62),...q(.155,.74));
          ink.quadraticCurveTo(...q(.202,.86),...q(.248,.885));
          ink.bezierCurveTo(...q(.19,.92),...q(.147,.88),...q(.112,.83));
          ink.quadraticCurveTo(...q(.082,.97),...q(.047,.87));
          ink.quadraticCurveTo(...q(.009,.78),...q(.014,.57));
          ink.fillStyle='rgba(0,0,0,'+(.78+.11*Math.sin(i+dir))+')'; ink.fill();
        }
      }
    }
    drawRimDiaper.mask=mask;
  }
  c.save();
  if(reveal<1) {
    c.beginPath(); c.moveTo(0,0); c.arc(0,0,R*1.01,-Math.PI/2,-Math.PI/2+2*Math.PI*reveal); c.closePath(); c.clip();
  }
  c.drawImage(drawRimDiaper.mask,-MH/MS,-MH/MS,MW/MS,MW/MS);
  c.restore();
}
function wareDecoration(c,t) {
  const tau=Math.PI*2;
  const point=(angle,r)=>[Math.cos(angle)*r,Math.sin(angle)*r];
  const line=(pts,width,opacity=1)=>{
    if(pts.length<2)return;
    c.save();c.globalAlpha=opacity;c.lineWidth=width;c.beginPath();c.moveTo(...pts[0]);
    for(const p of pts.slice(1))c.lineTo(...p);
    c.stroke();c.restore();
  };
  const circle=(radius,width,p,index)=>{
    const pts=[];
    for(let j=0;j<=Math.ceil(p*240);j++) {
      const f=Math.min(j/240,p),angle=-Math.PI/2+tau*f;
      const slip=.23*Math.sin(3*angle+index*.19)+.12*Math.sin(7*angle+index*.4);
      pts.push(point(angle,R*radius+slip));
    }
    line(pts,width,.93);
  };
  [[.985,1.2],[.969,.8],[.883,1.2],[.866,.9],[.617,1.0],[.598,1.6]].forEach(([r,w],i)=>{
    const p=smooth(TP+i*.12,TP+.75+i*.12,t);
    if(p>0)circle(r,w,p,i);
  });
  drawRimDiaper(c,smooth(TP+.55,TP+3.02,t));
  const pv=smooth(TP+2.04,TP+4.04,t);
  if(pv<=0)return;
  // 一圈六段。花和藤共享弧形坐标。粗细变化留在真实分枝和花头上。
  const cells=[[-.018,1.02,.98,-.40],[.013,.86,1.03,.32],[-.007,1.05,1.01,.12],
               [.019,.97,.88,-.33],[-.020,1.07,.99,.24],[.012,.90,.99,.39]];
  const count=cells.length;
  // 两组三次曲线做成一个带收锋的笔面。正面色块内用留白揭开翻瓣。
  const path=(st,parts)=>{
    c.beginPath();c.moveTo(...st);
    for(const seg of parts)c.bezierCurveTo(...seg);
    c.closePath();
  };
  const wash=(st,parts,dark,edge=.53,clear=.72)=>{
    path(st,parts);
    c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fill();
    c.lineWidth=clear;c.stroke();c.restore();
    c.save();c.globalAlpha=dark;c.fill();c.globalAlpha=Math.min(1,dark+.15);c.lineWidth=edge;c.stroke();c.restore();
  };
  const reserve=(st,parts,strength)=>{
    c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=strength;
    path(st,parts);c.fill();c.restore();
  };
  const stem=(st,bends,width,alpha)=>{
    c.save();c.globalAlpha=alpha;c.lineWidth=width;c.beginPath();c.moveTo(...st);
    for(const seg of bends)c.bezierCurveTo(...seg);
    c.stroke();c.restore();
  };
  function foldedLeaf(x,y,angle,sx,sy,tone){
    c.save();c.translate(x,y);c.rotate(angle);c.scale(sx,sy);
    // 往前探的长叶，一侧的尖瓣翻回来压在深色叶心。
    wash([0,0],[[4,-1,7,-4,9,-8],[11,-5,10,-3,12,-3],[17,-4,19,-10,23,-12],
       [22,-9,21,-8,22,-6],[26,-8,26,-13,30,-14],[30,-11,28,-7,27,-5],
       [36,-6,39,-4,45,-9],[42,-1,36,0,30,3],[24,5,22,5,18,5],
       [19,7,22,7,22,9],[16,9,12,8,10,5],[9,10,4,11,3,11],[5,7,6,5,5,3],
       [4,1,2,1,0,0]],tone,.62,.72);
    reserve([3,1],[[12,1,18,-3,22,-3],[27,-4,33,-3,39,-6],[32,-2,31,-1,23,-.3],[18,.5,14,3,11,4],[10,2,6,1,3,1]],.63);
    stem([11,1],[[16,1,20,-2,22,-2],[29,-4,31,-2,36,-4]],.46,.64);
    c.restore();
  }
  function curlBud(x,y,turn,scale){
    c.save();c.translate(x,y);c.rotate(turn);c.scale(scale,scale);
    wash([0,0],[[6,-2,6,-8,11,-9],[17,-11,17,-3,14,-2],[16,-6,11,-7,11,-3],
      [11,1,14,2,17,0],[15,7,7,6,7,2],[7,0,4,0,0,0]],.91,.45,.50);
    c.restore();
  }
  function plume(x,y,angle,sx,sy){
    c.save();c.translate(x,y);c.rotate(angle);c.scale(sx,sy);
    wash([0,0],[[4,-1,7,-3,9,-6],[11,-10,13,-15,21,-16],[25,-17,30,-12,28,-8],
      [27,-4,23,-3,21,-5],[24,-5,25,-8,23,-10],[20,-12,15,-9,16,-5],
      [16,-3,20,-1,23,-2],[23,1,20,4,16,3],[14,3,11,2,9,0],
      [11,4,14,5,16,5],[15,8,8,8,6,5],[4,2,3,1,0,0]],.93,.52,.7);
    reserve([5,0],[[10,0,11,-9,16,-12],[19,-15,23,-15,25,-13],
      [19,-14,15,-11,13,-6],[10,0,8,2,5,0]],.58);
    c.restore();
  }
  function tipPetal(bx,by,tx,ty,width,hook,shade) {
    const dx=tx-bx,dy=ty-by,l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;
    const p=(u,w)=>[bx+u*dx+nx*w,by+u*dy+ny*w];
    const tip=p(1,hook),q=p(.74,hook*.52);
    wash([bx,by],[[...p(.20,-width*.84),...p(.66,-width*1.14),...tip],
       [...p(.75,width*.64+hook*.47),...p(.31,width*1.17),...p(.04,width*.22)],
       [...p(-.02,.5),...p(-.015,-.4),bx,by]],shade,.45,1.40);
    reserve(p(.16,-width*.14),[[...p(.37,-width*.47),...p(.67,-width*.09),...q],
       [...p(.58,-width*.14),...p(.40,-width*.13),...p(.16,-width*.14)]],.61);
  }
  function blossom(x,y,angle,sx,sy,phase) {
    c.save();c.translate(x,y);c.rotate(angle);c.scale(sx,sy);
    const petals=[[-4,4,-27,1,5.8,-2,.78],[-5,2,-27,-10,6.2,.8,.87],
     [-3,1,-22,-19,6.6,-1.7,.92],[-2,1,-13,-24,7.0,-.7,.87],[0,-1,-2,-29,7.4,-2.2,.96],
     [1,0,9,-24,5.9,.5,.91],[2,1,18,-20,6.5,1.9,.88],[4,0,26,-11,5.6,2,.82],
     [5,2,29,-3,5.3,1.1,.92],[6,4,25,8,5.9,1.4,.87],[-6,4,-22,15,6.5,-1,.90],
     [-2,6,-13,20,6.2,.95,.79],[3,6,4,22,5.8,.4,.83],[6,5,17,18,6.0,.6,.92]];
    for(let j=0;j<petals.length;j++){
      const [bx,by,tx,ty,w,h,d]=petals[j];
      const change=.065*Math.sin(phase*2+j*2.1);
      tipPetal(bx,by,tx*(1+change),ty*(1-change),w*(1+.8*change),h+phase*1.1,d-.035*Math.cos(j+phase));
    }
    // 前瓣用偏心、翻转的杯状曲线分离花心，避免另一朵放射状图标。
    wash([-16,3],[[-18,-3,-11,-13,-7,-14],[-4,-15,-1,-11,-1,-7],
      [-2,-3,-6,0,-7,2],[-9,6,-14,7,-16,3]],.76,.45,1.55);
    wash([-6,2],[[-9,-4,-6,-12,1,-16],[3,-18,7,-15,9,-11],
      [11,-5,6,-1,5,2],[1,5,-3,5,-6,2]],.88,.45,1.75);
    reserve([1,-14],[[4,-15,8,-12,8,-9],[6,-12,5,-12,2,-11],[0,-10,-1,-9,-3,-7],[-2,-10,0,-12,1,-14]],.65);
    wash([1,3],[[3,-4,11,-11,17,-9],[22,-7,18,-1,15,2],[12,6,8,9,5,9],[1,10,-1,7,1,3]],.72,.44,1.75);
    wash([-15,3],[[-11,1,-7,-1,-4,-2],[-5,3,-1,8,3,8],[-2,14,-11,12,-14,8],[-16,6,-16,5,-15,3]],.67,.46,1.62);
    wash([-3,5],[[-1,3,3,-.2,7,-2],[11,-2,15,.5,15,4],[13,4,11,5,9,8],
      [4,13,-2,13,-3,10],[-5,8,-4,6,-3,5]],.87,.46,1.74);
    reserve([3,5],[[6,1,12,-.5,14,2],[10,2,7,3,4,6],[2,9,1,9,1,9],[2,7,2,6,3,5]],.65);
    c.restore();
  }
  for(let i=0;i<count;i++){
    const open=clamp(pv*count-i);
    if(open<=0)break;
    const [offset,size,ys,tilt]=cells[i];
    // 展开环带用 (弧长, 离藤高度) 作图，二次分支与主线同根。
    const base=-Math.PI/2+(i+.055)*tau/count;
    const orbit=R*.744,w=orbit*tau/count;
    const world=(x,y)=>point(base+x/orbit,orbit-y);
    const curve=(a,b,d,e,u)=>{const v=1-u;return [v*v*v*a[0]+3*v*v*u*b[0]+3*v*u*u*d[0]+u*u*u*e[0],v*v*v*a[1]+3*v*v*u*b[1]+3*v*u*u*d[1]+u*u*u*e[1]];};
    const vine=(p,ctrl,prog,thick,opacity)=>{
      const pts=[];
      for(let k=0;k<=Math.ceil(prog*42);k++){const u=Math.min(k/42,prog),q=curve(p,...ctrl,u);pts.push(world(...q));}
      line(pts,thick,opacity);
    };
    const bx=(x,y)=>[x*w,y];
    const node=(x,y,draw)=>{
      const a=base+x/orbit;
      c.save();c.translate(...world(x,y));c.rotate(a+Math.PI/2);draw();c.restore();
    };
    // 主藤在花旁抬高再回落，与两道独立的卷须一同包出留白。
    vine(bx(0,3),[bx(.12,-11),bx(.25,-11),bx(.40,1)],clamp(open/.40),1.35,1);
    vine(bx(.40,1),[bx(.56,14),bx(.79,18),bx(1,3)],clamp((open-.35)/.52),1.22,.97);
    vine(bx(.08,-3),[bx(.16,-2),bx(.20,-16),bx(.31,-16)],clamp((open-.07)/.24),1.30,.98);
    const sprout=(position,height,at,span,paint)=>{
      const q=smooth(at,at+span,open);
      if(q>0)node(position*w,height,()=>{c.scale(q,q);paint();});
    };
    sprout(.305,-16,.24,.12,()=>{foldedLeaf(0,0,.16,1.00,.87,.94);plume(7,-.6,-2.71,.58,.67);});
    vine(bx(.29,-6),[bx(.32,-2),bx(.36,11),bx(.31,18)],clamp((open-.22)/.20),1.03,.93);
    sprout(.307,18,.36,.13,()=>plume(0,0,2.55,.69,.63));
    vine(bx(.38,.1),[bx(.40,-3),bx(.405,-9),bx(.375,-12)],clamp((open-.33)/.13),.86,.95);
    sprout(.375,-12,.42,.10,()=>curlBud(0,0,2.72,.49));
    vine(bx(.46,6),[bx(.50,-12),bx(.55,-15),bx(.65,-16)],clamp((open-.36)/.23),1.23,.96);
    sprout(.64,-15.8,.55,.11,()=>{foldedLeaf(0,0,.29,.94,-.83,.89);plume(9,2,2.68,.54,-.64);});
    vine(bx(.57,12),[bx(.62,21),bx(.72,30),bx(.79,22)],clamp((open-.51)/.20),1.1,.93);
    sprout(.79,22,.66,.12,()=>plume(0,0,-.75,.70,.69));
    vine(bx(.65,14),[bx(.625,12),bx(.61,6),bx(.62,3)],clamp((open-.58)/.13),.87,.96);
    sprout(.62,3,.65,.08,()=>curlBud(0,0,-.95,.55));
    sprout(.81,13,.74,.12,()=>foldedLeaf(0,0,.38,.72,.78,.93));
    sprout(.93,6,.86,.13,()=>plume(0,0,2.55,.56,.54));
    const growth=smooth(.11,.31,open);
    if(growth>0)node((.11+offset)*w,-.5,()=>blossom(0,0,tilt,size*growth*1.16,ys*growth*1.055,i%3-1));
  }
}
function renderInk(t){const c=ictx;c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,MW,MW);c.setTransform(MS,0,0,MS,MH,MH);
  c.lineCap='round';c.lineJoin='round';c.strokeStyle='#000';c.fillStyle='#000';c.filter='none';
  wareDecoration(c,t);

  // 盘心的上下两丛带状叶与漂浮的莼、萍。坐标以整盘口沿半径为一。
  c.save();
  c.beginPath();c.arc(0,0,.592*R,0,Math.PI*2);c.clip();
  c.scale(R,R);c.fillStyle=c.strokeStyle='#000';c.lineJoin='round';c.lineCap='round';
  const bank=[
    // Start at the lip, bend outwards with the current, then taper back.
    // x0, control x/y, control x/y, tip x/y, full half-width, relative ink.
    [-.110,-.132,-.548,-.207,-.493,-.242,-.461,.0120,.83],
    [-.093,-.128,-.515,-.215,-.476,-.287,-.421,.0115,.96],
    [-.077,-.105,-.504,-.271,-.426,-.327,-.369,.0130,.88],
    [-.061,-.093,-.457,-.285,-.371,-.367,-.312,.0137,.90],
    [-.045,-.052,-.459,-.260,-.343,-.391,-.251,.0152,.99],
    [-.028,-.040,-.422,-.232,-.338,-.361,-.210,.0123,.85],
    [-.010,-.016,-.442,-.169,-.336,-.263,-.223,.0145,.93],
    [.008,.004,-.455,.096,-.374,.175,-.285,.0127,.87],
    [.022,.029,-.427,.156,-.339,.279,-.229,.0141,.96],
    [.041,.069,-.460,.235,-.359,.356,-.251,.0151,.87],
    [.059,.104,-.471,.264,-.378,.366,-.31,.0116,.93],
    [.077,.14,-.50,.258,-.423,.331,-.368,.0143,.81],
    [.099,.155,-.53,.243,-.469,.294,-.425,.0120,.96],
    [.119,.160,-.554,.225,-.504,.252,-.466,.0138,.89]
  ];
  function paintBlade(spec,j,bottom) {
    let [x0,x1,y1,x2,y2,x3,y3,width,tone]=spec;
    let y0=-.596;
    if(bottom){
      x0=.017-x0*1.08;x1=.015-x1*1.08;x2=.003-x2*.98;x3=-.016-x3*(j<7?.94:1.00);
      y0=.6;y1=-y1+.013;y2=-y2+.029*Math.sin(j*.6);
      y3=-y3+.017*Math.cos(j*.73)+(j===6?.035:0);
      width*=1.04+.10*Math.cos(j*.87);
    }
    const start=TP+(bottom?1.00:1.34)+Math.abs(j-(bottom?4:7))*.064;
    const grown=smooth(start,start+1.44,t);if(grown<=0)return;
    const edge=[],other=[],crease=[];
    for(let i=0;i<=30;i++){
      const u=grown*i/30,z=1-u;
      const x=z*z*z*x0+3*z*z*u*x1+3*z*u*u*x2+u*u*u*x3;
      const y=z*z*z*y0+3*z*z*u*y1+3*z*u*u*y2+u*u*u*y3;
      const dx=z*z*(x1-x0)+2*z*u*(x2-x1)+u*u*(x3-x2);
      const dy=z*z*(y1-y0)+2*z*u*(y2-y1)+u*u*(y3-y2);
      const q=Math.hypot(dx,dy),nx=-dy/q,ny=dx/q;
      const w=width*(.12*(1-u)+Math.pow(Math.sin(Math.PI*Math.pow(u,.86)),.82));
      const fold=1-.24*Math.exp(-Math.pow((u-(.53+.10*Math.cos(j)))/.14,2));
      edge.push([x+w*nx,y+w*ny]);other.push([x-w*(.57+.21*u)*fold*nx,y-w*(.57+.21*u)*fold*ny]);crease.push([x+w*.37*nx,y+w*.37*ny]);
    }
    c.save();c.beginPath();edge.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));other.slice().reverse().forEach(([x,y])=>c.lineTo(x,y));c.closePath();
    c.globalAlpha=tone;c.fill();c.globalAlpha=.65;c.lineWidth=.0016;c.stroke();
    if(j%4===1||j%5===2){c.globalCompositeOperation='destination-out';c.globalAlpha=.68;c.lineWidth=.0019;
      c.beginPath();crease.slice(3,-4).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
    c.restore();
  }
  for(let i=0;i<bank.length;i++){paintBlade(bank[i],i,false);if(i!==3)paintBlade(bank[i],i,true);}
  paintBlade([-.003,-.009,-.457,-.056,-.357,-.110,-.269,.0132,.91],16,false);
  paintBlade([.003,.001,-.465,.051,-.371,.064,-.302,.0089,.76],18,false);
  paintBlade([.009,.012,-.478,.081,-.344,.121,-.284,.0117,.85],17,true);
  // Closed leaf pads are pulled by a fine, hooked pedicel. Each has a different
  // contour, a few reserved veins, and a wetter grey-blue lower lobe.
  function waterleaf(x,y,r,angle,aspect,kind,index){
    const born=TP+2.32+index*.050, grow=smooth(born,born+.64,t);if(grow<=0)return;
    c.save();c.translate(x,y);c.rotate(angle);c.scale(r*grow,r*aspect*grow);
    const tone=[.97,.84,.91,.99,.88][index%5];
    if(kind===1){
      // Side-view of a folded leaf. The darker lip wraps round a lighter lobe.
      c.beginPath();c.moveTo(-.92,.21);c.bezierCurveTo(-.78,-.84,-.06,-1.07,.73,-.81);
      c.bezierCurveTo(.85,-.22,.60,.51,.05,.73);c.quadraticCurveTo(-.66,.85,-.92,.21);c.closePath();
      c.globalAlpha=tone;c.fill();c.lineWidth=.055;c.globalAlpha=.84;c.stroke();
      c.globalCompositeOperation='destination-out';c.globalAlpha=.76;c.lineWidth=.048;
      c.beginPath();c.moveTo(-.73,.43);c.quadraticCurveTo(.12,.05,.59,-.65);c.stroke();c.restore();return;
    }
    const leaf=new Path2D();
    leaf.moveTo(-.31,.20);leaf.bezierCurveTo(-.64,.19,-1.04,.29,-1.05,-.05);
    leaf.bezierCurveTo(-1.11,-.67,-.58,-1.09,.04,-.98);
    leaf.bezierCurveTo(.46,-1.06,.94,-.57,1,-.11);leaf.bezierCurveTo(1.12,.42,.66,.93,.24,.93);
    leaf.bezierCurveTo(-.38,1.04,-.75,.83,-.94,.58);leaf.quadraticCurveTo(-.88,.43,-.31,.20);
    c.globalAlpha=tone;c.fill(leaf);c.globalAlpha=.90;c.lineWidth=.055;c.stroke(leaf);
    c.beginPath();c.moveTo(-.33,.22);c.bezierCurveTo(-.88,.34,-1.56,.37,-1.49,.76);c.quadraticCurveTo(-1.43,.97,-1.20,.86);
    c.globalAlpha=.83;c.lineWidth=.065;c.stroke();
    c.save();c.clip(leaf);
    c.globalAlpha=.48;c.beginPath();c.moveTo(-.94,.47);c.bezierCurveTo(-.63,.89,.23,.9,.84,.35);
    c.bezierCurveTo(.69,1.21,-.34,1.25,-.94,.72);c.closePath();c.fill();
    c.globalAlpha=.47;c.lineWidth=.047;c.beginPath();c.moveTo(.15,-.9);c.bezierCurveTo(.51,-.82,.71,-.45,.72,-.26);c.stroke();
    c.globalCompositeOperation='destination-out';c.globalAlpha=.64;
    for(let k=0;k<4;k++){
      const a=[-.85,-.38,.29,.67][k];
      c.lineWidth=(index%3===0?.038:.028)*(k===0?1.32:1);
      c.beginPath();c.moveTo(-.28,.20);c.quadraticCurveTo(.14,.07+a*.36,.70-Math.abs(a)*.27,a);c.stroke();
    }
    c.globalAlpha=.22;c.lineWidth=.076;c.beginPath();c.moveTo(-.85,-.25);c.bezierCurveTo(-.9,-.59,-.51,-.9,-.18,-.88);c.stroke();
    c.restore();c.restore();
  }
  const pads=[
    [-.294,-.458,.039,-.68,1.02,0],[-.394,-.372,.047,-.45,1.07,0],[-.455,-.284,.044,.26,1.18,0],
    [-.496,-.177,.051,.42,1.18,0],[-.518,-.094,.019,.42,.76,1],
    [-.501,.14,.050,-.68,1.16,0],[-.462,.255,.049,1.01,.98,0],[-.407,.354,.036,-.23,1.10,1],
    [-.322,.452,.034,-1.16,.88,0],[-.183,.483,.02,.14,.83,1],
    [.317,-.443,.040,2.78,.91,0],[.409,-.341,.049,-2.88,1.08,0],[.493,-.233,.044,-1.72,1.15,0],
    [.511,-.12,.03,-.47,.91,1],[.498,.139,.051,-2.37,1.04,0],[.476,.242,.047,-2.47,1.17,0],
    [.401,.351,.045,1.57,1.08,0],[.300,.451,.033,.2,.87,1],
    [-.27,-.169,.024,-.64,.94,1],[-.067,-.205,.034,.65,.87,0],[.129,-.216,.022,1.43,.67,1],
    [-.15,.211,.047,-.8,.82,0],[-.073,.282,.029,1.1,.89,0],[.037,.243,.036,-.71,.92,0]
  ];
  pads.forEach((p,i)=>waterleaf(...p,i));
  const sprigs=[[-.35,-.20,.020,-.35],[.278,-.160,.022,-1],[-.37,.177,.016,.1],[.305,.20,.023,.18],[.035,-.23,.017,-.3],[-.224,.16,.014,.1]];
  sprigs.forEach(([x,y,r,angle],i)=>{
    const grown=smooth(TP+3.17+i*.09,TP+3.91+i*.09,t);if(!grown)return;
    c.save();c.translate(x,y);c.rotate(angle);c.scale(r*grown,r*grown);
    const spread=[[-1.72,.64],[-.93,.91],[.1,1.22],[1.92,.78],[2.73,.43]];
    c.lineWidth=.075;c.globalAlpha=.81;c.beginPath();c.moveTo(.14,.64);c.quadraticCurveTo(.45,1.12,.73,1.08);c.stroke();
    for(let j=0;j<5;j++){
      c.save();c.rotate(spread[j][0]);c.scale(1,spread[j][1]);c.globalAlpha=[.91,.74,.86,.96,.78][j];
      c.beginPath();c.moveTo(0,.1);c.bezierCurveTo(-.25,-.1,-.40,-.66,-.13,-.98);c.quadraticCurveTo(.17,-1.17,.29,-.83);c.quadraticCurveTo(.33,-.41,0,.1);c.fill();c.restore();
    }
    c.restore();
  });
  c.restore();
  // 鱼一碰到盘面，盘上的那部分就是画在釉坯上的钴料（和盘上别的纹样同一种墨色），一直到它定住、入窑；所以定住那一刻不会再变样
  if(t>=T_INSIDE){
    c.setTransform(MS,0,0,MS,MH-MS*PCX,MH-MS*PCY);
    const pose=fishPose(hero,Math.min(t,T_LEAVE)),ga=.16+.84*(1-smooth(T_LEAVE,T_LEAVE+.40,t));
    const pet=nibPetal(Math.min(t,T_LEAVE),pose);
    c.save();petalInk(c,pet.x,pet.y,pet.rot,pet.s,[0,0,0],1,.76);
    c.globalAlpha=ga;drawYuan(c,pose,[0,0,0],1,1.5*MS);yuanLipOver(c,pose,[0,0,0]);c.restore();}
}
const COBNOISE=(()=>{const c=mk(MW,MW);const x=c.getContext('2d');const img=x.createImageData(MW,MW);const n0=noise2(70,7,7),n1=noise2(71,26,26),n2=noise2(72,110,110);const s0=MW/7,s1=MW/26,s2=MW/110;
  for(let y=0;y<MW;y++)for(let xx=0;xx<MW;xx++){const v=n0(xx/s0,y/s0)*0.3+n1(xx/s1,y/s1)*0.42+n2(xx/s2,y/s2)*0.28;img.data[(y*MW+xx)*4+3]=255*clamp(0.5+v*0.62,0,1);}x.putImageData(img,0,0);return c;})();
// 积料：钴料在线条里、在平涂的边上堆得厚，烧出来更深（元青花“浓处发黑、淡处见底”的那种层次）。
// 做法：原墨减去它自己的模糊——细线几乎全留下，大片平涂只留下边，再拿深蓝去乘
const EDG=mk(MW,MW),edx=EDG.getContext('2d');
function cobaltEdge(){edx.setTransform(1,0,0,1,0,0);edx.globalCompositeOperation='source-over';edx.globalAlpha=1;edx.filter='none';edx.clearRect(0,0,MW,MW);
  edx.drawImage(INK,0,0);edx.globalCompositeOperation='destination-out';edx.filter=`blur(${(2.4*MS).toFixed(1)}px)`;edx.globalAlpha=0.85;edx.drawImage(INK,0,0);edx.globalAlpha=1;edx.filter='none';
  edx.globalCompositeOperation='source-in';edx.fillStyle='rgb(24,30,96)';edx.fillRect(0,0,MW,MW);edx.globalCompositeOperation='source-over';}
// 铁锈斑：钴料堆厚的地方烧出来发黑的斑。整盘先撒好（成簇、大小不一、顺着随便一个方向略长），每帧只留落在钴料上的那些
let SPKM=null,POOLM=null;const SPKC=mk(MW,MW),spx=SPKC.getContext('2d');
function ensureSpeck(){if(SPKM)return;SPKM=mk(MW,MW);const x=SPKM.getContext('2d');const r=rng(91);const cl=noise2(92,16,16);x.fillStyle='#000';
  for(let i=0;i<5200;i++){const u=r(),v=r();const k=cl(u*16,v*16);if(r()>Math.pow(k,2.4)*1.7)continue;const big=r()<0.1;const rad=(big?1.1+r()*1.2:0.35+r()*0.6)*MS;
    x.save();x.translate(u*MW,v*MW);x.rotate(r()*Math.PI);x.globalAlpha=0.7+r()*0.3;x.beginPath();x.ellipse(0,0,rad*(1+r()*0.8),rad*(0.5+r()*0.4),0,0,7);x.fill();
    if(big){for(let j=0;j<3;j++){x.beginPath();x.ellipse((r()-0.5)*rad*1.6,(r()-0.5)*rad,rad*0.6,rad*0.4,r()*3,0,7);x.fill();}}x.restore();}
  // 积料：钴料在平涂里不匀，一片片地深下去
  POOLM=mk(MW,MW);const px=POOLM.getContext('2d');const img=px.createImageData(MW,MW);const n1=noise2(93,24,24),n2=noise2(94,90,90);
  for(let y=0;y<MW;y++)for(let xx=0;xx<MW;xx++){const v=n1(xx/MW*24,y/MW*24)*0.62+n2(xx/MW*90,y/MW*90)*0.38;img.data[(y*MW+xx)*4+3]=255*smooth(0.52,0.74,v);}px.putImageData(img,0,0);}
// 拿当时的墨裁出：mask 和墨重叠的部分，涂成 col
function maskInk(mask,col){spx.setTransform(1,0,0,1,0,0);spx.globalCompositeOperation='source-over';spx.globalAlpha=1;spx.filter='none';spx.clearRect(0,0,MW,MW);
  spx.drawImage(mask,0,0);spx.globalCompositeOperation='destination-in';spx.drawImage(INK,0,0);spx.globalCompositeOperation='source-in';spx.fillStyle=col;spx.fillRect(0,0,MW,MW);spx.globalCompositeOperation='source-over';return SPKC;}
function colorizeInk(col){cctx.setTransform(1,0,0,1,0,0);cctx.globalCompositeOperation='source-over';cctx.clearRect(0,0,MW,MW);cctx.drawImage(INK,0,0);cctx.globalCompositeOperation='source-in';cctx.fillStyle=col;cctx.fillRect(0,0,MW,MW);cctx.globalCompositeOperation='destination-in';cctx.drawImage(COBNOISE,0,0);cctx.globalCompositeOperation='source-over';}
const cpOf=t=>smooth(35.8,36.6,t);
function drawPlate(t,cx,cy,z){
  const cp=cpOf(t),glazeP=smooth(31.0,32.6,t),glazeA=0.88*(1-smooth(35.9,36.6,t));
  let sg=ctx.createRadialGradient(cx+10,cy+22,R*0.75,cx+10,cy+22,R*1.15);sg.addColorStop(0,'rgba(0,0,0,0.55)');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(cx+10,cy+22,R*1.15,0,7);ctx.fill();
  const c0=mixA([226,218,202],[236,242,242],cp),c1=mixA([198,188,168],[202,215,217],cp);
  const bd=ctx.createRadialGradient(cx-R*.3,cy-R*.35,R*0.05,cx,cy,R*1.08);bd.addColorStop(0,rgba(c0,1));bd.addColorStop(1,rgba(c1,1));ctx.fillStyle=bd;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
  if(cp<1){ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();ctx.globalAlpha=0.12*(1-cp);ctx.globalCompositeOperation='multiply';ctx.fillStyle=PLATEGRAIN;ctx.fillRect(cx-R,cy-R,2*R,2*R);ctx.restore();}
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R*0.877,0,Math.PI*2);ctx.moveTo(cx+R*0.57,cy);ctx.arc(cx,cy,R*0.57,0,Math.PI*2,true);ctx.closePath();
  let lg=ctx.createLinearGradient(cx-R*.8,cy-R*.8,cx+R*.8,cy+R*.8);lg.addColorStop(0,'rgba(60,50,40,0.13)');lg.addColorStop(0.5,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(255,255,255,0.16)');ctx.fillStyle=lg;ctx.fill();ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.moveTo(cx+R*0.877,cy);ctx.arc(cx,cy,R*0.877,0,Math.PI*2,true);ctx.closePath();lg=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);lg.addColorStop(0,'rgba(255,255,255,0.18)');lg.addColorStop(1,'rgba(40,30,20,0.10)');ctx.fillStyle=lg;ctx.fill();ctx.restore();
  ctx.lineWidth=1.6;ctx.strokeStyle='rgba(40,30,20,0.16)';ctx.beginPath();ctx.arc(cx,cy,R*0.876,0,7);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,R*0.881,Math.PI*0.9,Math.PI*1.7);ctx.stroke();
  ctx.strokeStyle='rgba(30,20,10,0.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,R-0.8,0,7);ctx.stroke();
  let fishOn=false;
  if(t>=T_INSIDE && t<TP){const travel=fishPose(hero,t),pet=nibPetal(t,travel);
    fishOn=Math.hypot(pet.x-cx,pet.y-cy)<R+pet.s*1.45 || travel.sp.some(q=>Math.hypot(q.x-cx,q.y-cy)<R+12);}
  if(t>=TP||fishOn){renderInk(t);colorizeInk(rgba(mixA(RAW,BLUE,cp),1));
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-1,0,7);ctx.clip();
    if(cp>0.01){ctx.globalAlpha=0.42*cp;ctx.filter=`blur(${(2.6*z).toFixed(1)}px)`;ctx.drawImage(COL,cx-260,cy-260,520,520);ctx.filter='none';}   // 晕散：钴料在釉里化开一圈
    ctx.globalAlpha=0.94;ctx.globalCompositeOperation='multiply';if(cp>0.01)ctx.filter=`blur(${(0.45*z*cp).toFixed(2)}px)`;ctx.drawImage(COL,cx-260,cy-260,520,520);ctx.filter='none';ctx.globalAlpha=1;
    if(cp>0.01){cobaltEdge();ctx.globalAlpha=0.42*cp;ctx.filter=`blur(${(0.35*z).toFixed(2)}px)`;ctx.drawImage(EDG,cx-260,cy-260,520,520);ctx.filter='none';ctx.globalAlpha=1;}
    if(cp>0.01){
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,R*.983,0,Math.PI*2);ctx.arc(cx,cy,R*.617,0,Math.PI*2,true);ctx.clip();
      ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.42*cp;ctx.drawImage(COL,cx-260,cy-260,520,520);ctx.restore();
    }
    ctx.globalCompositeOperation='source-over';
    if(cp>0.01){
      ctx.save();ctx.beginPath();
      ctx.arc(cx,cy,R*.865,0,Math.PI*2);ctx.arc(cx,cy,R*.62,0,Math.PI*2,true);ctx.clip();
      spx.setTransform(1,0,0,1,0,0);spx.globalAlpha=1;spx.filter='none';spx.globalCompositeOperation='source-over';
      spx.clearRect(0,0,MW,MW);spx.drawImage(INK,0,0);
      spx.globalCompositeOperation='destination-in';spx.drawImage(INK,0,0);spx.drawImage(INK,0,0);
      spx.globalCompositeOperation='source-in';spx.fillStyle='rgb(30,47,94)';spx.fillRect(0,0,MW,MW);spx.globalCompositeOperation='source-over';
      ctx.globalAlpha=cp*.46;ctx.globalCompositeOperation='multiply';ctx.drawImage(SPKC,cx-260,cy-260,520,520);ctx.restore();
    }
    if(cp>0.01){ensureSpeck();
      ctx.globalCompositeOperation='multiply';ctx.globalAlpha=0.55*cp;ctx.drawImage(maskInk(POOLM,'rgb(40,44,120)'),cx-260,cy-260,520,520);   // 积料处深下去
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=0.9*cp;ctx.filter=`blur(${(0.3*z).toFixed(2)}px)`;ctx.drawImage(maskInk(SPKM,'rgb(16,17,40)'),cx-260,cy-260,520,520);ctx.filter='none';ctx.globalAlpha=1;}
    ctx.restore();}
  if(glazeP>0&&glazeA>0.002){ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();
    const drips=[[-150,26],[-60,18],[40,30],[120,20],[190,24],[-210,16]];
    const edge=x=>{let y=cy-R-30+(2*R+90)*glazeP+8*Math.sin(x*0.05+1.3)+5*Math.sin(x*0.13);for(const [dx,dl] of drips)y+=dl*Math.exp(-Math.pow((x-dx)/7,2))*(glazeP<1?1:0);return y;};
    ctx.beginPath();ctx.moveTo(cx-R-5,cy-R-40);ctx.lineTo(cx+R+5,cy-R-40);for(let x=R+5;x>=-R-5;x-=3)ctx.lineTo(cx+x,edge(x));ctx.closePath();
    ctx.fillStyle=`rgba(236,232,224,${glazeA})`;ctx.fill();
    ctx.save();ctx.clip();ctx.globalAlpha=0.06*glazeA;ctx.globalCompositeOperation='multiply';ctx.fillStyle=PLATEGRAIN;ctx.fillRect(cx-R,cy-R,2*R,2*R);ctx.restore();
    if(glazeP<1){ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=2;ctx.beginPath();for(let x=-R-5;x<=R+5;x+=3)ctx.lineTo(cx+x,edge(x)-1.5);ctx.stroke();}
    ctx.restore();}
  if(cp>0){const clear=1-glazeA/0.88;const k=cp*clear;ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();
    ctx.strokeStyle=`rgba(70,110,130,${0.10*k})`;ctx.lineWidth=10;ctx.beginPath();ctx.arc(cx,cy,R*0.585,0,7);ctx.stroke();
    for(const [x,y,r] of BUBL){ctx.beginPath();ctx.arc(cx+x,cy+y,r,0,7);ctx.fillStyle=`rgba(255,255,255,${0.20*k})`;ctx.fill();ctx.strokeStyle=`rgba(60,80,100,${0.10*k})`;ctx.lineWidth=0.25;ctx.stroke();}
    ctx.filter=`blur(${(4*z).toFixed(1)}px)`;
    ctx.fillStyle=`rgba(255,255,255,${0.11*k})`;ctx.save();ctx.translate(cx-R*0.34,cy-R*0.42);ctx.rotate(-0.62);ctx.beginPath();ctx.roundRect(-R*0.13,-R*0.045,R*0.26,R*0.09,R*0.04);ctx.fill();ctx.restore();
    ctx.fillStyle=`rgba(255,255,255,${0.55*k})`;ctx.save();ctx.translate(cx-R*0.62,cy-R*0.6);ctx.rotate(-0.78);ctx.beginPath();ctx.roundRect(-R*0.08,-R*0.016,R*0.16,R*0.032,R*0.016);ctx.fill();ctx.restore();ctx.filter='none';
    const sh=ctx.createRadialGradient(cx-R*0.35,cy-R*0.45,0,cx-R*0.35,cy-R*0.45,R*0.9);sh.addColorStop(0,`rgba(255,255,255,${0.14*k})`);sh.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sh;ctx.fillRect(cx-R,cy-R,2*R,2*R);
    ctx.save();ctx.translate(cx,cy);
    const inner=ctx.createRadialGradient(0,0,R*.605,0,0,R*.889);
    inner.addColorStop(0,'rgba(25,50,65,0)');inner.addColorStop(.50,'rgba(38,59,70,.035)');inner.addColorStop(.89,'rgba(63,71,73,.15)');inner.addColorStop(1,'rgba(71,83,89,0)');
    ctx.globalAlpha=k;ctx.fillStyle=inner;ctx.beginPath();ctx.arc(0,0,R*.89,0,7);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(0,0,R*.868,0,Math.PI*2);ctx.arc(0,0,R*.619,0,Math.PI*2,true);ctx.clip();
    const overhead=ctx.createLinearGradient(-.3*R,-.88*R,.34*R,.62*R);
    overhead.addColorStop(0,'rgba(52,67,71,.13)');overhead.addColorStop(.38,'rgba(62,81,92,.035)');
    overhead.addColorStop(.66,'rgba(255,249,227,.015)');overhead.addColorStop(1,'rgba(255,252,235,.12)');
    ctx.fillStyle=overhead;ctx.fillRect(-R,-R,2*R,2*R);ctx.restore();
    for(const [r,a,b,strength,weight] of [[.861,.52,1.15,.37,2.2],[.863,1.17,1.52,.22,1.4],[.987,3.58,4.60,.63,1.03],[.624,3.95,4.42,.21,.86]]){
      const sheen=ctx.createLinearGradient(Math.cos(a)*R*r,Math.sin(a)*R*r,Math.cos(b)*R*r,Math.sin(b)*R*r);
      sheen.addColorStop(0,'rgba(255,255,249,0)');sheen.addColorStop(.40,'rgba(255,255,249,'+strength+')');sheen.addColorStop(1,'rgba(255,255,249,0)');
      ctx.strokeStyle=sheen;ctx.lineWidth=weight;ctx.beginPath();ctx.arc(0,0,R*r,a,b);ctx.stroke();
    }
    ctx.restore();
    const sp=smooth(38.0,39.0,t);if(sp>0&&sp<1){ctx.translate(cx,cy);ctx.rotate(-Math.PI/4);const d=lerp(-1.4,1.4,sp)*R;const gr=ctx.createLinearGradient(d-70,0,d+70,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,0.32)');gr.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gr;ctx.fillRect(d-70,-R*1.5,140,R*3);}
    ctx.restore();}
  const wv=t-T_WINK-0.1;if(wv>0&&wv<1.1){const tp=spineAt(fishPose(hero,t),0.98);const p=wv/1.1;ctx.strokeStyle=`rgba(255,255,255,${0.5*(1-p)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(tp.x,tp.y,4+34*(1-Math.pow(1-p,2)),0,7);ctx.stroke();}
}
function drawQingPanel(t,cam){const w=lerp(P,P*16/9,cam.e7),x0=PCX-w/2,y0=-300;
  panelShadow(x0,y0,w,P);ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,P);ctx.clip();
  const bg=ctx.createRadialGradient(PCX,-30,60,PCX,0,w*0.6);bg.addColorStop(0,'#33363d');bg.addColorStop(1,'#15161a');ctx.fillStyle=bg;ctx.fillRect(x0,y0,w,P);
  drawPlate(t,PCX,PCY,cam.z);ctx.restore();}

// ---------------- 越界：鱼衔着花瓣从绢上游出来 ----------------
function drawHeroOutside(t,cam,TR) {
  if(t<T_INSIDE||t>=T_FREEZE)return;
  const p=fishPose(hero,t),np=nibPetal(t,p);
  if(!p.sp.some(q=>Math.hypot(q.x-PCX,q.y-PCY)>R-p.L*.27) && Math.hypot(np.x-PCX,np.y-PCY)<R-np.s*1.4)return;
  const beyond=c=>{c.beginPath();c.rect(-6000,-3000,12000,6000);c.moveTo(PCX+R-1,PCY);c.arc(PCX,PCY,R-1,0,2*Math.PI);c.clip('evenodd');};
  const cloth=smooth(18.3,20.1,t);
  ctx.save();beyond(ctx);
  if(cloth){
    ctx.fillStyle='rgba(186,173,137,'+(.80*cloth)+')';bodyFill(ctx,edges(p,PROF.song));ctx.fill();
    ctx.fillStyle='rgba(177,163,130,'+(.52*cloth)+')';tailSongPath(ctx,p);ctx.fill();
    for(const [i,j,h,side,back] of [[.27,.56,.069,1,1],[.585,.717,.05,-1,1.5],[.409,.509,.059,-1,1.7]]){
      finPath(ctx,finPts(p,PROF.song,i,j,h,side,back));ctx.fill();
    }
  }
  ctx.restore();
  inkLayer(TR,c=>{c.save();beyond(c);drawSong(c,p,cam.z);c.restore();});
  ctx.save();beyond(ctx);petal(ctx,np.x,np.y,np.rot,np.s,1,np.flip);ctx.restore();
}
// ---------------- 屏幕层 ----------------
const EMB=[];{const r=rng(7);for(let i=0;i<70;i++)EMB.push({x:r(),sp:50+r()*140,off:r()*1400,sz:1+r()*2.4,fl:r()*6,dr:(r()-.5)*40});}
const BUF=mk(W,H);const bctx=BUF.getContext('2d');
function blackbody(h){const st=[[0,[30,4,2]],[0.3,[130,22,6]],[0.55,[210,74,18]],[0.8,[248,148,56]],[1,[255,222,168]]];for(let i=0;i<st.length-1;i++){if(h<=st[i+1][0]){const p=(h-st[i][0])/(st[i+1][0]-st[i][0]);return mixA(st[i][1],st[i+1][1],p);}}return st[st.length-1][1];}
function kilnFX(t,cam){const dark=smooth(32.4,33.0,t)*(1-smooth(36.8,37.8,t));let heat=smooth(32.8,34.8,t)*(1-smooth(35.6,36.6,t));
  if(dark<=0.001&&heat<=0.001)return;heat*=0.94+0.06*Math.sin(t*23)*Math.sin(t*7.3);
  const sx=W/2+(PCX-cam.x)*cam.z,sy=H/2+(PCY-cam.y)*cam.z,sr=R*cam.z;const rev=smooth(36.8,38.2,t);
  ctx.save();
  if(rev<=0){ctx.fillStyle=`rgba(5,4,3,${0.94*dark})`;ctx.fillRect(0,0,W,H);}
  else{const lx=sx-0.5*sr,ly=sy-0.6*sr;const rr=lerp(0.85*sr,2800,Math.pow(rev,1.5)),D=0.94*dark,c0=D*(1-smooth(0,0.3,rev));const g=ctx.createRadialGradient(lx,ly,0,lx,ly,rr);
    for(let i=0;i<=8;i++){const v=i/8;g.addColorStop(v,`rgba(5,4,3,${(c0+(D-c0)*v*v*(3-2*v)).toFixed(4)})`);}ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  if(heat>0.001){const hot=blackbody(heat),edge=blackbody(heat*0.75);
    const gg=ctx.createRadialGradient(sx-0.18*sr,sy-0.2*sr,sr*0.05,sx,sy,sr);gg.addColorStop(0,rgba(hot,heat));gg.addColorStop(0.75,rgba(mixA(hot,edge,0.6),heat));gg.addColorStop(1,rgba(edge,heat));ctx.fillStyle=gg;ctx.beginPath();ctx.arc(sx,sy,sr,0,7);ctx.fill();
    ctx.globalCompositeOperation='multiply';ctx.globalAlpha=0.16*heat;ctx.drawImage(COL,sx-260*cam.z,sy-260*cam.z,520*cam.z,520*cam.z);ctx.globalAlpha=1;
    ctx.globalCompositeOperation='lighter';const hg=ctx.createRadialGradient(sx,sy,sr*0.92,sx,sy,sr*1.7);hg.addColorStop(0,rgba(edge,0.32*heat));hg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=hg;ctx.fillRect(0,0,W,H);
    for(const e of EMB){const y=H+40-((t*e.sp+e.off)%1400);const x=e.x*W+e.dr*Math.sin(t*1.3+e.fl);const a=heat*(0.5+0.5*Math.sin(t*9+e.fl))*0.8;ctx.fillStyle=`rgba(255,${150+Math.floor(e.fl*14)},70,${a})`;ctx.beginPath();ctx.arc(x,y,e.sz,0,7);ctx.fill();}}
  ctx.restore();
  if(heat>0.05){bctx.clearRect(0,0,W,H);bctx.drawImage(cv,0,0);const y0=Math.max(0,Math.floor(sy-sr*1.3)),y1=Math.min(H,Math.ceil(sy+sr*1.3));const amp=5*heat;
    for(let y=y0;y<y1;y+=4){const dx=amp*Math.sin(y*0.04+t*7)+amp*0.5*Math.sin(y*0.12-t*11);ctx.drawImage(BUF,0,y,W,4,dx,y,W,4);}}}
const LINES=[[27.4,30.6,['落笔时','还看不出蓝']],[33.3,36.2,['入窑','一千三百度']]];



return{drawSongPanel,drawQingPanel,drawHeroOutside,kilnFX,inkLayer,setHero:h=>{hero=h;},CK3:CK,LINES3:LINES,SCX,PCX,R,P,T_INSIDE,T_FREEZE,T_WINK,T_LEAVE,BLUE,RAW,KNOTS:V3KNOTS};
})();
