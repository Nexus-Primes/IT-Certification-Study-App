"""Corrections to hand-written Network+ concepts, study-guide sentences, and lab text (checked 2026-11-03 against CompTIA's N10-009 objectives, version 4.0).

    python tools/content/netplus_corrections.py       # applies every correction to data/networkplus*.js (idempotent)

build_track.py never touches hand-written concepts, so these edits survive a rebuild: run build_track.py netplus first, then this.
Each correction replaces only the named fields with fixed values, so running it twice changes nothing. Terms may be renamed (ids stay stable).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)

import inject_dp as dp  # noqa: E402

FIXES = {
    # 1.4 - the "unusual" remark was wrong: many well-known ports use both UDP and TCP
    'nd1-14-4': {
        'tip': 'BOTH UDP and TCP — short lookups use UDP, while zone transfers and large responses use TCP.',
    },
    # 2.4 - WPA2 is not "deliberately weak", it is the previous generation
    'nd2-24-2': {
        'tip': 'CURRENT standard, strongest against offline guessing — WEP and open authentication are far weaker, and WPA2 is the older generation.',
    },
    # 3.1 - make the labeling question differ from the cable map question
    'nd3-31-5': {
        'scenario': 'mark both ends of every cable run and each patch panel position with matching names so a technician can tell where it leads without tracing it by hand',
    },
    # 4.1 - flagged by the student: say what makes the layers "defense in depth"
    'nd4-41-3': {
        'scenario': 'layer several independent controls, such as a firewall, segmentation, and endpoint protection, so that no single failure exposes the internal servers',
    },
    # 4.2 - CompTIA lists ARP poisoning and ARP spoofing together
    'nd4-42-6': {
        'term': 'ARP spoofing (ARP poisoning)',
        'definition': 'An attack, also called ARP poisoning, where a malicious host sends forged ARP messages to associate its own MAC address with another device\'s IP address, redirecting traffic through the attacker.',
    },
    # 4.3 - N10-009 calls the DMZ a screened subnet
    'nd4-43-3': {
        'term': 'Screened subnet (DMZ)',
        'definition': 'A separate, isolated network segment between the untrusted Internet and the trusted internal network that hosts public-facing servers, historically called a DMZ, so a compromise there does not directly expose the internal network.',
        'tip': 'Isolates PUBLIC-FACING servers — a compromise there doesn\'t directly expose the internal network; "screened subnet" is CompTIA\'s current name for a DMZ.',
    },
    # 4.3 - the remote-employee scenario was too close to the client-to-site VPN question
    'nd4-43-7': {
        'scenario': 'protect traffic between two endpoints that must cross an untrusted network so it cannot be read or changed along the way',
        'distractors': ['Screened subnet (DMZ)', 'NAT', 'Access control list'],
    },
    # 5.1 - the official step names include the sub-bullets
    'nd5-51-1': {
        'definition': 'The first step of the troubleshooting methodology: gather information, question users, identify symptoms, determine whether anything has changed, duplicate the problem if possible, and approach multiple problems individually, all before assuming a cause.',
    },
    'nd5-51-6': {
        'definition': 'The troubleshooting step where the technician confirms the original problem is resolved, checks that the fix didn\'t introduce new issues elsewhere, and implements preventive measures where applicable so it does not recur.',
        'scenario': 'confirm that the affected users can reach the server again, that no other service broke as a result, and that a safeguard is in place to stop a repeat',
        'tip': 'Step 6 — confirms the ORIGINAL problem is gone, checks nothing new broke, AND adds preventive measures where they apply.',
    },
    'nd5-51-7': {
        'definition': 'The final troubleshooting step, recording the findings, the actions taken, the outcome, and the lessons learned for future reference.',
        'scenario': 'write up what caused an outage, how it was resolved, and what was learned so the next technician can reference it if it happens again',
        'tip': 'The LAST step — what happened, what was tried, what worked, and the lessons learned, for the next technician (or yourself).',
    },
    # 5.2 - one dirty-connector question instead of two
    'nd5-52-6': {
        'term': 'Dirty or damaged fiber connector',
        'definition': 'A physically dirty, scratched, or improperly polished fiber connector end-face that causes excessive signal loss or complete link failure; inspect the end-face with a scope and clean it with lint-free wipes or a cleaning tool before replacing anything.',
        'scenario': 'explain why intermittent errors on a link stopped after a technician wiped the glass tip of the patch cord with a lint-free cloth',
        'tip': 'DIRTY or SCRATCHED end-face — inspect and clean it before replacing anything, because cleaning often restores the link.',
    },
    # 2.4 - CompTIA says autonomous vs lightweight access point
    'nd2-24-7': {
        'term': 'Autonomous vs lightweight (controller-based) AP',
        'definition': 'Autonomous access points are configured and managed individually, while lightweight (controller-based) access points receive centralized configuration and management from a wireless LAN controller.',
    },
    # 5.3 - the DNS settings question folded in here
    'nd5-53-3': {
        'definition': 'A condition where a client cannot translate a hostname into an IP address, often due to an unreachable, misconfigured, or overloaded DNS server, or wrong DNS server addresses handed out by DHCP; ping by IP works while ping by name fails, and nslookup against each configured server shows where it breaks.',
    },
    # 5.4 - keep the storm question about the symptom; the loop question covers the cause
    'nd5-54-4': {
        'scenario': 'explain why every switch port shows a flood of repeated frames, switch CPU load is near 100 percent, and hosts cannot communicate right after a spare cable joined two switch ports',
    },
    # 5.5 - the wrong-VLAN question folded in here
    'nd5-55-1': {
        'definition': 'A misconfiguration where a trunk or access port is assigned to the wrong VLAN on one or both ends, isolating a device from the network it\'s meant to reach; a device in the wrong VLAN also draws an address from the wrong DHCP scope, so check the port\'s VLAN first.',
    },
}

GUIDE_EDITS = [
    ('networkplus-guide.js',
     "A cable certifier goes further than a basic tester, confirming a cable actually meets a specific performance standard (like Cat 6a) rather than just checking it's wired correctly. A TDR (Time Domain Reflectometer) can find the exact physical distance to a break or fault in a cable without you having to walk the entire run. A punchdown tool",
     "A visual fault locator shines visible red light into a fiber so breaks and bad connectors glow, and a network tap passes traffic through while sending a copy to an analyzer. A punchdown tool"),
    ('networkplus-guide.js',
     "A DMZ (Demilitarized Zone) is a separate network segment",
     "A screened subnet (also called a DMZ, or demilitarized zone) is a separate network segment"),
    ('networkplus-guide.js',
     "verify full functionality (and consider preventive steps), and document everything that happened.",
     "verify full functionality and implement preventive measures if applicable, and document findings, actions, outcomes, and lessons learned throughout the process."),
    ('networkplus-guide.js',
     "ARP spoofing sends forged ARP messages",
     "ARP spoofing (also called ARP poisoning) sends forged ARP messages"),
    ('networkplus-guide.js',
     "control who can physically enter a space like a server room.",
     "control who can physically enter a space like a server room, and locks on doors, closets, and racks stop everyone else."),
]

LAB_EDITS = [
    ('networkplus-labs.js',
     '"Verify full system functionality",\n      "Document findings, actions, and outcomes"',
     '"Verify full system functionality and implement preventive measures if applicable",\n      "Document findings, actions, outcomes, and lessons learned"'),
    ('networkplus-labs.js',
     'Standard IP access list DB-ACCESS',
     'Extended IP access list DB-ACCESS'),
]


def apply(path, fixes):
    text = dp.read(path)
    lines = text.split('\n')
    problems = []
    for concept_id, fields in fixes.items():
        prefix = '    { "id": "%s",' % concept_id
        at = next((i for i, line in enumerate(lines) if line.startswith(prefix)), None)
        if at is None:
            raise SystemExit(f'{concept_id} not found in {os.path.basename(path)}')
        raw = lines[at].rstrip()
        trailing = ',' if raw.endswith(',') else ''
        concept = json.loads(raw.strip().rstrip(','))
        concept.update(fields)
        if concept['term'] in concept['distractors'] or len(set(concept['distractors'])) != 3:
            problems.append(f'{concept_id}: distractors must be three distinct options that differ from the term')
        lines[at] = dp.concept_line(concept) + trailing
    if problems:
        raise SystemExit('NOT WRITTEN - problems:\n  ' + '\n  '.join(problems))
    dp.write(path, '\n'.join(lines))
    return len(fixes)


def replace_text(edits):
    done = 0
    for name, old, new in edits:
        path = os.path.join(ROOT, 'data', name)
        text = dp.read(path)
        if old in text:
            dp.write(path, text.replace(old, new, 1))
            done += 1
        elif new not in text:
            raise SystemExit(f'text not found in {name}: {old[:70]}...')
    return done


def main():
    n = apply(os.path.join(ROOT, 'data', 'networkplus.js'), FIXES)
    g = replace_text(GUIDE_EDITS)
    lab = replace_text(LAB_EDITS)
    print(f'corrected {n} concepts; {g} guide sentences; {lab} lab strings')


if __name__ == '__main__':
    main()
