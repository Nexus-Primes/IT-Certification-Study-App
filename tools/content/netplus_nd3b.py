"""Network+ (N10-009), domain nd3 (Networking Operations), part 2: monitoring, IP services (DHCP, DNS, time), and network access."""
import svg as S

DOMAIN = 'nd3'


def build(b):
    b.objective('3.7', 'IP services (DHCP, DNS, time)', ['DHCP scopes and reservations', 'DHCP relay', 'SLAAC', 'DNS record types', 'DNS zones and servers', 'DNSSEC, DoH, DoT', 'NTP, PTP, NTS'])
    b.objective('3.8', 'Network access and management methods', ['Site-to-site and client-to-site VPN', 'Split and full tunnel', 'Console and GUI access', 'Out-of-band management', 'Jump boxes', 'RADIUS and TACACS+'])
    b.topics['3.6'] = ['SNMP', 'Syslog', 'NetFlow', 'Baselines', 'SNMPv3 and traps', 'Community strings', 'MIB and OID', 'SIEM', 'Network discovery', 'Configuration monitoring', 'Interface counters', 'Availability']

    # ------------------------------------------------------------------------------------------ 3.6 monitoring
    b.add('3.6', 'SNMPv3',
          'The secure version of SNMP, adding authentication and encryption (authPriv) and user-based access control, whereas SNMPv1 and v2c rely on clear-text community strings.',
          'secure device monitoring with authentication and encryption instead of clear-text community strings',
          ['SNMPv2c', 'SNMPv1', 'Syslog over UDP'],
          'v3 adds AUTHENTICATION and ENCRYPTION — v1 and v2c send community strings in clear text.',
          S.table(['Version', 'Security'], [('SNMPv1', 'community string, clear text'), ('SNMPv2c', 'community string, clear text'), ('SNMPv3', 'authentication and encryption')], title='SNMP versions', col_widths=[0.3, 0.7]),
          caption='SNMPv3 adds authentication and encryption; v1 and v2c use clear-text community strings.')

    b.add('3.6', 'SNMP trap',
          'An unsolicited message an SNMP agent sends to the manager when an event occurs, such as an interface going down, so alerts arrive immediately instead of waiting for the next poll.',
          'have a switch notify the monitoring system immediately when an interface goes down instead of waiting for the next poll',
          ['SNMP polling', 'Syslog', 'NetFlow'],
          'The AGENT speaks up by itself — polling is the manager asking on a schedule.',
          S.compare(('Polling (GET)', ['Manager asks the agent', 'On a schedule', 'Port 161']), ('Trap', ['Agent notifies the manager', 'When an event happens', 'Port 162']), title='Polling vs traps'),
          caption='A trap is an unsolicited SNMP alert from the agent to the manager.')

    b.add('3.6', 'Management Information Base (MIB)',
          'A hierarchical database of the objects a device exposes to SNMP, such as interface counters and system name, defining what a manager can read or set.',
          'identify the structured database that defines which values a managed device exposes over SNMP',
          ['Object identifier (OID)', 'A community string', 'An SNMP trap'],
          'The DATABASE of manageable objects — each object in it has an OID.',
          S.hub(('MIB', 'database of managed objects'), [('System', 'name, uptime'), ('Interfaces', 'status, counters'), ('IP', 'routes, addresses')]),
          caption='A MIB defines the objects a device exposes to SNMP managers.')

    b.add('3.6', 'Object identifier (OID)',
          'The dotted numeric address of a single object in the MIB tree, such as 1.3.6.1.2.1.1.5.0 for the system name, used by a manager to request a specific value.',
          'identify the dotted numeric identifier used to request one specific counter from a device through SNMP',
          ['Management Information Base (MIB)', 'A community string', 'An SNMP trap'],
          'The NUMERIC address of one object — the MIB is the collection that holds them.',
          S.terminal(['snmpget -v3 switch1 1.3.6.1.2.1.1.5.0', 'iso.3.6.1.2.1.1.5.0 = STRING: "core-sw1"', '# the OID selects exactly one value'], title='Terminal'),
          caption='An OID is the numeric address of one object in the MIB tree.')

    b.add('3.6', 'SIEM',
          'A security information and event management platform that collects and correlates logs and events from many devices, detects suspicious patterns, raises alerts, and retains data for investigations and compliance.',
          'correlate firewall, switch, and server logs in one place to detect suspicious patterns and generate alerts',
          ['A Syslog server', 'A NetFlow collector', 'An SNMP manager'],
          'It CORRELATES events across sources — a syslog server only collects the messages.',
          S.steps([('Many log sources', 'firewalls, switches'), ('SIEM correlates', 'rules and analytics'), ('Alerts and reports', 'investigation, compliance')], title='SIEM', tones=['plain', 'primary', 'green']),
          caption='A SIEM collects and correlates logs from many sources to detect threats and support investigations.')

    b.add('3.6', 'API-based monitoring (telemetry)',
          'Pulling or streaming device data through programmatic interfaces such as REST APIs and streaming telemetry, which return structured data (for example JSON) that tools can process without screen-scraping the CLI.',
          'collect interface statistics from many devices as structured data through a programmatic interface instead of parsing CLI output',
          ['SNMP trap', 'Syslog', 'Port mirroring'],
          'STRUCTURED data over an API — no CLI screen-scraping, and it can stream continuously.',
          S.terminal(['GET /api/v1/interfaces/gi1', '{"name": "Gi1", "status": "up",', ' "speed_mbps": 1000, "crc_errors": 12}'], title='REST API'),
          caption='API and telemetry monitoring returns structured data from devices without CLI parsing.')

    b.add('3.6', 'CRC errors',
          'An interface counter that rises when received frames fail the cyclic redundancy check and are discarded as corrupted, commonly caused by bad cables, interference, faulty ports, or a duplex mismatch.',
          'identify the interface counter that increases when frames arrive corrupted, often because of a damaged cable',
          ['Runts', 'Giants', 'Output drops'],
          'CORRUPTED frames failing the check — look at cabling, interference, and duplex settings first.',
          S.facts([('Counter', 'input CRC errors'), ('Meaning', 'frame failed its checksum'), ('Common causes', 'bad cable, EMI, duplex mismatch'), ('Fix', 'replace or test the cable, check duplex')], title='CRC errors'),
          caption='Rising CRC errors mean corrupted frames, usually from cabling, interference, or duplex problems.')

    b.add('3.6', 'Environmental sensors',
          'Sensors in racks and wiring closets that report temperature, humidity, power, and water leaks to the monitoring system, so cooling, power, or flooding problems are caught before they cause outages.',
          'be alerted when a wiring closet overheats or when water is detected under a raised floor',
          ['A NetFlow collector', 'A protocol analyzer', 'A Syslog server'],
          'They watch the ROOM, not the traffic — temperature, humidity, power, and leaks.',
          S.hub(('Environmental monitoring', 'sensors report to the NMS'), [('Temperature', 'cooling failures'), ('Humidity', 'static, damp'), ('Water leak', 'flooding'), ('Power', 'voltage and load')]),
          caption='Environmental sensors monitor temperature, humidity, power, and leaks in network spaces.')

    b.add('3.6', 'Anomaly-based alerting',
          'Alerting when a metric deviates strongly from its learned baseline instead of only crossing a fixed limit, which catches unusual behavior (such as an off-hours traffic spike) and reduces false alarms on normal peaks.',
          'be notified when traffic differs sharply from the normal pattern for that time of day, rather than only when it passes a fixed limit',
          ['A static threshold alert', 'A syslog severity level', 'An SNMP polling interval'],
          'Compares against the BASELINE — a static threshold fires at the same number whatever the context.',
          S.compare(('Static threshold', ['Fires at one fixed number', 'Ignores normal patterns', 'Many false alarms']), ('Anomaly-based', ['Compares with the baseline', 'Learns daily patterns', 'Catches unusual spikes']), title='Alerting methods'),
          caption='Anomaly-based alerts compare current behavior with a learned baseline.')

    b.add('3.6', 'Availability (uptime percentage)',
          'The share of time a service is operational, often expressed in nines: 99.9% allows about 8.8 hours of downtime a year, 99.99% about 53 minutes, and 99.999% about 5 minutes.',
          'work out how much downtime per year a "four nines" target permits',
          ['Mean time between failures (MTBF)', 'Recovery time objective (RTO)', 'Latency'],
          'Each extra NINE cuts permitted downtime tenfold — 99.99% is about 53 minutes a year.',
          S.table(['Availability', 'Downtime per year'], [('99%', 'about 3.65 days'), ('99.9%', 'about 8.8 hours'), ('99.99%', 'about 53 minutes'), ('99.999%', 'about 5 minutes')], title='The nines', col_widths=[0.4, 0.6]),
          caption='Availability is measured in nines; each added nine cuts allowed downtime tenfold.')

    # ------------------------------------------------------------------------------------------ 3.7 IP services
    b.add('3.7', 'DHCP DORA process',
          'The four-step DHCP lease exchange: the client broadcasts a Discover, a server replies with an Offer, the client broadcasts a Request for the offered address, and the server confirms with an Acknowledgment.',
          'identify the four messages exchanged when a client obtains an address from a DHCP server',
          ['SYN, SYN-ACK, ACK', 'Request, Reply, Release, Renew', 'Query, Response, Update, Notify'],
          'Discover, Offer, Request, Acknowledge — and the client sends both Discover and Request as broadcasts.',
          S.steps([('Discover', 'client broadcasts'), ('Offer', 'server proposes'), ('Request', 'client accepts'), ('Acknowledge', 'lease confirmed')], title='DHCP DORA', tones=['plain', 'blue', 'amber', 'green']),
          caption='DHCP assigns addresses through Discover, Offer, Request, and Acknowledge.')

    b.add('3.7', 'DHCP scope and exclusions',
          'A scope is the range of addresses a DHCP server may lease for a subnet along with the mask, gateway, and options; exclusions remove addresses from the range so they are never leased, protecting devices with static addresses.',
          'keep the first twenty addresses of a subnet out of the DHCP range because routers and servers use them as static addresses',
          ['A DHCP reservation', 'A DHCP relay agent', 'A shorter lease time'],
          'An EXCLUSION removes addresses from the lease range — a reservation hands a specific address to one device.',
          S.facts([('Scope', '192.168.10.1 to .254 for the subnet'), ('Exclusion', '.1 to .20 never leased'), ('Leased range', '.21 to .254 given to clients'), ('Also in scope', 'mask, gateway, DNS options')], title='A DHCP scope'),
          caption='A scope defines the lease range; exclusions protect addresses that are assigned statically.')

    b.add('3.7', 'DHCP reservation',
          'A DHCP setting that always gives a specific MAC address the same IP address, so a device such as a printer has a fixed address while its configuration is still managed centrally.',
          'make a network printer always receive the same address from DHCP without configuring it manually',
          ['A static IP address on the device', 'A DHCP exclusion', 'An APIPA address'],
          'The SERVER gives the same address to one MAC — a static IP is typed on the device itself.',
          S.compare(('DHCP reservation', ['Server maps MAC to IP', 'Central management', 'Device stays on DHCP']), ('Static IP', ['Typed on the device', 'Manual and scattered', 'Must avoid the scope']), title='Fixed addresses'),
          caption='A reservation always gives one MAC address the same IP from the DHCP server.')

    b.add('3.7', 'DHCP lease time',
          'How long a client may use a leased address before renewing; clients try to renew at 50 percent of the lease and rebind at 87.5 percent, and short leases suit busy guest Wi-Fi while long leases suit stable wired networks.',
          'choose a short lease for a guest Wi-Fi network whose clients come and go quickly',
          ['A DHCP reservation', 'A DHCP exclusion', 'A larger scope'],
          'SHORT leases recycle addresses for transient clients — long leases suit stable devices.',
          S.facts([('Renew (T1)', 'at 50% of the lease'), ('Rebind (T2)', 'at 87.5% of the lease'), ('Short lease', 'guest and busy Wi-Fi'), ('Long lease', 'stable wired networks')], title='DHCP lease timing'),
          caption='Lease time controls how long an address is held; short leases suit transient clients.')

    b.add('3.7', 'DHCP options',
          'Extra settings a DHCP server delivers along with the address, such as the default gateway (option 3), DNS servers (option 6), domain name (option 15), NTP servers (option 42), and boot server and file (options 66 and 67) for PXE.',
          'deliver the default gateway and DNS server addresses to clients together with their IP addresses',
          ['A DHCP scope exclusion', 'A DHCP reservation', 'A DHCP relay agent'],
          'OPTIONS carry everything beyond the address — gateway, DNS, domain, NTP, and boot settings.',
          S.table(['Option', 'Delivers'], [('3', 'default gateway'), ('6', 'DNS servers'), ('15', 'domain name'), ('42', 'NTP servers'), ('66 and 67', 'boot server and file (PXE)')], title='Common DHCP options', col_widths=[0.3, 0.7]),
          caption='DHCP options deliver settings such as gateway, DNS, and domain name with the address.')

    b.add('3.7', 'DHCP relay agent (IP helper)',
          'A router or Layer 3 interface feature that forwards DHCP broadcasts from a subnet to a DHCP server on another subnet as unicast, so one server can serve many VLANs.',
          'let clients on several VLANs get addresses from a single DHCP server located on a different subnet',
          ['A DHCP reservation', 'A DHCP scope exclusion', 'Proxy ARP'],
          'Routers do not forward broadcasts — the RELAY (IP helper) converts them into unicast to the server.',
          S.steps([('Client broadcast', 'DHCP Discover on VLAN 20'), ('Relay agent', 'unicasts to the server'), ('DHCP server', 'on another subnet')], title='DHCP relay', tones=['plain', 'blue', 'green']),
          caption='A DHCP relay forwards client broadcasts to a server on another subnet as unicast.')

    b.add('3.7', 'SLAAC',
          'Stateless address autoconfiguration lets an IPv6 host build its own global address from the prefix in a router advertisement plus an interface identifier, without a DHCP server, then check it for duplicates.',
          'let IPv6 hosts configure their own addresses from the router\'s advertised prefix without a DHCP server',
          ['DHCPv6 stateful addressing', 'A link-local address only', 'APIPA'],
          'The HOST builds its own address from the router\'s /64 prefix — no server tracks leases.',
          S.steps([('Router advertises', 'a /64 prefix'), ('Host builds address', 'prefix plus interface ID'), ('Duplicate check', 'then it uses the address')], title='SLAAC', tones=['blue', 'plain', 'green']),
          caption='With SLAAC an IPv6 host forms its address from the router\'s advertised prefix without DHCP.')

    b.add('3.7', 'A and AAAA records',
          'DNS records that map a hostname to an address: an A record to an IPv4 address and an AAAA record to an IPv6 address.',
          'map www.example.com to both an IPv4 and an IPv6 address in DNS',
          ['CNAME record', 'PTR record', 'MX record'],
          'A is IPv4 and AAAA is IPv6 — both turn a NAME into an ADDRESS.',
          S.terminal(['www.example.com.  3600 IN A     93.184.216.34', 'www.example.com.  3600 IN AAAA  2606:2800:220:1::1', '# A = IPv4, AAAA = IPv6'], title='Zone file'),
          caption='A records map names to IPv4 addresses and AAAA records map names to IPv6 addresses.')

    b.add('3.7', 'CNAME record',
          'A DNS alias that maps one name to another canonical name, so the alias follows whatever address the target resolves to; it cannot coexist with other records on the same name.',
          'make shop.example.com follow the address of a hosting provider\'s name without hard-coding an IP address',
          ['A record', 'PTR record', 'MX record'],
          'An ALIAS for another name — an A record points a name directly at an address.',
          S.terminal(['shop.example.com.  IN CNAME stores.provider.net.', 'stores.provider.net. IN A     198.51.100.20', '# the alias follows the target\'s address'], title='Zone file'),
          caption='A CNAME makes one name an alias of another, so it follows the target\'s address.')

    b.add('3.7', 'MX record',
          'A DNS record that names the mail servers for a domain, each with a priority number where the lowest value is tried first; it points to hostnames rather than IP addresses.',
          'direct email for example.com to its mail servers, with a backup server used only if the first is down',
          ['A record', 'TXT record', 'NS record'],
          'Mail servers with PRIORITY — the lowest number is preferred, higher numbers are backups.',
          S.terminal(['example.com.  IN MX 10 mail1.example.com.', 'example.com.  IN MX 20 mail2.example.com.', '# lower number = higher priority'], title='Zone file'),
          caption='MX records list a domain\'s mail servers by priority.')

    b.add('3.7', 'TXT record',
          'A DNS record holding arbitrary text, widely used for email authentication (SPF, DKIM, DMARC) and for proving domain ownership to cloud services.',
          'publish an SPF policy and a domain-ownership verification string in DNS',
          ['MX record', 'CNAME record', 'PTR record'],
          'Free-form TEXT — email authentication and domain verification both use it.',
          S.facts([('SPF', 'which servers may send mail'), ('DKIM', 'public key for message signatures'), ('DMARC', 'policy for failed checks'), ('Verification', 'prove domain ownership')], title='What TXT records hold'),
          caption='TXT records carry text data such as SPF, DKIM, DMARC, and ownership verification strings.')

    b.add('3.7', 'NS record',
          'A DNS record that lists the authoritative name servers for a zone, which is how the DNS hierarchy delegates a domain to the servers that hold its records.',
          'identify the record that tells resolvers which servers are authoritative for a domain',
          ['SOA record', 'MX record', 'A record'],
          'Names the AUTHORITATIVE servers — it is how a parent zone delegates to the child zone.',
          S.terminal(['example.com.  IN NS ns1.example.com.', 'example.com.  IN NS ns2.example.com.', '# delegates the zone to these servers'], title='Zone file'),
          caption='NS records name the authoritative DNS servers for a zone.')

    b.add('3.7', 'PTR record',
          'A DNS record used for reverse lookups, mapping an IP address back to a hostname inside the in-addr.arpa (IPv4) or ip6.arpa (IPv6) zones, often checked by mail servers.',
          'resolve an IP address back to a hostname for logging or to satisfy a mail server\'s reverse lookup check',
          ['A record', 'CNAME record', 'NS record'],
          'ADDRESS to NAME — the reverse of an A record.',
          S.terminal(['5.2.0.192.in-addr.arpa.  IN PTR host5.example.com.', '# reverse lookup for 192.0.2.5', 'nslookup 192.0.2.5'], title='Reverse zone'),
          caption='PTR records map IP addresses back to hostnames for reverse lookups.')

    b.add('3.7', 'DNSSEC',
          'A set of extensions that digitally signs DNS records so resolvers can verify they came from the authoritative zone and were not altered, defending against cache poisoning; it provides authenticity, not encryption.',
          'protect resolvers from forged DNS answers by verifying digital signatures on records',
          ['DNS over HTTPS', 'A CNAME record', 'Split-horizon DNS'],
          'Proves authenticity and integrity with SIGNATURES — it does not encrypt queries.',
          S.steps([('Zone signs records', 'RRSIG signatures'), ('Resolver validates', 'chain of trust to the root'), ('Forged answer', 'fails and is rejected')], title='DNSSEC', tones=['blue', 'plain', 'green']),
          caption='DNSSEC signs DNS data so tampered or forged answers are detected, without encrypting it.')

    b.add('3.7', 'DNS over HTTPS and DNS over TLS',
          'Protocols that encrypt DNS queries between a client and its resolver, DoT on TCP port 853 and DoH inside HTTPS on port 443, protecting privacy from eavesdroppers but making network-based DNS filtering harder.',
          'prevent anyone on the path from reading which names a client is looking up',
          ['DNSSEC', 'A PTR record', 'DHCP snooping'],
          'ENCRYPTS the query itself — DNSSEC signs answers but leaves queries readable.',
          S.compare(('DoT', ['TLS on TCP 853', 'Easy to identify and filter', 'Dedicated port']), ('DoH', ['Inside HTTPS on 443', 'Blends with web traffic', 'Harder to filter']), title='Encrypted DNS'),
          caption='DoH and DoT encrypt DNS queries between client and resolver for privacy.')

    b.add('3.7', 'Authoritative DNS server',
          'A DNS server that holds the actual records for a zone and gives definitive (authoritative) answers about it, in contrast to a recursive resolver, whose cached answers for other zones are marked non-authoritative.',
          'identify the server that holds the real records for example.com and answers definitively for that zone',
          ['A recursive resolver', 'A DNS forwarder', 'A root hint'],
          'It OWNS the zone data — a resolver only asks around and caches, so its answers show up as "non-authoritative".',
          S.compare(('Authoritative', ['Holds the zone records', 'Definitive answers', 'Primary and secondary']), ('Recursive resolver', ['Asks on the client\'s behalf', 'Caches answers', 'Walks the hierarchy']), title='DNS server roles'),
          caption='An authoritative server holds a zone\'s records and gives definitive answers.')

    b.add('3.7', 'Recursive DNS resolver',
          'A DNS server that accepts a client\'s query and does the work of finding the answer by querying the root, top-level domain, and authoritative servers in turn, then caches and returns it.',
          'identify the server that finds an answer by querying the DNS hierarchy on a client\'s behalf and caches the result',
          ['An authoritative DNS server', 'A root name server', 'A DHCP server'],
          'It does the LEGWORK for the client and caches — authoritative servers just answer for their own zone.',
          S.steps([('Client asks', 'its resolver'), ('Resolver walks', 'root, TLD, authoritative'), ('Answer cached', 'and returned')], title='Recursive resolution', tones=['plain', 'blue', 'green']),
          caption='A recursive resolver queries the DNS hierarchy for a client and caches the answer.')

    b.add('3.7', 'Hosts file',
          'A local text file that maps names to addresses and is consulted before DNS on most systems, useful for testing or overriding a name on one computer and a common target for malware.',
          'override how one computer resolves a name for testing without changing DNS for everyone',
          ['A DNS forwarder', 'A DHCP reservation', 'A CNAME record'],
          'A LOCAL override checked first — it affects only that computer.',
          S.terminal(['# hosts file: checked before DNS', '10.0.0.50   testserver.example.com', '127.0.0.1   localhost'], title='hosts'),
          caption='The hosts file overrides name resolution on a single computer.')

    b.add('3.7', 'NTP stratum levels',
          'NTP organizes time sources into strata: stratum 0 are reference clocks such as GPS or atomic clocks, stratum 1 servers connect directly to them, and each further hop adds one, up to 15, with 16 meaning unsynchronized.',
          'explain why a server that synchronizes from a stratum 2 source is itself stratum 3',
          ['PTP grandmaster clock level', 'DNS hierarchy depth', 'Spanning tree cost'],
          'Each hop from the reference clock adds ONE stratum — lower numbers are closer to the source.',
          S.table(['Stratum', 'Source'], [('0', 'reference clock (GPS, atomic)'), ('1', 'synchronized directly to stratum 0'), ('2', 'synchronizes from stratum 1'), ('16', 'unsynchronized')], title='NTP strata', col_widths=[0.25, 0.75]),
          caption='NTP stratum numbers count the hops from the reference clock.')

    b.add('3.7', 'Precision Time Protocol (PTP)',
          'IEEE 1588 time synchronization that reaches sub-microsecond accuracy using hardware timestamping and a grandmaster clock, used where NTP\'s millisecond accuracy is not enough, such as financial trading and telecom.',
          'synchronize clocks to within microseconds for a high-frequency trading network',
          ['Network Time Protocol (NTP)', 'Network Time Security (NTS)', 'Syslog'],
          'Sub-MICROSECOND accuracy with hardware timestamps — NTP is accurate to milliseconds.',
          S.compare(('NTP', ['Millisecond accuracy', 'Software timestamps', 'General purpose']), ('PTP', ['Sub-microsecond accuracy', 'Hardware timestamps', 'Finance and telecom']), title='NTP vs PTP'),
          caption='PTP delivers far greater clock accuracy than NTP using hardware timestamping.')

    b.add('3.7', 'Network Time Security (NTS)',
          'An extension that secures NTP by using TLS to establish keys and then authenticating time packets, protecting synchronization from spoofing and tampering.',
          'protect time synchronization from being spoofed by authenticating the time source',
          ['Network Time Protocol (NTP) alone', 'Precision Time Protocol (PTP)', 'DNSSEC'],
          'It AUTHENTICATES time packets with keys from TLS — plain NTP trusts whatever answers.',
          S.steps([('Client contacts server', 'TLS key establishment'), ('Packets signed', 'cryptographic checks'), ('Spoofed time', 'rejected')], title='NTS', tones=['plain', 'blue', 'green']),
          caption='NTS authenticates NTP exchanges so spoofed time is rejected.')

    # ------------------------------------------------------------------------------------------ 3.8 network access
    b.add('3.8', 'Site-to-site VPN',
          'A VPN in which two gateways permanently connect whole networks across the Internet through an encrypted tunnel, typically IPsec, so users at each site communicate without running any VPN software.',
          'connect a branch office network to headquarters permanently without any software on user devices',
          ['A client-to-site VPN', 'A clientless VPN', 'A GRE tunnel without encryption'],
          'Gateway to GATEWAY and always on — users at either site never see the VPN.',
          S.steps([('Office A gateway', 'VPN device'), ('Encrypted tunnel', 'IPsec over the Internet'), ('Office B gateway', 'VPN device')], title='Site-to-site VPN', tones=['plain', 'primary', 'plain']),
          caption='A site-to-site VPN joins two networks through gateways using an encrypted tunnel.')

    b.add('3.8', 'Client-to-site VPN',
          'A remote-access VPN in which an individual device uses VPN client software to build an encrypted tunnel to the organization\'s VPN headend and gain access to internal resources.',
          'let an employee working from home reach internal servers securely from a laptop using VPN client software',
          ['A site-to-site VPN', 'A GRE tunnel', 'A captive portal'],
          'One DEVICE to the office network with client software — site-to-site joins whole networks.',
          S.steps([('Remote laptop', 'VPN client software'), ('Encrypted tunnel', 'across the Internet'), ('VPN headend', 'internal network access')], title='Client-to-site VPN', tones=['plain', 'primary', 'green']),
          caption='A client-to-site VPN lets a single device tunnel into the corporate network.')

    b.add('3.8', 'Split tunnel',
          'A VPN configuration in which only traffic destined for corporate networks goes through the tunnel while all other Internet traffic goes directly out the user\'s local connection, saving bandwidth but bypassing corporate inspection.',
          'send only company-bound traffic through the VPN while streaming and web browsing use the home connection directly',
          ['A full tunnel', 'A site-to-site VPN', 'A clientless VPN'],
          'ONLY corporate traffic uses the tunnel — a full tunnel sends everything and keeps it inspectable.',
          S.compare(('Split tunnel', ['Only corporate traffic tunneled', 'Less VPN load', 'Internet traffic uninspected']), ('Full tunnel', ['All traffic tunneled', 'Central inspection', 'More VPN load']), title='Tunnel modes'),
          caption='A split tunnel sends only corporate traffic through the VPN; other traffic goes direct.')

    b.add('3.8', 'Full tunnel',
          'A VPN configuration in which all of the client\'s traffic, including Internet browsing, goes through the tunnel to the organization, allowing consistent filtering and logging at the cost of extra bandwidth.',
          'force every packet from a remote laptop through the corporate firewall for inspection and logging',
          ['A split tunnel', 'A clientless VPN', 'A GRE tunnel'],
          'EVERYTHING goes through the tunnel — good for inspection, heavier on VPN capacity.',
          S.steps([('Remote laptop', 'all traffic tunneled'), ('Corporate firewall', 'inspects and logs'), ('Internet', 'reached via the office')], title='Full tunnel', tones=['plain', 'primary', 'blue']),
          caption='A full tunnel routes all client traffic through the VPN for consistent inspection.')

    b.add('3.8', 'Clientless VPN',
          'A VPN accessed through a web browser over HTTPS (SSL/TLS), giving access to specific web applications or resources through a portal without installing client software.',
          'give contractors browser-based access to a few internal web applications without installing any VPN software',
          ['A client-to-site VPN', 'A site-to-site VPN', 'A GRE tunnel'],
          'Just a BROWSER and HTTPS — limited to the resources the portal publishes.',
          S.facts([('Access method', 'web browser over HTTPS'), ('Installed software', 'none'), ('Scope', 'specific applications via a portal'), ('Good for', 'contractors, unmanaged devices')], title='Clientless VPN'),
          caption='A clientless VPN gives browser-based access to specific resources without client software.')

    b.add('3.8', 'IPsec tunnel mode',
          'An IPsec mode that encrypts and encapsulates the entire original IP packet inside a new one with a new header, used between gateways in site-to-site VPNs; transport mode encrypts only the payload between two hosts.',
          'protect the whole original packet, including its header, between two VPN gateways',
          ['IPsec transport mode', 'GRE without IPsec', 'TLS inspection'],
          'The WHOLE original packet is wrapped — transport mode protects just the payload host to host.',
          S.compare(('Tunnel mode', ['Entire packet encrypted', 'New outer IP header', 'Gateway to gateway']), ('Transport mode', ['Payload encrypted only', 'Original header kept', 'Host to host']), title='IPsec modes'),
          caption='IPsec tunnel mode wraps the entire original packet; transport mode protects only the payload.')

    b.add('3.8', 'Jump box (bastion host)',
          'A hardened, tightly controlled server that administrators connect to first and then use to reach protected devices, giving one monitored and authenticated entry point with session logging and MFA.',
          'give administrators one audited, MFA-protected entry point for managing devices in a protected network segment',
          ['A VPN concentrator', 'A honeypot', 'A syslog server'],
          'ONE hardened gateway for admin access — everything reaches the protected devices through it.',
          S.steps([('Administrator', 'authenticates with MFA'), ('Jump box', 'hardened, logs sessions'), ('Protected devices', 'managed from here only')], title='Jump box', tones=['plain', 'primary', 'green']),
          caption='A jump box is a hardened, logged entry point for administering protected devices.')

    b.add('3.8', 'Out-of-band management',
          'Managing a device over a separate path from production traffic, such as a console port reached through a console server or a dedicated management network, so it still works when the production network is down.',
          'reach a switch to repair it even though the production network is completely down',
          ['In-band management over SSH', 'SNMP polling', 'A jump box on the production LAN'],
          'A SEPARATE path from production — in-band management dies with the network it manages.',
          S.compare(('In-band', ['SSH or HTTPS over production', 'Needs the network up', 'Convenient day to day']), ('Out-of-band', ['Console port, console server', 'Works when the network is down', 'Dedicated management path']), title='Management paths'),
          caption='Out-of-band management uses a separate path so devices can be reached during outages.')

    b.add('3.8', 'REST API management',
          'Configuring and querying devices through a REST API using HTTP methods and structured data such as JSON, authenticated with tokens, which enables automation and integration without screen-scraping the CLI.',
          'automate configuration changes on many devices through authenticated HTTPS requests that return structured data',
          ['SNMP trap', 'Telnet', 'A console cable'],
          'Authenticated HTTPS plus JSON — built for AUTOMATION rather than typing at a prompt.',
          S.terminal(['PUT /api/v1/interfaces/gi1', 'Authorization: Bearer <token>', '{"description": "uplink", "enabled": true}'], title='REST API call'),
          caption='REST APIs let tools configure and query devices programmatically over HTTPS.')

    b.add('3.8', 'RADIUS',
          'A centralized AAA protocol (UDP 1812 for authentication and 1813 for accounting) used for network access such as Wi-Fi, VPN, and 802.1X, which encrypts only the password in its access request.',
          'authenticate Wi-Fi and VPN users centrally against a directory, with accounting records of their sessions',
          ['TACACS+', 'Kerberos', 'LDAP'],
          'Aimed at user NETWORK ACCESS — TACACS+ is aimed at device administration.',
          S.compare(('RADIUS', ['UDP 1812 and 1813', 'Encrypts the password only', 'Wi-Fi, VPN, 802.1X']), ('TACACS+', ['TCP 49', 'Encrypts the whole payload', 'Device administration']), title='RADIUS vs TACACS+'),
          caption='RADIUS provides centralized AAA for network access such as Wi-Fi, VPN, and 802.1X.')

    b.add('3.8', 'TACACS+',
          'A Cisco-originated AAA protocol on TCP port 49 that separates authentication, authorization, and accounting, encrypts the entire payload, and allows per-command authorization for device administrators.',
          'control which commands each network administrator may run on routers and switches',
          ['RADIUS', 'Kerberos', 'LDAP'],
          'Per-COMMAND authorization for administrators — RADIUS combines authentication and authorization.',
          S.facts([('Port', 'TCP 49'), ('Encryption', 'entire payload'), ('Strength', 'separate AAA, per-command rules'), ('Used for', 'administering network devices')], title='TACACS+'),
          caption='TACACS+ separates AAA and supports per-command authorization for device administrators.')

    b.add('3.8', 'Kerberos',
          'A ticket-based authentication protocol used by Active Directory (port 88) in which a key distribution center issues time-limited tickets for single sign-on, requiring clocks within about five minutes of each other.',
          'explain why domain sign-in fails on a computer whose clock is more than five minutes wrong',
          ['A DNS failure', 'An expired DHCP lease', 'A VLAN mismatch'],
          'TICKETS with a clock tolerance of about five minutes — wrong time breaks sign-in even with the right password.',
          S.steps([('User signs in', 'gets a TGT'), ('Asks for tickets', 'from the KDC'), ('Presents the ticket', 'to the service')], title='Kerberos', tones=['plain', 'blue', 'green']),
          caption='Kerberos issues time-limited tickets for single sign-on and depends on synchronized clocks.')

    b.add('3.8', 'Single sign-on (SSO)',
          'An arrangement where one authentication gives access to multiple systems, using protocols such as Kerberos, SAML, or OpenID Connect, which reduces password fatigue and centralizes access control.',
          'let employees sign in once and reach many internal and cloud applications without separate passwords',
          ['Multifactor authentication (MFA)', 'A shared account', 'Local authentication'],
          'ONE sign-in for many systems — MFA adds factors but does not reduce the number of logins.',
          S.steps([('User signs in once', 'to the identity provider'), ('Token issued', 'SAML, OIDC, or Kerberos'), ('Apps accept it', 'no further passwords')], title='Single sign-on', tones=['plain', 'blue', 'green']),
          caption='SSO lets one authentication grant access to many applications.')

    b.add('3.6', 'Traffic analysis',
          'Examining flow data from NetFlow, sFlow, or IPFIX, or packet captures, to see which hosts, applications, and protocols use bandwidth and when, so congestion, unusual transfers, and capacity needs can be identified.',
          'find out which hosts and applications are using the most WAN bandwidth during the afternoon slowdown',
          ['Performance monitoring', 'Availability monitoring', 'Configuration monitoring'],
          'WHO is using the bandwidth — performance monitoring tracks how the device or link itself is doing.',
          S.steps([('Devices export flows', 'NetFlow, sFlow, IPFIX'), ('Collector aggregates', 'hosts, apps, ports'), ('Top talkers shown', 'congestion explained')], title='Traffic analysis', tones=['plain', 'blue', 'green']),
          caption='Traffic analysis uses flow data to show which hosts and applications consume bandwidth.')

    b.add('3.6', 'Performance monitoring',
          'Continuously collecting metrics such as interface utilization, latency, packet loss, errors, CPU, and memory so trends against a baseline can be graphed and alerts raised before users are affected.',
          'graph interface utilization, processor load, and error counts over several weeks so trends and capacity needs show up',
          ['Traffic analysis', 'Availability monitoring', 'Network discovery'],
          'HOW HEALTHY and loaded a device or link is over time — availability monitoring only asks if it is up.',
          S.table(['Metric', 'Why it matters'], [('Utilization', 'capacity and congestion'), ('Latency and loss', 'user experience'), ('Errors and discards', 'cabling or duplex faults'), ('CPU and memory', 'device health')], title='Performance metrics', col_widths=[0.4, 0.6]),
          caption='Performance monitoring graphs utilization, latency, errors, and device load against a baseline.')

    b.add('3.7', 'Forward lookup zone',
          'A DNS zone holding records, such as A, AAAA, CNAME, and MX, that map names to addresses and other data; a reverse lookup zone maps addresses back to names with PTR records.',
          'host the records that turn names such as www into IP addresses for a company domain',
          ['Reverse lookup zone', 'Stub zone', 'Hosts file'],
          'NAME to ADDRESS — the reverse zone goes the other way with PTR records.',
          S.compare(('Forward zone', ['Name to address', 'A, AAAA, CNAME, MX', 'contoso.com']), ('Reverse zone', ['Address to name', 'PTR records', 'in-addr.arpa']), title='DNS zone types'),
          caption='A forward lookup zone maps names to addresses; a reverse zone maps addresses to names.')

    b.add('3.7', 'SOA record',
          'The start of authority record at the top of every DNS zone, naming the primary name server and the zone administrator and holding the serial number and the refresh, retry, expire, and minimum TTL timers that secondary servers use.',
          'find the DNS record that carries the zone serial number a secondary server compares to decide whether to refresh',
          ['NS record', 'PTR record', 'TXT record'],
          'The SERIAL number lives here — raise it after a change so secondaries refresh.',
          S.facts([('Serial', 'version of the zone'), ('Refresh', 'how often to check'), ('Retry', 'if a check fails'), ('Expire', 'when to stop answering')], title='SOA record fields'),
          caption='The SOA record holds the zone serial and the timers secondary servers use.')

    # ------------------------------------------------------------------------------------------ added 2026-11-03 (official-objective gaps)
    b.add('3.6', 'Network discovery (ad hoc and scheduled)',
          'Finding the devices on a network and recording what they are: an ad hoc discovery runs on demand, for example after a new subnet is added, while a scheduled discovery repeats automatically so new, moved, or rogue devices and topology changes show up in the monitoring system and the inventory.',
          'have the monitoring system automatically find the new switches and access points that were plugged in since last week',
          ['Performance monitoring', 'Traffic analysis', 'Port mirroring'],
          'Finds WHAT is on the network — ad hoc runs on demand, scheduled runs repeat so nothing new goes unnoticed.',
          S.compare(('Ad hoc discovery', ['Run on demand', 'After a change or incident', 'A one-time snapshot']), ('Scheduled discovery', ['Runs automatically', 'Catches new or rogue devices', 'Keeps inventory current']), title='Network discovery'),
          caption='Network discovery finds devices on demand (ad hoc) or on a schedule to keep the inventory current.')

    b.add('3.6', 'Configuration monitoring',
          'Watching device configurations for change: the system compares each running configuration with the approved baseline or the last backup, alerts on any difference, and keeps a history so unauthorized or accidental changes and configuration drift are caught and can be rolled back.',
          'be alerted when someone changes a router\'s running configuration outside an approved change window',
          ['Performance monitoring', 'Traffic analysis', 'Network discovery (ad hoc and scheduled)'],
          'Compares CONFIGURATIONS with the baseline — performance monitoring asks how loaded a device is, not what changed.',
          S.steps([('Approved baseline', 'golden configuration'), ('Compare', 'running versus baseline'), ('Alert', 'change or drift found')], title='Configuration monitoring', tones=['green', 'blue', 'amber']),
          caption='Configuration monitoring compares running configurations with the baseline and alerts on changes.')

    b.add('3.6', 'SNMP community string',
          'A shared, password-like text value that SNMPv1 and v2c managers present to read (and sometimes write) a device\'s data; it is sent in clear text and often left at defaults such as public and private, so it should be changed or replaced with SNMPv3.',
          'find the clear-text, password-like value an SNMPv2c manager must send before a switch will answer its polls',
          ['Management Information Base (MIB)', 'Object identifier (OID)', 'SNMP trap'],
          'A PASSWORD sent in clear text — SNMPv3 replaces it with real authentication and encryption.',
          S.facts([('Used by', 'SNMPv1 and v2c'), ('Acts like', 'a shared password'), ('Risk', 'sent in clear text'), ('Common defaults', 'public and private')], title='Community strings'),
          caption='SNMPv1 and v2c community strings act as clear-text passwords; SNMPv3 replaces them.')

    b.add('3.7', 'Reverse lookup zone',
          'A DNS zone that maps IP addresses back to hostnames using PTR records, stored under in-addr.arpa for IPv4 and ip6.arpa for IPv6; it supports logging, troubleshooting, and the reverse checks mail servers make.',
          'host the DNS zone that answers "which name belongs to 10.1.20.5?" for a whole address range',
          ['Forward lookup zone', 'Stub zone', 'Hosts file'],
          'ADDRESS to NAME with PTR records — the forward zone goes from name to address.',
          S.facts([('Direction', 'address to name'), ('Record type', 'PTR'), ('IPv4 domain', 'in-addr.arpa'), ('IPv6 domain', 'ip6.arpa')], title='Reverse lookup zone'),
          caption='A reverse lookup zone maps IP addresses back to hostnames using PTR records.')

    b.add('3.7', 'Primary and secondary DNS servers',
          'A primary DNS server holds the writable master copy of a zone, and one or more secondary servers keep read-only copies updated by zone transfers, which they request when the SOA serial number rises; secondaries add redundancy and spread the query load.',
          'keep a second DNS server holding a read-only copy of the company zone so lookups still work if the first server fails',
          ['A recursive resolver', 'A DNS forwarder', 'A root hint'],
          'Primary is the editable MASTER, secondary is a read-only COPY — the SOA serial tells it when to refresh.',
          S.steps([('Primary', 'writable master copy'), ('Zone transfer', 'when the serial rises'), ('Secondary', 'read-only copy')], title='Primary and secondary DNS', tones=['primary', 'amber', 'blue']),
          caption='A secondary DNS server holds a read-only copy of the primary zone, updated by zone transfer.')

    b.add('3.8', 'Console connection',
          'A direct, local management connection through a device\'s console port, using a rollover or USB console cable and terminal emulation software; it needs no IP address or working network, so it is used for first-time setup, password recovery, and out-of-band repair.',
          'give a brand-new switch its first configuration when it has no IP address and nothing is reachable over the network',
          ['SSH management', 'Web-based (GUI) management', 'REST API management'],
          'A CABLE to the console port works with no IP and no network — SSH, the GUI, and APIs all need the network up.',
          S.steps([('Laptop', 'terminal emulator'), ('Console cable', 'rollover or USB'), ('Switch console port', 'no IP needed')], title='Console connection', tones=['blue', 'amber', 'green']),
          caption='A console connection manages a device through a cable with no IP address or network needed.')

    b.add('3.8', 'Web-based (GUI) management',
          'Managing a device through a graphical web interface over HTTPS, which suits occasional changes and staff who avoid the command line, but should be limited to a management network, use HTTPS rather than HTTP, and have default credentials changed.',
          'let a small-office administrator change a router\'s Wi-Fi settings from a browser instead of typing commands',
          ['Console connection', 'REST API management', 'Out-of-band management'],
          'A BROWSER interface over HTTPS — fine for occasional changes, but automation needs an API instead.',
          S.facts([('Access', 'a browser over HTTPS'), ('Best for', 'occasional changes'), ('Harden', 'management network only'), ('Automation', 'use an API instead')], title='Web (GUI) management'),
          caption='A web GUI manages a device from a browser over HTTPS and should be restricted and hardened.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Monitoring: SNMP, logs, counters, and alerting', ['3.6'],
              'SNMPv1 and v2c send community strings (shared, password-like values) in clear text, while SNMPv3 adds authentication and encryption. Managers poll agents on UDP 161, and agents send traps on UDP 162 when something happens; a MIB is the database of manageable objects and an OID is the dotted numeric address of one of them. A SIEM goes beyond a syslog server by correlating events across many sources, and APIs and streaming telemetry return structured data without parsing the CLI. Network discovery finds devices on demand (ad hoc) or on a schedule, and configuration monitoring alerts when a running configuration differs from the baseline.\n\n'
              'Interface counters are clues: rising CRC errors mean corrupted frames from bad cabling, interference, or a duplex mismatch. Environmental sensors watch temperature, humidity, power, and leaks, anomaly-based alerts compare against the baseline instead of a fixed limit, and availability is measured in nines (99.99% allows about 53 minutes of downtime per year).')
    b.section('DHCP, DNS, and time services', ['3.7'],
              'DHCP leases through Discover, Offer, Request, and Acknowledge. A scope is the lease range, exclusions keep static addresses out of it, a reservation always gives one MAC the same address, options carry the gateway, DNS, and other settings, and a relay agent (IP helper) forwards broadcasts to a server on another subnet. In IPv6, SLAAC lets hosts build their own address from the router\'s prefix.\n\n'
              'DNS record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail servers with priority), TXT (SPF, DKIM, DMARC, verification), NS (authoritative servers), and PTR (reverse lookups). DNSSEC signs answers for authenticity, while DoH and DoT encrypt queries. Authoritative servers hold zone data (a primary holds the writable master copy and secondaries keep read-only copies by zone transfer) and recursive resolvers look answers up and cache them, which nslookup reports as non-authoritative; the hosts file is a local override. For time, NTP strata count hops from the reference clock, PTP gives sub-microsecond accuracy, and NTS authenticates NTP.')
    b.section('VPNs, remote access, and AAA', ['3.8'],
              'A site-to-site VPN joins two networks gateway to gateway, a client-to-site VPN lets one device tunnel in with client software, and a clientless VPN uses a browser portal for specific resources. A split tunnel sends only corporate traffic through the VPN, whereas a full tunnel sends everything for inspection; IPsec tunnel mode wraps the whole original packet and transport mode protects only the payload.\n\n'
              'For management, a console cable works with no IP address or network, a web GUI over HTTPS suits occasional changes, a jump box is a hardened, logged entry point, out-of-band management uses a separate path (such as a console server) that works when production is down, and REST APIs enable automation. For authentication, RADIUS suits user network access (UDP 1812 and 1813), TACACS+ suits device administration with per-command authorization (TCP 49), Kerberos issues time-limited tickets that need synchronized clocks, and SSO gives access to many systems from one sign-in.')
    b.section('Traffic analysis, performance monitoring, and DNS zones', ['3.6', '3.7'],
              'Traffic analysis uses flow data (NetFlow, sFlow, IPFIX) to show which hosts and applications use the bandwidth, while performance monitoring graphs utilization, latency, errors, CPU, and memory over time against a baseline. In DNS, a forward lookup zone maps names to addresses and a reverse zone maps addresses to names with PTR records; the SOA record at the top of each zone carries the serial number and the timers that secondary servers use to decide when to refresh.')
