// ---------- Tools: shared state shape and small helpers ----------
// The Tools pages (runbooks, network sheet, calculators, timers, document shelf, text tools) keep
// their data under one account-level key ("app-tools"), next to the study plan and app meta. Nothing
// here touches the DOM or app state; each tool module receives the live state through its context.

import { buildCsv, downloadText } from './exports.js?v=1';

export { buildCsv, downloadText };

export function defaultTools() {
  return {
    version: 1,
    runbooks: { custom: [], runs: [] },
    network: { subnets: [], devices: [], extensions: [], dids: [] },
    timers: { countdowns: [], events: [], stopwatch: { running: false, startedAt: 0, elapsed: 0, laps: [] } },
    shelf: { meta: {} },
    calc: {}
  };
}

const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const arrayOr = (value, fallback = []) => (Array.isArray(value) ? value : fallback);

// Fills in anything missing or the wrong shape, so a half-written or older save still opens cleanly.
export function toolsFromRemote(raw) {
  const base = defaultTools();
  if (!isObject(raw)) return base;
  const stopwatch = isObject(raw.timers && raw.timers.stopwatch) ? { ...base.timers.stopwatch, ...raw.timers.stopwatch, laps: arrayOr(raw.timers.stopwatch.laps) } : base.timers.stopwatch;
  return {
    ...base, ...raw,
    runbooks: { custom: arrayOr(raw.runbooks && raw.runbooks.custom), runs: arrayOr(raw.runbooks && raw.runbooks.runs) },
    network: {
      subnets: arrayOr(raw.network && raw.network.subnets), devices: arrayOr(raw.network && raw.network.devices),
      extensions: arrayOr(raw.network && raw.network.extensions), dids: arrayOr(raw.network && raw.network.dids)
    },
    timers: { countdowns: arrayOr(raw.timers && raw.timers.countdowns), events: arrayOr(raw.timers && raw.timers.events), stopwatch },
    shelf: { meta: isObject(raw.shelf && raw.shelf.meta) ? raw.shelf.meta : {} },
    calc: isObject(raw.calc) ? raw.calc : {}
  };
}

export const uid = (prefix = 't') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function debounce(fn, ms = 400) {
  let handle = null;
  const wrapped = (...args) => { clearTimeout(handle); handle = setTimeout(() => { handle = null; fn(...args); }, ms); };
  wrapped.flush = (...args) => { if (handle != null) { clearTimeout(handle); handle = null; fn(...args); } };
  return wrapped;
}

// The query part of the hash, so a tool page can live at "#runbooks?run=abc".
export function hashParams() {
  const query = (location.hash.split('?')[1] || '');
  const out = {};
  query.split('&').filter(Boolean).forEach(pair => {
    const [key, value = ''] = pair.split('=');
    try { out[decodeURIComponent(key)] = decodeURIComponent(value); } catch { out[key] = value; }
  });
  return out;
}

// RFC 4180: quoted fields, doubled quotes, CRLF or LF, blank lines skipped.
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const input = String(text || '').replace(/^﻿/, '');
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') { if (input[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(cell => cell.trim() !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some(cell => cell.trim() !== '')) rows.push(row);
  return rows;
}

export function formatClock(ms, withCentis = false) {
  const total = Math.max(0, Math.floor(ms));
  const s = Math.floor(total / 1000) % 60, m = Math.floor(total / 60000) % 60, h = Math.floor(total / 3600000);
  const base = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return withCentis ? `${base}.${String(Math.floor((total % 1000) / 10)).padStart(2, '0')}` : base;
}

export function fileStamp(date = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function safeFileName(text) {
  return String(text || 'export').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'export';
}

export function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => false);
  return Promise.resolve(false);
}
