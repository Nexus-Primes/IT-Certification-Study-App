"""3CX Advanced, domain a1 (Advanced Call Routing & Flow Designer): caller ID rules, E.164 processing, Boss-Secretary, forwarding priority, and holiday scripting.

Checked against the 3CX administrator manual (advanced system features, create users, call recording, and office hours pages, 2026).
"""
import svg as S

DOMAIN = 'a1'


def build(b):
    b.topics['1.1'] = ['Call flow designer', 'Time-based branches', 'Building blocks', 'Testing a flow', 'Holiday call flow script']
    b.topics['1.2'] = ['CRM/database lookup', 'Conditional branching', 'Recording triggers', 'Webhook actions', 'Custom hold treatment', 'Caller ID rules', 'E.164 processing', 'Boss-Secretary', 'Forwarding priority']

    # ------------------------------------------------------------------------------------------ 1.1
    b.add('1.1', 'Holiday Call Flow Script',
          'A script that remains available for advanced holiday cases the holiday routing settings cannot express, such as custom logic for DIDs routed to users, ending a call after a prompt, or excluding specific DIDs.',
          'end the call right after a closure prompt for a number that is routed directly to a user on a public holiday',
          ['Custom holiday messages', 'Break hours routing', 'Special/holiday days'],
          'The ADVANCED fallback — ordinary closures use the custom holiday messages in holiday routing.',
          S.flow_split(('Holiday handling needed', 'which tool fits?'), [('Simple closure message', 'custom holiday message'), ('Special logic needed', 'Holiday Call Flow Script')], title='Choosing a holiday tool', tones=['green', 'amber']),
          caption='The Holiday Call Flow Script handles advanced holiday cases that routing settings cannot.')

    # ------------------------------------------------------------------------------------------ 1.2
    b.add('1.2', 'CID rules',
          'Inbound rules in Admin > Advanced > CID Rules that match the caller\'s number, either exactly or with a * wildcard before or after digits, and send those calls to a destination for a chosen trunk; rules can be imported from a CSV file.',
          'send calls from a VIP customer\'s known numbers straight to a dedicated account manager',
          ['Caller ID blacklist', 'Conditional branching by caller input', 'Time-based conditional routing'],
          'Matches the CALLER\'s number (exact or with * wildcards) — not the DID that was dialed.',
          S.table(['Caller ID pattern', 'Matches'], [('+971 52 914 89 63', 'that exact number'), ('+971*', 'all numbers starting +971'), ('*559*', 'any number containing 559')], title='CID rule patterns', col_widths=[0.45, 0.55]),
          caption='A CID rule matches the caller\'s number exactly or with wildcards and routes the call.')

    b.add('1.2', 'Caller ID blacklist',
          'A list of caller numbers whose calls are not answered and do not ring; leaving a telemarketer\'s call unanswered is more likely to make them move on than rejecting it.',
          'stop a persistent telemarketer\'s calls from ringing at the company at all',
          ['Blacklist / failed authentication protection', 'Do Not Disturb (DND)', 'CID rules'],
          'Blocks by CALLER number and gives NO answer — not the same as the IP blacklist.',
          S.compare(('Caller ID blacklist', ['Matches the caller\'s number', 'Call is not answered', 'Stops nuisance callers']), ('IP blacklist', ['Matches an IP address', 'Traffic is blocked', 'Stops attacks']), title='Two blacklists'),
          caption='The caller ID blacklist leaves listed callers unanswered; the IP blacklist blocks addresses.')

    b.add('1.2', 'E.164 number processing',
          'Rules in Admin > Advanced > E164 that convert numbers dialed with a leading + into the form the outbound rules and provider accept, using the home country, area code, national code, international dial code, and an optional prefix.',
          'make contacts stored with a leading plus sign dial correctly through a provider that rejects the plus sign',
          ['Strip digits and prepend', 'Dial pattern matching', 'Allowed country codes'],
          'Converts E.164 (+) numbers BEFORE outbound rules see them — country, area code, and prefixes.',
          S.table(['Dialed (+ format)', 'Becomes'], [('+12345678910, same country', '2345678910'), ('+44123456789, from the US', '01144123456789'), ('+181345678910, area code 813', '45678910')], title='E.164 examples', col_widths=[0.6, 0.4]),
          caption='E.164 processing rewrites numbers dialed with a plus sign for the outbound rules and provider.')

    b.add('1.2', 'Boss-Secretary',
          'A per-user call forwarding mode in which a chosen secretary, PA, or AI personal assistant screens an executive\'s internal, external, or all calls during set hours, while Allowed Direct Callers still reach the boss directly.',
          'have an assistant screen an executive\'s calls during the day while a few VIPs can still ring through',
          ['Call forwarding rules', 'Call forwarding exceptions', 'Hot desking'],
          'The SECRETARY screens during the hours you set — Allowed Direct Callers bypass the screening.',
          S.steps([('Call for the boss', 'during screening hours'), ('Secretary screens it', 'internal, external, or all'), ('Direct callers pass', 'ring the boss at once')], title='Boss-Secretary', tones=['plain', 'blue', 'green']),
          caption='Boss-Secretary routes screened calls to a secretary while trusted callers reach the boss directly.')

    b.add('1.2', 'Forwarding rules evaluation priority',
          'The order in which forwarding is evaluated: Allowed Direct Callers first, then Boss-Secretary rules (which stop all further forwarding if they act), and only then the regular Call Forwarding Exceptions and rules.',
          'work out which rule wins when a call matches both a Boss-Secretary rule and a forwarding exception',
          ['Outbound rule priority', 'Call forwarding exceptions', 'Time-based conditional routing'],
          'Boss-Secretary BEATS exceptions — and a call it forwards is never forwarded again.',
          S.steps([('Allowed Direct Caller', 'rings the boss, no rules'), ('Boss-Secretary logic', 'then stops other rules'), ('Forwarding exceptions', 'only if nothing fired')], title='Evaluation order', tones=['green', 'blue', 'plain']),
          caption='Boss-Secretary rules are evaluated before regular forwarding exceptions.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Caller ID rules, E.164, and forwarding priority', ['1.2'],
              'CID rules (Admin > Advanced > CID Rules) route inbound calls by the caller\'s number, matched exactly or with a * wildcard, to a destination for a selected trunk, and can be imported from CSV. The caller ID blacklist stops nuisance calls by leaving them unanswered. E.164 processing (Admin > Advanced > E164) converts numbers dialed with a plus sign into a form the outbound rules and provider accept, using the home country, whether to remove the same country, the international dial code, the area code, the national code, and an optional prefix.\n\n'
              'Boss-Secretary lets a secretary, PA, or AI personal assistant screen an executive\'s calls during set hours (internal, external, or all) with trusted Allowed Direct Callers bypassing it. Forwarding is evaluated in this order: Allowed Direct Callers, Boss-Secretary logic (which prevents any further forwarding), then regular Call Forwarding Exceptions. For holidays, ordinary closures use the custom holiday messages and the Holiday Call Flow Script handles advanced cases.')
