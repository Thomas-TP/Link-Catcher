# Améliorations — état d'avancement

## Réalisé (v1.3 → v1.4)
- **Permissions** : `host_permissions: <all_urls>` supprimé (reste `storage` + `webNavigation`, listener filtré sur les moteurs).
- **Stockage** : un raccourci par clé `storage.sync` (fin de la limite de ~100 liens), migration automatique de l'ancien format, erreurs de quota affichées.
- **Sécurité** : plus d'injection HTML (`textContent`), clés de prototype ignorées, validation `new URL()` http(s) uniquement, domaines stricts (le test a aussi révélé et corrigé `google.evil.com`).
- **Vie privée** : plus de Google Fonts ; `PRIVACY.md` publié.
- **Correspondance** insensible à la casse et aux accents.
- **Omnibox** : suggestions en direct, ouverture selon la touche utilisée (onglet courant/nouveau), moteur de repli configurable (8 moteurs).
- **Moteurs détectés** : Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Startpage, Qwant, Kagi.
- **Import** : gestion des conflits (garder / remplacer), entrées invalides ignorées, taille limitée, résumé.
- **UI** : recherche dans la liste, alias (`docs, d`), compteur d'utilisation local, raccourci `Alt+Maj+L`.
- **Accessibilité** : `aria-label`, rôles, sélecteurs au clavier, Échap, focus visible, `prefers-reduced-motion`.
- **Code** : traductions dans `i18n.js`, logique partagée dans `shared.js`; traductions ES/DE complétées.
- **Stores** : icônes 16/32/48/128 optimisées, `_locales` (4 langues), logo 300×300, 4 captures 1280×800, `STORE_LISTING.md`.
- **Outillage** : ESLint, test e2e Playwright (24 vérifications), build zip, CI GitHub Actions, workflow de release, `Link_Catcher.zip` retiré du dépôt.

## Non fait (volontairement)
- **Firefox** : demande un `background.scripts` et un identifiant `browser_specific_settings`, non testables ici.
- **Dossiers / tags, favicons** : les favicons exigent un appel réseau par site (contraire à « aucune donnée envoyée »).
- **Option pour désactiver l'insensibilité à la casse** : jugée inutile (deux mots qui ne diffèrent que par la casse ne sont plus possibles).
- **Publication automatique sur les stores** : écrite dans `release.yml` mais **non exécutée** (il faut des identifiants).
- **Liste de moteurs éditable** par l'utilisateur : la liste est fixe dans `shared.js`.
- **Réorganisation au clavier** (le glisser-déposer reste à la souris).
- **Test de l'omnibox** : l'API n'est pas pilotable en automatique ; seules les fonctions sous-jacentes sont testées.

## Idées futures
- Réordonner au clavier, tags, import depuis les favoris du navigateur, page d'options plein écran.
