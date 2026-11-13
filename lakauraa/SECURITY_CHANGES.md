# Modifications de sécurité

Aucun texte, couleur, animation, page ou fonctionnalité du site n'a été modifié. Aucune donnée supprimée. Rien n'a été déployé.

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
| `tests/security.unit.mts` | 39 tests unitaires |
| `tests/security.http.mjs` | 69 tests HTTP sur serveur isolé |
| 4 rapports `SECURITY_*.md`, `PRODUCTION_READINESS.md` | Documentation |

## Dépendances

- **Ajoutées** : aucune.
- **Supprimées** : aucune (toutes utilisées).
- **Mises à jour (correctifs, via `overrides`)** : `zod` 4.1.11 → 4.6.7 (copie interne de `@vercel/blob`), `path-to-regexp` 6.1.0 → 6.3.0 (copie interne de `@astrojs/vercel`).
- **Non mises à jour** : `drizzle-kit`, `@astrojs/vercel` (le correctif npm est un retour à une ancienne version majeure).

## Commandes

```bash
npm run test:security        # 39 tests unitaires + 69 tests HTTP (base de test isolée)
npm audit                    # dépendances
```

## Ce qui demande ton intervention

1. **Autoriser le déploiement** de cette version (rien n'est en ligne).
2. **Supprimer `ADMIN_SETUP_TOKEN`** dans Vercel → Settings → Environment Variables (il a été affiché dans notre conversation ; il ne sert plus, la page d'installation est fermée).
3. **Vérifier les sauvegardes** dans la console Neon.
4. Décider pour la **double authentification** et la **CSP sans `unsafe-inline`**.

## Retour en arrière

Tout tient dans un seul commit : `git revert <commit>` annule l'ensemble. Les mots de passe déjà re-hachés restent valides (le format indique ses propres paramètres).
