"""AZ-802, domain ws3 (Manage virtual machines): Hyper-V and Windows Server VMs in Azure."""
import svg as S

DOMAIN = 'ws3'


def build(b):
    b.topics['3.1'] = ['Dynamic Memory', 'Virtual disks', 'Live and storage migration', 'Clusters and witnesses', 'Shielded VMs', 'Replica failover', 'SET, VLANs, SR-IOV']
    b.topics['3.2'] = ['Managed disks and caching', 'Disk encryption', 'Autoscale', 'Load balancing and NSGs', 'Placement and cost', 'Run Command and Serial Console']

    # ------------------------------------------------------------------------------------------ 3.1
    b.add('3.1', 'Dynamic Memory',
          'A Hyper-V feature that adjusts a running VM\'s RAM between a minimum and a maximum based on demand, using a startup value, a memory buffer percentage, and a memory weight, so more VMs fit on one host.',
          'let a virtual machine\'s memory grow and shrink with demand so more VMs fit on one host',
          ['Smart Paging', 'Static memory assignment', 'Non-uniform memory access (NUMA) spanning'],
          'Startup, minimum, MAXIMUM, buffer, and weight — the host balances RAM between VMs.',
          S.facts([('Startup RAM', 'allocated at boot'), ('Minimum RAM', 'floor when idle'), ('Maximum RAM', 'ceiling under load'), ('Memory weight', 'priority under pressure')], title='Dynamic Memory settings'),
          caption='Dynamic Memory varies a VM\'s RAM between a minimum and maximum according to demand.')

    b.add('3.1', 'Smart Paging',
          'A temporary paging file on the host that lets a VM restart when its startup memory is higher than its minimum and the host has no free RAM for it; it is used only during the restart and not while the VM runs.',
          'allow a VM to restart when the host lacks enough free RAM to give it the startup amount',
          ['Dynamic Memory', 'Static memory assignment', 'Resource metering'],
          'Only helps a RESTART when startup memory exceeds minimum — never a running VM.',
          S.steps([('VM restarts', 'startup RAM > minimum'), ('Host is short', 'no free memory'), ('Smart Paging file', 'used until it settles')], title='Smart Paging', tones=['plain', 'amber', 'blue']),
          caption='Smart Paging uses a host file so a VM can restart when free memory is short.')

    b.add('3.1', 'Differencing disks',
          'A child virtual hard disk that stores only the changes made relative to a read-only parent disk; checkpoints use them (AVHDX), and so can a set of test VMs that share one base image.',
          'create many test VMs from one read-only base image where each stores only its own changes',
          ['Dynamically expanding virtual hard disk', 'Fixed-size virtual hard disk', 'VHD Set'],
          'The CHILD holds only changes — damage the parent and every child breaks.',
          S.steps([('Parent disk', 'read-only base image'), ('Child disk 1', 'its own changes'), ('Child disk 2', 'its own changes')], title='Differencing disks', tones=['blue', 'plain', 'plain']),
          caption='Differencing disks store only changes relative to a shared read-only parent.')

    b.add('3.1', 'Fixed-size virtual hard disk',
          'A VHD or VHDX whose full capacity is allocated on the host volume when it is created, giving predictable performance and no risk of the host running out of space as the disk fills.',
          'give a production VM a virtual disk whose full size is reserved on the host up front for predictable performance',
          ['Dynamically expanding virtual hard disk', 'Differencing disks', 'VHD Set'],
          'ALL the space is reserved at creation — predictable and no overcommit surprises.',
          S.compare(('Fixed size', ['Full size allocated now', 'Predictable performance', 'No overcommit risk']), ('Dynamically expanding', ['Grows as data is added', 'Saves space early', 'Can overcommit the host']), title='VHDX allocation types'),
          caption='A fixed-size virtual disk reserves its full capacity when created.')

    b.add('3.1', 'Dynamically expanding virtual hard disk',
          'A VHD or VHDX that starts small and grows on the host as data is written, up to its maximum size; it saves space early on but can overcommit the host volume if many disks fill.',
          'create a virtual disk that uses only as much host space as the data it currently holds',
          ['Fixed-size virtual hard disk', 'Differencing disks', 'VHD Set'],
          'GROWS on demand — watch the host volume so many growing disks do not fill it.',
          S.steps([('Created small', 'few MB used'), ('Data written', 'file grows'), ('Max size reached', 'cannot grow further')], title='Dynamically expanding disk', tones=['green', 'blue', 'amber']),
          caption='A dynamically expanding disk grows as data is written, up to its maximum size.')

    b.add('3.1', 'VHD Set',
          'A shared virtual disk format (.vhds) used by clustered guest VMs, which lets several VMs open the same virtual disk as shared storage and supports resizing, checkpoints, and backups at the host level.',
          'give two clustered guest VMs the same virtual disk as shared storage',
          ['Differencing disks', 'Cluster Shared Volumes (CSV)', 'Fixed-size virtual hard disk'],
          'The .VHDS format is the shared disk for GUEST clusters.',
          S.steps([('VM 1', 'guest cluster node'), ('Shared VHD Set', '.vhds file'), ('VM 2', 'guest cluster node')], title='Shared virtual disk', tones=['blue', 'primary', 'blue']),
          caption='A VHD Set is a shared virtual disk that guest cluster nodes open together.')

    b.add('3.1', 'Online VHDX resize',
          'Growing, or shrinking after the guest partition is reduced, a VHDX attached to a virtual SCSI controller while the VM keeps running, using Resize-VHD or Hyper-V Manager and then extending the volume inside the guest.',
          'grow the data disk of a running VM without shutting it down',
          ['Storage migration', 'Importing a VM', 'Live migration'],
          'SCSI-attached VHDX can be resized while the VM RUNS — then extend the volume in the guest.',
          S.steps([('Resize-VHD', 'VM keeps running'), ('Guest sees space', 'unallocated'), ('Extend the volume', 'in Disk Management')], title='Online resize', tones=['blue', 'plain', 'green']),
          caption='A SCSI-attached VHDX can be resized while its VM runs, then the volume is extended.')

    b.add('3.1', 'Live migration',
          'Moving a running VM from one Hyper-V host to another with no perceptible downtime, using Kerberos constrained delegation or CredSSP for authentication; shared-nothing live migration needs no shared storage.',
          'move a running virtual machine to another host so the first can be patched without disconnecting users',
          ['Storage migration', 'Hyper-V Replica', 'Importing a VM'],
          'The VM keeps RUNNING — Replica copies it for disaster recovery instead of moving it.',
          S.steps([('Host A', 'VM running'), ('Memory copied', 'then a brief switch'), ('Host B', 'VM running')], title='Live migration', tones=['blue', 'primary', 'green']),
          caption='Live migration moves a running VM to another host without perceptible downtime.')

    b.add('3.1', 'Storage migration',
          'Moving a running VM\'s virtual disks and configuration files to a different volume or location while the VM stays online.',
          'move a running VM\'s virtual disks to a faster volume without turning it off',
          ['Live migration', 'Hyper-V Replica', 'Online VHDX resize'],
          'Moves the FILES, not the running VM — live migration moves the VM between hosts.',
          S.compare(('Storage migration', ['Moves the VM\'s files', 'Same host', 'VM stays online']), ('Live migration', ['Moves the running VM', 'Host to host', 'VM stays online']), title='What moves'),
          caption='Storage migration moves a running VM\'s files to another location without downtime.')

    b.add('3.1', 'Importing a VM',
          'Bringing an exported VM into Hyper-V with Import-VM, choosing to register it in place (keep its ID), restore it by copying files (keep its ID), or copy it (create a new unique ID).',
          'duplicate a VM onto another host as a new machine that gets its own unique identifier',
          ['Live migration', 'Storage migration', 'Hyper-V Replica'],
          'COPY creates a new ID; register and restore keep the existing one.',
          S.table(['Import type', 'Unique ID'], [('Register in place', 'kept'), ('Restore', 'kept'), ('Copy', 'new ID created')], title='Import options', col_widths=[0.6, 0.4]),
          caption='Importing a VM can register, restore, or copy it; only a copy gets a new ID.')

    b.add('3.1', 'Cluster Shared Volumes (CSV)',
          'A clustered volume that every node in a failover cluster can read and write at the same time, so VM files live in one namespace and a VM can restart or live-migrate between nodes without remounting storage.',
          'let every node in a Hyper-V cluster read and write the same volume that holds the virtual disks at once',
          ['Storage Replica', 'iSCSI configuration', 'VHD Set'],
          'ALL nodes access the volume at the same time — that is what makes live migration easy.',
          S.hub(('Cluster Shared Volume',), [('Node 1', 'VMs running'), ('Node 2', 'VMs running'), ('Node 3', 'VMs running')], title='Shared access'),
          caption='A CSV is accessed by all cluster nodes simultaneously, simplifying VM mobility.')

    b.add('3.1', 'Cluster quorum',
          'The rule that a failover cluster keeps running only while a majority of votes, from nodes and an optional witness, can communicate; dynamic quorum adjusts the vote counts as nodes leave.',
          'decide whether a cluster stays online after half of its nodes lose contact with the other half',
          ['Cloud Witness', 'Cluster Shared Volumes (CSV)', 'Storage Replica'],
          'MAJORITY of votes decides — a witness breaks ties in an even number of nodes.',
          S.table(['Cluster', 'Votes needed'], [('2 nodes + witness', '2 of 3'), ('3 nodes', '2 of 3'), ('4 nodes + witness', '3 of 5')], title='Quorum majority', col_widths=[0.6, 0.4]),
          caption='Quorum needs a majority of votes, and a witness breaks ties.')

    b.add('3.1', 'Cloud Witness',
          'A cluster quorum witness that uses an Azure storage account as the tiebreaker, so a two-node or stretched cluster needs no third site or file server.',
          'give a two-site cluster a tiebreaker vote without building a third site or a file server',
          ['File share witness', 'Disk witness', 'Cluster quorum'],
          'The tiebreaker lives in an AZURE storage account — no third site needed.',
          S.steps([('Site 1 node', 'one vote'), ('Azure storage account', 'witness vote'), ('Site 2 node', 'one vote')], title='Cloud Witness', tones=['blue', 'primary', 'blue']),
          caption='A Cloud Witness stores its quorum vote in an Azure storage account.')

    b.add('3.1', 'Shielded virtual machines',
          'Generation 2 VMs protected by a virtual TPM and BitLocker, run only on hosts that the Host Guardian Service attests as healthy, so even a host administrator cannot read or tamper with the VM.',
          'protect a virtual machine\'s data and state from the administrators of the host it runs on',
          ['Credential Guard', 'Nested virtualization', 'BitLocker Drive Encryption'],
          'Defends against the HOST administrator — needs Generation 2, a vTPM, and the Host Guardian Service.',
          S.steps([('Host attests', 'Host Guardian Service'), ('vTPM and BitLocker', 'protect the VM'), ('Admin cannot read', 'disks or memory')], title='Shielded VM', tones=['blue', 'primary', 'green']),
          caption='Shielded VMs use a vTPM and attested hosts so host administrators cannot read the VM.')

    b.add('3.1', 'Secure Boot for Generation 2 VMs',
          'A Generation 2 firmware setting that only starts signed boot loaders; Windows guests use the Microsoft Windows template, while many Linux guests need the Microsoft UEFI Certificate Authority template or Secure Boot turned off.',
          'start a Linux guest on a Generation 2 VM that fails the signature check at boot',
          ['Shielded virtual machines', 'VM generation (Generation 1 vs. 2)', 'Nested virtualization'],
          'Linux guests usually need the UEFI Certificate Authority TEMPLATE.',
          S.compare(('Windows guest', ['Microsoft Windows template', 'Default for Gen 2', 'Signed boot loader']), ('Linux guest', ['UEFI Certificate Authority', 'Pick this template', 'Or disable Secure Boot']), title='Secure Boot templates'),
          caption='Secure Boot needs the right template: Windows for Windows guests, UEFI CA for most Linux.')

    b.add('3.1', 'Planned failover',
          'A Hyper-V Replica operation run when both sides are healthy: the primary VM is shut down, the last changes are sent, the replica starts with no data loss, and replication can be reversed.',
          'move a virtual machine to its replica site for maintenance with zero data loss',
          ['Unplanned failover', 'Test failover', 'Live migration'],
          'Both sides HEALTHY and NO data loss — the primary is shut down first.',
          S.steps([('Shut down primary', 'VM stops cleanly'), ('Send last changes', 'nothing lost'), ('Start replica', 'reverse replication')], title='Planned failover', tones=['amber', 'blue', 'green']),
          caption='A planned failover shuts the primary down and starts the replica with no data loss.')

    b.add('3.1', 'Unplanned failover',
          'A Hyper-V Replica operation run on the replica site when the primary has failed, which starts the VM from the latest replicated data and so can lose the changes made after the last replication.',
          'bring up a replica VM after the primary site went down suddenly',
          ['Planned failover', 'Test failover', 'Live migration'],
          'The primary is DOWN — expect to lose changes since the last replication.',
          S.steps([('Primary fails', 'site is down'), ('Failover on replica', 'latest recovery point'), ('VM runs', 'recent changes may be lost')], title='Unplanned failover', tones=['red', 'blue', 'amber']),
          caption='An unplanned failover starts the replica from the latest data after the primary fails.')

    b.add('3.1', 'Test failover',
          'A Hyper-V Replica operation that starts a temporary copy of the replica VM on an isolated network without affecting production or ongoing replication, then discards it, so a recovery plan can be validated.',
          'rehearse a disaster recovery plan by starting a copy of a replica without disturbing production',
          ['Planned failover', 'Unplanned failover', 'Importing a VM'],
          'A TEMPORARY copy — replication keeps running and nothing in production changes.',
          S.steps([('Create test VM', 'from the replica'), ('Validate recovery', 'isolated network'), ('Clean up', 'test VM removed')], title='Test failover', tones=['blue', 'plain', 'green']),
          caption='A test failover starts a disposable copy of the replica to validate recovery.')

    b.add('3.1', 'Replication frequency and recovery points',
          'A Hyper-V Replica setting that sends changes every 30 seconds, 5 minutes, or 15 minutes and can keep extra recovery points, up to 24 hourly snapshots, so a VM can be restored to an earlier state.',
          'choose how often changes are sent to the replica site and how many earlier states are kept',
          ['Replica authentication', 'Production vs. standard VM checkpoints', 'Planned failover'],
          'Pick 30 seconds, 5, or 15 MINUTES — shorter means less data loss and more bandwidth.',
          S.table(['Interval', 'Data loss risk'], [('30 seconds', 'lowest'), ('5 minutes', 'moderate'), ('15 minutes', 'highest')], title='Replication frequency', col_widths=[0.5, 0.5]),
          caption='Replication frequency can be 30 seconds, 5 minutes, or 15 minutes.')

    b.add('3.1', 'Replica authentication',
          'Hyper-V Replica can authenticate hosts with Kerberos over HTTP (TCP 80) inside a domain or with certificates over HTTPS (TCP 443) across untrusted networks, which also encrypts the replicated data.',
          'replicate VMs between hosts in two forests that do not trust each other over an encrypted channel',
          ['Replication frequency and recovery points', 'WinRM ports and listeners', 'Planned failover'],
          'KERBEROS for the same forest on 80; CERTIFICATES on 443 for anything else.',
          S.compare(('Kerberos', ['HTTP, TCP 80', 'Same or trusted forests', 'Not encrypted by default']), ('Certificate', ['HTTPS, TCP 443', 'Any network', 'Encrypted traffic']), title='Replica authentication'),
          caption='Replica uses Kerberos over HTTP in a domain or certificates over HTTPS across untrusted networks.')

    b.add('3.1', 'Switch Embedded Teaming (SET)',
          'A teaming mode built into the Hyper-V virtual switch that combines up to eight identical physical adapters for failover and bandwidth, supports RDMA, and needs no separate LBFO team; it does not support LACP.',
          'combine physical adapters under a virtual switch for failover and bandwidth while still allowing RDMA traffic',
          ['NIC teaming (host and VM level)', 'SR-IOV', 'Virtual Machine Queue (VMQ)'],
          'Teaming INSIDE the vSwitch — same-speed adapters, RDMA-capable, no LACP.',
          S.steps([('Physical NIC 1', 'same speed'), ('Virtual switch', 'embedded team'), ('Physical NIC 2', 'same speed')], title='Switch Embedded Teaming', tones=['blue', 'primary', 'blue']),
          caption='SET teams adapters inside the Hyper-V virtual switch and supports RDMA.')

    b.add('3.1', 'VLAN tagging on virtual network adapters',
          'Placing a VM\'s virtual network adapter on a VLAN with Set-VMNetworkAdapterVlan, either in access mode with one VLAN ID or in trunk mode with a list of allowed VLANs.',
          'place one VM\'s network adapter on VLAN 20 while other VMs on the same switch stay untagged',
          ['Hyper-V Virtual Switch types', 'SR-IOV', 'Enable MAC address spoofing'],
          'ACCESS mode for one VLAN, TRUNK mode for several — the physical port must carry the VLANs.',
          S.terminal(['Set-VMNetworkAdapterVlan -VMName Web01 -Access -VlanId 20', 'Get-VMNetworkAdapterVlan -VMName Web01', 'OperationMode  VlanList', 'Access         20'], title='Windows PowerShell'),
          caption='Set-VMNetworkAdapterVlan puts a virtual adapter in access or trunk mode on VLANs.')

    b.add('3.1', 'SR-IOV',
          'Single Root I/O Virtualization lets a VM\'s network adapter use a virtual function of a supported physical NIC directly, bypassing the host\'s virtual switch for lower latency and CPU use; it must be enabled when the switch is created.',
          'give a latency-sensitive VM direct access to a physical network adapter\'s hardware function',
          ['Switch Embedded Teaming (SET)', 'Virtual Machine Queue (VMQ)', 'VLAN tagging on virtual network adapters'],
          'BYPASSES the virtual switch — needs supported hardware and IOV enabled at switch creation.',
          S.compare(('Without SR-IOV', ['Traffic via virtual switch', 'More host CPU used', 'All switch features']), ('With SR-IOV', ['Direct to the NIC function', 'Lower latency', 'Needs supported hardware']), title='SR-IOV'),
          caption='SR-IOV lets a VM use a physical NIC\'s virtual function and bypass the virtual switch.')

    b.add('3.1', 'DHCP guard and router guard',
          'Virtual network adapter protections that drop DHCP server messages or router advertisements sent by a VM, so a misconfigured or malicious VM cannot hand out addresses or act as a router for others.',
          'stop a tenant VM from answering other VMs\' address requests as an unauthorized server',
          ['Enable MAC address spoofing', 'Port mirroring', 'VLAN tagging on virtual network adapters'],
          'GUARDS drop rogue DHCP offers and router advertisements from a VM.',
          S.steps([('VM sends DHCP offer', 'it is not a server'), ('DHCP guard on', 'port drops the offer'), ('Other VMs safe', 'no rogue addresses')], title='DHCP guard', tones=['red', 'blue', 'green']),
          caption='DHCP guard and router guard drop rogue server and router messages from a VM.')

    b.add('3.1', 'Enable MAC address spoofing',
          'A virtual network adapter setting that lets a VM send traffic with MAC addresses other than its own, needed for network load balancing in unicast mode, some software routers, and nested virtualization networking.',
          'allow a VM running a software router to forward traffic using source MAC addresses other than its own',
          ['DHCP guard and router guard', 'Port mirroring', 'VLAN tagging on virtual network adapters'],
          'Off by default — turn it on only for VMs that forward or share MAC addresses.',
          S.flow_split(('Virtual adapter setting',), [('Off (default)', 'only its own MAC'), ('On', 'other MACs allowed')], title='MAC address spoofing', tones=['green', 'amber']),
          caption='MAC address spoofing lets a VM send frames with MAC addresses other than its own.')

    # ------------------------------------------------------------------------------------------ 3.2
    b.add('3.2', 'Azure managed disk types',
          'Standard HDD for backup and dev/test, Standard SSD for lightly used servers, Premium SSD for production workloads, Premium SSD v2 for tunable performance, and Ultra Disk for the most demanding latency and IOPS needs.',
          'match a backup server, a web server, and a busy production database to appropriate disk performance levels',
          ['Azure disk host caching', 'Azure VM temporary disk', 'Azure Files share'],
          'Move UP in cost and performance: Standard HDD → Standard SSD → Premium SSD → Ultra.',
          S.layers([('Ultra Disk', 'highest IOPS, lowest latency', 'red'), ('Premium SSD v2', 'tune IOPS and throughput', 'amber'), ('Premium SSD', 'production workloads', 'blue'), ('Standard SSD', 'light production, web', 'green'), ('Standard HDD', 'backup, dev and test', 'plain')], title='Managed disk tiers'),
          caption='Azure managed disks range from Standard HDD for backup to Ultra Disk for the highest performance.')

    b.add('3.2', 'Ultra Disk',
          'The highest-performance Azure managed disk, with sub-millisecond latency and IOPS and throughput that can be changed independently of capacity; it can be used as a data disk but not as an OS disk.',
          'give a transaction-heavy database VM the lowest latency storage and adjust its IOPS without resizing the disk',
          ['Premium SSD v2', 'Premium SSD', 'Azure VM temporary disk'],
          'Performance is set SEPARATELY from size — and it is data disks only.',
          S.facts([('Latency', 'sub-millisecond'), ('IOPS', 'adjustable, not tied to size'), ('Throughput', 'adjustable too'), ('Use as', 'data disk, not OS disk')], title='Ultra Disk'),
          caption='Ultra Disk offers sub-millisecond latency with IOPS and throughput set independently of size.')

    b.add('3.2', 'Azure disk host caching',
          'A per-disk setting of None, ReadOnly, or ReadWrite: use None for write-heavy disks such as database logs, ReadOnly for read-heavy data, and ReadWrite (the OS disk default) only where an application can tolerate possible loss of cached writes.',
          'lower read latency for a read-heavy data disk without risking the loss of cached writes',
          ['Azure managed disk types', 'Azure VM temporary disk', 'Ultra Disk'],
          'READONLY for read-heavy data, NONE for logs and write-heavy disks.',
          S.table(['Caching', 'Best for'], [('None', 'logs, write-heavy'), ('ReadOnly', 'read-heavy data'), ('ReadWrite', 'OS disk default')], title='Host caching', col_widths=[0.4, 0.6]),
          caption='Choose None, ReadOnly, or ReadWrite host caching per disk based on read and write patterns.')

    b.add('3.2', 'Azure VM temporary disk',
          'A local scratch drive, usually D: on Windows, that is lost when the VM is redeployed, resized to another host, or moved, so it should hold only the page file and temporary data.',
          'avoid keeping important data on the VM\'s local scratch drive that is erased when the VM moves to another host',
          ['Azure managed disk types', 'Azure Files share', 'Azure disk host caching'],
          'Data is LOST on redeploy or host move — never store anything you cannot recreate.',
          S.compare(('Temporary disk', ['Local to the host', 'Lost on redeploy', 'Page file, scratch']), ('Managed data disk', ['Stored in Azure Storage', 'Survives redeploy', 'Real data goes here']), title='Where data is safe'),
          caption='The temporary disk is local scratch space that is lost when the VM moves hosts.')

    b.add('3.2', 'Azure Disk Encryption',
          'Encrypting the OS and data volumes inside a VM with BitLocker on Windows or DM-Crypt on Linux, with the keys held in Azure Key Vault.',
          'encrypt a Windows VM\'s volumes from inside the guest with keys kept in a managed vault',
          ['Encryption at host', 'BitLocker Drive Encryption', 'Credential Guard'],
          'BitLocker INSIDE the guest with keys in Key Vault — encryption at host happens on the host.',
          S.steps([('VM extension', 'enables BitLocker'), ('Keys stored', 'in Azure Key Vault'), ('Volumes encrypted', 'OS and data disks')], title='Azure Disk Encryption', tones=['blue', 'plain', 'green']),
          caption='Azure Disk Encryption uses BitLocker or DM-Crypt with keys held in Key Vault.')

    b.add('3.2', 'Encryption at host',
          'End-to-end encryption that begins on the VM host, covering the temporary disk and disk caches as well as data sent to Azure Storage, without running encryption inside the guest.',
          'encrypt even the temporary disk and caches of a VM from the host without agents inside the guest',
          ['Azure Disk Encryption', 'BitLocker Drive Encryption', 'Shielded virtual machines'],
          'Covers the TEMP disk and caches — and is not combined with Azure Disk Encryption.',
          S.compare(('Encryption at host', ['Done on the VM host', 'Covers temp disk, caches', 'No guest agent']), ('Azure Disk Encryption', ['Done inside the guest', 'BitLocker or DM-Crypt', 'Keys in Key Vault']), title='Two encryption options'),
          caption='Encryption at host encrypts data at the VM host, including temporary disks and caches.')

    b.add('3.2', 'Autoscale for scale sets',
          'Rules that add or remove instances in a virtual machine scale set based on a metric such as average CPU or on a schedule, within a minimum and maximum instance count and with a cool-down between actions.',
          'add instances automatically when average CPU stays above 70 percent and remove them when the load drops',
          ['Manually resizing a VM', 'Proximity placement groups', 'Azure Load Balancer'],
          'Scale OUT on high load, scale IN on low — bounded by a minimum and maximum count.',
          S.steps([('CPU above 70%', 'for 10 minutes'), ('Add one instance', 'up to the maximum'), ('Cool-down', 'before the next action')], title='Autoscale rule', tones=['amber', 'blue', 'plain']),
          caption='Autoscale adds or removes scale set instances based on metrics or a schedule.')

    b.add('3.2', 'Azure Load Balancer',
          'A layer-4 service that distributes inbound TCP and UDP traffic across healthy VMs, using health probes to stop sending traffic to an instance that fails; it can be public or internal.',
          'spread inbound TCP connections across several identical web servers and skip one that stops answering probes',
          ['Azure Application Gateway', 'Azure Traffic Manager', 'Network security groups (NSGs)'],
          'LAYER 4 with HEALTH PROBES — Application Gateway is the layer-7 web option.',
          S.flow_split(('Azure Load Balancer', 'health probes'), [('VM 1', 'healthy'), ('VM 2', 'healthy'), ('VM 3', 'failed probe')], title='Load balancing', tones=['green', 'green', 'red']),
          caption='Azure Load Balancer spreads layer-4 traffic across VMs that pass health probes.')

    b.add('3.2', 'Network security groups (NSGs)',
          'Rule sets attached to a subnet or a network interface that allow or deny traffic by source, destination, port, and protocol; rules run in priority order from 100 to 4096 with the lowest number first, followed by default rules.',
          'allow RDP only from the management subnet to VMs in a subnet and deny other inbound traffic',
          ['Azure Firewall', 'Azure Bastion', 'Application security groups'],
          'LOWEST priority number wins — and the default rules end in a deny for inbound Internet traffic.',
          S.table(['Priority', 'Rule', 'Action'], [('100', 'RDP from 10.0.1.0/24', 'Allow'), ('200', 'HTTPS from Internet', 'Allow'), ('65500', 'Deny all inbound', 'Deny')], title='NSG rules', col_widths=[0.2, 0.5, 0.3]),
          caption='NSG rules are evaluated by priority, lowest number first, to allow or deny traffic.')

    b.add('3.2', 'Application security groups',
          'A way to group VM network interfaces by role, such as web or database, and use the group as the source or destination in network security group rules instead of individual IP addresses.',
          'write a firewall rule that refers to all web tier VMs by role rather than by IP address',
          ['Network security groups (NSGs)', 'Azure Firewall', 'Proximity placement groups'],
          'Group by ROLE and use the group in NSG rules — no IP lists to maintain.',
          S.steps([('NICs tagged', 'web or database'), ('Rule uses the group', 'web to database 1433'), ('New VM joins', 'rule applies at once')], title='Application security groups', tones=['plain', 'blue', 'green']),
          caption='Application security groups let NSG rules refer to VM roles instead of IP addresses.')

    b.add('3.2', 'Accelerated networking',
          'An Azure NIC feature that lets traffic bypass the host\'s virtual switch using SR-IOV, which lowers latency, jitter, and CPU use on supported VM sizes.',
          'reduce network latency and CPU usage on a busy Azure VM by letting its NIC bypass the host\'s software switch',
          ['Proximity placement groups', 'Azure Load Balancer', 'Network security groups (NSGs)'],
          'The AZURE version of bypassing the vSwitch — enabled on the NIC, on supported sizes.',
          S.compare(('Without it', ['Traffic via host vSwitch', 'Higher latency', 'More CPU use']), ('With it', ['Bypasses the vSwitch', 'Lower latency, jitter', 'Less CPU use']), title='Accelerated networking'),
          caption='Accelerated networking lets VM traffic bypass the host virtual switch to cut latency.')

    b.add('3.2', 'Proximity placement groups',
          'A placement option that keeps VMs in the same datacenter, physically close together, to minimize network latency between tightly coupled workloads, at some cost to flexibility and availability.',
          'keep tightly coupled VMs physically close together to minimize the latency between them',
          ['Availability sets vs. availability zones', 'Accelerated networking', 'Autoscale for scale sets'],
          'CLOSEST together for latency — availability zones spread VMs APART for resilience.',
          S.compare(('Proximity placement group', ['VMs close together', 'Lowest latency', 'Less resilience']), ('Availability zones', ['VMs far apart', 'Survive a zone failure', 'More latency']), title='Closer or safer'),
          caption='Proximity placement groups colocate VMs for low latency; zones spread them for resilience.')

    b.add('3.2', 'Azure Hybrid Benefit',
          'A licensing benefit that lets you apply existing Windows Server licenses with Software Assurance, or qualifying subscriptions, to Azure VMs, so you pay only the base compute rate instead of the rate that includes the Windows license.',
          'cut the cost of Windows Server VMs in Azure by applying licenses the company already owns',
          ['Azure Reserved VM Instances', 'Azure Spot virtual machines', 'Azure savings plan for compute'],
          'Uses licenses you ALREADY OWN — reservations discount the compute commitment instead.',
          S.steps([('Existing license', 'with Software Assurance'), ('Applied to the VM', 'Azure Hybrid Benefit'), ('Pay base rate', 'no Windows license charge')], title='Azure Hybrid Benefit', tones=['blue', 'primary', 'green']),
          caption='Azure Hybrid Benefit applies existing Windows Server licenses to cut Azure VM costs.')

    b.add('3.2', 'Azure Reserved VM Instances',
          'A one- or three-year commitment to a VM size and region that earns a large discount over pay-as-you-go pricing for machines that run steadily.',
          'lower the cost of servers that run all day every day by committing to a size for three years',
          ['Azure Hybrid Benefit', 'Azure Spot virtual machines', 'Azure savings plan for compute'],
          'COMMIT to a size and term for a discount — Hybrid Benefit uses licenses you own.',
          S.compare(('Pay as you go', ['No commitment', 'Highest rate', 'Flexible']), ('Reserved instance', ['1 or 3 year term', 'Large discount', 'Steady workloads']), title='Pricing choice'),
          caption='Reserved VM Instances trade a one- or three-year commitment for a lower price.')

    b.add('3.2', 'Azure VM Run Command',
          'A way to run a script inside a VM through the Azure VM agent from the portal, CLI, or PowerShell, working even when RDP or SSH is blocked because it travels through the Azure control plane.',
          'run a diagnostic script inside an Azure VM whose RDP port is blocked, without any network path to it',
          ['Azure Bastion', 'Just-in-time (JIT) VM access', 'Azure Serial Console'],
          'Travels through the AZURE control plane — no inbound connection to the VM needed.',
          S.steps([('Admin in portal', 'or az vm run-command'), ('VM agent receives', 'via the control plane'), ('Script runs inside', 'output returned')], title='Run Command', tones=['plain', 'blue', 'green']),
          caption='Run Command executes scripts inside a VM through the Azure agent, with no network path.')

    b.add('3.2', 'Azure Serial Console',
          'A text-based console to a VM\'s serial port, using Special Administration Console on Windows, that works even when the network configuration is broken; it needs boot diagnostics enabled.',
          'reach a VM whose network settings were misconfigured so that RDP and SSH no longer work',
          ['Azure VM Run Command', 'Azure Bastion', 'Just-in-time (JIT) VM access'],
          'Works when the NETWORK is broken — needs boot diagnostics and the SAC console on Windows.',
          S.steps([('Network broken', 'RDP and SSH fail'), ('Open Serial Console', 'boot diagnostics on'), ('Fix the setting', 'via SAC or shell')], title='Serial Console', tones=['red', 'blue', 'green']),
          caption='Azure Serial Console gives text access to a VM even when its network is misconfigured.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Hyper-V memory, disks, and moving VMs', ['3.1'],
              'Dynamic Memory varies RAM between a minimum and maximum using a startup value, buffer, and weight; Smart Paging only helps a VM restart when startup memory exceeds the minimum and the host is short. Fixed-size virtual disks reserve all their space, dynamically expanding disks grow as data is written, differencing disks store changes against a read-only parent, and a VHD Set is the shared disk for guest clusters. SCSI-attached VHDX files can be resized while the VM runs.\n\n'
              'Live migration moves a running VM between hosts (Kerberos or CredSSP authentication, and shared-nothing if no shared storage), storage migration moves its files, and Import-VM can register, restore, or copy an exported VM (only a copy gets a new ID). Clustered hosts use Cluster Shared Volumes that every node accesses at once, and quorum is a majority of votes with a witness as tiebreaker, such as a Cloud Witness in an Azure storage account.')
    b.section('Hyper-V protection, replication, and networking', ['3.1'],
              'Shielded VMs use a vTPM and attested hosts so host administrators cannot read them. Generation 2 VMs use Secure Boot, and many Linux guests need the Microsoft UEFI Certificate Authority template. Hyper-V Replica sends changes every 30 seconds, 5 minutes, or 15 minutes with Kerberos on TCP 80 or certificates on TCP 443. A planned failover has no data loss, an unplanned failover uses the latest data and may lose some, and a test failover starts a disposable copy.\n\n'
              'On the network side, Switch Embedded Teaming combines identical adapters inside the virtual switch and supports RDMA, VLAN IDs are set per virtual adapter in access or trunk mode, and SR-IOV gives a VM direct access to a NIC function. DHCP guard and router guard drop rogue server messages, while MAC address spoofing must be turned on for software routers and some load balancers.')
    b.section('Azure VM storage, networking, and cost', ['3.2'],
              'Choose managed disks from Standard HDD up to Ultra Disk, which offers sub-millisecond latency and adjustable IOPS but is data disks only. Set host caching to None for logs, ReadOnly for read-heavy data, and keep important data off the temporary disk, which is lost when the VM moves. Azure Disk Encryption runs BitLocker inside the guest with keys in Key Vault, while encryption at host covers the temp disk and caches from the host.\n\n'
              'Scale sets use autoscale rules between a minimum and maximum. Azure Load Balancer is layer 4 with health probes, network security groups allow or deny traffic by priority (lowest number first), application security groups let rules name roles, and accelerated networking bypasses the host switch. Proximity placement groups favor latency over resilience. Cut cost with Azure Hybrid Benefit (licenses you own) and Reserved VM Instances, and troubleshoot with Run Command (through the control plane) or Serial Console (when the network is broken).')
