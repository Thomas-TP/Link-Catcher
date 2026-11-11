// background.js

// Moteurs de recherche supportés : domaine, chemin attendu, paramètre de requête.
// Le domaine est comparé strictement (exact ou sous-domaine) pour éviter les faux positifs
// du type "evilgoogle.com" ou "google.evil.com".
const ENGINES = [
  { host: /(^|\.)google\.[a-z.]+$/, path: '/search', param: 'q' },
  { host: /(^|\.)bing\.com$/, path: '/search', param: 'q' },
  { host: /(^|\.)duckduckgo\.com$/, path: null, param: 'q' },
  { host: /(^|\.)search\.yahoo\.com$/, path: '/search', param: 'p' },
  { host: /(^|\.)ecosia\.org$/, path: '/search', param: 'q' }
];

// Filtre côté navigateur : le listener n'est appelé que pour ces moteurs.
const NAV_FILTER = {
  url: [
    { hostContains: 'google.', pathPrefix: '/search' },
    { hostSuffix: 'bing.com', pathPrefix: '/search' },
    { hostSuffix: 'duckduckgo.com' },
    { hostSuffix: 'search.yahoo.com', pathPrefix: '/search' },
    { hostSuffix: 'ecosia.org', pathPrefix: '/search' }
  ]
};

// Extrait la requête de recherche selon le moteur
function extractQuery(urlStr) {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    for (const e of ENGINES) {
      if (e.host.test(url.hostname) && (!e.path || url.pathname.startsWith(e.path))) {
        return url.searchParams.get(e.param);
      }
    }
  } catch (err) {
    // URL invalide
  }
  return null;
}

// Retourne l'URL associée au mot exact (ou null). Hors prototype : "constructor" n'est pas un raccourci.
function lookup(shortcuts, word) {
  return Object.prototype.hasOwnProperty.call(shortcuts, word) && typeof shortcuts[word] === 'string'
    ? shortcuts[word]
    : null;
}

// 1. Interception d'une vraie recherche (Google, Bing, etc.)
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Navigation principale uniquement (pas les iframes)
  if (details.frameId !== 0) return;

  const query = extractQuery(details.url);
  if (!query) return;

  const exactWord = query.trim();
  chrome.storage.sync.get(['shortcuts'], (result) => {
    const target = lookup(result.shortcuts || {}, exactWord);
    if (target) chrome.tabs.update(details.tabId, { url: target });
  });
}, NAV_FILTER);

// 2. Omnibox : "l" + Espace + mot-clé
chrome.omnibox.onInputEntered.addListener((text) => {
  const exactWord = text.trim();
  chrome.storage.sync.get(['shortcuts'], (result) => {
    const target = lookup(result.shortcuts || {}, exactWord);
    if (target) {
      chrome.tabs.update({ url: target });
    } else {
      // Mot inconnu : recherche normale
      chrome.tabs.update({ url: `https://www.google.com/search?q=${encodeURIComponent(text)}` });
    }
  });
});
