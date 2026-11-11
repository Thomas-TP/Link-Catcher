# Fiche pour les stores (Chrome Web Store & Microsoft Edge Add-ons)

Textes prêts à copier-coller. Visuels : `store-assets/` (logo 300×300 + 4 captures 1280×800).
Package : `npm run build` → `dist/link-catcher-<version>.zip`.

## Description détaillée — English (≥ 250 caractères exigés)

Link Catcher turns your search bar into a launcher for the sites you visit every day.

Save a keyword and a URL (for example "gh" → github.com). Then type that keyword in Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Startpage, Qwant or Kagi — or type "l" + Space + keyword in the address bar — and you are taken straight to your page before the results even load.

Features
• Instant redirection on an exact keyword (case and accent insensitive)
• Omnibox support with live suggestions: type "l", Space, then a few letters
• Aliases: write "docs, d" to create two keywords for the same link
• Search, sort (A-Z / Z-A), list or grid view, drag & drop manual ordering
• Import / export JSON backups with conflict handling
• Light and dark themes; English, Français, Español, Deutsch
• Keyboard shortcut Alt+Shift+L to open the manager
• Choice of the search engine used when a keyword is unknown

Privacy first: no account, no analytics, no tracking, no remote code. Your shortcuts stay in your browser (synced by your browser if you enable sync). See PRIVACY.md.

## Description détaillée — Français

Link Catcher transforme votre barre de recherche en lanceur pour les sites que vous visitez chaque jour.

Enregistrez un mot-clé et une URL (par exemple « gh » → github.com). Tapez ensuite ce mot dans Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Startpage, Qwant ou Kagi — ou « l » + Espace + mot dans la barre d'adresse — et vous arrivez directement sur votre page, avant même le chargement des résultats.

Fonctionnalités
• Redirection instantanée sur un mot exact (insensible à la casse et aux accents)
• Omnibox avec suggestions en direct : « l », Espace, puis quelques lettres
• Alias : écrivez « docs, d » pour créer deux mots-clés vers le même lien
• Recherche, tri (A-Z / Z-A), vue liste ou grille, ordre manuel par glisser-déposer
• Import / export JSON avec gestion des conflits
• Thèmes clair et sombre ; English, Français, Español, Deutsch
• Raccourci clavier Alt+Maj+L pour ouvrir le gestionnaire
• Choix du moteur utilisé quand un mot est inconnu

Respect de la vie privée : pas de compte, pas d'analyse, pas de suivi, pas de code distant. Vos raccourcis restent dans votre navigateur (synchronisés par celui-ci si vous activez la synchronisation).

## Catégorie
Productivity / Productivité

## Termes de recherche (Edge : 7 max, 30 car. chacun, 21 mots au total)
shortcuts, bookmarks, keywords, quick links, omnibox, launcher, redirect

## Objectif unique (Single purpose)
Rediriger instantanément vers un lien enregistré lorsque l'utilisateur tape un mot-clé exact dans la barre de recherche ou l'omnibox.

## Justification des permissions
- **storage** : enregistre les raccourcis (mot-clé → URL) et les préférences de l'utilisateur dans le stockage du navigateur. Rien n'est envoyé à un serveur.
- **webNavigation** : détecte, localement, qu'une navigation principale est une recherche sur un moteur supporté (Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Startpage, Qwant, Kagi) afin de la comparer aux mots-clés de l'utilisateur et de rediriger l'onglet. Le listener est filtré sur ces seuls domaines ; aucun historique n'est enregistré.
- Aucune permission d'hôte (`host_permissions`), aucun accès au contenu des pages, aucun code distant.

## Données collectées
Aucune (cocher « aucune donnée utilisateur collectée »).
URL de la politique de confidentialité : https://github.com/Thomas-TP/Link-Catcher/blob/main/PRIVACY.md

## Notes pour la certification (Edge) / Test instructions
1. Ouvrir le popup, onglet « Nouveau », saisir le mot-clé `gh` et l'URL `https://github.com/`, valider.
2. Ouvrir un nouvel onglet, aller sur google.com ou bing.com, rechercher exactement `gh` : l'onglet est redirigé vers github.com.
3. Dans la barre d'adresse, taper `l`, Espace, `gh`, Entrée : même résultat (des suggestions apparaissent pendant la frappe).
4. Aucun compte ni identifiant n'est nécessaire.
