// ================= 玖 · 剪纸「双鱼」（民间，仿） =================
// 红纸对折，剪刀沿外廓剪两段。纸屑随余纸落下，展开是双鱼，右边的主角揭起游走。
const S9X=-5270,S9Y=0,S9W=420,AR9=55;
const T9IN=110.3,T9CUT=[111.0,112.1],T9DET=[112.15,113.1],T9DROP=[113.15,113.65],T9OPEN=[113.75,114.65],T9LIFT=116.0;
const RED9='rgb(196,30,34)';
function arcPt9(deg){const a=deg*Math.PI/180;return[S9X+AR9*Math.cos(a),S9Y+AR9*Math.sin(a)];}
// 剪纸鱼：一整张红纸剪出来。锯齿只剪在鳍和尾的外缘，身上的纹都是两头尖的小刀口（月牙、短线），
// 不把纸剪断，所以鱼是完整的一片；尾巴按尾柄那一段的走向搭一个自己的小坐标，身子弯得再厉害也不会拧碎
const PROF_CUT=mkProf(0.16,0.15,0.5,0.62,0.24);
function tail9(p,pr){const L=p.L,a=spineAt(p,0.72),b=spineAt(p,1);let tx=b.x-a.x,ty=b.y-a.y;const l=Math.hypot(tx,ty)||1;tx/=l;ty/=l;let nx=-ty,ny=tx;const s8=spineAt(p,0.8);if(nx*s8.nx+ny*s8.ny<0){nx=-nx;ny=-ny;}
  const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);const o=[(bt[0]+bb[0])/2,(bt[1]+bb[1])/2];return{bt,bb,F:(f,g)=>[o[0]+tx*f*L+nx*g*L,o[1]+ty*f*L+ny*g*L]};}
function qPts(a,c,b,n){const out=[];for(let i=0;i<=n;i++){const v=i/n,w=1-v;out.push([w*w*a[0]+2*w*v*c[0]+v*v*b[0],w*w*a[1]+2*w*v*c[1]+v*v*b[1]]);}return out;}
// 沿一段边剪锯齿：奇数点沿边的法线往里收一点
function sawEdge(c,pts,center,depth){for(let i=0;i<pts.length;i++){const q=pts[i];if(i%2&&i<pts.length-1){const a=pts[i-1],b=pts[i+1];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;if((center[0]-q[0])*nx+(center[1]-q[1])*ny<0){nx=-nx;ny=-ny;}c.lineTo(q[0]+nx*depth,q[1]+ny*depth);}else c.lineTo(q[0],q[1]);}}
function tailPath9(c,p,pr){const L=p.L,T=tail9(p,pr),F=T.F;const U=F(0.21,0.22),N=F(0.12,0),D=F(0.21,-0.22),ctr=F(0.1,0);
  const up=qPts(U,F(0.15,0.09),N,10),dn=qPts(N,F(0.15,-0.09),D,10).slice(1);
  c.moveTo(T.bt[0],T.bt[1]);qPts(T.bt,F(0.06,0.12),U,8).slice(1).forEach(q=>c.lineTo(q[0],q[1]));sawEdge(c,up.slice(1),ctr,0.018*L);sawEdge(c,dn,ctr,0.018*L);
  qPts(D,F(0.06,-0.12),T.bb,8).slice(1).forEach(q=>c.lineTo(q[0],q[1]));c.closePath();}
function finSaw9(c,f,depth){const n=f.out.length;c.moveTo(f.base[0][0],f.base[0][1]);
  for(let i=0;i<n-1;i++){const a=f.out[i],b=f.out[i+1],ba=f.base[i],bb=f.base[i+1];c.lineTo(a[0],a[1]);if(depth>0){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],mb=[(ba[0]+bb[0])/2,(ba[1]+bb[1])/2];c.lineTo(lerp(m[0],mb[0],depth),lerp(m[1],mb[1],depth));}}
  c.lineTo(f.out[n-1][0],f.out[n-1][1]);for(let i=n-1;i>=0;i--)c.lineTo(f.base[i][0],f.base[i][1]);c.closePath();}
const FINS9=(p,pr)=>[[finPts(p,pr,0.26,0.6,0.12,1,1.0),0.3],[finPts(p,pr,0.3,0.4,0.085,-1,1.6),0],[finPts(p,pr,0.6,0.72,0.075,-1,1.4),0.28]];
function paperSil(c,p){const pr=PROF_CUT;bodyFill(c,edges(p,pr));c.fill();c.beginPath();tailPath9(c,p,pr);c.fill();for(const [f,d] of FINS9(p,pr)){c.beginPath();finSaw9(c,f,d);c.fill();}}
// 一道两头尖的刀口（a→b，中间最宽 w；k 让它弯一点）
function slit9(c,a,b,w,k=0){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,mx=(a[0]+b[0])/2+nx*k*l,my=(a[1]+b[1])/2+ny*k*l;
  c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(mx+nx*w,my+ny*w,b[0],b[1]);c.quadraticCurveTo(mx-nx*w,my-ny*w,a[0],a[1]);c.fill();}
// 月牙：外弧和内弧在两头收成尖
function crescent9(c,cx,cy,r,ang,th,g=1){c.beginPath();const K=10;for(let i=0;i<=K;i++){const a=ang-1.05+2.1*i/K*g;c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}
  for(let i=K;i>=0;i--){const a=ang-1.05+2.1*i/K*g,rr=r*(1-th*Math.sin(Math.PI*i/K*g));c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.closePath();c.fill();}
// 鱼身上所有的刀口，各带一个“在鱼身上多靠后”的位置 u：细剪的时候剪刀从头扫到尾，扫到哪儿哪儿的刀口就出来
function cutList9(p){const pr=PROF_CUT,L=p.L,out=[];
  const ey=bodyAt(p,pr,0.085,0.3);out.push({k:'eye',u:0.085,c:ey,r:0.027*L});
  // 鳃：一道弯的长刀口
  {const g0=bodyAt(p,pr,0.19,0.78),g2=bodyAt(p,pr,0.19,-0.74),g1=bodyAt(p,pr,0.235,0);const m=[(g0[0]+g2[0])/2,(g0[1]+g2[1])/2];const l=Math.hypot(g2[0]-g0[0],g2[1]-g0[1])||1;
   const nx=-(g2[1]-g0[1])/l,ny=(g2[0]-g0[0])/l;const kv=((g1[0]-m[0])*nx+(g1[1]-m[1])*ny)/l;out.push({k:'slit',u:0.2,a:g0,b:g2,w:0.012*L,kv,c:g1});}
  // 鳞：三排月牙，错开半格
  for(const v of [0.46,0.0,-0.46])for(let u=0.3;u<0.77;u+=0.075){const uu=u+(v===0?0.037:0);if(uu>0.76)continue;const q=bodyAt(p,pr,uu,v);const sa=spineAt(p,uu);out.push({k:'cres',u:uu,c:q,r:0.032*L,ang:Math.atan2(-sa.ty,-sa.tx),th:0.34});}
  // 鳍上的鳍条
  for(const [f,d,u0,u1] of FINS9(p,pr).map((F,i)=>[F[0],F[1],[0.26,0.3,0.6][i],[0.6,0.4,0.72][i]]))for(let i=3;i<f.base.length-2;i+=3){const a=f.base[i],o=f.out[i];
    const A=[lerp(a[0],o[0],0.18),lerp(a[1],o[1],0.18)],B=[lerp(a[0],o[0],0.66),lerp(a[1],o[1],0.66)];out.push({k:'slit',u:lerp(u0,u1,i/(f.base.length-1)),a:A,b:B,w:0.006*L,kv:0,c:B});}
  // 尾上的刀口：从尾柄放射出去，剪到离边一点就停
  {const F=tail9(p,pr).F;for(const g of [0.13,0.065,0,-0.065,-0.13]){const A=F(0.03,g*0.2),B=F(0.155-Math.abs(g)*0.25,g*1.15);out.push({k:'slit',u:0.9+0.02*Math.abs(g)/0.13,a:A,b:B,w:0.006*L,kv:0,c:B});}}
  const bellyA=bodyAt(p,pr,.37,-.63),bellyB=bodyAt(p,pr,.66,-.49);
  out.push({k:'slit',u:.61,a:bellyA,b:bellyB,w:.023*L,kv:.11,c:bodyAt(p,pr,.52,-.62)});
  return out.filter(q=>{
    if(q.k!=='cres'||q.u<=.37||q.u>=.66)return true;
    const mid=spineAt(p,q.u);return (q.c[0]-mid.x)*mid.nx+(q.c[1]-mid.y)*mid.ny>=0;
  }).sort((x,y)=>x.u-y.u);}
function opening9(c,q) {
  if(q.k==='eye'){c.beginPath();c.arc(q.c[0],q.c[1],q.r,0,7);c.fill();}
  else if(q.k==='cres')crescent9(c,...q.c,q.r,q.ang,q.th,1);
  else slit9(c,q.a,[lerp(q.a[0],q.b[0],1),lerp(q.a[1],q.b[1],1)],q.w,q.kv);
}
function paperCuts(c,p){
  c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';
  for(const q of cutList9(p))opening9(c,q);
  c.restore();
}
function revealPaperWindows9(c,plan,t){
  for(const {q,touch,duration} of plan.windows){
    if(t<touch)continue;
    c.save();
    const age=(t-touch)/duration;
    if(age<1&&q.k==='cres'){crescent9(c,...q.c,q.r,q.ang,q.th,smooth(0,1,age));c.restore();continue;}
    if(age<1&&q.k==='slit'){
      const dx=q.b[0]-q.a[0],dy=q.b[1]-q.a[1],len=Math.hypot(dx,dy)||1;
      c.save();c.translate(...q.a);c.rotate(Math.atan2(dy,dx));c.beginPath();
      c.rect(-3,-len-5,(len+6)*smooth(0,1,age),2*(len+5));c.clip();
      c.rotate(-Math.atan2(dy,dx));c.translate(-q.a[0],-q.a[1]);opening9(c,q);
      c.restore();c.restore();continue;
    }
    if(age<1){
      const radius=q.r||Math.hypot(q.a[0]-q.b[0],q.a[1]-q.b[1])+3;
      c.beginPath();c.rect(q.c[0]-radius-2,q.c[1]-radius-2,2*radius+4,(2*radius+4)*smooth(0,1,age));c.clip();
    }
    opening9(c,q);c.restore();
  }
}
function mirrorPose(p,ax){return{...p,sp:p.sp.map(q=>({x:2*ax-q.x,y:q.y,nx:-q.nx,ny:q.ny}))};}
// 右半边的纹样（鱼以外）：外圈、顶上的花、底下的浪、连到鱼背的水草
function frameHalf(c){c.fillStyle=RED9;c.strokeStyle=RED9;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.arc(S9X,S9Y,126,-Math.PI/2,Math.PI/2);c.arc(S9X,S9Y,117,Math.PI/2,-Math.PI/2,true);c.closePath();c.fill();
  c.lineWidth=5;c.beginPath();c.moveTo(S9X,S9Y-117);c.lineTo(S9X,S9Y-86);c.stroke();
  c.save();c.translate(S9X,S9Y-89);c.beginPath();
  c.moveTo(0,-5);c.bezierCurveTo(6,-5,8,-1,9,2);c.bezierCurveTo(15,-1,20,-2,25,-3);
  c.bezierCurveTo(24,4,20,10,11,13);c.bezierCurveTo(7,15,4,18,0,20);c.closePath();
  c.moveTo(3,1);c.bezierCurveTo(8,4,9,9,3,14);c.bezierCurveTo(5,9,3,4,3,1);c.closePath();
  c.moveTo(20,1);c.bezierCurveTo(18,7,14,9,8,11);c.bezierCurveTo(11,6,16,3,20,1);c.closePath();c.fill('evenodd');c.restore();
  for(let j=0;j<3;j++){const y0=S9Y+80+j*12;c.beginPath();c.moveTo(S9X,y0);for(let x=0;x<=118;x+=4)c.lineTo(S9X+x,y0+4*Math.sin(x*0.13+j*1.4));c.lineWidth=4.2;c.stroke();}
  c.lineWidth=4;for(const [a0,a1] of [[-38,-30],[2,6],[38,34]]){const p0=[S9X+118*Math.cos(a0*Math.PI/180),S9Y+118*Math.sin(a0*Math.PI/180)],p1=[S9X+86*Math.cos(a1*Math.PI/180),S9Y+86*Math.sin(a1*Math.PI/180)];
    c.beginPath();c.moveTo(p0[0],p0[1]);c.quadraticCurveTo((p0[0]+p1[0])/2+6,(p0[1]+p1[1])/2-6,p1[0],p1[1]);c.stroke();}}
const PAPERTEX=(()=>{const c=mk(256,256);const x=c.getContext('2d');const r=rng(931);for(let i=0;i<2600;i++){x.fillStyle=`rgba(${r()<.5?255:60},${r()<.5?220:20},${r()<.5?200:20},${0.04+r()*0.06})`;x.fillRect(r()*256,r()*256,1+r()*2,1);}return c;})();
const C9=mk(W,H),c9=C9.getContext('2d'),foldCast9=mk(W,H),foldCtx9=foldCast9.getContext('2d');

let cuttingPlan9, POSE9=null, paperWaste9=null, paperStencil9=null, foldedCuts9=null;

  // Measure the waste side of the final, single folded stencil. This gives the
  // lotus, rim, fin tips and waves the very same edges they have after the peel.
  function prepareFoldedCuts9(stencil, fish, scale) {
    const w=stencil.width,h=stencil.height;
    const red=stencil.getContext('2d').getImageData(0,0,w,h).data;
    const support=mk(w,h), sc=support.getContext('2d');
    sc.setTransform(scale,0,0,scale,-S9X*scale,(150-S9Y)*scale);
    sc.fillStyle='#000';paperSil(sc,fish);
    const body=sc.getImageData(0,0,w,h).data;
    const dist=new Float32Array(w*h),diag=Math.SQRT2;
    for(let i=0;i<dist.length;i++)dist[i]=red[4*i+3]>=128?0:10000;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x;
      if(x)dist[i]=Math.min(dist[i],dist[i-1]+1);
      if(y){dist[i]=Math.min(dist[i],dist[i-w]+1);
        if(x)dist[i]=Math.min(dist[i],dist[i-w-1]+diag);
        if(x+1<w)dist[i]=Math.min(dist[i],dist[i-w+1]+diag);}
    }
    for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){
      const i=y*w+x;
      if(x+1<w)dist[i]=Math.min(dist[i],dist[i+1]+1);
      if(y+1<h){dist[i]=Math.min(dist[i],dist[i+w]+1);
        if(x)dist[i]=Math.min(dist[i],dist[i+w-1]+diag);
        if(x+1<w)dist[i]=Math.min(dist[i],dist[i+w+1]+diag);}
    }
    const pixel=[],arrival=[],opacity=[];
    for(let row=0;row<h;row++)for(let col=0;col<w;col++){
      const i=row*w+col,a=i*4+3;
      if(!dist[i]||dist[i]>7*scale||body[a]>126)continue;
      const x=(col+.5)/scale,y=(row+.5)/scale-150;
      const radius=Math.hypot(x,y),arc=(Math.atan2(y,x)+Math.PI/2)/Math.PI;
      let start, width, notch=0, rowWave=-1,near=100;
      if(x<121&&y>71&&y<114)for(let j=0;j<3;j++){
        const d=Math.abs(y-(80+j*12+4*Math.sin(x*.13+j*1.4)));
        if(d<near){near=d;rowWave=j;}
      }
      if(near<7.5){
        start=111.72+rowWave*.26+(rowWave===1?1-x/120:x/120)*.45;
        width=1.75;
        // A few narrow slivers between adjacent waves are freed ahead of the big offcut.
        // Their width closes toward the ends, as it does when two cuts meet.
        if(y>81&&y<104)notch=4.15*Math.max(0,1-Math.abs(x-[28,62,33][rowWave])/28);
      }else if(radius>109&&radius<130){
        const outer=radius>121;
        start=111.33+arc*1.06+(outer?0:.17);
        width=outer?2.00:1.38;
        if(!outer)notch=2.8*Math.max(0,1-Math.abs(arc-.35)/.13);
      }else if(x<30&&y<-64){
        start=111.43+clamp((y+113)/47)*.42+x*.006;
        width=2.5; notch=2.4*clamp(1-Math.abs(y+82)/11);
      }else{
        start=112.04+clamp((y+65)/135)*.72+Math.min(x,120)*.001;
        width=1.55;
        const tail=clamp(1-Math.abs(y-46)/15)*clamp(1-Math.abs(x-34)/30);
        const dorsal=clamp(1-Math.abs(y+46)/15)*clamp(1-Math.abs(x-63)/22);
        notch=2.8*Math.max(tail,dorsal);
      }
      const coverage=clamp((width+notch)*scale+.5-dist[i])*(1-red[a]/255);
      if(coverage<=0)continue;
      pixel.push(a);const firstKerf=dist[i]/(width*scale);
      const widening=notch>0?clamp((dist[i]/scale-width)/notch):0;
      arrival.push(Math.min(112.985,start+.045*Math.min(1,firstKerf)+.24*widening));opacity.push(255*coverage);
    }
    const canvas=mk(w,h),ctx=canvas.getContext('2d'),rgba=ctx.createImageData(w,h);
    return {canvas,ctx,rgba,pixel:Uint32Array.from(pixel),arrival:Float32Array.from(arrival),opacity:Uint8Array.from(opacity),time:-Infinity};
  }
  function showFoldedCuts9(c,map,t){
    if(t<111.33)return;
    const time=Math.min(t,113.13);
    if(time!==map.time){
      const bytes=map.rgba.data;
      for(let n=0;n<map.pixel.length;n++){
        const age=clamp((time-map.arrival[n])/.110);
        bytes[map.pixel[n]]=map.opacity[n]*age*age*(3-2*age);
      }
      map.ctx.putImageData(map.rgba,0,0);map.time=time;
    }
    c.drawImage(map.canvas,S9X,S9Y-150,130,300);
  }
function makeCuttingPlan9(p){
  const e=edges(p,PROF_CUT);
  const plan={pose:p,contour:e.top.concat(e.bot.slice().reverse()),windows:[]};
  // Tip-contact cuts keep their measured timing. Secondary cut marks open in
  // neighboring groups along the fish as the scissors play the original rhythm.
  const cuts=cutList9(p);
  for(const q of cuts){
    let nearest=Infinity, touch=0;
    for(let step=0;step<=120;step++){
      const t=lerp(T9DET[0],T9DET[1],step/120), tool=shearsPose9(plan,t);
      const distance=Math.hypot(tool.x-q.c[0],tool.y-q.c[1]);
      if(distance<nearest){nearest=distance;touch=t;}
    }
    const contact=nearest < Math.max(4.5,(q.r||0)+2.0);
    // Pair the three scale rows and fan the tail slots across the tip.
    const cross=(q.c[0]-S9X)/90;
    const echo=112.04+.76*q.u+.105*cross;
    plan.windows.push({q,touch:contact?touch:echo,duration:contact?.085:.195});
  }
  return plan;
}
function shearsPose9(plan,t) {
  const p=plan.pose, points=plan.contour;
  const u=clamp((t-T9CUT[0])/(T9CUT[1]-T9CUT[0]));
  const count=Math.max(1, Math.floor(points.length*u));
  const tip=points[count-1], behind=points[Math.max(0,count-7)];
  let [x,y]=tip;
  let angle=count>1 ? Math.atan2(y-behind[1],x-behind[0])
                    : Math.atan2(points[3][1]-y,points[3][0]-x);
  if(t>T9CUT[1]){
    const along=clamp(lerp(.03,1.04,clamp((t-T9DET[0])/(T9DET[1]-T9DET[0]))));
    const spine=spineAt(p,along);
    const side=Math.sin((t-T9DET[0])*19)*.07*p.L*(along<.8?1:.4);
    const next=spineAt(p,Math.min(1,along+.06)), prev=spineAt(p,Math.max(0,along-.06));
    const heading=Math.atan2(next.y-prev.y,next.x-prev.x);
    const mix=smooth(T9CUT[1],T9DET[0]+.08,t);
    x=lerp(x,spine.x+spine.nx*side,mix);
    y=lerp(y,spine.y+spine.ny*side,mix);
    angle+=Math.atan2(Math.sin(heading-angle), Math.cos(heading-angle))*mix;
  }
  const entering=1-smooth(T9CUT[0]-.30,T9CUT[0],t);
  const exiting=smooth(T9DET[1],T9DET[1]+.32,t);
  x+=18*entering+26*exiting;
  y-=22*entering+30*exiting;
  const beat=(((t-T9CUT[0]-.05)/.1)%1+1)%1;
  const cutting=(u>0&&u<1)||(t>=T9DET[0]&&t<T9DET[1]);
  const open=cutting ? .46*Math.pow(Math.sin(Math.PI*beat),.7) : .34;
  const alpha=smooth(T9CUT[0]-.3,T9CUT[0]-.05,t)*(1-smooth(T9DET[1]+.02,T9DET[1]+.32,t));
  return {x,y,angle,open,alpha,count};
}
function showPaperCut9(c,plan,count){
  if(count<2)return;
  const path=plan.contour;
  c.beginPath();c.moveTo(...path[0]);
  for(let i=1;i<count;i++)c.lineTo(...path[i]);
  c.stroke();
}
function drawPaper9(t,cam,TR){
  const z=cam.z,drop=smooth(T9DROP[0],T9DROP[1],t),open=smooth(T9OPEN[0],T9OPEN[1],t),lifted=t>=T9LIFT;
  if(!POSE9){POSE9=fishPose(HERO,T9LIFT-0.05);cuttingPlan9=makeCuttingPlan9(POSE9);}
  const tool=shearsPose9(cuttingPlan9,t);
  const half=(c,withFish,punched=drop>.02||open>0)=>{c.save();c.beginPath();c.rect(S9X,S9Y-400,400,800);c.clip();c.fillStyle=RED9;frameHalf(c);
    for(const [u,skew,reach] of [[.30,-.11,.74],[.71,.15,.83]]){
      const sides=[bodyAt(POSE9,PROF_CUT,u,-.90),bodyAt(POSE9,PROF_CUT,u,.90)];
      const dist=q=>Math.hypot(q[0]-S9X,q[1]-S9Y);
      const q=dist(sides[0])>dist(sides[1])?sides[0]:sides[1];
      const a=Math.atan2(q[1]-S9Y,q[0]-S9X)+skew;
      const x0=S9X+118*Math.cos(a),y0=S9Y+118*Math.sin(a);
      const p0=[lerp(x0,q[0],.46)-3,lerp(y0,q[1],.46)-4];
      const left=withFish?1:lerp(1,reach,smooth(T9LIFT,T9LIFT+(u>.5?.15:.07),t));
      const stop=[lerp(x0,q[0],left),lerp(y0,q[1],left)];
      c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(...p0,...stop);c.strokeStyle=RED9;c.lineWidth=2.7;c.stroke();
    }
    if(withFish){paperSil(c,POSE9);if(punched)paperCuts(c,POSE9);c.globalCompositeOperation='source-over';}c.restore();};
  layerBegin(c9,TR);
  // Leave the folded stock on the cloth. The camera can move over a stationary sheet.
  if(t<T9CUT[0]-.30){
    c9.save();c9.globalAlpha=1-drop;c9.translate(0,drop*drop*60);c9.fillStyle=RED9;c9.beginPath();c9.rect(S9X,S9Y-150,130,300);c9.fill();
    c9.globalCompositeOperation='destination-out';c9.globalAlpha=1;half(c9,true);c9.restore();
    half(c9,true);
  }else if(drop<1){
    if(!paperWaste9){
      // Cut the stationary, perforated stencil out of a solid red offcut once.
      const scale=4;
      paperStencil9=mk(130*scale,300*scale);
      const stencil=paperStencil9;
      const st=stencil.getContext('2d');
      st.setTransform(scale,0,0,scale,-S9X*scale,(150-S9Y)*scale);
      half(st,true,true);
      foldedCuts9=prepareFoldedCuts9(stencil,POSE9,scale);
      paperWaste9=mk(stencil.width,stencil.height);
      const waste=paperWaste9.getContext('2d');
      waste.fillStyle=RED9;waste.fillRect(0,0,stencil.width,stencil.height);
      waste.globalCompositeOperation='destination-out';waste.drawImage(stencil,0,0);
    }
    c9.save();c9.globalAlpha=1-drop;c9.translate(0,drop*drop*60);
    if(drop===0){c9.fillStyle=RED9;c9.fillRect(S9X,S9Y-150,130,300);}
    else c9.drawImage(paperWaste9,S9X,S9Y-150,130,300);
    c9.globalCompositeOperation='destination-out';c9.globalAlpha=1;
    c9.lineJoin='round';c9.lineCap='round';c9.lineWidth=2.15;
    showPaperCut9(c9,cuttingPlan9,tool.count);
    revealPaperWindows9(c9,cuttingPlan9,t);
    showFoldedCuts9(c9,foldedCuts9,t);
    c9.restore();
    if(drop>0){
      // Composite the perforated object as an image. Drawing its destination-out
      // holes directly onto the waste layer would punch through both at once.
      c9.drawImage(paperStencil9,S9X,S9Y-150,130,300);
      if(drop<.24){
        c9.save();c9.globalCompositeOperation='destination-out';
        c9.globalAlpha=1-smooth(0,.24,drop);c9.lineJoin='round';c9.lineCap='round';c9.lineWidth=2.15;
        showPaperCut9(c9,cuttingPlan9,tool.count);c9.restore();
      }
    }
  }else{half(c9,!lifted,true);}
  // 展开的另一半：绕折线翻过来；翻平以后轻轻弹一下才服帖
  const dq=t-T9OPEN[1],wob=dq>0?0.06*Math.exp(-5.5*dq)*Math.abs(Math.sin(9*dq)):0;
  if(open>0){const sx=Math.cos(Math.PI*(1-open))-wob;c9.save();c9.translate(S9X,0);c9.scale(sx,1);c9.translate(-S9X,0);c9.save();c9.translate(2*S9X,0);c9.scale(-1,1);half(c9,true);c9.restore();c9.restore();}
  c9.setTransform(...TR);c9.globalCompositeOperation='source-atop';c9.globalAlpha=0.6;const pt=c9.createPattern(PAPERTEX,'repeat');c9.fillStyle=pt;c9.fillRect(S9X-200,-200,400,400);c9.globalAlpha=1;
  if(open>0&&(open<1||wob>0.002)){const sx=Math.cos(Math.PI*(1-open))-wob;c9.fillStyle=`rgba(40,0,0,${0.35*(1-Math.abs(sx))})`;c9.fillRect(S9X-130*Math.max(0,sx),-160,130*Math.abs(sx),320);}
  c9.globalCompositeOperation='source-over';
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.35;ctx.filter=`brightness(0) blur(${(2.5*z).toFixed(1)}px)`;ctx.drawImage(C9,-2*z,4*z);ctx.restore();
  if(open>0&&open<1){
    const angle=Math.PI*(1-open),tilt=Math.sin(angle),ax=Math.cos(angle);
    layerBegin(foldCtx9,TR);foldCtx9.translate(S9X,0);
    foldCtx9.transform(-ax-.34*tilt,.24*tilt,0,1,0,0);foldCtx9.translate(-S9X,0);half(foldCtx9,true);
    blitLayer(foldCast9,.27*tilt,'source-over','brightness(0) blur('+((2+5*tilt)*z).toFixed(1)+'px)');
  }
  blitLayer(C9,1);
  if(tool.alpha>.003){
    layerBegin(c9,TR);scissors9(c9,tool.x,tool.y,tool.angle,tool.open);
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.32*tool.alpha;
    ctx.filter='brightness(0) blur('+(3*z).toFixed(1)+'px)';
    ctx.drawImage(C9,5*z,10*z);ctx.restore();blitLayer(C9,tool.alpha);
  }
}
// 一把老式铁剪刀（张小泉式的大圆把手），刀尖在 (x,y)，沿 ang 方向
function scissors9(c,x,y,ang,open){c.save();c.translate(x,y);c.rotate(ang);c.translate(-21,0);c.lineCap='round';c.lineJoin='round';
  for(const sg of [1,-1]){c.save();c.rotate(sg*open/2);
    c.fillStyle='#2b2623';c.beginPath();c.moveTo(-2,-sg*0.8);for(let i=0;i<=12;i++){const u=i/12;c.lineTo(u*21,sg*(3.1*Math.pow(1-u,0.75)+0.2));}c.lineTo(21.4,0);c.lineTo(-2,-sg*0.4);c.closePath();c.fill();
    c.strokeStyle='rgba(235,228,220,0.28)';c.lineWidth=0.45;c.beginPath();c.moveTo(1.5,sg*1.5);c.lineTo(16,sg*0.55);c.stroke();
    c.strokeStyle='#2b2623';c.lineWidth=2.4;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-6,-sg*1.2,-10.5,-sg*3.6);c.stroke();
    c.lineWidth=2.2;c.beginPath();c.ellipse(-16.5,-sg*5.6,6.6,4.4,-sg*0.28,0,7);c.stroke();
    c.strokeStyle='rgba(235,228,220,0.18)';c.lineWidth=0.5;c.beginPath();c.ellipse(-16.5,-sg*5.6,7.3,5.1,-sg*0.28,Math.PI*1.1,Math.PI*1.7);c.stroke();c.restore();}
  c.fillStyle='#9a9088';c.beginPath();c.arc(0,0,1.2,0,7);c.fill();c.restore();}
function drawS9Panel(t,cam,TR){const x0=S9X-S9W/2,y0=S9Y-S9W/2;panelShadow(x0,y0,S9W,S9W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S9W,S9W);ctx.clip();ctx.drawImage(LINEN,0,0,840,840,x0,y0,S9W,S9W);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(238,232,220)';ctx.fillRect(x0,y0,S9W,S9W);ctx.globalCompositeOperation='source-over';ctx.restore();
  // 主角钻进纸下面：先画它，再盖上纸
  if(t>=T9IN&&t<T9DROP[1]){ctx.setTransform(...TR);const p=heroPoseNow(t);splitStyle(t,cam,TR,p,[S9X,-3000,30000,6000],PAPER9_PATH,Infinity,styleNianPlain,null);}   // 纸底下那一截不用画：纸盖着；剪出来的刀口里透出来的是墙
  ctx.setTransform(...TR);drawPaper9(t,cam,TR);
  ctx.strokeStyle='rgba(70,60,45,0.35)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S9W,S9W);}
// 飞起来的纸鱼：带影子，像纸一样扇动
function paperFish(t,cam,TR,p,lift,clip){const z=cam.z;layerBegin(c9,TR);if(clip){c9.beginPath();c9.rect(...clip);c9.clip();}c9.fillStyle=RED9;paperSil(c9,p);paperCuts(c9,p);
  c9.setTransform(...TR);c9.globalCompositeOperation='source-atop';c9.globalAlpha=0.6;c9.fillStyle=c9.createPattern(PAPERTEX,'repeat');c9.fillRect(p.sp[0].x-300,p.sp[0].y-300,600,600);c9.globalAlpha=1;
  const s=spineAt(p,0.4);const g=c9.createLinearGradient(s.x+s.nx*40,s.y+s.ny*40,s.x-s.nx*40,s.y-s.ny*40);g.addColorStop(0,'rgba(255,200,190,0.18)');g.addColorStop(1,'rgba(40,0,0,0.22)');c9.fillStyle=g;c9.fillRect(p.sp[0].x-300,p.sp[0].y-300,600,600);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.38;ctx.filter=`brightness(0) blur(${((1.5+5*lift)*z).toFixed(1)}px)`;ctx.drawImage(C9,(-2-8*lift)*z,(3+16*lift)*z);ctx.restore();blitLayer(C9,1);}
const PAPER9_PATH=c=>c.rect(S9X,S9Y-150,130,300);
function stylePaper(t,cam,TR,p,clip){paperFish(t,cam,TR,p,0.3+0.7*smooth(T9LIFT,T9LIFT+0.45,t),clip);}

// ---------------- 玖 的登记 ----------------
STN.push({key:'s9',cx:S9X,hw:S9W/2,x0:-5560,x1:-4980,draw:drawS9Panel,owns:t=>t>=T9IN&&t<T9LIFT,drawHero:()=>{},style:stylePaper});
LABELS.push([S9X,S9W,S9W,'玖','双鱼','民间剪纸']);
LIGHTS.push({x:S9X,y:-10,r:600,k:t=>smooth(108.2,110.2,t)});
{const P=(deg)=>arcPt9(deg);GK.push([110.2,S9X+170,40],[110.55,S9X+100,62],[110.75,S9X+60,62],[110.9,...P(60)],[111.05,...P(30)],[111.2,...P(0)],[111.35,...P(-30)],[111.5,...P(-60)],[111.65,...P(-80)],
  [112.6,...P(-80.3)],[113.7,...P(-80.6)],[114.9,...P(-80.9)],[T9LIFT,...P(-81.2)],[T9LIFT+0.15,...P(-95)],[T9LIFT+0.32,...P(-118)],[T9LIFT+0.55,S9X-62,S9Y-52],[T9LIFT+0.9,S9X-128,S9Y-42],[T9LIFT+1.35,S9X-205,S9Y-30],[T9LIFT+1.9,S9X-290,S9Y-18]);}
HL.push([109.6,150],[110.5,150]);
HAMP.push(t=>(1-0.95*smooth(111.6,111.8,t)*(1-smooth(T9LIFT-0.05,T9LIFT+0.1,t)))*(1+1.2*smooth(T9LIFT,T9LIFT+0.2,t)*(1-smooth(T9LIFT+1.5,T9LIFT+2.5,t))));
HFB.push(t=>1.6*smooth(T9LIFT,T9LIFT+0.2,t)*(1-smooth(T9LIFT+1.6,T9LIFT+2.6,t)));
// 镜头：剪的时候凑近看折着的那半张纸；展开时退后，把整幅双鱼留在画面中间
CK.push({t:110.0,x:S9X+70,y:0,z:1.5,f:0.4,ox:-40},{t:111.0,x:S9X+22,y:0,z:2.1},{t:112.2,x:S9X+44,y:2,z:2.7},{t:113.2,x:S9X+46,y:2,z:2.78},{t:114.5,x:S9X-4,y:0,z:2.3},{t:115.9,x:S9X-6,y:0,z:2.38},{t:116.9,x:S9X-80,y:-20,z:1.6,f:0.4,ox:-60});
