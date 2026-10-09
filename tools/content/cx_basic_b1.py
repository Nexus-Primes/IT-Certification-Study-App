"""3CX Basic, domain b1 (Deployment & System Setup): deployment choices, setup and licensing, network prerequisites, and system housekeeping.

Checked against the 3CX administrator manual (install, Debian ISO, hardware, firewall, upgrade, and system management pages, 2026).
"""
import svg as S

DOMAIN = 'b1'


def build(b):
    b.topics['1.1'] = ['Windows and Debian', 'Hosted by 3CX', 'Private cloud', 'Hypervisors', 'Sizing', 'Storage', 'Extension length', '3CX SMB']
    b.topics['1.2'] = ['Setup wizard', '3CX SMB', 'Editions', 'License activation', 'Configuration file', 'V20 upgrade checklist']
    b.topics['1.3'] = ['FQDN and split DNS', 'Inbound ports', 'RTP ports', 'SIP ALG', 'Port preservation', 'Push and outbound services', 'Firewall checker']
    b.objective('1.4', 'System health and housekeeping', ['Dashboard', 'Event log', 'Updates', 'Disk space', 'Remote storage'])

    # ------------------------------------------------------------------------------------------ 1.1
    b.add('1.1', 'Hosted by 3CX (managed instance)',
          '3CX runs the instance for you: it manages the system and operating system, applies updates automatically, and monitors the system and its security around the clock; the service does not include technical support.',
          'run a dedicated phone system without managing a server, its operating system, or its updates',
          ['Self-hosted private cloud', 'Debian Linux deployment', '3CX SMB (free edition)'],
          '3CX handles the OS, updates, and 24/7 monitoring — but technical SUPPORT is not included.',
          S.compare(('Hosted by 3CX', ['3CX manages the OS', 'Automatic updates', 'Monitored 24/7']), ('Self-managed', ['You manage the OS', 'You schedule updates', 'You monitor it']), title='Who runs the system'),
          caption='With Hosted by 3CX, 3CX manages the operating system, updates, and monitoring for you.')

    b.add('1.1', 'Self-hosted private cloud',
          'Running 3CX in your own account at Google Cloud, Amazon AWS, Amazon Lightsail, Microsoft Azure, or DigitalOcean; you do your own instance management, so it suits administrators who know that cloud provider.',
          "run the phone system in the company's own Azure subscription instead of on a server managed by 3CX",
          ['Hosted by 3CX (managed instance)', 'On-premise Windows deployment', '3CX SMB (free edition)'],
          'YOUR cloud account, YOUR instance management — Hosted by 3CX is managed for you.',
          S.table(['Provider', 'Self-hosted option'], [('Google Cloud', 'supported'), ('Amazon AWS and Lightsail', 'supported'), ('Microsoft Azure', 'supported'), ('DigitalOcean', 'supported')], title='Private cloud providers', col_widths=[0.6, 0.4]),
          caption='A self-hosted private cloud runs 3CX in your own account at a supported cloud provider.')

    b.add('1.1', 'Debian ISO installation',
          'Installing 3CX on a machine dedicated to it using 3CX\'s own Debian 12 ISO; do not add packages or run operating system updates from the command line, because 3CX applies tested updates itself and manual changes make the installation unsupported.',
          'install the phone system on a dedicated virtual machine from the vendor\'s own image and leave operating system updates to the PBX',
          ['On-premise Windows deployment', 'Hosted by 3CX (managed instance)', '3CX SMB (free edition)'],
          'DEDICATE the machine and never run apt updates by hand — 3CX applies the tested ones.',
          S.steps([('Boot the 3CX ISO', 'static IP first'), ('Debian installs', '5 to 20 minutes'), ('Upload config file', 'browser port 5015')], title='Debian ISO install', tones=['plain', 'blue', 'green']),
          caption='The 3CX Debian ISO installs a dedicated system whose updates 3CX manages.')

    b.add('1.1', 'Virtualization platform support',
          'On-premise 3CX is supported as a virtual machine on VMware ESXi 6.5u1 or later with VMware Tools, Microsoft Hyper-V 6.2 or later, KVM 2.8 or later, and Citrix XenServer 7.0 or later; avoid physical-to-virtual converted machines because of timer problems.',
          'check whether a hypervisor version is supported before building the virtual machine for the phone system',
          ['Extension-based hardware sizing', 'Storage planning for recordings and logs', 'Simultaneous call sizing'],
          'ESXi 6.5u1+, Hyper-V 6.2+, KVM 2.8+, XenServer 7.0+ — and AVOID converted P2V machines.',
          S.table(['Hypervisor', 'Minimum version'], [('VMware ESXi', '6.5u1, with VMware Tools'), ('Microsoft Hyper-V', '6.2'), ('KVM', '2.8'), ('Citrix XenServer', '7.0')], title='Supported platforms', col_widths=[0.5, 0.5]),
          caption='3CX is supported on ESXi 6.5u1+, Hyper-V 6.2+, KVM 2.8+, and XenServer 7.0+.')

    b.add('1.1', 'Extension-based hardware sizing',
          '3CX publishes baseline sizes by number of extensions: Small up to 10, Medium up to 50, Large up to 250, and Enterprise up to 1,000; on Debian these call for 2, 4, 6, and 8 vCPUs with 4, 4, 8, and 16 GB of RAM, and the minimum for any install is one dedicated CPU or two vCPUs with 2 GB.',
          'choose a starting virtual machine size for a company that will have about 40 users',
          ['Simultaneous call sizing', 'Virtualization platform support', 'Storage planning for recordings and logs'],
          'Size by EXTENSIONS and usage: up to 10, 50, 250, or 1,000 — queues and recording raise the load.',
          S.table(['Size', 'Extensions', 'Debian vCPU / RAM'], [('Small', 'up to 10', '2 / 4 GB'), ('Medium', 'up to 50', '4 / 4 GB'), ('Large', 'up to 250', '6 / 8 GB'), ('Enterprise', 'up to 1,000', '8 / 16 GB')], title='Hardware tiers', col_widths=[0.3, 0.35, 0.35]),
          caption='3CX hardware tiers grow from 10 to 1,000 extensions; queues and recording add load.')

    b.add('1.1', 'Storage planning for recordings and logs',
          'Allocate at least 40 GB for the base system, then add space for backups, voicemail, recordings, and logs: one minute of recorded audio uses about 1 MB, and verbose logging on a busy system can use up to about 1 GB per day, so offload old data to remote storage.',
          'work out why a busy system that records every call needs far more disk space than its installation size suggests',
          ['Extension-based hardware sizing', 'Virtualization platform support', 'Disk space management'],
          'About 1 MB per MINUTE of recording and up to ~1 GB/day of verbose logs — OFFLOAD to remote storage.',
          S.facts([('Base system', 'at least 40 GB'), ('Recordings', 'about 1 MB a minute'), ('Verbose logs', 'up to 1 GB a day'), ('Fix', 'archive to remote storage')], title='Disk sizing'),
          caption='Plan disk for recordings and logs: about 1 MB per recorded minute and heavy verbose logs.')

    b.add('1.1', 'Network capacity and QoS for voice',
          '3CX needs at least a 1 Gb LAN, and 10 Gb for 1,000 or more extensions; on busy or mixed-use networks, quality of service should prioritize VoIP traffic over less time-sensitive data, and link aggregation is available on hypervisors but not on bare metal.',
          'keep calls clear on a network that is also carrying heavy file transfers',
          ['Dynamic DNS', 'Reverse proxy / router port forwarding', 'Codec negotiation'],
          'PRIORITIZE voice with QoS — a 1 Gb LAN is the minimum, 10 Gb from 1,000 extensions.',
          S.steps([('Voice packets', 'marked as priority'), ('Switch applies QoS', 'voice goes first'), ('File transfers', 'wait their turn')], title='Quality of service', tones=['blue', 'primary', 'plain']),
          caption='QoS prioritizes voice traffic so calls stay clear on busy shared networks.')

    b.add('1.1', 'Extension number length',
          'During setup you choose how many digits extension numbers have, and that choice cannot be changed later, so decide on the numbering plan before running the installation.',
          'decide how many digits internal numbers will have before running the installation, because the choice is permanent',
          ['FQDN requirement', 'Outbound caller ID', 'Simultaneous call sizing'],
          'PERMANENT — and the FQDN cannot easily be changed either, so plan both first.',
          S.steps([('Plan numbering', 'sites, departments'), ('Choose digit count', 'in the setup'), ('Locked in', 'cannot change later')], title='Extension length', tones=['plain', 'blue', 'amber']),
          caption='The extension number length is chosen during setup and cannot be changed later.')

    # ------------------------------------------------------------------------------------------ 1.2
    b.add('1.2', 'Edition feature differences',
          'Dedicated systems are licensed as the Basic, Pro, or AI edition (and SMB for small shared systems), and some features depend on the edition: barge in, listen in, and whisper need Pro or AI, while skills-based queues, AI summaries, and active-passive failover need the AI edition.',
          "work out why a feature such as active-passive failover is missing from a company's license",
          ['Simultaneous call licensing model', 'License activation', '3CX SMB (free edition)'],
          'The EDITION unlocks features — failover and skills-based queues need AI; barge and listen need Pro or AI.',
          S.table(['Feature', 'Needs'], [('Barge, listen, whisper', 'Pro or AI'), ('Skills-based queues', 'AI'), ('AI summaries and sentiment', 'AI'), ('Active-passive failover', 'AI')], title='Edition features', col_widths=[0.6, 0.4]),
          caption='Some 3CX features depend on the edition; failover and skills-based queues need the AI edition.')

    b.add('1.2', 'Installation configuration file',
          'After the Debian ISO install finishes, you supply a configuration file generated from your 3CX account, by browser on port 5015 of the new machine or from the command line, and then sign in with the email you registered.',
          "finish an on-premise installation by providing the settings generated for the company's 3CX account",
          ['Setup wizard', 'License activation', 'Company information configuration'],
          'Generated on the 3CX site, then UPLOADED to the new machine (browser port 5015 or command line).',
          S.steps([('Configure on 3CX site', 'get the config file'), ('Upload to the PBX', 'port 5015 or CLI'), ('Set password', 'sign in with your email')], title='Configuration file', tones=['plain', 'blue', 'green']),
          caption='The installation configuration file from your 3CX account is uploaded to complete an on-premise install.')

    b.add('1.2', 'V20 upgrade checklist',
          'Before upgrading to version 20, assign a System Owner with a unique email, have at least 2 vCPUs and 2 GB of RAM, configure split DNS, move queues, ring groups, and IVRs into departments, and set office hours per department; roles reset to their defaults and roles cannot be customized.',
          'prepare an older system for the upgrade to version 20 so that nothing breaks when it completes',
          ['Installation configuration file', 'Maintenance updates', 'Manual backup and restore'],
          'SYSTEM OWNER first, then departments and office hours — and rights reset to the role defaults.',
          S.steps([('Assign System Owner', 'unique email'), ('Departments and hours', 'move queues, IVRs'), ('Upgrade', 'rights reset to defaults')], title='Upgrading to V20', tones=['blue', 'plain', 'amber']),
          caption='A V20 upgrade needs a System Owner, split DNS, departments, and per-department office hours.')

    # ------------------------------------------------------------------------------------------ 1.3
    b.add('1.3', 'Split DNS',
          'Configuring the 3CX FQDN to resolve to the PBX\'s LAN address inside the network and to its public address from the Internet, using an internal DNS server or a firewall that supports hairpin NAT; on-premise installs require it.',
          'make one name for the PBX work both for phones inside the office and for apps outside it',
          ['Dynamic DNS', 'FQDN requirement', 'Reverse proxy / router port forwarding'],
          'ONE name, TWO answers — LAN address inside, public address outside.',
          S.compare(('Inside the LAN', ['Internal DNS answers', 'FQDN gives LAN IP', 'Traffic stays local']), ('From the Internet', ['Public DNS answers', 'FQDN gives public IP', 'Port-forwarded in']), title='Split DNS'),
          caption='Split DNS makes the 3CX FQDN resolve to a LAN address inside and a public address outside.')

    b.add('1.3', 'Inbound firewall ports for 3CX',
          'To work with trunks and remote apps, open inbound UDP 5060 and TCP 5060 to 5061 for SIP, UDP 9000 to 10999 for call audio, TCP and UDP 5090 for the 3CX tunnel, and TCP 443 or 5001 for HTTPS presence and provisioning.',
          'list the ports that must be opened inbound on the firewall for SIP trunks and for remote apps',
          ['Ports for 3CX video conferencing', 'Outbound services 3CX contacts', 'A single SIP port'],
          'SIP 5060/5061, RTP 9000 to 10999, tunnel 5090, HTTPS 5001 or 443 — and HTTP 5000 stays closed to the WAN.',
          S.table(['Purpose', 'Inbound port'], [('SIP', 'UDP 5060; TCP 5060-5061'), ('Call audio (RTP)', 'UDP 9000-10999'), ('3CX tunnel', 'TCP and UDP 5090'), ('HTTPS', 'TCP 443 or 5001')], title='Ports to open', col_widths=[0.4, 0.6]),
          caption='SIP, RTP, tunnel, and HTTPS ports must be open inbound for trunks and remote apps.')

    b.add('1.3', 'Push notification connectivity',
          'The PBX sends push messages so smartphone apps wake up for calls: outbound TCP 443 for Google Android push and TCP 443, 2197, and 5223 for Apple iOS push, which greatly improves the usability of the mobile apps.',
          'make a smartphone app ring for incoming calls even though the app is closed in the background',
          ['3CX Tunnel', 'Built-in firewall checker', 'Dynamic DNS'],
          'OUTBOUND ports — 443 for Android, and 443, 2197, 5223 for iOS.',
          S.steps([('Call arrives', 'at the PBX'), ('PBX sends a push', 'Google or Apple'), ('App wakes and rings', 'user answers')], title='Push notifications', tones=['plain', 'blue', 'green']),
          caption='Push notifications wake smartphone apps for calls and need outbound ports to Google and Apple.')

    b.add('1.3', 'SIP ALG',
          'A router or firewall feature that inspects and rewrites SIP packets; it can alter the messages in ways 3CX traces cannot show, which breaks remote phones and providers, so use a device without it or disable it.',
          'explain why calls misbehave when a router quietly rewrites the SIP messages passing through it',
          ['Split DNS', 'Dynamic DNS', 'Reverse proxy / router port forwarding'],
          'DISABLE it — the firewall checker detects tampering by comparing a hash of a test message.',
          S.steps([('PBX sends SIP', 'unchanged message'), ('Router rewrites it', 'SIP ALG active'), ('Providers and phones', 'misread the call')], title='SIP ALG', tones=['plain', 'amber', 'red']),
          caption='SIP ALG rewrites SIP packets and should be disabled for 3CX.')

    b.add('1.3', 'Port preservation and full cone NAT',
          'Two NAT behaviors 3CX needs: the firewall must keep a SIP source port such as 5060 or 5090 unchanged when translating to the public address, and it must accept inbound packets from servers the PBX has not contacted, as a provider\'s audio server may.',
          'determine why a firewall check fails because translation changes the source port of SIP traffic',
          ['SIP ALG', 'Split DNS', 'Dynamic DNS'],
          'Port PRESERVATION keeps the source port; FULL CONE lets unexpected servers send audio in.',
          S.compare(('Port preservation', ['Source port unchanged', '5060 stays 5060', 'Provider replies correctly']), ('Full cone NAT', ['Any server may reply', 'Audio server differs from SIP', 'No inbound block']), title='What the NAT must do'),
          caption='3CX needs the firewall to preserve source ports and to behave as full cone NAT.')

    b.add('1.3', 'Outbound services 3CX contacts',
          'The PBX needs outbound TCP 443 to cloud services for activation, discovering its public IP, phone provisioning (RPS), updates and phone firmware, SMTP relay, push notifications, and video conferencing, so a strict outbound firewall must allow them.',
          'allow the cloud services the phone system uses for licensing, updates, and phone provisioning through a strict outbound firewall',
          ['Inbound firewall ports for 3CX', 'Push notification connectivity', '3CX Tunnel'],
          'Everything goes OUT on TCP 443 — activation, RPS, updates, push, and mail relay.',
          S.hub(('PBX outbound 443',), [('Activation', 'activate.3cx.com'), ('RPS', 'phone provisioning'), ('Updates', 'downloads-global'), ('Push', 'Google and Apple')], title='Cloud services'),
          caption='The PBX needs outbound TCP 443 to 3CX cloud services for licensing, updates, and provisioning.')

    b.add('1.3', 'Private addressing and static IP',
          'On-premise installs are supported only on private RFC 1918 networks (10.0.0.0/8, 172.16.0.0/12, or 192.168.0.0/16) with a static IP address for the PBX and a dedicated public IP for external services; changing the PBX\'s IP later requires a reboot and re-provisioning phones and apps.',
          'prepare the address plan for an on-premise installation, including how the PBX is reached from outside',
          ['Dynamic DNS', 'Split DNS', 'Hosted by 3CX (managed instance)'],
          'RFC 1918 inside, a STATIC LAN IP, and a dedicated PUBLIC IP — changing it later is disruptive.',
          S.facts([('Private range', '10.x, 172.16-31.x, 192.168.x'), ('LAN address', 'static'), ('Public address', 'dedicated'), ('Changing it', 'reboot and re-provision')], title='Addressing rules'),
          caption='On-premise 3CX needs a static private address and a dedicated public IP.')

    b.add('1.3', 'Firewall responsibility for on-premise installs',
          'Every on-premise environment is different, so you must define the ACL and firewall rules that stop the 3CX host from reaching sensitive subnets and endpoints, preventing an attacker who compromises the PBX from pivoting into the rest of the network.',
          'limit what a compromised phone system could reach on the internal network',
          ['Reverse proxy / router port forwarding', 'Split DNS', 'SIP ALG'],
          'YOU define the ACLs — 3CX will not stop a compromised PBX from reaching other subnets.',
          S.steps([('PBX host', 'must be reachable'), ('Firewall ACLs', 'block sensitive subnets'), ('Pivot prevented', 'if the PBX is attacked')], title='Containing the PBX', tones=['plain', 'blue', 'green']),
          caption='On-premise administrators must write ACLs that keep the PBX host away from sensitive subnets.')

    # ------------------------------------------------------------------------------------------ 1.4
    b.add('1.4', 'Admin Console dashboard',
          'The dashboard summarizes system health in one view: license, version, FQDN, active calls, update and backup status, storage, and service status, with shortcuts to the activity log, firewall checker, packet capture, and a support information export.',
          'check license expiry, update status, and service health from a single page',
          ['Event log', 'Call reports', 'Activity log'],
          'ONE page for health — with shortcuts to the firewall checker, capture, and support export.',
          S.hub(('Dashboard',), [('Information', 'license, version'), ('Maintenance', 'updates, backups'), ('Troubleshooting', 'checker, capture')], title='Admin Console dashboard'),
          caption='The dashboard shows system health and links to troubleshooting tools.')

    b.add('1.4', 'Event log',
          'The log of important system events in three levels, Error, Warning, and Information, each with a unique ID, such as an emergency number being dialed, a trunk status change, a trunk failover, or the license call limit being reached; email alerts can be set for critical events.',
          'find out when a trunk changed registration status and when the license call limit was hit',
          ['Activity log', 'Call reports', 'Dashboard'],
          'Three LEVELS and numbered IDs — set email ALERTS in Admin > System > Alerts.',
          S.table(['Event ID', 'Meaning'], [('4099', 'emergency number dialed'), ('4100', 'trunk status changed'), ('12289', 'trunk failover occurred'), ('8193', 'license limit reached')], title='Sample events', col_widths=[0.3, 0.7]),
          caption='The event log records errors, warnings, and information events with unique IDs.')

    b.add('1.4', 'Automatic updates',
          'In Admin > System > Updates you can schedule automatic 3CX updates by time and interval, which also applies Debian OS updates; updates arrive in separate tracks (PBX, AI, SBC, phone templates, SIP trunks, OS security), and a system cannot be rolled back to a previous version.',
          'keep the phone system and its Debian operating system patched on a schedule with minimal effort',
          ['A manual apt upgrade', 'A scheduled backup', 'Phone firmware updates'],
          'NO ROLLBACK — and OS updates come WITH the 3CX updates, tested first.',
          S.steps([('Schedule updates', 'time and interval'), ('3CX downloads tracks', 'PBX, OS, templates'), ('Applied off-hours', 'no rollback possible')], title='Automatic updates', tones=['blue', 'plain', 'amber']),
          caption='Automatic updates keep 3CX and its Debian OS current, and a system cannot be rolled back.')

    b.add('1.4', 'Disk space management',
          'Running out of disk is a main cause of downtime, so offload data to remote storage, set auto-clean for recordings, set a voicemail quota with automatic deletion, and purge old call and chat logs from the dashboard.',
          'stop the phone system from filling its disk with recordings, voicemail, and logs',
          ['Scheduled backup', 'Capacity planning for growth', 'Call reports'],
          'RECORDINGS, VOICEMAIL, and LOGS fill the disk — remote storage plus auto-clean and purge.',
          S.layers([('Remote storage', 'archive recordings, backups', 'blue'), ('Auto-clean', 'recordings and voicemail', 'green'), ('Purge logs', 'call and chat logs', 'amber')], title='Keeping disk free'),
          caption='Remote storage, auto-clean, and log purging keep the PBX from running out of disk.')

    b.add('1.4', 'Disk Protect Mode',
          'A safeguard that stops recordings being written when free disk space falls below about 500 MB, with an email alert to the administrator, protecting the system from filling up completely.',
          'explain why recordings stopped being saved when the disk almost filled',
          ['Recording quota', 'Voicemail quota', 'Auto-clean for recordings'],
          'Under about 500 MB free? Recordings STOP being written and an email is sent.',
          S.flow_split(('Free disk space', 'checked'), [('Above 500 MB', 'recordings saved'), ('Under 500 MB', 'Disk Protect Mode')], title='Disk Protect Mode', tones=['green', 'red']),
          caption='Disk Protect Mode stops recording writes when free space drops below about 500 MB.')

    b.add('1.4', 'Remote data storage and archive',
          'A setting in Admin > System > Storage that sends recordings and backups to off-box storage over FTP, FTPS, FTPES, SFTP, SMB, Google Storage, Amazon S3, or Microsoft SharePoint, instead of keeping them on the PBX\'s local disk, which should be only temporary.',
          'move recordings and backups to storage that is not on the PBX itself so its disk does not fill',
          ['A backup folder inside the 3CX install directory', 'Voicemail quota', 'Call log purge'],
          'OFF-BOX storage — and never a local folder inside the 3CX install directory, which is removed on uninstall.',
          S.table(['Location type', 'Example use'], [('FTP, FTPS, SFTP', 'file server'), ('SMB', 'Windows share'), ('Google Storage, Amazon S3', 'cloud bucket'), ('SharePoint', 'Microsoft 365 storage')], title='Remote storage options', col_widths=[0.55, 0.45]),
          caption='Remote storage moves recordings and backups off the PBX disk.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Hosting choices, sizing, and installation details', ['1.1', '1.2'],
              'Choose how 3CX runs: Hosted by 3CX (3CX manages the operating system, updates, and monitoring, but support is not included), a self-hosted private cloud at Google, AWS, Lightsail, Azure, or DigitalOcean, or on premise on Windows or Debian. 3CX SMB is a free shared instance for up to 10 users. Install the Debian version from 3CX\'s ISO on a dedicated machine, never run OS updates by hand, and finish by uploading the configuration file from your 3CX account. Supported hypervisors are ESXi 6.5u1+, Hyper-V 6.2+, KVM 2.8+, and XenServer 7.0+.\n\n'
              'Size by extensions (Small 10, Medium 50, Large 250, Enterprise 1,000), allow disk for recordings (about 1 MB a minute) and logs, and use at least a 1 Gb LAN with QoS. The extension number length and the FQDN are chosen during setup and cannot easily be changed. Editions (SMB, Basic, Pro, AI) gate features such as barge in (Pro or AI) and failover (AI), and a version 20 upgrade needs a System Owner, split DNS, departments, and office hours per department.')
    b.section('Network readiness for 3CX', ['1.3'],
              'On-premise systems need a private RFC 1918 network, a static LAN IP, a dedicated public IP, and split DNS so the FQDN resolves to the LAN address inside and the public address outside. Open inbound UDP 5060 and TCP 5060 to 5061 (SIP), UDP 9000 to 10999 (audio, two ports per call), TCP and UDP 5090 (tunnel), and TCP 443 or 5001 (HTTPS); keep HTTP 5000 closed to the WAN. The PBX also needs outbound TCP 443 to 3CX cloud services and to Google and Apple for push.\n\n'
              'Disable SIP ALG, and make sure the firewall preserves source ports and behaves as full cone NAT; the built-in firewall checker tests port preservation, full cone NAT, and SIP ALG using STUN. You must also define ACLs that keep the PBX host away from sensitive subnets.')
    b.section('System health and housekeeping', ['1.4'],
              'The dashboard shows license, version, update, backup, storage, and service status with shortcuts to troubleshooting tools, and the event log records errors, warnings, and information with unique IDs (for example 4099 for an emergency call, 4100 for a trunk status change, 12289 for a trunk failover, and 8193 for the license limit); email alerts can be set for critical events.\n\n'
              'Enable automatic updates, which also apply Debian OS updates; there is no rollback. Avoid downtime from a full disk by archiving recordings and backups to remote storage, setting auto-clean, a voicemail quota, and log purging, and remember Disk Protect Mode stops recording writes below about 500 MB of free space.')
