# 全片配乐（第二版）：一条主题贯穿十一站
#
# 主题十个音，只用一个五声音列（D E F# A B），节奏是「长 长｜短 短 长｜短 短 长｜长 长」：
#       D — A — ｜ B A F# — ｜ E F# A — ｜ E — D —
# 这十个音是骨架。每一站换一件乐器、换一个调式（把整条旋律在五声音阶上平移，落在 B 上是羽、E 上是商、
# A 上是徵、D 上是宫），再按这件乐器的脾气在骨架上“加花”——添经过音、附点、滑音、轮指——
# 就像同一根脊线换一种画法。光秃秃的骨架只出现三次：开头的埙、代码站的十行、终章的前半句。
# 全片不离开这五个音，站与站之间的余音才不会打架。
# 编配跟着年代长：彩陶只有一支埙；甲骨是石磬压着一个长音；铜洗的编钟第一次有两个声部（双鱼、双音）；
# 磁州窑有了板眼和伴奏；宋画是琴箫；青花出窑第一次有和声；像素是芯片音乐，一级一个调；
# 代码站把十个音拆开，一行 drawXxx 一个音；终章合起来完整奏一遍。
# 所有音效和声画同步点都在原来的时刻。
import numpy as np, sys, json
from audio_lib import *
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 173.35
OUT = sys.argv[2] if len(sys.argv) > 2 else 'score_full.wav'
tr = Track(DUR); N = tr.N; t = tv(N)

# ---------- 时间：和画面一样，磁州窑画鱼的时候全片的钟慢慢停住 D5 秒（film/s5.js 里的 W5） ----------
# 下面除了磁州窑那一段，所有时刻都按原来的时间线写，放进轨道时自动换成真实时间；磁州窑那一段直接写真实时间
W5R0, W5A, W5H = 50.9, 0.9, 2.5; D5 = W5A + W5H; W5END = W5R0 + 2 * W5A + W5H
def W5(r):                     # 真实 → 原来（标量、数组都行）
    r = np.asarray(r, float); u = r - W5R0
    x1 = np.clip(u / W5A, 0, 1); x3 = np.clip((u - W5A - W5H) / W5A, 0, 1)
    I = np.where(u <= 0, 0.0, np.where(u < W5A, W5A * (x1 ** 3 - x1 ** 4 / 2), np.where(u < W5A + W5H, W5A / 2 + (u - W5A),
        np.where(u < 2 * W5A + W5H, W5A / 2 + W5H + W5A * (x3 - (x3 ** 3 - x3 ** 4 / 2)), D5))))
    return r - I
def Winv(tau):                 # 原来 → 真实
    if tau <= W5R0: return tau
    if tau >= W5R0 + W5A: return tau + D5
    lo, hi = W5R0, W5END
    for _ in range(60):
        mid = (lo + hi) / 2
        if W5(mid) < tau: lo = mid
        else: hi = mid
    return hi
# 再往前还有两处停顿（甲骨裂开以后、铜洗里三条鱼并排的时候），和 film/s5.js 的 PAUSES 一致。它们叠在磁州窑那次外面：
#   真正的播放时间 --WE--> 磁州窑那一站的“真实时间” --W5--> 原来的时间
PAUSES = [(30.625, 0.35, 0.5), (44.9, 0.35, 0.75)]       # (停住的那一刻, 慢下来/快起来各用多久, 停多久)
DE = sum(A + H for _, A, H in PAUSES)
def _rampI(u, A, H):
    x1 = np.clip(u / A, 0, 1); x3 = np.clip((u - A - H) / A, 0, 1)
    return np.where(u < A, A * (x1 ** 3 - x1 ** 4 / 2), np.where(u < A + H, A / 2 + (u - A), A / 2 + H + A * (x3 - (x3 ** 3 - x3 ** 4 / 2))))
def WE(r):
    r = np.asarray(r, float); out = np.array(r, float); off = 0.0; done = np.zeros(r.shape, bool)
    for tau, A, H in PAUSES:
        u = r - (tau - A / 2 + off)
        mb = (~done) & (u <= 0); out = np.where(mb, r - off, out); done |= mb
        mi = (~done) & (u < 2 * A + H); out = np.where(mi, r - off - _rampI(np.maximum(u, 0), A, H), out); done |= mi
        off += A + H
    return np.where(done, out, r - off)
def WEinv(m):
    off = 0.0
    for tau, A, H in PAUSES:
        m0 = tau - A / 2
        if m <= m0: return m + off
        if m < m0 + A:
            lo, hi = m0 + off, m0 + off + 2 * A + H
            for _ in range(60):
                mid = (lo + hi) / 2
                if float(WE(mid)) < m: lo = mid
                else: hi = mid
            return hi
        off += A + H
    return m + off
def splice(y, at, extra, xf=0.08):
    """把一个持续音在第 at 秒处接长 extra 秒（把前面稳定的一段再放一遍，接缝交叉淡化）：给横跨停顿的长音用"""
    i, n, k = int(at * SR), int(extra * SR), int(xf * SR)
    out = np.concatenate([y[:i], y[i - n:i], y[i:]]); w = np.linspace(0, 1, 2 * k)
    out[i - k:i + k] = y[i - k:i + k] * (1 - w) + y[i - n - k:i - n + k] * w
    return out
P1S, P1D = PAUSES[0][0] - PAUSES[0][1] / 2, PAUSES[0][1] + PAUSES[0][2]                 # 第一处停顿开始的时刻、停多久
P2S, P2D = PAUSES[1][0] - PAUSES[1][1] / 2 + P1D, PAUSES[1][1] + PAUSES[1][2]           # 第二处（真正的播放时间）
REAL = [False]                 # False/0：写的是原来的时间；True/1：磁州窑那一站的“真实时间”；2：真正的播放时间
def MAPT(t0): return t0 if REAL[0] == 2 else WEinv(t0 if REAL[0] else Winv(t0))
_add, _add_st = Track.add, Track.add_st
Track.add = lambda self, sig, t0, pan=0.0, gain=1.0: _add(self, sig, MAPT(t0), pan, gain)
Track.add_st = lambda self, sl, sr, t0, gain=1.0: _add_st(self, sl, sr, MAPT(t0), gain)
tw = W5(WE(t))                 # 每个采样点对应的“原来的时间”，给按时间算的包络用

# ---------- 音高与主题 ----------
PENT = [0, 2, 4, 7, 9]
def P(i, base=62):            # 五声音阶上的第 i 级，0 = base（默认 D4）
    return base + 12 * (i // 5) + PENT[i % 5]
THEME = [(0, 2, 0), (2, 2, 3), (4, 1, 4), (5, 1, 3), (6, 2, 2), (8, 1, 1), (9, 1, 2), (10, 2, 3), (12, 2, 1), (14, 2, 0)]   # (第几拍开始, 几拍, 第几级)
GONG, SHANG, ZHI, YU = 0, 1, 3, -1
def th(mode, beat, base=62, sel=slice(None)):
    return [(s * beat, d * beat, P(i + mode, base)) for s, d, i in THEME[sel]]
LOG = []                       # 记下每个有音高的音，画钢琴卷帘检查用
def line(mode, base, unit, cells):
    """用“第几级”写旋律：cells = [(几格, 第几级)]，一格 unit 秒。级数按宫调式数（0 宫 1 商 2 角 3 徵 4 羽 5 高八度的宫……），
    mode 把整条旋律平移到别的调式；级数写 None 是休止"""
    out = []; s = 0.0
    for d, i in cells:
        if i is not None: out.append((s * unit, d * unit, P(i + mode, base)))
        s += d
    return out
def phrase(fn, name, t0, notes, pan=0.0, dyn='arch', **kw):
    """一口气连着奏的乐句。notes: [(开始, 时值, 音高)]，秒，相对 t0。dyn 是这一句里的强弱：arch 中间鼓起来，cresc 渐强，dim 渐弱"""
    s0 = notes[0][0]; ns = [(s - s0, d, p) for s, d, p in notes]
    for s, d, p in notes: LOG.append((name, MAPT(t0 + s), d, float(midi(p))))
    y = fn(ns, **kw)
    if dyn and len(y) > 0.9 * SR:
        x = np.arange(len(y)) / len(y); y = y * {'arch': 0.78 + 0.22 * np.sin(np.pi * x ** 0.85), 'cresc': 0.7 + 0.3 * x, 'dim': 1.0 - 0.3 * x}[dyn]
    tr.add(y, t0 + s0, pan)
def one(sig, name, tt, p, d=1.0, pan=0.0):
    """单独敲 / 拨的一个音"""
    LOG.append((name, MAPT(tt), d, float(midi(p)))); tr.add(sig, tt, pan)

# 片子从 154 秒加长过。贯穿全片的几条噪声（底噪、水声、窑火的轰鸣）仍按原来的长度生成，再把加长的一截接上
N_BASE = int(154.0 * SR) + SR * 6
def padN(x): return (x if len(x) >= N else np.concatenate([x, np.zeros(N - len(x))]))[:N]
rt = roomtone(N_BASE, 0.012)
if N > N_BASE:
    st_ = rng.bit_generator.state; ext = roomtone(N - N_BASE + SR, 0.012); rng.bit_generator.state = st_
    xf = np.linspace(0, 1, SR); rt = np.concatenate([rt[:-SR], rt[-SR:] * (1 - xf) + ext[:SR] * xf, ext[SR:]])
tr.add(rt[:N] * np.clip((t - 0.6) / 2.0, 0, 1), 0, 0)

# ===== 开场 + 壹 · 彩陶：一支埙，把主题完整吹一遍（羽调式，落在 B）；陶鼓 =====
# 第三个音（最高的那个）落在片名盖印的那一下；最后一个音落下时，盆里的鱼正好转起来
b0 = 0.715; t0 = 4.75 - 4 * b0
phrase(xun_phrase, 'xun', t0, [(0, 2 * b0, 'B3'), (2 * b0, 2 * b0, 'F#4'), (4 * b0, b0, 'A4'), (5 * b0, b0, 'F#4'), (6 * b0, 2 * b0, 'E4')], pan=-0.05, amp=0.2, vib=0.14, breath=0.07)
tr.add(thump(0.1), 4.75, 0.15)
phrase(xun_phrase, 'xun', t0 + 9 * b0, [(0, b0, 'D4'), (b0, b0, 'E4'), (2 * b0, 2 * b0, 'F#4'), (4 * b0, 2 * b0, 'D4'), (6 * b0, 1.9, 'B3')], pan=0.05, amp=0.19, vib=0.13)
tr.add(claydrum(0.09, 62, 0.5), t0 + 9 * b0, 0)
for i, tt in enumerate([11.0, 11.27, 11.49, 11.71]): tr.add(drop(0.06, [370, 440, 494, 587][i]), tt + 0.03, [-0.3, 0.35, 0.1, -0.15][i])   # 四条鱼依次点亮：四滴水一级级往上
wenv = np.clip((t - 11.0) / 1.5, 0, 1) * (1 - 0.85 * np.clip((t - 20.4) / 0.5, 0, 1)) + 0.35 * np.clip((t - 22.6) / 1.0, 0, 1) * (1 - np.clip((t - 25.5) / 1.5, 0, 1))
wv = padN(water(N_BASE, 0.016)); tr.L += wv * np.clip(wenv, 0, 1); tr.R += np.roll(wv, 2000) * np.clip(wenv, 0, 1)
for k in range(14):
    tt = 12.0 + k * 0.6 + rng.random() * 0.4
    if tt < 20.2: tr.add(drop(0.025, [294, 330, 370, 440, 494][int(rng.random() * 5)]), tt, rng.random() * 1.2 - 0.6)
# 鱼绕着盆转，一圈圈变成纹：陶鼓一小节比一小节密，埙把主题缩成一小节一句——先是光秃秃的骨架，再添上花，最后一路爬上去，撞进“定住”的三声
g0 = t0 + 15 * b0; gb = 0.53; e8 = gb / 2          # g0 = 12.615；一小节 2.12 秒，正好是一条鱼转过一个位置
DR = [{0: 0.07, 4: 0.05}, {0: 0.085, 2: -0.04, 4: 0.065, 5: 0.04, 6: -0.04}, {0: 0.1, 1: -0.035, 2: -0.05, 3: 0.045, 4: 0.08, 5: 0.05, 6: -0.05, 7: -0.04}]   # 正数敲低音，负数敲高音
for bar, pat in enumerate(DR):
    for k, a in pat.items(): tr.add(claydrum(abs(a), 62 if a > 0 else 124, 0.3 if a > 0 else 0.12), g0 + bar * 4 * gb + k * e8, 0.0 if a > 0 else 0.12)
g3 = g0 + 12 * gb
for j in range(10): tr.add(claydrum(0.035 + 0.008 * j, 62 if j % 2 == 0 else 124, 0.14), g3 + j * e8 / 2, 0.0 if j % 2 == 0 else 0.12)   # 最后一小节：滚奏越敲越响
CELL = dict(vib=0.05, breath=0.05, port=0.03, scoop=0.2, rel=0.12, att=0.04)
phrase(xun_phrase, 'xun', g0 + 4 * gb, line(YU, 62, e8, [(2, 0), (2, 3), (1, 4), (1, 3), (1.8, 2)]), pan=0.2, amp=0.09, dyn=None, **CELL)
phrase(xun_phrase, 'xun', g0 + 8 * gb, line(YU, 62, e8, [(1, 1), (1, 2), (1, 3), (1, 4), (1, 3), (1, 1), (1, 2), (0.8, 0)]), pan=-0.2, amp=0.115, dyn=None, **CELL)
phrase(xun_phrase, 'xun', g3, [(k * e8, e8, P(i + YU)) for k, i in enumerate([0, 1, 2, 3, 4])] + [(20.3 - g3, 0.3, 'B4'), (20.6 - g3, 0.3, 'F#4'), (20.9 - g3, 0.4, 'B3')], pan=0.1, amp=0.14, dyn='cresc', **CELL)
for t0_, d, pan in [(15.8, 4.8, -0.2), (16.2, 4.4, 0.2)]:
    n = int(d * SR); st = tv(n); x = bandnoise(n, 2600, 2.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * st) ** 2); tr.add(norm(x * np.sin(np.pi * st / d) ** 1.5, 0.012), t0_, pan)
for tt in [20.3, 20.6, 20.9]: tr.add(claydrum(0.15, 62, 0.4), tt, 0); tr.add(tick(0.03), tt, 0.2)
tr.add(xun_phrase([(0, 1.05, 'B3')], amp=0.07, vib=0.0, breath=0.16, flutter=0.55, rel=0.2, att=0.3), 21.2, -0.2)   # 主角在纹带里挣
for k in range(9): tr.add(swish(0.02 + 0.01 * rng.random(), 0.12, hi=True), 20.5 + k * 0.16 + rng.random() * 0.05, rng.random() * 0.8 - 0.4)
tr.add(swish(0.09, 0.22, hi=True), 21.88, -0.2)
for k in range(30): tr.add(tick(0.015 + 0.03 * rng.random()), 22.05 + rng.random() * 0.45, rng.random() * 1.4 - 0.7)
tr.add(tick(0.08), 22.56, -0.3); tr.add(tick(0.05), 22.58, -0.2)
# 跃出来：主题开头那个五度，一口气滑上去
phrase(xun_phrase, 'xun', 22.25, [(0, 0.35, 'B3'), (0.35, 0.35, 'F#4'), (0.7, 0.9, 'B4')], pan=-0.25, amp=0.2, vib=0.18, breath=0.1, port=0.22, over=0.6, scoop=1.2)
tr.add(swish(0.06, 0.5), 22.7, -0.4)
tr.add(claydrum(0.2, 62, 0.55), 23.35, -0.3); tr.add(thump(0.08), 23.36, -0.3)
phrase(xun_phrase, 'xun', 23.8, [(0, 0.9, 'B4'), (0.9, 0.4, 'A4'), (1.3, 1.6, 'F#4')], pan=-0.15, amp=0.16, vib=0.15)

# ===== 贰 · 甲骨：石磬把主题前半句一下一下敲出来，底下压一个长音；第五个音就是骨头裂开的那一下 =====
one(qing('B4', 0.12), 'qing', 24.65, 'B4', 1.2, -0.3)
tr.add(splice(drone('B1', 8.6, 0.045, 2.5, 2.0), P1S - 25.4, P1D), 25.4, 0); tr.add(splice(drone('B2', 8.6, 0.016, 2.5, 2.0), P1S - 25.4, P1D), 25.4, 0)   # 跨过甲骨那次停顿，接长
for tt, p, a in [(26.5, 'F#5', 0.09), (28.35, 'A5', 0.075), (29.28, 'F#5', 0.085)]: one(qing(p, a), 'qing', tt, p, 0.9, 0.2 * np.sin(tt))
tr.add(jiangu(0.08, 62, 0.5), 29.28, 0)
tr.add(crackle(1.0, 0.06, 34), 29.45, 0.1)
n = int(0.95 * SR); st = tv(n); tr.add(norm(lp(np.cumsum(rng.standard_normal(n)), 120) * np.clip(st / 0.85, 0, 1), 0.07), 29.4, 0)
n = int(0.85 * SR); st = tv(n); tr.add(norm(hp(rng.standard_normal(n), 3500) * np.clip(st / 0.8, 0, 1) ** 2 * (1 - np.clip((st - 0.8) / 0.05, 0, 1)), 0.02), 29.45, 0.1)   # 灼：嘶嘶的火声
tr.add(bonecrack(0.3), 30.3, 0.1); tr.add(bonecrack(0.16), 30.47, -0.1); tr.add(thump(0.05), 30.3, 0.0)
one(qing('E5', 0.1), 'qing', 30.3, 'E5', 0.9, 0.1)
tr.add(swish(0.07, 0.3, hi=True), 30.95, -0.3)
one(qing('D5', 0.1), 'qing', 31.35, 'D5', 0.8, -0.4); one(qing('B4', 0.085), 'qing', 32.2, 'B4', 1.2, -0.3)   # 裂完，落回主音

# ===== 叁 · 汉画像石：排箫吹主题（商调式，落在 E），建鼓打拍子；后半句刚起就被网兜住，逃出来才吹完 =====
H0 = 33.0
phrase(paixiao_phrase, 'paixiao', H0, line(SHANG, 62, 0.125, [(3, 0), (1, 1), (2, 3), (1, 2), (1, 3),   (2, 4), (1, 3), (1, 4), (4, 2),
                                                             (2, 1), (2, 2), (6.4, 3), (1.6, 4), (1.6, 5)]), pan=0.1, amp=0.13, dyn='cresc')    # 号子似的附点；最后一个长音被网兜起来
for tt, a, f0, dec in [(33.0, 0.08, 62, 0.6), (33.5, 0.04, 82, 0.25), (34.0, 0.12, 62, 0.6), (34.5, 0.045, 82, 0.25), (35.0, 0.12, 62, 0.6), (35.5, 0.045, 82, 0.25)]: tr.add(jiangu(a, f0, dec), tt, 0)
# 起罾：鼓越敲越密
for k, tt in enumerate(np.cumsum([0.22, 0.19, 0.16, 0.13, 0.11, 0.09])): tr.add(jiangu(0.06 + 0.012 * k, 70, 0.25), 36.05 + tt, 0.05)
# 网出水：哗一下，水从网眼往下淌
tr.add(splash(0.06), 36.6, 0.25)
for k in range(16): tr.add(drop(0.012 + 0.01 * rng.random(), 600 + rng.random() * 700), 36.7 + k * 0.055 + rng.random() * 0.04, 0.2 + 0.2 * (rng.random() - 0.5))
# 网兜住正在游的鱼，把它颠起来一小下，落回网里
tr.add(thump(0.025), 36.9, 0.2); tr.add(splash(0.022), 36.91, 0.25)
# 扑腾两下：湿的拍打，落回网里
for tt in [37.12, 37.62]:
    tr.add(tick(0.06), tt, 0.2); tr.add(splash(0.04), tt + 0.02, 0.25); tr.add(thump(0.035), tt + 0.38, 0.2); tr.add(splash(0.025), tt + 0.38, 0.2)
# 跃出网口：排箫一串往上跑；落水
tr.add(swish(0.06, 0.45), 38.18, 0.1)
phrase(paixiao_phrase, 'paixiao', 38.2, [(0, 0.09, 'E4'), (0.09, 0.09, 'F#4'), (0.18, 0.09, 'A4'), (0.27, 0.09, 'B4'), (0.36, 0.09, 'D5'), (0.45, 0.28, 'E5')], pan=0.1, amp=0.1, port=0.02, dyn=None)
tr.add(splash(0.14), 38.86, -0.05)
phrase(paixiao_phrase, 'paixiao', 39.25, line(SHANG, 62, 0.125, [(3, 1), (1, 2), (2, 3), (1, 2), (1, 1), (7.5, 0)]), pan=-0.2, amp=0.12, dyn='dim')
for tt, a in [(39.75, 0.07), (40.25, 0.1)]: tr.add(jiangu(a, 62, 0.5), tt, 0)

# ===== 肆 · 双鱼铜洗：编钟敲主题（宫调式，落在 D），每个音下面跟一个低四度——全片第一次有两个声部 =====
bz = 0.575; Z0 = 41.15
for k, i, a in [(0, 0, 0.12), (2, 3, 0.095), (4, 4, 0.08), (5, 3, 0.08), (6, 2, 0.105)]:
    one(zhong(P(i), a), 'bell', Z0 + k * bz, P(i), 1.0, -0.2 + 0.1 * (k % 3)); one(zhong(P(i - 2), a * 0.55), 'bell', Z0 + k * bz + 0.012, P(i - 2), 1.0, 0.25)
tr.add(splice(drone('D3', 6.4, 0.03, 1.5, 2.0), P2S - (41.6 + P1D), P2D), 41.6, 0)   # 跨过铜洗那次停顿，接长
REAL[0] = 2; T4LOOKR = 44.55 + PAUSES[0][1] + PAUSES[0][2]                      # 盆里那对鱼一前一后转过头来：一条一声，把刚敲过的最后两个音在高八度应一遍
for (p, a, dt, pan) in [('A5', 0.038, 0.05, -0.3), ('F#5', 0.04, 0.25, 0.3)]: one(zhong(p, a, 3.0, damp=0.55), 'bell', T4LOOKR + dt, p, 0.3, pan)
REAL[0] = False
for tt, i, a in [(46.45, 1, 0.085), (47.6, 0, 0.08)]:                                                         # 走了：落回主音
    one(zhong(P(i), a), 'bell', tt, P(i), 1.0, -0.4); one(zhong(P(i - 2), a * 0.55), 'bell', tt + 0.012, P(i - 2), 1.0, 0.1)

# ===== 伍 · 磁州窑（真实时间）：鱼停住，一支笔几笔画成——一笔一声，弹拨跟着往上走；水草一丛一丛撇出来；
#       针剔鳞片，沙沙的；点睛那一下，一声泛音。鱼活过来，笛子把主题吹一遍（徵调式，落在 A），拍板打板眼，一直吹进宋画 =====
class _Mute:
    def add(self, *a, **k): pass
    add_st = add
_tr, tr = tr, _Mute(); _nlog = len(LOG)
tr.add(paiban(0.08), 48.1, 0)
for k, dt in enumerate([0.0, 0.15, 0.52, 0.66, 0.76, 0.86]): tr.add(swish(0.05 + 0.02 * (k == 1), 0.18 + 0.2 * (k == 1)), 49.0 + dt, 0.15 - 0.05 * k)
for j in range(6): tr.add(swish(0.028, 0.16, hi=True), 49.12 + 0.13 * j, -0.4 + 0.16 * j)   # 水草一丛丛刷出来
for i in range(6): tr.add(swish(0.018, 0.12, hi=True), 49.85 + 0.09 * i, 0.2)
for k in range(24): tr.add(scratch(0.05 + rng.random() * 0.04, 0.02 + rng.random() * 0.015), 50.15 + k * 0.045 + rng.random() * 0.02, 0.2)
tr.add(scratch(0.25, 0.03), 51.25, 0.1); tr.add(scratch(0.15, 0.025), 51.45, 0.1)
C0 = 50.5; cb = 0.5
for k in range(9): tr.add(paiban(0.08 if k % 2 == 0 else 0.055), C0 + k * cb, 0.3)
phrase(dizi_phrase, 'dizi', C0, line(ZHI, 62, 0.125, [(2, 0), (1, 3), (1, 4), (2, 3), (1, 4), (1, 3),   (1, 4), (1, 5), (1, 4), (1, 3), (2, 2), (1, 1), (1, 2),
                                                      (1, 1), (1, 2), (1, 3), (1, 2), (2, 3), (1, 4), (1, 3),   (2, 1), (1, 2), (1, 1), (7, 0)]), pan=-0.15, amp=0.12)
for k, p in enumerate(['A3', 'E4', 'A3', 'D4', 'E3', 'B3', 'E3', 'A3']): one(lute_soft(p, 0.07 if k % 2 == 0 else 0.05, 1.4), 'pluck', C0 + k * cb, p, 0.4, -0.3)



tr = _tr; del LOG[_nlog:]
import audio_lib as _al
_rng_main = _al.rng; _al.rng = rng5 = np.random.default_rng(55); REAL[0] = True
tr.add(paiban(0.08), 48.1, 0)
tr.add(swish(0.022, 0.6), 49.05, -0.15)                                        # 碰到枕面，淡成一道影子
STROKES = [(51.00, 0.22, 0.05, 0.3, False, 'A2'), (51.28, 0.40, 0.075, 0.5, False, 'E3'), (51.72, 0.14, 0.045, 0.2, True, 'A3'),
           (51.96, 0.08, 0.03, 0.12, True, None), (52.08, 0.07, 0.028, 0.11, True, None), (52.20, 0.12, 0.055, 0.18, True, 'B3'), (52.34, 0.12, 0.06, 0.2, True, 'E4')]
for k, (t0, d, a, sd, hi, nt) in enumerate(STROKES):                            # 一按、一拖、一扫、两点、两甩
    tr.add(swish(a, sd, hi=hi), t0 - 0.01, 0.25 - 0.08 * k)
    if nt: one(lute_soft(nt, 0.075 + 0.006 * k, 1.8), 'pluck', t0, nt, 0.4, -0.25)
tr.add(jiangu(0.06, 92, 0.25), 51.0, 0.0); tr.add(paiban(0.06), 51.72, 0.3); tr.add(paiban(0.075), 52.34, 0.3)
for k in range(4): tr.add(swish(0.016, 0.06, hi=True), 51.84 + 0.022 * k, 0.1)       # 背鳍上补的四下短尖
G5T = [52.62, 52.70, 52.84, 52.92, 53.02, 53.08]                                 # 水草：一丛一丛撇出来
for j, g in enumerate(G5T):
    for k in range(4): tr.add(swish(0.016 + 0.006 * (k == 0), 0.08, hi=True), g + 0.035 * k, -0.5 + 0.2 * j)
    tr.add(tick(0.018), g, -0.5 + 0.2 * j)
for i in range(6): tr.add(swish(0.01, 0.1, hi=True), 53.12 + 0.05 * i, 0.1)        # 水纹
CUTS = [(53.36, 0.08, 0.035)] + [(53.46 + 0.026 * k, 0.045, 0.024 + 0.008 * rng5.random()) for k in range(16)] + [(53.88 + 0.019 * k, 0.03, 0.016) for k in range(18)] + [(54.18, 0.1, 0.03)]
for t0, d, a in CUTS: tr.add(scratch(d + 0.02, a), t0, 0.15 + 0.1 * (rng5.random() - 0.5))   # 针：鳃、鳞、鳍条，最后一圈是眼睛
one(fan('A5', 0.075, 4.0), 'fan', 54.29, 'A5', 0.6, 0.0)                       # 点睛
for tt, a in [(54.55, 0.035), (54.85, 0.045)]: tr.add(swish(a, 0.28), tt, -0.2)  # 活过来：尾巴拍两下
C0 = 54.35; cb = 0.5                                                             # 笛子：主题，一直吹到宋画的第一声琴
for k in range(9): tr.add(paiban(0.08 if k % 2 == 0 else 0.055), C0 + k * cb, 0.3)
phrase(dizi_phrase, 'dizi', C0, line(ZHI, 62, 0.125, [(2, 0), (1, 3), (1, 4), (2, 3), (1, 4), (1, 3),   (1, 4), (1, 5), (1, 4), (1, 3), (2, 2), (1, 1), (1, 2),
                                                      (1, 1), (1, 2), (1, 3), (1, 2), (2, 3), (1, 4), (1, 3),   (2, 1), (1, 2), (1, 1), (7, 0)]), pan=-0.15, amp=0.12)
for k, p in enumerate(['A3', 'E4', 'A3', 'D4', 'E3', 'B3', 'E3', 'A3']): one(lute_soft(p, 0.07 if k % 2 == 0 else 0.05, 1.4), 'pluck', C0 + k * cb, p, 0.4, -0.3)
REAL[0] = False; _al.rng = _rng_main


# ===== 陆 · 宋画（古琴、洞箫）、柒 · 元青花（琵琶、手鼓） =====
T6 = 51.7
def A(sig, tv0, pan=0.0):
    if tv0 + T6 < 55.2: return
    tr.add(sig, tv0 + T6, pan)
# 花瓣一片片落在水面上，每落一片，古琴拨一个音：主题前半句（宫调式）。泛音在高处应一声
for tt, nm, kw, pan, f0 in [(3.6, 'D3', {}, 0.2, 587), (5.0, 'A3', {}, 0.0, 440), (7.4, 'F#3', dict(vib=0.12), -0.2, 740)]:
    A(drop(0.09, f0), tt, pan); one(qin(nm, 0.24, 7.0, **kw), 'qin', tt + 0.03 + T6, nm, 1.2, pan)
one(qin('B3', 0.2, 6.0, slide='up'), 'qin', 58.0, 'B3', 0.5, 0.1); one(qin('A3', 0.17, 6.0), 'qin', 58.55, 'A3', 0.5, 0.0)
one(fan('A5', 0.07), 'fan', 57.4, 'A5', 0.6, 0.3); one(fan('F#5', 0.08), 'fan', 59.8, 'F#5', 0.6, 0.3)
# 后半句交给洞箫，一口气唱下来；古琴退到下面托着
phrase(xiao_phrase, 'xiao', 60.45, [(0, 0.75, 'E4'), (0.75, 0.75, 'F#4'), (1.5, 1.0, 'A4'), (2.5, 0.25, 'B4'), (2.75, 0.25, 'A4'), (3.0, 1.1, 'E4'), (4.1, 0.2, 'F#4'), (4.3, 0.2, 'E4'), (4.5, 2.4, 'D4')], pan=-0.1, amp=0.13)
A(drop(0.07, 659), 8.75, 0.0); one(qin('A2', 0.15, 6.0), 'qin', 60.48, 'A2', 1.2, 0.0); A(drop(0.045, 494), 9.1, 0.05)
A(drop(0.07, 659), 9.2, 0.5); one(qin('E4', 0.1, 5.0), 'qin', 60.92, 'E4', 0.6, 0.5)
one(qin('D3', 0.16, 6.0), 'qin', 61.95, 'D3', 1.2, 0.0)
A(drop(0.07, 440), 11.0, -0.3); one(fan('A5', 0.1), 'fan', 62.73, 'A5', 0.6, -0.3)
one(qin('A2', 0.15, 6.0, slide='up'), 'qin', 63.45, 'A2', 1.2, -0.1)
one(qin('D3', 0.19, 9.0, vib=0.2), 'qin', 64.95, 'D3', 2.0, 0.0); one(fan('D5', 0.07), 'fan', 65.0, 'D5', 0.6, 0.2)
for i, nm in enumerate(['D6', 'A5', 'F#5', 'D5']): one(fan(nm, 0.1), 'fan', 66.3 + i * 0.6, nm, 0.5, 0.4 - i * 0.25)   # 镜头拉开：泛音一级级落下来
one(qin('D3', 0.18, 9.0, vib=0.25), 'qin', 69.3, 'D3', 2.0, 0.0); one(fan('A4', 0.08), 'fan', 71.1, 'A4', 0.6, 0.2)
# 往盘子游：琵琶先探两声，接到羽调式的 B 上
one(qin('E3', 0.18, 5.0, slide='up'), 'qin', 72.2, 'E3', 0.8, 0.3); one(pipa('F#3', 0.12, 2.0, roll=0.55), 'pipa', 72.65, 'F#3', 0.6, -0.3)
one(qin('D3', 0.18, 5.0, slide='down'), 'qin', 73.2, 'D3', 0.8, 0.3); one(pipa('A3', 0.13, 2.0, roll=0.45), 'pipa', 73.65, 'A3', 0.5, -0.3)
# 落笔时还是青灰色：琵琶弹主题（羽调式），手鼓打一个丝路上的节奏（咚 嗒 · 嗒 咚 · 嗒 ·），一小节 1.6 秒
Q0 = 74.3; q = 0.4
for b in range(5):
    lv = [0.7, 0.85, 1.0, 1.0, 0.9][b]
    for pos, kind in [(0, 'D'), (1, 'T'), (3, 'T'), (4, 'D'), (6, 'T')]:
        if b == 0 and pos in (1, 3): continue
        tr.add(dum((0.14 if pos == 0 else 0.09) * lv) if kind == 'D' else tak(0.05 * lv), Q0 + b * 1.6 + pos * 0.2, 0.0 if kind == 'D' else 0.3)
YUL = [(2, 0), (1, 1), (1, 2), (3, 3), (1, 4),   (1, 4), (1, 5), (1, 4), (1, 3), (3, 2), (1, 3),   (1, 1), (1, 0), (1, 1), (1, 2), (3, 3), (1, 2),   (2, 1), (1, 2), (1, 1), (4, 0)]
for s, d, p in line(YU, 62, 0.2, YUL): one(pipa(p, 0.15 if d > 0.3 else 0.12, 2.2, roll=(d - 0.14) if d > 0.3 else 0.0), 'pipa', Q0 + s, p, d, -0.1)
for tt, p, a in [(0, 'B2', 0.11), (1.6, 'B2', 0.1), (3.2, 'D3', 0.1), (4.8, 'F#3', 0.09), (5.6, 'B2', 0.11), (6.4, 'B2', 0.09)]: one(lute_soft(p, a, 2.5), 'pluck', Q0 + tt, p, 0.8, 0.15)
for j, p in enumerate(['B3', 'D4', 'F#4', 'A4']): one(pipa(p, 0.1, 1.2), 'pipa', Q0 + 6.4 + j * 0.2, p, 0.2, -0.1)      # 纹饰一圈圈画满：一串分解上行
one(pipa('B4', 0.12, 1.6, roll=0.62), 'pipa', Q0 + 7.2, 'B4', 0.8, -0.1)
for i, nm in enumerate(['B2', 'F#3', 'B3']): one(lute_soft(nm, 0.17 if i == 0 else 0.13, 3.0), 'pluck', Q0 + 8.0 + i * 0.02, nm, 0.8, -0.2 + i * 0.2)
A(dum(0.16), 30.6)
for tt in [26.2, 26.8, 27.2, 28.4]: A(swish(0.035), tt, rng.random() * 0.6 - 0.3)
# 上釉；入窑：属音上的长音跟着窑火涨起来，火里的心跳；火暗下去，留一口气的黑
sw_n = int(1.4 * SR); st = tv(sw_n); A(norm(lowpass(rng.standard_normal(sw_n), 31) * np.sin(np.pi * st / 1.4) ** 2, 0.05), 31.0)
A(bowed_soft('A3', 0.09, 3.2), 31.0, 0.0)
heat = np.clip((tw - (T6 + 32.8)) / 2.0, 0, 1) * (1 - np.clip((tw - (T6 + 35.6)) / 1.0, 0, 1))
br = np.cumsum(rng.standard_normal(N_BASE)); br = br - lowpass(br, 3000); br = lowpass(br, 60); br /= np.max(np.abs(br)) + 1e-9; br = padN(br)
rum = br * heat * 0.24 + np.sin(2 * np.pi * 55 * t) * heat * 0.05; tr.L += rum; tr.R += np.roll(rum, 300)
for i in range(110):
    tt = 33.0 + rng.random() * 3.2; n = int(0.012 * SR); ct = tv(n)
    A(np.diff(np.concatenate([[0], rng.standard_normal(n)])) * np.exp(-ct / 0.002) * (0.03 + 0.05 * rng.random()), tt, rng.random() * 1.6 - 0.8)
tt = 33.0
while tt < 36.3:
    h = np.interp(tt, [33.0, 34.8, 36.3], [0.3, 1.0, 0.4]); A(dum(0.08 + 0.1 * h), tt); tt += np.interp(tt, [33.0, 34.8, 36.3], [1.0, 0.7, 1.0])
tr.add(pad(['A2', 'E3', 'A3', 'B3'], 3.65, amp=0.075, att=2.8, rel=0.85), 84.6, 0.0)      # 涨到窑火最亮（87.4 秒），随火光一起暗下去
tr.add(pad(['E4', 'A4'], 2.25, amp=0.035, att=1.4, rel=0.85), 86.0, 0.0)
# 出窑：一串刮奏扫上去，青花亮出来——全片第一次有和声（D｜Bm｜G A｜A D）。琵琶轮指把主题唱一遍，洞箫低八度跟着
RV = 88.9; RM = 89.4          # 亮出来的那一下；旋律晚半秒进，最后一个音正好落在鱼眨眼的时候
for j in range(16): tr.add(lute(P(j, 50), 0.03 + 0.0035 * j, 1.8), RV - 0.42 + j * 0.028, -0.6 + j * 0.08)
for nm, tt, d, a, att, rel in [(['D3', 'A3', 'D4', 'F#4'], RV - 0.1, 2.9, 0.085, 0.45, 0.9), (['B2', 'F#3', 'B3', 'D4'], RM + 1.85, 2.5, 0.075, 0.5, 0.9), (['G2', 'D3', 'G3', 'B3'], RM + 3.85, 1.55, 0.075, 0.35, 0.6),
                               (['A2', 'E3', 'A3', 'B3'], RM + 4.85, 2.5, 0.07, 0.4, 0.8), (['D3', 'A3', 'D4', 'F#4', 'A4'], RM + 6.85, 3.3, 0.08, 0.5, 2.2)]:
    tr.add(pad(nm, d, amp=a, att=att, rel=rel), tt, 0.0)
for tt, p, a in [(RV, 'D3', 0.14), (RM + 2, 'B2', 0.12), (RM + 4, 'G2', 0.12), (RM + 5, 'A2', 0.12), (RM + 6, 'A2', 0.1), (RM + 7, 'D3', 0.13)]: one(lute_soft(p, a, 3.0), 'pluck', tt, p, 0.9, 0.1)
SONG = [(3, 0), (1, 1), (4, 3),   (2, 4), (2, 3), (3, 2), (1, 1),   (2, 1), (2, 2), (3, 3), (1, 2),   (3, 1), (1, 2), (6, 0)]      # 加了附点的歌唱版：do· re sol —｜la sol mi· re｜re mi sol· mi｜re· mi do ——
for s, d, p in line(GONG, 74, 0.25, SONG): one(pipa(p, 0.14 if d > 0.6 else 0.12, 2.4, roll=(d - 0.15) if d > 0.6 else 0.0), 'pipa', RM + s, p, d, -0.15)
xs = line(GONG, 62, 0.25, SONG)
phrase(xiao_phrase, 'xiao', RM, xs[:7], pan=0.2, amp=0.07); phrase(xiao_phrase, 'xiao', RM, xs[7:-1] + [(xs[-1][0], 1.9, xs[-1][2])], pan=0.2, amp=0.075)
one(fan('D6', 0.1), 'fan', RV + 0.25, 'D6', 0.6, 0.2)
for b in range(4):
    for pos, kind, a in [(0.0, 'D', 0.085), (1.0, 'T', 0.035), (1.5, 'D', 0.05)]: tr.add(dum(a) if kind == 'D' else tak(a), RM + b * 2 + pos, 0.0 if kind == 'D' else 0.3)
A(drop(0.08, 587), 44.8, 0.1); one(fan('D6', 0.12), 'fan', T6 + 44.83, 'D6', 0.6, 0.1)     # 盘里的鱼眨一下眼
# 从盘面上浮起来：一声拨弦往上走，盘子里留下的花瓣轻轻一响
T7L = T6 + 45.9
tr.add(swish(0.05, 0.45, hi=True), T7L, -0.2)
for i, nm in enumerate(['D4', 'F#4', 'A4', 'D5']): one(lute_soft(nm, 0.11, 1.6), 'pluck', T7L + 0.05 + i * 0.07, nm, 0.2, -0.3 + i * 0.1)
one(fan('A5', 0.07), 'fan', T7L + 0.6, 'A5', 0.6, 0.3)
one(pipa('A4', 0.1, 1.8, roll=0.5), 'pipa', T7L + 1.2, 'A4', 0.6, -0.3); one(lute_soft('E4', 0.09, 2.0), 'pluck', T7L + 2.0, 'E4', 0.5, -0.4)

# ===== 捌 · 年画：锣鼓开道，唢呐把主题从头吹到尾（徵调式，落在 A），一拍 0.35 秒；后半句头三个音正好踩在四块色版上，
#       吹完时整张画也停够了；鱼一扭，溜了 =====
G8 = lambda k: 103.85 + 0.35 * k
tr.add(gong(0.07, big=False), G8(-10), 0.2)
tr.add(dum(0.08), G8(-9), 0.0); tr.add(dum(0.05), G8(-8.5), 0.0)
phrase(suona_phrase, 'suona', G8(-8), line(ZHI, 62, 0.175, [(1, 0), (2, 3), (1, 4), (2, 3), (1, 2), (1, 3),   (2, 4), (1, 3), (1, 4), (2, 2), (1, 3), (1, 2),
                                                             (2, 1), (2, 2), (4, 3),   (2, 1), (1, 2), (1, 1), (4, 0)]), pan=-0.2, amp=0.1)
YG = [(0, 'D', 0.095), (1, 'C', 0.04), (2, 'D', 0.075), (2.5, 'D', 0.055), (3, 'C', 0.045)]      # 秧歌的锣鼓点：咚 锵｜咚咚 锵，四拍一轮
for c in (-8, -4):
    for b, kind, a in YG: tr.add(dum(a) if kind == 'D' else gong(a, big=False), G8(c + b), 0.0 if kind == 'D' else 0.15)
tr.add(dum(0.06), G8(-0.5), 0.0)
for k, tc in enumerate([103.85, 104.2, 104.55, 104.9]):
    tr.add(thump(0.12), tc, 0.0); tr.add(dum(0.1 + 0.02 * k), tc, 0.0)
    tr.add(gong(0.06 + 0.02 * k, big=(k == 3)), tc + 0.01, 0.1 * (k - 1.5))
tr.add(cymbal(0.06, 1.2), 104.9, 0.25)
# 整张画印好了，停一会儿（娃娃笑了，眨一下眼）：小锣小鼓轻轻跟着
for b, kind, a in YG: tr.add(dum(a * 0.75) if kind == 'D' else gong(a * 0.85, big=False), G8(4 + b), 0.0 if kind == 'D' else 0.15)
tr.add(dum(0.08), G8(8), 0.0)
tr.add(swish(0.02, 0.3, hi=True), 105.85, -0.2)
T8SLIP = 107.22   # 鱼一扭，溜了
phrase(suona_phrase, 'suona', T8SLIP - 0.32, [(0, 0.15, 'A4'), (0.15, 0.15, 'B4'), (0.3, 0.4, 'E5')], pan=-0.2, amp=0.11, dyn=None)
tr.add(gong(0.08, big=False), T8SLIP, 0.3); tr.add(swish(0.06, 0.4, hi=True), T8SLIP + 0.08, -0.3)
phrase(suona_phrase, 'suona', 107.6, [(0, 0.2, 'F#5'), (0.2, 0.2, 'E5'), (0.4, 0.2, 'D5'), (0.6, 0.2, 'B4'), (0.8, 0.7, 'A4')], pan=-0.3, amp=0.11, dyn='dim')
for tt in [107.6, 108.0, 108.4]: tr.add(dum(0.08), tt, 0.0)
tr.add(gong(0.06, big=False), 108.6, 0.1)

# ===== 玖 · 剪纸：板胡拉主题（商调式，落在 E）。前半句拉完，剪刀进来——剪刀合一下，弓子走一个音；
#       展开成一对鱼时把后半句拉完；揭起来，一个五度翻上去 =====
T9CUT0, T9DET0, T9DROP0, T9OPEN0, T9OPEN1, T9LIFT = 111.0, 112.15, 113.15, 113.75, 114.65, 116.0
phrase(banhu_legato, 'banhu', 109.0, line(SHANG, 62, 0.125, [(3, 0), (1, 2), (3, 3), (1, 5),   (2, 4), (1, 5), (1, 4), (1, 3), (1, 4), (2, 2)]), pan=0.2, amp=0.09, port=0.05)
for k in range(4):
    tr.add(paiban(0.05 if k % 2 == 0 else 0.04), 109.0 + 0.5 * k, 0.3); one(lute_soft('E3' if k % 2 == 0 else 'B3', 0.06, 1.2), 'pluck', 109.0 + 0.5 * k, 'E3' if k % 2 == 0 else 'B3', 0.4, -0.2)
for k in range(11): tr.add(snip(0.05 + 0.02 * rng.random()), T9CUT0 + 0.05 + k * 0.1 + rng.random() * 0.02, 0.2)        # 沿轮廓走一圈：剪刀每 0.1 秒合一次
phrase(banhu_legato, 'banhu', T9CUT0 + 0.05, [(k * 0.1, 0.1, p) for k, p in enumerate(['A4', 'B4', 'A4', 'B4', 'D5', 'B4', 'A4', 'B4', 'A4', 'F#4', 'A4'])], pan=0.2, amp=0.065, port=0.02, vib=0.0, att=0.02, rel=0.08)
for k in range(10): tr.add(snip(0.03 + 0.015 * rng.random()), T9DET0 + k * 0.1 + rng.random() * 0.02, 0.1 + 0.02 * k)   # 细剪：轻一些
tr.add(rustle(0.7, 0.02), T9DET0 + 0.15, 0.0)     # 碎纸屑往下掉
phrase(banhu_legato, 'banhu', T9DET0, [(0, 0.2, 'B4'), (0.2, 0.2, 'D5'), (0.4, 0.2, 'B4'), (0.6, 0.4, 'A4')], pan=0.15, amp=0.07, port=0.03)
for tt in [T9CUT0 + 0.05, T9CUT0 + 0.55, T9DET0, T9DET0 + 0.6]: tr.add(paiban(0.035), tt, 0.3)
tr.add(rustle(0.5, 0.04), T9DROP0, 0.1)           # 余纸落下
tr.add(rustle(0.8, 0.06), T9OPEN0, -0.2)          # 展开
tr.add(rustle(0.22, 0.025), T9OPEN1, 0.0)         # 翻平，轻轻一弹
phrase(banhu_legato, 'banhu', T9OPEN0, [(0, 0.3, 'F#4'), (0.3, 0.3, 'A4'), (0.6, 0.65, 'B4'), (1.25, 0.35, 'F#4'), (1.6, 0.65, 'E4')], pan=0.1, amp=0.09)
one(lute_soft('B3', 0.06, 1.5), 'pluck', T9OPEN0, 'B3', 0.5, -0.2); one(lute_soft('E3', 0.07, 2.0), 'pluck', T9OPEN0 + 1.6, 'E3', 0.6, -0.2)
for tt in [T9OPEN1, T9OPEN0 + 1.6]: tr.add(paiban(0.035), tt, 0.3)
tr.add(rustle(0.4, 0.05), T9LIFT, -0.2)
phrase(banhu_legato, 'banhu', T9LIFT, [(0, 0.2, 'B4'), (0.2, 0.5, 'E5'), (0.7, 0.2, 'D5'), (0.9, 0.2, 'B4'), (1.1, 0.3, 'A4'), (1.4, 0.3, 'F#4'), (1.7, 0.9, 'E4')], pan=-0.2, amp=0.1, dyn='dim')

# ===== 拾 · 像素：芯片音乐。每一关正好把主题奏一遍，每升一级往上升一个调（D → E → F# → A）、加一个声部，旋律也跟着“分辨率”变细 =====
T10ON, T10UP, T10EAT4, T10TEAR, T10OFF = 119.0, [122.55, 125.95, 129.55], 133.1, 133.25, 134.75
tr.add(thump(0.12), T10ON, 0.0)
n = int(0.9 * SR); st = tv(n); tr.add(norm(np.sin(2 * np.pi * 50 * st) * (1 + 0.6 * np.sin(2 * np.pi * 7 * st)) * np.exp(-st / 0.3), 0.08), T10ON + 0.02, 0)
on = np.clip((tw - T10ON) / 0.2, 0, 1) * (1 - np.clip((tw - T10OFF) / 0.01, 0, 1)) * (tw < T10OFF + 0.01)
whine = np.sin(2 * np.pi * 7400 * t) * on * 0.0016; tr.L += whine; tr.R += whine
KEYS = [0, 2, 4, 7]
CHORDS = [(0, 4, 50, [0, 4, 7]), (4, 4, 47, [0, 3, 7]), (8, 2, 43, [0, 4, 7]), (10, 2, 45, [0, 4, 7]), (12, 2, 45, [0, 4, 7]), (14, 2, 50, [0, 4, 7])]   # (第几格, 几格, 低音, 和弦)：D｜Bm｜G A｜A D
LV2 = [0, 1, 3, 2, 4, 3, 2, 3, 1, 2, 3, 4, 1, 2, 0, 0]      # 第二关起的旋律：在骨架上添经过音，一格一个音（do re sol mi la sol mi sol｜re mi sol la re mi do —）
def chip_level(k, t0, t1):
    u = (t1 - t0) / 16; sh = KEYS[k]; base = 74 if k < 2 else 62
    def lead(m, tt, dd, a=1.0):
        tr.add(pulse(F(m), dd, duty=[0.125, 0.25, 0.25, 0.5][k], amp=[0.05, 0.05, 0.042, 0.036][k] * a, dec=0.6 if k == 0 else 0.0, vib=0.004 if k == 3 else 0.0), tt, -0.1)
    if k == 0:                                                        # 第一关：只有骨架
        for s, d, i in THEME: LOG.append(('chip', t0 + s * u, d * u, float(P(i, base) + sh))); lead(P(i, base) + sh, t0 + s * u, d * u * 0.92)
    else:
        j = 0
        while j < 16:
            n = 1
            while j + n < 16 and LV2[j + n] == LV2[j]: n += 1         # 连着的同一个音并成一个长音
            m = P(LV2[j], base) + sh; tt = t0 + j * u; LOG.append(('chip', tt, n * u, float(m)))
            if k == 2:                                                # 第三关：每个音拆成两个十六分，第二个翻高八度
                for h in range(2 * n): lead(m + (12 if h % 2 else 0), tt + h * u / 2, u / 2 * 0.9, 1.0 if h % 2 == 0 else 0.55)
            else:
                lead(m, tt, n * u * 0.92)
                if k == 3:                                            # 第四关：高八度叠一层、低四度跟一层，再加一个慢一格半的回声
                    tr.add(pulse(F(m + 12), n * u * 0.92, 0.25, 0.016), tt, 0.15); tr.add(pulse(F(P(LV2[j] - 2, base) + sh), n * u * 0.92, 0.25, 0.022), tt, 0.25)
                    if tt + 1.5 * u < t1 - 0.1: tr.add(pulse(F(m), min(n * u * 0.92, t1 - tt - 1.5 * u), 0.125, 0.012), tt + 1.5 * u, 0.4)
            j += n
    if k >= 1:                                                        # 低音
        for s, d, root, _ in CHORDS:
            if k == 1: tr.add(tri(F(root + sh), d * u * 0.95, 0.09), t0 + s * u, 0.0)
            else:
                for j in range(d): tr.add(tri(F(root + sh + (12 if j % 2 else 0)), u * 0.85, 0.085), t0 + (s + j) * u, 0.0)
    if k >= 2:                                                        # 鼓和分解和弦
        for j in range(16):
            if j % 4 == 0: tr.add(chipnoise(0.12, 0.06, 0.04), t0 + j * u, 0.0)
            elif j % 4 == 2: tr.add(chipnoise(0.08, 0.04, 0.02, hi=True), t0 + j * u, 0.1)
            else: tr.add(chipnoise(0.04, 0.018, 0.01, hi=True), t0 + j * u, 0.2)
        sub = 2 if k == 2 else 3
        for s, d, root, ch in CHORDS:
            for j in range(d * sub): tr.add(pulse(F(root + 12 + ch[j % 3] + sh), u / sub * 0.9, 0.5, 0.02), t0 + s * u + j * u / sub, 0.3)
chip_level(0, T10ON + 0.45, T10UP[0])
chip_level(1, T10UP[0] + 0.25, T10UP[1])
chip_level(2, T10UP[1] + 0.25, T10UP[2])
chip_level(3, T10UP[2] + 0.25, T10EAT4)
# 每一关的游戏音效（和画面 film/s10.js 的 EV10 对齐）：1980 吃一颗豆“咔”一下；1989、1995 吃金币“叮”；1995 鱼钩垂下来、“！”、空提上去；
# 2003 吞小鱼“咕”。音高都在这一关的调里。用自己的随机数，后面所有声音不受影响
import audio_lib as _alG
_rngG_main = _alG.rng; _alG.rng = np.random.default_rng(10)
def chirp(f0, f1, dur, amp, duty=0.25):
    n = int(dur * SR); tt = tv(n); f = f0 * (f1 / f0) ** (tt / dur); ph = np.cumsum(f / SR) % 1.0
    return np.where(ph < duty, 1.0, -1.0) * amp * np.clip(tt / 0.003, 0, 1) * np.clip((dur - tt) / 0.008, 0, 1)
MUS10 = [(T10ON + 0.45, T10UP[0]), (T10UP[0] + 0.25, T10UP[1]), (T10UP[1] + 0.25, T10UP[2]), (T10UP[2] + 0.25, T10EAT4)]
cellT = lambda k, c: MUS10[k][0] + c * (MUS10[k][1] - MUS10[k][0]) / 16
for c in [0, 2, 4, 5, 6, 8, 9, 10, 12, 14]: tr.add(chirp(700, 260, 0.06, 0.02, 0.5), cellT(0, c), 0.15)          # 吃豆：就踩在主题的每个音上
def coin(tt, a, b): tr.add(pulse(F(a), 0.05, 0.5, 0.026), tt, 0.2); tr.add(pulse(F(b), 0.13, 0.5, 0.026, dec=0.08), tt + 0.05, 0.2)
for c in range(2, 15, 2): coin(cellT(1, c), 'B5', 'E6')                                                            # 1989 的金币（E 调）
H_IN, H_ALERT, H_STRIKE = (126.42, 126.8), 126.8, 127.26                                                           # 鱼钩（和 film/s10.js 的 HOOK10 一致）
tr.add(chirp(1300, 520, H_IN[1] - H_IN[0], 0.015, 0.125), H_IN[0], 0.35)
for j in range(2): tr.add(pulse(F('C#7'), 0.04, 0.5, 0.028), H_ALERT + 0.07 * j, 0.0)
tr.add(chipnoise(0.18, 0.04, 0.07, hi=True), H_STRIKE, 0.35); tr.add(chirp(380, 1700, 0.16, 0.02, 0.5), H_STRIKE, 0.35)
for j, nm in enumerate(['C#6', 'F#6', 'A#6']): tr.add(pulse(F(nm), 0.05, 0.5, 0.022, dec=0.06), H_STRIKE + 0.12 + 0.045 * j, 0.0)   # 躲过去了：+500
for c in [8, 10, 12, 14]: coin(cellT(2, c), 'C#6', 'F#6')                                                          # 1995 的金币（F# 调）
for c in [4, 8, 12]: tt = cellT(3, c); tr.add(chirp(1500, 420, 0.09, 0.028, 0.25), tt, 0.0); tr.add(chipnoise(0.05, 0.014, 0.02), tt, 0.0)   # 2003：吞小鱼
for tt in [cellT(3, c) - 0.2 for c in [4, 8, 12]] + [T10EAT4 - 0.15]: tr.add(chirp(240, 900, 0.16, 0.009, 0.5), tt, -0.2); tr.add(chipnoise(0.14, 0.012, 0.09, hi=True), tt, -0.2)   # 每一扑前“嗖”一下
_alG.rng = _rngG_main
for k, tu in enumerate(T10UP + [T10EAT4]):      # 升级的那一声：直接用下一关的主和弦往上跑
    root = 62 + [2, 4, 7, 9][k]
    tr.add(pulse(F(root + 24), 0.05, 0.5, 0.06), tu - 0.04, 0.2)
    for j, iv in enumerate([0, 4, 7, 12, 16]): tr.add(pulse(F(root + 12 + iv), 0.05, 0.25, 0.045), tu + 0.03 + j * 0.045, 0.1)
# 吃到最后一颗：音高一路往上冲，然后整段音乐开始坏掉
n = int(0.5 * SR); st = tv(n); tr.add(np.where((np.cumsum(220 * 2 ** (st * 8) / SR) % 1) < 0.5, 1, -1) * 0.033 * (1 - st / 0.5), T10EAT4, 0)
frag = np.zeros(int(0.25 * SR))
for j, nm in enumerate(['A5', 'E6', 'F#6']): seg = pulse(F(nm), 0.08, 0.25, 0.08); frag[int(j * 0.083 * SR):int(j * 0.083 * SR) + len(seg)] += seg[:len(frag) - int(j * 0.083 * SR)]
tt = T10TEAR; k = 0
while tt < T10OFF - 0.05:
    p = (tt - T10TEAR) / (T10OFF - T10TEAR); L_ = int(len(frag) * (1 - 0.6 * p)); g = frag[:max(400, L_)]
    g = crush(g * (0.5 + 0.25 * p), bits=max(2, int(5 - 3 * p)), down=int(2 + 10 * p)); tr.add(lp(g, 5200) * 0.85, tt, (rng.random() - 0.5) * 0.6)
    if rng.random() < 0.4: tr.add(chipnoise(0.06, 0.03 * p + 0.008, 0.03, hi=True), tt + 0.02, 0)
    tt += len(g) / SR * (0.7 + 0.3 * rng.random()); k += 1
trA = tr; tr = Track(DUR)
# 显像管关机（放在后一轨，不会被切掉）：完整的一声下坠的“嗞”、继电器一响、静电噼啪、啸叫慢慢落下去
n = int(0.42 * SR); st = tv(n); tr.add(norm(np.sin(2 * np.pi * np.cumsum(1500 * np.exp(-st / 0.07) + 55) / SR) * np.exp(-st / 0.13) * (1 - np.exp(-st / 0.004)), 0.11), T10OFF, 0)
tr.add(thump(0.08), T10OFF + 0.03, 0)
for k in range(12):
    tt = T10OFF + 0.05 + (k / 12) ** 1.6 * 0.9 + rng.random() * 0.03; tr.add(hp(tick(0.022 * (1 - k / 14)), 1800), tt, (rng.random() - 0.5) * 0.8)
n = int(0.9 * SR); st = tv(n); tr.add(np.sin(2 * np.pi * np.cumsum(7400 * (1 - 0.35 * st / 0.9)) / SR) * 0.0016 * np.exp(-st / 0.3), T10OFF, 0.0)

# ===== 拾壹 · 代码：只剩一个长音和敲键盘的声音。十行 drawXxx，一行一个音——每一站用自己的乐器，把主题从头拼一遍 =====
T11BACK, TG1, T_FIN = 152.5, 157.0, 164.0     # 镜头开始拉远；大鱼拼成；全片转黑
rdur = T11BACK + 0.4 - T10OFF
rn = int(rdur * SR); rs = np.arange(rn) / SR; tr.add(roomtone(rn, 0.024) * np.clip(rs / 0.05, 0, 1) * (0.5 + 0.5 * np.clip(rs / 2.6, 0, 1) ** 1.5) * np.clip((rdur - rs) / 1.2, 0, 1), T10OFF, 0.0)
tr.add(tick(0.012), T10OFF + 0.75, -0.2); tr.add(tick(0.008), T10OFF + 1.55, 0.15)   # 显像管凉下来的两声轻响
tr.add(drone('D3', T11BACK + 0.9 - (T10OFF + 1.45), amp=0.07, att=2.6, rel=2.2), T10OFF + 1.45, 0.0)
# 打字声跟着画面里的打字日程走（film/s11.js 的 CPLAN：每行 [开始时刻, 每秒几个字, 打多少个字]）
CPLAN = [[136.6, 70, 22], [136.959, 70, 27], [137.39, 70, 21], [137.735, 70, 36], [138.294, 70, 32], [138.796, 70, 20], [139.127, 70, 51], [139.901, 70, 43], [140.56, 70, 49], [141.305, 70, 47],
         [142.021, 70, 3], [142.109, 70, 25], [142.511, 70, 1], [142.571, 70, 0], [142.871, 30, 22]]
TK = [144.30, 145.08, 145.82, 146.52, 147.18, 147.80, 148.38, 148.93, 149.45, 149.95]   # 十行 drawXxx 各自打完（回车）的时刻
def typing(t0, t1, rate, amp=0.038, t_in=None):
    tt = t0
    while tt < t1:
        a = amp + 0.025 * rng.random()
        if t_in is not None: a *= float(np.clip((tt - t_in) / 0.9, 0.25, 1.0))
        tr.add(keyclick(a), tt, 0.3 * (rng.random() - 0.5)); tt += (0.65 + 0.7 * rng.random()) / rate
for t0, cps, n in CPLAN:
    t1 = t0 + n / cps
    if n > 0 and t1 > 137.6: typing(max(t0, 137.6), t1, 26 if cps > 40 else 14, amp=0.05, t_in=137.4)
for k, tk in enumerate(TK):
    typing(tk - 0.2, tk - 0.03, 26, amp=0.036)                                       # 打出这一行
    tr.add(keyclick(0.062), tk, 0.0)                                                  # 回车
# 主题的十个音（宫调式）：D A B A F# ｜ E F# A E D。埙、石磬、排箫、编钟、笛子（带一声拍板）、古琴、琵琶、唢呐、板胡、方波
NOTE10 = [P(i) for s, d, i in THEME]
gap = [TK[k + 1] - TK[k] for k in range(9)] + [0.5]
flash = [lambda p, d: xun_phrase([(0, d, p)], amp=0.085, vib=0.05, att=0.05, rel=0.2), lambda p, d: qing(p, 0.075, 2.2), lambda p, d: paixiao_phrase([(0, d, p)], amp=0.075),
         lambda p, d: zhong(p, 0.08, 2.5), lambda p, d: dizi_phrase([(0, d, p)], amp=0.055), lambda p, d: qin(p, 0.11, 3.0), lambda p, d: pipa(p, 0.09, 1.6),
         lambda p, d: suona_phrase([(0, d * 0.8, p)], amp=0.05), lambda p, d: banhu_legato([(0, d * 0.85, p)], amp=0.06), lambda p, d: pulse(F(p), 0.3, 0.25, 0.04, dec=0.25)]
for k in range(10): one(flash[k](NOTE10[k], gap[k] * 0.9), 'code', TK[k] + 0.02, NOTE10[k], gap[k], -0.4 + k * 0.08)
tr.add(paiban(0.05), TK[4] + 0.02, 0.0)
one(crush(pulse(F('D5'), 0.13, 0.5, 0.04), 2, 12), 'code', TK[-1] + 0.32, 'D5', 0.13, 0.4)   # 像素那一行连着的第二声：高八度
one(fan('A4', 0.035, 3.0), 'fan', TK[-1] + 0.8, 'A4', 0.6, 0.0)                              # 换回骨架
typing(150.95, 151.8, 24, amp=0.04); tr.add(keyclick(0.07), 151.84, 0.0)                    # 最后一行：渲染全片的循环
one(qing('A5', 0.06, 2.5), 'qing', 151.95, 'A5', 0.5, 0.1); one(fan('E6', 0.045, 4.0), 'fan', 151.97, 'E6', 0.5, -0.1)   # 它跑起来：停在属音上，等终章解决

# ===== 终章：镜头拉开，主题完整奏一遍（宫调式）。前半句还是光秃秃的骨架，埙领着，每个音添一件乐器；大鱼拼成的那一下进后半句，全体，唱出来 =====
F0 = T11BACK + 0.05; bf = (TG1 - F0) / 8; nt = lambda k: F0 + k * bf
phrase(xun_phrase, 'xun', F0, [(0, 2 * bf, 'D4'), (2 * bf, 2 * bf, 'A4'), (4 * bf, bf, 'B4'), (5 * bf, bf, 'A4'), (6 * bf, 2 * bf, 'F#4')], pan=0.05, amp=0.13, vib=0.12)
for k, p, a, kw in [(0, 'D3', 0.2, dict(vib=0.12)), (2, 'A3', 0.15, {}), (4, 'B2', 0.17, {}), (6, 'F#3', 0.14, {})]: one(qin(p, a, 6.0, **kw), 'qin', nt(k), p, 1.0, -0.1)
for j, (k, p) in enumerate([(0, 'D5'), (2, 'A5'), (4, 'B5'), (5, 'A5'), (6, 'F#5')]): one(fan(p, 0.06 + 0.005 * j, 4.5), 'fan', nt(k) + 0.03, p, 0.5, -0.3 + 0.15 * j)
phrase(paixiao_phrase, 'paixiao', nt(4), [(0, bf, 'B4'), (bf, bf, 'A4'), (2 * bf, 2 * bf - 0.1, 'F#4')], pan=-0.25, amp=0.06)
tr.add(pad(['D3', 'A3', 'D4', 'F#4'], 2.7, amp=0.05, att=1.6, rel=0.9), F0 - 0.1, 0.0)
tr.add(pad(['B2', 'F#3', 'B3', 'D4'], 2.6, amp=0.075, att=0.9, rel=0.5), nt(4) - 0.15, 0.0)
tr.add(bowed('D3', 0.045, 4.7, att=2.6, rel=0.5), F0 + 0.1, 0.0)
for j in range(14): tr.add(lute(P(j + 2, 50), 0.022 + 0.004 * j, 1.8), TG1 - 0.42 + j * 0.03, -0.6 + j * 0.09)        # 一串刮奏把后半句托出来
# 大鱼成形、灯亮：低钟、陶鼓（呼应开头）、建鼓；笛子领后半句，二胡低八度跟着，琵琶轮指，和声 G A｜A D
tr.add(zhong('D3', 0.12, 6.5), TG1, 0.0); tr.add(zhong('B3', 0.05, 5.0), TG1 + 0.02, 0.1); tr.add(claydrum(0.07, 62, 0.6), TG1, 0.0); tr.add(jiangu(0.09, 62, 0.6), TG1, 0.0)
FB = [(2, 1), (2, 2), (3, 3), (1, 2),   (3, 1), (1, 2), (11, 0)]      # 和出窑时同一个歌唱版的后半句：re mi sol· mi｜re· mi do ——
phrase(dizi_phrase, 'dizi', TG1, line(GONG, 74, bf / 2, FB), pan=-0.15, amp=0.095, vib=0.14)
phrase(erhu_phrase, 'erhu', TG1, line(GONG, 62, bf / 2, FB), pan=0.25, amp=0.085)
for s, d, p in line(GONG, 62, bf / 2, FB): one(pipa(p, 0.1, 2.2, roll=(min(d, 1.6) - 0.15) if d > 0.7 else 0.0), 'pipa', TG1 + s, p, d, -0.35)
for nm, s, d, a, att, rel in [(['G2', 'D3', 'G3', 'B3'], -0.1, 2 * bf + 0.35, 0.085, 0.3, 0.5), (['A2', 'E3', 'A3', 'B3'], 2 * bf - 0.1, 4 * bf + 0.4, 0.08, 0.35, 0.7),
                              (['D2', 'A2', 'D3', 'A3', 'D4', 'F#4'], 6 * bf - 0.1, 5.2, 0.085, 0.5, 3.6)]:
    tr.add(pad(nm, d, amp=a, att=att, rel=rel), TG1 + s, 0.0)
for s, p, a in [(0, 'G2', 0.15), (2 * bf, 'A2', 0.14), (4 * bf, 'A2', 0.11), (6 * bf, 'D3', 0.15)]: one(lute_soft(p, a, 3.5), 'pluck', TG1 + s, p, 1.0, 0.1)
one(fan('D6', 0.08, 5.0), 'fan', nt(10), 'D6', 0.6, 0.15); tr.add(dum(0.07), nt(10), 0.0)
tr.add(thump(0.05), TG1 + 2.52, 0.1)   # 墙上片名的印
# 落回主音：古琴、低钟；泛音飘上去
one(qin('D3', 0.17, 7.0, vib=0.1), 'qin', nt(14), 'D3', 2.0, -0.1); one(zhong('D3', 0.07, 6.0), 'bell', nt(14), 'D3', 2.0, 0.1); tr.add(jiangu(0.06, 62, 0.6), nt(14), 0.0)
one(fan('A5', 0.045, 5.0), 'fan', nt(14) + 1.15, 'A5', 0.6, 0.2)
# 最老的那支埙留到最后：还是开头那个五度，往上一挑，不落下来——鱼还在游
phrase(xun_phrase, 'xun', nt(14) + 1.3, [(0, 1.0, 'D4'), (1.0, 2.3, 'A4')], pan=0.05, amp=0.1, vib=0.12, rel=0.9)
tr.add(thump(0.06), T_FIN + 0.3, 0.0)     # 黑卡：片名和印一起浮出来，这一下让它落定
# 逗号活过来：一滴水的轻响，一下小小的摆尾，往左游走
tr.add(drop(0.05, 740), T_FIN + 1.55, -0.1); tr.add(swish(0.02, 0.3, hi=True), T_FIN + 1.9, -0.3); one(fan('A5', 0.05, 4.0), 'fan', T_FIN + 1.6, 'A5', 0.6, -0.2)   # 和画面里的 tc 一起挪

tq = W5(WE(tv(trA.N))); src = 1 - np.clip((tq - T10OFF) / 0.015, 0, 1); trA.L *= src; trA.R *= src
AL, AR = mixdown(trA, wet=0.42, ir_dur=3.4, ir_dec=0.95)
tm = tv(len(AL))
# 拉平的增益在切断之前算，并且从“吃到最后一颗”起冻结——不让后面的寂静把坏掉那段推响
gA, ref = level_gain(AL, AR); i0 = int(WEinv(Winv(T10EAT4 - 0.6)) * SR); gA[i0:] = gA[i0]
tmw = W5(WE(tm)); muf = np.clip((tmw - T10OFF) / 0.6, 0, 1) ** 0.7; tail = np.where(tmw < T10OFF, 1.0, np.exp(-np.clip(tmw - T10OFF, 0, None) / 0.42))
AL = (AL * (1 - muf) + lp(lp(AL, 700), 900) * muf) * gA * tail; AR = (AR * (1 - muf) + lp(lp(AR, 700), 900) * muf) * gA * tail
BL, BR = mixdown(tr, wet=0.42, ir_dur=3.4, ir_dec=0.95, seedL=7, seedR=8)
# 后一轨（代码站 + 终章）的电平是个定值：敲键盘和那个长音的响度不跟着终章的编配变
import os
gB = float(os.environ.get('GB', '0.84')); print('gB', gB, 'ref', round(float(ref), 4))
ML, MR = soft_limit(AL + BL * gB, AR + BR * gB, 0.99)
write_wav(OUT, ML, MR, fade_out=1.2)
if os.environ.get('NOTES'): json.dump(LOG, open(OUT.replace('.wav', '.notes.json'), 'w'))    # NOTES=1 时把每个音记下来，画钢琴卷帘检查用
