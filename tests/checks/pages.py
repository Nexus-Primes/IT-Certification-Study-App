"""Whole-app sweeps: boot, every page in both themes, contrast, keyboard focus."""
import json
import time

from lib.framework import ROUTES, go, open_app, set_theme

PAGE_AUDIT_JS = r"""
(() => {
  const vis = e => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && (r.width > 0 || r.height > 0); };
  const nameOf = e => {
    if (e.getAttribute('aria-label')) return e.getAttribute('aria-label').trim();
    const lb = e.getAttribute('aria-labelledby'); if (lb) { const t = lb.split(/\s+/).map(i => document.getElementById(i)?.textContent || '').join(' ').trim(); if (t) return t; }
    if ([...(e.labels || [])].some(l => l.textContent.trim())) return 'label';
    if (['BUTTON', 'A'].includes(e.tagName)) { if (e.textContent.trim()) return e.textContent.trim(); if (e.querySelector('img[alt]')) return 'alt'; }
    if (e.getAttribute('title')) return e.getAttribute('title').trim();
    return '';
  };
  const main = document.getElementById('main-content');
  const unnamed = [...document.querySelectorAll('button, a[href], [role="button"], input:not([type="hidden"]):not([type="file"]), select, textarea')]
    .filter(e => vis(e) && !e.closest('.hidden') && e.getAttribute('aria-hidden') !== 'true' && !e.classList.contains('visually-hidden'))
    .filter(e => !nameOf(e)).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' ' + (e.dataset.action || e.dataset.route || e.type || '')).slice(0, 6);
  const ids = {}, dups = []; document.querySelectorAll('[id]').forEach(e => { if (ids[e.id]) dups.push(e.id); ids[e.id] = 1; });
  const de = document.documentElement;
  // A compact empty state inside a titled card (a chart, a panel) borrows the card's heading.
  const empties = [...main.querySelectorAll('.empty-state')].filter(e => !e.querySelector('h2,h3') && !e.closest('article, .panel, .chart-card')).length;
  return { chars: main.innerText.trim().length, headings: main.querySelectorAll('h1,h2').length + document.querySelectorAll('h1').length,
           unnamed, dups: [...new Set(dups)].slice(0, 4), overflow: de.scrollWidth > innerWidth + 1 ? de.scrollWidth + '>' + innerWidth : null,
           skeleton: !!main.querySelector('.boot-skeleton'), emptyNoHeading: empties };
})()
"""

CONTRAST_JS = r"""
(() => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(s => parseFloat(s)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const lum = c => .2126 * lin(c.r) + .7152 * lin(c.g) + .0722 * lin(c.b);
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = el => { const layers = []; let e = el; while (e) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } if (cs.backgroundImage !== 'none') return null; e = e.parentElement; }
    let base = { r: 255, g: 255, b: 255, a: 1 }; const bb = parse(getComputedStyle(document.body).backgroundColor); if (bb && bb.a > 0) base = bb; for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base); return base; };
  const out = []; const seen = new Set();
  const walker = document.createTreeWalker(document.getElementById('main-content'), NodeFilter.SHOW_TEXT);
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


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)

    t.suite("app: boot")
    version = browser.eval("document.getElementById('footer-version').textContent")
    t.check(bool(version) and version.startswith("v"), "app boots and shows its version", version)
    t.check(not browser.errors(), "no JavaScript errors at startup", "; ".join(browser.errors()[:3]))

    t.suite("pages: every route, dark and light")
    problems = []
    for theme in ("dark", "light"):
        set_theme(browser, theme)
        for route in ROUTES:
            go(browser, route)
            result = browser.eval(PAGE_AUDIT_JS)
            where = f"{theme}:{route}"
            if result["chars"] < 30:
                problems.append(f"{where} renders almost nothing")
            if result["headings"] == 0:
                problems.append(f"{where} has no heading")
            if result["unnamed"]:
                problems.append(f"{where} has unnamed controls: {'; '.join(result['unnamed'])}")
            if result["dups"]:
                problems.append(f"{where} has duplicate ids: {','.join(result['dups'])}")
            if result["overflow"]:
                problems.append(f"{where} scrolls sideways ({result['overflow']})")
            if result["skeleton"]:
                problems.append(f"{where} still shows the loading placeholder")
            if result["emptyNoHeading"]:
                problems.append(f"{where} has an empty state without a heading")
    t.check(not problems, f"{len(ROUTES) * 2} page views: content, headings, names, ids, no sideways scroll", " | ".join(problems[:6]))
    t.check(not browser.errors(), "no JavaScript errors while visiting every page", "; ".join(browser.errors()[:3]))

    t.suite("pages: text contrast (4.5:1)")
    low = []
    for theme in ("dark", "light"):
        set_theme(browser, theme)
        for route in ROUTES:
            go(browser, route)
            for item in browser.eval(CONTRAST_JS)[:3]:
                low.append(f"{theme}:{route} '{item}'")
    t.check(not low, "all visible text meets 4.5:1 in both themes", "; ".join(low[:6]))

    t.suite("pages: keyboard focus is visible")
    probe = """(() => { const e = document.activeElement; if (!e || e === document.body) return null; const c = getComputedStyle(e); const r = e.getBoundingClientRect();
      return { ok: !(r.width > 0 && r.height > 0) || (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== 'none', who: (e.getAttribute('aria-label') || e.textContent || e.id || e.tagName).trim().slice(0, 24) }; })()"""
    bad = []
    for route in ("dashboard", "settings", "flashcards"):
        go(browser, route)
        browser.eval("document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0)")
        for _ in range(22):
            browser.press("Tab", "Tab", 9)
            time.sleep(0.04)
            info = browser.eval(probe)
            if info and not info["ok"]:
                bad.append(f"{route}: {info['who']}")
    t.check(not bad, "every Tab stop on the dashboard, settings, and flashcards shows a focus ring", "; ".join(bad[:5]))
