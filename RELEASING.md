# Publier une version

1. Mettre à jour `version` dans `manifest.json` et `package.json`.
2. `npm run lint && npm test` (nécessite Chromium ; `CHROMIUM_PATH=...` pour un binaire précis).
3. `npm run build` → `dist/link-catcher-<version>.zip` (uniquement les fichiers de l'extension).
4. `git tag vX.Y.Z && git push --tags` → la release GitHub est créée avec le zip.
5. Déposer le zip :
   - **Edge** : Partner Center → extension → Packages → uploader le zip → Publish (voir `STORE_LISTING.md`).
   - **Chrome** : Chrome Web Store Developer Dashboard → Package → Upload new package.

## Publication automatique (optionnelle, non testée)
La première soumission sur chaque store doit être manuelle. Ensuite, le workflow *Release* (déclenchement manuel) peut publier avec ces secrets de dépôt :

| Store | Secrets |
| --- | --- |
| Chrome Web Store | `CHROME_EXTENSION_ID`, `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN` |
| Edge Add-ons | `EDGE_PRODUCT_ID`, `EDGE_CLIENT_ID`, `EDGE_API_KEY` (Partner Center → Publish API) |

Ces deux jobs n'ont pas pu être exécutés sans identifiants : vérifiez-les sur une version de test avant de vous y fier.

## Visuels
`node scripts/screenshots.js` régénère les captures 1280×800 dans `store-assets/screenshots/`.
