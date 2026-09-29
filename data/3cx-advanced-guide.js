(function () {
  'use strict';
  window.THREECX_ADVANCED_GUIDE = [
  {
    "domain": "a1",
    "overview": "Basic inbound rules can only route a call one way based on simple conditions like a DID or a time schedule. Call Flow Designer is 3CX's visual tool for going well beyond that — building genuinely conditional, multi-step call logic that reacts to real information about the caller and the situation.",
    "sections": [
      {
        "heading": "Call flow designer fundamentals",
        "objectives": ["1.1"],
        "body": "The call flow designer is a visual, drag-and-drop canvas for building call routing logic step by step, rather than configuring a flat, single-condition inbound rule. This matters for scenarios simple rules genuinely can't express well — a call that needs to check several conditions in sequence, or branch differently depending on more than one factor at once.\n\nTime-based conditional routing inside a flow can check the current time and branch accordingly, similar in spirit to the business-hours-driven inbound rules from Basic certification, but composable with other conditions in the very same flow rather than needing entirely separate rules for each scenario. Flow designer building blocks are the individual nodes available on the canvas — play a message, gather input, check a condition, transfer the call, and others — that get connected together into the actual logic. Testing and debugging a call flow before it goes live matters a great deal, since a broken flow doesn't just misroute one call — it can strand every caller who touches that specific branch until the mistake is caught and fixed, potentially for hours before anyone notices."
      },
      {
        "heading": "Advanced routing logic",
        "objectives": ["1.2"],
        "body": "A CRM or database lookup performed directly inside a flow lets routing decisions be based on real information about the caller — recognizing a known customer by their phone number and routing them to their actual assigned account manager, for instance, rather than treating every caller identically regardless of who they are. Conditional branching by caller input extends simple IVR-style keypress menus into something that can combine with other conditions in the very same flow, rather than being limited to a flat, single-level menu tree.\n\nCall recording policy triggers let a flow turn recording on or off dynamically based on the specific path a call takes through it — recording sales calls for quality review, say, while deliberately not recording calls that touch a specific privacy-sensitive department. Webhook or API actions let a flow reach out to an external system mid-call — notifying a Slack channel, logging to an external system, or triggering some other automated action — extending what the phone system can actually do well beyond simply routing a call to a person. Custom hold treatment per branch lets different paths through a flow play different hold music or messaging, tailoring the caller's experience to which specific part of the business they're actually being routed toward."
      }
    ]
  },
  {
    "domain": "a2",
    "overview": "A phone system rarely operates in true isolation from everything else a business runs. This domain covers connecting 3CX to the other systems already in use — CRMs, the Microsoft/Google ecosystem, chat and SMS channels, and custom automation through open APIs.",
    "sections": [
      {
        "heading": "CRM integration",
        "objectives": ["2.1"],
        "body": "A CRM connector links 3CX to a customer relationship management platform, syncing contact and call data between the two systems so agents aren't left manually cross-referencing two completely separate tools while trying to have a phone conversation at the same time. Click-to-call lets a user place a call directly from within the CRM interface itself — clicking a phone number on a contact record instead of manually dialing it on a separate phone or softphone.\n\nA screen pop automatically surfaces the matching CRM record the instant a call comes in, based on the caller's phone number — an agent sees exactly who's calling and their full history before they even pick up, rather than needing to ask basic identifying questions the CRM record could have already answered. Call activity logging automatically records call details — who, when, how long — directly into the CRM record, building an accurate history of customer interactions without requiring an agent to manually log every single call by hand after the fact."
      },
      {
        "heading": "Microsoft 365 / Google integration",
        "objectives": ["2.2"],
        "body": "Single sign-on (SSO) integration lets users log into 3CX with their existing Microsoft 365 or Google credentials, rather than administrators needing to create and maintain an entirely separate set of 3CX-specific login credentials on top of everything else. Contact sync pulls an organization's existing directory into 3CX automatically, so extensions and contacts stay aligned with the same directory already being maintained elsewhere, rather than being manually re-entered and separately kept in sync by hand.\n\nMicrosoft Teams integration lets 3CX calling capability work directly within the Teams interface many organizations already live in day-to-day, rather than requiring a genuinely separate, distinct application just for phone calls. Calendar-based presence automatically reflects a user's actual calendar status — in a meeting, for instance — as their presence status within 3CX, so coworkers can see someone's real availability without that person needing to manually toggle Do Not Disturb every single time they step into a meeting."
      },
      {
        "heading": "Live chat, SMS, and WebMeeting",
        "objectives": ["2.3"],
        "body": "A website live chat widget lets visitors on a company's website message the business directly, with those conversations routed through the same 3CX system already handling voice calls — one unified place for a business's communications rather than a separate, disconnected chat tool. SMS and WhatsApp channel integration extends that same principle to text-based channels people already use daily, letting a business message customers through the channel those customers actually prefer, rather than forcing every interaction through a phone call.\n\nWebMeeting is 3CX's built-in video conferencing and meeting capability, and screen sharing extends it for genuine collaboration during a call or meeting, not just voice — removing the need for a separate, dedicated video conferencing product entirely. An omnichannel agent view brings chat, SMS, voice, and other channels together into one single unified interface for an agent, so they're not juggling several completely separate applications at once just to handle one customer's full conversation history across channels."
      },
      {
        "heading": "Custom API and automation",
        "objectives": ["2.4"],
        "body": "Custom API and webhook integration lets 3CX be extended well beyond its built-in feature set, connecting to essentially any external system that can send or receive an API call — the practical ceiling on what 3CX can do becomes limited mainly by imagination and integration effort rather than by any built-in feature list. An automation platform connector plugs 3CX into broader workflow-automation tools, letting phone events trigger actions in other systems (or the reverse) without writing bespoke custom integration code for every single scenario from scratch.\n\nCustom reporting API access lets an organization pull raw call and system data out of 3CX programmatically, to build entirely custom dashboards or feed data into a separate business intelligence tool, rather than being limited strictly to 3CX's own built-in reporting views. This whole domain reflects a broader shift in modern PBX platforms generally: increasingly valued not just for making and receiving calls well, but for how cleanly they connect into the rest of a business's actual technology stack around them."
      }
    ]
  },
  {
    "domain": "a3",
    "overview": "A phone system is a genuine attack surface, not just a productivity tool — it's internet-facing, handles real credentials, and carries sensitive conversations. This domain covers securing remote extensions specifically, encrypting traffic end to end, protecting against data loss through backups, and controlling exactly who can administer the system in the first place.",
    "sections": [
      {
        "heading": "Remote extension security",
        "objectives": ["3.1"],
        "body": "3CX Tunnel's security model wraps remote extension traffic in a secure, authenticated connection without requiring a traditional VPN — but understanding how that security model actually works matters when troubleshooting or genuinely auditing remote access, not just when it's quietly working fine in the background. An SBC (Session Border Controller) is a concept that sits at the network edge specifically controlling and securing SIP traffic crossing that boundary — in smaller 3CX deployments this role is often handled by 3CX itself, but larger or more security-conscious ones sometimes add a genuinely dedicated SBC in front of it. STUN helps devices behind NAT discover their actual public-facing address, which is foundational to making remote calling work correctly at all through typical home or office routers that weren't specifically built with VoIP in mind.\n\nBlacklist and failed-authentication protection automatically blocks IP addresses that repeatedly fail login attempts — a direct, necessary defense against the automated brute-force attacks that constantly probe any internet-facing SIP system, all day, every day, without exception. Extension authentication credentials are the actual username and password (or equivalent) an extension uses to register with the system, and weak or default credentials here remain one of the single most common, most avoidable ways a 3CX system actually gets compromised in the real world."
      },
      {
        "heading": "Encryption and certificates",
        "objectives": ["3.2"],
        "body": "TLS (Transport Layer Security) encrypts SIP signaling — the call setup and control traffic — while SRTP (Secure RTP) encrypts the actual audio itself; both matter together, since encrypting one without the other still leaves a real, exploitable gap in what's genuinely protected end to end. Let's Encrypt certificate integration lets 3CX obtain and manage TLS certificates automatically, at no cost, rather than an administrator needing to manually purchase, install, and separately track a commercial certificate.\n\nCertificate renewal has to happen before an existing certificate actually expires, or encrypted connections break outright — automated renewal (which Let's Encrypt integration specifically enables) removes this as a recurring manual chore an administrator has to remember to do on a schedule. Encrypted management console access protects the admin interface itself with TLS, which matters enormously since that console is precisely where an attacker who compromised it could reconfigure the entire system — routing, trunks, extensions, all of it — not just intercept a single call."
      },
      {
        "heading": "Backup, restore, and updates",
        "objectives": ["3.3"],
        "body": "Scheduled backups run automatically on a recurring basis, capturing the system's configuration (and depending on settings, recordings and other data) without relying on anyone remembering to do it manually — the single most reliable way backups actually happen consistently over time, since manual processes eventually, inevitably get skipped. Manual backup and restore remain valuable specifically before a risky change — a major update, or a significant reconfiguration — giving a known-good rollback point to return to if that specific change goes wrong.\n\nSystem migration uses backup and restore to move a 3CX deployment between servers or even between platforms entirely, such as moving from an on-premise Windows install to Debian Linux, without needing to rebuild every extension, trunk, and routing rule completely from scratch. Maintenance updates keep the system current with 3CX's own security and feature patches, and — echoing the same discipline that applies to essentially any production system — testing an update in a non-production environment first, where realistically feasible, is the pattern that avoids an update unexpectedly breaking a live, business-critical phone system in the middle of a working day."
      },
      {
        "heading": "Advanced access control",
        "objectives": ["3.4"],
        "body": "Role-based admin access limits what a given administrator account can actually do within the system, rather than every admin account automatically having full, unrestricted control over everything — a junior IT staffer might reasonably be granted extension management rights without also being handed trunk configuration or, more sensitively, billing access. IP-based access restriction limits which source IP addresses are even permitted to reach the admin console at all — restricting it to a specific office network or VPN range meaningfully shrinks the attack surface compared to leaving admin access open to the entire internet.\n\nAudit logging of admin changes records who changed what and when within the system — genuinely valuable both for security investigations after something goes wrong and for the more mundane, everyday task of figuring out exactly why a particular setting is currently configured the way it is, weeks or months after the actual change was made and the reasoning has otherwise been forgotten."
      }
    ]
  },
  {
    "domain": "a4",
    "overview": "Running 3CX for a single company is one operational model; running it for multiple separate customers on genuinely shared infrastructure is an entirely different one. This domain covers the architecture, licensing, and day-to-day operational practices specific to a hosting provider or MSP model.",
    "sections": [
      {
        "heading": "Multi-tenant architecture",
        "objectives": ["4.1"],
        "body": "The multi-tenant PBX concept lets a single 3CX deployment host multiple genuinely separate customer organizations (tenants) at once, each with their own extensions, trunks, and configuration, rather than needing an entirely separate 3CX installation per customer. Tenant isolation ensures one tenant genuinely can't see or affect another tenant's configuration, calls, or data — the foundational security guarantee the entire multi-tenant model depends on holding true without exception.\n\nA master console gives a hosting provider centralized visibility and management across all of its tenants from one single place, rather than needing to log into each tenant's environment completely separately just to check on routine status or make a simple change. White-labeling lets a reseller present the platform under their own brand entirely, with the underlying 3CX platform not necessarily visible to that reseller's own end customers at all — a meaningful business consideration for a reseller whose own brand identity genuinely matters to them."
      },
      {
        "heading": "License and resource pooling",
        "objectives": ["4.2"],
        "body": "Shared or pooled licensing lets simultaneous call capacity be allocated flexibly across multiple tenants from one combined license pool, rather than every individual tenant needing its own entirely separate, individually-purchased license — genuinely more efficient when different tenants have different, non-overlapping usage patterns and peak times throughout the day. Per-tenant resource limits still cap what any single tenant can actually consume from that shared pool, preventing one unusually busy or misbehaving tenant from starving every other tenant sharing the same underlying infrastructure.\n\nA tenant provisioning workflow standardizes exactly how a new tenant actually gets set up — consistent, repeatable steps rather than an ad hoc process reinvented slightly differently every single time a new customer signs up. A tenant onboarding checklist supports that same workflow, helping ensure nothing genuinely important — a trunk, a security setting, an initial extension — gets accidentally missed during setup, especially under the time pressure of onboarding several new customers around the same time."
      },
      {
        "heading": "Hosting provider operations",
        "objectives": ["4.3"],
        "body": "Centralized monitoring across tenant PBXs lets a provider watch the health of every hosted tenant from one unified place, rather than needing to check each one individually and separately — genuinely essential once tenant count grows beyond just a small handful. Tenant-level backup strategy has to account for the fact that different tenants may have real, different requirements around retention and recovery expectations, rather than assuming one single backup policy genuinely fits every hosted customer equally well.\n\nCross-tenant security isolation deserves particular, ongoing operational attention — beyond the basic architectural guarantee covered earlier, day-to-day operational practices (who has access to what, how changes actually get made) have to actively maintain that same isolation over time, not just rely on the underlying platform to enforce it in every conceivable case. SLA considerations for hosted deployments mean a provider is now on the hook for uptime and support commitments made to paying customers — a meaningfully different level of operational accountability than simply running a phone system purely for internal, in-house use."
      },
      {
        "heading": "Reseller/MSP considerations",
        "objectives": ["4.4"],
        "body": "Billing and subscription management for resold seats handles the genuinely real business logistics of actually charging customers for a hosted service — a whole additional dimension beyond the purely technical work covered elsewhere in this certification. Tiered support models let a provider offer genuinely different support levels — basic versus premium, for instance — matched to what different customers are actually willing to pay for.\n\nCustomer offboarding and migration matters just as much as onboarding: cleanly and securely removing a departing customer's data and access when they leave, or genuinely helping migrate them elsewhere if that's what they've decided to do, protects both the departing customer's data and the provider's own overall security posture and professional reputation. A custom domain per tenant lets each hosted customer present their own branded domain for things like the web client or meeting links, rather than every single tenant's users seeing the underlying hosting provider's own generic domain in the address bar."
      }
    ]
  },
  {
    "domain": "a5",
    "overview": "When something goes wrong with a live phone system, the ability to systematically diagnose the actual cause — rather than guess and start changing settings at random — is what separates a quick, confident fix from a prolonged, stressful outage. This domain also covers the reporting tools for actually proving the system's real performance over time, not just fixing it when it visibly breaks.",
    "sections": [
      {
        "heading": "Common connectivity issues",
        "objectives": ["5.1"],
        "body": "One-way audio — where one party can hear the other but not vice versa — is one of the most common VoIP symptoms there is, and it very often traces back to a NAT or firewall issue affecting the RTP media stream specifically, even when SIP signaling itself is working completely fine, since the two travel over genuinely separate ports and paths. Extension or trunk registration failure means a device or trunk simply can't establish or maintain its connection to 3CX at all — checking credentials and basic network reachability first is almost always the right, fastest starting point before assuming anything more complicated or exotic is actually going on.\n\nNAT-related call issues are a recurring theme throughout VoIP troubleshooting generally, since NAT can interfere with call setup, one-way audio, or dropped calls in several genuinely different specific ways depending on exactly how it's configured. A codec mismatch, covered from a configuration standpoint back in Basic certification, shows up here from the troubleshooting side — recognizing it as the actual, specific root cause of a call that fails to connect or has genuinely degraded quality, rather than assuming a vaguer, less specific 'network problem' and troubleshooting the wrong layer entirely."
      },
      {
        "heading": "Diagnostic tools",
        "objectives": ["5.2"],
        "body": "A SIP trace or activity log captures the actual signaling exchange for a call — every message sent and received — which is very often the single fastest way to pinpoint exactly where in the call setup process something is genuinely failing, rather than just observing that a call simply doesn't connect with no further insight into why. Packet capture goes a level deeper still, recording raw network traffic for the most difficult cases where even the SIP trace alone doesn't provide enough detail to identify the actual root cause.\n\nA firewall or port diagnostic check — closely related to the built-in firewall checker covered back in Basic certification's networking chapter — verifies that the specific ports 3CX genuinely needs are actually open and correctly reachable, which is worth checking early since a huge share of connectivity problems ultimately trace back to exactly this, rather than to anything more deeply exotic or unusual."
      },
      {
        "heading": "Call reports and analytics",
        "objectives": ["5.3"],
        "body": "Queue reports show how a call queue is actually performing over time — wait times, abandonment rate, SLA compliance against the specific threshold set for that queue — turning the real-time wallboard view from Basic certification into genuine historical, trackable data that can inform real staffing and process decisions. Extension or agent reports show individual performance and activity — call volume, talk time, and similar metrics — useful for both fair, informed staffing decisions and simply understanding realistic call patterns across the team.\n\nSMDR (Station Message Detail Recording) is a standardized, detailed call-logging format, commonly used to feed external billing or reporting systems that need genuinely granular, itemized call data beyond what 3CX's own built-in reports alone provide — the kind of raw, structured data an accounting system or a dedicated third-party analytics platform can actually ingest and process directly."
      },
      {
        "heading": "Performance and capacity",
        "objectives": ["5.4"],
        "body": "Capacity planning for growth revisits the same simultaneous-call sizing question from initial deployment, but now on an ongoing basis as a business actually grows — a system correctly sized for 20 concurrent calls at launch will eventually need genuine re-evaluation once the business scales meaningfully past that original number. Performance monitoring dashboards give ongoing visibility into system health — CPU, memory, call quality metrics — letting a genuine capacity problem be caught proactively, well before it manifests as actual dropped or failed calls that users start reporting on their own.\n\nCorrelating logs across trunk, extension, and queue data is often what's actually required to fully understand a complex issue that spans more than one specific component — a problem that looks, in isolation, like it's purely a trunk issue might genuinely only make sense once queue behavior is examined alongside it in the same timeframe. Escalating to vendor support with a diagnostic bundle — genuinely, actually including the specific logs, traces, and captures already gathered from all of the tools covered in this domain — dramatically speeds up vendor resolution time compared to a vague report that simply says 'calls aren't working,' with no supporting detail for the vendor's own support team to actually work from."
      }
    ]
  }
  ];
})();
