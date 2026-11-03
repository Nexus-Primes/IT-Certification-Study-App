"""Network+ (N10-009), domain nd1 (Networking Concepts), part 1: OSI, appliances, cloud, ports and protocols."""
import svg as S

DOMAIN = 'nd1'

OSI = [('7 Application', 'network services for apps: HTTP, SMTP, DNS, FTP'),
       ('6 Presentation', 'formats, encryption, compression: TLS, JPEG, ASCII'),
       ('5 Session', 'sets up, manages, and ends dialogues between apps'),
       ('4 Transport', 'end-to-end delivery: TCP and UDP, ports, segments'),
       ('3 Network', 'logical addressing and routing: IP, routers, packets'),
       ('2 Data Link', 'frames and MAC addresses: switches, Ethernet'),
       ('1 Physical', 'bits on the medium: cables, radio, connectors')]


def osi(layer, title):
    """The seven-layer stack with one layer highlighted."""
    items = [(label, desc, 'primary' if label.startswith(str(layer)) else 'plain') for label, desc in OSI]
    return S.layers(items, title=title)


def build(b):
    # ------------------------------------------------------------------------------------------ 1.1 OSI
    b.add('1.1', 'Session layer (Layer 5)',
          'The OSI layer that establishes, manages, and terminates dialogues between applications, handling session setup, checkpointing, and recovery.',
          'identify the layer responsible for opening, maintaining, and closing a conversation between two applications',
          ['Transport layer (Layer 4)', 'Presentation layer (Layer 6)', 'Application layer (Layer 7)'],
          'It manages the DIALOGUE — Transport moves segments end to end, and Presentation formats the data.',
          osi(5, 'Session layer'),
          caption='The Session layer sets up, manages, and ends the dialogue between two applications.')

    b.add('1.1', 'Presentation layer (Layer 6)',
          'The OSI layer that translates data into a format the application can use, handling character encoding, compression, and encryption or decryption.',
          'identify the layer that converts data formats and handles encryption and compression before data reaches the application',
          ['Session layer (Layer 5)', 'Application layer (Layer 7)', 'Transport layer (Layer 4)'],
          'It handles FORMAT, encryption, and compression — the Application layer is where the services themselves live.',
          osi(6, 'Presentation layer'),
          caption='The Presentation layer translates, compresses, and encrypts data for the application.')

    b.add('1.1', 'Application layer (Layer 7)',
          'The OSI layer closest to the user, providing the network services that applications use, such as HTTP, SMTP, DNS, and FTP; it is the protocol layer, not the application program itself.',
          'identify the layer at which HTTP, SMTP, and DNS operate',
          ['Presentation layer (Layer 6)', 'Session layer (Layer 5)', 'Transport layer (Layer 4)'],
          'Layer 7 provides network SERVICES to applications — a web browser is a program, but HTTP is the Layer 7 protocol.',
          osi(7, 'Application layer'),
          caption='The Application layer provides network services such as HTTP, SMTP, and DNS to applications.')

    b.add('1.1', 'TCP/IP model (four layers)',
          'The TCP/IP model groups networking into four layers (Network Access, Internet, Transport, and Application); the OSI Session, Presentation, and Application layers collapse into its single Application layer.',
          'map OSI\'s Session, Presentation, and Application layers into one layer of the model the Internet actually uses',
          ['The OSI reference model', 'Three-tier architecture', 'Spine-leaf architecture'],
          'FOUR layers: Network Access, Internet, Transport, Application — OSI\'s top three layers merge into one.',
          S.table(['TCP/IP layer', 'OSI layers it covers'], [('Application', '7, 6, 5'), ('Transport', '4'), ('Internet', '3'), ('Network Access', '2, 1')], title='TCP/IP versus OSI', col_widths=[0.45, 0.55]),
          caption='The TCP/IP model has four layers; its Application layer covers OSI layers 5 through 7.')

    # ------------------------------------------------------------------------------------------ 1.2 appliances
    b.add('1.2', 'Stateful firewall',
          'A firewall that tracks the state of each connection in a table, so return traffic for a connection started from inside is allowed automatically, unlike a stateless packet filter that judges every packet on its own.',
          'allow replies to connections started from inside the network without writing a separate rule for every reply',
          ['A stateless packet filter', 'A Layer 2 switch', 'A proxy server'],
          'It remembers CONNECTIONS in a state table — a stateless filter needs an explicit rule for the return direction.',
          S.compare(('Stateless filter', ['Checks each packet alone', 'Needs rules both ways', 'Fast, less context']), ('Stateful firewall', ['Tracks connection state', 'Replies allowed automatically', 'Keeps a state table']), title='Firewall types'),
          caption='A stateful firewall tracks connections so return traffic is allowed automatically.')

    b.add('1.2', 'Network-attached storage (NAS)',
          'A storage device that shares files over the network using protocols such as SMB and NFS, so clients see shared folders rather than raw disks.',
          'provide shared folders that users can map as drives over the existing Ethernet network',
          ['A storage area network (SAN)', 'Direct-attached storage', 'A load balancer'],
          'FILE-level sharing (SMB or NFS) — a SAN presents block-level storage that looks like a local disk.',
          S.compare(('NAS', ['File-level access', 'SMB or NFS shares', 'Over the normal LAN']), ('SAN', ['Block-level access', 'Looks like a local disk', 'Fibre Channel or iSCSI']), title='NAS vs SAN'),
          caption='A NAS shares files over the network; a SAN presents block storage that appears as a local disk.')

    b.add('1.2', 'Storage area network (SAN)',
          'A dedicated high-speed network (Fibre Channel or iSCSI) that presents block-level storage volumes to servers as if they were local disks, commonly used for virtualization clusters and databases.',
          'give a virtualization cluster shared block storage that appears to each host as a locally attached disk',
          ['Network-attached storage (NAS)', 'A USB external drive', 'A content delivery network'],
          'BLOCK-level storage that looks like a disk — a NAS shares files and folders instead.',
          S.steps([('Servers', 'hosts see a disk'), ('SAN fabric', 'Fibre Channel or iSCSI'), ('Storage array', 'LUNs presented')], title='Storage area network', tones=['plain', 'blue', 'green']),
          caption='A SAN provides block storage to servers over a dedicated network so it looks like local disk.')

    b.add('1.2', 'Content delivery network (CDN)',
          'A geographically distributed set of caching servers that deliver web content from an edge location near the user, reducing latency and offloading the origin server.',
          'reduce load times for users around the world by serving static content from servers close to them',
          ['A load balancer', 'A proxy server', 'A VPN concentrator'],
          'Content cached at the EDGE near users — a load balancer spreads requests across servers in one place.',
          S.steps([('User', 'requests a page'), ('Nearest edge node', 'serves cached content'), ('Origin server', 'only on a cache miss')], title='How a CDN helps', tones=['plain', 'blue', 'green']),
          caption='A CDN serves cached content from edge servers near users to cut latency and origin load.')

    b.add('1.2', 'VPN headend (concentrator)',
          'A device or appliance at the network edge that terminates VPN tunnels from remote users and branch sites, authenticating them and decrypting their traffic onto the internal network.',
          'terminate many remote-access and site-to-site tunnels on one device at the company edge',
          ['A Layer 2 switch', 'A wireless LAN controller', 'A load balancer'],
          'It is the TUNNEL END POINT for many VPN connections — a load balancer distributes application traffic.',
          S.steps([('Remote users', 'and branch sites'), ('VPN headend', 'terminates the tunnels'), ('Internal network', 'receives decrypted traffic')], title='VPN headend', tones=['plain', 'primary', 'green']),
          caption='A VPN headend terminates and authenticates remote-access and site-to-site VPN tunnels.')

    b.add('1.2', 'Time to live (TTL)',
          'An IP header field that each router decrements by one; when it reaches zero the packet is discarded and an ICMP Time Exceeded message is returned, which prevents routing loops and is how traceroute discovers each hop.',
          'explain how traceroute discovers every router along a path',
          ['Maximum transmission unit (MTU)', 'Quality of Service marking', 'Administrative distance'],
          'TTL counts HOPS down to zero — it stops packets circling forever and lets traceroute map the path.',
          S.steps([('TTL = 1', 'first router drops it'), ('ICMP Time Exceeded', 'reveals that router'), ('TTL = 2, 3, ...', 'reveals the next hops')], title='TTL and traceroute', tones=['plain', 'amber', 'green']),
          caption='Each router lowers the TTL; at zero the packet is dropped and an ICMP message reveals that hop.')

    # ------------------------------------------------------------------------------------------ 1.3 cloud
    b.add('1.3', 'Platform as a Service (PaaS)',
          'A cloud service model in which the provider manages the servers, operating system, and runtime, and the customer deploys and manages only the application and its data.',
          'let developers deploy a web application without managing servers or operating systems',
          ['Software as a Service (SaaS)', 'Infrastructure as a Service (IaaS)', 'Hybrid cloud'],
          'You manage only the APP and data — IaaS leaves the operating system to you, and SaaS leaves nothing to manage.',
          S.layers([('Applications', 'you deploy and manage', 'blue'), ('Runtime and middleware', 'provider manages', 'green'), ('Operating system', 'provider manages', 'green'), ('Servers and storage', 'provider manages', 'green')], title='Platform as a Service'),
          caption='With PaaS the provider runs the platform and the customer manages only the application.')

    b.add('1.3', 'Public cloud',
          'A cloud deployment model in which a provider such as AWS or Azure offers shared infrastructure to many customers over the Internet, billed on demand.',
          'rent shared compute capacity on demand from a provider that serves many organizations',
          ['Private cloud', 'Hybrid cloud', 'On-premises data center'],
          'SHARED infrastructure from a provider — a private cloud is dedicated to a single organization.',
          S.compare(('Public cloud', ['Shared provider infrastructure', 'Pay as you go', 'Reached over the Internet']), ('Private cloud', ['Dedicated to one organization', 'More control and isolation', 'Higher cost to run']), title='Deployment models'),
          caption='A public cloud is shared provider infrastructure rented on demand over the Internet.')

    b.add('1.3', 'Private cloud',
          'A cloud deployment model in which infrastructure is dedicated to a single organization, hosted on-premises or by a provider, giving cloud-style self-service with greater control and isolation.',
          'dedicate cloud infrastructure to one organization for regulatory isolation while keeping self-service management',
          ['Public cloud', 'Hybrid cloud', 'Software as a Service (SaaS)'],
          'DEDICATED to one organization — a hybrid cloud mixes private and public environments.',
          S.hub(('Cloud deployment models', 'who shares the infrastructure'), [('Public', 'many customers'), ('Private', 'one organization'), ('Hybrid', 'both, connected')]),
          caption='A private cloud is dedicated to one organization for control and isolation.')

    b.add('1.3', 'Scalability',
          'The ability of a system to handle growing load by adding resources, either vertically (a bigger server) or horizontally (more servers).',
          'plan for a workload that will grow tenfold over three years by being able to add capacity',
          ['Elasticity', 'Multitenancy', 'High availability'],
          'Scalability is the ABILITY to grow — elasticity is automatic growing and shrinking with demand.',
          S.compare(('Scale up (vertical)', ['A bigger server', 'More CPU and RAM', 'Has a ceiling']), ('Scale out (horizontal)', ['More servers', 'Load is shared', 'Far higher ceiling']), title='Ways to scale'),
          caption='Scalability is the ability to add capacity as load grows, by scaling up or scaling out.')

    b.add('1.3', 'Elasticity',
          'The ability of a cloud environment to add and remove resources automatically as demand rises and falls, so you pay only for what is in use.',
          'automatically add servers during a traffic spike and remove them afterwards to save cost',
          ['Scalability', 'Multitenancy', 'High availability'],
          'ELASTIC means automatic, in both directions — scalability only says capacity can be added.',
          S.steps([('Demand rises', 'traffic spike'), ('Auto scale out', 'servers added'), ('Demand falls', 'servers removed')], title='Elasticity', tones=['amber', 'blue', 'green']),
          caption='Elasticity adds and removes resources automatically as demand changes.')

    b.add('1.3', 'Multitenancy',
          'A cloud design in which many customers (tenants) share the same physical infrastructure while their data and workloads stay logically isolated from each other.',
          'explain how a provider hosts many customers on shared hardware while keeping each customer\'s data separate',
          ['Private cloud', 'Elasticity', 'Colocation'],
          'Shared hardware, SEPARATED tenants — it is what makes public cloud economical.',
          S.hub(('Shared infrastructure', 'one set of hardware'), [('Tenant A', 'isolated data'), ('Tenant B', 'isolated data'), ('Tenant C', 'isolated data')]),
          caption='Multitenancy lets many customers share infrastructure with logical isolation between them.')

    b.add('1.3', 'Virtual private cloud (VPC)',
          'A logically isolated virtual network inside a public cloud where you define IP ranges, subnets, route tables, and security rules for your own resources.',
          'create an isolated network in a public cloud with your own subnets and routing',
          ['A VLAN trunk', 'A private cloud', 'A site-to-site VPN'],
          'Your own isolated NETWORK inside a public cloud — a private cloud is dedicated infrastructure.',
          S.layers([('VPC', 'your isolated address space', 'primary'), ('Subnets', 'public and private', 'blue'), ('Route tables', 'control where traffic goes', 'blue'), ('Security rules', 'allow or deny traffic', 'amber')], title='Inside a VPC'),
          caption='A VPC is an isolated virtual network in a public cloud with its own subnets, routes, and rules.')

    b.add('1.3', 'NAT gateway (cloud)',
          'A cloud gateway that lets resources in a private subnet start outbound connections to the Internet for updates while remaining unreachable from the Internet; an Internet gateway allows two-way public access.',
          'let instances in a private subnet download updates without making them reachable from the Internet',
          ['An Internet gateway', 'A site-to-site VPN', 'A direct connection'],
          'OUTBOUND-only for private subnets — an Internet gateway also allows inbound traffic to public resources.',
          S.compare(('Internet gateway', ['Two-way Internet access', 'For public subnets', 'Needs public addresses']), ('NAT gateway', ['Outbound only', 'For private subnets', 'Hides private addresses']), title='Cloud gateways'),
          caption='A NAT gateway gives private subnets outbound Internet access without allowing inbound connections.')

    b.add('1.3', 'Private direct connection to the cloud',
          'A dedicated circuit between your network and the cloud provider (such as AWS Direct Connect or Azure ExpressRoute) that avoids the public Internet, giving predictable latency, throughput, and security.',
          'connect the data center to the cloud with a dedicated, predictable-latency link that bypasses the public Internet',
          ['A site-to-site VPN over the Internet', 'A remote-access VPN', 'A content delivery network'],
          'A dedicated PRIVATE circuit — a VPN is encrypted but still crosses the public Internet.',
          S.compare(('Direct connection', ['Dedicated circuit', 'Predictable latency', 'Not on the Internet']), ('VPN over Internet', ['Encrypted tunnel', 'Variable latency', 'Quick and low cost']), title='Reaching the cloud'),
          caption='A private direct connection links you to the cloud over a dedicated circuit instead of the Internet.')

    # ------------------------------------------------------------------------------------------ 1.4 ports and protocols
    def port(term, definition, scenario, distractors, tip, rows, title, caption):
        b.add('1.4', term, definition, scenario, distractors, tip, S.facts(rows, title=title), caption)

    port('Ports 20 and 21 (FTP)',
         'File Transfer Protocol uses TCP port 21 for control commands and port 20 for data in active mode; it sends credentials and data in clear text, so SFTP or FTPS replaces it where security matters.',
         'identify the default control port of an unencrypted file transfer service',
         ['Port 22 (SSH and SFTP)', 'Port 69 (TFTP)', 'Port 23 (Telnet)'],
         'FTP is the CLEAR-TEXT one on 20 and 21 — SFTP rides on SSH at 22.',
         [('Transport', 'TCP'), ('Control port', '21'), ('Data port', '20 in active mode'), ('Secure options', 'SFTP (22) or FTPS')], 'FTP',
         'FTP uses TCP 21 for control and 20 for data, all in clear text.')
    port('Port 22 (SSH and SFTP)',
         'Secure Shell provides encrypted remote command-line access, and SFTP and SCP use the same port to transfer files securely.',
         'securely administer a router or Linux server from the command line over an untrusted network',
         ['Port 23 (Telnet)', 'Port 3389 (RDP)', 'Port 21 (FTP)'],
         'The ENCRYPTED text-mode choice — Telnet on 23 sends everything in clear text.',
         [('Transport', 'TCP'), ('Port', '22'), ('Provides', 'encrypted shell, SFTP, SCP'), ('Replaces', 'Telnet and FTP')], 'SSH',
         'SSH on TCP 22 gives encrypted remote shell access and secure file transfer.')
    port('Port 23 (Telnet)',
         'Telnet provides remote command-line access in clear text, including passwords, so it is obsolete for administration and should be replaced by SSH.',
         'spot the legacy clear-text remote administration service during a port scan',
         ['Port 22 (SSH and SFTP)', 'Port 3389 (RDP)', 'Port 25 (SMTP)'],
         'Clear text on 23 — the finding to FIX by moving to SSH.',
         [('Transport', 'TCP'), ('Port', '23'), ('Risk', 'passwords sent in clear text'), ('Replace with', 'SSH on port 22')], 'Telnet',
         'Telnet on TCP 23 sends everything in clear text and should be replaced by SSH.')
    port('Port 25 (SMTP)',
         'SMTP relays email between mail servers on TCP 25, while mail clients submit messages on port 587 (STARTTLS, the port CompTIA lists as SMTPS) or 465 (implicit TLS).',
         'identify the port mail servers use to pass messages to each other',
         ['Port 110 (POP3)', 'Port 143 (IMAP)', 'Port 993 (IMAPS)'],
         'Server-to-server RELAY on 25 — clients submit outgoing mail on 587 (SMTPS), and POP3 and IMAP are how they retrieve it.',
         [('Transport', 'TCP'), ('Port 25', 'server-to-server relay'), ('Ports 587, 465', 'client submission with TLS'), ('Direction', 'sending only')], 'SMTP',
         'SMTP sends and relays email, using TCP 25 between servers.')
    port('Port 69 (TFTP)',
         'Trivial FTP uses UDP port 69 with no authentication or encryption for small transfers such as PXE boot files and device firmware or configurations.',
         'load a switch\'s firmware image from a server using a simple, unauthenticated UDP transfer',
         ['Port 21 (FTP)', 'Port 22 (SSH and SFTP)', 'Port 445 (SMB)'],
         'UDP and NO login — FTP is TCP with credentials.',
         [('Transport', 'UDP'), ('Port', '69'), ('Security', 'none: no login, no encryption'), ('Typical use', 'PXE boot, firmware, configs')], 'TFTP',
         'TFTP uses UDP 69 for simple transfers with no authentication or encryption.')
    port('Ports 67 and 68 (DHCP)',
         'DHCP servers listen on UDP port 67 and clients use UDP port 68 to obtain IP addresses and settings automatically.',
         'identify the ports a firewall must allow so clients can obtain addresses from a DHCP server',
         ['Port 53 (DNS)', 'Port 123 (NTP)', 'Ports 161 and 162 (SNMP)'],
         'Server 67, client 68, both UDP.',
         [('Transport', 'UDP'), ('Server', 'port 67'), ('Client', 'port 68'), ('Provides', 'address, mask, gateway, DNS')], 'DHCP',
         'DHCP uses UDP 67 for servers and UDP 68 for clients.')
    port('Port 80 (HTTP)',
         'Unencrypted web traffic runs over TCP port 80, while HTTPS on port 443 adds TLS encryption.',
         'identify the port used for unencrypted web traffic',
         ['Port 443 (HTTPS)', 'Port 25 (SMTP)', 'Port 110 (POP3)'],
         'Plain HTTP is on 80 — the encrypted version is on 443.',
         [('Transport', 'TCP'), ('Port', '80'), ('Encryption', 'none'), ('Encrypted twin', 'HTTPS on 443')], 'HTTP',
         'HTTP uses TCP 80 for unencrypted web traffic.')
    port('Port 110 (POP3)',
         'POP3 downloads email from a server (TCP 110, or 995 with TLS), usually removing it from the server so the mail lives on one device.',
         'retrieve email to a single client and remove it from the server',
         ['Port 143 (IMAP)', 'Port 25 (SMTP)', 'Port 587 (mail submission)'],
         'Download-and-delete on 110 — IMAP keeps mail on the server.',
         [('Transport', 'TCP'), ('Port', '110, or 995 with TLS'), ('Model', 'download, usually delete'), ('Best for', 'one device')], 'POP3',
         'POP3 on TCP 110 downloads mail to one client, normally removing it from the server.')
    port('Port 143 (IMAP)',
         'IMAP (TCP 143, or 993 with TLS) keeps email on the server and synchronizes folders and read status across multiple devices.',
         'let a user see the same mailbox, with folders and read status, on a phone and a laptop',
         ['Port 110 (POP3)', 'Port 25 (SMTP)', 'Port 389 (LDAP)'],
         'Mail STAYS on the server and syncs — POP3 downloads it to one device.',
         [('Transport', 'TCP'), ('Port', '143, or 993 with TLS'), ('Model', 'mail stays on the server'), ('Best for', 'several devices')], 'IMAP',
         'IMAP on TCP 143 keeps mail on the server and syncs it across devices.')
    port('Port 123 (NTP)',
         'The Network Time Protocol synchronizes clocks over UDP port 123, which matters for logs, certificates, and Kerberos authentication.',
         'identify the port used to keep device clocks synchronized',
         ['Ports 161 and 162 (SNMP)', 'Port 514 (Syslog)', 'Port 53 (DNS)'],
         'Time sync on UDP 123 — a wrong clock breaks logs, certificates, and Kerberos.',
         [('Transport', 'UDP'), ('Port', '123'), ('Purpose', 'clock synchronization'), ('Breaks when wrong', 'logs, certificates, Kerberos')], 'NTP',
         'NTP uses UDP 123 to synchronize clocks across devices.')
    port('Ports 161 and 162 (SNMP)',
         'SNMP managers poll agents on UDP port 161, and agents send unsolicited traps to the manager on UDP port 162.',
         'identify the ports used by SNMP for polling queries and for traps',
         ['Ports 20 and 21 (FTP)', 'Ports 67 and 68 (DHCP)', 'Port 514 (Syslog)'],
         '161 is for POLLING and 162 is for TRAPS sent by the device.',
         [('Transport', 'UDP'), ('Port 161', 'manager polls the agent'), ('Port 162', 'agent sends traps'), ('Secure version', 'SNMPv3')], 'SNMP',
         'SNMP uses UDP 161 for queries and UDP 162 for traps.')
    port('Ports 389 and 636 (LDAP and LDAPS)',
         'LDAP queries a directory service such as Active Directory on port 389, and LDAPS protects the same queries with TLS on TCP port 636.',
         'identify the ports used to query a directory service without and with encryption',
         ['Port 3389 (RDP)', 'Port 445 (SMB)', 'Port 1433 (Microsoft SQL Server)'],
         '389 is plain LDAP and 636 is the TLS-protected LDAPS.',
         [('Service', 'directory queries (Active Directory)'), ('LDAP', 'port 389'), ('LDAPS', 'TCP 636 with TLS'), ('Used for', 'lookups and authentication')], 'LDAP and LDAPS',
         'LDAP uses port 389 and LDAPS uses TCP 636 to query a directory service.')
    port('Port 445 (SMB)',
         'SMB provides Windows file and printer sharing directly over TCP port 445.',
         'identify the port used for Windows file and printer sharing',
         ['Port 3389 (RDP)', 'Port 389 (LDAP)', 'Port 21 (FTP)'],
         'Windows file and printer sharing is SMB on 445.',
         [('Transport', 'TCP'), ('Port', '445'), ('Provides', 'file and printer sharing'), ('Mostly seen on', 'Windows networks')], 'SMB',
         'SMB on TCP 445 provides Windows file and printer sharing.')
    port('Port 514 (Syslog)',
         'Syslog sends log messages from devices to a central log server, traditionally over UDP port 514.',
         'forward switch and router logs to a central log server',
         ['Ports 161 and 162 (SNMP)', 'Port 123 (NTP)', 'Port 25 (SMTP)'],
         'Log messages go to the collector on 514 — SNMP is for polling and traps.',
         [('Transport', 'UDP (traditionally)'), ('Port', '514'), ('Purpose', 'central log collection'), ('Messages carry', 'severity and facility')], 'Syslog',
         'Syslog uses UDP 514 to send device logs to a central collector.')
    port('Port 1433 (Microsoft SQL Server)',
         'Microsoft SQL Server listens on TCP port 1433 by default; other common database ports are 1521 for Oracle and 3306 for MySQL.',
         'identify the default port of a Microsoft SQL Server database',
         ['Port 3306 (MySQL)', 'Port 1521 (Oracle)', 'Port 3389 (RDP)'],
         'SQL Server is 1433 — Oracle uses 1521 and MySQL uses 3306.',
         [('SQL Server', 'TCP 1433'), ('Oracle (SQLnet)', 'TCP 1521'), ('MySQL', 'TCP 3306'), ('Tip', 'database ports stay off the Internet')], 'Database ports',
         'SQL Server uses TCP 1433; Oracle and MySQL use 1521 and 3306.')
    port('Port 3389 (RDP)',
         'The Remote Desktop Protocol provides a graphical remote session to a Windows computer over TCP port 3389.',
         'identify the port used for graphical remote desktop sessions to Windows systems',
         ['Port 22 (SSH and SFTP)', 'Port 23 (Telnet)', 'Port 5900 (VNC)'],
         'Graphical Windows sessions on 3389 — SSH gives a text session on 22.',
         [('Transport', 'TCP'), ('Port', '3389'), ('Provides', 'graphical Windows desktop'), ('Secure it', 'VPN, NLA, not exposed')], 'RDP',
         'RDP on TCP 3389 gives a graphical remote session to Windows.')
    port('Ports 5060 and 5061 (SIP)',
         'The Session Initiation Protocol sets up, modifies, and ends VoIP calls on port 5060, with TLS on 5061; the voice itself flows separately over RTP.',
         'identify the signaling ports used to set up VoIP calls',
         ['Ports 20 and 21 (FTP)', 'Port 3389 (RDP)', 'Ports 161 and 162 (SNMP)'],
         'SIP SIGNALS the call on 5060 and 5061 — the audio travels over RTP.',
         [('Port 5060', 'SIP signaling'), ('Port 5061', 'SIP over TLS'), ('Voice stream', 'RTP, separate ports'), ('Purpose', 'set up, change, end calls')], 'SIP',
         'SIP uses ports 5060 and 5061 to set up VoIP calls; voice travels over RTP.')

    b.add('1.4', 'ICMP',
          'The Internet Control Message Protocol (IP protocol 1) carries diagnostics and error messages such as echo request and reply, destination unreachable, and time exceeded; it has no port numbers.',
          'identify the protocol that carries echo requests and replies and the Time Exceeded messages routers send when a TTL reaches zero',
          ['TCP', 'UDP', 'GRE'],
          'Diagnostics and errors with NO port number — ping and the replies traceroute collects both depend on it.',
          S.steps([('Echo request', 'ping sends it'), ('Echo reply', 'the host answers'), ('Time exceeded', 'router at TTL zero')], title='ICMP messages', tones=['plain', 'green', 'amber']),
          caption='ICMP carries ping, unreachable, and time-exceeded messages and has no ports.')

    b.add('1.4', 'GRE (Generic Routing Encapsulation)',
          'IP protocol 47 that wraps many kinds of traffic inside IP packets to build point-to-point tunnels; it adds no encryption itself and is often paired with IPsec.',
          'build a simple tunnel between two sites that can also carry routing protocol traffic',
          ['IPsec ESP', 'ICMP', 'An SSL VPN'],
          'It ENCAPSULATES but does not encrypt — add IPsec when confidentiality is needed.',
          S.steps([('Original packet', 'from site A'), ('GRE plus new IP header', 'tunnel endpoints'), ('Unwrapped', 'at site B')], title='GRE tunnel', tones=['plain', 'blue', 'green']),
          caption='GRE wraps packets for transport through a tunnel but does not encrypt them.')

    b.add('1.4', 'IPsec ESP',
          'Encapsulating Security Payload (IP protocol 50) provides confidentiality, integrity, and authentication for IP packets, while AH provides integrity and authentication only.',
          'choose the IPsec protocol that encrypts the payload as well as authenticating it',
          ['IPsec AH', 'GRE', 'ICMP'],
          'ESP ENCRYPTS — AH (protocol 51) only authenticates and checks integrity.',
          S.compare(('ESP (protocol 50)', ['Encrypts the payload', 'Integrity and authentication', 'Used in most VPNs']), ('AH (protocol 51)', ['No encryption', 'Integrity and authentication', 'Rarely used alone']), title='IPsec protocols'),
          caption='ESP encrypts and authenticates IPsec traffic; AH authenticates only.')

    b.add('1.4', 'IPsec AH',
          'Authentication Header (IP protocol 51) proves a packet came from the claimed sender and was not altered, but it does not encrypt the contents.',
          'choose the IPsec protocol that proves a packet came from the claimed sender and was not altered, while leaving its payload readable',
          ['IPsec ESP', 'GRE', 'TLS'],
          'AH (protocol 51) authenticates the packet but does NOT encrypt — ESP (protocol 50) is the one that hides the payload.',
          S.facts([('IP protocol', '51'), ('Provides', 'integrity and authentication'), ('Does not provide', 'encryption'), ('Alternative', 'ESP (protocol 50)')], title='Authentication Header'),
          caption='AH gives IPsec integrity and authentication but no encryption.')

    b.add('1.4', 'Unicast',
          'Communication from one sender to one specific receiver, such as a normal client request to a single web server.',
          'identify the traffic type of an ordinary request from one client to one web server',
          ['Broadcast', 'Multicast', 'Anycast'],
          'ONE sender to ONE receiver — every other type involves a group or the nearest of a group.',
          S.table(['Traffic type', 'Delivered to'], [('Unicast', 'one specific host'), ('Broadcast', 'every host in the domain'), ('Multicast', 'hosts that joined the group'), ('Anycast', 'nearest host sharing the address')], title='Traffic types', col_widths=[0.35, 0.65]),
          caption='Unicast is one-to-one communication between a sender and a single receiver.')

    b.add('1.4', 'Broadcast',
          'Traffic sent to every device in the broadcast domain, such as an ARP request or a DHCP discover; routers do not forward it, and a switch floods it out every port in the VLAN.',
          'identify the traffic type a switch floods out every port in a VLAN, such as an ARP request',
          ['Unicast', 'Multicast', 'Anycast'],
          'To EVERYONE in the broadcast domain — and routers stop it, which is why VLANs shrink the domain.',
          S.steps([('Host sends', 'to all-ones address'), ('Switch floods', 'every port in the VLAN'), ('Router stops it', 'domain boundary')], title='Broadcast traffic', tones=['plain', 'amber', 'green']),
          caption='A broadcast reaches every host in the broadcast domain and is not forwarded by routers.')

    b.add('1.4', 'Anycast',
          'A single IP address assigned to multiple servers in different locations, with routing delivering each client to the nearest one; public DNS and CDNs use it.',
          'direct users to the nearest of several servers that share one IP address, as public DNS services do',
          ['Multicast', 'Unicast', 'Broadcast'],
          'ONE address, MANY servers, nearest wins — multicast delivers to every member of a group.',
          S.hub(('One anycast address', 'shared by many servers'), [('Server in Asia', 'nearest to Asian users'), ('Server in Europe', 'nearest to European users'), ('Server in US', 'nearest to US users')]),
          caption='Anycast shares one address across servers and routes each client to the nearest.')

    b.add('1.2', 'Direct-attached storage (DAS)',
          'Storage connected directly to a single server, such as internal drives or an external SAS or USB enclosure, with no network in between, so only that server can use it.',
          'give one database server fast local disk capacity that no other computer will share',
          ['Network-attached storage (NAS)', 'Storage area network (SAN)', 'Content delivery network (CDN)'],
          'Cabled to ONE server — a NAS shares files over the network and a SAN shares block storage.',
          S.table(['Storage type', 'Connected through'], [('DAS', 'a direct cable or bus'), ('NAS', 'Ethernet, file level'), ('SAN', 'dedicated fabric, block level')], title='Storage connectivity', col_widths=[0.4, 0.6]),
          caption='DAS attaches storage directly to one server; NAS and SAN share it over a network.')

    b.add('1.3', 'Network functions virtualization (NFV)',
          'Running network functions such as routers, firewalls, and load balancers as software on standard servers or in virtual machines instead of dedicated hardware appliances, which speeds deployment and lets capacity scale on demand.',
          'replace a rack of single-purpose firewall and load balancer boxes with software instances running on general-purpose servers',
          ['Software-defined networking (SDN)', 'Virtual private cloud (VPC)', 'Content delivery network (CDN)'],
          'Network functions become SOFTWARE on commodity servers — SDN separates the control plane instead.',
          S.compare(('Hardware appliance', ['Dedicated box per function', 'Slow to deploy or scale', 'Fixed capacity']), ('NFV', ['Software on standard servers', 'Deployed in minutes', 'Scales on demand']), title='Appliance vs. NFV'),
          caption='NFV runs network functions as software on standard servers instead of dedicated appliances.')

    b.add('1.3', 'Network security group',
          'A set of inbound and outbound rules, usually stateful, attached to cloud network interfaces, virtual machines, or subnets that allows or denies traffic by source, destination, protocol, and port; it acts as a virtual firewall for cloud resources.',
          'allow only HTTPS from the Internet and SSH from the admin subnet to a group of cloud virtual machines',
          ['Network security list', 'NAT gateway (cloud)', 'Internet gateway'],
          'Filters traffic to cloud RESOURCES — usually stateful, so return traffic is allowed automatically.',
          S.steps([('Packet arrives', 'at the virtual NIC'), ('Rules evaluated', 'source, port, protocol'), ('Allowed or denied', 'return traffic follows')], title='Network security group', tones=['plain', 'blue', 'green']),
          caption='A network security group filters traffic to cloud resources with source, destination, and port rules.')

    b.add('1.3', 'Network security list',
          'A subnet-level set of ingress and egress rules in some cloud platforms, such as Oracle security lists and similar to AWS network ACLs, that filters everything entering or leaving a subnet, whereas a network security group applies to individual resources.',
          'apply one rule set that filters everything entering and leaving a whole cloud subnet rather than individual machines',
          ['Network security group', 'Internet gateway', 'Virtual private cloud (VPC)'],
          'Works at the SUBNET boundary — a security group follows each individual resource.',
          S.layers([('Security list', 'filters the whole subnet', 'blue'), ('Security group', 'filters each resource', 'green'), ('Workload', 'the protected instance', 'plain')], title='Layers of cloud filtering'),
          caption='A network security list filters a whole subnet; a network security group filters individual resources.')

    b.add('1.4', 'Internet Key Exchange (IKE)',
          'The protocol that authenticates the two IPsec peers and negotiates the security associations and keys that protect the traffic, using UDP port 500, or UDP 4500 when NAT traversal is needed; IKEv2 is the current version.',
          'find the protocol that sets up the keys and parameters before an IPsec tunnel can carry traffic',
          ['IPsec ESP', 'IPsec AH', 'GRE (Generic Routing Encapsulation)'],
          'IKE NEGOTIATES the keys on UDP 500 — ESP then encrypts the data.',
          S.steps([('Peers authenticate', 'IKE exchange'), ('Keys negotiated', 'security associations'), ('Traffic protected', 'ESP encrypts data')], title='IPsec tunnel setup', tones=['plain', 'blue', 'green']),
          caption='IKE authenticates IPsec peers and negotiates the keys that ESP then uses.')

    # ------------------------------------------------------------------------------------------ added 2026-11-03 (official-objective gaps)
    b.add('1.3', 'Internet gateway (cloud)',
          'A cloud gateway attached to a virtual private cloud that gives public resources two-way connectivity with the Internet: instances with public addresses can both start connections and receive them, unlike a NAT gateway, which only lets private subnets reach out.',
          'let a public web server in a cloud network accept connections from Internet users and also reach the Internet itself',
          ['NAT gateway (cloud)', 'Private direct connection to the cloud', 'Network security list'],
          'TWO-WAY Internet access for public resources — a NAT gateway lets private subnets reach out but lets nothing reach in.',
          S.compare(('Internet gateway', ['Two-way Internet access', 'For public subnets', 'Needs public addresses']), ('NAT gateway', ['Outbound only', 'For private subnets', 'Hides private addresses']), title='Cloud gateways'),
          caption='An Internet gateway gives public cloud resources two-way Internet access; a NAT gateway is outbound-only.')

    port('Port 587 (SMTPS)',
         'The port mail clients use to submit outgoing email to their mail server over an encrypted (STARTTLS) connection, which CompTIA lists as SMTPS; server-to-server relay stays on port 25, and some systems still use 465 for implicit TLS.',
         'identify the port a mail client uses to send a message securely to its mail server',
         ['Port 25 (SMTP)', 'Port 443 (HTTPS)', 'Port 22 (SSH and SFTP)'],
         'SMTPS on 587 is the CLIENT submission port — plain SMTP on 25 relays between servers.',
         [('Transport', 'TCP'), ('Port 587', 'client submission, STARTTLS'), ('Port 25', 'server-to-server relay'), ('CompTIA name', 'SMTPS')], 'SMTPS',
         'SMTPS on TCP 587 is where mail clients submit outgoing mail securely.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('The upper OSI layers and the TCP/IP model', ['1.1'],
              'Layers 5 through 7 complete the OSI picture. The Session layer manages the dialogue between two applications (setup, maintenance, and teardown), the Presentation layer handles data format, compression, and encryption, and the Application layer provides the network services applications call on, such as HTTP, SMTP, DNS, and FTP. Remember that Layer 7 is the protocol layer, not the application program itself.\n\n'
              'The TCP/IP model that the Internet actually uses has four layers: Network Access (OSI 1 and 2), Internet (OSI 3), Transport (OSI 4), and Application (OSI 5 through 7). Exam questions often ask you to place a protocol or device in the right layer of either model.')
    b.section('Appliances and storage', ['1.2'],
              'A stateful firewall tracks connections in a state table so return traffic is allowed automatically, while a stateless packet filter judges each packet alone. A VPN headend terminates remote-access and site-to-site tunnels, a CDN serves cached content from edge servers close to users, and the IP time-to-live field is decremented at each router so loops end and traceroute can reveal each hop.\n\n'
              'Network storage comes in two forms. A NAS shares files (SMB or NFS) over the normal LAN, whereas a SAN presents block-level storage over Fibre Channel or iSCSI so servers see it as a local disk.')
    b.section('Cloud service, deployment, and connectivity concepts', ['1.3'],
              'Service models differ in what you manage: in PaaS the provider runs the servers, operating system, and runtime and you manage only the application, between IaaS (you manage the operating system) and SaaS (you manage nothing). Deployment models are public (shared provider infrastructure), private (dedicated to one organization), and hybrid (both, connected). Scalability is the ability to add capacity, elasticity is automatic growth and shrinkage with demand, and multitenancy is many customers sharing infrastructure with logical isolation.\n\n'
              'In a public cloud you build a virtual private cloud with your own subnets, routes, and security rules; a NAT gateway gives private subnets outbound-only Internet access while an Internet gateway allows two-way access. To reach the cloud you can use a VPN across the Internet or a private direct connection (such as Direct Connect or ExpressRoute) for predictable latency.')
    b.section('Ports, protocols, and traffic types', ['1.4'],
              'Learn ports as pairs of secure and insecure services: FTP (20 and 21) versus SFTP and SSH (22), Telnet (23) versus SSH, HTTP (80) versus HTTPS (443), LDAP (389) versus LDAPS (636), and SMTP (25) for server relay versus SMTPS (587) for secure client submission. Other common ones: TFTP 69 (UDP, no authentication), DHCP 67 and 68, NTP 123, SNMP 161 and 162, SMB 445, Syslog 514, SQL Server 1433, RDP 3389, and SIP 5060 and 5061.\n\n'
              'IP protocols are not ports: ICMP (protocol 1) carries diagnostics, GRE (47) tunnels traffic without encrypting it, and IPsec uses ESP (50) to encrypt and authenticate or AH (51) to authenticate only. Traffic types are unicast (one to one), broadcast (one to all in the domain), multicast (to a group), and anycast (one address on many servers, delivered to the nearest).')
    b.section('Cloud filtering, IPsec key exchange, and storage types', ['1.2', '1.3', '1.4'],
              'Cloud traffic is filtered at two levels: a network security group is a (usually stateful) rule set attached to individual resources, and a network security list filters a whole subnet. Network functions virtualization runs routers, firewalls, and load balancers as software on standard servers. For storage, direct-attached storage connects to one server, a NAS shares files, and a SAN presents block storage. IPsec tunnels are set up by the Internet Key Exchange (UDP 500, or 4500 through NAT), after which ESP encrypts the data.')
