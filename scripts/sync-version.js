'use strict';
// One source of truth for the version: APP_VERSION in app/app.js (for example 'v239').
// package.json needs semver for electron-builder and electron-updater, so 'v239' becomes '239.0.0'.
//
//   node scripts/sync-version.js           write package.json (and package-lock.json) to match
//   node scripts/sync-version.js --check   exit 1 if anything has drifted (used by the tests)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readAppVersion() {
  const text = fs.readFileSync(path.join(root, 'app', 'app.js'), 'utf8');
  const match = /const APP_VERSION = 'v(\d+)';/.exec(text);
  if (!match) throw new Error("Could not find APP_VERSION = 'vNNN' in app/app.js");
  return match[1];
}
const semverFor = counter => `${counter}.0.0`;

function jsonWithEol(file, mutate) {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  mutate(data);
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  return JSON.stringify(data, null, 2).replace(/\n/g, eol) + (raw.endsWith('\n') ? eol : '');
}

function run(check) {
  const counter = readAppVersion();
  const semver = semverFor(counter);
  const problems = [];
  const targets = [
    ['package.json', d => { d.version = semver; }],
    ['package-lock.json', d => { d.version = semver; if (d.packages && d.packages['']) d.packages[''].version = semver; }]
  ];
  for (const [name, mutate] of targets) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    const next = jsonWithEol(file, mutate);
    if (next !== fs.readFileSync(file, 'utf8')) {
      if (check) problems.push(`${name} is not at ${semver}`); else fs.writeFileSync(file, next);
    }
  }
  const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  if (!sw.includes(`const CACHE = 'cert-study-v${counter}';`)) problems.push(`service-worker.js CACHE is not cert-study-v${counter}`);
  if (check) {
    if (problems.length) { console.error('Version drift:\n  ' + problems.join('\n  ')); process.exit(1); }
    console.log(`Versions agree: v${counter} = ${semver}`);
  } else {
    console.log(`package.json is now ${semver} (from APP_VERSION v${counter})`);
  }
}

if (require.main === module) run(process.argv.includes('--check'));
module.exports = { readAppVersion, semverFor };
