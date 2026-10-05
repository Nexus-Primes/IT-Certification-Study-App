"""Whole journeys with real data: a practice session, losing the server, accents per track,
sidebar customizing, the study plan — and printing pages that now have real content."""
import os
import tempfile
import time

from lib.framework import go, open_app, set_theme

try:
    import pymupdf  # type: ignore
except ImportError:
    pymupdf = None


def _finish_quick_10(browser, limit=60):
    """Answers a Quick 10 (always the first open choice, so some answers are wrong) through to the results."""
    browser.eval("document.querySelector('[data-action=\"quick-practice\"]').click()")
    time.sleep(0.8)
    for _ in range(limit):
        state = browser.eval("""(() => { const next = document.querySelector('[data-action="next-question"]');
          return { open: [...document.querySelectorAll('[data-answer]')].filter(a => !a.disabled).length, next: !!next && !next.disabled, results: !!document.querySelector('.results-metrics') }; })()""")
        if state["results"]:
            return True
        if state["next"]:
            browser.eval("document.querySelector('[data-action=\"next-question\"]').click()")
        elif state["open"]:
            browser.eval("[...document.querySelectorAll('[data-answer]')].filter(a => !a.disabled)[0].click()")
        time.sleep(0.3)
    return False


def _pdf_pages(browser, route, name, out):
    go(browser, route, wait=1.0)
    browser.eval("window.dispatchEvent(new Event('beforeprint'))")
    path = browser.pdf(os.path.join(out, f"{name}.pdf"))
    browser.eval("window.dispatchEvent(new Event('afterprint'))")
    if pymupdf is None:
        return None, ""
    doc = pymupdf.open(path)
    return doc.page_count, "\n".join(page.get_text() for page in doc)


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)
    set_theme(browser, "dark")

    # ------------------------------------------------------------------ practice end to end
    t.suite("flow: a practice session")
    go(browser, "practice", wait=0.8)
    t.check(_finish_quick_10(browser), "a Quick 10 can be answered through to its results")
    time.sleep(1.2)
    saved = sandbox.progress()["comptia-a-plus"]
    t.check(len(saved["sessions"]) == 1 and saved["sessions"][0]["total"] == 10, "the finished session is saved on the server", str(len(saved.get("sessions", []))))
    t.check(saved["stats"]["answered"] >= 10, "answers count toward your stats", str(saved["stats"]["answered"]))
    go(browser, "history", wait=0.8)
    t.check("Quick 10" in browser.eval("document.getElementById('main-content').innerText"), "History lists the session")
    go(browser, "dashboard", wait=0.8)
    t.check("first-try accuracy" in browser.eval("document.getElementById('main-content').innerText"), "the Dashboard now reports your accuracy")
    go(browser, "mistakes", wait=0.8)
    t.check(browser.eval("document.getElementById('main-content').innerText.length") > 100, "Mistake patterns renders with real answers behind it")
    t.check(not browser.errors(), "no JavaScript errors through the session", "; ".join(browser.errors()[:3]))

    # ------------------------------------------------------------------ printing with real content
    t.suite("print: pages with real content")
    out = tempfile.mkdtemp(prefix="certstudy-pdf-")
    if pymupdf is None:
        t.warn("PyMuPDF is not installed, so these PDFs are not inspected", "pip install pymupdf")
    else:
        pages, text = _pdf_pages(browser, "report", "report-data", out)
        t.check(pages <= 3 and "First-try accuracy" in text, "the Readiness report with data is at most 3 sheets and shows your accuracy", f"{pages} pages")
        pages, text = _pdf_pages(browser, "finalreview", "final-data", out)
        t.check(pages <= 40 and "Final Review Sheet" in text, "the Final review sheet prints", f"{pages} pages")
        pages, text = _pdf_pages(browser, "history", "history-data", out)
        t.check(pages <= 4, "Progress prints on a few sheets", f"{pages} pages")

        # A note appears on the My notes page and prints without its edit buttons.
        go(browser, "glossary", wait=1.0)
        browser.eval("document.querySelector('[data-action=\"edit-note\"]').click()")
        time.sleep(0.5)
        browser.eval("""(() => { document.getElementById('note-text').value = 'My own words about this term'; document.getElementById('note-form').requestSubmit(); })()""")
        time.sleep(0.8)
        pages, text = _pdf_pages(browser, "notes", "notes", out)
        t.check("My own words about this term" in text and pages <= 3, "My notes prints with the note's text", f"{pages} pages")
        t.check("Edit note" not in text and "Add a note" not in text, "...without the edit buttons")
        pages, text = _pdf_pages(browser, "browse", "browse", out)
        t.check(pages <= 20, "Browse cards prints as a compact table, not hundreds of sheets", f"{pages} pages")
        t.check("TERM" in text.upper() and "ACCURACY" in text.upper() and "DRILL" not in text.upper().replace("DRILLING", ""), "...with its column titles and without its action buttons")

    # ------------------------------------------------------------------ the server goes away
    t.suite("flow: losing the study server")
    go(browser, "dashboard", wait=0.6)
    sandbox.pause()
    browser.eval("document.getElementById('theme-toggle').click()")  # a change that has to be saved
    time.sleep(4.0)
    status = browser.eval("({ state: document.getElementById('save-status').dataset.state, banner: !document.getElementById('sync-banner').classList.contains('hidden'), text: document.getElementById('sync-banner').innerText.trim().slice(0, 80) })")
    t.check(status["state"] in ("error", "blocked"), "the footer says the change was not saved", str(status))
    t.check(status["banner"] and len(status["text"]) > 10, "a banner explains that the server cannot be reached", str(status))
    sandbox.resume()
    recovered = browser.wait_for("document.getElementById('save-status').dataset.state === 'saved' && document.getElementById('sync-banner').classList.contains('hidden')", timeout=40)
    t.check(recovered, "once the server is back the banner clears and the footer says Saved by itself")
    time.sleep(1.0)
    t.check(sandbox.progress()["comptia-a-plus"]["settings"]["themeMode"] == "light", "the change made while offline was saved afterwards, not lost")
    set_theme(browser, "dark")

    # ------------------------------------------------------------------ a different accent for each track
    t.suite("flow: per-track accents")
    go(browser, "settings", wait=0.7)
    browser.eval("document.querySelector('[data-action=\"settings-tab\"][data-section=\"appearance\"]').click()")
    time.sleep(0.3)
    browser.eval("(() => { const c = document.getElementById('setting-per-track-accent'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); })()")
    time.sleep(0.6)
    browser.eval("document.querySelector('[data-action=\"set-accent-color\"][data-accent=\"rose\"]').click()")
    time.sleep(0.8)
    meta = sandbox.progress()["app-meta"]
    t.check(meta["perTrackAccent"] is True and meta["trackAccents"].get("aplus") == "rose", "turning it on and choosing rose is saved for CompTIA A+", str(meta.get("trackAccents")))
    rose = browser.eval("document.documentElement.style.getPropertyValue('--primary')")
    browser.eval("document.querySelector('[data-action=\"open-palette\"]').click()")
    time.sleep(0.4)
    browser.eval("(() => { const i = document.getElementById('palette-input'); i.value = 'Network+'; i.dispatchEvent(new Event('input', { bubbles: true })); })()")
    time.sleep(0.3)
    browser.eval("[...document.querySelectorAll('.palette-opt')].find(o => o.querySelector('.palette-opt-type').textContent === 'Track').click()")
    time.sleep(1.5)
    other = browser.eval("document.documentElement.style.getPropertyValue('--primary')")
    t.check(other and other != rose, "another track shows its own accent", f"{rose} vs {other}")
    browser.eval("document.querySelector('[data-action=\"open-palette\"]').click()")
    time.sleep(0.4)
    browser.eval("(() => { const i = document.getElementById('palette-input'); i.value = 'CompTIA A+'; i.dispatchEvent(new Event('input', { bubbles: true })); })()")
    time.sleep(0.3)
    browser.eval("[...document.querySelectorAll('.palette-opt')].find(o => o.querySelector('.palette-opt-type').textContent === 'Track').click()")
    time.sleep(1.5)
    t.check(browser.eval("document.documentElement.style.getPropertyValue('--primary')") == rose, "switching back restores the rose accent")

    # ------------------------------------------------------------------ the sidebar
    t.suite("flow: customizing the sidebar")
    go(browser, "settings", wait=0.7)
    browser.eval("document.querySelector('[data-action=\"settings-tab\"][data-section=\"appearance\"]').click()")
    time.sleep(0.3)
    order = lambda: browser.eval("[...document.querySelectorAll('#navgrp-study .nav-item[data-route]')].filter(n => !n.classList.contains('nav-user-hidden')).map(n => n.dataset.route)")
    before = order()
    browser.eval("document.querySelector('[data-action=\"nav-move\"][data-nav-route=\"flashcards\"][data-dir=\"1\"]').click()")
    time.sleep(0.6)
    after = order()
    t.check(before[0] == "flashcards" and after[0] != "flashcards" and after[1] == "flashcards", "moving a page down reorders the sidebar", f"{before[:3]} -> {after[:3]}")
    browser.eval("(() => { const c = document.querySelector('.nav-visible-toggle[data-nav-route=\"crossword\"]'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); })()")
    time.sleep(0.6)
    t.check("crossword" not in order(), "hiding a page removes it from the sidebar")
    t.check(sandbox.progress()["app-meta"]["navHidden"] == {"crossword": True}, "...and the choice is saved")
    browser.eval("(() => { const c = document.getElementById('setting-sidebar-rail'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); })()")
    time.sleep(0.5)
    rail = browser.eval("({ attr: document.documentElement.dataset.rail, width: Math.round(document.getElementById('sidebar').getBoundingClientRect().width), ls: localStorage.getItem('cert-study-sidebar-rail') })")
    t.check(rail["attr"] == "on" and rail["width"] < 100 and rail["ls"] == "1", "the icon-only rail narrows the sidebar and is remembered on this device", str(rail))
    browser.eval("document.querySelector('[data-action=\"nav-reset\"]').click()")
    time.sleep(0.6)
    t.check(order() == before and sandbox.progress()["app-meta"]["navHidden"] == {}, "Reset puts the sidebar back to the default order")
    browser.eval("(() => { const c = document.getElementById('setting-sidebar-rail'); c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); })()")

    # ------------------------------------------------------------------ the study plan
    t.suite("flow: the study plan")
    go(browser, "planner", wait=1.0)
    ui_phases = lambda: browser.eval("document.querySelectorAll('[data-action=\"remove-plan-phase\"]').length")
    phases_before = ui_phases()
    t.check(browser.eval("!!document.getElementById('plan-start')"), "the planner shows its start date")
    available = browser.eval("document.getElementById('plan-add-cert') ? document.getElementById('plan-add-cert').options.length : 0")
    if available:
        browser.eval("document.querySelector('[data-action=\"add-plan-phase\"]').click()")
        time.sleep(1.0)
        saved_phases = len(sandbox.progress().get("study-plan", {}).get("phases", []))
        t.check(ui_phases() == phases_before + 1 and saved_phases == phases_before + 1, "adding a track to the plan shows it and saves it", f"{phases_before} -> page {ui_phases()}, saved {saved_phases}")
        browser.eval("(() => { const d = document.getElementById('plan-add-date'); d.value = '2000-01-01'; })()")
        browser.eval("document.querySelector('[data-action=\"add-plan-phase\"]').click()")
        time.sleep(0.5)
        t.check(browser.eval("!!document.querySelector('.toast.error')"), "a target date before the rest of the plan is refused")
        browser.eval("[...document.querySelectorAll('[data-action=\"remove-plan-phase\"]')].pop().click()")
        time.sleep(0.9)
        t.check(ui_phases() == phases_before and len(sandbox.progress()["study-plan"]["phases"]) == phases_before, "removing it again puts the plan back")
    t.check(not browser.errors(), "no JavaScript errors through these flows", "; ".join(browser.errors()[:3]))
