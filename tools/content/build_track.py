"""Rebuilds the generated additions to a track whose data files use the one-concept-per-line layout (idempotent).

    python tools/content/build_track.py netplus
    python tools/content/build_track.py winserver

Hand-written concepts are never modified: everything this script adds is removed and re-added on every run.
Each content module defines DOMAIN, an optional WEIGHT (to change a domain's weight), and build(batch).
"""
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import inject_dp as dp  # noqa: E402
import spec  # noqa: E402

TRACKS = {
    'netplus': {
        'data': 'networkplus.js', 'guide': 'networkplus-guide.js', 'var': 'NETPLUS_DATA', 'gvar': 'NETPLUS_GUIDE',
        'modules': ['netplus_nd1a', 'netplus_nd1b', 'netplus_nd2', 'netplus_nd3a', 'netplus_nd3b', 'netplus_nd4', 'netplus_nd5'],
        'retired': 'netplus_retired',   # concept ids dropped after the build (see that file for the reasons)
        # first free number per objective in the shipped data
        'start': {'1.1': 6, '1.2': 6, '1.3': 5, '1.4': 6, '1.5': 5, '1.6': 4, '1.7': 6, '1.8': 4, '2.1': 9, '2.2': 8, '2.3': 9, '2.4': 8,
                  '3.1': 6, '3.2': 6, '3.3': 6, '3.4': 6, '3.5': 5, '3.6': 5, '4.1': 8, '4.2': 8, '4.3': 8,
                  '5.1': 8, '5.2': 8, '5.3': 8, '5.4': 8, '5.5': 9},
    },
    'cxbasic': {
        'data': '3cx-basic.js', 'guide': '3cx-basic-guide.js', 'var': 'THREECX_BASIC_DATA', 'gvar': 'THREECX_BASIC_GUIDE',
        'modules': ['cx_basic_b1', 'cx_basic_b2', 'cx_basic_b3', 'cx_basic_b4'],
        'start': {'1.1': 6, '1.2': 6, '1.3': 7, '2.1': 5, '2.2': 4, '2.3': 6, '2.4': 5, '2.5': 6, '3.1': 6, '3.2': 6, '3.3': 6, '3.4': 5,
                  '4.1': 5, '4.2': 5, '4.3': 6, '4.4': 3},
    },
    'cxadvanced': {
        'data': '3cx-advanced.js', 'guide': '3cx-advanced-guide.js', 'var': 'THREECX_ADVANCED_DATA', 'gvar': 'THREECX_ADVANCED_GUIDE',
        'modules': ['cx_adv_a1', 'cx_adv_a2', 'cx_adv_a3', 'cx_adv_a4', 'cx_adv_a5'],
        'start': {'1.1': 5, '1.2': 6, '2.1': 5, '2.2': 5, '2.3': 6, '2.4': 4, '3.1': 6, '3.2': 6, '3.3': 5, '3.4': 4, '4.1': 5, '4.2': 5,
                  '4.3': 5, '4.4': 5, '5.1': 5, '5.2': 4, '5.3': 4, '5.4': 5},
    },
    'winserver': {
        'data': 'winserver-hybrid.js', 'guide': 'winserver-hybrid-guide.js', 'var': 'WINSERVER_DATA', 'gvar': 'WINSERVER_GUIDE',
        'modules': ['winserver_ws1', 'winserver_ws2', 'winserver_ws3', 'winserver_ws4', 'winserver_ws5', 'winserver_ws6', 'winserver_ws7'],
        'start': {'1.1': 8, '1.2': 6, '1.3': 6, '1.4': 5, '2.1': 7, '2.2': 8, '3.1': 17, '3.2': 8, '4.1': 9, '4.2': 8, '5.1': 9, '5.2': 8, '5.3': 14,
                  '6.1': 11, '6.2': 11, '7.1': 10, '7.2': 10, '7.3': 9},
    },
}


def load(config, module_name, lenient=False):
    path = os.path.join(HERE, module_name + '.py')
    if not os.path.exists(path):
        return None
    module = importlib.import_module(module_name)
    batch = spec.Batch(module.DOMAIN, lenient=lenient, core='core1', start=config['start'])
    module.build(batch)
    return module, batch


def validate(data, guide):
    problems = []
    domains, weights = {}, []
    for core in data['certification']['cores'].values():
        weights.append(sum(d['weight'] for d in core['domains']))
        for d in core['domains']:
            domains[d['id']] = {o['code'] for o in d['objectives']}
    if any(total != 100 for total in weights):
        problems.append(f'domain weights add up to {weights}, not 100')
    seen_ids, seen_terms = set(), {}
    for c in data['concepts']:
        if c['id'] in seen_ids:
            problems.append(f'duplicate id {c["id"]}')
        seen_ids.add(c['id'])
        if c['objective'] not in domains.get(c['domain'], ()):
            problems.append(f'{c["id"]}: objective {c["objective"]} not defined in {c["domain"]}')
        if c['term'] in c['distractors'] or len(set(c['distractors'])) < 3:
            problems.append(f'{c["id"]}: distractors must be distinct options that differ from the term')
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


def main(argv):
    if len(argv) != 1 or argv[0] not in TRACKS:
        print('usage: build_track.py ' + '|'.join(TRACKS))
        return 2
    config = TRACKS[argv[0]]
    data_path = os.path.join(ROOT, 'data', config['data'])
    guide_path = os.path.join(ROOT, 'data', config['guide'])
    text = dp.read(data_path)
    gtext = dp.read(guide_path)
    loaded = [item for item in (load(config, name) for name in config['modules']) if item]

    for module, b in loaded:                                  # 1. remove anything generated earlier
        text = dp.remove_concepts(text, [c['id'] for c in b.concepts])
        gtext = dp.remove_guide_sections(gtext, module.DOMAIN, [s['heading'] for s in b.guide])
        text = dp.remove_objectives(text, module.DOMAIN, [o['code'] for o in b.objectives])

    pristine = dp.parse_data(text, config['var'])['concepts']  # 2. add it back
    new = []
    for module, b in loaded:
        if hasattr(module, 'WEIGHT'):
            text = dp.set_weight(text, module.DOMAIN, module.WEIGHT)
        for code, topics in b.topics.items():
            text = dp.set_topics(text, module.DOMAIN, code, topics)
        if b.objectives:
            text = dp.add_objectives(text, module.DOMAIN, b.objectives)
        if b.guide:
            gtext = dp.add_guide_sections(gtext, module.DOMAIN, b.guide)
        new.extend(b.concepts)
    text = dp.insert_concepts(text, pristine, new)
    retired = sorted(importlib.import_module(config['retired']).RETIRED) if config.get('retired') else []
    text = dp.remove_concepts(text, retired)                  # 3. drop retired concepts (generated ones keep their numbers)

    data = dp.parse_data(text, config['var'])
    guide = dp.parse_data(gtext, config['gvar'])
    problems = validate(data, guide)
    if problems:
        print('NOT WRITTEN - problems found:')
        for line in problems:
            print('  ', line)
        return 1
    dp.write(data_path, text)
    dp.write(guide_path, gtext)
    objectives = sum(len(d['objectives']) for core in data['certification']['cores'].values() for d in core['domains'])
    kept = len([c for c in new if c['id'] not in retired])
    print(f'wrote {kept} generated concepts ({len(new) - kept} retired); {argv[0]} now has {len(data["concepts"])} concepts and {objectives} objectives')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
