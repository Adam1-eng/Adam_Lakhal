# TA VOIX → la vidéo se cale dessus automatiquement
# usage : python3 voix_adam.py mon_vocal.m4a      (mp3, m4a, ogg/opus de WhatsApp, wav… tout marche)
#
# 1. Nettoie le son (bruit de fond, graves inutiles, volume régulier)
# 2. Whisper écoute et note le moment exact de chaque mot
# 3. Chaque phrase du script est retrouvée ; si tu as recommencé une phrase, on garde la dernière prise
# 4. On coupe les « euh », les faux départs et les silences trop longs
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
    if words and (w['w'][0] in "'’-?!.,:;" or words[-1]['w'].endswith(("'", "’"))):   # + ponctuation seule
        words[-1]['w'] += w['w']; words[-1]['e'] = w['e']
    else: words.append(dict(w))
print(f'{len(words)} mots entendus :', ' '.join(w['w'] for w in words)[:200], '…')

# 3. où commence chaque phrase ? Si tu as recommencé une phrase, on garde la DERNIÈRE prise
norm = lambda s: re.sub(r"[^a-z0-9àâäçéèêëîïôöùûüÿœ]", '', s.lower())
lines = json.load(open('lines_fr.json', encoding='utf-8'))
S = [[w for w in l['say'].split() if norm(w)] for l in lines]       # mots du script, par phrase
H = [norm(w['w']) for w in words]                                     # mots entendus
sim = lambda x, y: difflib.SequenceMatcher(None, x, y).ratio()
def starts(i):   # endroits où la phrase i semble commencer (ses 2 premiers mots)
    head, first = ''.join(norm(w) for w in S[i][:2]), norm(S[i][0])
    return [k for k in range(len(H)) if sim(first, H[k]) >= 0.6 and
            (sim(head, ''.join(H[k:k+2])) >= 0.7 or sim(head, ''.join(H[k:k+3])) >= 0.8)]
def takes(c):    # « Il » et « Il clique » = la même prise : on garde le 1er mot de chaque groupe
    return [k for j, k in enumerate(c) if j == 0 or k - c[j-1] > 2]
cand = [takes(starts(i)) for i in range(len(lines))]
def speech_end(k, stop):   # prolonge tant que tu parles sans pause (mot mal entendu en fin de phrase)
    while k + 1 < stop and words[k+1]['t'] - words[k]['e'] < 0.5: k += 1
    return k
begin, prev = [], -1
for i in range(len(lines)):
    c = [k for k in cand[i] if k > prev]
    if not c: begin.append(None); continue
    nxt = [k for k in (cand[i+1] if i+1 < len(lines) else []) if k > c[0]]
    lim = nxt[0] if nxt else len(H)
    begin.append(max(k for k in c if k < lim))        # la dernière prise avant la phrase suivante
    prev = begin[-1]

def align(i, ks):
    """Rattache les mots du script aux mots entendus (orthographe du script, minutage de ta voix)."""
    sm = difflib.SequenceMatcher(None, [norm(w) for w in S[i]], [H[k] for k in ks], autojunk=False)
    hit = {}
    for tag, a1, a2, b1, b2 in sm.get_opcodes():
        for j in range(a2 - a1):
            if tag == 'equal' or (tag == 'replace' and a2 - a1 == b2 - b1 and sim(norm(S[i][a1+j]), H[ks[b1+j]]) >= 0.6):
                hit[a1 + j] = ks[b1 + j]          # mot reconnu (même mal écrit par Whisper : « acheté » → « acheter »)
    return hit

# phrase dont le début a changé (ex. « Il met » au lieu de « Il ajoute ») : elle commence
# juste après le dernier mot reconnu de la phrase précédente
for i in range(1, len(lines)):
    if begin[i] is not None or begin[i-1] is None: continue
    j = next((j for j in range(i+1, len(lines)) if begin[j] is not None), None)
    stop = begin[j] if j is not None else len(H)
    hit = align(i-1, list(range(begin[i-1], stop)))
    if hit:
        e = speech_end(max(hit.values()), stop)
        if e + 1 < stop: begin[i] = e + 1
missing = [f'{i+1} ({lines[i]["id"]})' for i in range(len(lines)) if begin[i] is None]
if missing:
    sys.exit('❌ Phrase(s) introuvable(s) dans le vocal : ' + ', '.join(missing) + ' → réenregistre ces phrases.')

# 4. découpe par phrase : on enlève les « euh », les faux départs et les silences trop longs
t, out, tl = START, [], []
for i, l in enumerate(lines):
    if begin[i] is None:
        print(f'⚠️ phrase {i+1} ({l["id"]}) non trouvée dans le vocal'); continue
    end_ = next((begin[j] for j in range(i+1, len(lines)) if begin[j] is not None), len(H))
    ks = list(range(begin[i], end_))
    hit = align(i, ks)
    if len(hit) < 0.5 * len(S[i]):
        print(f'⚠️ phrase {i+1} ({l["id"]}) très différente du script : je garde ce que tu as dit')
    last = speech_end(max(hit.values()), end_) if len(hit) >= 0.5 * len(S[i]) else ks[-1]
    ks = [k for k in ks if k <= last]                  # coupe ce qui traîne après la phrase
    # morceaux de voix, en raccourcissant les pauses de plus de 0,6 s à l'intérieur de la phrase
    pieces, shift, cur = [], [], None
    for k in ks:
        w = words[k]
        if cur and w['t'] - cur[1] > 0.6: pieces.append(cur); cur = None
        cur = [cur[0], w['e']] if cur else [max(0, w['t'] - 0.08), w['e']]
    pieces.append(cur)
    audio, offs, pos = [], [], 0.0
    for j, (a_, b_) in enumerate(pieces):
        b_ = b_ + (0.15 if j == len(pieces) - 1 else 0.12)
        offs.append((a_, b_, pos)); audio.append(clean[int(a_*SR):int(b_*SR)]); pos += b_ - a_
        if j < len(pieces) - 1: audio.append(np.zeros(int(0.25*SR), np.float32)); pos += 0.25
    piece = np.concatenate(audio)
    def at(x):                                          # temps du vocal → temps dans le morceau
        for a_, b_, p in offs:
            if x <= b_: return p + max(0, x - a_)
        return pos
    # sous-titres = ce que tu as VRAIMENT dit, avec l'orthographe du script pour les mots reconnus
    spell = {k: S[i][j] for j, k in hit.items()}
    caps = [{'w': spell.get(k, words[k]['w']), 't': at(words[k]['t']), 'e': at(words[k]['e'])} for k in ks]
    out.append((t, piece))
    tl.append({'id': l['id'], 'start': round(t, 3), 'end': round(t + len(piece) / SR, 3),
               'words': [{'w': c['w'].strip(',.:;'), 't': round(t + c['t'], 3), 'e': round(t + c['e'], 3)} for c in caps]})
    t += len(piece) / SR + GAP
total = t - GAP + TAIL
mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
for s, p in out: mix[int(s * SR):int(s * SR) + len(p)] += p
mix[:int(total * SR)].tofile(f'{OUT}/voice/voice.f32')
json.dump({'total': round(total, 3), 'lines': tl}, open(f'{OUT}/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'✅ {len(tl)}/{len(lines)} phrases calées, durée {total:.1f} s')
