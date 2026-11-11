// Génère dist/link-catcher-<version>.zip avec uniquement les fichiers de l'extension.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const files = ['manifest.json', 'background.js', 'shared.js', 'i18n.js', 'popup.html', 'popup.css', 'popup.js', 'icons', '_locales'];
const out = path.join(root, 'dist', `link-catcher-${manifest.version}.zip`);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.rmSync(out, { force: true });
execFileSync('zip', ['-r', '-X', out, ...files], { cwd: root, stdio: 'inherit' });
console.log('Package prêt :', path.relative(root, out));
