// ================= 陆 · 宋画 + 柒 · 元青花（沿用样片 v3，整体平移到全片的坐标和时间上） =================
const T6=51.7,OFF6=-3640;
const V3=(()=>{

const P=600,R=255,ZW=0.8;
const SCX=380,PCX=-380,PCY=0;
const MS=3,MH=260*MS,MW=520*MS;
const T_INSIDE=14.6,T_FREEZE=26.85,TP=26.2,T_WINK=44.8,T_LEAVE=45.9;
const RAW=[64,60,58],BLUE=[20,40,124];

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
function panelShadow(x,y,w,h){ctx.save();ctx.shadowColor='rgba(40,30,20,0.35)';ctx.shadowBlur=30;ctx.shadowOffsetY=12;ctx.fillStyle='#000';ctx.fillRect(x,y,w,h);ctx.restore();}
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
function nibPetal(t){const fl=fallState(NIB,t);if(t<9.45)return{...fl,s:NIB.s};const m=mouthOf(fishPose(hero,t));const a=smooth(9.45,9.95,t);const L=hero.L(t);
  return{x:lerp(fl.x,m.x,a),y:lerp(fl.y,m.y,a),rot:lerp(fl.rot,m.rot,a),flip:1,s:12*L/150};}
function ring(c,x,y,t0,t,maxr,dur,al){const d=t-t0;if(d<0||d>dur)return;const p=d/dur;const r=3+maxr*(1-Math.pow(1-p,2));c.strokeStyle=`rgba(40,32,24,${al*(1-p)})`;c.lineWidth=0.8;c.beginPath();c.arc(x,y,r,0,7);c.stroke();}
function weedsSong(t){ctx.save();ctx.lineCap='round';
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
  inkLayer(TR,c=>{drawSong(c,fishPose(compB,t),cam.z);drawSong(c,fishPose(compC,t),cam.z);if(t<T_INSIDE)drawSong(c,fishPose(hero,t),cam.z);});
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
const STR=[['rib',[-0.40,0.44],[-0.53,0.12],[-0.47,-0.20],0.3],['frond',[-0.30,0.50],[-0.42,0.34],[-0.30,0.17],1.1],['frond',[-0.17,0.56],[-0.27,0.44],[-0.13,0.30],2.0],['frond',[-0.06,0.58],[0.04,0.48],[-0.05,0.37],3.3],
  ['frond',[0.06,0.58],[0.16,0.47],[0.07,0.36],2.8],['rib',[0.17,0.56],[0.25,0.45],[0.18,0.33],0.7],['frond',[0.29,0.51],[0.41,0.38],[0.30,0.25],1.7],['frond',[0.38,0.45],[0.47,0.33],[0.40,0.22],0.2],['rib',[0.45,0.37],[0.56,0.12],[0.49,-0.13],2.4]];
const strands=STR.map(([type,a,b,cc,ph])=>{const pts=[];const N=60;for(let i=0;i<=N;i++){const v=i/N;const x=(1-v)*(1-v)*a[0]+2*(1-v)*v*b[0]+v*v*cc[0],y=(1-v)*(1-v)*a[1]+2*(1-v)*v*b[1]+v*v*cc[1];
  pts.push({x:(x+0.012*Math.sin(v*9+ph))*R,y:y*R,w:type==='rib'?lerp(7.5,1.2,v)*(0.75+0.25*Math.sin(v*8+ph))*Math.min(1,0.3+v*9):lerp(2.6,0.8,v)});}return{type,pts};});
const DUCK=[[-0.22,-0.47,0.3],[-0.03,-0.53,1.2],[0.14,-0.49,2.0],[0.06,-0.40,2.6],[-0.12,-0.36,0.9],[0.3,0.08,1.5]];
const BUB=[[-0.47,-0.12,3.2],[-0.5,-0.2,4.4],[-0.47,-0.29,2.8]];
const BUBL=[];{const r=rng(81);for(let i=0;i<700;i++){const rr=R*0.97*Math.sqrt(r()),th=r()*Math.PI*2;BUBL.push([Math.cos(th)*rr,Math.sin(th)*rr,0.25+r()*0.8]);}}
let SPECK=null;
function renderInk(t){const c=ictx;c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,MW,MW);c.setTransform(MS,0,0,MS,MH,MH);
  c.lineCap='round';c.lineJoin='round';c.strokeStyle='#000';c.fillStyle='#000';c.filter='none';
  // 圈线：一圈一圈画
  [[0.985,3.2],[0.975,1.2],[0.81,2.4],[0.785,1.6],[0.615,1.6],[0.595,2.6]].forEach(([r,lw],i)=>{const p=smooth(TP+i*0.12,TP+0.75+i*0.12,t);if(p<=0)return;c.lineWidth=lw;c.beginPath();c.arc(0,0,r*R,-Math.PI/2,-Math.PI/2+2*Math.PI*p);c.stroke();});
  // 口沿海水：八道密线逐条画，浪头随后留白
  const W0=TP+0.6,r0=0.815*R,r1=0.972*R;
  for(let j=0;j<8;j++){const p=smooth(W0+j*0.1,W0+j*0.1+1.8,t);if(p<=0)continue;const rj=r0+(j+0.5)*(r1-r0)/8;c.lineWidth=0.95;c.beginPath();const n=Math.floor(720*p);
    for(let i=0;i<=n;i++){const th=-Math.PI/2+i/720*Math.PI*2;const r=rj+2.0*Math.sin(th*32+j*0.9);i?c.lineTo(Math.cos(th)*r,Math.sin(th)*r):c.moveTo(Math.cos(th)*r,Math.sin(th)*r);}c.stroke();}
  for(let kk=0;kk<14;kk++){const fk=(kk+0.5)/14;const st=W0+0.35+fk*1.8;const cp=smooth(st,st+0.3,t);if(cp<=0)continue;const th=-Math.PI/2+fk*Math.PI*2;const rc=0.893*R;
    c.save();c.translate(Math.cos(th)*rc,Math.sin(th)*rc);c.rotate(th+Math.PI/2);
    c.globalCompositeOperation='destination-out';c.globalAlpha=cp;c.beginPath();c.ellipse(0,0,15,10.5,0,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';
    c.lineWidth=1.3;c.beginPath();const nn=Math.floor(44*cp);for(let i=0;i<=nn;i++){const ph=i/44*Math.PI*2.3;const rr=9.5*(1-i/44*0.8);c.lineTo(1.5-Math.cos(ph)*rr,-Math.sin(ph)*rr*0.9);}c.stroke();
    c.lineWidth=0.9;c.beginPath();c.ellipse(0,0.5,13.5,9,0,Math.PI*1.08,Math.PI*(1.08+0.84*cp));c.stroke();
    for(let q=0;q<5;q++){if(q/5>cp)break;const a=Math.PI*(1.12+q*0.19);c.beginPath();c.arc(Math.cos(a)*17.5,Math.sin(a)*12.5,1.05,0,7);c.fill();}
    c.restore();c.globalAlpha=1;}
  // 内壁缠枝莲：藤先走，叶和花随着长出来
  const pv=smooth(TP+2.2,TP+4.0,t);
  if(pv>0){const stem=th=>0.70*R+0.026*R*Math.sin(th*10);c.lineWidth=2.7;c.beginPath();const n=Math.floor(600*pv);
    for(let i=0;i<=n;i++){const th=-Math.PI/2+i/600*Math.PI*2;const r=stem(th);i?c.lineTo(Math.cos(th)*r,Math.sin(th)*r):c.moveTo(Math.cos(th)*r,Math.sin(th)*r);}c.stroke();
    for(let kk=0;kk<40;kk++){if(kk%8===3)continue;const f=(kk+0.5)/40;const g=clamp((pv-f)/0.05);if(g<=0)continue;const th=-Math.PI/2+f*Math.PI*2;const r=stem(th);const side=kk%2?1:-1;const px=Math.cos(th)*r,py=Math.sin(th)*r;const ang=th+Math.PI/2+side*0.95;
      leafShape(c,px,py,ang,21*g,6.6*g);c.globalAlpha=0.62;c.fill();c.globalAlpha=1;c.lineWidth=1.0;c.stroke();
      c.lineWidth=0.6;c.beginPath();c.moveTo(px,py);c.lineTo(px+Math.cos(ang)*14*g,py+Math.sin(ang)*14*g);c.stroke();
      if(kk%4===1&&g>0.6){c.lineWidth=0.9;c.beginPath();for(let i=0;i<=16;i++){const a=i/16*Math.PI*2.2;const rr=5*(1-i/16*0.75);c.lineTo(px-side*Math.cos(th)*6+Math.cos(a)*rr,py-side*Math.sin(th)*6+Math.sin(a)*rr);}c.stroke();}}
    for(let kk=3;kk<40;kk+=8){const f=(kk+0.5)/40;const g=clamp((pv-f)/0.06);if(g<=0)continue;const th=-Math.PI/2+f*Math.PI*2;const r=stem(th);const px=Math.cos(th)*r,py=Math.sin(th)*r;
      for(let q=0;q<7;q++){const a=q/7*Math.PI*2;c.save();c.translate(px+Math.cos(a)*8*g,py+Math.sin(a)*8*g);c.rotate(a);c.beginPath();c.ellipse(0,0,8.4*g,4.8*g,0,0,7);c.globalAlpha=0.6;c.fill();c.globalAlpha=1;c.lineWidth=0.9;c.stroke();c.restore();}
      c.beginPath();c.arc(px,py,3.6*g,0,7);c.globalAlpha=0.85;c.fill();c.globalAlpha=1;}}
  // 盘心：水草从根往上长
  c.save();c.beginPath();c.arc(0,0,0.592*R,0,7);c.clip();
  strands.forEach(({type,pts},si)=>{const p=smooth(TP+1.0+0.15*si,TP+2.1+0.15*si,t);if(p<=0)return;const n=Math.max(1,Math.floor((pts.length-1)*p));
    if(type==='rib'){if(n>=3){const Lp=[],Rp=[];for(let i=0;i<=n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;const nx=-dy/l,ny=dx/l,w=pts[i].w;Lp.push([pts[i].x+nx*w,pts[i].y+ny*w]);Rp.push([pts[i].x-nx*w,pts[i].y-ny*w]);}
      c.beginPath();Lp.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=Rp.length-1;i>=0;i--)c.lineTo(Rp[i][0],Rp[i][1]);c.closePath();c.globalAlpha=0.5;c.fill();c.globalAlpha=1;
      c.lineWidth=1.2;c.beginPath();Lp.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();c.beginPath();Rp.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();
      c.lineWidth=0.6;c.beginPath();for(let i=0;i<=n;i++)i?c.lineTo(pts[i].x,pts[i].y):c.moveTo(pts[i].x,pts[i].y);c.stroke();}}
    else{ribbon(c,pts.slice(0,n+1).map(q=>[q.x,q.y]),v=>lerp(2.8,0.9,v*n/(pts.length-1)),'#000',si);
      for(let i=2;i<n;i+=2){const a=pts[i],b=pts[i+1];const ang0=Math.atan2(b.y-a.y,b.x-a.x);const sd=(i/2)%2?1:-1;const v=i/(pts.length-1);const g=clamp((n-i)/6);leafShape(c,a.x,a.y,ang0+sd*0.8,lerp(13,6,v)*g,lerp(3.4,2,v)*g);c.globalAlpha=0.55;c.fill();c.globalAlpha=1;c.lineWidth=0.8;c.stroke();}}});
  const pl=smooth(TP+3.2,TP+4.0,t);
  if(pl>0){const lx=0.47*R,ly=-0.43*R,lr=40*pl;c.save();c.beginPath();for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;const rr=lr*(1+0.05*Math.sin(i*2.7));i?c.lineTo(lx+Math.cos(a)*rr,ly+Math.sin(a)*rr*0.86):c.moveTo(lx+Math.cos(a)*rr,ly+Math.sin(a)*rr*0.86);}c.closePath();
    c.globalAlpha=0.42;c.fill();c.globalAlpha=1;c.lineWidth=1.4;c.stroke();c.lineWidth=0.75;for(let i=0;i<11;i++){const a=i/11*Math.PI*2+0.2;c.beginPath();c.moveTo(lx-4*pl,ly+3*pl);c.quadraticCurveTo(lx+Math.cos(a+0.15)*lr*0.5,ly+Math.sin(a+0.15)*lr*0.43,lx+Math.cos(a)*lr*0.95,ly+Math.sin(a)*lr*0.82);c.stroke();}
    c.beginPath();c.arc(lx-4*pl,ly+3*pl,3*pl,0,7);c.fill();c.restore();}
  const pd=smooth(TP+3.6,TP+4.2,t);
  if(pd>0){DUCK.forEach(([x,y,rot])=>{c.save();c.translate(x*R,y*R);c.rotate(rot);[[0,0,5.5],[8,3,4.5],[3,-7,4]].forEach(([dx,dy,r])=>{c.globalAlpha=pd*0.55;c.beginPath();c.arc(dx,dy,r*pd,0,7);c.fill();c.globalAlpha=pd;c.lineWidth=1.1;c.stroke();});c.restore();});
    c.globalAlpha=pd;c.lineWidth=1.1;BUB.forEach(([x,y,r])=>{c.beginPath();c.arc(x*R,y*R,r,0,7);c.stroke();});c.globalAlpha=1;}
  c.restore();
  const fi=smooth(T_FREEZE-0.45,T_FREEZE-0.15,t);
  if(fi>0){c.setTransform(MS,0,0,MS,MH-MS*PCX,MH-MS*PCY);const pose=fishPose(hero,Math.min(t,T_LEAVE));const ga=t<T_LEAVE?1:0.16+0.84*(1-smooth(T_LEAVE,T_LEAVE+0.4,t));c.globalAlpha=ga*fi;drawYuan(c,pose,[0,0,0],1,1.5*MS);c.globalAlpha=1;const m=mouthOf(fishPose(hero,Math.min(t,T_LEAVE-0.02)));petalInk(c,m.x,m.y,m.rot,12*pose.L/150,[0,0,0],fi,1.2);}
}
const COBNOISE=(()=>{const c=mk(MW,MW);const x=c.getContext('2d');const img=x.createImageData(MW,MW);const n1=noise2(71,26,26),n2=noise2(72,110,110);const s1=MW/26,s2=MW/110;
  for(let y=0;y<MW;y++)for(let xx=0;xx<MW;xx++){const v=n1(xx/s1,y/s1)*0.6+n2(xx/s2,y/s2)*0.4;img.data[(y*MW+xx)*4+3]=255*clamp(0.62+v*0.45,0,1);}x.putImageData(img,0,0);return c;})();
function ensureSpeck(){if(SPECK)return;renderInk(31.0);const d=ictx.getImageData(0,0,MW,MW).data;const r=rng(91);SPECK=[];let tries=0;
  while(SPECK.length<1400&&tries<900000){tries++;const px=Math.floor(r()*MW),py=Math.floor(r()*MW);if(d[(py*MW+px)*4+3]>230)SPECK.push([px/MS-260,py/MS-260,0.3+r()*0.65]);}}
function colorizeInk(col){cctx.setTransform(1,0,0,1,0,0);cctx.globalCompositeOperation='source-over';cctx.clearRect(0,0,MW,MW);cctx.drawImage(INK,0,0);cctx.globalCompositeOperation='source-in';cctx.fillStyle=col;cctx.fillRect(0,0,MW,MW);cctx.globalCompositeOperation='destination-in';cctx.drawImage(COBNOISE,0,0);cctx.globalCompositeOperation='source-over';}
const cpOf=t=>smooth(35.8,36.6,t);
function drawPlate(t,cx,cy,z){
  const cp=cpOf(t),glazeP=smooth(31.0,32.6,t),glazeA=0.88*(1-smooth(35.9,36.6,t));
  let sg=ctx.createRadialGradient(cx+10,cy+22,R*0.75,cx+10,cy+22,R*1.15);sg.addColorStop(0,'rgba(0,0,0,0.55)');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(cx+10,cy+22,R*1.15,0,7);ctx.fill();
  const c0=mixA([226,218,202],[241,244,239],cp),c1=mixA([198,188,168],[210,219,215],cp);
  const bd=ctx.createRadialGradient(cx-R*.3,cy-R*.35,R*0.05,cx,cy,R*1.08);bd.addColorStop(0,rgba(c0,1));bd.addColorStop(1,rgba(c1,1));ctx.fillStyle=bd;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
  if(cp<1){ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();ctx.globalAlpha=0.12*(1-cp);ctx.globalCompositeOperation='multiply';ctx.fillStyle=PLATEGRAIN;ctx.fillRect(cx-R,cy-R,2*R,2*R);ctx.restore();}
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R*0.8,0,Math.PI*2);ctx.moveTo(cx+R*0.57,cy);ctx.arc(cx,cy,R*0.57,0,Math.PI*2,true);ctx.closePath();
  let lg=ctx.createLinearGradient(cx-R*.8,cy-R*.8,cx+R*.8,cy+R*.8);lg.addColorStop(0,'rgba(60,50,40,0.13)');lg.addColorStop(0.5,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(255,255,255,0.16)');ctx.fillStyle=lg;ctx.fill();ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.moveTo(cx+R*0.8,cy);ctx.arc(cx,cy,R*0.8,0,Math.PI*2,true);ctx.closePath();lg=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);lg.addColorStop(0,'rgba(255,255,255,0.18)');lg.addColorStop(1,'rgba(40,30,20,0.10)');ctx.fillStyle=lg;ctx.fill();ctx.restore();
  ctx.lineWidth=1.6;ctx.strokeStyle='rgba(40,30,20,0.16)';ctx.beginPath();ctx.arc(cx,cy,R*0.8,0,7);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,R*0.805,Math.PI*0.9,Math.PI*1.7);ctx.stroke();
  ctx.strokeStyle='rgba(30,20,10,0.25)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,R-0.8,0,7);ctx.stroke();
  if(t>=TP){renderInk(t);colorizeInk(rgba(mixA(RAW,BLUE,cp),1));
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-1,0,7);ctx.clip();
    if(cp>0.01){ctx.globalAlpha=0.35*cp;ctx.filter=`blur(${(2.2*z).toFixed(1)}px)`;ctx.drawImage(COL,cx-260,cy-260,520,520);ctx.filter='none';}
    ctx.globalAlpha=0.94;ctx.globalCompositeOperation='multiply';if(cp>0.01)ctx.filter=`blur(${(0.45*z*cp).toFixed(2)}px)`;ctx.drawImage(COL,cx-260,cy-260,520,520);ctx.filter='none';ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    if(cp>0){ensureSpeck();ctx.fillStyle=`rgba(8,14,44,${0.55*cp})`;for(const [x,y,r] of SPECK){ctx.beginPath();ctx.arc(cx+x,cy+y,r,0,7);ctx.fill();}}
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
    ctx.fillStyle=`rgba(255,255,255,${0.45*k})`;ctx.save();ctx.translate(cx-R*0.34,cy-R*0.42);ctx.rotate(-0.62);ctx.beginPath();ctx.roundRect(-R*0.13,-R*0.045,R*0.26,R*0.09,R*0.04);ctx.fill();ctx.restore();
    ctx.fillStyle=`rgba(255,255,255,${0.55*k})`;ctx.save();ctx.translate(cx-R*0.62,cy-R*0.6);ctx.rotate(-0.78);ctx.beginPath();ctx.roundRect(-R*0.08,-R*0.016,R*0.16,R*0.032,R*0.016);ctx.fill();ctx.restore();ctx.filter='none';
    const sh=ctx.createRadialGradient(cx-R*0.35,cy-R*0.45,0,cx-R*0.35,cy-R*0.45,R*0.9);sh.addColorStop(0,`rgba(255,255,255,${0.14*k})`);sh.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sh;ctx.fillRect(cx-R,cy-R,2*R,2*R);
    const sp=smooth(38.0,39.0,t);if(sp>0&&sp<1){ctx.translate(cx,cy);ctx.rotate(-Math.PI/4);const d=lerp(-1.4,1.4,sp)*R;const gr=ctx.createLinearGradient(d-70,0,d+70,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,0.32)');gr.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gr;ctx.fillRect(d-70,-R*1.5,140,R*3);}
    ctx.restore();}
  const wv=t-T_WINK-0.1;if(wv>0&&wv<1.1){const tp=spineAt(fishPose(hero,t),0.98);const p=wv/1.1;ctx.strokeStyle=`rgba(255,255,255,${0.5*(1-p)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(tp.x,tp.y,4+34*(1-Math.pow(1-p,2)),0,7);ctx.stroke();}
}
function drawQingPanel(t,cam){const w=lerp(P,P*16/9,cam.e7),x0=PCX-w/2,y0=-300;
  panelShadow(x0,y0,w,P);ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,P);ctx.clip();
  const bg=ctx.createRadialGradient(PCX,-30,60,PCX,0,w*0.6);bg.addColorStop(0,'#33363d');bg.addColorStop(1,'#15161a');ctx.fillStyle=bg;ctx.fillRect(x0,y0,w,P);
  drawPlate(t,PCX,PCY,cam.z);ctx.restore();}

// ---------------- 越界：鱼衔着花瓣从绢上游出来 ----------------
const DRIPS=[];for(let ti=14.8;ti<21.8;ti+=0.32)DRIPS.push(ti);
function drawHeroOutside(t,cam,TR){
  ctx.save();ctx.globalCompositeOperation='multiply';const r=rng(5);
  for(const ti of DRIPS){if(ti>t)break;const d=t-ti;if(d>1.9)continue;const q=spineAt(fishPose(hero,ti),0.93);if(q.x<=0||q.x>=80)continue;const rr=0.9+r()*1.6;
    ctx.fillStyle=`rgba(36,27,20,${0.38*(1-d/1.9)})`;ctx.beginPath();ctx.arc(q.x+(r()-.5)*6,q.y+(r()-.5)*8+d*7,rr,0,7);ctx.fill();}
  ctx.restore();
  const fo=1-smooth(T_FREEZE-0.3,T_FREEZE,t);if(t<T_INSIDE||fo<=0)return;const p=fishPose(hero,t);const np=nibPetal(t);
  // 碰到什么就变成什么：还在墙上时是宋画里那条墨鱼（叼着花瓣），碰到青花盘的展台才变成青花的钴料线描
  const w7=lerp(P,P*16/9,cam.e7),qx0=PCX-w7/2,qx1=qx0+w7,qy0=-300,qy1=qy0+P;
  let mn=1e9,mx=-1e9,my0=1e9,my1=-1e9;for(const q of p.sp){mn=Math.min(mn,q.x);mx=Math.max(mx,q.x);my0=Math.min(my0,q.y);my1=Math.max(my1,q.y);}mn-=p.L*0.25;mx+=p.L*0.2;my0-=p.L*0.3;my1+=p.L*0.3;
  const touch=mn<qx1&&mx>qx0&&my1>qy0&&my0<qy1,whole=touch&&mn>=qx0&&mx<=qx1&&my0>=qy0&&my1<=qy1;
  if(!whole){inkLayer(TR,c=>{c.save();c.beginPath();c.rect(-6000,-3000,12000,6000);c.rect(qx0,qy0,w7,P);c.clip('evenodd');drawSong(c,p,cam.z);c.restore();});
    ctx.save();ctx.beginPath();ctx.rect(-6000,-3000,12000,6000);ctx.rect(qx0,qy0,w7,P);ctx.clip('evenodd');petal(ctx,np.x,np.y,np.rot,np.s,1,1);ctx.restore();}
  if(touch){ctx.save();ctx.globalAlpha=fo;ctx.beginPath();ctx.rect(qx0,qy0,w7,P);ctx.clip();drawYuan(ctx,p,RAW,1,1.5*cam.z);ctx.fillStyle='rgba(244,240,232,0.9)';ctx.save();ctx.translate(np.x,np.y);ctx.rotate(np.rot);petalPath(ctx,np.s);ctx.fill();ctx.restore();petalInk(ctx,np.x,np.y,np.rot,np.s,RAW,1,1.1);ctx.restore();}
  // 过界的地方溅几点墨和钴料
  if(touch&&!whole&&mn<qx1&&mx>qx1){let best=p.sp[0];for(const q of p.sp)if(Math.abs(q.x-qx1)<Math.abs(best.x-qx1))best=q;const k=clamp(1-Math.abs((p.sp[0].x+p.sp[p.N].x)/2-qx1)/(p.L*0.8));
    if(k>0){const r2=rng(Math.floor(t*30));ctx.save();ctx.globalCompositeOperation='multiply';
    for(let i=0;i<10;i++){const blue=i%2;ctx.fillStyle=blue?`rgba(40,60,120,${0.45*k})`:`rgba(40,30,22,${0.5*k})`;ctx.beginPath();ctx.arc(qx1+(r2()-.5)*12,best.y+(r2()-.5)*p.L*0.5,0.8+r2()*2.2,0,7);ctx.fill();}ctx.restore();}}}

// ---------------- 屏幕层 ----------------
const EMB=[];{const r=rng(7);for(let i=0;i<70;i++)EMB.push({x:r(),sp:50+r()*140,off:r()*1400,sz:1+r()*2.4,fl:r()*6,dr:(r()-.5)*40});}
const BUF=mk(W,H);const bctx=BUF.getContext('2d');
function blackbody(h){const st=[[0,[30,4,2]],[0.3,[130,22,6]],[0.55,[210,74,18]],[0.8,[248,148,56]],[1,[255,222,168]]];for(let i=0;i<st.length-1;i++){if(h<=st[i+1][0]){const p=(h-st[i][0])/(st[i+1][0]-st[i][0]);return mixA(st[i][1],st[i+1][1],p);}}return st[st.length-1][1];}
function kilnFX(t,cam){const dark=smooth(32.4,33.0,t)*(1-smooth(36.8,37.8,t));let heat=smooth(32.8,34.8,t)*(1-smooth(35.6,36.6,t));
  if(dark<=0.001&&heat<=0.001)return;heat*=0.94+0.06*Math.sin(t*23)*Math.sin(t*7.3);
  const sx=W/2+(PCX-cam.x)*cam.z,sy=H/2+(PCY-cam.y)*cam.z,sr=R*cam.z;const rev=smooth(36.8,38.2,t);
  ctx.save();
  if(rev<=0){ctx.fillStyle=`rgba(5,4,3,${0.94*dark})`;ctx.fillRect(0,0,W,H);}
  else{const lx=sx-0.5*sr,ly=sy-0.6*sr;const rr=lerp(10,2800,rev);const g=ctx.createRadialGradient(lx,ly,rr*0.3,lx,ly,rr);g.addColorStop(0,'rgba(5,4,3,0)');g.addColorStop(1,`rgba(5,4,3,${0.94*dark})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
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
