# Construit la piste voix (WAV) + timeline.json (début/fin de chaque phrase et de chaque mot)
import json, subprocess, sys, numpy as np
LANG = sys.argv[1]; SR = 48000
START, GAP, TAIL = 0.35, 0.32, 3.2          # silence au début, entre les phrases, à la fin
lines = json.load(open(f'voice/{LANG}_words.json', encoding='utf-8'))
def load(path):  # décode le mp3 en échantillons float
    raw = subprocess.run(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','1','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
t, segs, tl = START, [], []
for i, l in enumerate(lines):
    w = l['words']; end = w[-1]['t'] + w[-1]['d'] + 0.12
    a = load(f'voice/{LANG}_{i:02d}.mp3')[:int(end*SR)]
    segs.append((t, a))
    tl.append({'id': l['id'], 'start': round(t,3), 'end': round(t+end,3),
               'words': [{'w': x['w'], 't': round(t+x['t'],3), 'e': round(t+x['t']+x['d'],3)} for x in w]})
    t += end + GAP
total = t - GAP + TAIL
out = np.zeros(int(total*SR)+SR, dtype=np.float32)
for s, a in segs: out[int(s*SR):int(s*SR)+len(a)] += a
out = out[:int(total*SR)]
out.astype(np.float32).tofile(f'voice/{LANG}_voice.f32')
json.dump({'total': round(total,3), 'lines': tl}, open(f'timeline_{LANG}.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
print('durée totale', round(total,2), 's')
