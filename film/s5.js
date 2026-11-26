// ================= 伍 · 磁州窑白地黑花枕（宋金，仿） =================
// 主鱼游入枕面后逐笔画成。先压深褐鱼头、双勾背腹、分出鳍尾，再提笔交织菱鳞，最后点睛出枕。
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
const CAMHOOK=[];
CAMHOOK.push((_, real)=>{
  const advance=smooth(30.34,31.72,real)*(1-smooth(31.72,32.58,real));
  return [1.4*advance,.12*advance,1+.055*advance];
});                                 // 镜头的附加量（真实时间）：停住的时候慢慢推近一点
CAMHOOK.push(r=>{const b=smooth(51.3,54.1,r)*(1-smooth(54.3,55.7,r));return[-3*b,1*b,1+0.075*b];});
const P5W=Math.ceil(400*MS5),P5H=Math.ceil(300*MS5);
function pillowPts(sc=1) {
  const points=[];
  for(let i=0;i<=120;i++){
    const a=i*Math.PI/60, cs=Math.cos(a),sn=Math.sin(a);
    const x=180*Math.sign(cs)*Math.pow(Math.abs(cs),.77);
    // The headrest slopes towards the front. Its back rises smoothly at both shoulders.
    const shoulder=2.4*Math.exp(-Math.pow((Math.abs(x)-89)/55,2));
    const y=(sn<0 ? 91.8 : 87)*Math.sign(sn)*Math.pow(Math.abs(sn),sn<0?.84:.60)-14
      -(sn<0?shoulder*Math.abs(sn):0)+.9*Math.sin(a*3+.3)*Math.abs(sn);
    points.push([x*sc+(1-sc)*.5,y*sc-.7*(1-sc)]);
  }
  return points;
}
const PIL=pillowPts(1),PIL_IN=pillowPts(0.94),CART=pillowPts(0.74),CART2=pillowPts(0.705);
function ptsPath(c,pts,ox=0,oy=0){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0]+ox,q[1]+oy):c.moveTo(q[0]+ox,q[1]+oy));c.closePath();}
// 快笔：一笔一笔的带锋的线
function brush(c,pts,w,seed,col='rgba(24,20,18,0.95)',q=1){if(q<=0)return;const n=Math.max(2,Math.ceil(pts.length*q));const sub=pts.slice(0,n);ribbon(c,sub,v=>w*(v<0.15?0.4+4*v:1)*(1-0.75*Math.pow(v,3)),col,seed);}
function curvePts(ctrl,n=24){const out=[];for(let i=0;i<n;i++){const f=i/(n-1)*(ctrl.length-1);const a=Math.min(ctrl.length-2,Math.floor(f)),v=f-a;const P0=ctrl[Math.max(0,a-1)],P1=ctrl[a],P2=ctrl[a+1],P3=ctrl[Math.min(ctrl.length-1,a+2)];
  const h=(p0,p1,p2,p3)=>0.5*((2*p1)+(-p0+p2)*v+(2*p0-5*p1+4*p2-p3)*v*v+(-p0+3*p1-3*p2+p3)*v*v*v);out.push([h(P0[0],P1[0],P2[0],P3[0]),h(P0[1],P1[1],P2[1],P3[1])]);}return out;}
function slipGround(x,T){
  const img=x.createImageData(P5W,P5H),d=img.data;
  const cloud=noise2(6291,6,6),grain=noise2(6292,100,65),speck=rng(6294);
  const fired=noise2(8441,24,19);
  for(let j=0;j<P5H;j++)for(let i=0;i<P5W;i++){
    const a=(i/P5W-.5)*400,b=(j/P5H-.5)*300;
    const broad=cloud(i/P5W*6,j/P5H*6)-.5,fine=grain(i/P5W*100,j/P5H*65)-.5;
    const shoulders=6.3*Math.pow(Math.abs(a)/180,2.5);
    const back=Math.max(0,(-b-48)/62),front=Math.max(0,(b-20)/70);
    const bend=3.3*Math.exp(-Math.pow((a+54)/48,2)-Math.pow((b-68)/18,2))
      -3.2*Math.exp(-Math.pow((a+98)/61,2)-Math.pow((b+43)/32,2));
    const u=a/180, v=(b+12)/95;
    const slope=v-.08-.28*u*u+.075*u;
    const reflection=6.2*Math.exp(-Math.pow((slope-.47)/.25,2))*(.66+.34*u);
    const dip=6.5*Math.exp(-Math.pow((u+.23)/.88,2)-Math.pow((v+.10)/.55,2));
    const wash=13*broad+3.1*fine+(speck()-.5)*1.7-shoulders-5.0*back-3.6*front+bend+reflection-dip;
    const i0=4*(j*P5W+i);
    // Translucent slip warms where it thins towards the shoulders and rolled edge.
    const edgeDistance=Math.pow(Math.abs(u),2.7)+Math.pow(Math.abs(v),2.55);
    const iron=smooth(.55,1.04,edgeDistance);
    const firing=fired(i/P5W*24,j/P5H*19)-.5;
    const corner=4.7*Math.exp(-Math.pow((u-.65)/.52,2)-Math.pow((v+.59)/.36,2));
    const saddle=3.6*Math.exp(-Math.pow((u+.35)/.65,2)-Math.pow((v-.20)/.37,2));
    const tone=wash+5.8*firing+corner-saddle;
    d[i0]=217+tone-5.2*iron;d[i0+1]=209+tone-8.8*iron;
    d[i0+2]=195+tone+1.8*fine-12.5*iron;d[i0+3]=255;
  }
  const lay=mk(P5W,P5H);lay.getContext('2d').putImageData(img,0,0);
  x.setTransform(1,0,0,1,0,0);x.drawImage(lay,0,0);T();
  // Isolated pinholes under the glaze, with most of the painted field clear.
  for(let i=0;i<95;i++){
    const u=(speck()-.5)*354,v=(speck()-.5)*215;
    const rad=.09+.36*Math.pow(speck(),3);
    x.fillStyle='rgba(90,70,45,'+(.11+.16*speck())+')';
    x.beginPath();x.ellipse(u,v,rad*1.4,rad,.18,0,Math.PI*2);x.fill();
  }
}
function perimeterPaint(x){
  const loop=[];
  for(let k=0;k<=120;k++){
    const a=k*Math.PI/60,[px,py]=PIL[k],centreY=-14;
    const s=.943+.0026*Math.cos(a*4+.65)+.0015*Math.sin(7*a-.8);
    loop.push([px*s,centreY+(py-centreY)*(.930+.0021*Math.sin(6*a))]);
  }
  function loopLine(base,shade,alpha,offset) {
    x.fillStyle='rgba('+shade+','+alpha+')';x.beginPath();
    for(const dir of [1,-1]){
      for(let k=0;k<120;k++){
        const n=dir===1?k:119-k,q=loop[n],a=loop[(n+119)%120],b=loop[(n+1)%120];
        const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
        const t=n/120*Math.PI*2;
        const w=base*(.94+.18*Math.sin(t+.8)+.1*Math.sin(3*t-1.6)+.055*Math.cos(8*t));
        const shift=offset+dir*w;
        const px=q[0]-dy/len*shift,py=q[1]+dx/len*shift;
        if(!k)x.moveTo(px,py);else x.lineTo(px,py);
      }
      x.closePath();
    }
    x.fill('evenodd');
  }
  const contour=(i,inset)=>{
    const cur=PIL[i],prev=PIL[(i+119)%120],next=PIL[(i+1)%120];
    const dx=next[0]-prev[0],dy=next[1]-prev[1],n=Math.hypot(dx,dy)||1;
    return [cur[0]-dy/n*inset,cur[1]+dx/n*inset];
  };
  function lipLine(start,end,inset,width,color) {
    // A soft edge and a short broken core follow the same shoulder. Local curvature
    // changes the returned light without adding a second raised rim.
    const isLight=color.startsWith('rgba(25');
    x.save();x.fillStyle=color;
    for(const [breadth,opacity] of [[1.9,.16],[1,.49],[.28,isLight?.52:.27]]){
      const strip=[];
      for(const side of [-1,1]){
        for(let k=0;k<=end-start;k++){
          const i=side<0?start+k:end-k, phase=(i-start)/(end-start);
          const pressure=Math.sin(phase*Math.PI)*(.66+.2*Math.sin(.43*i+.7)+.14*Math.cos(.97*i));
          const center=inset+.24*Math.cos(.43*i)-.18*Math.sin(.28*i);
          strip.push(contour(i%120,center+side*width*breadth*.5*pressure));
        }
      }
      x.globalAlpha=opacity;ptsPath(x,strip);x.fill();
    }
    x.restore();
  }
  lipLine(5,51,1.55,2.7,'rgba(151,130,98,.39)');
  lipLine(57,78,1.2,1.8,'rgba(145,125,94,.42)');
  lipLine(79,119,1.5,1.4,'rgba(149,126,91,.41)');
  lipLine(94,119,3.2,1.05,'rgba(255,251,230,.76)');
  lipLine(12,30,3.4,1.65,'rgba(254,250,231,.72)');
  lipLine(32,46,3.4,1.15,'rgba(250,246,228,.65)');
  lipLine(50,64,2.4,1.55,'rgba(250,246,226,.60)');
  // Small interruptions in the glaze are easiest to see along the forward lip.
  // Each depression has a dim return on its lower edge, lit from the same side.
  for(const [arcAt,inset,r] of [[7.4,2.1,.20],[17.6,2.8,.27],[34.9,2.5,.42],[43.3,1.5,.29],[49.7,2.1,.20]]){
    const n=Math.floor(arcAt),f=arcAt-n,a=contour(n,inset),b=contour(n+1,inset);
    const sx=lerp(a[0],b[0],f),sy=lerp(a[1],b[1],f);
    x.fillStyle='rgba(113,87,58,.32)';x.beginPath();x.ellipse(sx,sy,r*1.42,r*.62,-.16,0,7);x.fill();
    x.fillStyle='rgba(250,242,222,.56)';x.beginPath();x.ellipse(sx+.28*r,sy+.86*r,r*.94,r*.30,-.16,0,7);x.fill();
  }
  loopLine(1.18,'48,36,27',.96,0);
  loopLine(.17,'128,94,57',.48,-.83);
}
function inkBand5() {
  const S=4,W=440,H=50,panel=mk(W*S,H*S),c=panel.getContext('2d');c.scale(S,S);
  const P={
    leaf:[.11,.48,.97,.64,.18,.016],
    hook:[.026,.20,.70,.95,.78,.045],
    hair:[.20,.65,1,.72,.29,.02],
    drop:[.17,.93,.80,.34,.075,.01],
    stem:[.10,.35,.56,.91,.60,.025],
    nib:[.56,1,.68,.36,.125,.015]
  };
  let count=0;
  function pull(points,width,profile='leaf',color='#493426',dry=.15) {
    const controls=curvePts(points,Math.max(65,points.length*15));
    const arc=[0];
    for(let i=1;i<controls.length;i++)arc.push(arc[i-1]+Math.hypot(controls[i][0]-controls[i-1][0],controls[i][1]-controls[i-1][1]));
    const length=arc.at(-1),par=Array.isArray(profile)?profile:P[profile],rand=rng(7353+count++*571);
    const phase=rand()*20,wander=rand()*1.2-.6,split=.52+.22*rand();
    const data=controls.map((q,i)=>{
      const t=arc[i]/length,step=t*(par.length-1),j=Math.min(par.length-2,step|0),f=step-j;
      const b=controls[Math.min(i+1,controls.length-1)],a=controls[Math.max(0,i-1)];
      const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
      const widthAt=width*lerp(par[j],par[j+1],f*f*(3-2*f));
      const lean=wander*.18*Math.sin(t*Math.PI)+.09*Math.sin(.13*arc[i]+phase);
      const ed=.072*Math.sin(arc[i]*1.21+phase)+.042*Math.sin(arc[i]*2.74+.71*phase);
      const fraction=widthAt/(widthAt+1.8);
      return {q,t,nx:-dy/len,ny:dx/len,lo:lean-widthAt*(.46+.055*Math.sin(t*6+phase))-.8*ed*fraction,hi:lean+widthAt*(.52+.05*Math.sin(t*7+phase))+.5*ed*fraction};
    });
    function line(q,k,o) {return [q.q[0]+q.nx*(lerp(q.lo,q.hi,k)+o),q.q[1]+q.ny*(lerp(q.lo,q.hi,k)+o)];}
    const path=new Path2D();data.forEach((d,i)=>i?path.lineTo(...line(d,0,0)):path.moveTo(...line(d,0,0)));
    for(let i=data.length-1;i>=0;i--)path.lineTo(...line(data[i],1,0));
    path.closePath();c.fillStyle=color;c.fill(path);
    if(width<2.5)return;
    c.save();c.clip(path);
    // Bristles carry unequal loads. Low-contrast rails open on one flank only,
    // while a sparse dry hair exposes lighter slip where a stroke is lifted.
    for(let h=0;h<4;h++){
      const edge=.09+rand()*.77,from=.06+rand()*.48,to=.62+rand()*.35;
      c.beginPath();let started=false;
      for(const d of data){
        if(d.t<from||d.t>to)continue;
        const at=line(d,edge+.028*Math.sin(phase+12*d.t),0);
        if(started)c.lineTo(...at);else{c.moveTo(...at);started=true;}
      }
      c.lineWidth=(.10+.10*rand())*(.55+.55*dry);
      c.strokeStyle='rgba(157,115,75,'+(.15+rand()*.23)+')';c.stroke();
    }
    if(dry>.28){
      const side=rand()>.5?.69:.25;
      c.beginPath();let fresh=true;
      for(const d of data)if(d.t>split&&d.t<.96) {
        const at=line(d,side+.043*Math.sin(d.t*9+phase),0);
        if(fresh)c.moveTo(...at);else c.lineTo(...at);fresh=false;
      }
      c.globalCompositeOperation='destination-out';c.strokeStyle='rgba(0,0,0,'+(.29+.34*dry)+')';c.lineWidth=.20+.18*dry;c.stroke();
    }
    c.restore();
  }
  const black='#38281f',brown='#4d3627',wash='#71523a';
  // Outer left part of the continuous vine turns under the lip.
  pull([[-7,9],[7,10],[19,15],[33,21],[46,24],[62,31],[79,36],[96,38]],3.6,'leaf',brown,.42);
  pull([[11,29],[23,29],[35,26],[44,21],[55,12]],5.2,'drop',black,.52);
  pull([[21,25],[29,24],[41,19],[48,11]],1.8,'hair',brown);
  // The pendant on the left is a hollow bud. The sweeping stem rejoins its
  // neighbour tangentially; the fill of the bud is not a separate black wedge.
  pull([[47,19],[54,27],[65,32],[76,37],[89,40],[102,41.9],[116,41.5],[123.1,37.8],
    [124.1,31.3],[121.1,25.2],[116.4,19.2],[111.3,17.8],[106.8,19.1],[105.4,23.3],[107.3,27.6],[110,30.6]],
    7.1,[.16,.39,.43,.38,.40,.31,.36,.24,.31,.59,.97,.03],black,.65);
  pull([[103.4,31],[97.3,26.4],[92.0,23.5],[88.4,23.8],[87.5,26.1],[89.3,28.8]],2.85,'hook',wash,.44);
  pull([[127,40],[135,34],[139,27],[139,20],[137,15],[132,13],[128.5,15],[129.7,18.8],[132,20]],3.7,'hook',brown,.54);
  pull([[126,41],[131,38],[138,31],[143,23],[147,15],[147,7]],2.05,'stem',black);
  pull([[129,41],[145,39],[164,35],[184,27],[196,20],[211,14],[230,11],[246,10]],1.65,'hair',brown);
  pull([[146,38],[160,34],[169,29],[180,23],[188,19],[196,15]],7.8,'leaf',brown,.9);
  pull([[150,41],[160,39],[170,36],[177,32]],1.12,'hair',wash);
  // A single long pull with its round turn laid wetter towards the core.
  pull([[218,12],[236,9],[251,8.5],[265,10.3],[279,15],[290,21],[295,26],
    [296.3,30.1],[293.6,33.2],[287,35],[281,34.5],[278,32],[279,29.5],[284,27.4],[287,27]],7.7,'hook',black,.72);
  pull([[202,41],[218,38],[233,37],[249,38],[266,39.5],[283,39],[298,36],[306,31]],3.7,'drop',brown,.47);
  pull([[277,10],[289,12.1],[306,17],[321,24],[340,31],[356,35],[375,36],[393,32]],2.0,'hair',brown);
  pull([[294,15],[311,18],[328,21.5],[346,26.6],[360,28.7],[370,28]],5.3,'leaf',black,.78);
  pull([[318,27],[336,32],[352,37],[366,39.7],[380,38],[389,34]],6.7,'drop',brown,.92);
  pull([[314,29],[326,32],[339,36],[349,38]],1.12,'hair',wash);
  pull([[298,16],[305,20],[314,26],[322,35],[324,40]],1.45,'hair',brown);
  pull([[389,34],[401,31],[411,23],[416,13],[415,6]],4.2,'leaf',brown,.6);
  pull([[397,36],[413,30],[427,22],[442,17]],2.3,'hair',black);
  // Separate calls preserve the open spaces and differing origins of the lobed sprays.
  const fans=[
    [[58,22],[62,26.3],[69,30.9],[74.1,32.8],2.50],
    [[63,19],[65.2,24.7],[69.8,29.7],[74.7,32.2],2.85],
    [[69,18.5],[69.1,23],[72.9,29.1],[76,31.5],2.07],
    [[75,19.3],[74,24],[75.8,28.5],[77.8,30.6],1.62],
    [[239.5,23],[244,27.1],[250,30.6],[255,31.4],1.62],
    [[240.6,19.5],[245.2,24.7],[252.1,29],[258.2,31.4],2.43],
    [[245.4,16.8],[249.5,23.5],[254.6,27.9],[260.3,30],2.98],
    [[252.7,16],[253.5,20.9],[257.6,26.6],[261.4,29.4],3.12],
    [[260.4,15.7],[259.2,20.6],[260.7,24.6],[264.8,28.2],2.18],
    [[384,21.8],[387.1,24.4],[391.6,26.4],[396.4,27.8],1.42],
    [[386.6,17.9],[389.4,22.1],[393.4,25.3],[397.1,26.4],1.98],
    [[392.1,16.3],[392.8,20.4],[395.7,24.6],[398.4,25.5],2.41],
    [[397.6,16],[397.4,20.2],[399.2,23.3],[401,24.2],1.93]
  ];
  fans.forEach((leaf,i)=>pull(leaf.slice(0,4),leaf[4],i%3===1?'nib':'drop',i%4===1?wash:brown,.47));
  return c.getImageData(0,0,W*S,H*S);
}
function firedWall5(x,point){
  const tex=inkBand5(),ink=tex.data,tw=tex.width,th=tex.height;
  const texture=new Uint8ClampedArray(tw*th*4);
  const ironField=noise2(889,20,6),grain=noise2(891,172,18),clayField=noise2(892,9,8);
  const fx=rng(7892);
  for(let j=0;j<th;j++)for(let i=0;i<tw;i++){
    const u=(i+.5)*440/tw,v=(j+.5)*50/th,au=u/440,av=v/50,idx=4*(j*tw+i);
    const broad=clayField(9*au,8*av)-.5;
    const med=ironField(20*au,6*av),fine=grain(172*au,18*av);
    // Warm shoulder at the left, cold reflected light on the front, shadow in
    // the right return. Shading follows the profile from the lip to the foot.
    const fac=Math.sin(au*Math.PI),dome=15*fac+11*Math.sin(2*Math.PI*au-.2);
    const lip=6.25+.60*Math.sin(au*5.2-.25)+.18*Math.sin(au*26.7);
    const foot=44.15+.71*Math.sin(au*8.1+.2)-.30*Math.sin(au*21.2-.2);
    const round=Math.sin(clamp((v-lip)/(foot-lip),0,1)*Math.PI);
    const under=-18*Math.exp(-Math.pow((v-lip-1.9)/3.3,2));
    const brow=-5*Math.exp(-Math.pow((v-41.0)/4.9,2));
    const broadLight=7*broad+2.8*(fine-.5)+1.7*(fx()-.5);
    let r=155+dome+9*round+under+brow+broadLight,g=r-11.3,b=r-28.8;
    const pigment=ink[idx+3]/255;
    if(pigment){
      const drag=12*Math.max(0,(fine-.35)) +14*smooth(.46,.78,med*.72+fine*.28);
      const incident=.78+dome*.006+.10*round;
      const veil=pigment*(.96+.03*(fine-.5));
      r=lerp(r,ink[idx]*incident+drag+1.7*broad,veil);
      g=lerp(g,ink[idx+1]*incident+.69*drag+2*broad,veil);
      b=lerp(b,ink[idx+2]*incident+.44*drag+1.8*broad,veil);
    }
    const tint=(a,R,G,B)=>{r=lerp(r,R,a);g=lerp(g,G,a);b=lerp(b,B,a);};
    const drip=clayField(au*9,3.5);
    if(v>foot-3.2){
      const t=v-foot;const raw=smooth(-1,1.1,t);
      const oxide=Math.exp(-Math.pow((t+.64)/.74,2))*(.32+.56*smooth(.17,.68,med))*(.74+.20*fac);
      tint(oxide,75+8*drip,55+6*drip,35+4*drip);
      const light=169+11*fac+21*broad+8*fine;
      tint(raw*.90,light+5,light-.8,light-14);
      const footStain=clayField(9*au,3.3)*.6+grain(172*au,12)*.4;
      const burnt=Math.exp(-Math.pow((v-(49.08+.26*Math.sin(au*13)+.32*(footStain-.5)))/.66,2))*(.56+.27*med);
      tint(raw*burnt,91+9*broad,72+8*broad,48+7*broad);
      const flank=Math.pow(Math.abs(Math.cos(au*Math.PI)),1.9);
      tint(raw*(.19+.47*flank)*smooth(.56,.77,med*.76+fine*.24),130,104,75);
      const edge=smooth(4.8,6.1,t);tint(edge*.40,92,80,65);
    }
    if(v<lip+2.1){
      const t=clamp(v/lip,0,1);
      const base=193+17*fac+5.7*med+2.1*fine;
      tint(1-smooth(lip-1.0,lip+.55,v),base+3.3,base-.1,base-12.2);
      const downturn=smooth(.41,.99,t)*(1-smooth(lip-.30,lip+1.45,v));
      tint(downturn*(.53+.34*fac),65+broadLight,52+broadLight,40+broadLight);
      const returnLine=Math.exp(-Math.pow((v-lip+.16)/.59,2))*(.26+.32*fac+.13*Math.sin(au*12.5));
      tint(returnLine,57,45,33);
      const spec=(.45+.55*Math.cos(au*Math.PI*3.45-2.2))*(1-.25*med);
      const shine=clamp(spec,0,1)*Math.exp(-Math.pow((v-(1.55+.51*Math.sin(au*11.5)))/.69,2))*.45;
      tint(shine,247,243,227);
    }
    texture[idx]=r;texture[idx+1]=g;texture[idx+2]=b;texture[idx+3]=255;
  }
  // Scan-convert the curved wall. Sampling the same continuous pigment/height
  // field on either side of a mesh edge keeps the glaze free of band seams.
  const out=x.createImageData(P5W,P5H),dst=out.data;
  const visibleSurface=new Path2D();
  // Level-of-detail filtering is only needed where the wall turns edge-on.
  // A smooth line around the foot then covers a fraction of a pixel instead
  // of switching on and off at individual sample centers.
  const mips=[{w:tw,h:th,rgb:texture}];
  while(mips.at(-1).w>1||mips.at(-1).h>1){
    const prev=mips.at(-1),w=Math.ceil(prev.w/2),h=Math.ceil(prev.h/2);
    const rgb=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){
      const a=4*(2*y*prev.w+2*xx),b=a+(2*xx+1<prev.w?4:0);
      const dy=2*y+1<prev.h?prev.w*4:0;
      for(let k=0;k<3;k++)rgb[4*(y*w+xx)+k]=(prev.rgb[a+k]+prev.rgb[b+k]+prev.rgb[a+dy+k]+prev.rgb[b+dy+k])*.25;
    }
    mips.push({w,h,rgb});
  }
  function sample(level,u,v,k){
    const map=mips[level],scale=2**level;
    u=clamp((u+.5)/scale-.5,0,map.w-1);v=clamp((v+.5)/scale-.5,0,map.h-1);
    const i=u|0,j=v|0,a=4*(j*map.w+i)+k,b=a+(i+1<map.w?4:0),dy=j+1<map.h?4*map.w:0;
    return lerp(lerp(map.rgb[a],map.rgb[b],u-i),lerp(map.rgb[a+dy],map.rgb[b+dy],u-i),v-j);
  }
  function vertex(u,v){
    const p=point(u,v);return [p[0]*MS5+P5W/2,p[1]*MS5+P5H/2,u*(tw-1)/440,v*(th-1)/50];
  }
  function tri(a,b,c){
    const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(P5W-1,Math.ceil(Math.max(a[0],b[0],c[0])));
    const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(P5H-1,Math.ceil(Math.max(a[1],b[1],c[1])));
    const bx=b[0]-a[0],by=b[1]-a[1],cx=c[0]-a[0],cy=c[1]-a[1],det=bx*cy-by*cx;
    // At either end the wall curves away from the camera. Its reverse faces
    // project onto the same image pixels as its front, with the foot and lip
    // folded over one another. Only the front side can be seen through the glaze.
    if(det<=1e-6)return;
    visibleSurface.moveTo(a[0],a[1]);visibleSurface.lineTo(b[0],b[1]);
    visibleSurface.lineTo(c[0],c[1]);visibleSurface.closePath();
    const ub=b[2]-a[2],uc=c[2]-a[2],vb=b[3]-a[3],vc=c[3]-a[3];
    const ux=(ub*cy-uc*by)/det,uy=(uc*bx-ub*cx)/det;
    const vx=(vb*cy-vc*by)/det,vy=(vc*bx-vb*cx)/det;
    const dx=Math.hypot(ux,vx),dy=Math.hypot(uy,vy);
    const major=Math.max(dx,dy),dirU=dx>dy?ux:uy,dirV=dx>dy?vx:vy;
    const minor=Math.abs(ux*vy-uy*vx)/Math.max(major,1e-6);
    const lod=clamp(Math.log2(Math.max(1,minor*.83,major/7)),0,mips.length-1);
    const l0=Math.floor(lod),l1=Math.ceil(lod),fraction=lod-l0;
    const taps=clamp(Math.ceil(major/(2**lod)),1,7);
    for(let y=y0;y<=y1;y++)for(let xx=x0;xx<=x1;xx++){
      const rx=xx+.5-a[0],ry=y+.5-a[1],wb=(rx*cy-ry*cx)/det,wc=(bx*ry-by*rx)/det,wa=1-wb-wc;
      if(Math.min(wa,wb,wc)<-.000001)continue;
      const u=clamp(wa*a[2]+wb*b[2]+wc*c[2],0,tw-1.001),v=clamp(wa*a[3]+wb*b[3]+wc*c[3],0,th-1.001);
      const iu=u|0,iv=v|0,fu=u-iu,fv=v-iv,k=4*(iv*tw+iu),d=4*(y*P5W+xx);
      if(major<3.15){
        for(let ch=0;ch<3;ch++)dst[d+ch]=lerp(lerp(texture[k+ch],texture[k+4+ch],fu),lerp(texture[k+4*tw+ch],texture[k+4*tw+4+ch],fu),fv);
      }else{
        for(let ch=0;ch<3;ch++){
          let sum=0;
          for(let n=0;n<taps;n++){
            const offset=(n+.5)/taps-.5,tu=u+dirU*offset,tv=v+dirV*offset;
            sum+=lerp(sample(l0,tu,tv,ch),sample(l1,tu,tv,ch),fraction);
          }
          dst[d+ch]=sum/taps;
        }
      }
      dst[d+3]=255;
    }
  }
  // Extend the first strip under the crown so subpixel filtering of the two
  // cached layers cannot expose the display cloth through their shared seam.
  let lower=Array.from({length:129},(_,k)=>{
    const v=vertex(440*k/128,0);
    v[1]-=MS5*.88*Math.pow(Math.sin(Math.PI*k/128),.42);
    return v;
  });
  for(let j=1;j<=16;j++){
    const next=Array.from({length:129},(_,k)=>vertex(440*k/128,50*j/16));
    for(let k=0;k<128;k++){tri(lower[k],lower[k+1],next[k]);tri(lower[k+1],next[k+1],next[k]);}
    lower=next;
  }
  // Fill the front-facing mesh as a single antialiased path. This gives each
  // outer pixel true partial coverage without blending the texture on the wall.
  const mask=mk(P5W,P5H).getContext('2d',{willReadFrequently:true});
  mask.fill(visibleSurface);
  const coverage=mask.getImageData(0,0,P5W,P5H).data;
  for(let k=0;k<dst.length;k+=4){
    const a=coverage[k+3];
    if(!a||dst[k+3])continue;
    // A pixel can be partly covered even if its center fell outside all triangles.
    // Extend the adjacent front colour to it before setting the coverage alpha.
    const px=(k/4)%P5W,py=Math.floor(k/4/P5W);
    let r=0,g=0,b=0,sum=0;
    for(let row=Math.max(0,py-1);row<=Math.min(P5H-1,py+1);row++)
      for(let col=Math.max(0,px-1);col<=Math.min(P5W-1,px+1);col++){
        const j=4*(row*P5W+col);
        if(!dst[j+3])continue;
        const w=px===col||py===row?2:1;
        r+=w*dst[j];g+=w*dst[j+1];b+=w*dst[j+2];sum+=w;
      }
    if(sum){dst[k]=r/sum;dst[k+1]=g/sum;dst[k+2]=b/sum;}
  }
  for(let k=3;k<dst.length;k+=4)dst[k]=coverage[k];
  x.putImageData(out,0,0);
}
function bodyWall(x){
  const top=PIL.slice(0,61).reverse(),last=top.length-1;
  const arc=[0];
  const floor=top.map(([px,py],i)=>{
    const facing=Math.sin(i*Math.PI/last);
    if(i)arc[i]=arc[i-1]+Math.hypot(px-top[i-1][0],py-top[i-1][1]);
    return [px*(.919+.030*facing)-1.1, py+33.7+25.2*Math.pow(facing,.55)];
  });
  const total=arc[last];
  // Paint onto the unfolded front band. Projection bends every brushstroke with the clay.
  function point(u,v){
    const s=clamp(u/440,0,1)*total;
    let lo=0,hi=last;
    while(hi-lo>1){const mid=(lo+hi)>>1;if(arc[mid]<s)lo=mid;else hi=mid;}
    const w=(s-arc[lo])/(arc[hi]-arc[lo]);
    const level=v/50;
    const tx=lerp(top[lo][0],top[hi][0],w),ty=lerp(top[lo][1],top[hi][1],w);
    const bx=lerp(floor[lo][0],floor[hi][0],w),by=lerp(floor[lo][1],floor[hi][1],w);
    const belly=1+.012*Math.sin(Math.PI*level);
    return [lerp(tx,bx,level)*belly,lerp(ty,by,level)];
  }
  firedWall5(x,point);
}
let PILC=null;
function prepPillow(){const c=mk(P5W,P5H);const x=c.getContext('2d');const T=()=>x.setTransform(MS5,0,0,MS5,P5W/2,P5H/2);T();
  // 化妆土 + 透明釉：米白，边缘略黄，有冰裂和铁斑
  x.save();ptsPath(x,PIL);x.clip();
  slipGround(x,T);perimeterPaint(x);
  // 开光：一粗一细两道线，四面分别回笔。
  pillowReserve5(x);
  // A few fine splits run through the transparent surface. They disperse near
  // the middle; the unmarked ground between the two sprays remains dominant.
  const lines=[
    [[[-170,-39],[-157,-30],[-151,-23],[-143,-15],[-136,-12]],.28,.28],
    [[[-151,-23],[-153,-14],[-152,-9]],.19,.16],
    [[[-123,43],[-106,30],[-92,25],[-81,13]],.18,.17],
    [[[26,67],[19,58],[10,50],[-3,37],[-11,28]],.23,.19],
    [[[19,58],[22,47],[19,39]],.15,.14],
    [[[117,-80],[113,-70],[106,-62],[102,-49]],.20,.16]
  ];
  for(const [knots,width,alpha] of lines){
    const p=curvePts(knots,34);x.lineCap='round';
    for(let n=1;n<p.length;n++){
      const k=n/(p.length-1),light=Math.pow(Math.sin(k*Math.PI),.7);
      x.strokeStyle='rgba(101,72,46,'+(alpha*light)+')';
      x.lineWidth=width*(.65+.35*light);x.beginPath();x.moveTo(...p[n-1]);x.lineTo(...p[n]);x.stroke();
    }
  }
  const speckle=rng(62046);
  for(let k=0;k<19;k++){
    const px=(speckle()-.5)*326,py=-13+(speckle()-.5)*156;
    const w=.13+.44*Math.pow(speckle(),3);
    x.fillStyle='rgba(103,74,43,'+(.13+speckle()*.22)+')';
    x.beginPath();x.ellipse(px,py,w*1.45,w,speckle()*3,0,7);x.fill();
  }
  x.restore();
  // 釉面光泽 + 边缘磨损：明亮薄釉聚在转角，器面大部保留化妆土的温白。
  const face=mk(P5W,P5H);face.getContext('2d').drawImage(c,0,0);
  x.reset();T();bodyWall(x);
  x.setTransform(1,0,0,1,0,0);x.drawImage(face,0,0);T();
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
function drawCizhouFish(c,p,r) {
  const laid=smooth(50.02,50.95,r)*(1-smooth(54.72,56.12,r));
  const magnify=1+.27*laid, length=p.L*magnify;
  const origin=spineAt(p,.45),head=spineAt(p,0);
  const ink='rgba(53,37,26,.91)', deep='#35271d', dilute='rgba(89,65,45,.76)';
  const weak='rgba(122,86,60,.34)';
  function pt(u,v) {
    const pos=spineAt(p,u),end=Math.max(0,u-1);
    // A slight droop at the snout and an upturned fork follow the profile painted on the pillow.
    const h=(v*.86+.047*u*u-.057*(1-smooth(0,.37,u)))*p.L;
    const x=pos.x+pos.nx*h-pos.tx*end*p.L,y=pos.y+pos.ny*h-pos.ty*end*p.L;
    return [origin.x+(x-origin.x)*magnify+head.tx*20*laid,
            origin.y+(y-origin.y)*magnify+head.ty*20*laid];
  }
  const map=points=>points.map(q=>pt(q[0],q[1]));
  // Interpolate in body space so fine lines travel with the same changing spine.
  const shaped=points=>curvePts(points,Math.max(16,points.length*5));
  function append(points) {
    const ps=map(points);c.moveTo(...ps[0]);
    for(let i=1;i<ps.length;i++)c.lineTo(...ps[i]);
    c.closePath();
  }
  function path(points) {c.beginPath();append(points);}
  function polygon(points,paint) {path(shaped(points));c.fillStyle=paint;c.fill();}
  function progress(start,duration) {return clamp((r-start)/duration);}
  function stroke(points,width,color,start,duration,taper=.75, touch=0) {
    const q=progress(start,duration);
    if(q<=0)return;
    const ps=shaped(points),count=Math.max(2,Math.ceil((ps.length-1)*q)+1);
    const pointsAt=Array.from({length:count},(_,i)=>{
      const pos=i/(count-1)*q*(ps.length-1);
      const j=Math.min(ps.length-2,Math.floor(pos)),f=pos-j;
      return pt(lerp(ps[j][0],ps[j+1][0],f),lerp(ps[j][1],ps[j+1][1],f));
    });
    const left=[],right=[],fringe=[];
    for(let i=0;i<count;i++){
      const prev=pointsAt[Math.max(0,i-1)],next=pointsAt[Math.min(count-1,i+1)];
      const dx=next[0]-prev[0],dy=next[1]-prev[1],norm=Math.hypot(dx,dy)||1;
      const u=i/(count-1)*q;
      const pressure=(1-taper+.70*taper*Math.pow(Math.sin(Math.PI*u),.54)+.30*taper*(1-u));
      const tooth=1+.085*Math.sin(7.1*u+touch)+.045*Math.sin(19*u-2*touch);
      const half=width*length*.5*pressure*tooth;
      const xy=pointsAt[i],ax=-dy/norm,ay=dx/norm;
      left.push([xy[0]+ax*half,xy[1]+ay*half]);
      right.push([xy[0]-ax*half,xy[1]-ay*half]);
      fringe.push([xy[0]+ax*(half*1.28+.09),xy[1]+ay*(half*1.28+.09)]);
    }
    function fillRibbon(a,b){
      c.beginPath();c.moveTo(...a[0]);
      for(let i=1;i<a.length;i++)c.lineTo(...a[i]);
      for(let i=b.length-1;i>=0;i--)c.lineTo(...b[i]);
      c.closePath();c.fill();
    }
    if(Array.isArray(color)){
      const a=pointsAt[0],b=pointsAt[pointsAt.length-1];
      const loaded=c.createLinearGradient(a[0],a[1],b[0],b[1]);
      loaded.addColorStop(0,color[0]);loaded.addColorStop(.42,color[1]);
      loaded.addColorStop(.74,color[1]);loaded.addColorStop(1,color[2]);c.fillStyle=loaded;
    }else c.fillStyle=color;
    c.save();c.globalAlpha*=.18;fillRibbon(fringe,right);c.restore();
    fillRibbon(left,right);
  }
  function wash(points,color,start,duration) {
    const q=progress(start,duration);
    if(q<=0)return;
    c.save();
    if(q<1) {
      let lo=1.2,hi=0;
      for(const v of points){lo=Math.min(lo,v[0]);hi=Math.max(hi,v[0]);}
      const edge=lerp(lo-.003,hi+.003,q);
      const clip=[];for(let i=0;i<=12;i++)clip.push([lerp(lo-.008,edge,i/12),.4]);
      for(let i=12;i>=0;i--)clip.push([lerp(lo-.008,edge,i/12),-.4]);
      path(clip);c.clip();
    }
    polygon(points,color);c.restore();
  }
  const back=[[.212,.058],[.260,.087],[.355,.103],[.45,.100],[.563,.084],
    [.644,.064],[.721,.050],[.772,.046],[.822,.061]];
  const belly=[[.211,-.060],[.265,-.085],[.353,-.098],[.446,-.090],[.539,-.077],
    [.642,-.053],[.747,-.026],[.795,-.012],[.825,-.005]];
  const hull=back.concat(belly.slice().reverse());
  // The low forehead and deep eye sit in a single bank of dark iron pigment.
  const crown=[[.002,.008],[.020,.021],[.050,.030],[.095,.034],[.148,.047],[.189,.064],
    [.224,.077],[.246,.072],[.243,.054],[.222,.030],[.193,.020],[.174,.009],[.161,-.015],
    [.137,-.032],[.105,-.035],[.077,-.024],[.057,-.014],[.050,.003],[.031,.007],[.008,-.004]];
  const gill=[[.133,-.051],[.159,-.057],[.184,-.055],[.210,-.035],[.228,-.008],[.239,.028],[.236,.051]];
  const lip=[[.006,-.006],[.026,-.007],[.046,-.025],[.062,-.038],[.048,-.037],[.025,-.023],[.008,-.014]];
  const chin=[[.006,-.038],[.039,-.040],[.071,-.049],[.110,-.053],[.154,-.052],[.183,-.046]];
  const backFin=[[.412,.097],[.453,.121],[.505,.150],[.575,.171],[.556,.152],[.512,.118],[.49,.096]];
  const tailTop=[[.793,.035],[.821,.065],[.850,.109],[.885,.146],[.909,.154],[.938,.153],
    [.929,.137],[.924,.126],[.919,.125],[.912,.113],[.913,.108],[.900,.087],[.879,.059],[.845,.032],[.817,.018]];
  const lowerTail=ps=>ps.map(([u,v])=>[u,v-.019*smooth(.845,1.018,u)]);
  const tailLow=lowerTail([[.801,.003],[.848,.006],[.899,.027],[.955,.031],[.984,.042],[1.018,.047],
    [1.008,.036],[.979,.020],[.943,.008],[.896,-.006],[.847,-.018],[.81,-.021]]);
  c.save();
  const shadow=(1-smooth(51.06,51.95,r))*.12;
  if(shadow>.001){
    c.save();c.fillStyle='#947655';c.globalAlpha*=shadow;
    for(const shape of [hull,crown,tailTop,tailLow,backFin]){path(shaped(shape));c.fill();}
    c.restore();
  }
  // As the painted fish lifts from the pillow the uninked flank takes on a
  // little body of its own. Follow the spine through the gill plate and stop
  // above the jaw opening and before the fork: neither gap travels as slip.
  const lifted=smooth(55.55,56.85,r)*(1-smooth(61.70,62.70,r));
  if(lifted>0){
    const nape=[[.058,.009],[.092,.021],[.143,.037],[.183,.052]];
    const cheek=[[.064,-.010],[.082,-.028],[.112,-.046],[.148,-.055],[.177,-.051]];
    const dorsal=nape.concat(back.slice(0,-1),[[.813,.047]]);
    const ventral=cheek.concat(belly.slice(0,-1),[[.815,.001]]);
    const from=pt(.43,.112),to=pt(.43,-.101);
    const ceramic=c.createLinearGradient(from[0],from[1],to[0],to[1]);
    ceramic.addColorStop(0,'#aa9e89');ceramic.addColorStop(.27,'#bdb19a');
    ceramic.addColorStop(.64,'#cec1aa');ceramic.addColorStop(1,'#c4b7a1');
    function surface(inset,alpha){
      const inside=(ps,side)=>ps.map(([u,v])=>[u,v-side*inset*smooth(.063,.22,u)*(1-smooth(.67,.815,u))]);
      c.save();c.globalAlpha*=lifted*alpha;
      polygon(inside(dorsal,1).concat(inside(ventral,-1).reverse()),ceramic);c.restore();
    }
    surface(.001,.43);
    surface(.005,.91);
  }
  wash(hull,'rgba(126,94,57,.068)',51.28,.40);
  wash(crown,deep,51.0,.22);
  stroke([[.008,.007],[.055,.022],[.112,.030],[.169,.050],[.221,.065],[.237,.068]],
         .011,'rgba(114,77,46,.42)',51.13,.15,.78,.6);
  wash([[.050,.015],[.089,.026],[.155,.041],[.198,.052],[.187,.033],[.152,.017],
    [.115,.010],[.080,.012]],'rgba(85,63,46,.40)',51.12,.18);
  wash([[.054,.015],[.067,.019],[.091,.019],[.115,.021],[.139,.030],[.160,.035],
    [.144,.024],[.118,.015],[.098,.012]],'rgba(149,106,65,.22)',51.14,.13);
  stroke([[.079,.026],[.111,.030],[.140,.035],[.160,.041]],
    .0042,'rgba(158,119,77,.22)',51.15,.13,.91);
  wash(lip,'rgba(69,47,31,.88)',51.13,.15);
  stroke(chin,.0067,ink,51.16,.22,.82);
  stroke([[.018,-.036],[.036,-.028],[.058,-.039]],.0045,dilute,51.17,.12);
  stroke([[.079,-.026],[.110,-.037],[.140,-.035],[.167,-.019]],.0043,dilute,51.21,.12,.81);
  stroke(gill,.0091,ink,51.26,.19,.79,1.7);
  stroke([[.177,-.062],[.198,-.057],[.223,-.040],[.245,-.009],[.254,.020]],
    .0052,dilute,51.34,.17,.91,1.1);
  stroke(back,.0071,ink,51.27,.40,.66);
  // The stip of the belly is left open. Rather short, washed segments run
  // out on the slip, then the tips of the diagonal strokes carry the edge.
  stroke(belly.slice(0,3),.0038,'rgba(97,71,46,.61)',51.33,.21,.92,1.1);
  stroke([[.534,-.078],[.586,-.066],[.626,-.055]],.0028,'rgba(111,81,52,.45)',51.56,.10,.93);
  stroke(belly.slice(-3),.0035,'rgba(86,61,39,.62)',51.63,.10,.87);

  // Each fin has a loaded root and one lifted margin; the narrow return on
  // a ventral fin does not receive the same pressure as an upper tail quill.
  function fin(outline,rays,tone,weight,at,duration) {
    wash(outline,tone,at,duration);
    const tipIndex=Math.floor(outline.length/2);
    stroke(outline.slice(0,tipIndex+1),.0080*weight,ink,at,duration*.83,.69,at);
    stroke(outline.slice(tipIndex).concat([outline[0]]),.0048*weight,dilute,
      at+.04,duration*.9,.88,at+2);
    rays.forEach(([pts,width,col],i)=>stroke(pts,width*weight,col,at+.025+.012*i,duration*.80,.94,i+at));
  }
  fin(backFin,[
    [[[.43,.103],[.469,.129],[.524,.150],[.556,.160]],.0068,ink],
    [[[.452,.103],[.490,.130],[.539,.153]],.0038,dilute]
  ],'rgba(129,99,64,.35)',.86,51.72,.18);
  const fins=[
    {o:[[.228,-.054],[.213,-.076],[.186,-.097],[.153,-.125],[.139,-.123],[.15,-.100],[.182,-.068],[.205,-.061]],
     rays:[[[[.202,-.072],[.175,-.097],[.147,-.117]],.0048,dilute]],tone:'rgba(112,76,44,.44)',weight:.81,at:51.96},
    {o:[[.212,-.061],[.233,-.039],[.260,-.019],[.299,-.009],[.344,-.010],
       [.323,-.026],[.299,-.047],[.269,-.062],[.242,-.069],[.221,-.069]],
     rays:[[[[.230,-.068],[.259,-.052],[.295,-.038]],.0038,dilute]],tone:'rgba(148,111,72,.64)',weight:.88,at:52.0},
    {o:[[.358,-.076],[.343,-.099],[.322,-.119],[.299,-.133],[.284,-.132],
       [.286,-.116],[.303,-.101],[.329,-.090]],
     rays:[],tone:'rgba(150,111,68,.60)',weight:.72,at:52.04},
    {o:[[.431,-.069],[.461,-.052],[.502,-.044],[.542,-.044],[.562,-.045],
       [.548,-.060],[.516,-.081],[.472,-.090],[.438,-.080]],
     rays:[[[[.449,-.084],[.490,-.077],[.539,-.059]],.0032,dilute]],tone:'rgba(140,104,64,.65)',weight:.89,at:52.10},
    {o:[[.639,-.029],[.658,-.054],[.675,-.075],[.704,-.092],[.738,-.099],
       [.742,-.098],[.727,-.085],[.706,-.071],[.675,-.054],[.650,-.031]],
     rays:[],tone:'rgba(144,104,60,.61)',weight:.72,at:52.16}
  ];
  for(const f of fins)fin(f.o,f.rays,f.tone,f.weight,f.at,.12);
  fin(tailTop,[
    [[[.814,.033],[.842,.074],[.879,.122],[.929,.153]],.0110,ink],
    [[[.828,.026],[.857,.068],[.891,.114],[.936,.149]],.0068,'rgba(83,52,34,.88)'],
    [[[.843,.029],[.875,.068],[.903,.102],[.919,.122]],.0045,dilute]
  ],'rgba(113,80,47,.45)',1.08,52.20,.14);
  fin(tailLow,[
    [lowerTail([[.815,-.010],[.857,-.005],[.919,.013],[.979,.032]]),.0079,ink],
    [lowerTail([[.842,-.015],[.884,-.009],[.941,.007],[.999,.037]]),.0054,dilute]
  ],'rgba(125,89,53,.34)',.91,52.34,.14);

  wash([[.809,.032],[.832,.061],[.854,.10],[.874,.115],[.864,.098],[.843,.052],[.825,.033]],
       'rgba(65,47,28,.69)',52.26,.115);
  stroke([[.899,.127],[.907,.138],[.922,.146],[.939,.153]],.0060,ink,52.31,.08,.89);
  stroke(lowerTail([[.933,.024],[.956,.028],[.976,.028],[.989,.035]]),.0033,dilute,52.39,.08,.90);
  // The tail stock receives the sweep before the brush splits into two tips.
  // The three short, unequal marks touch the farthest row of lozenges.
  wash([[.791,.047],[.804,.053],[.824,.061],[.841,.079],[.832,.052],
    [.819,.026],[.802,.017]],'rgba(81,56,35,.56)',52.34,.10);
  stroke([[.788,.003],[.809,.000],[.833,.004],[.861,.006]],
    .0084,'rgba(80,54,32,.65)',52.37,.10,.88);
  stroke([[.644,-.034],[.651,-.047],[.672,-.067]],.0081,'rgba(104,76,48,.58)',52.16,.12,.91);
  wash([[.223,-.065],[.239,-.056],[.265,-.048],[.285,-.043],[.258,-.061],[.235,-.069]],
    'rgba(118,84,53,.38)',52.12,.12);
  wash([[.440,-.086],[.465,-.076],[.484,-.071],[.506,-.067],[.482,-.080],[.452,-.089]],
    'rgba(110,74,44,.39)',52.13,.11);
  // Two separate, slightly bowed sets of iron strokes. Each family follows
  // the same shallow flank but has its own cadence, contact and lifted end.
  if(r>53.35){
    c.save();path(shaped(hull));c.clip();
    c.beginPath();append([[0,-.25],[1,-.25],[1,.28],[0,.28]]);
    for(const k of [1,3,4])append(shaped(fins[k].o));
    c.clip('evenodd');
    const variation=(i,k)=>Math.sin(i*31.3+k*19.1)*.65+Math.sin(i*8.71+k*.93)*.35;
    // Bound the brush by both contours before mapping it to the live spine.
    // Cropping longer uniform strokes to the outline leaves a fence of blunt ends.
    function edgeAt(x,edge) {
      let k=1;while(k<edge.length-1&&edge[k][0]<x)k++;
      const a=edge[k-1],b=edge[k];
      return lerp(a[1],b[1],clamp((x-a[0])/(b[0]-a[0])));
    }
    for(let family=0;family<2;family++){
      let u=.112+(family?.011:0),i=0;
      while(u<.96){
        const loading=variation(i+1,2+family),long=family===0;
        const taper=smooth(.43,.88,u),base=long?.81:-.64;
        const slope=base*(1+.12*loading+.17*Math.sin(u*8+.55*family));
        const bow=(long?.006:-.004)+.0045*variation(i,6+family);
        const sway=.0027*variation(i+1,5+family);
        const shift=(v,s)=>v*slope+bow*Math.sin(s*Math.PI)+sway*Math.sin(2*Math.PI*s);
        let low=-.08,high=.08;
        for(let j=0;j<4;j++){
          low=edgeAt(u+shift(low,0),belly);high=edgeAt(u+shift(high,1),back);
        }
        const from=low+(i%6===2?.006:.001)+.0050*variation(i,3+family);
        const to=high+.0028*variation(i+.5,8+family);
        const pts=[];
        for(let k=0;k<=8;k++){
          const s=k/8,v=lerp(from,to,s),cross=u+shift(v,s);
          pts.push([cross,v]);
        }
        // Both passes tend to leave the belly in short, lifted tails. Some
        // were laid thin; neighbouring diagonals at the shoulder hold more iron.
        pts.reverse();
        const weight=(long?.0066:.0050)*(1-.21*taper)*(1+.34*variation(i,7+family));
        const inked=long?['rgba(56,39,27,.96)','rgba(59,43,30,.85)','rgba(67,45,32,.91)','rgba(65,48,34,.89)']:
          ['rgba(70,49,34,.86)','rgba(72,52,38,.78)','rgba(63,46,33,.84)','rgba(82,60,41,.72)'];
        stroke(pts,weight,[inked[(i+1)%4],inked[i%4],long?'rgba(92,64,43,.70)':'rgba(99,72,49,.60)'],53.36+.011*i+.22*family,.096,.85,i+family);
        if(i%6===2&&u>.255&&u<.74){
          const pts2=pts.slice(0,4).map(([x,y],j)=>[x+.002*(1-j/4),y]);
          stroke(pts2,weight*.59,'rgba(86,61,42,.42)',53.36+.011*i+.22*family,.06,.94,i);
        }
        u+=(.0335-.0105*taper)*(1+.17*variation(i,3+family)+.07*Math.sin(i*.85+family));i++;
      }
    }
    c.restore();
  }
  // The short loaded turn at the shoulder and belly is carried over the
  // hatching; the broader, lighter middles are left intact.
  stroke([[.211,-.056],[.225,-.061],[.247,-.065],[.261,-.061]],.0088,
    ['rgba(106,70,41,.91)','rgba(102,69,42,.74)','rgba(126,94,65,.31)'],53.72,.10,.91);
  stroke([[.432,-.068],[.445,-.076],[.466,-.080],[.488,-.079]],.0086,
    ['rgba(100,68,42,.86)','rgba(114,80,49,.71)','rgba(128,91,56,.33)'],53.76,.09,.90);
  stroke([[.637,-.026],[.649,-.040],[.659,-.054],[.684,-.071]],.0062,
    ['rgba(84,59,36,.78)','rgba(97,67,40,.76)','rgba(135,99,60,.44)'],53.79,.10,.91);
  // A single broken crescent is rolled around the pupil. Enough brown shows
  // through the lower lid to keep the mark in the painter's dark cheek.
  stroke([[.192,.028],[.189,.011],[.172,-.011],[.148,-.030]],
    .010,'rgba(155,121,80,.42)',53.36,.12,.88);
  stroke([[.120,-.040],[.151,-.040],[.178,-.025]],.0050,dilute,53.40,.08,.82);
  wash([[.065,-.006],[.071,.002],[.081,.007],[.094,.007],[.103,.003],[.106,-.005],
    [.100,-.013],[.091,-.017],[.080,-.016],[.071,-.012]],
    '#b09c7b',54.18,.070);
  wash([[.075,-.005],[.079,.000],[.087,.002],[.095,-.0005],[.098,-.004],[.092,-.009],[.082,-.010]],
    'rgba(57,40,27,.95)',54.216,.061);
  stroke([[.065,-.011],[.078,-.017],[.097,-.016]],.0028,
    'rgba(183,157,119,.73)',54.23,.048,.93);
  c.restore();
}
function clayLine5(c,points,full,pressure,width,colour,grain,t=1){
  const last=points.length-1;
  if(last<1||t<=0)return;
  const distance=[0];
  for(let i=1;i<=last;i++)distance.push(distance[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  const limit=distance[last]*clamp(t),edge=[],back=[];
  for(let i=0;i<=last;i++){
    let [x,y]=points[i],s=distance[i];
    if(i&&s>limit){
      const part=(limit-distance[i-1])/(s-distance[i-1]);
      x=lerp(points[i-1][0],x,part);y=lerp(points[i-1][1],y,part);s=limit;
    }
    const v=s/distance[last], prev=points[Math.max(0,i-1)],next=points[Math.min(last,i+1)];
    const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
    const u=v*(pressure.length-1),k=Math.min(pressure.length-2,Math.floor(u)),f=u-k;
    const force=lerp(pressure[k],pressure[k+1],f*f*(3-2*f));
    const irregular=full?1+.055*Math.sin(s*.19+grain)+.038*Math.sin(s*.53+grain*.8):1;
    const w=width*force*irregular/2,slant=.085*Math.sin(grain*.83+v*5.2);
    edge.push([x-dy/len*w*(1+slant),y+dx/len*w*(1+slant)]);
    back.push([x+dy/len*w*(1-slant),y-dx/len*w*(1-slant)]);
    if(s>=limit)break;
  }
  if(edge.length<2)return;
  c.fillStyle=colour;c.beginPath();c.moveTo(...edge[0]);
  for(let j=1;j<edge.length;j++)c.lineTo(...edge[j]);
  for(let j=back.length-1;j>=0;j--)c.lineTo(...back[j]);c.closePath();c.fill();
}
function reserveCurve5(start,triplets){
  const pts=[start];
  for(const [x1,y1,x2,y2,x3,y3] of triplets){
    const [x0,y0]=pts.at(-1);
    const count=Math.max(5,Math.ceil((Math.hypot(x1-x0,y1-y0)+Math.hypot(x2-x1,y2-y1)+Math.hypot(x3-x2,y3-y2))/2.1));
    for(let n=1;n<=count;n++){
      const v=n/count,s=1-v;
      pts.push([s*s*s*x0+3*s*s*v*x1+3*s*v*v*x2+v*v*v*x3,s*s*s*y0+3*s*s*v*y1+3*s*v*v*y2+v*v*v*y3]);
    }
  }
  return pts;
}
function pillowReserve5(c){
  // Upper run, right shoulder, lower run and left shoulder have independent
  // brush joins. A short overlap rounds the turn around a cusp.
  const lines=[
    [[-81,-70.8],[[-78.5,-75.3,-73.5,-77.9,-65,-78.6],[-45,-80.2,-20,-77.8,-7,-79.8],[-3,-80.0,-.9,-81.3,.6,-81.4],[3.6,-80.4,7.7,-78.9,19,-78.7],[35,-78.6,62,-79.0,72,-76.5],[77,-75.0,80.5,-72.7,82.1,-70.0]]],
    [[80.8,-70.1],[[99,-71.1,112.7,-64.2,123,-52.8],[131,-43.8,135,-31.1,134.6,-24.6],[134.4,-21.5,132.8,-17.8,130.6,-14.7],[129.9,-13.2,129.8,-13.1,130.6,-12.6],[136,-9.8,137.1,-2.2,135.8,4.9],[132.8,18.6,122.3,31.1,109.4,36.5],[99.6,40.9,91.9,42.3,83.1,41.6]]],
    [[83.8,41.9],[[81,45.9,77.8,47.9,72,49.0],[55.8,52.2,34,49,17.4,50.2],[9.8,50.7,3.2,50.7,-.5,49.7],[-3.2,49.4,-4.4,49,-7,49.5],[-21,51.2,-43,50.9,-58,50.1],[-70.4,49.9,-76.2,48.0,-80.1,42.6]]],
    [[-80.2,42.3],[[-92.8,44.1,-103,40.1,-113,34.6],[-125,26.4,-133.5,14.2,-134.5,2.3],[-134.7,-3.4,-132.5,-10.9,-129.9,-13.9],[-129.5,-14.5,-129.3,-14.7,-130.3,-15.7],[-135.6,-22.6,-133.1,-38.0,-126.5,-48.5],[-118.6,-63.6,-98.3,-72.0,-80.2,-70.7]]]
  ];
  for(let id=0;id<lines.length;id++){
    const [start,turns]=lines[id],pts=reserveCurve5(start,turns);
    // The parallel pull changes distance as the hand turns round a shoulder.
    // It taps out just before the other pull at a few joins.
    const adjacent=pts.map(([x,y],i)=>{
      const z=i/(pts.length-1),crown=Math.sin(.95+z*6+id*1.3);
      const sx=1.037+.008*crown,sy=1.05+.009*Math.sin(z*8+id*.85);
      return [x*sx+.45*Math.sin(z*4.2+id),-14+(y+14)*sy+.40*Math.sin(z*6.8+id*2.2)];
    });
    const flow=[[.25,.92,.79,.62,.92,.73,.65,.52],[.76,.91,.68,.73,1.0,.83,.64,.49],
      [.59,1.0,.74,.79,.67,.89,.64,.23],[.30,.75,.95,.56,.75,.96,.78,.82]][id];
    clayLine5(c,pts,true,flow,1.68,id%2?'#473326':'#403025',id+2);
    clayLine5(c,adjacent,true,id%2?[.05,.64,.85,.45,.9,.75,.22]:[.10,.80,.63,.91,.63,.90,.13],.97,'#59432f',9+id);
  }
  for(const xs of [-1,1])for(const ys of [-1,1]){
    const pts=[];
    const back=ys<0,late=(xs===1?.016:-.017)+(back?.015:-.012);
    for(let j=0;j<60;j++){
      const n=j/59,th=1.387+.022*xs-(1.125+late)*n;
      const a=Math.atan2(ys*Math.sin(th),xs*Math.cos(th)),phase=(a/(Math.PI*2)+1)%1*(PIL.length-1);
      const i=Math.floor(phase),d=phase-i;
      const x=lerp(PIL[i][0],PIL[i+1][0],d),y=lerp(PIL[i][1],PIL[i+1][1],d);
      pts.push([x*(.856+.005*Math.sin(th*2.6+.1*ys)),-14+(y+14)*(.853+.006*Math.sin(th*4.5+xs))]);
    }
    clayLine5(c,pts,true,[.025,.54,.92,.83,1,.79,.62,.12],1.85,'#412e21',11+ys+xs);
  }
  // Two opposing strings of comma strokes. Short dabs and open curls crowd
  // the centres; a narrow negative nick remains in the heavier impressions.
  const panels=[
    [-1.2,-90.2,.012,1.05,15,1.0],[-.5,60.3,-.012,1.10,15,.93],
    [-148,-14.7,-Math.PI/2,1.06,12,.94],[147.6,-13.6,Math.PI/2,1.02,13,.96]
  ];
  panels.forEach(([x,y,angle,scale,n,sy],row)=>{
    c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,sy);
    const types=row%2===0
      ? [0,1,4,2,3,2,3,4,3,2,5,2,4,1,0]
      : [0,1,2,4,3,5,2,3,4,2,3,2,1,4,0];
    let pos=-2.04*(n-1);
    for(let j=0;j<n;j++){
      const v=j/(n-1),g=Math.sin(Math.PI*v),r=1.27+g*.76+.14*Math.sin(j*1.92+row);
      const facing=j<n*(row%2===0?.50:.46)?1:-1,k=types[Math.round(v*(types.length-1))];
      c.save();c.translate(pos,.35*Math.sin(j*1.13+row)-.55*g);
      c.rotate(.22*Math.sin(1.77*j+row)+.08*facing);c.scale(r*facing,r);
      const strokes=[
        [[.50,-.91],[[.17,-.88,-.38,-.34,-.43,.29],[-.48,.50,-.40,.70,-.39,.77]]],
        [[.77,-.88],[[.13,-1.00,-.74,-.55,-.79,.06],[-.85,.54,-.47,.77,-.27,.83]]],
        [[.83,-.15],[[.97,-.77,.04,-1.04,-.53,-.75],[-1.08,-.45,-.85,.38,-.44,.64],[-.12,.87,.52,.76,.66,.49]]],
        [[.76,.54],[[.98,-.14,.85,-.78,.03,-.89],[-.82,-1.03,-1.04,-.22,-.87,.23],[-.59,.90,.46,.78,.48,.27],[.54,-.17,.13,-.25,-.02,-.12]]],
        [[.85,-.77],[[.37,-1.05,-.71,-.86,-.86,-.18],[-1.07,.38,-.53,.83,-.05,.75],[.22,.64,.42,.50,.56,.25]]],
        [[.98,.39],[[1.03,-.46,.43,-1,-.29,-.9],[-.85,-.79,-1.06,-.20,-.77,.29],[-.49,.79,.12,.96,.50,.57],[.75,.35,.78,.07,.59,-.14]]]
      ];
      const [tip,curves]=strokes[k],pts=reserveCurve5(tip,curves);
      const weight=(.48+.24*g+.09*Math.sin(j*.90+row));
      clayLine5(c,pts,false,k<2?[.10,.99,.83,.16]:[.20,.82,1.17,.87,.58,.12],weight,k===0?'#69503b':'#493222',j+row);
      c.restore();pos+=4.11+.42*Math.cos(j*1.77+row)+.24*Math.sin(j*.69);
    }
    c.restore();
  });
}
const LEAVES5=[[[[-126.2,-44.4],[-127.1,-42.1],[-126.5,-39.4],[-123.5,-37.2]],1.45,1,0],[[[-124.8,-46.7],[-124.3,-41.5],[-120,-37.7],[-116.5,-36.1]],1.72,2,0.015],[[[-123.9,-47.2],[-121.8,-42.6],[-115.2,-37.2],[-107,-34.1]],1.48,2,0.028],[[[-122.7,-49.1],[-117.3,-42.9],[-108.5,-38.5],[-98.8,-35.4],[-90,-30.9]],1.71,0,0.041],[[[-121.3,-50.5],[-116.4,-44.9],[-104.8,-39.6],[-91.7,-35.5],[-76.1,-32.7],[-68,-28]],1.44,2,0.064],[[[-118.7,-50.6],[-111,-44],[-98.4,-40.3],[-85,-36.1],[-69.7,-31.1],[-56.4,-24.3]],1.46,1,0.083],[[[-106.7,-41.1],[-96,-38.2],[-82,-35.4],[-66,-28.8],[-55.6,-21]],1.24,3,0.101],[[[-117,-49.5],[-109.8,-41.8],[-95.2,-36.2],[-78,-29.6],[-64,-21]],1.07,0,0.105],[[[-121.7,-52.6],[-115.6,-47.6],[-103.7,-43.2],[-83,-41.4],[-62,-43.6],[-34.2,-45.8]],1.56,2,0.105],[[[-119.1,-54.2],[-111.8,-49],[-101.4,-45.5],[-82,-44.6],[-63.9,-46.4],[-47.7,-48.8],[-25.2,-50.4],[-12.8,-51.3]],1.84,0,0.13],[[[-117.3,-55.9],[-109.1,-49.3],[-94.6,-47.5],[-74,-46.1],[-43,-48.6],[-16,-49.3],[9,-52],[33,-52.6]],1.46,3,0.151],[[[-117.5,-56.7],[-110.3,-50.4],[-98,-48.7],[-75.6,-49.3],[-51,-53.1],[-22,-56.8],[9.4,-60.3],[33.8,-61.1],[60,-58.4]],2.19,4,0.173],[[[-113.2,-58],[-105,-52.4],[-94,-51.4],[-78,-52.5],[-53,-56.7],[-23,-60.5],[3,-63.3],[24,-65.5],[44.5,-67.6]],2.31,3,0.196],[[[-111.8,-60.3],[-102.8,-55],[-94.3,-54.4],[-83.2,-55.5],[-70.2,-56.8],[-60,-57]],1.38,0,0.217],[[[-108.5,-61.7],[-102.3,-58.4],[-92.2,-56.3],[-77.2,-59.3],[-65,-63.6]],1.77,4,0.233],[[[-106.6,-62.8],[-102.6,-61],[-97.2,-60.2],[-88.3,-62.3]],1.27,3,0.243],[[[-83,-46.9],[-69,-50.2],[-54.5,-55.1],[-44,-57],[-32,-63.5]],1.47,0,0.257],[[[-63,-51.8],[-45,-51.6],[-26.6,-52.9],[-12.5,-56.6],[-1.2,-58.6]],1.04,1,0.268],[[[-29.5,2],[-30.4,4.7],[-29.1,7.2]],1.33,2,0.27],[[[-25.6,5],[-24.7,8.3],[-21.5,12.2]],1.38,1,0.287],[[[-21.7,5.4],[-18.1,10],[-12.2,14.3],[-6.7,18.4]],1.33,0,0.298],[[[-19.6,8.3],[-15.3,12.6],[-9,16],[0.7,19.1],[7.4,22.7]],1.51,2,0.312],[[[-17.2,8.9],[-12.4,12.8],[-4,16.2],[6,18.9],[18.9,23.2]],1.25,1,0.333],[[[-14.1,10],[-5.1,16.9],[9.1,23.6],[22.9,28.4],[37.8,32.3]],1.8,3,0.344],[[[-11.8,11.5],[-3.7,17.4],[12.3,23.6],[34.8,28.5],[57.8,29.2],[80.7,27.5],[98.5,25.6],[111,23.5]],1.97,3,0.355],[[[-8.2,12],[1.6,16.8],[18.9,20.5],[37.6,22.1],[62.5,22.4],[83.9,19.9],[106.8,15.4],[120.7,13.5]],2.12,4,0.37],[[[-3.4,12.9],[6.7,16.9],[18.3,18.5],[35.5,18.5],[53,15.9]],1.7,0,0.392],[[[-2,15.2],[8.5,18.7],[20,19.7],[35,21.2],[48.9,21.3]],1.23,2,0.41],[[[31.4,21.5],[46,22.9],[62,22.1],[75.4,19.9],[86.4,18.1]],1.68,0,0.428],[[[49,27.9],[64,27.4],[78.2,24.6],[93.3,22.2]],1.18,2,0.45]];
function drawWater5(c,t,hp){
  const clock=TNOW,alive=smooth(T5LIVE-.10,T5LIVE+.8,clock);
  c.save();c.translate(S5X,S5Y+6);ptsPath(c,PIL);c.clip();c.globalCompositeOperation='multiply';
  const head=hp?spineAt(hp,0):null,hx=head?head.x-S5X:-500,hy=head?head.y-S5Y-6:-500;
  const profiles=[
    [.29,.70,.89,1.05,.87,.67,.37,.03],
    [.12,.83,1.04,.85,.68,.42,.22,.025],
    [.21,1.06,.92,.83,.60,.45,.25,.035],
    [.22,.77,.87,.67,.50,.57,.81,1.04,.03],
    [.15,.66,.81,.67,.58,.76,1.15,.86,.045],
  ];
  const colors=['#493325','#4e3829','#38291f','#453224','#33271e','#563f2d'];
  LEAVES5.forEach(([knots,width,form,delay],i)=>{
    const q=clamp((clock-52.62-delay)/(.105+Math.min(.13,(knots.length-2)*.019)));if(!q)return;
    const pts=curvePts(knots,Math.max(15,7*knots.length)),tip=pts[pts.length-1];
    const push=alive*Math.exp(-((tip[0]-hx)**2+(tip[1]-hy)**2)/930);
    for(let j=1;j<pts.length;j++){
      const u=j/(pts.length-1),free=Math.pow(u,1.55);
      pts[j][1]+=free*(alive*(i<18?.84:1.20)*Math.sin(clock*1.68+1.6*u+i*.23)+push*1.18);
    }
    const pigment=c.createLinearGradient(pts[0][0],pts[0][1],tip[0],tip[1]);
    const dry=i%4===0||i%7===2;
    pigment.addColorStop(0,colors[(i+1)%colors.length]);
    pigment.addColorStop(.31,colors[i%colors.length]);
    pigment.addColorStop(.56,dry?'#6c5139':colors[(i+2)%colors.length]);
    pigment.addColorStop(.78,dry?'#57412f':colors[i%colors.length]);
    pigment.addColorStop(1,dry?'#786043':'#503b2b');
    clayLine5(c,pts,true,profiles[form],width,pigment,i,q);
  });
  const water=[
    [[[-123,-14.0],[-124,-12.4],[-123.4,-10.5],[-124,-8.6],[-120.4,-6.3],[-117.5,-6]],.83],
    [[[-114.6,-14.5],[-116,-13.0],[-114.2,-11.0],[-114.4,-8.6],[-110.7,-7.2],[-107.4,-6.4]],.94],
    [[[-88.1,-3.6],[-89,-1.9],[-87.4,.9],[-81.7,2.0],[-77.7,3.1]],.71],
    [[[-63.1,0.5],[-64,2.4],[-61.1,4.1],[-56,4.6],[-51.2,4.2]],.79]
  ];
  water.forEach(([knots,w],i)=>{
    const q=clamp((clock-53.13-.045*i)/.11);
    if(q>0)clayLine5(c,curvePts(knots,22),true,[.17,1,.77,.54,.23,.06],w,'#67503a',i,q);
  });c.restore();
}
function drawS5Panel(t,cam,TR){const x0=S5X-S5W/2,y0=S5Y-S5W/2;panelShadow(x0,y0,S5W,S5W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S5W,S5W);ctx.clip();
  ctx.drawImage(LINEN,0,0,840,840,x0,y0,S5W,S5W);ctx.globalCompositeOperation='multiply';const fieldLight=ctx.createLinearGradient(x0+.08*S5W,y0,x0+.86*S5W,y0+S5W);
  fieldLight.addColorStop(0,'rgb(127,132,145)');
  fieldLight.addColorStop(.55,'rgb(137,143,155)');
  fieldLight.addColorStop(1,'rgb(145,150,161)');
  ctx.fillStyle=fieldLight;ctx.fillRect(x0,y0,S5W,S5W);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.translate(S5X,S5Y+6);ctx.filter=`blur(${(5.3*cam.z).toFixed(1)}px)`;
    ctx.fillStyle='rgba(33,29,23,.40)';ctx.scale(.945,.96);ptsPath(ctx,PIL,-1,48);ctx.fill();
    ctx.filter=`blur(${(1.55*cam.z).toFixed(1)}px)`;ctx.fillStyle='rgba(43,34,25,.23)';ptsPath(ctx,PIL,-.4,55.0);ctx.fill();ctx.restore();
  ctx.drawImage(PILC,S5X-P5W/2/MS5,S5Y+6-P5H/2/MS5,P5W/MS5,P5H/MS5);
  drawWater5(ctx,t,(t>47.5&&t<55.5)?heroPoseNow(t):null);
  ctx.restore();ctx.strokeStyle='rgba(60,64,58,0.4)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S5W,S5W);}
// 釉面的光：鱼画在釉下，枕面上那块亮光也落在鱼身上
function glaze5(TR,al){
  ctx.save();ctx.setTransform(...TR);ctx.translate(S5X,S5Y+6);ptsPath(ctx,PIL);ctx.clip();
  const g=ctx.createLinearGradient(-155,87,103,-92);
  g.addColorStop(0,'rgba(251,249,228,0)');
  g.addColorStop(.67,'rgba(251,249,228,0)');
  g.addColorStop(.78,'rgba(251,249,232,'+(.063*al)+')');
  g.addColorStop(.88,'rgba(251,249,232,'+(.038*al)+')');
  g.addColorStop(1,'rgba(251,249,228,0)');
  ctx.fillStyle=g;ctx.fillRect(-200,-145,400,290);ctx.restore();
}
function styleCizhou(t,cam,TR,p,clip){const entering=t<50.6;
  if(entering){ctx.save();if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.beginPath();ctx.rect(-40000,-4000,80000,8000);PIL.forEach((q,i)=>i?ctx.lineTo(q[0]+S5X,q[1]+S5Y+6):ctx.moveTo(q[0]+S5X,q[1]+S5Y+6));ctx.closePath();ctx.clip('evenodd');bronzeRelief([p],TR,cam);ctx.restore();}
  if(t<T5P)return;
  layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}if(entering){ptsPath(hctx,PIL,S5X,S5Y+6);hctx.clip();}drawCizhouFish(hctx,p,TNOW);layerGrain(hctx,TR,0.08);blitLayer(HEROC,1);
  if(t<56&&!clip)glaze5(TR,1-smooth(54.85,56,t));}

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
