'use strict';
// Runs the same requests against the real Python server.py and the Node port, each on its own
// empty data folder, and requires identical status codes, JSON bodies and on-disk file bytes.
// Skipped when no Python 3 is available.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { startHttpServer } = require('../http-server');
const { APP_ROOT, tempDir, rmrf, call } = require('./helpers');

function findPython() {
  for (const cmd of [['py', '-3.12'], ['python'], ['python3'], ['py', '-3']]) {
    const r = spawnSync(cmd[0], [...cmd.slice(1), '-c', 'import sys;print(sys.version_info[0])'], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim() === '3') return cmd;
  }
  return null;
}
const python = findPython();

function freePort() {
  return new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
}

async function startPython(dir) {
  fs.copyFileSync(path.join(APP_ROOT, 'server.py'), path.join(dir, 'server.py'));
  const port = await freePort();
  const code = 'import sys, webbrowser\nwebbrowser.open = lambda *a, **k: None\nsys.path.insert(0, sys.argv[1])\nimport server\nwith server.Server(("127.0.0.1", int(sys.argv[2])), server.Handler) as h:\n    h.serve_forever()\n';
  const child = spawn(python[0], [...python.slice(1), '-c', code, dir, String(port)], { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) {
    try { await fetch(`http://127.0.0.1:${port}/api/profiles`); return { port, close: () => child.kill() }; } catch { await new Promise(r => setTimeout(r, 100)); }
  }
  child.kill(); throw new Error('python server did not start');
}

const norm = (value, ids) => {
  let text = JSON.stringify(value);
  for (const id of ids) text = text.split(id).join('<PID>');
  text = text.replace(/"createdAt":"[^"]+"/g, '"createdAt":"<T>"').replace(/-\d{6}\.json/g, '-<S>.json').replace(/"modified":[0-9.]+/g, '"modified":"<N>"').replace(/"size":\d+/g, '"size":"<Z>"').replace(/"stamp":"\d{6}"/g, '"stamp":"<S>"');
  return JSON.parse(text);
};

async function script(port) {
  const out = []; const ids = [];
  const step = async (label, method, url, body) => {
    const r = await call(port, method, url, typeof url === 'function' ? undefined : body);
    // A bare 404 has different (HTML vs empty) bodies; only its status is part of the contract.
    const bare404 = r.status === 404 && !r.json;
    out.push({ label, status: r.status, json: r.json, text: r.json || bare404 ? undefined : r.text, type: bare404 ? undefined : r.type });
    return r;
  };
  await step('profiles at start', 'GET', '/api/profiles');
  await step('progress empty', 'GET', '/api/progress');
  await step('save unicode', 'POST', '/api/progress', { key: 'track', value: { name: 'caf\u00e9 \u2603 \ud83d\ude00', n: [1, 2.5, null, true], nested: { a: {} , b: [] } } });
  await step('save second key', 'POST', '/api/progress', { key: 'app-meta', value: { appIconShape: 'brain', appIconColor: '#112233' } });
  await step('bad save', 'POST', '/api/progress', { key: 'x' });
  await step('not json', 'POST', '/api/progress', 'nope');
  await step('read back', 'GET', '/api/progress');
  await step('icon', 'GET', '/api/app-icon.svg');
  const made = await step('create account', 'POST', '/api/profiles', { name: '  Zo\u00eb  ' });
  const pid = made.json.profile.id; ids.push(pid);
  await step('create with blank name', 'POST', '/api/profiles', { name: '   ' });
  const long = await step('create with long name', 'POST', '/api/profiles', { name: 'x'.repeat(60) });
  ids.push(long.json.profile.id);
  await step('save to account', 'POST', '/api/progress', { key: 'k', value: 7, profile: pid });
  await step('read account', 'GET', `/api/progress?profile=${pid}`);
  await step('unknown account falls back', 'GET', '/api/progress?profile=zzz');
  await step('verify pin none', 'POST', '/api/profiles/verify-pin', { pin: 'x' });
  await step('set pin bad', 'POST', '/api/profiles/set-pin', { pin: 'abc' });
  await step('set pin', 'POST', '/api/profiles/set-pin', { pin: '2468' });
  await step('profiles with pin', 'GET', '/api/profiles');
  await step('verify wrong', 'POST', '/api/profiles/verify-pin', { pin: '0000' });
  await step('verify right', 'POST', '/api/profiles/verify-pin', { pin: '2468' });
  await step('clear without current', 'POST', '/api/profiles/set-pin', { pin: null });
  await step('clear with current', 'POST', '/api/profiles/set-pin', { pin: null, currentPin: '2468' });
  await step('set-pin array body', 'POST', '/api/profiles/set-pin', [1]);
  await step('backup', 'POST', '/api/backup', { dateKey: '2026-05-01', version: 'v239', data: { a: 'caf\u00e9' } });
  await step('backup other account', 'POST', '/api/backup', { dateKey: '2026-05-01', version: 'v239', profile: pid });
  await step('backup hostile version', 'POST', '/api/backup', { dateKey: '2026-05-02', version: '../../evil/x y' });
  await step('backup empty version', 'POST', '/api/backup', { dateKey: '2026-05-04', version: '' });
  await step('backup bad date', 'POST', '/api/backup', { dateKey: '2026/05/01' });
  await step('backup pre-restore', 'POST', '/api/backup', { dateKey: '2026-05-03', version: 'v239', kind: 'pre-restore' });
  await step('old backups for thinning', 'POST', '/api/backup', { dateKey: '2025-01-02', version: 'v1' });
  await step('old backups for thinning 2', 'POST', '/api/backup', { dateKey: '2025-01-03', version: 'v1' });
  await step('backup list', 'GET', '/api/backups');
  await step('backup list account', 'GET', `/api/backups?profile=${pid}`);
  await step('backup file', 'GET', '/api/backup-file?name=cert-study-backup-v239-2026-05-01.json');
  for (const bad of ['../data/progress.json', '..%2F..%2Fserver.py', 'nothing.json', '', `cert-study-backup-${pid}-v239-2026-05-01.json`]) await step(`backup file refused ${bad}`, 'GET', `/api/backup-file?name=${bad}`);
  await step('avatar bad', 'POST', '/api/avatar', { dataUrl: 'data:image/png;base64,AAAA' });
  await step('avatar bad b64', 'POST', '/api/avatar', { dataUrl: 'data:image/jpeg;base64,@@' });
  await step('avatar missing', 'POST', '/api/avatar', {});
  await step('avatar ok', 'POST', '/api/avatar', { dataUrl: 'data:image/jpeg;base64,' + Buffer.from('jpegbytes').toString('base64') });
  await step('avatar served', 'GET', '/data/avatar.jpg');
  await step('avatar remove', 'POST', '/api/avatar', { dataUrl: null });
  await step('files none', 'GET', '/api/files');
  await step('delete default', 'POST', '/api/profiles/delete', { id: 'default' });
  await step('delete unknown', 'POST', '/api/profiles/delete', { id: 'nope' });
  await step('delete account', 'POST', '/api/profiles/delete', { id: pid });
  await step('profiles end', 'GET', '/api/profiles');
  await step('unknown post', 'POST', '/api/nothing', {});
  await step('unknown get', 'GET', '/api/nothing');
  return { out, ids };
}

test('Node backend matches server.py request for request', { skip: python ? false : 'no Python 3 found' }, async () => {
  const pyDir = tempDir('py'); const nodeDir = tempDir('node');
  const py = await startPython(pyDir);
  const nd = await startHttpServer({ dataRoot: nodeDir, appRoot: APP_ROOT });
  try {
    const a = await script(py.port); const b = await script(nd.port);
    assert.equal(a.out.length, b.out.length);
    for (let i = 0; i < a.out.length; i++) {
      const pa = norm(a.out[i], a.ids); const pb = norm(b.out[i], b.ids);
      assert.deepEqual({ ...pb, type: pb.type && pb.type.split(';')[0] }, { ...pa, type: pa.type && pa.type.split(';')[0] }, `step "${a.out[i].label}"`);
    }
    // Same files on disk, byte for byte (after swapping the random account id).
    // Python on Windows writes CRLF line ends; the content is otherwise identical, so compare with LF.
    const read = (dir, rel, ids) => {
      let t = fs.readFileSync(path.join(dir, rel), 'utf8').replace(/\r\n/g, '\n');
      for (const id of ids) t = t.split(id).join('<PID>');
      return t.replace(/"createdAt": "[^"]+"/g, '"createdAt": "<T>"');
    };
    const listing = dir => fs.readdirSync(path.join(dir, 'data')).sort().join(',').replace(/p[0-9a-f]{12}/g, '<PID>');
    assert.equal(listing(nodeDir), listing(pyDir));
    for (const rel of ['data/progress.json', 'data/profiles.json']) assert.equal(read(nodeDir, rel, b.ids), read(pyDir, rel, a.ids), rel);
    const backups = dir => fs.readdirSync(path.join(dir, 'backup')).map(n => n.replace(/-\d{6}\.json$/, '-<S>.json').replace(/p[0-9a-f]{12}/, '<PID>')).sort();
    assert.deepEqual(backups(nodeDir), backups(pyDir));
    assert.equal(read(nodeDir, 'backup/cert-study-backup-unknown-2026-05-04.json', []), read(pyDir, 'backup/cert-study-backup-unknown-2026-05-04.json', []));
  } finally { py.close(); await nd.close(); rmrf(pyDir); rmrf(nodeDir); }
});
