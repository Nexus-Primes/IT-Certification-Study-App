'use strict';
// Real-app smoke test: launches Electron on a temp data folder and checks the checkpoint list:
// dashboard loads, progress saves to disk, backups work, accounts + PIN, document shelf, bridge.
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { launchApp } = require('./launch');

(async () => {
  const app = await launchApp();
  const results = [];
  const ok = (name) => { results.push(name); console.log('  ok   ' + name); };
  try {
    await app.waitFor("document.querySelector('main') && document.body.innerText.length > 200");
    ok('the app window loads the dashboard from app://cert-study');
    assert.equal(await app.evaluate('location.origin'), 'app://cert-study');
    assert.equal(await app.evaluate('typeof window.certStudyDesktop'), 'object');
    assert.equal(await app.evaluate('typeof require + typeof process'), 'undefinedundefined');
    ok('the page has the bridge but no Node (require/process are undefined)');
    const info = await app.evaluate('window.certStudyDesktop.getInfo()');
    assert.equal(info.version, JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'package.json'), 'utf8')).version);
    ok('the bridge reports the package version ' + info.version);
    assert.equal(await app.evaluate("document.documentElement.dataset.desktop"), 'on');
    // New install: neutral first account.
    const profiles = await app.evaluate("fetch('/api/profiles').then(r => r.json())");
    assert.equal(profiles.profiles[0].name, 'Student');
    ok('a new install starts with the neutral account "Student"');
    // Save through the real page and read it from disk.
    await app.evaluate("fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'smoke', value: { n: 1 } }) }).then(r => r.json())");
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(app.data, 'data', 'progress.json'), 'utf8')).smoke, { n: 1 });
    ok('progress saves to the data folder on disk');
    // Backup through the API from the page.
    const b = await app.evaluate("fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateKey: new Date().toISOString().slice(0, 10), version: 'vTEST' }) }).then(r => r.json())");
    assert.ok(fs.existsSync(path.join(app.data, 'backup', b.filename)));
    ok('a backup file is written to backup/');
    // Accounts and PIN.
    const made = await app.evaluate("fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Second' }) }).then(r => r.json())");
    await app.evaluate("fetch('/api/profiles/set-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: '1357' }) }).then(r => r.json())");
    assert.equal(await app.evaluate("fetch('/api/profiles/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: '0000' }) }).then(r => r.json()).then(j => j.ok)"), false);
    assert.equal(await app.evaluate("fetch('/api/profiles/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: '1357' }) }).then(r => r.json()).then(j => j.ok)"), true);
    ok('a second account can be made and the PIN gate accepts only the right PIN (' + made.profile.name + ')');
    // Shelf.
    fs.mkdirSync(path.join(app.data, 'files'), { recursive: true });
    fs.writeFileSync(path.join(app.data, 'files', 'Notes.txt'), 'hello');
    const shelf = await app.evaluate("fetch('/api/files').then(r => r.json())");
    assert.equal(shelf.files[0].path, 'Notes.txt');
    assert.equal(await app.evaluate("fetch('/files/Notes.txt').then(r => r.text())"), 'hello');
    ok('the document shelf lists and serves a file');
    // Private files are not reachable as pages.
    assert.equal(await app.evaluate("fetch('/data/profiles.json').then(r => r.status)"), 404);
    assert.equal(await app.evaluate("fetch('/server.py').then(r => r.status)"), 404);
    ok('profiles.json and server.py are not served');
    // Service worker is not used in the desktop build.
    // On this scheme the browser refuses service workers outright ("invalid state"), and app.js only registers one on http(s).
    assert.equal(await app.evaluate("navigator.serviceWorker.getRegistrations().then(r => r.length, () => 0)"), 0);
    ok('no service worker is registered in the desktop build');
    // Settings card.
    await app.evaluate("location.hash = '#settings'");
    await app.waitFor("document.querySelector('[data-card=\"desktop\"]')");
    const cardText = await app.evaluate("document.querySelector('[data-card=\"desktop\"]').innerText");
    assert.match(cardText, /About and updates/); assert.match(cardText, /Check for updates/); assert.match(cardText, /Import existing/);
    ok('Settings shows the "About and updates" card');
    // CSP blocks inline script injection.
    const injected = await app.evaluate("new Promise(r => { window.__x = 0; const s = document.createElement('script'); s.textContent = 'window.__x = 1'; document.head.appendChild(s); setTimeout(() => r(window.__x), 100); })");
    assert.equal(injected, 0);
    ok('the Content-Security-Policy blocks injected inline scripts');
    const errors = app.consoleErrors().filter(e => !/favicon|Autofill|data\/profiles\.json|server\.py|Content Security Policy|inline script/.test(e)) // minus the probes above that are meant to fail;
    assert.deepEqual(errors, [], 'console errors: ' + errors.join('\n'));
    ok('no console errors');
    console.log(`\n${results.length} desktop smoke checks passed`);
  } catch (err) {
    console.error('FAILED:', err.message); console.error(app.getLog().slice(-1500)); process.exitCode = 1;
  } finally { await app.close(); fs.rmSync(app.data, { recursive: true, force: true }); }
})();
