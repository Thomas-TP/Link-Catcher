// Vérifie que les descriptions des stores respectent la politique anti-"keyword stuffing" du Chrome Web Store :
// pas de liste de marques/sites et aucun mot répété plus de 5 fois (règle citée dans la doc Chrome).
// Usage : node scripts/check-listing.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BRANDS = /google|bing|duckduckgo|yahoo|ecosia|brave|startpage|qwant|kagi|chrome|edge|youtube/i;
const MAX_REPEAT = 5;
// Nom du produit et mots-outils (articles, pronoms, conjonctions) : leur répétition est naturelle.
const IGNORED = new Set(['link', 'catcher',
  'your', 'that', 'with', 'from', 'this', 'when', 'what', 'only', 'such', 'they', 'them', 'than', 'then', 'into', 'before',
  'vous', 'dans', 'pour', 'avec', 'sans', 'une', 'des', 'les', 'que', 'qui', 'votre', 'vos', 'cette', 'tout', 'aussi', 'avant',
  'para', 'con', 'una', 'los', 'las', 'que', 'tus', 'sin', 'solo', 'este', 'esta', 'como', 'antes', 'todo',
  'oder', 'und', 'nicht', 'eine', 'einer', 'einem', 'einen', 'deine', 'dein', 'deiner', 'wird', 'sind', 'aber', 'noch', 'nur', 'mit', 'dich', 'sich', 'nach', 'jeden']);
let failures = 0;

function between(text, start, end) {
  const i = text.indexOf(start);
  if (i < 0) return '';
  const from = text.indexOf('\n', i) + 1;
  const j = text.indexOf(end, from);
  return text.slice(from, j < 0 ? undefined : j);
}

for (const lang of ['en', 'fr', 'es', 'de']) {
  const md = fs.readFileSync(path.join(ROOT, 'store-assets', lang, 'listing.md'), 'utf8');
  const desc = between(md, '## Description détaillée', '## Termes');
  const youtube = between(md, '**Description :**', '**Étiquettes');
  const problems = [];
  if (desc.length < 250) problems.push(`description trop courte (${desc.length})`);
  for (const [label, text] of [['description', desc], ['description YouTube', youtube]]) {
    const brand = text.match(BRANDS);
    if (brand) problems.push(`${label} : nom de marque « ${brand[0]} »`);
  }
  const counts = {};
  for (const w of desc.toLowerCase().match(/[\p{L}]{4,}/gu) || []) if (!IGNORED.has(w)) counts[w] = (counts[w] || 0) + 1;
  for (const [w, n] of Object.entries(counts)) if (n > MAX_REPEAT) problems.push(`« ${w} » répété ${n} fois`);
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${lang} (${desc.length} car.)${problems.length ? ' → ' + problems.join(' ; ') : ''}`);
  if (problems.length) failures++;
}
process.exit(failures ? 1 : 0);
