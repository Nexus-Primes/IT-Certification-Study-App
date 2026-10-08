"""AZ-802, domain ws4 (Implement and manage an on-premises and hybrid networking infrastructure): DNS and DHCP."""
import svg as S

DOMAIN = 'ws4'


def build(b):
    b.topics['4.1'] = ['AD-integrated zones', 'Record types', 'Zone transfers and delegation', 'Azure Private DNS and Private Resolver', 'DNS policies', 'DNSSEC trust anchors and NRPT', 'Cache locking']
    b.topics['4.2'] = ['Authorization', 'Leases and exclusions', 'Scope options', 'Failover modes', 'APIPA', 'Azure private IPs', 'IPAM']

    # ------------------------------------------------------------------------------------------ 4.1
    b.add('4.1', 'AD-integrated DNS zones',
          'Zones stored in Active Directory instead of a zone file, so every DNS server on a domain controller can accept updates and the data replicates with the directory; the replication scope can be the forest, the domain, or all domain controllers.',
          'store zone data in the directory so any DNS server on a domain controller can accept changes without zone transfers',
          ['Secondary zone', 'Stub zone', 'File-based primary zone'],
          'Replicates WITH the directory — multi-master, no zone transfers, secure updates available.',
          S.compare(('AD-integrated zone', ['Stored in Active Directory', 'Multi-master updates', 'Secure dynamic updates']), ('File-based zone', ['Stored in a zone file', 'One primary server', 'Zone transfers to copy']), title='Where the zone lives'),
          caption='AD-integrated zones are stored in the directory and replicate with it.')

    b.add('4.1', 'Secure dynamic updates',
          'A setting on AD-integrated zones that lets only authenticated domain members create or change their own DNS records, so unknown machines cannot register or overwrite names.',
          'stop unauthenticated machines from registering or overwriting names in the zone',
          ['DNS scavenging and aging', 'DNSSEC', 'Zone transfer restrictions'],
          'Only AUTHENTICATED members update their own records — available on AD-integrated zones.',
          S.steps([('Client updates DNS', 'registers its name'), ('Server checks identity', 'Kerberos authentication'), ('Allowed or refused', 'only for its own record')], title='Secure dynamic update', tones=['plain', 'blue', 'green']),
          caption='Secure dynamic updates accept record changes only from authenticated owners.')

    b.add('4.1', 'A and AAAA records',
          'The records that map a host name to an IPv4 address (A) or an IPv6 address (AAAA).',
          'create the record that points a server name to its IPv6 address',
          ['CNAME record', 'PTR records and reverse lookup zones', 'SRV records'],
          'A is IPv4, AAAA is IPv6 — four As for four times the bits.',
          S.table(['Record', 'Maps a name to'], [('A', 'an IPv4 address'), ('AAAA', 'an IPv6 address'), ('CNAME', 'another name'), ('PTR', 'a name, from an IP')], title='Common DNS records', col_widths=[0.3, 0.7]),
          caption='A records map names to IPv4 addresses and AAAA records map names to IPv6 addresses.')

    b.add('4.1', 'CNAME record',
          'An alias record that points one name to another canonical name, so the alias follows if the target\'s address changes; it cannot coexist with other records of the same name and cannot be placed at the zone apex.',
          'give a web server a second friendly name that always follows the original name\'s address',
          ['A and AAAA records', 'PTR records and reverse lookup zones', 'SRV records'],
          'An ALIAS to another name — never at the zone apex.',
          S.steps([('www.contoso.com', 'CNAME'), ('web01.contoso.com', 'A record'), ('10.0.1.20', 'address returned')], title='CNAME resolution', tones=['plain', 'blue', 'green']),
          caption='A CNAME points one name to another, so changes to the target\'s address follow automatically.')

    b.add('4.1', 'PTR records and reverse lookup zones',
          'Reverse lookup zones, such as 1.0.10.in-addr.arpa, hold PTR records that map an IP address back to a host name, used by logging, mail servers, and troubleshooting tools.',
          'resolve an IP address in a log file back to the name of the machine that owns it',
          ['A and AAAA records', 'CNAME record', 'SRV records'],
          'PTR lives in an in-addr.arpa zone — the REVERSE of an A record.',
          S.terminal(['nslookup 10.0.1.20', 'Server:  dc1.contoso.com', 'Name:    web01.contoso.com', 'Address: 10.0.1.20'], title='Command Prompt'),
          caption='PTR records in reverse lookup zones map IP addresses back to names.')

    b.add('4.1', 'SRV records',
          'Service records that name the host and port of a service, such as domain controllers, Kerberos, or LDAP, so clients can locate a service by querying DNS.',
          'publish which servers and ports provide a directory service so clients can find them through DNS',
          ['A and AAAA records', 'CNAME record', 'PTR records and reverse lookup zones'],
          'Names a HOST and a PORT for a service — how clients find domain controllers.',
          S.facts([('Service', '_ldap._tcp'), ('Priority and weight', 'choose between servers'), ('Port', '389'), ('Target', 'dc1.contoso.com')], title='SRV record fields'),
          caption='SRV records name the host and port that provide a service.')

    b.add('4.1', 'SOA record',
          'The start of authority record that names the primary server and holds the zone serial number and refresh, retry, expire, and minimum TTL values that secondary servers use to stay current.',
          'find the value a secondary server compares to decide whether it must fetch an updated copy of the zone',
          ['A and AAAA records', 'CNAME record', 'SRV records'],
          'The SERIAL number decides when a secondary refreshes — raise it after a change.',
          S.facts([('Serial', 'version of the zone'), ('Refresh', 'how often to check'), ('Retry', 'if a check fails'), ('Expire', 'when to stop answering')], title='SOA record fields'),
          caption='The SOA record holds the zone serial and the timers that control secondary refresh.')

    b.add('4.1', 'Zone transfer restrictions',
          'Limiting which servers may request a copy of a zone, either to servers listed as name servers or to specific IP addresses, because an open zone transfer exposes every record to anyone who asks.',
          'allow only the designated secondary servers to copy a primary zone\'s records',
          ['Secure dynamic updates', 'Disabling recursion', 'DNSSEC'],
          'An OPEN zone transfer hands every record to anyone — restrict it to listed servers.',
          S.steps([('Secondary asks', 'for a zone copy'), ('Primary checks list', 'name servers only'), ('Copy sent or refused', 'unlisted servers denied')], title='Zone transfer', tones=['plain', 'blue', 'amber']),
          caption='Zone transfers should be restricted to the servers that are meant to hold a copy.')

    b.add('4.1', 'Root hints',
          'A list of the Internet\'s root name servers that a DNS server uses to start recursive resolution when no forwarder is configured, or when forwarders do not answer.',
          'let a DNS server resolve public names by starting at the top of the DNS hierarchy when it has no forwarder',
          ['Zone delegation', 'Stub zone', 'Secondary zone'],
          'The START of recursion — used when there is no forwarder to ask.',
          S.steps([('Root servers', 'know the TLD servers'), ('TLD servers', 'know the domain'), ('Domain servers', 'give the answer')], title='Recursion from the root', tones=['blue', 'plain', 'green']),
          caption='Root hints let a DNS server begin recursive resolution at the root servers.')

    b.add('4.1', 'Zone delegation',
          'Handing authority for a subdomain to other name servers by adding NS records, and glue address records where needed, in the parent zone.',
          'let another team\'s name servers manage the dev subdomain of the company domain',
          ['Root hints', 'DNS forwarding and conditional forwarding', 'Stub zone'],
          'NS records in the PARENT zone point to who is authoritative for the child.',
          S.steps([('contoso.com zone', 'parent'), ('NS record for dev', 'points to dev servers'), ('dev.contoso.com', 'managed elsewhere')], title='Delegation', tones=['blue', 'primary', 'green']),
          caption='Zone delegation uses NS records to give another set of servers authority for a subdomain.')

    b.add('4.1', 'Azure Private DNS zones',
          'Azure DNS zones that resolve only inside linked virtual networks, with optional auto-registration of VM records, so Azure workloads can resolve each other\'s names without running DNS servers.',
          'resolve VM names inside Azure virtual networks without managing DNS servers, with VM records created automatically',
          ['Azure DNS public zones', 'Azure DNS Private Resolver', 'Zone delegation'],
          'LINK the zone to a virtual network — auto-registration creates the VM records.',
          S.steps([('Private DNS zone', 'contoso.internal'), ('Linked to a VNet', 'auto-registration on'), ('VM names resolve', 'records created for you')], title='Private DNS zone', tones=['blue', 'primary', 'green']),
          caption='Azure Private DNS zones resolve names inside linked virtual networks.')

    b.add('4.1', 'Azure DNS Private Resolver',
          'A managed service with an inbound endpoint that lets on-premises clients query Azure private zones and an outbound endpoint with forwarding rules that lets Azure VMs resolve on-premises names, with no DNS server VMs to run.',
          'let on-premises clients resolve names in Azure private zones and Azure VMs resolve on-premises names without any DNS server VMs',
          ['Azure Private DNS zones', 'Azure DNS public zones', 'Azure Traffic Manager'],
          'INBOUND endpoint for on-premises queries, OUTBOUND rules for Azure queries — all managed.',
          S.compare(('Inbound endpoint', ['On-premises asks Azure', 'Resolves private zones', 'Gets a private IP']), ('Outbound endpoint', ['Azure asks on-premises', 'Uses forwarding rules', 'Conditional forwarding']), title='Private Resolver'),
          caption='The Private Resolver bridges on-premises and Azure name resolution with managed endpoints.')

    b.add('4.1', 'Private endpoint DNS zone (privatelink)',
          'When a storage account or similar service uses a private endpoint, its public name is made to resolve to the endpoint\'s private IP through a privatelink zone, such as privatelink.file.core.windows.net, linked to the network or forwarded from on premises.',
          'make a storage account\'s regular name resolve to a private address inside the virtual network',
          ['Azure DNS public zones', 'Zone delegation', 'Root hints'],
          'The CNAME chain ends in a privatelink zone — forward that zone from on premises too.',
          S.steps([('mystore.file.core...', 'public name'), ('privatelink zone', 'A record, private IP'), ('Traffic stays private', 'over the endpoint')], title='Private endpoint DNS', tones=['plain', 'blue', 'green']),
          caption='A privatelink zone makes a service\'s public name resolve to its private endpoint address.')

    b.add('4.1', 'Geo-location DNS policy',
          'A DNS policy that returns different answers depending on the client\'s subnet or location, using zone scopes, so users are directed to the nearest datacenter.',
          'answer the same name with a nearby server\'s address for each region\'s clients',
          ['DNS query filtering policy', 'Root hints', 'Zone delegation'],
          'Different ANSWERS by client location — built from zone scopes and client subnets.',
          S.flow_split(('Query for app.contoso.com',), [('Client in Europe', 'returns EU server'), ('Client in US', 'returns US server')], title='Geo-location policy', tones=['blue', 'green']),
          caption='A geo-location policy answers the same name differently by client location.')

    b.add('4.1', 'DNS query filtering policy',
          'A DNS policy that blocks or ignores queries by criteria such as the client subnet, the queried domain, or the time of day, for example to stop lookups of known malicious domains.',
          'refuse lookups for a list of known malicious domains on the company\'s DNS servers',
          ['Geo-location DNS policy', 'Zone transfer restrictions', 'DNS cache locking'],
          'BLOCKS or ignores queries that match criteria — a security use of DNS policies.',
          S.steps([('Query arrives', 'bad-domain.example'), ('Policy matches', 'blocked domain list'), ('Query refused', 'no answer returned')], title='Query filtering', tones=['plain', 'amber', 'red']),
          caption='A query filtering policy blocks lookups that match its criteria.')

    b.add('4.1', 'DNSSEC trust anchor',
          'The public key or DS record that a validating DNS server trusts as the starting point to verify the digital signatures on signed zones; without it, signed answers cannot be validated.',
          'give a validating resolver the key it needs to confirm that signed answers really come from the zone owner',
          ['Name Resolution Policy Table (NRPT)', 'DNS cache locking', 'Zone transfer restrictions'],
          'The key the resolver already TRUSTS — signatures are checked against it.',
          S.steps([('Trust anchor', 'trusted key'), ('Zone signed', 'DNSKEY and RRSIG'), ('Answer validated', 'or rejected')], title='DNSSEC validation', tones=['blue', 'plain', 'green']),
          caption='A trust anchor is the trusted key from which DNSSEC signatures are validated.')

    b.add('4.1', 'Name Resolution Policy Table (NRPT)',
          'A Group Policy table on clients that sets how each namespace is resolved, such as which DNS servers to use and whether DNSSEC validation is required, applied by namespace or suffix.',
          'require DNSSEC-validated answers for one company namespace on all domain clients through policy',
          ['DNSSEC trust anchor', 'DNS policies (split-brain DNS)', 'Group Policy preferences'],
          'A CLIENT-side table by namespace — DNS policies live on the server.',
          S.table(['Namespace', 'Setting'], [('.contoso.com', 'require DNSSEC'), ('.corp.local', 'use internal DNS'), ('.fabrikam.com', 'use partner DNS')], title='NRPT entries', col_widths=[0.5, 0.5]),
          caption='The NRPT tells clients how to resolve each namespace and whether to validate DNSSEC.')

    b.add('4.1', 'DNS cache locking',
          'A DNS server setting that prevents cached records from being overwritten until a set percentage of their time to live has passed, which reduces the chance that forged data replaces a valid cached record.',
          'reduce the chance that forged data overwrites a record a DNS server has already cached',
          ['DNS scavenging and aging', 'Disabling recursion', 'DNSSEC trust anchor'],
          'LOCKS cached records for part of their TTL — a defense against cache poisoning.',
          S.steps([('Record cached', 'TTL starts'), ('Update arrives', 'inside the lock'), ('Overwrite refused', 'cache stays valid')], title='Cache locking', tones=['blue', 'amber', 'green']),
          caption='Cache locking stops cached records being overwritten during part of their TTL.')

    b.add('4.1', 'Disabling recursion',
          'Turning off recursive queries on a DNS server that is only authoritative for its own zones, so outside clients cannot use it to resolve arbitrary names or amplify attacks.',
          'stop a public-facing authoritative name server from resolving arbitrary Internet names for outside clients',
          ['DNS cache locking', 'Zone transfer restrictions', 'Root hints'],
          'AUTHORITATIVE-only servers should not recurse — it blocks resolver abuse and amplification.',
          S.compare(('Recursion on', ['Resolves any name', 'For internal clients', 'Exposed if public']), ('Recursion off', ['Answers own zones only', 'For public servers', 'Reduces abuse']), title='Recursion setting'),
          caption='Authoritative-only DNS servers should have recursion disabled.')

    # ------------------------------------------------------------------------------------------ 4.2
    b.add('4.2', 'DHCP server authorization',
          'A domain-joined Windows DHCP server must be authorized in Active Directory with Add-DhcpServerInDC before it leases addresses, which prevents an unauthorized server from handing out leases.',
          'keep a newly installed DHCP server from giving out leases until an administrator approves it in the directory',
          ['DHCP scopes', 'DHCP policies', 'DHCP reservations'],
          'Unauthorized servers stop leasing — a safeguard against ROGUE Windows DHCP servers.',
          S.steps([('Install DHCP role', 'server starts quiet'), ('Authorize in AD', 'Add-DhcpServerInDC'), ('Leases are issued', 'scopes activated')], title='Authorization', tones=['plain', 'blue', 'green']),
          caption='A Windows DHCP server must be authorized in AD before it hands out leases.')

    b.add('4.2', 'DHCP lease duration',
          'How long a client may use an address before renewing; clients try to renew at 50 percent of the lease and again at 87.5 percent, and short leases suit guest networks where devices come and go.',
          'reduce address exhaustion on a guest network where devices connect for only a short time',
          ['DHCP exclusion range', 'DHCP reservations', 'DHCP superscope'],
          'SHORT leases for transient devices — clients renew at 50% and again at 87.5%.',
          S.steps([('Lease granted', 'full duration'), ('50% elapsed', 'renew attempt'), ('87.5% elapsed', 'try any server')], title='Lease renewal', tones=['blue', 'plain', 'amber']),
          caption='Shorter leases free addresses faster; clients renew at 50% and 87.5% of the lease.')

    b.add('4.2', 'DHCP exclusion range',
          'A block of addresses inside a scope that the server never hands out, used for devices configured with static addresses so leases cannot collide with them.',
          'keep a block of addresses inside a scope from being leased because servers are configured with them manually',
          ['DHCP reservations', 'DHCP scope options', 'DHCP policies'],
          'EXCLUDED addresses are never leased — reservations are leased to ONE specific device.',
          S.layers([('Scope range', '10.0.1.10 to 10.0.1.250', 'blue'), ('Exclusion', '10.0.1.10 to 10.0.1.30', 'red'), ('Leased', '10.0.1.31 to 10.0.1.250', 'green')], title='Exclusion range'),
          caption='An exclusion range removes addresses from a scope so static devices never collide.')

    b.add('4.2', 'DHCP scope options',
          'Settings delivered with a lease, such as option 003 (default gateway), 006 (DNS servers), and 015 (DNS domain name), which can be set per scope, per server, or per reservation.',
          'hand out the default gateway and DNS server addresses with every lease for one subnet',
          ['DHCP exclusion range', 'DHCP lease duration', 'DHCP relay agent'],
          '003 gateway, 006 DNS, 015 domain name — scope-level options override server-level ones.',
          S.table(['Option', 'Delivers'], [('003', 'default gateway (router)'), ('006', 'DNS servers'), ('015', 'DNS domain name')], title='Common options', col_widths=[0.25, 0.75]),
          caption='DHCP options such as 003, 006, and 015 deliver the gateway, DNS servers, and domain name.')

    b.add('4.2', 'DHCP superscope',
          'A grouping of several scopes on one physical network, used when multiple IP subnets share a segment, so a server can serve them together.',
          'serve two IP subnets that share one physical network segment from a single administrative group of scopes',
          ['DHCP scopes', 'DHCP relay agent', 'DHCP policies'],
          'GROUPS scopes for a multinetted segment — a legacy design tool.',
          S.hub(('Superscope',), [('Scope 10.0.1.0', 'subnet one'), ('Scope 10.0.2.0', 'subnet two')], title='Superscope'),
          caption='A superscope groups scopes that serve multiple subnets on one physical segment.')

    b.add('4.2', 'DHCP split-scope',
          'An older redundancy approach in which two DHCP servers each hold part of the same scope, commonly 80 percent on the primary and 20 percent on the other, with no replication of leases between them.',
          'give a subnet a second DHCP server by dividing the addresses between two servers that do not share lease data',
          ['DHCP load-balance mode', 'DHCP hot standby mode', 'DHCP superscope'],
          'Each server owns a SHARE of the addresses — failover shares the lease database instead.',
          S.compare(('Split scope', ['Addresses divided 80/20', 'No lease replication', 'Older approach']), ('DHCP failover', ['Whole scope on both', 'Leases replicate', 'Preferred today']), title='Split scope vs. failover'),
          caption='A split scope divides addresses between servers; DHCP failover shares the whole scope.')

    b.add('4.2', 'DHCP load-balance mode',
          'A DHCP failover mode in which two servers both answer clients and share a scope, 50/50 by default, and either one can serve all clients if its partner fails.',
          'have two DHCP servers share the same scope and both answer clients during normal operation',
          ['DHCP hot standby mode', 'DHCP split-scope', 'DHCP relay agent'],
          'ACTIVE/ACTIVE — both answer clients, 50:50 by default.',
          S.flow_split(('Scope shared', 'one replicated database'), [('DHCP server 1', 'answers 50%'), ('DHCP server 2', 'answers 50%')], title='Load-balance mode', tones=['green', 'green']),
          caption='In load-balance mode both DHCP servers answer clients and share the scope.')

    b.add('4.2', 'DHCP hot standby mode',
          'A DHCP failover mode in which one server is active and a partner stands by, holding a reserved share of the addresses (5 percent by default) and taking over when the active server fails; suited to a hub-and-spoke design.',
          'keep a second DHCP server idle at a disaster recovery site until the main one fails',
          ['DHCP load-balance mode', 'DHCP split-scope', 'DHCP policies'],
          'ACTIVE/PASSIVE — the standby holds a small RESERVED share of addresses.',
          S.flow_split(('Scope shared', 'one replicated database'), [('Active server', 'answers clients'), ('Standby server', '5% reserve')], title='Hot standby mode', tones=['green', 'plain']),
          caption='In hot standby mode one DHCP server answers clients and a partner takes over on failure.')

    b.add('4.2', 'DHCP backup and restore',
          'Backup-DhcpServer saves the DHCP configuration and lease database to a folder, and Restore-DhcpServer returns a server to that state; the DHCP service also makes automatic backups every 60 minutes.',
          'return a rebuilt DHCP server to its previous scopes, options, and leases from saved files',
          ['DHCP server authorization', 'DHCP failover modes', 'DHCP policies'],
          'Backup-DhcpServer and Restore-DhcpServer cover config AND leases.',
          S.terminal(['Backup-DhcpServer -Path D:\\DhcpBackup', 'Restore-DhcpServer -Path D:\\DhcpBackup', 'Restart-Service DHCPServer', 'Scopes and leases restored'], title='Windows PowerShell'),
          caption='Backup-DhcpServer and Restore-DhcpServer save and restore DHCP settings and leases.')

    b.add('4.2', 'DHCP Name Protection',
          'A DHCP server feature that stops a non-Windows device from taking over a DNS name already registered by another computer, by using DHCID records to track which client owns a name.',
          'prevent a device that is not a Windows computer from claiming a DNS name another machine already registered',
          ['Secure dynamic updates', 'DNS scavenging and aging', 'DHCP server authorization'],
          'DHCID records prove who OWNS a name — it blocks name squatting.',
          S.steps([('Client A registers', 'name and DHCID'), ('Device B asks for it', 'same name'), ('Name protected', 'B is refused')], title='Name Protection', tones=['blue', 'amber', 'green']),
          caption='Name Protection prevents one DHCP client from taking a DNS name that another already owns.')

    b.add('4.2', 'APIPA addresses (169.254.0.0/16)',
          'The Automatic Private IP Addressing range a Windows client assigns itself when it cannot reach a DHCP server, allowing only local-subnet communication; seeing one usually means DHCP failed.',
          'recognize the self-assigned address a workstation shows when it never received a lease',
          ['DHCP lease duration', 'DHCP reservations', 'Non-overlapping IP planning'],
          '169.254.x.x means NO lease was obtained — check DHCP, relay, and the network path.',
          S.terminal(['ipconfig', 'Autoconfiguration IPv4 Address . : 169.254.12.7', 'Subnet Mask  . . . . . . . . . . : 255.255.0.0', 'Default Gateway . . . . . . . . . :'], title='Command Prompt'),
          caption='A 169.254.x.x address means the client could not get a DHCP lease.')

    b.add('4.2', 'Static private IP in Azure',
          'A VM\'s network interface can be given a fixed private IP in Azure itself, which keeps the operating system on DHCP; setting a static address inside the guest instead can break connectivity.',
          'give an Azure VM a fixed private address without setting it by hand inside the operating system',
          ['DHCP reservations', 'Public IP address', 'Azure Load Balancer'],
          'Set it on the NETWORK INTERFACE in Azure — leave the guest on DHCP.',
          S.compare(('In Azure (correct)', ['NIC private IP set to static', 'Guest stays on DHCP', 'Address survives restarts']), ('Inside the guest', ['Manual static address', 'Can break connectivity', 'Not recommended']), title='Fixing a private IP'),
          caption='Fix an Azure VM\'s private address on its network interface and leave the guest on DHCP.')

    b.add('4.2', 'IP Address Management (IPAM)',
          'A Windows Server feature that discovers DHCP and DNS servers, tracks IP address use across scopes and subnets, and lets you manage them and audit changes from one console.',
          'see address utilization across every DHCP scope and DNS server from a single console',
          ['DHCP scopes', 'Server Manager remote management', 'Windows Admin Center deployment modes'],
          'Tracks and manages address space ACROSS servers — not a DHCP server itself.',
          S.hub(('IPAM server',), [('DHCP servers', 'scopes, leases'), ('DNS servers', 'zones, records'), ('Audit', 'who changed what')], title='IPAM'),
          caption='IPAM discovers, tracks, and manages IP addresses across DHCP and DNS servers.')

    b.add('4.2', 'Non-overlapping IP planning',
          'Hybrid networks joined by VPN or ExpressRoute need address ranges that do not overlap between on-premises and Azure virtual networks, because overlapping ranges cannot be routed and force a renumbering.',
          'connect an on-premises network to an Azure virtual network when both unexpectedly use 10.0.0.0/16',
          ['DHCP relay agent', 'Static private IP in Azure', 'APIPA addresses (169.254.0.0/16)'],
          'Plan DISTINCT ranges before connecting — overlaps cannot be routed.',
          S.table(['Network', 'Range'], [('On premises', '10.0.0.0/16'), ('Azure hub VNet', '10.1.0.0/16'), ('Azure spoke VNet', '10.2.0.0/16')], title='Non-overlapping plan', col_widths=[0.5, 0.5]),
          caption='Hybrid networks need non-overlapping address ranges so traffic can be routed.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('DNS zones, records, and delegation', ['4.1'],
              'AD-integrated zones live in the directory, replicate with it (forest, domain, or all-DC scope), and support secure dynamic updates so only authenticated members change their own records. File-based zones use zone transfers, which should be restricted to listed servers. Know the record types: A (IPv4), AAAA (IPv6), CNAME (alias, never at the apex), PTR (reverse lookup, in in-addr.arpa zones), SRV (host and port of a service), and the SOA whose serial triggers secondary refresh. Root hints start recursion when there is no forwarder, and zone delegation hands a subdomain to other servers with NS records.\n\n'
              'Hardening and policy: disable recursion on authoritative-only servers, enable cache locking, use DNS policies for geo-location answers and query filtering, sign zones with DNSSEC (clients need a trust anchor, and the NRPT can require validation per namespace).')
    b.section('DNS in a hybrid environment', ['4.1'],
              'Azure Private DNS zones resolve names inside linked virtual networks and can auto-register VM records. The Azure DNS Private Resolver bridges the two worlds: its inbound endpoint lets on-premises clients query Azure private zones, and its outbound endpoint with forwarding rules lets Azure VMs resolve on-premises names, replacing DNS server VMs. Services that use private endpoints rely on a privatelink zone so the public name resolves to the private IP, and on premises you forward that zone to Azure.')
    b.section('DHCP design, resilience, and troubleshooting', ['4.2'],
              'A domain-joined DHCP server must be authorized in AD. Scopes carry exclusion ranges (for static devices), reservations (for specific devices), and options such as 003 gateway, 006 DNS, and 015 domain name; shorter leases suit guest networks, and clients renew at 50% and 87.5% of the lease. A superscope groups scopes on one segment. For resilience prefer DHCP failover: load-balance mode (active/active, 50:50 by default) or hot standby (active/passive with a small reserved share) instead of an 80/20 split scope. Back up with Backup-DhcpServer, protect names with Name Protection, and manage address space with IPAM.\n\n'
              'In hybrid networks, a 169.254.x.x address means no lease was received, an Azure VM\'s static private IP is set on its network interface (not in the guest), and on-premises and Azure ranges must not overlap.')
