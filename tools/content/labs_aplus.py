"""New A+ Core 2 labs, covering the objectives added in v223 (commands, tools, security, troubleshooting, operations)."""
from labs_lib import decision, scenario, sequence, terminal

C = 'core2'


def labs():
    out = []

    # ------------------------------------------------------------------------------------------ c2d1
    out.append(terminal(
        'dns-failure-triage-terminal', C, 'c2d1', 'Intermediate', 9,
        'Users reach the Internet by IP but not by name',
        'Use a simulated Windows prompt to prove a DNS problem and separate it from a connectivity problem.',
        'Employees say "the Internet is down," but a technician suspects name resolution. At the prompt, run the right tests in order to prove where the fault is. Type commands exactly, or use an accepted equivalent.',
        [
            ('First confirm basic Internet reachability by pinging a public IP address, 8.8.8.8.', ['ping 8.8.8.8'],
             'Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=14ms TTL=117\nReply from 8.8.8.8: bytes=32 time=13ms TTL=117\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
             'Ping the IP address directly so DNS is not involved.'),
            ('Now test name resolution by pinging a hostname, example.com.', ['ping example.com'],
             'Ping request could not find host example.com. Please check the name and try again.',
             'Ping the name this time, to see whether it resolves.'),
            ('Query DNS directly for that name to see which server answers.', ['nslookup example.com'],
             'DNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  192.168.1.99\n\n*** Request to UnKnown timed-out',
             'Use the DNS query tool with the hostname.'),
            ('View the full IP configuration to see which DNS server this workstation was given.', ['ipconfig /all', 'ipconfig -all'],
             'Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . . : 192.168.1.40\n   Default Gateway . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . : 192.168.1.99',
             'Use the IP configuration command with the switch that shows full detail.'),
            ('Test the same name against a working public DNS server, 8.8.8.8, using nslookup.', ['nslookup example.com 8.8.8.8'],
             'Server:  dns.google\nAddress:  8.8.8.8\n\nName:    example.com\nAddresses:  93.184.216.34',
             'Give nslookup the name followed by the DNS server to ask.'),
            ('That proves the internal DNS server at 192.168.1.99 is the fault. After it is fixed, clear this workstation\'s cached DNS results.', ['ipconfig /flushdns', 'ipconfig -flushdns'],
             'Windows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.',
             'Clear the local DNS resolver cache with ipconfig.'),
        ],
        [('ping', 'Test reachability of an IP address or name'), ('nslookup', 'Query DNS for a name (optionally against a chosen server)'), ('ipconfig /all', 'Show full IP configuration, including DNS servers'),
         ('ipconfig /flushdns', 'Clear the local DNS resolver cache'), ('tracert', 'Trace the path to a destination'), ('netstat', 'Show connections and listening ports')],
        'Pinging an IP address works but pinging the name fails, so connectivity is fine and name resolution is not. nslookup shows the configured DNS server timing out, ipconfig /all shows which server the workstation was given, and asking a public resolver succeeds, which isolates the fault to the internal DNS server. Flushing the cache afterwards removes any stale failures.'))

    out.append(terminal(
        'map-network-drive-terminal', C, 'c2d1', 'Beginner', 7,
        'Map and verify a network drive from the command line',
        'Use net use to connect, check, and remove a mapped drive.',
        'A user needs the department share available as drive Z: that reconnects every time they sign in. Do it from the command prompt. Type commands exactly, or use an accepted equivalent.',
        [
            ('List the current network connections on this computer.', ['net use'],
             'New connections will be remembered.\n\nThere are no entries in the list.', 'Use the net command that manages shared resources, with no arguments.'),
            (r'Map drive Z: to \\fs01\dept so that it reconnects at sign-in.', [r'net use Z: \\fs01\dept /persistent:yes', r'net use z: \\fs01\dept /persistent:yes', r'net use Z: \\fs01\dept /persistent:y'],
             'The command completed successfully.', 'Give net use the drive letter, the UNC path, and the persistent switch.'),
            ('Confirm that the mapping exists.', ['net use'],
             'Status       Local     Remote                    Network\n-------------------------------------------------------------\nOK           Z:        \\\\fs01\\dept              Microsoft Windows Network\nThe command completed successfully.',
             'List the connections again.'),
            ('The share is being retired. Remove the Z: mapping.', ['net use Z: /delete', 'net use z: /delete', 'net use Z: /d'],
             'Z: was deleted successfully.', 'Use net use with the drive letter and the delete switch.'),
        ],
        [('net use', 'List network connections'), (r'net use Z: \\server\share /persistent:yes', 'Map a drive that reconnects at sign-in'), ('net use Z: /delete', 'Remove a mapped drive'),
         ('net user', 'Manage user accounts (not drive mappings)'), ('robocopy', 'Copy files robustly')],
        r'net use maps a drive letter to a UNC path such as \\server\share, and /persistent:yes makes the mapping return at the next sign-in. Running net use with no arguments lists connections, and /delete removes one. net user is a different command that manages accounts.'))

    out.append(terminal(
        'repair-windows-image-terminal', C, 'c2d1', 'Intermediate', 9,
        'System File Checker cannot fix the problem',
        'Use sfc and DISM together, in the right order, to repair a damaged Windows installation.',
        'A PC crashes when opening certain settings pages. At an elevated prompt, check and repair the system files. Type commands exactly, or use an accepted equivalent.',
        [
            ('Scan and repair protected system files.', ['sfc /scannow', 'sfc /SCANNOW'],
             'Beginning system scan. This process will take some time.\nWindows Resource Protection found corrupt files but was unable to fix some of them.\nDetails are included in the CBS.Log file.',
             'Run System File Checker with the scan-now switch.'),
            ('sfc could not repair everything because the component store it draws from is damaged. Repair the Windows image online.', ['DISM /Online /Cleanup-Image /RestoreHealth', 'dism /online /cleanup-image /restorehealth'],
             '[==========================100.0%==========================]\nThe restore operation completed successfully.\nThe operation completed successfully.',
             'Use DISM against the running system with the RestoreHealth option.'),
            ('Now run the System File Checker again to repair the files with the healthy component store.', ['sfc /scannow', 'sfc /SCANNOW'],
             'Beginning system scan. This process will take some time.\nWindows Resource Protection found corrupt files and successfully repaired them.',
             'Repeat the scan-now command.'),
        ],
        [('sfc /scannow', 'Scan and repair protected system files'), ('DISM /Online /Cleanup-Image /RestoreHealth', 'Repair the Windows image (component store)'), ('chkdsk /f', 'Fix file system errors on a drive'), ('gpupdate /force', 'Refresh Group Policy')],
        'sfc replaces damaged system files using the Windows component store. If that store is itself corrupt, sfc cannot finish, so DISM /Online /Cleanup-Image /RestoreHealth repairs the store first, and then sfc /scannow can repair the remaining files.'))

    out.append(terminal(
        'group-policy-refresh-terminal', C, 'c2d1', 'Intermediate', 8,
        'A new policy has not reached a workstation',
        'Use gpresult and gpupdate to verify and refresh Group Policy.',
        'A new Group Policy setting was linked to the Sales organizational unit, but one salesperson\'s PC does not have it. Diagnose at the prompt. Type commands exactly, or use an accepted equivalent.',
        [
            ('Report which policies are applied to this computer and user.', ['gpresult /r', 'gpresult /R'],
             'Applied Group Policy Objects\n-----------------------------\n    Default Domain Policy\n\nThe following GPOs were not applied because they were filtered out\n-------------------------------------------------------------------\n    Sales Desktop Settings\n        Filtering:  Not Applied (Unknown Reason)',
             'Use gpresult with the switch that prints a summary.'),
            ('The PC simply has not refreshed since the policy was linked. Force a refresh of policy now.', ['gpupdate /force', 'gpupdate /FORCE'],
             'Updating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.',
             'Use gpupdate with the switch that reapplies all settings.'),
            ('Verify that the policy now applies.', ['gpresult /r', 'gpresult /R'],
             'Applied Group Policy Objects\n-----------------------------\n    Default Domain Policy\n    Sales Desktop Settings',
             'Run the policy report again.'),
        ],
        [('gpresult /r', 'Report the Group Policy settings that actually applied'), ('gpupdate /force', 'Reapply all Group Policy settings now'), ('gpedit.msc', 'Open the Local Group Policy Editor'), ('net user', 'Manage user accounts')],
        'gpresult reports what actually applied to a user and computer, while gpupdate /force requests a refresh. Running the report, forcing a refresh, and running the report again confirms the change took effect. If a policy still fails to apply, the report shows whether it was filtered out, for example by scope or security filtering.'))

    out.append(terminal(
        'linux-disk-full-terminal', C, 'c2d1', 'Intermediate', 9,
        'A Linux server\'s /var volume is full',
        'Use df, du, grep, and gzip to find and fix a full file system.',
        'A web server has stopped writing logs because /var is full. Work from the shell to find what is using the space and recover it safely. Type commands exactly, or use an accepted equivalent.',
        [
            ('Check how full each file system is, in human-readable sizes.', ['df -h'],
             'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        40G   12G   26G  32% /\n/dev/sda3        20G   20G     0 100% /var',
             'Use the disk free command with the human-readable switch.'),
            ('See how much space each item under /var/log is using.', ['du -sh /var/log/*'],
             '4.0K    /var/log/auth.log\n18G     /var/log/app.log\n1.2G    /var/log/syslog',
             'Use the disk usage command with summary and human-readable switches and a wildcard.'),
            ('Look for lines containing the word error in the large log, ignoring case.', ['grep -i error /var/log/app.log'],
             '2026-10-04 02:11:07 ERROR disk write failed: no space left on device\n2026-10-04 02:11:08 ERROR retrying write to /var/log/app.log',
             'Use grep with the case-insensitive switch, the word, and the file.'),
            ('Compress the oversized log to recover space without deleting it.', ['gzip /var/log/app.log', 'sudo gzip /var/log/app.log'],
             '',
             'Use gzip on the log file.'),
            ('Confirm that the space has been recovered.', ['df -h'],
             'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        40G   12G   26G  32% /\n/dev/sda3        20G  2.1G   17G  11% /var',
             'Check the file system usage again.'),
        ],
        [('df -h', 'Show free and used space per file system'), ('du -sh <path>', 'Show space used by files or directories'), ('grep -i <word> <file>', 'Search a file for matching lines'), ('gzip <file>', 'Compress a file'), ('ps aux', 'List running processes')],
        'df shows which file system is full, du shows what inside it is using the space, and grep reads the contents of the log to find the cause. Compressing the log with gzip recovers space while keeping the data, and df confirms the result.'))

    # ------------------------------------------------------------------------------------------ c2d3
    out.append(terminal(
        'boot-repair-terminal', C, 'c2d3', 'Advanced', 10,
        'Windows reports "Operating system not found"',
        'Use bootrec from the recovery environment to repair the boot records.',
        'A PC will not boot and reports that the operating system was not found. From the Windows Recovery Environment command prompt, repair the boot configuration. Type commands exactly, or use an accepted equivalent.',
        [
            ('Repair the master boot record.', ['bootrec /fixmbr', 'bootrec /FIXMBR'], 'The operation completed successfully.', 'Use bootrec with the switch that fixes the master boot record.'),
            ('Write a new boot sector to the system partition.', ['bootrec /fixboot', 'bootrec /FIXBOOT'], 'The operation completed successfully.', 'Use bootrec with the switch that fixes the boot sector.'),
            ('Scan the disks for Windows installations.', ['bootrec /scanos', 'bootrec /SCANOS'], 'Scanning all disks for Windows installations.\n\nTotal identified Windows installations: 1\n[1]  D:\\Windows\nThe operation completed successfully.', 'Use bootrec with the scan switch.'),
            ('Rebuild the Boot Configuration Data store.', ['bootrec /rebuildbcd', 'bootrec /REBUILDBCD'], 'Scanning all disks for Windows installations.\nTotal identified Windows installations: 1\n[1]  D:\\Windows\nAdd installation to boot list? Yes(Y)/No(N)/All(A):', 'Use bootrec with the rebuild switch.'),
            ('Answer the prompt to add the discovered installation to the boot list.', ['y', 'Y', 'a', 'A'], 'Successfully scanned Windows installations.\nTotal identified Windows installations: 1\nThe operation completed successfully.', 'Answer Yes to the prompt.'),
        ],
        [('bootrec /fixmbr', 'Repair the master boot record'), ('bootrec /fixboot', 'Write a new boot sector'), ('bootrec /scanos', 'Find Windows installations'), ('bootrec /rebuildbcd', 'Rebuild the boot configuration data'), ('sfc /scannow', 'Repair system files (needs a booting Windows)')],
        'A missing or damaged boot record produces "Operating system not found." bootrec repairs the master boot record and boot sector, finds installed Windows copies, and rebuilds the Boot Configuration Data, all from the recovery environment because Windows itself cannot start. sfc is for repairing files once Windows boots.'))

    out.append(terminal(
        'print-spooler-reset-terminal', C, 'c2d3', 'Beginner', 7,
        'A stuck print job blocks the whole queue',
        'Stop the Print Spooler, clear its spool folder, and start it again.',
        'One job will not delete and nothing else prints. At an elevated prompt, reset the print spooler. Type commands exactly, or use an accepted equivalent.',
        [
            ('Stop the Print Spooler service.', ['net stop spooler', 'net stop Spooler'], 'The Print Spooler service is stopping.\nThe Print Spooler service was stopped successfully.', 'Use net stop with the service name.'),
            ('Delete everything in the spool folder, quietly.', [r'del /Q C:\Windows\System32\spool\PRINTERS\*', r'del /q c:\windows\system32\spool\printers\*', r'del /F /Q C:\Windows\System32\spool\PRINTERS\*'], '',
             'Use del with the quiet switch on the PRINTERS spool folder.'),
            ('Start the Print Spooler service again.', ['net start spooler', 'net start Spooler'], 'The Print Spooler service is starting.\nThe Print Spooler service was started successfully.', 'Use net start with the service name.'),
        ],
        [('net stop spooler', 'Stop the Print Spooler service'), (r'del /Q C:\Windows\System32\spool\PRINTERS\*', 'Delete queued spool files'), ('net start spooler', 'Start the Print Spooler service'), ('sfc /scannow', 'Repair system files')],
        'A corrupt job can block the spooler\'s queue. Stopping the service releases the files, clearing the spool folder removes the stuck job, and starting the service again restores printing, with no new hardware or drivers needed.'))

    out.append(scenario(
        'compromised-mailbox-scenario', C, 'c2d3', 'Advanced', 10,
        'The CFO\'s mailbox is sending spam',
        'Work a mailbox takeover through to containment instead of just deleting the messages.',
        'Customers report spam from the CFO\'s email address. The CFO says they never sent it. Work the ticket by choosing your next action at each step.',
        ('Spam coming from the CFO\'s account', ['Reported by: Customer service', 'Symptom: customers receive unsolicited messages from the CFO\'s address', 'The CFO did not send them']),
        {
            'start': ('What is the best first action?', [
                ('Reset the password, sign out all sessions, and enable multifactor authentication', 'step2', True),
                ('Delete the spam messages from the Sent Items folder and move on', 'end_bad_delete', False),
                ('Tell customers to ignore the messages and wait', 'end_bad_ignore', False)]),
            'step2': ('The mailbox is secured, but Sent Items shows messages sent overnight, and an inbox rule forwards all incoming mail to an unknown external address. What next?', [
                ('Remove the forwarding rule, check delegates and connected apps, and review recent sign-ins', 'step3', True),
                ('Leave the rule in place because it is harmless', 'end_bad_rule', False),
                ('Rename the mailbox so the attacker cannot find it', 'end_bad_rename', False)]),
            'step3': ('The attacker\'s access is removed. What else should happen before closing the ticket?', [
                ('Document the incident, check whether other accounts were targeted, and notify security and affected parties', 'end_good', True),
                ('Close the ticket immediately because the account works again', 'end_bad_close', False)]),
            'end_good': ('END', True, 'Resetting credentials, ending sessions, adding MFA, removing the attacker\'s forwarding rule, and checking for wider impact contains the takeover and documents it for follow-up.'),
            'end_bad_delete': ('END', False, 'Deleting the messages leaves the attacker with access, so the spam and the forwarding of private mail would continue.'),
            'end_bad_ignore': ('END', False, 'Ignoring it leaves a compromised executive account free to send fraud and phishing mail.'),
            'end_bad_rule': ('END', False, 'A rule forwarding mail to an external address is how attackers keep seeing replies and resets; leaving it in place keeps the breach alive.'),
            'end_bad_rename': ('END', False, 'Renaming the mailbox does not remove the attacker\'s stolen credentials, sessions, or rules.'),
            'end_bad_close': ('END', False, 'Closing too early skips checking for other victims and reporting, and the same attacker may already be in other accounts.'),
        },
        'Messages the user never wrote in Sent Items point to a compromised account. Contain it first (new password, ended sessions, MFA), then remove persistence such as forwarding rules, delegates, and connected apps, and finally widen the investigation and document it.'))

    out.append(decision(
        'mobile-adware-decision', C, 'c2d3', 'Beginner', 7,
        'A phone is full of ads and fake virus warnings',
        'Choose safe steps for a phone showing full-screen ads and "virus detected" alerts.',
        'An employee\'s phone shows full-screen ads on the home screen and a "your device is infected" warning. It started after they installed a free flashlight app.',
        [
            ('What is the best first step?', ['Remove the recently installed app and review its permissions and notification settings', 'Pay for the cleaning tool the warning recommends', 'Install a second unknown cleaner app', 'Ignore it until the battery drains'], 0,
             'The timing points at the new app, so removing it and revoking what it was allowed to do addresses the likely source. The warning itself is part of the problem, so following it is unsafe.'),
            ('The ads continue after the app is removed. What is the next reasonable step?', ['Update the OS and apps, run a reputable mobile security scan, and check for unknown device administrators', 'Disable the screen lock', 'Sideload a cleaner from a website', 'Turn off automatic updates'], 0,
             'Updating closes known flaws, a scan looks for anything left behind, and unfamiliar device administrators or accessibility services are common persistence points.'),
            ('Nothing works and the phone is still showing ads. What is the last resort?', ['Back up personal data, then perform a factory reset and reinstall only trusted apps from the official store', 'Root the phone to remove it manually', 'Keep using it but avoid the home screen', 'Reinstall the flashlight app to see if it behaves'], 0,
             'A factory reset erases persistent malware but also erases data, so it comes last and after a backup. Rooting or sideloading adds risk rather than removing it.'),
        ],
        'Unwanted ads and fake warnings usually trace to a recently installed app or an abused notification permission. Remove the likely source, patch and scan, check for abused permissions, and reserve a backed-up factory reset for when nothing else works.'))

    # ------------------------------------------------------------------------------------------ c2d2
    out.append(sequence(
        'soho-router-hardening-sequence', C, 'c2d2', 'Beginner', 6,
        'Harden a new small-office router',
        'Put the first-hour router hardening steps in a sensible order.',
        'A new router has just come out of the box. Arrange the steps from first to last before devices are connected.',
        ['Log in with the default credentials and change the administrator password', 'Install the latest firmware update', 'Set a unique network name and enable WPA3 or WPA2 with AES and a strong passphrase',
         'Disable WPS and UPnP', 'Create a separate guest network isolated from the main LAN', 'Disable remote administration from the Internet', 'Back up the finished configuration'],
        'The default login is public knowledge, so it is changed first. Firmware is updated next because it fixes known flaws, then the wireless security is set, risky convenience features (WPS, UPnP) and remote administration are switched off, visitors get an isolated network, and the finished configuration is saved.'))

    out.append(decision(
        'wifi-security-decision', C, 'c2d2', 'Intermediate', 8,
        'Choose Wi-Fi security for staff, visitors, and an old scanner',
        'Pick the right wireless authentication and segmentation for three requirements.',
        'A 40-person company is rebuilding its wireless network. It wants individual logins for staff, Internet-only access for visitors, and it still has one old scanner that only supports WEP.',
        [
            ('Staff should each have their own Wi-Fi credentials, so one person\'s access can be removed without affecting anyone else. What should be used?', ['WPA-Enterprise with 802.1X and a RADIUS server', 'WPA-Personal with one shared passphrase', 'An open network with MAC filtering only', 'WEP with a long key'], 0,
             'Enterprise mode authenticates each user individually through 802.1X and RADIUS, so credentials are unique and revocable. A shared passphrase cannot be removed for one person alone.'),
            ('Visitors need Internet access only. What is the best design?', ['A separate guest network isolated from the internal LAN, with a captive portal', 'Give visitors the staff credentials', 'Place visitors on the main VLAN and hide the staff SSID', 'Leave the guest network open and unrestricted on the main LAN'], 0,
             'An isolated guest network gives visitors the Internet without exposing internal systems, and a captive portal can require acceptance of terms.'),
            ('The old scanner supports only WEP. What is the best action?', ['Replace it, or isolate it on its own restricted legacy network, and keep everything else on WPA3 or WPA2 with AES', 'Switch the whole network to WEP so the scanner works', 'Switch the whole network to TKIP', 'Hide the SSID and keep WEP on the main network'], 0,
             'WEP is trivially broken, so it must not weaken the main network. Replacing the device is best, and isolating it with restricted access limits the risk if that is not possible.'),
        ],
        'Match the control to the requirement: 802.1X for individual, revocable staff credentials, an isolated guest network for visitors, and keep legacy devices away from the main network rather than lowering everyone\'s security.'))

    # ------------------------------------------------------------------------------------------ c2d4
    out.append(sequence(
        'employee-offboarding-sequence', C, 'c2d4', 'Beginner', 6,
        'Offboard a departing employee',
        'Order the termination checklist so access ends on time and nothing is lost.',
        'An employee is leaving the company this afternoon. Arrange the technician\'s tasks from first to last.',
        ['Confirm the effective time and any data-handling instructions with HR and the manager', 'Disable the user\'s accounts and revoke VPN, email, and application access at the effective time', 'Reset passwords, end active sessions, and remove the user from groups',
         'Collect the laptop, badge, and other equipment', 'Reassign or archive the user\'s mailbox and files', 'Wipe returned devices and update the asset inventory', 'Document completion in the ticket'],
        'Access is removed on schedule first, because risk peaks at departure, then sessions are ended, equipment is collected, the data is preserved for the business, returned devices are wiped and recorded, and everything is documented.'))

    out.append(sequence(
        'change-request-sequence', C, 'c2d4', 'Intermediate', 7,
        'Run a change through change management',
        'Put the stages of a controlled change in order, from request to closure.',
        'Operations wants to upgrade a core application server. Arrange the change-management steps from first to last.',
        ['Submit the change request with purpose, scope, and affected systems', 'Perform a risk analysis and assign a risk level', 'Test the change in a sandbox and prepare the backout plan', 'Obtain approval from the change board',
         'Implement the change in the approved maintenance window', 'Have end users confirm it works (acceptance)', 'Update the documentation and close the change'],
        'A request defines what and why, risk analysis rates it, a sandbox test and backout plan make it safe to attempt, approval authorizes it, it is implemented in a window, users accept it, and documentation closes the loop.'))

    out.append(decision(
        'remote-access-tool-decision', C, 'c2d4', 'Intermediate', 8,
        'Pick the right remote access tool for each job',
        'Match three support situations to remote access technologies.',
        'A support team uses several remote tools and needs to choose the right one for three different jobs.',
        [
            ('A remote employee at home has a frozen laptop and a login error. They are on the phone with you and have no remote software installed. What is the best option?', ['Quick Assist, with the user sharing a one-time code', 'Install an RMM agent first', 'RDP directly into their home router', 'Ask them to open a port on their router'], 0,
             'Quick Assist works with the user\'s consent using a one-time code and needs no permanent software or port forwarding.'),
            ('The team must patch, monitor, and run scripts on 400 company laptops from one console. What should they use?', ['A remote monitoring and management (RMM) platform with an agent on each device', 'Quick Assist on each laptop in turn', 'VNC to each laptop by hand', 'Telnet to each laptop'], 0,
             'RMM installs an agent on every endpoint so IT can monitor, patch, script, and control them centrally.'),
            ('An administrator must manage a Linux server\'s command line securely across the Internet. What is the best choice?', ['SSH, ideally with key-based authentication', 'Telnet', 'Unencrypted VNC', 'RDP exposed directly to the Internet'], 0,
             'SSH encrypts the session and commonly uses keys. Telnet and plain VNC send data in the clear, and exposing RDP directly to the Internet is dangerous.'),
        ],
        'Choose by situation: a user-consented one-time session suits Quick Assist, fleet management suits an RMM agent, and secure Linux administration suits SSH. Never expose RDP directly, and avoid clear-text tools such as Telnet.'))

    out.append(decision(
        'script-vetting-decision', C, 'c2d4', 'Beginner', 6,
        'Is this downloaded script safe to run?',
        'Walk through safe handling of an unfamiliar script found on a forum.',
        'A forum post offers a PowerShell script that "clears temp files on all your PCs." A technician wants to use it on 200 company workstations.',
        [
            ('What should the technician do first?', ['Read the script and test it in an isolated sandbox', 'Run it on one production PC as administrator', 'Disable antivirus so it is not blocked', 'Email it to the whole team'], 0,
             'An unreviewed script has the same power as malware, so it should be read and tested in an isolated environment before it touches production.'),
            ('While reading it, the technician finds an obfuscated command that downloads and runs a file from an unknown URL. What now?', ['Do not run it; report it and use a trusted, reviewed alternative', 'Run it anyway because the temp-file part looks fine', 'Decode it and run only the second half on production', 'Add the URL to the allow list'], 0,
             'Downloading and executing code from an unknown source is a major red flag, so the script should be rejected, not partly used.'),
            ('Later, a vetted in-house version is ready. How should it be deployed?', ['To a small pilot group through RMM or Group Policy with least privilege and logging', 'To all 200 PCs at once with a shared admin account', 'By asking each user to run it themselves', 'By removing the execution policy on every PC'], 0,
             'A pilot group limits the damage if something is wrong, and central tools with least privilege and logging make it controllable and auditable.'),
        ],
        'Treat unfamiliar scripts as untrusted: review the code, test it in a sandbox, reject anything that fetches or runs unknown content, and deploy approved scripts in stages with least privilege and logging.'))

    return out
