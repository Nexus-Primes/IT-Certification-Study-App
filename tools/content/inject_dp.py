"""Text-level edits for data/dp300.js and data/dp300-guide.js.

These files are laid out differently from the A+ ones (one concept per line, one objective per line, guide
sections with inline objective lists), so they get their own helpers. As elsewhere, nothing is re-serialized:
only the lines being added or removed change.
"""
import json
import re

from inject import _matching, parse_data, read, write  # noqa: F401  (re-exported for the build script)

DUMP = dict(ensure_ascii=False)


# ------------------------------------------------------------------------------------------ concepts (one per line)
def concept_line(concept):
    return '    { ' + json.dumps(concept, **DUMP)[1:-1] + ' }'


def _concept_prefix(concept_id):
    return '    { "id": "%s",' % concept_id


def remove_concepts(text, ids):
    lines = text.split('\n')
    for concept_id in ids:
        prefix = _concept_prefix(concept_id)
        at = next((i for i, line in enumerate(lines) if line.startswith(prefix)), None)
        if at is None:
            continue
        if not lines[at].rstrip().endswith(','):             # it was the last concept: the previous line loses its comma
            assert lines[at - 1].rstrip().endswith('},'), concept_id
            lines[at - 1] = lines[at - 1].rstrip()[:-1]
        del lines[at]
    return '\n'.join(lines)


def insert_concepts(text, pristine, new):
    """Each new concept goes after the last existing one of its objective; a new objective or domain goes after
    the last concept of its domain (or, for a brand-new domain, the last concept of all)."""
    def order(c):
        return (c['domain'], [int(part) for part in c['objective'].split('.')])
    last_obj, last_domain = {}, {}
    for c in pristine:
        last_obj[(c['domain'], c['objective'])] = c['id']
        last_domain[c['domain']] = c['id']
    last_all = pristine[-1]['id']
    groups = {}
    for c in sorted(new, key=order):
        anchor = last_obj.get((c['domain'], c['objective'])) or last_domain.get(c['domain']) or last_all
        groups.setdefault(anchor, []).append(c)
    lines = text.split('\n')
    for anchor, items in groups.items():
        prefix = _concept_prefix(anchor)
        at = next(i for i, line in enumerate(lines) if line.startswith(prefix))
        block = [concept_line(c) + ',' for c in items]
        if not lines[at].rstrip().endswith(','):             # the anchor was the last line of the array
            lines[at] = lines[at].rstrip() + ','
            block[-1] = block[-1][:-1]
        lines[at + 1:at + 1] = block
    return '\n'.join(lines)


# ------------------------------------------------------------------------------------------ domains and objectives
def _span(text, start, key):
    """(open, close) of the first `"key": [` array at or after `start`."""
    k = text.index('"%s": [' % key, start)
    arr = text.index('[', k)
    return arr, _matching(text, arr, '[', ']')


def _domain_at(text, domain_id):
    return text.index('"id": "%s", "number"' % domain_id)


def set_weight(text, domain_id, weight):
    pattern = re.compile(r'("id": "%s", "number": "[\d.]+", "name": "[^"]+", "weight": )\d+' % domain_id)
    assert pattern.search(text), domain_id
    return pattern.sub(lambda m: m.group(1) + str(weight), text, 1)


def objective_line(o):
    return '              { "code": %s, "title": %s, "topics": %s }' % (json.dumps(o['code']), json.dumps(o['title'], **DUMP), json.dumps(o['topics'], **DUMP))


def add_objectives(text, domain_id, objectives):
    arr, end = _span(text, _domain_at(text, domain_id), 'objectives')
    last = end - 1                                           # the closing bracket
    before = text[:last].rstrip()
    return before + ',\n' + ',\n'.join(objective_line(o) for o in objectives) + '\n            ' + text[last:]


def remove_objectives(text, domain_id, codes):
    for code in codes:
        arr, end = _span(text, _domain_at(text, domain_id), 'objectives')
        marker = '{ "code": "%s",' % code
        at = text.find(marker, arr, end)
        if at == -1:
            continue
        line_start = text.rindex('\n', 0, at)
        line_end = text.index('\n', at)
        lead = text[:line_start].rstrip()
        if text[line_end - 1] == ',':                         # not the last: drop its trailing comma with it
            text = text[:line_start] + text[line_end:]
        else:                                                  # the last: drop the comma on the line before
            assert lead.endswith(','), code
            text = lead[:-1] + text[line_end:]
    return text


def set_topics(text, domain_id, code, topics):
    arr, end = _span(text, _domain_at(text, domain_id), 'objectives')
    marker = '{ "code": "%s",' % code
    at = text.index(marker, arr, end)
    line_end = text.index('\n', at)
    line = text[at:line_end]
    new = re.sub(r'"topics": \[[^\]]*\]', lambda m: '"topics": ' + json.dumps(topics, **DUMP), line, 1)
    return text[:at] + new + text[line_end:]


def domain_text(d):
    head = '            "id": %s, "number": %s, "name": %s, "weight": %d, "color": %s,' % (
        json.dumps(d['id']), json.dumps(d['number']), json.dumps(d['name'], **DUMP), d['weight'], json.dumps(d['color']))
    objectives = ',\n'.join(objective_line(o) for o in d['objectives'])
    return '          {\n%s\n            "objectives": [\n%s\n            ]\n          }' % (head, objectives)


def add_domain(text, domain):
    arr, end = _span(text, text.index('"domains": ['), 'domains')
    last = end - 1
    before = text[:last].rstrip()
    return before + ',\n' + domain_text(domain) + '\n        ' + text[last:]


def remove_domain(text, domain_id):
    match = re.search(r'\n( *)\{\n *"id": "%s", "number"' % domain_id, text)
    if not match:
        return text
    start = match.start()
    end = _matching(text, text.index('{', start), '{', '}')
    lead = text[:start].rstrip()
    if lead.endswith(','):
        start = len(lead) - 1
    return text[:start] + text[end:]


# ------------------------------------------------------------------------------------------ study guide
def section_text(s):
    return '      {\n        "heading": %s,\n        "objectives": %s,\n        "body": %s\n      }' % (
        json.dumps(s['heading'], **DUMP), json.dumps(s['objectives']), json.dumps(s['body'], **DUMP))


def _chapter_span(text, domain_id):
    return _span(text, text.index('"domain": "%s"' % domain_id), 'sections')


def add_guide_sections(text, domain_id, sections):
    arr, end = _chapter_span(text, domain_id)
    last = end - 1
    before = text[:last].rstrip()
    return before + ',\n' + ',\n'.join(section_text(s) for s in sections) + '\n    ' + text[last:]


def remove_guide_sections(text, domain_id, headings):
    for heading in headings:
        arr, end = _chapter_span(text, domain_id)
        match = re.search(r'\n {6}\{\n {8}"heading": %s,' % re.escape(json.dumps(heading, **DUMP)), text[arr:end])
        if not match:
            continue
        start = arr + match.start()
        obj_end = _matching(text, text.index('{', start), '{', '}')
        lead = text[:start].rstrip()
        if lead.endswith(','):
            start = len(lead) - 1
        text = text[:start] + text[obj_end:]
    return text


def chapter_text(chapter):
    sections = ',\n'.join(section_text(s) for s in chapter['sections'])
    return '  {\n    "domain": %s,\n    "overview": %s,\n    "sections": [\n%s\n    ]\n  }' % (
        json.dumps(chapter['domain']), json.dumps(chapter['overview'], **DUMP), sections)


def add_guide_chapter(text, chapter):
    at = text.rindex('\n  ];')
    return text[:at] + ',\n' + chapter_text(chapter) + text[at:]


def remove_guide_chapter(text, domain_id):
    match = re.search(r'\n {2}\{\n {4}"domain": "%s",' % domain_id, text)
    if not match:
        return text
    start = match.start()
    end = _matching(text, text.index('{', start), '{', '}')
    lead = text[:start].rstrip()
    if lead.endswith(','):
        start = len(lead) - 1
    return text[:start] + text[end:]
