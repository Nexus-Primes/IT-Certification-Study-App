'use strict';
// The "About and updates" card is built by app/desktop.js (a browser module). These tests import it
// directly and fake the bridge, so no window is needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

const load = () => import(pathToFileURL(path.join(__dirname, '..', '..', 'app', 'desktop.js')).href);
const icon = name => `<i data-icon="${name}"></i>`;
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const card = (mod, state, extra = {}) => mod.desktopCardMarkup({ state, info: { version: '240.0.0' }, dismissedVersion: null, appVersion: 'v240', icon, escapeHtml, ...extra });

test('no bridge in a browser: the module reports it and does nothing', async () => {
  const mod = await load();
  assert.equal(mod.desktopBridge(), null);
  globalThis.window = { certStudyDesktop: { isDesktop: true } };
  assert.ok(mod.desktopBridge());
  delete globalThis.window;
});

test('versions: semver from the updater becomes the app counter', async () => {
  const mod = await load();
  assert.equal(mod.appLabelFromSemver('241.0.0'), 'v241'); assert.equal(mod.appLabelFromSemver(null), '');
});

test('card structure follows the settings-card pattern and is searchable', async () => {
  const mod = await load();
  const html = card(mod, { status: 'idle', autoCheck: true });
  assert.match(html, /<article class="settings-card" data-section="about" data-card="desktop">/);
  assert.match(html, /<h3>About and updates<\/h3>/);
  assert.match(html, /v240/);
  for (const needle of ['desktop-check-updates', 'setting-desktop-auto-check', 'desktop-release-notes', 'desktop-open-data-folder', 'desktop-import-data']) assert.ok(html.includes(needle), needle);
  assert.match(html, /id="setting-desktop-auto-check" type="checkbox" checked/);
  assert.match(card(mod, { status: 'idle', autoCheck: false }), /id="setting-desktop-auto-check" type="checkbox" >/);
});

test('each update state shows the right buttons', async () => {
  const mod = await load();
  assert.match(card(mod, { status: 'up-to-date', lastChecked: Date.now() }), /You(?:'|&#39;)re up to date\./);
  assert.match(card(mod, { status: 'checking' }), /Checking for updates/); assert.match(card(mod, { status: 'checking' }), /desktop-check-updates" disabled/);
  const available = card(mod, { status: 'available', newVersion: '241.0.0', releaseNotes: 'Fixed things' });
  assert.match(available, /v241 is available/); assert.match(available, /desktop-download-update/); assert.match(available, /desktop-dismiss-update/); assert.match(available, /Fixed things/);
  assert.ok(!available.includes('desktop-install-update'));
  assert.ok(!card(mod, { status: 'available', newVersion: '241.0.0' }, { dismissedVersion: '241.0.0' }).includes('desktop-download-update'), '"Later" hides the offer');
  const downloading = card(mod, { status: 'downloading', newVersion: '241.0.0', progress: 37 });
  assert.match(downloading, /<progress max="100" value="37"/); assert.match(downloading, /desktop-cancel-download/);
  const ready = card(mod, { status: 'ready', newVersion: '241.0.0', installOnQuit: false });
  assert.match(ready, /desktop-install-update/); assert.match(ready, /Restart and install/); assert.match(ready, /setting-desktop-install-on-quit/);
  assert.match(card(mod, { status: 'error', error: "Couldn't reach the update server." }), /Couldn(?:'|&#39;)t reach/);
});

test('release notes from the network are escaped, never injected as HTML', async () => {
  const mod = await load();
  const html = card(mod, { status: 'available', newVersion: '241.0.0', releaseNotes: '<img src=x onerror=alert(1)><script>bad()</script>' });
  assert.ok(!html.includes('<img') && !html.includes('<script'));
  assert.match(html, /&lt;img/);
});

test('"last checked" wording', async () => {
  const mod = await load(); const now = Date.now();
  assert.equal(mod.formatChecked(null), 'Not checked yet');
  assert.equal(mod.formatChecked(now - 10_000, now), 'Checked just now');
  assert.equal(mod.formatChecked(now - 5 * 60_000, now), 'Checked 5 minutes ago');
  assert.equal(mod.formatChecked(now - 3 * 3_600_000, now), 'Checked 3 hours ago');
});
