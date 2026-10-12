"""Tools: runbooks, network sheet, calculators, timers, document shelf, and text tools."""
import json
import os
import tempfile
import time

from checks.pages import PAGE_AUDIT_JS
from lib.framework import go, open_app, reload, set_theme
from lib.js import contrast_js

try:
    import pymupdf  # type: ignore
except ImportError:  # optional
    pymupdf = None

CONTRAST_JS = contrast_js("#main-content")


def click(browser, selector):
    browser.eval(f"document.querySelector({selector!r}).click()")


def saved_tools(sandbox):
    return sandbox.progress().get("app-tools", {})


def wait_saved(sandbox, predicate, timeout=5.0):
    """The app saves in the background, so poll the progress file instead of trusting a fixed sleep."""
    end = time.time() + timeout
    while time.time() < end:
        if predicate(saved_tools(sandbox)):
            return True
        time.sleep(0.2)
    return False


def audit_view(t, browser, label):
    """The same sweep every page gets: names, ids, sideways scroll, and contrast, in both themes."""
    problems = []
    for theme in ("dark", "light"):
        set_theme(browser, theme)
        time.sleep(0.2)
        result = browser.eval(PAGE_AUDIT_JS)
        if result["unnamed"]:
            problems.append(f"{theme} unnamed controls: {'; '.join(result['unnamed'])}")
        if result["dups"]:
            problems.append(f"{theme} duplicate ids: {','.join(result['dups'])}")
        if result["overflow"]:
            problems.append(f"{theme} scrolls sideways ({result['overflow']})")
        low = browser.eval(CONTRAST_JS)[:3]
        if low:
            problems.append(f"{theme} low contrast: {'; '.join(map(str, low))}")
    set_theme(browser, "dark")
    t.check(not problems, f"{label}: named controls, unique ids, no sideways scroll, readable in both themes", " | ".join(problems[:4]))


def run_runbooks(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: runbooks")
    go(browser, "runbooks", wait=0.8)
    t.check(browser.eval("!!document.querySelector('.nav-group[data-group=\"tools\"] [data-route=\"runbooks\"]')"), "the sidebar has a Tools group with Runbooks")
    count = browser.eval("document.querySelectorAll('.tool-template').length")
    t.check(count >= 8, "the built-in runbooks are listed", str(count))

    info = browser.eval("""import('/app/runbook-templates.js').then(async tpl => { const rb = await import('/app/tools-runbooks.js');
      return tpl.BUILTIN_RUNBOOKS.map(t => { const steps = rb.parseRunbookText(t.text);
        return { id: t.id, n: steps.length, sections: new Set(steps.map(s => s.section)).size, dup: steps.length - new Set(steps.map(s => s.text)).size, empty: steps.filter(s => !s.text).length }; }); })""")
    bad = [i["id"] for i in info if i["n"] < 8 or i["sections"] < 2 or i["dup"] or i["empty"]]
    t.check(not bad, "every built-in runbook has real steps in two or more sections, none repeated", ", ".join(bad))
    golive = next(i for i in info if i["id"] == "rb-3cx-golive")["n"]

    parsed = browser.eval("""import('/app/tools-runbooks.js').then(rb => rb.parseRunbookText('## One\\n- First step :: a hint\\n\\nSecond step\\n## Two\\nThird'))""")
    t.check([s["text"] for s in parsed] == ["First step", "Second step", "Third"] and parsed[0]["hint"] == "a hint" and parsed[2]["section"] == "Two",
            "the plain-text format parses sections, bullets, hints, and blank lines")

    t.suite("tools: running a runbook")
    click(browser, '[data-rb="start"][data-id="rb-3cx-golive"]')
    time.sleep(0.7)
    t.check(browser.eval("location.hash").startswith("#runbooks?run="), "starting a run opens it")
    t.check(browser.eval("document.querySelectorAll('.rb-step').length") == golive, f"the run holds all {golive} steps")
    browser.eval("document.querySelectorAll('input[data-rb=toggle]')[0].click(); document.querySelectorAll('input[data-rb=toggle]')[1].click()")
    time.sleep(0.4)
    t.check(browser.eval("document.getElementById('rb-count').textContent") == f"2 of {golive}", "ticking steps updates the count")
    t.check(wait_saved(sandbox, lambda s: sum(1 for step in s.get("runbooks", {}).get("runs", [{"steps": []}])[0]["steps"] if step["done"]) == 2 if s.get("runbooks", {}).get("runs") else False),
            "the ticks reach the progress file")
    reload(browser, wait=2.5)
    t.check(browser.eval("document.getElementById('rb-count') && document.getElementById('rb-count').textContent") == f"2 of {golive}", "progress survives a reload")

    click(browser, '[data-rb="note-toggle"]')
    browser.eval("(() => { const a = document.querySelector('textarea[data-rb=note]'); a.value = 'Checked with the network team'; a.dispatchEvent(new Event('input', { bubbles: true })); })()")
    t.check(wait_saved(sandbox, lambda s: any(step["note"] == "Checked with the network team" for step in s["runbooks"]["runs"][0]["steps"])), "a step note is saved")
    browser.eval("(() => { const a = document.getElementById('rb-notes'); a.value = 'Run note'; a.dispatchEvent(new Event('input', { bubbles: true })); })()")
    t.check(wait_saved(sandbox, lambda s: s["runbooks"]["runs"][0].get("notes") == "Run note"), "the run notes are saved")
    browser.eval("(() => { const i = document.querySelector('[data-rb=name]'); i.value = 'Branch office go-live'; i.dispatchEvent(new Event('change', { bubbles: true })); })()")
    t.check(wait_saved(sandbox, lambda s: s["runbooks"]["runs"][0]["name"] == "Branch office go-live"), "a run can be renamed")

    # Finishing with steps still open asks twice; reopening is one click.
    click(browser, '[data-rb="finish"]')
    time.sleep(0.3)
    t.check(browser.eval("document.querySelector('[data-rb=finish]').dataset.armed") == "1" and not saved_tools(sandbox)["runbooks"]["runs"][0]["completedAt"],
            "finishing with open steps asks for a second click")
    click(browser, '[data-rb="finish"]')
    t.check(wait_saved(sandbox, lambda s: bool(s["runbooks"]["runs"][0]["completedAt"])), "the second click finishes the run")
    t.check(browser.eval("document.querySelector('[data-rb=finish]').textContent.trim()") == "Reopen this run", "a finished run offers Reopen")
    go(browser, "runbooks", wait=0.6)
    t.check(browser.eval("document.getElementById('runbooks-badge').classList.contains('hidden')"), "a finished run no longer counts on the sidebar badge")
    t.check("Finished runs" in browser.eval("document.getElementById('main-content').innerText"), "finished runs are listed for the record")
    click(browser, ".tool-card [data-rb=open]")
    time.sleep(0.5)
    click(browser, '[data-rb="finish"]')
    t.check(wait_saved(sandbox, lambda s: not s["runbooks"]["runs"][0]["completedAt"]), "Reopen puts the run back in progress")

    exports = browser.eval("""import('/app/tools-runbooks.js').then(rb => { const run = { name: 'Test run', title: 'T', createdAt: 0, completedAt: 0, notes: 'n',
      steps: [{ section: 'A', text: 'one', hint: 'h', done: true, doneAt: 1, note: 'x' }, { section: 'A', text: 'two, with comma', hint: '', done: false, doneAt: null, note: '' }] };
      return { md: rb.runToMarkdown(run), csv: rb.runToCsv(run), p: rb.runProgress(run) }; })""")
    t.check("- [x] one" in exports["md"] and "- [ ] two, with comma" in exports["md"] and "Note: x" in exports["md"] and "## A" in exports["md"], "the Markdown export keeps ticks, hints, and notes")
    t.check(exports["csv"].splitlines()[0] == "Section,Step,Done,Completed at,Hint,Note" and '"two, with comma"' in exports["csv"], "the CSV export quotes commas and has a header row")
    t.check(exports["p"] == {"done": 1, "total": 2, "pct": 50}, "progress is counted from the steps")

    t.suite("tools: runbooks you write yourself")
    go(browser, "runbooks?edit=new&from=rb-win-baseline", wait=0.8)
    t.check(browser.eval("document.getElementById('rb-title').value") == "Copy of New Windows Server baseline", "Copy to edit starts from the built-in list")
    browser.eval("(() => { const i = document.getElementById('rb-title'); i.value = 'Branch server build'; const a = document.getElementById('rb-text'); a.value = '## Prep\\nRack the server\\nCable it :: Both power supplies'; a.dispatchEvent(new Event('input', { bubbles: true })); })()")
    time.sleep(0.2)
    t.check("2 steps" in browser.eval("document.getElementById('rb-count-hint').textContent"), "the editor counts the steps as you type")
    click(browser, '[data-rb="save-template"]')
    t.check(wait_saved(sandbox, lambda s: any(c["title"] == "Branch server build" for c in s["runbooks"]["custom"])), "a new runbook is saved")
    time.sleep(0.5)
    t.check("Branch server build" in browser.eval("document.getElementById('main-content').innerText"), "...and appears with the built-in ones")
    custom_id = saved_tools(sandbox)["runbooks"]["custom"][0]["id"]
    click(browser, f'[data-rb="start"][data-id="{custom_id}"]')
    time.sleep(0.6)
    t.check(browser.eval("document.querySelectorAll('.rb-step').length") == 2, "a run can start from your own runbook")
    go(browser, "runbooks", wait=0.6)
    click(browser, f'[data-rb="delete-template"][data-id="{custom_id}"]')
    t.check(browser.eval(f"document.querySelector('[data-rb=delete-template][data-id=\"{custom_id}\"]').dataset.armed") == "1", "deleting a runbook asks for a second click")
    click(browser, f'[data-rb="delete-template"][data-id="{custom_id}"]')
    t.check(wait_saved(sandbox, lambda s: not s["runbooks"]["custom"]) and len(saved_tools(sandbox)["runbooks"]["runs"]) == 2, "deleting a runbook keeps the runs already started from it")

    go(browser, "runbooks", wait=0.6)
    click(browser, ".tool-card [data-rb=open]")
    time.sleep(0.5)
    click(browser, '[data-rb="delete-run"]')
    click(browser, '[data-rb="delete-run"]')
    t.check(wait_saved(sandbox, lambda s: len(s["runbooks"]["runs"]) == 1), "a run can be deleted (after a second click)")

    t.suite("tools: runbook pages")
    go(browser, "runbooks", wait=0.6)
    audit_view(t, browser, "runbooks list")
    click(browser, ".tool-card [data-rb=open]")
    time.sleep(0.6)
    audit_view(t, browser, "a runbook run")
    go(browser, "runbooks?edit=new", wait=0.6)
    audit_view(t, browser, "the runbook editor")

    if pymupdf is not None:
        go(browser, "runbooks", wait=0.6)
        click(browser, '[data-rb="start"][data-id="rb-3cx-golive"]')
        time.sleep(0.8)
        browser.eval("window.dispatchEvent(new Event('beforeprint'))")
        path = browser.pdf(os.path.join(tempfile.mkdtemp(prefix="certstudy-tools-"), "run.pdf"))
        browser.eval("window.dispatchEvent(new Event('afterprint'))")
        doc = pymupdf.open(path)
        first = doc[0].get_text()
        everything = "\n".join(page.get_text() for page in doc)
        t.check(doc.page_count <= 6, "a 47-step run prints in six pages or fewer", f"{doc.page_count} pages")
        t.check("Runbooks" in first and "Page 1 of" in first and "Tools" in first, "the printout has the masthead, 'Tools', and page numbers")
        t.check("Mark run finished" not in everything and "Print" not in everything.split("Choose the extension")[0], "buttons stay off the printout")
    t.check(not browser.errors(), "no JavaScript errors in the runbooks", "; ".join(browser.errors()[:3]))


def run(ctx):
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)
    run_runbooks(ctx, sandbox, browser)
    from checks.tools_calc_net import run_calculators, run_network  # imported here: that module imports helpers from this one
    run_calculators(ctx, sandbox, browser)
    run_network(ctx, sandbox, browser)
    from checks.tools_time_text import run_text, run_timers
    run_timers(ctx, sandbox, browser)
    run_text(ctx, sandbox, browser)
