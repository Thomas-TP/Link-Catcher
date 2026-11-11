# Fiches Chrome Web Store & Microsoft Edge Add-ons

Tout ce qu'il faut coller ou glisser est prêt, **par langue**, dans `store-assets/<langue>/` (en, fr, es, de) :

| Fichier | Contenu |
| --- | --- |
| `listing.md` | nom, description courte, **description détaillée**, termes de recherche Edge, titre/description/étiquettes YouTube |
| `screenshots/1.png … 5.png` | 5 captures 1280×800, textes dans la langue |
| `promo-small-440x280.png` | petite tuile promo |
| `promo-marquee-1400x560.png` | grande tuile promo |
| `video/link-catcher-demo-<langue>.mp4` | vidéo de démo 27 s, 1280×720, sous-titrée (à téléverser sur YouTube) |

Logos : `store-assets/logo-300.png` (Edge, 300×300) et `icons/icon128.png` (Chrome, 128×128).
Régénération : `node scripts/store-assets.js` (images) et `node scripts/video.js` (vidéos).

> Les APIs des deux stores ne permettent **pas** de modifier la fiche (descriptions, captures, vidéos) : seule l'importation/publication du package est automatisable. La fiche se remplit dans les tableaux de bord.

## Règle anti-spam des descriptions (refus Chrome)
Google refuse les fiches qui listent des marques/sites « sans valeur ajoutée » ou répètent un même mot plus de 5 fois. Les descriptions de `store-assets/<langue>/listing.md` ne nomment donc **aucun moteur de recherche** et varient le vocabulaire. `node scripts/check-listing.js` (lancé en CI) le vérifie. Ne rajoute pas de liste de moteurs, de langues ou de mots-clés dans la fiche, la vidéo ou les captures.

## Chrome Web Store — onglet « Fiche Play Store »
1. **Langue d'édition actuelle** : commence par `anglais (par défaut)`. Colle la description de `en/listing.md`.
2. **Éléments graphiques internationaux** (utilisés quand aucune version localisée n'existe) : `en/screenshots/1-5.png`, vidéo YouTube anglaise.
3. **Petite image promotionnelle** : `en/promo-small-440x280.png` — **Image promotionnelle en haut de la page** : `en/promo-marquee-1400x560.png`. Les tuiles ne sont pas localisables.
4. Ajoute chaque autre langue (`Langue d'édition actuelle` → ajouter une langue : français, espagnol, allemand). Pour chacune :
   - colle la description de `<langue>/listing.md` ;
   - **Éléments localisés → Captures d'écran localisées** : `<langue>/screenshots/1-5.png` ;
   - **Vidéo promotionnelle localisée** : l'URL YouTube de la vidéo de cette langue.
5. Catégorie : Productivité / Outils (tu as déjà « Outils »). URL de la page d'accueil et d'assistance : le dépôt GitHub.
6. Onglet **Confidentialité** (déjà rempli) : voir « Textes réglementaires » ci-dessous.
7. **Envoyer pour examen**.

## Microsoft Edge Add-ons — Partner Center
Étape *Store listings* : ajoute une langue par ligne (en, fr, es, de ; elles apparaissent si le manifeste utilise `_locales`, c'est le cas). Pour chaque langue :
- **Description** : `<langue>/listing.md` (250–10 000 caractères) ; **Search terms** : la ligne « Termes de recherche ».
- **Extension logo** : `store-assets/logo-300.png` (« Duplicate » pour toutes les langues).
- **Small promotional tile** : `<langue>/promo-small-440x280.png` ; **Large promotional tile** : `<langue>/promo-marquee-1400x560.png`.
- **Screenshots** (6 maximum) : `<langue>/screenshots/1-5.png`.
- **YouTube video URL** : vidéo de la langue, publicités désactivées sur YouTube.
Le nom et la description courte viennent du manifeste (`_locales`) et sont en lecture seule.

## Textes réglementaires (identiques pour les deux stores)

**Catégorie :** Productivité

**Objectif unique :** Rediriger instantanément vers un lien enregistré lorsque l'utilisateur tape un mot-clé exact dans la barre de recherche ou l'omnibox.

**Justification des permissions**
- **storage** : enregistre les raccourcis (mot-clé → URL) et les préférences de l'utilisateur dans le stockage du navigateur. Rien n'est envoyé à un serveur.
- **webNavigation** : détecte, localement, qu'une navigation principale est une recherche sur l'un des moteurs de recherche supportés afin de la comparer aux mots-clés de l'utilisateur et de rediriger l'onglet. Le listener est filtré sur ces seuls domaines ; aucun historique n'est enregistré.
- Aucune permission d'hôte (`host_permissions`), aucun accès au contenu des pages, aucun code distant.

**Code distant :** non. **Données collectées :** aucune (ne rien cocher, cocher les trois certifications).

**Politique de confidentialité :** `https://github.com/Thomas-TP/Link-Catcher/blob/main/PRIVACY.md` (ou ton document Google public, à condition qu'il dise la même chose).

**Notes pour la certification / instructions de test**
1. Ouvrir le popup, onglet « Nouveau », saisir le mot-clé `gh` et l'URL `https://github.com/`, valider.
2. Ouvrir un nouvel onglet, aller sur google.com ou bing.com, rechercher exactement `gh` : l'onglet est redirigé vers github.com.
3. Dans la barre d'adresse, taper `l`, Espace, `gh`, Entrée : même résultat (des suggestions apparaissent pendant la frappe).
4. Aucun compte ni identifiant n'est nécessaire.
