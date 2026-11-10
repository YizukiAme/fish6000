// ---------------- 印章：开元小篆字形 → 白文 / 朱文 ----------------
// chars 按印文读法排列：从右列起，自上而下
function sealGlyphPath(ch,x,y,w,h,squash){const g=GLYPH[ch];const [x0,y0,x1,y1]=g.bb;const gw=x1-x0,gh=y1-y0;
  let sx=w/gw,sy=h/gh;const lim=squash||1.55;if(sx/sy>lim)sx=sy*lim;if(sy/sx>lim)sy=sx*lim;
  const ox=x+(w-gw*sx)/2-x0*sx,oy=y+(h-gh*sy)/2-y0*sy;
  const p=new Path2D();p.addPath(new Path2D(g.d),new DOMMatrix([sx,0,0,sy,ox,oy]));return p;}
function rough(x,r,pts,amp){x.beginPath();pts.forEach((q,i)=>{const a=(r()-.5)*amp,b=(r()-.5)*amp;i?x.lineTo(q[0]+a,q[1]+b):x.moveTo(q[0]+a,q[1]+b);});x.closePath();}
function rectPts(x0,y0,w,h,n,cr){const pts=[];const side=(ax,ay,bx,by)=>{for(let i=0;i<n;i++){const v=i/n;pts.push([lerp(ax,bx,v),lerp(ay,by,v)]);}};
  side(x0+cr,y0,x0+w-cr,y0);side(x0+w,y0+cr,x0+w,y0+h-cr);side(x0+w-cr,y0+h,x0+cr,y0+h);side(x0,y0+h-cr,x0,y0+cr);return pts;}
function mkSeal(o){const r=rng(o.seed||1);const S=o.size||420;const asp=o.aspect||1;const Wd=S,Hd=Math.round(S*asp);const pad=Math.round(S*0.05);
  const c=mk(Wd+2*pad,Hd+2*pad);const x=c.getContext('2d');x.translate(pad,pad);const ink=o.ink||[178,44,34];const col=`rgb(${ink[0]},${ink[1]},${ink[2]})`;
  const cols=o.cols||2,rows=o.rows||2;const bai=o.type!=='zhu';
  const m=bai?S*0.075:S*0.085;const gap=S*(bai?0.035:0.03);const cw=(Wd-2*m-(cols-1)*gap)/cols,chh=(Hd-2*m-(rows-1)*gap)/rows;
  x.lineJoin='round';x.lineCap='round';
  if(bai){x.fillStyle=col;rough(x,r,rectPts(0,0,Wd,Hd,14,S*0.02),S*0.012);x.fill();
    x.globalCompositeOperation='destination-out';x.fillStyle='#000';x.strokeStyle='#000';x.lineWidth=S*(o.sw||0.026);
    o.chars.forEach((ch,i)=>{const ci=Math.floor(i/rows),ri=i%rows;const cx=Wd-m-(ci+1)*cw-ci*gap,cy=m+ri*(chh+gap);const p=sealGlyphPath(ch,cx,cy,cw,chh,o.squash);x.fill(p);x.stroke(p);});}
  else{x.fillStyle=col;const b=S*(o.bw||0.055);const out=rectPts(0,0,Wd,Hd,14,S*0.03),inn=rectPts(b,b,Wd-2*b,Hd-2*b,14,S*0.02);
    x.beginPath();out.forEach((q,i)=>{const a=(r()-.5)*S*0.01;i?x.lineTo(q[0]+a,q[1]+a):x.moveTo(q[0]+a,q[1]+a);});x.closePath();
    inn.reverse().forEach((q,i)=>{const a=(r()-.5)*S*0.008;i?x.lineTo(q[0]+a,q[1]-a):x.moveTo(q[0]+a,q[1]-a);});x.closePath();x.fill();
    x.strokeStyle=col;x.lineWidth=S*(o.sw||0.016);
    o.chars.forEach((ch,i)=>{const ci=Math.floor(i/rows),ri=i%rows;const cx=Wd-m-(ci+1)*cw-ci*gap,cy=m+ri*(chh+gap);const p=sealGlyphPath(ch,cx,cy,cw,chh,o.squash);x.fill(p);x.stroke(p);});}
  // 钤印的质感：纸纹吃不进的白点、印泥不匀、边角的残
  x.globalCompositeOperation='destination-out';const n=noise2((o.seed||1)*7+3,9,9);
  const img=x.getImageData(0,0,c.width,c.height);const d=img.data;const W2=c.width,H2=c.height;
  for(let yy=0;yy<H2;yy++)for(let xx=0;xx<W2;xx++){const i=(yy*W2+xx)*4+3;if(!d[i])continue;const u=xx/W2,v=yy/H2;
    const e=Math.min(u,v,1-u,1-v);let k=0.10+0.30*clamp(n(u*9,v*9)*1.6-0.55)+0.22*clamp(1-e*14);if(r()<0.06+0.2*clamp(1-e*12))k+=0.25+r()*0.6;d[i]=d[i]*(1-clamp(k*(o.dry||1)*r()*1.6));}
  x.putImageData(img,0,0);
  for(let i=0;i<(o.chips||5);i++){const side=Math.floor(r()*4);const v=r();const px=side===0?v*Wd:side===1?Wd:side===2?v*Wd:0,py=side===0?0:side===1?v*Hd:side===2?Hd:v*Hd;
    blob(x,px,py,S*(0.012+r()*0.03),Math.floor(r()*1e6));x.fill();}
  x.globalCompositeOperation='source-over';
  const out=mk(c.width,c.height);const ox=out.getContext('2d');ox.filter=`blur(${(S/420*0.7).toFixed(2)}px)`;ox.drawImage(c,0,0);return out;}
function stampSeal(c,seal,x,y,w,al,rot){c.save();c.translate(x,y);c.rotate(rot||0);c.globalCompositeOperation='multiply';c.globalAlpha=al;const h=w*seal.height/seal.width;c.drawImage(seal,-w/2,-h/2,w,h);c.restore();}
