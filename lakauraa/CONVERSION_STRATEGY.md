# Stratégie de conversion — Lakauraa

_16 novembre 2026._

## 1. Parcours client actuel

1. **Arrivée** : surtout l’accueil, ou une page de projet partagée sur WhatsApp ou les réseaux.
2. **Compréhension** : hero (promesse + maquette gratuite + « à partir de 600 $ »), problèmes, services, preuves
   (réalisations, avis quand il y en aura).
3. **Confiance** :
   - réalisations réelles (AutoRefaatArt en ligne, Élan Coiffure, maquettes clairement étiquetées « Maquette ») ;
   - processus en étapes, FAQ ;
   - pages légales, À propos.
4. **Contact**, par 5 canaux : WhatsApp (Maroc ou Canada), appel, texto, courriel, formulaire guidé qui prépare le
   message.

**Points forts déjà présents :**
- appel à l’action principal unique et répété (« Obtenir ma maquette gratuite » / « Maquette gratuite ») ;
- bouton WhatsApp flottant ;
- maquette gratuite avant paiement, qui lève le principal frein ;
- prix d’entrée affiché ;
- message WhatsApp prérempli selon la page (ex. « j’ai vu le projet X »).

## 2. WhatsApp

**Vérifié dans un vrai navigateur :**
- les deux numéros sont proposés : Maroc `+212 621 971 718` et Canada `438-528-0259` ✅ ;
- le pays est deviné **seulement pour recommander** un numéro (fuseau horaire, puis IP). Le visiteur choisit
  toujours lui-même, et son choix est mémorisé ✅ ;
- liens `https://wa.me/<numéro>?text=…` corrects, message prérempli encodé ✅ ;
- un seul numéro configuré → ouverture directe ✅.

**Note sur l’étape 20 du cahier des charges :** le site ne demande pas le numéro du client, donc pas de
validation de format international à faire côté WhatsApp. Le formulaire de contact valide déjà « 10 chiffres ou
un courriel ».

## 3. Formulaire

- 3 champs obligatoires seulement (commerce, nom, téléphone ou courriel) ✅
- **Aucune donnée n’est envoyée à un serveur** : le message est préparé, puis envoyé par le visiteur depuis
  WhatsApp, son courriel ou ses textos. Aucune demande ne peut donc se « perdre » côté serveur, et aucune donnée
  personnelle n’est stockée ✅
- L’écran final dit « Votre demande est prête », jamais « envoyée » ✅
- Pas d’anti-spam nécessaire : il n’y a rien à recevoir côté serveur.
- **Limite honnête :** on ne peut pas savoir si le visiteur a appuyé sur « Envoyer » dans son application.

## 4. Mesure des conversions (mise en place)

### Choix technique

Google Analytics 4 dépose des cookies et identifie les visiteurs. Au Québec (Loi 25), il faudrait donc un bandeau
de consentement, et la politique actuelle promet « aucun outil de pistage ». J’ai plutôt construit un **compteur
interne, anonyme et agrégé** :

- une ligne par **jour × action × page**, avec un nombre, et rien d’autre ;
- **pas** de cookie, **pas** d’IP, **pas** d’identifiant, **pas** de contenu de message ;
- si le navigateur envoie **Global Privacy Control**, rien n’est compté ;
- point d’entrée `/api/evt` : accepte seulement les actions et pages connues, venant du site lui-même (403 sinon) ;
  11 tests de sécurité.

### Événements mesurés

| Événement | Déclencheur |
|---|---|
| `whatsapp_ma` / `whatsapp_ca` | ouverture de WhatsApp vers le numéro marocain ou canadien |
| `call` | clic sur un lien `tel:` |
| `sms` | clic sur un lien `sms:` |
| `email` | clic sur un lien `mailto:` |
| `cta_contact` | clic vers la page Contact depuis une autre page |
| `form_ready` | formulaire validé, message préparé |

Les doublons ont été vérifiés : un clic donne un seul événement (testé).

### Où voir les chiffres

**Admin → Vue d’ensemble → « Contacts · 30 derniers jours »** :
- total par action ;
- pages d’où partent le plus de contacts.

### Comment les lire

| Ce que tu vois | Ce que ça veut dire |
|---|---|
| Clics WhatsApp, appel, texto, courriel | **intention** de contact, pas un contact reçu |
| Messages réellement reçus | à compter toi-même (WhatsApp, courriel) |
| **Taux de concrétisation** | messages reçus ÷ clics de contact |
| Clients signés | à noter à part ; un clic n’est jamais une vente |

**Suivi conseillé (5 min par semaine) :**
1. noter dans un tableau les messages reçus et leur source (« vu sur le site ? ») ;
2. comparer avec les clics du tableau de bord ;
3. regarder quelles pages génèrent le plus de contacts, et mettre en avant les projets correspondants.

### Limites

- Les chiffres peuvent être légèrement gonflés : rien n’empêche quelqu’un d’appeler le compteur volontairement,
  et ce n’est pas un outil comptable.
- Pas de nombre de visiteurs. Pour cela, option sans cookie : **Vercel Web Analytics**, à activer dans le tableau
  de bord Vercel (une case). Les événements personnalisés y demandent une offre payante.
- Si un jour GA4 est souhaité : il faudra un bandeau de consentement (Loi 25) et une mise à jour de la politique de
  confidentialité. **Non fait.**

## 5. Propositions d’amélioration

À valider, rien n’est appliqué.

| Proposition | Impact attendu | Effort |
|---|---|---|
| Ajouter « Réponse en moins de 24 h » sous le bouton principal du hero | rassurance au moment du clic | Faible |
| Sur chaque page de projet, CTA « Je veux un site comme celui-ci » avec WhatsApp prérempli (le message prérempli existe déjà ; c’est le bouton qui serait plus visible) | plus de contacts depuis le portfolio | Faible |
| Envoyer les liens d’avis aux premiers clients, puis afficher la note dans le hero (déjà prévu, automatique) | preuve sociale | Faible (côté Adam) |
| Fiche Google Business Profile + avis Google | visibilité locale et étoiles dans Google | Moyen (côté Adam) |
| Page « Combien coûte un site web ? » | capter les recherches de prix | Moyen (contenu) |
