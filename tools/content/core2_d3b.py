"""Core 2, domain 3 (Software Troubleshooting): a second batch, because the domain is 23% of the exam but had the thinnest coverage."""
import svg as S


def build(b):
    b.topics['3.1'] = ['Boot', 'Performance', 'Applications', 'Services', 'Profiles', 'Recovery tools', 'Connectivity', 'Printing', 'Stability']
    b.topics['3.2'] = ['Pop-ups', 'Redirects', 'Fake alerts', 'Certificates', 'Unauthorized access', 'Hosts file', 'Disabled antivirus', 'Lockouts', 'Unusual traffic']
    b.topics['3.3'] = ['Crashes', 'Battery drain', 'Storage', 'Connectivity', 'Updates', 'Reboots', 'Factory reset', 'Install failures', 'Overheating']

    # ------------------------------------------------------------------------------------------ 3.1
    b.add('3.1', 'Startup Repair and the Automatic Repair loop',
          'After repeated boot failures Windows starts Automatic Repair in the recovery environment; Startup Repair fixes missing or damaged boot files, and if it keeps looping, the other WinRE tools help: uninstall the latest update, System Restore, or the command prompt (bootrec, offline sfc).',
          'get a PC that keeps cycling through "Preparing Automatic Repair" back into Windows',
          ['Safe Mode', 'Disk Cleanup', 'Resetting the BIOS clock'],
          'Work through the WinRE toolbox in order — Startup Repair, uninstall the latest update, System Restore, then command-line repair.',
          S.steps([('Startup Repair', 'fixes boot files'), ('Uninstall updates', 'remove the latest one'), ('System Restore', 'or command-line repair')], title='When Automatic Repair loops', tones=['blue', 'amber', 'green']),
          caption='Startup Repair fixes boot files; if Automatic Repair loops, use the other recovery-environment tools.')

    b.add('3.1', 'Stuck print queue (spooler reset)',
          'A print job that will not print or delete can block the whole queue; stop the Print Spooler service, delete the files in the spool folder, and start the service again.',
          'clear a print queue in which one job will not delete and nothing else prints',
          ['Reinstalling the printer driver', 'Replacing the toner', 'Changing the default printer'],
          'Stop the SPOOLER, clear its folder, start it again — a software jam does not need new hardware.',
          S.terminal(['net stop spooler', r'del /Q C:\Windows\System32\spool\PRINTERS\*', 'net start spooler'], title='Command Prompt (Administrator)'),
          caption='Stopping the spooler and clearing its folder removes a job that is blocking the queue.')

    b.add('3.1', 'High CPU, memory, or disk usage triage',
          'Task Manager shows which process is using CPU, memory, or disk; sort by the busy column, decide whether it is expected (updates, indexing, a scan) or suspicious, then end it, disable it at startup, or fix the cause.',
          'find what is making a PC crawl with the disk at 100% for no obvious reason',
          ['Defragmenting an SSD', 'Reinstalling the printer', 'Replacing the monitor'],
          'Sort by the busy column first — most slowdowns are one process, not failing hardware.',
          S.steps([('Task Manager', 'sort CPU, disk, RAM'), ('Identify', 'expected or suspicious?'), ('Act', 'stop, disable, or scan')], title='Performance triage', tones=['plain', 'blue', 'green']),
          caption='Find the process behind high resource use in Task Manager, then stop, disable, or scan it.')

    b.add('3.1', 'Reliability Monitor',
          'A Windows tool (perfmon /rel) that plots a stability index over time with markers for application failures, Windows failures, and installs, making it easy to see when instability began.',
          'see a timeline of crashes and failed updates to work out when a PC started becoming unstable',
          ['Task Manager', 'Disk Cleanup', 'System Information'],
          'A stability TIMELINE (perfmon /rel) — friendlier than raw Event Viewer logs for spotting when trouble began.',
          S.facts([('Stability index', 'a score of 1 to 10 over time'), ('Red X', 'critical failure or crash'), ('Yellow !', 'warning events'), ('Information', 'installs and updates')], title='Reading Reliability Monitor'),
          caption='Reliability Monitor charts crashes and installs over time so you can see when instability began.')

    b.add('3.1', 'INACCESSIBLE_BOOT_DEVICE stop code',
          'A blue screen at boot meaning Windows cannot reach its boot volume, often after a storage controller mode change (AHCI or RAID), a failed update, or a failing drive; revert the firmware setting, repair boot files, or check the drive.',
          'diagnose a blue screen at boot that began right after someone changed the SATA mode in firmware',
          ['A stuck service', 'A corrupted user profile', 'A low memory warning'],
          'The boot drive is unreachable by the driver — undo the AHCI or RAID mode change first.',
          S.steps([('Firmware change', 'SATA mode switched'), ('Windows boots', 'wrong storage driver'), ('Stop code', 'revert, repair boot')], title='Inaccessible boot device', tones=['amber', 'plain', 'red']),
          caption='INACCESSIBLE_BOOT_DEVICE often follows a storage mode change or boot damage; revert or repair.')

    # ------------------------------------------------------------------------------------------ 3.2
    b.add('3.2', 'Unauthorized file and permission changes',
          'Files that are renamed, moved, or deleted, or permissions that change, without anyone doing it can indicate malware, ransomware, or unauthorized access; check logs, isolate the system, and restore from a clean backup.',
          'investigate shared folders where files were renamed and permissions altered overnight with no change ticket',
          ['A scheduled defragmentation', 'A normal Windows Update', 'A full backup running'],
          'Changes with no ticket and no owner are an indicator of compromise — isolate before restoring.',
          S.steps([('Unexpected change', 'files, ACLs, names'), ('Check the logs', 'who and when'), ('Isolate, restore', 'from a clean backup')], title='Unexplained changes', tones=['amber', 'blue', 'green']),
          caption='Unexplained file or permission changes suggest compromise; investigate, isolate, then restore.')

    b.add('3.2', 'Unusual outbound network traffic',
          'A computer sending large or constant traffic to unknown destinations, especially off-hours, can indicate malware, a botnet, or data theft; verify the connections with netstat or a monitor, then isolate and scan it.',
          'explain why a workstation sends gigabytes of data to an unknown foreign address in the middle of the night',
          ['A scheduled Windows Update', 'A normal DHCP renewal', 'A print job'],
          'Check the destinations with netstat — constant unexplained traffic off-hours is exfiltration or a botnet until proven otherwise.',
          S.terminal(['netstat -ano', 'TCP 192.168.1.40:51022  203.0.113.9:443 ESTAB 4120', 'TCP 192.168.1.40:51023  203.0.113.9:443 ESTAB 4120'], title='Command Prompt'),
          caption='Constant traffic to unknown hosts, especially off-hours, can mean malware or data theft.')

    b.add('3.2', 'Potentially unwanted program (PUP)',
          'Software bundled with a legitimate installer that adds toolbars, adware, or trackers the user did not intend; remove it in Programs and Features, run an antimalware scan, and use Custom installs to decline extras.',
          'explain how a browser got a new toolbar and a changed search engine after a free PDF tool was installed',
          ['A zero-day exploit', 'A boot sector virus', 'A worm'],
          'It was BUNDLED with a wanted installer — choose Custom installs and uncheck the extras.',
          S.steps([('Free installer', 'the wanted app'), ('Bundled extras', 'toolbar, adware'), ('Cleanup', 'uninstall and scan')], title='Potentially unwanted programs', tones=['plain', 'amber', 'green']),
          caption='PUPs ride along with wanted installers and add toolbars or adware; uninstall and scan.')

    b.add('3.2', 'Unexplained lockouts and reset notices',
          'Repeated account lockouts, or password-reset emails the user did not request, suggest someone is guessing or testing credentials; review sign-in logs, reset passwords, and enforce MFA.',
          'explain why several users were locked out overnight and received password-reset emails they never requested',
          ['A DHCP failure', 'A cleared browser cache', 'A metered connection'],
          'Someone is TRYING the accounts — check the logs, add MFA, and watch for a later successful sign-in.',
          S.steps([('Many failed sign-ins', 'from one source'), ('Lockouts and resets', 'users notice'), ('Respond', 'block, MFA, review logs')], title='Credential attack signs', tones=['red', 'amber', 'green']),
          caption='Unexpected lockouts and reset emails are signs that someone is attacking the accounts.')

    # ------------------------------------------------------------------------------------------ 3.3
    b.add('3.3', 'Mobile app install or update failure',
          'App installs and updates fail when storage is full, the OS is too old, the store account has a problem, or the store cache is corrupt; free space, update the OS, check the account, and clear the store\'s cache.',
          'fix an app that will not update and shows an error even though Wi-Fi works',
          ['A rotation lock', 'A failing battery', 'A Bluetooth pairing problem'],
          'Check STORAGE, OS version, and the store account — not just the network.',
          S.steps([('Storage', 'free up space'), ('OS version', 'meets the requirement'), ('Store cache', 'clear and retry')], title='App will not update', tones=['blue', 'plain', 'green']),
          caption='Failed installs usually come from low storage, an old OS, or a store account or cache problem.')

    b.add('3.3', 'Sluggish mobile performance',
          'A slow, laggy phone is usually low storage, too many background apps, an out-of-date OS, or an aging battery throttling the processor; restart, close apps, free space, update, and check battery health.',
          'speed up a phone that lags and runs warm after months of use',
          ['A rotation lock', 'A Bluetooth pairing problem', 'A SIM card change'],
          'Free STORAGE, restart, and update before resorting to a factory reset.',
          S.facts([('Storage', 'free space below ~10% slows it'), ('Background apps', 'close or restrict them'), ('Updates', 'install OS and app updates'), ('Battery', 'a worn one can throttle speed')], title='Sluggish phone checklist'),
          caption='Low storage, background apps, an old OS, and a worn battery are the usual causes of a slow phone.')

    b.add('3.3', 'Mobile overheating and swollen battery',
          'A very hot device may be caused by heavy use while charging, direct sun, a runaway app, or a failing battery; a bulging battery is a safety hazard, so stop using and charging the device and have the battery replaced.',
          'respond to a tablet that gets very hot and whose back cover is starting to bulge',
          ['Clearing the app cache', 'Disabling Bluetooth', 'Turning on auto-rotate'],
          'A bulging battery is a SAFETY problem — stop charging it and replace it, do not just tweak settings.',
          S.steps([('Hot device', 'stop heavy use'), ('Check the battery', 'swelling is a hazard'), ('Replace it', 'do not charge or puncture')], title='Overheating', tones=['amber', 'red', 'green']),
          caption='A hot device with a bulging battery is a safety hazard that needs a replacement battery.')

    # ------------------------------------------------------------------------------------------ 3.5
    b.add('3.5', 'Unexpected app behavior and unknown installs',
          'Apps that open or close on their own, unknown apps appearing, or calls and texts the user did not send are signs of malware or a compromised account; review installed apps and permissions, scan, and reset if it returns.',
          'investigate a phone that is sending text messages its owner never wrote and shows apps nobody installed',
          ['A weak cellular signal', 'A full battery', 'A rotation lock'],
          'Actions the user did not take point to malware — check recent installs and permissions first.',
          S.steps([('Unknown apps', 'or messages sent'), ('Review', 'installs and permissions'), ('Remove and scan', 'reset if it returns')], title='Unexplained mobile behavior', tones=['red', 'blue', 'green']),
          caption='Unknown apps or messages the owner did not send point to malware on a mobile device.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Boot repair, printing, and performance triage', ['3.1'],
              'When Windows will not start, work through the recovery environment in order: Startup Repair for damaged boot files, then uninstall the latest update, System Restore, and command-line repair (bootrec, offline sfc). The INACCESSIBLE_BOOT_DEVICE stop code often follows a SATA mode change (AHCI or RAID) in firmware, so revert that setting first.\n\n'
              'For a slow or unstable PC, sort Task Manager by the busy column to find the process behind high CPU, memory, or disk use, and use Reliability Monitor (perfmon /rel) to see when crashes and failed updates began. A stuck print queue is fixed by stopping the Print Spooler, clearing its spool folder, and starting it again — no new hardware needed.')
    b.section('Compromise indicators on a PC', ['3.2'],
              'Several symptoms point to compromise even when no alert appears: files renamed or permissions changed with no ticket, constant unexplained outbound traffic (check destinations with netstat), repeated lockouts or password-reset emails nobody requested, and unwanted toolbars that came bundled with a free installer (a potentially unwanted program).\n\n'
              'Respond in order: isolate the machine, look at logs, remove or reset the cause, and restore from a clean backup if files were changed. Add MFA where credentials were being tested.')
    b.section('Mobile performance, installs, and heat', ['3.3', '3.5'],
              'A sluggish phone is usually low storage, background apps, an old OS, or a worn battery, so free space, restart, and update before a reset. Failed installs or updates come from low storage, an old OS, or a store account or cache problem, not only from the network.\n\n'
              'A hot device with a bulging battery is a safety hazard: stop using and charging it and replace the battery. Apps that open on their own, unknown apps, or messages the owner never sent suggest malware, so review recent installs and permissions, scan, and reset if the behavior returns.')
