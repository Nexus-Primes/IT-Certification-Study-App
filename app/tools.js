// ---------- Tools: page registry ----------
// app.js hands this module a small context (the page element, icon and escape helpers, toast, and the
// live tools state with its saver) and asks it to render a Tools route. Each tool lives in its own
// module; this file only maps routes to them and keeps the sidebar badges current.

import { createRunbooks } from './tools-runbooks.js?v=1';
import { createNetwork } from './tools-network.js?v=1';
import { createCalculators } from './tools-calc.js?v=1';
import { createTimers } from './tools-timers.js?v=1';
import { createTextTools } from './tools-text.js?v=1';

export const TOOL_ROUTES = ['runbooks', 'netsheet', 'calculators', 'timers', 'texttools'];

export function createTools(ctx) {
  const runbooks = createRunbooks(ctx);
  const network = createNetwork(ctx);
  const calculators = createCalculators(ctx);
  const timers = createTimers(ctx);
  const textTools = createTextTools(ctx);
  const pages = { runbooks: runbooks.render, netsheet: network.render, calculators: calculators.render, timers: timers.render, texttools: textTools.render };

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

  function render(route) {
    (pages[route] || pages.runbooks)();
    updateBadges();
  }

  return { routes: new Set(TOOL_ROUTES), render, updateBadges };
}
