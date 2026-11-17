'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const APP_ROOT = path.resolve(__dirname, '..', '..');
function tempDir(label) { return fs.mkdtempSync(path.join(os.tmpdir(), `certstudy-${label}-`)); }
function rmrf(dir) { fs.rmSync(dir, { recursive: true, force: true }); }
async function call(port, method, url, body) {
  const res = await fetch(`http://127.0.0.1:${port}${url}`, { method, headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, text, json, type: res.headers.get('content-type') };
}
module.exports = { APP_ROOT, tempDir, rmrf, call };
