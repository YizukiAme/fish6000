// ================= 拾壹 · 代码（结尾） =================
// 一块黑底的屏，像一个编辑器：画这条鱼的代码一行行打出来，鱼只剩骨架——脊线、采样点、轮廓。
// 函数打完，接着是十行 drawXxx(pose)：每打完一行，鱼就换上那一站的画法（同一根脊线，换一种画法）。
// 最后一行是渲染全片的循环；它一“跑起来”，镜头拉远，看整面墙
const S11X=-6700,S11Y=0,S11W=600;
const T11IN=137.4,T11CAP=[138.6,142.5],T11CAP2=[146.3,150.9];
const TK=[144.30,145.08,145.82,146.52,147.18,147.80,148.38,148.93,149.45,149.95];   // 十行 drawXxx 各自打完的时刻：鱼在这一刻换画法
const TSKIN=[...TK,TK[9]+0.3],TSKIN_END=TK[9]+0.8,WIPE11=0.2;                        // 像素那一行连着两种（1980 的马赛克 → 2026）；最后换回骨架
const T11LOOP=150.95,T11RUN=151.95,T11BACK=[152.5,157.0],T_FIN=164.0;                // 打最后一行；它跑起来；镜头拉远；全片转黑
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
 ['f','drawBanpo','p','(pose);','p','     ','c','// 仰韶 · 彩陶'],
 ['f','drawOracle','p','(pose);','p','    ','c','// 商 · 甲骨'],
 ['f','drawRubbing','p','(pose);','p','   ','c','// 汉 · 画像石'],
 ['f','drawBronze','p','(pose);','p','    ','c','// 汉 · 铜洗'],
 ['f','drawCizhou','p','(pose);','p','    ','c','// 宋金 · 磁州窑'],
 ['f','drawSilk','p','(pose);','p','      ','c','// 宋 · 绢本'],
 ['f','drawYuan','p','(pose);','p','      ','c','// 元 · 青花'],
 ['f','drawNianhua','p','(pose);','p','   ','c','// 清 · 年画'],
 ['f','drawPapercut','p','(pose);','p','  ','c','// 民间 · 剪纸'],
 ['f','drawPixels','p','(pose);','p','    ','c','// 1980—2026'],
 ['p',''],
 ['k','for ','p','(let t = ','n','0','p','; t < ','n',String(Math.round(T_FIN+4)),'p','; t += ','n','1','p','/','n','30','p',') ','f','render','p','(t);']];
const CCOL={c:'#6a7a70',k:'#c792ea',f:'#82aaff',p:'#c9d1d9',n:'#f78c6c'};
const CFONT='500 10.5px "DejaVu Sans Mono","Noto Serif CJK SC"',CLH=17.5,CDRAW0=15,CLOOP=26,CSCROLL0=14;
const codeLen=line=>{let n=0;for(let j=1;j<line.length;j+=2)n+=[...line[j]].length;return n;};
// 打字的日程：每一行什么时候开始打、一秒打几个字、要一个个打出来的有多少（main）；
// drawXxx 那几行只打“调用”这一段，一打完（正好是 TK[k]），后面的注释整句跳出来，像编辑器的提示
const CPLAN=(()=>{const P=[];let T=T11IN-0.8;CODE.forEach((line,li)=>{const n=codeLen(line);
  if(li<13){P.push({t:T,cps:70,main:n});T+=n/70+0.045;}
  else if(li===13){P.push({t:T,cps:70,main:0});T+=0.3;}
  else if(li===14){P.push({t:T,cps:30,main:n});T+=n/30;}
  else if(li<CDRAW0+TK.length){const m=[...line[1]].length+[...line[3]].length;P.push({t:TK[li-CDRAW0]-m/80-0.02,cps:80,main:m});}
  else if(li===CLOOP-1)P.push({t:TK[TK.length-1]+0.3,cps:70,main:0});
  else P.push({t:T11LOOP,cps:54,main:n});});return P;})();
function codeShown(li,t){const q=CPLAN[li];if(t<q.t)return-1;const n=Math.floor((t-q.t)*q.cps);return n>=q.main?codeLen(CODE[li]):n;}
function drawS11Panel(t,cam,TR){const x0=S11X-S11W/2,y0=S11Y-S11W/2;panelShadow(x0,y0,S11W,S11W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S11W,S11W);ctx.clip();const g=ctx.createRadialGradient(S11X+60,0,40,S11X,0,560);g.addColorStop(0,'#16191e');g.addColorStop(1,'#0b0c0f');ctx.fillStyle=g;ctx.fillRect(x0,y0,S11W,S11W);
  // 一行行打出来。打到第 15 行以后整段往上滚，正在打的那一行一直停在同一个高度，下面留给鱼
  let cur=-1;for(let i=0;i<CODE.length;i++)if(t>=CPLAN[i].t)cur=i;
  const scroll=cur>CSCROLL0?CLH*((cur-CSCROLL0-1)+smooth(CPLAN[cur].t,CPLAN[cur].t+0.14,t)):0;
  const X0=x0+44,Y0=y0+65-scroll;ctx.font=CFONT;ctx.textBaseline='top';
  // 刚执行的那一行：一条淡淡的底色，左边一道竖线
  {let hk=-1;for(let i=0;i<TK.length;i++)if(t>=TK[i])hk=i;let li=-1,tt=0,col='130,170,255';if(t>=T11RUN){li=CLOOP;tt=T11RUN;col='127,219,202';}else if(hk>=0&&t<TSKIN_END+0.1){li=CDRAW0+hk;tt=TK[hk];}
    if(li>=0){const y=Y0+li*CLH,f=Math.exp(-(t-tt)*8);ctx.fillStyle=`rgba(${col},${(0.085+0.22*f).toFixed(3)})`;ctx.fillRect(x0+8,y-3.5,S11W*0.6,CLH);ctx.fillStyle=`rgba(${col},${(0.75+0.25*f).toFixed(3)})`;ctx.fillRect(x0+8,y-3.5,2.2,CLH);}}
  let cx=X0,cy=Y0;
  CODE.forEach((line,li)=>{const sh=codeShown(li,t);if(sh<0)return;const y=Y0+li*CLH;if(y<y0-CLH)return;let x=X0,left=sh;
    ctx.fillStyle='rgba(120,130,140,0.45)';ctx.fillText(String(li+1).padStart(2,' '),x0+16,y);
    for(let j=0;j<line.length&&left>0;j+=2){const ch=[...line[j+1]];const shown=ch.slice(0,left).join('');left-=ch.length;ctx.fillStyle=CCOL[line[j]];ctx.fillText(shown,x,y);x+=ctx.measureText(shown).width;}
    if(li===cur){cx=x;cy=y;}});
  // 光标：正在打字时常亮，停下来就一闪一闪
  if(cur>=0){const q=CPLAN[cur],typing=(t-q.t)*q.cps<q.main+2;if(typing||Math.floor(t*2.5)%2===0){ctx.fillStyle='#c9d1d9';ctx.fillRect(cx+1,cy-0.5,6,12);}}
  // 换画法的时候，鱼身后亮起一团光（墙的颜色），让每一种画法都看得清
  const fl=smooth(TK[0]-0.6,TK[0]-0.1,t)*(1-smooth(TSKIN_END,TSKIN_END+0.5,t));if(fl>0){const p=heroPoseNow(t);const c0=spineAt(p,0.47),R=p.L*0.98;ctx.save();ctx.translate(c0.x,c0.y);ctx.scale(1,0.6);const g2=ctx.createRadialGradient(0,0,8,0,0,R);
    g2.addColorStop(0,`rgba(232,226,212,${0.94*fl})`);g2.addColorStop(0.62,`rgba(232,226,212,${0.6*fl})`);g2.addColorStop(1,'rgba(232,226,212,0)');ctx.fillStyle=g2;ctx.fillRect(-R,-R,2*R,2*R);ctx.restore();}
  ctx.restore();ctx.strokeStyle='rgba(20,22,26,0.6)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S11W,S11W);}
// 骨架：脊线、采样点、轮廓、肋线。o.alpha 整体透明度；o.bare 只画骨架、不带读数
function styleCode(t,cam,TR,p,clip,o){const pr=PROF.song,L=p.L,ga=o&&o.alpha!==undefined?o.alpha:1;ctx.save();ctx.setTransform(...TR);if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.globalAlpha=ga;
  const z=cam.z;const lw=z>=1?1/z:Math.pow(z,-0.5);const e=edges(p,pr);
  // 读数：从游进屏里一直带到开始换画法；之后收起来，掉头、窜出去的时候只剩干净的骨架
  const la=o&&o.bare?0:smooth(0.75,1.15,z)*(1-smooth(TK[0]-0.3,TK[0]-0.05,t));
  const pass=(col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w*lw;
    ctx.beginPath();e.top.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));for(let i=e.M;i>=0;i--)ctx.lineTo(e.bot[i][0],e.bot[i][1]);ctx.closePath();ctx.stroke();
    for(let k=1;k<10;k++){const u=k/10*0.8;const a=bodyAt(p,pr,u,1),b=bodyAt(p,pr,u,-1);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
    const tp=spineAt(p,1);const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);ctx.beginPath();ctx.moveTo(bt[0],bt[1]);ctx.lineTo(tp.x+tp.nx*L*0.18,tp.y+tp.ny*L*0.18);ctx.lineTo(tp.x,tp.y);ctx.lineTo(tp.x-tp.nx*L*0.17,tp.y-tp.ny*L*0.17);ctx.lineTo(bb[0],bb[1]);ctx.stroke();};
  pass('rgba(0,0,0,0.55)',3.2);pass('rgba(127,219,202,0.85)',1.2);
  ctx.strokeStyle='rgba(255,203,107,0.95)';ctx.lineWidth=1.6*lw;ctx.beginPath();p.sp.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
  ctx.fillStyle='rgba(255,203,107,0.95)';p.sp.forEach((q,i)=>{if(i%2)return;ctx.beginPath();ctx.arc(q.x,q.y,(i%8?1.3:2.3)*lw*1.4,0,7);ctx.fill();});
  ctx.strokeStyle='rgba(130,170,255,0.7)';ctx.lineWidth=1*lw;for(let i=0;i<=p.N;i+=4){const q=p.sp[i];ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+q.nx*L*0.06,q.y+q.ny*L*0.06);ctx.stroke();}
  const ey=bodyAt(p,pr,0.08,0.3);ctx.strokeStyle='rgba(127,219,202,0.9)';ctx.beginPath();ctx.arc(ey[0],ey[1],L*0.025,0,7);ctx.stroke();
  ctx.font=`${(10*lw).toFixed(2)}px "DejaVu Sans Mono"`;ctx.textBaseline='alphabetic';
  // 读数：每个数钉在它量的那个地方，用细线拉出来，跟着那一点动；鱼游进代码屏时，读数从鱼头这一侧开始一样一样跟着进来
  if(la>0.01){const N=p.N,h=p.sp[0],tl=p.sp[N],I=p.I||0,TAU=2*Math.PI,ph0=p.ph||0,ph=((ph0%TAU)+TAU)%TAU;const waveAt=u=>L*(0.012+0.08*u*u)*I*Math.sin(TAU*0.9*u-ph0);
    const sg=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(2);
    const wOf=parts=>parts.reduce((a,[k,v])=>a+ctx.measureText(k).width+ctx.measureText(v).width,0);
    const text=(parts,x,y,al)=>{for(const [k,v] of parts){ctx.fillStyle=`rgba(201,209,217,${0.6*al})`;ctx.fillText(k,x,y);x+=ctx.measureText(k).width;ctx.fillStyle=`rgba(247,140,108,${0.92*al})`;ctx.fillText(v,x,y);x+=ctx.measureText(v).width;}};
    const callout=(ax,ay,lx,ly,parts,right,ring,k=1)=>{const al=la*k,w=wOf(parts),x0=right?lx-w:lx;ctx.lineWidth=0.9*lw;ctx.strokeStyle=`rgba(247,140,108,${0.36*al})`;
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(lx,ly+3*lw);ctx.lineTo(right?x0:x0+w,ly+3*lw);ctx.stroke();
      ctx.strokeStyle=ctx.fillStyle=`rgba(247,140,108,${0.9*al})`;ctx.beginPath();if(ring){ctx.arc(ax,ay,3.2*lw,0,7);ctx.stroke();}else{ctx.arc(ax,ay,1.5*lw,0,7);ctx.fill();}text(parts,x0,ly,al);};
    let ymin=1e9,ymax=-1e9;for(const q of p.sp){ymin=Math.min(ymin,q.y);ymax=Math.max(ymax,q.y);}
    // 鱼头前面一列：u、L，下面是整条鱼的 s、phase、I
    ctx.textAlign='right';ctx.fillStyle=`rgba(201,209,217,${0.75*la})`;ctx.fillText('u=0',h.x-7*lw,h.y-3*lw);ctx.fillText(`L=${L.toFixed(1)}`,h.x-7*lw,h.y+10*lw);ctx.textAlign='left';
    if(p.s!==undefined){const r1=[['s=',p.s.toFixed(1)]],r2=[['phase=',ph.toFixed(3)],['  I=',I.toFixed(3)]];text(r1,h.x-7*lw-wOf(r1),h.y+23*lw,la);text(r2,h.x-7*lw-wOf(r2),h.y+36*lw,la);}
    // 鱼头：朝向和速度
    const hd=Math.atan2(p.sp[0].y-p.sp[3].y,p.sp[0].x-p.sp[3].x),th=((-hd*180/Math.PI)%360+360)%360;
    callout(h.x,h.y,h.x-12*lw,h.y-30*lw,[['θ=',th.toFixed(1)+'°'],['  v=',(p.spd||0).toFixed(1)]],true,false);
    // 身子中段：曲率
    {const m=N>>1,qa=p.sp[m-3],qb=p.sp[m],qc=p.sp[m+3];let dk=Math.atan2(qc.y-qb.y,qc.x-qb.x)-Math.atan2(qb.y-qa.y,qb.x-qa.x);dk=Math.atan2(Math.sin(dk),Math.cos(dk));const kap=dk/((Math.hypot(qc.x-qa.x,qc.y-qa.y)/2)||1);
     callout(qb.x,qb.y,qb.x-8*lw,ymax+L*0.14+12*lw,[['κ=',kap.toFixed(4)]],true,false);}
    // 尾尖：读数跟着尾巴一起摆
    callout(tl.x,tl.y,tl.x+14*lw,tl.y+20*lw,[['u=1  wave=',sg(waveAt(1))]],false,false);
    // 探针：只在已经进了代码屏的那段脊线上来回扫，不会从尾巴跳回鱼头
    {let f=1;if(t<MEDIA.s11.tIn)for(let i=0;i<=N;i++){if(p.sp[i].x>S11X+S11W/2){f=i/N;break;}}
     const lo=0.06,hi=Math.min(0.9,f-0.04),k=clamp((hi-lo)/0.12);if(k>0){const pu=lo+(hi-lo)*(0.5-0.5*Math.cos(TAU*t/4.6)),pq=spineAt(p,pu);
       callout(pq.x,pq.y,pq.x-8*lw,ymin-L*0.16-6*lw,[['u=',pu.toFixed(3)],['  wave=',sg(waveAt(pu))]],true,true,k);}}}
  ctx.restore();}
// 十行 drawXxx 对应的画法（像素那一行连着两种）。换的时候从鱼头往鱼尾刷过去：一道竖线扫过，线前面是旧画法，线后面是新画法；
// 每换一次，骨架在新画法上面亮一下再隐去——还是同一根脊线
const SKINS11=()=>[styleBanpo,styleOBI,styleHan,styleBronze,styleCizhou,styleSong,styleYuanP,styleNian,stylePaper,styleMosaic,styleSignal];
function style11(t,cam,TR,p,clip){if(t<TSKIN[0]||t>=TSKIN_END+WIPE11){styleCode(t,cam,TR,p,clip);return;}
  const S=SKINS11();let k=0;for(let i=0;i<TSKIN.length;i++)if(t>=TSKIN[i])k=i;
  const ending=t>=TSKIN_END,tw=ending?TSKIN_END:TSKIN[k],e=clamp((t-tw)/WIPE11),ee=e*e*(3-2*e);
  const cur=ending?((tt,c,T,q,cl)=>styleCode(tt,c,T,q,cl)):S[k],prev=ending?S[k]:(k>0?S[k-1]:((tt,c,T,q,cl)=>styleCode(tt,c,T,q,cl)));
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const q of p.sp){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);}
  const head=p.sp[0].x<p.sp[p.N].x?-1:1;   // 鱼头朝左就从左往右刷
  const xa=x0-p.L*0.3,xb=x1+p.L*0.3,xw=head<0?lerp(xa,xb,ee):lerp(xb,xa,ee);
  if(e<1){const A=head<0?[xw,-9000,60000,18000]:[xw-60000,-9000,60000,18000],B=head<0?[xw-60000,-9000,60000,18000]:[xw,-9000,60000,18000];
    ctx.setTransform(...TR);prev(t,cam,TR,p,A);ctx.setTransform(...TR);cur(t,cam,TR,p,B);
    ctx.save();ctx.setTransform(...TR);const lw=1/cam.z;ctx.strokeStyle=`rgba(127,219,202,${(0.9*Math.sin(Math.PI*e)).toFixed(3)})`;ctx.lineWidth=1.4*lw;ctx.beginPath();ctx.moveTo(xw,y0-p.L*0.3);ctx.lineTo(xw,y1+p.L*0.3);ctx.stroke();ctx.restore();}
  else{ctx.setTransform(...TR);cur(t,cam,TR,p,null);}
  if(!ending){const f=0.8*Math.exp(-(t-tw)*6.5);if(f>0.02){ctx.setTransform(...TR);styleCode(t,cam,TR,p,null,{alpha:f,bare:true});}}}
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
  ctx.letterSpacing='0px';{const ds=t-(T_FIN+0.3);if(ds>0)stampSeal(ctx,SEAL_TITLE,x0+wA+wB+wC+38,base-20,52*(1+0.05*Math.exp(-ds*16)),0.88*b*(1-Math.pow(1-smooth(0,0.22,ds),2)),0.01,'source-over');}ctx.restore();}
// 3) 大鱼拼成以后：片名出现在墙上，鱼尾上方的空处，底下一小盏灯（和开头的片名呼应）
const ET=[-3050+1736,30-1545],   // 大鱼中心 FC=[-3050,30]
      ET_X0=0,ET_F=118,ET_DY=148,ET_DX=196;
function drawEndTitle(t){const t0=TG1+0.4;if(t<t0)return;let k=0;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${ET_F}px ${SERIF}`;
  [TITLE_A,TITLE_C].forEach((col,ci)=>{const x=ET[0]-ci*ET_DX,y0=ET[1]+ci*128;[...col].forEach((ch,i)=>{const a=smooth(t0+k*0.16,t0+k*0.16+0.6,t);k++;if(a<=0)return;
    ctx.save();ctx.globalAlpha=a;ctx.filter=a<1?`blur(${((1-a)*2.5).toFixed(2)}px)`:'none';ctx.fillStyle='#2b241d';ctx.fillText(ch,x,y0+i*ET_DY);ctx.restore();});});
  ctx.restore();
  const ts=TG1+2.52,sx=ET[0]-ET_DX-150,sy=ET[1]+128+3*ET_DY+40,d=t-ts;
  if(d>-0.4&&d<0.45){const near=d<0?smooth(-0.4,0,d):1-smooth(0,0.4,d);const lift=d<0?(1-smooth(-0.4,0,d)):smooth(0,0.4,d);
    ctx.save();ctx.globalAlpha=0.24*near;ctx.filter=`blur(${(9+22*lift).toFixed(1)}px)`;ctx.fillStyle='#1d1610';const sz=150*(1+0.25*lift);ctx.fillRect(sx-sz/2+10*lift,sy-sz/2+14*lift,sz,sz);ctx.restore();}
  if(d>0){const sc=1+0.025*Math.exp(-d*14);stampSeal(ctx,SEAL_TITLE,sx,sy,150*sc,0.9*(1-Math.pow(1-smooth(0,0.28,d),2)),0.012);}}
// ---------------- 拾壹 的登记 ----------------
STN.push({key:'endtitle',cx:ET[0]-100,hw:500,draw:t=>drawEndTitle(t)});
STN.push({key:'s11',cx:S11X,hw:S11W/2,x0:-1e9,x1:-6320,draw:drawS11Panel,style:style11,owns:t=>t>=T11BACK[0]+0.6,drawHero:(t,cam,TR,p)=>{if(t<TG0+0.5)styleCode(t,cam,TR,p,null);},postLight:(t,cam,TR)=>{if(t>=TG0+0.5){ctx.setTransform(...TR);styleCode(t,cam,TR,heroPoseNow(t),null);}}});
LABELS.push([S11X,S11W,S11W,'拾壹','这一站','代码']);
LIGHTS.push({x:S11X,y:-10,r:800,k:t=>smooth(136.4,138.2,t)});
WASH={k:t=>0,spot:t=>1-smooth(TG0,TG0+2.0,t),y0:-10,h0:470,h1:1050,x0:-7050,x1:1000,fx:650};
// ---------------- 片尾：十一件作品挪到一起，拼成一条大鱼；灯光打出鱼形，主角游进它的眼睛 ----------------
const TG0=T11BACK[0]+0.5,TG1=TG0+4.0;
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
LINES.push([T11CAP[0],T11CAP[1],['这一站','是代码画的'],1680,330]);
LINES.push([T11CAP2[0],T11CAP2[1],['前面十站','也是'],1680,330]);
// 路线：从右边游进代码屏，沉到屏的下半边（上半边留给代码），慢慢往左漂。打最后一行的时候它在代码下面的空处掉过头来；
// 那一行一跑起来，它就从屏的右边窜出去，朝大鱼的眼睛游——全程不从代码上面穿过；它比镜头先走半步，镜头拉远的时候一直在画面里
GK.push([137.4,-6400,22],[138.2,-6492,74],[139.0,-6556,118],[140.0,-6600,136],[141.5,-6640,143],[143.5,-6682,146],[146.0,-6732,145],[148.5,-6782,143],[150.6,-6822,140],
  [151.0,-6836,141],[151.5,-6866,158],[151.9,-6876,186],[152.25,-6850,214],[152.6,-6790,223],[153.0,-6650,200],[153.4,-6440,110],[153.8,-6180,-60],[154.2,-5930,-250],[154.6,-5700,-400],[155.2,-5470,-492],[155.9,-5300,-480],[156.5,-5180,-455]);
{const ex=FC[0]+EYE_REL[0],ey=FC[1]+EYE_REL[1];for(let i=1;i<16;i++){const th=Math.PI-i*Math.PI/2;GK.push([TG1+0.1+0.62*(i-1),ex+58*Math.cos(th),ey+58*Math.sin(th)]);}}
HL.push([136.6,140],[138.0,150],[153.2,150],[156.2,112]);
// 在代码屏里游得慢，尾巴摆得稍微有劲一点，各种画法才看得出是活的
HAMP.push(t=>1+0.5*smooth(140.5,142.5,t)*(1-smooth(151.6,152.6,t)));
HFB.push(t=>0.32*smooth(140.5,142.5,t)*(1-smooth(151.6,152.6,t)));
CK.push({t:137.6,x:S11X+180,y:0,z:1.35,f:0.5,ox:-60},{t:139.0,x:S11X+44,y:-10,z:2.02},{t:142.8,x:S11X+46,y:4,z:2.08},{t:144.4,x:S11X+50,y:46,z:2.2},{t:150.8,x:S11X+50,y:52,z:2.27},{t:T11BACK[0],x:S11X+50,y:50,z:2.28},{t:TG1-0.1,x:-2970,y:-20,z:0.31},{t:T_FIN,x:-2970,y:-20,z:0.318});

// ---------------- 碰到什么，就变成什么：鱼在空墙上保持上一站的样子，碰到下一件作品的材质才变 ----------------
function styleGlyph(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}drawGlyphFish(hctx,p,'brush');layerGrain(hctx,TR,0.1);blitLayer(HEROC,1);}
function styleBrushCZ(t,cam,TR,p,clip){layerBegin(hctx,TR);if(clip){hctx.beginPath();hctx.rect(...clip);hctx.clip();}drawCizhouFish(hctx,p,TNOW);layerGrain(hctx,TR,0.1);blitLayer(HEROC,1);}
function styleNianPlain(t,cam,TR,p,clip){if(clip){ctx.save();ctx.beginPath();ctx.rect(...clip);ctx.clip();}drawNianFish(ctx,TR,p,t,false);if(clip)ctx.restore();}
const MEDIA={
  s3:{path:c=>c.rect(S3X-270,S3Y-165,540,330),tIn:35.14,prev:styleOBI},              // 拓片：碰到墨拓才变成汉画里的黑鱼
  s4:{path:c=>{c.moveTo(S4X+R4-4,S4Y);c.arc(S4X,S4Y,R4-4,0,2*Math.PI);},tIn:43.12,prev:styleHan},   // 铜洗：越过盆沿才变成铜
  s8:{path:c=>c.rect(S8X-PR8-8,S8Y-PR8-8,2*PR8+16,2*PR8+16),tIn:103.35,prev:styleYuanP}, // 年画：越过红框和纸的交界，才变成墨线鲤鱼
  s11:{path:c=>c.rect(S11X-S11W/2,S11Y-S11W/2,S11W,S11W),tIn:139.9,prev:styleSignal}};// 代码：进了代码屏才只剩骨架
for(const s of STN){const m=MEDIA[s.key];if(!m)continue;const cur=s.style;s.style=(t,cam,TR,p,clip)=>splitStyle(t,cam,TR,p,clip,m.path,m.tIn,m.prev,cur);}
// 宋画：画外（墙上）还是磁州窑那条墨笔鱼，进了绢面才是宋画（画面里那部分由画自己来画）
{const s6=STN.find(s=>s.key==='s6');s6.style=(t,cam,TR,p,clip)=>{const e=cam.e.s6||0;const w=lerp(600,1066.67,e);const px0=S6X-w/2;
  splitStyle(t,cam,TR,p,clip,c=>c.rect(px0-9,-309,w+18,618),Infinity,styleBrushCZ,null);};}
// 磁州窑那一段：宋画展开变宽以后，盖进画面里的那部分鱼交给画自己去画
{const s5=STN.find(s=>s.key==='s5');const cz=s5.style;s5.style=(t,cam,TR,p,clip)=>{const e=cam.e.s6||0;if(e<=0){cz(t,cam,TR,p,clip);return;}const w=lerp(600,1066.67,e);const px0=S6X-w/2;
  splitStyle(t,cam,TR,p,clip,c=>c.rect(px0-9,-309,w+18,618),Infinity,cz,null);};}
// 剪纸：揭起来之前，鱼都还是年画里的那条
{const s9=STN.find(s=>s.key==='s9');s9.style=(t,cam,TR,p,clip)=>{if(t<T9LIFT)splitStyle(t,cam,TR,p,clip,PAPER9_PATH,Infinity,styleNianPlain,null);else stylePaper(t,cam,TR,p,clip);};}
