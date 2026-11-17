# Rapport — Audit A à L (17 novembre 2026)

Code : commits `e859619` et `8252e78` sur la branche `claude/sweet-planck-lu8kew`.
Source unique de vérité : `src/config/site.ts`.

## a) Tableau A à K

| # | Ce qui a changé | Fichiers | Comment c'est vérifié | Statut |
|---|---|---|---|---|
| A | En-tête opaque (#111117) dès 3 px de défilement, bande sombre derrière | Header.astro, interactions.ts | Script Playwright : en-tête opaque et visible sur 21 pages, en 375 px et sur bureau | FAIT |
| B | Contenu visible par défaut ; seuls les blocs sous l'écran s'animent (< 300 ms). Compteurs remplacés par des valeurs fixes : « 1 à 2 semaines », « < 24 h », « 0 $ ». Plus de « <0 h » ni de faux zéros | global.css, motion.ts, motion-config.ts, Stats.astro, Signature.astro, Stars.astro | 12 pages × 2 écrans + test sans JavaScript ; recherche « <0 h » : 0 résultat | FAIT |
| C | Plus aucun « [À compléter] ». Les lignes inconnues (NEQ, ICE, adresse, statut) sont masquées | pages légales, Todo.astro, LegalPage.astro | Recherche sur 26 adresses publiques : 0 | FAIT |
| D | « 48 » retiré. À propos affiche le nombre réel de projets publiés (calculé) | data/site.ts, Stats.astro, a-propos.astro | Recherche « 48 maquettes / 48 commerces » : 0 | FAIT |
| E | Acompte = 40 % partout (config + textes FAQ harmonisés) | config/site.ts, data/site.ts, Pricing, PricingSummary, conditions-vente, content.ts | Seule valeur trouvée sur le site : 40 | FAIT |
| F | Délai de réponse = « moins de 24 h » partout | config/site.ts, content.ts, faq.astro, admin/reseaux.astro | Seule valeur trouvée : 24 h ; « 2 h / 2 heures » : 0 | FAIT |
| G | « À partir de 600 $ CAD, avant taxes » pour Essentiel ; Pro et Entretien « Sur devis ». Aucun prix en MAD n'existait (rien à corriger) | config/site.ts, data/site.ts, Hero, Services, services.astro, Pricing, ContactForm, Base (JSON-LD) | Rendu vérifié page par page ; recherche « MAD » : 0 | FAIT |
| H | Courriel personnel retiré du site. Aucun courriel affiché tant qu'une vraie adresse n'existe pas. Monogramme « AL » prêt à être remplacé par une photo (`ownerPhoto`). Aucun faux avis. Domaine centralisé dans `SITE.url` | config/site.ts, Header, Footer, contact, ContactForm, Base, a-propos, astro.config.mjs, sitemaps, robots.txt.ts | Recherche du courriel personnel sur 16 adresses : 0. Test : changement de `SITE.url` propagé partout, puis remis | FAIT |
| I | L'accueil montre : résumé des services, processus, résumé des tarifs | index.astro, PricingSummary.astro (nouveau), TopicTiles.astro | Captures 375 px et bureau | FAIT |
| J | Formulaire : bouton « Préparer mon message WhatsApp », explication, aucun faux numéro (exemple salon : « XXX-XXXX »). Cookies : Accepter/Refuser au même niveau, interrupteur qui fonctionne, politique alignée. Grands vides réduits | ContactForm, CookiePrefs, track.ts, politique-cookies, confidentialite, global.css, services.astro, exemples/salon | Message pré-rempli contrôlé pour les 2 numéros ; cookies 20/20 contrôles ; plus grand vide : 136 px (375) / 216 px (bureau) | FAIT |
| K | FAQ en accordéon (une seule réponse ouverte, boutons avec aria-expanded). Étiquettes « Exemple de conversation ». Fiche AutoRefaatArt : la vidéo s'affiche seule au cellulaire. Filtres des réalisations sur plusieurs lignes au cellulaire | Faq.astro, interactions.ts, Problems.astro, ProjectMedia.astro, Portfolio.astro | 18/18 contrôles à 375, 390 et 768 px ; filtres : aucun bouton coupé | FAIT |

## b) INFOS MANQUANTES (rien n'a été inventé : ces lignes restent masquées)

1. Courriel professionnel qui fonctionne (lakauraa.ca n'est pas enregistré, donc bonjour@lakauraa.ca ne peut rien recevoir)
2. NEQ
3. ICE / IF / RC (Maroc)
4. Adresse postale
5. Statut légal (travailleur autonome, entreprise individuelle…)
6. Droit applicable / tribunal compétent
7. Numéros de TPS / TVQ (si inscrit)
8. Moyens de paiement acceptés
9. Prix des forfaits Pro et Entretien (affichés « Sur devis » pour l'instant)
10. Prix en dirhams (MAD), si tu en veux pour le Maroc
11. Vraie photo de toi
12. Vrais avis clients

## c) Choix à valider

- Acompte harmonisé à **40 %**
- Délai de réponse harmonisé à **moins de 24 h**
- « 48 » remplacé par le nombre réel de projets publiés
- Aucun courriel affiché (le personnel est retiré, le pro n'existe pas encore)
- La bannière cookies demande l'accord pour le petit compteur anonyme de contacts
- L'accueil remontre services, processus et tarifs (en résumé)
- Les textes de la FAQ saisis dans l'admin sont harmonisés automatiquement (40 %, 24 h, CAD)
- Dans l'admin, Courriel et Délai sont en lecture seule (ils viennent de la config)

## d) Domaine propre : ce que tu dois faire toi-même

1. Acheter le domaine (ex. lakauraa.ca) chez un registraire ou dans Vercel (Domains → Buy).
2. Vercel → projet **lakauraa** → Settings → Domains → Add → `lakauraa.ca` (+ `www.lakauraa.ca`).
3. Chez le registraire, ajouter les enregistrements DNS que Vercel affiche (en général : A `@` → 76.76.21.21 et CNAME `www` → cname.vercel-dns.com).
4. Attendre que Vercel affiche « Valid Configuration ».
5. Dans `src/config/site.ts`, changer `url: 'https://lakauraa.ca'`, puis redéployer.
6. Créer la boîte courriel (ex. bonjour@lakauraa.ca) et la mettre dans `publicEmail`, puis redéployer.
7. Optionnel : retirer `lakauraa.vercel.app` de l'ancien projet « lakauraa-ancien ».

## e) Résultat du build

- `npm run build` (astro check + astro build) : réussi, 0 erreur, 0 avertissement. Aucun script de lint n'existe dans le projet.
- Tests de sécurité : 119 réussis, 0 échoué.
- Tests SEO : 351 réussis, 0 échoué (21 pages).
- Accessibilité (axe) : 0 violation sur 25 pages.
- Liens internes : 36, 0 en erreur. Liens externes (maquettes, AutoRefaatArt, WhatsApp) : tous 200. Instagram répond 429 (blocage des robots) : à tester à la main.
- Mise en ligne : déploiement `dpl_GstEMikimZQVTxMYoaYUVQJeYwE7` (commit 8252e78) sur https://lakauraa.vercel.app.
  Revérifié en production : recherches (0 partout, acompte {40}, délai {24 h}), SEO 351/0, en-tête/boutons/vides
  sur 21 pages × 2 écrans, carrousel, filtres, FAQ, cookies, formulaire → WhatsApp, parcours e2e : tout OK.
- Lenteur des liens (« quand je clique sur un hyperlien ça lag ») : la cause était l'animation de transition
  entre les pages (capture de toute la page puis fondu, 0,4 à 0,5 s après chaque clic). Elle est retirée.
  Mesuré sur le site en ligne, tap → page entièrement affichée : téléphone simulé (processeur ×4) avant 0,6 à 0,95 s,
  après 0,12 à 0,36 s ; ordinateur avant 0,66 à 0,87 s, après 0,17 à 0,43 s (temps de téléchargement compris). Bonus : sur ordinateur, « Voir les forfaits » descend
  maintenant bien jusqu'aux forfaits (bug déjà présent avant). Navigation testée : 15/15 (retour, ancres, FAQ, carrousel).

## Points de l'audit qui étaient déjà faux avant les corrections (vérifié)

- Aucun « 50 % », aucun « 2 heures », aucun bonjour@lakauraa.ca, aucun prix en MAD n'existait sur le site.
- AutoRefaatArt : la capture cellulaire elle-même coupe le bouton ; au cellulaire la vidéo s'affiche maintenant seule.
