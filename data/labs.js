(function () {
  'use strict';
  window.APLUS_LABS = [
  {
    "id": "esd-safe-repair",
    "core": "core1",
    "domain": "c1d3",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Prep a desktop for safe internal repair",
    "summary": "Put the pre-repair safety and shutdown steps into the correct order.",
    "brief": "A technician is about to replace a failing case fan inside a running desktop. Arrange the preparation steps from first to last, before any screws come out.",
    "steps": [
      "Save the user's open work and close applications",
      "Properly shut down the operating system",
      "Unplug the power cable from the wall or PSU",
      "Press the power button briefly to drain residual power",
      "Put on an ESD wrist strap and clip it to a grounded point",
      "Open the case and locate the failing fan"
    ],
    "explanation": "Work is saved and the OS shut down cleanly first, power is fully removed and drained next, and only then is ESD protection put on before the case is opened \u2014 protecting both the user's data and the hardware."
  },
  {
    "id": "gpu-no-boot",
    "core": "core1",
    "domain": "c1d5",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Desktop won't display video after a GPU swap",
    "summary": "Work through the evidence after a graphics card upgrade instead of guessing.",
    "brief": "A desktop worked fine before a new graphics card was installed. Now the system powers on and fans spin, but there is no video output on any port, and the monitor itself has already been confirmed working on another PC.",
    "stages": [
      {
        "question": "What is the best first action given the timing of the failure?",
        "options": [
          "Reseat the new graphics card and confirm its power connectors are fully seated",
          "Replace the monitor again",
          "Reinstall the operating system",
          "Replace the power supply immediately"
        ],
        "correct": 0,
        "feedback": "The fault appeared immediately after installing the new card, so checking its seating and power connectors is the most direct, lowest-risk first step."
      },
      {
        "question": "Reseating and power connectors look correct, but there's still no video. What should be checked next?",
        "options": [
          "Whether the motherboard's onboard video output works instead, to isolate the GPU as the cause",
          "The Wi-Fi adapter",
          "The printer driver",
          "The CMOS battery only"
        ],
        "correct": 0,
        "feedback": "If onboard video works but the discrete GPU's ports don't, that isolates the fault to the graphics card rather than the rest of the system."
      },
      {
        "question": "Onboard video works fine, but the new GPU still shows nothing on any port. What is the best conclusion?",
        "options": [
          "The new graphics card itself is likely defective or DOA",
          "The RAM needs to be replaced",
          "The issue is a corrupted Windows installation",
          "The Wi-Fi card is causing the video fault"
        ],
        "correct": 0,
        "feedback": "With power, seating, and the rest of the system confirmed good via the onboard video test, the graphics card itself is the most likely remaining cause."
      }
    ],
    "explanation": "Following the timing of the change, checking seating and power first, then isolating the GPU with a known-good onboard video test, narrows the fault down without guessing or swapping unrelated parts."
  },
  {
    "id": "apipa-client-triage",
    "core": "core1",
    "domain": "c1d2",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Bring a self-assigned client back online",
    "summary": "Use a simulated Windows prompt to fix a PC stuck on an APIPA address.",
    "brief": "A desktop can't reach anything on the network or internet. At the prompt, run the right commands in order to diagnose and fix it. Type commands exactly, or use an accepted equivalent switch.",
    "terminal": [
      {
        "prompt": "Start by viewing the full current IP configuration.",
        "accepts": [
          "ipconfig /all"
        ],
        "output": "Ethernet adapter Ethernet:\n   IPv4 Address . . . . . : 169.254.31.9\n   Subnet Mask  . . . . . : 255.255.0.0\n   Default Gateway . . .  :\n   DHCP Enabled . . . . . : Yes",
        "hint": "Use the Windows IP configuration command with the switch that shows full adapter detail."
      },
      {
        "prompt": "That's a self-assigned address. The DHCP server on the network was just brought back online. Release the current lease.",
        "accepts": [
          "ipconfig /release",
          "ipconfig -release"
        ],
        "output": "Windows IP Configuration\nThe current address has been released.",
        "hint": "Release the current automatic address before requesting a new one."
      },
      {
        "prompt": "Now request a fresh lease from DHCP.",
        "accepts": [
          "ipconfig /renew",
          "ipconfig -renew"
        ],
        "output": "IPv4 Address . . . . . : 10.10.4.112\nDefault Gateway . . .  : 10.10.4.1\nLease Obtained . . . . : Successful",
        "hint": "Renew the DHCP lease now that a server is reachable again."
      },
      {
        "prompt": "Confirm the client can now reach the default gateway.",
        "accepts": [
          "ping 10.10.4.1"
        ],
        "output": "Reply from 10.10.4.1: bytes=32 time<1ms TTL=64\nPackets: Sent = 4, Received = 4, Lost = 0",
        "hint": "Send ICMP echo requests to the gateway address to confirm basic reachability."
      }
    ],
    "commands": [
      { "cmd": "ipconfig /all", "desc": "Display full IP configuration for every adapter" },
      { "cmd": "ipconfig /release", "desc": "Release the current DHCP lease" },
      { "cmd": "ipconfig /renew", "desc": "Request a new DHCP lease" },
      { "cmd": "ping", "desc": "Send ICMP echo requests to test reachability" },
      { "cmd": "ipconfig /flushdns", "desc": "Clear the local DNS resolver cache" },
      { "cmd": "nslookup", "desc": "Query DNS records for a hostname" },
      { "cmd": "tracert", "desc": "Trace the network path to a destination" }
    ],
    "explanation": "A 169.254.x.x address means DHCP was unreachable when the client last requested an address. Once the DHCP server is confirmed back online, releasing the stale lease and renewing gets the client a real address, and pinging the gateway confirms the fix actually worked."
  },
  {
    "id": "laser-imaging-cycle",
    "core": "core1",
    "domain": "c1d3",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 6,
    "title": "Rebuild the laser printing cycle",
    "summary": "Put the six stages of laser printing back in their correct order.",
    "brief": "A trainee is learning how a laser printer turns a print job into a finished page. Arrange the six imaging stages in the order they actually occur.",
    "steps": [
      "Charging",
      "Exposing",
      "Developing",
      "Transferring",
      "Fusing",
      "Cleaning"
    ],
    "explanation": "The drum is charged, the laser exposes a latent image onto it, toner develops that image, the toner is transferred onto the paper, heat and pressure fuse it permanently, and the drum is cleaned of leftover toner so it's ready for the next page."
  },
  {
    "id": "phishing-compromise-response",
    "core": "core2",
    "domain": "c2d2",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Respond to a phishing-triggered compromise",
    "summary": "Sequence containment, cleanup, and follow-up after a user clicks a malicious link.",
    "brief": "A user reports clicking a link in a suspicious email, and their machine is now behaving strangely with unfamiliar outbound network activity. Arrange the high-level response in the correct order.",
    "steps": [
      "Isolate the affected machine from the network",
      "Investigate symptoms using trusted, up-to-date sources",
      "Disable System Restore if the remediation procedure calls for it",
      "Remove the threat with current trusted tools, or rebuild the system",
      "Update definitions and run a full scan to confirm the system is clean",
      "Re-enable protections and create a new clean restore point",
      "Document the incident and educate the user"
    ],
    "explanation": "Isolating the machine first stops further spread. Investigation and disabling System Restore prepare for a clean removal, remediation actually clears the threat, and re-enabling protections plus documentation and user education close the loop so it's less likely to happen again."
  },
  {
    "id": "windows-file-repair",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "Repair a Windows install with corrupted system files",
    "summary": "Use the right sequence of repair utilities in a simulated elevated prompt.",
    "brief": "A Windows PC has been unstable since an update was interrupted by a power outage. Network connectivity is restored. Run the correct repair tools in the correct order at the elevated prompt.",
    "terminal": [
      {
        "prompt": "First, repair the online Windows component store itself.",
        "accepts": [
          "dism /online /cleanup-image /restorehealth",
          "dism.exe /online /cleanup-image /restorehealth"
        ],
        "output": "Deployment Image Servicing and Management\nThe restore operation completed successfully.\nThe operation completed successfully.",
        "hint": "Use DISM against the online image with the restore-health option."
      },
      {
        "prompt": "Now scan and repair protected system files using that repaired component store.",
        "accepts": [
          "sfc /scannow",
          "sfc.exe /scannow"
        ],
        "output": "Windows Resource Protection found corrupt files and successfully repaired them.",
        "hint": "Use System File Checker with the scan-now option."
      },
      {
        "prompt": "Finally, schedule a check of the C: volume for filesystem errors on next restart.",
        "accepts": [
          "chkdsk c: /f",
          "chkdsk c /f"
        ],
        "output": "Chkdsk cannot run because the volume is in use. Schedule this volume to be checked the next time the system restarts? (Y/N)",
        "hint": "Use chkdsk with the repair/fix switch."
      }
    ],
    "commands": [
      { "cmd": "dism /online /cleanup-image /restorehealth", "desc": "Repair the Windows component store using Windows Update as the source" },
      { "cmd": "sfc /scannow", "desc": "Scan and repair protected system files" },
      { "cmd": "chkdsk c: /f", "desc": "Check and fix errors on the C: volume on next restart" },
      { "cmd": "bootrec /fixmbr", "desc": "Rewrite the master boot record on the system disk" },
      { "cmd": "gpupdate /force", "desc": "Immediately reapply Group Policy settings" },
      { "cmd": "diskpart", "desc": "Open the disk partitioning utility" }
    ],
    "explanation": "DISM repairs the underlying component store, SFC then uses that healthy store to fix protected system files, and chkdsk separately addresses the filesystem itself rather than Windows components \u2014 running them in this order gives each tool a good foundation to work from."
  },
  {
    "id": "firewall-change-plan",
    "core": "core2",
    "domain": "c2d4",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Plan a firewall firmware change safely",
    "summary": "Build a properly scoped change request for a security-critical update.",
    "brief": "A vendor released firmware that patches a critical vulnerability in the office firewall, but applying it requires a brief restart and could affect connectivity during the update.",
    "stages": [
      {
        "question": "What must the change request document before anyone approves it?",
        "options": [
          "Scope, risk, a test plan, and a backout plan",
          "Just the firmware version number",
          "Just who is doing the work",
          "Nothing \u2014 critical patches should be applied instantly"
        ],
        "correct": 0,
        "feedback": "Approvers need to understand exactly what's affected, what could go wrong, how it will be validated, and how to undo it if needed."
      },
      {
        "question": "When should this change actually be performed?",
        "options": [
          "During an approved maintenance window, with affected users notified in advance",
          "Immediately, during business hours",
          "Whenever it's convenient for the technician",
          "Without telling anyone, to avoid alarming staff"
        ],
        "correct": 0,
        "feedback": "A scheduled, communicated maintenance window minimizes business disruption and avoids confusing unannounced outages."
      },
      {
        "question": "After the update, the firewall fails its post-change health checks. What's the correct move?",
        "options": [
          "Execute the documented backout plan and confirm service is restored",
          "Keep making unplanned changes to try to fix it live",
          "Leave it broken until the next scheduled window",
          "Delete the change record so it isn't tracked"
        ],
        "correct": 0,
        "feedback": "A predefined backout plan restores known-good service quickly, rather than risking further, undocumented changes under pressure."
      }
    ],
    "explanation": "Good change management makes scope, risk, timing, communication, and rollback explicit before a single command is run \u2014 especially for something as critical as a firewall update."
  },
  {
    "id": "small-studio-backup-plan",
    "core": "core2",
    "domain": "c2d4",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Fix a fragile one-copy backup setup",
    "summary": "Redesign a backup strategy that would fail under theft, fire, or ransomware.",
    "brief": "A three-person design studio keeps every client file on one workstation, with a single USB backup drive that stays plugged in beside it at all times.",
    "stages": [
      {
        "question": "What single change addresses the biggest structural weakness here?",
        "options": [
          "Add a third, offsite copy following the 3-2-1 rule",
          "Buy a bigger USB drive",
          "Turn on RAID 0 for more speed",
          "Rename the backup folder"
        ],
        "correct": 0,
        "feedback": "Three total copies, on two different media types, with one stored offsite, protects against local disasters and single-point failures like theft or fire that a same-room backup can't survive."
      },
      {
        "question": "The studio says they can tolerate losing at most 4 hours of work if disaster strikes. What does that define?",
        "options": [
          "A 4-hour Recovery Point Objective (RPO)",
          "A 4-hour Recovery Time Objective (RTO)",
          "A 4-hour warranty period",
          "A 4-hour support SLA"
        ],
        "correct": 0,
        "feedback": "RPO defines the maximum acceptable data loss, measured in time \u2014 it tells you how frequently backups or replication need to run."
      },
      {
        "question": "How can the studio actually prove the new plan will work in a real emergency?",
        "options": [
          "Periodically perform real restore tests and document the results",
          "Trust the backup software's success emails alone",
          "Keep the backup drive connected permanently for convenience",
          "Assume any cloud folder counts as a backup"
        ],
        "correct": 0,
        "feedback": "A backup is only proven to work once it has actually been restored successfully \u2014 success notifications alone don't guarantee usable, recoverable data."
      }
    ],
    "explanation": "A resilient backup plan isolates copies appropriately, is sized to the business's actual recovery objectives, and is regularly proven through real restore testing rather than assumed to work."
  },
  {
    "id": "wifi-dropout-scenario",
    "core": "core1",
    "domain": "c1d5",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "Intermittent Wi-Fi dropouts in a small office",
    "summary": "Work an evidence-based troubleshooting ticket through to a real root cause, not a guess.",
    "brief": "Wireless clients across the office lose connection for about 30 seconds every afternoon. Wired clients are never affected. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "Office Wi-Fi drops every afternoon",
      "details": [
        "Reported by: Front desk staff",
        "Symptom: all wireless clients lose connection for about 30 seconds, roughly 1-3pm daily",
        "Wired clients are unaffected"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the best first step to characterize this problem?",
        "options": [
          { "label": "Check the wireless AP's channel and look for interference around the reported time window", "next": "step2", "correct": true },
          { "label": "Immediately replace the access point", "next": "end_bad_replace", "correct": false },
          { "label": "Tell users to switch to a wired connection permanently", "next": "end_bad_workaround", "correct": false }
        ]
      },
      "step2": {
        "prompt": "A spectrum scan around 1-3pm shows a strong recurring signal spike on the same 2.4GHz channel as the office Wi-Fi, from something that isn't another AP. What's the best next step?",
        "options": [
          { "label": "Suspect a non-Wi-Fi interferer and correlate the timing with a physical walk-through", "next": "step3", "correct": true },
          { "label": "Assume it's a router firmware bug and immediately factory reset it", "next": "end_bad_reset", "correct": false }
        ]
      },
      "step3": {
        "prompt": "The walk-through confirms a break-room microwave is heavily used 1-3pm, and its interference overlaps the AP's fixed channel. What's the best permanent fix?",
        "options": [
          { "label": "Move the AP to 5GHz (or a cleaner 2.4GHz channel) and enable band steering if supported", "next": "end_good", "correct": true },
          { "label": "Ask staff to stop using the microwave during business hours", "next": "end_bad_policy", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Switching the AP to 5GHz (or a clean 2.4GHz channel) with band steering eliminates the interference without disrupting anyone's workflow." },
      "end_bad_replace": { "end": true, "success": false, "prompt": "Replacing hardware before confirming the actual cause wastes budget. The symptom is time-correlated, not device-correlated, so a new AP would fail the same way." },
      "end_bad_workaround": { "end": true, "success": false, "prompt": "Removing everyone's Wi-Fi doesn't fix the interference, it just relocates the inconvenience. Evidence-based troubleshooting starts with identifying the cause." },
      "end_bad_reset": { "end": true, "success": false, "prompt": "A factory reset erases configuration and has nothing to do with a physical-layer interference problem that happens at a fixed time every day." },
      "end_bad_policy": { "end": true, "success": false, "prompt": "Asking staff to change behavior is a fragile fix that depends on constant compliance. Moving to a non-overlapping channel or band solves it at the technical layer instead." }
    },
    "explanation": "Time-correlated wireless dropouts that only affect Wi-Fi, not wired clients, point to RF interference rather than a hardware failure. Following the evidence, logs, a spectrum scan, then a physical walk-through, identifies the real source before any change is made, and a band or channel change fixes it without asking anyone to alter their behavior."
  },
  {
    "id": "runaway-process-terminal",
    "core": "core2",
    "domain": "c2d3",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Find and stop a runaway process eating all the CPU",
    "summary": "Use a simulated command prompt to identify and stop the exact process causing a system slowdown.",
    "brief": "A user's laptop fan is running at full speed and the system is sluggish. At the prompt, run the right commands in order to identify and stop the process responsible.",
    "terminal": [
      {
        "prompt": "List running processes so you can spot the one using far more resources than everything else.",
        "accepts": ["tasklist"],
        "output": "Image Name          PID   Mem Usage\nsvchost.exe         1102  18,220 K\nexplorer.exe        2044  61,408 K\nbadapp.exe          4821  612,340 K",
        "hint": "Use tasklist to see running processes and their memory usage."
      },
      {
        "prompt": "badapp.exe (PID 4821) is using far more memory than everything else combined, and the fan is maxed. End that specific process by PID, forcefully.",
        "accepts": ["taskkill /pid 4821 /f", "taskkill /PID 4821 /F"],
        "output": "SUCCESS: The process with PID 4821 has been terminated.",
        "hint": "Use taskkill with the /PID switch and /F to force it."
      },
      {
        "prompt": "Confirm it's actually gone from the process list.",
        "accepts": ["tasklist"],
        "output": "Image Name          PID   Mem Usage\nsvchost.exe         1102  18,220 K\nexplorer.exe        2044  61,408 K",
        "hint": "Re-run tasklist to confirm badapp.exe is no longer listed."
      }
    ],
    "commands": [
      { "cmd": "tasklist", "desc": "List running processes and their memory usage" },
      { "cmd": "taskkill /pid <PID> /f", "desc": "Forcefully terminate a process by its PID" },
      { "cmd": "netstat -an", "desc": "Show active network connections and listening ports" },
      { "cmd": "shutdown /r /t 0", "desc": "Restart the computer immediately" },
      { "cmd": "sfc /scannow", "desc": "Scan and repair protected system files" }
    ],
    "explanation": "tasklist surfaces exactly which process is consuming resources, targeting taskkill at that specific PID, rather than guessing or rebooting, stops only the offending process, and re-checking confirms the fix actually worked instead of assuming it did."
  },
  {
    "id": "network-settings-gui",
    "core": "core2",
    "domain": "c2d1",
    "type": "gui",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Fix a laptop stuck on the wrong network settings",
    "summary": "Navigate a simulated Windows network settings panel to restore normal connectivity, rather than answering questions about it.",
    "brief": "A laptop can connect to Wi-Fi but can't reliably reach internal file shares or the internet. Use the simulated Settings app to find and fix the misconfiguration.",
    "app": "Windows Settings — Network & Internet",
    "goal": "Get this laptop back on the corporate network with a normal, working configuration.",
    "reference": {
      "title": "Corporate Laptop Configuration Standard (IT-014)",
      "paragraphs": [
        "All company-issued laptops must remain connected to the primary corporate wireless network, CorpNet-5G, for normal operation. The guest network, CorpNet-Guest, is isolated from internal resources including file shares and is intended only for visitor devices; an unrecognized or personal network such as a neighboring household's connection must never be used.",
        "Company laptops must obtain their IP configuration automatically via DHCP at all times — manually assigned or leftover self-configured addresses are a common cause of intermittent connectivity and are not supported by the helpdesk. Metered connection mode must remain off on all company laptops, since enabling it silently pauses background sync jobs including file share replication, which is often mistaken for a network outage.",
        "Wi-Fi should remain enabled at all times except during authorized hardware service."
      ]
    },
    "tabs": ["wifi", "ipconfig"],
    "panels": {
      "wifi": {
        "label": "Wi-Fi",
        "controls": [
          { "id": "wifi-power", "kind": "toggle", "label": "Wi-Fi", "initial": true },
          { "id": "network", "kind": "select", "label": "Connected network", "options": ["CorpNet-5G", "CorpNet-Guest", "Neighbor-Unsecured"], "initial": "CorpNet-Guest" },
          { "id": "metered", "kind": "toggle", "label": "Set as metered connection", "initial": true, "hint": "Metered mode can throttle or pause syncing to file shares." }
        ]
      },
      "ipconfig": {
        "label": "IP settings",
        "controls": [
          { "id": "ip-mode", "kind": "select", "label": "IP assignment", "options": ["Automatic (DHCP)", "Manual"], "initial": "Manual" },
          { "id": "static-ip", "kind": "text", "label": "IP address (only used if Manual)", "initial": "169.254.12.4", "placeholder": "e.g. 10.10.4.50" }
        ]
      }
    },
    "requirements": [
      { "controlId": "wifi-power", "equals": true, "label": "Wi-Fi is on.", "hint": "Wi-Fi needs to stay on." },
      { "controlId": "network", "equals": "CorpNet-5G", "label": "Connected to the corporate network.", "hint": "This laptop is on the guest network, switch it to CorpNet-5G so internal shares are reachable." },
      { "controlId": "metered", "equals": false, "label": "Metered connection is off.", "hint": "Turn off metered connection so file shares can sync normally." },
      { "controlId": "ip-mode", "equals": "Automatic (DHCP)", "label": "IP assignment is automatic.", "hint": "Switch IP assignment back to Automatic (DHCP) — that stale, APIPA-looking static address is the connectivity problem." }
    ],
    "explanation": "The laptop was on the guest network, which is isolated from internal shares, set to metered, which throttles background sync, and pinned to a stale manual IP address that looked like an old leftover APIPA-style address. Fixing the network, disabling metered mode, and switching back to DHCP addresses each contributing cause instead of just one."
  },
  {
    "id": "cracked-tablet-no-touch",
    "core": "core1",
    "domain": "c1d1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "A cracked tablet lights up, but nothing responds to touch",
    "summary": "Separate a touch-input fault from a display fault on a mobile device, then judge the right repair.",
    "brief": "A tablet was dropped and the glass is now visibly cracked. The screen still shows a normal, undistorted image at full brightness, but nothing on the screen responds to touch anywhere on the surface.",
    "stages": [
      {
        "question": "Given a normal image but zero response anywhere to touch, which component is the most likely point of failure?",
        "options": [
          "The digitizer",
          "The LCD panel",
          "The backlight inverter",
          "The ambient light sensor"
        ],
        "correct": 0,
        "feedback": "The image is completely normal, which rules out the LCD panel and backlight — only the digitizer, the transparent touch-sensing layer over the glass, converts contact into input, and a hard drop is a classic way to crack or disconnect it."
      },
      {
        "question": "Given the digitizer diagnosis, what's the realistic repair path on a modern tablet?",
        "options": [
          "Replace the fused display assembly, since the digitizer and LCD are typically bonded together as one unit",
          "Reinstall the touch-screen driver in the operating system",
          "Replace only the ambient light sensor",
          "Recalibrate the digitizer in the device's touch settings"
        ],
        "correct": 0,
        "feedback": "This is physical damage from a drop, not a software or calibration problem, and on most modern tablets and laptops the digitizer ships fused to the LCD as a single sealed assembly, so the repair is a full display swap rather than sourcing the digitizer alone."
      },
      {
        "question": "A different laptop shows a screen that's almost totally black, but a very faint image is visible when a flashlight is shone directly at it. Touch and an external monitor both work fine. What's the best diagnosis this time?",
        "options": [
          "A failed backlight",
          "A failed digitizer",
          "A failed LCD panel",
          "A bad display data cable"
        ],
        "correct": 0,
        "feedback": "An image that's present but only visible under direct light means the panel itself is intact and rendering correctly — only the backlight that's supposed to illuminate it from behind has failed, which is a different fault entirely from the touch-only failure in the tablet case."
      }
    ],
    "explanation": "Three different-looking symptoms map to three different components: no touch with a perfect image points to the digitizer, a faint image that needs outside light points to the backlight, and total blackness with no image at all even under light would point further, to the LCD panel or its data cable. Naming the right layer first is what keeps a repair from turning into an expensive guess."
  },
  {
    "id": "match-the-virtualization-approach",
    "core": "core1",
    "domain": "c1d4",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Matching the right virtualization approach to three different jobs",
    "summary": "Pick the right hypervisor, VDI, or sandbox approach for three workloads without over- or under-provisioning.",
    "brief": "An IT team has three separate requests this week and needs to choose the right virtualization or cloud approach for each one.",
    "stages": [
      {
        "question": "A developer wants to test a suspicious downloaded installer without risking their real laptop, and only needs it running for a few minutes before discarding it.",
        "options": [
          "A disposable sandbox VM",
          "A Type 1 hypervisor on a dedicated server",
          "VDI",
          "A container"
        ],
        "correct": 0,
        "feedback": "The goal is short-lived isolation for something untrusted, which is exactly what a sandbox is for — spinning up dedicated server infrastructure or a centrally managed desktop is far more than a five-minute throwaway test needs."
      },
      {
        "question": "Office staff need to access a full, centrally managed Windows desktop from cheap thin-client devices scattered around the building, with IT maintaining just one master image.",
        "options": [
          "VDI",
          "A Type 2 hypervisor on each thin client",
          "SaaS",
          "A sandbox"
        ],
        "correct": 0,
        "feedback": "One centrally managed desktop image streamed out to lightweight endpoints is the definition of VDI — running a hypervisor locally on each thin client would defeat the entire point of centralizing management."
      },
      {
        "question": "A data center needs to run a dozen production VMs on one dedicated server with the best possible performance, and there's no existing host operating system to build on.",
        "options": [
          "A Type 1 hypervisor",
          "A Type 2 hypervisor",
          "A container runtime",
          "VDI"
        ],
        "correct": 0,
        "feedback": "With no host OS in the picture and performance as the priority, a Type 1 hypervisor installed directly on the bare metal avoids the overhead a Type 2 hypervisor would add by running on top of a full host OS first."
      }
    ],
    "explanation": "Each workload has a different priority — the sandbox trades performance for disposable isolation, VDI trades local hardware cost for centralized desktop management, and a Type 1 hypervisor trades host-OS convenience for maximum dedicated-server performance. Matching the approach to the actual priority is what separates a well-run virtualization environment from one that's either overspending or under-isolated."
  },
  {
    "id": "linux-permissions-fix",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Fix ownership and permissions on a shared Linux script",
    "summary": "Use a simulated Linux shell to hand a deploy script back to the right owner and group.",
    "brief": "A deployment script on a Linux server still belongs to a former employee's account, and the current DevOps group can't execute it. At the prompt, run the right commands in order to fix it.",
    "terminal": [
      {
        "prompt": "First, check the file's current owner, group, and permissions.",
        "accepts": ["ls -l deploy.sh", "ls -la deploy.sh", "ls -al deploy.sh", "ls -l", "ls -la", "ls -al"],
        "output": "-rw-r--r-- 1 jdoe devops 1024 Aug 2 10:03 deploy.sh",
        "hint": "Use the long-listing option to see permissions, owner, and group together."
      },
      {
        "prompt": "jdoe no longer works here. Change the file's owner to msmith, keeping the devops group.",
        "accepts": ["chown msmith deploy.sh", "chown msmith:devops deploy.sh", "sudo chown msmith deploy.sh", "sudo chown msmith:devops deploy.sh"],
        "output": "Ownership of 'deploy.sh' retained as msmith:devops",
        "hint": "Use chown to change the owner; you can specify owner:group in one command. On a real system this needs sudo, but this simulated shell is already running as an admin."
      },
      {
        "prompt": "Now make the script executable for both the owner and the devops group, without changing anything else about it.",
        "accepts": ["chmod ug+x deploy.sh", "chmod 754 deploy.sh", "chmod +x deploy.sh", "sudo chmod ug+x deploy.sh", "sudo chmod 754 deploy.sh", "sudo chmod +x deploy.sh"],
        "output": "-rwxr-xr-- 1 msmith devops 1024 Aug 2 10:03 deploy.sh",
        "hint": "Add the execute bit for user and group with chmod, or set the equivalent numeric mode."
      }
    ],
    "commands": [
      { "cmd": "ls -l", "desc": "List files with permissions, owner, and group" },
      { "cmd": "chown", "desc": "Change a file's owner, and optionally its group" },
      { "cmd": "chmod", "desc": "Change a file's permission bits" },
      { "cmd": "sudo", "desc": "Run a single command with elevated privileges" },
      { "cmd": "rm -f", "desc": "Force-delete a file without confirmation" },
      { "cmd": "top", "desc": "Show a live view of running processes and resource usage" }
    ],
    "explanation": "ls -l shows exactly who owns the file and what its current permissions are before anything changes. chown hands ownership to the right current employee while keeping the correct group, and chmod then grants execute access to owner and group only — without touching read access for everyone else or opening it up further than the job requires."
  },
  {
    "id": "macos-runaway-process",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Stop a runaway process from a macOS Terminal",
    "summary": "Use ps and kill in a simulated macOS shell instead of Activity Monitor's GUI.",
    "brief": "A MacBook's fan is running constantly and the machine feels sluggish, even at an idle desktop. At the prompt, find and stop the process responsible.",
    "terminal": [
      {
        "prompt": "List running processes with their CPU usage so you can spot the one running away with resources.",
        "accepts": ["ps aux"],
        "output": "USER   PID  %CPU %MEM COMMAND\nroot     1   0.0  0.1 /sbin/launchd\njsmith 812  97.4  2.1 RunawayHelper\njsmith 900   0.3  0.5 Finder",
        "hint": "Use ps with the aux flags to see every process and its CPU/memory usage."
      },
      {
        "prompt": "RunawayHelper (PID 812) is pegging the CPU at over 97%. Forcefully terminate just that process.",
        "accepts": ["kill -9 812"],
        "output": "",
        "hint": "Use kill with signal 9 and the specific PID, not the process name."
      },
      {
        "prompt": "Confirm RunawayHelper is actually gone.",
        "accepts": ["ps aux"],
        "output": "USER   PID  %CPU %MEM COMMAND\nroot     1   0.0  0.1 /sbin/launchd\njsmith 900   0.3  0.5 Finder",
        "hint": "Re-run ps aux and check that PID 812 no longer appears."
      }
    ],
    "commands": [
      { "cmd": "ps aux", "desc": "List all running processes with CPU and memory usage" },
      { "cmd": "kill -9 <PID>", "desc": "Forcefully terminate a process by its PID" },
      { "cmd": "top", "desc": "Show a live, auto-updating view of process activity" },
      { "cmd": "lsof", "desc": "List files and network connections currently open by processes" },
      { "cmd": "nice", "desc": "Launch or adjust a process's scheduling priority" },
      { "cmd": "sudo", "desc": "Run a single command with elevated privileges" }
    ],
    "explanation": "ps aux surfaces exactly which process is consuming CPU, targeting kill -9 at that specific PID stops only the offending process instead of restarting the whole machine, and re-running ps aux confirms it's actually gone rather than just assuming the fan noise will stop on its own."
  },
  {
    "id": "workstation-hardening-checklist",
    "core": "core2",
    "domain": "c2d2",
    "type": "gui",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Harden a new hire's workstation before deployment",
    "summary": "Work through a simulated settings panel to bring a fresh laptop in line with the security standard before handing it over.",
    "brief": "A laptop is about to be issued to a new employee. Use the simulated settings panels to bring it into compliance with the workstation security standard before it leaves IT.",
    "app": "Windows Security & Settings",
    "goal": "Get this workstation fully compliant with the New Hire Workstation Hardening Standard before deployment.",
    "reference": {
      "title": "New Hire Workstation Hardening Standard (SEC-021)",
      "paragraphs": [
        "Every workstation issued to a new hire must have full-disk encryption enabled before it leaves IT custody. The built-in local Guest account is disabled on all company machines without exception, since it allows anonymous, unauditable access to the system.",
        "Windows Update must remain set to install updates automatically. Deferring or disabling updates indefinitely leaves known vulnerabilities unpatched and is not an approved configuration without a documented exception on file with security.",
        "The screen must lock automatically after 5 minutes of inactivity on every workstation, balancing convenience against the risk of an unattended, unlocked session sitting exposed."
      ]
    },
    "tabs": ["security", "lock"],
    "panels": {
      "security": {
        "label": "Security",
        "controls": [
          { "id": "bitlocker", "kind": "toggle", "label": "BitLocker drive encryption", "initial": false },
          { "id": "guest-account", "kind": "toggle", "label": "Guest account enabled", "initial": true, "hint": "The built-in Guest account should never remain enabled." },
          { "id": "updates", "kind": "select", "label": "Windows Update setting", "options": ["Automatic", "Notify only", "Disabled"], "initial": "Disabled" }
        ]
      },
      "lock": {
        "label": "Lock screen",
        "controls": [
          { "id": "lock-timeout", "kind": "select", "label": "Screen lock after inactivity", "options": ["1 minute", "5 minutes", "15 minutes", "Never"], "initial": "Never" }
        ]
      }
    },
    "requirements": [
      { "controlId": "bitlocker", "equals": true, "label": "BitLocker is enabled.", "hint": "Turn on BitLocker drive encryption before this workstation is deployed." },
      { "controlId": "guest-account", "equals": false, "label": "Guest account is disabled.", "hint": "Disable the built-in Guest account." },
      { "controlId": "updates", "equals": "Automatic", "label": "Windows Update is set to install automatically.", "hint": "Set Windows Update back to Automatic." },
      { "controlId": "lock-timeout", "equals": "5 minutes", "label": "Screen lock is set to 5 minutes.", "hint": "Set the screen lock timeout to 5 minutes, per policy." }
    ],
    "explanation": "The standard calls for encryption at rest, no anonymous local access, automatic patching, and a short unattended-session window — four independent controls that each close a different gap, which is why compliance checks every one of them rather than treating any single setting as good enough on its own."
  },
  {
    "id": "byod-mobile-security",
    "core": "core2",
    "domain": "c2d2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Bring a personal phone into the BYOD program safely",
    "summary": "Walk a personally-owned phone through enrollment, baseline controls, and a real loss event.",
    "brief": "An employee wants to use their personal Android phone to access corporate email under the company's BYOD program.",
    "stages": [
      {
        "question": "What has to happen before this personal phone is allowed to access corporate email?",
        "options": [
          "It must enroll in the company's MDM/MAM solution so corporate policy can be applied to it",
          "Nothing — personal devices are trusted automatically once email is configured",
          "The phone must be rooted first for IT to have full access",
          "IT should replace its OS with a corporate build"
        ],
        "correct": 0,
        "feedback": "BYOD only works safely once the device enrolls in mobile device or application management, which is what lets the company apply and enforce policy on a device it doesn't own outright."
      },
      {
        "question": "The phone is enrolled. What baseline control should be in place on it right away?",
        "options": [
          "A required screen lock (PIN or biometric) plus remote wipe capability",
          "A full nightly disk image of the entire phone",
          "Disabling all networking except while physically at the office",
          "Nothing further — enrollment alone is sufficient"
        ],
        "correct": 0,
        "feedback": "A required lock screen protects the device if it's lost for even a few minutes, and remote wipe gives the company a way to protect corporate data on a device it can't physically retrieve quickly."
      },
      {
        "question": "Three months later, the employee reports the phone was stolen. What's the correct immediate action?",
        "options": [
          "Trigger a remote wipe of corporate data (or the full device, per policy) through the MDM console",
          "Wait for the employee to buy a replacement phone first",
          "Call the stolen phone repeatedly",
          "Nothing can be done once a device leaves the building"
        ],
        "correct": 0,
        "feedback": "A remote wipe through the MDM console is exactly the scenario that baseline control exists for — it protects corporate data the moment a device is confirmed lost or stolen, without needing physical access to it."
      }
    ],
    "explanation": "BYOD safety is built in layers: enrollment first establishes that policy can be applied at all, a lock screen and remote wipe capability are the baseline controls that make that enrollment worth something, and actually triggering a wipe the moment a device is lost is what closes the loop when the real event happens."
  },
  {
    "id": "secure-wipe-terminal",
    "core": "core2",
    "domain": "c2d2",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Securely erase leftover data before reissuing a laptop",
    "summary": "Use the right Windows command to make deleted files truly unrecoverable, without wiping the OS.",
    "brief": "A former employee's files have already been backed up and deleted from a laptop being reissued to a new hire. Make sure none of that deleted data can be recovered from residual free space, without reformatting the drive or reinstalling Windows.",
    "terminal": [
      {
        "prompt": "First, confirm the former employee's old folder is actually empty before proceeding.",
        "accepts": ["dir C:\\Users\\jdoe\\Documents", "dir C:\\Users\\jdoe\\Documents\\", "dir \"C:\\Users\\jdoe\\Documents\"", "dir C:\\Users\\jdoe\\Documents\\*", "dir C:\\Users\\jdoe\\Documents\\*.*"],
        "output": "Directory of C:\\Users\\jdoe\\Documents\n\nFile Not Found",
        "hint": "Use dir on the old employee's Documents path to confirm nothing remains."
      },
      {
        "prompt": "Now securely overwrite the free space on C: so none of those deleted files can be recovered.",
        "accepts": ["cipher /w:c:\\", "cipher /w:c:"],
        "output": "Writing 0x00\nWriting 0xFF\nWriting Random Numbers\nCipher completed successfully.",
        "hint": "Use cipher's /w switch, pointed at the C: drive, to wipe deallocated free space."
      }
    ],
    "commands": [
      { "cmd": "dir", "desc": "List the files and folders in a directory" },
      { "cmd": "cipher /w:<drive>", "desc": "Overwrite deleted data in a volume's free space so it can't be recovered" },
      { "cmd": "format", "desc": "Reformat a drive, erasing its file system" },
      { "cmd": "diskpart clean", "desc": "Wipe all partition information from a disk" },
      { "cmd": "del /f /s /q", "desc": "Force-delete files and subfolders without confirmation" }
    ],
    "explanation": "cipher /w only touches space Windows already considers free, overwriting the remnants of deleted files without reformatting the volume or touching the current OS install and user accounts — format and diskpart clean would both destroy the working installation, and a plain delete never actually prevents undelete-style recovery in the first place."
  },
  {
    "id": "mobile-app-battery-drain",
    "core": "core2",
    "domain": "c2d3",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "One app is draining a company phone's battery fast",
    "summary": "Work through mobile battery drain as an evidence-based fix, not a reflexive factory reset.",
    "brief": "A user's company phone is warm to the touch even when idle, and its battery is draining far faster than normal.",
    "stages": [
      {
        "question": "What's the best first step?",
        "options": [
          "Check the phone's battery usage stats to see which app is actually responsible",
          "Immediately factory reset the phone",
          "Replace the battery",
          "Ignore it — phones just run warm sometimes"
        ],
        "correct": 0,
        "feedback": "Battery usage stats point directly at the actual cause instead of guessing, and a factory reset or battery swap are both drastic, disruptive steps that shouldn't happen before the cause is even confirmed."
      },
      {
        "question": "Usage stats confirm one specific app is using far more battery in the background than normal. What's the next reasonable step?",
        "options": [
          "Force-stop the app and check whether an update is available for it",
          "Uninstall every app on the phone",
          "Put the phone in airplane mode permanently",
          "Restart the phone and take no further action"
        ],
        "correct": 0,
        "feedback": "Force-stopping the specific app addresses the immediate symptom, and checking for an update targets a common real cause — a buggy background process fixed in a newer release — rather than a blanket, disruptive step affecting every app or all connectivity."
      },
      {
        "question": "The app updates, but the same battery drain returns a day later. What's the appropriate resolution?",
        "options": [
          "Uninstall and reinstall the app, and report the issue if it persists",
          "Keep manually force-stopping it forever",
          "Disable updates for every app on the phone",
          "Replace the phone"
        ],
        "correct": 0,
        "feedback": "A clean reinstall clears any corrupted local state the update didn't fix, and reporting a persistent issue is the right next escalation — replacing hardware or permanently babysitting one app are both disproportionate to a single misbehaving application."
      }
    ],
    "explanation": "Mobile battery complaints are diagnosed the same way any other performance issue is: confirm the actual cause with data, apply the least disruptive fix first (force-stop, then update), and only escalate to a reinstall or hardware replacement once the simpler fixes have genuinely been ruled out."
  },
  {
    "id": "cloud-app-access-scenario",
    "core": "core2",
    "domain": "c2d3",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "A new hire can't open a shared cloud folder",
    "summary": "Work a cloud-access ticket through to the real root cause instead of reinstalling software that isn't broken.",
    "brief": "A new hire gets \"access denied\" opening a shared cloud drive folder that their teammates open fine every day. Every other cloud service works normally for this user. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "New hire can't open shared cloud folder",
      "details": [
        "Reported by: Team lead, on behalf of a new hire",
        "Symptom: \"Access denied\" opening one shared folder; every other cloud app works fine",
        "Teammates confirm they can open the same folder without issue"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the best first step to characterize this?",
        "options": [
          { "label": "Confirm the new hire's account is actually listed on the shared folder's permissions, with the right access level", "next": "step2", "correct": true },
          { "label": "Immediately reinstall the cloud sync client", "next": "end_bad_reinstall", "correct": false },
          { "label": "Tell the new hire to use a personal account instead", "next": "end_bad_personal", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The new hire's account isn't listed on the folder's share list at all, even though a manager said they were added. What's the best fix?",
        "options": [
          { "label": "Add the new hire's account (or the correct group they belong to) with the intended permission level", "next": "step3", "correct": true },
          { "label": "Share the folder with the entire company to work around it", "next": "end_bad_everyone", "correct": false }
        ]
      },
      "step3": {
        "prompt": "Access now works, but the new hire says files sync minutes slower for them than for teammates. What's the best next check?",
        "options": [
          { "label": "Check the sync client's status/logs, and confirm the account has a valid license seat and enough local storage", "next": "end_good", "correct": true },
          { "label": "Assume it's fine now and close the ticket without checking further", "next": "end_bad_close", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "The account was simply never added to the folder's permissions despite what the manager assumed, and a quick sync-health and license check confirms nothing else is silently degrading the new hire's experience." },
      "end_bad_reinstall": { "end": true, "success": false, "prompt": "Reinstalling the client doesn't change server-side folder permissions, and every other cloud app already works fine for this user — the sync client itself was never the problem." },
      "end_bad_personal": { "end": true, "success": false, "prompt": "Routing a new hire to a personal account to reach company data is a data-handling and security problem of its own, not a fix for a permissions misconfiguration." },
      "end_bad_everyone": { "end": true, "success": false, "prompt": "Sharing company data with everyone to sidestep one account's missing permission trades a narrow access bug for a much bigger exposure problem." },
      "end_bad_close": { "end": true, "success": false, "prompt": "A slow sync can point to a licensing or storage problem that will resurface, or affect other users later — closing the ticket without checking assumes the fix is complete when it hasn't actually been confirmed." }
    },
    "explanation": "The symptom pointed at permissions from the start, since every other cloud service worked normally for this one user. Confirming (rather than assuming) the account was actually granted access, fixing the real gap, and then checking sync health and licensing before closing the ticket rules out a second, quieter problem hiding behind the first one."
  },
  {
    "id": "phishing-click-incident-scenario",
    "core": "core2",
    "domain": "c2d2",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "An employee clicked a phishing link and files look wrong",
    "summary": "Work a suspected-ransomware ticket through the correct incident-response order, not whatever feels fastest.",
    "brief": "Dozens of shared-drive files were renamed with a strange extension this morning, right after an employee clicked a link in an unexpected invoice email. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "Files renamed with a strange extension on the shared drive",
      "details": [
        "Reported by: Accounting employee",
        "Symptom: dozens of shared-drive files renamed with a '.locked' extension this morning",
        "The employee mentions clicking a link in an unexpected invoice email right before this started"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the single most urgent first action?",
        "options": [
          { "label": "Disconnect the affected workstation from the network immediately (unplug Ethernet / disable Wi-Fi), then investigate", "next": "step2", "correct": true },
          { "label": "Open a few of the renamed files to see what's actually wrong with them", "next": "end_bad_open", "correct": false },
          { "label": "Email the whole office asking who else clicked the link", "next": "end_bad_email", "correct": false },
          { "label": "Immediately wipe and reimage the workstation", "next": "end_bad_wipe", "correct": false }
        ]
      },
      "step2": {
        "prompt": "With the workstation isolated, what's the next step?",
        "options": [
          { "label": "Check which shares that workstation's account had access to, to scope how far this spread", "next": "step3", "correct": true },
          { "label": "Reconnect it to test whether the problem is really gone", "next": "end_bad_reconnect", "correct": false },
          { "label": "Delete the renamed files to clean up the mess", "next": "end_bad_delete", "correct": false }
        ]
      },
      "step3": {
        "prompt": "Scoping shows the renamed files are limited to shares this one account could reach, and the '.locked' extension plus a ransom note match known ransomware behavior. What's the right next move?",
        "options": [
          { "label": "Report the incident per company policy and restore the affected files from backup once the workstation is confirmed clean", "next": "end_good", "correct": true },
          { "label": "Pay whatever the ransom note demands to get the files back fastest", "next": "end_bad_ransom", "correct": false },
          { "label": "Quietly fix it yourself without telling anyone, to avoid trouble", "next": "end_bad_hide", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Isolating first contained the blast radius, scoping identified exactly what was affected, and reporting plus restoring from a clean backup is the standard incident-response path — never paying a ransom or hiding an incident." },
      "end_bad_open": { "end": true, "success": false, "prompt": "Opening a potentially malicious file on an already-compromised host risks spreading the infection further. Containment always comes before investigation." },
      "end_bad_email": { "end": true, "success": false, "prompt": "A broad, undirected email doesn't contain anything, and may tip off whoever's behind the attack that they've been noticed while the live compromise keeps spreading." },
      "end_bad_wipe": { "end": true, "success": false, "prompt": "Wiping before scoping the damage destroys evidence needed to understand what was accessed, and risks missing that other systems are also compromised." },
      "end_bad_reconnect": { "end": true, "success": false, "prompt": "Reconnecting an unconfirmed, still-compromised host immediately undoes the one containment step that was actually working." },
      "end_bad_delete": { "end": true, "success": false, "prompt": "Deleting evidence makes recovery and any later investigation harder, and does nothing to address the actual compromise." },
      "end_bad_ransom": { "end": true, "success": false, "prompt": "Paying a ransom doesn't guarantee file recovery, funds further attacks, and skips every proper containment and reporting step." },
      "end_bad_hide": { "end": true, "success": false, "prompt": "An unreported incident can't be properly contained, investigated, or learned from — and likely violates policy and, depending on the data involved, the law." }
    },
    "explanation": "A suspected ransomware incident follows a strict order: isolate the affected system first to stop it from spreading, then scope what was actually affected, then report and recover from a known-good backup. Each step depends on the one before it — recovery without isolation just gets re-encrypted, and reporting without scoping leaves responders guessing."
  },
  {
    "id": "new-hire-no-network-scenario",
    "core": "core1",
    "domain": "c1d2",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "A new hire's desk has a network jack but no internet",
    "summary": "Trace a dead network jack back to its real physical cause instead of swapping hardware.",
    "brief": "A new hire's desktop shows \"limited connectivity\" at a desk that worked fine for the previous employee last month. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "New hire can't get online at their desk",
      "details": [
        "Reported by: IT helpdesk, on behalf of a new hire",
        "Symptom: desktop plugged into the office wall jack shows 'limited connectivity', no internet",
        "The same jack worked fine for the previous employee last month"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the best first step to characterize this?",
        "options": [
          { "label": "Check the desktop's IP configuration to see what address (if any) it actually received", "next": "step2", "correct": true },
          { "label": "Assume the network card is broken and replace it", "next": "end_bad_replace_nic", "correct": false },
          { "label": "Tell the new hire to use their personal phone hotspot instead", "next": "end_bad_workaround", "correct": false }
        ]
      },
      "step2": {
        "prompt": "ipconfig shows a 169.254.x.x address. What does that tell you, and what's next?",
        "options": [
          { "label": "That's APIPA — the device never got a real address from DHCP; check the switch port and patch cable next", "next": "step3", "correct": true },
          { "label": "That's a normal address, so the problem must be the website being tested, not the network", "next": "end_bad_misread", "correct": false },
          { "label": "That means the DNS server is down", "next": "end_bad_dns", "correct": false }
        ]
      },
      "step3": {
        "prompt": "The patch cable from that wall jack isn't connected to anything on the patch panel — the previous employee's PC must have used a different jack entirely. What's the right fix?",
        "options": [
          { "label": "Patch that jack's cable into an open switch port, then re-check the link light and IP configuration", "next": "end_good", "correct": true },
          { "label": "Give the new hire the previous employee's exact IP address manually", "next": "end_bad_static", "correct": false },
          { "label": "Reboot the switch", "next": "end_bad_reboot", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Patching the jack into an open switch port completes the physical path, so DHCP can finally reach the device and hand out a real address — confirmed once the link light comes on and ipconfig shows a normal one." },
      "end_bad_replace_nic": { "end": true, "success": false, "prompt": "Replacing hardware before confirming the cause wastes time and money — an APIPA address points to a DHCP/connectivity problem, not a failed network card." },
      "end_bad_workaround": { "end": true, "success": false, "prompt": "A personal hotspot sidesteps the actual problem instead of fixing the desk's network access, and introduces its own security and reliability concerns." },
      "end_bad_misread": { "end": true, "success": false, "prompt": "169.254.x.x is Automatic Private IP Addressing (APIPA) — a sign DHCP failed, not a normal usable address." },
      "end_bad_dns": { "end": true, "success": false, "prompt": "DNS resolves names to addresses; APIPA means the device never got an address at all, which is a DHCP/connectivity issue, not a DNS one." },
      "end_bad_static": { "end": true, "success": false, "prompt": "Manually assigning someone else's address risks an IP conflict and doesn't fix why DHCP isn't reaching this jack in the first place." },
      "end_bad_reboot": { "end": true, "success": false, "prompt": "Rebooting the switch disrupts everyone else on it and doesn't address the actual problem: this one jack was never patched to a switch port." }
    },
    "explanation": "An APIPA (169.254.x.x) address is the key clue: the device never heard back from a DHCP server, pointing to a connectivity problem between the device and the network rather than a hardware failure or DNS issue. Tracing the physical path — cable, wall jack, patch panel, switch port — found the real gap: the jack was simply never patched in."
  },
  {
    "id": "desktop-random-reboot-scenario",
    "core": "core1",
    "domain": "c1d3",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "A desktop keeps randomly rebooting under load",
    "summary": "Narrow a spontaneous-reboot ticket down to the real failing component instead of guessing.",
    "brief": "A design team member's PC spontaneously reboots, more often during heavy work like large file exports, with no blue screen captured. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "Workstation reboots itself a few times a day",
      "details": [
        "Reported by: Design team member",
        "Symptom: PC spontaneously reboots, more often during heavy work (large file exports)",
        "No blue screen captured — it just restarts"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the best first step?",
        "options": [
          { "label": "Check internal temperatures and make sure airflow/fans aren't obstructed or failed", "next": "step2", "correct": true },
          { "label": "Immediately reinstall the operating system", "next": "end_bad_reinstall", "correct": false },
          { "label": "Replace the power supply right away", "next": "end_bad_psu_first", "correct": false }
        ]
      },
      "step2": {
        "prompt": "Temperatures and fans check out fine — nothing's overheating. What's the next thing to rule out?",
        "options": [
          { "label": "Run a memory diagnostic to check for bad RAM, since reboots correlate with memory-heavy tasks", "next": "step3", "correct": true },
          { "label": "Check if the monitor cable is loose", "next": "end_bad_monitor", "correct": false },
          { "label": "Clear the browser cache", "next": "end_bad_browser", "correct": false }
        ]
      },
      "step3": {
        "prompt": "The memory diagnostic reports errors on one of two installed RAM sticks. What's the right fix?",
        "options": [
          { "label": "Remove the failing RAM stick and confirm stability under the same heavy workload with just the known-good one", "next": "end_good", "correct": true },
          { "label": "Reseat both sticks and consider the problem solved without re-testing", "next": "end_bad_reseat_only", "correct": false },
          { "label": "Increase the page file size to compensate", "next": "end_bad_pagefile", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Isolating and removing the module the diagnostic actually flagged, then confirming stability under the same heavy workload that used to trigger reboots, confirms the fix instead of just hoping it's fixed." },
      "end_bad_reinstall": { "end": true, "success": false, "prompt": "A reinstall addresses software corruption, not a hardware-level spontaneous reboot, and skips every diagnostic step that would actually find the cause." },
      "end_bad_psu_first": { "end": true, "success": false, "prompt": "A failing power supply is a reasonable eventual suspect, but jumping straight to a parts swap before checking the more easily tested causes (heat, memory) wastes a part if it isn't the actual problem." },
      "end_bad_monitor": { "end": true, "success": false, "prompt": "A loose monitor cable causes display problems, not spontaneous full-system reboots." },
      "end_bad_browser": { "end": true, "success": false, "prompt": "Browser cache is a software-level concern entirely unrelated to the machine restarting itself at the hardware level." },
      "end_bad_reseat_only": { "end": true, "success": false, "prompt": "The diagnostic already identified a specific failing module — reseating without re-testing just hopes the connection was the problem instead of confirming it." },
      "end_bad_pagefile": { "end": true, "success": false, "prompt": "A page file is virtual memory on disk, not a fix for a RAM module the diagnostic has already flagged as physically failing." }
    },
    "explanation": "Spontaneous reboots under load follow a logical elimination order: rule out the simplest physical cause (heat/airflow) first, then test the next most likely (memory), and once a diagnostic identifies a specific faulty component, isolate and confirm the fix under the same conditions that originally triggered the problem — rather than guessing, swapping parts blindly, or assuming a fix worked without re-testing it."
  },
  {
    "id": "dns-failure-triage-terminal",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Users reach the Internet by IP but not by name",
    "summary": "Use a simulated Windows prompt to prove a DNS problem and separate it from a connectivity problem.",
    "brief": "Employees say \"the Internet is down,\" but a technician suspects name resolution. At the prompt, run the right tests in order to prove where the fault is. Type commands exactly, or use an accepted equivalent.",
    "explanation": "Pinging an IP address works but pinging the name fails, so connectivity is fine and name resolution is not. nslookup shows the configured DNS server timing out, ipconfig /all shows which server the workstation was given, and asking a public resolver succeeds, which isolates the fault to the internal DNS server. Flushing the cache afterwards removes any stale failures.",
    "terminal": [
      {
        "prompt": "First confirm basic Internet reachability by pinging a public IP address, 8.8.8.8.",
        "accepts": [
          "ping 8.8.8.8"
        ],
        "output": "Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=14ms TTL=117\nReply from 8.8.8.8: bytes=32 time=13ms TTL=117\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
        "hint": "Ping the IP address directly so DNS is not involved."
      },
      {
        "prompt": "Now test name resolution by pinging a hostname, example.com.",
        "accepts": [
          "ping example.com"
        ],
        "output": "Ping request could not find host example.com. Please check the name and try again.",
        "hint": "Ping the name this time, to see whether it resolves."
      },
      {
        "prompt": "Query DNS directly for that name to see which server answers.",
        "accepts": [
          "nslookup example.com"
        ],
        "output": "DNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  192.168.1.99\n\n*** Request to UnKnown timed-out",
        "hint": "Use the DNS query tool with the hostname."
      },
      {
        "prompt": "View the full IP configuration to see which DNS server this workstation was given.",
        "accepts": [
          "ipconfig /all",
          "ipconfig -all"
        ],
        "output": "Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . . : 192.168.1.40\n   Default Gateway . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . : 192.168.1.99",
        "hint": "Use the IP configuration command with the switch that shows full detail."
      },
      {
        "prompt": "Test the same name against a working public DNS server, 8.8.8.8, using nslookup.",
        "accepts": [
          "nslookup example.com 8.8.8.8"
        ],
        "output": "Server:  dns.google\nAddress:  8.8.8.8\n\nName:    example.com\nAddresses:  93.184.216.34",
        "hint": "Give nslookup the name followed by the DNS server to ask."
      },
      {
        "prompt": "That proves the internal DNS server at 192.168.1.99 is the fault. After it is fixed, clear this workstation's cached DNS results.",
        "accepts": [
          "ipconfig /flushdns",
          "ipconfig -flushdns"
        ],
        "output": "Windows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.",
        "hint": "Clear the local DNS resolver cache with ipconfig."
      }
    ],
    "commands": [
      {
        "cmd": "ping",
        "desc": "Test reachability of an IP address or name"
      },
      {
        "cmd": "nslookup",
        "desc": "Query DNS for a name (optionally against a chosen server)"
      },
      {
        "cmd": "ipconfig /all",
        "desc": "Show full IP configuration, including DNS servers"
      },
      {
        "cmd": "ipconfig /flushdns",
        "desc": "Clear the local DNS resolver cache"
      },
      {
        "cmd": "tracert",
        "desc": "Trace the path to a destination"
      },
      {
        "cmd": "netstat",
        "desc": "Show connections and listening ports"
      }
    ]
  },
  {
    "id": "map-network-drive-terminal",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Map and verify a network drive from the command line",
    "summary": "Use net use to connect, check, and remove a mapped drive.",
    "brief": "A user needs the department share available as drive Z: that reconnects every time they sign in. Do it from the command prompt. Type commands exactly, or use an accepted equivalent.",
    "explanation": "net use maps a drive letter to a UNC path such as \\\\server\\share, and /persistent:yes makes the mapping return at the next sign-in. Running net use with no arguments lists connections, and /delete removes one. net user is a different command that manages accounts.",
    "terminal": [
      {
        "prompt": "List the current network connections on this computer.",
        "accepts": [
          "net use"
        ],
        "output": "New connections will be remembered.\n\nThere are no entries in the list.",
        "hint": "Use the net command that manages shared resources, with no arguments."
      },
      {
        "prompt": "Map drive Z: to \\\\fs01\\dept so that it reconnects at sign-in.",
        "accepts": [
          "net use Z: \\\\fs01\\dept /persistent:yes",
          "net use z: \\\\fs01\\dept /persistent:yes",
          "net use Z: \\\\fs01\\dept /persistent:y"
        ],
        "output": "The command completed successfully.",
        "hint": "Give net use the drive letter, the UNC path, and the persistent switch."
      },
      {
        "prompt": "Confirm that the mapping exists.",
        "accepts": [
          "net use"
        ],
        "output": "Status       Local     Remote                    Network\n-------------------------------------------------------------\nOK           Z:        \\\\fs01\\dept              Microsoft Windows Network\nThe command completed successfully.",
        "hint": "List the connections again."
      },
      {
        "prompt": "The share is being retired. Remove the Z: mapping.",
        "accepts": [
          "net use Z: /delete",
          "net use z: /delete",
          "net use Z: /d"
        ],
        "output": "Z: was deleted successfully.",
        "hint": "Use net use with the drive letter and the delete switch."
      }
    ],
    "commands": [
      {
        "cmd": "net use",
        "desc": "List network connections"
      },
      {
        "cmd": "net use Z: \\\\server\\share /persistent:yes",
        "desc": "Map a drive that reconnects at sign-in"
      },
      {
        "cmd": "net use Z: /delete",
        "desc": "Remove a mapped drive"
      },
      {
        "cmd": "net user",
        "desc": "Manage user accounts (not drive mappings)"
      },
      {
        "cmd": "robocopy",
        "desc": "Copy files robustly"
      }
    ]
  },
  {
    "id": "repair-windows-image-terminal",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "System File Checker cannot fix the problem",
    "summary": "Use sfc and DISM together, in the right order, to repair a damaged Windows installation.",
    "brief": "A PC crashes when opening certain settings pages. At an elevated prompt, check and repair the system files. Type commands exactly, or use an accepted equivalent.",
    "explanation": "sfc replaces damaged system files using the Windows component store. If that store is itself corrupt, sfc cannot finish, so DISM /Online /Cleanup-Image /RestoreHealth repairs the store first, and then sfc /scannow can repair the remaining files.",
    "terminal": [
      {
        "prompt": "Scan and repair protected system files.",
        "accepts": [
          "sfc /scannow",
          "sfc /SCANNOW"
        ],
        "output": "Beginning system scan. This process will take some time.\nWindows Resource Protection found corrupt files but was unable to fix some of them.\nDetails are included in the CBS.Log file.",
        "hint": "Run System File Checker with the scan-now switch."
      },
      {
        "prompt": "sfc could not repair everything because the component store it draws from is damaged. Repair the Windows image online.",
        "accepts": [
          "DISM /Online /Cleanup-Image /RestoreHealth",
          "dism /online /cleanup-image /restorehealth"
        ],
        "output": "[==========================100.0%==========================]\nThe restore operation completed successfully.\nThe operation completed successfully.",
        "hint": "Use DISM against the running system with the RestoreHealth option."
      },
      {
        "prompt": "Now run the System File Checker again to repair the files with the healthy component store.",
        "accepts": [
          "sfc /scannow",
          "sfc /SCANNOW"
        ],
        "output": "Beginning system scan. This process will take some time.\nWindows Resource Protection found corrupt files and successfully repaired them.",
        "hint": "Repeat the scan-now command."
      }
    ],
    "commands": [
      {
        "cmd": "sfc /scannow",
        "desc": "Scan and repair protected system files"
      },
      {
        "cmd": "DISM /Online /Cleanup-Image /RestoreHealth",
        "desc": "Repair the Windows image (component store)"
      },
      {
        "cmd": "chkdsk /f",
        "desc": "Fix file system errors on a drive"
      },
      {
        "cmd": "gpupdate /force",
        "desc": "Refresh Group Policy"
      }
    ]
  },
  {
    "id": "group-policy-refresh-terminal",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "A new policy has not reached a workstation",
    "summary": "Use gpresult and gpupdate to verify and refresh Group Policy.",
    "brief": "A new Group Policy setting was linked to the Sales organizational unit, but one salesperson's PC does not have it. Diagnose at the prompt. Type commands exactly, or use an accepted equivalent.",
    "explanation": "gpresult reports what actually applied to a user and computer, while gpupdate /force requests a refresh. Running the report, forcing a refresh, and running the report again confirms the change took effect. If a policy still fails to apply, the report shows whether it was filtered out, for example by scope or security filtering.",
    "terminal": [
      {
        "prompt": "Report which policies are applied to this computer and user.",
        "accepts": [
          "gpresult /r",
          "gpresult /R"
        ],
        "output": "Applied Group Policy Objects\n-----------------------------\n    Default Domain Policy\n\nThe following GPOs were not applied because they were filtered out\n-------------------------------------------------------------------\n    Sales Desktop Settings\n        Filtering:  Not Applied (Unknown Reason)",
        "hint": "Use gpresult with the switch that prints a summary."
      },
      {
        "prompt": "The PC simply has not refreshed since the policy was linked. Force a refresh of policy now.",
        "accepts": [
          "gpupdate /force",
          "gpupdate /FORCE"
        ],
        "output": "Updating policy...\n\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.",
        "hint": "Use gpupdate with the switch that reapplies all settings."
      },
      {
        "prompt": "Verify that the policy now applies.",
        "accepts": [
          "gpresult /r",
          "gpresult /R"
        ],
        "output": "Applied Group Policy Objects\n-----------------------------\n    Default Domain Policy\n    Sales Desktop Settings",
        "hint": "Run the policy report again."
      }
    ],
    "commands": [
      {
        "cmd": "gpresult /r",
        "desc": "Report the Group Policy settings that actually applied"
      },
      {
        "cmd": "gpupdate /force",
        "desc": "Reapply all Group Policy settings now"
      },
      {
        "cmd": "gpedit.msc",
        "desc": "Open the Local Group Policy Editor"
      },
      {
        "cmd": "net user",
        "desc": "Manage user accounts"
      }
    ]
  },
  {
    "id": "linux-disk-full-terminal",
    "core": "core2",
    "domain": "c2d1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "A Linux server's /var volume is full",
    "summary": "Use df, du, grep, and gzip to find and fix a full file system.",
    "brief": "A web server has stopped writing logs because /var is full. Work from the shell to find what is using the space and recover it safely. Type commands exactly, or use an accepted equivalent.",
    "explanation": "df shows which file system is full, du shows what inside it is using the space, and grep reads the contents of the log to find the cause. Compressing the log with gzip recovers space while keeping the data, and df confirms the result.",
    "terminal": [
      {
        "prompt": "Check how full each file system is, in human-readable sizes.",
        "accepts": [
          "df -h"
        ],
        "output": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        40G   12G   26G  32% /\n/dev/sda3        20G   20G     0 100% /var",
        "hint": "Use the disk free command with the human-readable switch."
      },
      {
        "prompt": "See how much space each item under /var/log is using.",
        "accepts": [
          "du -sh /var/log/*"
        ],
        "output": "4.0K    /var/log/auth.log\n18G     /var/log/app.log\n1.2G    /var/log/syslog",
        "hint": "Use the disk usage command with summary and human-readable switches and a wildcard."
      },
      {
        "prompt": "Look for lines containing the word error in the large log, ignoring case.",
        "accepts": [
          "grep -i error /var/log/app.log"
        ],
        "output": "2026-10-04 02:11:07 ERROR disk write failed: no space left on device\n2026-10-04 02:11:08 ERROR retrying write to /var/log/app.log",
        "hint": "Use grep with the case-insensitive switch, the word, and the file."
      },
      {
        "prompt": "Compress the oversized log to recover space without deleting it.",
        "accepts": [
          "gzip /var/log/app.log",
          "sudo gzip /var/log/app.log"
        ],
        "output": "",
        "hint": "Use gzip on the log file."
      },
      {
        "prompt": "Confirm that the space has been recovered.",
        "accepts": [
          "df -h"
        ],
        "output": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        40G   12G   26G  32% /\n/dev/sda3        20G  2.1G   17G  11% /var",
        "hint": "Check the file system usage again."
      }
    ],
    "commands": [
      {
        "cmd": "df -h",
        "desc": "Show free and used space per file system"
      },
      {
        "cmd": "du -sh <path>",
        "desc": "Show space used by files or directories"
      },
      {
        "cmd": "grep -i <word> <file>",
        "desc": "Search a file for matching lines"
      },
      {
        "cmd": "gzip <file>",
        "desc": "Compress a file"
      },
      {
        "cmd": "ps aux",
        "desc": "List running processes"
      }
    ]
  },
  {
    "id": "boot-repair-terminal",
    "core": "core2",
    "domain": "c2d3",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Windows reports \"Operating system not found\"",
    "summary": "Use bootrec from the recovery environment to repair the boot records.",
    "brief": "A PC will not boot and reports that the operating system was not found. From the Windows Recovery Environment command prompt, repair the boot configuration. Type commands exactly, or use an accepted equivalent.",
    "explanation": "A missing or damaged boot record produces \"Operating system not found.\" bootrec repairs the master boot record and boot sector, finds installed Windows copies, and rebuilds the Boot Configuration Data, all from the recovery environment because Windows itself cannot start. sfc is for repairing files once Windows boots.",
    "terminal": [
      {
        "prompt": "Repair the master boot record.",
        "accepts": [
          "bootrec /fixmbr",
          "bootrec /FIXMBR"
        ],
        "output": "The operation completed successfully.",
        "hint": "Use bootrec with the switch that fixes the master boot record."
      },
      {
        "prompt": "Write a new boot sector to the system partition.",
        "accepts": [
          "bootrec /fixboot",
          "bootrec /FIXBOOT"
        ],
        "output": "The operation completed successfully.",
        "hint": "Use bootrec with the switch that fixes the boot sector."
      },
      {
        "prompt": "Scan the disks for Windows installations.",
        "accepts": [
          "bootrec /scanos",
          "bootrec /SCANOS"
        ],
        "output": "Scanning all disks for Windows installations.\n\nTotal identified Windows installations: 1\n[1]  D:\\Windows\nThe operation completed successfully.",
        "hint": "Use bootrec with the scan switch."
      },
      {
        "prompt": "Rebuild the Boot Configuration Data store.",
        "accepts": [
          "bootrec /rebuildbcd",
          "bootrec /REBUILDBCD"
        ],
        "output": "Scanning all disks for Windows installations.\nTotal identified Windows installations: 1\n[1]  D:\\Windows\nAdd installation to boot list? Yes(Y)/No(N)/All(A):",
        "hint": "Use bootrec with the rebuild switch."
      },
      {
        "prompt": "Answer the prompt to add the discovered installation to the boot list.",
        "accepts": [
          "y",
          "Y",
          "a",
          "A"
        ],
        "output": "Successfully scanned Windows installations.\nTotal identified Windows installations: 1\nThe operation completed successfully.",
        "hint": "Answer Yes to the prompt."
      }
    ],
    "commands": [
      {
        "cmd": "bootrec /fixmbr",
        "desc": "Repair the master boot record"
      },
      {
        "cmd": "bootrec /fixboot",
        "desc": "Write a new boot sector"
      },
      {
        "cmd": "bootrec /scanos",
        "desc": "Find Windows installations"
      },
      {
        "cmd": "bootrec /rebuildbcd",
        "desc": "Rebuild the boot configuration data"
      },
      {
        "cmd": "sfc /scannow",
        "desc": "Repair system files (needs a booting Windows)"
      }
    ]
  },
  {
    "id": "print-spooler-reset-terminal",
    "core": "core2",
    "domain": "c2d3",
    "type": "terminal",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "A stuck print job blocks the whole queue",
    "summary": "Stop the Print Spooler, clear its spool folder, and start it again.",
    "brief": "One job will not delete and nothing else prints. At an elevated prompt, reset the print spooler. Type commands exactly, or use an accepted equivalent.",
    "explanation": "A corrupt job can block the spooler's queue. Stopping the service releases the files, clearing the spool folder removes the stuck job, and starting the service again restores printing, with no new hardware or drivers needed.",
    "terminal": [
      {
        "prompt": "Stop the Print Spooler service.",
        "accepts": [
          "net stop spooler",
          "net stop Spooler"
        ],
        "output": "The Print Spooler service is stopping.\nThe Print Spooler service was stopped successfully.",
        "hint": "Use net stop with the service name."
      },
      {
        "prompt": "Delete everything in the spool folder, quietly.",
        "accepts": [
          "del /Q C:\\Windows\\System32\\spool\\PRINTERS\\*",
          "del /q c:\\windows\\system32\\spool\\printers\\*",
          "del /F /Q C:\\Windows\\System32\\spool\\PRINTERS\\*"
        ],
        "output": "",
        "hint": "Use del with the quiet switch on the PRINTERS spool folder."
      },
      {
        "prompt": "Start the Print Spooler service again.",
        "accepts": [
          "net start spooler",
          "net start Spooler"
        ],
        "output": "The Print Spooler service is starting.\nThe Print Spooler service was started successfully.",
        "hint": "Use net start with the service name."
      }
    ],
    "commands": [
      {
        "cmd": "net stop spooler",
        "desc": "Stop the Print Spooler service"
      },
      {
        "cmd": "del /Q C:\\Windows\\System32\\spool\\PRINTERS\\*",
        "desc": "Delete queued spool files"
      },
      {
        "cmd": "net start spooler",
        "desc": "Start the Print Spooler service"
      },
      {
        "cmd": "sfc /scannow",
        "desc": "Repair system files"
      }
    ]
  },
  {
    "id": "compromised-mailbox-scenario",
    "core": "core2",
    "domain": "c2d3",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "The CFO's mailbox is sending spam",
    "summary": "Work a mailbox takeover through to containment instead of just deleting the messages.",
    "brief": "Customers report spam from the CFO's email address. The CFO says they never sent it. Work the ticket by choosing your next action at each step.",
    "explanation": "Messages the user never wrote in Sent Items point to a compromised account. Contain it first (new password, ended sessions, MFA), then remove persistence such as forwarding rules, delegates, and connected apps, and finally widen the investigation and document it.",
    "ticket": {
      "subject": "Spam coming from the CFO's account",
      "details": [
        "Reported by: Customer service",
        "Symptom: customers receive unsolicited messages from the CFO's address",
        "The CFO did not send them"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What is the best first action?",
        "options": [
          {
            "label": "Reset the password, sign out all sessions, and enable multifactor authentication",
            "next": "step2",
            "correct": true
          },
          {
            "label": "Delete the spam messages from the Sent Items folder and move on",
            "next": "end_bad_delete",
            "correct": false
          },
          {
            "label": "Tell customers to ignore the messages and wait",
            "next": "end_bad_ignore",
            "correct": false
          }
        ]
      },
      "step2": {
        "prompt": "The mailbox is secured, but Sent Items shows messages sent overnight, and an inbox rule forwards all incoming mail to an unknown external address. What next?",
        "options": [
          {
            "label": "Remove the forwarding rule, check delegates and connected apps, and review recent sign-ins",
            "next": "step3",
            "correct": true
          },
          {
            "label": "Leave the rule in place because it is harmless",
            "next": "end_bad_rule",
            "correct": false
          },
          {
            "label": "Rename the mailbox so the attacker cannot find it",
            "next": "end_bad_rename",
            "correct": false
          }
        ]
      },
      "step3": {
        "prompt": "The attacker's access is removed. What else should happen before closing the ticket?",
        "options": [
          {
            "label": "Document the incident, check whether other accounts were targeted, and notify security and affected parties",
            "next": "end_good",
            "correct": true
          },
          {
            "label": "Close the ticket immediately because the account works again",
            "next": "end_bad_close",
            "correct": false
          }
        ]
      },
      "end_good": {
        "end": true,
        "success": true,
        "prompt": "Resetting credentials, ending sessions, adding MFA, removing the attacker's forwarding rule, and checking for wider impact contains the takeover and documents it for follow-up."
      },
      "end_bad_delete": {
        "end": true,
        "success": false,
        "prompt": "Deleting the messages leaves the attacker with access, so the spam and the forwarding of private mail would continue."
      },
      "end_bad_ignore": {
        "end": true,
        "success": false,
        "prompt": "Ignoring it leaves a compromised executive account free to send fraud and phishing mail."
      },
      "end_bad_rule": {
        "end": true,
        "success": false,
        "prompt": "A rule forwarding mail to an external address is how attackers keep seeing replies and resets; leaving it in place keeps the breach alive."
      },
      "end_bad_rename": {
        "end": true,
        "success": false,
        "prompt": "Renaming the mailbox does not remove the attacker's stolen credentials, sessions, or rules."
      },
      "end_bad_close": {
        "end": true,
        "success": false,
        "prompt": "Closing too early skips checking for other victims and reporting, and the same attacker may already be in other accounts."
      }
    }
  },
  {
    "id": "mobile-adware-decision",
    "core": "core2",
    "domain": "c2d3",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "A phone is full of ads and fake virus warnings",
    "summary": "Choose safe steps for a phone showing full-screen ads and \"virus detected\" alerts.",
    "brief": "An employee's phone shows full-screen ads on the home screen and a \"your device is infected\" warning. It started after they installed a free flashlight app.",
    "explanation": "Unwanted ads and fake warnings usually trace to a recently installed app or an abused notification permission. Remove the likely source, patch and scan, check for abused permissions, and reserve a backed-up factory reset for when nothing else works.",
    "stages": [
      {
        "question": "What is the best first step?",
        "options": [
          "Remove the recently installed app and review its permissions and notification settings",
          "Pay for the cleaning tool the warning recommends",
          "Install a second unknown cleaner app",
          "Ignore it until the battery drains"
        ],
        "correct": 0,
        "feedback": "The timing points at the new app, so removing it and revoking what it was allowed to do addresses the likely source. The warning itself is part of the problem, so following it is unsafe."
      },
      {
        "question": "The ads continue after the app is removed. What is the next reasonable step?",
        "options": [
          "Update the OS and apps, run a reputable mobile security scan, and check for unknown device administrators",
          "Disable the screen lock",
          "Sideload a cleaner from a website",
          "Turn off automatic updates"
        ],
        "correct": 0,
        "feedback": "Updating closes known flaws, a scan looks for anything left behind, and unfamiliar device administrators or accessibility services are common persistence points."
      },
      {
        "question": "Nothing works and the phone is still showing ads. What is the last resort?",
        "options": [
          "Back up personal data, then perform a factory reset and reinstall only trusted apps from the official store",
          "Root the phone to remove it manually",
          "Keep using it but avoid the home screen",
          "Reinstall the flashlight app to see if it behaves"
        ],
        "correct": 0,
        "feedback": "A factory reset erases persistent malware but also erases data, so it comes last and after a backup. Rooting or sideloading adds risk rather than removing it."
      }
    ]
  },
  {
    "id": "soho-router-hardening-sequence",
    "core": "core2",
    "domain": "c2d2",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Harden a new small-office router",
    "summary": "Put the first-hour router hardening steps in a sensible order.",
    "brief": "A new router has just come out of the box. Arrange the steps from first to last before devices are connected.",
    "explanation": "The default login is public knowledge, so it is changed first. Firmware is updated next because it fixes known flaws, then the wireless security is set, risky convenience features (WPS, UPnP) and remote administration are switched off, visitors get an isolated network, and the finished configuration is saved.",
    "steps": [
      "Log in with the default credentials and change the administrator password",
      "Install the latest firmware update",
      "Set a unique network name and enable WPA3 or WPA2 with AES and a strong passphrase",
      "Disable WPS and UPnP",
      "Create a separate guest network isolated from the main LAN",
      "Disable remote administration from the Internet",
      "Back up the finished configuration"
    ]
  },
  {
    "id": "wifi-security-decision",
    "core": "core2",
    "domain": "c2d2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Choose Wi-Fi security for staff, visitors, and an old scanner",
    "summary": "Pick the right wireless authentication and segmentation for three requirements.",
    "brief": "A 40-person company is rebuilding its wireless network. It wants individual logins for staff, Internet-only access for visitors, and it still has one old scanner that only supports WEP.",
    "explanation": "Match the control to the requirement: 802.1X for individual, revocable staff credentials, an isolated guest network for visitors, and keep legacy devices away from the main network rather than lowering everyone's security.",
    "stages": [
      {
        "question": "Staff should each have their own Wi-Fi credentials, so one person's access can be removed without affecting anyone else. What should be used?",
        "options": [
          "WPA-Enterprise with 802.1X and a RADIUS server",
          "WPA-Personal with one shared passphrase",
          "An open network with MAC filtering only",
          "WEP with a long key"
        ],
        "correct": 0,
        "feedback": "Enterprise mode authenticates each user individually through 802.1X and RADIUS, so credentials are unique and revocable. A shared passphrase cannot be removed for one person alone."
      },
      {
        "question": "Visitors need Internet access only. What is the best design?",
        "options": [
          "A separate guest network isolated from the internal LAN, with a captive portal",
          "Give visitors the staff credentials",
          "Place visitors on the main VLAN and hide the staff SSID",
          "Leave the guest network open and unrestricted on the main LAN"
        ],
        "correct": 0,
        "feedback": "An isolated guest network gives visitors the Internet without exposing internal systems, and a captive portal can require acceptance of terms."
      },
      {
        "question": "The old scanner supports only WEP. What is the best action?",
        "options": [
          "Replace it, or isolate it on its own restricted legacy network, and keep everything else on WPA3 or WPA2 with AES",
          "Switch the whole network to WEP so the scanner works",
          "Switch the whole network to TKIP",
          "Hide the SSID and keep WEP on the main network"
        ],
        "correct": 0,
        "feedback": "WEP is trivially broken, so it must not weaken the main network. Replacing the device is best, and isolating it with restricted access limits the risk if that is not possible."
      }
    ]
  },
  {
    "id": "employee-offboarding-sequence",
    "core": "core2",
    "domain": "c2d4",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Offboard a departing employee",
    "summary": "Order the termination checklist so access ends on time and nothing is lost.",
    "brief": "An employee is leaving the company this afternoon. Arrange the technician's tasks from first to last.",
    "explanation": "Access is removed on schedule first, because risk peaks at departure, then sessions are ended, equipment is collected, the data is preserved for the business, returned devices are wiped and recorded, and everything is documented.",
    "steps": [
      "Confirm the effective time and any data-handling instructions with HR and the manager",
      "Disable the user's accounts and revoke VPN, email, and application access at the effective time",
      "Reset passwords, end active sessions, and remove the user from groups",
      "Collect the laptop, badge, and other equipment",
      "Reassign or archive the user's mailbox and files",
      "Wipe returned devices and update the asset inventory",
      "Document completion in the ticket"
    ]
  },
  {
    "id": "change-request-sequence",
    "core": "core2",
    "domain": "c2d4",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 7,
    "title": "Run a change through change management",
    "summary": "Put the stages of a controlled change in order, from request to closure.",
    "brief": "Operations wants to upgrade a core application server. Arrange the change-management steps from first to last.",
    "explanation": "A request defines what and why, risk analysis rates it, a sandbox test and backout plan make it safe to attempt, approval authorizes it, it is implemented in a window, users accept it, and documentation closes the loop.",
    "steps": [
      "Submit the change request with purpose, scope, and affected systems",
      "Perform a risk analysis and assign a risk level",
      "Test the change in a sandbox and prepare the backout plan",
      "Obtain approval from the change board",
      "Implement the change in the approved maintenance window",
      "Have end users confirm it works (acceptance)",
      "Update the documentation and close the change"
    ]
  },
  {
    "id": "remote-access-tool-decision",
    "core": "core2",
    "domain": "c2d4",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Pick the right remote access tool for each job",
    "summary": "Match three support situations to remote access technologies.",
    "brief": "A support team uses several remote tools and needs to choose the right one for three different jobs.",
    "explanation": "Choose by situation: a user-consented one-time session suits Quick Assist, fleet management suits an RMM agent, and secure Linux administration suits SSH. Never expose RDP directly, and avoid clear-text tools such as Telnet.",
    "stages": [
      {
        "question": "A remote employee at home has a frozen laptop and a login error. They are on the phone with you and have no remote software installed. What is the best option?",
        "options": [
          "Quick Assist, with the user sharing a one-time code",
          "Install an RMM agent first",
          "RDP directly into their home router",
          "Ask them to open a port on their router"
        ],
        "correct": 0,
        "feedback": "Quick Assist works with the user's consent using a one-time code and needs no permanent software or port forwarding."
      },
      {
        "question": "The team must patch, monitor, and run scripts on 400 company laptops from one console. What should they use?",
        "options": [
          "A remote monitoring and management (RMM) platform with an agent on each device",
          "Quick Assist on each laptop in turn",
          "VNC to each laptop by hand",
          "Telnet to each laptop"
        ],
        "correct": 0,
        "feedback": "RMM installs an agent on every endpoint so IT can monitor, patch, script, and control them centrally."
      },
      {
        "question": "An administrator must manage a Linux server's command line securely across the Internet. What is the best choice?",
        "options": [
          "SSH, ideally with key-based authentication",
          "Telnet",
          "Unencrypted VNC",
          "RDP exposed directly to the Internet"
        ],
        "correct": 0,
        "feedback": "SSH encrypts the session and commonly uses keys. Telnet and plain VNC send data in the clear, and exposing RDP directly to the Internet is dangerous."
      }
    ]
  },
  {
    "id": "script-vetting-decision",
    "core": "core2",
    "domain": "c2d4",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Is this downloaded script safe to run?",
    "summary": "Walk through safe handling of an unfamiliar script found on a forum.",
    "brief": "A forum post offers a PowerShell script that \"clears temp files on all your PCs.\" A technician wants to use it on 200 company workstations.",
    "explanation": "Treat unfamiliar scripts as untrusted: review the code, test it in a sandbox, reject anything that fetches or runs unknown content, and deploy approved scripts in stages with least privilege and logging.",
    "stages": [
      {
        "question": "What should the technician do first?",
        "options": [
          "Read the script and test it in an isolated sandbox",
          "Run it on one production PC as administrator",
          "Disable antivirus so it is not blocked",
          "Email it to the whole team"
        ],
        "correct": 0,
        "feedback": "An unreviewed script has the same power as malware, so it should be read and tested in an isolated environment before it touches production."
      },
      {
        "question": "While reading it, the technician finds an obfuscated command that downloads and runs a file from an unknown URL. What now?",
        "options": [
          "Do not run it; report it and use a trusted, reviewed alternative",
          "Run it anyway because the temp-file part looks fine",
          "Decode it and run only the second half on production",
          "Add the URL to the allow list"
        ],
        "correct": 0,
        "feedback": "Downloading and executing code from an unknown source is a major red flag, so the script should be rejected, not partly used."
      },
      {
        "question": "Later, a vetted in-house version is ready. How should it be deployed?",
        "options": [
          "To a small pilot group through RMM or Group Policy with least privilege and logging",
          "To all 200 PCs at once with a shared admin account",
          "By asking each user to run it themselves",
          "By removing the execution policy on every PC"
        ],
        "correct": 0,
        "feedback": "A pilot group limits the damage if something is wrong, and central tools with least privilege and logging make it controllable and auditable."
      }
    ]
  }
];
})();
