'use strict';
// The real thing, locally: install the v240 installer silently into a throwaway folder, point the
// installed app at a local fake feed that offers the v241 installer, update from inside the app
// (check, download, restart and install), then prove the new version runs, the study data is
// untouched, a safety backup was taken, and an uninstall leaves the data alone.
//
//   node desktop/tests/e2e/install-update.js <dir with the 240 installer> <dir with the 241 installer> <scratch dir>
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');
const { launchApp, sleep } = require('./launch');

const [dir240, dir241, scratch] = process.argv.slice(2).map(p => path.resolve(p));
const installDir = path.join(scratch, 'install');
const exe = path.join(installDir, 'Cert Study.exe');
const dataDir = path.join(scratch, 'data-root');
const ok = name => console.log('  ok   ' + name);

const killInstalled = () => spawnSync('powershell', ['-NoProfile', '-Command', `Get-Process | Where-Object { $_.Path -like '${installDir.replace(/'/g, "''")}*' } | Stop-Process -Force`]);
async function waitUntil(fn, label, ms = 120000) { const end = Date.now() + ms; while (Date.now() < end) { try { const v = await fn(); if (v) return v; } catch { /* retry */ } await sleep(500); } throw new Error('timed out: ' + label); }
function installedVersion() {
  const asar = require('@electron/asar');
  return JSON.parse(asar.extractFile(path.join(installDir, 'resources', 'app.asar'), 'package.json').toString()).version;
}

(async () => {
  fs.rmSync(scratch, { recursive: true, force: true }); fs.mkdirSync(scratch, { recursive: true });
  const server = http.createServer((req, res) => {
    const file = path.join(dir241, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, ''));
    if (!file.startsWith(dir241) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Length': fs.statSync(file).size }); fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const feed = `http://127.0.0.1:${server.address().port}`;
  try {
    // 1. Silent per-user install of 240 (no admin prompt).
    const inst = spawnSync(path.join(dir240, 'Cert-Study-Setup-240.0.0.exe'), ['/S', `/D=${installDir}`], { timeout: 180000 });
    await waitUntil(() => fs.existsSync(exe), 'installed exe');
    await sleep(3000); killInstalled(); await sleep(1500);
    assert.equal(installedVersion(), '240.0.0'); ok('v240 installed silently without an administrator prompt (installer exit ' + inst.status + ')');

    // 2. Run it on test data, with study data in place.
    let app = await launchApp({ exe, dataDir, env: { CERT_STUDY_UPDATE_FEED: feed } });
    await app.waitFor("typeof window.certStudyDesktop === 'object'");
    await app.evaluate("fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'precious', value: { done: 42, text: 'caf\\u00e9' } }) })");
    await app.evaluate("fetch('/api/profiles/set-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: '2468' }) })");
    await app.evaluate("fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateKey: new Date().toISOString().slice(0, 10), version: 'v240' }) })");
    await app.waitFor("fetch('/api/progress').then(r => r.json()).then(j => !!j['app-meta'])");
    await sleep(600);
    const snap = f => fs.readFileSync(path.join(dataDir, f), 'utf8');
    const before = { progress: snap('data/progress.json'), profiles: snap('data/profiles.json'), backups: fs.readdirSync(path.join(dataDir, 'backup')) };
    assert.equal((await app.evaluate('window.certStudyDesktop.getInfo()')).version, '240.0.0'); ok('the installed copy runs as 240.0.0');

    // 3. Update from inside the app.
    let s = await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    assert.equal(s.status, 'available'); assert.equal(s.newVersion, '241.0.0'); ok('check finds 241.0.0');
    s = await app.evaluate('window.certStudyDesktop.downloadUpdate()');
    assert.equal(s.status, 'ready'); ok('download finishes and passes its checksum');
    assert.equal(installedVersion(), '240.0.0'); ok('nothing is installed until "Restart and install" is clicked');
    app.evaluate('window.certStudyDesktop.installUpdate()').catch(() => {});
    await waitUntil(() => installedVersion() === '241.0.0', 'new version on disk', 180000);
    ok('after "Restart and install" the installed program is 241.0.0');
    await sleep(4000); killInstalled(); await sleep(2000); await app.close().catch(() => {});

    // 4. Data intact, safety backup taken.
    assert.equal(snap('data/progress.json'), before.progress); assert.equal(snap('data/profiles.json'), before.profiles);
    assert.deepEqual(fs.readdirSync(path.join(dataDir, 'backup')), before.backups);
    ok('progress, accounts/PIN and backups are byte-for-byte unchanged');
    const safety = fs.readdirSync(path.join(dataDir, 'safety-backups')).filter(n => n.startsWith('before-update-241'));
    assert.equal(safety.length, 1); assert.equal(fs.readFileSync(path.join(dataDir, 'safety-backups', safety[0], 'data', 'progress.json'), 'utf8'), before.progress);
    ok('a safety copy of the data folder was made before installing (' + safety[0] + ')');

    // 5. The new version starts on the same data and sees the same progress.
    app = await launchApp({ exe, dataDir });
    await app.waitFor("typeof window.certStudyDesktop === 'object'");
    assert.equal((await app.evaluate('window.certStudyDesktop.getInfo()')).version, '241.0.0');
    assert.equal(await app.evaluate("fetch('/api/progress').then(r => r.json()).then(j => j.precious.text)"), 'café');
    assert.equal(await app.evaluate("fetch('/api/profiles/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: '2468' }) }).then(r => r.json()).then(j => j.ok)"), true);
    ok('241.0.0 starts on the same data: progress and PIN carried over');
    const upd = await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    ok('and now reports its own state: ' + upd.status);
    await app.close(); killInstalled(); await sleep(1500);

    // 6. Uninstall leaves the data folder alone.
    const un = path.join(installDir, 'Uninstall Cert Study.exe');
    spawnSync(un, ['/S', '--updated'], { timeout: 120000 });
    await waitUntil(() => !fs.existsSync(exe), 'uninstalled', 90000);
    assert.equal(snap('data/progress.json'), before.progress);
    ok('uninstalling removes the program but leaves the data folder untouched');
  } catch (err) { console.error('FAILED:', err.message); process.exitCode = 1; }
  finally { killInstalled(); server.close(); }
})();
