# 全片配乐用的合成乐器（numpy）
import numpy as np, wave

SR = 44100
rng = np.random.default_rng(11)
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def midi(n):
    if isinstance(n, (int, float)): return n
    name = n[:-1]; octv = int(n[-1]); return 12 * (octv + 1) + NOTE[name]
F = lambda n: 440 * 2 ** ((midi(n) - 69) / 12)
tv = lambda n: np.arange(n) / SR
lerp = lambda a, b, p: a + (b - a) * p

class Track:
    def __init__(self, dur):
        self.dur = dur; self.N = int(dur * SR) + SR * 6
        self.L = np.zeros(self.N); self.R = np.zeros(self.N)
    def add(self, sig, t0, pan=0.0, gain=1.0):
        i = int(round(t0 * SR)); n = min(len(sig), self.N - i)
        if n <= 0 or i < 0: return
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        self.L[i:i + n] += sig[:n] * gain * l * 1.414; self.R[i:i + n] += sig[:n] * gain * r * 1.414
    def add_st(self, sl, sr, t0, gain=1.0):
        i = int(round(t0 * SR)); n = min(len(sl), self.N - i)
        if n <= 0: return
        self.L[i:i + n] += sl[:n] * gain; self.R[i:i + n] += sr[:n] * gain

def lowpass(x, k):
    k = max(1, int(k)); c = np.cumsum(np.concatenate([[0], x])); y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(len(x) - len(y))])
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    # 向量化近似：用 lfilter 等价的递推
    from scipy.signal import lfilter
    return lfilter([1 - a], [1, -a], x)
def bandnoise(n, fc, q=4.0):
    from scipy.signal import butter, sosfilt
    bw = fc / q; lo = max(20, fc - bw / 2); hi = min(SR / 2 - 100, fc + bw / 2)
    sos = butter(2, [lo, hi], btype='band', fs=SR, output='sos'); return sosfilt(sos, rng.standard_normal(n))
def hp(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc, btype='high', fs=SR, output='sos'), x)
def lp(x, fc):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, fc, btype='low', fs=SR, output='sos'), x)
def norm(y, amp): return y / (np.max(np.abs(y)) + 1e-9) * amp

# ---------- 埙：陶制的闭口吹奏乐器，几乎是纯音，带气声 ----------
def xun_phrase(notes, amp=0.2, vib=0.13, breath=0.06, port=0.06, scoop=0.45, over=0.0, flutter=0.0, rel=0.35, att=0.14):
    """notes: [(start, dur, pitch)]，相对时间，首尾相连成一口气"""
    T = notes[-1][0] + notes[-1][1] + rel; n = int(T * SR); t = tv(n)
    s = np.full(n, float(midi(notes[0][2])))
    for i in range(1, len(notes)):
        t0 = notes[i][0]; a = midi(notes[i - 1][2]); b = midi(notes[i][2])
        w = np.clip((t - t0 + port * 0.5) / port, 0, 1); w = w * w * (3 - 2 * w); s = s + (b - a) * w
    s -= scoop * np.exp(-t / 0.07)
    vb = np.zeros(n)
    for i, (t0, d, p) in enumerate(notes):
        m = (t >= t0) & (t < t0 + d + (rel if i == len(notes) - 1 else 0))
        tt = t[m] - t0; vb[m] = vib * np.clip((tt - 0.35) / 0.6, 0, 1) * np.sin(2 * np.pi * (4.7 + 0.4 * np.sin(tt * 0.9 + i)) * tt + i)
    s = s + vb - 0.25 * np.clip((t - (T - rel)) / rel, 0, 1)
    f = 440 * 2 ** ((s - 69) / 12); ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.clip(t / att, 0, 1) ** 1.5 * np.clip((T - t) / rel, 0, 1) * (0.88 + 0.12 * np.sin(2 * np.pi * 0.23 * t + 1.0))
    for (t0, d, p) in notes[1:]:
        env *= 1 - 0.16 * np.exp(-((t - t0) / 0.035) ** 2)
    if flutter > 0: env *= 1 - flutter * (0.5 + 0.5 * np.sin(2 * np.pi * 11.5 * t))
    hk = [1, 0.07 + 0.25 * over, 0.11 + 0.2 * over, 0.025 + 0.12 * over, 0.035 + 0.1 * over]
    y = sum(a * np.sin((k + 1) * ph) for k, a in enumerate(hk))
    nz = rng.standard_normal(n)
    tone_noise = lowpass(nz, 3) * np.sin(ph + 0.3) * 0.6
    air = hp(nz, 2200) * 0.35
    chiff = np.exp(-t / 0.05) * 0.6
    y = y + (breath * (1 + 2 * over) + chiff) * (tone_noise + air)
    return norm(y * env, amp)

def xun_note(p, dur, amp=0.15, **kw): return xun_phrase([(0, dur, p)], amp=amp, **kw)

# ---------- 陶鼓：低沉、短 ----------
def claydrum(amp=0.2, f0=78, dec=0.32):
    n = int(1.0 * SR); t = tv(n)
    y = np.sin(2 * np.pi * np.cumsum(f0 + 55 * np.exp(-t / 0.03)) / SR) * np.exp(-t / dec)
    y += 0.35 * np.sin(2 * np.pi * np.cumsum(f0 * 2.7 + 40 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.09)
    y += lowpass(rng.standard_normal(n), 14) * np.exp(-t / 0.025) * 0.5
    return norm(y, amp)
def thump(amp=0.12):
    n = int(0.4 * SR); t = tv(n)
    y = lowpass(rng.standard_normal(n), 40) * np.exp(-t / 0.03) + 0.6 * np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.06)
    return norm(y, amp)

# ---------- 石磬：石头的金属感，不和谐泛音 ----------
def qing(p, amp=0.16, dur=4.5):
    f = F(p); n = int(dur * SR); t = tv(n); y = np.zeros(n)
    for r, a, d in [(1, 1, 2.6), (2.32, 0.55, 1.1), (4.25, 0.3, 0.5), (6.63, 0.18, 0.22), (9.4, 0.08, 0.12)]:
        y += a * np.sin(2 * np.pi * f * r * t + rng.random() * 6.28) * np.exp(-t / d)
    y *= 1 - np.exp(-t / 0.0015); y += hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.006) * 0.3
    return norm(y, amp)

# ---------- 古琴、泛音、弹拨、手鼓、拉弦（沿用样片） ----------
def qin(note, amp=0.25, dur=7.0, slide=None, vib=0.0):
    f0 = F(note); n = int(dur * SR); t = tv(n)
    semis = np.zeros(n)
    if slide == 'up': semis = -2.0 * (1 - np.clip(t / 0.25, 0, 1)) ** 2
    elif slide == 'down': semis = -1.7 * np.clip((t - dur * 0.35) / (dur * 0.25), 0, 1)
    if vib > 0: semis = semis + vib * np.sin(2 * np.pi * 4.4 * t) * np.clip((t - 0.4) / 0.8, 0, 1)
    ph = 2 * np.pi * np.cumsum(f0 * 2 ** (semis / 12)) / SR
    y = np.zeros(n)
    for k in range(1, 14):
        if f0 * k > 9000: break
        ak = (1 / k ** 1.35) * (abs(np.sin(np.pi * k * 0.13)) + 0.08)
        tau = 5.0 * (110 / f0) ** 0.25 / (1 + 0.55 * (k - 1))
        y += ak * np.exp(-t / tau) * np.sin(k * ph * np.sqrt(1 + 0.00008 * k * k))
    y *= (1 - np.exp(-t / 0.004))
    y += lowpass(rng.standard_normal(n) * np.exp(-t / 0.01), 6) * 0.03
    if slide is not None:
        ds = np.abs(np.gradient(semis)) * SR
        y += np.diff(np.concatenate([[0], rng.standard_normal(n) * np.clip(ds / 30, 0, 1) * 0.02]))
    return norm(y, amp)
def fan(note, amp=0.12, dur=5.0):
    f = F(note); n = int(dur * SR); t = tv(n)
    y = np.sin(2 * np.pi * f * t) + 0.12 * np.sin(2 * np.pi * 2 * f * t) + 0.04 * np.sin(2 * np.pi * 3.01 * f * t) + 0.08 * np.sin(2 * np.pi * f * 1.0025 * t)
    return norm(y * np.exp(-t / 2.4) * (1 - np.exp(-t / 0.003)), amp)
def drop(amp=0.1, f0=520):
    n = int(0.3 * SR); t = tv(n)
    y = np.sin(2 * np.pi * np.cumsum(f0 + 1500 * np.exp(-t / 0.011)) / SR) * np.exp(-t / 0.045)
    y[:40] += rng.standard_normal(40) * 0.3
    return y * amp
def swish(amp=0.04, dur=0.35, hi=False):
    n = int(dur * SR); t = tv(n)
    x = rng.standard_normal(n); x = hp(x, 1500) if hi else np.diff(np.concatenate([[0], lowpass(x, 3)]))
    return norm(x * np.sin(np.pi * t / dur) ** 2, amp)
def tick(amp=0.05):
    n = int(0.02 * SR); t = tv(n)
    return norm(hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.0025), amp)

# ---------- 环境：室内底噪、水 ----------
def roomtone(n, amp=0.01):
    br = np.cumsum(rng.standard_normal(n)); br = br - lowpass(br, 4000); br = lp(br, 180)
    return norm(br, amp)
def water(n, amp=0.02):
    x = lp(rng.standard_normal(n), 900) * (0.6 + 0.4 * lowpass(np.abs(rng.standard_normal(n)), 9000) / 0.8)
    return norm(hp(x, 120), amp)

# ---------- 混响与输出 ----------
def reverb_ir(dur=3.2, dec=0.9, seed=5):
    r = np.random.default_rng(seed); n = int(dur * SR); t = tv(n)
    x = r.standard_normal(n) * np.exp(-t / dec); x = lowpass(x, 4); x[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR)); x[0] = 0
    return x / np.sqrt(np.sum(x * x))
def conv(x, h):
    m = len(x) + len(h); nf = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(h, nf), nf)[:len(x)]
def finish(tr, path, wet=0.42, dry=0.8, ir_dur=3.2, ir_dec=0.9, fade_in=0.0, fade_out=0.8, peak=0.89, post=None, level=False):
    oL = tr.L * dry + conv(tr.L, reverb_ir(ir_dur, ir_dec, 5)) * wet
    oR = tr.R * dry + conv(tr.R, reverb_ir(ir_dur, ir_dec, 6)) * wet
    n = int(tr.dur * SR); t = tv(n)
    fade = (np.clip(t / fade_in, 0, 1) if fade_in > 0 else 1) * (1 - np.clip((t - (tr.dur - fade_out)) / fade_out, 0, 1))
    oL = oL[:n] * fade; oR = oR[:n] * fade
    if post is not None: oL *= post[:n]; oR *= post[:n]
    if level:  # 轻度响度拉平：安静段落抬一点，刻意的寂静不动
        m = (oL ** 2 + oR ** 2) / 2; w = int(1.5 * SR); env = np.sqrt(lowpass(m, w) + 1e-12)
        ref = np.percentile(env[env > 1e-4], 75); db = 20 * np.log10(env / ref + 1e-12)
        g = np.where(db < -45, 1.0, np.clip(10 ** (-db * 0.45 / 20), 0.75, 1.9)); g = lowpass(g, int(0.4 * SR)); g[-int(0.4 * SR):] = g[-int(0.4 * SR) - 1]
        oL *= g; oR *= g
    pk = max(np.max(np.abs(oL)), np.max(np.abs(oR))); oL /= pk / peak; oR /= pk / peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([oL, oR], 1) * 32767).astype('<i2').tobytes())
    m = (oL + oR) / 2
    print('rms/2s:', ' '.join(f'{i*2}:{20*np.log10(np.sqrt(np.mean(m[i*2*SR:(i+1)*2*SR]**2))+1e-9):.0f}' for i in range(int(tr.dur // 2) + 1)))

# ---------- 排箫：气声重、略带滑音 ----------
def paixiao_phrase(notes, amp=0.15, vib=0.1, breath=0.16, port=0.04, rel=0.25):
    return xun_phrase(notes, amp=amp, vib=vib, breath=breath, port=port, scoop=0.25, over=0.35, rel=rel, att=0.05)
# ---------- 建鼓：大而低 ----------
def jiangu(amp=0.25, f0=58, dec=0.6):
    n = int(1.6 * SR); t = tv(n)
    y = np.sin(2 * np.pi * np.cumsum(f0 + 40 * np.exp(-t / 0.05)) / SR) * np.exp(-t / dec)
    y += 0.4 * np.sin(2 * np.pi * np.cumsum(f0 * 1.6 + 30 * np.exp(-t / 0.03)) / SR) * np.exp(-t / (dec * 0.4))
    y += lowpass(rng.standard_normal(n), 10) * np.exp(-t / 0.02) * 0.6
    return norm(y, amp)
# ---------- 编钟：双音、带拍频的铜声 ----------
def bell(p, amp=0.16, dur=5.0):
    f = F(p); n = int(dur * SR); t = tv(n); y = np.zeros(n)
    for r, a, d in [(1.0, 1.0, 3.2), (1.0035, 0.7, 3.0), (1.19, 0.45, 1.8), (2.0, 0.5, 1.4), (2.76, 0.3, 0.8), (3.42, 0.22, 0.5), (4.1, 0.14, 0.32), (5.4, 0.08, 0.18)]:
        y += a * np.sin(2 * np.pi * f * r * t + rng.random() * 6.28) * np.exp(-t / d)
    y *= 1 - np.exp(-t / 0.002)
    y += hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.25
    return norm(y, amp)
# ---------- 笛子：明亮，带笛膜的“沙” ----------
def dizi_phrase(notes, amp=0.14, vib=0.12, breath=0.05, port=0.03, rel=0.18):
    y = xun_phrase(notes, amp=1.0, vib=vib, breath=breath, port=port, scoop=0.3, over=1.0, rel=rel, att=0.03)
    buzz = hp(np.sign(y) * np.abs(y) ** 0.45, 1800) * 0.22
    return norm(y + buzz, amp)
# ---------- 拍板：木头的一声 ----------
def paiban(amp=0.08):
    n = int(0.12 * SR); t = tv(n)
    y = bandnoise(n, 1600, 2.5) * np.exp(-t / 0.012) + 0.5 * np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.02)
    return norm(y, amp)
# ---------- 杂音：火的噼啪、骨裂、水花、针刮 ----------
def crackle(dur, amp=0.05, dens=40):
    n = int(dur * SR); y = np.zeros(n); t = tv(n)
    for _ in range(int(dens * dur)):
        i = int(rng.random() * (n - 800)); k = tick(0.3 + rng.random() * 0.7); y[i:i + len(k)] += k * (0.3 + 0.7 * (i / n))
    y += lp(rng.standard_normal(n), 400) * 0.08 * (t / dur)
    return norm(y, amp)
def bonecrack(amp=0.2):
    n = int(0.5 * SR); t = tv(n)
    y = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.008) + 0.6 * bandnoise(n, 900, 3) * np.exp(-t / 0.03) + 0.5 * np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.05)
    return norm(y, amp)
def splash(amp=0.12):
    n = int(0.9 * SR); t = tv(n)
    y = lp(rng.standard_normal(n), 3000) * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.004))
    for k in range(10): y += np.roll(np.pad(drop(0.4, 500 + rng.random() * 900), (0, n))[:n], int((0.08 + rng.random() * 0.5) * SR)) * 0.5
    return norm(y, amp)
def scratch(dur=0.08, amp=0.03):
    n = int(dur * SR); t = tv(n)
    return norm(hp(rng.standard_normal(n), 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 90 * t)) * np.sin(np.pi * t / dur), amp)
def drone(p, dur, amp=0.05, att=2.0, rel=2.0):
    n = int(dur * SR); t = tv(n); f = F(p)
    y = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t + 1) + 0.3 * np.sin(2 * np.pi * f * 2.003 * t + 2)
    env = np.clip(t / att, 0, 1) * np.clip((dur - t) / rel, 0, 1) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.17 * t))
    return norm(y * env, amp)

# ---------- 样片 v3 里的弹拨、手鼓、拉弦 ----------
def lute_pluck(f, amp, dur=2.5):
    n = int(dur * SR); t = tv(n); y = np.zeros(n)
    for k in range(1, 22):
        fk = f * k * np.sqrt(1 + 0.0003 * k * k)
        if fk > 12000: break
        ak = (1 / k ** 0.85) * (abs(np.sin(np.pi * k * 0.09)) + 0.1) * (0.9 ** (k - 1)) * (1 + 1.2 * np.exp(-((fk - 1300) / 650) ** 2))
        tau = 1.5 * (220 / f) ** 0.3 / (1 + 0.38 * (k - 1))
        y += ak * np.exp(-t / tau) * np.sin(2 * np.pi * fk * t + rng.random() * 6.28)
    y *= (1 - np.exp(-t / 0.0008))
    y += np.diff(np.concatenate([[0], rng.standard_normal(n) * np.exp(-t / 0.003)])) * 0.04
    y = np.tanh(1.6 * y / (np.max(np.abs(y)) + 1e-9))
    return norm(y, amp)
def lute(note, amp=0.2, dur=2.5, trem=0.0):
    f = F(note)
    if trem <= 0: return lute_pluck(f, amp, dur)
    n = int((trem + dur) * SR); y = np.zeros(n); tt = 0.0
    while tt < trem:
        p = lute_pluck(f, amp * (0.55 + 0.25 * rng.random()) * (1 - 0.25 * tt / trem), 0.6)
        i = int(tt * SR); m = min(len(p), n - i); y[i:i + m] += p[:m]
        tt += (1 / 15.5) * (0.9 + 0.2 * rng.random())
    p = lute_pluck(f, amp * 0.6, dur); i = int(trem * SR); m = min(len(p), n - i); y[i:i + m] += p[:m]
    return y
def dum(amp=0.2):
    n = int(0.6 * SR); t = tv(n)
    y = np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.28) + lowpass(rng.standard_normal(n), 20) * np.exp(-t / 0.05) * 0.6
    return norm(y, amp)
def tak(amp=0.08):
    n = int(0.15 * SR); t = tv(n)
    y = np.diff(np.concatenate([[0], rng.standard_normal(n)])) * np.exp(-t / 0.02) + np.sin(2 * np.pi * 520 * t) * np.exp(-t / 0.03) * 0.6
    return norm(y, amp)
def bowed(note, amp=0.1, dur=4.0, att=0.6, rel=1.2, formants=((700, 300, 1.4), (1500, 450, 0.9))):
    f0 = F(note); n = int(dur * SR); t = tv(n)
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.006 * np.sin(2 * np.pi * 5.4 * t) * np.clip((t - 0.4) / 0.8, 0, 1))) / SR
    y = np.zeros(n)
    for k in range(1, 16):
        fk = f0 * k
        if fk > 9000: break
        ak = (1 / k) * (1 + sum(g * np.exp(-((fk - fc) / bw) ** 2) for fc, bw, g in formants))
        y += ak * np.sin(k * ph + rng.random() * 6.28)
    env = np.clip(t / att, 0, 1) * np.clip((dur - t) / rel, 0, 1)
    y = y * env + lowpass(rng.standard_normal(n), 40) * env * 0.04
    return norm(y, amp)
# ---------- 板胡：更亮、更“尖” ----------
def banhu_phrase(notes, amp=0.12):
    out = np.zeros(int((notes[-1][0] + notes[-1][1] + 0.4) * SR))
    for t0, d, p in notes:
        y = bowed(p, 1.0, d + 0.25, att=0.04, rel=0.12, formants=((1100, 400, 1.2), (2600, 600, 1.6), (3600, 700, 0.8)))
        i = int(t0 * SR); m = min(len(y), len(out) - i); out[i:i + m] += y[:m]
    return norm(out, amp)
# ---------- 唢呐：亮、冲、带滑音 ----------
def suona_phrase(notes, amp=0.14, port=0.05):
    T = notes[-1][0] + notes[-1][1] + 0.15; n = int(T * SR); t = tv(n)
    s = np.full(n, float(midi(notes[0][2])))
    for i in range(1, len(notes)):
        t0 = notes[i][0]; a = midi(notes[i - 1][2]); b = midi(notes[i][2]); w = np.clip((t - t0 + port * 0.5) / port, 0, 1); s += (b - a) * w * w * (3 - 2 * w)
    s += 0.25 * np.sin(2 * np.pi * 6.2 * t) * np.clip((t - 0.15) / 0.3, 0, 1) - 0.8 * np.exp(-t / 0.05)
    f = 440 * 2 ** ((s - 69) / 12); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.zeros(n)
    for k in range(1, 26):
        fk = f * k
        y += (1 / k ** 0.7) * (1 + 1.8 * np.exp(-((fk - 1300) / 500) ** 2) + 1.2 * np.exp(-((fk - 2900) / 700) ** 2)) * np.sin(k * ph) * (fk < 11000)
    env = np.clip(t / 0.02, 0, 1) * np.clip((T - t) / 0.12, 0, 1)
    for t0, d, p in notes[1:]: env *= 1 - 0.3 * np.exp(-((t - t0) / 0.02) ** 2)
    y = np.tanh(1.4 * y / (np.max(np.abs(y)) + 1e-9)) * env
    return norm(y + hp(rng.standard_normal(n), 3000) * env * 0.02, amp)
# ---------- 锣、钹 ----------
def gong(amp=0.2, big=True):
    n = int((2.6 if big else 1.2) * SR); t = tv(n); y = np.zeros(n)
    base = 180 if big else 820; glide = -0.12 if big else 0.08
    for r, a, d in [(1, 1, 1.4), (1.52, 0.6, 1.0), (2.17, 0.5, 0.7), (2.8, 0.35, 0.5), (3.6, 0.25, 0.35), (4.9, 0.15, 0.25)]:
        f = base * r * (1 + glide * (1 - np.exp(-t / 0.4)))
        y += a * np.sin(2 * np.pi * np.cumsum(f) / SR + rng.random() * 6) * np.exp(-t / (d * (1.0 if big else 0.6)))
    y += hp(rng.standard_normal(n), 1500) * np.exp(-t / (0.5 if big else 0.2)) * 0.35
    return norm(y * (1 - np.exp(-t / 0.002)), amp)
def cymbal(amp=0.1, dur=1.6):
    n = int(dur * SR); t = tv(n)
    return norm(hp(rng.standard_normal(n), 4000) * np.exp(-t / 0.45) * (1 - np.exp(-t / 0.002)), amp)
# ---------- 纸与剪刀 ----------
def snip(amp=0.06):
    n = int(0.09 * SR); t = tv(n)
    y = bandnoise(n, 5200, 3) * np.exp(-t / 0.006) + 0.7 * np.sin(2 * np.pi * 3100 * t) * np.exp(-t / 0.01)
    y2 = np.roll(bandnoise(n, 4200, 3) * np.exp(-t / 0.005), int(0.035 * SR))
    return norm(y + y2 * 0.8, amp)
def rustle(dur, amp=0.04):
    n = int(dur * SR); t = tv(n)
    env = np.abs(lowpass(rng.standard_normal(n), 900)) ; env /= env.max() + 1e-9
    return norm(bandnoise(n, 3500, 1.2) * env * np.sin(np.pi * t / dur), amp)
def keyclick(amp=0.03):
    n = int(0.03 * SR); t = tv(n)
    return norm(bandnoise(n, 2600, 2) * np.exp(-t / 0.004) + 0.4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.006), amp)
# ---------- 芯片音乐 ----------
def pulse(f, dur, duty=0.25, amp=0.1, dec=0.0, vib=0.0):
    n = int(dur * SR); t = tv(n); ph = np.cumsum(f * (1 + vib * np.sin(2 * np.pi * 6 * t)) / SR) % 1.0
    y = np.where(ph < duty, 1.0, -1.0) * (np.exp(-t / dec) if dec > 0 else 1.0)
    y *= np.clip((dur - t) / 0.01, 0, 1)
    return y * amp
def tri(f, dur, amp=0.1):
    n = int(dur * SR); t = tv(n); ph = np.cumsum(np.full(n, f) / SR) % 1.0
    return (4 * np.abs(ph - 0.5) - 1) * amp * np.clip((dur - t) / 0.01, 0, 1)
def chipnoise(dur, amp=0.08, dec=0.05, hi=False):
    n = int(dur * SR); t = tv(n); step = 4 if hi else 40
    x = np.repeat(rng.choice([-1.0, 1.0], n // step + 1), step)[:n]
    return x * amp * np.exp(-t / dec)
def crush(y, bits=3, down=6):
    y = np.repeat(y[::down], down)[:len(y)]; q = 2 ** (bits - 1)
    return np.round(y * q) / q

# ---------- 分段混音：各自混响、各自电平，再合到一起 ----------
def mixdown(tr, wet=0.42, dry=0.8, ir_dur=3.2, ir_dec=0.9, seedL=5, seedR=6):
    oL = tr.L * dry + conv(tr.L, reverb_ir(ir_dur, ir_dec, seedL)) * wet
    oR = tr.R * dry + conv(tr.R, reverb_ir(ir_dur, ir_dec, seedR)) * wet
    n = int(tr.dur * SR); return oL[:n].copy(), oR[:n].copy()
def env_db(oL, oR, win=1.5):
    m = (oL ** 2 + oR ** 2) / 2; return np.sqrt(lowpass(m, int(win * SR)) + 1e-12)
def level_gain(oL, oR):
    env = env_db(oL, oR); ref = np.percentile(env[env > 1e-4], 75); db = 20 * np.log10(env / ref + 1e-12)
    g = np.where(db < -45, 1.0, np.clip(10 ** (-db * 0.45 / 20), 0.75, 1.9)); g = lowpass(g, int(0.4 * SR)); g[-int(0.4 * SR):] = g[-int(0.4 * SR) - 1]
    return g, ref
def write_wav(path, oL, oR, peak=0.89, fade_out=1.2):
    n = len(oL); t = tv(n); fade = 1 - np.clip((t - (n / SR - fade_out)) / fade_out, 0, 1); oL = oL * fade; oR = oR * fade
    pk = max(np.max(np.abs(oL)), np.max(np.abs(oR))); oL = oL / (pk / peak); oR = oR / (pk / peak)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([oL, oR], 1) * 32767).astype('<i2').tobytes())
    m = (oL + oR) / 2
    print('rms/2s:', ' '.join(f'{i*2}:{20*np.log10(np.sqrt(np.mean(m[i*2*SR:(i+1)*2*SR]**2))+1e-9):.0f}' for i in range(int(n / SR // 2))))

# ---------- 温润一点的弹拨和拉弦：切掉刺耳的高频，起音更缓 ----------
def lute_soft(note, amp=0.2, dur=2.5, trem=0.0):
    y = lute(note, amp, dur, trem * 0.75 if trem > 0 else 0.0)
    y = lp(y, 2300); y = lp(y, 3400)
    return norm(y, amp * 0.85)
def bowed_soft(note, amp=0.1, dur=4.0, att=0.6, rel=1.2):
    y = bowed(note, amp, dur, att=max(att, 1.2), rel=max(rel, 1.6))
    y = lp(y, 1500); y = lp(y, 2600)
    return norm(y, amp * 0.8)
# 铺底的弦乐：几根略微走音的正弦叠在一起，慢慢涌上来
def pad(notes, dur, amp=0.1, att=1.5, rel=2.0, detune=0.0035):
    n = int(dur * SR); t = tv(n); y = np.zeros(n)
    for nm in notes:
        f = F(nm)
        for d in (-detune, 0.0, detune):
            ph = 2 * np.pi * f * (1 + d) * t + rng.random() * 6.28
            for k in range(1, 6): y += (1 / k ** 2.2) * np.sin(k * ph)
    env = np.clip(t / att, 0, 1) ** 2 * np.clip((dur - t) / rel, 0, 1)
    y = lp(y * env, 2000)
    return norm(y, amp)
