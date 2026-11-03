# Content tooling

How the generated A+ Core 2, DP-300, Network+, AZ-802, and 3CX additions (and the labs) are made. The concept files in `data/` are never re-serialized: the
scripts here insert and remove text blocks, so the hand-written content stays byte-for-byte identical.

```
python tools/content/build_core2.py            # rebuild every domain (safe to re-run: it removes then re-adds its own output)
python tools/content/build_core2.py c2d2       # one domain
python tools/content/build_dp300.py            # rebuild the DP-300 additions (modules dp300_p1.py ... dp300_p6.py)
python tools/content/build_track.py netplus    # Network+ (modules netplus_nd1a ... nd5); `winserver` builds AZ-802 (modules winserver_ws1 ... ws7)
python tools/content/build_track.py cxbasic    # 3CX Basic (cx_basic_b1 ... b4); `cxadvanced` builds 3CX Advanced (cx_adv_a1 ... a5, one module per domain)
python tools/content/cx_corrections.py         # one-off fixes to hand-written 3CX concepts and guide sentences the 2026 admin manual contradicts (idempotent)
python tools/content/netplus_corrections.py    # the same for hand-written Network+ concepts, guide sentences, and lab text (run after build_track.py netplus; idempotent)
python tools/content/smoke.py c2d2             # list every diagram whose text does not fit, without writing anything (A+ domains only)
python tools/content/smoke_track.py winserver  # the same for a build_track.py track (add a module name to check just one)
python tools/content/build_labs.py             # add the generated labs (labs_aplus.py, labs_netplus.py, labs_dp300.py, labs_winserver.py, labs_3cx_basic.py, labs_3cx_advanced.py); validates each lab first
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
| `cx_basic_b*.py`, `cx_adv_a*.py` | The 3CX content, checked against 3CX's admin manual. A module writes one domain only (`DOMAIN`), so each domain has its own file. |
| `netplus_retired.py` | `RETIRED = {id: reason}` for Network+ questions taken out of the bank (checked against CompTIA's N10-009 objectives). `build_track.py` drops them after building; generated ones stay in their `netplus_nd*.py` module so the numbers after them do not move, hand-written ones are removed from the data file. Never reuse a retired id. |
| `netplus_corrections.py` | Replaces fields of named hand-written Network+ concepts (a renamed term keeps its id) and swaps study-guide sentences and lab strings. Run it after `build_track.py netplus`. |
| `cx_corrections.py`, `cx_guide_edits.py` | Replaces fields of named hand-written 3CX concepts (a changed term keeps its id) and swaps outdated guide sentences. `build_track.py` never touches hand-written concepts, so these survive a rebuild. |
| `labs_lib.py`, `build_labs.py`, `labs_*.py` | Lab constructors (`sequence`, `decision`, `terminal`, `scenario`) with structural validation, the idempotent injector, and the lab content. Scenario labs appear on the Case studies page. |
| `audit.py` | Finds scenarios that give away their answer, duplicate scenarios or definitions, near-duplicate or overlapping options, and malformed scenarios. Pairs that were read and accepted go in `REVIEWED`. |

After a content change, bump `APP_VERSION`, the service worker `CACHE`, the `?v=` on the changed data file in
`app/index.html`, and add a What's New entry (see `app/changelog.js`).

Gotcha: when writing Python that contains backslashes (Windows paths, regexes), create the file with an editor
tool rather than a shell heredoc, which can silently turn `` or `\` into other characters.

Gotcha: `build_track.py` removes only the ids its modules still generate. If you delete or reorder concepts in a module, the
old last ids linger in the data file and trip the duplicate-term check. Restore the track's data files from the last commit
(`git checkout -- data/<track>.js data/<track>-guide.js`), rebuild, and re-run `cx_corrections.py` for the 3CX tracks.
