"""Network+ (N10-009), domain nd1 (Networking Concepts), part 2: media, topologies, addressing, IPv6, network types."""
import svg as S

DOMAIN = 'nd1'


def build(b):
    b.objective('1.9', 'IPv6 addressing', ['Address format', 'Address types', 'Neighbor Discovery', 'Dual stack', 'Tunneling and NAT64'])
    b.objective('1.10', 'Network types and provider links', ['WAN, MAN, PAN, CAN, WLAN', 'MPLS', 'DSL and cable', 'Leased lines', 'Satellite and cellular', 'Colocation'])
    b.topics['1.4'] = ['TCP handshake', 'UDP', 'Well-known ports', 'Multicast/unicast/broadcast', 'Secure vs insecure ports', 'ICMP, GRE, IPsec']
    b.topics['1.5'] = ['Single-mode fiber', 'Multimode fiber', 'SFP', 'Cat 6a', 'Connectors', 'Ethernet standards', 'Termination blocks']
    b.topics['1.7'] = ['CIDR', 'RFC 1918', 'Subnet mask', 'Gateway', 'NAT', 'Classful ranges', 'VLSM']

    # ------------------------------------------------------------------------------------------ 1.5 media
    b.add('1.5', 'Shielded twisted pair (STP)',
          'Twisted-pair cable with foil or braided shielding around the pairs that blocks electromagnetic interference and crosstalk better than unshielded cable, at higher cost and with a need for proper grounding.',
          'run Ethernet cabling through a factory floor where heavy electrical machinery causes interference',
          ['Unshielded twisted pair (UTP)', 'A crossover cable', 'A rollover cable'],
          'The SHIELD resists interference — UTP is cheaper and more flexible but picks up more noise.',
          S.compare(('UTP', ['No shielding', 'Cheaper and flexible', 'More prone to EMI']), ('STP', ['Foil or braid shield', 'Resists EMI and crosstalk', 'Must be grounded']), title='Twisted-pair cable'),
          caption='STP adds a shield that blocks interference, at higher cost and with a grounding requirement.')

    b.add('1.5', 'Coaxial cable',
          'Cable with a copper center conductor, insulation, a braided shield, and an outer jacket, still used for cable broadband (RG-6) and CCTV (RG-59), with F-type or BNC connectors.',
          'identify the cable type that connects a cable modem to the wall outlet',
          ['Cat 6a UTP cable', 'Single-mode fiber', 'Shielded twisted pair (STP)'],
          'Center conductor plus shield — cable broadband still arrives on coax with F-type connectors.',
          S.layers([('Center conductor', 'solid copper carries the signal', 'amber'), ('Insulation', 'dielectric around the core', 'plain'), ('Braided shield', 'blocks outside interference', 'blue'), ('Outer jacket', 'protective covering', 'plain')], title='Coaxial cable'),
          caption='Coaxial cable has a center conductor and shield, and carries cable broadband and CCTV.')

    b.add('1.5', 'Plenum-rated cable',
          'Cable with a low-smoke, fire-retardant jacket (CMP) required in air-handling spaces such as above drop ceilings and under raised floors; riser-rated cable (CMR) is for vertical shafts and general PVC cable (CM) is not allowed in air spaces.',
          'choose the cable for a run above a drop ceiling that carries return air',
          ['Riser-rated cable', 'PVC-jacketed patch cable', 'Direct-burial outdoor cable'],
          'PLENUM means air-handling spaces and low smoke — riser is for vertical runs between floors.',
          S.table(['Rating', 'Where it is used'], [('Plenum (CMP)', 'air-handling ceilings and floors'), ('Riser (CMR)', 'vertical shafts between floors'), ('PVC (CM)', 'general use, not air spaces')], title='Cable jacket ratings', col_widths=[0.35, 0.65]),
          caption='Plenum cable has a low-smoke jacket for air-handling spaces; riser cable runs between floors.')

    b.add('1.5', 'Direct attach cable (DAC)',
          'A twinaxial copper cable with SFP+ or QSFP connectors permanently attached, used for short links of a few meters between switches and servers in a rack; it costs less and uses less power than separate optics.',
          'connect a server to the top-of-rack switch with a short, low-cost 10 Gb link without buying separate transceivers',
          ['Multimode fiber with LC connectors', 'A Cat 6a patch cable', 'Single-mode fiber with SFP+ modules'],
          'Connectors are built INTO the cable — great for a few meters, but not for long runs.',
          S.facts([('Medium', 'twinax copper'), ('Ends', 'SFP+ or QSFP built in'), ('Range', 'a few meters (passive)'), ('Used for', 'in-rack switch-to-server links')], title='Direct attach cable'),
          caption='A DAC is a short twinax cable with transceiver connectors built in, for in-rack links.')

    b.add('1.5', 'RJ45 connector',
          'The eight-position modular connector used on Ethernet twisted-pair cabling, wired to T568A or T568B.',
          'identify the connector on the end of an Ethernet patch cable',
          ['RJ11 connector', 'F-type connector', 'LC connector'],
          'EIGHT pins for Ethernet — the telephone RJ11 is smaller with fewer contacts.',
          S.compare(('RJ45', ['Eight positions', 'Ethernet twisted pair', 'Wider connector']), ('RJ11', ['Six positions, two or four used', 'Telephone and DSL', 'Narrower connector']), title='Modular connectors'),
          caption='RJ45 is the eight-position connector used for Ethernet over twisted pair.')

    b.add('1.5', 'RJ11 connector',
          'The smaller modular connector, typically with two or four active conductors, used for analog telephone lines and the line side of DSL modems.',
          'identify the connector on the telephone line that feeds a DSL modem',
          ['RJ45 connector', 'F-type connector', 'BNC connector'],
          'The small TELEPHONE connector — RJ45 is the wider Ethernet one.',
          S.facts([('Positions', '6, usually 2 or 4 used'), ('Carries', 'analog telephone, DSL'), ('Size', 'narrower than RJ45'), ('Do not confuse with', 'RJ45 for Ethernet')], title='RJ11'),
          caption='RJ11 is the small telephone connector used for analog phone lines and DSL.')

    b.add('1.5', 'LC connector',
          'A small form factor fiber connector with a push-pull latch, usually used in duplex pairs and found on most SFP and SFP+ modules.',
          'identify the small fiber connector found on most SFP and SFP+ transceivers',
          ['SC connector', 'ST connector', 'MPO connector'],
          'The SMALL latching one — LC pairs are the standard on SFP modules, while SC is the larger square connector.',
          S.facts([('Size', 'small form factor'), ('Latch', 'push-pull, clip'), ('Typical use', 'SFP and SFP+ modules'), ('Usually seen', 'in duplex pairs')], title='LC connector'),
          caption='The LC connector is the small, push-pull fiber connector used on most SFP modules.')

    b.add('1.5', 'SC connector',
          'A square, snap-in fiber connector with a push-pull design, larger than LC and common on patch panels and legacy enterprise and telecom equipment.',
          'identify the square, push-pull fiber connector commonly seen on patch panels',
          ['LC connector', 'ST connector', 'RJ45 connector'],
          'SQUARE and push-pull — LC is the smaller one and ST twists on with a bayonet.',
          S.facts([('Shape', 'square body'), ('Latch', 'push-pull snap-in'), ('Size', 'larger than LC'), ('Found on', 'patch panels, legacy gear')], title='SC connector'),
          caption='The SC connector is a square, snap-in fiber connector common on patch panels.')

    b.add('1.5', 'ST connector',
          'A round fiber connector secured with a twist-lock bayonet, used on older multimode installations.',
          'identify the round fiber connector that locks on with a twist of a bayonet fitting',
          ['SC connector', 'LC connector', 'MPO connector'],
          'ROUND and twist-locked — SC and LC are push-pull.',
          S.facts([('Shape', 'round barrel'), ('Lock', 'twist bayonet'), ('Typical fiber', 'older multimode'), ('Status', 'legacy')], title='ST connector'),
          caption='The ST connector is a round, twist-lock fiber connector found on older multimode links.')

    b.add('1.5', 'MPO connector',
          'A multi-fiber push-on connector holding 12 or more fibers in one ferrule, used for parallel optics such as 40 and 100 Gb Ethernet and for high-density trunk cabling.',
          'identify the multi-fiber connector used for 40 and 100 Gb parallel optics',
          ['LC connector', 'SC connector', 'ST connector'],
          'MANY fibers in one connector — the others carry one fiber or one duplex pair.',
          S.facts([('Fibers', '12, 24, or more in one ferrule'), ('Used for', '40 and 100 Gb parallel optics'), ('Also called', 'MTP (a branded version)'), ('Benefit', 'high-density trunks')], title='MPO connector'),
          caption='An MPO connector carries many fibers at once for parallel optics and dense trunk cabling.')

    b.add('1.5', 'F-type connector',
          'A threaded coaxial connector that screws onto the cable end, used for cable television and cable broadband modems.',
          'identify the threaded coaxial connector on a cable modem',
          ['BNC connector', 'RJ45 connector', 'RJ11 connector'],
          'THREADED coax for cable TV and broadband — BNC twists on with a bayonet.',
          S.compare(('F-type', ['Screw-on thread', 'Cable TV and modems', 'RG-6 coax']), ('BNC', ['Twist-on bayonet', 'CCTV and test gear', 'RG-59 coax']), title='Coax connectors'),
          caption='The F-type connector screws onto coax and is used for cable TV and cable modems.')

    b.add('1.5', 'BNC connector',
          'A bayonet-style coaxial connector that locks with a quarter turn, used for CCTV, test equipment, and legacy Ethernet.',
          'identify the twist-lock coaxial connector used for CCTV cameras and test equipment',
          ['F-type connector', 'RJ45 connector', 'LC connector'],
          'A quarter-turn BAYONET on coax — F-type connectors thread on.',
          S.facts([('Lock', 'bayonet quarter turn'), ('Cable', 'coaxial'), ('Used for', 'CCTV, test gear, legacy LANs'), ('Not', 'the threaded F-type')], title='BNC connector'),
          caption='The BNC connector locks onto coax with a bayonet twist, used for CCTV and test gear.')

    b.add('1.5', 'QSFP+ transceiver (40 Gb/s)',
          'A hot-swappable module that combines four lanes in one port, QSFP+ carrying 40 Gb/s as four 10 Gb/s lanes and QSFP28 carrying 100 Gb/s as four 25 Gb/s lanes, compared with SFP at 1 Gb/s and SFP+ at 10 Gb/s.',
          'choose the module for a 40 Gb switch port that aggregates four 10 Gb lanes',
          ['SFP transceiver', 'SFP+ transceiver (10 Gb/s)', 'A GBIC module'],
          'FOUR lanes in one module — SFP is 1 Gb/s and SFP+ is 10 Gb/s.',
          S.table(['Module', 'Speed'], [('SFP', '1 Gb/s'), ('SFP+', '10 Gb/s'), ('QSFP+', '40 Gb/s (4 x 10)'), ('QSFP28', '100 Gb/s (4 x 25)')], title='Transceiver families', col_widths=[0.4, 0.6]),
          caption='QSFP modules use four lanes: QSFP+ delivers 40 Gb/s and QSFP28 delivers 100 Gb/s.')

    b.add('1.5', 'Bidirectional (BiDi) transceiver',
          'A transceiver pair that sends and receives on different wavelengths over a single fiber strand, halving the fiber needed; the two ends must be matched so each transmits the wavelength the other receives.',
          'carry a 10 Gb link over a single fiber strand by using a different wavelength in each direction',
          ['Coarse WDM (CWDM)', 'A duplex LC patch cable', 'An MPO trunk cable'],
          'ONE strand, two wavelengths — and the two ends must be matched.',
          S.steps([('End A transmits', 'wavelength 1'), ('One fiber strand', 'carries both directions'), ('End B transmits', 'wavelength 2')], title='BiDi optics', tones=['blue', 'plain', 'green']),
          caption='BiDi optics use two wavelengths on a single fiber strand, one for each direction.')

    b.add('1.5', 'Coarse WDM (CWDM)',
          'Wavelength-division multiplexing that combines up to about 18 wavelengths with wide 20 nm spacing onto one fiber, a lower-cost way to add capacity on metro and campus links.',
          'add capacity to an existing metro fiber pair with a few wavelengths at relatively low cost',
          ['Dense WDM (DWDM)', 'A BiDi transceiver', 'Multimode fiber'],
          'WIDE channel spacing, fewer channels, lower cost — DWDM packs many more channels tightly.',
          S.compare(('CWDM', ['About 18 channels', '20 nm spacing', 'Metro, lower cost']), ('DWDM', ['40 to 96+ channels', 'Very tight spacing', 'Long haul, higher cost']), title='Wavelength multiplexing'),
          caption='CWDM puts a modest number of widely spaced wavelengths on one fiber at low cost.')

    b.add('1.5', 'Dense WDM (DWDM)',
          'Wavelength-division multiplexing that packs dozens of closely spaced wavelengths onto one fiber and can be amplified for long distances, used by carriers for very high capacity backbones.',
          'multiply the capacity of a long-haul fiber by carrying dozens of closely spaced wavelengths',
          ['Coarse WDM (CWDM)', 'A BiDi transceiver', 'Single-mode fiber with LC connectors'],
          'DENSE, many channels, long haul — CWDM spaces fewer channels widely.',
          S.facts([('Channels', '40 to 96 or more'), ('Spacing', 'very tight, about 0.8 nm'), ('Reach', 'long haul with amplifiers'), ('Used by', 'carrier backbones')], title='DWDM'),
          caption='DWDM carries many tightly spaced wavelengths on one fiber for very high capacity over long distances.')

    b.add('1.5', '1000BASE-T',
          'The Gigabit Ethernet standard for twisted-pair copper, using all four pairs of Cat 5e or better cabling for up to 100 meters.',
          'identify the standard for Gigabit Ethernet over four pairs of copper cable up to 100 meters',
          ['100BASE-TX', '1000BASE-SX', '10GBASE-T'],
          'Gigabit over COPPER — the SX and LX standards are Gigabit over fiber.',
          S.table(['Standard', 'Speed', 'Minimum cable'], [('100BASE-TX', '100 Mb/s', 'Cat 5'), ('1000BASE-T', '1 Gb/s', 'Cat 5e'), ('10GBASE-T', '10 Gb/s', 'Cat 6 (55 m), Cat 6a (100 m)')], title='Copper Ethernet', col_widths=[0.3, 0.25, 0.45]),
          caption='1000BASE-T runs Gigabit Ethernet over Cat 5e or better copper for up to 100 meters.')

    b.add('1.5', '10GBASE-T',
          'The 10 Gigabit Ethernet standard for twisted-pair copper, which needs Cat 6a for the full 100 meters, or Cat 6 for up to about 55 meters.',
          'identify the standard for 10 Gb Ethernet over twisted-pair copper that needs Cat 6a for a full 100-meter run',
          ['1000BASE-T', '10GBASE-SR', '10GBASE-LR'],
          '10 Gb over COPPER with Cat 6a for 100 m — SR and LR are the fiber versions.',
          S.compare(('Cat 6', ['10 Gb/s', 'About 55 meters', 'Shorter runs only']), ('Cat 6a', ['10 Gb/s', 'Full 100 meters', 'The usual choice']), title='10GBASE-T and cable category', tones=('amber', 'green')),
          caption='10GBASE-T runs 10 Gb/s over copper, needing Cat 6a for the full 100 meters.')

    b.add('1.5', '10GBASE-SR',
          'The short-range 10 Gigabit Ethernet standard for multimode fiber at 850 nm, reaching a few hundred meters depending on the fiber grade.',
          'choose a standard for a 10 Gb link of about 200 meters between buildings over multimode fiber',
          ['10GBASE-LR', '1000BASE-T', '10GBASE-T'],
          'SR is SHORT range over multimode — LR is long range over single-mode.',
          S.table(['Standard', 'Fiber', 'Typical reach'], [('1000BASE-SX', 'multimode', 'about 550 m'), ('10GBASE-SR', 'multimode', '300 to 400 m'), ('1000BASE-LX', 'single-mode', 'about 5 km'), ('10GBASE-LR', 'single-mode', 'about 10 km')], title='Fiber Ethernet', col_widths=[0.35, 0.3, 0.35]),
          caption='10GBASE-SR is the short-range 10 Gb standard over multimode fiber.')

    b.add('1.5', '10GBASE-LR',
          'The long-range 10 Gigabit Ethernet standard for single-mode fiber at 1310 nm, reaching about 10 kilometers.',
          'choose a standard for an 8-kilometer 10 Gb link over single-mode fiber',
          ['10GBASE-SR', '1000BASE-SX', '10GBASE-T'],
          'LR is LONG range over single-mode — SR is short range over multimode.',
          S.facts([('Fiber', 'single-mode'), ('Wavelength', '1310 nm'), ('Reach', 'about 10 km'), ('Short-range cousin', '10GBASE-SR')], title='10GBASE-LR'),
          caption='10GBASE-LR carries 10 Gb/s about 10 km over single-mode fiber.')

    b.add('1.5', 'Cat 8 cable',
          'Shielded twisted-pair cabling rated to 2000 MHz for 25 and 40 Gb/s Ethernet (25GBASE-T and 40GBASE-T) over short runs of up to about 30 meters, aimed at data centers.',
          'choose twisted-pair cabling for 40 Gb server links within 30 meters in a data center',
          ['Cat 5e cable', 'Cat 6 cable', 'Cat 6a UTP cable'],
          'The data-center category — 40 Gb/s but only about 30 m, and shielded.',
          S.table(['Category', 'Typical use'], [('Cat 5e', '1 Gb/s to 100 m'), ('Cat 6', '10 Gb/s to about 55 m'), ('Cat 6a', '10 Gb/s to 100 m'), ('Cat 8', '25 and 40 Gb/s to about 30 m')], title='Cable categories', col_widths=[0.3, 0.7]),
          caption='Cat 8 supports 25 and 40 Gb/s over short, shielded runs in data centers.')

    b.add('1.5', 'Patch panel',
          'A rack-mounted panel where permanent horizontal cabling from wall jacks is punched down at the back and short patch cords connect the front ports to switch ports, keeping cabling organized and easy to change.',
          'terminate permanent wall-jack cable runs in the wiring closet so any port can be patched into a switch',
          ['A media converter', 'A network tap', 'A cable certifier'],
          'The PERMANENT run ends at the back; patch cords at the front make the changes.',
          S.steps([('Wall jack', 'horizontal cable run'), ('Patch panel', 'punched down at the back'), ('Switch port', 'patch cord, front')], title='Patch panel path', tones=['plain', 'primary', 'green']),
          caption='A patch panel terminates permanent cabling so short patch cords can connect it to switches.')

    b.add('1.5', '110 punchdown block',
          'A modern punchdown block for terminating twisted-pair data and voice cabling at higher density than the older 66 block, using a punchdown tool to seat each conductor.',
          'terminate Cat 5e or Cat 6 data cabling on a modern, high-density punchdown block',
          ['66 punchdown block', 'A patch panel with RJ11 ports', 'A fiber distribution panel'],
          '110 is the modern, higher-density block — the 66 block is the older telephone one.',
          S.compare(('110 block', ['Data and voice', 'Higher density', 'Cat 5e and Cat 6 era']), ('66 block', ['Legacy analog telephone', 'Lower density', '25-pair style']), title='Punchdown blocks'),
          caption='The 110 block is the modern high-density punchdown block for data and voice cabling.')

    b.add('1.5', '66 punchdown block',
          'A legacy punchdown block used for terminating analog telephone wiring, with lower density than the 110 block.',
          'identify the legacy punchdown block used for analog telephone wiring',
          ['110 punchdown block', 'A patch panel', 'An MPO cassette'],
          'The OLDER telephone block — 110 blocks replaced it for data.',
          S.facts([('Era', 'legacy'), ('Carries', 'analog telephone wiring'), ('Density', 'lower than 110'), ('Replaced by', '110 block and patch panels')], title='66 block'),
          caption='The 66 block is the legacy telephone punchdown block, replaced by the 110 block for data.')

    b.add('1.5', 'T568B wiring standard',
          'The pin-out for terminating RJ45 connectors that is most common in US installations; T568A swaps the orange and green pairs, and a straight-through cable uses the same standard on both ends.',
          'make a straight-through patch cable using the most common pin order in US installations',
          ['T568A wiring standard', 'Crossover wiring', 'Rollover wiring'],
          'Same standard on BOTH ends for straight-through — A on one end and B on the other makes a crossover.',
          S.table(['Pin', 'T568A', 'T568B'], [('1', 'white/green', 'white/orange'), ('2', 'green', 'orange'), ('3', 'white/orange', 'white/green'), ('6', 'orange', 'green'), ('4, 5, 7, 8', 'same', 'same')], title='T568A and T568B differ on pins 1, 2, 3, 6', col_widths=[0.3, 0.35, 0.35]),
          caption='T568B is the common US RJ45 pin-out; T568A swaps the orange and green pairs.')

    # ------------------------------------------------------------------------------------------ 1.6 topologies
    b.add('1.6', 'Mesh topology',
          'A topology in which devices have multiple connections to each other: a full mesh links every node to every other (n(n-1)/2 links) for maximum redundancy, and a partial mesh links only the important ones.',
          'design a WAN in which every site has a direct link to every other site so no single link failure isolates one',
          ['Star topology', 'Hub-and-spoke topology', 'Bus topology'],
          'EVERY node connects to every other in a full mesh — a star depends on one central device.',
          S.compare(('Full mesh', ['Every site linked to every other', 'n(n-1)/2 links', 'Highest redundancy and cost']), ('Partial mesh', ['Only key sites linked', 'Fewer links', 'Balances cost and redundancy']), title='Mesh topologies'),
          caption='A full mesh links every node to every other for redundancy; a partial mesh links only some.')

    b.add('1.6', 'Bus topology',
          'A legacy topology in which all devices share one backbone cable that needs terminators at both ends, so a break in the cable can take down the whole segment.',
          'identify the older topology in which every device shares one cable terminated at both ends',
          ['Ring topology', 'Star topology', 'Mesh topology'],
          'ONE shared backbone with terminators — a single break hurts everyone, which is why stars replaced it.',
          S.steps([('Terminator', 'one end of the bus'), ('Shared backbone', 'every device taps in'), ('Terminator', 'other end of the bus')], title='Bus topology', tones=['plain', 'blue', 'plain']),
          caption='A bus topology shares one terminated backbone, so one break can bring the segment down.')

    b.add('1.6', 'Ring topology',
          'A topology in which each device connects to two neighbors in a closed loop and traffic circulates in one direction; dual counter-rotating rings (as in FDDI and SONET) add resilience.',
          'identify the topology in which each device connects to exactly two neighbors in a closed loop',
          ['Bus topology', 'Star topology', 'Mesh topology'],
          'A closed LOOP of neighbors — dual rings keep working after a single break.',
          S.facts([('Connections', 'each node to two neighbors'), ('Traffic', 'circulates around the loop'), ('Resilience', 'dual rings survive one break'), ('Examples', 'FDDI, SONET rings')], title='Ring topology'),
          caption='In a ring topology each device links to two neighbors in a loop; dual rings add resilience.')

    b.add('1.6', 'Hub-and-spoke topology',
          'A WAN design in which branch offices (spokes) connect to a central site (hub) rather than to each other, simplifying management but making the hub a single point of failure and a traffic bottleneck.',
          'connect twelve branch offices to headquarters, with all inter-branch traffic passing through headquarters',
          ['Full mesh topology', 'Ring topology', 'Bus topology'],
          'Everything goes through the HUB — cheap and simple, but the hub is the single point of failure.',
          S.hub(('Headquarters (hub)', 'central site'), [('Branch A', 'spoke'), ('Branch B', 'spoke'), ('Branch C', 'spoke')]),
          caption='Hub-and-spoke connects branches to a central site, which simplifies WANs but concentrates risk.')

    b.add('1.6', 'Collapsed core',
          'A design for smaller networks that combines the core and distribution layers of the three-tier model into a single layer of switches, reducing cost and complexity.',
          'simplify a mid-sized campus network by merging the core and distribution layers into one',
          ['Three-tier architecture', 'Spine-leaf architecture', 'Full mesh topology'],
          'Core and distribution MERGED — three-tier keeps all three layers separate.',
          S.compare(('Three-tier', ['Core', 'Distribution', 'Access']), ('Collapsed core', ['Core and distribution combined', 'Access', 'Fewer devices and layers']), title='Hierarchical designs'),
          caption='A collapsed core merges the core and distribution layers for smaller networks.')

    b.add('1.6', 'East-west traffic',
          'Traffic that moves between servers inside a data center, as opposed to north-south traffic that enters or leaves it; spine-leaf fabrics are designed to carry heavy east-west flows efficiently.',
          'explain why a data center that mostly moves server-to-server traffic favors spine-leaf over a traditional three-tier design',
          ['North-south traffic', 'Unicast traffic', 'Broadcast traffic'],
          'EAST-WEST is server-to-server inside the data center — north-south crosses its edge.',
          S.compare(('North-south', ['In or out of the data center', 'Client to server', 'Crosses the edge']), ('East-west', ['Server to server inside', 'Application tiers and storage', 'Dominates modern data centers']), title='Data center traffic flows'),
          caption='East-west traffic flows between servers inside a data center; spine-leaf suits it well.')

    # ------------------------------------------------------------------------------------------ 1.7 IPv4
    b.add('1.7', 'Classful IPv4 ranges',
          'The original address classes by first octet: Class A 1 to 126 (/8), Class B 128 to 191 (/16), Class C 192 to 223 (/24), Class D 224 to 239 (multicast), and Class E 240 to 255 (experimental), with 127 reserved for loopback.',
          'identify the class of 172.20.5.10 and the default mask that class implies',
          ['Class A with a /8 mask', 'Class C with a /24 mask', 'Class D, a multicast address'],
          'First octet 128 to 191 is CLASS B with a /16 default mask.',
          S.table(['Class', 'First octet', 'Default mask'], [('A', '1 to 126', '/8'), ('B', '128 to 191', '/16'), ('C', '192 to 223', '/24'), ('D (multicast)', '224 to 239', 'n/a'), ('E (experimental)', '240 to 255', 'n/a')], title='Classful address ranges', col_widths=[0.4, 0.3, 0.3]),
          caption='Classful addressing divides IPv4 by first octet into Classes A through E.')

    b.add('1.7', 'Loopback address (127.0.0.0/8)',
          'The 127.0.0.0/8 range, usually 127.0.0.1 or localhost, refers to the local device itself; traffic to it never leaves the host, so pinging it tests the local TCP/IP stack.',
          'verify that the local TCP/IP stack is working without sending anything onto the network',
          ['An APIPA address (169.254.x.x)', 'The default gateway address', 'A broadcast address'],
          'Traffic to 127.0.0.1 stays on the HOST — pinging it only proves the local stack works.',
          S.steps([('ping 127.0.0.1', 'sent by the host'), ('Local TCP/IP stack', 'answers internally'), ('No network used', 'traffic never leaves')], title='Loopback test', tones=['plain', 'blue', 'green']),
          caption='The loopback address points at the local host and tests its TCP/IP stack.')

    b.add('1.7', 'Carrier-grade NAT address space (100.64.0.0/10)',
          'A shared address block reserved for ISPs that perform carrier-grade NAT; it is neither RFC 1918 private space nor publicly routable, so a customer router with a 100.64.x.x WAN address sits behind the ISP\'s NAT.',
          'explain why a customer router with a WAN address in 100.64.0.0/10 cannot be reached from the Internet',
          ['An RFC 1918 private address', 'An APIPA address', 'A public static address'],
          '100.64.0.0/10 means the ISP is doing NAT too — the customer is behind a second layer.',
          S.steps([('Customer router', 'WAN address 100.64.x.x'), ('ISP carrier-grade NAT', 'shares public addresses'), ('Internet', 'cannot reach inward')], title='Carrier-grade NAT', tones=['plain', 'amber', 'blue']),
          caption='The 100.64.0.0/10 block is used by ISP carrier-grade NAT and is not directly reachable from the Internet.')

    b.add('1.7', 'Variable-length subnet masking (VLSM)',
          'Using different subnet mask lengths within one address block so each subnet is sized to its needs, for example a /30 for a two-router link and a /25 for a 100-host LAN, which avoids wasting addresses.',
          'give a two-host point-to-point link a /30 and a 100-host LAN a /25 out of the same address block',
          ['Fixed-length subnetting', 'Classful addressing', 'Route summarization'],
          'DIFFERENT mask lengths in one block — fixed-length subnetting wastes addresses on small links.',
          S.table(['Subnet', 'Mask', 'Usable hosts'], [('Server LAN', '/25', '126'), ('Office LAN', '/26', '62'), ('Router link', '/30', '2')], title='VLSM sizing', col_widths=[0.4, 0.25, 0.35]),
          caption='VLSM sizes each subnet to its host count by using different mask lengths.')

    b.add('1.7', 'Usable host formula (2^n - 2)',
          'The number of usable addresses in a subnet is two to the power of the host bits minus two, because the network address and the broadcast address cannot be assigned; a /24 therefore has 254 and a /26 has 62.',
          'calculate how many usable host addresses a subnet provides after reserving the network and broadcast addresses',
          ['The number of subnets formula (2^n)', 'Host count equal to 2^n', 'Host count equal to the mask value'],
          'Take 2 to the HOST bits and SUBTRACT two — a /26 has 6 host bits, so 64 - 2 = 62.',
          S.table(['Prefix', 'Host bits', 'Usable hosts'], [('/24', '8', '254'), ('/25', '7', '126'), ('/26', '6', '62'), ('/27', '5', '30'), ('/30', '2', '2')], title='Usable hosts', col_widths=[0.3, 0.3, 0.4]),
          caption='Usable hosts equal 2 to the host bits minus 2, since network and broadcast addresses are reserved.')

    b.add('1.7', 'Network and broadcast addresses',
          'In every IPv4 subnet the first address identifies the network itself and the last address is the broadcast address, so neither can be assigned to a host.',
          'explain why 192.168.1.0 and 192.168.1.255 cannot be assigned to hosts on a /24 network',
          ['The default gateway address', 'The loopback address', 'A multicast address'],
          'FIRST address = the network, LAST = the broadcast — both are reserved.',
          S.facts([('192.168.1.0', 'network address (first)'), ('192.168.1.1 to .254', 'usable host addresses'), ('192.168.1.255', 'broadcast address (last)')], title='A /24 subnet'),
          caption='The first address of a subnet names the network and the last is the broadcast; neither is usable by hosts.')

    b.add('1.7', 'Virtual IP (VIP)',
          'An address that is not tied to one physical interface and can be shared by, or moved between, devices, such as a load balancer front end or a first-hop redundancy gateway, so clients keep using one address.',
          'give clients one gateway address that stays the same even when the active router fails over to its partner',
          ['A loopback address', 'An APIPA address', 'A broadcast address'],
          'The address belongs to a SERVICE, not a single interface — it moves when the active device changes.',
          S.steps([('Clients', 'use one VIP'), ('Active device', 'owns the VIP now'), ('On failure', 'standby takes the VIP')], title='Virtual IP', tones=['plain', 'blue', 'amber']),
          caption='A virtual IP is shared or moved between devices so clients keep using a single address.')

    # ------------------------------------------------------------------------------------------ 1.8 evolving use cases
    b.add('1.8', 'VXLAN',
          'Virtual Extensible LAN encapsulates Layer 2 frames in UDP packets (port 4789) with a 24-bit segment ID, supporting about 16 million segments instead of the 4,094 VLAN IDs and stretching Layer 2 networks across a routed Layer 3 fabric.',
          'extend Layer 2 segments across a routed data center fabric with far more than 4,094 segments',
          ['802.1Q VLAN trunking', 'A GRE tunnel', 'Spanning Tree Protocol'],
          'A 24-BIT segment ID over UDP — VLANs stop at 4,094 IDs and stay within Layer 2.',
          S.compare(('VLAN (802.1Q)', ['12-bit VLAN ID', '4,094 usable VLANs', 'Layer 2 trunking']), ('VXLAN', ['24-bit VNI', 'About 16 million segments', 'Layer 2 over UDP on Layer 3']), title='VLAN vs VXLAN'),
          caption='VXLAN tunnels Layer 2 over a Layer 3 network and supports about 16 million segments.')

    b.add('1.8', 'Secure access service edge (SASE)',
          'An architecture that combines SD-WAN networking with cloud-delivered security services such as secure web gateway, CASB, zero trust network access, and firewall as a service, so branch and remote users get consistent protection without backhauling traffic.',
          'deliver consistent security to branch offices and remote users from the cloud without sending their traffic back to a central data center',
          ['A site-to-site VPN', 'An on-premises next-generation firewall', 'A honeypot'],
          'Networking AND cloud security delivered together at the edge — SSE is the security half on its own.',
          S.hub(('SASE', 'networking plus security from the cloud'), [('SD-WAN', 'branch connectivity'), ('Secure web gateway', 'web filtering'), ('Zero trust access', 'per-app access')]),
          caption='SASE combines SD-WAN with cloud-delivered security services for branches and remote users.')

    b.add('1.8', 'Version control for network configurations',
          'Keeping device configurations and automation code in a source control system such as Git gives a central repository, a full history, branching, conflict identification when edits collide, and an easy way to roll back a bad change.',
          'track every change to switch configuration templates and roll back a faulty one',
          ['Configuration drift', 'A dynamic inventory', 'A maintenance window'],
          'A CENTRAL repository with history and branches — drift is the problem it helps you catch.',
          S.steps([('Edit on a branch', 'proposed change'), ('Review and merge', 'conflicts identified'), ('Tag and deploy', 'roll back by version')], title='Source control workflow', tones=['plain', 'blue', 'green']),
          caption='Source control gives network automation a central history, branching, and rollback.')

    b.add('1.8', 'Configuration drift',
          'The gradual divergence of a device\'s running configuration from the approved intended state, usually caused by manual command-line changes; infrastructure as code detects and corrects it by re-applying the template.',
          'discover that switches no longer match the approved templates after engineers made ad hoc changes at the command line',
          ['Version control', 'A dynamic inventory', 'A playbook'],
          'Actual config DIVERGES from the intended one — IaC tooling finds it and restores the template.',
          S.steps([('Approved template', 'intended state'), ('Manual CLI changes', 'config drifts away'), ('Automation re-applies', 'back to compliance')], title='Configuration drift', tones=['green', 'amber', 'blue']),
          caption='Configuration drift is the gap between a device\'s real settings and its approved template.')

    b.add('1.8', 'Playbooks and reusable tasks',
          'In infrastructure as code, a playbook is a human-readable file (for example Ansible YAML) that lists reusable tasks to apply a configuration to many devices in a repeatable, idempotent way.',
          'apply the same VLAN and NTP configuration to fifty switches from one reusable, repeatable definition',
          ['Configuration drift', 'A dynamic inventory', 'A change window'],
          'One REUSABLE definition applied to many devices — running it twice leaves the same result.',
          S.steps([('Playbook', 'tasks in readable YAML'), ('Inventory', 'the target devices'), ('Run', 'same result every time')], title='Automation playbook', tones=['blue', 'plain', 'green']),
          caption='A playbook lists reusable tasks that configure many devices consistently.')

    b.add('1.8', 'Dynamic inventory',
          'A list of managed devices that automation tools build at run time from a live source such as a cloud API or CMDB, so newly added or removed devices are picked up without editing a static file.',
          'make automation target newly created cloud devices automatically without manually editing a host list',
          ['A static inventory file', 'Version control', 'A playbook'],
          'Built at RUN TIME from a live source — a static inventory goes stale as devices change.',
          S.compare(('Static inventory', ['A hand-edited file', 'Goes stale', 'Fine for a tiny lab']), ('Dynamic inventory', ['Pulled from cloud or CMDB', 'Always current', 'Scales with change']), title='Inventories'),
          caption='A dynamic inventory is generated from a live source so automation always sees current devices.')

    # ------------------------------------------------------------------------------------------ 1.9 IPv6
    b.add('1.9', 'IPv6 address format',
          'An IPv6 address is 128 bits written as eight groups of four hexadecimal digits, with the first 64 bits normally the network prefix and the last 64 bits the interface identifier on a /64 subnet.',
          'identify the size and notation of an IPv6 address compared with a 32-bit dotted-decimal IPv4 address',
          ['A 32-bit dotted-decimal address', 'A 48-bit MAC address', 'A 64-bit interface identifier alone'],
          '128 bits in HEX, usually a /64 prefix plus a 64-bit interface ID.',
          S.facts([('Length', '128 bits'), ('Notation', 'eight groups of hex digits'), ('Typical subnet', '/64'), ('Example', '2001:db8:10:1::25')], title='IPv6 address'),
          caption='An IPv6 address is 128 bits in hexadecimal, typically split into a 64-bit prefix and a 64-bit interface ID.')

    b.add('1.9', 'IPv6 shorthand notation',
          'Leading zeros in each group may be dropped, and one run of consecutive all-zero groups may be replaced by a double colon, but only once per address.',
          'shorten the address 2001:0db8:0000:0000:0000:0000:0000:0001 to its compact form',
          ['2001:db8::1', '2001:db8::0::1', '2001:0db8::0001'],
          'Drop leading zeros and use :: ONCE for a run of zero groups — two :: would be ambiguous.',
          S.terminal(['2001:0db8:0000:0000:0000:0000:0000:0001', '-> drop leading zeros: 2001:db8:0:0:0:0:0:1', '-> collapse one zero run: 2001:db8::1'], title='Shortening an address'),
          caption='IPv6 shorthand drops leading zeros and replaces one run of zero groups with a double colon.')

    b.add('1.9', 'Global unicast address (2000::/3)',
          'A publicly routable IPv6 address, currently allocated from 2000::/3, that is unique across the Internet and equivalent to a public IPv4 address.',
          'identify the IPv6 address type that is routable on the public Internet',
          ['Link-local address (fe80::/10)', 'Unique local address (fc00::/7)', 'Multicast address (ff00::/8)'],
          'Globally ROUTABLE and starting with 2 or 3 — link-local and unique local addresses are not routed on the Internet.',
          S.table(['Type', 'Prefix', 'Scope'], [('Global unicast', '2000::/3', 'Internet'), ('Unique local', 'fc00::/7', 'inside an organization'), ('Link-local', 'fe80::/10', 'one link only'), ('Multicast', 'ff00::/8', 'group of listeners')], title='IPv6 address types', col_widths=[0.35, 0.25, 0.4]),
          caption='A global unicast IPv6 address is publicly routable, like a public IPv4 address.')

    b.add('1.9', 'Link-local address (fe80::/10)',
          'An IPv6 address automatically configured on every interface that works only on the local link and is never routed, used for neighbor discovery and for communicating with the local router.',
          'identify the IPv6 address that every interface configures automatically and that is never forwarded by routers',
          ['Global unicast address (2000::/3)', 'Unique local address (fc00::/7)', 'The loopback address ::1'],
          'It starts with FE80 and stays on the LINK — routers never forward it.',
          S.facts([('Prefix', 'fe80::/10'), ('Configured', 'automatically on every interface'), ('Scope', 'the local link only'), ('Used for', 'neighbor discovery, next hop')], title='Link-local'),
          caption='Link-local IPv6 addresses (fe80::/10) are automatic and never routed beyond the local link.')

    b.add('1.9', 'Unique local address (fc00::/7)',
          'A private IPv6 address range, in practice fd00::/8, used inside an organization and not routed on the Internet, comparable to RFC 1918 space in IPv4.',
          'choose the IPv6 range comparable to RFC 1918 private addressing for internal-only networks',
          ['Link-local address (fe80::/10)', 'Global unicast address (2000::/3)', 'Multicast address (ff00::/8)'],
          'The IPv6 version of RFC 1918 — routable inside your network but not on the Internet.',
          S.compare(('IPv4', ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']), ('IPv6', ['fc00::/7 (fd00::/8 used)', 'Not routed on the Internet', 'Internal only']), title='Private address space'),
          caption='Unique local IPv6 addresses (fc00::/7) are the private ranges, like RFC 1918 in IPv4.')

    b.add('1.9', 'IPv6 multicast (ff00::/8)',
          'IPv6 has no broadcast; one-to-many communication uses multicast addresses starting with ff, such as ff02::1 for all nodes on the link, and neighbor discovery relies on them.',
          'identify how IPv6 replaces the broadcast traffic that IPv4 uses for address resolution and discovery',
          ['IPv6 broadcast', 'Anycast only', 'Link-local unicast'],
          'IPv6 has NO broadcast — multicast addresses (ff00::/8) do that job.',
          S.facts([('Prefix', 'ff00::/8'), ('All nodes (link)', 'ff02::1'), ('All routers (link)', 'ff02::2'), ('Replaces', 'IPv4 broadcast')], title='IPv6 multicast'),
          caption='IPv6 replaces broadcast with multicast addresses in ff00::/8.')

    b.add('1.9', 'Neighbor Discovery Protocol (NDP)',
          'The IPv6 mechanism, built on ICMPv6, that replaces ARP: neighbor solicitation and advertisement resolve addresses, while router solicitation and advertisement let hosts find routers and learn the network prefix.',
          'identify the IPv6 mechanism that replaces ARP and lets hosts discover routers on the link',
          ['DHCPv6', 'ICMP echo', 'DNS'],
          'NDP does the job of ARP and router discovery using ICMPv6 and multicast.',
          S.table(['NDP message', 'Purpose'], [('Neighbor solicitation', 'who has this address?'), ('Neighbor advertisement', 'here is my MAC address'), ('Router solicitation', 'is there a router?'), ('Router advertisement', 'prefix, gateway, flags')], title='NDP messages', col_widths=[0.45, 0.55]),
          caption='NDP uses ICMPv6 to resolve addresses and discover routers, replacing ARP in IPv6.')

    b.add('1.9', 'Dual stack',
          'Running IPv4 and IPv6 at the same time on the same devices and interfaces, so hosts can talk to either kind of destination during the long transition.',
          'let hosts reach both IPv4-only and IPv6-capable services during the transition without translating between them',
          ['IPv6 tunneling', 'NAT64', 'Carrier-grade NAT'],
          'BOTH protocols side by side — tunneling and NAT64 are for crossing or bridging between them.',
          S.compare(('Dual-stack host', ['IPv4 and IPv6 addresses', 'Uses whichever the peer has', 'No translation needed']), ('IPv6-only host', ['IPv6 address only', 'Needs NAT64 for IPv4 sites', 'Simpler to manage']), title='Transition approaches'),
          caption='Dual stack runs IPv4 and IPv6 together so hosts can reach either kind of destination.')

    b.add('1.9', 'IPv6 tunneling',
          'Encapsulating IPv6 packets inside IPv4 packets so they can cross an IPv4-only network between IPv6 sites; mechanisms include 6to4, Teredo, ISATAP, and manually configured tunnels.',
          'connect two IPv6 networks across an ISP link that only carries IPv4',
          ['Dual stack', 'NAT64', 'A native IPv6 route'],
          'IPv6 wrapped inside IPv4 to cross an IPv4-only path — dual stack runs both natively.',
          S.steps([('IPv6 site A', 'native IPv6 packets'), ('IPv4-only network', 'carries the tunnel'), ('IPv6 site B', 'tunnel unwrapped')], title='IPv6 over IPv4', tones=['green', 'amber', 'green']),
          caption='IPv6 tunneling wraps IPv6 packets in IPv4 to cross IPv4-only networks.')

    b.add('1.9', 'NAT64',
          'A translation mechanism, usually paired with DNS64, that lets IPv6-only clients reach IPv4-only servers by mapping IPv6 addresses to IPv4 addresses.',
          'let IPv6-only clients reach services that exist only on IPv4',
          ['Dual stack', 'IPv6 tunneling', 'Carrier-grade NAT'],
          'It TRANSLATES between IPv6 and IPv4 — tunneling merely carries one inside the other.',
          S.steps([('IPv6-only client', 'asks for an IPv4 site'), ('DNS64 and NAT64', 'synthesize and translate'), ('IPv4-only server', 'sees IPv4 traffic')], title='NAT64', tones=['green', 'blue', 'amber']),
          caption='NAT64 translates between IPv6 clients and IPv4 servers.')

    # ------------------------------------------------------------------------------------------ 1.10 network types and provider links
    b.add('1.10', 'Wide area network (WAN)',
          'A network that spans a large geographic area, connecting LANs in different cities or countries over carrier or provider links such as MPLS, leased lines, or the Internet.',
          'connect branch offices in different cities into one company network',
          ['Local area network (LAN)', 'Metropolitan area network (MAN)', 'Personal area network (PAN)'],
          'Large geographic distance over provider links — a LAN covers a single site.',
          S.table(['Network type', 'Scope'], [('PAN', 'one person, about 10 m'), ('LAN', 'one building or site'), ('CAN', 'several buildings of a campus'), ('MAN', 'a city or metro area'), ('WAN', 'cities, countries, the world')], title='Network scope', col_widths=[0.3, 0.7]),
          caption='A WAN connects networks across large geographic areas using provider links.')

    b.add('1.10', 'Metropolitan area network (MAN)',
          'A network that covers a city or metropolitan area, larger than a campus but smaller than a WAN, often built with metro Ethernet or fiber rings.',
          'identify the network type that links several office sites across a single city over fiber',
          ['Campus area network (CAN)', 'Wide area network (WAN)', 'Personal area network (PAN)'],
          'City-sized — a CAN is a campus, and a WAN spans cities or countries.',
          S.facts([('Scope', 'a city or metro area'), ('Larger than', 'a campus network'), ('Smaller than', 'a WAN'), ('Often built with', 'metro Ethernet, fiber rings')], title='MAN'),
          caption='A MAN covers a city or metropolitan area, between a campus network and a WAN.')

    b.add('1.10', 'Personal area network (PAN)',
          'A very short-range network around one person, typically about 10 meters, connecting devices such as a phone, headset, and watch over Bluetooth, NFC, or USB.',
          'identify the network type formed by a phone pairing with a headset and a smartwatch over Bluetooth',
          ['Wireless LAN (WLAN)', 'Local area network (LAN)', 'Campus area network (CAN)'],
          'One PERSON\'s devices over a few meters — a WLAN covers a building with Wi-Fi.',
          S.facts([('Range', 'about 10 meters'), ('Technologies', 'Bluetooth, NFC, USB'), ('Examples', 'phone, headset, watch'), ('Owner', 'one person')], title='PAN'),
          caption='A PAN connects one person\'s nearby devices over Bluetooth, NFC, or USB.')

    b.add('1.10', 'Campus area network (CAN)',
          'A network that interconnects the LANs of multiple buildings on a campus, such as a university or corporate park, under one organization\'s control.',
          'identify the network type that joins the LANs of many buildings on a university campus',
          ['Metropolitan area network (MAN)', 'Local area network (LAN)', 'Wide area network (WAN)'],
          'Several buildings, ONE owner, one campus — a MAN covers a whole city.',
          S.facts([('Scope', 'multiple buildings, one campus'), ('Owner', 'one organization'), ('Links', 'fiber backbone between buildings'), ('Larger than', 'a single LAN')], title='CAN'),
          caption='A CAN connects the LANs of several buildings on one organization\'s campus.')

    b.add('1.10', 'Wireless LAN (WLAN)',
          'A local area network that connects devices over radio using the 802.11 (Wi-Fi) standards instead of cables, typically through access points.',
          'identify the network type that connects laptops and phones to a building over Wi-Fi',
          ['Personal area network (PAN)', 'Metropolitan area network (MAN)', 'Storage area network (SAN)'],
          '802.11 radio over a building or site — a PAN is a few meters of Bluetooth.',
          S.steps([('Clients', 'laptops and phones'), ('Access point', '802.11 radio'), ('Wired LAN', 'switch and router')], title='Wireless LAN', tones=['plain', 'blue', 'green']),
          caption='A WLAN connects devices by 802.11 radio through access points.')

    b.add('1.10', 'MPLS',
          'Multiprotocol Label Switching forwards packets using short labels inserted between the Layer 2 and Layer 3 headers along label-switched paths, letting providers deliver private WAN services with QoS and traffic engineering.',
          'identify the provider WAN technology that forwards traffic by labels rather than by looking up IP addresses at every hop',
          ['SD-WAN', 'VXLAN', 'GRE tunneling'],
          'LABELS between Layer 2 and Layer 3 — a provider technology, whereas SD-WAN is the overlay many customers use instead.',
          S.steps([('Ingress router', 'adds a label'), ('Label-switched path', 'forwarded by label'), ('Egress router', 'removes the label')], title='MPLS', tones=['plain', 'blue', 'plain']),
          caption='MPLS forwards by short labels along provider paths, supporting QoS and traffic engineering.')

    b.add('1.10', 'Digital subscriber line (DSL)',
          'A broadband service over existing copper telephone lines, usually asymmetric (ADSL) with faster downloads than uploads, where speed falls as the distance from the provider\'s central office grows.',
          'identify the broadband service that uses existing telephone wiring and slows down the farther the customer is from the central office',
          ['Cable broadband', 'Satellite internet', 'A leased line'],
          'Telephone copper with distance-limited speed — cable broadband uses a shared coax segment.',
          S.compare(('DSL', ['Telephone copper pair', 'Dedicated line per customer', 'Speed falls with distance']), ('Cable', ['Coax with DOCSIS', 'Shared neighborhood segment', 'Speed varies with load']), title='DSL vs cable'),
          caption='DSL uses telephone wiring; its speed drops with distance from the central office.')

    b.add('1.10', 'Cable broadband',
          'A broadband service that delivers Internet over the cable television coaxial network using DOCSIS, with bandwidth shared among customers on the same neighborhood segment.',
          'identify the broadband service delivered over the cable TV coax network whose speed can drop when neighbors are busy',
          ['Digital subscriber line (DSL)', 'Satellite internet', 'A leased line'],
          'Shared COAX segment — busy neighbors can slow it, unlike a dedicated leased line.',
          S.steps([('Cable modem', 'in the customer premises'), ('Coax neighborhood node', 'shared segment'), ('Provider headend', 'DOCSIS to the Internet')], title='Cable broadband', tones=['plain', 'amber', 'blue']),
          caption='Cable broadband uses DOCSIS over shared coax, so speed can vary with neighborhood load.')

    b.add('1.10', 'Leased line',
          'A dedicated point-to-point circuit, such as a T1 or T3, that gives a customer guaranteed, symmetric bandwidth and an SLA at a premium price.',
          'provide guaranteed, symmetric bandwidth between two sites with an SLA, regardless of what other customers are doing',
          ['Cable broadband', 'Digital subscriber line (DSL)', 'Satellite internet'],
          'DEDICATED and symmetric with an SLA — consumer broadband is shared and best effort.',
          S.facts([('Type', 'dedicated point-to-point circuit'), ('Speeds', 'symmetric, guaranteed'), ('Examples', 'T1, T3, E1'), ('Trade-off', 'expensive, but an SLA')], title='Leased line'),
          caption='A leased line is a dedicated circuit with guaranteed symmetric bandwidth and an SLA.')

    b.add('1.10', 'Satellite internet',
          'Internet access through satellites, useful where cables are unavailable; geostationary satellites add high latency (roughly 500 to 700 ms) and weather can degrade the signal, while low Earth orbit constellations have much lower latency.',
          'provide Internet access to a remote site that has no cable, DSL, or fiber, accepting higher latency',
          ['Cable broadband', 'Digital subscriber line (DSL)', 'Metro Ethernet'],
          'The choice for REMOTE sites — expect high latency on geostationary links and weather sensitivity.',
          S.compare(('Geostationary', ['About 35,786 km up', '500 to 700 ms latency', 'Wide coverage']), ('Low Earth orbit', ['A few hundred km up', 'Much lower latency', 'Needs many satellites']), title='Satellite orbits'),
          caption='Satellite internet reaches remote sites but adds latency, especially from geostationary orbit.')

    b.add('1.10', 'Metro-optical (metro Ethernet)',
          'A carrier-provided Ethernet service over fiber within a metropolitan area, offering scalable, symmetric bandwidth for point-to-point or multipoint connections between sites.',
          'connect several offices in one city with scalable, symmetric Ethernet service delivered over fiber',
          ['A leased T1 line', 'Satellite internet', 'Digital subscriber line (DSL)'],
          'ETHERNET over metro fiber with scalable bandwidth — T1 lines are fixed low-speed circuits.',
          S.facts([('Medium', 'fiber in a metro area'), ('Service', 'Ethernet point-to-point or multipoint'), ('Bandwidth', 'scalable, symmetric'), ('Used for', 'linking city offices and data centers')], title='Metro Ethernet'),
          caption='Metro-optical service delivers scalable Ethernet over fiber between sites in a city.')

    b.add('1.10', 'Cellular WAN (4G LTE and 5G)',
          'Using the mobile carrier network as a WAN link, either as primary access where wired service is unavailable or as a failover path; 5G can reach gigabit speeds, but plans are often metered.',
          'keep a branch office online with a wireless link that takes over when the wired Internet connection fails',
          ['Satellite internet', 'Cable broadband', 'A leased line'],
          'Mobile-carrier link used as PRIMARY or BACKUP — often metered, with 5G fast enough for many sites.',
          S.steps([('Primary link', 'fails'), ('Router fails over', 'to the cellular modem'), ('Branch stays online', 'on LTE or 5G')], title='Cellular failover', tones=['red', 'blue', 'green']),
          caption='Cellular WAN uses 4G or 5G as a primary or backup link where wired access is lacking or fails.')

    b.add('1.10', 'Colocation facility',
          'A provider data center where you rent rack, cage, or suite space with power, cooling, physical security, and network connectivity for your own equipment.',
          'house your own servers in a provider\'s data center that supplies the power, cooling, and carrier connectivity',
          ['Infrastructure as a Service (IaaS)', 'A hot site', 'Software as a Service (SaaS)'],
          'YOUR hardware in THEIR facility — IaaS rents their hardware as virtual machines.',
          S.compare(('Colocation', ['You own the hardware', 'Provider supplies space and power', 'Carrier-neutral connectivity']), ('IaaS', ['Provider owns the hardware', 'You rent virtual machines', 'No rack to manage']), title='Colocation vs IaaS'),
          caption='Colocation rents rack space, power, and connectivity for equipment you own.')

    b.add('1.5', 'Fibre Channel (FC)',
          'A high-speed, lossless networking technology used mainly for storage area networks, carrying SCSI commands over fiber (or copper) at speeds such as 8, 16, 32, and 64 Gb/s through dedicated FC switches and host bus adapters.',
          'connect servers to a storage array over a dedicated, lossless fabric using host bus adapters instead of Ethernet NICs',
          ['iSCSI', 'Direct attach cable (DAC)', 'Network-attached storage (NAS)'],
          'A dedicated STORAGE fabric with HBAs — iSCSI carries the same storage commands over ordinary Ethernet.',
          S.compare(('Fibre Channel', ['Dedicated FC fabric', 'HBAs and FC switches', 'Lossless by design']), ('iSCSI', ['Runs over Ethernet and IP', 'Standard NICs and switches', 'Lower cost']), title='Storage fabrics'),
          caption='Fibre Channel is a dedicated, lossless fabric for storage; iSCSI carries storage over Ethernet.')

    b.add('1.6', 'Hybrid topology',
          'A network that combines two or more basic topologies, for example a star of switches in each building joined by a partial mesh or ring backbone, which is how most real networks are built.',
          'describe a campus where each building is a star of switches and the buildings are joined in a partial mesh',
          ['Mesh topology', 'Bus topology', 'Ring topology'],
          'MORE than one topology combined — real networks are almost always hybrids.',
          S.hub(('Hybrid network',), [('Star', 'inside buildings'), ('Partial mesh', 'between buildings')], title='A hybrid design'),
          caption='A hybrid topology combines basic topologies, such as stars joined by a mesh.')

    b.add('1.8', 'Zero-touch provisioning (ZTP)',
          'An automated process in which a new device powers on, finds its configuration server, for example through DHCP options, and downloads its software image and configuration with no manual setup, so branch devices can be shipped straight to a site.',
          'ship a new branch router to a remote office where non-technical staff only plug it in and it configures itself',
          ['Dynamic inventory', 'Version control for network configurations', 'Configuration drift'],
          'Plug in and it CONFIGURES ITSELF — no engineer needed on site.',
          S.steps([('Device powers on', 'finds config server'), ('Downloads config', 'image and settings'), ('Joins the network', 'no manual setup')], title='Zero-touch provisioning', tones=['plain', 'blue', 'green']),
          caption='ZTP lets a new device configure itself by downloading its image and settings automatically.')

    b.add('1.8', 'Transport agnostic (SD-WAN)',
          'An SD-WAN property in which the overlay works the same over any underlay link, such as MPLS, broadband, or LTE and 5G, so traffic can be steered across them by policy without caring which carrier provides each path.',
          'use a leased MPLS circuit, cable broadband, and a cellular backup together under one set of routing policies',
          ['Application aware routing', 'Central policy management', 'Zero-touch provisioning (ZTP)'],
          'Any UNDERLAY link works — the overlay applies one policy across all of them.',
          S.compare(('Underlay links', ['MPLS circuit', 'Cable or DSL broadband', 'LTE or 5G']), ('SD-WAN overlay', ['One policy for all links', 'Steers by application', 'Ignores the carrier']), title='Transport agnostic'),
          caption='A transport-agnostic SD-WAN overlay works over MPLS, broadband, or cellular links alike.')

    b.add('1.8', 'Data center interconnect (DCI)',
          'High-capacity links between data centers, often dark fiber or DWDM carrying Layer 2 or Layer 3 traffic and sometimes VXLAN, so workloads can move and data can replicate between sites.',
          'link two data centers with very high bandwidth so virtual machines can move and storage can replicate between them',
          ['Content delivery network (CDN)', 'Colocation facility', 'East-west traffic'],
          'Big pipes BETWEEN data centers — east-west traffic stays inside one.',
          S.steps([('Data center A', 'VMs and storage'), ('DCI link', 'dark fiber or DWDM'), ('Data center B', 'VMs and storage')], title='Data center interconnect', tones=['blue', 'primary', 'blue']),
          caption='DCI links data centers with high-capacity connections so workloads and data can move between them.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Cabling, connectors, and Ethernet standards', ['1.5'],
              'Match the medium to the job. Shielded twisted pair resists interference where unshielded is cheaper, coaxial cable (F-type and BNC connectors) still carries cable broadband and CCTV, plenum-rated jackets are required in air-handling spaces, and direct attach cables serve short in-rack links. Know the connectors: RJ45 for Ethernet and the smaller RJ11 for telephone and DSL; LC (small, SFP), SC (square, push-pull), ST (round, bayonet), and MPO (multi-fiber) for fiber.\n\n'
              'Transceivers follow speed: SFP is 1 Gb/s, SFP+ is 10, QSFP+ is 40 (four lanes), and QSFP28 is 100. BiDi optics use two wavelengths on one strand, CWDM carries a few widely spaced wavelengths cheaply, and DWDM packs many tightly for long haul. Standards: 1000BASE-T is Gigabit over Cat 5e, 10GBASE-T needs Cat 6a for 100 m, SR variants use multimode fiber and LR variants use single-mode. Cables end on patch panels or 110 blocks (the 66 block is the legacy telephone one), and T568B is the common RJ45 pin-out, with T568A swapping the orange and green pairs.')
    b.section('Topologies and IPv4 addressing details', ['1.6', '1.7'],
              'In a full mesh every node links to every other (n(n-1)/2 links) for maximum redundancy, a bus shares one terminated cable, a ring links each node to two neighbors, and hub-and-spoke connects branches only to a central site, which becomes the single point of failure. A collapsed core merges the core and distribution layers, and spine-leaf favors east-west (server-to-server) traffic over north-south traffic.\n\n'
              'For addressing, know the classful ranges (A 1 to 126, B 128 to 191, C 192 to 223, D multicast, E experimental), the loopback block 127.0.0.0/8 for testing the local stack, and 100.64.0.0/10 for carrier-grade NAT. VLSM sizes each subnet with its own mask, usable hosts equal 2 to the host bits minus 2, the first address is the network and the last is the broadcast, and a virtual IP is shared or moved between devices.')
    b.section('Automation concepts and modern network environments', ['1.8'],
              'VXLAN carries Layer 2 over UDP on a Layer 3 network using a 24-bit segment ID, about 16 million segments versus the 4,094 VLAN IDs. SASE combines SD-WAN with cloud-delivered security (secure web gateway, CASB, zero trust access), so branch and remote users are protected without backhauling traffic.\n\n'
              'Infrastructure as code brings software practices to networks: source control keeps a central history with branches and conflict identification, playbooks apply reusable tasks to many devices, a dynamic inventory is built from live sources, and automation reduces configuration drift, which is the gradual divergence of real settings from the approved template.')
    b.section('IPv6 addressing', ['1.9'],
              'An IPv6 address is 128 bits written in hexadecimal, usually a /64 prefix plus a 64-bit interface ID. Shorten it by dropping leading zeros and using a double colon once for one run of zero groups. Types: global unicast (2000::/3) is routable on the Internet, link-local (fe80::/10) is automatic and never routed, unique local (fc00::/7) is the private range, and multicast (ff00::/8) replaces broadcast, which IPv6 does not have.\n\n'
              'Neighbor Discovery Protocol (ICMPv6) replaces ARP and lets hosts find routers. For the transition, dual stack runs IPv4 and IPv6 together, tunneling wraps IPv6 inside IPv4 to cross IPv4-only networks, and NAT64 translates between IPv6-only clients and IPv4-only servers.')
    b.section('Network types and provider links', ['1.10'],
              'By scope: a PAN is a person\'s devices over Bluetooth, a LAN covers a site, a WLAN is Wi-Fi, a CAN joins the buildings of a campus, a MAN covers a city, and a WAN spans cities or countries. Provider services include MPLS (label switching with QoS), leased lines (dedicated, symmetric, with an SLA), metro Ethernet over fiber, DSL (telephone copper, speed falls with distance), and cable broadband (shared coax).\n\n'
              'Satellite reaches remote sites but geostationary links add 500 to 700 ms of latency, and cellular 4G or 5G works as primary access or as a failover link. A colocation facility rents space, power, cooling, and connectivity for equipment you own, unlike IaaS, which rents the provider\'s hardware.')
    b.section('Fibre Channel, hybrid designs, and SD-WAN details', ['1.5', '1.6', '1.8'],
              'Fibre Channel is a dedicated, lossless fabric for storage using host bus adapters; iSCSI carries storage over ordinary Ethernet. Most real networks are hybrid topologies, such as stars at each site joined by a partial mesh. SD-WAN is transport agnostic, so an overlay can use MPLS, broadband, and cellular links under one policy, and zero-touch provisioning lets a new device download its own configuration. Data center interconnect links data centers with dark fiber or DWDM so workloads can move between them.')
