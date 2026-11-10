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
  '隹':[[[0.3,-0.45],[-0.1,-0.3],[-0.25,0.1],[0,0.45]],[[0.3,-0.45],[0.4,-0.38]],[[-0.1,-0.3],[0.24,-0.1],[0.24,0.22]],[[-0.2,-0.04],[0.24,-0.04]],[[-0.19,0.16],[0.24,0.16]],[[0,0.45],[0.06,0.55]]],
  '占':[[[0,-0.5],[0,-0.1]],[[0,-0.32],[0.27,-0.44]],[[-0.3,-0.06],[0.3,-0.06],[0.3,0.44],[-0.3,0.44],[-0.3,-0.06]]],
  '曰':[[[-0.32,-0.18],[-0.3,0.38],[0.3,0.38],[0.32,-0.18]],[[-0.14,-0.36],[0.18,-0.3]]],
  '今':[[[-0.42,0.02],[0,-0.46],[0.42,0.02]],[[-0.16,0.22],[0.16,0.22]]],
  '夕':[[[0.18,-0.46],[-0.2,-0.22],[-0.24,0.22],[0.16,0.46]],[[0.18,-0.46],[0.02,-0.02],[0.16,0.46]]]};
// 甲骨文“鱼”：头尖、身上交叉的鳞、两对鳍、分叉的尾；沿脊线弯曲
const OBI_FISH=[[[0,0],[0.07,0.45],[0.2,0.95]],[[0,0],[0.07,-0.45],[0.2,-0.95]],
  [[0.2,0.95],[0.36,1.1],[0.55,0.98],[0.72,0.6],[0.8,0.3]],[[0.2,-0.95],[0.36,-1.1],[0.55,-0.98],[0.72,-0.6],[0.8,-0.3]],
  [[0.2,0.95],[0.25,0],[0.2,-0.95]],[[0.31,0.8],[0.63,-0.62]],[[0.31,-0.8],[0.63,0.62]],[[0.47,0.98],[0.71,-0.1]],[[0.47,-0.98],[0.71,0.1]],
  [[0.38,1.08],[0.47,1.62]],[[0.6,0.9],[0.68,1.42]],[[0.38,-1.08],[0.47,-1.62]],[[0.6,-0.9],[0.68,-1.42]],
  [[0.8,0.3],[1.0,1.0]],[[0.8,-0.3],[1.0,-1.0]],[[0.09,0.33],[0.115,0.33]]];
const LDIR2=[-0.6,0.8];// 刻槽里背光的那一侧槽壁朝这个方向（光从右上来）
// ---------- 刀刻：一刀一刀，两头尖、中段宽（入刀、出刀）；槽底暗，朱砂比槽窄、一刀一刀深浅不一，背光的槽壁亮一线 ----------
function knifePoly(pts,w,ti,to){const n=pts.length;const S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const Ls=S[n-1]||1;const Lp=[],Rp=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const v=S[i]/Ls;
    const f=Math.min(1,v/ti,(1-v)/to);const hw=w/2*Math.max(0.1,Math.pow(Math.max(0,f),0.55));Lp.push([pts[i][0]-dy*hw,pts[i][1]+dx*hw]);Rp.push([pts[i][0]+dy*hw,pts[i][1]-dx*hw]);}
  return Lp.concat(Rp.reverse());}
function fillPoly(c,P){c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();}
function resample(k,step){const out=[k[0]];for(let i=1;i<k.length;i++){const a=k[i-1],b=k[i];const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let j=1;j<=n;j++)out.push([lerp(a[0],b[0],j/n),lerp(a[1],b[1],j/n)]);}return out;}
// 折线在拐角处断开（刻字是一刀一刀刻的），再细分，好让每一刀两头收尖
function toCuts(polys,step=1.2){const cuts=[];for(const P of polys){let cur=[P[0]];for(let i=1;i<P.length;i++){cur.push(P[i]);if(i<P.length-1){const a=P[i-1],b=P[i],c2=P[i+1];let d=Math.atan2(c2[1]-b[1],c2[0]-b[0])-Math.atan2(b[1]-a[1],b[0]-a[0]);d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>0.7){cuts.push(cur);cur=[P[i]];}}}cuts.push(cur);}
  return cuts.map(k=>resample(k,step));}
function inciseCuts(c,cuts,w,cin,al,seed){const r=rng(seed);
  c.fillStyle=`rgba(72,46,28,${(0.84*al).toFixed(3)})`;for(const k of cuts)fillPoly(c,knifePoly(k,w,0.18,0.28));
  if(cin>0)for(const k of cuts){const a=cin*al*(0.3+0.7*r());c.fillStyle=`rgba(168,44,30,${(0.85*a).toFixed(3)})`;fillPoly(c,knifePoly(k,w*0.58,0.3,0.4));}
  c.save();c.translate(LDIR2[0]*w*0.32,LDIR2[1]*w*0.32);c.fillStyle=`rgba(255,240,212,${(0.34*al).toFixed(3)})`;for(const k of cuts)fillPoly(c,knifePoly(k,w*0.28,0.3,0.45));c.restore();}
function drawOBI(c,ch,x,y,s,w,cin,al,seed=7){const r=rng(seed*7+3);const cuts=toCuts(OBI[ch].map(st=>st.map(q=>[x+q[0]*s+(r()-.5)*s*0.03,y+q[1]*s+(r()-.5)*s*0.03])));
  let a=0;for(const k of cuts)for(let i=1;i<k.length-1;i++){a=a*0.7+(r()-.5)*0.18;k[i]=[k[i][0]+a,k[i][1]+a*0.6];}inciseCuts(c,cuts,w,cin,al,seed);}
function glyphFishCuts(p,H){const polys=OBI_FISH.slice(0,-1).map(st=>{const out=[];const n=10;for(let i=0;i<st.length-1;i++)for(let j=(i?1:0);j<=n;j++){const v=j/n;out.push(BP(p,lerp(st[i][0],st[i+1][0],v),lerp(st[i][1],st[i+1][1],v)*H));}return out;});return toCuts(polys,1.0);}
function drawGlyphFish(c,p,mode){const H=0.21*p.L,w=Math.max(1.6,0.042*p.L);
  if(mode==='incise'){inciseCuts(c,glyphFishCuts(p,H),w,1,1,11);const e=OBI_FISH[OBI_FISH.length-1][0],q=BP(p,e[0],e[1]*H);
    c.fillStyle='rgba(72,46,28,0.84)';c.beginPath();c.arc(q[0],q[1],w*0.55,0,7);c.fill();c.fillStyle='rgba(168,44,30,0.8)';c.beginPath();c.arc(q[0],q[1],w*0.32,0,7);c.fill();return;}
  // 朱书：毛笔写的红字
  c.save();for(const [k,st] of OBI_FISH.entries()){const pts=[];const n=Math.max(6,st.length*8);for(let i=0;i<n;i++){const f=i/(n-1)*(st.length-1);const a=Math.min(st.length-2,Math.floor(f)),v=f-a;pts.push(BP(p,lerp(st[a][0],st[a+1][0],v),lerp(st[a][1],st[a+1][1],v)*H));}
    if(st.length===2&&k===OBI_FISH.length-1){c.fillStyle='rgba(204,62,38,0.96)';c.beginPath();c.arc(pts[0][0],pts[0][1],w*0.6,0,7);c.fill();continue;}
    ribbon(c,pts,v=>w*1.15*(0.45+0.55*Math.sin(Math.PI*Math.min(1,v*1.15))),'rgba(204,62,38,0.96)',k+3);}c.restore();}

// ---------- 龟腹甲：前叶圆、中线处微凹；两侧甲桥外凸；后叶收窄，下端有肛缺；边上有细小的起伏和崩口，左下角断了一块 ----------
const PLO=(()=>{const R=[[0,-171],[20,-183],[52,-180],[84,-167],[104,-144],[113,-114],[116,-86],[126,-70],[141,-50],[147,-16],[146,20],[138,50],[123,68],[116,86],[114,108],[104,134],[84,158],[56,173],[30,178],[15,167],[0,152]];
  const ctrl=R.concat(R.slice(1,-1).map(([x,y])=>[-x,y]).reverse());const n=ctrl.length;const sm=[];
  for(let i=0;i<n;i++){const p0=ctrl[(i-1+n)%n],p1=ctrl[i],p2=ctrl[(i+1)%n],p3=ctrl[(i+2)%n];for(let j=0;j<8;j++){const t=j/8,t2=t*t,t3=t2*t;const cr=k=>0.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);sm.push([cr(0)+(p1[0]===0&&j===0?0:0),cr(1)]);}}
  const N=sm.length,r=rng(201),disp=new Float32Array(N);let a=0;for(let i=0;i<N;i++){a=a*0.86+(r()-.5)*0.6;disp[i]=a;}
  for(const [f,depth,wd] of [[0.06,2.6,5],[0.19,2.0,4],[0.31,3.4,6],[0.43,1.8,4],[0.64,2.6,5],[0.92,3.0,6]]){const ci=Math.floor(N*f);for(let k=-wd;k<=wd;k++){const i=(ci+k+N)%N;disp[i]-=depth*Math.pow(1-Math.abs(k)/wd,0.6)*(0.75+0.5*r());}}
  const out=[];for(let i=0;i<N;i++){const A=sm[(i-1+N)%N],B=sm[(i+1)%N];let nx=B[1]-A[1],ny=-(B[0]-A[0]);const l=Math.hypot(nx,ny)||1;out.push([sm[i][0]+nx/l*disp[i],sm[i][1]+ny/l*disp[i]]);}
  const near=(x,y)=>{let bi=0,bd=1e9;out.forEach((q,i)=>{const d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;bi=i;}});return bi;};
  const iB=near(-40,176),iA=near(-113,104);const brk=jag([out[iB],[-58,154],[-70,140],[-84,128],[-98,119],out[iA]],3.0,207);
  return{pts:out.slice(0,iB).concat(brk,out.slice(iA+1)),brk};})();
const PL_OUT=PLO.pts,BREAK_PTS=PLO.brk;
const MS2=3,PLW=Math.ceil(300*MS2),PLH=Math.ceil(392*MS2);
function plPath(c,ox=0,oy=0){c.beginPath();PL_OUT.forEach((q,i)=>i?c.lineTo(q[0]+ox,q[1]+oy):c.moveTo(q[0]+ox,q[1]+oy));c.closePath();}
function jag(pts,amp,seed){const r=rng(seed);const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let j=0;j<n;j++){const v=j/n;out.push([lerp(a[0],b[0],v)+(r()-.5)*amp,lerp(a[1],b[1],v)+(r()-.5)*amp]);}}out.push(pts[pts.length-1]);return out;}
// 旧的兆：一道纵裂（凿的位置）+ 一枝横裂（钻的位置，朝中线）
const CRK_OLD=[[[-38,-162],[-36,-122],[-39,-84]],[[-37,-130],[-16,-140]],[[40,-164],[38,-126],[41,-92]],[[39,-136],[18,-146]],[[-40,40],[-38,82],[-41,122]],[[-39,74],[-18,66]],[[36,100],[34,128],[37,150]],[[35,114],[14,106]]].map((s,i)=>jag(s,1.4,300+i));
const CRK_NEW_STEM=jag([[40,12],[39,-12],[41,-38]],2.0,333),CRK_NEW_STEM2=jag([[40,12],[41,50],[39,92]],2.0,334),CRK_NEW_BR=jag([[40,12],[14,9],[-14,10],[-34,6]],1.8,335);
// 刻辞：右边“贞：王其[鱼]”，左边对贞“不其雨”；右边甲桥上占辞“王占曰：吉”，左下“今夕亡”（右下留给主角游上来的路）
const INSCR=[['贞',72,-116,44],['王',72,-68,44],['其',72,-21,44],['不',-72,-116,44],['其',-72,-68,44],['雨',-72,-21,44],
  ['王',118,-46,24],['占',118,-20,24],['曰',118,6,24],['吉',118,32,24],['今',-98,22,24],['夕',-98,48,24],['亡',-98,74,24]];
let PL2=null;
function prepPlastron(){const c=mk(PLW,PLH);const x=c.getContext('2d');const T=(cx)=>cx.setTransform(MS2,0,0,MS2,PLW/2,PLH/2);
  // 软边遮罩：离边缘的远近
  const m=mk(PLW,PLH);const mx=m.getContext('2d');T(mx);mx.fillStyle='#fff';plPath(mx);mx.fill();
  const mb=mk(PLW,PLH);const mbx=mb.getContext('2d');mbx.filter=`blur(${9*MS2}px)`;mbx.drawImage(m,0,0);
  const md=mb.getContext('2d').getImageData(0,0,PLW,PLH).data,mm=mx.getImageData(0,0,PLW,PLH).data;
  // 骨色：象牙白到黄褐，有大块的土沁、中等的斑驳、顺着长的细骨纹、毛孔
  const img=x.createImageData(PLW,PLH);const d=img.data;const n1=noise2(211,5,6),n2=noise2(212,26,30),n3=noise2(213,150,180),n4=noise2(214,3,4),n5=noise2(216,10,120),n6=noise2(217,14,16);const r=rng(215);
  for(let py=0;py<PLH;py++)for(let px=0;px<PLW;px++){const i=(py*PLW+px)*4;if(mm[i+3]<2)continue;const u=px/PLW,v=py/PLH;const inner=md[i]/255;
    const wu=(n1(u*5,v*6)-0.5)*0.9,wv=(n2(u*26,v*30)-0.5)*0.5;const stain=clamp((n4(u*3+wu,v*4+wu)-0.42)*1.5),blot=clamp((n6(u*14+wu*6+wv*3,v*16-wu*5+wv*3)-0.64)*2.0);
    let R=lerp(230,178,stain*0.75),G=lerp(212,146,stain*0.8),B=lerp(174,98,stain*0.9);R=lerp(R,150,blot*0.5);G=lerp(G,112,blot*0.55);B=lerp(B,70,blot*0.6);
    let lum=1+(n1(u*5,v*6)-0.5)*0.1+(n2(u*26,v*30)-0.5)*0.09+(n5(u*10,v*120)-0.5)*0.06+(n3(u*150,v*180)-0.5)*0.05+(r()-.5)*0.04;
    const edge=clamp(1-inner*1.3);lum*=1-0.24*edge;R=lerp(R,150,edge*0.35);G=lerp(G,116,edge*0.4);B=lerp(B,78,edge*0.45);
    if(r()<0.004)lum*=0.72+0.18*r();
    d[i]=clamp(R*lum,0,255);d[i+1]=clamp(G*lum,0,255);d[i+2]=clamp(B*lum,0,255);d[i+3]=mm[i+3];}
  x.putImageData(img,0,0);T(x);
  x.save();plPath(x);x.clip();x.lineCap='round';x.lineJoin='round';
  // 断口：新鲜的骨茬颜色浅、多孔
  x.beginPath();BREAK_PTS.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.strokeStyle='rgba(238,228,204,0.8)';x.lineWidth=5;x.stroke();
  for(let k=0;k<180;k++){const q=BREAK_PTS[Math.floor(r()*BREAK_PTS.length)];x.fillStyle=`rgba(120,96,64,${0.2+r()*0.3})`;x.beginPath();x.arc(q[0]+(r()-.5)*7,q[1]+(r()-.5)*7,0.3+r()*0.7,0,7);x.fill();}
  // 盾沟：软软的浅槽（一道暗、旁边一线亮），左右不完全对称
  const sulcus=(pts,w,al)=>{const P=resample(pts,2);x.save();x.beginPath();P.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.filter=`blur(${(1.1*MS2).toFixed(1)}px)`;x.strokeStyle=`rgba(92,62,38,${al})`;x.lineWidth=w;x.stroke();
    x.filter=`blur(${(0.5*MS2).toFixed(1)}px)`;x.translate(-0.8,1.0);x.strokeStyle=`rgba(255,246,226,${(al*0.32).toFixed(3)})`;x.lineWidth=w*0.4;x.stroke();x.restore();};
  const wob=(pts,a,sd)=>{const r3=rng(sd);return resample(pts,6).map(q=>[q[0]+(r3()-.5)*a,q[1]+(r3()-.5)*a]);};
  sulcus(wob([[0,-171],[1,-120],[-1,-60],[1,0],[-1,70],[0,152]],1.2,221),1.6,0.5);
  for(const [sd,yl,yr,pts] of [[222,-140,-137,[[0,0],[40,-8],[70,-16],[98,-22]]],[223,-79,-74,[[0,0],[50,-2],[90,-10],[120,-20]]],[224,-6,-3,[[0,0],[60,2],[110,-1],[147,-6]]],[225,73,77,[[0,0],[50,4],[90,12],[118,24]]],[226,128,131,[[0,0],[34,6],[64,14],[92,22]]]]){
    sulcus(wob(pts.map(q=>[q[0],q[1]+yr]),1.0,sd),1.4,0.42);sulcus(wob(pts.map(q=>[-q[0],q[1]+yl]),1.0,sd+50),1.4,0.42);}
  // 骨缝：细、浅、不规则（和盾沟不在一处）；上面一块菱形的内腹甲
  const suture=(pts,sd)=>{const r3=rng(sd);const P=resample(pts,1.8);x.beginPath();P.forEach((q,i)=>{const yy=q[1]+(i%2?0.7:-0.7)*(0.3+r3()),xx=q[0]+(r3()-.5)*0.9;i?x.lineTo(xx,yy):x.moveTo(xx,yy);});x.strokeStyle='rgba(92,64,40,0.17)';x.lineWidth=0.45;x.stroke();};
  suture([[0,-142],[24,-114],[0,-84],[-24,-114],[0,-142]],231);
  // 旧的兆：背面凿过的地方正面颜色深一点；钻过、灼过的地方一团焦痕；然后是裂纹
  for(let k=0;k<CRK_OLD.length;k+=2){const st=CRK_OLD[k],br=CRK_OLD[k+1];const a0=st[0],a1=st[st.length-1];const cx=(a0[0]+a1[0])/2,cy=(a0[1]+a1[1])/2;
    x.save();x.translate(cx,cy);x.rotate(Math.atan2(a1[1]-a0[1],a1[0]-a0[0]));const g=x.createRadialGradient(0,0,2,0,0,30);g.addColorStop(0,'rgba(120,86,54,0.16)');g.addColorStop(1,'rgba(120,86,54,0)');x.scale(1,0.32);x.fillStyle=g;x.beginPath();x.arc(0,0,30,0,7);x.fill();x.restore();
    const o=br[0];for(let j=0;j<4;j++){const ox=o[0]+(br[br.length-1][0]-o[0])*0.25+(r()-.5)*5,oy=o[1]+(r()-.5)*5,rr=6+r()*6;const g2=x.createRadialGradient(ox,oy,0,ox,oy,rr);g2.addColorStop(0,'rgba(64,36,16,0.34)');g2.addColorStop(0.6,'rgba(88,52,24,0.16)');g2.addColorStop(1,'rgba(92,56,26,0)');x.fillStyle=g2;x.fillRect(ox-rr,oy-rr,2*rr,2*rr);}}
  for(const s of CRK_OLD){x.beginPath();s.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.strokeStyle='rgba(44,26,14,0.85)';x.lineWidth=0.75;x.stroke();
    x.save();x.translate(-0.5,0.6);x.strokeStyle='rgba(255,246,226,0.32)';x.lineWidth=0.45;x.stroke();x.restore();}
  // 刻辞
  INSCR.forEach(([ch,cx0,cy0,sz],k)=>drawOBI(x,ch,cx0,cy0,sz,sz*0.056,0.45+r()*0.5,1,40+k));
  x.restore();
  // 体积：中间亮、边缘暗；右上一抹柔光，像被手摸得发亮的包浆
  x.save();plPath(x);x.clip();
  let g=x.createRadialGradient(20,-30,40,0,0,215);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(110,86,60,0.42)');x.globalCompositeOperation='multiply';x.fillStyle=g;x.fillRect(-160,-200,320,400);
  x.globalCompositeOperation='screen';g=x.createRadialGradient(64,-96,6,64,-96,130);g.addColorStop(0,'rgba(255,248,230,0.3)');g.addColorStop(1,'rgba(255,248,230,0)');x.fillStyle=g;x.fillRect(-160,-200,320,400);
  g=x.createRadialGradient(-50,90,4,-50,90,70);g.addColorStop(0,'rgba(255,246,226,0.1)');g.addColorStop(1,'rgba(255,246,226,0)');x.fillStyle=g;x.fillRect(-160,-200,320,400);
  x.restore();
  // 甲的厚度：边缘一圈暗，左上受光的一侧亮一线
  x.save();x.globalCompositeOperation='source-atop';x.lineWidth=2.4;plPath(x);x.strokeStyle='rgba(70,48,28,0.5)';x.stroke();plPath(x,-0.9,0.9);x.lineWidth=1.0;x.strokeStyle='rgba(255,246,222,0.32)';x.stroke();x.restore();
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
