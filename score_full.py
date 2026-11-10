# 全片配乐：按时间轴把各站拼起来
import numpy as np, sys
from audio_lib import *
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 154.0
OUT = sys.argv[2] if len(sys.argv) > 2 else 'score_full.wav'
tr = Track(DUR); N = tr.N; t = tv(N)
tr.add(roomtone(N, 0.012) * np.clip((t - 0.6) / 2.0, 0, 1), 0, 0)

# ===== 开场 + 壹 · 彩陶（陶埙、陶鼓、水） =====
tr.add(xun_phrase([(0, 2.2, 'A3'), (2.3, 0.9, 'D4'), (3.2, 0.5, 'C4'), (3.7, 1.9, 'A3')], amp=0.2, vib=0.14, breath=0.07), 1.2, -0.05)
tr.add(thump(0.1), 4.75, 0.15)
tr.add(xun_phrase([(0, 0.8, 'D4'), (0.8, 0.5, 'F4'), (1.3, 0.4, 'G4'), (1.7, 1.3, 'A4'), (3.0, 0.35, 'G4'), (3.35, 1.4, 'D4')], amp=0.19, vib=0.13), 7.0, 0.05)
tr.add(claydrum(0.11, 70, 0.5), 9.3, 0)
for i, tt in enumerate([11.0, 11.27, 11.49, 11.71]): tr.add(drop(0.06, 380 + 40 * i), tt + 0.03, [-0.3, 0.35, 0.1, -0.15][i])
wenv = np.clip((t - 11.0) / 1.5, 0, 1) * (1 - 0.85 * np.clip((t - 20.4) / 0.5, 0, 1)) + 0.35 * np.clip((t - 22.6) / 1.0, 0, 1) * (1 - np.clip((t - 25.5) / 1.5, 0, 1))
wv = water(N, 0.016); tr.L += wv * np.clip(wenv, 0, 1); tr.R += np.roll(wv, 2000) * np.clip(wenv, 0, 1)
for k in range(14):
    tt = 12.0 + k * 0.6 + rng.random() * 0.4
    if tt < 20.2: tr.add(drop(0.025, 300 + rng.random() * 200), tt, rng.random() * 1.2 - 0.6)
tr.add(xun_phrase([(0, 0.9, 'A4'), (0.9, 0.4, 'C5'), (1.3, 0.4, 'A4'), (1.7, 0.8, 'G4'), (2.5, 0.5, 'F4'), (3.0, 1.6, 'D4')], amp=0.17, vib=0.14), 12.0, -0.1)
for tt in np.arange(12.4, 15.0, 1.3): tr.add(claydrum(0.07, 74, 0.35), tt, 0)
cell = ['A3', 'C4', 'D4', 'C4']; tt = 13.6; i = 0
while tt < 20.3:
    p = (tt - 13.6) / (20.3 - 13.6); loose = 1 - p; beat = lerp(0.62, 0.36, p); jitter = (rng.random() - 0.5) * 0.12 * loose
    tr.add(xun_note(cell[i % 4], beat * 0.85, amp=lerp(0.05, 0.13, p), vib=0.08 * loose, breath=0.05, rel=0.12, att=0.04), tt + jitter, 0.25 * np.sin(i * 0.7))
    if i % 4 == 0: tr.add(claydrum(lerp(0.04, 0.12, p), 76, 0.25), tt + jitter * 0.5, 0)
    elif i % 2 == 0 and p > 0.4: tr.add(claydrum(lerp(0.02, 0.06, p), 110, 0.12), tt, 0.1)
    tt += beat; i += 1
tr.add(xun_phrase([(0, 1.2, 'F4'), (1.2, 0.6, 'D4'), (1.8, 2.0, 'C4')], amp=0.08, vib=0.15), 15.6, -0.35)
for t0, d, pan in [(15.8, 4.8, -0.2), (16.2, 4.4, 0.2)]:
    n = int(d * SR); st = tv(n); x = bandnoise(n, 2600, 2.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * st) ** 2); tr.add(norm(x * np.sin(np.pi * st / d) ** 1.5, 0.012), t0, pan)
for tt in [20.3, 20.6, 20.9]: tr.add(claydrum(0.15, 72, 0.4), tt, 0); tr.add(tick(0.03), tt, 0.2)
tr.add(xun_phrase([(0, 1.5, 'D4')], amp=0.07, vib=0.0, breath=0.16, flutter=0.55, rel=0.2, att=0.3), 20.45, -0.2)
for k in range(9): tr.add(swish(0.02 + 0.01 * rng.random(), 0.12, hi=True), 20.5 + k * 0.16 + rng.random() * 0.05, rng.random() * 0.8 - 0.4)
tr.add(swish(0.09, 0.22, hi=True), 21.88, -0.2)
for k in range(30): tr.add(tick(0.015 + 0.03 * rng.random()), 22.05 + rng.random() * 0.45, rng.random() * 1.4 - 0.7)
tr.add(tick(0.08), 22.56, -0.3); tr.add(tick(0.05), 22.58, -0.2)
tr.add(xun_phrase([(0, 0.35, 'D4'), (0.35, 0.35, 'A4'), (0.7, 0.9, 'D5')], amp=0.2, vib=0.18, breath=0.1, port=0.22, over=0.6, scoop=1.2), 22.25, -0.25)
tr.add(swish(0.06, 0.5), 22.7, -0.4)
tr.add(claydrum(0.2, 66, 0.55), 23.35, -0.3); tr.add(thump(0.08), 23.36, -0.3)
tr.add(xun_phrase([(0, 0.9, 'D5'), (0.9, 0.4, 'C5'), (1.3, 1.6, 'A4')], amp=0.16, vib=0.15), 23.8, -0.15)

# ===== 贰 · 甲骨（石磬、低鸣；灼与裂） =====
tr.add(qing('D5', 0.12), 24.65, -0.3)
tr.add(drone('D2', 8.6, 0.05, 2.5, 2.0), 25.4, 0)
for tt, p, a in [(26.5, 'A4', 0.09), (27.6, 'G4', 0.08), (28.5, 'E4', 0.08)]: tr.add(qing(p, a), tt, 0.2 * np.sin(tt))
tr.add(qing('D4', 0.13), 29.28, 0.1); tr.add(jiangu(0.08, 64, 0.5), 29.28, 0)
tr.add(crackle(1.0, 0.06, 34), 29.45, 0.1)
n = int(0.95 * SR); st = tv(n); tr.add(norm(lp(np.cumsum(rng.standard_normal(n)), 120) * np.clip(st / 0.85, 0, 1), 0.07), 29.4, 0)
n = int(0.85 * SR); st = tv(n); tr.add(norm(hp(rng.standard_normal(n), 3500) * np.clip(st / 0.8, 0, 1) ** 2 * (1 - np.clip((st - 0.8) / 0.05, 0, 1)), 0.02), 29.45, 0.1)   # 灼：嘶嘶的火声
tr.add(bonecrack(0.3), 30.3, 0.1); tr.add(bonecrack(0.16), 30.47, -0.1); tr.add(thump(0.05), 30.3, 0.0)
tr.add(swish(0.07, 0.3, hi=True), 30.95, -0.3)
tr.add(qing('A5', 0.1), 31.35, -0.4); tr.add(qing('D5', 0.08), 32.2, -0.3)

# ===== 叁 · 汉画像石（排箫、建鼓；起罾、溜走） =====
tr.add(paixiao_phrase([(0, 0.6, 'D5'), (0.6, 0.4, 'E5'), (1.0, 0.5, 'D5'), (1.5, 0.4, 'B4'), (1.9, 1.4, 'A4')], amp=0.13), 33.1, 0.1)
for tt in [34.0, 35.0]: tr.add(jiangu(0.12, 58, 0.6), tt, 0)
tr.add(paixiao_phrase([(0, 0.5, 'G4'), (0.5, 0.5, 'A4'), (1.0, 1.2, 'B4')], amp=0.11), 35.0, -0.1)
# 起罾：鼓越敲越密
for k, tt in enumerate(np.cumsum([0.22, 0.19, 0.16, 0.13, 0.11, 0.09])): tr.add(jiangu(0.06 + 0.012 * k, 70, 0.25), 36.05 + tt, 0.05)
tr.add(paixiao_phrase([(0, 0.7, 'D5'), (0.7, 0.3, 'E5')], amp=0.1, vib=0.2), 36.35, 0.2)
# 网出水：哗一下，水从网眼往下淌
tr.add(splash(0.06), 36.6, 0.25)
for k in range(16): tr.add(drop(0.012 + 0.01 * rng.random(), 600 + rng.random() * 700), 36.7 + k * 0.055 + rng.random() * 0.04, 0.2 + 0.2 * (rng.random() - 0.5))
# 网兜住正在游的鱼，把它颠起来一小下，落回网里
tr.add(thump(0.025), 36.9, 0.2); tr.add(splash(0.022), 36.91, 0.25)
# 扑腾两下：湿的拍打，落回网里
for tt in [37.12, 37.62]:
    tr.add(tick(0.06), tt, 0.2); tr.add(splash(0.04), tt + 0.02, 0.25); tr.add(thump(0.035), tt + 0.38, 0.2); tr.add(splash(0.025), tt + 0.38, 0.2)
# 跃出网口，落水
tr.add(swish(0.06, 0.45), 38.18, 0.1)
tr.add(splash(0.14), 38.86, -0.05)
tr.add(paixiao_phrase([(0, 0.4, 'E5'), (0.4, 0.4, 'D5'), (0.8, 0.4, 'B4'), (1.2, 0.4, 'A4'), (1.6, 0.4, 'G4'), (2.0, 1.2, 'E4')], amp=0.12), 39.1, -0.2)
for tt in [39.6, 40.4, 41.2]: tr.add(jiangu(0.1, 60, 0.5), tt, 0)

# ===== 肆 · 双鱼铜洗（编钟） =====
tr.add(bell('D4', 0.12), 41.15, -0.2)
tr.add(bell('A4', 0.09), 42.3, 0.2)
tr.add(drone('D3', 5.5, 0.03, 1.5, 2.0), 42.6, 0)
tr.add(bell('F#4', 0.08), 43.6, -0.1)
tr.add(bell('A4', 0.11), 44.6, -0.35); tr.add(bell('D5', 0.11), 44.75, 0.35); tr.add(bell('F#5', 0.09), 45.15, 0)
tr.add(bell('E4', 0.08), 46.45, -0.4); tr.add(bell('D4', 0.07), 47.6, -0.4)

# ===== 伍 · 磁州窑（笛子、拍板；几笔画成，针剔白鳞） =====
tr.add(paiban(0.08), 48.1, 0)
for k, dt in enumerate([0.0, 0.15, 0.52, 0.66, 0.76, 0.86]): tr.add(swish(0.05 + 0.02 * (k == 1), 0.18 + 0.2 * (k == 1)), 49.0 + dt, 0.15 - 0.05 * k)
for j in range(6): tr.add(swish(0.028, 0.16, hi=True), 49.12 + 0.13 * j, -0.4 + 0.16 * j)   # 水草一丛丛刷出来
for i in range(6): tr.add(swish(0.018, 0.12, hi=True), 49.85 + 0.09 * i, 0.2)
for k in range(24): tr.add(scratch(0.05 + rng.random() * 0.04, 0.02 + rng.random() * 0.015), 50.15 + k * 0.045 + rng.random() * 0.02, 0.2)
tr.add(scratch(0.25, 0.03), 51.25, 0.1); tr.add(scratch(0.15, 0.025), 51.45, 0.1)
for tt in np.arange(50.5, 54.6, 0.5): tr.add(paiban(0.06 if int((tt - 50.5) / 0.5) % 2 else 0.08), tt, 0.3)
tr.add(dizi_phrase([(0, 0.25, 'D5'), (0.25, 0.25, 'E5'), (0.5, 0.5, 'G5'), (1.0, 0.25, 'E5'), (1.25, 0.25, 'D5'), (1.5, 0.5, 'B4'), (2.0, 0.25, 'D5'), (2.25, 0.25, 'E5'), (2.5, 1.0, 'A5')], amp=0.12), 50.5, -0.15)
tr.add(dizi_phrase([(0, 0.25, 'G5'), (0.25, 0.25, 'E5'), (0.5, 0.25, 'D5'), (0.75, 0.25, 'B4'), (1.0, 0.8, 'D5')], amp=0.11), 53.6, -0.2)


# ===== 陆 · 宋画（古琴）、柒 · 元青花（弹拨、手鼓）：样片 v3 的配乐整体后移 =====
T6 = 51.7
def A(sig, tv0, pan=0.0):
    if tv0 + T6 < 55.2: return
    tr.add(sig, tv0 + T6, pan)
for tt, nm, kw, pan in [(3.6, 'A3', {}, 0.2), (5.0, 'B3', dict(slide='up'), 0.0), (7.4, 'D3', dict(vib=0.12), -0.2)]:
    A(drop(0.09), tt, pan); A(qin(nm, 0.24, 7.0, **kw), tt + 0.03, pan)
A(qin('F#3', 0.18, 6.0, slide='down'), 6.3, 0.1); A(fan('D5', 0.09), 7.45, 0.3)
A(drop(0.07), 8.75, 0.0); A(fan('F#5', 0.13), 8.78, 0.0); A(drop(0.045), 9.1, 0.05)
A(drop(0.07), 9.2, 0.5); A(qin('E4', 0.12, 5.0), 9.22, 0.5)
A(qin('B3', 0.2, 6.0, slide='up'), 9.95, 0.0)
A(drop(0.07), 11.0, -0.3); A(fan('A5', 0.1), 11.03, -0.3)
for tt, nm, kw in [(11.6, 'D4', {}), (12.3, 'B3', {}), (13.0, 'A3', dict(slide='down')), (13.9, 'F#3', dict(vib=0.1))]: A(qin(nm, 0.17, 6.0, **kw), tt, -0.1)
for i, nm in enumerate(['D6', 'A5', 'F#5', 'D5']): A(fan(nm, 0.1), 14.6 + i * 0.6, 0.4 - i * 0.25)
A(qin('D3', 0.22, 9.0, vib=0.25), 17.6, 0.0); A(fan('A4', 0.08), 19.4, 0.2)
A(qin('E3', 0.18, 5.0, slide='up'), 20.5, 0.3); A(lute_soft('F#4', 0.12, 2.0, trem=0.9), 20.95, -0.3)
A(qin('D3', 0.18, 5.0, slide='down'), 21.5, 0.3); A(lute_soft('A4', 0.13, 2.0, trem=0.7), 21.95, -0.3)
A(dum(0.18), 22.6); A(lute_soft('A4', 0.16), 22.6, -0.1)
for tt, nm in [(23.0, 'G4'), (23.4, 'F#4'), (23.8, 'Eb4')]: A(lute_soft(nm, 0.15), tt, -0.1)
A(lute_soft('D4', 0.15, 2.5, trem=1.1), 24.2, -0.1); A(dum(0.15), 24.2)
A(tak(0.06), 25.0, 0.3); A(dum(0.12), 25.4); A(tak(0.06), 25.8, 0.3)
for i, nm in enumerate(['D3', 'A3', 'D4']): A(lute_soft(nm, 0.2 if i == 0 else 0.15, 3.0), 26.45 + i * 0.02, -0.2 + i * 0.2)
A(dum(0.2), 26.45)
for i, kind in enumerate(['d', 't', 'd', 'd', 't', 'd']): A(dum(0.09) if kind == 'd' else tak(0.05), 26.9 + i * 0.75, 0.1 if kind == 't' else 0.0)
for tt, nm in [(27.0, 'D4'), (27.4, 'F#4'), (27.8, 'A4'), (28.5, 'G4'), (28.9, 'F#4'), (29.3, 'Eb4')]: A(lute_soft(nm, 0.11), tt, 0.15)
A(lute_soft('D4', 0.11, 2.5, trem=0.8), 29.7, 0.15)
for tt in [26.2, 26.8, 27.2, 28.4]: A(swish(0.035), tt, rng.random() * 0.6 - 0.3)
sw_n = int(1.4 * SR); st = tv(sw_n); A(norm(lowpass(rng.standard_normal(sw_n), 31) * np.sin(np.pi * st / 1.4) ** 2, 0.05), 31.0)
A(bowed_soft('A3', 0.09, 3.2), 31.0, 0.0)
heat = np.clip((t - (T6 + 32.8)) / 2.0, 0, 1) * (1 - np.clip((t - (T6 + 35.6)) / 1.0, 0, 1))
br = np.cumsum(rng.standard_normal(N)); br = br - lowpass(br, 3000); br = lowpass(br, 60); br /= np.max(np.abs(br)) + 1e-9
rum = br * heat * 0.24 + np.sin(2 * np.pi * 55 * t) * heat * 0.05; tr.L += rum; tr.R += np.roll(rum, 300)
for i in range(110):
    tt = 33.0 + rng.random() * 3.2; n = int(0.012 * SR); ct = tv(n)
    A(np.diff(np.concatenate([[0], rng.standard_normal(n)])) * np.exp(-ct / 0.002) * (0.03 + 0.05 * rng.random()), tt, rng.random() * 1.6 - 0.8)
tt = 33.0
while tt < 36.3:
    h = np.interp(tt, [33.0, 34.8, 36.3], [0.3, 1.0, 0.4]); A(dum(0.08 + 0.1 * h), tt); tt += np.interp(tt, [33.0, 34.8, 36.3], [1.0, 0.7, 1.0])
A(bowed_soft('D3', 0.08, 4.0, att=1.2), 33.2, 0.0)
A(pad(['D3', 'A3', 'D4', 'F#4'], 7.0, amp=0.085, att=1.6, rel=2.4), 36.6, 0.0)
for i, nm in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']): A(lute_soft(nm, 0.12 if i < 2 else 0.095, 4.0), 37.0 + i * 0.075, -0.5 + i * 0.2)
A(fan('D6', 0.1), 37.45, 0.2)
A(pad(['D2', 'A2', 'D3'], 6.0, amp=0.06, att=1.8, rel=2.2), 38.4, 0.0)
for tt, nm, trm in [(38.9, 'D5', 0), (39.5, 'Eb5', 0), (40.0, 'F#5', 1.2), (41.3, 'G5', 0), (41.8, 'F#5', 0), (42.2, 'Eb5', 0), (42.6, 'D5', 1.4)]: A(lute_soft(nm, 0.13, 2.5, trem=trm), tt, -0.15)
for tt, nm in [(43.4, 'A4'), (43.8, 'F#4'), (44.2, 'D4')]: A(lute_soft(nm, 0.1), tt, 0.1)
A(fan('A5', 0.08), 44.0, 0.3)
A(drop(0.08), 44.8, 0.1); A(fan('D6', 0.12), 44.83, 0.1)
# 从盘面上浮起来：一声拨弦往上走，盘子里留下的花瓣轻轻一响
T7L = T6 + 45.9
tr.add(swish(0.05, 0.45, hi=True), T7L, -0.2)
for i, nm in enumerate(['D4', 'F#4', 'A4', 'D5']): tr.add(lute_soft(nm, 0.11, 1.6), T7L + 0.05 + i * 0.07, -0.3 + i * 0.1)
tr.add(fan('A5', 0.07), T7L + 0.6, 0.3)
tr.add(lute_soft('A4', 0.1, 1.8, trem=0.6), T7L + 1.2, -0.3); tr.add(lute_soft('D4', 0.09, 2.0), T7L + 2.0, -0.4)

# ===== 捌 · 年画（锣鼓、唢呐）：四块色版一版版压下去 =====
tr.add(gong(0.07, big=False), 100.4, 0.2)
tr.add(suona_phrase([(0, 0.25, 'D5'), (0.25, 0.25, 'E5'), (0.5, 0.25, 'G5'), (0.75, 0.25, 'A5'), (1.0, 0.5, 'G5'), (1.5, 0.25, 'E5'), (1.75, 0.6, 'D5')], amp=0.1), 100.9, -0.2)
for tt, kind in [(101.0, 'd'), (101.5, 'd'), (101.75, 's'), (102.0, 'd'), (102.5, 'd'), (102.75, 's'), (103.0, 'd'), (103.25, 's')]:
    tr.add(dum(0.08) if kind == 'd' else (gong(0.05, big=False) if kind == 's' else gong(0.07, big=True)), tt, 0.0)
for k, tc in enumerate([103.85, 104.2, 104.55, 104.9]):
    tr.add(thump(0.12), tc, 0.0); tr.add(dum(0.1 + 0.02 * k), tc, 0.0)
    tr.add(gong(0.06 + 0.02 * k, big=(k == 3)), tc + 0.01, 0.1 * (k - 1.5))
tr.add(cymbal(0.06, 1.2), 104.9, 0.25)
tr.add(suona_phrase([(0, 0.18, 'A5'), (0.18, 0.18, 'C6'), (0.36, 0.5, 'D6')], amp=0.11), 105.25, -0.2)
tr.add(gong(0.08, big=False), 105.62, 0.3); tr.add(swish(0.06, 0.4, hi=True), 105.7, -0.3)
tr.add(suona_phrase([(0, 0.2, 'D6'), (0.2, 0.2, 'C6'), (0.4, 0.2, 'A5'), (0.6, 0.2, 'G5'), (0.8, 0.6, 'A5')], amp=0.12), 105.95, -0.3)
for tt in [106.0, 106.4, 106.8]: tr.add(dum(0.08), tt, 0.0)
tr.add(gong(0.06, big=False), 107.0, 0.1)

# ===== 玖 · 剪纸（板胡、剪刀、纸） =====
tr.add(banhu_phrase([(0, 0.3, 'A4'), (0.3, 0.3, 'C5'), (0.6, 0.6, 'D5'), (1.2, 0.3, 'E5'), (1.5, 0.3, 'D5'), (1.8, 0.9, 'A4')], amp=0.09), 107.4, 0.2)
for tt in np.arange(107.6, 109.4, 0.45): tr.add(paiban(0.04), tt, 0.3)
for k in range(9): tr.add(snip(0.05 + 0.02 * rng.random()), 109.45 + k * 0.1 + rng.random() * 0.03, 0.2)
tr.add(rustle(0.5, 0.04), 110.3, 0.1)
tr.add(rustle(0.8, 0.05), 110.8, -0.2)
tr.add(banhu_phrase([(0, 0.25, 'D5'), (0.25, 0.25, 'E5'), (0.5, 0.25, 'G5'), (0.75, 0.6, 'A5')], amp=0.1), 111.7, 0.0)
tr.add(rustle(0.4, 0.05), 112.0, -0.2)
tr.add(banhu_phrase([(0, 0.2, 'A5'), (0.2, 0.2, 'G5'), (0.4, 0.2, 'E5'), (0.6, 0.2, 'D5'), (0.8, 0.5, 'E5'), (1.3, 0.8, 'A4')], amp=0.1), 112.2, -0.2)

# ===== 拾 · 像素（芯片音乐，每升一级加一个声部、升一次调） =====
T10ON, T10UP, T10EAT4, T10TEAR, T10OFF = 115.0, [118.55, 121.95, 125.55], 129.1, 129.25, 130.75
tr.add(thump(0.12), T10ON, 0.0)
n = int(0.9 * SR); st = tv(n); tr.add(norm(np.sin(2 * np.pi * 50 * st) * (1 + 0.6 * np.sin(2 * np.pi * 7 * st)) * np.exp(-st / 0.3), 0.08), T10ON + 0.02, 0)
on = np.clip((t - T10ON) / 0.2, 0, 1) * (1 - np.clip((t - T10OFF) / 0.01, 0, 1)) * (t < T10OFF + 0.01)
whine = np.sin(2 * np.pi * 7400 * t) * on * 0.0016; tr.L += whine; tr.R += whine
MEL = ['A4', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'C5', 'A4', 'G4', 'A4']
BASS = ['A2', 'A2', 'F2', 'G2']
def chip_level(k, t0, t1, step, shift):
    tt = t0; i = 0
    while tt < t1 - 0.01:
        nm = MEL[i % len(MEL)]; f = F(midi(nm) + shift); d = min(step * 0.9, t1 - tt)
        tr.add(pulse(f, d, duty=[0.125, 0.25, 0.25, 0.5][k], amp=[0.05, 0.05, 0.045, 0.04][k], dec=0.6 if k == 0 else 0.0), tt, -0.1)
        if k >= 1 and i % 4 == 0: tr.add(tri(F(midi(BASS[(i // 4) % 4]) + shift), min(step * 3.8, t1 - tt), 0.09), tt, 0.0)
        if k >= 2:
            if i % 2 == 0: tr.add(chipnoise(0.12, 0.06, 0.04), tt, 0.0)
            else: tr.add(chipnoise(0.05, 0.03, 0.012, hi=True), tt, 0.2)
            for j in range(3): tr.add(pulse(F(midi(nm) + shift + [0, 4, 7][j] - 12), step / 3 * 0.9, 0.5, 0.02), tt + j * step / 3, 0.3)
        if k >= 3: tr.add(pulse(F(midi(nm) + shift - 5), d, 0.25, 0.03), tt, 0.25)
        tt += step; i += 1
chip_level(0, 115.45, T10UP[0], 0.32, 0)
chip_level(1, T10UP[0] + 0.25, T10UP[1], 0.28, 2)
chip_level(2, T10UP[1] + 0.25, T10UP[2], 0.25, 4)
chip_level(3, T10UP[2] + 0.25, T10EAT4, 0.21, 7)
for k, tu in enumerate(T10UP + [T10EAT4]):
    tr.add(pulse(F('C6') * 2 ** (k / 12), 0.05, 0.5, 0.06), tu - 0.04, 0.2)
    for j, nm in enumerate(['C5', 'E5', 'G5', 'C6', 'E6']): tr.add(pulse(F(midi(nm) + 2 * k), 0.05, 0.25, 0.045), tu + 0.03 + j * 0.045, 0.1)
# 吃到最后一颗：音高一路往上冲，然后整段音乐开始坏掉
n = int(0.5 * SR); st = tv(n); tr.add(np.where((np.cumsum(220 * 2 ** (st * 8) / SR) % 1) < 0.5, 1, -1) * 0.033 * (1 - st / 0.5), T10EAT4, 0)
frag = np.zeros(int(0.25 * SR))
for j, nm in enumerate(['A5', 'D6', 'C6']): seg = pulse(F(nm), 0.08, 0.25, 0.08); frag[int(j * 0.083 * SR):int(j * 0.083 * SR) + len(seg)] += seg[:len(frag) - int(j * 0.083 * SR)]
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

# ===== 拾壹 · 代码：敲代码的声音；每种画法闪过，对应的乐器各响一下；最后古琴 =====
rn = int(9.4 * SR); rs = np.arange(rn) / SR; tr.add(roomtone(rn, 0.02) * np.clip(rs / 0.05, 0, 1) * (0.5 + 0.5 * np.clip(rs / 2.6, 0, 1) ** 1.5) * np.clip((9.4 - rs) / 1.2, 0, 1), T10OFF, 0.0)
tr.add(tick(0.012), 131.5, -0.2); tr.add(tick(0.008), 132.3, 0.15)   # 显像管凉下来的两声轻响
tr.add(drone('D3', 7.2, amp=0.045, att=3.0, rel=1.6), 132.2, 0.0)
for k in range(80):
    tt = 134.55 + rng.random() * 3.1; tr.add(keyclick(0.03 + 0.02 * rng.random()), tt, 0.3 * (rng.random() - 0.5))
TF = 137.7
flash = [xun_note('A4', 0.25, amp=0.07), qing('D5', 0.06, 2.0), paixiao_phrase([(0, 0.2, 'G5')], amp=0.06), bell('A4', 0.07, 2.5), paiban(0.05),
         qin('D4', 0.08, 3.0), lute('A4', 0.07, 1.5), suona_phrase([(0, 0.18, 'D6')], amp=0.05), banhu_phrase([(0, 0.18, 'E5')], amp=0.05),
         pulse(F('A5'), 0.12, 0.25, 0.04), crush(pulse(F('E6'), 0.12, 0.5, 0.04), 2, 12)]
for i, sg in enumerate(flash): tr.add(sg, TF + i * 0.19, -0.5 + i * 0.1)
for tt, nm, kw, a in [(139.95, 'A3', dict(vib=0.12), 0.2), (141.05, 'D4', {}, 0.17), (141.85, 'C4', dict(slide='down'), 0.16), (142.9, 'A3', dict(vib=0.2), 0.2)]: tr.add(qin(nm, a, 7.0, **kw), tt, -0.1)
# 一拉开就开始拼鱼：泛音一个个往上走，底下一层拉弦慢慢涨起来；最老的埙回来
for i, (tt, nm) in enumerate([(140.9, 'D5'), (141.5, 'G5'), (142.1, 'A5'), (142.7, 'C6'), (143.3, 'D6')]): tr.add(fan(nm, 0.066 + 0.005 * i, 4.5), tt, -0.3 + 0.15 * i)
tr.add(bowed('D3', 0.05, 7.0, att=2.5, rel=2.5), 140.6, 0.0)
tr.add(xun_phrase([(0, 1.3, 'A4'), (1.3, 2.6, 'D5')], amp=0.1, vib=0.12), 142.2, 0.05)
# 大鱼成形、灯亮：一声低钟，一下陶鼓（呼应开头）
tr.add(bell('D3', 0.12, 6.5), 144.4, 0.0); tr.add(bell('A3', 0.055, 5.0), 144.42, 0.1); tr.add(claydrum(0.07, 70, 0.6), 144.4, 0.0)
tr.add(fan('D6', 0.08, 5.0), 145.6, 0.15)
tr.add(thump(0.05), 146.92, 0.1)   # 墙上片名的印
tr.add(thump(0.06), 150.3, 0.0)     # 黑卡上的印
# 逗号活过来：一滴水的轻响，一下小小的摆尾，往左游走
tr.add(drop(0.05, 760), 151.15, -0.1); tr.add(swish(0.02, 0.3, hi=True), 151.5, -0.3); tr.add(fan('A5', 0.05, 4.0), 151.2, -0.2)

tq = tv(trA.N); src = 1 - np.clip((tq - T10OFF) / 0.015, 0, 1); trA.L *= src; trA.R *= src
AL, AR = mixdown(trA, wet=0.42, ir_dur=3.4, ir_dec=0.95)
tm = tv(len(AL))
# 拉平的增益在切断之前算，并且从“吃到最后一颗”起冻结——不让后面的寂静把坏掉那段推响
gA, ref = level_gain(AL, AR); i0 = int((T10EAT4 - 0.6) * SR); gA[i0:] = gA[i0]
muf = np.clip((tm - T10OFF) / 0.6, 0, 1) ** 0.7; tail = np.where(tm < T10OFF, 1.0, np.exp(-np.clip(tm - T10OFF, 0, None) / 0.42))
AL = (AL * (1 - muf) + lp(lp(AL, 700), 900) * muf) * gA * tail; AR = (AR * (1 - muf) + lp(lp(AR, 700), 900) * muf) * gA * tail
BL, BR = mixdown(tr, wet=0.42, ir_dur=3.4, ir_dec=0.95, seedL=7, seedR=8)
envB = env_db(BL, BR); pB = np.percentile(envB[(tm > 137.5) & (tm < 152)], 80); gB = float(np.clip(ref * 0.95 / pB, 0.7, 2.2)); print('gB', round(gB, 2))
write_wav(OUT, AL + BL * gB, AR + BR * gB, fade_out=1.2)
