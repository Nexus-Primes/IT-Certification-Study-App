# Cert Study smoke tests

A safety net for changes to the app. It starts a **throwaway copy** of the app on a free port with its own empty data, drives it with a headless Edge/Chrome, and checks the things that have broken before. The live study server and your real progress are never touched.

```
python tests/run.py                 # everything (about 9 minutes)
python tests/run.py static server   # quick, no browser (a few seconds)
python tests/run.py pages           # every page, both themes
python tests/run.py print           # real PDFs
python tests/run.py interactions    # color picker, highlights, palette, backups
python tests/run.py flows           # a practice session, losing the server, per-track accents, sidebar, planner
python tests/run.py study surfaces  # which questions are served, mock exams, labs, accounts; dialogs and pop-ups in four themes
python tests/run.py content         # the A+ concept data and every diagram, in both themes
python tests/serve_sandbox.py       # an isolated copy to click around in (add --real-data for a copy of yours)
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
| `flows` | A real Quick 10 from start to saved results; the app when the study server disappears and returns (banner, then nothing lost); a different accent per track; customizing the sidebar; the study plan; printing pages that have real content (reports, notes, Browse cards). |
| `study` | Quick 10, Today's session, Spaced review, and Adaptive skip completed domains (and explicit picks and mock exams still include them); mock exams, labs, and switching accounts with a PIN. |
| `surfaces` | Every dialog opens as a labelled modal, takes focus, closes on Escape, and meets 4.5:1 contrast in four theme/style combinations; so do pop-ups, toasts, and banners. |
| `content` | The A+ concept data is complete and quiz-ready (three distinct distractors, real objectives, unique Core 2 terms, a study-guide section for every objective), and every diagram renders without clipped, overlapping, or low-contrast text in dark and light. |
| `interactions` | The color picker (typing, live preview, Escape reverts, Done saves, Tab trap), avatar/icon/highlight colors, highlight readability for awkward colors in both themes, highlight undo, settings in the command palette, backup restore. |

## Adding a check

Each group is a module in `tests/checks/` with a `run(ctx)` function. `ctx.fresh_sandbox()` gives an isolated app, `ctx.browser()` a headless page, and `ctx.t.check(ok, "what should be true")` records a result. Helpers for opening the app and navigating live in `tests/lib/framework.py`.

## Run the quick checks automatically before every commit

```
git config core.hooksPath .githooks
```

The hook (`.githooks/pre-commit`) runs `python tests/run.py static server` (about 2 seconds) whenever the commit touches `app/`, `server.py`, `service-worker.js`, or `tests/`, and blocks the commit if they fail. Use `git commit --no-verify` to skip it once. The full suite is still worth running before you ship.
