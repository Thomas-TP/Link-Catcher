// Génère, pour chaque langue (en, fr, es, de), dans store-assets/<langue>/ :
//   screenshots/1..5.png (1280x800), promo-small-440x280.png, promo-marquee-1400x560.png
// Usage : node scripts/store-assets.js [lang ...]   (CHROMIUM_PATH=/chemin/chrome si besoin)
const path = require('path');
const fs = require('fs');
const { ROOT, LANGS, COPY, launch, seed, popupShot } = require('./store-common');

const logoB64 = fs.readFileSync(path.join(ROOT, 'store-assets', 'logo-300.png')).toString('base64');

const THEME = {
  dark: { bg: 'linear-gradient(135deg,#0b1020,#1b2a55)', fg: '#f8fafc', sub: 0.75 },
  light: { bg: 'linear-gradient(135deg,#e8f0ff,#c9dcff)', fg: '#0f172a', sub: 0.72 }
};
const FONT = "system-ui,'Segoe UI',Roboto,sans-serif";

// Plan des 5 captures : thème, vue, état du popup
const PLAN = [
  { theme: 'dark', popup: {} },
  { theme: 'light', popup: { tab: 'tab-add', fill: ['docs, d', 'https://docs.google.com/'] } },
  { theme: 'dark', grid: true, popup: {} },
  { theme: 'light', popup: { tab: 'tab-data' } },
  { theme: 'dark', popup: { settings: true } }
];

function screenshotHtml(th, title, sub, popupB64) {
  return `<html><body style="margin:0;width:1280px;height:800px;display:flex;align-items:center;justify-content:center;gap:90px;background:${th.bg};font-family:${FONT};color:${th.fg}">
    <div style="max-width:500px"><div style="font-size:50px;font-weight:800;line-height:1.1">${title}</div>
    <div style="margin-top:20px;font-size:22px;opacity:${th.sub};line-height:1.4">${sub}</div></div>
    <img src="data:image/png;base64,${popupB64}" style="width:380px;height:auto;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45)"></body></html>`;
}

function smallTileHtml(tagline) {
  return `<html><body style="margin:0;width:440px;height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;background:${THEME.dark.bg};font-family:${FONT};color:#f8fafc">
    <img src="data:image/png;base64,${logoB64}" style="width:96px;height:96px;border-radius:22px;box-shadow:0 10px 30px rgba(59,130,246,.45)">
    <div style="font-size:34px;font-weight:800">Link Catcher</div>
    <div style="font-size:16px;opacity:.8;padding:0 28px;line-height:1.3">${tagline}</div></body></html>`;
}

function marqueeHtml(tagline, popupB64) {
  return `<html><body style="margin:0;width:1400px;height:560px;overflow:hidden;position:relative;background:${THEME.dark.bg};font-family:${FONT};color:#f8fafc">
    <div style="position:absolute;left:90px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:22px;max-width:700px">
      <div style="display:flex;align-items:center;gap:22px"><img src="data:image/png;base64,${logoB64}" style="width:110px;height:110px;border-radius:26px;box-shadow:0 10px 30px rgba(59,130,246,.45)">
      <div style="font-size:70px;font-weight:800">Link Catcher</div></div>
      <div style="font-size:34px;opacity:.85;line-height:1.25">${tagline}</div></div>
    <img src="data:image/png;base64,${popupB64}" style="position:absolute;right:110px;top:60px;width:380px;height:auto;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.5)"></body></html>`;
}

(async () => {
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : LANGS;
  const { ctx, sw, popupUrl, close } = await launch();
  const frame = await ctx.newPage();
  const render = async (html, w, h, file) => {
    await frame.setViewportSize({ width: w, height: h });
    await frame.setContent(html);
    await frame.screenshot({ path: file, scale: 'css' }); // 1 px écran = 1 px CSS : taille exacte exigée
  };

  for (const lang of langs) {
    const out = path.join(ROOT, 'store-assets', lang);
    fs.mkdirSync(path.join(out, 'screenshots'), { recursive: true });
    let listShot;
    for (let i = 0; i < PLAN.length; i++) {
      const p = PLAN[i];
      await seed(sw, { lang, theme: p.theme, grid: p.grid });
      const buf = await popupShot(ctx, popupUrl, p.popup);
      if (i === 0) listShot = buf;
      const [title, sub] = COPY[lang].shots[i];
      await render(screenshotHtml(THEME[p.theme], title, sub, buf.toString('base64')), 1280, 800, path.join(out, 'screenshots', `${i + 1}.png`));
    }
    await render(smallTileHtml(COPY[lang].tagline), 440, 280, path.join(out, 'promo-small-440x280.png'));
    await render(marqueeHtml(COPY[lang].tagline, listShot.toString('base64')), 1400, 560, path.join(out, 'promo-marquee-1400x560.png'));
    console.log('généré', lang);
  }
  await close();
})().catch(e => { console.error(e); process.exit(1); });
