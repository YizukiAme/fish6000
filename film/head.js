<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#000}canvas{display:block}</style>
</head><body>
<canvas id="cv" width="1920" height="1080"></canvas>
<script>
"use strict";
// 《一条鱼，游过六千年》 —— 全片
// 每一帧都是 t 的纯函数
const W=1920,H=1080;
// ---- 出图分辨率：全片按 1920×1080 的坐标来画；地址里带 ?scale=2 时，所有全屏画布都按 2 倍像素（4K）来存，
//      内容和构图一模一样，只是更细。做法是给这些画布的绘图上下文换一套"带倍率"的变换、模糊和阴影。
const SS=(()=>{const m=/[?&]scale=([\d.]+)/.exec(location.search);return m?Math.max(1,+m[1]):1;})();
{const P=CanvasRenderingContext2D.prototype,di=P.drawImage;
  // 把一张高倍率的全屏画布画到别处时，按它的逻辑尺寸来画（源矩形按像素换算）
  P.drawImage=function(img,...a){const s=img&&img._ss;if(s&&s!==1){if(a.length===2)return di.call(this,img,a[0],a[1],img.width/s,img.height/s);
    if(a.length===8)return di.call(this,img,a[0]*s,a[1]*s,a[2]*s,a[3]*s,a[4],a[5],a[6],a[7]);}return di.call(this,img,...a);};}
function hiRes(c){c.width=W*SS;c.height=H*SS;c._ss=SS;const x=c.getContext('2d');if(SS===1)return x;const P=CanvasRenderingContext2D.prototype,st=P.setTransform,gt=P.getTransform,rs=P.reset;
  x.setTransform=function(a,b,cc,d,e,f){if(typeof a==='object')return st.call(this,a.a*SS,a.b*SS,a.c*SS,a.d*SS,a.e*SS,a.f*SS);return st.call(this,a*SS,b*SS,cc*SS,d*SS,e*SS,f*SS);};
  x.resetTransform=function(){st.call(this,SS,0,0,SS,0,0);};
  x.reset=function(){rs.call(this);st.call(this,SS,0,0,SS,0,0);};
  x.getTransform=function(){const m=gt.call(this);return new DOMMatrix([m.a/SS,m.b/SS,m.c/SS,m.d/SS,m.e/SS,m.f/SS]);};
  for(const k of ['shadowBlur','shadowOffsetX','shadowOffsetY']){const d=Object.getOwnPropertyDescriptor(P,k);Object.defineProperty(x,k,{get(){return d.get.call(this)/SS;},set(v){d.set.call(this,v*SS);}});}
  const fd=Object.getOwnPropertyDescriptor(P,'filter');
  Object.defineProperty(x,'filter',{get(){return fd.get.call(this).replace(/(-?[\d.]+)px/g,(m,n)=>(+n/SS)+'px');},set(v){fd.set.call(this,String(v).replace(/(-?[\d.]+)px/g,(m,n)=>(+n*SS)+'px'));}});
  st.call(x,SS,0,0,SS,0,0);return x;}
const cv=document.getElementById('cv');const ctx=hiRes(cv);
const SERIF='"Noto Serif CJK SC", serif';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,p)=>a+(b-a)*p;
const smooth=(e0,e1,x)=>{const u=clamp((x-e0)/(e1-e0));return u*u*(3-2*u);};
const eio=u=>{u=clamp(u);return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const mk=(w,h)=>{const c=document.createElement('canvas');if(w===W&&h===H){hiRes(c);return c;}c.width=w;c.height=h;return c;};
const rgba=(a,al)=>`rgba(${a[0]|0},${a[1]|0},${a[2]|0},${al})`;
const mixA=(a,b,p)=>a.map((v,i)=>lerp(v,b[i],p));
function noise2(seed,gw,gh){const r=rng(seed);const st=gw+2;const g=new Float32Array(st*(gh+2));for(let i=0;i<g.length;i++)g[i]=r();
  return (x,y)=>{x=clamp(x,0,gw);y=clamp(y,0,gh);const xi=Math.min(gw-1,Math.floor(x)),yi=Math.min(gh-1,Math.floor(y));const xf=x-xi,yf=y-yi;const sx=xf*xf*(3-2*xf),sy=yf*yf*(3-2*yf);
    const a=g[yi*st+xi],b=g[yi*st+xi+1],c=g[(yi+1)*st+xi],d=g[(yi+1)*st+xi+1];return lerp(lerp(a,b,sx),lerp(c,d,sx),sy);};}

