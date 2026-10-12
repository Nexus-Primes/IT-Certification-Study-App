"""New 3CX Basic labs (v238): split DNS, the Firewall Checker, a full disk, phone provisioning methods, access roles, outbound
route failover, DID routing, queue strategies, holiday routing, and emergency numbers. Facts follow 3CX's administrator manual (2026)."""
from labs_lib import spread_answers, decision, scenario, sequence, terminal

C = 'core1'


def labs():
    out = []

    # ------------------------------------------------------------------------------------------ b1
    out.append(terminal(
        'split-dns-terminal', C, 'b1', 'Intermediate', 8,
        'Prove that split DNS works for the PBX name',
        'Check that the PBX name gives the LAN address inside the office and the public address from the internet.',
        'The PBX is pbx.contoso.com. Its LAN address is 192.168.10.5 and its public address is 203.0.113.20. Office computers should reach it on the LAN address, while remote users must be given the public one. You are at a Windows PC in the office. Type commands as shown, or use an accepted equivalent.',
        [
            ('Look up the PBX name using the office DNS server.',
             ['nslookup pbx.contoso.com'],
             'Server:  dns1.contoso.local\nAddress:  192.168.10.2\n\nName:    pbx.contoso.com\nAddress:  192.168.10.5',
             'Use nslookup followed by the name.'),
            ('Ask a public DNS server (8.8.8.8) for the same name, as a remote user would.',
             ['nslookup pbx.contoso.com 8.8.8.8'],
             'Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    pbx.contoso.com\nAddress:  203.0.113.20',
             'Add the DNS server address after the name.'),
            ('Check that the PBX answers on its LAN address.',
             ['ping 192.168.10.5', 'ping -n 4 192.168.10.5'],
             'Pinging 192.168.10.5 with 32 bytes of data:\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64',
             'Ping the LAN address.'),
            ('Check from PowerShell that the PBX name accepts connections on its HTTPS port, 5001.',
             ['Test-NetConnection pbx.contoso.com -Port 5001', 'Test-NetConnection -ComputerName pbx.contoso.com -Port 5001'],
             'ComputerName     : pbx.contoso.com\nRemoteAddress    : 192.168.10.5\nRemotePort       : 5001\nTcpTestSucceeded : True',
             'Use Test-NetConnection with the name and -Port 5001.'),
        ],
        [('nslookup name [server]', 'Look up a name, optionally asking a specific DNS server'), ('ping address', 'Check that a host answers'),
         ('Test-NetConnection name -Port n', 'Test whether a TCP port accepts connections')],
        'Split DNS makes one name give two answers: the PBX\'s LAN address to computers inside the network (through an internal DNS server, or a firewall that supports hairpin NAT) and its public address to everyone else. On-premise 3CX installs require it, so that phones and apps use the same FQDN wherever they are.'))

    out.append(decision(
        'firewall-checker-decision', C, 'b1', 'Intermediate', 8,
        'Read the Firewall Checker like an administrator',
        'Match each Firewall Checker result to the firewall behavior behind it, and know when to run it.',
        'The 3CX Firewall Checker tests your firewall using 3CX\'s STUN servers. For each result or question, pick the right explanation.',
        [
            ('The checker reports that SIP traffic leaving from port 5060 arrives at the STUN server from a different source port. Which requirement has failed?',
             ['Full cone NAT', 'Port preservation', 'The SIP ALG test', 'Split DNS'], 1,
             'Port preservation means the firewall keeps the local source port when it translates to the public address; some providers reply to the source port they see.'),
            ('Replies sent from a different STUN address than the one 3CX contacted never arrive. What is that test checking?',
             ['Port preservation', 'Full cone NAT', 'SIP ALG', 'The HTTPS certificate'], 1,
             'Full cone NAT lets any outside server send traffic to the PBX, which matters because a provider\'s audio server is often not the one that handles signaling.'),
            ('The hash returned by the 3CX online service is different from the one 3CX calculated locally. What does that tell you?',
             ['The firewall changed the SIP message, so SIP ALG is active', 'The license has expired', 'The STUN server is down', 'DNS is misconfigured'], 0,
             'The test sends a generic INVITE and compares hashes. A mismatch means a device in the path rewrote the message, which is what SIP ALG does, and it should be turned off.'),
            ('When is the best time to run the Firewall Checker on a live system?',
             ['Out of hours, because PBX services stop and restart during the test', 'Any time, because it never affects calls', 'Only while a backup is running', 'Only from an IP phone'], 0,
             'The checker stops and restarts PBX services so the SIP ports are free for testing, so run it when calls will not be interrupted.'),
        ],
        'The Firewall Checker (Dashboard) checks UDP behavior using STUN: port preservation, full cone NAT, and whether SIP ALG is altering messages. It does not validate TCP ports, and it interrupts PBX services while it runs.'))

    out.append(scenario(
        'disk-full-scenario', C, 'b1', 'Intermediate', 9,
        'Recordings stopped saving',
        'Work out why recordings are not being written and fix the cause for good.',
        'Staff report that recent call recordings are missing. Find out why and put a lasting fix in place.',
        ('Call recordings have stopped appearing', ['Recordings are missing since Tuesday morning', 'Nothing was changed on the system', 'The Dashboard shows very little free disk space']),
        {
            'start': ('Where do you look first?', [('Check the Dashboard for disk space and the Event log', 'disk', True), ('Restart the PBX services and see if recordings return', 'restart', False)]),
            'restart': ('After the restart recordings are still not saved. What now?', [('Check the Dashboard for disk space and the Event log', 'disk', True), ('Reinstall the PBX', 'bad_reinstall', False)]),
            'disk': ('Free space is under about 500 MB and the Event log has a disk-near-capacity alert. What is happening?',
                     [('Disk Protect Mode has stopped recordings being written', 'fix', True), ('The recording feature has been switched off by the license', 'bad_license', False)]),
            'fix': ('How do you fix it for good?',
                    [('Send recordings and backups to remote storage, and set recording auto-clean, a voicemail quota, and log purging', 'done', True),
                     ('Delete files from the 3CX installation folder to free space', 'bad_delete', False), ('Turn recording off for everyone', 'bad_off', False)]),
            'done': ('END', True, 'Space is freed, Disk Protect Mode ends, and recordings are written again. Offloading to remote storage and auto-cleaning keeps the disk from filling again.'),
            'bad_reinstall': ('END', False, 'Reinstalling would not fix a full disk and risks your data. The Dashboard and Event log show the real cause.'),
            'bad_license': ('END', False, 'Licensing does not stop recordings. Low disk space does: below about 500 MB free, Disk Protect Mode stops recordings being written.'),
            'bad_delete': ('END', False, 'Never delete from the 3CX installation folder. Use remote storage, auto-clean, quotas, and purging so the system manages the files.'),
            'bad_off': ('END', False, 'That removes a compliance feature instead of fixing the disk. Offload and clean up the stored data.'),
        },
        'Running out of disk is a main cause of 3CX downtime. Below about 500 MB free, Disk Protect Mode stops recordings and emails the administrator. The lasting fix is remote storage for recordings and backups, auto-clean for recordings, a voicemail quota, and purging old call and chat logs.'))

    # ------------------------------------------------------------------------------------------ b2
    out.append(decision(
        'phone-provisioning-decision', C, 'b2', 'Beginner', 8,
        'Choose how each phone should be provisioned',
        'Match RPS, PnP, DHCP option 66, router phones, and manual setup to the situation they suit.',
        'Several phones need configuring in different circumstances. For each, pick the method that fits.',
        [
            ('A new phone from the box, plugged into any network, should configure itself with no address typed on it.',
             ['RPS, the vendor redirect service', 'PnP discovery on the LAN', 'DHCP option 66', 'Manual configuration'], 0,
             'The phone asks its vendor\'s RPS server, which 3CX has already given the provisioning URL; it works for cloud and on-premise installs.'),
            ('On the office LAN you see the phone appear under Phones > PnP Phones and you right-click it to assign an extension.',
             ['RPS', 'PnP discovery', 'DHCP option 66', 'A router phone'], 1,
             'PnP works because the phone announces itself on the local network and the PBX lists it for you to assign.'),
            ('A large managed network, all phones from one vendor, where the DHCP server can hand out the provisioning URL.',
             ['RPS', 'PnP discovery', 'DHCP option 66', 'Manual configuration'], 2,
             'Option 66 carries the base URL and the phone adds its MAC address; it needs one vendor because vendors use different URL formats.'),
            ('An older phone model that 3CX has no template for.',
             ['Manual configuration with the auth ID, password, and PBX address', 'RPS', 'PnP discovery', 'Hot desking'], 0,
             'Phones without a template are set up by hand on the phone\'s own web page, using the extension, authentication ID, password, and FQDN.'),
            ('A branch office with desk phones must reach a cloud-hosted PBX without a VPN.',
             ['A router phone or SBC at the branch', 'The Local LAN/VPN option', 'DHCP option 66 at head office', 'PnP at head office'], 0,
             'A cloud PBX needs a router phone or SBC on the phones\' network; Local LAN/VPN is an extra choice only for on-premise systems.'),
        ],
        'Add the phone to the user with its MAC (no dashes or colons), choose how it connects, then let it provision: RPS (connect within 14 days), PnP, DHCP option 66, or manual setup for phones without a template.'))

    out.append(decision(
        'access-roles-decision', C, 'b2', 'Intermediate', 9,
        'Give each person the right access role',
        'Pick the smallest role that does the job, from User up to System Owner.',
        'You are assigning roles in a growing company. For each person, choose the role that gives what they need and no more.',
        [
            ('The receptionist must open or close the office early for their department but should have no administration rights.',
             ['User', 'Receptionist', 'Department Administrator', 'Manager'], 1,
             'A Receptionist can override office hours and break times for the departments they belong to.'),
            ('A team lead needs call and chat reports and a view of queue activity, but must not change configuration.',
             ['Supervisor', 'Receptionist', 'Department Administrator', 'Owner'], 0,
             'A Supervisor can view reports and oversee queue activity for their departments.'),
            ('A branch IT contact must configure call handling, trunks, and messaging for one department only.',
             ['Supervisor', 'Manager', 'Department Administrator', 'System Administrator'], 2,
             'A Department Administrator performs configuration tasks inside the departments they belong to.'),
            ('A department head needs to add users, hear recordings, and listen in on calls for coaching.',
             ['Manager', 'Supervisor', 'Receptionist', 'User'], 0,
             'A Manager adds user management, recordings, and barge in or listen in to the Receptionist and Supervisor abilities.'),
            ('Which role is the only one that can promote someone to System Administrator?',
             ['Owner', 'Manager', 'System Administrator', 'System Owner'], 3,
             'Only a System Owner can elevate users to the system-wide roles; an Owner can only elevate within its own departments.'),
        ],
        'Roles are fixed in V20: User, Receptionist, Supervisor, Department Administrator, Manager, Owner (department roles), then System Administrator and System Owner (system-wide). Give people the smallest role that does the job.'))

    # ------------------------------------------------------------------------------------------ b3
    out.append(decision(
        'outbound-failover-decision', C, 'b3', 'Intermediate', 8,
        'Predict how outbound rules choose a route',
        'Know when 3CX tries the next route, what stops it, and which rule wins.',
        'An outbound rule can hold several routes, and rules are checked in order. Answer how 3CX behaves in each case.',
        [
            ('An outbound rule has three routes and the first trunk shows red (not registered). What does 3CX do?',
             ['Skips it at once and tries the next route', 'Waits for it to recover', 'Blocks the call', 'Retries the first route three times'], 0,
             'An unregistered trunk is skipped immediately.'),
            ('The first trunk answers an outbound call with 486 Busy Here. What happens?',
             ['The caller gets a busy tone and no further route is tried', 'The next route is tried at once', 'The call is retried after five seconds', 'The call is sent to voicemail'], 0,
             'Busy answers (486, 600, and 1408) end the attempt: only failures move on, not a genuine busy.'),
            ('How many routes can a single outbound rule use?',
             ['Up to five', 'Up to two', 'Exactly three', 'As many as there are trunks'], 0,
             'Each rule has up to five routes, tried in order.'),
            ('Two outbound rules both match a call: a broad rule sits above a specific one. Which applies?',
             ['The upper rule, because the first match wins', 'The more specific rule', 'Both, in turn', 'The most recently created rule'], 0,
             'Rules are evaluated top to bottom and the first match is used, so order matters.'),
            ('You create a new specific rule. Where does it appear, and what do you do?',
             ['At the bottom, so you use Move Up to raise it above the broad rule', 'At the top automatically', 'Next to the trunk it uses', 'It stays disabled until you reorder the list'], 0,
             'New rules are added at the bottom with the lowest priority; move them up to give them precedence.'),
        ],
        'Outbound rules trigger on the dialed prefix, number length, calling extensions, and departments. A rule has up to five routes tried in order; unregistered trunks are skipped, a busy answer ends the attempt, and a successful or cancelled call stops the hunt.'))

    out.append(scenario(
        'did-routing-scenario', C, 'b3', 'Intermediate', 10,
        'Calls to the new sales number go to the wrong place',
        'Use the Activity Log to find out what number the trunk really delivers, then correct the routing.',
        'A new number for sales was added to the trunk yesterday. Callers to it reach the main IVR instead of the sales queue.',
        ('The new sales number rings the main IVR', ['The DID was added to the trunk yesterday', 'It is assigned to the sales queue', 'Calls land in the main IVR, which is the default route']),
        {
            'start': ('What do you do first?', [('Call the number and read the Activity Log at Medium level for the called= value', 'log', True), ('Reboot the PBX', 'reboot', False)]),
            'reboot': ('After the reboot the number still goes to the main IVR. What next?', [('Call the number and read the Activity Log at Medium level for the called= value', 'log', True), ('Ask the provider to issue a new number', 'bad_provider', False)]),
            'log': ('The log shows called=+441632960456, but the queue has the DID entered as 01632960456. What does that mean?',
                    [('The delivered number does not match the stored one, so the call falls to the default route', 'fix', True), ('The provider is down', 'bad_down', False)]),
            'fix': ('How do you correct the routing?',
                    [('Enter the DID in the format the trunk delivers, in E.164 form, and select it in the queue\'s Assigned DID Number(s)', 'done', True),
                     ('Create a CID rule on the caller\'s number', 'bad_cid', False), ('Point the trunk\'s default route at the sales queue', 'bad_default', False)]),
            'done': ('END', True, 'The DID now matches what the trunk delivers and is assigned on the queue, so calls reach sales. The default route stays as the catch-all for unassigned numbers.'),
            'bad_provider': ('END', False, 'A new number would have the same format problem. The Activity Log shows exactly what the provider delivers.'),
            'bad_down': ('END', False, 'If the provider were down the call would not arrive at all. The call arrived and went to the default route because nothing matched.'),
            'bad_cid': ('END', False, 'CID rules match the caller, not the number that was dialed.'),
            'bad_default': ('END', False, 'That would send every unassigned number to sales. Fix the number\'s format and assignment instead.'),
        },
        'In V20 a DID is routed by selecting it on its destination (Assigned DID Number(s)). When a call goes to the default route instead, read the Activity Log (Medium shows called=, Verbose shows the INVITE\'s To header) to see the number the provider actually sent, and make the stored DID match it.'))

    out.append(sequence(
        'emergency-number-sequence', C, 'b3', 'Intermediate', 8,
        'Set up an emergency number correctly',
        'Put the emergency rule setup steps in order.',
        'Dialed emergency numbers ignore the normal outbound and office-hours rules. Put the steps for adding one in order.',
        ['Open Admin > System > Emergency and click Add', 'Enter the rule name and the emergency number', 'Choose whether the rule is system-wide or limited to a department or extensions',
         'Set the mandatory first route and up to four alternatives', 'Set the notifications by email, chat, or an announcement', 'Test it only in the way your provider and local rules allow'],
        'Emergency rules live under Admin > System > Emergency. Each has one mandatory trunk route plus up to four alternatives, can notify by email, by chat to managers or members, or by playing an announcement, and should be tested only as local rules permit.'))

    # ------------------------------------------------------------------------------------------ b4
    out.append(decision(
        'queue-strategy-decision', C, 'b4', 'Intermediate', 9,
        'Pick the right queue polling strategy',
        'Match Prioritized Hunt, Round Robin, Longest Waiting, Least Talk Time, and Hunt by Threes to what a team needs.',
        'A call queue offers many polling strategies. For each team\'s wish, choose the strategy that delivers it.',
        [
            ('Always offer calls first to the most senior agent, and move down the list only when they do not answer.',
             ['Prioritized Hunt', 'Round Robin', 'Longest Waiting', 'Ring All'], 0, 'Prioritized Hunt rings members from the top of the list, so list order is priority.'),
            ('Give every logged-in agent a fair, rotating share of calls.',
             ['Hunt Random Start', 'Round Robin', 'Prioritized Hunt', 'Fewest Answered'], 1, 'Round Robin distributes calls evenly among logged-in agents.'),
            ('Send the next call to the agent who has been waiting the longest for one.',
             ['Longest Waiting', 'Least Talk Time', 'Round Robin', 'Hunt by Threes'], 0, 'Longest Waiting forwards the call to the member waiting longest.'),
            ('Balance the load by how much time agents have spent talking.',
             ['Fewest Answered', 'Longest Waiting', 'Least Talk Time', 'Ring All'], 2, 'Least Talk Time sends the call to the member with the least total talk time (Fewest Answered balances the number of calls instead).'),
            ('Ring three agents at a time until someone answers.',
             ['Ring All', 'Hunt by Threes', 'Prioritized Hunt', 'Round Robin'], 1, 'Hunt by Threes rings three agents at once, chosen at random or in list order.'),
        ],
        'Queue strategies include Ring All, Prioritized Hunt, Hunt Random Start, Round Robin, Longest Waiting, Least Talk Time, Fewest Answered, and Hunt by Threes. The AI edition adds skills-based strategies with skill levels 1 to 5.'))

    out.append(sequence(
        'holiday-routing-sequence', C, 'b4', 'Intermediate', 8,
        'Set up a holiday closure the V20 way',
        'Put the steps for a holiday message on a queue in order.',
        'The support queue should play a special message on a public holiday. Put the steps in order.',
        ['Open Office Hours and choose the department the queue belongs to', 'Confirm the department\'s time zone is correct', 'Add the holiday date under Office Holidays',
         'Open the queue\'s holiday routing settings and choose the destination', 'Add the custom holiday message to that holiday routing', 'Repeat for each IVR, ring group, and department that should differ'],
        'In V20 office hours belong to departments and are applied at the destination. Holidays are added under Office Hours, and from V20 Update 9 each queue, ring group, IVR, and department can carry its own custom holiday message in its holiday routing.'))

    return [spread_answers(lab) for lab in out]
