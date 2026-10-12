// ---------- Tools: 3CX bulk user import file ----------
// Builds the CSV that 3CX's Admin > Users > Import expects, from the Extensions table on the Network sheet.
// Column names, order, and value formats follow 3CX's "How to Create Extensions in Bulk using a .CSV file"
// guide (last updated 10 September 2026). 3CX says the column positions must stay as in its sample file and
// recommends exporting one real extension to get the exact columns for your build, so the best route here is
// to hand this tool such an export: the header and every setting we do not manage are then taken from it.
// This has not been tested against a live 3CX system, so import two or three rows first.

import { parseCsv, buildCsv } from './tools-core.js?v=1';
import { validMac, macDigits, validDid } from './tools-validate.js?v=1';

// The documented columns, in the documented order.
export const DOCUMENTED_COLUMNS = ['Number', 'FirstName', 'LastName', 'EmailAddress', 'MobileNumber', 'OutboundCallerID', 'DID', 'Role', 'Department', 'ClickToCallAuth', 'WMApprove', 'WebMeetingFriendlyName',
  'MAC', 'Template', 'Model', 'Router', 'Language', 'Ringtone', 'QRingtone', 'VMEnable', 'VMLanguage', 'VMPlayMsgDateTime', 'VMPIN', 'VMEmailOptions', 'VMNoPin', 'VMPlayCallerID',
  'RecordCalls', 'RecordExternal', 'RecordCanSee', 'RecordCanDelete', 'RecordStartStop', 'RecordNotify', 'Disabled', 'HideFWrules', 'DisableExternalCalls', 'HideInPhonebook', 'CallScreening',
  'PinProtected', 'PinTimeout', 'Transcription', 'AllowLanOnly', 'SIPID', 'DeliverAudio', 'HotDesk', 'SRTPMode', 'EmailMissedCalls', 'MS365SignInDisabled', 'MS365CalendarDisabled',
  'MS365ContactsDisabled', 'MS365TeamsDisabled', 'GoogleSignInDisabled', 'GoogleContactsDisabled', 'GoogleCalendarDisabled', 'BLF'];

// Settings that belong to one person or must be unique, so they are never copied from the example row.
const PERSONAL = new Set(['Number', 'FirstName', 'LastName', 'EmailAddress', 'MobileNumber', 'OutboundCallerID', 'DID', 'Role', 'Department', 'MAC', 'Template', 'Model', 'Router', 'WebMeetingFriendlyName', 'SIPID', 'VMPIN', 'BLF']);

// The sheet's role names against the values the import accepts. Supervisor is not an import value.
export const ROLE_VALUES = { 'User': 'users', 'Receptionist': 'receptionists', 'Manager': 'managers', 'Department Administrator': 'group_admins', 'Owner': 'group_owners', 'System Administrator': 'system_admins', 'System Owner': 'system_owners' };
export const roleCell = role => `<role name="${ROLE_VALUES[role] || 'users'}" />`;

export function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

// Reads a CSV exported from 3CX: its header, and its first data row as the source of default settings.
export function parseTemplate(text) {
  const grid = parseCsv(text);
  if (!grid.length) return { ok: false, error: 'That file is empty.' };
  const header = grid[0].map(h => h.trim());
  const lower = header.map(h => h.toLowerCase());
  const missing = ['number', 'firstname', 'lastname', 'emailaddress'].filter(k => !lower.includes(k));
  if (missing.length) return { ok: false, error: 'That does not look like a 3CX extension export: its first line is missing ' + missing.join(', ') + '.' };
  return { ok: true, header, example: grid[1] || [] };
}

// rows: the Extensions table. Returns { ok, csv, header, exported, skipped, warnings }.
export function build3cxImport(rows, { template = null, templateFile = '' } = {}) {
  const header = template ? template.header : [...DOCUMENTED_COLUMNS];
  const index = Object.fromEntries(header.map((h, i) => [h.toLowerCase(), i]));
  const warnings = [], out = [];
  let skipped = 0;
  const seenExt = new Set();
  let hasDid = false;
  rows.forEach((row, n) => {
    const who = (row.name || '').trim() || (row.ext || '').trim() || `row ${n + 1}`;
    const { first, last } = splitName(row.name);
    if (!first) { skipped++; warnings.push(`Row ${n + 1} has no name, so it was left out.`); return; }
    const cells = header.map((h, i) => (template && !PERSONAL.has(h) ? ((template.example[i] || '').trim()) : ''));
    const set = (column, value) => { const at = index[column.toLowerCase()]; if (at != null) cells[at] = value; };
    const ext = (row.ext || '').trim();
    if (ext && !/^\d{1,8}$/.test(ext)) warnings.push(`${who}: extension "${ext}" is not numeric, so it was left blank and 3CX will pick the next free number.`);
    else if (ext && seenExt.has(ext)) warnings.push(`${who}: extension ${ext} appears twice; 3CX will skip the second one.`);
    if (/^\d+$/.test(ext)) { set('Number', ext); seenExt.add(ext); }
    set('FirstName', first); set('LastName', last);
    const email = (row.email || '').trim();
    if (!email) warnings.push(`${who} has no email address, and the welcome email and voicemail notices need one.`);
    set('EmailAddress', email);
    set('MobileNumber', (row.mobile || '').trim());
    const did = (row.did || '').trim();
    if (did) { if (!validDid(did)) warnings.push(`${who}: the DID "${did}" is not in E.164 form.`); set('DID', did); set('OutboundCallerID', did); hasDid = true; }
    const role = (row.role || '').trim();
    if (role === 'Supervisor') warnings.push(`${who}: Supervisor cannot be set by import, so the user is imported as a User. Change the role afterwards.`);
    set('Role', roleCell(role || 'User'));
    set('Department', (row.department || '').trim());
    const mac = (row.mac || '').trim();
    if (mac) {
      if (!validMac(mac)) warnings.push(`${who}: the MAC address "${mac}" is not valid, so no phone was added.`);
      else {
        set('MAC', macDigits(mac).toUpperCase());
        if ((row.phone || '').trim()) set('Model', row.phone.trim());
        if (templateFile) set('Template', templateFile.trim());
        else warnings.push(`${who}: no phone template file was given, so 3CX will not add the phone; add it from the user's IP Phone tab.`);
      }
    }
    out.push(cells);
  });
  warnings.push('Import only creates new extensions: any extension that already exists in 3CX is skipped.');
  if (hasDid) warnings.push('Each DID must already exist on a trunk, written the way 3CX stores it. Compare with your own export.');
  if (!template) warnings.push('No 3CX export was used, so every setting other than the ones above is blank and 3CX will apply its own defaults. Import two or three rows first to check.');
  else if (index['department'] != null) warnings.push('Each department must already exist in 3CX.');
  if (!out.length) return { ok: false, error: 'There are no extensions with a name to export.', warnings };
  return { ok: true, csv: buildCsv(header, out), header, exported: out.length, skipped, warnings };
}
