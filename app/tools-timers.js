// ---------- Tools: timers ----------
// A stopwatch with laps, several named countdown timers, and countdowns to a date (a go-live, a cutover).
// Running timers are stored as end times, not as ticks, so they keep counting while you are on another
// page, and a timer that ran out while the app was closed is reported the next time it opens. The maths is
// plain exported functions (so it can be checked on its own); the ticker and the page sit below.

import { uid, formatClock } from './tools-core.js?v=1';

// ---------------- pure timer maths ----------------
export function parseDuration(text) {
  const t = String(text || '').trim().toLowerCase();
  if (!t) return null;
  if (/^\d+(\.\d+)?$/.test(t)) return Math.round(parseFloat(t) * 60000);               // a bare number is minutes
  const colon = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(t);                                // h:mm:ss or m:ss
  if (colon) return ((Number(colon[1] || 0) * 60 + Number(colon[2])) * 60 + Number(colon[3])) * 1000;
  const parts = [...t.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs|hr|h|minutes?|mins|min|m|seconds?|secs|sec|s)/g)];
  if (!parts.length || parts.map(p => p[0]).join('').replace(/\s+/g, '') !== t.replace(/\s+/g, '')) return null;
  const unit = u => (u[0] === 'h' ? 3600000 : u[0] === 'm' ? 60000 : 1000);
  return Math.round(parts.reduce((sum, p) => sum + parseFloat(p[1]) * unit(p[2]), 0));
}

export function countdownRemaining(c, now = Date.now()) {
  if (c.state === 'running') return Math.max(0, c.endsAt - now);
  if (c.state === 'done') return 0;
  return c.remainingMs == null ? c.durationMs : c.remainingMs;
}
export function startCountdown(c, now = Date.now()) { const left = countdownRemaining(c, now) || c.durationMs; c.state = 'running'; c.endsAt = now + left; c.remainingMs = left; return c; }
export function pauseCountdown(c, now = Date.now()) { if (c.state === 'running') { c.remainingMs = Math.max(0, c.endsAt - now); c.state = 'paused'; } return c; }
export function resetCountdown(c) { c.state = 'idle'; c.remainingMs = c.durationMs; c.endsAt = 0; return c; }

// Marks every running countdown that has run out as done and returns those, so each is announced once.
export function tickCountdowns(list, now = Date.now()) {
  const finished = [];
  list.forEach(c => { if (c.state === 'running' && c.endsAt <= now) { c.state = 'done'; c.remainingMs = 0; c.finishedAt = now; finished.push(c); } });
  return finished;
}

export function stopwatchElapsed(sw, now = Date.now()) { return sw.running ? sw.elapsed + (now - sw.startedAt) : sw.elapsed; }
export function startStopwatch(sw, now = Date.now()) { if (!sw.running) { sw.running = true; sw.startedAt = now; } return sw; }
export function stopStopwatch(sw, now = Date.now()) { if (sw.running) { sw.elapsed = stopwatchElapsed(sw, now); sw.running = false; sw.startedAt = 0; } return sw; }
export function lapStopwatch(sw, now = Date.now()) { sw.laps.push(stopwatchElapsed(sw, now)); return sw; }
export function resetStopwatch(sw) { sw.running = false; sw.startedAt = 0; sw.elapsed = 0; sw.laps = []; return sw; }

// "12 days 3 h", "3 h 20 min", "45 s". `at` is a datetime-local string ("2026-11-01T09:00") read as local time.
export function eventRemaining(event, now = Date.now()) {
  const at = new Date(event.at).getTime();
  return Number.isFinite(at) ? at - now : NaN;
}
export function describeSpan(ms) {
  const total = Math.floor(Math.abs(ms) / 1000);
  const days = Math.floor(total / 86400), hours = Math.floor((total % 86400) / 3600), minutes = Math.floor((total % 3600) / 60), seconds = total % 60;
  if (days >= 2) return `${days} days${hours ? ` ${hours} h` : ''}`;
  if (days === 1) return `1 day ${hours} h`;
  if (hours) return `${hours} h ${minutes} min`;
  if (minutes) return `${minutes} min ${seconds} s`;
  return `${seconds} s`;
}

// ---------------- sound ----------------
let audioCtx = null;
export function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [880, 1175].forEach((freq, i) => {
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), t0 = audioCtx.currentTime + i * 0.22;
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.0001, t0); gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
      osc.connect(gain).connect(audioCtx.destination); osc.start(t0); osc.stop(t0 + 0.22);
    });
  } catch { /* no audio available: the toast still shows */ }
}

// ---------------- the page and the ticker ----------------
export function createTimers(ctx) {
  const { main, icon, escapeHtml: esc, toast, getTools, saveTools } = ctx;
  const data = () => getTools().timers;
  const PRESETS = [['5 min', 5], ['10 min', 10], ['15 min', 15], ['25 min', 25], ['45 min', 45], ['1 hour', 60]];
  const stamp = ms => formatClock(ms);

  function runningCount() { const t = data(); return t.countdowns.filter(c => c.state === 'running').length + (t.stopwatch.running ? 1 : 0); }

  // Runs once a second for the life of the app, whichever page is open.
  function tick() {
    const t = data();
    const finished = tickCountdowns(t.countdowns);
    if (finished.length) {
      saveTools();
      finished.forEach(c => toast(`${c.name || 'Timer'} finished.`, 'milestone'));
      if (t.sound !== false) beep();
    }
    if (document.getElementById('tm-root')) updateDisplays();
  }
  let ticker = null;
  function start() { if (!ticker) ticker = setInterval(tick, 1000); tick(); }

  function updateDisplays() {
    const now = Date.now(), t = data();
    t.countdowns.forEach(c => {
      const el = document.querySelector(`[data-cd-remaining="${c.id}"]`);
      if (!el) return;
      const left = countdownRemaining(c, now);
      el.textContent = stamp(left);
      const bar = document.querySelector(`[data-cd-bar="${c.id}"]`); if (bar) bar.style.width = `${c.durationMs ? Math.round(((c.durationMs - left) / c.durationMs) * 100) : 0}%`;
      const row = el.closest('.tm-card'); if (row) { row.classList.toggle('is-done', c.state === 'done'); row.classList.toggle('is-running', c.state === 'running'); }
    });
    document.querySelectorAll('[data-ev-remaining]').forEach(el => {
      const ev = t.events.find(e => e.id === el.dataset.evRemaining); if (!ev) return;
      const ms = eventRemaining(ev, now);
      el.textContent = Number.isNaN(ms) ? 'Pick a date and time' : ms >= 0 ? describeSpan(ms) : `passed ${describeSpan(ms)} ago`;
    });
    const sw = document.getElementById('sw-display'); if (sw) sw.textContent = formatClock(stopwatchElapsed(t.stopwatch, now), true);
  }

  function countdownCard(c) {
    const left = countdownRemaining(c);
    const pct = c.durationMs ? Math.round(((c.durationMs - left) / c.durationMs) * 100) : 0;
    const primary = c.state === 'running' ? ['pause', 'Pause'] : c.state === 'done' ? ['restart', 'Run again'] : [c.state === 'paused' ? 'resume' : 'start', c.state === 'paused' ? 'Resume' : 'Start'];
    return `<article class="tm-card ${c.state === 'running' ? 'is-running' : ''} ${c.state === 'done' ? 'is-done' : ''}">
      <div class="tm-card-head"><strong>${esc(c.name || 'Timer')}</strong><small>${esc(stamp(c.durationMs))} timer</small></div>
      <div class="tm-time" data-cd-remaining="${c.id}" aria-label="Time left">${stamp(left)}</div>
      <div class="progress-track"><div class="progress-bar" data-cd-bar="${c.id}" style="width:${pct}%"></div></div>
      <div class="button-row" style="margin-top:12px"><button class="${c.state === 'running' ? 'secondary' : 'primary'} small" data-tm="cd-${primary[0]}" data-id="${c.id}">${primary[1]}</button>
        <button class="ghost small" data-tm="cd-reset" data-id="${c.id}">Reset</button><button class="ghost small" data-tm="cd-delete" data-id="${c.id}" aria-label="Delete timer ${esc(c.name || '')}">${icon('trash')}</button></div></article>`;
  }

  function eventRow(ev) {
    const ms = eventRemaining(ev);
    return `<article class="tool-card"><div class="tool-card-main"><strong>${esc(ev.name || 'Untitled')}</strong><small>${esc(Number.isNaN(new Date(ev.at).getTime()) ? '' : new Date(ev.at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }))}</small></div>
      <div class="tool-card-side"><span class="tm-event-time ${ms < 0 ? 'is-past' : ''}" data-ev-remaining="${ev.id}">${Number.isNaN(ms) ? 'Pick a date and time' : ms >= 0 ? describeSpan(ms) : `passed ${describeSpan(ms)} ago`}</span>
      <button class="ghost small" data-tm="ev-delete" data-id="${ev.id}" aria-label="Delete countdown ${esc(ev.name || '')}">${icon('trash')}</button></div></article>`;
  }

  function render() {
    const t = data();
    const events = [...t.events].sort((a, b) => new Date(a.at) - new Date(b.at));
    main.innerHTML = `<div class="tool-page" id="tm-root">
      <div class="section-head"><div><h2>Timers</h2><p>A stopwatch, countdown timers that keep running while you use other pages, and countdowns to a date. Timers stay in step even if you close the app; one that ran out meanwhile is reported when you come back.</p></div>
        <div class="toggle-line"><label class="switch"><input type="checkbox" data-tm="sound" ${t.sound === false ? '' : 'checked'} aria-label="Play a sound when a timer finishes"><span></span></label><span>Sound</span></div></div>
      <section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Stopwatch</h2></div></div><div class="panel-body">
        <div class="tm-time tm-big" id="sw-display" aria-label="Stopwatch">${formatClock(stopwatchElapsed(t.stopwatch), true)}</div>
        <div class="button-row" style="margin-top:12px"><button class="${t.stopwatch.running ? 'secondary' : 'primary'}" data-tm="sw-toggle">${t.stopwatch.running ? 'Stop' : t.stopwatch.elapsed ? 'Resume' : 'Start'}</button><button class="secondary" data-tm="sw-lap">Lap</button><button class="ghost" data-tm="sw-reset">Reset</button></div>
        ${t.stopwatch.laps.length ? `<ol class="tm-laps">${t.stopwatch.laps.map((ms, i) => `<li><span>Lap ${i + 1}</span><span class="mono">${formatClock(ms - (t.stopwatch.laps[i - 1] || 0), true)}</span><span class="mono muted-line">${formatClock(ms, true)}</span></li>`).reverse().join('')}</ol>` : ''}</div></section>
      <section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Countdown timers</h2><p>Type a length such as <code>25</code> (minutes), <code>90s</code>, <code>1h30m</code>, or <code>1:30:00</code>, or tap a preset.</p></div></div><div class="panel-body">
        <div class="tm-form"><div class="field"><label for="tm-name">Name (optional)</label><input id="tm-name" type="text" maxlength="60" placeholder="Bake, break, firewall change window…" autocomplete="off"></div>
          <div class="field"><label for="tm-length">Length</label><input id="tm-length" type="text" placeholder="25m" autocomplete="off"></div>
          <button class="primary" data-tm="cd-add">Start timer</button></div>
        <div class="tm-presets">${PRESETS.map(([label, min]) => `<button class="chip" data-tm="preset" data-min="${min}">${label}</button>`).join('')}</div>
        <div class="tm-grid" style="margin-top:16px">${t.countdowns.length ? t.countdowns.map(countdownCard).join('') : '<p class="muted-line">No timers yet.</p>'}</div></div></section>
      <section class="panel"><div class="panel-header"><div><h2>Countdown to a date</h2><p>How long until a go-live, a cutover, an exam, or a deadline.</p></div></div><div class="panel-body">
        <div class="tm-form"><div class="field"><label for="ev-name">What</label><input id="ev-name" type="text" maxlength="80" placeholder="3CX go-live" autocomplete="off"></div>
          <div class="field"><label for="ev-at">When</label><input id="ev-at" type="datetime-local"></div><button class="primary" data-tm="ev-add">Add countdown</button></div>
        <div class="tool-list" style="margin-top:16px">${events.length ? events.map(eventRow).join('') : '<p class="muted-line">No dates yet.</p>'}</div></div></section></div>`;
    wire(document.getElementById('tm-root'));
  }

  function wire(root) {
    const t = data();
    const rerender = () => { saveTools(); render(); };
    root.addEventListener('click', event => {
      const el = event.target.closest('[data-tm]'); if (!el) return;
      const act = el.dataset.tm, find = id => t.countdowns.find(c => c.id === id);
      if (act === 'preset') { document.getElementById('tm-length').value = `${el.dataset.min}m`; document.getElementById('tm-length').focus(); }
      else if (act === 'cd-add') {
        const ms = parseDuration(document.getElementById('tm-length').value);
        if (!ms || ms < 1000) { toast('Enter a length such as 25, 90s, 1h30m, or 1:30:00.', 'error'); return; }
        const c = { id: uid('cd'), name: document.getElementById('tm-name').value.trim(), durationMs: ms, state: 'idle', endsAt: 0, remainingMs: ms };
        startCountdown(c); t.countdowns.push(c); rerender();
      } else if (act === 'cd-start' || act === 'cd-resume') { const c = find(el.dataset.id); if (c) { startCountdown(c); rerender(); } }
      else if (act === 'cd-restart') { const c = find(el.dataset.id); if (c) { resetCountdown(c); startCountdown(c); rerender(); } }
      else if (act === 'cd-pause') { const c = find(el.dataset.id); if (c) { pauseCountdown(c); rerender(); } }
      else if (act === 'cd-reset') { const c = find(el.dataset.id); if (c) { resetCountdown(c); rerender(); } }
      else if (act === 'cd-delete') { t.countdowns = t.countdowns.filter(c => c.id !== el.dataset.id); rerender(); }
      else if (act === 'ev-add') {
        const at = document.getElementById('ev-at').value;
        if (!at) { toast('Pick a date and time.', 'error'); return; }
        t.events.push({ id: uid('ev'), name: document.getElementById('ev-name').value.trim(), at }); rerender();
      } else if (act === 'ev-delete') { t.events = t.events.filter(e => e.id !== el.dataset.id); rerender(); }
      else if (act === 'sw-toggle') { if (t.stopwatch.running) stopStopwatch(t.stopwatch); else startStopwatch(t.stopwatch); rerender(); }
      else if (act === 'sw-lap') { if (t.stopwatch.running || t.stopwatch.elapsed) { lapStopwatch(t.stopwatch); rerender(); } }
      else if (act === 'sw-reset') { resetStopwatch(t.stopwatch); rerender(); }
    });
    root.addEventListener('change', event => { const el = event.target.closest('[data-tm="sound"]'); if (el) { t.sound = el.checked; saveTools(); } });
    root.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.target.id && ['tm-name', 'tm-length'].includes(event.target.id)) root.querySelector('[data-tm="cd-add"]').click();
      if (event.key === 'Enter' && ['ev-name', 'ev-at'].includes(event.target.id)) root.querySelector('[data-tm="ev-add"]').click();
    });
    // The stopwatch face moves ten times a second, but only while this page is on screen.
    const face = setInterval(() => { if (!document.getElementById('tm-root')) clearInterval(face); else { const sw = document.getElementById('sw-display'); if (sw && t.stopwatch.running) sw.textContent = formatClock(stopwatchElapsed(t.stopwatch), true); } }, 100);
  }

  return { render, start, badge: runningCount };
}
