# 🎬 Studio vidéo automatique — Review de site client

Ce dossier fabrique **automatiquement** une vidéo verticale (1080×1920, format TikTok/Reels)
qui présente un site client : vraies captures du site, téléphone animé, voix off,
sous-titres synchronisés mot par mot, musique, bruitages et appel à l'action « Écris SITE en DM ».

Première vidéo produite : **review du site AutoRefaatArt** (darija + français).

> Tu n'as pas besoin de comprendre tout le code pour utiliser les vidéos. Ce dossier sert
> surtout à **refaire la même chose pour tes prochains clients** (je pourrai t'aider à l'adapter).

---

## Comment ça marche (6 étapes)

| # | Script | Ce qu'il fait |
|---|---|---|
| 1 | `capture-site.js` | Ouvre le vrai site dans un navigateur invisible (format téléphone) et prend les captures d'écran. WhatsApp est bloqué : **aucune commande n'est envoyée**. |
| 2 | `get-fonts.py` | Télécharge les polices du site pour que la vidéo ait le même style. |
| 3 | `tts.py` | Génère la voix off (voix marocaine `ar-MA` ou française) phrase par phrase, avec le minutage de chaque mot. Les phrases sont dans `lines_ar.json` / `lines_fr.json`. |
| 4 | `timeline.py` | Colle les phrases ensemble et calcule le moment exact de chaque scène et de chaque mot. |
| 5 | `comp.html` + `render.js` | `comp.html` est la « scène » (téléphone, titres, bulles, sous-titres…). `render.js` la dessine image par image (30 images/seconde) et crée la vidéo sans son. Les textes sont dans `texts.json`. |
| 6 | `audio.py` + `mux.sh` | Crée la musique et les bruitages, baisse la musique quand la voix parle, puis assemble image + son en MP4 (volume réglé pour les réseaux sociaux). |

## Lancer (dans un terminal, depuis ce dossier)

Prérequis : Node.js + Playwright, Python 3 (numpy), ffmpeg, et `pip install edge-tts`.

```bash
node capture-site.js          # 1. captures
python3 get-fonts.py          # 2. polices
python3 tts.py ar             # 3. voix darija   (ou : fr)
python3 timeline.py ar        # 4. minutage
node render.js ar preview 2,20,50       # (optionnel) images de contrôle dans prev/
mkdir -p out && node render.js ar video out/ar_image.mp4   # 5. vidéo (quelques minutes)
python3 audio.py ar           # 6. son
./mux.sh ar                   #    → out/review_autorefaatart_ar_voix.mp4
```

## Pour un autre client
1. Dans `capture-site.js` : changer l'adresse du site et les pages à capturer.
2. Dans `lines_ar.json` / `lines_fr.json` : écrire le nouveau texte de la voix off.
3. Dans `texts.json` : changer les titres, bulles et badges.
4. Dans `comp.html` : adapter les scènes (quelles captures montrer et où « taper »).

⚠️ Toujours demander la permission du client avant de publier une vidéo de son site.
