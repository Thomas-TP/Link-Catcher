# Plan d'amélioration — Link Catcher

## Fait dans la v1.3
- **Permissions** : suppression de `host_permissions: <all_urls>` (inutile, testé : la redirection marche sans). Il reste `storage` et `webNavigation`.
- **Filtre de navigation** : le listener ne se déclenche plus que sur les moteurs supportés.
- **Domaines stricts** : `evilgoogle.com` ou `google.evil.com` ne sont plus interceptés.
- **Sécurité popup** : mots-clés et URL affichés via `textContent` (plus d'injection HTML par import JSON).
- **Clés sûres** : `constructor`, `toString`, etc. ne sont plus traités comme des raccourcis.
- **Vie privée** : suppression du chargement de Google Fonts (appel réseau externe).
- **Traduction** : « Mettre à » devenu « Mettre à jour ».
- **Dépendances** : aucune (pas de npm, JavaScript natif).

## Priorité haute (avant la publication Edge)
1. **Quota `storage.sync`** : tous les raccourcis sont dans une seule clé, limitée à 8 Ko (environ 100 liens). Stocker un raccourci par clé, ou basculer sur `storage.local` avec option de sync. Gérer `chrome.runtime.lastError` et afficher une erreur.
2. **Icône** : `icon.png` fait 650×650 et 450 Ko. Fournir des icônes 16/32/48/128 optimisées (environ 5 Ko chacune).
3. **Fiche des stores** : ajouter `_locales/` (fr, en, es, de) avec `default_locale`, `__MSG_name__` et `__MSG_description__`. Une description de 250 caractères minimum, un logo 300×300, des captures 1280×800.
4. **Politique de confidentialité** : publier une page (par exemple GitHub Pages) pour les deux stores. Le texte peut tenir en 3 lignes : aucune donnée collectée, stockage local ou sync navigateur uniquement.
5. **Justification des permissions** : `webNavigation` pour détecter une recherche et rediriger ; `storage` pour sauvegarder les raccourcis.
6. **Zip du dépôt** : `Link_Catcher.zip` est obsolète et versionné. Le générer en CI (release GitHub) et le retirer du dépôt.

## Priorité moyenne
7. **Correspondance** : insensible à la casse et aux accents, avec option de désactivation. Aujourd'hui `Proj` ne matche pas `proj`.
8. **Moteur de repli de l'omnibox** : toujours Google. Utiliser l'API `search` (permission ajoutée) ou un réglage pour Bing/DuckDuckGo, utile côté Edge.
9. **Suggestions omnibox** : `omnibox.onInputChanged` pour proposer les raccourcis pendant la frappe.
10. **Moteurs supplémentaires** : Brave, Startpage, Qwant, Kagi, Edge `bing.com/search` avec `form=`. Rendre la liste configurable.
11. **Validation d'URL** : utiliser `new URL()` et refuser les schémas autres que http(s) dès la saisie. Aujourd'hui, une URL sans schéma reçoit `https://` sans autre contrôle.
12. **Doublons à l'import** : l'import écrase silencieusement. Proposer fusionner ou remplacer, avec un récapitulatif.
13. **Accessibilité** : les boutons-icônes ont besoin d'`aria-label`. Gérer la navigation clavier du select personnalisé et la touche Échap des overlays. Ajouter un focus visible.

## Priorité basse / qualité
14. **Code** : i18n et sélecteurs dans `popup.js` (460 lignes) à séparer en modules. Remplacer les `innerHTML` restants par des templates sûrs.
15. **Tests** : script Playwright de redirection (comme celui utilisé pour valider la v1.3) en CI GitHub Actions. Ajouter un lint (ESLint) et `web-ext lint`.
16. **Release automatisée** : workflow GitHub Actions qui zippe l'extension. Puis publication via Chrome Web Store API et Edge Publish API.
17. **README** : mentionner Edge, ajouter des captures d'écran, remplacer « extension Google Chrome » par « Chrome / Edge », corriger le lien du store dès la publication.
18. **Fonctionnalités** : raccourcis avec dossiers ou tags, compteur d'usage, raccourci clavier `commands` pour ouvrir le popup, alias multiples pour une même URL, favicon dans la liste (attention : chaque favicon demande un appel externe).
19. **Firefox** : `browser_specific_settings` et `background.scripts`, car Firefox MV3 ne gère pas encore `service_worker` de la même façon.
