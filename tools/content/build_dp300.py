"""Rebuilds the generated DP-300 additions in data/dp300.js and data/dp300-guide.js (idempotent).

    python tools/content/build_dp300.py

Hand-written concepts are not modified. The weights follow Microsoft's published outline: five areas at
15-20 / 20-25 / 20-25 / 15-20 / 20-25 percent. The app keeps its older split of "Monitor, configure, and optimize"
into two domains (p3, p4), so those two share that area's weight, and the HA/DR area is the new domain p6.
"""
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import inject_dp as dp  # noqa: E402
import spec  # noqa: E402

DATA = os.path.join(ROOT, 'data', 'dp300.js')
GUIDE = os.path.join(ROOT, 'data', 'dp300-guide.js')
MODULES = ['dp300_p1', 'dp300_p2', 'dp300_p3', 'dp300_p4', 'dp300_p5', 'dp300_p6']

# First free number per objective in the shipped data (every existing DP-300 objective has six concepts; new objectives start at 1).
START = {code: 7 for code in ('1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2')}

DESCRIPTION = ("Plan and implement Azure SQL data platform resources, secure the environment, monitor and optimize operations, tune query performance, "
               "automate database tasks, and plan and configure high availability and disaster recovery. Organized to follow Microsoft's published skills outline "
               "(effective October 27, 2026), except that \\\"Monitor, configure, and optimize\\\" is split into two domains here. Backup, failover, and recovery figures in the added concepts were checked against Microsoft Learn on 2026-10-09, and the rest is best-effort. Microsoft can change the outline, "
               "so check learn.microsoft.com for the current version before relying on it for exam scope.")


def load(module_name, lenient):
    module = importlib.import_module(module_name)
    batch = spec.Batch(module.DOMAIN, lenient=lenient, core='core1', start=START)
    module.build(batch)
    return module, batch


def validate(data, guide):
    problems = []
    core = next(iter(data['certification']['cores'].values()))
    domains = {d['id']: {o['code'] for o in d['objectives']} for d in core['domains']}
    total = sum(d['weight'] for d in core['domains'])
    if total != 100:
        problems.append(f'domain weights add up to {total}, not 100')
    seen_ids, seen_terms = set(), {}
    for c in data['concepts']:
        if c['id'] in seen_ids:
            problems.append(f'duplicate id {c["id"]}')
        seen_ids.add(c['id'])
        if c['objective'] not in domains.get(c['domain'], ()):
            problems.append(f'{c["id"]}: objective {c["objective"]} not defined in {c["domain"]}')
        if c['term'] in c['distractors'] or len(set(c['distractors'])) != 3:
            problems.append(f'{c["id"]}: distractors must be three distinct options that differ from the term')
        other = seen_terms.get(c['term'].lower())
        if other:
            problems.append(f'{c["id"]}: term {c["term"]!r} repeats {other}')
        seen_terms[c['term'].lower()] = c['id']
    chapter = {ch['domain']: ch for ch in guide}
    for domain, codes in domains.items():
        if domain not in chapter:
            problems.append(f'no study-guide chapter for {domain}')
            continue
        covered = {code for s in chapter[domain]['sections'] for code in s['objectives']}
        for s in chapter[domain]['sections']:
            for code in s['objectives']:
                if code not in codes:
                    problems.append(f'guide {domain} "{s["heading"]}": unknown objective {code}')
        for code in codes - covered:
            problems.append(f'objective {domain} {code} has no study-guide section')
    return problems


def main():
    text = dp.read(DATA)
    gtext = dp.read(GUIDE)
    loaded = [load(name, lenient=False) for name in MODULES]

    # 1. remove anything generated earlier
    for module, b in loaded:
        text = dp.remove_concepts(text, [c['id'] for c in b.concepts])
        gtext = dp.remove_guide_sections(gtext, module.DOMAIN, [s['heading'] for s in b.guide]) if module.DOMAIN != 'p6' else gtext
    text = dp.remove_domain(text, 'p6')
    gtext = dp.remove_guide_chapter(gtext, 'p6')
    for module, b in loaded:
        if module.DOMAIN != 'p6':
            text = dp.remove_objectives(text, module.DOMAIN, [o['code'] for o in b.objectives])

    # 2. add it back
    pristine = dp.parse_data(text, 'DP300_DATA')['concepts']
    new = []
    for module, b in loaded:
        text = dp.set_weight(text, module.DOMAIN, module.WEIGHT) if module.DOMAIN != 'p6' else text
        if module.DOMAIN == 'p6':
            domain = dict(module.NEW_DOMAIN, objectives=b.objectives)
            text = dp.add_domain(text, domain)
            gtext = dp.add_guide_chapter(gtext, {'domain': 'p6', 'overview': module.OVERVIEW, 'sections': b.guide})
        else:
            for code, topics in b.topics.items():
                text = dp.set_topics(text, module.DOMAIN, code, topics)
            if b.objectives:
                text = dp.add_objectives(text, module.DOMAIN, b.objectives)
            gtext = dp.add_guide_sections(gtext, module.DOMAIN, b.guide)
        new.extend(b.concepts)
    text = dp.insert_concepts(text, pristine, new)

    import re
    text = re.sub(r'"description": "Plan and implement Azure SQL[^\n]*?",\n', lambda m: '"description": "%s",\n' % DESCRIPTION, text, count=1)

    data = dp.parse_data(text, 'DP300_DATA')
    guide = dp.parse_data(gtext, 'DP300_GUIDE')
    problems = validate(data, guide)
    if problems:
        print('NOT WRITTEN - problems found:')
        for line in problems:
            print('  ', line)
        return 1
    dp.write(DATA, text)
    dp.write(GUIDE, gtext)
    core = next(iter(data['certification']['cores'].values()))
    print(f'wrote {len(new)} generated concepts; DP-300 now has {len(data["concepts"])} concepts, '
          f'{len(core["domains"])} domains, {sum(len(d["objectives"]) for d in core["domains"])} objectives')
    return 0


if __name__ == '__main__':
    sys.exit(main())
