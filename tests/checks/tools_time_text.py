"""Tools: timers and the text tools."""
import json
import time

from checks.tools_calc_net import fill, text_of
from checks.tools_checks import audit_view, click, saved_tools, wait_saved
from lib.framework import go, reload


def run_timers(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: timer maths")
    r = browser.eval("""import('/app/tools-timers.js').then(m => {
      const c = { durationMs: 60000, state: 'idle', remainingMs: 60000, endsAt: 0 };
      m.startCountdown(c, 1000); const left = m.countdownRemaining(c, 31000);
      m.pauseCountdown(c, 31000); const paused = [c.state, c.remainingMs];
      m.startCountdown(c, 100000); const endsAt = c.endsAt;
      const early = m.tickCountdowns([c], 129999).length, on = m.tickCountdowns([c], 130000).length, again = m.tickCountdowns([c], 140000).length, finalState = c.state;
      m.resetCountdown(c);
      const sw = { running: false, startedAt: 0, elapsed: 0, laps: [] };
      m.startStopwatch(sw, 1000); const e1 = m.stopwatchElapsed(sw, 3500); m.lapStopwatch(sw, 3500); m.stopStopwatch(sw, 4000);
      const e2 = m.stopwatchElapsed(sw, 99999); m.startStopwatch(sw, 10000); const e3 = m.stopwatchElapsed(sw, 10500); const laps = [...sw.laps]; m.resetStopwatch(sw);
      return { dur: ['25', '90s', '1h30m', '1:30:00', '10:00', '1.5', 'abc', '', '5 minutes 30 seconds', '5x', '2h 15m'].map(x => m.parseDuration(x)),
        left, paused, endsAt, ticks: [early, on, again], finalState, reset: [c.state, c.remainingMs], sw: [e1, e2, e3, laps, sw.elapsed, sw.laps.length],
        spans: [m.describeSpan(3 * 86400000 + 5 * 3600000), m.describeSpan(86400000 + 7200000), m.describeSpan(2 * 3600000 + 5 * 60000), m.describeSpan(303000), m.describeSpan(45000)],
        future: m.eventRemaining({ at: '2099-01-01T00:00' }) > 0, bad: Number.isNaN(m.eventRemaining({ at: '' })) }; })""")
    t.check(r["dur"] == [1500000, 90000, 5400000, 5400000, 600000, 90000, None, None, 330000, None, 8100000], "durations read as minutes, h/m/s words, or h:mm:ss", str(r["dur"]))
    t.check(r["left"] == 30000 and r["paused"] == ["paused", 30000] and r["endsAt"] == 130000, "a countdown counts down, pauses with its time left, and resumes")
    t.check(r["ticks"] == [0, 1, 0] and r["finalState"] == "done" and r["reset"] == ["idle", 60000], "a countdown finishes exactly once, and Reset puts it back")
    t.check(r["sw"] == [2500, 3000, 3500, [2500], 0, 0], "the stopwatch adds up across stops, records laps, and resets")
    t.check(r["spans"] == ["3 days 5 h", "1 day 2 h", "2 h 5 min", "5 min 3 s", "45 s"], "spans read naturally", str(r["spans"]))
    t.check(r["future"] and r["bad"], "a date countdown measures to a local date and tolerates a missing one")

    t.suite("tools: timers page")
    go(browser, "timers", wait=0.8)
    click(browser, '[data-tm="sw-toggle"]')
    time.sleep(0.8)
    t.check(text_of(browser, "sw-display") != "00:00:00.00", "the stopwatch runs")
    click(browser, '[data-tm="sw-lap"]')
    time.sleep(0.3)
    click(browser, '[data-tm="sw-toggle"]')
    time.sleep(0.4)
    frozen = text_of(browser, "sw-display")
    time.sleep(0.5)
    t.check(text_of(browser, "sw-display") == frozen and browser.eval("document.querySelectorAll('.tm-laps li').length") == 1, "stopping freezes it, and a lap is listed")
    t.check(wait_saved(sandbox, lambda s: s.get("timers", {}).get("stopwatch", {}).get("elapsed", 0) > 500), "the stopwatch is saved")
    click(browser, '[data-tm="sw-reset"]')
    time.sleep(0.3)
    t.check(text_of(browser, "sw-display") == "00:00:00.00", "Reset zeroes it")

    fill(browser, "#tm-name", "Test timer")
    fill(browser, "#tm-length", "4s")
    click(browser, '[data-tm="cd-add"]')
    time.sleep(0.5)
    t.check(browser.eval("document.querySelectorAll('.tm-card').length") == 1 and browser.eval("document.getElementById('timers-badge').textContent") == "1", "a countdown starts and shows on the sidebar badge")
    go(browser, "dashboard", wait=0.5)
    time.sleep(5.0)
    t.check("Test timer finished" in browser.eval("document.getElementById('toast-region').innerText"), "a timer announces itself even when you are on another page")
    t.check(browser.eval("document.getElementById('timers-badge').classList.contains('hidden')"), "...and the badge clears")
    go(browser, "timers", wait=0.6)
    t.check(browser.eval("document.querySelector('.tm-card').classList.contains('is-done')") and wait_saved(sandbox, lambda s: s["timers"]["countdowns"][0]["state"] == "done"), "a finished timer is marked done and saved")

    click(browser, '[data-tm="cd-restart"]')
    time.sleep(0.4)
    click(browser, '[data-tm="cd-pause"]')
    time.sleep(0.4)
    t.check(wait_saved(sandbox, lambda s: s["timers"]["countdowns"][0]["state"] == "paused"), "a timer can be run again and paused")
    reload(browser, wait=2.5)
    go(browser, "timers", wait=0.6)
    t.check(browser.eval("document.querySelector('[data-tm=cd-resume]') !== null"), "a paused timer is still paused after a reload")
    click(browser, '[data-tm="cd-resume"]')
    time.sleep(0.4)
    reload(browser, wait=2.5)
    go(browser, "timers", wait=0.6)
    shown = text_of(browser, "tm-root")
    t.check(browser.eval("document.querySelector('.tm-card').classList.contains('is-running') || document.querySelector('.tm-card').classList.contains('is-done')"), "a running timer keeps running across a reload", shown[:60])
    click(browser, '[data-tm="cd-delete"]')
    t.check(wait_saved(sandbox, lambda s: not s["timers"]["countdowns"]), "a timer can be deleted")

    fill(browser, "#ev-name", "3CX go-live")
    browser.eval("(() => { const d = new Date(Date.now() + 3 * 86400000 + 3600000 * 5); const p = n => String(n).padStart(2, '0'); const v = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; const i = document.getElementById('ev-at'); i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); })()")
    click(browser, '[data-tm="ev-add"]')
    time.sleep(0.5)
    shown = browser.eval("document.querySelector('[data-ev-remaining]').textContent")
    t.check(shown.startswith("3 days") or shown.startswith("2 days 2"), "a date countdown shows days and hours left", shown)
    click(browser, '[data-tm="ev-delete"]')
    browser.eval("document.querySelector('[data-tm=sound]').click()")
    t.check(wait_saved(sandbox, lambda s: s["timers"].get("sound") is False and not s["timers"]["events"]), "a date countdown can be removed and the sound switched off")
    audit_view(t, browser, "timers")
    t.check(not browser.errors(), "no JavaScript errors in the timers", "; ".join(browser.errors()[:3]))


def run_text(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: text tool functions")
    r = browser.eval("""import('/app/tools-text.js').then(async m => {
      const big = new Uint8Array(100003); for (let i = 0; i < big.length; i += 65536) crypto.getRandomValues(big.subarray(i, Math.min(big.length, i + 65536)));
      const sha = new m.Sha256(); let at = 0; for (const n of [0, 1, 63, 64, 65, 1000, 4096, 3]) { sha.update(big.subarray(at, at + n)); at += n; } sha.update(big.subarray(at));
      const native = [...new Uint8Array(await crypto.subtle.digest('SHA-256', big))].map(b => b.toString(16).padStart(2, '0')).join('');
      const million = new m.Sha256(); const chunk = new Uint8Array(1000).fill(97); for (let i = 0; i < 1000; i++) million.update(chunk);
      const piece = new m.Sha256(); piece.update(new TextEncoder().encode('a')); piece.update(new TextEncoder().encode('bc'));
      const file = new File([big], 'x.bin'); const viaFile = await m.hashFile(file, 'SHA-256'); const viaFile1 = await m.hashFile(file, 'SHA-1');
      const native1 = [...new Uint8Array(await crypto.subtle.digest('SHA-1', big))].map(b => b.toString(16).padStart(2, '0')).join('');
      const rx = await m.runRegex('(\\\\d+)\\\\.(\\\\d+)', 'g', '10.4 and 11.0', '$2.$1'), bad = await m.runRegex('(', 'g', 'x', ''), named = await m.runRegex('(?<y>\\\\d{4})', 'g', 'in 2026', ''), ci = await m.runRegex('abc', 'gi', 'ABC abc', '');
      const started = performance.now(); const slow = await m.runRegex('(a+)+$', 'g', 'a'.repeat(40) + 'b', ''); const slowMs = performance.now() - started;
      const pw = Array.from({ length: 200 }, () => m.generatePassword({ length: 24 }));
      const draws = new Set(Array.from({ length: 600 }, () => m.randomInt(6)));
      return { b64: [m.base64Encode('abc'), m.base64Encode('>>>???'), m.base64Encode('>>>???', true), m.base64Decode('Pj4-Pz8_').text, m.base64Decode(m.base64Encode('Hello, 3CX! café')).text, m.base64Decode('not base64!').ok, m.base64Decode('gA==').ok],
        hex: [m.hexEncode('Hi'), m.hexDecode('48:69').text, m.hexDecode('xyz').ok], url: [m.urlDecode('a%20b%2Fc').text, m.urlDecode('%E0%A4%A').ok],
        sha: [await m.hashText('abc', 'SHA-256'), await m.hashText('abc', 'SHA-1'), await m.hashText('', 'SHA-256'), piece.digest(), million.digest()], stream: sha.digest() === native, file: [viaFile === native, viaFile1 === native1],
        json: [m.formatJson('{"b":1,"a":[1,2]}').text, m.formatJson('{"b":1,"a":2}', { sortKeys: true, indent: 4 }).text, m.minifyJson('{ "a": 1,\\n "b": [1, 2] }').text, m.formatJson('{"a":1,}'), m.formatJson('  ').ok],
        rx: { n: rx.matches.length, g: rx.matches[0].groups, replaced: rx.replaced, bad: bad.ok, named: named.matches[0].named, ci: ci.matches.length, slow: [slow.ok, slow.error || '', slowMs < 3500] },
        pw: { len: pw[0].length, unique: new Set(pw).size, classes: pw.every(p => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\\d/.test(p) && /[^A-Za-z0-9]/.test(p)),
          digitsOnly: /^\\d{12}$/.test(m.generatePassword({ length: 12, lower: false, upper: false, symbols: false })), none: m.generatePassword({ lower: false, upper: false, digits: false, symbols: false }),
          clean: Array.from({ length: 300 }, () => m.generatePassword({ length: 32 })).every(p => !/[0Oo1lI|]/.test(p)), clamp: [m.generatePassword({ length: 4 }).length, m.generatePassword({ length: 500 }).length],
          draws: [...draws].sort().join(''), bits: Math.round(m.entropyBits(20, 70)) } }; })""")
    t.check(r["b64"] == ["YWJj", "Pj4+Pz8/", "Pj4-Pz8_", ">>>???", "Hello, 3CX! café", False, False], "Base64 encodes, decodes, handles the URL-safe form, and refuses bad or binary input", str(r["b64"]))
    t.check(r["hex"] == ["4869", "Hi", False] and r["url"] == ["a b/c", False], "hex and URL decoding work and reject malformed input")
    sha = r["sha"]
    t.check(sha[0] == "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" and sha[1] == "a9993e364706816aba3e25717850c26c9cd0d89d" and sha[2] == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "SHA-256 and SHA-1 match the published test vectors")
    t.check(sha[3] == sha[0] and sha[4] == "cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0", "the streaming SHA-256 matches the vectors, in pieces and on a million letters")
    t.check(r["stream"] and r["file"] == [True, True], "the streaming hash agrees with the browser's own on 100 KB of random data in awkward chunk sizes, and file hashing works")
    j = r["json"]
    t.check(j[0] == '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}' and j[1] == '{\n    "a": 2,\n    "b": 1\n}' and j[2] == '{"a":1,"b":[1,2]}', "JSON formats, sorts keys, and minifies")
    t.check(j[3]["ok"] is False and j[3]["error"].get("line") == 1 and j[3]["error"].get("column") and j[4] is False, "bad JSON is rejected with a line and column, and empty input with a hint", str(j[3]))
    x = r["rx"]
    t.check(x["n"] == 2 and x["g"] == ["10", "4"] and x["replaced"] == "4.10 and 0.11" and x["named"] == {"y": "2026"} and x["ci"] == 2 and x["bad"] is False, "the regex tester finds matches and groups, replaces, handles named groups and flags, and reports a bad pattern")
    t.check(x["slow"][0] is False and "longer than" in x["slow"][1] and x["slow"][2], "a catastrophic pattern is stopped after a moment instead of freezing the page", str(x["slow"]))
    p = r["pw"]
    t.check(p["len"] == 24 and p["unique"] == 200 and p["classes"] and p["digitsOnly"] and p["none"] is None and p["clean"] and p["clamp"] == [8, 128], "passwords have the right length and kinds, are all different, avoid look-alikes, clamp their length, and refuse an empty choice")
    t.check(p["draws"] == "012345" and p["bits"] == 123, "the random number helper reaches every value, and entropy is length times log2 of the pool")

    t.suite("tools: text tools page")
    go(browser, "texttools", wait=0.8)
    time.sleep(0.6)
    t.check(text_of(browser, "rx-status").startswith("2 matches") and browser.eval("document.querySelectorAll('#rx-preview mark').length") == 2, "the regex tab opens with a working example and highlights its matches")
    fill(browser, "#rx-replace", "$2.$1")
    time.sleep(0.7)
    t.check("4.10" in browser.eval("document.getElementById('rx-result') ? document.getElementById('rx-result').value : ''"), "a replacement is previewed")
    fill(browser, "#rx-pattern", "(")
    time.sleep(0.7)
    t.check(browser.eval("document.getElementById('rx-status').classList.contains('is-error')"), "a bad pattern shows an error, not a crash")
    fill(browser, "#rx-pattern", "(a+)+$")
    fill(browser, "#rx-text", "a" * 40 + "b")
    time.sleep(2.2)
    t.check("stopped" in text_of(browser, "rx-status"), "a runaway pattern is stopped on the page too")

    go(browser, "texttools?tab=encode", wait=0.6)
    click(browser, '[data-op="b64e"]')
    expected = browser.eval("btoa(unescape(encodeURIComponent(document.getElementById('enc-in').value)))")
    t.check(browser.eval("document.getElementById('enc-out').value") == expected, "Base64 encode fills the result")
    click(browser, '[data-tx="enc-swap"]')
    click(browser, '[data-op="b64d"]')
    t.check(browser.eval("document.getElementById('enc-out').value") == "Hello, 3CX! café", "...and decoding the result gives the original back")

    go(browser, "texttools?tab=hash", wait=0.6)
    time.sleep(0.5)
    abc = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    t.check(abc in text_of(browser, "h-results"), "the hash tab shows the SHA-256 of the example text")
    fill(browser, "#h-expected", abc.upper())
    t.check("Matches the SHA-256" in text_of(browser, "h-compare"), "an expected hash is compared, ignoring case")
    fill(browser, "#h-expected", "0" * 64)
    t.check("Does not match" in text_of(browser, "h-compare"), "...and a wrong one is reported")
    browser.eval("""(() => { const input = document.getElementById('h-file'); const dt = new DataTransfer(); dt.items.add(new File(['abc'], 'abc.txt'));
      input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()""")
    fill(browser, "#h-expected", abc)
    time.sleep(1.2)
    t.check("Matches the SHA-256" in text_of(browser, "h-compare"), "a chosen file is hashed and checked against the expected value")

    go(browser, "texttools?tab=json", wait=0.6)
    click(browser, '[data-tx="js-format"]')
    t.check("\n" in browser.eval("document.getElementById('js-out').value") and "Valid JSON" in text_of(browser, "js-status"), "the JSON tab formats its example")
    fill(browser, "#js-in", '{"a": 1,}')
    click(browser, '[data-tx="js-format"]')
    t.check("line 1" in text_of(browser, "js-status"), "invalid JSON says where it went wrong")

    go(browser, "texttools?tab=password", wait=0.6)
    values = json.loads(browser.eval("document.getElementById('pw-list').dataset.values"))
    t.check(len(values) == 5 and all(len(v) == 20 for v in values) and "bits" in text_of(browser, "pw-entropy"), "the password tab makes five passwords with an entropy note")
    browser.eval("document.getElementById('pw-lower').click(); document.getElementById('pw-upper').click(); document.getElementById('pw-digits').click(); document.getElementById('pw-symbols').click()")
    time.sleep(0.3)
    t.check("at least one" in text_of(browser, "pw-entropy"), "turning every kind off asks for at least one")
    browser.eval("document.getElementById('pw-lower').click()")
    time.sleep(0.4)
    values = json.loads(browser.eval("document.getElementById('pw-list').dataset.values"))
    time.sleep(1.2)
    everything = json.dumps(sandbox.progress()) + browser.eval("JSON.stringify(Object.assign({}, localStorage)) + JSON.stringify(Object.assign({}, sessionStorage))")
    t.check(not any(v in everything for v in values), "generated passwords are never written to the progress file or browser storage")
    for tab in ("regex", "encode", "hash", "json", "password"):
        go(browser, f"texttools?tab={tab}", wait=0.7)
        audit_view(t, browser, f"text tools ({tab})")
    t.check(not browser.errors(), "no JavaScript errors in the text tools", "; ".join(browser.errors()[:3]))
