# Voix PROVISOIRE (IA) en attendant la voix d'Adam : génère chaque phrase + minutage des mots
import asyncio, json, os, edge_tts
VOICE, RATE = 'fr-FR-HenriNeural', '+4%'
LINES = json.load(open('lines_fr.json', encoding='utf-8'))
async def one(i, text):
    say = text.replace('AutoRefaatArt', 'Auto Refaat Art')        # prononciation
    c = edge_tts.Communicate(say, VOICE, rate=RATE, proxy=os.environ.get('HTTPS_PROXY'), boundary='WordBoundary')
    audio, words = b'', []
    async for ch in c.stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 't': ch['offset']/1e7, 'd': ch['duration']/1e7})
    # on recolle "Auto Refaat Art" en un seul mot pour les sous-titres
    out = []
    for w in words:
        if out and out[-1]['w'].endswith(('Auto', 'AutoRefaat')) and w['w'] in ('Refaat', 'Art'):
            out[-1]['w'] = out[-1]['w'] + w['w']; out[-1]['d'] = w['t'] + w['d'] - out[-1]['t']
        else: out.append(dict(w))
    open(f'voice/{i:02d}.mp3', 'wb').write(audio)
    return out
async def main():
    res = [{'id': l['id'], 'file': f'voice/{i:02d}.mp3', 'words': await one(i, l['say'])} for i, l in enumerate(LINES)]
    json.dump(res, open('voice/words.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('voix provisoire OK')
asyncio.run(main())
