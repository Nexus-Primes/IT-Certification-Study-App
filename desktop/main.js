'use strict';
const { app, BrowserWindow, Menu, protocol, session, shell, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createBackend } = require('./backend');
const { createUpdater } = require('./updater');
const { importLegacyData, safetyBackup, pruneSafetyBackups } = require('./import-data');

const APP_ORIGIN = 'app://cert-study';
const REPO_URL = 'https://github.com/Nexus-Primes/IT-Certification-Study-App';
const APP_ROOT = path.resolve(__dirname, '..');
const TEST_MODE = !!process.env.CERT_STUDY_DATA_DIR;           // tests and rehearsals use their own folder
const DATA_ROOT = process.env.CERT_STUDY_DATA_DIR ? path.resolve(process.env.CERT_STUDY_DATA_DIR) : app.getPath('userData');
const SETTINGS_FILE = path.join(DATA_ROOT, 'desktop-settings.json');
const WINDOW_FILE = path.join(DATA_ROOT, 'window-state.json');
// A fake update feed is honoured only together with a test data folder, never in a normal run.
const FEED_OVERRIDE = TEST_MODE ? process.env.CERT_STUDY_UPDATE_FEED : '';

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

if (!app.requestSingleInstanceLock()) { app.quit(); } else { start(); }

function start() {
  let mainWindow = null; let backend = null; let updater = null; let csp = '';
  const log = msg => { try { fs.mkdirSync(DATA_ROOT, { recursive: true }); fs.appendFileSync(path.join(DATA_ROOT, 'desktop.log'), `${new Date().toISOString()} ${msg}\n`); } catch { /* logging is best effort */ } };
  const firstRun = !fs.existsSync(path.join(DATA_ROOT, 'data', 'progress.json')) && !fs.existsSync(path.join(DATA_ROOT, 'data', 'profiles.json'));

  app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } });

  function buildCsp() {
    // The page has exactly one inline script (it paints the saved theme before first render).
    // Allow that one by its hash instead of opening the door to every inline script.
    let hashes = '';
    try {
      const html = fs.readFileSync(path.join(APP_ROOT, 'app', 'index.html'), 'utf8');
      for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) hashes += ` 'sha256-${crypto.createHash('sha256').update(m[1], 'utf8').digest('base64')}'`;
    } catch (err) { log('csp: ' + err.message); }
    return `default-src 'none'; script-src 'self'${hashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'self' blob:; manifest-src 'self'`;
  }

  function registerAppProtocol() {
    protocol.handle('app', async request => {
      const url = new URL(request.url);
      if (url.host !== 'cert-study') return new Response(null, { status: 404 });
      const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : Buffer.from(await request.arrayBuffer());
      const out = backend.handle(request.method, url.pathname + url.search, body);
      const headers = { ...out.headers, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' };
      if ((headers['Content-Type'] || '').startsWith('text/html')) headers['Content-Security-Policy'] = csp;
      return new Response(out.body.length ? out.body : null, { status: out.status, headers });
    });
  }

  // Node reports origin "null" for custom schemes, so compare protocol and host directly.
  const isAppUrl = text => { try { const u = new URL(text); return u.protocol === 'app:' && u.host === 'cert-study'; } catch { return false; } };
  function isOurFrame(event) { return !!event.senderFrame && isAppUrl(event.senderFrame.url); }

  function openFromShelf(url) {
    // app://cert-study/files/<path> -> the real file in the user's shelf folder, opened by the OS.
    const rel = decodeURIComponent(new URL(url).pathname.slice('/files/'.length));
    const base = fs.realpathSync(backend.paths.FILES_DIR);
    const full = fs.realpathSync(path.join(base, rel));
    if (full.startsWith(base + path.sep) && fs.statSync(full).isFile()) shell.openPath(full);
  }

  function handleExternal(url) {
    try {
      const parsed = new URL(url);
      if (isAppUrl(url) && parsed.pathname.startsWith('/files/')) openFromShelf(url);
      else if (['https:', 'http:', 'mailto:'].includes(parsed.protocol)) shell.openExternal(url);
    } catch (err) { log('external link: ' + err.message); }
  }

  function loadWindowState() { try { return JSON.parse(fs.readFileSync(WINDOW_FILE, 'utf8')); } catch { return {}; } }
  function saveWindowState(win) {
    try {
      const maximized = win.isMaximized();
      const bounds = maximized ? (loadWindowState().bounds || win.getNormalBounds()) : win.getBounds();
      fs.writeFileSync(WINDOW_FILE, JSON.stringify({ bounds, maximized }));
    } catch { /* not important */ }
  }

  function createWindow() {
    const saved = loadWindowState();
    mainWindow = new BrowserWindow({
      width: 1280, height: 860, minWidth: 900, minHeight: 600, show: false, backgroundColor: '#0f172a', title: 'Cert Study',
      icon: path.join(APP_ROOT, 'build', 'icon.png'),
      ...(saved.bounds || {}),
      webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, devTools: !app.isPackaged, spellcheck: true }
    });
    if (saved.maximized) mainWindow.maximize();
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('close', () => saveWindowState(mainWindow));
    mainWindow.on('closed', () => { mainWindow = null; });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => { handleExternal(url); return { action: 'deny' }; });
    mainWindow.webContents.on('will-navigate', (event, url) => {
      if (isAppUrl(url) && !new URL(url).pathname.startsWith('/files/')) return;
      event.preventDefault(); handleExternal(url);
    });
    mainWindow.webContents.on('did-fail-load', (_e, code, desc) => log(`load failed ${code} ${desc}`));
    mainWindow.loadURL(`${APP_ORIGIN}/`);
  }

  function buildMenu() {
    const dev = !app.isPackaged;
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'File', submenu: [{ role: 'quit', label: 'Exit' }] },
      { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
      { label: 'View', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }, ...(dev ? [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }] : [])] },
      { label: 'Help', submenu: [{ label: 'Release notes and downloads', click: () => shell.openExternal(`${REPO_URL}/releases`) }, { label: 'Report a problem', click: () => shell.openExternal(`${REPO_URL}/issues`) }] }
    ]));
  }

  function setUpPermissions() {
    const allowed = new Set(['notifications', 'clipboard-sanitized-write', 'fullscreen']);
    session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => callback(allowed.has(permission)));
    session.defaultSession.setPermissionCheckHandler((_wc, permission) => allowed.has(permission));
  }

  function setUpUpdater() {
    const { autoUpdater, CancellationToken } = require('electron-updater');
    if (FEED_OVERRIDE) autoUpdater.setFeedURL({ provider: 'generic', url: FEED_OVERRIDE });
    if (TEST_MODE && !app.isPackaged) {
      // Running from source there is no app-update.yml, so write a throwaway one (test mode only).
      autoUpdater.forceDevUpdateConfig = true;
      const cfg = path.join(DATA_ROOT, 'dev-app-update.yml');
      fs.writeFileSync(cfg, `provider: generic
url: ${FEED_OVERRIDE || 'http://127.0.0.1:9/'}
updaterCacheDirName: cert-study-updater
`);
      autoUpdater.updateConfigPath = cfg;
    }
    updater = createUpdater({
      autoUpdater, CancellationToken, currentVersion: app.getVersion(), settingsFile: SETTINGS_FILE, log,
      emit: state => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update:state-changed', state); },
      beforeInstall: newVersion => { safetyBackup(DATA_ROOT, `before-update-${String(newVersion || 'next').replace(/[^0-9A-Za-z.-]/g, '')}`); pruneSafetyBackups(DATA_ROOT); }
    });
    if (app.isPackaged || FEED_OVERRIDE) updater.schedule();
  }

  function handleIpc(channel, fn) {
    ipcMain.handle(channel, async (event, ...args) => { if (!isOurFrame(event)) return null; try { return await fn(...args); } catch (err) { log(`${channel}: ${err.message}`); return { ok: false, error: 'Something went wrong. Nothing was changed.' }; } });
  }

  function setUpIpc() {
    handleIpc('desktop:info', () => ({ version: app.getVersion(), platform: process.platform, firstRun, importOfferDismissed: updater.settings.importOfferDismissed, canUpdate: app.isPackaged || !!FEED_OVERRIDE }));
    handleIpc('update:state', () => updater.getState());
    handleIpc('update:check', () => updater.check());
    handleIpc('update:download', () => updater.download());
    handleIpc('update:cancel', () => updater.cancel());
    handleIpc('update:install', () => updater.install());
    handleIpc('update:set-auto-check', on => updater.setAutoCheck(!!on));
    handleIpc('update:set-install-on-quit', on => updater.setInstallOnQuit(!!on));
    handleIpc('desktop:open-data-folder', async () => { await shell.openPath(DATA_ROOT); return { ok: true }; });
    handleIpc('desktop:open-release-notes', () => { shell.openExternal(`${REPO_URL}/releases`); return { ok: true }; });
    handleIpc('desktop:dismiss-import-offer', () => { updater.settings.importOfferDismissed = true; require('./updater').saveSettings(SETTINGS_FILE, updater.settings); return { ok: true }; });
    handleIpc('desktop:import-data', async () => {
      const pick = process.env.CERT_STUDY_TEST_IMPORT_DIR
        ? { canceled: false, filePaths: [process.env.CERT_STUDY_TEST_IMPORT_DIR] }
        : await dialog.showOpenDialog(mainWindow, { title: 'Choose your old Cert Study folder', message: 'Pick the old study-app folder, or the folder you saved your data in.', properties: ['openDirectory'] });
      if (pick.canceled || !pick.filePaths[0]) return { ok: false, cancelled: true };
      return importLegacyData({ sourceDir: pick.filePaths[0], dataRoot: DATA_ROOT });
    });
  }

  app.whenReady().then(() => {
    fs.mkdirSync(DATA_ROOT, { recursive: true });
    backend = createBackend({ dataRoot: DATA_ROOT, appRoot: APP_ROOT });
    csp = buildCsp();
    registerAppProtocol(); setUpPermissions(); setUpUpdater(); setUpIpc(); buildMenu(); createWindow();
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  });
  app.on('window-all-closed', () => app.quit());
}
