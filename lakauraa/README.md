# Lakauraa — site web (v2)

Site de Lakauraa (Adam Lakhal) : sites web pour commerces locaux à Montréal.

## Technologies
- [Astro](https://astro.build) + TypeScript (site statique, très rapide, bon pour le SEO)
- CSS maison (design tokens dans `src/styles/global.css`), polices Inter et Space Grotesk auto-hébergées
- Transitions entre pages (View Transitions), animations au défilement, respect de `prefers-reduced-motion`

## Commandes
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # vérifie TypeScript puis génère dist/
npm run preview
```

## Où modifier quoi
| À changer | Fichier |
|---|---|
| Téléphone, courriel, délais, textes de la FAQ, forfaits, engagements | `src/data/site.ts` |
| Projets (AutoRefaatArt, Élan Coiffure) et maquettes affichées | `src/data/projets.ts` |
| Captures d’écran | `src/assets/projets/`, `src/assets/maquettes/` |
| **Avis clients** (seulement de vrais avis) | `testimonials` dans `src/data/site.ts` — la section s’affiche automatiquement dès qu’il y en a un |
| Couleurs, typo, boutons, cartes | `src/styles/global.css` |
| Interactions (menu, filtres, compteurs, FAQ…) | `src/scripts/interactions.ts` |

## Pages
`/` accueil · `/services` · `/projets` · `/projets/autorefaatart` · `/projets/elan-coiffure` · `/a-propos` · `/contact` · `/exemples/salon/index.html` (exemple conservé de la v1)

## Formulaire de contact
Sans serveur : le formulaire valide les champs, puis prépare la demande et l’ouvre déjà rédigée dans l’application de courriel ou de texto du visiteur (vers 438-528-0259 / adamlakhal800@gmail.com).
Pour recevoir les demandes automatiquement sans action du visiteur, on peut brancher plus tard un service d’envoi (ex. une fonction Vercel + un fournisseur de courriel).

## Déploiement (Vercel)
Projet Vercel `lakauraa` : framework **Astro**, commande `npm run build`, dossier `dist`.
