# Journal des optimisations — Lakauraa

_Mission « SEO, performance, UX/UI et conversion », 16 novembre 2026. Branche `claude/sweet-planck-lu8kew`._

## Commits

| Commit | Contenu |
|---|---|
| `0787bb0` | SEO technique (sitemap dynamique, URL uniques, données structurées, OG) + performance mobile du hero |
| `6d5c798` | Mesure anonyme des contacts, accessibilité, essai d’apparition CSS du hero |
| `ab08406` | Retour à l’apparition GSAP du hero (mesure défavorable), stratégie de mots-clés |
| (ce commit) | Rapports, préparation à la production |

## Dépendances

| Paquet | Changement | Raison |
|---|---|---|
| `motion` | **supprimé** | utilisé seulement par BlurText, remplacé par du CSS |
| `@astrojs/sitemap` | **supprimé** | remplacé par un sitemap dynamique qui inclut les projets |
| `@astrojs/node` | **ajouté (développement seulement)** | build Node local pour mesurer les performances hors Vercel (`LOCAL_NODE=1`), jamais utilisé en production |

## Fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `src/lib/seo.ts` | pages publiques, entrées du sitemap, découpe des descriptions |
| `src/pages/sitemap-index.xml.ts`, `src/pages/sitemap-0.xml.ts` | sitemap dynamique |
| `src/components/HeroTitle.astro` | titre du hero animé en CSS (remplace l’îlot React) |
| `src/lib/stats.ts`, `src/pages/api/evt.ts`, `src/scripts/track.ts` | compteur anonyme des actions de contact |
| `drizzle/0005_contact_stats.sql` | table `contact_stats` (ajout seul, rien de modifié ni supprimé) |
| `tests/seo.mjs` | tests SEO (`npm run test:seo`) |
| `tests/e2e.cjs` | tests de bout en bout (`npm run test:e2e`) |
| `SEO_AUDIT_REPORT.md`, `KEYWORD_STRATEGY.md`, `PERFORMANCE_REPORT.md`, `UX_UI_REPORT.md`, `CONVERSION_STRATEGY.md`, ce fichier | livrables |

## Fichiers supprimés

- `src/components/islands/HeroTitle.tsx`, `src/components/react-bits/BlurText.tsx` : effet reproduit en CSS.
- La licence React Bits (`react-bits/LICENSE.md`) est conservée : LightRays et StarBorder restent utilisés.

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `astro.config.mjs` | sitemap retiré, `trailingSlash: 'ignore'`, adaptateur Node optionnel pour les mesures locales |
| `src/middleware.ts` | redirection 308 `/page/` → `/page` ; `stale-while-revalidate` à 300 s |
| `src/layouts/Base.astro` | balise robots, canonique sans barre finale, OG/Twitter complets, graphe JSON-LD (`WebSite`, `ProfessionalService`, `Person`, `BreadcrumbList`, `FAQPage`), props `crumbs` / `schema` / `imageAlt` ; script de mesure |
| `src/components/Hero.astro` | titre CSS ; rayons et étoile chargés seulement sur écran ≥ 761 px, équivalent CSS sur cellulaire ; `alt` des images cellulaire |
| `src/styles/global.css` | étoile CSS du bouton principal tant que l’îlot n’est pas chargé |
| `src/scripts/motion.ts` | vitrine du hero : `fromTo` (départ explicite) |
| `src/components/Footer.astro` | cible tactile du lien « Haut de page » |
| `src/components/WhatsApp.astro`, `ContactForm.astro` | signalement des actions au compteur (aucune donnée saisie n’est transmise) |
| `src/components/LegalPage.astro` | fil d’Ariane structuré |
| `src/pages/*.astro` (accueil, services, projets, projet, à propos, contact, avis, légales, 404) | titres et descriptions uniques, fil d’Ariane, `Service` / `CreativeWork`, 404 en noindex |
| `src/pages/admin/index.astro` | panneau « Contacts · 30 derniers jours » |
| `src/pages/confidentialite.astro`, `politique-cookies.astro` | description honnête du compteur anonyme |
| `src/lib/db/schema.ts` | table `contactStats` |
| `public/robots.txt` | `Disallow` sur `/admin`, `/api/` et `/avis/` |
| `tests/security.http.mjs` | 11 tests pour `/api/evt` |
| `package.json` | scripts `test:seo`, `test:e2e` ; dépendances (voir plus haut) |

## Tests effectués

| Test | Où | Résultat |
|---|---|---|
| `astro check` (TypeScript) | local | 0 erreur, 0 avertissement |
| Build de production (adaptateur Vercel) | local + Vercel | réussi |
| `npm run test:security` | local (base isolée) | 49 + 119 = **168 réussis**, 0 échec |
| `npm run test:seo` | local | **351/351** |
| `npm run test:seo` | préversion Vercel | **335/335** |
| `npm run test:e2e` (6 tailles × 8 pages, mesure, GPC, clavier) | local | **OK** |
| axe-core WCAG 2.2 AA, 25 pages | local | **0 violation** |
| Lighthouse avant / après | production / préversion | voir `PERFORMANCE_REPORT.md` |
| `/api/evt` : refus d’une autre origine, d’une action inconnue, d’une page admin | préversion | 403 / 400 / 400 |

**Non testé sur l’infrastructure réelle :** l’enregistrement d’un compteur valide. La préversion partage la base de
**production** (voir ci-dessous) : je n’y ai volontairement écrit aucune donnée.

## Point d’attention : base de données partagée

Les variables `DATABASE_URL` / `POSTGRES_*` de Vercel ciblent **à la fois `preview` et `production`**. Chaque
préversion utilise donc la base réelle et y applique les migrations au build. La migration `0005_contact_stats`
(création d’une table vide) a ainsi **déjà été appliquée à la base de production** lors du build de la préversion.

- C’est un ajout sans effet sur le site actuel : aucune donnée existante n’est lue, modifiée ni supprimée.
- **Recommandation :** créer une branche Neon dédiée aux préversions, puis limiter les variables actuelles à
  `production`. **À faire avec ton accord.**

## Actions nécessitant un redéploiement

1. **Mise en production** de la branche (commit final) : **en attente de ton accord**.
2. Après mise en production : relancer `npm run test:seo` avec `BASE=https://lakauraa.vercel.app`, et une mesure
   PageSpeed Insights.
3. Après connexion de Search Console : ajouter la balise de vérification, ce qui demande un redéploiement.

## Bilan des 34 étapes

**Légende :**
- **Déjà là** : en place avant la mission ;
- **Amélioré** : modifié pendant la mission ;
- **Testé** : vérifié par un test ou une mesure ;
- **Reste** : à faire.

| # | Étape | Déjà là | Amélioré | Testé | Reste |
|---|---|---|---|---|---|
| 1 | Analyse du projet | — | Diagnostic : Astro 7 SSR, Vercel, Neon, îlots React, GSAP/Lenis | ✅ | — |
| 2 | Audit SEO technique | H1 unique, SSR, noindex admin | Sitemap, URL uniques, métadonnées, alt | ✅ `test:seo` | — |
| 3 | Mots-clés | — | `KEYWORD_STRATEGY.md` (hypothèses) | — | Confirmer avec Search Console |
| 4 | Optimisation des pages | Contenus clairs | Métadonnées seulement (textes visibles inchangés) | ✅ | Résumés « métier + ville » (accord requis) |
| 5 | Sitemap et robots | Sitemap statique incomplet | Dynamique + robots complet | ✅ | — |
| 6 | Canonical et redirections | HTTPS, 404 réel | `/page/` → `/page`, canonique sans paramètres | ✅ | — |
| 7 | Schema.org | `ProfessionalService`, `FAQPage` | Graphe complet, fil d’Ariane, `Service`, `CreativeWork` | ✅ JSON | Test des résultats enrichis de Google |
| 8 | International | Site 100 % français | — (hreflang sans objet) | — | Décision : version EN/AR ? |
| 9 | Local | Coordonnées cohérentes | Zones desservies dans le JSON-LD | ✅ | Google Business Profile |
| 10 | Core Web Vitals | CLS 0, LCP < 2,5 s sauf accueil mobile | Mesures avant / après | ✅ | Accueil mobile < 90 |
| 11 | Images | WebP, srcset, dimensions | alt manquant ajouté | ✅ | AVIF (optionnel) |
| 12 | JS / CSS | Îlots ciblés | −145 Ko (motion), îlots lourds hors mobile | ✅ | Lenis seulement sur ordinateur (accord) |
| 13 | Animations | reduced-motion, transform/opacity | Équivalents CSS sur mobile, correction de la vitrine | ✅ | — |
| 14 | Chargement et rendu | SSR, `client:idle` | `client:media`, titre sans JS | ✅ | — |
| 15 | Cache / CDN | s-maxage 10 s, Brotli | SWR 300 s, sitemap 10 min | ✅ HIT | — |
| 16 | Audit UX/UI | Design premium cohérent | Corrections mineures | ✅ | Propositions (`UX_UI_REPORT.md`, § 7) |
| 17 | Responsive | Bon | Vérifié sur 6 tailles | ✅ e2e | Vrais appareils |
| 18 | Accessibilité | Bonne (Lighthouse 100) | Cible tactile, alt | ✅ axe 0 violation | Lecteur d’écran |
| 19 | CTA | CTA unique et répété | — | ✅ liens | Propositions de texte (accord) |
| 20 | WhatsApp et contacts | Choix Maroc/Canada, IP en conseil seulement | Mesure des clics | ✅ e2e | — |
| 21 | Pages de services | Offres, processus, FAQ, devis | — | 📖 | Section « Combien coûte un site ? » (accord) |
| 22 | Portfolio | Filtres, fiches détaillées | Métadonnées et JSON-LD par projet | ✅ | Résumés par métier |
| 23 | Formulaires | Validation, honnêteté de l’envoi | Mesure « demande préparée » | ✅ e2e | — |
| 24 | Search Console | — | Site prêt (sitemap, canoniques) | ✅ | Connexion par Adam |
| 25 | Analytics et événements | Aucun outil | Compteur anonyme, 6 actions | ✅ | Vercel Web Analytics (optionnel) |
| 26 | Conversions | — | Tableau de bord + méthode clic ≠ contact | ✅ local | Premier clic à vérifier en production |
| 27 | Open Graph | OG de base | OG + Twitter complets, image par projet | ✅ | — |
| 28 | Contenu | — | Pistes priorisées (mots-clés, § 5-6) | — | Rédaction avec Adam |
| 29 | Tests fonctionnels | Tests de sécurité | e2e + SEO | ✅ | — |
| 30 | Qualité du code | TypeScript strict | Code mort retiré (BlurText, sitemap) | ✅ 0 erreur | — |
| 31 | Tests automatisés | `test:security` | `test:seo`, `test:e2e`, +11 tests | ✅ | — |
| 32 | Admin et SEO dynamique | Brouillon / publication | Sitemap et métadonnées automatiques | ✅ | — |
| 33 | Pages légales | Toutes présentes | Paragraphe sur le compteur | ✅ liens | Validation juridique (déjà signalée) |
| 34 | Confiance | Réalisations réelles, avis vérifiés | — | 📖 | Avis clients, Google Business |
