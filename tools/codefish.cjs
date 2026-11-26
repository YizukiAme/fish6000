// Optional views of the existing pose. The default is byte-identical to the input scene.
module.exports = function codeFishView(source, mode='original') {
  if(mode==='original') return source;
  if(!['spine','sections'].includes(mode)) throw Error('Unknown code-fish view: '+mode);
  const a=source.indexOf('function styleCode(t,cam,TR,p,clip,o)'),b=source.indexOf('const SKINS11=',a);
  if(a<0||b<0)throw Error('Missing code-fish rendering function');
  let view=source.slice(a,b);
  const replaceOnce=(needle,replacement)=>{
    if(view.split(needle).length!==2)throw Error('Expected a unique code-fish render fragment: '+needle.slice(0,64));
    view=view.replace(needle,replacement);
  };
  const weightPass="pass('rgba(0,0,0,0.55)',3.2);pass('rgba(127,219,202,0.85)',1.2);";
  const midStart=view.indexOf("  ctx.strokeStyle='rgba(255,203,107,0.95)';");
  const midEnd=view.indexOf('  const ey=bodyAt',midStart);
  if(midStart<0||midEnd<0)throw Error('Missing spine and normal layers');
  const strokes=view.slice(midStart,midEnd);
  if(mode==='spine'){
    replaceOnce(weightPass,"pass('rgba(0,0,0,0.45)',2.8);pass('rgba(127,219,202,0.58)',1.05);");
    replaceOnce(strokes,`  // Render every point returned by fishPose, with its actual world coordinates.
  ctx.strokeStyle='rgba(255,208,120,0.97)';ctx.lineWidth=2.15*lw;
  ctx.beginPath();p.sp.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
  for(let i=0;i<=p.N;i++){
    const q=p.sp[i],major=i%8===0;
    ctx.beginPath();ctx.arc(q.x,q.y,(major?3.15:i%2===0?1.85:1.30)*lw,0,2*Math.PI);
    ctx.fillStyle=major?'#ffe2a7':'#f3bb72';ctx.fill();
  }
  ctx.strokeStyle='rgba(130,170,255,0.42)';ctx.lineWidth=0.9*lw;
  for(let i=0;i<=p.N;i+=4){const q=p.sp[i];ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+q.nx*L*0.06,q.y+q.ny*L*0.06);ctx.stroke();}
`);
  }else{
    const ribs='    for(let k=1;k<10;k++){const u=k/10*0.8;const a=bodyAt(p,pr,u,1),b=bodyAt(p,pr,u,-1);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}\n';
    replaceOnce(ribs,'');
    replaceOnce(weightPass,"pass('rgba(0,0,0,0.55)',3.0);pass('rgba(127,219,202,0.82)',1.35);");
    replaceOnce(strokes,`  // Probe the two actual signed half-widths at existing spine sample indices.
  for(let i=2;i<=p.N*0.8;i+=3){
    const q=p.sp[i],u=i/p.N;
    for(const side of [1,-1]){
      const tip=bodyAt(p,pr,u,side);
      ctx.strokeStyle=side>0?'rgba(138,236,211,0.95)':'rgba(158,183,246,0.89)';
      ctx.lineWidth=1.3*lw;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(tip[0],tip[1]);ctx.stroke();
      ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(tip[0],tip[1],1.9*lw,0,2*Math.PI);ctx.fill();
    }
  }
  ctx.strokeStyle='rgba(255,203,107,0.86)';ctx.lineWidth=1.4*lw;
  ctx.beginPath();p.sp.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
  ctx.fillStyle='#f4c77a';for(let i=0;i<=p.N;i+=4){const q=p.sp[i];ctx.beginPath();ctx.arc(q.x,q.y,(i%8?1.5:2.2)*lw,0,2*Math.PI);ctx.fill();}
`);
  }
  return source.slice(0,a)+view+source.slice(b);
};
