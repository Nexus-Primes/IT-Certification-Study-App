"""Minimal check reporter and shared page helpers."""
import time


class Reporter:
    def __init__(self):
        self.passed = 0
        self.failed = []
        self.warnings = []
        self._suite = ""

    def suite(self, name):
        self._suite = name
        print(f"\n== {name}")

    def check(self, ok, label, detail=""):
        if ok:
            self.passed += 1
            print(f"  ok    {label}")
        else:
            self.failed.append(f"{self._suite}: {label}" + (f" — {detail}" if detail else ""))
            print(f"  FAIL  {label}" + (f" — {detail}" if detail else ""))
        return ok

    def warn(self, label, detail=""):
        self.warnings.append(f"{self._suite}: {label}" + (f" — {detail}" if detail else ""))
        print(f"  warn  {label}" + (f" — {detail}" if detail else ""))

    def summary(self):
        print(f"\n{self.passed} passed, {len(self.failed)} failed, {len(self.warnings)} warnings")
        for line in self.failed:
            print("  FAILED:", line)
        return not self.failed


ROUTES = ["dashboard", "flashcards", "browse", "crossword", "cloze", "glossary", "guide", "notes", "practice", "exams",
          "labs", "casestudies", "sandbox", "commands", "objectives", "history", "planner", "achievements", "settings",
          "search", "report", "examday", "mistakes", "finalreview", "guide-digest", "packet", "runbooks", "netsheet", "calculators"]
SLOW_ROUTES = {"glossary", "packet", "browse", "guide"}


def open_app(browser, sandbox, route="dashboard", wait=3.0):
    """Loads the app, dismisses first-run dialogs, and waits until a page has rendered."""
    browser.goto(f"{sandbox.url}/#{route}", wait=wait)
    browser.wait_for("document.getElementById('main-content') && document.getElementById('main-content').innerText.trim().length > 20", timeout=20)
    dismiss_dialogs(browser)


def dismiss_dialogs(browser):
    for _ in range(4):
        closed = browser.eval("""(() => {
          const layer = document.getElementById('dialog-layer'); if (!layer || !layer.querySelector('.dialog')) return false;
          const btn = layer.querySelector('[data-action="onboard-skip"], [data-action="dismiss-whats-new"], [data-action="close-dialog"]');
          if (btn) { btn.click(); return true; } return false; })()""")
        if not closed:
            return
        time.sleep(0.35)


def go(browser, route, wait=0.6):
    browser.eval(f"location.hash = '#{route}'")
    time.sleep(wait + (0.5 if route in SLOW_ROUTES else 0))


def set_theme(browser, theme):
    if browser.eval("document.documentElement.dataset.theme") != theme:
        browser.eval("document.getElementById('theme-toggle').click()")
        time.sleep(0.6)


def reload(browser, wait=3.0):
    """A real page reload (a hash-only navigation does not reload the app)."""
    browser.call("Page.reload")
    time.sleep(wait)
    browser.wait_for("document.getElementById('main-content') && document.getElementById('main-content').innerText.trim().length > 20", timeout=20)
    dismiss_dialogs(browser)


def finish_quiz(browser, exam=False, limit=140):
    """Answers every question of the quiz on screen (always the first open choice) through to the results.

    Returns { question prompt: domain tag text }, read from each question's own header, so tests can see
    which domains a session actually drew from."""
    seen = {}
    for _ in range(limit):
        state = browser.eval("""(() => {
          const next = document.querySelector('[data-action="next-question"]');
          const meta = [...document.querySelectorAll('.question-meta .tag')].map(t => t.textContent.trim());
          const prompt = document.querySelector('.question-card h2')?.textContent.trim() || '';
          return { open: [...document.querySelectorAll('[data-answer]')].filter(a => !a.disabled).length, selected: !!document.querySelector('.answer-option.selected'),
                   next: !!next && !next.disabled, submit: !!document.querySelector('[data-action="submit-exam"]'),
                   results: !!document.querySelector('.results-metrics, .results-hero'), meta, prompt }; })()""")
        if state["results"]:
            return seen
        if state["prompt"] and len(state["meta"]) > 1:
            seen[state["prompt"]] = state["meta"][1]
        if state["submit"]:
            browser.eval("document.querySelector('[data-action=\"submit-exam\"]').click()")
        elif exam and not state["selected"] and state["open"]:
            browser.eval("[...document.querySelectorAll('[data-answer]')].filter(a => !a.disabled)[0].click()")
        elif state["next"]:
            browser.eval("document.querySelector('[data-action=\"next-question\"]').click()")
        elif state["open"]:
            browser.eval("[...document.querySelectorAll('[data-answer]')].filter(a => !a.disabled)[0].click()")
        time.sleep(0.25)
    return seen
