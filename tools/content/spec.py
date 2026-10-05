"""A small authoring layer: declare concepts next to their diagrams, get ids and full data dicts back."""
import re

import svg

# First free number per objective in the shipped Core 2 data (ids are c2dN-<code without dot>-<n>).
START = {
    '1.1': 6, '1.2': 7, '1.3': 9, '1.4': 7, '1.5': 7, '1.6': 8,
    '2.1': 7, '2.2': 9, '2.3': 7, '2.4': 7, '2.5': 7, '2.6': 7,
    '3.1': 7, '3.2': 7, '3.3': 7, '3.4': 7,
    '4.1': 7, '4.2': 7, '4.3': 7, '4.4': 7, '4.5': 7, '4.6': 7, '4.7': 7,
}


class Batch:
    def __init__(self, domain, lenient=False, core='core2', start=None):
        self.core = core
        self.start = start              # objective code -> first free number; defaults to the A+ Core 2 table
        self.lenient = lenient          # collect diagram errors instead of raising (for authoring runs)
        self.errors = []
        self.domain = domain            # 'c2d1'
        self.concepts = []
        self.counters = {}
        self.objectives = []            # new objective objects
        self.topics = {}                # code -> replacement topic list for an existing objective
        self.guide = []                 # new guide sections

    def objective(self, code, title, topics):
        self.objectives.append({'code': code, 'title': title, 'topics': topics})
        self.counters.setdefault(code, 1)

    def add(self, obj, term, definition, scenario, distractors, tip, diagram, caption=None):
        n = self.counters.get(obj, (self.start or START).get(obj, 1))
        self.counters[obj] = n + 1
        cid = f"{self.domain}-{obj.replace('.', '')}-{n}"
        if len(distractors) != 3:
            raise ValueError(f'{cid} {term!r}: need exactly three distractors')
        if caption is None:
            first = re.split(r'(?<=[.!?])\s', definition)[0]
            caption = first if len(first) <= 140 else None
        if caption is None:
            raise ValueError(f'{cid} {term!r}: definition too long for a caption; pass caption=')
        try:
            svg_text = diagram(cid, caption)
        except ValueError as error:
            if not self.lenient:
                raise
            self.errors.append(f'{cid} {term}: {error}')
            svg_text = ''
        self.concepts.append({
            'id': cid, 'core': self.core, 'domain': self.domain, 'objective': obj, 'term': term,
            'definition': definition, 'scenario': scenario, 'distractors': list(distractors), 'tip': tip,
            'diagram': svg_text,
        })
        return cid

    def section(self, heading, objectives, body):
        self.guide.append({'heading': heading, 'objectives': objectives, 'body': body})
