(function () {
  'use strict';
  window.THREECX_BASIC_GUIDE = [
  {
    "domain": "b1",
    "overview": "Before any extension or call route can exist, 3CX has to actually be deployed and prepared to handle real-time voice traffic. This domain covers where the system runs, getting through initial setup and licensing, and making sure the network itself is ready — voice traffic is far less forgiving of misconfiguration than ordinary web traffic.",
    "sections": [
      {
        "heading": "Deployment options and requirements",
        "objectives": ["1.1"],
        "body": "3CX can run as an on-premise Windows deployment, on Debian Linux, or as a 3CX-managed cloud-hosted deployment — each with real tradeoffs. On-premise Windows is the most familiar starting point for a Windows-centric IT team, but comes with the full patching and maintenance burden of any Windows server. A Debian Linux deployment is lighter-weight and is 3CX's own recommended platform going forward, at the cost of needing at least basic Linux comfort to administer. Cloud deployment is either Hosted by 3CX, where 3CX manages the operating system, updates, and monitoring, or a self-hosted instance in your own cloud account, trading some control for convenience.\n\nSimultaneous call sizing is the single most important planning number before deployment — it determines how many concurrent calls the system needs to support, which sets the license size and drives the load on the server; 3CX publishes its hardware tiers by extension count (for example up to 10, 50, 250, or 1,000 extensions), and queues and recording add load. Getting this number wrong in either direction either wastes money on unused capacity or causes calls to fail outright once the ceiling is hit during a busy period. System requirements planning ties CPU, memory, and storage sizing directly to that same simultaneous call figure, plus the number of extensions and any add-on features like call recording that will actually be running."
      },
      {
        "heading": "Initial setup wizard and licensing",
        "objectives": ["1.2"],
        "body": "The setup wizard walks through the first-run configuration after installation — company details, an initial admin account, and the basic settings the rest of the system builds on. It's a one-time process, but getting it right the first time avoids having to backtrack through settings scattered across the admin console later. 3CX SMB is a free edition for up to 10 users that runs on a shared instance managed by 3CX, so there is nothing to host or license — a legitimate way to run a very small deployment, while larger companies need a dedicated instance and a license.\n\n3CX licensing is based on simultaneous call count rather than per-extension or per-seat pricing, which is a meaningfully different model from many competing PBX platforms and directly ties back to the sizing decision made during deployment planning. License activation ties a purchased license to a specific installation, and company information configuration — business name, address, timezone — feeds into details that show up throughout the system later, from caller ID formatting to scheduling, so it's worth getting genuinely correct up front rather than treating it as a throwaway field."
      },
      {
        "heading": "Networking prerequisites",
        "objectives": ["1.3"],
        "body": "3CX requires an FQDN (fully qualified domain name) rather than a bare IP address — this is what allows features like TLS encryption and remote extension connectivity to work correctly, and skipping it early tends to cause problems that only surface later once remote users or encryption are actually needed. The SIP signaling port handles call setup and teardown, while a separate RTP media port range carries the actual audio — two genuinely distinct traffic types with different firewall and NAT requirements, which is a common source of confusion for anyone used to simpler single-port services.\n\n3CX includes a built-in firewall checker that tests the firewall's UDP behavior with STUN — port preservation, full cone NAT, and SIP ALG interference — rather than leaving an administrator to guess and wait for the first failed call to find out. Dynamic DNS keeps a hostname pointed at the system's current IP address when that address isn't static, which matters for any deployment without a fixed public IP. Reverse proxy or router port forwarding is what actually exposes the system to the internet for external calls and remote extensions in the first place — without it correctly configured, the system can work flawlessly for internal-only calls while remaining completely unreachable from outside."
      },
      {
        "heading": "Hosting choices, sizing, and installation details",
        "objectives": ["1.1", "1.2"],
        "body": "Choose how 3CX runs: Hosted by 3CX (3CX manages the operating system, updates, and monitoring, but support is not included), a self-hosted private cloud at Google, AWS, Lightsail, Azure, or DigitalOcean, or on premise on Windows or Debian. 3CX SMB is a free shared instance for up to 10 users. Install the Debian version from 3CX's ISO on a dedicated machine, never run OS updates by hand, and finish by uploading the configuration file from your 3CX account. Supported hypervisors are ESXi 6.5u1+, Hyper-V 6.2+, KVM 2.8+, and XenServer 7.0+.\n\nSize by extensions (Small 10, Medium 50, Large 250, Enterprise 1,000), allow disk for recordings (about 1 MB a minute) and logs, and use at least a 1 Gb LAN with QoS. The extension number length and the FQDN are chosen during setup and cannot easily be changed. Editions (SMB, Basic, Pro, AI) gate features such as barge in (Pro or AI) and failover (AI), and a version 20 upgrade needs a System Owner, split DNS, departments, and office hours per department."
      },
      {
        "heading": "Network readiness for 3CX",
        "objectives": ["1.3"],
        "body": "On-premise systems need a private RFC 1918 network, a static LAN IP, a dedicated public IP, and split DNS so the FQDN resolves to the LAN address inside and the public address outside. Open inbound UDP 5060 and TCP 5060 to 5061 (SIP), UDP 9000 to 10999 (audio, two ports per call), TCP and UDP 5090 (tunnel), and TCP 443 or 5001 (HTTPS); keep HTTP 5000 closed to the WAN. The PBX also needs outbound TCP 443 to 3CX cloud services and to Google and Apple for push.\n\nDisable SIP ALG, and make sure the firewall preserves source ports and behaves as full cone NAT; the built-in firewall checker tests port preservation, full cone NAT, and SIP ALG using STUN. You must also define ACLs that keep the PBX host away from sensitive subnets."
      },
      {
        "heading": "System health and housekeeping",
        "objectives": ["1.4"],
        "body": "The dashboard shows license, version, update, backup, storage, and service status with shortcuts to troubleshooting tools, and the event log records errors, warnings, and information with unique IDs (for example 4099 for an emergency call, 4100 for a trunk status change, 12289 for a trunk failover, and 8193 for the license limit); email alerts can be set for critical events.\n\nEnable automatic updates, which also apply Debian OS updates; there is no rollback. Avoid downtime from a full disk by archiving recordings and backups to remote storage, setting auto-clean, a voicemail quota, and log purging, and remember Disk Protect Mode stops recording writes below about 500 MB of free space."
      }
    ]
  },
  {
    "domain": "b2",
    "overview": "This is the largest domain by weight — the actual day-to-day work of provisioning and supporting the people and devices that use the phone system. Everything from creating a single extension to setting up hot desking for a shared office lives here.",
    "sections": [
      {
        "heading": "Creating and managing extensions",
        "objectives": ["2.1"],
        "body": "An extension is the fundamental unit of a 3CX deployment — a phone number and identity assigned to a person, department, or shared resource, and essentially every other feature in the system attaches to one. An extension template captures a standard set of settings (voicemail behavior, permissions, ring settings) that can be applied consistently to new extensions, rather than configuring every setting by hand for every single user — a real time-saver in any deployment beyond a handful of people.\n\nOutbound caller ID controls what number shows up when that extension makes an external call, which matters both for professionalism and, in some cases, for regulatory compliance depending on the business's location. Bulk extension import lets many extensions be created at once from a spreadsheet or similar source, rather than clicking through the setup wizard individually for every single user — the difference between a manageable afternoon and a genuinely miserable one when onboarding a large office all at once."
      },
      {
        "heading": "IP phone provisioning",
        "objectives": ["2.2"],
        "body": "Auto-provisioning lets a physical desk phone automatically pull its configuration from 3CX the moment it connects to the network, rather than an administrator manually configuring each phone's settings through its own local web interface one at a time. This is what makes deploying dozens or hundreds of physical phones actually practical rather than an enormous manual burden.\n\nA MAC-based phone template ties a specific physical phone (identified by its unique MAC address) to a specific extension and configuration profile, so the correct settings land on the correct desk automatically without an administrator needing to track which physical unit is which. 3CX maintains supported phone brand templates for the major desk phone manufacturers, which is what actually makes true auto-provisioning possible in the first place — a phone model without a matching template generally has to be configured manually instead, losing most of the benefit."
      },
      {
        "heading": "Softphone and client apps",
        "objectives": ["2.3"],
        "body": "The 3CX Windows app turns a Windows 10 or 11 computer into a softphone (or controls a desk phone in CTI mode), with the same extension identity a physical desk phone would have — genuinely useful for remote or hybrid workers who don't have a physical phone in front of them at all. The 3CX mobile app extends that same capability to a smartphone, letting a user make and receive calls on their business extension from anywhere with data or Wi-Fi. The 3CX Web Client runs directly in a browser with no separate install at all, useful for a quick session on a shared or unfamiliar machine.\n\n3CX Tunnel is a specific, secure connection method that lets a remote client (desktop, mobile, or otherwise) reach the PBX without needing a traditional VPN configured separately — genuinely simplifying remote deployment compared to older PBX platforms that required VPN infrastructure just to let a phone work from home. Presence status shows whether a given extension is available, busy, or away in real time across all of these clients at once, letting coworkers see at a glance whether someone can actually take a call before dialing them."
      },
      {
        "heading": "Voicemail and personal settings",
        "objectives": ["2.4"],
        "body": "A voicemail box captures messages when a call to an extension goes unanswered, and email-to-voicemail forwards that recorded message (often as an audio attachment, sometimes with a transcription) directly to the user's email — meaning a message left at 2am is genuinely likely to actually be heard and acted on the same day, not just sit unheard in a phone system most people rarely think to check manually.\n\nCall forwarding rules let a user redirect their incoming calls to another number or extension — always, when busy, when unanswered, or under other specific conditions — giving individual flexibility without needing an administrator to intervene for every routine change. Do Not Disturb (DND) lets a user temporarily stop incoming calls from ringing through at all, typically routing straight to voicemail instead — useful during a meeting or focused work block, and something a user can toggle themselves without any admin involvement."
      },
      {
        "heading": "Additional telephony features",
        "objectives": ["2.5"],
        "body": "Call parking puts an active call on hold in a shared, generally-accessible spot rather than a specific extension's own private hold, so any other extension in the office can retrieve it — genuinely useful for handing a call off to a coworker who isn't at their own desk to take a direct transfer. Paging and intercom let one extension broadcast audio to one or many others, commonly used for office-wide announcements or a quick, low-friction one-way heads-up.\n\nHot desking lets a user log into any physical phone in the office and have it temporarily become their own extension, with their own settings and voicemail — genuinely practical in a shared-desk or hybrid-office environment where no one has one permanently assigned physical phone. Call pickup lets a user answer a call ringing at a different extension from their own phone, without needing to physically walk over to it. Shared extension and BLF (Busy Lamp Field) round this out by giving visibility into another extension's real-time status directly on a physical phone's display — a receptionist, for instance, being able to see at a glance which extensions are currently on a call before transferring to them."
      },
      {
        "heading": "Adding users, phones, and the Welcome email",
        "objectives": ["2.1", "2.2", "2.7"],
        "body": "Create a user in Admin > Users with an email address, name, mobile number, outbound caller ID, role, main department, and an assigned DID (normally the same number as the outbound caller ID so return calls come back to the right person). Each new user is sent a Welcome Email with their account details. Add a phone from the user's IP Phone tab by choosing the model and entering the MAC address without dashes or colons, then choose the connection: a router phone or SBC for a cloud-hosted PBX, or Local LAN/VPN as an extra option on premise.\n\nA phone then needs its provisioning URL: RPS (the vendor's cloud server supplies it; connect the phone within 14 days), PnP (the phone broadcasts itself and appears under Phones > PnP Phones), DHCP option 66 (one vendor per URL format), or manual configuration for older phones using extension, authentication ID, password, and the FQDN (or the SBC or router phone IP when remote). The console can mass-update Fanvil, Yealink, and snom phones to 3CX-tested firmware. A router phone is an IP phone that also runs the SBC; larger sites install a standalone 3CX SBC on Windows, Debian, or a Raspberry Pi."
      },
      {
        "heading": "Roles, departments, and secure sign-in",
        "objectives": ["2.6"],
        "body": "A department holds users and call-handling objects and supplies their office hours, holidays, and time zone; best practice is one department per user, and SMB and Multi-Company systems have no departments. Department roles are User, Receptionist (overrides office hours), Supervisor (reports and queue oversight), Department Administrator (call handling, trunks, messaging), Manager (adds user management, recordings, barge in and listen in), and Owner (can elevate users in its departments up to Manager or Department Administrator). System Administrator and System Owner are system-wide; only a System Owner can elevate someone to either.\n\nProtect accounts with two-factor authentication using a Google or Microsoft authenticator app, and consider single sign-on with Google or Microsoft."
      },
      {
        "heading": "Apps, voicemail, forwarding, and recording",
        "objectives": ["2.3", "2.4", "2.5"],
        "body": "A 3CX Talk link lets visitors call a user, ring group, or queue from a browser with no app or call charge, and a 3CX Meet link opens a person's meeting room for an ad hoc video conference. Users can choose which assigned DID shows on outgoing app calls once \"Allow Users to Select Outbound Route & Caller ID\" is enabled. For groups, voicemail can be emailed only, cloned into each member's box, or sent to extra recipients only. A user can set up to 15 forwarding exceptions matched by caller ID, and Switch Status sets Available, Away, or Do Not Disturb from the office hours.\n\nCall recording saves to a temporary folder outside the install directory, then archives to remote storage; a per-user option stops other internal parties recording a protected extension. Dial codes in Admin > System > Dial Codes include the paging code (for example *9), which is also the intercom prefix."
      }
    ]
  },
  {
    "domain": "b3",
    "overview": "Trunks connect a 3CX system to the outside phone network, and once that connection exists, inbound and outbound rules control exactly how calls actually flow once they arrive or need to leave. Nothing in this domain works in isolation — a trunk without correctly configured routing is just as useless as routing rules with no trunk to actually carry the calls.",
    "sections": [
      {
        "heading": "SIP trunk configuration",
        "objectives": ["3.1"],
        "body": "A SIP trunk is the connection between 3CX and a telephony provider that actually carries calls to and from the public phone network — without one, the system can only make internal, extension-to-extension calls. Trunk registration is how 3CX authenticates itself to that provider, similar in spirit to a phone logging into a network, and a registration that fails or drops means outbound and inbound calling through that trunk stops working entirely, even though everything else in the system looks perfectly healthy.\n\nA DID (Direct Inward Dial) or DDI number is a specific external phone number a provider assigns that can be routed directly to a specific extension, ring group, or IVR inside 3CX. Most providers have their own specific configuration quirks, which is exactly why 3CX maintains trunk provider templates — pre-built configuration profiles for common providers that handle those provider-specific details automatically, sparing an administrator from figuring it out from scratch. Multiple trunk redundancy configures more than one trunk (often from different providers) so that if one genuinely fails, calling capability doesn't disappear entirely along with it — a real resilience consideration for any business where phone availability actually matters."
      },
      {
        "heading": "Inbound rules and DID routing",
        "objectives": ["3.2"],
        "body": "In V20 a call arriving on a specific DID goes to the destination that has that DID assigned — the DID is chosen in the Assigned DID Number(s) list of a user, ring group, queue, or digital receptionist. Routing destination types cover the range of places a call can actually land: a single extension, a ring group, a call queue, an IVR menu, or several other options, each suited to a different kind of business need. Multiple DID handling means a single trunk can carry several different phone numbers at once, each assigned to its own destination — a single main office trunk routing a sales line one way and a support line an entirely different way.\n\nFallback and failover routing defines what happens if the primary destination for a call is unavailable — unreachable, or simply not answering — routing to a backup destination instead of the caller just hitting dead air or an endless unanswered ring. Time-based inbound routing changes where a call goes depending on when it arrives — routing to a receptionist during business hours, but straight to an after-hours voicemail or answering service outside them — driven by the office hours of the destination's department, as covered later in this certification."
      },
      {
        "heading": "Outbound rules and caller ID",
        "objectives": ["3.3"],
        "body": "An outbound rule controls how calls leaving the system get routed — which trunk actually carries a given outbound call, and under what conditions. Dial pattern matching is what determines which rule actually applies to a given dialed number — matching based on patterns like number length or specific prefixes (an international prefix, for instance), letting different types of calls be routed through different trunks or handled differently entirely.\n\nLeast-cost routing is built by ordering an outbound rule's routes (up to five, tried in sequence) so that the cheapest trunk for a destination prefix comes first — genuinely valuable when a business has multiple trunks with meaningfully different per-minute rates for different call types (long-distance versus local, for example). Per-rule outbound caller ID lets different outbound rules present a different caller ID depending on which rule handled the call — a sales team's outbound calls showing a different number than a support team's, even from the very same underlying system. Emergency calling configuration deserves particular attention: correctly routing emergency numbers to a trunk that can actually deliver accurate location information to responders is a genuine life-safety consideration, not merely a technical or box-checking one. 3CX handles dialed emergency numbers ahead of all outbound and office-hours rules, using one mandatory route and up to four alternatives."
      },
      {
        "heading": "Codecs and gateway concepts",
        "objectives": ["3.4"],
        "body": "A codec compresses and decompresses audio for transmission, and the two most common ones represent a real, direct tradeoff. G.711 delivers the highest audio quality with essentially no compression, at the cost of using considerably more bandwidth per call. G.729 compresses audio much more aggressively, using far less bandwidth per call, at a modest but genuinely audible cost to voice quality — the right choice largely depends on how much bandwidth is actually available, particularly over a constrained or expensive WAN link.\n\nCodec negotiation is the automatic process by which two endpoints agree on which codec to actually use for a given call, and a codec mismatch — where two endpoints simply can't agree on a common codec at all — is a classic, if less common today, cause of a call that fails to connect or connects with no audio at all. An analog/PSTN gateway bridges traditional analog phone lines or legacy hardware — an old fax machine, or a legacy alarm system line — into a modern IP-based 3CX system, letting equipment that predates IP telephony entirely keep working alongside it rather than needing to be replaced outright."
      },
      {
        "heading": "SIP trunks and DID routing in V20",
        "objectives": ["3.1", "3.2"],
        "body": "To make and receive external calls you need an account with a SIP trunk (VoIP) provider; a supported provider is pre-configured and supported by both 3CX and the provider, while 3CX will not help configure an unsupported one. Add the trunk in Admin > Voice & Chat with a name, a default route, the provider, and either register-based details or IP-based authentication; an IP-based trunk has no registration, always shows green, and requires you to tell the provider if the PBX IP changes. The default route handles DIDs not assigned anywhere, the main trunk number is the default caller ID for extensions without their own DID, and the Limit to option makes a trunk system-wide or department-specific.\n\nIn V20 you route a DID by choosing it in the Assigned DID Number(s) list of the destination: a queue, ring group, or digital receptionist under Call Handling, or a user on the General tab. To find out why a call is misrouted, raise the Activity Log to Medium or Verbose and check the DID that arrived (the \"called=\" value or the To header). For SMS, enable it on the trunk, exchange webhooks with the provider, and enter every DID in E.164 format."
      },
      {
        "heading": "Outbound rules and emergency numbers",
        "objectives": ["3.3"],
        "body": "An outbound rule triggers on the dialed prefix, the length of the number, the calling extensions, and the calling departments (the extension and department lists are cumulative), may strip or prepend digits, and can set an outbound caller ID, which the provider may still ignore because most do not allow unverified caller IDs. Rules are evaluated top to bottom and the first match wins; new rules go to the bottom and are moved up for priority.\n\nEach rule has up to five routes tried in order: an unregistered trunk is skipped, but a busy answer (486, 600, 1408) ends the attempt, and answered or cancelled calls stop the hunt. With several routes, early media is dropped. Emergency numbers (Admin > System > Emergency) ignore outbound and office-hours rules, need one route plus up to four alternates, and can notify by email, chat, or an announcement."
      },
      {
        "heading": "Codecs and audio quality",
        "objectives": ["3.4"],
        "body": "G.711 (PCMU and PCMA) uses 8 kHz at 64 kbit/s with very little CPU, G.722 is 16 kHz wideband at 64 kbit/s with average CPU, G.729 is 8 kbit/s with higher CPU, and Opus is about 20 kbit/s but needs roughly one thread per 50 endpoints. The codec priority under Admin > Advanced > Codecs applies only to calls through the 3CX apps and can differ for mobile-network and Wi-Fi connections; trunk and IP phone codecs are configured separately and the defaults are recommended."
      }
    ]
  },
  {
    "domain": "b4",
    "overview": "Once a call actually reaches the system, this domain covers the tools for automatically directing it to the right person or team — auto-attendants, ring groups, and call queues — plus controlling exactly when each of those behaviors is actually active.",
    "sections": [
      {
        "heading": "Digital Receptionist (IVR)",
        "objectives": ["4.1"],
        "body": "A Digital Receptionist (IVR — Interactive Voice Response) is 3CX's automated attendant, greeting callers and letting them choose where to go, typically by pressing a number on their keypad — 'Press 1 for Sales, Press 2 for Support' being the classic, familiar example. IVR prompt recording is the actual audio greeting and menu options a caller hears, and getting the wording and pacing genuinely right on these matters more to a caller's first impression of a business than almost any other single setting in the system.\n\nA holiday schedule specifically for the IVR lets it play a different greeting or route differently on designated holidays — distinct from the general business hours scheduling covered in the next section, since a holiday might fall on what would otherwise be a normal business day. IVR menu options define exactly what happens for each keypress a caller might make, and each option ultimately routes to one of the same destination types available to inbound rules generally — an extension, a ring group, a queue, or even another, nested IVR menu for more complex routing trees."
      },
      {
        "heading": "Ring groups",
        "objectives": ["4.2"],
        "body": "A ring group is a collection of extensions that all get a chance to answer the same incoming call, without the caller needing to know or select any specific individual extension. Ring strategy controls exactly how those extensions actually ring — Ring All rings everyone at once, Prioritized Hunt rings members one after another from the top of the list, and the Paging strategies broadcast announcements.\n\nRing group overflow defines what happens if no one in the group answers within a set amount of time — routing onward to another destination like voicemail, a different group, or even a queue, rather than leaving a caller ringing indefinitely with no answer and no clear next step. Group membership management is the ongoing, genuinely routine task of keeping who's actually in a given ring group current as staff join, leave, or change roles — a ring group with long-departed employees quietly still listed as members is a small but surprisingly common real-world configuration-hygiene issue."
      },
      {
        "heading": "Call queues and strategies",
        "objectives": ["4.3"],
        "body": "A call queue holds callers in an ordered line when every available agent is currently busy, rather than the call simply failing or going unanswered outright the way it might in a group with no queue at all. Queue strategy determines exactly how a waiting call gets distributed to agents as they become free — with many more options than a ring group (Round Robin, Longest Waiting, Least Talk Time, Fewest Answered, and others), and specifically built for a higher-volume, more structured environment like a support or sales queue with more callers waiting at once.\n\nQueue agents are the specific extensions actually assigned to staff and answer calls from a given queue, and an agent can typically log in or out of a queue as needed — stepping away for a break without needing an administrator to reconfigure anything on their behalf. A queue wallboard gives a real-time visual dashboard of queue status — calls waiting, current wait time, agents currently available — letting a team see at a glance whether they're keeping up or falling behind. An SLA (Service Level Agreement) threshold sets a target, like 'answer 80% of calls within 30 seconds,' and the queue's own reporting tracks actual performance against that target directly, which becomes the practical, measurable definition of 'good enough' service for that specific queue."
      },
      {
        "heading": "Business hours scheduling",
        "objectives": ["4.4"],
        "body": "A business hours schedule defines when a system is actually considered 'open' versus 'closed' for routing purposes, and it's what powers the time-based inbound routing and IVR behavior differences covered earlier — in V20 office hours are set per department and applied at the destination, so an IVR, queue, ring group, or extension follows the hours of the department it belongs to, and the same number can route to a receptionist during business hours and straight to voicemail or an answering service outside them.\n\nSpecial or holiday days let specific dates override the normal weekly recurring schedule — a business that's normally open every Monday can still be correctly marked closed for a specific holiday Monday without permanently changing the regular weekly schedule itself. Getting this scheduling genuinely right matters more than it might first appear: a caller reaching an IVR that still cheerfully says 'we're open' outside actual business hours, or on a day the office is genuinely closed, reflects poorly on a business in a way that's completely avoidable with correctly maintained scheduling."
      },
      {
        "heading": "IVR menus, prompts, and invalid input",
        "objectives": ["4.1"],
        "body": "A standard IVR / digital receptionist menu offers up to 10 options, and you can create as many menus as you need and send a key to another one. Its prompt can be recorded or uploaded; a pre-recorded file must be PCM WAV, 8 kHz, 16-bit, mono, with no reserved characters in the file name and no MP3. The IVR inherits the office hours of its department, and the Options tab sets where calls go when there is no input or an invalid key and whether callers may dial extensions directly. A department menu is the simple alternative that plays one announcement and routes by office hours."
      },
      {
        "heading": "Ring groups, paging, and queue strategies",
        "objectives": ["4.2", "4.3"],
        "body": "A ring group rings its members using Prioritized Hunt (list order, always from the top) or Ring All (everyone at once) for the ring time (default 20 seconds), with separate unanswered destinations for office hours, breaks, out-of-office hours, and holidays. Paging strategies use the paging dial code; Paging Multicast sends one stream to a multicast address, needing multicast phones on the same subnet as 3CX.\n\nA queue also offers Hunt Random Start, Round Robin (fair rotation), Longest Waiting, Least Talk Time, Fewest Answered, and Hunt by Threes (random or prioritized). The AI edition adds skills-based strategies (skill levels 1 to 5 with availability-driven, time-driven, or cumulative escalation), wrap-up time, maximum callers in queue, priority queue, and SLA time. Members must be logged in to receive calls, callers can request a callback, and prompts can announce queue position or estimated wait."
      },
      {
        "heading": "Office hours, breaks, time zones, and holidays",
        "objectives": ["4.4"],
        "body": "Office hours are set per department in V20 and applied at the destination: an IVR, queue, ring group, or extension uses the hours of the department it belongs to, whichever trunk the call arrived on. Hours include breaks, each department can have its own time zone, and SMB and Multi-Company systems have a single set of hours.\n\nAdd holidays under Office Hours, and from V20 Update 9 set custom holiday messages in the holiday routing of queues, ring groups, IVRs, and departments; the Holiday Call Flow Script handles advanced cases. A Receptionist or Manager can override office hours from the Web Client avatar menu by choosing the department, the mode, and the duration."
      }
    ]
  }
  ];
})();
