// ---------- Tools: page registry ----------
// app.js hands this module a small context (the page element, icon and escape helpers, toast, and the
// live tools state with its saver) and asks it to render a Tools route. Each tool lives in its own
// module; this file only maps routes to them and keeps the sidebar badges current.

import { createRunbooks } from './tools-runbooks.js?v=1';
import { createNetwork } from './tools-network.js?v=1';
import { createCalculators } from './tools-calc.js?v=1';

export const TOOL_ROUTES = ['runbooks', 'netsheet', 'calculators'];

export function createTools(ctx) {
  const runbooks = createRunbooks(ctx);
  const network = createNetwork(ctx);
  const calculators = createCalculators(ctx);
  const pages = { runbooks: runbooks.render, netsheet: network.render, calculators: calculators.render };

  function setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = count;
    el.classList.toggle('hidden', !count);
  }

  function updateBadges() {
    setBadge('runbooks-badge', runbooks.badge());
  }

  function render(route) {
    (pages[route] || pages.runbooks)();
    updateBadges();
  }

  return { routes: new Set(TOOL_ROUTES), render, updateBadges };
}
