#!/usr/bin/env python3
"""把 film/ 里的源码按顺序拼成 film.html。Windows / macOS / Linux 通用：  python build.py
（改了 film/ 里任何一个 .js 之后跑一次，然后刷新浏览器。）"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'film'
ORDER = ['head.js', 'fonts.js', 'tex.js', 'fish.js', 'seal_glyphs.js', 'seal.js', 'world.js',
         's1.js', 's2.js', 's3.js', 's4.js', 's5.js', 'v3core.js', 's67.js', 's8.js', 's9.js', 's10.js', 's11.js',
         'hero.js', 'main.js', 'player.js']

if __name__ == '__main__':
    sys.path.insert(0, str(ROOT / 'tools'))
    try:
        import make_fonts          # 本机装着原字体时，字幕里加了新字会自动补进内嵌字体；没有就跳过
        make_fonts.update_if_possible()
    except Exception as e:
        print('（跳过字体更新：', e, '）')
    parts = [(SRC / f).read_text(encoding='utf-8') for f in ORDER]
    out = ROOT / 'film.html'
    out.write_text('\n'.join(parts) + '\n</script></body></html>\n', encoding='utf-8')
    print(f'已生成 {out.name}（{out.stat().st_size // 1024} KB）')
