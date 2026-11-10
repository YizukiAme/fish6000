// ================= 拾壹 · 代码（结尾） =================
// 一块黑底的屏：画这条鱼的代码一行行打出来，鱼只剩骨架——脊线、采样点、轮廓。前面每一站的样子在它身上闪一遍。然后拉远，看整面墙
const S11X=-6700,S11Y=0,S11W=600;
const T11IN=133.4,T11CAP=[134.6,138.4],T11FLASH=137.7,T11BACK=[139.9,144.4],T_FIN=150.0;
const CODE=[
 ['c','// 一条鱼：一条走过的路，加一根会摆的脊线'],
 ['k','function ','f','fishPose','p','(def, t) {'],
 ['p','  const L = def.','f','L','p','(t);'],
 ['p','  const s = ','f','arcLength','p','(def.track, t);'],
 ['k','  for ','p','(let i = ','n','0','p','; i <= N; i++) {'],
 ['p','    const u = i / N;'],
 ['p','    raw[i] = ','f','posAtS','p','(track, s - u * L);  ','c','// 身子沿着走过的路'],
 ['p','    const wave = L * (','n','0.012','p',' + ','n','0.08','p','*u*u) * I'],
 ['p','             * Math.','f','sin','p','(','n','2','p','*Math.PI*','n','0.9','p','*u - phase);'],
 ['p','    spine[i] = ','f','offset','p','(raw[i], normal(i), wave);'],
 ['p','  }'],
 ['k','  return ','p','{ spine, L, t };'],
 ['p','}'],
 ['p',''],
 ['c','// 同一根脊线，换一种画法，就换了一个朝代'],
 ['f','drawBanpo','p','(ctx, pose, a);    ','c','// 仰韶'],
 ['f','drawOracle','p','(ctx, pose);      ','c','// 商'],
 ['f','drawRubbing','p','(ctx, pose);     ','c','// 汉'],
 ['f','drawCizhou','p','(ctx, pose, tp);  ','c','// 宋金'],
 ['f','drawYuan','p','(ctx, pose, BLUE);  ','c','// 元'],
 ['f','drawNianhua','p','(ctx, pose);     ','c','// 清'],
 ['f','drawPixels','p','(ctx, pose, lv);  ','c','// 1980—2026'],
 ['p',''],
 ['k','for ','p','(let t = ','n','0','p','; t < ','n','151','p','; t += ','n','1','p','/','n','30','p',') ','f','render','p','(t);']];
const CCOL={c:'#6a7a70',k:'#c792ea',f:'#82aaff',p:'#c9d1d9',n:'#f78c6c'};
function drawS11Panel(t,cam,TR){const x0=S11X-S11W/2,y0=S11Y-S11W/2;panelShadow(x0,y0,S11W,S11W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S11W,S11W);ctx.clip();const g=ctx.createRadialGradient(S11X+60,0,40,S11X,0,560);g.addColorStop(0,'#16191e');g.addColorStop(1,'#0b0c0f');ctx.fillStyle=g;ctx.fillRect(x0,y0,S11W,S11W);
  // 一行行打出来
  const typed=(t-(T11IN-0.6))*48;let ci=0;ctx.font='500 10.5px "DejaVu Sans Mono"';ctx.textBaseline='top';
  CODE.forEach((line,li)=>{let x=x0+44;const y=y0+40+li*17.5;ctx.fillStyle='rgba(120,130,140,0.45)';if(ci<typed)ctx.fillText(String(li+1).padStart(2,' '),x0+16,y);
    for(let j=0;j<line.length;j+=2){const col=CCOL[line[j]],txt=line[j+1];let shown='';for(const ch of txt){if(ci>=typed)break;shown+=ch;ci++;}ctx.fillStyle=col;ctx.fillText(shown,x,y);x+=ctx.measureText(txt).width;if(shown.length<txt.length)break;}ci+=1;});
  if(typed>0&&Math.floor(t*2.5)%2===0){let n=0,li=0;for(const line of CODE){let len=0;for(let j=1;j<line.length;j+=2)len+=line[j].length;if(n+len+1>typed)break;n+=len+1;li++;}ctx.fillStyle='#c9d1d9';ctx.fillRect(x0+44+Math.max(0,typed-n)*6.3,y0+40+li*17.5,6,12);}
  // 闪回时，身后亮起一圈光，让每一种画法都看得清
  const fl=smooth(T11FLASH-0.35,T11FLASH-0.05,t)*(1-smooth(T11FLASH+2.1,T11FLASH+2.6,t));if(fl>0){const p=heroPoseNow(t);const c0=spineAt(p,0.45);const g2=ctx.createRadialGradient(c0.x,c0.y,10,c0.x,c0.y,p.L*1.05);
    g2.addColorStop(0,`rgba(232,226,212,${0.92*fl})`);g2.addColorStop(0.6,`rgba(232,226,212,${0.5*fl})`);g2.addColorStop(1,'rgba(232,226,212,0)');ctx.fillStyle=g2;ctx.fillRect(c0.x-p.L*1.1,c0.y-p.L*1.1,p.L*2.2,p.L*2.2);}
  ctx.restore();ctx.strokeStyle='rgba(20,22,26,0.6)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S11W,S11W);}
// 骨架：脊线、采样点、轮廓、肋线
function styleCode(t,cam,TR,p,clip){const pr=PROF.song,L=p.L;ctx.save();ctx.setTransform(...TR);if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}
  const z=cam.z;const lw=z>=1?1/z:Math.pow(z,-0.5);const la=smooth(0.75,1.15,z);const e=edges(p,pr);
  const pass=(col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w*lw;
    ctx.beginPath();e.top.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=e.M;i>=0;i--)ctx.lineTo(e.bot[i][0],e.bot[i][1]);ctx.closePath();ctx.stroke();
    for(let k=1;k<10;k++){const u=k/10*0.8;const a=bodyAt(p,pr,u,1),b=bodyAt(p,pr,u,-1);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    const tp=spineAt(p,1);const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);ctx.beginPath();ctx.moveTo(bt[0],bt[1]);ctx.lineTo(tp.x+tp.nx*L*0.18,tp.y+tp.ny*L*0.18);ctx.lineTo(tp.x,tp.y);ctx.lineTo(tp.x-tp.nx*L*0.17,tp.y-tp.ny*L*0.17);ctx.lineTo(bb[0],bb[1]);ctx.stroke();};
  pass('rgba(0,0,0,0.55)',3.2);pass('rgba(127,219,202,0.85)',1.2);
  ctx.strokeStyle='rgba(255,203,107,0.95)';ctx.lineWidth=1.6*lw;ctx.beginPath();p.sp.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
  ctx.fillStyle='rgba(255,203,107,0.95)';p.sp.forEach((q,i)=>{if(i%2)return;ctx.beginPath();ctx.arc(q.x,q.y,(i%8?1.3:2.3)*lw*1.4,0,7);ctx.fill();});
  ctx.strokeStyle='rgba(130,170,255,0.7)';ctx.lineWidth=1*lw;for(let i=0;i<=p.N;i+=4){const q=p.sp[i];ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+q.nx*L*0.06,q.y+q.ny*L*0.06);ctx.stroke();}
  const ey=bodyAt(p,pr,0.08,0.3);ctx.strokeStyle='rgba(127,219,202,0.9)';ctx.beginPath();ctx.arc(ey[0],ey[1],L*0.025,0,7);ctx.stroke();
  ctx.font=`${(10*lw).toFixed(2)}px "DejaVu Sans Mono"`;ctx.fillStyle=`rgba(201,209,217,${0.75*la})`;const h=p.sp[0];ctx.fillText('u=0',h.x+6*lw,h.y-8*lw);const tl=p.sp[p.N];ctx.fillText('u=1',tl.x+4*lw,tl.y+12*lw);
  ctx.fillText(`L=${L.toFixed(1)}`,h.x+6*lw,h.y+14*lw);ctx.restore();}
// 每一站的样子在它身上闪一遍
const FLASH_STYLES=()=>[styleBanpo,styleOBI,styleHan,styleBronze,styleCizhou,styleSong,styleYuanP,styleNian,stylePaper,styleMosaic,styleSignal];
function style11(t,cam,TR,p,clip){const d=t-T11FLASH;const S=FLASH_STYLES();const k=Math.floor(d/0.19);if(d>=0&&k<S.length){S[k](t,cam,TR,p,clip);return;}styleCode(t,cam,TR,p,clip);}
// 片尾黑卡：片名；逗号活过来，变成一条小鱼游走
const TITLE_A='一条鱼',TITLE_C='游过六千年';
function tinyFish(c,p,col){const pr=PROF.song,L=p.L;const e=edges(p,pr);c.fillStyle=col;bodyFill(c,e);c.fill();
  const tp=spineAt(p,1),bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);c.beginPath();c.moveTo(bt[0],bt[1]);c.lineTo(tp.x+tp.nx*L*0.2,tp.y+tp.ny*L*0.2);c.lineTo(tp.x+(tp.x-spineAt(p,0.92).x)*0.2,tp.y+(tp.y-spineAt(p,0.92).y)*0.2);c.lineTo(tp.x-tp.nx*L*0.19,tp.y-tp.ny*L*0.19);c.lineTo(bb[0],bb[1]);c.closePath();c.fill();}
function commaFish(c,p,k,col){const L=p.L,M=40,top=[],bot=[];
  const wC=u=>u<0.22?0.24*Math.sqrt(Math.max(0,1-Math.pow((0.22-u)/0.22,2))):0.24*Math.pow(Math.max(0,1-(u-0.22)/0.78),1.4);
  const wF=u=>u<=0.8?0.5*(PROF.song.d(u,L)+PROF.song.b(u,L))/L:lerp(0.024,0.016,(u-0.8)/0.2);
  for(let i=0;i<=M;i++){const u=i/M,s=spineAt(p,u),w=lerp(wC(u),wF(u),k)*L;top.push([s.x+s.nx*w,s.y+s.ny*w]);bot.push([s.x-s.nx*w,s.y-s.ny*w]);}
  c.fillStyle=col;c.beginPath();top.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=M;i>=0;i--)c.lineTo(bot[i][0],bot[i][1]);c.closePath();c.fill();
  if(k>0.02){const tp=spineAt(p,1),pre=spineAt(p,0.9),f=k*L;c.beginPath();c.moveTo(top[32][0],top[32][1]);c.lineTo(tp.x+tp.nx*f*0.2,tp.y+tp.ny*f*0.2);c.lineTo(tp.x+(tp.x-pre.x)*0.5*k,tp.y+(tp.y-pre.y)*0.5*k);c.lineTo(tp.x-tp.nx*f*0.19,tp.y-tp.ny*f*0.19);c.lineTo(bot[32][0],bot[32][1]);c.closePath();c.fill();}}
function drawFinale(t){const a=smooth(T_FIN-1.1,T_FIN,t);if(a<=0)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(8,8,9,${Math.min(1,a*1.2)})`;ctx.fillRect(0,0,W,H);
  const b=smooth(T_FIN-0.2,T_FIN+0.6,t)*(1-smooth(T_FIN+3.1,T_FIN+3.7,t));if(b<=0){ctx.restore();return;}
  ctx.globalAlpha=b;ctx.textAlign='left';ctx.fillStyle='#e8e0d2';ctx.font=`600 54px ${SERIF}`;ctx.letterSpacing='9px';
  const wA=ctx.measureText(TITLE_A).width,wB=ctx.measureText('，').width,wC=ctx.measureText(TITLE_C).width;const x0=W/2-(wA+wB+wC)/2,base=H/2+12;
  ctx.fillText(TITLE_A,x0,base);ctx.fillText(TITLE_C,x0+wA+wB,base);
  // 逗号：先是一个逗号。它其实就是一条蜷着的小鱼——圆头、细尾巴弯下去；
  // 先换成同样形状的"逗号鱼"（看不出换了），尾巴一抖醒过来，身子舒展开、头转向左边，然后越游越快，游出画面
  const tc=T_FIN+1.15,dot=[x0+wA+8,base-4],d=t-tc;
  const L0=17,ang0=-Math.PI/2,cv0=-0.12;const P00=procPose(0,0,ang0,L0,cv0,0,0,t).sp[0];const C0=[dot[0]-P00.x,dot[1]-P00.y];
  const cf=smooth(-0.12,0,d);
  if(cf<1){ctx.save();ctx.globalAlpha=b*(1-cf);ctx.fillText('，',x0+wA,base);ctx.restore();}
  if(cf>0){
    // 醒过来时一圈细细的涟漪
    if(d>0&&d<1.4){for(const dl of [0,0.22]){const q=d-dl;if(q<=0)continue;ctx.save();ctx.globalAlpha=b*0.27*Math.pow(Math.max(0,1-q/1.15),1.3);ctx.strokeStyle='#e8e0d2';ctx.lineWidth=1;const rr=4+54*(1-Math.exp(-3.4*q));ctx.beginPath();ctx.ellipse(C0[0],C0[1]+3,rr,rr*0.32,0,0,7);ctx.stroke();ctx.restore();}}
    const k=smooth(0.02,0.42,d);const turn=smooth(0.12,0.55,d);
    const us=clamp((d-0.32)/1.6),sv=Math.pow(us,1.8);
    const B=(q)=>{const P=[C0,[C0[0]-34,C0[1]+16],[C0[0]-380,C0[1]+40],[-170,C0[1]+30]];const m=1-q;return[m*m*m*P[0][0]+3*m*m*q*P[1][0]+3*m*q*q*P[2][0]+q*q*q*P[3][0],m*m*m*P[0][1]+3*m*m*q*P[1][1]+3*m*q*q*P[2][1]+q*q*q*P[3][1]];};
    const h=B(sv),h2=B(Math.min(1,sv+0.004)),pathAng=Math.atan2(h2[1]-h[1],h2[0]-h[0]);
    // 头从朝上慢慢转到朝左（逆时针转），起游以后跟着路线走
    const turned=ang0-Math.PI*0.5*turn;let ang=turned;if(d>0.32){const w=smooth(0.32,0.7,d);const da=Math.atan2(Math.sin(pathAng-turned),Math.cos(pathAng-turned));ang=turned+da*w;}
    const L=d<0.55?lerp(L0,30,smooth(0,0.55,d)):lerp(30,42,smooth(0.55,1.4,d));
    const cv=lerp(cv0,0,smooth(0.05,0.6,d))+0.035*Math.sin(Math.PI*clamp((d-0.1)/0.45))*(d<0.55?1:0);
    const amp=d<=0?0:(0.9*smooth(0,0.1,d)*(1-0.4*smooth(0.15,0.35,d))+0.7*smooth(0.3,0.6,d));
    const ph=2*Math.PI*(2.2*Math.max(0,d)+1.8*Math.max(0,d-0.35));
    const p=procPose(h[0],h[1],ang,L,cv,amp,ph,t);
    ctx.save();ctx.globalAlpha=b*cf;commaFish(ctx,p,k,'#e8e0d2');ctx.restore();}
  ctx.letterSpacing='0px';stampSeal(ctx,SEAL_TITLE,x0+wA+wB+wC+38,base-20,52,0.9*b,0.01);ctx.restore();}
// 3) 大鱼拼成以后：片名出现在墙上，鱼尾上方的空处，底下一小盏灯（和开头的片名呼应）
const ET=[-3050+1736,30-1545],   // 大鱼中心 FC=[-3050,30]
      ET_X0=0,ET_F=118,ET_DY=148,ET_DX=196;
function drawEndTitle(t){const t0=TG1+0.4;if(t<t0)return;let k=0;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${ET_F}px ${SERIF}`;
  [TITLE_A,TITLE_C].forEach((col,ci)=>{const x=ET[0]-ci*ET_DX,y0=ET[1]+ci*128;[...col].forEach((ch,i)=>{const a=smooth(t0+k*0.16,t0+k*0.16+0.6,t);k++;if(a<=0)return;
    ctx.save();ctx.globalAlpha=a;ctx.filter=a<1?`blur(${((1-a)*2.5).toFixed(2)}px)`:'none';ctx.fillStyle='#2b241d';ctx.fillText(ch,x,y0+i*ET_DY);ctx.restore();});});
  ctx.restore();
  const ts=146.92,sx=ET[0]-ET_DX-150,sy=ET[1]+128+3*ET_DY+40,d=t-ts;
  if(d>-0.4&&d<0.45){const near=d<0?smooth(-0.4,0,d):1-smooth(0,0.4,d);const lift=d<0?(1-smooth(-0.4,0,d)):smooth(0,0.4,d);
    ctx.save();ctx.globalAlpha=0.24*near;ctx.filter=`blur(${(9+22*lift).toFixed(1)}px)`;ctx.fillStyle='#1d1610';const sz=150*(1+0.25*lift);ctx.fillRect(sx-sz/2+10*lift,sy-sz/2+14*lift,sz,sz);ctx.restore();}
  if(d>0){const sc=1+0.025*Math.exp(-d*14);stampSeal(ctx,SEAL_TITLE,sx,sy,150*sc,0.9*(1-Math.pow(1-smooth(0,0.28,d),2)),0.012);}}
// ---------------- 拾壹 的登记 ----------------
STN.push({key:'endtitle',cx:ET[0]-100,hw:500,draw:t=>drawEndTitle(t)});
STN.push({key:'s11',cx:S11X,hw:S11W/2,x0:-1e9,x1:-6320,draw:drawS11Panel,style:style11,owns:t=>t>=T11BACK[0]+1.0,drawHero:(t,cam,TR,p)=>{if(t<TG0+0.5)styleCode(t,cam,TR,p,null);},postLight:(t,cam,TR)=>{if(t>=TG0+0.5){ctx.setTransform(...TR);styleCode(t,cam,TR,heroPoseNow(t),null);}}});
LABELS.push([S11X,S11W,S11W,'拾壹','这一站','代码']);
LIGHTS.push({x:S11X,y:-10,r:800,k:t=>smooth(132.4,134.2,t)});
WASH={k:t=>0,spot:t=>1-smooth(TG0,TG0+2.0,t),y0:-10,h0:470,h1:1050,x0:-7050,x1:1000,fx:650};
// ---------------- 片尾：十一件作品挪到一起，拼成一条大鱼；灯光打出鱼形，主角游进它的眼睛 ----------------
const TG0=140.4,TG1=144.4;
const FC=[-3050,30];
const FISH_SLOTS={s11:[-2050,70],s10:[-1340,-390],s9:[-1340,390],s8:[-600,-780],s7:[-600,-130],s6:[-600,590],s5:[160,-600],s4:[160,-60],s3:[160,460],s2:[850,-10],s1:[1640,0]};
const CX0={s1:S1X,s2:S2X,s3:S3X,s4:S4X,s5:S5X,s6:S6X,s7:S7X,s8:S8X,s9:S9X,s10:S10X,s11:S11X};
const GORDER=['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11'];
const EYE_REL=[-2020,-520],EYE_R=150;
// 大鱼也在游：一道波从头传到尾，越往后摆得越大
function bigWave(xr,t){const env=smooth(TG1-0.7,TG1+0.9,t);if(env<=0)return 0;const A=14+60*Math.pow(clamp((xr+700)/3400),1.5);return env*A*Math.sin(2*Math.PI*0.42*t-2*Math.PI*xr/5200);}
function panelOff(key,t){const tgt=FISH_SLOTS[key];if(!tgt||t<TG0)return[0,0];const k=GORDER.indexOf(key);const t0=TG0+k*0.17,d=2.3;const u=smooth(t0,t0+d,t);
  const dx=FC[0]+tgt[0]-CX0[key],dy=FC[1]+tgt[1];const side=Math.sin(Math.PI*u)*(k%2?1:-1)*80;return[dx*u,dy*u+side+bigWave(tgt[0],t)];}
FISHL={k:t=>0.78*smooth(TG0+0.4,TG1-0.4,t),path:(c,t)=>{const P=(x,y)=>[FC[0]+x,FC[1]+y+bigWave(x,t)];const C=(a,b,d,e,f,g)=>{const A=P(a,b),B=P(d,e),D=P(f,g);c.bezierCurveTo(A[0],A[1],B[0],B[1],D[0],D[1]);};
    c.beginPath();c.moveTo(...P(-2620,60));C(-2580,-360,-2300,-760,-1900,-850);C(-1500,-940,-1100,-1180,-600,-1200);C(-100,-1220,300,-1050,600,-700);C(800,-470,1000,-360,1200,-360);
    C(1500,-380,2100,-900,2780,-1260);C(2600,-760,2380,-300,2330,0);C(2380,300,2600,760,2780,1260);C(2100,900,1500,380,1200,360);
    C(1000,360,800,470,600,700);C(300,1050,-100,1160,-600,1120);C(-1100,1080,-1500,880,-1900,760);C(-2300,640,-2580,420,-2620,60);c.closePath();c.fill();
    c.beginPath();c.moveTo(...P(-1400,-1060));C(-1100,-1350,-800,-1520,-500,-1560);C(-300,-1400,-100,-1250,100,-1130);c.closePath();c.fill();
    c.beginPath();c.moveTo(...P(-320,1090));C(-150,1300,50,1430,250,1460);C(200,1300,150,1150,150,1040);c.closePath();c.fill();},
  eye:t=>[FC[0]+EYE_REL[0],FC[1]+EYE_REL[1]+bigWave(EYE_REL[0],t),EYE_R],
  extra:(c,t)=>{const k=0.62*smooth(TG1+0.1,TG1+1.0,t);if(k<=0.001)return;c.fillStyle=`rgba(255,248,236,${k.toFixed(4)})`;c.beginPath();c.ellipse(FC[0]+1640,FC[1]-1150,340,490,0,0,7);c.fill();}};
LINES.push([T11CAP[0],T11CAP[1],['这一站','是代码画的'],1668,330]);
GK.push([133.4,-6400,6],[134.2,-6520,14],[135.1,S11X+120,20],[136.2,S11X+70,16],[137.3,S11X+40,8],[138.4,S11X+12,4],[139.6,S11X-18,2],[140.5,S11X-40,-20],[141.4,-6600,-140],[142.4,-6100,-360],[143.4,-5480,-510],[143.95,-5232,-452]);
{const ex=FC[0]+EYE_REL[0],ey=FC[1]+EYE_REL[1];for(let i=1;i<15;i++){const th=Math.PI-i*Math.PI/2;GK.push([144.5+0.62*(i-1),ex+58*Math.cos(th),ey+58*Math.sin(th)]);}}
HL.push([132.6,140],[134.0,150],[140.6,150],[143.6,112]);
CK.push({t:133.6,x:S11X+180,y:0,z:1.35,f:0.5,ox:-60},{t:134.8,x:S11X+10,y:0,z:1.75},{t:T11BACK[0],x:S11X,y:4,z:1.85},{t:TG1-0.1,x:-2970,y:-20,z:0.31},{t:T_FIN,x:-2970,y:-20,z:0.318});

// ---------------- 碰到什么，就变成什么：鱼在空墙上保持上一站的样子，碰到下一件作品的材质才变 ----------------
function styleGlyph(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}drawGlyphFish(hctx,p,'brush');layerGrain(hctx,TR,0.1);blitLayer(HEROC,1);}
function styleBrushCZ(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}drawCizhouFish(hctx,p,t-T5P);layerGrain(hctx,TR,0.1);blitLayer(HEROC,1);}
function styleNianPlain(t,cam,TR,p,clip){if(clip){ctx.save();ctx.beginPath();ctx.rect(...clip);ctx.clip();}drawNianFish(ctx,TR,p,t,false);if(clip)ctx.restore();}
const MEDIA={
  s3:{path:c=>c.rect(S3X-270,S3Y-165,540,330),tIn:35.14,prev:styleGlyph},            // 拓片：碰到墨拓才变成汉画里的黑鱼
  s4:{path:c=>{c.moveTo(S4X+R4-4,S4Y);c.arc(S4X,S4Y,R4-4,0,2*Math.PI);},tIn:43.12,prev:styleHan},   // 铜洗：越过盆沿才变成铜
  s8:{path:c=>c.rect(S8X-PR8,S8Y-PR8,2*PR8,2*PR8),tIn:103.35,prev:styleYuanP},      // 年画：进了纸才变成墨线鲤鱼
  s11:{path:c=>c.rect(S11X-S11W/2,S11Y-S11W/2,S11W,S11W),tIn:135.4,prev:styleSignal}};// 代码：进了代码屏才只剩骨架
for(const s of STN){const m=MEDIA[s.key];if(!m)continue;const cur=s.style;s.style=(t,cam,TR,p,clip)=>splitStyle(t,cam,TR,p,clip,m.path,m.tIn,m.prev,cur);}
// 宋画：画外（墙上）还是磁州窑那条墨笔鱼，进了绢面才是宋画（画面里那部分由画自己来画）
{const s6=STN.find(s=>s.key==='s6');s6.style=(t,cam,TR,p,clip)=>{const e=cam.e.s6||0;const w=lerp(600,1066.67,e);const px0=S6X-w/2;
  splitStyle(t,cam,TR,p,clip,c=>c.rect(px0-9,-309,w+18,618),Infinity,styleBrushCZ,null);};}
// 磁州窑那一段：宋画展开变宽以后，盖进画面里的那部分鱼交给画自己去画
{const s5=STN.find(s=>s.key==='s5');const cz=s5.style;s5.style=(t,cam,TR,p,clip)=>{const e=cam.e.s6||0;if(e<=0){cz(t,cam,TR,p,clip);return;}const w=lerp(600,1066.67,e);const px0=S6X-w/2;
  splitStyle(t,cam,TR,p,clip,c=>c.rect(px0-9,-309,w+18,618),Infinity,cz,null);};}
// 剪纸：揭起来之前，鱼都还是年画里的那条
{const s9=STN.find(s=>s.key==='s9');s9.style=(t,cam,TR,p,clip)=>{if(t<T9LIFT)splitStyle(t,cam,TR,p,clip,PAPER9_PATH,Infinity,styleNianPlain,null);else stylePaper(t,cam,TR,p,clip);};}
