// ================= 渲染 =================
const T_END=T_FIN+4.0+D5+DE;     // 真实时长：原来的时间线 + 磁州窑停下来画鱼的 D5 秒 + 前面两处停顿的 DE 秒
AMBIENT=t=>0.04+0.17*smooth(1.6,6.5,t)+0.07*smooth(6.5,9.5,t)+0.1*smooth(TG0,TG1-0.5,t);
CK.sort((a,b)=>a.t-b.t);CK.push({...CK[CK.length-1],t:999});
function camera(t){let i=0;while(i<CK.length-2&&t>CK[i+1].t)i++;const a=CK[i],b=CK[i+1];const p=eio((t-a.t)/(b.t-a.t));
  const need=(a.f||0)>0||(b.f||0)>0||a.x===undefined||b.x===undefined;const h=need?camFollow(t):null;
  const ax=a.x!==undefined?a.x:h[0]+(a.ox||0),ay=a.y!==undefined?a.y:h[1]+(a.oy||0),bx=b.x!==undefined?b.x:h[0]+(b.ox||0),by=b.y!==undefined?b.y:h[1]+(b.oy||0);
  let x=lerp(ax,bx,p),y=lerp(ay,by,p);const f=lerp(a.f||0,b.f||0,p);
  if(f>0){x=lerp(x,h[0]+lerp(a.ox||0,b.ox||0,p),f);y=lerp(y,h[1]+lerp(a.oy||0,b.oy||0,p),f);}
  const e={};for(const k of new Set([...Object.keys(a.e||{}),...Object.keys(b.e||{})]))e[k]=lerp((a.e||{})[k]||0,(b.e||{})[k]||0,p);
  for(const [t0,amp] of SHAKES){const d=t-t0;if(d>0&&d<0.4){const k=amp*Math.exp(-d*12);x+=k*Math.sin(d*90)/2;y+=k*Math.cos(d*77)/2;}}
  let zz=a.z*Math.pow(b.z/a.z,p);for(const f of CAMHOOK){const d=f(TNOW,TREAL);x+=d[0];y+=d[1];zz*=d[2];}
  return{x,y,z:zz,e};}
function finishFX(t){const g=ctx.createRadialGradient(W/2,H/2,H*0.42,W/2,H/2,H*1.05);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.3)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=0.09;ctx.drawImage(GRAINS[Math.floor(TREAL*30)%4],0,0,W,H);ctx.restore();
  const fa=smooth(T_END-0.5,T_END,TREAL);if(fa>0.001){ctx.fillStyle=`rgba(0,0,0,${clamp(fa)})`;ctx.fillRect(0,0,W,H);}}
function render(tReal){TREAL=tReal;TNOW=WE(tReal);const t=W5(TNOW);   // 全片按原来的时间画；只有磁州窑那一站另看真实的钟
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.globalCompositeOperation='source-over';
  ctx.imageSmoothingQuality='high';   // 预渲染的画布缩小画到远景、终章展墙时不起锯齿和颗粒（实测不变慢）
  const cam=camera(t),z=cam.z;const TR=[z,0,0,z,W/2-cam.x*z,H/2-cam.y*z];
  LABEL_FADE=1-smooth(T11BACK[0]+0.2,T11BACK[0]+0.9,t);ctx.setTransform(...TR);drawWall(cam);drawLabels(cam);
  const half=W/2/z;const offs={};for(const s of STN)offs[s.key]=panelOff(s.key,t);
  const vis=STN.filter(s=>Math.abs(s.cx+offs[s.key][0]-cam.x)<half+(s.hw||300)+60);
  vis.sort((a,b)=>(cam.e[a.key]||0)-(cam.e[b.key]||0));
  for(const s of vis){const o=offs[s.key];if(o[0]||o[1]){const cs={...cam,x:cam.x-o[0],y:cam.y-o[1]};const TRs=[z,0,0,z,W/2-cs.x*z,H/2-cs.y*z];ctx.setTransform(...TRs);s.draw(t,cs,TRs);}else{ctx.setTransform(...TR);s.draw(t,cam,TR);}}
  ctx.setTransform(...TR);const p=heroPoseNow(t);const own=STN.find(s=>s.owns&&s.owns(t));
  if(own)own.drawHero(t,cam,TR,p);else drawHeroWall(t,cam,TR,p);
  for(const s of vis)if(s.post){ctx.setTransform(1,0,0,1,0,0);s.post(t,cam,TR);}
  applyLights(t,TR);
  for(const s of STN)if(s.postLight){ctx.setTransform(1,0,0,1,0,0);s.postLight(t,cam,TR);}   // 不看这一站的展板在不在画面里：主角可能已经游到别处了
  ctx.setTransform(1,0,0,1,0,0);textLines(t);finishFX(t);drawFinale(t);}
window.render=render;
window.prepare=async()=>{if(typeof FONTS_READY!=='undefined')await FONTS_READY;for(const f of ['400 15px','600 24px','500 34px','400 30px','600 52px','400 17px','700 25px','600 46px','400 20px'])await document.fonts.load(`${f} "Noto Serif CJK SC"`);await document.fonts.load('500 10.5px "DejaVu Sans Mono"');for(const s of STN)if(s.prep)s.prep();render(0);};
