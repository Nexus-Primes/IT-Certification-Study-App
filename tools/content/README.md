# Content tooling

How the generated A+ Core 2, DP-300, Network+, and AZ-802 additions (and the labs) are made. The concept files in `data/` are never re-serialized: the
scripts here insert and remove text blocks, so the hand-written content stays byte-for-byte identical.

```
python tools/content/build_core2.py            # rebuild every domain (safe to re-run: it removes then re-adds its own output)
python tools/content/build_core2.py c2d2       # one domain
python tools/content/build_dp300.py            # rebuild the DP-300 additions (modules dp300_p1.py ... dp300_p6.py)
python tools/content/build_track.py netplus    # Network+ (modules netplus_nd1a ... nd5); `winserver` builds AZ-802 (modules winserver_ws1 ... ws7)
python tools/content/smoke.py c2d2             # list every diagram whose text does not fit, without writing anything (A+ domains only)
python tools/content/smoke_track.py winserver  # the same for a build_track.py track (add a module name to check just one)
python tools/content/build_labs.py             # add the generated labs (labs_aplus.py, labs_netplus.py, labs_dp300.py); validates each lab first
python tools/content/audit.py                  # question-quality sweep over every track (--strict exits 1 on a finding; the content tests run it)
python tests/run.py content                    # data checks plus a browser render of every diagram (dark and light)
```

| File | Role |
|---|---|
| `core2_d1a.py` ... `core2_d4b.py` | The content: `b.add(objective, term, definition, scenario, distractors, tip, diagram, caption)` per concept, plus `b.objective(...)`, `b.topics[...]`, and `b.section(...)` for new objectives, topic lists, and study-guide sections. |
| `svg.py` | Diagram archetypes in the app's house style: `steps`, `compare`, `terminal`, `hub`, `table`, `layers`, `facts`, `flow_split`. Text is measured, so a label that is too wide fails at build time. Colors are the app's CSS tokens only. |
| `spec.py` | The `Batch` helper: assigns ids (`c2dN-<objective>-<n>`, continuing after the existing ones) and builds the data. |
| `inject.py` | Text-level edits to `data/concepts.js` and `data/aplus-guide.js`. |
| `inject_dp.py` | The same for `data/dp300.js` and `data/dp300-guide.js`, which use a one-concept-per-line layout, and it can add a whole new domain and study-guide chapter. |
| `build_core2.py`, `build_dp300.py`, `build_track.py` | Apply every batch, validate ids, objectives, terms, distractors, weights, and guide coverage, and only then write the files. `build_track.py` takes the track name and holds each track's first free number per objective (`start`). |
| `netplus_nd*.py`, `winserver_ws*.py`, `dp300_p*.py` | The content for those tracks, in the same `b.add(...)` form. A new objective needs `b.objective(...)`; a changed topic list needs `b.topics[...]`. |
| `labs_lib.py`, `build_labs.py`, `labs_*.py` | Lab constructors (`sequence`, `decision`, `terminal`, `scenario`) with structural validation, the idempotent injector, and the lab content. Scenario labs appear on the Case studies page. |
| `audit.py` | Finds scenarios that give away their answer, duplicate scenarios or definitions, near-duplicate or overlapping options, and malformed scenarios. Pairs that were read and accepted go in `REVIEWED`. |

After a content change, bump `APP_VERSION`, the service worker `CACHE`, the `?v=` on the changed data file in
`app/index.html`, and add a What's New entry (see `app/changelog.js`).

Gotcha: when writing Python that contains backslashes (Windows paths, regexes), create the file with an editor
tool rather than a shell heredoc, which can silently turn `` or `\` into other characters.
