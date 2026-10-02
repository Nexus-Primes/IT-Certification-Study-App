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

    # ---------------------------------------------------------------- pure color/theme modules
    t.suite("color and theme modules")
    units = browser.eval("""(async () => {
      const c = await import('/app/color.js?v=1'); const th = await import('/app/themes.js?v=1');
      const near = (a, b, e = 1) => a.every((v, i) => Math.abs(v - b[i]) <= e);
      return {
        normalize: [c.normalizeHex('abc'), c.normalizeHex('#AABBCC'), c.normalizeHex('zz'), c.normalizeHex('#12345')],
        rgb: c.hexToRgb('#ff6600'), hex: c.rgbToHex([255, 102, 0]),
        hsvRoundTrip: near(c.hsvToRgb(c.rgbToHsv([34, 211, 238])), [34, 211, 238]),
        hslRoundTrip: near(c.hslToRgb(c.rgbToHsl([200, 30, 90])), [200, 30, 90]),
        contrast: +c.contrastRatio([0, 0, 0], [255, 255, 255]).toFixed(1),
        names: ['#e11d48', '#2dd4bf', '#000000', '#ffffff', '#808080', '#fde047'].map(c.colorNameFor),
        readable: [c.readableTextOn('#fde047'), c.readableTextOn('#1e3a8a')],
        mix: [c.highlightMixFor('#ffff00', 'dark'), c.highlightMixFor('#ffff00', 'light'), c.highlightMixFor('#000080', 'light'), c.highlightMixFor('#ff0000', 'dark')],
        tealIsDefault: th.accentVarsFor('teal', 'dark') === null,
        presetAccent: th.accentVarsFor('blue', 'light').primary,
        customDark: th.accentVarsFor('#101040', 'dark').primary, customLight: th.accentVarsFor('#ffee00', 'light').primary,
        presets: th.THEME_PRESETS.map(p => p.id), fallback: th.presetById('nope').id
      };
    })()""")
    t.check(units["normalize"] == ["#aabbcc", "#aabbcc", None, None], "hex normalizing accepts 3 and 6 digits and rejects junk", str(units["normalize"]))
    t.check(units["rgb"] == [255, 102, 0] and units["hex"] == "#ff6600", "hex and RGB convert both ways")
    t.check(units["hsvRoundTrip"] and units["hslRoundTrip"], "HSV and HSL conversions round-trip")
    t.check(units["contrast"] == 21.0, "black on white measures 21:1")
    t.check(units["names"] == ["red", "teal", "black", "white", "gray", "yellow"], "colors get plain-language names", str(units["names"]))
    t.check(units["readable"] == ["#0b1220", "#ffffff"], "readable text flips between dark and white", str(units["readable"]))
    t.check(units["mix"] == [14, 40, 24, 40], "highlight wash strengths are unchanged", str(units["mix"]))
    t.check(units["tealIsDefault"] and units["presetAccent"] == "#026ba1", "the built-in teal is the default and presets keep their light values")
    t.check(units["customDark"] != "#101040" and units["customLight"] != "#ffee00", "a custom accent that is too dark (or too light) for the theme is nudged for contrast", f"{units['customDark']} / {units['customLight']}")
    t.check(units["presets"] == ["default", "slate", "ink", "sand"] and units["fallback"] == "default", "four surface styles; unknown ones fall back to Classic")

    # ---------------------------------------------------------------- themed controls
    t.suite("themed dropdowns, dates, fonts, and the crossword")
    go(browser, "practice", wait=0.8)
    t.check(browser.eval("document.querySelectorAll('.xselect').length") >= 2, "dropdowns are replaced by themed ones")
    browser.eval("document.querySelector('#practice-domain').parentElement.querySelector('.xselect-trigger').click()")
    time.sleep(0.3)
    options = browser.eval("document.querySelectorAll('.xselect-menu:not(.hidden) .xselect-option').length")
    t.check(options > 3, "opening a dropdown lists its options", str(options))
    browser.eval("document.querySelectorAll('.xselect-menu:not(.hidden) .xselect-option')[2].click()")
    time.sleep(0.3)
    t.check(browser.eval("document.getElementById('practice-domain').value") != "all", "choosing an option changes the real value underneath")
    browser.eval("document.querySelector('#practice-core').parentElement.querySelector('.xselect-trigger').click()")
    time.sleep(0.2)
    browser.eval("document.querySelector('#practice-domain').parentElement.querySelector('.xselect-trigger').click()")
    time.sleep(0.2)
    t.check(browser.eval("document.querySelectorAll('.xselect-menu:not(.hidden)').length") == 1, "only one dropdown is open at a time")
    browser.eval("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))")
    time.sleep(0.2)
    t.check(browser.eval("document.querySelectorAll('.xselect-menu:not(.hidden)').length") == 0, "Escape closes an open dropdown")

    _open_settings(browser, "study")
    browser.eval("document.querySelector('#settings-exam-date').parentElement.querySelector('.xdate-trigger').click()")
    time.sleep(0.3)
    days = browser.eval("document.querySelectorAll('.xdate-popover:not(.hidden) .xdate-day[data-date]').length")
    t.check(days >= 28, "the date picker shows a month of days", str(days))
    browser.eval("document.querySelector('.xdate-popover:not(.hidden) .xdate-day[data-date]:not(.muted)').click()")
    time.sleep(0.3)
    t.check(bool(browser.eval("document.getElementById('settings-exam-date').value")), "picking a day fills the real date field")

    _open_settings(browser, "appearance")
    browser.eval("document.getElementById('setting-font-name').dispatchEvent(new FocusEvent('focus'))")  # a headless page has no window focus, so send the event itself
    time.sleep(0.3)
    fonts = browser.eval("document.querySelectorAll('.xselect-menu:not(.hidden) .xselect-option').length")
    t.check(fonts > 5, "focusing the font box suggests fonts", str(fonts))

    go(browser, "crossword", wait=0.8)
    browser.eval("document.querySelector('[data-action=\"start-crossword\"]').click()")
    time.sleep(0.8)
    cells = browser.eval("document.querySelectorAll('[data-cw-cell], .cw-cell').length")
    t.check(cells >= 20, "a crossword puzzle is generated and drawn", f"{cells} cells")
    t.check(not browser.errors(), "no JavaScript errors from the controls or crossword", "; ".join(browser.errors()[:3]))

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
    # ---------------------------------------------------------------- highlight undo
    t.suite("highlight undo")
    set_theme(browser, "dark")
    go(browser, "guide", wait=1.4)
    made = browser.eval("""(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const p = [...document.querySelectorAll('[data-hl-domain]')].find(p => p.firstChild && p.firstChild.nodeType === 3 && p.firstChild.length > 90);
      p.scrollIntoView({ block: 'center' }); await sleep(250);
      const range = document.createRange(); range.setStart(p.firstChild, 10); range.setEnd(p.firstChild, 60);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })); await sleep(250);
      document.querySelector('#guide-highlight-popover [data-color="amber"]').click(); await sleep(700);
      return document.querySelectorAll('mark.guide-user-highlight').length; })()""")
    t.check(made == 1, "selecting text and choosing a color creates a highlight", str(made))
    time.sleep(0.8)
    stored = [h for hs in sandbox.progress()["comptia-a-plus"].get("guideHighlights", {}).values() for h in hs]
    t.check(len(stored) == 1, "...and it is saved", str(len(stored)))
    browser.eval("document.querySelector('mark.guide-user-highlight').click()")
    time.sleep(0.6)
    t.check(browser.eval("document.querySelectorAll('mark.guide-user-highlight').length") == 0, "clicking a highlight removes it")
    t.check(browser.eval("!!document.querySelector('.toast-action') && document.querySelector('.toast-action').textContent") == "Undo", "...and offers Undo")
    browser.eval("document.querySelector('.toast-action').click()")
    time.sleep(1.0)
    t.check(browser.eval("document.querySelectorAll('mark.guide-user-highlight').length") == 1, "Undo puts the highlight back on the page")
    restored = [h for hs in sandbox.progress()["comptia-a-plus"].get("guideHighlights", {}).values() for h in hs]
    t.check([h["id"] for h in restored] == [h["id"] for h in stored], "...exactly as it was, and saved again", str(restored))

    # ---------------------------------------------------------------- settings in the command palette
    t.suite("command palette finds settings")

    def palette(query):
        browser.eval("document.querySelector('[data-action=\"open-palette\"]').click()")
        time.sleep(0.4)
        browser.eval(f"(() => {{ const i = document.getElementById('palette-input'); i.value = {query!r}; i.dispatchEvent(new Event('input', {{ bubbles: true }})); }})()")
        time.sleep(0.3)
        return browser.eval("[...document.querySelectorAll('.palette-opt')].map(o => o.querySelector('strong').textContent + '|' + o.querySelector('.palette-opt-type').textContent)")

    results = palette("accent color")
    t.check(results and results[0] == "Accent color|Setting", "typing 'accent color' lists that setting first", str(results[:3]))
    browser.eval("document.querySelector('.palette-opt').click()")
    time.sleep(1.2)
    where = browser.eval("""({ hash: location.hash, tab: document.querySelector('[data-action="settings-tab"].active')?.dataset.section,
      flashed: document.querySelector('.setting-flash strong')?.textContent,
      onScreen: (() => { const r = document.querySelector('.setting-flash')?.getBoundingClientRect(); return !!r && r.top >= 0 && r.bottom <= innerHeight; })() })""")
    t.check(where["hash"] == "#settings" and where["tab"] == "appearance", "choosing it opens Settings on the right tab", str(where))
    t.check(where["flashed"] == "Accent color" and where["onScreen"], "...scrolls to the row and flashes it", str(where))

    results = palette("font")
    t.check(results and results[0].startswith("App font|Setting") and not any(r.startswith("Color theme") for r in results), "a search only lists settings that actually match it", str(results[:4]))
    browser.eval("document.querySelector('#dialog-layer [data-action=\"close-dialog\"]')?.click(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))")
    time.sleep(0.3)
    results = palette("exam date")
    t.check(any(r == "Exam date|Setting" for r in results), "'exam date' finds that setting too", str(results[:4]))
    browser.eval("document.querySelector('.palette-opt').click()")
    time.sleep(1.2)
    t.check(browser.eval("document.querySelector('[data-action=\"settings-tab\"].active')?.dataset.section") == "study", "...on the Study tab")
    results = palette("collapse")
    t.check(any(r.endswith("|Action") and "sidebar" in r.lower() for r in results), "the palette can collapse the sidebar", str(results[:3]))
    browser.eval("document.querySelector('.dialog-layer .dialog, #dialog-layer .dialog') && document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))")
    time.sleep(0.3)
    browser.eval("document.querySelector('#dialog-layer [data-action=\"close-dialog\"]')?.click()")

    # ---------------------------------------------------------------- exam date nudge
    t.suite("exam date nudge")
    go(browser, "dashboard", wait=0.8)
    t.check(browser.eval("!!document.querySelector('.hero .eyebrow-link')"), "the Dashboard offers 'Set exam date' while none is set")
    browser.eval("document.querySelector('.hero .eyebrow-link').click()")
    time.sleep(1.2)
    t.check(browser.eval("document.querySelector('.setting-flash strong')?.textContent") == "Exam date", "...and it jumps straight to the Exam date setting")
    future = time.strftime("%Y-%m-%d", time.localtime(time.time() + 86400 * 40))
    browser.eval(f"(() => {{ const i = document.getElementById('settings-exam-date'); i.value = {future!r}; i.dispatchEvent(new Event('change', {{ bubbles: true }})); document.querySelector('[data-action=\"set-exam-date\"]').click(); }})()")
    time.sleep(0.8)
    go(browser, "dashboard", wait=0.8)
    t.check(not browser.eval("!!document.querySelector('.hero .eyebrow-link')") and "exam in 40 days" in browser.eval("document.querySelector('.hero .eyebrow').textContent"),
            "once a date is set the link gives way to the countdown")

    # ---------------------------------------------------------------- restore a saved backup
    t.suite("restore a saved backup")
    import datetime
    when = (datetime.date.today() - datetime.timedelta(days=2)).isoformat()
    sandbox.post_json("/api/backup", {"format": "full", "app": "Cert Study", "version": "v9", "dateKey": when, "profile": "default", "progress": {"zz-test": {"v": 1}}})
    sandbox.post_json("/api/progress", {"profile": "default", "key": "zz-test", "value": {"v": 2}})
    _open_settings(browser, "data")
    browser.eval("document.querySelector('[data-action=\"open-restore-dialog\"]').click()")
    time.sleep(1.0)
    rows = browser.eval("document.querySelectorAll('#dialog-layer [data-action=\"restore-backup\"]').length")
    t.check(rows >= 1, "Settings → Data → Restore lists the saved backups", str(rows))
    t.check(browser.eval("document.querySelector('#dialog-layer .dialog').innerText.includes('thinned to one a week')"), "...and explains how old backups are thinned")
    browser.eval("document.querySelector('#dialog-layer [data-action=\"restore-backup\"]').click()")
    time.sleep(0.3)
    t.check(sandbox.progress()["zz-test"] == {"v": 2}, "one click only arms the button; nothing is restored yet")
    t.check("again" in browser.eval("document.querySelector('#dialog-layer [data-action=\"restore-backup\"]').textContent"), "...and it asks you to click again")
    browser.eval("document.querySelector('#dialog-layer [data-action=\"restore-backup\"]').click()")
    time.sleep(2.0)
    t.check(sandbox.progress()["zz-test"] == {"v": 1}, "the second click puts the backup's data back")
    names = [b["name"] for b in sandbox.get_json("/api/backups?profile=default")["backups"]]
    t.check(any("prerestore" in n for n in names), "a safety copy of the replaced data was saved first", str(names))
    safety = next(n for n in names if "prerestore" in n)
    t.check(sandbox.get_json(f"/api/backup-file?profile=default&name={safety}")["progress"]["zz-test"] == {"v": 2}, "...and it holds what was there before")
    t.check(browser.eval("document.querySelector('.toast-action')?.textContent") == "Undo", "an Undo is offered")
    browser.eval("document.querySelector('.toast-action').click()")
    time.sleep(1.5)
    t.check(sandbox.progress()["zz-test"] == {"v": 2}, "Undo brings back exactly what was replaced")

    t.check(not browser.errors(), "no JavaScript errors during interactions", "; ".join(browser.errors()[:3]))
