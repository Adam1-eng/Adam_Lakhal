# Rapport UX / UI et accessibilité — Lakauraa

_16 novembre 2026. Aucun texte visible commercial, aucune couleur et aucune animation n’a été changé. Les
seules modifications visibles sont listées au § 6._

## 1. Méthode

- **Tests automatiques d’accessibilité** (axe-core 4.14, règles WCAG 2.0 / 2.1 / **2.2** A et AA + bonnes
  pratiques) sur **25 pages** : 15 publiques, dont la 404 et `/avis`, et 10 pages d’admin, connecté.
- **Tests de bout en bout** (Playwright, `tests/e2e.cjs`) : 8 pages publiques × 6 tailles d’écran :
  - 320×640 (petit téléphone) ;
  - 390×844 (téléphone) ;
  - 768×1024 (tablette en portrait) ;
  - 1024×768 (tablette en paysage) ;
  - 1366×768 (portable) ;
  - 1920×1080 (grand écran).
- **Vérifications visuelles** par captures d’écran : hero sur mobile et ordinateur, formulaire d’avis, mur des
  avis.
- Ce qui n’a **pas** été fait : un test avec un vrai lecteur d’écran (NVDA, VoiceOver) et des tests sur de vrais
  téléphones. Un score automatique ne garantit pas la conformité WCAG.

## 2. Résultats

| Contrôle | Résultat |
|---|---|
| axe-core, WCAG 2.2 AA, 25 pages | **0 violation** ✅ |
| Lighthouse Accessibilité (accueil, services, projets, contact) | **100** ✅ |
| Débordement horizontal, 6 tailles × 8 pages | **aucun** ✅ |
| Erreurs JavaScript dans la console, 6 tailles × 8 pages | **aucune** ✅ |
| Cibles tactiles ≥ 24×24 px (WCAG 2.5.8) | 1 défaut trouvé et corrigé ✅ |
| Lien « Aller au contenu » à la 1re tabulation | présent, visible ✅ |
| Focus visible au clavier | contour de 2 px ✅ |
| `prefers-reduced-motion` | respecté (animations coupées, contenus visibles) ✅ |
| Mise en page stable (CLS) | 0 sur toutes les pages mesurées ✅ |

## 3. Problèmes trouvés

| Problème | Gravité | Correction |
|---|---|---|
| Lien « Haut de page » du pied de page : 22 px de haut, sous le minimum de 24 px | Moyenne | hauteur minimale de 32 px ✅ |
| Vitrine du hero à moitié transparente sur ordinateur, constaté pendant les tests | Moyenne | départ explicite de l’animation de défilement ✅ |
| Image de la version cellulaire du hero sans texte alternatif | Basse | `alt` « Version cellulaire du site … » ✅ |

## 4. Points forts constatés (déjà en place)

- Navigation claire, 5 entrées, menu mobile accessible (fermeture avec Échap, blocage du défilement).
- Formulaire de contact :
  - labels visibles, erreurs annoncées (`aria-live`, `aria-invalid`) ;
  - focus placé sur le premier champ en erreur ;
  - barre de progression.
- Le formulaire **ne prétend jamais avoir envoyé** la demande : il affiche « Votre demande est prête » et propose
  WhatsApp, courriel, texto ou copie. L’envoi réel se fait depuis l’application du visiteur.
- Formulaire d’avis :
  - étoiles en boutons radio natifs, utilisables au clavier et lus par les lecteurs d’écran ;
  - consentement explicite ;
  - messages d’erreur clairs.
- Choix WhatsApp Maroc / Canada dans une fenêtre accessible (`dialog`), avec focus sur l’option recommandée.

## 5. Animations

- GSAP + ScrollTrigger + Lenis restent synchronisés sur le même « ticker » 📖
- Titre du hero : désormais en CSS, avec un rendu visuel identique (comparé en captures) ✅
- Cellulaire : les effets coûteux (WebGL, canvas) sont remplacés par des équivalents CSS légers. Le rendu est très
  proche, sans être identique au pixel près : les rayons sont un peu plus « doux » ✅

## 6. Changements visibles appliqués

Ils sont tous mineurs et non commerciaux :
1. Le lien « Haut de page » a une zone cliquable plus grande (même apparence).
2. Sur cellulaire uniquement : rayons du hero et étoile du bouton en CSS au lieu de WebGL/canvas.
3. Pages de confidentialité et de cookies : un paragraphe ajouté pour décrire honnêtement le compteur anonyme de
   contacts (voir `CONVERSION_STRATEGY.md`).

## 7. Propositions qui demandent ton accord

Elles **ne sont pas appliquées**.

| Proposition | Pourquoi | Effort |
|---|---|---|
| Ne charger le défilement doux (Lenis) que sur ordinateur | Le défilement natif est déjà fluide sur téléphone ; gain de performance probable sur l’accueil mobile | Faible |
| Ajouter une ligne « Réponse en moins de 24 h » juste sous le bouton principal du hero | Rassure au moment du clic | Faible |
| Résumés de projets « métier + ville » (dans l’admin) | Meilleure compréhension et meilleur SEO | Faible (contenu) |
| Mettre une vraie réalisation client en premier dans la vitrine du hero (AutoRefaatArt est déjà dans le diaporama) | Crédibilité | Faible |
| Test réel au lecteur d’écran (VoiceOver sur iPhone) | Les tests automatiques ne couvrent pas tout | 30 min |
