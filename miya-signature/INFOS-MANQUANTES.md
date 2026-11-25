# Infos manquantes : à demander à Miya

Tant qu'une info manque, le site la **masque** (rien d'inventé). Pour l'ajouter : modifier `src/config/miya.ts`.

| # | Information | Où la mettre dans `miya.ts` | Effet sur le site |
|---|---|---|---|
| 1 | Photos haute qualité (portrait, poses, studio) | `media.heroPhoto`, `media.portrait`, `styleGroups[].styles[].photo` (fichiers dans `public/photos/`) | Remplacent les illustrations vectorielles |
| 2 | Vidéo « I'm Miya » | `media.introVideo` (+ `introVideoPoster`) | Section vidéo sur À propos |
| 3 | Horaires exacts | `identity.hours` | Bloc Horaires sur Contact |
| 4 | Adresse complète du studio | `identity.location.streetAddress`, `postalCode` | Adresse sur Contact + données structurées (plan d'accès à ajouter ensuite) |
| 5 | Téléphone (si elle veut l'afficher) | `identity.phone` | Contact, pied de page, données structurées |
| 6 | Témoignages ou avis clientes (réels, avec accord) | `reviews` | Section Avis sur l'accueil |
| 7 | Boutique en ligne : oui ou non ? | `shop.enabled` | Page /boutique + lien menu |
| 8 | Dates des prochaines formations | `trainings.lashBoss.nextDates` | Bloc « Prochaines dates » sur Formations |
| 9 | Logo et couleurs préférées | `media.logo` / `src/styles/global.css` | Logo et palette |
| 10 | Langue : français, anglais ou bilingue | — | Version anglaise à prévoir |
| 11 | Durée du blanchiment dentaire : 1 h ou 1 h 30 ? (Acuity : nom « 1H », durée affichée 1 h 30) | `services` → Blanchiment dentaire | Le site affiche 1 h 30 (durée Acuity) |
| 12 | Nom de domaine (supposé `miyasignature.com` d'après le courriel) | `identity.siteUrl` | Liens canoniques, sitemap, Open Graph |
| 13 | Nom légal / NEQ, responsable des renseignements personnels (Loi 25) | `legal.*` | Mentions légales, Confidentialité |
| 14 | Hébergeur (après mise en ligne) | `legal.host` | Mentions légales |
| 15 | Accord pour publier (retirer la maquette) | `status.demo = false` | Retire le bandeau, active l'indexation Google |
