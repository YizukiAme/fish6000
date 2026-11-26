// ================= 捌 · 木版年画「蓮年有餘」（清 · 杨柳青，仿） =================
// 照杨柳青《蓮年有餘》左右镜像过来画（片子一路往左走，鱼头得朝左）：一条大鲤鱼——黑头、龙睛、白须、红鳞、金尾——
// 兜在胖娃娃怀里；娃娃一手托着鱼头，一手捏着一枝荷花骨朵；鱼头后面一大朵荷花、一片荷叶；上头题「蓮年有餘」。
// 先只有墨线版：娃娃两手空空。主角游进来，弯成那一兜，补上这条鲤鱼；黄、红、绿、蓝四块色版一版版压上去；
// 再「绘」——杨柳青是半印半绘：开脸、染荷花、染衣裳、染鱼尾，最后给鱼点睛。眼睛一点上，鱼就活了，一扭，从怀里溜了
const S8X=-4690,S8Y=0,S8W=420,S8H=336,PR8=180,PR8Y=138,MS8=3;
const P8W=Math.ceil(2*PR8*MS8),P8H=Math.ceil(2*PR8Y*MS8);
const PRINT_RECT8=[S8X-PR8,S8Y-PR8Y,2*PR8,2*PR8Y];
const PAPER_RECT8=[S8X-PR8-8,S8Y-PR8Y-8,2*PR8+16,2*PR8Y+16];
const T8C=[103.85,104.2,104.55,104.9],T8HOLD=[105.05,106.65],T8SLIP=107.22;
const T8PAINT={face:[105.0,105.3],lotus:[105.16,105.46],cloth:[105.3,105.6],fish:[105.4,105.7]};   // 绘：一组一组刷上去
const T8EYE=[105.76,105.86];   // 点睛：先上面那只，再下面那只
const BLK=[{k:'yellow',col:[240,184,34],off:[1.1,-0.8]},{k:'red',col:[220,60,30],off:[-0.9,1.1]},{k:'green',col:[30,150,110],off:[1.3,0.9]},{k:'blue',col:[52,118,206],off:[-0.7,-1.2]}];
const B8={};
const b8k=(t,i)=>smooth(T8C[i]-0.02,T8C[i]+0.1,t);
const p8k=(t,g)=>clamp((t-T8PAINT[g][0])/(T8PAINT[g][1]-T8PAINT[g][0]));
// ---------- 刀刻线：两头出锋、中段略鼓、边上带一点刀痕 ----------
let KW=1;
function kline(c,ctrl,w,o={}){w*=KW;const n=o.n||Math.max(10,ctrl.length*7);const P=curvePts(ctrl,n);
  const r=rng(o.seed||((Math.abs(ctrl[0][0]*131+ctrl[0][1]*71+ctrl.length*17)|0)+1));const N=P.length;const ti=o.ti??0.2,to=o.to??0.25,sw=o.sw??0.3;const L=[],R=[];
  for(let i=0;i<N;i++){const v=i/(N-1);const a=P[Math.max(0,i-1)],b=P[Math.min(N-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
    let f=Math.min(1,ti>0?v/ti:1,to>0?(1-v)/to:1);f=Math.pow(Math.max(0,f),0.55);const hw=w/2*Math.max(o.min??0.1,f)*(1+sw*Math.sin(Math.PI*v))*(1+0.16*(r()-0.5));
    const j=()=>(r()-0.5)*Math.min(0.5,w*0.14);L.push([P[i][0]-dy*hw+j(),P[i][1]+dx*hw+j()]);R.push([P[i][0]+dy*hw+j(),P[i][1]-dx*hw+j()]);}
  c.beginPath();L.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));for(let i=N-1;i>=0;i--)c.lineTo(R[i][0],R[i][1]);c.closePath();c.fill();}
function arcPts(cx,cy,rx,ry,a0,a1,n=9){const out=[];for(let i=0;i<n;i++){const a=lerp(a0,a1,i/(n-1));out.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return out;}
function polyFill(c,pts){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();c.fill();}
function path8(c,pts){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();}
// 闭合的光滑曲线（Catmull-Rom 首尾相接）
function loop8(pts,per=8){const n=pts.length,out=[];for(let i=0;i<n;i++){const P0=pts[(i-1+n)%n],P1=pts[i],P2=pts[(i+1)%n],P3=pts[(i+2)%n];
  for(let k=0;k<per;k++){const v=k/per;const h=(a,b,c,d)=>0.5*((2*b)+(-a+c)*v+(2*a-5*b+4*c-d)*v*v+(-a+3*b-3*c+d)*v*v*v);out.push([h(P0[0],P1[0],P2[0],P3[0]),h(P0[1],P1[1],P2[1],P3[1])]);}}return out;}
// ---------- 停在画里的那一兜（按原画量出来再镜像） ----------
// 981 × 754 的构图等比落在 360 × 276 的印面内。纸边另留八个单位。
const SC8=1.025,DY8=3.5,T8L=q=>[q[0]*SC8,q[1]*SC8+DY8];
const L8=Math.round(296*SC8),UB8=0.66,TL8=1-UB8;      // 停住时身长；身子占前 66%，后面全是尾
const M8D=[-95,-35],M8=T8L(M8D);        // 停住时嘴尖的位置：就在娃娃下巴左边
// 从嘴往后的脊线；最后一点正好接到主角从柒游过来的入口（-4505,0）
// 鱼头昂着（约 55°），身子往下兜到娃娃肚子底下再翘起来，尾根比嘴低一点——都是照原画按娃娃头的大小量出来的
const SP8=[[0,0],[21,29],[37,58],[62,79],[91,83],[120,72],[152,58],[185,53],[217,49],[247,45]].map(q=>T8L([M8D[0]+q[0],M8D[1]+q[1]])).concat([[185,0]]);   // 最后一点接到主角从柒游过来的入口（-4505,0）

// ---------- 年画里的鲤鱼（主角）：黑头、龙睛、白须、红鳞、金尾 ----------
// 坐标是定格姿态上的手绘草图。中间的侧线随游动弯曲，鳍面和鳞片共用同一根骨架。
const BODY_TOP8=[[250,307],[306,304],[352,307],[384,314],[411,330],[439,348],[465,362],[498,379],[532,391],[564,404],[598,413],[626,419],[651,423],[668,425],[677,429]];
const BODY_BOTTOM8=[[232,385],[253,426],[277,463],[302,500],[334,538],[374,563],[417,581],[461,591],[503,596],[545,592],[583,580],[613,555],[637,519],[659,472],[675,448]];
const cross8=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
const BODY_ROWS8=[curvePts(BODY_TOP8,151),curvePts(BODY_BOTTOM8,151)];
function restFlank8(u,v){
  const n=BODY_ROWS8[0].length-1, f=clamp((u-.065)/(UB8-.065))*n,i=Math.min(n-1,Math.floor(f));
  const [top,belly]=BODY_ROWS8;
  return cross8(cross8(belly[i],belly[i+1],f-i),cross8(top[i],top[i+1],f-i),(1+v)/2);
}
// 两道边线描述同一扇鳍的断面。近尾的两片合为一张鳍膜，共边处不落墨。
const finPattern8=(upper,lower,options={})=>{
  const n=70,A=curvePts(upper,n),B=curvePts(lower,n),seed=options.seed||0;
  const outline=(q,i,strength)=>{
    const a=A[Math.max(0,i-1)],b=A[Math.min(n-1,i+1)],v=i/(n-1),dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;
    const t=strength*Math.sin(Math.PI*v)*(.65*Math.sin(v*97+seed)+.37*Math.sin(v*141+seed));
    return [q[0]-dy/d*t,q[1]+dx/d*t];
  };
  const left=A.map((q,i)=>outline(q,i,options.scallop||0)),right=B.map((q,i)=>outline(q,i,options.scallop||0));
  return {left,right,rays:[],...options};
};
const TAIL_ART8=[
  finPattern8([[652,438],[675,447],[682,476],[694,503],[710,525],[716,539],[706,545]],
    [[662,438],[690,451],[708,475],[719,501],[732,526],[726,543],[706,545]],{seed:4,scallop:1.2}),
  finPattern8([[650,425],[620,370],[582,301],[595,284],[653,269],[684,277],[722,261],[764,247],[821,243],[860,248],[878,258],[893,277],[900,296],[896,310],[887,317]],
    [[669,432],[685,401],[700,363],[714,343],[738,333],[752,312],[776,301],[797,287],[824,279],[851,265],[869,262],[881,273],[891,291],[894,307],[887,317]],{seed:2,scallop:1.6}),
  finPattern8([[666,434],[689,420],[704,403],[717,366],[743,346],[771,324],[809,318],[842,314],[870,325],[893,337],[921,345],[939,360],[949,388],[949,410],[940,429],[925,440],[901,443],[880,453]],
    [[670,441],[691,437],[708,436],[724,435],[741,433],[759,431],[779,428],[798,423],[809,418],[818,406],[834,398],[844,393],[851,395],[863,391],[873,393],[880,386],[894,389],[903,386],[915,388],[929,396],[931,405],[924,418],[912,432],[900,435],[889,437],[880,453]],{seed:8,scallop:1.4,joinRight:true}),
  finPattern8([[670,441],[692,437],[715,436],[738,434],[759,431],[779,428],[799,423],[809,418],[811,427],[821,437],[835,456],[849,467],[855,483],[865,498],[870,516],[868,542],[860,561],[851,571],[839,580],[829,584],[817,586],[805,582],[798,576],[790,561]],
    [[669,446],[686,452],[701,473],[722,490],[747,499],[774,502],[794,506],[809,517],[825,523],[843,527],[848,533],[846,543],[842,553],[836,561],[825,569],[814,571],[804,569],[798,566],[794,564],[792,562],[790,561]],{seed:5,scallop:1.7,joinLeft:true})
];
const DORS_TOP8=[[403,381],[423,375],[444,369],[462,361],[479,352],[488,343],[495,357],[514,380],[534,401],[553,421],[591,437],[613,440]];
const DORS_BOTTOM8=[[403,381],[418,396],[437,412],[454,427],[469,439],[486,450],[507,461],[526,468],[546,473],[571,474],[593,468],[613,440]];
const DORS8=finPattern8(DORS_TOP8,DORS_BOTTOM8);
DORS8.rays=[
 [[410,385],[432,378],[460,370],[478,358],[487,346]],
 [[428,399],[453,390],[476,381],[494,370],[501,360]],
 [[448,417],[470,407],[493,397],[514,384]],
 [[468,431],[492,421],[513,412],[532,398]],
 [[486,447],[509,438],[533,428],[549,414]],
 [[509,459],[530,451],[552,440],[568,426]],
 [[532,466],[551,459],[574,449],[588,434]],
 [[553,472],[575,465],[593,454],[604,442]],
 [[571,472],[590,465],[606,452]]
].map(q=>curvePts(q,26));
const OTHER_FINS8=[
  finPattern8([[296,462],[282,484],[261,513],[247,541],[239,569],[232,584],[222,593]],
    [[320,495],[330,523],[316,539],[298,555],[279,565],[260,579],[222,593]],{seed:1,scallop:.35}),
  finPattern8([[444,573],[479,580],[519,578],[549,582],[564,593],[580,612],[588,630],[593,646]],
    [[446,580],[469,601],[492,615],[521,626],[545,631],[568,636],[582,640],[593,646]],{seed:7,scallop:.4}),
  finPattern8([[577,560],[598,533],[626,491],[653,454],[670,446],[668,481],[658,522],[642,559]],
    [[585,568],[601,568],[613,566],[625,563],[633,564],[639,563],[641,561],[642,559]],{seed:3,scallop:1.0})
];
OTHER_FINS8[2].rays=Array.from({length:11},(_,j)=>{const f=j/10;return curvePts([[lerp(587,659,f),lerp(564,465,f)],[lerp(604,664,f),lerp(562,463,f)],[lerp(631,669,f),lerp(556,458,f)]],18);});
// 从根部逐笔向不同的鳍缘分流。短鳍条在外缘收笔，只有最长的一两根跟着卷尖走。
function fanVeins8(rails,count,seed){
  const guides=rails.map(q=>curvePts(q,49)),lines=[];
  for(let j=0;j<count;j++){
    const f=(j+.37)/(count-.15)*(guides.length-1),i=Math.min(guides.length-2,Math.floor(f)),b=f-i;
    const line=[];
    for(let s=0;s<49;s++){
      const t=s/48,v=Math.sin(t*Math.PI),q=cross8(guides[i][s],guides[i+1][s],b);
      const a=guides[i][Math.max(0,s-1)],d=guides[i][Math.min(48,s+1)],dx=d[0]-a[0],dy=d[1]-a[1],len=Math.hypot(dx,dy)||1;
      const wave=v*(.75*Math.sin(t*19+b*1.8+i+seed)+.37*Math.sin(t*43+j*.21));
      line.push([q[0]-dy/len*wave,q[1]+dx/len*wave]);
    }lines.push(line);
  }return lines;
}
TAIL_ART8[0].rays=fanVeins8([
 [[675,446],[680,459],[686,479],[693,500],[704,508]],[[677,445],[689,467],[695,491],[711,510],[714,533]],
 [[678,446],[696,465],[706,492],[719,511],[724,532],[715,542]]
],6,2);
TAIL_ART8[1].rays=fanVeins8([
 [[638,399],[635,368],[617,336],[610,318],[591,302],[579,300]],
 [[645,412],[637,374],[636,346],[625,319],[620,299],[600,283]],
 [[648,413],[647,389],[641,360],[645,342],[638,324],[637,300],[620,276]],
 [[651,417],[647,389],[652,367],[649,348],[651,326],[654,306],[648,274]],
 [[654,418],[652,398],[657,377],[658,350],[669,327],[668,309],[680,283]],
 [[657,421],[659,395],[664,374],[665,349],[681,329],[686,307],[698,280]],
 [[659,422],[662,400],[672,374],[679,349],[697,328],[708,302],[733,274],[745,258]],
 [[661,423],[667,401],[679,374],[686,353],[702,333],[722,313],[736,289],[761,278],[788,256]],
 [[665,426],[673,402],[684,377],[694,354],[710,338],[737,319],[751,300],[774,286],[796,274],[814,254]],
 [[667,426],[679,395],[689,368],[704,350],[731,336],[749,314],[771,301],[790,286],[817,278],[846,258],[865,255]],
 [[669,426],[683,395],[693,367],[708,346],[734,334],[753,312],[777,299],[800,283],[828,277],[852,264],[870,261],[884,269],[898,288]]
],25,3);
TAIL_ART8[2].rays=fanVeins8([
 [[671,428],[690,404],[701,387],[708,367],[730,347],[748,339]],
 [[673,431],[695,407],[712,386],[722,365],[742,352],[762,331],[786,324]],
 [[674,431],[694,414],[715,392],[726,371],[751,354],[774,338],[801,333],[828,324]],
 [[674,433],[696,420],[717,399],[739,376],[762,358],[783,344],[807,342],[841,327],[865,332]],
 [[675,433],[699,423],[722,405],[748,383],[775,365],[809,353],[841,341],[870,346],[896,351]],
 [[675,434],[700,427],[728,411],[753,394],[785,375],[813,366],[846,353],[876,354],[909,360],[928,373]],
 [[677,434],[696,432],[727,420],[756,405],[786,389],[816,376],[847,367],[878,370],[909,374],[930,389],[943,410]],
 [[676,436],[700,434],[732,426],[762,415],[799,400],[828,387],[857,378],[887,381],[912,382],[932,392],[942,409],[934,428]],
 [[677,437],[702,436],[732,431],[762,421],[796,411],[826,396],[854,389],[882,386],[912,387],[929,391],[938,406],[930,426],[912,438]]
],18,7);
TAIL_ART8[3].rays=fanVeins8([
 [[676,437],[697,437],[729,433],[756,430],[786,422],[811,416]],
 [[676,438],[701,439],[732,436],[759,432],[788,429],[815,433]],
 [[676,438],[701,442],[730,441],[760,439],[790,436],[815,441],[832,457]],
 [[676,439],[702,447],[732,447],[764,448],[790,449],[814,452],[838,468],[848,487]],
 [[676,441],[701,453],[731,455],[763,457],[789,459],[816,466],[840,483],[864,505]],
 [[676,442],[699,457],[723,466],[756,469],[789,472],[814,477],[840,490],[861,510],[865,533]],
 [[675,443],[695,459],[718,473],[746,480],[775,482],[799,487],[819,496],[844,514],[854,530],[858,551]],
 [[674,445],[695,465],[718,481],[739,487],[768,488],[791,493],[808,506],[833,514],[851,531],[851,554],[838,571]],
 [[675,446],[692,465],[711,482],[739,494],[765,496],[787,501],[805,514],[830,521],[847,533],[848,552],[838,567],[816,579],[796,568]]
],19,9);
OTHER_FINS8[0].rays=fanVeins8([
 [[292,480],[269,509],[255,542],[246,571],[238,588]],[[302,479],[284,503],[269,532],[260,557],[255,580]],
 [[308,483],[289,512],[276,536],[270,559],[267,574]],[[317,491],[299,519],[288,540],[282,557]],
 [[323,501],[309,523],[300,543],[298,551]],[[327,511],[316,528],[311,540]]
],9,1);
OTHER_FINS8[1].rays=fanVeins8([
 [[456,586],[477,602],[500,612],[533,624],[562,629]],[[466,585],[493,601],[522,611],[550,621],[574,631],[589,640]],
 [[485,583],[508,596],[533,605],[557,615],[581,625]],[[501,583],[523,595],[548,604],[572,613]],
 [[522,583],[541,594],[561,600],[575,608]]
],10,4);
// 头部的轮廓和甲片都以定格时的手量点起稿；整组随主角头部坐标系转动。
const Pth8=d=>new Path2D(d);
const HEAD_OUT8=Pth8('M201 340 C194 331 194 314 199 300 C206 279 226 270 248 270 C270 268 286 274 309 280 C345 281 372 293 397 311 C410 321 416 330 405 337 C392 344 370 337 351 336 C327 332 306 345 293 367 C282 384 283 401 289 415 C296 432 303 450 298 459 C294 468 281 469 270 466 C249 460 231 424 220 396 C210 375 204 359 201 340Z');
const NOSE8=[
  Pth8('M240 279 Q245 279 251 280 Q250 272 248 267 C247 245 244 228 221 215 C240 233 238 255 240 279Z'),
  Pth8('M204 313 C182 314 156 312 130 303 Q116 298 108 292 C124 307 148 315 178 318 Q193 320 202 324Z')
];
const NOSTRILS8=[
  Pth8('M245 277 C250 277 251 280 250 284 C247 284 247 281 245 277Z'),
  Pth8('M210 317 C214 319 216 320 219 320 Q216 324 212 322 Q210 320 210 317Z')
];
// 每片甲的尾缘都有自己的弧线。黑、朱、粉白、石青和黄睛各自由一块不对称的面印出。
const EYE_ART8=[
  {plates:[
    ['M266 263 C287 258 329 278 353 290 C384 301 405 309 411 322 C415 330 410 338 400 339 C382 343 352 335 331 330 C301 323 277 304 266 285Z',[318,291,390,340]],
    ['M266 258 C287 254 317 268 345 281 C361 288 379 297 380 308 C381 318 373 325 361 326 C335 329 309 321 289 310 C275 301 264 282 266 258Z',[302,280,360,326]],
    ['M267 252 C288 251 315 263 334 274 C349 282 354 291 349 300 C344 309 329 314 308 312 C287 309 273 299 265 287Z',[284,267,332,310]]
  ],
   red:'M263 252 C275 242 292 246 306 252 C322 258 330 271 329 282 C328 296 316 306 302 309 C285 313 271 307 261 296 C253 286 250 264 263 252Z',
   ivory:'M261 252 C275 243 289 246 305 252 C317 257 324 267 322 278 C321 291 311 301 297 304 C283 307 269 303 260 294 C251 285 249 263 261 252Z',
   teal:'M260 251 C271 243 285 244 297 249 C311 255 318 265 316 276 C315 286 310 294 297 299 C282 303 270 299 259 291 C251 282 249 261 260 251Z',
   iris:'M263 249 C269 245 279 244 286 248 C294 251 298 257 299 265 C300 275 294 281 286 283 C275 286 264 282 258 276 C253 270 254 257 258 252Z',
   wash:[262,250,307,300],gold:[265,253,290,280],pupil:[273,262,3.9,3.65],glint:[271.7,260.8]},
  {plates:[
    ['M198 341 C213 337 235 355 247 373 C263 395 286 420 293 436 C302 455 298 463 288 466 C280 470 268 467 259 459 C247 447 236 431 223 412 C206 387 195 363 198 341Z',[221,371,289,460]],
    ['M194 340 C212 333 228 346 241 365 C255 383 273 404 275 421 C277 430 272 439 264 442 C253 447 241 439 232 431 C219 419 208 394 200 369Z',[214,372,266,438]],
    ['M192 341 C207 333 225 343 236 358 C248 372 258 388 260 400 C262 411 255 419 247 421 C236 424 226 418 217 409 C204 396 194 370 192 341Z',[210,359,251,418]]
  ],
   red:'M188 335 C199 328 211 331 224 338 C239 346 251 359 254 373 C258 387 249 398 238 402 C222 409 206 403 195 393 C183 382 176 363 178 348 Q180 340 188 335Z',
   ivory:'M187 335 C199 328 212 331 222 338 C236 344 247 357 246 371 C247 385 240 395 226 399 C213 403 199 396 190 388 C181 378 176 360 177 348 Q179 339 187 335Z',
   teal:'M186 335 C198 329 209 331 220 337 C233 344 240 355 240 368 C240 380 233 389 222 392 C210 396 196 390 188 381 C181 372 176 358 177 348 Q179 340 186 335Z',
   iris:'M186 333 C196 328 207 329 216 335 C222 340 226 347 227 355 C227 364 223 370 215 373 C204 377 193 374 186 368 C180 362 177 354 178 348 Q178 339 186 333Z',
   wash:[184,335,230,392],gold:[188,338,215,372],pupil:[197,348,4.1,3.9],glint:[195.7,346.9]}
].map(e=>({...e,plates:e.plates.map(([d,grad])=>({p:Pth8(d),grad})),red:Pth8(e.red),ivory:Pth8(e.ivory),teal:Pth8(e.teal),iris:Pth8(e.iris)}));
let heldHead8;
function headMatrix8(p){
  const s=spineAt(p,0),base=heldHead8,m=base.spine;
  const k=RP8K.k*SC8*p.L/base.length,co=s.tx*m.tx+s.ty*m.ty,si=s.ty*m.tx-s.tx*m.ty;
  const a=k*co,b=k*si,d=k*co,e=-k*si;
  return[a,b,e,d,s.x-a*base.px-e*base.py,s.y-b*base.px-d*base.py];
}
function prepHead8(){
  const p=heroPoseNow(T8HOLD[1]+.2),s=spineAt(p,0),origin=T8L(RP8(0,0)),k=SC8*RP8K.k;
  heldHead8={pose:p,spine:s,length:p.L,px:(s.x-S8X-origin[0])/k,py:(s.y-S8Y-origin[1])/k};
}
function clearHeadPath8(c,path){c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fillStyle='#000';c.fill(path);c.restore();}
function clipOutside8(c,path){const area=new Path2D();area.rect(-2048,-2048,4096,4096);area.addPath(path);c.clip(area,'evenodd');}
function headBlock8(c,m,blk){
  c.save();c.transform(...m);
  if(blk==='sil'){
    c.fill(HEAD_OUT8);for(const e of EYE_ART8){for(const plate of e.plates)c.fill(plate.p);c.fill(e.red);c.fill(e.iris);}
    for(const w of NOSE8)c.fill(w);c.restore();return;
  }
  if(blk==='line')c.fill(HEAD_OUT8);else clearHeadPath8(c,HEAD_OUT8);
  for(const e of EYE_ART8){
    for(const plate of e.plates){if(blk==='line')c.fill(plate.p);else clearHeadPath8(c,plate.p);}
    clearHeadPath8(c,e.red);
    if(blk==='red'){c.fill(e.red);clearHeadPath8(c,e.ivory);}
    if(blk==='green'||blk==='blue'){c.save();c.globalAlpha*=blk==='green'?.83:.44;c.fill(e.teal);c.restore();clearHeadPath8(c,e.iris);}
    if(blk==='yellow')c.fill(e.iris);
    if(blk==='line'){
      c.save();c.globalAlpha=.74;c.lineWidth=1.03;c.stroke(e.red);c.globalAlpha=.45;c.lineWidth=.76;c.stroke(e.iris);c.restore();
    }
  }
  for(const w of NOSE8){
    clearHeadPath8(c,w);
    if(blk==='line'){c.save();c.lineWidth=1.28;c.stroke(w);c.restore();}
  }
  if(blk==='line')for(const n of NOSTRILS8)clearHeadPath8(c,n);
  c.restore();
}
function tonal8(c,box,stops){
  const g=c.createLinearGradient(...box);for(const [at,col] of stops)g.addColorStop(at,col);return g;
}
function headGlaze8(c,m,k){
  c.save();c.transform(...m);c.globalAlpha*=k;
  c.save();c.clip(HEAD_OUT8);
  for(const eye of EYE_ART8){clipOutside8(c,eye.plates[0].p);clipOutside8(c,eye.red);}
  for(const w of [...NOSE8,...NOSTRILS8])clipOutside8(c,w);
  c.fillStyle='rgba(14,13,18,.69)';c.fill(HEAD_OUT8);
  const rim=Pth8('M197 332 C191 309 202 288 218 278 C233 269 245 269 258 270');
  for(const [w,col] of [[14,'rgba(136,125,120,.30)'],[8,'rgba(187,170,155,.44)'],[3,'rgba(231,217,195,.67)']]){
    c.strokeStyle=col;c.lineWidth=w;c.stroke(rim);
  }
  c.save();c.clip(Pth8('M409 322 C450 364 358 487 286 479 L274 447 C280 418 270 404 284 374 C303 333 332 323 365 329Z'));
  const gillAlpha=c.globalAlpha;
  for(let j=14;j>0;j--){c.globalAlpha=gillAlpha*(.116+(14-j)*.008);c.lineWidth=j*2;c.strokeStyle='#dbc4b0';c.stroke(HEAD_OUT8);}
  c.restore();
  c.restore();
  for(const e of EYE_ART8){
    c.save();clipOutside8(c,e.red);
    for(const [i,a] of e.plates.entries()){
      c.save();c.clip(a.p);
      c.fillStyle=tonal8(c,a.grad,[[0,'rgba(16,15,18,.83)'],[.70,'rgba(20,18,21,.96)'],[1,'rgba(65,53,53,.92)']]);c.fill(a.p);
      // 罩染只贴着同一片甲的外唇往里退，避免硬直的灰带横跨整片黑甲。
      c.strokeStyle=tonal8(c,a.grad,[[0,'rgba(200,177,157,0)'],[.35,'rgba(196,174,160,.02)'],[.63,'rgba(209,185,170,.49)'],[.88,'#ead3bf'],[1,'#f6e1cd']]);
      const alpha=c.globalAlpha;
      for(let j=12;j>0;j--){c.globalAlpha=alpha*(.132+(12-j)*.011);c.lineWidth=j*(i===0?1.87:1.56);c.stroke(a.p);}
      c.restore();
    }
    c.restore();
    // 两层水色从朝上的深石青退到朝下的粉白。黄眼珠只在迎光的一角留重色。
    c.save();c.clip(e.red);clipOutside8(c,e.ivory);
    c.fillStyle=tonal8(c,e.wash,[[0,'rgba(173,52,46,.32)'],[.6,'rgba(237,91,77,.77)'],[1,'rgba(209,81,71,.82)']]);c.fill(e.red);c.restore();
    c.save();c.clip(e.ivory);clipOutside8(c,e.iris);
    c.fillStyle=tonal8(c,e.wash,[[0,'#284647'],[.45,'#305456'],[.59,'#517774'],[.73,'#95a69d'],[.89,'#ddd4bf'],[1,'#f6e7d5']]);c.fill(e.ivory);c.restore();
    c.fillStyle=tonal8(c,e.gold,[[0,'rgba(227,160,40,.67)'],[.36,'rgba(248,204,100,.83)'],[.71,'rgba(247,224,176,.94)'],[1,'rgba(247,237,211,.97)']]);c.fill(e.iris);
    c.lineWidth=1;c.strokeStyle='rgba(81,70,48,.67)';c.stroke(e.iris);
  }
  for(const v of NOSTRILS8){c.fillStyle='#f7e6cc';c.fill(v);}
  for(const w of NOSE8){
    c.save();c.clip(w);c.fillStyle=tonal8(c,[188,299,189,322],[[0,'rgba(253,249,229,.85)'],[.7,'rgba(208,207,194,.82)'],[1,'rgba(126,149,150,.66)']]);c.fill(w);c.restore();
  }
  c.restore();
}

// 鳞片的两端落在相邻一排的弧背上。共用鱼身坐标, 鱼弯身时两排也能咬合。
function fishWarp8(p){
  const count=48,origin=T8L(RP8(0,0)),scale=SC8*RP8K.k,relative=p.L/heldHead8.length,mat=[];
  for(let i=0;i<=count;i++){
    const u=i/count,base=spineAt(heldHead8.pose,u),s=spineAt(p,u);
    const x=(base.x-S8X-origin[0])/scale,y=(base.y-S8Y-origin[1])/scale;
    const a=(s.tx*base.tx+s.ty*base.ty)*relative*scale,b=(s.ty*base.tx-s.tx*base.ty)*relative*scale;
    mat.push([a,b,s.x-a*x+b*y,s.y-b*x-a*y]);
  }
  return (q,u)=>{
    const f=clamp(u)*count,i=Math.min(count-1,Math.floor(f)),a=mat[i],b=mat[i+1],v=f-i;
    const co=lerp(a[0],b[0],v),si=lerp(a[1],b[1],v);
    return [co*q[0]-si*q[1]+lerp(a[2],b[2],v),si*q[0]+co*q[1]+lerp(a[3],b[3],v)];
  };
}
function scales8(surface){
  const scales=[],pitch=.0365,h=.207;
  for(let row=-5;row<=5;row++){
    const v=row*h;
    for(let u=.087+(Math.abs(row)%2)*pitch/2;u<UB8;u+=pitch){
      const arc=[],ribs=[];
      for(let j=0;j<=18;j++){
        const angle=Math.PI*(j/18-.5),U=Math.min(UB8,u+pitch*.59*Math.cos(angle));
        arc.push(surface(U,clamp(v+Math.sin(angle)*h,-1.06,1.06)));
      }
      for(const f of [.22,.36,.52,.68,.77]){
        const a=Math.PI*(f-.5),V=v+Math.sin(a)*h,U=u+pitch*.59*Math.cos(a);
        if(Math.abs(V)>.99||U>=UB8)continue;
        const spread=(f-.43)*.118;
        ribs.push([surface(U-.001,V),surface(U-.006,V+spread*.48),surface(U-.014+(row%2)*.0007,V+spread)]);
      }
      scales.push({arc,ribs});
    }
  }return scales;
}
function scaleLines8(c,scales,ribs){
  c.beginPath();
  for(const s of scales){
    if(ribs){for(const line of s.ribs){c.moveTo(...line[0]);c.quadraticCurveTo(...line[1],...line[2]);}}
    else{s.arc.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));}
  }
  c.stroke();
}
function scaledBody8(c,g){path8(c,g.top.concat(g.bot.slice().reverse()));}
function removeFin8(c,fin){
  c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fillStyle='#000';path8(c,fin.poly);c.fill();c.restore();
}
function omitFin8(c,fin){
  const a=new Path2D();a.rect(-100000,-10000,200000,20000);
  const b=new Path2D();fin.poly.forEach((q,i)=>i?b.lineTo(...q):b.moveTo(...q));b.closePath();a.addPath(b);c.clip(a,'evenodd');
}
function bodyGlaze8(c,p,g,k){
  c.save();scaledBody8(c,g);c.clip();omitFin8(c,g.dors);
  const world=c.getTransform();c.transform(...g.m);clipOutside8(c,HEAD_OUT8);
  for(const e of EYE_ART8){clipOutside8(c,e.plates[0].p);clipOutside8(c,e.red);}
  c.setTransform(world);c.globalAlpha*=k;const alpha=c.globalAlpha;
  const ink=p.L/303;
  c.fillStyle='rgba(228,58,53,.78)';scaledBody8(c,g);c.fill();
  // 每个断面的渐变轴均与腹缘相交，侧面转向时不会出现横贯鳞片的色带。
  for(let i=0;i<46;i++){
    const u0=lerp(.065,UB8,i/46),u1=lerp(.065,UB8,(i+1)/46),u=(u0+u1)/2;
    const side=lerp(-.92,-.42,smooth(.23,.52,u)),start=g.surface(u,side),end=g.surface(u,-1.01);
    const paint=c.createLinearGradient(...start,...end);
    for(const [t,col] of [[0,'rgba(240,108,78,0)'],[.32,'rgba(239,139,97,.28)'],[.63,'rgba(244,176,128,.64)'],[.87,'rgba(247,202,164,.90)'],[1,'rgba(249,219,181,.98)']])paint.addColorStop(t,col);
    const e=Math.min(UB8,u1+.00065);
    c.fillStyle=paint;polyFill(c,[g.surface(u0,side+.005),g.surface(e,side+.005),g.surface(e,-1.015),g.surface(u0,-1.015)]);
  }
  c.globalAlpha=alpha;c.lineJoin='round';c.lineCap='round';
  c.strokeStyle='rgba(84,33,27,.94)';c.lineWidth=.85*ink;scaleLines8(c,g.scales,false);
  c.translate(-.24*ink,-.10*ink);c.strokeStyle='rgba(246,178,101,.86)';c.lineWidth=.25*ink;scaleLines8(c,g.scales,false);
  c.strokeStyle='rgba(240,176,99,.80)';c.lineWidth=.26*ink;scaleLines8(c,g.scales,true);
  c.restore();
}
const SCALE_ART8=scales8((u,v)=>[...restFlank8(u,v),u]);
const FAN_JOIN8=[[670,437],[703,430],[741,426],[781,420],[805,418],[803,427],[778,436],[741,441],[702,443]];
let NG8=null;
function nianGeom(p){
  if(NG8&&NG8.p===p)return NG8;
  const warp=fishWarp8(p),surface=(u,v)=>warp(restFlank8(u,v),u);
  const top=[],bot=[],M=60;
  for(let i=0;i<=M;i++){const u=lerp(.065,UB8,i/M);top.push(surface(u,1));bot.push(surface(u,-1));}
  const mapFin=(f,binding)=>{
    const follow=q=>warp(q,binding(q)),left=f.left.map(follow),right=f.right.map(follow);
    return {left,right,poly:left.concat(right.slice().reverse()),rays:f.rays.map(r=>r.map(follow)),joinRight:f.joinRight,joinLeft:f.joinLeft};
  };
  const tailU=([x,y])=>UB8+TL8*clamp((x-665+.30*Math.abs(y-438))/320);
  const bodyU=([x])=>lerp(.22,.64,clamp((x-306)/344));
  const lobes=TAIL_ART8.map(f=>mapFin(f,tailU));
  const fins=OTHER_FINS8.map((f,i)=>mapFin(f,i===0?()=>.18:i===1?()=>.395:()=>.59));
  const place=q=>warp(q,q[2]);
  const scales=SCALE_ART8.map(({arc,ribs})=>({arc:arc.map(place),ribs:ribs.map(r=>r.map(place))}));
  const bridge=FAN_JOIN8.map(q=>warp(q,tailU(q)));
  NG8={p,m:headMatrix8(p),warp,top,bot,M,surface,scales,bridge,lobes,fins,dors:mapFin(DORS8,bodyU),root:warp([670,437],UB8)};
  return NG8;
}
function inkFin8(c,f,k,kind){
  const line=(points)=>{c.beginPath();points.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.stroke();};
  c.save();c.lineWidth=.49*k;
  if(f.joinLeft)line(f.left.slice(Math.floor(f.left.length*.30)));else line(f.left);
  if(f.joinRight)line(f.right.slice(Math.floor(f.right.length*.32)));else line(f.right);
  const alpha=c.globalAlpha;path8(c,f.poly);c.clip();
  for(let j=0;j<f.rays.length;j++){
    c.globalAlpha=alpha*(kind==='dors'?.78:.66+.13*Math.sin(j*5.4));
    const pts=f.rays[j],width=(kind==='dors'?.62:kind==='tail'?.46:.48)*k;
    const left=[],right=[];
    for(let i=0;i<pts.length;i++){
      const t=i/(pts.length-1),q=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];
      const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
      const pressure=(.15+.85*Math.min(1,t/.09,(1-t)/(.12+.045*(j%4))))*(.92+.08*Math.sin(t*15+j));
      const nx=-dy/len*width*pressure*.5,ny=dx/len*width*pressure*.5;
      left.push([q[0]+nx,q[1]+ny]);right.push([q[0]-nx,q[1]-ny]);
    }
    polyFill(c,left.concat(right.reverse()));
  }
  c.restore();
}
function nianFishParts(c,p,blk){
  const g=nianGeom(p),k=p.L/303;
  c.lineJoin='round';c.lineCap='round';
  const fillFins=()=>{polyFill(c,g.bridge);for(const f of [...g.lobes,...g.fins,g.dors]){path8(c,f.poly);c.fill();}};
  if(blk==='sil'){scaledBody8(c,g);c.fill();fillFins();headBlock8(c,g.m,blk);return;}
  if(blk==='yellow'){
    fillFins();c.save();scaledBody8(c,g);c.clip();c.lineWidth=.53*k;scaleLines8(c,g.scales,false);c.lineWidth=.25*k;scaleLines8(c,g.scales,true);c.restore();
  }else if(blk==='red'){
    scaledBody8(c,g);c.fill();removeFin8(c,g.dors);
  }else if(blk==='line'){
    for(const f of g.lobes){inkFin8(c,f,k,'tail');}
    for(const f of g.fins){removeFin8(c,f);inkFin8(c,f,k,'fin');}
    c.save();c.globalCompositeOperation='destination-out';scaledBody8(c,g);c.fill();c.restore();
    kline(c,g.top,.76*k,{seed:901,ti:.03,to:.29,sw:.1,n:60});
    kline(c,g.bot,.74*k,{seed:902,ti:.02,to:.25,sw:.1,n:60});
    // 墨线版也刻出鱼鳞，套版和水色在同一刀痕的两侧留极细的金边。
    c.save();scaledBody8(c,g);c.clip();c.globalAlpha*=.80;c.lineWidth=.42*k;scaleLines8(c,g.scales,false);c.restore();
    removeFin8(c,g.dors);inkFin8(c,g.dors,k,'dors');
  }
  headBlock8(c,g.m,blk);
}
function nianFishPaint(c,p,k){
  const g=nianGeom(p),r=g.root,unit=p.L/303;
  c.save();c.globalAlpha*=k;
  const wash=c.createRadialGradient(...r,1*unit,...r,77*unit);
  for(const [x,col] of [[0,'#bb3d30'],[.12,'#d74d32'],[.34,'#ef6f34'],[.58,'#f99d3b'],[.79,'#f9b846'],[1,'#fac659']])wash.addColorStop(x,col);
  c.globalAlpha*=.98;c.fillStyle=wash;
  for(const f of g.lobes){path8(c,f.poly);c.fill();}
  const redRim=(f,edge,end,strength)=>{
    c.save();path8(c,f.poly);c.clip();
    const glaze=c.createLinearGradient(...r,...end);
    for(const [t,col] of [[0,'rgba(184,49,38,.74)'],[.27,'rgba(221,66,44,.92)'],[.62,'rgba(236,94,48,.91)'],[.89,'rgba(224,111,47,.67)'],[1,'rgba(236,151,69,.18)']])glaze.addColorStop(t,col);
    c.strokeStyle=glaze;c.lineJoin='round';c.lineCap='round';const alpha=c.globalAlpha;
    c.beginPath();edge.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));
    for(let j=9;j>0;j--){c.globalAlpha=alpha*strength*(.088+(9-j)*.004);c.lineWidth=(1+j*1.8)*unit;c.stroke();}
    c.restore();
  };
  redRim(g.lobes[1],g.lobes[1].right,g.lobes[1].right[65],1.35);
  redRim(g.lobes[2],g.lobes[2].left,g.lobes[2].left[61],1.4);
  redRim(g.lobes[3],g.lobes[3].right,g.lobes[3].right[67],1.32);
  // Folded inner faces follow the same warp as the tail membrane.
  const curls=[
    [1,[[878,260],[889,275],[897,292],[897,308],[887,317]],[[880,263],[889,278],[894,294],[893,307],[887,317]]],
    [2,[[942,404],[938,418],[926,432],[910,438],[892,442],[880,453]],[[937,402],[934,414],[924,427],[909,434],[890,438],[880,453]]],
    [3,[[849,545],[839,560],[825,571],[811,574],[799,568],[790,561]],[[852,546],[843,561],[829,575],[812,579],[798,573],[790,561]]]
  ];
  for(const [i,outside,inside] of curls){
    const map=q=>g.warp(q,UB8+TL8*clamp((q[0]-665+.30*Math.abs(q[1]-438))/320));
    const lip=curvePts(outside,35).map(map),under=curvePts(inside,35).map(map);
    c.save();path8(c,g.lobes[i].poly);c.clip();
    const tone=c.createLinearGradient(...lip[0],...lip[22]);tone.addColorStop(0,'rgba(173,85,39,.04)');tone.addColorStop(.39,'rgba(173,85,39,.53)');tone.addColorStop(1,'rgba(198,109,47,.66)');
    c.fillStyle=tone;polyFill(c,lip.concat(under.slice().reverse()));
    c.fillStyle='rgba(255,221,119,.75)';kline(c,lip.slice(4,30),1.05*unit,{ti:.34,to:.39,sw:.03,n:35});c.restore();
  }
  // 近侧尾扇的上下两叶在缺口之前共一张鳍膜。两片接缝也接着同一层水色。
  polyFill(c,g.bridge);
  const washFin=(f,from,to)=>{
    const grad=c.createLinearGradient(...from,...to);
    for(const [x,col] of [[0,'#b44b29'],[.21,'#d77339'],[.55,'#eea345'],[.87,'#f4bd57'],[1,'#f5cd6a']])grad.addColorStop(x,col);
    c.fillStyle=grad;path8(c,f.poly);c.fill();
  };
  g.fins.forEach((f,i)=>washFin(f,f.left[0],f.right[i===2?f.right.length-1:Math.floor(f.right.length*.83)]));
  c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fillStyle='#000';scaledBody8(c,g);c.fill();c.restore();
  washFin(g.dors,g.warp([424,418],.34),g.warp([482,345],.44));
  c.save();path8(c,g.dors.poly);c.clip();c.strokeStyle='rgba(255,213,121,.84)';c.lineWidth=.65*unit;
  for(const points of g.dors.rays){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y+.63*unit):c.moveTo(x,y+.63*unit));c.stroke();}
  c.strokeStyle='#f9c975';c.lineWidth=1.55*unit;c.beginPath();g.dors.right.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.stroke();c.restore();
  c.save();c.transform(...g.m);clearHeadPath8(c,HEAD_OUT8);
  for(const e of EYE_ART8){for(const plate of e.plates)clearHeadPath8(c,plate.p);clearHeadPath8(c,e.red);}c.restore();
  c.restore();
}
function nianFishLights(c,p,k){const g=nianGeom(p);bodyGlaze8(c,p,g,k);headGlaze8(c,g.m,k);}
// 鱼最后才点睛；两颗墨点偏向同一侧，保持各自的透视和点笔先后。
function nianEyes(c,TR,p,t){
  c.save();c.setTransform(...TR);c.transform(...nianGeom(p).m);
  EYE_ART8.forEach((eye,i)=>{
    const e=smooth(T8EYE[i],T8EYE[i]+.05,t);if(e<=0)return;
    const [x,y,rx,ry]=eye.pupil,[gx,gy]=eye.glint,pop=e*(1+.26*Math.sin(Math.PI*clamp((t-T8EYE[i])/.12)));
    c.fillStyle='#624729';c.beginPath();c.ellipse(x,y,rx*pop,ry*pop,-.17,0,2*Math.PI);c.fill();
    c.fillStyle='#221b18';c.beginPath();c.ellipse(x+.28,y+.12,rx*.78*pop,ry*.8*pop,-.17,0,2*Math.PI);c.fill();
    c.fillStyle='rgba(255,243,211,.91)';c.beginPath();c.arc(gx,gy,.73*pop,0,2*Math.PI);c.fill();
  });
  c.restore();
}
// ---------- 画面（印面局部坐标，纸心 ±170）----------
const RP8K={px:435,py:222,k:0.358,x:-18.5,y:-61};   // tools/s8_panel.js 会把它写进 cmp/s8_meta.json，对照脚本按它换算
const RP8=(px,py)=>[(px-RP8K.px)*RP8K.k+RP8K.x,(py-RP8K.py)*RP8K.k+RP8K.y];
const SWEEP8={face:[[-20,-110],[-20,64]],lotus:[[-168,-64],[6,70]],cloth:[[-150,-40],[100,60]]};
function refSpace8(c){c.translate(...RP8(0,0));c.scale(RP8K.k,RP8K.k);}
function blush8(c,x,y,rx,ry,stops){
  c.save();c.translate(x,y);c.scale(rx,ry);
  const g=c.createRadialGradient(0,0,0,0,0,1);for(const [t,col] of stops)g.addColorStop(t,col);
  c.fillStyle=g;c.fillRect(-4,-4,8,8);c.restore();
}
function blushInside8(c,pts,x,y,rx,ry,stops){c.save();path8(c,pts);c.clip();blush8(c,x,y,rx,ry,stops);c.restore();}
function scene8(c,part,blk){c.save();c.translate(0,DY8);c.scale(SC8,SC8);scene8d(c,part,blk);c.restore();}
function scene8d(c,part,blk){c.lineJoin='round';c.lineCap='round';
  const line=blk==='line',sil=blk==='sil',pg=blk.startsWith('p:')?blk.slice(2):null,lg=blk.startsWith('l:')?blk.slice(2):null;
  const occ=pts=>{if(sil)return;c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fillStyle='#000';path8(c,pts);c.fill();c.restore();};
  const fill=(k,al,pts)=>{if(blk!==k)return;c.save();c.globalAlpha=al;path8(c,pts);c.fill();c.restore();};
  const shape=pts=>{occ(pts);if(sil){path8(c,pts);c.fill();}};               // 挡住后面的东西（各版都挡）
  const K=(pts,w,o)=>{if(line)kline(c,pts,w,o);};
  const KC=(pts,w,o={})=>{if(line)kline(c,pts.concat([pts[0]]),w,{ti:0,to:0,sw:0.06,min:1,n:pts.length+1,...o});};
  const strokeIf=(k,w,pts,al=1)=>{if(blk!==k)return;c.save();c.globalAlpha=al;c.lineWidth=w;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();c.restore();};
  const cutIf=(k,w,pts)=>{if(blk!==k)return;c.save();c.globalCompositeOperation='destination-out';c.strokeStyle='#000';c.lineWidth=w;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();c.restore();};
  const paint=(g,f)=>{if(pg===g){c.save();f();c.restore();}};
  const light=(g,f)=>{if(lg===g){c.save();f();c.restore();}};
  const gradFill=(pts,x0,y0,x1,y1,stops)=>{const g=c.createLinearGradient(x0,y0,x1,y1);for(const [o,col] of stops)g.addColorStop(o,col);c.fillStyle=g;path8(c,pts);c.fill();};
  const radFill=(pts,x,y,r,stops)=>{const g=c.createRadialGradient(x,y,0,x,y,r);for(const [o,col] of stops)g.addColorStop(o,col);c.fillStyle=g;path8(c,pts);c.fill();};
  const dot=(k,x,y,r,al=1)=>{if(blk===k){c.save();c.globalAlpha=al;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.restore();}};
  if(part==='back'){
    // —— 题字：蓮年（右）有餘（左），从右往左念 ——
    if(line){
      c.save();c.font='400 23.5px "Yuji Syuku"';c.strokeStyle=c.fillStyle;c.textAlign='center';c.textBaseline='alphabetic';
      for(const [ch,px,py,tilt,stretch] of [['餘',120,156,-.061,.96],['有',240,160,.04,1.03],['年',664,160,-.046,1.1],['蓮',770,158,.028,.97]]){
        const [x,y]=RP8(px,py),m=c.measureText(ch);
        c.save();c.translate(x,y);c.rotate(tilt);c.scale(stretch*.93,1.05);
        const bx=(m.actualBoundingBoxLeft-m.actualBoundingBoxRight)/2,by=(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;
        c.fillText(ch,bx,by);c.lineWidth=.32;c.strokeText(ch,bx,by);          // 描一圈，笔画稍微撑粗一点
        c.globalCompositeOperation='destination-out';c.lineWidth=.16;c.globalAlpha=.3;c.strokeText(ch,bx,by);
        const r=rng(ch.charCodeAt(0));c.globalAlpha=.50;
        for(let i=0;i<16;i++){const x=(r()-.5)*21,y=(r()-.5)*20;c.fillRect(x,y,.08+r()*.12,.28+r()*.85);}
        c.restore();
      }
      c.restore();
    }
    // 老莲外翻的瓣、花房和迎光的卷唇分别落色；折进花心的下半部留作铅粉底。
    c.save();refSpace8(c);
    const silhouette=path=>{
      if(!sil){c.save();c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.fillStyle='#000';c.fill(path);c.restore();}
      else c.fill(path);
    };
    const plate=(name,alpha,path)=>{if(blk===name){c.save();c.globalAlpha=alpha;c.fill(path);c.restore();}};
    const inkPath=(path,width,alpha=.75)=>{if(line){c.save();c.globalAlpha=alpha;c.lineWidth=width;c.stroke(path);c.restore();}};
    const stemPath=Pth8('M148 347 C153 379 176 424 203 450 L215 442 C181 408 164 367 162 344Z');
    silhouette(stemPath);plate('green',.68,stemPath);plate('yellow',.50,stemPath);inkPath(stemPath,1.2);
    paint('lotus',()=>{c.fillStyle=tonal8(c,[155,366,193,408],[[0,'#81975a'],[.6,'#759161'],[1,'#697b47']]);c.globalAlpha=.55;c.fill(stemPath);});
    if(line){c.save();c.clip(stemPath);c.globalAlpha=.45;const rnd=rng(8362);for(let j=0;j<610;j++){const x=147+rnd()*74,y=347+rnd()*105;c.beginPath();c.ellipse(x,y,.7,.95,-.4,0,7);c.fill();}c.restore();}
    const bloomPetal=(d,tip,root,bend=1,veins=[])=>{
      const p=Pth8(d);silhouette(p);light('lotus',()=>{c.fillStyle='#fff5df';c.fill(p);});
      paint('lotus',()=>{
        c.clip(p);
        c.fillStyle=tonal8(c,[...tip,...root],[[0,'#e2615c'],[.2,'#ec8981'],[.44,'#f7b8ad'],[.66,'#fde8dd'],[.83,'#eee5cf'],[1,'#b5b893']]);c.fill(p);
        const dx=root[0]-tip[0],dy=root[1]-tip[1],l=Math.hypot(dx,dy)||1;
        const ex=tip[0]+.48*dx,ey=tip[1]+.48*dy;
        blush8(c,ex+dy/l*13*bend,ey-dx/l*13*bend,24,35,[[0,'rgba(255,252,233,.58)'],[1,'rgba(255,249,231,0)']]);
        c.lineCap='round';
        for(const [v,w] of veins){c.strokeStyle='rgba(183,107,94,.28)';c.lineWidth=w;c.stroke(Pth8(v));}
      });
      inkPath(p,1.45,.75);
    };
    bloomPetal('M57 300 C76 257 112 246 145 250 C181 245 222 246 239 266 C262 289 256 321 239 344 C219 366 176 376 145 370 C104 370 68 345 57 300Z',[230,258],[150,373],-1);
    bloomPetal('M239 262 C247 266 250 278 250 292 C252 312 240 331 224 343 Q214 352 197 355 C215 337 214 310 219 291 C225 278 233 273 239 262Z',[241,264],[208,351],-1);
    bloomPetal('M60 309 C59 285 56 254 65 241 C67 235 74 232 77 225 C80 232 84 229 87 231 C89 228 94 228 97 225 C95 234 105 237 103 250 C107 277 97 299 87 320Z',[80,228],[84,313]);
    bloomPetal('M91 295 C84 264 104 250 112 244 L117 240 Q120 249 125 248 C136 259 134 284 120 312Z',[115,241],[114,311]);
    bloomPetal('M139 279 C139 255 145 231 159 225 C167 222 174 224 179 216 C181 223 188 229 199 234 C212 247 216 268 203 290 L179 310Z',[180,218],[176,306],-1);
    bloomPetal('M199 298 C196 273 203 252 217 247 Q223 243 228 237 C230 247 246 249 244 265 Q249 287 229 311Z',[227,239],[219,310],-1);
    bloomPetal('M110 284 C111 263 128 252 141 240 C147 247 156 245 164 254 C180 271 174 301 161 319 L121 331Z',[140,242],[150,316]);
    bloomPetal('M65 250 C71 257 87 260 90 273 C94 285 81 302 87 322 L112 355 C87 352 68 331 63 307 C58 287 57 264 65 250Z',[64,252],[99,347],-1);
    const bowl=Pth8('M82 285 C98 266 124 260 151 260 C173 260 186 272 183 290 C179 305 160 328 143 337 C118 333 89 312 82 285Z');
    silhouette(bowl);plate('yellow',.75,bowl);plate('green',.30,bowl);inkPath(bowl,1.0);
    const seedTop=Pth8('M94 280 C104 269 127 266 153 267 C171 267 179 274 177 282 C172 294 146 298 119 294 C106 293 97 289 94 280Z');
    silhouette(seedTop);plate('yellow',.51,seedTop);plate('green',.52,seedTop);inkPath(seedTop,1.3);
    paint('lotus',()=>{c.globalAlpha=.75;c.fillStyle='#889169';c.fill(seedTop);});
    if(line){const rnd=rng(8144);c.save();c.clip(seedTop);for(let j=0;j<4;j++)for(let i=0;i<6;i++){const x=99+i*14+(j%2)*4+rnd()*2.6,y=268+j*7+rnd()*2;
      c.globalAlpha=.66;c.lineWidth=1.55;c.beginPath();c.ellipse(x,y,3.1,1.85,.15,0,7);c.stroke();c.globalAlpha=.38;c.fill();}c.restore();}
    const antherRand=rng(8434);
    for(let j=0;j<55;j++){const a=Math.PI*2*j/55,rx=45+antherRand()*4,ry=16+antherRand()*4,dx=Math.cos(a),dy=Math.sin(a),x=136+dx*rx,y=281+dy*ry;
      const end=[x+dx*(1+antherRand()*3),y-1.3+dy*(1+antherRand()*3)];
      strokeIf('yellow',2.6,[[x-2*dx,y-2*dy],end],.95);if(line){c.save();c.globalAlpha=.57;K([[x-dx,y-dy],end],.8);c.restore();}
      if(blk==='a:cloth'){c.fillStyle=j%4?'#e6b743':'#f6d46f';c.beginPath();c.ellipse(...end,1.25,1.9,dx*.3,0,7);c.fill();}}
    bloomPetal('M51 397 C64 378 92 371 111 364 C129 358 146 349 158 341 C165 368 161 396 147 411 C130 423 103 422 82 415 L53 405 C48 404 48 400 51 397Z',[59,399],[151,369],-1);
    bloomPetal('M73 394 Q72 402 62 401 C72 411 91 417 104 419 C89 414 80 403 73 394Z',[66,400],[103,417],1);
    bloomPetal('M27 318 C33 319 38 312 53 311 C78 307 94 316 111 332 Q131 351 152 345 C145 364 121 379 94 378 C66 379 48 365 41 348 C35 334 36 326 27 318Z',[29,317],[137,357],-1,
        [['M39 323 Q42 345 56 360',.9]]);
    bloomPetal('M61 292 C62 274 62 263 65 248 C72 257 83 256 88 266 C95 282 76 300 86 324 Q98 343 122 350 C108 356 86 348 72 335 C61 323 58 309 61 292Z',[65,249],[111,347]);
    bloomPetal('M79 293 C79 278 85 259 94 253 C99 247 103 246 106 241 C106 252 124 257 125 271 C124 284 115 298 119 313 C123 325 132 336 140 342 C120 349 106 340 93 328 C82 318 78 306 79 293Z',[104,242],[128,343],1);
    bloomPetal('M95 286 C99 273 107 266 112 270 C116 280 133 284 138 295 C149 319 145 337 163 357 C145 364 129 358 115 347 C99 331 89 310 95 286Z',[110,270],[158,357],-1);
    bloomPetal('M149 304 C151 286 168 273 175 255 C182 262 198 264 199 280 C203 303 190 318 193 339 Q194 355 207 366 C182 372 161 364 153 350 C147 337 145 317 149 304Z',[176,256],[186,360],-1);
    bloomPetal('M159 351 C171 353 181 347 190 342 Q207 357 223 352 Q217 374 235 386 C243 393 247 398 248 405 C222 418 197 407 181 394 C166 382 160 365 159 351Z',[236,402],[166,354],1);
    // 荷叶的主脉从鱼身下向左伸，分脉微弯并渐隐在卷边里。
    const leaf=Pth8('M301 421 C286 418 278 411 267 416 Q256 422 247 419 Q237 417 231 424 Q225 428 219 425 Q208 423 199 433 Q189 438 184 435 Q175 437 166 445 Q153 449 144 447 Q134 453 127 451 Q111 451 115 459 C107 460 100 472 103 483 Q104 494 111 489 Q114 491 110 498 C99 494 93 507 96 518 C91 530 95 550 102 554 Q111 557 108 562 C97 568 102 576 98 583 Q96 595 105 598 Q106 607 118 611 Q132 619 143 616 Q147 622 153 618 Q165 626 175 622 Q189 630 199 622 Q204 617 212 620 Q217 617 223 621 Q235 629 243 628 Q249 638 261 634 Q274 643 285 639 Q298 641 307 633 Q315 638 320 631 Q326 625 331 631 Q338 637 345 631 Q357 638 367 628 Q377 628 379 620 Q392 617 395 609 L410 563 L389 489Z');
    silhouette(leaf);plate('green',.78,leaf);plate('yellow',.53,leaf);inkPath(leaf,1.35,.71);
    const veins=[
      [[311,501],[276,457],[251,420]],[[312,501],[271,471],[225,432]],[[313,502],[273,477],[222,462],[164,451]],
      [[313,502],[268,486],[216,471],[160,461],[110,463]],[[310,505],[261,505],[204,506],[151,511],[101,519]],
      [[303,526],[263,539],[213,551],[158,566],[106,591]],[[289,540],[263,569],[235,599],[215,622]],
      [[278,557],[257,595],[244,628]],[[239,587],[259,612],[272,638]],[[241,588],[213,603],[183,624]],
      [[311,562],[327,593],[335,624]],[[310,564],[342,583],[374,610]],[[340,592],[357,616],[361,636]]];
    paint('cloth',()=>{
      c.save();c.clip(leaf);
      const wash=c.createRadialGradient(267,508,15,219,526,153);
      for(const [n,col] of [[0,'#1e5943'],[.46,'#306748'],[.74,'#688552'],[.89,'#a1a669'],[1,'#d5c393']])wash.addColorStop(n,col);
      c.fillStyle=wash;c.fill(leaf);
      for(const [x,y,rx,ry] of [[135,462,81,23],[104,528,60,65],[146,600,56,38],[255,638,81,30],[353,630,49,22]]){
        blush8(c,x,y,rx,ry,[[0,'rgba(214,188,117,.80)'],[.55,'rgba(197,179,108,.40)'],[1,'rgba(218,191,121,0)']]);}
      c.restore();
    });
    if(blk==='a:cloth'||line){
      c.save();c.clip(leaf);const colored=!line;
      if(colored){
        const g=c.createRadialGradient(265,512,12,237,525,159);
        for(const [n,col] of [[0,'rgba(42,93,66,.72)'],[.44,'rgba(43,104,76,.84)'],[.71,'rgba(89,128,85,.88)'],[.91,'rgba(176,179,111,.9)'],[1,'rgba(204,187,132,.95)']])g.addColorStop(n,col);
        c.fillStyle=g;c.fill(leaf);
        for(const [x,y,rx,ry] of [[136,451,87,30],[102,521,31,60],[154,615,80,25],[257,638,73,23],[350,630,54,18]])
          blush8(c,x,y,rx,ry,[[0,'rgba(219,197,141,.82)'],[1,'rgba(215,193,137,0)']]);
      }
      const strokeLeaf=(q,w,col)=>{c.fillStyle=col;kline(c,q,w,{ti:.06,to:.58,sw:.16,n:Math.max(15,q.length*7)});};
      for(const [idx,main] of veins.entries()){
        const path=curvePts(main,49);
        if(colored){strokeLeaf(main,3.4,'rgba(33,74,49,.67)');strokeLeaf(main.map(([x,y])=>[x,y-1.4]),1.8,'rgba(107,159,136,.92)');}
        else{c.globalAlpha=.34;strokeLeaf(main,1.15,'#000');}
        for(let j=4;j<46;j+=3){
          const a=path[j],b=path[j+1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;
          const vx=dx/l,vy=dy/l,t=j/48;
          for(const side of [-1,1]){
            const span=(idx===3||idx===4||idx===5?34:13)*(1-.46*t)*(1+.16*Math.sin(j*1.5+idx+side));
            const end=[a[0]+vx*(9+span*.58)-vy*side*span,a[1]+vy*(9+span*.58)+vx*side*span];
            const mid=[a[0]+vx*9-vy*side*span*.58,a[1]+vy*9+vx*side*span*.58];
            const q=[[a[0]+vx*1.5-vy*side*2.4,a[1]+vy*1.5+vx*side*2.4],mid,end];
            if(colored){strokeLeaf(q,2.05,'rgba(34,83,54,.86)');strokeLeaf(q.map(([x,y])=>[x+.2,y-1.4]),1.65,'rgba(125,179,150,.92)');}
            else strokeLeaf(q,.70,'#000');
          }
        }
      }c.restore();
    }
    c.restore();
    // 裤腿压在荷叶上，鞋尖从裤褶底下露出。两只鞋一正一斜，落在不同的高度。
    c.save();c.translate(...RP8(0,0));c.scale(RP8K.k,RP8K.k);
    const drawShoe=(sole,upper,welting,embroidery)=>{
      const base=loop8(sole),vamp=loop8(upper);
      shape(base);KC(base,1.65);
      paint('cloth',()=>gradFill(base,0,sole[0][1],0,sole[3][1],[[0,'rgba(160,125,93,.18)'],[1,'rgba(255,248,220,0)']]));
      shape(vamp);fill('red',0.98,vamp);KC(vamp,1.8);
      const low=Math.max(...upper.map(q=>q[1]));
      paint('cloth',()=>gradFill(vamp,0,low-38,0,low,[[0,'rgba(175,30,42,.05)'],[1,'rgba(108,38,39,.52)']]));
      c.save();path8(c,vamp);c.clip();
      if(blk==='a:cloth'){
        gradFill(vamp,0,low-32,0,low,[[0,'rgba(206,64,56,.78)'],[.70,'rgba(169,45,44,.84)'],[1,'rgba(119,42,44,.77)']]);
      }
      for(const stitches of [welting,...embroidery]){
        const p=curvePts(stitches,stitches.length*7);
        cutIf('red',3.5,p);strokeIf('yellow',4.5,p);K(p,.68,{ti:.16,to:.24});
        if(blk==='a:cloth'){c.fillStyle='#bb7b30';kline(c,stitches,3.9,{ti:.09,to:.16});c.fillStyle='#f2bc51';kline(c,stitches.map(([x,y])=>[x,y-.7]),2.45,{ti:.13,to:.21});}
      }
      c.restore();
    };
    drawShoe(
      [[638,567],[671,557],[703,554],[719,567],[729,584],[732,597],[727,601],[707,604],[683,608],[661,607],[640,601],[632,588]],
      [[636,565],[673,552],[702,552],[717,563],[726,577],[730,591],[716,593],[699,596],[679,601],[658,600],[636,593]],
      [[640,586],[662,593],[682,595],[699,587],[715,584],[729,586]],
      [[[676,590],[679,578],[682,568],[691,568],[702,567],[707,577],[704,584],[686,587],[686,577],[695,575],[696,581]],
       [[713,568],[715,577],[724,581]]]);
    // 近脚从收拢的裤脚下露出来。
    drawShoe(
      [[343,578],[369,561],[396,562],[414,574],[416,590],[411,607],[399,617],[381,627],[376,628],[369,618],[356,615],[344,603]],
      [[343,577],[367,558],[398,561],[409,571],[409,588],[404,601],[393,611],[377,617],[372,622],[365,613],[355,611],[346,602]],
      [[349,597],[361,605],[370,611],[376,608],[386,604],[399,600],[405,587]],
      [[[376,602],[372,592],[381,580],[389,578],[399,584],[397,593],[391,600],[380,595],[384,587],[391,586],[392,591]],
       [[356,599],[359,593],[365,594],[368,602]]]);

    const trouser=(outline,folds,hem,braid)=>{
      const pts=loop8(outline);shape(pts);fill('blue',.83,pts);fill('green',.13,pts);KC(pts,1.8);
      const low=Math.max(...outline.map(q=>q[1]));
      paint('cloth',()=>gradFill(pts,0,low-96,0,low,[[0,'rgba(71,122,163,.5)'],[.56,'rgba(130,192,203,.08)'],[.85,'rgba(67,130,161,.15)'],[1,'rgba(58,106,148,.45)']]));
      c.save();path8(c,pts);c.clip();
      for(const fold of folds){
        paint('cloth',()=>{c.fillStyle='rgba(47,101,146,.32)';kline(c,fold,8,{ti:.38,to:.45,sw:.15});});
        K(fold,.85,{ti:.35,to:.45,sw:.1});
      }
      if(blk==='a:cloth'){
        gradFill(pts,0,low-100,13,low,[[0,'rgba(90,154,182,.67)'],[.55,'rgba(115,180,204,.63)'],[.81,'rgba(113,177,200,.66)'],[1,'rgba(73,136,164,.70)']]);
        for(const q of folds){
          c.fillStyle='rgba(41,102,143,.30)';kline(c,q,6,{ti:.35,to:.58,sw:.15});
          c.fillStyle='rgba(169,209,211,.35)';kline(c,q.map(([x,y])=>[x,y-2.3]),2.7,{ti:.36,to:.48,sw:.16});
        }
      }
      const band=loop8(hem);shape(band);fill('red',.55,band);fill('blue',.86,band);KC(band,1.6);
      c.save();path8(c,band);c.clip();
      if(blk==='a:cloth'){
        c.fillStyle='#66476b';polyFill(c,band);
        const flowerCenters=hem[0][0]>500?[[624,526,-.4],[644,518,-.37],[663,509,-.4],[678,506,-.5]]:[[320,580,-.91],[333,566,-.73],[347,553,-.83],[359,541,-.87]];
        for(const [cx,cy,a] of flowerCenters){
          c.save();c.translate(cx,cy);c.rotate(a);
          for(let j=0;j<5;j++){const angle=j*Math.PI*2/5+.12;
            c.save();c.rotate(angle);c.fillStyle=j%2?'#d7b6c2':'#eac9d0';
            c.beginPath();c.moveTo(0,-.6);c.bezierCurveTo(-2.2,-2.1,-4.7,-5,-2.9,-6.1);c.quadraticCurveTo(-1.4,-7.2,0,-5.9);c.quadraticCurveTo(2.6,-6.9,2.6,-4.8);c.quadraticCurveTo(2.8,-2.5,0,-.6);c.fill();c.restore();}
          c.fillStyle='#edca8a';c.beginPath();c.arc(0,0,1.55,0,7);c.fill();c.restore();
        }
      }
      for(const stitch of braid){
        const p=curvePts(stitch,26);cutIf('blue',3.0,p);cutIf('red',2.8,p);strokeIf('yellow',2.4,p,.82);
        if(blk==='a:cloth'){c.fillStyle='#d2ad9c';kline(c,stitch,1.65,{ti:.28,to:.35});}
      }
      c.restore();c.restore();
    };
    trouser(
      [[527,438],[574,419],[630,412],[660,430],[672,456],[680,488],[685,515],[692,537],[700,545],[713,550],[716,558],[711,565],[697,567],[676,568],[665,580],[647,593],[627,603],[610,603],[597,600],[584,586],[570,560],[547,537],[522,501]],
      [[[679,515],[658,530],[632,537],[611,550]],[[706,549],[682,548],[655,554],[626,557],[610,554]],[[670,568],[650,574],[633,586],[607,593],[588,577]]],
      [[607,510],[643,501],[677,494],[682,501],[685,518],[680,523],[652,530],[627,540],[604,541]],
      [[[637,532],[648,526],[658,524],[662,520],[658,515],[653,515],[652,520],[657,519]],[[665,519],[667,513],[674,508],[680,511],[679,516],[674,516]],[[650,511],[660,509],[668,505],[678,501]]]);
    trouser(
      [[304,477],[339,452],[380,440],[432,446],[477,474],[472,508],[440,548],[409,569],[389,578],[374,581],[360,595],[351,600],[339,601],[323,603],[303,610],[286,611],[266,608],[248,601],[231,591],[229,580],[241,556],[265,528],[287,501]],
      [[[391,541],[380,560],[359,581],[343,595]],[[316,562],[303,583],[289,596],[266,601]],[[407,548],[396,562],[386,574]]],
      [[348,535],[358,531],[374,542],[362,553],[349,563],[330,580],[311,594],[309,590],[314,572],[330,553]],
      [[[312,587],[320,576],[324,577],[327,573],[324,569],[324,566],[333,563],[336,557]],[[330,572],[340,566],[343,559],[339,558],[339,554],[348,549],[352,545]],[[351,555],[356,551],[358,545],[365,542]]]);
    c.restore();
  }

  // 衣褶、指尖、五官用同一把尺。远手藏在鱼后，三截指尖翻到鳃盖前。
  c.save();refSpace8(c);
  const contour=(knots)=>loop8(knots,6);
  const ink=(pts,alpha=1)=>{
    if(!line)return;
    c.save();c.globalAlpha=alpha;polyFill(c,pts);c.restore();
  };
  const stroke=(points,w,col)=>{
    c.fillStyle=col;kline(c,points,w,{ti:.23,to:.39,sw:.12});
  };
  const skinForm=(pts,cx,cy,rx,ry)=>{
    shape(pts);
    light('face',()=>{c.fillStyle='rgba(255,251,239,.72)';polyFill(c,pts);});
    paint('face',()=>{
      c.save();path8(c,pts);c.clip();
      blush8(c,cx,cy,rx,ry,[[0,'rgba(247,212,178,.03)'],[.58,'rgba(246,192,150,.12)'],[.84,'rgba(232,152,116,.43)'],[1,'rgba(210,115,98,.57)']]);
      c.restore();
    });
  };
  const fleshLine=(points,w=1.35)=>{
    if(line){c.save();c.globalAlpha=.69;K(points,w,{ti:.27,to:.39,sw:.14});c.restore();}
  };
  const cloth=(outline,folds,shade)=>{
    const pts=contour(outline);shape(pts);fill('green',.40,pts);fill('yellow',.065,pts);
    paint('cloth',()=>{
      gradFill(pts,...shade,[[0,'rgba(236,237,184,.15)'],[.44,'rgba(150,193,152,.18)'],[.8,'rgba(83,150,124,.32)'],[1,'rgba(41,99,90,.55)']]);
      c.save();path8(c,pts);c.clip();
      for(const [curve,width] of folds){
        // 同一褶由暗到浅向受光面退，让隆起的衣料有圆度。
        for(const [spread,alpha] of [[2.1,.038],[1.75,.045],[1.44,.065],[1.12,.081],[.83,.105],[.51,.11]]){
          stroke(curve.map(([x,y])=>[x-width*spread*.11,y-width*spread*.10]),width*spread,`rgba(47,102,87,${alpha})`);
        }
      }
      c.restore();
    });
    if(blk==='a:cloth'){
      gradFill(pts,...shade,[[0,'rgba(143,199,166,.33)'],[.51,'rgba(153,206,172,.35)'],[1,'rgba(111,175,146,.24)']]);
      c.save();path8(c,pts);c.clip();
      for(const [q,w] of folds){stroke(q.map(([x,y])=>[x-w*.32,y-w*.29]),w*.48,'rgba(194,218,181,.21)');}if(outline[0][0]===509){const collar=[[515,254],[516,271],[516,289],[513,312],[506,336],[503,348],[505,356]],elbow=[[505,357],[516,347],[530,341],[544,332],[555,320],[563,316]];
       for(const [w,a] of [[18,.11],[13,.14],[9,.18],[5,.14]]){stroke(collar,w,'rgba(47,102,87,'+(a*.93)+')');stroke(elbow,w*.73,'rgba(47,102,87,'+(a*.76)+')');}}
      c.restore();
    }
    KC(pts,1.46);
    for(const [curve] of folds){if(line){c.save();c.globalAlpha=.63;K(curve,1.05,{ti:.26,to:.53,sw:.12});c.restore();}}
  };
  const binding=(outline)=>{
    const p=contour(outline);shape(p);fill('red',.90,p);KC(p,1.2);
    if(blk==='a:cloth'){c.save();c.fillStyle='rgba(225,96,77,.52)';polyFill(c,p);c.restore();}
    paint('cloth',()=>gradFill(p,0,360,0,435,[[0,'rgba(241,122,83,.2)'],[1,'rgba(139,52,58,.36)']]));
  };
  // 深靛地织金，花枝随领口与袖口转折。金粉在染衣这一遍落，轮廓仍由墨线版收住。
  const brocade=(outline,sprigs)=>{
    const p=contour(outline);shape(p);fill('blue',.88,p);fill('red',.36,p);fill('green',.22,p);
    paint('cloth',()=>gradFill(p,525,345,562,418,[[0,'rgba(70,53,129,.67)'],[.48,'rgba(79,59,137,.71)'],[1,'rgba(54,58,115,.75)']]));
    KC(p,1.4);
    if(blk!=='a:cloth')return;
    c.save();path8(c,p);c.clip();c.globalAlpha*=.82;
    gradFill(p,outline[0][0],outline[0][1],outline[4][0],outline[4][1],[[0,'rgba(49,49,113,.79)'],[.55,'rgba(50,57,134,.72)'],[1,'rgba(40,51,113,.82)']]);
    for(const [x,y,angle,size] of sprigs){
      c.save();c.translate(x,y);c.rotate(angle);c.scale(size,size);
      stroke([[-18,4],[-11,-1],[-4,1],[3,0],[11,-6],[14,-12]],1.2,'#dcbd7a');
      stroke([[-8,0],[-8,-4],[-12,-8],[-15,-7]],.85,'#e1ca92');
      stroke([[3,0],[9,4],[15,3],[16,0],[13,0]],.9,'#dbb77c');
      for(const [lx,ly,a] of [[-16,4,.12],[-12,1,-.72],[-8,1,.82],[-8,-4,-2],[-6,1,1.1],[0,1,-1.3],[4,0,.8],[7,-3,-1.65],[9,-5,.25],[12,-8,-1.7],[15,3,.3]]){
        c.save();c.translate(lx,ly);c.rotate(a);c.fillStyle='#d9bd82';
        c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(1.5,-2.4,5.2,-.7);c.quadraticCurveTo(3,1.4,0,0);c.fill();c.restore();
      }
      for(const [fx,fy,r] of [[-13,-8,2.25],[12,-11,1.75]]){
        for(let j=0;j<5;j++){const a=.4+j*2*Math.PI/5;c.fillStyle=j%2?'#efd69a':'#d3a767';c.beginPath();c.ellipse(fx+Math.cos(a)*r,fy+Math.sin(a)*r,r*.78,r*.48,a,0,2*Math.PI);c.fill();}
        c.fillStyle='#bc7c57';c.beginPath();c.arc(fx,fy,.82,0,2*Math.PI);c.fill();
      }
      c.restore();
    }
    c.restore();
  };

  const farHand=(tipsOnly=false)=>{
    c.save();
    const p=window.palmPosition8||0;
    const lift=smooth(0,.22,p)*(1-smooth(.23,.64,p)),relax=smooth(.21,.94,p);
    c.translate(253,419);c.rotate(-.09*lift+.11*relax);c.scale(1,1-.026*relax);c.translate(-253,-419);
    let fingerIndex=0;
    const hand=contour([[247,418],[255,412],[272,416],[286,426],[289,435],[287,448],[290,455],[288,466],[282,476],[274,483],[267,482],[260,476],[256,468],[253,459],[249,451],[246,439],[241,430]]);
    if(!tipsOnly){skinForm(hand,256,428,42,55);fleshLine(hand.concat([hand[0]]),1.45);}
    // 指根连着掌，三个指尖由低到高向鱼身翻。小弯线各自止在指侧。
    for(const [tip,wrinkle,nail] of [
      [[[251,450],[248,443],[249,436],[252,433],[257,433],[261,437],[261,441],[257,447],[255,453]],
       [[250,446],[254,445],[257,446]],[[249.8,436.8],[250.3,434.9],[252.5,434.5],[254.3,436.7],[254,438],[251,438.1]]],
      [[[256,466],[253,460],[253,453],[256,447],[260,441],[264,441],[269,444],[270,448],[266,454],[263,459],[262,465]],
       [[256,458],[259,458],[262,459]],[[259.4,445.9],[260.5,443.6],[262.4,443.6],[264.2,445.8],[263.4,447],[260.8,446.6]]],
      [[[264,481],[259,474],[258,467],[261,460],[266,455.5],[271,455.5],[275.5,458.2],[276.6,462.6],[275.4,466.6],[279,470.5],[283,475],[280.5,481],[274.5,485],[268,484]],
       [[263,468],[267,467],[270,468]],[[267.6,458.4],[268.9,455.8],[271.1,456],[272.8,458.3],[271.6,459.2],[269.1,458.8]]]
    ]){
      const index=fingerIndex++; const pivots=[[254,452],[261,465],[270,478]],pivot=pivots[index];
      const fan=smooth(.22+index*.105,.72+index*.11,p);
      c.save();c.translate(...pivot);c.rotate(-[.74,.59,.33][index]*fan-.055*lift);c.translate(-pivot[0],-pivot[1]);
      const ptip=contour(tip);skinForm(ptip,tip[3][0],tip[3][1]+1,14,20);
      paint('face',()=>{gradFill(ptip,tip[3][0]+5,tip[3][1],tip[3][0]-5,tip[3][1]+14,[[0,'rgba(251,222,186,.06)'],[1,'rgba(229,150,104,.46)']]);});
      fleshLine(tip.slice(0,tip.length>12?10:tip.length),1.3);
      const n=contour(nail);light('face',()=>{c.fillStyle='rgba(255,252,244,.9)';polyFill(c,n);});
      paint('face',()=>{c.fillStyle='rgba(236,170,156,.22)';polyFill(c,n);});fleshLine(nail.concat([nail[0]]),.62);c.restore();
    }
    c.restore();
  };
  if(part==='back'){
    // 袄身从颈窝沿胸腹落下来，左肩绕到鱼后才见袖口。
    cloth([[334,268],[356,255],[385,254],[415,259],[461,241],[493,226],[522,237],[548,260],[569,299],[593,346],[611,391],[624,438],[610,460],[576,468],[541,461],[510,470],[465,487],[425,497],[384,493],[346,474],[315,447],[295,412],[298,364],[309,312]],
      [[[[356,291],[353,323],[343,353],[327,376]],11],[[[490,336],[472,362],[465,382]],7],[[[592,380],[574,388],[558,404]],9],[[[336,442],[372,468],[399,477]],10]],[388,299,577,456]);
    cloth([[357,258],[343,258],[327,264],[307,276],[290,291],[276,312],[266,338],[259,358],[247,380],[238,404],[237,420],[243,434],[250,440],[265,436],[283,431],[299,412],[309,395],[326,376],[339,357],[357,328],[369,295]],
      [[[[324,285],[307,303],[294,330],[280,346]],10],[[[247,384],[260,378],[273,366],[282,350]],9],[[[270,417],[274,397],[289,381]],10]],[272,322,318,421]);
    binding([[237,406],[241,402],[258,398],[276,401],[293,408],[290,422],[271,432],[252,441],[243,435],[238,423]]);
    brocade([[239,411],[249,405],[264,403],[277,406],[290,412],[286,423],[267,435],[253,442],[244,434],[240,423]],[[254,420,-.44,.72],[276,414,-.15,.65]]);
    farHand();
    const neck=contour([[358,268],[387,258],[465,241],[492,241],[491,274],[481,300],[471,321],[452,350],[443,358],[416,332],[394,318],[374,298]]);
    skinForm(neck,437,325,63,60);
    paint('face',()=>gradFill(neck,435,288,437,332,[[0,'rgba(170,107,82,.5)'],[.58,'rgba(210,140,106,.32)'],[1,'rgba(250,210,179,.03)']]));
    binding([[334,270],[349,261],[369,273],[393,303],[424,328],[452,355],[454,367],[443,378],[415,354],[380,329],[352,304]]);
    brocade([[345,266],[354,263],[369,275],[393,302],[423,327],[450,351],[447,363],[439,372],[418,353],[390,331],[366,313],[356,296]],
      [[367,292,.83,.73],[394,323,.69,.81],[422,345,.52,.72]]);
    binding([[491,225],[502,228],[512,240],[513,261],[511,296],[505,326],[497,345],[490,355],[477,368],[458,384],[439,389],[428,375],[443,352],[466,308]]);
    brocade([[491,229],[499,229],[502,244],[500,270],[497,295],[493,320],[486,342],[477,353],[457,371],[442,382],[430,372],[441,350],[454,326],[469,302],[481,275]],
      [[490,264,-1.12,.72],[482,298,-1.42,.88],[469,329,-1.0,1.0],[447,358,-.90,.87]]);
    // 从绳结拧出的三股短辫，末端散开；后脑的双髻先画，头轮廓将盖住鬓根。
    const braid=contour([[343,175],[343,190],[328,198],[314,200],[307,204],[296,209],[292,207],[296,199],[310,190],[322,183],[333,178]]);
    shape(braid);ink(braid);
    for(let i=0;i<6;i++){
      const x=300+i*6,y=204-i*3.1;
      light('face',()=>{c.fillStyle='rgba(115,99,82,.65)';kline(c,[[x-1,y+1],[x,y-3],[x+3,y-4]],1.05);});
      if(line){c.save();c.globalCompositeOperation='destination-out';K([[x-1,y+1],[x,y-2],[x+2,y-5]],.9,{ti:.25,to:.23});c.restore();}
    }
    for(let i=0;i<15;i++){
      const a=i/14;
      K([[297,200+a*7],[289,205+a*5],[278-8*a,207+11*a]],1.0,{ti:.05,to:.91,sw:.18});
    }
    for(const [p,w] of [
      [[[299,202],[285,212],[275,217],[265,219]],2.1],
      [[[297,201],[280,214],[268,219],[263,224]],2.4],
      [[[293,204],[284,211],[267,211],[254,213]],2.1],
      [[[290,204],[276,210],[261,212],[252,215]],1.5]
    ])strokeIf('red',w,curvePts(p,22));
    const tie=contour([[334,178],[343,175],[345,179],[341,195],[337,202],[332,199],[327,196],[329,185]]);
    shape(tie);fill('red',.96,tie);KC(tie,1.2);
    for(const [x,y,rx,ry,a] of [[516.5,177,18.5,18,-.45],[492.5,150.5,17.5,17,-.55]]){
      const h=arcPts(0,0,rx,ry,0,2*Math.PI,58).map(([u,v])=>[x+u*Math.cos(a)-v*Math.sin(a),y+u*Math.sin(a)+v*Math.cos(a)]);
      shape(h);ink(h);
      if(line){c.save();c.globalCompositeOperation='destination-out';
        for(let j=0;j<5;j++)K([[x-rx+1+j*1.5,y-4-j],[x-rx+j*1.2,y+4],[x-rx+6+j,y+11],[x-2+j,y+ry-3-j]],.7,{ti:.28,to:.34});
        c.restore();}
    }
    const ribbon=contour([[489,166.5],[494,164],[500,161.6],[505.5,159.4],[509,158.6],[511.6,160.8],[512.2,164.2],[507,166.6],[501,169.3],[495,172],[491,172.4],[488.6,169.6]]);
    shape(ribbon);fill('red',.95,ribbon);strokeIf('red',1.5,[[490.6,169.8],[500.5,165.4],[510.6,161.4]],.5);KC(ribbon,1.03);
    // 两耳各自起形。右耳位置高、贴着颊，左耳垂在近侧。
    for(const [outline,inside,shade] of [
      [[[367,248],[361,240],[353,237],[345,239],[343,246],[346,257],[351,264],[352,273],[360,281],[369,281],[373,276],[371,264]],
       [[[351,248],[355,246],[360,251],[361,258],[368,270]],[[353,249],[351,252],[354,259],[358,263]],[[359,253],[355,254],[356,259],[360,262]]],[356,258]],
      [[[491,216],[493,209],[499,205],[504,206],[508,213],[509,224],[512,234],[510,242],[512,250],[509,256],[503,259],[497,256],[493,249]],
       [[[497,220],[497,215],[500,213],[504,215],[504,221],[501,224]],[[497,222],[502,224],[504,232],[501,238],[498,241]],[[498,227],[500,231],[499,236]]],[505,233]]
    ]){
      const e=contour(outline);skinForm(e,...shade,17,31);
      paint('face',()=>gradFill(e,shade[0]-12,shade[1]-8,shade[0]+14,shade[1]+16,[[0,'rgba(247,172,116,.27)'],[1,'rgba(227,139,89,.39)']]));
      paint('face',()=>radFill(e,...shade,20,[[0,'rgba(221,131,100,.44)'],[1,'rgba(235,170,139,.09)']]));
      fleshLine(outline.concat([outline[0]]),1.65);for(const l of inside)fleshLine(l,1.55);
    }
    const face=contour([[337,199],[338,185],[343,172],[354,159],[367,149],[383,140],[398,135],[415,131],[433,131],[449,134],[464,140],[478,149],[489,162],[496,177],[498,191],[496,203],[492,212],[492,225],[495,239],[496,253],[492,268],[485,280],[475,290],[462,298],[449,306],[438,313],[424,315],[409,312],[394,308],[380,302],[369,292],[363,281],[359,268],[355,254],[352,243],[347,238],[342,237],[339,223]]);
    shape(face);
    light('face',()=>{c.fillStyle='rgba(255,252,244,.87)';polyFill(c,face);});
    paint('face',()=>{
      c.save();path8(c,face);c.clip();
      gradFill(face,378,167,447,308,[[0,'rgba(246,216,171,.20)'],[.47,'rgba(247,216,189,.02)'],[.78,'rgba(253,216,187,.06)'],[1,'rgba(228,156,120,.3)']]);
      // 剃青沿颅骨向额心散开；内侧保留白粉，不给脑袋勾一圈蓝边。
      blush8(c,422,258,100,126,[[0,'rgba(130,160,183,0)'],[.56,'rgba(130,160,183,0)'],[.76,'rgba(104,142,167,.35)'],[.90,'rgba(79,120,150,.72)'],[1,'rgba(74,109,131,.8)']]);
      gradFill(face,425,139,426,204,[[0,'rgba(95,132,155,.48)'],[.62,'rgba(122,153,171,.16)'],[1,'rgba(154,173,184,0)']]);
      const rand=rng(8152);c.fillStyle='rgba(71,94,110,.15)';
      for(let j=0;j<1600;j++){const x=335+rand()*169,y=130+rand()*111,edge=Math.hypot((x-422)/100,(y-258)/126);
        if(edge>.78&&y<236&&rand()<(edge-.69)*2)c.fillRect(x,y,rand()*.7+.18,.62);}
      // 两边腮肉在不同的面上，留出鼻头、唇周和下颌的铅粉。
      for(const [x,y,rx,ry] of [[381,263,44,36],[480,250,39,35]]){
        blush8(c,x,y,rx,ry,[[0,'rgba(225,89,90,.73)'],[.42,'rgba(235,109,108,.63)'],[.75,'rgba(243,138,124,.38)'],[1,'rgba(247,169,140,0)']]);
      }
      blush8(c,364,277,28,37,[[0,'rgba(241,153,99,.45)'],[1,'rgba(245,181,142,0)']]);
      blush8(c,487,247,22,40,[[0,'rgba(242,154,99,.41)'],[1,'rgba(246,184,146,0)']]);
      blush8(c,426,314,60,17,[[0,'rgba(230,135,82,.58)'],[.55,'rgba(244,168,111,.49)'],[1,'rgba(248,192,145,0)']]);
      const orbits=[
        ['M365 233 C373 224 386 217 401 217 C414 222 422 236 422 248 C419 256 410 261 402 266 C400 252 379 248 365 245Z',397,238,37,28],
        ['M433 246 C429 231 437 216 446 210 C454 207 470 208 481 211 C479 227 468 242 446 251 L443 257Z',451,231,27,28]
      ];
      for(const [d,x,y,rx,ry] of orbits){
        c.save();c.clip(Pth8(d));blush8(c,x,y+1,rx,ry,[[0,'rgba(193,123,73,.35)'],[.42,'rgba(223,143,84,.29)'],[.73,'rgba(244,176,115,.19)'],[1,'rgba(252,203,160,0)']]);c.restore();
      }
      blush8(c,394,249,25,7,[[0,'rgba(196,97,85,.28)'],[1,'rgba(233,139,117,0)']]);
      blush8(c,459,235,22,8,[[0,'rgba(189,103,85,.25)'],[1,'rgba(231,149,123,0)']]);
      blush8(c,425,269,13,6,[[0,'rgba(232,157,113,.46)'],[1,'rgba(236,180,143,0)']]);
      blush8(c,435,299,7,5,[[0,'rgba(226,143,92,.59)'],[1,'rgba(246,175,123,0)']]);
      c.restore();
    });
    // 外缘依次消失在近耳、远耳，耳道和脸颊不被整圈黑线割开。
    fleshLine([[342,237],[337,216],[337,198],[341,177],[353,159],[374,145],[401,134],[426,131],[449,134],[473,147],[488,162],[496,181],[498,195],[494,208]],2.0);
    fleshLine([[355,252],[361,272],[366,286],[378,300],[395,307],[411,312],[425,315],[438,313],[456,303],[476,290],[490,275],[496,255],[495,239]],1.65);
    // 近耳的耳廓翻到颊前，耳根顺着脸消失；头先落墨，耳垂再压其上。
    const nearEar=contour([[357,241],[351,239],[346,239],[343,242],[343,248],[345,254],[349,261],[351,269],[353,278],[359,281],[365,281],[369,278],[367,270],[361,255]]);
    skinForm(nearEar,350,249,24,39);
    paint('face',()=>gradFill(nearEar,346,240,368,278,[[0,'rgba(241,180,126,.41)'],[.55,'rgba(228,159,111,.51)'],[1,'rgba(234,164,128,.62)']]));
    fleshLine([[358,242],[352,239],[346,240],[343,244],[344,251],[348,259],[351,266],[352,275],[356,280],[361,281],[366,280],[369,277]],1.7);
    fleshLine([[352,249],[354,247],[358,249],[360,253],[359,258],[361,264],[365,269]],1.65);
    fleshLine([[353,250],[352,254],[355,259],[358,262]],1.2);
    fleshLine([[359,252],[356,253],[356,257],[360,262]],1.05);
    const fringe=contour([[377,171],[380,160],[385,155],[397,151],[412,149],[424,150],[433,153],[439,158],[442,163],[434,161],[420,163],[405,167],[389,170],[381,172]]);
    shape(fringe);ink(fringe);
    if(line){
      const r=rng(8229);
      for(let j=0;j<33;j++){
        const v=j/32,arch=Math.sin(Math.PI*v),x=377+65*v,y=173-8*v-2.3*arch;
        K([[x+.8-3*v,y-5],[x+1.5*v,y],[x-1.5+3.8*v,y+2.1+r()*2.7]],1.36,{ti:.02,to:.95});
      }
      c.save();c.globalCompositeOperation='destination-out';
      for(let j=1;j<23;j++){
        const v=j/23,x=377+65*v,y=173-8*v-2.3*Math.sin(Math.PI*v);
        K([[x-1.3+3*v,y+4],[x-1+2*v,y],[x-1.5*v,y-2-r()*2.6]],.88,{ti:0,to:.94,sw:.04});
      }
      c.restore();
      for(const side of [-1,1])for(let j=0;j<28;j++){
        const a=j/27,frac=Math.sin(a*Math.PI),jitter=(r()-.5)*2;
        const x=side<0?336+16*Math.pow(1-a,2):472+24*a;
        const y=side<0?161+53*a:146+52*a;
        K([[x,y],[x-side*(2+4*frac),y+2+jitter],[x-side*(4+6*frac+r()*3),y+3+r()*3]],.94,{ti:.10,to:.94});
      }
    }
    // 鼻根渐隐，鼻翼下缘和唇上人中用一口暖墨相接。
    paint('face',()=>{
      stroke([[405,219],[413,226],[419,237],[420,245],[419,253]],2.15,'rgba(188,122,71,.29)');
      stroke([[447,210],[439,217],[433,230],[432,242],[435,250]],2.45,'rgba(190,120,66,.33)');
      stroke([[416,254],[412,258],[412,264],[418,267],[424,266]],3.1,'rgba(206,129,85,.55)');
      stroke([[441,250],[446,252],[447,256],[445,260],[440,262],[434,262]],2.8,'rgba(201,127,81,.42)');
      blush8(c,426,266,13,5,[[0,'rgba(239,160,103,.49)'],[1,'rgba(242,186,140,0)']]);
      stroke([[428,268],[429,273],[431,276],[432,276],[432,270]],2.1,'rgba(189,118,78,.66)');
    });
    fleshLine([[416,254],[412,257],[411,262],[413,266],[417,267],[421,267],[425,266]],1.09);
    fleshLine([[426,267],[430,267],[433,266],[436,263],[443,262],[449,259],[449,255],[446,252],[442,251]],1.19);
    fleshLine([[428,268],[429,273],[431,276],[432,276],[432,270]],.92);
    for(const [x,y,r] of [[423,210,3.05],[425.5,218.8,2.65]])dot('red',x,y,r,.94);
    // 鬓花有向外翻的瓣，嫩叶压在发髻后，花心用黄点收住。
    for(const pts of [
      [[513,135],[509,126],[509,120],[515,118],[520,123],[521,131]],
      [[544,147],[551,137],[557,137],[562,141],[560,145],[566,148],[561,153],[552,151]],
      [[542,163],[552,163],[558,167],[553,174],[544,173],[538,169]]
    ]){const p=contour(pts);shape(p);fill('green',.70,p);fill('yellow',.42,p);KC(p,1.1);K([pts[0],pts[2],pts[3]],.6);}
    for(const [cx,cy,rx,ry,tilt] of [[519,137,12,10,-.5],[524,128,9,9,.2],[537,131,10,8,.3],[544,141,10,9,.6],[545,152,10,9,.2],[533,155,11,8,0],[521,148,10,7,-.5],[527,142,8,6,-.45],[538,146,7,6,.2]]){
      const ring=contour([[-.91,-.1],[-1,-.67],[-.49,-1],[-.05,-.89],[.44,-.91],[.95,-.47],[.94,0],[.64,.56],[.17,.99],[-.5,.72]].map(([u,v])=>[cx+rx*u*Math.cos(tilt)-ry*v*Math.sin(tilt),cy+rx*u*Math.sin(tilt)+ry*v*Math.cos(tilt)]));
      shape(ring);light('lotus',()=>{c.fillStyle='rgba(255,247,224,.82)';polyFill(c,ring);});
      paint('lotus',()=>gradFill(ring,cx-2,cy-ry,cx+2,cy+ry,[[0,'rgba(243,144,131,.12)'],[.58,'rgba(239,127,120,.48)'],[1,'rgba(206,74,73,.85)']]));
      KC(ring,1.05);
    }
    for(let j=0;j<12;j++){const a=j*2.4,rr=1+Math.sqrt(j)*1.1;const x=534+Math.cos(a)*rr,y=139+Math.sin(a)*rr*.68;dot('yellow',x,y,1.35);if(j%3===0)K([[x,y+1.1],[x+.3,y-.35]],.75);}
  }else{
    cloth([[509,235],[520,237],[539,241],[555,248],[572,260],[587,276],[597,294],[608,312],[621,327],[633,341],[638,357],[641,372],[647,388],[646,400],[639,423],[633,428],[619,418],[597,409],[575,399],[554,389],[538,388],[524,396],[514,392],[510,381],[504,374],[499,364],[498,353],[498,343],[503,330],[508,308],[511,286],[512,263]],
      [[[[513,257],[517,287],[514,314],[506,340],[505,351]],12],[[[505,357],[520,344],[536,336],[554,318],[567,315]],12],[[[564,278],[573,293],[595,310],[606,315]],8],[[[566,330],[589,328],[610,335],[625,348],[633,366]],11],[[[504,354],[503,365],[508,377]],7]],[542,265,617,392]);
    // 斜着包住前臂的滚边，袖口呈一前一后的椭弧。
    binding([[512,367],[523,360],[538,355],[554,350],[572,350],[592,353],[610,356],[624,365],[632,380],[638,395],[645,421],[642,429],[632,426],[619,414],[600,401],[576,393],[552,384],[537,385],[524,395],[518,395],[513,386],[509,380]]);
    brocade([[516,373],[528,367],[543,361],[558,357],[578,358],[598,361],[614,367],[624,378],[632,396],[638,415],[641,431],[627,426],[615,417],[601,408],[584,400],[566,393],[555,392],[543,396],[533,404],[527,405],[519,397],[516,386]],
      [[529,390,-.92,.71],[544,376,-.40,.78],[563,371,.14,.78],[582,378,.29,.86],[602,382,.43,.86],[620,399,.81,.76],[631,414,1.1,.65]]);
    const lining=contour([[527,405],[536,398],[547,392],[557,389],[566,391],[573,394],[560,399],[548,409],[541,417],[535,416]]);
    skinForm(lining,549,400,36,20);KC(lining,1.2);
    // 梗在握处隐入掌心，在小指外侧重新露出。所有指尖在同一根弯梗上受力。
    const stem=contour([[444,512],[460,518],[475,520],[487,516],[500,505],[509,488],[517,469],[526,450],[537,435],[551,425],[574,416],[595,413],[617,413],[639,416],[658,420],[666,422],[666,428],[659,429],[638,425],[616,422],[594,422],[574,424],[554,432],[542,443],[533,458],[525,477],[517,498],[507,514],[493,525],[480,532],[461,530],[445,524]]);
    shape(stem);fill('green',.80,stem);fill('yellow',.47,stem);
    paint('cloth',()=>{gradFill(stem,524,434,534,453,[[0,'rgba(91,114,51,.51)'],[1,'rgba(74,94,45,.56)']]);});
    KC(stem,1.2);
    if(line){c.save();path8(c,stem);c.clip();c.globalAlpha=.46;const r=rng(8031);
      for(let j=0;j<1200;j++){const x=442+r()*228,y=411+r()*123;K([[x,y],[x+.35,y+1+r()*.8]],.75,{ti:.3,to:.4,n:4});}
      c.restore();}
    if(blk==='a:lotus'){
      c.save();path8(c,stem);c.clip();
      c.fillStyle='#687f53';c.globalAlpha=.88;polyFill(c,stem);
      const r=rng(8044);
      for(let j=0;j<6000;j++){
        const x=441+r()*229,y=410+r()*125,size=.37+r()*.84;
        c.fillStyle=j%4?'rgba(43,68,49,.73)':'rgba(202,183,112,.84)';
        c.beginPath();c.ellipse(x,y,size*.8,size*1.17,-.4,0,7);c.fill();
        if(j%7===0){c.fillStyle='rgba(223,202,145,.74)';c.fillRect(x-.25,y-.8,.7,.74);}
      }c.restore();
    }
    // 一枝半开的白莲：厚的外瓣压着内瓣和花房，叶尖稍翻，黄芯从缝里透出。
    const lotusPetal=(outline,pinkTip,base)=>{
      const p=contour(outline);shape(p);
      light('lotus',()=>{c.fillStyle='rgba(255,247,219,.79)';polyFill(c,p);});
      paint('lotus',()=>{
        gradFill(p,...pinkTip,...base,[[0,'rgba(222,86,98,.92)'],[.22,'rgba(233,128,132,.68)'],[.45,'rgba(243,190,170,.22)'],[.69,'rgba(235,220,164,.15)'],[1,'rgba(152,140,84,.52)']]);
        blushInside8(c,p,base[0],base[1],30,19,[[0,'rgba(164,146,81,.24)'],[1,'rgba(205,189,123,0)']]);
      });
      if(blk==='a:lotus'){
        c.save();path8(c,p);c.clip();
        gradFill(p,...pinkTip,...base,[[0,'rgba(217,92,95,.75)'],[.14,'rgba(235,135,133,.67)'],[.32,'rgba(245,185,170,.36)'],[.56,'rgba(255,246,220,.16)'],[.84,'rgba(177,173,124,.13)'],[1,'rgba(137,139,91,.44)']]);
        c.restore();
      }
      KC(p,1.15);
    };
    lotusPetal([[386,497],[374,482],[374,464],[376,451],[375,440],[382,443],[392,447],[402,454],[413,470],[417,486],[407,499]],[375,440],[408,491]);
    lotusPetal([[405,485],[402,465],[405,447],[410,432],[410,423],[414,420],[423,424],[435,426],[448,431],[457,445],[458,467],[441,489]],[412,421],[444,479]);
    lotusPetal([[442,494],[444,475],[452,453],[458,437],[458,421],[464,420],[472,432],[480,440],[486,456],[488,475],[476,494],[460,505]],[460,421],[457,502]);
    const heart=contour([[384,458],[395,453],[416,446],[434,439],[444,439],[454,443],[450,452],[439,464],[421,473],[399,475]]);
    shape(heart);fill('yellow',.88,heart);fill('green',.41,heart);KC(heart,1.1);
    for(let j=0;j<30;j++){const a=j/29,px=386+62*a,py=458-19*a+2*Math.sin(a*3.6);const tip=[px-1.8,py-4-(j%3)];strokeIf('yellow',1.2,[[px,py+3],tip]);if(j%3===0)K([tip,[px,py+2]],.84);}
    lotusPetal([[451,518],[449,531],[440,542],[428,546],[413,544],[396,537],[384,530],[373,527],[366,522],[382,514],[406,507],[428,508]],[369,520],[450,519]);
    lotusPetal([[427,517],[411,521],[389,521],[366,514],[353,503],[344,489],[335,479],[336,473],[350,474],[360,468],[373,468],[393,480],[410,502]],[337,474],[422,516]);
    lotusPetal([[433,516],[415,518],[397,512],[386,502],[381,487],[380,471],[382,464],[392,466],[408,470],[421,476],[431,489],[439,507]],[382,465],[434,516]);
    lotusPetal([[442,514],[429,514],[416,502],[411,488],[410,471],[411,453],[407,438],[414,438],[427,440],[441,441],[450,448],[457,460],[458,475],[453,491]],[409,437],[444,512]);
    lotusPetal([[448,516],[437,510],[437,495],[442,478],[449,464],[452,450],[450,437],[452,430],[460,439],[470,445],[477,457],[479,473],[477,488],[469,503],[460,512]],[451,431],[450,517]);

    const palm=contour([[537,415],[542,408],[548,400],[554,395],[562,391],[568,391],[578,394],[592,399],[605,405],[612,411],[615,420],[616,432],[615,446],[612,457],[608,471],[605,478],[600,479],[596,477],[594,471],[594,464],[596,456],[596,452],[591,455],[585,458],[579,458],[574,455],[568,457],[561,457],[555,454],[551,451],[545,451],[539,449],[537,446],[539,441],[544,438],[549,434],[551,430],[544,433],[537,437],[532,439],[527,437],[525,431],[526,426],[531,425]]);
    skinForm(palm,553,419,70,59);
    paint('face',()=>{
      c.save();path8(c,palm);c.clip();
      gradFill(palm,558,439,579,388,[[0,'rgba(254,222,187,.08)'],[.52,'rgba(249,198,167,.12)'],[1,'rgba(226,132,111,.64)']]);
      for(const [q,w] of [[[[527,434],[535,437],[545,434],[551,429]],4.2],[[[539,447],[549,450],[555,448],[561,443]],5.8],[[[553,452],[564,456],[571,454],[578,447]],5.2],[[[575,454],[584,457],[592,453],[598,446]],4.8],[[[595,461],[594,470],[599,476]],3.7]]){
        stroke(q,w*2.3,'rgba(224,143,99,.17)');stroke(q,w,'rgba(208,128,85,.28)');
      }
      blush8(c,600,415,23,32,[[0,'rgba(231,143,124,.30)'],[1,'rgba(248,185,159,0)']]);
      for(const [x,y,rx,ry] of [[609,427,15,34],[597,474,9,8],[539,433,12,6],[565,453,24,6]])
        blush8(c,x,y,rx,ry,[[0,'rgba(234,147,132,.35)'],[1,'rgba(241,169,141,0)']]);
      c.restore();
    });
    // 手背连到小指外沿，掌根在袖口内，没有一条横线把腕子截断。
    fleshLine([[536,416],[545,403],[556,394],[565,391],[578,394],[594,400],[608,407],[614,416],[616,430],[614,448],[609,465],[605,477],[601,480],[596,477],[594,471],[596,456]],1.75);
    fleshLine([[534,419],[531,423],[525,426],[525,432],[528,437],[534,438],[542,435],[550,431],[552,429]],1.7);
    fleshLine([[552,429],[549,435],[543,439],[537,443],[537,446],[542,449],[547,451],[551,451],[557,448],[561,445]],1.6);
    fleshLine([[551,451],[556,455],[564,457],[571,455],[575,450],[579,447]],1.6);
    fleshLine([[575,453],[578,457],[584,458],[590,456],[596,451]],1.55);
    for(const [nail,fold] of [
      [[[526,426],[530,426],[532,430],[531,432],[528,432]],[[532,425],[535,425],[537,427]]],
      [[[598,477],[599,472],[603,471],[606,473],[604,477]],[[598,468],[602,468],[605,470]]]
    ]){
      paint('face',()=>{c.fillStyle='rgba(224,154,137,.30)';polyFill(c,contour(nail));});fleshLine(nail,1.05);fleshLine(fold,.76);
    }
    // 托鱼手的掌根仍在鱼后，只有屈指的一侧跨过鱼头轮廓。
    farHand(true);
    if(!window.palmPosition8)fleshLine([[267,484],[274.5,485.2],[280.6,481.2],[283.2,475]],1.55);
  }
  c.restore();
}
// ---------- 预先印好各版：墨线版、四块色版、绘的几组颜色、开脸的粉 ----------
// 木版、铅粉和薄水色落在同一种细纸纹上。纹理是带种子的颜料颗粒，与参考图像无关。
function pigmentTile8(){
  const tile=mk(148,148),c=tile.getContext('2d'),im=c.createImageData(148,148),r=rng(84309);
  for(let i=0;i<im.data.length;i+=4){
    const f=r(),bright=f>.48,spore=r();
    im.data[i]=bright?255:87;im.data[i+1]=bright?241:63;im.data[i+2]=bright?211:57;
    im.data[i+3]=Math.round((spore>.973?49:6+19*r())*(bright?.95:.75));
  }
  c.putImageData(im,0,0);return tile;
}
function prepNian(){KW=1;prepHead8();B8.pigment=pigmentTile8();
  const pc=mk(P8W,P8H);{const px=pc.getContext('2d');const img=px.createImageData(P8W,P8H);const d=img.data;const n1=noise2(830,8,6),n2=noise2(831,200,153);const r=rng(832);
    for(let i=0;i<d.length;i+=4){const p=i/4,u=(p%P8W)/P8W,v=Math.floor(p/P8W)/P8H;const l=1+(n1(u*8,v*6)-0.5)*0.009+(n2(u*200,v*153)-0.5)*0.018+(r()-.5)*0.024;d[i]=clamp(246*l,0,255);d[i+1]=clamp(232*l,0,255);d[i+2]=clamp(220*l,0,255);d[i+3]=255;}
    px.putImageData(img,0,0);}B8.paper=pc;
  const draw=(part,k)=>{const cv=mk(P8W,P8H);const x=cv.getContext('2d');x.setTransform(MS8,0,0,MS8,P8W/2,P8H/2);x.fillStyle='#000';x.strokeStyle='#000';scene8(x,part,k);x.setTransform(1,0,0,1,0,0);
    if(k.startsWith('p:')||k.startsWith('a:')){x.globalCompositeOperation='source-atop';x.globalAlpha=.76;x.fillStyle=x.createPattern(B8.pigment,'repeat');x.fillRect(0,0,P8W,P8H);}
    return cv;};
  for(const part of ['back','front']){
    for(const B of BLK.concat([{k:'line',col:[28,22,20]}])){const cv=draw(part,B.k);const x=cv.getContext('2d');
      // 木版的墨色：不匀、带木纹
      const img=x.getImageData(0,0,P8W,P8H);const d=img.data;const n1=noise2(800+B.k.length*7,10,8),n2=noise2(810+B.k.length,6,107);const r=rng(820+B.k.length);const ln=B.k==='line';
      for(let i=3;i<d.length;i+=4){if(!d[i])continue;const p=(i-3)/4,u=(p%P8W)/P8W,v=Math.floor(p/P8W)/P8H;const m=(ln?0.03:0.12)+(ln?0.1:0.2)*clamp((n1(u*10,v*8)-0.45)*1.6)+(ln?0.05:0.1)*clamp((n2(u*6,v*107)-0.6)*3)+(r()<0.02?0.35*r():0);d[i]=d[i]*(1-clamp(m));}
      x.putImageData(img,0,0);x.globalCompositeOperation='source-in';x.fillStyle=`rgb(${B.col})`;x.fillRect(0,0,P8W,P8H);B8['c'+part+B.k]=cv;}
    for(const g of ['face','lotus','cloth']){B8['pt'+part+g]=draw(part,'p:'+g);B8['lt'+part+g]=draw(part,'l:'+g);}
    for(const g of ['lotus','cloth'])B8['at'+part+g]=draw(part,'a:'+g);}
  {const cv=draw('front','sil');const x=cv.getContext('2d');x.globalCompositeOperation='source-in';x.drawImage(pc,0,0);B8.frontKO=cv;}
  B8.tmp=mk(P8W,P8H);}
// 绘：一组颜色顺着一个方向刷开（软边）
function paintSweep8(part,g,k,pass,composite){if(k<=0)return;const T=B8.tmp,tx=T.getContext('2d');
  const put=(src,comp)=>{if(k>=1){ctx.save();ctx.globalCompositeOperation=comp;ctx.drawImage(src,...PRINT_RECT8);ctx.restore();return;}
    tx.setTransform(1,0,0,1,0,0);tx.globalCompositeOperation='source-over';tx.clearRect(0,0,P8W,P8H);tx.drawImage(src,0,0);
    const [a,b]=SWEEP8[g].map(T8L);const ax=(a[0]+PR8)*MS8,ay=(a[1]+PR8Y)*MS8,bx=(b[0]+PR8)*MS8,by=(b[1]+PR8Y)*MS8;const l=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/l,uy=(by-ay)/l,soft=34*MS8;
    const fx=lerp(ax-ux*soft,bx+ux*soft,k),fy=lerp(ay-uy*soft,by+uy*soft,k);const gr=tx.createLinearGradient(fx-ux*soft,fy-uy*soft,fx+ux*soft,fy+uy*soft);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');
    tx.globalCompositeOperation='destination-in';tx.fillStyle=gr;tx.fillRect(0,0,P8W,P8H);ctx.save();ctx.globalCompositeOperation=comp;ctx.drawImage(T,...PRINT_RECT8);ctx.restore();};
  put(B8[pass+part+g],composite);}
const reliefHandFrames8=new Map();
function drawReleasedHand8(part,t){
  const raw=smooth(T8SLIP-.13,T8SLIP+.65,t);
  if(raw<=0){drawPrintArt8(part,t);return;}
  const A=T8L(RP8(210,403)),B=T8L(RP8(307,496)),x0=Math.floor((A[0]+PR8)*MS8),y0=Math.floor((A[1]+PR8Y)*MS8),x1=Math.ceil((B[0]+PR8)*MS8),y1=Math.ceil((B[1]+PR8Y)*MS8);
  const dx=S8X+x0/MS8-PR8,dy=S8Y+y0/MS8-PR8Y,ww=x1-x0,hh=y1-y0;
  const n=Math.max(0,Math.min(24,Math.round(raw*24))),key=part+n;
  if(!reliefHandFrames8.has(key)){
    const temp=mk(ww,hh),dest=mk(ww,hh),tc=temp.getContext('2d'),dc=dest.getContext('2d');
    const plate=(block)=>{tc.reset();tc.setTransform(MS8,0,0,MS8,P8W/2-x0,P8H/2-y0);tc.fillStyle='#000';tc.strokeStyle='#000';scene8(tc,part,block);tc.setTransform(1,0,0,1,0,0);};
    const put=(comp='source-over',alpha=1,ox=0,oy=0)=>{dc.save();dc.globalCompositeOperation=comp;dc.globalAlpha=alpha;dc.drawImage(temp,ox,oy);dc.restore();};
    const pigment=()=>{tc.save();tc.globalCompositeOperation='source-atop';tc.globalAlpha=.76;tc.translate(-x0,-y0);tc.fillStyle=tc.createPattern(B8.pigment,'repeat');tc.fillRect(x0,y0,ww,hh);tc.restore();};
    window.palmPosition8=n/24;
    if(part==='back'){dc.drawImage(B8.paper,-x0,-y0);}
    else{plate('sil');tc.globalCompositeOperation='source-in';tc.drawImage(B8.paper,-x0,-y0);put();}
    for(const g of ['face','lotus','cloth']){plate('l:'+g);put();}
    for(const b of BLK){plate(b.k);tc.globalCompositeOperation='source-in';tc.fillStyle='rgb('+b.col.join(',')+')';tc.fillRect(0,0,ww,hh);put('multiply',.82,b.off[0]*MS8,b.off[1]*MS8);}
    for(const g of ['face','lotus','cloth']){plate('p:'+g);pigment();put('multiply');}
    for(const g of ['lotus','cloth']){plate('a:'+g);pigment();put();}
    plate('line');tc.globalCompositeOperation='source-in';tc.fillStyle='rgb(28,22,20)';tc.fillRect(0,0,ww,hh);put('source-over',.91);
    window.palmPosition8=0;reliefHandFrames8.set(key,dest);
  }
  ctx.save();ctx.beginPath();ctx.rect(-30000,-30000,60000,60000);ctx.rect(dx,dy,ww/MS8,hh/MS8);ctx.clip('evenodd');drawPrintArt8(part,t);ctx.restore();
  ctx.drawImage(reliefHandFrames8.get(key),dx,dy,ww/MS8,hh/MS8);
}
function drawPrint8(part,t){drawReleasedHand8(part,t);}
function drawPrintArt8(part,t){
  if(part==='front')ctx.drawImage(B8.frontKO,...PRINT_RECT8);
  for(const g of ['face','lotus','cloth'])paintSweep8(part,g,p8k(t,g),'lt','source-over');   // 先扑粉
  BLK.forEach((B,i)=>{const k=b8k(t,i);if(k<=0)return;ctx.save();ctx.globalAlpha=0.9*k;ctx.globalCompositeOperation='multiply';ctx.translate(...B.off);ctx.drawImage(B8['c'+part+B.k],...PRINT_RECT8);ctx.restore();});
  for(const g of ['face','lotus','cloth'])paintSweep8(part,g,p8k(t,g),'pt','multiply');
  for(const g of ['lotus','cloth'])paintSweep8(part,g,p8k(t,g),'at','source-over');   // 再染
  ctx.save();ctx.globalAlpha=0.95;ctx.drawImage(B8['c'+part+'line'],...PRINT_RECT8);ctx.restore();}
// 鱼身先垫一层年画纸，套色版压在这层纸上：在纸面上和纸一模一样；离开了纸，它也是一条不透明的、印出来的鱼，
// 红框、墙上的接缝都不会透过来。离开纸以后再给它一点影子，像一张从画里走出来的纸片
const NIAN_PAPER='rgb(246,232,220)';
function drawNianFish(c,TR,p,t){const z=TR[0];
  layerBegin(hctx,TR);hctx.fillStyle=NIAN_PAPER;nianFishParts(hctx,p,'sil');hctx.globalCompositeOperation='source-atop';hctx.drawImage(B8.paper,...PAPER_RECT8);hctx.globalCompositeOperation='source-over';
  BLK.forEach((B,i)=>{const k=b8k(t,i);if(k<=0)return;layerBegin(eb1,TR);eb1.translate(B.off[0],B.off[1]);eb1.fillStyle='#000';eb1.strokeStyle='#000';nianFishParts(eb1,p,B.k);layerColor(eb1,`rgb(${B.col})`);
    hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.globalAlpha=0.92*k;hctx.globalCompositeOperation='multiply';hctx.drawImage(EB1,0,0);hctx.restore();});
  const pk=p8k(t,'fish');
  if(pk>0){layerBegin(eb1,TR);nianFishPaint(eb1,p,pk);hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.globalCompositeOperation='source-over';hctx.drawImage(EB1,0,0);hctx.restore();}
  // 套色的错位溢出鱼身的那一点剪掉
  layerBegin(eb1,TR);eb1.fillStyle='#000';nianFishParts(eb1,p,'sil');hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.globalCompositeOperation='destination-in';hctx.drawImage(EB1,0,0);hctx.restore();
  layerBegin(eb1,TR);eb1.fillStyle='#000';eb1.strokeStyle='#000';nianFishParts(eb1,p,'line');layerGrain(eb1,TR,0.1);layerColor(eb1,'rgb(28,22,20)');
  hctx.save();hctx.setTransform(1,0,0,1,0,0);hctx.globalAlpha=0.95;hctx.drawImage(EB1,0,0);hctx.restore();
  if(pk>0){hctx.save();hctx.setTransform(...TR);nianFishLights(hctx,p,pk);
    hctx.transform(...nianGeom(p).m);hctx.globalCompositeOperation='source-atop';hctx.globalAlpha=.74*pk;hctx.fillStyle=hctx.createPattern(B8.pigment,'repeat');hctx.fillRect(-760,-680,2360,1990);hctx.restore();}
  nianEyes(hctx,TR,p,t);
  ctx.save();ctx.setTransform(...TR);ctx.beginPath();ctx.rect(-1e5,-1e4,2e5,2e4);ctx.rect(...PAPER_RECT8);ctx.clip('evenodd');
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.3;ctx.filter=`brightness(0) blur(${(4*z).toFixed(1)}px)`;ctx.drawImage(HEROC,-5*z,9*z);ctx.restore();
  blitLayer(HEROC,1);}
// 动的五官同静态脸共用原画像素坐标。眨眼时上下睑合拢，眼珠一直裁在眼裂内。
function face8(t,TR){
  const startle=smooth(T8SLIP,T8SLIP+.25,t);
  const look=smooth(101.8,102.8,t)*(1-smooth(103.4,104.2,t))*(1-startle);
  const joy=smooth(T8HOLD[0]+.1,T8HOLD[0]+.6,t)*(1-startle);
  const blink=smooth(105.92,105.98,t)*(1-smooth(106.02,106.14,t))*(1-startle);
  const pink=b8k(t,1),powder=p8k(t,'face');
  const c=ctx;c.save();c.setTransform(...TR);c.translate(S8X,S8Y+DY8);c.scale(SC8,SC8);refSpace8(c);
  const ink=(pts,w,col,o={})=>{c.fillStyle=col;kline(c,pts,w,{ti:.22,to:.36,sw:.15,...o});};
  // 用两套眼眶曲线保留转面的透视：远眼高、短，眼尾斜挑。
  const eyes=[
    {upper:[[379,245],[387,241],[395,239],[402,239],[408,241],[410,245]],
     lower:[[379,245],[386,248.2],[394,249.1],[402,249],[407,248.1],[410,245]],
     fold:[[379,243],[387,240],[395,238],[403,238],[409,241]],
     brow:[[370,228],[377,222],[386,218.5],[396,217.5],[404,218.5]],
     iris:[399,244],r:6.6,tail:[376.6,243.8]},
    {upper:[[445,237],[450,230],[456,227.5],[464,225.6],[469,224.4],[473,224]],
     lower:[[445,237],[450,238.5],[456,237.4],[463,234.3],[469,230.1],[473,224]],
     fold:[[444,234],[449,229],[457,226],[464,224],[470,223]],
     brow:[[440,214],[447,208],[455,205],[464,205],[472,207]],
     iris:[456,232],r:6.3,tail:[474.5,223.1]}
  ];
  eyes.forEach((eye,i)=>{
    const upper=eye.upper.map(([x,y],j)=>{
      const hump=Math.sin(Math.PI*j/(eye.upper.length-1));
      return [x,lerp(y-hump*(4.6*startle-1.55*joy),eye.lower[j][1]-.35,blink)];
    });
    const lower=eye.lower.map(([x,y],j)=>[x,y+Math.sin(Math.PI*j/5)*(3.6*startle-.5*joy)*(1-blink)]);
    const lid=curvePts(upper,26).concat(curvePts(lower.slice().reverse(),26));
    if(powder>0){
      c.save();c.globalAlpha=powder;
      const above=upper.map(([x,y],j)=>[x,y-1.6-1.1*Math.sin(j*Math.PI/5)]);
      for(const [w,alpha] of [[11,.065],[8.2,.10],[5.6,.15],[3.3,.21]])ink(above,w,'rgba(153,86,50,'+alpha+')',{ti:.33,to:.32});
      const shelf=lower.map(([x,y],j)=>[x,y+2.0+1.4*Math.sin(j*Math.PI/5)]);
      ink(shelf,4.1,'rgba(209,131,115,.44)');ink(shelf,1.4,'rgba(255,218,188,.72)');
      ink(lower.map(([x,y])=>[x,y+.75]),2.2,'rgba(143,83,65,.57)');c.restore();
    }
    if(blink<.98){
      c.save();path8(c,lid);c.clip();c.fillStyle='rgba(255,249,225,'+(.36+.58*powder)+')';c.fill();
      {const ty=Math.min(...upper.map(q=>q[1])),g=c.createLinearGradient(0,ty,0,ty+7);g.addColorStop(0,'rgba(96,110,138,'+(.5*powder)+')');g.addColorStop(1,'rgba(150,165,190,0)');c.fillStyle=g;c.fill();}   // 眼白上沿压在眼皮的影子里
      const x=eye.iris[0]-3.1*look-1.25*startle,y=eye.iris[1]+1.0*look,r=eye.r*(1-.11*startle);
      const g=c.createLinearGradient(x,y-r,x,y+r);g.addColorStop(0,'#211a18');g.addColorStop(.66,'#3d2921');g.addColorStop(1,'#845435');
      c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.97,-.13,0,Math.PI*2);c.fill();
      c.fillStyle='#211a17';c.beginPath();c.arc(x,y-.3,r*.55,0,Math.PI*2);c.fill();
      c.fillStyle='rgba(255,250,226,.9)';c.beginPath();c.arc(x-1.7,y-1.3,1.1,0,Math.PI*2);c.fill();c.restore();
    }
    if(i===0)upper.unshift(eye.tail);else upper.push(eye.tail);
    ink(upper,3.25,'#2b201c',{ti:i?.19:.39,to:i?.46:.21});
    ink(lower,1.52,'rgba(65,45,40,.88)');
    ink(eye.fold.map(([x,y],j)=>[x,y+1.1*blink-2.4*startle*Math.sin(Math.PI*j/4)]),1.03,'rgba(118,75,49,.81)');
    const brow=eye.brow.map(([x,y],j)=>[x,y-startle*(3.9+2.4*Math.sin(Math.PI*j/4))]);
    ink(brow,2.75,'rgba(74,53,44,.86)',{ti:.42,to:.42,sw:.35});
    for(let j=1;j<4;j++){
      const [x,y]=brow[j];ink([[x-4,y+1.2],[x-1,y-1.05],[x+3.5,y-1.45]],.62,'rgba(81,62,45,.73)');
    }
  });
  const P=(a,b)=>a.map(([x,y],i)=>[lerp(x,b[i][0],startle),lerp(y,b[i][1],startle)]);
  const left=419-1.3*joy,right=446+1.9*joy;
  const top=P([[left,283.0],[422.7,280.8],[428.7,279.8],[434,279.8],[442,278.7],[right,278.1]],
              [[429,284],[430,280.5],[432,278.8],[435,278.1],[438,279.2],[440,282]]);
  const bottom=P([[right,278.1],[445.8,285.4+joy],[441.3,290.2+joy],[432,292+joy],[423.1,290.5],[left,283.0]],
                 [[440,282],[441.3,288],[438,294],[433,295.1],[429,291],[429,284]]);
  const lip=curvePts(top,26).concat(curvePts(bottom,26));
  if(pink>0){
    c.save();c.globalAlpha=.95*pink;
    const g=c.createLinearGradient(434,279,435,293);g.addColorStop(0,'#ce4840');g.addColorStop(.33,'#e75b4d');g.addColorStop(.79,'#ed6557');g.addColorStop(1,'#d05246');c.fillStyle=g;polyFill(c,lip);
    const opening=P([[left+1,283.7],[425,284.1],[432,283.9],[440,282.4],[right-1.3,280.0],[443,285.3+joy],[434,288.6+1.0*joy],[425,288.1]],
                    [[431,284],[431,281.9],[434,279.8],[437,280.6],[438.6,283.5],[438,288.9],[435,292],[431.5,290]]);
    c.fillStyle='#88453c';polyFill(c,loop8(opening,5));
    c.globalAlpha*=1-startle;
    const teeth=loop8([[left+3,283.8],[426,284.1],[433,283.7],[440,282.5],[right-2.7,280.7],[441,284.6+.6*joy],[432,286.5+.8*joy],[425,286.2]],5);
    {const g=c.createLinearGradient(0,282,0,287.5);g.addColorStop(0,'#c9cfd6');g.addColorStop(.45,'#f4f1e8');g.addColorStop(1,'#e9e2d2');c.fillStyle=g;}polyFill(c,teeth);
    ink([[425,289.1],[431,290.3],[437,289.8],[442,287.8]],1.15,'rgba(255,198,172,.85)');c.restore();
  }
  ink(top,1.05,'rgba(124,57,46,.74)');
  ink(bottom,1.25,'rgba(128,63,49,.79)');
  ink(P([[407,280],[411,280.6],[left,283.0],[left+2,283.7]],[[422,283.2],[425,284.1],[428,284.5],[429,284]]),1.1,'rgba(105,67,49,.84)');
  ink(P([[right-1,278.6],[450,277.4],[453,274.8],[456,274.3]],[[439,282],[441,280.5],[443,279.4],[444,279.7]]),1.05,'rgba(99,61,44,.84)');
  c.restore();
}
const T8OWN=[101.35,108.85];
function drawS8Panel(t,cam,TR){const x0=S8X-S8W/2,y0=S8Y-S8H/2;panelShadow(x0,y0,S8W,S8H);
  ctx.save();ctx.beginPath();ctx.rect(x0,y0,S8W,S8H);ctx.clip();ctx.drawImage(LINEN,0,0,S8W*2,S8H*2,x0,y0,S8W,S8H);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgb(150,42,36)';ctx.fillRect(x0,y0,S8W,S8H);ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.shadowColor='rgba(30,10,8,0.45)';ctx.shadowBlur=14*cam.z;ctx.shadowOffsetY=5*cam.z;ctx.drawImage(B8.paper,...PAPER_RECT8);ctx.restore();
  drawPrint8('back',t);face8(t,TR);ctx.setTransform(...TR);ctx.restore();
  ctx.strokeStyle='rgba(60,20,16,0.4)';ctx.lineWidth=1;ctx.strokeRect(x0,y0,S8W,S8H);   // 框边先画，鱼游过时压在它上面
  if(t>=T8OWN[0]&&t<=T8OWN[1]){ctx.setTransform(...TR);const p=heroPoseNow(t);splitStyle(t,cam,TR,p,null,MEDIA.s8.path,MEDIA.s8.tIn,MEDIA.s8.prev,(t,cam,TR,p)=>drawNianFish(ctx,TR,p,t));}
  ctx.setTransform(...TR);ctx.save();ctx.beginPath();ctx.rect(x0,y0,S8W,S8H);ctx.clip();drawPrint8('front',t);ctx.restore();}
function styleNian(t,cam,TR,p,clip){if(clip){ctx.save();ctx.beginPath();ctx.rect(...clip);ctx.clip();}drawNianFish(ctx,TR,p,t);if(clip)ctx.restore();}

// ---------------- 捌 的登记 ----------------
STN.push({key:'s8',cx:S8X,hw:S8W/2,x0:-4980,x1:-4400,draw:drawS8Panel,owns:t=>t>=T8OWN[0]&&t<=T8OWN[1],drawHero:()=>{},style:styleNian,prep:prepNian});
LABELS.push([S8X,S8W,S8H,'捌','莲年有余','清 · 杨柳青木版年画']);
LIGHTS.push({x:S8X,y:-10,r:600,k:t=>smooth(98.8,100.8,t)});
// 游进来：顺着停住时那一兜的脊线倒着游（从尾尖那头进来，一路弯进娃娃怀里），越游越慢，正好停在第一块色版压下去之前
{const P=curvePts(SP8,260);const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const D=S[S.length-1];
 const at=s=>{let i=1;while(i<S.length-1&&S[i]<s)i++;const a=(s-S[i-1])/((S[i]-S[i-1])||1);return[lerp(P[i-1][0],P[i][0],a),lerp(P[i-1][1],P[i][1],a)];};
 const T0=101.3,TA=103.75,a=94*(TA-T0)/D,g=u=>a*u+(3-2*a)*u*u+(a-2)*u*u*u;
 for(let k=1;T0+0.15*k<TA-0.01;k++){const t=T0+0.15*k;const q=at(D*(1-g((t-T0)/(TA-T0))));GK.push([t,S8X+q[0],S8Y+q[1]]);}
 const fx=SP8[0][0]-SP8[1][0],fy=SP8[0][1]-SP8[1][1],fl=Math.hypot(fx,fy);const H=d=>[S8X+M8[0]+fx/fl*d,S8Y+M8[1]+fy/fl*d];
 // 停住以后鱼头沿着朝向极慢地往前蹭一点点；一扭，顺着鱼头往左上窜，再拐向左边
 GK.push([TA,...H(0)],[104.4,...H(0.6)],[105.2,...H(1.3)],[106.0,...H(2.0)],[106.7,...H(2.6)],[107.15,...H(3.2)],
   [107.35,...H(16)],[107.55,...H(40)],[107.8,S8X-150,-92],[108.1,S8X-200,-105],[108.5,S8X-262,-100],[109.0,S8X-330,-78],[109.6,-5100,-22]);}
HL.push([101.2,150],[102.9,L8],[107.6,L8],[109.0,190],[110.4,140]);
// 被抱着的时候几乎不动；点睛以后尾巴轻轻摆一下（活了），然后猛地一扭
const flick8=t=>smooth(105.92,106.08,t)*(1-smooth(106.22,106.55,t));
HAMP.push(t=>(1-0.92*smooth(103.5,103.8,t)*(1-smooth(106.7,106.85,t))*(1-0.62*flick8(t)))*(1+1.6*smooth(106.75,106.9,t)*(1-smooth(107.3,107.9,t))));
HFB.push(t=>0.9*flick8(t)+3.0*smooth(106.75,106.9,t)*(1-smooth(107.4,108.0,t)));
for(const tc of T8C)SHAKES.push([tc,2.5]);
CK.push({t:101.2,x:S8X+60,y:0,z:1.55,f:0.4,ox:-40},{t:102.5,x:S8X+4,y:2,z:2.5},{t:105.1,x:S8X,y:S8Y,z:2.67},{t:107.1,x:S8X,y:S8Y,z:2.74},{t:108.2,x:S8X-70,y:-20,z:1.6,f:0.4,ox:-60},{t:109.4,z:1.2,f:1,ox:-150,oy:-10});
