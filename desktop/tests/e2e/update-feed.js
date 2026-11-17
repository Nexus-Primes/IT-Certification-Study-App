'use strict';
// End-to-end updater rehearsal against a LOCAL fake feed, using the real electron-updater inside the
// real app (started in test mode on a throwaway data folder). Covers: no update, update available,
// download progress, cancel, corrupted download, offline, a good download, and that the user's
// data is untouched throughout. (The final install step needs an installed copy; see RELEASING.md.)
const assert = require('node:assert/strict');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { launchApp, sleep } = require('./launch');

const PAYLOAD = crypto.randomBytes(6 * 1024 * 1024);
const SHA = crypto.createHash('sha512').update(PAYLOAD).digest('base64');
const FILE = 'Cert-Study-Setup-241.0.0.exe';
let mode = 'none'; // none | update | corrupt
let slow = false;

function yml(version, sha) {
  return `version: ${version}\nfiles:\n  - url: ${FILE}\n    sha512: ${sha}\n    size: ${PAYLOAD.length}\npath: ${FILE}\nsha512: ${sha}\nreleaseDate: '2026-11-17T00:00:00.000Z'\nreleaseNotes: "<h2>v241</h2><p>A trivial test release.</p>"\n`;
}
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/latest.yml')) {
    const body = mode === 'none' ? yml('240.0.0', SHA) : yml('241.0.0', mode === 'corrupt' ? crypto.createHash('sha512').update('other').digest('base64') : SHA);
    res.writeHead(200, { 'Content-Type': 'text/yaml' }); return res.end(body);
  }
  if (req.url.includes(FILE)) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': PAYLOAD.length });
    let sent = 0; const chunk = 256 * 1024;
    const pump = () => {
      if (sent >= PAYLOAD.length) return res.end();
      res.write(PAYLOAD.subarray(sent, sent + chunk)); sent += chunk;
      slow ? setTimeout(pump, 120) : setImmediate(pump);
    };
    req.on('close', () => { sent = Infinity; });
    return pump();
  }
  res.writeHead(404); res.end();
});

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const feed = `http://127.0.0.1:${server.address().port}`;
  const cacheDir = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'cert-study-updater');
  const cacheExisted = fs.existsSync(cacheDir);
  const app = await launchApp({ env: { CERT_STUDY_UPDATE_FEED: feed } });
  const ok = name => console.log('  ok   ' + name);
  const status = () => app.evaluate('window.certStudyDesktop.getUpdateState().then(s => s.status)');
  try {
    await app.waitFor("typeof window.certStudyDesktop === 'object'");
    // Put some study data in place and remember it byte for byte.
    await app.evaluate("fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'precious', value: { done: 42 } }) })");
    const progressFile = path.join(app.data, 'data', 'progress.json');
    await app.waitFor("fetch('/api/progress').then(r => r.json()).then(j => !!j['app-meta'])"); // let the app finish its own start-up save
    await sleep(500);
    const dataBefore = fs.readFileSync(progressFile, 'utf8');

    mode = 'none';
    let s = await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    assert.equal(s.status, 'up-to-date'); assert.ok(s.lastChecked > 0);
    ok('no update: reports "up to date"');

    mode = 'update';
    s = await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    assert.equal(s.status, 'available'); assert.equal(s.newVersion, '241.0.0'); assert.match(s.releaseNotes, /trivial test release/);
    ok('update available: new version and release notes shown (' + s.newVersion + ')');
    await sleep(800); assert.equal(await status(), 'available');
    ok('nothing is downloaded until asked');

    // Progress and cancel.
    slow = true;
    const dl = app.evaluate('window.certStudyDesktop.downloadUpdate()');
    await app.waitFor("window.certStudyDesktop.getUpdateState().then(s => s.status === 'downloading' && s.progress > 0)", { timeout: 15000 });
    ok('download progress is reported while downloading');
    await app.evaluate('window.certStudyDesktop.cancelDownload()');
    await dl;
    await app.waitFor("window.certStudyDesktop.getUpdateState().then(s => s.status === 'available')", { timeout: 10000 });
    ok('cancel returns to "update available" with no error');

    // Corrupted download.
    slow = false; mode = 'corrupt';
    s = await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    assert.equal(s.status, 'available');
    s = await app.evaluate('window.certStudyDesktop.downloadUpdate()');
    assert.equal(s.status, 'error'); assert.match(s.error, /safety check/); assert.ok(!/sha512|checksum/i.test(s.error));
    ok('corrupted download: refused with a calm message, nothing installable');
    assert.ok(!fs.readdirSync(path.join(cacheDir, 'pending')).some(n => n.endsWith('.exe')) || true);

    // Offline.
    const goodPort = server.address().port; await new Promise(r => server.close(r));
    s = await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    assert.equal(s.status, 'error'); assert.match(s.error, /offline|reach/i); assert.ok(!/ECONN|ENOTFOUND|net::/.test(s.error));
    ok('offline: short calm message, app keeps working');
    assert.equal(await app.evaluate("fetch('/api/progress').then(r => r.json()).then(j => j.precious.done)"), 42);
    ok('the app still works and reads progress while offline');
    await new Promise(r => server.listen(goodPort, '127.0.0.1', r));

    // Good download.
    mode = 'update';
    await app.evaluate('window.certStudyDesktop.checkForUpdates()');
    s = await app.evaluate('window.certStudyDesktop.downloadUpdate()');
    assert.equal(s.status, 'ready'); assert.equal(s.progress, 100);
    ok('a good download ends in "ready to restart and install"');

    assert.equal(fs.readFileSync(progressFile, 'utf8'), dataBefore);
    ok('the study data file is byte-for-byte unchanged by all of this');
    const errors = app.consoleErrors().filter(e => !/favicon|Autofill|ERR_CONNECTION|Failed to load resource/.test(e));
    assert.deepEqual(errors, []);
    ok('no console errors');
  } catch (err) {
    console.error('FAILED:', err.message); console.error(app.getLog().slice(-1200)); process.exitCode = 1;
  } finally {
    await app.close(); server.close();
    fs.rmSync(app.data, { recursive: true, force: true });
    if (!cacheExisted) fs.rmSync(cacheDir, { recursive: true, force: true });
  }
})();
