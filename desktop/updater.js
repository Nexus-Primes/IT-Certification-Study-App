'use strict';
// In-app updating. The user decides: nothing is downloaded or installed without a click.
// `autoUpdater` is electron-updater's (or a fake in tests); `emit(state)` pushes state to the window.
const fs = require('fs');
const path = require('path');

const CHECK_DELAY_MS = 8000;              // first silent check, well after start-up
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000; // then every six hours
const DEFAULT_SETTINGS = { autoCheck: true, installOnQuit: false, lastChecked: null, importOfferDismissed: false };

function loadSettings(file) {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(file, settings) {
  try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(settings, null, 2)); } catch { /* settings are a convenience */ }
}

function plainNotes(notes) {
  if (!notes) return '';
  const text = Array.isArray(notes) ? notes.map(n => (n && n.note) || '').join('\n\n') : String(notes);
  return text.replace(/<\s*br\s*\/?>/gi, '\n').replace(/<\/(p|li|h\d)>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);
}
// Short, calm wording; the technical message stays in the log, not in front of someone studying.
function friendlyError(err) {
  const msg = String((err && err.message) || err || '');
  if (/ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENETUNREACH|net::ERR|socket hang up|getaddrinfo|network/i.test(msg)) return "Couldn't reach the update server. You may be offline. Your study data is not affected.";
  if (/sha512|checksum|corrupt|signature|integrity/i.test(msg)) return "The downloaded update didn't pass its safety check and was not installed. Try again in a moment.";
  if (/cancel/i.test(msg)) return 'Download cancelled.';
  return "Couldn't check for updates right now. The app keeps working and will try again later.";
}

function createUpdater({ autoUpdater, currentVersion, settingsFile, emit, beforeInstall, log = () => {}, setTimeoutFn = setTimeout, setIntervalFn = setInterval, now = () => Date.now(), CancellationToken }) {
  const settings = loadSettings(settingsFile);
  let state = { status: 'idle', currentVersion, newVersion: null, releaseNotes: '', progress: 0, error: '', lastChecked: settings.lastChecked, autoCheck: settings.autoCheck, installOnQuit: settings.installOnQuit };
  let token = null; let busy = false; let timers = [];

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;
  autoUpdater.fullChangelog = false;

  const set = patch => { state = { ...state, ...patch }; emit(state); return state; };
  const stamp = () => { settings.lastChecked = now(); saveSettings(settingsFile, settings); return settings.lastChecked; };

  autoUpdater.on('update-available', info => set({ status: 'available', newVersion: info.version, releaseNotes: plainNotes(info.releaseNotes), error: '', progress: 0 }));
  autoUpdater.on('update-not-available', () => set({ status: 'up-to-date', error: '', newVersion: null }));
  autoUpdater.on('download-progress', p => set({ status: 'downloading', progress: Math.max(0, Math.min(100, Math.round(p.percent || 0))) }));
  autoUpdater.on('update-downloaded', info => { token = null; autoUpdater.autoInstallOnAppQuit = !!settings.installOnQuit; set({ status: 'ready', newVersion: info.version || state.newVersion, progress: 100 }); });
  autoUpdater.on('error', err => { log('updater error: ' + ((err && err.message) || err)); });

  async function check({ silent = false } = {}) {
    if (busy || ['downloading', 'ready'].includes(state.status)) return state;
    busy = true;
    if (!silent) set({ status: 'checking', error: '' });
    try {
      await autoUpdater.checkForUpdates();
      set({ lastChecked: stamp() });
      // Some runs (an unpackaged copy) never answer; do not leave the card saying "Checking" forever.
      if (state.status === 'checking') set({ status: 'idle' });
    } catch (err) {
      log('check failed: ' + ((err && err.message) || err));
      // A silent background check never interrupts: offline just means "try again later".
      if (silent) set({ status: state.status === 'checking' ? 'idle' : state.status });
      else set({ status: 'error', error: friendlyError(err) });
    } finally { busy = false; }
    return state;
  }

  async function download() {
    if (state.status !== 'available') return state;
    token = CancellationToken ? new CancellationToken() : null;
    set({ status: 'downloading', progress: 0, error: '' });
    try { await autoUpdater.downloadUpdate(token || undefined); } catch (err) {
      log('download failed: ' + ((err && err.message) || err));
      const cancelled = /cancel/i.test(String((err && err.message) || err));
      set(cancelled ? { status: 'available', progress: 0, error: '' } : { status: 'error', error: friendlyError(err), progress: 0 });
    }
    return state;
  }

  function cancel() { if (token && state.status === 'downloading') token.cancel(); return state; }

  function install() {
    if (state.status !== 'ready') return state;
    try { if (beforeInstall) beforeInstall(state.newVersion); } catch (err) { log('pre-install backup failed: ' + err.message); }
    autoUpdater.quitAndInstall(false, true);
    return state;
  }

  function setAutoCheck(on) { settings.autoCheck = !!on; saveSettings(settingsFile, settings); set({ autoCheck: settings.autoCheck }); schedule(); return state; }
  function setInstallOnQuit(on) {
    settings.installOnQuit = !!on; saveSettings(settingsFile, settings);
    if (state.status === 'ready') autoUpdater.autoInstallOnAppQuit = settings.installOnQuit;
    set({ installOnQuit: settings.installOnQuit }); return state;
  }

  function schedule() {
    timers.forEach(t => clearTimeout(t) || clearInterval(t)); timers = [];
    if (!settings.autoCheck) return;
    timers.push(setTimeoutFn(() => check({ silent: true }), CHECK_DELAY_MS));
    timers.push(setIntervalFn(() => { if (settings.autoCheck) check({ silent: true }); }, CHECK_EVERY_MS));
    timers.forEach(t => t && t.unref && t.unref());
  }

  return { getState: () => state, check, download, cancel, install, setAutoCheck, setInstallOnQuit, schedule, settings, _friendlyError: friendlyError, _plainNotes: plainNotes };
}

module.exports = { createUpdater, friendlyError, plainNotes, loadSettings, saveSettings, CHECK_DELAY_MS, CHECK_EVERY_MS };
