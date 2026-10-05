"""What the app chooses for you once you mark domains complete, plus mock exams, labs, and accounts."""
import datetime
import time

from lib.framework import dismiss_dialogs, finish_quiz, go, open_app, reload

CORE1 = ["c1d1", "c1d2", "c1d3", "c1d4", "c1d5"]


def _iso(days_from_now):
    moment = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=days_from_now)
    return moment.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def _core1_only(domains):
    """True when none of the questions' domain labels (e.g. '1.0 Mobile Devices') is a Core 1 domain."""
    core1_names = ("Mobile Devices", "Networking", "Hardware", "Virtualization & Cloud", "Hardware & Network Troubleshooting")
    return not any(label.split(" ", 1)[1] in core1_names for label in domains)


def _palette_action(browser, query, kind="Action"):
    browser.eval("document.querySelector('[data-action=\"open-palette\"]').click()")
    time.sleep(0.4)
    browser.eval(f"(() => {{ const i = document.getElementById('palette-input'); i.value = {query!r}; i.dispatchEvent(new Event('input', {{ bubbles: true }})); }})()")
    time.sleep(0.3)
    browser.eval(f"[...document.querySelectorAll('.palette-opt')].find(o => o.querySelector('.palette-opt-type').textContent === {kind!r}).click()")
    time.sleep(0.8)


def _save_state(sandbox, **changes):
    state = sandbox.progress()["comptia-a-plus"]
    state.update(changes)
    sandbox.post_json("/api/progress", {"profile": "default", "key": "comptia-a-plus", "value": state})


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)

    # ------------------------------------------------------------------ mark Core 1 complete, as a person would
    t.suite("study: finished domains stop being recommended")
    go(browser, "objectives", wait=1.0)
    for domain in CORE1:
        browser.eval(f"document.querySelector('[data-action=\"toggle-domain-completed\"][data-domain=\"{domain}\"]').click()")
        time.sleep(0.5)
    time.sleep(1.0)
    saved = sandbox.progress()["comptia-a-plus"]
    t.check(sorted(saved["completedDomains"]) == CORE1, "marking all five Core 1 domains complete on the Exam Map is saved", str(sorted(saved.get("completedDomains", {}))))

    go(browser, "dashboard", wait=0.8)
    hero = browser.eval("document.querySelector('[data-action=\"start-today\"]').textContent.trim()")
    t.check(not any(name in hero for name in ("Mobile Devices", "Networking", "Hardware", "Virtualization")), "the Dashboard's main button does not suggest a completed domain", hero)

    browser.eval("document.querySelector('[data-action=\"quick-practice\"]').click()")
    time.sleep(0.8)
    domains = finish_quiz(browser)
    t.check(len(domains) == 10 and all(d.startswith(("1.0 ", "2.0 ", "3.0 ", "4.0 ")) for d in domains.values()) and _core1_only(domains.values()),
            "Quick 10 draws only from Core 2 domains", str(sorted(set(domains.values()))))

    # Today's session when the study plan is sitting on a completed domain.
    today = datetime.date.today()
    sandbox.post_json("/api/progress", {"profile": "default", "key": "study-plan", "value": {
        "version": 1, "startDate": (today - datetime.timedelta(days=2)).isoformat(),
        "phases": [{"certId": "aplus", "targetDate": (today + datetime.timedelta(days=70)).isoformat()}]}})
    reload(browser)
    go(browser, "planner", wait=1.0)
    plan_first = browser.eval("(document.querySelector('.schedule-row, .plan-row')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 80)")
    go(browser, "dashboard", wait=0.8)
    hero = browser.eval("document.querySelector('[data-action=\"start-today\"]').textContent.trim()")
    t.check(not any(name in hero for name in ("Mobile Devices", "Networking", "Hardware", "Virtualization")),
            "Today's session skips a completed domain even when the study plan is currently on it", f"{hero!r} (plan shows {plan_first!r})")
    browser.eval("document.querySelector('[data-action=\"start-today\"]').click()")
    time.sleep(0.8)
    domains = finish_quiz(browser)
    t.check(domains and _core1_only(domains.values()), "...and the session it starts is all Core 2", str(sorted(set(domains.values()))))

    go(browser, "dashboard", wait=0.6)
    _palette_action(browser, "Weak-area trainer")
    domains = finish_quiz(browser)
    t.check(domains and _core1_only(domains.values()), "the Weak-area trainer skips completed domains", str(sorted(set(domains.values()))))
    go(browser, "dashboard", wait=0.6)
    _palette_action(browser, "Adaptive difficulty")
    domains = finish_quiz(browser)
    t.check(domains and _core1_only(domains.values()), "Adaptive difficulty skips completed domains", str(sorted(set(domains.values()))))

    # Due flashcards: some from a completed domain, some not.
    ids = browser.eval("window.APLUS_DATA.concepts.filter(c => c.domain === 'c1d1').slice(0, 6).map(c => c.id).concat(window.APLUS_DATA.concepts.filter(c => c.domain === 'c2d1').slice(0, 6).map(c => c.id))")
    due = {i: {"interval": 1, "ease": 2.5, "due": _iso(-1), "reviews": 1, "lastRating": "good"} for i in ids}
    _save_state(sandbox, flashcards=due)
    reload(browser)
    go(browser, "dashboard", wait=0.8)
    hero = browser.eval("document.querySelector('[data-action=\"start-today\"]').textContent.trim()")
    t.check(hero == "Review 6 due cards", "only the due cards from open domains are counted (6 of the 12 seeded)", hero)
    browser.eval("document.querySelector('[data-action=\"start-today\"]').click()")
    time.sleep(0.8)
    shown = []
    for _ in range(8):
        label = browser.eval("(document.querySelector('.flash-card')?.innerText || '').split('\\n')[0].trim()")
        if not browser.eval("!!document.querySelector('.flash-card')"):
            break
        shown.append(label)
        browser.eval("document.querySelector('.flash-card').click()")
        time.sleep(0.2)
        browser.eval("document.querySelector('[data-rate=\"good\"]').click()")
        time.sleep(0.3)
    t.check(len(shown) == 6 and all(s.split(" · ")[0].title() in ("Operating Systems", "Security", "Software Troubleshooting", "Operational Procedures") for s in shown),
            "the flashcard review it opens holds only Core 2 cards", str(shown))

    # Choosing a completed domain on purpose still works.
    go(browser, "practice", wait=0.8)
    browser.eval("(() => { const s = document.getElementById('practice-domain'); s.value = 'c1d1'; s.dispatchEvent(new Event('change', { bubbles: true })); })()")
    browser.eval("document.getElementById('practice-builder').requestSubmit()")
    time.sleep(0.8)
    domains = finish_quiz(browser)
    t.check(domains and set(domains.values()) == {"1.0 Mobile Devices"}, "picking a completed domain yourself still gives you that domain", str(sorted(set(domains.values()))))

    # A mock exam is a rehearsal of the whole exam, so it still covers every domain of its core.
    go(browser, "exams", wait=0.8)
    browser.eval("document.querySelector('[data-action=\"start-exam\"][data-core=\"core1\"][data-mode=\"sprint\"]').click()")
    time.sleep(1.0)
    exam = finish_quiz(browser, exam=True)
    t.check(len(exam) >= 20 and len(set(exam.values())) == 5, "a Core 1 mock exam still includes the completed Core 1 domains (all five)", f"{len(exam)} questions, {sorted(set(exam.values()))}")
    time.sleep(1.0)
    last = sandbox.progress()["comptia-a-plus"]["sessions"][0]
    t.check(last.get("type") == "exams" and last["total"] == len(exam), "the finished exam is saved with its score", f"{last.get('type')} {last.get('total')} vs {len(exam)}")
    t.check(not browser.errors(), "no JavaScript errors in these sessions", "; ".join(browser.errors()[:3]))

    # ------------------------------------------------------------------ labs
    t.suite("study: labs")
    go(browser, "labs", wait=0.8)
    labs = browser.eval("""(() => { const all = window.APLUS_LABS || []; const pick = type => all.find(l => l.type === type);
      return { sequence: pick('sequence')?.id, decision: pick('decision')?.id, terminal: pick('terminal')?.id }; })()""")
    t.check(all(labs.values()), "the A+ track has sequence, decision, and terminal labs to try", str(labs))
    # Sequence lab: add the steps in the right order, then check.
    browser.eval(f"document.querySelector('[data-action=\"start-lab\"][data-lab=\"{labs['sequence']}\"]').click()")
    time.sleep(0.6)
    steps = browser.eval(f"window.APLUS_LABS.find(l => l.id === {labs['sequence']!r}).steps")
    for step in steps:
        browser.eval(f"""(() => {{ const b = [...document.querySelectorAll('[data-action="move-step"][data-from="available"]')].find(x => x.textContent.includes({step[:30]!r})); b.click(); }})()""")
        time.sleep(0.15)
    browser.eval("document.querySelector('[data-action=\"check-sequence\"]').click()")
    time.sleep(0.8)
    t.check(bool(browser.eval("!!document.querySelector('.lab-complete, .results-hero, .completed-lab') || /complete/i.test(document.getElementById('main-content').innerText)")), "putting a sequence lab's steps in order completes it")
    # Decision lab: answer every stage correctly.
    browser.eval("document.querySelector('[data-action=\"exit-lab\"]')?.click()")
    time.sleep(0.5)
    browser.eval(f"document.querySelector('[data-action=\"start-lab\"][data-lab=\"{labs['decision']}\"]').click()")
    time.sleep(0.6)
    stages = browser.eval(f"window.APLUS_LABS.find(l => l.id === {labs['decision']!r}).stages.map(s => s.correct)")
    wrong_first = browser.eval(f"""(() => {{ const s = window.APLUS_LABS.find(l => l.id === {labs['decision']!r}).stages[0]; return s.options.findIndex((_, i) => i !== s.correct); }})()""")
    browser.eval(f"document.querySelector('[data-action=\"decision-answer\"][data-index=\"{wrong_first}\"]').click()")
    time.sleep(0.4)
    t.check(bool(browser.eval("/try again/i.test(document.getElementById('main-content').innerText)")), "a wrong decision is turned down with a hint to try again")
    for correct in stages:
        browser.eval(f"document.querySelector('[data-action=\"decision-answer\"][data-index=\"{correct}\"]').click()")
        time.sleep(0.5)
    t.check(bool(browser.eval("/complete/i.test(document.getElementById('main-content').innerText)")), "answering every stage of a decision lab correctly completes it")
    # Terminal lab: type each accepted command.
    browser.eval("document.querySelector('[data-action=\"exit-lab\"]')?.click()")
    time.sleep(0.5)
    browser.eval(f"document.querySelector('[data-action=\"start-lab\"][data-lab=\"{labs['terminal']}\"]').click()")
    time.sleep(0.6)
    commands = browser.eval(f"window.APLUS_LABS.find(l => l.id === {labs['terminal']!r}).terminal.map(s => s.accepts[0])")
    for command in commands:
        browser.eval(f"""(() => {{ const i = document.getElementById('terminal-command'); i.value = {command!r}; document.getElementById('terminal-form').requestSubmit(); }})()""")
        time.sleep(0.5)
    t.check(bool(browser.eval("/complete/i.test(document.getElementById('main-content').innerText)")), "typing the right command at each step completes a terminal lab")
    time.sleep(1.0)
    done = sandbox.progress()["comptia-a-plus"]["completedLabs"]
    t.check(all(labs[k] in done for k in ("sequence", "decision", "terminal")), "all three completed labs are saved", str(sorted(done)))
    t.check(not browser.errors(), "no JavaScript errors in the labs", "; ".join(browser.errors()[:3]))

    # ------------------------------------------------------------------ accounts and the PIN
    t.suite("study: accounts and the PIN")
    browser.eval("document.querySelector('[data-action=\"open-account-dialog\"]').click()")
    time.sleep(0.5)
    browser.eval("(() => { document.getElementById('new-account-name').value = 'Test Two'; document.getElementById('new-account-form').requestSubmit(); })()")
    time.sleep(1.5)
    profiles = sandbox.get_json("/api/profiles")["profiles"]
    second = next((p for p in profiles if p["name"] == "Test Two"), None)
    t.check(second is not None and browser.eval("document.getElementById('profile-name').textContent") == "Test Two", "adding a person creates the account and switches into it")
    t.check(sandbox.progress(second["id"]).get("comptia-a-plus", {}).get("sessions", []) == [] , "the new account starts with no progress of its own")
    t.check(len(sandbox.progress()["comptia-a-plus"]["sessions"]) >= 4, "...while the original account's history is untouched")

    # Set a PIN, then see switching require it.
    browser.eval("document.querySelector('[data-action=\"open-account-dialog\"]').click()")
    time.sleep(0.4)
    browser.eval("document.querySelector('[data-action=\"manage-pin\"]').click()")
    time.sleep(0.4)
    browser.eval("(() => { document.getElementById('pin-new').value = '4821'; document.getElementById('pin-confirm').value = '4821'; document.getElementById('pin-form').requestSubmit(); })()")
    time.sleep(0.8)
    t.check(sandbox.get_json("/api/profiles")["hasPin"] is True, "a PIN can be set")
    browser.eval(f"document.querySelector('[data-action=\"switch-profile\"][data-profile-id=\"default\"]').click()")
    time.sleep(0.5)
    t.check(browser.eval("!!document.getElementById('pin-switch-input')"), "switching accounts now asks for the PIN")
    browser.eval("(() => { document.getElementById('pin-switch-input').value = '0000'; document.getElementById('pin-switch-form').requestSubmit(); })()")
    time.sleep(0.6)
    t.check(browser.eval("document.getElementById('profile-name').textContent") == "Test Two" and browser.eval("!!document.querySelector('.toast.error')"), "a wrong PIN is refused and you stay where you were")
    browser.eval("(() => { document.getElementById('pin-switch-input').value = '4821'; document.getElementById('pin-switch-form').requestSubmit(); })()")
    time.sleep(1.5)
    t.check(browser.eval("document.getElementById('profile-name').textContent") != "Test Two", "the right PIN switches accounts")

    # Remove the PIN (needs the current one), then delete the second account.
    browser.eval("document.querySelector('[data-action=\"open-account-dialog\"]').click()")
    time.sleep(0.4)
    browser.eval("document.querySelector('[data-action=\"open-remove-pin\"]').click()")
    time.sleep(0.4)
    browser.eval("(() => { document.getElementById('pin-current').value = '9999'; document.getElementById('pin-form').requestSubmit(); })()")
    time.sleep(0.6)
    t.check(sandbox.get_json("/api/profiles")["hasPin"] is True, "removing the PIN with the wrong current PIN does nothing")
    browser.eval("(() => { document.getElementById('pin-current').value = '4821'; document.getElementById('pin-form').requestSubmit(); })()")
    time.sleep(0.8)
    t.check(sandbox.get_json("/api/profiles")["hasPin"] is False, "the right current PIN removes it")
    browser.eval(f"document.querySelector('[data-action=\"delete-profile\"][data-profile-id=\"{second['id']}\"]').click()")
    time.sleep(0.4)
    browser.eval(f"document.querySelector('[data-action=\"confirm-delete-profile\"]').click()")
    time.sleep(0.8)
    t.check(all(p["name"] != "Test Two" for p in sandbox.get_json("/api/profiles")["profiles"]), "removing an account takes it out of the switcher")
    import os
    t.check(os.path.exists(os.path.join(sandbox.dir, "data", f"progress-{second['id']}.json")), "...but never deletes its saved progress file")
    t.check(not browser.errors(), "no JavaScript errors with accounts", "; ".join(browser.errors()[:3]))
