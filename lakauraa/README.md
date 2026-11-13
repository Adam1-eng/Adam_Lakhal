# Lakauraa — site web + espace administrateur

Site de Lakauraa (Adam Lakhal) : création de sites web pour commerces, au Canada et au Maroc.
Le portfolio, la FAQ, les services, les témoignages, les coordonnées, WhatsApp et les réseaux sociaux
se gèrent **sans toucher au code**, depuis `/admin`.

## Architecture

| Élément | Choix |
|---|---|
| Site | [Astro 7](https://astro.build) + TypeScript, rendu serveur (adaptateur Vercel) |
| Base de données | PostgreSQL (Neon via Vercel en production) — **PGlite** embarqué en local, sans installation |
| ORM / migrations | Drizzle (`drizzle/` = migrations SQL versionnées) |
| Images | Vercel Blob en production, dossier `.data/uploads` en local ; optimisées avec sharp (WebP 2000 px + miniature 900 px) |
| Authentification | Comptes en base, mots de passe scrypt, sessions aléatoires stockées hachées, cookie `HttpOnly` + `Secure` + `SameSite=Strict`, limitation à 5 essais / 15 min |
| Sécurité | Middleware : toutes les routes `/admin/*` et `/api/admin/*` exigent une session ; vérification de l’origine (anti-CSRF) sur toute écriture ; double contrôle dans chaque API ; validation zod ; vrai format d’image vérifié côté serveur |
| Cache | Pages publiques en cache CDN 10 s : un projet publié apparaît en quelques secondes, **sans redéploiement** |

## Démarrer en local

```bash
npm install
npm run db:migrate   # crée la base locale (.data/pglite)
npm run db:seed      # importe le contenu de départ (projets, FAQ, services)
npm run dev          # http://localhost:4321  → admin : http://localhost:4321/admin
```
Au premier passage sur `/admin`, la page **Installation** permet de créer votre compte.

## Mise en production (Vercel)

1. **Projet Vercel** : importer ce dépôt GitHub, *Root Directory* = `lakauraa`, framework **Astro**.
   La commande `vercel-build` applique automatiquement les migrations avant chaque build.
2. **Base de données** : Vercel → *Storage* → **Neon (Postgres)** → connecter au projet (crée `DATABASE_URL`).
3. **Images** : Vercel → *Storage* → **Blob** → connecter au projet (crée `BLOB_READ_WRITE_TOKEN`).
4. **Variable** `ADMIN_SETUP_TOKEN` : une longue phrase secrète (sert une seule fois, voir ci-dessous).
5. Déployer, ouvrir `https://…/admin/setup`, saisir le jeton et créer votre compte.
6. Sur le tableau de bord, cliquer **« Importer le contenu de départ »**, puis compléter la liste « À compléter »
   (numéros WhatsApp, réseaux sociaux, informations légales).

Variables : voir `.env.example`.

## Où gérer quoi

| Contenu | Où |
|---|---|
| Projets, images, ordre, mise en avant, brouillon/publié | `/admin/projets` |
| Catégories (seules celles avec projets publiés s’affichent) | `/admin/categories` |
| FAQ | `/admin/faq` |
| Témoignages (uniquement de vrais avis — la section apparaît dès le 1er publié) | `/admin/temoignages` |
| Textes des services | `/admin/services` |
| WhatsApp Maroc / Canada, réseaux sociaux, coordonnées | `/admin/reseaux` |
| Informations légales, mot de passe, administrateurs | `/admin/parametres` |
| Textes de sections fixes (accueil, forfaits, processus) | `src/data/site.ts` |
| Couleurs, typo, composants | `src/styles/global.css`, `src/components/` |

## WhatsApp intelligent
Le pays approximatif est fourni par Vercel (en-tête `x-vercel-ip-country`, route `/api/geo`, rien n’est stocké).
Maroc → numéro +212, Canada → numéro +1, autres pays → choix libre. Secours : fuseau horaire de l’appareil.
Le visiteur peut toujours choisir l’autre numéro ; son choix est mémorisé localement.

## Pages légales
Mentions légales, confidentialité (Loi 25 / Québec, LPRPDE, loi 09-08 / Maroc), CGU, CGV, cookies.
Les informations manquantes s’affichent **« À compléter »** et se remplissent dans `/admin/parametres`.
⚠️ Ce sont des modèles adaptés à l’activité : **à faire valider par un juriste**.

## Cookies
Le site n’utilise que des éléments strictement nécessaires : pas de bannière imposée.
Si un outil optionnel est ajouté, passer `OPTIONAL_TOOLS` à `true` dans `src/components/CookiePrefs.astro`.

## Scripts
`npm run dev` · `npm run build` · `npm run db:generate` (après modification du schéma) · `npm run db:migrate` · `npm run db:seed`
