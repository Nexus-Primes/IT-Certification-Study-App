"""Tools: the Today strip on the Dashboard."""
import time

from checks.tools_calc_net import fill
from checks.tools_checks import audit_view, click, wait_saved
from lib.framework import go, open_app


def run_today(ctx, browser):
    t = ctx.t
    t.suite("tools: Dashboard Today strip")
    sandbox = ctx.fresh_sandbox()
    open_app(browser, sandbox)
    go(browser, "dashboard", wait=0.8)
    t.check(browser.eval("!document.querySelector('.today-strip')"), "with nothing open the Dashboard shows no Today strip")

    go(browser, "runbooks", wait=0.7)
    click(browser, '[data-rb="start"][data-id="rb-3cx-newuser"]')
    time.sleep(0.7)
    browser.eval("document.querySelectorAll('input[data-rb=toggle]')[0].click(); document.querySelectorAll('input[data-rb=toggle]')[1].click()")
    time.sleep(0.3)

    go(browser, "timers", wait=0.7)
    fill(browser, "#tm-name", "Change window")
    fill(browser, "#tm-length", "30m")
    click(browser, '[data-tm="cd-add"]')
    time.sleep(0.4)
    fill(browser, "#ev-name", "3CX go-live")
    browser.eval("(() => { const d = new Date(Date.now() + 5 * 86400000 + 3600000); const p = n => String(n).padStart(2, '0'); const i = document.getElementById('ev-at'); i.value = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; i.dispatchEvent(new Event('input', { bubbles: true })); })()")
    click(browser, '[data-tm="ev-add"]')
    time.sleep(0.4)

    go(browser, "netsheet", wait=0.7)
    click(browser, '[data-net="add"]')
    time.sleep(0.3)
    fill(browser, 'input[data-k="cidr"]', "10.0.0.0/40")
    wait_saved(sandbox, lambda s: bool(s.get("network", {}).get("subnets")))

    go(browser, "dashboard", wait=0.9)
    chips = browser.eval("[...document.querySelectorAll('.today-chip')].map(c => c.innerText.replace(/\\s+/g, ' ').trim())")
    t.check(len(chips) == 4, "the strip shows a run, a timer, a date, and a network warning", str(chips))
    joined = " | ".join(chips)
    t.check("2 of" in joined and "steps" in joined, "an open run shows how far along it is")
    t.check("1 timer running" in joined and "next ends in" in joined, "running timers are summarized with the next finish")
    t.check("3CX go-live" in joined and "in 5 days" in joined, "the nearest date shows how long is left")
    t.check("Network sheet" in joined and "1 thing to check" in joined, "a network sheet warning is flagged")
    audit_view(t, browser, "the Dashboard with the Today strip")

    click(browser, '.today-chip')
    time.sleep(0.6)
    t.check(browser.eval("location.hash").startswith("#runbooks?run="), "a chip opens the thing it describes")
    go(browser, "dashboard", wait=0.7)
    browser.eval("document.querySelectorAll('.today-chip')[3].click()")
    time.sleep(0.6)
    t.check(browser.eval("location.hash") == "#netsheet?tab=subnets", "the network chip opens the table with the problem")

    browser.eval("(() => { const b = document.createElement('button'); b.dataset.action = 'switch-cert'; b.dataset.certId = 'blender-fundamentals'; document.body.appendChild(b); b.click(); b.remove(); })()")
    time.sleep(1.8)
    go(browser, "dashboard", wait=0.9)
    t.check(browser.eval("!!document.querySelector('.today-strip')"), "the strip shows on the Programs dashboard too")
    t.check(not browser.errors(), "no JavaScript errors from the Today strip", "; ".join(browser.errors()[:3]))
