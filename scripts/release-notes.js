'use strict';
// Prints the newest app/changelog.js entry as Markdown, for the GitHub release body (which the
// in-app updater shows as "what's new"). Usage: node scripts/release-notes.js > release-notes.md
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const { CHANGELOG } = await import(pathToFileURL(path.join(__dirname, '..', 'app', 'changelog.js')).href);
  const top = CHANGELOG[0];
  const lines = [`## ${top.version}: ${top.title}`, '', ...top.items.map(item => `- ${item}`), '',
    'Windows installer: Cert-Study-Setup file below. The installer is not code-signed, so Windows SmartScreen may say "unknown publisher": choose More info, then Run anyway.'];
  process.stdout.write(lines.join('\n') + '\n');
})();
