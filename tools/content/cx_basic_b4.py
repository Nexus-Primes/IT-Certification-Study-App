"""3CX Basic, domain b4 (Call Handling Features): IVR menus and prompts, ring groups, paging, call queue strategies and options, and office hours.

Checked against the 3CX administrator manual (IVR, call queues and ring groups, and office hours pages, 2026).
"""
import svg as S

DOMAIN = 'b4'


def build(b):
    b.topics['4.1'] = ['Digital Receptionist', 'Prompts', 'Menu options', 'Option limit', 'Invalid input', 'Department menu', 'Holidays']
    b.topics['4.2'] = ['Ring groups', 'Ring strategy', 'Ring time', 'Overflow', 'Time-specific destinations', 'Paging multicast', 'Members']
    b.topics['4.3'] = ['Queues', 'Polling strategies', 'Skills-based routing', 'Callbacks', 'Login and logout', 'Wrap-up', 'Priority', 'Announcements', 'SLA']
    b.topics['4.4'] = ['Department hours', 'Breaks', 'Time zones', 'Holidays', 'Custom holiday messages']

    # ------------------------------------------------------------------------------------------ 4.1
    b.add('4.1', 'IVR menu size limit',
          'A standard IVR (digital receptionist) menu offers up to 10 options, but you can create as many IVR menus as you need and send a key to another menu; the practical limit is the caller\'s patience.',
          'decide how many choices one main menu can give callers before it has to be split up',
          ['IVR prompt recording', 'Holiday schedule (IVR)', 'Ring group overflow'],
          'Up to 10 options per menu — chain another IVR rather than adding more keys.',
          S.steps([('Main menu', 'up to 10 key options'), ('A key can lead', 'to another IVR menu'), ('Keep it short', 'callers lose patience')], title='Menu size', tones=['blue', 'plain', 'amber']),
          caption='A standard IVR menu has up to 10 options, and menus can lead to further menus.')

    b.add('4.1', 'IVR invalid input handling',
          'The IVR Options settings that decide where a call goes when the caller presses nothing or an invalid key, and whether callers may dial an internal extension directly during the menu.',
          'send callers who press nothing or a wrong key to the front desk',
          ['IVR menu options', 'Ring group overflow', 'Fallback/failover routing'],
          'Set it in the IVR\'s OPTIONS tab — alongside the direct-dial-extensions switch.',
          S.flow_split(('Caller reaches the menu', 'IVR waits for a key'), [('Valid key', 'goes to its destination'), ('No or invalid input', 'Options tab destination')], title='Invalid input', tones=['green', 'amber']),
          caption='The IVR Options tab sets where calls go after no input or an invalid key.')

    b.add('4.1', 'IVR prompt audio format',
          'Pre-recorded IVR greetings must be uncompressed PCM WAV files at 8 kHz, 16-bit, mono, with no reserved characters in the file name; MP3 is not supported, and 3CX provides an audio converter tool for other formats.',
          'prepare a pre-recorded greeting file so that the phone system accepts it',
          ['IVR prompt recording', 'G.711 codec', 'Email-to-voicemail'],
          'PCM WAV, 8 kHz, 16-bit, MONO — and never MP3.',
          S.facts([('File type', 'PCM WAV'), ('Quality', '8 kHz, 16-bit'), ('Channels', 'mono'), ('Avoid', 'MP3, reserved characters')], title='Prompt format'),
          caption='IVR prompts must be PCM WAV, 8 kHz, 16-bit, mono.')

    b.add('4.1', 'Department menu',
          'A simple digital receptionist that plays one welcome announcement and routes calls by office hours, with separate announcements for breaks, closed times, and holidays; it exists mainly for backward compatibility.',
          'greet callers with an announcement and route them by open, break, and closed times without a keypad menu',
          ['Digital Receptionist', 'IVR menu options', 'Business hours schedule'],
          'An ANNOUNCEMENT plus hours-based routing — no keys for the caller to press.',
          S.compare(('Standard IVR', ['Up to 10 key options', 'Caller chooses a path', 'Full menu']), ('Department menu', ['One announcement', 'Routes by office hours', 'Backward compatibility']), title='IVR types'),
          caption='A department menu plays an announcement and routes by office hours instead of by keypress.')

    # ------------------------------------------------------------------------------------------ 4.2
    b.add('4.2', 'Ring time',
          'How long a ring group phone rings before the call is considered unanswered: the default is 20 seconds for a ring group, while for a queue (default 30 seconds) it is how long the current members ring before a new polling cycle starts.',
          'control how long a group\'s phones ring before the call moves on',
          ['Ring strategy', 'Ring group overflow', 'Business hours schedule'],
          'Default 20 s for a ring group — 30 s per polling cycle for a queue.',
          S.table(['Object', 'Default ring time'], [('Ring group', '20 seconds'), ('Queue', '30 seconds per cycle')], title='Ring time defaults', col_widths=[0.45, 0.55]),
          caption='Ring time defaults to 20 seconds for ring groups and 30 seconds per cycle for queues.')

    b.add('4.2', 'Time-specific unanswered destinations',
          'Separate destinations and announcements for unanswered calls during office hours, break hours, and holidays, set on a ring group or queue, which follows the office hours of its department.',
          'send unanswered calls to voicemail at lunch, to an after-hours menu in the evening, and to a holiday prompt on public holidays',
          ['Ring group overflow', 'Time-based inbound routing', 'Holiday schedule (IVR)'],
          'Different outcomes for office hours, BREAK hours, out-of-office hours, and HOLIDAYS.',
          S.table(['When unanswered', 'Destination set separately'], [('Out of office hours', 'yes'), ('Break hours', 'yes'), ('Holidays', 'yes, with a prompt')], title='Unanswered calls', col_widths=[0.55, 0.45]),
          caption='Ring groups and queues set separate unanswered destinations for hours, breaks, and holidays.')

    b.add('4.2', 'Paging multicast',
          'A paging strategy that sends one audio stream to a multicast address instead of targeting individual extensions, suiting large groups; phones must support multicast, be on the same local subnet as 3CX, and be provisioned to listen to the address.',
          'broadcast an announcement to a very large number of phones on one site without calling each of them',
          ['Paging / intercom', 'Ring group', 'Hot desking'],
          'One stream to a multicast ADDRESS — same subnet, multicast-capable phones.',
          S.steps([('Set multicast address', 'target for the audio'), ('Provision phones', 'to listen to it'), ('Page sends one stream', 'all phones play it')], title='Paging multicast', tones=['plain', 'blue', 'green']),
          caption='Paging multicast sends one audio stream to a multicast address for large paging groups.')

    # ------------------------------------------------------------------------------------------ 4.3
    b.add('4.3', 'Prioritized Hunt strategy',
          'A polling strategy that rings members one after another from the top of the list downward until someone answers, so for every call the first member tried is the one at the top.',
          'always offer calls first to the most senior agent and only try others when that agent does not answer',
          ['Ring All strategy', 'Round Robin strategy', 'Longest Waiting strategy'],
          'List ORDER matters — the top member is called first every time.',
          S.steps([('Agent 1 rings first', 'top of the list'), ('No answer', 'agent 2 rings next'), ('Continues downward', 'until someone answers')], title='Prioritized Hunt', tones=['blue', 'plain', 'green']),
          caption='Prioritized Hunt rings members in list order, starting at the top for every call.')

    b.add('4.3', 'Ring All strategy',
          'A polling strategy that rings every member at the same moment until one picks up, or until the ring time or maximum queue wait time is reached.',
          'make every agent\'s phone ring at once so the first available person answers',
          ['Prioritized Hunt strategy', 'Hunt by Threes strategy', 'Round Robin strategy'],
          'ALL members ring simultaneously — the first to answer takes the call.',
          S.steps([('Call arrives', 'in the queue'), ('All agents ring', 'at the same time'), ('First to answer', 'takes the call')], title='Ring All', tones=['plain', 'blue', 'green']),
          caption='Ring All rings every member simultaneously until someone answers.')

    b.add('4.3', 'Hunt Random Start strategy',
          'A polling strategy that picks a random member to ring first for each call, which effectively spreads calls evenly across the members.',
          'spread calls across agents by starting each call at a randomly chosen member',
          ['Prioritized Hunt strategy', 'Round Robin strategy', 'Fewest Answered strategy'],
          'The START point is random each call — unlike Prioritized Hunt\'s fixed top-of-list start.',
          S.steps([('New call arrives', 'in the queue'), ('Random first agent', 'start of the polling'), ('Calls spread evenly', 'across the members')], title='Hunt Random Start', tones=['plain', 'blue', 'green']),
          caption='Hunt Random Start picks a random first member for each call.')

    b.add('4.3', 'Round Robin strategy',
          'A polling strategy that distributes incoming calls evenly among the logged-in agents so that each gets a fair share.',
          'give each logged-in agent a fair, rotating share of incoming calls',
          ['Hunt Random Start strategy', 'Prioritized Hunt strategy', 'Longest Waiting strategy'],
          'A fair ROTATION among logged-in agents — each takes a turn.',
          S.steps([('Call 1', 'goes to agent A'), ('Call 2', 'goes to agent B'), ('Call 3', 'goes to agent C')], title='Round Robin', tones=['blue', 'green', 'amber']),
          caption='Round Robin shares calls evenly among the logged-in agents.')

    b.add('4.3', 'Longest Waiting strategy',
          'A polling strategy that forwards each call to the member who has been waiting the longest for a call.',
          'offer the next call to whichever agent has been waiting the longest',
          ['Least Talk Time strategy', 'Fewest Answered strategy', 'Round Robin strategy'],
          'Picks the member WAITING the longest — based on waiting, not talk time or call counts.',
          S.steps([('Agents are waiting', 'each has a wait time'), ('Longest wait found', 'members compared'), ('That agent rings', 'gets the call')], title='Longest Waiting', tones=['plain', 'blue', 'green']),
          caption='Longest Waiting offers the call to the member who has waited longest.')

    b.add('4.3', 'Least Talk Time strategy',
          'A polling strategy that forwards each call to the member with the least total talk time.',
          'balance workloads by giving the next call to the agent who has spent the least time on calls',
          ['Longest Waiting strategy', 'Fewest Answered strategy', 'Round Robin strategy'],
          'Balances TALK TIME — not the NUMBER of calls answered.',
          S.steps([('Talk totals compared', 'for each agent'), ('Least talk time', 'agent selected'), ('That agent rings', 'gets the call')], title='Least Talk Time', tones=['plain', 'blue', 'green']),
          caption='Least Talk Time sends the call to the agent with the lowest total talk time.')

    b.add('4.3', 'Fewest Answered strategy',
          'A polling strategy that forwards each call to the member who has answered the fewest calls.',
          'give the next call to the agent who has answered the fewest calls so far',
          ['Least Talk Time strategy', 'Longest Waiting strategy', 'Round Robin strategy'],
          'Balances the NUMBER of calls answered — not how long they lasted.',
          S.steps([('Answer counts compared', 'for each agent'), ('Fewest answered', 'agent selected'), ('That agent rings', 'gets the call')], title='Fewest Answered', tones=['plain', 'blue', 'green']),
          caption='Fewest Answered sends the call to the agent who has answered the fewest calls.')

    b.add('4.3', 'Hunt by Threes strategy',
          'A polling strategy that rings three agents at the same time, chosen either randomly (Hunt by Threes Random) or in list order (Hunt by Threes Prioritized).',
          'ring a small group of three agents at a time instead of one agent or everyone',
          ['Ring All strategy', 'Prioritized Hunt strategy', 'Hunt Random Start strategy'],
          'THREE at a time — Random picks them randomly, Prioritized takes them in list order.',
          S.compare(('Threes Random', ['3 agents at once', 'Chosen at random', 'Until answered']), ('Threes Prioritized', ['3 agents at once', 'In list order', 'Until answered']), title='Hunt by Threes'),
          caption='Hunt by Threes rings three agents simultaneously, picked randomly or in list order.')

    b.add('4.3', 'Skills-based escalation (AI edition)',
          'In the AI edition, agents are tagged with skill levels 1 to 5 and calls go first to level 1, then the polling widens to further levels by availability, by time, or cumulatively (which keeps the earlier agents in the pool).',
          'target the best-matching agents first and widen the pool of agents if nobody picks up',
          ['Longest Waiting strategy', 'Queue agents', 'Ring group overflow'],
          'Skill LEVEL 1 first — then escalate by availability, by time, or cumulatively.',
          S.table(['Escalation type', 'Next level is polled'], [('Availability-Driven', 'if none free'), ('Time-Driven', 'after set seconds'), ('Cumulative', 'added to the pool')], title='Skills-based escalation', col_widths=[0.5, 0.5]),
          caption='Skills-based polling starts at skill level 1 and widens to further levels.')

    b.add('4.3', 'Queue callbacks',
          'A queue option that lets callers hang up and be called back when an agent becomes available, triggered by the caller\'s request, automatically after a timeout, or by accepting an offer made after a set time (default 600 seconds); an unanswered callback counts as failed.',
          'let callers hang up instead of waiting and have the queue ring them back when an agent is free',
          ['Queue wallboard', 'Call parking', 'Ring group overflow'],
          'Caller HANGS UP, the queue CALLS BACK — an unanswered callback counts as failed.',
          S.steps([('Caller picks callback', 'request or offer'), ('Agent becomes free', 'in the queue'), ('Queue dials the caller', 'failed if unanswered')], title='Queue callbacks', tones=['plain', 'blue', 'green']),
          caption='Queue callbacks let callers hang up and be called back when an agent is available.')

    b.add('4.3', 'Queue login and logout',
          'Queue members must be logged in to receive queue calls; a user can log in or out manually, and the Log out from queues option under Call Forwarding can log them out automatically for each status.',
          'stop an agent on a lunch break from receiving queue calls without removing them from the queue',
          ['Queue agents', 'Do Not Disturb (DND)', 'Group membership management'],
          'Members must be LOGGED IN to get calls — status can log them out automatically.',
          S.flow_split(('Agent is a queue member', 'but logged in?'), [('Logged in', 'receives queue calls'), ('Logged out', 'receives none')], title='Queue login', tones=['green', 'red']),
          caption='Only logged-in queue members receive queue calls.')

    b.add('4.3', 'Wrap-up time (AI edition)',
          'A queue preference giving an agent a number of seconds to finish after a call before the queue offers another.',
          'give agents a short pause after each call to finish their notes',
          ['Ring time', 'Service level agreement (SLA) threshold', 'Maximum callers in queue (AI edition)'],
          'A pause AFTER the call, before the NEXT queue call arrives.',
          S.steps([('Call ends', 'agent is free'), ('Wrap-up seconds', 'no new queue calls'), ('Next call offered', 'queue resumes')], title='Wrap-up time', tones=['plain', 'amber', 'green']),
          caption='Wrap-up time pauses new queue calls for an agent after each call.')

    b.add('4.3', 'Maximum callers in queue (AI edition)',
          'A queue preference that caps how many callers can wait; a call arriving above the cap is delivered according to the destinations set in the queue\'s General tab.',
          'send new callers somewhere else when the queue already holds too many waiting callers',
          ['Service level agreement (SLA) threshold', 'Wrap-up time (AI edition)', 'Ring group overflow'],
          'A CAP on waiting callers — extra calls follow the General tab\'s destinations.',
          S.flow_split(('New caller arrives', 'queue count checked'), [('Below the cap', 'joins the queue'), ('Above the cap', 'General tab destination')], title='Queue cap', tones=['green', 'amber']),
          caption='When the queue is above its caller cap, extra calls follow the General tab destinations.')

    b.add('4.3', 'Priority queue (AI edition)',
          'A queue setting that makes its calls reach agents with higher priority than calls from other queues the same agents serve.',
          'make agents who serve several queues take VIP callers ahead of the general queue\'s callers',
          ['Queue strategy', 'Skills-based escalation (AI edition)', 'Queue agents'],
          'Priority between QUEUES for shared agents — not a polling strategy.',
          S.compare(('Priority queue', ['Agent also serves others', 'Its calls come first', 'Set on the queue']), ('Normal queue', ['Same shared agents', 'Waits behind priority calls', 'Default behavior']), title='Queue priority'),
          caption='A priority queue\'s calls reach shared agents ahead of other queues\' calls.')

    b.add('4.3', 'Queue caller announcements',
          'Queue options that talk to waiting callers: an intro prompt (optionally heard in full), comfort prompts at a set frequency, music on hold, and announcements of queue position or estimated wait time at a set interval.',
          'tell waiting callers where they are in line and how long to expect to wait',
          ['Queue wallboard', 'Holiday schedule (IVR)', 'IVR prompt recording'],
          'Position and estimated WAIT are announced at an interval you set.',
          S.hub(('Queue prompts',), [('Intro', 'optional, in full'), ('Comfort', 'set frequency'), ('Position', 'and wait time'), ('Music', 'on hold')], title='Talking to callers'),
          caption='Queues can play intro prompts, comfort prompts, music, and position or wait announcements.')

    # ------------------------------------------------------------------------------------------ 4.4
    b.add('4.4', 'Destination-based office hours',
          'In V20, office hours are applied by the department of the endpoint where the call arrives rather than by the trunk it came in on, so numbers on one trunk can follow different hours; SMB and Multi-Company systems have one set of hours.',
          'give sales a longer lunch break than support although both numbers arrive on a single trunk',
          ['Business hours schedule', 'Time-based inbound routing', 'Special/holiday days'],
          'The DESTINATION decides — not the trunk the call came in on.',
          S.compare(('Hours at the trunk', ['Same hours for all DIDs', 'One trunk, one schedule', 'Not how V20 works']), ('Hours at the destination', ['Queue or IVR\'s department', 'Different hours per DID', 'How V20 works']), title='Where hours apply'),
          caption='V20 office hours are applied by the department of the destination, not the trunk.')

    b.add('4.4', 'Break hours routing',
          'Office hours can include break times, and calls to a destination during a break use its break destination while users\' status switches to Away, so lunchtime can be handled differently from open and closed times.',
          'route calls differently during the lunch hour than for the rest of the working day',
          ['Business hours schedule', 'Do Not Disturb (DND)', 'Special/holiday days'],
          'Three states: open, BREAK, and closed — each with its own destination.',
          S.table(['Time period', 'Destination used'], [('Office hours', 'during-hours route'), ('Break times', 'break route'), ('Outside hours', 'out-of-office route')], title='Three time states', col_widths=[0.5, 0.5]),
          caption='Calls during break times use a break destination separate from open and closed routes.')

    b.add('4.4', 'Department time zone',
          'A time zone set on a department\'s office hours so that a site in another region opens and closes on its own local clock.',
          'make a branch in another time zone open and close on its own local time',
          ['Company information configuration', 'Business hours schedule', 'Destination-based office hours'],
          'Set at the BOTTOM of the Office Hours page, per department.',
          S.steps([('Pick the department', 'in Office Hours'), ('Enter its hours', 'in local time'), ('Set the time zone', 'at the bottom')], title='Department time zone', tones=['plain', 'blue', 'green']),
          caption='Each department can have its own time zone for its office hours.')

    b.add('4.4', 'Custom holiday messages',
          'Since V20 Update 9, custom holiday messages can be set in the holiday routing of queues, ring groups, IVRs, and departments; the Holiday Call Flow Script remains for advanced cases such as ending a call after a prompt or excluding specific DIDs.',
          'play a different closure message on a public holiday for the support queue',
          ['Holiday schedule (IVR)', 'Special/holiday days', 'Business hours schedule'],
          'Set it in the holiday ROUTING settings — use the Holiday Call Flow Script only for advanced cases.',
          S.steps([('Add the holiday', 'Office Hours > Holidays'), ('Set the routing', 'queue, group, IVR'), ('Record the message', 'custom for that object')], title='Holiday messages', tones=['plain', 'blue', 'green']),
          caption='V20 Update 9 added custom holiday messages to holiday routing settings.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('IVR menus, prompts, and invalid input', ['4.1'],
              'A standard IVR / digital receptionist menu offers up to 10 options, and you can create as many menus as you need and send a key to another one. Its prompt can be recorded or uploaded; a pre-recorded file must be PCM WAV, 8 kHz, 16-bit, mono, with no reserved characters in the file name and no MP3. The IVR inherits the office hours of its department, and the Options tab sets where calls go when there is no input or an invalid key and whether callers may dial extensions directly. A department menu is the simple alternative that plays one announcement and routes by office hours.')
    b.section('Ring groups, paging, and queue strategies', ['4.2', '4.3'],
              'A ring group rings its members using Prioritized Hunt (list order, always from the top) or Ring All (everyone at once) for the ring time (default 20 seconds), with separate unanswered destinations for office hours, breaks, out-of-office hours, and holidays. Paging strategies use the paging dial code; Paging Multicast sends one stream to a multicast address, needing multicast phones on the same subnet as 3CX.\n\n'
              'A queue also offers Hunt Random Start, Round Robin (fair rotation), Longest Waiting, Least Talk Time, Fewest Answered, and Hunt by Threes (random or prioritized). The AI edition adds skills-based strategies (skill levels 1 to 5 with availability-driven, time-driven, or cumulative escalation), wrap-up time, maximum callers in queue, priority queue, and SLA time. Members must be logged in to receive calls, callers can request a callback, and prompts can announce queue position or estimated wait.')
    b.section('Office hours, breaks, time zones, and holidays', ['4.4'],
              'Office hours are set per department in V20 and applied at the destination: an IVR, queue, ring group, or extension uses the hours of the department it belongs to, whichever trunk the call arrived on. Hours include breaks, each department can have its own time zone, and SMB and Multi-Company systems have a single set of hours.\n\n'
              'Add holidays under Office Hours, and from V20 Update 9 set custom holiday messages in the holiday routing of queues, ring groups, IVRs, and departments; the Holiday Call Flow Script handles advanced cases. A Receptionist or Manager can override office hours from the Web Client avatar menu by choosing the department, the mode, and the duration.')
