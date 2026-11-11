// Génère une vidéo de démonstration sous-titrée par langue : store-assets/<langue>/video/link-catcher-demo-<langue>.{webm,mp4}
// (à téléverser sur YouTube : les deux stores n'acceptent qu'un lien YouTube.)
// Usage : node scripts/video.js [lang ...]   (CHROMIUM_PATH=/chemin/chrome si besoin ; nécessite ffmpeg pour le .mp4)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { ROOT, LANGS, COPY, launch, seed, popupShot } = require('./store-common');

const logoB64 = fs.readFileSync(path.join(ROOT, 'store-assets', 'logo-300.png')).toString('base64');
const DURATION_MS = 27000;

function sceneHtml(lang, addB64, listB64) {
  const c = COPY[lang];
  const v = c.video;
  const kw = 'gh';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}
  body{margin:0;width:1280px;height:720px;overflow:hidden;font-family:system-ui,'Segoe UI',Roboto,sans-serif;color:#f8fafc;background:linear-gradient(135deg,#0b1020,#1b2a55)}
  .scene{position:absolute;inset:0;opacity:0;transition:opacity .5s ease;display:flex;align-items:center;justify-content:center}
  .scene.on{opacity:1}
  .browser{width:980px;height:470px;margin-top:-50px;border-radius:14px;background:#fff;color:#0f172a;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden;position:relative}
  .bar{height:52px;background:#e8ecf4;display:flex;align-items:center;gap:10px;padding:0 16px}
  .dot{width:12px;height:12px;border-radius:50%;background:#c3cad8}
  .url{flex:1;height:32px;border-radius:16px;background:#fff;display:flex;align-items:center;padding:0 16px;font-size:16px;color:#334155;margin-left:14px;position:relative}
  .page{position:absolute;top:52px;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
  .search{width:560px;height:56px;border:2px solid #cbd5e1;border-radius:28px;display:flex;align-items:center;padding:0 24px;font-size:24px;gap:10px}
  .search .t{font-weight:600}
  .caret{display:inline-block;width:2px;height:28px;background:#2563eb;animation:b 1s steps(1) infinite}
  @keyframes b{50%{opacity:0}}
  .hint{font-size:18px;color:#64748b}
  .key{display:inline-block;padding:4px 12px;border:1px solid #94a3b8;border-bottom-width:3px;border-radius:8px;font-weight:700;color:#334155;transition:all .15s}
  .key.press{background:#2563eb;color:#fff;border-color:#1d4ed8;transform:translateY(2px)}
  .dest{display:none;flex-direction:column;align-items:center;gap:18px;width:100%}
  .dest .hd{height:70px;width:100%;background:#0f172a;color:#fff;display:flex;align-items:center;padding:0 40px;font-size:26px;font-weight:700}
  .dest .blk{width:80%;height:34px;border-radius:8px;background:#e2e8f0}
  .dest .blk.s{width:55%}
  .drop{position:absolute;top:44px;left:0;right:0;background:#fff;border-radius:0 0 18px 18px;box-shadow:0 12px 30px rgba(0,0,0,.2);padding:6px 0;display:none;z-index:5}
  .drop div{padding:10px 18px;font-size:16px;display:flex;gap:12px}
  .drop div b{min-width:70px}
  .drop div span{color:#64748b}
  .drop div.sel{background:#e8f0ff}
  .cap{position:absolute;left:0;right:0;bottom:46px;text-align:center;font-size:40px;font-weight:800;text-shadow:0 4px 24px rgba(0,0,0,.6);opacity:0;transition:opacity .4s}
  .cap.on{opacity:1}
  .shot{height:600px;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.55);margin-top:-30px}
  .center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px}
  .center img.logo{width:150px;height:150px;border-radius:34px;box-shadow:0 14px 40px rgba(59,130,246,.5)}
  .center h1{margin:0;font-size:68px}
  .center p{margin:0;font-size:30px;opacity:.85;max-width:900px;line-height:1.35}
  .cta{margin-top:10px;padding:16px 34px;border-radius:14px;background:#2563eb;font-size:28px;font-weight:700}
  </style></head><body>

  <!-- Scène 1 : recherche -> redirection -->
  <div class="scene" id="s1"><div class="browser">
    <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><div class="url" id="u1">search.example</div></div>
    <div class="page" id="p1"><div class="search"><span class="t" id="q1"></span><span class="caret"></span></div>
      <div class="hint"><span class="key" id="enter">Enter</span></div></div>
    <div class="page" id="p1b" style="display:none"><div class="dest" id="dest" style="display:flex"><div class="hd">github.com</div><div class="blk"></div><div class="blk s"></div><div class="blk"></div></div></div>
  </div></div>

  <!-- Scène 2 : popup -->
  <div class="scene" id="s2"><img class="shot" id="shot" src="data:image/png;base64,${addB64}"></div>

  <!-- Scène 3 : omnibox -->
  <div class="scene" id="s3"><div class="browser" style="height:360px">
    <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><div class="url"><span id="q3"></span><span class="caret"></span>
      <div class="drop" id="drop"><div class="sel"><b>${kw}</b><span>https://github.com/</span></div><div><b>docs</b><span>https://docs.google.com/</span></div><div><b>proj</b><span>https://github.com/Thomas-TP/Link-Catcher</span></div></div></div></div>
    <div class="page" id="p3"><img src="data:image/png;base64,${listB64}" style="height:270px;border-radius:12px;opacity:.0" id="listimg"></div>
  </div></div>

  <!-- Scène 4 : vie privée / outro -->
  <div class="scene" id="s4"><div class="center"><img class="logo" src="data:image/png;base64,${logoB64}">
    <h1>Link Catcher</h1><p>${v[5]}</p><div class="cta">${c.cta}</div></div></div>

  <div class="cap" id="cap"></div>

  <script>
  const W = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const caps = ${JSON.stringify(v)};
  const show = async (n) => { document.querySelectorAll('.scene').forEach(s => s.classList.remove('on')); $('s'+n).classList.add('on'); await W(500); };
  const cap = (t) => { const c = $('cap'); c.classList.remove('on'); setTimeout(() => { c.textContent = t; c.classList.add('on'); }, 350); };
  const type = async (el, text, d) => { for (const ch of text) { el.textContent += ch; await W(d); } };
  (async () => {
    // 1. Recherche
    await show(1); cap(caps[0]); await W(700);
    await type($('q1'), '${kw}', 450); await W(600);
    $('enter').classList.add('press'); await W(350);
    $('p1').style.display = 'none'; $('p1b').style.display = 'flex'; $('u1').textContent = 'github.com';
    cap(caps[1]); await W(3200);
    // 2. Création
    await show(2); cap(caps[2]); await W(5000);
    // 3. Omnibox
    await show(3); cap(caps[3]); await W(600);
    await type($('q3'), 'l ${kw}', 450); $('drop').style.display = 'block'; await W(2600);
    // 4. Vie privée + outro
    await show(4); cap(caps[4]); await W(3200); cap(caps[6]);
  })();
  </script></body></html>`;
}

(async () => {
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : LANGS;
  const ext = await launch();
  const shots = {};
  for (const lang of langs) {
    await seed(ext.sw, { lang, theme: 'dark' });
    shots[lang] = {
      add: await popupShot(ext.ctx, ext.popupUrl, { tab: 'tab-add', fill: ['docs, d', 'https://docs.google.com/'] }),
      list: await popupShot(ext.ctx, ext.popupUrl, {})
    };
  }
  await ext.close();

  const launchOpts = { headless: true, args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH; else launchOpts.channel = 'chromium';
  const browser = await chromium.launch(launchOpts);

  for (const lang of langs) {
    const outDir = path.join(ROOT, 'store-assets', lang, 'video');
    fs.mkdirSync(outDir, { recursive: true });
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lc-video-'));
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: tmp, size: { width: 1280, height: 720 } } });
    const page = await ctx.newPage();
    await page.setContent(sceneHtml(lang, shots[lang].add.toString('base64'), shots[lang].list.toString('base64')));
    await page.waitForTimeout(DURATION_MS);
    const vid = page.video();
    await ctx.close();
    const webm = path.join(outDir, `link-catcher-demo-${lang}.webm`);
    fs.copyFileSync(await vid.path(), webm);
    fs.rmSync(tmp, { recursive: true, force: true });
    try {
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-movflags', '+faststart', '-an', webm.replace('.webm', '.mp4')]);
    } catch { console.warn('ffmpeg indisponible : seul le .webm est produit'); }
    console.log('vidéo', lang);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
