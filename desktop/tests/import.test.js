'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { importLegacyData, inspect } = require('../import-data');
const { createBackend } = require('../backend');
const { APP_ROOT, tempDir, rmrf } = require('./helpers');

// Synthetic old setup. Never the real files.
function makeLegacy(root, { layout = 'study-app' } = {}) {
  const data = layout === 'study-app' ? path.join(root, 'data') : root;
  fs.mkdirSync(data, { recursive: true });
  fs.writeFileSync(path.join(data, 'progress.json'), JSON.stringify({ track: { n: 1 } }, null, 2));
  fs.writeFileSync(path.join(data, 'progress-pabcdef012345.json'), JSON.stringify({ k: 2 }));
  fs.writeFileSync(path.join(data, 'profiles.json'), JSON.stringify({ pinHash: 'abc', profiles: [{ id: 'default', name: 'Old Name', createdAt: null }, { id: 'pabcdef012345', name: 'Second', createdAt: 'x' }] }));
  fs.writeFileSync(path.join(data, 'avatar.jpg'), 'jpg');
  fs.writeFileSync(path.join(data, 'secret-notes.txt'), 'not ours'); // unrelated file must not travel
  fs.writeFileSync(path.join(data, 'concepts.js'), 'window.x=1');      // app data must not travel
  fs.mkdirSync(path.join(root, 'backup'), { recursive: true });
  fs.writeFileSync(path.join(root, 'backup', 'cert-study-backup-v1-2026-01-01.json'), '{}');
  fs.mkdirSync(path.join(root, 'files', 'sub'), { recursive: true });
  fs.writeFileSync(path.join(root, 'files', 'sub', 'a.pdf'), 'pdf');
}

test('imports a whole old study-app folder: accounts, PIN registry, avatar, backups, shelf', () => {
  const src = tempDir('legacy'); const dst = tempDir('dst'); makeLegacy(src);
  try {
    const before = fs.readFileSync(path.join(src, 'data', 'progress.json'), 'utf8');
    const r = importLegacyData({ sourceDir: src, dataRoot: dst });
    assert.equal(r.ok, true); assert.deepEqual({ a: r.copied.accounts, b: r.copied.backups, f: r.copied.files }, { a: 2, b: 1, f: 1 });
    assert.equal(fs.readFileSync(path.join(dst, 'data', 'progress.json'), 'utf8'), before);
    assert.ok(fs.existsSync(path.join(dst, 'data', 'progress-pabcdef012345.json')));
    assert.ok(fs.existsSync(path.join(dst, 'data', 'avatar.jpg')));
    assert.ok(fs.existsSync(path.join(dst, 'backup', 'cert-study-backup-v1-2026-01-01.json')));
    assert.ok(fs.existsSync(path.join(dst, 'files', 'sub', 'a.pdf')));
    assert.ok(!fs.existsSync(path.join(dst, 'data', 'secret-notes.txt')) && !fs.existsSync(path.join(dst, 'data', 'concepts.js')));
    assert.equal(fs.readFileSync(path.join(src, 'data', 'progress.json'), 'utf8'), before, 'the source is untouched (copy, never move)');
    // And the backend reads it as a normal setup, keeping the old name and PIN.
    const be = createBackend({ dataRoot: dst, appRoot: APP_ROOT });
    const profiles = JSON.parse(be.handle('GET', '/api/profiles').body.toString());
    assert.equal(profiles.profiles[0].name, 'Old Name'); assert.equal(profiles.hasPin, true);
  } finally { rmrf(src); rmrf(dst); }
});

test('also accepts a flat "legacy data" folder, and takes a safety backup of what was there', () => {
  const src = tempDir('flat'); const dst = tempDir('dst'); makeLegacy(src, { layout: 'flat' });
  try {
    fs.mkdirSync(path.join(dst, 'data'), { recursive: true }); fs.writeFileSync(path.join(dst, 'data', 'progress.json'), '{"existing":1}');
    const r = importLegacyData({ sourceDir: src, dataRoot: dst, now: new Date(2026, 5, 1, 12, 0, 0) });
    assert.equal(r.ok, true);
    assert.match(path.basename(r.safetyBackup), /^before-import-20260601-120000$/);
    assert.equal(fs.readFileSync(path.join(r.safetyBackup, 'data', 'progress.json'), 'utf8'), '{"existing":1}');
    assert.notEqual(fs.readFileSync(path.join(dst, 'data', 'progress.json'), 'utf8'), '{"existing":1}');
  } finally { rmrf(src); rmrf(dst); }
});

test('refuses: empty folder, damaged files, the app\'s own folder, a missing folder', () => {
  const empty = tempDir('empty'); const dst = tempDir('dst'); const bad = tempDir('bad');
  try {
    assert.equal(inspect(empty, dst).ok, false);
    fs.writeFileSync(path.join(bad, 'progress.json'), '{ not json'); fs.writeFileSync(path.join(bad, 'profiles.json'), '[]');
    assert.equal(importLegacyData({ sourceDir: bad, dataRoot: dst }).ok, false);
    assert.equal(importLegacyData({ sourceDir: dst, dataRoot: dst }).ok, false);
    assert.equal(importLegacyData({ sourceDir: path.join(dst, 'nope'), dataRoot: dst }).ok, false);
    assert.ok(!fs.existsSync(path.join(dst, 'safety-backups')), 'a refused import changes nothing');
  } finally { rmrf(empty); rmrf(dst); rmrf(bad); }
});

test('skips a damaged account file but imports the good ones and says so', () => {
  const src = tempDir('legacy'); const dst = tempDir('dst'); makeLegacy(src);
  try {
    fs.writeFileSync(path.join(src, 'data', 'progress-pabcdef012345.json'), 'garbage');
    const r = importLegacyData({ sourceDir: src, dataRoot: dst });
    assert.equal(r.ok, true); assert.equal(r.copied.accounts, 1); assert.deepEqual(r.copied.skipped, ['progress-pabcdef012345.json']);
  } finally { rmrf(src); rmrf(dst); }
});
