"""3CX Basic, domain b3 (Trunks & Call Routing): SIP trunk setup and authentication, DID routing in V20, outbound rules, emergency calls, and codecs.

Checked against the 3CX administrator manual (SIP trunks, inbound DID routing, outbound call routing, emergency numbers, and advanced features pages, 2026).
"""
import svg as S

DOMAIN = 'b3'


def build(b):
    b.topics['3.1'] = ['SIP trunks', 'Registration vs. IP-based', 'Default route', 'Main trunk number', 'Department limits', 'Status colors', 'SMS and MMS', 'Supported providers']
    b.topics['3.2'] = ['DID assignment', 'Routing destinations', 'Failover', 'Time-based routing', 'Activity Log troubleshooting']
    b.topics['3.3'] = ['Outbound rules', 'Conditions', 'Strip and prepend', 'Route selection', 'Priority', 'Emergency numbers', 'Caller ID']
    b.topics['3.4'] = ['G.711', 'G.722', 'G.729', 'Opus', 'Negotiation', 'App codec priority', 'Gateways']

    # ------------------------------------------------------------------------------------------ 3.1
    b.add('3.1', 'IP-based trunk authentication',
          'A trunk method where the provider recognizes the company by its IP address instead of a username and password, so there is no registration; if the host running 3CX changes its IP address, the provider must be told.',
          'connect to a provider that identifies the company by its public address rather than by a login',
          ['Trunk registration', 'Trunk provider template', 'Multiple trunk redundancy'],
          'No registration at all — so the status is always GREEN, and a new PBX IP means telling the provider.',
          S.compare(('Register-based', ['Account ID and password', 'PBX logs into the provider', 'Red when not registered']), ('IP-based', ['Provider trusts your IP', 'No registration', 'Status always green']), title='Trunk authentication'),
          caption='An IP-based trunk is trusted by IP address, so nothing registers.')

    b.add('3.1', 'Trunk default route',
          'The destination for calls to DIDs on the trunk that are not assigned to any extension or system extension; once the main number is assigned to an IVR or another destination, the default route no longer applies to it.',
          'make sure calls to a spare number on the trunk still reach someone',
          ['Fallback/failover routing', 'Multiple DID handling', 'Time-based inbound routing'],
          'The catch-all for UNASSIGNED DIDs — an assigned DID ignores it.',
          S.flow_split(('Call arrives on a DID', 'trunk looks up the number'), [('DID is assigned', 'goes to its destination'), ('DID not assigned', 'goes to default route')], title='Default route', tones=['green', 'amber']),
          caption='The default route handles calls to DIDs that are not assigned anywhere.')

    b.add('3.1', 'Main trunk number',
          'The number entered with the trunk\'s authentication details; outbound calls use it as the caller ID by default, unless the extension has an assigned DID, which is then used instead.',
          'work out which number a customer sees when an employee with no DID of their own calls out',
          ['Per-rule outbound caller ID', 'Assigned DID on a user', 'Outbound caller ID'],
          'The default caller ID — an extension WITH an assigned DID uses that instead.',
          S.flow_split(('Outbound call placed', 'which caller ID is shown?'), [('Extension has a DID', 'that DID is shown'), ('No DID assigned', 'main trunk number')], title='Default caller ID', tones=['blue', 'plain']),
          caption='Outbound calls show the main trunk number unless the extension has its own DID.')

    b.add('3.1', 'Department-limited trunk',
          'A trunk whose Options > Limit to setting restricts it to one department: its DIDs are visible only inside that department and department owners and administrators can manage it, whereas a system-wide trunk is managed only by system owners and administrators.',
          'let a branch manager manage their own trunk and numbers without seeing the rest of the company\'s',
          ['Trunk provider template', 'Multiple trunk redundancy', 'Outbound rule'],
          '"Limit to" decides WHO manages it and who sees its DIDs — system-wide or one department.',
          S.compare(('System-wide trunk', ['All DIDs visible', 'System Owner and Admin manage', 'Shared by everyone']), ('Department trunk', ['DIDs only in department', 'Department admins manage too', 'Isolated numbers']), title='Limit to'),
          caption='A department-limited trunk keeps its DIDs and management inside one department.')

    b.add('3.1', 'Trunk status indicator',
          'A color shown next to each trunk: red means not registered and green means registered; an IP-based trunk has no registration, so 3CX cannot tell whether it is up and it always shows green.',
          'tell at a glance that a provider account has lost its connection to the phone system',
          ['Event log', 'Built-in firewall checker', 'Admin Console dashboard'],
          'RED is not registered — but an IP-based trunk is ALWAYS green, even if it is down.',
          S.table(['Trunk type', 'Status shown'], [('Register-based, connected', 'Green'), ('Register-based, failed', 'Red'), ('IP-based trunk', 'Always green')], title='Trunk status', col_widths=[0.6, 0.4]),
          caption='Registered trunks show green and unregistered ones red; IP-based trunks always show green.')

    b.add('3.1', 'Trunk SMS and MMS',
          'Optional text messaging on a trunk with a supporting provider: tick Enable SMS to get a unique 3CX webhook to paste at the provider, enter the provider\'s webhook and keys on the PBX, and enter every DID in E.164 format such as +18135910130.',
          'turn on text messaging for a number with a provider that supports it',
          ['Trunk provider template', 'Email-to-voicemail', 'Website live chat widget'],
          'Two webhooks, one each way — and every DID must be in E.164 format, with the +.',
          S.steps([('Enable SMS', 'on the trunk, get webhook'), ('Paste at the provider', 'and add its keys here'), ('DIDs in E.164', 'for example +1813...')], title='SMS on a trunk', tones=['blue', 'plain', 'amber']),
          caption='SMS on a trunk needs a webhook exchange with the provider and DIDs in E.164 format.')

    b.add('3.1', 'Supported VoIP provider',
          'A provider 3CX has selected for ease of configuration, account setup, and support: its settings are pre-configured, both 3CX and the provider will help, whereas 3CX will not assist in configuring an unsupported provider.',
          'pick a carrier so that both the carrier and the phone system vendor will help if the setup fails',
          ['Analog/PSTN gateway', 'Multiple trunk redundancy', 'Fallback/failover routing'],
          'Supported means PRE-CONFIGURED plus support from BOTH 3CX and the provider.',
          S.compare(('Supported provider', ['Pre-configured in 3CX', '3CX and provider help', 'Chosen for easy setup']), ('Unsupported provider', ['Manual configuration', '3CX will not assist', 'Provider must know 3CX']), title='Choosing a provider'),
          caption='A supported provider is pre-configured and backed by both 3CX and the provider.')

    # ------------------------------------------------------------------------------------------ 3.2
    b.add('3.2', 'Assigning DIDs to destinations',
          'In V20 you route a number by selecting it from the Assigned DID Number(s) list of the destination itself: on a ring group, queue, or digital receptionist under Call Handling, or on a user\'s General tab for an extension.',
          'send a purchased number straight to the support queue',
          ['Time-based inbound routing', 'Multiple DID handling', 'Fallback/failover routing'],
          'The DESTINATION owns the choice — pick the DID on the queue, IVR, group, or user.',
          S.steps([('Add DIDs to the trunk', 'DID Numbers tab'), ('Open the destination', 'Call Handling or Users'), ('Pick the DID', 'in Assigned DID Numbers')], title='Routing a DID', tones=['plain', 'blue', 'green']),
          caption='A DID is routed by selecting it in the destination\'s Assigned DID Number(s) list.')

    b.add('3.2', 'DID routing troubleshooting',
          'Using the Activity Log on the Dashboard at Medium or Verbose level to see the DID the trunk delivered: Medium shows "called=" with the number and its internal destination, and Verbose shows the To header of the INVITE (some providers use the Request Line URI instead).',
          'find out why a call to a purchased number did not reach the destination it was configured for',
          ['Built-in firewall checker', 'Trunk registration', 'Event log'],
          'Call the number, then read the log: is the DID in the To header — or the Request Line URI?',
          S.steps([('Raise the log level', 'Medium or Verbose'), ('Call the DID', 'then refresh the log'), ('Read the number', 'called= or To header')], title='Finding the received DID', tones=['plain', 'blue', 'green']),
          caption='The Activity Log shows which DID the trunk actually delivered.')

    # ------------------------------------------------------------------------------------------ 3.3
    b.add('3.3', 'Outbound rule conditions',
          'The criteria that trigger an outbound rule: the dialed prefix, the length of the dialed number, the calling extensions, and the calling departments; the extension and department conditions are cumulative, so a call matches if the caller is in either.',
          'make a rule apply only to calls placed from the sales department',
          ['Least-cost routing', 'Per-rule outbound caller ID', 'Multiple DID handling'],
          'Extensions and departments are cumulative — the rule fires for EITHER one.',
          S.table(['Condition', 'Example'], [('Number prefix', 'starts with 9'), ('Number length', '8 digits'), ('Calling extensions', '100,102-120'), ('Calling departments', 'Sales')], title='What triggers a rule', col_widths=[0.5, 0.5]),
          caption='Outbound rules trigger on dialed prefix, number length, calling extensions, or calling departments.')

    b.add('3.3', 'Strip digits and prepend',
          'Number transformations applied when an outbound rule matches: Strip Digits removes leading digits such as an outside-line 9, and Prepend adds digits at the front when the provider or gateway requires them.',
          'remove the digit users dial for an outside line and add a country prefix the provider requires',
          ['Dial pattern matching', 'Per-rule outbound caller ID', 'Codec negotiation'],
          'Done BEFORE the call is routed — strip first, then prepend what the provider needs.',
          S.steps([('User dials', '9 then the number'), ('Strip 1 digit', 'removes the 9'), ('Prepend digits', 'provider\'s format')], title='Number transformation', tones=['plain', 'blue', 'green']),
          caption='Strip Digits removes leading digits and Prepend adds digits before the call is routed.')

    b.add('3.3', 'Outbound route selection logic',
          'A rule can have up to five routes tried in order: an unregistered trunk is skipped, but a busy answer (486, 600, or 1408) ends the attempt with a busy tone rather than trying the next route, and a call is successful once answered (200 OK) or cancelled.',
          'explain why a call that returned a busy signal was not retried over the backup trunk',
          ['Fallback/failover routing', 'Multiple trunk redundancy', 'Least-cost routing'],
          'Only FAILURES move to the next route — BUSY (486, 600, 1408) ends the hunt.',
          S.table(['Trunk result', 'Next route?'], [('Unregistered (red)', 'Skipped at once'), ('Busy 486, 600, 1408', 'No, busy tone'), ('Answered, 200 OK', 'Done'), ('Ringing 180 / 183', 'Not success yet')], title='Route hunting', col_widths=[0.55, 0.45]),
          caption='3CX tries up to five routes but stops on busy answers and on a successful call.')

    b.add('3.3', 'Outbound rule priority',
          'Outbound rules are evaluated top to bottom and the first rule whose conditions are met wins; a new rule is added at the bottom with the lowest priority, so you use Move Up to put a specific rule ahead of a general one.',
          'make a narrow rule for one department take precedence over a broad rule for every user',
          ['Dial pattern matching', 'Least-cost routing', 'Fallback/failover routing'],
          'FIRST match wins, new rules go to the BOTTOM — use Move Up for the specific ones.',
          S.steps([('Rule 1 is checked', 'conditions met?'), ('First match wins', 'later rules ignored'), ('New rules sit last', 'use Move Up')], title='Rule priority', tones=['plain', 'green', 'amber']),
          caption='Outbound rules are checked in priority order and the first match wins.')

    b.add('3.3', 'Early media with multiple routes',
          'When a rule has more than one route, 3CX converts 183 ringing messages to 180 and drops the provider\'s audio stream, so callers hear the phone\'s own ringing tone instead of country ringtones or provider announcements such as a cost warning.',
          'explain why callers no longer hear the provider\'s cost announcement once a rule has several routes',
          ['Codec negotiation', 'Outbound route selection logic', 'Trunk registration'],
          'More than one route = the provider\'s early-media AUDIO is dropped, the phone\'s own ring plays.',
          S.compare(('One route', ['Provider ringtone passes', 'Cost announcements heard', '183 stays 183']), ('Several routes', ['183 converted to 180', 'Provider audio dropped', 'Phone\'s own ringtone']), title='Early media'),
          caption='With several routes, 3CX drops early media so the phone plays its own ringtone.')

    b.add('3.3', 'Emergency call notifications',
          'Alerts configured on an emergency number rule that fire when the number is dialed: an email to chosen addresses, a chat message to the caller\'s department managers, department members, or managers in all departments, or an announcement played to an extension or ring group.',
          'alert reception and security staff whenever someone dials the emergency number',
          ['Event log', 'Call forwarding rules', 'Paging / intercom'],
          'Email, CHAT to managers or members, or an ANNOUNCEMENT to an extension or ring group.',
          S.hub(('Emergency call',), [('Email', 'chosen addresses'), ('Chat', 'managers, members'), ('Announce', 'extension or group')], title='Notification options'),
          caption='An emergency number can notify by email, chat message, or a played announcement.')

    b.add('3.3', 'CLIP no screening',
          'A provider arrangement that lets the company present a caller ID it has not proven it owns; spammers abused it, so only a few providers allow it, and most replace a caller ID that 3CX sets with a number they have verified.',
          'present a caller ID that the provider has not verified the company owns, which most providers refuse',
          ['Per-rule outbound caller ID', 'Assigned DID on a user', 'Trunk registration'],
          '3CX SETS the caller ID, but the provider decides whether to HONOR it.',
          S.steps([('3CX sets a caller ID', 'per rule or extension'), ('Provider checks it', 'verified number?'), ('Shown or replaced', 'most providers replace')], title='Caller ID and the provider', tones=['plain', 'blue', 'amber']),
          caption='Most providers do not allow unverified caller IDs, so they replace what 3CX sets.')

    # ------------------------------------------------------------------------------------------ 3.4
    b.add('3.4', 'G.722 wideband codec',
          'A wideband codec sampled at 16 kHz and 64 kbit/s that gives HD voice quality with an average transcoding load; it is in the 3CX app codec list alongside Opus, PCMU, PCMA, and G.729.',
          'improve the clarity of calls between desk phones on the office network with HD audio',
          ['G.711 codec', 'G.729 codec', 'Opus codec'],
          '16 kHz wideband (HD) at 64 kbit/s — better clarity than G.711\'s 8 kHz.',
          S.facts([('Sampling', '16 kHz wideband'), ('Bitrate', '64 kbit/s'), ('Transcoding', 'average CPU load'), ('Use', 'HD voice on good links')], title='G.722'),
          caption='G.722 gives HD voice at 16 kHz and 64 kbit/s.')

    b.add('3.4', 'Opus codec',
          'A codec that needs only about 20 kbit/s at 16 kHz but is processor-intensive to transcode, at roughly one thread per 50 endpoints, so it suits low-bandwidth users while costing the server more CPU.',
          'keep voice quality acceptable for remote users on slow connections while accepting a higher load on the server',
          ['G.711 codec', 'G.729 codec', 'G.722 wideband codec'],
          'LOW bandwidth, HIGH CPU — about one thread per 50 endpoints.',
          S.facts([('Sampling', '16 kHz'), ('Bitrate', 'about 20 kbit/s'), ('Transcoding', 'processor-intensive'), ('Capacity', '1 thread per 50 users')], title='Opus'),
          caption='Opus uses little bandwidth but a lot of CPU when transcoding.')

    b.add('3.4', 'App codec priority',
          'A setting in Admin > Advanced > Codecs that orders codecs for calls made through the 3CX apps only, with separate lists for mobile-network and Wi-Fi connections; SIP trunk and IP phone codecs are set separately, and the defaults are recommended.',
          'choose which audio formats the smartphone app prefers when it is on cellular data rather than office Wi-Fi',
          ['Codec negotiation', 'G.711 codec', 'Trunk provider template'],
          'Affects ONLY the apps — trunks and phones have their own codec settings.',
          S.flow_split(('Codec priority setting', 'applies to 3CX apps only'), [('Mobile network', 'its own list'), ('Wi-Fi network', 'its own list')], title='App codec lists', tones=['blue', 'green']),
          caption='App codec priority can differ between mobile-network and Wi-Fi connections.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('SIP trunks and DID routing in V20', ['3.1', '3.2'],
              'To make and receive external calls you need an account with a SIP trunk (VoIP) provider; a supported provider is pre-configured and supported by both 3CX and the provider, while 3CX will not help configure an unsupported one. Add the trunk in Admin > Voice & Chat with a name, a default route, the provider, and either register-based details or IP-based authentication; an IP-based trunk has no registration, always shows green, and requires you to tell the provider if the PBX IP changes. The default route handles DIDs not assigned anywhere, the main trunk number is the default caller ID for extensions without their own DID, and the Limit to option makes a trunk system-wide or department-specific.\n\n'
              'In V20 you route a DID by choosing it in the Assigned DID Number(s) list of the destination: a queue, ring group, or digital receptionist under Call Handling, or a user on the General tab. To find out why a call is misrouted, raise the Activity Log to Medium or Verbose and check the DID that arrived (the "called=" value or the To header). For SMS, enable it on the trunk, exchange webhooks with the provider, and enter every DID in E.164 format.')
    b.section('Outbound rules and emergency numbers', ['3.3'],
              'An outbound rule triggers on the dialed prefix, the length of the number, the calling extensions, and the calling departments (the extension and department lists are cumulative), may strip or prepend digits, and can set an outbound caller ID, which the provider may still ignore because most do not allow unverified caller IDs. Rules are evaluated top to bottom and the first match wins; new rules go to the bottom and are moved up for priority.\n\n'
              'Each rule has up to five routes tried in order: an unregistered trunk is skipped, but a busy answer (486, 600, 1408) ends the attempt, and answered or cancelled calls stop the hunt. With several routes, early media is dropped. Emergency numbers (Admin > System > Emergency) ignore outbound and office-hours rules, need one route plus up to four alternates, and can notify by email, chat, or an announcement.')
    b.section('Codecs and audio quality', ['3.4'],
              'G.711 (PCMU and PCMA) uses 8 kHz at 64 kbit/s with very little CPU, G.722 is 16 kHz wideband at 64 kbit/s with average CPU, G.729 is 8 kbit/s with higher CPU, and Opus is about 20 kbit/s but needs roughly one thread per 50 endpoints. The codec priority under Admin > Advanced > Codecs applies only to calls through the 3CX apps and can differ for mobile-network and Wi-Fi connections; trunk and IP phone codecs are configured separately and the defaults are recommended.')
