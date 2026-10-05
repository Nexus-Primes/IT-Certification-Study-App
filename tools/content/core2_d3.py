"""Core 2, domain 3 (Software Troubleshooting): new concepts for 3.1-3.3 and the new objective 3.5."""
import svg as S


def build(b):
    b.topics['3.1'] = ['Boot', 'Performance', 'Applications', 'Services', 'Profiles', 'Recovery tools', 'Connectivity']
    b.topics['3.2'] = ['Pop-ups', 'Redirects', 'Fake alerts', 'Certificates', 'Unauthorized access', 'Hosts file', 'Disabled antivirus']
    b.topics['3.3'] = ['Crashes', 'Battery drain', 'Storage', 'Connectivity', 'Updates', 'Reboots', 'Factory reset']
    b.objective('3.5', 'Mobile security issues', ['Ads and fake warnings', 'Spoofed apps', 'Developer mode', 'App permissions', 'Leaked data'])

    # ------------------------------------------------------------------------------------------ 3.1
    b.add('3.1', 'Black screen after sign-in',
          'A desktop that shows only a black screen and a pointer after sign-in usually means the Explorer shell failed to start or a display driver problem; running explorer.exe from Task Manager, or updating or rolling back the display driver, restores it.',
          'restore a desktop that shows only a black screen with a mouse pointer after the user signs in',
          ['Replacing the power supply', 'Resetting the BIOS', 'Reinstalling Windows'],
          'A pointer means Windows is RUNNING — try Task Manager > Run new task > explorer.exe before heavier fixes.',
          S.steps([('Ctrl+Shift+Esc', 'opens Task Manager'), ('Run new task', 'type explorer.exe'), ('Desktop returns', 'else fix the driver')], title='Black screen with a pointer', tones=['plain', 'blue', 'green']),
          caption='A black screen with a pointer means Windows runs; restart explorer.exe or fix the display driver.')

    b.add('3.1', 'bootrec (boot record repair)',
          'A Windows Recovery Environment command that repairs boot records: /fixmbr, /fixboot, /scanos, and /rebuildbcd rebuild the master boot record, boot sector, and Boot Configuration Data.',
          'repair a PC that reports "Operating system not found" after its boot configuration was damaged',
          ['sfc /scannow', 'chkdsk /f', 'gpupdate /force'],
          'bootrec REBUILDS the boot records — sfc repairs system files, which only matters once Windows can boot.',
          S.terminal(['bootrec /fixmbr', 'bootrec /fixboot', 'bootrec /scanos', 'bootrec /rebuildbcd'], title='Recovery Command Prompt'),
          caption='bootrec rebuilds the master boot record, boot sector, and BCD from the recovery environment.')

    b.add('3.1', 'Low memory warning',
          'Windows warns that it is low on memory when RAM and the page file are nearly exhausted; closing apps, finding a memory leak in Task Manager, enlarging the page file, or adding RAM resolves it.',
          'resolve repeated "Your computer is low on memory" messages on a 4 GB PC running many apps',
          ['A corrupted user profile', 'A failing CMOS battery', 'Time drift'],
          'RAM and the page file are exhausted — add RAM, close apps, or find the leaking process in Task Manager.',
          S.steps([('Warning', 'low on memory'), ('Task Manager', 'find the hungry app'), ('Fix', 'close it, add RAM')], title='Low memory', tones=['amber', 'blue', 'green']),
          caption='A low memory warning means RAM and the page file are nearly full; close apps, fix leaks, or add RAM.')

    b.add('3.1', 'USB controller resource warning',
          'A message that a USB controller has run out of resources appears when too many devices share one controller, often through hubs; spreading devices across ports, using a powered hub, or updating drivers fixes it.',
          'resolve a "not enough USB controller resources" message after plugging many devices into one hub',
          ['A BSOD stop code', 'Time drift', 'A stuck print spooler'],
          'Too many devices for one CONTROLLER — spread them across ports or use a powered hub on a different controller.',
          S.steps([('Many devices', 'all on one hub'), ('Warning', 'controller out of resources'), ('Fix', 'spread them, update drivers')], title='USB resource warning', tones=['plain', 'amber', 'green']),
          caption='Too many devices on one USB controller trigger a resource warning; spread them out.')

    b.add('3.1', 'System time drift',
          'When a PC\'s clock keeps resetting or drifting, the usual causes are a dead CMOS battery or failed time sync; the wrong time breaks certificate validation and Kerberos sign-in, so replace the battery and resync the clock.',
          'explain why a PC\'s clock resets after power-off and why certificates and domain sign-in then fail',
          ['A corrupted user profile', 'Low memory', 'A stuck service'],
          'A dead CMOS battery loses the clock while the PC is off — and a wrong time breaks certificates and Kerberos.',
          S.steps([('CMOS battery', 'dies'), ('Clock resets', 'wrong date at boot'), ('Errors', 'certificates, domain logon')], title='Time drift', tones=['red', 'amber', 'plain']),
          caption='A failing CMOS battery or broken time sync makes the clock drift and breaks certificate and domain checks.')

    b.add('3.1', 'Limited connectivity (no Internet)',
          'A PC showing a link but "limited" or no Internet often has a failed DHCP lease (a 169.254.x.x address), a bad gateway or DNS setting, or a driver problem; check the link, run ipconfig /all, then renew the lease and flush DNS.',
          'diagnose a PC with a working link light that has a 169.254.x.x address and no Internet',
          ['A stopped print spooler', 'A low-memory condition', 'A corrupted user profile'],
          'A 169.254 address means DHCP FAILED — a valid address with failing names points to DNS instead.',
          S.steps([('Check the link', 'cable, Wi-Fi, switch'), ('ipconfig /all', 'address, gateway, DNS'), ('Renew and flush', '/release /renew /flushdns')], title='Limited connectivity', tones=['plain', 'blue', 'green']),
          caption='Limited connectivity is diagnosed by checking the link, the IP settings, and then renewing and flushing.')

    b.add('3.1', 'Slow profile load',
          'A long sign-in on a PC is often caused by a large or roaming profile copied across the network, many startup items, or slow Group Policy processing; folder redirection, trimming the profile, or rebuilding it helps.',
          'reduce a three-minute sign-in on a PC that downloads a huge roaming profile every time',
          ['A failing GPU', 'A corrupted BIOS', 'Time drift'],
          'Profile SIZE and the network pull cause it — redirect folders instead of roaming them.',
          S.steps([('Sign in', 'profile is copied down'), ('Large profile', 'over the network'), ('Fix', 'redirect folders, trim')], title='Slow sign-in', tones=['plain', 'amber', 'green']),
          caption='A large roaming profile or heavy startup load makes sign-in slow; redirect folders and trim the profile.')

    b.add('3.1', 'Safe Mode',
          'A Windows startup mode that loads only minimal drivers and services (Shift+Restart > Startup Settings, or msconfig), used to isolate driver and software problems and to remove a bad update or malware.',
          'start Windows with only essential drivers so a faulty driver causing a boot crash can be removed',
          ['Hibernate', 'Compatibility mode', 'Fast Startup'],
          'Minimal drivers and services — a clean boot is for service conflicts while Windows runs normally.',
          S.compare(('Safe Mode', ['Minimal drivers load', 'Basic display driver', 'No third-party startup items']), ('Normal mode', ['All drivers load', 'Full resolution', 'All startup items run']), title='Safe Mode vs normal', tones=('amber', 'blue')),
          caption='Safe Mode loads minimal drivers and services so you can isolate and remove what is causing a problem.')

    b.add('3.1', 'System Restore',
          'Rolls system files, drivers, and registry settings back to an earlier restore point without touching personal files; it is not a backup of documents.',
          'undo a recent driver install that made the system unstable without losing any documents',
          ['Reset this PC', 'Restoring a file backup', 'Disk Cleanup'],
          'It rolls back SYSTEM state to a restore point — it is not a backup of your files.',
          S.steps([('Restore point', 'made before the change'), ('System Restore', 'drivers, files, registry'), ('Rolled back', 'documents untouched')], title='System Restore', tones=['plain', 'blue', 'green']),
          caption='System Restore returns system files and settings to an earlier point while leaving documents alone.')

    # ------------------------------------------------------------------------------------------ 3.2
    b.add('3.2', 'Antivirus disabled or unable to update',
          'Malware commonly turns off antivirus or blocks its updates; a protection service that will not start, repeated "turned off" alerts, or a failing update are signs of infection.',
          'interpret a PC whose antivirus switched itself off and cannot download updates',
          ['A corrupted user profile', 'A failing hard drive', 'A metered connection'],
          'Malware attacks the defenses FIRST — treat a disabled antivirus as a symptom, not just a setting.',
          S.steps([('Infection', 'gets a foothold'), ('Defenses off', 'AV off, no updates'), ('Respond', 'isolate, boot-time scan')], title='When protection is tampered with', tones=['red', 'amber', 'green']),
          caption='Antivirus that turns off or cannot update is a common sign of malware interference.')

    b.add('3.2', 'Windows Update failure',
          'Updates that repeatedly fail or never install can come from corrupted update components, low disk space, a wrong clock, or malware; run the Windows Update troubleshooter, then DISM and sfc, then reset the update components.',
          'fix a PC that cannot install updates and shows an error code after repeated attempts',
          ['A metered connection', 'Time drift', 'A low memory warning'],
          'Try the update TROUBLESHOOTER first, then DISM and sfc, then reset the update components.',
          S.steps([('Troubleshooter', 'built-in fix-it'), ('DISM and sfc', 'repair system files'), ('Reset components', 'clear update cache')], title='Fixing failed updates', tones=['blue', 'amber', 'green']),
          caption='Failed updates are fixed by the troubleshooter, DISM and sfc, and finally resetting update components.')

    b.add('3.2', 'Compromised email account',
          'When contacts receive spam from a user, or sent items show messages the user never wrote, the mailbox is compromised; change the password, enable MFA, sign out all sessions, and check for forwarding rules and delegates.',
          'respond to coworkers reporting spam sent from a user\'s mailbox that appears in the user\'s own sent items',
          ['A spoofed sender address only', 'A DDoS attack', 'A browser cache problem'],
          'Messages in the SENT folder prove the account itself was used — reset, add MFA, and remove attacker forwarding rules.',
          S.steps([('Spam from user', 'shows in sent items'), ('Reset and MFA', 'sign out all sessions'), ('Check rules', 'forwarding, delegates')], title='Email account takeover', tones=['red', 'blue', 'amber']),
          caption='Mail the user never sent means the account is compromised: reset it, add MFA, and remove attacker rules.')

    b.add('3.2', 'Hosts file tampering',
          'The local hosts file maps names to IP addresses before DNS is consulted; malware can add entries that send sites such as a bank or an update server to an attacker\'s address, or block security sites.',
          'explain why one PC reaches a fake bank page while every other PC on the network reaches the real site',
          ['A browser cache problem', 'A metered connection', 'Time drift'],
          'Only THIS PC is affected and names are overridden locally — check the hosts file before blaming DNS.',
          S.terminal([r'type C:\Windows\System32\drivers\etc\hosts', '# normal lines start with #', '203.0.113.50   www.mybank.example', '203.0.113.50   update.microsoft.com'], title='hosts file'),
          caption='Malware can edit the hosts file so chosen sites resolve to an attacker\'s address on that PC.')

    # ------------------------------------------------------------------------------------------ 3.3
    b.add('3.3', 'Random mobile reboots',
          'A phone or tablet that restarts on its own may be overheating, have a failing battery, a bad OS update, or a faulty or malicious app; remove recent apps, update, check battery health, and factory reset as a last step.',
          'diagnose a phone that restarts several times a day after a new app was installed',
          ['A low-storage warning', 'A Bluetooth pairing problem', 'Auto-rotate being off'],
          'Check recent apps and updates, heat, and battery health BEFORE jumping to a factory reset.',
          S.steps([('Remove recent apps', 'and clear heat'), ('Update OS and apps', 'fix known bugs'), ('Factory reset', 'last resort')], title='Random reboots', tones=['plain', 'blue', 'amber']),
          caption='Random reboots point to an app, update, heat, or battery problem; reset only as a last resort.')

    b.add('3.3', 'Screen does not auto-rotate',
          'If the display stays in one orientation, check that rotation lock is off in quick settings, that the app supports rotation, and that the accelerometer works, restarting the device if needed.',
          'fix a tablet whose display stays in portrait when it is turned sideways',
          ['A failing battery', 'Airplane mode being on', 'Low storage'],
          'Check the rotation LOCK first, then whether the app supports landscape.',
          S.steps([('Quick settings', 'is rotation locked?'), ('App support', 'some apps stay portrait'), ('Restart', 'then test the sensor')], title='Auto-rotate not working', tones=['blue', 'plain', 'green']),
          caption='Rotation lock is the usual cause of a screen that will not rotate; check it first.')

    b.add('3.3', 'Mobile factory reset',
          'Restoring a phone or tablet to its default state erases all data and apps, so it is a last resort after restart, update, and removing apps fail, and a backup should be made first.',
          'return a persistently misbehaving phone to a clean state after every other fix has failed',
          ['Force-closing the app', 'Clearing the app cache', 'Restarting the device'],
          'A last resort that ERASES data — back up first, and try the lighter fixes before it.',
          S.steps([('Back up', 'cloud or computer'), ('Factory reset', 'erases everything'), ('Restore', 'apps and data')], title='Factory reset', tones=['green', 'red', 'blue']),
          caption='A factory reset wipes a mobile device to defaults, so back up first and use it last.')

    # ------------------------------------------------------------------------------------------ 3.5
    b.add('3.5', 'Excessive mobile ads and fake warnings',
          'A sudden flood of full-screen ads or "virus detected" warnings outside any app points to adware or a malicious app or website notification permission; remove the app and revoke the permission.',
          'diagnose a phone that suddenly shows full-screen ads and "your device is infected" warnings on the home screen',
          ['A failing battery', 'Low storage', 'A rotation lock'],
          'Ads OUTSIDE apps point to a malicious app or notification permission — find and remove it.',
          S.steps([('Ads and warnings', 'appear everywhere'), ('Find the source', 'recent app or site'), ('Remove it', 'and revoke permissions')], title='Adware on a phone', tones=['amber', 'blue', 'green']),
          caption='Ads and fake alerts outside any app signal adware or an abused notification permission.')

    b.add('3.5', 'Spoofed (bootleg) apps',
          'Fake apps that copy the name and icon of a legitimate app, often in unofficial stores or even slipping into official ones, to steal logins or deliver malware; verify the publisher and install only from official stores.',
          'identify an app that copies a bank\'s name and icon in order to steal logins',
          ['A legitimate app update', 'An MDM profile', 'A VPN app'],
          'A LOOK-ALIKE of a real app — check the publisher and download count, and use the official store.',
          S.compare(('Genuine app', ['Verified publisher', 'Millions of installs', 'Official store link']), ('Spoofed app', ['Odd publisher name', 'Few reviews or installs', 'Asks for extra permissions']), title='Telling them apart', tones=('green', 'red')),
          caption='Spoofed apps imitate real ones; checking the publisher and source exposes them.')

    b.add('3.5', 'Developer mode and USB debugging',
          'Enabling developer options and USB debugging lets a connected computer control the phone and install apps, so it should stay off unless needed, especially when plugging into unknown computers or charging ports.',
          'explain why a phone left with USB debugging on is riskier to charge at a public charging station',
          ['Airplane mode', 'Do Not Disturb', 'Auto-rotate'],
          'USB debugging gives a connected computer DEEP control — leave it off unless you are actively developing.',
          S.steps([('USB debugging on', 'developer option enabled'), ('Plugged in', 'untrusted computer or port'), ('Device exposed', 'apps and data at risk')], title='Why to leave it off', tones=['amber', 'plain', 'red']),
          caption='USB debugging lets a connected computer control the phone, so it should stay off when not needed.')

    b.add('3.5', 'Excessive app permissions',
          'An app that requests or uses permissions unrelated to its purpose, such as a flashlight app wanting contacts and the microphone, is a red flag; review permissions in privacy settings and revoke or uninstall.',
          'reduce risk from a flashlight app that asks for contacts, microphone, and location access',
          ['Sideloading', 'A VPN', 'A biometric lock'],
          'Permissions that do not match the app\'s PURPOSE are the warning — revoke them or uninstall.',
          S.table(['App', 'Reasonable permission', 'Suspicious request'], [('Flashlight', 'camera light', 'contacts, microphone'), ('Maps', 'location', 'SMS, call log'), ('Calculator', 'none', 'camera, location')], title='Does the permission fit the app?', col_widths=[0.25, 0.35, 0.4]),
          caption='Permissions unrelated to an app\'s function are a warning sign; review and revoke them.')

    b.add('3.5', 'Leaked personal data (mobile)',
          'Personal photos, contacts, or messages appearing online, or accounts accessed by others, can come from over-permissioned apps, malware, or a compromised cloud account; change passwords, add MFA, review permissions, and remove the culprit.',
          'respond when a user\'s private photos and contacts are found online after installing several free apps',
          ['A failing battery', 'Low storage', 'A slow update'],
          'Review app PERMISSIONS and the cloud account together — both are common leak paths.',
          S.steps([('Leak found', 'photos, contacts online'), ('Contain', 'change passwords, add MFA'), ('Clean up', 'review apps and permissions')], title='Responding to a leak', tones=['red', 'blue', 'green']),
          caption='Leaked mobile data is handled by securing accounts and reviewing the apps and permissions behind it.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('More Windows problems and recovery tools', ['3.1'],
              'Match the symptom to the layer. A black screen with a pointer means Windows is running, so restart explorer.exe from Task Manager or check the display driver; "Operating system not found" is a boot-record problem fixed from the recovery environment with bootrec; a low memory warning means RAM and the page file are exhausted; and a USB controller resource warning means too many devices share one controller.\n\n'
              'Wrong or drifting time (often a dead CMOS battery) breaks certificates and Kerberos sign-in, limited connectivity with a 169.254 address means DHCP failed, and a slow profile load usually comes from a large roaming profile. Safe Mode loads minimal drivers to isolate problems, and System Restore rolls system state back to a restore point without touching documents.')
    b.section('More PC security symptoms', ['3.2'],
              'Malware often attacks defenses first, so antivirus that turns itself off or cannot update is a symptom of infection, and failing Windows Updates may come from corrupted components, a wrong clock, or interference (use the troubleshooter, then DISM and sfc). The hosts file overrides DNS for one PC, so a single machine reaching a fake site while others reach the real one points to tampering.\n\n'
              'If contacts receive spam from a user and the sent items show messages the user never wrote, the mailbox is compromised: reset the password, enable MFA, sign out all sessions, and remove forwarding rules and delegates.')
    b.section('Mobile reboots, rotation, and reset', ['3.3'],
              'Random reboots point to a recent app or update, overheating, or a failing battery. A screen that will not rotate is almost always the rotation lock or an app that does not support landscape. A factory reset erases everything, so it comes last and only after a backup.')
    b.section('Mobile security issues', ['3.5'],
              'Ads and "virus detected" warnings outside any app point to adware or an abused notification permission. Spoofed apps imitate real ones, so check the publisher and install only from official stores, and permissions that do not fit an app\'s purpose are a red flag to review and revoke.\n\n'
              'Developer mode and USB debugging give a connected computer deep control, so keep them off when not developing. If personal data leaks, secure the accounts (new passwords and MFA) and review the apps and permissions behind it.')
