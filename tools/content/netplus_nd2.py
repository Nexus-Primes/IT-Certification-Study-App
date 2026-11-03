"""Network+ (N10-009), domain nd2 (Networking Implementations): routing, switching, wireless, and physical installation."""
import svg as S

DOMAIN = 'nd2'


def build(b):
    b.objective('2.5', 'Physical installations', ['MDF and IDF', 'Racks and airflow', 'UPS and PDU', 'Redundant power', 'Temperature and fire suppression'])
    b.topics['2.2'] = ['Static routes', 'OSPF', 'Administrative distance', 'QoS', 'Traffic shaping', 'BGP and EIGRP', 'Longest prefix match', 'NAT and PAT', 'FHRP']
    b.topics['2.3'] = ['VLANs', '802.1Q trunking', 'STP', 'Port security', 'LACP', 'PoE', 'Port mirroring', 'BPDU guard', 'MAC table']
    b.topics['2.4'] = ['SSID', 'WPA3', 'Bands and channels', 'Antennas', 'Site surveys', '802.11 standards', 'MIMO', 'Roaming']

    # ------------------------------------------------------------------------------------------ 2.1 devices
    b.add('2.1', 'Hub',
          'A Layer 1 device that repeats every incoming signal out all other ports, with no knowledge of addresses, so all connected devices share one collision domain and operate half duplex.',
          'identify the device that repeats every incoming signal to all other ports regardless of the destination',
          ['Layer 2 switch', 'Bridge', 'Router'],
          'It just REPEATS signals — a switch learns MAC addresses and sends frames only where needed.',
          S.compare(('Hub', ['Layer 1, repeats everything', 'One collision domain', 'Half duplex']), ('Switch', ['Layer 2, learns MAC addresses', 'Collision domain per port', 'Full duplex']), title='Hub vs switch'),
          caption='A hub repeats signals to every port, creating one shared collision domain.')

    # ------------------------------------------------------------------------------------------ 2.2 routing
    b.add('2.2', 'BGP (Border Gateway Protocol)',
          'A path-vector exterior routing protocol (TCP 179) that exchanges routes between autonomous systems, such as an organization and its ISPs; eBGP runs between ASes and iBGP within one.',
          'exchange routes between your network and an ISP that belongs to a separate autonomous system',
          ['OSPF (Open Shortest Path First)', 'RIP', 'EIGRP'],
          'The routing protocol BETWEEN autonomous systems — OSPF, RIP, and EIGRP run inside one.',
          S.steps([('Your AS', 'internal routing'), ('eBGP session', 'TCP 179 to the ISP'), ('ISP AS', 'Internet routes learned')], title='BGP between autonomous systems', tones=['plain', 'primary', 'blue']),
          caption='BGP exchanges routes between autonomous systems and runs the Internet\'s routing.')

    b.add('2.2', 'EIGRP',
          'A Cisco-developed advanced distance-vector routing protocol that builds its metric from bandwidth and delay, converges quickly, supports unequal-cost load balancing, and has an administrative distance of 90.',
          'identify the Cisco-originated interior routing protocol that uses bandwidth and delay in its metric',
          ['OSPF (Open Shortest Path First)', 'RIP', 'BGP'],
          'Bandwidth plus delay in a Cisco-developed protocol — RIP counts hops and OSPF uses cost.',
          S.facts([('Type', 'advanced distance vector'), ('Metric', 'bandwidth and delay'), ('Admin distance', '90'), ('Special feature', 'unequal-cost load balancing')], title='EIGRP'),
          caption='EIGRP is Cisco\'s advanced distance-vector protocol using bandwidth and delay.')

    b.add('2.2', 'RIP',
          'An older distance-vector routing protocol that uses hop count as its metric, treats 16 hops as unreachable, and converges slowly; RIPv2 adds VLSM support and multicast updates.',
          'identify the older routing protocol that cannot route beyond 15 hops',
          ['OSPF (Open Shortest Path First)', 'EIGRP', 'BGP'],
          'Hop count with a 15-hop limit — suited only to small networks.',
          S.facts([('Metric', 'hop count'), ('Maximum', '15 hops; 16 is unreachable'), ('Updates', 'periodic, slow convergence'), ('RIPv2', 'adds VLSM and multicast')], title='RIP'),
          caption='RIP uses hop count, stops at 15 hops, and converges slowly.')

    b.add('2.2', 'Link-state routing',
          'A class of routing protocols, such as OSPF and IS-IS, in which every router floods information about its links, builds a complete map of the topology, and runs a shortest-path algorithm; distance-vector protocols only know what neighbors tell them.',
          'identify the routing approach in which each router builds a full topology map and calculates shortest paths itself',
          ['Distance-vector routing', 'Static routing', 'Policy-based routing'],
          'A complete MAP of the network — distance-vector routers just trust their neighbors\' summaries.',
          S.compare(('Distance vector', ['Knows neighbors\' summaries', 'RIP, EIGRP', 'Slower convergence']), ('Link state', ['Full topology map', 'OSPF, IS-IS', 'Faster convergence']), title='Routing protocol families'),
          caption='Link-state routers share link information and each builds a full map to compute the best paths.')

    b.add('2.2', 'Longest prefix match',
          'When several routes match a destination, the router chooses the one with the longest (most specific) prefix first, before considering administrative distance or metric.',
          'explain why traffic for 10.1.1.5 uses the 10.1.1.0/24 route even though a 10.0.0.0/8 route also exists',
          ['Administrative distance', 'Route metric', 'A default route'],
          'MOST SPECIFIC prefix wins first — then administrative distance, then metric.',
          S.steps([('1. Longest prefix', 'most specific match'), ('2. Admin distance', 'most trusted source'), ('3. Metric', 'lowest cost')], title='Route selection order', tones=['primary', 'blue', 'plain']),
          caption='Routers prefer the most specific matching prefix before comparing distance or metric.')

    b.add('2.2', 'Route metric',
          'The value a routing protocol uses to rank routes it learns itself, such as hop count in RIP, cost in OSPF, and a bandwidth-delay composite in EIGRP, where the lowest metric wins.',
          'choose between two OSPF routes to the same prefix learned over different paths',
          ['Administrative distance', 'Longest prefix match', 'Time to live (TTL)'],
          'The tiebreaker WITHIN a protocol — administrative distance ranks different protocols against each other.',
          S.table(['Protocol', 'Metric based on'], [('RIP', 'hop count'), ('OSPF', 'link cost (bandwidth)'), ('EIGRP', 'bandwidth and delay'), ('BGP', 'path attributes')], title='Metrics by protocol', col_widths=[0.3, 0.7]),
          caption='A route metric ranks routes within a protocol; the lowest value is preferred.')

    b.add('2.2', 'Port address translation (PAT)',
          'A form of NAT, also called NAT overload, that lets many private hosts share one public IP address by assigning each connection a unique source port.',
          'let hundreds of internal hosts reach the Internet through a single public IP address',
          ['Static NAT', 'Dynamic NAT with a pool', 'Destination NAT'],
          'Many hosts, ONE address, told apart by port numbers — static NAT maps one private address to one public address.',
          S.table(['Inside host', 'Public address:port'], [('10.0.0.11:51000', '203.0.113.5:40001'), ('10.0.0.12:51000', '203.0.113.5:40002'), ('10.0.0.13:49500', '203.0.113.5:40003')], title='PAT translation table', col_widths=[0.5, 0.5]),
          caption='PAT shares one public address among many hosts by translating source ports.')

    b.add('2.2', 'Static NAT',
          'A permanent one-to-one mapping between an internal address and a public address, used so an internal server is always reachable at the same outside address.',
          'give an internal web server its own fixed public address so the Internet can always reach it',
          ['Port address translation (PAT)', 'Dynamic NAT', 'Carrier-grade NAT'],
          'A fixed ONE-TO-ONE mapping — PAT shares one address among many hosts.',
          S.compare(('Static NAT', ['One private to one public', 'Permanent mapping', 'Publishes a server']), ('PAT', ['Many private to one public', 'Mapped per connection', 'Outbound Internet access']), title='NAT types'),
          caption='Static NAT permanently maps one internal address to one public address.')

    b.add('2.2', 'Destination NAT (port forwarding)',
          'Translating the destination address and port of inbound traffic to an internal host, for example sending TCP 443 arriving at the public IP to a specific internal web server.',
          'send inbound TCP 443 that arrives at the public address to one internal web server',
          ['Port address translation (PAT)', 'Source NAT', 'A static default route'],
          'It rewrites the DESTINATION of inbound traffic — PAT rewrites the source of outbound traffic.',
          S.steps([('Inbound :443', 'to the public address'), ('DNAT rewrites', 'destination to 10.0.0.20'), ('Internal server', 'receives the request')], title='Port forwarding', tones=['blue', 'amber', 'green']),
          caption='Destination NAT rewrites inbound destinations to publish an internal service.')

    b.add('2.2', 'First-hop redundancy protocol (FHRP)',
          'A protocol such as HSRP, VRRP, or GLBP in which two or more routers share a virtual IP and virtual MAC address, so hosts keep a working default gateway if the active router fails.',
          'keep hosts\' default gateway available when one of two routers fails, without reconfiguring any host',
          ['Spanning Tree Protocol (STP)', 'Link Aggregation (LACP)', 'Route summarization'],
          'A shared VIRTUAL gateway across routers — HSRP is Cisco-specific and VRRP is the open standard.',
          S.steps([('Hosts', 'gateway = virtual IP'), ('Active router', 'answers for the VIP'), ('Standby router', 'takes over on failure')], title='First-hop redundancy', tones=['plain', 'blue', 'amber']),
          caption='FHRPs let routers share a virtual gateway address so a failure is invisible to hosts.')

    b.add('2.2', 'Subinterfaces (router on a stick)',
          'Splitting one physical router interface into logical subinterfaces, each tagged with an 802.1Q VLAN ID and given its own IP address, so a single trunk link can route between VLANs.',
          'route between several VLANs using one trunk link to a router',
          ['Switch virtual interface (SVI)', 'A port channel', 'The native VLAN'],
          'ONE physical link, MANY logical subinterfaces — an SVI does the routing inside a Layer 3 switch.',
          S.steps([('Switch trunk', 'carries VLANs 10, 20, 30'), ('Router subinterfaces', 'one per VLAN'), ('Inter-VLAN routing', 'through one cable')], title='Router on a stick', tones=['plain', 'blue', 'green']),
          caption='Subinterfaces let one trunked router interface route between multiple VLANs.')

    b.add('2.2', 'Switch virtual interface (SVI)',
          'A logical Layer 3 interface on a multilayer switch that acts as the default gateway for a VLAN, allowing inter-VLAN routing at hardware speed without an external router.',
          'provide the default gateway for each VLAN directly on a Layer 3 switch',
          ['Subinterfaces (router on a stick)', 'A physical routed port', 'A trunk port'],
          'A virtual Layer 3 interface PER VLAN on the switch — no external router or single trunk bottleneck.',
          S.facts([('Where', 'on a Layer 3 switch'), ('Per', 'VLAN, with its own IP address'), ('Role', 'default gateway for the VLAN'), ('Benefit', 'inter-VLAN routing at wire speed')], title='SVI'),
          caption='An SVI is a virtual Layer 3 interface that routes for a VLAN on a multilayer switch.')

    b.add('2.2', 'Routing convergence',
          'The state in which all routers share a consistent view of the topology after a change; until convergence completes some routers may keep sending traffic toward a failed path, and link-state protocols generally converge faster than RIP.',
          'explain the short period after a link failure when some routers still send traffic into the failed path',
          ['Route summarization', 'Administrative distance', 'A default route'],
          'Until routers CONVERGE on the new topology, stale routes can cause loops or black holes.',
          S.steps([('Link fails', 'topology changes'), ('Routers update', 'tables disagree briefly'), ('Converged', 'all tables consistent')], title='Convergence', tones=['red', 'amber', 'green']),
          caption='Convergence is when every router agrees on the new topology after a change.')

    # ------------------------------------------------------------------------------------------ 2.3 switching
    b.add('2.3', 'Port mirroring (SPAN)',
          'Copying the traffic of one or more switch ports or VLANs to a designated monitor port, so a protocol analyzer or IDS can inspect it without disturbing the original traffic.',
          'send a copy of a server port\'s traffic to a protocol analyzer without interrupting the server',
          ['Link Aggregation (LACP)', 'Port security', 'Power over Ethernet (PoE)'],
          'A COPY of the traffic to a monitor port — a network tap does the same job with separate hardware.',
          S.steps([('Source port', 'server traffic'), ('Switch copies frames', 'SPAN session'), ('Monitor port', 'analyzer or IDS')], title='Port mirroring', tones=['plain', 'blue', 'green']),
          caption='Port mirroring copies traffic from chosen ports to a monitoring port.')

    b.add('2.3', 'BPDU guard',
          'A switch feature that disables an edge port (PortFast) if it receives a spanning tree BPDU, preventing a rogue or misconfigured switch from altering the STP topology.',
          'automatically shut down an access port if someone plugs in a switch that sends BPDUs',
          ['Root guard', 'Port security', '802.1X'],
          'It protects edge ports from BPDUs — port security limits MAC addresses instead.',
          S.steps([('Edge port', 'PortFast enabled'), ('BPDU arrives', 'a switch was plugged in'), ('Port err-disabled', 'topology protected')], title='BPDU guard', tones=['plain', 'amber', 'red']),
          caption='BPDU guard shuts down an edge port that receives a BPDU, protecting STP from rogue switches.')

    b.add('2.3', 'Root bridge (STP)',
          'The switch elected as the reference point of a spanning tree, chosen by the lowest bridge ID (priority, then MAC address); administrators lower a core switch\'s priority so it becomes the root.',
          'make a specific core switch the reference point of the spanning tree instead of leaving it to chance',
          ['A designated port', 'A blocking port', 'The native VLAN'],
          'LOWEST bridge ID wins the election — set the priority on the switch you want as root.',
          S.facts([('Chosen by', 'lowest bridge ID'), ('Bridge ID', 'priority, then MAC address'), ('Default priority', '32768'), ('Tune with', 'a lower priority on the core')], title='STP root bridge'),
          caption='The root bridge is the switch with the lowest bridge ID; lower the priority to choose it.')

    b.add('2.3', 'MAC address table',
          'The switch table, held in CAM, that maps source MAC addresses to ports as frames arrive; known unicast frames go out one port, while unknown unicast and broadcasts are flooded, and entries age out after about five minutes.',
          'explain how a switch decides which port to send a frame out of',
          ['The ARP cache', 'The routing table', 'The VLAN database'],
          'LEARNS source MACs per port — unknown destinations are flooded until the table learns them.',
          S.steps([('Frame arrives', 'source MAC learned'), ('Table lookup', 'destination MAC found?'), ('Forward or flood', 'one port or all')], title='Switch forwarding', tones=['plain', 'blue', 'green']),
          caption='A switch learns source MACs per port and forwards or floods frames based on that table.')

    b.add('2.3', 'Address Resolution Protocol (ARP)',
          'The protocol that resolves a known IPv4 address to a MAC address on the local network, using a broadcast request and storing the answer in the ARP cache (arp -a).',
          'identify how a host learns the MAC address of a neighbor whose IPv4 address it already knows',
          ['DNS', 'DHCP', 'Neighbor Discovery Protocol (NDP)'],
          'IPv4 address to MAC address on the LOCAL segment — NDP does the same for IPv6.',
          S.steps([('Who has 10.0.0.5?', 'broadcast request'), ('10.0.0.5 is at aa:bb', 'unicast reply'), ('ARP cache', 'stores the mapping')], title='ARP', tones=['plain', 'green', 'blue']),
          caption='ARP maps IPv4 addresses to MAC addresses on the local network.')

    b.add('2.3', 'Auto-MDIX',
          'A switch port feature that detects the cable type and swaps the transmit and receive pairs as needed, so straight-through and crossover cables both work between devices.',
          'connect two switches with an ordinary straight-through cable and still have the link come up',
          ['Auto-negotiation', 'Port security', 'Power over Ethernet (PoE)'],
          'It fixes TX/RX pair order automatically — auto-negotiation fixes speed and duplex.',
          S.compare(('Without auto-MDIX', ['Switch to switch needs a crossover', 'Wrong cable means no link', 'Easy to get wrong']), ('With auto-MDIX', ['Either cable type works', 'Ports swap pairs', 'Common on modern gear']), title='Cable type and auto-MDIX', tones=('amber', 'green')),
          caption='Auto-MDIX swaps transmit and receive pairs automatically so either cable type works.')

    b.add('2.3', 'Access port',
          'A switch port assigned to a single VLAN that sends and receives untagged frames, used for end devices such as workstations and printers, in contrast to a trunk port that carries multiple tagged VLANs.',
          'connect a workstation to a switch port that belongs to exactly one VLAN and uses untagged frames',
          ['An 802.1Q trunk port', 'A mirror port', 'A routed port'],
          'ONE VLAN, untagged, for end devices — a trunk carries many tagged VLANs between network devices.',
          S.compare(('Access port', ['One VLAN', 'Untagged frames', 'End devices']), ('Trunk port', ['Many VLANs', '802.1Q tagged frames', 'Switch, router, or AP']), title='Switch port modes'),
          caption='An access port belongs to one VLAN and carries untagged frames for end devices.')

    b.add('2.3', 'Voice VLAN',
          'A separate VLAN for IP phones, configured on an access port so phone traffic is tagged and prioritized while the PC plugged into the phone stays untagged on the data VLAN.',
          'put IP phones and the PCs plugged into them on separate VLANs using a single switch port',
          ['The native VLAN', 'The management VLAN', 'Port mirroring'],
          'Phone TAGGED, PC untagged on one port — it keeps voice separate and easy to prioritize with QoS.',
          S.steps([('IP phone', 'voice VLAN, tagged'), ('One switch port', 'carries both'), ('PC behind the phone', 'data VLAN, untagged')], title='Voice VLAN', tones=['blue', 'plain', 'green']),
          caption='A voice VLAN separates and prioritizes phone traffic on the same port as a PC.')

    b.add('2.3', 'IEEE 802.3bt (PoE++)',
          'The PoE standard delivering up to 60 W (Type 3) or 90 W (Type 4) per port, enough for PTZ cameras and thin clients; 802.3af provides 15.4 W and 802.3at (PoE+) provides 30 W.',
          'choose the PoE standard for a high-power camera that needs about 50 watts over the network cable',
          ['IEEE 802.3af (PoE)', 'IEEE 802.3at (PoE+)', 'IEEE 802.1X'],
          'bt is the HIGH-power one — af gives 15.4 W and at gives 30 W.',
          S.table(['Standard', 'Name', 'Power at the switch'], [('802.3af', 'PoE', '15.4 W'), ('802.3at', 'PoE+', '30 W'), ('802.3bt Type 3', 'PoE++', '60 W'), ('802.3bt Type 4', 'PoE++', '90 W')], title='PoE standards', col_widths=[0.35, 0.25, 0.4]),
          caption='802.3bt PoE++ delivers 60 or 90 W; 802.3af and 802.3at deliver 15.4 and 30 W.')

    b.add('2.3', 'Collision domain',
          'A network segment in which simultaneous transmissions can collide; a hub puts all ports in one collision domain, while each switch port is its own collision domain, and full duplex removes collisions altogether.',
          'explain why replacing a hub with a switch eliminated collisions between hosts',
          ['Broadcast domain', 'VLAN', 'Spanning tree'],
          'COLLISIONS are contained per switch port — broadcast domains are bounded by routers and VLANs.',
          S.compare(('Hub', ['One collision domain', 'Collisions possible', 'Half duplex']), ('Switch', ['Each port its own domain', 'Collisions eliminated', 'Full duplex']), title='Collision domains'),
          caption='Each switch port is its own collision domain, unlike a hub where all ports share one.')

    b.add('2.3', 'Broadcast domain',
          'The set of devices that receive each other\'s Layer 2 broadcasts; switches forward broadcasts within a VLAN, and only a router or Layer 3 interface (or a VLAN boundary) separates broadcast domains.',
          'reduce broadcast traffic on a large flat network by dividing it into smaller segments',
          ['Collision domain', 'Autonomous system', 'A trunk port'],
          'Broadcasts stop at a ROUTER or VLAN boundary — switch ports do not separate them.',
          S.steps([('One big VLAN', 'broadcasts reach everyone'), ('Split into VLANs', 'each is its own domain'), ('Router between them', 'broadcasts stay local')], title='Shrinking broadcast domains', tones=['red', 'blue', 'green']),
          caption='A broadcast domain is everything a Layer 2 broadcast reaches; VLANs and routers divide them.')

    b.add('2.3', 'Rapid Spanning Tree Protocol (RSTP)',
          'The 802.1w evolution of STP that converges in seconds rather than the 30 to 50 seconds of classic STP by using faster port roles and states and proposal-agreement handshakes between switches.',
          'cut spanning tree reconvergence after a link failure from about 30 to 50 seconds to a few seconds',
          ['Spanning Tree Protocol (STP)', 'Link Aggregation (LACP)', 'BPDU guard'],
          'RAPID convergence, 802.1w — classic STP waits through listening and learning timers.',
          S.compare(('STP (802.1D)', ['30 to 50 s convergence', 'Listening and learning timers', 'Original standard']), ('RSTP (802.1w)', ['Converges in seconds', 'Faster port roles', 'Backward compatible']), title='STP vs RSTP'),
          caption='RSTP reconverges in seconds instead of the 30 to 50 seconds of classic STP.')

    b.add('2.3', 'Flow control (802.3x pause frames)',
          'A mechanism in which an overloaded receiver sends a pause frame asking the sender to stop temporarily, preventing buffer overflow and frame loss between a fast sender and a slow receiver.',
          'prevent a slow receiver from dropping frames when a faster sender overruns its buffers',
          ['Quality of Service (QoS)', 'Traffic shaping', 'Jumbo frames'],
          'The receiver tells the sender to PAUSE — QoS prioritizes traffic instead.',
          S.steps([('Fast sender', 'bursts of frames'), ('Receiver buffer fills', 'sends a pause frame'), ('Sender waits', 'then resumes')], title='Flow control', tones=['plain', 'amber', 'green']),
          caption='802.3x flow control lets a receiver pause a sender to avoid buffer overflow.')

    b.add('2.3', 'Auto-negotiation',
          'The process in which two Ethernet link partners advertise their capabilities and agree on the highest common speed and duplex; a hard-coded setting on only one side often causes a duplex mismatch.',
          'let two Ethernet devices agree automatically on the highest common speed and duplex setting',
          ['Auto-MDIX', 'Flow control', 'Link Aggregation (LACP)'],
          'Speed and DUPLEX agreed automatically — hard-code both ends or neither, never just one.',
          S.steps([('Both ends advertise', 'speeds and duplex'), ('Highest common mode', 'is selected'), ('Link up', 'e.g. 1 Gb full duplex')], title='Auto-negotiation', tones=['plain', 'blue', 'green']),
          caption='Auto-negotiation selects the best speed and duplex both ends support.')

    # ------------------------------------------------------------------------------------------ 2.4 wireless
    b.add('2.4', 'IEEE 802.11n (Wi-Fi 4)',
          'A Wi-Fi standard that operates in both the 2.4 and 5 GHz bands, introduced MIMO and 40 MHz channels, and reaches up to about 600 Mb/s.',
          'identify the Wi-Fi standard that introduced MIMO and works in both the 2.4 GHz and 5 GHz bands',
          ['802.11ac (Wi-Fi 5)', '802.11g', '802.11ax (Wi-Fi 6)'],
          'The first MIMO standard on BOTH bands — 802.11ac is 5 GHz only.',
          S.table(['Standard', 'Wi-Fi name', 'Bands'], [('802.11n', 'Wi-Fi 4', '2.4 and 5 GHz'), ('802.11ac', 'Wi-Fi 5', '5 GHz only'), ('802.11ax', 'Wi-Fi 6 and 6E', '2.4, 5, (6) GHz'), ('802.11be', 'Wi-Fi 7', '2.4, 5, 6 GHz')], title='Modern Wi-Fi generations', col_widths=[0.28, 0.32, 0.4]),
          caption='802.11n (Wi-Fi 4) added MIMO and works in both the 2.4 and 5 GHz bands.')

    b.add('2.4', 'IEEE 802.11ac (Wi-Fi 5)',
          'A 5 GHz-only Wi-Fi standard that adds wider 80 and 160 MHz channels and downlink MU-MIMO, reaching multi-gigabit theoretical speeds.',
          'identify the Wi-Fi standard that works only in the 5 GHz band and introduced downlink MU-MIMO',
          ['802.11n (Wi-Fi 4)', '802.11ax (Wi-Fi 6)', '802.11b'],
          'FIVE GHz only with MU-MIMO — Wi-Fi 6 (802.11ax) added OFDMA and uplink MU-MIMO.',
          S.facts([('Band', '5 GHz only'), ('Channel widths', '20, 40, 80, 160 MHz'), ('Feature', 'downlink MU-MIMO'), ('Also called', 'Wi-Fi 5')], title='802.11ac'),
          caption='802.11ac (Wi-Fi 5) runs on 5 GHz with wide channels and downlink MU-MIMO.')

    b.add('2.4', 'IEEE 802.11ax (Wi-Fi 6 and 6E)',
          'A Wi-Fi standard that improves efficiency in crowded environments with OFDMA, uplink and downlink MU-MIMO, BSS coloring, and target wake time; Wi-Fi 6E extends it into the 6 GHz band.',
          'identify the Wi-Fi standard that uses OFDMA to serve many clients efficiently in dense environments',
          ['802.11ac (Wi-Fi 5)', '802.11n (Wi-Fi 4)', '802.11be (Wi-Fi 7)'],
          'OFDMA for DENSE environments — and the 6E variant adds the 6 GHz band.',
          S.facts([('Bands', '2.4 and 5 GHz; 6E adds 6 GHz'), ('Key features', 'OFDMA, uplink MU-MIMO'), ('Efficiency', 'BSS coloring, target wake time'), ('Also called', 'Wi-Fi 6 and 6E')], title='802.11ax'),
          caption='802.11ax (Wi-Fi 6/6E) adds OFDMA and other features that improve dense deployments.')

    b.add('2.4', 'IEEE 802.11be (Wi-Fi 7)',
          'The Wi-Fi standard that adds 320 MHz channels in 6 GHz, 4096-QAM, and Multi-Link Operation so a client can use several bands at once for higher throughput and lower latency.',
          'identify the Wi-Fi standard that adds 320 MHz channels and Multi-Link Operation',
          ['802.11ax (Wi-Fi 6E)', '802.11ac (Wi-Fi 5)', '802.11n (Wi-Fi 4)'],
          'MULTI-LINK Operation and 320 MHz channels — the newest generation.',
          S.facts([('Bands', '2.4, 5, and 6 GHz'), ('Widest channel', '320 MHz'), ('Key feature', 'Multi-Link Operation'), ('Also called', 'Wi-Fi 7')], title='802.11be'),
          caption='802.11be (Wi-Fi 7) adds 320 MHz channels and Multi-Link Operation.')

    b.add('2.4', 'Legacy 802.11a, b, and g',
          'Older standards: 802.11b (2.4 GHz, 11 Mb/s), 802.11g (2.4 GHz, 54 Mb/s), and 802.11a (5 GHz, 54 Mb/s); 802.11g is backward compatible with 802.11b, while 802.11a is not compatible with either because it uses 5 GHz.',
          'identify the older Wi-Fi standards, from before 802.11n, that top out at 11 or 54 Mb/s',
          ['IEEE 802.11n (Wi-Fi 4)', 'IEEE 802.11ac (Wi-Fi 5)', 'IEEE 802.11ax (Wi-Fi 6 and 6E)'],
          'a, b, and g are the generation before Wi-Fi 4 — 802.11a is the 5 GHz one, while b and g both use 2.4 GHz.',
          S.table(['Standard', 'Band', 'Max rate'], [('802.11b', '2.4 GHz', '11 Mb/s'), ('802.11g', '2.4 GHz', '54 Mb/s'), ('802.11a', '5 GHz', '54 Mb/s')], title='Legacy Wi-Fi', col_widths=[0.35, 0.3, 0.35]),
          caption='802.11b and g use 2.4 GHz; 802.11a uses 5 GHz; the legacy rates top out at 54 Mb/s.')

    b.add('2.4', '6 GHz Wi-Fi band',
          'A band opened to Wi-Fi 6E and Wi-Fi 7 that offers many wide, non-overlapping channels and no legacy devices, with shorter range than lower bands and WPA3 required.',
          'identify the newest Wi-Fi band that is free of legacy devices and offers many non-overlapping wide channels',
          ['2.4 GHz band', '5 GHz band', 'The 60 GHz band'],
          'Only Wi-Fi 6E and 7 clients use it — shorter range, but lots of clean spectrum.',
          S.table(['Band', 'Range and congestion'], [('2.4 GHz', 'longest range, most crowded'), ('5 GHz', 'balanced range and speed'), ('6 GHz', 'shortest range, cleanest spectrum')], title='Wi-Fi bands compared', col_widths=[0.3, 0.7]),
          caption='The 6 GHz band gives Wi-Fi 6E and 7 many clean wide channels at shorter range.')

    b.add('2.4', 'Channel bonding (channel width)',
          'Combining adjacent 20 MHz channels into 40, 80, 160, or 320 MHz channels to raise throughput, at the cost of fewer non-overlapping channels and more susceptibility to interference.',
          'raise a client\'s throughput by combining adjacent channels, while accepting more risk of interference',
          ['Beamforming', 'MU-MIMO', 'Roaming'],
          'WIDER channels mean more speed but fewer clean channels — a trade-off in crowded spaces.',
          S.compare(('Narrow (20 MHz)', ['Many non-overlapping channels', 'Lower peak speed', 'Best in dense areas']), ('Wide (80 or 160 MHz)', ['Fewer clean channels', 'Higher throughput', 'More interference risk']), title='Channel width trade-off'),
          caption='Channel bonding widens a channel for speed but leaves fewer non-overlapping channels.')

    b.add('2.4', 'MIMO',
          'Multiple-input multiple-output uses several antennas to send and receive multiple spatial streams at once on the same channel, increasing throughput and reliability.',
          'increase Wi-Fi throughput by sending several data streams at once from multiple antennas',
          ['MU-MIMO', 'Channel bonding', 'Beamforming'],
          'Several spatial STREAMS to one client — MU-MIMO serves several clients at the same time.',
          S.steps([('Multiple antennas', 'on the AP and client'), ('Spatial streams', 'sent in parallel'), ('Higher throughput', 'on the same channel')], title='MIMO', tones=['plain', 'blue', 'green']),
          caption='MIMO uses several antennas and spatial streams to increase throughput.')

    b.add('2.4', 'MU-MIMO',
          'Multi-user MIMO lets an access point transmit to several clients simultaneously on different spatial streams instead of serving them one at a time (downlink in Wi-Fi 5, both directions in Wi-Fi 6).',
          'let an access point send data to several clients at the same time instead of one after another',
          ['MIMO', 'Channel bonding', 'Beamforming'],
          'Serves several CLIENTS at once — plain MIMO sends several streams to one client.',
          S.compare(('MIMO (single user)', ['Many streams, one client', 'One client at a time', 'Wi-Fi 4 onward']), ('MU-MIMO', ['Streams for several clients', 'Clients served together', 'Wi-Fi 5 downlink, Wi-Fi 6 both']), title='MIMO vs MU-MIMO'),
          caption='MU-MIMO serves multiple clients simultaneously on separate streams.')

    b.add('2.4', 'Beamforming',
          'A technique in which an access point focuses its signal toward a client\'s location, based on feedback, improving signal strength and throughput compared with radiating in all directions.',
          'improve the signal to a distant laptop by having the access point focus its transmission toward it',
          ['MU-MIMO', 'An omnidirectional antenna', 'Channel bonding'],
          'It FOCUSES the signal at a client — an omnidirectional antenna spreads it everywhere.',
          S.compare(('Without beamforming', ['Signal spreads all around', 'Weaker at distance', 'More interference']), ('With beamforming', ['Signal focused at the client', 'Stronger and faster', 'Less wasted energy']), title='Beamforming', tones=('amber', 'green')),
          caption='Beamforming aims the signal at the client to improve strength and throughput.')

    b.add('2.4', 'Wireless roaming',
          'Moving between access points that share the same SSID and security settings as a client travels, with a seamless handoff supported by standards such as 802.11k, v, and r; the group of APs forms an extended service set.',
          'let clients walk through a building and stay connected by handing off between access points that share one SSID',
          ['Channel bonding', 'Beamforming', 'Captive portal'],
          'SAME SSID and security on every AP — and neighboring APs on non-overlapping channels with enough overlap in coverage.',
          S.steps([('AP 1', 'client connected'), ('Client moves', 'signal weakens'), ('AP 2, same SSID', 'seamless handoff')], title='Roaming', tones=['blue', 'amber', 'green']),
          caption='Roaming hands a client from one AP to another that shares the same SSID.')

    b.add('2.4', 'BSSID',
          'The Basic Service Set Identifier is the unique, MAC-based identifier of a single access point radio, whereas the SSID is the human-readable network name shared by many APs.',
          'identify the unique MAC-based identifier of one specific access point radio',
          ['SSID (Service Set Identifier)', 'The channel number', 'The default gateway address'],
          'One AP\'s MAC-based ID — many BSSIDs can share one SSID in an extended service set.',
          S.compare(('SSID', ['Network name people see', 'Shared by many APs', 'Up to 32 characters']), ('BSSID', ['Identifies one AP radio', 'MAC address based', 'Unique per radio']), title='SSID vs BSSID'),
          caption='A BSSID identifies one access point radio; an SSID is the shared network name.')

    b.add('2.4', 'Captive portal',
          'A web page that new Wi-Fi clients are redirected to for accepting terms, entering a voucher, or authenticating before being granted network access, common in hotels and guest networks.',
          'require guests to accept terms on a web page before they get Internet access',
          ['WPA3-Personal', 'MAC filtering', '802.1X authentication'],
          'A web page BEFORE access — 802.1X authenticates at the network edge with credentials.',
          S.steps([('Guest joins Wi-Fi', 'open or guest SSID'), ('Redirected to portal', 'accept terms or log in'), ('Access granted', 'Internet allowed')], title='Captive portal', tones=['plain', 'amber', 'green']),
          caption='A captive portal redirects new clients to a web page before granting access.')

    b.add('2.4', 'Directional antenna',
          'An antenna that concentrates its signal in one direction, such as a Yagi, patch, or parabolic dish, giving a longer range along a narrow beam and making it suitable for point-to-point links.',
          'link two buildings 500 meters apart with a narrow, focused wireless beam',
          ['Omnidirectional antenna', 'Beamforming', 'A wireless repeater'],
          'ONE focused direction for long range — an omnidirectional antenna covers all around at shorter range.',
          S.compare(('Omnidirectional', ['Covers 360 degrees', 'Shorter range', 'Typical office AP']), ('Directional', ['Narrow, focused beam', 'Longer range', 'Point-to-point links']), title='Antenna patterns'),
          caption='A directional antenna focuses signal in one direction for long, point-to-point links.')

    b.add('2.4', 'Signal strength (RSSI) and SNR',
          'RSSI measures received signal strength in negative dBm (closer to zero is stronger), while the signal-to-noise ratio compares the signal with background noise; a decent signal with high noise still gives poor throughput.',
          'explain why a client with a reasonable signal strength still has poor throughput because of a noisy environment',
          ['Channel bonding', 'The roaming threshold', 'Beamforming'],
          'Strength is not enough — the signal must also stand well above the NOISE floor.',
          S.table(['Measure', 'Good value'], [('RSSI', 'about -67 dBm or stronger'), ('Noise floor', 'about -95 dBm or lower'), ('SNR', '25 dB or more')], title='Wireless signal quality', col_widths=[0.4, 0.6]),
          caption='Good Wi-Fi needs both strong signal (RSSI) and a high signal-to-noise ratio.')

    b.add('2.4', 'WPA-Enterprise (802.1X with RADIUS)',
          'Wi-Fi authentication in which each user or device authenticates individually through 802.1X to a RADIUS server, so credentials are unique and can be revoked per user, unlike a single shared pre-shared key.',
          'give every employee unique Wi-Fi credentials tied to their directory account',
          ['WPA-Personal (pre-shared key)', 'An open network with a captive portal', 'MAC filtering'],
          'PER-USER credentials checked by a RADIUS server — a pre-shared key is one password shared by everyone.',
          S.compare(('WPA-Personal', ['One shared passphrase', 'Hard to revoke one user', 'Small offices, homes']), ('WPA-Enterprise', ['802.1X with RADIUS', 'Unique credentials per user', 'Organizations']), title='Wi-Fi authentication'),
          caption='WPA-Enterprise authenticates each user through 802.1X and RADIUS instead of a shared key.')

    # ------------------------------------------------------------------------------------------ 2.5 physical installations
    b.add('2.5', 'Main distribution frame (MDF)',
          'The primary wiring room of a building or campus where carrier circuits enter and backbone cabling terminates, typically housing the core switches, routers, and demarcation point.',
          'identify the central wiring location where the service provider connection and backbone cabling terminate',
          ['Intermediate distribution frame (IDF)', 'A patch panel', 'A colocation cage'],
          'The CENTRAL point with the carrier handoff — IDFs on each floor connect back to it.',
          S.steps([('Carrier circuit', 'enters the building'), ('MDF', 'core and demarcation'), ('IDFs', 'one per floor or wing')], title='MDF and IDF', tones=['plain', 'primary', 'blue']),
          caption='The MDF is the main wiring room where carrier circuits and backbone cabling terminate.')

    b.add('2.5', 'Intermediate distribution frame (IDF)',
          'A secondary wiring closet, usually one per floor or wing, that houses access switches and patch panels and connects to the MDF over backbone or riser cabling.',
          'identify the wiring closet on each floor that connects local cabling back to the main distribution frame',
          ['Main distribution frame (MDF)', 'A server rack unit', 'A hot aisle'],
          'The per-floor CLOSET that feeds back to the MDF — the MDF is the central one.',
          S.facts([('Where', 'each floor or wing'), ('Holds', 'access switches, patch panels'), ('Connects to', 'the MDF by backbone cabling'), ('Serves', 'nearby wall jacks and APs')], title='IDF'),
          caption='An IDF is a floor-level wiring closet that connects local cabling back to the MDF.')

    b.add('2.5', 'Rack unit (U)',
          'The standard unit of vertical space in a 19-inch equipment rack, 1.75 inches (44.45 mm) tall; equipment is described in units (1U, 2U) and a common full-height rack is 42U.',
          'identify the unit used to measure the height of rack-mounted equipment',
          ['Port-side exhaust', 'Cable gauge (AWG)', 'Power load in amperes'],
          'One U is 1.75 inches — a 42U rack holds forty-two 1U devices.',
          S.table(['Item', 'Size'], [('1U', '1.75 inches (44.45 mm)'), ('Standard rack width', '19 inches'), ('Common rack height', '42U'), ('A 2U server', 'uses 2 units')], title='Rack sizing', col_widths=[0.5, 0.5]),
          caption='A rack unit is 1.75 inches of vertical rack space; full racks are commonly 42U.')

    b.add('2.5', 'Port-side exhaust and intake',
          'Switch airflow is labeled by the side the ports face: port-side exhaust blows hot air out of the port side and draws cold air in the back, so the airflow must match the rack\'s hot and cold aisle layout.',
          'order switches whose airflow matches a rack where the ports face the hot aisle',
          ['Rack unit (U)', 'A UPS runtime rating', 'Cable gauge (AWG)'],
          'Match the AIRFLOW to the aisle the ports face — a mismatch recirculates hot air and overheats gear.',
          S.compare(('Port-side exhaust', ['Ports face the hot aisle', 'Intake at the back', 'Cold air in the rear']), ('Port-side intake', ['Ports face the cold aisle', 'Exhaust at the back', 'Cold air at the ports']), title='Switch airflow'),
          caption='Port-side exhaust or intake describes airflow direction and must match the rack\'s aisle layout.')

    b.add('2.5', 'Hot aisle and cold aisle',
          'A data center layout in which racks face each other so cold air is delivered to the fronts in one aisle and hot exhaust is collected from the backs in the next; containment keeps the two air streams from mixing.',
          'arrange racks so equipment draws cool air from the front and exhausts hot air into a separate aisle',
          ['Port-side intake', 'A raised floor', 'Redundant power feeds'],
          'Fronts face COLD, backs face HOT — and containment stops the air from mixing.',
          S.steps([('Cold aisle', 'cool air to the fronts'), ('Racks', 'draw in, exhaust behind'), ('Hot aisle', 'hot air collected')], title='Hot and cold aisles', tones=['blue', 'plain', 'red']),
          caption='Hot and cold aisles separate cool intake air from hot exhaust to cool equipment efficiently.')

    b.add('2.5', 'Uninterruptible power supply (UPS)',
          'A battery-backed power unit that keeps equipment running through outages and sags long enough for a clean shutdown or generator start, and often conditions the incoming power.',
          'keep switches and servers running for several minutes during a power outage',
          ['A power distribution unit (PDU)', 'A surge protector', 'A power strip'],
          'BATTERY runtime during outages — a PDU distributes power, and a surge protector only absorbs spikes.',
          S.steps([('Utility power fails', 'outage'), ('UPS battery', 'takes over instantly'), ('Generator or shutdown', 'before runtime ends')], title='UPS', tones=['red', 'blue', 'green']),
          caption='A UPS supplies battery power during outages for a clean shutdown or generator start.')

    b.add('2.5', 'Power distribution unit (PDU)',
          'A rack-mounted power strip for data centers that distributes power to many devices, and in intelligent models meters load per outlet and allows remote switching of individual outlets.',
          'monitor each device\'s power draw and remotely reboot a hung device by switching its outlet in a rack',
          ['An uninterruptible power supply (UPS)', 'A surge protector', 'A consumer power strip'],
          'DISTRIBUTES and meters power per outlet — a UPS provides the battery backup.',
          S.facts([('Role', 'distributes power inside a rack'), ('Metered', 'shows load per unit or outlet'), ('Switched', 'remote on, off, and reboot'), ('Feeds', 'usually A and B for redundancy')], title='Rack PDU'),
          caption='A rack PDU distributes power and, in smart models, meters and switches individual outlets.')

    b.add('2.5', 'Power load and redundant power feeds',
          'Total equipment draw must stay within the capacity of the circuit and UPS (often keeping continuous load under 80 percent), and devices with dual power supplies should connect to separate A and B feeds so one failure does not cause an outage.',
          'make sure the loss of one power circuit cannot take down a rack of dual-power-supply devices',
          ['One large UPS feeding every device', 'Daisy-chained power strips', 'A single surge protector'],
          'Separate A and B FEEDS, with each kept within capacity — one circuit must never be a single point of failure.',
          S.compare(('Feed A', ['Power supply 1 of each device', 'Own breaker and UPS', 'Under about 80% load']), ('Feed B', ['Power supply 2 of each device', 'Independent circuit and UPS', 'Under about 80% load']), title='Redundant power'),
          caption='Dual power supplies on separate A and B feeds, kept within capacity, remove a single power failure point.')

    b.add('2.5', 'Wiring closet temperature and humidity',
          'Network rooms should be kept cool (about 18 to 27 °C or 64 to 81 °F) with humidity around 40 to 60 percent: too dry increases static discharge, too humid risks condensation and corrosion, and poor airflow causes overheating.',
          'keep a wiring closet within recommended conditions to avoid overheating and static discharge',
          ['Raising the temperature to save energy', 'Removing all ventilation', 'Placing the equipment next to a window'],
          'Cool and moderately humid — roughly 40 to 60 percent humidity, with working airflow.',
          S.table(['Condition', 'Recommended'], [('Temperature', 'about 18 to 27 C (64 to 81 F)'), ('Humidity', 'about 40 to 60 percent'), ('Too dry', 'static discharge risk'), ('Too humid', 'condensation, corrosion')], title='Environmental targets', col_widths=[0.35, 0.65]),
          caption='Network rooms need cool temperatures and moderate humidity to avoid overheating and static or corrosion.')

    b.add('2.5', 'Clean-agent fire suppression',
          'A gaseous suppression system (such as FM-200 or Novec 1230) that extinguishes fires by displacing oxygen or absorbing heat without water, protecting server rooms from fire without soaking the equipment.',
          'protect a server room from fire without water damaging the equipment',
          ['A wet-pipe sprinkler system', 'A class A water extinguisher', 'Pre-action sprinklers'],
          'GAS instead of water — wet sprinklers can destroy equipment that the fire did not.',
          S.compare(('Wet-pipe sprinklers', ['Water in the pipes', 'Can damage equipment', 'Common in offices']), ('Clean agent', ['Gas, no water', 'Equipment survives', 'Server rooms']), title='Fire suppression', tones=('amber', 'green')),
          caption='Clean-agent suppression extinguishes fires with gas so server equipment is not drenched.')

    b.add('2.3', 'VLAN database',
          'The list of VLAN IDs and names stored on a switch, such as vlan.dat on Cisco devices, which must contain a VLAN before access ports can be assigned to it; show vlan brief displays it with the ports in each VLAN.',
          'create VLAN 20 with the name Voice on a switch so that ports can be assigned to it afterward',
          ['MAC address table', 'Switch virtual interface (SVI)', 'Trunk port'],
          'A VLAN must EXIST in the database before a port can join it.',
          S.terminal(['show vlan brief', 'VLAN Name     Status   Ports', '10   Sales    active   Fa0/1, Fa0/2', '20   Voice    active   Fa0/3'], title='Switch CLI'),
          caption='The VLAN database lists the VLAN IDs and names defined on a switch.')

    b.add('2.4', 'Band steering',
          'An access point feature that nudges dual-band clients toward the less crowded 5 GHz or 6 GHz band, for example by delaying its responses on 2.4 GHz, to relieve congestion and raise throughput.',
          'move capable clients off a congested 2.4 GHz network onto a faster radio without asking users to pick a band',
          ['Channel bonding (channel width)', 'Wireless roaming', 'Beamforming'],
          'Pushes capable clients to the FASTER band — it is not roaming between access points.',
          S.flow_split(('Dual-band client',), [('2.4 GHz', 'crowded, slower'), ('5 or 6 GHz', 'steered here')], title='Band steering', tones=['amber', 'green']),
          caption='Band steering moves dual-band clients from crowded 2.4 GHz onto 5 or 6 GHz.')

    b.add('2.4', 'Ad hoc wireless network',
          'A peer-to-peer wireless network, an independent basic service set, in which devices connect directly to each other without an access point, useful for quick temporary sharing but limited in range, security, and scale.',
          'let two laptops exchange files over Wi-Fi in a room that has no access point or router',
          ['Infrastructure mode (wireless)', 'Wireless mesh network', 'Wireless point-to-point link'],
          'Device to device with NO access point — infrastructure mode uses an AP.',
          S.compare(('Ad hoc', ['Devices connect directly', 'No access point', 'Temporary and small']), ('Infrastructure', ['Clients join an AP', 'AP links to the wired LAN', 'Normal Wi-Fi design']), title='Wireless network modes'),
          caption='An ad hoc wireless network connects devices directly with no access point.')

    b.add('2.4', 'Infrastructure mode (wireless)',
          'The normal Wi-Fi arrangement in which clients associate with an access point that connects them to the wired network, forming a basic service set; several access points sharing one SSID form an extended service set.',
          'connect laptops and phones to an office network through access points that attach to the wired switches',
          ['Ad hoc wireless network', 'Wireless mesh network', 'Wireless point-to-point link'],
          'Clients talk through an ACCESS POINT — ad hoc devices talk directly to each other.',
          S.steps([('Client', 'laptop or phone'), ('Access point', 'one BSS'), ('Wired LAN', 'switches and servers')], title='Infrastructure mode', tones=['plain', 'primary', 'blue']),
          caption='In infrastructure mode, clients join an access point that links them to the wired network.')

    b.add('2.4', 'Extended service set identifier (ESSID)',
          'The network name shared by every access point in an extended service set, which is what users see as the SSID, so clients can roam between access points; each AP radio still has its own BSSID.',
          'give every access point in a building the same network name so devices can move between them',
          ['BSSID', 'Captive portal', 'Wireless roaming'],
          'SAME name on every AP — the BSSID is unique to each AP radio.',
          S.hub(('ESSID: CorpWiFi',), [('AP 1', 'BSSID 00:1A:01'), ('AP 2', 'BSSID 00:1A:02'), ('AP 3', 'BSSID 00:1A:03')], title='One ESSID, many BSSIDs'),
          caption='An ESSID is the one name shared by all APs in an extended service set; each AP has its own BSSID.')

    b.add('2.4', 'Wi-Fi Protected Setup (WPS)',
          'A convenience feature that joins a device by pressing a button or entering a short PIN instead of typing the passphrase; the PIN method can be brute-forced, so WPS should normally be disabled.',
          'join a device to the wireless network by pushing a button on the access point instead of typing the passphrase',
          ['Captive portal', 'WPA-Enterprise (802.1X with RADIUS)', 'MAC filtering'],
          'Easy join, weak PIN — the PIN method is brute-forceable, so DISABLE it.',
          S.steps([('Press WPS button', 'on the access point'), ('Device joins', 'passphrase shared'), ('PIN method risk', 'can be brute-forced')], title='Wi-Fi Protected Setup', tones=['plain', 'blue', 'red']),
          caption='WPS joins devices with a button or PIN; the PIN method is weak and usually disabled.')

    b.add('2.5', 'Fiber distribution panel',
          'A rack-mounted enclosure where incoming fiber trunk cables terminate on connectors or splice trays and short fiber patch cords connect each port to equipment, organizing and protecting fiber much as a patch panel does for copper.',
          "terminate a building's incoming fiber backbone in the rack and connect each strand to switch optics with short jumpers",
          ['Patch panel', '110 punchdown block', 'Main distribution frame (MDF)'],
          'The FIBER version of a patch panel — trunk fibers end at the back, jumpers at the front.',
          S.steps([('Fiber trunk', 'from another room'), ('Distribution panel', 'connectors or splices'), ('Jumpers', 'to switch transceivers')], title='Fiber distribution panel', tones=['plain', 'primary', 'green']),
          caption='A fiber distribution panel terminates fiber trunks and patches each strand to equipment.')

    b.add('2.5', 'Voltage and circuit requirements',
          'Rack equipment must match the voltage, amperage, and plug type of its power feed, such as 120 V versus 208 or 240 V circuits; high-density racks often use 208 V feeds, and the circuit must be sized for the total load.',
          "confirm that a rack's power feed and plug type suit a new switch whose power supplies accept only a certain voltage range",
          ['Power load and redundant power feeds', 'Uninterruptible power supply (UPS)', 'Power distribution unit (PDU)'],
          'Check voltage, plug, and amperage BEFORE racking — a mismatch can trip breakers or damage gear.',
          S.table(['Feed', 'Typical use'], [('120 V', 'office-style circuits'), ('208 V', 'data center rack PDUs'), ('240 V', 'high-power equipment')], title='Common feeds', col_widths=[0.3, 0.7]),
          caption='Equipment must match the voltage, amperage, and plug type of its power feed.')

    # ------------------------------------------------------------------------------------------ added 2026-11-03 (official-objective gaps)
    b.add('2.4', 'Non-overlapping channels (1, 6, 11)',
          'In the 2.4 GHz band only channels 1, 6, and 11 (in the US) sit far enough apart not to overlap, so neighboring access points should use those three; the 5 GHz band offers many more non-overlapping 20 MHz channels.',
          'plan the channels of three neighboring 2.4 GHz access points so their signals do not interfere with one another',
          ['Channel bonding (channel width)', 'Band steering', 'Beamforming'],
          'On 2.4 GHz the clean set is 1, 6, and 11 — neighboring channels such as 1 and 2 overlap and interfere.',
          S.steps([('Channel 1', '2412 MHz'), ('Channel 6', '2437 MHz'), ('Channel 11', '2462 MHz')], title='2.4 GHz non-overlapping channels', tones=['blue', 'green', 'amber']),
          caption='On 2.4 GHz, channels 1, 6, and 11 do not overlap, so neighboring APs should use them.')

    b.add('2.4', 'IEEE 802.11h (DFS and TPC)',
          'An amendment that lets 5 GHz Wi-Fi share spectrum with radar and satellite systems: dynamic frequency selection (DFS) makes an access point move off a channel when it detects radar, and transmit power control (TPC) keeps power within regulatory limits; it is an example of regulatory impacts on channel choice.',
          'explain why an access point suddenly leaves a 5 GHz channel when it detects a weather radar signal',
          ['Band steering', 'Wireless roaming', 'Channel bonding (channel width)'],
          'REGULATIONS shape channels — DFS vacates a channel when radar appears, and TPC limits transmit power.',
          S.facts([('Standard', 'IEEE 802.11h'), ('DFS', 'leave the channel when radar is heard'), ('TPC', 'keep power within legal limits'), ('Where', '5 GHz bands shared with radar')], title='802.11h'),
          caption='802.11h adds DFS and TPC so 5 GHz Wi-Fi can share spectrum with radar.')

    b.add('2.4', 'Wireless mesh network',
          'A wireless network in which access points or nodes link to each other over radio, relaying traffic hop by hop to the one or two nodes that have a wired Internet connection, so coverage extends without running cable to every node.',
          'cover a large warehouse yard with Wi-Fi when only one access point can be cabled to the switch',
          ['Ad hoc wireless network', 'Infrastructure mode (wireless)', 'Wireless point-to-point link'],
          'Nodes RELAY for each other over radio — only the gateway nodes need cabling, and each extra hop can cut throughput.',
          S.steps([('Wired node', 'connected to the switch'), ('Mesh node', 'relays by radio'), ('Mesh node', 'relays by radio')], title='Wireless mesh', tones=['primary', 'blue', 'blue']),
          caption='In a wireless mesh, nodes relay traffic over radio to the few that have a wired uplink.')

    b.add('2.4', 'Wireless point-to-point link',
          'A dedicated radio link between two fixed locations, using directional antennas aimed at each other, to bridge two buildings or sites without cabling; it needs line of sight and careful alignment, and no clients roam onto either end.',
          'bridge two networks wirelessly as one fixed link between a pair of radios, with no clients associating to either end',
          ['Wireless mesh network', 'Ad hoc wireless network', 'Omnidirectional antenna'],
          'A FIXED pair of radios, two ends only — a mesh relays through many nodes and infrastructure mode serves roaming clients.',
          S.steps([('Site A radio', 'directional antenna'), ('Line of sight', 'aimed at each other'), ('Site B radio', 'directional antenna')], title='Wireless point-to-point', tones=['blue', 'amber', 'blue']),
          caption='A wireless point-to-point link joins two fixed sites with aimed directional antennas.')

    b.add('2.4', 'WPA2',
          'The previous generation of Wi-Fi Protected Access, using AES-CCMP encryption with either a pre-shared key (WPA2-Personal) or 802.1X authentication (WPA2-Enterprise); it is still widely deployed, but WPA3 adds protection against offline password guessing.',
          'identify the widely deployed AES-based wireless security standard that came before WPA3',
          ['WEP', 'WPA3 encryption', 'Open authentication'],
          'AES-CCMP security that WPA3 replaces — WEP is the broken predecessor, and WPA2 can be Personal (PSK) or Enterprise (802.1X).',
          S.compare(('WPA2', ['AES-CCMP encryption', 'Personal (PSK) or Enterprise', 'Offline guessing possible']), ('WPA3', ['Stronger encryption', 'SAE replaces the PSK exchange', 'Resists offline guessing']), title='WPA2 and WPA3', tones=('amber', 'green')),
          caption='WPA2 uses AES-CCMP with a pre-shared key or 802.1X; WPA3 strengthens it against guessing.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Routing protocols, route selection, and NAT', ['2.2'],
              'Interior protocols run inside an autonomous system: RIP counts hops (15 maximum), OSPF is link-state and builds a full topology map, and EIGRP is Cisco\'s advanced distance-vector protocol using bandwidth and delay (administrative distance 90). BGP is the exterior protocol between autonomous systems and runs on TCP 179. A router chooses routes by longest prefix first, then administrative distance (which ranks protocols), then metric (which ranks routes within a protocol).\n\n'
              'NAT comes in three useful forms: static NAT maps one private address to one public address, PAT (NAT overload) shares one public address among many hosts using port numbers, and destination NAT (port forwarding) publishes an internal service. First-hop redundancy (HSRP, VRRP, GLBP) shares a virtual gateway address, subinterfaces ("router on a stick") route between VLANs over one trunk, an SVI does it on a Layer 3 switch, and convergence is the time until every router agrees after a change.')
    b.section('More Ethernet switching features', ['2.1', '2.3'],
              'A hub repeats every signal to every port in one collision domain, whereas each switch port is its own collision domain; broadcast domains are separated only by VLANs and routers. A switch learns source MAC addresses into its MAC address table, forwards known unicast out one port, and floods unknown unicast and broadcast; ARP resolves IPv4 to MAC on the local segment.\n\n'
              'Useful features: port mirroring copies traffic to an analyzer, BPDU guard err-disables an edge port that receives a BPDU, the root bridge is the lowest bridge ID, RSTP converges in seconds instead of 30 to 50, access ports carry one untagged VLAN while trunks carry many tagged VLANs, a voice VLAN separates phones, auto-MDIX fixes cable pairs and auto-negotiation fixes speed and duplex. For PoE, 802.3af gives 15.4 W, 802.3at 30 W, and 802.3bt 60 or 90 W.')
    b.section('Wireless standards and technologies', ['2.4'],
              'Know the generations: 802.11n (Wi-Fi 4) introduced MIMO on 2.4 and 5 GHz, 802.11ac (Wi-Fi 5) is 5 GHz only with downlink MU-MIMO, 802.11ax (Wi-Fi 6 and 6E) adds OFDMA and the 6 GHz band, and 802.11be (Wi-Fi 7) adds 320 MHz channels and Multi-Link Operation. Legacy: 802.11b and g use 2.4 GHz, and 802.11a uses 5 GHz. WPA2 (AES-CCMP) is the previous security generation that WPA3 replaces.\n\n'
              'Wider channels (channel bonding) raise throughput but leave fewer clean channels, MIMO sends several streams to one client while MU-MIMO serves several clients at once, and beamforming focuses the signal at a client. Roaming needs the same SSID and security on every AP, a BSSID identifies one AP radio, a captive portal gates guests with a web page, directional antennas suit point-to-point links, and good signal means both strong RSSI and a high SNR. WPA-Enterprise uses 802.1X and RADIUS for unique per-user credentials. On 2.4 GHz only channels 1, 6, and 11 do not overlap, and 802.11h makes an access point leave a 5 GHz channel when it detects radar (DFS). A wireless mesh relays traffic between nodes over radio, and a wireless point-to-point link joins two fixed sites with aimed antennas.')
    b.section('Physical installation: closets, racks, power, and environment', ['2.5'],
              'The MDF is the central wiring room where carrier circuits and backbone cabling terminate, and an IDF is a per-floor closet that connects back to it. Racks are measured in units (1U = 1.75 inches, commonly 42U), and switch airflow (port-side exhaust or intake) must match the hot aisle and cold aisle layout so hot and cold air do not mix.\n\n'
              'A UPS provides battery power through outages, while a PDU distributes and can meter and switch power inside the rack. Keep loads within capacity and connect dual power supplies to separate A and B feeds. Rooms should stay roughly 18 to 27 °C at 40 to 60 percent humidity, and server rooms should use clean-agent (gas) fire suppression rather than water.')
    b.section('Wireless modes, band steering, and installation details', ['2.3', '2.4', '2.5'],
              'The VLAN database lists the VLAN IDs and names on a switch, and a VLAN must exist there before ports can join it. In wireless, infrastructure mode connects clients through access points (a basic service set, or an extended service set when APs share one ESSID, with each AP radio having its own BSSID), while an ad hoc network connects devices directly. Band steering pushes dual-band clients to 5 or 6 GHz, and WPS lets devices join by button or PIN but its PIN method should be disabled. In the closet, a fiber distribution panel terminates fiber trunks and patches strands to equipment, and equipment must match the voltage, amperage, and plug type of its power feed.')
