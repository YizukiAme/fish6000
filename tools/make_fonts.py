#!/usr/bin/env python3
"""生成 film/fonts.js：把片子里真正用到的字，从 Noto Serif CJK SC（思源宋体）和 DejaVu Sans Mono 里抽出来，
压成 woff2 内嵌进网页。这样换一台电脑打开 film.html，字形也和原片一模一样。

用法：  python tools/make_fonts.py                 # 在默认位置找字体（Linux 的 /usr/share/fonts）
        python tools/make_fonts.py 字体所在文件夹   # 自己指定（里面要有 NotoSerifCJK-Regular.ttc 等）
需要：  pip install fonttools brotli
改了字幕、加了新字以后跑一次；不跑也能看，只是新加的字会用系统字体顶上。"""
import base64, io, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'film'
SERIF = {400: 'NotoSerifCJK-Regular.ttc', 500: 'NotoSerifCJK-Medium.ttc', 600: 'NotoSerifCJK-SemiBold.ttc', 700: 'NotoSerifCJK-Bold.ttc'}
MONO = 'DejaVuSansMono.ttf'
DIRS = ['/usr/share/fonts/opentype/noto', '/usr/share/fonts/truetype/dejavu', '/usr/share/fonts/noto-cjk', '/usr/share/fonts/dejavu']


def used_text():
    """源码里字符串中出现的字（去掉注释），再加上全部 ASCII 和常用标点。"""
    s = ''
    for p in sorted(SRC.glob('*.js')):
        if p.name in ('fonts.js', 'seal_glyphs.js', 'player.js'):
            continue
        code = re.sub(r'/\*.*?\*/', '', p.read_text(encoding='utf-8'), flags=re.S)
        for line in code.splitlines():
            s += re.split(r'(?:^|(?<=[\s;{}(),]))//', line, maxsplit=1)[0] + '\n'
    cjk = {c for c in s if ord(c) > 127}
    return ''.join(sorted(cjk)) + ''.join(chr(i) for i in range(32, 127)) + '，。、：；！？「」『』（）《》·—…“”‘’'


def find(name, dirs):
    for d in dirs:
        p = pathlib.Path(d) / name
        if p.exists():
            return p
    return None


def subset_woff2(path, text, want_family=None):
    from fontTools import subset
    from fontTools.ttLib import TTFont, TTCollection
    idx = 0
    if path.suffix.lower() == '.ttc':
        coll = TTCollection(str(path), lazy=True)
        for i, f in enumerate(coll.fonts):
            names = {r.nameID: r.toUnicode() for r in f['name'].names if r.nameID in (1, 16)}
            if any(v.startswith(want_family) for v in names.values()):
                idx = i
                break
        else:
            raise RuntimeError(f'{path.name} 里没有 {want_family}')
    font = TTFont(str(path), fontNumber=idx)
    opt = subset.Options()
    opt.flavor = 'woff2'
    opt.layout_features = ['*']
    opt.notdef_outline = True
    sub = subset.Subsetter(opt)
    sub.populate(text=text)
    sub.subset(font)
    buf = io.BytesIO()
    font.flavor = 'woff2'
    font.save(buf)
    return buf.getvalue()


def build(dirs, quiet=False):
    text = used_text()
    faces = []
    for w, name in SERIF.items():
        p = find(name, dirs)
        if not p:
            raise FileNotFoundError(name)
        faces.append(('Noto Serif CJK SC', w, subset_woff2(p, text, 'Noto Serif CJK SC')))
    p = find(MONO, dirs)
    if not p:
        raise FileNotFoundError(MONO)
    faces.append(('DejaVu Sans Mono', 400, subset_woff2(p, ''.join(chr(i) for i in range(32, 127)) + '·→…—')))
    js = ['// 片中用到的字体（只含用到的字，woff2），由 tools/make_fonts.py 生成，不要手改',
          '// 内嵌进网页，换一台电脑打开也是同样的字形；字体许可：Noto Serif CJK / DejaVu 均可自由再分发',
          'const FONT_FACES=[']
    for fam, w, data in faces:
        js.append(f'["{fam}",{w},"{base64.b64encode(data).decode()}"],')
    js.append('];')
    js.append('const FONTS_READY=Promise.all(FONT_FACES.map(([fam,w,b64])=>{const s=atob(b64);const u=new Uint8Array(s.length);'
              'for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const f=new FontFace(fam,u.buffer,{weight:String(w)});'
              'document.fonts.add(f);return f.load();}));')
    (SRC / 'fonts.js').write_text('\n'.join(js) + '\n', encoding='utf-8')
    if not quiet:
        print(f'fonts.js：{len(text)} 个字符，{sum(len(f[2]) for f in faces) // 1024} KB')
    return text


def update_if_possible():
    """build.py 调用：本机有原字体、而且用到的字变了，才重新生成；否则什么都不做。"""
    stamp = SRC / '.fonts_chars'
    try:
        text = used_text()
        if stamp.exists() and stamp.read_text(encoding='utf-8') == text and (SRC / 'fonts.js').exists():
            return
        if not all(find(n, DIRS) for n in list(SERIF.values()) + [MONO]):
            return
        import fontTools, brotli  # noqa: F401
    except Exception:
        return
    build(DIRS)
    stamp.write_text(text, encoding='utf-8')


if __name__ == '__main__':
    dirs = sys.argv[1:] or DIRS
    t = build(dirs)
    (SRC / '.fonts_chars').write_text(t, encoding='utf-8')
