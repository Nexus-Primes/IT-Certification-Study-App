"""The A+ concept data: structure, quiz-readiness, and how every diagram renders in both themes."""
from lib.diagram_check import run_check
from lib.framework import open_app

# Diagrams that were already in the data before the checker existed and have a known, accepted quirk.
KNOWN_DIAGRAM_ISSUES = {"c2d1-12-4"}

SHAPE_JS = r"""
(() => {
  const data = window.APLUS_DATA, guide = window.APLUS_GUIDE;
  const bad = [];
  const objectives = {};
  Object.values(data.certification.cores).forEach(core => core.domains.forEach(d => { objectives[d.id] = new Set(d.objectives.map(o => o.code)); }));
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
    if (c.core === 'core2') { const k = c.term.toLowerCase(); if (terms.has(k)) bad.push(c.id + ': term repeats ' + terms.get(k)); terms.set(k, c.id); }
    if (c.diagram && c.core === 'core2') {
      if (!/^<svg viewBox='0 0 \d+ \d+'/.test(c.diagram)) bad.push(c.id + ': diagram has no viewBox');
      if (!/<title id='dt-/.test(c.diagram) || !/aria-labelledby=/.test(c.diagram)) bad.push(c.id + ': diagram has no accessible title');
      // the generated house style (380 wide) must use theme tokens only; a few older hand-made ones predate that rule
      if (/^<svg viewBox='0 0 380 /.test(c.diagram) && /#[0-9a-f]{3,8}/i.test(c.diagram.replace(/&#\d+;/g, ''))) bad.push(c.id + ': diagram hard-codes a color');
    }
  });
  const emptyObjectives = [];
  Object.entries(objectives).forEach(([domain, codes]) => codes.forEach(code => { if (!perObjective[domain + ' ' + code]) emptyObjectives.push(domain + ' ' + code); }));
  const guideProblems = [];
  guide.forEach(ch => ch.sections.forEach(s => { if (!(s.body || '').trim()) guideProblems.push(ch.domain + ' ' + s.heading + ': empty'); (s.objectives || []).forEach(code => { if (!objectives[ch.domain] || !objectives[ch.domain].has(code)) guideProblems.push(ch.domain + ' ' + s.heading + ': unknown objective ' + code); }); }));
  const guided = new Set(); guide.forEach(ch => ch.sections.forEach(s => (s.objectives || []).forEach(code => guided.add(ch.domain + ' ' + code))));
  const unguided = [];
  Object.entries(objectives).forEach(([domain, codes]) => codes.forEach(code => { if (!guided.has(domain + ' ' + code)) unguided.push(domain + ' ' + code); }));
  const core2 = data.concepts.filter(c => c.core === 'core2');
  const thin = Object.entries(perObjective).filter(([k, n]) => k.startsWith('c2') && n < 3).map(([k, n]) => k + '=' + n);
  return { bad: bad.slice(0, 12), emptyObjectives, guideProblems: guideProblems.slice(0, 8), unguided, core2: core2.length, core2Diagrams: core2.filter(c => c.diagram).length, thin };
})()
"""


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    browser = ctx.browser()
    open_app(browser, sandbox)

    t.suite("A+ concept data")
    shape = browser.eval(SHAPE_JS)
    t.check(not shape["bad"], "every concept is complete, quiz-ready, and points at a real objective", "; ".join(shape["bad"]))
    t.check(not shape["emptyObjectives"], "every objective has at least one concept", ", ".join(shape["emptyObjectives"]))
    t.check(not shape["thin"], "every Core 2 objective has three or more concepts", ", ".join(shape["thin"]))
    t.check(not shape["guideProblems"], "every study-guide section has text and real objectives", "; ".join(shape["guideProblems"]))
    t.check(not shape["unguided"], "every objective is covered by a study-guide section", ", ".join(shape["unguided"]))
    t.check(shape["core2"] == shape["core2Diagrams"], f"every Core 2 concept has a diagram ({shape['core2Diagrams']}/{shape['core2']})")

    t.suite("A+ concept diagrams render cleanly")
    for theme in ("dark", "light"):
        issues = run_check(browser, "window.APLUS_DATA.concepts", theme)
        fresh = [i for i in issues if i[0] not in KNOWN_DIAGRAM_ISSUES]
        t.check(not fresh, f"no clipped, overlapping, or low-contrast diagram text in the {theme} theme ({len(issues)} flagged, {len(issues) - len(fresh)} known)",
                "; ".join(f"{i[0]} {i[1]} {i[2]}" for i in fresh[:10]))
    browser.eval("document.documentElement.dataset.theme = 'dark'")
