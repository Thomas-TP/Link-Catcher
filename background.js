/* global LC */
// background.js (service worker)
importScripts('shared.js');

// Ouvre une URL selon la façon dont l'utilisateur a validé dans l'omnibox.
function openUrl(url, disposition) {
  if (disposition === 'newForegroundTab') chrome.tabs.create({ url });
  else if (disposition === 'newBackgroundTab') chrome.tabs.create({ url, active: false });
  else chrome.tabs.update({ url });
}

// 1. Interception d'une vraie recherche (Google, Bing, DuckDuckGo, ...)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // navigation principale uniquement
  const query = LC.extractQuery(details.url);
  if (!query) return;
  try {
    const hit = await LC.find(query);
    if (hit) {
      chrome.tabs.update(details.tabId, { url: hit.url });
      LC.bumpUsage(hit.id);
    }
  } catch { /* onglet fermé ou stockage indisponible */ }
}, LC.NAV_FILTER);

// 2. Omnibox : "l" + Espace + mot-clé
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const q = LC.normalize(text);
  if (!q) return;
  const list = await LC.getAll();
  const matches = list
    .filter(s => s.id.includes(q) || s.u.toLowerCase().includes(q))
    .sort((a, b) => (a.id.startsWith(q) ? 0 : 1) - (b.id.startsWith(q) ? 0 : 1) || a.id.localeCompare(b.id))
    .slice(0, 5)
    .map(s => ({ content: s.k, description: `<match>${escapeXml(s.k)}</match> <dim>${escapeXml(s.u)}</dim>` }));
  suggest(matches);
});

chrome.omnibox.onInputEntered.addListener(async (text, disposition) => {
  const hit = await LC.find(text);
  if (hit) {
    openUrl(hit.url, disposition);
    LC.bumpUsage(hit.id);
  } else {
    openUrl(await LC.fallbackUrl(text), disposition); // mot inconnu : recherche normale
  }
});
