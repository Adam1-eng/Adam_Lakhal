# Rapport de performance — Lakauraa

_16 novembre 2026. Mesures **synthétiques** (Lighthouse 13, Chromium sans interface, profil mobile simulé :
4G lente et processeur ralenti ×4) prises depuis un conteneur de travail. Ce ne sont **pas** des mesures
d’utilisateurs réels : aucune donnée terrain (CrUX / Search Console) n’existe encore pour ce site. Les scores
varient d’une exécution à l’autre ; l’accueil a donc été mesuré 3 fois de chaque côté._

## 1. Méthode

- **Avant** : production actuelle `https://lakauraa.vercel.app` (commit `735eaf5`).
- **Après** : préversion Vercel du commit `ab08406` (mêmes serveurs, même région yul1, même base de données).
- Les deux côtés ont été mesurés **dans la même session**, en alternance, pour limiter les écarts de réseau.
- La préversion est protégée par Vercel : un lien de partage temporaire a été utilisé. Sur une préversion,
  Vercel ajoute `noindex` et une barre de commentaires bloquée par la CSP. C’est ce qui fait baisser
  artificiellement les scores SEO (61) et Bonnes pratiques (92) **de la préversion uniquement**.

## 2. Résultats

### Accueil — mobile (3 mesures de chaque côté)

| Indicateur | Avant | Après | Objectif |
|---|---|---|---|
| Score Performance | 69 / 77 / 79 | 79 / 77 / 82 | 90+ |
| LCP | 2,4 / 3,0 / 2,7 s | 2,5 / 2,6 / 2,6 s | ≤ 2,5 s |
| TBT (proxy de l’INP en labo) | 1 570 / 640 / 620 ms | 710 / 870 / 580 ms | < 200 ms |
| CLS | 0 | 0 | ≤ 0,1 ✅ |
| FCP | 1,0–1,1 s | 1,0–1,1 s | — |
| TTFB (document) | 30 ms | 30–60 ms | ✅ |
| **JavaScript transféré** | **193 Ko** | **61 Ko (−68 %)** | — |
| **Travail du processeur** | **10,6 à 13,3 s** | **5,1 à 6,9 s (≈ −50 %)** | — |
| Poids total | 651 Ko | 520 Ko (−20 %) | — |
| Accessibilité | 100 | 100 | 95+ ✅ |

**Lecture honnête :**
- Le site télécharge et exécute deux fois moins de travail sur cellulaire, ce qui veut dire moins de batterie et
  moins de chauffe.
- Le **score** Lighthouse de l’accueil ne progresse que peu (médiane 77 → 79) : l’écart reste dans la marge de
  variation de l’outil.
- L’objectif de 90 sur l’accueil mobile **n’est pas atteint**. La cause restante est connue (§ 4).

### Autres pages — mobile (1 mesure de chaque côté)

| Page | Avant | Après |
|---|---|---|
| /services | 99 (TBT 110 ms) | 100 (TBT 60 ms) |
| /projets | 96 (TBT 220 ms) | 100 (TBT 70 ms) |
| /contact | 95 (TBT 250 ms) | 97 (TBT 200 ms) |

### Accueil — ordinateur

| | Avant | Après |
|---|---|---|
| Score | 98 | 99 |
| LCP | 0,7 s | 0,8 s |
| TBT | 30 ms | 50 ms |

Les écarts sur ordinateur relèvent du bruit de mesure.

### Mesures en production avant tout changement (référence initiale, 1 passage)

| Page | Perf | SEO | A11y | BP | LCP | TBT |
|---|---|---|---|---|---|---|
| / | 74 | 100 | 100 | 100 | 2,1 s | 1 010 ms |
| /services | 99 | 100 | 100 | 100 | 1,1 s | 110 ms |
| /projets | 98 | 100 | 100 | 100 | 1,8 s | 150 ms |
| /contact | 97 | 100 | 100 | 100 | 1,2 s | 210 ms |

## 3. Optimisations effectuées

| Optimisation | Effet mesuré | Statut |
|---|---|---|
| **Titre du hero** : l’effet « BlurText » (React Bits + bibliothèque `motion`, 145 Ko) est reproduit en **CSS pur**, mêmes mots, même trajectoire et même rythme. La dépendance `motion` est retirée. | −145 Ko de JS | ✅ comparé visuellement en captures d’écran |
| **Rayons lumineux WebGL** (React Bits LightRays) et **étoile du bouton** (StarBorder) chargés **seulement sur écran ≥ 761 px**. Sur cellulaire : version CSS (dégradé conique + halo, étoile CSS qui fait le tour du bouton). | travail du processeur « autre » : ≈ 12,8 s → 1,7 à 3,3 s | ✅ |
| Cache CDN des pages : `stale-while-revalidate` 50 s → 300 s (la page reste servie depuis le CDN pendant la régénération) | réponses `HIT` vérifiées | ✅ |
| Sitemap mis en cache 10 min au CDN | — | ✅ |
| Vitrine du hero : animation au défilement avec départ explicite (corrige une opacité réduite à l’arrivée) | défaut visuel corrigé | ✅ |

**Essayé puis annulé (mesure défavorable) :** une apparition du hero en CSS au lieu de GSAP. Sur la préversion, le
paragraphe d’introduction n’était compté comme affiché qu’à la **fin** de l’animation : délai de rendu ≈ 1,9 s,
LCP 3,0 s. Retour à GSAP (`ab08406`).

**Volontairement non fait :** démarrer l’animation à une opacité « presque invisible » pour avancer artificiellement
le LCP. Le score monterait sans que le visiteur voie quoi que ce soit plus tôt.

## 4. Ce qui reste lourd, et pourquoi

1. **GSAP + ScrollTrigger + Lenis** (≈ 140 Ko non compressés, bundle `Base…js`). C’est la principale source du
   TBT restant sur l’accueil mobile. Ces bibliothèques portent les animations premium au défilement demandées par
   Adam.
   - Option possible (non appliquée, **à valider**) : ne charger Lenis (défilement doux) que sur ordinateur, car
     le défilement natif est déjà fluide sur téléphone. Gain estimé, non mesuré : quelques centaines de ms de TBT.
2. **ClientRouter** (transitions entre les pages, 14 Ko). C’est lui qui impose `'unsafe-inline'` dans la CSP (voir
   le rapport de sécurité). Le garder est un choix de design.
3. **Images des maquettes du hero** (diaporama de 5 sites) : les 4 suivantes sont déjà en `loading="lazy"` avec
   `srcset`. La première est en `fetchpriority="high"`.
4. **Polices** : Inter (variable), Space Grotesk 500/700 et Caveat (signature), auto-hébergées en woff2. On
   Caveat sert uniquement à la signature du pied de page, présente sur chaque page. On pourrait la remplacer par
   un dessin SVG (gain faible).

## 5. Images

- Images de projets : conversion en **WebP**, 2000 px + vignette de 900 px, avec `srcset`, `width` et `height`.
  Elles ne provoquent aucun saut de mise en page : CLS = 0 sur toutes les pages, et le test automatique vérifie
  les dimensions ✅
- Images du hero et de la page services : `astro:assets` (WebP, plusieurs largeurs) ✅
- AVIF : non activé. Gain possible de 20 à 30 % sur le poids des images, mais le temps de conversion à l’envoi dans
  l’admin augmenterait (limite de 30 s sur Vercel). Pas prioritaire.

## 6. Animations

- `prefers-reduced-motion` : respecté partout. Le titre du hero, les rayons, l’étoile, Lenis et GSAP sont
  désactivés et les contenus affichés immédiatement ✅
- Toutes les animations ajoutées utilisent `transform`, `opacity` et `filter`, sans calcul de mise en page ✅
- LightRays et StarBorder s’arrêtent hors de l’écran (IntersectionObserver) et quand l’onglet est caché 📖

## 7. Cache et serveur

- Pages HTML publiques : `s-maxage=10, stale-while-revalidate=300` (CDN) ; vérifié `x-vercel-cache: HIT` ✅
- Fichiers `/_astro/*` : noms avec empreinte et cache long, gérés par Vercel 📖
- Admin, liens d’avis, API : `no-store` ; **aucune page privée n’est mise en cache publiquement** ✅
- Compression : Brotli servi par Vercel (22 Ko pour le HTML de l’accueil) ✅

## 8. Comment refaire la mesure

```bash
# Production, une fois mise à jour
npx lighthouse https://lakauraa.vercel.app/ --only-categories=performance --view
# ou PageSpeed Insights (inclut les données terrain quand il y en aura) :
# https://pagespeed.web.dev/analysis?url=https://lakauraa.vercel.app/
```

Une fois le site en ligne depuis quelques semaines, consulter **Search Console → Signaux Web essentiels** pour
les vraies valeurs mesurées chez les visiteurs.
