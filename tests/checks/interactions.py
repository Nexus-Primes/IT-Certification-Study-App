"""Things you click and type: color picker, highlights, command palette, settings."""
import time

from lib.framework import go, open_app, set_theme


def _key(browser, selector, key, shift=False):
    browser.eval(f"""document.querySelector({selector!r}).dispatchEvent(new KeyboardEvent('keydown', {{ key: {key!r}, bubbles: true, cancelable: true, shiftKey: {str(shift).lower()} }}))""")


def _set_hex(browser, value):
    browser.eval(f"""(() => {{ const h = document.querySelector('.cp-hex'); h.value = {value!r}; h.dispatchEvent(new Event('input', {{ bubbles: true }})); }})()""")


def _open_settings(browser, tab):
    go(browser, "settings", wait=0.7)
    browser.eval(f"document.querySelector('[data-action=\"settings-tab\"][data-section=\"{tab}\"]').click()")
    time.sleep(0.25)


def _open_picker(browser, kind, slot=None):
    selector = f'[data-action="open-color-picker"][data-picker="{kind}"]' + (f'[data-slot="{slot}"]' if slot else "")
    browser.eval(f"document.querySelector({selector!r}).scrollIntoView({{ block: 'center' }})")
    browser.eval(f"document.querySelector({selector!r}).click()")
    time.sleep(0.35)
    return browser.eval("!!document.querySelector('.cp-pop')")


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)
    set_theme(browser, "dark")

    # ---------------------------------------------------------------- color picker
    t.suite("color picker")
    _open_settings(browser, "appearance")
    start_primary = browser.eval("document.documentElement.style.getPropertyValue('--primary')")
    t.check(_open_picker(browser, "accent"), "the accent swatch opens the picker")
    t.check(browser.eval("document.activeElement.className") == "cp-sv", "focus moves into the color field")
    t.check(browser.eval("document.documentElement.style.getPropertyValue('--primary')") == start_primary, "merely opening the picker does not change the page")

    _set_hex(browser, "#ff6600")
    time.sleep(0.15)
    rgb = browser.eval("['.cp-r','.cp-g','.cp-b'].map(s => document.querySelector(s).value).join(',')")
    t.check(rgb == "255,102,0", "typing a hex color updates R, G, and B", rgb)
    _set_hex(browser, "#0f0")
    t.check(browser.eval("document.querySelector('.cp-g').value") == "255", "three-digit hex shorthand is understood")
    _set_hex(browser, "#zzz")
    t.check(browser.eval("document.querySelector('.cp-g').value") == "255", "an invalid hex leaves the color alone")
    browser.eval("(() => { const r = document.querySelector('.cp-r'); r.value = '999'; r.dispatchEvent(new Event('input', { bubbles: true })); })()")
    t.check(browser.eval("document.querySelector('.cp-r').value") == "999" and browser.eval("document.querySelector('.cp-g').value") == "255"
            and browser.eval("document.querySelector('.cp-pop').style.getPropertyValue('--cp-color')") == "#00ff00", "an out-of-range RGB value is ignored (the color stays put)")

    _key(browser, ".cp-sv", "ArrowRight", shift=True)
    t.check(browser.eval("document.documentElement.style.getPropertyValue('--primary')") != start_primary, "the app previews the color live while picking")
    _key(browser, ".cp-sv", "Escape")
    time.sleep(0.3)
    t.check(not browser.eval("!!document.querySelector('.cp-pop')"), "Escape closes the picker")
    t.check(browser.eval("document.documentElement.style.getPropertyValue('--primary')") == start_primary, "...and puts the original color back")
    t.check(browser.eval("document.activeElement.dataset.picker") == "accent", "...and returns focus to the swatch")
    t.check(sandbox.progress().get("comptia-a-plus", {}).get("settings", {}).get("accentColor") in (None, "teal"), "cancelling saved nothing")

    _open_picker(browser, "accent")
    _set_hex(browser, "#3366ff")
    browser.eval("document.querySelector('.cp-pop [data-cp=\"done\"]').click()")
    time.sleep(1.0)
    saved = sandbox.progress()
    t.check(saved["comptia-a-plus"]["settings"]["accentColor"] == "#3366ff", "Done saves the custom accent to the server")
    t.check(saved["app-meta"]["appearance"]["accentColor"] == "#3366ff", "...and to the account-level appearance")
    t.check(browser.eval("document.querySelector('[data-picker=\"accent\"]').classList.contains('active')"), "the custom swatch shows as chosen")

    _open_picker(browser, "accent")
    stops = browser.eval("document.querySelectorAll('.cp-pop .cp-sv, .cp-pop input, .cp-pop button').length")
    browser.eval("document.querySelector('.cp-pop [data-cp=\"done\"]').focus()")
    _key(browser, ".cp-pop [data-cp=\"done\"]", "Tab")
    t.check(stops >= 7 and browser.eval("document.activeElement.className") == "cp-sv", "Tab wraps around inside the picker instead of escaping it")
    browser.eval("document.querySelector('[data-picker=\"accent\"]').click()")
    time.sleep(0.3)
    t.check(not browser.eval("!!document.querySelector('.cp-pop')"), "clicking the swatch again closes the picker")

    # Avatar and app icon pickers
    _open_settings(browser, "account")
    t.check(_open_picker(browser, "avatar"), "the avatar color row has a custom picker")
    _set_hex(browser, "#fde047")
    t.check(browser.eval("document.getElementById('profile-avatar').style.color") == "rgb(11, 18, 32)", "a light avatar color gets dark initials")
    browser.eval("document.querySelector('.cp-pop [data-cp=\"done\"]').click()")
    time.sleep(0.9)
    t.check(sandbox.progress()["app-meta"]["avatar"]["color"] == "#fde047", "the avatar color is saved")
    _open_settings(browser, "about")
    t.check(_open_picker(browser, "icon"), "the app icon color row has a custom picker")
    _set_hex(browser, "#ef4488")
    t.check("%23ef4488" in browser.eval("document.querySelector('link[rel=\"icon\"]').href") or "#ef4488" in browser.eval("decodeURIComponent(document.querySelector('link[rel=\"icon\"]').href)"),
            "the browser tab icon previews live")
    browser.eval("document.querySelector('.cp-pop [data-cp=\"cancel\"]').click()")
    time.sleep(0.3)
    t.check(sandbox.progress()["app-meta"].get("appIconColor") in (None, "#2dd4bf"), "cancelling the icon color saves nothing")

    # ---------------------------------------------------------------- highlight colors
    t.suite("highlight colors")
    _open_settings(browser, "appearance")
    t.check(browser.eval("document.querySelectorAll('.hl-slot').length") == 4, "Settings shows four highlight slots")
    _open_picker(browser, "highlight", "blue")
    _set_hex(browser, "#e11d48")
    browser.eval("document.querySelector('.cp-pop [data-cp=\"done\"]').click()")
    time.sleep(0.9)
    t.check(sandbox.progress()["app-meta"]["highlightColors"] == {"blue": "#e11d48"}, "a recolored slot is saved on the account")
    swatches = browser.eval("[...document.querySelectorAll('#guide-highlight-popover .highlight-swatch')].map(s => s.getAttribute('aria-label') + '|' + s.dataset.letter)")
    t.check(swatches[2] == "Highlight in red|3", "the highlight pop-up announces the new color by name and number", str(swatches))
    t.check(bool(browser.eval("!!document.querySelector('[data-action=\"reset-highlight-colors\"]')")), "a Reset button appears once a slot is customized")

    # Washes stay readable for awkward colors, in both themes
    t.suite("highlight readability")
    worst = {"dark": 99.0, "light": 99.0}
    for theme in ("dark", "light"):
        set_theme(browser, theme)
        # Recolor the last slot to each awkward color through the real UI, then read what the browser computes.
        for color in ("#000000", "#000080", "#ffffff", "#ffff00", "#ff0000", "#00ffff", "#808080"):
            _open_settings(browser, "appearance")
            _open_picker(browser, "highlight", "violet")
            _set_hex(browser, color)
            browser.eval("document.querySelector('.cp-pop [data-cp=\"done\"]').click()")
            time.sleep(0.5)
            ratio = browser.eval("""(() => {
              const lum = ([r,g,b]) => { const f = c => { c/=255; return c<=.03928?c/12.92:((c+.055)/1.055)**2.4; }; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
              const cr = (a,b) => { const x = lum(a), y = lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
              const nums = s => (s.match(/[-\\d.]+/g)||[]).map(Number);
              const toRgb = s => { const n = nums(s); return s.startsWith('color(') ? n.slice(0,3).map(v => v*255) : n.slice(0,3); };
              const mark = document.querySelector('[data-slot="violet"] mark');
              const surface = toRgb(getComputedStyle(document.querySelector('.settings-card')).backgroundColor);
              const bg = getComputedStyle(mark).backgroundColor; const n = nums(bg); const a = n.length > 3 ? n[3] : 1; const c = toRgb(bg);
              const blended = surface.map((v, i) => v*(1-a) + c[i]*a);
              return cr(toRgb(getComputedStyle(mark).color), blended); })()""")
            worst[theme] = min(worst[theme], ratio)
    t.check(worst["dark"] >= 4.5, "highlighted text stays at 4.5:1 or better in the dark theme for black, navy, white, yellow, red, cyan, gray", f"worst {worst['dark']:.2f}")
    t.check(worst["light"] >= 4.5, "...and in the light theme", f"worst {worst['light']:.2f}")
    t.check(not browser.errors(), "no JavaScript errors during interactions", "; ".join(browser.errors()[:3]))
