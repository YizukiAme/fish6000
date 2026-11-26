// ================= 拾 · 像素（显像管，高潮） =================
// 鱼一碰到玻璃，屏幕亮了。它成了 1 位的像素鱼；每吃一颗豆，画面升一级：1 位黑白 → 4 色绿屏 → 16 色 → 256 色。
// 右上角的“分数”其实是年份。吃到最后一颗，画面撑不住了：撕裂、串色、塌缩成一个亮点——鱼从屏幕里钻了出来
const S10X=-5940,S10Y=0,S10W=600;
const SCR={x:S10X,y:-24,w:300,h:225};   // 屏幕在世界里的位置
const SBW=640,SBH=480;                   // 屏幕缓冲
const T10ON=119.0,T10UP=[122.55,125.95,129.55],T10EAT4=133.1,T10TEAR=133.25,T10OFF=134.75,T10OUT=134.9;
const YEARS=[1980,1989,1995,2003,2026];
const LV=[{rx:40,ry:30},{rx:80,ry:60},{rx:160,ry:120},{rx:320,ry:240}];
const PAL_GB=[[15,56,15],[48,98,48],[139,172,15],[155,188,15]];
const PAL_EGA=[[0,0,0],[0,0,170],[0,170,0],[0,170,170],[170,0,0],[170,0,170],[170,85,0],[170,170,170],[85,85,85],[85,85,255],[85,255,85],[85,255,255],[255,85,85],[255,85,255],[255,255,85],[255,255,255]];
const WATER95=[[0,0,0],[20,31,72],[28,47,98],[38,59,115],[48,71,132],[17,87,72],[47,157,90],[117,65,40],[180,107,53],[106,49,38],[213,83,62],[249,174,61],[249,222,112],[238,127,167],[185,200,214],[255,255,255]];
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+0.5)/16-0.5);
const PELLETS=[[-5995,-35],[-5900,20],[-6004,17],[-5940,-24]];   // 每一关的终点豆（第三关的放在绕完一圈的出口）
const SB=mk(SBW,SBH),sbx=SB.getContext('2d');
const LVC=LV.map(l=>{const c=mk(l.rx,l.ry);return{c,x:c.getContext('2d',{willReadFrequently:true})};});
const toBuf=(x,y)=>[(x-(SCR.x-SCR.w/2))/SCR.w*SBW,(y-(SCR.y-SCR.h/2))/SCR.h*SBH];
function levelAt(t){let k=0;for(const tu of T10UP)if(t>=tu)k++;return k;}
function yearAt(t){const k=levelAt(t);if(t>=T10EAT4)return Math.round(lerp(2003,2026,smooth(T10EAT4,T10EAT4+0.6,t)));return YEARS[k];}
// 3×5 的点阵数字
const DIG={0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001010010010',8:'111101111101111',9:'111101111001111',L:'100100100100111',V:'101101101101010',E:'111100111100111','+':'000010111010000','!':'010010010000010'};
function pixText(c,s,x,y,px,col){c.fillStyle=col;let cx=x;for(const ch of s){const g=DIG[ch];if(!g){cx+=2*px;continue;}for(let i=0;i<15;i++)if(g[i]==='1')c.fillRect(cx+(i%3)*px,y+Math.floor(i/3)*px,px,px);cx+=4*px;}}
// 把主角画进某一级的小画布（缓冲坐标 → 小画布坐标）
function fishToBuf(p){const sc=SBW/SCR.w;const ox=SCR.x-SCR.w/2,oy=SCR.y-SCR.h/2;return{...p,L:p.L*sc,sp:p.sp.map(q=>({x:(q.x-ox)*sc,y:(q.y-oy)*sc,nx:q.nx,ny:q.ny}))};}
// ---------- 游戏里的那条鱼：还是那条鲤鱼，只是换成那一年游戏机的画法 ----------
// 身形、鳍、眼睛的位置，都是剪纸那一站同一副鲤鱼的比例，沿同一根脊线画；变的只是画法：
// 1980 一块白的剪影，一个黑点当眼睛；1989 四级绿：深色的身子、浅色的肚皮；1995 16 色像素画：橙身（黄和浅红按棋盘格抖出来）、褐色的背、鳞、鳍条；
// 这三关是像素画：边是硬的，颜色只用那台机器有的那几种，外面描一圈一像素的黑边，眼睛、鳃、鳍条、鳞一个像素一个像素地点。
// 2003 是预渲染的 3D 精灵：顺着身子的明暗、一道高光、背上一线逆光、半透明的鳍。鱼在画布上越大细节越多（鳞、侧线够大才画——游戏里叫 LOD）
// 背总朝上：鱼掉头时，身体的“上”会跟着路线翻过去；游戏里的鱼不会肚皮朝天，所以这时翻一个身：R 从 1 变到 -1（像素画一下子镜像，2003 那条用 0.18 秒转过去）
let ROLLC=null;const ROLL_T0=117.5,ROLL_DT=1/120;
function gameRoll(t){if(!ROLLC){const n=Math.ceil((168.5-ROLL_T0)/ROLL_DT);ROLLC=new Float32Array(n);for(let i=0;i<n;i++){const p=heroPoseNow(ROLL_T0+i*ROLL_DT);ROLLC[i]=spineAt(p,0.4).ny<0?1:-1;}}
  let s=0,k=0;for(let j=0;j<22;j++){const i=Math.round((t-ROLL_T0)/ROLL_DT)-j;if(i>=0&&i<ROLLC.length){s+=ROLLC[i];k++;}}const a=k?s/k:1;return Math.sign(a)*Math.pow(Math.abs(a),0.6);}
const SPRC={};function sprCv(w,h){const k=w+'x'+h;if(!SPRC[k]){const cv=mk(w,h);SPRC[k]={c:cv,x:cv.getContext('2d',{willReadFrequently:true})};}return SPRC[k];}
const GAME03_PROFILE=mkProf(.130,.110,.57,.83,.19);
function gameFish(c,b,mode,R=1){
  const game03=mode==='hi' && b.t<140; // The later code-station recap keeps its approved original skin.
  if(game03) b=stiffenPose(b,.12);
  const L=b.L,pr=game03?GAME03_PROFILE:PROF_CUT,m=c.getTransform(),px=Math.hypot(m.a,m.b),Lp=L*px,lw=1/px;   // px：一个单位是几个像素；Lp：鱼有多少像素长；lw：一像素宽的线
  const rawRoll=R;
  R=mode==='hi'?Math.sign(R||1)*(0.3+0.7*Math.abs(R)):(R<0?-1:1);   // 翻身：像素画的精灵是一下子镜像过来的；预渲染的那条转过去，最薄也有背那么宽（不会薄成一根线）
  let g=c;   // 往哪张画布上画（像素画先画在一张小画布上，再逐像素收拾）
  const S=u=>spineAt(b,u);
  const envelope=mode==='hi'?Math.sign(R)*Math.hypot(rawRoll,.65*Math.sqrt(Math.max(0,1-rawRoll*rawRoll))):R;
  const surface=game03 ? rawRoll*(.96+.04*Math.abs(rawRoll)) : .45*envelope+.55*R;
  const BA=(u,v,roll=surface)=>{const s=S(u),w=(v>=0?pr.d(u,L):pr.b(u,L))*v*roll;return[s.x+s.nx*w,s.y+s.ny*w];};
  const FIN=(u0,u1,hm,sd,bk)=>{const base=[],out=[];for(let i=0;i<=16;i++){const v=i/16,u=lerp(u0,u1,v),q=BA(u,sd*0.94),s=S(u),h=hm*L*Math.pow(Math.sin(Math.PI*v),0.75)*(1-0.3*v);base.push(q);out.push([q[0]+s.nx*sd*h*R-s.tx*bk*h*0.5,q[1]+s.ny*sd*h*R-s.ty*bk*h*0.5]);}return{base,out};};
  const dors=FIN(0.27,0.58,0.1,1,1),anal=FIN(0.6,0.71,0.065,-1,1.4),pelv=FIN(0.34,0.43,0.07,-1,1.6);
  // 尾：在尾柄上搭一个小坐标（和剪纸那条一样），身子弯得再厉害，尾巴也不拧
  const ta=S(0.72),tz=S(1);let tx=tz.x-ta.x,ty=tz.y-ta.y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;let nx=-ty,ny=tx;const s8=S(0.8);if(nx*s8.nx+ny*s8.ny<0){nx=-nx;ny=-ny;}
  const bt=BA(0.8,1),bb=BA(0.8,-1),o=[(bt[0]+bb[0])/2,(bt[1]+bb[1])/2],F=(f,h)=>[o[0]+tx*f*L+nx*h*L*R,o[1]+ty*f*L+ny*h*L*R];
  const tail=()=>{if(game03){
      g.beginPath();g.moveTo(...bt);
      g.bezierCurveTo(...F(.083,.062),...F(.158,.159),...F(.224,.166));
      g.bezierCurveTo(...F(.206,.125),...F(.150,.022),...F(.146,.001));
      g.bezierCurveTo(...F(.147,-.024),...F(.191,-.106),...F(.208,-.139));
      g.bezierCurveTo(...F(.148,-.13),...F(.063,-.037),...bb);
      g.closePath();return;
    }
    const U=F(0.2,0.2),N=F(0.115,0),D=F(0.2,-0.19);let k=F(0.07,0.1);g.beginPath();g.moveTo(bt[0],bt[1]);g.quadraticCurveTo(k[0],k[1],U[0],U[1]);k=F(0.14,0.075);g.quadraticCurveTo(k[0],k[1],N[0],N[1]);k=F(0.14,-0.07);g.quadraticCurveTo(k[0],k[1],D[0],D[1]);k=F(0.07,-0.095);g.quadraticCurveTo(k[0],k[1],bb[0],bb[1]);g.closePath();};
  const M=40,top=[],bot=[];for(let i=0;i<=M;i++){const u=0.8*i/M;top.push(BA(u,1,envelope));bot.push(BA(u,-1,envelope));}
  const body=()=>{g.beginPath();top.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));for(let i=M;i>=0;i--)g.lineTo(bot[i][0],bot[i][1]);g.closePath();};
  const band=(u0,u1,v0,v1)=>{g.beginPath();for(let i=0;i<=24;i++){const q=BA(lerp(u0,u1,i/24),v0);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);}for(let i=24;i>=0;i--){const q=BA(lerp(u0,u1,i/24),v1);g.lineTo(q[0],q[1]);}g.closePath();};
  const fp=f=>{g.beginPath();f.base.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));for(let i=f.out.length-1;i>=0;i--)g.lineTo(f.out[i][0],f.out[i][1]);g.closePath();};
  const line=(pts,col,w)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();};
  const rayPts=(f,st,k)=>{const out=[];for(let i=st;i<f.base.length-1;i+=st)out.push([f.base[i],[lerp(f.base[i][0],f.out[i][0],k),lerp(f.base[i][1],f.out[i][1],k)]]);return out;};
  const tailRayPts=n=>{const out=[];for(let j=0;j<n;j++){const h=lerp(0.17,-0.16,j/(n-1));out.push([F(0.01,h*0.25),F(0.18-Math.abs(h)*0.33,h*0.98)]);}return out;};
  const gill=[BA(0.19,0.8),BA(0.215,0.4),BA(0.225,0),BA(0.215,-0.4),BA(0.19,-0.78)];
  // 胸鳍：长在鳃后面、肚子这一侧，往后下方伸，跟着划水轻轻扇
  const pec=()=>{const s=S(0.22),q=BA(0.22,-0.42),a=0.6+0.22*Math.sin(b.t*2*Math.PI*1.2)*(1-0.6*b.sn);const dx=-s.tx*Math.cos(a)-s.nx*R*Math.sin(a),dy=-s.ty*Math.cos(a)-s.ny*R*Math.sin(a),l=L*0.14,w=l*0.32;
    const tp=[q[0]+dx*l,q[1]+dy*l],k1=[q[0]+dx*l*0.5-dy*w,q[1]+dy*l*0.5+dx*w],k2=[q[0]+dx*l*0.5+dy*w*0.4,q[1]+dy*l*0.5-dx*w*0.4];g.beginPath();g.moveTo(q[0],q[1]);g.quadraticCurveTo(k1[0],k1[1],tp[0],tp[1]);g.quadraticCurveTo(k2[0],k2[1],q[0],q[1]);g.closePath();return{q,tp};};
  const h0=S(0),h1=S(0.06),hl=Math.hypot(h0.x-h1.x,h0.y-h1.y)||1,fw=[(h0.x-h1.x)/hl,(h0.y-h1.y)/hl];   // fw：朝鱼头的方向
  if(mode==='hi'){// ===== 2003：预渲染的 3D 精灵 =====
    if(game03){
    const ink='rgba(45,39,31,.76)',reed='rgba(83,52,36,.65)',light='rgba(236,199,142,.58)';
    const pen=Math.max(.72*lw,.0032*L);
    g.save();g.lineJoin='round';g.lineCap='round';
    // Root-to-tip shading keeps the fins attached when the fish banks.
    for(const fin of [dors,anal,pelv]){
      fp(fin);const root=fin.base[8],tip=fin.out[8],paint=g.createLinearGradient(...root,...tip);
      paint.addColorStop(0,'rgba(137,80,47,.93)');paint.addColorStop(1,'rgba(170,117,70,.65)');
      g.fillStyle=paint;g.fill();
      for(const ray of rayPts(fin,3,.91))line(ray,reed,pen);
      line(fin.out,'rgba(220,179,115,.48)',pen);
    }
    tail();g.save();g.clip();
    const paint=g.createLinearGradient(...F(.004,0),...F(.215,.028));
    paint.addColorStop(0,'#a9673d');paint.addColorStop(.44,'#a36849');paint.addColorStop(1,'#b68c65');
    g.fillStyle=paint;g.fill();for(let j=-4;j<=5;j++){
      const h=j<0?j*.032:j*.031;
      line([F(.025,h*.12),F(.097,h*.42),F(.144+Math.abs(h)*.46,h)],reed,pen);
    }g.restore();
    body();g.fillStyle='#ba7444';g.fill();
    g.save();body();g.clip();
    // Local cross-section lighting. An unbroken flank highlight curves with the spine;
    // the reflected light at the ventral edge is dimmer than the lit side above it.
    for(let k=0;k<40;k++){
      const u0=.8*k/40,u1=.8*(k+1)/40,mid=(u0+u1)/2;
      const a=BA(mid,1,envelope),z=BA(mid,-1,envelope),skin=g.createLinearGradient(...a,...z);
      const bronze=1-smooth(.51,.82,mid),lit=smooth(.06,.25,mid)*(1-smooth(.58,.8,mid));
      const rgb=(r,gr,bl)=>'rgb('+Math.round(r)+','+Math.round(gr)+','+Math.round(bl)+')';
      skin.addColorStop(0,rgb(72+8*bronze,66,50));
      skin.addColorStop(.22,rgb(104+32*bronze,73+9*bronze,48));
      skin.addColorStop(.49,rgb(157+36*bronze,102+25*bronze,61+10*bronze));
      skin.addColorStop(.65,rgb(171+28*lit,125+26*lit,85+6*lit));
      skin.addColorStop(.80,rgb(193+13*bronze,166+7*bronze,126));
      skin.addColorStop(.96,rgb(154+13*bronze,147,118));
      skin.addColorStop(1,'#888873');
      const e=Math.min(.8,u1+.005);
      g.fillStyle=skin;g.beginPath();g.moveTo(...BA(u0,1.18,envelope));g.lineTo(...BA(e,1.18,envelope));
      g.lineTo(...BA(e,-1.18,envelope));g.lineTo(...BA(u0,-1.18,envelope));g.closePath();g.fill();
    }
    // Short scale edges feather into the flank, leaving the head and belly quiet.
    if(Lp>72){
      for(let row=0;row<4;row++){
        const v=.50-row*.25;
        for(let u=.25+.021*(row%2);u<.70;u+=.044){
          const from=BA(u,v+.125),bend=BA(u+.021,v),to=BA(u,v-.125);
          g.beginPath();g.moveTo(...from);g.quadraticCurveTo(...bend,...to);
          g.lineWidth=pen;g.strokeStyle='rgba(76,57,42,.46)';g.stroke();
        }
      }
    }
    const lateral=[];for(let j=0;j<=18;j++){const t=j/18;lateral.push(BA(.235+.525*t,.01+.12*Math.sin(t*Math.PI)));}
    line(lateral,'rgba(74,68,54,.44)',pen);
    line(top.slice(4,30),'rgba(222,194,150,.61)',pen);
    g.beginPath();g.moveTo(...BA(.148,.66));g.bezierCurveTo(...BA(.244,.43),...BA(.244,-.21),...BA(.183,-.69));
    g.strokeStyle=ink;g.lineWidth=1.4*pen;g.stroke();
    line([BA(.184,-.56),BA(.210,-.36),BA(.22,-.18)],light,pen);
    g.restore();
    const chest=pec(),membrane=g.createLinearGradient(...chest.q,...chest.tp);
    membrane.addColorStop(0,'rgba(143,91,54,.96)');membrane.addColorStop(1,'rgba(210,178,124,.72)');
    g.fillStyle=membrane;g.fill();line([chest.q,chest.tp],reed,pen);
    const eye=BA(.078,.32),n=S(.078),a=Math.atan2(fw[1],fw[0]);
    g.beginPath();g.ellipse(...eye,Math.max(lw, .022*L),Math.max(.78*lw,.019*L*Math.abs(envelope)),a,0,Math.PI*2);
    g.fillStyle='#c6ac71';g.fill();g.strokeStyle=ink;g.lineWidth=pen*.8;g.stroke();
    g.beginPath();g.arc(eye[0]+fw[0]*.002*L,eye[1]+fw[1]*.002*L,Math.max(.7*lw,.013*L),0,7);g.fillStyle='#1b2722';g.fill();
    if(Lp>105){g.beginPath();g.arc(eye[0]+fw[0]*.0045*L+n.nx*R*.004*L,eye[1]+fw[1]*.0045*L+n.ny*R*.004*L,.46*lw,0,7);g.fillStyle='#ded8b7';g.fill();}
    line([BA(.003,0),BA(.026,-.12),BA(.050,-.20)],ink,1.2*pen);
    g.restore();return;}
    const eye=BA(0.085,0.3),ew=Math.max(lw,L*0.004),fin='rgba(206,86,40,0.6)',ray='rgba(112,34,12,0.42)',rim='rgba(255,204,150,0.5)',edge='rgba(66,22,8,0.5)';
    g.save();g.lineJoin='round';g.lineCap='round';
    for(const f of [dors,anal,pelv]){fp(f);g.fillStyle=fin;g.fill();if(Lp>70)for(const r of rayPts(f,2,0.9))line(r,ray,Math.max(lw,L*0.004));line(f.out,rim,Math.max(lw,L*0.005));fp(f);g.lineWidth=ew;g.strokeStyle=edge;g.stroke();}
    tail();g.fillStyle=fin;g.fill();if(Lp>70)for(const r of tailRayPts(9))line(r,ray,Math.max(lw,L*0.004));tail();g.lineWidth=ew;g.strokeStyle=edge;g.stroke();
    body();g.fillStyle='#d9772f';g.fill();
    g.save();body();g.clip();
      g.filter=`blur(${(Lp*0.05).toFixed(1)}px)`;
      band(0,0.8,1.25,0.28);g.fillStyle='rgba(112,38,14,0.9)';g.fill();               // 背：暗
      band(0.02,0.78,-0.3,-1.25);g.fillStyle='rgba(250,222,170,0.95)';g.fill();       // 肚皮：亮
      band(0.6,0.82,1.25,-1.25);g.fillStyle='rgba(110,36,12,0.3)';g.fill();           // 往尾巴去暗一点
      g.filter=`blur(${(Lp*0.022).toFixed(1)}px)`;
      band(0.14,0.54,0.68,0.4);g.fillStyle='rgba(255,244,214,0.5)';g.fill();          // 高光：顺着上半身一道
      g.filter=`blur(${(Lp*0.006).toFixed(1)}px)`;
      line(top.slice(2,38),rim,L*0.03);                                                // 背上一线逆光
      g.filter='none';
      if(Lp>150){for(const v of [0.6,0.3,0,-0.3,-0.6])for(let u=0.25+(Math.abs(v)===0.3?0.0225:0);u<0.76;u+=0.045){const q=BA(u,v),s=S(u),an=Math.atan2(-s.ty,-s.tx);
        g.lineWidth=Math.max(lw,L*0.005);g.strokeStyle='rgba(100,34,12,0.2)';g.beginPath();g.arc(q[0],q[1],0.022*L,an-1.3,an+1.3);g.stroke();
        g.strokeStyle='rgba(255,236,200,0.13)';g.beginPath();g.arc(q[0]-s.tx*0.006*L,q[1]-s.ty*0.006*L,0.022*L,an-1.1,an+1.1);g.stroke();}}
      if(Lp>80){const ll=[];for(let i=0;i<=16;i++)ll.push(BA(lerp(0.24,0.78,i/16),0.06));line(ll,'rgba(96,34,12,0.32)',Math.max(lw,L*0.005));}   // 侧线
      line([BA(0.185,0.8),BA(0.215,0.45),BA(0.232,0),BA(0.215,-0.42),BA(0.185,-0.76)],'rgba(96,32,10,0.45)',Math.max(lw,L*0.007));   // 鳃盖：一道往后鼓的弧
    g.restore();
    body();g.lineWidth=ew;g.strokeStyle=edge;g.stroke();
    pec();g.fillStyle='rgba(226,112,52,0.75)';g.fill();g.lineWidth=ew;g.strokeStyle=edge;g.stroke();
    // 眼：金色的虹膜、黑瞳仁、一个小亮点
    g.fillStyle='#c99a42';g.beginPath();g.arc(eye[0],eye[1],Math.max(1.3*lw,L*0.027),0,7);g.fill();
    g.fillStyle='#140b06';g.beginPath();g.arc(eye[0]+fw[0]*L*0.003,eye[1]+fw[1]*L*0.003,Math.max(0.9*lw,L*0.017),0,7);g.fill();
    {const s=S(0.085);g.fillStyle='rgba(255,255,255,0.75)';g.beginPath();g.arc(eye[0]+fw[0]*L*0.007+s.nx*R*L*0.007,eye[1]+fw[1]*L*0.007+s.ny*R*L*0.007,Math.max(0.5*lw,L*0.005),0,7);g.fill();}
    line([BA(0.004,0),BA(0.04,-0.3)],'rgba(70,24,8,0.7)',Math.max(lw,L*0.006));     // 嘴
    g.restore();return;}
  // ===== 1980 / 1989 / 1995：像素画 =====
  const W0=c.canvas.width,H0=c.canvas.height,SP=sprCv(W0,H0);g=SP.x;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W0,H0);g.setTransform(m.a,m.b,m.c,m.d,m.e,m.f);
  const dev=q=>[m.a*q[0]+m.c*q[1]+m.e,m.b*q[0]+m.d*q[1]+m.f];
  // 先填颜色块：1980 全白；1989 用四级灰（之后量化成四级绿）；1995 用意思上的颜色（橙 #ffaa46 之后按棋盘格抖成黄和浅红）
  const C=mode==='mono'?{fin:'#fff',body:'#fff'}:mode==='gb'?{fin:'#555',body:'#555',belly:'#fff'}:{fin:'#ff5555',body:'#ffaa46',back:'#aa5500',belly:'#ffff55'};
  for(const f of mode==='mono'?[dors]:mode==='gb'?[dors,anal]:[dors,anal,pelv]){fp(f);g.fillStyle=C.fin;g.fill();}tail();g.fillStyle=C.fin;g.fill();   // 鱼越小鳍越少：1980 的剪影上一像素的腹鳍、臀鳍像两只脚
  body();g.fillStyle=C.body;g.fill();
  if(C.back||C.belly){g.save();body();g.clip();if(C.back){band(0,0.8,1.25,0.45);g.fillStyle=C.back;g.fill();}if(C.belly){band(0.04,0.77,-0.4,-1.25);g.fillStyle=C.belly;g.fill();}g.restore();}
  if(mode==='ega'){pec();g.fillStyle=C.fin;g.fill();}
  // 逐像素：盖住一半以上的算鱼，取调色板里的颜色；不到一半的算水
  const img=g.getImageData(0,0,W0,H0),d=img.data,N0=W0*H0,A=new Uint8Array(N0);
  const cover=mode==='mono'?new Uint8Array(N0):null;
  for(let i=0;i<N0;i++){const j=4*i;if(cover)cover[i]=d[j+3];if(d[j+3]<128){d[j+3]=0;continue;}A[i]=1;let r=d[j],gg=d[j+1],bl=d[j+2];
    if(mode==='mono')r=gg=bl=255;
    else if(mode==='gb')r=gg=bl=clamp(Math.round((r*0.3+gg*0.59+bl*0.11)/85),0,3)*85;
    else if(Math.abs(r-255)+Math.abs(gg-170)+Math.abs(bl-70)<48)[r,gg,bl]=((i%W0)+((i/W0)|0))&1?[255,255,85]:[255,85,85];
    else{let best=0,bd=1e9;for(let k=0;k<16;k++){const P=PAL_EGA[k],dd=(r-P[0])**2+(gg-P[1])**2+(bl-P[2])**2;if(dd<bd){bd=dd;best=k;}}[r,gg,bl]=PAL_EGA[best];}
    d[j]=r;d[j+1]=gg;d[j+2]=bl;d[j+3]=255;}
  // Reconnect a diagonal fin tip only when the coverage threshold actually separated it.
  // Every original horizontal sprite keeps its animated outline.
  if(cover){
    const [ox,oy]=dev(o), labels=new Int16Array(N0);let tag=0;
    const flood=(seed,id)=>{const stack=[seed];labels[seed]=id;while(stack.length){
      const i=stack.pop(),x=i%W0,y=(i/W0)|0;
      for(const n of [x?i-1:-1,x+1<W0?i+1:-1,y?i-W0:-1,y+1<H0?i+W0:-1]){
        if(n>=0&&A[n]&&!labels[n]){labels[n]=id;stack.push(n);}
      }
    }};
    for(let i=0;i<N0;i++)if(A[i]&&!labels[i])flood(i,++tag);
    if(tag>1)for(let y=0;y+1<H0;y++)for(let x=0;x+1<W0;x++){
      if(Math.hypot(x+.5-ox,y+.5-oy)>Lp*.34)continue;
      const i=y*W0+x;
      for(const [a,z,b,c] of [[i,i+W0+1,i+1,i+W0],[i+1,i+W0,i,i+W0+1]]){
        if(!A[a]||!A[z]||A[b]||A[c]||labels[a]===labels[z])continue;
        const bridge=cover[b]>=cover[c]?b:c,was=labels[z],joined=labels[a];
        for(let j=0;j<N0;j++)if(labels[j]===was)labels[j]=joined;
        A[bridge]=1;labels[bridge]=joined;d.fill(255,4*bridge,4*bridge+4);
      }
    }
  }
  // 外面描一圈一像素的黑边（1980 是一块剪影，不描）
  if(mode!=='mono')for(let i=0;i<N0;i++){if(A[i])continue;const xx=i%W0,yy=(i/W0)|0;if((xx>0&&A[i-1])||(xx<W0-1&&A[i+1])||(yy>0&&A[i-W0])||(yy<H0-1&&A[i+W0])){const j=4*i;d[j]=d[j+1]=d[j+2]=0;d[j+3]=255;}}
  g.putImageData(img,0,0);g.setTransform(1,0,0,1,0,0);
  const dot=(X,Y,col)=>{g.fillStyle=col;g.fillRect(X,Y,1,1);};
  const inFish=(X,Y)=>X>=0&&Y>=0&&X<W0&&Y<H0&&A[Y*W0+X]===1;
  const pline=(pts,col)=>{for(let j=1;j<pts.length;j++){const a=dev(pts[j-1]),z=dev(pts[j]);const n=Math.max(1,Math.ceil(Math.hypot(z[0]-a[0],z[1]-a[1])*1.5));for(let i=0;i<=n;i++){const X=Math.floor(lerp(a[0],z[0],i/n)),Y=Math.floor(lerp(a[1],z[1],i/n));if(inFish(X,Y))dot(X,Y,col);}}};
  if(mode==='ega'){// 鳍条、鳞（剪纸那条鱼身上的月牙，这里是一个个三像素的小弧）、鳃
    for(const f of [dors,anal])for(const r of rayPts(f,3,0.85))pline(r,'#aa0000');for(const r of tailRayPts(5))pline(r,'#aa0000');
    for(const v of [0.18,-0.18])for(let u=0.3+(v<0?0.035:0);u<0.75;u+=0.07){const q=dev(BA(u,v)),s=S(u);const bx=-s.tx,by=-s.ty,nnx=s.nx*R,nny=s.ny*R;   // 弧往尾巴那边鼓
      for(const [a,k] of [[0.9,0],[0.35,1.1],[0.35,-1.1]]){const X=Math.floor(q[0]+bx*a+nnx*k),Y=Math.floor(q[1]+by*a+nny*k);if(inFish(X,Y))dot(X,Y,'#aa5500');}}
    pline([BA(0.2,0.6),BA(0.222,0.2),BA(0.218,-0.3)],'#aa5500');}   // 鳃：褐色、只到身侧（一整条黑线在鱼朝上时像咧着嘴）
  // 眼睛：落在头里面（鱼小的时候往后、往脊线挪一点，免得一个像素的眼睛把头的边咬掉）
  const es=mode==='mono'?1:2,cand=[[0.085,0.3],[0.1,0.24],[0.115,0.17],[0.13,0.1],[0.15,0.04],[0.17,0]];
  let ei=Lp<16?2:Lp<32?1:0,E0=null;for(;ei<cand.length;ei++){const q=dev(BA(...cand[ei])),X=Math.round(q[0]-es/2),Y=Math.round(q[1]-es/2);let ok=true;
    for(let yy=-1;yy<=es&&ok;yy++)for(let xx=-1;xx<=es;xx++){if((xx<0||xx>=es)&&(yy<0||yy>=es))continue;if(!inFish(X+xx,Y+yy)){ok=false;break;}}if(ok||ei===cand.length-1){E0=[X,Y];break;}}
  if(mode==='mono')dot(E0[0],E0[1],'#000');
  else{g.fillStyle='#fff';g.fillRect(E0[0],E0[1],2,2);const pX=E0[0]+(fw[0]>0?1:0),pY=E0[1]+(Math.abs(fw[1])>0.7?(fw[1]>0?1:0):1);dot(pX,pY,'#000');}   // 瞳仁在眼睛里靠前、靠下的那个像素：看着前面
  c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(SP.c,0,0);c.restore();}
// ---------- 每一关是那一年的一种游戏 ----------
// 1980 吃豆：一排豆，主题的十个音一个音吃一颗（吃豆的“咔”就是旋律）  1989 横版：背景跟着鱼往后卷，一路吃金币
// 1995 躲钩子：鱼钩垂下来，鱼一惊、扭开，钩子空提上去                   2003 大鱼吃小鱼：吃一条长大一点
// 豆、金币、小鱼都按鱼原来的路线摆：鱼在哪一拍游到哪，东西就放在哪——鱼的路线一点没改
const MUS10=[[T10ON+0.45,T10UP[0]],[T10UP[0]+0.25,T10UP[1]],[T10UP[1]+0.25,T10UP[2]],[T10UP[2]+0.25,T10EAT4]];   // 每一关芯片音乐的起止（和 score_full.py 的 chip_level 一致）
const cellT=(k,c)=>MUS10[k][0]+c*(MUS10[k][1]-MUS10[k][0])/16;                                                    // 第 k 关第 c 格（一小节 16 格）
const HOOK10={x:-5836,yTop:-150,y0:-50,tIn:[126.42,126.8],tAlert:126.8,tStrike:127.26,tUp:0.2};
const head10=t=>{const p=heroPoseNow(t);return[p.sp[0].x,p.sp[0].y];};
let EV10C=null,SC2X0=0;
function scroll2(t){return -1.7*(head10(t)[0]-SC2X0);}                                                                  // 1989：背景卷动的量（世界坐标）
function EV10(){if(EV10C)return EV10C;SC2X0=head10(T10UP[0])[0];const E={dots:[],coins:[],minnows:[],pts:[]};
  for(const c of [0,2,4,5,6,8,9,10,12,14]){const te=cellT(0,c);const w=head10(te);E.dots.push({te,w});E.pts.push({te,n:10,w,k:0});}
  E.pts.push({te:T10UP[0],n:50,w:head10(T10UP[0]),k:0});
  for(let c=2;c<=14;c+=2){const te=cellT(1,c);const w=head10(te);E.coins.push({k:1,te,w,sc:scroll2(te)});E.pts.push({te,n:100,w,k:1});}
  E.pts.push({te:T10UP[1],n:500,w:head10(T10UP[1]),k:1});
  E.pts.push({te:HOOK10.tStrike+0.12,n:500,w:[HOOK10.x-10,HOOK10.y0+6],k:2});
  for(const c of [8,10,12,14]){const te=cellT(2,c);const w=head10(te);E.coins.push({k:2,te,w,sc:0});E.pts.push({te,n:100,w,k:2});}
  E.pts.push({te:T10UP[2],n:500,w:head10(T10UP[2]),k:2});
  for(const c of [4,8,12]){const te=cellT(3,c);const a=head10(te),b=head10(te-0.12);const dx=a[0]-b[0],dy=a[1]-b[1],l=Math.hypot(dx,dy)||1;E.minnows.push({te,w:a,d:[dx/l,dy/l],v:0.4*l/0.12});E.pts.push({te,n:200,w:a,k:3});}
  E.pts.push({te:T10EAT4,n:5000,w:head10(T10EAT4),k:3});
  EV10C=E;return E;}
function score10(t){let s=0;for(const e of EV10().pts)if(t>=e.te)s+=e.n*Math.min(1,(t-e.te)/0.3);return Math.round(s);}
function hookY(t){const H=HOOK10;if(t<H.tIn[0])return H.yTop;if(t<H.tStrike){const q=clamp((t-H.tIn[0])/(H.tIn[1]-H.tIn[0]));return lerp(H.yTop,H.y0,1-Math.pow(1-q,3))+1.5*Math.sin((t-H.tIn[0])*7);}
  const q=clamp((t-H.tStrike)/H.tUp);return lerp(H.y0,H.yTop-40,q*q);}
// 鱼一惊：往钩子的反方向一缩（整条鱼平移，不碰路线），尾巴乱摆一下
HAMP.push(t=>(1-0.5*smooth(126.35,126.7,t)*(1-smooth(127.12,127.2,t)))*(1+0.6*smooth(127.15,127.25,t)*(1-smooth(127.6,127.95,t))));   // 1995：凑近饵时屏住，逃的时候尾巴猛摆
HFB.push(t=>1.6*smooth(127.15,127.25,t)*(1-smooth(127.55,127.9,t)));
{const B=[130.625,131.45,132.275,133.1];HAMP.push(t=>{let a=1;for(const b of B)a+=0.55*Math.exp(-(((t-b+0.06)/0.12)**2));return a*(1-0.35*smooth(132.5,132.8,t)*(1-smooth(132.98,133.06,t)));});   // 2003：每一扑尾巴猛甩；盯住大豆子那一下屏住
  HFB.push(t=>{let a=0;for(const b of B)a+=1.2*Math.exp(-(((t-b+0.08)/0.13)**2));return a;});}
// 游出显像管以后尾巴稍微摆快一点，把这一站多游的那段路、多摆的那些下补齐到整圈：后面代码站和终章里鱼的姿态和原来一模一样（PHASE10 是量出来的）
const PHASE10=0.2935;HFB.push(t=>PHASE10*smooth(135.3,135.7,t)*(1-smooth(136.2,136.6,t)));
function rocks03(c){
  // A distant fractured shelf, softened by the water column before the foreground plants.
  const wall=(points,shade)=>{polygon10(c,points,shade);};
  c.save();
  c.beginPath();c.moveTo(417,374);c.bezierCurveTo(449,365,470,341,482,336);
  c.lineTo(496,332);c.lineTo(509,318);c.lineTo(520,319);c.lineTo(535,298);c.lineTo(553,291);
  c.lineTo(560,281);c.lineTo(574,278);c.lineTo(582,260);c.lineTo(601,251);c.lineTo(605,236);c.lineTo(621,230);c.lineTo(641,209);
  c.lineTo(648,396);c.bezierCurveTo(614,394,581,379,549,385);c.bezierCurveTo(510,392,477,381,446,379);c.quadraticCurveTo(432,379,417,374);c.closePath();c.clip();
  const g=c.createLinearGradient(477,237,601,405);
  g.addColorStop(0,'#537b7d');g.addColorStop(.44,'#436c71');g.addColorStop(.80,'#365e66');g.addColorStop(1,'#4d7375');
  c.fillStyle=g;c.fillRect(405,200,246,201);
  for(const [x,y,w,h] of [[451,364,47,11],[493,341,44,12],[513,323,39,12],[531,302,59,12],[555,282,49,13],[574,266,44,12],[589,247,47,13],[612,231,45,12]]){
    wall([[x,y],[x+w*.35,y-h*.38],[x+w*.56,y-h*.29],[x+w,y-h*.81],[x+w*.78,y-h*.17],[x+w*.41,y+1.9]],'rgba(146,167,150,.31)');
    wall([[x+w*.24,y+2],[x+w*.64,y-h*.22],[x+w*.56,y+h*.5],[x+w*.49,y+h],[x+w*.31,y+h*.62]],'rgba(34,60,64,.21)');
  }
  c.restore();
  c.save();c.translate(-5,3);
  const trunk=c.createLinearGradient(45,316,70,338);trunk.addColorStop(0,'rgba(84,115,109,.73)');trunk.addColorStop(.43,'rgba(59,98,94,.78)');trunk.addColorStop(1,'rgba(42,80,82,.82)');
  c.fillStyle=trunk;c.beginPath();c.moveTo(-8,375);
  c.bezierCurveTo(19,358,44,333,68,327);c.bezierCurveTo(91,322,105,313,121,297);
  c.bezierCurveTo(111,315,92,327,74,334);c.bezierCurveTo(53,340,44,349,34,359);
  c.bezierCurveTo(57,357,75,349,87,345);c.bezierCurveTo(70,358,48,364,24,370);c.lineTo(-4,391);c.closePath();c.fill();
  c.strokeStyle='rgba(151,160,137,.27)';c.lineWidth=1.5;c.beginPath();c.moveTo(12,368);c.bezierCurveTo(35,351,55,334,73,330);c.stroke();
  c.restore();
}
function riverPlants03(c,t){
  // Submerged pondweed rises only from the banks. Its laminae expose their pale
  // undersides near the bends, the rest is lost against the cold mid-distance.
  c.save();c.lineJoin='round';c.lineCap='round';
  for(const [x0,y0,h,lean,hand] of [[-4,395,164,33,1],[15,397,128,37,1],[38,389,68,38,1],[610,387,116,-35,-1],[642,379,178,-18,-1]]){
    const pos=v=>[x0+lean*v+11*Math.sin(v*3.35+t*.46+x0*.016)*v,y0-h*v];
    c.beginPath();c.moveTo(x0,y0);
    for(let k=1;k<=15;k++)c.lineTo(...pos(k/15));
    c.strokeStyle='rgba(41,88,79,.82)';c.lineWidth=2.05;c.stroke();
    for(let j=1;j<=5;j++){
      const v=.13+j*.135,[x,y]=pos(v),side=j%2?hand:-hand,span=(10+11*Math.sin(v*Math.PI))*(.80+h/520);
      const swing=1.3*Math.sin(v*4+t*.56+x0);
      const tipX=x+side*span,tipY=y-span*(.95+.16*j)+swing;
      c.beginPath();c.moveTo(x,y);
      c.bezierCurveTo(x+side*span*.46,y-span*.04,x+side*span*.78,tipY+span*.31,tipX,tipY);
      c.bezierCurveTo(x+side*span*.45,tipY+span*.24,x+side*span*.08,y-span*.34,x,y);
      c.fillStyle=j%2?'rgba(53,109,92,.90)':'rgba(67,122,106,.82)';c.fill();
    }
  }
  c.restore();
}
function waterFloorLight03(c,t){
  c.save();
  // Short beds of projected ripples follow the oblique light shaft down to the sand.
  // Each band widens toward camera; fixed paths deform gently without travelling with the fish.
  c.beginPath();c.rect(0,411,640,70);c.clip();
  for(const [cx,cy,count,span] of [[166,429,6,98],[446,442,5,83],[339,461,5,114]]){
    for(let j=0;j<count;j++){
      const u=(j+.5)/count,phase=t*.44+j*.43+cx*.019;
      const x=cx+(u-.5)*span+3*Math.sin(phase),y=cy+u*6+2.1*Math.sin(phase+1.5);
      const w=16+13*Math.sin(u*2.7)+2*Math.sin(phase*.5),h=1.75+.9*Math.cos(phase);
      c.lineCap='round';c.lineWidth=1.06+u*.75;
      const light=c.createLinearGradient(x,y,x+w,y);
      light.addColorStop(0,'rgba(220,225,179,0)');light.addColorStop(.3,'rgba(224,230,192,.48)');light.addColorStop(.63,'rgba(213,227,185,.28)');light.addColorStop(1,'rgba(209,225,184,0)');
      c.strokeStyle=light;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+w*.23,y-h,x+w*.49,y-h*.62,x+w,y+h*.24);c.stroke();
    }
  }
  c.restore();
}
function forageFish03(c,kind,t,bite) {
  const fin=(path,color)=>{c.fillStyle=color;c.fill(path);};
  const ink=(path,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.stroke(path);};
  const skin=(outline,top,bottom,stops)=>{
    const g=c.createLinearGradient(0,top,0,bottom);
    for(const [v,color] of stops)g.addColorStop(v,color);
    c.fillStyle=g;c.fill(outline);
  };
  const eye=(x,y,r)=>{
    c.fillStyle='rgba(230,211,151,.93)';c.beginPath();c.ellipse(x,y,r*1.33,r*1.27,0,0,7);c.fill();
    c.fillStyle='#26332e';c.beginPath();c.arc(x,y,r,0,7);c.fill();
    c.fillStyle='#f8eac9';c.fillRect(x+.05,y-r*.67,.7,.58);
  };
  // Each species moves its own tail. At the mouth the fish folds its fins and disappears behind the head.
  const tailSwing=Math.sin(t*[17.5,10.6,14.1][kind]+kind*1.7)*(1-.64*bite);
  c.save();c.lineJoin='round';c.lineCap='round';
  if(kind===0){
    const dy=tailSwing*3.7;
    fin(new Path2D('M-11 -.8Q-18 -3 -25 '+(-8.1+dy)+'L-21 '+dy+'L-27 '+(6.6+dy)+'Q-18 3 -11 1Z'),'#7e9fa5');
    fin(new Path2D('M-3 -3.6Q-5 -8.3 -10 -8.5L-8.2 -2.7Z'),'#657f7f');
    const body=new Path2D('M17 -1.2Q14 -3.2 8 -4.5Q-1 -6.6 -9 -3.0L-14 -1.6L-15 .9Q-7 2 1 4.2Q9 5.1 15 1.5L17 .4Z');
    skin(body,-5,4.8,[[0,'#445e60'],[.29,'#71969a'],[.54,'#a0bbc0'],[.63,'#e2e9dc'],[.88,'#c3d1c9'],[1,'#9db2b5']]);
    ink(new Path2D('M-11 -.4Q-2 -2.4 8 -.9'),'rgba(247,249,218,.88)',1.2);
    ink(new Path2D('M9 -2.9Q6 -.5 8 2.4'),'rgba(59,90,94,.74)',.68);
    fin(new Path2D('M5 1.1Q4 3.1 -.2 5.8L1.6 1.2Z'),'#99aaa4');eye(12.3,-1.58,1.18);
  } else if(kind===1) {
    const dy=tailSwing*2.15;
    fin(new Path2D('M-8.5 -.8Q-14 -3 -20 '+(-6+dy)+'L-18 '+dy+'L-20 '+(5.9+dy)+'Q-14 3 -8.7 1Z'),'#b08d76');
    fin(new Path2D('M-7 -4.8Q-5 -8.3 -1.2 -13L4 -8.5L6.7 -5.2Z'),'#707480');
    fin(new Path2D('M-8.4 2.8Q-7.2 7.5 -6.9 10L1 6.2Z'),'#b79882');
    const body=new Path2D('M14.2 -1Q14 -3.3 10 -4.8Q7.6 -9 2.3 -9Q-3.9 -9.2 -8.6 -3.9L-12 -.9L-11.6 1.8Q-7 1.8 -3.2 4.6Q4.2 10.3 8.8 6Q12.3 3.6 14.2 .6Z');
    skin(body,-9,8,[[0,'#445b57'],[.29,'#738b70'],[.47,'#acb795'],[.65,'#dec6a3'],[.86,'#c1aba4'],[1,'#a0a0a3']]);
    c.save();c.clip(body);
    ink(new Path2D('M-11 -.65Q-5 -1.7 2.3 -1.8'),'#557f91',1.9);
    ink(new Path2D('M-10 .45Q-4 -.16 .4 -.5'),'#9dbdb6',.78);
    ink(new Path2D('M5 -5.9Q2.9 -1.2 5.6 3.4'),'rgba(74,86,65,.84)',.92);c.restore();
    fin(new Path2D('M5.1 1Q2 2.2 .9 6.2Q4.5 5 6.1 1.8Z'),'#b9947d');eye(9.3,-2.42,1.45);
  } else {
    const dy=tailSwing*4,tail=new Path2D();
    tail.moveTo(-10,-2.1);tail.bezierCurveTo(-16,-2,-19,-4+dy,-24,-4+dy);
    tail.bezierCurveTo(-28,-2+dy,-28,3+dy,-24.5,4.5+dy);
    tail.bezierCurveTo(-19,5.7+dy,-15,.9+dy*.4,-10,1.7);tail.closePath();fin(tail,'#bca379');
    fin(new Path2D('M-8 -1.5Q-8 -6.1 -4 -6.9L1.4 -3Z'),'#9e8b69');
    const body=new Path2D();body.moveTo(17,.1);body.bezierCurveTo(15.5,-3.2,11.3,-4.8,7.3,-4.3);
    body.bezierCurveTo(1,-4.6,-3.8,-2.1-dy*.10,-13,-2+dy*.27);
    body.lineTo(-14,1.8+dy*.27);body.bezierCurveTo(-7,.6+dy*.22,1.5,4.0,8.6,4.1);body.quadraticCurveTo(15.8,4.5,17,1.5);body.closePath();
    skin(body,-4.4,4.4,[[0,'#796a4b'],[.35,'#a59667'],[.60,'#c4b07d'],[1,'#e4cba0']]);
    c.save();c.clip(body);for(const [x,y,r] of [[-10,-.8,.94],[-6.2,-1.2,1.25],[-2.5,-.8,1],[1.7,-2,1.5],[5.3,-1.5,1.1],[8.8,-2.7,1.2],[-3.8,1,1.1],[2,.55,.84]]){
      c.beginPath();c.ellipse(x,y,r*1.31,r*.80,-.19,0,7);c.fillStyle='#716e53';c.fill();
    }c.restore();
    fin(new Path2D('M7.5 1.5Q4.1 3.2 3.1 6.8Q6 7.5 9.4 2.0Z'),'#a48e68');eye(11.7,-1.72,1.08);
    ink(new Path2D('M16 1.2Q18.5 2.3 19.4 4.0M15.1 1.9Q16.4 4.1 16.2 5.2'),'#aa9979',.82);
  }
  c.restore();
}
function deepWater03(c,age,offset) {
  c.save();c.translate(-1.2*offset,0);
  // Floating leaves send thin, bent stalks down the shaded sides of the pool.
  for(const [x,y,a,wide] of [[-8,38,-.13,72],[75,21,.06,55],[151,8,-.17,39],[559,10,.14,56],[644,27,-.08,72]]){
    const drift=2.7*Math.sin(age*.57+x*.08);
    c.save();c.translate(x+drift,y);c.rotate(a+.01*Math.sin(age*.54+x*.07));
    const rim=new Path2D();rim.moveTo(-wide,.3);rim.bezierCurveTo(-wide*.72,-5.8,wide*.48,-5.5,wide,0);rim.bezierCurveTo(wide*.61,6,wide*.18,8.4,4.4,7);rim.lineTo(-.5,2);rim.lineTo(-4.3,6.7);rim.bezierCurveTo(-wide*.38,7,-wide*.91,3.8,-wide,.3);
    const paint=c.createLinearGradient(0,-5,0,8);paint.addColorStop(0,'rgba(109,151,135,.83)');paint.addColorStop(.27,'rgba(70,119,111,.87)');paint.addColorStop(1,'rgba(47,101,97,.76)');
    c.fillStyle=paint;c.fill(rim);c.restore();
    c.lineWidth=1.6;c.strokeStyle='rgba(76,125,118,.61)';c.beginPath();c.moveTo(x+drift,y+5);
    c.bezierCurveTo(x+drift*.8+9,y+62,x-27,y+107,x-23,y+157);c.bezierCurveTo(x-20,y+209,x+14,y+230,x+8,y+287);c.stroke();
  }
  const schoolX=65+age*15.7,schoolY=92-4.3*Math.sin(age*.8);
  for(const [dx,dy,speed,n] of [[-42,9,.75,0],[-30,-9,.87,1],[-8,3,1.1,2],[13,-7,1,3],[38,5,.91,4],[0,19,.78,5],[22,19,.72,6],[52,0,.74,7]]){
    const px=schoolX+dx+3.4*Math.sin(age*1.3+n*.64),py=schoolY+dy+2.5*Math.sin(age*.93+n*.56);
    c.save();c.translate(px,py);c.scale(speed,speed);
    const tail=Math.sin(age*6+n)*2.2;c.scale(1.13,1.16);
    c.beginPath();c.moveTo(8,-.5);c.quadraticCurveTo(1,-3.7,-4,-1.5);c.lineTo(-9,-3.2+tail);c.lineTo(-8,.2+tail*.4);c.lineTo(-9,2.9+tail);c.lineTo(-4,1.2);c.quadraticCurveTo(3,3.1,8,-.5);c.fillStyle='rgba(39,77,85,.84)';c.fill();
    c.beginPath();c.moveTo(-3,-1.1);c.quadraticCurveTo(.8,-2.7,4.4,-1.7);c.strokeStyle='rgba(155,193,177,.50)';c.lineWidth=.85;c.stroke();c.restore();
  }
  // A second, much deeper shoal crosses the narrow blue channel in the opposite direction.
  for(const [dx,dy,size] of [[0,5,1],[21,-4,.8],[34,10,.86],[43,1,1],[65,-7,.73]]){
    const x=433+dx-age*8.6,y=248+dy+2.5*Math.sin(age*.8+dx);
    c.save();c.translate(x,y);c.scale(size,size);c.fillStyle='rgba(35,76,86,.64)';
    c.beginPath();c.moveTo(-6,0);c.quadraticCurveTo(-1,-2.8,3,-.75);c.lineTo(7,-2.4);c.lineTo(6,.2);c.lineTo(7,2.5);c.lineTo(3,.8);c.quadraticCurveTo(-2,2.3,-6,0);c.fill();c.restore();
  }
  c.restore();
}
function bankMeadow03(c,age) {
  c.save();c.lineCap='round';c.lineJoin='round';
  const frond=(x,y,h,lean,phase,near)=>{
    const sway=(2+2*near)*Math.sin(.70*age+phase),stalk=lean+sway;
    const spot=q=>[x+stalk*q*q+1.8*Math.sin(4*q+phase)*q,y-h*q];
    const stem=new Path2D();stem.moveTo(x,y);
    for(let i=1;i<=8;i++){const v=spot(i/8);stem.lineTo(...v);}
    c.lineWidth=near?1.55:1.1;c.strokeStyle=near?'#547c74':'#528187';c.stroke(stem);
    for(let k=2;k<=11;k++){
      const q=k/12,[bx,by]=spot(q),spread=(1.3+4.8*Math.sin(Math.PI*q))*h/40;
      for(const side of [-1,1]){
        const w=spread*(side<0?.90:1.08)*(1+.16*Math.sin(phase+k*2));
        c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+side*w*.74,by-1,bx+side*w,by-2.9-q);
        c.quadraticCurveTo(bx+side*w*.83,by-1.6,bx+side*w*.55,by-.3);
        c.lineTo(bx+side*w*.86,by-.9);c.quadraticCurveTo(bx+side*w*.58,by+1.6,bx+.3*side,by+.9);c.closePath();
        c.fillStyle=near?(side<0?'#50746d':'#739385'):(side<0?'#4b7880':'#5e898c');c.fill();
      }
    }
  };
  // Soft contact beds join the plant roots to a receding shelf.
  for(const [x,y,w,len] of [[139,331,32,9],[213,332,14,3],[315,338,15,4],[352,344,26,6],[518,302,29,7]]){
    c.save();c.translate(x,y);c.scale(w,len);
    const shadow=c.createRadialGradient(0,0,.04,0,0,1);shadow.addColorStop(0,'rgba(39,72,73,.47)');shadow.addColorStop(.45,'rgba(47,77,78,.33)');shadow.addColorStop(1,'rgba(50,85,86,0)');
    c.beginPath();c.arc(0,0,1,0,Math.PI*2);c.fillStyle=shadow;c.fill();c.restore();
  }
  // Small outcrops recede in the blue-green water.
  for(const [x,y,w,h] of [[141,303,28,12],[155,309,20,8],[220,329,18,5],[231,328,15,6],[332,329,31,10],[352,330,22,8],[367,329,9,4],[536,257,20,8],[542,260,16,5]]){
    c.fillStyle='#527c80';c.beginPath();c.moveTo(x-w*.65,y);c.quadraticCurveTo(x-w*.47,y-h*.86,x-w*.14,y-h);c.quadraticCurveTo(x+w*.35,y-h*.88,x+w*.60,y);c.closePath();c.fill();
    c.strokeStyle='#729292';c.lineWidth=1.3;c.beginPath();c.moveTo(x-w*.48,y-h*.42);c.quadraticCurveTo(x-w*.17,y-h*1.03,x+w*.14,y-h*.83);c.stroke();
  }
  for(const [x,y,h,lean,phase,near] of [
    [119,334,29,-7,1.4,0],[132,329,49,7,.3,0],[141,333,34,8,2.1,0],[160,341,26,-4,1.1,0],
    [208,332,21,-6,2.2,0],[213,331,30,4,.4,0],[220,334,15,4,.2,0],
    [304,336,15,-2,.2,0],[312,337,22,5,.65,0],[318,339,17,6,.3,0],
    [344,344,31,-4,.7,0],[350,342,26,8,1.9,0],[363,344,37,5,2.3,0],
    [507,308,31,-6,2,1],[514,300,51,12,.8,1],[523,302,38,7,2.3,1],[549,303,30,-10,1.3,1]
  ])frond(x,y,h,lean,phase,near);
  c.restore();
}
function submergedBough03(c) {
  const shape=new Path2D('M-15 337Q11 312 38 295Q52 278 59 260Q65 247 78 235Q88 226 92 211Q95 203 102 197Q96 211 96 219Q95 228 87 236Q108 225 123 202Q126 198 131 194Q126 204 122 212Q114 229 99 239Q94 243 91 249Q114 245 138 230Q148 223 162 223Q152 227 146 233Q136 241 117 251Q95 260 75 264Q59 278 57 294Q82 288 96 280Q85 292 65 298Q38 309 18 332Q1 339 -15 347Z');
  const paint=c.createLinearGradient(49,238,71,319);paint.addColorStop(0,'#4f7772');paint.addColorStop(.5,'#4c6c62');paint.addColorStop(.81,'#455e58');paint.addColorStop(1,'#394e50');c.fillStyle=paint;c.fill(shape);
  c.save();c.clip(shape);c.lineJoin='round';c.lineCap='round';
  for(const [dx,dy,w,a] of [[0,0,2,.5],[2,4,1.2,.38],[-1,8,1,.24]]){
    c.save();c.translate(dx,dy);c.strokeStyle='rgba(151,153,120,'+a+')';c.lineWidth=w;
    c.stroke(new Path2D('M-4 324Q10 313 31 303Q51 292 62 267Q68 249 88 238Q112 228 128 199M72 262Q106 255 147 232'));c.restore();
  }c.restore();
}
function bankPerch03(c,age) {
  for(const [ox,oy,s,ph] of [[438,293,1.02,.6],[488,262,.72,2.1]]){
    const px=ox-4.7*age+4*Math.sin(age*.8+ph),py=oy+3*Math.sin(age+ph);
    c.save();c.translate(px,py);c.scale(-s,s);
    const twitch=2.4*Math.sin(age*5.1+ph);const shape=new Path2D('M22 -1Q20 -5 12 -6.3Q3 -10 -6 -5.8L-17 -1.9L-18 .8Q-6 2 1 5Q11 8 17 4Z');
    const g=c.createLinearGradient(0,-7.5,0,6);g.addColorStop(0,'#416b69');g.addColorStop(.59,'#728d85');g.addColorStop(1,'#96a395');
    c.fillStyle='#5b8077';c.fill(new Path2D('M-5 -5L-3 -10L-.6 -8L2.6 -11L5.6 -8.3L8.2 -10L13 -5Z'));
    c.fillStyle='#6b8b81';c.fill(new Path2D('M-15 -1.2L-26 '+(-5+twitch)+'Q-23 '+twitch+' -26 '+(5+twitch)+'L-16 .95Z'));
    c.fillStyle=g;c.fill(shape);c.save();c.clip(shape);
    for(const [x,w,len] of [[-8,2.4,6],[-1,2.8,9],[6.2,3,10],[12,1.6,6]]){
      c.fillStyle='rgba(43,73,67,.48)';c.fill(new Path2D('M'+x+' -8l'+w+' .3l-.2 '+(len*.56)+'l-1 '+(len*.46)+'l-2.3 -4Z'));
    }c.restore();
    c.fillStyle='#344e48';c.beginPath();c.arc(16.6,-2.3,1.25,0,7);c.fill();c.restore();
  }
}
function sandShrimp03(c,age) {
  c.save();const x=201+4.6*age,y=438+1.2*Math.sin(age*1.9);c.translate(x,y);c.scale(1.25,1.25);
  const beat=Math.sin(age*6.5);
  c.fillStyle='rgba(76,73,52,.22)';c.beginPath();c.ellipse(-2,6.6,15.4,1.9,-.04,0,7);c.fill();
  c.lineCap='round';c.lineJoin='round';
  c.fillStyle='#978b6a';c.fill(new Path2D('M-8.9 .7L-18 -.8L-15.3 1.4L-18.4 3.5L-8.4 3Z'));
  const body=new Path2D('M-11 1.4Q-5 -3.8 -.9 -4.7Q5 -7.5 10.6 -3.6L15 -2.5L11.4 -1Q9.4 1.3 4 .8Q.7 .7 -1 1.7L-8.9 3Z');
  const shell=c.createLinearGradient(0,-6,0,2.9);shell.addColorStop(0,'#cab88d');shell.addColorStop(.35,'#a79069');shell.addColorStop(1,'#696d57');c.fillStyle=shell;c.fill(body);
  c.lineWidth=.85;c.strokeStyle='#6d725b';
  for(const i of [-7,-4,-1.2]){c.beginPath();c.moveTo(i,-1.9-(i+7)*.34);c.quadraticCurveTo(i+.7,-.1,i+1.8,1.35);c.stroke();}
  for(let j=0;j<4;j++){const n=j*2.3,x=n-.8,tick=beat*Math.sin(j+.8)*1.7;c.beginPath();c.moveTo(x,.2);c.lineTo(x+1.9+tick,3.3);c.lineTo(x-1.3+tick,5.6);c.stroke();}
  c.strokeStyle='rgba(87,91,70,.90)';c.beginPath();c.moveTo(10,-3.1);c.quadraticCurveTo(16,-9.3,24,-7.1+beat);c.moveTo(11,-2.5);c.quadraticCurveTo(18,-5,26,-2.6+beat*.7);c.stroke();
  c.fillStyle='#464c41';c.beginPath();c.arc(9.5,-4.0,.96,0,7);c.fill();c.restore();
}
function drawBed03(c,p,t){
    const offset=p?clamp((toBuf(p.sp[0].x,p.sp[0].y)[0]-320)/320,-1,1):0;
    const grad=(y0,y1,stops)=>{const g=c.createLinearGradient(0,y0,0,y1);for(const [v,color] of stops)g.addColorStop(v,color);return g;};
    const bank=(coords,color)=>{
      c.beginPath();c.moveTo(coords[0],coords[1]);
      for(let i=2;i<coords.length;i+=6)c.bezierCurveTo(...coords.slice(i,i+6));
      c.lineTo(660,485);c.lineTo(-20,485);c.closePath();c.fillStyle=color;c.fill();
    };
    const age=t-(T10UP[2]-T10ON+115);
    deepWater03(c,age,offset);
    c.save();c.translate(-1.7*offset,0);
    bank([-20,257,23,245,36,270,67,258,91,248,110,291,141,288,186,282,173,327,229,323,291,314,307,340,350,326,404,313,404,322,448,286,472,263,494,279,520,244,553,203,588,224,614,190,639,176,653,181,660,176],
      grad(168,436,[[0,'rgba(59,111,119,.62)'],[.63,'rgba(58,103,111,.58)'],[1,'rgba(42,82,95,.52)']]));
    // Distant reeds dissolve into the same cool value as the far bank.
    c.strokeStyle='rgba(74,121,124,.53)';c.lineWidth=2.6;
    for(const [x,y,h] of [[22,302,62],[33,295,45],[120,332,34],[495,310,38],[532,280,47],[545,272,62],[624,249,80]]){
      c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+8,y-h*.32,x-6,y-h*.71,x+2,y-h);c.stroke();
    }
    c.restore();
    bankMeadow03(c,age);bankPerch03(c,age);
    submergedBough03(c);
    c.save();c.translate(-3.2*offset,0);
    bank([-20,323,12,300,35,324,52,315,64,312,71,328,89,330,108,334,117,343,149,349,182,354,188,370,247,374,320,388,361,366,398,364,422,364,465,351,482,340,529,314,538,337,565,317,593,306,619,287,660,290],
      grad(295,442,[[0,'#385e65'],[.59,'#477279'],[1,'#699194']]));
    c.restore();
    rocks03(c);riverPlants03(c,t);
    // Gravel runs into pale silt at a soft, uneven horizon. Larger stones sit only near the edges.
    bank([-20,404,62,392,108,396,147,402,186,409,225,406,261,408,348,419,389,399,428,400,503,392,579,400,660,386],
      grad(386,480,[[0,'#708988'],[.28,'#969e91'],[.68,'#aaa58a'],[1,'#7b7a65']]));
    const stone=(x,y,w,h,light,dark)=>{
      c.fillStyle='rgba(38,55,54,.22)';c.beginPath();c.ellipse(x+w*.08,y+h*.02,w*.55,h*.13,0,0,7);c.fill();
      const rock=grad(y-h,y,[[0,light],[.35,light],[.67,dark],[1,dark]]);
      c.fillStyle=rock;c.beginPath();c.moveTo(x-w*.52,y-h*.08);
      c.bezierCurveTo(x-w*.52,y-h*.52,x-w*.34,y-h*.77,x-w*.15,y-h*.89);
      c.bezierCurveTo(x+w*.04,y-h*1.05,x+w*.16,y-h*.94,x+w*.29,y-h*.69);
      c.bezierCurveTo(x+w*.38,y-h*.50,x+w*.57,y-h*.22,x+w*.47,y-h*.10);
      c.bezierCurveTo(x+w*.31,y-h*.01,x-w*.21,y+h*.02,x-w*.52,y-h*.08);c.fill();
      if(w>35){
        c.fillStyle='rgba(200,194,155,.24)';c.beginPath();c.moveTo(x-w*.51,y-h*.33);
        c.lineTo(x-w*.36,y-h*.71);c.lineTo(x-w*.22,y-h*.84);c.lineTo(x-w*.07,y-h*.9);c.lineTo(x+w*.029,y-h*.70);
        c.lineTo(x-w*.132,y-h*.56);c.lineTo(x-w*.28,y-h*.535);c.closePath();c.fill();
        c.fillStyle='rgba(48,64,61,.26)';c.beginPath();c.moveTo(x+w*.15,y-h*.81);c.lineTo(x+w*.24,y-h*.72);
        c.lineTo(x+w*.45,y-h*.27);c.lineTo(x+w*.38,y-h*.18);c.lineTo(x+w*.16,y-h*.47);c.closePath();c.fill();
        for(let j=1;j<=11;j++){
          const rx=x-w*.28+((j*7)%13)/13*w*.51,ry=y-h*(.16+((j*13)%17)/17*.28);
          c.fillStyle=j%3?'rgba(45,57,49,.28)':'rgba(189,181,141,.35)';c.fillRect(rx,ry,1.4+((j*5)%7)*w/85,.8+((j*3)%5)*h/30);
        }
      }
      c.strokeStyle='rgba(82,92,82,.52)';c.lineWidth=.85;c.beginPath();c.moveTo(x-w*.10,y-h*.88);c.quadraticCurveTo(x+w*.03,y-h*.63,x+w*.13,y-h*.48);c.stroke();
    };
    for(const [x,y,w,h] of [[-6,411,119,79],[43,406,54,38],[80,406,42,22],[111,406,27,9],[476,405,19,8],[521,403,38,16],[570,401,94,37],[635,401,96,62]]){
      stone(x-offset*3,y,w,h,'#687f79','#465e60');
    }
    c.lineWidth=.95;
    for(let j=0;j<14;j++){
      const u=(j*83)%622+8,v=421+(j*11)%49,w=6+(j*13)%37;
      c.strokeStyle=j%2?'rgba(206,203,169,.30)':'rgba(105,117,99,.24)';
      c.beginPath();c.moveTo(u,v);c.quadraticCurveTo(u+w*.6,v-1.5,w+u,v+.6);c.stroke();
    }
    waterFloorLight03(c,t);sandShrimp03(c,age);
    // Fine sand is stationary in this fixed playfield. Group fragments with depth instead of an even tile.
    for(let j=1;j<=112;j++){
      const x=((j*163)%659)+4*Math.sin(j*71),y=414+(j*37%67),s=(y-406)/74;
      c.fillStyle=j%4?'rgba(78,81,67,.24)':'rgba(211,202,169,.43)';
      c.beginPath();c.ellipse(x,y,(.65+(j%5)*.54)*s+.2,(.42+.2*(j%4))*s,Math.sin(j)*.17,0,7);c.fill();
    }
    c.save();c.translate(-offset*5,0);
    for(const [x,y,w,h] of [[-3,469,118,51],[37,464,72,30],[67,464,40,14],[91,455,30,12],[127,449,27,9],[141,449,9,4],[465,452,14,6],[491,445,32,12],[532,450,43,17],[559,466,78,35],[631,469,130,56]]){
      stone(x,y,w,h,'#888c79','#555d54');
    }
    c.restore();
  }
  function air03(c,ta){
    // Reflected crescents identify air. Low-contrast suspended sediment occupies the middle water.
    for(let j=0;j<13;j++){
      const side=j<6?32:544,seed=(j*41)%82,depth=j%3;
      const y=419-(ta*(13+depth*4)+j*47)%417,x=side+seed+4*Math.sin(ta*.92+j*.83);
      const r=1.45+depth*.98;
      c.strokeStyle='rgba(164,208,205,'+(.19+.035*depth)+')';c.lineWidth=1.1;
      c.beginPath();c.arc(x,y,r,0,7);c.stroke();
      c.strokeStyle='rgba(220,236,213,'+(.32+.06*depth)+')';c.beginPath();c.arc(x,y,r*.76,3.65,5.12);c.stroke();
    }
    c.fillStyle='rgba(181,215,205,.28)';
    for(let j=0;j<27;j++){
      const x=(j*137+2.2*Math.sin(ta*.55+j))%640,y=(j*79-ta*(.5+j%3)+820)%399+13;
      c.fillRect(x,y,j%3?1.15:1.8,.8);
    }
  }
function gameLayer(k,t,c,p,ta){const E=EV10();
  if(k===0){c.fillStyle='#fff';for(const [x,y,w,h] of [[16,64,608,16],[16,448,608,16],[16,64,16,400],[608,64,16,400],[96,128,160,16],[96,128,16,64],[384,384,176,16],[544,336,16,64]])c.fillRect(x,y,w,h);   // 迷宫的墙
    for(const d of E.dots){if(t>=d.te)continue;const [x,y]=toBuf(...d.w);c.fillRect(Math.floor(x/16)*16,Math.floor(y/16)*16,16,16);}}
  if(k===1||k===2){const sc=k===1&&p?scroll2(t):0;for(const o of E.coins){if(o.k!==k||t>=o.te)continue;const [x,y]=toBuf(o.w[0]+(sc-o.sc),o.w[1]);const sp=Math.abs(Math.cos(ta*5+o.te*3));
      if(k===1){c.fillStyle='#0f380f';c.beginPath();c.ellipse(x,y,20*sp+4,20,0,0,7);c.fill();c.fillStyle='#9bbc0f';c.beginPath();c.ellipse(x,y,9*sp+2,9,0,0,7);c.fill();}
      else{c.fillStyle='#ffd040';c.beginPath();c.ellipse(x,y,11*sp+2,11,0,0,7);c.fill();c.fillStyle='#fff8b0';c.fillRect(x-2*sp,y-7,3*sp+1,6);}}}
  if(k===2){const hy=hookY(t);if(hy>HOOK10.yTop-35){const [bx,by]=toBuf(HOOK10.x+11+2*Math.sin(ta*2.2),hy);c.strokeStyle='#e8e8e8';c.lineWidth=4;c.beginPath();c.moveTo(bx,-4);c.lineTo(bx,by);c.stroke();
      c.strokeStyle='#b8b8c8';c.lineWidth=5;c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by+22);c.arc(bx-10,by+22,10,0,Math.PI);c.lineTo(bx-20,by+12);c.stroke();
      if(t<HOOK10.tStrike+0.05){c.fillStyle='#ff6aa0';for(let i=0;i<4;i++){c.beginPath();c.arc(bx-6-4*Math.sin(ta*9+i),by+26+i*7,6,0,7);c.fill();}}}}
  if(k===3){for(const [kind,m] of E.minnows.entries()){if(t>=m.te+.055)continue;const dt=t-m.te;const nx=-m.d[1],ny=m.d[0];const q=kind===1?clamp((-dt-.22)/.61,0,1):0;
      const arc=19.5*q*q*(3-2*q),across=-19.5*6*q*(1-q)/.61;
      const wob=arc+[2.0,3.5,2.7][kind]*Math.sin(ta*[7.9,4.1,6.5][kind]+m.te*5)*smooth(0,.16,-dt);
      let wx=m.w[0]+m.d[0]*m.v*dt+nx*wob,wy=m.w[1]+m.d[1]*m.v*dt+ny*wob;
      if(dt>-.17){
        const head=p?p.sp[0]:heroPoseNow(t).sp[0],mix=smooth(-.17,-.09,dt);
        const lip=lerp(12,-14,smooth(-.12,.052,dt));
        wx=lerp(wx,head.x+m.d[0]*lip,mix);wy=lerp(wy,head.y+m.d[1]*lip,mix);
      }
      const [x,y]=toBuf(wx,wy),angle=across?Math.atan2(m.d[1]*m.v+ny*across,m.d[0]*m.v+nx*across):Math.atan2(m.d[1],m.d[0]);c.save();c.translate(x,y);c.rotate(angle);
      c.scale(1.40,1.40*(Math.cos(angle)<0?-1:1));forageFish03(c,kind,ta,smooth(-.13,.052,dt));c.restore();}}}
// 屏幕上的计分板：分数、命、吃到东西的“+10”、升级时的大字卡、看见钩子时的“！”
function fishIcon(c,x,y,px,col){c.fillStyle=col;const R=['.###.#','#.####','.###.#'];R.forEach((r,j)=>{for(let i=0;i<6;i++)if(r[i]==='#')c.fillRect(x+i*px,y+j*px,px,px);});}
function hud10(t,k,p){const px=[8,8,4,3][k],col=k===1?'#0f380f':'#fff';
  pixText(sbx,String(yearAt(t)),SBW-18*px,px*3,px,col);pixText(sbx,'LV'+(k+1),px*3,px*3,px,col);
  const sc=String(score10(t)).padStart(6,'0');pixText(sbx,sc,SBW/2-12*px,px*3,px,col);
  const ip=Math.max(2,Math.round(px*0.45));for(let i=0;i<3;i++)fishIcon(sbx,px*3+12*px+px*1.5+i*7*ip,px*3+px*1.2,ip,col);   /* 命：三条小鱼，跟在 LV 后面 */
  for(const e of EV10().pts){const dt=t-e.te;if(dt<0||dt>0.7||e.k!==k)continue;if(dt>0.45&&Math.floor(dt*16)%2)continue;const [x,y]=toBuf(...e.w);const fp=[6,5,4,3][k];
    pixText(sbx,'+'+e.n,x-((String(e.n).length+1)*4*fp)/2,y-34-60*dt,fp,k===1?'#0f380f':k===2?'#ffff55':'#fff');}
  if(k===2&&p&&t>=HOOK10.tAlert&&t<HOOK10.tStrike+0.12&&Math.floor((t-HOOK10.tAlert)*12)%2===0){const [x,y]=toBuf(p.sp[0].x,p.sp[0].y);pixText(sbx,'!',x-10,y-90,7,'#ffff55');}
  if(k>0){const dt=t-T10UP[k-1]-0.3;if(dt>=0&&dt<0.6&&(dt<0.35||Math.floor(dt*10)%2===0)){const fp=[0,12,10,9][k],txt='LEVEL '+(k+1),w=(txt.length*4-1)*fp;
    sbx.fillStyle=k===1?'rgba(155,188,15,0.92)':'rgba(0,0,0,0.6)';sbx.fillRect(SBW/2-w/2-fp*2,SBH*0.42-fp*2,w+fp*4,fp*9);pixText(sbx,txt,SBW/2-w/2,SBH*0.42,fp,k===1?'#0f380f':k===2?'#ffff55':'#fff');}}}
// 升级、吃大豆子的那一下：镜头往前一顿
CAMHOOK.push(r=>{const t=W5(r);let b=0;for(const tu of [...T10UP,T10EAT4])if(t>=tu)b=Math.max(b,Math.exp(-(t-tu)*9));return[0,0,1+0.03*b];});
function drawLevelScene(k,t,c,p){const l=LV[k],ta=t-T10ON+115;/* ta：屏里动画用的钟（水草、气泡、豆子的闪） */c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,l.rx,l.ry);c.setTransform(l.rx/SBW,0,0,l.rx/SBW,0,0);
  // 背景
  if(k===0){c.fillStyle='#000';c.fillRect(0,0,SBW,SBH);}
  else if(k===1){
    const off=(p?scroll2(t):0)*SBW/SCR.w,wr=(x,P)=>((x%P)+P)%P;
    c.fillStyle='#f4f4f4';c.fillRect(0,0,SBW,SBH);
    c.save();c.scale(8,8);
    // Side-scrolling Game Boy water level: use a quiet open lane and two rocky shelves.
    function tile(shift,period,draw){const base=Math.floor(shift/8)%period;for(let x=base-period*2;x<81;x+=period){c.save();c.translate(x,0);draw();c.restore();}}
    function fill(points,color){c.fillStyle=color;c.beginPath();c.moveTo(points[0][0],points[0][1]);for(const q of points.slice(1))c.lineTo(q[0],q[1]);c.closePath();c.fill();}
    tile(off*.32,107,()=>{fill([[0,49],[7,49],[7,46],[14,46],[14,44],[21,44],[21,40],[25,40],[25,39],[31,39],[31,41],[35,41],[35,44],[40,44],[40,48],[50,48],[50,50],[58,50],[58,47],[66,47],[66,44],[69,44],[69,42],[76,42],[76,40],[81,40],[81,42],[88,42],[88,45],[94,45],[94,49],[107,49],[107,60],[0,60]],'#aaa');
     c.fillStyle='#f4f4f4';c.fillRect(22,41,4,1);c.fillRect(69,44,5,1);c.fillRect(82,45,3,1);});
    tile(off,115,()=>{c.translate(0,2);fill([[0,55],[8,55],[8,53],[12,53],[12,50],[15,50],[15,48],[24,48],[24,49],[27,49],[27,52],[31,52],[31,54],[40,54],[40,55],[55,55],[55,54],[66,54],[66,52],[69,52],[69,49],[72,49],[72,46],[78,46],[78,47],[83,47],[83,48],[89,48],[89,51],[93,51],[93,54],[100,54],[100,55],[115,55],[115,60],[0,60]],'#575757');
     fill([[66,56],[69,56],[69,53],[72,53],[72,51],[75,51],[75,50],[79,50],[79,51],[82,51],[82,52],[85,52],[85,55],[88,55],[88,57],[66,57]],'#aaa');
     c.fillStyle='#141414';for(const r of [[14,51,5,1],[19,49,3,1],[26,53,3,1],[71,48,4,1],[78,48,3,1],[84,50,3,1],[88,53,3,1],[8,57,6,1],[57,57,7,1],[48,56,2,1]])c.fillRect(...r);});
    c.restore();
    c.fillStyle='#8bac0f';for(let i=0;i<8;i++){const bx=wr(i*97+30+off*.4,720)-40,by=60+((i*71)%220);c.fillRect(bx,by,10,10);}
    c.fillStyle='#306230';for(let i=0;i<6;i++){const sx=wr(i*131+70+off,786)-80;for(let j=0;j<6;j++)c.fillRect(sx+12*Math.sin(j*.9+ta*1.5+i),480-j*28,14,26);}
  }
  else if(k===2){const water=(index)=>'rgb('+WATER95[index].join(',')+')';
    c.fillStyle=water(1);c.fillRect(0,0,SBW,SBH);
    // Edge banks submerge at different depths. Broad shapes leave the route through the central water quiet.
    for(const [h,col] of [[411,2],[278,3],[112,4]]){
      c.fillStyle=water(col);c.beginPath();c.moveTo(0,0);c.lineTo(SBW,0);
      for(let x=SBW;x>=0;x-=8){
        const y=h-0.22*x+24*Math.sin(x/162+col)+13*Math.cos(x/88+col*.65);
        c.lineTo(x,Math.round(y/8)*8);
      }c.closePath();c.fill();
    }c.fillStyle='#c09040';c.fillRect(0,430,SBW,50);
    c.fillStyle='#20a040';for(const sx of [60,110,540,590]){for(let j=0;j<7;j++)c.fillRect(sx+16*Math.sin(j*0.8+ta*1.4),430-j*30,18,30);}
    c.fillStyle='#a0e0ff';for(let i=0;i<10;i++){const bx=(i*97+40)%SBW,by=SBH-((ta*60+i*53)%SBH);c.fillRect(bx,by,8,8);}}
  else{const g=c.createLinearGradient(0,0,0,SBH);g.addColorStop(0,'#3c869a');g.addColorStop(.48,'#2b637e');g.addColorStop(1,'#213e58');c.fillStyle=g;c.fillRect(0,0,SBW,SBH);
    c.save();c.globalCompositeOperation='screen';
for(const [x0,w,len,speed,ph,strength] of [[40,66,350,.48,0,.18],[208,38,415,.61,1.1,.12],[438,80,393,.37,2.5,.24],[552,32,281,.41,3.1,.12]]){
 const dx=14*Math.sin(ta*speed+ph);
 for(let j=0;j<18;j++){
  const u=j/18,half=w*(1-u)*.5,beam=c.createLinearGradient(0,0,0,len);
  beam.addColorStop(0,'rgba(159,231,243,'+strength*.14+')');beam.addColorStop(.36,'rgba(121,211,249,'+strength*.085+')');beam.addColorStop(1,'rgba(51,162,220,0)');
  c.fillStyle=beam;c.beginPath();c.moveTo(x0+dx-half,0);c.lineTo(x0+dx+half,0);c.lineTo(x0+dx+half*1.75-60,len);c.lineTo(x0+dx-half*1.65-60,len);c.closePath();c.fill();
 }
}c.restore();
    drawBed03(c,p,ta);
    for(const [sx,h,ph] of [[49,171,0],[79,104,1],[565,182,2],[609,134,3]]){
      for(const [offset,height,lean,width] of [[-4,.78,-26,5],[0,1,8,5.2],[4,.56,23,3.6]]){
        const left=[],right=[];
        for(let j=0;j<=20;j++){
          const s=j/20,cy=436-h*height*s;
          const cx=sx+offset+lean*s+Math.sin(s*5-ta*1.26+ph)*12*s;
          const hw=width*(.48+.75*Math.sin(Math.PI*s))*(1-s);
          left.push([cx-hw,cy]);right.push([cx+hw,cy]);
        }
        const paint=c.createLinearGradient(0,436,0,436-h*height);paint.addColorStop(0,'#365548');paint.addColorStop(.62,'#44785f');paint.addColorStop(1,'#507e6a');
        c.fillStyle=paint;c.beginPath();c.moveTo(...left[0]);for(const pt of left)c.lineTo(...pt);for(const pt of right.reverse())c.lineTo(...pt);c.closePath();c.fill();
      }
    }
    air03(c,ta);}
  // 豆
  gameLayer(k,t,c,p,ta);
  for(let i=k;i<=k;i++){if(i===3&&t>=T10EAT4)continue;const [px,py]=toBuf(PELLETS[i][0]+(k===1&&p?scroll2(t)-scroll2(T10UP[1]):0),PELLETS[i][1]);const big=i===3;const pul=1+0.15*Math.sin(ta*8);const r=big?11*(1+.06*Math.sin(ta*8)):7*pul;
    if(k===0){c.fillStyle='#fff';c.fillRect(px-r,py-r,2*r,2*r);}
    else if(k===1){c.fillStyle='#0f380f';c.fillRect(px-r,py-r,2*r,2*r);}
    else{c.fillStyle=big?'#d4aa54':'#fff060';c.beginPath();c.arc(px,py,r,0,7);c.fill();if(k===3){c.fillStyle='rgba(255,255,255,0.8)';c.beginPath();c.arc(px-r*.29,py-r*.30,r*.19,0,7);c.fill();}}}
  // 鱼
  if(p){const b=fishToBuf(p);
    if(k===3){let x0=1e9,x1=-1e9,ym=0;for(const q of b.sp){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);ym+=q.y;}ym/=b.sp.length;const hg=clamp((452-ym)/320),rx=Math.max(b.L*0.2,(x1-x0)*0.5)*(1+0.25*hg);   // 2003：沙地上一团影子（3D 才有），鱼离沙地越远越淡越散
      c.save();c.filter=`blur(${(1.5+2.5*hg).toFixed(1)}px)`;c.fillStyle=`rgba(70,46,14,${(0.32-0.2*hg).toFixed(3)})`;c.beginPath();c.ellipse((x0+x1)/2,452,rx,b.L*0.045*(1+0.3*hg),0,0,7);c.fill();c.restore();}
    gameFish(c,b,['mono','gb','ega','hi'][k],gameRoll(t));}
  // 量化到这一级的调色板
  const img=c.getImageData(0,0,l.rx,l.ry),d=img.data;
  for(let i=0;i<d.length;i+=4){const pi=i/4,xx=pi%l.rx,yy=(pi/l.rx)|0;const bay=BAYER4[(yy%4)*4+(xx%4)];let r=d[i],g=d[i+1],bl=d[i+2];
    if(k===0){const v=(r*0.3+g*0.59+bl*0.11)>127?255:0;d[i]=d[i+1]=d[i+2]=v;}
    else if(k===1){const lum=(r*0.3+g*0.59+bl*0.11)/255;const q=clamp(Math.round(lum*3+bay*0.6),0,3);[d[i],d[i+1],d[i+2]]=PAL_GB[q];}
    else if(k===2){
      let best=0,bd=1e9;
      if(!(bl>r*1.30&&bl>g*1.15)){r+=bay*40;g+=bay*40;bl+=bay*40;}
      for(let j=0;j<WATER95.length;j++){const P=WATER95[j],dd=(r-P[0])**2+(g-P[1])**2+(bl-P[2])**2;if(dd<bd){bd=dd;best=j;}}
      [d[i],d[i+1],d[i+2]]=WATER95[best];
    }
    else{d[i]=Math.round((r+bay*3)*31/255)*255/31;d[i+1]=Math.round((g+bay*2)*63/255)*255/63;d[i+2]=Math.round((bl+bay*3)*31/255)*255/31;}d[i+3]=255;}
  c.putImageData(img,0,0);}
// 屏幕缓冲：按当前关卡出图；升级时一道扫描线从上往下刷新
function lockWaterPalette(){
  // Composite HUD, rolling scan and gameplay on the same native 160 x 120 palette.
  const slot=LV[2],surface=LVC[2];surface.x.setTransform(1,0,0,1,0,0);
  surface.x.imageSmoothingEnabled=false;surface.x.drawImage(SB,0,0,slot.rx,slot.ry);
  const image=surface.x.getImageData(0,0,slot.rx,slot.ry),bytes=image.data,cache=new Map();
  for(let i=0;i<bytes.length;i+=4){
    const r=bytes[i],g=bytes[i+1],b=bytes[i+2],key=(r<<16)|(g<<8)|b;
    let color=cache.get(key);
    if(!color){let delta=Infinity;for(const candidate of WATER95){
      const ds=(r-candidate[0])**2+(g-candidate[1])**2+(b-candidate[2])**2;
      if(ds<delta){delta=ds;color=candidate;}
    }cache.set(key,color);}
    bytes[i]=color[0];bytes[i+1]=color[1];bytes[i+2]=color[2];
  }
  surface.x.putImageData(image,0,0);sbx.imageSmoothingEnabled=false;sbx.drawImage(surface.c,0,0,SBW,SBH);
}
function renderScreen(t,p){EV10();const k=levelAt(t);sbx.setTransform(1,0,0,1,0,0);sbx.imageSmoothingEnabled=false;
  drawLevelScene(k,t,LVC[k].x,p);sbx.drawImage(LVC[k].c,0,0,SBW,SBH);
  const tu=T10UP[k-1];if(k>0&&t<tu+0.35){const q=(t-tu)/0.35;drawLevelScene(k-1,t,LVC[k-1].x,p);const yy=Math.floor(q*SBH);sbx.drawImage(LVC[k-1].c,0,yy*LV[k-1].ry/SBH,LV[k-1].rx,LV[k-1].ry*(1-q),0,yy,SBW,SBH-yy);sbx.fillStyle='rgba(255,255,255,0.85)';sbx.fillRect(0,yy-3,SBW,6);}
  hud10(t,k,p);
  const fl=Math.max(...T10UP.map(tu=>Math.exp(-Math.max(0,t-tu)*14)*(t>=tu?1:0)));if(fl>0.02){sbx.fillStyle=`rgba(255,255,255,${0.5*fl})`;sbx.fillRect(0,0,SBW,SBH); } if(k===2)lockWaterPalette();}
// ---------- 显像管：外壳、玻璃、扫描线、开机与塌缩 ----------
const SCRC=mk(W,H),scx=SCRC.getContext('2d');

// Front elevation of a small display monitor. The tube has its own glass and recessed surround.
const TVF={x0:SCR.x-186,y0:SCR.y-SCR.h/2-32,w:372,h:320};
function rect10(c,x,y,w,h,r,paint){
  c.fillStyle=paint;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
}
function polygon10(c,points,color){
  c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}
function fade10(c,x1,y1,x2,y2,stops){
  const gradient=c.createLinearGradient(x1,y1,x2,y2);for(const [p,color] of stops)gradient.addColorStop(p,color);return gradient;
}
function crtGlass(c){
  const {x,y,w,h}=SCR,rx=w/2,ry=h/2;
  c.beginPath();c.moveTo(x,y-ry+.8);
  c.bezierCurveTo(x+rx*.34,y-ry+.3,x+rx*.86,y-ry+.8,x+rx*.946,y-ry+2.25);
  c.bezierCurveTo(x+rx*.989,y-ry+3.4,x+rx-1.65,y-ry+8,x+rx-1.2,y-ry+19);
  c.bezierCurveTo(x+rx+.7,y-ry*.39,x+rx+.6,y+ry*.43,x+rx-2.0,y+ry-23);
  c.quadraticCurveTo(x+rx-2.8,y+ry-5.8,x+rx*.904,y+ry-4);
  c.bezierCurveTo(x+rx*.52,y+ry+.3,x-rx*.53,y+ry+.3,x-rx*.904,y+ry-4);
  c.quadraticCurveTo(x-rx+2.5,y+ry-5.8,x-rx+2,y+ry-23);
  c.bezierCurveTo(x-rx-.6,y+ry*.43,x-rx-.7,y-ry*.39,x-rx+1.2,y-ry+19);
  c.bezierCurveTo(x-rx+1.65,y-ry+8,x-rx*.989,y-ry+3.4,x-rx*.946,y-ry+2.25);
  c.bezierCurveTo(x-rx*.86,y-ry+.8,x-rx*.34,y-ry+.3,x,y-ry+.8);c.closePath();
}

  function stroke10(c,width,paint,path){
    c.strokeStyle=paint;c.lineWidth=width;c.beginPath();path(c);c.stroke();
  }
  function oval10(c,x,y,rx,ry,paint){
    c.fillStyle=paint;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
  }
  function soft10(c,x,y,rx,ry,stops){
    c.save();c.translate(x,y);c.scale(rx,ry);
    const g=c.createRadialGradient(0,0,0,0,0,1);for(const [at,color] of stops)g.addColorStop(at,color);
    c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
  }
  function shadow10(c,x,y,rx,ry,a){
    soft10(c,x,y,rx,ry,[[0,'rgba(43,35,28,'+a+')'],[.62,'rgba(43,35,28,'+(a*.44)+')'],[1,'rgba(43,35,28,0)']]);
  }
  function shelf10(c){
    c.save();c.translate(SCR.x,0);
    polygon10(c,[[-213,148],[213,148],[237,228],[-237,228]],
      fade10(c,-21,148,0,228,[[0,'#b8afa0'],[.28,'#cfc8b9'],[1,'#dcd5c8']]));
    rect10(c,-237,228,474,3.1,.7,fade10(c,0,228,0,231,[[0,'#e5ded3'],[.34,'#c6beaf'],[1,'#aba598']]));
    shadow10(c,4,154,195,12,.47);
    c.restore();
  }
  // Cache the integral moulding: a rolled corner turns continuously from the
  // shadowed upper slope into the left/right returns without four mitre joints.
function inset10(c){
  let image=inset10.surface;
  if(!image){
    const size=4,w=342*size,h=257*size;
    image=mk(w,h);
    const cx=image.getContext('2d'),frame=cx.createImageData(w,h),d=frame.data,rand=rng(1712);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){
      const x=i/size-171,y=j/size-155, ax=Math.abs(x), ay=y+26.5;
      const gutterX=169.5-ax,gutterY=y< -26.5?(y+153.7):99-y;
      // A recessed sharp outer moulding and softened inner tube collar share the same light.
      const dx=gutterX/18.1,dy=gutterY/(ay<0?16.7:10.7);
      const round=.47;
      const u=Math.min(dx,dy)-Math.max(round-Math.abs(dx-dy),0)**2/(4*round);
      const blend=smooth(-round,round,dy-dx);
      const facing=(x>0?-.03:.46)*blend + (ay<0?-1:.92)*(1-blend);
      const lip=smooth(-.01,.10,u)*(1-smooth(.15,.29,u));
      const plane=smooth(.08,.25,u)*(1-smooth(.75,.94,u));
      const collar=smooth(.74,.88,u)*(1-smooth(.91,1.02,u));
      const grain=(rand()-.5)*5.4;
      const value=50+14*facing*plane+10*facing*lip-13*smooth(.035,.115,u)+6.5*collar-15*smooth(.82,1.04,u)+grain;
      const n=(j*w+i)*4;
      d[n]=value+4.3;d[n+1]=value+1.8;d[n+2]=value+2;
      d[n+3]=u>-.012?255:0;
    }
    cx.putImageData(frame,0,0);
    inset10.surface=image;
  }
  c.drawImage(image,-171,-155,342,257);
}
  function crtHousing(c){
    c.save();c.translate(SCR.x,0);
    const b=TVF.y0+TVF.h,t=TVF.y0;
    const vert=(y1,y2,stops)=>fade10(c,0,y1,0,y2,stops);
    for(const a of [-162,135]){
      rect10(c,a-1,b-1,29,5.2,1.2,vert(b-1,b+4,[[0,'#534d42'],[.55,'#514a40'],[1,'#373832']]));
      rect10(c,a,b+3,27,.6,.2,'#615a4c');
    }
    // The outside escutcheon, cover and foot are three different pieces of moulded plastic.
    rect10(c,-186,t,372,b-t,3.3,fade10(c,-167,t,135,b,[[0,'#dedad1'],[.32,'#c9c3b9'],[.72,'#c1b9ad'],[1,'#a59d92']]));
    rect10(c,-184.9,t+.8,369.8,1.15,.5,'#ece7db');
    rect10(c,183.7,t+3,1.05,b-t-5,.4,'rgba(78,70,57,.31)');
    const outerTop=t+6,outerBot=106;
    rect10(c,-180.8,outerTop-.75,361.6,outerBot-outerTop+1.65,1.9,'#a29a88');
    rect10(c,-179.7,outerTop,359.4,outerBot-outerTop,1.6,'#37352f');
    // Much of the chamfer is a flat facing with one distinct inner return at the tube.
    rect10(c,-178,outerTop+1,356,outerBot-outerTop-2.2,1.1,vert(outerTop,outerBot,[[0,'#4b473f'],[.06,'#413d37'],[.73,'#45413b'],[1,'#514b42']]));
    inset10(c);
    rect10(c,-151.8,-138.7,303.6,229,14.6,'#252723');
    stroke10(c,.75,'rgba(239,220,185,.22)',p=>{p.moveTo(-177.9,outerBot-.95);p.lineTo(177.6,outerBot-.95)});
    // A narrow upper fascia overhangs a hinged control cover. Its thumb recess is a tiny cut-out.
    rect10(c,-184.7,108.5,369.3,11.3,1.0,vert(108.5,120,[[0,'#d9d4c9'],[.32,'#c7bfb0'],[1,'#b4aa9c']]));
    rect10(c,-183.7,119.3,367.3,1.25,.2,'#847d6d');
    rect10(c,-183.5,120.8,366.7,1.0,.2,'#e1d9c7');
    rect10(c,-184.2,122.1,368.3,b-122.4,1.4,vert(122,b,[[0,'#c6beaf'],[.59,'#bcb3a7'],[.94,'#aaa296'],[1,'#8a857b']]));
    rect10(c,-178.7,122.0,269.8,25.8,1.15,'#8f8775');
    rect10(c,-177.9,122.6,268.0,23.95,.8,vert(122,b,[[0,'#d4cbbd'],[.3,'#c8bfb2'],[.88,'#bfb6aa'],[1,'#aba293']]));
    rect10(c,-62,122.5,30,2.2,.6,'#a29a86');
    rect10(c,-60.7,122.7,27.4,.8,.3,'#827c6d');
    rect10(c,-177.2,147.8,266.7,.65,.3,'#dfd6c2');
    for(const [ax,color] of [[113,'#bfa450'],[129,'#c9c7b6']]){
      const ay=134;
      oval10(c,ax+.25,ay+.35,5.65,5.45,'#e3d9c3');
      oval10(c,ax,ay,5.3,5.2,'#817867');
      oval10(c,ax-.1,ay-.32,4.45,4.43,vert(ay-5,ay+5,[[0,'#e3ddcd'],[.38,color],[1,'#887e65']]));
      oval10(c,ax,ay,3.14,3.22,'#413e34');oval10(c,ax,ay-.23,2.47,2.57,'#292c29');
      oval10(c,ax+.1,ay-.1,.76,.80,'#998d72');
    }
    rect10(c,153,128.2,21.6,12.5,1.1,'#e4dac5');
    rect10(c,153,128,21.25,11.9,.8,'#5e5a4d');
    rect10(c,154.3,129,18.7,8.8,.65,vert(129,138,[[0,'#b3aa94'],[.31,'#aa9f8b'],[1,'#8b826e']]));
    rect10(c,155.3,129.1,16.5,.55,.2,'#c1b7a0');
    rect10(c,-183,b-1.6,366,1.0,.2,'#aaa28e');c.restore();
  }
function consoleSet(c) {
  c.save();
  c.translate(SCR.x,0);
  const horizon=-562, tableFront=226, focal=2130;
  function project(x,depth,h=0) {
    const scale=focal/(focal+depth);
    return [x*scale,horizon+(tableFront-horizon-h)*scale];
  }
  function equipment(cx,front,width,depth) {
    return {cx,front,width,depth,point:(x,z,h=0)=>project(cx+x,front+depth-z,h)};
  }
  const main=equipment(-74,15,152,136), pad=equipment(101,25,85,38);
  function rectPts(unit,margin,radius,h) {
    const half=unit.width/2-margin,D=unit.depth;
    const corners=[[half-radius,margin+radius,-Math.PI/2],[half-radius,D-margin-radius,0],
      [-half+radius,D-margin-radius,Math.PI/2],[-half+radius,margin+radius,Math.PI]];
    const a=[];
    for(const [cx,z,start] of corners)for(let j=0;j<=7;j++){
      const an=start+j*Math.PI/14, nx=Math.cos(an),nz=Math.sin(an);
      a.push({p:unit.point(cx+nx*radius,z+nz*radius,h),nx,nz,z:z+nz*radius});
    }
    return a;
  }
  function poly(ctx,pts,color) {polygon10(ctx,pts,color);}
  function shell(unit,rings,base) {
    for(let b=1;b<rings.length;b++){
      const [height,margin,radius,shade]=rings[b];
      const [prev,oldMargin,oldRadius]=rings[b-1];
      const lower=rectPts(unit,oldMargin,oldRadius,prev),upper=rectPts(unit,margin,radius,height);
      const faces=upper.map((a,i)=>{
        const j=(i+1)%upper.length,other=upper[j];
        const nx=(a.nx+other.nx)/2,nz=(a.nz+other.nz)/2;
        const facing=1-.098*nx-.049*nz;
        const rim=(nx<-.30&&nz>.05?6:0)*Math.max(0,shade-.5);
        const paint=base.map(ch=>Math.round(Math.min(255,ch*shade*facing+rim)));
        return {z:(a.z+other.z)*.5, pts:[lower[i].p,lower[j].p,other.p,a.p],color:'rgb('+paint.join(',')+')'};
      }).sort((a,b)=>a.z-b.z);
      for(const face of faces){
        poly(c,face.pts,face.color);
        // Cover subpixel cracks between the sections of a continuous moulded bevel.
        c.lineWidth=.24;c.strokeStyle=face.color;c.lineJoin='round';c.stroke();
      }
    }
  }
  // Inverse project a supersampled face in a single pass so the tiny printing,
  // button surrounds and longitudinal vents have a common, continuous perspective.
  function face(unit,h,paint) {
    const scale=3,w=Math.ceil(unit.width*scale),d=Math.ceil(unit.depth*scale);
    const sheet=mk(w,d),ctx=sheet.getContext('2d');
    ctx.setTransform(scale,0,0,scale,unit.width*scale*.5,0);
    paint(ctx);
    const input=ctx.getImageData(0,0,w,d).data;
    const corners=[unit.point(-unit.width/2,0,h),unit.point(unit.width/2,0,h),unit.point(-unit.width/2,unit.depth,h),unit.point(unit.width/2,unit.depth,h)];
    const x0=Math.floor(Math.min(...corners.map(p=>p[0])))-1,x1=Math.ceil(Math.max(...corners.map(p=>p[0])))+1;
    const y0=Math.floor(Math.min(...corners.map(p=>p[1])))-1,y1=Math.ceil(Math.max(...corners.map(p=>p[1])))+1;
    const out=mk((x1-x0)*scale,(y1-y0)*scale),g=out.getContext('2d'),img=g.createImageData(out.width,out.height),rgba=img.data;
    for(let y=0;y<out.height;y++){
      const s=(y0+(y+.5)/scale-horizon)/(tableFront-horizon-h);
      const v=(unit.front+unit.depth-focal*(1/s-1))*scale-.5;
      if(v<0||v>=d-1)continue;
      for(let x=0;x<out.width;x++){
        const u=((x0+(x+.5)/scale)/s-unit.cx+unit.width*.5)*scale-.5;
        if(u<0||u>=w-1)continue;
        const ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy;
        const at=(iy*w+ix)*4,k=(y*out.width+x)*4;
        for(let ch=0;ch<4;ch++){
          const j=at+ch;
          rgba[k+ch]=lerp(lerp(input[j],input[j+4],fx),lerp(input[j+w*4],input[j+(w+1)*4],fx),fy);
        }
      }
    }
    g.putImageData(img,0,0);c.drawImage(out,x0,y0,x1-x0,y1-y0);
  }
  function wire(points,width,offset,color) {
    const [a,b,d,e,...rest]=points.map(p=>project(...p));
    c.save();c.translate(0,offset);c.beginPath();c.moveTo(...a);c.bezierCurveTo(...b,...d,...e);
    for(let i=0;i<rest.length;i+=3)c.bezierCurveTo(...rest[i],...rest[i+1],...rest[i+2]);
    c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();c.restore();
  }
  const rear=[[-102,145,4],[-110,172,2],[-167,166,0],[-153,201,0]];
  const tether=[[-8,150,5],[18,145,0],[24,86,0],[19,62,0],[9,14,0],[19,4,0],[35,9,0],[45,12,0],[43,45,0],[60,46,4]];
  for(const line of [rear,tether]){
    wire(line,3.8,1.3,'rgba(47,38,29,.16)');wire(line,2.45,0,'#343731');
    wire(line,.62,-.47,'rgba(166,163,146,.70)');
  }
  function rest(unit,spread){
    const at=unit.point(0,unit.depth);
    shadow10(c,at[0]+2.6,at[1]-.1,unit.width*.53,spread,.54);
    shadow10(c,at[0],at[1]+.12,unit.width*.43,spread*.32,.52);
    c.save();c.shadowColor='rgba(42,33,27,.45)';c.shadowBlur=4;c.shadowOffsetX=1.2;c.shadowOffsetY=2.6;
    poly(c,rectPts(unit,2,6,0).map(a=>a.p),'#625549');c.restore();
  }
  rest(main,7.8);
  shell(main,[[0,3.0,8,.6],[1,2.0,8,.64],[2.6,1,6.5,.80],[6.9,0,5.2,1],[8.4,.3,5.0,.91],[9.3,.7,5,.58]],[116,49,51]);
  shell(main,[[9.4,-.2,5,.72],[10.1,-.3,5,.79],[12,-.15,4.9,.88],[18.3,.0,4.9,.94],
    [23.1,1.4,4.8,.98],[25.2,2.65,4.6,1.015],[25.85,3.6,4.3,1.023]],[212,203,181]);
  const deckH=25.85;
  face(main,deckH,x=>{
    rect10(x,-72.5,3.6,145,128.8,4.3,fade10(x,-66,0,70,135,[[0,'#eee8d7'],[.46,'#e7e1cf'],[.78,'#e4ddca'],[1,'#d5cbb6']]));
    // Deep vent slots occupy the rear centre block; the edges remain part of the warm ivory mould.
    rect10(x,-44.0,4.4,88,38,2.6,'#c9beaa');
    rect10(x,-41.7,4.9,83.6,34.8,2.3,'#e5ddc9');
    for(let j=-38.4;j<=38.5;j+=4.8){
      rect10(x,j,5.4,1.65,29.8,.77,'#8e816b');
      rect10(x,j+.30,5.7,.73,29,.35,'#6c6455');
      rect10(x,j+1.89,5.9,.54,28.4,.26,'#f6f0dc');
    }
    // The bars on the flanks are the edge of one stowed pad, and the lip of the open holder.
    rect10(x,-71,15.4,11.5,89.8,3.8,'#97615a');
    rect10(x,-70.2,15.5,9.7,87.7,3.45,fade10(x,-70,0,-60,0,[[0,'#863b40'],[.30,'#b06063'],[.54,'#963e44'],[1,'#65262c']]));
    rect10(x,-69.5,19,1.0,76,.45,'#cb8580');
    rect10(x,61.1,15.7,9.2,84.8,2.2,'#b8ad97');
    rect10(x,62.5,17.3,6.6,79,2.1,'#d2c6ae');
    // Slot, deep shadows and the red cover slide sit slightly in front of the vents.
    rect10(x,-55.6,43.8,111.2,25.6,2.2,'#9a8c77');
    rect10(x,-54.7,44.8,109.4,23.3,1.7,'#682f32');
    rect10(x,-53.8,47,107.6,15.8,1,'#4d3130');
    rect10(x,-53.6,62.2,107.2,5.0,.85,'#a46057');
    rect10(x,-53.8,68.2,107.4,.8,.35,'#f2e5c9');
    // The cartridge shades the back rim of the slot. Its diffuse penumbra is
    // visible in the bevel and joins the hard contact shadow at the bottom edge.
    x.save();x.shadowColor='rgba(61,45,29,.36)';x.shadowBlur=5*3;
    x.shadowOffsetX=1.6*3;x.shadowOffsetY=4.0*3;
    rect10(x,-38.5,57.0,77,3.0,.65,'#513937');x.restore();
    // The real shell has low-contrast debossed arrows on either side of EJECT.
    for(const xx of [-46,46]){
      stroke10(x,.75,'rgba(130,116,96,.39)',p=>{p.moveTo(xx-3.3,79.0);p.lineTo(xx,85);p.lineTo(xx+3.3,79);p.moveTo(xx,75.6);p.lineTo(xx,82);});
      for(let j=0;j<2;j++) rect10(x,xx-3.5,73+j*1.4,7.0-j*1.5,.47,.2,'rgba(112,100,84,.33)');
    }
    // Eject lever travels in a deep pocket. The two controls differ in size and relief.
    rect10(x,-19.5,78.8,39,38.7,1.65,'#ac9f8c');
    rect10(x,-17.9,80.7,35.8,34.4,1.25,fade10(x,0,80,0,115,[[0,'#b3a995'],[.20,'#d6cbb5'],[.9,'#eae2d0'],[1,'#eee6d3']]));
    rect10(x,-.7,82.4,1.25,28,.6,'#8c806a');
    rect10(x,-18.0,103.0,36.0,12.5,1.4,'#613033');
    rect10(x,-17.8,100.0,35.6,10.3,1.2,fade10(x,0,100,0,110,[[0,'#b36561'],[.34,'#9c4b4a'],[1,'#783438']]));
    for(const [cx,button,label] of [[-46.2,-42.6,'POWER'],[46.2,39.3,'RESET']]){
      rect10(x,cx-16.4,96.2,32.8,25.3,1.65,'#b7ab96');
      rect10(x,cx-15.9,97.3,31.8,23.5,1.25,fade10(x,0,97,0,120,[[0,'#d6cab5'],[.18,'#e8dfc9'],[.92,'#ece2ce'],[1,'#f4ead7']]));
      const left=button-5.5;
      rect10(x,left-.56,99.4,12.2,18.3,1.3,'#72614f');
      rect10(x,left,100.1,11.1,17.0,1.1,fade10(x,0,100,0,117,[[0,'#712e31'],[.25,'#88363a'],[.8,'#ae5e57'],[1,'#753235']]));
      if(cx<0)for(let j=0;j<2;j++){
        rect10(x,left+.48,106.0+j*4.0,10.0,2.7,.45,'#843a3b');
        rect10(x,left+.72,106.1+j*4.0,9.4,.72,.36,'#ce8880');
      }
      const tx=cx<0?cx-9:cx+6.5;
      x.font='bold 2.85px sans-serif';x.textAlign='center';x.fillStyle='#baaF99';x.fillText(label,tx,109.6);
      x.fillStyle='#f3ead6';x.fillText(label,tx,110.13);
    }
  });
  const labelH=16.85, labelL=main.point(-63,main.depth-.2,labelH),labelR=main.point(63,main.depth-.2,labelH);
  rect10(c,labelL[0],labelL[1]-.12,labelR[0]-labelL[0],4.46,1.05,fade10(c,0,labelL[1],0,labelL[1]+4,[[0,'#854140'],[.60,'#783c3b'],[1,'#6f3939']]));
  const badgeCenter=main.point(0,main.depth,labelH)[0];
  rect10(c,labelL[0]+.5,labelL[1]+3.24,labelR[0]-labelL[0]-1,.26,.13,'#bf9b76');
  rect10(c,badgeCenter-17.3,labelL[1]+3.13,34.6,.56,.25,'#743b39');
  c.fillStyle='#e7cda1';c.font='600 3.05px sans-serif';c.textAlign='center';c.fillText('FAMILY COMPUTER',badgeCenter,labelL[1]+3.10);
  const a=main.point(-39,59,43.0),b=main.point(39,59,43.0),floor=main.point(39,59,deckH-.8);
  c.save();c.translate(...a);
  const cw=b[0]-a[0],ch=floor[1]-a[1];
  rect10(c,-1,-1,cw+2,ch+1,1.3,'#463e34');
  rect10(c,0,0,cw,ch,1.2,fade10(c,0,0,cw,0,[[0,'#716c5d'],[.19,'#686558'],[.72,'#6b6758'],[1,'#585749']]));
  rect10(c,1,.1,cw-2,1.05,.45,'#938d78');
  for(let side of [3,cw-6])for(let j=0;j<4;j++)rect10(c,side,3.5+j*3.0,3.5,.68,.28,'#8d8671');
  rect10(c,9,2.2,cw-18,ch-4,.78,'#564f42');
  rect10(c,9.6,2.55,cw-19.2,ch-5,.58,fade10(c,10,2,cw-9,ch,[[0,'#d3bea0'],[.56,'#d7c9ad'],[1,'#b9ad90']]));
  c.save();c.translate(cw*.5,ch*.51);
  stroke10(c,.8,'rgba(80,103,98,.70)',p=>{p.moveTo(-24,2.6);p.bezierCurveTo(-12,6,-2,-4,9,-1);p.bezierCurveTo(16,1,21,0,24,-2);});
  poly(c,[[-4,.1],[1.7,-1.6],[6,-1.2],[8,-3],[7.2,-.4],[8.5,.7],[5.3,.25],[1.5,1.6]],'#946851');
  c.restore();c.restore();
  const slot=main.point(0,60.5,deckH);
  soft10(c,slot[0],slot[1]+.58,cw*.54,1.35,[[0,'rgba(46,33,29,.46)'],[.85,'rgba(46,32,26,.22)'],[1,'rgba(46,32,26,0)']]);

  rest(pad,4.7);
  shell(pad,[[0,1.9,4.3,.64],[1.0,1,4.2,.72],[2.8,0,4.2,.88],[5.5,.05,4,1],[6.35,.55,3.8,1.09],[6.7,1,3.65,1.04]],[136,56,59]);
  face(pad,6.7,x=>{
    rect10(x,-41.5,1,83,36,3.6,fade10(x,-41,0,40,38,[[0,'#a45f60'],[.44,'#924b4d'],[1,'#803c40']]));
    rect10(x,-37.2,1.55,74.2,.72,.35,'#bd7c79');
    rect10(x,-39.9,2.0,79.8,33.8,2.75,'#69373b');rect10(x,-39.3,2.5,78.7,32.7,2.5,'#9f4a4d');
    // The metallic plate wraps around the d-pad and leaves the upper-right shell exposed.
    x.beginPath();x.moveTo(-36.9,4.5);x.lineTo(-8,4.5);x.quadraticCurveTo(-6.4,4.5,-6.4,6.4);
    x.lineTo(-6.4,15);x.quadraticCurveTo(-6.4,16.5,-4.7,16.5);x.lineTo(36.1,16.5);x.quadraticCurveTo(37.6,16.5,37.6,18);
    x.lineTo(37.6,31.6);x.quadraticCurveTo(37.6,33.6,35.5,33.6);x.lineTo(-36.4,33.6);x.quadraticCurveTo(-38.1,33.6,-38.1,31.6);
    x.lineTo(-38.1,6.5);x.quadraticCurveTo(-38.1,4.5,-36.9,4.5);x.closePath();x.fillStyle=fade10(x,-38,0,38,38,[[0,'#cbb58f'],[.33,'#e9d6a8'],[.70,'#ddcba4'],[1,'#c9b68f']]);x.fill();
    rect10(x,-36.2,7.0,4.8,5.0,.15,'#3d3a31');
    x.textBaseline='middle';x.textAlign='center';x.font='bold 3.65px serif';x.fillStyle='#eadab1';x.fillText('I',-33.7,9.4);
    for(let zz=25;zz<28;zz+=1.0)rect10(x,-37.3,zz,73.9,.37,0,'#534b3a');
    const cross=[[-28.4,13],[-24.2,13],[-24.2,18.4],[-18.5,18.4],[-18.5,23],[-24.2,23],[-24.2,28.4],[-28.4,28.4],[-28.4,23],[-34.1,23],[-34.1,18.4],[-28.4,18.4]];
    x.save();x.translate(0,.75);poly(x,cross,'#6f4d3d');x.restore();
    poly(x,cross,'#332f29');
    stroke10(x,.61,'#777165',p=>{p.moveTo(-33.5,18.9);p.lineTo(-28,18.9);p.lineTo(-28,13.6);});
    oval10(x,-26.4,20.3,1.75,1.8,'#514e45');
    rect10(x,-13.6,23.6,23.2,6.1,3.0,'#91484a');
    for(const xx of [-11,0.0]){rect10(x,xx,25.2,6.8,2.7,1.25,'#282c2b');rect10(x,xx+.4,25.0,5.8,.52,.24,'#696863');}
    x.font='bold 2.05px sans-serif';x.fillStyle='#493e31';x.fillText('SELECT',-8,21.5);x.fillText('START',3.5,21.5);
    for(const [xx,letter] of [[18,'B'],[29.3,'A']]){
      oval10(x,xx,26.25,4.8,4.85,'#763e3f');oval10(x,xx,26.12,4.0,4.07,'#ab645f');
      oval10(x,xx,26.0,3.5,3.55,fade10(x,xx,22.5,xx,29.4,[[0,'#6a6258'],[.34,'#4a4941'],[1,'#282d2a']]));
      x.font='bold 2.3px sans-serif';x.fillStyle='#463d33';x.fillText(letter,xx,20);
    }
  });
  c.restore();
}
function restingTube10(c){
  let glass = restingTube10.surface;
  if (!glass) {
    const scale=3,w=300*scale,h=Math.round(225*scale);
    glass=mk(w,h);
    const gx=glass.getContext('2d'), frame=gx.createImageData(w,h), data=frame.data;
    const ramp=(start,end,n)=>smooth(start,end,n);
    for(let j=0;j<h;j++) for(let i=0;i<w;i++) {
      const x=i/(w-1)*2-1, y=j/(h-1)*2-1, a=Math.abs(x), b=Math.abs(y);
      // A curved pair of glass surfaces reflects a low, long opening on the right.
      // Squaring each axis preserves the relatively flat central face of a CRT.
      const rx=x*(.76+.30*a*a+.08*b*b), ry=y*(.78+.23*b*b+.09*a*a);
      const edge=Math.max(a*.92+b*b*.065,b*.91+a*a*.075);
      const rim=ramp(.81,1.014,edge);
      const base=143+12*(1-y*.3)-14*y*y-17*rim-5*x;
      const upperLight=10.5*Math.exp(-((rx-.27)**2/.57+(ry+.49)**2/.20));
      const shade=6.5*Math.exp(-((rx+.56)**2/.54+(ry-.19)**2/.10));
      const room=.82*rx+.14*ry+.18*ry*ry;
      const band=ramp(.645,.735,room)*(1-ramp(.85,.9,room))*(1-ramp(-.36,.21,ry))*ramp(-1,-.71,ry);
      const narrow=ramp(.742,.752,room)*(1-ramp(.795,.806,room))*ramp(-.96,-.84,ry)*(1-ramp(-.24,-.17,ry));
      const ghost=ramp(.717,.733,room)*(1-ramp(.752,.766,room))*ramp(-.94,-.80,ry)*(1-ramp(-.26,-.12,ry));
      const shadows=5*ramp(-.88,-.80,rx)*(1-ramp(.08,.19,rx))*(1-ramp(.06,.25,ry+.12*rx+.24*rx*rx))*ramp(-.62,-.28,ry);
      const edgeRoll=13*ramp(.93,1,edge);
      const sillY=.355+.17*rx+.31*rx*rx;
      const sill=7.3*Math.exp(-Math.pow((ry-sillY)/.040,2))*Math.exp(-Math.pow((rx+.01)/.73,4));
      const wallShade=9*ramp(-.64,-.34,rx)*(1-ramp(.43,.71,rx))*ramp(-.56,-.30,ry)*(1-ramp(sillY-.24,sillY+.07,ry));
      const weakWindow=4.8*ramp(-.77,-.63,rx)*(1-ramp(-.25,-.16,rx))*ramp(-.76,-.63,ry)*(1-ramp(-.31,-.22,ry));
      const lum=base+upperLight-shade+band*14+narrow*44+ghost*8-shadows-edgeRoll+sill-wallShade+weakWindow;
      const n=(j*w+i)*4;
      data[n]=lum-7;data[n+1]=lum-6+band*2;data[n+2]=lum-4+band*4;data[n+3]=255;
    }
    gx.putImageData(frame,0,0);
    restingTube10.surface=glass;
  }
  c.drawImage(glass,SCR.x-150,SCR.y-112.5,300,225);
}
  function tubeSurface10(c,dark){
    c.save();c.translate(SCR.x,SCR.y);
    // Tube curvature darkens the perimeter. Long grazing reflections stay within
    // the outside millimetres of the screen so HUD corners and play stay legible.
    c.save();c.scale(150,112.5);const g=c.createRadialGradient(-.035,-.05,.37,0,.01,1.34);
    for(const [at,shade] of [[0,0],[.60,.02],[.80,.09],[.94,.22],[1,.36]])g.addColorStop(at,'rgba(18,24,23,'+shade+')');
    c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
    c.globalAlpha=.07+.22*(1-dark);
    c.fillStyle=fade10(c,0,-111,0,-97,[[0,'rgba(16,23,24,.34)'],[.28,'rgba(22,29,29,.14)'],[1,'rgba(22,29,29,0)']]);c.fillRect(-151,-113,302,18);
    soft10(c,99,-62,55,81,[[0,'rgba(232,232,217,.09)'],[.75,'rgba(228,229,215,.035)'],[1,'rgba(228,229,215,0)']]);
    c.beginPath();c.moveTo(123,-102);c.bezierCurveTo(139,-100,143,-93,144.5,-75);c.bezierCurveTo(145.8,-63,146.8,-44,146.1,-22);c.bezierCurveTo(144.7,-55,142.1,-81,138.9,-89.0);c.quadraticCurveTo(136,-96,123,-102);c.closePath();
    c.fillStyle=fade10(c,125,-100,147,-44,[[0,'rgba(237,235,218,.08)'],[.58,'rgba(236,235,219,.40)'],[1,'rgba(235,233,218,.05)']]);c.fill();
    stroke10(c,1.2,'rgba(219,225,213,.14)',p=>{p.moveTo(-141,81);p.bezierCurveTo(-145,70,-145,49,-145.5,27)});
    c.restore();
  }

function hardwareSurface10(c){
  let surface=hardwareSurface10.surface;
  if(!surface){
    const scale=3,x0=-238,y0=-171,w=476,h=404;
    surface=mk(w*scale,h*scale);
    const a=surface.getContext('2d');
    a.setTransform(scale,0,0,scale,(-SCR.x-x0)*scale,-y0*scale);
    shelf10(a);crtHousing(a);consoleSet(a,false);
    a.save();a.translate(SCR.x,0);
    // A very shallow moulded plate catches the same high left light as the return below it.
    rect10(a,-46.6,109.4,81.6,9.1,.65,'#a59983');
    rect10(a,-45.9,109.9,80.1,7.7,.38,fade10(a,-46,109,35,118,[[0,'#706b61'],[.62,'#625d55'],[1,'#474640']]));
    a.fillStyle='#d4caba';a.font='4.3px sans-serif';a.textBaseline='middle';a.fillText('COLOR MONITOR',-40,114.1);
    for(let i=0;i<4;i++)rect10(a,18,111.6+i*1.05,10.2,.60,.12,['#a38e66','#a89967','#818a70','#738b8a'][i]);
    // Countersunk casings give the sockets a thin metal lip and a hollow centre, even in a long shot.
    for(const ax of [113,129]){
      stroke10(a,.58,'rgba(241,231,204,.64)',p=>p.arc(ax,133.85,4.03,3.30,5.25));
      stroke10(a,.48,'rgba(57,48,36,.65)',p=>p.arc(ax,134,4.18,.04,1.77));
    }
    a.restore();
    const data=a.getImageData(0,0,surface.width,surface.height), px=data.data,rnd=rng(333991);
    const cloud=noise2(33317,16,14);
    for(let j=0;j<surface.height;j++)for(let i=0;i<surface.width;i++){
      const q=(j*surface.width+i)*4;if(!px[q+3])continue;
      const x=x0+i/scale,y=y0+j/scale,absx=Math.abs(x);
      const monitor=absx<186&&y<151, pad=x>55&&y>195,deck=x<4&&x>-150&&y>158&&y<208;
      const u=i/surface.width,v=j/surface.height;
      const broad=(cloud(u*15,v*13)-.5)*2;
      const face=(monitor||deck||pad)?1:.40;
      const random=rnd()-.5;
      // Matte moulded ABS scatters light. The glass is composited after this pass;
      // the metallic insert on the pad has a very slight horizontal brushing instead.
      let shift=face*(broad*2.2+random*(monitor?6.1:4.8));
      if(pad)shift+=1.4*Math.sin((j+3*Math.sin(u*80))*.82);
      if(monitor&&y>108){
        const front=(y-108)/43;
        shift+=3*(1-front)-4*front;
      }
      px[q]+=shift;px[q+1]+=shift;px[q+2]+=shift;
    }
    a.putImageData(data,0,0);
    hardwareSurface10.surface=surface;
  }
  c.drawImage(surface,SCR.x-238,-171,476,404);
}
function drawS10Panel(t,cam,TR){const x0=S10X-S10W/2,y0=S10Y-S10W/2,z=cam.z;
  const on=smooth(T10ON,T10ON+0.08,t),off=t>=T10OFF;
  ctx.save(); ctx.beginPath();ctx.rect(x0,y0,S10W,S10W);ctx.clip();
  // A short wall shadow carries the pale shelf, the machine casts a wider shadow immediately behind it.
  ctx.save();ctx.shadowColor='rgba(54,47,36,.25)';ctx.shadowBlur=9*z;ctx.shadowOffsetY=3.3*z;
  rect10(ctx,TVF.x0+3,TVF.y0+3,TVF.w-5,TVF.h-5,3,'#b9b2a4');
  ctx.shadowColor='rgba(54,47,36,.24)';ctx.shadowBlur=5*z;ctx.shadowOffsetY=2.4*z;
  rect10(ctx,SCR.x-229,227,458,3,1,'#bdb5a5');ctx.restore();
  hardwareSurface10(ctx);ctx.restore();
  // 屏幕内容
  const p=(t>=T10ON+0.35&&t<T10OUT)?heroPoseNow(t):null;

  // The dormant phosphor picks up soft gallery light; the active raster is allowed a black field.
  const glassTop=SCR.y-SCR.h/2;
  ctx.save();crtGlass(ctx);ctx.clip();
  const dark=1-smooth(T10ON-.02,T10ON+.20,t)+smooth(T10OFF+.10,T10OFF+.75,t);
  ctx.fillStyle='#181c1b';ctx.fillRect(SCR.x-SCR.w/2,glassTop,SCR.w,SCR.h);
  if(dark>.001){
    ctx.save();ctx.globalAlpha=dark;
    restingTube10(ctx);
    ctx.restore();
  }
  if(t>=T10ON&&t<T10OFF+0.5){
    if(t<T10OFF){renderScreen(t,p);
      // 开机：先是一道横线，再撑开
      const op=smooth(T10ON,T10ON+0.32,t);const hh=Math.max(0.012,op);
      layerBegin(scx,TR);scx.imageSmoothingEnabled=false;
      // 撕裂：横向错位的条带
      const tear=smooth(T10TEAR,T10OFF,t);
      if(tear>0){const r=rng(Math.floor((t-T10ON+115)*24));const n=10;for(let i=0;i<n;i++){const y0s=i/n*SBH,hs=SBH/n;const dx=(r()-.5)*90*tear*(r()<0.6?1:0);scx.drawImage(SB,0,y0s,SBW,hs,SCR.x-SCR.w/2+dx*SCR.w/SBW,SCR.y-SCR.h/2+y0s*SCR.h/SBH*hh+SCR.h*(1-hh)/2,SCR.w,hs*SCR.h/SBH*hh);}
        scx.globalCompositeOperation='lighter';scx.globalAlpha=0.5*tear;scx.filter='hue-rotate(90deg)';scx.drawImage(SB,SCR.x-SCR.w/2-6*tear,SCR.y-SCR.h/2,SCR.w,SCR.h);scx.filter='hue-rotate(-90deg)';scx.drawImage(SB,SCR.x-SCR.w/2+6*tear,SCR.y-SCR.h/2,SCR.w,SCR.h);scx.filter='none';scx.globalAlpha=1;scx.globalCompositeOperation='source-over';
        const r2=rng(Math.floor((t-T10ON+115)*30)+7);for(let i=0;i<40*tear;i++){scx.fillStyle=`rgba(255,255,255,${r2()*0.6})`;scx.fillRect(SCR.x-SCR.w/2+r2()*SCR.w,SCR.y-SCR.h/2+r2()*SCR.h,r2()*30,1+r2()*2);}}
      else scx.drawImage(SB,SCR.x-SCR.w/2,SCR.y-SCR.h/2+SCR.h*(1-hh)/2,SCR.w,SCR.h*hh);
      if(op<1){scx.fillStyle=`rgba(255,255,255,${0.9*(1-op)})`;scx.fillRect(SCR.x-SCR.w/2,SCR.y-SCR.h*hh/2-1,SCR.w,SCR.h*hh+2);}
      // 扫描线与荧光点
      scx.globalCompositeOperation='multiply';scx.fillStyle=levelAt(t)===1?'rgba(0,0,0,.13)':'rgba(0,0,0,.28)';for(let y=SCR.y-SCR.h/2;y<SCR.y+SCR.h/2;y+=SCR.h/SBH*2)scx.fillRect(SCR.x-SCR.w/2,y,SCR.w,SCR.h/SBH);scx.globalCompositeOperation='source-over';
      blitLayer(SCRC,1);blitLayer(SCRC,levelAt(t)===1?.24:.45,'lighter',`blur(${(3*z).toFixed(1)}px)`);}
    else{// 关机：塌成一条线，再缩成一个亮点
      const q=(t-T10OFF)/0.5;const lw=SCR.w*Math.max(0.01,1-q*1.6),lh=Math.max(0.6,SCR.h*0.02*(1-q));ctx.fillStyle=`rgba(255,255,255,${1-q*0.6})`;ctx.fillRect(SCR.x-lw/2,SCR.y-lh/2,lw,lh);
      const g=ctx.createRadialGradient(SCR.x,SCR.y,0,SCR.x,SCR.y,30*(1-q)+2);g.addColorStop(0,`rgba(220,240,255,${1-q})`);g.addColorStop(1,'rgba(220,240,255,0)');ctx.fillStyle=g;ctx.fillRect(SCR.x-40,SCR.y-40,80,80);}}

  tubeSurface10(ctx,dark);ctx.restore();
  rect10(ctx,TVF.x0+TVF.w-43,TVF.y0+TVF.h-19.5,2.8,1.65,.55,on>0&&!off?'#98ab77':'#706f60');
}
// ---------- 墙上的样子：进屏前是马赛克，出屏后是串色的信号 ----------
const MOS=mk(240,135),mosx=MOS.getContext('2d');
function styleMosaic(t,cam,TR,p,clip){// 以世界坐标 6 个单位为一格
  const cell=6;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);}x0=Math.floor((x0-p.L*0.4)/cell)*cell;y0=Math.floor((y0-p.L*0.4)/cell)*cell;
  const gw=Math.min(240,Math.ceil((x1-x0+p.L*0.8)/cell)),gh=Math.min(135,Math.ceil((y1-y0+p.L*0.8)/cell));mosx.setTransform(1,0,0,1,0,0);mosx.clearRect(0,0,240,135);mosx.setTransform(1/cell,0,0,1/cell,-x0/cell,-y0/cell);mosx.fillStyle=RED9;paperSil(mosx,p);
  const img=mosx.getImageData(0,0,gw,gh);const d=img.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>110?255:0;mosx.putImageData(img,0,0);
  ctx.save();ctx.setTransform(...TR);if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.imageSmoothingEnabled=false;ctx.shadowColor='rgba(0,0,0,0.3)';ctx.shadowBlur=6*cam.z;ctx.shadowOffsetY=6*cam.z;ctx.drawImage(MOS,0,0,gw,gh,x0,y0,gw*cell,gh*cell);ctx.restore();}
function styleSignal(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}gameFish(hctx,p,'hi',gameRoll(t));   /* 从屏幕里游出来的，就是游戏里那条鱼 */
  const afterglow=t-T10OUT;
  if(afterglow>=-.00001&&afterglow<.15){
    const screen=window.signalRelease||(window.signalRelease=mk(W,H)),temp=screen.getContext('2d');
    temp.reset();temp.drawImage(HEROC,0,0);
    const u=clamp(afterglow/.15),blend=smooth(0,1,u),axis=TR[3]*lerp(SCR.y,spineAt(p,.44).y,blend)+TR[5],radius=1+p.L*TR[3]*.62*blend;
    const mask=temp.createLinearGradient(0,axis-radius,0,axis+radius);
    mask.addColorStop(0,'transparent');mask.addColorStop(.435,'#fff');mask.addColorStop(.565,'#fff');mask.addColorStop(1,'transparent');
    temp.globalCompositeOperation='destination-in';temp.fillStyle=mask;temp.fillRect(0,0,W,H);
    hctx.reset();hctx.save();hctx.globalAlpha=.16+.84*smooth(0,.78,u);
    hctx.filter='saturate('+(.18+.82*blend)+') brightness('+(1.3-.3*blend)+')';hctx.drawImage(screen,0,0);hctx.restore();
  }

  const z=cam.z;const amp=lerp(7,2.5,smooth(T10OUT,T10OUT+2.5,t));ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.5;ctx.filter='hue-rotate(150deg)';ctx.drawImage(HEROC,-amp*z,0);ctx.filter='hue-rotate(-150deg)';ctx.drawImage(HEROC,amp*z,0);ctx.restore();
  const r=rng(Math.floor((t-T10ON+115)*20));ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<6;i++){const y=r()*H,h=4+r()*14;ctx.drawImage(HEROC,0,y,W,h,(r()-.5)*24*z*(amp/7),y,W,h);}ctx.restore();blitLayer(HEROC,0.9);}
const SCR_PATH=c=>c.rect(SCR.x-SCR.w/2,SCR.y-SCR.h/2,SCR.w,SCR.h);
function style10(t,cam,TR,p,clip){if(t<T10ON)stylePaper(t,cam,TR,p,clip);else if(t>=T10OUT)styleSignal(t,cam,TR,p,clip);}

// ---------------- 拾 的登记 ----------------
STN.push({key:'s10',cx:S10X,hw:S10W/2,x0:-6320,x1:-5560,draw:drawS10Panel,owns:t=>t>=T10ON&&t<T10OUT,drawHero:(t,cam,TR,p)=>{if(t<T10ON+0.3){const q=smooth(T10ON,T10ON+0.28,t);const s=1-0.95*q;const c0=spineAt(p,0.1);const p2={...p,L:p.L*s,sp:p.sp.map(o=>({...o,x:c0.x+(o.x-c0.x)*s,y:c0.y+(o.y-c0.y)*s}))};splitStyle(t,cam,TR,p2,null,SCR_PATH,Infinity,stylePaper,styleMosaic);}},style:style10});
LABELS.push([S10X,S10W,S10W,'拾','游','电子游戏 · 像素']);
LIGHTS.push({x:S10X,y:-10,r:820,k:t=>smooth(116.8,118.8,t)});
GK.push([118.6,-5700,-10],[119,-5790,-20],[119.4,-5830,-22],[120.3,-5880,10],[121,-5930,20],[121.8,-5970,-5],[122.5,...PELLETS[0]],
  [123.2,-6030,-60],[123.9,-6050,-20],[124.6,-6020,30],[125.2,-5960,45],[125.9,...PELLETS[1]],
  // 1995：凑到饵跟前、一动不动；“！”——钩子一提，鱼猛地一折身（鱼受惊时真是这么逃的），冲出去，绕一个整圈把一圈金币吃掉，扑向豆子
  [126.1,-5882,2],[126.3,-5866,-16],[126.55,-5857,-29],[126.8,-5852,-34],[127.0,-5850,-35],[127.14,-5848,-34],
  [127.22,-5845,-29],[127.3,-5849,-19],[127.38,-5862,-11],[127.47,-5886,-5],[127.6,-5928,10],[127.73,-5968,22],[127.875,-6010,27],
  [128.08,-6042,14],[128.29,-6055,-20],[128.5,-6042,-52],[128.71,-6010,-65],[128.92,-5978,-52],[129.13,-5965,-20],[129.32,-5978,6],[129.5,...PELLETS[2]],
  // 2003：一条一条地追：先慢慢靠近，猛一扑，咬到了往前滑一下，急转去追下一条；最后绕回来，盯住大豆子，一口吞下
  [129.7,-6031,12],[129.9,-6049,-8],[130.08,-6046,-32],[130.25,-6026,-44],[130.42,-6009,-39],[130.625,-5955,-12],[130.85,-5935,-2],[131.1,-5916,9],[131.3,-5902,20],
  [131.45,-5856,39],[131.62,-5838,37],[131.85,-5828,15],[132.05,-5843,-3],[132.275,-5888,-36],[132.45,-5906,-44],[132.75,-5915,-40],[132.95,-5924,-33],[T10EAT4,-5938,-24],[133.6,-5946,-26],[134.2,-5960,-26],[T10OUT,-6000,-24],[135.3,-6080,-20],[135.8,-6180,-12],[136.3,-6262,-6],[136.8,-6330,0]);
HL.push([118.0,150],[119.0,150],[119.35,90],[cellT(3,4),90],[cellT(3,4)+.22,97],[cellT(3,8),97],[cellT(3,8)+.23,103],[cellT(3,12),103],[cellT(3,12)+.24,109],[T10EAT4,109],[T10EAT4+.36,114],[T10OUT-.22,124],[135.2,140]);   // 2003：吃一条小鱼长大一点
HAMP.push(t=>1+0.8*smooth(T10EAT4,T10EAT4+0.2,t)*(1-smooth(T10OUT+0.6,T10OUT+1.6,t)));
HFB.push(t=>2.5*smooth(T10EAT4,T10EAT4+0.2,t)*(1-smooth(T10OUT+0.6,T10OUT+1.6,t)));
for(const tu of T10UP)SHAKES.push([tu,3]);SHAKES.push([T10OFF,9],[T10EAT4,4]);
CK.push({t:117.8,z:1.2,f:1,ox:-150,oy:-10},{t:118.8,x:S10X+30,y:-20,z:1.7},{t:119.6,x:SCR.x,y:SCR.y,z:4.7},{t:132.9,x:SCR.x,y:SCR.y,z:4.75},{t:133.8,x:SCR.x,y:SCR.y+4,z:3.6},{t:T10OUT,x:SCR.x-10,y:SCR.y+10,z:2.3},{t:135.6,x:S10X-120,y:0,z:1.6,f:0.4,ox:-80},{t:136.8,z:1.2,f:1,ox:-150,oy:-10});
