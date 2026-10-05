"""Browser-side checker for the concept diagrams (inline SVG).

It renders each diagram exactly as the app does (inside .concept-diagram) and reports, per concept:
  outside   a piece of text pokes outside the viewBox
  overlap   two pieces of text overlap by more than 15% of the smaller one
  contrast  text below 4.5:1 against what is drawn behind it (3:1 for the faint footer caption)
  gap       the footer caption sits closer than 6 units to the content above it (or overlaps it)

Lessons baked in (see the project notes): contrast reads SVG fill-opacity as well as rgba(), parses
color(srgb ...) results, blends every translucent shape under the text, and treats a caption as the
footer only if it is muted-2, left-anchored, and in the bottom third.
"""

CHECK_JS = r"""
(async (conceptsExpr, theme) => {
  const concepts = eval(conceptsExpr);
  document.documentElement.dataset.theme = theme;
  const host = document.createElement('div'); host.className = 'concept-diagram'; host.style.cssText = 'position:absolute;left:-9999px;top:0;width:380px';
  document.body.appendChild(host);
  const num = s => (String(s).match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number);
  const parse = s => { if (!s || s === 'none') return null; const n = num(s);
    if (s.startsWith('color(')) return { r: n[0] * 255, g: n[1] * 255, b: n[2] * 255, a: n.length > 3 ? n[3] : 1 };
    return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }; };
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const lum = c => .2126 * lin(c.r) + .7152 * lin(c.g) + .0722 * lin(c.b);
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const page = parse(getComputedStyle(host).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const pageSolid = page.a < 1 ? over(page, parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }) : page;
  const SHAPES = 'rect,circle,ellipse,path,polygon';
  const paint = el => { const cs = getComputedStyle(el); const f = parse(cs.fill); if (!f) return null; const fo = parseFloat(cs.fillOpacity); const o = parseFloat(cs.opacity);
    return { ...f, a: f.a * (isNaN(fo) ? 1 : fo) * (isNaN(o) ? 1 : o) }; };
  const boxOf = el => { try { const b = el.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; } catch { return null; } };
  const out = [];
  for (const concept of concepts) {
    if (!concept.diagram) continue;
    host.innerHTML = concept.diagram;
    const svg = host.querySelector('svg'); if (!svg) { out.push([concept.id, 'nosvg', '']); continue; }
    const vb = (svg.getAttribute('viewBox') || '0 0 380 180').split(/\s+/).map(Number); const W = vb[2], H = vb[3];
    const texts = [...svg.querySelectorAll('text')].map(el => ({ el, b: boxOf(el) })).filter(t => t.b && t.b.w > 0);
    const shapes = [...svg.querySelectorAll(SHAPES)].map(el => ({ el, b: boxOf(el), p: paint(el) })).filter(s => s.b);
    // footer = muted-2, left-anchored, bottom third
    const isFooter = t => (t.el.getAttribute('fill') || '').includes('muted-2') && (t.el.getAttribute('text-anchor') || 'start') === 'start' && t.b.y > H * .62;
    const footers = texts.filter(isFooter);
    texts.forEach(t => {
      if (t.b.x < -1 || t.b.y < -1 || t.b.x + t.b.w > W + 1 || t.b.y + t.b.h > H + 1) out.push([concept.id, 'outside', (t.el.textContent || '').slice(0, 30)]);
    });
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i].b, b = texts[j].b;
      const iw = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), ih = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (iw > 1 && ih > 1 && (iw * ih) / Math.min(a.w * a.h, b.w * b.h) > .15) out.push([concept.id, 'overlap', (texts[i].el.textContent || '').slice(0, 18) + ' / ' + (texts[j].el.textContent || '').slice(0, 18)]);
    }
    texts.forEach(t => {
      const cx = t.b.x + t.b.w / 2, cy = t.b.y + t.b.h / 2; let bg = { ...pageSolid };
      shapes.filter(s => s.p && s.p.a > 0 && cx >= s.b.x && cx <= s.b.x + s.b.w && cy >= s.b.y && cy <= s.b.y + s.b.h)
            .sort((p, q) => (p.el.compareDocumentPosition(q.el) & 4) ? -1 : 1).forEach(s => { bg = over(s.p, bg); });
      const f = paint(t.el); if (!f) return; const fg = f.a < 1 ? over(f, bg) : f;
      const r = ratio(fg, bg); const need = footers.includes(t) ? 3 : 4.5;
      if (r < need) out.push([concept.id, 'contrast', ((t.el.textContent || '').slice(0, 24)) + ' ' + r.toFixed(2)]);
    });
    if (footers.length) {
      const top = Math.min(...footers.map(f => f.b.y)); const fx0 = Math.min(...footers.map(f => f.b.x)), fx1 = Math.max(...footers.map(f => f.b.x + f.b.w));
      const above = [...texts.filter(t => !footers.includes(t)).map(t => t.b), ...shapes.filter(s => s.p && s.p.a > .05 || s.el.getAttribute('stroke')).map(s => s.b)];
      let worst = null;
      above.forEach(b => {
        if (b.x + b.w < fx0 || b.x > fx1) return;                   // no horizontal overlap with the caption
        if (b.y <= 2 && b.h >= H - 4) return;                         // a background that frames everything
        if (b.y < top && b.y + b.h > top + 6 && b.y + b.h > H - 14) return; // a frame that contains the caption
        const gap = top - (b.y + b.h);
        if (b.y + b.h > top - 0.01 && b.y > top) return;               // below the caption
        if (worst === null || gap < worst) worst = gap;
      });
      if (worst !== null && worst < 6) out.push([concept.id, 'gap', worst.toFixed(1)]);
    }
  }
  host.remove();
  return out;
})
"""


def run_check(browser, concepts_expr, theme):
    """Returns [[concept id, kind, detail], ...] for the diagrams in `concepts_expr` (a JS expression)."""
    return browser.eval(f"({CHECK_JS})({concepts_expr!r}, {theme!r})")
