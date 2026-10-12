(function () {
  'use strict';
  window.THREECX_BASIC_LABS = [
  {
    "id": "new-deployment-sequence",
    "core": "core1",
    "domain": "b1",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Stand up a brand-new 3CX system in the right order",
    "summary": "Put the steps for a first-time deployment into the correct order, from sizing to baseline backup.",
    "brief": "You're deploying 3CX for a company for the very first time. Arrange the steps from first to last.",
    "steps": [
      "Confirm system requirements and choose a deployment target (Windows, Debian, or cloud)",
      "Install 3CX and complete the initial setup wizard with company details and timezone",
      "Register an FQDN and confirm it resolves to the server's public IP",
      "Run the built-in firewall checker to confirm required ports are reachable",
      "Create extension templates and provision the first batch of user extensions",
      "Configure and register at least one SIP trunk for outbound and inbound calling",
      "Set up inbound rules so DID numbers route to the correct destinations",
      "Take a full backup of the completed baseline configuration"
    ],
    "explanation": "Deployment and sizing decisions come first, then the base install and wizard, then networking prerequisites like FQDN and ports need to be solid before extensions and trunks can reliably register — and a backup of a known-good baseline belongs at the end, once the system is stable."
  },
  {
    "id": "sip-trunk-inbound-decision",
    "core": "core1",
    "domain": "b3",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Get a new SIP trunk registered and taking calls",
    "summary": "Work through a new trunk setup that isn't delivering inbound calls yet, one layer at a time.",
    "brief": "You've just configured your first SIP trunk with a provider, but calls to the new number aren't reaching anyone yet.",
    "stages": [
      {
        "question": "The trunk shows as 'not registered' immediately after entering the provider's credentials. What's the best first troubleshooting step?",
        "options": [
          "Re-check the username, password, and registrar address against exactly what the provider issued",
          "Immediately contact the provider to report their service as down",
          "Delete the trunk and recreate the extensions instead",
          "Assume it's a codec issue and change the codec list"
        ],
        "correct": 0,
        "feedback": "The vast majority of trunk registration failures come down to a typo or mismatch in the credentials or registrar address, so verifying those first is the fastest path to a fix."
      },
      {
        "question": "The trunk registers successfully, but a test inbound call to the new DID doesn't ring anywhere. What should be checked next?",
        "options": [
          "Confirm an inbound rule exists for that DID and points to a real destination",
          "Re-enter the trunk password again",
          "Change the trunk's codec settings",
          "Restart the entire server"
        ],
        "correct": 0,
        "feedback": "A registered trunk with no matching inbound rule for that DID has nowhere to send the call — the routing configuration, not the trunk connection, is the next thing to check."
      },
      {
        "question": "An inbound rule exists and points to an extension, but the call still doesn't come through cleanly, and the firewall checker shows the RTP port range is blocked. What's the most likely outcome once that's fixed?",
        "options": [
          "Signaling was already working, so fixing the blocked RTP range should resolve the call delivery issue",
          "The trunk needs to be deleted and rebuilt from scratch",
          "The DID needs to be reassigned to a different rule entirely",
          "The extension needs a new template"
        ],
        "correct": 0,
        "feedback": "Since registration and routing were already confirmed working, a blocked media port range is consistent with calls not completing properly — fixing the port issue is the targeted next step."
      }
    ],
    "explanation": "Verifying credentials, then routing, then the network path — in that order — isolates exactly where in the chain a new trunk setup is breaking down, instead of guessing."
  },
  {
    "id": "queue-setup-sequence",
    "core": "core1",
    "domain": "b4",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Stand up a working support call queue",
    "summary": "Put the steps for building a new call queue from scratch into the correct order.",
    "brief": "Support wants a proper call queue instead of calls just ringing one person's desk. Arrange the setup steps in order.",
    "steps": [
      "Create the extensions for each support agent who will answer the queue",
      "Create the call queue and set its ring/queue strategy",
      "Add the agent extensions as members of the queue",
      "Set the queue's SLA threshold and hold music/announcements",
      "Assign the support DID to the new queue",
      "Test the queue with a live call and confirm the wallboard shows it correctly"
    ],
    "explanation": "Agents need to exist before they can be added to a queue, the queue itself needs to exist before agents can be assigned or the support DID can be assigned to it, and testing only makes sense once every piece is wired together."
  },
  {
    "id": "ivr-business-hours-sequence",
    "core": "core1",
    "domain": "b4",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Build a working day/night call flow",
    "summary": "Put the steps for a scheduled Digital Receptionist and after-hours routing into the correct order.",
    "brief": "The office wants callers to reach a menu during the day and voicemail after hours and on holidays. Arrange the setup steps in order.",
    "steps": [
      "Record or upload the daytime greeting and menu prompt for the Digital Receptionist",
      "Build the IVR menu options and map each digit to its destination",
      "Define the business hours schedule for the week",
      "Add any holiday/special day exceptions to the schedule",
      "Assign the main DID to the IVR, whose department hours send after-hours calls to voicemail",
      "Call the main number at different times to confirm it behaves correctly for open, closed, and holiday scenarios"
    ],
    "explanation": "The IVR's content and structure need to exist before it can be scheduled, the weekly hours and holiday exceptions both need to be defined before the IVR's department hours can apply them correctly, and testing across all three states is the only way to confirm the whole chain actually works."
  },
  {
    "id": "no-outbound-calls-scenario",
    "core": "core1",
    "domain": "b3",
    "type": "scenario",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Extensions can't make outbound calls after a trunk change",
    "summary": "Trace an outbound-only failure back to a newly added trunk instead of restarting unrelated hardware.",
    "brief": "Every extension gets a fast busy on outbound calls starting this morning. Inbound calls still work fine, and a second SIP trunk was added yesterday afternoon. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "All extensions get 'fast busy' on outbound calls since this morning",
      "details": [
        "Reported by: Office manager",
        "Symptom: inbound calls work fine, every outbound call fails immediately",
        "A new SIP trunk was added yesterday afternoon and set as a second provider"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the best first check?",
        "options": [
          { "label": "Check the outbound rule(s) and confirm which trunk they route through, given the new trunk was just added", "next": "step2", "correct": true },
          { "label": "Restart every extension's IP phone", "next": "end_bad_restart", "correct": false },
          { "label": "Delete the new trunk immediately without checking anything", "next": "end_bad_delete", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The outbound rule was actually edited yesterday to route through the new trunk. What should you check next?",
        "options": [
          { "label": "Check the new trunk's registration status and its simultaneous call/channel limit", "next": "step3", "correct": true },
          { "label": "Check the extensions' voicemail settings", "next": "end_bad_voicemail", "correct": false }
        ]
      },
      "step3": {
        "prompt": "The new trunk shows as registered, but its simultaneous call limit is still set to 0, the default, and was never configured for the provider's actual plan. What's the fix?",
        "options": [
          { "label": "Correct the trunk's simultaneous call limit to match the provider's plan, or point the outbound rule back to the working trunk until it's configured", "next": "end_good", "correct": true },
          { "label": "Leave the limit at 0 and tell staff to keep retrying calls", "next": "end_bad_leave", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "The new trunk's call-capacity limit hadn't been raised from its default, so every call routed through it failed instantly, matching the fast-busy symptom starting right when the outbound rule was changed. Fixing the trunk's limit, or temporarily routing back to the known-good trunk, restores service immediately." },
      "end_bad_restart": { "end": true, "success": false, "prompt": "Restarting phones doesn't address a trunk-side routing or capacity problem, and inbound calls already prove basic registration is fine." },
      "end_bad_delete": { "end": true, "success": false, "prompt": "Deleting the trunk before checking whether the outbound rule even uses it skips the fastest diagnostic step and could remove configuration that was mostly correct." },
      "end_bad_voicemail": { "end": true, "success": false, "prompt": "Voicemail settings have no effect on whether an outbound call can be placed at all. The symptom, instant failure, points to routing or trunk capacity, not mailbox config." },
      "end_bad_leave": { "end": true, "success": false, "prompt": "Leaving the limit at 0 guarantees every outbound call keeps failing. Retrying doesn't change a hard capacity ceiling." }
    },
    "explanation": "Outbound-only failures that start right after a trunk or routing change point directly at that change. Checking which trunk the outbound rule actually uses, then that trunk's registration and capacity settings, finds a misconfigured limit in a couple of steps instead of restarting unrelated hardware."
  },
  {
    "id": "service-restart-terminal",
    "core": "core1",
    "domain": "b1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Restart a stuck 3CX service from the Linux shell",
    "summary": "Use a simulated Debian shell to find and clear a real conflict instead of blindly restarting the service.",
    "brief": "Extensions stopped registering across the whole system, and the 3CX Management Console is unreachable too. At the prompt on the underlying Debian host, find out what's wrong and recover the service.",
    "terminal": [
      {
        "prompt": "Check the status of the 3CX phone system service first.",
        "accepts": ["systemctl status 3cxpbx", "systemctl status 3cxpbx.service"],
        "output": "3cxpbx.service - 3CX Phone System\n   Active: failed (Result: exit-code) since Mon 09:14:02\n   Process: 8821 ExecStart=/usr/bin/3cxpbx (code=exited, status=1)",
        "hint": "Use systemctl status on the 3cxpbx service."
      },
      {
        "prompt": "It failed. Check the service's recent logs to understand why before restarting it blindly.",
        "accepts": ["journalctl -u 3cxpbx -n 50", "journalctl -u 3cxpbx"],
        "output": "... 3cxpbx[8821]: Failed to bind to port 5060: Address already in use ...",
        "hint": "Use journalctl with -u for the service name."
      },
      {
        "prompt": "Port 5060 is already bound by something else. Find out what's using it.",
        "accepts": ["sudo lsof -i :5060", "lsof -i :5060"],
        "output": "COMMAND    PID   USER   NAME\nasterisk   2290  root   *:5060 (LISTEN)",
        "hint": "Use lsof with -i and the port number."
      },
      {
        "prompt": "A leftover Asterisk process, not part of 3CX, is squatting on the SIP port. Stop it so 3CX can bind normally.",
        "accepts": ["sudo kill 2290", "kill 2290"],
        "output": "Process 2290 terminated.",
        "hint": "Use kill with the PID."
      },
      {
        "prompt": "Now start the 3CX service.",
        "accepts": ["systemctl start 3cxpbx", "sudo systemctl start 3cxpbx"],
        "output": "3cxpbx.service - 3CX Phone System\n   Active: active (running)",
        "hint": "Use systemctl start on the 3cxpbx service."
      }
    ],
    "explanation": "Checking status before acting revealed the real cause: a stray, unrelated process squatting on 3CX's SIP port. Reading the logs before restarting anything found the actual conflict instead of blindly cycling the service, which would have failed again immediately for the same reason."
  },
  {
    "id": "new-extension-gui",
    "core": "core1",
    "domain": "b2",
    "type": "gui",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Set up a new employee's extension correctly",
    "summary": "Work through a simulated Management Console panel to provision a new extension the right way.",
    "brief": "A new hire starts Monday and needs a working, properly configured extension. Use the simulated Management Console to set it up.",
    "app": "3CX Management Console — Extensions",
    "goal": "Create a working extension for a new hire, following standard setup practice.",
    "reference": {
      "title": "IT Onboarding Standard — Voice Systems, Section 3: Extension Provisioning",
      "paragraphs": [
        "Every new hire must have a working extension provisioned before their first day. Extensions are assigned sequentially from the department's block and must never be left without a number.",
        "Outbound calls placed from any employee extension must display the organization's main published number as the Caller ID. Extensions must not be left with a blank outbound Caller ID, and using the raw extension number as the outbound ID is reserved for internal test lines only, not employee extensions.",
        "For security, every newly created extension must require the user to reset their password on first login rather than keep the system-assigned default. Voicemail is a standard feature enabled for every employee extension by default so that missed calls are never simply lost; disabling voicemail requires a manager's written request."
      ]
    },
    "tabs": ["general", "voicemail"],
    "panels": {
      "general": {
        "label": "General",
        "controls": [
          { "id": "extension-number", "kind": "text", "label": "Extension number", "initial": "", "placeholder": "e.g. 105" },
          { "id": "outbound-cid", "kind": "select", "label": "Outbound Caller ID", "options": ["Use main company number", "Leave blank", "Use extension number only"], "initial": "Leave blank" },
          { "id": "first-login-reset", "kind": "toggle", "label": "Require password reset on first login", "initial": false }
        ]
      },
      "voicemail": {
        "label": "Voicemail",
        "controls": [
          { "id": "voicemail-enabled", "kind": "toggle", "label": "Voicemail box enabled", "initial": false },
          { "id": "email-forward", "kind": "toggle", "label": "Email voicemail to user", "initial": false }
        ]
      }
    },
    "requirements": [
      { "controlId": "extension-number", "notEquals": "", "label": "Extension number is set.", "hint": "Assign an actual extension number, it is currently blank." },
      { "controlId": "outbound-cid", "equals": "Use main company number", "label": "Outbound Caller ID uses the main company number.", "hint": "Set Outbound Caller ID to the main company number so external calls show a recognizable number, not blank." },
      { "controlId": "first-login-reset", "equals": true, "label": "Password reset on first login is required.", "hint": "Require a password reset on first login instead of leaving the default password in place." },
      { "controlId": "voicemail-enabled", "equals": true, "label": "Voicemail is enabled.", "hint": "Turn on the voicemail box, new hires need somewhere for missed calls to go." }
    ],
    "explanation": "A properly set up extension needs an actual number, a sensible outbound caller ID so external calls don't look blank or wrong, a forced password reset so the default credential isn't left in place, and voicemail enabled so missed calls aren't simply lost."
  },
  {
    "id": "split-dns-terminal",
    "core": "core1",
    "domain": "b1",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Prove that split DNS works for the PBX name",
    "summary": "Check that the PBX name gives the LAN address inside the office and the public address from the internet.",
    "brief": "The PBX is pbx.contoso.com. Its LAN address is 192.168.10.5 and its public address is 203.0.113.20. Office computers should reach it on the LAN address, while remote users must be given the public one. You are at a Windows PC in the office. Type commands as shown, or use an accepted equivalent.",
    "explanation": "Split DNS makes one name give two answers: the PBX's LAN address to computers inside the network (through an internal DNS server, or a firewall that supports hairpin NAT) and its public address to everyone else. On-premise 3CX installs require it, so that phones and apps use the same FQDN wherever they are.",
    "terminal": [
      {
        "prompt": "Look up the PBX name using the office DNS server.",
        "accepts": [
          "nslookup pbx.contoso.com"
        ],
        "output": "Server:  dns1.contoso.local\nAddress:  192.168.10.2\n\nName:    pbx.contoso.com\nAddress:  192.168.10.5",
        "hint": "Use nslookup followed by the name."
      },
      {
        "prompt": "Ask a public DNS server (8.8.8.8) for the same name, as a remote user would.",
        "accepts": [
          "nslookup pbx.contoso.com 8.8.8.8"
        ],
        "output": "Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    pbx.contoso.com\nAddress:  203.0.113.20",
        "hint": "Add the DNS server address after the name."
      },
      {
        "prompt": "Check that the PBX answers on its LAN address.",
        "accepts": [
          "ping 192.168.10.5",
          "ping -n 4 192.168.10.5"
        ],
        "output": "Pinging 192.168.10.5 with 32 bytes of data:\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64\nReply from 192.168.10.5: bytes=32 time<1ms TTL=64",
        "hint": "Ping the LAN address."
      },
      {
        "prompt": "Check from PowerShell that the PBX name accepts connections on its HTTPS port, 5001.",
        "accepts": [
          "Test-NetConnection pbx.contoso.com -Port 5001",
          "Test-NetConnection -ComputerName pbx.contoso.com -Port 5001"
        ],
        "output": "ComputerName     : pbx.contoso.com\nRemoteAddress    : 192.168.10.5\nRemotePort       : 5001\nTcpTestSucceeded : True",
        "hint": "Use Test-NetConnection with the name and -Port 5001."
      }
    ],
    "commands": [
      {
        "cmd": "nslookup name [server]",
        "desc": "Look up a name, optionally asking a specific DNS server"
      },
      {
        "cmd": "ping address",
        "desc": "Check that a host answers"
      },
      {
        "cmd": "Test-NetConnection name -Port n",
        "desc": "Test whether a TCP port accepts connections"
      }
    ]
  },
  {
    "id": "firewall-checker-decision",
    "core": "core1",
    "domain": "b1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Read the Firewall Checker like an administrator",
    "summary": "Match each Firewall Checker result to the firewall behavior behind it, and know when to run it.",
    "brief": "The 3CX Firewall Checker tests your firewall using 3CX's STUN servers. For each result or question, pick the right explanation.",
    "explanation": "The Firewall Checker (Dashboard) checks UDP behavior using STUN: port preservation, full cone NAT, and whether SIP ALG is altering messages. It does not validate TCP ports, and it interrupts PBX services while it runs.",
    "stages": [
      {
        "question": "The checker reports that SIP traffic leaving from port 5060 arrives at the STUN server from a different source port. Which requirement has failed?",
        "options": [
          "Split DNS",
          "Full cone NAT",
          "Port preservation",
          "The SIP ALG test"
        ],
        "correct": 2,
        "feedback": "Port preservation means the firewall keeps the local source port when it translates to the public address; some providers reply to the source port they see."
      },
      {
        "question": "Replies sent from a different STUN address than the one 3CX contacted never arrive. What is that test checking?",
        "options": [
          "SIP ALG",
          "The HTTPS certificate",
          "Port preservation",
          "Full cone NAT"
        ],
        "correct": 3,
        "feedback": "Full cone NAT lets any outside server send traffic to the PBX, which matters because a provider's audio server is often not the one that handles signaling."
      },
      {
        "question": "The hash returned by the 3CX online service is different from the one 3CX calculated locally. What does that tell you?",
        "options": [
          "The license has expired",
          "The STUN server is down",
          "DNS is misconfigured",
          "The firewall changed the SIP message, so SIP ALG is active"
        ],
        "correct": 3,
        "feedback": "The test sends a generic INVITE and compares hashes. A mismatch means a device in the path rewrote the message, which is what SIP ALG does, and it should be turned off."
      },
      {
        "question": "When is the best time to run the Firewall Checker on a live system?",
        "options": [
          "Out of hours, because PBX services stop and restart during the test",
          "Any time, because it never affects calls",
          "Only while a backup is running",
          "Only from an IP phone"
        ],
        "correct": 0,
        "feedback": "The checker stops and restarts PBX services so the SIP ports are free for testing, so run it when calls will not be interrupted."
      }
    ]
  },
  {
    "id": "disk-full-scenario",
    "core": "core1",
    "domain": "b1",
    "type": "scenario",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Recordings stopped saving",
    "summary": "Work out why recordings are not being written and fix the cause for good.",
    "brief": "Staff report that recent call recordings are missing. Find out why and put a lasting fix in place.",
    "explanation": "Running out of disk is a main cause of 3CX downtime. Below about 500 MB free, Disk Protect Mode stops recordings and emails the administrator. The lasting fix is remote storage for recordings and backups, auto-clean for recordings, a voicemail quota, and purging old call and chat logs.",
    "ticket": {
      "subject": "Call recordings have stopped appearing",
      "details": [
        "Recordings are missing since Tuesday morning",
        "Nothing was changed on the system",
        "The Dashboard shows very little free disk space"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "Where do you look first?",
        "options": [
          {
            "label": "Check the Dashboard for disk space and the Event log",
            "next": "disk",
            "correct": true
          },
          {
            "label": "Restart the PBX services and see if recordings return",
            "next": "restart",
            "correct": false
          }
        ]
      },
      "restart": {
        "prompt": "After the restart recordings are still not saved. What now?",
        "options": [
          {
            "label": "Check the Dashboard for disk space and the Event log",
            "next": "disk",
            "correct": true
          },
          {
            "label": "Reinstall the PBX",
            "next": "bad_reinstall",
            "correct": false
          }
        ]
      },
      "disk": {
        "prompt": "Free space is under about 500 MB and the Event log has a disk-near-capacity alert. What is happening?",
        "options": [
          {
            "label": "Disk Protect Mode has stopped recordings being written",
            "next": "fix",
            "correct": true
          },
          {
            "label": "The recording feature has been switched off by the license",
            "next": "bad_license",
            "correct": false
          }
        ]
      },
      "fix": {
        "prompt": "How do you fix it for good?",
        "options": [
          {
            "label": "Send recordings and backups to remote storage, and set recording auto-clean, a voicemail quota, and log purging",
            "next": "done",
            "correct": true
          },
          {
            "label": "Delete files from the 3CX installation folder to free space",
            "next": "bad_delete",
            "correct": false
          },
          {
            "label": "Turn recording off for everyone",
            "next": "bad_off",
            "correct": false
          }
        ]
      },
      "done": {
        "end": true,
        "success": true,
        "prompt": "Space is freed, Disk Protect Mode ends, and recordings are written again. Offloading to remote storage and auto-cleaning keeps the disk from filling again."
      },
      "bad_reinstall": {
        "end": true,
        "success": false,
        "prompt": "Reinstalling would not fix a full disk and risks your data. The Dashboard and Event log show the real cause."
      },
      "bad_license": {
        "end": true,
        "success": false,
        "prompt": "Licensing does not stop recordings. Low disk space does: below about 500 MB free, Disk Protect Mode stops recordings being written."
      },
      "bad_delete": {
        "end": true,
        "success": false,
        "prompt": "Never delete from the 3CX installation folder. Use remote storage, auto-clean, quotas, and purging so the system manages the files."
      },
      "bad_off": {
        "end": true,
        "success": false,
        "prompt": "That removes a compliance feature instead of fixing the disk. Offload and clean up the stored data."
      }
    }
  },
  {
    "id": "phone-provisioning-decision",
    "core": "core1",
    "domain": "b2",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Choose how each phone should be provisioned",
    "summary": "Match RPS, PnP, DHCP option 66, router phones, and manual setup to the situation they suit.",
    "brief": "Several phones need configuring in different circumstances. For each, pick the method that fits.",
    "explanation": "Add the phone to the user with its MAC (no dashes or colons), choose how it connects, then let it provision: RPS (connect within 14 days), PnP, DHCP option 66, or manual setup for phones without a template.",
    "stages": [
      {
        "question": "A new phone from the box, plugged into any network, should configure itself with no address typed on it.",
        "options": [
          "PnP discovery on the LAN",
          "DHCP option 66",
          "Manual configuration",
          "RPS, the vendor redirect service"
        ],
        "correct": 3,
        "feedback": "The phone asks its vendor's RPS server, which 3CX has already given the provisioning URL; it works for cloud and on-premise installs."
      },
      {
        "question": "On the office LAN you see the phone appear under Phones > PnP Phones and you right-click it to assign an extension.",
        "options": [
          "RPS",
          "PnP discovery",
          "DHCP option 66",
          "A router phone"
        ],
        "correct": 1,
        "feedback": "PnP works because the phone announces itself on the local network and the PBX lists it for you to assign."
      },
      {
        "question": "A large managed network, all phones from one vendor, where the DHCP server can hand out the provisioning URL.",
        "options": [
          "Manual configuration",
          "RPS",
          "PnP discovery",
          "DHCP option 66"
        ],
        "correct": 3,
        "feedback": "Option 66 carries the base URL and the phone adds its MAC address; it needs one vendor because vendors use different URL formats."
      },
      {
        "question": "An older phone model that 3CX has no template for.",
        "options": [
          "PnP discovery",
          "Hot desking",
          "Manual configuration with the auth ID, password, and PBX address",
          "RPS"
        ],
        "correct": 2,
        "feedback": "Phones without a template are set up by hand on the phone's own web page, using the extension, authentication ID, password, and FQDN."
      },
      {
        "question": "A branch office with desk phones must reach a cloud-hosted PBX without a VPN.",
        "options": [
          "The Local LAN/VPN option",
          "DHCP option 66 at head office",
          "PnP at head office",
          "A router phone or SBC at the branch"
        ],
        "correct": 3,
        "feedback": "A cloud PBX needs a router phone or SBC on the phones' network; Local LAN/VPN is an extra choice only for on-premise systems."
      }
    ]
  },
  {
    "id": "access-roles-decision",
    "core": "core1",
    "domain": "b2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Give each person the right access role",
    "summary": "Pick the smallest role that does the job, from User up to System Owner.",
    "brief": "You are assigning roles in a growing company. For each person, choose the role that gives what they need and no more.",
    "explanation": "Roles are fixed in V20: User, Receptionist, Supervisor, Department Administrator, Manager, Owner (department roles), then System Administrator and System Owner (system-wide). Give people the smallest role that does the job.",
    "stages": [
      {
        "question": "The receptionist must open or close the office early for their department but should have no administration rights.",
        "options": [
          "Manager",
          "User",
          "Receptionist",
          "Department Administrator"
        ],
        "correct": 2,
        "feedback": "A Receptionist can override office hours and break times for the departments they belong to."
      },
      {
        "question": "A team lead needs call and chat reports and a view of queue activity, but must not change configuration.",
        "options": [
          "Department Administrator",
          "Owner",
          "Supervisor",
          "Receptionist"
        ],
        "correct": 2,
        "feedback": "A Supervisor can view reports and oversee queue activity for their departments."
      },
      {
        "question": "A branch IT contact must configure call handling, trunks, and messaging for one department only.",
        "options": [
          "Manager",
          "Department Administrator",
          "System Administrator",
          "Supervisor"
        ],
        "correct": 1,
        "feedback": "A Department Administrator performs configuration tasks inside the departments they belong to."
      },
      {
        "question": "A department head needs to add users, hear recordings, and listen in on calls for coaching.",
        "options": [
          "Manager",
          "Supervisor",
          "Receptionist",
          "User"
        ],
        "correct": 0,
        "feedback": "A Manager adds user management, recordings, and barge in or listen in to the Receptionist and Supervisor abilities."
      },
      {
        "question": "Which role is the only one that can promote someone to System Administrator?",
        "options": [
          "System Owner",
          "Owner",
          "Manager",
          "System Administrator"
        ],
        "correct": 0,
        "feedback": "Only a System Owner can elevate users to the system-wide roles; an Owner can only elevate within its own departments."
      }
    ]
  },
  {
    "id": "outbound-failover-decision",
    "core": "core1",
    "domain": "b3",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Predict how outbound rules choose a route",
    "summary": "Know when 3CX tries the next route, what stops it, and which rule wins.",
    "brief": "An outbound rule can hold several routes, and rules are checked in order. Answer how 3CX behaves in each case.",
    "explanation": "Outbound rules trigger on the dialed prefix, number length, calling extensions, and departments. A rule has up to five routes tried in order; unregistered trunks are skipped, a busy answer ends the attempt, and a successful or cancelled call stops the hunt.",
    "stages": [
      {
        "question": "An outbound rule has three routes and the first trunk shows red (not registered). What does 3CX do?",
        "options": [
          "Skips it at once and tries the next route",
          "Waits for it to recover",
          "Blocks the call",
          "Retries the first route three times"
        ],
        "correct": 0,
        "feedback": "An unregistered trunk is skipped immediately."
      },
      {
        "question": "The first trunk answers an outbound call with 486 Busy Here. What happens?",
        "options": [
          "The call is sent to voicemail",
          "The caller gets a busy tone and no further route is tried",
          "The next route is tried at once",
          "The call is retried after five seconds"
        ],
        "correct": 1,
        "feedback": "Busy answers (486, 600, and 1408) end the attempt: only failures move on, not a genuine busy."
      },
      {
        "question": "How many routes can a single outbound rule use?",
        "options": [
          "Exactly three",
          "As many as there are trunks",
          "Up to five",
          "Up to two"
        ],
        "correct": 2,
        "feedback": "Each rule has up to five routes, tried in order."
      },
      {
        "question": "Two outbound rules both match a call: a broad rule sits above a specific one. Which applies?",
        "options": [
          "The more specific rule",
          "Both, in turn",
          "The most recently created rule",
          "The upper rule, because the first match wins"
        ],
        "correct": 3,
        "feedback": "Rules are evaluated top to bottom and the first match is used, so order matters."
      },
      {
        "question": "You create a new specific rule. Where does it appear, and what do you do?",
        "options": [
          "At the bottom, so you use Move Up to raise it above the broad rule",
          "At the top automatically",
          "Next to the trunk it uses",
          "It stays disabled until you reorder the list"
        ],
        "correct": 0,
        "feedback": "New rules are added at the bottom with the lowest priority; move them up to give them precedence."
      }
    ]
  },
  {
    "id": "did-routing-scenario",
    "core": "core1",
    "domain": "b3",
    "type": "scenario",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Calls to the new sales number go to the wrong place",
    "summary": "Use the Activity Log to find out what number the trunk really delivers, then correct the routing.",
    "brief": "A new number for sales was added to the trunk yesterday. Callers to it reach the main IVR instead of the sales queue.",
    "explanation": "In V20 a DID is routed by selecting it on its destination (Assigned DID Number(s)). When a call goes to the default route instead, read the Activity Log (Medium shows called=, Verbose shows the INVITE's To header) to see the number the provider actually sent, and make the stored DID match it.",
    "ticket": {
      "subject": "The new sales number rings the main IVR",
      "details": [
        "The DID was added to the trunk yesterday",
        "It is assigned to the sales queue",
        "Calls land in the main IVR, which is the default route"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What do you do first?",
        "options": [
          {
            "label": "Call the number and read the Activity Log at Medium level for the called= value",
            "next": "log",
            "correct": true
          },
          {
            "label": "Reboot the PBX",
            "next": "reboot",
            "correct": false
          }
        ]
      },
      "reboot": {
        "prompt": "After the reboot the number still goes to the main IVR. What next?",
        "options": [
          {
            "label": "Call the number and read the Activity Log at Medium level for the called= value",
            "next": "log",
            "correct": true
          },
          {
            "label": "Ask the provider to issue a new number",
            "next": "bad_provider",
            "correct": false
          }
        ]
      },
      "log": {
        "prompt": "The log shows called=+441632960456, but the queue has the DID entered as 01632960456. What does that mean?",
        "options": [
          {
            "label": "The delivered number does not match the stored one, so the call falls to the default route",
            "next": "fix",
            "correct": true
          },
          {
            "label": "The provider is down",
            "next": "bad_down",
            "correct": false
          }
        ]
      },
      "fix": {
        "prompt": "How do you correct the routing?",
        "options": [
          {
            "label": "Enter the DID in the format the trunk delivers, in E.164 form, and select it in the queue's Assigned DID Number(s)",
            "next": "done",
            "correct": true
          },
          {
            "label": "Create a CID rule on the caller's number",
            "next": "bad_cid",
            "correct": false
          },
          {
            "label": "Point the trunk's default route at the sales queue",
            "next": "bad_default",
            "correct": false
          }
        ]
      },
      "done": {
        "end": true,
        "success": true,
        "prompt": "The DID now matches what the trunk delivers and is assigned on the queue, so calls reach sales. The default route stays as the catch-all for unassigned numbers."
      },
      "bad_provider": {
        "end": true,
        "success": false,
        "prompt": "A new number would have the same format problem. The Activity Log shows exactly what the provider delivers."
      },
      "bad_down": {
        "end": true,
        "success": false,
        "prompt": "If the provider were down the call would not arrive at all. The call arrived and went to the default route because nothing matched."
      },
      "bad_cid": {
        "end": true,
        "success": false,
        "prompt": "CID rules match the caller, not the number that was dialed."
      },
      "bad_default": {
        "end": true,
        "success": false,
        "prompt": "That would send every unassigned number to sales. Fix the number's format and assignment instead."
      }
    }
  },
  {
    "id": "emergency-number-sequence",
    "core": "core1",
    "domain": "b3",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Set up an emergency number correctly",
    "summary": "Put the emergency rule setup steps in order.",
    "brief": "Dialed emergency numbers ignore the normal outbound and office-hours rules. Put the steps for adding one in order.",
    "explanation": "Emergency rules live under Admin > System > Emergency. Each has one mandatory trunk route plus up to four alternatives, can notify by email, by chat to managers or members, or by playing an announcement, and should be tested only as local rules permit.",
    "steps": [
      "Open Admin > System > Emergency and click Add",
      "Enter the rule name and the emergency number",
      "Choose whether the rule is system-wide or limited to a department or extensions",
      "Set the mandatory first route and up to four alternatives",
      "Set the notifications by email, chat, or an announcement",
      "Test it only in the way your provider and local rules allow"
    ]
  },
  {
    "id": "queue-strategy-decision",
    "core": "core1",
    "domain": "b4",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Pick the right queue polling strategy",
    "summary": "Match Prioritized Hunt, Round Robin, Longest Waiting, Least Talk Time, and Hunt by Threes to what a team needs.",
    "brief": "A call queue offers many polling strategies. For each team's wish, choose the strategy that delivers it.",
    "explanation": "Queue strategies include Ring All, Prioritized Hunt, Hunt Random Start, Round Robin, Longest Waiting, Least Talk Time, Fewest Answered, and Hunt by Threes. The AI edition adds skills-based strategies with skill levels 1 to 5.",
    "stages": [
      {
        "question": "Always offer calls first to the most senior agent, and move down the list only when they do not answer.",
        "options": [
          "Prioritized Hunt",
          "Round Robin",
          "Longest Waiting",
          "Ring All"
        ],
        "correct": 0,
        "feedback": "Prioritized Hunt rings members from the top of the list, so list order is priority."
      },
      {
        "question": "Give every logged-in agent a fair, rotating share of calls.",
        "options": [
          "Fewest Answered",
          "Hunt Random Start",
          "Round Robin",
          "Prioritized Hunt"
        ],
        "correct": 2,
        "feedback": "Round Robin distributes calls evenly among logged-in agents."
      },
      {
        "question": "Send the next call to the agent who has been waiting the longest for one.",
        "options": [
          "Round Robin",
          "Hunt by Threes",
          "Longest Waiting",
          "Least Talk Time"
        ],
        "correct": 2,
        "feedback": "Longest Waiting forwards the call to the member waiting longest."
      },
      {
        "question": "Balance the load by how much time agents have spent talking.",
        "options": [
          "Longest Waiting",
          "Least Talk Time",
          "Ring All",
          "Fewest Answered"
        ],
        "correct": 1,
        "feedback": "Least Talk Time sends the call to the member with the least total talk time (Fewest Answered balances the number of calls instead)."
      },
      {
        "question": "Ring three agents at a time until someone answers.",
        "options": [
          "Ring All",
          "Hunt by Threes",
          "Prioritized Hunt",
          "Round Robin"
        ],
        "correct": 1,
        "feedback": "Hunt by Threes rings three agents at once, chosen at random or in list order."
      }
    ]
  },
  {
    "id": "holiday-routing-sequence",
    "core": "core1",
    "domain": "b4",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Set up a holiday closure the V20 way",
    "summary": "Put the steps for a holiday message on a queue in order.",
    "brief": "The support queue should play a special message on a public holiday. Put the steps in order.",
    "explanation": "In V20 office hours belong to departments and are applied at the destination. Holidays are added under Office Hours, and from V20 Update 9 each queue, ring group, IVR, and department can carry its own custom holiday message in its holiday routing.",
    "steps": [
      "Open Office Hours and choose the department the queue belongs to",
      "Confirm the department's time zone is correct",
      "Add the holiday date under Office Holidays",
      "Open the queue's holiday routing settings and choose the destination",
      "Add the custom holiday message to that holiday routing",
      "Repeat for each IVR, ring group, and department that should differ"
    ]
  }
];
})();
