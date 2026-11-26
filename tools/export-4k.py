#!/usr/bin/env python3
"""Render the native 3840x2160 film in independent, resumable 40 fps segments."""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time

here = Path(__file__).resolve().parent
root = here.parent
worker = here/'uhd-worker.cjs'
FPS = 40
TOTAL = 6934

def sha(file):
    with file.open('rb') as f:
        h = hashlib.sha256()
        for block in iter(lambda: f.read(1048576), b''):
            h.update(block)
        return h.hexdigest()

def streams(file):
    return json.loads(subprocess.check_output(['ffprobe', '-v','error','-show_streams','-of','json', str(file)]))['streams']

def verify(file, count, audio=False):
    info = streams(file)
    video = next(s for s in info if s['codec_type']=='video')
    if (video['width'],video['height'],video['r_frame_rate'],int(video['nb_frames']),video['pix_fmt']) != (3840,2160,'40/1',count,'yuv420p'):
        raise ValueError(f'Unexpected format or frame count at {file}')
    if audio and not any(s['codec_type']=='audio' and s['codec_name']=='aac' for s in info):
        raise ValueError('Expected the original AAC audio stream')

def run_chunk(scene, part, a, b, env):
    out = part/f'{a:04d}-{b:04d}.mp4'
    log = out.with_suffix('.log')
    if out.exists():
        verify(out,b-a)
        return out
    trial = out.with_suffix('.partial.mp4')
    for attempt in range(2):
        with log.open('a') as fd:
            proc = subprocess.run(['node',str(worker), str(scene),str(trial),str(a),str(b)],env=env,stdout=fd,stderr=subprocess.STDOUT)
        if proc.returncode==0:
            verify(trial,b-a)
            trial.replace(out)
            print(f'Rendered frames {a}–{b-1}',flush=True)
            return out
    raise RuntimeError(f'Failed frames {a}–{b-1}. See {log}')

def ff(args):
    subprocess.run(['ffmpeg','-v','error','-nostdin','-y',*map(str,args)],check=True)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--scene',type=Path,default=root/'film.html')
    p.add_argument('--audio',type=Path,default=root/'score_film.m4a',help='An AAC M4A or the approved full MP4 with its AAC track')
    p.add_argument('--output',type=Path,default=root/'film-4k.mp4')
    p.add_argument('--work',type=Path,default=root/'.render-4k')
    p.add_argument('--jobs',type=int,default=4)
    p.add_argument('--first',type=int,default=0)
    p.add_argument('--frames',type=int,default=None)
    args=p.parse_args()
    n=TOTAL-args.first if args.frames is None else args.frames
    if n<=0 or args.first<0 or args.first+n>TOTAL or args.jobs<1:
        p.error('Choose a valid region in the 6,934-frame film and at least one worker.')
    scene,audio,out=(path.resolve() for path in (args.scene,args.audio,args.output))
    if not scene.exists() or not audio.exists():
        p.error('Missing input scene or AAC soundtrack.')
    # Each segment is rendered only once, and is reusable after interruption.
    # Worker hash isolates caches when any color or compression option changes.
    tag=sha(scene)[:16]+'-'+sha(worker)[:12]
    part=args.work.resolve()/tag;part.mkdir(parents=True,exist_ok=True)
    out.parent.mkdir(parents=True,exist_ok=True)
    jobs=[(a,min(a+240,args.first+n)) for a in range(args.first,args.first+n,240)]
    def one(ab):return run_chunk(scene,part,*ab,os.environ.copy())
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.jobs) as pool:
        files=list(pool.map(one,jobs))
    manifest=part/f'list-{args.first}-{n}.ffconcat'
    manifest.write_text(''.join(f"file '{f.name}'\nduration {(b-a)/40:.6f}\n" for f,(a,b) in zip(files,jobs)))
    silent=part/f'silent-{args.first}-{n}.mp4'
    ff(['-f','concat','-safe','0','-i',manifest,'-map','0:v:0','-c','copy','-video_track_timescale','10240',silent])
    verify(silent,n)
    tmp=out.with_name('.'+out.stem+'.pending.mp4')
    seek=['-ss',f'{args.first/FPS:.6f}'] if args.first else []
    ff(['-i',silent,*seek,'-i',audio,'-map','0:v:0','-map','1:a:0','-map_metadata','-1','-c','copy',
        '-t',f'{n/FPS:.6f}','-movflags','+faststart',tmp])
    verify(tmp,n,audio=True);tmp.replace(out);print(out,flush=True)
if __name__=='__main__':main()
