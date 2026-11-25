#!/usr/bin/env python3
"""给原画（左右镜像后，981×754）的一块区域画上坐标网格并放大，方便量点。

  python3 tools/ref_grid.py 300 240 700 520            → cmp/grid_300_240_700_520.png
  python3 tools/ref_grid.py 300 240 700 520 --step 5 --zoom 4
细线每 step 像素一条（默认 10），粗线和数字每 50 像素一条。量出来的像素坐标直接写进 s8.js 的 RP8(px,py)。
"""
import argparse, os
from PIL import Image, ImageOps, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('box', type=int, nargs=4, metavar=('X0', 'Y0', 'X1', 'Y1'))
    ap.add_argument('--step', type=int, default=10)
    ap.add_argument('--zoom', type=int, default=3)
    ap.add_argument('--ref', default=os.path.join(ROOT, 'ref', 'lianniangyouyu.png'))
    a = ap.parse_args()
    x0, y0, x1, y1 = a.box
    ref = ImageOps.mirror(Image.open(a.ref).convert('RGB'))
    im = ref.crop((x0, y0, x1, y1)).resize(((x1 - x0) * a.zoom, (y1 - y0) * a.zoom), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    for x in range((x0 // a.step + 1) * a.step, x1, a.step):
        X = (x - x0) * a.zoom; big = x % 50 == 0
        d.line((X, 0, X, im.height), fill=(220, 0, 0) if big else (0, 130, 255), width=2 if big else 1)
        if big: d.text((X + 3, 3), str(x), fill=(220, 0, 0))
    for y in range((y0 // a.step + 1) * a.step, y1, a.step):
        Y = (y - y0) * a.zoom; big = y % 50 == 0
        d.line((0, Y, im.width, Y), fill=(220, 0, 0) if big else (0, 130, 255), width=2 if big else 1)
        if big: d.text((3, Y + 3), str(y), fill=(220, 0, 0))
    os.makedirs(os.path.join(ROOT, 'cmp'), exist_ok=True)
    out = os.path.join(ROOT, 'cmp', f'grid_{x0}_{y0}_{x1}_{y1}.png'); im.save(out); print(out)

if __name__ == '__main__':
    main()
