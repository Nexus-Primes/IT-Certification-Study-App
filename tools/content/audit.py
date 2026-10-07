"""Quality sweep over every track's concepts: problems that make a quiz question easy to game, ambiguous, or malformed.

    python tools/content/audit.py            report only
    python tools/content/audit.py --strict   exit 1 if anything is found (used by the content tests)

Checks: the scenario gives away the answer, the scenario does not read as a verb phrase, two concepts share a
scenario or a definition, a distractor is a near-duplicate of the answer or of another distractor, a distractor is
a longer restatement that contains the whole answer, and terms or text of unreasonable length.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import inject  # noqa: E402

TRACKS = [
    ('A+', 'concepts.js', 'APLUS_DATA'), ('Network+', 'networkplus.js', 'NETPLUS_DATA'), ('Security+', 'securityplus.js', 'SECPLUS_DATA'),
    ('3CX Basic', '3cx-basic.js', 'THREECX_BASIC_DATA'), ('3CX Advanced', '3cx-advanced.js', 'THREECX_ADVANCED_DATA'),
    ('AZ-802', 'winserver-hybrid.js', 'WINSERVER_DATA'), ('DP-300', 'dp300.js', 'DP300_DATA'),
]
# Near-overlaps that were read and accepted: each pair is two real, distinct concepts from the same family.
REVIEWED = {
    ('c1d3-32-4', 'distractor overlaps the answer'),   # ECC RAM vs registered non-ECC RAM
    ('c2d1-11-5', 'distractor overlaps the answer'),   # Windows Pro vs Pro for Workstations
    ('nd2-22-1', 'distractor overlaps the answer'),    # static route vs floating static route
    ('sd1-13-4', 'distractor overlaps the answer'),    # impact analysis vs business impact analysis
    ('sd5-55-3', 'distractor overlaps the answer'),    # known vs partially known environment test
    ('ws5-53-2', 'distractor overlaps the answer'),    # Storage Spaces vs Storage Spaces Direct
}

STOP = {'the', 'and', 'for', 'with', 'from', 'that', 'this', 'type', 'layer', 'protocol', 'server', 'service', 'network', 'attack', 'model', 'record', 'file', 'cable', 'port', 'rule', 'tool', 'command'}
BAD_STARTS = ('a ', 'an ', 'the ', 'to ', 'which ', 'what ', 'when ', 'if ')


def norm(text):
    return re.sub(r'[^a-z0-9]+', ' ', text.lower()).strip()


def core_terms(term):
    """The term without its parenthetical, and any acronym in parentheses, as separate things to look for."""
    base = re.sub(r'\s*\([^)]*\)', '', term).strip()
    acronyms = [a for a in re.findall(r'\(([A-Za-z0-9+/.-]{2,10})\)', term)
                if len(re.findall(r'[A-Z]', a)) >= 2 and a not in ('IPv4', 'IPv6')]
    return base, acronyms


def leaks(c):
    scenario = norm(c['scenario'])
    if re.match(r'(?i)ports?\b', c['term']) or ' vs' in c['term']:     # port questions must name the service; "X vs Y" terms list their own options
        return []
    base, acronyms = core_terms(c['term'])
    base_n = norm(base)
    found = []
    if len(base_n) >= 6 and base_n not in STOP and re.search(r'\b' + re.escape(base_n) + r'\b', scenario):
        found.append(base)
    for a in acronyms:
        if len(a) >= 3 and re.search(r'\b' + re.escape(a.lower()) + r'\b', scenario):
            found.append(a)
    return found


def audit_track(label, filename, var):
    path = os.path.join(ROOT, 'data', filename)
    text = open(path, encoding='utf-8', newline='').read().replace('\r\n', '\n')
    data = inject.parse_data(text, var)
    issues = []
    seen_scenario, seen_definition = {}, {}
    for c in data['concepts']:
        cid = c['id']
        found = leaks(c)
        if found:
            issues.append((cid, 'answer in scenario', f'{c["term"]!r} appears as {found}: ...{c["scenario"][:80]}'))
        s = c['scenario'].strip()
        if s.lower().startswith(BAD_STARTS):
            issues.append((cid, 'scenario not a verb phrase', s[:70]))
        key = norm(s)
        if key in seen_scenario:
            issues.append((cid, 'duplicate scenario', f'same as {seen_scenario[key]}'))
        seen_scenario[key] = cid
        dkey = norm(c['definition'])
        if dkey in seen_definition:
            issues.append((cid, 'duplicate definition', f'same as {seen_definition[dkey]}'))
        seen_definition[dkey] = cid
        options = [c['term']] + list(c['distractors'])
        normed = [norm(o) for o in options]
        if len(set(normed)) != len(normed):
            issues.append((cid, 'repeated option', ' | '.join(options)))
        term_n = norm(c['term'])
        for d in c['distractors']:
            dn = norm(d)
            if dn and term_n and dn != term_n and min(len(dn), len(term_n)) >= 6 and (re.search(r'\b' + re.escape(dn) + r'\b', term_n) or re.search(r'\b' + re.escape(term_n) + r'\b', dn)):
                issues.append((cid, 'distractor overlaps the answer', f'{d!r} vs {c["term"]!r}'))
        if len(c['term']) > 70:
            issues.append((cid, 'term very long', c['term']))
        if len(s.split()) < 5:
            issues.append((cid, 'scenario very short', s))
        if max(len(d) for d in c['distractors']) > 90:
            issues.append((cid, 'distractor very long', max(c['distractors'], key=len)))
    return data, issues


def main(argv):
    strict = '--strict' in argv
    total = 0
    for label, filename, var in TRACKS:
        data, issues = audit_track(label, filename, var)
        issues = [i for i in issues if (i[0], i[1]) not in REVIEWED]
        total += len(issues)
        print(f'{label}: {len(data["concepts"])} concepts, {len(issues)} findings')
        for cid, kind, detail in issues:
            print(f'   {cid:12} {kind}: {detail}')
    print(f'{total} findings in all')
    return 1 if (strict and total) else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
