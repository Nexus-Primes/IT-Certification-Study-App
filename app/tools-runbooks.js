// ---------- Tools: runbooks and checklists ----------
// A template is a plain-text list ("## Section" headings, one step per line, " :: " before an optional
// hint). Starting a run copies the steps into the run, so editing a template later never changes a
// run that is already under way. Progress, per-step notes, and finish times are saved with the run.

import { BUILTIN_RUNBOOKS } from './runbook-templates.js?v=1';
import { uid, debounce, hashParams, buildCsv, downloadText, fileStamp, safeFileName } from './tools-core.js?v=1';

export function parseRunbookText(text) {
  const steps = [];
  let section = 'Steps';
  String(text || '').split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith('## ')) { section = line.slice(3).trim() || 'Steps'; return; }
    const at = line.indexOf(' :: ');
    const body = (at >= 0 ? line.slice(0, at) : line).replace(/^[-*]\s+/, '').trim();
    const hint = at >= 0 ? line.slice(at + 4).trim() : '';
    if (body) steps.push({ section, text: body, hint });
  });
  return steps;
}

export function runProgress(run) {
  const total = run.steps.length;
  const done = run.steps.filter(step => step.done).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function runToMarkdown(run) {
  const lines = [`# ${run.name}`, '', `Runbook: ${run.title}  `, `Started: ${new Date(run.createdAt).toLocaleString()}  `];
  if (run.completedAt) lines.push(`Finished: ${new Date(run.completedAt).toLocaleString()}  `);
  const { done, total } = runProgress(run);
  lines.push(`Progress: ${done} of ${total} steps`, '');
  let section = null;
  run.steps.forEach(step => {
    if (step.section !== section) { section = step.section; lines.push(`## ${section}`, ''); }
    lines.push(`- [${step.done ? 'x' : ' '}] ${step.text}${step.done && step.doneAt ? ` (${new Date(step.doneAt).toLocaleString()})` : ''}`);
    if (step.hint) lines.push(`  - Hint: ${step.hint}`);
    if (step.note) lines.push(`  - Note: ${step.note.replace(/\r?\n/g, ' ')}`);
  });
  if (run.notes) lines.push('', '## Run notes', '', run.notes);
  return lines.join('\n') + '\n';
}

export function runToCsv(run) {
  return buildCsv(['Section', 'Step', 'Done', 'Completed at', 'Hint', 'Note'],
    run.steps.map(step => [step.section, step.text, step.done ? 'yes' : 'no', step.doneAt ? new Date(step.doneAt).toISOString() : '', step.hint, step.note]));
}

export function createRunbooks(ctx) {
  const { main, icon, escapeHtml: esc, toast, getTools, saveTools, navigate } = ctx;
  const data = () => getTools().runbooks;
  const templates = () => [...BUILTIN_RUNBOOKS.map(t => ({ ...t, builtin: true })), ...data().custom.map(t => ({ ...t, builtin: false }))];
  const findTemplate = id => templates().find(t => t.id === id);
  const findRun = id => data().runs.find(r => r.id === id);
  const when = ts => (ts ? new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');

  function badge() { return data().runs.filter(run => !run.completedAt).length; }

  // ----- list view -----
  function runCard(run) {
    const p = runProgress(run);
    return `<article class="tool-card" data-rb-open-card="${run.id}">
      <div class="tool-card-main"><strong>${esc(run.name)}</strong><small>${esc(run.title)} · started ${esc(when(run.createdAt))}${run.completedAt ? ` · finished ${esc(when(run.completedAt))}` : ''}</small>
        <div class="progress-track" style="margin-top:8px"><div class="progress-bar" style="width:${p.pct}%"></div></div></div>
      <div class="tool-card-side"><span class="tag ${run.completedAt ? 'teal' : ''}">${p.done}/${p.total}</span><button class="secondary small" data-rb="open" data-id="${run.id}">${run.completedAt ? 'View' : 'Continue'}</button></div>
    </article>`;
  }

  function templateCard(t) {
    const count = parseRunbookText(t.text).length;
    return `<article class="mode-card tool-template">
      <span class="tag ${t.builtin ? '' : 'teal'}">${esc(t.category || 'General')}${t.builtin ? '' : ' · yours'}</span>
      <h3>${esc(t.title)}</h3><p>${esc(t.summary || '')}</p>
      <div class="card-meta"><span>${count} steps</span></div>
      <div class="button-row" style="margin-top:14px">
        <button class="primary small" data-rb="start" data-id="${t.id}">${icon('play')} Start a run</button>
        <button class="ghost small" data-rb="${t.builtin ? 'copy' : 'edit'}" data-id="${t.id}">${t.builtin ? 'Copy to edit' : 'Edit'}</button>
        ${t.builtin ? '' : `<button class="ghost small" data-rb="delete-template" data-id="${t.id}">Delete</button>`}
      </div></article>`;
  }

  function renderList() {
    const runs = data().runs;
    const open = runs.filter(r => !r.completedAt), done = runs.filter(r => r.completedAt);
    main.innerHTML = `<div class="tool-page" id="rb-root">
      <div class="section-head"><div><h2>Runbooks</h2><p>Tick-off checklists for jobs you repeat: a 3CX go-live, promoting a domain controller, building a Hyper-V host. Start a run and your progress and notes are saved, so you can stop and pick it up again.</p></div>
        <div class="button-row"><button class="secondary small" data-rb="new">${icon('edit')} New runbook</button></div></div>
      <div class="notice teal" style="margin-bottom:18px">${icon('info')}<span>The built-in lists are starting points written from general practice and, for 3CX, from 3CX's 2026 administrator manual. Use <strong>Copy to edit</strong> to adapt one to your environment. Don't put passwords in notes: saved data is plain text on disk.</span></div>
      <section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>In progress</h2><p>${open.length ? `${open.length} run${open.length === 1 ? '' : 's'} under way` : 'Nothing under way yet — start one below'}</p></div></div>
        <div class="panel-body">${open.length ? `<div class="tool-list">${open.map(runCard).join('')}</div>` : `<p class="muted-line">Pick a runbook below and choose Start a run.</p>`}</div></section>
      <section style="margin-bottom:18px"><div class="section-head" style="margin-bottom:12px"><div><h2 style="font-size:16px">Runbooks</h2></div></div>
        <div class="card-grid">${templates().map(templateCard).join('')}</div></section>
      ${done.length ? `<section class="panel"><div class="panel-header"><div><h2>Finished runs</h2><p>${done.length} kept for the record</p></div></div><div class="panel-body"><div class="tool-list">${done.map(runCard).join('')}</div></div></section>` : ''}
    </div>`;
  }

  // ----- run view -----
  function stepRow(step) {
    return `<li class="rb-step${step.done ? ' is-done' : ''}" data-step-row="${step.id}">
      <label class="switch"><input type="checkbox" data-rb="toggle" data-step="${step.id}" ${step.done ? 'checked' : ''} aria-label="${esc(step.text)}"><span></span></label>
      <div class="rb-step-body"><span class="rb-text">${esc(step.text)}</span>${step.hint ? `<small class="rb-hint">${esc(step.hint)}</small>` : ''}
        ${step.done && step.doneAt ? `<small class="rb-when">Done ${esc(when(step.doneAt))}</small>` : ''}
        <textarea class="rb-note" data-rb="note" data-step="${step.id}" rows="2" placeholder="Add a note to this step…" aria-label="Note for: ${esc(step.text)}"${step.note ? '' : ' hidden'}>${esc(step.note || '')}</textarea></div>
      <button class="ghost small print-hide" data-rb="note-toggle" data-step="${step.id}" aria-label="Add or hide a note">${icon('edit')}</button></li>`;
  }

  function renderRun(run) {
    const p = runProgress(run);
    const sections = [];
    run.steps.forEach(step => {
      let group = sections[sections.length - 1];
      if (!group || group.name !== step.section) { group = { name: step.section, steps: [] }; sections.push(group); }
      group.steps.push(step);
    });
    main.innerHTML = `<div class="tool-page" id="rb-root" data-run="${run.id}">
      <div class="section-head print-hide"><div><button class="ghost small" data-rb="back">${icon('arrow')} All runbooks</button></div>
        <div class="button-row"><button class="secondary small" data-rb="print">Print</button><button class="secondary small" data-rb="export-md">Export Markdown</button><button class="secondary small" data-rb="export-csv">Export CSV</button><button class="ghost small" data-rb="reset-run">Clear ticks</button><button class="ghost small" data-rb="delete-run">Delete run</button></div></div>
      <section class="panel"><div class="panel-header"><div style="flex:1;min-width:0">
        <input class="rb-name" data-rb="name" value="${esc(run.name)}" aria-label="Run name" maxlength="120">
        <p>${esc(run.title)} · started ${esc(when(run.createdAt))}${run.completedAt ? ` · finished ${esc(when(run.completedAt))}` : ''}</p></div>
        <div class="rb-progress"><strong id="rb-count">${p.done} of ${p.total}</strong><div class="progress-track"><div class="progress-bar" id="rb-bar" style="width:${p.pct}%"></div></div></div></div>
        <div class="panel-body">${sections.map(group => `<h3 class="rb-section">${esc(group.name)}</h3><ul class="rb-steps">${group.steps.map(stepRow).join('')}</ul>`).join('')}
          <div class="field" style="margin-top:18px"><label for="rb-notes">Run notes</label><textarea id="rb-notes" data-rb="run-notes" rows="3" placeholder="Anything worth remembering about this run…">${esc(run.notes || '')}</textarea></div>
          <div class="button-row print-hide" style="margin-top:14px"><button class="${run.completedAt ? 'secondary' : 'primary'}" data-rb="finish">${run.completedAt ? 'Reopen this run' : 'Mark run finished'}</button></div></div></section>
    </div>`;
  }

  // ----- editor view -----
  function renderEditor(id, fromId) {
    const existing = id && id !== 'new' ? data().custom.find(t => t.id === id) : null;
    const source = fromId ? findTemplate(fromId) : null;
    const draft = existing || (source ? { title: `Copy of ${source.title}`, category: source.category, summary: source.summary, text: source.text } : { title: '', category: '', summary: '', text: '## First section\nFirst step :: optional hint' });
    main.innerHTML = `<div class="tool-page" id="rb-root" data-edit="${existing ? existing.id : 'new'}">
      <div class="section-head"><div><h2>${existing ? 'Edit runbook' : 'New runbook'}</h2><p>One step per line. Start a section with <code>## Section name</code>. Put a hint (a command, a port list, a warning) after <code>::</code>.</p></div></div>
      <section class="panel"><div class="panel-body" style="padding-top:22px">
        <div class="rb-edit-grid">
          <div class="field"><label for="rb-title">Title</label><input id="rb-title" type="text" value="${esc(draft.title)}" maxlength="100"></div>
          <div class="field"><label for="rb-cat">Category</label><input id="rb-cat" type="text" value="${esc(draft.category || '')}" maxlength="40" placeholder="3CX, Windows Server…"></div>
        </div>
        <div class="field" style="margin-top:14px"><label for="rb-summary">Summary</label><input id="rb-summary" type="text" value="${esc(draft.summary || '')}" maxlength="200"></div>
        <div class="field" style="margin-top:14px"><label for="rb-text">Steps</label><textarea id="rb-text" class="rb-edit-text" rows="16" spellcheck="false">${esc(draft.text)}</textarea><small id="rb-count-hint" class="muted-line"></small></div>
        <div class="button-row" style="margin-top:16px"><button class="primary" data-rb="save-template">Save runbook</button><button class="ghost" data-rb="back">Cancel</button></div>
      </div></section></div>`;
    const textArea = document.getElementById('rb-text'), hintEl = document.getElementById('rb-count-hint');
    const update = () => { const n = parseRunbookText(textArea.value).length; hintEl.textContent = `${n} step${n === 1 ? '' : 's'}`; };
    textArea.addEventListener('input', update); update();
  }

  // ----- actions -----
  const arm = (el, label) => {
    if (el.dataset.armed) return true;
    el.dataset.armed = '1'; el.dataset.label = el.textContent; el.textContent = label;
    setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = el.dataset.label; } }, 4000);
    return false;
  };

  function startRun(templateId) {
    const t = findTemplate(templateId); if (!t) return;
    const steps = parseRunbookText(t.text).map(s => ({ id: uid('s'), section: s.section, text: s.text, hint: s.hint, done: false, doneAt: null, note: '' }));
    if (!steps.length) { toast('That runbook has no steps yet.', 'error'); return; }
    const run = { id: uid('r'), templateId: t.id, title: t.title, name: `${t.title} — ${fileStamp()}`, createdAt: Date.now(), completedAt: null, steps, notes: '' };
    data().runs.unshift(run); saveTools();
    location.hash = `runbooks?run=${run.id}`;
  }

  function saveTemplate() {
    const title = document.getElementById('rb-title').value.trim();
    const text = document.getElementById('rb-text').value;
    if (!title) { toast('Give the runbook a title.', 'error'); return; }
    if (!parseRunbookText(text).length) { toast('Add at least one step.', 'error'); return; }
    const fields = { title, category: document.getElementById('rb-cat').value.trim(), summary: document.getElementById('rb-summary').value.trim(), text, updatedAt: Date.now() };
    const editing = document.getElementById('rb-root').dataset.edit;
    const existing = editing !== 'new' ? data().custom.find(t => t.id === editing) : null;
    if (existing) Object.assign(existing, fields); else data().custom.push({ id: uid('rbt'), ...fields });
    saveTools(); toast('Runbook saved.'); location.hash = 'runbooks';
  }

  function updateRunProgress(run) {
    const p = runProgress(run);
    const count = document.getElementById('rb-count'), bar = document.getElementById('rb-bar');
    if (count) count.textContent = `${p.done} of ${p.total}`;
    if (bar) bar.style.width = `${p.pct}%`;
  }

  function wire(root) {
    const params = hashParams();
    const run = params.run ? findRun(params.run) : null;
    const saveNotes = debounce(() => saveTools(), 350);
    root.addEventListener('click', event => {
      const el = event.target.closest('[data-rb]'); if (!el) return;
      const act = el.dataset.rb;
      if (act === 'open') location.hash = `runbooks?run=${el.dataset.id}`;
      else if (act === 'start') startRun(el.dataset.id);
      else if (act === 'new') location.hash = 'runbooks?edit=new';
      else if (act === 'edit') location.hash = `runbooks?edit=${el.dataset.id}`;
      else if (act === 'copy') location.hash = `runbooks?edit=new&from=${el.dataset.id}`;
      else if (act === 'back') location.hash = 'runbooks';
      else if (act === 'save-template') saveTemplate();
      else if (act === 'delete-template') {
        if (!arm(el, 'Click again to delete')) return;
        data().custom = data().custom.filter(t => t.id !== el.dataset.id); saveTools(); toast('Runbook deleted. Runs already started are kept.'); renderList(); wire(document.getElementById('rb-root'));
      } else if (run && act === 'note-toggle') {
        const area = root.querySelector(`textarea[data-step="${el.dataset.step}"]`);
        if (area) { area.hidden = !area.hidden; if (!area.hidden) area.focus(); }
      } else if (run && act === 'print') window.print();
      else if (run && act === 'export-md') { downloadText(runToMarkdown(run), 'text/markdown', `${safeFileName(run.name)}.md`); toast('Run exported as Markdown.'); }
      else if (run && act === 'export-csv') { downloadText(runToCsv(run), 'text/csv', `${safeFileName(run.name)}.csv`); toast('Run exported as CSV.'); }
      else if (run && act === 'reset-run') {
        if (!arm(el, 'Click again to clear')) return;
        run.steps.forEach(s => { s.done = false; s.doneAt = null; }); run.completedAt = null; saveTools(); renderRun(run); wire(document.getElementById('rb-root'));
      } else if (run && act === 'delete-run') {
        if (!arm(el, 'Click again to delete')) return;
        data().runs = data().runs.filter(r => r.id !== run.id); saveTools(); toast('Run deleted.'); location.hash = 'runbooks';
      } else if (run && act === 'finish') {
        if (run.completedAt) { run.completedAt = null; saveTools(); renderRun(run); wire(document.getElementById('rb-root')); return; }
        const open = run.steps.filter(s => !s.done).length;
        if (open && !arm(el, `${open} step${open === 1 ? ' is' : 's are'} still open — click again to finish`)) return;
        run.completedAt = Date.now(); saveTools(); toast('Run marked finished.'); renderRun(run); wire(document.getElementById('rb-root'));
      }
    });
    root.addEventListener('change', event => {
      const el = event.target.closest('[data-rb]'); if (!el || !run) return;
      if (el.dataset.rb === 'toggle') {
        const step = run.steps.find(s => s.id === el.dataset.step); if (!step) return;
        step.done = el.checked; step.doneAt = el.checked ? Date.now() : null;
        if (!el.checked) run.completedAt = null;
        saveTools();
        const row = el.closest('.rb-step'); if (row) { row.classList.toggle('is-done', step.done); const stamp = row.querySelector('.rb-when'); if (stamp) stamp.remove(); if (step.done) row.querySelector('.rb-step-body .rb-text').insertAdjacentHTML('afterend', `<small class="rb-when">Done ${esc(when(step.doneAt))}</small>`); }
        updateRunProgress(run);
      } else if (el.dataset.rb === 'name') { run.name = el.value.trim() || run.title; saveTools(); }
    });
    root.addEventListener('input', event => {
      const el = event.target.closest('[data-rb]'); if (!el || !run) return;
      if (el.dataset.rb === 'note') { const step = run.steps.find(s => s.id === el.dataset.step); if (step) { step.note = el.value; saveNotes(); } }
      else if (el.dataset.rb === 'run-notes') { run.notes = el.value; saveNotes(); }
    });
    root.addEventListener('focusout', () => saveNotes.flush());
  }

  function render() {
    const params = hashParams();
    if (params.run) {
      const run = findRun(params.run);
      if (run) { renderRun(run); wire(document.getElementById('rb-root')); return; }
      toast('That run no longer exists.', 'error');
    }
    if (params.edit) { renderEditor(params.edit, params.from); wire(document.getElementById('rb-root')); return; }
    renderList(); wire(document.getElementById('rb-root'));
  }

  return { render, badge };
}
