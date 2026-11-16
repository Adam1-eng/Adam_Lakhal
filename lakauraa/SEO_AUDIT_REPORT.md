# Audit SEO — Lakauraa

_16 novembre 2026. Branche `claude/sweet-planck-lu8kew`. Modifications testées sur une préversion Vercel,
**pas encore déployées en production** (accord requis)._

**Légende des statuts :**
- ✅ testé : vérifié par un test ou une mesure réelle ;
- 🛠 appliqué, non testé en production ;
- 📖 lecture du code seulement ;
- ⏳ à faire / dépend d’Adam.

## 1. Diagnostic initial

Mesures du 16/11/2026 sur `https://lakauraa.vercel.app`, avant modifications.

| Constat | Gravité | Détail |
|---|---|---|
| Sitemap statique sans les projets | **Critique** | `@astrojs/sitemap` en mode `server` ne listait que 10 pages fixes : **aucune des pages de projets** n’était déclarée à Google. |
| URL du sitemap avec barre finale | Importante | Le sitemap annonçait `/contact/` alors que la canonique de la page est `/contact` : signaux contradictoires. |
| Deux adresses par page | Importante | `/contact` et `/contact/` répondaient toutes deux 200 (contenu dupliqué). |
| Descriptions génériques | Importante | L’accueil utilisait la description générale du site, et 5 pages légales avaient une description de moins de 70 caractères. |
| Titres trop longs | Moyenne | Accueil et Services dépassaient 65 caractères (coupés dans Google). |
| Données structurées incomplètes | Moyenne | Un seul bloc `ProfessionalService`, sans `WebSite`, sans fil d’Ariane, ni `Service` ni `CreativeWork` pour les projets. |
| Aperçus de partage incomplets | Moyenne | Pas de `twitter:title/description/image` ni de texte alternatif d’image ; les pages de projets indiquaient des dimensions fausses pour leur image (1200×630 fixes). |
| robots.txt minimal | Basse | Pas d’exclusion de `/admin`, `/api/` ni des liens d’avis personnels. |
| Page 404 indexable | Basse | Pas de `noindex` sur la page d’erreur. |
| Image sans `alt` | Basse | Version cellulaire des maquettes dans le hero. |

**Déjà correct :**
- rendu serveur (HTML complet, sans dépendre du JavaScript) ;
- `lang="fr-CA"` ;
- un seul H1 par page ;
- `noindex` + `X-Robots-Tag` sur l’admin ;
- redirection HTTP → HTTPS (308) ;
- vrai 404 pour les pages inexistantes ;
- Lighthouse SEO à 100.

## 2. Pages analysées

Les pages publiques analysées :
- `/`, `/services`, `/projets`, les 10 pages `/projets/[slug]` publiées, `/a-propos`, `/contact`, `/avis` ;
- les pages légales : mentions, confidentialité, CGU, CGV, cookies ;
- la page 404.

Les pages privées vérifiées (non indexables) : `/admin/*`, `/api/*`, `/avis/[jeton]`.

## 3. Corrections réalisées

| # | Correction | Fichiers | Statut |
|---|---|---|---|
| 1 | **Sitemap dynamique** : pages fixes + tous les projets publiés (avec `lastmod`) + `/avis` seulement s’il contient des avis. Les brouillons sont exclus, cache CDN de 10 min. | `src/lib/seo.ts`, `src/pages/sitemap-index.xml.ts`, `src/pages/sitemap-0.xml.ts` ; `@astrojs/sitemap` retiré | ✅ 20 URL sur la préversion, 21 en local |
| 2 | **Une seule URL par page** : `/page/` → `/page` en 308, paramètres conservés. La canonique ignore les paramètres (`?utm=` …). | `src/middleware.ts`, `src/layouts/Base.astro` | ✅ |
| 3 | **robots.txt** : `Disallow` sur `/admin`, `/api/` et `/avis/` (liens personnels) ; sitemap déclaré. Rappel en commentaire : ce n’est **pas** une protection. | `public/robots.txt` | ✅ |
| 4 | **Balise robots** sur chaque page (`index, follow, max-image-preview:large` ou `noindex, follow`) ; **404 en noindex**. | `Base.astro`, `404.astro` | ✅ |
| 5 | **Titres et descriptions** uniques, de 20 à 65 caractères pour les titres et de 70 à 165 pour les descriptions, sur toutes les pages publiques. Projets : description = résumé coupé proprement à 158 caractères. | pages, `src/lib/seo.ts` (`clip`) | ✅ 0 doublon |
| 6 | **Données structurées** regroupées dans un `@graph` (voir § 6). | `Base.astro`, `services.astro`, `projets/[slug].astro` | ✅ JSON valide sur 20 pages |
| 7 | **Open Graph / Twitter** complets, image propre à chaque projet, texte alternatif d’image. | `Base.astro` | ✅ |
| 8 | `alt` ajouté aux images de la version cellulaire du hero. | `Hero.astro` | ✅ |
| 9 | **Tests SEO automatisés** : environ 16 contrôles par page, plus liens internes, pages orphelines, doublons, redirections, 404 et admin. | `tests/seo.mjs` (`npm run test:seo`) | ✅ 351/351 en local, 335/335 sur la préversion |

## 4. Indexation

- Toutes les pages du sitemap répondent 200, sont indexables et ont une canonique égale à leur propre URL ✅
- Aucune page orpheline : chaque URL du sitemap reçoit au moins un lien interne ✅
- Aucun lien interne cassé (tous testés) ✅
- Pages privées : l’admin envoie `X-Robots-Tag: noindex, nofollow` et un `Cache-Control: no-store`. Les liens d’avis
  envoient `noindex` + `no-store` et répondent 404 s’ils sont invalides ✅
- La page `/avis` est en `noindex` tant qu’aucun avis n’est publié : on évite une page vide indexée ✅

**À savoir sur les préversions Vercel :** elles ajoutent automatiquement `X-Robots-Tag: noindex`. C’est normal et
voulu, et cela explique un score SEO Lighthouse de 58 à 61 sur la préversion. En production, ce score était de
**100**.

## 5. Redirections et canonicals

| Cas | Comportement | Statut |
|---|---|---|
| `http://` → `https://` | 308 (Vercel) | ✅ |
| `/page/` → `/page` | 308 | ✅ |
| `/?utm_source=…` | canonique `https://lakauraa.vercel.app/` | ✅ |
| page inexistante | **404 réel** (aucune redirection vers l’accueil) | ✅ |
| `www.` | sans objet : le domaine est un sous-domaine `vercel.app` | — |
| anciennes URL | aucune ancienne URL connue à rediriger | 📖 |

## 6. Données structurées

Graphe JSON-LD présent sur chaque page : `WebSite`, `ProfessionalService`, `Person` (Adam Lakhal), plus selon la
page :
- `BreadcrumbList` : toutes les pages sauf l’accueil ;
- `FAQPage` : pages qui affichent la FAQ ;
- `Service` : page `/services`, avec **uniquement** « à partir de 600 $ » ;
- `CreativeWork` : pages de projets.

**Volontairement absent :**
- `aggregateRating` / `Review` : Google n’affiche pas d’étoiles pour des avis récoltés sur le site d’une
  entreprise à propos d’elle-même, et ce serait risqué ;
- `LocalBusiness` avec adresse de rue : aucune adresse physique publique n’est déclarée ;
- certifications ou récompenses.

**Validité :** les données sont des objets JSON analysables (testé) et utilisent des types et propriétés Schema.org
documentés. Le **Test des résultats enrichis de Google n’a pas pu être lancé d’ici** (outil en ligne de Google) :
⏳ à faire après mise en production, sur https://search.google.com/test/rich-results.
Aucun affichage enrichi n’est garanti.

## 7. International et multilingue

- Le site est **100 % en français (fr-CA)**, sans version traduite. `hreflang` n’est donc **pas applicable**, et en
  ajouter sans traduction réelle serait une erreur.
- Maroc : le site le mentionne et propose un numéro marocain. Une version ou une page dédiée ne serait utile
  qu’avec du contenu réel (voir `KEYWORD_STRATEGY.md`, § 2-D). Ajouter une version arabe ou anglaise est une
  décision d’Adam (coût de traduction et d’entretien).

## 8. Référencement local

- Les coordonnées sont cohérentes partout : téléphone, courriel, « Montréal », numéros WhatsApp. Elles viennent
  d’une seule source, les paramètres de l’admin ✅
- **Google Business Profile** : Adam y est probablement admissible comme **entreprise de services sans adresse
  publique** (zone desservie : Montréal et environs). Configuration recommandée :
  - catégorie « Concepteur de sites web » ;
  - adresse **masquée** ;
  - zone de service : Montréal ;
  - même nom, même téléphone et même site que sur lakauraa ;
  - photos des réalisations.
  - C’est **la seule façon d’obtenir des étoiles visibles dans Google** (avis Google).
- Aucune page de ville artificielle n’a été créée.

## 9. Gestion dynamique des projets (admin)

Quand un projet est **publié** dans l’admin :
- il entre dans le sitemap (10 min de cache) ✅ ;
- il reçoit un titre, une description, une canonique, une image de partage, un `CreativeWork` et un fil d’Ariane
  automatiques ✅.

Un **brouillon** n’apparaît nulle part (404, hors du sitemap) ✅. Le slug est déjà unique et nettoyé par l’admin 📖.

## 10. Google Search Console

**Non connecté. Rien n’a été soumis ni validé.** Étapes :

1. https://search.google.com/search-console → « Ajouter une propriété » → **Préfixe d’URL** →
   `https://lakauraa.vercel.app/`.
2. Vérification par **balise HTML** : me transmettre le code `google-site-verification`, que j’ajouterai dans le
   `<head>`. La vérification par DNS n’est pas possible sur un sous-domaine `vercel.app`.
3. Menu Sitemaps → soumettre `sitemap-index.xml`.
4. Inspection d’URL → demander l’indexation de `/`, `/services`, `/projets`.
5. Revenir dans 4 à 8 semaines pour les données de requêtes.

Avec un **domaine personnalisé** (ex. `lakauraa.com`), il vaut mieux faire cette démarche **après** le changement de
domaine.

## 11. Actions restantes

| Action | Qui | Priorité |
|---|---|---|
| Autoriser la mise en production de ces changements | Adam | Haute |
| Connecter Search Console et soumettre le sitemap | Adam (+ moi pour la balise) | Haute |
| Créer la fiche Google Business Profile | Adam | Haute |
| Domaine personnalisé (meilleure crédibilité et meilleur SEO à long terme) | Adam | Moyenne |
| Résumés de projets orientés « métier + ville » (dans l’admin) | Adam | Moyenne |
| Test des résultats enrichis de Google après mise en ligne | moi ou Adam | Basse |
