// shared.js — code commun au service worker (importScripts) et au popup (<script>).
// Aucune dépendance. Expose l'objet global `LC`.

const LC = (() => {
  const PREFIX = 's:';          // une clé storage.sync par raccourci : "s:<mot normalisé>"
  const MAX_KEYWORD = 64;
  const MAX_URL = 2000;         // 8 Ko max par clé sync, largement suffisant

  // Moteurs de recherche détectés pour la redirection.
  // Domaine comparé strictement (exact ou sous-domaine) : "evilgoogle.com" ne matche pas.
  const ENGINES = [
    { host: /(^|\.)google\.(com?\.)?[a-z]{2,3}$/, path: '/search', param: 'q' },
    { host: /(^|\.)bing\.com$/, path: '/search', param: 'q' },
    { host: /(^|\.)duckduckgo\.com$/, path: null, param: 'q' },
    { host: /(^|\.)search\.yahoo\.com$/, path: '/search', param: 'p' },
    { host: /(^|\.)ecosia\.org$/, path: '/search', param: 'q' },
    { host: /(^|\.)search\.brave\.com$/, path: '/search', param: 'q' },
    { host: /(^|\.)startpage\.com$/, path: null, param: 'query' },
    { host: /(^|\.)qwant\.com$/, path: null, param: 'q' },
    { host: /(^|\.)kagi\.com$/, path: '/search', param: 'q' }
  ];

  // Filtre appliqué par le navigateur : le listener n'est réveillé que pour ces sites.
  const NAV_FILTER = {
    url: [
      { hostContains: 'google.', pathPrefix: '/search' },
      { hostSuffix: 'bing.com', pathPrefix: '/search' },
      { hostSuffix: 'duckduckgo.com' },
      { hostSuffix: 'search.yahoo.com', pathPrefix: '/search' },
      { hostSuffix: 'ecosia.org', pathPrefix: '/search' },
      { hostSuffix: 'search.brave.com', pathPrefix: '/search' },
      { hostSuffix: 'startpage.com' },
      { hostSuffix: 'qwant.com' },
      { hostSuffix: 'kagi.com', pathPrefix: '/search' }
    ]
  };

  // Moteurs proposés pour la recherche de repli de l'omnibox.
  const FALLBACKS = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    ecosia: 'https://www.ecosia.org/search?q=',
    brave: 'https://search.brave.com/search?q=',
    startpage: 'https://www.startpage.com/do/search?query=',
    qwant: 'https://www.qwant.com/?q=',
    kagi: 'https://kagi.com/search?q='
  };

  // Minuscules, sans accents, espaces compactés : "Projét  X" == "projet x".
  function normalize(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Valide et nettoie une URL saisie. Ajoute https:// si aucun schéma. Retourne null si invalide.
  function parseUrl(input) {
    let s = String(input || '').trim();
    if (!s || s.length > MAX_URL) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s;
    try {
      const u = new URL(s);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
      if (!u.hostname) return null;
      return u.href;
    } catch {
      return null;
    }
  }

  // Extrait la requête de recherche d'une URL de moteur connu (ou null).
  function extractQuery(urlStr) {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
      for (const e of ENGINES) {
        if (e.host.test(url.hostname) && (!e.path || url.pathname.startsWith(e.path))) {
          return url.searchParams.get(e.param);
        }
      }
    } catch { /* URL invalide */ }
    return null;
  }

  // Migration unique de l'ancien format { shortcuts: { mot: url } } vers une clé par raccourci.
  async function migrate() {
    const { shortcuts } = await chrome.storage.sync.get('shortcuts');
    if (shortcuts === undefined) return;
    const batch = {};
    if (shortcuts && typeof shortcuts === 'object' && !Array.isArray(shortcuts)) {
      for (const [k, v] of Object.entries(shortcuts)) {
        const url = parseUrl(v);
        const id = normalize(k);
        if (url && id && k.length <= MAX_KEYWORD) batch[PREFIX + id] = { k: k.trim(), u: url };
      }
    }
    if (Object.keys(batch).length) await chrome.storage.sync.set(batch);
    await chrome.storage.sync.remove('shortcuts');
  }
  const ready = migrate().catch(() => {});

  // Liste tous les raccourcis : [{ id, k, u }]
  async function getAll() {
    await ready;
    const all = await chrome.storage.sync.get(null);
    const list = [];
    for (const [key, val] of Object.entries(all)) {
      if (key.startsWith(PREFIX) && val && typeof val.k === 'string' && typeof val.u === 'string') {
        list.push({ id: key.slice(PREFIX.length), k: val.k, u: val.u });
      }
    }
    return list;
  }

  // URL d'un mot (insensible à la casse/accents), ou null. Re-valide le schéma à la lecture.
  async function find(word) {
    await ready;
    const id = normalize(word);
    if (!id) return null;
    const key = PREFIX + id;
    const res = await chrome.storage.sync.get(key);
    const val = res[key];
    const url = val && typeof val.u === 'string' ? parseUrl(val.u) : null;
    return url ? { id, url } : null;
  }

  async function saveMany(items) { // items: [{ k, u }] déjà validés
    const batch = {};
    for (const it of items) batch[PREFIX + normalize(it.k)] = { k: it.k, u: it.u };
    await chrome.storage.sync.set(batch);
  }

  async function remove(ids) {
    await chrome.storage.sync.remove([].concat(ids).map(id => PREFIX + id));
  }

  async function clear() {
    const list = await getAll();
    await chrome.storage.sync.remove(list.map(s => PREFIX + s.id).concat('customOrder'));
    await chrome.storage.local.remove('usage');
  }

  // Compteur d'utilisation, local à l'appareil (n'est pas synchronisé).
  async function bumpUsage(id) {
    const { usage = {} } = await chrome.storage.local.get('usage');
    usage[id] = (usage[id] || 0) + 1;
    await chrome.storage.local.set({ usage });
  }
  async function getUsage() {
    const { usage = {} } = await chrome.storage.local.get('usage');
    return usage;
  }

  async function fallbackUrl(text) {
    const { fallbackEngine } = await chrome.storage.sync.get('fallbackEngine');
    const base = FALLBACKS[fallbackEngine] || FALLBACKS.google;
    return base + encodeURIComponent(text);
  }

  return {
    PREFIX, MAX_KEYWORD, MAX_URL, ENGINES, NAV_FILTER, FALLBACKS,
    normalize, parseUrl, extractQuery,
    getAll, find, saveMany, remove, clear, bumpUsage, getUsage, fallbackUrl, ready
  };
})();
