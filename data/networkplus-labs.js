(function () {
  'use strict';
  window.NETPLUS_LABS = [
  {
    "id": "cat6-termination-sequence",
    "core": "core1",
    "domain": "nd3",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Terminate a Cat 6 patch cable in the right order",
    "summary": "Put the hand-termination steps for a copper patch cable into the correct order.",
    "brief": "You're terminating a fresh Cat 6 patch cable by hand. Arrange the steps in the correct order from first to last.",
    "steps": [
      "Strip about 1 inch of the outer jacket without nicking the inner conductors",
      "Untwist the four pairs and arrange them in the correct T568B color order",
      "Trim the wires to an even length and slide them fully into the RJ45 plug",
      "Crimp the connector so the pins pierce the conductors and the strain relief clamps the jacket",
      "Test the finished cable end to end with a cable tester before putting it into service"
    ],
    "explanation": "Jacket removal has to happen before the pairs can be arranged, arranging and trimming has to happen before the wires can be seated in the plug, and crimping has to happen before the cable is usable — testing only makes sense once the termination is physically complete."
  },
  {
    "id": "no-link-light-triage",
    "core": "core1",
    "domain": "nd5",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "No link light on a freshly wired desk",
    "summary": "Work through a dead physical link using the evidence instead of swapping parts at random.",
    "brief": "A user reports their new desk has no network connectivity. The switch port shows no link light at all, and this is a freshly run cable through the building's cable plant.",
    "stages": [
      {
        "question": "What is the best first action given that the port shows no link light at all?",
        "options": [
          "Check that the patch cable is fully seated at both the wall jack and the switch port",
          "Replace the switch entirely",
          "Reinstall the network driver on the user's computer",
          "Change the port's VLAN assignment"
        ],
        "correct": 0,
        "feedback": "A completely dark link light most often points to a basic physical connection issue, so checking that the cable is properly seated at both ends is the fastest, lowest-risk first step."
      },
      {
        "question": "Both ends are fully seated and the link light is still off. What should be checked next?",
        "options": [
          "Test the cable run itself with a cable tester to rule out a wiring fault",
          "Assume the NIC is faulty and replace the computer",
          "Enable Spanning Tree Protocol on the port",
          "Add a static route on the workstation"
        ],
        "correct": 0,
        "feedback": "With seating confirmed, testing the physical cable run itself isolates whether the new installation has a wiring fault, such as a miswired jack or a cut pair."
      },
      {
        "question": "The cable tester shows an open on one pair, consistent with a bad termination at the wall jack. What is the best next step?",
        "options": [
          "Re-terminate the wall jack and retest with the cable tester before declaring it fixed",
          "Leave it as is since three of the four pairs still test fine",
          "Swap the switch port to a different VLAN",
          "Replace the user's network cable only, without touching the jack"
        ],
        "correct": 0,
        "feedback": "Since the fault is isolated to the jack termination, redoing that termination and retesting confirms the fix rather than assuming it worked."
      }
    ],
    "explanation": "Following the physical layer troubleshooting order — confirm seating, test the cable run, then isolate and fix the specific fault found — resolves the issue without guessing at unrelated causes like drivers or VLANs."
  },
  {
    "id": "dns-resolution-terminal",
    "core": "core1",
    "domain": "nd5",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Chase down a hostname that won't resolve",
    "summary": "Use a simulated command prompt to isolate and confirm a fix for a DNS resolution failure.",
    "brief": "A user can reach the intranet file server when typing its IP address, but not when typing its hostname. At the prompt, run the right commands in order to isolate and confirm the fix. Type commands exactly, or use an accepted equivalent.",
    "terminal": [
      {
        "prompt": "Confirm basic IP connectivity first. Ping the server's IP address 10.20.5.10 directly.",
        "accepts": ["ping 10.20.5.10"],
        "output": "Pinging 10.20.5.10 with 32 bytes of data:\nReply from 10.20.5.10: bytes=32 time=1ms TTL=64\n\nPing statistics for 10.20.5.10:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
        "hint": "Use ping followed by the IP address."
      },
      {
        "prompt": "IP connectivity works. Now try resolving the hostname to see if DNS is the problem. Ping the server's hostname 'fileserver01' instead.",
        "accepts": ["ping fileserver01"],
        "output": "Ping request could not find host fileserver01. Please check the name and try again.",
        "hint": "Use ping followed by the hostname."
      },
      {
        "prompt": "That confirms a DNS resolution failure. Query the configured DNS server directly for this hostname to see what it returns.",
        "accepts": ["nslookup fileserver01"],
        "output": "Server:  UnKnown\nAddress:  10.20.0.5\n\n*** UnKnown can't find fileserver01: Non-existent domain",
        "hint": "Use nslookup followed by the hostname."
      },
      {
        "prompt": "The DNS server has no record for this host yet. Flush the local resolver cache in case a stale negative entry is being cached, before you retest.",
        "accepts": ["ipconfig /flushdns"],
        "output": "Windows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.",
        "hint": "Use ipconfig with the flushdns switch."
      },
      {
        "prompt": "With the cache cleared and the DNS team having added the missing record, retry resolving the hostname to confirm the fix.",
        "accepts": ["nslookup fileserver01", "ping fileserver01"],
        "output": "Server:  UnKnown\nAddress:  10.20.0.5\n\nName:    fileserver01\nAddress:  10.20.5.10",
        "hint": "Re-run nslookup or ping on the hostname to confirm it now resolves."
      }
    ],
    "explanation": "Testing by IP first isolated the fault to name resolution rather than basic connectivity. Confirming the missing record with nslookup, clearing a possibly stale cache, and then re-testing verified the DNS fix end-to-end."
  },
  {
    "id": "vlan-segmentation-decision",
    "core": "core1",
    "domain": "nd2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "A single desk can't reach its file shares",
    "summary": "Isolate a single-port symptom to a leftover VLAN assignment instead of a network-wide cause.",
    "brief": "A new workstation was plugged into a port that used to belong to a network printer. It can reach a couple of local devices but can't reach any of its expected file shares, while every other user on the same switch is unaffected.",
    "stages": [
      {
        "question": "What is the most likely explanation given that only this newly connected device is affected?",
        "options": [
          "The switch port is still assigned to the old VLAN used by the printer, not the workstation's data VLAN",
          "The building's core router has failed",
          "The DNS server for the whole company is down",
          "The internet circuit has lost service"
        ],
        "correct": 0,
        "feedback": "Because only the device on this specific port is affected while everyone else works fine, a leftover port-level VLAN assignment is the most likely and easiest cause to check first."
      },
      {
        "question": "How can this theory be confirmed before making any changes?",
        "options": [
          "Check the switch's port configuration to see which VLAN is currently assigned to that port",
          "Reboot the workstation repeatedly",
          "Replace the patch cable",
          "Power cycle the core router"
        ],
        "correct": 0,
        "feedback": "Checking the actual port configuration directly confirms whether the VLAN assignment is the cause, rather than guessing."
      },
      {
        "question": "The port is confirmed to still be on the old printer VLAN. What is the correct fix?",
        "options": [
          "Reassign the port to the VLAN used by workstation data traffic",
          "Delete the printer VLAN entirely",
          "Convert the port to an 802.1Q trunk carrying every VLAN",
          "Disable Spanning Tree Protocol on the switch"
        ],
        "correct": 0,
        "feedback": "Reassigning the access port to the correct VLAN restores the workstation's access to its expected resources without unnecessarily affecting the rest of the network."
      }
    ],
    "explanation": "Recognizing that a single-port, single-device symptom pattern points to a port-level cause narrowed the search quickly, and confirming the VLAN assignment before changing it avoided guessing at unrelated fixes."
  },
  {
    "id": "wireless-interference-decision",
    "core": "core1",
    "domain": "nd2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Conference room Wi-Fi slows down every lunchtime",
    "summary": "Track a time-correlated wireless complaint back to RF interference rather than hardware failure.",
    "brief": "Users in a large conference room complain that Wi-Fi becomes slow and drops mid-call every day around lunchtime, but it works fine in the morning.",
    "stages": [
      {
        "question": "What is the best first step given that the problem is tied to a specific time of day rather than being constant?",
        "options": [
          "Check what other wireless or RF-emitting equipment is active in or near the room around that time",
          "Replace the access point immediately",
          "Reinstall the operating system on affected laptops",
          "Increase the access point's transmit power to maximum"
        ],
        "correct": 0,
        "feedback": "A problem that correlates with a specific time of day, rather than being constant, points toward an environmental or interference cause rather than a hardware failure."
      },
      {
        "question": "Investigation reveals a break room microwave and several personal hotspots are active nearby during lunch, all overlapping the access point's 2.4GHz channel. What is the best next step?",
        "options": [
          "Move clients toward the 5GHz band and verify the channel plan avoids overlap with neighboring devices",
          "Disable the wireless network entirely during lunch",
          "Replace all client laptops",
          "Add a second access point on the exact same channel"
        ],
        "correct": 0,
        "feedback": "Shifting traffic to the less congested 5GHz band and confirming non-overlapping channel assignments directly addresses the interference source identified during lunch hours."
      },
      {
        "question": "After the change, throughput improves but a few older devices that only support 2.4GHz still complain. What is the most reasonable final step?",
        "options": [
          "Assign those legacy 2.4GHz devices to a clean, non-overlapping channel separate from the interference source",
          "Ignore the remaining complaints since most users are fixed",
          "Force all devices back onto the original overlapping channel",
          "Replace the building's internet circuit"
        ],
        "correct": 0,
        "feedback": "For devices that can't move to 5GHz, minimizing interference by placing them on the cleanest available 2.4GHz channel is the most reasonable remaining fix."
      }
    ],
    "explanation": "Recognizing the time-based pattern pointed to interference rather than hardware failure, and addressing both the band and channel plan resolved the issue for most devices while still accommodating legacy hardware."
  },
  {
    "id": "seven-step-methodology-sequence",
    "core": "core1",
    "domain": "nd5",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Work a ticket using the troubleshooting methodology",
    "summary": "Put CompTIA's seven-step troubleshooting methodology into the correct order.",
    "brief": "A user reports intermittent connectivity loss. Put the troubleshooting methodology steps in the correct order for working this ticket from start to finish.",
    "steps": [
      "Identify the problem by gathering information and questioning the user",
      "Establish a theory of probable cause",
      "Test the theory to determine the actual cause",
      "Establish a plan of action and identify potential effects",
      "Implement the solution or escalate as necessary",
      "Verify full system functionality",
      "Document findings, actions, and outcomes"
    ],
    "explanation": "This is the standard seven-step troubleshooting methodology: understand the problem before theorizing, confirm the theory before acting, plan before implementing, and always verify and document after the fix is in place."
  },
  {
    "id": "acl-block-terminal",
    "core": "core1",
    "domain": "nd4",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "An ACL change quietly broke a database connection",
    "summary": "Use a simulated management prompt to find and remove an overly broad access list entry.",
    "brief": "A new application server at 10.10.20.5 can no longer reach its database at 10.10.30.8 after a firewall rule change earlier today. At the prompt, run the right commands in order to find and fix the cause.",
    "terminal": [
      {
        "prompt": "Confirm that the application server currently can't reach the database server.",
        "accepts": ["ping 10.10.30.8"],
        "output": "Pinging 10.10.30.8 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for 10.10.30.8:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)",
        "hint": "Ping the database server's IP address."
      },
      {
        "prompt": "Check the firewall's active access list to see what's being permitted or denied on this path.",
        "accepts": ["show access-list", "show access-lists"],
        "output": "Standard IP access list DB-ACCESS\n    10 deny ip any any (142 matches)\n    20 permit ip host 10.10.20.5 host 10.10.30.8 (0 matches)",
        "hint": "Use the show access-list command."
      },
      {
        "prompt": "The broad deny rule is listed above the specific permit rule, so it matches first and blocks everything. Remove the overly broad deny entry, sequence 10, from the list.",
        "accepts": ["no access-list db-access 10", "no access-list 10"],
        "output": "Access list entry 10 removed. Remaining: 20 permit ip host 10.10.20.5 host 10.10.30.8",
        "hint": "Remove access list entry number 10."
      },
      {
        "prompt": "Confirm the fix by pinging the database server again.",
        "accepts": ["ping 10.10.30.8"],
        "output": "Pinging 10.10.30.8 with 32 bytes of data:\nReply from 10.10.30.8: bytes=32 time=1ms TTL=64\n\nPing statistics for 10.10.30.8:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
        "hint": "Ping the database server's IP address again to confirm connectivity is restored."
      }
    ],
    "explanation": "Access list rules are evaluated in order and stop at the first match, so a broad deny placed above a specific permit blocked all traffic regardless of the intended exception. Removing the overly broad rule let the specific permit take effect."
  },
  {
    "id": "disaster-recovery-decision",
    "core": "core1",
    "domain": "nd3",
    "type": "decision",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Sizing a disaster recovery plan to the budget and the risk",
    "summary": "Match a DR site strategy to a system's real downtime tolerance instead of a one-size-fits-all answer.",
    "brief": "Leadership asks IT to recommend a disaster recovery strategy for the company's order-processing system. Downtime beyond a few minutes results in significant lost revenue, and the budget is described as 'substantial but not unlimited.'",
    "stages": [
      {
        "question": "Given that even a few minutes of downtime is costly, what class of DR site best fits the requirement?",
        "options": [
          "A hot site, so failover can happen almost immediately with live data replication",
          "A cold site, to minimize ongoing cost",
          "No DR site, relying only on nightly backups",
          "A warm site with weekly manual data syncs"
        ],
        "correct": 0,
        "feedback": "When downtime tolerance is measured in minutes, only a hot site with live replication and near-immediate failover realistically meets the requirement."
      },
      {
        "question": "Leadership pushes back that a hot site is expensive. What's the best way to respond, given the stated 'substantial but not unlimited' budget?",
        "options": [
          "Explain that the recovery time requirement, not preference, is what dictates the site type, and quantify the cost of downtime to justify it",
          "Immediately downgrade to a cold site without discussion",
          "Recommend skipping DR planning entirely",
          "Recommend a warm site without mentioning the recovery time tradeoff"
        ],
        "correct": 0,
        "feedback": "Tying the technical recommendation back to the business's own stated cost of downtime keeps the decision grounded in requirements rather than sticker price alone."
      },
      {
        "question": "Leadership agrees to the hot site for order-processing but asks whether every system needs the same treatment. What's the best answer?",
        "options": [
          "No — less critical systems can use a warm or cold site, matching DR investment to each system's actual downtime tolerance",
          "Yes — every system in the company should use a hot site",
          "No — no other system needs any DR plan at all",
          "Yes, but only for systems leadership personally uses"
        ],
        "correct": 0,
        "feedback": "Matching the DR tier to each system's actual business impact avoids overspending on low-priority systems while still protecting the ones that truly need near-zero downtime."
      }
    ],
    "explanation": "High-availability and disaster recovery decisions should be driven by the actual cost of downtime for each system, applying the most expensive protections only where they're truly justified."
  },
  {
    "id": "vlan-connectivity-scenario",
    "core": "core1",
    "domain": "nd5",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 12,
    "title": "New VLAN can't reach the file server",
    "summary": "Trace an inter-VLAN routing ticket layer by layer instead of guessing at server or hardware fixes.",
    "brief": "Newly deployed finance laptops on VLAN 30 can't reach the file server on VLAN 10, even though both VLANs already exist on the same core switch and every other VLAN routes fine.",
    "ticket": {
      "subject": "VLAN 30 devices can't reach the file server on VLAN 10",
      "details": [
        "Reported by: IT helpdesk",
        "Symptom: new finance laptops on VLAN 30 can't ping or map drives to fileserver01 (VLAN 10)",
        "Both VLANs exist on the same core switch; every other VLAN routes fine"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the most efficient first check?",
        "options": [
          { "label": "Confirm VLAN 30 is added to the trunk link(s) between switches and is allowed there", "next": "step2", "correct": true },
          { "label": "Immediately rebuild the file server's network share from scratch", "next": "end_bad_share", "correct": false },
          { "label": "Delete VLAN 30 and recreate it", "next": "end_bad_recreate", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The trunk's allowed-VLAN list is confirmed correct, and VLAN 30 traffic reaches the core switch fine. What should you check next?",
        "options": [
          { "label": "Verify a routed interface (SVI) exists for VLAN 30 with a correct IP and is up", "next": "step3", "correct": true },
          { "label": "Check the file server's antivirus software", "next": "end_bad_av", "correct": false }
        ]
      },
      "step3": {
        "prompt": "The SVI for VLAN 30 exists and is up, but there's still no reachability to VLAN 10. What's the most likely remaining cause?",
        "options": [
          { "label": "Check the ACL or firewall rules between VLANs, a rule may be blocking VLAN 30 to VLAN 10 traffic", "next": "end_good", "correct": true },
          { "label": "Reboot every switch in the building", "next": "end_bad_reboot", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "The inter-VLAN ACL was scoped too narrowly and didn't include the new VLAN 30 subnet. Updating the ACL to permit the needed traffic restores connectivity without touching switching or routing config that was already correct." },
      "end_bad_share": { "end": true, "success": false, "prompt": "The share and server config were never the suspected fault. The devices can't even reach the server's subnet yet, so file-share settings are irrelevant until basic Layer 3 reachability exists." },
      "end_bad_recreate": { "end": true, "success": false, "prompt": "Recreating the VLAN discards config that may already be correct and doesn't address whatever is actually blocking traffic between VLAN 30 and VLAN 10." },
      "end_bad_av": { "end": true, "success": false, "prompt": "This assumes the traffic is reaching the server at all. With no confirmed Layer 3 path yet, antivirus is not the bottleneck to chase first." },
      "end_bad_reboot": { "end": true, "success": false, "prompt": "A blanket reboot is disruptive and untargeted. The evidence, trunk OK, SVI up, still blocked, points specifically at policy or ACL filtering, not device state." }
    },
    "explanation": "Inter-VLAN routing problems are diagnosed layer by layer: confirm the VLAN reaches the switch (trunk and allowed list), confirm it has a routed gateway (SVI up with the correct IP), then confirm nothing downstream (ACL or firewall) is blocking it. Jumping straight to server-side or destructive fixes skips the evidence that was already pointing at policy filtering."
  },
  {
    "id": "mac-table-terminal",
    "core": "core1",
    "domain": "nd3",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Track down which switch port a rogue device is on",
    "summary": "Use a simulated switch prompt to isolate an unknown device to a single physical port.",
    "brief": "Security flagged an unknown MAC address active on the network. At the prompt, find exactly which physical switch port it's connected to, and isolate it.",
    "terminal": [
      {
        "prompt": "Search the switch's MAC address table for the specific address in question, 00:1A:2B:3C:4D:5E.",
        "accepts": ["show mac address-table address 001a.2b3c.4d5e", "show mac address-table address 00:1a:2b:3c:4d:5e"],
        "output": "Vlan  Mac Address       Type      Ports\n20    001a.2b3c.4d5e   DYNAMIC   Gi1/0/14",
        "hint": "Use show mac address-table with the address filter."
      },
      {
        "prompt": "That confirms it's on port Gi1/0/14. Check whether that port is a single access port or a trunk carrying traffic from other switches.",
        "accepts": ["show interface gi1/0/14 status", "show interfaces gi1/0/14 status"],
        "output": "Port       Name   Status     Vlan   Duplex  Speed  Type\nGi1/0/14          connected  20     a-full  a-100  10/100/1000BaseTX",
        "hint": "Use show interface status on that specific port."
      },
      {
        "prompt": "It's a single access port, not a trunk, so the device is directly connected there. Administratively shut the port down until it's investigated in person.",
        "accepts": ["shutdown gi1/0/14"],
        "output": "Interface GigabitEthernet1/0/14: administratively down.",
        "hint": "Use shutdown followed by the port name to disable it."
      }
    ],
    "explanation": "Searching the MAC address table by the specific address identifies the exact port a device is connected to without physically tracing cables. Confirming it's a single access port, not a trunk aggregating other switches, rules out other devices being affected, and administratively shutting the port isolates the device immediately pending investigation."
  },
  {
    "id": "switch-port-config-gui",
    "core": "core1",
    "domain": "nd2",
    "type": "gui",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Configure a switch port for a new VoIP phone",
    "summary": "Configure a simulated switch web UI port page so a phone and its daisy-chained PC both work.",
    "brief": "A new VoIP phone is being installed at a desk, with the user's PC daisy-chained behind it. Use the simulated switch web UI to configure port Gi1/0/22 correctly.",
    "app": "Switch Web UI — Port Configuration",
    "goal": "Configure port Gi1/0/22 so the new VoIP phone and the PC daisy-chained behind it both work correctly.",
    "reference": {
      "title": "Facilities Network Standard — Voice/Data Desk Drops, Section 2.4",
      "paragraphs": [
        "Desk drops serving a single VoIP handset with a PC daisy-chained behind it are provisioned as standard access ports, never as trunk links; trunk mode is reserved exclusively for switch-to-switch and switch-to-router uplinks.",
        "Per the site's VLAN numbering scheme, VLAN 10 is designated for data traffic and VLAN 20 is designated for voice traffic across every wiring closet in the building. On any desk drop supporting a phone, the voice VLAN feature must be enabled and mapped to the voice VLAN so the phone's tagged traffic is kept separate from the PC's untagged data traffic.",
        "Power over Ethernet must be enabled on every port feeding a VoIP handset, since desk phones in this deployment are not provisioned with local power adapters."
      ]
    },
    "tabs": ["port"],
    "panels": {
      "port": {
        "label": "Gi1/0/22",
        "controls": [
          { "id": "port-mode", "kind": "select", "label": "Port mode", "options": ["Access", "Trunk"], "initial": "Trunk", "hint": "A single desk port with one phone and one PC is normally access, not a switch-to-switch trunk." },
          { "id": "data-vlan", "kind": "select", "label": "Data VLAN", "options": ["10 (Data)", "20 (Voice)", "1 (Default)"], "initial": "1 (Default)" },
          { "id": "voice-vlan", "kind": "toggle", "label": "Enable voice VLAN", "initial": false },
          { "id": "voice-vlan-id", "kind": "select", "label": "Voice VLAN ID", "options": ["20 (Voice)", "10 (Data)"], "initial": "10 (Data)" },
          { "id": "poe", "kind": "toggle", "label": "PoE power", "initial": false, "hint": "The phone needs power from the switch." }
        ]
      }
    },
    "requirements": [
      { "controlId": "port-mode", "equals": "Access", "label": "Port mode is Access.", "hint": "Switch the port mode to Access, this is a single edge device, not a switch-to-switch trunk." },
      { "controlId": "data-vlan", "equals": "10 (Data)", "label": "Data VLAN is set correctly.", "hint": "Set the data VLAN to 10 (Data) for the PC's traffic." },
      { "controlId": "voice-vlan", "equals": true, "label": "Voice VLAN is enabled.", "hint": "Turn on the voice VLAN so the phone gets tagged separately from the PC." },
      { "controlId": "voice-vlan-id", "equals": "20 (Voice)", "label": "Voice VLAN ID is correct.", "hint": "Set the voice VLAN ID to 20 (Voice), not the data VLAN." },
      { "controlId": "poe", "equals": true, "label": "PoE is enabled.", "hint": "Turn on PoE power, without it the phone has no power source." }
    ],
    "explanation": "A desk port serving one phone with a PC daisy-chained behind it should be an access port, not a trunk, carrying two separate VLANs, one tagged for voice and one untagged for data, with PoE enabled so the phone gets power. Missing any one of these, wrong port mode, wrong VLAN, voice VLAN disabled, or no PoE, breaks either the phone, the PC, or both."
  },
  {
    "id": "encapsulation-order",
    "core": "core1",
    "domain": "nd1",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Put the encapsulation process in the right order",
    "summary": "Arrange how data gets wrapped, layer by layer, on its way from an application down to the wire.",
    "brief": "An application on one host is about to send data to an application on another host. Arrange the encapsulation process in the order it actually happens, from the application's raw data down to what's transmitted on the wire.",
    "steps": [
      "The application generates raw data to send",
      "The Transport layer adds a header, turning the data into a segment",
      "The Network layer adds a header, turning the segment into a packet",
      "The Data Link layer adds a header and trailer, turning the packet into a frame",
      "The Physical layer converts the frame into bits and transmits them as a signal"
    ],
    "explanation": "Encapsulation always moves down the stack, with each layer wrapping the layer above it in its own header (and, at the Data Link layer, a trailer too) — Transport turns data into a segment, Network turns that into a packet, Data Link turns that into a frame, and Physical is what actually puts it on the wire. The receiving side reverses this exact order on the way back up, stripping one header at a time."
  },
  {
    "id": "vlsm-subnet-sizing-decision",
    "core": "core1",
    "domain": "nd1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Size subnets with VLSM",
    "summary": "Carve one /24 into right-sized subnets using usable-host math.",
    "brief": "You have 192.168.10.0/24 to divide among three segments with different needs, using variable-length subnet masks. Remember that usable hosts equal 2 to the host bits minus 2.",
    "explanation": "VLSM sizes each subnet to its host count: find the smallest mask whose usable hosts (2^n - 2) cover the need, allocate the largest subnets first, and use /30 for two-device links.",
    "stages": [
      {
        "question": "The server LAN needs about 100 hosts. Which mask fits it with the least waste?",
        "options": [
          "/25 (126 usable hosts)",
          "/26 (62 usable hosts)",
          "/27 (30 usable hosts)",
          "/24 (254 usable hosts)"
        ],
        "correct": 0,
        "feedback": "A /25 has 7 host bits, so 128 addresses and 126 usable, enough for 100. A /26 only gives 62, and a /24 wastes space."
      },
      {
        "question": "The office LAN needs about 50 hosts. Which mask fits from the remaining space?",
        "options": [
          "/26 (62 usable hosts)",
          "/27 (30 usable hosts)",
          "/28 (14 usable hosts)",
          "/25 (126 usable hosts)"
        ],
        "correct": 0,
        "feedback": "A /26 has 6 host bits, so 64 addresses and 62 usable, enough for 50 with a little growth room."
      },
      {
        "question": "A point-to-point link between two routers needs just two addresses. Which mask is the best fit?",
        "options": [
          "/30 (2 usable hosts)",
          "/28 (14 usable hosts)",
          "/29 (6 usable hosts)",
          "/26 (62 usable hosts)"
        ],
        "correct": 0,
        "feedback": "A /30 has 2 host bits, so 4 addresses and 2 usable, exactly right for a two-router link."
      }
    ]
  },
  {
    "id": "ipv6-address-types-decision",
    "core": "core1",
    "domain": "nd1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Identify IPv6 address types",
    "summary": "Recognize link-local, global unicast, unique local, and multicast IPv6 addresses by their prefixes.",
    "brief": "While reading a router's interface output, you see several IPv6 addresses and must say what each one is.",
    "explanation": "IPv6 address types are recognized by prefix: fe80::/10 link-local, 2000::/3 global unicast, fc00::/7 unique local, and ff00::/8 multicast, which replaces IPv4 broadcast.",
    "stages": [
      {
        "question": "Which address type is fe80::1a2b:3c4d:5e6f:7081?",
        "options": [
          "Link-local, valid only on the local link",
          "Global unicast, routable on the Internet",
          "Unique local, private to an organization",
          "Multicast"
        ],
        "correct": 0,
        "feedback": "fe80::/10 is the link-local range, configured automatically on every interface and never routed."
      },
      {
        "question": "Which address type is 2001:db8:10:1::25?",
        "options": [
          "Global unicast, routable on the Internet",
          "Link-local",
          "Unique local",
          "Loopback"
        ],
        "correct": 0,
        "feedback": "Global unicast addresses come from 2000::/3 and are publicly routable, like public IPv4 addresses."
      },
      {
        "question": "Which address type is fd12:3456:789a::1?",
        "options": [
          "Unique local, the IPv6 equivalent of private space",
          "Global unicast",
          "Link-local",
          "Multicast"
        ],
        "correct": 0,
        "feedback": "fc00::/7 (in practice fd00::/8) is unique local space, used inside an organization and not routed on the Internet."
      },
      {
        "question": "Which is ff02::1, and what does it replace from IPv4?",
        "options": [
          "An all-nodes multicast address, replacing broadcast",
          "A link-local unicast address replacing APIPA",
          "An anycast address replacing NAT",
          "A loopback address replacing localhost"
        ],
        "correct": 0,
        "feedback": "IPv6 has no broadcast; ff00::/8 multicast addresses, such as ff02::1 for all nodes on the link, do that job."
      }
    ]
  },
  {
    "id": "dhcp-dora-lease-sequence",
    "core": "core1",
    "domain": "nd3",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Follow a DHCP lease from start to renewal",
    "summary": "Order the messages of a DHCP exchange, then the renewal.",
    "brief": "A new laptop joins the network and obtains its address from a DHCP server. Arrange the steps from first to last.",
    "explanation": "DHCP leases follow Discover, Offer, Request, Acknowledge. The client then renews with its server at half the lease time and tries to rebind with any server at 87.5 percent if the renewal fails.",
    "steps": [
      "The client broadcasts a DHCP Discover",
      "A DHCP server replies with an Offer containing an address and settings",
      "The client sends a Request for the offered address",
      "The server confirms with an Acknowledgment and the lease begins",
      "At 50 percent of the lease the client tries to renew with the same server",
      "If that fails, at 87.5 percent the client tries to rebind with any server"
    ]
  },
  {
    "id": "switch-duplex-mismatch-terminal",
    "core": "core1",
    "domain": "nd5",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "A slow link with CRC errors on a switch port",
    "summary": "Use a simulated switch CLI to find and fix a duplex mismatch.",
    "brief": "A user's PC is very slow and a file transfer keeps stalling. Port Gi1/0/14 is suspect. From privileged mode, inspect it and correct the setting. Type commands exactly, or use an accepted equivalent.",
    "explanation": "Half duplex at 100 Mb/s with CRC errors and late collisions is the signature of a duplex mismatch: one end is hard-coded while the other negotiates. Setting both speed and duplex to auto (or hard-coding both ends the same) clears it, the counters confirm the fix, and the change is saved to startup.",
    "terminal": [
      {
        "prompt": "Display the details and counters for interface GigabitEthernet1/0/14.",
        "accepts": [
          "show interfaces gigabitethernet1/0/14",
          "show interfaces gi1/0/14",
          "show interface gi1/0/14",
          "show int gi1/0/14"
        ],
        "output": "GigabitEthernet1/0/14 is up, line protocol is up\n  Half-duplex, 100Mb/s, media type is 10/100/1000BaseTX\n  Input queue: 0/75/0/0 (size/max/drops/flushes)\n     312 input errors, 288 CRC, 0 frame, 0 overrun\n     1520 late collision",
        "hint": "Use show interfaces with the interface name."
      },
      {
        "prompt": "Late collisions and CRC errors on half duplex point to a mismatch. Enter global configuration mode.",
        "accepts": [
          "configure terminal",
          "conf t"
        ],
        "output": "Enter configuration commands, one per line.  End with CNTL/Z.",
        "hint": "Use the configure terminal command."
      },
      {
        "prompt": "Select the interface to change.",
        "accepts": [
          "interface gigabitethernet1/0/14",
          "interface gi1/0/14",
          "int gi1/0/14"
        ],
        "output": "",
        "hint": "Use interface followed by the interface name."
      },
      {
        "prompt": "Let the port negotiate duplex with the PC.",
        "accepts": [
          "duplex auto"
        ],
        "output": "",
        "hint": "Use the duplex command with the auto option."
      },
      {
        "prompt": "Let the port negotiate speed as well.",
        "accepts": [
          "speed auto"
        ],
        "output": "",
        "hint": "Use the speed command with the auto option."
      },
      {
        "prompt": "Leave configuration mode.",
        "accepts": [
          "end"
        ],
        "output": "",
        "hint": "Return to privileged mode."
      },
      {
        "prompt": "Verify the interface again.",
        "accepts": [
          "show interfaces gigabitethernet1/0/14",
          "show interfaces gi1/0/14",
          "show interface gi1/0/14",
          "show int gi1/0/14"
        ],
        "output": "GigabitEthernet1/0/14 is up, line protocol is up\n  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX\n     0 input errors, 0 CRC, 0 frame, 0 overrun\n     0 late collision",
        "hint": "Use show interfaces again."
      },
      {
        "prompt": "Save the configuration so it survives a reboot.",
        "accepts": [
          "copy running-config startup-config",
          "copy run start",
          "write memory",
          "wr"
        ],
        "output": "Destination filename [startup-config]?\nBuilding configuration...\n[OK]",
        "hint": "Copy the running configuration to startup."
      }
    ],
    "commands": [
      {
        "cmd": "show interfaces <name>",
        "desc": "Status, speed, duplex, and error counters"
      },
      {
        "cmd": "configure terminal",
        "desc": "Enter global configuration mode"
      },
      {
        "cmd": "interface <name>",
        "desc": "Select an interface to configure"
      },
      {
        "cmd": "duplex auto",
        "desc": "Negotiate duplex automatically"
      },
      {
        "cmd": "speed auto",
        "desc": "Negotiate speed automatically"
      },
      {
        "cmd": "copy running-config startup-config",
        "desc": "Save the configuration"
      }
    ]
  },
  {
    "id": "dhcp-relay-fix-terminal",
    "core": "core1",
    "domain": "nd5",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "A new VLAN's clients all get 169.254 addresses",
    "summary": "Add a DHCP relay (IP helper) on a router interface.",
    "brief": "VLAN 20 was just created and every client on it shows a 169.254.x.x address, while other VLANs work. The DHCP server is 10.0.0.5 on another subnet. Fix the router. Type commands exactly, or use an accepted equivalent.",
    "explanation": "Routers do not forward broadcasts, so DHCP Discover messages from a new VLAN never reach a server on another subnet and clients fall back to APIPA. An ip helper-address on the VLAN's gateway interface converts them to unicast toward the DHCP server.",
    "terminal": [
      {
        "prompt": "Enter global configuration mode.",
        "accepts": [
          "configure terminal",
          "conf t"
        ],
        "output": "Enter configuration commands, one per line.  End with CNTL/Z.",
        "hint": "Use the configure terminal command."
      },
      {
        "prompt": "Select the VLAN 20 gateway interface.",
        "accepts": [
          "interface vlan 20",
          "int vlan 20",
          "interface vlan20"
        ],
        "output": "",
        "hint": "Use interface followed by vlan 20."
      },
      {
        "prompt": "Forward DHCP broadcasts from this interface to the DHCP server at 10.0.0.5.",
        "accepts": [
          "ip helper-address 10.0.0.5"
        ],
        "output": "",
        "hint": "Use the ip helper-address command with the server address."
      },
      {
        "prompt": "Leave configuration mode.",
        "accepts": [
          "end"
        ],
        "output": "",
        "hint": "Return to privileged mode."
      },
      {
        "prompt": "Save the configuration.",
        "accepts": [
          "copy running-config startup-config",
          "copy run start",
          "write memory",
          "wr"
        ],
        "output": "Destination filename [startup-config]?\nBuilding configuration...\n[OK]",
        "hint": "Copy the running configuration to startup."
      }
    ],
    "commands": [
      {
        "cmd": "configure terminal",
        "desc": "Enter global configuration mode"
      },
      {
        "cmd": "interface vlan <id>",
        "desc": "Select a VLAN interface"
      },
      {
        "cmd": "ip helper-address <server>",
        "desc": "Relay DHCP broadcasts to a server"
      },
      {
        "cmd": "show ip interface",
        "desc": "Display interface IP settings"
      },
      {
        "cmd": "copy running-config startup-config",
        "desc": "Save the configuration"
      }
    ]
  },
  {
    "id": "dns-record-types-terminal",
    "core": "core1",
    "domain": "nd3",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Look up DNS record types with nslookup",
    "summary": "Query MX, AAAA, TXT, and PTR information from the command line.",
    "brief": "You are verifying a domain's DNS before a mail migration. Use nslookup to query specific record types. Type commands exactly, or use an accepted equivalent.",
    "explanation": "Each record type answers a different question: MX lists mail servers with priority, AAAA gives IPv6 addresses, TXT carries data such as SPF policies, and a PTR record, queried by giving an IP address, maps it back to a name.",
    "terminal": [
      {
        "prompt": "Find the mail servers for example.com.",
        "accepts": [
          "nslookup -type=mx example.com",
          "nslookup -type=MX example.com",
          "nslookup -q=mx example.com"
        ],
        "output": "example.com\tMX preference = 10, mail exchanger = mail1.example.com\nexample.com\tMX preference = 20, mail exchanger = mail2.example.com",
        "hint": "Use nslookup with the MX record type and the domain."
      },
      {
        "prompt": "Find the IPv6 address of www.example.com.",
        "accepts": [
          "nslookup -type=aaaa www.example.com",
          "nslookup -type=AAAA www.example.com",
          "nslookup -q=aaaa www.example.com"
        ],
        "output": "Name:    www.example.com\nAddress:  2606:2800:220:1::1",
        "hint": "Use nslookup with the AAAA record type and the name."
      },
      {
        "prompt": "Check the domain's TXT records for an SPF policy.",
        "accepts": [
          "nslookup -type=txt example.com",
          "nslookup -type=TXT example.com",
          "nslookup -q=txt example.com"
        ],
        "output": "example.com\ttext =\n\t\"v=spf1 include:_spf.example.com ~all\"",
        "hint": "Use nslookup with the TXT record type."
      },
      {
        "prompt": "Do a reverse lookup of the address 93.184.216.34.",
        "accepts": [
          "nslookup 93.184.216.34"
        ],
        "output": "Name:    www.example.com\nAddress:  93.184.216.34",
        "hint": "Give nslookup the IP address to query its PTR record."
      }
    ],
    "commands": [
      {
        "cmd": "nslookup -type=mx <domain>",
        "desc": "Query mail exchanger records"
      },
      {
        "cmd": "nslookup -type=aaaa <name>",
        "desc": "Query IPv6 address records"
      },
      {
        "cmd": "nslookup -type=txt <domain>",
        "desc": "Query text records such as SPF"
      },
      {
        "cmd": "nslookup <ip>",
        "desc": "Reverse lookup (PTR record)"
      },
      {
        "cmd": "ping",
        "desc": "Test reachability only"
      }
    ]
  },
  {
    "id": "wifi-capacity-scenario",
    "core": "core1",
    "domain": "nd5",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Slow Wi-Fi in a crowded conference room",
    "summary": "Separate a coverage problem from a capacity problem before changing hardware.",
    "brief": "Wi-Fi in a conference room is unusably slow during all-hands meetings, although signal strength looks excellent. Work the ticket by choosing your action at each step.",
    "explanation": "Strong signal with slow speeds in a crowded space is a capacity problem, not coverage. Confirm it with client counts and channel utilization, then add access points and use cleaner, higher-capacity bands.",
    "ticket": {
      "subject": "Conference room Wi-Fi unusable during meetings",
      "details": [
        "Reported by: Facilities",
        "Symptom: very slow speeds and drops with about 150 devices present",
        "Signal strength shows full bars; one access point serves the room"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What is the best first step?",
        "options": [
          {
            "label": "Check the controller for client count, channel utilization, and retries on that access point during a meeting",
            "next": "step2",
            "correct": true
          },
          {
            "label": "Increase the access point's transmit power to the maximum",
            "next": "end_bad_power",
            "correct": false
          },
          {
            "label": "Replace the access point with the same model immediately",
            "next": "end_bad_replace",
            "correct": false
          }
        ]
      },
      "step2": {
        "prompt": "The data shows 150 clients on one 2.4 GHz radio with very high channel utilization and many retries. What does this indicate?",
        "options": [
          {
            "label": "A capacity problem: too many clients sharing too little airtime",
            "next": "step3",
            "correct": true
          },
          {
            "label": "A coverage problem: the signal is too weak",
            "next": "end_bad_coverage",
            "correct": false
          },
          {
            "label": "A cabling problem on the access point's uplink",
            "next": "end_bad_cable",
            "correct": false
          }
        ]
      },
      "step3": {
        "prompt": "What is the best fix?",
        "options": [
          {
            "label": "Add access points to share the load, use 5 GHz and 6 GHz channels with band steering, and plan non-overlapping channels",
            "next": "end_good",
            "correct": true
          },
          {
            "label": "Move the access point to the center of the room and leave it as the only one",
            "next": "end_bad_move",
            "correct": false
          }
        ]
      },
      "end_good": {
        "end": true,
        "success": true,
        "prompt": "High client counts with strong signal and busy airtime are a capacity problem. More access points on clean channels in the higher bands, with band steering, spread the load and restore performance."
      },
      "end_bad_power": {
        "end": true,
        "success": false,
        "prompt": "More power does not add airtime. Strong signal was never the problem, and louder transmit power can make interference with neighbors worse."
      },
      "end_bad_replace": {
        "end": true,
        "success": false,
        "prompt": "A like-for-like replacement has the same capacity limit, so the room would be slow again."
      },
      "end_bad_coverage": {
        "end": true,
        "success": false,
        "prompt": "Signal strength was already excellent, so adding coverage would not help; the airtime is exhausted."
      },
      "end_bad_cable": {
        "end": true,
        "success": false,
        "prompt": "A bad uplink would affect every client regardless of client count and would show on interface counters, not channel utilization."
      },
      "end_bad_move": {
        "end": true,
        "success": false,
        "prompt": "Repositioning a single access point cannot create the airtime that 150 clients need."
      }
    }
  },
  {
    "id": "cabling-and-media-selection-decision",
    "core": "core1",
    "domain": "nd1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Choose the right cable and connector",
    "summary": "Match three installation requirements to media, connectors, and standards.",
    "brief": "You are specifying cabling for three different links in a new building.",
    "explanation": "Choose by distance, speed, and environment: twisted pair with RJ45 up to 100 m, multimode fiber with SR optics for hundreds of meters, single-mode with LR optics for kilometers, and direct attach cables for very short in-rack links.",
    "stages": [
      {
        "question": "A new desk drop must carry Gigabit Ethernet 85 meters from the wiring closet. What should be installed?",
        "options": [
          "Cat 6 or Cat 5e UTP with RJ45 connectors, supporting 1000BASE-T",
          "Single-mode fiber with SC connectors",
          "RG-6 coaxial cable with F-type connectors",
          "RJ11 telephone cable"
        ],
        "correct": 0,
        "feedback": "Twisted pair rated Cat 5e or better supports 1000BASE-T up to 100 meters and terminates with RJ45 connectors."
      },
      {
        "question": "Two buildings 8 km apart need a 10 Gb link. What should be used?",
        "options": [
          "Single-mode fiber with 10GBASE-LR optics",
          "Multimode fiber with 10GBASE-SR optics",
          "Cat 6a UTP",
          "Direct attach copper cable"
        ],
        "correct": 0,
        "feedback": "10GBASE-LR runs about 10 km over single-mode fiber. SR is for a few hundred meters of multimode, and copper is limited to 100 meters."
      },
      {
        "question": "A server must connect to the top-of-rack switch 2 meters away at 10 Gb with the lowest cost and power. What fits?",
        "options": [
          "A direct attach (twinax) cable with SFP+ ends",
          "A Cat 5 patch cable",
          "Single-mode fiber with LC connectors and separate LR optics",
          "A coaxial cable"
        ],
        "correct": 0,
        "feedback": "A direct attach cable has the transceivers built in and is the cheapest, lowest-power choice for short in-rack links."
      }
    ]
  }
];
})();
