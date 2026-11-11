<div align="center">
  <img src="icons/icon128.png" alt="Link Catcher Logo" width="128" />
  <h1>Link Catcher</h1>
  <p>Vos liens instantanés à portée de clavier. Naviguez à la vitesse de la lumière !</p>
</div>

## 📖 À Propos

**Link Catcher** est une extension moderne pour Chrome et Edge et légère qui vous permet d'associer des mots-clés spécifiques à vos URL personnalisées. Lorsque vous tapez ces mots-clés dans la barre de recherche de votre navigateur (Google, Bing, Yahoo, DuckDuckGo, Ecosia), l'extension intercepte instantanément la requête et vous redirige vers la page souhaitée avant même le chargement des résultats.

Dites adieu aux favoris interminables pour vos sites du quotidien !

## ✨ Fonctionnalités

- ⚡ **Redirection instantanée** sur un mot exact (insensible à la casse et aux accents) depuis Google, Bing, DuckDuckGo, Yahoo, Ecosia, Brave, Startpage, Qwant et Kagi.
- 🔎 **Omnibox** : tapez `l` + `Espace` + mot-clé, avec suggestions en direct. Le moteur utilisé pour un mot inconnu est configurable.
- 🏷️ **Alias** : `docs, d` crée deux mots-clés vers le même lien.
- 🔍 **Recherche, tri A-Z / Z-A, vue liste ou grille**, ordre manuel par glisser-déposer, compteur d'utilisation local.
- 💾 **Import / export JSON** avec gestion des conflits.
- 🌗 **Thèmes clair / sombre** et 🌐 **4 langues** (FR, EN, ES, DE).
- ⌨️ **Raccourci clavier** `Alt+Maj+L` pour ouvrir le gestionnaire, interface accessible au clavier.
- 🔒 **Privacy first** : aucune donnée collectée ni envoyée, aucune ressource externe, aucune permission d'hôte. Voir [PRIVACY.md](PRIVACY.md).

## 🚀 Installation

### Depuis les stores
- **Chrome Web Store** : disponible.
- **Microsoft Edge Add-ons** : publication en cours (voir [STORE_LISTING.md](STORE_LISTING.md)).

### Installation locale (mode développeur)
1. Clonez ce dépôt ou téléchargez-le au format ZIP.
2. Ouvrez `chrome://extensions/` (Chrome) ou `edge://extensions/` (Edge) et activez le **Mode développeur**.
3. Cliquez sur **Charger l'extension non empaquetée** et sélectionnez ce dossier (celui contenant `manifest.json`).

## 🛠️ Comment l'utiliser ?

1. Cliquez sur l'icône Link Catcher (ou `Alt+Maj+L`).
2. Onglet **Nouveau** : saisissez un mot-clé (ex : `git`) et une URL (ex : `github.com`).
3. Dans Google, Bing, etc., recherchez exactement `git` : vous êtes redirigé. Ou tapez `l`, `Espace`, `git` dans la barre d'adresse.

## ⚙️ Technologies

- **Manifest V3**, JavaScript / HTML / CSS natifs : **aucune dépendance** dans l'extension.
- Permissions : `storage` (raccourcis, un par clé `storage.sync`) et `webNavigation` (détection d'une recherche, filtrée sur les moteurs supportés).

## 👩‍💻 Développement

```bash
npm install          # outils de dev uniquement (ESLint, Playwright)
npm run lint
npm test             # charge l'extension dans Chromium (CHROMIUM_PATH=... si besoin)
npm run build        # dist/link-catcher-<version>.zip
node scripts/screenshots.js   # visuels des stores
```

Publication : voir [RELEASING.md](RELEASING.md). Pistes d'évolution : [IMPROVEMENTS.md](IMPROVEMENTS.md).

## 🤝 Contribution

Les contributions, signalements de bugs et suggestions sont les bienvenues ! N'hésitez pas à ouvrir une *Issue* ou proposer une *Pull Request*.
