'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { createUpdater, friendlyError, plainNotes } = require('../updater');
const { tempDir, rmrf } = require('./helpers');

class FakeUpdater extends EventEmitter {
  constructor() { super(); this.calls = []; this.checkResult = 'none'; this.downloadResult = 'ok'; }
  async checkForUpdates() {
    this.calls.push('check');
    if (this.checkResult === 'offline') throw new Error('net::ERR_INTERNET_DISCONNECTED');
    if (this.checkResult === 'update') this.emit('update-available', { version: '241.0.0', releaseNotes: '<h2>v241</h2><p>New &amp; better</p><ul><li>One</li></ul>' });
    else this.emit('update-not-available', { version: '240.0.0' });
  }
  async downloadUpdate(token) {
    this.calls.push('download');
    if (this.downloadResult === 'corrupt') throw new Error('sha512 checksum mismatch, expected abc, got def');
    if (this.downloadResult === 'cancel') { this.emit('download-progress', { percent: 40 }); throw new Error('cancelled'); }
    this.emit('download-progress', { percent: 10.4 }); this.emit('download-progress', { percent: 100 });
    this.emit('update-downloaded', { version: '241.0.0' });
  }
  quitAndInstall(a, b) { this.calls.push(`install:${a}:${b}`); }
}
class Token { cancel() { this.cancelled = true; } }

function make(extra = {}) {
  const dir = tempDir('upd'); const fake = new FakeUpdater(); const states = []; const backups = [];
  const timers = [];
  const updater = createUpdater({
    autoUpdater: fake, currentVersion: '240.0.0', settingsFile: path.join(dir, 'settings.json'), emit: s => states.push(s.status), CancellationToken: Token,
    beforeInstall: v => backups.push(v), setTimeoutFn: (fn, ms) => { timers.push({ fn, ms, kind: 'timeout' }); return null; }, setIntervalFn: (fn, ms) => { timers.push({ fn, ms, kind: 'interval' }); return null; }, ...extra
  });
  return { dir, fake, states, backups, updater, timers };
}

test('safe defaults: nothing downloads or installs by itself, no downgrades or pre-releases', () => {
  const { fake, dir } = make();
  assert.equal(fake.autoDownload, false); assert.equal(fake.autoInstallOnAppQuit, false);
  assert.equal(fake.allowDowngrade, false); assert.equal(fake.allowPrerelease, false);
  rmrf(dir);
});

test('up to date: a manual check reports it and remembers when', async () => {
  const { updater, states, dir } = make();
  await updater.check();
  assert.deepEqual(states.slice(0, 2), ['checking', 'up-to-date']);
  assert.equal(updater.getState().status, 'up-to-date');
  assert.ok(updater.getState().lastChecked > 0);
  assert.ok(JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8')).lastChecked > 0);
  rmrf(dir);
});

test('update available: shows the version and plain-text release notes, downloads only when asked', async () => {
  const { updater, fake, dir } = make();
  fake.checkResult = 'update';
  await updater.check();
  assert.equal(updater.getState().status, 'available'); assert.equal(updater.getState().newVersion, '241.0.0');
  assert.match(updater.getState().releaseNotes, /New & better/); assert.ok(!/[<>]/.test(updater.getState().releaseNotes));
  assert.ok(!fake.calls.includes('download'));
  await updater.download();
  assert.equal(updater.getState().status, 'ready'); assert.equal(updater.getState().progress, 100);
  assert.ok(!fake.calls.some(c => c.startsWith('install')), 'nothing installs until the user clicks');
  rmrf(dir);
});

test('download progress is reported as whole percentages', async () => {
  const { updater, fake, states, dir } = make();
  fake.checkResult = 'update'; await updater.check(); await updater.download();
  assert.ok(states.includes('downloading')); rmrf(dir);
});

test('cancel: goes back to "available" with no error', async () => {
  const { updater, fake, dir } = make();
  fake.checkResult = 'update'; await updater.check(); fake.downloadResult = 'cancel';
  await updater.download();
  assert.equal(updater.getState().status, 'available'); assert.equal(updater.getState().error, '');
  rmrf(dir);
});

test('corrupted download: calm message, nothing installed, can try again', async () => {
  const { updater, fake, dir } = make();
  fake.checkResult = 'update'; await updater.check(); fake.downloadResult = 'corrupt';
  await updater.download();
  assert.equal(updater.getState().status, 'error');
  assert.match(updater.getState().error, /safety check/); assert.ok(!/sha512|checksum/i.test(updater.getState().error));
  assert.ok(!fake.calls.some(c => c.startsWith('install')));
  fake.checkResult = 'update'; await updater.check();
  assert.equal(updater.getState().status, 'available');
  rmrf(dir);
});

test('offline: a manual check gives a calm message; a silent check shows nothing', async () => {
  const { updater, fake, states, dir } = make();
  fake.checkResult = 'offline';
  await updater.check({ silent: true });
  assert.equal(updater.getState().status, 'idle'); assert.equal(updater.getState().error, ''); assert.ok(!states.includes('error'));
  await updater.check();
  assert.equal(updater.getState().status, 'error'); assert.match(updater.getState().error, /offline/i);
  assert.ok(!/ERR_|net::/.test(updater.getState().error));
  rmrf(dir);
});

test('install: backs up first, then restarts only when the user clicks', async () => {
  const { updater, fake, backups, dir } = make();
  assert.deepEqual(updater.install().status, 'idle'); assert.deepEqual(fake.calls, []);
  fake.checkResult = 'update'; await updater.check(); await updater.download();
  updater.install();
  assert.deepEqual(backups, ['241.0.0']);
  assert.ok(fake.calls.includes('install:false:true'));
  rmrf(dir);
});

test('a failing pre-update backup does not trap the user (they can still install)', async () => {
  const { updater, fake, dir } = make({ beforeInstall: () => { throw new Error('disk full'); } });
  fake.checkResult = 'update'; await updater.check(); await updater.download(); updater.install();
  assert.ok(fake.calls.includes('install:false:true')); rmrf(dir);
});

test('"install when I close" is off by default and follows the setting', async () => {
  const { updater, fake, dir } = make();
  fake.checkResult = 'update'; await updater.check(); await updater.download();
  assert.equal(fake.autoInstallOnAppQuit, false);
  updater.setInstallOnQuit(true); assert.equal(fake.autoInstallOnAppQuit, true);
  updater.setInstallOnQuit(false); assert.equal(fake.autoInstallOnAppQuit, false);
  rmrf(dir);
});

test('automatic checks: scheduled a few seconds after launch, repeat every few hours, can be turned off', () => {
  const { updater, timers, dir } = make();
  updater.schedule();
  assert.equal(timers.find(t => t.kind === 'timeout').ms, 8000);
  assert.equal(timers.find(t => t.kind === 'interval').ms, 6 * 60 * 60 * 1000);
  const before = timers.length; updater.setAutoCheck(false);
  assert.equal(timers.length, before, 'turning it off schedules nothing new');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8')).autoCheck, false);
  const again = createUpdater({ autoUpdater: new FakeUpdater(), currentVersion: '240.0.0', settingsFile: path.join(dir, 'settings.json'), emit() {}, setTimeoutFn: (f, ms) => { timers.push({ ms }); return null; }, setIntervalFn: () => null });
  const n = timers.length; again.schedule();
  assert.equal(timers.length, n, 'a saved "off" is respected on the next launch');
  rmrf(dir);
});

test('wording helpers', () => {
  assert.match(friendlyError(new Error('getaddrinfo ENOTFOUND github.com')), /offline/i);
  assert.match(friendlyError(new Error('weird')), /keeps working/);
  assert.equal(plainNotes([{ note: 'a' }, { note: 'b' }]), 'a\n\nb');
});
