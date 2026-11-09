# Génère la voix off phrase par phrase + le minutage de chaque mot (pour les sous-titres)
import asyncio, json, os, sys, edge_tts
LANG = sys.argv[1]  # 'ar' ou 'fr'
VOICE = {'ar': 'ar-MA-JamalNeural', 'fr': 'fr-FR-HenriNeural'}[LANG]
LINES = json.load(open(f'lines_{LANG}.json', encoding='utf-8'))
async def one(i, text):
    c = edge_tts.Communicate(text, VOICE, rate=LINES_RATE, proxy=os.environ.get('HTTPS_PROXY'), boundary='WordBoundary')
    audio, words = b'', []
    async for ch in c.stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary':
            words.append({'w': ch['text'], 't': ch['offset']/1e7, 'd': ch['duration']/1e7})
    open(f'voice/{LANG}_{i:02d}.mp3', 'wb').write(audio)
    return words
LINES_RATE = {'ar': '+22%', 'fr': '+6%'}[LANG]  # vitesse de la voix
async def main():
    out = []
    for i, l in enumerate(LINES):
        out.append({'id': l['id'], 'words': await one(i, l['say'])})
        print(i, l['id'], len(out[-1]['words']), 'mots')
    json.dump(out, open(f'voice/{LANG}_words.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
asyncio.run(main())
