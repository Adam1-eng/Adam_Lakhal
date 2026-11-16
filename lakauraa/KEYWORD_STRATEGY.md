# Stratégie de mots-clés — Lakauraa

_Dernière mise à jour : 16 novembre 2026._

## Sources et limites (à lire d’abord)

- **Aucune donnée chiffrée de volume ou de difficulté n’a été utilisée.** Aucun outil SEO n’était connecté :
  Search Console n’est pas relié au site et l’outil de mots-clés Ahrefs demande une autorisation que je n’ai pas.
- Tout ce document repose donc sur des **hypothèses argumentées** : les services réellement affichés sur le site,
  les publics visés (`src/data/site.ts`), l’intention de recherche probable et la concurrence qu’on peut supposer.
- Les priorités sont des **estimations qualitatives** (pertinence commerciale × chance réaliste de se classer pour
  un site jeune). Elles devront être confirmées ou corrigées avec les données réelles de Search Console après
  2 à 3 mois d’indexation.
- Aucune promesse de position : un site récent, sans liens externes, se classe d’abord sur la **longue traîne
  locale** (ex. « site web salon de coiffure Montréal ») avant les expressions générales.

## 1. Ce que l’entreprise propose réellement

D’après le site, aucune autre offre n’est déclarée.

| Service | Prix affiché |
|---|---|
| Site web « Essentiel » (une page) | **à partir de 600 $** |
| Site « Pro » (plusieurs pages, galerie, réservation, référencement de base) | sur devis |
| Boutique en ligne (réalisation AutoRefaatArt) | sur devis |
| Entretien du site | sur devis |
| Maquette gratuite avant paiement | gratuit |

**Pas proposé aujourd’hui : le développement d’applications web ou mobiles.** Les expressions « développement
application web », « création application sur mesure », etc. **ne sont pas ciblées**. Les viser sans offre réelle
attirerait un trafic qui ne convertit pas et créerait une promesse trompeuse. Si Adam ajoute ce service, il faudra
une page dédiée (voir § 6).

**Marchés réels :**
- **Montréal / Québec**, marché principal : téléphone canadien et adresse à Montréal.
- **Maroc**, à distance : numéro WhatsApp marocain et mention « projets au Maroc à distance ». Aucune ville
  marocaine n’est déclarée, et je n’en ai donc ciblé aucune. Exemple : « Agadir » n’est pas utilisé tant qu’Adam
  ne confirme pas y servir des clients.

**Langue :** le site est entièrement en français (fr-CA). Il n’existe aucune version anglaise ou arabe.

## 2. Mots-clés par groupe d’intention

### A. Transactionnel local — Montréal (priorité la plus haute)

| Expression (hypothèse) | Type | Commentaire |
|---|---|---|
| création site web Montréal | principal | très concurrentiel (agences) ; cible à long terme |
| création site web commerce Montréal | secondaire | plus précis, colle à l’offre |
| site web pour petite entreprise Montréal | secondaire | intention claire, prix sensible |
| site web pas cher Montréal / site web abordable Montréal | secondaire | colle à « à partir de 600 $ » |
| développeur web freelance Montréal | secondaire | correspond au profil « un développeur, pas une agence » |
| création site vitrine Montréal | secondaire | correspond à l’offre Essentiel/Pro |

### B. Longue traîne par métier (meilleure chance réaliste)

| Expression (hypothèse) | Page qui peut répondre |
|---|---|
| site web salon de coiffure Montréal | /projets/elan-coiffure + /services |
| site web barbier Montréal | /projets/maquette-bosscut |
| site web garage mécanique Montréal | /projets/maquette-garage-city-line |
| site web restaurant / traiteur Montréal | /projets/maquette-plaisirs-gourmets |
| site web salon d’ongles Montréal | /projets/maquette-mtlnails |
| site web massothérapeute / spa Montréal | /projets/maquette-masso-tomizawa |
| site web photographe | /projets/maquette-lily-photo |
| boutique en ligne pièces auto | /projets/autorefaatart |

### C. Informationnel (contenu futur, priorité moyenne)

- combien coûte un site web pour un commerce (Québec)
- site web ou page Facebook pour un petit commerce
- comment apparaître sur Google Maps (fiche Google Business)

### D. Maroc (priorité à confirmer)

| Expression (hypothèse) | Commentaire |
|---|---|
| création site web Maroc | très concurrentiel, marché en français et en arabe |
| développeur web freelance Maroc | plus réaliste |
| création site web [ville] | **à n’utiliser que si Adam sert réellement cette ville** |

Aujourd’hui le site mentionne le Maroc dans le titre de l’accueil et de nombreux textes. Une page dédiée au Maroc
ne serait légitime qu’avec du contenu réel : réalisations marocaines, mode de paiement, fonctionnement à distance.
Sans cela, ce serait une page satellite.

## 3. Correspondance page → mot-clé (sans cannibalisation)

| Page | Mot-clé principal | Mots-clés secondaires | Intention | Marché | Priorité |
|---|---|---|---|---|---|
| `/` | création de sites web Montréal | site web commerce, site web abordable, maquette gratuite, Maroc | transactionnelle | Montréal + Maroc | Haute |
| `/services` | prix site web commerce | site vitrine, boutique en ligne, entretien de site, à partir de 600 $ | transactionnelle (comparaison) | Montréal | Haute |
| `/projets` | exemples de sites web pour commerces | portfolio développeur web, maquettes | investigation | Montréal | Moyenne |
| `/projets/[slug]` | site web + métier (ex. « site web salon de coiffure ») | nom du projet, catégorie | investigation / longue traîne | Montréal | Moyenne |
| `/contact` | maquette de site web gratuite | devis site web, WhatsApp | transactionnelle | Montréal + Maroc | Haute |
| `/a-propos` | développeur web freelance Montréal | Adam Lakhal, Cégep du Vieux Montréal | navigationnelle / confiance | Montréal | Moyenne |
| `/avis` | avis clients Lakauraa | — | confiance | — | Basse (indexée seulement si des avis existent) |
| pages légales | — (pas de ciblage) | — | — | — | — |

**Règle anti-cannibalisation :**
- l’accueil vise l’expression générale ;
- `/services` vise le prix et la comparaison ;
- chaque projet vise un **métier différent**.

Deux projets du même métier se feraient concurrence. Dans ce cas, il vaut mieux n’en garder qu’un seul indexable,
ou leur donner des angles différents.

## 4. Ce qui a été appliqué dans le code

Seulement des **métadonnées**. Aucun texte visible n’a été modifié.

- Accueil : titre « Création de sites web à Montréal et au Maroc · Lakauraa », plus une description propre à la
  page (avant, la description générique du site était utilisée).
- Services : titre raccourci à « Services et prix d’un site web pour commerce · Lakauraa » (moins de 65 caractères).
- Réalisations : titre « Réalisations · Sites web et maquettes pour commerces ».
- Pages de projets : titre = nom du projet + catégorie, et description = résumé du projet coupé proprement à
  158 caractères.
- Pages légales : descriptions uniques et descriptives (elles étaient trop courtes).

## 5. Manques de contenu identifiés

Ce sont des propositions. **Rien n’a été rédigé sans accord.**

1. **Résumés des projets orientés « métier + ville ».** Exemple : « Site web pour un salon de coiffure à Montréal :
   … ». C’est le levier le plus simple, et il se fait dans l’admin, sans code.
2. **Texte alternatif des images des projets.** Il est aujourd’hui générique (« Aperçu du site X »). On peut le
   compléter par la légende de chaque image dans l’admin.
3. **Une section « Combien coûte un site ? » sur /services.** Elle répondrait à l’intention informationnelle
   n° 1, sans donner d’autre montant que « à partir de 600 $ ».
4. **Une page Maroc**, seulement avec du contenu réel (voir § 2-D).

## 6. Nouvelles pages possibles (à valider)

| Page proposée | Condition | Priorité |
|---|---|---|
| `/sites-web/salons-de-coiffure` (et autres métiers) | seulement avec au moins une vraie réalisation du métier et un contenu propre, pas un gabarit dupliqué | Moyenne |
| `/developpement-application-web` | seulement si Adam propose réellement ce service | Basse |
| Guide « Site web ou page Facebook ? » | contenu original écrit avec Adam | Basse |

## 7. Comment confirmer cette stratégie

1. Connecter Google Search Console (voir `SEO_AUDIT_REPORT.md`, § 10).
2. Après 6 à 8 semaines, exporter les requêtes : impressions, clics, position.
3. Remplacer les hypothèses de ce document par les requêtes réelles et réaffecter les pages si nécessaire.
