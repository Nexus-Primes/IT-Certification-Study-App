// ---------- Desktop bridge ----------
// The Windows app (Electron) puts a small `window.certStudyDesktop` object on the page. In a plain
// browser it does not exist, and everything here quietly does nothing, so the web version behaves
// exactly as before. This module only builds markup and wording; app.js owns state and clicks.

export function desktopBridge() {
  const bridge = typeof window !== 'undefined' ? window.certStudyDesktop : null;
  return bridge && bridge.isDesktop ? bridge : null;
}

// electron-updater speaks semver ("240.0.0"); the app counts builds ("v240").
export function appLabelFromSemver(version) {
  const match = /^(\d+)\./.exec(String(version || ''));
  return match ? `v${match[1]}` : String(version || '');
}

export function formatChecked(ms, now = Date.now()) {
  if (!ms) return 'Not checked yet';
  const minutes = Math.round((now - ms) / 60000);
  if (minutes < 1) return 'Checked just now';
  if (minutes < 60) return `Checked ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Checked ${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `Checked on ${new Date(ms).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

// One calm sentence for the current state, plus which buttons make sense.
export function describeUpdate(state, dismissedVersion = null) {
  const s = state || { status: 'idle' };
  const next = appLabelFromSemver(s.newVersion);
  switch (s.status) {
    case 'checking': return { text: 'Checking for updates…', busy: true };
    case 'up-to-date': return { text: "You're up to date." };
    case 'available': return { text: `${next} is available.`, offer: dismissedVersion !== s.newVersion };
    case 'downloading': return { text: `Downloading ${next}… ${s.progress || 0}%`, busy: true, downloading: true };
    case 'ready': return { text: `${next} is downloaded and ready.`, ready: true };
    case 'error': return { text: s.error || "Couldn't check for updates right now." };
    default: return { text: 'Updates are checked for you in the background.' };
  }
}

export function desktopCardMarkup({ state, info, dismissedVersion, appVersion, icon, escapeHtml }) {
  const s = state || { status: 'idle' };
  const d = describeUpdate(s, dismissedVersion);
  const busy = !!d.busy;
  const notes = s.releaseNotes ? `<details class="desktop-notes" style="margin-top:8px"><summary>What's in ${escapeHtml(appLabelFromSemver(s.newVersion))}</summary><div style="white-space:pre-wrap;margin-top:6px">${escapeHtml(s.releaseNotes)}</div></details>` : '';
  let actions = '';
  if (d.offer) actions = `<div class="button-row" style="margin-top:8px"><button class="primary small" data-action="desktop-download-update">${icon('download')} Download update</button><button class="secondary small" data-action="desktop-dismiss-update">Later</button></div>${notes}`;
  else if (d.downloading) actions = `<div style="margin-top:8px"><progress max="100" value="${Number(s.progress) || 0}" style="width:100%" aria-label="Download progress"></progress></div><div class="button-row" style="margin-top:8px"><button class="secondary small" data-action="desktop-cancel-download">Cancel</button></div>`;
  else if (d.ready) actions = `<div class="button-row" style="margin-top:8px"><button class="primary small" data-action="desktop-install-update">${icon('rotate')} Restart and install</button></div><div class="setting-row" style="margin-top:8px"><div><strong>Install when I close the app</strong><small>Otherwise nothing is installed until you click Restart and install. Your progress is backed up first either way.</small></div><label class="switch"><input id="setting-desktop-install-on-quit" type="checkbox" ${s.installOnQuit ? 'checked' : ''}><span></span></label></div>${notes}`;
  return `<article class="settings-card" data-section="about" data-card="desktop"><h3>About and updates</h3><p>You're running <strong>${escapeHtml(appVersion)}</strong> of the Windows app${info && info.version ? ` (${escapeHtml(info.version)})` : ''}. Updates are only downloaded and installed when you choose.</p>
<div class="setting-row"><div><strong>Check for updates</strong><small id="desktop-update-status" role="status">${escapeHtml(d.text)} ${escapeHtml(formatChecked(s.lastChecked))}.</small></div><button class="secondary small" data-action="desktop-check-updates" ${busy ? 'disabled' : ''}>${icon('rotate')} Check now</button></div>${actions}
<div class="setting-row"><div><strong>Check automatically</strong><small>A quiet check shortly after the app opens and every few hours. It never interrupts you and says nothing when you're offline.</small></div><label class="switch"><input id="setting-desktop-auto-check" type="checkbox" ${s.autoCheck !== false ? 'checked' : ''}><span></span></label></div>
<div class="setting-row"><div><strong>Release notes</strong><small>See what changed in each version on GitHub.</small></div><button class="secondary small" data-action="desktop-release-notes">${icon('book')} Open</button></div>
<div class="setting-row"><div><strong>Your data folder</strong><small>Progress, accounts, backups and your document shelf live here, outside the program files, so updates never touch them.</small></div><button class="secondary small" data-action="desktop-open-data-folder">${icon('folder')} Open folder</button></div>
<div class="setting-row"><div><strong>Import existing Cert Study data</strong><small>Moving from the web version? Pick your old study-app folder and every account, your PIN, backups and document shelf are copied in. Nothing is moved or deleted, and what is here now is backed up first.</small></div><button class="secondary small" data-action="desktop-import-data">${icon('upload')} Import…</button></div></article>`;
}
