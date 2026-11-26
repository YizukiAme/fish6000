'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
const [scene,movie,start,end]=process.argv.slice(2),first=Number(start),last=Number(end);
const width=3840,height=2160;
const launch=require(process.env.FISH_BROWSER||path.resolve(__dirname,'../browser.js'));
async function main(){
  if(!Number.isInteger(first)||!Number.isInteger(last)||last<=first)throw Error('Invalid frame interval');
  const html=fs.readFileSync(scene),seconds=Date.now();
  const args=['-v','error','-nostdin','-y','-f','rawvideo','-pixel_format','rgba','-video_size',width+'x'+height,'-framerate','40','-i','pipe:0',
    '-an','-vf','scale=iw:ih:in_range=full:out_range=limited:out_color_matrix=bt709:flags=bicubic',
    '-filter_threads','1','-c:v','libx264','-threads',process.env.VIDEO_THREADS||'3','-preset','veryfast','-crf','16','-profile:v','high',
    '-level:v','5.2','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-g','80','-video_track_timescale','10240','-tag:v','avc1',movie];
  const enc=spawn(process.env.FFMPEG||'ffmpeg',args,{stdio:['pipe','ignore','inherit']});
  const encoded=new Promise(resolve=>{enc.once('error',e=>resolve(e));enc.once('close',code=>resolve(code));});
  enc.stdin.on('error',()=>{});
  let next=first;
  const server=http.createServer((req,res)=>{
    if(req.method==='GET'&&req.url.startsWith('/scene')){
      res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;
    }
    if(req.method!=='POST'||req.url!=='/frame/'+next||Number(req.headers['content-length'])!==width*height*4){
      res.statusCode=400;res.end();return;
    }
    req.pipe(enc.stdin,{end:false});
    req.on('end',()=>{next++;res.writeHead(204);res.end();});
  });
  let browser;
  try{
    await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r)});
    browser=await launch();const page=await browser.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('Browser renderer crashed'));
    await page.goto('http://127.0.0.1:'+server.address().port+'/scene?render&scale=2');
    await page.evaluate(()=>window.prepare());
    if(errors.length)throw Error(errors.join('\n'));
    for(let at=first;at<last;at+=40){
      const stop=Math.min(last,at+40);
      await page.evaluate(async ([a,b])=>{
        if(cv.width!==3840||cv.height!==2160||LIGHTC.width!==3840)throw Error('Non-native source');
        for(let i=a;i<b;i++){
          window.render(i/40);
          const rgba=ctx.getImageData(0,0,cv.width,cv.height).data;
          const r=await fetch('/frame/'+i,{method:'POST',body:rgba.buffer});
          if(!r.ok)throw Error('Encoder bridge rejected frame '+i+' ('+r.status+')');
        }
      },[at,stop]);
      if(next!==stop||errors.length)throw Error(errors.join('\n')||'Frame order error');
      console.log(stop+'/'+last+' '+((Date.now()-seconds)/1000).toFixed(1)+' s');
    }
    enc.stdin.end();const code=await encoded;if(code!==0)throw Error('Encoder exit '+code);
  }finally{
    if(!enc.stdin.writableEnded){enc.stdin.destroy();enc.kill();}
    if(browser)await browser.close();
    server.closeAllConnections();await new Promise(r=>server.close(r));
  }
}
main().catch(e=>{console.error(e);process.exitCode=1});
