"""Network+ (N10-009), domain nd5 (Network Troubleshooting): physical issues, switching and routing issues, wireless issues, configuration issues."""
import svg as S

DOMAIN = 'nd5'


def build(b):
    b.topics['5.2'] = ['Attenuation', 'Crosstalk', 'Improper termination', 'Incorrect cable', 'Wrong pinout', 'Duplex mismatch', 'Bad SFP', 'Open and short', 'Dirty fiber', 'LEDs', 'CRC, runts, giants, drops', 'Error-disabled ports', 'PoE budget and standard', 'Optical power']
    b.topics['5.3'] = ['DHCP exhaustion', 'APIPA', 'DNS failure', 'Bad gateway', 'NTP drift', 'Switching loops', 'STP port roles and states', 'Wrong VLAN', 'Overlapping subnets']
    b.topics['5.4'] = ['Latency', 'Jitter', 'Congestion', 'Broadcast storm', 'Packet loss', 'Wireless coverage', 'Roaming', 'AP capacity']
    b.topics['5.5'] = ['VLAN mismatch', 'Bad subnet mask', 'Routing loop', 'MTU mismatch', 'Bad ACL', 'NAT misconfiguration', 'Port security violation']

    # ------------------------------------------------------------------------------------------ 5.2 cabling and hardware
    b.add('5.2', 'Open and short circuits',
          'An open is a broken or unconnected conductor with no continuity, and a short is two conductors touching; both are caused by damaged or badly terminated cable and are found with a cable tester.',
          'identify the cable fault in which a wire in the cable is broken and shows no continuity end to end',
          ['A short circuit', 'Crosstalk', 'Attenuation'],
          'OPEN means a break with no continuity — a short means conductors are touching.',
          S.compare(('Open', ['Conductor is broken', 'No continuity', 'Link down or pair missing']), ('Short', ['Conductors touch', 'Unintended connection', 'Errors or link failure']), title='Cable faults', tones=('amber', 'red')),
          caption='An open is a broken conductor and a short is touching conductors; a cable tester finds both.')

    b.add('5.2', 'Dirty optical connector',
          'Dust, oil, or debris on a fiber end face blocks light, causing high loss, errors, or flapping links; the fix is to inspect the connector with a scope and clean it with lint-free wipes or a cleaning tool.',
          'resolve intermittent errors and high loss on a fiber link that tests fine after the connector is cleaned',
          ['A bent fiber', 'A TX/RX swap', 'A duplex mismatch'],
          'Microscopic dirt on the END FACE — inspect and clean before replacing anything.',
          S.steps([('Errors or loss', 'on a fiber run'), ('Inspect the end face', 'fiber scope shows dirt'), ('Clean and retest', 'loss returns to normal')], title='Cleaning fiber connectors', tones=['red', 'blue', 'green']),
          caption='Dirty fiber end faces cause loss and errors; inspect and clean them first.')

    b.add('5.2', 'Transceiver and fiber type mismatch',
          'A link fails or errors when the transceivers do not match each other or the fiber, for example a single-mode transceiver on multimode fiber, mismatched wavelengths (850 versus 1310 nm), or incompatible speeds.',
          'explain why a 10GBASE-LR transceiver does not work over a multimode fiber patch cord',
          ['A dirty connector', 'A duplex mismatch', 'Crosstalk'],
          'Match the transceiver, WAVELENGTH, and fiber type at both ends — single-mode and multimode do not mix.',
          S.table(['Transceiver', 'Needs'], [('SR (850 nm)', 'multimode fiber'), ('LR (1310 nm)', 'single-mode fiber'), ('Both ends', 'the same type and wavelength')], title='Matching optics', col_widths=[0.4, 0.6]),
          caption='Transceivers and fiber must match in type and wavelength or the link will fail or error.')

    b.add('5.2', 'Failed switch port',
          'A faulty switch port or network card that will not link or passes errors; test by moving the cable to another port, trying a known-good device, or using a loopback plug, then replace the port\'s module or the switch.',
          'determine whether a dead link is caused by the switch port or by the cable by trying a known-good port and cable',
          ['A VLAN mismatch', 'A duplex mismatch', 'An ACL problem'],
          'Swap one variable at a time — a different port, cable, or device isolates the failure.',
          S.steps([('Link is down', 'light off or no link'), ('Move to another port', 'known-good cable'), ('Still failing?', 'port bad or device bad')], title='Isolating a bad port', tones=['red', 'blue', 'amber']),
          caption='Moving the cable to a known-good port, or using a loopback, isolates a failed port.')

    b.add('5.2', 'Link and activity LEDs',
          'Port LEDs show link state and traffic: no link light usually means a physical-layer problem such as a bad cable, port, or transceiver, and a solid link with no activity light points higher in the stack.',
          'use a port\'s status lights to decide whether a problem is physical or in configuration',
          ['The routing table', 'The ARP cache', 'SNMP polling'],
          'No LINK light means look at cable, port, or transceiver first — physical layer before everything else.',
          S.table(['LED', 'Meaning'], [('Link off', 'no physical connection'), ('Link on, no activity', 'connected but idle or misconfigured'), ('Link on, blinking', 'traffic is flowing'), ('Amber or flapping', 'fault, speed, or duplex issue')], title='Reading port LEDs', col_widths=[0.4, 0.6]),
          caption='Port LEDs reveal link and activity, a fast first check for physical problems.')

    b.add('5.2', 'PoE budget exceeded',
          'A switch can power only as many devices as its total PoE budget allows; when demand exceeds it, ports go down or low-priority devices are denied, which is fixed by setting port priorities, a larger-budget switch, or local power.',
          'explain why some IP phones and access points lose power after more PoE devices were added to the same switch',
          ['A duplex mismatch', 'A dirty fiber connector', 'A VLAN mismatch'],
          'The switch\'s total POWER BUDGET ran out — raise the budget or reduce the load.',
          S.steps([('More PoE devices added', 'demand rises'), ('Budget exceeded', 'low-priority ports denied'), ('Fix', 'priority or bigger switch')], title='PoE budget', tones=['amber', 'red', 'green']),
          caption='When PoE demand exceeds the switch\'s budget, some devices lose power.')

    b.add('5.2', 'Rollover (console) cable',
          'A flat console cable with reversed pin assignments, with an RJ45 end and a serial or USB adapter, used to connect a computer to a device\'s console port for out-of-band configuration.',
          'identify the cable used to connect a laptop to a switch\'s console port for initial configuration',
          ['A crossover cable', 'A straight-through cable', 'A Cat 6a patch cable'],
          'For the CONSOLE port — pins are reversed end to end, unlike a normal Ethernet cable.',
          S.steps([('Laptop', 'serial or USB adapter'), ('Rollover cable', 'RJ45, pins reversed'), ('Console port', 'out-of-band access')], title='Console connection', tones=['plain', 'blue', 'green']),
          caption='A rollover cable connects a computer to a device\'s console port.')

    b.add('5.2', 'Crossover cable',
          'A twisted-pair cable wired with the transmit and receive pairs swapped (T568A on one end, T568B on the other), used to connect like devices directly, such as switch to switch, although auto-MDIX makes it unnecessary on modern gear.',
          'connect two older switches directly where neither port has auto-MDIX',
          ['A rollover cable', 'A straight-through cable', 'A coaxial cable'],
          'TX and RX swapped for like devices — A on one end and B on the other.',
          S.compare(('Straight-through', ['Same standard both ends', 'PC to switch', 'Unlike devices']), ('Crossover', ['T568A one end, T568B the other', 'Switch to switch', 'Like devices']), title='Ethernet cable types'),
          caption='A crossover cable swaps transmit and receive pairs to connect like devices directly.')

    b.add('5.2', 'Electromagnetic interference (EMI)',
          'Noise from motors, fluorescent lights, power cables, and radio sources that corrupts signals on copper cabling, causing errors and slowdowns; use shielded cable, keep a distance from sources, or switch to fiber.',
          'fix intermittent errors on a copper run that passes right next to a large electric motor',
          ['Attenuation', 'Crosstalk', 'A duplex mismatch'],
          'Noise from OUTSIDE the cable — reroute, shield it, or use fiber, which is immune to EMI.',
          S.steps([('Copper near a motor', 'noise induced on the pairs'), ('Errors and retransmits', 'CRC errors rise'), ('Reroute or shield', 'or use fiber')], title='EMI', tones=['amber', 'red', 'green']),
          caption='EMI corrupts copper signals; reroute, shield the cable, or use fiber.')

    b.add('5.2', 'Overheating network hardware',
          'Failed fans, blocked airflow, or a hot room cause devices to throttle, reboot, or fail; check temperature sensors and logs, clear vents, confirm airflow direction matches the rack, and restore cooling.',
          'investigate a core switch that reboots randomly and reports high temperature in its logs',
          ['A VLAN mismatch', 'An MTU mismatch', 'A DHCP exhaustion'],
          'Check TEMPERATURE logs, fans, and airflow before blaming software.',
          S.steps([('Heat builds up', 'failed fan or blocked vent'), ('Throttles or reboots', 'thermal protection'), ('Restore cooling', 'fans, airflow, room')], title='Overheating', tones=['amber', 'red', 'green']),
          caption='Failed fans or blocked airflow overheat equipment, causing reboots and failures.')

    b.add('5.2', 'Fiber bend radius',
          'Bending a fiber tighter than its minimum bend radius, commonly about ten times the cable diameter, leaks light and can break the glass, causing loss and intermittent failures.',
          'explain why a fiber patch cord pinched around a tight rack corner shows high loss',
          ['Crosstalk', 'A TX/RX swap', 'A dirty connector'],
          'Respect the minimum BEND RADIUS — sharp bends leak light and a visual fault locator will show it.',
          S.facts([('Rule of thumb', 'about 10 times the cable diameter'), ('Too tight', 'light leaks out, glass can crack'), ('Symptom', 'high loss, intermittent link'), ('Locate with', 'a visual fault locator')], title='Bend radius'),
          caption='Tight bends in fiber leak light and cause loss, so keep to the minimum bend radius.')

    # ------------------------------------------------------------------------------------------ 5.3 switching and routing issues
    b.add('5.3', 'Switching loop (STP failure)',
          'A Layer 2 loop, caused by redundant links without working spanning tree, makes frames circulate endlessly, producing a broadcast storm, saturated links, MAC table instability, and high CPU on switches.',
          'diagnose a network that suddenly becomes unusable with every switch link at 100% and port LEDs blinking in unison',
          ['A DHCP exhaustion', 'An MTU mismatch', 'A bad subnet mask'],
          'Redundant links with no working STP create a LOOP — frames have no TTL at Layer 2, so the storm never ends.',
          S.steps([('Redundant link, no STP', 'a loop forms'), ('Broadcast storm', 'links saturate, CPUs spike'), ('Remove the loop', 'fix STP, BPDU guard')], title='Layer 2 loop', tones=['amber', 'red', 'green']),
          caption='A Layer 2 loop without working STP causes a broadcast storm that saturates the network.')

    b.add('5.3', 'Incorrect VLAN assignment',
          'A device placed in the wrong VLAN cannot reach its gateway or peers and may get an address from the wrong DHCP scope; verify the access port\'s VLAN and the device\'s expected subnet.',
          'figure out why a workstation moved to a new desk gets an address from the wrong subnet and cannot reach its servers',
          ['A routing loop', 'A duplicate IP address', 'An NTP time drift'],
          'Check the PORT\'S VLAN first — the host sits in a different broadcast domain than it expects.',
          S.steps([('PC moves to a new port', 'port is in VLAN 30'), ('Wrong VLAN 30 scope', 'wrong subnet'), ('Servers unreachable', 'set the port to VLAN 20')], title='Wrong VLAN', tones=['plain', 'amber', 'green']),
          caption='A port in the wrong VLAN places a device in the wrong subnet and cuts it off.')

    b.add('5.3', 'Incorrect IP address',
          'A host with a wrong, mistyped, or out-of-subnet static address cannot communicate correctly with its gateway or peers; verify the address, mask, and gateway against the subnet plan with ipconfig and ping.',
          'find why a server with a mistyped static address cannot be reached from other subnets',
          ['A duplicate MAC address', 'An expired DHCP lease', 'A broadcast storm'],
          'Compare the address, MASK, and gateway with the plan — one wrong octet puts it in a different subnet.',
          S.facts([('Check', 'ipconfig or ip addr'), ('Compare', 'address, mask, gateway vs plan'), ('Test', 'ping gateway, then remote host'), ('Fix', 'correct the address or use DHCP')], title='Verifying addressing'),
          caption='A wrong static address puts a host in the wrong subnet or out of range of its gateway.')

    b.add('5.3', 'Overlapping subnets',
          'Two networks using address ranges that overlap cause routing ambiguity, since a router cannot tell which interface owns a destination, resulting in unreachable hosts or traffic sent to the wrong place.',
          'explain why a new branch whose subnet overlaps the headquarters range can reach only some HQ servers',
          ['A DHCP exhaustion', 'A broadcast storm', 'An MTU mismatch'],
          'Two networks claim the SAME addresses — the router cannot choose, so fix the addressing plan.',
          S.compare(('Overlap', ['HQ 10.10.0.0/16', 'Branch 10.10.4.0/24', 'Router cannot tell them apart']), ('Fixed plan', ['HQ 10.10.0.0/16', 'Branch 10.20.4.0/24', 'Unique, summarizable ranges']), title='Overlapping addressing', tones=('red', 'green')),
          caption='Overlapping subnets make routing ambiguous; each network needs a unique range.')

    b.add('5.3', 'Missing default route',
          'Without a default route (or a specific one), a router or host drops traffic to unknown networks, so remote and Internet destinations are unreachable while local ones still work.',
          'diagnose a router that reaches internal subnets but cannot reach anything on the Internet',
          ['A duplicate IP address', 'An expired DHCP lease', 'A VLAN mismatch'],
          'Local reachability works but REMOTE does not — look for the missing 0.0.0.0/0 route.',
          S.terminal(['show ip route', 'C  10.0.0.0/24 is directly connected, Gi0/0', 'Gateway of last resort is not set', '# add: ip route 0.0.0.0 0.0.0.0 203.0.113.1'], title='Router CLI'),
          caption='A missing default route leaves remote and Internet destinations unreachable.')

    b.add('5.3', 'Incorrect DNS server settings',
          'Hosts configured with a wrong, unreachable, or slow DNS server can reach sites by IP address but not by name, or experience long delays; verify DHCP options and test with nslookup against each server.',
          'work out why users can ping an IP address but cannot open websites by name after a DHCP scope change',
          ['A bad default gateway', 'A duplex mismatch', 'A rogue access point'],
          'Works by IP but NOT by name points to DNS — check the DNS server addresses delivered by DHCP.',
          S.steps([('ping 8.8.8.8 works', 'routing is fine'), ('ping example.com fails', 'name does not resolve'), ('Fix the DNS server', 'DHCP option or static')], title='Name resolution failure', tones=['green', 'red', 'blue']),
          caption='If IP addresses work but names fail, check the DNS server settings.')

    # ------------------------------------------------------------------------------------------ 5.4 performance
    b.add('5.4', 'Insufficient wireless coverage',
          'Users in some areas have weak or no signal because access points are too few, badly placed, or blocked by walls and equipment; a site survey and heat map guide adding or moving APs.',
          'resolve dead spots in a warehouse corner where Wi-Fi is weak or missing',
          ['Channel overlap', 'An MTU mismatch', 'A broadcast storm'],
          'Weak signal in a PLACE — survey, then add or reposition APs rather than raising power blindly.',
          S.steps([('Complaints in one area', 'weak or no signal'), ('Survey and heat map', 'find the dead spots'), ('Add or move APs', 'verify coverage')], title='Fixing coverage', tones=['amber', 'blue', 'green']),
          caption='Dead spots come from too few or badly placed APs; a survey shows where to add or move them.')

    b.add('5.4', 'Client disassociation',
          'Clients repeatedly drop from the wireless network because of weak signal, interference, an overloaded AP, aggressive power-saving, roaming problems, or authentication timeouts; check logs on the controller and the client.',
          'investigate laptops that keep disconnecting from the Wi-Fi every few minutes despite showing a connection',
          ['A broadcast storm', 'An MTU mismatch', 'A routing loop'],
          'Repeated DROPS point to signal, interference, load, or roaming — read the controller logs for the reason code.',
          S.table(['Likely cause', 'Check'], [('Weak signal', 'RSSI and SNR at the client'), ('Interference', 'channel and spectrum'), ('AP overload', 'client count per AP'), ('Roaming problem', 'thresholds and SSID settings')], title='Why clients disassociate', col_widths=[0.4, 0.6]),
          caption='Clients drop from Wi-Fi because of signal, interference, load, or roaming problems.')

    b.add('5.4', 'Roaming misconfiguration',
          'Clients stick to a distant AP or fail to hand off when APs use different SSIDs, security settings, or VLANs, or have poor channel and power planning; consistent configuration and tuned thresholds fix it.',
          'fix users who lose connectivity when walking between floors because their phones cling to the first access point',
          ['Channel bonding', 'Beamforming', 'An evil twin'],
          'Roaming needs the SAME SSID and security on every AP — mismatches and bad power levels break the handoff.',
          S.steps([('Client moves away', 'signal weakens'), ('Settings mismatch', 'SSID or security differ'), ('No handoff', 'align the settings')], title='Roaming problems', tones=['plain', 'amber', 'green']),
          caption='Roaming fails when APs differ in SSID, security, or VLAN, or have poor power planning.')

    b.add('5.4', 'Access point capacity overload',
          'Too many clients on one access point or channel in a high-density area, such as a lecture hall, exhaust airtime and cause slow throughput and drops even with good signal; add APs, use more channels, or use higher bands.',
          'resolve slow Wi-Fi in a crowded conference room where 200 devices share one access point',
          ['Insufficient coverage', 'Crosstalk', 'A TX/RX swap'],
          'Strong signal but too many CLIENTS — add capacity, not range.',
          S.compare(('Coverage problem', ['Weak signal in an area', 'Few clients affected', 'Add or move APs']), ('Capacity problem', ['Strong signal, slow speeds', 'Many clients on one AP', 'Add APs and channels']), title='Coverage vs capacity'),
          caption='Too many clients on one AP exhaust airtime; add access points and channels.')

    b.add('5.4', 'Throughput versus bandwidth',
          'Bandwidth is the maximum capacity of a link, while throughput is the data actually delivered after overhead, congestion, errors, and retransmissions, so measured throughput is normally lower than the rated bandwidth.',
          'explain why a 1 Gb/s link measures well under 1 Gb/s of useful data transfer in a speed test',
          ['Latency', 'Jitter', 'Packet loss'],
          'Bandwidth is the PIPE size and throughput is what really gets through it.',
          S.compare(('Bandwidth', ['Rated link capacity', 'Maximum possible', 'For example 1 Gb/s']), ('Throughput', ['Actual data delivered', 'After overhead and loss', 'Measured with a speed test']), title='Bandwidth vs throughput'),
          caption='Throughput is the usable data actually delivered; it is lower than the link\'s rated bandwidth.')

    b.add('5.4', 'QoS misconfiguration',
          'Incorrect or missing traffic marking and queueing, such as voice not prioritized or markings stripped at a boundary, lets bulk traffic delay time-sensitive traffic and causes choppy calls even when bandwidth looks adequate.',
          'find why VoIP calls sound choppy during large file transfers even though the link is not full',
          ['A duplex mismatch', 'An MTU mismatch', 'A rogue DHCP server'],
          'Voice must be marked and QUEUED first — unmarked traffic waits behind the file transfer.',
          S.steps([('Voice and files share', 'a link, both unmarked'), ('Bulk data fills queues', 'voice waits, jitters'), ('Prioritize voice', 'low-latency queue')], title='QoS problems', tones=['plain', 'red', 'green']),
          caption='Missing or wrong QoS lets bulk traffic delay voice and other time-sensitive traffic.')

    # ------------------------------------------------------------------------------------------ 5.5 configuration issues
    b.add('5.5', 'NAT misconfiguration',
          'Incorrect NAT rules, such as a missing translation, wrong inside and outside interfaces, or an exhausted pool, prevent internal hosts from reaching the Internet or stop published services from being reachable.',
          'find why internal users have lost Internet access after a NAT change on the edge router',
          ['A duplex mismatch', 'A DHCP exhaustion', 'A broadcast storm'],
          'Check inside and outside INTERFACES, the translation rule, and the pool or overload settings.',
          S.terminal(['show ip nat translations', 'Pro Inside global     Inside local', '--- (no entries for 10.0.0.0/24)', '# missing rule or wrong inside interface'], title='Router CLI'),
          caption='NAT misconfiguration blocks outbound access or published services; verify rules and interfaces.')

    b.add('5.5', 'Trunk allowed-VLAN mismatch',
          'A trunk that does not allow a VLAN, or whose native VLAN differs between the two ends, silently drops that VLAN\'s traffic, so devices in it cannot cross the link even though the trunk is up.',
          'diagnose why one VLAN cannot cross a trunk link even though other VLANs work normally',
          ['A failed switch port', 'An incorrect default gateway', 'A dirty fiber connector'],
          'The trunk is UP but does not carry that VLAN — check the allowed list and the native VLAN on both ends.',
          S.compare(('Trunk A allows', ['VLANs 10, 20, 30', 'Native VLAN 1', 'Looks correct']), ('Trunk B allows', ['VLANs 10, 20', 'Native VLAN 99', 'VLAN 30 dropped, native mismatch']), title='Trunk configuration mismatch', tones=('green', 'red')),
          caption='A trunk drops VLANs it does not allow, and mismatched native VLANs cause further problems.')

    b.add('5.5', 'Port security violation',
          'When more MAC addresses than allowed, or an unauthorized MAC, appear on a port with port security enabled, the switch can shut the port down (err-disabled), so a device that was moved or replaced suddenly loses connectivity.',
          'explain why a port went down immediately after someone plugged a different laptop into the desk jack',
          ['A broadcast storm', 'A routing loop', 'Attenuation'],
          'The port is ERR-DISABLED by policy — clear the violation and update the allowed MAC.',
          S.steps([('New laptop plugged in', 'new MAC address'), ('Violates port security', 'only one MAC allowed'), ('Port err-disabled', 'shut down, then clear it')], title='Port security violation', tones=['plain', 'red', 'amber']),
          caption='A port security violation can shut a port down when an unexpected MAC address appears.')

    b.add('5.5', 'Missing DHCP relay (IP helper)',
          'When a router interface has no relay configured, DHCP broadcasts from clients on that VLAN never reach a server on another subnet, so those clients fall back to APIPA addresses while other VLANs work.',
          'diagnose a new VLAN whose clients all get 169.254.x.x addresses while every other VLAN receives addresses normally',
          ['An exhausted DHCP scope', 'A rogue DHCP server', 'A duplicate IP address'],
          'APIPA only on the NEW VLAN means the broadcast never reaches the server — add the IP helper.',
          S.steps([('New VLAN, no relay', 'DHCP Discover stays local'), ('No server reply', 'clients use 169.254.x.x'), ('Add ip helper-address', 'point it at the DHCP server')], title='Missing relay', tones=['amber', 'red', 'green']),
          caption='Without a DHCP relay, clients on a new VLAN cannot reach a remote DHCP server and use APIPA.')

    b.add('5.5', 'Suboptimal STP root placement',
          'If spanning tree elects an access switch as root bridge because priorities were left at defaults, traffic takes inefficient paths through it; set a low priority on the intended core switch (and a backup) so it becomes the root.',
          'explain why traffic between two core switches detours through a closet switch after a new switch was added',
          ['A routing loop', 'A broadcast storm', 'An MTU mismatch'],
          'The root is chosen by LOWEST bridge ID — a new switch with a lower MAC can win if priorities are default.',
          S.steps([('Default priorities', '32768 on every switch'), ('Lowest MAC wins root', 'an access switch'), ('Lower core priority', 'core becomes root')], title='STP root placement', tones=['plain', 'amber', 'green']),
          caption='Set a low STP priority on the intended core switch so a random switch does not become root.')

    b.add('5.1', 'Gather information and question users',
          'Early in troubleshooting, collect symptoms, error messages, and logs, ask users what they were doing and what changed, and try to reproduce the problem, while treating several problems one at a time.',
          'interview the affected employees and review the logs to learn what happened and what changed before forming any theory',
          ['Establish a theory of probable cause', 'Test the theory to determine cause', 'Establish a plan of action and identify potential effects'],
          'Collect FACTS before theories — ask what changed and try to reproduce the problem.',
          S.steps([('Question users', 'what changed?'), ('Gather evidence', 'logs and symptoms'), ('Reproduce it', 'if possible')], title='Identifying the problem', tones=['plain', 'blue', 'green']),
          caption='Identifying a problem means gathering evidence, questioning users, and finding what changed.')

    b.add('5.1', 'Top-to-bottom and bottom-to-top troubleshooting',
          'Two ways to work through the OSI model when forming a theory: bottom-to-top starts at the physical layer, good for suspected cabling or hardware faults, and top-to-bottom starts at the application layer, good when one application misbehaves.',
          'decide which OSI direction to troubleshoot in when a single application fails but everything else on the network works',
          ['Divide and conquer', 'Question the obvious', 'Escalate to the vendor'],
          'ONE application failing → start at the top; suspected cabling or hardware → start at the bottom.',
          S.compare(('Bottom-to-top', ['Start at Layer 1', 'Cables and ports first', 'Link or device faults']), ('Top-to-bottom', ['Start at Layer 7', 'Application settings first', 'One app misbehaving']), title='OSI troubleshooting directions'),
          caption='Bottom-to-top starts at the physical layer; top-to-bottom starts at the application layer.')

    b.add('5.1', 'Divide and conquer',
          'Starting in the middle of the stack, such as testing Layer 3 with a ping, and then moving up or down depending on the result, which narrows the search faster than starting at either end.',
          'start troubleshooting by pinging a remote host to decide whether to look at the lower or upper layers next',
          ['Top-to-bottom and bottom-to-top troubleshooting', 'Question the obvious', 'Duplicate the problem'],
          'Begin in the MIDDLE and halve the search — a ping success points up the stack, a failure points down.',
          S.flow_split(('Ping the remote host', 'Layer 3 test'), [('Ping works', 'look at upper layers'), ('Ping fails', 'look at lower layers')], title='Divide and conquer', tones=['green', 'amber']),
          caption='Divide and conquer starts mid-stack and moves up or down based on the result.')

    b.add('5.2', 'Administratively down',
          'An interface status meaning the port was deliberately disabled with the shutdown command, so show interfaces reports administratively down; the fix is no shutdown, unlike a physical fault, which shows down/down.',
          'bring back a switch port that an engineer turned off on purpose and forgot to re-enable',
          ['Error disabled port', 'Failed switch port', 'Port security violation'],
          'Turned off by the SHUTDOWN command — the cure is no shutdown, not a new cable.',
          S.table(['Status', 'Meaning'], [('up/up', 'working normally'), ('down/down', 'physical problem'), ('administratively down', 'shutdown command issued')], title='Interface status', col_widths=[0.45, 0.55]),
          caption='Administratively down means the port was disabled with the shutdown command.')

    b.add('5.2', 'Suspended port',
          'A port held out of a link aggregation bundle because its settings, such as speed, duplex, VLANs, or LACP mode, do not match the other members or the peer, so it passes no traffic until the mismatch is fixed.',
          'work out why one member of a bundled uplink pair carries no traffic after its speed setting was changed',
          ['Administratively down', 'Error disabled port', 'Switching loop (STP failure)'],
          'Mismatched LAG settings put a member in SUSPENDED state — make the members identical.',
          S.steps([('Member setting differs', 'speed or VLANs'), ('Bundle rejects it', 'port suspended'), ('Settings matched', 'port rejoins')], title='Suspended bundle member', tones=['amber', 'red', 'green']),
          caption='A suspended port is held out of a link aggregation bundle because its settings do not match.')

    # ------------------------------------------------------------------------------------------ added 2026-11-03 (official-objective gaps)
    b.add('5.1', 'Question the obvious',
          'While building a theory, check the simple, common explanations first, such as whether the device is powered on, the cable is plugged in, the port is enabled, and a recent change touched it, before investigating complex causes.',
          'check that the cable is plugged in and the port is enabled before suspecting a routing fault in a user\'s no-connection report',
          ['Divide and conquer', 'Top-to-bottom and bottom-to-top troubleshooting', 'Duplicate the problem'],
          'Check the SIMPLE things first (power, cable, settings) — divide and conquer is about where in the stack to start.',
          S.steps([('Simple checks', 'power, cable, enabled?'), ('Common causes', 'recent changes'), ('Complex causes', 'only if those pass')], title='Question the obvious', tones=['green', 'blue', 'amber']),
          caption='Question the obvious means checking simple, common causes before investigating complex ones.')

    b.add('5.2', 'Improper termination',
          'A cable end that is wired or terminated badly: wires untwisted too far, pairs in the wrong order or split across pairs, poor crimps or punchdowns, or loose connectors, which causes crosstalk, high error rates, or an open; a wire map or cable tester shows it, and the fix is to re-terminate.',
          'explain why a newly terminated wall jack passes some pairs but shows errors and a failed wire map on the cable tester',
          ['Attenuation', 'Electromagnetic interference (EMI)', 'Cable length exceeds standard'],
          'A bad TERMINATION — redo the crimp or punchdown, because the cable itself may be fine.',
          S.compare(('Good termination', ['Pairs in T568 order', 'Twists kept to the end', 'Passes a wire map']), ('Improper termination', ['Wrong or split pairs', 'Untwisted too far', 'Opens, shorts, errors']), title='Terminating a cable', tones=('green', 'red')),
          caption='Improper termination, such as wrong pairs or untwisted ends, causes opens, shorts, and errors.')

    b.add('5.2', 'Incorrect cable type',
          'Using a cable that does not match the link: multimode fiber with a single-mode transceiver (or the reverse), a category too low for the speed (for example Cat 5e for 10 Gb/s), or unshielded twisted pair where interference calls for shielded cable or fiber.',
          'find why a 10 Gb link over old Cat 5e cabling shows many errors even though the cable passes a continuity test',
          ['Duplex mismatch', 'Cable length exceeds standard', 'Administratively down'],
          'The cable does not match the SPEED, FIBER MODE, or SHIELDING the link needs — continuity can pass and it still fails at speed.',
          S.table(['Link need', 'Wrong cable', 'Right cable'], [('10 Gb/s copper', 'Cat 5e', 'Cat 6a'), ('Single-mode optics', 'Multimode', 'Single-mode'), ('Noisy area', 'UTP', 'STP or fiber')], title='Matching the cable to the link', col_widths=[0.38, 0.30, 0.32]),
          caption='An incorrect cable type does not match the speed, fiber mode, or shielding the link needs.')

    b.add('5.2', 'Runts',
          'Frames shorter than the 64-byte Ethernet minimum, counted on an interface as runts; they usually come from collisions on a half-duplex link, a duplex mismatch, or a faulty NIC or port, and a rising count means the link is unhealthy.',
          'identify the interface counter that rises when frames arrive smaller than the 64-byte Ethernet minimum',
          ['Giants', 'CRC errors', 'Output drops'],
          'RUNTS are too SMALL (under 64 bytes) — giants are too big, and CRC errors are the right size but corrupted.',
          S.facts([('Counter', 'runts'), ('Meaning', 'frames under 64 bytes'), ('Common cause', 'collisions, duplex mismatch'), ('Also check', 'the NIC, port, and cable')], title='Runts'),
          caption='A runt is an Ethernet frame under the 64-byte minimum, often from collisions or a duplex mismatch.')

    b.add('5.2', 'Giants',
          'Frames larger than the maximum Ethernet size (1518 bytes, or 1522 with a VLAN tag), counted as giants; they appear when jumbo frames reach a port not configured for them, when there is an MTU mismatch, or when a NIC malfunctions.',
          'identify the interface counter that rises when a port receives frames larger than its maximum allowed size after a jumbo-frame change',
          ['Runts', 'CRC errors', 'Output drops'],
          'GIANTS are too BIG — look for jumbo frames sent to a port that is not set for them, or an MTU mismatch.',
          S.facts([('Counter', 'giants'), ('Meaning', 'frames above the maximum size'), ('Normal maximum', '1518 bytes (1522 tagged)'), ('Common cause', 'jumbo frames, MTU mismatch')], title='Giants'),
          caption='Giants are frames larger than the Ethernet maximum, often from jumbo frames or an MTU mismatch.')

    b.add('5.2', 'Interface drops (discards)',
          'A counter of frames the interface discarded without forwarding, such as output drops when a queue is full during congestion or input drops when a device cannot keep up; rising drops point to congestion, an oversubscribed uplink, or missing QoS.',
          'see why an uplink counter keeps climbing with frames that were discarded because the outbound queue was full during peak traffic',
          ['CRC errors', 'Runts', 'Giants'],
          'Frames DISCARDED, not corrupted — look for congestion, an oversubscribed link, or QoS that is not protecting the traffic.',
          S.steps([('Traffic bursts', 'above the link speed'), ('Queue fills', 'the buffer is full'), ('Drops counted', 'frames discarded')], title='Output drops', tones=['amber', 'blue', 'red']),
          caption='Interface drops count frames discarded when queues fill, usually from congestion.')

    b.add('5.2', 'Error disabled port',
          'A protective shutdown in which a switch disables a port after a violation, such as a port security violation, a BPDU guard trigger, or a detected loop; the port shows err-disabled and stays down until the cause is fixed and the port is re-enabled, manually or by an automatic recovery timer.',
          'bring back a port that went down by itself after someone connected an unauthorized switch to an access port that has BPDU guard enabled',
          ['Administratively down', 'Suspended port', 'Failed switch port'],
          'The SWITCH shut it for a violation — administratively down means a person ran shutdown, and the cause must be removed first.',
          S.steps([('Violation', 'port security or BPDU'), ('Err-disabled', 'switch shuts the port'), ('Fix the cause', 'then re-enable it')], title='Error-disabled port', tones=['amber', 'red', 'green']),
          caption='An error-disabled port was shut down by the switch after a violation and must be re-enabled.')

    b.add('5.2', 'Incorrect PoE standard',
          'A device needs more power than the switch port can supply because its standard is higher than the port\'s: 802.3af provides 15.4 W, 802.3at (PoE+) 30 W, and 802.3bt (PoE++) 60 or 90 W, so a camera or access point may reboot or not power on until the port, a midspan injector, or the switch is upgraded.',
          'work out why a high-power ceiling camera keeps rebooting when plugged into an older switch port that supplies only 15.4 watts',
          ['PoE budget exceeded', 'Duplex mismatch', 'Failed switch port'],
          'The PORT standard is too LOW for the device — a budget problem is the switch running out of total power across all its ports.',
          S.table(['Standard', 'Power per port'], [('802.3af (PoE)', '15.4 W'), ('802.3at (PoE+)', '30 W'), ('802.3bt (PoE++)', '60 or 90 W')], title='PoE standards', col_widths=[0.5, 0.5]),
          caption='A device that needs more power than the port standard supplies will not run correctly.')

    b.add('5.2', 'Transceiver signal strength (optical power)',
          'The light level a fiber transceiver sends and receives, shown as transmit and receive power in dBm by the switch (digital optical monitoring) or measured with an optical power meter; a receive level below the transceiver\'s sensitivity points to a dirty connector, too much loss, a tight bend, or a failing optic.',
          'check whether a flapping fiber link is receiving too little light by reading the transceiver\'s receive power or measuring with a power meter',
          ['Signal strength (RSSI) and SNR', 'Visual fault locator', 'CRC errors'],
          'Compare RECEIVE power with the optic\'s sensitivity — low light means dirt, bends, loss, or a failing transceiver.',
          S.steps([('Transmit power', 'light leaving the optic'), ('Link loss', 'dirt, bends, splices'), ('Receive power', 'must exceed sensitivity')], title='Optical power budget', tones=['green', 'amber', 'blue']),
          caption='Low receive power on a fiber link points to dirt, bends, loss, or a failing transceiver.')

    b.add('5.3', 'STP port roles and states',
          'Spanning tree gives each port a role and a state: the root port is a non-root switch\'s best path to the root bridge, designated ports forward toward the segments below them, and alternate or backup ports are standbys; classic states are blocking, listening, learning, and forwarding, while RSTP uses discarding, learning, and forwarding.',
          'explain which switch ports forward traffic and which are held in a blocking or discarding standby state in a loop-free spanning tree',
          ['Root bridge (STP)', 'BPDU guard', 'Link Aggregation (LACP)'],
          'Roles say WHAT a port does (root, designated, alternate); states say whether it forwards — only forwarding ports pass user traffic.',
          S.table(['Port role', 'Typical state'], [('Root port', 'forwarding'), ('Designated port', 'forwarding'), ('Alternate or backup', 'blocking or discarding')], title='STP port roles', col_widths=[0.5, 0.5]),
          caption='Each STP port has a role and a state; only forwarding ports carry user traffic.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Cabling, fiber, and hardware faults', ['5.2'],
              'Work from the physical layer up. A cable tester shows opens (broken conductors) and shorts (touching conductors), and EMI from motors and power cables corrupts copper, which you fix by rerouting, shielding, or using fiber. On fiber, clean and inspect dirty connector end faces first, match transceiver type, wavelength, and fiber (single-mode versus multimode) at both ends, and respect the minimum bend radius of about ten times the cable diameter.\n\n'
              'Installation faults show up on a cable tester or wire map: improper termination (wrong or split pairs, untwisted ends) and an incorrect cable type (wrong category, fiber mode, or shielding for the link). Interface counters add clues: CRC errors are corrupted frames, runts are under 64 bytes, giants exceed the maximum size, and drops are frames discarded when a queue fills. A fiber transceiver reports receive power, and low light means dirt, bends, loss, or a failing optic. Port LEDs give a quick answer: no link light points to the cable, port, or transceiver, which you isolate by moving one variable at a time. A switch can run out of PoE budget and drop devices, a device can need a higher PoE standard than the port supplies (af 15.4 W, at 30 W, bt 60 or 90 W), a switch can error-disable a port after a violation such as port security or BPDU guard, a rollover cable connects to the console port, a crossover cable swaps TX and RX for like devices, and failed fans or blocked airflow overheat equipment and cause reboots.')
    b.section('Switching, routing, and addressing problems', ['5.3'],
              'A Layer 2 loop with no working STP creates a broadcast storm with saturated links and blinking port LEDs; in a healthy spanning tree each port has a role (root, designated, alternate) and a state (forwarding, or blocking and discarding as standby). A device in the wrong VLAN gets addressing from the wrong subnet, a mistyped static address or overlapping subnets cause reachability problems, and a missing default route leaves remote and Internet destinations unreachable while local ones work.\n\n'
              'If a host can ping an IP address but not a name, check the DNS server settings it received. Compare each host\'s address, mask, and gateway against the plan and test outward: the gateway first, then a remote address, then a name.')
    b.section('Wireless and performance issues', ['5.4'],
              'Separate coverage from capacity: dead spots are a coverage problem solved with a site survey and added or moved APs, whereas strong signal with slow speeds in a crowded room is a capacity problem solved by adding APs and channels. Clients that drop repeatedly point to signal, interference, load, or roaming, and roaming needs the same SSID, security, and VLAN on every AP plus sensible power levels.\n\n'
              'Bandwidth is the rated capacity of a link while throughput is what is actually delivered after overhead, congestion, and retransmissions. Choppy voice during file transfers usually means QoS is missing or marks are being stripped, so voice waits behind bulk traffic.')
    b.section('More configuration issues', ['5.5'],
              'Several faults hide behind a working link. Bad NAT rules or interfaces stop Internet access or published services, a trunk that does not allow a VLAN (or has a native VLAN mismatch) drops that VLAN silently, and a port security violation can err-disable a port when an unexpected MAC appears. A new VLAN whose clients all show 169.254.x.x addresses usually has no DHCP relay (IP helper) toward the server.\n\n'
              'Spanning tree elects the root by the lowest bridge ID, so leave defaults in place and a random access switch can become root and cause inefficient paths: set a low priority on the intended core switch, and a backup, deliberately.')
    b.section('Methodology approaches and interface states', ['5.1', '5.2'],
              'When identifying a problem, gather information, question users, find out what changed, and try to reproduce it. To form a theory, question the obvious first (power, cabling, and settings), then work bottom-to-top (cabling and hardware suspected), top-to-bottom (one application misbehaving), or divide and conquer by starting in the middle with a ping. On interfaces, administratively down means someone ran shutdown (fix with no shutdown), down/down is a physical problem, error-disabled is a protective shutdown, and a suspended port is a link aggregation member whose settings do not match the rest of the bundle.')
