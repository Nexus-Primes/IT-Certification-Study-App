"""Core 2, domain 2 (Security): new objectives 2.7-2.12 and their concepts."""
import svg as S


def build(b):
    b.objective('2.7', 'Wireless security protocols', ['WPA2 and WPA3', '802.1X', 'TACACS+', 'Kerberos', 'Authenticator apps'])
    b.objective('2.8', 'Malware types and prevention', ['Trojans and viruses', 'Spyware and keyloggers', 'Cryptominers', 'Botnets', 'Detection methods'])
    b.objective('2.9', 'Attacks and vulnerabilities', ['Vishing and smishing', 'DoS and on-path', 'Injection attacks', 'Zero-day', 'Insider threats'])
    b.objective('2.10', 'Windows security settings', ['UAC', 'Account types', 'NTFS and share permissions', 'BitLocker and EFS', 'Defender'])
    b.objective('2.11', 'SOHO network security', ['Default credentials', 'MAC filtering', 'Port forwarding', 'Screened subnet', 'Content filtering'])
    b.objective('2.12', 'Browser security', ['Trusted downloads', 'Extensions', 'HTTPS and certificates', 'Password managers', 'Private browsing'])

    # ------------------------------------------------------------------------------------------ 2.7 Wireless security
    b.add('2.7', 'WPA2 with AES-CCMP',
          'Wi-Fi security that encrypts traffic with AES using CCMP and, in Personal mode, a shared passphrase; WPA2-Enterprise authenticates each user through 802.1X.',
          'choose widely supported Wi-Fi encryption that uses AES instead of the weak, older RC4-based options',
          ['WEP', 'WPA with TKIP', 'An open network'],
          'AES-CCMP is the strong part — WEP and TKIP are RC4-based and deprecated.',
          S.table(['Protocol', 'Cipher', 'Status'], [('WEP', 'RC4', 'broken'), ('WPA with TKIP', 'RC4', 'deprecated'), ('WPA2', 'AES-CCMP', 'solid'), ('WPA3', 'AES with SAE', 'best')], title='Wi-Fi security over time', col_widths=[0.4, 0.3, 0.3]),
          caption='WPA2 uses AES-CCMP encryption, which replaced the weak RC4-based WEP and TKIP.')

    b.add('2.7', 'WEP and TKIP (legacy protocols)',
          'WEP and WPA with TKIP use the RC4 stream cipher with known weaknesses; WEP can be cracked in minutes, so networks should use WPA2 or WPA3 with AES instead.',
          'explain why an old router configured for WEP should be replaced or reconfigured',
          ['WPA3', 'WPA2 with AES', '802.1X'],
          'RC4-based and crackable — move to WPA2 or WPA3 with AES.',
          S.steps([('WEP', 'cracked in minutes'), ('WPA with TKIP', 'stopgap, deprecated'), ('WPA2 / WPA3', 'use AES')], title='Retire the legacy options', tones=['red', 'amber', 'green']),
          caption='WEP and TKIP are RC4-based and weak; use WPA2 or WPA3 with AES.')

    b.add('2.7', 'SAE (WPA3 handshake)',
          'Simultaneous Authentication of Equals replaces the WPA2 pre-shared-key handshake with a password-authenticated key exchange that resists offline dictionary attacks and provides forward secrecy.',
          'stop an attacker who captures a Wi-Fi handshake from cracking the passphrase offline later',
          ['The WPA2 pre-shared key handshake', 'WEP', 'MAC filtering'],
          'It defeats OFFLINE guessing of a captured handshake — WPA2-PSK handshakes can be attacked offline.',
          S.compare(('WPA2-PSK', ['Four-way handshake', 'Capture it, crack it offline', 'No forward secrecy']), ('WPA3 SAE', ['Password-authenticated exchange', 'Offline guessing fails', 'Forward secrecy']), title='Personal mode handshakes'),
          caption='SAE protects WPA3-Personal against offline password guessing and adds forward secrecy.')

    b.add('2.7', '802.1X enterprise Wi-Fi authentication',
          'Port-based access control in which each user or device authenticates individually through EAP to a RADIUS server before the access point or switch grants access; it underlies WPA2 and WPA3-Enterprise.',
          'give each employee unique Wi-Fi credentials and revoke one person\'s access without changing a shared password',
          ['WPA2-Personal with a pre-shared key', 'MAC filtering', 'A captive portal'],
          'PER-USER credentials checked by a RADIUS server — a pre-shared key is one password for everyone.',
          S.steps([('Supplicant', 'laptop or phone'), ('Authenticator', 'access point or switch'), ('RADIUS server', 'checks identity')], title='802.1X roles', tones=['plain', 'blue', 'green']),
          caption='802.1X makes each user authenticate to a RADIUS server before the network grants access.')

    b.add('2.7', 'TACACS+',
          'A Cisco-originated AAA protocol, typically used to authenticate and authorize administrators on network devices, separating authentication, authorization, and accounting and encrypting the whole payload over TCP.',
          'control which commands each administrator may run on routers and switches',
          ['RADIUS', 'Kerberos', 'LDAP'],
          'Device ADMINISTRATION with per-command authorization — RADIUS is aimed at user network access.',
          S.compare(('TACACS+', ['TCP port 49', 'Encrypts the full payload', 'Per-command authorization']), ('RADIUS', ['UDP ports 1812 and 1813', 'Encrypts the password only', 'User network access']), title='TACACS+ vs RADIUS'),
          caption='TACACS+ authorizes administrators on network devices command by command over encrypted TCP.')

    b.add('2.7', 'Kerberos',
          'A ticket-based authentication protocol used by Active Directory in which a key distribution center issues time-limited tickets, so users prove identity without resending passwords; it needs clocks to be closely synchronized.',
          'explain why domain sign-in fails when a workstation\'s clock is more than a few minutes off',
          ['A DNS server failure', 'An expired website certificate', 'A full system drive'],
          'TICKETS with a roughly five-minute clock tolerance — a wrong clock breaks domain sign-in even with the right password.',
          S.steps([('User', 'asks for a ticket'), ('Ticket server (KDC)', 'issues tickets'), ('Service', 'accepts the ticket')], title='Kerberos tickets', tones=['plain', 'blue', 'green']),
          caption='Kerberos issues time-limited tickets, so clocks must stay in sync for domain sign-in to work.')

    b.add('2.7', 'Authenticator app (TOTP)',
          'An app that generates time-based one-time passcodes on the user\'s device as a second factor; it is safer than SMS because the codes are never sent over the phone network.',
          'add a second factor that is not exposed to SIM-swap interception of text messages',
          ['SMS one-time codes', 'Security questions', 'Emailing a password reset link'],
          'Codes are generated ON the device — SMS codes can be intercepted or SIM-swapped.',
          S.steps([('Shared secret', 'scanned at setup'), ('App computes', 'six digits every 30 s'), ('Server checks', 'the same code')], title='Time-based one-time codes', tones=['plain', 'blue', 'green']),
          caption='An authenticator app computes rotating codes locally, avoiding the weaknesses of SMS codes.')

    b.add('2.7', 'Hardware security key (FIDO2)',
          'A physical USB or NFC device that signs a challenge with a private key and only responds to the genuine site, giving a strong second factor that resists phishing.',
          'protect administrators from phishing pages that steal passwords and typed one-time codes',
          ['SMS one-time codes', 'Security questions', 'A longer password'],
          'A phishing-RESISTANT factor — a code typed into a fake site can still be stolen.',
          S.steps([('Sign in', 'site sends a challenge'), ('Key signs', 'for that site only'), ('Fake site', 'gets nothing usable')], title='Why security keys resist phishing', tones=['plain', 'green', 'red']),
          caption='A hardware key only answers the real site, so phishing pages cannot reuse what it provides.')

    # ------------------------------------------------------------------------------------------ 2.8 Malware types
    b.add('2.8', 'Trojan horse',
          'Malware disguised as legitimate software that performs hidden malicious actions once the user runs it; it does not replicate by itself.',
          'identify malware that arrived inside a free \'PDF converter\' download and opened a backdoor after installation',
          ['A worm', 'A file-infecting virus', 'A cryptominer'],
          'It is DISGUISED as something useful and user-installed — a worm spreads by itself with no user action.',
          S.steps([('Looks useful', 'free tool or crack'), ('User runs it', 'installs willingly'), ('Hidden payload', 'backdoor or theft')], title='How a trojan works', tones=['plain', 'amber', 'red']),
          caption='A trojan hides a malicious payload inside software that appears useful.')

    b.add('2.8', 'Virus',
          'Malicious code that attaches itself to a legitimate file or program and spreads when that host is opened or run, usually needing a user action.',
          'identify malware that infects an executable and spreads when the infected file is shared and run on another PC',
          ['A worm', 'A trojan', 'A rootkit'],
          'It needs a HOST file and user action to spread — a worm spreads on its own across networks.',
          S.compare(('Virus', ['Needs a host file', 'Spreads when the host runs', 'User action required']), ('Worm', ['A standalone program', 'Spreads by itself', 'Exploits network flaws']), title='Virus vs worm', tones=('amber', 'red')),
          caption='A virus attaches to a host file and spreads when the host runs; a worm spreads on its own.')

    b.add('2.8', 'Worm',
          'Self-replicating malware that spreads across networks by exploiting vulnerabilities, needing no host file or user action, and often consuming bandwidth quickly.',
          'explain why one unpatched PC infected hundreds of machines within minutes without anyone opening an attachment',
          ['A virus', 'A trojan', 'Spyware'],
          'It spreads ITSELF over the network through a vulnerability — a virus needs a host file and a user.',
          S.steps([('Infects one PC', 'through an unpatched flaw'), ('Scans the network', 'finds vulnerable hosts'), ('Copies itself', 'and repeats')], title='A worm spreading', tones=['red', 'amber', 'red']),
          caption='A worm replicates itself across networks through vulnerabilities, with no user action required.')

    b.add('2.8', 'Spyware',
          'Software that secretly monitors user activity and collects information such as browsing habits, credentials, or screenshots and sends it to a third party.',
          'identify malware that quietly records the sites a user visits and sends them to a remote server',
          ['Adware', 'Ransomware', 'A worm'],
          'It quietly WATCHES and reports — ransomware announces itself, and adware is mostly an annoyance.',
          S.steps([('Hidden agent', 'runs unnoticed'), ('Collects data', 'sites, logins, screens'), ('Sends it out', 'to the attacker')], title='Spyware', tones=['plain', 'amber', 'red']),
          caption='Spyware secretly gathers activity and credentials and sends them to an attacker.')

    b.add('2.8', 'Keylogger',
          'Software or a hardware device that records every keystroke to capture passwords and messages; hardware loggers sit between the keyboard and the PC.',
          'explain how an attacker captured a user\'s typed passwords without ever touching the password database',
          ['A rootkit', 'A cryptominer', 'Ransomware'],
          'It records KEYSTROKES — spyware is the broader category, and a keylogger can see anything typed, including one-time codes.',
          S.steps([('User types', 'passwords and messages'), ('Keylogger', 'logs every key'), ('Attacker', 'reads the log')], title='Keylogger', tones=['plain', 'amber', 'red']),
          caption='A keylogger records everything typed, capturing passwords before they are ever stored.')

    b.add('2.8', 'Boot sector virus',
          'Malware that infects the master boot record or boot sector so it loads before the operating system, hiding from antivirus that runs inside Windows.',
          'identify malware that loads before Windows starts and hides from security software running inside the OS',
          ['A file-infecting virus', 'A macro virus', 'A worm'],
          'It runs BEFORE the OS — a boot-time scan, MBR repair, and Secure Boot are the defenses.',
          S.steps([('Power on', 'firmware starts'), ('Boot sector', 'infected code runs first'), ('OS loads', 'already compromised')], title='Boot sector infection', tones=['plain', 'red', 'amber']),
          caption='A boot sector virus runs before the OS, so ordinary in-OS antivirus cannot see it.')

    b.add('2.8', 'Cryptominer (cryptojacking)',
          'Malware that hijacks a computer\'s CPU or GPU to mine cryptocurrency for an attacker, showing up as constant high resource use, heat, and slowdowns.',
          'explain why several office PCs run hot at idle with sustained 100% CPU and no obvious malware messages',
          ['Ransomware', 'Spyware', 'Adware'],
          'It steals your CYCLES for mining — fans spinning and constant 100% CPU at idle are the clue.',
          S.facts([('Symptom', 'high CPU or GPU use at idle'), ('Symptom', 'heat, loud fans, a slow PC'), ('Goal', 'mine coins for the attacker'), ('Spread', 'trojans and malicious scripts')], title='Cryptojacking'),
          caption='Cryptominers use your processor to mine cryptocurrency, causing sustained high usage and heat.')

    b.add('2.8', 'Botnet',
          'A network of compromised computers (zombies) controlled remotely by an attacker through command and control, used for DDoS attacks, spam, and credential attacks.',
          'explain how thousands of infected home PCs were used together to flood a website',
          ['A worm', 'A rootkit', 'A honeypot'],
          'Many infected machines obeying ONE controller — a worm is the spreader, the botnet is the army.',
          S.hub(('Attacker (C2 server)', 'commands the bots'), [('Zombie PC', 'DDoS traffic'), ('Zombie PC', 'sends spam'), ('Zombie IoT', 'credential attacks')]),
          caption='A botnet is a group of infected machines that an attacker commands remotely at scale.')

    b.add('2.8', 'Security awareness (anti-phishing) training',
          'Regular training that teaches staff to spot phishing and social engineering, avoid unsafe behavior, and report suspicious messages, covering attacks that technology alone misses.',
          'reduce how often employees click convincing phishing emails that filters let through',
          ['A stricter firewall', 'Full disk encryption', 'Disabling USB ports'],
          'It trains PEOPLE — technical controls cannot stop someone convinced to hand over a password.',
          S.steps([('Teach', 'spot the red flags'), ('Simulate', 'phishing tests'), ('Report', 'one-click report')], title='Awareness training', tones=['blue', 'amber', 'green']),
          caption='Awareness training teaches users to spot and report phishing that technical filters miss.')

    b.add('2.8', 'Heuristic (behavioral) detection',
          'Antimalware that flags software by what it does or how it is built instead of matching known signatures, so it can catch new variants; it may also raise more false positives.',
          'catch a never-before-seen malware variant by looking at what the file tries to do',
          ['Signature-based detection', 'A firewall rule', 'Patch management'],
          'BEHAVIOR catches new variants — signatures only match samples that are already known.',
          S.compare(('Signature', ['Matches known samples', 'Fast and precise', 'Misses brand-new malware']), ('Heuristic', ['Watches behavior', 'Catches new variants', 'More false positives']), title='Detection methods'),
          caption='Heuristic detection spots suspicious behavior, catching new malware that signatures do not know.')

    # ------------------------------------------------------------------------------------------ 2.9 Attacks
    b.add('2.9', 'Vishing',
          'Voice phishing: an attacker phones a victim, often spoofing a trusted number, to trick them into revealing credentials, codes, or payment details.',
          'identify a phone call from someone claiming to be IT support who asks for the user\'s MFA code',
          ['Smishing', 'A phishing email', 'Pharming'],
          'It uses the phone VOICE — smishing is text messages, and phishing is email.',
          S.steps([('Caller', "spoofs 'IT help desk'"), ('Pretext', 'an urgent problem'), ('Victim', 'gives code or login')], title='Vishing', tones=['plain', 'amber', 'red']),
          caption='Vishing uses phone calls and spoofed numbers to extract credentials or payment details.')

    b.add('2.9', 'Smishing',
          'Phishing by SMS or messaging apps using urgent texts and malicious links, such as a fake delivery or bank alert.',
          'identify a text message claiming a package is on hold and linking to a fake login page',
          ['Vishing', 'Spear phishing', 'Whaling'],
          'It arrives as a TEXT message — vishing happens over a voice call.',
          S.facts([('Channel', 'SMS or a chat app'), ('Lure', 'delivery, bank, or toll alert'), ('Hook', 'a link to a fake page'), ('Defense', 'go to the real site yourself')], title='Smishing'),
          caption='Smishing sends urgent text messages with malicious links, such as fake delivery notices.')

    b.add('2.9', 'Whaling',
          'Phishing aimed at senior executives or other high-value targets, using personalized messages about legal, financial, or board matters.',
          'identify a targeted message impersonating legal counsel that is sent specifically to the CEO',
          ['Spear phishing', 'Vishing', 'Smishing'],
          'Whaling is spear phishing aimed at the BIG fish — executives and other high-value targets.',
          S.layers([('Phishing', 'wide net with a generic lure', 'plain'), ('Spear phishing', 'one person or group, personalized', 'amber'), ('Whaling', 'executives and high-value targets', 'red')], title='Scope of the target'),
          caption='Whaling targets executives with highly personalized phishing about business-critical matters.')

    b.add('2.9', 'QR code phishing (quishing)',
          'Phishing that hides a malicious URL inside a QR code on a flyer, email, or sticker, sending a scanning phone to a fake login or malware page.',
          'identify an attack in which a sticker over a parking meter\'s real QR code leads to a fake payment page',
          ['Smishing', 'An evil twin', 'Tailgating'],
          'The link hides in an IMAGE — filters that read URLs in text can miss it.',
          S.steps([('QR code', 'on a poster or email'), ('Phone scans it', 'URL is hard to preview'), ('Fake page', 'steals login or card')], title='Quishing', tones=['plain', 'amber', 'red']),
          caption='Quishing hides a malicious link in a QR code, which can slip past text-based link filters.')

    b.add('2.9', 'Impersonation',
          'Pretending to be a trusted person, such as IT staff, a vendor, or an executive, to gain access or information (pretexting).',
          'identify someone in a hi-vis vest and a badge claiming to be a contractor to get into a locked wiring closet',
          ['Shoulder surfing', 'Dumpster diving', 'Brute force'],
          'The attacker pretends to BE someone with authority — shoulder surfing and dumpster diving involve no false identity.',
          S.facts([('Pretext', "'I'm from IT' or 'the vendor'"), ('Goal', 'access, information, or money'), ('Tell', 'urgency and a bypassed process'), ('Defense', 'verify identity independently')], title='Impersonation'),
          caption='Impersonation uses a false identity of authority to gain access or information.')

    b.add('2.9', 'Dumpster diving',
          'Searching discarded trash or recycling for documents, drives, or notes that contain sensitive information; shredding and secure disposal prevent it.',
          'explain how an attacker learned employee names and account numbers without breaching any system',
          ['Shoulder surfing', 'Tailgating', 'Phishing'],
          'The trash is the target — shred documents and destroy media before disposal.',
          S.steps([('Discarded', 'papers, labels, drives'), ('Attacker digs', 'trash or recycling'), ('Finds data', 'names, accounts, notes')], title='Dumpster diving', tones=['plain', 'amber', 'red']),
          caption='Dumpster diving recovers sensitive information from discarded paper and media.')

    b.add('2.9', 'DoS and DDoS',
          'A denial-of-service attack overwhelms a system or network with traffic or requests so legitimate users cannot reach it; a distributed attack (DDoS) uses many compromised sources, often a botnet.',
          'explain why a company website became unreachable when thousands of sources flooded it with requests',
          ['An on-path attack', 'SQL injection', 'A brute-force attack'],
          'The goal is lost AVAILABILITY, not theft — DDoS only means the flood comes from many sources.',
          S.steps([('Botnet', 'many sources'), ('Flood of requests', 'saturates the target'), ('Users locked out', 'service unavailable')], title='DDoS', tones=['red', 'amber', 'plain']),
          caption='DoS attacks flood a target so legitimate users cannot reach it; DDoS uses many sources at once.')

    b.add('2.9', 'Zero-day exploit',
          'An attack that exploits a vulnerability unknown to the vendor, so no patch exists yet and signature-based defenses may not recognize it.',
          'identify an exploit used before the software vendor has released any fix',
          ['An unpatched known vulnerability', 'A brute-force attack', 'A phishing email'],
          'NO patch exists yet — an unpatched known flaw has a fix that simply was never applied.',
          S.steps([('Flaw found', 'vendor unaware'), ('Exploited', 'day zero'), ('Patch released', 'after the damage')], title='Zero-day timeline', tones=['amber', 'red', 'green']),
          caption='A zero-day exploit targets a flaw the vendor does not yet know, so no patch exists.')

    b.add('2.9', 'On-path attack',
          'An attacker secretly positions between two parties to read or alter their communication, for example through a rogue access point or ARP poisoning; formerly called man-in-the-middle.',
          'identify an attack in which traffic between a laptop and a bank is silently intercepted and relayed by a third party',
          ['A DDoS attack', 'A phishing email', 'A brute-force attack'],
          'The attacker sits BETWEEN both parties — HTTPS with valid certificates is the main defense.',
          S.steps([('Victim', 'thinks it talks to the bank'), ('Attacker', 'reads or alters traffic'), ('Bank', 'sees normal requests')], title='On-path attack', tones=['plain', 'red', 'plain']),
          caption='An on-path attacker silently relays and can alter traffic between two parties.')

    b.add('2.9', 'Dictionary attack',
          'A password attack that tries words from a list of common passwords and their variations instead of every possible combination, far faster than brute force against weak passwords.',
          'explain how an account was cracked by trying thousands of common passwords such as seasons plus a year',
          ['A brute-force attack', 'Credential stuffing', 'Phishing'],
          'It uses a WORD LIST of likely passwords — brute force tries every combination.',
          S.compare(('Dictionary', ['Common words and patterns', 'Fast against weak passwords', 'Beaten by long random ones']), ('Brute force', ['Every possible combination', 'Slow but exhaustive', 'Beaten by length + lockout']), title='Password guessing'),
          caption='A dictionary attack tries likely passwords from a list, which is quick against weak choices.')

    b.add('2.9', 'Insider threat',
          'A risk from someone with legitimate access, such as an employee or contractor, who deliberately or carelessly misuses it to steal data, sabotage systems, or cause a breach.',
          'identify the risk from a departing employee who copies customer files to a personal drive',
          ['An external hacker', 'A zero-day exploit', 'A phishing email'],
          'The person already has ACCESS — least privilege, monitoring, and prompt offboarding limit the damage.',
          S.steps([('Legitimate access', 'employee or contractor'), ('Misuse', 'theft or sabotage'), ('Controls', 'least privilege, logging')], title='Insider threat', tones=['plain', 'red', 'green']),
          caption='An insider threat comes from someone with legitimate access who misuses it.')

    b.add('2.9', 'SQL injection',
          'Entering malicious SQL through an input field or URL so the application\'s database runs it, exposing, altering, or deleting data; input validation and parameterized queries prevent it.',
          "identify an attack in which typing admin' -- into a login form signs in without a valid password",
          ['Cross-site scripting', 'A brute-force attack', 'A DDoS attack'],
          'It attacks the DATABASE through an input field — XSS targets other users\' browsers instead.',
          S.terminal(["user:  admin' --", "SELECT * FROM users WHERE name='admin' --' AND ...", '-- the comment drops the password check'], title='What the database sees'),
          caption='SQL injection slips database commands into an input field to bypass checks or read data.')

    b.add('2.9', 'Cross-site scripting (XSS)',
          'Injecting malicious script into a trusted website so it runs in other visitors\' browsers, stealing cookies or session tokens; output encoding and input validation prevent it.',
          'identify an attack in which a script saved in a comment runs in every visitor\'s browser',
          ['SQL injection', 'An on-path attack', 'A brute-force attack'],
          'The script runs in the VISITOR\'S browser — SQL injection targets the server\'s database.',
          S.steps([('Attacker', 'posts a script'), ('Site stores it', 'serves it to visitors'), ("Visitor's browser", 'runs it, cookie stolen')], title='Stored XSS', tones=['red', 'amber', 'plain']),
          caption='XSS plants script in a trusted page so it runs in other visitors\' browsers.')

    b.add('2.9', 'Business email compromise (BEC)',
          'Fraud in which an attacker impersonates or takes over a business email account, typically an executive or vendor, to trick staff into wiring money or changing payment details.',
          'identify a convincing email that appears to be from the CFO asking accounts payable to urgently change a vendor\'s bank details',
          ['Ransomware', 'A zero-day exploit', 'A DDoS attack'],
          'It is fraud by email IMPERSONATION, often with no malware — confirm payment changes through a second channel.',
          S.steps([('Spoof or takeover', 'executive or vendor'), ('Urgent request', 'wire money, new bank'), ('Verify', 'call a known number')], title='Business email compromise', tones=['red', 'amber', 'green']),
          caption='BEC uses impersonated or hijacked business email to trigger fraudulent payments.')

    b.add('2.9', 'Supply chain attack',
          'Compromising a trusted vendor, software update, or component so malicious code reaches many downstream customers, bypassing defenses that trust the supplier.',
          'identify an attack in which a legitimately signed software update from a vendor contained malware',
          ['Phishing', 'A brute-force attack', 'An evil twin'],
          'It attacks the TRUSTED supplier — customers receive the threat through a channel they believe is safe.',
          S.steps([('Vendor breached', 'build or update server'), ('Tainted update', 'signed and trusted'), ('Customers infected', 'at scale')], title='Supply chain attack', tones=['red', 'amber', 'plain']),
          caption='A supply chain attack hides malicious code in a trusted vendor\'s product or update.')

    b.add('2.9', 'Unpatched and end-of-life systems',
          'Systems missing security patches, or running unsupported software, contain known flaws that attackers actively exploit; patching and replacement close them.',
          'explain why a server still running an unsupported OS keeps appearing in vulnerability scans',
          ['A zero-day exploit', 'An insider threat', 'Spoofing'],
          'Known flaws left OPEN — a zero-day has no fix yet, but an unpatched system had one available.',
          S.steps([('Flaw disclosed', 'patch released'), ('Not applied', 'system stays exposed'), ('Exploited', 'by automated scans')], title='Why patching matters', tones=['blue', 'amber', 'red']),
          caption='Unpatched or unsupported systems keep known flaws open for attackers to exploit.')

    # ------------------------------------------------------------------------------------------ 2.10 Windows security
    b.add('2.10', 'User Account Control (UAC)',
          'A prompt that asks for confirmation or administrator credentials before an action needs elevated rights, limiting what malware or a mistaken click can change.',
          'have Windows ask for approval before a program makes system-wide changes during a standard sign-in',
          ['Windows Defender Firewall', 'BitLocker', 'Secure Boot'],
          'It asks BEFORE elevation — it does not scan for malware, but it stops silent system changes.',
          S.steps([('App needs admin', 'install or change system'), ('UAC prompt', 'dims the desktop'), ('Allow or deny', 'credentials if standard')], title='User Account Control', tones=['plain', 'amber', 'green']),
          caption='UAC asks for approval or admin credentials before anything changes the system.')

    b.add('2.10', 'Standard vs administrator accounts',
          'Standard users can run apps and change their own settings but cannot install system-wide software or change security settings; administrators can; Guest has minimal rights and should stay disabled.',
          'give an employee a daily-use account that cannot install software or change system settings',
          ['The Administrator account', 'The Guest account', 'The Power Users group'],
          'Daily work belongs in a STANDARD account — admin accounts are for admin tasks (least privilege).',
          S.table(['Account', 'Install software', 'Change security'], [('Administrator', 'yes', 'yes'), ('Standard user', 'needs admin approval', 'no'), ('Guest', 'no', 'no')], title='Windows account types', col_widths=[0.3, 0.4, 0.3]),
          caption='Standard accounts limit what a user or malware can change; administrator accounts should be used sparingly.')

    b.add('2.10', 'Run as administrator',
          'Starting a program with elevated rights for one task, with right-click and Run as administrator or the runas command, instead of staying signed in as an administrator.',
          'launch Command Prompt with the rights needed to run sfc /scannow from a standard session',
          ['Safe Mode', 'Compatibility mode', 'Remote Assistance'],
          'It elevates for ONE task — that is how least privilege works in practice.',
          S.steps([('Right-click', 'Run as administrator'), ('UAC prompt', 'approve or enter creds'), ('Elevated window', "title shows 'Administrator'")], title='Elevating a single program', tones=['plain', 'amber', 'green']),
          caption='Run as administrator raises one program\'s rights without keeping the whole session elevated.')

    b.add('2.10', 'NTFS permission inheritance',
          'Files and folders inherit permissions from their parent; moving within the same volume keeps the original permissions, while copying (or moving to another volume) takes the destination folder\'s.',
          'explain why a file copied into a restricted folder now carries that folder\'s permissions',
          ['Share permissions', 'An explicit deny', 'EFS'],
          'A COPY (or a move across volumes) takes the destination\'s permissions — a move within one volume keeps its own.',
          S.table(['Action', 'Permissions afterwards'], [('Copy anywhere', "take the destination's"), ('Move to another volume', "take the destination's"), ('Move within one volume', 'keep the original ones')], title='Inheritance on copy and move', col_widths=[0.45, 0.55]),
          caption='Copying takes on the destination\'s permissions; a same-volume move keeps the originals.')

    b.add('2.10', 'Share and NTFS permissions combined',
          'Share permissions apply only over the network, while NTFS permissions apply locally and over the network; when both apply, the most restrictive result wins.',
          'work out why a user with Full Control at the share still cannot modify files in it',
          ['Share permissions override NTFS', 'Permission inheritance', 'A firewall rule'],
          'The MOST RESTRICTIVE of share and NTFS wins — fixing only one side is not enough.',
          S.steps([('Share permission', 'Full Control'), ('NTFS permission', 'Read only'), ('Effective access', 'Read: most restrictive')], title='Combining the two', tones=['blue', 'amber', 'red']),
          caption='When share and NTFS permissions both apply, the most restrictive one decides the effective access.')

    b.add('2.10', 'BitLocker To Go',
          'Encryption for removable drives such as USB flash drives and external disks that requires a password or smart card to open them, protecting the data if the drive is lost.',
          'protect the data on a USB drive so it is unreadable if the drive is lost',
          ['BitLocker on the system drive only', 'EFS', 'FileVault'],
          'It is for REMOVABLE drives — FileVault is the Mac equivalent, and EFS encrypts individual files.',
          S.steps([('Insert USB drive', 'turn on BitLocker To Go'), ('Set a password', 'or use a smart card'), ('Drive encrypted', 'unlock to read')], title='BitLocker To Go', tones=['plain', 'blue', 'green']),
          caption='BitLocker To Go encrypts removable drives so a lost USB stick does not expose its contents.')

    b.add('2.10', 'Encrypting File System (EFS)',
          'Encrypts individual files or folders on NTFS using a key tied to the user\'s certificate; other users, even administrators, cannot read them without it, so the certificate must be backed up.',
          'encrypt just one folder so that only a specific user account can open its files',
          ['BitLocker', 'FileVault', 'NTFS permissions'],
          'Per-FILE encryption tied to a user certificate — BitLocker encrypts a whole volume.',
          S.compare(('BitLocker', ['Whole volume', 'Protects the OS drive too', 'TPM or password']), ('EFS', ['Files and folders', 'Tied to a user certificate', 'Back up the certificate']), title='BitLocker vs EFS'),
          caption='EFS encrypts selected files for one user\'s certificate; BitLocker encrypts the whole volume.')

    b.add('2.10', 'Windows Hello',
          'Windows sign-in with a PIN, fingerprint, or face recognition that is tied to the device, with the credential protected by the TPM, instead of a typed account password.',
          'let users sign in with a fingerprint or a short device-bound PIN',
          ['Windows Defender Firewall', 'Credential Manager', 'Kerberos'],
          'A local, device-bound PIN or biometric — the PIN is useless on any other computer.',
          S.facts([('PIN', 'bound to this device only'), ('Fingerprint', 'needs a reader'), ('Face', 'needs an infrared camera'), ('Backed by', 'the device TPM')], title='Windows Hello'),
          caption='Windows Hello signs in with a device-bound PIN or biometric protected by the TPM.')

    b.add('2.10', 'Microsoft Defender Antivirus',
          'Windows\' built-in antivirus and antimalware, with real-time protection, cloud-delivered protection, and scheduled scans, managed in the Windows Security app.',
          'confirm that real-time protection is on and run a full scan using only built-in Windows tools',
          ['Windows Defender Firewall', 'BitLocker', 'User Account Control'],
          'It scans for MALWARE — the firewall filters traffic, and BitLocker encrypts data.',
          S.hub(('Windows Security app', 'built-in protection'), [('Virus and threats', 'Defender Antivirus'), ('Firewall', 'network profiles'), ('Device security', 'Secure Boot, TPM')]),
          caption='Microsoft Defender Antivirus is Windows\' built-in real-time malware protection.')

    # ------------------------------------------------------------------------------------------ 2.11 SOHO
    b.add('2.11', 'Change default router credentials',
          'Replacing the router\'s default administrator username and password, and its default network name, with unique strong values so attackers cannot log in with published defaults.',
          'secure a new home router out of the box before connecting any devices',
          ['Enabling WPS', 'Port forwarding', 'Leaving UPnP on'],
          'Defaults are PUBLISHED online — changing them is the first step on any new router.',
          S.compare(('Out of the box', ['admin / admin', 'Default SSID names the model', 'Anyone can guess it']), ('After hardening', ['Unique admin password', 'Custom SSID', 'WPA2 or WPA3 passphrase']), title='Router defaults', tones=('red', 'green')),
          caption='Change the router\'s default login and network name before putting it into service.')

    b.add('2.11', 'Router firmware updates',
          'Installing vendor firmware updates closes security flaws and fixes bugs in the router itself; many consumer routers do not update automatically.',
          'close known vulnerabilities in a small office router',
          ['Changing the SSID', 'Enabling MAC filtering', 'Moving the router'],
          'It patches the router\'s own SOFTWARE — SSID or MAC tweaks cannot fix a firmware flaw.',
          S.steps([('Check vendor', 'for new firmware'), ('Back up config', 'before updating'), ('Install and reboot', 'verify settings')], title='Updating router firmware', tones=['plain', 'amber', 'green']),
          caption='Firmware updates patch security flaws in the router itself.')

    b.add('2.11', 'MAC filtering',
          'Allowing or blocking devices by their MAC address on the router; simple to set up but weak, because MAC addresses can be sniffed and spoofed.',
          'limit a small network to a known list of devices while accepting that it is not strong security',
          ['WPA3', 'Disabling SSID broadcast', 'A screened subnet'],
          'A speed bump, not real security — MAC addresses can be spoofed.',
          S.steps([('Device joins', 'sends its MAC'), ('Router checks', 'the allow list'), ('Allowed or blocked', 'MACs can be spoofed')], title='MAC filtering', tones=['plain', 'blue', 'amber']),
          caption='MAC filtering allows only listed devices but is easy to bypass by spoofing an address.')

    b.add('2.11', 'Disabling SSID broadcast',
          'Hiding the network name keeps it from appearing in Wi-Fi lists but does not stop discovery with simple tools; strong encryption matters far more.',
          'reduce casual visibility of a network name while knowing it is not real protection',
          ['WPA3 encryption', 'MAC filtering', 'Changing the router password'],
          'It hides the NAME only — a sniffer still sees it, so encryption is what actually protects.',
          S.compare(('SSID hidden', ['Not shown in Wi-Fi lists', 'Still visible to sniffers', 'Not a real control']), ('Encryption on', ['Traffic is protected', 'Passphrase required', 'The real protection']), title='Hiding vs encrypting', tones=('amber', 'green')),
          caption='Hiding the SSID only removes it from lists; encryption is what protects the network.')

    b.add('2.11', 'Port forwarding',
          'A router rule that sends traffic arriving on a specific external port to a chosen internal host and port, making an internal service reachable from the Internet at the cost of more exposure.',
          'let outside users reach a web server at 192.168.1.50 through the router\'s single public IP address',
          ['A DHCP reservation', 'MAC filtering', 'Content filtering'],
          'It maps an outside PORT to an inside host — every rule is an opening in the firewall.',
          S.steps([('Internet', 'TCP 443 to public IP'), ('Router', 'forwards 443 to .50'), ('Web server', '192.168.1.50')], title='Port forwarding', tones=['plain', 'amber', 'green']),
          caption='Port forwarding sends traffic arriving on a router port to a specific internal host.')

    b.add('2.11', 'UPnP risk',
          'Universal Plug and Play lets devices open router ports automatically; convenient, but compromised devices or malware can expose internal systems, so it is usually disabled.',
          'stop devices on the network from automatically creating port-forward rules on the router',
          ['Manual port forwarding', 'DHCP', 'Network address translation'],
          'It lets DEVICES open ports automatically — manual port forwarding is a deliberate admin choice.',
          S.compare(('UPnP on', ['Devices open ports themselves', 'Malware can use it too', 'Hard to audit']), ('UPnP off', ['Admin opens ports by hand', 'Each rule is deliberate', 'Smaller attack surface']), title='UPnP', tones=('red', 'green')),
          caption='UPnP lets devices open router ports on their own, so it is usually turned off.')

    b.add('2.11', 'DHCP reservation',
          'Tying a specific IP address to a device\'s MAC address in the DHCP server, so it always receives the same address while still being configured centrally.',
          'make a network printer always receive the same address without configuring it by hand',
          ['A static IP set on the device', 'APIPA', 'Port forwarding'],
          'The server hands out a FIXED address — a static IP is typed on the device itself.',
          S.facts([('MAC address', 'AA:BB:CC:11:22:33'), ('Reserved IP', '192.168.1.20'), ('Result', 'same address on every lease')], title='A DHCP reservation'),
          caption='A DHCP reservation always gives one device the same address from the DHCP server.')

    b.add('2.11', 'Content filtering',
          'Blocking categories of websites or specific domains at the router, a DNS service, or a proxy to enforce policy and reduce exposure to malicious or inappropriate content.',
          'block known malicious and adult website categories for every device on a small office network',
          ['MAC filtering', 'Port forwarding', 'QoS'],
          'It filters WEB CONTENT by category or domain — MAC filtering controls devices, not sites.',
          S.steps([('Client', 'requests a site'), ('Filter', 'category and reputation'), ('Allow or block', 'policy decides')], title='Content filtering', tones=['plain', 'amber', 'green']),
          caption='Content filtering blocks websites by category or domain according to policy.')

    b.add('2.11', 'Screened subnet (DMZ)',
          'A separate network segment, isolated from the internal LAN by firewalls, that hosts public-facing servers so that compromising one does not give direct access to internal systems.',
          'host a public web server without placing it on the same network as internal workstations',
          ['A VPN', 'Port forwarding to a LAN host', 'MAC filtering'],
          'Public servers go in an ISOLATED middle zone — forwarding straight to a LAN host exposes the internal network if it is compromised.',
          S.steps([('Internet', 'untrusted'), ('Screened subnet', 'public web server'), ('Internal LAN', 'protected')], title='Screened subnet', tones=['red', 'amber', 'green']),
          caption='A screened subnet isolates public-facing servers between the Internet and the internal network.')

    b.add('2.11', 'Guest network',
          'A separate wireless network with isolation from the main LAN that gives visitors Internet access without letting them reach internal devices.',
          'let visitors use the Wi-Fi without exposing the office file server',
          ['Disabling SSID broadcast', 'MAC filtering', 'Port forwarding'],
          'An ISOLATED SSID for visitors — hiding the main name does nothing to separate guests from internal devices.',
          S.compare(('Main network', ['Staff devices and servers', 'Strong passphrase', 'Internal access']), ('Guest network', ['Visitors only', 'Isolated from the LAN', 'Internet access only']), title='Separate networks', tones=('blue', 'green')),
          caption='A guest network gives visitors Internet access while keeping them off the internal LAN.')

    # ------------------------------------------------------------------------------------------ 2.12 Browser security
    b.add('2.12', 'Trusted downloads and hash verification',
          'Installing software only from official sources and comparing the file\'s checksum (hash) with the vendor\'s published value confirms the download was not altered.',
          'confirm that a downloaded installer matches what the vendor published',
          ['Running it and scanning afterward', 'Checking the file size', 'Renaming the file'],
          'Compare the HASH with the published value — file size and names are easy to fake.',
          S.steps([('Download', 'official site only'), ('Hash the file', 'for example SHA-256'), ('Compare', 'with the published hash')], title='Verifying a download', tones=['plain', 'blue', 'green']),
          caption='Comparing a download\'s hash with the vendor\'s published value proves it was not altered.')

    b.add('2.12', 'Browser extensions',
          'Add-ons that extend a browser; each requests permissions and can read or change page data, so only needed extensions from trusted publishers should be installed and reviewed.',
          'reduce the risk from a malicious add-on that can read every website a user visits',
          ['Clearing the cache', 'Private browsing', 'Disabling pop-ups'],
          'Extensions run with PAGE ACCESS — private browsing and cache clearing do not limit them.',
          S.facts([('Permissions', 'can read and change site data'), ('Source', 'official store, known publisher'), ('Review', 'remove ones nobody uses'), ('Managed', 'admins can allow-list')], title='Browser extensions'),
          caption='Extensions have broad page access, so install few, from trusted publishers, and review them.')

    b.add('2.12', 'Browser password manager',
          'A password manager stores unique passwords in an encrypted vault and autofills them only on matching sites, reducing reuse and helping reveal look-alike phishing pages that will not autofill.',
          'let users keep a different strong password for every site without memorizing them',
          ['A shared spreadsheet', 'The same password everywhere', 'Browser history'],
          'It will not AUTOFILL on a look-alike domain — a handy phishing tell.',
          S.steps([('Master password', 'unlocks the vault'), ('Autofills', 'only on the right domain'), ('Fake site', 'nothing fills in')], title='Password manager', tones=['plain', 'green', 'amber']),
          caption='A password manager fills unique passwords only on the genuine site, which also exposes phishing pages.')

    b.add('2.12', 'HTTPS and valid certificates',
          'A padlock/HTTPS connection means traffic is encrypted and the site presented a valid certificate for its domain from a trusted authority; warnings signal expired, mismatched, or untrusted certificates.',
          'ensure traffic to a website is encrypted and the site\'s domain identity was verified',
          ['Plain HTTP', 'A pop-up blocker', 'Private browsing'],
          'It encrypts AND verifies the domain — a padlock alone does not prove the site is honest.',
          S.facts([('HTTPS', 'TLS encrypts the traffic'), ('Certificate', 'proves the domain\'s identity'), ('Issued by', 'a trusted authority'), ('Warning', 'expired, mismatched, untrusted')], title='What the padlock means'),
          caption='HTTPS encrypts traffic and a valid certificate verifies the domain; warnings mean something is wrong.')

    b.add('2.12', 'Pop-up and ad blockers',
          'Blocking pop-up windows and ads reduces exposure to malvertising, fake alerts, and unwanted redirects.',
          'reduce fake virus-alert pop-ups and malicious ads in a user\'s browser',
          ['Private browsing', 'Clearing cookies', 'A password manager'],
          'It blocks the DELIVERY of pop-ups and ads — private browsing blocks nothing.',
          S.compare(('Without a blocker', ['Fake alert pop-ups', 'Malvertising redirects']), ('With a blocker', ['Pop-ups suppressed', 'Known ad domains blocked']), title='Pop-up and ad blocking', tones=('red', 'green')),
          caption='Pop-up and ad blockers stop fake alerts and malicious ads from reaching the user.')

    b.add('2.12', 'Private browsing',
          'A mode that does not save history, cookies, or form data when the window closes, but does not hide activity from the websites visited, the network, or an employer, and adds no malware protection.',
          'use a shared kiosk PC without leaving the user\'s history and logins behind on it',
          ['A VPN', 'A pop-up blocker', 'Clearing the DNS cache'],
          'It forgets LOCAL history — it does not hide you from the site, your ISP, or your employer.',
          S.compare(('Hidden from', ['The next person at this PC', 'Local history and cookies']), ('Not hidden from', ['Websites you visit', 'ISP and employer network']), title='What private browsing does', tones=('green', 'red')),
          caption='Private browsing leaves no local history, but does not make activity invisible on the network.')

    b.add('2.12', 'Clearing cache and cookies',
          'Deleting cached files, cookies, and saved site data forces fresh page loads and removes stale or corrupted content, which often fixes display or sign-in problems on one site.',
          'fix a website that keeps showing an old, broken version of its page',
          ['Resetting the router', 'Updating the BIOS', 'Reinstalling Windows'],
          'Stale CACHE or cookies cause site-specific glitches — try this before anything bigger.',
          S.steps([('Stale cache', 'old files served'), ('Clear data', 'cache and cookies'), ('Fresh load', 'the site works')], title='Clearing browsing data', tones=['amber', 'blue', 'green']),
          caption='Clearing the cache and cookies removes stale data that causes one-site display or login problems.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Wireless security and authentication', ['2.7'],
              'WEP and WPA with TKIP are RC4-based and weak; WPA2 with AES-CCMP is the long-standing solid choice, and WPA3 adds SAE, a handshake that resists offline guessing of a captured passphrase. Personal mode shares one passphrase, while Enterprise mode uses 802.1X so each user or device authenticates individually to a RADIUS server.\n\n'
              'Know which protocol serves which job: TACACS+ authorizes administrators on network devices command by command (TCP 49), RADIUS handles user network access (UDP 1812/1813), and Kerberos issues time-limited tickets in Active Directory and therefore depends on synchronized clocks. For second factors, authenticator apps beat SMS codes, and hardware security keys are the strongest option against phishing.')
    b.section('Malware types and prevention', ['2.8'],
              'A trojan is disguised as useful software and needs the user to run it; a virus attaches to a host file and needs user action to spread; a worm replicates itself across networks through vulnerabilities. Spyware watches and reports, a keylogger records keystrokes, a cryptominer steals processor cycles (constant 100% CPU at idle is the clue), a boot sector virus loads before the OS, and a botnet is a group of infected machines controlled remotely.\n\n'
              'Defenses combine technology and people: signature detection catches known samples, heuristic and behavioral detection catches new variants, and security awareness training reduces the number of convincing phishing emails that get clicked.')
    b.section('Social engineering, attacks, and vulnerabilities', ['2.9'],
              'Phishing has many delivery channels: vishing by voice, smishing by text, QR-code phishing hidden in an image, spear phishing aimed at a person or group, and whaling aimed at executives. Impersonation and dumpster diving need no technology at all, and business email compromise tricks staff into payments by impersonating a trusted sender.\n\n'
              'On the technical side, DoS and DDoS attacks target availability, on-path attacks sit between two parties, a dictionary attack tries a word list while brute force tries every combination, SQL injection targets the database and XSS targets other users\' browsers. A zero-day has no patch yet, while an unpatched or end-of-life system is a known flaw left open, and insider and supply chain threats come through trusted access.')
    b.section('Windows security settings', ['2.10'],
              'User Account Control prompts before elevated actions, and everyday work belongs in a standard account while administrator accounts are used only when needed (run as administrator elevates one task). Windows Hello signs in with a device-bound PIN or biometric, and Microsoft Defender Antivirus provides built-in real-time malware protection in the Windows Security app.\n\n'
              'NTFS permissions are inherited from the parent: copying takes the destination\'s permissions, and a same-volume move keeps the original ones. When share and NTFS permissions both apply, the most restrictive result wins. For encryption, BitLocker covers whole volumes, BitLocker To Go covers removable drives, and EFS encrypts individual files tied to a user certificate.')
    b.section('SOHO network security', ['2.11'],
              'Start a new router by changing its default administrator credentials and network name, installing firmware updates, and using WPA2 or WPA3. MAC filtering and hiding the SSID are speed bumps rather than real protection, and port forwarding and UPnP open paths in from the Internet, so keep them deliberate or off.\n\n'
              'A DHCP reservation gives a device the same address from the server, content filtering blocks websites by category, a guest network keeps visitors away from internal devices, and a screened subnet (DMZ) isolates public servers from the internal LAN.')
    b.section('Browser security', ['2.12'],
              'Download software only from official sources and verify the published hash. Keep extensions to a minimum because they run with page access, use a password manager (it will not autofill on a look-alike domain), and block pop-ups and ads to cut down on fake alerts and malvertising.\n\n'
              'HTTPS means the traffic is encrypted and the certificate verifies the domain, but it does not prove the site is trustworthy. Private browsing only forgets local history, and clearing cache and cookies is a quick first fix for one site that misbehaves.')
