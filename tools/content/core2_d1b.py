"""Core 2, domain 1 (Operating Systems): new objectives 1.7-1.13 and their concepts."""
import svg as S


def build(b):
    b.objective('1.7', 'Windows networking', ['Workgroup vs domain', 'Mapped drives', 'VPN and proxy', 'Metered connections', 'IP configuration'])
    b.objective('1.8', 'Control Panel utilities', ['Internet Options', 'Programs and Features', 'Power Options', 'Credential Manager', 'Devices and Printers'])
    b.objective('1.9', 'Application installation', ['System requirements', 'Deployment methods', 'Pilot rollout', 'Compatibility mode'])
    b.objective('1.10', 'Cloud productivity', ['Email and collaboration suites', 'Single sign-on', 'Version history'])
    b.objective('1.11', 'OS types and file systems', ['Workstation vs server', 'Embedded and ChromeOS', 'End of life', 'NTFS and exFAT', 'APFS and ext4'])
    b.objective('1.12', 'macOS features', ['Finder and Spotlight', 'Mission Control', 'Keychain and iCloud', 'Gatekeeper and FileVault', 'Force Quit'])
    b.objective('1.13', 'Linux commands and tools', ['cron', 'grep and find', 'ps and top', 'df and du', 'Samba'])

    # ------------------------------------------------------------------------------------------ 1.7 Windows networking
    b.add('1.7', 'Workgroup (peer-to-peer) network',
          'A small network in which each Windows PC keeps its own local accounts and shares resources directly, with no central server managing logins or policy.',
          'set up a five-person office with no server, where every PC manages its own accounts and shared folders',
          ['Active Directory domain', 'VPN', 'Cloud tenant with SSO'],
          'NO central server — each PC has its own accounts, whereas a domain centralizes them on a domain controller.',
          S.compare(('Workgroup', ['Peer to peer', 'Accounts stored on each PC', 'Fine for a handful of PCs']), ('Domain', ['Domain controller in charge', 'Central accounts and policy', 'One login, many PCs']),
                    title='Workgroup vs domain'),
          caption='A workgroup is peer-to-peer with local accounts on each PC; a domain centralizes accounts on a server.')

    b.add('1.7', 'Joining a domain',
          'Adding a Windows Pro (or higher) PC to an Active Directory domain so users sign in with domain credentials and the PC receives Group Policy; it needs a reachable domain controller and working DNS.',
          'let employees sign in to a company laptop with their network username and receive company policies',
          ['Workgroup membership', 'A local administrator account', 'A Microsoft account sign-in'],
          'It needs Pro or higher and a reachable domain controller with DNS — Home edition cannot join, whatever the settings say.',
          S.steps([('Join domain', 'System > Domain'), ('DC authenticates', 'user signs in'), ('Policy applies', 'GPOs and scripts')], title='Domain join', tones=['blue', 'primary', 'green']),
          caption='Joining a domain lets a PC use central accounts and Group Policy; it needs Pro or higher and a reachable DC.')

    b.add('1.7', 'Mapped network drive',
          'A drive letter assigned to a shared folder on another computer or server (a UNC path such as \\\\server\\share) so it appears in File Explorer like a local drive, optionally reconnecting at sign-in.',
          'give users a persistent drive letter for the department\'s shared folder',
          ['A local disk partition', 'Port forwarding', 'A roaming profile'],
          'A drive letter pointing at a UNC SHARE — it is not storage on the PC itself.',
          S.steps([('Z:', 'drive letter'), ('UNC path', r'\\fs01\dept'), ('File server', 'holds the share')], title='What a mapped drive points to', tones=['plain', 'blue', 'green']),
          caption='A mapped drive gives a shared folder on another computer a local drive letter.')

    b.add('1.7', 'Metered connection',
          'A setting that tells Windows a network has a data cap, so it postpones large downloads such as updates and trims background data use.',
          'keep Windows Update from using up the limited data on a mobile hotspot',
          ['Airplane mode', 'VPN', 'Proxy server'],
          'It marks a connection as LIMITED — airplane mode turns the radios off entirely.',
          S.compare(('Metered: on', ['Large updates are deferred', 'Background sync is trimmed', 'Right for hotspots and caps']), ('Metered: off', ['Updates download freely', 'Background sync runs', 'Right for home broadband']),
                    title='Metered connection', tones=('amber', 'green')),
          caption='Setting a connection as metered makes Windows defer big downloads and reduce background data use.')

    b.add('1.7', 'VPN client configuration in Windows',
          'Windows can connect to a VPN gateway from Settings > Network & Internet > VPN, creating an encrypted tunnel across the Internet so a remote user reaches internal resources as if on site.',
          'let a remote employee securely reach internal file servers from hotel Wi-Fi',
          ['Port forwarding on the home router', 'A web proxy server', 'A public Wi-Fi hotspot'],
          'An encrypted TUNNEL into the private network — a proxy only relays web requests and does not put you on the LAN.',
          S.steps([('Laptop', 'VPN client'), ('Encrypted tunnel', 'across the Internet'), ('VPN gateway', 'office network')], title='Remote access over VPN', tones=['blue', 'amber', 'green']),
          caption='A VPN client builds an encrypted tunnel to the office so a remote PC can use internal resources.')

    b.add('1.7', 'Proxy server settings',
          'A proxy relays a client\'s web requests for filtering, caching, or logging; Windows can use an automatic setup script (PAC), auto-detect, or a manually entered proxy address and port.',
          'send a workstation\'s web traffic through the company filtering server',
          ['A VPN client', 'Port forwarding', 'A default gateway change'],
          'It relays web REQUESTS through a middleman — a VPN encrypts all traffic into a tunnel instead.',
          S.steps([('Browser', 'sends request'), ('Proxy', 'filter, cache, log'), ('Internet', 'site replies')], title='Web traffic through a proxy', tones=['plain', 'amber', 'blue']),
          caption='A proxy server sits between clients and the web to filter, cache, and log requests.')

    b.add('1.7', 'Alternate configuration (APIPA fallback)',
          'When a Windows PC set to obtain an address automatically cannot reach a DHCP server, it self-assigns a 169.254.x.x APIPA address, or uses a configured alternate address, that works only on the local segment.',
          'explain why a PC that cannot reach DHCP shows a 169.254.x.x address and no Internet access',
          ['A static IP address', 'A DHCP reservation', 'A public IP address'],
          '169.254.x.x means DHCP FAILED — the PC addressed itself, so it can only talk to other link-local devices.',
          S.steps([('DHCP request', 'no reply'), ('Self-assign', '169.254.x.x'), ('Local only', 'no gateway, no Internet')], title='What a failed DHCP request looks like', tones=['red', 'amber', 'plain']),
          caption='With no DHCP reply Windows self-assigns a 169.254.x.x address that only works on the local link.')

    b.add('1.7', 'Static IP configuration (adapter properties)',
          'Setting a fixed IPv4 address, subnet mask, default gateway, and DNS servers manually in the network adapter\'s Properties (ncpa.cpl) instead of obtaining them automatically.',
          'give a machine a fixed address that never changes by entering it directly on the network adapter',
          ['Dynamic (DHCP) addressing', 'APIPA addressing', 'A NAT translation entry'],
          'Typed in by hand on the adapter — DHCP and APIPA both assign an address automatically.',
          S.facts([('IP address', '192.168.1.50'), ('Subnet mask', '255.255.255.0'), ('Default gateway', '192.168.1.1'), ('DNS servers', '192.168.1.1 and 8.8.8.8')], title='Adapter Properties > IPv4'),
          caption='A static IP is entered manually (address, mask, gateway, DNS) in the adapter\'s IPv4 properties.')

    b.add('1.7', 'Firewall exception (allowed app or port)',
          'An inbound rule in Windows Defender Firewall that lets a specific program or port receive connections while the firewall stays on; rules can be set per profile (Domain, Private, Public).',
          'allow a locally hosted app to accept connections on TCP 8080 without turning the firewall off',
          ['Disabling the firewall', 'Port forwarding on the router', 'Disabling UAC'],
          'Open ONE program or port and keep the firewall on — router port forwarding is a different device altogether.',
          S.table(['Profile', 'Typical use'], [('Domain', 'PC joined to the company domain'), ('Private', 'trusted home or office network'), ('Public', 'coffee shop or airport Wi-Fi')], title='Firewall rules apply per profile', col_widths=[0.25, 0.75]),
          caption='A firewall exception allows one app or port through while the Windows firewall stays enabled.')

    # ------------------------------------------------------------------------------------------ 1.8 Control Panel
    b.add('1.8', 'Internet Options',
          'The Control Panel applet (inetcpl.cpl) for legacy browser and system web settings: security zones and trusted sites, proxy and VPN connections, privacy and pop-up options, add-ons, and clearing temporary files.',
          'set a proxy server and add a trusted site through the classic browser settings dialog',
          ['Network and Sharing Center', 'Programs and Features', 'Device Manager'],
          'Zones, proxy, and privacy for web access sit on its tabs — Network and Sharing Center manages adapters and sharing.',
          S.hub(('Internet Options', 'inetcpl.cpl'),
                [('General', 'home page, history'), ('Security', 'zones, trusted sites'), ('Privacy', 'cookies, pop-ups'), ('Connections', 'proxy and VPN'), ('Programs', 'add-ons, defaults'), ('Advanced', 'TLS and misc')]),
          caption='Internet Options holds browser security zones, proxy and connection settings, privacy, and add-ons.')

    b.add('1.8', 'Programs and Features',
          'The Control Panel applet (appwiz.cpl) that lists installed desktop programs for uninstalling, repairing, or changing them, with links to turn Windows features on or off and view installed updates.',
          'uninstall a desktop application and turn on the Hyper-V Windows feature',
          ['Device Manager', 'Administrative Tools', 'Indexing Options'],
          'appwiz.cpl uninstalls programs AND toggles Windows features such as Hyper-V — Device Manager only deals with hardware.',
          S.facts([('Uninstall / Change', 'remove or repair a program'), ('Windows features', 'Hyper-V, .NET, Telnet client'), ('Installed updates', 'view or remove patches')], title='Programs and Features'),
          caption='Programs and Features removes programs, toggles Windows features, and lists installed updates.')

    b.add('1.8', 'Power Options',
          'The Control Panel applet that sets power plans (Balanced, High performance, Power saver), what the power button and lid do, sleep and hibernate timers, USB selective suspend, and Fast Startup.',
          'keep a laptop awake with the lid closed while it is docked to an external monitor',
          ['Windows Mobility Center', 'Display settings', 'Task Scheduler'],
          'Lid and power-button actions live in Power Options — Mobility Center only offers quick toggles such as brightness and plan choice.',
          S.table(['Mode', 'Where the session is kept', 'Resume'], [('Sleep', 'in RAM, low power', 'seconds'), ('Hibernate', 'saved to disk, no power', 'slower'), ('Fast Startup', 'kernel saved to disk', 'faster boot')], title='Power states', col_widths=[0.25, 0.5, 0.25]),
          caption='Power Options controls power plans, lid and button actions, sleep and hibernate, and Fast Startup.')

    b.add('1.8', 'Credential Manager',
          'The Control Panel applet that stores saved usernames and passwords for websites and for Windows resources such as network shares, where they can be viewed, edited, or removed.',
          'clear a stale saved password for a file server that keeps locking out the user\'s account',
          ['Local Users and Groups', 'Certificate Manager', 'Group Policy Editor'],
          'It holds saved PASSWORDS for sites and shares — stale entries are a classic cause of repeated lockouts.',
          S.compare(('Web Credentials', ['Saved site logins', 'Browser passwords']), ('Windows Credentials', ['Network share logins', 'Remote Desktop and apps', 'Certificate-based entries']), title='Credential Manager'),
          caption='Credential Manager stores saved web and Windows logins; deleting a stale entry can stop repeated lockouts.')

    b.add('1.8', 'File Explorer Options',
          'The Control Panel applet that controls how File Explorer displays items: show hidden files, show file extensions, what it opens to, folder views, and search behavior.',
          'show hidden files and file extensions so a disguised name like invoice.pdf.exe becomes visible',
          ['Folder permissions', 'Indexing Options', 'Programs and Features'],
          'Showing EXTENSIONS exposes disguised files such as invoice.pdf.exe — permissions are a different setting.',
          S.compare(('Extensions hidden', ['invoice.pdf', 'looks harmless']), ('Extensions shown', ['invoice.pdf.exe', 'an executable in disguise']), title='Why show file extensions', tones=('amber', 'red')),
          caption='File Explorer Options can reveal hidden files and extensions, exposing disguised names like invoice.pdf.exe.')

    b.add('1.8', 'Devices and Printers',
          'A Control Panel view of connected devices such as printers, scanners, mice, and phones, where you can add a printer, set the default, open the print queue and printer properties, and run troubleshooters.',
          'set the default printer and clear a stuck print queue',
          ['Device Manager', 'Disk Management', 'Network and Sharing Center'],
          'Printer-level tasks (default, queue, properties) — Device Manager is about hardware drivers.',
          S.facts([('Add a printer', 'wizard or network search'), ('Default printer', 'where prints go'), ('See what\'s printing', 'open and clear the queue'), ('Printer properties', 'ports, sharing, drivers')], title='Devices and Printers'),
          caption='Devices and Printers manages connected devices, printer defaults, queues, and printer properties.')

    b.add('1.8', 'Indexing Options',
          'The Control Panel applet that chooses which locations Windows Search indexes for fast results, and can rebuild the index when search returns missing or stale results.',
          'fix File Explorer search that does not find recently saved files',
          ['Disk Cleanup', 'Defragment and Optimize Drives', 'File Explorer Options'],
          'It controls the search INDEX — rebuild it when results are missing or stale.',
          S.steps([('Locations', 'folders to index'), ('Indexer', 'catalogs files'), ('Search', 'fast results')], title='How Windows Search indexing works', tones=['plain', 'blue', 'green']),
          caption='Indexing Options chooses the indexed locations and can rebuild the index to fix missing search results.')

    b.add('1.8', 'Network and Sharing Center',
          'The Control Panel hub that shows the active network and connection type, opens adapter settings, sets up new connections, and holds the advanced sharing settings for network discovery and file and printer sharing.',
          'turn on network discovery and file sharing for the Private network profile',
          ['Internet Options', 'Windows Defender Firewall', 'Credential Manager'],
          'Discovery and sharing toggles per PROFILE live here — Internet Options is about web zones and proxy settings.',
          S.hub(('Network and Sharing Center', 'network status in one place'),
                [('Active networks', 'name and type'), ('Change adapter', 'ncpa.cpl'), ('Advanced sharing', 'discovery, file sharing')]),
          caption='Network and Sharing Center shows connection status and holds adapter and advanced sharing settings.')

    b.add('1.8', 'Mail control panel (Outlook profiles)',
          'The Mail (Microsoft Outlook) applet manages Outlook profiles, email accounts, and data files, so a damaged profile can be replaced without reinstalling Office.',
          'create a new Outlook profile to fix one that will not open, without reinstalling Office',
          ['Credential Manager', 'Programs and Features', 'User Accounts'],
          'Profiles and data files for Outlook are managed in Mail — reinstalling Office is the heavy-handed alternative.',
          S.steps([('Mail applet', 'Show Profiles'), ('Add profile', 'sign in again'), ('Set default', 'prompt or use')], title='Replacing a damaged Outlook profile', tones=['plain', 'blue', 'green']),
          caption='The Mail applet manages Outlook profiles and data files, so a bad profile can be recreated.')

    # ------------------------------------------------------------------------------------------ 1.9 Application installation
    b.add('1.9', 'Application system requirements',
          'The minimum CPU, RAM, storage, graphics, OS version, and 32/64-bit support an application needs; they should be compared with the target machine before installation.',
          'prevent an install that will crash or run too slowly by checking whether the PC meets the vendor\'s minimums first',
          ['Running the installer as Administrator', 'Disabling UAC', 'Installing and testing afterward'],
          'Verify the MINIMUMS before installing — elevation and UAC changes cannot add RAM or a supported OS version.',
          S.table(['Check', 'Compare against'], [('OS and bitness', 'Windows version, 32/64-bit'), ('CPU and RAM', 'vendor minimum or recommended'), ('Storage', 'free space for the install'), ('Graphics', 'GPU, driver, display')], title='Pre-install checklist', col_widths=[0.35, 0.65]),
          caption='Compare an app\'s stated requirements with the PC (OS, CPU, RAM, storage, graphics) before installing.')

    b.add('1.9', 'Centralized software deployment',
          'Pushing applications to many computers from a management platform (Intune, Configuration Manager, or Group Policy) as a silent, consistent install, instead of each user running an installer.',
          'deploy the same application silently to 200 company PCs without visiting each desk',
          ['Each user downloading and running the EXE', 'Installing from a DVD at every desk', 'Copying a portable app to a USB stick'],
          'ONE package pushed silently to many PCs — hand installs are slow, inconsistent, and need rights users should not have.',
          S.steps([('Admin', 'packages the app'), ('Management', 'Intune / SCCM / GPO'), ('PCs', 'silent install')], title='Central deployment', tones=['plain', 'blue', 'green']),
          caption='Management tools push a packaged application to many PCs silently and consistently.')

    b.add('1.9', 'Pilot (staged) rollout',
          'Deploying a new application or update to a small test group first to find compatibility, performance, or network problems before it reaches everyone.',
          'limit the damage if a new application version breaks something on company PCs',
          ['Deploying to every PC at once', 'Skipping testing because the vendor signed it', 'Disabling antivirus during installation'],
          'Small group FIRST, then widen — a flawless vendor signature does not prove it works in YOUR environment.',
          S.steps([('Pilot', 'small test group'), ('Review', 'issues and network load'), ('Wider rollout', 'in waves')], title='Staged rollout', tones=['amber', 'blue', 'green']),
          caption='A pilot group tests a deployment first, so problems are found before everyone is affected.')

    b.add('1.9', 'Compatibility mode',
          'A Windows feature that runs an older program with settings that emulate a previous Windows version, a reduced color or resolution mode, or administrator rights, to get legacy applications to work.',
          'get a legacy business application written for Windows 7 to run on Windows 11',
          ['Safe Mode', 'Selective startup', 'Windows Update rollback'],
          'It makes ONE program behave as if on an older Windows — a virtual machine is the heavier fallback when that is not enough.',
          S.steps([('Right-click', 'Properties'), ('Compatibility tab', 'pick older Windows'), ('Run program', 'test behavior')], title='Setting compatibility mode', tones=['plain', 'blue', 'green']),
          caption='Compatibility mode lets an older application run as if it were on an earlier Windows version.')

    # ------------------------------------------------------------------------------------------ 1.10 Cloud productivity
    b.add('1.10', 'Cloud productivity suite',
          'A vendor-hosted subscription such as Microsoft 365 or Google Workspace that delivers email, calendar, documents, chat, and storage through a browser or app, with administrator-managed accounts and licenses.',
          'give remote staff shared email, calendars, and live document editing without hosting any servers',
          ['On-premises Exchange server', 'A local file server', 'Peer-to-peer file sharing'],
          'Vendor-HOSTED and subscription-based — on-premises Exchange is the self-hosted alternative.',
          S.hub(('Cloud productivity suite', 'hosted by the vendor'), [('Email', 'mailboxes'), ('Calendar', 'scheduling'), ('Documents', 'co-authoring'), ('Chat and meetings', 'video, messaging'), ('Storage', 'files and sharing'), ('Admin portal', 'users, licenses')]),
          caption='Cloud suites such as Microsoft 365 and Google Workspace host email, documents, chat, and storage for you.')

    b.add('1.10', 'Single sign-on (SSO)',
          'A system where one set of credentials, verified by an identity provider, signs a user in to many applications without separate passwords for each.',
          'let employees sign in once and open Microsoft 365 and other cloud apps without separate passwords',
          ['Multifactor authentication', 'A shared team account', 'Password expiration'],
          'ONE login for MANY apps — MFA adds more factors to a login, but it does not reduce how many logins there are.',
          S.steps([('User signs in', 'once'), ('Identity provider', 'issues a token'), ('Apps', 'accept the token')], title='Single sign-on', tones=['plain', 'blue', 'green']),
          caption='SSO lets one verified sign-in work across many apps, reducing passwords to manage.')

    b.add('1.10', 'Version history (cloud storage)',
          'A cloud storage feature that keeps earlier saved versions of a file so a document can be restored to a previous state after accidental edits or overwrites.',
          'restore yesterday\'s version of a document that someone accidentally overwrote in cloud storage',
          ['The local Recycle Bin', 'Disk Cleanup', 'Offline files'],
          'It keeps earlier VERSIONS of the same file — the Recycle Bin only holds files that were deleted.',
          S.steps([('Edit', 'file changes'), ('Saved versions', 'v1, v2, v3 kept'), ('Restore', 'pick the good one')], title='Version history', tones=['plain', 'blue', 'green']),
          caption='Version history keeps earlier copies of a cloud file so a mistake can be rolled back.')

    # ------------------------------------------------------------------------------------------ 1.11 OS types and file systems
    b.add('1.11', 'Server operating system',
          'An OS such as Windows Server or a Linux server distribution, built to host services like Active Directory, DNS, DHCP, and file and print sharing for many users rather than serve one interactive user.',
          'choose an OS to host Active Directory and DHCP for a company',
          ['Windows 11 Pro', 'macOS', 'An embedded OS'],
          'It hosts SERVICES for many clients — workstation operating systems are built around one interactive user.',
          S.compare(('Workstation OS', ['Windows 10/11, macOS, Linux desktop', 'One interactive user', 'Runs apps and productivity']), ('Server OS', ['Windows Server, Linux server', 'Serves many clients', 'AD, DNS, DHCP, file and print']), title='OS roles'),
          caption='Server operating systems host shared services such as AD, DNS, DHCP, and file sharing for many clients.')

    b.add('1.11', 'Embedded operating system',
          'A specialized OS built into a dedicated device, such as an ATM, point-of-sale terminal, smart TV, medical device, or IoT appliance, running one fixed function and often hard to patch.',
          'identify the OS inside a point-of-sale terminal or smart thermostat that does one fixed job',
          ['A server OS', 'A workstation OS', 'A hypervisor'],
          'Built into ONE single-purpose device — and often hard to update, which makes it a security concern.',
          S.hub(('Embedded OS', 'single-purpose firmware'), [('ATM', 'kiosk, terminal'), ('Smart TV', 'appliance'), ('Medical device', 'fixed function'), ('IoT thermostat', 'limited updates')]),
          caption='An embedded OS runs one fixed function inside a dedicated device and is often hard to patch.')

    b.add('1.11', 'ChromeOS (cloud-based OS)',
          'A browser-centric operating system on Chromebooks where most apps and storage live in the cloud, with fast boot, automatic updates, and simple central management.',
          'pick an easy-to-manage laptop OS for a school whose students mostly use web apps',
          ['Windows 11 Enterprise', 'A Linux server distribution', 'macOS'],
          'WEB apps and cloud storage on cheap, auto-updating hardware — it is not a general-purpose desktop OS.',
          S.facts([('Boot', 'seconds, from a read-only OS'), ('Apps', 'web apps and Android apps'), ('Storage', 'mostly cloud, little local'), ('Updates', 'automatic, in the background')], title='ChromeOS at a glance'),
          caption='ChromeOS runs web apps with cloud storage, quick boot, and automatic background updates.')

    b.add('1.11', 'OS end of life (EOL)',
          'The point at which a vendor stops providing security patches and support for an operating system, leaving machines that still run it increasingly exposed to attack.',
          'explain the risk of continuing to run a Windows version that no longer receives security updates',
          ['A beta release', 'A long-term servicing channel', 'A service pack'],
          'No more security PATCHES — the risk grows with every new vulnerability even if the PC still runs fine.',
          S.steps([('Release', 'new version ships'), ('Support', 'patches and fixes'), ('End of life', 'no more patches')], title='Operating system life cycle', tones=['green', 'blue', 'red']),
          caption='After end of life an OS receives no security patches, so each new flaw stays open.')

    b.add('1.11', 'NTFS file system',
          'The default Windows file system, supporting file and folder permissions, encryption (EFS), compression, journaling, very large files and volumes, and disk quotas.',
          'format a Windows system drive so it supports file permissions, encryption, and files larger than 4 GB',
          ['FAT32', 'exFAT', 'ext4'],
          'PERMISSIONS plus encryption plus big files — FAT32 has no permissions and caps a file at 4 GB.',
          S.table(['File system', 'Max file size', 'Permissions', 'Typical use'], [('NTFS', 'huge', 'yes', 'Windows system drives'), ('exFAT', 'huge', 'no', 'flash drives, SD cards'), ('FAT32', '4 GB', 'no', 'old or small media')], title='Windows-friendly file systems', col_widths=[0.2, 0.2, 0.2, 0.4]),
          caption='NTFS adds permissions, encryption, journaling, and huge files; FAT32 and exFAT lack permissions.')

    b.add('1.11', 'exFAT file system',
          'A lightweight file system without FAT32\'s 4 GB file limit that works on both Windows and macOS, making it common for flash drives and SD cards.',
          'format a 128 GB flash drive to hold 6 GB video files and be readable on both Windows and a Mac',
          ['FAT32', 'NTFS', 'APFS'],
          'Big files AND cross-platform — FAT32 caps files at 4 GB, NTFS is read-only on macOS, and APFS is not native on Windows.',
          S.compare(('exFAT', ['Files over 4 GB', 'Windows and macOS', 'No permissions or journaling']), ('FAT32', ['4 GB file limit', 'Works almost everywhere', 'No permissions']), title='exFAT vs FAT32'),
          caption='exFAT removes the 4 GB file limit and works on Windows and macOS, ideal for removable drives.')

    b.add('1.11', 'APFS file system',
          'Apple File System, the default on current Macs and iOS devices, optimized for flash storage with snapshots, native encryption, and space sharing between volumes.',
          'identify the default file system on a current MacBook',
          ['NTFS', 'ext4', 'exFAT'],
          'APFS is Apple\'s modern default — NTFS belongs to Windows and ext4 to Linux.',
          S.facts([('Platform', 'macOS, iOS, iPadOS'), ('Built for', 'flash and SSD storage'), ('Features', 'snapshots, encryption, clones'), ('Replaced', 'HFS+')], title='APFS'),
          caption='APFS is Apple\'s default file system, built for flash storage with snapshots and encryption.')

    b.add('1.11', 'ext4 file system',
          'A journaling file system that is the default on many Linux distributions, supporting large files and volumes and standard Unix permissions.',
          'identify the default file system on many Linux distributions',
          ['APFS', 'NTFS', 'exFAT'],
          'ext4 is the typical LINUX choice — APFS is Apple\'s and NTFS is Windows\'.',
          S.facts([('Platform', 'Linux'), ('Journaling', 'protects against crashes'), ('Permissions', 'Unix owner, group, other'), ('Evolved from', 'ext2 and ext3')], title='ext4'),
          caption='ext4 is the common default Linux file system, with journaling and Unix permissions.')

    # ------------------------------------------------------------------------------------------ 1.12 macOS features
    b.add('1.12', 'Finder',
          'The macOS file manager, comparable to File Explorer: it browses folders, shows the sidebar and tags, shares through AirDrop, and opens Get Info to review or change a file\'s sharing and permissions.',
          'browse folders and change a file\'s sharing permissions through Get Info on a Mac',
          ['Spotlight', 'Mission Control', 'Launchpad'],
          'The file MANAGER — Spotlight is the search tool, and Mission Control arranges windows and desktops.',
          S.hub(('Finder', 'the macOS file manager'), [('Sidebar', 'locations'), ('Tags', 'color labels'), ('Get Info', 'size, access'), ('AirDrop', 'nearby share')]),
          caption='Finder is macOS\'s file manager: browse, tag, share, and review permissions with Get Info.')

    b.add('1.12', 'Spotlight',
          'The macOS system-wide search (Command+Space) that finds files, apps, contacts, and web results, and can perform quick calculations and conversions.',
          'launch an app or find a document by name with a single keyboard shortcut on a Mac',
          ['Finder', 'Launchpad', 'Mission Control'],
          'Command+Space SEARCH — Finder browses folders manually rather than searching everything.',
          S.facts([('Command + Space', 'opens Spotlight'), ('Type', 'app, file, contact, or math'), ('Return', 'open the top result')], title='Using Spotlight'),
          caption='Spotlight is macOS\'s Command+Space search for files, apps, contacts, and quick calculations.')

    b.add('1.12', 'Mission Control and Spaces',
          'A macOS view showing every open window and virtual desktop (Space), opened with a multi-finger swipe up or the Mission Control key, used to switch between desktops and windows.',
          'see every open window at once and switch between several virtual desktops on a Mac',
          ['Spotlight', 'Launchpad', 'Finder'],
          'All windows and virtual DESKTOPS at a glance — Launchpad shows installed apps, not open windows.',
          S.hub(('Mission Control', 'swipe up with three or four fingers'), [('Spaces', 'virtual desktops'), ('Windows', 'all open windows'), ('Full-screen apps', 'own Space')]),
          caption='Mission Control shows all open windows and Spaces (virtual desktops) so you can switch between them.')

    b.add('1.12', 'Keychain (macOS)',
          'The macOS password and certificate store that holds Wi-Fi passwords, website logins, secure notes, and certificates, and can sync through iCloud Keychain.',
          'retrieve a saved Wi-Fi password on a Mac',
          ['Credential Manager', 'FileVault', 'Gatekeeper'],
          'macOS\'s credential store — Windows calls its counterpart Credential Manager.',
          S.hub(('Keychain Access', 'macOS credential store'), [('Wi-Fi passwords', 'saved networks'), ('Website logins', 'Safari and apps'), ('Certificates', 'and secure notes')]),
          caption='Keychain stores Mac passwords, Wi-Fi keys, and certificates, and can sync through iCloud.')

    b.add('1.12', 'iCloud',
          'Apple\'s cloud service that syncs files (iCloud Drive), photos, contacts, calendars, device backups, and Keychain across a user\'s Apple devices, and powers Find My.',
          'keep photos, documents, and device backups synced across a user\'s iPhone, iPad, and Mac',
          ['Time Machine', 'AirDrop', 'OneDrive'],
          'Cloud SYNC across Apple devices — Time Machine is a local backup, and AirDrop is a nearby peer transfer.',
          S.hub(('iCloud', 'syncs across Apple devices'), [('iCloud Drive', 'files'), ('Photos', 'library sync'), ('Backup', 'iPhone and iPad'), ('Keychain', 'passwords'), ('Find My', 'locate and lock'), ('Mail and contacts', 'calendars')]),
          caption='iCloud syncs files, photos, backups, and passwords across a user\'s Apple devices.')

    b.add('1.12', 'Gatekeeper',
          'A macOS security feature that checks downloaded apps for a valid developer signature and notarization before they first run, blocking unidentified or tampered software.',
          'stop users from running unsigned applications downloaded from the Internet',
          ['FileVault', 'Keychain', 'Time Machine'],
          'It decides which apps may RUN (signed and notarized) — FileVault encrypts the disk instead.',
          S.steps([('Download', 'app from Internet'), ('Gatekeeper', 'checks signature'), ('Run or block', 'unidentified is stopped')], title='Gatekeeper check', tones=['plain', 'blue', 'green']),
          caption='Gatekeeper verifies an app\'s signature and notarization before it runs for the first time.')

    b.add('1.12', 'FileVault',
          'macOS full-disk encryption that protects data at rest on the startup disk; the user password or a recovery key (optionally stored in iCloud) unlocks it.',
          'encrypt a laptop\'s startup disk so its data is unreadable if the Mac is stolen',
          ['BitLocker', 'Gatekeeper', 'Time Machine'],
          'It encrypts the disk — BitLocker is the Windows equivalent, and Gatekeeper only checks apps.',
          S.compare(('Windows', ['BitLocker', 'Needs Pro or higher', 'TPM-assisted']), ('macOS', ['FileVault', 'Turn on in Privacy & Security', 'Recovery key or iCloud']), title='Full-disk encryption'),
          caption='FileVault encrypts a Mac\'s startup disk; BitLocker is the Windows equivalent.')

    b.add('1.12', 'Force Quit (Option+Command+Esc)',
          'The macOS Force Quit window, opened with Option+Command+Esc, ends an unresponsive application without restarting the Mac.',
          'close a frozen application on a Mac without restarting the computer',
          ['Task Manager', 'Mission Control', 'Safe Mode'],
          'Option+Command+Esc ends the frozen APP — Task Manager is the Windows tool, and Safe Mode is a restart.',
          S.facts([('Keys', 'Option + Command + Esc'), ('Choose', 'the app that is not responding'), ('Click', 'Force Quit'), ('Windows twin', 'Ctrl + Shift + Esc, End task')], title='Ending a frozen Mac app'),
          caption='Force Quit ends a frozen Mac app with Option+Command+Esc, like End task in Windows.')

    b.add('1.12', 'Activity Monitor',
          'The macOS utility that shows live CPU, memory, energy, disk, and network use per process, equivalent to Windows Task Manager.',
          'see which process is using the most CPU and memory on a Mac',
          ['Disk Utility', 'Force Quit', 'Spotlight'],
          'macOS\'s Task Manager — live per-process CPU, memory, energy, disk, and network use.',
          S.table(['Tab', 'Shows'], [('CPU', 'processes using processor time'), ('Memory', 'pressure and per-app use'), ('Energy', 'battery impact per app'), ('Disk and Network', 'reads, writes, traffic')], title='Activity Monitor tabs', col_widths=[0.3, 0.7]),
          caption='Activity Monitor is the Mac\'s Task Manager, showing per-process CPU, memory, energy, disk, and network.')

    # ------------------------------------------------------------------------------------------ 1.13 Linux
    b.add('1.13', 'cron and crontab',
          'The Linux scheduler for repeating jobs, defined in crontab entries with minute, hour, day-of-month, month, and day-of-week fields followed by the command to run.',
          'run a backup script on a Linux server every night at two in the morning',
          ['systemctl', 'ps', 'Windows Task Scheduler'],
          'cron is the Linux counterpart of Task Scheduler — five time fields then the command.',
          S.terminal(['crontab -e', '0 2 * * *  /opt/scripts/backup.sh', '# min hour day month weekday  command'], title='Terminal'),
          caption='cron runs repeating jobs on Linux from crontab entries with five time fields and a command.')

    b.add('1.13', 'grep',
          'A command that searches text for lines matching a pattern, in files or in piped output; common switches are -i (ignore case), -r (recursive), and -n (show line numbers).',
          'find every line containing the word "error" in a log file from the command line',
          ['cat', 'find', 'ls'],
          'grep searches the CONTENTS of text — find locates files by name, and cat just prints a file.',
          S.terminal(['grep -i error /var/log/syslog', 'Oct  4 02:11 kernel: disk error on sda', 'Oct  4 02:12 app: retry after error'], title='Terminal'),
          caption='grep prints the lines of a file or command output that match a pattern.')

    b.add('1.13', 'find',
          'A command that searches directory trees for files by name, type, size, or modified time, such as find / -name "*.conf".',
          'locate every .conf file under a directory tree on a Linux system',
          ['grep', 'cat', 'ls'],
          'find locates FILES by name, size, or age — grep searches inside them.',
          S.terminal(['find /etc -name "*.conf"', '/etc/resolv.conf', '/etc/ssh/sshd_config'], title='Terminal'),
          caption='find searches directory trees for files by name, type, size, or age.')

    b.add('1.13', 'ps and top',
          'ps lists running processes with their process IDs, while top shows them live ranked by CPU and memory use; kill ends a process by PID.',
          'see which processes are using the most CPU on a Linux server in real time',
          ['ls', 'chmod', 'df'],
          'top is the live view and ps is a snapshot — kill then ends a process by its PID.',
          S.terminal(['top', '  PID USER   %CPU %MEM COMMAND', ' 2210 www      87.0  4.1 php-fpm', ' 1104 mysql    9.2 22.5 mysqld', 'kill 2210'], title='Terminal'),
          caption='top shows live CPU and memory use per process, ps lists them, and kill ends one by PID.')

    b.add('1.13', 'df and du',
          'df reports free and used space for each mounted file system, while du reports how much space files and directories use; -h prints human-readable sizes.',
          'find out why a Linux volume is full by checking usage per file system and per directory',
          ['ls -l', 'chmod', 'ps'],
          'df is per FILE SYSTEM and du is per DIRECTORY — together they show where the space went.',
          S.compare(('df -h', ['Free and used space', 'Per mounted file system', 'Is the volume full?']), ('du -sh *', ['Space used by items', 'Per directory or file', 'What is using it?']), title='Disk space commands'),
          caption='df shows free space per file system and du shows what uses it per directory.')

    b.add('1.13', 'ip addr (and ifconfig)',
          'The ip command shows or configures network interfaces and addresses on Linux (ip addr), replacing the older ifconfig; it is the counterpart of Windows ipconfig.',
          'view a Linux machine\'s IP address and interface state from the command line',
          ['ipconfig', 'traceroute', 'nslookup'],
          'ip addr is the Linux twin of ipconfig — ipconfig itself is the Windows command.',
          S.terminal(['ip addr show eth0', '2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500', '    inet 192.168.1.20/24 brd 192.168.1.255'], title='Terminal'),
          caption='ip addr shows interface addresses on Linux, much as ipconfig does on Windows.')

    b.add('1.13', 'man (manual pages)',
          'The man command displays the built-in manual page for a Linux command, showing its syntax, options, and examples.',
          'read the built-in documentation for an unfamiliar Linux command',
          ['The /? switch', 'grep', 'cat'],
          'man shows the manual page for a command — Windows uses /? for a similar purpose.',
          S.terminal(['man chmod', 'CHMOD(1)           User Commands', 'NAME  chmod - change file mode bits', 'SYNOPSIS  chmod [OPTION]... MODE FILE...'], title='Terminal'),
          caption='man opens the manual page for a Linux command with its syntax and options.')

    b.add('1.13', 'dd',
          'A command that copies data block by block, used to write ISO images to USB drives or clone disks; naming the wrong output device overwrites it without warning.',
          'write an ISO image to a USB drive or clone a disk at the block level on Linux',
          ['cp', 'rsync', 'tar'],
          'Raw BLOCK-level copy (and dangerous) — cp and rsync copy files, not whole disks.',
          S.terminal(['sudo dd if=disk.iso of=/dev/sdb bs=4M', '# if = input, of = output device', '# the wrong of= erases that disk'], title='Terminal'),
          caption='dd copies raw blocks to clone disks or write images, and erases whichever target you name.')

    b.add('1.13', 'Samba',
          'An open-source implementation of the SMB protocol that lets Linux and macOS systems share files and printers with Windows and even act as domain members.',
          'let Windows PCs map a drive to a file share hosted on a Linux server',
          ['SSH', 'FTP', 'cron'],
          'Samba speaks SMB to Windows — SSH gives a secure shell, not drive-mapped shares.',
          S.steps([('Windows PC', 'maps \\\\linux\\share'), ('SMB protocol', 'carried by Samba'), ('Linux server', 'owns the files')], title='Samba file sharing', tones=['blue', 'amber', 'green']),
          caption='Samba lets Linux share files and printers with Windows over SMB.')

    b.add('1.13', 'nano and vi',
          'Terminal text editors: nano is beginner-friendly with its shortcuts shown on screen, while vi or vim is modal (press Esc, then :wq to save and quit).',
          'edit a configuration file over an SSH session with no graphical desktop',
          ['Notepad', 'grep', 'cat'],
          'Both run INSIDE the terminal — Notepad needs a graphical Windows desktop.',
          S.compare(('nano', ['Shortcuts shown on screen', 'Ctrl+O save, Ctrl+X exit', 'Easy for beginners']), ('vi / vim', ['Modal: command and insert', 'i to edit, Esc to stop', ':wq saves and quits']), title='Terminal editors'),
          caption='nano and vi edit text inside a terminal; nano is simpler and vi is modal.')

    b.add('1.13', 'Linux directory layout',
          'Linux organizes everything under a single root (/): configuration files live in /etc, user files in /home, logs in /var/log, and programs in /bin and /usr.',
          'find the system log files and configuration files on a Linux machine',
          ['The Windows Registry', 'The C:\\Users folder', 'The Program Files folder'],
          'One tree under /: /etc is configuration and /var/log is logs — there are no drive letters or a Registry.',
          S.table(['Directory', 'Holds'], [('/etc', 'configuration files'), ('/home', 'user files'), ('/var/log', 'system and app logs'), ('/bin and /usr', 'programs')], title='Linux directory layout', col_widths=[0.3, 0.7]),
          caption='Linux uses one directory tree: /etc for configuration, /home for users, and /var/log for logs.')

    # guide chapters for the new domain-1 material
    b.section('More Windows tools', ['1.2'],
              'Beyond Task Manager and Event Viewer, a handful of consoles show up constantly in support work. Device Manager (devmgmt.msc) lists every device and its driver — a yellow warning icon marks a problem, and the driver tab offers Update, Roll Back, Disable, and Uninstall. Task Scheduler runs programs on a schedule or trigger, Services (services.msc) controls whether and when each background service starts, and Local Users and Groups and Certificate Manager handle local accounts and certificates (the first is missing on Home edition).\n\n'
              'For diagnostics, Performance Monitor logs counters over time to build a baseline, Resource Monitor shows live per-process detail down to files and ports, and System Information (msinfo32) is a read-only inventory including BIOS mode and Secure Boot state. System Configuration (msconfig) is the one that changes boot behavior — Safe boot and the clean-boot technique of hiding Microsoft services and disabling the rest to isolate a conflict. Disk Cleanup frees space by deleting junk, Optimize Drives defragments hard disks but only trims SSDs, and Disk Management can shrink and extend volumes without erasing them.')
    b.section('More command-line tools', ['1.3'],
              'DNS and path problems have their own commands. nslookup tests name resolution, so it explains why pinging a name fails while pinging the IP works, and tracert lists each hop on the path and where it slows or stops. net use maps drive letters to UNC shares such as \\\\server\\share, net user creates, disables, and resets accounts, and gpresult reports which Group Policy settings actually applied (gpupdate /force is what refreshes them).\n\n'
              'format writes a new file system and erases the volume, tasklist and taskkill find and end processes by name or PID, and DISM repairs the Windows component store that sfc depends on — when sfc /scannow cannot fix corruption, run DISM /Online /Cleanup-Image /RestoreHealth and then sfc again. Adding /? to almost any command prints its syntax and switches, and winver shows the edition and build number in a small dialog.')
    b.section('Windows Settings, installation, and upgrades', ['1.4', '1.5'],
              'The Settings app groups options by page: System (display, power, storage, About), Time & language (the clock matters — a drifting time breaks Kerberos and certificate checks), Accessibility (Magnifier, Narrator, Sticky Keys), and Network & Internet, where Network reset reinstalls every adapter as a last step for stubborn connectivity problems.\n\n'
              'For installation, firmware settings and disk layout matter: GPT is needed for disks over 2 TB and for UEFI boot, while MBR tops out at 2 TB and four primary partitions. PXE lets many PCs install over the network, and an answer file (autounattend.xml) makes setup unattended. Reset this PC reinstalls Windows and lets you keep personal files. Windows 11 requires UEFI with Secure Boot and TPM 2.0, which is why capable-looking older PCs sometimes cannot upgrade — so back up, check compatibility, and test before any upgrade.')
    b.section('Windows networking', ['1.7'],
              'A workgroup is peer-to-peer: each PC keeps its own accounts, which is fine for a handful of machines. A domain centralizes accounts and Group Policy on a domain controller, and joining one needs Windows Pro or higher plus working DNS. Mapped drives give a shared folder a drive letter, a metered connection tells Windows to defer big downloads, and a firewall exception opens one program or port through Windows Defender Firewall without turning it off.\n\n'
              'Remote connectivity relies on two different tools that are easy to confuse: a VPN builds an encrypted tunnel into the private network, while a proxy simply relays web requests for filtering or caching. On the IP side, a static address is typed into the adapter\'s IPv4 properties, whereas a 169.254.x.x address means DHCP failed and the PC addressed itself — it can talk only to other local devices.')
    b.section('Control Panel utilities', ['1.8'],
              'The classic Control Panel still hosts many support tools. Internet Options covers security zones, proxy, and privacy for web access; Programs and Features (appwiz.cpl) uninstalls programs and toggles Windows features such as Hyper-V; Power Options sets power plans, lid and button actions, sleep, hibernate, and Fast Startup; and Credential Manager holds saved passwords, where a stale entry is a common cause of repeated account lockouts.\n\n'
              'File Explorer Options reveals hidden files and file extensions — worth turning on to spot disguised names like invoice.pdf.exe. Devices and Printers handles default printers and print queues, Indexing Options rebuilds Windows Search, Network and Sharing Center holds adapter and advanced sharing settings, and the Mail applet manages Outlook profiles and data files.')
    b.section('Applications and cloud productivity', ['1.9', '1.10'],
              'Before installing anything, compare the application\'s system requirements with the machine — operating system and 32/64-bit support, CPU, RAM, storage, and graphics. For many machines, use centralized deployment (Intune, Configuration Manager, or Group Policy) so installs are silent and consistent, and start with a pilot group so compatibility or network problems appear before everyone is affected. Compatibility mode can coax a legacy program into running by emulating an older Windows version.\n\n'
              'Cloud productivity suites such as Microsoft 365 and Google Workspace deliver email, calendars, documents, and storage as hosted services, usually tied to single sign-on so one verified login works across many apps. Version history in cloud storage restores an earlier copy of a file after an accidental overwrite — different from the Recycle Bin, which only holds deleted files.')
    b.section('OS types and file systems', ['1.11'],
              'Operating systems are built for different roles: workstation systems serve one interactive user, server systems host services such as AD, DNS, DHCP, and file and print for many, embedded systems run one fixed function inside a device (and are often hard to patch), and ChromeOS is a browser-centric cloud OS. An end-of-life OS no longer receives security patches, so it is a growing risk even if it still runs.\n\n'
              'File systems follow the platform: NTFS is the Windows standard, with permissions, encryption, and huge files; FAT32 is universally readable but caps files at 4 GB; exFAT removes that limit and works on both Windows and macOS, which makes it the usual choice for flash drives; APFS is the modern macOS default; and ext4 is the common Linux default.')
    b.section('macOS features', ['1.12'],
              'Finder is the file manager and Spotlight (Command+Space) is the system-wide search. Mission Control shows all open windows and Spaces, and Force Quit (Option+Command+Esc) ends a frozen app, while Activity Monitor is the Mac\'s Task Manager with live per-process use.\n\n'
              'Security and sync features have Windows counterparts worth knowing: Keychain stores passwords and certificates (like Credential Manager), FileVault encrypts the startup disk (like BitLocker), and Gatekeeper checks that downloaded apps are signed and notarized before they run. iCloud syncs files, photos, backups, and passwords across Apple devices, while Time Machine remains the local backup.')
    b.section('Linux commands and tools', ['1.13'],
              'Everyday Linux administration is command-line work. grep searches the contents of text, find locates files by name or age, ps and top show processes (with kill to end one), df and du report disk space per file system and per directory, and ip addr shows network addresses much as ipconfig does on Windows. man displays the manual page for any command, and nano or vi edit files inside a terminal.\n\n'
              'cron runs scheduled jobs from crontab entries, dd copies raw blocks (and erases whichever target you name), and Samba lets a Linux server share files with Windows over SMB. Linux uses a single directory tree: /etc holds configuration, /home user files, and /var/log the logs.')
