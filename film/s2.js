// ================= 贰 · 甲骨卜辞（商 · 龟腹甲，仿） =================
// 卜辞：“贞：王其鱼？”（王会去捕鱼吗？）——最后一个“鱼”字空着，主角游进去补上；灼龟，兆裂，它又跑了
const S2X=-670,S2Y=0,S2W=420;
const T2S=29.25,T2C=30.3,T2GO=30.95;
const SLOT2=[S2X+72,S2Y+9];

// ---------- 甲骨文笔画（单位方格 -0.5..0.5，纵向书写） ----------
const OBI={
  '卜':[[[0,-0.5],[0,0.5]],[[0,-0.06],[0.3,-0.26]]],
  '贞':[[[-0.32,-0.38],[0.32,-0.38],[0.32,0.16],[-0.32,0.16],[-0.32,-0.38]],[[-0.32,-0.12],[0.32,-0.12]],[[-0.2,0.16],[-0.3,0.48]],[[0.2,0.16],[0.3,0.48]],[[-0.18,-0.38],[-0.2,-0.52]],[[0.18,-0.38],[0.2,-0.52]]],
  '王':[[[-0.3,-0.44],[0.3,-0.44]],[[0,-0.44],[0,0.28]],[[-0.4,0.28],[-0.3,0.46],[0.3,0.46],[0.4,0.28],[-0.4,0.28]]],
  '其':[[[-0.3,-0.46],[-0.22,0.38],[0.22,0.38],[0.3,-0.46]],[[-0.27,-0.18],[0.2,0.32]],[[0.27,-0.18],[-0.2,0.32]],[[-0.25,0.06],[0.25,0.06]]],
  '雨':[[[-0.42,-0.46],[0.42,-0.46]],[[-0.26,-0.32],[-0.26,-0.18]],[[0,-0.34],[0,-0.2]],[[0.26,-0.32],[0.26,-0.18]],[[-0.26,-0.04],[-0.26,0.1]],[[0,-0.06],[0,0.08]],[[0.26,-0.04],[0.26,0.1]],[[-0.26,0.24],[-0.26,0.38]],[[0.26,0.24],[0.26,0.38]]],
  '不':[[[-0.36,-0.42],[0.36,-0.42]],[[0,-0.42],[0,0.46]],[[0,-0.26],[-0.3,0.3]],[[0,-0.26],[0.3,0.3]]],
  '日':[[[-0.3,-0.36],[0.3,-0.37],[0.33,0.3],[-0.3,0.33],[-0.3,-0.36]],[[-0.06,-0.01],[0.06,0.01]]],
  '月':[[[0.16,-0.48],[-0.24,-0.22],[-0.22,0.24],[0.2,0.46]],[[0.16,-0.48],[0.04,-0.1],[0.2,0.46]],[[-0.06,-0.06],[0.06,0.06]]],
  '亡':[[[-0.12,-0.46],[-0.12,0.4],[0.34,0.4]],[[-0.12,-0.46],[0.22,-0.32]]],
  '吉':[[[-0.3,-0.24],[0,-0.48],[0.3,-0.24]],[[0,-0.48],[0,-0.04]],[[-0.26,-0.04],[0.26,-0.04]],[[-0.22,0.12],[0.22,0.12],[0.22,0.44],[-0.22,0.44],[-0.22,0.12]]],
  '隹':[[[0.3,-0.45],[-0.1,-0.3],[-0.25,0.1],[0,0.45]],[[0.3,-0.45],[0.4,-0.38]],[[-0.1,-0.3],[0.24,-0.1],[0.24,0.22]],[[-0.2,-0.04],[0.24,-0.04]],[[-0.19,0.16],[0.24,0.16]],[[0,0.45],[0.06,0.55]]]};
// 甲骨文“鱼”：头尖、身上交叉的鳞、两对鳍、分叉的尾；沿脊线弯曲
const OBI_FISH=[[[0,0],[0.07,0.45],[0.2,0.95]],[[0,0],[0.07,-0.45],[0.2,-0.95]],
  [[0.2,0.95],[0.36,1.1],[0.55,0.98],[0.72,0.6],[0.8,0.3]],[[0.2,-0.95],[0.36,-1.1],[0.55,-0.98],[0.72,-0.6],[0.8,-0.3]],
  [[0.2,0.95],[0.25,0],[0.2,-0.95]],[[0.31,0.8],[0.63,-0.62]],[[0.31,-0.8],[0.63,0.62]],[[0.47,0.98],[0.71,-0.1]],[[0.47,-0.98],[0.71,0.1]],
  [[0.38,1.08],[0.47,1.62]],[[0.6,0.9],[0.68,1.42]],[[0.38,-1.08],[0.47,-1.62]],[[0.6,-0.9],[0.68,-1.42]],
  [[0.8,0.3],[1.0,1.0]],[[0.8,-0.3],[1.0,-1.0]],[[0.09,0.33],[0.115,0.33]]];
const LDIR2=[-0.6,0.8];// 刻槽里被照亮的一侧（光从右上来）
function incisePath(c,pathFn,w,cin,al=1){
  c.lineCap='round';c.lineJoin='round';
  pathFn();c.strokeStyle=`rgba(62,40,26,${0.92*al})`;c.lineWidth=w;c.stroke();
  if(cin>0){pathFn();c.strokeStyle=`rgba(176,50,32,${0.86*cin*al})`;c.lineWidth=w*0.52;c.stroke();}
  c.save();c.translate(LDIR2[0]*w*0.38,LDIR2[1]*w*0.38);pathFn();c.strokeStyle=`rgba(255,244,222,${0.42*al})`;c.lineWidth=w*0.3;c.stroke();c.restore();}
function glyphPathFn(c,strokes,x,y,s){return()=>{c.beginPath();for(const st of strokes){st.forEach((q,i)=>{const px=x+q[0]*s,py=y+q[1]*s;i?c.lineTo(px,py):c.moveTo(px,py);});}};}
function drawOBI(c,ch,x,y,s,w,cin,al){incisePath(c,glyphPathFn(c,OBI[ch],x,y,s),w,cin,al);}
function glyphFishPathFn(c,p,H){return()=>{c.beginPath();for(const st of OBI_FISH){const pts=st.map(q=>BP(p,q[0],q[1]*H));const n=24;
  for(let i=0;i<st.length-1;i++){for(let j=(i?1:0);j<=n;j++){const v=j/n;const q=BP(p,lerp(st[i][0],st[i+1][0],v),lerp(st[i][1],st[i+1][1],v)*H);(i||j)?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}}}};}
function drawGlyphFish(c,p,mode){const H=0.21*p.L,w=Math.max(1.6,0.042*p.L);
  if(mode==='incise'){incisePath(c,glyphFishPathFn(c,p,H),w,1,1);return;}
  // 朱书：毛笔写的红字
  c.save();for(const [k,st] of OBI_FISH.entries()){const pts=[];const n=Math.max(6,st.length*8);for(let i=0;i<n;i++){const f=i/(n-1)*(st.length-1);const a=Math.min(st.length-2,Math.floor(f)),v=f-a;pts.push(BP(p,lerp(st[a][0],st[a+1][0],v),lerp(st[a][1],st[a+1][1],v)*H));}
    if(st.length===2&&k===OBI_FISH.length-1){c.fillStyle='rgba(204,62,38,0.96)';c.beginPath();c.arc(pts[0][0],pts[0][1],w*0.6,0,7);c.fill();continue;}
    ribbon(c,pts,v=>w*1.15*(0.45+0.55*Math.sin(Math.PI*Math.min(1,v*1.15))),'rgba(204,62,38,0.96)',k+3);}c.restore();}

// ---------- 龟腹甲 ----------
const PL_OUT=(()=>{const pts=[[-70,-178],[-30,-185],[0,-176],[30,-185],[70,-178],[100,-160],[115,-130],[120,-95],[125,-60],[139,-40],[141,-10],[139,25],[125,45],[122,80],[118,115],[105,145],[80,168],[45,178],[15,171],[0,158],[-15,171],[-45,178],
  [-48,160],[-58,138],[-70,141],[-88,113],[-95,119],[-110,99],
  [-122,80],[-125,45],[-139,25],[-141,-10],[-139,-40],[-125,-60],[-120,-95],[-115,-130],[-100,-160]];
  const r=rng(201);const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const brk=i>=21&&i<=27;const n=brk?4:5;for(let j=0;j<n;j++){const v=j/n;out.push([lerp(a[0],b[0],v)+(brk?(r()-.5)*3.5:0),lerp(a[1],b[1],v)+(brk?(r()-.5)*3.5:0)]);}}return out;})();
const BREAK_PTS=PL_OUT.slice(21*5,28*5);
const MS2=3,PLW=Math.ceil(300*MS2),PLH=Math.ceil(392*MS2);
function plPath(c,ox=0,oy=0){c.beginPath();PL_OUT.forEach((q,i)=>i?c.lineTo(q[0]+ox,q[1]+oy):c.moveTo(q[0]+ox,q[1]+oy));c.closePath();}
function jag(pts,amp,seed){const r=rng(seed);const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let j=0;j<n;j++){const v=j/n;out.push([lerp(a[0],b[0],v)+(r()-.5)*amp,lerp(a[1],b[1],v)+(r()-.5)*amp]);}}out.push(pts[pts.length-1]);return out;}
const CRK_OLD=[[[-36,-160],[-34,-118],[-37,-70]],[[-36,-122],[-62,-136]],[[38,-168],[36,-128],[39,-96]],[[37,-140],[60,-152]],[[-40,48],[-38,90],[-41,128]],[[-39,84],[-66,74]],[[42,100],[40,130],[43,150]],[[41,118],[66,108]]].map((s,i)=>jag(s,1.6,300+i));
const CRK_NEW_STEM=jag([[40,12],[39,-12],[41,-38]],2.0,333),CRK_NEW_STEM2=jag([[40,12],[41,50],[39,92]],2.0,334),CRK_NEW_BR=jag([[40,12],[14,9],[-14,10],[-34,6]],1.8,335);
const INSCR=[['贞',72,-128],['王',72,-72],['其',72,-16],['不',-72,-128],['其',-72,-72],['雨',-72,-16],['日',-108,-60],['吉',106,104],['亡',-72,108],['隹',-104,44],['月',104,40]];
let PL2=null;
function prepPlastron(){const c=mk(PLW,PLH);const x=c.getContext('2d');const T=(cx)=>cx.setTransform(MS2,0,0,MS2,PLW/2,PLH/2);
  // 软边遮罩：算出离边缘的远近
  const m=mk(PLW,PLH);const mx=m.getContext('2d');T(mx);mx.fillStyle='#fff';plPath(mx);mx.fill();
  const mb=mk(PLW,PLH);const mbx=mb.getContext('2d');mbx.filter=`blur(${10*MS2}px)`;mbx.drawImage(m,0,0);
  const md=mb.getContext('2d').getImageData(0,0,PLW,PLH).data,mm=mx.getImageData(0,0,PLW,PLH).data;
  const img=x.createImageData(PLW,PLH);const d=img.data;const n1=noise2(211,7,9),n2=noise2(212,40,50),n3=noise2(213,160,200),n4=noise2(214,4,5);const r=rng(215);
  for(let py=0;py<PLH;py++)for(let px=0;px<PLW;px++){const i=(py*PLW+px)*4;if(mm[i+3]<2)continue;const u=px/PLW,v=py/PLH;const inner=md[i]/255;
    let lum=1+(n1(u*7,v*9)-0.5)*0.12+(n2(u*40,v*50)-0.5)*0.07+(n3(u*160,v*200)-0.5)*0.06+(r()-.5)*0.05;
    const pat=clamp((n4(u*4,v*5)-0.45)*2.2);const edge=clamp(1-inner*1.25);
    let R=lerp(222,186,pat*0.7),G=lerp(205,158,pat*0.7),B=lerp(166,112,pat*0.75);
    lum*=1-0.28*edge;R=lerp(R,150,edge*0.4);G=lerp(G,118,edge*0.45);B=lerp(B,80,edge*0.5);
    if(r()<0.002)lum*=0.7;
    d[i]=clamp(R*lum,0,255);d[i+1]=clamp(G*lum,0,255);d[i+2]=clamp(B*lum,0,255);d[i+3]=mm[i+3];}
  x.putImageData(img,0,0);T(x);
  // 断口：新鲜的骨茬颜色浅、多孔
  x.save();plPath(x);x.clip();x.lineCap='round';x.lineJoin='round';
  x.beginPath();BREAK_PTS.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.strokeStyle='rgba(236,226,200,0.85)';x.lineWidth=6;x.stroke();
  for(let k=0;k<160;k++){const q=BREAK_PTS[Math.floor(r()*BREAK_PTS.length)];x.fillStyle=`rgba(120,96,64,${0.2+r()*0.3})`;x.beginPath();x.arc(q[0]+(r()-.5)*7,q[1]+(r()-.5)*7,0.3+r()*0.7,0,7);x.fill();}
  // 盾沟（浅槽）与骨缝（细锯齿）
  const groove=(pts,w,al)=>{incisePath(x,()=>{x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));},w,0,al);};
  groove(jag([[0,-176],[1,-100],[-1,0],[1,90],[0,158]],1.2,221),1.5,0.55);
  for(const [y0,bow,sd] of [[-120,6,222],[-55,-5,223],[10,4,224],[85,-6,225],[140,5,226]]){const pts=[];for(let i=0;i<=16;i++){const v=i/16;const xx=lerp(-150,150,v);pts.push([xx,y0+bow*Math.sin(Math.PI*v)+(v>0.5?3:0)]);}groove(jag(pts,1.0,sd),1.3,0.5);}
  x.strokeStyle='rgba(90,64,40,0.45)';x.lineWidth=0.55;
  for(const [y0,sd] of [[-92,231],[-22,232],[48,233],[116,234]]){const r3=rng(sd);x.beginPath();for(let i=0;i<=60;i++){const xx=lerp(-150,150,i/60);const yy=y0+(i%2?2.2:-2.2)+(r3()-.5)*1.4;i?x.lineTo(xx,yy):x.moveTo(xx,yy);}x.stroke();}
  {const r3=rng(235);x.beginPath();for(let i=0;i<=80;i++){const yy=lerp(-176,158,i/80);const xx=4+(i%2?1.8:-1.8)+(r3()-.5)*1.2;i?x.lineTo(xx,yy):x.moveTo(xx,yy);}x.stroke();}
  // 旧的兆：焦痕 + 裂纹
  for(const s of CRK_OLD.filter((_,i)=>i%2===0)){const o=s[Math.floor(s.length*0.4)];const g=x.createRadialGradient(o[0],o[1],0,o[0],o[1],13);g.addColorStop(0,'rgba(92,56,26,0.42)');g.addColorStop(1,'rgba(92,56,26,0)');x.fillStyle=g;x.fillRect(o[0]-14,o[1]-14,28,28);}
  for(const s of CRK_OLD){x.beginPath();s.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.strokeStyle='rgba(48,30,18,0.85)';x.lineWidth=0.9;x.stroke();
    x.save();x.translate(-0.5,0.6);x.strokeStyle='rgba(255,246,226,0.35)';x.lineWidth=0.5;x.stroke();x.restore();}
  // 刻辞（部分涂朱，朱色有剥落）
  for(const [ch,cx0,cy0] of INSCR){const sz=ch==='日'||ch==='月'||ch==='吉'||ch==='亡'||ch==='隹'?38:52;drawOBI(x,ch,cx0,cy0,sz,2.3,0.55+r()*0.45,1);}
  x.restore();
  // 圆润的体积感：中间亮、边缘暗；右上一抹柔光
  x.save();plPath(x);x.clip();
  let g=x.createRadialGradient(20,-30,40,0,0,210);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(120,96,70,0.45)');x.globalCompositeOperation='multiply';x.fillStyle=g;x.fillRect(-160,-200,320,400);
  x.globalCompositeOperation='screen';g=x.createRadialGradient(60,-90,10,60,-90,140);g.addColorStop(0,'rgba(255,248,230,0.32)');g.addColorStop(1,'rgba(255,248,230,0)');x.fillStyle=g;x.fillRect(-160,-200,320,400);
  x.restore();
  // 甲的厚度：右上边缘受光，左下边缘背光
  x.save();x.globalCompositeOperation='source-atop';x.lineWidth=2.2;plPath(x);x.strokeStyle='rgba(70,48,28,0.5)';x.stroke();plPath(x,-0.9,0.9);x.lineWidth=1.0;x.strokeStyle='rgba(255,246,222,0.35)';x.stroke();x.restore();
  PL2=c;}
const PLSMALL=mk(4,4);
function drawS2Panel(t,cam,TR){const x0=S2X-S2W/2,y0=S2Y-S2W/2;panelShadow(x0,y0,S2W,S2W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S2W,S2W);ctx.clip();
  ctx.drawImage(LINEN,0,0,840,840,x0,y0,S2W,S2W);ctx.fillStyle='rgba(86,74,62,0.78)';ctx.globalCompositeOperation='multiply';ctx.fillRect(x0,y0,S2W,S2W);ctx.globalCompositeOperation='source-over';
  // 甲在衬板上的影子
  ctx.save();ctx.filter=`blur(${(9*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(20,14,10,0.55)';plPath(ctx,S2X-7,S2Y-5+11);ctx.fill();ctx.restore();
  ctx.drawImage(PL2,S2X-PLW/2/MS2,S2Y-5-PLH/2/MS2,PLW/MS2,PLH/MS2);
  // 灼：背面钻凿里加热，正面慢慢焦黄、透出一点火光
  ctx.save();ctx.translate(S2X,S2Y-5);
  const sc=smooth(29.45,30.25,t);if(sc>0){const o=[40,12];let g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],20*sc+2);g.addColorStop(0,`rgba(80,42,16,${0.7*sc})`);g.addColorStop(1,'rgba(92,52,22,0)');ctx.fillStyle=g;ctx.fillRect(o[0]-20,o[1]-20,40,40);
    const glow=smooth(29.6,30.2,t)*(1-smooth(30.35,31.4,t))*(0.82+0.18*Math.sin(t*31));if(glow>0){ctx.globalCompositeOperation='lighter';g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],30);g.addColorStop(0,`rgba(255,150,60,${0.8*glow})`);g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.fillRect(o[0]-24,o[1]-24,48,48);ctx.globalCompositeOperation='source-over';}}
  // 兆：先纵裂，再横出一枝，指向左边
  const hot=1-smooth(T2C+0.05,T2C+0.9,t);const crack=(pts,p)=>{if(p<=0)return null;const n=Math.max(2,Math.ceil(pts.length*p));const sub=pts.slice(0,n);ctx.beginPath();sub.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.lineJoin='round';ctx.strokeStyle='rgba(34,20,10,0.95)';ctx.lineWidth=1.9;ctx.stroke();
    if(hot>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(255,150,60,${0.9*hot})`;ctx.lineWidth=0.8;ctx.stroke();ctx.restore();}
    ctx.save();ctx.translate(-0.7,0.8);ctx.strokeStyle='rgba(255,246,226,0.45)';ctx.lineWidth=0.6;ctx.stroke();ctx.restore();return sub[sub.length-1];};
  const ps=smooth(T2C,T2C+0.12,t),pb=smooth(T2C+0.16,T2C+0.3,t);
  {const f=1-smooth(T2C,T2C+0.25,t);if(f>0&&t>=T2C){ctx.save();ctx.globalCompositeOperation='lighter';const g3=ctx.createRadialGradient(40,12,0,40,12,26);g3.addColorStop(0,`rgba(255,240,210,${0.9*f})`);g3.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g3;ctx.fillRect(14,-14,52,52);ctx.restore();}}const tips=[crack(CRK_NEW_STEM,ps),crack(CRK_NEW_STEM2,ps),crack(CRK_NEW_BR,pb)];
  const r=rng(Math.floor(t*30));for(const [tp,t0] of [[tips[0],T2C],[tips[1],T2C],[tips[2],T2C+0.17]]){if(!tp)continue;const d=t-t0;if(d>0.45)continue;for(let i=0;i<5;i++){ctx.fillStyle=`rgba(250,240,215,${0.8*(1-d/0.45)})`;ctx.beginPath();ctx.arc(tp[0]+(r()-.5)*10*(0.3+d*3),tp[1]+(r()-.5)*10*(0.3+d*3)-d*8,0.5+r()*0.8,0,7);ctx.fill();}}
  // 烟
  const sm=smooth(29.9,30.3,t)*(1-smooth(31.2,32.4,t));if(sm>0){for(let i=0;i<7;i++){const ph=t*0.9+i*0.37;const k=(ph%1);const yy=12-k*70,xx=40+8*Math.sin(k*6+i)+k*10;ctx.fillStyle=`rgba(200,196,188,${0.12*sm*(1-k)})`;ctx.beginPath();ctx.ellipse(xx,yy,4+k*14,3+k*9,k*2,0,7);ctx.fill();}}
  ctx.restore();ctx.restore();
  ctx.strokeStyle='rgba(70,60,45,0.35)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S2W,S2W);}
// 甲骨画风：在甲上是刻的（涂朱），甲外是毛笔朱书
function plHole(c){c.beginPath();c.rect(-40000,-4000,80000,8000);PL_OUT.forEach((q,i)=>i?c.lineTo(q[0]+S2X,q[1]+S2Y-5):c.moveTo(q[0]+S2X,q[1]+S2Y-5));c.closePath();}
function styleOBI(t,cam,TR,p,clip){
  const near=Math.abs(spineAt(p,0.5).x-S2X)<S2W/2+p.L;
  // 骨头外面：来的时候还是彩陶上那条鱼，走的时候是一个活过来的朱砂字
  if(t<T2S+0.3){ctx.save();if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}plHole(ctx);ctx.clip('evenodd');styleBanpo(t,cam,TR,p,null);ctx.restore();}
  else{layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}plHole(hctx);hctx.clip('evenodd');drawGlyphFish(hctx,p,'brush');layerGrain(hctx,TR,0.1);blitLayer(HEROC,1);}
  // 骨头上：刻出来的字
  if(near){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}plPath(hctx,S2X,S2Y-5);hctx.clip();drawGlyphFish(hctx,p,'incise');layerGrain(hctx,TR,0.12);blitLayer(HEROC,1);}}

// ---------------- 贰 的登记 ----------------
STN.push({key:'s2',cx:S2X,hw:S2W/2,x0:-960,x1:-380,draw:drawS2Panel,style:styleOBI,prep:prepPlastron});
LABELS.push([S2X,S2W,S2W,'贰','甲骨卜辞','商 · 龟腹甲']);
LIGHTS.push({x:S2X,y:-10,r:600,k:t=>smooth(25.0,27.2,t)});
GK.push([25.5,-478,34],[26.3,-540,40],[27.0,-590,70],[27.6,-622,112],[28.15,-612,146],[28.6,-600,112],[28.95,-598,48],[29.1,-598,26],[T2S,SLOT2[0],15],[29.42,SLOT2[0],10.5],[29.62,SLOT2[0],9.2],[29.9,SLOT2[0],8.7],[30.4,SLOT2[0],8.3],[30.7,SLOT2[0],8.0],[T2GO,SLOT2[0],7.6],
  [31.05,-603,-1],[31.15,-618,-7],[31.28,-645,-6],[31.45,-690,1],[31.65,-750,8],[31.92,-820,12],[32.3,-890,12],[32.85,-960,10]);
HL.push([24.6,140],[26.6,100],[27.6,78],[28.6,64],[T2GO,64],[32.2,96],[33.6,124]);
HAMP.push(t=>(t<28?1:1-smooth(28.9,29.3,t)*(1-smooth(T2GO-0.05,T2GO+0.05,t)))*(1+0.35*smooth(T2GO-0.02,T2GO+0.1,t)*(1-smooth(T2GO+0.6,T2GO+1.4,t))));
HFB.push(t=>3.4*smooth(T2GO-0.05,T2GO+0.1,t)*(1-smooth(T2GO+0.5,T2GO+1.0,t)));
SHAKES.push([T2C,5]);
CK.push({t:26.4,x:S2X+40,y:6,z:1.3,f:0.5,ox:-60,oy:0},{t:27.8,x:S2X+10,y:S2Y+6,z:1.95},{t:30.55,x:S2X+14,y:S2Y+8,z:2.05},{t:31.0,x:S2X+8,y:S2Y+8,z:2.1},
  {t:32.0,x:S2X-60,y:8,z:1.4,f:0.5,ox:-90},{t:33.4,z:1.15,f:1,ox:-160,oy:-10});
