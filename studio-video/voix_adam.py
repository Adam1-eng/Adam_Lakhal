# TA VOIX → la vidéo se cale dessus automatiquement
# usage : python3 voix_adam.py mon_vocal.m4a      (mp3, m4a, ogg/opus de WhatsApp, wav… tout marche)
#
# 1. Nettoie le son (bruit de fond, graves inutiles, volume régulier)
# 2. Whisper écoute et note le moment exact de chaque mot
# 3. Chaque mot est rattaché à la bonne phrase du script (lines_fr.json)
# 4. On coupe les silences trop longs entre les phrases
# 5. Écrit voice/voice.f32 + timeline.json → ensuite : render3d.js, audio3d.py, mux3d.sh
import json, subprocess, sys, os, re, difflib, numpy as np

SR = 48000
SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
os.makedirs(f'{OUT}/voice', exist_ok=True)
START, GAP, TAIL = 0.35, 0.30, 2.6        # même rythme que la version IA

# 1. nettoyage : passe-haut, réduction de bruit, compresseur doux, un peu de clarté
FILTRE = 'highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=90,equalizer=f=3500:t=q:w=1.2:g=2.5'
def decode(sr, filt=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', SRC] + (['-af', filt] if filt else []) + ['-f', 'f32le', '-ac', '1', '-ar', str(sr), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)
clean = decode(SR, FILTRE)
for16 = decode(16000, 'highpass=f=80,afftdn=nf=-25')

# 2. transcription mot par mot (on donne à Whisper les noms propres pour qu'il les écrive bien)
from faster_whisper import WhisperModel
model = WhisperModel(os.environ.get('WHISPER', 'small'), device='cpu', compute_type='int8')
segs, _ = model.transcribe(for16, language='fr', word_timestamps=True, vad_filter=True,
                           initial_prompt="AutoRefaatArt, Zemamra, Dacia Logan diesel, WhatsApp, pièces auto, panier.")
raw = [{'w': w.word.strip(), 't': float(w.start), 'e': float(w.end)} for s in segs for w in s.words if w.word.strip()]
words = []
for w in raw:                                   # recolle les élisions : « c » + « 'est » → « c'est »
    if words and (w['w'][0] in "'’-" or words[-1]['w'].endswith(("'", "’"))):
        words[-1]['w'] += w['w']; words[-1]['e'] = w['e']
    else: words.append(dict(w))
print(f'{len(words)} mots entendus :', ' '.join(w['w'] for w in words)[:200], '…')

# 3. alignement avec le script
norm = lambda s: re.sub(r"[^a-z0-9àâäçéèêëîïôöùûüÿœ]", '', s.lower())
lines = json.load(open('lines_fr.json', encoding='utf-8'))
script = [(i, w) for i, l in enumerate(lines) for w in l['say'].split() if norm(w)]
heard = [norm(w['w']) for w in words]
sm = difflib.SequenceMatcher(None, [norm(w) for _, w in script], heard, autojunk=False)
s2h = {}                                         # mot du script → mot entendu
for a_, b_, n in sm.get_matching_blocks():
    for k in range(n): s2h[a_ + k] = b_ + k
line_of_word = [None] * len(words)
for si, hi in s2h.items(): line_of_word[hi] = script[si][0]
known = [k for k in range(len(words)) if line_of_word[k] is not None]
for k in range(len(words)):                      # mots non reconnus : phrase la plus proche dans le temps
    if line_of_word[k] is not None: continue
    p = max([j for j in known if j < k], default=None); n_ = min([j for j in known if j > k], default=None)
    if p is None: line_of_word[k] = line_of_word[n_]
    elif n_ is None: line_of_word[k] = line_of_word[p]
    else: line_of_word[k] = line_of_word[p] if words[k]['t'] - words[p]['e'] <= words[n_]['t'] - words[k]['e'] else line_of_word[n_]
for k in range(1, len(words)): line_of_word[k] = max(line_of_word[k], line_of_word[k - 1])

def captions(i, ws):
    """Sous-titres : on garde l'orthographe du script, avec le minutage de ta voix."""
    idx = [k for k, (li, _) in enumerate(script) if li == i]
    hit = {k: s2h[k] for k in idx if k in s2h and line_of_word[s2h[k]] == i}
    if len(hit) < 0.6 * len(idx): return ws            # tu as improvisé → on affiche ce que tu as dit
    out = []
    for k in idx:
        if k in hit: w = words[hit[k]]; out.append({'w': script[k][1], 't': w['t'], 'e': w['e']}); continue
        prv = max([j for j in hit if j < k], default=None); nxt = min([j for j in hit if j > k], default=None)
        t0 = words[hit[prv]]['e'] if prv is not None else ws[0]['t']
        t1 = words[hit[nxt]]['t'] if nxt is not None else ws[-1]['e']
        out.append({'w': script[k][1], 't': t0, 'e': max(t0 + 0.05, t1)})
    return out

# 4. découpe par phrase + silences raccourcis
t, out, tl = START, [], []
for i, l in enumerate(lines):
    ws = [w for w, li in zip(words, line_of_word) if li == i]
    if not ws:
        print(f'⚠️ phrase {i+1} ({l["id"]}) non trouvée dans le vocal'); continue
    a, b = max(0, ws[0]['t'] - 0.08), ws[-1]['e'] + 0.15
    piece = clean[int(a * SR):int(b * SR)]
    out.append((t, piece))
    tl.append({'id': l['id'], 'start': round(t, 3), 'end': round(t + len(piece) / SR, 3),
               'words': [{'w': w['w'].strip(',.:;'), 't': round(t + w['t'] - a, 3), 'e': round(t + w['e'] - a, 3)} for w in captions(i, ws)]})
    t += len(piece) / SR + GAP
total = t - GAP + TAIL
mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
for s, p in out: mix[int(s * SR):int(s * SR) + len(p)] += p
mix[:int(total * SR)].tofile(f'{OUT}/voice/voice.f32')
json.dump({'total': round(total, 3), 'lines': tl}, open(f'{OUT}/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'✅ {len(tl)}/{len(lines)} phrases calées, durée {total:.1f} s')
