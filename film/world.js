// ================= 展墙：各站登记的公共表 =================
const P=600;
const STN=[];      // 各站：{key,cx,x0,x1,draw,owns,drawHero,style,e}
const CK=[];       // 镜头关键帧 {t,x,y,z,e:{key:val},f,ox,oy}
const GK=[];       // 主角路线关键点 [t,x,y]（壹之后）
const HL=[[0,140]];// 主角身长关键帧 [t,L]
const HAMP=[],HFB=[],HOFF=[],HSTIFF=[];// 摆动幅度乘子、尾频加成：函数 t=>值
const LIGHTS=[],LABELS=[],LINES=[],SHAKES=[],WINKS=[11.0];
function panelShadow(x,y,w,h,k=1){ctx.save();ctx.shadowColor=`rgba(40,30,20,${0.35*k})`;ctx.shadowBlur=30;ctx.shadowOffsetY=12;ctx.fillStyle='#000';ctx.fillRect(x,y,w,h);ctx.restore();}
function drawWall(cam){const z=cam.z;const x0=cam.x-W/2/z-10,y0=cam.y-H/2/z-10,w=W/z+20,h=H/z+20;
  ctx.fillStyle='#e6e0d5';ctx.fillRect(x0,y0,w,h);ctx.fillStyle=WALLPAT;ctx.fillRect(x0,y0,w,h);
  const g=ctx.createLinearGradient(0,-900,0,900);g.addColorStop(0,'rgba(50,40,30,0.18)');g.addColorStop(0.35,'rgba(50,40,30,0)');g.addColorStop(0.7,'rgba(50,40,30,0)');g.addColorStop(1,'rgba(50,40,30,0.2)');ctx.fillStyle=g;ctx.fillRect(x0,y0,w,h);}
function drawLabels(cam){const xl=cam.x-W/2/cam.z-400,xr=cam.x+W/2/cam.z+50;for(const [cx,pw,ph,num,ti,su] of LABELS){const x=cx-pw/2,y=ph/2+38;if(x>xr||x<xl)continue;
  const m=ctx.getTransform(),sb=m.d*(y+54)+m.f,la=(1-smooth(H-70,H-8,sb))*LABEL_FADE;if(la<=0.003)continue;
  ctx.save();ctx.globalAlpha=la;ctx.fillStyle='#a3392c';ctx.font=`500 34px ${SERIF}`;ctx.fillText(num,x,y+30);const nw=ctx.measureText(num).width+16;
  ctx.letterSpacing='3px';ctx.fillStyle='#2a241e';ctx.font=`600 24px ${SERIF}`;ctx.fillText(ti,x+nw,y+22);
  ctx.letterSpacing='2px';ctx.fillStyle='#857a6b';ctx.font=`400 15px ${SERIF}`;ctx.fillText(su,x+nw+1,y+47);ctx.restore();}}
// 灯：先把画面按“全亮”画好，再乘一张灯光图
const LIGHTC=mk(W,H),lctx=LIGHTC.getContext('2d');
let AMBIENT=t=>0.28;
// 片尾整面墙：各盏射灯慢慢合成一条连续的洗墙光带
const WASHC=mk(W,H),wctx=WASHC.getContext('2d');
let WASH=null,FISHL=null,LABEL_FADE=1;
const FLC=mk(W,H),flx=FLC.getContext('2d');
function washBand(k,TR){const {y0,h0,h1,x0,x1,fx}=WASH;wctx.reset();wctx.setTransform(...TR);const N=18;
  const g=wctx.createLinearGradient(0,y0-h1,0,y0+h1);for(let i=0;i<=N;i++){const d=Math.abs(-h1+2*h1*i/N);const f=d<=h0?1:0.5*(1+Math.cos(Math.PI*(d-h0)/(h1-h0)));g.addColorStop(i/N,`rgba(255,249,238,${(f*k).toFixed(4)})`);}
  wctx.fillStyle=g;wctx.fillRect(x0-fx,y0-h1,x1-x0+2*fx,2*h1);
  wctx.globalCompositeOperation='destination-in';const tot=x1-x0+2*fx;const gh=wctx.createLinearGradient(x0-fx,0,x1+fx,0);
  for(let i=0;i<=N;i++){const xx=(x0-fx)+tot*i/N;const d=xx<x0?x0-xx:(xx>x1?xx-x1:0);const f=d<=0?1:0.5*(1+Math.cos(Math.PI*Math.min(1,d/fx)));gh.addColorStop(i/N,`rgba(0,0,0,${f.toFixed(4)})`);}
  wctx.fillStyle=gh;wctx.fillRect(x0-fx,y0-h1,tot,2*h1);wctx.globalCompositeOperation='source-over';
  lctx.save();lctx.setTransform(1,0,0,1,0,0);lctx.globalCompositeOperation='lighter';lctx.drawImage(WASHC,0,0);lctx.restore();}
function applyLights(t,TR){const a=AMBIENT(t);lctx.setTransform(1,0,0,1,0,0);lctx.globalCompositeOperation='source-over';lctx.fillStyle=`rgb(${a*255|0},${a*248|0},${a*236|0})`;lctx.fillRect(0,0,W,H);
  lctx.globalCompositeOperation='lighter';lctx.setTransform(...TR);const wk=WASH?WASH.k(t):0,sk=WASH&&WASH.spot?WASH.spot(t):1-wk;
  for(const L of LIGHTS){const k=L.k(t)*sk;if(k<=0.001)continue;lctx.save();lctx.translate(L.x,L.y-L.r*0.06);lctx.scale(1,1.18);lctx.translate(-L.x,-L.y);const g=lctx.createRadialGradient(L.x,L.y,0,L.x,L.y,L.r);
    for(const [o,f] of [[0,1],[0.3,0.9],[0.5,0.68],[0.65,0.44],[0.8,0.2],[0.9,0.07],[1,0]])g.addColorStop(o,`rgba(255,249,238,${f*k})`);lctx.fillStyle=g;lctx.fillRect(L.x-L.r,L.y-L.r,2*L.r,2*L.r);lctx.restore();}
  if(wk>0.001)washBand(0.32*wk,TR);
  if(FISHL){const fk=FISHL.k(t);if(fk>0.001){flx.reset();flx.setTransform(...TR);flx.filter=`blur(${(46*TR[0]).toFixed(1)}px)`;flx.fillStyle='rgb(255,248,236)';FISHL.path(flx,t);
    // 鱼身、背鳍、腹鳍先拼成不透明的一整块，再整体调亮度：鳍和身子叠住的那一溜不会更亮
    flx.filter='none';flx.setTransform(1,0,0,1,0,0);flx.globalCompositeOperation='destination-in';flx.fillStyle=`rgba(0,0,0,${fk.toFixed(4)})`;flx.fillRect(0,0,W,H);flx.globalCompositeOperation='source-over';flx.setTransform(...TR);
    const [ex,ey,er]=FISHL.eye(t);flx.filter=`blur(${(26*TR[0]).toFixed(1)}px)`;flx.globalCompositeOperation='destination-out';flx.fillStyle='rgba(0,0,0,0.92)';flx.beginPath();flx.arc(ex,ey,er,0,7);flx.fill();
    if(FISHL.extra){flx.globalCompositeOperation='source-over';flx.filter=`blur(${(70*TR[0]).toFixed(1)}px)`;FISHL.extra(flx,t);}
    lctx.save();lctx.setTransform(1,0,0,1,0,0);lctx.globalCompositeOperation='lighter';lctx.drawImage(FLC,0,0);lctx.restore();}}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.drawImage(LIGHTC,0,0);ctx.restore();}
// 镜头：关键帧之间缓入缓出；f>0 时跟拍主角
function trackPos(def,t,back){const tr=def.tr;const fk=(t-tr.T0)/tr.dt;const k=clamp(Math.floor(fk),0,tr.n-2);const a=fk-k;const s=lerp(tr.S[k],tr.S[k+1],a);return posAtS(tr,s-back*def.L(t));}
function camFollow(t){let x=0,y=0;const n=7;for(let i=0;i<n;i++){const q=trackPos(HERO,t-0.35+0.7*i/(n-1),0.45);x+=q[0];y+=q[1];}return[x/n,y/n];}
// 字幕：竖排、从右往左，安安静静地淡入淡出，不加底、不加粗；比最初的版本略大一点
function textLines(t){for(const L of LINES){const [a0,a1,s,x0,y0,col]=L;const al=smooth(a0,a0+0.6,t)*(1-smooth(a1-0.6,a1,t));if(al<=0)continue;
  const x=x0||1668,y=y0||330,FS=33,DX=61,DY=50,OY=33;
  ctx.save();ctx.font=`400 ${FS}px ${SERIF}`;ctx.textAlign='center';
  ctx.fillStyle=col?col.replace('A',(0.86*al).toFixed(3)):`rgba(44,34,22,${(0.84*al).toFixed(3)})`;
  s.forEach((c,ci)=>[...c].forEach((ch,i)=>ctx.fillText(ch,x-ci*DX,y+ci*OY+i*DY)));ctx.restore();}}
// 关键帧插值（平滑台阶）
function keyed(K,t){if(t<=K[0][0])return K[0][1];for(let i=0;i<K.length-1;i++){if(t<=K[i+1][0]){const p=smooth(K[i][0],K[i+1][0],t);return lerp(K[i][1],K[i+1][1],p);}}return K[K.length-1][1];}
// 屏幕层工具
const HEROC=mk(W,H),hctx=HEROC.getContext('2d');
function layerBegin(x,TR){x.reset();x.setTransform(...TR);}
function layerColor(x,col){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';}
function layerGrain(x,TR,k,pat){x.setTransform(...TR);x.globalCompositeOperation='destination-out';x.globalAlpha=k;x.fillStyle=pat||INKGRAIN;x.fillRect(-20000,-3000,40000,6000);x.globalAlpha=1;x.globalCompositeOperation='source-over';}
function splitStyle(t,cam,TR,p,clip,inPath,tIn,prev,cur){if(t>=tIn){if(cur)cur(t,cam,TR,p,clip);return;}
  ctx.save();ctx.setTransform(...TR);if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.beginPath();ctx.rect(-1e5,-1e4,2e5,2e4);inPath(ctx);ctx.clip('evenodd');prev(t,cam,TR,p,null);ctx.restore();
  if(cur){ctx.save();ctx.setTransform(...TR);if(clip){ctx.beginPath();ctx.rect(...clip);ctx.clip();}ctx.beginPath();inPath(ctx);ctx.clip();cur(t,cam,TR,p,null);ctx.restore();}}
function blitLayer(src,al,comp,filter){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=al;if(comp)ctx.globalCompositeOperation=comp;if(filter)ctx.filter=filter;ctx.drawImage(src,0,0);ctx.restore();}
