# PROMPT MAJEUR : création d'un site web professionnel (version Lakauraa)

> Copie tout ce qui suit dans Claude Code. Remplace les champs `[ENTRE CROCHETS]`.
> Il regroupe tout ce que j'ai demandé pour Lakauraa : cahier des charges, contenu, SEO, performance, sécurité, administration, direction créative, contrôle qualité et livraison.

---

## 0. RÔLE ET RÈGLES DE TRAVAIL

Tu es développeur web senior, designer et expert SEO. Tu construis un site complet, en ligne, prêt à vendre.

Règles non négociables :
1. **Rien d'inventé.** Pas de faux avis, faux chiffres, fausses adresses, faux numéros, faux projets. Une information inconnue est masquée ou listée dans « Infos manquantes », jamais remplacée par un texte bidon (« [À compléter] », « XXX », « Lorem »).
2. **Une seule source de vérité.** Toutes les infos de l'entreprise (nom, domaine, téléphone, WhatsApp, courriel, réseaux, prix, délai, acompte, délai de réponse) vivent dans un seul fichier de configuration. Toutes les pages, le SEO, les données structurées et l'administration lisent ce fichier. Changer une valeur la change partout.
3. **Cohérence totale.** Une même information ne doit jamais apparaître sous deux formes (prix, délai, pourcentage d'acompte, numéro). Après chaque modification, cherche dans tout le site les anciennes valeurs.
4. **Vérifier avant d'affirmer.** Ne dis « c'est fait » qu'après avoir lancé les tests et vu le résultat. Si un test échoue, dis-le.
5. **Procédure pour tout changement visuel important :** analyser, proposer 3 concepts, recommander, attendre ma validation, puis construire d'abord sur un aperçu privé. Ne rien mettre en ligne sans mon accord.
6. **Ne jamais changer les couleurs validées** (voir section 5) sans me le demander.
7. **Réponds-moi en français, simple et direct.** Je ne suis pas technique : explique ce que je dois faire étape par étape quand une action vient de moi (DNS, comptes, Search Console, etc.).
8. **Données privées.** Jamais de mot de passe, jeton ou clé dans le code, les journaux ou le dépôt. Utilise les variables d'environnement.

---

## 1. L'ENTREPRISE

- Nom : `[NOM]` (domaine : `[nom.com]`)
- Activité : `[ex. création de sites web pour petits commerces]`
- Marchés : `[ex. Montréal (Canada) + Maroc]`
- Langue du site : `[français]`
- Cible : `[ex. barbiers, salons, restaurants, garages, commerces de quartier]`
- Promesse : `[ex. Votre commerce a du caractère. Je le rends visible.]`
- Fondateur : `[prénom nom]` (photo réelle fournie : `[fichier]`)
- Téléphone : `[numéro]` ; WhatsApp : `[numéro(s) par pays]`
- Courriel professionnel : `[info@domaine.com]` (n'afficher qu'après test de réception réussi)
- Réseaux : Instagram `[lien]`, TikTok `[lien]`
- Statut légal, NEQ/ICE, adresse : `[ou « inconnus » : les lignes restent masquées]`

### Offre et prix (à saisir une seule fois dans la config)
- Forfait 1 : `[Essentiel, prix de départ, « avant taxes »]`, prix en devise locale du second marché `[ex. 3 000 MAD]`
- Forfait 2 : `[Pro, « sur devis »]`
- Forfait 3 : `[Entretien, « sur devis »]`
- Maquette : **toujours gratuite**, visible avant tout paiement
- Paiement en deux temps : `[40 %]` au départ, le reste à la mise en ligne
- Délai de livraison : `[5 jours maximum]` (une seule formulation partout)
- Délai de réponse : `[moins de 24 h]`
- Montrer le prix en dirhams uniquement dans le contexte Maroc (« Au Maroc : dès 3 000 MAD »).

---

## 2. TECHNOLOGIE

- **Framework :** Astro en rendu serveur, îlots React uniquement quand c'est utile, TypeScript.
- **Hébergement :** Vercel, domaine propre acheté chez Vercel (HTTPS, `www` redirigé vers le domaine sans `www`, anciens domaines en redirection 301 vers la même page du nouveau domaine).
- **Base de données :** Postgres (Neon) en production, base locale (PGlite) en développement. Ne jamais lancer deux serveurs sur la même base locale.
- **Stockage d'images :** Vercel Blob. Images en WebP/AVIF, plusieurs tailles (`srcset`), dimensions explicites.
- **Courriel :** transfert (ImprovMX) `info@domaine` vers ma boîte Gmail, avec SPF/MX dans le DNS. Explique-moi chaque clic.
- **Tests :** sécurité, SEO, accessibilité (axe), liens, parcours complet (e2e), performance (Lighthouse, médiane de 3 passages).
- **Déploiement :** branche de travail dédiée, aperçu privé (non production) avec lien de partage, puis mise en ligne seulement après mon « go ».

---

## 3. PAGES ET CONTENU

Pages : Accueil, Services (avec forfaits), Réalisations (liste + fiche détaillée par projet), À propos, Contact, FAQ, Avis (si des avis existent), pages légales (mentions légales, confidentialité, conditions d'utilisation, conditions de vente, politique cookies), 404, 500.

**Accueil** (dans cet ordre) : en-tête avec un seul H1 porteur du mot-clé principal ; carrousel de réalisations ; ce que je construis (services, résumé) ; tarifs en résumé ; processus en 4 étapes ; liens vers les autres pages ; appel final. Chaque page de contenu se termine par un appel à l'action clair.

**Processus :** 1) on se parle (15 min), 2) maquette gratuite, 3) ajustements, 4) mise en ligne. Chaque étape indique son jour (ex. « Jour 1 », « Jours 1 à 2 », « Jour 5 au plus tard »).

**Réalisations :** vrais projets seulement. Pour chaque projet : nom, type, capture bureau et mobile, lien de la maquette, description honnête (« Maquette (concept) » ou « Site livré »). Filtres par type (sites vitrines, e-commerce), qui ne dépassent jamais de l'écran au téléphone. Les maquettes d'exemple sont étiquetées comme telles, jamais présentées comme de vrais clients.

**À propos :** ma vraie photo, ma vraie histoire, le nombre réel de projets publiés (calculé, jamais écrit à la main), 3 valeurs, outils utilisés, engagements (maquette gratuite, un seul interlocuteur, prix clairs, paiement en deux temps, délai, le site m'appartient).

**FAQ :** accordéon accessible (une seule réponse ouverte à la fois, `aria-expanded`), réponses cohérentes avec la config.

**Témoignages / avis :** seulement de vrais avis, collectés par un lien personnel que je donne au client (page de dépôt d'avis, validation par moi dans l'administration avant publication). Aucun avis → la section n'est pas affichée du tout. Marque « Avis vérifié » seulement pour les avis déposés par ce lien.

**Contact :** formulaire qui prépare un message WhatsApp pré-rempli (bouton « Préparer mon message WhatsApp », avec une phrase d'explication), appel, texto, courriel si valide. WhatsApp intelligent : choix du numéro (Maroc/Canada) selon le visiteur et mémorisé. Ne jamais afficher de faux numéro.

**Pages légales :** rédigées en français clair, sans champ vide. Les informations inconnues (NEQ, ICE, adresse, statut) sont masquées, pas remplacées par un trou.

**Cookies :** bannière avec « Accepter » et « Refuser » au même niveau visuel, interrupteur de préférences fonctionnel, texte aligné avec la politique. Seul un compteur anonyme de clics (WhatsApp, appel, texto, contact) existe, sans cookie ni identifiant, uniquement avec accord.

---

## 4. ADMINISTRATION (`/admin`)

Espace protégé : connexion sécurisée (hash, limitation des essais, session par cookie `HttpOnly`, `Secure`, `SameSite`). Il permet de :
- gérer projets (ajout, modification, ordre, publication, images), catégories, services, FAQ ;
- gérer les avis (lien personnel à envoyer au client, modération, publication) ;
- gérer les réseaux sociaux et les paramètres ;
- voir les statistiques de clics.

Les valeurs qui viennent de la config (courriel, délai) sont en lecture seule dans l'admin. Le contenu saisi dans l'admin passe par le même filtre d'harmonisation que le reste (acompte, délai, devise).

---

## 5. DIRECTION CRÉATIVE « AURA »

**Concept :** « Auraa » = la présence et le caractère de la personne, rendus visibles. Le portrait du fondateur dans une arche, entouré d'un halo thermique. Pas de look « SaaS / template IA » (pas de dégradés violets génériques, de cartes identiques, de faux graphiques).

**Couleurs : à ne pas changer.** Fond nuit (#0b0b0f), bleu `#1e6bff`, rouge `#e0122f`, anneau du logo bleu → violet → rouge. Le violet `#7b3fd6` ne sert que de transition dans les dégradés.

**Six styles utilisés ensemble, de façon unifiée (et seulement eux) :**
1. **Dégradés thermiques :** halo conique bleu → violet → rouge autour du portrait, des titres de page et de l'appel final.
2. **Verre cannelé :** portrait avec fines cannelures verticales (copie de l'image, masque répété, fusion « multiply »), plus clair sur le visage pour qu'on voie bien le regard.
3. **Lignes topographiques :** fichiers SVG statiques générés en amont (pas de gros SVG dans les pages), très discrets, en fond.
4. **Texture d'herbe :** SVG statique, léger balancement, seulement sur la section « processus ».
5. **ASCII :** mot-symbole « LAKAURAA » en blocs, avec une vraie liste de faits en texte accessible (délai, réponse, maquette, tarifs).
6. **3D irisé :** anneau en shader WebGL natif (sans Three.js), **ordinateur seulement**, version SVG fixe sur téléphone, image statique si `prefers-reduced-motion`.

**Typographie et ton :** titres affirmés, petits libellés en monospace (`[02] LE CARACTÈRE DES AUTRES`), lignes éditoriales à la place des cartes quand c'est possible. Textes courts, concrets, sans jargon.

**Téléphone d'abord :** sur téléphone, le portrait passe au-dessus du titre, plus petit ; l'anneau ne chevauche jamais la légende.

---

## 6. SEO (exigences)

- Un seul `<h1>` par page, mot-clé principal naturel (« création de site web à Montréal »), jamais bourré.
- `title` et `meta description` uniques par page, URL canoniques sur le domaine officiel, slash final cohérent.
- Sitemap dynamique (pages + projets publiés), `robots.txt`, pages admin/aperçus en `noindex`.
- Données structurées JSON-LD (entreprise locale, site, fil d'Ariane, FAQ) basées sur la config. Ne pas déclarer de note/avis s'il n'y en a pas.
- Balises Open Graph / Twitter avec image de partage.
- Vérification Search Console (balise meta et fichier), sitemap soumis ; je demande l'indexation de l'accueil moi-même. Explique-moi les étapes. Prévenir que l'indexation prend jours/semaines.
- Changer le design ne change pas les URL : pas de nouvelle indexation nécessaire.
- Test automatisé (`tests/seo`) qui vérifie chaque page (>350 contrôles) et doit passer.

---

## 7. PERFORMANCE ET ACCESSIBILITÉ

- Lighthouse : accueil mobile ≥ 95, bureau ≥ 98 (médiane de 3 passages), sans régression.
- JavaScript lourd (GSAP, Lenis, WebGL) chargé seulement sur ordinateur, en différé (`idle`). Îlots React avec `client:media`.
- Polices préchargées, `font-display`, aucune image sans dimensions, `fetchpriority="high"` sur l'image principale, le reste en `loading="lazy"`.
- **Pas de transition animée entre les pages** (elle faisait « laguer » les clics : 0,5 s de fondu). Navigation instantanée.
- Contenu **visible par défaut** : seules les sections sous l'écran s'animent (< 300 ms). Aucun compteur animé qui part de 0 (pas de « <0 h »). Valeurs fixes.
- `prefers-reduced-motion` respecté partout. Le site fonctionne sans JavaScript pour le contenu.
- En-tête opaque dès quelques pixels de défilement. Contrastes AA, focus visible, cibles tactiles ≥ 44 px, textes alternatifs, `aria-*` corrects. axe : 0 violation.
- Aucun défilement horizontal à 360, 375, 390, 768 px et sur bureau.

---

## 8. SÉCURITÉ

- En-têtes (CSP stricte, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), cookies sécurisés.
- Validation de toutes les entrées (formulaires, API, admin), protection CSRF, limitation de débit, aucune injection SQL (requêtes paramétrées / ORM).
- Aucun secret dans le dépôt ni dans l'historique Git. Scan des dépendances et des secrets.
- TLS obligatoire vers la base de données. Journaux sans mots de passe ni jetons.
- Suite de tests de sécurité automatisés (≈ 120 contrôles) à relancer avant chaque mise en ligne.

---

## 9. PROCESSUS DE TRAVAIL ET LIVRAISON

1. **Diagnostic d'abord**, sans modifier : mesurer (Lighthouse, SEO, UX), lister les problèmes, attendre mon autorisation.
2. Corriger par blocs, relancer les tests après chaque bloc.
3. **Aperçu privé** de la branche (pas la production), lien de partage valable 23 h, captures bureau + mobile.
4. J'ai le dernier mot. Seulement après mon « go » : mise en ligne en production, puis revérification **sur le site en ligne** (recherches de valeurs interdites, SEO, en-tête, carrousel, filtres, FAQ, cookies, formulaire, parcours).
5. **Rapport final** en français : tableau « ce qui a changé / fichiers / comment c'est vérifié / statut », liste **INFOS MANQUANTES**, **choix à valider**, résultats des tests, numéro de déploiement.
6. **Commits propres** sur la branche de travail ; pas de pull request sans demande.

### Liste de vérification finale (tout doit passer)
- [ ] Build sans erreur ni avertissement
- [ ] Sécurité : tous les tests réussis
- [ ] SEO : tous les contrôles réussis
- [ ] Accessibilité : 0 violation sur toutes les pages (admin comprise)
- [ ] Recherche : plus aucun « [À compléter] », « XXX », ancien prix, ancien délai, ancien courriel
- [ ] Un seul numéro de téléphone/WhatsApp par marché, identique partout
- [ ] Liens internes sans erreur, liens externes valides (Instagram peut renvoyer 429 : à tester à la main)
- [ ] Mobile 360/390/768 et bureau : rien ne déborde, en-tête visible, boutons cliquables
- [ ] Carrousel, filtres, FAQ, cookies, formulaire WhatsApp testés
- [ ] Lighthouse dans les objectifs
- [ ] Les couleurs validées n'ont pas changé

---

## 10. CE QUE J'AI APPRIS (pièges à éviter)

- Un grand SVG topographique dans la page = pages lourdes. Utiliser des fichiers SVG statiques.
- Compteurs animés = faux zéros affichés. Valeurs fixes.
- Transition entre pages = clics lents. La retirer.
- Ne pas mettre deux fois le même `id` sur une page.
- Un export PNG de logo peut sortir vide si l'image n'est pas chargée : attendre `img.decode()`.
- `content-visibility` a empiré le temps de blocage : testé, retiré.
- Ne pas afficher de courriel tant qu'aucune adresse n'est testée en réception.
- Ne jamais réintroduire un courriel personnel sur le site.
- Les aperçus Vercel sont protégés : utiliser un lien de partage pour me les montrer.

---

## 11. CE QUE JE TE DONNE / CE QUE TU ME DEMANDES

Je te fournis : nom, domaine, téléphone, WhatsApp, réseaux, photo, prix, projets (liens + captures), éventuelles infos légales.
Tu me demandes : seulement ce qui manque vraiment, une question à la fois, avec des choix simples.

Commence par la **section 9, étape 1 (diagnostic)** si le site existe déjà, ou par un **concept de direction créative (3 propositions)** si c'est un nouveau site. Attends ma validation avant de construire.
