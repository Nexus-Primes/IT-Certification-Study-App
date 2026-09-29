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
  }
  ];
})();
