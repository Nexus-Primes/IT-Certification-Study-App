// ---------- Built-in runbook templates ----------
// Written in the same plain-text format the runbook editor uses: "## Section" starts a section, every
// other non-blank line is one step, and " :: " separates the step from an optional hint (a command,
// a port list, a warning). The 3CX lists follow 3CX's administrator manual (2026); the Windows and
// Hyper-V lists are general practice. They are starting points: edit a copy to match your environment.

export const BUILTIN_RUNBOOKS = [
  {
    id: 'rb-3cx-golive', title: '3CX go-live (on premise)', category: '3CX',
    summary: 'From planning and firewall through install, trunks, users, backups, and cutover testing.',
    text: `## Plan
Choose the extension number length and numbering plan :: It is picked during setup and cannot be changed later
Choose the FQDN and confirm you control its DNS :: Also fixed during setup and hard to change afterwards
Assign a System Owner with a unique email address :: Needed before a V20 upgrade too
Size the server and the internet link :: Use the Calculators page: extensions, simultaneous calls, recording storage
Pick a supported SIP trunk provider and order the DIDs :: Supported providers are pre-configured and supported by both 3CX and the provider
Record the IP plan (static LAN address for the PBX, dedicated public IP) :: Use the Network sheet
## Network and firewall
Give the PBX a static private address and reserve it in DHCP
Set up split DNS so the FQDN resolves to the LAN address inside and the public address outside :: An internal DNS server, or a firewall that supports hairpin NAT
Open inbound UDP 5060 and TCP 5060-5061 for SIP :: Also UDP 9000-10999 (call audio), TCP and UDP 5090 (tunnel), TCP 443 or 5001 (HTTPS); keep HTTP 5000 closed to the WAN
Allow outbound TCP 443 to the 3CX cloud services and to Google and Apple push :: iOS push also uses 2197 and 5223
Turn off SIP ALG on the router or firewall
Check that the firewall keeps SIP source ports and acts as full cone NAT :: The Firewall Checker tests both
Write ACLs that stop the PBX host reaching sensitive subnets :: 3CX will not do this for you on an on-premise install
## Install and activate
Install Debian 12 from the 3CX ISO on a dedicated machine or VM :: Do not run apt upgrade by hand; the install takes about 5 to 20 minutes
Upload the configuration file generated from your 3CX account :: Browser on port 5015 of the new machine, or the command line
Set the System Owner password and sign in
Run the Firewall Checker on the Dashboard and fix every failure :: PBX services stop and restart during the test, so do it out of hours
Activate the license and confirm the edition has the features you need :: Barge/listen need Pro or AI; skills-based queues, AI summaries, and failover need AI
Turn on automatic updates :: There is no rollback to an earlier version
## Trunks and call routing
Add the SIP trunk under Voice & Chat :: Choose the provider, set the default route for unassigned DIDs
Confirm the trunk status :: Green means registered; an IP-based trunk is always green, so prove it with a real call
Add the DIDs in E.164 format and assign each one to its destination :: Assigned DID Number(s) on the user, ring group, queue, or IVR
Create the outbound rules and order them with the most specific first :: The first matching rule wins and new rules go to the bottom
Configure the emergency numbers under System > Emergency :: One mandatory route plus up to four alternates; set notifications
Set the departments, office hours, breaks, time zones, and holidays :: In V20 the hours of the destination's department apply
Build the IVRs, ring groups, and queues :: IVR prompts must be PCM WAV, 8 kHz, 16-bit, mono
## Users and phones
Create the users with email, role, main department, and assigned DID :: Each user is sent a welcome email; for many users, fill the Extensions table on the Network sheet and use its Export for 3CX bulk import
Add each phone to its user with the MAC address (no dashes or colons) :: Then connect it by RPS (within 14 days), PnP, or DHCP option 66
Plan router phones or SBCs for any remote site :: A cloud-hosted PBX needs one; on premise can use Local LAN/VPN
Install the Windows and mobile apps and check that push notifications ring
Turn on two-factor authentication for administrators
## Safety net
Set up remote storage under System > Storage :: Never a folder inside the 3CX install directory
Schedule a daily off-hours backup, run one now, and test a restore on a spare machine :: A restore stops all 3CX services
Set disk housekeeping: recording auto-clean, voicemail quota, and log purging :: Disk Protect Mode stops recordings under about 500 MB free
Set email alerts for critical events under System > Alerts
Restrict the admin console to trusted IPs under Console Restrictions
Set Allowed Country Codes, and the same restriction at the provider
## Test and go live
Test an inbound call to every DID and check it lands where intended :: The Activity Log shows the DID the trunk delivered
Test outbound calls: local, national, and international
Test the emergency route only as your provider and local rules allow
Test transfers, voicemail, IVRs, queues, ring groups, and holiday routing
Test calls and push notifications from the apps outside the network
Keep the old phone system available until the new one has proven itself
## After go-live
Review the Event log and Activity Log after the first day
Check disk space and the license call limit after the first week :: Event 8193 means the concurrent call limit was reached
Hand out quick guides and answer questions
Update the Network sheet and file this run for the record`
  },
  {
    id: 'rb-3cx-newuser', title: '3CX new user and desk phone', category: '3CX',
    summary: 'Create an extension, assign a DID, provision a phone, and check it works.',
    text: `## Create the user
Add the user under Admin > Users :: Extension, email, first and last name, mobile number
Choose the role and the main department :: One department per user is best practice
Assign a DID and set the outbound caller ID to match :: So return calls come back to the same person
Check the welcome email arrived
## Phone
Open the IP Phone tab, choose the model, and enter the MAC address with no dashes or colons
Choose how it connects :: Router phone or SBC, or Local LAN/VPN on an on-premise system
Connect the phone and let it provision :: RPS within 14 days (restart if already connected), PnP assignment, or DHCP option 66
Confirm the phone shows as registered and has the right firmware
## Call handling
Set forwarding rules and any exceptions :: Up to 15 exceptions, matched by caller ID
Add the user to the right ring groups and queues, and log them in to the queues
Check voicemail and the notification email
## Apps and checks
Install the Windows or mobile app and sign in
Place an inbound and an outbound test call
Add the extension to the Network sheet
Hand the user a quick guide`
  },
  {
    id: 'rb-3cx-cutover', title: 'SIP trunk and number cutover day', category: '3CX',
    summary: 'Move numbers to a new SIP trunk with a rollback plan.',
    text: `## Before the day
Confirm the port or cutover date and time window with the provider in writing
Test the new trunk with a temporary number first :: Registration, inbound, outbound, caller ID
Export or record the current routing so you can put it back :: DIDs, destinations, outbound rules
Warn staff and the front desk about the window
Agree the rollback trigger and who calls it
## On the day
Add the DIDs in E.164 format to the new trunk
Assign each DID to its destination :: Check the Activity Log shows the DID the trunk delivers
Confirm the trunk shows registered, then place a real call to prove it :: An IP-based trunk always shows green
Test inbound from a mobile and from a landline
Test outbound and check the caller ID that is presented :: The provider may replace an unverified caller ID
Test the emergency route as your provider allows
## After
Watch the Event log for trunk failovers and errors for the first day
Confirm with the provider that the old service can be cancelled
Update the Network sheet and file this run`
  },
  {
    id: 'rb-promote-dc', title: 'Promote a domain controller', category: 'Windows Server',
    summary: 'Add a domain controller to an existing domain and verify replication.',
    text: `## Prepare the server
Patch Windows and set the server name :: Rename-Computer -NewName DC02 -Restart
Set a static IP address and point DNS at an existing domain controller
Check time sync and the clock offset to the PDC emulator :: w32tm /query /status
Confirm the domain and forest functional levels support the new server's OS
## Promote
Install the AD DS role :: Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
Promote as an additional domain controller with DNS and Global Catalog :: Install-ADDSDomainController -DomainName corp.example.com -InstallDns -Credential (Get-Credential)
Choose the AD site and set a Directory Services Restore Mode password; store it safely
Let the server restart
## Verify
Run the domain controller diagnostics :: dcdiag /v
Check replication with every partner :: repadmin /replsummary
Check SYSVOL and NETLOGON are shared and DNS records exist
Confirm the new controller is found :: nltest /dsgetdc:corp.example.com
Check where the FSMO roles live :: netdom query fsmo
## Finish
Add the new DC's address to DHCP scope DNS options and static client settings
Take a system state backup and confirm it is in the backup schedule
Add monitoring and update the Network sheet`
  },
  {
    id: 'rb-demote-dc', title: 'Demote and retire a domain controller', category: 'Windows Server',
    summary: 'Move roles off an old domain controller and remove it cleanly.',
    text: `## Before demoting
Check which FSMO roles it holds and move them first :: netdom query fsmo
Move or replace anything else it runs: DNS, DHCP, certificate authority, file shares
Change DHCP scope and static DNS settings so nothing points only at this server
Confirm replication is healthy first :: repadmin /replsummary, dcdiag /v
Take a system state backup
## Demote
Demote the controller :: Uninstall-ADDSDomainController -DemoteOperationMasterRole:$false
Remove the AD DS role and restart :: Uninstall-WindowsFeature AD-Domain-Services
Confirm it is gone from Active Directory Sites and Services
## Clean up
Remove stale DNS records, name servers, and reverse entries for the old server
Run dcdiag and repadmin again from another controller
Power down, wait a week, then retire the machine or VM
Update the Network sheet`
  },
  {
    id: 'rb-hyperv-host', title: 'Hyper-V host build', category: 'Windows Server',
    summary: 'Prepare hardware, install Windows Server and Hyper-V, and set up networking and storage.',
    text: `## Hardware and firmware
Update the firmware and drivers
Enable hardware virtualization and SLAT in the BIOS or UEFI :: Intel VT-x or AMD-V
Check the storage layout and the RAID or Storage Spaces plan
## Install
Install Windows Server and apply all updates
Name the server, set the static IP, and join the domain
Install the Hyper-V role :: Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart
Set the default paths for virtual machines and disks :: Set-VMHost -VirtualMachinePath D:\\VMs -VirtualHardDiskPath D:\\VHDs
## Networking
Create the virtual switch :: New-VMSwitch -Name Prod -NetAdapterName NIC1,NIC2 -EnableEmbeddedTeaming $true -AllowManagementOS $true
Set the management VLAN and any VLAN IDs for the VMs
Check jumbo frames and the physical switch ports match
## Hardening and operations
Add antivirus exclusions for the VM folders and the Hyper-V processes
Turn on the Hyper-V replication or live migration settings you need
Configure the backup agent and take a first backup
Add the host to monitoring and Windows Admin Center
## Prove it
Create a test VM, install an OS, and check networking and time sync
Delete the test VM and record the host in the Network sheet`
  },
  {
    id: 'rb-win-baseline', title: 'New Windows Server baseline', category: 'Windows Server',
    summary: 'The common checks for any new member server before it goes into service.',
    text: `## Identity and network
Set the computer name, static IP, and DNS servers
Join the domain and move the computer account to the right OU
Check time sync with the domain
## Security
Install all updates and enable automatic updates or add the server to the patch tool
Check Windows Firewall profiles and open only the ports the role needs
Enable the endpoint protection agent
Manage the local Administrator password with LAPS
Limit who can sign in remotely and use Network Level Authentication for RDP
## Operations
Install only the roles and features required
Size the event logs and forward the important ones
Add the backup agent and confirm the first backup
Add monitoring and an inventory entry in the Network sheet
## Hand-over
Record the owner, purpose, and maintenance window
Test sign-in as a normal admin account`
  },
  {
    id: 'rb-restore-drill', title: 'Restore test drill', category: 'Operations',
    summary: 'Prove a backup works and measure how long a restore really takes.',
    text: `## Plan
Choose what to restore and which backup to use
State the recovery time and recovery point you expect
Prepare an isolated place to restore into so production is not touched
## Restore
Note the start time and restore the backup
Boot or open it and check the application starts
Check recent data is present and sensible
## Review
Record how long the restore took and compare it with the target
List anything that was missing or manual
Clean up the test restore
File this run and fix the gaps found`
  }
];
