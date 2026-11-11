/* global LC */
// Test de bout en bout : charge l'extension dans Chromium et vérifie le comportement réel.
// Usage : npm test   (CHROMIUM_PATH=/chemin/chrome pour utiliser un binaire précis)
const { chromium } = require('playwright');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const EXT = path.join(__dirname, '..');
let failures = 0;
function check(name, cond, extra) {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${!cond && extra !== undefined ? ' -> ' + JSON.stringify(extra) : ''}`);
  if (!cond) failures++;
}

(async () => {
  const srv = http.createServer((req, res) => {
    res.setHeader('content-type', 'text/html'); res.end(`<title>${req.headers.host}${req.url}</title>ok`);
  }).listen(0);
  const port = srv.address().port;
  const target = `http://target.localhost:${port}/ok`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-profile-'));

  const opts = {
    headless: true,
    args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-sandbox',
      '--host-resolver-rules=MAP www.google.com 127.0.0.1, MAP google.evil.com 127.0.0.1, MAP evilgoogle.com 127.0.0.1']
  };
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH; else opts.channel = 'chromium';
  const ctx = await chromium.launchPersistentContext(profile, opts);

  try {
    const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
    const extId = new URL(sw.url()).host;
    const popupUrl = `chrome-extension://${extId}/popup.html`;
    const keys = () => sw.evaluate(async () => Object.keys(await chrome.storage.sync.get(null)));
    const resultUrl = async (u) => {
      const pg = await ctx.newPage(); await pg.goto(u).catch(() => {}); await pg.waitForTimeout(1200);
      const r = pg.url(); await pg.close(); return r;
    };

    // --- 1. Migration de l'ancien format ---
    await sw.evaluate((t) => chrome.storage.sync.set({
      shortcuts: { Proj: t, bad: 'javascript:alert(1)', constructor: 'https://example.org/' }
    }), target);
    const popup = await ctx.newPage();
    await popup.goto(popupUrl);
    await popup.waitForSelector('.shortcut-item');
    let k = await keys();
    check('migration : ancien format supprimé', !k.includes('shortcuts'), k);
    check('migration : s:proj créé', k.includes('s:proj'), k);
    check('migration : URL dangereuse ignorée', !k.includes('s:bad'), k);

    // --- 2. Redirections ---
    const g = (q, host = 'www.google.com') => `http://${host}:${port}/search?q=${encodeURIComponent(q)}`;
    check('redirige "proj"', await resultUrl(g('proj')) === target);
    check('insensible à la casse', await resultUrl(g('PROJ')) === target);
    check('insensible aux accents', await resultUrl(g('Prój')) === target);
    check('mot inconnu : pas de redirection', (await resultUrl(g('other'))).includes('/search?q=other'));
    check('evilgoogle.com ignoré', (await resultUrl(g('proj', 'evilgoogle.com'))).includes('evilgoogle'));
    check('google.evil.com ignoré', (await resultUrl(g('proj', 'google.evil.com'))).includes('google.evil.com'));
    const urls = ['https://www.google.fr/search?q=x', 'https://www.bing.com/search?q=x', 'https://duckduckgo.com/?q=x',
      'https://search.yahoo.com/search?p=x', 'https://www.ecosia.org/search?q=x', 'https://search.brave.com/search?q=x',
      'https://www.startpage.com/do/search?query=x', 'https://www.qwant.com/?q=x', 'https://kagi.com/search?q=x'];
    const ex = await sw.evaluate((l) => l.map(u => LC.extractQuery(u)), urls);
    check('9 moteurs extraient la requête', ex.every(v => v === 'x'), ex);
    const bad = await sw.evaluate(() => ['https://evilgoogle.com/search?q=x', 'https://google.evil.com/search?q=x', 'ftp://www.google.com/search?q=x'].map(u => LC.extractQuery(u)));
    check('faux domaines / schémas rejetés', bad.every(v => v === null), bad);
    check('mot "toString" non traité comme raccourci', (await resultUrl(g('toString'))).includes('/search?q=toString'));

    // --- 3. Fonctions partagées ---
    const fb = await sw.evaluate(async () => {
      await chrome.storage.sync.set({ fallbackEngine: 'brave' });
      return LC.fallbackUrl('a b');
    });
    check('moteur de repli configurable', fb === 'https://search.brave.com/search?q=a%20b', fb);
    const parse = await sw.evaluate(() => [LC.parseUrl('javascript:alert(1)'), LC.parseUrl('example.com'), LC.parseUrl('ftp://x.y'), LC.parseUrl('http://a.b/c')]);
    check('validation d\'URL', JSON.stringify(parse) === JSON.stringify([null, 'https://example.com/', null, 'http://a.b/c']), parse);

    // --- 4. UI : ajout avec alias ---
    await popup.reload(); await popup.waitForSelector('.shortcut-item');
    await popup.click('.tab-btn[data-tab="tab-add"]');
    await popup.fill('#keyword-input', 'alpha, a');
    await popup.fill('#url-input', 'example.com');
    await popup.click('#add-btn');
    await popup.waitForSelector('.shortcut-item[data-id="a"]');
    check('alias créés', await popup.locator('.shortcut-item[data-id="alpha"]').count() === 1);
    const stored = await sw.evaluate(async () => (await chrome.storage.sync.get('s:alpha'))['s:alpha']);
    check('URL normalisée à l\'enregistrement', stored && stored.u === 'https://example.com/', stored);

    // --- 5. URL invalide ---
    await popup.click('.tab-btn[data-tab="tab-add"]');
    await popup.fill('#keyword-input', 'evil');
    await popup.fill('#url-input', 'javascript:alert(1)');
    await popup.click('#add-btn');
    await popup.waitForSelector('.toast.error');
    check('URL javascript: refusée', !(await keys()).includes('s:evil'));
    await popup.click('.tab-btn[data-tab="tab-list"]');

    // --- 6. XSS via import ---
    await popup.click('.tab-btn[data-tab="tab-data"]');
    const xss = '<img src=x onerror="window.__xss=1"><b>x</b>';
    await popup.setInputFiles('#import-file', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ [xss]: 'https://example.com/x' })) });
    await popup.waitForSelector('.shortcut-item[data-id^="<img"]');
    check('XSS : aucune balise injectée', await popup.locator('#shortcuts-list img, #shortcuts-list b').count() === 0);
    check('XSS : texte affiché tel quel', (await popup.locator('.shortcut-kwd', { hasText: '<img' }).count()) === 1);

    // --- 7. Import avec conflit ---
    await popup.click('.tab-btn[data-tab="tab-data"]');
    await popup.setInputFiles('#import-file', { name: 'c.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ alpha: 'https://changed.example/' })) });
    await popup.waitForSelector('#confirm-overlay.active');
    await popup.click('#confirm-actions button:last-child'); // Remplacer
    await popup.waitForTimeout(500);
    const replaced = await sw.evaluate(async () => (await chrome.storage.sync.get('s:alpha'))['s:alpha'].u);
    check('conflit : remplacement', replaced === 'https://changed.example/', replaced);

    // --- 8. Recherche dans la liste ---
    await popup.fill('#search-input', 'projx-inexistant');
    await popup.waitForSelector('.empty-state');
    check('recherche sans résultat', (await popup.locator('.shortcut-item').count()) === 0);
    await popup.fill('#search-input', 'alp');
    await popup.waitForSelector('.shortcut-item');
    check('recherche filtre la liste', (await popup.locator('.shortcut-item').count()) === 1);

    // --- 9. Compteur d'utilisation ---
    const usage = await sw.evaluate(async () => (await chrome.storage.local.get('usage')).usage || {});
    check('compteur d\'utilisation incrémenté', usage.proj >= 1, usage);

    // --- 10. Effacement ---
    await sw.evaluate(() => LC.clear());
    check('effacement complet', !(await keys()).some(x => x.startsWith('s:')));
  } finally {
    await ctx.close(); srv.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
  console.log(failures ? `\n${failures} test(s) en échec` : '\nTous les tests passent');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
