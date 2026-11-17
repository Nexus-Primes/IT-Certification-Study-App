'use strict';
// "Import existing Cert Study data": moves a whole old setup (every account, the PIN registry,
// automatic backups, the document shelf) into the desktop app's data folder in one step.
// It only ever COPIES from the chosen folder, and first takes a safety backup of whatever is
// already in the app's data folder.
const fs = require('fs');
const path = require('path');
const { writeFileAtomic } = require('./backend');

const PROGRESS_RE = /^progress(?:-p[0-9a-f]{12})?\.json$/;
const AVATAR_RE = /^avatar(?:-p[0-9a-f]{12})?\.jpg$/;
const MAX_SHELF_FILES = 5000;

function isInside(child, parent) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function stamp(now = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
}

function copyTree(from, to, { skipLinks = true, filter } = {}) {
  let count = 0;
  const walk = (src, dst) => {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      if (skipLinks && entry.isSymbolicLink()) continue;
      const s = path.join(src, entry.name); const d = path.join(dst, entry.name);
      if (entry.isDirectory()) walk(s, d);
      else if (entry.isFile() && (!filter || filter(entry.name))) { fs.copyFileSync(s, d); count += 1; }
    }
  };
  walk(from, to);
  return count;
}

// A copy of the whole user-data folder (without other safety copies) that can be restored by hand.
function safetyBackup(dataRoot, label, now = new Date()) {
  if (!fs.existsSync(dataRoot)) return null;
  const dest = path.join(dataRoot, 'safety-backups', `${label}-${stamp(now)}`);
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(dataRoot, { withFileTypes: true })) {
    if (entry.name === 'safety-backups' || entry.isSymbolicLink()) continue;
    if (!['data', 'backup', 'files'].includes(entry.name)) continue;
    if (entry.isDirectory()) copyTree(path.join(dataRoot, entry.name), path.join(dest, entry.name));
  }
  return dest;
}

function pruneSafetyBackups(dataRoot, keep = 8) {
  const dir = path.join(dataRoot, 'safety-backups');
  let names;
  try { names = fs.readdirSync(dir).sort(); } catch { return; }
  for (const name of names.slice(0, Math.max(0, names.length - keep))) fs.rmSync(path.join(dir, name), { recursive: true, force: true });
}

// Finds where the account files are inside the folder the user picked.
function locate(sourceDir) {
  const hasProgress = dir => { try { return fs.readdirSync(dir).some(n => PROGRESS_RE.test(n) || n === 'profiles.json'); } catch { return false; } };
  const dataDir = [path.join(sourceDir, 'data'), sourceDir].find(hasProgress);
  const backupDir = path.join(sourceDir, 'backup');
  const filesDir = path.join(sourceDir, 'files');
  return { dataDir: dataDir || null, backupDir: fs.existsSync(backupDir) ? backupDir : null, filesDir: fs.existsSync(filesDir) ? filesDir : null };
}

function inspect(sourceDir, dataRoot) {
  if (!sourceDir || !fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) return { ok: false, error: 'That folder could not be read.' };
  if (isInside(sourceDir, dataRoot) || isInside(dataRoot, sourceDir)) return { ok: false, error: "That is this app's own data folder (or contains it). Pick the old study-app folder or your legacy data folder instead." };
  const found = locate(sourceDir);
  if (!found.dataDir) return { ok: false, error: 'No Cert Study progress files were found there. Pick the old study-app folder, or a folder that holds progress.json and profiles.json.' };
  const progress = []; const bad = [];
  for (const name of fs.readdirSync(found.dataDir).filter(n => PROGRESS_RE.test(n)).sort()) {
    try {
      const value = JSON.parse(fs.readFileSync(path.join(found.dataDir, name), 'utf8'));
      if (value && typeof value === 'object' && !Array.isArray(value)) progress.push(name); else bad.push(name);
    } catch { bad.push(name); }
  }
  let registryOk = null;
  const regFile = path.join(found.dataDir, 'profiles.json');
  if (fs.existsSync(regFile)) {
    try {
      const reg = JSON.parse(fs.readFileSync(regFile, 'utf8'));
      registryOk = Array.isArray(reg) ? reg.length > 0 : !!(reg && Array.isArray(reg.profiles) && reg.profiles.length);
    } catch { registryOk = false; }
  }
  if (!progress.length && !registryOk) return { ok: false, error: 'Those files are not readable Cert Study data (they are damaged or not the right kind of file).' };
  return { ok: true, found, progress, bad, registry: registryOk === true };
}

function importLegacyData({ sourceDir, dataRoot, now = new Date() }) {
  const info = inspect(sourceDir, dataRoot);
  if (!info.ok) return info;
  const safety = safetyBackup(dataRoot, 'before-import', now);
  const target = { data: path.join(dataRoot, 'data'), backup: path.join(dataRoot, 'backup'), files: path.join(dataRoot, 'files') };
  fs.mkdirSync(target.data, { recursive: true });
  const copied = { accounts: 0, backups: 0, files: 0, skipped: info.bad };
  for (const name of info.progress) { writeFileAtomic(path.join(target.data, name), fs.readFileSync(path.join(info.found.dataDir, name))); copied.accounts += 1; }
  if (info.registry) writeFileAtomic(path.join(target.data, 'profiles.json'), fs.readFileSync(path.join(info.found.dataDir, 'profiles.json')));
  for (const name of fs.readdirSync(info.found.dataDir).filter(n => AVATAR_RE.test(n))) fs.copyFileSync(path.join(info.found.dataDir, name), path.join(target.data, name));
  if (info.found.backupDir) {
    fs.mkdirSync(target.backup, { recursive: true });
    for (const entry of fs.readdirSync(info.found.backupDir, { withFileTypes: true })) {
      if (!entry.isFile() || entry.isSymbolicLink()) continue;
      fs.copyFileSync(path.join(info.found.backupDir, entry.name), path.join(target.backup, entry.name)); copied.backups += 1;
    }
  }
  if (info.found.filesDir) copied.files = copyTree(info.found.filesDir, target.files, { filter: () => copied.files < MAX_SHELF_FILES });
  pruneSafetyBackups(dataRoot);
  return { ok: true, copied, safetyBackup: safety };
}

module.exports = { importLegacyData, inspect, safetyBackup, pruneSafetyBackups, isInside, stamp };
