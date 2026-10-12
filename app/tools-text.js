// ---------- Tools: small local text tools ----------
// Regex tester, Base64/URL/hex encoding, SHA hashes (text or a whole file, for checking a download),
// a JSON formatter, and a password generator. Everything runs in this page; nothing you type or generate
// is sent anywhere or saved. The work is plain exported functions so it can be checked on its own.

import { hashParams, debounce, copyText } from './tools-core.js?v=1';

// ---------------- encoding ----------------
const bytesToBinary = bytes => { let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return bin; };

export function base64Encode(text, urlSafe = false) {
  const b64 = btoa(bytesToBinary(new TextEncoder().encode(text)));
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}
export function base64Decode(text) {
  let t = String(text).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(t) || t.length % 4 === 1) return { ok: false, error: 'That is not valid Base64.' };
  while (t.length % 4) t += '=';
  try {
    const bytes = Uint8Array.from(atob(t), ch => ch.charCodeAt(0));
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch { return { ok: false, error: 'It decoded, but the result is not valid UTF-8 text (it may be binary data).' }; }
}
export function hexEncode(text) { return [...new TextEncoder().encode(text)].map(b => b.toString(16).padStart(2, '0')).join(''); }
export function hexDecode(text) {
  const t = String(text).replace(/[\s:]|0x/gi, '');
  if (!/^([0-9a-f]{2})*$/i.test(t)) return { ok: false, error: 'That is not valid hex (an even number of 0-9 and a-f characters).' };
  try { return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(t.match(/../g) || [], h => parseInt(h, 16))) }; }
  catch { return { ok: false, error: 'It decoded, but the result is not valid UTF-8 text.' }; }
}
export function urlDecode(text) { try { return { ok: true, text: decodeURIComponent(String(text).replace(/\+/g, ' ')) }; } catch { return { ok: false, error: 'That is not valid URL encoding.' }; } }

// ---------------- hashing ----------------
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);

// SHA-256 that can be fed in pieces, so a multi-gigabyte ISO can be hashed without loading it into memory.
export class Sha256 {
  constructor() {
    this.h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    this.buf = new Uint8Array(64); this.bufLen = 0; this.total = 0; this.w = new Uint32Array(64);
  }
  _block(chunk, off) {
    const w = this.w;
    for (let i = 0; i < 16; i++) w[i] = (chunk[off + 4 * i] << 24) | (chunk[off + 4 * i + 1] << 16) | (chunk[off + 4 * i + 2] << 8) | chunk[off + 4 * i + 3];
    for (let i = 16; i < 64; i++) {
      const a = w[i - 15], b = w[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = this.h[0], b = this.h[1], c = this.h[2], d = this.h[3], e = this.h[4], f = this.h[5], g = this.h[6], h = this.h[7];
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    this.h[0] += a; this.h[1] += b; this.h[2] += c; this.h[3] += d; this.h[4] += e; this.h[5] += f; this.h[6] += g; this.h[7] += h;
  }
  update(bytes) {
    this.total += bytes.length;
    let i = 0;
    if (this.bufLen) {
      while (i < bytes.length && this.bufLen < 64) this.buf[this.bufLen++] = bytes[i++];
      if (this.bufLen === 64) { this._block(this.buf, 0); this.bufLen = 0; }
    }
    for (; i + 64 <= bytes.length; i += 64) this._block(bytes, i);
    while (i < bytes.length) this.buf[this.bufLen++] = bytes[i++];
    return this;
  }
  digest() {
    const bits = this.total * 8;
    const tail = new Uint8Array(((this.bufLen + 9 + 63) >> 6) << 6);
    tail.set(this.buf.subarray(0, this.bufLen)); tail[this.bufLen] = 0x80;
    const view = new DataView(tail.buffer);
    view.setUint32(tail.length - 8, Math.floor(bits / 0x100000000)); view.setUint32(tail.length - 4, bits >>> 0);
    for (let i = 0; i < tail.length; i += 64) this._block(tail, i);
    return [...this.h].map(n => n.toString(16).padStart(8, '0')).join('');
  }
}

const toHex = buffer => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
export async function hashText(text, algorithm) { return toHex(await crypto.subtle.digest(algorithm, new TextEncoder().encode(text))); }

// SHA-256 streams in 4 MB pieces, so any size works; the other algorithms need the whole file in memory.
export const WHOLE_FILE_LIMIT = 512 * 1024 * 1024;
export async function hashFile(file, algorithm, onProgress) {
  if (algorithm === 'SHA-256') {
    const sha = new Sha256(), reader = file.stream().getReader();
    let done = 0, sinceYield = 0;
    for (;;) {
      const { value, done: finished } = await reader.read();
      if (finished) break;
      sha.update(value); done += value.length; sinceYield += value.length;
      if (sinceYield > 16 * 1024 * 1024) { sinceYield = 0; if (onProgress) onProgress(done / (file.size || 1)); await new Promise(r => setTimeout(r)); }
    }
    if (onProgress) onProgress(1);
    return sha.digest();
  }
  if (file.size > WHOLE_FILE_LIMIT) return null;
  return toHex(await crypto.subtle.digest(algorithm, await file.arrayBuffer()));
}

// ---------------- JSON ----------------
function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, sortDeep(value[k])]));
  return value;
}
function describeJsonError(error, text) {
  const message = String(error && error.message || error);
  const lc = /line (\d+) column (\d+)/.exec(message), pos = /position (\d+)/.exec(message);
  let line, column;
  if (lc) { line = Number(lc[1]); column = Number(lc[2]); }
  else if (pos) { const before = text.slice(0, Number(pos[1])); line = before.split('\n').length; column = before.length - before.lastIndexOf('\n'); }
  return { message, line, column };
}
export function formatJson(text, { indent = 2, sortKeys = false } = {}) {
  if (!String(text).trim()) return { ok: false, error: { message: 'Paste some JSON first.' } };
  let value;
  try { value = JSON.parse(text); } catch (error) { return { ok: false, error: describeJsonError(error, text) }; }
  if (sortKeys) value = sortDeep(value);
  return { ok: true, text: JSON.stringify(value, null, indent === 'tab' ? '\t' : Number(indent)) };
}
export function minifyJson(text, sortKeys = false) {
  const result = formatJson(text, { sortKeys });
  return result.ok ? { ok: true, text: JSON.stringify(JSON.parse(result.text)) } : result;
}

// ---------------- regex ----------------
// Self-contained on purpose: its source is copied into a worker so a runaway pattern can be stopped.
function runRegexCore(pattern, flags, text, replacement) {
  let re;
  try { re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'); } catch (error) { return { ok: false, error: error.message }; }
  const matches = [];
  let m, guard = 0;
  while ((m = re.exec(text)) !== null && matches.length < 500 && ++guard < 200000) {
    matches.push({ index: m.index, text: m[0], groups: m.slice(1).map(g => (g === undefined ? null : g)), named: m.groups ? { ...m.groups } : null });
    if (m[0] === '') re.lastIndex++;
  }
  let replaced = null;
  if (replacement !== null && replacement !== undefined && replacement !== '') {
    try { replaced = text.replace(new RegExp(pattern, flags), replacement); } catch { replaced = null; }
  }
  return { ok: true, matches, replaced, truncated: matches.length >= 500 };
}
export { runRegexCore };

export function runRegex(pattern, flags, text, replacement, timeoutMs = 1500) {
  if (!pattern) return Promise.resolve({ ok: true, matches: [], replaced: null });
  if (text.length > 200000) return Promise.resolve({ ok: false, error: 'That text is too long for the tester (limit 200,000 characters).' });
  return new Promise(resolve => {
    let worker, url;
    try {
      url = URL.createObjectURL(new Blob([`const run = ${runRegexCore.toString()}; onmessage = e => postMessage(run(...e.data));`], { type: 'text/javascript' }));
      worker = new Worker(url);
    } catch { resolve(runRegexCore(pattern, flags, text, replacement)); return; }
    let timer;
    const finish = result => { clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); resolve(result); };
    timer = setTimeout(() => finish({ ok: false, error: `That pattern took longer than ${timeoutMs / 1000} seconds on this text and was stopped. Nested repeats such as (a+)+ can backtrack catastrophically.` }), timeoutMs);
    worker.onmessage = event => finish(event.data);
    worker.onerror = () => finish({ ok: false, error: 'The pattern could not be run.' });
    worker.postMessage([pattern, flags, text, replacement]);
  });
}

// ---------------- passwords ----------------
export const CHARSETS = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?/' };

// Uniform in [0, max) by rejection sampling, so there is no modulo bias.
export function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max, buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return buf[0] % max;
}
export function generatePassword({ length = 16, lower = true, upper = true, digits = true, symbols = true, avoidAmbiguous = true } = {}) {
  const strip = set => (avoidAmbiguous ? set.replace(/[0Oo1lI|]/g, '') : set);
  const sets = Object.entries({ lower, upper, digits, symbols }).filter(([, on]) => on).map(([name]) => strip(CHARSETS[name]));
  if (!sets.length) return null;
  const size = Math.max(sets.length, Math.min(128, Math.max(8, Math.round(length))));
  const pool = sets.join('');
  const chars = sets.map(set => set[randomInt(set.length)]);          // at least one from every chosen kind
  while (chars.length < size) chars.push(pool[randomInt(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) { const j = randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  return chars.join('');
}
export const poolSize = options => ['lower', 'upper', 'digits', 'symbols'].filter(k => options[k]).map(k => (options.avoidAmbiguous ? CHARSETS[k].replace(/[0Oo1lI|]/g, '') : CHARSETS[k])).join('').length;
export const entropyBits = (length, pool) => (pool > 1 ? length * Math.log2(pool) : 0);

// ---------------- the page ----------------
export function createTextTools(ctx) {
  const { main, icon, escapeHtml: esc, toast } = ctx;
  const TABS = [['regex', 'Regex tester'], ['encode', 'Base64 / URL / hex'], ['hash', 'Hashes'], ['json', 'JSON'], ['password', 'Passwords']];
  const $ = id => document.getElementById(id);
  const copy = async text => { const ok = await copyText(text); toast(ok ? 'Copied.' : 'Could not copy. Select the text and press Ctrl+C.', ok ? 'info' : 'error'); };

  const tabHtml = {
    regex: () => `<section class="panel"><div class="panel-body" style="padding-top:22px">
      <div class="tx-row"><div class="field"><label for="rx-pattern">Pattern</label><input id="rx-pattern" class="mono" type="text" value="(\\d+)\\.(\\d+)" autocomplete="off" spellcheck="false"></div>
        <div class="tx-flags" role="group" aria-label="Flags">${['g', 'i', 'm', 's', 'u'].map(f => `<label class="tx-flag"><input type="checkbox" data-flag="${f}" ${f === 'g' ? 'checked' : ''}> ${f}</label>`).join('')}</div></div>
      <div class="field" style="margin-top:12px"><label for="rx-replace">Replace with (optional; use $1, $&amp;)</label><input id="rx-replace" class="mono" type="text" autocomplete="off" spellcheck="false"></div>
      <div class="field" style="margin-top:12px"><label for="rx-text">Test text</label><textarea id="rx-text" rows="6" spellcheck="false">Version 10.4 and 11.0 shipped; 3CX V20 U10.</textarea></div>
      <p id="rx-status" class="muted-line" style="margin-top:12px" role="status"></p><pre id="rx-preview" class="tx-preview" aria-label="Text with matches highlighted"></pre>
      <div id="rx-matches"></div><div id="rx-replaced"></div></div></section>`,
    encode: () => `<section class="panel"><div class="panel-body" style="padding-top:22px">
      <div class="field"><label for="enc-in">Input</label><textarea id="enc-in" rows="5" spellcheck="false">Hello, 3CX! café</textarea></div>
      <div class="button-row" style="margin:12px 0">${[['b64e', 'Base64 encode'], ['b64u', 'Base64url encode'], ['b64d', 'Base64 decode'], ['urle', 'URL encode'], ['urld', 'URL decode'], ['hexe', 'Hex encode'], ['hexd', 'Hex decode']].map(([id, label]) => `<button class="secondary small" data-tx="enc" data-op="${id}">${label}</button>`).join('')}</div>
      <div class="field"><label for="enc-out">Result</label><textarea id="enc-out" rows="5" readonly spellcheck="false"></textarea></div>
      <p id="enc-status" class="muted-line" style="margin-top:8px" role="status"></p>
      <div class="button-row" style="margin-top:8px"><button class="ghost small" data-tx="enc-copy">Copy result</button><button class="ghost small" data-tx="enc-swap">Use result as input</button></div></div></section>`,
    hash: () => `<section class="panel"><div class="panel-body" style="padding-top:22px">
      <div class="field"><label for="h-text">Text to hash</label><textarea id="h-text" rows="3" spellcheck="false">abc</textarea></div>
      <div class="field" style="margin-top:14px"><label for="h-file">Or hash a file (for checking a download against its published checksum)</label><input id="h-file" type="file"></div>
      <progress id="h-progress" max="1" value="0" class="hidden" aria-label="Hashing progress" style="width:100%;margin-top:10px"></progress>
      <div class="field" style="margin-top:14px"><label for="h-expected">Expected hash (optional)</label><input id="h-expected" class="mono" type="text" placeholder="Paste the published SHA-256 here" autocomplete="off" spellcheck="false"></div>
      <p id="h-compare" class="muted-line" style="margin-top:8px" role="status"></p><div id="h-results" style="margin-top:10px"></div>
      <p class="muted-line" style="margin-top:12px">SHA-256 reads a file in pieces, so any size works. The other algorithms load the whole file and stop at 512 MB. MD5 is not offered because the browser's crypto does not include it.</p></div></section>`,
    json: () => `<section class="panel"><div class="panel-body" style="padding-top:22px">
      <div class="field"><label for="js-in">JSON</label><textarea id="js-in" rows="9" spellcheck="false">{"pbx":{"fqdn":"pbx.example.com","ports":[5060,5090],"tunnel":true}}</textarea></div>
      <div class="button-row" style="margin:12px 0;align-items:center"><button class="primary small" data-tx="js-format">Format</button><button class="secondary small" data-tx="js-min">Minify</button>
        <label class="tx-flag"><input type="checkbox" id="js-sort"> Sort keys</label>
        <select id="js-indent" aria-label="Indent" data-enhanced="1"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></div>
      <p id="js-status" class="muted-line" role="status"></p>
      <div class="field" style="margin-top:8px"><label for="js-out">Result</label><textarea id="js-out" rows="9" readonly spellcheck="false"></textarea></div>
      <div class="button-row" style="margin-top:8px"><button class="ghost small" data-tx="js-copy">Copy result</button></div>
      <p class="muted-line" style="margin-top:10px">Numbers with more than 15 or 16 digits lose precision when reformatted.</p></div></section>`,
    password: () => `<section class="panel"><div class="panel-body" style="padding-top:22px">
      <div class="calc-form"><div class="field"><label for="pw-length">Length</label><input id="pw-length" type="number" min="8" max="128" value="20"></div>
        ${[['lower', 'Lowercase', 1], ['upper', 'Uppercase', 1], ['digits', 'Digits', 1], ['symbols', 'Symbols', 1], ['avoidAmbiguous', 'Avoid look-alikes (0 O o 1 l I |)', 1]].map(([k, label]) => `<div class="field"><label for="pw-${k}">${k === 'avoidAmbiguous' ? 'Readability' : label}</label><div class="toggle-line"><label class="switch"><input id="pw-${k}" type="checkbox" checked><span></span></label><span>${label}</span></div></div>`).join('')}</div>
      <div class="button-row" style="margin-top:14px"><button class="primary" data-tx="pw-generate">Generate</button></div>
      <p id="pw-entropy" class="muted-line" style="margin-top:12px" role="status"></p><ul id="pw-list" class="tx-passwords"></ul>
      <p class="muted-line">Passwords are made in this page with the browser's secure random generator. They are never saved or sent anywhere and disappear when you leave this page.</p></div></section>`
  };

  function render() {
    const tab = tabHtml[hashParams().tab] ? hashParams().tab : 'regex';
    main.innerHTML = `<div class="tool-page" id="tx-root" data-tab="${tab}">
      <div class="section-head"><div><h2>Text tools</h2><p>Small tools that run entirely in this page. Nothing you type here is saved or sent anywhere.</p></div></div>
      <div class="tab-row" role="tablist" aria-label="Text tools">${TABS.map(([id, label]) => `<button class="tab-button${tab === id ? ' active' : ''}" role="tab" aria-selected="${tab === id}" data-tx-tab="${id}">${label}</button>`).join('')}</div>
      ${tabHtml[tab]()}</div>`;
    const root = $('tx-root');
    root.addEventListener('click', event => { const tabBtn = event.target.closest('[data-tx-tab]'); if (tabBtn) location.hash = `texttools?tab=${tabBtn.dataset.txTab}`; });
    ({ regex: wireRegex, encode: wireEncode, hash: wireHash, json: wireJson, password: wirePassword }[tab])(root);
  }

  // ----- regex -----
  function wireRegex(root) {
    let token = 0;
    const run = async () => {
      const mine = ++token;
      const flags = [...root.querySelectorAll('[data-flag]:checked')].map(c => c.dataset.flag).join('');
      const text = $('rx-text').value;
      const result = await runRegex($('rx-pattern').value, flags, text, $('rx-replace').value);
      if (mine !== token || !$('rx-status')) return;
      if (!result.ok) { $('rx-status').textContent = result.error; $('rx-status').classList.add('is-error'); $('rx-preview').innerHTML = esc(text); $('rx-matches').innerHTML = ''; $('rx-replaced').innerHTML = ''; return; }
      $('rx-status').classList.remove('is-error');
      $('rx-status').textContent = `${result.matches.length}${result.truncated ? '+' : ''} match${result.matches.length === 1 ? '' : 'es'}`;
      let html = '', last = 0;
      result.matches.forEach(m => { if (!m.text) return; html += esc(text.slice(last, m.index)) + `<mark>${esc(m.text)}</mark>`; last = m.index + m.text.length; });
      $('rx-preview').innerHTML = html + esc(text.slice(last));
      $('rx-matches').innerHTML = result.matches.length ? `<div class="table-wrap"><table class="net-table calc-table"><thead><tr><th>#</th><th>Index</th><th>Match</th><th>Groups</th></tr></thead><tbody>${result.matches.slice(0, 100).map((m, i) => `<tr><td>${i + 1}</td><td>${m.index}</td><td class="mono">${esc(m.text)}</td><td class="mono">${m.groups.map((g, n) => `${n + 1}: ${g === null ? '—' : esc(g)}`).join(' · ')}${m.named ? ' · ' + esc(JSON.stringify(m.named)) : ''}</td></tr>`).join('')}</tbody></table></div>` : '';
      $('rx-replaced').innerHTML = result.replaced !== null ? `<div class="field" style="margin-top:12px"><label for="rx-result">After replacing</label><textarea id="rx-result" rows="4" readonly>${esc(result.replaced)}</textarea></div>` : '';
    };
    const later = debounce(run, 150);
    root.addEventListener('input', later); root.addEventListener('change', later); run();
  }

  // ----- encode -----
  function wireEncode(root) {
    root.addEventListener('click', event => {
      const el = event.target.closest('[data-tx]'); if (!el) return;
      const input = $('enc-in').value, status = $('enc-status');
      if (el.dataset.tx === 'enc') {
        const ops = { b64e: () => ({ ok: true, text: base64Encode(input) }), b64u: () => ({ ok: true, text: base64Encode(input, true) }), b64d: () => base64Decode(input),
          urle: () => ({ ok: true, text: encodeURIComponent(input) }), urld: () => urlDecode(input), hexe: () => ({ ok: true, text: hexEncode(input) }), hexd: () => hexDecode(input) };
        const r = ops[el.dataset.op]();
        $('enc-out').value = r.ok ? r.text : ''; status.textContent = r.ok ? `${r.text.length} characters` : r.error; status.classList.toggle('is-error', !r.ok);
      } else if (el.dataset.tx === 'enc-copy') copy($('enc-out').value);
      else if (el.dataset.tx === 'enc-swap') { $('enc-in').value = $('enc-out').value; $('enc-out').value = ''; }
    });
  }

  // ----- hash -----
  function wireHash(root) {
    let results = {}, token = 0;
    const showResults = () => {
      $('h-results').innerHTML = `<div class="table-wrap"><table class="net-table calc-table"><thead><tr><th>Algorithm</th><th>Hash</th></tr></thead><tbody>${HASH_ALGORITHMS.map(a => `<tr><td>${a}</td><td class="mono tx-hash">${results[a] ? esc(results[a]) : '—'}</td></tr>`).join('')}</tbody></table></div>`;
      const expected = $('h-expected').value.replace(/\s+/g, '').toLowerCase(), out = $('h-compare');
      if (!expected) { out.textContent = ''; out.className = 'muted-line'; return; }
      const hit = HASH_ALGORITHMS.find(a => results[a] && results[a] === expected);
      out.textContent = hit ? `Matches the ${hit} hash.` : 'Does not match any hash shown here.';
      out.className = `calc-probe-result ${hit ? 'is-yes' : 'is-no'}`;
    };
    const hashTyped = async () => {
      const mine = ++token, text = $('h-text').value, next = {};
      for (const a of HASH_ALGORITHMS) next[a] = await hashText(text, a);
      if (mine === token) { results = next; showResults(); }
    };
    const hashChosen = async file => {
      const mine = ++token, bar = $('h-progress'); bar.classList.remove('hidden'); bar.value = 0;
      const next = {};
      for (const a of HASH_ALGORITHMS) { next[a] = await hashFile(file, a, a === 'SHA-256' ? p => { if (mine === token) bar.value = p; } : null) || null; if (mine !== token) return; }
      bar.classList.add('hidden'); results = next; showResults();
      if (!next['SHA-1'] && file.size > WHOLE_FILE_LIMIT) toast('Only SHA-256 is calculated for files this large.', 'info');
    };
    root.addEventListener('input', event => { if (event.target.id === 'h-text') { $('h-file').value = ''; hashTyped(); } else if (event.target.id === 'h-expected') showResults(); });
    root.addEventListener('change', event => { if (event.target.id === 'h-file' && event.target.files[0]) hashChosen(event.target.files[0]); });
    hashTyped();
  }

  // ----- json -----
  function wireJson(root) {
    root.addEventListener('click', event => {
      const el = event.target.closest('[data-tx]'); if (!el) return;
      if (el.dataset.tx === 'js-copy') { copy($('js-out').value); return; }
      const text = $('js-in').value, sortKeys = $('js-sort').checked;
      const r = el.dataset.tx === 'js-min' ? minifyJson(text, sortKeys) : formatJson(text, { indent: $('js-indent').value, sortKeys });
      const status = $('js-status');
      if (r.ok) { $('js-out').value = r.text; status.textContent = `Valid JSON, ${r.text.length.toLocaleString()} characters.`; status.className = 'calc-probe-result is-yes'; }
      else { $('js-out').value = ''; status.textContent = `${r.error.message}${r.error.line ? ` (line ${r.error.line}, column ${r.error.column})` : ''}`; status.className = 'calc-probe-result is-no'; }
    });
  }

  // ----- passwords -----
  function wirePassword(root) {
    const options = () => ({ length: Number($('pw-length').value) || 20, lower: $('pw-lower').checked, upper: $('pw-upper').checked, digits: $('pw-digits').checked, symbols: $('pw-symbols').checked, avoidAmbiguous: $('pw-avoidAmbiguous').checked });
    const generate = () => {
      const o = options(), list = $('pw-list');
      const first = generatePassword(o);
      if (first === null) { list.innerHTML = ''; $('pw-entropy').textContent = 'Choose at least one kind of character.'; return; }
      const passwords = [first, ...Array.from({ length: 4 }, () => generatePassword(o))];
      const bits = entropyBits(first.length, poolSize(o));
      $('pw-entropy').textContent = `About ${Math.round(bits)} bits of entropy per password. ${bits >= 100 ? 'Very strong.' : bits >= 70 ? 'Strong.' : bits >= 50 ? 'Fair: fine for low-risk accounts.' : 'Weak: make it longer.'}`;
      list.innerHTML = passwords.map((p, i) => `<li><code class="mono tx-pw">${esc(p)}</code><button class="ghost small" data-tx="pw-copy" data-i="${i}" aria-label="Copy password ${i + 1}">${icon('clipboard')}</button></li>`).join('');
      list.dataset.values = JSON.stringify(passwords);
    };
    root.addEventListener('click', event => {
      const el = event.target.closest('[data-tx]'); if (!el) return;
      if (el.dataset.tx === 'pw-generate') generate();
      else if (el.dataset.tx === 'pw-copy') copy(JSON.parse($('pw-list').dataset.values)[Number(el.dataset.i)]);
    });
    root.addEventListener('change', generate);
    generate();
  }

  return { render };
}
