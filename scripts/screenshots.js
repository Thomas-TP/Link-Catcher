/* global LC */
// Génère les captures d'écran 1280x800 pour les stores dans store-assets/screenshots/.
// Usage : node scripts/screenshots.js   (CHROMIUM_PATH=/chemin/chrome pour un binaire précis)
const { chromium } = require('playwright');
const os = require('os');
const path = require('path');
const fs = require('fs');

const EXT = path.join(__dirname, '..');
const OUT = path.join(EXT, 'store-assets', 'screenshots');

const DEMO = {
  fr: { gh: 'https://github.com/', mail: 'https://mail.google.com/', agenda: 'https://calendar.google.com/', docs: 'https://docs.google.com/', banque: 'https://www.example-bank.com/login', proj: 'https://github.com/Thomas-TP/Link-Catcher' },
  en: { gh: 'https://github.com/', mail: 'https://mail.google.com/', cal: 'https://calendar.google.com/', docs: 'https://docs.google.com/', news: 'https://news.ycombinator.com/', proj: 'https://github.com/Thomas-TP/Link-Catcher' }
};

const SHOTS = [
  { file: '1-list-dark-fr.png', lang: 'fr', theme: 'dark', title: 'Tapez un mot, arrivez directement', sub: 'Vos liens à portée de la barre de recherche.', tab: 'tab-list' },
  { file: '2-add-light-en.png', lang: 'en', theme: 'light', title: 'Create shortcuts in seconds', sub: 'Aliases, instant search, drag & drop ordering.', tab: 'tab-add' },
  { file: '3-grid-dark-en.png', lang: 'en', theme: 'dark', title: 'List or grid, your choice', sub: 'Private by design: nothing leaves your browser.', tab: 'tab-list', grid: true },
  { file: '4-settings-dark-fr.png', lang: 'fr', theme: 'dark', title: 'Thèmes, langues, moteurs', sub: 'Français, English, Español, Deutsch · Google, Bing, DuckDuckGo…', tab: 'tab-list', settings: true }
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-shots-'));
  const opts = { headless: true, args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-sandbox'], deviceScaleFactor: 2, viewport: { width: 380, height: 640 } };
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH; else opts.channel = 'chromium';
  const ctx = await chromium.launchPersistentContext(profile, opts);
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const popupUrl = `chrome-extension://${new URL(sw.url()).host}/popup.html`;

  for (const shot of SHOTS) {
    await sw.evaluate(async ({ demo, shot }) => {
      await chrome.storage.sync.clear(); await chrome.storage.local.clear();
      await LC.saveMany(Object.entries(demo).map(([k, u]) => ({ k, u })));
      await chrome.storage.sync.set({ theme: shot.theme, lang: shot.lang, view: shot.grid ? 'grid' : 'list', sort: 'asc' });
      await chrome.storage.local.set({ usage: { gh: 42, mail: 17, proj: 8 } });
    }, { demo: DEMO[shot.lang], shot });

    const page = await ctx.newPage();
    await page.setViewportSize({ width: 380, height: 640 });
    await page.goto(popupUrl);
    await page.waitForSelector('.shortcut-item');
    if (shot.tab === 'tab-add') {
      await page.click('.tab-btn[data-tab="tab-add"]');
      await page.fill('#keyword-input', 'docs, d'); await page.fill('#url-input', 'https://docs.google.com/');
    }
    if (shot.settings) await page.click('#settings-btn');
    await page.waitForTimeout(600);
    const popupPng = (await page.screenshot({ clip: { x: 0, y: 0, width: 380, height: 640 } })).toString('base64');
    await page.close();

    const dark = shot.theme === 'dark';
    const frame = await ctx.newPage();
    await frame.setViewportSize({ width: 1280, height: 800 });
    await frame.setContent(`<html><body style="margin:0;width:1280px;height:800px;display:flex;align-items:center;justify-content:center;gap:90px;
      background:${dark ? 'linear-gradient(135deg,#0b1020,#1b2a55)' : 'linear-gradient(135deg,#e8f0ff,#c9dcff)'};font-family:system-ui,'Segoe UI',sans-serif;color:${dark ? '#f8fafc' : '#0f172a'}">
      <div style="max-width:480px"><div style="font-size:50px;font-weight:800;line-height:1.1">${shot.title}</div>
      <div style="margin-top:20px;font-size:22px;opacity:.75;line-height:1.4">${shot.sub}</div></div>
      <img src="data:image/png;base64,${popupPng}" style="width:380px;height:640px;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45)"></body></html>`);
    await frame.screenshot({ path: path.join(OUT, shot.file), scale: 'css' });
    await frame.close();
    console.log('généré', shot.file);
  }
  await ctx.close();
  fs.rmSync(profile, { recursive: true, force: true });
})().catch(e => { console.error(e); process.exit(1); });
