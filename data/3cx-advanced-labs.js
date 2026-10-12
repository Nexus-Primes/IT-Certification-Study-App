(function () {
  'use strict';
  window.THREECX_ADVANCED_LABS = [
  {
    "id": "call-flow-designer-decision",
    "core": "core1",
    "domain": "a1",
    "type": "decision",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Design a call flow that checks the CRM before routing",
    "summary": "Build up a custom call flow that looks up caller data and branches before it reaches an agent.",
    "brief": "Sales wants VIP customers identified and routed to their dedicated account manager automatically, with everyone else going to the general queue.",
    "stages": [
      {
        "question": "What's the right building block to determine whether an incoming caller is a VIP before deciding where to route them?",
        "options": [
          "A CRM/database lookup node that checks the caller's number against the VIP list in real time",
          "A static inbound rule pointing straight to the account manager's extension",
          "A ring group containing every salesperson",
          "A voicemail box for VIP callers"
        ],
        "correct": 0,
        "feedback": "A static inbound rule can't make a decision based on who's calling — a real-time CRM lookup node is what lets the flow branch based on caller identity."
      },
      {
        "question": "The lookup confirms a VIP match. What should the flow do next to route them correctly?",
        "options": [
          "Branch to a path that transfers directly to the dedicated account manager's extension",
          "Send them into the general support queue like everyone else",
          "Play the standard IVR menu regardless of the match",
          "Hang up and ask them to call back"
        ],
        "correct": 0,
        "feedback": "Once the VIP condition is confirmed, the flow should branch to the path built specifically for that outcome — routing straight to their dedicated contact."
      },
      {
        "question": "Before this flow goes live, what's the most important step left?",
        "options": [
          "Test and debug the flow with both VIP and non-VIP caller scenarios to confirm each branch behaves correctly",
          "Immediately publish it with no further verification, since the logic looks correct on screen",
          "Delete the general queue path since VIPs are now handled separately",
          "Disable the CRM connector entirely"
        ],
        "correct": 0,
        "feedback": "A flow with conditional branches needs to be tested against every realistic scenario before going live, since a mistake in the logic could misroute real customers."
      }
    ],
    "explanation": "Advanced call flows combine a real-time data lookup with conditional branching to make smarter routing decisions than a static rule ever could — but that added complexity is exactly why testing every branch before launch matters."
  },
  {
    "id": "remote-extension-security-decision",
    "core": "core1",
    "domain": "a3",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Secure a remote employee's extension properly",
    "summary": "Layer connectivity, brute-force protection, and encryption for a remote worker's extension.",
    "brief": "A new remote employee needs a working, secure extension, and their home network is a standard consumer router they can't configure.",
    "stages": [
      {
        "question": "The employee is on a home network they can't configure port forwarding on. What's the best way to get their extension working securely?",
        "options": [
          "Use 3CX Tunnel so the app connects through a single encrypted channel without needing router changes",
          "Ask them to open a wide range of SIP and RTP ports on their home router",
          "Give them a static public IP for their home network",
          "Disable authentication on their extension to simplify the connection"
        ],
        "correct": 0,
        "feedback": "3CX Tunnel is specifically designed for exactly this case — a secure connection that doesn't require the remote user to touch their router's firewall settings at all."
      },
      {
        "question": "A few weeks later, the activity log shows repeated failed login attempts against several extension numbers from an unfamiliar IP address. What should already be protecting the system from this?",
        "options": [
          "Blacklist / failed authentication protection, which should be auto-blocking that IP after repeated failures",
          "3CX Tunnel alone, which doesn't address brute-force login attempts",
          "SRTP, which only protects media, not login attempts",
          "Nothing — this requires purchasing separate third-party security software"
        ],
        "correct": 0,
        "feedback": "The built-in blacklist and failed-authentication protection is designed to automatically block IPs after repeated failed attempts, directly addressing this kind of brute-force pattern."
      },
      {
        "question": "Management asks whether call audio and call setup signaling are both protected from eavesdropping for this remote worker. What confirms both are covered?",
        "options": [
          "TLS is protecting signaling and SRTP is protecting the media stream — both need to be enabled, not just one",
          "TLS alone covers both signaling and audio",
          "SRTP alone covers both signaling and audio",
          "Neither is necessary once 3CX Tunnel is in use"
        ],
        "correct": 0,
        "feedback": "TLS and SRTP protect two different parts of a call — signaling and media respectively — so both need to be in place for the whole call to be encrypted end to end."
      }
    ],
    "explanation": "Securing a remote extension is a layered problem: connectivity (Tunnel), brute-force protection (blacklist), and encryption (TLS plus SRTP) each address a different risk, and all three matter together."
  },
  {
    "id": "backup-before-update-sequence",
    "core": "core1",
    "domain": "a3",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 6,
    "title": "Apply a maintenance update the safe way",
    "summary": "Put the steps for a planned system update into the correct order.",
    "brief": "A new 3CX maintenance update is available. Arrange the steps to apply it safely and responsibly.",
    "steps": [
      "Schedule the update for a planned low-traffic maintenance window",
      "Take a manual backup of the current configuration immediately before starting",
      "Notify users that a brief service interruption is expected",
      "Apply the maintenance update",
      "Verify extensions, trunks, and queues are all working normally after the update",
      "Document the update and outcome for the maintenance log"
    ],
    "explanation": "Scheduling and backing up come before any risky change is applied, the actual update only happens once a safety net and warning are in place, and verification plus documentation close out the process once the system is confirmed healthy."
  },
  {
    "id": "tenant-onboarding-sequence",
    "core": "core1",
    "domain": "a4",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Onboard a new hosted tenant the right way",
    "summary": "Put the steps for bringing a brand-new hosted customer live on a multi-tenant platform into the correct order.",
    "brief": "A hosting provider is onboarding a new small-business client onto their multi-tenant 3CX platform. Arrange the steps in order.",
    "steps": [
      "Follow the tenant provisioning workflow to create a new isolated PBX instance for the customer",
      "Allocate licensing from the pooled capacity and set that tenant's resource limits",
      "Configure the customer's extensions, trunk, and basic call routing within their isolated instance",
      "Apply the customer's or reseller's branding if white-labeling is part of the offering",
      "Work through the onboarding checklist, including number porting and user training, before go-live",
      "Confirm the tenant appears correctly in centralized monitoring before officially cutting over"
    ],
    "explanation": "The isolated instance has to exist before it can be licensed or configured, configuration and branding come before the go-live checklist, and centralized monitoring confirmation is the last safety check before a new tenant is trusted to go live."
  },
  {
    "id": "one-way-audio-decision",
    "core": "core1",
    "domain": "a5",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Chase down a one-way audio complaint",
    "summary": "Work through a call-quality complaint the same way you would any evidence-first troubleshooting task.",
    "brief": "A remote employee reports that on calls, they can hear the customer, but the customer can never hear them.",
    "stages": [
      {
        "question": "What kind of issue does this symptom describe?",
        "options": [
          "One-way audio, most often caused by a blocked or misrouted RTP media path in one direction",
          "A registration failure",
          "A codec mismatch preventing the call from connecting at all",
          "A licensing limit being reached"
        ],
        "correct": 0,
        "feedback": "Audio working in only one direction is the defining symptom of a one-way audio problem, which is different from a call that fails to connect or register at all."
      },
      {
        "question": "This only happens for this one remote employee, not for anyone in the office. What's the most likely next thing to check?",
        "options": [
          "Whether their home network's NAT handling is interfering with the RTP media path",
          "The office trunk's registration status",
          "The queue's SLA threshold",
          "The extension's outbound caller ID setting"
        ],
        "correct": 0,
        "feedback": "Since the problem is isolated to one remote user on a different network, a NAT-related media path issue for that specific connection is far more likely than a server-wide or office-network problem."
      },
      {
        "question": "Switching that employee's app to connect through 3CX Tunnel resolves the issue. What does that confirm about the original cause?",
        "options": [
          "Their previous direct connection wasn't handling the media path correctly through their home router's NAT",
          "The employee's headset was defective",
          "The office trunk needed to be re-registered",
          "The queue strategy needed to be changed"
        ],
        "correct": 0,
        "feedback": "If routing the connection through Tunnel fixes it, that confirms the original direct-connection NAT and media-path handling was the actual cause, not a hardware, trunk, or queue issue."
      }
    ],
    "explanation": "Isolating whether an audio issue affects everyone or just one connection, then checking the network path for that specific case, follows the same evidence-first troubleshooting logic as any good diagnostic process, rather than guessing at unrelated fixes."
  },
  {
    "id": "crm-integration-decision",
    "core": "core1",
    "domain": "a2",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Match the right feature to each CRM request",
    "summary": "Sort out screen pop, click-to-call, and call activity logging for a sales team's CRM rollout.",
    "brief": "The sales team has a wish list for how 3CX should work with their CRM, and each request needs the right feature.",
    "stages": [
      {
        "question": "The sales team wants a customer's account details to pop up automatically the instant a call comes in from that person. Which feature accomplishes this?",
        "options": [
          "Screen pop, tied to the CRM connector matching the caller's number to a record",
          "Click-to-call",
          "Live chat widget",
          "Queue wallboard"
        ],
        "correct": 0,
        "feedback": "Screen pop is specifically the feature that surfaces a matching record automatically the moment a call arrives, which is what's being asked for here."
      },
      {
        "question": "They also want reps to be able to call a lead directly from within the CRM instead of dialing manually. What covers that?",
        "options": [
          "Click-to-call",
          "Screen pop",
          "Call activity logging",
          "Omnichannel agent view"
        ],
        "correct": 0,
        "feedback": "Click-to-call is the feature that lets a user place a call by clicking a number inside another application like a CRM, rather than dialing it manually."
      },
      {
        "question": "After rollout, management wants a historical record of every call tied to each customer's CRM record, for reporting later. What ensures that exists?",
        "options": [
          "Call activity logging, so each call's details are recorded against the CRM contact automatically",
          "Screen pop alone",
          "Click-to-call alone",
          "The queue wallboard"
        ],
        "correct": 0,
        "feedback": "Call activity logging is what persists call details against CRM records over time — screen pop and click-to-call are real-time conveniences, not historical record-keeping."
      }
    ],
    "explanation": "Screen pop, click-to-call, and call activity logging are three distinct pieces of a CRM integration, each solving a different part of the sales team's request."
  },
  {
    "id": "toll-fraud-scenario",
    "core": "core1",
    "domain": "a3",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 12,
    "title": "Suspicious overnight international call spike",
    "summary": "Work a toll-fraud incident from immediate containment through to the systemic fix, not just the symptom.",
    "brief": "A billing alert shows hundreds of international calls placed overnight from an extension with remote access, and no staff report working at that time. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "Billing alert: hundreds of international calls placed overnight",
      "details": [
        "Reported by: automated billing/usage alert",
        "Symptom: a spike of outbound international calls between 2-4am, from an extension with remote/tunnel access",
        "No staff report working at that time"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the correct first action?",
        "options": [
          { "label": "Immediately disable outbound international dialing and lock the affected extension", "next": "step2", "correct": true },
          { "label": "Wait to see if it happens again before doing anything", "next": "end_bad_wait", "correct": false },
          { "label": "Just increase the account's spending limit to avoid billing errors", "next": "end_bad_limit", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The extension is locked and international dialing is disabled system-wide as a stopgap. What's the most likely root cause to investigate, given remote/tunnel access was involved?",
        "options": [
          { "label": "Check the extension's authentication, a weak or reused password, and review the Tunnel/SBC access logs for the source", "next": "step3", "correct": true },
          { "label": "Assume it's a billing system error and contact the phone carrier only", "next": "end_bad_carrier", "correct": false }
        ]
      },
      "step3": {
        "prompt": "Logs show repeated failed login attempts from unfamiliar IPs before a successful login using a weak, unchanged default-style password on that extension. What's the right long-term fix, beyond resetting that one password?",
        "options": [
          { "label": "Enforce strong extension passwords system-wide, restrict international/premium-rate dialing by default, and enable IP blacklisting for repeated failed logins", "next": "end_good", "correct": true },
          { "label": "Just reset the one password and consider it resolved", "next": "end_bad_onepassword", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "This matches classic toll fraud: a weak extension credential exposed via remote access was brute-forced, then used to place expensive international calls overnight when no one would notice. Fixing only the symptom, the call spike, without hardening authentication policy and dialing restrictions leaves every other extension just as exposed." },
      "end_bad_wait": { "end": true, "success": false, "prompt": "Toll fraud in progress accrues real financial cost every hour it continues. This needs immediate containment, not a wait-and-see approach." },
      "end_bad_limit": { "end": true, "success": false, "prompt": "Raising the spending limit doesn't stop unauthorized calls, it just allows them to run up an even larger bill." },
      "end_bad_carrier": { "end": true, "success": false, "prompt": "The carrier didn't cause this. The pattern, overnight, remote access, unfamiliar login activity, points to a compromised extension, which is something only the 3CX admin can fix." },
      "end_bad_onepassword": { "end": true, "success": false, "prompt": "Fixing only the one compromised extension leaves every other extension with the same weak-password risk exposed to the exact same attack." }
    },
    "explanation": "Toll fraud almost always follows a pattern: a weakly secured extension exposed to remote access gets brute-forced, then used off-hours for expensive calls before anyone notices the bill. Immediate containment, disable dialing, lock the account, buys time, but the real fix is systemic: strong password policy, dialing restrictions, and blacklisting brute-force sources, not just resetting one password."
  },
  {
    "id": "tunnel-connectivity-terminal",
    "core": "core1",
    "domain": "a5",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Diagnose a remote extension that can't reach the Tunnel service",
    "summary": "Use a simulated shell to work outward from the server and isolate a firewall problem, not a service outage.",
    "brief": "A remote employee's 3CX app shows 'Connecting...' forever and never registers. At the prompt on the 3CX host, work out whether it's a server-side or network-side problem.",
    "terminal": [
      {
        "prompt": "Confirm the Tunnel service is actually running on the server first.",
        "accepts": ["systemctl status 3cxtunnel", "systemctl status 3cxtunnel.service"],
        "output": "3cxtunnel.service - 3CX Tunnel\n   Active: active (running)",
        "hint": "Use systemctl status on the tunnel service."
      },
      {
        "prompt": "The service is healthy. Confirm it's actually listening on its expected port.",
        "accepts": ["sudo ss -tlnp | grep tunnel", "ss -tlnp | grep tunnel"],
        "output": "LISTEN  0  128  0.0.0.0:5090  tunnel",
        "hint": "Use ss with -tlnp, piped through grep for tunnel."
      },
      {
        "prompt": "Server side looks healthy end to end. Check the firewall log for that remote client's public IP, 203.0.113.44, to see if something upstream is blocking it.",
        "accepts": ["sudo grep 203.0.113.44 /var/log/firewall.log", "grep 203.0.113.44 /var/log/firewall.log"],
        "output": "DROP  IN=eth0  SRC=203.0.113.44  DPT=5090",
        "hint": "Grep the firewall log for that specific IP address."
      },
      {
        "prompt": "The firewall is actively dropping that client's traffic to the tunnel port. Add an explicit allow rule for it.",
        "accepts": ["sudo ufw allow from 203.0.113.44 to any port 5090", "ufw allow from 203.0.113.44 to any port 5090"],
        "output": "Rule added",
        "hint": "Use ufw allow, scoped to that source IP and the tunnel port."
      }
    ],
    "explanation": "Working from the server outward, service health, then the listening port, then the firewall log, isolated the fault to a firewall rule silently dropping one specific client's traffic rather than a Tunnel service problem, which a simple service restart would never have fixed."
  },
  {
    "id": "tenant-limits-gui",
    "core": "core1",
    "domain": "a4",
    "type": "gui",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Right-size a hosted tenant before it goes live",
    "summary": "Work through a simulated hosting portal to match a new tenant's limits to what was actually purchased.",
    "brief": "A new hosted tenant is about to go live, but its resource limits and branding are still at their unconfigured defaults. Use the simulated hosting portal to fix that before the customer's go-live date.",
    "app": "Hosting Portal — Tenant Resources",
    "goal": "Configure this new tenant's limits to match what the customer actually purchased, before their go-live date.",
    "reference": {
      "title": "Order form — Acme Corp, Account #48213",
      "paragraphs": [
        "Service: 3CX Hosted PBX, Standard tier, billed annually. Contract term is 24 months, auto-renewing unless cancelled with 60 days' written notice. This order was placed and is fulfilled through Meridian Communications, an authorized 3CX reseller; per the reseller agreement, every tenant provisioned under a reseller order must carry that reseller's white-label branding rather than the default 3CX Hosting Portal appearance.",
        "The Standard tier on this order includes 16 extensions and a simultaneous call allowance of 10 concurrent calls across all trunks. Call recording is available as a paid add-on on higher tiers and was not selected on this order. Support response time is 4 business hours under the Standard SLA.",
        "Per the go-live checklist, every provisioned tenant must have a subdomain assigned under the hosting provider's domain before the account is marked active; DNS propagation for a newly assigned subdomain typically completes within one hour."
      ]
    },
    "tabs": ["capacity", "branding"],
    "panels": {
      "capacity": {
        "label": "Capacity",
        "controls": [
          { "id": "sim-calls", "kind": "select", "label": "Simultaneous call limit", "options": ["0", "4", "10", "Unlimited"], "initial": "0" },
          { "id": "extension-limit", "kind": "select", "label": "Extension limit", "options": ["8", "16", "32"], "initial": "8" },
          { "id": "recording-storage", "kind": "toggle", "label": "Call recording storage enabled", "initial": true, "hint": "The customer's contract doesn't include call recording." }
        ]
      },
      "branding": {
        "label": "Branding",
        "controls": [
          { "id": "white-label", "kind": "toggle", "label": "Apply reseller white-label branding", "initial": false },
          { "id": "tenant-domain", "kind": "text", "label": "Tenant subdomain", "initial": "", "placeholder": "e.g. acme-corp" }
        ]
      }
    },
    "requirements": [
      { "controlId": "sim-calls", "equals": "10", "label": "Simultaneous call limit matches the purchased plan.", "hint": "The customer purchased 10 simultaneous calls, it's currently set to 0, which would block every call." },
      { "controlId": "extension-limit", "equals": "16", "label": "Extension limit matches the purchased plan.", "hint": "The customer purchased 16 extensions, not the default 8." },
      { "controlId": "recording-storage", "equals": false, "label": "Call recording storage is off, matching the contract.", "hint": "Turn off call recording storage, it wasn't part of this customer's contract." },
      { "controlId": "white-label", "equals": true, "label": "Reseller branding is applied.", "hint": "This tenant is under a reseller agreement, enable white-label branding." },
      { "controlId": "tenant-domain", "notEquals": "", "label": "Tenant subdomain is set.", "hint": "Set a tenant subdomain, it is currently blank, so the customer has no portal URL yet." }
    ],
    "explanation": "Hosted tenants need their limits actually matched to what was sold, calls, extensions, and optional features like recording, and their branding and subdomain configured before go-live. Leaving any of these at their unconfigured defaults either blocks the customer from taking calls, over- or under-delivers on the contract, or leaves them without a working portal URL."
  },
  {
    "id": "boss-secretary-decision",
    "core": "core1",
    "domain": "a1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Screen an executive's calls with Boss-Secretary",
    "summary": "Know what wins when forwarding rules collide, and which setting solves each request.",
    "brief": "An executive wants an assistant to screen calls. For each situation, choose the right setting or the right outcome.",
    "explanation": "Forwarding is evaluated in order: Allowed Direct Callers, then Boss-Secretary logic (which stops any further forwarding), then the ordinary forwarding exceptions and rules. CID rules are inbound rules that match the caller's number.",
    "stages": [
      {
        "question": "A call matches both a Boss-Secretary rule and an ordinary forwarding exception. Which one applies?",
        "options": [
          "The forwarding exception",
          "Whichever was created first",
          "Both, one after the other",
          "The Boss-Secretary rule"
        ],
        "correct": 3,
        "feedback": "Boss-Secretary rules have the highest priority and, once they forward a call, no other forwarding rule is applied to it."
      },
      {
        "question": "A few VIP callers must still ring the executive directly.",
        "options": [
          "Add them as Allowed Direct Callers",
          "Add them to a ring group",
          "Create a CID rule for each",
          "Turn off Boss-Secretary during the day"
        ],
        "correct": 0,
        "feedback": "Allowed Direct Callers bypass all forwarding and Boss-Secretary rules and ring the boss directly."
      },
      {
        "question": "The assistant should screen only outside callers, and only during working hours.",
        "options": [
          "Create two queues",
          "Set the screening hours and choose external calls only",
          "Screen all calls all day",
          "Use Do Not Disturb"
        ],
        "correct": 1,
        "feedback": "Boss-Secretary lets you choose the hours and whether internal, external, or all calls are screened."
      },
      {
        "question": "The executive's staff keep changing their own forwarding rules by mistake. How do you stop that?",
        "options": [
          "Disable their voicemail",
          "Change them to the User role",
          "Enable Hide Call Forwarding Rules under Users > Options > Restrictions",
          "Remove them from their department"
        ],
        "correct": 2,
        "feedback": "Hiding the forwarding rules in the user's Options > Restrictions stops them being edited."
      },
      {
        "question": "Calls from a known customer's numbers should go straight to an account manager.",
        "options": [
          "An outbound rule",
          "A Boss-Secretary rule",
          "A queue callback",
          "A CID rule matching the caller's number"
        ],
        "correct": 3,
        "feedback": "CID rules match the caller's number, exactly or with a wildcard, and route to a destination."
      }
    ]
  },
  {
    "id": "m365-sync-decision",
    "core": "core1",
    "domain": "a2",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Predict what Microsoft 365 sync will do",
    "summary": "Learn the direction, schedule, and limits of the user sync, and fix a presence loop.",
    "brief": "The company syncs its users from Microsoft 365. Answer how the sync behaves.",
    "explanation": "Microsoft 365 user sync is one way (to 3CX), nightly, limited to 650 users, and never removes a user for you. Presence can sync either way or both, but the two mappings must agree or the systems will loop.",
    "stages": [
      {
        "question": "A person leaves and their account is deleted in Microsoft 365. What happens to their 3CX user?",
        "options": [
          "It stays until someone removes it from 3CX by hand",
          "It is deleted automatically that night",
          "It is disabled automatically",
          "It becomes a System Owner"
        ],
        "correct": 0,
        "feedback": "Deleting or disabling a user in Microsoft 365 does not remove the 3CX user; that has to be done manually."
      },
      {
        "question": "An administrator deletes a synced user in 3CX but the person still exists in Microsoft 365.",
        "options": [
          "They are blocked from sign-in",
          "They reappear the next day",
          "They are gone permanently",
          "They are moved to another department"
        ],
        "correct": 1,
        "feedback": "The sync is one way and runs nightly, so a user deleted only in 3CX returns the next day."
      },
      {
        "question": "Which direction does user synchronization run, and how many users can it handle?",
        "options": [
          "One way, 3CX to Microsoft 365, up to 50 users",
          "Both ways, up to 650 users",
          "One way, Microsoft 365 to 3CX, up to 650 users",
          "Both ways, unlimited users"
        ],
        "correct": 2,
        "feedback": "Users sync one way from Microsoft 365 to 3CX, nightly, for up to 650 users."
      },
      {
        "question": "With two-way presence sync, a user's status keeps flipping between Away and Do Not Disturb. What is the fix?",
        "options": [
          "Turn off the Teams license",
          "Delete and re-import the user",
          "Switch the user to SSO",
          "Make both directions map to the same status"
        ],
        "correct": 3,
        "feedback": "If 3CX Away becomes Teams Away but Teams Away becomes 3CX Do Not Disturb, each side overrides the other; map both to the same status."
      },
      {
        "question": "A company wants only the sales and support groups created in 3CX.",
        "options": [
          "Sync only the selected Microsoft 365 departments",
          "Import the whole directory and delete the rest",
          "Create the departments first with the same names",
          "Use a CSV import"
        ],
        "correct": 0,
        "feedback": "You can limit the sync to chosen departments; new 3CX departments are created from the Microsoft 365 group names and existing ones are not overwritten."
      }
    ]
  },
  {
    "id": "ip-blacklist-scenario",
    "core": "core1",
    "domain": "a3",
    "type": "scenario",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "A phone suddenly cannot register",
    "summary": "Find out why one device cannot register when nothing on the network changed.",
    "brief": "A desk phone worked on Friday and has not registered since Monday morning. Nothing on the network changed.",
    "explanation": "Anti-hacking adds an address to the IP Blacklist after more than 10 wrong passwords or more than 5 incorrect registrations. When a device can no longer authenticate, check the list, fix the cause, and remove the entry; an Allow entry exempts only addresses you trust.",
    "ticket": {
      "subject": "A phone will not register",
      "details": [
        "It worked on Friday",
        "A user mistyped the password many times over the weekend",
        "Other phones on the same network are fine"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "Nothing changed on the network. Where do you look?",
        "options": [
          {
            "label": "The IP Blacklist under Admin > Advanced",
            "next": "list",
            "correct": true
          },
          {
            "label": "Replace the phone",
            "next": "bad_phone",
            "correct": false
          }
        ]
      },
      "list": {
        "prompt": "The phone's address is on the blacklist. Why was it put there?",
        "options": [
          {
            "label": "Anti-hacking blocks an address after more than 10 wrong passwords or more than 5 incorrect registrations",
            "next": "fix",
            "correct": true
          },
          {
            "label": "Someone deleted the extension",
            "next": "bad_ext",
            "correct": false
          }
        ]
      },
      "fix": {
        "prompt": "What do you do?",
        "options": [
          {
            "label": "Correct the phone's credentials, then remove the blacklist entry",
            "next": "done",
            "correct": true
          },
          {
            "label": "Whitelist the address without finding out why it failed",
            "next": "bad_white",
            "correct": false
          },
          {
            "label": "Switch off anti-hacking",
            "next": "bad_off",
            "correct": false
          }
        ]
      },
      "done": {
        "end": true,
        "success": true,
        "prompt": "With the right credentials set and the entry removed, the phone registers again and anti-hacking stays on."
      },
      "bad_phone": {
        "end": true,
        "success": false,
        "prompt": "The phone was fine; the PBX was refusing it. The IP Blacklist lists addresses blocked after repeated failures."
      },
      "bad_ext": {
        "end": true,
        "success": false,
        "prompt": "A deleted extension would not explain a blocked address. Check the blacklist and the failed attempts."
      },
      "bad_white": {
        "end": true,
        "success": false,
        "prompt": "Whitelisting skips the anti-hacking checks for that address. Only do that for an address you trust, and fix the credentials first."
      },
      "bad_off": {
        "end": true,
        "success": false,
        "prompt": "Anti-hacking protects the whole system. Remove the one entry instead of weakening everything."
      }
    }
  },
  {
    "id": "secure-sip-fqdn-sequence",
    "core": "core1",
    "domain": "a3",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 8,
    "title": "Turn on Secure SIP for a custom domain name",
    "summary": "Put the steps for TLS on a PBX with its own domain name in order.",
    "brief": "The PBX uses the company's own FQDN instead of one provided by 3CX. Put the steps for enabling Secure SIP in order.",
    "explanation": "A custom FQDN needs a static public IP, a domain you control, and a certificate from an authority devices trust (a self-signed one must be imported on every endpoint). The certificate and key go into Advanced > Secure SIP and the services are restarted; supported trunks then use TLS as their transport.",
    "steps": [
      "Confirm a static public IP and control of the domain's DNS records",
      "Obtain a certificate from an authority your phones already trust",
      "Keep the certificate, private key, and CA bundle files safe",
      "Open Admin > Advanced > Secure SIP and enable it",
      "Paste the certificate and the key into their fields",
      "Restart the PBX services when prompted",
      "Choose TLS as the transport on each supported trunk"
    ]
  },
  {
    "id": "failover-setup-sequence",
    "core": "core1",
    "domain": "a3",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Set up active-passive failover",
    "summary": "Put the steps for a standby PBX that takes over automatically in order.",
    "brief": "The company wants a second PBX ready to take over if the first fails. Put the setup steps in order.",
    "explanation": "Failover needs an AI edition license (and is not supported on Hosted by 3CX), two PBXs with identical settings and their own public IPs, and split DNS. The passive server monitors the active one, restores each backup shortly after it is made, and runs scripts that update DNS when it takes over; the old active server must be shut down so two servers do not conflict.",
    "steps": [
      "Confirm an AI edition license and that the PBX is not Hosted by 3CX",
      "Install two PBXs with identical settings, each with its own public IP",
      "Set up remote storage and a daily off-hours backup on the active server",
      "Enable failover on the active server and choose Active",
      "On the passive server enter the active server's IP and choose the services to monitor",
      "Set the heartbeat interval and the failover scripts",
      "Schedule the automatic restore a few minutes after each backup",
      "Test a failover and shut down the previous active server"
    ]
  },
  {
    "id": "bridge-or-sbc-decision",
    "core": "core1",
    "domain": "a4",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Choose between a bridge and an SBC",
    "summary": "Decide how to connect each site, and fix the dialing problems that bridges bring.",
    "brief": "The company is adding sites. For each, choose the right way to connect it or the right fix.",
    "explanation": "Choose by where call control should live: a bridge links separate PBXs that stay independent, while an SBC connects a site's phones to one remote or cloud PBX without creating a second PBX.",
    "stages": [
      {
        "question": "Two offices each need their own trunks, queues, and administrators, but must call each other's extensions for free.",
        "options": [
          "Merge them into one multi-tenant system",
          "Bridge the two systems",
          "Install an SBC at each office",
          "Use a router phone"
        ],
        "correct": 1,
        "feedback": "A bridge keeps separate PBXs separate while letting them dial each other over the internet."
      },
      {
        "question": "A small branch needs only desk phones connected to the head-office PBX in the cloud.",
        "options": [
          "A second PBX",
          "A SIP trunk",
          "A router phone or the 3CX apps",
          "A bridge"
        ],
        "correct": 2,
        "feedback": "Phones that just need to reach a central PBX use an SBC component; for small sites a router phone is enough."
      },
      {
        "question": "A large remote office with many phones needs a dedicated component to reach the central PBX.",
        "options": [
          "A bridge",
          "Local LAN/VPN on a cloud PBX",
          "DHCP option 66 at head office",
          "A 3CX SBC on Windows, Debian, or a Raspberry Pi"
        ],
        "correct": 3,
        "feedback": "A standalone SBC does the router phone's job for every phone at a larger site."
      },
      {
        "question": "Staff at one site cannot see whether colleagues at the other bridged site are available.",
        "options": [
          "Enable Publish and Receive Information on the bridge",
          "Turn on Do Not Disturb",
          "Add them to a ring group",
          "Enable Switch Status"
        ],
        "correct": 0,
        "feedback": "Presence only crosses a bridge when the bridge is set to publish and receive it."
      },
      {
        "question": "Dialing the bridge prefix plus a remote extension is blocked, although the bridge is connected.",
        "options": [
          "Create a CID rule",
          "Check Allowed Country Codes for a clash with the extension number",
          "Replace the authentication password",
          "Restart the tunnel"
        ],
        "correct": 1,
        "feedback": "Allowed Country Codes can read a prefix plus extension as an international number and block it."
      }
    ]
  },
  {
    "id": "bridge-setup-sequence",
    "core": "core1",
    "domain": "a4",
    "type": "sequence",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Connect two 3CX systems with a bridge",
    "summary": "Put the steps for linking two PBXs in order.",
    "brief": "Head office and a branch each run their own 3CX. Put the steps for connecting them with a Master and Slave bridge in order.",
    "explanation": "A bridge needs secure FQDNs on both systems (an IP address cannot be used). The Master is created first; the Slave repeats its virtual extension, prefix, and password and points at the Master's FQDN. Each side needs an outbound rule for the prefix that strips the prefix digit, and presence is shared only if you enable it.",
    "steps": [
      "Make sure both systems have a secure FQDN, not an IP address",
      "Create a Master bridge and note its virtual extension number",
      "Set the outbound rule prefix, maximum calls, and authentication password",
      "Create a Slave bridge with the same virtual extension, prefix, and password",
      "Enter the Master's FQDN and port on the Slave",
      "Add an outbound rule on each side that sends the prefix to its bridge and strips one digit",
      "Enable Publish and Receive Information if users should see presence"
    ]
  },
  {
    "id": "report-choice-decision",
    "core": "core1",
    "domain": "a5",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Pick the right report or feed for each question",
    "summary": "Match SLA Breaches, Abandoned Calls, Agent Login History, the CDR service, and scheduled reports to what is being asked.",
    "brief": "Management keeps asking questions about the phone system. For each, choose the report or feature that answers it.",
    "explanation": "The Reports menu offers queue statistics (abandoned calls, answered by waiting time, callbacks, SLA Statistics and Breaches), agent reports such as Agent Login History, and logs, while the CDR service streams raw call records and scheduled reports arrive by email with a CSV.",
    "stages": [
      {
        "question": "How many callers waited longer than the service level target?",
        "options": [
          "The CDR service",
          "SLA Breaches",
          "Abandoned Queue Calls",
          "Agent Login History"
        ],
        "correct": 1,
        "feedback": "SLA Breaches counts calls that waited longer than the configured SLA time."
      },
      {
        "question": "How many callers gave up before an agent answered?",
        "options": [
          "Queue Callbacks",
          "Extension Statistics",
          "SLA Breaches",
          "Abandoned Queue Calls"
        ],
        "correct": 3,
        "feedback": "Abandoned Queue Calls counts callers who entered the queue but were never answered."
      },
      {
        "question": "When was a particular agent logged in to the queue yesterday?",
        "options": [
          "SLA Statistics",
          "Call Distribution",
          "The Audit Log",
          "Agent Login History"
        ],
        "correct": 3,
        "feedback": "Agent Login History shows an agent's queue login and logout history."
      },
      {
        "question": "Every call record must reach the finance system as soon as the call ends.",
        "options": [
          "The CDR service pushing over TCP",
          "A scheduled report each Monday",
          "The Inbound Rules report",
          "A packet capture"
        ],
        "correct": 0,
        "feedback": "The CDR service writes call records to a file or pushes each one to another application over TCP."
      },
      {
        "question": "A manager wants the queue report in a spreadsheet every Monday for Power BI.",
        "options": [
          "Agent Login History",
          "A scheduled report, which is emailed with a CSV",
          "The CDR service",
          "The Event log"
        ],
        "correct": 1,
        "feedback": "Scheduled reports are emailed as a link with a CSV attached, which suits BI tools."
      }
    ]
  }
];
})();
