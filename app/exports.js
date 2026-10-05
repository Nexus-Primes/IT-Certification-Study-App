// ---------- File exports (pure builders) ----------
// Builds the text of each export — CSV, calendar (.ics), and Anki — from plain data, and saves text
// as a download. app.js gathers the data and shows the toast; nothing here reads app state.

export function downloadText(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// RFC 5545 requires literal backslash/semicolon/comma/newline to be backslash-escaped inside
// TEXT values — cert and domain names in this app are plain enough that this rarely bites,
// but a schedule someone's edited to include one shouldn't silently corrupt the whole file.
export function icsEscape(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function buildCsv(header, rows) {
  return [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
}

// events: [{ uid, start, end, summary, description }] with YYYY-MM-DD dates (end already exclusive).
export function buildIcs(events, dtstamp) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cert Study//Study Plan//EN', 'CALSCALE:GREGORIAN'];
  events.forEach(event => {
    lines.push('BEGIN:VEVENT', `UID:${event.uid}`, `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${event.start.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${event.end.replace(/-/g, '')}`,
      `SUMMARY:${icsEscape(event.summary)}`, `DESCRIPTION:${icsEscape(event.description)}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  // CRLF line endings are part of the ICS spec, not just style — some calendar apps
  // (older Outlook builds especially) reject or mis-parse a file with bare \n.
  return lines.join('\r\n');
}

// Plain-text (TSV) export, not a real .apkg — Anki's own "Import File" dialog reads this
// directly (the #-prefixed header lines are its documented plain-text-import directives:
// separator/html/notetype/deck/tags-column), so no SQLite or zip writer is needed client-side.
// A field can't contain a literal tab or newline in this format, so both get neutralised.
export function ankiField(text) {
  return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');
}
// Anki treats spaces as tag separators within the tags column, and colons as hierarchy
// separators (shown as a nested tree in Anki's sidebar) — so track::domain reads as a
// two-level group per track instead of one flat, unbrowsable tag per domain.
export function ankiTag(text) {
  return String(text || '').trim().replace(/[^\w\s:+-]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_');
}

export function buildAnkiTsv({ cards, deckName, domainById }) {
  const trackTag = ankiTag(deckName);
  const lines = ['#separator:tab', '#html:true', '#notetype:Basic', `#deck:${deckName}`, '#tags column:3',
    ...cards.map(concept => {
      const domain = domainById[concept.domain];
      const front = ankiField(concept.term);
      // Escape each raw field individually, then splice in the <br>/<i> ourselves — escaping
      // the already-assembled string would turn our own literal tags into visible "&lt;br&gt;"
      // text on the card instead of an actual line break.
      const back = concept.scenario ? `${ankiField(concept.definition)}<br><br><i>${ankiField(concept.scenario)}.</i>` : ankiField(concept.definition);
      const tags = [domain ? `${trackTag}::${ankiTag(domain.name)}` : trackTag, concept.objective ? `obj_${ankiTag(concept.objective)}` : null].filter(Boolean).join(' ');
      return `${front}\t${back}\t${tags}`;
    })];
  return lines.join('\n');
}
