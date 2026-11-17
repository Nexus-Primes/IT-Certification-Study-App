// ---------- Tools: page registry ----------
// app.js hands this module a small context (the page element, icon and escape helpers, toast, and the
// live tools state with its saver) and asks it to render a Tools route. Each tool lives in its own
// module; this file only maps routes to them and keeps the sidebar badges current.

import { createRunbooks, runProgress } from './tools-runbooks.js?v=1';
import { createNetwork, findNetworkWarnings } from './tools-network.js?v=1';
import { createCalculators } from './tools-calc.js?v=1';
import { createTimers, countdownRemaining, describeSpan, eventRemaining } from './tools-timers.js?v=1';
import { createTextTools } from './tools-text.js?v=1';
import { createShelf } from './tools-shelf.js?v=2';

export const TOOL_ROUTES = ['runbooks', 'netsheet', 'calculators', 'timers', 'shelf', 'texttools'];

export function createTools(ctx) {
  const runbooks = createRunbooks(ctx);
  const network = createNetwork(ctx);
  const calculators = createCalculators(ctx);
  const timers = createTimers(ctx);
  const textTools = createTextTools(ctx);
  const shelf = createShelf(ctx);
  const pages = { runbooks: runbooks.render, netsheet: network.render, calculators: calculators.render, timers: timers.render, shelf: shelf.render, texttools: textTools.render };

  function setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = count;
    el.classList.toggle('hidden', !count);
  }

  let started = false;
  function updateBadges() {
    setBadge('runbooks-badge', runbooks.badge());
    setBadge('timers-badge', timers.badge());
    // The timer clock starts the first time the app has real data to look at (this runs on every render).
    if (!started) { started = true; timers.start(); }
  }

  // A slim line of what is open right now, for the top of the Dashboard: runs in progress, running timers,
  // the nearest dates, and anything the network sheet flags. Empty (and so invisible) when there is nothing.
  function todayStrip() {
    const t = ctx.getTools(), now = Date.now(), esc = ctx.escapeHtml, chips = [];
    const chip = (route, iconName, title, detail) => `<button class="today-chip" data-route="${route}">${ctx.icon(iconName)}<span><strong>${esc(title)}</strong><small>${esc(detail)}</small></span></button>`;
    t.runbooks.runs.filter(run => !run.completedAt).slice(0, 2).forEach(run => { const p = runProgress(run); chips.push(chip(`runbooks?run=${run.id}`, 'clipboard', run.name, `${p.done} of ${p.total} steps`)); });
    const running = t.timers.countdowns.filter(c => c.state === 'running');
    const count = running.length + (t.timers.stopwatch.running ? 1 : 0);
    if (count) {
      const soonest = running.map(c => countdownRemaining(c, now)).sort((a, b) => a - b)[0];
      chips.push(chip('timers', 'clock', `${count} timer${count === 1 ? '' : 's'} running`, soonest == null ? 'stopwatch running' : `next ends in ${describeSpan(soonest)}`));
    }
    t.timers.events.map(e => ({ e, ms: eventRemaining(e, now) })).filter(x => x.ms >= 0).sort((a, b) => a.ms - b.ms).slice(0, 2)
      .forEach(x => chips.push(chip('timers', 'calendar', x.e.name || 'Date', `in ${describeSpan(x.ms)}`)));
    const warnings = findNetworkWarnings(t.network).messages;
    if (warnings.length) chips.push(chip(`netsheet?tab=${warnings[0].table}`, 'alert', 'Network sheet', `${warnings.length} thing${warnings.length === 1 ? '' : 's'} to check`));
    return chips.length ? `<section class="today-strip" aria-label="Your tools today"><span class="today-label">Today</span>${chips.join('')}</section>` : '';
  }

  function render(route) {
    (pages[route] || pages.runbooks)();
    updateBadges();
  }

  return { routes: new Set(TOOL_ROUTES), render, updateBadges, todayStrip };
}
