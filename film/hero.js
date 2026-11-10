// ================= 主角：一条路线贯穿全片，按所在区域换画风 =================
GK.sort((a,b)=>a[0]-b[0]);HL.sort((a,b)=>a[0]-b[0]);
const HK=hermite(GK);
const heroL=t=>keyed(HL,t);
const heroAmp=t=>{let a=1;for(const f of HAMP)a*=f(t);return a;};
const heroFB=t=>{let a=0;for(const f of HFB)a+=f(t);return a;};
const T_LAST=GK[GK.length-1][0];
const HERO={tr:makeTrackF(withHistory(t=>t<T_X-0.9?s1Circ(heroPhi(t)):HK(t),-8,PhiOf(-8)),-8,T_LAST+4,1/120,heroFB),L:heroL,winks:WINKS,amp:heroAmp,
  stiff:t=>t>=108.5&&t<T9LIFT?0:(t>=T9LIFT&&t<T9LIFT+0.45?smooth(T9LIFT,T9LIFT+0.45,t):1)};
// 跨界时：只让鱼正要进去的那一站来画整条鱼。每一站在自己的材质外面画的都是上一站的样子，
// 所以换站不会在空墙上留下接缝（以前两站各画一半，影子和抗锯齿在分界处会裂出一道竖线）
function drawHeroWall(t,cam,TR,p){let mn=1e9,mx=-1e9;for(const q of p.sp){mn=Math.min(mn,q.x);mx=Math.max(mx,q.x);}mn-=p.L*0.4;mx+=p.L*0.4;
  let best=null;for(const s of STN){if(!s.style||mx<s.x0||mn>s.x1)continue;if(!best||s.x0<best.x0)best=s;}
  if(best)best.style(t,cam,TR,p,null);}

function heroPoseNow(t){let k=0;for(const f of HSTIFF)k=Math.max(k,f(t));const p=stiffenPose(fishPose(HERO,t),k);let ox=0,oy=0;for(const f of HOFF){const o=f(t);ox+=o[0];oy+=o[1];}if(ox||oy)for(const q of p.sp){q.x+=ox;q.y+=oy;}return p;}
