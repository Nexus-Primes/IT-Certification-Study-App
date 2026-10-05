"""Core 2, domain 1 (Operating Systems): new concepts for the existing objectives 1.1-1.5."""
import svg as S


def build(b):
    b.topics['1.1'] = ['Windows 10/11', 'Home', 'Pro', 'Enterprise', 'Feature differences', '32-bit vs 64-bit']
    b.topics['1.2'] = ['Task Manager', 'MMC', 'Event Viewer', 'Registry', 'Disk Management', 'Task Scheduler', 'Device Manager',
                       'Performance Monitor', 'System Configuration', 'Services']
    b.topics['1.3'] = ['Networking', 'Filesystems', 'Repair', 'Policy', 'File operations', 'DNS and routing', 'Accounts and shares', 'Help switch']
    b.topics['1.4'] = ['Accounts', 'Networking', 'Apps', 'Privacy', 'Updates', 'Time and language', 'Accessibility', 'Network reset']
    b.topics['1.5'] = ['Clean install', 'Upgrade', 'Partitions', 'Drivers', 'Recovery', 'PXE boot', 'GPT', 'Unattended', 'Reset this PC']

    # ------------------------------------------------------------------------------------------ 1.1
    b.add('1.1', '32-bit Windows (4 GB RAM limit)',
          'A 32-bit (x86) edition of Windows can address only about 4 GB of RAM and runs only 32-bit applications, while 64-bit (x64) editions address far more memory and also run most 32-bit apps.',
          'explain why a PC with 8 GB of RAM installed shows only about 3.5 GB usable in Windows',
          ['64-bit Windows', 'A page file that is too small', 'A failing RAM module'],
          'A ceiling near 4 GB is the 32-bit address-space limit — failing RAM would throw errors or vary, and 64-bit Windows would see all 8 GB.',
          S.compare(('32-bit (x86)', ['Up to about 4 GB of RAM', 'Runs 32-bit apps only', 'Installs to Program Files']),
                    ('64-bit (x64)', ['Far more RAM supported', 'Runs 64-bit and most 32-bit', '32-bit apps: Program Files (x86)']),
                    title='Windows architecture'),
          caption='32-bit Windows addresses about 4 GB of RAM; 64-bit adds far more memory and runs 32-bit apps too.')

    # ------------------------------------------------------------------------------------------ 1.2
    b.add('1.2', 'Task Scheduler',
          'A Windows tool (taskschd.msc) that runs programs or scripts automatically on a schedule or in response to triggers such as startup, logon, or a logged event.',
          'run a maintenance script every night at 2 a.m. without anyone being signed in',
          ['Event Viewer', 'Task Manager', 'Performance Monitor'],
          'It runs things on a SCHEDULE or trigger — Task Manager only shows what is running right now.',
          S.steps([('Trigger', 'time, logon, event'), ('Condition', 'idle, on AC power'), ('Action', 'run program/script')],
                  title='Anatomy of a scheduled task', tones=['amber', 'blue', 'green']),
          caption='Task Scheduler runs a program or script when a trigger fires, such as a set time, startup, or logon.')

    b.add('1.2', 'Device Manager',
          'An MMC snap-in (devmgmt.msc) that lists every hardware device and its driver, and lets you update, roll back, disable, or uninstall drivers and spot devices with problems.',
          'roll back a video driver after an update caused display glitches',
          ['Disk Management', 'Services console', 'System Information'],
          'Roll Back Driver sits on the device\'s Driver tab — System Information only REPORTS resources and cannot change a driver.',
          S.facts([('Yellow ! icon', 'Driver missing, or the device has a problem'), ('Down arrow', 'The device is disabled'),
                   ('Update driver', 'Search or browse for a newer driver'), ('Roll Back Driver', 'Return to the previously installed version')],
                  title='Reading Device Manager'),
          caption='Device Manager lists hardware and its drivers so you can update, roll back, disable, or uninstall them.')

    b.add('1.2', 'Certificate Manager (certmgr.msc)',
          'A console for viewing and managing the digital certificates stored for the current user (certmgr.msc) or for the computer (certlm.msc), including trusted root authorities.',
          'check whether an expired personal certificate or an untrusted root authority is behind a certificate warning',
          ['Credential Manager', 'Device Manager', 'Local Security Policy'],
          'CERTIFICATES and trusted root authorities live here — Credential Manager holds saved passwords, not certificates.',
          S.hub(('Certificate Manager', 'certmgr.msc (user), certlm.msc (PC)'),
                [('Personal', 'your own certificates'), ('Trusted Root', 'CAs this PC trusts'), ('Intermediate', 'CAs between root and site')]),
          caption='Certificate Manager shows the certificates a user or computer holds and which authorities it trusts.')

    b.add('1.2', 'Local Users and Groups (lusrmgr.msc)',
          'An MMC snap-in for creating, disabling, and resetting local accounts and managing membership of local groups such as Administrators and Users; it is not available in Home edition.',
          'add a local account to the Administrators group on a Windows Pro workstation',
          ['Active Directory Users and Computers', 'Credential Manager', 'Group Policy Editor'],
          'It manages LOCAL accounts and groups on this PC — Active Directory Users and Computers handles domain accounts, and the snap-in is missing on Home.',
          S.hub(('Local Users and Groups', 'lusrmgr.msc'),
                [('Users', 'create, disable, reset'), ('Groups', 'Administrators, Users'), ('Pro and above', 'missing on Home')]),
          caption='Local Users and Groups manages accounts and group membership on the local machine (Pro and above).')

    b.add('1.2', 'Performance Monitor (perfmon)',
          'A tool that graphs and logs detailed performance counters for CPU, memory, disk, and network over time, including data collector sets used to build a baseline.',
          'log memory and disk counters for a week to build a baseline and spot a slow trend',
          ['Task Manager', 'Resource Monitor', 'Event Viewer'],
          'Counters over TIME with saved logs — Task Manager and Resource Monitor show what is happening right now.',
          S.steps([('Counters', 'CPU, RAM, disk, network'), ('Collector set', 'logs counters over time'), ('Report', 'baseline and trends')],
                  title='Building a performance baseline', tones=['blue', 'primary', 'green']),
          caption='Performance Monitor logs counters over time so you can compare today with a known-good baseline.')

    b.add('1.2', 'Resource Monitor (resmon)',
          'A real-time view of CPU, memory, disk, and network use per process that shows which process holds a file open or listens on a port, a deeper look than Task Manager.',
          'find which process is hammering the disk or holding a locked file open right now',
          ['Performance Monitor', 'Disk Management', 'Event Viewer'],
          'Live and per-process down to files and ports — Performance Monitor is for counters logged over time.',
          S.table(['Tab', 'Shows right now'],
                  [('CPU', 'processes, services, handles'), ('Memory', 'hard faults and in-use RAM'),
                   ('Disk', 'the files each process touches'), ('Network', 'connections and listening ports')],
                  title='Resource Monitor tabs', col_widths=[0.25, 0.75]),
          caption='Resource Monitor shows live per-process CPU, memory, disk, and network activity in detail.')

    b.add('1.2', 'System Information (msinfo32)',
          'A read-only report of hardware resources, components, the software environment, BIOS version and mode, and Secure Boot state — a quick inventory without installing anything.',
          'confirm whether a PC boots in UEFI mode with Secure Boot on and check its BIOS version',
          ['Device Manager', 'System Configuration', 'Disk Management'],
          'A read-only INVENTORY report — System Configuration is the one that changes boot and startup behavior.',
          S.terminal(['msinfo32', 'BIOS Mode            UEFI', 'Secure Boot State    On', 'Processor            x64-based, 8 cores', 'Installed Memory      16 GB'],
                     title='System Information - System Summary'),
          caption='System Information reports hardware, BIOS mode, and Secure Boot state without changing anything.')

    b.add('1.2', 'System Configuration (msconfig)',
          'A utility for choosing the startup mode (normal, diagnostic, selective), boot options such as Safe boot, and which services load, used to isolate a startup problem with a clean boot.',
          'hide Microsoft services and disable the rest to test whether a third-party service causes a startup conflict',
          ['System Information', 'Device Manager', 'Event Viewer'],
          'It changes what loads at BOOT (Safe boot, clean boot) — System Information only reports on the system.',
          S.steps([('Services tab', 'hide MS services'), ('Disable all', 'untick the rest'), ('Restart', 'then test'), ('Re-enable', 'one at a time')],
                  title='Clean boot to isolate a conflict', tones=['blue', 'amber', 'primary', 'green']),
          caption='msconfig sets the boot mode and which services start so you can isolate a startup problem.')

    b.add('1.2', 'Disk Cleanup',
          'A utility that frees space by deleting temporary files, the Recycle Bin contents, thumbnails, downloaded program files, and old Windows update files.',
          'reclaim space on a nearly full system drive by clearing temp files and leftover update files',
          ['Defragment and Optimize Drives', 'chkdsk', 'Disk Management'],
          'It DELETES junk to free space — defragmenting only rearranges data, and chkdsk repairs file system errors.',
          S.compare(('Removes', ['Temporary files', 'Recycle Bin contents', 'Thumbnails and cached data', 'Old Windows update files']),
                    ('Leaves alone', ['Your documents', 'Installed programs', 'The registry', 'Drive health']),
                    title='Disk Cleanup', tones=('green', 'blue')),
          caption='Disk Cleanup frees storage by deleting temporary and leftover system files, not your own documents.')

    b.add('1.2', 'Defragment and Optimize Drives',
          'A utility that rearranges fragmented files on a hard disk drive for faster access and sends TRIM to solid-state drives; HDDs are defragmented, SSDs are only trimmed.',
          'speed up file access on an aging mechanical hard drive whose files are scattered in pieces',
          ['Disk Cleanup', 'chkdsk /r', 'Disk Management'],
          'Defragment HDDs, never SSDs — an SSD only needs TRIM, and Disk Cleanup frees space rather than rearranging it.',
          S.compare(('HDD', ['Defragment (consolidate files)', 'Spinning platters, seek time', 'Scheduled weekly by default']),
                    ('SSD', ['TRIM only (retrim)', 'No moving parts', 'Never defragment']),
                    title='Optimize Drives treats them differently'),
          caption='Optimize Drives defragments hard disks and only runs TRIM on solid-state drives.')

    b.add('1.2', 'Services console (services.msc)',
          'A console that lists background services with their status and startup type (Automatic, Automatic Delayed Start, Manual, Disabled) and lets you start, stop, restart, or reconfigure them.',
          'set a service\'s startup type to Automatic (Delayed Start) so it launches shortly after boot',
          ['Task Manager Startup tab', 'Task Scheduler', 'System Information'],
          'Startup TYPE and recovery actions for services live here — Task Manager\'s Startup tab handles apps, not services.',
          S.facts([('Automatic', 'Starts during boot'), ('Automatic (Delayed)', 'Starts shortly after boot finishes'),
                   ('Manual', 'Starts only when something asks'), ('Disabled', 'Cannot be started')],
                  title='Startup types in services.msc'),
          caption='services.msc controls whether, when, and how each background service starts.')

    b.add('1.2', 'Extend and shrink volume (Disk Management)',
          'Disk Management can shrink a volume to free unallocated space or extend a volume into adjacent unallocated space on the same disk, without erasing the data on the volume.',
          'grow the C: partition into the unallocated space that sits directly after it',
          ['Formatting the volume', 'diskpart clean', 'Disk Cleanup'],
          'Extend needs UNALLOCATED space directly next to the volume, and neither extend nor shrink erases data — formatting does.',
          S.steps([('Shrink or delete', 'the neighboring volume'), ('Unallocated', 'space right after C:'), ('Extend Volume', 'C: grows, data kept')],
                  title='Growing a partition', tones=['amber', 'plain', 'green']),
          caption='Extending a volume uses adjacent unallocated space and keeps the existing data.')

    # ------------------------------------------------------------------------------------------ 1.3
    b.add('1.3', 'nslookup',
          'A command that queries DNS to translate a hostname to an IP address (or the reverse) and shows which DNS server answered.',
          'check whether a website name resolves to an IP address when pinging the name fails but pinging the IP works',
          ['ping', 'tracert', 'netstat'],
          'It tests NAME resolution — ping tests whether a host answers, and tracert shows the hops along the path.',
          S.terminal(['nslookup example.com', 'Server:   router.lan', 'Address:  192.168.1.1', 'Name:     example.com', 'Address:  93.184.216.34'], title='Command Prompt'),
          caption='nslookup asks a DNS server to resolve a name, revealing DNS problems that ping alone cannot.')

    b.add('1.3', 'tracert',
          'A command that traces the route packets take to a destination, listing each router hop and its round-trip time to show where delay or failure occurs.',
          'find which router along the path to a remote site is adding delay or dropping packets',
          ['ping', 'nslookup', 'netstat'],
          'It shows EACH hop along the path — ping only says whether the final destination answered.',
          S.terminal(['tracert example.com', '  1    <1 ms   192.168.1.1', '  2     9 ms   10.20.0.1', '  3     *       Request timed out', '  4    24 ms   example.com'], title='Command Prompt'),
          caption='tracert lists every router hop to a destination with timing, locating where a path slows or breaks.')

    b.add('1.3', 'net use',
          'A command that connects, lists, or disconnects shared network folders and printers, such as mapping a drive letter to a UNC path like \\\\server\\share.',
          'map drive Z: to a department file server share from the command line or a logon script',
          ['net user', 'robocopy', 'ipconfig'],
          'It maps drive letters to UNC SHARES — net user manages accounts instead.',
          S.terminal([r'net use Z: \\fs01\dept /persistent:yes', 'The command completed successfully.', 'net use', r'OK    Z:    \\fs01\dept    Microsoft Windows Network'], title='Command Prompt'),
          caption='net use maps or lists network shares and printers, such as a drive letter pointing at \\\\server\\share.')

    b.add('1.3', 'net user',
          'A command that creates, modifies, enables, disables, and resets passwords for local (or domain) user accounts.',
          'disable a local account or reset its password from an elevated command prompt',
          ['net use', 'gpupdate', 'gpresult'],
          'It manages ACCOUNTS — net use manages network shares and drive mappings.',
          S.terminal(['net user jsmith /active:no', 'The command completed successfully.', 'net user jsmith *', 'Type a password for the user:'], title='Command Prompt (Administrator)'),
          caption='net user creates, disables, or resets accounts straight from the command line.')

    b.add('1.3', 'format',
          'A command that prepares a volume with a file system such as NTFS, FAT32, or exFAT, erasing what was on it; /q performs a quick format, while a full format also checks for bad sectors.',
          'erase a USB drive and prepare it with a new exFAT file system from the command line',
          ['chkdsk', 'sfc', 'robocopy'],
          'It writes a NEW file system and erases data — chkdsk only checks one that already exists.',
          S.compare(('Quick format (/q)', ['Rewrites the file tables', 'Seconds to minutes', 'No bad-sector scan']),
                    ('Full format', ['Scans for bad sectors', 'Much slower', 'Better for suspect drives']),
                    title='format: quick vs full', tones=('amber', 'blue')),
          caption='format writes a new file system and erases the volume; a full format also scans for bad sectors.')

    b.add('1.3', 'gpresult',
          'A command that reports which Group Policy settings actually applied to a user and computer (gpresult /r), used to see why a policy did or did not take effect.',
          'see which GPOs applied to a user\'s session and which were filtered out',
          ['gpupdate /force', 'ipconfig /all', 'net user'],
          'It REPORTS what applied — gpupdate /force just forces a refresh of policy.',
          S.steps([('gpupdate /force', 'pull fresh policy'), ('gpresult /r', 'see what applied'), ('Fix GPO scope', 'if one is missing')],
                  title='Troubleshooting Group Policy', tones=['blue', 'primary', 'amber']),
          caption='gpresult reports the policies applied to a user and computer, to verify what really took effect.')

    b.add('1.3', 'winver',
          'A command that opens a small dialog showing the Windows edition, version, and build number.',
          'quickly display a small dialog with the Windows edition and exact build number',
          ['hostname', 'ipconfig', 'chkdsk'],
          'A tiny dialog with edition and BUILD — hostname only reports the computer\'s name.',
          S.facts([('Edition', 'Windows 11 Pro'), ('Version', '24H2'), ('OS Build', '26100.xxxx')], title='winver shows'),
          caption='winver shows the installed Windows edition, version, and build number.')

    b.add('1.3', 'The /? help switch',
          'Adding /? after most Windows commands prints that command\'s syntax, switches, and examples directly in the prompt (PowerShell uses Get-Help).',
          'look up the available switches for an unfamiliar command without leaving the command prompt',
          ['tasklist', 'systeminfo', 'winver'],
          'Append /? to the command itself — it prints that command\'s own switches and examples.',
          S.terminal(['robocopy /?', 'ROBOCOPY :: Robust File Copy for Windows', 'Usage :: ROBOCOPY source destination [options]', 'Options :: /MIR /Z /R:n /LOG:file'], title='Command Prompt'),
          caption='/? shows a command\'s syntax, switches, and examples right in the prompt.')

    b.add('1.3', 'tasklist and taskkill',
          'tasklist lists running processes with their process IDs, and taskkill ends a process by name or PID, adding /f to force it.',
          'end a frozen process from the command line when Task Manager itself will not respond',
          ['shutdown /r', 'sfc /scannow', 'gpupdate /force'],
          'Process-level control by name or PID — shutdown affects the whole machine.',
          S.terminal([r'tasklist | find "notepad"', 'notepad.exe              4412 Console', 'taskkill /PID 4412 /F', 'SUCCESS: The process has been terminated.'], title='Command Prompt'),
          caption='tasklist finds a process and its ID; taskkill ends it, which helps when Task Manager will not open.')

    b.add('1.3', 'DISM',
          'Deployment Image Servicing and Management repairs the Windows component store (DISM /Online /Cleanup-Image /RestoreHealth) that sfc relies on, and can also service offline images.',
          'repair the Windows image when sfc /scannow reports corruption it cannot fix',
          ['chkdsk /f', 'diskpart', 'robocopy'],
          'It repairs the component STORE that sfc draws from — run DISM when sfc cannot repair, then run sfc again.',
          S.steps([('DISM', '/RestoreHealth'), ('sfc', '/scannow'), ('Restart', 'then retest')], title='When sfc cannot repair files', tones=['amber', 'blue', 'green']),
          caption='DISM repairs the Windows image that sfc depends on, so it is the fix when sfc cannot repair files.')

    b.add('1.3', 'dir, cd, md, and rd',
          'Basic file system navigation commands: dir lists a folder, cd changes the current directory, md (mkdir) creates a folder, and rd (rmdir) removes one, with /s deleting its contents.',
          'list a folder, move into another one, and create a new directory from the command prompt',
          ['robocopy', 'xcopy', 'diskpart'],
          'dir/cd/md/rd NAVIGATE and make or remove folders — robocopy and xcopy copy data between them.',
          S.terminal([r'cd C:\Users\Public', 'dir', 'md Reports', 'rd /s /q Reports'], title='Command Prompt'),
          caption='dir, cd, md, and rd list, change, create, and remove folders from the command line.')

    # ------------------------------------------------------------------------------------------ 1.4
    b.add('1.4', 'Settings: System (display, power, storage)',
          'The System page of the Settings app holds display resolution and scaling, sound, notifications, power and battery options, Storage Sense, and the About page that shows the edition and specs.',
          'turn on Storage Sense to clear temporary files automatically and check what is using the disk',
          ['Network & Internet', 'Accounts', 'Privacy & security'],
          'Display, power, STORAGE, and About live under System — network, account, and privacy options each have their own page.',
          S.facts([('Display', 'resolution and scaling'), ('Power & battery', 'sleep, battery saver'), ('Storage', 'Storage Sense, cleanup'), ('About', 'edition, version, specs')],
                  title='Settings > System'),
          caption='Settings > System covers display, power, storage, and the About page with the edition and specs.')

    b.add('1.4', 'Time and language settings',
          'Settings that control the time zone, automatic time sync, region formats, display language, and keyboard layouts; a wrong clock or zone can break certificate validation and Kerberos sign-in.',
          'fix a laptop whose clock is an hour off and is causing certificate and sign-in errors',
          ['Accounts', 'Privacy & security', 'Apps'],
          'TIME sync, zone, language, and region — a drifting clock also breaks Kerberos tickets and certificate checks.',
          S.facts([('Date & time', 'automatic time and time zone'), ('Language', 'display language packs'), ('Region', 'number and date formats'), ('Typing', 'keyboard layouts')],
                  title='Settings > Time & language'),
          caption='Time & language sets the clock, zone, display language, and region; wrong time breaks sign-in and certificates.')

    b.add('1.4', 'Accessibility settings',
          'Options such as Magnifier, Narrator, high contrast, color filters, captions, Sticky Keys, and pointer size that make Windows usable for people with vision, hearing, or motor needs.',
          'enable Sticky Keys and a larger mouse pointer for a user with limited dexterity',
          ['Personalization', 'Devices', 'System'],
          'Vision, hearing, and interaction aids live under Accessibility — Personalization only changes how things look.',
          S.hub(('Accessibility', 'Settings'),
                [('Vision', 'Magnifier, Narrator'), ('Hearing', 'captions, mono audio'), ('Interaction', 'Sticky Keys, speech')]),
          caption='Accessibility settings add vision, hearing, and interaction aids such as Magnifier and Sticky Keys.')

    b.add('1.4', 'Network reset',
          'A Settings option that removes and reinstalls all network adapters and resets networking components to defaults; VPN clients and virtual switches then have to be set up again.',
          'return all network adapters to their defaults after repeated, unexplained connectivity problems',
          ['ipconfig /renew', 'Forgetting a single Wi-Fi network', 'Disabling IPv6'],
          'It resets EVERY adapter and networking component at once — renewing a lease or forgetting one network is far narrower.',
          S.steps([('Settings', 'Network & Internet'), ('Advanced', 'Network reset'), ('Restart', 'adapters reinstall')], title='Network reset', tones=['blue', 'amber', 'green']),
          caption='Network reset reinstalls adapters and restores networking defaults, a last step for stubborn connectivity problems.')

    # ------------------------------------------------------------------------------------------ 1.5
    b.add('1.5', 'PXE network boot',
          'A firmware feature (Preboot Execution Environment) that boots a computer from an image on a network server, commonly used to deploy Windows to many machines without physical media.',
          'deploy Windows to dozens of bare-metal PCs from a server without handing out USB drives',
          ['USB flash drive install', 'Optical disc install', 'Internal recovery partition'],
          'It boots over the NETWORK using the NIC — USB and disc installs need physical media at every machine.',
          S.steps([('NIC', 'PXE boot request'), ('DHCP + TFTP', 'gives boot image'), ('WinPE', 'loads on client'), ('Setup', 'installs Windows')],
                  title='PXE deployment', tones=['plain', 'blue', 'amber', 'green']),
          caption='PXE boots a PC from a network server so Windows can be installed with no local media.')

    b.add('1.5', 'GPT partition style',
          'The GUID Partition Table supports disks larger than 2 TB and up to 128 partitions with redundant headers, and is required for UEFI boot, whereas MBR is limited to 2 TB and four primary partitions.',
          'initialize a 4 TB drive so that all of its capacity is usable',
          ['MBR partition style', 'Dynamic disk', 'Extended partition'],
          'GPT for disks over 2 TB and UEFI/Secure Boot — MBR tops out at 2 TB and four primary partitions.',
          S.compare(('MBR', ['Disks up to 2 TB', 'Four primary partitions', 'Legacy BIOS boot']), ('GPT', ['Disks beyond 2 TB', 'Up to 128 partitions', 'UEFI and Secure Boot']),
                    title='Partition styles'),
          caption='GPT supports disks over 2 TB, many partitions, and UEFI boot; MBR stops at 2 TB and four primary partitions.')

    b.add('1.5', 'Unattended installation (answer file)',
          'A Windows setup driven by an answer file such as autounattend.xml that supplies the product key, partitions, account, and settings so installation needs no keyboard input.',
          'install Windows on many PCs with identical settings without answering any setup prompts',
          ['Manual clean install', 'In-place upgrade', 'System Restore'],
          'An ANSWER FILE feeds every setup prompt — image-based deployment instead copies a system that is already built.',
          S.steps([('Boot media', '+ autounattend.xml'), ('Setup reads', 'the answer file'), ('Configured', 'no prompts needed')], title='Unattended install', tones=['plain', 'blue', 'green']),
          caption='An answer file lets Windows setup run with no prompts, using preset keys, partitions, and settings.')

    b.add('1.5', 'Reset this PC',
          'A Windows recovery option that reinstalls Windows without install media, letting you Keep my files or Remove everything, and optionally download a fresh copy from the cloud.',
          'return a corrupted laptop to a clean Windows install while keeping the user\'s personal documents',
          ['System Restore', 'Startup Repair', 'Clean install from USB media'],
          'A reinstall with the choice to KEEP files — System Restore only rolls back system files and settings, and never reinstalls Windows.',
          S.flow_split(('Reset this PC',), [('Keep my files', 'apps and settings removed'), ('Remove everything', 'full wipe'), ('Cloud download', 'fetches a fresh copy')]),
          caption='Reset this PC reinstalls Windows and lets you keep personal files or remove everything.')

    b.add('1.5', 'Windows 11 hardware requirements',
          'Windows 11 needs a compatible 64-bit processor, 4 GB of RAM, 64 GB of storage, UEFI firmware with Secure Boot, and TPM 2.0; the TPM and Secure Boot requirements are the usual reason an older PC cannot upgrade.',
          'explain why a five-year-old PC that meets the RAM and disk minimums still cannot upgrade to Windows 11',
          ['A missing Windows Pro license', 'A 32-bit processor architecture', 'Insufficient virtual memory'],
          'Look for TPM 2.0 and Secure Boot — a PC with enough RAM and disk can still fail on the security hardware.',
          S.table(['Requirement', 'Windows 11 minimum'],
                  [('Processor', '64-bit, 2+ cores, 1 GHz or faster'), ('RAM / storage', '4 GB / 64 GB'), ('Firmware', 'UEFI with Secure Boot'), ('Security chip', 'TPM 2.0')],
                  title='Windows 11 minimums', col_widths=[0.38, 0.62]),
          caption='Windows 11 requires UEFI with Secure Boot and TPM 2.0 in addition to RAM, storage, and a 64-bit CPU.')

    b.add('1.5', 'Pre-upgrade compatibility check',
          'Before upgrading, back up data, confirm hardware, driver, and application compatibility (for example with PC Health Check), and test critical apps so the upgrade does not cause data loss or broken software.',
          'reduce the risk of data loss and broken applications before upgrading a department\'s PCs to a new Windows version',
          ['Formatting the system drive first', 'Upgrading every PC at once', 'Installing drivers only after the upgrade'],
          'BACK UP, check compatibility, and test first — skipping the check is what turns an upgrade into an outage.',
          S.steps([('Back up', 'files and image'), ('Check', 'hardware, drivers'), ('Test', 'key apps'), ('Upgrade', 'pilot group first')],
                  title='Before upgrading', tones=['amber', 'blue', 'violet', 'green']),
          caption='Back up, verify hardware, driver, and app compatibility, and test before upgrading.')
