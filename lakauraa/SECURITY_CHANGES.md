# Modifications de sécurité

Aucun texte, couleur, animation, page ou fonctionnalité du site n'a été modifié. Aucune donnée supprimée. Déployé en production le 14 novembre 2026 (commit `2a51ea0`), avec ton autorisation.

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/middleware.ts` | CSP, `Cross-Origin-Opener-Policy`, Permissions-Policy élargie, `Vary: Cookie` sur l'admin, journal des refus d'accès et des blocages CSRF, paramètres par défaut garantis (corrige l'erreur 500) |
| `src/lib/auth.ts` | scrypt N=2^17, format de hachage versionné, ancien format accepté, `needsRehash`, vérification factice à coût constant |
| `src/pages/admin/login.astro` | Codes 401 / 429, re-hachage transparent, destruction de l'ancienne session, journal |
| `src/pages/admin/logout.ts`, `setup.astro`, `parametres.astro` | Journal des actions sensibles, validation de courriel stricte |
| `src/pages/admin/reseaux.astro` | Validation de courriel stricte |
| `src/lib/admin.ts` | `isEmail`, `isSafeNext` durci |
| `src/lib/projects-admin.ts` | Journal des suppressions de projet |
| `src/lib/db/index.ts` | Vérification du certificat TLS de la base |
| `src/layouts/Base.astro` | Échappement des données structurées (JSON-LD) |
| `src/pages/api/admin/…` (4 routes) | Schémas JSON stricts (propriétés inconnues refusées) |
| `.gitignore` | `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12` |
| `package.json`, `package-lock.json` | `overrides` de sécurité, scripts de test |

## Fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `src/lib/security-log.ts` | Journal de sécurité (masque courriels, IP et champs sensibles) |
| `src/pages/500.astro` | Page d'erreur générique, sans détail technique |
| `vercel.json` | En-têtes de sécurité pour les fichiers statiques |
| `src/lib/totp.ts`, `drizzle/0003_admin_mfa.sql` | Double authentification facultative (4 colonnes ajoutées à `admins`, aucune donnée modifiée) |
| `tests/security.unit.mts` | 49 tests unitaires |
| `tests/security.http.mjs` | 84 tests HTTP sur serveur isolé |
| 4 rapports `SECURITY_*.md`, `PRODUCTION_READINESS.md` | Documentation |

## Dépendances

- **Ajoutées** : aucune.
- **Supprimées** : aucune (toutes utilisées).
- **Mises à jour (correctifs, via `overrides`)** : `zod` 4.1.11 → 4.6.7 (copie interne de `@vercel/blob`), `path-to-regexp` 6.1.0 → 6.3.0 (copie interne de `@astrojs/vercel`).
- **Non mises à jour** : `drizzle-kit`, `@astrojs/vercel` (le correctif npm est un retour à une ancienne version majeure).

## Commandes

```bash
npm run test:security        # 49 tests unitaires + 84 tests HTTP (base de test isolée)
npm audit                    # dépendances
```

## Ce qui demande ton intervention

1. **Te connecter à `/admin`** et importer le contenu de départ.
2. **Supprimer `ADMIN_SETUP_TOKEN`** dans Vercel → Settings → Environment Variables. Je l'ai déjà retiré de la production et de la prévisualisation (il ne reste que pour « Development »), faute d'outil pour le supprimer.
3. **Vérifier les sauvegardes** dans la console Neon.
4. **Activer la double authentification** : `/admin/parametres` → « Double authentification » → Configurer, puis noter les 8 codes de secours.

## Retour en arrière

Deux commits (audit, puis double authentification) : `git revert` les annule. La migration 0003 ajoute seulement des colonnes avec valeur par défaut ; elle peut rester en place. Les mots de passe déjà re-hachés restent valides (le format indique ses propres paramètres).
