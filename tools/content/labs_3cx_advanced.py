"""New 3CX Advanced labs (v238): Boss-Secretary and forwarding priority, Microsoft 365 sync, anti-hacking blacklisting, Secure SIP on a custom
FQDN, active-passive failover, bridges versus SBCs, building a bridge, and picking the right report. Facts follow 3CX's administrator manual (2026)."""
from labs_lib import spread_answers, decision, scenario, sequence

C = 'core1'


def labs():
    out = []

    # ------------------------------------------------------------------------------------------ a1
    out.append(decision(
        'boss-secretary-decision', C, 'a1', 'Intermediate', 8,
        'Screen an executive\'s calls with Boss-Secretary',
        'Know what wins when forwarding rules collide, and which setting solves each request.',
        'An executive wants an assistant to screen calls. For each situation, choose the right setting or the right outcome.',
        [
            ('A call matches both a Boss-Secretary rule and an ordinary forwarding exception. Which one applies?',
             ['The Boss-Secretary rule', 'The forwarding exception', 'Whichever was created first', 'Both, one after the other'], 0,
             'Boss-Secretary rules have the highest priority and, once they forward a call, no other forwarding rule is applied to it.'),
            ('A few VIP callers must still ring the executive directly.',
             ['Add them as Allowed Direct Callers', 'Add them to a ring group', 'Create a CID rule for each', 'Turn off Boss-Secretary during the day'], 0,
             'Allowed Direct Callers bypass all forwarding and Boss-Secretary rules and ring the boss directly.'),
            ('The assistant should screen only outside callers, and only during working hours.',
             ['Set the screening hours and choose external calls only', 'Screen all calls all day', 'Use Do Not Disturb', 'Create two queues'], 0,
             'Boss-Secretary lets you choose the hours and whether internal, external, or all calls are screened.'),
            ('The executive\'s staff keep changing their own forwarding rules by mistake. How do you stop that?',
             ['Enable Hide Call Forwarding Rules under Users > Options > Restrictions', 'Remove them from their department', 'Disable their voicemail', 'Change them to the User role'], 0,
             'Hiding the forwarding rules in the user\'s Options > Restrictions stops them being edited.'),
            ('Calls from a known customer\'s numbers should go straight to an account manager.',
             ['A CID rule matching the caller\'s number', 'An outbound rule', 'A Boss-Secretary rule', 'A queue callback'], 0,
             'CID rules match the caller\'s number, exactly or with a wildcard, and route to a destination.'),
        ],
        'Forwarding is evaluated in order: Allowed Direct Callers, then Boss-Secretary logic (which stops any further forwarding), then the ordinary forwarding exceptions and rules. CID rules are inbound rules that match the caller\'s number.'))

    # ------------------------------------------------------------------------------------------ a2
    out.append(decision(
        'm365-sync-decision', C, 'a2', 'Intermediate', 8,
        'Predict what Microsoft 365 sync will do',
        'Learn the direction, schedule, and limits of the user sync, and fix a presence loop.',
        'The company syncs its users from Microsoft 365. Answer how the sync behaves.',
        [
            ('A person leaves and their account is deleted in Microsoft 365. What happens to their 3CX user?',
             ['It stays until someone removes it from 3CX by hand', 'It is deleted automatically that night', 'It is disabled automatically', 'It becomes a System Owner'], 0,
             'Deleting or disabling a user in Microsoft 365 does not remove the 3CX user; that has to be done manually.'),
            ('An administrator deletes a synced user in 3CX but the person still exists in Microsoft 365.',
             ['They reappear the next day', 'They are gone permanently', 'They are moved to another department', 'They are blocked from sign-in'], 0,
             'The sync is one way and runs nightly, so a user deleted only in 3CX returns the next day.'),
            ('Which direction does user synchronization run, and how many users can it handle?',
             ['One way, Microsoft 365 to 3CX, up to 650 users', 'Both ways, unlimited users', 'One way, 3CX to Microsoft 365, up to 50 users', 'Both ways, up to 650 users'], 0,
             'Users sync one way from Microsoft 365 to 3CX, nightly, for up to 650 users.'),
            ('With two-way presence sync, a user\'s status keeps flipping between Away and Do Not Disturb. What is the fix?',
             ['Make both directions map to the same status', 'Turn off the Teams license', 'Delete and re-import the user', 'Switch the user to SSO'], 0,
             'If 3CX Away becomes Teams Away but Teams Away becomes 3CX Do Not Disturb, each side overrides the other; map both to the same status.'),
            ('A company wants only the sales and support groups created in 3CX.',
             ['Sync only the selected Microsoft 365 departments', 'Import the whole directory and delete the rest', 'Create the departments first with the same names', 'Use a CSV import'], 0,
             'You can limit the sync to chosen departments; new 3CX departments are created from the Microsoft 365 group names and existing ones are not overwritten.'),
        ],
        'Microsoft 365 user sync is one way (to 3CX), nightly, limited to 650 users, and never removes a user for you. Presence can sync either way or both, but the two mappings must agree or the systems will loop.'))

    # ------------------------------------------------------------------------------------------ a3
    out.append(scenario(
        'ip-blacklist-scenario', C, 'a3', 'Intermediate', 10,
        'A phone suddenly cannot register',
        'Find out why one device cannot register when nothing on the network changed.',
        'A desk phone worked on Friday and has not registered since Monday morning. Nothing on the network changed.',
        ('A phone will not register', ['It worked on Friday', 'A user mistyped the password many times over the weekend', 'Other phones on the same network are fine']),
        {
            'start': ('Nothing changed on the network. Where do you look?', [('The IP Blacklist under Admin > Advanced', 'list', True), ('Replace the phone', 'bad_phone', False)]),
            'list': ('The phone\'s address is on the blacklist. Why was it put there?',
                     [('Anti-hacking blocks an address after more than 10 wrong passwords or more than 5 incorrect registrations', 'fix', True), ('Someone deleted the extension', 'bad_ext', False)]),
            'fix': ('What do you do?',
                    [('Correct the phone\'s credentials, then remove the blacklist entry', 'done', True), ('Whitelist the address without finding out why it failed', 'bad_white', False), ('Switch off anti-hacking', 'bad_off', False)]),
            'done': ('END', True, 'With the right credentials set and the entry removed, the phone registers again and anti-hacking stays on.'),
            'bad_phone': ('END', False, 'The phone was fine; the PBX was refusing it. The IP Blacklist lists addresses blocked after repeated failures.'),
            'bad_ext': ('END', False, 'A deleted extension would not explain a blocked address. Check the blacklist and the failed attempts.'),
            'bad_white': ('END', False, 'Whitelisting skips the anti-hacking checks for that address. Only do that for an address you trust, and fix the credentials first.'),
            'bad_off': ('END', False, 'Anti-hacking protects the whole system. Remove the one entry instead of weakening everything.'),
        },
        'Anti-hacking adds an address to the IP Blacklist after more than 10 wrong passwords or more than 5 incorrect registrations. When a device can no longer authenticate, check the list, fix the cause, and remove the entry; an Allow entry exempts only addresses you trust.'))

    out.append(sequence(
        'secure-sip-fqdn-sequence', C, 'a3', 'Advanced', 8,
        'Turn on Secure SIP for a custom domain name',
        'Put the steps for TLS on a PBX with its own domain name in order.',
        'The PBX uses the company\'s own FQDN instead of one provided by 3CX. Put the steps for enabling Secure SIP in order.',
        ['Confirm a static public IP and control of the domain\'s DNS records', 'Obtain a certificate from an authority your phones already trust', 'Keep the certificate, private key, and CA bundle files safe',
         'Open Admin > Advanced > Secure SIP and enable it', 'Paste the certificate and the key into their fields', 'Restart the PBX services when prompted', 'Choose TLS as the transport on each supported trunk'],
        'A custom FQDN needs a static public IP, a domain you control, and a certificate from an authority devices trust (a self-signed one must be imported on every endpoint). The certificate and key go into Advanced > Secure SIP and the services are restarted; supported trunks then use TLS as their transport.'))

    out.append(sequence(
        'failover-setup-sequence', C, 'a3', 'Advanced', 10,
        'Set up active-passive failover',
        'Put the steps for a standby PBX that takes over automatically in order.',
        'The company wants a second PBX ready to take over if the first fails. Put the setup steps in order.',
        ['Confirm an AI edition license and that the PBX is not Hosted by 3CX', 'Install two PBXs with identical settings, each with its own public IP', 'Set up remote storage and a daily off-hours backup on the active server',
         'Enable failover on the active server and choose Active', 'On the passive server enter the active server\'s IP and choose the services to monitor', 'Set the heartbeat interval and the failover scripts',
         'Schedule the automatic restore a few minutes after each backup', 'Test a failover and shut down the previous active server'],
        'Failover needs an AI edition license (and is not supported on Hosted by 3CX), two PBXs with identical settings and their own public IPs, and split DNS. The passive server monitors the active one, restores each backup shortly after it is made, and runs scripts that update DNS when it takes over; the old active server must be shut down so two servers do not conflict.'))

    # ------------------------------------------------------------------------------------------ a4
    out.append(decision(
        'bridge-or-sbc-decision', C, 'a4', 'Intermediate', 8,
        'Choose between a bridge and an SBC',
        'Decide how to connect each site, and fix the dialing problems that bridges bring.',
        'The company is adding sites. For each, choose the right way to connect it or the right fix.',
        [
            ('Two offices each need their own trunks, queues, and administrators, but must call each other\'s extensions for free.',
             ['Bridge the two systems', 'Install an SBC at each office', 'Use a router phone', 'Merge them into one multi-tenant system'], 0,
             'A bridge keeps separate PBXs separate while letting them dial each other over the internet.'),
            ('A small branch needs only desk phones connected to the head-office PBX in the cloud.',
             ['A router phone or the 3CX apps', 'A bridge', 'A second PBX', 'A SIP trunk'], 0,
             'Phones that just need to reach a central PBX use an SBC component; for small sites a router phone is enough.'),
            ('A large remote office with many phones needs a dedicated component to reach the central PBX.',
             ['A 3CX SBC on Windows, Debian, or a Raspberry Pi', 'A bridge', 'Local LAN/VPN on a cloud PBX', 'DHCP option 66 at head office'], 0,
             'A standalone SBC does the router phone\'s job for every phone at a larger site.'),
            ('Staff at one site cannot see whether colleagues at the other bridged site are available.',
             ['Enable Publish and Receive Information on the bridge', 'Turn on Do Not Disturb', 'Add them to a ring group', 'Enable Switch Status'], 0,
             'Presence only crosses a bridge when the bridge is set to publish and receive it.'),
            ('Dialing the bridge prefix plus a remote extension is blocked, although the bridge is connected.',
             ['Check Allowed Country Codes for a clash with the extension number', 'Replace the authentication password', 'Restart the tunnel', 'Create a CID rule'], 0,
             'Allowed Country Codes can read a prefix plus extension as an international number and block it.'),
        ],
        'Choose by where call control should live: a bridge links separate PBXs that stay independent, while an SBC connects a site\'s phones to one remote or cloud PBX without creating a second PBX.'))

    out.append(sequence(
        'bridge-setup-sequence', C, 'a4', 'Advanced', 10,
        'Connect two 3CX systems with a bridge',
        'Put the steps for linking two PBXs in order.',
        'Head office and a branch each run their own 3CX. Put the steps for connecting them with a Master and Slave bridge in order.',
        ['Make sure both systems have a secure FQDN, not an IP address', 'Create a Master bridge and note its virtual extension number', 'Set the outbound rule prefix, maximum calls, and authentication password',
         'Create a Slave bridge with the same virtual extension, prefix, and password', 'Enter the Master\'s FQDN and port on the Slave', 'Add an outbound rule on each side that sends the prefix to its bridge and strips one digit',
         'Enable Publish and Receive Information if users should see presence'],
        'A bridge needs secure FQDNs on both systems (an IP address cannot be used). The Master is created first; the Slave repeats its virtual extension, prefix, and password and points at the Master\'s FQDN. Each side needs an outbound rule for the prefix that strips the prefix digit, and presence is shared only if you enable it.'))

    # ------------------------------------------------------------------------------------------ a5
    out.append(decision(
        'report-choice-decision', C, 'a5', 'Intermediate', 8,
        'Pick the right report or feed for each question',
        'Match SLA Breaches, Abandoned Calls, Agent Login History, the CDR service, and scheduled reports to what is being asked.',
        'Management keeps asking questions about the phone system. For each, choose the report or feature that answers it.',
        [
            ('How many callers waited longer than the service level target?',
             ['SLA Breaches', 'Abandoned Queue Calls', 'Agent Login History', 'The CDR service'], 0, 'SLA Breaches counts calls that waited longer than the configured SLA time.'),
            ('How many callers gave up before an agent answered?',
             ['SLA Breaches', 'Abandoned Queue Calls', 'Queue Callbacks', 'Extension Statistics'], 1, 'Abandoned Queue Calls counts callers who entered the queue but were never answered.'),
            ('When was a particular agent logged in to the queue yesterday?',
             ['Agent Login History', 'SLA Statistics', 'Call Distribution', 'The Audit Log'], 0, 'Agent Login History shows an agent\'s queue login and logout history.'),
            ('Every call record must reach the finance system as soon as the call ends.',
             ['The CDR service pushing over TCP', 'A scheduled report each Monday', 'The Inbound Rules report', 'A packet capture'], 0, 'The CDR service writes call records to a file or pushes each one to another application over TCP.'),
            ('A manager wants the queue report in a spreadsheet every Monday for Power BI.',
             ['A scheduled report, which is emailed with a CSV', 'The CDR service', 'The Event log', 'Agent Login History'], 0, 'Scheduled reports are emailed as a link with a CSV attached, which suits BI tools.'),
        ],
        'The Reports menu offers queue statistics (abandoned calls, answered by waiting time, callbacks, SLA Statistics and Breaches), agent reports such as Agent Login History, and logs, while the CDR service streams raw call records and scheduled reports arrive by email with a CSV.'))

    return [spread_answers(lab) for lab in out]
