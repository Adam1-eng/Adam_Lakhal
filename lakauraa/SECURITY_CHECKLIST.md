# Checklist de sécurité — les 27 étapes

États : ✅ Validé (testé) · 🟡 À vérifier après déploiement · ⏳ En attente de ton autorisation · ➖ Non applicable · ❔ Non vérifiable

| # | Étape | État | Preuve / remarque |
|---|---|---|---|
| 1 | Authentification | ✅ | 6 scénarios demandés testés : sans session, session expirée, jeton invalide, session révoquée, après déconnexion, compte supprimé |
| 2 | Clés API masquées | ✅ | Bundle public et réponses analysés : 0 secret ; aucune variable exposée au navigateur |
| 3 | Base de données | ✅ / ❔ | Accès serveur uniquement, requêtes paramétrées ✅. Rôles et sauvegardes Neon ❔ (pas d'accès). RLS ➖ (un seul rôle) |
| 4 | HTTPS obligatoire | ✅ | HTTP → 308 HTTPS, HSTS 2 ans, aucun contenu mixte, `upgrade-insecure-requests` |
| 5 | Mots de passe | ✅ | scrypt N=2^17 + sel unique ; bon/mauvais mot de passe, changement, absence dans les journaux testés |
| 6 | Validation serveur | ✅ | Champ manquant, trop long, mauvais type, hors limites, propriété en trop, données légitimes |
| 7 | XSS | ✅ | Échappement testé (texte et attributs) + CSP. Reste `unsafe-inline` pour les scripts (S-15, non corrigé) |
| 8 | Journalisation | ✅ / ❔ | 10 événements testés, données masquées. Alertes automatiques ❔ (à régler dans Vercel) |
| 9 | Routes admin | ✅ | Pages et 6 API refusées sans session. « Utilisateur standard » ➖ (rôle inexistant). Double authentification disponible et testée (à activer) |
| 10 | Requêtes paramétrées | ✅ | Drizzle partout, aucune concaténation SQL ; tri et filtres faits en mémoire sur liste fixe |
| 11 | Variables d'environnement | ✅ | `.env*` ignorés, `.env.example` sans valeur, aucun préfixe public utilisé |
| 12 | Limitation des requêtes | ✅ | Connexion : 5 essais / 15 min → 429, déblocage testé, compteur partagé en base. Autres routes : admin seulement |
| 13 | CORS | ✅ | Aucune origine étrangère autorisée (testé en local et en production) |
| 14 | En-têtes de sécurité | ✅ | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP testés. Fichiers statiques ✅ vérifiés en production |
| 15 | Cookies et sessions | ✅ | `HttpOnly`, `Secure`, `SameSite=Strict`, `__Host-`, expiration, révocation, jamais dans l'URL |
| 16 | CSRF | ✅ | Origine étrangère/absente → 403 (formulaires et API), aucun GET ne modifie, requête légitime acceptée |
| 17 | Réinitialisation de mot de passe | ➖ | Fonction inexistante (procédure manuelle dans `PRODUCTION_READINESS.md`) |
| 18 | Fichiers téléversés | ✅ | Légitime, format interdit, trop gros, extension trompeuse, nom dangereux, sans session, non exécutable : 8 tests |
| 19 | Prix et paiements | ➖ | Aucun paiement sur le site |
| 20 | Mode debug | ✅ | Aucune trace ni chemin dans les erreurs ; pas de source map publique ; erreur 500 corrigée, vérifiée en production |
| 21 | Dépendances vulnérables | ✅ | 14 → 8 alertes, 0 critique, 0 élevée. 8 modérées non exploitables en production (S-14) |
| 22 | Paquets inutilisés | ✅ | 25 dépendances contrôlées : toutes utilisées (code, configuration ou scripts). Aucune suppression |
| 23 | Fichiers sensibles exposés | ✅ | 18 chemins sensibles → 404 en production |
| 24 | Historique Git | ✅ | Gitleaks : 53 commits, 5 références, 0 secret |
| 25 | Clés compromises | ✅ | Aucun secret exposé dans le dépôt. Jeton d'installation retiré de la production (suppression complète à la main) |
| 26 | Audit transversal | ✅ | Voir `SECURITY_AUDIT_REPORT.md` (19 constats classés) |
| 27 | Tests et rapports | ✅ | 49 tests unitaires + 84 tests HTTP + navigateur ; 4 rapports produits |

Remarque : ton premier message était coupé entre les étapes 13 et 19 ; les étapes 14 à 19 ont été traitées d'après ton second message.
