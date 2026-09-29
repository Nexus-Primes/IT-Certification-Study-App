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
      "Point an inbound rule for the support DID to the new queue",
      "Test the queue with a live call and confirm the wallboard shows it correctly"
    ],
    "explanation": "Agents need to exist before they can be added to a queue, the queue itself needs to exist before agents can be assigned or an inbound rule can point to it, and testing only makes sense once every piece is wired together."
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
      "Point the inbound rule for the main DID to the IVR during open hours and to voicemail after hours",
      "Call the main number at different times to confirm it behaves correctly for open, closed, and holiday scenarios"
    ],
    "explanation": "The IVR's content and structure need to exist before it can be scheduled, the weekly hours and holiday exceptions both need to be defined before the inbound rule can reference them correctly, and testing across all three states is the only way to confirm the whole chain actually works."
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
  }
];
})();
