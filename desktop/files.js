'use strict';
// File jobs for the desktop app: adding documents to the shelf, and backing up everything.
// Pure Node, no Electron, so they are tested directly. The native dialogs live in main.js.
const fs = require('fs');
const path = require('path');
const { copyTree, isInside, stamp } = require('./import-data');

const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024; // a shelf of manuals, not of videos

// "Manual.pdf" -> "Manual (2).pdf" if that name is taken. Never overwrites a file you already have.
function uniqueName(dir, name) {
  if (!fs.existsSync(path.join(dir, name))) return name;
  const ext = path.extname(name); const base = name.slice(0, name.length - ext.length);
  for (let n = 2; n < 1000; n++) { const candidate = `${base} (${n})${ext}`; if (!fs.existsSync(path.join(dir, candidate))) return candidate; }
  throw new Error('too many files with that name');
}

// `sources` are absolute paths the user picked or dropped. Folders are added with their files.
function addToShelf({ dataRoot, sources }) {
  const shelf = path.join(dataRoot, 'files');
  fs.mkdirSync(shelf, { recursive: true });
  const added = []; const skipped = [];
  const addOne = (src, into) => {
    let st;
    try { st = fs.lstatSync(src); } catch { skipped.push(path.basename(String(src))); return; }
    const name = path.basename(src);
    if (st.isSymbolicLink() || name.startsWith('.')) { skipped.push(name); return; }
    if (st.isDirectory()) {
      const sub = path.join(into, uniqueName(into, name)); fs.mkdirSync(sub, { recursive: true });
      for (const child of fs.readdirSync(src)) addOne(path.join(src, child), sub);
      return;
    }
    if (!st.isFile() || st.size > MAX_FILE_BYTES) { skipped.push(name); return; }
    const target = path.join(into, uniqueName(into, name));
    fs.copyFileSync(src, target, fs.constants.COPYFILE_EXCL);
    added.push(path.relative(shelf, target).split(path.sep).join('/'));
  };
  for (const src of Array.isArray(sources) ? sources : []) {
    if (typeof src !== 'string' || !path.isAbsolute(src) || isInside(src, dataRoot)) { skipped.push(String(src).slice(-60)); continue; }
    addOne(src, shelf);
  }
  return { ok: true, added, skipped };
}

// A dated copy of everything the app keeps (accounts, progress, PIN registry, avatars, backups,
// document shelf) in a folder the user chooses. Copies only; nothing is moved or deleted.
function backupEverything({ dataRoot, destDir, now = new Date() }) {
  if (!destDir || !fs.existsSync(destDir) || !fs.statSync(destDir).isDirectory()) return { ok: false, error: 'That folder could not be used.' };
  if (isInside(destDir, dataRoot) || isInside(dataRoot, destDir)) return { ok: false, error: "Choose a folder outside the app's own data folder." };
  const folder = path.join(destDir, `Cert Study backup ${stamp(now)}`);
  let files = 0;
  for (const name of ['data', 'backup', 'files']) {
    const from = path.join(dataRoot, name);
    if (fs.existsSync(from)) files += copyTree(from, path.join(folder, name));
  }
  return { ok: true, folder, files };
}

module.exports = { addToShelf, backupEverything, uniqueName };
