"""Print / save-as-PDF output, checked by actually producing PDFs."""
import os
import tempfile

from lib.framework import open_app, go, set_theme

try:
    import pymupdf  # type: ignore
except ImportError:  # optional
    pymupdf = None

# route -> (max pages, text that must be on the first sheet, setup script)
CASES = {
    "glossary": (80, ["Cert Study", "Page 1 of"], ""),
    "report": (3, ["Readiness Report", "Page 1 of"], ""),
    # A brand-new profile has every concept still "unmastered", so this sheet is long here; real data is 2-3 pages.
    "finalreview": (40, ["Final Review Sheet", "Page 1 of"], ""),
    "commands": (6, ["Command reference", "Page 1 of"], ""),
    "examday": (3, ["Exam day", "Page 1 of"], ""),
    "guide": (30, ["Study guide", "Page 1 of"], ""),
}


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)
    set_theme(browser, "dark")  # printing must always come out light, whatever the screen theme

    t.suite("print: PDF output")
    out = tempfile.mkdtemp(prefix="certstudy-pdf-")
    if pymupdf is None:
        t.warn("PyMuPDF is not installed, so PDF contents are not inspected", "pip install pymupdf")
    for route, (max_pages, must_have, setup) in CASES.items():
        go(browser, route, wait=1.0)
        browser.eval("window.dispatchEvent(new Event('beforeprint'))")  # what a real print fires first
        path = browser.pdf(os.path.join(out, f"{route}.pdf"))
        browser.eval("window.dispatchEvent(new Event('afterprint'))")
        t.check(os.path.getsize(path) > 2000, f"{route}: a PDF is produced")
        if pymupdf is None:
            continue
        doc = pymupdf.open(path)
        first = doc[0].get_text()
        everything = "\n".join(page.get_text() for page in doc)
        t.check(doc.page_count <= max_pages, f"{route}: stays within {max_pages} pages", f"{doc.page_count} pages")
        t.check(all(s in first for s in must_have), f"{route}: first sheet has its heading and 'Page 1 of N'", f"missing from: {first[:120]!r}")
        t.check("Skip to content" not in everything, f"{route}: no stray 'Skip to content' link")
        # A dark screen theme must still print light: the page background sampled at a corner is white.
        pix = doc[0].get_pixmap(dpi=30)
        t.check(pix.pixel(2, 2)[:3] == (255, 255, 255), f"{route}: prints on white even from the dark theme")

    # The title swap that makes 'Save as PDF' propose a descriptive file name, and its restore.
    go(browser, "glossary", wait=0.8)
    before = browser.eval("document.title")
    during = browser.eval("(() => { window.dispatchEvent(new Event('beforeprint')); return document.title; })()")
    browser.eval("window.dispatchEvent(new Event('afterprint'))")
    after = browser.eval("document.title")
    t.check(during != before and "Glossary" in during, "print temporarily retitles the page for the PDF file name", during)
    t.check(after == before, "...and restores the normal title afterwards")

    # Collapsed <details> must be opened for print and closed again.
    go(browser, "finalreview", wait=0.8)
    closed = browser.eval("document.querySelectorAll('details:not([open])').length")
    opened = browser.eval("(() => { window.dispatchEvent(new Event('beforeprint')); return document.querySelectorAll('details:not([open])').length; })()")
    browser.eval("window.dispatchEvent(new Event('afterprint'))")
    reclosed = browser.eval("document.querySelectorAll('details:not([open])').length")
    if closed:
        t.check(opened == 0 and reclosed == closed, "collapsed sections are opened for print, then restored")
