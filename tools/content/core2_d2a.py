"""Core 2, domain 2 (Security): new concepts for the existing objectives 2.1, 2.3, 2.4, and 2.5."""
import svg as S


def build(b):
    b.topics['2.1'] = ['Physical', 'Logical', 'Administrative', 'Least privilege', 'Zero Trust', 'Mantraps and badges', 'Active Directory', 'ACLs']
    b.topics['2.3'] = ['Hardening', 'Encryption', 'Secure Boot', 'Updates', 'EDR', 'Password policy', 'Account lockout', 'Screen lock', 'AutoRun']
    b.topics['2.4'] = ['MDM', 'BYOD', 'Remote wipe', 'App control', 'Screen locks', 'Locator apps', 'Sideloading', 'IoT hardening']
    b.topics['2.5'] = ['PII', 'DLP', 'Backups', 'Destruction', 'Permissions', 'Degaussing', 'Drive wipe', 'Certificate of destruction']

    # ------------------------------------------------------------------------------------------ 2.1
    b.add('2.1', 'Access control vestibule (mantrap)',
          'A small space with two interlocking doors where the second door will not open until the first has closed and the person has been authenticated, stopping tailgating and holding unauthorized entrants.',
          'stop an unauthorized person from following an employee into a secure data room',
          ['A badge reader alone', 'A security camera', 'A perimeter fence'],
          'TWO interlocked doors admit one authenticated person at a time — a badge reader alone can be tailgated.',
          S.steps([('Outer door', 'opens, then closes'), ('Authenticate', 'badge, PIN, biometric'), ('Inner door', 'one person at a time')],
                  title='Access control vestibule', tones=['plain', 'blue', 'green']),
          caption='An access control vestibule interlocks two doors so only one authenticated person passes at a time.')

    b.add('2.1', 'Bollards',
          'Short, sturdy posts set at entrances and walkways that stop vehicles from ramming a building while letting pedestrians pass.',
          'prevent a vehicle from being driven into a building\'s entrance',
          ['Access control vestibule', 'Motion sensors', 'Cable locks'],
          'An anti-VEHICLE barrier — a vestibule or badge reader controls people, not cars.',
          S.facts([('Purpose', 'stop vehicles, let people through'), ('Common spot', 'entrances and loading docks'), ('Not for', 'deciding who may walk in')], title='Bollards'),
          caption='Bollards are sturdy posts that block vehicles from reaching a building while allowing foot traffic.')

    b.add('2.1', 'Badge reader and smart card',
          'An access control reader that authenticates a proximity badge or smart card (something you have), often with a PIN or biometric, and logs each entry.',
          'let employees open a secure door with an ID card and keep a log of who entered',
          ['A keyed deadbolt', 'A motion sensor', 'A bollard'],
          'Something you HAVE, with an entry log — a plain key leaves no record of who used it.',
          S.steps([('Badge', 'tapped on reader'), ('Controller', 'checks rights'), ('Door unlocks', 'entry is logged')], title='Badge access', tones=['plain', 'blue', 'green']),
          caption='A badge or smart card reader checks the card, unlocks the door, and records who entered.')

    b.add('2.1', 'Biometric access control',
          'Verifying identity by a physical trait such as a fingerprint, face, iris, or palm (something you are), which cannot be lent or forgotten but can suffer false accepts and rejects.',
          'secure a server room with a credential that cannot be lent to a coworker like a keycard',
          ['A smart card', 'A PIN', 'A key fob'],
          'Something you ARE — a card, PIN, or fob can be handed over, a fingerprint cannot.',
          S.facts([('Something you know', 'password, PIN'), ('Something you have', 'smart card, token'), ('Something you are', 'fingerprint, face, iris')], title='Authentication factors'),
          caption='Biometrics verify who you are by a physical trait, so the credential cannot be lent out.')

    b.add('2.1', 'Video surveillance',
          'Cameras at entrances and sensitive areas that deter misuse and record activity, providing evidence that can be reviewed after an incident.',
          'review who entered the server room last Tuesday night after equipment went missing',
          ['A motion sensor', 'An alarm system', 'Bollards'],
          'It RECORDS evidence you can review later — a motion sensor only detects movement as it happens.',
          S.steps([('Camera', 'covers the entrance'), ('Recorder', 'stores footage'), ('Review', 'evidence after an event')], title='Video surveillance', tones=['plain', 'blue', 'green']),
          caption='Surveillance cameras deter misuse and record activity as evidence for later review.')

    b.add('2.1', 'Motion sensors and alarms',
          'Sensors that detect movement or a door or window opening and trigger an alarm or notification when an area should be empty.',
          'alert security the moment someone enters the data center after hours',
          ['Video surveillance (recorded footage)', 'Bollards', 'An access control vestibule'],
          'It DETECTS and alerts in real time — cameras provide the record of what happened.',
          S.steps([('Sensor trips', 'motion or door open'), ('Alarm panel', 'sounds or alerts'), ('Security notified', 'responds')], title='Detecting after-hours entry', tones=['amber', 'blue', 'green']),
          caption='Motion sensors and alarms detect entry to an empty area and alert security immediately.')

    b.add('2.1', 'Access control list (ACL)',
          'A list attached to a resource or network device that states which users, groups, or addresses are allowed or denied particular actions.',
          'define which accounts may read, modify, or delete a shared folder',
          ['A password policy', 'A VPN', 'A distribution group'],
          'A per-resource list of WHO may do WHAT — permissions on a folder and rules on a router both work this way.',
          S.table(['Principal', 'Read', 'Modify', 'Delete'], [('Finance group', 'yes', 'yes', 'no'), ('Interns', 'yes', 'no', 'no'), ('Everyone else', 'no', 'no', 'no')],
                  title='An ACL on a shared folder', col_widths=[0.4, 0.2, 0.2, 0.2]),
          caption='An ACL lists which users or groups may read, change, or delete a resource, and which are denied.')

    b.add('2.1', 'Email filtering',
          'A gateway or cloud service that scans incoming and outgoing mail for spam, phishing, malicious links, and attachments, and quarantines or blocks them before they reach users.',
          'reduce phishing emails and malicious attachments reaching employees\' inboxes',
          ['A host-based firewall', 'Full disk encryption', 'A BIOS password'],
          'It filters the MAIL flow before users see it — it complements user training rather than replacing it.',
          S.steps([('Internet mail', 'all inbound messages'), ('Filter', 'spam, phish, malware'), ('Inbox or quarantine', 'clean vs blocked')], title='Email filtering', tones=['plain', 'amber', 'green']),
          caption='Email filtering scans mail for spam, phishing, and malware and quarantines it before users see it.')

    b.add('2.1', 'Active Directory domain controller',
          'A Windows Server running Active Directory Domain Services that stores user and computer accounts and authenticates sign-ins for a domain, giving centralized management and single sign-on.',
          'centrally authenticate employees and manage accounts for all company PCs',
          ['A workgroup', 'Local Users and Groups', 'Cloud file sync'],
          'The CENTRAL authority for accounts and policy — a workgroup has no server, and local accounts exist on one PC only.',
          S.hub(('Domain controller (AD DS)', 'central authentication'), [('Users', 'accounts and groups'), ('Computers', 'domain-joined PCs'), ('Policies', 'Group Policy')]),
          caption='A domain controller holds the directory and authenticates users and computers for the whole domain.')

    b.add('2.1', 'Organizational unit (OU)',
          'A container in Active Directory that organizes users, computers, and groups so Group Policy and delegated administration can be applied to one department or location.',
          'apply a different Group Policy to the Sales department than to Engineering',
          ['A security group', 'A new domain', 'A local group'],
          'A CONTAINER for applying policy and delegating admin — a security group is for granting permissions.',
          S.layers([('Domain', 'corp.example.com', 'blue'), ('OU: Sales', 'its users and PCs get Group Policy A', 'green'), ('OU: Engineering', 'its users and PCs get Group Policy B', 'amber')], title='Organizational units'),
          caption='OUs group accounts and computers inside a domain so policy can be applied to each separately.')

    b.add('2.1', 'Security group',
          'A group used to assign permissions and rights to many users at once; permissions are granted to the group, and users receive them by membership.',
          'grant 40 accountants access to a shared folder by changing a single permission entry',
          ['An organizational unit', 'A distribution group', 'A Group Policy object'],
          'Permissions go to the GROUP and membership does the rest — an OU is for policy, and a distribution group only handles email.',
          S.steps([('Users', 'added to the group'), ('Security group', 'holds the permission'), ('Resource', 'folder or printer')], title='Group-based access', tones=['plain', 'blue', 'green']),
          caption='Granting permissions to a security group gives every member access with one change.')

    b.add('2.1', 'Logon script',
          'A script that runs automatically when a user signs in, commonly to map network drives, connect printers, or set values for that session.',
          'map the department share and printers automatically every time a user signs in',
          ['A scheduled backup job', 'A DHCP option', 'A registry export'],
          'It runs at SIGN-IN for that user — a scheduled task runs at a set time instead.',
          S.terminal([r'net use Z: \\fs01\dept', r'net use P: \\ps01\hr-printer', 'echo Drives and printers mapped'], title='logon.bat'),
          caption='A logon script runs at sign-in to map drives and printers or configure the session.')

    b.add('2.1', 'Folder redirection',
          'A Group Policy setting that redirects known folders such as Documents and Desktop to a network location, so files are stored and backed up centrally and follow the user between PCs.',
          'keep every user\'s Documents on the file server so they are backed up and follow the user to any PC',
          ['A mapped network drive', 'A local backup', 'A VPN'],
          'Known folders such as Documents transparently live on the SERVER — a mapped drive is a separate letter users must remember to use.',
          S.steps([('Documents', 'looks like a local folder'), ('Group Policy', 'redirects the path'), ('File server', 'stores and backs up')], title='Folder redirection', tones=['plain', 'blue', 'green']),
          caption='Folder redirection stores users\' Documents and Desktop on a server while they still appear local.')

    # ------------------------------------------------------------------------------------------ 2.3
    b.add('2.3', 'Strong password policy',
          'A policy favoring long, unique passwords or passphrases that are never reused or shared, with a password manager to make that practical.',
          'set a password policy that makes guessing and brute force harder without relying on frequent forced changes',
          ['Password hints on the sign-in screen', 'A shared team password', 'Four-digit PINs for every account'],
          'LENGTH and uniqueness beat clever substitutions — reuse and sharing are the real killers.',
          S.facts([('Length', '12 or more characters, or a passphrase'), ('Unique', 'one password per account'), ('Complexity', 'mixed types where required'), ('Storage', 'use a password manager')], title='Strong password practice'),
          caption='Long, unique, unshared passwords stored in a manager resist guessing far better than short complex ones.')

    b.add('2.3', 'Account lockout policy',
          'A policy that temporarily locks an account after a set number of failed sign-in attempts, slowing brute-force and password-guessing attacks.',
          'limit how many wrong passwords an attacker can try against an account',
          ['Password expiration', 'Password history', 'Screen lock timeout'],
          'It counts FAILED attempts and then blocks — expiration just forces a change on a schedule.',
          S.steps([('Wrong password', 'attempts 1, 2, 3...'), ('Threshold hit', 'for example 5 tries'), ('Account locked', 'waits or admin unlocks')], title='Account lockout', tones=['amber', 'red', 'plain']),
          caption='After too many failed sign-ins the account is locked, blocking rapid password guessing.')

    b.add('2.3', 'Screen lock timeout',
          'Automatically locking the screen after a period of inactivity and requiring a password to resume, so an unattended workstation cannot be used.',
          'keep a reception PC from being used by a passerby whenever the receptionist steps away',
          ['Account lockout', 'Full disk encryption', 'A BIOS password'],
          'It locks an unattended SESSION — account lockout reacts to wrong passwords, not to idleness.',
          S.steps([('Idle', 'for N minutes'), ('Screen locks', 'session stays open'), ('Password', 'needed to resume')], title='Inactivity lock', tones=['plain', 'amber', 'green']),
          caption='A screen lock timeout secures an unattended PC by requiring a password after inactivity.')

    b.add('2.3', 'Disabling AutoRun and AutoPlay',
          'Turning off automatic execution when removable media is inserted, so a program on a USB drive cannot launch without the user choosing to run it.',
          'keep a malicious program on a found USB stick from launching the moment it is plugged in',
          ['Disabling the firewall', 'A screen lock timeout', 'Secure Boot'],
          'It stops auto-RUN from removable media — antivirus still has to scan what the drive contains.',
          S.compare(('AutoRun on', ['Plug in a USB drive', 'The program runs by itself', 'Malware executes']), ('AutoRun off', ['Plug in a USB drive', 'Nothing runs automatically', 'The user decides']), title='Removable media behavior', tones=('red', 'green')),
          caption='Disabling AutoRun stops programs on removable media from executing automatically.')

    b.add('2.3', 'BIOS/UEFI password',
          'A firmware password that prevents unauthorized changes to boot order and settings, and can require a password before the PC starts from any device.',
          'stop someone from changing the boot order to start a PC from a USB drive',
          ['A Windows sign-in password', 'Full disk encryption', 'A screen lock timeout'],
          'It protects FIRMWARE settings — a Windows password is only checked after the OS boots.',
          S.steps([('Power on', 'firmware starts'), ('UEFI password', 'to change settings'), ('Windows loads', 'its own sign-in')], title='Firmware password', tones=['plain', 'amber', 'green']),
          caption='A BIOS or UEFI password protects boot settings and startup devices before Windows loads.')

    b.add('2.3', 'Logon time and account restrictions',
          'Limiting when an account can sign in (logon hours) and where (specific computers), and setting expiry dates so access ends when it should.',
          'prevent an hourly employee\'s account from being used at 3 a.m. on a weekend',
          ['Account lockout', 'Password expiration', 'Least privilege'],
          'It controls WHEN and WHERE an account may sign in — lockout reacts to failures, not to the time of day.',
          S.facts([('Logon hours', 'Mon-Fri, 07:00 to 19:00'), ('Log on to', 'specific workstations only'), ('Account expires', 'on the contractor\'s end date')], title='Account restrictions'),
          caption='Logon-hour and workstation restrictions limit when and where an account can be used.')

    b.add('2.3', 'Disabling default and guest accounts',
          'Renaming or disabling the built-in Administrator and Guest accounts and using named, accountable accounts removes easy, well-known targets for attackers.',
          'reduce the risk from well-known built-in accounts that attackers try first',
          ['Enabling the Guest account', 'Sharing the Administrator password', 'Using one account for everyone'],
          'Well-known accounts are the FIRST ones tried — named accounts also make actions traceable to a person.',
          S.compare(('Risky', ['Guest account enabled', 'Default Administrator in use', 'One shared admin password']), ('Better', ['Guest disabled', 'Named admin accounts', 'Each action traceable']), title='Built-in accounts', tones=('red', 'green')),
          caption='Disable or rename default accounts and use named accounts so access is limited and traceable.')

    # ------------------------------------------------------------------------------------------ 2.4
    b.add('2.4', 'Mobile locator app',
          'A feature such as Find My or Find My Device that shows a lost phone on a map and lets the owner make it ring, lock it, or erase it.',
          'see on a map where a lost phone is and make it ring',
          ['Remote wipe', 'Geofencing', 'An MDM compliance policy'],
          'It LOCATES, rings, and locks — remote wipe is the destructive last resort when recovery is unlikely.',
          S.steps([('Lost phone', 'signed in to the account'), ('Locator', 'shows location'), ('Ring, lock, or erase', 'owner chooses')], title='Finding a lost device', tones=['amber', 'blue', 'green']),
          caption='A locator app finds a lost phone and lets the owner ring, lock, or erase it remotely.')

    b.add('2.4', 'Sideloading',
          'Installing an app from outside the official app store, such as an APK file from a website, bypassing the store\'s vetting and increasing the chance of malware.',
          'explain the risk of installing a mobile app from an unofficial website instead of the official store',
          ['Jailbreaking', 'An MDM profile', 'A biometric lock'],
          'It changes WHERE apps come from and skips store vetting — jailbreaking changes the OS\'s own restrictions.',
          S.compare(('Official store', ['Apps reviewed and scanned', 'Signed and updated', 'Lower malware risk']), ('Sideloaded APK', ['No store review', 'Source may be spoofed', 'Higher malware risk']), title='App sources', tones=('green', 'red')),
          caption='Sideloading skips the app store\'s vetting, so a malicious app is more likely to get through.')

    b.add('2.4', 'Jailbreaking and rooting',
          'Removing the manufacturer\'s restrictions to gain root-level control of a phone; it disables built-in protections, enables untrusted apps, and is typically flagged as non-compliant by MDM.',
          'identify a device whose OS restrictions were removed and that an MDM reports as non-compliant',
          ['Sideloading', 'A remote wipe', 'Geofencing'],
          'It removes the OS\'s own SECURITY model — sideloading only changes where apps are installed from.',
          S.steps([('Restrictions removed', 'root access gained'), ('Protections off', 'sandboxing weakened'), ('MDM flags it', 'non-compliant device')], title='Jailbroken or rooted device', tones=['amber', 'red', 'blue']),
          caption='Jailbreaking or rooting removes OS restrictions and protections, making a device non-compliant and riskier.')

    b.add('2.4', 'IoT device hardening',
          'Changing default credentials, updating firmware, disabling unneeded services, and isolating IoT and embedded devices on a separate network because they are rarely patched and cannot run endpoint security.',
          'secure a new smart camera that ships with a default admin password',
          ['Leaving the default password in place', 'Forwarding its ports to the Internet', 'Placing it on the main office LAN'],
          'Change defaults, patch, and ISOLATE it — embedded devices often cannot run endpoint software.',
          S.steps([('Change default login', 'unique credentials'), ('Update firmware', 'close known flaws'), ('Isolate', 'IoT or guest network')], title='Hardening an IoT device', tones=['amber', 'blue', 'green']),
          caption='Harden IoT devices by changing defaults, patching, and isolating them from the main network.')

    # ------------------------------------------------------------------------------------------ 2.5
    b.add('2.5', 'Degaussing',
          'Exposing magnetic media such as hard drives and backup tapes to a powerful magnetic field to scramble the data; it is ineffective on SSDs and leaves HDDs unusable.',
          'destroy the data on retired magnetic hard drives and backup tapes beyond recovery',
          ['A quick format', 'A drive wipe (overwrite)', 'Emptying the Recycle Bin'],
          'Magnetic fields only work on MAGNETIC media — SSDs and flash need overwriting or physical destruction.',
          S.compare(('Works on', ['Hard disk drives', 'Backup tapes']), ('Does not work on', ['SSDs', 'USB flash drives', 'Optical discs']), title='Degaussing', tones=('green', 'red')),
          caption='Degaussing scrambles data on magnetic media only; SSDs and flash need other methods.')

    b.add('2.5', 'Physical destruction (shredding)',
          'Mechanically destroying storage media by shredding, drilling, crushing, or incinerating it so data cannot be recovered; the most certain method for failed or highly sensitive drives.',
          'guarantee that a failed drive holding sensitive records can never be read again',
          ['A standard format', 'Recycling the drive as it is', 'A drive wipe (overwrite)'],
          'It destroys the MEDIA itself — a format or wipe leaves a working drive behind.',
          S.facts([('Shredder', 'cuts drives into small pieces'), ('Drill or crush', 'ruins platters or chips'), ('Incinerate', 'melts media completely')], title='Physical destruction'),
          caption='Shredding, drilling, crushing, or burning media destroys it so the data cannot be recovered.')

    b.add('2.5', 'Drive wipe (overwrite)',
          'Overwriting every sector of a drive with patterns, using wiping software or a secure-erase command, so it can be reused or resold with its old data unrecoverable.',
          'repurpose a workstation\'s hard drive for another employee without leaving recoverable data',
          ['A standard format', 'Deleting the files', 'Degaussing'],
          'It OVERWRITES so the drive stays usable — deleting or formatting leaves data recoverable.',
          S.steps([('Old data', 'still on the platters'), ('Overwrite passes', 'every sector rewritten'), ('Reusable drive', 'old data unrecoverable')], title='Drive wipe', tones=['amber', 'blue', 'green']),
          caption='Overwriting every sector makes old data unrecoverable while leaving the drive reusable.')

    b.add('2.5', 'Standard (quick) format',
          'A normal format only rebuilds the file system tables and leaves the old data on the disk, so recovery tools can often restore it; it is not adequate sanitization before disposal.',
          'identify which disposal step only rebuilds the file table and leaves the old data recoverable',
          ['Drive wipe (overwrite)', 'Degaussing', 'Physical shredding'],
          'It resets the INDEX, not the data — only overwriting or destroying the media removes the contents.',
          S.compare(('Standard format', ['Rebuilds the file tables', 'Data still on the disk', 'Recoverable with tools']), ('Wipe or destroy', ['Overwrites or destroys media', 'Data gone for good', 'Acceptable for disposal']), title='Format is not sanitization', tones=('amber', 'green')),
          caption='A standard format leaves data recoverable; only overwriting or destroying the media sanitizes a drive.')

    b.add('2.5', 'Certificate of destruction',
          'A document from a destruction vendor attesting that specific media or devices were destroyed, listing serial numbers, date, and method, as evidence for audits and compliance.',
          'prove to auditors that retired drives were destroyed by an outside vendor',
          ['A chain of custody form', 'An asset tag', 'A backup log'],
          'PROOF of destruction (serials, date, method) — chain of custody tracks how evidence was handled.',
          S.facts([('Lists', 'serial number of each drive'), ('States', 'method and date of destruction'), ('Signed by', 'the destruction vendor'), ('Kept for', 'audit and compliance records')], title='Certificate of destruction'),
          caption='A certificate of destruction documents which media were destroyed, when, and how.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Physical and logical security controls', ['2.1'],
              'Physical controls keep people and vehicles away from equipment: bollards stop vehicles, an access control vestibule (mantrap) admits one authenticated person at a time to defeat tailgating, badge readers and smart cards check something you have, biometrics check something you are, and surveillance cameras record while motion sensors and alarms alert in real time. Know which control prevents, detects, or records, since scenarios often hinge on that difference.\n\n'
              'On the logical side, an access control list states who may do what to a resource, and email filtering screens mail before users see it. In a Windows domain, domain controllers authenticate users and computers, organizational units group them so Group Policy can be applied separately, security groups carry permissions (grant to the group, then manage membership), logon scripts map drives and printers at sign-in, and folder redirection stores Documents and Desktop on a server.')
    b.section('Workstation hardening practices', ['2.3'],
              'Several simple settings cover most day-to-day workstation risk. A strong password policy emphasizes length and uniqueness over clever substitutions, account lockout blocks rapid guessing after repeated failures, and a screen lock timeout protects an unattended session. Logon-hour and workstation restrictions limit when and where an account works, and disabling or renaming the default Administrator and Guest accounts removes well-known targets.\n\n'
              'Disable AutoRun and AutoPlay so a program on a USB drive cannot launch by itself, and set a BIOS or UEFI password so nobody can change the boot order to start from their own media. Each control addresses a different step of an attack, so match the control to the threat — a Windows password does nothing for firmware settings, for example.')
    b.section('Mobile and IoT protection', ['2.4'],
              'A locator app finds, rings, and locks a lost phone, with remote wipe as the destructive last resort. Sideloading installs apps from outside the official store and skips vetting, while jailbreaking or rooting removes the operating system\'s own restrictions; MDM typically flags both as non-compliant.\n\n'
              'IoT and embedded devices are rarely patched and cannot run endpoint security, so harden them by changing default credentials, updating firmware, disabling unneeded services, and isolating them on a separate network.')
    b.section('Data destruction and disposal', ['2.5'],
              'Deleting files or running a standard format only rebuilds the index and leaves the data recoverable. To reuse a drive, overwrite every sector with a drive wipe; to retire it, degauss magnetic media (which does nothing to SSDs) or physically destroy it by shredding, drilling, crushing, or incinerating. Physical destruction is the most certain option for failed or highly sensitive media.\n\n'
              'When a vendor performs the work, a certificate of destruction lists the serial numbers, date, and method as proof for auditors. This is different from chain of custody, which documents how evidence was handled.')
