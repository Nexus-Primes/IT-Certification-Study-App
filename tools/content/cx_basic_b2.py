"""3CX Basic, domain b2 (Extensions & Endpoints): new users, phone provisioning, links and apps, voicemail and forwarding, recording, roles and departments, and remote phones.

Checked against the 3CX administrator manual (create users, access roles, IP phones, call queues and ring groups, call recording, and setup pages, 2026).
"""
import svg as S

DOMAIN = 'b2'


def build(b):
    b.topics['2.1'] = ['Extensions', 'Welcome email', 'Assigned DID', 'Templates', 'Caller ID', 'Bulk import']
    b.topics['2.2'] = ['RPS', 'PnP', 'DHCP option 66', 'Manual setup', 'Firmware', 'DECT', 'Phone templates']
    b.topics['2.3'] = ['Apps', 'Web Client', 'Tunnel', 'Presence', '3CX Talk and Meet links', 'App caller ID']
    b.topics['2.4'] = ['Voicemail', 'Group voicemail', 'Forwarding rules', 'Exceptions', 'Switch status', 'DND']
    b.topics['2.5'] = ['Parking', 'Paging', 'Hot desking', 'Pickup', 'BLF', 'Call recording', 'Dial codes']
    b.objective('2.6', 'Users, roles, and departments', ['Departments', 'Access roles', 'Role capabilities', 'System roles', 'Two-factor authentication'])
    b.objective('2.7', 'Remote phones, SBCs, and router phones', ['Router phones', 'Standalone SBC', 'Local LAN or VPN'])

    # ------------------------------------------------------------------------------------------ 2.1
    b.add('2.1', 'Welcome email',
          'An email 3CX sends to each new user with their account details and sign-in instructions, which is why every user needs a valid email address; the same address also receives voicemail notifications.',
          'get a new hire signed in with their account details without passing a password around by hand',
          ['Email-to-voicemail', 'Extension template', 'Bulk extension import'],
          'Sent automatically when the user is CREATED, to the email address you entered.',
          S.steps([('Admin adds the user', 'name and email entered'), ('3CX sends the email', 'account details inside'), ('User signs in', 'follows the instructions')], title='New user onboarding', tones=['plain', 'blue', 'green']),
          caption='Each new user automatically receives a welcome email with account details.')

    b.add('2.1', 'Assigned DID on a user',
          'Choosing a DID in the user\'s General tab so calls to that number ring the extension directly; it is normally the same value as the user\'s outbound caller ID so that return calls are routed back to the same person.',
          'give an employee a direct number that rings only their extension and is shown when they call out',
          ['Per-rule outbound caller ID', 'Time-based inbound routing', 'Call forwarding rules'],
          'Match it to the outbound caller ID — then people who call back reach the SAME person.',
          S.compare(('Assigned DID', ['Chosen in the user\'s General tab', 'Rings that extension', 'Inbound side']), ('Outbound caller ID', ['Shown to the called party', 'Set on the user', 'Outbound side']), title='Same number, two directions'),
          caption='A user\'s assigned DID and outbound caller ID are normally the same number.')

    # ------------------------------------------------------------------------------------------ 2.2
    b.add('2.2', 'RPS phone provisioning',
          'A cloud service where the phone vendor\'s server gives a factory-programmed phone its provisioning URL; it works for cloud and on-premise installs, and the phone must be connected within 14 days (or restarted) to configure and restart itself.',
          'get a new desk phone configured automatically by plugging it in, with no URL typed on the handset',
          ['PnP phone discovery', 'DHCP option 66', 'Manual phone configuration'],
          'The phone asks the VENDOR\'s server, which 3CX already told — so it works on cloud and on premise.',
          S.steps([('3CX sends the URL', 'to the vendor RPS server'), ('New phone boots', 'asks the RPS server'), ('Phone provisions', 'then restarts itself')], title='RPS', tones=['plain', 'blue', 'green']),
          caption='RPS lets a new phone obtain its provisioning URL from the vendor\'s server.')

    b.add('2.2', 'PnP phone discovery',
          'The phone broadcasts a message on the local network that the 3CX server picks up and lists under Phones > PnP Phones, where an administrator right-clicks it and assigns it to an extension; it works on premise or where a phone connects through an SBC.',
          'find an unassigned phone that was plugged into the office network and give it to a user',
          ['RPS phone provisioning', 'DHCP option 66', 'Manual phone configuration'],
          'BROADCAST and ASSIGN — the PBX sees the phone, you pick the extension.',
          S.steps([('Phone joins the LAN', 'broadcasts itself'), ('3CX lists the phone', 'Phones > PnP Phones'), ('Assign an extension', 'right-click, choose user')], title='PnP discovery', tones=['plain', 'blue', 'green']),
          caption='PnP shows a phone that announced itself on the LAN so it can be assigned to an extension.')

    b.add('2.2', 'DHCP option 66',
          'A DHCP field holding the base provisioning URL: a phone queries it when it receives an IP address and adds its own MAC address to the URL; it suits larger networks but needs all phones from one vendor because vendors use different URL formats.',
          'point every phone on a large managed network at the provisioning server without touching each handset',
          ['RPS phone provisioning', 'PnP phone discovery', 'Manual phone configuration'],
          'The DHCP server hands out the URL — but one URL format means ONE VENDOR.',
          S.steps([('Phone gets an IP', 'from the DHCP server'), ('Option 66 URL', 'base provisioning link'), ('Phone adds its MAC', 'and fetches its config')], title='DHCP option 66', tones=['plain', 'blue', 'green']),
          caption='DHCP option 66 supplies the provisioning URL to phones when they obtain an address.')

    b.add('2.2', 'Manual phone configuration',
          'Entering the extension number, authentication ID, password, and server address into an older phone by hand, using the 3CX FQDN for a phone on the local network or the IP of the SBC or router phone for a remote one.',
          'set up a legacy phone that cannot be provisioned automatically',
          ['Auto-provisioning', 'MAC-based phone template', 'Supported phone brand templates'],
          'Tick "I will configure the phone myself" — 3CX then shows the values to type in.',
          S.facts([('Extension', 'number to register'), ('Auth ID and password', 'from the dialog'), ('Local phone', 'the 3CX FQDN'), ('Remote phone', 'SBC or router phone IP')], title='Values to enter'),
          caption='Older phones are configured by typing the extension, authentication ID, password, and server address into the handset.')

    b.add('2.2', 'Phone firmware updates',
          'The Admin Console can check phone firmware versions and mass-update Fanvil, Yealink, and snom phones to the firmware 3CX has tested, which is often not the vendor\'s latest; phones behind are highlighted red and automatic updates can be enabled under Phones > Options.',
          'bring a fleet of desk phones to the firmware version tested with the phone system in one action',
          ['Maintenance updates', 'Supported phone brand templates', 'Auto-provisioning'],
          '3CX-TESTED firmware, not always the newest from the vendor — outdated phones show in RED.',
          S.steps([('3CX tests firmware', 'checked daily'), ('Outdated phones red', 'on the Users page'), ('Upgrade', 'one phone or many')], title='Phone firmware', tones=['plain', 'amber', 'green']),
          caption='3CX can mass-update phones to the firmware version it has tested.')

    b.add('2.2', 'DECT base station',
          'A wireless phone system added in Voice & Chat with its MAC address, supporting roughly 5 to 100 handsets depending on the model; handsets are assigned to users and the provisioning URL is entered in the base station\'s web interface.',
          'give warehouse staff cordless handsets that do not depend on the Wi-Fi network',
          ['Hot desking', 'Analog/PSTN gateway', '3CX mobile app'],
          'Reliable and independent of Wi-Fi — add the BASE first, then assign HANDSETS to users.',
          S.steps([('Add the base station', 'MAC in Voice & Chat'), ('Assign the handsets', 'one per user'), ('Enter provisioning URL', 'in the base web UI')], title='DECT setup', tones=['plain', 'blue', 'green']),
          caption='A DECT base station is added by MAC address, then handsets are assigned to users.')

    b.add('2.2', 'Adding a phone to a user',
          'Open the user\'s IP Phone tab, choose the model and enter the MAC address without dashes or colons, choose how it connects (router phone, SBC, or Local LAN/VPN for on-premise systems), then connect the phone so it fetches its provisioning information.',
          'assign a new desk phone to an employee from the administration console',
          ['Bulk extension import', 'Hot desking', 'Extension template'],
          'Three steps: MODEL and MAC (no dashes), CONNECTION type, then CONNECT the phone.',
          S.steps([('Add to the extension', 'model and MAC address'), ('Choose connection', 'router phone, SBC, LAN'), ('Connect the phone', 'RPS, PnP, or URL')], title='Adding a phone', tones=['plain', 'blue', 'green']),
          caption='A phone is added to a user with its model and MAC address, then connected so it can provision.')

    # ------------------------------------------------------------------------------------------ 2.3
    b.add('2.3', '3CX Talk link',
          'A web link that lets anyone call a user, ring group, or queue from a browser using WebRTC, with no app to install, number to dial, or call charge; each user gets one, plus a company link to paste on a website or email signature.',
          'let website visitors call the sales team with one click, with no phone number to dial',
          ['3CX Web Client', '3CX Meet link', 'Website live chat widget'],
          'ONE click, from any browser — no app, no number, no call charge.',
          S.steps([('Visitor clicks link', 'on site or in email'), ('Browser calls the PBX', 'WebRTC, no app'), ('Rings user or group', 'queue or ring group')], title='3CX Talk', tones=['plain', 'blue', 'green']),
          caption='A 3CX Talk link lets visitors call a user or group directly from a browser.')

    b.add('2.3', '3CX Meet link',
          'A link to a person\'s meeting room that lets visitors start an ad hoc video conference directly; you can ask visitors for a name and email first and accept or reject the call to avoid spam.',
          'start a quick video call with a customer by sending a single web address',
          ['3CX Talk link', 'Paging / intercom', 'Presence status'],
          'Talk is a voice CALL link — Meet opens a video MEETING room, with optional name and email screening.',
          S.compare(('3CX Talk link', ['Voice call from a browser', 'User, queue, or ring group', 'Visitor clicks to call']), ('3CX Meet link', ['Video meeting room', 'Ad hoc conference', 'Screen visitors first']), title='Talk vs. Meet'),
          caption='A 3CX Meet link starts an ad hoc video conference in a person\'s meeting room.')

    b.add('2.3', 'App outbound caller ID selection',
          'A setting that lets users choose which assigned DID or route is presented on outgoing calls from the Web Client, PWA, or apps; it is enabled with "Allow Users to Select Outbound Route & Caller ID" in Admin > System > Options > Apps.',
          'let a consultant who covers two departments choose which number the customer sees when calling from the app',
          ['Per-rule outbound caller ID', 'Assigned DID on a user', 'Extension template'],
          'Enable it under System > Options > Apps — then users pick any of their ASSIGNED DIDs.',
          S.steps([('Admin enables option', 'System > Options > Apps'), ('User opens the app', 'picks a caller ID'), ('Call goes out', 'with the chosen number')], title='Caller ID in apps', tones=['blue', 'plain', 'green']),
          caption='Users can pick which assigned DID shows on outgoing calls from the apps when the option is enabled.')

    # ------------------------------------------------------------------------------------------ 2.4
    b.add('2.4', 'Group voicemail delivery options',
          'For a ring group or queue, the voicemail notification can be delivered by email only, cloned into the voicemail box of every member, or sent only to extra recipients; queue supervisors handle messages left in the queue\'s voicemail box.',
          'let every member of a support team hear a message that was left for the whole team',
          ['Email-to-voicemail', 'Voicemail box', 'Call forwarding rules'],
          'Three choices: email ONLY, CLONED to each member, or EXTRA recipients only.',
          S.table(['Delivery option', 'Result'], [('Email only', 'sent by email'), ('Cloned to members', 'in each member\'s box'), ('Extra recipients only', 'only those addresses')], title='Group voicemail', col_widths=[0.5, 0.5]),
          caption='Group voicemail can be emailed, cloned into each member\'s box, or sent only to extra recipients.')

    b.add('2.4', 'Call forwarding exceptions',
          'Up to 15 exceptions to a user\'s forwarding rules, each matched by caller ID with optional time limits and its own alternate route, so that calls from a boss or key client are handled differently from everyone else.',
          'send calls from the boss and from key clients somewhere different from everyone else\'s calls',
          ['Call forwarding rules', 'Do Not Disturb (DND)', 'Call pickup'],
          'Matched by CALLER ID, with optional time limits — up to 15 per user.',
          S.flow_split(('Incoming call', 'caller ID checked'), [('Matches an exception', 'alternate route'), ('No match', 'normal forwarding rules')], title='Forwarding exceptions', tones=['green', 'plain']),
          caption='Forwarding exceptions route specific callers differently from a user\'s normal rules.')

    b.add('2.4', 'Switch Status',
          'A setting that automatically sets a user to Available during office hours, Away during breaks, and Do Not Disturb outside office hours; it follows the department hours unless the extension has its own, and can optionally block outbound calls after hours.',
          'show staff as unavailable after closing time without anyone changing their status by hand',
          ['Presence status', 'Do Not Disturb (DND)', 'Business hours schedule'],
          'Office hours drive the status: Available, Away on breaks, DND after hours.',
          S.table(['Time of day', 'Status set'], [('Office hours', 'Available'), ('Break times', 'Away'), ('Outside office hours', 'Do Not Disturb')], title='Switch Status', col_widths=[0.55, 0.45]),
          caption='Switch Status sets a user\'s status automatically from the office hours.')

    # ------------------------------------------------------------------------------------------ 2.5
    b.add('2.5', 'Call recording',
          'A feature that records calls for compliance and training: recordings are kept in a temporary folder outside the 3CX install directory, then archived to remote storage, and they can be searched, downloaded, or deleted from the Recordings page.',
          'keep recordings of customer calls so a manager can review them for training and compliance',
          ['Voicemail box', 'Queue wallboard', 'Call parking'],
          'Temporary LOCAL folder first, then ARCHIVE to remote storage — never inside the install directory.',
          S.steps([('Recording enabled', 'PBX or department'), ('Saved to temp folder', 'local, not install dir'), ('Archived remotely', 'local copy removed')], title='Call recording', tones=['blue', 'plain', 'green']),
          caption='Call recordings are saved locally, then archived to remote storage.')

    b.add('2.5', 'Call recording protection',
          'A per-user option, "Prohibit allowing others to record your calls", that stops other internal call parties from recording calls made or received by that extension where the PBX or department has recording enabled.',
          'make sure an executive\'s calls cannot be recorded by colleagues who would otherwise be allowed to',
          ['Do Not Disturb (DND)', 'Call forwarding rules', 'Hot desking'],
          'A per-USER opt-out in the user\'s Options — it limits OTHER internal parties.',
          S.compare(('Without protection', ['PBX or department records', 'Other party may record', 'Call is captured']), ('With protection', ['Option set on the user', 'Others cannot record', 'Call not captured']), title='Recording protection'),
          caption='Call recording protection stops other internal parties recording a protected extension\'s calls.')

    b.add('2.5', 'Dial codes',
          'Short feature codes defined in Admin > System > Dial Codes, such as the paging prefix (for example *9), which is also placed in front of an extension number to start an intercom call.',
          'change the digits users dial to page a group over the phone speakers',
          ['Call parking', 'Call pickup', 'Shared extension / BLF'],
          'The paging code doubles as the intercom prefix: *9 plus 101 dials extension 101.',
          S.table(['Dialed', 'Result'], [('*9 (paging code)', 'page a paging group'), ('*9101', 'intercom to extension 101'), ('Set in', 'System > Dial Codes')], title='Dial codes', col_widths=[0.45, 0.55]),
          caption='Dial codes define the feature prefixes users dial, such as the paging code.')

    # ------------------------------------------------------------------------------------------ 2.6
    b.add('2.6', 'Department',
          'A group of users and call-handling objects such as queues, ring groups, and IVRs; its members and objects inherit its office hours, holidays, and time zone, and best practice is for each user to belong to only one department.',
          'group staff so that their queues, IVRs, and extensions all follow shared hours and a shared time zone',
          ['Extension template', 'Ring group', 'Hot desking'],
          'Hours follow the DESTINATION\'s department — and SMB and Multi-Company systems have none.',
          S.hub(('Department',), [('Users', 'inherit hours'), ('Queues', 'follow hours'), ('IVRs', 'follow hours'), ('Ring groups', 'follow hours')], title='What a department holds'),
          caption='A department gives its users and call-handling objects shared office hours and time zone.')

    b.add('2.6', 'Access roles',
          'Roles control what each user can see and configure, from the basic User role up to System Owner; department roles apply to the departments a user belongs to, while system roles apply everywhere, and in V20 the roles are fixed rather than customizable.',
          'limit what a new hire can configure and see about colleagues',
          ['Extension template', 'Presence status', 'Department'],
          'Eight fixed roles — User, Receptionist, Supervisor, Dept Admin, Manager, Owner, then the two SYSTEM roles.',
          S.layers([('System Owner / Admin', 'system-wide', 'red'), ('Owner / Manager', 'plus Dept Administrator', 'amber'), ('Lower dept roles', 'Supervisor and Receptionist: oversight', 'blue'), ('User', 'own calls and data', 'green')], title='Role levels'),
          caption='3CX access roles range from User up to System Owner and are fixed in V20.')

    b.add('2.6', 'Receptionist role',
          'A department role that can override office hours and break times for its departments and see and act on colleagues\' calls and presence there, for example to divert, transfer, pick up, or park.',
          'let the front desk open the office early or close it for bad weather without giving them admin rights',
          ['Supervisor role', 'Manager role', 'Department Administrator role'],
          'Can OVERRIDE office hours (Open, Closed, Break) — for the departments they belong to.',
          S.steps([('Click your avatar', 'in the Web Client'), ('Override office hours', 'pick department, mode'), ('Set the duration', 'then hours return')], title='Overriding office hours', tones=['plain', 'blue', 'green']),
          caption='A Receptionist can override office hours for the departments they belong to.')

    b.add('2.6', 'Supervisor role',
          'A department role that can view call and chat reports and oversee queue activity for its departments, without administrative control over configuration.',
          'let a team lead monitor the support queue and run call reports without being able to change settings',
          ['Receptionist role', 'Manager role', 'Department Administrator role'],
          'REPORTS and queue oversight — not office-hours overrides, not configuration.',
          S.compare(('Supervisor role', ['Call and chat reports', 'Oversees queue activity', 'No admin changes']), ('Receptionist role', ['Overrides office hours', 'Operates on calls', 'No reports']), title='Supervisor vs. Receptionist'),
          caption='A Supervisor can view reports and oversee queues for their departments.')

    b.add('2.6', 'Department Administrator role',
          'A department role for administrative tasks in the departments the user belongs to, such as adding and deleting user extensions and configuring call handling, SIP trunks, and messaging.',
          'let a branch IT contact configure call handling and trunks for one department without touching the rest of the system',
          ['Supervisor role', 'Receptionist role', 'System Owner role'],
          'Administers the DEPARTMENT\'s setup — call handling, trunks, and messaging.',
          S.facts([('Scope', 'own departments only'), ('Users', 'add and delete extensions'), ('Call handling', 'configure'), ('Trunks and messaging', 'configure')], title='Department Administrator'),
          caption='A Department Administrator performs configuration tasks within their own departments.')

    b.add('2.6', 'Manager role',
          'A department role that can do everything Users, Receptionists, and Supervisors can, plus add and delete user extensions, see recordings, and use Barge In and Listen In.',
          'let a team lead create user extensions, review recordings, and listen in on calls for coaching',
          ['Supervisor role', 'Receptionist role', 'Department Administrator role'],
          'Adds RECORDINGS and BARGE/LISTEN IN on top of the Receptionist and Supervisor abilities.',
          S.table(['Manager can', 'Detail'], [('Add or delete users', 'extensions'), ('See recordings', 'department calls'), ('Barge in, listen in', 'Pro or AI edition'), ('Plus', 'Receptionist and Supervisor')], title='Manager role', col_widths=[0.5, 0.5]),
          caption='A Manager adds user management, recordings, and barge or listen in to the lower roles.')

    b.add('2.6', 'Department Owner role',
          'A department role that can do everything the lower roles can, and can also elevate users in its own departments up to Manager or Department Administrator.',
          'let a department head promote their own staff to team lead without involving a system administrator',
          ['Manager role', 'Department Administrator role', 'System Owner role'],
          'Can ELEVATE others within the department — but only up to Manager or Dept Admin.',
          S.steps([('Owner of a department', 'sees its members'), ('Elevates a user', 'to Manager or Dept Admin'), ('Cannot go higher', 'system roles are separate')], title='Elevating rights', tones=['blue', 'green', 'amber']),
          caption='An Owner can elevate users in their departments up to Manager or Department Administrator.')

    b.add('2.6', 'System Owner role',
          'The highest system-wide role: it can do everything, including elevating other users to System Administrator or System Owner, which no other role can do; the system roles are not available on 3CX SMB or inside a multi-tenant tenant.',
          'promote a trusted engineer to a system-wide administrator',
          ['Department Owner role', 'Manager role', 'Department Administrator role'],
          'ONLY the System Owner can create System Administrators or other System Owners.',
          S.flow_split(('Who can elevate to system roles?', 'System Administrator or Owner'), [('System Owner', 'can elevate'), ('Everyone else', 'cannot')], title='System roles', tones=['green', 'red']),
          caption='Only a System Owner can elevate other users to a system-wide role.')

    b.add('2.6', 'Two-factor authentication (2FA)',
          'An account protection that forces users to enter a code from an authenticator app in addition to their email and password; 3CX supports the common Google and Microsoft authenticator apps.',
          'require a one-time code from a phone app in addition to the password when staff sign in',
          ['Single sign-on (SSO) integration', 'Extension authentication credentials', 'Blacklist / failed authentication protection'],
          'A second FACTOR — a one-time code on top of the email and password.',
          S.steps([('Email and password', 'first factor'), ('Authenticator code', 'second factor'), ('Access granted', 'to the account')], title='2FA sign-in', tones=['plain', 'blue', 'green']),
          caption='Two-factor authentication adds a one-time code to the email and password.')

    # ------------------------------------------------------------------------------------------ 2.7
    b.add('2.7', 'Router phone',
          'A normal IP phone from Fanvil, Snom, or Yealink that also runs 3CX\'s SBC software: it proxies voice traffic to a hosted PBX, encrypts it, reconnects calls after a drop, combines SIP and RTP, and keeps local calls between phones on the LAN.',
          'connect a branch office\'s phones to a cloud-hosted PBX without a VPN or extra firewall ports',
          ['3CX Tunnel', 'Analog/PSTN gateway', 'DECT base station'],
          'A phone that is ALSO the SBC — a cloud PBX needs one (or a standalone SBC) at each site.',
          S.hub(('Router phone',), [('Encrypts', 'voice to PBX'), ('Reconnects', 'after drops'), ('Merges', 'SIP and RTP'), ('Keeps local', 'calls local')], title='What a router phone does'),
          caption='A router phone is an IP phone running 3CX\'s SBC to connect a site to a hosted PBX.')

    b.add('2.7', '3CX SBC remote location',
          'A standalone 3CX SBC installed as software on Windows, Debian, or a Raspberry Pi for larger networks, which does the router phone\'s job for all the phones at a remote site.',
          'connect a large remote office to the PBX with dedicated software on a small computer instead of a desk phone',
          ['Router phone', 'Analog/PSTN gateway', '3CX Tunnel'],
          'Software on Windows, Debian, or a Raspberry Pi — for LARGER sites than one router phone.',
          S.table(['Remote site option', 'Runs on'], [('Router phone', 'a supported IP phone'), ('3CX SBC', 'Windows'), ('3CX SBC', 'Debian'), ('3CX SBC', 'Raspberry Pi')], title='SBC choices', col_widths=[0.5, 0.5]),
          caption='A standalone 3CX SBC runs on Windows, Debian, or a Raspberry Pi to connect a remote site.')

    b.add('2.7', 'Local LAN/VPN connection option',
          'The additional connection choice for on-premise or self-hosted systems when adding a phone: use it when the phone is on the PBX\'s own network or reaches it over a VPN, instead of going through a router phone or SBC.',
          'connect desk phones in the head office that sit on the same network as the PBX',
          ['Router phone', '3CX SBC remote location', '3CX Tunnel'],
          'On-premise only — a CLOUD-hosted PBX must use a router phone or SBC.',
          S.flow_split(('Where is the PBX?', 'when adding a phone'), [('Cloud-hosted', 'router phone or SBC'), ('On premise or self-hosted', 'adds Local LAN/VPN')], title='Connection choices', tones=['amber', 'green']),
          caption='Local LAN/VPN is an extra connection option for on-premise and self-hosted systems.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Adding users, phones, and the Welcome email', ['2.1', '2.2', '2.7'],
              'Create a user in Admin > Users with an email address, name, mobile number, outbound caller ID, role, main department, and an assigned DID (normally the same number as the outbound caller ID so return calls come back to the right person). Each new user is sent a Welcome Email with their account details. Add a phone from the user\'s IP Phone tab by choosing the model and entering the MAC address without dashes or colons, then choose the connection: a router phone or SBC for a cloud-hosted PBX, or Local LAN/VPN as an extra option on premise.\n\n'
              'A phone then needs its provisioning URL: RPS (the vendor\'s cloud server supplies it; connect the phone within 14 days), PnP (the phone broadcasts itself and appears under Phones > PnP Phones), DHCP option 66 (one vendor per URL format), or manual configuration for older phones using extension, authentication ID, password, and the FQDN (or the SBC or router phone IP when remote). The console can mass-update Fanvil, Yealink, and snom phones to 3CX-tested firmware. A router phone is an IP phone that also runs the SBC; larger sites install a standalone 3CX SBC on Windows, Debian, or a Raspberry Pi.')
    b.section('Roles, departments, and secure sign-in', ['2.6'],
              'A department holds users and call-handling objects and supplies their office hours, holidays, and time zone; best practice is one department per user, and SMB and Multi-Company systems have no departments. Department roles are User, Receptionist (overrides office hours), Supervisor (reports and queue oversight), Department Administrator (call handling, trunks, messaging), Manager (adds user management, recordings, barge in and listen in), and Owner (can elevate users in its departments up to Manager or Department Administrator). System Administrator and System Owner are system-wide; only a System Owner can elevate someone to either.\n\n'
              'Protect accounts with two-factor authentication using a Google or Microsoft authenticator app, and consider single sign-on with Google or Microsoft.')
    b.section('Apps, voicemail, forwarding, and recording', ['2.3', '2.4', '2.5'],
              'A 3CX Talk link lets visitors call a user, ring group, or queue from a browser with no app or call charge, and a 3CX Meet link opens a person\'s meeting room for an ad hoc video conference. Users can choose which assigned DID shows on outgoing app calls once "Allow Users to Select Outbound Route & Caller ID" is enabled. For groups, voicemail can be emailed only, cloned into each member\'s box, or sent to extra recipients only. A user can set up to 15 forwarding exceptions matched by caller ID, and Switch Status sets Available, Away, or Do Not Disturb from the office hours.\n\n'
              'Call recording saves to a temporary folder outside the install directory, then archives to remote storage; a per-user option stops other internal parties recording a protected extension. Dial codes in Admin > System > Dial Codes include the paging code (for example *9), which is also the intercom prefix.')
