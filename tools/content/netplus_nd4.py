"""Network+ (N10-009), domain nd4 (Network Security): concepts, attacks, and defenses."""
import svg as S

DOMAIN = 'nd4'


def build(b):
    b.topics['4.1'] = ['CIA triad', 'AAA', 'Defense in depth', 'Zero trust', 'Least privilege', 'Encryption', 'PKI', 'RBAC', 'Segmentation']
    b.topics['4.2'] = ['DoS/DDoS', 'On-path attack', 'VLAN hopping', 'Rogue DHCP', 'ARP spoofing', 'Social engineering', 'MAC flooding', 'DNS poisoning', 'Evil twin']
    b.topics['4.3'] = ['ACLs', 'NAC', 'DMZ', 'Honeypot', '802.1X', 'MFA', 'VPN', 'Hardening', 'DHCP snooping', 'Implicit deny']

    # ------------------------------------------------------------------------------------------ 4.1
    b.add('4.1', 'Encryption in transit',
          'Protecting data while it moves across a network, using protocols such as TLS (HTTPS), IPsec, and SSH so that anyone capturing the traffic sees only ciphertext.',
          'protect customer data as it crosses the Internet between a browser and a web server',
          ['Encryption at rest', 'Disk-level encryption', 'Hashing the stored files'],
          'Protects data MOVING across the network — encryption at rest protects data stored on a disk.',
          S.compare(('In transit', ['TLS, IPsec, SSH', 'Data moving on the wire', 'Stops eavesdropping']), ('At rest', ['Disk and file encryption', 'Data stored on media', 'Stops theft of the device']), title='Where data is protected'),
          caption='Encryption in transit protects data crossing a network using TLS, IPsec, or SSH.')

    b.add('4.1', 'Encryption at rest',
          'Protecting stored data by encrypting disks, files, or databases (for example with AES), so a stolen drive or backup cannot be read without the key.',
          'make sure data on a stolen laptop or backup drive cannot be read',
          ['Encryption in transit', 'A VPN tunnel', 'TLS on the web server'],
          'Protects data STORED on media — encryption in transit protects data on the wire.',
          S.steps([('Data written', 'to disk or backup'), ('Encrypted with a key', 'for example AES'), ('Stolen media', 'unreadable without the key')], title='Encryption at rest', tones=['plain', 'blue', 'green']),
          caption='Encryption at rest keeps stored data unreadable without the key if media is stolen.')

    b.add('4.1', 'Public key infrastructure (PKI)',
          'The system of certificate authorities, digital certificates, and policies that binds public keys to identities, so clients can trust that a server\'s public key really belongs to it; certificates can be revoked through CRLs or OCSP.',
          'establish trust that a web server\'s public key really belongs to that server by relying on a trusted authority',
          ['A pre-shared key', 'A hashing algorithm', 'A VPN concentrator'],
          'A trusted AUTHORITY signs certificates that bind keys to identities — a pre-shared key needs no authority but does not scale.',
          S.steps([('Server asks CA', 'for a certificate'), ('CA signs it', 'binds key to identity'), ('Client trusts the CA', 'so trusts the server')], title='PKI trust', tones=['plain', 'primary', 'green']),
          caption='PKI uses certificate authorities and certificates to bind public keys to identities.')

    b.add('4.1', 'Role-based access control (RBAC)',
          'An access model in which permissions are assigned to roles, such as network operator or auditor, and users receive access by being assigned a role, which simplifies administration and supports least privilege.',
          'give every network engineer the same set of device permissions by assigning them to a role instead of setting rights one by one',
          ['Discretionary access control (DAC)', 'Mandatory access control (MAC)', 'A single shared administrator account'],
          'Permissions attach to ROLES and users get roles — change the role and every member follows.',
          S.steps([('Role defined', 'permissions attached'), ('Users assigned', 'engineer, auditor, operator'), ('Access follows', 'role changes apply')], title='RBAC', tones=['blue', 'plain', 'green']),
          caption='RBAC grants permissions through roles that users are assigned to.')

    b.add('4.1', 'Posture assessment',
          'Checking an endpoint\'s security state, such as OS patches, antivirus status, and required settings, before granting network access; non-compliant devices are quarantined or sent for remediation, often by network access control.',
          'let a laptop onto the network only after confirming its patches and antivirus are up to date',
          ['MAC filtering', 'A honeypot', 'Port mirroring'],
          'Checks the device\'s HEALTH before access — authentication only proves who is connecting.',
          S.steps([('Device connects', 'posture check starts'), ('Compliant?', 'patches, antivirus'), ('Allow or quarantine', 'remediate if failing')], title='Posture assessment', tones=['plain', 'blue', 'amber']),
          caption='Posture assessment checks a device\'s security state before it is allowed on the network.')

    b.add('4.1', 'Regulatory compliance and data sovereignty',
          'Legal and industry rules such as GDPR, HIPAA, and PCI DSS dictate how data must be protected, retained, and where it may be stored; data sovereignty requires data to remain within certain jurisdictions, which affects cloud region choices.',
          'keep customer data in a specific country\'s region of a cloud provider to satisfy a legal requirement',
          ['Encryption in transit', 'Network segmentation', 'Elasticity'],
          'LAW decides where data may live — choose the cloud REGION to satisfy data sovereignty.',
          S.table(['Rule', 'Protects'], [('PCI DSS', 'payment card data'), ('HIPAA', 'health information'), ('GDPR', 'EU personal data'), ('Data sovereignty', 'where data may be stored')], title='Compliance drivers', col_widths=[0.4, 0.6]),
          caption='Compliance rules and data sovereignty dictate how and where data must be protected and stored.')

    b.add('4.1', 'Network segmentation',
          'Dividing a network into separate zones with VLANs, subnets, firewalls, or microsegmentation, so a compromise is contained and different trust levels can have different policies.',
          'limit how far malware could spread by isolating payment systems from the rest of the network',
          ['Network address translation', 'Link aggregation', 'Port mirroring'],
          'Separate ZONES contain a breach — it is the practical form of defense in depth.',
          S.hub(('Segmented network', 'enforced by firewalls and ACLs'), [('User VLAN', 'workstations'), ('Server VLAN', 'internal services'), ('Payment zone', 'strictest rules')]),
          caption='Segmentation splits the network into zones so a breach stays contained.')

    # ------------------------------------------------------------------------------------------ 4.2
    b.add('4.2', 'MAC flooding',
          'An attack that floods a switch with frames carrying many fake source MAC addresses to overflow its MAC address table, so the switch fails open and floods traffic out of all ports where an attacker can capture it; port security mitigates it.',
          'identify the attack that overflows a switch\'s MAC table so it starts flooding traffic like a hub',
          ['ARP spoofing', 'VLAN hopping', 'DNS poisoning'],
          'It overflows the MAC TABLE — port security limiting MACs per port is the defense.',
          S.steps([('Attacker sends', 'thousands of fake MACs'), ('MAC table full', 'switch fails open'), ('Traffic flooded', 'attacker can capture it')], title='MAC flooding', tones=['red', 'amber', 'red']),
          caption='MAC flooding overflows a switch\'s address table so it floods traffic out all ports.')

    b.add('4.2', 'DNS poisoning',
          'Corrupting a DNS resolver\'s cache or a client\'s DNS data with false records so users are directed to attacker-controlled addresses; DNSSEC and secure resolvers defend against it.',
          'identify the attack in which a resolver caches a forged answer and sends users to a malicious site for a legitimate name',
          ['ARP spoofing', 'MAC flooding', 'VLAN hopping'],
          'Forged DNS ANSWERS cached by a resolver — ARP spoofing forges Layer 2 mappings instead.',
          S.steps([('Attacker forges answer', 'for bank.example.com'), ('Resolver caches it', 'poisoned record'), ('Users redirected', 'to the attacker\'s server')], title='DNS poisoning', tones=['red', 'amber', 'red']),
          caption='DNS poisoning plants false records in a resolver\'s cache to redirect users.')

    b.add('4.2', 'Evil twin',
          'A rogue wireless access point that copies a legitimate SSID, and often boosts its signal, so clients connect to it and the attacker can intercept their traffic.',
          'identify an attack in which a fake access point broadcasts the coffee shop\'s Wi-Fi name to capture customers\' traffic',
          ['A rogue access point added by an employee', 'A deauthentication attack', 'MAC flooding'],
          'It IMPERSONATES a real SSID to trap clients — a rogue AP is simply an unauthorized one on your network.',
          S.compare(('Evil twin', ['Copies a real SSID', 'Malicious intent', 'Intercepts client traffic']), ('Rogue AP', ['Unauthorized AP on your LAN', 'Often well meant', 'Opens a backdoor']), title='Evil twin vs rogue AP'),
          caption='An evil twin is a malicious access point that imitates a legitimate SSID.')

    b.add('4.2', 'Rogue access point',
          'An unauthorized access point connected to the wired network, often by an employee for convenience, which bypasses security controls and creates an unmonitored way in.',
          'find an unmanaged wireless access point that an employee plugged into a wall jack',
          ['An evil twin', 'A honeypot', 'A wireless repeater approved by IT'],
          'An unauthorized AP on YOUR network — wireless intrusion detection and 802.1X port control find and block it.',
          S.steps([('Employee adds AP', 'for convenience'), ('Unmanaged access', 'bypasses controls'), ('Detected and removed', 'WIPS and port control')], title='Rogue access point', tones=['amber', 'red', 'green']),
          caption='A rogue AP is an unauthorized access point attached to the network, bypassing security.')

    b.add('4.2', 'Ransomware',
          'Malware that encrypts a victim\'s files or systems and demands payment for the key, spreading across file shares and networks; offline backups, segmentation, and patching limit its impact.',
          'identify malware that encrypts shared files across the network and displays a payment demand',
          ['A worm', 'Spyware', 'A rootkit'],
          'It ENCRYPTS data and demands payment — tested, offline backups are the real recovery plan.',
          S.steps([('Infection', 'phishing or an exploit'), ('Files encrypted', 'local drives and shares'), ('Ransom demanded', 'restore from clean backups')], title='Ransomware', tones=['amber', 'red', 'green']),
          caption='Ransomware encrypts files and demands payment; offline backups and segmentation limit the damage.')

    b.add('4.2', 'Deauthentication attack',
          'A wireless attack that sends forged management frames to disconnect clients from an access point, used to cause denial of service or to force reconnections that expose a handshake; 802.11w management frame protection mitigates it.',
          'identify the Wi-Fi attack that repeatedly knocks clients off an access point with forged management frames',
          ['An evil twin', 'MAC flooding', 'DNS poisoning'],
          'FORGED disconnect frames — protected management frames (802.11w) are the countermeasure.',
          S.steps([('Attacker spoofs', 'deauthentication frames'), ('Clients disconnected', 'from the access point'), ('Defense', '802.11w management')], title='Deauthentication attack', tones=['red', 'amber', 'green']),
          caption='A deauthentication attack disconnects Wi-Fi clients with forged management frames.')

    # ------------------------------------------------------------------------------------------ 4.3
    b.add('4.3', 'Device hardening',
          'Reducing a device\'s attack surface by changing default credentials, disabling unused ports and services (such as Telnet and HTTP), applying firmware updates, restricting management access, and enabling logging.',
          'secure a new switch before deployment by removing defaults and unneeded services',
          ['Leaving default credentials in place', 'Enabling every service for convenience', 'Using Telnet for management'],
          'Change DEFAULTS, close unused ports and services, patch, and restrict management access.',
          S.table(['Hardening step', 'Why'], [('Change default passwords', 'well-known credentials'), ('Disable unused ports', 'no unauthorized plug-ins'), ('Disable Telnet and HTTP', 'clear-text management'), ('Update firmware', 'known vulnerabilities')], title='Hardening a device', col_widths=[0.5, 0.5]),
          caption='Hardening removes defaults and unneeded services and applies updates to shrink the attack surface.')

    b.add('4.3', 'MAC filtering',
          'Allowing or blocking devices by MAC address on a switch port or access point; it is simple to configure but weak security because MAC addresses can be sniffed and spoofed.',
          'limit a small network to a known list of devices while recognizing it is only a weak control',
          ['802.1X port-based authentication', 'WPA3', 'A DMZ'],
          'A speed bump only — MAC addresses can be spoofed, so 802.1X is the stronger control.',
          S.compare(('MAC filtering', ['Allow list of MAC addresses', 'Easy to spoof', 'Weak on its own']), ('802.1X', ['Authenticates the user or device', 'Credentials or certificates', 'Strong port control']), title='Admission controls'),
          caption='MAC filtering is a weak control because addresses can be spoofed.')

    b.add('4.3', 'URL and content filtering',
          'Blocking websites by category, reputation, or specific URL at a firewall, proxy, or DNS filter to enforce acceptable use and reduce exposure to malicious or inappropriate content.',
          'block malicious and adult website categories for every user without maintaining a list on each computer',
          ['MAC filtering', 'Port security', 'Implicit deny'],
          'Filters by WEB CATEGORY or URL — MAC filtering and port security control devices, not sites.',
          S.steps([('User requests a site', 'through the filter'), ('Category checked', 'against policy'), ('Allowed or blocked', 'logged either way')], title='Content filtering', tones=['plain', 'amber', 'green']),
          caption='URL and content filtering blocks sites by category or reputation according to policy.')

    b.add('4.3', 'Implicit deny',
          'The final, unwritten rule in an ACL or firewall policy that drops any traffic not explicitly permitted by an earlier rule; rules are evaluated top-down and the first match wins.',
          'explain why traffic that matches no permit rule is dropped even though no deny rule was written',
          ['An explicit allow rule', 'Stateful inspection', 'A default route'],
          'Anything NOT permitted is denied — and rule ORDER matters because the first match wins.',
          S.steps([('Rule 1: permit HTTPS', 'matched, allowed'), ('Rules continue', 'first match wins'), ('No match at all', 'implicit deny drops it')], title='ACL evaluation', tones=['green', 'plain', 'red']),
          caption='Implicit deny drops traffic that no earlier ACL rule permits.')

    b.add('4.3', 'Replacing insecure protocols',
          'Moving from clear-text protocols to encrypted equivalents: Telnet to SSH, HTTP to HTTPS, FTP to SFTP or FTPS, and SNMPv1 or v2c to SNMPv3, so credentials and data are not exposed on the network.',
          'eliminate clear-text management and file transfer on a network by using encrypted equivalents',
          ['Content filtering', 'MAC filtering', 'Port security'],
          'Every clear-text protocol has an ENCRYPTED successor — Telnet to SSH, HTTP to HTTPS, FTP to SFTP.',
          S.table(['Insecure', 'Secure replacement'], [('Telnet', 'SSH'), ('HTTP', 'HTTPS'), ('FTP', 'SFTP or FTPS'), ('SNMPv1 and v2c', 'SNMPv3')], title='Protocol upgrades', col_widths=[0.4, 0.6]),
          caption='Replace Telnet, HTTP, FTP, and SNMPv1 or v2c with SSH, HTTPS, SFTP, and SNMPv3.')

    b.add('4.3', 'DHCP snooping',
          'A switch feature that marks ports as trusted or untrusted, drops DHCP server messages arriving on untrusted ports to stop rogue DHCP servers, and builds a binding table of MAC, IP, port, and VLAN.',
          'stop an unauthorized DHCP server on an access port from handing out addresses',
          ['Dynamic ARP inspection', 'BPDU guard', 'Port mirroring'],
          'Trusts only the real DHCP server\'s port and builds the BINDING table that DAI later uses.',
          S.compare(('Trusted port', ['Toward the real DHCP server', 'DHCP replies allowed', 'Uplinks and server ports']), ('Untrusted port', ['Toward user devices', 'DHCP replies dropped', 'Rogue servers blocked']), title='DHCP snooping ports'),
          caption='DHCP snooping blocks DHCP replies from untrusted ports and records address bindings.')

    b.add('4.3', 'Dynamic ARP inspection (DAI)',
          'A switch feature that checks each ARP packet against the DHCP snooping binding table and drops those whose IP-to-MAC mapping does not match, preventing ARP spoofing and on-path attacks.',
          'drop forged ARP replies that claim the default gateway\'s IP address on an access port',
          ['DHCP snooping', 'Port security', 'BPDU guard'],
          'It validates ARP against the snooping BINDINGS — which is why DHCP snooping comes first.',
          S.steps([('ARP packet arrives', 'on an untrusted port'), ('Compared with bindings', 'DHCP snooping table'), ('Mismatch dropped', 'spoofed mapping blocked')], title='Dynamic ARP inspection', tones=['plain', 'blue', 'red']),
          caption='DAI drops ARP packets whose IP-to-MAC mapping does not match the binding table.')

    b.add('4.3', 'Key management',
          'The processes for generating, distributing, storing, rotating, and revoking cryptographic keys and certificates, including protecting private keys, often in a hardware security module, and replacing expired or compromised keys.',
          'rotate certificates on a schedule, store private keys securely, and revoke any key that may be compromised',
          ['Content filtering', 'Port security', 'Implicit deny'],
          'The LIFE CYCLE of keys — generate, store, rotate, revoke; an expired or exposed key breaks trust.',
          S.steps([('Generate and store', 'protected, ideally an HSM'), ('Distribute and use', 'least exposure'), ('Rotate or revoke', 'on schedule or compromise')], title='Key life cycle', tones=['blue', 'plain', 'amber']),
          caption='Key management covers generating, storing, rotating, and revoking cryptographic keys.')

    b.add('4.1', 'Self-signed certificate',
          'A certificate signed with its own private key instead of by a certificate authority, so it still encrypts traffic but is not trusted by clients by default and triggers browser warnings; it suits labs and internal devices but not public sites.',
          "secure a lab device's web interface with encryption when no certificate authority has signed a certificate for it",
          ['Public key infrastructure (PKI)', 'Certificate revocation list', 'Pre-shared key'],
          'Encrypts, but nobody VOUCHES for it — expect trust warnings unless clients import it.',
          S.compare(('CA-signed', ['Signed by a trusted authority', 'Browsers trust it', 'Public sites']), ('Self-signed', ['Signed by itself', 'Trust warnings appear', 'Labs and internal use']), title='Certificate trust'),
          caption='A self-signed certificate encrypts traffic but is not trusted by clients by default.')

    b.add('4.1', 'Identity and access management (IAM)',
          'The policies, processes, and tools that manage digital identities and control what each identity can access, covering provisioning, authentication, authorization, access reviews, and removal across on-premises and cloud systems.',
          'oversee every user, service, and device identity from creation through access reviews and removal across on-premises and cloud systems',
          ['Role-based access control (RBAC)', 'Network access control (NAC)', 'Single sign-on (SSO)'],
          'The whole IDENTITY life cycle — RBAC is only one way it assigns permissions.',
          S.steps([('Provision identity', 'create and assign roles'), ('Check access', 'authenticate, authorize'), ('Review and remove', 'when roles end')], title='IAM life cycle', tones=['blue', 'plain', 'green']),
          caption='IAM manages identities and their access from creation through review and removal.')

    b.add('4.1', 'Time-based authentication',
          'Access controls that depend on time, such as allowing sign-ins only during working hours or requiring time-based one-time passwords that change every 30 seconds.',
          'permit an account to sign in only between seven in the morning and six in the evening on weekdays',
          ['Geofencing', 'Multifactor authentication (MFA)', 'Least privilege'],
          'The CLOCK is part of the decision — login hours, or codes that expire in seconds.',
          S.compare(('Login hours', ['Allowed only in a window', 'Blocks off-hours access', 'Set per account']), ('One-time codes', ['Change every 30 seconds', 'Authenticator app', 'Expire quickly']), title='Time-based controls'),
          caption='Time-based authentication limits sign-ins by time of day or uses short-lived one-time codes.')

    b.add('4.1', 'Geofencing',
          'Restricting access based on physical location, using GPS, Wi-Fi, or IP geolocation, so a device or user is allowed only inside a defined area, such as a campus, or is blocked from certain countries.',
          'block sign-ins that come from outside the country and let a tablet work only while it is on the hospital campus',
          ['Time-based authentication', 'MAC filtering', 'Network segmentation'],
          'WHERE you are decides access — a virtual boundary around a place.',
          S.flow_split(('Access request', 'location checked'), [('Inside the fence', 'allowed'), ('Outside the fence', 'blocked')], title='Geofencing', tones=['green', 'red']),
          caption='Geofencing allows or blocks access based on a device or user\'s physical location.')

    b.add('4.1', 'Honeynet',
          'A decoy network of several honeypots and supporting systems that imitates a real environment so defenders can observe how attackers move and which tools they use, in an isolated and monitored setting.',
          'build an isolated fake network of many decoy servers to study how an attacker moves between systems',
          ['Honeypot', 'Screened subnet (DMZ)', 'Network tap'],
          'A whole decoy NETWORK — a honeypot is just one decoy system.',
          S.compare(('Honeypot', ['One decoy system', 'Lures attackers', 'Logs their actions']), ('Honeynet', ['Many decoys together', 'Imitates a real network', 'Shows attacker movement']), title='Deception technologies'),
          caption='A honeynet is a network of honeypots that imitates a real environment to study attackers.')

    b.add('4.1', 'SCADA, ICS, and OT networks',
          'Operational technology controls physical processes through industrial control systems such as SCADA, including industrial IoT (IIoT) devices, often with legacy protocols and equipment that cannot be patched or rebooted easily, so they are isolated from the IT network by segmentation and strict firewall rules.',
          'protect the controllers that run a factory floor and a water-treatment plant from threats on the corporate office network',
          ['Internet of Things (IoT) devices', 'Guest network segmentation', 'Bring your own device (BYOD)'],
          'Physical-process controllers that cannot take patches easily — SEGMENT them from the IT network.',
          S.layers([('IT network', 'offices, email, servers', 'blue'), ('Firewall', 'strict allow rules only', 'amber'), ('OT network', 'SCADA, PLCs, sensors', 'red')], title='Separating IT and OT'),
          caption='SCADA, ICS, and OT networks control physical processes and should be segmented from the IT network.')

    b.add('4.1', 'Bring your own device (BYOD)',
          'A policy that allows employees to connect personal phones, tablets, and laptops to company resources, usually requiring enrollment, mobile device management, a separate network or VLAN, and posture checks to limit risk.',
          'let employees use their own phones on the office Wi-Fi while keeping them apart from internal servers and requiring enrollment',
          ['Guest network', 'Network access control (NAC)', 'Posture assessment'],
          'PERSONAL devices on company resources — control them with enrollment, MDM, and segmentation.',
          S.steps([('Employee enrolls', 'personal device'), ('Posture checked', 'MDM and policy'), ('Placed on BYOD VLAN', 'limited access')], title='BYOD onboarding', tones=['plain', 'blue', 'green']),
          caption='BYOD lets personal devices connect to company resources under enrollment and segmentation controls.')

    b.add('4.1', 'Acceptable use policy (AUP)',
          'A written policy that states what users may and may not do with company networks and devices, such as prohibiting illegal downloads or personal servers, which they acknowledge before being given access.',
          'give new employees a document that spells out permitted and forbidden uses of company computers and the network, which they must sign',
          ['Service-level agreement (SLA)', 'End user license agreement (EULA)', 'Standard operating procedure (SOP)'],
          'Rules for USERS of the network — an SLA is a contract about service levels.',
          S.steps([('Policy written', 'allowed and forbidden uses'), ('User acknowledges', 'signs or accepts'), ('Access granted', 'violations enforced')], title='Acceptable use policy', tones=['blue', 'plain', 'green']),
          caption='An acceptable use policy defines permitted and forbidden uses of company networks and devices.')

    b.add('4.1', 'Data loss prevention (DLP)',
          'Controls that detect and block sensitive data, such as card numbers or personal records, from leaving the organization through email, uploads, removable media, or cloud sharing, based on content and policy.',
          'stop an employee from emailing a spreadsheet of customer card numbers to a personal account',
          ['Content filtering', 'Intrusion prevention system (IPS)', 'Encryption in transit'],
          'Watches data LEAVING by content — a firewall rule only looks at ports and addresses.',
          S.steps([('User sends data', 'email or upload'), ('DLP inspects content', 'card numbers found'), ('Transfer blocked', 'alert raised')], title='Data loss prevention', tones=['plain', 'blue', 'red']),
          caption='DLP inspects outgoing data and blocks sensitive content from leaving the organization.')

    b.add('4.1', 'Risk',
          'The likelihood that a threat will exploit a vulnerability, combined with the impact if it does; risk is reduced with controls, or it can be accepted, transferred, or avoided.',
          'weigh the chance that an attacker will take advantage of an unpatched router against the damage that would follow',
          ['Threat', 'Vulnerability', 'Exploit'],
          'LIKELIHOOD times IMPACT — a vulnerability alone is not a risk until a threat can use it.',
          S.steps([('Threat', 'who or what could harm'), ('Vulnerability', 'the weakness'), ('Risk', 'likelihood and impact')], title='How risk arises', tones=['red', 'amber', 'primary']),
          caption='Risk is the likelihood that a threat exploits a vulnerability, combined with the resulting impact.')

    b.add('4.1', 'Exploit',
          'A technique or piece of code that takes advantage of a vulnerability to compromise a system, such as a crafted packet that triggers a bug in a device\'s firmware.',
          "identify the code an attacker runs to take advantage of a known flaw in a device's firmware",
          ['Threat', 'Vulnerability', 'Risk'],
          'The METHOD that uses the weakness — the vulnerability is the weakness itself.',
          S.steps([('Vulnerability exists', 'unpatched firmware'), ('Exploit delivered', 'crafted traffic'), ('System compromised', 'attacker gains access')], title='From flaw to compromise', tones=['amber', 'red', 'plain']),
          caption='An exploit is the technique or code that takes advantage of a vulnerability.')

    b.add('4.2', 'Dumpster diving',
          'Searching a company\'s trash or recycling for discarded documents, drives, or notes that reveal passwords, network diagrams, or other sensitive information; shredding and secure disposal prevent it.',
          'recover printed network diagrams and password notes that were thrown out without being shredded',
          ['Shoulder surfing', 'Tailgating', 'Social engineering / phishing'],
          'Reads what was THROWN AWAY — shred documents and wipe drives before disposal.',
          S.steps([('Documents discarded', 'not shredded'), ('Attacker digs', 'finds diagrams, notes'), ('Information misused', 'used for later attacks')], title='Dumpster diving', tones=['plain', 'amber', 'red']),
          caption='Dumpster diving recovers sensitive information from discarded trash; shredding prevents it.')

    b.add('4.2', 'Shoulder surfing',
          'Watching someone enter a password, PIN, or other sensitive data by looking over their shoulder or at their screen, in person or with a camera; privacy screens and angling the display away reduce it.',
          'read a password as an employee types it on a laptop in a crowded coffee shop',
          ['Dumpster diving', 'Tailgating', 'Social engineering / phishing'],
          'Looking at the SCREEN or keyboard as it is used — a privacy filter is the defense.',
          S.compare(('Exposed screen', ['Visible from behind', 'Passwords seen as typed', 'Easy to observe']), ('Privacy screen', ['Narrow viewing angle', 'Others see black', 'Hides sensitive data']), title='Shoulder surfing'),
          caption='Shoulder surfing watches someone enter sensitive data; privacy screens reduce the risk.')

    b.add('4.2', 'Tailgating',
          'Following an authorized person through a secured door without presenting your own credentials; mantraps, badge readers with anti-passback, and staff awareness prevent it.',
          'enter a locked server room by walking in right behind an employee who holds the door open',
          ['Shoulder surfing', 'Dumpster diving', 'Social engineering / phishing'],
          'Walks in on SOMEONE ELSE\'S badge — a mantrap lets only one person through at a time.',
          S.steps([('Employee badges in', 'door opens'), ('Intruder follows', 'no credentials shown'), ('Secured area entered', 'access control bypassed')], title='Tailgating', tones=['blue', 'amber', 'red']),
          caption='Tailgating follows an authorized person through a secured door without credentials.')

    b.add('4.3', 'EAP over LAN (EAPoL)',
          'The encapsulation that carries the Extensible Authentication Protocol between a supplicant and the authenticator, a switch or access point, in 802.1X, before the authenticator relays the exchange to the RADIUS server.',
          'identify what carries the authentication messages between a laptop and the switch port before any network access is granted',
          ['RADIUS', 'Kerberos', 'TACACS+'],
          'EAP carried over the LAN between CLIENT and SWITCH — RADIUS then carries it to the server.',
          S.steps([('Supplicant', 'laptop, EAPoL'), ('Authenticator', 'switch or AP'), ('RADIUS server', 'allows or denies')], title='802.1X message path', tones=['plain', 'blue', 'green']),
          caption='EAPoL carries 802.1X authentication between a client and the switch or access point.')

    b.add('4.3', 'Unified threat management (UTM)',
          'An all-in-one security appliance that combines a firewall with functions such as intrusion prevention, antivirus, URL and content filtering, and VPN under one management interface, popular in small and midsize networks.',
          'protect a small branch with a single device that handles firewalling, intrusion prevention, web filtering, and antivirus',
          ['Stateful firewall', 'VPN headend (concentrator)', 'Load balancer'],
          'Many security functions in ONE box — a plain firewall does only one of them.',
          S.hub(('UTM appliance',), [('Firewall', 'stateful rules'), ('IPS', 'attack blocking'), ('Web filter', 'URL categories'), ('Antivirus', 'malware scanning')], title='Inside a UTM'),
          caption='A UTM appliance combines firewalling, intrusion prevention, filtering, and antivirus in one device.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Security concepts: encryption, PKI, access models, and segmentation', ['4.1'],
              'Encrypt data in two places: in transit (TLS, IPsec, SSH) while it crosses the network, and at rest (disk and database encryption) while it is stored. PKI relies on certificate authorities that sign certificates binding public keys to identities, with revocation through CRLs or OCSP. Role-based access control assigns permissions to roles that users are given, and posture assessment checks an endpoint\'s patches and antivirus before it is allowed on the network.\n\n'
              'Segmentation divides the network into zones with VLANs, subnets, and firewalls so a breach is contained. Compliance rules such as PCI DSS (cards), HIPAA (health), and GDPR (EU personal data) shape controls, and data sovereignty can dictate which country or cloud region may store data.')
    b.section('More attack types', ['4.2'],
              'Layer 2 and name-resolution attacks each have a signature. MAC flooding overflows a switch\'s MAC table so it floods frames like a hub (defense: port security), and DNS poisoning plants forged records in a resolver cache (defense: DNSSEC and secure resolvers). On wireless networks, an evil twin copies a legitimate SSID to trap clients, a rogue access point is an unauthorized AP connected to your own network, and a deauthentication attack disconnects clients with forged management frames (defense: 802.11w).\n\n'
              'Ransomware encrypts files and demands payment, so tested offline backups, segmentation, and patching are the real defenses.')
    b.section('More defenses and hardening', ['4.3'],
              'Harden devices by changing default credentials, disabling unused ports and services, patching, and restricting management access, and replace insecure protocols with encrypted ones (Telnet to SSH, HTTP to HTTPS, FTP to SFTP, SNMPv1 or v2c to SNMPv3). Firewall and ACL rules are evaluated top-down with the first match winning, and anything not permitted is dropped by implicit deny. URL and content filtering blocks sites by category, while MAC filtering is a weak control because addresses can be spoofed.\n\n'
              'On switches, DHCP snooping trusts only the real DHCP server\'s port (stopping rogue DHCP servers) and builds a binding table that dynamic ARP inspection uses to drop spoofed ARP packets. Key management covers generating, storing, rotating, and revoking keys and certificates.')
    b.section('Identity, policies, physical threats, and 802.1X', ['4.1', '4.2', '4.3'],
              'Identity and access management covers the whole identity life cycle, and access can also depend on time (login hours or one-time codes) or place (geofencing). A self-signed certificate encrypts but is not trusted by default. Keep SCADA, ICS, and OT networks segmented from the IT network, put BYOD devices under enrollment and a separate VLAN, and use an acceptable use policy and data loss prevention to govern what users do and what leaves. A honeynet is a network of decoy honeypots. Know risk (likelihood times impact), vulnerability (the weakness), exploit (the method), and threat (who or what could cause harm).\n\n'
              'Physical social engineering includes dumpster diving (discarded information), shoulder surfing (watching entry of secrets), and tailgating (following someone through a door). In 802.1X, EAPoL carries the authentication between the supplicant and the switch or access point, which relays it to RADIUS, and a unified threat management appliance combines firewall, intrusion prevention, filtering, and antivirus.')
