"""JavaScript snippets shared by the checks."""

_CONTRAST = r"""
(() => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(s => parseFloat(s)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const lum = c => .2126 * lin(c.r) + .7152 * lin(c.g) + .0722 * lin(c.b);
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = el => { const layers = []; let e = el; while (e) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } if (cs.backgroundImage !== 'none') return null; e = e.parentElement; }
    let base = { r: 255, g: 255, b: 255, a: 1 }; const bb = parse(getComputedStyle(document.body).backgroundColor); if (bb && bb.a > 0) base = bb; for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base); return base; };
  const out = []; const seen = new Set();
  const walker = document.createTreeWalker(document.querySelector(ROOT_SELECTOR), NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode; if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || r.width < 2 || r.height < 2 || el.closest('.visually-hidden, [aria-hidden="true"], .concept-diagram, svg, .hidden, button:disabled, .badge-locked, [disabled], .hl-slot') || parseFloat(cs.opacity) < 1) continue;
    const fg = parse(cs.color), bg = bgOf(el); if (!fg || !bg) continue;
    const f = fg.a < 1 ? blend(fg, bg) : fg; const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700; const large = size >= 24 || (size >= 18.66 && bold);
    if (ratio < (large ? 3 : 4.5)) out.push(n.textContent.trim().slice(0, 24) + ' ' + ratio.toFixed(2));
  }
  return out;
})()
"""


def contrast_js(root_selector="#main-content"):
    """Lists every visible text node under the root whose contrast is below WCAG AA (4.5:1, or 3:1 for large text)."""
    return _CONTRAST.replace("ROOT_SELECTOR", repr(root_selector))
