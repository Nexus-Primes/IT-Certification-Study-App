"""One-off corrections to hand-written 3CX concepts that the 3CX administrator manual (2026) contradicts or has superseded.

    python tools/content/cx_corrections.py            # applies every correction to data/3cx-basic.js and data/3cx-advanced.js

build_track.py never touches hand-written concepts, so these edits survive a rebuild. Running this script twice is harmless:
each correction replaces fields with fixed values. Only the named fields change; a diagram is re-rendered only when the
correction supplies one. Terms may be renamed (ids stay stable).
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import inject_dp as dp  # noqa: E402
import svg as S  # noqa: E402
from cx_guide_edits import GUIDE_EDITS  # noqa: E402


def d(builder, caption):
    return (builder, caption)


BASIC = {
    'b1-11-1': {
        'distractors': ['3CX cloud-hosted deployment', 'Debian Linux deployment', 'Self-hosted private cloud'],
    },
    'b1-11-3': {
        'definition': 'Running the PBX in the cloud instead of on a server you host: either Hosted by 3CX, where 3CX manages the operating system, updates, and monitoring, or a self-hosted instance in your own Google Cloud, AWS, Azure, or DigitalOcean account.',
        'tip': 'NO local server hardware to maintain — 3CX hosts it, or you run it in your own cloud account; Windows and Debian on premise need a box you run yourself.',
        'diagram': d(S.compare(('Hosted by 3CX', ['3CX runs the instance', 'Updates handled for you', 'Support not included']), ('Self-hosted cloud', ['Your own cloud account', 'You manage the instance', 'Google, AWS, Azure, more']), title='Cloud options'),
                     'Cloud deployment is either Hosted by 3CX or a self-hosted instance in your own cloud account.'),
    },
    'b1-11-4': {
        'definition': 'Estimating how many calls can be active at the same time, which sets the license size and drives the load on the server and network; 3CX publishes its hardware tiers by extension count, with queues and recording adding load.',
        'scenario': 'size the license for a 50-employee office where usually only 8 people are on a call at once',
        'tip': 'CONCURRENT calls set the LICENSE — hardware tiers are published per extension count, so plan for both.',
        'diagram': d(S.compare(('Licensing', ['Counted by simultaneous calls', 'Not by extension count', 'Sets what you buy']), ('Hardware sizing', ['Published per extension count', 'Queues and recording add load', 'Sets the server size']), title='Two different measures'),
                     'Licenses are counted by simultaneous calls while hardware tiers are published by extension count.'),
    },
    'b1-12-2': {
        'term': '3CX SMB (free edition)',
        'definition': 'A free, ready-to-run edition for companies with up to 10 users that runs on a shared instance managed by 3CX, so there is nothing to license, host, or secure; you only need an account with a supported SIP trunk provider, and it has no departments or system-wide roles.',
        'scenario': 'give a ten-person office a working phone system with no license to buy and no server to run',
        'distractors': ['Hosted by 3CX (managed instance)', 'Self-hosted private cloud', 'Debian Linux deployment'],
        'tip': 'FREE for up to 10 users on a SHARED instance — more than 10 needs a dedicated instance and a license.',
        'diagram': d(S.compare(('3CX SMB', ['Free, up to 10 users', 'Shared instance', 'No hosting to manage']), ('Dedicated instance', ['More than 10 users', 'Paid license', 'Hosted, cloud, or on premise']), title='SMB vs. dedicated'),
                     '3CX SMB is a free shared instance for up to 10 users; larger companies need a dedicated instance.'),
    },
    'b1-13-3': {
        'definition': 'A range of UDP ports, 9000 to 10999 by default, that carries the actual audio (and video) stream once a call is connected, separate from the SIP signaling port.',
        'tip': 'The ACTUAL AUDIO stream — UDP 9000 to 10999, a whole different range than SIP signaling, which just handles call setup and teardown.',
        'diagram': d(S.facts([('Purpose', 'call audio and video'), ('Protocol', 'UDP'), ('Default range', '9000 to 10999'), ('If blocked', 'call connects, no audio')], title='RTP ports'),
                     'RTP carries call audio over UDP ports 9000 to 10999 by default.'),
    },
    'b1-13-4': {
        'definition': "A Dashboard tool that uses 3CX's STUN servers to test the firewall over UDP for port preservation, full cone NAT, and SIP ALG interference; PBX services are stopped and restarted while it runs, and TCP ports need a separate check.",
        'tip': 'Tests UDP behavior via STUN — port preservation, full cone NAT, SIP ALG — not TCP reachability.',
        'diagram': d(S.steps([('Port preservation', 'source port unchanged?'), ('Full cone NAT', 'unexpected replies pass?'), ('SIP ALG test', 'hash of a test INVITE')], title='Firewall Checker tests', tones=['blue', 'green', 'amber']),
                     'The Firewall Checker tests port preservation, full cone NAT, and SIP ALG interference.'),
    },
    'b2-23-1': {
        'term': '3CX Windows softphone app',
        'definition': "A Windows 10 or 11 app, installed from the Microsoft Store or provisioned from the Web Client's Apps page, that turns a PC into an extension in Softphone mode or lets it control a desk phone in CTI mode; its scope is calls and core PBX functions, and it takes the place of the older Electron-based desktop app.",
        'scenario': 'let an employee make and receive calls from their Windows laptop without needing a physical desk phone at all',
        'distractors': ['3CX Web Client', '3CX mobile app', 'IP phone'],
        'tip': 'A Windows APP with Softphone and CTI modes — the Web Client and PWA run in a browser with nothing to install.',
        'diagram': d(S.compare(('Softphone mode', ['Calls made from the PC', 'The PC is the extension', 'No desk phone needed']), ('CTI mode', ['A desk phone rings', 'The app controls the phone', 'Dial from the PC']), title='Windows app modes'),
                     'The 3CX Windows app works as a softphone or as a controller for a desk phone (CTI).'),
    },
    'b2-23-4': {
        'definition': 'A secure connection that lets remote apps, phones, and bridged systems reach the PBX through a single encrypted channel on port 5090 (TCP and UDP) without opening many firewall ports on the remote side.',
        'tip': 'ONE encrypted channel on port 5090 — a VPN client instead needs its own client software and setup on each device.',
    },
    'b2-25-2': {
        'definition': "Paging makes a one-way announcement through phone speakers to a paging group without anyone answering, while intercom opens two-way audio to a single extension when you dial the paging code (for example *9) in front of its number.",
        'tip': 'BROADCASTS live, no answer needed — a ring group still needs someone to ANSWER; intercom adds two-way audio to ONE extension.',
    },
    'b3-31-2': {
        'definition': "The process where the PBX logs in to the provider's server with the trunk's authentication ID and password so the provider knows where to send inbound calls; a trunk that authenticates by IP address has no registration.",
        'tip': 'Register-based trunks only — RED until the PBX registers, GREEN once it has; IP-based trunks have no registration.',
    },
    'b3-32-1': {
        'definition': "In V20 a call arriving on a DID goes to the destination that has that DID assigned (a user, ring group, queue, or digital receptionist), the trunk's default route catches unassigned numbers, and CID rules act as inbound rules that match the caller's number instead.",
        'tip': 'Routes a call arriving on a SPECIFIC DID — assigned on the DESTINATION; an outbound rule governs calls going OUT.',
        'diagram': d(S.hub(('Inbound routing',), [('DID', 'on a destination'), ('Default route', 'unassigned DIDs'), ('CID rules', 'caller number'), ('Report', 'Inbound Rules')], title='How inbound calls are routed'),
                     "A V20 call is routed by the destination that owns its DID, with the trunk default route and CID rules as alternatives."),
    },
    'b3-32-3': {
        'definition': 'Assigning each of several DID numbers on the same trunk to its own destination, so different public numbers reach different users, ring groups, queues, or menus.',
    },
    'b3-32-4': {
        'definition': 'A backup destination that a call is sent to when its primary destination cannot take it, such as the unanswered, out-of-hours, break, and holiday destinations set on a ring group, queue, or digital receptionist.',
        'tip': 'The BACKUP destination on the call-handling object — trunk redundancy instead is about the underlying CONNECTION failing, a different layer.',
    },
    'b3-32-5': {
        'definition': "Inbound routing that changes automatically with the office hours of the destination's department, such as an IVR sending calls to the receptionist during the day and to voicemail after hours; holidays are added in the same hours settings.",
        'tip': "CHANGES by SCHEDULE automatically — driven by the destination's department office hours, not by a schedule on the trunk.",
    },
    'b3-33-3': {
        'definition': 'Sending calls over the cheapest provider for each destination by creating outbound rules per prefix and ordering their routes so that the lowest-cost trunk is tried first, with up to four more routes as fallback.',
        'scenario': 'send international calls through the trunk with the lowest rate by putting it first for that destination prefix',
        'tip': 'You ORDER the routes — 3CX tries them in sequence, so the cheapest trunk goes first; distinct from redundancy (reliability).',
    },
    'b3-33-5': {
        'definition': 'Emergency numbers defined in Admin > System > Emergency, which the PBX prioritizes over outbound, in-office, and out-of-office rules; each has one mandatory trunk route plus up to four alternatives, and in the USA E911 geolocation needs a provider that supports it.',
        'tip': 'A PRIORITY exception to the normal rules — one mandatory route plus up to four alternates; E911 location needs provider support.',
        'diagram': d(S.steps([('Emergency dialed', 'from any extension'), ('Normal rules ignored', 'outbound and hours'), ('Emergency route used', 'first, then alternates')], title='Emergency call handling', tones=['red', 'plain', 'green']),
                     'Dialed emergency numbers ignore the normal rules and use their own routes.'),
    },
    'b4-41-2': {
        'definition': 'The greeting played to callers by a digital receptionist, either recorded in the Admin Console with the microphone icon or uploaded as an audio file in the supported format, such as "Thank you for calling, press 1 for sales".',
        'tip': "The GREETING audio itself — recorded in the console or uploaded, and separate from a voicemail box's personal greeting.",
    },
    'b4-42-2': {
        'definition': 'The pattern a ring group uses to alert its members: Prioritized Hunt rings them one after another from the top of the list, Ring All rings everyone at once until someone answers or the ring time ends, and the Paging strategies broadcast announcements.',
        'tip': 'How a RING GROUP alerts members — a queue has many more strategies, such as Round Robin and Longest Waiting.',
        'diagram': d(S.compare(('Prioritized Hunt', ['One after another', 'Top of the list first', 'Until someone answers']), ('Ring All', ['Everyone at once', 'Until someone answers', 'Or the ring time ends']), title='Ring group strategies'),
                     'A ring group rings members in list order (Prioritized Hunt) or all at once (Ring All).'),
    },
    'b4-43-2': {
        'definition': 'The algorithm a queue uses to choose which agents to ring: Ring All, Prioritized Hunt, Hunt Random Start, Round Robin, Longest Waiting, Least Talk Time, Fewest Answered, or Hunt by Threes, plus skills-based strategies in the AI edition.',
        'tip': 'How a QUEUE distributes calls to AGENTS — a ring group has only Prioritized Hunt and Ring All (plus paging).',
        'diagram': d(S.table(['Strategy', 'Picks'], [('Round Robin', 'a fair rotation'), ('Longest Waiting', 'waiting the longest'), ('Least Talk Time', 'least time on calls'), ('Fewest Answered', 'fewest calls taken')], title='Queue strategies', col_widths=[0.5, 0.5]),
                     'A queue strategy decides which agents ring for each waiting call.'),
    },
    'b4-43-4': {
        'definition': "A live view in the Web Client's Panel (the Agent Status and Queue Monitoring sections) showing queue activity such as calls waiting, wait times, and agent status, used by supervisors to watch the queue in real time.",
        'tip': 'REAL-TIME live view in the Panel — call reports are HISTORICAL data pulled after the fact, a different timeframe of visibility.',
    },
    'b4-44-1': {
        'definition': "A department's weekly pattern of open days, hours, and breaks, set under Office Hours and inherited by its extensions, IVRs, queues, and ring groups, used to change call routing between open, break, and closed times.",
        'tip': 'REGULAR weekly pattern per DEPARTMENT, with breaks — holidays layer EXCEPTION dates on top of this baseline.',
    },
    'b4-44-2': {
        'definition': 'Specific exception dates added under Office Hours > Office Holidays, separately from the regular weekly hours, so that calls are handled as if the office is closed on holidays or unusual closures.',
    },
}

ADVANCED = {
    'a2-22-3': {
        'definition': "Presence exchanged between 3CX and Microsoft Teams, from 3CX to Teams, from Teams to 3CX, or both, for users already synced from Microsoft 365 who have a Teams-enabled license; 3CX On a Call can show as In a Call in Teams.",
        'scenario': 'show a person as busy in Teams whenever they are on a 3CX call',
        'distractors': ['Single sign-on (SSO) integration', 'Contact sync', 'Calendar-based presence'],
        'tip': 'PRESENCE exchange, in one direction or both — users must already be synced from Microsoft 365.',
        'diagram': d(S.compare(('3CX to Teams', ['On a call in 3CX', 'Teams shows In a Call', 'Status pushed out']), ('Teams to 3CX', ['Busy or In a Call in Teams', 'Only after answering', 'Status pulled in']), title='Presence directions'),
                     'Teams integration exchanges presence between 3CX and Teams in one or both directions.'),
    },
    'a2-23-1': {
        'distractors': ['3CX Meet video conferencing', 'SMS integration', 'CRM connector'],
        'tip': "EMBEDDABLE on a company WEBSITE — routes visitor chat to agents, distinct from 3CX Meet's video-conferencing focus.",
    },
    'a2-23-3': {
        'term': '3CX Meet video conferencing',
        'definition': "3CX's built-in web video conferencing, hosted through 3CX's cloud service, with ad hoc meetings started from a person's Meet link and participants joining from a browser, so no separate third-party tool is needed; it needs TCP 443 and UDP 48000 to 65535 through the firewall.",
        'tip': 'VIDEO conferencing built in — the Web Client is instead a browser-based SOFTPHONE for calls, a different tool despite both being browser-based.',
    },
    'a2-23-4': {
        'term': 'Screen sharing (3CX Meet)',
        'definition': 'A 3CX Meet capability that lets a participant share their computer screen with other meeting attendees in real time.',
        'tip': 'A 3CX Meet capability — shares the SCREEN during a video meeting, unrelated to calling, presence, or contacts features.',
    },
    'a2-24-3': {
        'distractors': ['CDR service', 'Queue wallboard', 'Extension reports'],
        'tip': 'PROGRAMMATIC access for CUSTOM dashboards/BI tools — the CDR service pushes a record stream or file instead, this is an API for building your own.',
    },
    'a3-31-1': {
        'definition': 'A security approach where remote apps and phones connect to the PBX through a single encrypted, authenticated channel on port 5090, avoiding the need to expose many SIP/RTP ports directly to the internet.',
    },
    'a3-31-2': {
        'definition': "A 3CX component at a remote site, either a standalone service or a router phone, that combines the local phones' SIP signaling and RTP media and delivers them to a remote or cloud PBX, solving firewall traversal; it connects phones and does not create a second PBX.",
        'scenario': "explain the role of the local component that gathers a branch office's phone traffic and delivers it to a cloud-hosted PBX",
        'tip': "CONNECTS a site's phones to the PBX — it is not a second PBX, and a PSTN gateway instead bridges ANALOG lines.",
        'diagram': d(S.steps([('Branch phones', 'register locally'), ('SBC combines traffic', 'SIP and RTP together'), ('Remote PBX', 'receives it')], title='What an SBC does', tones=['plain', 'blue', 'green']),
                     "An SBC combines a site's SIP and RTP traffic and delivers it to a remote PBX."),
    },
    'a3-31-4': {
        'definition': 'A security feature that automatically blocks an IP address after more than 10 wrong passwords or more than 5 incorrect registrations and lists it in the IP Blacklist, protecting against brute-force attacks on extensions and trunks.',
        'tip': 'BLOCKS IPs after REPEATED failures (over 10 passwords, over 5 registrations) — a brute-force defense, not an encryption mechanism.',
    },
    'a3-32-3': {
        'definition': "For 3CX-provided FQDNs a Let's Encrypt certificate is pre-configured and renews automatically about every three months; a custom FQDN needs its own certificate, from Let's Encrypt through a third party or from a commercial authority.",
        'tip': 'FREE and AUTO-RENEWING on a 3CX FQDN — a custom FQDN needs its own certificate, and a self-signed one must be trusted by hand.',
    },
    'a3-32-4': {
        'definition': "The process of replacing an expiring TLS certificate: the pre-configured Let's Encrypt certificate updates on the fly without a restart, while a custom-FQDN certificate must be replaced by hand and the PBX services restarted.",
        'tip': 'TLS CERTIFICATES specifically — automatic for the 3CX-provided Let\'s Encrypt one, manual (plus a restart) for a custom FQDN.',
    },
    'a3-33-1': {
        'definition': 'An automated, recurring backup that runs hourly, daily, or weekly at a chosen day and time and keeps a set number of backups before overwriting the oldest, without requiring manual action each time.',
        'tip': 'AUTOMATED and RECURRING (hourly, daily, or weekly, with a rotation count) — a manual backup requires someone to trigger it.',
    },
    'a3-33-4': {
        'definition': 'Updates that arrive in separate tracks (PBX, AI, SBC, phone templates, SIP trunks, and Debian OS security) and can be applied automatically on a schedule you set; a system cannot be rolled back to a previous version, so apply them in planned maintenance windows.',
        'tip': 'NO ROLLBACK to an earlier version — schedule updates for planned MAINTENANCE WINDOWS; automatic updates also apply Debian OS updates.',
    },
    'a3-34-2': {
        'definition': 'Console Restrictions (Admin > Advanced) that allow admin console access only from listed public IP addresses or local subnets such as 192.168.10.0/24, reducing exposure to unauthorized login attempts.',
        'tip': 'ONLY trusted IPs can even ATTEMPT login — proactively narrows who can try, unlike blacklist protection which reacts AFTER repeated failures.',
    },
    'a5-52-3': {
        'definition': "Running the Dashboard's Firewall Checker, which uses 3CX's STUN servers to test port preservation, full cone NAT, and SIP ALG interference over UDP, to isolate whether a problem is network-related before digging into call logs.",
        'tip': 'Isolates NETWORK-layer problems FIRST — check this before digging into SIP traces or packet captures, but it tests UDP behavior, not TCP ports.',
    },
    'a5-53-3': {
        'term': 'CDR service',
        'definition': "3CX's built-in call detail record service, enabled under Advanced > CDR, that logs calls to a file or pushes each record to another application instantly over TCP, often to feed external billing or analytics systems.",
        'scenario': 'send detailed call records to a third-party billing system that charges departments based on call usage',
        'distractors': ['Queue wallboard', 'Extension reports', 'SIP trace'],
        'tip': "EVERY call's raw record, as a FILE or a TCP PUSH — feeds billing and analytics, more granular and RAW than a formatted report.",
        'diagram': d(S.steps([('Enable the CDR service', 'Advanced > CDR'), ('Calls are recorded', 'one record per call'), ('File or TCP push', 'to billing or BI')], title='CDR service', tones=['plain', 'blue', 'green']),
                     'The CDR service logs call records to a file or pushes them over TCP.'),
    },
}

HEADING_RENAMES = {
    # (data file, old text, new text): objective title and guide heading that still say WebMeeting
    ('3cx-advanced.js', '"Live chat, SMS, and WebMeeting"', '"Live chat, SMS, and 3CX Meet"'),
    ('3cx-advanced-guide.js', '"Live chat, SMS, and WebMeeting"', '"Live chat, SMS, and 3CX Meet"'),
}


def apply(path, fixes):
    text = dp.read(path)
    lines = text.split('\n')
    changed = 0
    problems = []
    for concept_id, fields in fixes.items():
        prefix = '    { "id": "%s",' % concept_id
        at = next((i for i, line in enumerate(lines) if line.startswith(prefix)), None)
        if at is None:
            raise SystemExit(f'{concept_id} not found in {os.path.basename(path)}')
        raw = lines[at].rstrip()
        trailing = ',' if raw.endswith(',') else ''
        concept = json.loads(raw.strip().rstrip(','))
        for key, value in fields.items():
            if key == 'diagram':
                builder, caption = value
                try:
                    concept['diagram'] = builder(concept_id, caption)
                except ValueError as error:
                    problems.append(f'{concept_id}: {error}')
            else:
                concept[key] = value
        if concept['term'] in concept['distractors'] or len(set(concept['distractors'])) != 3:
            problems.append(f'{concept_id}: distractors must be three distinct options that differ from the term')
        lines[at] = dp.concept_line(concept) + trailing
        changed += 1
    if problems:
        raise SystemExit('NOT WRITTEN - problems:\n  ' + '\n  '.join(problems))
    dp.write(path, '\n'.join(lines))
    return changed


def main():
    data = os.path.join(ROOT, 'data')
    n = apply(os.path.join(data, '3cx-basic.js'), BASIC)
    m = apply(os.path.join(data, '3cx-advanced.js'), ADVANCED)
    renamed = 0
    for name, old, new in HEADING_RENAMES:
        path = os.path.join(data, name)
        text = dp.read(path)
        if old in text:
            dp.write(path, text.replace(old, new))
            renamed += 1
    edited = 0
    for name, old, new in GUIDE_EDITS:
        path = os.path.join(data, name)
        text = dp.read(path)
        if old in text:
            dp.write(path, text.replace(old, new, 1))
            edited += 1
        elif new not in text:
            raise SystemExit(f'guide text not found in {name}: {old[:60]}...')
    print(f'corrected {n} Basic and {m} Advanced concepts; {renamed} heading renames; {edited} guide sentences')


if __name__ == '__main__':
    main()
