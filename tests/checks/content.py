"""The generated concept data (A+ Core 2, DP-300, Network+, and AZ-802): structure, quiz-readiness, and how every diagram renders in both themes."""
import sys

from lib.diagram_check import run_check
from lib.framework import open_app
from lib.sandbox import APP_ROOT

# Diagrams that were already in the data before the checker existed and have a known, accepted quirk (none at the moment).
KNOWN_DIAGRAM_ISSUES = set()

# Hand-made diagrams that use a literal color on purpose (a dark check mark on a teal chip, readable in both themes).
LITERAL_COLOR_OK = {"c2d2-22-3"}

# (label, data global, guide global, the core whose concepts are held to the strict rules, domain-id prefix)
TRACKS = [
    ("A+", "APLUS_DATA", "APLUS_GUIDE", "core2", "c2"),
    ("DP-300", "DP300_DATA", "DP300_GUIDE", "core1", "p"),
    ("Network+", "NETPLUS_DATA", "NETPLUS_GUIDE", "core1", "nd"),
    ("AZ-802", "WINSERVER_DATA", "WINSERVER_GUIDE", "core1", "ws"),
    ("3CX Basic", "THREECX_BASIC_DATA", "THREECX_BASIC_GUIDE", "core1", "b"),
    ("3CX Advanced", "THREECX_ADVANCED_DATA", "THREECX_ADVANCED_GUIDE", "core1", "a"),
]

LAB_FILES = [
    ("A+", "labs.js", "APLUS_LABS", "concepts.js", "APLUS_DATA"),
    ("Network+", "networkplus-labs.js", "NETPLUS_LABS", "networkplus.js", "NETPLUS_DATA"),
    ("Security+", "securityplus-labs.js", "SECPLUS_LABS", "securityplus.js", "SECPLUS_DATA"),
    ("3CX Basic", "3cx-basic-labs.js", "THREECX_BASIC_LABS", "3cx-basic.js", "THREECX_BASIC_DATA"),
    ("3CX Advanced", "3cx-advanced-labs.js", "THREECX_ADVANCED_LABS", "3cx-advanced.js", "THREECX_ADVANCED_DATA"),
    ("AZ-802", "winserver-hybrid-labs.js", "WINSERVER_LABS", "winserver-hybrid.js", "WINSERVER_DATA"),
    ("DP-300", "dp300-labs.js", "DP300_LABS", "dp300.js", "DP300_DATA"),
]

SHAPE_JS = r"""
((dataName, guideName, strictCore, prefix, literalOk) => {
  const data = window[dataName], guide = window[guideName];
  if (!data || !guide) return { missing: true };
  const bad = [];
  const objectives = {}, weightSums = [];
  Object.values(data.certification.cores).forEach(core => { weightSums.push(core.domains.reduce((a, d) => a + d.weight, 0)); core.domains.forEach(d => { objectives[d.id] = new Set(d.objectives.map(o => o.code)); }); });
  const ids = new Set(), terms = new Map();
  const perObjective = {};
  data.concepts.forEach(c => {
    if (ids.has(c.id)) bad.push('duplicate id ' + c.id); ids.add(c.id);
    if (!objectives[c.domain] || !objectives[c.domain].has(c.objective)) bad.push(c.id + ': unknown objective ' + c.objective);
    perObjective[c.domain + ' ' + c.objective] = (perObjective[c.domain + ' ' + c.objective] || 0) + 1;
    ['term', 'definition', 'scenario', 'tip'].forEach(k => { if (!c[k] || !String(c[k]).trim()) bad.push(c.id + ': empty ' + k); });
    if (c.scenario && /[.!?]$/.test(c.scenario.trim())) bad.push(c.id + ': scenario ends with punctuation (the app adds its own)');
    if (!Array.isArray(c.distractors) || c.distractors.length !== 3 || new Set(c.distractors).size !== 3) bad.push(c.id + ': needs three distinct distractors');
    else if (c.distractors.includes(c.term)) bad.push(c.id + ': a distractor repeats the term');
    if (c.core === strictCore) { const k = c.term.toLowerCase(); if (terms.has(k)) bad.push(c.id + ': term repeats ' + terms.get(k)); terms.set(k, c.id); }
    if (c.diagram && c.core === strictCore) {
      if (!/^<svg viewBox='0 0 \d+ \d+'/.test(c.diagram)) bad.push(c.id + ': diagram has no viewBox');
      if (!/<title id='dt-/.test(c.diagram) || !/aria-labelledby=/.test(c.diagram)) bad.push(c.id + ': diagram has no accessible title');
      // the generated house style (380 wide) must use theme tokens only; a few older hand-made ones predate that rule
      if (!literalOk.includes(c.id) && /^<svg viewBox='0 0 380 /.test(c.diagram) && /#[0-9a-f]{3,8}\b/i.test(c.diagram.replace(/&#\d+;/g, ''))) bad.push(c.id + ': diagram hard-codes a color');
    }
  });
  const emptyObjectives = [];
  Object.entries(objectives).forEach(([domain, codes]) => codes.forEach(code => { if (!perObjective[domain + ' ' + code]) emptyObjectives.push(domain + ' ' + code); }));
  const guideProblems = [];
  guide.forEach(ch => ch.sections.forEach(s => { if (!(s.body || '').trim()) guideProblems.push(ch.domain + ' ' + s.heading + ': empty'); (s.objectives || []).forEach(code => { if (!objectives[ch.domain] || !objectives[ch.domain].has(code)) guideProblems.push(ch.domain + ' ' + s.heading + ': unknown objective ' + code); }); }));
  const guided = new Set(); guide.forEach(ch => ch.sections.forEach(s => (s.objectives || []).forEach(code => guided.add(ch.domain + ' ' + code))));
  const unguided = [];
  Object.entries(objectives).forEach(([domain, codes]) => codes.forEach(code => { if (!guided.has(domain + ' ' + code)) unguided.push(domain + ' ' + code); }));
  const strict = data.concepts.filter(c => c.core === strictCore);
  const thin = Object.entries(perObjective).filter(([k, n]) => k.startsWith(prefix) && n < 3).map(([k, n]) => k + '=' + n);
  return { bad: bad.slice(0, 12), emptyObjectives, guideProblems: guideProblems.slice(0, 8), unguided, total: data.concepts.length, strict: strict.length,
           strictDiagrams: strict.filter(c => c.diagram).length, thin, weightSums };
})
"""


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)

    for label, data_name, guide_name, strict_core, prefix in TRACKS:
        t.suite(f"{label} concept data")
        shape = browser.eval(f"({SHAPE_JS})({data_name!r}, {guide_name!r}, {strict_core!r}, {prefix!r}, {sorted(LITERAL_COLOR_OK)!r})")
        if not t.check(not shape.get("missing"), f"{label} data and guide are loaded"):
            continue
        t.check(not shape["bad"], "every concept is complete, quiz-ready, and points at a real objective", "; ".join(shape["bad"]))
        t.check(not shape["emptyObjectives"], "every objective has at least one concept", ", ".join(shape["emptyObjectives"]))
        t.check(not shape["thin"], "every objective in the generated area has three or more concepts", ", ".join(shape["thin"]))
        t.check(not shape["guideProblems"], "every study-guide section has text and real objectives", "; ".join(shape["guideProblems"]))
        t.check(not shape["unguided"], "every objective is covered by a study-guide section", ", ".join(shape["unguided"]))
        t.check(all(total == 100 for total in shape["weightSums"]), "each exam's domain weights add up to 100", str(shape["weightSums"]))
        t.check(shape["strict"] == shape["strictDiagrams"], f"every concept has a diagram ({shape['strictDiagrams']}/{shape['strict']})")

    # Question quality across every track: answers given away by the scenario, malformed scenarios, duplicates, ambiguous options.
    sys.path.insert(0, str(APP_ROOT / "tools" / "content"))
    import audit
    t.suite("question quality across all tracks")
    for label, filename, var in audit.TRACKS:
        data, issues = audit.audit_track(label, filename, var)
        fresh = [i for i in issues if (i[0], i[1]) not in audit.REVIEWED]
        t.check(not fresh, f"{label}: no scenario gives away its answer, repeats another, or has ambiguous options ({len(data['concepts'])} concepts)",
                "; ".join(f"{i[0]} {i[1]}: {i[2][:60]}" for i in fresh[:6]))

    # Labs: every lab is structurally sound (a decision's answer exists, a scenario's branches lead somewhere, a terminal step accepts something).
    import inject
    import labs_lib
    t.suite("labs are well formed in every track")
    for label, labs_file, labs_var, data_file, data_var in LAB_FILES:
        text, _crlf = labs_lib.read_labs(str(APP_ROOT / "data" / labs_file))
        labs = inject.parse_data(text, labs_var)
        data = inject.parse_data(labs_lib.read_labs(str(APP_ROOT / "data" / data_file))[0], data_var)
        domains = {d["id"] for core in data["certification"]["cores"].values() for d in core["domains"]}
        problems, seen = [], set()
        for lab in labs:
            if lab["id"] in seen:
                problems.append(f"duplicate lab id {lab['id']}")
            seen.add(lab["id"])
            problems += labs_lib.validate_lab(lab, domains)
        t.check(not problems, f"{label}: all {len(labs)} labs are well formed", "; ".join(problems[:5]))

    t.suite("concept diagrams render cleanly")
    for label, data_name, _guide, _core, _prefix in TRACKS:
        for theme in ("dark", "light"):
            issues = run_check(browser, f"window.{data_name}.concepts", theme)
            fresh = [i for i in issues if i[0] not in KNOWN_DIAGRAM_ISSUES]
            t.check(not fresh, f"{label}: no clipped, overlapping, or low-contrast diagram text in the {theme} theme ({len(issues)} flagged, {len(issues) - len(fresh)} known)",
                    "; ".join(f"{i[0]} {i[1]} {i[2]}" for i in fresh[:10]))
    browser.eval("document.documentElement.dataset.theme = 'dark'")
