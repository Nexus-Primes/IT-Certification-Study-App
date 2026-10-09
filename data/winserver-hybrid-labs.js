(function () {
  'use strict';
  window.WINSERVER_LABS = [
  {
    "id": "promote-new-dc-sequence",
    "core": "core1",
    "domain": "ws1",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Promote a new domain controller in the right order",
    "summary": "Put the steps for standing up an additional domain controller into the correct order, from prerequisites to first replication.",
    "brief": "A branch office needs its own domain controller so authentication survives a WAN outage. Arrange the steps from first to last.",
    "steps": [
      "Confirm the server meets AD DS prerequisites and has a static IP configured",
      "Install the AD DS server role",
      "Run the promotion wizard, joining the existing domain",
      "Select the appropriate site for the new DC during promotion",
      "Wait for initial AD database replication to complete",
      "Verify replication health with repadmin and dcdiag",
      "Configure the site's DNS and DHCP to point at the new local DC"
    ],
    "explanation": "Prerequisites and a static IP come first since promotion depends on them, then the AD DS role installs before the promotion wizard can even run. Site selection during promotion determines replication topology, so it happens before waiting for that first replication to finish. Verifying health comes right after replication, and only once the DC is confirmed healthy does it make sense to point local DNS/DHCP at it."
  },
  {
    "id": "ad-replication-failure-decision",
    "core": "core1",
    "domain": "ws1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Diagnose a domain controller that stopped replicating",
    "summary": "Work through a stalled-replication ticket one diagnostic layer at a time instead of guessing at a fix.",
    "brief": "A branch office domain controller hasn't received any AD changes from headquarters in over 12 hours, though the site was working fine last week.",
    "stages": [
      {
        "question": "What's the most efficient first diagnostic step?",
        "options": [
          "Run repadmin /showrepl on the affected DC to see its replication partners and last-success times",
          "Immediately demote and re-promote the domain controller",
          "Manually copy the NTDS.dit database from another DC",
          "Assume it's a DNS problem and rebuild all DNS zones"
        ],
        "correct": 0,
        "feedback": "repadmin /showrepl gives a fast, targeted view of exactly which replication partners are failing and since when, without any destructive action."
      },
      {
        "question": "repadmin shows the last successful replication was 14 hours ago, right around a network change. What should you check next?",
        "options": [
          "Verify basic network connectivity and firewall rules between the two DCs on the required AD ports",
          "Check the DC's local disk space for unrelated storage issues",
          "Rebuild the SYSVOL share from scratch",
          "Force a schema update"
        ],
        "correct": 0,
        "feedback": "Since the failure lines up with a network change, checking connectivity/firewall rules on the ports AD replication actually needs is the direct next step, before assuming a deeper AD-specific fault."
      },
      {
        "question": "You confirm a new firewall rule is blocking RPC dynamic ports between the two DCs. What's the correct fix?",
        "options": [
          "Adjust the firewall rule to allow the required AD DS replication ports, then force replication with repadmin /replicate",
          "Disable the firewall entirely on both domain controllers",
          "Switch the domain to a different authentication protocol",
          "Rename the domain controller"
        ],
        "correct": 0,
        "feedback": "Fixing the specific blocking rule addresses the actual root cause, and forcing replication afterward confirms the fix worked without waiting for the next scheduled cycle. Disabling the firewall entirely trades one problem for a much bigger one."
      }
    ],
    "explanation": "The efficient path traces the failure from a fast, non-destructive diagnostic (repadmin) to the specific root cause (a firewall change blocking RPC ports), fixing only what's actually broken rather than rebuilding working infrastructure."
  },
  {
    "id": "arc-onboarding-terminal",
    "core": "core1",
    "domain": "ws2",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Connect a server to Azure Arc from PowerShell",
    "summary": "Use a simulated PowerShell session to onboard a server to Azure Arc and confirm it's actually connected.",
    "brief": "A newly built on-premises server needs to be connected to Azure Arc so it shows up in Azure Policy and Monitor. Work through onboarding from the command line.",
    "terminal": [
      {
        "prompt": "First, check whether the Arc connected machine agent is already installed.",
        "accepts": ["azcmagent show", "Get-Service himds"],
        "output": "Agent Status: NotConnected\nAgent Version: 1.44",
        "hint": "Use azcmagent show to check the agent's current status."
      },
      {
        "prompt": "The agent is installed but not connected. Connect it to your Azure subscription and resource group.",
        "accepts": ["azcmagent connect --resource-group rg-onprem --tenant-id <tenant> --subscription-id <sub>", "azcmagent connect"],
        "output": "Connecting machine to Azure...\nSuccessfully connected the machine.",
        "hint": "Use azcmagent connect with the resource group and subscription."
      },
      {
        "prompt": "Confirm the connection succeeded and the machine is now showing as connected.",
        "accepts": ["azcmagent show", "azcmagent show -j"],
        "output": "Agent Status: Connected\nAzure Resource Name: srv-branch-01\nResource Group: rg-onprem",
        "hint": "Re-run azcmagent show to verify the status changed to Connected."
      }
    ],
    "explanation": "Checking status before connecting confirms whether onboarding is even needed, connecting requires the target resource group and subscription context, and re-checking status afterward confirms the connection actually succeeded rather than assuming it did."
  },
  {
    "id": "live-migration-sequence",
    "core": "core1",
    "domain": "ws3",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Live-migrate a running VM ahead of host maintenance",
    "summary": "Put the steps for a zero-downtime live migration into the correct order before taking a Hyper-V host down for patching.",
    "brief": "A Hyper-V host needs scheduled maintenance tonight. Arrange the steps to move its running VMs to another host first, with zero downtime.",
    "steps": [
      "Confirm the destination host has enough free memory and CPU capacity for the incoming VM",
      "Verify both hosts are part of the same failover cluster (or configured for shared-nothing migration)",
      "Initiate live migration of the VM to the destination host",
      "Monitor migration progress until it completes",
      "Confirm the VM is running on the new host with no dropped connections",
      "Place the original host into maintenance mode / drain it",
      "Proceed with patching the now-empty original host"
    ],
    "explanation": "Capacity and cluster/configuration checks come first since migration would simply fail without them. The migration itself runs and is monitored to completion, then verified before the original host is drained and only then patched — patching a host that might still be silently serving a VM risks an outage."
  },
  {
    "id": "hyperv-switch-decision",
    "core": "core1",
    "domain": "ws3",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Choose the right Hyper-V virtual switch for a new isolated lab",
    "summary": "Work through the requirements for a new internal test environment to land on the correct virtual switch type.",
    "brief": "A team needs an isolated set of test VMs on a Hyper-V host, with specific requirements about what those VMs can and can't reach.",
    "stages": [
      {
        "question": "The VMs must be able to talk to each other, but must never be reachable from the physical network at all. Which switch type fits?",
        "options": ["Private switch", "External switch", "Internal switch"],
        "correct": 0,
        "feedback": "A private switch isolates VM-to-VM traffic completely, with no path to the host or the physical network — exactly the total isolation requested."
      },
      {
        "question": "Later, the team also needs the VMs to reach the Hyper-V host itself (but still not the physical network). What should change?",
        "options": ["Switch to an internal switch instead", "Add NIC teaming", "Enable GPU partitioning"],
        "correct": 0,
        "feedback": "An internal switch adds host reachability on top of VM-to-VM connectivity, while still keeping the physical network out of reach — the next step up in scope from private."
      },
      {
        "question": "Finally, one VM needs to reach the actual corporate network for a software update. What's the correct approach?",
        "options": ["Add a second virtual NIC on that one VM connected to an external switch", "Switch the entire lab to an external switch", "Disable the firewall on the host"],
        "correct": 0,
        "feedback": "Giving just the one VM that needs it a second NIC on an external switch keeps the rest of the lab isolated while solving the specific, narrow need — switching everything to external would defeat the whole point of the isolated lab."
      }
    ],
    "explanation": "The three Hyper-V switch types form a scope ladder — private (VM-to-VM only), internal (adds host), external (adds the physical network) — and picking the narrowest one that satisfies the actual requirement, adding scope only where specifically needed, keeps the lab as isolated as possible."
  },
  {
    "id": "dhcp-exhaustion-terminal",
    "core": "core1",
    "domain": "ws4",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Diagnose a DHCP scope that ran out of addresses",
    "summary": "Use simulated PowerShell DHCP cmdlets to confirm and fix a scope exhaustion problem.",
    "brief": "New devices on one subnet are failing to get an IP address, while existing devices keep working normally. Investigate from PowerShell.",
    "terminal": [
      {
        "prompt": "Check the current utilization of the affected DHCP scope.",
        "accepts": ["Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.5.0", "Get-DhcpServerv4ScopeStatistics"],
        "output": "ScopeId         Free  InUse  PercentageInUse\n192.168.5.0     0     254    100",
        "hint": "Use Get-DhcpServerv4ScopeStatistics with the scope ID."
      },
      {
        "prompt": "The scope is fully exhausted. Check whether any leases are stale and safe to reclaim.",
        "accepts": ["Get-DhcpServerv4Lease -ScopeId 192.168.5.0 | Where-Object {$_.AddressState -eq 'Expired'}", "Get-DhcpServerv4Lease -ScopeId 192.168.5.0"],
        "output": "IPAddress       AddressState   LeaseExpiryTime\n192.168.5.44    Expired        (12 days ago)\n192.168.5.61    Expired        (9 days ago)",
        "hint": "Filter Get-DhcpServerv4Lease for expired addresses."
      },
      {
        "prompt": "Clean up the expired, reclaimable leases to free up address space immediately.",
        "accepts": ["Remove-DhcpServerv4Lease -IPAddress 192.168.5.44,192.168.5.61", "Remove-DhcpServerv4Lease -ScopeId 192.168.5.0"],
        "output": "Leases removed. Scope free addresses: 2",
        "hint": "Use Remove-DhcpServerv4Lease for the expired addresses."
      }
    ],
    "explanation": "Confirming exhaustion first avoids guessing, finding expired-but-not-yet-reclaimed leases identifies quick-win free space, and removing them is the immediate fix — a longer-term fix would also mean enlarging the scope or splitting the subnet if growth continues."
  },
  {
    "id": "s2d-buildout-sequence",
    "core": "core1",
    "domain": "ws5",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Build Storage Spaces Direct shared storage for a new cluster",
    "summary": "Put the steps for standing up a Storage Spaces Direct hyper-converged cluster into the correct order.",
    "brief": "A three-node Hyper-V cluster needs shared, highly available storage built from each node's own local disks. Arrange the setup steps.",
    "steps": [
      "Validate the cluster hardware and network configuration with the cluster validation wizard",
      "Create the failover cluster across all three nodes",
      "Confirm each node's local disks are eligible (unformatted, directly attached)",
      "Enable Storage Spaces Direct on the cluster",
      "Create a storage pool from the pooled eligible disks",
      "Choose a resiliency type and create a volume",
      "Format the volume with ReFS and add it as a Cluster Shared Volume"
    ],
    "explanation": "Validation and cluster creation are prerequisites for everything that follows. Disk eligibility must be confirmed before S2D can even be enabled, and S2D itself must be enabled before a pool can be created from those disks. Resiliency and volume creation come after pooling, and formatting/CSV setup is the final step that makes the volume actually usable by the cluster's VMs."
  },
  {
    "id": "bitlocker-recovery-decision",
    "core": "core1",
    "domain": "ws5",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "A server keeps demanding a BitLocker recovery key after a firmware update",
    "summary": "Work through why a firmware update triggered repeated BitLocker recovery prompts, and fix it correctly.",
    "brief": "After a routine firmware update, a server now requires a BitLocker recovery key on every single boot, even though nothing about the disk itself changed.",
    "stages": [
      {
        "question": "What's the most likely explanation for this specific pattern?",
        "options": [
          "The firmware update changed TPM measurements, so the normal TPM-based unlock no longer matches",
          "The physical disk was silently swapped for a different one",
          "The server was infected with ransomware",
          "BitLocker itself is broken and needs to be completely reinstalled"
        ],
        "correct": 0,
        "feedback": "Firmware/boot-configuration changes alter what the TPM measures at boot, and BitLocker's TPM-based unlock relies on those measurements matching — a firmware update is a very common, specific trigger for exactly this symptom."
      },
      {
        "question": "You need to get past today's boot. What should you use?",
        "options": [
          "Enter the escrowed BitLocker recovery key to unlock the volume this one time",
          "Wipe and reinstall the operating system",
          "Physically remove the TPM chip",
          "Disable Secure Boot permanently"
        ],
        "correct": 0,
        "feedback": "The recovery key is exactly the intended mechanism for this situation — it unlocks the volume immediately without destroying any data."
      },
      {
        "question": "To stop this from happening on every future boot, what's the right follow-up?",
        "options": [
          "Suspend BitLocker before further firmware changes, then resume it afterward so new TPM measurements are captured cleanly",
          "Leave BitLocker permanently disabled going forward",
          "Change the recovery key escrow location",
          "Ignore it — recovery prompts are normal and expected"
        ],
        "correct": 0,
        "feedback": "Suspending BitLocker before planned firmware/BIOS changes and resuming it afterward lets the new, correct measurements get captured without triggering unnecessary recovery prompts on every subsequent boot."
      }
    ],
    "explanation": "The TPM-firmware relationship is the key insight: BitLocker's normal unlock depends on TPM measurements staying consistent, and a firmware update is one of the most common legitimate triggers for those measurements to change — the fix is procedural (suspend/resume around planned changes), not a sign that BitLocker or the hardware itself is actually broken."
  },
  {
    "id": "harden-new-dc-sequence",
    "core": "core1",
    "domain": "ws6",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Harden a newly promoted domain controller",
    "summary": "Put the standard hardening steps for a brand-new domain controller into a sensible order.",
    "brief": "A domain controller was just promoted and needs to be brought up to the organization's security baseline before it's considered production-ready.",
    "steps": [
      "Confirm only required server roles are installed, removing anything unnecessary",
      "Apply the organization's OSConfig or GPO-based security baseline",
      "Enable Windows LAPS for the local administrator account",
      "Restrict interactive logon to the DC to designated administrative accounts only",
      "Configure Windows Firewall connection security rules for administrative traffic",
      "Enable Microsoft Defender for Servers monitoring",
      "Run a final security baseline compliance check"
    ],
    "explanation": "Minimizing installed roles first shrinks the attack surface before anything else is layered on top. The baseline and LAPS come next as foundational protections, then access restrictions and firewall rules narrow who can reach the DC and how. Monitoring is enabled once the DC's own configuration is solid, and a final compliance check confirms everything actually landed as intended."
  },
  {
    "id": "suspicious-auth-scenario",
    "core": "core1",
    "domain": "ws6",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 12,
    "title": "Unusual authentication activity flagged against a service account",
    "summary": "Trace a suspicious authentication alert through the right investigative steps instead of jumping straight to a drastic response.",
    "brief": "Microsoft Defender for Identity flagged unusual authentication patterns for a service account overnight — sign-ins from a host that account has never used before.",
    "ticket": {
      "subject": "Suspicious authentication pattern on svc-backup account",
      "details": [
        "Reported by: Microsoft Defender for Identity alert",
        "Symptom: svc-backup authenticated from SRV-WEB-07 at 2:14 AM, a host it has never signed into before",
        "svc-backup normally only authenticates from the backup server"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the most efficient first step?",
        "options": [
          { "label": "Review the account's recent authentication history and the specific event details on SRV-WEB-07", "next": "step2", "correct": true },
          { "label": "Immediately delete the svc-backup account", "next": "end_bad_delete", "correct": false },
          { "label": "Reboot every server in the environment", "next": "end_bad_reboot", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The event details show a successful Kerberos ticket request using the service account's credentials from an unfamiliar host. What should you check next?",
        "options": [
          { "label": "Check whether the service account's Kerberos delegation is configured to allow reaching that host, and whether that host was recently compromised", "next": "step3", "correct": true },
          { "label": "Assume it's a false positive and dismiss the alert without investigation", "next": "end_bad_dismiss", "correct": false }
        ]
      },
      "step3": {
        "prompt": "SRV-WEB-07 shows signs of a separate compromise (an unrecognized process). What's the correct immediate response?",
        "options": [
          { "label": "Isolate SRV-WEB-07 from the network, reset the svc-backup account's password, and review what that account's credentials could have accessed", "next": "end_good", "correct": true },
          { "label": "Leave SRV-WEB-07 connected and only monitor it for a few more days", "next": "end_bad_wait", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Isolating the compromised host and resetting the exposed credential contains the incident quickly, and reviewing the account's actual access scope confirms whether anything beyond authentication was affected. This is the standard, measured incident-response sequence — investigate, contain, then assess impact." },
      "end_bad_delete": { "end": true, "success": false, "prompt": "Deleting the account destroys evidence and immediately breaks the legitimate backup jobs that depend on it, without actually addressing how it got used from an unfamiliar host in the first place." },
      "end_bad_reboot": { "end": true, "success": false, "prompt": "A blanket reboot of every server does nothing to identify or contain the actual source of the suspicious authentication and would cause massive unnecessary disruption." },
      "end_bad_dismiss": { "end": true, "success": false, "prompt": "Dismissing an alert involving credentials authenticating from a genuinely new, unfamiliar host without investigation risks missing an active compromise in progress." },
      "end_bad_wait": { "end": true, "success": false, "prompt": "Leaving a host showing signs of compromise connected to the network for days gives an attacker more time to move laterally using the exposed credential." }
    },
    "explanation": "The efficient path investigates before reacting, follows the evidence to the actual compromised host, and then takes proportionate containment action — isolate, reset the exposed credential, and assess scope — rather than either overreacting (deleting accounts, rebooting everything) or underreacting (dismissing the alert, waiting)."
  },
  {
    "id": "secure-channel-terminal",
    "core": "core1",
    "domain": "ws7",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 7,
    "title": "Fix a broken computer account trust relationship",
    "summary": "Use simulated PowerShell to diagnose and repair a workstation that's lost its trust relationship with the domain.",
    "brief": "A workstation that was offline for months now shows 'the trust relationship between this workstation and the primary domain failed.' Fix it from PowerShell.",
    "terminal": [
      {
        "prompt": "First, confirm the secure channel is actually broken.",
        "accepts": ["Test-ComputerSecureChannel", "Test-ComputerSecureChannel -Verbose"],
        "output": "False",
        "hint": "Use Test-ComputerSecureChannel with no extra parameters to check status."
      },
      {
        "prompt": "It's confirmed broken. Repair it, providing valid domain admin credentials when prompted.",
        "accepts": ["Test-ComputerSecureChannel -Repair -Credential (Get-Credential)", "Test-ComputerSecureChannel -Repair"],
        "output": "Attempting to reset the secure channel...\nSecure channel successfully reset.",
        "hint": "Use Test-ComputerSecureChannel with the -Repair switch."
      },
      {
        "prompt": "Confirm the repair actually worked.",
        "accepts": ["Test-ComputerSecureChannel"],
        "output": "True",
        "hint": "Re-run Test-ComputerSecureChannel to confirm it now returns True."
      }
    ],
    "explanation": "Confirming the failure first avoids assuming, the -Repair switch resets the computer account's password to restore the trust without needing to rejoin the domain and lose local settings, and a final check confirms the fix actually took effect."
  },
  {
    "id": "multisite-replication-scenario",
    "core": "core1",
    "domain": "ws7",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 12,
    "title": "AD replication is silently failing between two sites",
    "summary": "Trace a cross-site replication problem through the right diagnostic layers to the actual root cause.",
    "brief": "A recently promoted user at a branch office still can't access a resource that was granted days ago at headquarters, though everything looks fine locally.",
    "ticket": {
      "subject": "Branch office user missing recently granted permissions",
      "details": [
        "Reported by: Branch office help desk",
        "Symptom: a permission granted 4 days ago at HQ still hasn't applied for a branch-office user",
        "The branch office's own local changes replicate to HQ fine"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the most efficient first check?",
        "options": [
          { "label": "Run repadmin /showrepl on the branch DC to see replication status specifically from HQ inbound", "next": "step2", "correct": true },
          { "label": "Manually recreate the user's permission at the branch DC directly", "next": "end_bad_manual", "correct": false },
          { "label": "Rebuild the branch DC from scratch", "next": "end_bad_rebuild", "correct": false }
        ]
      },
      "step2": {
        "prompt": "repadmin shows inbound replication from HQ has been failing for exactly 4 days with an RPC error, while outbound replication to HQ works. What should you check next?",
        "options": [
          { "label": "Check the site link schedule and connectivity specifically in the HQ-to-branch direction", "next": "step3", "correct": true },
          { "label": "Check the branch office's local DHCP scope", "next": "end_bad_dhcp", "correct": false }
        ]
      },
      "step3": {
        "prompt": "You find a firewall change was made at HQ 4 days ago that only affected outbound RPC traffic toward the branch. What's the correct fix?",
        "options": [
          { "label": "Correct the HQ-side firewall rule to allow the required replication ports outbound to the branch, then force inbound replication", "next": "end_good", "correct": true },
          { "label": "Disable replication scheduling entirely going forward", "next": "end_bad_disable", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Fixing the specific HQ-side firewall rule that broke exactly 4 days ago restores the one-directional replication path that was actually failing, without touching the branch DC or any config that was already correct." },
      "end_bad_manual": { "end": true, "success": false, "prompt": "Manually recreating the permission masks the real underlying replication failure rather than fixing it — the next legitimate change from HQ will fail to reach the branch too." },
      "end_bad_rebuild": { "end": true, "success": false, "prompt": "Rebuilding the branch DC is a drastic, disruptive step with no evidence yet that the branch DC itself, rather than the replication path, is actually the problem." },
      "end_bad_dhcp": { "end": true, "success": false, "prompt": "DHCP scope configuration has nothing to do with AD replication failing in one specific direction between two known, already-communicating domain controllers." },
      "end_bad_disable": { "end": true, "success": false, "prompt": "Disabling replication scheduling doesn't fix the actual RPC connectivity problem and would make the branch office permanently fall behind on every future AD change." }
    },
    "explanation": "The key clue is asymmetry — outbound works, inbound fails, pointing at something specific to that one direction rather than the branch DC generally. Tracing from a targeted repadmin check to the specific firewall change that lines up with the 4-day-old failure finds the real root cause without any unnecessary rebuilding or masking of the underlying issue."
  },
  {
    "id": "fsmo-transfer-terminal",
    "core": "core1",
    "domain": "ws1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Hand every operations master role to a new domain controller before retiring the old one",
    "summary": "Find the role holders, transfer all five roles with PowerShell, verify, and demote the old controller.",
    "brief": "The contoso.com domain has two domain controllers, DC1 and DC2. DC1 holds every operations master role and is being retired, so the roles must be transferred gracefully to DC2 first. Type commands exactly, or use an accepted equivalent.",
    "explanation": "netdom query fsmo shows all five holders. Move-ADDirectoryServerOperationMasterRole without -Force is a graceful transfer, which requires both controllers to be online; seizing (-Force) is only for a holder that is permanently lost. After the roles move, Uninstall-ADDSDomainController demotes the old controller and cleans its metadata.",
    "terminal": [
      {
        "prompt": "List which servers currently hold the five operations master roles.",
        "accepts": [
          "netdom query fsmo"
        ],
        "output": "Schema master          DC1.contoso.com\nDomain naming master    DC1.contoso.com\nPDC                    DC1.contoso.com\nRID pool manager       DC1.contoso.com\nInfrastructure master  DC1.contoso.com\nThe command completed successfully.",
        "hint": "Use netdom with the query fsmo option."
      },
      {
        "prompt": "Transfer all five roles to DC2 with one PowerShell command (roles 0 through 4, or their names).",
        "accepts": [
          "Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole 0,1,2,3,4",
          "Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole 0,1,2,3,4 -Confirm:$false",
          "Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster,SchemaMaster,DomainNamingMaster",
          "Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster,SchemaMaster,DomainNamingMaster -Confirm:$false"
        ],
        "output": "Move operation master role... [Y] Yes\nAll five operations master roles were transferred to DC2.",
        "hint": "Use Move-ADDirectoryServerOperationMasterRole with -Identity DC2 and every role number from 0 to 4 (no -Force, so it is a graceful transfer)."
      },
      {
        "prompt": "Confirm that DC2 now holds the roles, using the same command as the first step.",
        "accepts": [
          "netdom query fsmo"
        ],
        "output": "Schema master          DC2.contoso.com\nDomain naming master    DC2.contoso.com\nPDC                    DC2.contoso.com\nRID pool manager       DC2.contoso.com\nInfrastructure master  DC2.contoso.com\nThe command completed successfully.",
        "hint": "Run netdom query fsmo again."
      },
      {
        "prompt": "On DC1, which now holds no roles, remove Active Directory Domain Services cleanly.",
        "accepts": [
          "Uninstall-ADDSDomainController"
        ],
        "output": "Prompting for LocalAdministratorPassword...\nDC1 was demoted and its directory entries were removed.",
        "hint": "Use the cmdlet that demotes a live domain controller; it begins with Uninstall."
      }
    ],
    "commands": [
      {
        "cmd": "netdom query fsmo",
        "desc": "List the five operations master role holders"
      },
      {
        "cmd": "Move-ADDirectoryServerOperationMasterRole",
        "desc": "Transfer roles to another domain controller (add -Force to seize)"
      },
      {
        "cmd": "Uninstall-ADDSDomainController",
        "desc": "Demote a live domain controller"
      },
      {
        "cmd": "Get-ADDomain",
        "desc": "Shows the domain-wide role holders"
      }
    ]
  },
  {
    "id": "trust-type-decision",
    "core": "core1",
    "domain": "ws1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Pick the right trust for four different directories",
    "summary": "Match forest, external, shortcut, and realm trusts to the situation each one is built for.",
    "brief": "Contoso is connecting its directory to several others. For each requirement, choose the trust that does the job and no more.",
    "explanation": "Forest trusts join whole forests, external trusts join a single domain to a single domain, shortcut trusts shorten paths inside one forest, and realm trusts connect to non-Windows Kerberos realms. Prefer the narrowest trust that satisfies the requirement, and remember SID filtering and selective authentication can narrow it further.",
    "stages": [
      {
        "question": "Every domain of a merged partner's forest must be reachable by users in every Contoso domain, without creating many separate trusts.",
        "options": [
          "Forest trust",
          "External trust",
          "Shortcut trust",
          "Realm trust"
        ],
        "correct": 0,
        "feedback": "A forest trust is transitive between forest roots, so every domain on both sides is included."
      },
      {
        "question": "A subsidiary in another forest needs access to one Contoso file server, and nothing else about its forest should be trusted.",
        "options": [
          "Forest trust",
          "External trust",
          "Shortcut trust",
          "Realm trust"
        ],
        "correct": 1,
        "feedback": "An external trust is non-transitive and links one domain to one domain, which limits exposure."
      },
      {
        "question": "A Linux team that runs MIT Kerberos wants Active Directory users to sign in to its application servers.",
        "options": [
          "Forest trust",
          "External trust",
          "Shortcut trust",
          "Realm trust"
        ],
        "correct": 3,
        "feedback": "A realm trust is the type that targets a non-Windows Kerberos v5 realm."
      },
      {
        "question": "Sign-ins between two deeply nested child domains in the same forest are slow because tickets walk through several parent domains.",
        "options": [
          "Forest trust",
          "External trust",
          "Shortcut trust",
          "Realm trust"
        ],
        "correct": 2,
        "feedback": "A shortcut trust gives the two child domains a direct authentication path inside one forest."
      }
    ]
  },
  {
    "id": "rodc-staged-sequence",
    "core": "core1",
    "domain": "ws1",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Deploy a read-only domain controller at a branch with a staged installation",
    "summary": "Order the steps so that a branch technician can finish the promotion without domain administrator rights.",
    "brief": "A new branch office needs a read-only domain controller. The branch technician must finish the installation but must not receive domain administrator rights. Arrange the steps from first to last.",
    "explanation": "A staged installation creates the account centrally, so the delegated technician only attaches the server. The password replication policy limits what a stolen RODC could expose, and administrator role separation lets the branch contact manage only that server.",
    "steps": [
      "Pre-create the RODC account in AD DS and delegate its installation to the branch technician",
      "Set the password replication policy so only branch users and computers can be cached",
      "Install the AD DS role on the branch server",
      "Promote the server by attaching it to the pre-created RODC account",
      "Confirm that the RODC replicates and caches only the intended accounts",
      "Check that the branch contact can patch the server without any domain rights"
    ]
  },
  {
    "id": "gpo-scope-scenario",
    "core": "core1",
    "domain": "ws1",
    "type": "scenario",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "A policy is not applying to the Sales users",
    "summary": "Work out why a linked Group Policy object is being denied, and fix it without widening its scope.",
    "brief": "A new Group Policy object for the Sales OU was configured weeks ago, yet the Sales users are not getting its settings. Work the ticket by choosing your action at each step.",
    "explanation": "gpresult shows both what applied and why a policy was denied. When security filtering is narrowed, keep Read for the users and computers and Apply only for the intended group, then let the refresh interval pass or run gpupdate /force.",
    "ticket": {
      "subject": "Policy not applying to Sales users",
      "details": [
        "Reported by: Help desk",
        "The GPO is linked to the Sales OU and enabled",
        "An administrator recently narrowed its security filtering to the Sales group"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What is the best first diagnostic step?",
        "options": [
          {
            "label": "Run gpresult as an affected user to see which policies applied and which were denied, and why",
            "next": "step2",
            "correct": true
          },
          {
            "label": "Delete the GPO and recreate it",
            "next": "end_bad_recreate",
            "correct": false
          },
          {
            "label": "Enforce the link at the domain level",
            "next": "end_bad_enforce",
            "correct": false
          }
        ]
      },
      "step2": {
        "prompt": "gpresult lists the GPO under denied policies with the reason \"Inaccessible (Security)\". Authenticated Users was removed from the GPO when its filtering was narrowed. What is the cause and the fix?",
        "options": [
          {
            "label": "The Sales users and computers can no longer read the GPO: grant Authenticated Users (or the computers) Read, and keep Apply only for the Sales group",
            "next": "step3",
            "correct": true
          },
          {
            "label": "The OU is blocking inheritance, so turn on Enforced for the GPO",
            "next": "end_bad_block",
            "correct": false
          },
          {
            "label": "The link order is wrong, so move the GPO to link order 1",
            "next": "end_bad_order",
            "correct": false
          }
        ]
      },
      "step3": {
        "prompt": "The test user now shows the GPO as applied after a refresh. Other users still show the old setting an hour later. What next?",
        "options": [
          {
            "label": "Allow the normal background refresh (about 90 minutes plus a random offset) or run gpupdate /force, then confirm again with gpresult",
            "next": "end_good",
            "correct": true
          },
          {
            "label": "Turn on loopback processing in Replace mode for the Sales OU",
            "next": "end_bad_loopback",
            "correct": false
          }
        ]
      },
      "end_good": {
        "end": true,
        "success": true,
        "prompt": "The policy applies once the principals can read it. Security filtering controls who applies the GPO, but Read permission must remain for the users and computers, and clients pick up the change at the next refresh or with gpupdate /force."
      },
      "end_bad_recreate": {
        "end": true,
        "success": false,
        "prompt": "Recreating the GPO repeats the same narrowed filtering and loses its history. Diagnose with gpresult first."
      },
      "end_bad_enforce": {
        "end": true,
        "success": false,
        "prompt": "Enforcing a link changes precedence and overrides blocking; it does not fix a GPO the users cannot read."
      },
      "end_bad_block": {
        "end": true,
        "success": false,
        "prompt": "The denial reason was security, not inheritance. Enforcement would not restore the missing Read permission."
      },
      "end_bad_order": {
        "end": true,
        "success": false,
        "prompt": "Link order only matters among GPOs that already apply. This GPO was being denied before any ordering."
      },
      "end_bad_loopback": {
        "end": true,
        "success": false,
        "prompt": "Loopback processing changes where user settings come from; it is not a fix for a denied GPO and would alter unrelated settings."
      }
    }
  },
  {
    "id": "update-manager-rollout-sequence",
    "core": "core1",
    "domain": "ws2",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Roll out patching for Arc-enabled servers with Azure Update Manager",
    "summary": "Order the steps from first assessment to a scoped production schedule.",
    "brief": "Your datacenter servers are connected to Azure Arc and you want a controlled monthly patching process in Azure Update Manager. Arrange the steps from first to last.",
    "explanation": "Assessment shows what is missing, tags separate pilot from production, and a maintenance configuration with a dynamic scope applies updates on a schedule. Proving the process on the pilot group first limits the blast radius of a bad update.",
    "steps": [
      "Enable periodic assessment so every connected server reports missing updates",
      "Review the compliance results and tag servers as pilot or production",
      "Create a maintenance configuration with a window, a recurrence, and update classifications",
      "Add a dynamic scope that selects the pilot servers by tag and run the first cycle",
      "Check the pilot results and the update history for failures",
      "Extend the scope to the production tag for the next maintenance window"
    ]
  },
  {
    "id": "remote-management-decision",
    "core": "core1",
    "domain": "ws2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Choose the right remote management feature for four situations",
    "summary": "Match JEA, Remote Desktop Gateway, Windows Admin Center in Azure, and delegation to each requirement.",
    "brief": "You administer a hybrid Windows Server environment. For each situation, choose the feature that fits.",
    "explanation": "Pick the narrowest tool: JEA to limit commands, RD Gateway to publish RDP over HTTPS, Windows Admin Center in Azure for Arc-enabled servers with no inbound ports, and resource-based constrained delegation for the double-hop problem instead of CredSSP.",
    "stages": [
      {
        "question": "Help desk staff must restart a service and reset passwords on a file server, but run no other command.",
        "options": [
          "Just Enough Administration (JEA)",
          "CredSSP",
          "WinRM trusted hosts",
          "Remote Server Administration Tools (RSAT)"
        ],
        "correct": 0,
        "feedback": "JEA publishes a restricted PowerShell endpoint that exposes only the allowed commands."
      },
      {
        "question": "Remote staff need Remote Desktop access to internal hosts over TCP 443, without a VPN or exposing port 3389.",
        "options": [
          "Network Level Authentication (NLA)",
          "Remote Desktop Gateway",
          "Windows Admin Center gateway mode",
          "Just Enough Administration (JEA)"
        ],
        "correct": 1,
        "feedback": "Remote Desktop Gateway tunnels RDP over HTTPS so internal hosts stay unexposed."
      },
      {
        "question": "An administrator must manage an Arc-enabled branch server from the Azure portal while its firewall allows no inbound connections.",
        "options": [
          "PowerShell remoting over WinRM HTTP",
          "Remote Desktop Gateway",
          "Windows Admin Center in the Azure portal",
          "RSAT on a workstation"
        ],
        "correct": 2,
        "feedback": "Windows Admin Center in Azure reaches Arc-enabled servers through the Arc agent's outbound connection, so no inbound ports are needed."
      },
      {
        "question": "A remote script on server 1 must read a share on server 2 without sending reusable credentials to server 1.",
        "options": [
          "CredSSP",
          "Enable-PSRemoting",
          "Resource-based Kerberos constrained delegation",
          "Server Manager remote management"
        ],
        "correct": 2,
        "feedback": "Resource-based constrained delegation lets server 2 accept delegation from server 1, so no reusable credentials are exposed. CredSSP would send them."
      }
    ]
  },
  {
    "id": "hyperv-replica-terminal",
    "core": "core1",
    "domain": "ws3",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "Replicate a virtual machine to a disaster recovery host and rehearse a failover",
    "summary": "Enable Hyper-V Replica, start the initial copy, check health, and run then clean up a test failover.",
    "brief": "The SQL01 virtual machine on host HV01 must be replicated to the disaster recovery host HVDR01 over Kerberos on HTTP, sending changes every five minutes. Type commands exactly, or use an accepted equivalent.",
    "explanation": "Enable-VMReplication sets the replica host, port, authentication, and interval; the initial copy follows, then deltas every interval. A test failover creates a disposable copy without affecting production or the replication, and Stop-VMFailover cleans it up, which makes rehearsals safe to do regularly.",
    "terminal": [
      {
        "prompt": "Enable replication of SQL01 to HVDR01 on port 80 with Kerberos authentication and a five minute (300 second) interval.",
        "accepts": [
          "Enable-VMReplication -VMName SQL01 -ReplicaServerName HVDR01 -ReplicaServerPort 80 -AuthenticationType Kerberos -ReplicationFrequencySec 300",
          "Enable-VMReplication -VMName SQL01 -ReplicaServerName HVDR01.contoso.com -ReplicaServerPort 80 -AuthenticationType Kerberos -ReplicationFrequencySec 300"
        ],
        "output": "VMName  State                         Health\nSQL01   ReadyForInitialReplication    Normal",
        "hint": "Use Enable-VMReplication with -VMName, -ReplicaServerName, -ReplicaServerPort 80, -AuthenticationType Kerberos, and -ReplicationFrequencySec 300."
      },
      {
        "prompt": "Start the initial replication of SQL01 over the network.",
        "accepts": [
          "Start-VMInitialReplication -VMName SQL01",
          "Start-VMInitialReplication SQL01"
        ],
        "output": "Initial replication of SQL01 started.",
        "hint": "Use Start-VMInitialReplication with the VM name."
      },
      {
        "prompt": "Check the replication health of SQL01.",
        "accepts": [
          "Get-VMReplication -VMName SQL01",
          "Get-VMReplication SQL01",
          "Get-VMReplication"
        ],
        "output": "VMName  State        Health  Mode\nSQL01   Replicating  Normal  Primary",
        "hint": "Use Get-VMReplication."
      },
      {
        "prompt": "On the replica host, start a test failover of SQL01 that does not disturb production.",
        "accepts": [
          "Start-VMFailover -VMName SQL01 -AsTest",
          "Start-VMFailover SQL01 -AsTest"
        ],
        "output": "A test virtual machine named 'SQL01 - Test' was created from the replica.",
        "hint": "Use Start-VMFailover with the -AsTest switch."
      },
      {
        "prompt": "When the test is finished, remove the test virtual machine.",
        "accepts": [
          "Stop-VMFailover -VMName SQL01",
          "Stop-VMFailover SQL01"
        ],
        "output": "The test virtual machine was removed and replication continues.",
        "hint": "Use Stop-VMFailover on the same VM name."
      }
    ],
    "commands": [
      {
        "cmd": "Enable-VMReplication",
        "desc": "Turn on replication for a VM"
      },
      {
        "cmd": "Start-VMInitialReplication",
        "desc": "Send the first full copy"
      },
      {
        "cmd": "Get-VMReplication",
        "desc": "Show replication state and health"
      },
      {
        "cmd": "Start-VMFailover -AsTest",
        "desc": "Create a disposable test copy on the replica host"
      },
      {
        "cmd": "Stop-VMFailover",
        "desc": "Remove the test copy"
      }
    ]
  },
  {
    "id": "azure-vm-storage-decision",
    "core": "core1",
    "domain": "ws3",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Choose disk types, caching, and encryption for Azure VMs",
    "summary": "Pick the right managed disk, host caching setting, and encryption option for four workloads.",
    "brief": "You are building Windows Server VMs in Azure and must make storage choices for each workload.",
    "explanation": "Match the disk to the workload (Premium SSD for production, Ultra only when required, Standard for dev/test), set caching by read and write pattern, and use encryption at host when the temporary disk and caches must also be encrypted.",
    "stages": [
      {
        "question": "A production SQL Server VM needs low-latency data disks with steady performance, but not the highest and most expensive tier.",
        "options": [
          "Premium SSD",
          "Standard HDD",
          "Ultra Disk",
          "The temporary disk"
        ],
        "correct": 0,
        "feedback": "Premium SSD is the usual production choice; Ultra Disk is for the most demanding latency and IOPS needs, and the temporary disk loses its data when the VM moves."
      },
      {
        "question": "The same VM has a read-heavy reporting data disk. Which host caching setting suits it?",
        "options": [
          "ReadWrite",
          "ReadOnly",
          "None"
        ],
        "correct": 1,
        "feedback": "ReadOnly speeds up repeated reads without risking cached writes; None suits write-heavy disks such as logs."
      },
      {
        "question": "Security requires that even the temporary disk and the disk caches are encrypted, with nothing installed in the guest.",
        "options": [
          "Azure Disk Encryption",
          "Encryption at host",
          "A BitLocker password typed at startup"
        ],
        "correct": 1,
        "feedback": "Encryption at host starts at the VM host and covers the temporary disk and caches without a guest agent."
      },
      {
        "question": "Developers' test VMs hold only disposable data and cost is the priority.",
        "options": [
          "Premium SSD",
          "Ultra Disk",
          "Standard HDD"
        ],
        "correct": 2,
        "feedback": "Standard HDD is the lowest-cost managed disk and fits backup and dev/test data."
      }
    ]
  },
  {
    "id": "hybrid-dns-terminal",
    "core": "core1",
    "domain": "ws4",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Make on-premises DNS resolve an Azure private endpoint name",
    "summary": "Create a conditional forwarder to the Azure resolver, test it, and clear stale answers.",
    "brief": "On-premises clients must resolve a storage account's private endpoint through an Azure DNS Private Resolver inbound endpoint at 10.1.0.4. Your on-premises DNS server is at 10.0.0.10. Type commands exactly, or use an accepted equivalent.",
    "explanation": "A conditional forwarder sends queries for the privatelink zone to the resolver's inbound endpoint, which answers with the private IP address. Testing with Resolve-DnsName -Server isolates the on-premises server, and the server and client caches must be cleared so stale public answers do not linger.",
    "terminal": [
      {
        "prompt": "Create a conditional forwarder zone for privatelink.file.core.windows.net that points to 10.1.0.4 and is stored in Active Directory for the whole forest.",
        "accepts": [
          "Add-DnsServerConditionalForwarderZone -Name privatelink.file.core.windows.net -MasterServers 10.1.0.4 -ReplicationScope Forest",
          "Add-DnsServerConditionalForwarderZone -Name \"privatelink.file.core.windows.net\" -MasterServers 10.1.0.4 -ReplicationScope Forest",
          "Add-DnsServerConditionalForwarderZone -Name privatelink.file.core.windows.net -MasterServers \"10.1.0.4\" -ReplicationScope Forest"
        ],
        "output": "Conditional forwarder zone privatelink.file.core.windows.net created (replication scope: Forest).",
        "hint": "Use Add-DnsServerConditionalForwarderZone with -Name, -MasterServers, and -ReplicationScope Forest."
      },
      {
        "prompt": "Test resolution of mystore.file.core.windows.net against the on-premises DNS server.",
        "accepts": [
          "Resolve-DnsName mystore.file.core.windows.net -Server 10.0.0.10",
          "Resolve-DnsName -Name mystore.file.core.windows.net -Server 10.0.0.10",
          "nslookup mystore.file.core.windows.net 10.0.0.10"
        ],
        "output": "Name                                   Type   IPAddress\nmystore.privatelink.file.core.windows.net  A     10.1.2.5",
        "hint": "Use Resolve-DnsName with -Server 10.0.0.10."
      },
      {
        "prompt": "The DNS server still holds an old public answer. Clear its cache.",
        "accepts": [
          "Clear-DnsServerCache",
          "Clear-DnsServerCache -Force",
          "Clear-DnsServerCache -Confirm:$false"
        ],
        "output": "The DNS server cache was cleared.",
        "hint": "Use Clear-DnsServerCache."
      },
      {
        "prompt": "Clear the cache on this client too, so it asks the server again.",
        "accepts": [
          "Clear-DnsClientCache",
          "ipconfig /flushdns"
        ],
        "output": "The DNS client resolver cache was flushed.",
        "hint": "Use Clear-DnsClientCache or ipconfig /flushdns."
      }
    ],
    "commands": [
      {
        "cmd": "Add-DnsServerConditionalForwarderZone",
        "desc": "Create a conditional forwarder"
      },
      {
        "cmd": "Resolve-DnsName",
        "desc": "Query DNS, optionally against one server"
      },
      {
        "cmd": "Clear-DnsServerCache",
        "desc": "Empty the DNS server cache"
      },
      {
        "cmd": "Clear-DnsClientCache",
        "desc": "Empty the client resolver cache"
      }
    ]
  },
  {
    "id": "dhcp-failover-sequence",
    "core": "core1",
    "domain": "ws4",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 7,
    "title": "Make DHCP highly available with a failover relationship",
    "summary": "Order the steps to give a subnet a second DHCP server that shares the scope.",
    "brief": "A single DHCP server leases addresses for the head office subnet. Add a second server so leasing continues if one fails. Arrange the steps from first to last.",
    "explanation": "DHCP failover shares the whole scope and the lease database, unlike a split scope. After authorizing both servers and creating the relationship, test it by stopping the primary, then bring it back and confirm normal state.",
    "steps": [
      "Install and authorize the DHCP role on both servers",
      "Create and activate the scope on the primary server",
      "Create the failover relationship with the partner and choose load balance or hot standby",
      "Replicate the scope configuration to the partner",
      "Test by stopping the primary DHCP service and renewing a client lease",
      "Restore the primary and confirm both servers show a normal state"
    ]
  },
  {
    "id": "azure-file-sync-sequence",
    "core": "core1",
    "domain": "ws5",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Connect an on-premises file server to an Azure file share with Azure File Sync",
    "summary": "Order the steps from the storage account to a monitored, tiered sync relationship.",
    "brief": "A branch file server must sync with an Azure file share and tier its coldest files to the cloud. Arrange the steps from first to last.",
    "explanation": "The cloud endpoint is the Azure file share, the Storage Sync Service holds the sync groups and registered servers, and each sync group has one cloud endpoint and one or more server endpoints. The tiering policy keeps the server volume from filling.",
    "steps": [
      "Create a storage account and an Azure file share for the cloud endpoint",
      "Deploy a Storage Sync Service in the same region",
      "Install the Azure File Sync agent on the Windows server and register it",
      "Create a sync group that uses the Azure file share as its cloud endpoint",
      "Add a server endpoint on the server and set a cloud tiering policy",
      "Check sync status and set up alerts in Azure Monitor"
    ]
  },
  {
    "id": "fsrm-quota-terminal",
    "core": "core1",
    "domain": "ws5",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Limit and protect a department share with File Server Resource Manager",
    "summary": "Install FSRM, apply a hard quota, block audio and video files, and review usage.",
    "brief": "The Sales folder at D:\\Shares\\Sales on FS1 keeps growing and filling with media files. Install FSRM, cap the folder at 50 GB, and block audio and video files. Type commands exactly, or use an accepted equivalent.",
    "explanation": "A hard quota blocks writes at its limit, and an active file screen denies the blocked file group rather than only logging it. Templates apply the same settings to many folders, and storage reports show where the space went.",
    "terminal": [
      {
        "prompt": "Install the File Server Resource Manager role service with its management tools.",
        "accepts": [
          "Install-WindowsFeature FS-Resource-Manager -IncludeManagementTools",
          "Install-WindowsFeature -Name FS-Resource-Manager -IncludeManagementTools"
        ],
        "output": "Success  Restart Needed: No  Feature Result: {File Server Resource Manager}",
        "hint": "Use Install-WindowsFeature with FS-Resource-Manager and -IncludeManagementTools."
      },
      {
        "prompt": "Create a hard quota of 50 GB on D:\\Shares\\Sales.",
        "accepts": [
          "New-FsrmQuota -Path D:\\Shares\\Sales -Size 50GB",
          "New-FsrmQuota -Path \"D:\\Shares\\Sales\" -Size 50GB",
          "New-FsrmQuota -Path 'D:\\Shares\\Sales' -Size 50GB"
        ],
        "output": "Path: D:\\Shares\\Sales   Size: 50 GB   SoftLimit: False",
        "hint": "Use New-FsrmQuota with -Path and -Size 50GB (a hard quota is the default)."
      },
      {
        "prompt": "Block audio and video files in the folder with an active file screen.",
        "accepts": [
          "New-FsrmFileScreen -Path D:\\Shares\\Sales -IncludeGroup \"Audio and Video Files\" -Active",
          "New-FsrmFileScreen -Path \"D:\\Shares\\Sales\" -IncludeGroup \"Audio and Video Files\" -Active"
        ],
        "output": "Path: D:\\Shares\\Sales   Active: True   IncludeGroup: Audio and Video Files",
        "hint": "Use New-FsrmFileScreen with -IncludeGroup \"Audio and Video Files\" and -Active."
      },
      {
        "prompt": "Review the quota and its current usage on the folder.",
        "accepts": [
          "Get-FsrmQuota",
          "Get-FsrmQuota -Path D:\\Shares\\Sales",
          "Get-FsrmQuota -Path \"D:\\Shares\\Sales\""
        ],
        "output": "Path                Size   Usage\nD:\\Shares\\Sales      50 GB  41.7 GB",
        "hint": "Use Get-FsrmQuota."
      }
    ],
    "commands": [
      {
        "cmd": "Install-WindowsFeature FS-Resource-Manager",
        "desc": "Add the FSRM role service"
      },
      {
        "cmd": "New-FsrmQuota",
        "desc": "Create a hard or soft quota"
      },
      {
        "cmd": "New-FsrmFileScreen",
        "desc": "Block file groups (active) or log them (passive)"
      },
      {
        "cmd": "Get-FsrmQuota",
        "desc": "Show quotas and usage"
      }
    ]
  },
  {
    "id": "storage-resiliency-decision",
    "core": "core1",
    "domain": "ws5",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Choose resiliency and replication for four storage requirements",
    "summary": "Match parity, mirror, synchronous Storage Replica, and Azure File Sync cloud tiering to the right job.",
    "brief": "You are designing storage for several workloads and must pick the layout or replication that fits each requirement.",
    "explanation": "Parity for capacity-efficient archives, mirror for busy virtual machines, synchronous replication for zero data loss over a fast link, and cloud tiering to keep a branch volume from filling.",
    "stages": [
      {
        "question": "An archive of old project files must survive one drive failure while using as little extra raw capacity as possible; writes are rare.",
        "options": [
          "Parity resiliency",
          "Mirror resiliency",
          "Simple space"
        ],
        "correct": 0,
        "feedback": "Parity is capacity-efficient and suits archives; its slower writes do not matter here."
      },
      {
        "question": "Busy Hyper-V virtual machine storage must survive a drive failure and keep good write performance.",
        "options": [
          "Parity resiliency",
          "Mirror resiliency",
          "Simple space"
        ],
        "correct": 1,
        "feedback": "Mirror keeps copies of the data, which gives better write performance for active virtual machines."
      },
      {
        "question": "Two datacenters 2 km apart on a very low latency link must hold identical volumes with no data loss.",
        "options": [
          "Asynchronous Storage Replica",
          "Synchronous Storage Replica",
          "DFS Replication",
          "Hyper-V Replica"
        ],
        "correct": 1,
        "feedback": "Synchronous replication commits each write at both sites before acknowledging it, so no data is lost, and it needs a low-latency link."
      },
      {
        "question": "A branch file server must keep only recently used files locally so the volume stays under a free-space target.",
        "options": [
          "Data Deduplication",
          "Storage Spaces parity",
          "Azure File Sync with a volume free space policy"
        ],
        "correct": 2,
        "feedback": "Cloud tiering with a volume free space policy moves the coldest files to Azure and leaves stubs on the server."
      }
    ]
  },
  {
    "id": "laps-rollout-sequence",
    "core": "core1",
    "domain": "ws6",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Roll out Windows LAPS with passwords stored in Active Directory",
    "summary": "Order the steps from the schema change to verifying that a managed password was stored.",
    "brief": "Local administrator accounts on member servers share passwords. Deploy Windows LAPS so each computer has its own rotated password stored in AD. Arrange the steps from first to last.",
    "explanation": "The schema is extended once, computers need permission to write their own passwords, policy tells the client where and how to store them, and Get-LapsADPassword proves it works. Restricting who can read passwords and resetting them after use limits exposure.",
    "steps": [
      "Extend the Active Directory schema for Windows LAPS",
      "Give computers permission to update their own passwords on the target OU",
      "Create a GPO that sets the backup directory, password age, and length",
      "Link the GPO and let the computers refresh policy",
      "Retrieve a password with Get-LapsADPassword to confirm it was stored",
      "Review who can read passwords and consider a post-authentication reset action"
    ]
  },
  {
    "id": "kerberoasting-response-scenario",
    "core": "core1",
    "domain": "ws6",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "A burst of service ticket requests targets a SQL service account",
    "summary": "Recognize likely Kerberoasting, contain it, and harden the account and the domain.",
    "brief": "The SIEM flagged unusual Kerberos activity against the production SQL service account. Work the incident by choosing your action at each step.",
    "explanation": "Kerberoasting requests tickets for accounts with service principal names and cracks them offline. Replace weak static passwords with managed accounts (gMSA or dMSA), require AES, and alert on unusual 4769 bursts.",
    "ticket": {
      "subject": "Unusual service ticket requests for the SQL service account",
      "details": [
        "Reported by: SIEM",
        "Many event 4769 requests for MSSQLSvc/sql01 from one workstation, outside working hours",
        "Tickets requested with the RC4 encryption type",
        "The svc-sql password was last set in 2019"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What is the best first action?",
        "options": [
          {
            "label": "Treat it as a likely Kerberoasting attempt: isolate the workstation and plan to rotate the service account password",
            "next": "step2",
            "correct": true
          },
          {
            "label": "Ignore it, because event 4769 is a normal event",
            "next": "end_bad_ignore",
            "correct": false
          },
          {
            "label": "Stop the SQL Server service",
            "next": "end_bad_stop",
            "correct": false
          }
        ]
      },
      "step2": {
        "prompt": "The workstation is isolated. What should happen to the service account?",
        "options": [
          {
            "label": "Reset its password to a long random value now, and move the service to a gMSA or dMSA so the password is managed and not crackable",
            "next": "step3",
            "correct": true
          },
          {
            "label": "Add it to Domain Admins so it cannot be locked out",
            "next": "end_bad_admin",
            "correct": false
          },
          {
            "label": "Leave the password as is because tickets are encrypted",
            "next": "end_bad_leave",
            "correct": false
          }
        ]
      },
      "step3": {
        "prompt": "Which hardening reduces the chance of a repeat?",
        "options": [
          {
            "label": "Require AES for Kerberos, disable RC4, and alert on bursts of 4769 events for accounts with service principal names",
            "next": "end_good",
            "correct": true
          },
          {
            "label": "Raise the account lockout threshold",
            "next": "end_bad_lockout",
            "correct": false
          }
        ]
      },
      "end_good": {
        "end": true,
        "success": true,
        "prompt": "Kerberoasting cracks service tickets offline, so a weak, old password is the real exposure. Isolating the source, replacing the password with a managed account, and moving to AES with monitoring close the gap."
      },
      "end_bad_ignore": {
        "end": true,
        "success": false,
        "prompt": "Event 4769 is normal in isolation, but a burst for one service principal name from one workstation with RC4 tickets is the classic signature."
      },
      "end_bad_stop": {
        "end": true,
        "success": false,
        "prompt": "Stopping the service causes an outage and does nothing about the tickets, which can already be cracked offline."
      },
      "end_bad_admin": {
        "end": true,
        "success": false,
        "prompt": "Granting privilege to a service account whose password may be cracked makes the compromise far worse."
      },
      "end_bad_leave": {
        "end": true,
        "success": false,
        "prompt": "Ticket encryption does not help here: the attacker cracks the ticket offline, so a weak password remains the weakness."
      },
      "end_bad_lockout": {
        "end": true,
        "success": false,
        "prompt": "Lockout does not apply, because offline cracking makes no failed sign-in attempts."
      }
    }
  },
  {
    "id": "ad-restore-terminal",
    "core": "core1",
    "domain": "ws7",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Restore a deleted organizational unit with the AD Recycle Bin",
    "summary": "Confirm the Recycle Bin is on, find the deleted OU, restore it, and verify.",
    "brief": "The Marketing organizational unit in contoso.com was deleted by mistake. The Active Directory Recycle Bin should be enabled. Type commands exactly, or use an accepted equivalent.",
    "explanation": "With the Recycle Bin enabled, deleted objects keep all their attributes and can be restored with Restore-ADObject during the deleted object lifetime. Restore a parent container before its children, and enable the feature before you need it, because it is irreversible.",
    "terminal": [
      {
        "prompt": "Check that the Recycle Bin optional feature exists and is enabled.",
        "accepts": [
          "Get-ADOptionalFeature 'Recycle Bin Feature'",
          "Get-ADOptionalFeature \"Recycle Bin Feature\"",
          "Get-ADOptionalFeature -Identity 'Recycle Bin Feature'"
        ],
        "output": "Name: Recycle Bin Feature   EnabledScopes: {CN=Partitions...}   IsDisableable: False",
        "hint": "Use Get-ADOptionalFeature with the Recycle Bin Feature name."
      },
      {
        "prompt": "List the deleted objects in the directory.",
        "accepts": [
          "Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects",
          "Get-ADObject -IncludeDeletedObjects -Filter 'isDeleted -eq $true'"
        ],
        "output": "Name                       ObjectClass\nMarketing\\0ADEL:...        organizationalUnit",
        "hint": "Use Get-ADObject with -IncludeDeletedObjects and a filter on isDeleted."
      },
      {
        "prompt": "Restore the deleted Marketing OU by filtering for its name with an LDAP filter and piping to the restore cmdlet.",
        "accepts": [
          "Get-ADObject -LDAPFilter '(&(isDeleted=TRUE)(name=Marketing*))' -IncludeDeletedObjects | Restore-ADObject",
          "Get-ADObject -IncludeDeletedObjects -LDAPFilter '(&(isDeleted=TRUE)(name=Marketing*))' | Restore-ADObject"
        ],
        "output": "The deleted object was restored: OU=Marketing,DC=contoso,DC=com",
        "hint": "Pipe Get-ADObject -LDAPFilter (with -IncludeDeletedObjects) to Restore-ADObject."
      },
      {
        "prompt": "Verify that the OU exists again.",
        "accepts": [
          "Get-ADOrganizationalUnit -Identity 'OU=Marketing,DC=contoso,DC=com'",
          "Get-ADOrganizationalUnit -Identity \"OU=Marketing,DC=contoso,DC=com\""
        ],
        "output": "DistinguishedName: OU=Marketing,DC=contoso,DC=com   Name: Marketing",
        "hint": "Use Get-ADOrganizationalUnit with the OU distinguished name."
      }
    ],
    "commands": [
      {
        "cmd": "Get-ADOptionalFeature",
        "desc": "Check whether the Recycle Bin is enabled"
      },
      {
        "cmd": "Get-ADObject -IncludeDeletedObjects",
        "desc": "Find deleted objects"
      },
      {
        "cmd": "Restore-ADObject",
        "desc": "Restore a deleted object (parents before children)"
      },
      {
        "cmd": "Get-ADOrganizationalUnit",
        "desc": "Confirm an OU exists"
      }
    ]
  },
  {
    "id": "monitoring-decision",
    "core": "core1",
    "domain": "ws7",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Choose the right Azure Monitor and Windows Server monitoring tools",
    "summary": "Match metrics, the Azure Monitor Agent, log search alerts, and System Insights to four monitoring jobs.",
    "brief": "You are building monitoring for hybrid Windows Server machines. For each job, choose the tool that fits.",
    "explanation": "Use metrics for fast numeric alerting, the Azure Monitor Agent with data collection rules for collection, log search alerts with action groups for query-based alerting, and System Insights for on-server forecasts with automatic remediation.",
    "stages": [
      {
        "question": "Chart CPU percentage in near real time and alert within a minute when it stays above 85 percent.",
        "options": [
          "A metric alert rule on Azure Monitor metrics",
          "A Log Analytics query alert",
          "An Automation runbook schedule"
        ],
        "correct": 0,
        "feedback": "Metrics are fast numeric values that suit near real-time charts and quick alerts."
      },
      {
        "question": "Collect event logs and performance counters from on-premises Arc-enabled servers into one queryable store.",
        "options": [
          "The retired Log Analytics agent",
          "Windows Event Forwarding only",
          "The Azure Monitor Agent with a data collection rule and a Log Analytics workspace"
        ],
        "correct": 2,
        "feedback": "The Azure Monitor Agent, driven by data collection rules, replaced the Log Analytics agent and sends data to a workspace."
      },
      {
        "question": "Alert when a query finds more than five failed sign-ins in ten minutes, email the team, and start a runbook.",
        "options": [
          "A metric alert with no action group",
          "A log search alert rule with an action group",
          "A Performance Monitor data collector set"
        ],
        "correct": 1,
        "feedback": "A log search alert runs a query on a schedule, and an action group supplies the email and the runbook."
      },
      {
        "question": "Predict that a volume will run out of space and run a cleanup script automatically when the forecast turns critical.",
        "options": [
          "Resource Monitor",
          "System Insights with a remediation action",
          "Reliability Monitor"
        ],
        "correct": 1,
        "feedback": "System Insights forecasts capacity on the server and can run a script when a forecast reaches a chosen status."
      }
    ]
  },
  {
    "id": "dc-authoritative-restore-sequence",
    "core": "core1",
    "domain": "ws7",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Recover deleted Active Directory objects with an authoritative restore",
    "summary": "Order the steps so restored objects overwrite the deleted state on the other domain controllers.",
    "brief": "Objects were deleted and replicated, and the Recycle Bin was not enabled. Restore them from a system state backup so that they replicate back out. Arrange the steps from first to last.",
    "explanation": "An authoritative restore raises the version numbers of the restored objects so they overwrite the deleted copies on other domain controllers. It is performed in Directory Services Restore Mode, before a normal restart, and then verified with repadmin.",
    "steps": [
      "Boot the domain controller into Directory Services Restore Mode",
      "Restore the most recent system state backup that contains the deleted objects",
      "Mark the deleted subtree as authoritative with ntdsutil",
      "Restart the domain controller normally",
      "Let replication carry the restored objects to the other domain controllers",
      "Verify with repadmin /replsummary and check that the objects are back"
    ]
  }
  ];
})();
