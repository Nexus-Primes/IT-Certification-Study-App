"""Authoring helpers, validation, and text-level injection for the *-labs.js files.

A lab is a plain dict. The constructors below fill in the boilerplate keys and check the type-specific structure, so a
mistake (a decision whose answer index is out of range, a scenario branch that leads nowhere) fails at build time.
The injector appends lab objects to the end of the array and removes its own earlier output, leaving the hand-written
labs untouched; it keeps whatever line endings the file already uses.
"""
import json
import re

from inject import _matching, parse_data


# ------------------------------------------------------------------------------------------ constructors
def _base(lab_id, core, domain, kind, difficulty, minutes, title, summary, brief, explanation):
    return {'id': lab_id, 'core': core, 'domain': domain, 'type': kind, 'difficulty': difficulty, 'minutes': minutes,
            'title': title, 'summary': summary, 'brief': brief, 'explanation': explanation}


def sequence(lab_id, core, domain, difficulty, minutes, title, summary, brief, steps, explanation):
    lab = _base(lab_id, core, domain, 'sequence', difficulty, minutes, title, summary, brief, explanation)
    lab['steps'] = steps
    return lab


def decision(lab_id, core, domain, difficulty, minutes, title, summary, brief, stages, explanation):
    """stages: [(question, [options], correct_index, feedback), ...]"""
    lab = _base(lab_id, core, domain, 'decision', difficulty, minutes, title, summary, brief, explanation)
    lab['stages'] = [{'question': q, 'options': options, 'correct': correct, 'feedback': feedback} for q, options, correct, feedback in stages]
    return lab


def spread_answers(lab):
    """Rotates each decision stage's options by a fixed, id-based amount so the right answer is not always first.
    Deterministic, so rebuilding gives the same labs."""
    if lab['type'] == 'decision':
        for i, stage in enumerate(lab['stages']):
            n = len(stage['options'])
            shift = (sum(ord(ch) for ch in lab['id']) + i * 3) % n
            if shift:
                stage['options'] = stage['options'][shift:] + stage['options'][:shift]
                stage['correct'] = (stage['correct'] - shift) % n
    return lab


def terminal(lab_id, core, domain, difficulty, minutes, title, summary, brief, steps, commands, explanation):
    """steps: [(prompt, [accepted commands], output, hint), ...]; commands: [(cmd, description), ...]"""
    lab = _base(lab_id, core, domain, 'terminal', difficulty, minutes, title, summary, brief, explanation)
    lab['terminal'] = [{'prompt': p, 'accepts': accepts, 'output': out, 'hint': hint} for p, accepts, out, hint in steps]
    lab['commands'] = [{'cmd': cmd, 'desc': desc} for cmd, desc in commands]
    return lab


def scenario(lab_id, core, domain, difficulty, minutes, title, summary, brief, ticket, nodes, explanation, start='start'):
    """ticket: (subject, [detail lines]); nodes: {id: (prompt, [(label, next, correct), ...])} or {id: ('END', success, prompt)}"""
    lab = _base(lab_id, core, domain, 'scenario', difficulty, minutes, title, summary, brief, explanation)
    lab['ticket'] = {'subject': ticket[0], 'details': ticket[1]}
    lab['startNode'] = start
    built = {}
    for node_id, node in nodes.items():
        if node[0] == 'END':
            built[node_id] = {'end': True, 'success': node[1], 'prompt': node[2]}
        else:
            prompt, options = node
            built[node_id] = {'prompt': prompt, 'options': [{'label': label, 'next': nxt, 'correct': correct} for label, nxt, correct in options]}
    lab['nodes'] = built
    return lab


# ------------------------------------------------------------------------------------------ validation
def validate_lab(lab, domain_ids):
    problems = []
    where = lab.get('id', '?')
    for key in ('id', 'core', 'domain', 'type', 'difficulty', 'minutes', 'title', 'summary', 'brief', 'explanation'):
        if not lab.get(key):
            problems.append(f'{where}: missing {key}')
    if lab.get('domain') not in domain_ids:
        problems.append(f'{where}: unknown domain {lab.get("domain")}')
    kind = lab.get('type')
    if kind == 'sequence':
        steps = lab.get('steps') or []
        if len(steps) < 3 or len(set(steps)) != len(steps):
            problems.append(f'{where}: a sequence needs three or more distinct steps')
    elif kind == 'decision':
        stages = lab.get('stages') or []
        if not stages:
            problems.append(f'{where}: no stages')
        for i, stage in enumerate(stages):
            options = stage.get('options') or []
            if len(options) < 3 or len(set(options)) != len(options):
                problems.append(f'{where}: stage {i + 1} needs three or more distinct options')
            if not isinstance(stage.get('correct'), int) or not 0 <= stage['correct'] < len(options):
                problems.append(f'{where}: stage {i + 1} has an out-of-range answer')
            if not stage.get('feedback') or not stage.get('question'):
                problems.append(f'{where}: stage {i + 1} lacks a question or feedback')
    elif kind == 'terminal':
        steps = lab.get('terminal') or []
        if not steps:
            problems.append(f'{where}: a terminal lab needs steps')
        for i, step in enumerate(steps):
            if not step.get('accepts') or not all(isinstance(a, str) and a.strip() for a in step['accepts']):
                problems.append(f'{where}: step {i + 1} accepts nothing')
            if not step.get('prompt') or not step.get('hint') or 'output' not in step:
                problems.append(f'{where}: step {i + 1} lacks a prompt, hint, or output')
    elif kind == 'scenario':
        nodes = lab.get('nodes') or {}
        if lab.get('startNode') not in nodes:
            problems.append(f'{where}: the start node does not exist')
        ends_good = False
        for node_id, node in nodes.items():
            if node.get('end'):
                ends_good = ends_good or bool(node.get('success'))
                continue
            options = node.get('options') or []
            if len(options) < 2 or not any(o.get('correct') for o in options):
                problems.append(f'{where}: node {node_id} needs two or more options and a correct one')
            for option in options:
                if option.get('next') not in nodes:
                    problems.append(f'{where}: node {node_id} leads to a missing node {option.get("next")}')
        if not ends_good:
            problems.append(f'{where}: no successful ending')
    elif kind not in ('gui', 'visual'):
        problems.append(f'{where}: unknown type {kind}')
    return problems


# ------------------------------------------------------------------------------------------ injection
def lab_text(lab):
    return '\n'.join('  ' + line if line else line for line in json.dumps(lab, indent=2, ensure_ascii=False).split('\n'))


def read_labs(path):
    """(text with LF endings, whether the file used CRLF)."""
    raw = open(path, encoding='utf-8', newline='').read()
    return raw.replace('\r\n', '\n'), '\r\n' in raw


def write_labs(path, text, crlf):
    open(path, 'w', encoding='utf-8', newline='').write(text.replace('\n', '\r\n') if crlf else text)


def remove_labs(text, ids):
    for lab_id in ids:
        match = re.search(r'\n {2}\{\n {4}"id": "%s",' % re.escape(lab_id), text)
        if not match:
            continue
        start = match.start()
        end = _matching(text, text.index('{', start), '{', '}')
        lead = text[:start].rstrip()
        if lead.endswith(','):
            start = len(lead) - 1
        elif text[end:end + 1] == ',':
            end += 1
        text = text[:start] + text[end:]
    return text


def append_labs(text, labs):
    idx = text.rindex('];\n})();')
    line_start = text.rfind('\n', 0, idx) + 1
    indent = text[line_start:idx]
    before = text[:line_start].rstrip()
    return before + ',\n' + ',\n'.join(lab_text(lab) for lab in labs) + '\n' + indent + text[idx:]


def parse_labs(text, var):
    return parse_data(text, var)
