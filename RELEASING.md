# Publier une version

1. Mettre à jour `version` dans `manifest.json` et `package.json`.
2. `npm run lint && npm test` (nécessite Chromium ; `CHROMIUM_PATH=...` pour un binaire précis).
3. `npm run build` → `dist/link-catcher-<version>.zip` (uniquement les fichiers de l'extension).
4. `git tag vX.Y.Z && git push --tags` → la release GitHub est créée avec le zip. Sans accès au push de tags : Actions → *Release* → *Run workflow* avec `release_tag` = `vX.Y.Z`.
5. Déposer le zip :
   - **Edge** : Partner Center → extension → Packages → uploader le zip → Publish (voir `STORE_LISTING.md`).
   - **Chrome** : Chrome Web Store Developer Dashboard → Package → Upload new package.

## Publication automatique du package (optionnelle, non testée)

**Limites imposées par les stores (documentation officielle) :**
- Chrome : l'API ne peut **pas créer** un élément ni modifier la fiche ; elle téléverse un nouveau package et le publie.
- Edge : la **première soumission** se fait dans Partner Center ; ensuite l'API téléverse et publie, mais ne modifie pas les métadonnées (description, captures…).

Le workflow *Release* (déclenchement manuel, cases « publish_chrome » / « publish_edge ») utilise ces secrets de dépôt (*Settings → Secrets and variables → Actions*) :

| Store | Secrets | Où les obtenir |
| --- | --- | --- |
| Chrome Web Store (API v2) | `CHROME_PUBLISHER_ID`, `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN` | Publisher ID : tableau de bord → Compte/Publisher → Settings ; ID de l'extension : onglet Package ; client OAuth « Web application » créé dans Google Cloud (API *Chrome Web Store API* activée, redirection `https://developers.google.com/oauthplayground`), refresh token obtenu via l'OAuth Playground avec le scope `https://www.googleapis.com/auth/chromewebstore`. Validation en deux étapes obligatoire. |
| Edge Add-ons (API v1.1) | `EDGE_PRODUCT_ID`, `EDGE_CLIENT_ID`, `EDGE_API_KEY` | Partner Center → Microsoft Edge → *Publish API* → *Enable* (nouvelle expérience) → *Create API credentials*. ID produit : page de l'extension. Les clés ont une date d'expiration. |

Ne colle jamais ces valeurs dans une conversation, une issue ou un fichier du dépôt.
Ces deux jobs n'ont pas pu être exécutés sans identifiants : essaie-les d'abord sur une version de test.

## Contrôle des fiches
`node scripts/check-listing.js` vérifie les descriptions (pas de marques, aucun mot répété plus de 5 fois), conformément à la politique du Chrome Web Store.

## Visuels et vidéos
`npm run assets` régénère captures et tuiles (4 langues) ; `npm run video` régénère les vidéos (`ffmpeg` requis pour le .mp4). Voir `STORE_LISTING.md`.
