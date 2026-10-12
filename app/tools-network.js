// ---------- Tools: network and phone-system sheet ----------
// Four editable tables (VLANs and subnets, devices, extensions, DIDs and trunks) that you fill in as you
// build or document a site, with CSV import and export and a clean printout. Mistakes are flagged, never
// blocked: a bad address, a duplicate, overlapping subnets, or a device address outside every listed
// subnet. Keep addresses and names here, not passwords: saved data is plain text on disk.

import { uid, debounce, hashParams, parseCsv, buildCsv, downloadText, fileStamp } from './tools-core.js?v=1';
import { parseIPv4, parseCidr, subnetInfo, inSubnet, overlaps } from './tools-calc.js?v=1';
import { validMac, macDigits, validDid, validEmail } from './tools-validate.js?v=1';
import { build3cxImport, parseTemplate } from './tools-3cx.js?v=1';

const DEVICE_TYPES = ['Server', 'Virtual machine', 'Switch', 'Router', 'Firewall', 'Access point', 'IP phone', 'Printer', 'PBX', 'Other'];

export const TABLES = {
  subnets: { label: 'VLANs & subnets', cols: [
    { k: 'vlan', label: 'VLAN', width: 70 }, { k: 'name', label: 'Name', width: 150 }, { k: 'cidr', label: 'Subnet (CIDR)', width: 150 },
    { k: 'gateway', label: 'Gateway', width: 130 }, { k: 'dhcp', label: 'DHCP range', width: 190 }, { k: 'notes', label: 'Notes', width: 230 }] },
  devices: { label: 'Devices', cols: [
    { k: 'name', label: 'Name', width: 150 }, { k: 'type', label: 'Type', width: 130, options: DEVICE_TYPES }, { k: 'ip', label: 'IP address', width: 130 },
    { k: 'mac', label: 'MAC address', width: 150 }, { k: 'vlan', label: 'VLAN', width: 70 }, { k: 'location', label: 'Location', width: 130 },
    { k: 'model', label: 'Make and model', width: 150 }, { k: 'serial', label: 'Serial number', width: 130 }, { k: 'notes', label: 'Notes', width: 200 }] },
  extensions: { label: 'Extensions', cols: [
    { k: 'ext', label: 'Extension', width: 90 }, { k: 'name', label: 'Name', width: 150 }, { k: 'email', label: 'Email', width: 190 }, { k: 'mobile', label: 'Mobile', width: 130 }, { k: 'department', label: 'Department', width: 130 },
    { k: 'role', label: 'Role', width: 150, options: ['User', 'Receptionist', 'Supervisor', 'Department Administrator', 'Manager', 'Owner', 'System Administrator', 'System Owner'] },
    { k: 'phone', label: 'Phone model', width: 140 }, { k: 'mac', label: 'MAC address', width: 150 }, { k: 'did', label: 'Assigned DID', width: 150 }, { k: 'notes', label: 'Notes', width: 200 }] },
  dids: { label: 'DIDs & trunks', cols: [
    { k: 'number', label: 'Number', width: 160 }, { k: 'trunk', label: 'Trunk or provider', width: 180 }, { k: 'destination', label: 'Routed to', width: 200 }, { k: 'notes', label: 'Notes', width: 260 }] }
};

// ---------------- checks (pure) ----------------
export { validMac, macDigits, validDid, validEmail };
const blank = value => String(value == null ? '' : value).trim() === '';

// Returns { messages: [{ table, text }], flags: { "rowId:key": "why" } }.
export function findNetworkWarnings(network) {
  const messages = [], flags = {};
  const flag = (table, row, key, why) => { flags[`${row.id}:${key}`] = why; messages.push({ table, text: why }); };
  const label = (row, key) => (row[key] || '').trim() || '(unnamed)';

  const subnets = network.subnets.map(r => ({ row: r, cidr: blank(r.cidr) ? null : parseCidr(r.cidr) })).filter(s => s.cidr);
  network.subnets.forEach(r => {
    if (!blank(r.cidr) && !parseCidr(r.cidr)) flag('subnets', r, 'cidr', `${label(r, 'name')}: "${r.cidr}" is not a valid subnet like 10.0.0.0/24.`);
    if (!blank(r.gateway)) {
      const gw = parseIPv4(r.gateway), c = blank(r.cidr) ? null : parseCidr(r.cidr);
      if (gw == null) flag('subnets', r, 'gateway', `${label(r, 'name')}: "${r.gateway}" is not a valid IPv4 address.`);
      else if (c && !inSubnet(gw, subnetInfo(c.ip, c.prefix).networkInt, c.prefix)) flag('subnets', r, 'gateway', `${label(r, 'name')}: the gateway ${r.gateway} is outside ${r.cidr}.`);
    }
  });
  const seenVlan = {};
  network.subnets.forEach(r => {
    if (blank(r.vlan)) return;
    const key = r.vlan.trim();
    if (seenVlan[key]) flag('subnets', r, 'vlan', `VLAN ${key} is used more than once.`); else seenVlan[key] = r;
  });
  for (let i = 0; i < subnets.length; i++) for (let j = i + 1; j < subnets.length; j++) {
    const a = subnets[i], b = subnets[j];
    const an = subnetInfo(a.cidr.ip, a.cidr.prefix).networkInt, bn = subnetInfo(b.cidr.ip, b.cidr.prefix).networkInt;
    if (overlaps(an, a.cidr.prefix, bn, b.cidr.prefix)) flag('subnets', b.row, 'cidr', `${label(a.row, 'name')} (${a.row.cidr}) and ${label(b.row, 'name')} (${b.row.cidr}) overlap.`);
  }

  const seenIp = {}, seenDeviceMac = {};
  network.devices.forEach(r => {
    if (!blank(r.ip)) {
      const ip = parseIPv4(r.ip);
      if (ip == null) flag('devices', r, 'ip', `${label(r, 'name')}: "${r.ip}" is not a valid IPv4 address.`);
      else {
        if (seenIp[r.ip.trim()]) flag('devices', r, 'ip', `${r.ip.trim()} is used by ${label(seenIp[r.ip.trim()], 'name')} and ${label(r, 'name')}.`); else seenIp[r.ip.trim()] = r;
        if (subnets.length && !subnets.some(s => inSubnet(ip, subnetInfo(s.cidr.ip, s.cidr.prefix).networkInt, s.cidr.prefix))) flag('devices', r, 'ip', `${label(r, 'name')}: ${r.ip} is not inside any subnet in your list.`);
      }
    }
    if (!blank(r.mac)) {
      if (!validMac(r.mac)) flag('devices', r, 'mac', `${label(r, 'name')}: "${r.mac}" is not a valid MAC address.`);
      else if (seenDeviceMac[macDigits(r.mac)]) flag('devices', r, 'mac', `MAC ${r.mac.trim()} is used by ${label(seenDeviceMac[macDigits(r.mac)], 'name')} and ${label(r, 'name')}.`); else seenDeviceMac[macDigits(r.mac)] = r;
    }
  });

  const seenExt = {}, seenExtMac = {};
  network.extensions.forEach(r => {
    if (!blank(r.ext)) {
      if (!/^\d{1,8}$/.test(r.ext.trim())) flag('extensions', r, 'ext', `${label(r, 'name')}: extension "${r.ext}" should be digits only.`);
      else if (seenExt[r.ext.trim()]) flag('extensions', r, 'ext', `Extension ${r.ext.trim()} is used by ${label(seenExt[r.ext.trim()], 'name')} and ${label(r, 'name')}.`); else seenExt[r.ext.trim()] = r;
    }
    if (!blank(r.mac)) {
      if (!validMac(r.mac)) flag('extensions', r, 'mac', `${label(r, 'name')}: "${r.mac}" is not a valid MAC address.`);
      else if (seenExtMac[macDigits(r.mac)]) flag('extensions', r, 'mac', `MAC ${r.mac.trim()} is used by two extensions.`); else seenExtMac[macDigits(r.mac)] = r;
    }
    if (!blank(r.email) && !validEmail(r.email)) flag('extensions', r, 'email', `${label(r, 'name')}: "${r.email}" is not a valid email address.`);
    if (!blank(r.did) && !validDid(r.did)) flag('extensions', r, 'did', `${label(r, 'name')}: "${r.did}" should be a number in E.164 form, like +441632960123.`);
  });

  const seenDid = {};
  network.dids.forEach(r => {
    if (blank(r.number)) return;
    if (!validDid(r.number)) flag('dids', r, 'number', `"${r.number}" should be a number in E.164 form, like +441632960123.`);
    else { const key = r.number.replace(/[\s().-]/g, ''); if (seenDid[key]) flag('dids', r, 'number', `${r.number.trim()} is listed twice.`); else seenDid[key] = r; }
  });
  return { messages, flags };
}

export function tableToCsv(table, rows) {
  const cols = TABLES[table].cols;
  return buildCsv(cols.map(c => c.label), rows.map(r => cols.map(c => r[c.k] || '')));
}

// Maps CSV columns to this table's columns by header text (label or key, any case). Returns the new rows.
export function csvToRows(table, text) {
  const cols = TABLES[table].cols;
  const grid = parseCsv(text);
  if (grid.length < 2) return [];
  const norm = s => String(s).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const map = grid[0].map(h => cols.find(c => norm(c.label) === norm(h) || norm(c.k) === norm(h)));
  if (!map.some(Boolean)) return [];
  return grid.slice(1).map(cells => {
    const row = { id: uid('n') };
    cols.forEach(c => { row[c.k] = ''; });
    cells.forEach((cell, i) => { if (map[i]) row[map[i].k] = cell.trim(); });
    return cols.some(c => row[c.k]) ? row : null;
  }).filter(Boolean);
}

// ---------------- the page ----------------
export function createNetwork(ctx) {
  const { main, icon, escapeHtml: esc, toast, getTools, saveTools } = ctx;
  const net = () => getTools().network;
  let sort = { table: null, key: null, dir: 1 };
  let filter = '';

  const emptyRow = table => { const row = { id: uid('n') }; TABLES[table].cols.forEach(c => { row[c.k] = ''; }); return row; };
  const rowsOf = table => net()[table];

  function displayRows(table) {
    const rows = [...rowsOf(table)];
    if (sort.table === table && sort.key) rows.sort((a, b) => String(a[sort.key] || '').localeCompare(String(b[sort.key] || ''), undefined, { numeric: true, sensitivity: 'base' }) * sort.dir);
    return rows;
  }

  function cellHtml(table, row, col, index, flags) {
    const why = flags[`${row.id}:${col.k}`];
    const common = `data-net="cell" data-table="${table}" data-id="${row.id}" data-k="${col.k}" aria-label="${esc(col.label)}, row ${index + 1}"${why ? ` aria-invalid="true" title="${esc(why)}"` : ''}`;
    if (col.options) {
      const opts = ['', ...col.options];
      if (row[col.k] && !opts.includes(row[col.k])) opts.push(row[col.k]);
      return `<select class="t-input" data-enhanced="1" ${common}>${opts.map(o => `<option value="${esc(o)}"${o === row[col.k] ? ' selected' : ''}>${esc(o || '—')}</option>`).join('')}</select>`;
    }
    return `<input class="t-input" type="text" ${common} value="${esc(row[col.k] || '')}" autocomplete="off" spellcheck="false">`;
  }

  function tableHtml(table, flags) {
    const t = TABLES[table];
    const rows = displayRows(table);
    if (!rows.length) return `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('map')}</span><h3>No ${esc(t.label.toLowerCase())} yet</h3><p>Add a row, or import a CSV file whose first line names the columns: ${esc(t.cols.map(c => c.label).join(', '))}.</p></div></div>`;
    return `<div class="table-wrap"><table class="net-table net-edit"><thead><tr>${t.cols.map(c => `<th style="min-width:${c.width}px"><button class="net-sort" data-net="sort" data-k="${c.k}" aria-label="Sort by ${esc(c.label)}">${esc(c.label)}${sort.table === table && sort.key === c.k ? (sort.dir > 0 ? ' ▲' : ' ▼') : ''}</button></th>`).join('')}<th aria-label="Row actions"></th></tr></thead>
      <tbody>${rows.map((row, i) => `<tr data-row="${row.id}">${t.cols.map(c => `<td>${cellHtml(table, row, c, i, flags)}</td>`).join('')}<td><button class="ghost small" data-net="delete" data-id="${row.id}" aria-label="Delete row ${i + 1}">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div>`;
  }

  function warningsHtml(table, messages) {
    const mine = messages.filter(m => m.table === table);
    if (!mine.length) return '';
    return `<details class="net-warnings" open><summary>${icon('alert')} ${mine.length} thing${mine.length === 1 ? '' : 's'} to check</summary><ul>${mine.slice(0, 40).map(m => `<li>${esc(m.text)}</li>`).join('')}</ul>${mine.length > 40 ? `<p class="muted-line">…and ${mine.length - 40} more.</p>` : ''}</details>`;
  }

  function printHtml() {
    return Object.entries(TABLES).filter(([name]) => rowsOf(name).length).map(([name, t]) => `<h3>${esc(t.label)}</h3>
      <table class="net-table"><thead><tr>${t.cols.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rowsOf(name).map(r => `<tr>${t.cols.map(c => `<td>${esc(r[c.k] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('') || '<p>Nothing recorded yet.</p>';
  }

  const threeCxPanel = () => `<details class="net-3cx print-hide"><summary>${icon('download')} Export for 3CX bulk import</summary>
    <p class="muted-line" style="margin-top:10px">Builds the CSV for <strong>Admin &gt; Users &gt; Import</strong> from this table: name, email, mobile, extension, role, department, DID, and phone. It follows 3CX's bulk import guide (updated 10 September 2026) but has not been tried against your system, so import two or three rows first. Import only creates new extensions.</p>
    <div class="calc-two" style="margin-top:12px"><div class="field"><label for="net-3cx-file">Your own 3CX export (recommended)</label><input id="net-3cx-file" type="file" accept=".csv,text/csv"><small class="muted-line">In 3CX, make one example user with the settings you want and export your users, then choose that file. Its columns and default settings are used for everyone.</small></div>
      <div class="field"><label for="net-3cx-template">Phone template file name (optional)</label><input id="net-3cx-template" type="text" placeholder="yealinkT4x.ph.xml" autocomplete="off"><small class="muted-line">Applied to every row that has a MAC address. The phone model must match the template's model name.</small></div></div>
    <div class="button-row" style="margin-top:12px"><button class="primary small" data-net="export-3cx">Download 3CX import CSV</button></div><div id="net-3cx-report" role="status" style="margin-top:12px"></div></details>`;

  async function exportFor3cx() {
    const box = document.getElementById('net-3cx-report');
    const problem = text => { box.innerHTML = `<div class="notice">${icon('alert')}<span>${esc(text)}</span></div>`; };
    const file = document.getElementById('net-3cx-file').files[0];
    let template = null;
    if (file) {
      const parsed = parseTemplate(await file.text());
      if (!parsed.ok) { problem(parsed.error); return; }
      template = parsed;
    }
    const result = build3cxImport(rowsOf('extensions'), { template, templateFile: document.getElementById('net-3cx-template').value });
    if (!result.ok) { problem(result.error); return; }
    downloadText(result.csv, 'text/csv', `3cx-user-import-${fileStamp()}.csv`);
    box.innerHTML = `<p class="calc-probe-result is-yes">Exported ${result.exported} extension${result.exported === 1 ? '' : 's'}${result.skipped ? `; ${result.skipped} left out` : ''}${template ? ', using your 3CX export for the other settings' : ''}.</p><ul class="net-3cx-notes">${result.warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`;
  }

  function render() {
    const tab = TABLES[hashParams().tab] ? hashParams().tab : 'subnets';
    const { messages, flags } = findNetworkWarnings(net());
    main.innerHTML = `<div class="tool-page" id="net-root" data-tab="${tab}">
      <div class="section-head"><div><h2>Network sheet</h2><p>Record the network and phone system as you build it: VLANs and subnets, devices, extensions, and DIDs. Mistakes are flagged as you type; nothing is blocked. Export any table as CSV, or print them all.</p></div>
        <div class="button-row"><button class="secondary small" data-net="print">Print all</button></div></div>
      <div class="notice teal print-hide" style="margin-bottom:16px">${icon('info')}<span>Keep addresses and names here, not passwords. Saved data is plain text on disk.</span></div>
      <div class="tab-row print-hide" role="tablist" aria-label="Network tables">${Object.entries(TABLES).map(([name, t]) => `<button class="tab-button${tab === name ? ' active' : ''}" role="tab" aria-selected="${tab === name}" data-net-tab="${name}">${esc(t.label)} <span class="tab-count">${rowsOf(name).length}</span></button>`).join('')}</div>
      <section class="panel print-hide"><div class="panel-body" style="padding-top:20px">
        <div class="net-toolbar"><div class="field net-search"><label for="net-filter">Filter rows</label><input id="net-filter" type="search" data-net="filter" value="${esc(filter)}" placeholder="Type to filter…" autocomplete="off"></div>
          <div class="button-row"><button class="primary small" data-net="add">Add row</button><button class="secondary small" data-net="import">Import CSV</button><button class="secondary small" data-net="export">Export CSV</button><input id="net-file" data-net="file" type="file" accept=".csv,text/csv" hidden aria-label="Choose a CSV file to import"></div></div>
        <div id="net-warnings">${warningsHtml(tab, messages)}</div>
        ${tab === 'extensions' ? threeCxPanel() : ''}
        <div id="net-table">${tableHtml(tab, flags)}</div></div></section>
      <div class="print-only net-print">${printHtml()}</div></div>`;
    applyFilter();
    wire(document.getElementById('net-root'), tab);
  }

  function applyFilter() {
    const q = filter.trim().toLowerCase();
    document.querySelectorAll('#net-table tbody tr').forEach(tr => {
      const text = [...tr.querySelectorAll('input, select')].map(el => el.value).join(' ').toLowerCase();
      tr.hidden = !!q && !text.includes(q);
    });
  }

  function refreshValidation(tab) {
    const { messages, flags } = findNetworkWarnings(net());
    document.getElementById('net-warnings').innerHTML = warningsHtml(tab, messages);
    document.querySelectorAll('#net-table [data-net=cell]').forEach(el => {
      const why = flags[`${el.dataset.id}:${el.dataset.k}`];
      if (why) { el.setAttribute('aria-invalid', 'true'); el.title = why; } else { el.removeAttribute('aria-invalid'); el.removeAttribute('title'); }
    });
    document.querySelectorAll('.tab-count').forEach((el, i) => { el.textContent = rowsOf(Object.keys(TABLES)[i]).length; });
    const printEl = document.querySelector('.net-print'); if (printEl) printEl.innerHTML = printHtml();
  }

  function rerenderTable(tab) {
    const { messages, flags } = findNetworkWarnings(net());
    document.getElementById('net-table').innerHTML = tableHtml(tab, flags);
    document.getElementById('net-warnings').innerHTML = warningsHtml(tab, messages);
    document.querySelectorAll('.tab-count').forEach((el, i) => { el.textContent = rowsOf(Object.keys(TABLES)[i]).length; });
    const printEl = document.querySelector('.net-print'); if (printEl) printEl.innerHTML = printHtml();
    applyFilter();
  }

  function wire(root, tab) {
    const save = debounce(() => saveTools(), 400);
    root.addEventListener('click', event => {
      const tabBtn = event.target.closest('[data-net-tab]');
      if (tabBtn) { filter = ''; sort = { table: null, key: null, dir: 1 }; location.hash = `netsheet?tab=${tabBtn.dataset.netTab}`; return; }
      const el = event.target.closest('[data-net]'); if (!el) return;
      const act = el.dataset.net;
      if (act === 'add') {
        sort = { table: null, key: null, dir: 1 }; filter = ''; document.getElementById('net-filter').value = '';
        const row = emptyRow(tab); rowsOf(tab).push(row); saveTools(); rerenderTable(tab);
        const first = document.querySelector(`#net-table tr[data-row="${row.id}"] input, #net-table tr[data-row="${row.id}"] select`); if (first) first.focus();
      } else if (act === 'delete') {
        const rows = rowsOf(tab), at = rows.findIndex(r => r.id === el.dataset.id); if (at < 0) return;
        const [removed] = rows.splice(at, 1); saveTools(); rerenderTable(tab);
        toast('Row deleted.', 'info', { label: 'Undo', run: () => { const list = rowsOf(tab); list.splice(Math.min(at, list.length), 0, removed); saveTools(); if (document.getElementById('net-root')) rerenderTable(tab); } });
      } else if (act === 'sort') {
        sort = sort.table === tab && sort.key === el.dataset.k ? { table: tab, key: el.dataset.k, dir: -sort.dir } : { table: tab, key: el.dataset.k, dir: 1 };
        rerenderTable(tab);
      } else if (act === 'export') {
        if (!rowsOf(tab).length) { toast('Nothing to export yet.', 'info'); return; }
        downloadText(tableToCsv(tab, rowsOf(tab)), 'text/csv', `network-${tab}-${fileStamp()}.csv`); toast(`${TABLES[tab].label} exported as CSV.`);
      } else if (act === 'import') document.getElementById('net-file').click();
      else if (act === 'export-3cx') exportFor3cx();
      else if (act === 'print') window.print();
    });
    root.addEventListener('input', event => {
      const el = event.target.closest('[data-net]'); if (!el) return;
      if (el.dataset.net === 'filter') { filter = el.value; applyFilter(); return; }
      if (el.dataset.net === 'cell') { const row = rowsOf(el.dataset.table).find(r => r.id === el.dataset.id); if (row) { row[el.dataset.k] = el.value; save(); } }
    });
    root.addEventListener('change', event => {
      const el = event.target.closest('[data-net]'); if (!el) return;
      if (el.dataset.net === 'cell') { const row = rowsOf(el.dataset.table).find(r => r.id === el.dataset.id); if (row) { row[el.dataset.k] = el.value; saveTools(); refreshValidation(tab); } }
      else if (el.dataset.net === 'file') {
        const file = event.target.files && event.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const added = csvToRows(tab, String(reader.result || ''));
          if (!added.length) { toast('No rows found. The first line of the CSV must name its columns.', 'error'); return; }
          rowsOf(tab).push(...added); saveTools(); rerenderTable(tab);
          toast(`Imported ${added.length} row${added.length === 1 ? '' : 's'}.`, 'success', { label: 'Undo', run: () => { const ids = new Set(added.map(r => r.id)); net()[tab] = rowsOf(tab).filter(r => !ids.has(r.id)); saveTools(); if (document.getElementById('net-root')) rerenderTable(tab); } });
        };
        reader.readAsText(file); event.target.value = '';
      }
    });
    root.addEventListener('focusout', () => save.flush());
  }

  return { render };
}
