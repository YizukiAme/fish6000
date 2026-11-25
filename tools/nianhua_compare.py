#!/usr/bin/env python3
"""把我们画的「捌 · 年画」和原画（左右镜像后）并排放，方便一眼看出哪里不像。

  python3 tools/nianhua_compare.py 112.2
      整幅对照 → cmp/cmp_112.2.jpg（左：我们的；右：原画）
  python3 tools/nianhua_compare.py 112.2 --box 300 240 700 520
      只看原画（镜像后）这一块，和我们画里对应的那一块并排 → cmp/cmp_112.2_300_240_700_520.jpg
      坐标是镜像后原画的像素（981×754），用 tools/ref_grid.py 出带网格的图来量
  加 --overlay：再多一栏，把原画半透明叠在我们的画上，轮廓差多少一眼就看出来（--alpha 调透明度）
  加 --tag before：文件名后面加 _before，改之前先存一份，改完再出一份不带 tag 的，前后对比
  加 --no-render：直接用 cmp/ 里已经渲好的 s8_<t>.jpg

原画默认在 ref/lianniangyouyu.png（只在本地对照用，别提交、别嵌进片子），也可以用 --ref 指定。
像素 → 画面设计坐标的换算和 s8.js 里的 RP8 是同一条（系数从 cmp/s8_meta.json 里读）：
  设计坐标 x = (px - 435) * 0.358 - 20,  y = (py - 222) * 0.358 - 59
设计坐标再按 SC8、DY8 放到纸上：局部坐标 = (x*SC8, y*SC8 + DY8)
"""
import argparse, json, os, subprocess
from PIL import Image, ImageOps, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('t', type=float, help='成片里的真实秒数，比如 112.2（定格）')
    ap.add_argument('--box', type=float, nargs=4, metavar=('X0', 'Y0', 'X1', 'Y1'))
    ap.add_argument('--overlay', action='store_true', help='多出一栏：原画半透明叠在我们的画上')
    ap.add_argument('--alpha', type=float, default=0.5, help='叠图时原画的不透明度')
    ap.add_argument('--tag', default='', help='输出文件名后缀，比如 before')
    ap.add_argument('--ref', default=os.path.join(ROOT, 'ref', 'lianniangyouyu.png'))
    ap.add_argument('--no-render', action='store_true')
    ap.add_argument('--height', type=int, default=640)
    a = ap.parse_args()
    t = f'{a.t:g}'
    if not a.no_render:
        subprocess.run(['node', os.path.join(ROOT, 'tools', 's8_panel.js'), t], check=True, cwd=ROOT)
    ours = Image.open(os.path.join(ROOT, 'cmp', f's8_{t}.jpg')).convert('RGB')
    meta = json.load(open(os.path.join(ROOT, 'cmp', 's8_meta.json'), encoding='utf-8'))
    ref = ImageOps.mirror(Image.open(a.ref).convert('RGB'))
    K = meta.get('RP8K') or {'px': 435, 'py': 222, 'k': 0.358, 'x': -20, 'y': -59}
    z, W, H, SC8, DY8 = meta['z'], meta['W'], meta['H'], meta['SC8'], meta['DY8']

    def rp(px, py):                # 原画像素 → 设计坐标（= s8.js 的 RP8）
        return ((px - K['px']) * K['k'] + K['x'], (py - K['py']) * K['k'] + K['y'])

    def ref_to_img(px, py):        # 原画像素 → 我们那张图的像素
        x, y = rp(px, py)
        return (W / 2 + x * SC8 * z, H / 2 + (y * SC8 + DY8) * z)

    if a.box:
        x0, y0, x1, y1 = a.box
        p0, p1 = ref_to_img(x0, y0), ref_to_img(x1, y1)
        rc = ref.crop((int(x0), int(y0), int(x1), int(y1)))
        name = f'cmp_{t}_{int(x0)}_{int(y0)}_{int(x1)}_{int(y1)}'
    else:                          # 整张纸（含 8 个单位的边）
        p0 = (W / 2 - (meta['PRX'] + 8) * z, H / 2 - (meta['PRY'] + 8) * z)
        p1 = (W / 2 + (meta['PRX'] + 8) * z, H / 2 + (meta['PRY'] + 8) * z)
        rc = ref
        name = f'cmp_{t}'
    crop = (int(p0[0]), int(p0[1]), int(p1[0]), int(p1[1]))
    panels = [('ours  t=' + t, ours.crop(crop)), ('reference (mirrored)', rc)]
    if a.overlay:                  # 原画按同一套换算缩放、摆到我们的图上，再半透明叠上去
        s = K['k'] * SC8 * z
        rs = ref.resize((max(1, round(ref.width * s)), max(1, round(ref.height * s))), Image.LANCZOS)
        ghost = ours.copy(); o = ref_to_img(0, 0); ghost.paste(rs, (round(o[0]), round(o[1])))
        panels.append((f'overlay (reference x{a.alpha:g})', Image.blend(ours, ghost, a.alpha).crop(crop)))
    h = a.height
    panels = [(lab, im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)) for lab, im in panels]
    out = Image.new('RGB', (sum(im.width for _, im in panels) + 24 * (len(panels) - 1), h + 40), 'white')
    d = ImageDraw.Draw(out); x = 0
    for lab, im in panels:
        out.paste(im, (x, 40)); d.text((x + 8, 12), lab, fill='black'); x += im.width + 24
    if a.tag:
        name += '_' + a.tag
    f = os.path.join(ROOT, 'cmp', name + '.jpg'); out.save(f, quality=90); print(f)

if __name__ == '__main__':
    main()
