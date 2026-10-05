"""Text-level edits to the content data files (no whole-file re-serialization, so diffs stay small).

The data files are hand-formatted JSON wrapped in `(function () { ... window.X = <json>; })();`, and their
formatting is not uniform, so each helper locates what it needs by scanning the raw text.
"""
import json
import re

CLOSE = '\n  ]\n};\n})();'


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        text = f.read()
    assert '\r\n' not in text, f'{path} has CRLF line endings'
    return text


def write(path, text):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(text)


def parse_data(text, var):
    """The JSON value assigned to window.<var> (an object or an array)."""
    start = text.index(f'window.{var}')
    at = text.index('=', start) + 1
    while text[at] in ' \n':
        at += 1
    value, _ = json.JSONDecoder().raw_decode(text, at)
    return value


def _indent(block, spaces):
    pad = ' ' * spaces
    return '\n'.join(pad + line if line else line for line in block.split('\n'))


def concept_text(concept):
    """A concept as it appears in the data files: 4-space-indented, one key per line."""
    return _indent(json.dumps(concept, indent=2, ensure_ascii=False), 4)


def remove_concepts(text, ids):
    """Removes the concepts with these ids (used to regenerate a batch idempotently)."""
    for concept_id in ids:
        marker = '    {\n      "id": "%s",' % concept_id
        at = text.find(marker)
        if at == -1:
            continue
        end = text.index('\n    }', at) + len('\n    }')
        before = text[:at].rstrip()
        if text[end:end + 1] == ',':          # not the last concept: drop its trailing comma
            end += 1
            text = text[:at] + text[end:].lstrip('\n')
        else:                                    # the last one: drop the comma that joins it to the previous
            assert before.endswith(','), concept_id
            text = before[:-1] + text[end:]
    return text


def _block_end(text, concept_id):
    marker = '    {\n      "id": "%s",' % concept_id
    at = text.index(marker)
    return _matching(text, at + 4, '{', '}')


def insert_concepts(text, pristine, new):
    """Inserts each new concept after the last existing concept of its objective (or of its domain, for a new
    objective), so the data stays grouped. `pristine` is the parsed concept list WITHOUT the new ones."""
    def order(c):
        return (c['domain'], [int(part) for part in c['objective'].split('.')])
    last_obj, last_domain = {}, {}
    for c in pristine:
        last_obj[(c['domain'], c['objective'])] = c['id']
        last_domain[c['domain']] = c['id']
    groups = {}
    for c in sorted(new, key=order):
        anchor = last_obj.get((c['domain'], c['objective']), last_domain[c['domain']])
        groups.setdefault(anchor, []).append(c)
    for anchor, items in groups.items():
        end = _block_end(text, anchor)
        text = text[:end] + ',\n' + ',\n'.join(concept_text(c) for c in items) + text[end:]
    return text


def _skip_string(text, i):
    assert text[i] == '"'
    i += 1
    while text[i] != '"':
        i += 2 if text[i] == '\\' else 1
    return i + 1


def _matching(text, i, open_ch, close_ch):
    """Index just past the bracket that closes the one at text[i]."""
    depth = 0
    while True:
        ch = text[i]
        if ch == '"':
            i = _skip_string(text, i)
            continue
        if ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1


def _domain_span(text, domain_id, key):
    """(start, end) of the array value of `key` ('objectives' or 'sections') inside the object that has this domain id."""
    anchor = text.index(f'"id": "{domain_id}"') if key == 'objectives' else text.index(f'"domain": "{domain_id}"')
    k = text.index(f'"{key}": [', anchor)
    arr = text.index('[', k)
    return arr, _matching(text, arr, '[', ']')


def remove_objectives(text, domain_id, codes):
    for code in codes:
        arr, end = _domain_span(text, domain_id, 'objectives')
        m = re.search(r'\n( *)\{ *\n? *"code": "' + re.escape(code) + '"', text[arr:end])
        if not m:
            continue
        start = arr + m.start()
        obj_end = _matching(text, text.index('{', start), '{', '}')
        # remove with its leading comma
        lead = text[:start].rstrip()
        if lead.endswith(','):
            start = len(lead) - 1
        text = text[:start] + text[obj_end:]
    return text


def add_objectives(text, domain_id, objectives):
    arr, end = _domain_span(text, domain_id, 'objectives')
    inner = text[arr:end]
    sample = re.search(r'\n( *)\{', inner)
    base = len(sample.group(1)) if sample else 14
    body = ',\n'.join(_indent(json.dumps(o, indent=2, ensure_ascii=False), base) for o in objectives)
    last = text.rindex(']', arr, end)
    before = text[:last].rstrip()
    return before + ',\n' + body + '\n' + ' ' * (base - 2) + text[last:]


def set_topics(text, domain_id, code, topics):
    """Replaces the topics list of an existing objective."""
    arr, end = _domain_span(text, domain_id, 'objectives')
    m = re.search(r'"code": "' + re.escape(code) + '"', text[arr:end])
    assert m, f'objective {domain_id} {code} not found'
    at = arr + m.start()
    t0 = text.index('"topics": [', at)
    open_at = text.index('[', t0)
    close_at = _matching(text, open_at, '[', ']')
    old = text[open_at:close_at]
    multiline = '\n' in old
    if multiline:
        indent = re.search(r'\n( *)"', old).group(1)
        new = '[\n' + ',\n'.join(f'{indent}{json.dumps(t, ensure_ascii=False)}' for t in topics) + '\n' + indent[:-2] + ']'
    else:
        new = '[' + ', '.join(json.dumps(t, ensure_ascii=False) for t in topics) + ']'
    return text[:open_at] + new + text[close_at:]


def add_guide_sections(text, domain_id, sections):
    """Appends sections to a guide chapter (`"domain": "<id>"`)."""
    arr, end = _domain_span(text, domain_id, 'sections')
    last = text.rindex(']', arr, end)
    body = ',\n'.join(_indent(json.dumps(s, indent=2, ensure_ascii=False), 6) for s in sections)
    before = text[:last].rstrip()
    return before + ',\n' + body + '\n    ' + text[last:]


def remove_guide_sections(text, domain_id, headings):
    for heading in headings:
        arr, end = _domain_span(text, domain_id, 'sections')
        m = re.search(r'\n( *)\{\s*\n\s*"heading": ' + re.escape(json.dumps(heading, ensure_ascii=False)), text[arr:end])
        if not m:
            continue
        start = arr + m.start()
        obj_end = _matching(text, text.index('{', start), '{', '}')
        lead = text[:start].rstrip()
        if lead.endswith(','):
            start = len(lead) - 1
        text = text[:start] + text[obj_end:]
    return text
