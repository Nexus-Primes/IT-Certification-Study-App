"""3CX Advanced, domain a4 (Multi-Tenant & Hosting): documented limits of multi-company mode, plus multi-site architecture with bridges and SBCs.

The multi-tenant and reseller concepts already in this domain are generic hosting-provider practice rather than a copy of a 3CX document; the new concepts below are checked against the 3CX administrator manual (bridges and create users pages) and 3CX's October 2026 guide to choosing between bridges and SBCs.
"""
import svg as S

DOMAIN = 'a4'


def build(b):
    b.topics['4.1'] = ['Multi-tenant PBX', 'Tenant isolation', 'Master console', 'White-labeling', 'Multi-Company limitations']
    b.objective('4.5', 'Multi-site architecture', ['Bridges', 'Numbering plans', 'Presence sharing', 'Bridge or SBC', 'Country blocking', 'SBC hosting', 'Design checklist'])

    # ------------------------------------------------------------------------------------------ 4.1
    b.add('4.1', 'Multi-Company mode limitations',
          'Documented restrictions of a system running in Multi-Company mode: Microsoft 365 user import and sync is not available, Microsoft single sign-on is not available, and a user can belong to only one department.',
          'understand why Microsoft 365 sync and Microsoft sign-in are unavailable on a system running in multi-company mode',
          ['Tenant isolation', 'Per-tenant resource limits', 'Shared/pooled licensing across tenants'],
          'Check the MODE first — M365 sync and Microsoft SSO are both unavailable in Multi-Company mode.',
          S.facts([('M365 user sync', 'not available'), ('Microsoft SSO', 'not available'), ('Departments', 'one per user')], title='Multi-Company limits'),
          caption='Multi-Company mode does not support Microsoft 365 sync or Microsoft SSO.')

    # ------------------------------------------------------------------------------------------ 4.5
    b.add('4.5', 'Bridge between 3CX systems',
          'A Master and Slave pair of bridges that connects two remote 3CX systems over the internet so branches call each other without charge by dialing a prefix plus the remote extension; both systems need a secure FQDN, never an IP address.',
          'let two offices that each run their own phone system call each other\'s extensions without trunk charges',
          ['3CX SBC remote location', 'Router phone', 'Multiple trunk redundancy'],
          'MASTER first, then SLAVE — matching virtual extension, prefix, and password, and FQDNs only.',
          S.steps([('Create Master bridge', 'note virtual extension'), ('Create Slave bridge', 'same ext, prefix, password'), ('Add outbound rules', 'strip the prefix digit')], title='Building a bridge', tones=['blue', 'plain', 'green']),
          caption='A bridge links two 3CX systems so users dial a prefix plus the remote extension.')

    b.add('4.5', 'Bridge numbering plan',
          'Two ways to dial across a bridge: a prefix plan (for example 3 plus 100) where the outbound rule strips the prefix, or separate extension ranges per office (100s and 200s) where users dial the number directly and no digits are stripped.',
          'let users at two sites dial each other\'s extensions directly without a prefix',
          ['Extension number length', 'Strip digits and prepend', 'Dial pattern matching'],
          'Separate RANGES mean no prefix and NO stripped digits — the rule must match the plan.',
          S.compare(('Prefix plan', ['Dial 3 then 100', 'Outbound rule strips 1 digit', 'Any extension numbers']), ('Range plan', ['Dial 200 directly', 'No digits stripped', 'Offices use distinct ranges']), title='Bridge dialing'),
          caption='A bridge can use a dial prefix or separate extension ranges for each office.')

    b.add('4.5', 'Bridge presence sharing',
          'Bridge options under Advanced that publish local users\' presence to the remote system and receive the remote users\' presence, using the remote system\'s FQDN (with the port added when its web server is not on the default port).',
          'let staff see whether colleagues at the other site are available',
          ['Presence status', 'Teams presence loop', 'Switch Status'],
          'PUBLISH sends your presence; RECEIVE shows theirs — dialing alone shares neither.',
          S.compare(('Publish Information', ['Sends local presence', 'To the remote system', 'Per bridge']), ('Receive Information', ['Shows remote presence', 'To local users', 'Per bridge']), title='Bridge presence'),
          caption='A bridge shares presence only when it is set to publish and receive information.')

    b.add('4.5', 'Bridge or SBC decision',
          'A bridge keeps separate PBXs (each with its own administrators, trunks, office hours, and queues) that can call each other; an SBC connects a site\'s phones to one remote or cloud PBX without creating a second PBX.',
          'choose between linking two independent phone systems and connecting a branch\'s phones to one central system',
          ['Router phone', 'Multi-tenant PBX concept', '3CX Tunnel security model'],
          'Where does the CALL CONTROL live? Own PBX = bridge; central PBX = SBC.',
          S.compare(('Bridge', ['Separate PBXs stay separate', 'Own trunks and queues', 'Inter-site dialing']), ('SBC', ['One central PBX', 'Local phones connect in', 'No second PBX']), title='Bridge vs. SBC'),
          caption='A bridge links separate PBXs while an SBC connects local phones to a single PBX.')

    b.add('4.5', 'Country blocking and bridge extensions',
          'The Allowed Country Codes setting on a bridged system must not conflict with the remote extension numbers; a prefix plus a remote extension can be read as an international number and blocked.',
          'work out why dialing a remote office extension through a bridge is blocked even though the bridge is up',
          ['Outbound rule conditions', 'Bridge numbering plan', 'Trunk status indicator'],
          'Check Allowed Country Codes — the prefix plus extension can look like an INTERNATIONAL number.',
          S.steps([('Dial prefix + ext', 'for the remote site'), ('Country filter runs', 'looks international?'), ('Blocked on a conflict', 'adjust the setting')], title='Country filter and bridges', tones=['plain', 'amber', 'red']),
          caption='Allowed Country Codes can block a bridge call whose prefix and extension look international.')

    b.add('4.5', 'SBC host availability',
          'The machine running a remote-site SBC needs a static LAN IP and must be up whenever the site\'s phones need service, so it is part of the phone path alongside the LAN, firewall, DNS, and power; smaller sites may use a router phone or the apps instead.',
          'plan the host for a remote-site SBC so that local phones always have service',
          ['Capacity planning for growth', 'Performance monitoring dashboards', 'Local LAN/VPN connection option'],
          'A STATIC LAN IP, and it must be ON — the phones depend on it.',
          S.facts([('Address', 'static LAN IP'), ('Availability', 'whenever phones need service'), ('Also depends on', 'LAN, firewall, DNS, power'), ('Smaller sites', 'router phone or apps')], title='SBC host'),
          caption='An SBC host needs a static LAN IP and must be available whenever its phones need service.')

    b.add('4.5', 'Multi-site design checklist',
          'Before go-live, confirm each site\'s numbering range or prefix, FQDNs and split DNS, firewall rules and Firewall Checker results, who owns each PBX, bridge, SBC, and route, and tests of inter-site calls, inbound and outbound calling, presence, apps, and representative phone features.',
          'verify that a new multi-site design is ready for users',
          ['Tenant onboarding checklist', 'Capacity planning for growth', 'Correlating logs across trunk/extension/queue'],
          'NUMBERING, NETWORK, OWNERSHIP, and TESTING — if nobody can explain the call path, it is not finished.',
          S.table(['Check', 'Confirm'], [('Numbering', 'range, prefix, or rule'), ('Network', 'FQDN, DNS, firewall'), ('Ownership', 'who manages each part'), ('Testing', 'calls, presence, apps')], title='Pre-deployment checklist', col_widths=[0.4, 0.6]),
          caption='A multi-site design is checked for numbering, network, ownership, and testing before go-live.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Multi-site architecture: bridges and SBCs', ['4.5'],
              'Decide the PBX model before the connection method: a bridge links two separate 3CX systems, each with its own administrators, trunks, office hours, and queues, while an SBC connects the phones at one site to a remote or cloud PBX without creating a second PBX. Create a Master bridge first (name, virtual extension, outbound rule prefix, maximum calls, authentication password, optional tunnel on port 5090), then a Slave bridge with the same virtual extension, prefix, and password, add an outbound rule on each side that strips the prefix, and require secure FQDNs rather than IP addresses on both systems.\n\n'
              'Plan numbering as either a prefix or separate ranges per office, enable Publish and Receive Information on the bridge if users should see remote presence, and make sure Allowed Country Codes does not block prefixed remote extensions. An SBC host needs a static LAN IP and constant availability. Before go-live, check numbering, FQDNs and split DNS, firewall rules and the Firewall Checker, ownership of every PBX, bridge, SBC, and route, and test inter-site calls, presence, apps, and representative phone features.')
    b.section('Limits of Multi-Company mode', ['4.1'],
              'In Multi-Company mode, Microsoft 365 user import and sync and Microsoft single sign-on are not available, and each user can be a member of only one department. The other multi-tenant concepts in this domain (isolation, pooled licensing, onboarding, billing, offboarding, white-labeling) describe general hosting-provider practice and are not a summary of a specific 3CX document.')
