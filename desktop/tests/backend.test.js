'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { startHttpServer } = require('../http-server');
const { planBackupPruning, parseBackupName } = require('../backend');
const { APP_ROOT, tempDir, rmrf, call } = require('./helpers');

async function withServer(fn) {
  const dataRoot = tempDir('data');
  const s = await startHttpServer({ dataRoot, appRoot: APP_ROOT });
  try { await fn(s.port, dataRoot); } finally { await s.close(); rmrf(dataRoot); }
}

test('saving progress: tracks stay separate, a bad save is rejected', () => withServer(async port => {
  assert.deepEqual((await call(port, 'GET', '/api/progress')).json, {});
  await call(port, 'POST', '/api/progress', { key: 'a', value: { n: 1 } });
  await call(port, 'POST', '/api/progress', { key: 'b', value: [1, 2] });
  await call(port, 'POST', '/api/progress', { key: 'a', value: { n: 2 } });
  assert.deepEqual((await call(port, 'GET', '/api/progress')).json, { a: { n: 2 }, b: [1, 2] });
  assert.equal((await call(port, 'POST', '/api/progress', { key: 'a' })).status, 400);
  assert.equal((await call(port, 'POST', '/api/progress', 'not json')).status, 400);
}));

test('accounts: new default is neutral, ids are server made, unknown ids fall back', () => withServer(async port => {
  const first = (await call(port, 'GET', '/api/profiles')).json;
  assert.equal(first.defaultId, 'default'); assert.equal(first.hasPin, false);
  assert.equal(first.profiles[0].name, 'Student');
  const made = (await call(port, 'POST', '/api/profiles', { name: '  Sam  ' })).json;
  assert.match(made.profile.id, /^p[0-9a-f]{12}$/); assert.equal(made.profile.name, 'Sam');
  assert.equal((await call(port, 'POST', '/api/profiles', { name: '   ' })).status, 400);
  await call(port, 'POST', '/api/progress', { key: 'k', value: 1, profile: made.profile.id });
  await call(port, 'POST', '/api/progress', { key: 'd', value: 2 });
  assert.deepEqual((await call(port, 'GET', `/api/progress?profile=${made.profile.id}`)).json, { k: 1 });
  assert.deepEqual((await call(port, 'GET', '/api/progress?profile=../../etc')).json, { d: 2 });
  assert.equal((await call(port, 'POST', '/api/profiles/delete', { id: 'default' })).status, 400);
  assert.equal((await call(port, 'POST', '/api/profiles/delete', { id: 'nope' })).status, 404);
  assert.equal((await call(port, 'POST', '/api/profiles/delete', { id: made.profile.id })).status, 200);
}));

test('PIN: set, verify, change needs the current one, clear', () => withServer(async port => {
  assert.equal((await call(port, 'POST', '/api/profiles/set-pin', { pin: '12' })).status, 400);
  assert.equal((await call(port, 'POST', '/api/profiles/set-pin', { pin: '1234' })).json.hasPin, true);
  assert.equal((await call(port, 'POST', '/api/profiles/verify-pin', { pin: '1234' })).json.ok, true);
  assert.equal((await call(port, 'POST', '/api/profiles/verify-pin', { pin: '9999' })).json.ok, false);
  assert.equal((await call(port, 'POST', '/api/profiles/set-pin', { pin: null })).status, 403);
  assert.equal((await call(port, 'POST', '/api/profiles/set-pin', { pin: '5678', currentPin: '1234' })).status, 200);
  assert.equal((await call(port, 'POST', '/api/profiles/set-pin', { pin: null, currentPin: '5678' })).json.hasPin, false);
}));

const todayText = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

test('backups: safe names, listing, hostile input refused, pre-restore kept', () => withServer(async (port, dataRoot) => {
  const b = (await call(port, 'POST', '/api/backup', { dateKey: todayText(), version: 'v1', x: 1 })).json;
  assert.equal(b.filename, `cert-study-backup-v1-${todayText()}.json`);
  assert.equal((await call(port, 'POST', '/api/backup', { dateKey: '../../x', version: 'v1' })).status, 400);
  assert.equal((await call(port, 'POST', '/api/backup', { dateKey: todayText(), version: '../../evil' })).json.filename, `cert-study-backup-....evil-${todayText()}.json`); // same as server.py: slashes go, dots stay, no path left
  const pre = (await call(port, 'POST', '/api/backup', { dateKey: todayText(), version: 'v1', kind: 'pre-restore' })).json;
  assert.match(pre.filename, /^cert-study-prerestore-v1-\d{4}-\d{2}-\d{2}-\d{6}\.json$/);
  const list = (await call(port, 'GET', '/api/backups')).json;
  assert.equal(list.backups.length, 3); assert.equal(list.keepAllDays, 30);
  assert.equal(list.backups.find(x => x.name === pre.filename).kind, 'pre-restore');
  assert.equal((await call(port, 'GET', `/api/backup-file?name=${b.filename}`)).json.x, 1);
  for (const bad of ['../data/progress.json', '..%2F..%2Fserver.py', 'nothing.json', '']) assert.equal((await call(port, 'GET', `/api/backup-file?name=${bad}`)).status, 404, bad);
  assert.ok(fs.existsSync(path.join(dataRoot, 'backup', b.filename)));
}));

test('backup thinning follows the 30 day / weekly / monthly rule', () => {
  const e = (date, n = 0) => ({ name: `b-${date}`, date, modified: n });
  assert.deepEqual(planBackupPruning([e('2026-06-01'), e('2026-06-10')], '2026-06-30'), []);
  const week = planBackupPruning([e('2026-03-02'), e('2026-03-03'), e('2026-03-04')], '2026-06-30');
  assert.deepEqual(week.sort(), ['b-2026-03-02', 'b-2026-03-03']);
  assert.deepEqual(planBackupPruning([e('2025-10-01'), e('2025-10-20')], '2026-06-30'), ['b-2025-10-01']);
  assert.deepEqual(planBackupPruning([e('2026-12-01')], '2026-06-30'), []);
  assert.equal(parseBackupName('cert-study-backup-v1-2026-13-45.json'), null);
  assert.equal(parseBackupName('notes.json'), null);
  assert.equal(parseBackupName('cert-study-backup-pabcdef012345-v1-2026-01-01.json').profile, 'pabcdef012345');
});

test('document shelf: sorted, forward slashes, no hidden files, depth limit, no absolute paths', () => withServer(async (port, dataRoot) => {
  assert.deepEqual((await call(port, 'GET', '/api/files')).json, { files: [], folderExists: false });
  const files = path.join(dataRoot, 'files');
  fs.mkdirSync(path.join(files, 'b', 'c', 'd', 'e', 'f'), { recursive: true });
  fs.writeFileSync(path.join(files, 'Zed.pdf'), 'z'); fs.writeFileSync(path.join(files, 'alpha é.pdf'), 'aa');
  fs.writeFileSync(path.join(files, '.hidden'), 'h'); fs.writeFileSync(path.join(files, 'b', 'c', 'in.txt'), 'i');
  fs.writeFileSync(path.join(files, 'b', 'c', 'd', 'e', 'f', 'toodeep.txt'), 't');
  const r = (await call(port, 'GET', '/api/files')).json;
  assert.equal(r.folderExists, true);
  assert.deepEqual(r.files.map(f => f.path), ['alpha é.pdf', 'b/c/in.txt', 'Zed.pdf']);
  assert.ok(r.files.every(f => !f.path.includes(':') && typeof f.size === 'number' && typeof f.modified === 'number'));
  const served = await call(port, 'GET', '/files/' + encodeURIComponent('alpha é.pdf'));
  assert.equal(served.status, 200); assert.equal(served.text, 'aa');
  assert.equal((await call(port, 'GET', '/files/..%2Fdata%2Fprogress.json')).status, 404);
}));

test('avatar: jpeg only, deletable, served; progress/profiles/backups are never served as static files', () => withServer(async port => {
  const jpeg = 'data:image/jpeg;base64,' + Buffer.from('fakejpeg').toString('base64');
  assert.equal((await call(port, 'POST', '/api/avatar', { dataUrl: jpeg })).status, 200);
  assert.equal((await call(port, 'GET', '/data/avatar.jpg')).text, 'fakejpeg');
  assert.equal((await call(port, 'POST', '/api/avatar', { dataUrl: 'data:image/png;base64,AAAA' })).status, 400);
  assert.equal((await call(port, 'POST', '/api/avatar', { dataUrl: 'data:image/jpeg;base64,@@@' })).status, 400);
  assert.equal((await call(port, 'POST', '/api/avatar', { dataUrl: null })).status, 200);
  assert.equal((await call(port, 'GET', '/data/avatar.jpg')).status, 404);
  for (const p of ['/data/progress.json', '/data/profiles.json', '/server.py', '/backup/x.json', '/app/../server.py', '/app/%2e%2e/server.py']) assert.equal((await call(port, 'GET', p)).status, 404, p);
}));

test('app icon svg validates shape and color', () => withServer(async port => {
  await call(port, 'POST', '/api/progress', { key: 'app-meta', value: { appIconShape: 'bolt', appIconColor: '#ff0000' } });
  let svg = (await call(port, 'GET', '/api/app-icon.svg')).text;
  assert.match(svg, /fill="#ff0000"/);
  await call(port, 'POST', '/api/progress', { key: 'app-meta', value: { appIconShape: '"><script>', appIconColor: 'red"onload=' } });
  svg = (await call(port, 'GET', '/api/app-icon.svg')).text;
  assert.match(svg, /fill="#2dd4bf"/); assert.ok(!svg.includes('<script'));
}));

test('front-end files are served, an unknown path is 404', () => withServer(async port => {
  const idx = await call(port, 'GET', '/'); assert.equal(idx.status, 200); assert.match(idx.type, /text\/html/);
  assert.equal((await call(port, 'GET', '/app/app.js')).status, 200);
  assert.equal((await call(port, 'GET', '/nothing')).status, 404);
}));
