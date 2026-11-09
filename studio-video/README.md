# 🎬 Studio vidéo 3D — Review de site client (avec TA voix)

Ce dossier fabrique **automatiquement** une vidéo verticale 1080×1920 en **60 images/seconde**
(format TikTok / Reels) qui présente un site client :

- 📱 **Téléphone en vraie 3D** : épaisseur, dos signé « Adam Lakhal », il se retourne, pivote, fait un tour complet
- 👆 **Le site est vraiment utilisé** : un robot navigateur touche les boutons, ouvre les menus,
  tape au clavier, ajoute au panier et commande — c'est l'écran **réel** qui est filmé (60 i/s, qualité Retina)
- ✋ Doigt, menus déroulants et clavier dessinés par-dessus pour qu'on voie chaque geste
- 💬 Bulles, badges et carte « Écris-moi SITE » qui volent en 3D, particules en profondeur
- 🎙️ **Ta voix** (ou une voix provisoire), sous-titres synchronisés mot par mot, musique + bruitages

> 🔒 Sécurité : pendant l'enregistrement, WhatsApp est **intercepté** et remplacé par une page
> maquette locale. **Aucun message ni commande n'est envoyé au magasin.** Les données du
> formulaire sont fictives (« Client Démo »).

---

## Les étapes

| # | Fichier | Ce qu'il fait |
|---|---|---|
| 1 | `record.js` | Utilise le vrai site comme un client et filme l'écran (`rec/`) + note chaque geste |
| 2 | `get-fonts.py` | Télécharge les polices du site (même style que le client) |
| 3a | `voix_adam.py` | **TA VOIX** : nettoie ton vocal, Whisper repère chaque mot, cale les phrases du script |
| 3b | `tts.py` + `timeline.py` | (sinon) voix provisoire générée par IA |
| 4 | `comp3d.html` + `render3d.js` | La scène 3D, dessinée image par image → `out/image.mp4` |
| 5 | `audio3d.py` + `mux3d.sh` | Musique + bruitages + voix → MP4 final, volume réglé pour les réseaux |

Le texte de la voix est dans `lines_fr.json` (le même que `contenu/scripts/texte-a-lire-review-autorefaatart.md`).

## Commandes (depuis ce dossier)

Prérequis : Node.js + Playwright, Python 3 + numpy, ffmpeg, `pip install faster-whisper edge-tts`.

```bash
node record.js                       # 1. filme le site (1 minute)
python3 get-fonts.py                 # 2. polices
python3 voix_adam.py mon_vocal.m4a   # 3. TA voix  (ou : python3 tts.py && python3 timeline.py)
node render3d.js preview 2,20,40     #    (optionnel) images de contrôle dans prev/
node render3d.js video out/image.mp4 60   # 4. vidéo 60 i/s (≈ 15-20 min)
python3 audio3d.py && ./mux3d.sh review_autorefaatart   # 5. son → out/review_autorefaatart_voix.mp4
```

## Pour un autre client
1. `record.js` : changer l'adresse du site et les gestes (quels boutons toucher).
2. `lines_fr.json` : écrire le nouveau texte.
3. `comp3d.html` : changer les titres (`HEADS`), bulles (`BUBBLES`), badges (`BADGES`).

⚠️ Toujours demander l'accord du client avant de publier une vidéo de son site.

L'ancienne version (2D, darija) est gardée dans `v1-darija/`.
