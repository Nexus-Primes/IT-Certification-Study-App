// ---------- Command palette ranking (pure) ----------
// Scores and orders palette entries ({ type, label, sub, body }) for a query, and picks the text
// excerpt shown under a result that matched on its body rather than its label.

export function scorePaletteItem(query, item) {
  const label = item.label.toLowerCase();
  if (label === query) return 100;
  if (label.startsWith(query)) return 82;
  if (label.split(/[\s—·/-]+/).some(word => word.startsWith(query))) return 62;
  if (label.includes(query)) return 42;
  if (item.type.toLowerCase().includes(query)) return 22;
  // Global Search: a real word found in a term's definition/scenario, a guide chapter's
  // actual paragraph text, or a note's own text — ranked above the last-resort fuzzy
  // subsequence match below, since a genuine substring hit in real content is more likely
  // what was meant than two letters that happen to appear in the right order in a label.
  if (item.body && item.body.toLowerCase().includes(query)) return 30;
  let i = 0;
  for (const ch of label) { if (ch === query[i]) i++; if (i === query.length) break; }
  return i === query.length ? 12 : -1;
}

// When a match came from body text rather than the label itself, swap the displayed sub-line
// for a short excerpt centered on the match — otherwise a Term/Guide/Note result found by
// Global Search would show its normal (irrelevant-looking) sub and give no hint why it matched.
export function paletteSnippet(item, query) {
  const label = item.label.toLowerCase();
  if (!item.body || label.includes(query)) return item.sub;
  const body = item.body; const idx = body.toLowerCase().indexOf(query);
  if (idx === -1) return item.sub;
  const start = Math.max(0, idx - 30); const end = Math.min(body.length, idx + query.length + 45);
  return `${start > 0 ? '…' : ''}${body.slice(start, end).trim()}${end < body.length ? '…' : ''}`;
}

export function rankPaletteItems(paletteIndex, query) {
  const q = query.trim().toLowerCase();
  if (!q) return paletteIndex.filter(item => item.type === 'Page' || item.type === 'Action').slice(0, 8);
  return paletteIndex
    .map(item => ({ item, score: scorePaletteItem(q, item) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 9)
    .map(entry => ({ ...entry.item, sub: paletteSnippet(entry.item, q) }));
}
