/* global LC, document */
// Éléments communs aux générateurs de visuels (captures, tuiles, vidéos) des stores.
const { chromium } = require('playwright');
const os = require('os');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const LANGS = ['en', 'fr', 'es', 'de'];

// Exemples de raccourcis, dans chaque langue
const DEMO = {
  en: { gh: 'https://github.com/', mail: 'https://mail.google.com/', cal: 'https://calendar.google.com/', docs: 'https://docs.google.com/', news: 'https://news.ycombinator.com/', proj: 'https://github.com/Thomas-TP/Link-Catcher' },
  fr: { gh: 'https://github.com/', mail: 'https://mail.google.com/', agenda: 'https://calendar.google.com/', docs: 'https://docs.google.com/', actus: 'https://www.lemonde.fr/', proj: 'https://github.com/Thomas-TP/Link-Catcher' },
  es: { gh: 'https://github.com/', correo: 'https://mail.google.com/', agenda: 'https://calendar.google.com/', docs: 'https://docs.google.com/', noticias: 'https://elpais.com/', proj: 'https://github.com/Thomas-TP/Link-Catcher' },
  de: { gh: 'https://github.com/', post: 'https://mail.google.com/', kalender: 'https://calendar.google.com/', docs: 'https://docs.google.com/', news: 'https://www.tagesschau.de/', proj: 'https://github.com/Thomas-TP/Link-Catcher' }
};

// Textes marketing des visuels
const COPY = {
  en: {
    tagline: 'Your links, one keyword away.',
    shots: [
      ['Type a keyword, land on your link', 'Your favourite sites are one word away.'],
      ['Create shortcuts in seconds', 'Add several aliases at once: docs, d.'],
      ['List or grid, your choice', 'Search, sort and drag & drop to reorder.'],
      ['Back up and restore', 'Import / export JSON with conflict handling.'],
      ['Your language, theme and engine', 'English, Français, Español, Deutsch · 8 search engines.']
    ],
    video: ['Type your keyword', 'You land on your link instantly', 'Create shortcuts and aliases', 'Or use the address bar: l + Space + keyword', 'Private by design', 'No account · No tracking · Everything stays in your browser', 'Free for Chrome & Edge'],
    searchLabel: 'Search', kw: 'Keyword', cta: 'Get Link Catcher'
  },
  fr: {
    tagline: 'Vos liens, à un mot de distance.',
    shots: [
      ['Tapez un mot, arrivez sur votre lien', 'Vos sites favoris sont à un mot de distance.'],
      ['Créez des raccourcis en quelques secondes', 'Plusieurs alias d\'un coup : docs, d.'],
      ['Liste ou grille, au choix', 'Recherche, tri et glisser-déposer pour réordonner.'],
      ['Sauvegardez et restaurez', 'Import / export JSON avec gestion des conflits.'],
      ['Votre langue, thème et moteur', 'English, Français, Español, Deutsch · 8 moteurs de recherche.']
    ],
    video: ['Tapez votre mot-clé', 'Vous arrivez directement sur votre lien', 'Créez raccourcis et alias', 'Ou utilisez la barre d\'adresse : l + Espace + mot', 'Respect de la vie privée', 'Sans compte · Sans suivi · Tout reste dans votre navigateur', 'Gratuit pour Chrome et Edge'],
    searchLabel: 'Rechercher', kw: 'Mot-clé', cta: 'Obtenir Link Catcher'
  },
  es: {
    tagline: 'Tus enlaces, a una palabra de distancia.',
    shots: [
      ['Escribe una palabra y llega a tu enlace', 'Tus sitios favoritos a una palabra de distancia.'],
      ['Crea accesos en segundos', 'Varios alias a la vez: docs, d.'],
      ['Lista o cuadrícula, tú eliges', 'Busca, ordena y arrastra para reordenar.'],
      ['Copia de seguridad y restauración', 'Importa / exporta JSON con gestión de conflictos.'],
      ['Tu idioma, tema y buscador', 'English, Français, Español, Deutsch · 8 buscadores.']
    ],
    video: ['Escribe tu palabra clave', 'Llegas a tu enlace al instante', 'Crea accesos y alias', 'O usa la barra de direcciones: l + Espacio + palabra', 'Privado por diseño', 'Sin cuenta · Sin seguimiento · Todo queda en tu navegador', 'Gratis para Chrome y Edge'],
    searchLabel: 'Buscar', kw: 'Palabra clave', cta: 'Obtener Link Catcher'
  },
  de: {
    tagline: 'Deine Links, ein Wort entfernt.',
    shots: [
      ['Wort eintippen, Link öffnen', 'Deine Lieblingsseiten sind nur ein Wort entfernt.'],
      ['Links in Sekunden anlegen', 'Mehrere Alias auf einmal: docs, d.'],
      ['Liste oder Gitter, du entscheidest', 'Suchen, sortieren und per Drag & Drop ordnen.'],
      ['Sichern und wiederherstellen', 'JSON-Import / -Export mit Konfliktbehandlung.'],
      ['Deine Sprache, Design und Suchmaschine', 'English, Français, Español, Deutsch · 8 Suchmaschinen.']
    ],
    video: ['Schlüsselwort eintippen', 'Du landest sofort bei deinem Link', 'Links und Alias anlegen', 'Oder in der Adressleiste: l + Leertaste + Wort', 'Privatsphäre inklusive', 'Kein Konto · Kein Tracking · Alles bleibt in deinem Browser', 'Kostenlos für Chrome & Edge'],
    searchLabel: 'Suchen', kw: 'Schlüsselwort', cta: 'Link Catcher holen'
  }
};

async function launch(extra = {}) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-store-'));
  const opts = {
    headless: true,
    args: [`--disable-extensions-except=${ROOT}`, `--load-extension=${ROOT}`, '--no-sandbox'],
    deviceScaleFactor: 2, viewport: { width: 380, height: 640 }, ...extra
  };
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH; else opts.channel = 'chromium';
  const ctx = await chromium.launchPersistentContext(profile, opts);
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const popupUrl = `chrome-extension://${new URL(sw.url()).host}/popup.html`;
  const close = async () => { await ctx.close(); fs.rmSync(profile, { recursive: true, force: true }); };
  return { ctx, sw, popupUrl, close };
}

// Remplit le stockage avec des données de démonstration
function seed(sw, { lang, theme, grid }) {
  return sw.evaluate(async ({ demo, lang, theme, grid }) => {
    await chrome.storage.sync.clear(); await chrome.storage.local.clear();
    await LC.saveMany(Object.entries(demo).map(([k, u]) => ({ k, u })));
    await chrome.storage.sync.set({ theme, lang, view: grid ? 'grid' : 'list', sort: 'asc' });
    await chrome.storage.local.set({ usage: { gh: 42, mail: 17, proj: 8 } });
  }, { demo: DEMO[lang], lang, theme, grid: !!grid });
}

// Capture le popup (380x640 CSS px, rendu @2x) et retourne un Buffer PNG
async function popupShot(ctx, popupUrl, { tab, fill, settings } = {}) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 380, height: 640 });
  await page.goto(popupUrl);
  await page.waitForSelector('.shortcut-item');
  if (tab) await page.click(`.tab-btn[data-tab="${tab}"]`);
  if (fill) { await page.fill('#keyword-input', fill[0]); await page.fill('#url-input', fill[1]); }
  if (settings) await page.click('#settings-btn');
  await page.waitForTimeout(600);
  // Hauteur réelle du contenu (les réglages sont une surcouche plein écran : on garde 640)
  const h = settings ? 640 : Math.min(640, Math.max(420, Math.ceil(await page.evaluate(() => document.querySelector('.container').getBoundingClientRect().height))));
  const buf = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: 380, height: h } });
  await page.close();
  return buf;
}

module.exports = { ROOT, LANGS, DEMO, COPY, launch, seed, popupShot };
