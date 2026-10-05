"""Rebuilds the generated Core 2 additions in data/concepts.js and data/aplus-guide.js (idempotent).

    python tools/content/build_core2.py            all domains that have content modules
    python tools/content/build_core2.py c2d1       just one domain

Existing, hand-written concepts are never modified. Everything this script adds is removed and re-added
on every run, so edits to the content modules (core2_d*.py) can simply be re-built.
"""
import importlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import inject  # noqa: E402
import spec  # noqa: E402

CONCEPTS = os.path.join(ROOT, 'data', 'concepts.js')
GUIDE = os.path.join(ROOT, 'data', 'aplus-guide.js')

MODULES = {
    'c2d1': ['core2_d1a', 'core2_d1b'],
    'c2d2': ['core2_d2a', 'core2_d2b'],
    'c2d3': ['core2_d3', 'core2_d3b'],
    'c2d4': ['core2_d4a', 'core2_d4b'],
}


def load_batch(domain):
    batch = spec.Batch(domain)
    for name in MODULES[domain]:
        if os.path.exists(os.path.join(HERE, name + '.py')):
            importlib.import_module(name).build(batch)
    return batch


def validate(data, guide):
    problems = []
    domains = {}
    for core in data['certification']['cores'].values():
        for domain in core['domains']:
            domains[domain['id']] = {o['code'] for o in domain['objectives']}
    seen_ids, seen_terms = set(), {}
    for c in data['concepts']:
        if c['id'] in seen_ids:
            problems.append(f'duplicate id {c["id"]}')
        seen_ids.add(c['id'])
        if c['objective'] not in domains.get(c['domain'], ()):
            problems.append(f'{c["id"]}: objective {c["objective"]} not defined in {c["domain"]}')
        if c['term'] in c['distractors']:
            problems.append(f'{c["id"]}: a distractor equals the term')
        if len(c['distractors']) != 3 or len(set(c['distractors'])) != 3:
            problems.append(f'{c["id"]}: distractors must be three distinct options')
        if c['core'] == 'core2':
            other = seen_terms.get(c['term'].lower())
            if other:
                problems.append(f'{c["id"]}: term {c["term"]!r} repeats {other}')
            seen_terms[c['term'].lower()] = c['id']
    chapter = {ch['domain']: ch for ch in guide}
    for domain, codes in domains.items():
        if domain in chapter:
            for section in chapter[domain]['sections']:
                for code in section['objectives']:
                    if code not in codes:
                        problems.append(f'guide {domain} "{section["heading"]}": unknown objective {code}')
    return problems


def main(argv):
    wanted = argv or list(MODULES)
    ctext = inject.read(CONCEPTS)
    gtext = inject.read(GUIDE)
    batches = {d: load_batch(d) for d in wanted}

    # 1. take out anything previously generated
    for domain, b in batches.items():
        ctext = inject.remove_concepts(ctext, [c['id'] for c in b.concepts])
        ctext = inject.remove_objectives(ctext, domain, [o['code'] for o in b.objectives])
        gtext = inject.remove_guide_sections(gtext, domain, [s['heading'] for s in b.guide])

    # 2. add it back
    pristine = inject.parse_data(ctext, 'APLUS_DATA')['concepts']
    new = []
    for domain, b in batches.items():
        for code, topics in b.topics.items():
            ctext = inject.set_topics(ctext, domain, code, topics)
        if b.objectives:
            ctext = inject.add_objectives(ctext, domain, b.objectives)
        if b.guide:
            gtext = inject.add_guide_sections(gtext, domain, b.guide)
        new.extend(b.concepts)
    ctext = inject.insert_concepts(ctext, pristine, new)

    data = inject.parse_data(ctext, 'APLUS_DATA')
    guide = inject.parse_data(gtext, 'APLUS_GUIDE')
    problems = validate(data, guide)
    if problems:
        print('NOT WRITTEN - problems found:')
        for line in problems:
            print('  ', line)
        return 1
    inject.write(CONCEPTS, ctext)
    inject.write(GUIDE, gtext)
    core2 = [c for c in data['concepts'] if c['core'] == 'core2']
    print(f'wrote {len(new)} generated concepts; Core 2 now has {len(core2)} concepts '
          f'({sum(len(d["objectives"]) for d in data["certification"]["cores"]["core2"]["domains"])} objectives)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
