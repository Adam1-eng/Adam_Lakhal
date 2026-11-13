# Rapport d'audit de sécurité — Lakauraa

Date : 13 novembre 2026 · Branche : `claude/sweet-planck-lu8kew`
Périmètre : dossier `lakauraa/` (site public + espace `/admin`), contrôles non destructifs sur `https://lakauraa.vercel.app`.
Aucune sécurité absolue n'est garantie : ce rapport décrit ce qui a été vérifié, comment, et ce qui reste ouvert.

## 1. Cartographie

| Élément | Réalité du projet |
|---|---|
| Framework | Astro 7 (rendu serveur), TypeScript, îlots React (3 composants d'animation) |
| Hébergement | Vercel (fonction Node 22, région `yul1`) |
| Base de données | PostgreSQL Neon (prod) / PGlite (local), accès uniquement côté serveur via Drizzle ORM |
| Authentification | Maison : comptes admin en base, scrypt, sessions aléatoires stockées hachées, cookie `__Host-lk_admin` |
| Rôles | Un seul rôle : administrateur. Aucun compte visiteur, aucune inscription publique |
| Stockage | Vercel Blob (images de projets, publiques par nature) |
| Téléversement | Images de projets, admin seulement |
| Formulaire public | Contact : aucun envoi au serveur (prépare un courriel/texto/WhatsApp sur l'appareil du visiteur) |
| API | `/api/geo` (public, lecture seule) ; `/api/admin/*` (6 routes, admin) |
| Paiement | Aucun |
| Services tiers | Vercel, Neon, liens sortants `wa.me` ; aucun script ni police externe |
| Secrets | `DATABASE_URL` (+ variables Neon), `BLOB_READ_WRITE_TOKEN`, `ADMIN_SETUP_TOKEN` — tous dans Vercel, aucun dans le dépôt |

Points d'entrée sensibles : `/admin/login`, `/admin/setup`, formulaires `/admin/*` (POST), `/api/admin/*`, téléversement d'images.

## 2. Méthodes et preuves

| Vérification | Outil | Résultat |
|---|---|---|
| Tests unitaires de sécurité | `npm run test:security:unit` | **49 / 49 réussis** |
| Tests HTTP de bout en bout (serveur de test isolé) | `npm run test:security:http` | **84 / 84 réussis** |
| CSP dans un vrai navigateur (15 pages, public + admin) | Playwright | 0 violation, animations/vidéo/formulaire fonctionnels |
| Clickjacking (iframe depuis un autre site) | Playwright | 2 tentatives bloquées sur 2 |
| Secrets dans l'historique Git | Gitleaks 8.28 — 53 commits, 5 références | **0 fuite** |
| Secrets dans le code et le bundle public | Gitleaks + recherche de noms sensibles | 0 secret, 0 source map publique |
| Dépendances | `npm audit` | 14 → 8 alertes, 0 critique, 0 élevée |
| Fichiers sensibles en production | 19 requêtes de contrôle | 18 × 404, 1 × 500 (corrigé, voir S-06) |
| Accessibilité / non-régression | axe (23 pages), parcours fonctionnels | 0 violation, pas de régression |
| Build de production | `astro check` + `astro build` | 0 erreur |

## 3. Vulnérabilités et corrections

Statuts : **Corrigé et testé** · **Corrigé mais non testé** · **En attente de mon autorisation** · **Non corrigé** · **Non applicable**.

| ID | Vulnérabilité | Gravité | Fichier concerné | Correction appliquée | Test effectué | Résultat |
|---|---|---|---|---|---|---|
| S-01 | Dépendances avec failles connues (zod, path-to-regexp) | Élevé (théorique) | `package.json` | `overrides` vers versions corrigées | `npm audit`, build, 133 tests | Corrigé et testé |
| S-02 | Aucune Content-Security-Policy | Moyen | `src/middleware.ts` | CSP stricte sur toutes les pages | Navigateur : 0 violation, iframes bloquées | Corrigé et testé |
| S-03 | Certificat TLS de la base non vérifié | Moyen | `src/lib/db/index.ts` | `rejectUnauthorized: true` | Lecture du code seulement (nécessite un déploiement) | Corrigé mais non testé |
| S-04 | Coût scrypt sous la recommandation OWASP | Moyen | `src/lib/auth.ts`, `login.astro` | N=2^17 + re-hachage transparent à la connexion | 11 tests unitaires | Corrigé et testé |
| S-05 | Injection possible dans les données structurées (JSON-LD) | Faible | `src/layouts/Base.astro` | Échappement de `<` | Test HTTP avec charge `</script>` | Corrigé et testé |
| S-06 | Erreur 500 sur les chemins inconnus `/_…` | Faible | `src/middleware.ts`, `src/pages/500.astro` | Paramètres par défaut garantis + page 500 générique | Test HTTP local (404) | Corrigé et testé (local) |
| S-07 | Aucun journal des événements de sécurité | Faible | `src/lib/security-log.ts` + 6 fichiers | Journal structuré, données masquées | 10 tests HTTP | Corrigé et testé |
| S-08 | Ancienne session non détruite à la connexion | Faible | `login.astro` | Destruction + nouvelle session | 2 tests HTTP | Corrigé et testé |
| S-09 | Fichiers statiques sans `nosniff` | Faible | `vercel.json` | En-têtes pour toutes les réponses | Nécessite un déploiement | Corrigé mais non testé |
| S-10 | `.env` non exclus de Git | Faible | `.gitignore` | Règles `.env*`, clés privées | `git check-ignore` | Corrigé et testé |
| S-11 | Échec de connexion renvoyé en 200 | Faible | `login.astro` | 401 (échec) et 429 (blocage) | 3 tests HTTP | Corrigé et testé |
| S-12 | Validation trop permissive (courriel, JSON) | Faible | `src/lib/admin.ts`, 4 routes API | `isEmail` strict, schémas `.strict()` | 10 tests | Corrigé et testé |
| S-13 | Redirection après connexion à durcir | Faible | `src/lib/admin.ts` | Rejet des `\`, espaces, caractères de contrôle | 9 tests unitaires + 1 HTTP | Corrigé et testé |
| S-14 | 8 alertes « modérées » restantes (esbuild, glob, minimatch) | Moyen (théorique) | dépendances de build | Aucune : correctif = régression majeure | Analyse d'impact | Non corrigé (risque accepté) |
| S-15 | CSP : `script-src 'unsafe-inline'` | Moyen | `src/middleware.ts` | Aucune : imposé par les transitions de page | — | Non corrigé (choix : préserver les animations) |
| S-16 | Pas de double authentification (MFA) admin | Moyen | `src/lib/totp.ts`, `login.astro`, `parametres.astro`, migration 0003 | TOTP facultatif + 8 codes de secours (autorisé par toi) | 10 tests unitaires + 13 tests HTTP | Corrigé et testé (à activer par toi) |
| S-17 | Jeton d'installation encore présent dans Vercel | Faible | variable `ADMIN_SETUP_TOKEN` | Aucune : action sur un service externe | Page `/admin/setup` fermée (302) | En attente de mon autorisation |
| S-18 | Aucune récupération de mot de passe | Faible | — | Procédure manuelle documentée | — | Non applicable (étape 17) |
| S-19 | Sauvegardes de la base non vérifiées | Faible | Neon | Aucune : pas d'accès | — | Vérification impossible |

### Détail

**S-01 — Dépendances.** `zod` < 4.6.6 (épuisement mémoire) arrivait par `@vercel/blob`, `path-to-regexp` < 6.3 (expression régulière lente) par l'adaptateur Vercel. Exploitation : peu probable ici (ces copies ne traitent pas d'entrées de visiteurs), mais `npm audit` les classait « élevées ». Correction : `overrides` dans `package.json`, sans changement de version majeure. Risque résiduel : aucun connu.

**S-02 — CSP.** Sans CSP, une injection de script réussie n'aurait eu aucune barrière. Politique : `default-src 'self'`, pas d'iframe, pas de plugin, `base-uri 'self'`, `form-action 'self' mailto:`, images limitées au site et à Vercel Blob, `frame-ancestors 'none'` sur l'admin. Risque résiduel : voir S-15.

**S-03 — TLS base de données.** La connexion était chiffrée mais acceptait n'importe quel certificat : un attaquant placé entre Vercel et Neon aurait pu l'intercepter (scénario difficile). **À vérifier après déploiement** : si la connexion échouait, revenir à la valeur précédente dans `src/lib/db/index.ts` (une ligne).

**S-04 — Mots de passe.** scrypt N=2^14 → N=2^17 (≈ 128 Mo, ≈ 0,3 s). Les comptes existants restent valides et sont re-hachés à leur prochaine connexion, sans migration. SHA-256 n'est utilisé que pour les jetons de session (aléatoires de 256 bits), jamais pour les mots de passe.

**S-05 — JSON-LD.** Une réponse de FAQ contenant `</script>` aurait pu fermer la balise de données structurées. Exploitation : nécessite déjà un compte admin. Corrigé par échappement.

**S-06 — Erreur 500.** Constatée en production sur `/_functions/…` (réponse vide, aucune fuite). Cause : paramètres du site non chargés pour ces chemins. Corrigé ; à reconfirmer en production après déploiement.

**S-07 — Journal.** Événements : connexions réussies/échouées/bloquées, déconnexions, création/suppression d'admin, changement de mot de passe, refus d'accès API, blocages CSRF, suppression de projet, erreurs serveur. Courriels et IP masqués, aucun mot de passe ni jeton (testé). Consultable dans Vercel → Logs, filtre `[security]`.

**S-14 — Alertes restantes.** `esbuild` (via `drizzle-kit`) ne concerne que le serveur de développement local ; `glob`/`minimatch` (via `@vercel/nft`) ne tournent qu'à la construction. Aucune n'est présente dans le site servi aux visiteurs. Le « correctif » proposé par npm est un retour à d'anciennes versions majeures, plus risqué que l'alerte.

**S-16 — Double authentification.** TOTP (RFC 6238, vérifié avec les vecteurs officiels), tolérance ±30 s, anti-rejeu, 8 codes de secours à usage unique stockés hachés. Désactivée par défaut : aucun risque de blocage tant que tu ne l'actives pas. Le secret TOTP est stocké en base (comme le veut ce mécanisme) : il est protégé par l'accès à la base. Un échec du second facteur donne le même message qu'un mauvais mot de passe et compte dans la limitation des tentatives.

**S-15 — `unsafe-inline`.** Les transitions de page d'Astro (`ClientRouter`) et l'hydratation des composants React utilisent des scripts intégrés ; la CSP par empreintes d'Astro est incompatible avec `ClientRouter`. La supprimer demande de remplacer les transitions de page (changement visible). Risque réel limité : l'échappement automatique d'Astro reste la protection principale (testée), et le seul contenu dynamique vient de l'admin.

## 4. Protections vérifiées (déjà en place ou ajoutées)

| Domaine | Vérifié par test |
|---|---|
| Authentification | Routes et API refusées sans session (6), jeton forgé, session expirée, session révoquée, déconnexion, compte supprimé |
| Énumération | Message et code identiques pour compte inconnu / mauvais mot de passe |
| Limitation | Blocage après 5 échecs / 15 min (par IP et par courriel), déblocage après la fenêtre, compteur en base (partagé entre instances) |
| CSRF | Origine étrangère → 403, origine absente → 403, API JSON → 403, aucun GET ne modifie de données, requête légitime acceptée |
| Cookies | `HttpOnly`, `SameSite=Strict`, `Secure` + préfixe `__Host-` en HTTPS, `Path=/`, 7 jours, jeton jamais stocké en clair |
| Validation serveur | Champ manquant, trop long, mauvais type, hors liste, propriété en trop, JSON illisible |
| XSS | Balises et gestionnaires d'événements affichés comme du texte (FAQ, titre, description, attributs) |
| Injection SQL | Requêtes paramétrées (Drizzle) ; `' OR 1=1 --` et `DROP TABLE` traités comme du texte |
| Fichiers | Faux PNG (PHP), SVG, > 4,5 Mo refusés ; nom dangereux ignoré ; conversion WebP ; servi en `image/webp` ; traversée de répertoire bloquée |
| IDOR | Image d'un autre projet / inexistante → 404 |
| CORS | Aucun en-tête `Access-Control-*` : même origine uniquement |
| HTTPS | HTTP → 308 vers HTTPS, HSTS 2 ans (production) |
| Fichiers exposés | `.env*`, `.git`, `package.json`, migrations SQL, sources : 404 en production |

## 5. Étapes non applicables

- **Étape 17 (réinitialisation de mot de passe)** : aucun lien de récupération n'existe, donc rien à détourner. Changement de mot de passe possible une fois connecté (mot de passe actuel exigé, autres sessions révoquées).
- **Étape 19 (paiements)** : aucun paiement, commande ni prix calculé. Les prix affichés sont du texte.
- **RLS / utilisateur A contre B (étape 3)** : un seul rôle (admin), aucune donnée privée par utilisateur ; la base n'est jamais accessible depuis le navigateur.

## 6. Vérifications impossibles

- Rôles, permissions et sauvegardes de la base Neon (aucun accès à la console).
- Alertes automatiques et durée de conservation des journaux Vercel (dépend du forfait).
- Configuration TLS détaillée (gérée par Vercel).
- Tests authentifiés sur la base de production (volontairement non faits : pas de mot de passe, pas de données réelles).
- GitHub Secret Scanning (réglage du dépôt).
- Les autres dépôts et les 48 projets « maquette-… » sont hors périmètre.

## 7. Synthèse

| | Détectés au départ | Encore ouverts |
|---|---|---|
| Critique | 0 | 0 |
| Élevé | 1 | 0 |
| Moyen | 6 | 2 (S-14, S-15) |
| Faible | 12 | 3 (S-17, S-18, S-19) |
| **Total** | **19** | **5** |

Corrigés : **14**. Corrections vérifiées par un test : **12** (S-03 et S-09 attendent un déploiement).

## 8. Recommandation

### LANCEMENT SOUS CONDITIONS

Aucune faille critique ou élevée connue ne subsiste, mais **les corrections ne sont pas encore en production** : le site en ligne tourne sur la version d'avant l'audit.

Conditions :
1. Déployer cette version (avec ton accord) puis refaire les contrôles de `PRODUCTION_READINESS.md`, en priorité la connexion à la base (S-03).
2. Supprimer la variable `ADMIN_SETUP_TOKEN` dans Vercel (S-17).
3. Vérifier les sauvegardes Neon (S-19).

4. Activer la double authentification dans `/admin/parametres` (S-16) et noter les codes de secours.

Recommandé ensuite, sans bloquer le lancement : CSP sans `unsafe-inline` (S-15).
