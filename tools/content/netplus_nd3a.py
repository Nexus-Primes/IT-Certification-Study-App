"""Network+ (N10-009), domain nd3 (Networking Operations), part 1: documentation, HA/DR, tools, and hardware tools."""
import svg as S

DOMAIN = 'nd3'


def build(b):
    b.topics['3.1'] = ['Physical/logical diagrams', 'Diagrams by layer', 'SOPs', 'Change management', 'Labeling', 'Rack and cable diagrams', 'Asset inventory', 'IPAM', 'SLA', 'Life cycle']
    b.topics['3.2'] = ['MTTR', 'MTBF', 'Hot/warm/cold sites', 'RPO and RTO', 'Active-active vs active-passive', 'Tabletop exercises']
    b.topics['3.3'] = ['ping', 'traceroute', 'nslookup', 'Protocol analyzer', 'ipconfig', 'arp and netstat', 'nmap', 'LLDP and CDP', 'Spectrum analyzer', 'show commands']
    b.topics['3.4'] = ['Cable tester', 'Tone generator', 'Crimping tool', 'Punchdown tool', 'Visual fault locator', 'Loopback plug', 'Network tap']

    # ------------------------------------------------------------------------------------------ 3.1 documentation
    b.add('3.1', 'Rack diagram',
          'A drawing of each equipment rack that shows which device sits in which rack unit, along with power connections and cabling, used for planning space and for finding equipment during troubleshooting.',
          'find which rack unit a switch occupies and how much space is free before adding a new server',
          ['A logical network diagram', 'A wireless heat map', 'An IP address management database'],
          'Shows the PHYSICAL layout of devices by rack unit — a logical diagram shows addressing and traffic flow.',
          S.layers([('U42', 'blank panel (free)', 'plain'), ('U20 to U21', 'file server, 2U', 'blue'), ('U19', 'core switch, 1U', 'primary'), ('U01 to U02', 'UPS, 2U', 'amber')], title='Rack diagram'),
          caption='A rack diagram records which device occupies each rack unit and how it is powered and cabled.')

    b.add('3.1', 'Cable map (cable diagram)',
          'Documentation that records which cable runs between which ports, wall jacks, and patch panel positions, supported by labels at both ends, so connections can be traced and changed without guesswork.',
          'trace which patch panel position and switch port a wall jack in room 214 connects to',
          ['A rack diagram', 'A logical network diagram', 'A service-level agreement'],
          'It maps each CABLE end to end — labels on both ends make the map usable.',
          S.steps([('Wall jack 214-B', 'room 214'), ('Patch panel 2, port 14', 'IDF 2'), ('Switch 2, Gi1/0/14', 'access port')], title='A cable trace', tones=['plain', 'blue', 'green']),
          caption='A cable map documents which port connects to which, end to end, with matching labels.')

    b.add('3.1', 'Asset inventory',
          'A maintained record of hardware, software, licenses, warranties, owners, locations, and asset tags for every network device, used for support, budgeting, auditing, and lifecycle planning.',
          'know every switch\'s serial number, location, warranty expiry, and firmware version when planning an audit',
          ['A rack diagram', 'A service-level agreement', 'An IP address management tool'],
          'The record of WHAT you own and its warranty and support status.',
          S.facts([('Hardware', 'model, serial, asset tag'), ('Software', 'versions and licenses'), ('Warranty', 'dates and support contract'), ('Ownership', 'location and responsible owner')], title='Asset inventory'),
          caption='An asset inventory tracks hardware, software, licenses, warranties, and owners.')

    b.add('3.1', 'IP address management (IPAM)',
          'A tool or process for planning, tracking, and managing the IP address space together with DHCP and DNS, preventing duplicate assignments and documenting which subnet and device each address belongs to.',
          'avoid duplicate address assignments and keep a central record of every subnet, scope, and static address',
          ['An asset inventory', 'A cable map', 'A change management log'],
          'It manages ADDRESSES, DHCP, and DNS in one place — an asset inventory tracks devices.',
          S.hub(('IPAM', 'one source of truth for addressing'), [('Subnets', 'allocation and usage'), ('DHCP scopes', 'ranges and reservations'), ('DNS records', 'names matched to addresses')]),
          caption='IPAM tracks and manages IP subnets, DHCP, and DNS to prevent conflicts.')

    b.add('3.1', 'Service-level agreement (SLA)',
          'A contract between a provider and customer that defines measurable service levels, such as 99.99% uptime, response and resolution times, and the penalties or credits if they are missed.',
          'hold a WAN provider to a guaranteed availability level, with credits if it is not met',
          ['A standard operating procedure', 'A baseline', 'A memorandum of understanding'],
          'A contract with MEASURABLE targets and remedies — an SOP is an internal how-to.',
          S.table(['Term', 'Example target'], [('Availability', '99.99% uptime per month'), ('Response time', 'critical tickets in 15 minutes'), ('Resolution time', 'restore in 4 hours'), ('Remedy', 'service credits')], title='Typical SLA terms', col_widths=[0.4, 0.6]),
          caption='An SLA sets measurable service levels and remedies between a provider and a customer.')

    b.add('3.1', 'Wireless heat map',
          'A floor-plan visualization produced by a wireless site survey that shows signal strength and coverage with color, used to place access points, find dead zones, and verify coverage after changes.',
          'show where Wi-Fi coverage is weak on a floor plan after a site survey',
          ['A logical network diagram', 'A cable map', 'A rack diagram'],
          'Color-coded SIGNAL coverage on a floor plan — the output of a site survey.',
          S.compare(('Strong signal', ['Green and yellow zones', 'Near an access point', 'Good throughput']), ('Weak signal', ['Red and blue zones', 'Far from any AP', 'Dead spots to fix']), title='Reading a heat map', tones=('green', 'red')),
          caption='A heat map shows Wi-Fi signal strength across a floor plan to reveal weak spots.')

    b.add('3.1', 'End of support (EOS)',
          'The vendor milestone after which a product no longer receives security patches, bug fixes, or technical support; it follows end of sale (no longer sold), and devices still in service after it are a security and reliability risk.',
          'identify the milestone after which a vendor provides no further security patches or technical support for a switch model',
          ['End of sale', 'A vendor warranty extension', 'Long-term support release'],
          'No more PATCHES or support — end of sale only means it can no longer be bought.',
          S.steps([('End of sale', 'no longer sold'), ('Support period', 'patches and help continue'), ('End of support', 'no patches, replace it')], title='Product life cycle', tones=['amber', 'blue', 'red']),
          caption='After end of support a vendor provides no patches or help, so the device should be replaced.')

    b.add('3.1', 'Firmware and patch management',
          'A controlled process for updating device firmware and software: read release notes, test in a lab, back up configurations, schedule a maintenance window, upgrade in a safe order, verify, and keep a rollback plan.',
          'upgrade the firmware on a pair of core switches safely, with a way back if it fails',
          ['Upgrading every device immediately in production', 'Ignoring updates until a failure occurs', 'Disabling the vendor support contract'],
          'TEST, back up, schedule, and keep a ROLLBACK — never patch production blind.',
          S.steps([('Test and back up', 'lab first, save configs'), ('Upgrade in a window', 'one device at a time'), ('Verify or roll back', 'confirm service')], title='Patching process', tones=['blue', 'amber', 'green']),
          caption='Patch network devices through testing, backups, a maintenance window, and a rollback plan.')

    b.add('3.1', 'Configuration backups and golden configurations',
          'Regularly saved copies of device configurations, together with an approved baseline (golden) configuration used as the template for new or replaced devices, so a failed device can be restored quickly and drift detected; the production configuration is what the device runs now, the backup is a saved copy, and the baseline is the approved standard.',
          'replace a failed switch quickly with the exact approved configuration the old one had',
          ['A cable map', 'An SNMP trap', 'A wireless survey'],
          'A saved GOLDEN configuration restores a replacement in minutes and shows later drift.',
          S.steps([('Approved baseline', 'golden configuration'), ('Automated backups', 'versioned copies'), ('Replace or restore', 'apply the saved config')], title='Configuration management', tones=['green', 'blue', 'primary']),
          caption='Saved and baseline configurations let you restore or replace a device quickly and spot drift.')

    b.add('3.1', 'Device decommissioning',
          'The orderly retirement of a network device: remove it from service, wipe its configuration and credentials, update the inventory, diagrams, IPAM, and monitoring, and dispose of or recycle it according to policy.',
          'retire an old router so that no configuration, credentials, or stale records remain',
          ['Powering it off and leaving it in the closet', 'Selling it with the configuration intact', 'Removing only its monitoring entry'],
          'WIPE it, update every record, then dispose — leaving configs behind leaks credentials.',
          S.steps([('Remove from service', 'traffic moved first'), ('Wipe and document', 'configs, inventory, IPAM'), ('Dispose by policy', 'recycle or destroy')], title='Decommissioning', tones=['amber', 'blue', 'green']),
          caption='Decommissioning wipes a device, updates documentation, and disposes of it per policy.')

    # ------------------------------------------------------------------------------------------ 3.2 HA/DR
    b.add('3.2', 'Recovery point objective (RPO)',
          'The maximum amount of data loss, measured in time, that an organization can tolerate after a disaster; it determines how often data must be backed up or replicated.',
          'decide how often to replicate data so that no more than 15 minutes of changes can ever be lost',
          ['Recovery time objective (RTO)', 'Mean time to repair (MTTR)', 'Mean time between failures (MTBF)'],
          'RPO is how much DATA you can lose — RTO is how long you can be down.',
          S.compare(('RPO', ['Acceptable data loss', 'Drives backup frequency', 'Measured backward in time']), ('RTO', ['Acceptable downtime', 'Drives recovery design', 'Measured forward to recovery']), title='RPO vs RTO'),
          caption='RPO is the acceptable amount of data loss measured in time.')

    b.add('3.2', 'Recovery time objective (RTO)',
          'The maximum time a service can be unavailable after a failure before the business is harmed; it determines how quickly recovery must complete and which standby sites or failover methods are needed.',
          'require that the payment network be restored within one hour of an outage',
          ['Recovery point objective (RPO)', 'Mean time to repair (MTTR)', 'Service-level agreement (SLA)'],
          'RTO is how long you can be DOWN — it picks hot, warm, or cold standby.',
          S.steps([('Outage begins', 'service down'), ('Recovery work', 'failover or restore'), ('Within the RTO', 'service restored')], title='Recovery time objective', tones=['red', 'amber', 'green']),
          caption='RTO is the longest acceptable downtime before service must be restored.')

    b.add('3.2', 'Active-active redundancy',
          'A high-availability design in which two or more devices or sites handle traffic at the same time, sharing the load, so that if one fails the others absorb its share with little or no interruption.',
          'use both firewalls to carry traffic at the same time so a failure of either one barely affects users',
          ['Active-passive redundancy', 'A cold site', 'A single large firewall'],
          'BOTH units work all the time — in active-passive the standby waits idle.',
          S.compare(('Active-active', ['Both units carry traffic', 'Load is shared', 'Capacity must cover a failure']), ('Active-passive', ['Standby waits idle', 'Takes over on failure', 'Simpler, wasted capacity']), title='Redundancy models'),
          caption='Active-active redundancy shares load across units so one failure is absorbed by the rest.')

    b.add('3.2', 'Active-passive redundancy',
          'A high-availability design in which one device carries traffic while a standby remains idle until it detects a failure and takes over, simpler than active-active but leaving standby capacity unused.',
          'keep a standby router idle until the primary fails, then let it take over automatically',
          ['Active-active redundancy', 'Load balancing across both', 'A hot site'],
          'The standby sits IDLE until failover — active-active uses both all the time.',
          S.steps([('Primary active', 'carries all traffic'), ('Failure detected', 'heartbeat lost'), ('Standby takes over', 'becomes active')], title='Active-passive failover', tones=['green', 'red', 'blue']),
          caption='In active-passive redundancy a standby takes over only when the active unit fails.')

    b.add('3.2', 'Tabletop exercise',
          'A discussion-based disaster recovery test in which stakeholders walk through a scenario step by step, checking roles, communication, and procedures without touching live systems.',
          'walk the response team through a simulated data center outage to find gaps in the plan without affecting production',
          ['A full failover test', 'A backup restore test', 'A penetration test'],
          'It is a DISCUSSION, not an actual failover — cheap and safe, so it is the first step before live tests.',
          S.steps([('Scenario announced', 'for example site loss'), ('Team talks it through', 'roles and steps'), ('Gaps recorded', 'plan updated')], title='Tabletop exercise', tones=['plain', 'blue', 'green']),
          caption='A tabletop exercise walks through a disaster scenario in discussion to find gaps in the plan.')

    b.add('3.2', 'Disaster recovery failover test',
          'A scheduled live test that actually fails services over to the standby site or devices, verifying that the plan, configurations, and staff can meet the RTO and RPO, followed by a failback and a lessons-learned review.',
          'prove that the standby site can really carry production traffic within the agreed recovery time',
          ['A tabletop exercise', 'A vulnerability scan', 'A configuration backup'],
          'An ACTUAL failover that measures real recovery time — a tabletop only discusses it.',
          S.steps([('Plan the test', 'window and criteria'), ('Fail over', 'standby carries traffic'), ('Measure and fail back', 'compare with RTO')], title='DR failover test', tones=['plain', 'blue', 'green']),
          caption='A DR failover test actually moves services to the standby to verify recovery objectives.')

    b.add('3.2', 'Multihoming (redundant ISP links)',
          'Connecting a site to two or more ISPs or circuits, typically with BGP or failover routing, so Internet connectivity survives the failure of a single provider or link.',
          'keep a headquarters online if its only ISP suffers an outage',
          ['A single high-bandwidth circuit', 'A larger UPS', 'Link aggregation to one switch'],
          'TWO providers, not just two cables — a second link to the same ISP shares its failures.',
          S.steps([('Edge router', 'two ISP connections'), ('Primary ISP fails', 'link or provider down'), ('Traffic shifts', 'to the second ISP')], title='Multihoming', tones=['blue', 'red', 'green']),
          caption='Multihoming uses multiple ISPs so one provider failure does not disconnect the site.')

    # ------------------------------------------------------------------------------------------ 3.3 tools
    b.add('3.3', 'arp',
          'A command (arp -a) that displays the ARP cache of IP-to-MAC mappings a host has learned, useful for spotting duplicate IP addresses or signs of ARP spoofing.',
          'view the IP-to-MAC mappings a host has learned to check for a duplicate address or ARP spoofing',
          ['netstat', 'nslookup / dig', 'ipconfig / ifconfig'],
          'IP-to-MAC mappings on the LOCAL segment — two IPs sharing one MAC is a warning sign.',
          S.terminal(['arp -a', 'Internet Address   Physical Address', '192.168.1.1        00-1a-2b-3c-4d-5e', '192.168.1.20       00-1a-2b-3c-4d-5e'], title='Command Prompt'),
          caption='arp -a lists the IP-to-MAC mappings a host knows; duplicates can reveal conflicts or spoofing.')

    b.add('3.3', 'netstat',
          'A command that lists active network connections, listening ports, and per-protocol statistics, with options to show the owning process or the routing table, used to see what a host is talking to.',
          'see which ports a server is listening on and which remote hosts have established connections',
          ['arp', 'ping', 'traceroute (tracert)'],
          'Connections and LISTENING ports on this host — ping only tests reachability.',
          S.terminal(['netstat -an', 'Proto  Local Address      State', 'TCP    0.0.0.0:443        LISTENING', 'TCP    10.0.0.5:443       ESTABLISHED'], title='Command Prompt'),
          caption='netstat shows listening ports and active connections on a host.')

    b.add('3.3', 'route',
          'A command (route print on Windows, ip route on Linux) that displays the local routing table and lets an administrator add or delete static routes on the host.',
          'view and edit the routing table on a single host to add a static route to another subnet',
          ['arp', 'netstat', 'nslookup / dig'],
          'The host\'s own ROUTING table — and the one that can add static routes.',
          S.terminal(['route print', 'Network Destination  Netmask  Gateway', '0.0.0.0              0.0.0.0  192.168.1.1', '10.20.0.0            255.255.0.0 192.168.1.254'], title='Command Prompt'),
          caption='route shows and edits the routing table on a host.')

    b.add('3.3', 'nmap',
          'A scanner that discovers live hosts, open ports, and service versions on a network, used for inventory and security auditing; scanning networks you do not own or have permission to test is prohibited.',
          'discover live hosts and open ports on a subnet during an authorized security audit',
          ['tcpdump', 'ping', 'netstat'],
          'It SCANS other hosts for open ports — netstat only reports on the host it runs on.',
          S.terminal(['nmap -sV 192.168.1.0/24', 'PORT    STATE SERVICE VERSION', '22/tcp  open  ssh     OpenSSH 9.2', '443/tcp open  https   nginx'], title='Terminal'),
          caption='nmap discovers hosts, open ports, and services during an authorized scan.')

    b.add('3.3', 'tcpdump',
          'A command-line packet capture tool for Unix-like systems that uses filters, for example port 53, to capture and display traffic on an interface; Wireshark is its graphical counterpart.',
          'capture DNS traffic on a headless Linux server from the command line',
          ['Wireshark', 'nmap', 'netstat'],
          'The command-line capture tool — Wireshark does the same with a graphical interface.',
          S.terminal(['tcpdump -i eth0 port 53', 'IP 10.0.0.5.51234 > 10.0.0.1.53: A? example.com', 'IP 10.0.0.1.53 > 10.0.0.5.51234: A 93.184.216.34'], title='Terminal'),
          caption='tcpdump captures and filters packets from the command line.')

    b.add('3.3', 'Link Layer Discovery Protocol (LLDP)',
          'A vendor-neutral Layer 2 protocol (IEEE 802.1AB) in which devices advertise their identity, port, and capabilities to directly connected neighbors, helping map topology and verify cabling.',
          'identify the vendor-neutral protocol switches use to advertise their name and port to directly connected neighbors',
          ['Cisco Discovery Protocol (CDP)', 'Address Resolution Protocol (ARP)', 'Simple Network Management Protocol (SNMP)'],
          'The VENDOR-NEUTRAL neighbor discovery protocol — CDP is the Cisco-proprietary equivalent.',
          S.compare(('LLDP', ['IEEE 802.1AB standard', 'Multi-vendor', 'Layer 2 neighbors']), ('CDP', ['Cisco proprietary', 'Cisco devices', 'Layer 2 neighbors']), title='Neighbor discovery'),
          caption='LLDP is the standard Layer 2 protocol for advertising device identity to neighbors.')

    b.add('3.3', 'Cisco Discovery Protocol (CDP)',
          'A Cisco-proprietary Layer 2 protocol that shares device name, model, and port information with directly connected Cisco neighbors; it is useful for mapping a network but reveals information, so it is often disabled on untrusted ports.',
          'identify the Cisco-proprietary protocol that lists directly connected neighbors and their ports',
          ['Link Layer Discovery Protocol (LLDP)', 'Spanning Tree Protocol (STP)', 'Address Resolution Protocol (ARP)'],
          'CISCO-only neighbor discovery — LLDP is the open standard.',
          S.facts([('Vendor', 'Cisco proprietary'), ('Layer', '2, between neighbors'), ('Shares', 'name, model, port, IP'), ('Security', 'disable on untrusted ports')], title='CDP'),
          caption='CDP is Cisco\'s proprietary neighbor discovery protocol.')

    b.add('3.3', 'Speed test',
          'A throughput test that measures download and upload speed, latency, and sometimes jitter between a client and a test server; results depend on the server, time of day, and local conditions, and iperf is used for internal LAN testing.',
          'measure the actual download and upload throughput a branch office gets from its ISP',
          ['A ping to the default gateway', 'A traceroute to the ISP', 'A protocol analyzer capture'],
          'Measures THROUGHPUT — ping and traceroute measure reachability and delay.',
          S.facts([('Measures', 'download, upload, latency'), ('Depends on', 'server, time of day, load'), ('LAN testing', 'iperf between two hosts'), ('Compare with', 'the provisioned rate')], title='Speed test'),
          caption='A speed test measures real throughput and latency between a client and a test server.')

    b.add('3.3', 'Wi-Fi analyzer',
          'A tool that scans for nearby wireless networks and shows their channels, signal strength, and overlap, used to choose the least congested channel, place access points, and find dead spots.',
          'find which channels neighboring networks use and choose the least congested one for a new access point',
          ['A protocol analyzer', 'A cable certifier', 'A tone generator'],
          'Shows channels and SIGNAL levels of nearby networks — a protocol analyzer decodes the traffic itself.',
          S.steps([('Scan', 'nearby SSIDs and channels'), ('Spot congestion', 'overlapping channels'), ('Pick a clean channel', 'adjust AP settings')], title='Wi-Fi analysis', tones=['plain', 'amber', 'green']),
          caption='A Wi-Fi analyzer shows channels and signal levels to choose clean channels and find weak spots.')

    b.add('3.3', 'show interfaces',
          'A switch or router command that displays interface status, speed and duplex, utilization, and error counters such as CRC errors, giants, and discards, used to diagnose cabling and duplex problems.',
          'check an interface\'s speed, duplex setting, and CRC error counters on a Cisco switch',
          ['show mac address-table', 'show ip route', 'show running-config'],
          'Per-INTERFACE status and error counters — the other show commands report tables and configuration.',
          S.terminal(['show interfaces gi1/0/14', 'Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX', '12 input errors, 12 CRC, 0 giants'], title='Switch CLI'),
          caption='show interfaces reports link state, speed, duplex, and error counters.')

    b.add('3.3', 'show mac address-table',
          'A switch command that lists the MAC addresses learned, the VLAN, and the port each was learned on, used to find which port a device is connected to.',
          'find which switch port a specific device\'s MAC address is connected to',
          ['show interfaces', 'show ip route', 'show vlan'],
          'MAC to PORT mappings — use it to track a device down to a specific switch port.',
          S.terminal(['show mac address-table', 'Vlan  Mac Address       Type     Ports', '10    0050.56a1.2b3c    DYNAMIC  Gi1/0/14', '10    001a.2b3c.4d5e    DYNAMIC  Gi1/0/22'], title='Switch CLI'),
          caption='show mac address-table maps learned MAC addresses to VLANs and ports.')

    b.add('3.3', 'show ip route',
          'A router or Layer 3 switch command that displays the routing table with each route\'s source code (connected, static, OSPF, and others), prefix, next hop, and metric.',
          'verify which next hop a router will use to reach a destination network',
          ['show mac address-table', 'show interfaces', 'show running-config'],
          'The ROUTING table — use it to confirm routes, next hops, and which protocol learned them.',
          S.terminal(['show ip route', 'C  10.0.0.0/24 is directly connected, Gi0/0', 'S  10.20.0.0/16 [1/0] via 10.0.0.254', 'O  172.16.0.0/16 [110/20] via 10.0.0.2'], title='Router CLI'),
          caption='show ip route lists the routing table, including source, prefix, and next hop.')

    b.add('3.3', 'show running-config',
          'A command that displays the configuration a device is currently using in RAM; changes become permanent only after they are saved to the startup configuration, for example with copy running-config startup-config.',
          'view the configuration a switch is actively running right now',
          ['show startup-config', 'show version', 'show interfaces'],
          'RUNNING is the active copy in RAM — it is lost on reboot unless saved to startup.',
          S.compare(('Running configuration', ['Active in RAM', 'Changes apply immediately', 'Lost on reload if unsaved']), ('Startup configuration', ['Stored in NVRAM', 'Loaded at boot', 'Saved with copy run start']), title='Two configurations'),
          caption='The running configuration is the live copy in RAM; it must be saved to persist across reboots.')

    # ------------------------------------------------------------------------------------------ 3.4 cable and hardware tools
    b.add('3.4', 'Crimping tool',
          'A tool that attaches RJ45 or similar connectors to the ends of twisted-pair cable by pressing the contacts through the conductors, used to build custom patch cables.',
          'attach an RJ45 connector to the end of a cable to build a custom-length patch cable',
          ['A punchdown tool', 'A cable tester', 'A tone generator'],
          'It attaches CONNECTORS to cable ends — a punchdown tool seats wires into a block.',
          S.steps([('Strip and order wires', 'T568A or T568B order'), ('Insert into RJ45', 'wires seated fully'), ('Crimp', 'then test the cable')], title='Making a patch cable', tones=['plain', 'blue', 'green']),
          caption='A crimping tool secures RJ45 connectors onto twisted-pair cable.')

    b.add('3.4', 'Optical time-domain reflectometer (OTDR)',
          'A fiber test instrument that sends light pulses down a fiber and analyzes the reflections to locate breaks, splices, connectors, and bends and to measure attenuation and distance to each event.',
          'locate a break or high-loss splice somewhere along a long fiber link and find its distance',
          ['A visual fault locator', 'A copper time-domain reflectometer (TDR)', 'A tone generator'],
          'It maps EVENTS along a fiber with distances — a visual fault locator just shines a visible light.',
          S.steps([('Pulse sent', 'into the fiber'), ('Reflections analyzed', 'loss at each event'), ('Fault located', 'distance to the break')], title='OTDR', tones=['plain', 'blue', 'green']),
          caption='An OTDR analyzes light reflections to locate and measure faults along a fiber.')

    b.add('3.4', 'Visual fault locator (VFL)',
          'A fiber tool that injects bright visible red light into a fiber so breaks, tight bends, and bad connectors glow at the fault, and so fibers can be identified at the other end.',
          'quickly see where a damaged patch cord or sharp bend leaks light in a short fiber run',
          ['An OTDR', 'A cable certifier', 'A punchdown tool'],
          'Visible RED light shows short-range faults — an OTDR measures distance to events on long runs.',
          S.facts([('Light', 'bright visible red laser'), ('Shows', 'breaks, bends, bad connectors'), ('Best for', 'short runs and patch cords'), ('Not for', 'measuring loss or distance')], title='Visual fault locator'),
          caption='A visual fault locator makes fiber faults visible with red light.')

    b.add('3.4', 'Loopback plug',
          'A connector wired so a port\'s transmit signal is returned to its receive pins, used to test whether a network interface, port, or fiber transceiver can send and receive correctly.',
          'test whether a switch port or network card can transmit and receive without needing another device',
          ['A network tap', 'A crossover cable', 'A cable certifier'],
          'Loops TX straight back to RX — a self-test of the port with no second device.',
          S.steps([('Plug in loopback', 'in the port under test'), ('Port transmits', 'signal returns to receive'), ('Pass or fail', 'port works or is faulty')], title='Loopback test', tones=['plain', 'blue', 'green']),
          caption='A loopback plug returns a port\'s transmit signal to its receiver to test the port.')

    b.add('3.4', 'Network tap',
          'A device placed inline between two network devices that passes traffic through while sending a complete copy to a monitoring port, giving analyzers full visibility including errors, unlike a switch SPAN port that can drop traffic.',
          'give a protocol analyzer a complete copy of the traffic on a link, including errored frames, without dropping any',
          ['Port mirroring (SPAN)', 'A hub', 'A loopback plug'],
          'Dedicated inline hardware that copies EVERYTHING — SPAN can drop traffic under load.',
          S.steps([('Device A', 'normal traffic'), ('Tap inline', 'passes and copies traffic'), ('Monitoring port', 'analyzer sees all')], title='Network tap', tones=['plain', 'primary', 'green']),
          caption='A network tap copies all traffic on a link to a monitoring port without interrupting it.')

    b.add('3.1', 'End of life (EOL)',
          'The vendor milestone at which a product is withdrawn from sale and development, announced in advance, after which support continues only until the end-of-support date, so replacements should be planned before it arrives.',
          'plan the replacement of a switch model that the manufacturer has announced it will no longer sell',
          ['End of support (EOS)', 'Device decommissioning', 'Firmware and patch management'],
          'No longer SOLD — end of support is when patches and help stop.',
          S.steps([('End of life', 'no longer sold'), ('Support continues', 'patches until EOS'), ('End of support', 'no patches or help')], title='Product life cycle', tones=['amber', 'blue', 'red']),
          caption='End of life means the vendor stops selling a product; end of support comes later.')

    b.add('3.1', 'End user license agreement (EULA)',
          'The legal agreement that sets how software may be used, including how many users or devices a license covers and limits on copying; network teams track licenses so installations stay within their terms.',
          'check how many devices a purchased network management license allows before installing the software on more servers',
          ['Service-level agreement (SLA)', 'Asset inventory', 'Acceptable use policy (AUP)'],
          'The LICENSE terms for software — an SLA covers service levels, not software use.',
          S.compare(('EULA', ['Software license terms', 'Users or devices covered', 'Copying limits']), ('SLA', ['Service levels promised', 'Uptime and response', 'Credits if missed']), title='EULA vs. SLA'),
          caption='A EULA sets the terms and limits for using licensed software.')

    b.add('3.3', 'show arp',
          'A device command that lists the ARP table of IP-to-MAC mappings that a router or Layer 3 switch has learned, used to confirm a neighbor is reachable at Layer 2 or to spot duplicate IP addresses.',
          "confirm which MAC address a router has learned for a server's IP address",
          ['show mac address-table', 'show ip route', 'show interfaces'],
          'IP to MAC on the DEVICE — the MAC address table maps MACs to switch PORTS.',
          S.terminal(['show arp', 'Protocol  Address     Age  Hardware Addr', 'Internet  10.0.1.25    3   aabb.cc00.0102', 'Internet  10.0.1.30    5   aabb.cc00.0230'], title='Router CLI'),
          caption='show arp lists the IP-to-MAC mappings a device has learned.')

    b.add('3.3', 'show vlan',
          'A switch command, typically show vlan brief, that lists each VLAN with its name, status, and the access ports assigned to it, used to verify VLAN membership.',
          'list each VLAN with the access ports assigned to it from the command line',
          ['show mac address-table', 'show interfaces', 'show ip route'],
          'VLANs and their PORTS — a port missing from its VLAN here explains many connectivity problems.',
          S.terminal(['show vlan brief', 'VLAN Name     Status   Ports', '10   Sales    active   Fa0/1, Fa0/2', '20   Voice    active   Fa0/3'], title='Switch CLI'),
          caption='show vlan brief lists each VLAN and the access ports assigned to it.')

    b.add('3.3', 'show power',
          'A command such as show power inline that displays PoE status, including the total power budget, the power drawn by each port, and which devices are powered, used to find an exhausted PoE budget.',
          "see how much of a switch's PoE budget is used and which ports are powering phones and access points",
          ['show interfaces', 'show running-config', 'show mac address-table'],
          'PoE BUDGET and per-port draw — the first place to look when a powered device will not start.',
          S.terminal(['show power inline', 'Available:370.0W  Used:305.4W  Remaining:64.6W', 'Fa0/1  on   15.4W  IP Phone', 'Fa0/2  on   30.0W  Access Point'], title='Switch CLI'),
          caption='show power inline shows the PoE budget and what each port is drawing.')

    # ------------------------------------------------------------------------------------------ added 2026-11-03 (official-objective gaps)
    b.add('3.1', 'Network diagrams by layer (1, 2, and 3)',
          'A network can be diagrammed one layer at a time: a Layer 1 diagram shows the physical devices, cables, and ports; a Layer 2 diagram shows switches, VLANs, and trunks; and a Layer 3 diagram shows subnets, routers, and routing paths.',
          'document one network in three views: the cabling and ports, the switching and VLANs, and the subnets and routing',
          ['A rack diagram', 'A wireless heat map', 'An asset inventory'],
          'One network, three VIEWS — Layer 1 cables and ports, Layer 2 switches and VLANs, Layer 3 subnets and routes.',
          S.layers([('Layer 3 diagram', 'subnets, routers, and routes', 'green'), ('Layer 2 diagram', 'switches, VLANs, and trunks', 'blue'), ('Layer 1 diagram', 'devices, cables, and ports', 'amber')], title='Diagrams by layer'),
          caption='A network can be diagrammed by layer: cables and ports, switches and VLANs, then subnets and routes.')

    b.add('3.3', 'Spectrum analyzer',
          'A tool that displays radio energy across a range of frequencies, showing non-Wi-Fi interference sources such as microwave ovens, cordless phones, and wireless cameras that a Wi-Fi analyzer cannot identify.',
          'find the source of intermittent interference that is not another Wi-Fi network but still disrupts the 2.4 GHz band',
          ['Wi-Fi analyzer', 'Protocol analyzer', 'Visual fault locator'],
          'Shows RAW radio energy by frequency — a Wi-Fi analyzer only lists the Wi-Fi networks it can decode.',
          S.compare(('Wi-Fi analyzer', ['Lists SSIDs and channels', 'Shows signal strength', 'Sees Wi-Fi only']), ('Spectrum analyzer', ['Shows all RF energy', 'Finds microwaves, phones', 'Identifies non-Wi-Fi noise']), title='Wireless tools'),
          caption='A spectrum analyzer shows all radio energy by frequency, so it can find non-Wi-Fi interference.')

    b.add('3.5', 'Physical locks (lockable racks and doors)',
          'Physical locks keep unauthorized people away from network equipment: lockable racks and cabinets, keyed or keypad (cipher) locks on wiring closets, and badge-controlled or biometric doors; an access control vestibule, also called a mantrap, adds a two-door entry that admits one person at a time.',
          'keep anyone without authorization from touching the switches in a shared wiring closet',
          ['Security camera (CCTV)', 'Asset tag', 'Environmental sensors'],
          'LOCKS prevent access — a camera only records it, and an asset tag only identifies the equipment.',
          S.layers([('Building door', 'badge reader or biometric', 'blue'), ('Wiring closet', 'keyed or keypad lock', 'green'), ('Rack or cabinet', 'lockable front and back doors', 'amber')], title='Layers of physical locks'),
          caption='Locks on doors, closets, and racks stop unauthorized people from reaching network equipment.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('More network documentation and lifecycle', ['3.1'],
              'Documentation answers different questions. Network diagrams can be drawn by layer (Layer 1 cables and ports, Layer 2 switches and VLANs, Layer 3 subnets and routes). A rack diagram shows which device sits in which rack unit, a cable map traces each cable end to end between jacks, patch panels, and switch ports, a wireless heat map shows coverage from a site survey, an asset inventory records hardware, software, licenses, and warranties, and IPAM manages subnets, DHCP, and DNS to avoid duplicate addresses. An SLA is a contract with measurable service levels and remedies.\n\n'
              'Lifecycle matters too: end of sale means a product can no longer be bought, but end of support means it gets no more patches, so replace it. Patch through testing, backups, a maintenance window, and a rollback plan; keep versioned configuration backups and a golden baseline for fast replacement and drift detection (the production configuration is what runs now, the backup is a saved copy); and decommission devices by wiping them and updating every record.')
    b.section('Recovery objectives, redundancy, and testing', ['3.2'],
              'RPO is the data loss you can tolerate (it drives backup or replication frequency) and RTO is the downtime you can tolerate (it drives the standby site choice). In active-active designs every unit carries traffic and shares load, while in active-passive a standby waits idle until failover. Multihoming to two ISPs, not just two cables, protects against a provider outage.\n\n'
              'Test the plan in stages: a tabletop exercise is a safe discussion of a scenario to find gaps, and a failover test actually moves services to the standby to measure the real recovery time against the RTO and RPO before a failback and a review.')
    b.section('Software and command tools', ['3.3'],
              'Match the tool to the question. A spectrum analyzer shows all radio energy by frequency, so it finds non-Wi-Fi interference (microwaves, cordless phones) that a Wi-Fi analyzer cannot. arp -a lists IP-to-MAC mappings (duplicates suggest conflicts or spoofing), netstat shows listening ports and connections on a host, route shows or edits the host routing table, nmap scans other hosts for open ports and services (only with permission), and tcpdump captures packets from the command line where Wireshark provides a graphical view. LLDP (standard) and CDP (Cisco) show directly connected neighbors, a speed test measures throughput, and a Wi-Fi analyzer shows channels and signal levels.\n\n'
              'Device commands: show interfaces reports status, speed, duplex, and error counters such as CRC errors, show mac address-table maps MAC addresses to ports, show ip route displays routes and next hops, and show running-config displays the active configuration in RAM, which must be saved to startup to persist.')
    b.section('Cable and fiber hardware tools', ['3.4'],
              'A crimping tool attaches connectors, while a punchdown tool seats wires into a block, and a tone generator and probe trace a cable through walls. For fiber, a visual fault locator shines visible red light so breaks, tight bends, and bad connectors glow. A loopback plug tests a port by returning its transmit signal to its receiver, and a network tap is inline hardware that copies all traffic to a monitoring port, unlike a switch SPAN port that can drop traffic.')
    b.section('Life-cycle terms, licenses, and more show commands', ['3.1', '3.3'],
              'End of life means a product is no longer sold, and end of support, which comes later, means patches and help stop; plan replacements before either. A EULA sets the terms and limits of software licenses, which is why license counts belong in the asset inventory. For command-line checks, show arp lists IP-to-MAC mappings on the device, show vlan brief lists VLANs with their access ports, and show power inline shows the PoE budget and per-port draw.')
