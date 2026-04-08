// background.js

// Fonction utilitaire pour extraire la requête de recherche selon le moteur de recherche
function extractQuery(urlStr) {
  try {
    const url = new URL(urlStr);
    
    // Google
    if (url.hostname.includes('google.') && url.pathname.includes('/search')) {
      return url.searchParams.get('q');
    }
    // Bing
    if (url.hostname.includes('bing.com') && url.pathname.includes('/search')) {
      return url.searchParams.get('q');
    }
    // DuckDuckGo
    if (url.hostname.includes('duckduckgo.com')) {
      return url.searchParams.get('q');
    }
    // Yahoo
    if (url.hostname.includes('search.yahoo.com') && url.pathname.includes('/search')) {
      return url.searchParams.get('p');
    }
    // Ecosia
    if (url.hostname.includes('ecosia.org') && url.pathname.includes('/search')) {
      return url.searchParams.get('q');
    }
  } catch(e) {
    // URL invalide (ça peut arriver avec Chrome interne)
  }
  return null;
}

// 1. Interception de la navigation web (quand la personne fait une vraie recherche Google, Bing, etc.)
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // On ne traite que la navigation principale (pas les iframes cachées)
  if (details.frameId !== 0) return;

  const query = extractQuery(details.url);
  
  if (query) {
    const exactWord = query.trim();
    
    // On cherche le mot exactement dans notre stockage
    chrome.storage.sync.get(['shortcuts'], (result) => {
      const shortcuts = result.shortcuts || {};
      
      if (shortcuts[exactWord]) {
        // Match parfait ! On redirige l'onglet immédiatement vers l'URL
        chrome.tabs.update(details.tabId, { url: shortcuts[exactWord] });
      }
    });
  }
});

// 2. Interception via Omnibox (si l'utilisateur tape "l" + Espace + le mot clé)
// C'est un bonus pratique
chrome.omnibox.onInputEntered.addListener((text) => {
  const exactWord = text.trim();
  chrome.storage.sync.get(['shortcuts'], (result) => {
    const shortcuts = result.shortcuts || {};
    
    if (shortcuts[exactWord]) {
      chrome.tabs.update({url: shortcuts[exactWord]});
    } else {
      // Si le mot est inconnu, on fait une recherche Google normale
      chrome.tabs.update({url: `https://www.google.com/search?q=${encodeURIComponent(text)}`});
    }
  });
});
