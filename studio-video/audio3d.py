# Bande son : musique de fond synthétisée + bruitages + voix (la musique baisse quand la voix parle)
import json, os, numpy as np
SR = 48000
tl = json.load(open('timeline.json')); T = tl['total']; N = int(T*SR)
ev = json.load(open('events.json'))
t = np.arange(N)/SR
rng = np.random.default_rng(7)

def lp_fast(x, fc, n=4):  # passe-bas rapide par moyenne glissante répétée
    k = max(1, int(SR/fc/2)); ker = np.ones(k)/k
    for _ in range(n): x = np.convolve(x, ker, mode='same')
    return x

# ---- Musique : 96 BPM, accords Am - F - C - G ----
bpm = 96; beat = 60/bpm; bar = 4*beat
chords = [[57,60,64],[53,57,60],[48,52,55],[55,59,62]]   # notes MIDI
f = lambda m: 440*2**((m-69)/12)
music = np.zeros(N)
for b0 in np.arange(0, T, bar):
    ch = chords[int(round(b0/bar)) % 4]
    i0, i1 = int(b0*SR), min(N, int((b0+bar)*SR))
    tt = t[i0:i1]-b0
    env = np.minimum(1, tt/0.6) * np.minimum(1, (bar-tt)/0.4)
    pad = sum(np.sin(2*np.pi*f(m+12)*tt*(1+d)) for m in ch for d in (-0.003,0.003))
    music[i0:i1] += 0.05*pad*env
    music[i0:i1] += 0.10*np.sin(2*np.pi*f(ch[0]-12)*tt)*np.minimum(1,tt/0.05)*np.exp(-tt*0.6)  # basse
for k in np.arange(0, T, beat):          # kick doux
    i0=int(k*SR); L=int(0.25*SR); tt=np.arange(L)/SR
    if i0+L<N: music[i0:i0+L] += 0.22*np.sin(2*np.pi*(50+70*np.exp(-tt*30))*tt)*np.exp(-tt*14)
for k in np.arange(beat/2, T, beat):     # charleston léger
    i0=int(k*SR); L=int(0.05*SR)
    if i0+L<N: music[i0:i0+L] += 0.025*rng.standard_normal(L)*np.exp(-np.arange(L)/SR*80)
fade = np.minimum(1, t/1.0) * np.minimum(1, (T-t)/1.5)
music *= fade

# ---- Bruitages ----
sfx = np.zeros(N)
def add(at, sig, g):
    i0=int(at*SR); j=min(N, i0+len(sig))
    if 0<=i0<N: sfx[i0:j] += g*sig[:j-i0]
def whoosh():
    L=int(.45*SR); tt=np.arange(L)/SR; n=rng.standard_normal(L)
    return lp_fast(n, 1800, 2)*np.sin(np.pi*tt/.45)**2*3
def pop():
    L=int(.09*SR); tt=np.arange(L)/SR
    return np.sin(2*np.pi*(500+900*tt/.09)*tt)*np.exp(-tt*40)
def tap():
    L=int(.04*SR); tt=np.arange(L)/SR
    return (np.sin(2*np.pi*1800*tt)*0.6 + rng.standard_normal(L)*0.4)*np.exp(-tt*120)
def send():
    L=int(.22*SR); tt=np.arange(L)/SR; fr=np.where(tt<.09, 880, 1320)
    return np.sin(2*np.pi*fr*tt)*np.exp(-((tt%.09)*25))
def key():
    L=int(.03*SR); tt=np.arange(L)/SR
    return rng.standard_normal(L)*np.exp(-tt*200)
def sheet():
    L=int(.22*SR); tt=np.arange(L)/SR
    return lp_fast(rng.standard_normal(L), 3000, 2)*np.sin(np.pi*tt/.22)*2
gen = {'whoosh':(whoosh,.35),'pop':(pop,.30),'tap':(tap,.35),'send':(send,.25),'key':(key,.18),'sheet':(sheet,.25)}
for e in ev:
    g, gain = gen[e['k']]; add(e['t'], g(), gain)

# ---- Voix + ducking ----
voice = np.fromfile('voice/voice.f32', dtype=np.float32).astype(np.float64)
voice = np.pad(voice, (0, max(0, N-len(voice))))[:N]
venv = lp_fast(np.abs(voice), 8, 3); venv /= venv.max()+1e-9
duck = 1 - 0.55*np.clip(venv*4, 0, 1)

def save(name, x):
    x = x/ (np.abs(x).max()+1e-9) * 0.89
    os.makedirs('out', exist_ok=True); x.astype(np.float32).tofile(f'out/{name}.f32')
save('mix_voix', voice*1.0 + music*duck*0.55 + sfx*0.6)
save('mix_sans_voix', music*0.9 + sfx*0.6)
print('audio ok', round(T,2), 's')
