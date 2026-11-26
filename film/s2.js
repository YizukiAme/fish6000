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

function fillPoly(c,P){c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();}
function resample(k,step){const out=[k[0]];for(let i=1;i<k.length;i++){const a=k[i-1],b=k[i];const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let j=1;j<=n;j++)out.push([lerp(a[0],b[0],j/n),lerp(a[1],b[1],j/n)]);}return out;}
// 折线在拐角处断开（刻字是一刀一刀刻的），再细分，好让每一刀两头收尖
function toCuts(polys,step=1.2){const cuts=[];for(const P of polys){let cur=[P[0]];for(let i=1;i<P.length;i++){cur.push(P[i]);if(i<P.length-1){const a=P[i-1],b=P[i],c2=P[i+1];let d=Math.atan2(c2[1]-b[1],c2[0]-b[0])-Math.atan2(b[1]-a[1],b[0]-a[0]);d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)>0.7){cuts.push(cur);cur=[P[i]];}}}cuts.push(cur);}
  return cuts.map(k=>resample(k,step));}
function inciseCuts(c, cuts, width, cinnabar, opacity, seed) {
  let previousGroup = -1, withinGroup = 0;
  for (const [cutIndex, points] of cuts.entries()) {
    const group = points.strokeGroup;
    if (group !== previousGroup) withinGroup = 0;
    const random = rng(seed * 1543 + (group === undefined ? cutIndex : group * 13 + withinGroup) * 37);
    previousGroup = group;
    withinGroup++;
    const distances = [0];
    for (let i = 1; i < points.length; i++) {
      distances.push(distances[i-1] + Math.hypot(points[i][0] - points[i-1][0], points[i][1] - points[i-1][1]));
    }
    const length = distances[distances.length-1];
    if (!length) continue;
    const entry = .07 + random() * .24;
    const exit = .22 + random() * .33;
    const pressure = .73 + random() * .38;
    const phase = random() * 5;
    // The intersections inside the fish are shallower secondary cuts.
    const scale = group >= 5 && group <= 8 ? .68 : (group >= 9 && group <= 12 ? .82 : 1);
    const half = width * .53 * pressure * scale;
    const redStart = .04 + random() * .24, redEnd = .62 + random() * .32;
    const pigment = random();
    const fishOutline = group !== undefined && (group <= 4 || group >= 13);
    const walls = [[],[]], floor = [], pale = [], red = [[],[]];
    for (let i = 0; i < points.length; i++) {
      const a = points[Math.max(0,i-1)], b = points[Math.min(points.length-1,i+1)];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = (a[1] - b[1]) / l, ny = (b[0] - a[0]) / l;
      const u = distances[i] / length;
      const profile = Math.min(1, u / entry, (1-u) / exit);
      const h = half * ((fishOutline ? .06 : .025) + (fishOutline ? .94 : .975)*Math.pow(profile,.64)) * (1 + .13 * Math.sin(6.2*u + phase));
      const at = d => [points[i][0] + nx*d*h, points[i][1] + ny*d*h];
      const light = nx * LDIR2[0] + ny * LDIR2[1];
      const bed = -.36 * light + .07*Math.sin(5.1*u + phase);
      walls[0].push(at(1));
      walls[1].push(at(-1));
      floor.push(at(bed));
      pale.push(at(bed + (Math.sign(light)-bed)*Math.abs(light)));
      if (u >= redStart && u <= redEnd) {
        const taper = Math.min(1,(u-redStart)*12,(redEnd-u)*9);
        red[0].push(at(bed + .46*taper));
        red[1].push(at(bed - .48*taper));
      }
    }
    const tone = .82 + random() * .16;
    c.fillStyle = (fishOutline ? 'rgba(107,54,35,' : 'rgba(68,45,30,') + (tone*opacity) + ')';
    fillPoly(c,walls[0].concat(walls[1].reverse()));
    c.fillStyle = 'rgba(225,200,158,' + (.40*opacity) + ')';
    fillPoly(c,floor.concat(pale.reverse()));
    if (red[0].length > 1 && (pigment > .28 || fishOutline) && cinnabar > 0) {
      c.fillStyle = 'rgba(156,52,34,' + ((.52+.46*pigment)*cinnabar*opacity) + ')';
      fillPoly(c,red[0].concat(red[1].reverse()));
    }
  }
}
function drawOBI(c,ch,x,y,s,w,cin,al,seed=7){const r=rng(seed*7+3);const cuts=toCuts(OBI[ch].map(st=>st.map(q=>[x+q[0]*s+(r()-.5)*s*0.03,y+q[1]*s+(r()-.5)*s*0.03])));
  let a=0;for(const k of cuts)for(let i=1;i<k.length-1;i++){a=a*0.7+(r()-.5)*0.18;k[i]=[k[i][0]+a,k[i][1]+a*0.6];}inciseCuts(c,cuts,w,cin,al,seed);}
function glyphFishCuts(p, H) {
  const cuts = [];
  for (const [group, stroke] of OBI_FISH.slice(0,-1).entries()) {
    let points = [];
    for (let j = 1; j < stroke.length; j++) {
      const a = stroke[j-1], b = stroke[j];
      for (let i = points.length ? 1 : 0; i <= 12; i++) {
        const u = i/12;
        points.push(BP(p, lerp(a[0],b[0],u), H*lerp(a[1],b[1],u)));
      }
      const next = stroke[j+1];
      if (next) {
        const incoming = Math.atan2(.21*(b[1]-a[1]),b[0]-a[0]);
        const outgoing = Math.atan2(.21*(next[1]-b[1]),next[0]-b[0]);
        if (Math.cos(outgoing-incoming) > Math.cos(.7)) continue;
      }
      points.strokeGroup = group;
      cuts.push(points);
      points = [points[points.length-1]];
    }
  }
  return cuts;
}
function incisedFishEye(c,p,H,w) {
  const e = OBI_FISH[OBI_FISH.length-1][0];
  const q = BP(p,e[0],e[1]*H), r = BP(p,e[0]+.025,e[1]*H);
  c.save();
  c.translate(q[0],q[1]);
  c.rotate(Math.atan2(r[1]-q[1],r[0]-q[0]));
  c.fillStyle = 'rgba(74,45,30,.95)';
  c.beginPath();
  c.moveTo(-.56*w,0);
  c.quadraticCurveTo(-.05*w,-.68*w,.66*w,-.08*w);
  c.quadraticCurveTo(.01*w,.62*w,-.56*w,0);
  c.fill();
  c.restore();
}
function drawGlyphFish(c,p,mode){const H=0.21*p.L,w=Math.max(1.6,0.042*p.L);
  if(mode==='incise'){inciseCuts(c,glyphFishCuts(p,H),w,1,1,11);incisedFishEye(c,p,H,w);return;}
  // 朱书：毛笔写的红字
  c.save();for(const [k,st] of OBI_FISH.entries()){const pts=[];const n=Math.max(6,st.length*8);for(let i=0;i<n;i++){const f=i/(n-1)*(st.length-1);const a=Math.min(st.length-2,Math.floor(f)),v=f-a;pts.push(BP(p,lerp(st[a][0],st[a+1][0],v),lerp(st[a][1],st[a+1][1],v)*H));}
    if(st.length===2&&k===OBI_FISH.length-1){c.fillStyle='rgba(204,62,38,0.96)';c.beginPath();c.arc(pts[0][0],pts[0][1],w*0.6,0,7);c.fill();continue;}
    ribbon(c,pts,v=>w*1.15*(0.45+0.55*Math.sin(Math.PI*Math.min(1,v*1.15))),'rgba(204,62,38,0.96)',k+3);}c.restore();}

// ---------- 龟腹甲：前叶圆、中线处微凹；两侧甲桥外凸；后叶收窄，下端有肛缺；边上有细小的起伏和崩口，左下角断了一块 ----------
const PLO=(()=>{const R=[[0,-171],[20,-183],[52,-180],[84,-167],[104,-144],[113,-114],[116,-86],[126,-70],[141,-50],[147,-16],[146,20],[138,50],[123,68],[116,86],[114,108],[104,134],[84,158],[56,173],[30,178],[15,167],[0,152]];
  const ctrl=R.concat(R.slice(1,-1).map(([x,y])=>[-x,y]).reverse());const n=ctrl.length;const sm=[];
  for(let i=0;i<n;i++){const p0=ctrl[(i-1+n)%n],p1=ctrl[i],p2=ctrl[(i+1)%n],p3=ctrl[(i+2)%n];for(let j=0;j<8;j++){const t=j/8,t2=t*t,t3=t2*t;const cr=k=>0.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);sm.push([cr(0)+(p1[0]===0&&j===0?0:0),cr(1)]);}}
  const N=sm.length,r=rng(201),disp=new Float32Array(N);let a=0;for(let i=0;i<N;i++){a=a*0.86+(r()-.5)*0.6;disp[i]=a;}
  for(const [f,depth,wd] of [[0.06,2.6,5],[0.18,3.3,3],[0.29,5.4,3],[0.361,8.7,3],[0.43,1.8,4],[0.64,2.6,5],[0.84,5.6,3],[0.92,3.0,6]]){const ci=Math.floor(N*f);for(let k=-wd;k<=wd;k++){const i=(ci+k+N)%N;disp[i]-=depth*Math.pow(1-Math.abs(k)/wd,0.6)*(0.75+0.5*r());}}
  const out=[];for(let i=0;i<N;i++){const A=sm[(i-1+N)%N],B=sm[(i+1)%N];let nx=B[1]-A[1],ny=-(B[0]-A[0]);const l=Math.hypot(nx,ny)||1;out.push([sm[i][0]+nx/l*disp[i],sm[i][1]+ny/l*disp[i]]);}
  const near=(x,y)=>{let bi=0,bd=1e9;out.forEach((q,i)=>{const d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;bi=i;}});return bi;};
  const iB=near(-40,176),iA=near(-113,104);const brk=jag([out[iB],[-49,167],[-51,155],[-58,156],[-68,141],[-73,138],[-72,132],[-86,132],[-96,120],[-105,119],out[iA]],1.8,207);
  return{pts:out.slice(0,iB).concat(brk,out.slice(iA+1)),brk};})();
const PL_OUT=PLO.pts,BREAK_PTS=PLO.brk;
const MS2=3,PLW=Math.ceil(300*MS2),PLH=Math.ceil(392*MS2);
function plPath(c,ox=0,oy=0){c.beginPath();PL_OUT.forEach((q,i)=>i?c.lineTo(q[0]+ox,q[1]+oy):c.moveTo(q[0]+ox,q[1]+oy));c.closePath();}
function jag(pts,amp,seed){const r=rng(seed);const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let j=0;j<n;j++){const v=j/n;out.push([lerp(a[0],b[0],v)+(r()-.5)*amp,lerp(a[1],b[1],v)+(r()-.5)*amp]);}}out.push(pts[pts.length-1]);return out;}
// 旧的兆：一道纵裂（凿的位置）+ 一枝横裂（钻的位置，朝中线）
const CRK_OLD=[[[-38,-162],[-36,-122],[-39,-84]],[[-37,-130],[-16,-140]],[[40,-164],[38,-126],[41,-92]],[[39,-136],[18,-146]],[[-40,40],[-38,82],[-41,122]],[[-39,74],[-18,66]],[[36,100],[34,128],[37,150]],[[35,114],[14,106]]].map((s,i)=>jag(s,1.4,300+i));
const CRK_NEW_STEM=jag([[40,12],[39,-12],[41,-38]],2.0,333),CRK_NEW_STEM2=jag([[40,12],[41,50],[39,92]],2.0,334),CRK_NEW_BR=jag([[40,12],[14,9],[-14,10],[-34,6]],1.8,335);
// 刻辞：右边“贞：王其[鱼]”，左边对贞“不其雨”；右边甲桥上占辞“王占曰：吉”，左下“今夕亡”（右下留给主角游上来的路）
const INSCR=[['贞',66,-116,40],['王',69,-74,36],['其',73,-33,39],['不',-68,-124,37],['其',-72,-83,42],['雨',-76,-40,34],
  ['王',111,-54,21],['占',116,-31,25],['曰',119,-7,20],['吉',119,17,25],['今',-99,9,21],['夕',-101,32,23],['亡',-97,60,23]];
let PL2=null;
function boneLineRim(c, points, widths, color, dx = 0, dy = 0) {
  const left = [], right = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i], a = points[Math.max(0,i-1)], b = points[Math.min(points.length-1,i+1)];
    const length = Math.hypot(b[0]-a[0],b[1]-a[1]) || 1;
    const nx = (a[1]-b[1])*widths[i]/(2*length), ny = (b[0]-a[0])*widths[i]/(2*length);
    left.push([p[0]+dx+nx,p[1]+dy+ny]); right.push([p[0]+dx-nx,p[1]+dy-ny]);
  }
  c.fillStyle = color; fillPoly(c,left.concat(right.reverse()));
}
function prepPlastron(){const c=mk(PLW,PLH);const x=c.getContext('2d');const T=(cx)=>cx.setTransform(MS2,0,0,MS2,PLW/2,PLH/2);
  // 软边遮罩：离边缘的远近
  const m=mk(PLW,PLH);const mx=m.getContext('2d');T(mx);mx.fillStyle='#fff';plPath(mx);mx.fill();
  const mb=mk(PLW,PLH);const mbx=mb.getContext('2d');mbx.filter=`blur(${9*MS2}px)`;mbx.drawImage(m,0,0);
  const md=mb.getContext('2d').getImageData(0,0,PLW,PLH).data,mm=mx.getImageData(0,0,PLW,PLH).data;
  // 磨治过的腹甲表面平整。粗糙度集中于残缘和片状斑驳处，露出的浅面留有呼吸。
  const img=x.createImageData(PLW,PLH), d=img.data;
  const cloudy=noise2(421,8,10), patch=noise2(422,23,28), grain=noise2(423,110,148);
  const grit=noise2(424,320,350), fiber=noise2(425,56,28), dust=rng(426);
  const areas=[
    [-105,-43,43,62,.88], [66,-139,52,39,.70], [99,36,48,66,.84],
    [-51,120,33,48,.77], [9,-27,54,39,.29], [20,156,22,31,.47]
  ];
  const byX=areas.map(([cx,,rx])=>Array.from({length:PLW},(_,i)=>Math.exp(-Math.pow(((i-PLW/2)/MS2-cx)/rx,2))));
  const byY=areas.map(([,cy,,ry,amount])=>Array.from({length:PLH},(_,i)=>amount*Math.exp(-Math.pow(((i-PLH/2)/MS2-cy)/ry,2))));
  for(let py=0;py<PLH;py++)for(let px=0;px<PLW;px++){
    const i=(py*PLW+px)*4;
    if(mm[i+3]<2)continue;
    const u=px/PLW,v=py/PLH;
    const large=cloudy(u*8,v*10), mid=patch(u*23,v*28);
    const f=grain(u*100+mid*4,v*137+large*4), speck=grit(u*316+mid*2,v*344+mid*2);
    const edge=clamp((.94-md[i+3]/255)/.45), wear=byX.reduce((value,row,j)=>value+row[px]*byY[j][py],0);
    const field=wear*.53+large*.65+mid*.51+f*.27+edge*.30;
    const stain=smooth(.77,1.36,field);
    const crust=stain*smooth(.37,.85,f*.51+speck*.49);
    const chips=stain*smooth(.69,.88,speck*.67+f*.33);
    const chalk=(1-stain*.67)*smooth(.52,.85,mid*.48+f*.32+speck*.2);
    const grey=smooth(.47,.80,cloudy(u*6+.9,v*8+1.1))*(.28+stain*.62);
    const longitudinal=fiber(u*51+large*2,v*24+mid);
    const lum=(large-.5)*11+(mid-.5)*13+(f-.5)*(10+stain*14)+(speck-.5)*(6+stain*15)
      +(longitudinal-.5)*(3+edge*3)+(dust()-.5)*(4+stain*8)-crust*19-chips*24+chalk*12-edge*5;
    d[i]  =222+lum-stain*26-grey*19;
    d[i+1]=206+lum-stain*40-grey*13;
    d[i+2]=178+lum-stain*55-grey*2;
    d[i+3]=mm[i+3];
  }
  x.putImageData(img,0,0);T(x);
  x.save();plPath(x);x.clip();x.lineCap='round';x.lineJoin='round';
  // 斑痕在磨损区内断续聚集。浅面只留像针尖的小点，局部显出粗糙的骨底。
  const fleck=rng(30217);
  for(let cluster=0;cluster<490;cluster++){
    const cx=fleck()*300-150, cy=fleck()*392-196, u=(cx+150)/300,v=(cy+196)/392;
    const damage=areas.reduce((sum,[sx,sy,rx,ry,amount])=>sum+amount*Math.exp(-Math.pow((cx-sx)/rx,2)-Math.pow((cy-sy)/ry,2)),0);
    const affinity=damage*.70+cloudy(u*8,v*10)*.45+patch(u*23,v*28)*.52;
    if(affinity<.75)continue;
    const radius=2+fleck()*6, along=.40+fleck()*.64, slope=(fleck()-.5)*1.7, strength=smooth(.72,1.37,affinity);
    const n=10+28*strength;
    for(let j=0;j<n;j++){
      const a=fleck()*Math.PI*2, spread=Math.sqrt(fleck())*radius, dx=Math.cos(a)*spread,dy=Math.sin(a)*spread*along;
      const hx=cx+dx*Math.cos(slope)-dy*Math.sin(slope),hy=cy+dx*Math.sin(slope)+dy*Math.cos(slope);
      const size=(.18+fleck()**3*.96)*(.7+strength*.62),tone=fleck();
      const alpha=(.12+.53*strength)*(.55+.45*fleck());
      x.fillStyle=tone<.25?'rgba(250,237,206,'+alpha+')':tone<.54?'rgba(113,86,52,'+alpha+')':'rgba(140,89,47,'+alpha+')';
      x.beginPath();x.moveTo(hx-size,hy);x.lineTo(hx-size*.16,hy-size*.64);x.lineTo(hx+size*.82,hy-size*.24);
      x.lineTo(hx+size*.44,hy+size*.36);x.lineTo(hx-size*.38,hy+size*.58);x.closePath();x.fill();
    }
  }
  // 不齐的断面：薄的外层在转折处剥离，露出的内层留有细长的孔隙。
  const edgeRng=rng(417), r=rng(215);
  const ledge=BREAK_PTS.map(([px,py],j)=>{
    const a=BREAK_PTS[Math.max(0,j-1)],b=BREAK_PTS[Math.min(j+1,BREAK_PTS.length-1)];
    const length=Math.hypot(b[1]-a[1],b[0]-a[0])||1;
    let nx=(b[1]-a[1])/length,ny=-(b[0]-a[0])/length;
    if(nx*px+ny*py>0){nx=-nx;ny=-ny;}
    const t=j/(BREAK_PTS.length-1);
    const spread=.8+2.6*Math.pow(Math.sin(t*9+.5),2)+1.15*edgeRng();
    return {px,py,nx,ny,spread};
  });
  for(let j=1;j<ledge.length;j++){
    const a=ledge[j-1],b=ledge[j];
    const step=(p,k)=>[p.px+k*p.nx*p.spread,p.py+k*p.ny*p.spread];
    const lip=(k0,k1,color)=>{x.fillStyle=color;fillPoly(x,[step(a,k0),step(b,k0),step(b,k1),step(a,k1)]);};
    lip(0,.78,'rgba(123,95,65,.48)');
    lip(.2,1,'rgba(217,196,159,.76)');
    if(j%7<4)lip(.83,1.14,'rgba(246,231,200,.64)');
    const count=Math.ceil((a.spread+b.spread)*.42);
    for(let k=0;k<count;k++){
      const v=edgeRng(), depth=.24+edgeRng()*.58;
      const pa=step(a,depth),pb=step(b,depth),cx=lerp(pa[0],pb[0],v),cy=lerp(pa[1],pb[1],v);
      x.fillStyle='rgba(90,68,49,.53)';x.beginPath();
      x.ellipse(cx,cy,.24+edgeRng()*.61,.14+edgeRng()*.17,Math.atan2(-a.nx,a.ny)+.5,0,2*Math.PI);x.fill();
    }
  }
  // Shield sulci survive as smooth, shallow fragments. Interlocked bone margins meet at a different depth.
  const boneJoin = (control, seed, breadth, density, knit = true) => {
    const roll = rng(seed), samples = resample(control,1.05);
    let surface = 0.15, bend = 0, grain = 0;
    const pts = [], dark = [], lip = [];
    for (let i = 0; i < samples.length; i++) {
      const p=samples[i], a=samples[Math.max(0,i-1)], b=samples[Math.min(samples.length-1,i+1)];
      const length=Math.hypot(b[0]-a[0],b[1]-a[1])||1, nx=(a[1]-b[1])/length, ny=(b[0]-a[0])/length;
      if (i%13===0) grain=roll();
      surface = .91*surface+.09*grain;
      bend=.77*bend+(roll()-.5)*.37;
      const tooth = knit ? (roll()-.5)*(.24+surface*.72) : (roll()-.5)*.12;
      const v=Math.min(1,(i+1)/5,(samples.length-i)/5), w=breadth*(.24+1.45*surface*surface+Math.abs(tooth)*.46)*v;
      const offset=bend+tooth;
      pts.push([p[0]+nx*offset,p[1]+ny*offset]); dark.push(w); lip.push(w*(.15+.46*surface));
    }
    boneLineRim(x,pts,lip,'rgba(252,233,192,'+(density*.49)+')',.39,.53);
    boneLineRim(x,pts,dark,'rgba(65,44,26,'+density+')');
    if (!knit) return;
    // Fragments of darker sediment lodge along one margin, with unequal gaps.
    for(let i=3;i<pts.length-2;i+=3+Math.floor(roll()*5)){
      if(dark[i]<.53 || roll()<.32)continue;
      const a=pts[i], b=pts[i+1], scale=dark[i]*(.3+roll()*.7);
      x.fillStyle='rgba(74,46,25,'+(.22+roll()*.27)+')';
      fillPoly(x,[[a[0]-.22,a[1]],[b[0]+.32,b[1]],[a[0]-scale*.47,a[1]+scale]]);
    }
  };
  // Median suture stops at the entoplastron and resumes below its posterior point.
  boneJoin([[0,-173],[-.4,-162],[.7,-153],[.1,-145]],251,1.03,.72);
  boneJoin([[-105,-158],[-88,-151],[-69,-145],[-53,-132],[-37,-127]],252,1.25,.74);
  boneJoin([[-37,-127],[-26,-130],[-15,-139],[.1,-145],[14,-139],[26,-130],[36,-126]],253,1.08,.72);
  boneJoin([[36,-126],[53,-132],[67,-141],[84,-149],[104,-154]],254,1.19,.76);
  boneJoin([[-37,-127],[-34,-115],[-27,-104],[-18,-96],[-6,-90],[.5,-87],[14,-92],[24,-101],[30,-112],[36,-126]],255,1.38,.80);
  boneJoin([[.5,-87],[1.1,-77],[.1,-64],[.5,-52],[-.4,-34],[.7,-17]],256,1.04,.74);
  boneJoin([[.7,-17],[1.4,-10],[.1,5],[1.4,30],[.6,51],[1.8,75],[1.2,93]],257,1.24,.76);
  boneJoin([[1.2,93],[.4,103],[1.6,119],[1.4,137],[0,155]],258,1.35,.79);
  boneJoin([[-150,7],[-135,3],[-118,-3],[-99,-6],[-86,-7],[-71,-7],[-51,-8],[-35,-8],[-23,-12],[-5,-17],[.7,-17],[2,-14],[19,-15],[39,-11],[59,-8],[69,-6],[88,-5],[106,0],[117,2.8],[124,3.1],[133,5],[150,8]],259,1.53,.81);
  boneJoin([[-119,110],[-102,108],[-87,105],[-74,104],[-61,100],[-43,100],[-30,96],[-12,96],[1.2,93],[3,95],[24,97],[40,100],[59,100],[76,102],[90,105],[114,108]],260,1.22,.77);
  // Faint score remnants end independently; avoid subdividing every surface into cells.
  boneJoin([[-120,-75],[-103,-71],[-91,-68],[-79,-68],[-66,-65]],261,.58,.44,false);
  boneJoin([[58,-69],[71,-67],[85,-71],[100,-78],[115,-83]],262,.56,.40,false);
  boneJoin([[-112,67],[-100,63],[-89,63],[-80,61]],263,.55,.38,false);
  boneJoin([[67,61],[76,61],[88,64],[102,67],[120,68]],264,.55,.41,false);

  // Four older divinations: the face keeps a hairline and, at most, a small local ochre change.
  for(let k=0;k<CRK_OLD.length;k+=2){
    const stem=CRK_OLD[k], twig=CRK_OLD[k+1], origin=twig[0];
    const a=rng(277+k);
    for (let j=0;j<4;j++){
      const ox=origin[0]+(twig[twig.length-1][0]-origin[0])*.18+(r()-.5)*3;
      const oy=origin[1]+(r()-.5)*4, rad=3+r()*5;
      const tint=x.createRadialGradient(ox,oy,0,ox,oy,rad);
      tint.addColorStop(0,'rgba(119,76,31,.075)');tint.addColorStop(1,'rgba(119,76,31,0)');
      x.fillStyle=tint;x.fillRect(ox-rad,oy-rad,rad*2,rad*2);
    }
    for(const points of [stem,twig]){
      const P=resample(points,1.6);
      const widths=P.map((q,i)=>{
        const v=i/(P.length-1), near=Math.exp(-Math.hypot(q[0]-origin[0],q[1]-origin[1])/14);
        return (.20+.38*near+.38*Math.sin(Math.PI*v))*(.73+a()*.44)*Math.min(1,.08+v*15,.08+(1-v)*13);
      });
      boneLineRim(x,P,widths.map(w=>w*.40),'rgba(242,218,173,.38)',.29,.35);
      boneLineRim(x,P,widths,'rgba(62,41,24,.84)');
    }
  }
  // 刻辞
  const hand = [[.94,-.059,-.03],[1.04,-.047,.045],[.91,.052,-.052],
      [.92,.065,-.078],[1.03,-.053,-.053],[.89,.061,.022],
      [1,.031,-.027],[.92,-.035,.052],[1.05,.028,.017],[.91,-.035,.025],
      [.96,.074,-.041],[.93,.031,.064],[.87,.043,.012]];
    INSCR.forEach(([ch,cx0,cy0,sz],k)=>{
      const [stretch,slope,lean]=hand[k];
      x.save();x.transform(stretch,slope,lean,1,cx0,cy0);
      drawOBI(x,ch,0,0,sz,sz*.056,.45+r()*.5,1,40+k);
      x.restore();
    });
  x.restore();
  // 体积：中间亮、边缘暗；右上一抹柔光，像被手摸得发亮的包浆
  x.save();plPath(x);x.clip();
  let g=x.createRadialGradient(20,-30,40,0,0,215);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(103,84,65,0.20)');x.globalCompositeOperation='multiply';x.fillStyle=g;x.fillRect(-160,-200,320,400);
  x.globalCompositeOperation='screen';g=x.createRadialGradient(64,-96,6,64,-96,130);g.addColorStop(0,'rgba(255,248,230,0.12)');g.addColorStop(1,'rgba(255,248,230,0)');x.fillStyle=g;x.fillRect(-160,-200,320,400);
  g=x.createRadialGradient(-50,90,4,-50,90,70);g.addColorStop(0,'rgba(255,246,226,0.1)');g.addColorStop(1,'rgba(255,246,226,0)');x.fillStyle=g;x.fillRect(-160,-200,320,400);
  x.restore();
  // 甲的厚度：边缘一圈暗，左上受光的一侧亮一线
  x.save();x.globalCompositeOperation='source-atop';x.lineWidth=2.4;plPath(x);x.strokeStyle='rgba(70,48,28,0.28)';x.stroke();plPath(x,-0.9,0.9);x.lineWidth=1.0;x.strokeStyle='rgba(255,246,222,0.32)';x.stroke();x.restore();
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
  const sc=smooth(29.45,30.25,t);if(sc>0){const o=[40,12];let g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],20*sc+2);g.addColorStop(0,`rgba(80,42,16,${0.7*sc})`);g.addColorStop(1,'rgba(92,52,22,0)');ctx.fillStyle=g;ctx.fillRect(o[0]-23,o[1]-23,46,46);
    const glow=smooth(29.6,30.2,t)*(1-smooth(30.35,31.56,TREAL))*(0.82+0.18*Math.sin(TREAL*31));if(glow>0){ctx.globalCompositeOperation='lighter';g=ctx.createRadialGradient(o[0],o[1],0,o[0],o[1],30);g.addColorStop(0,`rgba(255,150,60,${0.8*glow})`);g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.fillRect(o[0]-32,o[1]-32,64,64);ctx.globalCompositeOperation='source-over';}}
  // 兆：先纵裂，再横出一枝，指向左边
  const hot=1-smooth(T2C+0.05,T2C+1.14,TREAL);const crack=(pts,p)=>{
    if(p<=0)return null;
    const branch=pts===CRK_NEW_BR;
    const tipIndex=p*(pts.length-1), last=Math.floor(tipIndex);
    const sub=pts.slice(0,last+1);
    if(last<pts.length-1){
      const a=pts[last],b=pts[last+1], frac=tipIndex-last;
      sub.push([lerp(a[0],b[0],frac),lerp(a[1],b[1],frac)]);
    }
    if(sub.length<2)return sub[0];
    // Width follows the original fracture, not the length already revealed.
    const widths=sub.map((q,i)=>{
      const v=Math.min(i,tipIndex)/(pts.length-1);
      const edge=Math.min(1,.13+(1-v)*7,.14+(tipIndex-Math.min(i,tipIndex))*1.6);
      const rough=.90+.13*Math.sin(3.81*Math.min(i,tipIndex)+(.2+v)*2.33);
      return (branch?1.66:1.52)*(.82+.18*(1-v))*edge*rough;
    });
    boneLineRim(ctx,sub,widths.map(w=>w*.32),'rgba(250,229,187,.52)',.42,.46);
    boneLineRim(ctx,sub,widths,'rgba(39,24,14,.96)');
    if(hot>0){
      ctx.save();ctx.globalCompositeOperation='lighter';
      boneLineRim(ctx,sub,widths.map(w=>w*.46),'rgba(255,150,60,'+(.9*hot)+')');
      ctx.restore();
    }
    return sub[sub.length-1];
  };
  const ps=smooth(T2C,T2C+0.12,t),pb=smooth(T2C+0.16,T2C+0.3,t);
  {const f=1-smooth(T2C,T2C+0.25,t);if(f>0&&t>=T2C){ctx.save();ctx.globalCompositeOperation='lighter';const g3=ctx.createRadialGradient(40,12,0,40,12,26);g3.addColorStop(0,`rgba(255,240,210,${0.9*f})`);g3.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g3;ctx.fillRect(14,-14,52,52);ctx.restore();}}const tips=[crack(CRK_NEW_STEM,ps),crack(CRK_NEW_STEM2,ps),crack(CRK_NEW_BR,pb)];
  const r=rng(Math.floor(TREAL*30));for(const [tp,t0] of [[tips[0],T2C],[tips[1],T2C],[tips[2],T2C+0.17]]){if(!tp)continue;const d=t-t0;if(d>0.45)continue;for(let i=0;i<5;i++){ctx.fillStyle=`rgba(250,240,215,${0.8*(1-d/0.45)})`;ctx.beginPath();ctx.arc(tp[0]+(r()-.5)*10*(0.3+d*3),tp[1]+(r()-.5)*10*(0.3+d*3)-d*8,0.5+r()*0.8,0,7);ctx.fill();}}
  // 烟
  const sm=smooth(29.9,30.3,t)*(1-smooth(31.2,32.4,t));if(sm>0){for(let i=0;i<7;i++){const ph=TREAL*0.9+i*0.37;const k=(ph%1);const yy=12-k*70,xx=40+8*Math.sin(k*6+i)+k*10;ctx.fillStyle=`rgba(200,196,188,${0.12*sm*(1-k)})`;ctx.beginPath();ctx.ellipse(xx,yy,4+k*14,3+k*9,k*2,0,7);ctx.fill();}}
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
