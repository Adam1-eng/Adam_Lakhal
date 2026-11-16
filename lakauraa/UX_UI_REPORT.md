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

---

## 8. Simplification « Less is More » (16 novembre 2026)

### Mesures, accueil sur téléphone (390 px)

| | Avant | Après |
|---|---|---|
| Hauteur de page | 18 387 px (≈ 22 écrans) | **11 735 px (≈ 14 écrans, −36 %)** |
| Mots visibles | 1 242 | **906 (−27 %)** |
| Sections | 11 | **9** |
| Appels à l’action en bas de page | 2 (doublon) | **1** |
| Accueil sur ordinateur | 12 338 px | **9 521 px (−23 %)** |

### Ce qui a changé

| Section | Avant | Après | Où va le détail |
|---|---|---|---|
| Hero | 2 phrases d’accroche | 1 phrase + la promesse « maquette avant de payer » | — |
| Problèmes | 3 grandes cartes illustrées, plus un bouton « Voir la solution » | Téléphone : 3 lignes compactes (icône, titre, phrase). Ordinateur : illustrations conservées. Bouton retiré (choix inutile). | — |
| Services | 4 cartes avec étiquettes + liste « Inclus selon votre forfait » | 4 cartes : titre, phrase, prix | Page Services (liste détaillée par forfait) |
| Engagements + Chiffres | 2 sections, 6 engagements | 1 section « Pourquoi moi » : les 4 engagements clés + les chiffres | Les 6 engagements sur À propos |
| Processus en 4 étapes | Sur l’accueil | Retiré de l’accueil | Page Services |
| Réalisations | Vedette + jusqu’à 6 projets, filtres, technologies, 2 liens « toutes les réalisations » | Vedette + 3 projets ; défilement au doigt sur téléphone ; un seul lien | Page Réalisations (filtres, tous les projets) |
| FAQ | 12 questions | Les 5 premières + lien « Toutes les questions » | Contact (#faq) et Services |
| Bas de page | Section CTA + bandeau CTA du pied de page | Le bandeau s’efface quand la page a déjà sa section CTA | — |
| Services (page) | Grands numéros décoratifs, espacements très larges sur téléphone | Numéros masqués et espacements réduits sur téléphone | — |

### Principes appliqués

- **Divulgation progressive** : l’essentiel sur l’accueil, le détail sur la page dédiée. Aucun contenu supprimé du site.
- **Loi de Hick** : un seul bouton principal par zone, et les liens en double retirés.
- **Charge cognitive** : les étiquettes et listes secondaires sont retirées de l’accueil.
- **Gestalt** : engagements et chiffres regroupés en une seule preuve de confiance.
- **Mobile d’abord** : cartes compactes et portfolio à faire défiler au doigt.

### SEO préservé

- H1 inchangé, hiérarchie H2/H3 cohérente.
- Toutes les pages et tous les textes de services restent indexés : `test:seo` donne 351/351.
- FAQ de l’accueil : les données structurées ne contiennent que les 5 questions affichées. Les 12 restent sur Contact et Services.

### Vérifications

| Contrôle | Résultat |
|---|---|
| `astro check` | 0 erreur |
| `npm run test:seo` | 351/351 |
| `npm run test:e2e` (6 tailles d’écran, contacts, WhatsApp, clavier) | OK |
| axe WCAG 2.2 AA, 25 pages | 0 violation |
| `npm run test:security` | 168/168 |

### Textes modifiés (à valider)

- **Hero** : « Je conçois des sites rapides, élégants et pensés pour le cellulaire : vos services, vos prix, vos heures et un bouton pour vous appeler. » → « Des sites rapides et élégants, pensés pour le cellulaire. »
- **Services**, intro : « De la simple page qui inspire confiance à la boutique en ligne complète. » → « De la simple page à la boutique en ligne. »
- **Réalisations**, intro : « Une boutique en ligne livrée et en ligne, … une sélection de maquettes … » → « Une boutique en ligne livrée, un exemple complet et des maquettes réalisées pour des commerces d’ici. »
- **Pourquoi moi**, intro (accueil seulement) : « La personne qui vous répond est celle qui code votre site. »
