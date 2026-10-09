"""3CX Advanced, domain a5 (Troubleshooting & Diagnostics): registration and notification faults, firewall check behavior, log levels, reports, and alerts.

Checked against the 3CX administrator manual (advanced system features, firewall checker, call reports, system management, and DID routing pages, 2026).
"""
import svg as S

DOMAIN = 'a5'


def build(b):
    b.topics['5.1'] = ['One-way audio', 'Registration failure', 'IP blacklisting', 'NAT issues', 'Codec mismatch', 'Missing app notifications']
    b.topics['5.2'] = ['SIP trace', 'Activity log levels', 'Packet capture', 'Firewall checker', 'SIP ALG hash test', 'Checker side effects']
    b.topics['5.3'] = ['Queue reports', 'SLA reports', 'Abandoned calls', 'Agent login history', 'Extension reports', 'CDR service', 'Scheduled reports', 'AI summary and sentiment', 'Inbound rules report']
    b.topics['5.4'] = ['Capacity planning', 'Performance dashboards', 'Event alerts', 'License limit events', 'Log correlation', 'Vendor escalation']

    # ------------------------------------------------------------------------------------------ 5.1
    b.add('5.1', 'Registration failure from IP blacklisting',
          'A phone or user that suddenly cannot authenticate because its IP address was automatically blocked after more than 10 wrong passwords or more than 5 incorrect registrations, and so appears in the IP blacklist.',
          'work out why a phone that worked yesterday can no longer register after someone mistyped the password repeatedly',
          ['Extension/trunk registration failure', 'Codec mismatch', 'One-way audio'],
          'More than 10 bad passwords or 5 bad registrations — check the IP BLACKLIST first.',
          S.steps([('Repeated failures', 'bad logins or registers'), ('IP is auto-blocked', 'listed in IP Blacklist'), ('Device cannot register', 'remove the entry')], title='Blocked by anti-hacking', tones=['amber', 'red', 'green']),
          caption='Repeated bad passwords or registrations get an IP address blacklisted, which then fails to register.')

    b.add('5.1', 'Missing app call notifications',
          'A smartphone app that only shows calls while it is open usually cannot receive the push messages the PBX sends through Google or Apple, so outbound access to those push services must be checked.',
          'work out why the smartphone app rings only when it is already open on the screen',
          ['NAT-related call issues', 'One-way audio', 'Codec mismatch'],
          'Check PUSH connectivity — outbound 443 for Android; 443, 2197, 5223 for iOS.',
          S.steps([('Call reaches the PBX', 'for the app user'), ('PBX sends a push', 'Google or Apple'), ('App wakes up and rings', 'blocked push = no ring')], title='Push path', tones=['plain', 'blue', 'amber']),
          caption='Apps that do not ring in the background usually cannot receive the PBX\'s push notifications.')

    # ------------------------------------------------------------------------------------------ 5.2
    b.add('5.2', 'SIP ALG hash test',
          'A Firewall Checker test where 3CX sends a generic INVITE to an online service, calculates a CRC32 hash locally, and compares it with the X-CSREQ hash returned; a mismatch means something between them altered the message, so SIP ALG is active.',
          'prove that a router is rewriting the SIP messages that pass through it',
          ['Packet capture', 'SIP trace / activity log', 'Codec mismatch'],
          'A HASH mismatch means the SIP message was ALTERED on the way — SIP ALG is active.',
          S.steps([('Send a generic INVITE', 'to the 3CX service'), ('Compare CRC32 hashes', 'local vs. X-CSREQ'), ('Mismatch = ALG active', 'a hop altered it')], title='SIP ALG test', tones=['plain', 'blue', 'red']),
          caption='The SIP ALG test compares a local hash with the one returned to detect altered messages.')

    b.add('5.2', 'Firewall Checker side effects',
          'Running the Firewall Checker temporarily stops and restarts PBX services so the SIP ports are free for testing, and it uses 3CX\'s STUN servers, whose addresses must be allowed through the firewall.',
          'schedule the firewall check so that it does not interrupt live calls',
          ['Maintenance updates', 'Restore service impact', 'Packet capture'],
          'PBX services STOP during the test — run it off-hours, with the STUN servers allowed.',
          S.flow_split(('Click Start in the checker', 'tests begin'), [('Services stop and restart', 'ports freed for testing'), ('Results shown live', 'press Stop to end early')], title='Running the checker', tones=['amber', 'green']),
          caption='The Firewall Checker stops and restarts PBX services while it tests.')

    b.add('5.2', 'Activity Log verbosity levels',
          'Log levels that control how much SIP detail is recorded: Medium shows lines such as called= with the DID and its destination, and Verbose also shows the full INVITE headers, including the To header and Request Line.',
          'see the raw SIP headers of a call to check which number the provider actually sent',
          ['Packet capture', 'Event log', 'Audit logging of admin changes'],
          'MEDIUM shows called=; VERBOSE shows the INVITE headers.',
          S.table(['Log level', 'What you see'], [('Medium', 'called= and destination'), ('Verbose', 'To header, INVITE detail')], title='Activity Log levels', col_widths=[0.35, 0.65]),
          caption='The Medium level shows the called DID and the Verbose level shows full INVITE headers.')

    # ------------------------------------------------------------------------------------------ 5.3
    b.add('5.3', 'SLA breaches report',
          'A queue report showing how many calls waited longer than the configured SLA time, alongside the SLA Statistics report that gives the number and percentage of calls missed against the SLA, usually excluding calls dropped within 10 seconds.',
          'report how many callers waited longer than the service-level target',
          ['Service level agreement (SLA) threshold', 'Queue reports', 'Extension/agent reports'],
          'SLA BREACHES counts calls over the SLA time — SLA STATISTICS gives the missed percentage.',
          S.compare(('SLA Statistics', ['Total calls received', 'Number and percent missed', 'Often excludes 10 s drops']), ('SLA Breaches', ['Calls that waited too long', 'Uses the SLA time', 'Count per queue']), title='SLA reports'),
          caption='SLA reports show calls missed and calls that waited longer than the configured SLA time.')

    b.add('5.3', 'Abandoned queue calls report',
          'A queue report counting calls that entered a queue but were not answered, which helps estimate waiting time; related reports show answered calls by waiting time, callbacks requested, and failed callbacks.',
          'measure how many callers gave up before an agent answered',
          ['SLA breaches report', 'Queue wallboard', 'Extension/agent reports'],
          'Entered the queue but NEVER answered — the callers who gave up.',
          S.hub(('Queue statistics',), [('Abandoned', 'never answered'), ('By wait time', 'answered calls'), ('Callbacks', 'requested'), ('Failed', 'callbacks')], title='Related queue reports'),
          caption='The abandoned calls report counts queue callers who were never answered.')

    b.add('5.3', 'Agent login history report',
          'A report showing the queue login and logout history of one agent, used to confirm when they were available to take queue calls.',
          'check when a particular agent was logged in to the queue during the day',
          ['Extension/agent reports', 'Audit logging of admin changes', 'Queue login and logout'],
          'LOGIN and LOGOUT times for an agent — not their call counts.',
          S.steps([('Agent logs in', 'available for the queue'), ('Agent logs out', 'no queue calls'), ('Report lists both', 'per agent, over time')], title='Login history', tones=['green', 'amber', 'blue']),
          caption='The agent login history report lists when an agent logged in to and out of queues.')

    b.add('5.3', 'Scheduled reports',
          'Reports scheduled from the funnel icon with Save/Schedule are emailed as a link with a CSV attached, using the group\'s time zone, with all of a user\'s scheduled reports combined into one email; only Managers, Supervisors, Group Owners, and System Owners see the Reports menu.',
          'receive a weekly queue report automatically as a spreadsheet attachment',
          ['Queue reports', 'Custom reporting API access', 'Extension/agent reports'],
          'Emailed with a CSV — usable as a BI data source such as Power BI.',
          S.steps([('Open a report', 'click the funnel icon'), ('Choose Save/Schedule', 'name and frequency'), ('Email with a CSV', 'one email per user')], title='Scheduling a report', tones=['plain', 'blue', 'green']),
          caption='Scheduled reports are emailed with a link and a CSV file.')

    b.add('5.3', 'AI call summary and sentiment (AI edition)',
          'In the AI edition, the call log and several reports add a transcription, a summary, and a sentiment score for each call, and extension and ring group reports aggregate average sentiment.',
          'review how customers felt about calls without listening to the recordings',
          ['Call recording', 'Queue reports', 'Extension/agent reports'],
          'Needs the AI EDITION — transcription, summary, and a sentiment SCORE per call.',
          S.facts([('Call log', 'transcription, summary, score'), ('Extension statistics', 'average sentiment'), ('Ring groups', 'sentiment per group'), ('Edition', 'AI edition required')], title='AI reporting'),
          caption='The AI edition adds transcription, summary, and sentiment to call reports.')

    b.add('5.3', 'Inbound rules report',
          'A system report listing all inbound call routes, showing which DIDs route to which extensions and other destinations.',
          'audit which public numbers lead to which destinations on the system',
          ['Assigning DIDs to destinations', 'Call recording', 'Queue reports'],
          'Lists every DID and where it ROUTES — a configuration view, not a call history.',
          S.table(['DID', 'Routed to'], [('Main number', 'Reception IVR'), ('Support number', 'Support queue'), ('Direct line', 'A user extension')], title='Inbound routes', col_widths=[0.45, 0.55]),
          caption='The inbound rules report shows which DIDs route to which destinations.')

    # ------------------------------------------------------------------------------------------ 5.4
    b.add('5.4', 'Event alert notifications',
          'Email alerts for critical events configured in Admin > System > Alerts, so administrators hear about things such as trunk failovers or the license call limit without watching the event log.',
          'be emailed immediately when a trunk fails over or the license limit is reached',
          ['Audit logging of admin changes', 'Performance monitoring dashboards', 'Queue reports'],
          'Set in System > Alerts — EMAIL on the events you pick.',
          S.steps([('Event occurs', 'trunk failover, limit hit'), ('3CX checks Alerts', 'which events notify?'), ('Email is sent', 'to the admins chosen')], title='Alerts', tones=['amber', 'blue', 'green']),
          caption='Event alerts email administrators about critical events such as trunk failovers.')

    b.add('5.4', 'License limit event',
          'Event ID 8193, logged when the license\'s concurrent call limit is reached; if it happens often, the license should be upgraded.',
          'recognize that the system is regularly running out of licensed simultaneous calls',
          ['Capacity planning for growth', 'Performance monitoring dashboards', 'Queue reports'],
          'Event 8193 repeating = time to UPGRADE the license.',
          S.flow_split(('Concurrent calls hit the limit', 'event 8193 logged'), [('Occasional', 'note it'), ('Frequent', 'upgrade the license')], title='License limit event', tones=['plain', 'amber']),
          caption='Event 8193 shows the concurrent call limit was reached; frequent events mean upgrading.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Troubleshooting registrations, notifications, and the firewall', ['5.1', '5.2'],
              'A device that suddenly cannot register may have been blocked by anti-hacking (more than 10 wrong passwords or 5 incorrect registrations), so check the IP Blacklist. An app that only rings while open usually cannot reach Google or Apple push services. The Firewall Checker tests port preservation and full cone NAT using STUN, and a SIP ALG test that compares a locally calculated CRC32 hash with the X-CSREQ value returned by a 3CX service; the checker stops and restarts PBX services while it runs.\n\n'
              'Activity Log levels give more detail: Medium shows lines such as called= with the DID and its destination, and Verbose shows the full INVITE headers, including the To header and Request Line.')
    b.section('Reports and monitoring', ['5.3', '5.4'],
              'Queue reports include abandoned calls, answered calls by waiting time, callbacks and failed callbacks, SLA Statistics (missed calls against the SLA, usually excluding calls dropped within 10 seconds) and SLA Breaches (calls that waited too long), and agent reports include Agent Login History. The Inbound Rules report shows which DIDs route where, and the AI edition adds transcription, summary, and sentiment. Schedule a report with the funnel icon and Save/Schedule; it is emailed as a link plus a CSV that works as a BI data source.\n\n'
              'The CDR service logs call records to a file or pushes them over TCP. Email alerts for critical events are set in Admin > System > Alerts, and a frequent event 8193 means the concurrent call limit is being reached and the license should be upgraded.')
