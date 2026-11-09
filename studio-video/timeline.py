# Construit la piste voix + timeline.json à partir de voice/words.json
# (phrases séparées, voix IA) — pour la voix d'Adam, voir voix_adam.py
import json, subprocess, numpy as np
SR = 48000; START, GAP, TAIL = 0.35, 0.30, 2.6
lines = json.load(open('voice/words.json', encoding='utf-8'))
def load(path):
    raw = subprocess.run(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','1','-ar',str(SR),'-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
t, segs, tl = START, [], []
for l in lines:
    w = l['words']; end = w[-1]['t'] + w[-1]['d'] + 0.12
    a = load(l['file'])[:int(end*SR)]
    segs.append((t, a))
    tl.append({'id': l['id'], 'start': round(t,3), 'end': round(t+end,3),
               'words': [{'w': x['w'], 't': round(t+x['t'],3), 'e': round(t+x['t']+x['d'],3)} for x in w]})
    t += end + GAP
total = t - GAP + TAIL
out = np.zeros(int(total*SR)+SR, dtype=np.float32)
for s, a in segs: out[int(s*SR):int(s*SR)+len(a)] += a
out[:int(total*SR)].tofile('voice/voice.f32')
json.dump({'total': round(total,3), 'lines': tl}, open('timeline.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)
print('durée voix', round(total,2), 's')
