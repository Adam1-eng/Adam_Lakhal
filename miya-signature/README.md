# Miya signature : site vitrine (maquette)

Site statique [Astro](https://astro.build) pour Miya, Lash Master & Formatrice à Laval.

- **Source de vérité unique :** `src/config/miya.ts` (identité, prix, durées, politique, formations, styles, boutique, légal).
- **Statut maquette :** `status.demo = true` → bandeau « Maquette de démonstration », `noindex`, `robots.txt` bloquant.
- **Infos manquantes :** voir `INFOS-MANQUANTES.md`.

## Commandes

```bash
npm install
npm run dev      # aperçu local http://localhost:4321
npm run build    # génère dist/
npm test         # build + toutes les vérifications
```

## Ce que vérifie `npm test`

Contenu (aucun texte de remplissage, bandeau présent, un seul H1), politique reproduite mot pour mot (résumés compris),
prix et durées identiques à la config, boutons Réserver → Acuity et précédés du résumé de politique, SEO (titres et
descriptions uniques, canonical, Open Graph, JSON-LD sans infos inventées, sitemap, robots), liens internes et ancres,
accessibilité axe WCAG 2.1 AA (390 et 1440 px), aucun débordement à 360/390/768/1440 px, aucune requête externe,
menu mobile, `prefers-reduced-motion`.
