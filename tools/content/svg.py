"""Concept diagram builders in the app's house style.

Each archetype takes plain text and returns a function render(concept_id, caption) -> '<svg ...>' string, so a
concept can declare its diagram next to its text. Layout is computed here, and every text is measured against
the box it sits in (approximate glyph widths, deliberately generous) so a too-long label fails when the file is
built instead of overflowing on screen. The browser checker in tests/ then verifies the real rendering.

Colors are the app's own CSS tokens (never hex), and text inside tinted boxes is --text so it passes 4.5:1 in
every theme and style. Footers use --muted-2 at 8.5px, left-anchored, exactly like the existing diagrams.
"""
import html

W = 380
MARGIN = 16
CONTENT_W = W - 2 * MARGIN

TONES = {
    'primary': ('var(--primary-soft)', 'var(--primary)'),
    'blue': ('var(--blue-soft)', 'var(--blue)'),
    'amber': ('var(--amber-soft)', 'var(--amber)'),
    'red': ('var(--red-soft)', 'var(--red)'),
    'green': ('var(--green-soft)', 'var(--green)'),
    'violet': ('var(--violet-soft)', 'var(--violet)'),
    'plain': ('var(--surface-3)', 'var(--border)'),
}


def esc(text):
    return html.escape(str(text), quote=False).replace("'", '&#39;')


def width(text, size, bold=False, mono=False):
    """A generous estimate of rendered width in SVG units."""
    per = 0.62 if mono else (0.60 if bold else 0.55)
    return len(str(text)) * size * per


def fit(text, size, limit, bold=False, mono=False, where=''):
    if width(text, size, bold, mono) > limit:
        raise ValueError(f'text too wide ({width(text, size, bold, mono):.0f} > {limit:.0f}) for {where or "a box"}: {text!r}')


def wrap(text, max_chars):
    words, lines, cur = str(text).split(), [], ''
    for word in words:
        if cur and len(cur) + 1 + len(word) > max_chars:
            lines.append(cur)
            cur = word
        else:
            cur = f'{cur} {word}'.strip()
    if cur:
        lines.append(cur)
    return lines


class Canvas:
    def __init__(self):
        self.parts = []
        self.bottom = 0

    def _note(self, y):
        self.bottom = max(self.bottom, y)

    def rect(self, x, y, w, h, tone='plain', sw=1.3, rx=4, dash=None):
        fill, stroke = TONES[tone]
        d = f" stroke-dasharray='{dash}'" if dash else ''
        self.parts.append(f"<rect x='{x:g}' y='{y:g}' width='{w:g}' height='{h:g}' rx='{rx}' fill='{fill}' stroke='{stroke}' stroke-width='{sw}'{d}/>")
        self._note(y + h)

    def bare_rect(self, x, y, w, h, fill, stroke, sw=1.5, rx=0):
        self.parts.append(f"<rect x='{x:g}' y='{y:g}' width='{w:g}' height='{h:g}' rx='{rx}' fill='{fill}' stroke='{stroke}' stroke-width='{sw}'/>")
        self._note(y + h)

    def text(self, x, y, s, size=7.5, fill='var(--text)', anchor='middle', bold=False, mono=False, limit=None, where=''):
        if limit is not None:
            fit(s, size, limit, bold, mono, where)
        attrs = f"x='{x:g}' y='{y:g}' font-size='{size:g}' fill='{fill}' text-anchor='{anchor}'"
        if bold:
            attrs += " font-weight='700'"
        if mono:
            attrs += " font-family='monospace' style='white-space:pre'"
        self.parts.append(f'<text {attrs}>{esc(s)}</text>')
        self._note(y + 2)

    def line(self, x1, y1, x2, y2, stroke='var(--border)', sw=1.3, dash=None):
        d = f" stroke-dasharray='{dash}'" if dash else ''
        self.parts.append(f"<line x1='{x1:g}' y1='{y1:g}' x2='{x2:g}' y2='{y2:g}' stroke='{stroke}' stroke-width='{sw}'{d}/>")
        self._note(max(y1, y2))

    def arrow(self, x1, y, x2, stroke='var(--muted)'):
        """Horizontal arrow from x1 to x2 at height y."""
        direction = 1 if x2 >= x1 else -1
        self.line(x1, y, x2, y, stroke)
        self.parts.append(f"<path d='M{x2 - 4 * direction:g} {y - 3:g} L{x2:g} {y:g} L{x2 - 4 * direction:g} {y + 3:g}' fill='none' stroke='{stroke}' stroke-width='1.3'/>")

    def down_arrow(self, x, y1, y2, stroke='var(--muted)'):
        self.line(x, y1, x, y2, stroke)
        self.parts.append(f"<path d='M{x - 3:g} {y2 - 4:g} L{x:g} {y2:g} L{x + 3:g} {y2 - 4:g}' fill='none' stroke='{stroke}' stroke-width='1.3'/>")
        self._note(y2)

    def box(self, x, y, w, h, lines, tone='primary', size=7.3, sub_size=6.4, heading=True):
        """A tinted box with centered text: the first line bold, the rest muted."""
        self.rect(x, y, w, h, tone)
        n = len(lines)
        line_h = size + 3.4
        top = y + (h - (n * line_h - 3.4)) / 2 + size * 0.82
        for i, line in enumerate(lines):
            first = i == 0 and heading
            self.text(x + w / 2, top + i * line_h, line, size if first or not heading else sub_size, 'var(--text)' if first or not heading else 'var(--muted)',
                      bold=first, limit=w - 8, where=f'box {lines[0]!r}')

    def render(self, concept_id, caption, title=None):
        body_end = self.bottom
        lines = wrap(caption, 72)
        if len(lines) > 2:
            raise ValueError(f'caption too long ({len(lines)} lines): {caption!r}')
        footer_y = body_end + 24
        footer = ''.join(f"<text x='{MARGIN}' y='{footer_y + 12 * i:g}' font-size='8.5' fill='var(--muted-2)' text-anchor='start'>{esc(line)}</text>" for i, line in enumerate(lines))
        height = footer_y + 12 * (len(lines) - 1) + 12
        cap = esc(caption)
        return (f"<svg viewBox='0 0 {W} {height:g}' xmlns='http://www.w3.org/2000/svg' role='img' aria-labelledby='dt-{concept_id}'>"
                f"<title id='dt-{concept_id}'>{cap}</title>{''.join(self.parts)}{footer}</svg>")


# ------------------------------------------------------------------------------------------- archetypes
def _heading(c, title):
    if title:
        c.text(W / 2, 18, title, 8, 'var(--text)', bold=True, limit=CONTENT_W, where='title')
        return 30
    return 14


def steps(items, title=None, tones=None, box_h=46):
    """2-5 boxes in a row joined by arrows. items: (heading, detail) or (heading,)."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        n = len(items)
        gap = 16
        bw = (CONTENT_W - gap * (n - 1)) / n
        for i, item in enumerate(items):
            x = MARGIN + i * (bw + gap)
            tone = (tones or ['primary'] * n)[i]
            c.box(x, y, bw, box_h, list(item), tone)
            if i < n - 1:
                c.arrow(x + bw + 2, y + box_h / 2, x + bw + gap - 2)
        return c.render(concept_id, caption)
    return build


def compare(left, right, title=None, tones=('blue', 'amber')):
    """Two columns. left/right: (heading, [row, row, ...]) with up to 5 short rows each."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        colw = (CONTENT_W - 12) / 2
        for k, (head, rows) in enumerate((left, right)):
            x = MARGIN + k * (colw + 12)
            c.rect(x, y, colw, 20, tones[k])
            c.text(x + colw / 2, y + 13.5, head, 8, 'var(--text)', bold=True, limit=colw - 8, where='column heading')
            for i, row in enumerate(rows):
                ry = y + 24 + i * 22
                c.rect(x, ry, colw, 19, 'plain', 1.1)
                c.text(x + colw / 2, ry + 12.5, row, 7, 'var(--text)', limit=colw - 8, where=f'row {row!r}')
        return c.render(concept_id, caption)
    return build


def terminal(lines, title='Command Prompt', prompt_first=True):
    """A command window with monospace output; the first line is drawn as the typed command."""
    def build(concept_id, caption):
        c = Canvas()
        c.bare_rect(MARGIN, 16, CONTENT_W, 20, 'var(--surface-3)', 'var(--border)', 1.5, 4)
        for i, color in enumerate(('var(--red)', 'var(--amber)', 'var(--green)')):
            c.parts.append(f"<circle cx='{28 + 10 * i}' cy='26' r='3' fill='{color}'/>")
        c.text(W / 2, 30, title, 7, 'var(--muted)', limit=CONTENT_W - 100, where='terminal title')
        body_h = 16 + 14 * len(lines)
        c.bare_rect(MARGIN, 36, CONTENT_W, body_h, 'var(--surface-2)', 'var(--border)', 1.5)
        for i, line in enumerate(lines):
            first = prompt_first and i == 0
            fill = 'var(--primary)' if first else 'var(--text)'
            c.text(28, 54 + 14 * i, line, 7.5 if not first else 8, fill, 'start', mono=True, limit=CONTENT_W - 24, where=f'terminal line {line!r}')
        return c.render(concept_id, caption)
    return build


def hub(center, spokes, title=None, tones=None, center_tone='primary'):
    """One central idea over up to six related boxes in rows of three. spokes: (heading, detail?)."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        cw = 150
        c.box(W / 2 - cw / 2, y, cw, 34, list(center), center_tone, size=8)
        per_row = 3 if len(spokes) > 4 else len(spokes)
        gap = 12
        sw = (CONTENT_W - gap * (per_row - 1)) / per_row
        rows = [spokes[i:i + per_row] for i in range(0, len(spokes), per_row)]
        row_y = y + 34 + 22
        for r, row in enumerate(rows):
            total = len(row) * sw + (len(row) - 1) * gap
            x0 = (W - total) / 2
            for i, item in enumerate(row):
                x = x0 + i * (sw + gap)
                c.line(W / 2, y + 34, x + sw / 2, row_y + r * 52 - 0.5, 'var(--border)', 1.2)
                c.box(x, row_y + r * 52, sw, 40, list(item), (tones or ['plain'] * len(spokes))[r * per_row + i])
        return c.render(concept_id, caption)
    return build


def table(headers, rows, title=None, col_widths=None, tone='primary'):
    """A small grid. col_widths are fractions summing to 1; cell text must fit its column."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        n = len(headers)
        fracs = col_widths or [1 / n] * n
        xs = [MARGIN]
        for f in fracs[:-1]:
            xs.append(xs[-1] + f * CONTENT_W)
        widths = [f * CONTENT_W for f in fracs]
        for i, head in enumerate(headers):
            c.rect(xs[i], y, widths[i], 20, tone, 1.2, rx=0)
            c.text(xs[i] + widths[i] / 2, y + 13.5, head, 7.5, 'var(--text)', bold=True, limit=widths[i] - 6, where=f'header {head!r}')
        for r, row in enumerate(rows):
            ry = y + 20 + r * 20
            for i, cell in enumerate(row):
                c.rect(xs[i], ry, widths[i], 20, 'plain', 1.0, rx=0)
                c.text(xs[i] + widths[i] / 2, ry + 13.2, cell, 7, 'var(--text)', limit=widths[i] - 6, where=f'cell {cell!r}')
        return c.render(concept_id, caption)
    return build


def layers(items, title=None):
    """A vertical stack of full-width bars: (label, description, tone)."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        label_w = 104
        for i, (label, desc, tone) in enumerate(items):
            ry = y + i * 26
            c.rect(MARGIN, ry, label_w, 22, tone, 1.3)
            c.text(MARGIN + label_w / 2, ry + 14.5, label, 7.3, 'var(--text)', bold=True, limit=label_w - 6, where=f'layer {label!r}')
            c.rect(MARGIN + label_w + 6, ry, CONTENT_W - label_w - 6, 22, 'plain', 1.1)
            c.text(MARGIN + label_w + 6 + 8, ry + 14.5, desc, 7, 'var(--text)', 'start', limit=CONTENT_W - label_w - 6 - 14, where=f'layer text {desc!r}')
        return c.render(concept_id, caption)
    return build


def facts(rows, title=None, tone='blue'):
    """Key/value rows: a tinted key chip on the left, the value on the right."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        key_w = 96
        for i, (key, value) in enumerate(rows):
            ry = y + i * 24
            c.rect(MARGIN, ry, key_w, 20, tone, 1.2)
            c.text(MARGIN + key_w / 2, ry + 13.5, key, 7.3, 'var(--text)', bold=True, limit=key_w - 6, where=f'key {key!r}')
            c.text(MARGIN + key_w + 10, ry + 13.5, value, 7.3, 'var(--text)', 'start', limit=CONTENT_W - key_w - 12, where=f'value {value!r}')
        return c.render(concept_id, caption)
    return build


def flow_split(start, branches, title=None, start_tone='primary', tones=None):
    """One box at the top that splits to 2-3 outcomes below. branches: (heading, detail?)."""
    def build(concept_id, caption):
        c = Canvas()
        y = _heading(c, title)
        sw = 170
        c.box(W / 2 - sw / 2, y, sw, 34, list(start), start_tone, size=7.8)
        n = len(branches)
        gap = 12
        bw = (CONTENT_W - gap * (n - 1)) / n
        by = y + 34 + 24
        for i, branch in enumerate(branches):
            x = MARGIN + i * (bw + gap)
            c.line(W / 2, y + 34, x + bw / 2, by, 'var(--border)', 1.2)
            c.box(x, by, bw, 44, list(branch), (tones or ['plain'] * n)[i])
        return c.render(concept_id, caption)
    return build
