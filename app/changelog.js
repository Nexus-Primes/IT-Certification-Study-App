// ---------- What's new (data) ----------
// Kept out of app.js because it only ever grows. app.js imports it for the "What's new" panel.

// Shown in the "What's new" panel (Settings, command palette, or automatically once per
// release). Newest first; keep entries short and user-facing. Entries before v133 predate
// this app having per-build version numbers at all, so their "version" is the date instead —
// still real history, just not tagged with a build number the way later entries are.
export const CHANGELOG = [
  { version: 'v231', date: 'October 2026', title: '3CX tracks checked against the current admin manual, with 152 new concepts', items: [
    "Checked: about 25 pages of 3CX's online administrator manual (updated between May and October 2026), plus 3CX's October 2026 guide to bridges versus SBCs, were compared with the existing 3CX Basic and Advanced content. They cover deployment and hardware sizing, firewall and ports, SIP trunks, DID routing, outbound rules, emergency numbers, phones and provisioning, users and roles, queues and ring groups, IVR, office hours, recording, backup and failover, reports, Microsoft 365, CRM integration, Live Chat, and bridges.",
    "New: 3CX Basic grew from 71 to 171 concepts and 3CX Advanced from 72 to 124, each with its own diagram, plus 23 new Study guide sections and four new objectives (system health and housekeeping, users and roles, remote phones and SBCs, and multi-site architecture). Highlights: every queue strategy one by one, departments and the eight access roles, phone provisioning methods (RPS, PnP, DHCP option 66), outbound route selection, the Firewall Checker tests, CID rules and E.164 processing, the CRM Integration Wizard, Microsoft 365 sync and Teams presence loops, backup options and active-passive failover, and bridges versus SBCs.",
    "Fixed: 37 older concepts and 21 guide sentences were out of date. Free edition is now 3CX SMB (free, up to 10 users on a shared instance). Ring groups have only Prioritized Hunt and Ring All, where the old text listed a round-robin rotation. In V20 a DID is assigned on its destination rather than through an inbound rule, and office hours belong to the destination's department. The Firewall Checker tests UDP behavior through STUN, not TCP ports. Hardware tiers are published by extension count while licenses are counted by simultaneous calls. The Teams integration exchanges presence and does not put calling inside Teams. WebMeeting is now 3CX Meet, and SMDR is now the CDR service. A Let's Encrypt certificate renews itself only on a 3CX-provided FQDN. Emergency numbers override the normal outbound and office-hours rules. Two lab steps were reworded to match.",
    "Heads-up: 3CX does not publish an exam blueprint for its Academy certifications, so topic coverage is still best-effort. The multi-tenant and reseller concepts in Advanced domain 4 are general hosting practice, not a copy of a 3CX document, and the Windows app details came from 3CX forum and user-manual pages that may be older. New concepts start unseen, so your 3CX mastery percentages will dip until you work through them."
  ] },
  { version: 'v230', date: 'October 2026', title: '18 new hands-on labs for AZ-802', items: [
    "New: AZ-802 now has 30 labs, up from 12. The 18 new ones follow the new concepts across all seven areas. Five are terminal labs (transfer all operations master roles and demote the old controller, enable Hyper-V Replica and rehearse a test failover, point on-premises DNS at an Azure private endpoint, set an FSRM quota and file screen, restore a deleted OU from the Recycle Bin). Five are decision labs (choosing trust types, remote management features, Azure VM disks and encryption, storage resiliency, and monitoring tools). Six are ordering labs (a staged RODC, Update Manager rollout, DHCP failover, Azure File Sync, a LAPS rollout, and an authoritative restore). Two are case studies, about a Group Policy object that is not applying and a burst of Kerberoasting-style ticket requests, and they appear on the Case studies page.",
    "Heads-up: the new terminal labs use the same exact-command matching as the older ones, so type commands as shown in each lab's command list. The commands and outputs are simulated and were written from general knowledge of Windows Server and Azure, so treat them as practice rather than as a substitute for trying the real tools."
  ] },
  { version: 'v229', date: 'October 2026', title: 'AZ-802 and DP-300 checked against Microsoft Learn; outdated figures corrected', items: [
    "Checked: about 18 topics from the new AZ-802 and DP-300 content were compared with the current Microsoft Learn pages: automated backups and retention, disaster recovery objectives, failover groups, Log Replay Service, database watcher, hotpatching, delegated managed service accounts, Update Manager assessment, OSConfig, Windows Admin Center in Azure, Application Control, Azure Files soft delete and Entra Kerberos, Defender for Servers plans, Hyper-V Replica, Azure Monitor Agent, Automation identities, and the Arc agent logs. Most matched.",
    "Fixed (DP-300): geo-restore was described with an older rule of thumb (recovery up to about 12 hours, up to about an hour of data lost), and a failover group with about five seconds of loss. Microsoft now says geo-restore typically takes minutes or hours, and a failover group recovers in about a minute with loss that depends on replication lag. The related questions and the design lab were reworded. The failover group grace period is now described correctly: it applies to the Microsoft-managed policy and cannot be set below one hour (a customer-managed policy is recommended). Log Replay Service also restores differential backups and has autocomplete and continuous modes. Database watcher is still a preview feature.",
    "Fixed (AZ-802): Windows Admin Center in the Azure portal needs no inbound ports for Arc-enabled servers, while an Azure VM uses port 6516 by default, preferably over a private IP. Hotpatch also needs restarts for unplanned baselines and for non-security, .NET, and driver updates. A gMSA cannot be migrated to a dMSA. Entra Kerberos needs no domain controller to open a share, but setting Windows ACLs for hybrid users still does. Microsoft's name for the feature is Application Control for Windows (App Control for Business, formerly WDAC), and the questions now use it.",
    "Heads-up: only the topics listed above were checked. The rest of the roughly 380 new concepts, such as SQL database in Fabric, Managed Instance database copy and move, and the Hyper-V and storage details, were written from general knowledge and are best-effort."
  ] },
  { version: 'v228', date: 'October 2026', title: 'Network+ checked against the CompTIA objectives, with 48 new concepts', items: [
    "Checked: a copy of CompTIA's official Network+ N10-009 exam objectives (Exam Objectives Version 4.0) was found and compared, bullet by bullet and acronym by acronym, with every Network+ concept. The five domain weights (23, 20, 19, 14, 24 percent) match exactly. Of about 430 bullets, 43 had no matching concept, and 26 of the 162 listed acronyms never appeared anywhere in the app.",
    "New: Network+ grew from 441 to 489 concepts, each with its own diagram, plus 7 new Study guide sections. They close those gaps: network functions virtualization, security groups and security lists, Internet Key Exchange, Fibre Channel, hybrid topology, zero-touch provisioning, data center interconnect, the VLAN database, band steering, ad hoc and infrastructure wireless modes, ESSID, WPS, fiber distribution panels, voltage, end of life, EULA, show arp, vlan, and power, traffic analysis, performance monitoring, forward DNS zones, the SOA record, self-signed certificates, IAM, time-based authentication, geofencing, honeynets, SCADA and OT networks, BYOD, acceptable use policy, data loss prevention, risk and exploit, dumpster diving, shoulder surfing, tailgating, EAPoL, UTM, three troubleshooting approaches, and the administratively down and suspended port states.",
    "Fixed: all 292 concepts added in v225 were re-read against the standards. One was wrong: the DHCP lease steps said only the first message is a broadcast, but the client broadcasts both the Discover and the Request (RFC 2131). A grammar slip was fixed too.",
    "Heads-up: the objectives document came from a copy on a third-party training site, not CompTIA's own, so confirm on CompTIA's site that Version 4.0 is the current one. The re-read was a careful check against standards knowledge, and only the DHCP point was confirmed line by line against the RFC. POP3 and IMAP are not in this version's port table but stay in the app because they are still common. New concepts start unseen, so your Network+ mastery percentage will dip a little."
  ] },
  { version: 'v227', date: 'October 2026', title: 'AZ-802: 289 more concepts, checked against the current Microsoft outline', items: [
    "Checked: Microsoft's AZ-802 study guide (the page was last updated October 2, 2026) still lists the same seven areas and 18 objective groups the app uses, and every bullet in it already had a concept. The weights the app shows (21, 11, 12, 12, 16, 12, 16) sit inside Microsoft's published ranges, so they are unchanged.",
    "New: AZ-802 grew from 146 to 435 concepts, every one with its own diagram, plus 15 new Study guide sections. The depth now matches the other big tracks: FSMO roles one by one, trust types, SID filtering, sites and bridgeheads, group scopes and AGDLP, service accounts (sMSA, gMSA, and the Windows Server 2025 dMSA), Group Policy scoping and loopback, Windows Admin Center modes, Invoke-Command and JEA files, Azure Arc onboarding and Update Manager, Hyper-V disks and Replica failovers, DNS record types and hybrid DNS, DHCP failover modes, Azure Files and File Sync components, Storage Spaces layouts, BitLocker protectors, AdminSDHolder, Kerberoasting, and AD Recycle Bin and authoritative restore.",
    "Heads-up: this was written from general knowledge of Windows Server 2025 and Azure, not checked line by line against Microsoft Learn. A few newer features (dMSA, hotpatch for Windows Server 2025 through Azure Arc, OSConfig drift control, Entra Kerberos for Azure Files) are described at a high level, so confirm exact limits and prices in Microsoft's documentation. The 12 AZ-802 labs are unchanged.",
    "Heads-up: new concepts start unseen, so your AZ-802 mastery percentages will dip until you work through them. Studying by domain or objective will serve you better than \"practice all\" for now."
  ] },
  { version: 'v226', date: 'October 2026', title: '27 new hands-on labs for A+ Core 2, Network+, and DP-300', items: [
    "New: 15 labs for A+ Core 2 (command-line and tool practice such as nslookup, net use, DISM, gpresult, bootrec, and Linux disk checks; a compromised-mailbox case study; and ordering and decision labs for hardening, offboarding, change management, and remote access), 8 for Network+ (VLSM subnetting, IPv6 address types, DHCP, switch duplex and DHCP relay fixes in a simulated switch CLI, DNS record lookups, and a Wi-Fi capacity case study), and 4 for DP-300's new HA/DR domain (point-in-time restore with STOPAT, rolling patching, designing from RPO and RTO, and a regional outage).",
    "Heads-up: the new labs follow the same exact-command matching as the older ones, so type commands as shown in each lab's command list."
  ] },
  { version: 'v225', date: 'October 2026', title: 'Network+: 292 more concepts and 5 new objectives', items: [
    "New: Network+ (N10-009) grew from 149 to 441 concepts, every one with its own diagram, plus 27 new Study guide sections. The topics were checked against the exam's five domains and the published outline, and the biggest gaps are now filled: the full port and protocol list, IPv6 (address types, SLAAC, dual stack, tunneling, NAT64), cabling, connectors, and Ethernet standards, the upper OSI layers, cloud service and connectivity models, routing protocols, NAT types, wireless standards, rack, power, and environment, DHCP, DNS, and time services, VPN types and remote access, and many more troubleshooting scenarios.",
    "New: 5 objectives were added (IPv6 addressing, Network types and provider links, Physical installations, IP services, and Network access and management methods). The five domain weights already matched the exam (23, 20, 19, 14, 24 percent) and are unchanged.",
    "Fixed: a sweep of every track's questions found and fixed a few: an A+ question whose wording gave away its answer, DP-300 questions whose answer listed two options at once (for example \"GRANT, DENY, and REVOKE\" now asks about DENY), one more DP-300 scenario that named its own answer, and three diagrams whose captions sat too close to their labels.",
    "Heads-up: CompTIA's own objectives PDF could not be opened, so the gaps were found from a widely published outline and the official domain weights. The track is now much larger, so new concepts start unseen and your Network+ mastery percentages will dip until you have reviewed them. Use the domain and objective views to study in the exam's own order."
  ] },
  { version: 'v224', date: 'October 2026', title: 'DP-300: 92 more concepts and a High availability and disaster recovery domain', items: [
    "New: DP-300 grew from 72 to 164 concepts, every one with its own diagram, plus matching Study guide sections. It now has a sixth domain, Plan and Configure HA/DR, which Microsoft's outline lists as its own area worth 20 to 25 percent: recovery objectives, backup and restore, availability groups, failover cluster instances, log shipping, failover groups, and how to test, monitor, and troubleshoot them.",
    "New: the rest of the gaps against Microsoft's skills outline are filled too: migration (online and offline, Database Migration Service, Log Replay Service, the Managed Instance link), partitioning and compression, Azure Arc and SQL database in Fabric, network security (firewall rules, private endpoints, connection policy), ledger and change data capture, database watcher, index and statistics maintenance, intelligent query processing, SQL Server Agent, and deployment tooling.",
    "Changed: domain weights now follow the outline. The app keeps its older split of \"Monitor, configure, and optimize\" into two domains, so those two share that area's weight. New concepts start unseen, so your DP-300 mastery percentages will dip until you have reviewed them. Azure AD is now called Microsoft Entra ID throughout.",
    "Heads-up: the outline takes effect on October 27, 2026. A few features it names, such as database watcher, SQL database in Fabric, and Managed Instance database copy and move, are recent and are described at a high level, so check Microsoft's documentation for the details."
  ] },
  { version: 'v223', date: 'October 2026', title: 'A+ Core 2: 254 more concepts and 17 new objectives', items: [
    "New: A+ Core 2 grew from 140 to 394 concepts, every one with its own diagram. They fill topics the exam lists that were missing: more Windows tools (Task Scheduler, Device Manager, Performance Monitor, msconfig, Services), command-line tools (nslookup, tracert, net use, gpresult, DISM), Windows networking, Control Panel utilities, file systems, macOS and Linux features, wireless and authentication protocols, malware and attack types, SOHO and browser security, backup targets (RPO and RTO), safety, scripting, remote access, and AI.",
    "New: 17 objectives were added to Core 2 (for example Windows networking, Control Panel utilities, Wireless security protocols, Remote access technologies, AI limitations and policy), and the Study guide gained matching sections.",
    "Heads-up: CompTIA's own 220-1202 objectives PDF could not be opened while building this, so the gaps were found by comparing with widely published outlines and the official domain weights. Treat it as a good-faith best effort and check CompTIA's current PDF before your exam."
  ] },
  { version: 'v222', date: 'October 2026', title: 'Reset your look, a sidebar key, and a study-plan fix', items: [
    "New: Settings → Appearance → Look & feel has \"Reset\", which puts back the default theme, style, accent, font, text size, corners, and density in one click — with Undo. Accessibility options, the sidebar, and highlight colors are left as you set them.",
    "New: press \\ (backslash) to collapse or expand the sidebar to icons. It's listed in the keyboard shortcuts (?).",
    "Fixed: Today's session could suggest a domain you had marked complete whenever your study plan's calendar happened to be on it. Completed domains are now skipped there too.",
    "Fixed: the type label at the right of the highlighted command-palette row (Page, Setting, Lab…) was too faint to read comfortably."
  ] },
  { version: 'v220', date: 'October 2026', title: 'Palette shortcuts and a tidier printed Browse table', items: [
    "New: the command palette can print or save the current page as a PDF, and can hide or show any sidebar page (type a page name, e.g. \"crossword\").",
    "Fixed: printing Browse cards kept no column titles and wasted a column on checkboxes and buttons. It now prints a compact table with Term, Status, Accuracy, Interval, and Due, in 18 sheets instead of 29."
  ] },
  { version: 'v219', date: 'October 2026', title: 'Restore from a saved backup', items: [
    "New: Settings → Data → \"Restore a saved backup\" lists the backups kept in your backup folder and puts one back. Your current data is saved first, a click-twice step prevents accidents, and an Undo follows. It's also in the command palette.",
    "Changed: old automatic backups are now thinned instead of piling up forever — everything is kept for 30 days, then one a week for about six months, then one a month. Nothing newer than 30 days is ever removed.",
    "Note: restoring and thinning need the study server to be restarted once after this update (close its window and start it again). Until then the Restore window says so."
  ] },
  { version: 'v218', date: 'October 2026', title: 'Undo, settings search, and exam dates', items: [
    "New: removing a Study guide highlight now offers Undo. A single click on a highlighted passage used to delete it with no way back.",
    "New: the command palette (Ctrl/Cmd+K) finds individual settings — type \"accent\", \"exam date\", or \"font\" and jump straight to it, scrolled into view and briefly flashed. There's also a palette action to collapse or expand the sidebar.",
    "New: when no exam date is set, the Dashboard shows a \"Set exam date\" link that takes you to the field. The date drives the countdown, the projected ready-by date, and cram reminders."
  ] },
  { version: 'v215', date: 'October 2026', title: 'Your own highlight colors', items: [
    "New: choose your own highlighter colors (Settings → Appearance → Highlight colors). Each of the four slots opens the color picker and shows a live sample, so you can see exactly how highlighted text will look.",
    "Changed: recoloring a slot recolors the highlights you've already made with it, so color-coding by topic or confidence stays consistent. \"Reset\" puts the originals back.",
    "Changed: very dark or very strong colors are drawn as a lighter wash automatically, so highlighted words stay readable in every theme and in print.",
    "Changed: the four swatches in the Highlight pop-up are now numbered 1–4 instead of Y/G/B/P, since the colors are yours to define — and each is announced by color name (\"Highlight in dark teal\")."
  ] },
  { version: 'v214', date: 'October 2026', title: 'A color picker that matches the app', items: [
    "New: choosing a custom color now opens the app's own picker — a saturation and brightness field, a hue slider, hex and RGB boxes, and an eyedropper — instead of the browser's plain system popup. It follows your theme, style, and corner settings.",
    "New: the app icon color and your avatar color now have the same \"pick any color\" option as the accent, next to their quick swatches.",
    "Changed: the picker previews as you drag and only saves when you press Done, hit Enter, or click away; Cancel or Escape puts everything back.",
    "Changed: your avatar's initials switch between white and dark automatically so they stay readable on whatever color you pick.",
    "Fixed: choosing an avatar or app icon color no longer jumps the Settings page back to the top."
  ] },
  { version: 'v213', date: 'October 2026', title: 'Print-ready pages and a round of polish', items: [
    "New: everything you print or save as a PDF now gets a clean header (app, track, page, who it's for, and the date), a running title, and \"Page X of Y\" on every sheet. Save as PDF suggests a descriptive file name too.",
    "Changed: the Glossary prints definitions and scenarios by default — about 40 pages for a full track instead of roughly 250 — with a \"When printing\" choice for the full version with diagrams or a terse three-column cheat sheet.",
    "Changed: printed pages drop the buttons and search boxes, show checklists as real checkboxes, include the collapsed lists on the Final review sheet, and let long Study guide chapters flow across pages. The Final review sheet and Readiness report are tighter.",
    "Fixed: the page could scroll sideways on some screens (an invisible dropdown helper was far wider than it should be).",
    "Fixed: screen readers announced many switches (Settings, Exam day, Practice) as just \"checkbox\" — each is now named for what it controls.",
    "Changed: the faintest small text (captions, section labels, chart numbers, scenario lines) is a little stronger in every theme and style, so it clears the standard 4.5:1 contrast bar everywhere.",
    "Changed: \"nothing to do\" messages — nothing due, no cards match, not enough terms yet — use a calm blue notice instead of the red error style.",
    "Changed: a soft loading placeholder shows while your study data loads, instead of a blank page."
  ] },
  { version: 'v212', date: 'October 2026', title: 'A sidebar that fits you, theme styles, and organized Settings', items: [
    "New: collapse the sidebar to a slim icon-only rail (the button just above Settings) for more room — hover an icon for its name. Remembered on this device.",
    "New: choose which pages appear in the sidebar and in what order (Settings → Appearance → Sidebar). Hidden pages stay reachable from search and the G shortcuts.",
    "New: four theme styles — Classic, Slate, Ink (true black), and Sand (warm, paper-like) — each with its own dark and light version.",
    "New: pick any accent color, not just the six swatches (or type a hex code). Custom colors are adjusted automatically so text stays readable in both themes. There's also an option to give every track its own accent.",
    "Changed: Settings is now split into sections — Appearance, Study, Account, Data, About — with a search box that finds a setting by name or by what it does.",
    "New: the Dashboard greets you by name and time of day, and you can choose what its main button does (the daily recommendation, Quick 10, due flashcards, or continuing the study guide).",
    "Changed: removed the \"Tip of the day\" and \"All tracks at a glance\" switches for certification tracks — the simplified Dashboard no longer shows either, so they did nothing there.",
    "Fixed: printing now always uses the plain light palette with the standard accent, even if you've chosen a dark style or a custom accent color."
  ] },
  { version: 'v211', date: 'October 2026', title: 'Your look follows you, and saving is sturdier', items: [
    "Changed: theme, accent color, font, text size, density, corner style, and the accessibility toggles now belong to your account, not to whichever track is open — customize once and every track matches. Whatever you'd already set up carries over automatically.",
    "Changed: the right theme is painted from the very first frame, so light-theme users no longer see a dark flash while the app loads.",
    "New: a small Saved / Saving… indicator in the footer, and a clear banner if the study server stops responding — with automatic retrying — instead of an easy-to-miss pop-up.",
    "Fixed: saves are now sent one at a time, in order, and retried if the server is briefly unreachable. Previously, rapid changes could land out of order.",
    "Fixed: if the study server can't be reached when the app opens, the app now refuses to save anything and keeps retrying, instead of looking like a blank install and risking an overwrite of your real progress once the server returned."
  ] },
  { version: 'v210', date: 'October 2026', title: 'Mark domains and whole tracks as completed', items: [
    "New: a checkmark button on each domain's card (Exam Map) marks it completed — it greys out, and Practice's automatic modes, Adaptive difficulty, and Flashcards all stop picking it on their own. \"Practice this domain\" still works anytime; this only affects what gets recommended for you.",
    "New: a track (the whole certification) marks itself completed automatically once every one of its exams has a recorded passing result, or you can mark one manually from Settings — greyed out and tagged \"Completed\" in the track switcher and the All-tracks list, which now sorts finished tracks to the bottom.",
    "Marking a track completed also marks every domain in it completed, so the Dashboard's \"Focus next\" and Practice's weak-area picks immediately stop pointing at material from a cert you've already passed."
  ] },
  { version: 'v209', date: 'October 2026', title: 'A much quieter Dashboard', items: [
    "Changed: the Dashboard is now two sections instead of six — a status hero (readiness, accuracy, streak, one primary action) and a single \"Focus next\" panel (your weakest domain plus due/flagged counts). The full domain-by-domain breakdown, the longer recommendation list, the 14-day activity strip, and the all-tracks list are all still one click away (Exam Map, Progress, and the track switcher) — they just don't load by default anymore.",
    "Fits on one screen without scrolling on a normal window size."
  ] },
  { version: 'v208', date: 'October 2026', title: 'Browse cards, case studies, a terminal sandbox, and jump-to-page shortcuts', items: [
    "New: \"Browse cards\" (Study nav) — every concept in one sortable, filterable table: accuracy, review interval, and due date at a glance. Select any rows to drill them, reset their schedule, or suspend them out of Practice, Adaptive, Exams, and Flashcards until you unsuspend them.",
    "New: \"Case studies\" (Practice nav) — branching help-desk tickets where each choice leads to a consequence and the next question, testing a troubleshooting chain instead of one isolated multiple-choice answer. Launches with 3 new original tickets (a ransomware response, a dead network jack, and an unstable desktop) alongside the 2 that already existed as Labs.",
    "New: \"Terminal sandbox\" (Practice nav) — a free-form simulated shell with its own filesystem and no scripted task: ls, cd, cat, mkdir, rm, mv, cp, echo, ipconfig, ping, and more, for building raw command fluency beyond any single lab's script. Up/Down recalls command history.",
    "New: press G then a letter to jump straight to any of 16 common pages (G D for Dashboard, G P for Practice, G L for Labs, and more) — see the Shortcuts dialog (press ?) for the full list."
  ] },
  { version: 'v207', date: 'September 2026', title: 'Fill in the blank', items: [
    "New: \"Fill in the blank\" (Study nav, next to Crossword) — real Study guide paragraphs with the key terms blanked out, one domain at a time. Type the term back into its actual sentence instead of picking it from four multiple-choice options or recalling it in isolation on a flashcard.",
    "Every blank — right or wrong — reschedules that concept the same spaced-review way a flashcard rating does, so this feeds the same due-card queue rather than starting a separate one."
  ] },
  { version: 'v206', date: 'September 2026', title: 'Search, review reminders, a final review sheet, and effort-vs-weight', items: [
    "New: \"Search\" (topbar icon, next to the command palette) — one search box across the Study guide, Glossary, and Labs for whichever track is active, with a jump-straight-there button on every result.",
    "New: \"Final review sheet\" (linked from Mistake patterns) — a one-page printable pulled entirely from your own recent performance: terms you keep confusing, your most-missed concepts with their definitions, and remaining gaps by domain.",
    "New: \"Practice effort vs. exam weight\" (Exam Map) — shows how your answered questions are actually split across domains next to what the blueprint says each domain is worth, so a domain worth 20% of the exam can't quietly get 5% of your practice without it showing.",
    "New: session results now show a per-domain trend — how your accuracy on each domain you just practiced moved since the last time you touched it, not just this attempt's number in isolation.",
    "New: opt-in review reminders (Settings → Notifications) — a browser notification when spaced-review flashcards are due, checked once a day when you open or return to the app."
  ] },
  { version: 'v205', date: 'September 2026', title: 'Mistake patterns, keyboard accessibility, and study packets', items: [
    "New: \"Mistake patterns\" (linked from the Readiness report) — mines your last 25 sessions' actual wrong answers for real patterns: specific answer pairs you keep confusing, and which question phrasing styles (negative wording, \"BEST fit\", etc.) trip you up most, not just which domains.",
    "New: \"Study packet\" (linked from Study guide) — bundles one domain's guide chapter, key terms, and related labs into a single page, for printing or saving as a PDF to study somewhere this app isn't open.",
    "Fixed: the custom dropdown and date-picker menus (used throughout Practice, Settings, and Study plan) now support real keyboard navigation — arrow keys, Home/End, and type-ahead in dropdowns; arrow-key day-by-day browsing in the date picker, plus full spoken dates instead of a bare number for screen readers."
  ] },
  { version: 'v204', date: 'September 2026', title: 'Under-the-hood cleanup', items: [
    "Changed: moved every pure helper (icons, date formatting, shuffling) out of app.js into its own module — no visible change, just a safer foundation to build on. Also removed two accidental duplicate functions found along the way."
  ] },
  { version: 'v203', date: 'September 2026', title: 'Spaced repetition everywhere, and a real exam review screen', items: [
    "New: \"Spaced review\" (Practice page) — a multiple-choice session built from whatever's actually due, using the exact same review schedule Flashcards already tracks. A concept you nail in a quiz now reschedules the same way a flashcard rating does, instead of two separate, disconnected systems.",
    "New: a scratchpad during mock exams (icon-button next to fullscreen) — scratch notes that stay with you through the whole exam and are wiped when it ends, same as the real thing.",
    "Changed: the \"submit this exam?\" screen now shows a real, clickable question grid — jump straight to anything unanswered or flagged instead of a plain answered/blank count."
  ] },
  { version: 'v202', date: 'September 2026', title: 'Adaptive difficulty, achievements, exam day, and pass cards', items: [
    "New: \"Adaptive difficulty\" practice mode (Practice page) — the next question gets harder every time you're right and easier every time you're not, instead of a fixed random mix.",
    "New: Achievements (Plan & progress) — 12 real milestones computed from your own practice, labs, streaks, and exam history, with a toast the moment one's earned.",
    "New: \"Exam day\" — a checklist based on Pearson OnVUE's actual requirements, your exam-day readiness score, and one-tap drills into your weakest objectives, all in one place for the final stretch. Linked from the pre-exam banner and the Readiness report.",
    "New: record your real, official exam result (once you've actually taken it) to generate a downloadable, shareable pass card with your score and date — editable or clearable later if you need to fix it."
  ] },
  { version: 'v201', date: 'September 2026', title: 'Fixed two Core 2 labs rejecting correct commands', items: [
    "Fixed: \"Fix ownership and permissions on a shared Linux script\" only accepted one exact phrasing per step — it now also takes ls -l/-la without the filename, a sudo-prefixed chown (realistic, since chown normally needs it), and a plain chmod +x.",
    "Fixed: \"Securely erase leftover data before reissuing a laptop\" rejected the dir command with a trailing backslash or quotes around the path — both now work, along with a wildcard form."
  ] },
  { version: 'v200', date: 'September 2026', title: 'Command reference, exam-day readiness, and labs in the study plan', items: [
    "New: \"Command reference\" (linked from Labs) collects every command taught across the interactive labs into one searchable, printable cheat sheet, with a jump-back button to each source lab.",
    "New: the Readiness report now has an \"Exam-day readiness\" score blending content mastery, mock exam performance, and hands-on lab completion into one read — with a callout on whichever of the three is holding it back most.",
    "New: the Study plan's week-by-week schedule now shows a labs button on every domain row, jumping straight to that domain's hands-on labs, alongside the existing recap-quiz button."
  ] },
  { version: 'v199', date: 'September 2026', title: 'Exam core filter on Labs', items: [
    "New: the Labs page has an \"Exam core\" filter next to search, so you can narrow the list to just Core 1 or just Core 2 (or both) instead of scrolling through everything."
  ] },
  { version: 'v198', date: 'September 2026', title: 'More Core 2 labs and a terminal help command', items: [
    "New: 7 additional Core 2 labs — Linux/macOS terminal practice, workstation hardening, BYOD mobile security, secure data wipe, mobile app troubleshooting, and a cloud-access scenario — closing gaps in Security and Software Troubleshooting coverage.",
    "New: terminal-style labs now have a \"Command list\" button (or just type \"help\" at the prompt) that lists every command available for that task, matching the real A+ exam's performance-based questions — including a few you won't actually need, so it's a reference, not an answer key."
  ] },
  { version: 'v197', date: 'September 2026', title: 'More accessibility options', items: [
    "New: Settings → Accessibility — a dedicated home for Reading mode plus three new toggles: Reduce motion (independent of Reading mode), Colorblind-safe colors (swaps correct/incorrect from green/red to blue/amber), and High contrast (solid backgrounds, stronger text contrast).",
    "New: incorrect quiz answers now always show an X icon, not just a color change — correct already had a checkmark.",
    "New: a read-aloud button on quiz questions and flashcards — reads the question and every option, or the card's term/definition, out loud.",
    "The app now also respects your system's \"reduce motion\" accessibility setting automatically, regardless of either in-app toggle."
  ] },
  { version: 'v196', date: 'September 2026', title: 'Highlighter colors', items: [
    "New: choosing \"Highlight\" on any selected Study guide text now offers 4 colors (yellow, green, blue, pink) instead of one fixed color — pick whichever fits, e.g. color-coding by topic or by how confident you are in it. Shows up in both the chapter and the highlights digest."
  ] },
  { version: 'v195', date: 'September 2026', title: 'Reading mode, fullscreen exams, and a highlights digest', items: [
    "New: Reading mode (Settings → Look & feel) — wider line/letter/word spacing, a plainer font, and calmer motion for the Study guide, notes, and quiz text.",
    "New: Fullscreen exams (Settings → Learning preferences) — go fullscreen automatically when starting a mock exam, closer to real testing-center conditions; also toggleable manually from the quiz header.",
    "New: \"View highlights\" on the Study guide pulls every highlighted snippet across every chapter into one condensed, printable digest — good for a final pass before an exam."
  ] },
  { version: 'v194', date: 'September 2026', title: 'Cram mode, textbook highlighting, and a focus timer', items: [
    "New: \"Cram session\" (Practice, and a banner on the Dashboard in the last 3 days before your exam) builds one set from your flagged questions, weakest objectives, and recent misses — for the day before a real attempt, not a random practice set.",
    "New: select any text in a Study guide chapter to highlight it, like a real textbook — click a highlight to remove it. Saved with your progress, per track.",
    "New: a focus timer (Study guide page) — a work/break Pomodoro-style timer that keeps running in a small bar at the bottom of the screen even if you switch pages."
  ] },
  { version: 'v193', date: 'September 2026', title: 'PIN-lock accounts and an in-app update check', items: [
    "New: the account switcher can now require a PIN before switching into another account — set one from \"Switch account.\"",
    "Fixed: the \"New person's name\" field now matches the rest of the app's styling instead of a bare default text box.",
    "New: a \"Check for updates\" button (topbar and Settings → App) reloads the app from within itself instead of needing a full close-and-reopen."
  ] },
  { version: 'v192', date: 'September 2026', title: 'Multiple accounts', items: [
    "New: Settings → Your profile (and the sidebar name chip) now has \"Switch account\" — create a separate account for each person who uses this app, each with its own completely independent progress, mastery, settings, and avatar. Your existing progress is untouched and now lives under your own account."
  ] },
  { version: 'v191', date: 'September 2026', title: 'Missed-question review and a study activity heatmap', items: [
    "New: \"Review misses\" on a results screen and every past session in Progress opens a read-only pass through exactly what you got wrong — grouped by objective, weakest first — without generating a fresh quiz.",
    "New: Progress now shows a 26-week study activity heatmap, like a contribution graph, so gaps and streaks are visible at a glance instead of just the current streak count."
  ] },
  { version: 'v190', date: 'September 2026', title: 'Auto-backup, broader undo, and global search', items: [
    "New: automatic daily backup — Settings → Progress backup can save to the backup folder once a day on its own, the first time you open the app (on by default, toggle it off any time).",
    "New: \"Reset all progress\" and \"Import data\" both now offer an \"Undo\" on their confirmation toast — the two most destructive actions in the app finally have a safety net, not just a confirm dialog.",
    "New: removing your avatar photo can now be undone too.",
    "New: the command palette (Ctrl/Cmd+K) now searches inside term definitions, full study guide chapter text, and your own notes — not just titles — showing a snippet of the actual matching text."
  ] },
  { version: 'v189', date: 'September 2026', title: 'Fully custom dropdowns, font picker, and calendar', items: [
    "Changed: every dropdown, the font picker, and every date field (Exam date, Study plan dates) now use a fully custom-built menu/calendar styled to match the app exactly, instead of the browser's own native popup — which no amount of CSS could ever fully restyle."
  ] },
  { version: 'v188', date: 'September 2026', title: 'Native-feeling dropdowns and a custom app icon', items: [
    "Fixed: Start page, Read-aloud speed, and every other dropdown across the app now match its own dark/light styling instead of the browser's plain default box.",
    "Renamed: \"Check what's really installed\" is now \"Check Installed Fonts.\"",
    "New: Settings → App has an \"App icon\" picker — 6 icon shapes × 7 colors. Updates your browser tab icon immediately; an already-installed app needs a reinstall to pick up a new taskbar/dock icon, since that part is cached by the OS."
  ] },
  { version: 'v187', date: 'September 2026', title: 'Install, streak freeze, sound, focus mode, CSV export', items: [
    "New: install Cert Study as an app (Settings → App) in browsers that support it — opens in its own window instead of a browser tab.",
    "New: streak freeze — you start with one banked; missing a single day now uses it automatically to keep your streak alive, and you earn another every 7-day streak (up to 2 banked).",
    "New: optional sound effects — a short tone on correct/incorrect answers in Practice (Settings → Learning preferences, off by default).",
    "New: Focus mode hides the sidebar while a quiz or exam is in progress, for fewer distractions.",
    "New: \"Export stats (CSV)\" on the Progress page downloads your full session history for use in a spreadsheet."
  ] },
  { version: 'v186', date: 'September 2026', title: 'Five more ways to make it yours', items: [
    "New: a \"Look & feel\" settings card groups Color theme, Accent color, App font, Text size, and two new options — Corner style (Rounded/Sharp) and Density (Comfortable/Compact) — all pure visual preferences, nothing about scoring.",
    "New: \"Start page\" in Settings → Learning preferences picks what loads when you open the app, instead of always Dashboard.",
    "New: \"Milestone celebrations\" can be set to Confetti (default), a plain Simple toast, or Off.",
    "New: the Dashboard's \"Tip of the day\" and \"All tracks at a glance\" panels can each be turned off from Settings → Learning preferences."
  ] },
  { version: 'v185', date: 'September 2026', title: 'Text size control', items: [
    "New: Settings → Learning preferences has a \"Text size\" option (Small/Default/Large/Extra large) that scales the whole app, not just body text — buttons, cards, and layout all resize together."
  ] },
  { version: 'v184', date: 'September 2026', title: 'Font autocomplete that works everywhere', items: [
    "Fixed: the app font field now suggests a real list of common Windows/Mac fonts as you type, instead of relying only on the browser's \"installed fonts\" permission — which several browsers silently refuse to grant. \"Check what's really installed\" is still there as a bonus when your browser supports it."
  ] },
  { version: 'v183', date: 'September 2026', title: 'Type or browse for any font', items: [
    "Changed: the \"App font\" picker in Settings is no longer limited to 4 presets — type any font name, or (in browsers that support it) click \"Browse installed fonts\" to search everything actually installed on this computer."
  ] },
  { version: 'v182', date: 'September 2026', title: 'Choose your app font', items: [
    "New: Settings → Learning preferences has an \"App font\" picker — Default, Serif, Mono, or Rounded — all system fonts, so nothing is downloaded and the app stays fully offline."
  ] },
  { version: 'v181', date: 'September 2026', title: 'Accent color and a personal greeting', items: [
    "New: Settings → Learning preferences has an \"Accent color\" picker — six options that retint buttons, progress bars, and highlights across the whole app, not just the avatar.",
    "New: the Dashboard now greets you by name (\"Welcome back, [name]\") once you've set a display name in Settings → Your profile."
  ] },
  { version: 'v180', date: 'September 2026', title: 'Customize your avatar', items: [
    "New: Settings → Your profile now lets you pick an emoji + color for your avatar, or upload your own photo — auto-cropped and shrunk to a small square so it never bloats your saved progress file."
  ] },
  { version: 'v179', date: 'September 2026', title: 'Undo, milestones, auto theme, and your name', items: [
    "New: deleting a note, a custom flashcard, or a track from your study plan now shows an \"Undo\" button on the confirmation toast instead of being instantly permanent.",
    "New: a small celebration (plus confetti, unless you have reduced motion set) the first time you cross a real milestone — streaks, total questions answered, or percent of a track mastered.",
    "New: color theme now has a third option, \"Auto,\" which follows your system's light/dark setting and updates live if it changes.",
    "New: set your display name in Settings → Your profile. Shows in the sidebar (replacing the default \"Future technician\") and on the printed Readiness Report."
  ] },
  { version: 'v178', date: 'September 2026', title: 'Study guide remembers where you were reading', items: [
    "New: the Study guide now tracks which chapter you were reading (by scroll position, not just for read-aloud) and shows a \"Continue reading\" banner with a jump-there button next time you come back — the reading equivalent of what read-aloud's resume already does.",
    "Fixed: jumping to a chapter from the command palette's search results silently failed to scroll there at all — found while building the jump-there button above, since it turned out to share the same underlying bug."
  ] },
  { version: 'v177', date: 'September 2026', title: 'Export your study plan to a calendar', items: [
    "New: \"Export to calendar\" on the Study plan page downloads a .ics file with every domain block, review phase, and exam target date from your plan — import it into Google Calendar, Outlook, or Apple Calendar to see it alongside your real schedule instead of only inside the app."
  ] },
  { version: 'v176', date: 'September 2026', title: 'Custom flashcards and a compact print mode', items: [
    "New: add your own flashcard — term, domain, definition, and an optional scenario — from the Glossary, Flashcards page, or command palette. It reviews alongside the built-in deck with the same spaced repetition, shows up in the Glossary tagged \"Custom,\" and exports to Anki too. Not used in quizzes or exams, since there's no reliable way to auto-generate wrong-answer choices for it.",
    "New: a \"Compact for print\" toggle on the Glossary strips scenarios and diagrams for a denser, term-and-definition-only cheat sheet — filter to one domain first for a focused pre-exam skim."
  ] },
  { version: 'v175', date: 'September 2026', title: 'Exam comparison, daily session picker, tip of the day, mastery refresh', items: [
    "New: \"Compare mock exams\" on Progress lets you pick two past attempts and see a domain-by-domain diff — where the score actually moved, not just the overall number.",
    "The dashboard's main button is now \"Start today's session\" — it picks due flashcards, your Planner's block for today, or your weakest domain automatically instead of making you choose.",
    "A daily tip pulled from a random concept now shows on the dashboard for some light passive variety.",
    "New \"Needs a refresher\" panel on the Readiness report: concepts you mastered a while ago but haven't seen in 30+ days — quiz mastery doesn't decay on its own the way flashcard scheduling does, so this catches quiet knowledge fade."
  ] },
  { version: 'v174', date: 'September 2026', title: 'Resume read-aloud, quick speed control, spacebar', items: [
    "Pausing or stopping a Study guide chapter now remembers exactly where you left off — the chapter's button switches to \"Resume\" and picks back up from that paragraph instead of starting over.",
    "A playback-speed button is now right on the floating now-reading bar, so changing speed mid-chapter doesn't require a trip to Settings.",
    "Spacebar now pauses/resumes read-aloud, same as it already does for flashcards."
  ] },
  { version: 'v173', date: 'September 2026', title: 'Read-along highlighting moved onto the page', items: [
    "The word-highlighting from last version moved out of the floating overlay and onto the actual chapter text — the paragraph being read now highlights right on the page as it's spoken, so you can follow along, pause, and see exactly where to pick back up without a separate caption box. The floating bar is back to just chapter/section/progress and controls."
  ] },
  { version: 'v172', date: 'September 2026', title: 'Word-by-word highlighting in the read-aloud overlay', items: [
    "The now-reading overlay added last time now shows a caption of the current line, with the exact word being spoken highlighted live — karaoke-style — so you can follow along visually as well as by ear. Falls back to plain (unhighlighted) text if your voice doesn't report word timing."
  ] },
  { version: 'v171', date: 'September 2026', title: 'Now-reading overlay for read-aloud', items: [
    "A small floating bar now shows while a Study guide chapter is being read aloud — which chapter, which section, and a progress bar for the chapter, plus quick pause/stop controls. Stays visible no matter where you've scrolled, including across the automatic hand-off to the next chapter."
  ] },
  { version: 'v170', date: 'September 2026', title: 'Listen to Study guide chapters', items: [
    "New: a \"Listen\" button on every Study guide chapter reads it aloud using your browser's built-in text-to-speech — no download needed. Finishing a chapter automatically moves on to the next one, so a whole track can play hands-free.",
    "Read-aloud speed (0.75×–1.5×) is set once in Settings and applies everywhere you use it."
  ] },
  { version: 'v169', date: 'September 2026', title: 'Backup reminders and one-click folder backup', items: [
    "A quiet banner now shows up on the dashboard if it's been 2+ weeks since your last backup (or you've never made one) — this app's only copy of your progress lives on this machine, with nothing tracking changes to it.",
    "New: \"Save to backup folder\" writes a full backup straight to a backup/ folder next to the app — no download-folder hunting — named with the date and the exact app version that made it. Available from the reminder banner or Settings."
  ] },
  { version: 'v168', date: 'September 2026', title: 'Version number opens the changelog', items: [
    "Clicking the version pill in the footer now opens the What's new panel with the full release history, instead of being purely decorative."
  ] },
  { version: 'v167', date: 'September 2026', title: 'Confidence tagging on quiz answers', items: [
    "After a correct answer in Practice, a quick optional prompt asks whether you actually knew it or guessed — mastery already counts a right answer as a right answer, but this catches the specific case of a domain looking solid on accuracy alone while some of those wins were lucky. Concepts tagged as guessed-right show up in a new \"Correct, but not confident\" section on the readiness report."
  ] },
  { version: 'v166', date: 'September 2026', title: 'Export flashcards to Anki', items: [
    "New: export any set of flashcards (filtered by core/domain, same as the review-deck builder) as a plain-text file Anki's own Import File dialog reads directly — term on the front, definition plus the applied scenario on the back, tagged by track and domain. No new dependencies added; this uses Anki's documented plain-text import format rather than building a real .apkg. Reachable from the Flashcards page or the command palette."
  ] },
  { version: 'v165', date: 'September 2026', title: 'A printable readiness report', items: [
    "New: a one-page readiness report — overall score, first-try accuracy, streak, minutes practiced, exam countdown with a pace projection, every domain's mastery against its exam weight, and the objectives most worth focusing on next. Reachable from Progress, or via the command palette (\"Readiness report\"), and printable/savable with one click."
  ] },
  { version: 'v164', date: 'September 2026', title: 'Sidebar sections stay open', items: [
    "The Study / Practice / Plan & progress sidebar sections used to act like an accordion — opening one closed whichever you had open before, and navigating to a page (even just starting Quick 10) would silently collapse a section you'd opened yourself. Each section is now independent: opening one leaves the others alone, and moving around the app only ever adds sections, never closes one you opened."
  ] },
  { version: 'v163', date: 'September 2026', title: 'Collapsible, decluttered Exam Map', items: [
    "Each domain on the Exam Map now collapses to just its name, weight, and mastery bar — click to expand the objective breakdown, so the page reads as a scannable list first instead of showing every objective, topic tag, and drill button for all domains at once.",
    "Each objective row is now a single compact line (title, %, progress bar, topics) with a small icon button to drill it, replacing the old stacked title/topic-chips/full-width-button layout that made the expanded view feel busy.",
    "A domain with concepts still due for practice shows a quick practice button right on its collapsed header, so going in to answer questions doesn't require expanding the card first."
  ] },
  { version: 'v162', date: 'September 2026', title: 'Clearer book icon', items: [
    'Checked every other sidebar icon for the same small-size legibility problem the logo and crossword icon had. Most held up fine, but the book icon (Glossary, reference-term cards, "Open the glossary" buttons) read as a chat bubble at its actual render size — replaced with an open-book (two-page) shape that reads clearly at every size.'
  ] },
  { version: 'v161', date: 'September 2026', title: 'Clearer crossword icon', items: [
    'The crossword icon (sidebar nav and the crossword hub cards) was a busy 3x3 grid that turned into an illegible dark smudge at the small size it actually renders at — simplified to a bold 2x2 checkerboard pattern that reads clearly at every size it\'s used.'
  ] },
  { version: 'v160', date: 'September 2026', title: 'A more fitting logo', items: [
    'Replaced the sidebar\'s open-book brand mark with a graduation cap — the book icon stays in place everywhere else (Glossary, reference-term cards) since it fits those better.'
  ] },
  { version: 'v159', date: 'September 2026', title: 'Crossword answer-color contrast fix', items: [
    "Fixed the crossword's correct/incorrect cell coloring, which was still hard to read in light theme at the puzzle's smaller cell sizes — missed by an earlier pass because of a gap in how that check measured certain CSS colors."
  ] },
  { version: 'v158', date: 'September 2026', title: 'More specific release notes', items: [
    "The previous release's notes below now call out each individual fix instead of grouping them into one or two lines."
  ] },
  { version: 'v157', date: 'September 2026', title: "Full history in What's new", items: [
    "This panel now covers the app's whole history, all the way back to the first tracks, instead of starting a few weeks in."
  ] },
  { version: 'v156', date: 'September 2026', title: 'Light theme accessibility fixes', items: [
    'Every primary button and quiz answer badge (the A/B/C/D letters, correct/incorrect) was using text colors tuned only for dark theme, making them hard to read in light mode. Fixed app-wide.',
    "The terminal lab's command prompt and the Exam Map's per-domain colored percentages had the same problem — fixed both, along with the small caption/label color used throughout the app.",
    "Fixed the crossword's clue-number label staying a fixed dim color instead of matching whether that cell is right, wrong, or untouched.",
    'Fixed a Settings page layout bug where the exam-date field crowded out its own label.'
  ] },
  { version: 'v147', date: 'September 2026', title: 'AZ-802 domain weights corrected', items: [
    "The 7 AZ-802 domain weights now sum to 100% (they previously summed to 106%), re-derived from Microsoft's official published skills-measured ranges. Readiness and mock-exam question counts for that track are more accurate as a result."
  ] },
  { version: 'v146', date: 'September 2026', title: 'Collapsible navigation', items: [
    'The sidebar sections (Study, Practice, Plan & progress) now collapse and expand — click a heading to open it. The section for the page you\'re on stays open, and your choices are remembered.'
  ] },
  { version: 'v145', date: 'September 2026', title: 'Grouped navigation', items: [
    'The sidebar is now organised into Study, Practice, and Plan & progress sections so related tools sit together.'
  ] },
  { version: 'v144', date: 'September 2026', title: 'Study tools & polish', items: [
    'Reopenable answer sheets — every mock exam and practice set keeps a full per-question review you can revisit from Progress, filter to just what you missed, and flag or annotate.',
    'Per-objective mastery on the Exam Map, each objective group with its own drill button.',
    'A readiness trend chart on Progress with a projected exam-ready date, plus an optional exam date.',
    'A command palette — press Ctrl / ⌘ + K (or /) to jump to any page, track, term, lab, or action.',
    'Personal notes — attach your own explanation to any concept, collected on the new My notes page.',
    'A first-run walkthrough with an optional diagnostic, a keyboard-shortcuts sheet (press ?), and this changelog.'
  ] },
  { version: 'v143', date: 'September 2026', title: 'Offline reliability, print & a content fix', items: [
    'The offline cache now actually works — reloading the app with no network connection loads it correctly instead of silently failing to update.',
    "Printing now forces a readable light layout even when you're using dark theme.",
    'Found and corrected a domain-weight bug on the AZ-802 track that was inflating its readiness score and overshooting mock-exam question counts.'
  ] },
  { version: 'v140', date: 'September 2026', title: 'Accessibility pass', items: [
    "Fixed a keyboard trap in the crossword puzzle, added proper focus handling to every dialog (including returning focus to where you were when you close one), and gave the flashcard flip control a visible focus ring plus full keyboard support.",
    'Added screen-reader announcements for quiz results, lab feedback, and other actions that previously only showed as a color change.'
  ] },
  { version: 'v137', date: 'September 2026', title: 'Full content verification', items: [
    'Verified flashcards, mock exams, every lab type, the Exam Map, and the Glossary across all tracks — fixed a handful of layout bugs found along the way, including an overflowing flashcard and a hidden domain-accuracy value on the Dashboard.'
  ] },
  { version: 'Sep 9, 2026', date: 'September 2026', title: 'Diagram accuracy pass', items: [
    'Reviewed every diagram in the app (1,000+, across every track) for real-world accuracy, layout, and text or shape collisions — redesigned the ones that had crowded or overlapping elements and built new checks to catch that class of issue going forward.'
  ] },
  { version: 'Sep 4, 2026', date: 'September 2026', title: 'Study guide, smarter dashboard, and a major light-theme fix', items: [
    'Added a Study Guide — plain-language chapters on the why behind each domain, not just quiz-style facts — across every certification track, linked directly into practice, flashcards, and labs from each chapter.',
    'Added print/export support, an all-tracks-at-a-glance section on the Dashboard, and a Study Plan that can add or remove any track with its own target date.',
    "Fixed a significant light-theme readability issue affecting most diagrams in the app — colored text on its own tinted background, the most common diagram style used, was hard to read in light mode."
  ] },
  { version: 'Sep 3, 2026', date: 'September 2026', title: 'Windows Server & Azure SQL tracks added', items: [
    'Added two new certification tracks — Windows Server Administrator (AZ-802) and Azure Database Administrator (DP-300) — each with full diagram and hands-on lab coverage.',
    "AZ-802 was built directly from Microsoft's official skills-measured outline after AZ-800/AZ-801 were retired."
  ] },
  { version: 'Sep 2, 2026', date: 'September 2026', title: 'Illustrated concepts', items: [
    'Every concept across CompTIA A+, Network+, Security+, and both 3CX tracks got its own diagram, and a version indicator was added to the footer.'
  ] },
  { version: 'Aug 2026', date: 'August 2026', title: 'Core study system', items: [
    'Quizzes, flashcards, hands-on labs, and a study planner across CompTIA A+, Network+, Security+, and 3CX.',
    'A searchable glossary, a type-your-own-answer flashcard mode, a weak-area targeting hub, and branching scenario-style labs.'
  ] }
];
