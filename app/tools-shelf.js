// ---------- Tools: document shelf ----------
// Lists whatever you drop into the files/ folder next to the app (manuals, vendor PDFs, exports), and lets
// you add tags and a note to each one and search across names, tags, and notes. The tags and notes are
// saved with your account; the files themselves are never copied or changed. The study server provides the
// listing (GET /api/files) and serves each file, so this page needs the current server.py.

import { debounce } from './tools-core.js?v=1';

const KINDS = [
  ['PDF', /\.pdf$/i], ['Documents', /\.(docx?|odt|rtf|txt|md)$/i], ['Spreadsheets', /\.(xlsx?|ods|csv|tsv)$/i], ['Slides', /\.(pptx?|odp)$/i],
  ['Images', /\.(png|jpe?g|gif|svg|webp|bmp)$/i], ['Archives', /\.(zip|7z|rar|iso|tar|gz)$/i]
];
export const fileKind = name => (KINDS.find(([, re]) => re.test(name)) || ['Other'])[0];

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024, i = 0;
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
}

export const normalizeTag = text => String(text || '').replace(/[,;]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30);

export function shelfTags(files, meta) {
  const counts = new Map();
  files.forEach(f => ((meta[f.path] && meta[f.path].tags) || []).forEach(tag => { const key = tag.toLowerCase(); const entry = counts.get(key) || { tag, n: 0 }; entry.n++; counts.set(key, entry); }));
  return [...counts.values()].sort((a, b) => b.n - a.n || a.tag.localeCompare(b.tag));
}

// Every word of the query must appear in the file's path, tags, or note. `tag` and `kind` narrow further.
export function filterShelf(files, meta, { query = '', tag = '', kind = '' } = {}) {
  const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  return files.filter(f => {
    const m = meta[f.path] || { tags: [], note: '' };
    if (kind && fileKind(f.name) !== kind) return false;
    if (tag === '__none__' ? m.tags.length : tag && !m.tags.some(t => t.toLowerCase() === tag.toLowerCase())) return false;
    const hay = `${f.path} ${m.tags.join(' ')} ${m.note || ''}`.toLowerCase();
    return words.every(w => hay.includes(w));
  });
}

export function sortShelf(files, key) {
  const copy = [...files];
  if (key === 'newest') copy.sort((a, b) => b.modified - a.modified);
  else if (key === 'largest') copy.sort((a, b) => b.size - a.size);
  else copy.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' }));
  return copy;
}

export function createShelf(ctx) {
  const { main, icon, escapeHtml: esc, toast, getTools, saveTools } = ctx;
  const meta = () => getTools().shelf.meta;
  let listing = null;                       // the last answer from the server: { files, folderExists } or { error }
  let view = { query: '', tag: '', kind: '', sort: 'name' };
  const url = path => '/files/' + path.split('/').map(encodeURIComponent).join('/');
  const iconFor = kind => (kind === 'Images' ? 'image' : kind === 'Spreadsheets' ? 'chart' : kind === 'Archives' ? 'folder' : 'book');
  const dateText = ts => new Date(ts * 1000).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  function entry(path) { const m = meta(); if (!m[path]) m[path] = { tags: [], note: '' }; return m[path]; }
  function tidy(path) { const m = meta()[path]; if (m && !m.tags.length && !(m.note || '').trim()) delete meta()[path]; }

  function itemHtml(f) {
    const m = meta()[f.path] || { tags: [], note: '' };
    const kind = fileKind(f.name), folder = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/') + 1) : '';
    return `<article class="shelf-item" data-path="${esc(f.path)}">
      <span class="shelf-icon" aria-hidden="true">${icon(iconFor(kind))}</span>
      <div class="shelf-main"><a class="shelf-name" href="${esc(url(f.path))}" target="_blank" rel="noopener">${esc(f.name)}</a>
        <small>${esc(folder)}${folder ? ' · ' : ''}${esc(formatSize(f.size))} · ${esc(dateText(f.modified))} · ${esc(kind)}</small>
        <div class="shelf-tags">${m.tags.map(tag => `<span class="chip shelf-tag">${esc(tag)}<button data-sh="tag-remove" data-path="${esc(f.path)}" data-tag="${esc(tag)}" aria-label="Remove the tag ${esc(tag)} from ${esc(f.name)}">×</button></span>`).join('')}
          <input class="t-input shelf-tag-input" data-sh="tag-input" data-path="${esc(f.path)}" type="text" placeholder="Add a tag" maxlength="30" aria-label="Add a tag to ${esc(f.name)}" autocomplete="off"></div>
        <textarea class="rb-note" data-sh="note" data-path="${esc(f.path)}" rows="2" placeholder="A note about this file…" aria-label="Note for ${esc(f.name)}"${(m.note || '').trim() ? '' : ' hidden'}>${esc(m.note || '')}</textarea></div>
      <button class="ghost small print-hide" data-sh="note-toggle" data-path="${esc(f.path)}" aria-label="Add or hide a note for ${esc(f.name)}">${icon('edit')}</button></article>`;
  }

  function listHtml() {
    const files = listing.files;
    const shown = sortShelf(filterShelf(files, meta(), view), view.sort);
    const missing = Object.keys(meta()).filter(p => !files.some(f => f.path === p));
    return `<p class="muted-line" id="sh-count" role="status">${shown.length === files.length ? `${files.length} file${files.length === 1 ? '' : 's'}` : `${shown.length} of ${files.length} files`}</p>
      <div class="shelf-list">${shown.length ? shown.map(itemHtml).join('') : '<p class="muted-line">Nothing matches.</p>'}</div>
      ${missing.length ? `<h3 class="rb-section">No longer in the folder</h3><div class="shelf-list">${missing.map(p => `<article class="shelf-item is-missing"><span class="shelf-icon" aria-hidden="true">${icon('alert')}</span><div class="shelf-main"><strong>${esc(p)}</strong><small>${esc((meta()[p].tags || []).join(', '))}${meta()[p].note ? ' · ' + esc(meta()[p].note.slice(0, 80)) : ''}</small></div><button class="ghost small" data-sh="forget" data-path="${esc(p)}" aria-label="Forget the tags and note for ${esc(p)}">Forget</button></article>`).join('')}</div>` : ''}`;
  }

  function tagBarHtml() {
    const tags = shelfTags(listing.files, meta());
    const kinds = [...new Set(listing.files.map(f => fileKind(f.name)))].sort();
    return `${tags.length ? `<div class="tm-presets" role="group" aria-label="Filter by tag"><button class="chip${view.tag === '' ? ' active' : ''}" data-sh="tag-filter" data-tag="">All</button>${tags.map(t => `<button class="chip${view.tag.toLowerCase() === t.tag.toLowerCase() ? ' active' : ''}" data-sh="tag-filter" data-tag="${esc(t.tag)}">${esc(t.tag)} <span class="tab-count">${t.n}</span></button>`).join('')}<button class="chip${view.tag === '__none__' ? ' active' : ''}" data-sh="tag-filter" data-tag="__none__">Untagged</button></div>` : ''}
      ${kinds.length > 1 ? `<div class="tm-presets" role="group" aria-label="Filter by type">${['', ...kinds].map(k => `<button class="chip${view.kind === k ? ' active' : ''}" data-sh="kind-filter" data-kind="${esc(k)}">${k || 'Every type'}</button>`).join('')}</div>` : ''}`;
  }

  function body() {
    if (!listing) return `<p class="muted-line">Loading…</p>`;
    if (listing.error) return `<div class="notice">${icon('alert')}<span>${esc(listing.error)}</span></div>`;
    if (!listing.files.length) return `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('folder')}</span><h3>${listing.folderExists ? 'The files folder is empty' : 'No files folder yet'}</h3><p>Put your PDFs and other documents in the <code>files</code> folder inside the study app's folder${listing.folderExists ? '' : ' (create it if it is missing)'}, then press Refresh. Subfolders are listed too.</p></div></div>`;
    return `<div class="shelf-controls print-hide"><div class="field net-search"><label for="sh-search">Search names, tags, and notes</label><input id="sh-search" type="search" data-sh="search" value="${esc(view.query)}" placeholder="3CX firewall…" autocomplete="off"></div>
        <div class="field"><label for="sh-sort">Sort by</label><select id="sh-sort" data-sh="sort" data-enhanced="1"><option value="name"${view.sort === 'name' ? ' selected' : ''}>Name</option><option value="newest"${view.sort === 'newest' ? ' selected' : ''}>Newest</option><option value="largest"${view.sort === 'largest' ? ' selected' : ''}>Largest</option></select></div></div>
      <div id="sh-filters" class="print-hide">${tagBarHtml()}</div><div id="sh-list" style="margin-top:14px">${listHtml()}</div>`;
  }

  function paintBody() { const el = document.getElementById('sh-body'); if (el) el.innerHTML = body(); }
  function paintList() { const el = document.getElementById('sh-list'); if (el) { el.innerHTML = listHtml(); document.getElementById('sh-filters').innerHTML = tagBarHtml(); } }

  async function load() {
    try {
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error(String(res.status));
      listing = await res.json();
      if (!Array.isArray(listing.files)) throw new Error('shape');
    } catch {
      listing = { error: 'The document shelf could not read the files folder. If you have just updated the app, restart the study server (close its window and run server.py again) so it picks up the new listing.' };
    }
    paintBody();
  }

  function render() {
    main.innerHTML = `<div class="tool-page" id="sh-root">
      <div class="section-head"><div><h2>Document shelf</h2><p>Your PDFs and other reference files from the <code>files</code> folder, searchable and tagged. Tags and notes are saved with your account; the files are never copied or changed.</p></div>
        <div class="button-row"><button class="secondary small" data-sh="refresh">Refresh</button></div></div>
      <section class="panel"><div class="panel-body" id="sh-body" style="padding-top:20px">${body()}</div></section></div>`;
    wire(document.getElementById('sh-root'));
    load();
  }

  function wire(root) {
    const save = debounce(() => saveTools(), 400);
    const addTag = (path, text) => {
      const tag = normalizeTag(text); if (!tag) return false;
      const m = entry(path);
      if (!m.tags.some(t => t.toLowerCase() === tag.toLowerCase())) m.tags.push(tag);
      saveTools(); paintList();
      const again = [...document.querySelectorAll('.shelf-tag-input')].find(i => i.dataset.path === path); if (again) again.focus();
      return true;
    };
    root.addEventListener('click', event => {
      const el = event.target.closest('[data-sh]'); if (!el) return;
      const act = el.dataset.sh;
      if (act === 'refresh') { listing = null; paintBody(); load(); }
      else if (act === 'tag-remove') { const m = entry(el.dataset.path); m.tags = m.tags.filter(t => t !== el.dataset.tag); tidy(el.dataset.path); saveTools(); paintList(); }
      else if (act === 'tag-filter') { view.tag = el.dataset.tag; paintList(); }
      else if (act === 'kind-filter') { view.kind = el.dataset.kind; paintList(); }
      else if (act === 'note-toggle') { const area = [...root.querySelectorAll('[data-sh=note]')].find(a => a.dataset.path === el.dataset.path); if (area) { area.hidden = !area.hidden; if (!area.hidden) area.focus(); } }
      else if (act === 'forget') { delete meta()[el.dataset.path]; saveTools(); paintList(); toast('Forgotten.', 'info'); }
    });
    root.addEventListener('keydown', event => {
      const el = event.target.closest('[data-sh="tag-input"]'); if (!el) return;
      if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag(el.dataset.path, el.value); }
    });
    root.addEventListener('input', event => {
      const el = event.target.closest('[data-sh]'); if (!el) return;
      if (el.dataset.sh === 'search') { view.query = el.value; paintList(); }
      else if (el.dataset.sh === 'note') { const m = entry(el.dataset.path); m.note = el.value; save(); }
    });
    root.addEventListener('change', event => {
      const el = event.target.closest('[data-sh]'); if (!el) return;
      if (el.dataset.sh === 'sort') { view.sort = el.value; paintList(); }
      else if (el.dataset.sh === 'tag-input' && el.value.trim()) addTag(el.dataset.path, el.value);
    });
    root.addEventListener('focusout', event => {
      if (event.target.dataset && event.target.dataset.sh === 'note') { tidy(event.target.dataset.path); save.flush(); }
    });
  }

  return { render };
}
