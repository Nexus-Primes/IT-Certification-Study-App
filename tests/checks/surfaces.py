"""Dialogs, pop-ups, toasts, and banners: readable in every theme, and set up as proper dialogs."""
import json
import time

from lib.framework import go, open_app, set_theme
from lib.js import contrast_js

THEMES = [("default", "dark"), ("default", "light"), ("sand", "light"), ("ink", "dark")]


def act(browser, action, **data):
    """Fires a data-action exactly as a click on a real button would (the app listens at the document)."""
    spec = json.dumps({"action": action, "data": {k.replace("_", "-"): str(v) for k, v in data.items()}})
    browser.eval("((spec) => { const b = document.createElement('button'); b.setAttribute('data-action', spec.action); "
                 "Object.entries(spec.data).forEach(([k, v]) => b.setAttribute('data-' + k, v)); document.body.appendChild(b); b.click(); b.remove(); })(" + spec + ")")
    time.sleep(0.45)


def type_in(browser, selector, value):
    browser.eval(f"(() => {{ const i = document.querySelector({selector!r}); i.value = {value!r}; i.dispatchEvent(new Event('input', {{ bubbles: true }})); }})()")
    time.sleep(0.35)


def close_everything(browser):
    browser.eval("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))")
    browser.eval("document.querySelector('#dialog-layer [data-action=\"close-dialog\"]')?.click(); document.querySelectorAll('.cp-pop').forEach(p => p.remove())")
    time.sleep(0.3)


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)
    first_concept = browser.eval("window.APLUS_DATA.concepts[0].id")

    # Something for the restore dialog to list.
    import datetime
    for n, version in ((2, "v217"), (9, "v210")):
        day = (datetime.date.today() - datetime.timedelta(days=n)).isoformat()
        sandbox.post_json("/api/backup", {"format": "full", "app": "Cert Study", "version": version, "dateKey": day, "profile": "default", "progress": {"zz": {"v": n}}})
    sandbox.post_json("/api/backup", {"format": "full", "app": "Cert Study", "version": "v219", "dateKey": datetime.date.today().isoformat(), "profile": "default", "kind": "pre-restore", "progress": {"zz": {"v": 0}}})

    # (label, how to open it, CSS selector of the thing to inspect, is it a modal dialog?)
    def whats_new(): act(browser, "open-whats-new")
    def shortcuts(): act(browser, "open-shortcuts")
    def palette_default(): act(browser, "open-palette")
    def palette_results():
        act(browser, "open-palette"); type_in(browser, "#palette-input", "secur")
    def palette_settings():
        act(browser, "open-palette"); type_in(browser, "#palette-input", "accent")
    def account(): act(browser, "open-account-dialog")
    def pin_form():
        act(browser, "open-account-dialog"); act(browser, "manage-pin")
    def onboarding():
        act(browser, "replay-onboarding")
    def onboarding_step_two():
        act(browser, "replay-onboarding"); act(browser, "onboard-next")
    def focus_timer(): act(browser, "start-focus-timer")
    def record_result(): act(browser, "record-exam-result", core="core1")
    def confirm_reset(): act(browser, "confirm-reset")
    def note(): act(browser, "edit-note", concept=first_concept)
    def custom_card(): act(browser, "open-custom-card")
    def restore(): act(browser, "open-restore-dialog"); time.sleep(0.8)
    def cert_switcher(): browser.eval("document.getElementById('cert-button').click()"); time.sleep(0.5)
    def domain_switcher(): browser.eval("document.getElementById('brand-switch').click()"); time.sleep(0.5)

    dialogs = [("What's new", whats_new), ("Keyboard shortcuts", shortcuts), ("Command palette", palette_default), ("Palette with content results", palette_results),
               ("Palette with settings results", palette_settings), ("Switch account", account), ("Set a PIN", pin_form), ("Walkthrough step 1", onboarding),
               ("Walkthrough step 2", onboarding_step_two), ("Focus timer", focus_timer), ("Record exam result", record_result), ("Reset everything", confirm_reset),
               ("Add a note", note), ("Custom card", custom_card), ("Restore a saved backup", restore), ("Track switcher", cert_switcher), ("Certifications/Programs switcher", domain_switcher)]

    for preset, theme in THEMES:
        label = f"{preset}/{theme}"
        t.suite(f"surfaces: dialogs in {label}")
        go(browser, "dashboard", wait=0.7)
        act(browser, "set-theme-preset", preset=preset)
        set_theme(browser, theme)
        problems, structure, low = [], [], []
        for name, opener in dialogs:
            close_everything(browser)
            opener()
            info = browser.eval("""(() => { const d = document.querySelector('#dialog-layer .dialog'); if (!d) return null;
              const lb = d.getAttribute('aria-labelledby'); const heading = lb ? (document.getElementById(lb)?.textContent || '').trim() : (d.getAttribute('aria-label') || '');
              return { role: d.getAttribute('role'), modal: d.getAttribute('aria-modal'), heading, focusInside: d.contains(document.activeElement) }; })()""")
            if not info:
                problems.append(f"{name}: did not open")
                continue
            if info["role"] != "dialog" or info["modal"] != "true" or not info["heading"]:
                structure.append(f"{name}: role={info['role']} modal={info['modal']} heading={info['heading']!r}")
            if not info["focusInside"]:
                structure.append(f"{name}: focus did not move into the dialog")
            for item in browser.eval(contrast_js("#dialog-layer .dialog"))[:3]:
                low.append(f"{name}: {item}")
            browser.eval("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))")
            time.sleep(0.35)
            if browser.eval("!!document.querySelector('#dialog-layer .dialog')"):
                structure.append(f"{name}: Escape did not close it")
        close_everything(browser)
        t.check(not problems, f"all {len(dialogs)} dialogs open", "; ".join(problems))
        t.check(not structure, "each is a labelled modal dialog that takes focus and closes on Escape", " | ".join(structure[:6]))
        t.check(not low, "all dialog text meets 4.5:1", " | ".join(low[:8]))

        t.suite(f"surfaces: pop-ups, toasts, and bars in {label}")
        found = {}
        # Themed dropdown and date picker
        go(browser, "practice", wait=0.8)
        browser.eval("document.querySelector('#practice-domain').parentElement.querySelector('.xselect-trigger').click()")
        time.sleep(0.3)
        found["dropdown menu"] = browser.eval(contrast_js(".xselect-menu:not(.hidden)"))
        close_everything(browser)
        go(browser, "settings", wait=0.8)
        browser.eval("document.querySelector('[data-action=\"settings-tab\"][data-section=\"study\"]').click()")
        time.sleep(0.3)
        browser.eval("document.querySelector('#settings-exam-date').parentElement.querySelector('.xdate-trigger').click()")
        time.sleep(0.3)
        found["date picker"] = browser.eval(contrast_js(".xdate-popover:not(.hidden)"))
        close_everything(browser)
        # Color picker, over a custom accent too
        browser.eval("document.querySelector('[data-action=\"settings-tab\"][data-section=\"appearance\"]').click()")
        time.sleep(0.3)
        browser.eval("document.querySelector('[data-picker=\"accent\"]').click()")
        time.sleep(0.4)
        found["color picker"] = browser.eval(contrast_js(".cp-pop"))
        close_everything(browser)
        # Toasts of every kind
        act(browser, "set-accent-color", accent="teal")
        go(browser, "dashboard", wait=0.6)
        browser.eval("document.querySelector('[data-action=\"open-palette\"]').click()")
        time.sleep(0.3)
        found["success toast"] = browser.eval(contrast_js("#toast-region")) if browser.eval("!!document.querySelector('#toast-region .toast')") else []
        close_everything(browser)
        act(browser, "add-plan-phase")  # no track/date chosen here: an error toast
        found["error toast"] = browser.eval(contrast_js("#toast-region")) if browser.eval("!!document.querySelector('#toast-region .toast')") else []
        act(browser, "start-flash")  # nothing due: an info toast
        found["info toast"] = browser.eval(contrast_js("#toast-region")) if browser.eval("!!document.querySelector('#toast-region .toast')") else []
        browser.eval("document.getElementById('toast-region').innerHTML = ''")
        found["footer"] = browser.eval(contrast_js(".app-footer"))
        # Every toast style and the sync banner, drawn from the app's own classes
        browser.eval("""(() => { const region = document.getElementById('toast-region');
          region.innerHTML = ['success', 'error', 'info', 'milestone'].map(k => `<div class="toast ${k}"><span></span><span>A ${k} message that is long enough to wrap onto a second line in the corner</span></div>`).join('');
          const banner = document.getElementById('sync-banner'); banner.classList.remove('hidden'); banner.innerHTML = '<div class="sync-banner-copy"><span>The study server cannot be reached. Changes are kept and will be saved.</span> <code>server.py</code></div>'; })()""")
        found["all toast kinds"] = browser.eval(contrast_js("#toast-region"))
        found["sync banner"] = browser.eval(contrast_js("#sync-banner"))
        browser.eval("(() => { document.getElementById('toast-region').innerHTML = ''; const b = document.getElementById('sync-banner'); b.classList.add('hidden'); b.innerHTML = ''; })()")
        # The highlight pop-up, with a numbered swatch on each color
        go(browser, "guide", wait=1.2)
        browser.eval("document.getElementById('guide-highlight-popover').classList.remove('hidden')")
        found["highlight pop-up"] = browser.eval(contrast_js("#guide-highlight-popover"))
        browser.eval("document.getElementById('guide-highlight-popover').classList.add('hidden')")
        bad = {k: v for k, v in found.items() if v}
        t.check(not bad, f"{len(found)} pop-ups, toasts, and bars meet 4.5:1", " | ".join(f"{k}: {v[:2]}" for k, v in bad.items()))

    t.check(not browser.errors(), "no JavaScript errors across the surfaces", "; ".join(browser.errors()[:3]))
