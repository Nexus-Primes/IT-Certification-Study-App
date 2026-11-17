'use strict';
// Node port of server.py's JSON API. Same routes, JSON shapes, status codes, file names and file
// formats, so a data folder can move between the Python server and the desktop app unchanged.
//
// Everything here is synchronous between reading a file and writing it back, and Node runs one
// request at a time on the main thread, so the read-modify-write steps are atomic without locks.
// Files are written to a temp file and renamed over the target, so a crash never leaves half a file.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ICON_SHAPE_PATHS = require('./icon-shapes');

const DEFAULT_PROFILE_ID = 'default';
const DEFAULT_PROFILE_NAME = 'Student';
const SHELF_MAX_DEPTH = 4;
const SHELF_MAX_FILES = 2000;
const BACKUP_KEEP_ALL_DAYS = 30;
const BACKUP_KEEP_WEEKLY_DAYS = 180;
const BACKUP_NAME = /^cert-study-(?<kind>backup|prerestore)-(?:(?<pid>p[0-9a-f]{12})-)?(?<version>[A-Za-z0-9.]+(?:-[A-Za-z0-9.]+)*?)-(?<date>\d{4}-\d{2}-\d{2})(?:-(?<stamp>\d{6}))?\.json$/;

// ---- Python-compatible JSON text (ensure_ascii, ", " and ": " separators) ---------------------
function pyString(s) {
  return '"' + s.replace(/[\u0000-\u001f"\\\u007f-￿]/g, ch => {
    switch (ch) {
      case '"': return '\\"';
      case '\\': return '\\\\';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '\t': return '\\t';
      case '\b': return '\\b';
      case '\f': return '\\f';
      default: return ch === '\u007f' ? ch : '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    }
  }) + '"';
}
function pyDumps(value, indent, level = 0) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? JSON.stringify(value) : 'null';
  if (typeof value === 'string') return pyString(value);
  const nl = indent == null ? '' : '\n' + ' '.repeat(indent * (level + 1));
  const nlEnd = indent == null ? '' : '\n' + ' '.repeat(indent * level);
  const sep = indent == null ? ', ' : ',';
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return '[' + nl + value.map(v => pyDumps(v, indent, level + 1)).join(sep + nl) + nlEnd + ']';
  }
  const keys = Object.keys(value);
  if (!keys.length) return '{}';
  return '{' + nl + keys.map(k => pyString(k) + ': ' + pyDumps(value[k], indent, level + 1)).join(sep + nl) + nlEnd + '}';
}

function writeFileAtomic(target, data) {
  const tmp = `${target}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, target);
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch { /* nothing to clean up */ }
    throw err;
  }
}

function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function truthy(v) { return !(v === null || v === undefined || v === false || v === 0 || v === '' || (Array.isArray(v) && !v.length) || (isPlainObject(v) && !Object.keys(v).length)); }

function isoDate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function validDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d || y < 1) return null;
  return date;
}
function dayNumber(text) { return Math.round(validDate(text).getTime() / 86400000); }
// ISO-8601 (year, week) like Python's date.isocalendar()[:2].
function isoWeek(text) {
  const d = validDate(text);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return [d.getUTCFullYear(), Math.ceil(((d - yearStart) / 86400000 + 1) / 7)];
}

function parseBackupName(name) {
  const m = BACKUP_NAME.exec(name || '');
  if (!m || !validDate(m.groups.date)) return null;
  return { kind: m.groups.kind, profile: m.groups.pid || DEFAULT_PROFILE_ID, version: m.groups.version, date: m.groups.date, stamp: m.groups.stamp || null };
}

function planBackupPruning(entries, todayText) {
  const seenWeeks = new Set(); const seenMonths = new Set(); const doomed = [];
  const sorted = [...entries].sort((a, b) => (a.date === b.date ? b.modified - a.modified : a.date < b.date ? 1 : -1));
  for (const entry of sorted) {
    const age = dayNumber(todayText) - dayNumber(entry.date);
    if (age <= BACKUP_KEEP_ALL_DAYS) continue;
    let bucket; let seen;
    if (age <= BACKUP_KEEP_WEEKLY_DAYS) { bucket = isoWeek(entry.date).join('-'); seen = seenWeeks; }
    else { bucket = entry.date.slice(0, 7); seen = seenMonths; }
    if (seen.has(bucket)) doomed.push(entry.name); else seen.add(bucket);
  }
  return doomed;
}

function createBackend({ dataRoot, appRoot }) {
  const DATA_DIR = path.join(dataRoot, 'data');
  const BACKUP_DIR = path.join(dataRoot, 'backup');
  const FILES_DIR = path.join(dataRoot, 'files');
  const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
  const AVATAR_FILE = path.join(DATA_DIR, 'avatar.jpg');
  const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROGRESS_FILE)) writeFileAtomic(PROGRESS_FILE, '{}');

  function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
  }
  function saveRegistry(registry) { writeFileAtomic(PROFILES_FILE, pyDumps(registry, 2)); }
  function loadRegistry() {
    let registry = readJson(PROFILES_FILE, null);
    if (Array.isArray(registry) && registry.length) {
      registry = { pinHash: null, profiles: registry };
      saveRegistry(registry);
      return registry;
    }
    if (isPlainObject(registry) && Array.isArray(registry.profiles) && registry.profiles.length) {
      if (!('pinHash' in registry)) registry.pinHash = null;
      return registry;
    }
    registry = { pinHash: null, profiles: [{ id: DEFAULT_PROFILE_ID, name: DEFAULT_PROFILE_NAME, createdAt: null }] };
    saveRegistry(registry);
    return registry;
  }
  const hashPin = pin => crypto.createHash('sha256').update(pin, 'utf8').digest('hex');
  function pinMatches(pin, hash) {
    if (typeof pin !== 'string' || typeof hash !== 'string') return false;
    const a = Buffer.from(hashPin(pin)); const b = Buffer.from(hash);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  function resolveProfileId(requested) {
    const profiles = loadRegistry().profiles;
    if (requested && profiles.some(p => p && p.id === requested)) return requested;
    return DEFAULT_PROFILE_ID;
  }
  const progressPathFor = id => (id === DEFAULT_PROFILE_ID ? PROGRESS_FILE : path.join(DATA_DIR, `progress-${id}.json`));
  const avatarPathFor = id => (id === DEFAULT_PROFILE_ID ? AVATAR_FILE : path.join(DATA_DIR, `avatar-${id}.jpg`));

  function listShelfFiles() {
    let base;
    try { base = fs.realpathSync(FILES_DIR); if (!fs.statSync(base).isDirectory()) return []; } catch { return []; }
    const found = [];
    const walk = (dir, depth) => {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        if (found.length >= SHELF_MAX_FILES) return;
        if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { if (depth < SHELF_MAX_DEPTH) walk(full, depth + 1); continue; }
        if (!entry.isFile()) continue;
        let info;
        try { info = fs.statSync(full); } catch { continue; }
        found.push({ path: path.relative(base, full).split(path.sep).join('/'), name: entry.name, size: info.size, modified: Math.floor(info.mtimeMs / 1000) });
      }
    };
    walk(base, 0);
    found.sort((a, b) => { const x = a.path.toLowerCase(); const y = b.path.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; });
    return found;
  }

  function listBackups(profileId) {
    let names;
    try { names = fs.readdirSync(BACKUP_DIR); } catch { return []; }
    const found = [];
    for (const name of names) {
      const info = parseBackupName(name);
      if (!info || info.profile !== profileId) continue;
      let stat;
      try { stat = fs.statSync(path.join(BACKUP_DIR, name)); } catch { continue; }
      found.push({ name, kind: info.kind === 'prerestore' ? 'pre-restore' : 'daily', version: info.version, date: info.date, stamp: info.stamp || '', size: stat.size, modified: stat.mtimeMs / 1000 });
    }
    found.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.stamp !== b.stamp ? (a.stamp < b.stamp ? 1 : -1) : b.modified - a.modified));
    return found;
  }
  function pruneBackups(profileId, todayText = isoDate(new Date())) {
    const daily = listBackups(profileId).filter(b => b.kind === 'daily');
    const removed = [];
    for (const name of planBackupPruning(daily, todayText)) {
      try { fs.unlinkSync(path.join(BACKUP_DIR, name)); removed.push(name); } catch { /* already gone */ }
    }
    return removed;
  }

  const json = (obj, status = 200) => ({ status, headers: { 'Content-Type': 'application/json' }, body: Buffer.from(pyDumps(obj), 'utf8') });
  const empty404 = () => ({ status: 404, headers: { 'Content-Length': '0' }, body: Buffer.alloc(0) });
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.csv': 'text/csv', '.gif': 'image/gif', '.webp': 'image/webp' };

  function serveFileUnder(root, relPath) {
    // relPath is already URL-decoded. Refuse anything that is not a plain file inside `root`.
    if (relPath.includes('\0')) return empty404();
    const full = path.resolve(root, relPath.replace(/^\/+/, ''));
    let real; let realRoot;
    try { real = fs.realpathSync(full); realRoot = fs.realpathSync(root); } catch { return empty404(); }
    if (!(real + path.sep).startsWith(realRoot + path.sep) || real === realRoot) return empty404();
    let st;
    try { st = fs.statSync(real); } catch { return empty404(); }
    if (!st.isFile()) return empty404();
    const type = MIME[path.extname(real).toLowerCase()] || 'application/octet-stream';
    return { status: 200, headers: { 'Content-Type': type, 'Cache-Control': 'no-cache' }, body: fs.readFileSync(real) };
  }

  // What static files may be fetched: the app's own front-end files, plus the user's avatar photos
  // and shelf files from the data folder. Never progress, profiles, or backups.
  function serveStatic(pathname) {
    let rel;
    try { rel = decodeURIComponent(pathname); } catch { return empty404(); }
    if (rel === '/' || rel === '') rel = '/app/index.html';
    if (rel.startsWith('/files/')) return serveFileUnder(FILES_DIR, rel.slice('/files/'.length));
    if (/^\/data\/avatar(?:-p[0-9a-f]{12})?\.jpg$/.test(rel)) return serveFileUnder(DATA_DIR, rel.slice('/data/'.length));
    const allowed = /^\/(app\/[^/]+|assets\/[^/]+|data\/[A-Za-z0-9._-]+\.js|manifest\.webmanifest|service-worker\.js)$/.test(rel);
    if (!allowed) return empty404();
    return serveFileUnder(appRoot, rel);
  }

  function parseBody(raw) {
    try { return { ok: true, value: JSON.parse(raw.toString('utf8')) }; } catch { return { ok: false }; }
  }

  function handleGet(pathname, query) {
    const q = key => { const v = query.get(key); return v === null ? undefined : v; };
    if (pathname === '/api/profiles') {
      const registry = loadRegistry();
      return json({ profiles: registry.profiles, defaultId: DEFAULT_PROFILE_ID, hasPin: truthy(registry.pinHash) });
    }
    if (pathname === '/api/files') {
      let folderExists = false;
      try { folderExists = fs.statSync(FILES_DIR).isDirectory(); } catch { /* none yet */ }
      return json({ files: listShelfFiles(), folderExists });
    }
    if (pathname === '/api/backups') {
      return json({ backups: listBackups(resolveProfileId(q('profile'))), keepAllDays: BACKUP_KEEP_ALL_DAYS, keepWeeklyDays: BACKUP_KEEP_WEEKLY_DAYS });
    }
    if (pathname === '/api/backup-file') {
      const profileId = resolveProfileId(q('profile'));
      const name = q('name') || '';
      const info = parseBackupName(name);
      if (!info || info.profile !== profileId) return json({ error: 'no such backup' }, 404);
      const full = path.join(BACKUP_DIR, name);
      let ok = false;
      try { ok = path.dirname(fs.realpathSync(full)) === fs.realpathSync(BACKUP_DIR) && fs.statSync(full).isFile(); } catch { ok = false; }
      if (!ok) return json({ error: 'no such backup' }, 404);
      return { status: 200, headers: { 'Content-Type': 'application/json' }, body: fs.readFileSync(full) };
    }
    if (pathname === '/api/app-icon.svg') {
      let data = readJson(progressPathFor(resolveProfileId(q('profile'))), {});
      if (!isPlainObject(data)) data = {};
      const meta = isPlainObject(data['app-meta']) ? data['app-meta'] : {};
      const shape = Object.prototype.hasOwnProperty.call(ICON_SHAPE_PATHS, meta.appIconShape) ? meta.appIconShape : 'cap';
      const color = typeof meta.appIconColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(meta.appIconColor) ? meta.appIconColor : '#2dd4bf';
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        + `<rect width="64" height="64" rx="14" fill="${color}"/>`
        + '<g transform="translate(16,16) scale(1.3333)" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
        + `${ICON_SHAPE_PATHS[shape]}</g></svg>`;
      return { status: 200, headers: { 'Content-Type': 'image/svg+xml' }, body: Buffer.from(svg, 'utf8') };
    }
    if (pathname === '/api/progress') {
      let data = readJson(progressPathFor(resolveProfileId(q('profile'))), {});
      if (!isPlainObject(data)) data = {};
      return json(data);
    }
    return null;
  }

  function handlePost(pathname, raw) {
    const needsJson = ['/api/profiles', '/api/profiles/delete', '/api/profiles/verify-pin', '/api/profiles/set-pin', '/api/progress', '/api/backup', '/api/avatar'];
    if (!needsJson.includes(pathname)) return empty404();
    const parsed = parseBody(raw);
    if (!parsed.ok) return json({ error: 'bad json' }, 400);
    const incoming = parsed.value;

    if (pathname === '/api/profiles') {
      const rawName = isPlainObject(incoming) && typeof incoming.name === 'string' ? incoming.name.trim() : '';
      if (!rawName) return json({ error: 'name is required' }, 400);
      const name = Array.from(rawName).slice(0, 40).join('');
      const id = `p${crypto.randomBytes(6).toString('hex')}`;
      const record = { id, name, createdAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') };
      const registry = loadRegistry();
      registry.profiles.push(record);
      saveRegistry(registry);
      if (!fs.existsSync(progressPathFor(id))) writeFileAtomic(progressPathFor(id), '{}');
      return json({ ok: true, profile: record });
    }
    if (pathname === '/api/profiles/delete') {
      const id = isPlainObject(incoming) ? incoming.id : null;
      if (id === DEFAULT_PROFILE_ID) return json({ error: "the default account can't be removed" }, 400);
      const registry = loadRegistry();
      const remaining = registry.profiles.filter(p => !(p && p.id === id));
      if (remaining.length === registry.profiles.length) return json({ error: 'no such account' }, 404);
      registry.profiles = remaining; // the account's files stay on disk, as in server.py
      saveRegistry(registry);
      return json({ ok: true });
    }
    if (pathname === '/api/profiles/verify-pin') {
      const pin = isPlainObject(incoming) ? incoming.pin : null;
      const pinHash = loadRegistry().pinHash;
      if (!truthy(pinHash)) return json({ ok: true });
      return json({ ok: pinMatches(pin, pinHash) });
    }
    if (pathname === '/api/profiles/set-pin') {
      if (!isPlainObject(incoming)) return json({ error: 'expected a JSON object' }, 400);
      const newPin = incoming.pin; const currentPin = incoming.currentPin;
      if (newPin !== null && newPin !== undefined && !/^\d{4,8}$/.test(String(newPin))) return json({ error: 'PIN must be 4-8 digits' }, 400);
      const registry = loadRegistry();
      if (truthy(registry.pinHash) && !pinMatches(currentPin, registry.pinHash)) return json({ error: 'current PIN is incorrect' }, 403);
      registry.pinHash = truthy(newPin) ? hashPin(String(newPin)) : null;
      saveRegistry(registry);
      return json({ ok: true, hasPin: truthy(registry.pinHash) });
    }
    if (pathname === '/api/progress') {
      if (!isPlainObject(incoming) || !('key' in incoming) || !('value' in incoming)) return json({ error: 'expected {key, value}' }, 400);
      const target = progressPathFor(resolveProfileId(incoming.profile));
      let existing = readJson(target, {});
      if (!isPlainObject(existing)) existing = {};
      existing[String(incoming.key)] = incoming.value;
      writeFileAtomic(target, pyDumps(existing, 2));
      return json({ ok: true });
    }
    if (pathname === '/api/backup') {
      if (!isPlainObject(incoming)) return json({ error: 'expected a JSON object' }, 400);
      const dateKey = incoming.dateKey;
      if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return json({ error: 'expected dateKey as YYYY-MM-DD' }, 400);
      const version = String(truthy(incoming.version) ? incoming.version : '').replace(/[^A-Za-z0-9.-]+/g, '') || 'unknown';
      const profileId = resolveProfileId(incoming.profile);
      const preRestore = incoming.kind === 'pre-restore';
      const stem = preRestore ? 'prerestore' : 'backup';
      const who = profileId === DEFAULT_PROFILE_ID ? '' : `${profileId}-`;
      const now = new Date();
      const stamp = preRestore ? `-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}` : '';
      const filename = `cert-study-${stem}-${who}${version}-${dateKey}${stamp}.json`;
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      writeFileAtomic(path.join(BACKUP_DIR, filename), pyDumps(incoming, 2));
      let pruned = [];
      try { pruned = preRestore ? [] : pruneBackups(profileId); } catch { pruned = []; }
      return json({ ok: true, filename, pruned: pruned.length });
    }
    if (pathname === '/api/avatar') {
      if (!isPlainObject(incoming) || !('dataUrl' in incoming)) return json({ error: 'expected {dataUrl}' }, 400);
      const avatarFile = avatarPathFor(resolveProfileId(incoming.profile));
      const dataUrl = incoming.dataUrl;
      if (dataUrl === null) {
        try { fs.unlinkSync(avatarFile); } catch { /* not there */ }
        return json({ ok: true });
      }
      const prefix = 'data:image/jpeg;base64,';
      if (typeof dataUrl !== 'string' || !dataUrl.startsWith(prefix)) return json({ error: 'expected a data:image/jpeg;base64 URL' }, 400);
      const b64 = dataUrl.slice(prefix.length);
      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b64)) return json({ error: 'bad base64' }, 400);
      const bytes = Buffer.from(b64, 'base64');
      if (bytes.length > 1000000) return json({ error: 'image too large' }, 400);
      writeFileAtomic(avatarFile, bytes);
      return json({ ok: true });
    }
    return empty404();
  }

  // The one entry point. `urlText` is the request path plus query ("/api/progress?profile=x").
  function handle(method, urlText, body) {
    try {
      const url = new URL(urlText, 'http://local');
      if (method === 'GET' || method === 'HEAD') {
        const api = url.pathname.startsWith('/api/') ? handleGet(url.pathname, url.searchParams) : null;
        return api || serveStatic(url.pathname);
      }
      if (method === 'POST') return handlePost(url.pathname, body || Buffer.alloc(0));
      return empty404();
    } catch (err) {
      return { status: 500, headers: { 'Content-Type': 'application/json' }, body: Buffer.from(JSON.stringify({ error: 'server error' })) };
    }
  }

  return { handle, paths: { DATA_DIR, BACKUP_DIR, FILES_DIR, PROGRESS_FILE, PROFILES_FILE }, _internal: { listBackups, pruneBackups, planBackupPruning, parseBackupName, loadRegistry, listShelfFiles } };
}

module.exports = { createBackend, pyDumps, writeFileAtomic, parseBackupName, planBackupPruning, DEFAULT_PROFILE_ID };
