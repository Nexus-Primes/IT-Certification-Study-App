"""Tools: the document shelf."""
import time

from checks.tools_calc_net import fill, text_of
from checks.tools_checks import audit_view, click, wait_saved
from lib.framework import go, reload


def kb(n):
    return b"x" * (n * 1024)


def run_shelf(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: document shelf helpers")
    r = browser.eval("""import('/app/tools-shelf.js').then(m => {
      const files = [{ path: '3CX Firewall Guide.pdf', name: '3CX Firewall Guide.pdf', size: 300, modified: 5 }, { path: 'Network+ objectives.pdf', name: 'Network+ objectives.pdf', size: 900, modified: 9 },
        { path: 'sub/Debian notes.txt', name: 'Debian notes.txt', size: 100, modified: 7 }];
      const meta = { '3CX Firewall Guide.pdf': { tags: ['rollout', 'Firewall'], note: 'Ports table on page 4' } };
      return { kinds: ['a.PDF', 'x.docx', 'x.iso', 'x.unknown', 'photo.JPG', 'sheet.xlsx'].map(m.fileKind), sizes: [m.formatSize(500), m.formatSize(1536), m.formatSize(5 * 1048576), m.formatSize(200 * 1048576), m.formatSize(3 * 1073741824)],
        tag: m.normalizeTag('  3CX, setup ;; '), tags: m.shelfTags(files, meta).map(x => x.tag + x.n),
        q: [m.filterShelf(files, meta, { query: 'ports table' }).length, m.filterShelf(files, meta, { query: 'ROLLOUT' }).length, m.filterShelf(files, meta, { tag: 'firewall' }).length, m.filterShelf(files, meta, { tag: '__none__' }).length, m.filterShelf(files, meta, { kind: 'PDF' }).length, m.filterShelf(files, meta, { query: 'debian txt' }).length, m.filterShelf(files, meta, { query: 'nope' }).length],
        sorts: [m.sortShelf(files, 'name').map(f => f.path[0]).join(''), m.sortShelf(files, 'newest')[0].path, m.sortShelf(files, 'largest')[0].path] }; })""")
    t.check(r["kinds"] == ["PDF", "Documents", "Archives", "Other", "Images", "Spreadsheets"], "files are grouped by type from their extension")
    t.check(r["sizes"] == ["500 B", "1.5 KB", "5.0 MB", "200 MB", "3.0 GB"], "sizes read naturally")
    t.check(r["tag"] == "3CX setup" and sorted(r["tags"]) == ["Firewall1", "rollout1"], "tags are tidied and counted")
    t.check(r["q"] == [1, 1, 1, 2, 2, 1, 0], "search matches names, tags, and notes (every word), and tag, untagged, and type filters narrow it", str(r["q"]))
    t.check(r["sorts"] == ["3Ns", "Network+ objectives.pdf", "Network+ objectives.pdf"], "files sort by name, newest, or largest", str(r["sorts"]))

    t.suite("tools: document shelf page")
    go(browser, "shelf", wait=0.8)
    time.sleep(0.5)
    t.check("No files folder yet" in text_of(browser, "sh-body"), "with no files folder the shelf explains where to put files")
    folder = sandbox.dir / "files"
    (folder / "sub").mkdir(parents=True)
    (folder / "3CX Firewall Guide.pdf").write_bytes(kb(3))
    (folder / "Network+ objectives.pdf").write_bytes(kb(9))
    (folder / "sub" / "Debian notes.txt").write_bytes(kb(1))
    (folder / "photo.png").write_bytes(kb(2))
    (folder / "Résumé.pdf").write_bytes(kb(4))
    click(browser, '[data-sh="refresh"]')
    time.sleep(1.0)
    t.check(text_of(browser, "sh-count").strip() == "5 files" and browser.eval("document.querySelectorAll('.shelf-item').length") == 5, "Refresh lists the files in the folder, subfolders included")
    href = browser.eval("[...document.querySelectorAll('.shelf-name')].find(a => a.textContent.includes('Firewall')).getAttribute('href')")
    t.check(href == "/files/3CX%20Firewall%20Guide.pdf", "each name links to the file", href)
    status = browser.eval("fetch('/files/R%C3%A9sum%C3%A9.pdf').then(r => r.status)")
    t.check(status == 200 and browser.eval("[...document.querySelectorAll('.shelf-name')].find(a => a.textContent.startsWith('R')).getAttribute('href')") == "/files/R%C3%A9sum%C3%A9.pdf", "a file with accents in its name opens")
    t.check(browser.eval("document.querySelectorAll('[data-sh=kind-filter]').length") >= 3, "type filters appear when the folder holds several kinds of file")

    fill(browser, "#sh-search", "3cx")
    t.check(browser.eval("document.querySelectorAll('.shelf-item').length") == 1, "searching narrows the list")
    fill(browser, "#sh-search", "")

    browser.eval("""(() => { const input = [...document.querySelectorAll('.shelf-tag-input')].find(i => i.dataset.path === '3CX Firewall Guide.pdf');
      input.value = 'rollout'; input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); })()""")
    time.sleep(0.5)
    t.check(wait_saved(sandbox, lambda s: s.get("shelf", {}).get("meta", {}).get("3CX Firewall Guide.pdf", {}).get("tags") == ["rollout"]) and "rollout" in browser.eval("document.querySelector('.shelf-tag').textContent"), "a tag is added with Enter and saved")
    click(browser, '[data-sh="note-toggle"][data-path="3CX Firewall Guide.pdf"]')
    browser.eval("(() => { const a = [...document.querySelectorAll('[data-sh=note]')].find(x => x.dataset.path === '3CX Firewall Guide.pdf'); a.value = 'Ports table on page 4'; a.dispatchEvent(new Event('input', { bubbles: true })); })()")
    t.check(wait_saved(sandbox, lambda s: s["shelf"]["meta"]["3CX Firewall Guide.pdf"].get("note") == "Ports table on page 4"), "a note is saved")
    fill(browser, "#sh-search", "ports table")
    t.check(browser.eval("document.querySelectorAll('.shelf-item').length") == 1, "search finds a file by its note")
    fill(browser, "#sh-search", "rollout")
    t.check(browser.eval("document.querySelectorAll('.shelf-item').length") == 1, "...and by its tag")
    fill(browser, "#sh-search", "")
    click(browser, '[data-sh="tag-filter"][data-tag="rollout"]')
    t.check(browser.eval("document.querySelectorAll('.shelf-item').length") == 1, "a tag chip filters the list")
    click(browser, '[data-sh="tag-filter"][data-tag="__none__"]')
    t.check(browser.eval("document.querySelectorAll('.shelf-item').length") == 4, "Untagged shows the rest")
    click(browser, '[data-sh="tag-filter"][data-tag=""]')
    click(browser, '[data-sh="kind-filter"][data-kind="Images"]')
    t.check(browser.eval("document.querySelectorAll('.shelf-item').length") == 1, "the type filter narrows the list")
    click(browser, '[data-sh="kind-filter"][data-kind=""]')
    browser.eval("(() => { const s = document.getElementById('sh-sort'); s.value = 'largest'; s.dispatchEvent(new Event('change', { bubbles: true })); })()")
    time.sleep(0.3)
    t.check(browser.eval("document.querySelector('.shelf-name').textContent") == "Network+ objectives.pdf", "sorting by largest puts the biggest first")

    reload(browser, wait=2.5)
    go(browser, "shelf", wait=1.0)
    t.check("rollout" in browser.eval("document.getElementById('sh-list').innerText"), "tags and notes survive a reload")

    (folder / "3CX Firewall Guide.pdf").unlink()
    click(browser, '[data-sh="refresh"]')
    time.sleep(1.0)
    t.check("no longer in the folder" in text_of(browser, "sh-list").lower() and "3CX Firewall Guide.pdf" in text_of(browser, "sh-list"), "a tagged file that left the folder is listed separately")
    click(browser, '[data-sh="forget"]')
    t.check(wait_saved(sandbox, lambda s: "3CX Firewall Guide.pdf" not in s["shelf"]["meta"]), "Forget removes its tags and note")

    browser.eval("window.__realFetch = window.fetch; window.fetch = (u, ...a) => String(u).includes('/api/files') ? Promise.resolve(new Response('', { status: 404 })) : window.__realFetch(u, ...a);")
    click(browser, '[data-sh="refresh"]')
    time.sleep(0.8)
    t.check("restart the study server" in text_of(browser, "sh-body"), "an older server without the listing gets a clear 'restart the server' message")
    browser.eval("window.fetch = window.__realFetch")
    click(browser, '[data-sh="refresh"]')
    time.sleep(0.8)
    audit_view(t, browser, "document shelf")
    t.check(not browser.errors(), "no JavaScript errors on the shelf", "; ".join(browser.errors()[:3]))
