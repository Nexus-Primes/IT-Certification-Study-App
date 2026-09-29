(function () {
  'use strict';
  window.SECPLUS_LABS = [
  {
    "id": "incident-response-sequence",
    "core": "core1",
    "domain": "sd4",
    "type": "sequence",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Work an incident using the response lifecycle",
    "summary": "Put the phases of incident response into the correct order.",
    "brief": "A ransomware infection was just confirmed on a file server. Arrange the incident response phases in the correct order for handling it from start to finish.",
    "steps": [
      "Preparation: ensure tools, contacts, and playbooks are ready before an incident occurs",
      "Detection and analysis: confirm that a real incident has happened and assess its scope",
      "Containment: isolate affected systems to stop the incident from spreading",
      "Eradication: remove the root cause, such as malware or an attacker's persistence mechanism",
      "Recovery: restore affected systems to normal, verified operation",
      "Lessons learned: document what happened and how the response can improve next time"
    ],
    "explanation": "Preparation happens before any incident, detection and containment come before removal, removal has to finish before trustworthy recovery, and lessons learned only makes sense once the incident is fully resolved."
  },
  {
    "id": "phishing-triage-decision",
    "core": "core1",
    "domain": "sd2",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Triage a reported phishing email",
    "summary": "Work through a phishing report the right way instead of guessing at a fix.",
    "brief": "An employee reports a suspicious email asking them to click a link and verify their account credentials.",
    "stages": [
      {
        "question": "What is the best first action upon receiving this report?",
        "options": [
          "Avoid clicking any links or opening attachments, and preserve the email for analysis",
          "Immediately delete the email so no one else can click it",
          "Forward the email to the whole company as a warning",
          "Reply to the sender asking if it's legitimate"
        ],
        "correct": 0,
        "feedback": "Preserving the email intact and avoiding interaction with it keeps the response safe and allows proper analysis."
      },
      {
        "question": "Analysis shows the link points to a lookalike domain designed to steal login credentials. What should happen next?",
        "options": [
          "Block the malicious domain and check whether anyone already clicked the link",
          "Ignore it since no one has complained yet",
          "Immediately shut down the email server",
          "Publicly post the sender's domain online as a warning"
        ],
        "correct": 0,
        "feedback": "Blocking the malicious domain prevents further clicks, and checking for prior clicks catches anyone who may already be compromised."
      },
      {
        "question": "Log review shows two employees did click the link and entered their credentials before it was blocked. What's the correct response?",
        "options": [
          "Force a password reset for those accounts and review their activity for signs of compromise",
          "Do nothing since the domain is now blocked",
          "Delete the affected user accounts entirely",
          "Wait to see if anything bad happens before acting"
        ],
        "correct": 0,
        "feedback": "Resetting credentials and reviewing account activity contains the damage from credentials that were already exposed."
      }
    ],
    "explanation": "Preserving evidence, blocking the malicious infrastructure, and containing any credentials that were already exposed, in that order, limits damage from a phishing incident."
  },
  {
    "id": "control-selection-decision",
    "core": "core1",
    "domain": "sd1",
    "type": "decision",
    "difficulty": "Beginner",
    "minutes": 7,
    "title": "Choose the right control type for the server room",
    "summary": "Match each new security requirement to the correct category of control.",
    "brief": "A badge reader already exists on the server room door. Leadership wants to close a few remaining gaps.",
    "stages": [
      {
        "question": "The badge reader already exists on the server room door. What TYPE of control is this?",
        "options": ["Preventive control", "Detective control", "Corrective control", "Compensating control"],
        "correct": 0,
        "feedback": "A badge reader stops unauthorized entry before it happens, making it a preventive control."
      },
      {
        "question": "Leadership also wants proof of exactly who entered and when, even if a badge is shared. What should be added?",
        "options": [
          "A security camera covering the door, as a detective control",
          "Another identical badge reader",
          "A thicker door",
          "A stronger lock"
        ],
        "correct": 0,
        "feedback": "A camera doesn't stop entry but detects and records exactly who came through, complementing the preventive badge reader."
      },
      {
        "question": "A piece of legacy equipment can't be moved into the badge-controlled room and must stay in an open area. What's the best compensating approach?",
        "options": [
          "Bolt it down and place it under continuous camera monitoring with restricted access to that specific area",
          "Ignore the risk since it's just one device",
          "Disconnect it from all power permanently",
          "Replace the entire building"
        ],
        "correct": 0,
        "feedback": "When the primary preventive control can't be applied, a compensating control provides similar protection through different means."
      }
    ],
    "explanation": "Mapping each requirement to the right category of control — preventive, detective, or compensating — produces layered, appropriate security rather than redundant identical controls."
  },
  {
    "id": "file-hash-verification-terminal",
    "core": "core1",
    "domain": "sd4",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Verify a downloaded installer before deployment",
    "summary": "Use a simulated terminal to confirm a vendor download's integrity before trusting it.",
    "brief": "A downloaded vendor installer needs to be verified before it's deployed to production machines. At the prompt, run the right commands in order to confirm its integrity.",
    "terminal": [
      {
        "prompt": "Calculate the SHA-256 hash of the downloaded installer file.",
        "accepts": ["sha256sum installer.exe"],
        "output": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85  installer.exe",
        "hint": "Use sha256sum followed by the filename."
      },
      {
        "prompt": "That doesn't match the vendor's published checksum (9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08). Re-download the installer from the vendor's official site and hash the fresh copy to rule out a simple corrupted download before assuming tampering.",
        "accepts": ["sha256sum installer.exe"],
        "output": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08  installer.exe",
        "hint": "Re-run the same hash command on the freshly downloaded file."
      },
      {
        "prompt": "The fresh download's hash now matches the vendor's published value. Log the result to close out the verification.",
        "accepts": ["echo verified >> integrity-log.txt", "echo verified > integrity-log.txt"],
        "output": "Logged: installer.exe verified against vendor SHA-256 checksum.",
        "hint": "Append a verification note to the integrity log."
      }
    ],
    "explanation": "A mismatched hash on the first download doesn't automatically mean tampering — re-downloading and re-hashing rules out a simple corrupted transfer before escalating it as a possible supply-chain compromise. Logging the final verified result closes out the check."
  },
  {
    "id": "vendor-risk-decision",
    "core": "core1",
    "domain": "sd5",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Pick the right agreement for a new vendor",
    "summary": "Match each third-party requirement to the correct type of agreement.",
    "brief": "The company is onboarding a new SaaS vendor and needs to put the right agreements in place at each stage of the relationship.",
    "stages": [
      {
        "question": "The company wants a formal, enforceable commitment from the vendor guaranteeing 99.9% uptime with financial penalties for missing it. What should be put in place?",
        "options": [
          "A service level agreement (SLA)",
          "A non-disclosure agreement (NDA)",
          "A memorandum of understanding (MOU)",
          "An acceptable use policy"
        ],
        "correct": 0,
        "feedback": "An SLA is specifically designed to formally commit a vendor to measurable service levels with defined remedies."
      },
      {
        "question": "Before sharing proprietary product roadmaps with this vendor during evaluation, what should be signed first?",
        "options": [
          "A non-disclosure agreement (NDA)",
          "A service level agreement",
          "A rules of engagement document",
          "A business continuity plan"
        ],
        "correct": 0,
        "feedback": "An NDA legally protects confidential information shared during vendor evaluation, independent of the eventual service contract."
      },
      {
        "question": "After onboarding, how should the company make sure the vendor continues to meet security expectations over time?",
        "options": [
          "Ongoing vendor risk monitoring, including periodic reassessment",
          "A one-time assessment before signing, with no further review",
          "Trusting the vendor's own marketing claims",
          "Reviewing only if a breach is publicly reported"
        ],
        "correct": 0,
        "feedback": "Vendor risk isn't static — ongoing monitoring catches security posture changes that a one-time assessment would miss."
      }
    ],
    "explanation": "Matching each need — enforceable performance, confidentiality, and ongoing assurance — to the right agreement or process avoids relying on the wrong tool for the job."
  },
  {
    "id": "risk-response-decision",
    "core": "core1",
    "domain": "sd5",
    "type": "decision",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Choose the right response for three different risks",
    "summary": "Match each risk's likelihood, impact, and cost profile to the appropriate risk management strategy.",
    "brief": "Three newly identified risks each need a response strategy recommendation for the risk register.",
    "stages": [
      {
        "question": "Risk one has a low likelihood but catastrophic potential impact, and insurance is available at a reasonable cost. What's the most appropriate response?",
        "options": [
          "Risk transfer, via cyber insurance",
          "Risk avoidance, by shutting down the affected system",
          "Risk acceptance, doing nothing further",
          "Ignoring it since likelihood is low"
        ],
        "correct": 0,
        "feedback": "Transferring a catastrophic-but-unlikely risk to an insurer is often more practical than avoiding the system entirely or accepting the full exposure."
      },
      {
        "question": "Risk two has low likelihood AND low impact, and any mitigation would cost far more than the potential loss. What's the most reasonable response?",
        "options": [
          "Risk acceptance, documenting the decision in the risk register",
          "Risk transfer via insurance regardless of cost",
          "Risk avoidance by discontinuing the activity",
          "Ignoring it without documentation"
        ],
        "correct": 0,
        "feedback": "When mitigation costs would exceed the potential loss, formally accepting and documenting the risk is often the most rational choice."
      },
      {
        "question": "Risk three involves a business activity that provides little value but carries a high likelihood of a severe breach. What's the most appropriate response?",
        "options": [
          "Risk avoidance, by discontinuing the low-value, high-risk activity entirely",
          "Risk acceptance",
          "Risk transfer only",
          "Ignoring it since it hasn't happened yet"
        ],
        "correct": 0,
        "feedback": "When an activity's risk clearly outweighs its business value, avoiding the risk entirely by stopping the activity is the most direct response."
      }
    ],
    "explanation": "Matching each risk's likelihood, impact, and cost profile to accept, transfer, mitigate, or avoid — rather than defaulting to one response for everything — is the core of the risk management process."
  },
  {
    "id": "malware-triage-sequence",
    "core": "core1",
    "domain": "sd4",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Contain and analyze a suspected malware infection",
    "summary": "Put the response steps for an infected workstation into the correct order.",
    "brief": "A workstation is showing signs of a malware infection. Arrange the response steps in the correct order.",
    "steps": [
      "Isolate the workstation from the network to stop potential spread",
      "Preserve volatile evidence such as running processes and memory before powering off",
      "Identify the malware type and its indicators of compromise",
      "Remove the malware and any persistence mechanisms it installed",
      "Restore the workstation from a known-good backup or clean image",
      "Monitor the system afterward to confirm no reinfection occurs"
    ],
    "explanation": "Containing the spread comes first, evidence has to be preserved before anything is powered off or wiped, identification informs proper removal, and verification only makes sense after the system is restored."
  },
  {
    "id": "privileged-account-decision",
    "core": "core1",
    "domain": "sd4",
    "type": "decision",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Fix an overprivileged admin account",
    "summary": "Apply least privilege and privileged access management to a risky daily-use admin account.",
    "brief": "An administrator account with full domain rights is used every day for routine helpdesk tasks like password resets.",
    "stages": [
      {
        "question": "What is the biggest security concern with this setup?",
        "options": [
          "The account carries far more privilege than routine tasks require, violating least privilege",
          "The account uses a weak password",
          "The account isn't logged",
          "The account is shared among multiple people"
        ],
        "correct": 0,
        "feedback": "Using a fully privileged account for routine, low-risk tasks means a single compromise grants far more access than necessary."
      },
      {
        "question": "What's the best fix, given the admin still occasionally needs full rights for real emergencies?",
        "options": [
          "Give the admin a separate standard account for daily tasks, and a privileged account only checked out when truly needed",
          "Remove all admin rights permanently",
          "Share the privileged account among the whole team for convenience",
          "Require the privileged account to be used for every task, big or small"
        ],
        "correct": 0,
        "feedback": "Separating day-to-day access from privileged access, and granting the privileged account only when actually needed, reduces standing risk without removing needed capability."
      },
      {
        "question": "How can the organization ensure privileged sessions are properly monitored going forward?",
        "options": [
          "Use a privileged access management (PAM) solution that logs and can record privileged sessions",
          "Trust administrators to self-report their own activity",
          "Disable logging to improve performance",
          "Only review activity after an incident is suspected"
        ],
        "correct": 0,
        "feedback": "A PAM solution provides ongoing visibility into privileged activity, rather than relying on self-reporting or only investigating after the fact."
      }
    ],
    "explanation": "Applying least privilege to administrative access, separating routine from privileged accounts, and monitoring privileged sessions together reduce the risk that a single compromised account leads to full domain compromise."
  },
  {
    "id": "ransomware-alert-scenario",
    "core": "core1",
    "domain": "sd4",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 13,
    "title": "SOC alert: mass file renames on a finance workstation",
    "summary": "Work a live-looking ransomware alert through containment and evidence preservation before it spreads further.",
    "brief": "An EDR platform just fired an alert for rapid, mass file renaming on a finance workstation. The user is on a call and has no idea anything is wrong. Work the ticket by choosing your next action at each step.",
    "ticket": {
      "subject": "EDR alert: rapid mass file renaming on FIN-WS-14",
      "details": [
        "Reported by: EDR platform (automated alert)",
        "Symptom: hundreds of files renamed with a new extension in under 2 minutes",
        "User is a finance analyst, currently on a video call, unaware anything is wrong"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What is the correct first action?",
        "options": [
          { "label": "Isolate FIN-WS-14 from the network immediately (network containment)", "next": "step2", "correct": true },
          { "label": "Call the user and ask them to save their work before doing anything else", "next": "end_bad_wait", "correct": false },
          { "label": "Wait until end of day to investigate so you don't disrupt the user's meeting", "next": "end_bad_delay", "correct": false }
        ]
      },
      "step2": {
        "prompt": "FIN-WS-14 is isolated. What should happen next, per the incident response process?",
        "options": [
          { "label": "Preserve volatile evidence (memory and process list) and begin identifying the scope of impact", "next": "step3", "correct": true },
          { "label": "Immediately wipe and reimage the machine", "next": "end_bad_wipe", "correct": false }
        ]
      },
      "step3": {
        "prompt": "Initial triage matches a known ransomware behavior pattern, and a second workstation on the same subnet is showing early signs of the same activity. What's the priority now?",
        "options": [
          { "label": "Contain the second workstation too and notify the incident response team and management per the IR plan", "next": "end_good", "correct": true },
          { "label": "Fix only the first machine and consider the incident closed", "next": "end_bad_ignore_spread", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Recognizing likely lateral movement and containing the second host, combined with formal IR-plan notification, keeps the incident from spreading further while preserving the evidence needed for root-cause analysis and recovery." },
      "end_bad_wait": { "end": true, "success": false, "prompt": "Letting a user 'save their work' during active ransomware behavior gives the malware more time to spread and encrypt additional data. Containment comes before convenience." },
      "end_bad_delay": { "end": true, "success": false, "prompt": "Active malicious file activity is a live incident, not something that can wait. Delay directly increases the blast radius." },
      "end_bad_wipe": { "end": true, "success": false, "prompt": "Wiping immediately destroys the volatile evidence (memory, running processes, network connections) needed to understand scope, entry point, and whether other systems are affected." },
      "end_bad_ignore_spread": { "end": true, "success": false, "prompt": "Treating this as an isolated single-host event when a second host already shows matching symptoms risks missing an active lateral-movement incident still in progress." }
    },
    "explanation": "The standard incident response order, contain, preserve evidence, then eradicate and recover, protects both the immediate host and the wider environment. Containing only what's already confirmed while ignoring early signs of spread is one of the most common ways a single-host incident turns into an organization-wide one."
  },
  {
    "id": "open-port-audit-terminal",
    "core": "core1",
    "domain": "sd3",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Audit a server for unexpectedly open ports",
    "summary": "Use a simulated command prompt to find and shut down a service that has no business being exposed.",
    "brief": "A new web server was just deployed and needs a quick security audit before going live. At the prompt, find out what's actually listening on the network before locking it down.",
    "terminal": [
      {
        "prompt": "List all listening ports and the process each belongs to.",
        "accepts": ["netstat -ab", "netstat -a -b"],
        "output": "Proto  Local Address        State      PID   Process\nTCP    0.0.0.0:443          LISTENING  1044  [nginx.exe]\nTCP    0.0.0.0:3389         LISTENING  912   [svchost.exe]\nTCP    0.0.0.0:23           LISTENING  455   [telnetd.exe]",
        "hint": "Use netstat with the switches that show listening ports and owning processes."
      },
      {
        "prompt": "Port 23 (Telnet) has no business being open on a public web server, it sends credentials in plain text. Confirm the service tied to PID 455.",
        "accepts": ["tasklist /fi \"pid eq 455\"", "tasklist /svc /fi \"pid eq 455\""],
        "output": "Image Name    PID   Services\ntelnetd.exe   455   TlntSvr",
        "hint": "Use tasklist with a PID filter to confirm the service."
      },
      {
        "prompt": "Confirmed as the legacy Telnet service. Stop it immediately.",
        "accepts": ["sc stop tlntsvr", "net stop tlntsvr"],
        "output": "SERVICE_NAME: tlntsvr\nSTATE: STOPPED",
        "hint": "Use sc stop or net stop on the Telnet service name."
      },
      {
        "prompt": "Prevent it from starting again on the next reboot.",
        "accepts": ["sc config tlntsvr start= disabled"],
        "output": "[SC] ChangeServiceConfig SUCCESS",
        "hint": "Use sc config with start= disabled."
      },
      {
        "prompt": "Re-check listening ports to confirm port 23 is gone for good.",
        "accepts": ["netstat -ab", "netstat -a -b"],
        "output": "Proto  Local Address        State      PID   Process\nTCP    0.0.0.0:443          LISTENING  1044  [nginx.exe]\nTCP    0.0.0.0:3389         LISTENING  912   [svchost.exe]",
        "hint": "Re-run netstat to confirm."
      }
    ],
    "explanation": "Auditing listening ports before go-live surfaces services that shouldn't be exposed at all, like legacy Telnet sending credentials in plaintext. Identifying the owning process confirms what's actually responsible before touching anything, and both stopping the service and disabling its startup, not just one or the other, ensures it doesn't silently come back after a reboot."
  },
  {
    "id": "workstation-hardening-gui",
    "core": "core1",
    "domain": "sd3",
    "type": "gui",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Harden a workstation before it joins a sensitive project",
    "summary": "Work through a simulated local security settings panel to bring a workstation up to baseline policy.",
    "brief": "A workstation is being assigned to a sensitive new project and needs a baseline security review first. Use the simulated settings panel to fix what's wrong.",
    "app": "Local Security Settings",
    "goal": "Bring this workstation's baseline security settings in line with policy before it's used on the new project.",
    "reference": {
      "title": "Project Falcon — Workstation Security Baseline, Rev. 4",
      "paragraphs": [
        "All workstations assigned to Project Falcon must be brought to this baseline before being issued to project staff. Endpoint firewall protection must be active at all times; a workstation found with the firewall disabled must be remediated immediately and reported to the security team.",
        "Remote access services, including Remote Desktop, remain disabled by default and may only be enabled with a signed exception ticket on file. Built-in local accounts not tied to a named user, including the Guest account, must be disabled prior to deployment.",
        "Idle workstations must lock automatically after 5 minutes without input; this is stricter than the standard 15-minute corporate default because of the sensitivity of Project Falcon data. Local administrator credentials must never be left at their factory default or shared across multiple machines — assign a unique, strong password per device. File and printer sharing is left to technician discretion based on the workstation's role and is not part of this baseline."
      ]
    },
    "tabs": ["firewall", "accounts"],
    "panels": {
      "firewall": {
        "label": "Firewall",
        "controls": [
          { "id": "firewall-on", "kind": "toggle", "label": "Windows Defender Firewall", "initial": false },
          { "id": "remote-desktop", "kind": "toggle", "label": "Allow Remote Desktop connections", "initial": true, "hint": "Unrestricted RDP is a common attack path when it isn't required." },
          { "id": "file-sharing", "kind": "toggle", "label": "Allow file and printer sharing", "initial": true }
        ]
      },
      "accounts": {
        "label": "Accounts",
        "controls": [
          { "id": "guest-account", "kind": "toggle", "label": "Guest account enabled", "initial": true },
          { "id": "auto-lock", "kind": "select", "label": "Screen lock timeout", "options": ["Never", "15 minutes", "5 minutes"], "initial": "Never" },
          { "id": "admin-password", "kind": "text", "label": "Local administrator password", "initial": "admin", "placeholder": "Enter a strong password" }
        ]
      }
    },
    "requirements": [
      { "controlId": "firewall-on", "equals": true, "label": "Firewall is enabled.", "hint": "Turn the firewall on, it is currently off entirely." },
      { "controlId": "remote-desktop", "equals": false, "label": "Remote Desktop is disabled.", "hint": "This workstation doesn't need inbound RDP, turn it off to shrink the attack surface." },
      { "controlId": "guest-account", "equals": false, "label": "Guest account is disabled.", "hint": "Disable the built-in Guest account, it is an unnecessary, unauthenticated entry point." },
      { "controlId": "auto-lock", "equals": "5 minutes", "label": "Screen lock is set to 5 minutes.", "hint": "Set the screen lock timeout to 5 minutes, not Never." },
      { "controlId": "admin-password", "notEquals": "admin", "label": "The default admin password has been changed.", "hint": "The local admin password is still the weak default \"admin\", change it to something strong." }
    ],
    "explanation": "None of these were single fixes on their own: the firewall being fully off, RDP open by default, an enabled Guest account, no screen lock, and a default admin password each independently widen the attack surface. Hardening a workstation means checking every one of these baseline settings, not just the first thing you notice."
  }
];
})();
