// ---------- Pure utilities ----------
// Everything in this module is side-effect-free: no reference to `state`, `activeSession`,
// `CERT`, or any other app-runtime value — just inputs in, output out. That's what makes it
// safe to split out of the main app.js closure as a real ES module: nothing here needs to share
// mutable state with the rest of the app, so there's no shared-state plumbing to get wrong.
// Loaded via `import` from app.js, which itself now runs as `<script type="module">`.

export const letters = ['A', 'B', 'C', 'D'];

export const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  terminal: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3M12 15h5"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
  chart: '<path d="M4 19V9M10 19V5M16 19v-8M22 19H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.53-1H3v-4h.08A1.7 1.7 0 0 0 4.6 8.96a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.96 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.04 1.53 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
  flame: '<path d="M12 22c4.4 0 7-3 7-7.2 0-3.2-2-6.3-5.3-9.6.2 2.5-.9 4.2-2.5 5.2.2-3.1-1.5-5.6-3.5-7.4.2 3.7-2.7 6-2.7 10.8C5 18.7 7.8 22 12 22Z"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>', check: '<path d="m5 12 4 4L19 6"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  brain: '<path d="M9.5 4A3 3 0 0 0 4 5.7 3 3 0 0 0 3.5 11 3.5 3.5 0 0 0 6 17a3 3 0 0 0 3.5 3V4ZM14.5 4A3 3 0 0 1 20 5.7a3 3 0 0 1 .5 5.3 3.5 3.5 0 0 1-2.5 6 3 3 0 0 1-3.5 3V4ZM9.5 9H7M14.5 9H17M9.5 14H7M14.5 14H17"/>',
  trophy: '<path d="M8 3h8v5a4 4 0 0 1-8 0V3Z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6"/>',
  repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
  alert: '<path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', flag: '<path d="M5 22V4M5 4h11l-2 4 2 4H5"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>', download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 21h14"/>', trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
  external: '<path d="M14 3h7v7M21 3l-9 9M18 13v7H4V6h7"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  rotate: '<path d="M20 11a8 8 0 1 0-2 6M20 5v6h-6"/>', bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>',
  filter: '<path d="M4 5h16M7 12h10M10 19h4"/>', spark: '<path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  crossword: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/><rect x="3" y="3" width="9" height="9" fill="currentColor"/><rect x="12" y="12" width="9" height="9" fill="currentColor"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  command: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z"/>',
  keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M9 13h6"/>',
  sparkles: '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/>',
  cap: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.83L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.9a2 2 0 0 0 1.66 0l8.59-3.9Z"/><path d="M22 10v6"/><path d="M6 12.5V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-3.5"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/>'
};

export function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
}

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = icon(node.dataset.icon); });
}

export function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

export function pct(value, total) { return total ? Math.round((value / total) * 100) : 0; }

// toISOString() converts to UTC first, so anyone not exactly at UTC+0 gets the wrong calendar
// day for part of every day (e.g. UTC-4 rolls "tomorrow" over at 8pm local, UTC+9 stays on
// "yesterday" past local midnight) — every date-key in the app needs to reflect the browser's
// own local date instead, so this is the one place that formatting happens.
export function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function todayKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
}

export function addDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

// Both keys are plain YYYY-MM-DD strings, parsed via an explicit local-midnight constructor —
// `new Date("YYYY-MM-DD")` alone parses as UTC and can land a day off depending on the caller's
// own timezone offset, exactly the trap addDays/localDateKey exist to avoid.
export function daysBetween(a, b) {
  return Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);
}

export function formatDate(value) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)); }

// formatDate feeds `new Date(value)`, which parses a bare "YYYY-MM-DD" string as UTC midnight —
// exactly the off-by-one-day trap localDateKey exists to avoid. A date-key needs its own
// local-constructor path here instead of going through formatDate directly.
export function formatDateKey(key) { const [y, m, d] = key.split('-').map(Number); return formatDate(new Date(y, m - 1, d)); }

export function formatPlanDate(dateStr) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${dateStr}T00:00:00`));
}

export function formatDuration(seconds) { const mins = Math.floor(seconds / 60); const secs = Math.max(0, Math.floor(seconds % 60)); return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }

export function hashNumber(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Deterministic Fisher-Yates: the same (items, seed) pair always produces the same order, so a
// shuffle driven by a stable seed (a session id, a date key) stays consistent across re-renders
// instead of re-randomizing every time the same list happens to be shuffled again.
export function seededShuffle(items, seed) {
  const result = [...items];
  let x = hashNumber(String(seed)) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    const j = (x >>> 0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// A rough keyword-overlap hint for recall mode, not a grade — the user is always the
// one who decides how well they actually did via the same Again/Hard/Good/Easy rating.
export function recallMatchHint(typed, definition) {
  if (!typed || !typed.trim()) return { label: 'Skipped', tone: '' };
  const stop = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'or', 'in', 'on', 'for', 'with', 'that', 'is', 'are', 'it', 'as', 'by', 'from', 'be', 'this', 'which', 'you', 'your', 'can', 'used', 'use']);
  const words = str => new Set(String(str).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w)));
  const typedWords = words(typed); const defWords = words(definition);
  if (!defWords.size) return { label: 'Compare carefully', tone: 'amber' };
  let overlap = 0; typedWords.forEach(word => { if (defWords.has(word)) overlap++; });
  const score = overlap / defWords.size;
  if (score >= 0.4) return { label: 'Good keyword overlap', tone: 'teal' };
  if (score >= 0.15) return { label: 'Partial overlap', tone: 'amber' };
  return { label: 'Compare carefully', tone: 'amber' };
}
