"""Adds the generated labs to the *-labs.js files (idempotent).

    python tools/content/build_labs.py            all tracks that have a lab module
    python tools/content/build_labs.py netplus    one track

Hand-written labs are never modified; everything built here is removed and re-added on every run. Each lab is
validated (structure, branches, accepted commands, domains) before anything is written.
"""
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import inject  # noqa: E402
import labs_lib as L  # noqa: E402

TRACKS = {
    'aplus': {'labs': 'labs.js', 'var': 'APLUS_LABS', 'data': 'concepts.js', 'dvar': 'APLUS_DATA', 'module': 'labs_aplus'},
    'netplus': {'labs': 'networkplus-labs.js', 'var': 'NETPLUS_LABS', 'data': 'networkplus.js', 'dvar': 'NETPLUS_DATA', 'module': 'labs_netplus'},
    'dp300': {'labs': 'dp300-labs.js', 'var': 'DP300_LABS', 'data': 'dp300.js', 'dvar': 'DP300_DATA', 'module': 'labs_dp300'},
    'winserver': {'labs': 'winserver-hybrid-labs.js', 'var': 'WINSERVER_LABS', 'data': 'winserver-hybrid.js', 'dvar': 'WINSERVER_DATA', 'module': 'labs_winserver'},
}


def build(name):
    config = TRACKS[name]
    labs_path = os.path.join(ROOT, 'data', config['labs'])
    data_path = os.path.join(ROOT, 'data', config['data'])
    new = importlib.import_module(config['module']).labs()

    text, crlf = L.read_labs(labs_path)
    text = L.remove_labs(text, [lab['id'] for lab in new])
    existing = L.parse_labs(text, config['var'])
    data = inject.parse_data(open(data_path, encoding='utf-8', newline='').read().replace('\r\n', '\n'), config['dvar'])
    domain_ids = {d['id'] for core in data['certification']['cores'].values() for d in core['domains']}

    problems = []
    seen = {lab['id'] for lab in existing}
    for lab in new:
        if lab['id'] in seen:
            problems.append(f'{lab["id"]}: id already used')
        seen.add(lab['id'])
        problems += L.validate_lab(lab, domain_ids)
    if problems:
        print(f'{name}: NOT WRITTEN - problems found:')
        for line in problems:
            print('   ', line)
        return 1
    text = L.append_labs(text, new)
    after = L.parse_labs(text, config['var'])           # must still parse
    assert len(after) == len(existing) + len(new)
    L.write_labs(labs_path, text, crlf)
    print(f'{name}: added {len(new)} labs; {config["labs"]} now has {len(after)}')
    return 0


def main(argv):
    names = argv or list(TRACKS)
    return max(build(n) for n in names)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
