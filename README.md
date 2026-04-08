<div align="center">
  <img src="icon.png" alt="Link Catcher Logo" width="128" />
  <h1>Link Catcher</h1>
  <p>Vos liens instantanés à portée de clavier. Naviguez à la vitesse de la lumière !</p>
</div>

## 📖 À Propos

**Link Catcher** est une extension Google Chrome moderne et légère qui vous permet d'associer des mots-clés spécifiques à vos URL personnalisées. Lorsque vous tapez ces mots-clés dans la barre de recherche de votre navigateur (Google, Bing, Yahoo, DuckDuckGo, Ecosia), l'extension intercepte instantanément la requête et vous redirige vers la page souhaitée avant même le chargement des résultats.

Dites adieu aux favoris interminables pour vos sites du quotidien !

## ✨ Fonctionnalités

- ⚡ **Redirection Instantanée** : Interception transparente des recherches et compatibilité Omnibox (Tapez `l` + `Espace`).
- 🎨 **Interface Premium** : Design "Glassmorphism" robuste, superbes animations et listes personnalisées.
- 🗂️ **Organisation Drag & Drop** : Triez vos raccourcis manuellement avec un comportement fluide "façon smartphone".
- 🌗 **Thèmes Clair / Sombre** : Moteur de thème dynamique.
- 🌐 **Multilingue** : 100% localisé en Français, Anglais, Espagnol et Allemand.
- 💾 **Sauvegarde Portative** : Exportez et testez l'importation de vos listes via Drag & Drop au format JSON.
- 🔒 **Privacy First** : Fonctionne entièrement en local. Aucune donnée personnelle récoltée ni envoyée.

## 🚀 Installation

### Depuis le Chrome Web Store
*(Lien officiel à venir très prochainement)*

### Installation Locale (Mode Développeur)
1. Clonez ce dépôt ou téléchargez-le au format ZIP.
2. Ouvrez Google Chrome et allez sur `chrome://extensions/`.
3. Cochez la case **Mode développeur** en haut à droite.
4. Cliquez sur le bouton **Charger l'extension non empaquetée** et sélectionnez ce dossier (celui contenant `manifest.json`).
5. L'extension est prête à être utilisée !

## 🛠️ Comment l'utiliser ?

1. Cliquez sur l'icône Link Catcher dans la barre d'outils Chrome.
2. Allez dans l'onglet **Nouveau**.
3. Renseignez un mot-clé précis (ex: `git`).
4. Spécifiez l'URL de votre choix (ex: `https://github.com/`).
5. Ouvrez un nouvel onglet, tapez `git` dans Google, appuyez sur Entrée, vous êtes téléporté !

## ⚙️ Technologies

- **Manifest V3**
- Vanilla JavaScript, HTML5 & CSS3 (Aucune bibliothèque tierce, 100% natif pour une performance maximale).
- API `chrome.storage.sync` pour la synchronisation entre profils Chrome.
- API `chrome.webNavigation` pour l'interception hyper-rapide.

## 🤝 Contribution

Les contributions, signalements de bugs et suggestions sont les bienvenues ! N'hésitez pas à ouvrir une *Issue* ou proposer une *Pull Request*.
