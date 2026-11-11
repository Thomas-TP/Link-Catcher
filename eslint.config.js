const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'dist/**'] },
  js.configs.recommended,
  {
    files: ['background.js', 'shared.js', 'popup.js', 'i18n.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.serviceworker, chrome: 'readonly', importScripts: 'readonly' }
    },
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^(LC|i18nData)$' }], 'no-redeclare': 'off' }
  },
  {
    files: ['eslint.config.js', 'scripts/**', 'tests/**'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node, chrome: 'readonly' } }
  }
];
