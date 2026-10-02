# Cert Study smoke tests

A safety net for changes to the app. It starts a **throwaway copy** of the app on a free port with its own empty data, drives it with a headless Edge/Chrome, and checks the things that have broken before. The live study server and your real progress are never touched.

```
python tests/run.py                 # everything (about 4 minutes)
python tests/run.py static server   # quick, no browser (a few seconds)
python tests/run.py pages           # every page, both themes
python tests/run.py print           # real PDFs
python tests/run.py interactions    # color picker, highlights, palette, backups
python tests/run.py --real-data     # start from a COPY of your real progress files
```

Needs Python 3.9+ and Edge or Chrome. If the browser is not found, set `CERTSTUDY_BROWSER` to its executable. Optional: `pip install pymupdf` lets the print checks read the PDFs (page counts, header text, white page); without it they only confirm a PDF is produced.

## What it covers

| Group | Checks |
|---|---|
| `static` | `APP_VERSION` matches the service worker cache name; every script/stylesheet/data file (and every module import) is precached so the app still works offline after an update; `server.py` compiles. |
| `server` | Saving one track never overwrites another; separate accounts; unknown account ids fall back safely; backups are named safely, retained and restored correctly. |
| `pages` | The app boots with no JavaScript errors; all 26 pages in dark and light render, have headings, name every control, have no duplicate ids and never scroll sideways; every visible piece of text meets 4.5:1 contrast; every Tab stop shows a focus ring. |
| `print` | Real PDFs of the glossary, reports, guide, and more: page counts stay sane, the masthead and "Page X of Y" are there, the page prints on white even from the dark theme, collapsed sections are opened for print. |
| `interactions` | The color picker (typing, live preview, Escape reverts, Done saves, Tab trap), avatar/icon/highlight colors, highlight readability for awkward colors in both themes, highlight undo, settings in the command palette, backup restore. |

## Adding a check

Each group is a module in `tests/checks/` with a `run(ctx)` function. `ctx.fresh_sandbox()` gives an isolated app, `ctx.browser()` a headless page, and `ctx.t.check(ok, "what should be true")` records a result. Helpers for opening the app and navigating live in `tests/lib/framework.py`.
