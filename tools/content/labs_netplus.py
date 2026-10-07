"""New Network+ (N10-009) labs for the topics added in v225."""
from labs_lib import decision, scenario, sequence, terminal

C = 'core1'


def labs():
    out = []

    out.append(decision(
        'vlsm-subnet-sizing-decision', C, 'nd1', 'Intermediate', 9,
        'Size subnets with VLSM',
        'Carve one /24 into right-sized subnets using usable-host math.',
        'You have 192.168.10.0/24 to divide among three segments with different needs, using variable-length subnet masks. Remember that usable hosts equal 2 to the host bits minus 2.',
        [
            ('The server LAN needs about 100 hosts. Which mask fits it with the least waste?', ['/25 (126 usable hosts)', '/26 (62 usable hosts)', '/27 (30 usable hosts)', '/24 (254 usable hosts)'], 0,
             'A /25 has 7 host bits, so 128 addresses and 126 usable, enough for 100. A /26 only gives 62, and a /24 wastes space.'),
            ('The office LAN needs about 50 hosts. Which mask fits from the remaining space?', ['/26 (62 usable hosts)', '/27 (30 usable hosts)', '/28 (14 usable hosts)', '/25 (126 usable hosts)'], 0,
             'A /26 has 6 host bits, so 64 addresses and 62 usable, enough for 50 with a little growth room.'),
            ('A point-to-point link between two routers needs just two addresses. Which mask is the best fit?', ['/30 (2 usable hosts)', '/28 (14 usable hosts)', '/29 (6 usable hosts)', '/26 (62 usable hosts)'], 0,
             'A /30 has 2 host bits, so 4 addresses and 2 usable, exactly right for a two-router link.'),
        ],
        'VLSM sizes each subnet to its host count: find the smallest mask whose usable hosts (2^n - 2) cover the need, allocate the largest subnets first, and use /30 for two-device links.'))

    out.append(decision(
        'ipv6-address-types-decision', C, 'nd1', 'Intermediate', 8,
        'Identify IPv6 address types',
        'Recognize link-local, global unicast, unique local, and multicast IPv6 addresses by their prefixes.',
        'While reading a router\'s interface output, you see several IPv6 addresses and must say what each one is.',
        [
            ('Which address type is fe80::1a2b:3c4d:5e6f:7081?', ['Link-local, valid only on the local link', 'Global unicast, routable on the Internet', 'Unique local, private to an organization', 'Multicast'], 0,
             'fe80::/10 is the link-local range, configured automatically on every interface and never routed.'),
            ('Which address type is 2001:db8:10:1::25?', ['Global unicast, routable on the Internet', 'Link-local', 'Unique local', 'Loopback'], 0,
             'Global unicast addresses come from 2000::/3 and are publicly routable, like public IPv4 addresses.'),
            ('Which address type is fd12:3456:789a::1?', ['Unique local, the IPv6 equivalent of private space', 'Global unicast', 'Link-local', 'Multicast'], 0,
             'fc00::/7 (in practice fd00::/8) is unique local space, used inside an organization and not routed on the Internet.'),
            ('Which is ff02::1, and what does it replace from IPv4?', ['An all-nodes multicast address, replacing broadcast', 'A link-local unicast address replacing APIPA', 'An anycast address replacing NAT', 'A loopback address replacing localhost'], 0,
             'IPv6 has no broadcast; ff00::/8 multicast addresses, such as ff02::1 for all nodes on the link, do that job.'),
        ],
        'IPv6 address types are recognized by prefix: fe80::/10 link-local, 2000::/3 global unicast, fc00::/7 unique local, and ff00::/8 multicast, which replaces IPv4 broadcast.'))

    out.append(sequence(
        'dhcp-dora-lease-sequence', C, 'nd3', 'Beginner', 6,
        'Follow a DHCP lease from start to renewal',
        'Order the messages of a DHCP exchange, then the renewal.',
        'A new laptop joins the network and obtains its address from a DHCP server. Arrange the steps from first to last.',
        ['The client broadcasts a DHCP Discover', 'A DHCP server replies with an Offer containing an address and settings', 'The client sends a Request for the offered address', 'The server confirms with an Acknowledgment and the lease begins',
         'At 50 percent of the lease the client tries to renew with the same server', 'If that fails, at 87.5 percent the client tries to rebind with any server'],
        'DHCP leases follow Discover, Offer, Request, Acknowledge. The client then renews with its server at half the lease time and tries to rebind with any server at 87.5 percent if the renewal fails.'))

    out.append(terminal(
        'switch-duplex-mismatch-terminal', C, 'nd5', 'Intermediate', 10,
        'A slow link with CRC errors on a switch port',
        'Use a simulated switch CLI to find and fix a duplex mismatch.',
        'A user\'s PC is very slow and a file transfer keeps stalling. Port Gi1/0/14 is suspect. From privileged mode, inspect it and correct the setting. Type commands exactly, or use an accepted equivalent.',
        [
            ('Display the details and counters for interface GigabitEthernet1/0/14.', ['show interfaces gigabitethernet1/0/14', 'show interfaces gi1/0/14', 'show interface gi1/0/14', 'show int gi1/0/14'],
             'GigabitEthernet1/0/14 is up, line protocol is up\n  Half-duplex, 100Mb/s, media type is 10/100/1000BaseTX\n  Input queue: 0/75/0/0 (size/max/drops/flushes)\n     312 input errors, 288 CRC, 0 frame, 0 overrun\n     1520 late collision',
             'Use show interfaces with the interface name.'),
            ('Late collisions and CRC errors on half duplex point to a mismatch. Enter global configuration mode.', ['configure terminal', 'conf t'], 'Enter configuration commands, one per line.  End with CNTL/Z.', 'Use the configure terminal command.'),
            ('Select the interface to change.', ['interface gigabitethernet1/0/14', 'interface gi1/0/14', 'int gi1/0/14'], '', 'Use interface followed by the interface name.'),
            ('Let the port negotiate duplex with the PC.', ['duplex auto'], '', 'Use the duplex command with the auto option.'),
            ('Let the port negotiate speed as well.', ['speed auto'], '', 'Use the speed command with the auto option.'),
            ('Leave configuration mode.', ['end'], '', 'Return to privileged mode.'),
            ('Verify the interface again.', ['show interfaces gigabitethernet1/0/14', 'show interfaces gi1/0/14', 'show interface gi1/0/14', 'show int gi1/0/14'],
             'GigabitEthernet1/0/14 is up, line protocol is up\n  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX\n     0 input errors, 0 CRC, 0 frame, 0 overrun\n     0 late collision',
             'Use show interfaces again.'),
            ('Save the configuration so it survives a reboot.', ['copy running-config startup-config', 'copy run start', 'write memory', 'wr'], 'Destination filename [startup-config]?\nBuilding configuration...\n[OK]', 'Copy the running configuration to startup.'),
        ],
        [('show interfaces <name>', 'Status, speed, duplex, and error counters'), ('configure terminal', 'Enter global configuration mode'), ('interface <name>', 'Select an interface to configure'), ('duplex auto', 'Negotiate duplex automatically'),
         ('speed auto', 'Negotiate speed automatically'), ('copy running-config startup-config', 'Save the configuration')],
        'Half duplex at 100 Mb/s with CRC errors and late collisions is the signature of a duplex mismatch: one end is hard-coded while the other negotiates. Setting both speed and duplex to auto (or hard-coding both ends the same) clears it, the counters confirm the fix, and the change is saved to startup.'))

    out.append(terminal(
        'dhcp-relay-fix-terminal', C, 'nd5', 'Intermediate', 8,
        'A new VLAN\'s clients all get 169.254 addresses',
        'Add a DHCP relay (IP helper) on a router interface.',
        'VLAN 20 was just created and every client on it shows a 169.254.x.x address, while other VLANs work. The DHCP server is 10.0.0.5 on another subnet. Fix the router. Type commands exactly, or use an accepted equivalent.',
        [
            ('Enter global configuration mode.', ['configure terminal', 'conf t'], 'Enter configuration commands, one per line.  End with CNTL/Z.', 'Use the configure terminal command.'),
            ('Select the VLAN 20 gateway interface.', ['interface vlan 20', 'int vlan 20', 'interface vlan20'], '', 'Use interface followed by vlan 20.'),
            ('Forward DHCP broadcasts from this interface to the DHCP server at 10.0.0.5.', ['ip helper-address 10.0.0.5'], '', 'Use the ip helper-address command with the server address.'),
            ('Leave configuration mode.', ['end'], '', 'Return to privileged mode.'),
            ('Save the configuration.', ['copy running-config startup-config', 'copy run start', 'write memory', 'wr'], 'Destination filename [startup-config]?\nBuilding configuration...\n[OK]', 'Copy the running configuration to startup.'),
        ],
        [('configure terminal', 'Enter global configuration mode'), ('interface vlan <id>', 'Select a VLAN interface'), ('ip helper-address <server>', 'Relay DHCP broadcasts to a server'), ('show ip interface', 'Display interface IP settings'), ('copy running-config startup-config', 'Save the configuration')],
        'Routers do not forward broadcasts, so DHCP Discover messages from a new VLAN never reach a server on another subnet and clients fall back to APIPA. An ip helper-address on the VLAN\'s gateway interface converts them to unicast toward the DHCP server.'))

    out.append(terminal(
        'dns-record-types-terminal', C, 'nd3', 'Intermediate', 8,
        'Look up DNS record types with nslookup',
        'Query MX, AAAA, TXT, and PTR information from the command line.',
        'You are verifying a domain\'s DNS before a mail migration. Use nslookup to query specific record types. Type commands exactly, or use an accepted equivalent.',
        [
            ('Find the mail servers for example.com.', ['nslookup -type=mx example.com', 'nslookup -type=MX example.com', 'nslookup -q=mx example.com'],
             'example.com\tMX preference = 10, mail exchanger = mail1.example.com\nexample.com\tMX preference = 20, mail exchanger = mail2.example.com',
             'Use nslookup with the MX record type and the domain.'),
            ('Find the IPv6 address of www.example.com.', ['nslookup -type=aaaa www.example.com', 'nslookup -type=AAAA www.example.com', 'nslookup -q=aaaa www.example.com'],
             'Name:    www.example.com\nAddress:  2606:2800:220:1::1', 'Use nslookup with the AAAA record type and the name.'),
            ('Check the domain\'s TXT records for an SPF policy.', ['nslookup -type=txt example.com', 'nslookup -type=TXT example.com', 'nslookup -q=txt example.com'],
             'example.com\ttext =\n\t"v=spf1 include:_spf.example.com ~all"', 'Use nslookup with the TXT record type.'),
            ('Do a reverse lookup of the address 93.184.216.34.', ['nslookup 93.184.216.34'], 'Name:    www.example.com\nAddress:  93.184.216.34', 'Give nslookup the IP address to query its PTR record.'),
        ],
        [('nslookup -type=mx <domain>', 'Query mail exchanger records'), ('nslookup -type=aaaa <name>', 'Query IPv6 address records'), ('nslookup -type=txt <domain>', 'Query text records such as SPF'), ('nslookup <ip>', 'Reverse lookup (PTR record)'), ('ping', 'Test reachability only')],
        'Each record type answers a different question: MX lists mail servers with priority, AAAA gives IPv6 addresses, TXT carries data such as SPF policies, and a PTR record, queried by giving an IP address, maps it back to a name.'))

    out.append(scenario(
        'wifi-capacity-scenario', C, 'nd5', 'Advanced', 10,
        'Slow Wi-Fi in a crowded conference room',
        'Separate a coverage problem from a capacity problem before changing hardware.',
        'Wi-Fi in a conference room is unusably slow during all-hands meetings, although signal strength looks excellent. Work the ticket by choosing your action at each step.',
        ('Conference room Wi-Fi unusable during meetings', ['Reported by: Facilities', 'Symptom: very slow speeds and drops with about 150 devices present', 'Signal strength shows full bars; one access point serves the room']),
        {
            'start': ('What is the best first step?', [
                ('Check the controller for client count, channel utilization, and retries on that access point during a meeting', 'step2', True),
                ('Increase the access point\'s transmit power to the maximum', 'end_bad_power', False),
                ('Replace the access point with the same model immediately', 'end_bad_replace', False)]),
            'step2': ('The data shows 150 clients on one 2.4 GHz radio with very high channel utilization and many retries. What does this indicate?', [
                ('A capacity problem: too many clients sharing too little airtime', 'step3', True),
                ('A coverage problem: the signal is too weak', 'end_bad_coverage', False),
                ('A cabling problem on the access point\'s uplink', 'end_bad_cable', False)]),
            'step3': ('What is the best fix?', [
                ('Add access points to share the load, use 5 GHz and 6 GHz channels with band steering, and plan non-overlapping channels', 'end_good', True),
                ('Move the access point to the center of the room and leave it as the only one', 'end_bad_move', False)]),
            'end_good': ('END', True, 'High client counts with strong signal and busy airtime are a capacity problem. More access points on clean channels in the higher bands, with band steering, spread the load and restore performance.'),
            'end_bad_power': ('END', False, 'More power does not add airtime. Strong signal was never the problem, and louder transmit power can make interference with neighbors worse.'),
            'end_bad_replace': ('END', False, 'A like-for-like replacement has the same capacity limit, so the room would be slow again.'),
            'end_bad_coverage': ('END', False, 'Signal strength was already excellent, so adding coverage would not help; the airtime is exhausted.'),
            'end_bad_cable': ('END', False, 'A bad uplink would affect every client regardless of client count and would show on interface counters, not channel utilization.'),
            'end_bad_move': ('END', False, 'Repositioning a single access point cannot create the airtime that 150 clients need.'),
        },
        'Strong signal with slow speeds in a crowded space is a capacity problem, not coverage. Confirm it with client counts and channel utilization, then add access points and use cleaner, higher-capacity bands.'))

    out.append(decision(
        'cabling-and-media-selection-decision', C, 'nd1', 'Intermediate', 9,
        'Choose the right cable and connector',
        'Match three installation requirements to media, connectors, and standards.',
        'You are specifying cabling for three different links in a new building.',
        [
            ('A new desk drop must carry Gigabit Ethernet 85 meters from the wiring closet. What should be installed?', ['Cat 6 or Cat 5e UTP with RJ45 connectors, supporting 1000BASE-T', 'Single-mode fiber with SC connectors', 'RG-6 coaxial cable with F-type connectors', 'RJ11 telephone cable'], 0,
             'Twisted pair rated Cat 5e or better supports 1000BASE-T up to 100 meters and terminates with RJ45 connectors.'),
            ('Two buildings 8 km apart need a 10 Gb link. What should be used?', ['Single-mode fiber with 10GBASE-LR optics', 'Multimode fiber with 10GBASE-SR optics', 'Cat 6a UTP', 'Direct attach copper cable'], 0,
             '10GBASE-LR runs about 10 km over single-mode fiber. SR is for a few hundred meters of multimode, and copper is limited to 100 meters.'),
            ('A server must connect to the top-of-rack switch 2 meters away at 10 Gb with the lowest cost and power. What fits?', ['A direct attach (twinax) cable with SFP+ ends', 'A Cat 5 patch cable', 'Single-mode fiber with LC connectors and separate LR optics', 'A coaxial cable'], 0,
             'A direct attach cable has the transceivers built in and is the cheapest, lowest-power choice for short in-rack links.'),
        ],
        'Choose by distance, speed, and environment: twisted pair with RJ45 up to 100 m, multimode fiber with SR optics for hundreds of meters, single-mode with LR optics for kilometers, and direct attach cables for very short in-rack links.'))

    return out
