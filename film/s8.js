// ================= 捌 · 木版年画「连年有余」（清，仿） =================
// 先只有墨线版：胖娃娃两手空空地抱着。主角游进他怀里补上那条鲤鱼，黄、红、绿、粉四块色版一版版压上去；鱼一扭，从怀里溜了
const S8X=-4690,S8Y=0,S8W=420,PR8=180,MS8=3,P8=Math.ceil(2*PR8*MS8);
const T8C=[103.85,104.2,104.55,104.9],T8SLIP=105.62;
const BLK=[{k:'yellow',col:[240,184,34],off:[1.3,-0.9]},{k:'red',col:[214,40,36],off:[-1.1,1.4]},{k:'green',col:[34,138,84],off:[1.7,1.1]},{k:'pink',col:[234,104,138],off:[-0.7,-1.5]}];
const B8={};
function b8k(t,i){return smooth(T8C[i]-0.02,T8C[i]+0.1,t);}
// ---------- 刀刻线：两头出锋、中段略鼓、边上带一点刀痕 ----------
let KW=1;
function kline(c,ctrl,w,o={}){w*=KW;const n=o.n||Math.max(10,ctrl.length*7);const P=curvePts(ctrl,n);
  const r=rng(o.seed||((Math.abs(ctrl[0][0]*131+ctrl[0][1]*71+ctrl.length*17)|0)+1));const N=P.length;const ti=o.ti??0.2,to=o.to??0.25,sw=o.sw??0.3;const L=[],R=[];
  for(let i=0;i<N;i++){const v=i/(N-1);const a=P[Math.max(0,i-1)],b=P[Math.min(N-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    let f=Math.min(1,ti>0?v/ti:1,to>0?(1-v)/to:1);f=Math.pow(Math.max(0,f),0.55);const hw=w/2*Math.max(o.min??0.1,f)*(1+sw*Math.sin(Math.PI*v))*(1+0.16*(r()-0.5));
    const j=()=>(r()-0.5)*Math.min(0.5,w*0.14);L.push([P[i][0]-dy*hw+j(),P[i][1]+dx*hw+j()]);R.push([P[i][0]+dy*hw+j(),P[i][1]-dx*hw+j()]);}
  c.beginPath();L.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=N-1;i>=0;i--)c.lineTo(R[i][0],R[i][1]);c.closePath();c.fill();}
function arcPts(cx,cy,rx,ry,a0,a1,n=9){const out=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));out.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return out;}
const D2R=Math.PI/180;
// 胖胳膊（藕节）：中心线 + 粗细
function limb(ctrl,w0,w1,n=36){const P=curvePts(ctrl,n);const L=[],R=[];for(let i=0;i<P.length;i++){const v=i/(P.length-1);const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const w=lerp(w0,w1,v)*(1+0.07*Math.sin(v*Math.PI*3));L.push([P[i][0]-dy*w/2,P[i][1]+dx*w/2]);R.push([P[i][0]+dy*w/2,P[i][1]-dx*w/2]);}return{P,L,R};}
function polyFill(c,pts){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();}
// 构图（印面局部坐标，画心 ±170）
const HEAD8=[-6,-88],HRX=54,HRY=50;
const ARM8=[{c:[[-46,-30],[-64,-10],[-70,14],[-54,34],[-36,44]],w0:31,w1:21,hand:[-25,47],dir:1},{c:[[34,-30],[52,-10],[58,14],[42,34],[24,44]],w0:31,w1:21,hand:[13,47],dir:-1}];
const APRON8=[[-24,-37],[12,-37],[40,-8],[37,38],[-6,86],[-49,38],[-52,-8]];
function petalPts(cx,cy,ang,len,wid){const ca=Math.cos(ang),sa=Math.sin(ang);const P=(a,b)=>[cx+ca*a-sa*b,cy+sa*a+ca*b];return[P(0,0),P(len*0.3,wid*0.9),P(len*0.75,wid*0.7),P(len,0),P(len*0.75,-wid*0.7),P(len*0.3,-wid*0.9)];}
function scene8(c,part,blk){c.lineJoin='round';c.lineCap='round';const line=blk==='line';const F=()=>c.fill();
  const K=(ctrl,w,o)=>{if(line)kline(c,ctrl,w,o);};
  if(part==='back'){
    // 水：海水纹（一排排鱼鳞似的弧）
    if(blk==='green'){c.save();c.globalAlpha=0.42;c.fillRect(-170,138,340,32);c.restore();}
    for(let row=0;row<3;row++)for(let x=-176+(row%2)*11;x<=176;x+=22){const y=146+row*9;if(line)kline(c,arcPts(x,y,11,8,Math.PI,2*Math.PI,7),1.25,{ti:0.15,to:0.15,sw:0.4});}
    // 荷叶：大、扁、叶脉放射
    for(const [cx,cy,rx,ry,s] of [[-118,136,64,30,1],[124,132,60,28,-1]]){
      const edge=[];for(let i=0;i<=28;i++){const a=(-160+i/28*320)*D2R;const rr=1+0.07*Math.sin(i*2.3);edge.push([cx+Math.cos(a+Math.PI/2*0)*rx*rr*s,cy+Math.sin(a)*ry*rr]);}
      if(blk==='green'){c.save();c.globalAlpha=0.92;c.beginPath();c.moveTo(cx,cy);edge.forEach(q=>c.lineTo(q[0],q[1]));c.closePath();c.fill();c.restore();}
      if(line){kline(c,edge,2.2,{ti:0.04,to:0.04,sw:0.2,n:70});for(let k=0;k<9;k++){const a=(-140+k*35)*D2R;kline(c,[[cx,cy],[cx+Math.cos(a)*rx*0.5*s,cy+Math.sin(a)*ry*0.5],[cx+Math.cos(a)*rx*0.9*s,cy+Math.sin(a)*ry*0.9]],1.3,{ti:0.05,to:0.4});}}}
    // 荷茎
    for(const S of [[[126,-34],[138,20],[134,80],[126,118]],[[-140,0],[-130,50],[-124,96],[-120,122]]]){if(blk==='green'){c.lineWidth=5;c.beginPath();curvePts(S,30).forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();}
      if(line){kline(c,S.map(q=>[q[0]-2.8,q[1]]),1.2,{ti:0.05,to:0.05,sw:0.1});kline(c,S.map(q=>[q[0]+2.8,q[1]]),1.2,{ti:0.05,to:0.05,sw:0.1});}}
    // 荷花（右上）：瓣尖桃红，瓣根留白
    {const fx=126,fy=-40;const petals=[[-150,58,20],[-30,58,20],[-90,64,19],[-122,52,16],[-58,52,16],[-180,40,14],[0,40,14]];
     for(const [deg,len,wid] of petals){const pts=petalPts(fx,fy,deg*D2R,len,wid);
       if(blk==='pink'){const a=deg*D2R;const g=c.createLinearGradient(fx,fy,fx+Math.cos(a)*len,fy+Math.sin(a)*len);g.addColorStop(0,'rgba(0,0,0,0.05)');g.addColorStop(0.55,'rgba(0,0,0,0.55)');g.addColorStop(1,'rgba(0,0,0,1)');c.save();c.fillStyle=g;polyFill(c,curvePts(pts.concat([pts[0]]),40));c.restore();}
       if(line){kline(c,pts.concat([pts[0]]),1.7,{ti:0.08,to:0.08,sw:0.25,n:44});const a=deg*D2R;kline(c,[[fx+Math.cos(a)*len*0.25,fy+Math.sin(a)*len*0.25],[fx+Math.cos(a)*len*0.7,fy+Math.sin(a)*len*0.7]],0.9,{ti:0.3,to:0.5});}}
     c.beginPath();c.ellipse(fx,fy-10,11,6,0,0,7);if(blk==='yellow')F();if(line){kline(c,arcPts(fx,fy-10,11,6,0,2*Math.PI,14),1.4,{ti:0.03,to:0.03,sw:0.1});for(const [dx,dy] of [[-5,-1],[0,-2],[5,-1],[-2,2],[3,2]]){c.beginPath();c.arc(fx+dx,fy-10+dy,1.3,0,7);c.fill();}}}
    // 花苞（左）
    {const bx=-140,by=-14;const pts=[[bx,by+12],[bx-11,by-2],[bx-6,by-20],[bx,by-30],[bx+6,by-20],[bx+11,by-2],[bx,by+12]];
     if(blk==='pink'){const g=c.createLinearGradient(bx,by+12,bx,by-30);g.addColorStop(0,'rgba(0,0,0,0.1)');g.addColorStop(1,'rgba(0,0,0,1)');c.save();c.fillStyle=g;polyFill(c,curvePts(pts,30));c.restore();}
     if(line){kline(c,pts,1.7,{ti:0.06,to:0.06,sw:0.2,n:36});kline(c,[[bx,by+10],[bx-3,by-6],[bx,by-26]],1.0,{ti:0.2,to:0.4});}}
    // 娃娃：盘腿坐着，鱼下面只露出两只胖脚丫
    for(const [fx,fy,s] of [[-44,92,1],[32,92,-1]]){const rot=s*0.38;
      if(blk==='pink'||blk==='sil'){c.save();if(blk==='pink')c.globalAlpha=0.6;c.beginPath();c.ellipse(fx,fy,19,11,rot,0,7);c.fill();c.restore();}
      if(line){kline(c,arcPts(fx,fy,19,11,0,2*Math.PI,18).map(q=>{const dx=q[0]-fx,dy=q[1]-fy;return[fx+dx*Math.cos(rot)-dy*Math.sin(rot),fy+dx*Math.sin(rot)+dy*Math.cos(rot)];}),2.0,{ti:0.04,to:0.04,sw:0.15});
        for(let k=0;k<4;k++){const a=(s>0?168:12)+(k-1.5)*s*15;const tx=fx+Math.cos((a)*D2R+rot)*15,ty=fy+Math.sin((a)*D2R+rot)*9;kline(c,arcPts(tx,ty,3,2.4,0,2*Math.PI,8),0.9,{ti:0.1,to:0.1});}}
      c.save();c.translate(fx+s*14,fy-9);c.rotate(rot+s*0.9);c.beginPath();c.rect(-9,-3.2,18,6.4);if(blk==='yellow')c.fill();if(line){kline(c,[[-9,-3.2],[9,-3.2]],1.1,{ti:0.1,to:0.1});kline(c,[[-9,3.2],[9,3.2]],1.1,{ti:0.1,to:0.1});}c.restore();}
    // 身子
    if(blk==='pink'){c.save();c.globalAlpha=0.6;c.beginPath();c.moveTo(-62,-4);c.quadraticCurveTo(-62,-34,-30,-38);c.lineTo(18,-38);c.quadraticCurveTo(50,-34,50,-4);c.quadraticCurveTo(58,40,46,70);c.lineTo(-58,70);c.quadraticCurveTo(-70,40,-62,-4);c.closePath();c.fill();c.beginPath();c.ellipse(-6,74,52,15,0,0,7);c.fill();c.restore();}
    if(line)kline(c,arcPts(-6,74,52,15,10*D2R,170*D2R,14),2.0,{ti:0.08,to:0.08});
    // 肚兜：大红，黄边，绿里边
    {const ap=curvePts(APRON8.concat([APRON8[0]]),70);
     if(blk==='red')polyFill(c,ap);
     if(blk==='yellow'){c.lineWidth=7;c.beginPath();ap.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.stroke();}
     if(blk==='green'){c.lineWidth=2.2;c.beginPath();ap.forEach((q,i)=>{const x=-6+(q[0]+6)*0.86,y=22+(q[1]-22)*0.86;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.stroke();}
     if(line){kline(c,ap.map(q=>[q[0],q[1]]),2.2,{ti:0.02,to:0.02,sw:0.1,n:90});kline(c,ap.map(q=>[-6+(q[0]+6)*0.9,22+(q[1]-22)*0.9]),1.1,{ti:0.02,to:0.02,sw:0.1,n:90});}
     // 肚兜上的如意云头
     for(const sx of [-1,1]){const cx=-6+sx*20,cy=-22;if(blk==='yellow'){c.beginPath();c.arc(cx,cy,5,0,7);c.fill();}if(line)kline(c,arcPts(cx,cy,5,5,-0.3,5.8,10),1.0,{ti:0.1,to:0.1});}}
    // 长命锁 + 项圈
    {if(blk==='yellow'){c.lineWidth=3.2;c.beginPath();c.moveTo(-34,-40);c.quadraticCurveTo(-6,-14,22,-40);c.stroke();}
     if(line){kline(c,[[-34,-41],[-20,-30],[-6,-26],[8,-30],[22,-41]],1.0,{ti:0.05,to:0.05,sw:0.1});kline(c,[[-34,-37],[-20,-26],[-6,-22],[8,-26],[22,-37]],1.0,{ti:0.05,to:0.05,sw:0.1});}
     const lk=[[-22,-20],[10,-20],[14,-8],[6,2],[-18,2],[-26,-8]];if(blk==='yellow')polyFill(c,curvePts(lk.concat([lk[0]]),30));
     if(line){kline(c,lk.concat([lk[0]]),1.6,{ti:0.04,to:0.04,sw:0.1,n:36});c.save();c.font=`700 8.5px ${SERIF}`;c.textAlign='center';c.textBaseline='middle';c.fillText('长命',-6,-9);c.restore();}}
    // 头：耳朵、脸、头发
    for(const s of [-1,1]){const ex=HEAD8[0]+s*(HRX+2),ey=HEAD8[1]+2;if(blk==='pink'){c.save();c.globalAlpha=0.62;c.beginPath();c.ellipse(ex,ey,9,13,0,0,7);c.fill();c.restore();}
      if(line){kline(c,arcPts(ex,ey,9,13,s>0?-100*D2R:280*D2R,s>0?110*D2R:70*D2R,10),1.8,{ti:0.12,to:0.12});kline(c,arcPts(ex-s*1,ey+1,4,6,s>0?-80*D2R:260*D2R,s>0?80*D2R:100*D2R,7),1.0,{ti:0.2,to:0.2});}}
    if(blk==='pink'){c.save();c.globalAlpha=0.6;c.beginPath();c.ellipse(HEAD8[0],HEAD8[1],HRX,HRY,0,0,7);c.fill();c.restore();
      // 胭脂：手刷的晕
      for(const [cx,cy] of [[-37,-71],[25,-71]]){const g=c.createRadialGradient(cx,cy,1,cx,cy,15);g.addColorStop(0,'rgba(0,0,0,0.85)');g.addColorStop(0.6,'rgba(0,0,0,0.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.save();c.fillStyle=g;c.fillRect(cx-16,cy-16,32,32);c.restore();}}
    if(line){kline(c,arcPts(HEAD8[0],HEAD8[1],HRX,HRY,200*D2R,-20*D2R,24),2.6,{ti:0.06,to:0.06,sw:0.35,n:60});kline(c,arcPts(HEAD8[0],HEAD8[1],HRX,HRY,206*D2R,334*D2R,16),1.6,{ti:0.1,to:0.1,sw:0.1,n:40});
      // 下巴的肉褶
      kline(c,[[-24,-36],[-6,-32],[12,-36]],1.2,{ti:0.3,to:0.3});
      // 头发：脑门一撮桃子形，两边两小撮，拿红绳扎着
      c.beginPath();const tf=[[-6,-142],[-20,-134],[-22,-122],[-6,-110],[10,-122],[8,-134],[-6,-142]];polyFill(c,curvePts(tf,30));
      for(const s of [-1,1]){c.beginPath();c.ellipse(-6+s*40,-124,10,8,s*0.5,0,7);c.fill();}}
    if(blk==='paper'){}
    // 发丝（刻出来的白线）
    if(line){c.save();c.globalCompositeOperation='destination-out';for(const k of [-1,0,1]){kline(c,[[-6+k*5,-138],[-6+k*6,-126],[-6+k*3,-116]],0.9,{ti:0.3,to:0.3});}for(const s of [-1,1])kline(c,[[-6+s*34,-128],[-6+s*41,-123],[-6+s*47,-119]],0.8,{ti:0.3,to:0.3});c.restore();}
    for(const s of [-1,1]){const bx=-6+s*40,by=-113;if(blk==='red'){for(const d of [-1,1]){c.beginPath();c.ellipse(bx+d*6,by,6,3.5,d*0.4,0,7);c.fill();}c.beginPath();c.moveTo(bx-1,by);c.lineTo(bx-5,by+11);c.lineTo(bx+5,by+11);c.lineTo(bx+1,by);c.closePath();c.fill();}
      if(line){for(const d of [-1,1])kline(c,arcPts(bx+d*6,by,6,3.5,0,2*Math.PI,10),0.9,{ti:0.05,to:0.05});}}
    // 题签：连年有余
    c.beginPath();c.rect(-166,-166,34,124);if(blk==='yellow')F();if(blk==='red'){c.lineWidth=3;c.stroke();}
    if(line){c.save();c.font=`700 24px ${SERIF}`;c.textAlign='center';c.textBaseline='middle';[...'连年有余'].forEach((ch,i)=>c.fillText(ch,-149,-148+i*29.5));c.restore();
      kline(c,[[-166,-166],[-132,-166]],1.2,{ti:0,to:0});kline(c,[[-166,-42],[-132,-42]],1.2,{ti:0,to:0});kline(c,[[-166,-166],[-166,-42]],1.2,{ti:0,to:0});kline(c,[[-132,-166],[-132,-42]],1.2,{ti:0,to:0});}
    // 外框
    if(blk==='green'){c.save();c.globalAlpha=0.85;c.beginPath();c.rect(-175,-175,350,350);c.rect(-169,-169,338,338);c.fill('evenodd');c.restore();}
    if(line){c.lineWidth=3.6;c.strokeRect(-176,-176,352,352);c.lineWidth=1.5;c.strokeRect(-168.5,-168.5,337,337);}}
  else{ // 胳膊和手在鱼前面
    for(const A of ARM8){const lb=limb(A.c,A.w0,A.w1);const [hx,hy]=A.hand;
      if(blk==='pink'||blk==='sil'){c.save();if(blk==='pink')c.globalAlpha=0.62;polyFill(c,lb.L.concat(lb.R.slice().reverse()));c.beginPath();c.ellipse(hx,hy,13,11,0,0,7);c.fill();c.beginPath();c.arc(lb.P[0][0],lb.P[0][1],A.w0/2,0,7);c.fill();c.restore();}
      if(line)kline(c,arcPts(lb.P[0][0],lb.P[0][1],A.w0/2,A.w0/2,(A.dir>0?200:-20)*D2R,(A.dir>0?290:-110)*D2R,8),2.1,{ti:0.1,to:0.1});
      if(line){kline(c,lb.L,2.1,{ti:0.04,to:0.08,sw:0.15,n:50});kline(c,lb.R,2.1,{ti:0.04,to:0.08,sw:0.15,n:50});
        // 藕节：肘弯和腕上的肉褶
        for(const v of [0.42,0.47,0.8]){const i=Math.floor(v*(lb.P.length-1));const a=lb.L[i],b=lb.R[i],m=lb.P[i];kline(c,[[lerp(a[0],m[0],0.15),lerp(a[1],m[1],0.15)],[lerp(m[0],b[0],0.1)+(b[1]-a[1])*0.06,lerp(m[1],b[1],0.1)-(b[0]-a[0])*0.06],[lerp(m[0],b[0],0.5),lerp(m[1],b[1],0.5)]],1.0,{ti:0.3,to:0.3});}
        // 手：圆乎乎，四个指头搭在鱼身上
        kline(c,arcPts(hx,hy,13,11,A.dir>0?150*D2R:-150*D2R,A.dir>0?400*D2R:30*D2R,14),1.9,{ti:0.08,to:0.08});
        for(let k=0;k<3;k++){const yy=hy-5+k*5;kline(c,[[hx+A.dir*2,yy],[hx+A.dir*9,yy+1],[hx+A.dir*12,yy+2]],0.9,{ti:0.3,to:0.4});}}
      // 镯子
      {const i=Math.floor(0.86*(lb.P.length-1));const a=lb.L[i],b=lb.R[i];const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
       c.save();c.translate(m[0],m[1]);c.rotate(ang);c.beginPath();c.rect(-13,-3.6,26,7.2);if(blk==='yellow'||blk==='sil')F();if(line){kline(c,[[-13,-3.6],[13,-3.6]],1.2,{ti:0.08,to:0.08});kline(c,[[-13,3.6],[13,3.6]],1.2,{ti:0.08,to:0.08});}c.restore();}}}}
function prepNian(){KW=1.55;const keys=['yellow','red','green','pink','line'];
  for(const part of ['back','front'])for(const k of keys){const cv=mk(P8,P8);const x=cv.getContext('2d');x.setTransform(MS8,0,0,MS8,P8/2,P8/2);x.fillStyle='#000';x.strokeStyle='#000';scene8(x,part,k);
    // 木版的墨色：不匀、带木纹
    x.setTransform(1,0,0,1,0,0);const img=x.getImageData(0,0,P8,P8);const d=img.data;const n1=noise2(800+k.length*7,10,10),n2=noise2(810+k.length,6,140);const r=rng(820+k.length);
    for(let i=3;i<d.length;i+=4){if(!d[i])continue;const p=(i-3)/4,u=(p%P8)/P8,v=Math.floor(p/P8)/P8;const m=(k==='line'?0.06:0.14)+0.2*clamp((n1(u*10,v*10)-0.45)*1.6)+0.1*clamp((n2(u*6,v*140)-0.6)*3)+(r()<0.02?0.4*r():0);d[i]=d[i]*(1-clamp(m));}
    x.putImageData(img,0,0);B8[part+k]=cv;}
  const pc=mk(P8,P8);const px=pc.getContext('2d');const img=px.createImageData(P8,P8);const d=img.data;const n1=noise2(830,8,8),n2=noise2(831,200,200);const r=rng(832);
  for(let i=0;i<d.length;i+=4){const p=i/4,u=(p%P8)/P8,v=Math.floor(p/P8)/P8;const l=1+(n1(u*8,v*8)-0.5)*0.05+(n2(u*200,v*200)-0.5)*0.05+(r()-.5)*0.03;d[i]=clamp(240*l,0,255);d[i+1]=clamp(226*l,0,255);d[i+2]=clamp(196*l,0,255);d[i+3]=255;}
  px.putImageData(img,0,0);B8.paper=pc;
  {const cv=mk(P8,P8);const x=cv.getContext('2d');x.setTransform(MS8,0,0,MS8,P8/2,P8/2);x.fillStyle='#000';x.strokeStyle='#000';scene8(x,'front','sil');x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-in';x.drawImage(pc,0,0);B8.frontKO=cv;}
  KW=1;}
// ---------- 年画的鲤鱼 ----------
const PROF_NIAN=mkProf(0.19,0.17,0.5,0.6,0.26);
function nianFishParts(c,p,blk){const pr=PROF_NIAN,L=p.L,line=blk==='line';const k=L/200;c.lineJoin='round';c.lineCap='round';
  const Pp=(u,v)=>{const s=spineAt(p,u);return[s.x+s.nx*v*L,s.y+s.ny*v*L];};const e=edges(p,pr);
  // 尾：大而飘
  const tail=()=>{const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);c.beginPath();c.moveTo(bt[0],bt[1]);const a=Pp(0.9,0.12),b=Pp(1.02,0.26),m=Pp(0.95,0.0),d2=Pp(1.02,-0.26),e2=Pp(0.9,-0.12);
    c.quadraticCurveTo(a[0],a[1],b[0],b[1]);c.quadraticCurveTo(Pp(0.98,0.08)[0],Pp(0.98,0.08)[1],m[0],m[1]);c.quadraticCurveTo(Pp(0.98,-0.08)[0],Pp(0.98,-0.08)[1],d2[0],d2[1]);c.quadraticCurveTo(e2[0],e2[1],bb[0],bb[1]);c.closePath();};
  const dors=finPts(p,pr,0.26,0.6,0.085,1,1.0),pect=finPts(p,pr,0.26,0.36,0.09,-1,1.7),anal=finPts(p,pr,0.6,0.72,0.08,-1,1.4);
  if(blk==='yellow'){bodyFill(c,e);c.fill();tail();c.fill();for(const f of [dors,pect,anal]){finPath(c,f);c.fill();}}
  if(blk==='red'){c.save();bodyFill(c,e);c.clip();c.beginPath();e.top.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=e.M;i>=0;i--){const s=spineAt(p,i/e.M*0.8);const q=[s.x-s.nx*L*0.02,s.y-s.ny*L*0.02];c.lineTo(q[0],q[1]);}c.closePath();c.fill();c.restore();
    tail();c.fill();finPath(c,dors);c.fill();}
  if(blk==='pink'){c.save();bodyFill(c,e);c.clip();const g=bodyAt(p,pr,0.12,0);c.beginPath();c.arc(g[0],g[1],L*0.08,0,7);c.fill();c.restore();}
  if(line){KW=1.25;const kk=L/200;const KL=(pts,w,seed,o={})=>kline(c,pts,w*kk,{...o,seed});
    // 身体：背线、腹线（刀刻，两头出锋）
    KL(e.top,2.6,901,{ti:0.04,to:0.12,sw:0.25,n:60});KL(e.bot,2.6,902,{ti:0.04,to:0.12,sw:0.25,n:60});
    // 尾
    const bt=bodyAt(p,pr,0.8,1),bb=bodyAt(p,pr,0.8,-1);const ta=Pp(0.9,0.12),tb=Pp(1.02,0.26),tm=Pp(0.95,0.0),td=Pp(1.02,-0.26),te=Pp(0.9,-0.12);
    KL([bt,ta,tb],2.2,903,{ti:0.05,to:0.15});KL([tb,Pp(0.98,0.08),tm,Pp(0.98,-0.08),td],2.0,904,{ti:0.1,to:0.1});KL([td,te,bb],2.2,905,{ti:0.15,to:0.05});
    for(let j=-3;j<=3;j++){const a0=Pp(0.84,j*0.035),b0=Pp(1.0,j*0.08);KL([a0,[lerp(a0[0],b0[0],0.85),lerp(a0[1],b0[1],0.85)]],1.0,920+j,{ti:0.1,to:0.5});}
    // 鳍：外缘 + 鳍条
    for(const [f,sd] of [[dors,906],[pect,907],[anal,908]]){KL(f.out,2.0,sd,{ti:0.08,to:0.08,n:30});for(let i=3;i<f.base.length-1;i+=3)KL([f.base[i],[lerp(f.base[i][0],f.out[i][0],0.9),lerp(f.base[i][1],f.out[i][1],0.9)]],1.0,sd*10+i,{ti:0.1,to:0.5});}
    // 鳃
    KL([bodyAt(p,pr,0.2,0.92),bodyAt(p,pr,0.25,0),bodyAt(p,pr,0.2,-0.9)],2.0,930,{ti:0.15,to:0.15});
    // 鳞：一排排小弧
    let si=0;for(const v of [0.6,0.15,-0.3,-0.72])for(let u=0.3;u<0.78;u+=0.062){const q=bodyAt(p,pr,u+(Math.round(v*10)%2?0.031:0),v);const sa=spineAt(p,u);const ang=Math.atan2(-sa.ty,-sa.tx);const r0=0.034*L;
      KL(arcPts(q[0],q[1],r0,r0,ang-1.15,ang+1.15,7),1.3,940+si++,{ti:0.2,to:0.2});}
    // 眼
    const ey=bodyAt(p,pr,0.085,0.32);KL(arcPts(ey[0],ey[1],0.036*L,0.036*L,0,2*Math.PI,16),1.6,960,{ti:0.05,to:0.05,sw:0.1});c.beginPath();c.arc(ey[0],ey[1],0.018*L,0,7);c.fill();
    // 须
    const m0=bodyAt(p,pr,0.0,0.0),s0=spineAt(p,0.02);for(const sg of [1,-1]){const a1=[m0[0]+s0.tx*L*0.06+s0.nx*sg*L*0.04,m0[1]+s0.ty*L*0.06+s0.ny*sg*L*0.04],b1=[a1[0]-s0.tx*L*0.02+s0.nx*sg*L*0.07,a1[1]-s0.ty*L*0.02+s0.ny*sg*L*0.07];KL([m0,a1,b1],1.4,970+sg,{ti:0.1,to:0.5});}
    KW=1;}}
function drawNianFish(c,TR,p,t,ko){const cols={yellow:0,red:1,green:2,pink:3};
  if(ko){layerBegin(eb1,TR);eb1.beginPath();eb1.rect(S8X-PR8,S8Y-PR8,2*PR8,2*PR8);eb1.clip();eb1.fillStyle='#000';nianFishParts(eb1,p,'yellow');eb1.globalCompositeOperation='source-in';eb1.drawImage(B8.paper,S8X-PR8,S8Y-PR8,2*PR8,2*PR8);eb1.globalCompositeOperation='source-over';
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(EB1,0,0);ctx.restore();}
  for(const B of BLK){const k=b8k(t,cols[B.k]);if(k<=0||B.k==='green')continue;layerBegin(eb1,TR);eb1.translate(B.off[0],B.off[1]);eb1.fillStyle='#000';nianFishParts(eb1,p,B.k);layerColor(eb1,`rgb(${B.col})`);
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.92*k;ctx.globalCompositeOperation='multiply';ctx.drawImage(EB1,0,0);ctx.restore();}
  layerBegin(eb1,TR);eb1.fillStyle='#000';eb1.strokeStyle='#000';nianFishParts(eb1,p,'line');layerGrain(eb1,TR,0.12);layerColor(eb1,'rgb(28,22,20)');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.95;ctx.drawImage(EB1,0,0);ctx.restore();}
function drawPrint8(part,t){const cols={yellow:0,red:1,green:2,pink:3};const x0=S8X-PR8,y0=S8Y-PR8,w=2*PR8;
  if(part==='front')ctx.drawImage(B8.frontKO,x0,y0,w,w);
  for(const B of BLK){const k=b8k(t,cols[B.k]);if(k<=0)continue;const tmp=B8['tmp'+part+B.k]||(B8['tmp'+part+B.k]=(()=>{const cv=mk(P8,P8);const x=cv.getContext('2d');x.drawImage(B8[part+B.k],0,0);x.globalCompositeOperation='source-in';x.fillStyle=`rgb(${B.col})`;x.fillRect(0,0,P8,P8);return cv;})());
    ctx.save();ctx.globalAlpha=0.9*k;ctx.globalCompositeOperation='multiply';ctx.drawImage(tmp,x0+B.off[0],y0+B.off[1],w,w);ctx.restore();}
  const ln=B8['tmpline'+part]||(B8['tmpline'+part]=(()=>{const cv=mk(P8,P8);const x=cv.getContext('2d');x.drawImage(B8[part+'line'],0,0);x.globalCompositeOperation='source-in';x.fillStyle='rgb(28,22,20)';x.fillRect(0,0,P8,P8);return cv;})());
  ctx.save();ctx.globalAlpha=0.95;ctx.drawImage(ln,x0,y0,w,w);ctx.restore();}
// 娃娃的开脸（杨柳青那种）：柳叶眉、丹凤眼、小鼻头、樱桃嘴；先看着怀里的鱼，鱼一溜，眉毛一挑、眼睛瞪圆、嘴张成个 o
function face8(t,TR){const s=smooth(T8SLIP,T8SLIP+0.25,t);const look=smooth(101.8,103.2,t)*(1-s);
  layerBegin(eb1,TR);eb1.translate(S8X,S8Y);eb1.fillStyle='#000';KW=1.3;const K=(ctrl,w,o)=>kline(eb1,ctrl,w,o);
  for(const dir of [-1,1]){const ex=dir<0?-28:16,ey=-87;
    const up0=[[ex-dir*9,ey+1],[ex-dir*2,ey-3.8],[ex+dir*6,ey-3.2],[ex+dir*11,ey-1.2]],up1=[[ex-dir*8,ey],[ex-dir*2,ey-6.8],[ex+dir*5,ey-6.2],[ex+dir*9,ey-0.6]];
    const lo0=[[ex-dir*8,ey+1.4],[ex,ey+3.6],[ex+dir*8.5,ey+0.8]],lo1=[[ex-dir*7.5,ey+1],[ex,ey+5.4],[ex+dir*8,ey]];
    const mix=(A,B)=>A.map((q,i)=>[lerp(q[0],B[i][0],s),lerp(q[1],B[i][1],s)]);
    K(mix(up0,up1),2.7,{ti:0.15,to:0.3,sw:0.35,seed:31+dir});K(mix(lo0,lo1),1.0,{ti:0.25,to:0.3,seed:41+dir});
    // 眼珠
    const px=ex-1.8*look+dir*0.4*(1-s),py=ey-0.4+1.1*look;eb1.beginPath();eb1.arc(px,py,lerp(3.5,2.7,s),0,7);eb1.fill();
    // 眉毛
    const br0=[[ex-dir*8,ey-12],[ex,ey-15.4],[ex+dir*9.5,ey-12.6]],br1=[[ex-dir*8,ey-18],[ex,ey-23],[ex+dir*9.5,ey-19]];K(mix(br0,br1),2.3,{ti:0.25,to:0.45,sw:0.3,seed:51+dir});}
  // 鼻头
  K([[-8,-80],[-5,-74.5],[-8.5,-72.5]],1.5,{ti:0.25,to:0.35,seed:61});
  // 嘴的墨线
  if(s<0.5)K([[-11.5,-61.6],[-6,-60.8],[-0.5,-61.6]],1.05,{ti:0.25,to:0.25,seed:71});else K(arcPts(-6,-59,4.6,5.6,0,2*Math.PI,14),1.0,{ti:0.04,to:0.04,seed:72});
  KW=1;layerGrain(eb1,TR,0.14);layerColor(eb1,'rgb(28,22,20)');blitLayer(EB1,0.95);
  // 嘴的红（红版压下去以后才有）
  const rk=b8k(t,1);if(rk>0){layerBegin(eb1,TR);eb1.translate(S8X+BLK[1].off[0],S8Y+BLK[1].off[1]);eb1.fillStyle='#000';
    if(s<0.5){eb1.beginPath();eb1.moveTo(-12,-61.5);eb1.quadraticCurveTo(-10,-65.2,-7.6,-64.2);eb1.quadraticCurveTo(-6,-63.4,-4.4,-64.2);eb1.quadraticCurveTo(-2,-65.2,0,-61.5);eb1.quadraticCurveTo(-6,-55.5,-12,-61.5);eb1.fill();}
    else{eb1.beginPath();eb1.ellipse(-6,-59,4.6,5.6,0,0,7);eb1.fill();}
    layerGrain(eb1,TR,0.12);layerColor(eb1,`rgb(${BLK[1].col})`);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.92*rk;ctx.globalCompositeOperation='multiply';ctx.drawImage(EB1,0,0);ctx.restore();
    if(s>=0.5){layerBegin(eb1,TR);eb1.translate(S8X,S8Y);eb1.fillStyle='#000';eb1.beginPath();eb1.ellipse(-6,-58.4,2.4,3.4,0,0,7);eb1.fill();layerColor(eb1,'rgb(90,24,22)');blitLayer(EB1,0.85*rk);}}}
const T8OWN=[101.35,107.25];
function drawS8Panel(t,cam,TR){const x0=S8X-S8W/2,y0=S8Y-S8W/2;panelShadow(x0,y0,S8W,S8W);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S8W,S8W);ctx.clip();ctx.drawImage(LINEN,0,0,840,840,x0,y0,S8W,S8W);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(150,42,36)';ctx.fillRect(x0,y0,S8W,S8W);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.shadowColor='rgba(30,10,8,0.45)';ctx.shadowBlur=14*cam.z;ctx.shadowOffsetY=5*cam.z;ctx.drawImage(B8.paper,S8X-PR8-8,S8Y-PR8-8,2*PR8+16,2*PR8+16);ctx.restore();
  drawPrint8('back',t);face8(t,TR);ctx.setTransform(...TR);ctx.restore();
  if(t>=T8OWN[0]&&t<=T8OWN[1]){ctx.setTransform(...TR);const p=heroPoseNow(t);splitStyle(t,cam,TR,p,null,MEDIA.s8.path,MEDIA.s8.tIn,MEDIA.s8.prev,(t,cam,TR,p)=>drawNianFish(ctx,TR,p,t,true));}
  ctx.setTransform(...TR);ctx.save();ctx.beginPath();ctx.rect(x0,y0,S8W,S8W);ctx.clip();drawPrint8('front',t);ctx.restore();
  const sh=t-T8SLIP;ctx.strokeStyle='rgba(60,20,16,0.4)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S8W,S8W);}
function styleNian(t,cam,TR,p,clip){if(clip){ctx.save();ctx.beginPath();ctx.rect(...clip);ctx.clip();}drawNianFish(ctx,TR,p,t);if(clip)ctx.restore();}

// ---------------- 捌 的登记 ----------------
STN.push({key:'s8',cx:S8X,hw:S8W/2,x0:-4980,x1:-4400,draw:drawS8Panel,owns:t=>t>=T8OWN[0]&&t<=T8OWN[1],drawHero:()=>{},style:styleNian,prep:prepNian});
LABELS.push([S8X,S8W,S8W,'捌','连年有余','清 · 木版年画']);
LIGHTS.push({x:S8X,y:-10,r:600,k:t=>smooth(98.8,100.8,t)});
GK.push([101.0,-4490,10],[101.5,-4525,30],[102.0,-4582,40],[102.6,-4682,42],[103.0,-4745,40],[103.35,-4774,38.6],[103.7,-4782,38.3],[104.4,-4784,38.1],[105.1,-4785.5,38.0],[105.55,-4786.5,37.9],
  [105.75,-4800,28],[105.95,-4822,6],[106.2,-4858,-22],[106.5,-4905,-40],[106.9,-4960,-42],[107.4,-5030,-34],[108.0,-5100,-22]);
HL.push([101.2,150],[102.6,200],[107.4,200],[108.8,140]);
HAMP.push(t=>(1-0.92*smooth(103.5,103.8,t)*(1-smooth(105.1,105.25,t)))*(1+1.6*smooth(105.15,105.3,t)*(1-smooth(105.7,106.3,t))));
HFB.push(t=>3.0*smooth(105.15,105.3,t)*(1-smooth(105.8,106.4,t)));
for(const tc of T8C)SHAKES.push([tc,2.5]);
CK.push({t:101.2,x:S8X+60,y:0,z:1.55,f:0.4,ox:-40},{t:102.5,x:S8X+4,y:6,z:2.05},{t:105.5,x:S8X-4,y:4,z:2.15},{t:106.6,x:S8X-70,y:-20,z:1.6,f:0.4,ox:-60},{t:107.8,z:1.2,f:1,ox:-150,oy:-10});
