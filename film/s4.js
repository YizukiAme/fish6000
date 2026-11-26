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
// 铜鱼身上的锈：和洗底是同一种锈、同一套颜色（鱼是和洗一起铸出来的，不是后贴上去的黄铜）；按鱼自己的坐标贴，鱼游的时候锈跟着走
const FPAT=(()=>{const S=1024,c=mk(S,S),x=c.getContext('2d'),img=x.createImageData(S,S),d=img.data;
  const n1=noise2(481,8,8),n2=noise2(482,34,34),n3=noise2(483,130,130),n4=noise2(484,6,6),n5=noise2(485,18,18),nc=noise2(486,52,52),nc2=noise2(487,150,150),r=rng(488);
  for(let py=0;py<S;py++)for(let px=0;px<S;px++){const u=px/S,v=py/S;
    const pat=clamp(0.24+clamp((n1(u*8,v*8)-0.45)*2.2)*0.55+(n3(u*130,v*130)-0.5)*0.32+clamp((n2(u*34,v*34)-0.6)*3)*0.3);
    const blue=clamp((n4(u*6,v*6)-0.68)*3),cr=smooth(0.66,0.72,nc(u*52,v*52)*0.65+nc2(u*150,v*150)*0.35)*smooth(0.45,0.75,n1(u*8+2,v*8+5)),red=clamp((n5(u*18,v*18)-0.76)*4)*(1-pat)*(1-cr);
    let R=lerp(110,lerp(74,68,blue),pat),G=lerp(87,94,pat),B=lerp(64,lerp(72,83,blue),pat);
    R=lerp(R,126,cr*.25);G=lerp(G,139,cr*.25);B=lerp(B,110,cr*.25);
    R=lerp(R,121,red*.4);G=lerp(G,78,red*.4);B=lerp(B,57,red*.4);
    const gr=.92*(1+(n3(u*130,v*130)-.5)*.15+(n2(u*34,v*34)-.5)*.17+(r()-.5)*.085);const k=(py*S+px)*4;d[k]=clamp(R*gr,0,255);d[k+1]=clamp(G*gr,0,255);d[k+2]=clamp(B*gr,0,255);d[k+3]=255;}
  x.putImageData(img,0,0);return c;})();
function prepBronze(){const Wd=B4W,Hd=B4W;const hm=new Float32Array(Wd*Hd);const inside=new Uint8Array(Wd*Hd);
  // 铭文的凸起：先画进遮罩
  const im=mk(Wd,Hd);const ix=im.getContext('2d');ix.setTransform(MS4,0,0,MS4,Wd/2,Hd/2);ix.fillStyle='#fff';ix.strokeStyle='#fff';ix.lineWidth=1.2;ix.lineJoin='round';
  ['大','吉','羊'].forEach((ch,i)=>{const p=sealGlyphPath(ch,-15,-60+i*40,30,36,1.25);ix.fill(p);ix.stroke(p);});
  const ib=mk(Wd,Hd);const ibx=ib.getContext('2d');ibx.filter=`blur(${0.6*MS4}px)`;ibx.drawImage(im,0,0);const ID=ibx.getImageData(0,0,Wd,Hd).data;
  for(let py=0;py<Hd;py++)for(let px=0;px<Wd;px++){const x=(px-Wd/2)/MS4,y=(py-Hd/2)/MS4;const r=Math.hypot(x,y);const i=py*Wd+px;let h=-99;
    if(r<=R4){inside[i]=1;
      const radius=r/R4;
      if(radius>=.885){
        h=-.64+1.05*Math.exp(-Math.pow((r-R4+2.8)/2.05,2));
        if(r>R4-1.6){const s=(r-R4+1.6)/1.6;h-=2.15*s*s;}
      }else if(radius>.647){
        const s=(radius-.647)/.238;
        const foot=.097,turn=.086,run=1-(foot+turn)/2;
        const height=s<foot?s*s/(2*foot):s>1-turn?run-(1-s)*(1-s)/(2*turn):s-foot/2;
        h=-34+33.36*height/run;
      }else{
        h=-34;
        h+=.80*Math.exp(-Math.pow((radius-.565)*R4/1.02,2));
        h+=.65*Math.exp(-Math.pow((radius-.525)*R4/.94,2));
        h+=2.05*ID[i*4]/255;
      }
    }
    // The lugs attach below the mouth. From this angle the lip hides the inner arc
    // and the eyelet; a little of the outside bow hangs clear of the vessel.
    const side=Math.sign(x),ax=Math.abs(x);
    if(ax>R4-3&&Math.abs(y)<19){
      const offsetY=y-(side<0?1.3:-1);
      const a=ax-R4-1.0-offsetY*(side<0?.12:-.07);
      const ringDistance=Math.sqrt(Math.pow(a/8.0,2)+Math.pow(offsetY/13.2,2));
      const tube=(ringDistance-1)*9.0;
      if(Math.abs(tube)<2.00){
        const ringHeight=-7.1+Math.sqrt(4-tube*tube)*1.27;
        if(ringHeight>h){h=ringHeight;inside[i]=2;}
      }
      const mount=Math.pow((ax-R4+.45)/3.55,2)+Math.pow((offsetY+9.3)/4.1,2);
      if(mount<1&&h< -4.85){h=-7.6+2.75*Math.sqrt(1-mount);inside[i]=2;}
    }
    hm[i]=h;}
  // 锈壳和麻点：一块块鼓起来的粉绿锈（孔雀石），加上细密的麻坑——光一照就有颗粒感，不是平滑的颜色
  // 锈壳不是均匀撒的：成片地长（大尺度的“哪里锈得重”），片里大大小小
  const CR=new Float32Array(Wd*Hd);{const nc=noise2(467,46,46),nc2=noise2(468,140,140),np=noise2(469,260,260),nl=noise2(470,5,5),nf=noise2(471,300,300);
    for(let py=0;py<Hd;py++)for(let px=0;px<Wd;px++){const i=py*Wd+px;if(inside[i]!==1)continue;const u=px/Wd,v=py/Hd;
      const zone=smooth(0.42,0.72,nl(u*5,v*5));const f=nc(u*46,v*46)*0.55+nc2(u*140,v*140)*0.3+nf(u*300,v*300)*0.15;
      const cr=smooth(.67-.073*zone,.734-.067*zone,f)*(.20+.80*zone);CR[i]=cr;const interior=1-smooth(.62*R4,.86*R4,Math.hypot(px-Wd/2,py-Hd/2)/MS4);
      hm[i]+=(cr*.57+(np(u*260,v*260)-.5)*.30)*(1-.36*interior);}}
  // 凹处（铜锈积在低洼里）
  const blurH=new Float32Array(Wd*Hd);{const R=Math.round(4*MS4);const tmp=new Float32Array(Wd*Hd);
    for(let y=0;y<Hd;y++){let s=0,c=0;for(let x=-R;x<Wd+R;x++){if(x+R<Wd&&hm[y*Wd+x+R]>-90){s+=hm[y*Wd+x+R];c++;}if(x-R-1>=0&&hm[y*Wd+x-R-1]>-90){s-=hm[y*Wd+x-R-1];c--;}if(x>=0&&x<Wd)tmp[y*Wd+x]=c?s/c:-26;}}
    for(let x=0;x<Wd;x++){let s=0,c=0;for(let y=-R;y<Hd+R;y++){if(y+R<Hd){s+=tmp[(y+R)*Wd+x];c++;}if(y-R-1>=0){s-=tmp[(y-R-1)*Wd+x];c--;}if(y>=0&&y<Hd)blurH[y*Wd+x]=s/c;}}}
  const c=mk(Wd,Hd);const cx=c.getContext('2d');const img=cx.createImageData(Wd,Hd);const d=img.data;
  const n1=noise2(461,7,7),n2=noise2(462,30,30),n3=noise2(463,120,120),n4=noise2(464,5,5),n5=noise2(465,16,16);const r=rng(466),pit=noise2(497,280,280);
  for(let py=1;py<Hd-1;py++)for(let px=1;px<Wd-1;px++){const i=py*Wd+px;if(!inside[i])continue;const x=(px-Wd/2)/MS4,y=(py-Hd/2)/MS4;const rr=Math.hypot(x,y);
    const hx=(hm[i+1]-hm[i-1])*MS4/2,hy=(hm[i+Wd]-hm[i-Wd])*MS4/2;const gx=Math.abs(hx)>40?0:hx,gy=Math.abs(hy)>40?0:hy;
    let nx=-gx,ny=-gy,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    let dif=Math.max(0,nx*L4[0]+ny*L4[1]+nz*L4[2]);const ndh=Math.max(0,nx*H4[0]+ny*H4[1]+nz*H4[2]);
    // 沿口在洗内投下的影
    if(inside[i]===1&&rr<.885*R4+2){const b=(x*L4[0]+y*L4[1])/Math.hypot(L4[0],L4[1]);const cc=rr*rr-Math.pow(.885*R4,2);const sd=-b+Math.sqrt(Math.max(0,b*b-cc));const dep=-hm[i];dif*=1-.33*smooth(-3,7,dep-sd*1.02);}
    if(inside[i]===1&&rr<.70*R4)dif*=1-.10*Math.exp(-Math.pow((rr-.657*R4)/7.4,2));
    const u=px/Wd,v=py/Hd;const cav=clamp((blurH[i]-hm[i])*0.6);
    const ins=ID[i*4]/255;
    // A continuous brown-olive metal ground and broad uneven green deposits.
    // Deposit height, colour and roughness are coupled, not three separate noise layers.
    const broad=n1(u*7,v*7), middle=n2(u*30,v*30), fine=n3(u*120,v*120);
    const margin=smooth(.885*R4,.972*R4,rr);
    let pat=clamp(.18+.68*smooth(.32,.78,broad*.83+middle*.17)+.23*cav+.08*(fine-.5));
    if(inside[i]===2)pat*=.82;
    pat*=1-.14*margin-.13*ins;
    const crust=CR[i]*(1-.72*ins);
    const blue=smooth(.50,.81,n4(u*5,v*5));
    const rust=smooth(.48,.83,n5(u*16,v*16)*.77+middle*.23)*(1-pat*.65);
    let R=lerp(106,lerp(77,66,blue),pat);
    let G=lerp(86,lerp(94,95,blue),pat);
    let B=lerp(65,lerp(73,83,blue),pat);
    R=lerp(R,121,.47*rust);G=lerp(G,76,.47*rust);B=lerp(B,58,.47*rust);
    R=lerp(R,126,crust*.72);G=lerp(G,139,crust*.72);B=lerp(B,110,crust*.72);
    const field=inside[i]===1?1-smooth(.63*R4,.81*R4,rr):0;
    const grain=1+(middle-.5)*.122+(fine-.5)*.138+(r()-.5)*.076;
    const lum=(.30+.75*dif+.055*field)*(1-.078*margin)*grain;
    const metal=(1-pat*.75)*(1-crust*.86);
    const rolled=Math.exp(-Math.pow((rr-R4+2.5)/1.5,2));
    const soft=Math.pow(ndh,12)*(.064+.01*margin);
    const wear=smooth(.46,.68,broad*.45+middle*.40+fine*.15);
    const glint=Math.pow(ndh,57)*(.075+.23*wear+.24*rolled+.10*ins);
    const near=smooth(.14,.84,(-x+y*.75)/R4)*Math.exp(-Math.pow((rr-.82*R4)/21.0,2));
    const flecks=smooth(.68,.90,pit(u*280,v*280))*
      smooth(.49,.72,middle*.74+fine*.26)*smooth(.39,.72,.55*broad+.45*n4(u*5,v*5));
    const worn=near*flecks*(.40+.60*dif)*metal;
    const angle=Math.atan2(y,x);
    const face=Math.exp(-Math.pow((angle-2.11)/.18,2))+.80*Math.exp(-Math.pow((angle-2.56)/.14,2))
      +.63*Math.exp(-Math.pow((angle-1.84)/.055,2));
    const lip=face*metal*(.20+.80*wear)*Math.exp(-Math.pow((rr-R4+2.5)/.74,2));
    const k=(py*Wd+px)*4;
    d[k]=clamp(R*lum+metal*(189*soft+206*glint)+52*worn+43*lip,0,255);
    d[k+1]=clamp(G*lum+metal*(182*soft+191*glint)+49*worn+39*lip,0,255);
    d[k+2]=clamp(B*lum+metal*(161*soft+168*glint)+39*worn+30*lip,0,255);
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
function bronzeDetail(c,p){castLines(c,p,true);}
// 一组铜鱼的浮雕：先画投影，再画受光

function castPoint(p,u,across) {
  const axis=spineAt(p,Math.max(0,u));
  const back=p.sp[1],nose=p.sp[0];
  const dx=u<0?(back.x-nose.x)*u*p.N:0,dy=u<0?(back.y-nose.y)*u*p.N:0;
  return [axis.x+dx+axis.nx*p.L*across,axis.y+dy+axis.ny*p.L*across];
}
function castPath(c,p,segments,close=false) {
  c.beginPath();
  for(const [i,segment] of segments.entries()){
    const projected=[];
    for(let j=0;j<segment.length;j+=2) projected.push(...castPoint(p,segment[j],segment[j+1]));
    if(i===0)c.moveTo(...projected);
    else if(projected.length===2)c.lineTo(...projected);
    else if(projected.length===4)c.quadraticCurveTo(...projected);
    else c.bezierCurveTo(...projected);
  }
  if(close)c.closePath();
}
function castSilhouette(c,p){
  // Five fins cast flush with the field; negative space under each hanging tip separates it from the belly.
  const shapes=[
    [[.17,-.084],[.181,-.151,.241,-.173,.346,-.17],[.323,-.16,.299,-.154],[.26,-.141,.253,-.111]],
    [[.192,.086],[.198,.14,.239,.159,.30,.166],[.303,.155,.266,.119],[.25,.104]],
    [[.581,-.102],[.594,-.144,.646,-.147,.718,-.146],[.687,-.128,.656,-.116],[.648,-.079]],
    [[.593,.092],[.606,.123,.652,.139,.699,.14],[.676,.109,.649,.083]],
    [[.748,-.045],[.83,-.045,.915,-.093,.973,-.105],
     [.994,-.111,.998,-.094],[.994,-.076,.982,-.066],[.995,-.053,.992,-.034],
     [.986,-.014,.981,-.004],[.994,.011,.99,.032],[.981,.05,.976,.06],
     [.991,.083,.978,.103],[.923,.107,.828,.061,.745,.058]],
    [[.009,-.028],[.018,-.056,.077,-.091,.16,-.113],
     [.255,-.141,.423,-.14,.54,-.12],[.64,-.103,.711,-.073,.769,-.046],
     [.797,-.019,.788,.036,.76,.054],[.691,.081,.593,.099,.514,.116],
     [.396,.14,.264,.148,.169,.121],[.085,.098,.028,.062,.009,.031],
     [.001,.013,.01,.005],[0,-.011,.009,-.028]]
  ];
  for(const side of [-1,1]){
    const s=side*(side<0?1:.88);
    const whisker=[[.025,s*.020],[.005,s*.040,-.011,s*.048,-.013,s*.067],
      [-.017,s*.086,-.001,s*.098,-.002,s*.111],[-.001,s*.121,-.006,s*.128,-.011,s*.132],
      [.001,s*.130,.012,s*.121,.011,s*.108],[.010,s*.092,-.002,s*.080,-.001,s*.068],
      [.001,s*.054,.018,s*.049,.032,s*.039]];
    castPath(c,p,whisker,true);c.fill();
  }
  for(const shape of shapes){castPath(c,p,shape,true);c.fill();}
}
function castLines(c,p,free=false){
  const k=p.L/120;
  c.save();c.lineCap='round';c.lineJoin='round';
  function ridge(segments,width,wear=1){
    c.save();c.translate(-.27*k,.38*k);
    // Paths store the transform on creation, so rebuild after offsetting the tool.
    castPath(c,p,segments);c.strokeStyle='rgba(25,31,23,'+(.67*wear)+')';
    c.lineWidth=(width+.40)*k;c.stroke();c.restore();
    c.save();c.translate(.22*k,-.37*k);castPath(c,p,segments);
    c.strokeStyle='rgba(171,164,131,'+(.61*wear)+')';c.lineWidth=width*.82*k;c.stroke();c.restore();
  }
  ridge([[.051,-.067],[.036,-.035,.043,-.006,.065,.016]],.95,.76);
  ridge([[.085,-.086],[.117,-.098,.161,-.109,.196,-.095]],.72,.64);
  ridge([[.157,-.107],[.234,-.064,.243,.005,.208,.069],[.194,.095,.172,.109]],1.35);
  ridge([[.183,-.061],[.206,-.033,.212,-.006,.204,.02]],.70,.47);
  const eye=[[.066,.027],[.068,.007,.083,-.002,.100,.003],
    [.119,.010,.122,.031,.111,.047],[.096,.065,.073,.055,.066,.027]];
  castPath(c,p,eye,true);c.fillStyle='rgba(39,41,32,.50)';c.fill();ridge(eye,1.29,.94);
  ridge([[.075,.036],[.077,.051,.096,.056,.107,.043]],1.42,.79);
  const pupil=[[.082,.025],[.083,.018,.091,.015,.097,.020],[.103,.026,.100,.035,.094,.038],
    [.087,.041,.081,.033,.082,.025]];
  castPath(c,p,pupil,true);c.fillStyle='rgba(35,36,29,.82)';c.fill();
  ridge([[.084,.024],[.087,.016,.096,.018,.099,.024]],.96,.82);
  if(!free){
    for(const side of [-1,1]){
      const s=side*(side<0?1:.88);
      ridge([[.027,s*.031],[.006,s*.046,-.011,s*.054,-.009,s*.068],
        [-.012,s*.084,.006,s*.099,.004,s*.112],[.003,s*.118,-.001,s*.124,-.005,s*.129]],.94,.88);
    }
    ridge([[.211,-.078],[.234,-.042,.239,.041,.212,.094]],1.16,.85);
    ridge([[.227,-.014],[.367,-.011,.523,-.006,.738,-.004]],1.10,.95);
    ridge([[.266,-.010],[.375,-.007,.417,-.006,.482,-.004]],1.37,.59);
    ridge([[.581,-.003],[.633,-.003,.698,-.002,.728,.000]],.84,.72);
    const levels=[[.268,.110],[.352,.120],[.444,.116],[.535,.107],[.624,.084]];
    for(const [n,[u,span]] of levels.entries())for(const sign of [-1,1]){
      const a=u+(sign<0?.007:0)+.002*Math.sin(n*2);
      const outer=span*(.92+.018*Math.cos(n+sign));
      const inner=.018+.003*Math.cos(n*2+sign), bulge=.034-.003*n;
      const arc=[[a,sign*outer],[a+.013,sign*outer*.99,a+bulge,sign*outer*.78,a+bulge,sign*outer*.56],
        [a+bulge,sign*outer*.39,a+.019,sign*(inner+.003),a+.008,sign*inner]];
      const wear=.80+.10*Math.cos(n*2.8+sign);
      ridge(arc,1.62+.12*Math.sin(n*1.4),wear);
      ridge([[a+.015,sign*outer*.95],[a+bulge*.94,sign*outer*.82,a+bulge*1.13,sign*outer*.65,a+bulge,sign*outer*.51]],
        1.48,wear*.55);
    }
  }else{
    // The visitor carries the basin's metal with it but keeps its narrow scales.
    for(const [j,[u,span,n]] of [[.264,.092,3],[.35,.105,3],[.436,.105,3],[.526,.096,2],[.61,.076,2]].entries()){
      for(let i=0;i<n;i++){
        const pitch=2*span/n,v=(i+.5)*pitch-span+(j%2?.006:0),half=pitch*.36;
        const strength=.84+.15*Math.cos(j+i);
        ridge([[u,v-half],[u+.015,v-half*.60,u+.024,v-half*.18,u+.020,v+half*.16],
          [u+.019,v+half*.44,u+.011,v+half*.70,u+.003,v+half]],1.37,strength);
        ridge([[u+.010,v-half*.65],[u+.018,v-half*.44,u+.024,v-half*.16,u+.021,v+half*.05]],1.38,strength*.65);
      }
    }
    ridge([[.153,-.109],[.175,-.097,.196,-.075,.202,-.056]],1.60,.94);
    ridge([[.223,-.064],[.242,-.025,.244,.012,.234,.041]],.73,.74);
    ridge([[.625,-.071],[.671,-.066,.73,-.039,.790,-.028]],.94,.77);
    ridge([[.704,.054],[.741,.045,.775,.029,.805,.025]],1.10,.80);
    ridge([[.791,-.031],[.805,-.014,.804,.009,.799,.029]],1.06,.74);
    for(const direction of [-1,1])for(const [j,[tip,spread]] of [[.969,.150],[.954,.103]].entries()){
      let s=direction;
      ridge([[.803,s*(.022-.011*j)],[.847,s*(.038-.016*j),.922,s*(spread*.65),tip,s*spread]],1.21-j*.26,.84-j*.11);
    }
    for(const [u0,u1,height,side,back] of [[.3,.52,.10,1,1.1],[.58,.70,.07,1,1.3],[.36,.46,.07,-1,1.6],[.62,.72,.06,-1,1.4]]){
      const fin=finPts(p,PROF_BRZ,u0,u1,height,side,back);
      for(const n of [6,10]){
        const a=fin.base[n],b=fin.out[n],f=.83;
        c.beginPath();c.moveTo(...a);c.lineTo(lerp(a[0],b[0],f),lerp(a[1],b[1],f));
        c.lineWidth=1.03*k;c.strokeStyle='rgba(38,36,25,.66)';c.stroke();
        c.beginPath();c.moveTo(a[0]+.28*k,a[1]-.36*k);
        c.lineTo(lerp(a[0],b[0],.73)+.28*k,lerp(a[1],b[1],.73)-.36*k);
        c.lineWidth=.69*k;c.strokeStyle='rgba(162,151,119,.66)';c.stroke();
      }
    }
  }
  if(!free){
    for(const [side,u,len,base] of [[-1,.185,.144,.103],[1,.204,.083,.104],[-1,.593,.104,.096],[1,.61,.066,.096]]){
      ridge([[u,side*base],[u+.022,side*(base+.035),u+len*.69,side*(base+.051),u+len,side*(base+.059)]],1.0,.77);
      ridge([[u+.017,side*base],[u+.047,side*(base+.029),u+len*.76,side*(base+.041)]],.66,.56);
    }
    ridge([[.737,-.064],[.762,-.036,.765,.022,.74,.062]],1.06,.74);
    for(const [v,end] of [[-.084,.969],[-.037,.978],[.011,.971],[.067,.961]]){
      const root=v*.46;
      ridge([[.775,root],[.83,root-.002,.925,v*.83,end,v]],1.82,.91);
      ridge([[.83,root+.008],[.91,v*.82+.009,end-.007,v+.009]],.65,.67);
    }
  }
  c.restore();
}
function castTwins(poses,TR,cam,alpha){
  const z=cam.z;
  layerBegin(eb0,TR);eb0.fillStyle='#fff';
  for(const p of poses)castSilhouette(eb0,p);
  // Slight relief around the perimeter. The field and the fish belly share the same casting.
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.48*alpha;
  ctx.filter='brightness(0) blur('+(.50*z).toFixed(1)+'px)';
  ctx.drawImage(EB0,-.56*z,.8*z);ctx.restore();
  layerBegin(hctx,TR);hctx.fillStyle='#fff';
  for(const p of poses)castSilhouette(hctx,p);
  hctx.globalCompositeOperation='source-in';
  hctx.drawImage(BRZ,S4X-B4H/MS4,S4Y-B4H/MS4,B4W/MS4,B4W/MS4);
  // A small height change remains visible where the same large patch of patina crosses a fish.
  hctx.globalCompositeOperation='source-atop';
  for(const p of poses){
    const s=spineAt(p,.50);
    const wear=hctx.createPattern(FPAT,'repeat');
    wear.setTransform(new DOMMatrix().translate(S4X,S4Y).scale(.23));
    hctx.fillStyle=wear;hctx.globalAlpha=.12;castSilhouette(hctx,p);hctx.globalAlpha=1;
    const g=hctx.createLinearGradient(s.x-21,s.y+11,s.x+21,s.y-11);
    g.addColorStop(0,'rgba(21,24,15,.22)');g.addColorStop(.6,'rgba(99,95,69,.055)');
    g.addColorStop(1,'rgba(157,150,122,.145)');
    hctx.fillStyle=g;hctx.fillRect(s.x-48,s.y-99,96,198);
  }
  const outline=(dx,dy,col)=>{
    eb1.reset();eb1.drawImage(EB0,0,0);eb1.globalCompositeOperation='destination-out';
    eb1.drawImage(EB0,dx*z,dy*z);eb1.globalCompositeOperation='source-in';
    eb1.fillStyle=col;eb1.fillRect(0,0,W,H);
    hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.drawImage(EB1,0,0);hctx.restore();
  };
  outline(-.68,.77,'rgba(179,173,149,.74)');outline(.60,-.79,'rgba(32,32,24,.80)');
  for(const p of poses)castLines(hctx,p);
  hctx.globalCompositeOperation='source-over';blitLayer(HEROC,alpha);
}
function bronzeRelief(poses,TR,cam,alpha=1){const z=cam.z;
  if(poses.length===2){castTwins(poses,TR,cam,alpha);return;}
  layerBegin(eb0,TR);for(const p of poses)bronzeSil(eb0,p);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.44*alpha;ctx.filter=`brightness(0) blur(${(1.08*z).toFixed(1)}px)`;ctx.drawImage(EB0,-1.17*z,1.47*z);ctx.restore();
  layerBegin(hctx,TR);for(const p of poses){const s=spineAt(p,0.45),a=Math.atan2(s.ty,s.tx);const pt=hctx.createPattern(FPAT,'repeat');
    pt.setTransform(new DOMMatrix().translate(s.x,s.y).rotate(a*180/Math.PI).scale(0.25).translate(-512,-512));bronzeSil(hctx,p,pt);}
  // 鼓起来的鱼身：朝光的一侧（右上）亮一点，背光的一侧暗一点
  hctx.globalCompositeOperation='source-atop';for(const p of poses){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}
    const g=hctx.createLinearGradient(x0-10,y1+10,x1+10,y0-10);g.addColorStop(0,'rgba(10,7,4,0.34)');g.addColorStop(0.5,'rgba(10,7,4,0.06)');g.addColorStop(1,'rgba(240,232,205,0.1)');hctx.fillStyle=g;hctx.fillRect(x0-40,y0-40,x1-x0+80,y1-y0+80);}
  for(const p of poses){
    const at=spineAt(p,.30),lightSide=at.nx*L4[0]+at.ny*L4[1];
    const middle=spineAt(p,.41),r=p.L*.15;
    const sideLight=middle.nx*L4[0]+middle.ny*L4[1],sign=Math.sign(sideLight)||1;
    const across=hctx.createLinearGradient(middle.x-sign*middle.nx*r,middle.y-sign*middle.ny*r,
      middle.x+sign*middle.nx*r,middle.y+sign*middle.ny*r);
    const stops=[[0,20,17,12,.44],[.22,39,31,23,.27],[.48,37,30,23,.05],
      [.72,184,173,135,.18],[.88,141,131,102,.14],[1,42,37,25,.16]];
    if(Math.abs(sideLight)>=.26){
      for(const [u,...rgba] of stops)across.addColorStop(u,'rgba('+rgba.join(',')+')');
    }else{
      // While the light crosses the fish's axis, blend both flank profiles in a
      // single gradient. At grazing incidence the distribution is symmetric.
      const weight=(1+smooth(0,.26,Math.abs(sideLight)))/2;
      const colourAt=u=>{
        const hi=stops.findIndex(row=>row[0]>=u);
        if(hi===0)return stops[0].slice(1);
        const a=stops[hi-1],b=stops[hi],k=(u-a[0])/(b[0]-a[0]);
        return a.slice(1).map((channel,i)=>lerp(channel,b[i+1],k));
      };
      // Include the knots from both directions, mixing each colour by its opacity.
      for(const u of [0,.12,.22,.28,.48,.52,.72,.78,.88,1]){
        const near=colourAt(u),far=colourAt(1-u);
        const alpha=lerp(far[3],near[3],weight);
        const rgb=near.slice(0,3).map((ch,i)=>lerp(far[i]*far[3],ch*near[3],weight)/alpha);
        across.addColorStop(u,'rgba('+rgb.join(',')+','+alpha+')');
      }
    }
    hctx.fillStyle=across;bodyFill(hctx,edges(p,PROF_BRZ));hctx.fill();
    // Raking light spreads across the curved shoulder and dies before the nose.
    hctx.save();hctx.transform(at.nx,at.ny,at.tx,at.ty,at.x,at.y);
    hctx.scale(.143*p.L,.225*p.L);
    const lit=hctx.createRadialGradient(lightSide*.61,.02,.03,lightSide*.40,.02,1);
    lit.addColorStop(0,'rgba(170,155,127,.28)');lit.addColorStop(.47,'rgba(151,139,109,.13)');
    lit.addColorStop(1,'rgba(142,128,101,0)');hctx.fillStyle=lit;hctx.fillRect(-1.6,-1.1,3.2,2.2);hctx.restore();
  }
  hctx.globalCompositeOperation='source-over';
  const edge=(sx,sy,col,al)=>{eb1.reset();eb1.drawImage(EB0,0,0);eb1.globalCompositeOperation='destination-out';eb1.drawImage(EB0,sx,sy);eb1.globalCompositeOperation='source-in';eb1.fillStyle=col;eb1.fillRect(0,0,W,H);
    hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.globalCompositeOperation='source-atop';hctx.globalAlpha=al;hctx.filter=`blur(${(0.9*z).toFixed(1)}px)`;hctx.drawImage(EB1,0,0);hctx.restore();};
  const dz=1.76*z;edge(-.63*dz,.77*dz,'rgb(168,160,132)',.44);edge(.63*dz,-.77*dz,'rgb(26,24,16)',.65);
  hctx.setTransform(...TR);hctx.globalCompositeOperation='source-atop';for(const p of poses)bronzeDetail(hctx,p);
  const pt=hctx.createPattern(PATINA,'repeat');pt.setTransform(new DOMMatrix([0.5,0,0,0.5,0,0]));hctx.fillStyle=pt;hctx.globalAlpha=.16;hctx.fillRect(-30000,-3000,60000,6000);hctx.globalAlpha=1;hctx.globalCompositeOperation='source-over';
  blitLayer(HEROC,alpha);}
// 头部转动：以 u0 处为轴，把鱼头往一侧掰
function bendPose(p,u0,th){const N=p.N,piv=p.sp[Math.round(u0*N)];const sp=p.sp.map((q,i)=>{const u=i/N;if(u>=u0)return{...q};const a=th*Math.pow((u0-u)/u0,0.8);const dx=q.x-piv.x,dy=q.y-piv.y;const c=Math.cos(a),s=Math.sin(a);return{x:piv.x+dx*c-dy*s,y:piv.y+dx*s+dy*c};});
  for(let i=0;i<=N;i++){const A=sp[Math.max(0,i-1)],B=sp[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sg=(p.sp[i].nx*(-dy)+p.sp[i].ny*dx)>=0?1:-1;sp[i].nx=-dy*sg;sp[i].ny=dx*sg;}
  return{...p,sp};}
const T4LOOK0=44.55,T4LOOK1=45.1,T4GONE=46.6;
// 那对鱼的反应：一条先察觉，慢慢把头转过来；另一条晚 0.2 秒跟着转。转的时候尾巴往反方向带一下，最后稍微过头一点再落定——一次转完，不点头
// （真实时间：主角正游到和它们并排时开始；T4LOOK0 加上前面甲骨那次停顿）
function lookCurve(q){if(q<=0)return 0;return smooth(0,0.75,q)+0.07*Math.sin(Math.PI*clamp((q-0.5)/0.6));}
function bendTail(p,u1,th){const N=p.N,piv=p.sp[Math.round(u1*N)];const sp=p.sp.map((q,i)=>{const u=i/N;if(u<=u1)return{...q};const a=th*Math.pow((u-u1)/(1-u1),1.2);const dx=q.x-piv.x,dy=q.y-piv.y;const c=Math.cos(a),s=Math.sin(a);return{x:piv.x+dx*c-dy*s,y:piv.y+dx*s+dy*c};});
  for(let i=0;i<=N;i++){const A=sp[Math.max(0,i-1)],B=sp[Math.min(N,i+1)];let dx=A.x-B.x,dy=A.y-B.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sg=(p.sp[i].nx*(-dy)+p.sp[i].ny*dx)>=0?1:-1;sp[i].nx=-dy*sg;sp[i].ny=dx*sg;}
  return{...p,sp};}
function twinPoses(t){const fade=1-smooth(T4GONE+0.2,T4GONE+1.6,t),L0=T4LOOK0+PAUSES[0].A+PAUSES[0].H;const la=lookCurve(TREAL-L0)*fade,lb=lookCurve(TREAL-L0-0.2)*fade;const follow=smooth(46.0,46.7,t)*(1-smooth(48.2,49.6,t));
  const lf=bendTail(bendPose(straightPose(S4X-66,S4Y-66,-Math.PI/2,124,true),0.45,0.58*la-0.5*follow),0.62,-0.16*la);
  const rt=bendTail(bendPose(straightPose(S4X+66,S4Y-66,-Math.PI/2,124,false),0.45,-0.58*lb),0.62,0.16*lb);
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

// 出洗时，先由鱼头带向侧面，然后一摆尾越过左肩。轨迹自三鱼重合的位置出发。
const departureKnots=[
  [44.25,0,52],[44.6,0,-18],[44.9,0,-66],[45.3,-1.5,-88],[45.65,-4,-98],
  [45.9,-9,-109],[46.18,-21,-132],[46.48,-45,-154],[46.8,-83,-166],
  [47.1,-125,-164],[47.42,-169,-147],[47.75,-217,-125],[48.05,-262,-96],
  [48.4,-320,-62],[48.7,-370,-40],[49.1,-410,-28]
].map(([time,x,y])=>[time,S4X+x,S4Y+y]);
let departureDef;
function bronzeDepartureTrack() {
  if(departureDef)return departureDef;
  const curve=hermite(departureKnots),dt=HERO.tr.dt;
  const path=t=>t<44.6||t>48.4?HK(t):curve(t);
  const tr=makeTrackF(path,42,50,dt);
  // Use the original phase through the approach. Once it turns, a broader tail beat
  // travels down the spine. The local track never feeds the following stations.
  for(let i=0;i<tr.n;i++){
    const t=tr.T0+i*dt,original=Math.round((t-HERO.tr.T0)/dt);
    if(t<=45.15){tr.PH[i]=HERO.tr.PH[original];continue;}
    const start=smooth(45.45,45.82,t)*(1-smooth(46.07,46.49,t));
    const hz= .56+.88*clamp(tr.SP[i]/170)+.55*start;
    tr.PH[i]=tr.PH[i-1]+2*Math.PI*hz*dt;
  }
  departureDef={...HERO,tr,amp:t=>.80+.48*smooth(45.5,45.84,t)*(1-smooth(46.15,46.68,t))};
  return departureDef;
}
function bronzeDeparturePose(t,published){
  const weight=smooth(44.91,45.30,t)*(1-smooth(47.85,48.58,t));
  if(!weight)return published;
  const def=bronzeDepartureTrack();
  const local=fishPose(def,t);
  const spring=.10*smooth(45.6,45.93,t)*(1-smooth(46.38,46.95,t));
  return blendPose(published,stiffenPose(local,spring),weight);
}
// This camera starts to drift as the fish acquires speed; it reaches the existing
// follow shot with the same position, lens and velocity as that shot.
function bronzeDepartureCamera(t,x,y,z) {
  if(t<=45.26||t>=48.18)return [x,y,z];
  const w=smooth(45.26,45.52,t)*(1-smooth(48.02,48.18,t));
  const p=smooth(45.35,48.1,t),follow=camFollow(t);
  const cx=lerp(S4X,follow[0]-120*p,p);
  const cy=lerp(S4Y-8,follow[1],p);
  const zoom=2.05*Math.pow(1.30/2.05,smooth(45.66,48.1,t));
  return [lerp(x,cx,w),lerp(y,cy,w),lerp(z,zoom,w)];
}
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
