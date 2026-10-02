// ---------- Themed dropdowns, date pickers, and font suggestions ----------
// Browser-native <select> lists, date calendars, and <datalist> popups cannot be styled, so each is
// progressively replaced by an in-page popover built from the app's own tokens. This module owns
// them and the "only one popover open at a time" rule that the color picker in app.js shares.
import { icon, escapeHtml, formatDateKey, todayKey, addDays } from './utils.js?v=4';

// ---------- Custom select/date-picker chrome ----------
// A native <select>'s open options list and a native <input type="date">'s calendar popup
// cannot be restyled past color-scheme in any current browser — no rounded corners, no brand
// colors, no custom hover states reachable via CSS. These progressively enhance every one of
// them with a real in-page popover built from the app's own tokens, while leaving the
// original element in the DOM (hidden, not removed) as the actual value-holder — every
// existing `.value` read and `change` listener elsewhere in this file keeps working
// completely unchanged, since the enhancement just drives the same element and re-dispatches
// a real `change` event on it.
let openCustomPopover = null;
// Other popovers (the color picker) register the same way, so only one is ever open.
export function registerCustomPopover(closer) { openCustomPopover = closer; }
export function releaseCustomPopover(closer) { if (openCustomPopover === closer) openCustomPopover = null; }
// A closer is told how it was dismissed ('cancel' for Escape, undefined for a click elsewhere);
// only the color picker cares — every other popover just closes.
export function closeAnyCustomPopover(how) { if (openCustomPopover) { const close = openCustomPopover; openCustomPopover = null; close(how); } }
document.addEventListener('click', event => { if (openCustomPopover && !event.target.closest('.xselect, .xdate, .cp-pop, .swatch-custom')) closeAnyCustomPopover(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAnyCustomPopover('cancel'); });

function hideNativeControl(el) {
  el.classList.add('visually-hidden');
  el.tabIndex = -1;
  el.setAttribute('aria-hidden', 'true');
}

function enhanceSelect(select) {
  if (select.dataset.enhanced || select.classList.contains('gui-select')) return; // lab GUI controls are part of the graded simulation UI, left native on purpose
  select.dataset.enhanced = '1';
  hideNativeControl(select);
  const wrap = document.createElement('div');
  wrap.className = 'xselect';
  select.insertAdjacentElement('afterend', wrap);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  // Practice/Flashcards/comparison filters live inside a .field wrapper (42px, --surface-2)
  // alongside real text/date inputs in the same form — match that sizing there instead of
  // the smaller .tab-button treatment used for standalone selects like Settings' own.
  trigger.className = select.closest('.field') ? 'xselect-trigger xselect-trigger-field' : 'xselect-trigger tab-button';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `<span class="xselect-label"></span>${icon('chevron')}`;
  trigger.querySelector('svg').classList.add('xselect-chevron');
  const menu = document.createElement('div');
  menu.className = 'xselect-menu hidden';
  menu.setAttribute('role', 'listbox');
  wrap.append(trigger, menu);

  const syncLabel = () => { trigger.querySelector('.xselect-label').textContent = select.options[select.selectedIndex]?.textContent || ''; };
  const close = () => { menu.classList.add('hidden'); trigger.setAttribute('aria-expanded', 'false'); };
  const optionEls = () => [...menu.querySelectorAll('.xselect-option')];
  // Real focus, not aria-activedescendant — every option is already a genuine focusable
  // button, so moving actual DOM focus between them works with any screen reader for free,
  // instead of needing the container to own focus and announce a virtual position.
  const focusOptionAt = index => { const opts = optionEls(); if (!opts.length) return; opts[((index % opts.length) + opts.length) % opts.length].focus(); };
  const open = () => {
    closeAnyCustomPopover();
    menu.innerHTML = '';
    [...select.options].forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'xselect-option' + (opt.selected ? ' active' : ''); btn.setAttribute('role', 'option'); btn.textContent = opt.textContent;
      btn.addEventListener('click', () => { select.value = opt.value; select.dispatchEvent(new Event('change', { bubbles: true })); syncLabel(); close(); trigger.focus(); });
      menu.appendChild(btn);
    });
    menu.classList.remove('hidden'); trigger.setAttribute('aria-expanded', 'true');
    openCustomPopover = close;
    // Land keyboard focus on the current selection (or the first option), the same way a
    // native <select> highlights the current value the instant it opens.
    focusOptionAt(Math.max(0, select.selectedIndex));
  };
  // Arrow keys / Home / End move real focus between options; typing a letter jumps to the
  // next option starting with it — the same interaction a native <select> already gives you
  // for free, which a custom-built replacement otherwise silently drops.
  menu.addEventListener('keydown', event => {
    const opts = optionEls(); const current = opts.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') { event.preventDefault(); focusOptionAt(current + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusOptionAt(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusOptionAt(0); }
    else if (event.key === 'End') { event.preventDefault(); focusOptionAt(opts.length - 1); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); trigger.focus(); }
    else if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
      const letter = event.key.toLowerCase(); const from = current + 1;
      const match = opts.slice(from).concat(opts.slice(0, from)).find(o => o.textContent.trim().toLowerCase().startsWith(letter));
      if (match) { event.preventDefault(); match.focus(); }
    }
  });
  trigger.addEventListener('click', () => (menu.classList.contains('hidden') ? open() : close()));
  select.addEventListener('change', syncLabel);
  syncLabel();
}

function enhanceDateInput(input) {
  if (input.dataset.enhanced) return;
  input.dataset.enhanced = '1';
  hideNativeControl(input);
  const wrap = document.createElement('div');
  wrap.className = 'xdate';
  input.insertAdjacentElement('afterend', wrap);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  // Study Plan's date fields live inside a .field wrapper (42px/9px-radius, full width) —
  // visually distinct from Settings' own narrower .setting-date-input (36px/8px/152px) — the
  // trigger needs to match whichever context it's actually replacing.
  trigger.className = (input.closest('.field') ? 'xdate-trigger' : 'setting-date-input xdate-trigger');
  trigger.innerHTML = `<span class="xdate-trigger-label"></span>${icon('calendar')}`;
  const popover = document.createElement('div');
  popover.className = 'xdate-popover hidden';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Choose a date');
  wrap.append(trigger, popover);

  let viewDate = input.value ? new Date(`${input.value}T00:00:00`) : new Date();
  // The day currently reachable by Tab (roving tabindex, like a native date grid) — separate
  // from the selected value, since arrow-key browsing moves this around before anything is
  // actually chosen.
  let focusDateStr = input.value || todayKey();
  const syncLabel = () => { trigger.querySelector('.xdate-trigger-label').textContent = input.value ? formatDateKey(input.value) : 'mm/dd/yyyy'; };
  const setValue = value => { input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })); syncLabel(); };
  const close = () => popover.classList.add('hidden');
  // A screen reader hearing a bare day button ("15, button") has no idea what month or year
  // it's in — the full date needs to be the accessible name, even though the visible label
  // stays just the day number for a scannable grid.
  const dayLabel = dateStr => new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${dateStr}T00:00:00`));
  const render = focusAfter => {
    const year = viewDate.getFullYear(); const month = viewDate.getMonth();
    const startDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const todayStr = todayKey();
    const cells = [];
    for (let i = startDow - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, muted: true, dateStr: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    while (cells.length % 7 !== 0) cells.push({ day: '', muted: true, dateStr: null });
    popover.innerHTML = `<div class="xdate-head"><button type="button" class="xdate-nav" data-nav="-1" aria-label="Previous month">${icon('chevron')}</button><strong aria-live="polite">${escapeHtml(viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))}</strong><button type="button" class="xdate-nav" data-nav="1" aria-label="Next month">${icon('chevron')}</button></div><div class="xdate-grid" role="grid">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<div class="xdate-dow">${d}</div>`).join('')}${cells.map(c => `<button type="button" class="xdate-day${c.muted ? ' muted' : ''}${c.dateStr && c.dateStr === input.value ? ' selected' : ''}${c.dateStr === todayStr ? ' today' : ''}" ${c.dateStr ? `data-date="${c.dateStr}" aria-label="${escapeHtml(dayLabel(c.dateStr))}" tabindex="${c.dateStr === focusDateStr ? '0' : '-1'}"` : 'disabled aria-hidden="true"'}>${c.day}</button>`).join('')}</div><div class="xdate-foot"><button type="button" data-act="clear">Clear</button><button type="button" data-act="today">Today</button></div>`;
    popover.querySelectorAll('.xdate-nav').forEach(btn => btn.addEventListener('click', () => { viewDate = new Date(year, month + Number(btn.dataset.nav), 1); focusDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-01`; render(true); }));
    popover.querySelectorAll('.xdate-day[data-date]').forEach(btn => btn.addEventListener('click', () => { setValue(btn.dataset.date); close(); trigger.focus(); }));
    popover.querySelector('[data-act="clear"]').addEventListener('click', () => { setValue(''); close(); trigger.focus(); });
    popover.querySelector('[data-act="today"]').addEventListener('click', () => { setValue(todayStr); close(); trigger.focus(); });
    if (focusAfter) popover.querySelector(`.xdate-day[data-date="${focusDateStr}"]`)?.focus();
  };
  // Left/right move a day, up/down move a week, crossing into the next or previous month
  // re-renders the grid around the new date — the same browsing model a native date input's
  // own picker uses, instead of forcing Tab-by-Tab travel through every day in between.
  const moveFocus = deltaDays => {
    focusDateStr = addDays(focusDateStr, deltaDays);
    const next = new Date(`${focusDateStr}T00:00:00`);
    if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) viewDate = new Date(next.getFullYear(), next.getMonth(), 1);
    render(true);
  };
  popover.addEventListener('keydown', event => {
    if (!event.target.classList.contains('xdate-day')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(7); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(-7); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); trigger.focus(); }
  });
  trigger.addEventListener('click', () => {
    if (!popover.classList.contains('hidden')) { close(); return; }
    closeAnyCustomPopover();
    viewDate = input.value ? new Date(`${input.value}T00:00:00`) : new Date();
    focusDateStr = input.value || todayKey();
    render();
    popover.classList.remove('hidden');
    openCustomPopover = close;
    popover.querySelector(`.xdate-day[data-date="${focusDateStr}"]`)?.focus();
  });
  syncLabel();
}

// The one free-text case (type any font, not just pick from a fixed list) — its own function
// rather than a variant of enhanceSelect, since the trigger IS the real input the user types
// into, not a button standing in for a hidden one. Replaces the earlier <datalist> approach
// (v183/v184) entirely, since a datalist's suggestion popup has the exact same "can't be
// restyled" limitation as a select's options list.
// Starts null and falls back to the default list at first real use in renderMenu() below.
let fontSuggestions = null;
export function setFontSuggestions(list) { fontSuggestions = list; }
// The built-in list app.js shows when the browser cannot report installed fonts.
let defaultFonts = [];
export function setDefaultFonts(list) { defaultFonts = list; }
function enhanceFontAutocomplete() {
  const input = document.getElementById('setting-font-name');
  if (!input || input.dataset.enhanced) return;
  input.dataset.enhanced = '1';
  input.removeAttribute('list');
  const wrap = document.createElement('div');
  wrap.className = 'xselect';
  // The input carries its own flex sizing (flex:1;min-width:200px) as an inline style so it
  // grows correctly inside the settings row's button-row; moving it one level deeper (inside
  // this new wrapper) means that flex sizing has to move with it onto the wrapper instead,
  // or the row layout collapses back to content-width.
  wrap.style.cssText = input.style.cssText;
  input.style.cssText = 'width:100%';
  input.parentElement.insertBefore(wrap, input);
  const menu = document.createElement('div');
  menu.className = 'xselect-menu hidden';
  menu.setAttribute('role', 'listbox');
  wrap.append(input, menu);
  const close = () => menu.classList.add('hidden');
  const renderMenu = () => {
    const source = fontSuggestions || defaultFonts;
    const query = input.value.trim().toLowerCase();
    const matches = (query ? source.filter(name => name.toLowerCase().includes(query)) : source).slice(0, 40);
    menu.innerHTML = matches.length ? matches.map(name => `<button type="button" class="xselect-option" style="font-family:${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('') : `<div class="xselect-empty">No matches — your own typed name will still be used.</div>`;
    menu.querySelectorAll('.xselect-option').forEach(btn => btn.addEventListener('click', () => { input.value = btn.textContent; input.dispatchEvent(new Event('change', { bubbles: true })); input.dispatchEvent(new Event('input', { bubbles: true })); close(); }));
  };
  input.addEventListener('focus', () => { closeAnyCustomPopover(); renderMenu(); menu.classList.remove('hidden'); openCustomPopover = close; });
  input.addEventListener('input', renderMenu);
}

// Runs once at boot (see the bottom of this file) and again on demand — a MutationObserver
// catches every select/date-input that appears from here on regardless of which render
// function created it, so no individual page-render function needs its own explicit call.
export function enhanceControlsIn(root) {
  root.querySelectorAll('select:not([data-enhanced])').forEach(enhanceSelect);
  root.querySelectorAll('input[type="date"]:not([data-enhanced])').forEach(enhanceDateInput);
  enhanceFontAutocomplete();
}
const pageMain = document.getElementById('main-content'), pageDialogs = document.getElementById('dialog-layer');
new MutationObserver(() => { enhanceControlsIn(pageMain); enhanceControlsIn(pageDialogs); }).observe(document.body, { childList: true, subtree: true });
