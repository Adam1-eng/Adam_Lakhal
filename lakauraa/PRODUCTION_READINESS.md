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

---

## 7. Mise à jour « SEO, performance, UX, conversion » (16 novembre 2026)

État : **testée sur préversion Vercel, pas encore en production.** La mise en production attend ton accord.

### Checklist

| Domaine | Contrôle | Statut |
|---|---|---|
| SEO technique | Titres et descriptions uniques, canoniques, robots meta, 404 en noindex | ✅ 351/351 en local, 335/335 sur la préversion |
| Robots.txt | `/admin`, `/api/`, `/avis/` exclus ; sitemap déclaré | ✅ |
| Sitemap | Dynamique : pages fixes + projets publiés (brouillons exclus) | ✅ 20 URL sur la préversion |
| Données structurées | `WebSite`, `ProfessionalService`, `Person`, fil d’Ariane, `FAQPage`, `Service`, `CreativeWork` ; aucun avis, note ni adresse inventés | ✅ JSON valide · ⏳ Test des résultats enrichis de Google après mise en ligne |
| Partage social | OG + Twitter complets, image propre à chaque projet | ✅ |
| Performance | Accueil mobile : JS −68 %, travail du processeur ≈ −50 %, score 77 → 79 (médianes) ; autres pages 97 à 100 | ✅ mesuré · objectif 90 sur l’accueil mobile **non atteint** |
| Sécurité préservée | En-têtes, CSP, authentification, CSRF inchangés ; nouveau point `/api/evt` protégé | ✅ 168 tests de sécurité |
| Responsive | 6 tailles d’écran × 8 pages : aucun débordement, aucune erreur | ✅ |
| Accessibilité | axe WCAG 2.2 AA, 25 pages : 0 violation ; clavier et cibles tactiles | ✅ · ⏳ test au lecteur d’écran |
| Fonctionnalités | WhatsApp Maroc/Canada, formulaire, avis, admin | ✅ |
| Contacts | Liens `wa.me`, `tel:`, `sms:`, `mailto:` vérifiés | ✅ |
| Formulaires | Validation, erreurs annoncées, jamais « envoyé » à tort | ✅ |
| Mesure | Compteur anonyme (sans cookie, GPC respecté), tableau de bord admin | ✅ local · ⏳ un premier clic réel à vérifier en production |
| Analytics tiers | GA4 non installé (exigerait un consentement) | — choix volontaire |
| Search Console | Non connectée, **rien n’a été soumis** | ⏳ Adam |

### À faire après la mise en production

1. `BASE=https://lakauraa.vercel.app npm run test:seo` doit afficher 0 échec.
2. Cliquer une fois sur WhatsApp depuis ton téléphone, puis vérifier que le compteur passe à 1 dans
   Admin → Vue d’ensemble.
3. PageSpeed Insights sur l’accueil.
4. Search Console : ajouter la propriété, puis m’envoyer la balise de vérification (voir `SEO_AUDIT_REPORT.md`, § 10).
5. Créer la fiche Google Business Profile (zone desservie, adresse masquée).

### Limites de vérification

- Mesures de performance **synthétiques** (Lighthouse), pas de données d’utilisateurs réels pour l’instant.
- Aucun test sur de vrais téléphones, ni avec un vrai lecteur d’écran.
- Volumes de mots-clés non disponibles (aucun outil SEO connecté) : la stratégie repose sur des hypothèses.

### Base de données des préversions

Les préversions Vercel utilisent la **même base que la production**. Recommandation : une branche Neon séparée
pour les préversions (voir `WEBSITE_OPTIMIZATION_CHANGELOG.md`).
