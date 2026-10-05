"""Whole-app sweeps: boot, every page in both themes, contrast, keyboard focus."""
import json
import time

from lib.framework import ROUTES, go, open_app, set_theme
from lib.js import contrast_js

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

CONTRAST_JS = contrast_js("#main-content")


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
