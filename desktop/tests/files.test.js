'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { addToShelf, backupEverything, uniqueName } = require('../files');
const { createBackend } = require('../backend');
const { APP_ROOT, tempDir, rmrf } = require('./helpers');

test('adding files copies them into the shelf and leaves the originals alone', () => {
  const root = tempDir('shelf'); const src = tempDir('src');
  try {
    fs.writeFileSync(path.join(src, 'Manual.pdf'), 'pdf'); fs.writeFileSync(path.join(src, '.secret'), 'x');
    fs.mkdirSync(path.join(src, 'Folder')); fs.writeFileSync(path.join(src, 'Folder', 'a.txt'), 'a');
    const r = addToShelf({ dataRoot: root, sources: [path.join(src, 'Manual.pdf'), path.join(src, '.secret'), path.join(src, 'Folder'), path.join(src, 'missing.pdf')] });
    assert.deepEqual(r.added.sort(), ['Folder/a.txt', 'Manual.pdf']);
    assert.equal(r.skipped.length, 2);
    assert.ok(fs.existsSync(path.join(src, 'Manual.pdf')), 'the original is still there');
    // The shelf listing (the same code the app uses) sees them.
    const be = createBackend({ dataRoot: root, appRoot: APP_ROOT });
    const listed = JSON.parse(be.handle('GET', '/api/files').body.toString()).files.map(f => f.path);
    assert.deepEqual(listed, ['Folder/a.txt', 'Manual.pdf']);
  } finally { rmrf(root); rmrf(src); }
});

test('a name that is taken gets a number; nothing is ever overwritten', () => {
  const root = tempDir('shelf'); const src = tempDir('src');
  try {
    fs.writeFileSync(path.join(src, 'Notes.txt'), 'new');
    fs.mkdirSync(path.join(root, 'files')); fs.writeFileSync(path.join(root, 'files', 'Notes.txt'), 'old');
    const r = addToShelf({ dataRoot: root, sources: [path.join(src, 'Notes.txt')] });
    assert.deepEqual(r.added, ['Notes (2).txt']);
    assert.equal(fs.readFileSync(path.join(root, 'files', 'Notes.txt'), 'utf8'), 'old');
    assert.equal(uniqueName(path.join(root, 'files'), 'Notes.txt'), 'Notes (3).txt');
  } finally { rmrf(root); rmrf(src); }
});

test('refuses relative paths, non-strings and files from inside the app data folder', () => {
  const root = tempDir('shelf');
  try {
    fs.mkdirSync(path.join(root, 'data')); fs.writeFileSync(path.join(root, 'data', 'progress.json'), '{}');
    const r = addToShelf({ dataRoot: root, sources: ['relative/file.pdf', 42, null, path.join(root, 'data', 'progress.json')] });
    assert.deepEqual(r.added, []); assert.equal(r.skipped.length, 4);
  } finally { rmrf(root); }
});

test('back up everything makes a dated copy of data, backups and shelf, and changes nothing', () => {
  const root = tempDir('app'); const dest = tempDir('dest');
  try {
    fs.mkdirSync(path.join(root, 'data')); fs.mkdirSync(path.join(root, 'backup')); fs.mkdirSync(path.join(root, 'files'));
    fs.writeFileSync(path.join(root, 'data', 'progress.json'), '{"a":1}'); fs.writeFileSync(path.join(root, 'data', 'profiles.json'), '{"pinHash":null,"profiles":[]}');
    fs.writeFileSync(path.join(root, 'backup', 'cert-study-backup-v1-2026-01-01.json'), '{}'); fs.writeFileSync(path.join(root, 'files', 'm.pdf'), 'pdf');
    fs.mkdirSync(path.join(root, 'Cache')); fs.writeFileSync(path.join(root, 'Cache', 'junk'), 'x');
    const r = backupEverything({ dataRoot: root, destDir: dest, now: new Date(2026, 0, 2, 3, 4, 5) });
    assert.equal(r.ok, true); assert.equal(r.files, 4);
    assert.equal(path.basename(r.folder), 'Cert Study backup 20260102-030405');
    assert.equal(fs.readFileSync(path.join(r.folder, 'data', 'progress.json'), 'utf8'), '{"a":1}');
    assert.ok(fs.existsSync(path.join(r.folder, 'files', 'm.pdf')));
    assert.ok(!fs.existsSync(path.join(r.folder, 'Cache')), 'browser cache files are not part of a backup');
    assert.equal(fs.readFileSync(path.join(root, 'data', 'progress.json'), 'utf8'), '{"a":1}');
  } finally { rmrf(root); rmrf(dest); }
});

test('back up everything refuses a destination inside the data folder or a missing one', () => {
  const root = tempDir('app');
  try {
    fs.mkdirSync(path.join(root, 'data'));
    assert.equal(backupEverything({ dataRoot: root, destDir: path.join(root, 'data') }).ok, false);
    assert.equal(backupEverything({ dataRoot: root, destDir: path.join(root, 'nope') }).ok, false);
    assert.equal(backupEverything({ dataRoot: root, destDir: undefined }).ok, false);
  } finally { rmrf(root); }
});
