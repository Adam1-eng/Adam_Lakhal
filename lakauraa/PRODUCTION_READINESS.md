# Préparation à la mise en production

État : version auditée **en ligne** sur `lakauraa.vercel.app` depuis le 14 novembre 2026. Les contrôles de la section 3 ont été faits, sauf ceux qui demandent ton mot de passe (connexion, ajout d'image, double authentification).

## 1. Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle | Action |
|---|---|---|
| `DATABASE_URL` (+ variables Neon) | Connexion PostgreSQL | Déjà créée par l'intégration Neon. Ne jamais la copier ailleurs |
| `BLOB_READ_WRITE_TOKEN` | Stockage des images | Déjà créée. Vercel la signale « lisible » : la passer en type **Sensitive** |
| `ADMIN_SETUP_TOKEN` | Création du premier compte | Retiré de Production et Preview. **À supprimer** complètement à la main |

Aucune variable ne doit commencer par `PUBLIC_` ou `VITE_` (le site n'en utilise aucune).

## 2. Paramètres de déploiement à vérifier

- Root Directory : `lakauraa` · Framework : Astro · Node : 22.x · Build : `npm run vercel-build` (applique les migrations).
- Adresse `lakauraa.vercel.app` : encore enregistrée sur l'ancien projet `lakauraa-ancien`. La retirer de l'ancien projet (Settings → Domains → Remove) pour pouvoir la rattacher définitivement au nouveau.
- Protection Vercel : ne partager que `lakauraa.vercel.app`, jamais les adresses `…-adam1-engs-projects.vercel.app`.

## 3. Tests à faire après le déploiement

| Contrôle | Attendu |
|---|---|
| Ouvrir `/` et `/projets` | Contenu affiché → la connexion TLS vérifiée à Neon fonctionne (S-03) |
| Se connecter à `/admin` | Connexion réussie (ton mot de passe est re-haché automatiquement) |
| `curl -I https://lakauraa.vercel.app/` | `content-security-policy`, `strict-transport-security`, `x-frame-options` présents |
| `curl -I` sur un fichier `/_astro/….js` | `x-content-type-options: nosniff` (S-09) |
| `https://lakauraa.vercel.app/_functions/x` | 404 et non 500 (S-06) |
| `http://lakauraa.vercel.app/` | Redirection 308 vers HTTPS |
| `/.env`, `/.git/config`, `/package.json` | 404 |
| Console du navigateur sur l'accueil | Aucun message « Content Security Policy » |
| Ajouter une image à un projet dans l'admin | Image affichée (Blob autorisé par la CSP) |
| Vercel → Logs, filtre `[security]` | Ta connexion apparaît (`login.success`) |
| `/admin/parametres` → Double authentification | Activation avec ton application, puis reconnexion avec le code |

Si le site n'affiche plus de contenu après le déploiement : cause probable S-03 ; revenir au déploiement précédent (Vercel → Deployments → Promote), puis me le signaler.

## 4. Risques résiduels

| Risque | Niveau | Détail |
|---|---|---|
| Scripts intégrés autorisés par la CSP | Moyen | Imposé par les transitions de page ; l'échappement automatique reste la barrière principale |
| Double authentification non activée | Moyen | Disponible dans `/admin/parametres` ; tant qu'elle est désactivée, un mot de passe volé suffit |
| Alertes de dépendances de build | Faible | Outils de développement et de construction, absents du site servi |
| Perte du mot de passe du seul admin | Faible | Voir procédure ci-dessous |
| Sauvegardes Neon non vérifiées | Faible | Le portfolio peut être réimporté, pas tes modifications |

## 5. Mot de passe oublié (aucun lien de récupération)

0. Téléphone perdu (double authentification) : utiliser un code de secours dans le champ « Code de vérification ».
1. Si un autre administrateur existe : il supprime ton accès et le recrée (`/admin/parametres`).
2. Sinon : dans la console Neon, vider la table `admins` (les sessions suivent), remettre une valeur dans `ADMIN_SETUP_TOKEN` sur Vercel, redéployer, puis recréer le compte sur `/admin/setup` et supprimer de nouveau la variable.

## 6. Surveillance recommandée

- Vercel → Logs : filtrer `[security]` ; surveiller `login.locked`, `csrf.blocked`, `access.denied`, `server.error`.
- Vercel → Firewall : activer la protection contre les robots et, si besoin, une règle de limitation sur `/admin/login`.
- GitHub → Settings → Code security : activer **Secret scanning** et **Dependabot alerts**.
- Chaque mois : `npm audit` et `npm run test:security`.
- Neon : vérifier la restauration à un instant donné (durée selon le forfait).
