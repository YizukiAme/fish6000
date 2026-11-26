// Circumferential diaper for the Topkapı fish dish. Work in the plate's own
// polar coordinates so the same mask grows on the biscuit and colours in the kiln.
function drawRimDiaper(c, reveal) {
  if(reveal<=0)return;
  if(!drawRimDiaper.mask){
    const mask=mk(MW,MW), pen=mask.getContext('2d');
    pen.setTransform(MS,0,0,MS,MH,MH);
    const cells=48,step=2*Math.PI/cells,mid=.926*R,band=.0395*R;
    const knot=i=>i+.030*Math.sin(3*i*step)+.012*Math.cos(7*i*step);
    const at=(i,u,h)=>{
      const a=-Math.PI/2+(knot(i)+(knot(i+1)-knot(i))*u)*step;
      const r=mid+band*h+.16*Math.sin(5*a)+.07*Math.sin(11*a);
      return [Math.cos(a)*r,Math.sin(a)*r];
    };
    const crown=(i,u)=>{
      // The paired oblique strokes turn at a soft nib-width corner.
      const peak=.5+.023*Math.sin(i*.91);
      const tri=u<peak?u/peak:(1-u)/(1-peak);
      const d=1-tri,round=.065;
      return (Math.sqrt(1+round*round)-Math.sqrt(d*d+round*round))/(Math.sqrt(1+round*round)-round);
    };
    const poly=pts=>{pen.beginPath();pen.moveTo(...pts[0]);for(const p of pts.slice(1))pen.lineTo(...p);pen.closePath();};
    const fill=(pts,tone)=>{poly(pts);pen.fillStyle='rgba(0,0,0,'+tone+')';pen.fill();};
    function line(i,side,inner) {
      const left=[],right=[];
      for(let j=0;j<=36;j++){
        const u=j/36,s=side*crown(i,u)*.945-side*(inner?.235:0);
        const pressure=(inner?.026:.062)*(1+.20*Math.sin(i*1.87+side+u*3.5)+.24*Math.sin(Math.PI*u));
        left.push(at(i,u,s+pressure));right.push(at(i,u,s-pressure));
      }
      fill(left.concat(right.reverse()),inner?.77:.94);
    }
    // A four-petal reserve and its half motifs share the same pigment field.
    // Stopping the half motifs at the two rules leaves the narrow glazed lip clear.
    for(let i=0;i<cells;i++){
      pen.save();
      const bandPts=[];for(let k=0;k<=28;k++)bandPts.push(at(i,k/28,.99));
      for(let k=28;k>=0;k--)bandPts.push(at(i,k/28,-.99));
      poly(bandPts);pen.clip();
      for(const [centre,height,span,rise] of [[.5,0,.452,.845],[0,1,.455,.84],[1,1,.455,.84],[0,-1,.455,.84],[1,-1,.455,.84]]){
        const field=(x,y)=>at(i,centre+x*span,height+y*rise);
        const verts=Array.from({length:4},(_,k)=>field([0,1,0,-1][k],[1,0,-1,0][k]));
        fill(verts,.78+.08*Math.sin(i*1.2+height));
        pen.save();poly(verts);pen.clip();
        const phase=i*.83+height*3;
        for(let j=0;j<4;j++){
          const rot=j*Math.PI/2+.035*Math.sin(i+j+height);
          const reach=1+.057*Math.cos(phase+j*2),width=1+.083*Math.sin(phase*1.3+2.2*j);
          const loc=(x,y)=>field(reach*x*Math.cos(rot)-width*y*Math.sin(rot),reach*x*Math.sin(rot)+width*y*Math.cos(rot));
          pen.beginPath();pen.moveTo(...loc(.09,-.05));
          pen.bezierCurveTo(...loc(.18,-.22),...loc(.40,-.34),...loc(.54,-.326));
          pen.bezierCurveTo(...loc(.68,-.34),...loc(.96,-.13),...loc(1.06,.035));
          pen.bezierCurveTo(...loc(.90,.12),...loc(.72,.27),...loc(.57,.317));
          pen.bezierCurveTo(...loc(.45,.364),...loc(.23,.25),...loc(.15,.13));
          pen.quadraticCurveTo(...loc(.11,.13),...loc(.09,-.05));pen.closePath();
          pen.globalCompositeOperation='destination-out';pen.fillStyle='#000';pen.fill();
        }
        // A drier point leaves a blue seed between the four reserved petals.
        pen.globalCompositeOperation='source-over';
        pen.beginPath();pen.moveTo(...field(-.13,-.02));
        pen.bezierCurveTo(...field(-.14,-.19),...field(.12,-.20),...field(.14,-.03));
        pen.bezierCurveTo(...field(.17,.11),...field(-.06,.21),...field(-.12,.12));pen.closePath();
        pen.fillStyle='rgba(0,0,0,.95)';pen.fill();pen.restore();
      }
      pen.restore();
    }
    for(let i=0;i<cells;i++)for(const side of [-1,1]){line(i,side,false);line(i,side,true);}
    for(let i=0;i<cells;i++){
      // A crossing carries a narrow line of bare glaze between the two
      // cobalt sides. Preserve the alternating overpass at the circumferential seam.
      const side=i%2?1:-1,pts=[];
      for(let j=0;j<=6;j++){const u=.92+j*.08/6;pts.push(at(i-1,u,-side*crown(i-1,u)*.945+side*.111));}
      for(let j=1;j<=6;j++){const u=j*.08/6;pts.push(at(i,u,side*crown(i,u)*.945+side*.111));}
      pen.save();pen.globalCompositeOperation='destination-out';pen.lineWidth=.49;pen.lineCap='round';pen.lineJoin='round';pen.strokeStyle='rgba(0,0,0,.83)';pen.beginPath();pen.moveTo(...pts[0]);for(const p of pts.slice(1))pen.lineTo(...p);pen.stroke();pen.restore();
    }
    drawRimDiaper.mask=mask;
  }
  c.save();
  if(reveal<1){c.beginPath();c.moveTo(0,0);c.arc(0,0,R*1.01,-Math.PI/2,-Math.PI/2+Math.PI*2*reveal);c.closePath();c.clip();}
  c.drawImage(drawRimDiaper.mask,-MH/MS,-MH/MS,MW/MS,MW/MS);c.restore();
}
module.exports=function reviseDiaper(source){
  const first=source.indexOf('function drawRimDiaper(c, reveal) {');
  const next=source.indexOf('function wareDecoration(c,t) {',first);
  if(first<0||next<first||source.indexOf('function drawRimDiaper(',first+1)!==-1)throw Error('Could not isolate the current diaper mask');
  return source.slice(0,first)+drawRimDiaper.toString()+'\n'+source.slice(next);
};
