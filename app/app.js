// ---------- Data ----------
import {
  letters, iconPaths, icon, hydrateIcons, escapeHtml, pct, localDateKey, todayKey, addDays,
  daysBetween, formatDate, formatDateKey, formatPlanDate, formatDuration, hashNumber,
  seededShuffle, recallMatchHint
} from './utils.js?v=2';

(function () {
  'use strict';

  // Two study domains sit above CERT_GROUPS: "certs" (pursuing a certification) and
  // "programs" (learning a piece of software end to end). The top-left brand button switches
  // domain first; the existing bottom track-switcher then picks a group/track same as always.
  const DOMAINS = [
    { id: 'certs', short: 'CT', label: 'Certifications', blurb: 'CompTIA and 3CX certification tracks' },
    { id: 'programs', short: 'PR', label: 'Programs', blurb: 'Learn creative and technical software, starting with Blender' }
  ];

  const CERT_GROUPS = [
    { id: 'comptia', short: 'CT', label: 'CompTIA', blurb: 'A+, Network+, and Security+', domain: 'certs' },
    { id: '3cx', short: '3CX', label: '3CX', blurb: 'Basic and Advanced certification', domain: 'certs' },
    { id: 'microsoft', short: 'MS', label: 'Microsoft', blurb: 'Windows Server hybrid administration and Azure SQL', domain: 'certs' },
    { id: 'software', short: 'SW', label: 'Software', blurb: 'Blender and more', domain: 'programs' }
  ];

  const CERT_REGISTRY = [
    { id: 'aplus', short: 'A+', label: 'CompTIA A+', vendor: 'CompTIA', group: 'comptia', dataGlobal: 'APLUS_DATA', labsGlobal: 'APLUS_LABS', guideGlobal: 'APLUS_GUIDE', progressKey: 'comptia-a-plus' },
    { id: 'netplus', short: 'N+', label: 'CompTIA Network+', vendor: 'CompTIA', group: 'comptia', dataGlobal: 'NETPLUS_DATA', labsGlobal: 'NETPLUS_LABS', guideGlobal: 'NETPLUS_GUIDE', progressKey: 'comptia-network-plus' },
    { id: 'secplus', short: 'S+', label: 'CompTIA Security+', vendor: 'CompTIA', group: 'comptia', dataGlobal: 'SECPLUS_DATA', labsGlobal: 'SECPLUS_LABS', guideGlobal: 'SECPLUS_GUIDE', progressKey: 'comptia-security-plus' },
    { id: '3cx-basic', short: '3B', label: '3CX Basic Certification', vendor: '3CX', group: '3cx', dataGlobal: 'THREECX_BASIC_DATA', labsGlobal: 'THREECX_BASIC_LABS', guideGlobal: 'THREECX_BASIC_GUIDE', progressKey: '3cx-basic' },
    { id: '3cx-advanced', short: '3A', label: '3CX Advanced Certification', vendor: '3CX', group: '3cx', dataGlobal: 'THREECX_ADVANCED_DATA', labsGlobal: 'THREECX_ADVANCED_LABS', guideGlobal: 'THREECX_ADVANCED_GUIDE', progressKey: '3cx-advanced' },
    { id: 'winserver-hybrid', short: 'WS', label: 'Windows Server Administrator (AZ-802)', vendor: 'Microsoft', group: 'microsoft', dataGlobal: 'WINSERVER_DATA', labsGlobal: 'WINSERVER_LABS', guideGlobal: 'WINSERVER_GUIDE', progressKey: 'winserver-hybrid' },
    { id: 'dp300', short: 'DP', label: 'Azure Database Administrator (DP-300)', vendor: 'Microsoft', group: 'microsoft', dataGlobal: 'DP300_DATA', labsGlobal: 'DP300_LABS', guideGlobal: 'DP300_GUIDE', progressKey: 'dp300' },
    { id: 'blender-fundamentals', short: 'BL', label: 'Blender Fundamentals', vendor: 'Blender Foundation', group: 'software', dataGlobal: 'BLENDER_FUNDAMENTALS_DATA', labsGlobal: 'BLENDER_FUNDAMENTALS_LABS', progressKey: 'blender-fundamentals' }
  ];
  const ACTIVE_CERT_KEY = 'cert-study-active-cert';
  const ACTIVE_PROFILE_KEY = 'cert-study-active-profile';
  const DEFAULT_PROFILE_ID = 'default';
  // Bump alongside service-worker.js's CACHE constant whenever a meaningful change ships —
  // this is the one place a person can glance at (footer, or Settings) to confirm which build
  // is actually loaded, distinct from the per-asset ?v= cache-busting numbers.
  const APP_VERSION = 'v209';
  // Shown in the "What's new" panel (Settings, command palette, or automatically once per
  // release). Newest first; keep entries short and user-facing. Entries before v133 predate
  // this app having per-build version numbers at all, so their "version" is the date instead —
  // still real history, just not tagged with a build number the way later entries are.
  const CHANGELOG = [
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
  const DIAGNOSTIC_LEN = 15;
  let certDialogGroup = null;
  let certDialogEntryDomain = null; // domain ('certs'|'programs') the bottom "Current track" switcher is scoped to
  let examComparisonState = null; // { aId, bId } — the two session ids picked in the compare-exams dialog

  function currentDomain() {
    const entry = CERT_REGISTRY.find(item => item.id === activeCertId);
    const group = entry && CERT_GROUPS.find(g => g.id === entry.group);
    return group ? group.domain : 'certs';
  }

  let CERT, CONCEPTS, LABS, GUIDE, PROGRESS_KEY, activeCertId;
  // Accounts: each has its own completely separate progress/settings, resolved server-side to
  // its own file (see server.py's resolve_profile_id/progress_path_for). `profiles` is refreshed
  // from /api/profiles at boot and after any create/delete; `activeProfileId` drives every
  // /api/progress, /api/avatar, and /api/app-icon.svg call the rest of this file makes.
  let activeProfileId = DEFAULT_PROFILE_ID;
  let profiles = [{ id: DEFAULT_PROFILE_ID, name: '', createdAt: null }];
  // Whether switching INTO another account currently requires a PIN — a single switch-wide lock,
  // not one PIN per account (see server.py's registry {pinHash, profiles} shape). pendingSwitchId
  // holds the target while the PIN prompt is showing; pinManageMode drives the set/change/remove
  // mini-form shown from within the same "Switch account" dialog.
  let switchPinRequired = false;
  let pendingSwitchId = null;
  let pinManageMode = null;
  const main = document.getElementById('main-content');
  const titleEl = document.getElementById('page-title');
  const kickerEl = document.getElementById('page-kicker');
  const dialogLayer = document.getElementById('dialog-layer');
  const routeMeta = {
    dashboard: ['Dashboard', 'Study command center'], planner: ['Study plan', 'Turn deadlines into a weekly plan'],
    practice: ['Practice', 'Build durable recall'],
    exams: ['Mock exams', 'Train under exam conditions'], flashcards: ['Flashcards', 'Spaced repetition'],
    crossword: ['Crossword', 'Learn terms by solving, not memorizing'],
    cloze: ['Fill in the blank', 'Type the term back into real guide prose'],
    glossary: ['Glossary', 'Fast reference outside the quiz flow'],
    guide: ['Study guide', 'Learn the why before you drill the what'],
    labs: ['Interactive labs', 'Practice the workflow'], casestudies: ['Case studies', 'Work a ticket through a chain of consequences'], sandbox: ['Terminal sandbox', 'Free-form command practice, no scripted task'], commands: ['Command reference', 'Every command taught across the labs'], objectives: ['Exam map', 'Know the blueprint'],
    browse: ['Browse cards', 'Every concept in one sortable, filterable table'],
    history: ['Progress', 'Turn results into a plan'], notes: ['My notes', 'Your own annotations, in one place'],
    settings: ['Settings & data', 'Make it yours'], report: ['Readiness report', 'A snapshot to print or save'],
    'guide-digest': ['Highlights digest', "Everything you've marked worth remembering"],
    achievements: ['Achievements', 'Milestones earned along the way'],
    examday: ['Exam day', 'Everything for the final stretch, in one place'],
    mistakes: ['Mistake patterns', "What keeps tripping you up, not just where"],
    packet: ['Study packet', 'One domain, ready to print or save offline'],
    finalreview: ['Final review sheet', 'Your worst mix-ups and remaining gaps, one page'],
    search: ['Search', 'Find anything across the guide, glossary, and labs']
  };

  // iconPaths/icon/hydrateIcons now live in utils.js (imported above).

  // ---------- Custom select/date-picker chrome ----------
  // A native <select>'s open options list and a native <input type="date">'s calendar popup
  // cannot be restyled past color-scheme in any current browser — no rounded corners, no brand
  // colors, no custom hover states reachable via CSS. These progressively enhance every one of
  // them with a real in-page popover built from the app's own tokens, while leaving the
  // original element in the DOM (hidden, not removed) as the actual value-holder — every
  // existing `.value` read and `change` listener elsewhere in this file keeps working
  // completely unchanged, since the enhancement just drives the same element and re-dispatches
  // a real `change` event on it.
  let openCustomPopover = null;
  function closeAnyCustomPopover() { if (openCustomPopover) { openCustomPopover(); openCustomPopover = null; } }
  document.addEventListener('click', event => { if (openCustomPopover && !event.target.closest('.xselect, .xdate')) closeAnyCustomPopover(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAnyCustomPopover(); });

  function hideNativeControl(el) {
    el.classList.add('visually-hidden');
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
  }

  function enhanceSelect(select) {
    if (select.dataset.enhanced || select.classList.contains('gui-select')) return; // lab GUI controls are part of the graded simulation UI, left native on purpose
    select.dataset.enhanced = '1';
    hideNativeControl(select);
    const wrap = document.createElement('div');
    wrap.className = 'xselect';
    select.insertAdjacentElement('afterend', wrap);
    const trigger = document.createElement('button');
    trigger.type = 'button';
    // Practice/Flashcards/comparison filters live inside a .field wrapper (42px, --surface-2)
    // alongside real text/date inputs in the same form — match that sizing there instead of
    // the smaller .tab-button treatment used for standalone selects like Settings' own.
    trigger.className = select.closest('.field') ? 'xselect-trigger xselect-trigger-field' : 'xselect-trigger tab-button';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `<span class="xselect-label"></span>${icon('chevron')}`;
    trigger.querySelector('svg').classList.add('xselect-chevron');
    const menu = document.createElement('div');
    menu.className = 'xselect-menu hidden';
    menu.setAttribute('role', 'listbox');
    wrap.append(trigger, menu);

    const syncLabel = () => { trigger.querySelector('.xselect-label').textContent = select.options[select.selectedIndex]?.textContent || ''; };
    const close = () => { menu.classList.add('hidden'); trigger.setAttribute('aria-expanded', 'false'); };
    const optionEls = () => [...menu.querySelectorAll('.xselect-option')];
    // Real focus, not aria-activedescendant — every option is already a genuine focusable
    // button, so moving actual DOM focus between them works with any screen reader for free,
    // instead of needing the container to own focus and announce a virtual position.
    const focusOptionAt = index => { const opts = optionEls(); if (!opts.length) return; opts[((index % opts.length) + opts.length) % opts.length].focus(); };
    const open = () => {
      closeAnyCustomPopover();
      menu.innerHTML = '';
      [...select.options].forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'xselect-option' + (opt.selected ? ' active' : ''); btn.setAttribute('role', 'option'); btn.textContent = opt.textContent;
        btn.addEventListener('click', () => { select.value = opt.value; select.dispatchEvent(new Event('change', { bubbles: true })); syncLabel(); close(); trigger.focus(); });
        menu.appendChild(btn);
      });
      menu.classList.remove('hidden'); trigger.setAttribute('aria-expanded', 'true');
      openCustomPopover = close;
      // Land keyboard focus on the current selection (or the first option), the same way a
      // native <select> highlights the current value the instant it opens.
      focusOptionAt(Math.max(0, select.selectedIndex));
    };
    // Arrow keys / Home / End move real focus between options; typing a letter jumps to the
    // next option starting with it — the same interaction a native <select> already gives you
    // for free, which a custom-built replacement otherwise silently drops.
    menu.addEventListener('keydown', event => {
      const opts = optionEls(); const current = opts.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') { event.preventDefault(); focusOptionAt(current + 1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); focusOptionAt(current - 1); }
      else if (event.key === 'Home') { event.preventDefault(); focusOptionAt(0); }
      else if (event.key === 'End') { event.preventDefault(); focusOptionAt(opts.length - 1); }
      else if (event.key === 'Escape') { event.preventDefault(); close(); trigger.focus(); }
      else if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
        const letter = event.key.toLowerCase(); const from = current + 1;
        const match = opts.slice(from).concat(opts.slice(0, from)).find(o => o.textContent.trim().toLowerCase().startsWith(letter));
        if (match) { event.preventDefault(); match.focus(); }
      }
    });
    trigger.addEventListener('click', () => (menu.classList.contains('hidden') ? open() : close()));
    select.addEventListener('change', syncLabel);
    syncLabel();
  }

  function enhanceDateInput(input) {
    if (input.dataset.enhanced) return;
    input.dataset.enhanced = '1';
    hideNativeControl(input);
    const wrap = document.createElement('div');
    wrap.className = 'xdate';
    input.insertAdjacentElement('afterend', wrap);
    const trigger = document.createElement('button');
    trigger.type = 'button';
    // Study Plan's date fields live inside a .field wrapper (42px/9px-radius, full width) —
    // visually distinct from Settings' own narrower .setting-date-input (36px/8px/152px) — the
    // trigger needs to match whichever context it's actually replacing.
    trigger.className = (input.closest('.field') ? 'xdate-trigger' : 'setting-date-input xdate-trigger');
    trigger.innerHTML = `<span class="xdate-trigger-label"></span>${icon('calendar')}`;
    const popover = document.createElement('div');
    popover.className = 'xdate-popover hidden';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Choose a date');
    wrap.append(trigger, popover);

    let viewDate = input.value ? new Date(`${input.value}T00:00:00`) : new Date();
    // The day currently reachable by Tab (roving tabindex, like a native date grid) — separate
    // from the selected value, since arrow-key browsing moves this around before anything is
    // actually chosen.
    let focusDateStr = input.value || todayKey();
    const syncLabel = () => { trigger.querySelector('.xdate-trigger-label').textContent = input.value ? formatDateKey(input.value) : 'mm/dd/yyyy'; };
    const setValue = value => { input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })); syncLabel(); };
    const close = () => popover.classList.add('hidden');
    // A screen reader hearing a bare day button ("15, button") has no idea what month or year
    // it's in — the full date needs to be the accessible name, even though the visible label
    // stays just the day number for a scannable grid.
    const dayLabel = dateStr => new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${dateStr}T00:00:00`));
    const render = focusAfter => {
      const year = viewDate.getFullYear(); const month = viewDate.getMonth();
      const startDow = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrev = new Date(year, month, 0).getDate();
      const todayStr = todayKey();
      const cells = [];
      for (let i = startDow - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, muted: true, dateStr: null });
      for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
      while (cells.length % 7 !== 0) cells.push({ day: '', muted: true, dateStr: null });
      popover.innerHTML = `<div class="xdate-head"><button type="button" class="xdate-nav" data-nav="-1" aria-label="Previous month">${icon('chevron')}</button><strong aria-live="polite">${escapeHtml(viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))}</strong><button type="button" class="xdate-nav" data-nav="1" aria-label="Next month">${icon('chevron')}</button></div><div class="xdate-grid" role="grid">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<div class="xdate-dow">${d}</div>`).join('')}${cells.map(c => `<button type="button" class="xdate-day${c.muted ? ' muted' : ''}${c.dateStr && c.dateStr === input.value ? ' selected' : ''}${c.dateStr === todayStr ? ' today' : ''}" ${c.dateStr ? `data-date="${c.dateStr}" aria-label="${escapeHtml(dayLabel(c.dateStr))}" tabindex="${c.dateStr === focusDateStr ? '0' : '-1'}"` : 'disabled aria-hidden="true"'}>${c.day}</button>`).join('')}</div><div class="xdate-foot"><button type="button" data-act="clear">Clear</button><button type="button" data-act="today">Today</button></div>`;
      popover.querySelectorAll('.xdate-nav').forEach(btn => btn.addEventListener('click', () => { viewDate = new Date(year, month + Number(btn.dataset.nav), 1); focusDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-01`; render(true); }));
      popover.querySelectorAll('.xdate-day[data-date]').forEach(btn => btn.addEventListener('click', () => { setValue(btn.dataset.date); close(); trigger.focus(); }));
      popover.querySelector('[data-act="clear"]').addEventListener('click', () => { setValue(''); close(); trigger.focus(); });
      popover.querySelector('[data-act="today"]').addEventListener('click', () => { setValue(todayStr); close(); trigger.focus(); });
      if (focusAfter) popover.querySelector(`.xdate-day[data-date="${focusDateStr}"]`)?.focus();
    };
    // Left/right move a day, up/down move a week, crossing into the next or previous month
    // re-renders the grid around the new date — the same browsing model a native date input's
    // own picker uses, instead of forcing Tab-by-Tab travel through every day in between.
    const moveFocus = deltaDays => {
      focusDateStr = addDays(focusDateStr, deltaDays);
      const next = new Date(`${focusDateStr}T00:00:00`);
      if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) viewDate = new Date(next.getFullYear(), next.getMonth(), 1);
      render(true);
    };
    popover.addEventListener('keydown', event => {
      if (!event.target.classList.contains('xdate-day')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(-1); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(7); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(-7); }
      else if (event.key === 'Escape') { event.preventDefault(); close(); trigger.focus(); }
    });
    trigger.addEventListener('click', () => {
      if (!popover.classList.contains('hidden')) { close(); return; }
      closeAnyCustomPopover();
      viewDate = input.value ? new Date(`${input.value}T00:00:00`) : new Date();
      focusDateStr = input.value || todayKey();
      render();
      popover.classList.remove('hidden');
      openCustomPopover = close;
      popover.querySelector(`.xdate-day[data-date="${focusDateStr}"]`)?.focus();
    });
    syncLabel();
  }

  // The one free-text case (type any font, not just pick from a fixed list) — its own function
  // rather than a variant of enhanceSelect, since the trigger IS the real input the user types
  // into, not a button standing in for a hidden one. Replaces the earlier <datalist> approach
  // (v183/v184) entirely, since a datalist's suggestion popup has the exact same "can't be
  // restyled" limitation as a select's options list.
  // Starts null (not COMMON_FONTS directly) since that constant is declared later in this file —
  // resolved lazily at first real use in renderMenu() below, well after full module init.
  let fontSuggestions = null;
  function setFontSuggestions(list) { fontSuggestions = list; }
  function enhanceFontAutocomplete() {
    const input = document.getElementById('setting-font-name');
    if (!input || input.dataset.enhanced) return;
    input.dataset.enhanced = '1';
    input.removeAttribute('list');
    const wrap = document.createElement('div');
    wrap.className = 'xselect';
    // The input carries its own flex sizing (flex:1;min-width:200px) as an inline style so it
    // grows correctly inside the settings row's button-row; moving it one level deeper (inside
    // this new wrapper) means that flex sizing has to move with it onto the wrapper instead,
    // or the row layout collapses back to content-width.
    wrap.style.cssText = input.style.cssText;
    input.style.cssText = 'width:100%';
    input.parentElement.insertBefore(wrap, input);
    const menu = document.createElement('div');
    menu.className = 'xselect-menu hidden';
    menu.setAttribute('role', 'listbox');
    wrap.append(input, menu);
    const close = () => menu.classList.add('hidden');
    const renderMenu = () => {
      const source = fontSuggestions || COMMON_FONTS;
      const query = input.value.trim().toLowerCase();
      const matches = (query ? source.filter(name => name.toLowerCase().includes(query)) : source).slice(0, 40);
      menu.innerHTML = matches.length ? matches.map(name => `<button type="button" class="xselect-option" style="font-family:${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('') : `<div class="xselect-empty">No matches — your own typed name will still be used.</div>`;
      menu.querySelectorAll('.xselect-option').forEach(btn => btn.addEventListener('click', () => { input.value = btn.textContent; input.dispatchEvent(new Event('change', { bubbles: true })); input.dispatchEvent(new Event('input', { bubbles: true })); close(); }));
    };
    input.addEventListener('focus', () => { closeAnyCustomPopover(); renderMenu(); menu.classList.remove('hidden'); openCustomPopover = close; });
    input.addEventListener('input', renderMenu);
  }

  // Runs once at boot (see the bottom of this file) and again on demand — a MutationObserver
  // catches every select/date-input that appears from here on regardless of which render
  // function created it, so no individual page-render function needs its own explicit call.
  function enhanceControlsIn(root) {
    root.querySelectorAll('select:not([data-enhanced])').forEach(enhanceSelect);
    root.querySelectorAll('input[type="date"]:not([data-enhanced])').forEach(enhanceDateInput);
    enhanceFontAutocomplete();
  }
  new MutationObserver(() => { enhanceControlsIn(main); enhanceControlsIn(dialogLayer); }).observe(document.body, { childList: true, subtree: true });

  // ---------- Persistence (server-backed via /api/progress, not localStorage) ----------
  const defaultState = () => ({
    version: 1,
    // themeMode is the actual preference ('dark'|'light'|'auto'); theme is always the resolved
    // dark/light value the rest of the app reads to paint itself — kept as two fields so every
    // existing `state.settings.theme` consumer keeps working untouched.
    settings: { secondChance: true, theme: 'dark', themeMode: 'dark', questionCount: 10, speechRate: 1, accentColor: 'teal', fontFamily: '', fontSize: 1, cornerStyle: 'rounded', density: 'comfortable', startPage: 'dashboard', celebrationStyle: 'confetti', showTipOfDay: true, showAllTracks: true, soundEffects: false, focusMode: false, focusWorkMinutes: 25, focusBreakMinutes: 5, fullscreenExams: false, readingMode: false, colorblindMode: false, reducedMotion: false, highContrast: false },
    stats: { answered: 0, firstCorrect: 0, corrected: 0, bestStreak: 0, labsCompleted: 0 },
    questionStats: {}, flashcards: {}, sessions: [], activity: {}, completedLabs: {},
    flaggedQuestions: {}, flaggedLabs: {}, completedCrosswords: {},
    // notes: { "note:<conceptId>": { text, updatedAt } } — one free-text note per concept,
    //   shown wherever that concept appears (glossary, quiz explanation, flashcard) and
    //   collected on the "My notes" page. readinessLog: one { date, readiness, accuracy }
    //   snapshot per local day, feeding the History trend chart + projection.
    //   onboardedAt / examDate: per-track first-run state and optional target exam date.
    // guideResume: { [domainId]: segmentIndex } — the read-aloud segment to pick back up from
    // per Study guide chapter; set on pause/stop, cleared once that chapter is read to the end.
    // customConcepts: { [id]: {id,term,domain,core,definition,scenario,custom:true,createdAt} } —
    //   the user's own flashcards, shaped like a real concept so they flow through the exact
    //   same Glossary/flashcard rendering paths. Deliberately excluded from CONCEPTS/QUESTIONS-
    //   based quiz generation and mastery tracking — there's no way to generate trustworthy
    //   multiple-choice distractors for user-authored content, so this stays flashcard-only.
    // guideReadPosition: { core, domain } — the chapter nearest the top of the viewport last
    // time you scrolled away from the Study guide while just reading (not listening) — a
    // manual-reading equivalent of guideResume, tracked by scroll position instead of speech.
    // milestonesSeen: { 'streak-7': true, 'answered-500': true, ... } — which milestone
    // celebrations have already fired, so crossing the same threshold again on a later session
    // doesn't re-trigger it.
    // guideHighlights: { [domainId]: [{ id, section, para, start, end, createdAt }] } — persisted
    // textbook-style highlights in the Study guide, addressed by the same chapter-section-
    // paragraph indices buildSpeechSegments() already uses to map read-aloud segments to real
    // DOM nodes (section -1 / para 0 means the chapter's own overview paragraph).
    notes: {}, readinessLog: [], onboardedAt: null, examDate: null, guideResume: {}, customConcepts: {}, guideReadPosition: null, milestonesSeen: {}, guideHighlights: {}, examDayChecklist: {}, examResults: {}, suspendedConcepts: {},
    // Streak freeze: start with one banked. streakFreezeDates records which specific missed
    // days were already covered (so a freeze is only ever spent once per gap, permanently —
    // see checkStreakFreeze). streakFreezeGrantedAt is the highest real-streak-length a refill
    // has already been granted for, so re-crossing the same 7-day multiple doesn't re-grant.
    streakFreezes: 1, streakFreezeGrantedAt: 0, streakFreezeDates: {}
  });

  let state = defaultState();
  let remoteProgress = {}; // full multi-cert blob as stored server-side; each cert's own PROGRESS_KEY is isolated within it

  function stateFromRemote(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') return base;
    const merged = { ...base, ...raw, settings: { ...base.settings, ...(raw.settings || {}) }, stats: { ...base.stats, ...(raw.stats || {}) } };
    // themeMode is new — a progress file saved before it existed only has `theme`. Infer the
    // mode from whichever theme they'd already explicitly chosen rather than defaulting a
    // light-theme user back to 'dark', and never silently opt anyone into 'auto'.
    if (!raw.settings || !raw.settings.themeMode) merged.settings.themeMode = merged.settings.theme === 'light' ? 'light' : 'dark';
    // Guard the collections against a hand-edited or half-written progress file so a bad
    // shape can't crash `sessions.unshift` / `Object.entries(questionStats)` downstream.
    if (!Array.isArray(merged.sessions)) merged.sessions = [];
    if (!Array.isArray(merged.readinessLog)) merged.readinessLog = [];
    for (const key of ['questionStats', 'flashcards', 'activity', 'completedLabs', 'flaggedQuestions', 'flaggedLabs', 'completedCrosswords', 'notes', 'guideResume', 'customConcepts', 'milestonesSeen', 'streakFreezeDates', 'guideHighlights', 'examDayChecklist', 'examResults', 'suspendedConcepts']) {
      if (!merged[key] || typeof merged[key] !== 'object' || Array.isArray(merged[key])) merged[key] = {};
    }
    return merged;
  }

  // ---------- Study plan (cross-cert; stored under its own key, independent of any single track) ----------
  const PLAN_KEY = 'study-plan';
  const defaultPlan = () => ({
    version: 1,
    startDate: '2026-08-17',
    phases: [
      { certId: 'aplus', targetDate: '2026-09-30' },
      { certId: 'netplus', targetDate: '2026-10-31' },
      { certId: 'secplus', targetDate: '2026-11-30' }
    ]
  });

  let planState = defaultPlan();

  function planFromRemote(raw) {
    const base = defaultPlan();
    if (!raw || typeof raw !== 'object') return base;
    const phases = Array.isArray(raw.phases) && raw.phases.length ? raw.phases : base.phases;
    return { ...base, ...raw, phases };
  }

  function savePlan() {
    remoteProgress[PLAN_KEY] = planState;
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: activeProfileId, key: PLAN_KEY, value: planState })
    }).catch(() => toast('Plan could not be saved right now.', 'error'));
  }

  // ---------- App-level meta (cross-track; its own top-level key like the study plan) ----------
  // Anything that belongs to the person rather than a single track: which release's
  // "What's new" they've already dismissed, and (future) global preferences.
  const META_KEY = 'app-meta';
  // avatar.photoVersion is a client-generated cache-buster (Date.now()), not a counter the
  // server tracks — the uploaded photo always overwrites the same file on disk (see avatarUrl
  // below for which one), so nothing about the photo itself is stored in progress.json, only
  // this small pointer.
  const defaultMeta = () => ({ version: 1, seenVersion: null, lastBackupDate: null, backupSnoozeUntil: null, displayName: '', avatar: { type: 'initials', emoji: '', color: '', photoVersion: 0 }, appIconShape: 'cap', appIconColor: '#2dd4bf', autoBackupEnabled: true, notifyReviewsEnabled: false, lastReviewNotifyDate: null });
  const AVATAR_EMOJIS = ['🎓', '💻', '🛠️', '🔒', '📡', '🧠', '⚡', '🎯', '📚', '🖥️'];
  const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  // Reuses the same 6 icons already defined in iconPaths (no new SVG art to design) and the
  // avatar picker's own color palette, plus the app's real default teal up front so that
  // option is directly selectable as "the current default," not hidden as an implicit blank.
  const ICON_SHAPES = ['cap', 'book', 'target', 'bolt', 'brain', 'trophy'];
  const ICON_COLORS = ['#2dd4bf', ...AVATAR_COLORS];
  // Mirrors server.py's own /api/app-icon.svg generation exactly, so the browser tab icon
  // updates instantly on pick (no round trip needed) while a fresh page load / new PWA install
  // gets the identical result from the server-rendered version at that same URL.
  function buildAppIconSVG(shape, color) {
    const path = iconPaths[shape] || iconPaths.cap;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${color}"/><g transform="translate(16,16) scale(1.3333)" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
  }
  function updateFavicon() {
    const link = document.querySelector('link[rel="icon"]');
    if (link) link.href = 'data:image/svg+xml,' + encodeURIComponent(buildAppIconSVG(metaState.appIconShape || 'cap', metaState.appIconColor || '#2dd4bf'));
  }
  let metaState = defaultMeta();
  function metaFromRemote(raw) {
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? { ...defaultMeta(), ...raw } : defaultMeta();
  }
  function saveMeta() {
    remoteProgress[META_KEY] = metaState;
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: activeProfileId, key: META_KEY, value: metaState })
    }).catch(() => {});
  }

  // The default account's photo keeps living at the original fixed path (data/avatar.jpg) —
  // untouched by multi-account support — so any already-uploaded photo keeps working with zero
  // migration. Every other account gets its own id-suffixed file (mirrors server.py's
  // avatar_path_for, which is what actually decides where a POST /api/avatar write lands).
  function avatarUrl(photoVersion) {
    const path = activeProfileId === DEFAULT_PROFILE_ID ? '/data/avatar.jpg' : `/data/avatar-${activeProfileId}.jpg`;
    return `${path}?v=${photoVersion}`;
  }

  async function refreshRemoteProgress() {
    try {
      const res = await fetch(`/api/progress?profile=${encodeURIComponent(activeProfileId)}`);
      const data = await res.json();
      remoteProgress = (data && typeof data === 'object') ? data : {};
    } catch {
      remoteProgress = {};
    }
    planState = planFromRemote(remoteProgress[PLAN_KEY]);
    metaState = metaFromRemote(remoteProgress[META_KEY]);
  }

  // Re-fetches every time (rather than trusting the in-memory copy) so that switching
  // tracks always reflects the freshest saved state, even if another tab or track wrote
  // to a different key since this page loaded.
  async function reloadStateForActiveCert() {
    await refreshRemoteProgress();
    state = stateFromRemote(remoteProgress[PROGRESS_KEY]);
    checkStreakFreeze();
  }

  async function initState() {
    await reloadStateForActiveCert();
  }

  function saveState() {
    touchReadinessLog();
    remoteProgress[PROGRESS_KEY] = state;
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: activeProfileId, key: PROGRESS_KEY, value: state })
    }).catch(() => toast('Progress could not be saved right now.', 'error'));
    updateChrome();
  }

  let activeSession = null;
  let flashSession = null;
  let activeLab = null;
  let activeCrossword = null;
  let clozeSession = null;
  let timerHandle = null;
  let objectiveCore = 'core1';
  // Which domain cards are expanded on the Exam Map — collapsed by default so the page reads as
  // a scannable list of domains first, detail second. A Set (not an object) because membership
  // is all we need; persists across in-app navigation but resets on reload, same as objectiveCore.
  let expandedDomains = new Set();
  let glossaryQuery = '';
  let glossaryDomain = 'all';
  let packetDomain = 'all';
  let globalSearchQuery = '';
  let browseQuery = '';
  let browseDomain = 'all';
  let browseStatus = 'all';
  let browseSort = 'term';
  let browseSelected = new Set();
  let labDomainFilter = null;
  let labCoreFilter = 'all';
  let labQuery = '';
  let commandQuery = '';
  // Concept ids missed on the most recently completed session, grouped by domain — populated by
  // renderResults and consumed by startMissedPractice so the results screen can route straight
  // into a targeted redo of exactly what went wrong on that specific attempt.
  let lastResultsMissed = {};
  // Answer-review drill-in: which stored session is open on the History page, the active
  // filter chip, and the last results screen (so flag/filter toggles can re-render it).
  let activeReview = null;
  let reviewFilter = 'all';
  let resultsView = null;

  // hashNumber/seededShuffle now live in utils.js (imported above).

  let domainById = {};
  let coreByDomain = {};
  let definitionByTerm = new Map();
  let conceptById = {};
  let QUESTIONS = [];
  let questionById = {};

  // Three deliberately distinct testing angles per concept (not just reworded restatements):
  // apply it to a scenario, recognize it from its definition, or — when every distractor has a
  // known definition — the harder reverse format that flips the roles and quizzes the definition
  // itself rather than the term.
  const promptFrames = [
    c => `A technician needs to ${c.scenario}. Which option is the BEST fit?`,
    c => `Which technology or practice is described as: ${c.definition}`,
    c => `Choose the option that most directly satisfies this objective: ${c.scenario}.`
  ];

  function buildQuestionPool() {
    const questions = [];
    CONCEPTS.forEach(concept => {
      for (let variant = 0; variant < CERT.questionVariants; variant++) {
        const id = `${concept.id}-v${variant + 1}`;
        const optionTerms = [concept.term, ...concept.distractors.slice(0, 3)];
        const reversePurpose = variant === 2 && optionTerms.every(term => definitionByTerm.has(term));
        const optionValues = reversePurpose ? optionTerms.map(term => definitionByTerm.get(term)) : optionTerms;
        const correctAnswer = reversePurpose ? concept.definition : concept.term;
        // Option order is intentionally NOT decided here — optionValues stays in its canonical,
        // unshuffled order, and withFreshOptions() shuffles it fresh every time this question is
        // served into a new session (see that function for why: a fixed per-question shuffle
        // would put the correct answer in the same position forever).
        questions.push({
          id, conceptId: concept.id, core: concept.core, domain: concept.domain, objective: concept.objective,
          prompt: reversePurpose ? `Which statement BEST explains ${concept.term}?` : promptFrames[variant](concept),
          optionValues, answer: correctAnswer,
          explanation: `${concept.term}: ${concept.definition} ${concept.tip}`,
          difficulty: variant === 0 ? 'Foundational' : variant === 1 ? 'Applied' : 'Challenge'
        });
      }
    });
    return questions;
  }

  // Re-shuffles each question's option order fresh, once per session it's served into. Without
  // this, a question's options were shuffled exactly once when the pool was built (seeded only by
  // the question's own permanent id), so every future attempt — today, next week, next year —
  // showed the identical answer position. Repeat practice on a weak concept is the app's whole
  // gap-tracking system working as intended, but positional memorization ("it's always option C")
  // isn't the same as knowing the concept, which is exactly what this app is trying to build.
  function withFreshOptions(questions, seed) {
    return questions.map(question => {
      const options = seededShuffle(question.optionValues, `${seed}-opts-${question.id}`);
      return { ...question, options, correct: options.indexOf(question.answer) };
    });
  }

  function loadCertData(certId) {
    const entry = CERT_REGISTRY.find(item => item.id === certId) || CERT_REGISTRY[0];
    const dataset = window[entry.dataGlobal];
    activeCertId = entry.id;
    CERT = dataset.certification;
    CONCEPTS = dataset.concepts;
    LABS = window[entry.labsGlobal] || [];
    GUIDE = window[entry.guideGlobal] || [];
    PROGRESS_KEY = entry.progressKey;
    domainById = {}; coreByDomain = {};
    Object.values(CERT.cores).forEach(core => core.domains.forEach(domain => { domainById[domain.id] = domain; coreByDomain[domain.id] = core; }));
    definitionByTerm = new Map(CONCEPTS.map(concept => [concept.term, concept.definition]));
    conceptById = Object.fromEntries(CONCEPTS.map(concept => [concept.id, concept]));
    QUESTIONS = buildQuestionPool();
    questionById = Object.fromEntries(QUESTIONS.map(question => [question.id, question]));
    objectiveCore = Object.keys(CERT.cores)[0];
    try { localStorage.setItem(ACTIVE_CERT_KEY, entry.id); } catch {}
  }

  // CERT.cores' own keys ('core1', 'core2', ...) aren't stored anywhere per-domain — only the
  // core OBJECT is, via coreByDomain — so a custom card (which needs to set concept.core to the
  // same string key real concepts use, for CERT.cores[concept.core] lookups elsewhere to work)
  // has to search for which key maps to that object.
  function coreKeyForDomain(domainId) {
    const core = coreByDomain[domainId];
    return Object.keys(CERT.cores).find(key => CERT.cores[key] === core);
  }

  // Built-in CONCEPTS plus the user's own custom cards for this track — the pool actually
  // reviewable as flashcards and browsable in the Glossary. Never used for quiz/exam generation
  // or mastery tracking (see the customConcepts comment on defaultState for why).
  function allConcepts() {
    const custom = Object.values(state.customConcepts || {});
    return custom.length ? [...CONCEPTS, ...custom] : CONCEPTS;
  }

  function coreSelectOptions(selected) {
    const cores = Object.entries(CERT.cores);
    const allLabel = cores.length > 1 ? 'Both cores' : 'This exam';
    return `<option value="all" ${!selected || selected === 'all' ? 'selected' : ''}>${allLabel}</option>${cores.map(([key, core]) => `<option value="${key}" ${selected === key ? 'selected' : ''}>${escapeHtml(core.name)}${core.code ? ` · ${escapeHtml(core.code)}` : ''}</option>`).join('')}`;
  }

  // Loads a track into memory (data + saved progress) without touching the current route or dialog.
  // Shared by the cert switcher and by planner actions that need to act on a track that isn't active yet.
  async function activateCert(certId) {
    if (!certId || certId === activeCertId) return;
    activeSession = null; flashSession = null; activeLab = null; activeCrossword = null; clozeSession = null; sandboxSession = null;
    glossaryQuery = ''; glossaryDomain = 'all'; packetDomain = 'all'; labDomainFilter = null; labCoreFilter = 'all'; labQuery = ''; commandQuery = ''; globalSearchQuery = '';
    browseQuery = ''; browseDomain = 'all'; browseStatus = 'all'; browseSort = 'term'; browseSelected = new Set();
    loadCertData(certId);
    await reloadStateForActiveCert();
    updateCertChrome();
    updateChrome();
  }

  async function switchCert(certId) {
    if (!certId || certId === activeCertId) { closeDialog(); return; }
    closeDialog();
    await activateCert(certId);
    if (location.hash === '#dashboard') renderRoute(); else location.hash = 'dashboard';
    toast(`Switched to ${CERT.name}.`);
  }

  // From a study-plan schedule row: jump straight to that domain's labs, switching into the
  // phase's own track first if the plan is currently showing a different one than what's active.
  async function openDomainLabs(certId, domainId) {
    if (certId && certId !== activeCertId) await activateCert(certId);
    labDomainFilter = domainId;
    navigate('labs');
  }

  // ---------- Accounts (each with completely separate progress/settings) ----------
  function currentProfile() {
    return profiles.find(p => p.id === activeProfileId) || profiles[0] || { id: DEFAULT_PROFILE_ID, name: '' };
  }

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (Array.isArray(data?.profiles) && data.profiles.length) profiles = data.profiles;
      switchPinRequired = !!data?.hasPin;
    } catch {}
    let stored = null;
    try { stored = localStorage.getItem(ACTIVE_PROFILE_KEY); } catch {}
    // Falls back to the default account if the stored id doesn't match anything real —
    // e.g. that account was removed, or this is a first run with nothing stored yet.
    activeProfileId = profiles.some(p => p.id === stored) ? stored : DEFAULT_PROFILE_ID;
  }

  async function verifyPin(pin) {
    try {
      const res = await fetch('/api/profiles/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      const data = await res.json();
      return !!data.ok;
    } catch { return false; }
  }

  // mode is 'set' (no PIN exists yet), 'change', or 'remove' — all three post to the same
  // server endpoint, which itself requires the CURRENT pin before touching an existing one
  // (see server.py's /api/profiles/set-pin), so a stolen/guessed dialog click alone can't
  // clear someone else's lock.
  async function submitPinForm(mode) {
    const currentPin = document.getElementById('pin-current')?.value || '';
    const newPin = document.getElementById('pin-new')?.value || '';
    const confirmPin = document.getElementById('pin-confirm')?.value || '';
    if (mode !== 'remove') {
      if (!/^\d{4,8}$/.test(newPin)) { toast('PIN must be 4-8 digits.', 'error'); return; }
      if (newPin !== confirmPin) { toast("PINs don't match.", 'error'); return; }
    }
    try {
      const res = await fetch('/api/profiles/set-pin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: mode === 'remove' ? null : newPin, currentPin: switchPinRequired ? currentPin : undefined })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'save failed');
      switchPinRequired = !!data.hasPin;
      pinManageMode = null;
      renderAccountDialog();
      toast(mode === 'remove' ? 'PIN removed — switching accounts no longer needs one.' : mode === 'set' ? 'PIN set — switching into another account now requires it.' : 'PIN changed.');
    } catch (err) {
      toast(err.message === 'current PIN is incorrect' ? 'That current PIN is wrong.' : 'Could not save that PIN.', 'error');
    }
  }

  // Same reset-transient-state shape as activateCert (a mid-quiz session, an open lab, an
  // in-progress crossword all belong to whoever was using the app a moment ago, not the account
  // being switched into) plus a full state/meta/plan reload for the new account's own data.
  async function switchProfile(profileId) {
    if (!profileId || profileId === activeProfileId) { closeDialog(); return; }
    activeSession = null; flashSession = null; activeLab = null; activeCrossword = null; clozeSession = null; sandboxSession = null;
    glossaryQuery = ''; glossaryDomain = 'all'; packetDomain = 'all'; labDomainFilter = null; labCoreFilter = 'all'; labQuery = ''; commandQuery = ''; globalSearchQuery = '';
    browseQuery = ''; browseDomain = 'all'; browseStatus = 'all'; browseSort = 'term'; browseSelected = new Set();
    activeReview = null; resultsView = null;
    activeProfileId = profileId;
    try { localStorage.setItem(ACTIVE_PROFILE_KEY, profileId); } catch {}
    closeDialog();
    await reloadStateForActiveCert();
    checkAutoBackup();
    checkDueReviewNotification();
    updateCertChrome();
    updateChrome();
    if (location.hash === '#dashboard') renderRoute(); else location.hash = 'dashboard';
    toast(`Switched to ${escapeHtml(currentProfile().name || 'this account')}.`);
  }

  async function createProfile(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) { toast('Enter a name for the new account.', 'error'); return; }
    try {
      const res = await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: trimmed }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'create failed');
      profiles = [...profiles, data.profile];
      await switchProfile(data.profile.id);
      // Pre-fill the display name from what they just typed, so the brand-new account greets
      // them by name immediately instead of showing "Future technician" until they visit Settings.
      metaState.displayName = trimmed;
      saveMeta();
      updateChrome();
      toast(`Account created for ${escapeHtml(trimmed)} — starting fresh with no progress.`);
    } catch (err) {
      toast(err.message === 'name is required' ? 'Enter a name for the new account.' : 'Could not create that account.', 'error');
    }
  }

  async function deleteProfile(profileId) {
    if (profileId === DEFAULT_PROFILE_ID) return;
    try {
      const res = await fetch('/api/profiles/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: profileId }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'delete failed');
      profiles = profiles.filter(p => p.id !== profileId);
      if (activeProfileId === profileId) await switchProfile(DEFAULT_PROFILE_ID);
      else renderAccountDialog();
      toast('Account removed from the switcher (its saved data is left on disk, not deleted).');
    } catch {
      toast('Could not remove that account.', 'error');
    }
  }

  // A password-style numeric field, styled to match every other text input in the app rather
  // than a bare default box — reused by both the switch-time prompt and the set/change/remove
  // PIN forms below.
  function pinFieldMarkup(id, label) {
    return `<div class="field"><label for="${id}">${label}</label><input type="password" inputmode="numeric" pattern="\\d*" id="${id}" class="setting-date-input" maxlength="8" autocomplete="off" style="width:140px"></div>`;
  }

  function pinSwitchPromptMarkup() {
    const target = profiles.find(p => p.id === pendingSwitchId);
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="pin-switch-title">
      <h2 id="pin-switch-title">Enter PIN</h2>
      <p>Switching to ${escapeHtml(target?.name || 'this account')} requires the switch PIN.</p>
      <form id="pin-switch-form">
        ${pinFieldMarkup('pin-switch-input', 'PIN')}
        <div class="button-row" style="margin-top:14px"><button class="primary" type="submit">Unlock</button><button class="secondary" type="button" data-action="cancel-pin-switch">Cancel</button></div>
      </form>
    </div>`;
  }

  function pinFormMarkup(mode) {
    const titles = { set: 'Set a PIN', change: 'Change PIN', remove: 'Remove PIN' };
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="pin-title">
      <h2 id="pin-title">${titles[mode]}</h2>
      <p>${mode === 'remove' ? "Switching accounts won't require a PIN any more." : 'Require this PIN before switching into another account. 4–8 digits.'}</p>
      <form id="pin-form">
        ${switchPinRequired ? pinFieldMarkup('pin-current', 'Current PIN') : ''}
        ${mode !== 'remove' ? pinFieldMarkup('pin-new', 'New PIN') + pinFieldMarkup('pin-confirm', 'Confirm new PIN') : ''}
        <div class="button-row" style="margin-top:14px"><button class="${mode === 'remove' ? 'danger-button' : 'primary'}" type="submit">${mode === 'remove' ? `${icon('trash')} Remove PIN` : 'Save PIN'}</button><button class="secondary" type="button" data-action="reopen-account-dialog">Cancel</button></div>
      </form>
    </div>`;
  }

  function accountDialogMarkup() {
    if (pendingSwitchId) return pinSwitchPromptMarkup();
    if (pinManageMode) return pinFormMarkup(pinManageMode);
    const rows = profiles.map(p => {
      const active = p.id === activeProfileId;
      const initials = displayNameInitials(p.name || '?');
      const card = active
        ? `<button class="cert-option" disabled style="flex:1;margin-top:0"><span class="mini-mark">${escapeHtml(initials)}</span><span><strong>${escapeHtml(p.name || 'Unnamed')}</strong><small>Active now</small></span><span class="tag teal">Active</span></button>`
        : `<button class="cert-option" data-action="switch-profile" data-profile-id="${escapeHtml(p.id)}" style="flex:1;margin-top:0"><span class="mini-mark">${escapeHtml(initials)}</span><span><strong>${escapeHtml(p.name || 'Unnamed')}</strong><small>Tap to switch</small></span><span class="coming-badge">Switch</span></button>`;
      const canDelete = !active && p.id !== DEFAULT_PROFILE_ID;
      return `<div class="button-row" style="margin-top:9px;align-items:center">${card}${canDelete ? `<button type="button" class="icon-button" data-action="delete-profile" data-profile-id="${escapeHtml(p.id)}" aria-label="Remove ${escapeHtml(p.name || 'this account')}" title="Remove account">${icon('trash')}</button>` : ''}</div>`;
    }).join('');
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <h2 id="account-title">Switch account</h2>
      <p>Each account keeps its own completely separate progress, mastery, and settings — nothing here is shared between them.</p>
      ${rows}
      <form id="new-account-form" class="button-row" style="margin-top:16px;align-items:center">
        <input type="text" id="new-account-name" class="setting-date-input" placeholder="New person's name" autocomplete="off" maxlength="40" style="flex:1;min-width:160px">
        <button class="secondary" type="submit">+ Add person</button>
      </form>
      <div class="button-row" style="margin-top:14px;justify-content:space-between">
        <button class="ghost small" type="button" data-action="manage-pin">🔒 ${switchPinRequired ? 'Change PIN' : 'Set a PIN'}</button>
        <div class="button-row" style="margin:0">
          ${switchPinRequired ? `<button class="ghost small" type="button" data-action="open-remove-pin">Remove PIN</button>` : ''}
          <button class="secondary" type="button" data-action="close-dialog">Close</button>
        </div>
      </div>
    </div>`;
  }

  function renderAccountDialog() {
    dialogLayer.innerHTML = accountDialogMarkup();
    hydrateIcons(dialogLayer);
    const newAccountForm = document.getElementById('new-account-form');
    if (newAccountForm) newAccountForm.addEventListener('submit', event => {
      event.preventDefault();
      createProfile(document.getElementById('new-account-name').value);
    });
    const pinSwitchForm = document.getElementById('pin-switch-form');
    if (pinSwitchForm) pinSwitchForm.addEventListener('submit', async event => {
      event.preventDefault();
      const pin = document.getElementById('pin-switch-input').value;
      const target = pendingSwitchId;
      if (await verifyPin(pin)) { pendingSwitchId = null; await switchProfile(target); }
      else toast('Incorrect PIN.', 'error');
    });
    const pinForm = document.getElementById('pin-form');
    if (pinForm) pinForm.addEventListener('submit', event => { event.preventDefault(); submitPinForm(pinManageMode); });
    focusDialog();
  }

  function openAccountDialog() {
    dialogReturnFocus = document.activeElement;
    pendingSwitchId = null; pinManageMode = null;
    renderAccountDialog();
  }

  // Weighted sample drawn across every domain in every core of the active cert, so a
  // recap quiz covers the full breadth of a certification rather than a single exam core.
  function comprehensiveSample(count) {
    const domains = Object.values(CERT.cores).flatMap(core => core.domains);
    const totalWeight = domains.reduce((sum, domain) => sum + domain.weight, 0) || 1;
    const seed = Date.now();
    const allocation = domains.map(domain => ({ domain, exact: count * domain.weight / totalWeight, total: Math.floor(count * domain.weight / totalWeight) }));
    let remaining = count - allocation.reduce((sum, item) => sum + item.total, 0);
    allocation.sort((a, b) => (b.exact - b.total) - (a.exact - a.total)).forEach(item => { if (remaining-- > 0) item.total++; });
    const selected = [];
    allocation.forEach(item => {
      const priorityConceptIds = unmasteredConcepts(item.domain.id).map(gap => gap.concept.id);
      selected.push(...sampleQuestions({ domain: item.domain.id, priorityConceptIds }, item.total, `${seed}-${item.domain.id}`));
    });
    return seededShuffle(selected, `${seed}-comprehensive`);
  }

  async function startComprehensiveQuiz(certId) {
    await activateCert(certId);
    const count = Math.min(40, QUESTIONS.length);
    const questions = comprehensiveSample(count);
    if (!questions.length) { toast('No questions available yet.', 'error'); return; }
    activeSession = {
      id: `comprehensive-${Date.now()}`, source: 'practice', mode: `${CERT.name} comprehensive recap`,
      questions, index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: false
    };
    navigate('practice');
  }

  // A focused recap quiz for a single week's domain, scoped to whichever cert that domain belongs
  // to. Weighted toward this domain's mastery gaps first (unmasteredConcepts runs against
  // whichever cert activateCert just switched to), then fills out the rest of the count from the
  // domain's full breadth — so the plan's own "review this domain" prompt actually targets what's
  // still shaky instead of a plain random sample that could just skip the weak spots entirely.
  async function startDomainQuiz(certId, domainId) {
    await activateCert(certId);
    const domain = domainById[domainId];
    if (!domain) { toast('That domain is not available yet.', 'error'); return; }
    const priorityConceptIds = unmasteredConcepts(domainId).map(item => item.concept.id);
    const questions = sampleQuestions({ domain: domainId, priorityConceptIds }, 20, `${Date.now()}-${domainId}`);
    if (!questions.length) { toast('No questions available yet.', 'error'); return; }
    activeSession = {
      id: `domain-quiz-${Date.now()}`, source: 'practice', mode: `${domain.name} recap quiz`,
      questions, index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: false
    };
    navigate('practice');
  }

  // Revisits the exact questions you flagged (not fresh variants of the same concept), since
  // the point is to go back over the ones you specifically marked, not just the topic.
  function startFlaggedReview() {
    const ids = Object.keys(state.flaggedQuestions);
    const questions = ids.map(id => questionById[id]).filter(Boolean);
    if (!questions.length) { toast('No flagged questions yet — flag one from any quiz.', 'error'); return; }
    const seed = Date.now();
    activeSession = {
      id: `flagged-${seed}`, source: 'practice', mode: 'Flagged review',
      questions: withFreshOptions(seededShuffle(questions, seed), seed), index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: state.settings.secondChance
    };
    navigate('practice');
  }

  function updateCertChrome() {
    const entry = CERT_REGISTRY.find(item => item.id === activeCertId);
    const certButton = document.getElementById('cert-button');
    if (certButton && entry) {
      const codes = Object.values(CERT.cores).map(core => core.code).join(' · ');
      certButton.innerHTML = `<span class="mini-mark">${escapeHtml(entry.short)}</span><span><strong>${escapeHtml(CERT.name)}</strong><small>${escapeHtml(codes)}</small></span><span data-icon="chevron"></span>`;
      hydrateIcons(certButton);
    }
    const footerNote = document.getElementById('footer-note');
    if (footerNote) footerNote.textContent = `Cert Study uses original practice content mapped to the public ${CERT.name} objectives.`;
    const footerDisclaimer = document.getElementById('footer-disclaimer');
    if (footerDisclaimer && entry) footerDisclaimer.textContent = `Not affiliated with or endorsed by ${entry.vendor}.`;
    const footerVersion = document.getElementById('footer-version');
    if (footerVersion) footerVersion.textContent = APP_VERSION;
    updateDomainNav();
  }

  // Programs are purely hands-on: no quiz/exam/flashcard surfaces exist for them anywhere in
  // the app, not just hidden from the nav — this is what actually enforces that at the chrome
  // level. Certs keep every nav item; Programs only ever sees Dashboard/Glossary/Labs/Progress.
  function updateDomainNav() {
    const domain = currentDomain();
    document.querySelectorAll('.nav-item[data-domain]').forEach(item => { item.classList.toggle('hidden', item.dataset.domain !== domain); });
    // Hide a whole nav group (and its label) once every item in it is hidden — for Programs
    // that collapses "Practice" down to just Labs and drops "Plan & progress" to Progress only.
    document.querySelectorAll('.nav-group').forEach(group => {
      const anyVisible = [...group.querySelectorAll('.nav-item')].some(item => !item.classList.contains('hidden'));
      group.classList.toggle('hidden', !anyVisible);
    });
    const quickBtn = document.getElementById('quick-practice-btn');
    if (quickBtn) quickBtn.classList.toggle('hidden', domain !== 'certs');
    const brandTitle = document.querySelector('.brand-copy strong');
    const brandSub = document.querySelector('.brand-copy small');
    const brandMark = document.querySelector('.brand-mark');
    const isPrograms = domain === 'programs';
    if (brandTitle) brandTitle.textContent = isPrograms ? 'Program Study' : 'Cert Study';
    if (brandSub) brandSub.textContent = isPrograms ? 'Hands-on skills' : 'Exam prep';
    if (brandMark) { const iconName = isPrograms ? 'layers' : 'cap'; brandMark.dataset.icon = iconName; brandMark.innerHTML = icon(iconName); }
  }

  const BACKUP_REMINDER_DAYS = 14;
  function needsBackupReminder() {
    if (!hasAnyProgress()) return false;
    if (metaState.backupSnoozeUntil && todayKey() < metaState.backupSnoozeUntil) return false;
    if (!metaState.lastBackupDate) return true;
    return daysBetween(metaState.lastBackupDate, todayKey()) >= BACKUP_REMINDER_DAYS;
  }

  function backupReminderMarkup() {
    if (!needsBackupReminder()) return '';
    const headline = metaState.lastBackupDate
      ? `It's been ${daysBetween(metaState.lastBackupDate, todayKey())} days since your last backup.`
      : "You haven't backed up your progress yet.";
    return `<div class="notice" style="margin-bottom:18px">${icon('download')}<span><strong>${headline}</strong> Everything lives only on this machine — back it up in case something happens to it.</span><div class="button-row" style="margin-left:auto;flex:0 0 auto"><button class="secondary small" data-action="save-backup-file">Back up now</button><button class="ghost small" data-action="dismiss-backup-reminder">Remind me later</button></div></div>`;
  }

  // Only surfaces in the last few days before a real exam date — a full random practice set
  // is the wrong tool that close in; flagged questions, weak objectives, and recent misses are
  // exactly what startCramSession() combines into one session.
  function cramReminderMarkup() {
    const countdown = examCountdown();
    if (!countdown || countdown.days > 3) return '';
    const headline = countdown.days === 0 ? 'Exam day is today.' : `${countdown.days} day${countdown.days === 1 ? '' : 's'} until your exam.`;
    return `<div class="notice" style="margin-bottom:18px">${icon('alert')}<span><strong>${headline}</strong> A focused review of your flagged questions, weakest objectives, and recent misses beats a full random practice set right now.</span><div class="button-row" style="margin-left:auto;flex:0 0 auto"><button class="ghost small" data-route="examday">${icon('flag')} Exam day checklist</button><button class="secondary small" data-action="start-cram">${icon('bolt')} Start cram session</button></div></div>`;
  }

  // pct/escapeHtml/formatDate/formatDateKey/formatDuration now live in utils.js (imported above).

  // Each track's data file gives every domain a fixed identity hex color (used as literal
  // inline text color on the Exam Map's big weight number and the mock-results domain
  // breakdown name) — tuned by eye against dark theme's near-black surface, where it already
  // has plenty of contrast, but never checked against light theme's near-white one. Rather
  // than hand-tune every domain color in every track's data file, darken it at render time —
  // only as much as needed, and only when the color as-authored doesn't already clear the
  // bar (dark theme's bright colors pass through unchanged; nothing here changes there).
  function relLuminance([r, g, b]) {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrastRatio(rgb1, rgb2) {
    const l1 = relLuminance(rgb1), l2 = relLuminance(rgb2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function domainAccentColor(domain, targetRatio = 3.3) {
    const hex = domain.color;
    const rgb = hex.replace('#', '').match(/.{2}/g).map(h => parseInt(h, 16));
    const bg = state.settings.theme === 'light' ? [255, 255, 255] : [16, 24, 39];
    if (contrastRatio(rgb, bg) >= targetRatio) return hex;
    let lo = 0, hi = 1, best = rgb;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const c = rgb.map(v => Math.round(v * mid));
      if (contrastRatio(c, bg) >= targetRatio) { best = c; lo = mid; } else { hi = mid; }
    }
    return `rgb(${best.join(',')})`;
  }

  function getDomainMetrics(domainId) {
    let seen = 0, firstCorrect = 0;
    Object.entries(state.questionStats).forEach(([id, stat]) => {
      const q = questionById[id];
      if (q && q.domain === domainId) { seen += stat.seen || 0; firstCorrect += stat.firstCorrect || 0; }
    });
    const accuracy = pct(firstCorrect, seen);
    const confidence = Math.min(1, seen / 20);
    return { seen, firstCorrect, accuracy, mastery: Math.round(accuracy * (.35 + .65 * confidence)) };
  }

  // Shared by the dashboard's "next best move" list and Practice's weak-area targeting hub,
  // so both surfaces rank the same way instead of drifting apart.
  function getWeakDomains(limit = 4) {
    return Object.values(domainById).map(domain => ({ domain, ...getDomainMetrics(domain.id) })).sort((a, b) => a.mastery - b.mastery).slice(0, limit);
  }

  function getCoreReadiness(coreId) {
    const core = CERT.cores[coreId];
    // Normalise by the actual weight total rather than assuming it's exactly 100 — a
    // track whose published domain weights don't quite sum to 100 would otherwise push
    // readiness above 100%.
    const totalWeight = core.domains.reduce((sum, domain) => sum + (domain.weight || 0), 0) || 1;
    return Math.round(core.domains.reduce((sum, domain) => sum + getDomainMetrics(domain.id).mastery * (domain.weight || 0), 0) / totalWeight);
  }

  function getReadiness() {
    const cores = Object.keys(CERT.cores);
    return Math.round(cores.reduce((sum, id) => sum + getCoreReadiness(id), 0) / cores.length);
  }

  // Most recent mock-exam attempt per core (not an average across every attempt ever) — a
  // score from months ago shouldn't outweigh a fresh one when judging current readiness.
  // Cores with no attempt yet are left out of the average rather than counted as 0.
  function getMockExamReadiness() {
    const cores = Object.keys(CERT.cores);
    const perCore = cores.map(coreId => {
      const attempt = state.sessions.find(s => s.type === 'exams' && s.core === coreId);
      if (!attempt || attempt.scaled == null) return null;
      return Math.min(100, Math.round((attempt.scaled / CERT.cores[coreId].passingScore) * 100));
    }).filter(v => v != null);
    return { value: perCore.length ? Math.round(perCore.reduce((a, b) => a + b, 0) / perCore.length) : null, attempts: perCore.length, cores: cores.length };
  }

  function getLabReadiness() {
    const total = LABS.length;
    const completed = Object.keys(state.completedLabs).length;
    return { value: total ? Math.round((completed / total) * 100) : null, completed, total };
  }

  // Blends three different kinds of evidence into one number: breadth of content knowledge
  // (mastery), performance under real exam conditions (mock exams), and hands-on/PBQ-style
  // skill (labs) — weighted 45/35/20. A leg with no evidence yet (most often: no mock exam
  // taken) is left out entirely rather than guessed at, with its weight redistributed across
  // whichever legs do have evidence, so a fresh track never gets penalized for data it hasn't
  // had a chance to generate yet.
  function getExamDayReadiness() {
    const mockExam = getMockExamReadiness();
    const labs = getLabReadiness();
    const legs = [
      { key: 'mastery', label: 'Content mastery', value: getReadiness(), weight: 45 },
      { key: 'mockExam', label: 'Mock exam performance', value: mockExam.value, weight: 35 },
      { key: 'labs', label: 'Hands-on labs', value: labs.value, weight: 20 }
    ];
    const available = legs.filter(leg => leg.value != null);
    const weightTotal = available.reduce((sum, leg) => sum + leg.weight, 0) || 1;
    const value = available.length ? Math.round(available.reduce((sum, leg) => sum + leg.value * leg.weight, 0) / weightTotal) : 0;
    const weakest = available.length ? [...available].sort((a, b) => a.value - b.value)[0] : null;
    return { value, legs, mockExam, labs, weakest };
  }

  // Same evidence-weighted mastery math as getDomainMetrics, narrowed to one objective group
  // (question.objective, e.g. "1.2"). An objective holds only a handful of concepts, so the
  // sample-size confidence ramp is shorter (full weight at 12 attempts, not 20).
  function getObjectiveMetrics(domainId, objectiveCode) {
    let seen = 0, firstCorrect = 0;
    Object.entries(state.questionStats).forEach(([id, stat]) => {
      const q = questionById[id];
      if (q && q.domain === domainId && q.objective === objectiveCode) { seen += stat.seen || 0; firstCorrect += stat.firstCorrect || 0; }
    });
    const accuracy = pct(firstCorrect, seen);
    const confidence = Math.min(1, seen / 12);
    return { seen, firstCorrect, accuracy, mastery: Math.round(accuracy * (.35 + .65 * confidence)) };
  }

  // Every domain's objective groups for the active cert, flattened and ranked weakest-first —
  // used by the dashboard's "next best move" to point at the single shakiest objective, not
  // just the shakiest domain.
  function getWeakObjectives(limit = 3) {
    const rows = [];
    Object.values(CERT.cores).forEach(core => core.domains.forEach(domain => {
      (domain.objectives || []).forEach(objective => {
        rows.push({ domain, objective, ...getObjectiveMetrics(domain.id, objective.code) });
      });
    }));
    return rows.filter(row => row.mastery < 80).sort((a, b) => a.mastery - b.mastery).slice(0, limit);
  }

  // Append or refresh today's readiness snapshot. One row per local date (last write wins),
  // 120 kept — the History "Readiness trend" chart and its projection read this series.
  function touchReadinessLog() {
    if (!CERT || !CERT.cores || currentDomain() !== 'certs') return;
    if (!Array.isArray(state.readinessLog)) state.readinessLog = [];
    const key = todayKey();
    const snapshot = { date: key, readiness: getReadiness(), accuracy: pct(state.stats.firstCorrect, state.stats.answered) };
    const last = state.readinessLog[state.readinessLog.length - 1];
    if (last && last.date === key) Object.assign(last, snapshot);
    else state.readinessLog.push(snapshot);
    if (state.readinessLog.length > 120) state.readinessLog = state.readinessLog.slice(-120);
  }

  // Least-squares fit over the readiness series → { slope per day, projected date to reach
  // `target` }. Returns null when there's not enough spread to say anything honest.
  function readinessProjection(target) {
    const log = (state.readinessLog || []).filter(row => row && row.date);
    if (log.length < 4) return null;
    const t0 = new Date(`${log[0].date}T00:00:00`).getTime();
    const pts = log.map(row => [(new Date(`${row.date}T00:00:00`).getTime() - t0) / 86400000, row.readiness]);
    const n = pts.length;
    const sx = pts.reduce((s, p) => s + p[0], 0), sy = pts.reduce((s, p) => s + p[1], 0);
    const sxx = pts.reduce((s, p) => s + p[0] * p[0], 0), sxy = pts.reduce((s, p) => s + p[0] * p[1], 0);
    const denom = n * sxx - sx * sx;
    if (!denom) return null;
    const slope = (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;
    const current = log[log.length - 1].readiness;
    const lastX = pts[pts.length - 1][0];
    let projectedDate = null;
    if (current < target && slope > 0.05) {
      const xTarget = (target - intercept) / slope;
      if (xTarget > lastX && xTarget - lastX < 400) {
        const d = new Date(t0 + xTarget * 86400000);
        projectedDate = localDateKey(d);
      }
    }
    return { slope, current, target, projectedDate, reached: current >= target };
  }

  // Readiness gained/lost over the last `days` days, or null without enough history.
  function readinessDelta(days) {
    const log = (state.readinessLog || []).filter(row => row && row.date);
    if (log.length < 2) return null;
    const cutoff = todayKey(-days);
    const past = [...log].reverse().find(row => row.date <= cutoff) || log[0];
    return log[log.length - 1].readiness - past.readiness;
  }

  // { days, date } until the active track's exam, or null when no future date is set.
  function examCountdown() {
    if (!state.examDate) return null;
    const days = daysBetween(todayKey(), state.examDate);
    if (days < 0) return null;
    return { days, date: state.examDate };
  }

  // ---------- Personal notes (one per concept; concept ids are unique within a track) ----------
  function noteKey(conceptId) { return `note:${conceptId}`; }
  function getNote(conceptId) {
    const store = state.notes || {};
    return store[noteKey(conceptId)] || null;
  }
  function setNote(conceptId, text) {
    if (!state.notes || typeof state.notes !== 'object' || Array.isArray(state.notes)) state.notes = {};
    const trimmed = (text || '').trim();
    if (!trimmed) delete state.notes[noteKey(conceptId)];
    else state.notes[noteKey(conceptId)] = { text: trimmed, updatedAt: new Date().toISOString() };
    saveState();
  }
  function noteCount() { return Object.keys(state.notes || {}).length; }

  // ---------- Cross-cert planning helpers (read any track's saved progress without switching to it) ----------
  function computeCertSummary(entry) {
    const dataset = window[entry.dataGlobal];
    if (!dataset) return null;
    const cert = dataset.certification;
    const blob = (remoteProgress && remoteProgress[entry.progressKey]) || {};
    const stats = blob.questionStats || {};
    const conceptDomain = {};
    dataset.concepts.forEach(concept => { conceptDomain[concept.id] = concept.domain; });
    const domainSeen = {}, domainCorrect = {};
    Object.entries(stats).forEach(([qid, stat]) => {
      const conceptId = qid.replace(/-v\d+$/, '');
      const domainId = conceptDomain[conceptId];
      if (!domainId) return;
      domainSeen[domainId] = (domainSeen[domainId] || 0) + (stat.seen || 0);
      domainCorrect[domainId] = (domainCorrect[domainId] || 0) + (stat.firstCorrect || 0);
    });
    const domainMastery = domainId => {
      const seen = domainSeen[domainId] || 0, correct = domainCorrect[domainId] || 0;
      const accuracy = pct(correct, seen);
      const confidence = Math.min(1, seen / 20);
      return Math.round(accuracy * (.35 + .65 * confidence));
    };
    const coreReadiness = Object.values(cert.cores).map(core => {
      const tw = core.domains.reduce((sum, domain) => sum + (domain.weight || 0), 0) || 1;
      return Math.round(core.domains.reduce((sum, domain) => sum + domainMastery(domain.id) * (domain.weight || 0), 0) / tw);
    });
    const readiness = coreReadiness.length ? Math.round(coreReadiness.reduce((a, b) => a + b, 0) / coreReadiness.length) : 0;
    return {
      cert, readiness,
      answered: (blob.stats && blob.stats.answered) || 0,
      sessions: (blob.sessions && blob.sessions.length) || 0,
      labsCompleted: blob.completedLabs ? Object.keys(blob.completedLabs).length : 0,
      totalLabs: (window[entry.labsGlobal] || []).length
    };
  }

  // Shared by both dashboard variants (certs and programs) so switching your active track
  // never hides visibility into everything else you're juggling — reuses computeCertSummary,
  // which already reads any track's saved progress without needing to switch to it.
  function allTracksSectionMarkup() {
    const rows = CERT_REGISTRY.map(entry => {
      const summary = computeCertSummary(entry);
      if (!summary) return '';
      const group = CERT_GROUPS.find(g => g.id === entry.group);
      const isProgram = group && group.domain === 'programs';
      const isActive = entry.id === activeCertId;
      const metric = isProgram
        ? `${summary.labsCompleted}/${summary.totalLabs} labs complete`
        : `${summary.readiness}% readiness${summary.answered ? ` · ${summary.answered} answered` : ''}`;
      return isActive
        ? `<button class="cert-option" disabled><span class="mini-mark">${escapeHtml(entry.short)}</span><span><strong>${escapeHtml(summary.cert.name)}</strong><small>${metric}</small></span><span class="tag teal">Active now</span></button>`
        : `<button class="cert-option" data-action="switch-cert" data-cert-id="${entry.id}"><span class="mini-mark">${escapeHtml(entry.short)}</span><span><strong>${escapeHtml(summary.cert.name)}</strong><small>${metric}</small></span><span class="coming-badge">Switch</span></button>`;
    }).join('');
    return `<section class="panel" style="margin-top:22px">
      <div class="panel-header"><div><h2>All your tracks</h2><p>Every certification and program at a glance, without leaving what you're working on now.</p></div></div>
      <div class="panel-body">${rows}</div>
    </section>`;
  }

  // addDays/daysBetween/formatPlanDate now live in utils.js (imported above). This file used to
  // have a second, duplicate formatDateKey here too — removed in favor of the one already
  // defined earlier (same local-midnight-safe logic, just discovered twice independently).

  function buildPhaseSchedule(phase, startDate) {
    const entry = CERT_REGISTRY.find(item => item.id === phase.certId);
    const dataset = entry && window[entry.dataGlobal];
    if (!entry || !dataset) return null;
    const cert = dataset.certification;
    const coreList = Object.values(cert.cores);
    const domains = coreList.flatMap(core => core.domains);
    const coreIndexById = new Map();
    coreList.forEach((core, i) => core.domains.forEach(domain => coreIndexById.set(domain.id, i)));
    const totalWeight = domains.reduce((sum, domain) => sum + domain.weight, 0) || 1;
    const totalDays = Math.max(1, daysBetween(startDate, phase.targetDate));
    const reviewDays = Math.min(7, Math.max(3, Math.round(totalDays * 0.12)));
    const studyDays = Math.max(domains.length, totalDays - reviewDays);
    const allocation = domains.map(domain => ({ domain, exact: studyDays * domain.weight / totalWeight, days: Math.floor(studyDays * domain.weight / totalWeight) }));
    let remaining = studyDays - allocation.reduce((sum, item) => sum + item.days, 0);
    allocation.sort((a, b) => (b.exact - b.days) - (a.exact - a.days)).forEach(item => { if (remaining-- > 0) item.days++; });
    allocation.sort((a, b) => (coreIndexById.get(a.domain.id) - coreIndexById.get(b.domain.id)) || (b.domain.weight - a.domain.weight));
    let cursor = startDate;
    const blocks = allocation.filter(item => item.days > 0).map(item => {
      const blockStart = cursor;
      const blockEnd = addDays(cursor, item.days - 1);
      cursor = addDays(cursor, item.days);
      return { domain: item.domain, start: blockStart, end: blockEnd, days: item.days };
    });
    return { entry, cert, blocks, review: { start: cursor, end: phase.targetDate }, totalDays, start: startDate, end: phase.targetDate };
  }

  // Same "what's scheduled right now" computation renderPlanner() does inline for its "Right
  // now" banner, narrowed to whichever phase (if any) belongs to the currently active track —
  // the Dashboard only ever needs today's focus for the track it's already looking at, not
  // every track in the plan. Phases run back-to-back, so this still has to walk them in order
  // to know where this phase's own start date actually falls.
  function getActiveTrackPlanFocus() {
    const phase = planState.phases.find(p => p.certId === activeCertId);
    if (!phase) return null;
    let cursorDate = planState.startDate;
    let schedule = null;
    for (const p of planState.phases) {
      const built = buildPhaseSchedule(p, cursorDate);
      cursorDate = p.targetDate;
      if (p.certId === activeCertId) { schedule = built; break; }
    }
    if (!schedule) return null;
    const today = todayKey();
    if (today < schedule.start || today > schedule.end) return null;
    const block = schedule.blocks.find(item => today >= item.start && today <= item.end);
    return { schedule, block, inReview: !block && today >= schedule.review.start };
  }

  function getStreak() {
    let streak = 0;
    for (let offset = 0; offset > -365; offset--) {
      const key = todayKey(offset);
      const active = state.activity[key] > 0 || state.streakFreezeDates[key];
      if (offset === 0 && !active) continue;
      if (!active) break;
      streak++;
    }
    return streak;
  }

  // Runs once per track load (see reloadStateForActiveCert), not on every render/getStreak()
  // call — spending a freeze is a real, one-time event that must happen at a controlled point,
  // not something re-decided every time the dashboard happens to redraw. Idempotent: once
  // yesterday is marked in streakFreezeDates, this is a no-op on every later check.
  function checkStreakFreeze() {
    const yesterday = todayKey(-1); const dayBefore = todayKey(-2);
    if (state.activity[yesterday] > 0 || state.streakFreezeDates[yesterday]) return;
    const hadStreakGoingIn = state.activity[dayBefore] > 0 || state.streakFreezeDates[dayBefore];
    if (!hadStreakGoingIn || state.streakFreezes <= 0) return;
    state.streakFreezeDates[yesterday] = true;
    state.streakFreezes--;
    saveState();
    toast(`Streak freeze used — yesterday's gap is covered, your streak continues. ${state.streakFreezes} freeze${state.streakFreezes === 1 ? '' : 's'} left.`, 'milestone');
  }

  // A concept counts as mastered once it's been answered at least 3 times at 80%+ first-attempt
  // accuracy — the same bar used across the dashboard's mastered-concept count, the domain mastery
  // score, and the Exam Map's "needs practice" list below, so all three stay consistent with each other.
  const MASTERY_MIN_SEEN = 3;
  const MASTERY_MIN_ACCURACY = .8;

  function conceptStatsMap() {
    const conceptStats = {};
    CONCEPTS.forEach(concept => { conceptStats[concept.id] = { seen: 0, correct: 0 }; });
    Object.entries(state.questionStats).forEach(([id, stat]) => {
      const q = questionById[id];
      if (!q || !conceptStats[q.conceptId]) return;
      conceptStats[q.conceptId].seen += stat.seen || 0; conceptStats[q.conceptId].correct += stat.firstCorrect || 0;
    });
    return conceptStats;
  }

  function isConceptMastered(entry) { return entry.seen >= MASTERY_MIN_SEEN && entry.correct / entry.seen >= MASTERY_MIN_ACCURACY; }

  function getMasteredConcepts() {
    return Object.values(conceptStatsMap()).filter(isConceptMastered).length;
  }

  // The longest run of consecutive active days ever logged, not just the current unbroken
  // streak (which resets to 0 the moment a single day is missed) — a 30-day streak from two
  // months ago is still a real, earned achievement even after life gets in the way for a week.
  function getLongestStreakEver() {
    const days = new Set([...Object.keys(state.activity).filter(key => state.activity[key] > 0), ...Object.keys(state.streakFreezeDates)]);
    let longest = 0;
    days.forEach(key => {
      if (days.has(addDays(key, -1))) return; // only walk a run from its actual start
      let run = 0; let cursor = key;
      while (days.has(cursor)) { run++; cursor = addDays(cursor, 1); }
      longest = Math.max(longest, run);
    });
    return longest;
  }

  // Every badge is derived live from data the app already tracks — nothing new is persisted
  // just to know whether one's earned, so there's no separate "earnedAt" record to drift out
  // of sync with the underlying stats (and no migration needed for accounts that predate this).
  const ACHIEVEMENTS = [
    { id: 'first-steps', title: 'First Steps', icon: 'play', description: 'Answer your first practice question.',
      progress: () => ({ current: Math.min(1, state.stats.answered), target: 1 }) },
    { id: 'century-club', title: 'Century Club', icon: 'target', description: 'Answer 100 practice questions.',
      progress: () => ({ current: state.stats.answered, target: 100 }) },
    { id: 'concept-master', title: 'Concept Master', icon: 'brain', description: 'Reach mastery on 50 concepts.',
      progress: () => ({ current: getMasteredConcepts(), target: 50 }) },
    { id: 'full-house', title: 'Full House', icon: 'trophy', description: 'Bring every domain to 80%+ mastery.',
      progress: () => { const domains = Object.values(CERT.cores).flatMap(core => core.domains); const done = domains.filter(d => getDomainMetrics(d.id).mastery >= 80).length; return { current: done, target: domains.length }; } },
    { id: 'mock-exam-pass', title: 'Mock Exam Ace', icon: 'clipboard', description: 'Pass a full mock exam at or above the real passing score.',
      progress: () => ({ current: state.sessions.some(s => s.type === 'exams' && s.scaled != null && CERT.cores[s.core] && s.scaled >= CERT.cores[s.core].passingScore) ? 1 : 0, target: 1 }) },
    { id: 'hands-on-hero', title: 'Hands-On Hero', icon: 'terminal', description: 'Complete every interactive lab in this track.',
      progress: () => ({ current: LABS.filter(l => state.completedLabs[l.id]).length, target: LABS.length }) },
    { id: 'command-line-pro', title: 'Command Line Pro', icon: 'terminal', description: 'Complete every terminal-style lab in this track.',
      progress: () => { const terminals = LABS.filter(l => l.type === 'terminal'); return { current: terminals.filter(l => state.completedLabs[l.id]).length, target: terminals.length }; } },
    { id: 'flashcard-fanatic', title: 'Flashcard Fanatic', icon: 'layers', description: 'Review 50 different flashcards at least once.',
      progress: () => ({ current: Object.keys(state.flashcards).length, target: 50 }) },
    { id: 'week-streak', title: 'Week Streak', icon: 'flame', description: 'Study 7 days in a row.',
      progress: () => ({ current: getLongestStreakEver(), target: 7 }) },
    { id: 'month-streak', title: 'Month Streak', icon: 'flame', description: 'Study 30 days in a row.',
      progress: () => ({ current: getLongestStreakEver(), target: 30 }) },
    { id: 'cram-survivor', title: 'Cram Survivor', icon: 'alert', description: 'Complete a cram session before an exam.',
      progress: () => ({ current: state.sessions.some(s => s.id && s.id.startsWith('cram-')) ? 1 : 0, target: 1 }) },
    { id: 'certified', title: 'Certified', icon: 'trophy', description: 'Record a real, passing exam result.',
      progress: () => ({ current: Object.entries(state.examResults || {}).some(([coreId, result]) => CERT.cores[coreId] && result.score >= CERT.cores[coreId].passingScore) ? 1 : 0, target: 1 }) }
  ];

  // Drawn from Pearson OnVUE's own published candidate ID policy and system requirements
  // (private room, two original non-expired IDs, a system test run beforehand, a clear desk) —
  // not invented, and deliberately generic rather than tied to one specific exam's requirements.
  const EXAM_DAY_CHECKLIST = [
    { id: 'id-ready', label: 'Two valid, non-expired, original photo IDs ready (no photocopies), matching the name used to register' },
    { id: 'room-ready', label: 'A private room with a door that closes, and no one else will be in it during the exam' },
    { id: 'system-test', label: "Ran Pearson OnVUE's system test on this exact device, and it passed" },
    { id: 'desk-clear', label: 'Desk is clear of papers, books, notes, a second monitor, and any other computer' },
    { id: 'appointment-time', label: 'Confirmed the exact appointment time and time zone from the confirmation email' },
    { id: 'device-ready', label: 'Laptop is plugged in (or fully charged) and other applications are closed' }
  ];

  function getAchievements() {
    return ACHIEVEMENTS.map(badge => {
      const progress = badge.progress();
      const target = progress.target || 1;
      return { ...badge, current: progress.current, target, earned: progress.current >= target, pct: Math.min(100, Math.round((progress.current / target) * 100)) };
    });
  }

  // Deterministic per calendar day, not per render/reload — a small daily-varying seed derived
  // from todayKey() rather than Math.random(), so the same concept shows all day and changes at
  // local midnight without needing anything persisted server-side just to remember which one.
  function getTipOfTheDay() {
    const pool = CONCEPTS.filter(concept => concept.tip);
    if (!pool.length) return null;
    const seed = todayKey().split('-').reduce((hash, part) => hash * 31 + Number(part), 7);
    return pool[Math.abs(seed) % pool.length];
  }

  // Concepts in a domain that haven't yet cleared the mastery bar, each tagged with why: never
  // attempted, still building up attempts, or attempted enough but below the accuracy bar. Powers
  // the Exam Map's "needs practice" list so gaps in an otherwise-decent domain score are visible
  // and individually practiceable, rather than hidden inside one aggregate percentage.
  function unmasteredConcepts(domainId) {
    const stats = conceptStatsMap();
    return CONCEPTS.filter(concept => concept.domain === domainId)
      .map(concept => ({ concept, entry: stats[concept.id] || { seen: 0, correct: 0 } }))
      .filter(({ entry }) => !isConceptMastered(entry))
      .map(({ concept, entry }) => ({
        concept, seen: entry.seen, accuracy: pct(entry.correct, entry.seen),
        status: entry.seen === 0 ? 'New' : entry.seen < MASTERY_MIN_SEEN ? 'Building' : 'Below 80%'
      }));
  }

  // recallMatchHint now lives in utils.js (imported above).

  function getDueCards(includeNew = true) {
    const now = Date.now();
    const pool = allConcepts().filter(concept => !state.suspendedConcepts[concept.id]);
    const reviewed = pool.filter(concept => state.flashcards[concept.id] && new Date(state.flashcards[concept.id].due).getTime() <= now);
    if (!includeNew) return reviewed;
    const fresh = pool.filter(concept => !state.flashcards[concept.id]);
    return [...reviewed, ...fresh].slice(0, Math.max(20, reviewed.length));
  }

  // 'auto' follows the OS/browser preference live; 'dark'/'light' are explicit and ignore it.
  function resolveTheme(mode) {
    if (mode === 'auto') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return mode === 'light' ? 'light' : 'dark';
  }

  function setThemeMode(mode) {
    state.settings.themeMode = mode;
    state.settings.theme = resolveTheme(mode);
    saveState();
    renderRoute();
  }

  // Reuses the exact primary/soft pairs styles.css already defines for --blue/--violet/--green/
  // --amber/--red — those were individually contrast-tuned against both themes' surfaces during
  // the project's big light-theme accessibility pass, so borrowing them here for --primary (used
  // in the same "colored text/icon on its own soft background" pattern in ~60 places across the
  // app) is already known-safe, rather than needing that whole calibration exercise redone for a
  // fresh set of colors just for this picker.
  const ACCENT_THEMES = [
    { id: 'teal', label: 'Teal', dark: { primary: '#2dd4bf', soft: 'rgba(45,212,191,.12)' }, light: { primary: '#0b7267', soft: 'rgba(15,159,144,.1)' } },
    { id: 'blue', label: 'Blue', dark: { primary: '#38bdf8', soft: 'rgba(56,189,248,.12)' }, light: { primary: '#026ba1', soft: 'rgba(2,132,199,.09)' } },
    { id: 'violet', label: 'Violet', dark: { primary: '#a78bfa', soft: 'rgba(167,139,250,.12)' }, light: { primary: '#7c3aed', soft: 'rgba(124,58,237,.1)' } },
    { id: 'green', label: 'Green', dark: { primary: '#4ade80', soft: 'rgba(74,222,128,.12)' }, light: { primary: '#107535', soft: 'rgba(22,163,74,.1)' } },
    { id: 'amber', label: 'Amber', dark: { primary: '#fbbf24', soft: 'rgba(251,191,36,.12)' }, light: { primary: '#9b5505', soft: 'rgba(217,119,6,.1)' } },
    { id: 'rose', label: 'Rose', dark: { primary: '#fb7185', soft: 'rgba(251,113,133,.12)' }, light: { primary: '#c71940', soft: 'rgba(225,29,72,.08)' } }
  ];

  // 'teal' is the app's own built-in default — clearing the inline overrides entirely (rather
  // than re-setting them to teal's own values) lets styles.css's already-curated --primary-strong
  // keep driving progress-bar/chart gradients untouched. Any other accent derives its own strong
  // variant via color-mix so a new hardcoded gradient partner isn't needed per color per theme.
  function applyAccentColor() {
    const root = document.documentElement.style;
    const accent = ACCENT_THEMES.find(a => a.id === state.settings.accentColor);
    if (!accent || accent.id === 'teal') {
      root.removeProperty('--primary'); root.removeProperty('--primary-soft'); root.removeProperty('--primary-strong');
      return;
    }
    const { primary, soft } = accent[state.settings.theme] || accent.dark;
    root.setProperty('--primary', primary);
    root.setProperty('--primary-soft', soft);
    root.setProperty('--primary-strong', `color-mix(in srgb, ${primary} 82%, black)`);
  }

  // Must match styles.css's own :root font-family declaration — used as the fallback tail so
  // a mistyped/uninstalled custom font name degrades to the app's normal look instead of
  // whatever generic default the browser falls back to.
  const DEFAULT_FONT_STACK = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  // Strips embedded quotes (defensive — this becomes a CSSOM property value, not HTML, so it's
  // not an injection risk, just cheap insurance against a malformed font-family value) and
  // quotes the name so multi-word families ("Comic Sans MS") parse as one token.
  function buildFontStack(name) {
    const clean = (name || '').trim().replace(/"/g, '');
    return clean ? `"${clean}", ${DEFAULT_FONT_STACK}` : DEFAULT_FONT_STACK;
  }

  // Set directly as an inline style on the root element rather than through a CSS custom
  // property — font-family already cascades to every descendant through ordinary inheritance,
  // so there's no need for a var() indirection the way --primary needed one for its ~60 call
  // sites. An empty value clears the override, falling back to styles.css's own default.
  function applyFontChoice() {
    document.documentElement.style.fontFamily = state.settings.fontFamily ? buildFontStack(state.settings.fontFamily) : '';
  }

  // styles.css has zero rem/em usage — every font-size and spacing value in this app is a
  // literal px number (148 separate declarations), so a root font-size multiplier would do
  // nothing on its own. `zoom` scales the entire rendered page (text, spacing, icons, borders,
  // fixed-position overlays — everything, proportionally) exactly like browser page-zoom does,
  // without needing to touch any of those 148 declarations individually.
  function applyFontSize() {
    const size = state.settings.fontSize;
    document.documentElement.style.zoom = size && size !== 1 ? size : '';
  }

  // Density reads purely via a [data-density] attribute selector in styles.css. Corner style
  // needs two mechanisms: the 8 cards already reading border-radius from var(--radius) pick up
  // the override automatically (same "set the custom property directly" technique as
  // applyAccentColor above); everything else with its own hardcoded px radius is handled by an
  // explicit [data-corners="sharp"] rule set in styles.css instead.
  function applyCornerStyle() {
    const sharp = state.settings.cornerStyle === 'sharp';
    document.documentElement.dataset.corners = sharp ? 'sharp' : 'rounded';
    if (sharp) document.documentElement.style.setProperty('--radius', '4px');
    else document.documentElement.style.removeProperty('--radius');
  }
  function applyDensity() { document.documentElement.dataset.density = state.settings.density === 'compact' ? 'compact' : 'comfortable'; }

  // Only while a quiz/exam is both in progress AND actually the page on screen — activeSession
  // alone isn't enough, since it stays set (by design) if you navigate away mid-quiz to check
  // something else; hiding the sidebar on, say, the Settings page just because a practice
  // session is paused in the background would be surprising, not helpful. currentRoute() ===
  // activeSession.source is the exact same check renderRoute() itself uses to decide whether
  // to actually render the quiz view right now. Re-evaluated from updateChrome() (already
  // called after every render) rather than needing its own call sites.
  function applyFocusMode() { document.body.classList.toggle('focus-active', !!(state.settings.focusMode && activeSession && currentRoute() === activeSession.source)); }

  // General reading-legibility accessibility mode — deliberately NOT a bundled special "dyslexia
  // font" (this app ships zero external fonts/files, and the research on any one dyslexia-specific
  // typeface actually helping is mixed anyway); instead: a plainer, widely-available system
  // sans-serif, generous line/letter/word spacing, and non-essential motion switched off. All via
  // a [data-reading-mode] attribute, same mechanism as applyCornerStyle/applyDensity above.
  function applyReadingMode() { document.documentElement.dataset.readingMode = state.settings.readingMode ? 'on' : ''; }

  // Independent of Reading mode's own bundled motion-reduction — someone who's motion-sensitive
  // but doesn't want the wider spacing/plainer font can turn off just this. The OS-level
  // prefers-reduced-motion media query (styles.css) already covers this automatically regardless
  // of either setting; this is the in-app override for anyone who can't or hasn't set that at
  // the system level (e.g. a shared machine).
  function applyReducedMotion() { document.documentElement.dataset.motion = state.settings.reducedMotion ? 'reduced' : ''; }

  // Swaps the app's default green/red correct-incorrect signal (one of the hardest color pairs
  // for red-green colorblindness, the most common form) to blue/amber, and always relies on the
  // check/x icons already in the answer markup rather than color alone.
  function applyColorblindMode() { document.documentElement.dataset.colorblind = state.settings.colorblindMode ? 'on' : ''; }

  // Boosts the app's own low-contrast design tokens (muted captions, soft/translucent tag and
  // notice backgrounds, hairline borders) via the same CSS-variable cascade every component
  // already reads from — no per-component overrides needed, since --muted/--border/-soft were
  // already the single source of truth for those values everywhere they're used.
  function applyHighContrast() { document.documentElement.dataset.contrast = state.settings.highContrast ? 'high' : ''; }

  // A no-permission-needed fallback the datalist always ships with, since the Local Font
  // Access API below is Chromium-only and, even there, can silently resolve to an empty list
  // depending on browser version/policy rather than actually prompting — unlike a native app
  // (Office, etc.), a web page has no unrestricted way to read the real OS font list, so this
  // covers the common case (the fonts Windows/Office ship with) without depending on that API
  // at all. Anything picked here that isn't actually installed just falls through to the
  // default stack via ordinary CSS font-family fallback — never a broken/invisible font.
  const COMMON_FONTS = [
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Calibri Light', 'Cambria', 'Candara',
    'Cascadia Code', 'Cascadia Mono', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel',
    'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia',
    'Impact', 'Ink Free', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode',
    'Malgun Gothic', 'Microsoft JhengHei', 'Microsoft Sans Serif', 'Microsoft YaHei',
    'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe Print',
    'Segoe Script', 'Segoe UI', 'Segoe UI Black', 'Segoe UI Semibold', 'Segoe UI Variable',
    'SimSun', 'Sitka', 'Sylfaen', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
    'Yu Gothic',
    // Common macOS/Linux system fonts, in case this isn't opened on Windows.
    'Helvetica Neue', 'San Francisco', 'Menlo', 'Monaco', 'DejaVu Sans', 'Ubuntu', 'Noto Sans'
  ].sort((a, b) => a.localeCompare(b));

  // Local Font Access API (Chromium only, needs a user gesture + one-time permission grant —
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/queryLocalFonts). Feature-detected
  // wherever it's used; browsers without it just get the plain COMMON_FONTS suggestion list.
  // fontSuggestions already defaults to COMMON_FONTS, so this only needs to MERGE in the real
  // list on success — nothing gets worse if this fails or (as observed in some environments,
  // including a sandboxed browser with no real OS font access) silently returns zero results.
  async function browseLocalFonts() {
    try {
      const fonts = await window.queryLocalFonts();
      const families = [...new Set(fonts.map(f => f.family))];
      if (!families.length) { toast("Your browser didn't share your installed fonts (permission declined, or not supported here) — showing common fonts instead.", 'error'); return; }
      setFontSuggestions([...new Set([...families, ...COMMON_FONTS])].sort((a, b) => a.localeCompare(b)));
      toast(`Found ${families.length} installed fonts — type in the field to search them.`);
    } catch {
      toast("Could not read installed fonts — your browser may not support this, or you declined the permission prompt. Showing common fonts instead.", 'error');
    }
  }

  // First letter of up to the first two words — 'Alex Chen' -> 'AC', 'chris' -> 'C', matching
  // the initials-avatar convention most account chrome (Slack, Gmail, Google Workspace) uses.
  function displayNameInitials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return words.length ? words.slice(0, 2).map(w => w[0].toUpperCase()).join('') : 'IT';
  }

  // Downscales/cover-crops any uploaded photo to a small square JPEG entirely client-side
  // before it ever reaches the server — keeps the on-disk file (and the network request) a
  // few KB regardless of how large the original photo was, and progress.json never sees it.
  function resizeImageToDataUrl(file, size) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('decode failed'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          const scale = Math.max(size / img.width, size / img.height);
          const drawW = img.width * scale, drawH = img.height * scale;
          ctx.drawImage(img, (size - drawW) / 2, (size - drawH) / 2, drawW, drawH);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleAvatarPhotoUpload(file) {
    if (!file || !file.type.startsWith('image/')) { toast('Choose an image file.', 'error'); return; }
    try {
      const dataUrl = await resizeImageToDataUrl(file, 160);
      const res = await fetch('/api/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: activeProfileId, dataUrl }) });
      if (!res.ok) throw new Error('upload failed');
      metaState.avatar = { ...metaState.avatar, type: 'photo', photoVersion: Date.now() };
      saveMeta();
      renderRoute();
      toast('Profile photo updated.');
    } catch {
      toast('Could not save that photo.', 'error');
    }
  }

  async function removeAvatarPhoto() {
    // The server deletes the actual file on removal — fetch it as a data URL first so "Undo"
    // has real image bytes to re-upload, not just a pointer to restore.
    let previousDataUrl = null;
    if (metaState.avatar.type === 'photo' && metaState.avatar.photoVersion) {
      try {
        const res = await fetch(avatarUrl(metaState.avatar.photoVersion));
        if (res.ok) { const blob = await res.blob(); previousDataUrl = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); }); }
      } catch {}
    }
    const previousAvatar = { ...metaState.avatar };
    try { await fetch('/api/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: activeProfileId, dataUrl: null }) }); } catch {}
    metaState.avatar = { ...metaState.avatar, type: metaState.avatar.type === 'photo' ? 'initials' : metaState.avatar.type, photoVersion: 0 };
    saveMeta();
    renderRoute();
    toast('Profile photo removed.', 'success', previousDataUrl ? { label: 'Undo', run: async () => {
      try {
        await fetch('/api/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: activeProfileId, dataUrl: previousDataUrl }) });
        metaState.avatar = { ...previousAvatar, photoVersion: Date.now() };
        saveMeta();
        renderRoute();
        toast('Photo restored.');
      } catch { toast('Could not restore the photo.', 'error'); }
    } } : null);
  }

  function updateChrome() {
    document.documentElement.dataset.theme = state.settings.theme;
    applyAccentColor();
    applyFontChoice();
    applyFontSize();
    applyCornerStyle();
    applyDensity();
    applyFocusMode();
    applyReadingMode();
    applyReducedMotion();
    applyColorblindMode();
    applyHighContrast();
    updateFavicon();
    const theme = document.getElementById('theme-toggle');
    if (theme) theme.innerHTML = icon(state.settings.theme === 'dark' ? 'sun' : 'moon');
    const displayName = (metaState.displayName || '').trim();
    const profileNameEl = document.getElementById('profile-name');
    const profileAvatarEl = document.getElementById('profile-avatar');
    if (profileNameEl) profileNameEl.textContent = displayName || 'Future technician';
    if (profileAvatarEl) {
      const avatar = metaState.avatar || defaultMeta().avatar;
      const isPhoto = avatar.type === 'photo' && avatar.photoVersion;
      profileAvatarEl.classList.toggle('has-photo', !!isPhoto);
      profileAvatarEl.style.background = isPhoto ? '' : (avatar.color || '');
      if (isPhoto) profileAvatarEl.innerHTML = `<img src="${avatarUrl(avatar.photoVersion)}" alt="">`;
      else profileAvatarEl.textContent = avatar.type === 'emoji' && avatar.emoji ? avatar.emoji : (displayName ? displayNameInitials(displayName) : 'IT');
    }
    const streak = getStreak();
    const streakEl = document.getElementById('header-streak');
    if (streakEl) streakEl.textContent = streak;
    const streakPillEl = document.querySelector('.streak-pill');
    if (streakPillEl) streakPillEl.title = state.streakFreezes > 0 ? `${state.streakFreezes} streak freeze${state.streakFreezes === 1 ? '' : 's'} banked — covers one missed day automatically.` : '';
    const dueEl = document.getElementById('due-badge');
    if (dueEl) dueEl.textContent = getDueCards(false).length || Math.min(20, allConcepts().filter(c => !state.flashcards[c.id]).length);
    const notesEl = document.getElementById('notes-badge');
    if (notesEl) {
      const n = noteCount();
      notesEl.textContent = n;
      notesEl.classList.toggle('hidden', !n);
    }
    const levelEl = document.getElementById('sidebar-level');
    if (levelEl) {
      if (currentDomain() === 'programs') {
        const done = Object.keys(state.completedLabs).length;
        levelEl.textContent = done === 0 ? 'Just getting started' : done === LABS.length ? 'All labs complete' : 'Building hands-on skill';
      } else {
        const readiness = getReadiness();
        levelEl.textContent = readiness >= 80 ? 'Exam-ready' : readiness >= 55 ? 'Building confidence' : 'Foundation level';
      }
    }
  }

  function toast(message, type = 'success', action = null) {
    const region = document.getElementById('toast-region');
    const node = document.createElement('div');
    node.className = `toast ${type}${action ? ' has-action' : ''}`;
    const iconName = type === 'error' ? 'alert' : type === 'milestone' ? 'trophy' : 'check';
    node.innerHTML = `<span>${icon(iconName)}</span><span>${escapeHtml(message)}</span>`;
    if (action) {
      const btn = document.createElement('button');
      btn.className = 'toast-action';
      btn.textContent = action.label;
      btn.addEventListener('click', () => { node.remove(); action.run(); });
      node.appendChild(btn);
    }
    region.appendChild(node);
    setTimeout(() => node.remove(), action ? 15000 : type === 'milestone' ? 6000 : 3600);
  }

  // Speak a short status to screen readers. Used for feedback that otherwise only appears
  // as a colour change or a newly-rendered block the user has no reason to go look for
  // (quiz result, lab feedback). Clearing first forces re-announcement of repeat messages.
  function announce(message) {
    const el = document.getElementById('a11y-status');
    if (!el) return;
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = message; });
  }

  // ---------- Milestone celebrations ----------
  // A brief, tasteful acknowledgement the first time you cross a real threshold — built
  // entirely from stats already tracked elsewhere, no new scoring logic. Respects
  // prefers-reduced-motion (the toast still shows; only the confetti is skipped).
  function launchConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['var(--primary)', 'var(--blue)', 'var(--amber)', 'var(--violet)', 'var(--green)'];
    const container = document.createElement('div');
    container.className = 'confetti-burst';
    for (let i = 0; i < 28; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${(Math.random() * 0.3).toFixed(2)}s`;
      piece.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 160)}px`);
      container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 2200);
  }

  function celebrateMilestone(message) {
    const style = state.settings.celebrationStyle || 'confetti';
    if (style === 'off') return;
    toast(message, style === 'simple' ? 'success' : 'milestone');
    if (style === 'confetti') launchConfetti();
  }

  const STREAK_MILESTONES = [7, 30, 100, 365];
  const ANSWERED_MILESTONES = [100, 500, 1000, 2500, 5000, 10000];
  const MASTERY_PCT_MILESTONES = [25, 50, 75, 100];

  // Called after every recorded answer — cheap to run every time since it's just threshold
  // comparisons against numbers already computed elsewhere (getStreak/getMasteredConcepts),
  // and only ever writes to state on the rare tick where something new actually crosses a line.
  function checkMilestones() {
    if (currentDomain() !== 'certs') return; // streak/mastery framing doesn't apply to programs
    state.milestonesSeen = state.milestonesSeen || {};
    let changed = false;
    const mark = key => {
      if (state.milestonesSeen[key]) return false;
      state.milestonesSeen[key] = true;
      changed = true;
      return true;
    };
    const streak = getStreak();
    STREAK_MILESTONES.forEach(n => { if (streak >= n && mark(`streak-${n}`)) celebrateMilestone(`🔥 ${n}-day streak — keep it going.`); });
    // Refill a streak freeze every real 7-day multiple, capped at 2 banked — rewards keeping a
    // streak going rather than needing any purchase/currency system. Guarded by
    // streakFreezeGrantedAt (not milestonesSeen) since re-crossing the same threshold after a
    // freeze reset the count shouldn't re-grant until a genuinely new multiple is reached.
    if (streak > 0 && streak % 7 === 0 && streak > state.streakFreezeGrantedAt) {
      state.streakFreezeGrantedAt = streak;
      changed = true;
      if (state.streakFreezes < 2) { state.streakFreezes++; celebrateMilestone(`🧊 Streak freeze earned — ${state.streakFreezes} banked to protect a future missed day.`); }
    }
    const answered = state.stats.answered;
    ANSWERED_MILESTONES.forEach(n => { if (answered >= n && mark(`answered-${n}`)) celebrateMilestone(`${n.toLocaleString()} questions answered.`); });
    const masteredPct = pct(getMasteredConcepts(), CONCEPTS.length);
    MASTERY_PCT_MILESTONES.forEach(n => { if (masteredPct >= n && mark(`mastered-${n}`)) celebrateMilestone(n === 100 ? `Every concept in ${CERT.name} mastered.` : `${n}% of ${CERT.name} mastered.`); });
    ACHIEVEMENTS.forEach(badge => {
      const progress = badge.progress();
      if (progress.current >= (progress.target || 1) && mark(`badge-${badge.id}`)) celebrateMilestone(`🏅 Achievement unlocked: ${badge.title}`);
    });
    if (changed) saveState();
  }

  // Modal dialogs: move focus into the dialog on open, keep Tab inside it, and put focus
  // back on whatever opened it when it closes. Without this a keyboard/SR user is left
  // stranded on <body> after every dialog.
  let dialogReturnFocus = null;
  function focusDialog() {
    const d = dialogLayer.querySelector('.dialog');
    if (!d) return;
    if (!d.hasAttribute('tabindex')) d.setAttribute('tabindex', '-1');
    d.focus();
  }
  function openDialog(markup) {
    dialogReturnFocus = document.activeElement;
    dialogLayer.innerHTML = markup;
    hydrateIcons(dialogLayer);
    focusDialog();
  }
  dialogLayer.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const d = dialogLayer.querySelector('.dialog');
    if (!d) return;
    const f = [...d.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])')].filter(el => el.offsetParent !== null);
    if (!f.length) { event.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === d)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  function setPageMeta(route) {
    const [title, kicker] = routeMeta[route] || routeMeta.dashboard;
    // Only the on-page heading gets personalized — the tab title stays plain "Dashboard" so
    // browser history/bookmarks don't end up full of one-off greeting strings.
    const displayName = (metaState.displayName || '').trim();
    titleEl.textContent = route === 'dashboard' && displayName ? `Welcome back, ${displayName}` : title;
    kickerEl.textContent = kicker; document.title = `${title} — Cert Study`;
    document.querySelectorAll('.nav-item[data-route]').forEach(item => {
      const active = item.dataset.route === route;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
    });
    syncNavGroups(route);
  }

  // ---------- Collapsible sidebar sections (independent — any number open at once) ----------
  // Each section header is a disclosure toggle. Opening one no longer closes the others —
  // navigating to a page adds its section to the open set (so you can always see where you
  // are) without touching any section you'd already opened yourself; clicking a heading only
  // ever affects that heading's own section. The set is remembered per-device in localStorage
  // (a lightweight UI convenience, not synced study data).
  const NAV_OPEN_KEY = 'cert-study-nav-open';
  const ROUTE_GROUP = {
    flashcards: 'study', browse: 'study', crossword: 'study', cloze: 'study', glossary: 'study', guide: 'study', notes: 'study',
    practice: 'practice', exams: 'practice', labs: 'practice', casestudies: 'practice', sandbox: 'practice',
    objectives: 'plan', history: 'plan', planner: 'plan', achievements: 'plan'
  };
  let navOpenGroups;
  try {
    const raw = localStorage.getItem(NAV_OPEN_KEY);
    navOpenGroups = new Set(raw == null ? ['study'] : raw ? raw.split(',') : []);
  } catch { navOpenGroups = new Set(['study']); }

  function persistNavGroups() {
    try { localStorage.setItem(NAV_OPEN_KEY, [...navOpenGroups].join(',')); } catch {}
  }
  function applyNavGroups() {
    document.querySelectorAll('.nav-group').forEach(group => {
      const toggle = group.querySelector('.nav-group-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', navOpenGroups.has(group.dataset.group) ? 'true' : 'false');
    });
  }
  function syncNavGroups(route) {
    const group = ROUTE_GROUP[route];
    if (group && !navOpenGroups.has(group)) { navOpenGroups.add(group); persistNavGroups(); }
    applyNavGroups();
  }
  function toggleNavGroup(id) {
    navOpenGroups.has(id) ? navOpenGroups.delete(id) : navOpenGroups.add(id);
    persistNavGroups();
    applyNavGroups();
  }

  function currentRoute() { return (location.hash || '#dashboard').slice(1).split('?')[0]; }
  function navigate(route) {
    closeMobileNav();
    if (location.hash === `#${route}`) renderRoute(); else location.hash = route;
  }

  const CERTS_ONLY_ROUTES = new Set(['practice', 'flashcards', 'exams', 'objectives', 'planner', 'crossword', 'cloze', 'browse', 'casestudies', 'sandbox', 'report', 'guide-digest', 'achievements', 'examday', 'mistakes', 'finalreview']);

  function renderRoute() {
    clearInterval(timerHandle); timerHandle = null;
    // Any real re-render replaces the guide chapter DOM the read-aloud queue is narrating (or
    // navigates away from it entirely) — always stop rather than let it keep talking over
    // content that's no longer what's on screen. Pause/resume/stop themselves never reach here
    // (they patch the DOM in place via updateGuideSpeechUI instead of calling renderRoute).
    if (speakingDomain) stopGuideSpeech();
    // Same idea, for the simpler one-shot quiz/flashcard reader (speakOnce) — activeSession and
    // flashSession both persist across navigation by design, so without this, reading a question
    // aloud and then clicking over to Settings would keep talking about a screen no longer visible.
    stopSpeakOnce();
    // Same reasoning as the read-aloud stop above, for plain scrolling/reading instead of
    // listening: any real re-render is about to replace or leave the chapter DOM being
    // observed, so bank whatever chapter was in view right before that happens.
    disconnectGuideObserver();
    // A pending text-selection popover targets a specific paragraph element that's about to be
    // replaced or navigated away from — never leave it floating over the next page.
    hideGuideHighlightPopover();
    let route = routeMeta[currentRoute()] ? currentRoute() : 'dashboard';
    // Programs have no quiz/exam/flashcard surfaces at all — reachable only via the nav, which
    // already hides these, but a stale browser-history hash (e.g. Back after switching domains)
    // could still land here directly, so this is the actual enforcement point, not just the UI.
    if (currentDomain() === 'programs' && CERTS_ONLY_ROUTES.has(route)) route = 'dashboard';
    if (route !== 'history') activeReview = null;
    setPageMeta(route);
    if (activeSession && activeSession.source === route) renderQuiz();
    else if (flashSession && route === 'flashcards') renderFlashSession();
    else if (activeLab && route === 'labs') renderLabWorkbench();
    else if (activeCrossword && route === 'crossword') renderCrosswordPlay();
    else if (clozeSession && route === 'cloze') renderClozePlay();
    else if (activeReview && route === 'history') renderStoredReview(activeReview);
    else ({ dashboard: renderDashboard, planner: renderPlanner, practice: renderPractice, exams: renderExams, flashcards: renderFlashcards,
      crossword: renderCrosswordHub, cloze: renderClozeHub, browse: renderBrowse, notes: renderNotes,
      glossary: renderGlossary, guide: renderStudyGuide, labs: renderLabs, casestudies: renderCaseStudiesHub, sandbox: renderSandbox, commands: renderCommandReference, objectives: renderObjectives, history: renderHistory, settings: renderSettings,
      report: renderReadinessReport, 'guide-digest': renderHighlightsDigest, achievements: renderAchievementsPage, examday: renderExamDay, mistakes: renderMistakePatterns, packet: renderStudyPacket,
      finalreview: renderFinalReview, search: renderSearch }[route] || renderDashboard)();
    main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
    hydrateIcons(main); updateChrome(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function activityMarkup() {
    return Array.from({ length: 14 }, (_, index) => {
      const key = todayKey(index - 13); const count = state.activity[key] || 0;
      return `<span class="activity-day ${count >= 30 ? 'l3' : count >= 15 ? 'l2' : count > 0 ? 'l1' : ''}" title="${key}: ${count} activities"></span>`;
    }).join('');
  }

  function renderPlanner() {
    const today = todayKey();
    let cursorDate = planState.startDate;
    const schedules = planState.phases.map(phase => {
      const schedule = buildPhaseSchedule(phase, cursorDate);
      cursorDate = phase.targetDate;
      return schedule;
    }).filter(Boolean);
    const summaries = planState.phases.map(phase => {
      const entry = CERT_REGISTRY.find(item => item.id === phase.certId);
      return entry ? computeCertSummary(entry) : null;
    });

    let currentFocus = null;
    schedules.forEach(schedule => {
      if (today >= schedule.start && today <= schedule.end) {
        const block = schedule.blocks.find(item => today >= item.start && today <= item.end);
        currentFocus = { schedule, block, inReview: !block && today >= schedule.review.start };
      }
    });

    const phaseCount = planState.phases.length;
    const headerTitle = phaseCount === 0 ? 'Build your certification roadmap' : `Your path to ${phaseCount} certification${phaseCount === 1 ? '' : 's'}`;
    // Only exam-style ("certs") tracks have the domain-weighted cores a phase schedule needs —
    // program tracks like Blender have no quiz/readiness mechanism to build a plan around.
    const planEligibleEntries = CERT_REGISTRY.filter(entry => {
      const group = CERT_GROUPS.find(g => g.id === entry.group);
      return group && group.domain === 'certs';
    });
    const availableEntries = planEligibleEntries.filter(entry => !planState.phases.some(phase => phase.certId === entry.id));
    const lastPlanDate = phaseCount ? planState.phases[phaseCount - 1].targetDate : planState.startDate;

    main.innerHTML = `
      <div class="section-head"><div><h2>${headerTitle}</h2><p>A week-by-week plan built from each exam's published domain weights, sequenced back-to-back toward your target dates.</p></div>${phaseCount ? `<button class="ghost small" data-action="export-plan-ics">${icon('calendar')} Export to calendar</button>` : ''}</div>

      ${currentFocus
        ? `<div class="notice" style="margin-bottom:18px">${icon('flag')}<span><strong>Right now (${formatPlanDate(today)}):</strong> ${currentFocus.inReview ? `Review &amp; mock exams for ${escapeHtml(currentFocus.schedule.cert.name)}` : currentFocus.block ? `${escapeHtml(currentFocus.block.domain.name)} — ${escapeHtml(currentFocus.schedule.cert.name)}` : 'Between phases'}</span></div>`
        : `<div class="notice" style="margin-bottom:18px">${icon('info')}<span>${phaseCount ? `Your plan starts ${formatPlanDate(planState.startDate)}.` : 'No tracks in your plan yet — add one below and pick a target date to auto-generate its schedule.'}</span></div>`}

      ${phaseCount ? `<section class="card-grid" style="margin-bottom:22px">
        ${planState.phases.map((phase, index) => {
          const schedule = schedules[index]; const summary = summaries[index];
          if (!schedule || !summary) return '';
          const daysLeft = daysBetween(today, phase.targetDate);
          const started = today >= schedule.start;
          const over = today > schedule.end;
          const expectedPct = Math.max(0, Math.min(100, Math.round((daysBetween(schedule.start, today) / schedule.totalDays) * 100)));
          const status = !started ? { label: `Starts ${formatPlanDate(schedule.start)}`, tone: '' }
            : over ? (summary.readiness >= 80 ? { label: 'Exam-ready — schedule it', tone: 'teal' } : { label: 'Past target date', tone: 'amber' })
            : (summary.readiness >= expectedPct - 10 ? { label: 'On track', tone: 'teal' } : { label: 'Behind pace', tone: 'amber' });
          return `<article class="mode-card"><span class="stat-icon">${icon('flag')}</span><h3>${escapeHtml(summary.cert.name)}</h3><p>${formatPlanDate(schedule.start)} – ${formatPlanDate(schedule.end)} · ${daysLeft >= 0 ? `${daysLeft} days left` : 'Target date passed'}</p><div class="card-meta"><span class="tag ${status.tone}">${status.label}</span><i class="dot"></i><span>${summary.readiness}% readiness</span></div><div class="progress-track" style="margin-top:10px"><div class="progress-bar" style="width:${summary.readiness}%"></div></div><div class="button-row" style="margin-top:14px"><button class="ghost small" data-action="switch-cert" data-cert-id="${phase.certId}">Open ${escapeHtml(summary.cert.name)} ${icon('arrow')}</button></div></article>`;
        }).join('')}
      </section>` : ''}

      <section class="panel">
        <div class="panel-header"><div><h2>Week-by-week schedule</h2><p>Domains are ordered by exam weight. Each study level has its own recap quiz — the final stretch of each phase is a comprehensive review before the exam.</p></div></div>
        <div class="panel-body">
          ${schedules.map((schedule, index) => `
            <div style="margin-bottom:${index < schedules.length - 1 ? '26px' : '0'}">
              <div class="panel-header" style="padding:0 0 10px"><div><h3>${escapeHtml(schedule.cert.name)}</h3><p>${formatPlanDate(schedule.start)} – ${formatPlanDate(schedule.end)}</p></div></div>
              <div class="mastery-list">
                ${schedule.blocks.map(block => {
                  // Only the currently-active track's own LABS/completedLabs are loaded in memory —
                  // a different track's phase still gets an accurate lab count from its own data
                  // global, just without a live done/total split until it's actually switched into.
                  const isActiveTrack = schedule.entry.id === activeCertId;
                  const trackLabs = isActiveTrack ? LABS : (window[schedule.entry.labsGlobal] || []);
                  const domainLabs = trackLabs.filter(l => l.domain === block.domain.id);
                  const doneCount = isActiveTrack ? domainLabs.filter(l => state.completedLabs[l.id]).length : null;
                  const labTitle = domainLabs.length ? (doneCount != null ? `${doneCount}/${domainLabs.length} labs done` : `${domainLabs.length} lab${domainLabs.length === 1 ? '' : 's'} available`) : '';
                  const labButton = domainLabs.length ? `<button class="quiz-button lab-schedule-button" data-action="plan-domain-labs" data-cert-id="${schedule.entry.id}" data-domain-id="${block.domain.id}" title="${escapeHtml(labTitle)} — ${escapeHtml(block.domain.name)}" aria-label="Labs for ${escapeHtml(block.domain.name)}">${icon('terminal')}</button>` : '';
                  return `<div class="schedule-row"><div class="mastery-label"><strong>${escapeHtml(block.domain.name)}</strong><small>${formatPlanDate(block.start)} – ${formatPlanDate(block.end)} · ${block.days} day${block.days === 1 ? '' : 's'}</small></div><div class="progress-track"><div class="progress-bar" style="width:${block.domain.weight}%"></div></div><span class="mastery-value">${block.domain.weight}%</span><button class="quiz-button" data-action="domain-quiz" data-cert-id="${schedule.entry.id}" data-domain-id="${block.domain.id}" title="Recap quiz: ${escapeHtml(block.domain.name)}" aria-label="Recap quiz for ${escapeHtml(block.domain.name)}">${icon('spark')}</button>${labButton}</div>`;
                }).join('')}
                <div class="schedule-row"><div class="mastery-label"><strong>Review &amp; mock exams</strong><small>${formatPlanDate(schedule.review.start)} – ${formatPlanDate(schedule.review.end)}</small></div><div class="progress-track"><div class="progress-bar" style="width:100%"></div></div><span class="mastery-value">${icon('trophy')}</span><button class="quiz-button" data-action="comprehensive-quiz" data-cert-id="${schedule.entry.id}" title="Comprehensive recap quiz: ${escapeHtml(schedule.cert.name)}" aria-label="Comprehensive recap quiz for ${escapeHtml(schedule.cert.name)}">${icon('spark')}</button></div>
              </div>
            </div>`).join('')}
        </div>
      </section>

      <section class="panel" style="margin-top:22px">
        <div class="panel-header"><div><h2>Adjust your dates</h2><p>Editing a date regenerates the schedule above. Nothing about your saved practice progress changes.</p></div></div>
        <form class="builder" id="plan-builder" style="margin:0;border:0;border-top:1px solid var(--border-soft);border-radius:0;background:transparent">
          <div class="field"><label for="plan-start">Start date</label><input type="date" id="plan-start" value="${planState.startDate}"></div>
          ${planState.phases.map((phase, index) => {
            const entry = CERT_REGISTRY.find(item => item.id === phase.certId);
            const label = entry ? entry.label : phase.certId;
            return `<div class="field" style="display:flex;flex-direction:row;align-items:flex-end;gap:8px">
              <div style="flex:1;min-width:0"><label for="plan-target-${index}">${escapeHtml(label)} target</label><input type="date" id="plan-target-${index}" data-phase-index="${index}" value="${phase.targetDate}"></div>
              <button class="quiz-button" type="button" data-action="remove-plan-phase" data-phase-index="${index}" title="Remove ${escapeHtml(label)} from your plan" aria-label="Remove ${escapeHtml(label)} from your plan">${icon('x')}</button>
            </div>`;
          }).join('')}
          <button class="primary" type="submit">Update plan ${icon('arrow')}</button>
        </form>
        ${availableEntries.length
          ? `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;padding:20px;border-top:1px solid var(--border-soft)">
              <div class="field" style="flex:1;min-width:220px"><label for="plan-add-cert">Add a track to your plan</label><select id="plan-add-cert">${availableEntries.map(entry => `<option value="${entry.id}">${escapeHtml(entry.label)}</option>`).join('')}</select></div>
              <div class="field" style="flex:0 0 170px"><label for="plan-add-date">Target completion date</label><input type="date" id="plan-add-date" value="${addDays(lastPlanDate, 30)}"></div>
              <button class="secondary" type="button" data-action="add-plan-phase">Add to plan ${icon('arrow')}</button>
            </div>`
          : `<div class="notice" style="margin:0 20px 20px;border-top:1px solid var(--border-soft);padding-top:16px">${icon('check')}<span>Every track is already part of your plan.</span></div>`}
      </section>`;
  }

  // Programs have no readiness/accuracy/flashcard signal to show since none of that mechanism
  // exists for them — this is a genuinely different dashboard, not the cert one with numbers
  // hidden, so it gets its own render function rather than conditionals sprinkled through renderDashboard.
  function renderProgramsDashboard() {
    const totalLabs = LABS.length;
    const completed = Object.keys(state.completedLabs).length;
    const nextLab = LABS.find(lab => !state.completedLabs[lab.id]);
    const minutesLogged = Object.entries(state.completedLabs).reduce((sum, [labId]) => sum + (LABS.find(l => l.id === labId)?.minutes || 0), 0);
    const tip = getTipOfTheDay();
    main.innerHTML = `
      ${backupReminderMarkup()}
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${escapeHtml(CERT.name)} · ${LABS.length} hands-on labs</span>
          <h2>Learn by <span>doing</span>, not by answering questions.</h2>
          <p>${Object.values(CERT.cores).flatMap(core => core.domains).length} skill areas, each with guided, interactive practice. No quizzes, no flashcards — just hands-on exercises you work through step by step.</p>
          <div class="button-row">
            <button class="primary" data-route="labs">${icon('terminal')} Browse labs</button>
            ${nextLab ? `<button class="secondary" data-action="start-lab" data-lab="${nextLab.id}">${icon('play')} Continue: ${escapeHtml(nextLab.title)}</button>` : ''}
          </div>
        </div>
        <div class="readiness-card">
          <div class="radial" style="--value:${pct(completed, totalLabs)}"><div class="radial-content"><strong>${completed}/${totalLabs}</strong><small>labs done</small></div></div>
          <div class="readiness-copy"><span class="eyebrow">Hands-on progress</span><h3>${completed === 0 ? 'Just getting started' : completed === totalLabs ? 'All labs complete' : 'Building real skills'}</h3><p>${completed ? `${minutesLogged} minutes of guided practice logged.` : 'Launch your first lab to start building practical skill.'}</p><span class="trend">${icon('arrow')} Practice-weighted</span></div>
        </div>
      </section>

      <section class="stat-grid" aria-label="Study statistics">
        <div class="stat-card"><span class="stat-icon">${icon('terminal')}</span><div class="stat-copy"><strong>${completed}/${totalLabs}</strong><span>Labs completed</span></div></div>
        <div class="stat-card"><span class="stat-icon">${icon('clock')}</span><div class="stat-copy"><strong>${minutesLogged}</strong><span>Minutes practiced</span></div></div>
        <div class="stat-card"><span class="stat-icon">${icon('flame')}</span><div class="stat-copy"><strong>${getStreak()}</strong><span>Day streak</span></div></div>
        <div class="stat-card"><span class="stat-icon">${icon('book')}</span><div class="stat-copy"><strong>${allConcepts().length}</strong><span>Reference terms</span></div></div>
      </section>

      <section class="dashboard-grid">
        <article class="panel">
          <div class="panel-header"><div><h2>Skill areas</h2><p>Each area's hands-on lab coverage.</p></div></div>
          <div class="panel-body"><div class="mastery-list">
            ${Object.values(CERT.cores).flatMap(core => core.domains).map(domain => {
              const domainLabs = LABS.filter(lab => lab.domain === domain.id);
              const domainDone = domainLabs.filter(lab => state.completedLabs[lab.id]).length;
              const domainPct = pct(domainDone, domainLabs.length);
              return `<div class="mastery-row"><div class="mastery-label"><strong>${escapeHtml(domain.name)}</strong><small>${domainLabs.length} lab${domainLabs.length === 1 ? '' : 's'}</small></div><div class="progress-track"><div class="progress-bar" style="width:${domainPct}%"></div></div><span class="mastery-value">${domainDone}/${domainLabs.length}</span></div>`;
            }).join('')}
          </div></div>
        </article>
        <div class="panel">
          <div class="panel-header"><div><h2>Next best move</h2><p>Pick up where you left off.</p></div></div>
          <div class="panel-body">
            <div class="recommend-list">
              ${nextLab ? `<button class="recommend-card" data-action="start-lab" data-lab="${nextLab.id}"><span class="stat-icon">${icon('terminal')}</span><span><strong>${escapeHtml(nextLab.title)}</strong><small>${nextLab.difficulty} · ${nextLab.minutes} min</small></span>${icon('chevron')}</button>` : `<button class="recommend-card" data-route="labs"><span class="stat-icon">${icon('trophy')}</span><span><strong>All labs complete</strong><small>Revisit any lab any time</small></span>${icon('chevron')}</button>`}
              <button class="recommend-card" data-route="glossary"><span class="stat-icon">${icon('book')}</span><span><strong>Browse the glossary</strong><small>${allConcepts().length} reference terms</small></span>${icon('chevron')}</button>
            </div>
            <div class="panel-header" style="padding:22px 0 5px"><div><h3>Last 14 days</h3><p>${getStreak()} day current streak</p></div></div>
            <div class="activity-strip">${activityMarkup()}</div>
          </div>
        </div>
      </section>
      ${state.settings.showTipOfDay !== false && tip ? `<div class="notice teal" style="margin-top:20px">${icon('sparkles')}<span><strong>Tip of the day — ${escapeHtml(tip.term)}:</strong> ${escapeHtml(tip.tip)}</span></div>` : ''}
      ${state.settings.showAllTracks !== false ? allTracksSectionMarkup() : ''}`;
  }

  // Kept deliberately to one hero + one focus panel so the whole page reads in one glance
  // without scrolling — the full domain-by-domain breakdown, the longer recommendation list,
  // the activity history, tip of the day, and the all-tracks list all still exist (Exam Map,
  // Progress, and Settings respectively); this screen only needs to answer two questions:
  // "where do I stand" and "what's the one thing to do right now."
  function renderDashboard() {
    if (currentDomain() === 'programs') return renderProgramsDashboard();
    const readiness = getReadiness();
    const weakest = getWeakDomains(1)[0];
    const recent = state.sessions[0];
    const wkDelta = readinessDelta(7);
    const countdown = examCountdown();
    const trendLabel = (wkDelta != null && wkDelta !== 0) ? `${wkDelta > 0 ? '+' : ''}${wkDelta} pts in 7 days` : 'Evidence-weighted';
    const todaysPlan = getTodaysSessionPlan();
    const dueCount = getDueCards(false).length;
    const flaggedCount = Object.keys(state.flaggedQuestions).length;
    main.innerHTML = `
      ${backupReminderMarkup()}
      ${cramReminderMarkup()}
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${escapeHtml(CERT.name)}${countdown ? ` · exam in ${countdown.days} day${countdown.days === 1 ? '' : 's'}` : ''}</span>
          <h2>${readiness >= 80 ? 'Exam-ready range' : readiness >= 55 ? 'Momentum is building' : 'Build your baseline'}</h2>
          <p>${state.stats.answered ? `${pct(state.stats.firstCorrect, state.stats.answered)}% first-try accuracy · ${getMasteredConcepts()} concepts mastered · ${getStreak()}-day streak` : 'Complete a Quick 10 to establish your first mastery signal.'}</p>
          <div class="button-row">
            <button class="primary" data-action="start-today">${icon('play')} ${escapeHtml(todaysSessionLabel(todaysPlan))}</button>
            <button class="secondary" data-action="quick-practice">${icon('bolt')} Quick 10</button>
          </div>
        </div>
        <div class="readiness-card">
          <div class="radial" style="--value:${readiness}"><div class="radial-content"><strong>${readiness}%</strong><small>readiness</small></div></div>
          <div class="readiness-copy"><span class="trend${wkDelta != null && wkDelta < 0 ? ' down' : ''}">${icon('arrow')} ${trendLabel}</span></div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header"><div><h2>Focus next</h2><p>${weakest ? 'Your lowest-confidence domain right now.' : 'Keep practicing to surface a focus area.'}</p></div><button class="ghost small" data-route="objectives">${icon('arrow')} Full breakdown</button></div>
        <div class="panel-body">
          ${weakest ? `<div class="weak-row"><div class="weak-row-top"><div class="mastery-label"><strong>${escapeHtml(weakest.domain.name)}</strong><small>${weakest.seen ? `${weakest.accuracy}% across ${weakest.seen} attempts` : 'No baseline yet'}</small></div><div class="progress-track"><div class="progress-bar" style="width:${weakest.mastery}%"></div></div><span class="mastery-value">${weakest.mastery}%</span></div><div class="button-row weak-actions"><button class="ghost small" data-action="domain-drill" data-domain="${weakest.domain.id}">${icon('target')} Drill it</button></div></div>` : ''}
          <div class="button-row" style="margin-top:16px;flex-wrap:wrap">
            ${dueCount ? `<button class="ghost small" data-action="start-flash">${icon('layers')} ${dueCount} due</button>` : ''}
            ${flaggedCount ? `<button class="ghost small" data-action="review-flagged">${icon('flag')} ${flaggedCount} flagged</button>` : ''}
            <button class="ghost small" data-route="exams">${icon('clipboard')} Simulate exam</button>
            ${recent ? `<button class="ghost small" data-route="history">${icon('chart')} Last session: ${recent.score}%</button>` : ''}
          </div>
        </div>
      </section>`;
  }

  function domainOptions(coreValue = 'all') {
    const cores = coreValue === 'all' ? Object.values(CERT.cores) : [CERT.cores[coreValue]];
    return `<option value="all">All domains</option>${cores.flatMap(core => core.domains.map(domain => `<option value="${domain.id}">${core.name} · ${domain.name}</option>`)).join('')}`;
  }

  function renderPractice() {
    const missedCount = Object.values(state.questionStats).filter(stat => (stat.seen || 0) > (stat.firstCorrect || 0)).length;
    const flaggedCount = Object.keys(state.flaggedQuestions).length;
    const weakDomains = getWeakDomains(4);
    const weakObjectiveCount = getWeakObjectives(5).length;
    const dueCount = getDueCards(false).length;
    main.innerHTML = `
      <div class="section-head"><div><h2>Choose how you want to train</h2><p>Practice reveals explanations immediately. First attempts always count separately, so second chances help learning without hiding weak spots.</p></div><span class="tag teal">${QUESTIONS.length.toLocaleString()} question forms</span></div>
      <section class="card-grid">
        <article class="mode-card featured"><span class="stat-icon">${icon('bolt')}</span><h3>Quick 10</h3><p>A balanced ten-question set${Object.keys(CERT.cores).length > 1 ? ' across both cores' : ''}. The fastest way to build a daily habit.</p><div class="card-meta"><span>~8 minutes</span><i class="dot"></i><span>Balanced</span></div><div class="button-row"><button class="primary" data-action="quick-practice">Start practice ${icon('arrow')}</button></div></article>
        <article class="mode-card"><span class="stat-icon">${icon('target')}</span><h3>Weak-area trainer</h3><p>Prioritizes domains where your accuracy and practice depth are lowest.</p><div class="card-meta"><span>15 questions</span><i class="dot"></i><span>Adaptive</span></div><div class="button-row"><button class="secondary" data-action="weak-practice">Train weak areas</button></div></article>
        <article class="mode-card"><span class="stat-icon">${icon('bolt')}</span><h3>Adaptive difficulty</h3><p>Gets harder every time you're right, easier every time you're not — finds the real edge of what you know instead of a flat mix.</p><div class="card-meta"><span>15 questions</span><i class="dot"></i><span>Adjusts as you go</span></div><div class="button-row"><button class="secondary" data-action="adaptive-practice">Start adaptive set</button></div></article>
        <article class="mode-card"><span class="stat-icon">${icon('clock')}</span><h3>Spaced review</h3><p>Multiple-choice review of whatever's actually due right now — the same schedule Flashcards uses, so a concept you nailed in a quiz won't resurface early just because you never flipped its card.</p><div class="card-meta"><span>${dueCount} due</span><i class="dot"></i><span>Spaced repetition</span></div><div class="button-row"><button class="secondary" data-action="spaced-review-practice" ${dueCount ? '' : 'disabled'}>Review what's due</button></div></article>
        <article class="mode-card"><span class="stat-icon">${icon('repeat')}</span><h3>Missed-question repair</h3><p>Revisits concepts behind your earlier misses using fresh question forms.</p><div class="card-meta"><span>${missedCount} missed forms</span><i class="dot"></i><span>Targeted</span></div><div class="button-row"><button class="secondary" data-action="missed-practice" ${missedCount ? '' : 'disabled'}>Repair misses</button></div></article>
        <article class="mode-card"><span class="stat-icon">${icon('flag')}</span><h3>Flagged questions</h3><p>The exact questions you flagged for review, across every practice, exam, and recap quiz.</p><div class="card-meta"><span>${flaggedCount} flagged</span><i class="dot"></i><span>Your picks</span></div><div class="button-row"><button class="secondary" data-action="review-flagged" ${flaggedCount ? '' : 'disabled'}>Review flagged</button></div></article>
        <article class="mode-card"><span class="stat-icon">${icon('alert')}</span><h3>Cram session</h3><p>One set combining your flagged questions, weakest objectives, and recent misses — built for the day before your exam.</p><div class="card-meta"><span>${flaggedCount} flagged</span><i class="dot"></i><span>${weakObjectiveCount} weak spots</span></div><div class="button-row"><button class="secondary" data-action="start-cram">${icon('bolt')} Start cram session</button></div></article>
      </section>
      <form class="builder" id="practice-builder">
        <div class="field"><label for="practice-core">Exam core</label><select id="practice-core">${coreSelectOptions()}</select></div>
        <div class="field"><label for="practice-domain">Domain</label><select id="practice-domain">${domainOptions()}</select></div>
        <div class="field"><label for="practice-length">Questions</label><select id="practice-length"><option>10</option><option>20</option><option>30</option><option>50</option></select></div>
        <div class="field"><label>Learning assist</label><div class="toggle-line"><label class="switch"><input id="practice-chance" type="checkbox" ${state.settings.secondChance ? 'checked' : ''}><span></span></label><span>Second chance</span></div></div>
        <button class="primary" type="submit">Build set ${icon('arrow')}</button>
      </form>
      <section class="panel" style="margin-top:22px">
        <div class="panel-header"><div><h2>Weak-area targeting</h2><p>Your lowest-mastery domains right now, with one tap into every study mode for that exact domain.</p></div></div>
        <div class="panel-body"><div class="mastery-list">
          ${weakDomains.map(item => {
            const labsHere = LABS.filter(l => l.domain === item.domain.id);
            const openLabsHere = labsHere.filter(l => !state.completedLabs[l.id]);
            const labLabel = !labsHere.length ? 'Labs' : openLabsHere.length ? `Labs · ${openLabsHere.length} left` : 'Labs · done';
            return `<div class="weak-row">
              <div class="weak-row-top">
                <div class="mastery-label"><strong>${escapeHtml(item.domain.name)}</strong><small>${item.seen ? `${item.accuracy}% accuracy · ${item.seen} attempts` : 'No baseline yet'}</small></div>
                <div class="progress-track"><div class="progress-bar" style="width:${item.mastery}%"></div></div>
                <span class="mastery-value">${item.mastery}%</span>
              </div>
              <div class="button-row weak-actions">
                <button class="ghost small" data-action="weak-domain-quiz" data-domain="${item.domain.id}">${icon('target')} Quiz</button>
                <button class="ghost small" data-action="weak-domain-flash" data-domain="${item.domain.id}">${icon('layers')} Flashcards</button>
                <button class="ghost small" data-action="weak-domain-lab" data-domain="${item.domain.id}" ${labsHere.length ? '' : 'disabled'}>${icon('terminal')} ${labLabel}</button>
              </div>
            </div>`;
          }).join('')}
        </div></div>
      </section>`;
  }

  function renderExams() {
    main.innerHTML = `
      <div class="section-head"><div><h2>${Object.keys(CERT.cores).length > 1 ? `${Object.keys(CERT.cores).length} exams. All required.` : 'One exam. Know it cold.'}</h2><p>Full simulations follow this track's domain weights and timing. Scaled scores shown here are this app's own transparent estimate for learning, not an official score.</p></div></div>
      <section class="exam-grid">
        ${Object.values(CERT.cores).map((core, index) => `<article class="exam-card">
          <div class="exam-card-top"><div><span class="exam-code">${core.code}</span><h2>${core.name}</h2><p>${core.short}</p></div><span class="core-number">0${index + 1}</span></div>
          <div class="exam-details">
            <div class="detail-row"><div class="detail"><strong>${core.maxQuestions}</strong><span>Max questions</span></div><div class="detail"><strong>${core.duration} min</strong><span>Time limit</span></div><div class="detail"><strong>${core.passingScore}</strong><span>Passing score / 900</span></div></div>
            <div class="weight-stack">${core.domains.map(domain => `<div class="weight-line"><span>${domain.number} ${domain.name}</span><div class="progress-track"><div class="progress-bar" style="width:${domain.weight * 3.2}%"></div></div><span>${domain.weight}%</span></div>`).join('')}</div>
            <div class="button-row"><button class="primary" data-action="start-exam" data-core="${core.id}" data-mode="full">Full ${core.maxQuestions}</button><button class="secondary" data-action="start-exam" data-core="${core.id}" data-mode="sprint">${sprintLength(core)}-question sprint</button></div>
          </div>
        </article>`).join('')}
      </section>
      <div class="notice" style="margin-top:18px">${icon('info')}<span>This simulation trains the published knowledge areas and pacing, while the Labs section develops task sequencing and troubleshooting judgment.</span></div>`;
  }

  // Each concept generates several differently-worded question variants (see promptFrames), so a
  // naive random slice of the pool can surface two rewordings of the same fact in one session. This
  // takes at most one question per concept on a first pass — preserving the full pool's depth across
  // sessions over time — and only reuses a concept (picking a leftover variant) if the filtered pool
  // doesn't have enough distinct concepts to reach the requested count.
  function pickDistinctConcepts(pool, n) {
    const seen = new Set(); const primary = []; const leftover = [];
    pool.forEach(question => {
      if (primary.length < n && !seen.has(question.conceptId)) { seen.add(question.conceptId); primary.push(question); }
      else leftover.push(question);
    });
    if (primary.length < n) primary.push(...leftover.slice(0, n - primary.length));
    return primary;
  }

  function sampleQuestions(filter, count, seed = Date.now()) {
    // Suspension only excludes a concept from automatic/random selection — an explicit
    // conceptIds request (e.g. drilling one concept by hand from Browse) bypasses it on
    // purpose, since that's a deliberate choice to test it anyway, not a random draw.
    let source = QUESTIONS.filter(question => (filter.conceptIds || !state.suspendedConcepts[question.conceptId]) && (!filter.core || filter.core === 'all' || question.core === filter.core) && (!filter.domain || filter.domain === 'all' || question.domain === filter.domain));
    if (filter.conceptIds) {
      const idSet = new Set(filter.conceptIds);
      source = source.filter(question => idSet.has(question.conceptId));
    }
    // Single objective group (e.g. "1.2") — pass alongside `domain` from the Exam Map's
    // per-objective drill button. Objective codes repeat across cores, so it's always
    // scoped by domain too.
    if (filter.objective) source = source.filter(question => question.objective === filter.objective);
    if (filter.missed) {
      const missedConcepts = new Set(Object.entries(state.questionStats).filter(([, stat]) => (stat.seen || 0) > (stat.firstCorrect || 0)).map(([id]) => questionById[id]?.conceptId).filter(Boolean));
      source = source.filter(question => missedConcepts.has(question.conceptId));
    }
    if (filter.weak) {
      const ranks = Object.keys(domainById).sort((a, b) => getDomainMetrics(a).mastery - getDomainMetrics(b).mastery);
      const rankMap = Object.fromEntries(ranks.map((id, index) => [id, index]));
      source = seededShuffle(source, seed).sort((a, b) => rankMap[a.domain] - rankMap[b.domain]);
      const focus = pickDistinctConcepts(source, Math.ceil(count * .7));
      const usedConcepts = new Set(focus.map(question => question.conceptId));
      const rest = seededShuffle(source.filter(question => !usedConcepts.has(question.conceptId)), `${seed}-variety`);
      const variety = pickDistinctConcepts(rest, count - focus.length);
      return withFreshOptions([...focus, ...variety].slice(0, count), seed);
    }
    // A softer version of filter.conceptIds: pull from these concepts first (mastery gaps,
    // typically), but still fill out the rest of the requested count from the broader filtered
    // pool instead of stopping short — for a recap quiz that should cover the domain's breadth
    // while still weighting toward what's actually shaky, rather than only ever gap concepts.
    if (filter.priorityConceptIds && filter.priorityConceptIds.length) {
      const prioritySet = new Set(filter.priorityConceptIds);
      const priorityPool = seededShuffle(source.filter(question => prioritySet.has(question.conceptId)), seed);
      // Cap at one question per distinct priority concept, not per question variant — a domain
      // with 3 gap concepts (9 variant objects) should surface 3 different weak spots, not those
      // same 3 concepts rephrased 3 times each while 17 other domain concepts go untouched.
      const distinctPriorityConcepts = new Set(priorityPool.map(question => question.conceptId)).size;
      const focus = pickDistinctConcepts(priorityPool, Math.min(count, distinctPriorityConcepts));
      const usedConcepts = new Set(focus.map(question => question.conceptId));
      const rest = seededShuffle(source.filter(question => !usedConcepts.has(question.conceptId)), `${seed}-rest`);
      const variety = pickDistinctConcepts(rest, count - focus.length);
      return withFreshOptions(seededShuffle([...focus, ...variety], `${seed}-mix`).slice(0, count), seed);
    }
    return withFreshOptions(pickDistinctConcepts(seededShuffle(source, seed), Math.min(count, source.length)), seed);
  }

  function weightedExamQuestions(coreId, count) {
    const core = CERT.cores[coreId]; const selected = []; const seed = Date.now();
    // Divide by the real weight total, not 100 — otherwise a track whose weights sum to
    // e.g. 106 produces a 90-question exam with 91+ questions.
    const totalWeight = core.domains.reduce((sum, domain) => sum + (domain.weight || 0), 0) || 1;
    const allocation = core.domains.map(domain => ({ domain, exact: count * domain.weight / totalWeight, total: Math.floor(count * domain.weight / totalWeight) }));
    let remaining = count - allocation.reduce((sum, item) => sum + item.total, 0);
    allocation.sort((a, b) => (b.exact - b.total) - (a.exact - a.total)).forEach(item => { if (remaining-- > 0) item.total++; });
    allocation.forEach(item => selected.push(...sampleQuestions({ core: coreId, domain: item.domain.id }, item.total, `${seed}-${item.domain.id}`)));
    return seededShuffle(selected, `${seed}-exam`);
  }

  // This track's questions carry a `difficulty` field, but with questionVariants set to 1
  // everywhere in this app, every concept only ever generates its variant-0 ("Foundational")
  // form — there's no actual harder/easier reworded version of a question to escalate into.
  // Real, personalized difficulty instead comes from YOUR OWN accuracy on a concept: one
  // you've gotten wrong more than right is genuinely harder for you than one you've aced,
  // and a never-attempted concept sits at a neutral middle ground. 0 = easiest (high personal
  // accuracy), 1 = hardest (low personal accuracy or never attempted... — see below).
  function personalDifficulty(stats) {
    if (!stats || !stats.seen) return 0.5;
    return 1 - (stats.correct / stats.seen);
  }

  function adaptiveLevelLabel(target) {
    if (target < 0.4) return { label: 'Easier', tone: '' };
    if (target < 0.65) return { label: 'Standard', tone: '' };
    return { label: 'Harder', tone: 'amber' };
  }

  // Scores every not-yet-used concept by how close its personal difficulty sits to the
  // current target, then picks (seeded) from a small shortlist of the closest matches rather
  // than always the single nearest one — otherwise, once a couple of concepts sit exactly at
  // the target, every adaptive session would keep circling back to the same handful.
  function pickAdaptiveQuestion(pool, usedConceptIds, target, conceptStats, seed) {
    const candidates = pool.filter(q => !usedConceptIds.has(q.conceptId));
    if (!candidates.length) return null;
    const scored = candidates
      .map(q => ({ q, dist: Math.abs(personalDifficulty(conceptStats[q.conceptId]) - target) }))
      .sort((a, b) => a.dist - b.dist);
    const shortlist = scored.slice(0, Math.min(8, scored.length)).map(s => s.q);
    return seededShuffle(shortlist, seed)[0];
  }

  // Live, per-answer difficulty adjustment instead of a fixed-difficulty-mix set decided up
  // front — a right answer raises the target toward concepts you know less well, a wrong one
  // lowers it toward ones you've historically had more success with, so the session tracks the
  // real edge of what you know instead of a flat random mix. Each concept is still asked at
  // most once per session (same rule sampleQuestions already follows elsewhere).
  function startAdaptivePractice(options = {}) {
    const count = Math.min(50, Math.max(5, Number(options.count || 15)));
    const pool = QUESTIONS.filter(q => !state.suspendedConcepts[q.conceptId] && (!options.core || options.core === 'all' || q.core === options.core) && (!options.domain || options.domain === 'all' || q.domain === options.domain));
    if (!pool.length) { toast('No matching questions are available yet.', 'error'); return; }
    const sessionId = `session-${Date.now()}`;
    const conceptStats = conceptStatsMap();
    const startTarget = 0.5;
    const opener = pickAdaptiveQuestion(pool, new Set(), startTarget, conceptStats, `${sessionId}-0`);
    const first = withFreshOptions([opener], `${sessionId}-0`)[0];
    const questions = new Array(count).fill(null); questions[0] = first;
    activeSession = {
      id: sessionId, source: 'practice', mode: options.mode || 'Adaptive difficulty', adaptive: true,
      adaptivePool: pool, adaptiveTarget: startTarget, adaptiveConceptStats: conceptStats,
      questions, index: 0, responses: new Array(count).fill(null), startedAt: Date.now(),
      secondChance: options.secondChance ?? state.settings.secondChance
    };
    navigate('practice');
  }

  // Called right before advancing past the question just answered — picks what fills the
  // *next* slot, so by the time nextQuestion() increments session.index, it's already there.
  function fillNextAdaptiveQuestion(session) {
    const last = session.responses[session.index];
    if (last?.firstCorrect) session.adaptiveTarget = Math.min(1, session.adaptiveTarget + 0.15);
    else if (last) session.adaptiveTarget = Math.max(0, session.adaptiveTarget - 0.15);
    const usedConcepts = new Set(session.questions.filter(Boolean).map(q => q.conceptId));
    const nextIndex = session.index + 1;
    const picked = pickAdaptiveQuestion(session.adaptivePool, usedConcepts, session.adaptiveTarget, session.adaptiveConceptStats, `${session.id}-${nextIndex}`);
    if (!picked) { session.questions[nextIndex] = session.questions[session.index]; return; }
    session.questions[nextIndex] = withFreshOptions([picked], `${session.id}-${nextIndex}`)[0];
  }

  // Whatever's actually due — regardless of whether it was ever seen as a flashcard — reused as
  // a normal multiple-choice practice set instead of a flip-card review. getDueCards(false)
  // excludes never-scheduled concepts, matching the Dashboard's "today's plan" due check.
  function startSpacedReviewPractice() {
    const due = getDueCards(false);
    if (!due.length) { toast("Nothing due for review right now — you're caught up.", 'error'); return; }
    startPractice({ count: Math.min(20, due.length), conceptIds: due.map(concept => concept.id), mode: 'Spaced review' });
  }

  function startPractice(options = {}) {
    const count = Number(options.count || 10);
    const questions = sampleQuestions(options, count);
    if (!questions.length) { toast('No matching questions are available yet.', 'error'); return; }
    activeSession = {
      id: `session-${Date.now()}`, source: 'practice', mode: options.mode || 'Practice', questions,
      index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: options.secondChance ?? state.settings.secondChance
    };
    navigate('practice');
  }

  // One button that picks the single best next action instead of making you choose between
  // Quick 10 / Flashcards / Weak-area trainer yourself: due flashcards first (spaced repetition
  // already decided these need attention today), else today's Planner block for this track (if
  // one's scheduled), else the weakest domain, else a plain Quick 10 — always something concrete,
  // never a dead end. The label and the click handler share this one decision so they can't
  // ever disagree about what "today's session" means.
  function getTodaysSessionPlan() {
    const due = getDueCards(false);
    if (due.length) return { kind: 'flashcards', due };
    const focus = getActiveTrackPlanFocus();
    if (focus && focus.block) return { kind: 'domain', domain: focus.block.domain, fromPlan: true };
    const weakest = getWeakDomains(1)[0];
    if (weakest) return { kind: 'domain', domain: weakest.domain, fromPlan: false };
    return { kind: 'quick10' };
  }

  function todaysSessionLabel(plan) {
    if (plan.kind === 'flashcards') return `Review ${plan.due.length} due card${plan.due.length === 1 ? '' : 's'}`;
    if (plan.kind === 'domain') return plan.fromPlan ? `Continue: ${plan.domain.name}` : `Practice ${plan.domain.name}`;
    return 'Start quick practice';
  }

  function startTodaysSession() {
    const plan = getTodaysSessionPlan();
    if (plan.kind === 'flashcards') startFlashcards({ core: 'all', domain: 'all', count: Math.min(30, plan.due.length), mode: 'flip' });
    else if (plan.kind === 'domain') startPractice({ count: 15, domain: plan.domain.id, mode: `${plan.domain.name}${plan.fromPlan ? ' — today\'s plan' : ' drill'}` });
    else startPractice({ count: 10, mode: 'Quick 10' });
  }

  // Practices every concept that hasn't cleared the mastery bar yet — one question per concept, so
  // a full run genuinely covers every remaining gap rather than a random sample that could skip some.
  // Pass a domainId to scope it to one domain's card on the Exam Map, or omit it to cover every
  // domain in the currently viewed core at once.
  function startGapPractice(domainId) {
    const domains = domainId ? [domainId] : CERT.cores[objectiveCore].domains.map(domain => domain.id);
    const gaps = domains.flatMap(id => unmasteredConcepts(id));
    if (!gaps.length) { toast('Every concept here is already mastered!'); return; }
    const conceptIds = gaps.map(item => item.concept.id);
    const questions = sampleQuestions({ conceptIds }, conceptIds.length);
    const label = domainId ? domainById[domainId].name : CERT.cores[objectiveCore].name;
    activeSession = {
      id: `gaps-${Date.now()}`, source: 'practice', mode: `${label} — remaining concepts`, questions,
      index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: state.settings.secondChance
    };
    navigate('practice');
  }

  // "Exam-eve" review: one session combining everything that actually matters right before a
  // real attempt — the exact questions you flagged (kept verbatim, like startFlaggedReview),
  // plus fresh forms for your weakest objectives' concepts and whatever you missed on your last
  // completed attempt (via priorityConceptIds, which still backfills variety if there aren't
  // enough gap concepts to fill the set) — rather than a plain random practice set.
  function startCramSession() {
    const flaggedQuestions = Object.keys(state.flaggedQuestions).map(id => questionById[id]).filter(Boolean);
    const flaggedConceptIds = new Set(flaggedQuestions.map(q => q.conceptId));
    const weakConceptIds = getWeakObjectives(5).flatMap(row => CONCEPTS.filter(c => c.domain === row.domain.id && c.objective === row.objective.code).map(c => c.id));
    const missedConceptIds = Object.values(lastResultsMissed).flat();
    const priorityConceptIds = [...new Set([...weakConceptIds, ...missedConceptIds])].filter(id => !flaggedConceptIds.has(id));
    const seed = Date.now();
    const targetCount = 25;
    const remainingSlots = Math.max(0, targetCount - flaggedQuestions.length);
    const sampled = remainingSlots ? sampleQuestions(priorityConceptIds.length ? { priorityConceptIds } : { weak: true }, remainingSlots, seed) : [];
    if (!flaggedQuestions.length && !sampled.length) { toast('Nothing to cram yet — flag a question, or come back after a practice session.', 'error'); return; }
    const questions = seededShuffle([...withFreshOptions(flaggedQuestions, seed), ...sampled], `${seed}-cram`);
    activeSession = {
      id: `cram-${seed}`, source: 'practice', mode: 'Cram session', questions,
      index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: state.settings.secondChance
    };
    navigate('practice');
  }

  // Redo exactly what went wrong on the most recently completed session — not the broader
  // mastery-wide gap list startGapPractice pulls from, but the specific concepts missed on
  // that one attempt (which can include concepts that are otherwise "mastered"). Pass a
  // domainId to scope to one domain's row on the results screen, or 'all'/omit for every
  // domain missed in that attempt.
  function startMissedPractice(domainId) {
    const conceptIds = domainId && domainId !== 'all' ? (lastResultsMissed[domainId] || []) : Object.values(lastResultsMissed).flat();
    if (!conceptIds.length) { toast('Nothing missed there — nice.'); return; }
    const questions = sampleQuestions({ conceptIds }, conceptIds.length);
    const label = domainId && domainId !== 'all' ? `${domainById[domainId].name} — missed last attempt` : 'Missed on last attempt';
    activeSession = {
      id: `missed-${Date.now()}`, source: 'practice', mode: label, questions,
      index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(),
      secondChance: state.settings.secondChance
    };
    navigate('practice');
  }

  function sprintLength(core) { return Math.max(10, Math.round(core.maxQuestions * 0.25)); }

  // Fullscreen is browser-gated behind a real user gesture — these must be called synchronously
  // from within a click handler's own call stack (never after an await), so requestExamFullscreen
  // is called directly from startExam()/the manual toggle button, not from anything async.
  function requestExamFullscreen() {
    const el = document.documentElement;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!request) return;
    try { request.call(el)?.catch(() => {}); } catch {}
  }
  function exitFullscreenIfActive() {
    if (!document.fullscreenElement) return;
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (!exit) return;
    try { exit.call(document)?.catch(() => {}); } catch {}
  }

  function startExam(coreId, mode) {
    const core = CERT.cores[coreId];
    const full = mode === 'full';
    const length = full ? core.maxQuestions : sprintLength(core);
    const durationSeconds = full ? core.duration * 60 : Math.max(600, Math.round(core.duration * 60 * (length / core.maxQuestions)));
    activeSession = {
      id: `exam-${Date.now()}`, source: 'exams', mode: `${core.name} ${full ? 'simulation' : 'sprint'}`,
      core: coreId, questions: weightedExamQuestions(coreId, length), index: 0,
      responses: Array(length).fill(null), startedAt: Date.now(), durationSeconds,
      secondChance: false, scratchpadOpen: false, scratchpadText: ''
    };
    if (state.settings.fullscreenExams) requestExamFullscreen();
    navigate('exams');
  }

  function renderQuiz() {
    if (!activeSession) return renderRoute();
    // Every real re-render (next question, choosing an answer, flagging) replaces or updates the
    // question on screen — any speech from before is now describing stale content.
    stopSpeakOnce();
    const session = activeSession; const question = session.questions[session.index]; const response = session.responses[session.index];
    // A diagnostic answers like an exam (pick, no explanation, advance manually) but keeps the
    // relaxed count-up timer of practice — `quizLike` covers the exam-style answer flow,
    // `examMode` stays reserved for the real timed countdown.
    const examMode = session.source === 'exams'; const quizLike = examMode || session.diagnostic;
    const progress = Math.round((session.index / session.questions.length) * 100);
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const remaining = examMode ? Math.max(0, session.durationSeconds - elapsed) : elapsed;
    const domain = domainById[question.domain]; const core = CERT.cores[question.core];
    main.innerHTML = `<section class="quiz-shell">
      <div class="quiz-top">
        <div class="quiz-progress"><div class="quiz-progress-meta"><span>${escapeHtml(session.mode)}</span><span>${session.index + 1} of ${session.questions.length}</span></div><div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div></div>
        <div class="timer ${examMode && remaining < 300 ? 'warning' : ''}" id="quiz-timer">${icon('clock')}<span>${formatDuration(remaining)}</span></div>
        <button class="icon-button small" type="button" data-action="speak-question" aria-label="Read question aloud">${icon('play')}</button>
        ${examMode ? `<button class="icon-button small ${session.scratchpadOpen ? 'flag-active' : ''}" type="button" data-action="toggle-scratchpad" aria-label="Toggle scratchpad">${icon('edit')}</button><button class="icon-button small" type="button" data-action="toggle-fullscreen" aria-label="Toggle fullscreen">${icon('maximize')}</button>` : ''}
        <button class="ghost small" data-action="exit-session">Exit session</button>
      </div>
      ${examMode && session.scratchpadOpen ? `<div class="scratchpad-panel"><div class="scratchpad-head"><span>${icon('edit')} Scratchpad</span><div class="button-row"><button class="ghost small" type="button" data-action="clear-scratchpad">Clear</button><button class="icon-button small" type="button" data-action="toggle-scratchpad" aria-label="Close scratchpad">${icon('x')}</button></div></div><textarea id="exam-scratchpad" placeholder="Scratch work — cleared when this exam ends, same as the real thing.">${escapeHtml(session.scratchpadText || '')}</textarea></div>` : ''}
      <article class="question-card">
        <div class="question-meta"><span class="tag teal">${core.name}</span><span class="tag">${domain.number} ${domain.name}</span><span class="tag">Objective ${question.objective}</span>${session.adaptive ? (({ label, tone }) => `<span class="tag ${tone}">${label}</span>`)(adaptiveLevelLabel(session.adaptiveTarget)) : `<span class="tag ${question.difficulty === 'Challenge' ? 'amber' : ''}">${question.difficulty}</span>`}</div>
        <h2>${escapeHtml(question.prompt)}</h2>
        <div class="answer-list">
          ${question.options.map((option, index) => {
            const selected = response?.selected === index || response?.attempts?.includes(index);
            const revealed = response?.finalized && !quizLike;
            const classNames = ['answer-option', selected ? 'selected' : '', revealed && index === question.correct ? 'correct' : '', revealed && selected && index !== question.correct ? 'incorrect' : ''].filter(Boolean).join(' ');
            const disabled = (revealed || (response?.attempts || []).includes(index)) ? 'disabled' : '';
            // correct/incorrect is otherwise only conveyed by colour + an aria-hidden icon
            const stateNote = revealed
              ? (index === question.correct ? '<span class="visually-hidden"> — correct answer</span>'
                : (response?.selected === index ? '<span class="visually-hidden"> — your answer, incorrect</span>' : ''))
              : '';
            const revealIcon = revealed && index === question.correct ? icon('check') : revealed && selected && index !== question.correct ? icon('x') : '';
            return `<button class="${classNames}" data-answer="${index}" aria-pressed="${selected ? 'true' : 'false'}" ${disabled}><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}${stateNote}</span>${revealIcon}</button>`;
          }).join('')}
        </div>
        ${response?.secondChance && !response.finalized ? `<div class="explanation second-chance"><strong>Take another look.</strong><p>That was not the best answer. Your first attempt is recorded, but you have one chance to correct it before the explanation appears.</p></div>` : ''}
        ${response?.finalized && !quizLike ? `<div class="explanation"><strong>${response.firstCorrect ? 'Exactly right.' : response.corrected ? 'Corrected on the second chance.' : 'Review this distinction.'}</strong><p>${escapeHtml(question.explanation)}</p>${conceptById[question.conceptId]?.diagram ? `<div class="concept-diagram" style="max-width:360px">${conceptById[question.conceptId].diagram}</div>` : ''}</div>${response.firstCorrect ? (response.confidence ? `<p class="confidence-logged">${icon(response.confidence === 'guessed' ? 'alert' : 'check')} ${response.confidence === 'guessed' ? "Logged as a guess — it'll surface on your readiness report." : 'Logged — you knew that one.'}</p>` : `<div class="confidence-check"><span>Honestly — did you know that, or guess?</span><div class="button-row"><button class="ghost small" data-action="tag-confidence" data-value="knew">${icon('check')} Knew it</button><button class="ghost small" data-action="tag-confidence" data-value="guessed">${icon('alert')} Guessed</button></div></div>`) : ''}${noteAffordanceMarkup(question.conceptId)}` : ''}
        <div class="question-actions">
          <button class="ghost ${state.flaggedQuestions[question.id] ? 'flag-active' : ''}" data-action="flag-question">${icon('flag')} ${state.flaggedQuestions[question.id] ? 'Flagged for study' : 'Flag for review'}</button>
          ${quizLike ? `<button class="primary" data-action="next-question">${session.index === session.questions.length - 1 ? (examMode ? 'Review & submit' : 'Finish diagnostic') : 'Next question'} ${icon('arrow')}</button>` : `<button class="primary" data-action="next-question" ${response?.finalized ? '' : 'disabled'}>${session.index === session.questions.length - 1 ? 'Finish session' : 'Next question'} ${icon('arrow')}</button>`}
        </div>
      </article>
      ${quizLike ? `<div class="quiz-palette">${session.questions.map((q, index) => `<button class="palette-dot ${index === session.index ? 'current' : ''} ${session.responses[index]?.selected !== undefined ? 'done' : ''} ${state.flaggedQuestions[q.id] ? 'flagged' : ''}" data-jump="${index}">${index + 1}</button>`).join('')}</div>` : ''}
    </section>`;
    hydrateIcons(main);
    // renderQuiz() runs on every interaction (answer, next, flag), so the previous
    // interval has to be cleared here too — otherwise timers from earlier questions
    // (or even a previous session) keep running and racing to update the same clock.
    clearInterval(timerHandle);
    const sessionAtRender = activeSession;
    timerHandle = setInterval(() => {
      const timer = document.getElementById('quiz-timer');
      if (!timer || activeSession !== sessionAtRender) return clearInterval(timerHandle);
      const seconds = Math.floor((Date.now() - activeSession.startedAt) / 1000);
      const value = examMode ? Math.max(0, activeSession.durationSeconds - seconds) : seconds;
      // Update just the number, not the whole element — rebuilding the icon via
      // innerHTML every second was unnecessary DOM churn and a visible flicker source.
      const label = timer.querySelector('span');
      if (label) label.textContent = formatDuration(value);
      if (examMode && value <= 0) finishSession(true);
      if (examMode) timer.classList.toggle('warning', value < 300);
    }, 1000);
  }

  // Lazily created on first use (inside a real click/key handler, so it always starts from a
  // genuine user gesture — browsers refuse to let audio autoplay otherwise) and reused after
  // that. Synthesized tones, not audio files, so this stays consistent with the app's
  // zero-dependency, fully-offline design — nothing to download, nothing to go stale.
  let audioCtx = null;
  function playAnswerSound(correct) {
    if (!state.settings.soundEffects) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      const duration = correct ? .22 : .18;
      if (correct) { osc.frequency.setValueAtTime(660, now); osc.frequency.setValueAtTime(880, now + .09); }
      else osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.15, now + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.start(now); osc.stop(now + duration);
    } catch {}
  }

  // Single-utterance read-aloud for quiz questions and flashcards — deliberately NOT the guide's
  // segmented queue (speakChapter/buildSpeechSegments), which exists to support pause/resume and
  // an in-page progress bar across a whole multi-paragraph chapter. A quiz question or a
  // flashcard face is short enough that "speak it, or cancel and speak the next one" is the
  // entire interaction a screen-reader-alternative needs here.
  function speakOnce(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = state.settings.speechRate || 1;
    window.speechSynthesis.speak(utterance);
  }
  function stopSpeakOnce() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }

  function speakCurrentQuestion() {
    if (!activeSession) return;
    const question = activeSession.questions[activeSession.index];
    speakOnce([question.prompt, ...question.options.map((opt, i) => `${letters[i]}. ${opt}`)].join('. '));
  }

  function speakCurrentFlashcard() {
    if (!flashSession) return;
    const session = flashSession; const concept = session.cards[session.index];
    if (session.mode === 'recall') { speakOnce(concept.term); return; }
    speakOnce(session.flipped ? [concept.term, concept.definition, concept.scenario].filter(Boolean).join('. ') : concept.term);
  }

  function chooseAnswer(index) {
    const session = activeSession; if (!session) return;
    const question = session.questions[session.index]; const quizLike = session.source === 'exams' || session.diagnostic;
    if (quizLike) { session.responses[session.index] = { selected: index, firstCorrect: index === question.correct }; renderQuiz(); return; }
    let response = session.responses[session.index];
    if (response?.finalized) return;
    if (!response) response = { attempts: [] };
    response.attempts.push(index); response.selected = index;
    const isCorrect = index === question.correct;
    if (!isCorrect && session.secondChance && response.attempts.length === 1) {
      response.firstCorrect = false; response.secondChance = true; session.responses[session.index] = response;
      announce('Not the best answer. You have one chance to correct it.');
      playAnswerSound(false);
      renderQuiz(); return;
    }
    response.finalized = true; response.firstCorrect = response.attempts.length === 1 && isCorrect;
    response.corrected = isCorrect && !response.firstCorrect; response.selected = index; response.secondChance = false;
    session.responses[session.index] = response;
    announce(response.firstCorrect ? 'Correct.' : response.corrected ? 'Corrected on the second chance.' : `Incorrect. The correct answer is ${letters[question.correct]}.`);
    playAnswerSound(isCorrect);
    recordAnswer(question, response); renderQuiz();
  }

  function recordAnswer(question, response) {
    const stat = state.questionStats[question.id] ||= { seen: 0, firstCorrect: 0, corrected: 0 };
    stat.seen++; if (response.firstCorrect) stat.firstCorrect++; if (response.corrected) stat.corrected++;
    stat.lastSeen = new Date().toISOString();
    state.stats.answered++; if (response.firstCorrect) state.stats.firstCorrect++; if (response.corrected) state.stats.corrected++;
    state.activity[todayKey()] = (state.activity[todayKey()] || 0) + 1;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, getStreak()); saveState();
    // A quiz question is a review of that concept exactly as much as flipping a flashcard is —
    // first-try-correct maps to "good", corrected-on-a-second-chance to "hard" (it wasn't free
    // recall), and a wrong answer to "again". Never "easy": that grade means "I don't need this
    // again soon," and a system that can't ask a follow-up question shouldn't hand that out —
    // only the flashcard's own explicit self-rating does.
    scheduleReview(question.conceptId, response.firstCorrect ? 'good' : response.corrected ? 'hard' : 'again');
    checkMilestones();
  }

  // A right answer on the first attempt already counts fully toward mastery — but "right
  // because I actually knew it" and "right because I guessed" are very different signals that
  // firstCorrect alone can't tell apart. Only worth asking on a first-attempt correct answer:
  // a wrong answer needs no confidence check (it already docks mastery, guessed or not), and a
  // second-chance correction isn't a first-attempt result at all.
  function tagConfidence(value) {
    const session = activeSession; if (!session) return;
    const response = session.responses[session.index];
    if (!response || !response.finalized || !response.firstCorrect || response.confidence) return;
    response.confidence = value;
    if (value === 'guessed') {
      const question = session.questions[session.index];
      const stat = state.questionStats[question.id] ||= { seen: 0, firstCorrect: 0, corrected: 0 };
      stat.guessedRight = (stat.guessedRight || 0) + 1;
      saveState();
    }
    renderQuiz();
  }

  // Concepts answered right on the first attempt at least once while tagged "guessed" —
  // deduped and summed by concept (several question forms share one concept), ranked worst
  // first. The blind spot this catches: a domain can read as "mastered" purely on accuracy
  // while several of those correct answers were actually lucky guesses.
  function getShakyWins(limit = 5) {
    const byConcept = {};
    Object.entries(state.questionStats).forEach(([id, stat]) => {
      if (!stat.guessedRight) return;
      const question = questionById[id]; if (!question) return;
      const entry = byConcept[question.conceptId] ||= { concept: conceptById[question.conceptId], guessedRight: 0 };
      entry.guessedRight += stat.guessedRight;
    });
    return Object.values(byConcept).filter(row => row.concept).sort((a, b) => b.guessedRight - a.guessedRight).slice(0, limit);
  }

  // Flashcards already have spaced-repetition scheduling to catch fading recall, but quiz-based
  // mastery never decays once earned — a concept mastered months ago and never revisited still
  // reads as "mastered" forever. Surfaces mastered concepts whose most recent attempt (across all
  // question forms sharing that concept) is older than `days`, ranked stalest-first, so quiet
  // knowledge fade shows up the same way confidence-tagging surfaces lucky guesses.
  function getStaleMasteredConcepts(days = 30, limit = 5) {
    const stats = conceptStatsMap();
    const lastSeenByConcept = {};
    Object.entries(state.questionStats).forEach(([id, stat]) => {
      const question = questionById[id];
      if (!question || !stat.lastSeen) return;
      const seenAt = new Date(stat.lastSeen).getTime();
      if (!lastSeenByConcept[question.conceptId] || seenAt > lastSeenByConcept[question.conceptId]) {
        lastSeenByConcept[question.conceptId] = seenAt;
      }
    });
    const cutoff = Date.now() - days * 86400000;
    return CONCEPTS
      .filter(concept => isConceptMastered(stats[concept.id] || { seen: 0, correct: 0 }))
      .map(concept => ({ concept, lastSeen: lastSeenByConcept[concept.id] || 0 }))
      .filter(row => row.lastSeen && row.lastSeen < cutoff)
      .map(row => ({ concept: row.concept, daysSince: Math.floor((Date.now() - row.lastSeen) / 86400000) }))
      .sort((a, b) => b.daysSince - a.daysSince)
      .slice(0, limit);
  }

  // ---------- Mistake-pattern mining ----------
  // A domain mastery percentage says WHERE you're weak; this looks at HOW you're actually
  // getting things wrong — mined from the last 25 sessions' full per-question review detail
  // (finishSession keeps `review` only on the most recent 25, so this is a recent-behavior
  // signal, not a lifetime one — which is arguably what you want for "what's tripping me up
  // right now" anyway).
  function getRecentReviewEntries() {
    return state.sessions.flatMap(session => (session.review || []).map(entry => ({ ...entry, sessionDate: session.date })));
  }

  // Two specific answer choices that keep getting swapped for each other — not just "you got
  // this concept wrong sometimes", but "you specifically keep picking B when the answer is C."
  // Unordered pair (A can be the correct answer in one miss and the wrong pick in another) since
  // either direction is the same underlying confusion. Requires 2+ occurrences so one fluke
  // wrong click doesn't read as a "pattern."
  function getConfusionPairs(limit = 6) {
    const misses = getRecentReviewEntries().filter(entry => !entry.firstCorrect && entry.selected != null && Array.isArray(entry.options));
    const byKey = new Map();
    misses.forEach(entry => {
      const wrongText = entry.options[entry.selected]; const correctText = entry.options[entry.correct];
      if (!wrongText || !correctText || wrongText === correctText) return;
      const key = [wrongText, correctText].sort().join(' ||| ');
      if (!byKey.has(key)) { const [a, b] = key.split(' ||| '); byKey.set(key, { a, b, count: 0, conceptId: entry.conceptId, domain: entry.domain }); }
      byKey.get(key).count++;
    });
    return [...byKey.values()].filter(row => row.count >= 2).sort((a, b) => b.count - a.count).slice(0, limit);
  }

  // Does HOW a question is worded correlate with missing it, independent of which concept it's
  // testing? A technician who reliably knows the material can still get tripped up specifically
  // by negative phrasing ("which is NOT...") or by a "BEST fit" question when several options are
  // technically defensible. Needs a real sample per style (5+) before a miss rate means anything.
  const MISTAKE_PHRASING_PATTERNS = [
    { id: 'negative', label: 'Negative phrasing ("NOT" / "EXCEPT")', test: p => /\b(NOT|EXCEPT)\b/.test(p) },
    { id: 'best-fit', label: '"BEST fit" framing', test: p => /\bBEST\b/.test(p) },
    { id: 'most-likely', label: '"MOST likely" framing', test: p => /\bMOST likely\b/i.test(p) },
    { id: 'first-step', label: '"FIRST" / next-step framing', test: p => /\bFIRST\b/.test(p) }
  ];

  function getPhrasingPatternStats() {
    const entries = getRecentReviewEntries();
    return MISTAKE_PHRASING_PATTERNS.map(pattern => {
      const matches = entries.filter(entry => pattern.test(entry.prompt || ''));
      const missed = matches.filter(entry => !entry.firstCorrect).length;
      return { ...pattern, seen: matches.length, missed, missRate: matches.length ? Math.round((missed / matches.length) * 100) : null };
    }).filter(row => row.seen >= 5).sort((a, b) => b.missRate - a.missRate);
  }

  function nextQuestion() {
    if (!activeSession) return;
    const session = activeSession; const response = session.responses[session.index];
    if (session.source === 'practice' && !session.diagnostic && !response?.finalized) return;
    if (session.index < session.questions.length - 1) {
      if (session.adaptive) fillNextAdaptiveQuestion(session);
      session.index++; renderQuiz();
    }
    else if (session.source === 'exams') showExamReview(); else finishSession();
  }

  // A real review screen, not just a text count — every question as its own jump target,
  // color-coded exactly like OnVUE's own review grid (unanswered vs. flagged vs. answered), so
  // you can go straight to what's actually unresolved instead of paging through in order.
  function showExamReview() {
    const session = activeSession; const answered = session.responses.filter(Boolean).length;
    const blank = session.questions.length - answered;
    const flaggedCount = session.questions.filter(q => state.flaggedQuestions[q.id]).length;
    const grid = session.questions.map((q, index) => {
      const done = session.responses[index]?.selected !== undefined;
      const flagged = state.flaggedQuestions[q.id];
      return `<button type="button" class="palette-dot ${done ? 'done' : ''} ${flagged ? 'flagged' : ''}" data-jump="${index}" title="Question ${index + 1}${done ? '' : ' — unanswered'}${flagged ? ' — flagged' : ''}">${index + 1}</button>`;
    }).join('');
    openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><h2 id="review-title">Submit this simulation?</h2><p>${blank ? `${blank} question${blank === 1 ? '' : 's'} still blank` : 'Every question has a response'}${flaggedCount ? ` · ${flaggedCount} flagged for review` : ''}. Click any number to jump straight to it.</p><div class="quiz-palette" style="margin:14px 0">${grid}</div><div class="button-row"><button class="primary" data-action="submit-exam">Submit & score</button><button class="secondary" data-action="close-dialog">Keep reviewing</button></div></div>`);
  }

  function finishSession(timedOut = false) {
    clearInterval(timerHandle); timerHandle = null;
    exitFullscreenIfActive();
    stopSpeakOnce();
    const session = activeSession; if (!session) return;
    if (session.source === 'exams' || session.diagnostic) {
      session.questions.forEach((question, index) => {
        const response = session.responses[index] || { selected: null, firstCorrect: false };
        response.finalized = true; response.firstCorrect = response.selected === question.correct;
        session.responses[index] = response; recordAnswer(question, response);
      });
    }
    const correct = session.responses.filter(response => response?.firstCorrect).length;
    const corrected = session.responses.filter(response => response?.corrected).length;
    const score = pct(correct, session.questions.length);
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const history = {
      id: session.id, date: new Date().toISOString(), type: session.source, label: session.mode,
      core: session.core || 'both', total: session.questions.length, correct, corrected, score, elapsed,
      scaled: session.source === 'exams' ? 100 + Math.round(score * 8) : null, timedOut,
      domains: {}
    };
    session.questions.forEach((question, index) => {
      const entry = history.domains[question.domain] ||= { total: 0, correct: 0 };
      entry.total++; if (session.responses[index]?.firstCorrect) entry.correct++;
    });
    // Per-question detail so this attempt can be reopened later from the History page, not
    // just glanced at once on the results screen. Kept only on the most recent 25 sessions
    // (stripped below) so a run of 90-question exams can't bloat progress.json without bound.
    history.review = session.questions.map((question, index) => {
      const resp = session.responses[index] || {};
      return {
        qid: question.id, conceptId: question.conceptId, domain: question.domain, objective: question.objective,
        prompt: question.prompt, options: question.options, correct: question.correct,
        selected: resp.selected != null ? resp.selected : null,
        firstCorrect: !!resp.firstCorrect, corrected: !!resp.corrected,
        answer: question.answer, explanation: question.explanation
      };
    });
    state.sessions.unshift(history);
    state.sessions = state.sessions.slice(0, 100);
    state.sessions.forEach((entry, index) => { if (index >= 25 && entry.review) delete entry.review; });
    saveState();
    checkMilestones();
    const finished = activeSession; activeSession = null; renderResults(finished, history);
  }

  // The "Your note" strip + Add/Edit button, shown wherever a concept surfaces (glossary,
  // quiz explanation, flashcard back, answer review). One note per concept — see setNote.
  function noteAffordanceMarkup(conceptId) {
    const note = getNote(conceptId);
    return `<div class="note-zone">${note ? `<div class="note-attached">${icon('edit')}<div><span class="eyebrow">Your note</span><p>${escapeHtml(note.text)}</p></div></div>` : ''}<button class="ghost small note-chip" data-action="edit-note" data-concept="${conceptId}">${icon('edit')} ${note ? 'Edit note' : 'Add a note'}</button></div>`;
  }

  // Shared full answer sheet, used by the results screen (session just finished) and by
  // renderStoredReview (reopening a past attempt from History). `review` is the persisted
  // per-question array built in finishSession.
  function answerReviewMarkup(review, opts = {}) {
    const filter = opts.filter || 'all';
    const flaggable = opts.flaggable;
    const counts = {
      all: review.length,
      missed: review.filter(r => !r.firstCorrect).length,
      flagged: flaggable ? review.filter(r => state.flaggedQuestions[r.qid]).length : 0
    };
    const shown = review.filter(r => filter === 'missed' ? !r.firstCorrect : filter === 'flagged' ? (flaggable && state.flaggedQuestions[r.qid]) : true);
    const chips = `<div class="review-filter">
      <button class="chip${filter === 'all' ? ' active' : ''}" data-action="review-filter" data-filter="all">All ${counts.all}</button>
      <button class="chip${filter === 'missed' ? ' active' : ''}" data-action="review-filter" data-filter="missed">Missed ${counts.missed}</button>
      ${flaggable ? `<button class="chip${filter === 'flagged' ? ' active' : ''}" data-action="review-filter" data-filter="flagged">Flagged ${counts.flagged}</button>` : ''}
    </div>`;
    const cardMarkup = r => {
      const domain = domainById[r.domain];
      const concept = conceptById[r.conceptId];
      const flagged = flaggable && !!state.flaggedQuestions[r.qid];
      const note = getNote(r.conceptId);
      const verdict = r.firstCorrect ? 'Correct' : r.corrected ? 'Corrected' : r.selected == null ? 'Blank' : 'Missed';
      return `<article class="review-card ${r.firstCorrect ? 'ok' : 'miss'}">
        <div class="review-card-meta"><span class="tag ${r.firstCorrect ? 'teal' : 'amber'}">${verdict}</span>${domain ? `<span class="tag">${domain.number} ${escapeHtml(domain.name)}</span>` : ''}<span class="tag">Obj ${escapeHtml(String(r.objective))}</span></div>
        <h3>${escapeHtml(r.prompt)}</h3>
        <ul class="review-options">${r.options.map((opt, i) => {
          const isCorrect = i === r.correct; const isPick = i === r.selected;
          return `<li class="${isCorrect ? 'is-correct' : ''}${isPick && !isCorrect ? ' is-wrong-pick' : ''}"><span class="review-opt-letter">${letters[i]}</span><span class="review-opt-text">${escapeHtml(opt)}</span>${isCorrect ? `<span class="review-opt-tag ok">${icon('check')} correct</span>` : isPick ? `<span class="review-opt-tag miss">your answer</span>` : ''}</li>`;
        }).join('')}${r.selected == null ? `<li class="is-wrong-pick"><span class="review-opt-letter">—</span><span class="review-opt-text">You didn't answer this one.</span></li>` : ''}</ul>
        <div class="review-explain"><strong>Why:</strong> ${escapeHtml(r.explanation)}</div>
        ${concept && concept.diagram ? `<div class="concept-diagram" style="max-width:340px;margin-top:12px">${concept.diagram}</div>` : ''}
        <div class="review-card-actions">
          ${flaggable ? `<button class="ghost small${flagged ? ' flag-active' : ''}" data-action="review-flag" data-qid="${r.qid}" data-concept="${r.conceptId}" data-domain="${r.domain}">${icon('flag')} ${flagged ? 'Flagged' : 'Flag for review'}</button>` : ''}
          <button class="ghost small" data-action="edit-note" data-concept="${r.conceptId}">${icon('edit')} ${note ? 'Edit note' : 'Add note'}</button>
          ${concept ? `<button class="ghost small" data-action="practice-concept" data-concept="${r.conceptId}">${icon('target')} Practice this</button>` : ''}
        </div>
        ${note ? `<div class="note-attached">${icon('edit')}<div><span class="eyebrow">Your note</span><p>${escapeHtml(note.text)}</p></div></div>` : ''}
      </article>`;
    };
    // Missed questions are grouped by objective (weakest mastery first) instead of shown as a
    // flat list, so a "review misses" pass reads like a prioritized drill list rather than just
    // the same quiz order with the correct ones removed.
    let body;
    if (!shown.length) {
      body = `<div class="empty-state" style="min-height:120px"><div><p>Nothing matches this filter.</p></div></div>`;
    } else if (filter === 'missed') {
      const groups = {};
      shown.forEach(r => { (groups[`${r.domain}::${r.objective}`] ||= { domain: r.domain, objective: r.objective, rows: [] }).rows.push(r); });
      const groupList = Object.values(groups).map(group => {
        const domain = domainById[group.domain];
        const objMeta = domain?.objectives?.find(o => o.code === group.objective);
        const metrics = domain ? getObjectiveMetrics(domain.id, group.objective) : null;
        return { ...group, domain, objMeta, mastery: metrics ? metrics.mastery : 100 };
      }).sort((a, b) => a.mastery - b.mastery || b.rows.length - a.rows.length);
      body = groupList.map(group => `<div class="review-group">
        <div class="review-group-head"><h3>${group.domain ? `${escapeHtml(group.domain.name)} · ` : ''}Objective ${escapeHtml(group.objective)}${group.objMeta ? ` — ${escapeHtml(group.objMeta.title)}` : ''}</h3><span class="tag amber">${group.rows.length} missed</span></div>
        ${group.rows.map(cardMarkup).join('')}
      </div>`).join('');
    } else {
      body = shown.map(cardMarkup).join('');
    }
    return `${chips}<section class="review-cards">${body}</section>`;
  }

  // Reopen a stored attempt's full answer sheet as its own view under the History route.
  function renderStoredReview(sessionId) {
    const entry = state.sessions.find(session => session.id === sessionId);
    if (!entry || !entry.review) { activeReview = null; return renderHistory(); }
    main.innerHTML = `<div class="section-head"><div><button class="ghost small" data-action="close-review" style="margin-bottom:12px">← Back to progress</button><h2>${escapeHtml(entry.label)}</h2><p>${formatDate(entry.date)} · ${entry.correct}/${entry.total} first try · ${entry.score}%${entry.scaled ? ` · est. ${entry.scaled}/900` : ''} · ${formatDuration(entry.elapsed)}</p></div></div>
      ${answerReviewMarkup(entry.review, { filter: reviewFilter, flaggable: true })}`;
    hydrateIcons(main);
  }

  // The % a session just showed doesn't say whether that's an improvement on its own — finds the
  // most recent PRIOR session that touched this domain (state.sessions[0] is always the one that
  // was just finished and unshifted by finishSession, so the search starts at index 1) so the
  // results screen can show a real session-over-session delta instead of a one-off snapshot.
  function previousDomainScore(domainId) {
    for (let i = 1; i < state.sessions.length; i++) {
      const stat = state.sessions[i].domains && state.sessions[i].domains[domainId];
      if (stat && stat.total) return pct(stat.correct, stat.total);
    }
    return null;
  }

  function renderResults(session, result) {
    resultsView = { session, result };
    const examMode = session.source === 'exams';
    const pass = examMode ? result.scaled >= CERT.cores[session.core].passingScore : result.score >= 80;
    const missedByDomain = {};
    session.questions.forEach((question, index) => {
      if (!session.responses[index]?.firstCorrect) (missedByDomain[question.domain] ||= new Set()).add(question.conceptId);
    });
    lastResultsMissed = Object.fromEntries(Object.entries(missedByDomain).map(([id, set]) => [id, [...set]]));
    const totalMissed = Object.values(lastResultsMissed).reduce((sum, ids) => sum + ids.length, 0);
    const domainRows = Object.entries(result.domains).map(([id, stat]) => {
      const score = pct(stat.correct, stat.total);
      const prevScore = previousDomainScore(id);
      return { id, domain: domainById[id], score, total: stat.total, correct: stat.correct, missed: (lastResultsMissed[id] || []).length, delta: prevScore == null ? null : score - prevScore };
    }).sort((a, b) => a.score - b.score);
    main.innerHTML = `<section class="results-hero">
      <div class="radial results-score" style="--value:${result.score};--ring-color:${pass ? 'var(--primary)' : 'var(--amber)'}"><div class="radial-content"><strong>${examMode ? result.scaled : `${result.score}%`}</strong><small>${examMode ? 'estimated / 900' : 'first attempt'}</small></div></div>
      <h2>${session.diagnostic ? 'Your starting point is set.' : pass ? 'Strong work—keep sharpening.' : 'Good baseline. Now close the gaps.'}</h2>
      <p>${session.diagnostic ? `Your readiness now reflects ${result.total} questions across every domain. The dashboard's "Next best move" and the Exam Map will point you at the weakest spots first.` : examMode ? `Estimated ${result.scaled}/900. The practice pass line is ${CERT.cores[session.core].passingScore}; official scoring is proprietary.` : `${result.correct} of ${result.total} correct on the first attempt${result.corrected ? `, plus ${result.corrected} corrected with a second chance` : ''}.`}</p>
      <div class="results-metrics"><div class="result-metric"><strong>${result.correct}/${result.total}</strong><span>First-try correct</span></div><div class="result-metric"><strong>${formatDuration(result.elapsed)}</strong><span>Time used</span></div><div class="result-metric"><strong>${Object.keys(result.domains).length}</strong><span>Domains trained</span></div></div>
      <div class="button-row" style="justify-content:center"><button class="primary" data-action="retry-session" data-source="${session.source}" data-core="${session.core || ''}">${icon('repeat')} Train another set</button>${totalMissed ? `<button class="secondary" data-action="review-missed">${icon('layers')} Review ${totalMissed} missed</button><button class="secondary" data-action="practice-missed" data-domain="all">${icon('target')} Practice ${totalMissed} missed</button>` : ''}<button class="secondary" data-route="history">View progress</button></div>
    </section>
    ${domainRows.length > 1 ? `<div class="section-head" style="max-width:820px;margin:25px auto 14px"><div><h2>Domain breakdown</h2><p>How this attempt broke down by domain — jump straight into what you missed instead of a random redo.</p></div></div>
    <section class="results-domains">${domainRows.map(row => { const deltaTag = row.delta == null ? '' : row.delta === 0 ? ` <span class="tag" title="Same as the last time you practiced this domain">steady</span>` : ` <span class="tag ${row.delta > 0 ? 'teal' : 'amber'}" title="${row.delta > 0 ? 'Up' : 'Down'} ${Math.abs(row.delta)} point${Math.abs(row.delta) === 1 ? '' : 's'} since the last time you practiced this domain">${row.delta > 0 ? '▲' : '▼'}${Math.abs(row.delta)}</span>`; return `<div class="results-domain-row"><div><strong style="color:${domainAccentColor(row.domain, 4.6)}">${escapeHtml(row.domain.name)}</strong><div class="progress-track"><div class="progress-bar" style="width:${row.score}%"></div></div></div><span class="results-domain-score">${row.correct}/${row.total} · ${row.score}%${deltaTag}</span>${row.missed ? `<button class="ghost small" data-action="practice-missed" data-domain="${row.id}">Practice ${row.missed} missed</button>` : `<span class="tag" style="justify-self:end">Clean sweep</span>`}</div>`; }).join('')}</section>` : ''}
    <div class="section-head" id="answer-review" style="margin:25px 0 14px"><div><h2>Answer review</h2><p>Every question with your choice, the correct answer, and why. Flag anything to revisit, or attach a note. This stays available from Progress.</p></div></div>
    ${answerReviewMarkup(result.review || [], { filter: reviewFilter, flaggable: true })}`;
    hydrateIcons(main); updateChrome();
  }

  // ---------- My notes ----------
  function renderNotes() {
    const store = state.notes || {};
    const rows = Object.entries(store)
      .map(([key, value]) => ({ conceptId: key.replace(/^note:/, ''), note: value }))
      .map(row => ({ ...row, concept: conceptById[row.conceptId] }))
      .filter(row => row.concept)
      .sort((a, b) => new Date(b.note.updatedAt || 0) - new Date(a.note.updatedAt || 0));
    // Notes whose concept isn't in the active track (switched tracks since writing) — surfaced
    // so they're not silently invisible, but not editable from here.
    const orphanCount = Object.keys(store).length - rows.length;
    if (!rows.length) {
      main.innerHTML = `<div class="section-head"><div><h2>My notes</h2><p>Attach your own explanation to any concept — from the glossary, a quiz explanation, a flashcard, or an answer review. They collect here, per track.</p></div></div>
        <div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('edit')}</span><h3>No notes yet${orphanCount ? ` for ${escapeHtml(CERT.name)}` : ''}</h3><p>Look for “Add a note” next to any term in the Glossary or under a quiz explanation.</p><button class="primary" data-route="glossary">${icon('book')} Open the glossary</button></div></div>`;
      return;
    }
    const byDomain = {};
    rows.forEach(row => { (byDomain[row.concept.domain] ||= []).push(row); });
    main.innerHTML = `<div class="section-head"><div><h2>My notes</h2><p>${rows.length} note${rows.length === 1 ? '' : 's'} on ${escapeHtml(CERT.name)} concepts${orphanCount ? ` · ${orphanCount} more on other tracks` : ''}. These are saved with your progress and included in backups.</p></div></div>
      ${Object.entries(byDomain).map(([domainId, list]) => `<section class="panel" style="margin-bottom:16px">
        <div class="panel-header"><div><h2>${escapeHtml(domainById[domainId] ? domainById[domainId].name : 'Other')}</h2><p>${list.length} note${list.length === 1 ? '' : 's'}</p></div></div>
        <div class="panel-body"><div class="note-list">${list.map(row => `<article class="note-item" id="note-${row.conceptId}">
          <div class="note-item-head"><strong>${escapeHtml(row.concept.term)}</strong><span class="tag">Obj ${escapeHtml(String(row.concept.objective))}</span></div>
          <p class="note-item-def">${escapeHtml(row.concept.definition)}</p>
          <div class="note-item-body">${icon('edit')}<p>${escapeHtml(row.note.text)}</p></div>
          <div class="button-row"><button class="ghost small" data-action="edit-note" data-concept="${row.conceptId}">${icon('edit')} Edit</button><button class="ghost small" data-action="practice-concept" data-concept="${row.conceptId}">${icon('target')} Practice this</button><button class="ghost small" data-action="delete-note" data-concept="${row.conceptId}">${icon('trash')} Delete</button></div>
        </article>`).join('')}</div></div>
      </section>`).join('')}`;
  }

  let noteDialogConcept = null;
  function openNoteDialog(conceptId) {
    const concept = conceptById[conceptId];
    if (!concept) return;
    noteDialogConcept = conceptId;
    const note = getNote(conceptId);
    openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="note-title">
      <h2 id="note-title">${note ? 'Edit note' : 'Add a note'}</h2>
      <p>${escapeHtml(concept.term)} — <span style="color:var(--muted-2)">${escapeHtml(concept.definition)}</span></p>
      <form id="note-form"><div class="field"><label for="note-text">Your note</label><textarea id="note-text" placeholder="A hook, a mnemonic, where you got it wrong, how it differs from the distractors…" autocomplete="off">${note ? escapeHtml(note.text) : ''}</textarea></div>
      <div class="button-row" style="margin-top:16px"><button class="primary" type="submit">${note ? 'Save changes' : 'Save note'}</button>${note ? `<button class="danger-button" type="button" data-action="delete-note" data-concept="${conceptId}">${icon('trash')} Delete</button>` : ''}<button class="secondary" type="button" data-action="close-dialog">Cancel</button></div></form>
    </div>`);
    setTimeout(() => document.getElementById('note-text')?.focus(), 0);
  }

  function renderFlashcards() {
    const pool = allConcepts();
    const reviewed = Object.keys(state.flashcards).length;
    const due = getDueCards(false).length;
    const mature = Object.values(state.flashcards).filter(card => (card.interval || 0) >= 14).length;
    main.innerHTML = `
      <div class="section-head"><div><h2>Recall before you recognize</h2><p>Turn each card before rating it. Honest ratings schedule hard material sooner and strong material later.</p></div><span class="tag teal">${pool.length} concepts</span></div>
      <section class="stat-grid" style="margin:0 0 18px"><div class="stat-card"><span class="stat-icon">${icon('layers')}</span><div class="stat-copy"><strong>${due || Math.min(20, pool.length - reviewed)}</strong><span>Due or new today</span></div></div><div class="stat-card"><span class="stat-icon">${icon('repeat')}</span><div class="stat-copy"><strong>${reviewed}</strong><span>Cards reviewed</span></div></div><div class="stat-card"><span class="stat-icon">${icon('trophy')}</span><div class="stat-copy"><strong>${mature}</strong><span>Mature cards</span></div></div><div class="stat-card"><span class="stat-icon">${icon('clock')}</span><div class="stat-copy"><strong>~6m</strong><span>Suggested review</span></div></div></section>
      <section class="panel"><div class="panel-header"><div><h2>Build a review deck</h2><p>Due cards come first, followed by unseen concepts. Choose flip-to-reveal, or type your own answer for active recall.</p></div></div><form class="builder" id="flash-builder" style="margin:0;border:0;border-top:1px solid var(--border-soft);border-radius:0;background:transparent">
        <div class="field"><label for="flash-core">Exam core</label><select id="flash-core">${coreSelectOptions()}</select></div>
        <div class="field"><label for="flash-domain">Domain</label><select id="flash-domain">${domainOptions()}</select></div>
        <div class="field"><label for="flash-count">Cards</label><select id="flash-count"><option>10</option><option selected>20</option><option>30</option><option>50</option></select></div>
        <div class="field"><label for="flash-mode">Review style</label><select id="flash-mode"><option value="flip">Flip to reveal</option><option value="recall">Type the answer</option></select></div>
        <button class="primary" type="submit">Start review ${icon('arrow')}</button>
        <button class="secondary" type="button" data-action="export-anki">${icon('download')} Export to Anki</button>
        <button class="secondary" type="button" data-action="open-custom-card">${icon('edit')} Add custom card</button>
      </form></section>`;
  }

  function startFlashcards(filter = {}) {
    const now = Date.now();
    let cards = allConcepts().filter(concept => !state.suspendedConcepts[concept.id] && (!filter.core || filter.core === 'all' || concept.core === filter.core) && (!filter.domain || filter.domain === 'all' || concept.domain === filter.domain));
    const due = cards.filter(concept => state.flashcards[concept.id] && new Date(state.flashcards[concept.id].due).getTime() <= now);
    const fresh = cards.filter(concept => !state.flashcards[concept.id]);
    const future = cards.filter(concept => state.flashcards[concept.id] && new Date(state.flashcards[concept.id].due).getTime() > now).sort((a, b) => new Date(state.flashcards[a.id].due) - new Date(state.flashcards[b.id].due));
    cards = [...seededShuffle(due, Date.now()), ...seededShuffle(fresh, `${Date.now()}-new`), ...future].slice(0, Number(filter.count || 20));
    if (!cards.length) { toast('No cards match that filter.', 'error'); return; }
    flashSession = { cards, index: 0, flipped: false, startedAt: Date.now(), mode: filter.mode === 'recall' ? 'recall' : 'flip', typed: '', submitted: false, matchHint: null };
    navigate('flashcards');
  }

  // ---------- Custom flashcards (the user's own material, layered onto the curated deck) ----------
  let customCardEditId = null;

  function openCustomCardDialog(editId = null) {
    customCardEditId = editId;
    const existing = editId ? (state.customConcepts || {})[editId] : null;
    dialogReturnFocus = document.activeElement;
    const domainOpts = Object.values(CERT.cores).flatMap(core => core.domains)
      .map(d => `<option value="${d.id}" ${existing?.domain === d.id ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('');
    openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="custom-card-title" style="max-width:520px">
      <h2 id="custom-card-title">${existing ? 'Edit custom card' : 'Add a custom card'}</h2>
      <p>Your own flashcard, reviewed alongside the built-in deck and shown in the Glossary — not used in quizzes or exams.</p>
      <form id="custom-card-form">
        <div class="field"><label for="custom-card-term">Term</label><input id="custom-card-term" type="text" value="${existing ? escapeHtml(existing.term) : ''}" required autocomplete="off"></div>
        <div class="field"><label for="custom-card-domain">Domain</label><select id="custom-card-domain">${domainOpts}</select></div>
        <div class="field"><label for="custom-card-definition">Definition</label><textarea id="custom-card-definition" required autocomplete="off">${existing ? escapeHtml(existing.definition) : ''}</textarea></div>
        <div class="field"><label for="custom-card-scenario">Scenario or notes (optional)</label><textarea id="custom-card-scenario" autocomplete="off">${existing ? escapeHtml(existing.scenario || '') : ''}</textarea></div>
        <div class="button-row" style="margin-top:16px">
          <button class="primary" type="submit">${existing ? 'Save changes' : 'Add card'}</button>
          ${existing ? `<button class="danger-button" type="button" data-action="delete-custom-card" data-id="${escapeHtml(editId)}">${icon('trash')} Delete</button>` : ''}
          <button class="secondary" type="button" data-action="close-dialog">Cancel</button>
        </div>
      </form>
    </div>`);
    setTimeout(() => document.getElementById('custom-card-term')?.focus(), 0);
  }

  function saveCustomCard() {
    const term = document.getElementById('custom-card-term').value.trim();
    const domain = document.getElementById('custom-card-domain').value;
    const definition = document.getElementById('custom-card-definition').value.trim();
    const scenario = document.getElementById('custom-card-scenario').value.trim();
    if (!term || !definition) { toast('A term and definition are both required.', 'error'); return; }
    state.customConcepts = state.customConcepts || {};
    const id = customCardEditId || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = state.customConcepts[id]?.createdAt || new Date().toISOString();
    state.customConcepts[id] = { id, term, domain, core: coreKeyForDomain(domain), definition, scenario, custom: true, createdAt };
    saveState();
    closeDialog();
    renderRoute();
    toast(customCardEditId ? 'Custom card updated.' : 'Custom card added.');
  }

  function deleteCustomCard(id) {
    if (!state.customConcepts || !state.customConcepts[id]) return;
    const removedConcept = state.customConcepts[id];
    const removedSchedule = state.flashcards[id] || null;
    delete state.customConcepts[id];
    delete state.flashcards[id]; // drop any review schedule it had — nothing left to schedule
    saveState();
    closeDialog();
    renderRoute();
    toast('Custom card deleted.', 'success', { label: 'Undo', run: () => {
      state.customConcepts = state.customConcepts || {};
      state.customConcepts[id] = removedConcept;
      if (removedSchedule) state.flashcards[id] = removedSchedule;
      saveState();
      renderRoute();
    } });
  }

  function renderFlashSession() {
    const session = flashSession; if (!session) return renderFlashcards();
    if (session.index >= session.cards.length) return finishFlashSession();
    stopSpeakOnce();
    const concept = session.cards[session.index]; const domain = domainById[concept.domain]; const core = CERT.cores[concept.core];
    const header = `<div class="quiz-top"><div class="quiz-progress"><div class="quiz-progress-meta"><span>${session.mode === 'recall' ? 'Active recall' : 'Spaced repetition'}</span><span>${session.index + 1} of ${session.cards.length}</span></div><div class="progress-track"><div class="progress-bar" style="width:${(session.index / session.cards.length) * 100}%"></div></div></div><span class="tag teal">${core.name}</span><button class="icon-button small" type="button" data-action="speak-flashcard" aria-label="Read card aloud">${icon('play')}</button><button class="ghost small" data-action="exit-flash">End review</button></div>`;
    const keepCardFocus = document.activeElement?.classList.contains('flash-card');
    main.innerHTML = `<section class="flash-shell">${header}${session.mode === 'recall' ? renderRecallStage(session, concept, domain) : renderFlipStage(session, concept, domain)}</section>`;
    hydrateIcons(main);
    if (session.mode === 'recall' && !session.submitted) document.getElementById('recall-input')?.focus();
    if (session.mode !== 'recall') {
      sizeFlashCard(main);
      if (keepCardFocus) main.querySelector('.flash-card')?.focus({ preventScroll: true });
    }
  }

  // The flip-card's front/back faces are `position:absolute; inset:0` so they can overlay
  // for the 3D flip transform -- that means the card's own box (min-height:340px) never
  // grows to fit taller content, so a face with a long definition/scenario or an embedded
  // diagram can silently overflow past the visible card border onto the plain page
  // background below. Measure each face's real content height (temporarily taking it out
  // of absolute positioning so it lays out at natural height) and grow the card to fit.
  function sizeFlashCard(container) {
    const card = container.querySelector('.flash-card');
    if (!card) return;
    let maxH = 340;
    card.querySelectorAll('.flash-face').forEach(face => {
      const prevPosition = face.style.position;
      face.style.position = 'static';
      if (face.scrollHeight > maxH) maxH = face.scrollHeight;
      face.style.position = prevPosition;
    });
    card.style.minHeight = `${maxH}px`;
  }

  function renderFlipStage(session, concept, domain) {
    const label = session.flipped ? 'Flashcard showing the answer. Activate to show the question again.' : 'Flashcard showing the question. Activate to reveal the answer.';
    return `<div class="flash-stage"><div class="flash-card ${session.flipped ? 'flipped' : ''}" data-action="flip-card" tabindex="0" role="button" aria-pressed="${session.flipped}" aria-label="${label}">
        <div class="flash-face front"><span class="tag">${domain.name} · ${concept.objective}</span><h2 style="margin-top:20px">${escapeHtml(concept.term)}</h2><p>Explain its purpose or the scenario where you would use it.</p><span class="flash-hint">Click or press Space to reveal</span></div>
        <div class="flash-face back"><span class="tag teal">Answer</span><h2 style="margin-top:20px">${escapeHtml(concept.term)}</h2>${concept.diagram ? `<div class="concept-diagram" style="max-width:340px">${concept.diagram}</div>` : ''}<p>${escapeHtml(concept.definition)}</p><div class="explanation" style="text-align:left;width:100%;margin-top:10px"><strong>Apply it</strong><p>${escapeHtml(concept.scenario)}.</p></div></div>
      </div></div>
      <div class="rating-row ${session.flipped ? '' : 'hidden'}">${ratingButtonsMarkup()}</div>
      ${session.flipped ? `<div class="flash-note-zone">${noteAffordanceMarkup(concept.id)}</div>` : ''}`;
  }

  function ratingButtonsMarkup() {
    return `<button class="rating-button" data-rate="again"><strong>Again</strong><small>10 minutes</small></button><button class="rating-button" data-rate="hard"><strong>Hard</strong><small>1 day</small></button><button class="rating-button" data-rate="good"><strong>Good</strong><small>3 days</small></button><button class="rating-button" data-rate="easy"><strong>Easy</strong><small>7+ days</small></button>`;
  }

  function renderRecallStage(session, concept, domain) {
    if (!session.submitted) {
      return `<div class="flash-stage recall"><div class="recall-card">
        <span class="tag">${domain.name} · ${concept.objective}</span>
        <h2 style="margin-top:20px">${escapeHtml(concept.term)}</h2>
        <p style="color:var(--muted)">Type your best explanation, then check it against the real definition.</p>
        <form id="recall-form"><textarea id="recall-input" placeholder="Type your answer…" autocomplete="off"></textarea>
          <div class="button-row" style="margin-top:14px;justify-content:center"><button class="primary" type="submit">Check answer ${icon('arrow')}</button><button class="ghost" type="button" data-action="reveal-recall">Skip / reveal</button></div>
        </form>
      </div></div>`;
    }
    const hint = session.matchHint || { label: '', tone: '' };
    return `<div class="flash-stage recall"><div class="recall-card revealed">
        <span class="tag">${domain.name} · ${concept.objective}</span>
        <h2 style="margin-top:20px">${escapeHtml(concept.term)}</h2>
        ${concept.diagram ? `<div class="concept-diagram" style="max-width:360px;margin-left:auto;margin-right:auto">${concept.diagram}</div>` : ''}
        <div class="recall-compare">
          <div><span class="eyebrow">Your answer</span><p>${session.typed && session.typed.trim() ? escapeHtml(session.typed) : '<em>Skipped</em>'}</p></div>
          <div><span class="eyebrow">Actual definition</span><p>${escapeHtml(concept.definition)}</p></div>
        </div>
        ${hint.label ? `<span class="tag ${hint.tone}" style="margin-top:14px">${escapeHtml(hint.label)} — a rough keyword hint, you're the judge</span>` : ''}
        <div class="explanation" style="text-align:left;width:100%;margin-top:14px"><strong>Apply it</strong><p>${escapeHtml(concept.scenario)}.</p></div>
        ${noteAffordanceMarkup(concept.id)}
      </div>
      <div class="rating-row" style="margin-top:20px">${ratingButtonsMarkup()}</div>
      </div>`;
  }

  // The one spaced-repetition schedule per concept, shared by every surface that can review
  // it — a Flashcards self-rating and a Practice/Exam question are just two different ways of
  // producing the same four-tier signal (again/hard/good/easy), and either one reschedules the
  // same `state.flashcards[conceptId]` entry. A concept learned entirely through quiz questions
  // still builds a real review schedule; the name is kept as-is (not renamed to e.g.
  // "srSchedule") purely to avoid a data migration for every existing account's saved progress.
  function scheduleReview(conceptId, rating) {
    const existing = state.flashcards[conceptId] || { interval: 0, ease: 2.5, reviews: 0 };
    let interval = existing.interval || 0; let ease = existing.ease || 2.5;
    if (rating === 'again') { interval = .007; ease = Math.max(1.3, ease - .2); }
    if (rating === 'hard') { interval = Math.max(1, Math.round(interval * 1.2) || 1); ease = Math.max(1.3, ease - .15); }
    if (rating === 'good') { interval = interval < 1 ? 3 : Math.max(3, Math.round(interval * ease)); }
    if (rating === 'easy') { ease += .15; interval = interval < 1 ? 7 : Math.max(7, Math.round(interval * ease * 1.3)); }
    const due = new Date(Date.now() + interval * 86400000);
    state.flashcards[conceptId] = { interval, ease, due: due.toISOString(), reviews: (existing.reviews || 0) + 1, lastRating: rating };
  }

  function rateFlashcard(rating) {
    if (!flashSession) return;
    const concept = flashSession.cards[flashSession.index];
    scheduleReview(concept.id, rating);
    state.activity[todayKey()] = (state.activity[todayKey()] || 0) + 1; saveState();
    flashSession.index++; flashSession.flipped = false;
    flashSession.submitted = false; flashSession.typed = ''; flashSession.matchHint = null;
    renderFlashSession();
  }

  function finishFlashSession() {
    stopSpeakOnce();
    const count = flashSession?.cards.length || 0; const seconds = flashSession ? Math.floor((Date.now() - flashSession.startedAt) / 1000) : 0;
    flashSession = null; saveState();
    main.innerHTML = `<section class="results-hero"><span class="stat-icon" style="margin:0 auto 16px">${icon('layers')}</span><h2>Review complete</h2><p>You scheduled ${count} cards in ${formatDuration(seconds)}. Your next queue will automatically surface the cards that need attention first.</p><div class="button-row" style="justify-content:center"><button class="primary" data-action="start-flash">Review another deck</button><button class="secondary" data-route="dashboard">Back to dashboard</button></div></section>`;
    hydrateIcons(main);
  }

  // ---------- Browse cards (Anki-"Browse"-style deck manager) ----------
  // Practice, Flashcards, and Spaced review each hand you a curated NEXT set — none of them let
  // you see or manage the whole deck's state at once. This is that missing view: every concept,
  // sortable and filterable, with bulk actions (reset a schedule, suspend/unsuspend from
  // automatic selection) that nothing else in the app exposes.
  function browseDomainOptions() {
    const all = Object.values(CERT.cores).flatMap(core => core.domains);
    return `<option value="all" ${browseDomain === 'all' ? 'selected' : ''}>All domains</option>${all.map(domain => `<option value="${domain.id}" ${browseDomain === domain.id ? 'selected' : ''}>${escapeHtml(domain.name)}</option>`).join('')}`;
  }

  function browseTableData() {
    const stats = conceptStatsMap();
    const now = Date.now();
    return allConcepts().map(concept => {
      const stat = stats[concept.id] || null; // null for custom concepts — they carry no quiz stats
      const accuracy = stat && stat.seen ? pct(stat.correct, stat.seen) : null;
      const mastered = stat ? isConceptMastered(stat) : false;
      const card = state.flashcards[concept.id] || null;
      const suspended = !!state.suspendedConcepts[concept.id];
      const due = card ? new Date(card.due).getTime() : null;
      const isDue = due != null && due <= now;
      return { concept, domain: domainById[concept.domain], seen: stat ? stat.seen : null, accuracy, mastered, card, suspended, due, isDue };
    });
  }

  function browseStatusBadge(row) {
    if (row.suspended) return { label: 'Suspended', cls: '' };
    if (row.mastered) return { label: 'Mastered', cls: 'teal' };
    if (row.isDue) return { label: 'Due', cls: 'amber' };
    if (!row.card && !row.seen) return { label: 'New', cls: '' };
    return { label: 'Learning', cls: '' };
  }

  function browseFilteredRows() {
    const term = browseQuery.trim().toLowerCase();
    let rows = browseTableData();
    if (browseDomain !== 'all') rows = rows.filter(r => r.concept.domain === browseDomain);
    if (term) rows = rows.filter(r => r.concept.term.toLowerCase().includes(term));
    if (browseStatus === 'due') rows = rows.filter(r => r.isDue && !r.suspended);
    else if (browseStatus === 'new') rows = rows.filter(r => !r.card && !r.seen && !r.suspended);
    else if (browseStatus === 'mastered') rows = rows.filter(r => r.mastered && !r.suspended);
    else if (browseStatus === 'suspended') rows = rows.filter(r => r.suspended);
    const sorters = {
      term: (a, b) => a.concept.term.localeCompare(b.concept.term),
      domain: (a, b) => a.domain.name.localeCompare(b.domain.name) || a.concept.term.localeCompare(b.concept.term),
      accuracy: (a, b) => (a.accuracy ?? -1) - (b.accuracy ?? -1),
      interval: (a, b) => (a.card?.interval ?? -1) - (b.card?.interval ?? -1),
      due: (a, b) => (a.due ?? Infinity) - (b.due ?? Infinity)
    };
    return rows.sort(sorters[browseSort] || sorters.term);
  }

  function browseHeadMarkup() {
    const col = (key, label) => `<button type="button" class="browse-sort${browseSort === key ? ' active' : ''}" data-action="browse-sort" data-sort="${key}">${label}${browseSort === key ? icon('chevron') : ''}</button>`;
    return `<div class="browse-row browse-head"><span></span>${col('term', 'Term')}<span>Status</span>${col('accuracy', 'Accuracy')}${col('interval', 'Interval')}${col('due', 'Due')}<span>Actions</span></div>`;
  }

  function browseRowMarkup(row) {
    const badge = browseStatusBadge(row);
    const checked = browseSelected.has(row.concept.id);
    const isBuiltIn = !!conceptById[row.concept.id];
    return `<div class="browse-row${checked ? ' selected' : ''}">
      <label class="browse-check"><input type="checkbox" class="browse-row-check" data-concept="${escapeHtml(row.concept.id)}" ${checked ? 'checked' : ''}><span class="visually-hidden">Select ${escapeHtml(row.concept.term)}</span></label>
      <div class="browse-term"><strong>${escapeHtml(row.concept.term)}</strong><small>${escapeHtml(row.domain ? row.domain.name : '')}</small></div>
      <span class="tag ${badge.cls}">${badge.label}</span>
      <span class="browse-cell">${row.accuracy == null ? '—' : `${row.accuracy}% (${row.seen})`}</span>
      <span class="browse-cell">${row.card ? `${row.card.interval}d` : '—'}</span>
      <span class="browse-cell">${row.due == null ? '—' : row.isDue ? 'Due now' : formatDateKey(localDateKey(new Date(row.due)))}</span>
      ${isBuiltIn ? `<button class="ghost small" data-action="browse-drill" data-concept="${escapeHtml(row.concept.id)}">${icon('target')} Drill</button>` : `<button class="ghost small" data-action="edit-custom-card" data-id="${escapeHtml(row.concept.id)}">${icon('edit')} Edit</button>`}
    </div>`;
  }

  function browseBulkBarMarkup() {
    const n = browseSelected.size;
    if (!n) return '';
    return `<div class="notice" style="margin:14px 0"><span>${n} selected</span><div class="button-row" style="margin-left:auto;flex-wrap:wrap">
      <button class="secondary small" data-action="browse-drill-selected">${icon('target')} Drill selected</button>
      <button class="ghost small" data-action="browse-reset-selected">${icon('rotate')} Reset schedule</button>
      <button class="ghost small" data-action="browse-suspend-selected">${icon('flag')} Suspend</button>
      <button class="ghost small" data-action="browse-unsuspend-selected">${icon('check')} Unsuspend</button>
      <button class="ghost small" data-action="browse-clear-selection">Clear</button>
    </div></div>`;
  }

  // Re-renders just the table + bulk bar + count, so the search box above never loses focus —
  // same "rebuild a region, not the whole page" pattern the Glossary/Labs search already use.
  function renderBrowseTable() {
    const rows = browseFilteredRows();
    const body = document.getElementById('browse-table');
    if (body) { body.innerHTML = `<div class="browse-list">${browseHeadMarkup()}${rows.length ? rows.map(browseRowMarkup).join('') : `<div class="empty-state"><div><h3>No cards match</h3><p>Try a different search term, domain, or status filter.</p></div></div>`}</div>`; hydrateIcons(body); }
    const bulkBar = document.getElementById('browse-bulk-bar');
    if (bulkBar) { bulkBar.innerHTML = browseBulkBarMarkup(); hydrateIcons(bulkBar); }
    const count = document.getElementById('browse-count');
    if (count) count.textContent = `${rows.length} card${rows.length === 1 ? '' : 's'}`;
  }

  function renderBrowse() {
    main.innerHTML = `<div class="section-head"><div><h2>Browse cards</h2><p>Every concept in ${escapeHtml(CERT.name)}, in one sortable table — see the whole deck's state at once instead of only what Practice or Flashcards hands you next. Suspending a concept keeps it out of Practice, Adaptive, Exams, and Flashcards until you unsuspend it — it still shows up here and in the Glossary.</p></div><span class="tag teal" id="browse-count"></span></div>
      <div class="builder" style="grid-template-columns:2fr 1fr 1fr">
        <div class="field"><label for="browse-search">Search</label><input id="browse-search" type="text" placeholder="Search terms…" value="${escapeHtml(browseQuery)}" autocomplete="off"></div>
        <div class="field"><label for="browse-domain">Domain</label><select id="browse-domain">${browseDomainOptions()}</select></div>
        <div class="field"><label for="browse-status">Status</label><select id="browse-status">
          <option value="all" ${browseStatus === 'all' ? 'selected' : ''}>All</option>
          <option value="due" ${browseStatus === 'due' ? 'selected' : ''}>Due now</option>
          <option value="new" ${browseStatus === 'new' ? 'selected' : ''}>New</option>
          <option value="mastered" ${browseStatus === 'mastered' ? 'selected' : ''}>Mastered</option>
          <option value="suspended" ${browseStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
        </select></div>
      </div>
      <div id="browse-bulk-bar"></div>
      <section id="browse-table"></section>`;
    renderBrowseTable();
  }

  function glossaryDomainOptions() {
    const all = Object.values(CERT.cores).flatMap(core => core.domains);
    return `<option value="all" ${glossaryDomain === 'all' ? 'selected' : ''}>All domains</option>${all.map(domain => `<option value="${domain.id}" ${glossaryDomain === domain.id ? 'selected' : ''}>${escapeHtml(domain.name)}</option>`).join('')}`;
  }

  function glossaryResultsMarkup() {
    const term = glossaryQuery.trim().toLowerCase();
    const items = allConcepts().filter(concept => (glossaryDomain === 'all' || concept.domain === glossaryDomain) && (!term || concept.term.toLowerCase().includes(term) || concept.definition.toLowerCase().includes(term)));
    if (!items.length) return `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('info')}</span><h3>No matches</h3><p>Try a different search term or domain.</p></div></div>`;
    const grouped = {};
    Object.values(CERT.cores).flatMap(core => core.domains).forEach(domain => { grouped[domain.id] = items.filter(concept => concept.domain === domain.id); });
    return `<div class="glossary-groups">${Object.entries(grouped).filter(([, concepts]) => concepts.length).map(([domainId, concepts]) => `
      <div class="glossary-group">
        <h3>${escapeHtml(domainById[domainId].name)} <span class="tag">${concepts.length}</span></h3>
        <div class="glossary-list">${concepts.map(concept => `<article class="glossary-item${concept.diagram ? ' has-diagram' : ''}"><strong>${escapeHtml(concept.term)}${concept.custom ? ' <span class="tag teal">Custom</span>' : ''}</strong>${concept.diagram ? `<div class="concept-diagram">${concept.diagram}</div>` : ''}<p>${escapeHtml(concept.definition)}</p>${concept.scenario ? `<small>${escapeHtml(concept.scenario)}.</small>` : ''}${concept.custom ? `<div class="button-row" style="margin-top:8px"><button class="ghost small" data-action="edit-custom-card" data-id="${escapeHtml(concept.id)}">${icon('edit')} Edit</button><button class="ghost small" data-action="delete-custom-card" data-id="${escapeHtml(concept.id)}">${icon('trash')} Delete</button></div>` : ''}${noteAffordanceMarkup(concept.id)}</article>`).join('')}</div>
      </div>`).join('')}</div>`;
  }

  // Only the results region is rebuilt on every keystroke/change, so the search input
  // never loses focus the way a full main.innerHTML rebuild would cause.
  function renderGlossaryResults() {
    const region = document.getElementById('glossary-results');
    if (region) region.innerHTML = glossaryResultsMarkup();
  }

  function renderGlossary() {
    main.innerHTML = `
      <div class="section-head"><div><h2>Cheat sheet &amp; glossary</h2><p>Every term, definition, and applied scenario in ${escapeHtml(CERT.name)} — a fast reference outside the quiz flow.</p></div><span class="tag teal">${allConcepts().length} terms</span></div>
      <div class="builder" style="grid-template-columns:2fr 1fr auto auto">
        <div class="field"><label for="glossary-search">Search</label><input id="glossary-search" type="text" placeholder="Search terms or definitions…" value="${escapeHtml(glossaryQuery)}" autocomplete="off"></div>
        <div class="field"><label for="glossary-domain">Domain</label><select id="glossary-domain">${glossaryDomainOptions()}</select></div>
        <button class="ghost" type="button" data-action="open-custom-card">${icon('edit')} Add custom card</button>
        <button class="ghost" type="button" data-action="print-page">${icon('download')} Print / save</button>
      </div>
      <label class="glossary-print-toggle" style="display:flex;align-items:center;gap:7px;margin:10px 2px 0;font-size:11px;color:var(--muted)"><input type="checkbox" id="glossary-compact-print"> Compact for print (hides scenarios &amp; diagrams)</label>
      <section id="glossary-results" style="margin-top:20px">${glossaryResultsMarkup()}</section>`;
  }

  // Scenario-type labs (branching troubleshooting tickets) live exclusively under their own
  // "Case studies" hub now, not mixed into this general grid — hands-on/procedural labs here,
  // sequential-judgment tickets there.
  function nonScenarioLabs() { return LABS.filter(lab => lab.type !== 'scenario'); }

  function labResultsMarkup() {
    const filterDomain = labDomainFilter && domainById[labDomainFilter] ? labDomainFilter : null;
    const term = labQuery.trim().toLowerCase();
    const coreFiltered = labCoreFilter !== 'all' && CERT.cores[labCoreFilter] ? nonScenarioLabs().filter(lab => lab.core === labCoreFilter) : nonScenarioLabs();
    const baseLabs = filterDomain ? coreFiltered.filter(lab => lab.domain === filterDomain) : coreFiltered;
    const matchedLabs = term ? baseLabs.filter(lab => lab.title.toLowerCase().includes(term) || lab.summary.toLowerCase().includes(term) || lab.brief.toLowerCase().includes(term) || domainById[lab.domain].name.toLowerCase().includes(term)) : baseLabs;
    const orderedLabs = [...matchedLabs].sort((a, b) => (state.flaggedLabs[b.id] ? 1 : 0) - (state.flaggedLabs[a.id] ? 1 : 0));
    const emptyState = term
      ? `<div class="empty-state"><div><h3>No labs match "${escapeHtml(labQuery.trim())}"</h3><p>Try a different word, or search by skill area instead — like "lighting" or "modifier".</p><button class="ghost small" data-action="clear-lab-search">Clear search</button></div></div>`
      : `<div class="empty-state"><div><h3>No labs match these filters</h3><button class="ghost small" data-action="clear-lab-filter">Clear filters</button></div></div>`;
    return `${filterDomain ? `<div class="notice" style="margin-bottom:16px">${icon('filter')}<span>Filtered to <strong>${escapeHtml(domainById[filterDomain].name)}</strong>.</span><button class="ghost small" data-action="clear-lab-filter" style="margin-left:auto">Clear filter</button></div>` : ''}
      <section class="lab-grid">${orderedLabs.length ? orderedLabs.map(lab => { const flagged = !!state.flaggedLabs[lab.id]; return `<article class="lab-card"><div class="lab-card-top"><span class="lab-type">${icon(lab.type === 'terminal' ? 'terminal' : lab.type === 'sequence' ? 'layers' : lab.type === 'scenario' ? 'alert' : lab.type === 'gui' ? 'settings' : lab.type === 'visual' ? 'image' : 'target')}</span><div style="display:flex;align-items:center;gap:8px"><span class="difficulty">${lab.difficulty} · ${lab.minutes} min</span><button class="quiz-button ${flagged ? 'flag-active' : ''}" data-action="toggle-lab-flag" data-lab-id="${lab.id}" title="${flagged ? 'Unflag this lab' : 'Flag this lab for review'}" aria-label="${flagged ? 'Unflag this lab' : 'Flag this lab for review'}">${icon('flag')}</button></div></div><h3>${escapeHtml(lab.title)}</h3><p>${escapeHtml(lab.summary)}</p><div class="card-meta"><span>${CERT.cores[lab.core].name}</span><i class="dot"></i><span>${domainById[lab.domain].name}</span>${state.completedLabs[lab.id] ? `<i class="dot"></i><span style="color:var(--green)">Completed</span>` : ''}</div><div class="button-row"><button class="secondary" data-action="start-lab" data-lab="${lab.id}">${state.completedLabs[lab.id] ? 'Run again' : 'Launch lab'} ${icon('arrow')}</button></div></article>`; }).join('') : emptyState}</section>`;
  }

  // Only the results region is rebuilt on every keystroke, so the search input never loses
  // focus the way a full main.innerHTML rebuild would cause (same pattern as the glossary search).
  function renderLabResults() {
    const region = document.getElementById('lab-results');
    if (region) region.innerHTML = labResultsMarkup();
    hydrateIcons(region || main);
  }

  function renderLabs() {
    const flaggedCount = Object.keys(state.flaggedLabs).length;
    const gridLabs = nonScenarioLabs();
    const gridCompleted = gridLabs.filter(lab => state.completedLabs[lab.id]).length;
    main.innerHTML = `<div class="section-head"><div><h2>Practice the sequence, not just the term</h2><p>These guided simulations develop command selection, troubleshooting order, security judgment, and operational discipline.</p></div><div class="button-row"><span class="tag teal">${gridCompleted}/${gridLabs.length} complete${flaggedCount ? ` · ${flaggedCount} flagged` : ''}</span><button class="ghost small" type="button" data-route="casestudies">${icon('alert')} Case studies</button><button class="ghost small" type="button" data-route="commands">${icon('terminal')} Command reference</button></div></div>
      <div class="builder" style="grid-template-columns:2fr 1fr;margin-bottom:18px">
        <div class="field"><label for="lab-search">Search labs</label><input id="lab-search" type="text" placeholder="Search by title, topic, or skill…" value="${escapeHtml(labQuery)}" autocomplete="off"></div>
        <div class="field"><label for="lab-core-filter">Exam core</label><select id="lab-core-filter">${coreSelectOptions(labCoreFilter)}</select></div>
      </div>
      <section id="lab-results">${labResultsMarkup()}</section>`;
  }

  // ---------- Case studies (branching scenario tickets) ----------
  // Reuses the exact same engine LABS' "scenario" lab type already runs (startLab, activeLab,
  // renderScenarioLab, the scenario-choice action) rather than a parallel implementation — this
  // page just gives that content its own front door, since "work a ticket through a chain of
  // consequences" is a genuinely different test than any other Labs type (hands-on sequencing,
  // a terminal, a GUI) and deserves its own place in the nav instead of being buried in the
  // general Labs grid.
  function caseStudyCardMarkup(lab) {
    const completed = !!state.completedLabs[lab.id];
    const flagged = !!state.flaggedLabs[lab.id];
    return `<article class="lab-card"><div class="lab-card-top"><span class="lab-type">${icon('alert')}</span><div style="display:flex;align-items:center;gap:8px"><span class="difficulty">${lab.difficulty} · ${lab.minutes} min</span><button class="quiz-button ${flagged ? 'flag-active' : ''}" data-action="toggle-lab-flag" data-lab-id="${lab.id}" title="${flagged ? 'Unflag this case' : 'Flag this case for review'}" aria-label="${flagged ? 'Unflag this case' : 'Flag this case for review'}">${icon('flag')}</button></div></div><h3>${escapeHtml(lab.title)}</h3><p>${escapeHtml(lab.summary)}</p><div class="card-meta"><span>${CERT.cores[lab.core].name}</span><i class="dot"></i><span>${domainById[lab.domain].name}</span>${completed ? `<i class="dot"></i><span style="color:var(--green)">Resolved</span>` : ''}</div><div class="button-row"><button class="secondary" data-action="start-lab" data-lab="${lab.id}">${completed ? 'Work it again' : 'Open ticket'} ${icon('arrow')}</button></div></article>`;
  }

  function renderCaseStudiesHub() {
    const cases = LABS.filter(lab => lab.type === 'scenario');
    const resolved = cases.filter(lab => state.completedLabs[lab.id]).length;
    main.innerHTML = `<div class="section-head"><div><h2>Case studies</h2><p>Real-feeling help-desk tickets where every choice leads to a consequence and the next question — testing a troubleshooting chain, not one isolated multiple-choice answer. <button class="ghost small" data-route="labs" style="vertical-align:middle">${icon('arrow')} Back to labs</button></p></div>${cases.length ? `<span class="tag teal">${resolved}/${cases.length} resolved</span>` : ''}</div>
      <section class="lab-grid">${cases.length ? cases.map(caseStudyCardMarkup).join('') : `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('info')}</span><h3>No case studies for ${escapeHtml(CERT.name)} yet</h3><p>This track doesn't have any branching tickets written yet — the regular Labs still cover hands-on practice.</p></div></div>`}</section>`;
  }

  // Every command referenced anywhere in this track's terminal-style labs, deduplicated into
  // one flat list — a standalone cheat sheet separate from any single lab's in-context "help"
  // (which is deliberately scoped to one scenario, decoys included). Labs with an authored
  // `commands` list (the same one "help" shows) contribute those entries; labs without one yet
  // still contribute their actual accepted answers, using each step's hint as the description,
  // so every track has a populated reference even before every lab gets a full command list.
  function buildCommandReference() {
    const byCommand = new Map();
    const add = (cmd, desc, lab) => {
      if (!cmd) return;
      const key = cmd.toLowerCase();
      if (!byCommand.has(key)) byCommand.set(key, { cmd, desc, labs: [] });
      const entry = byCommand.get(key);
      if (!entry.labs.some(l => l.id === lab.id)) entry.labs.push({ id: lab.id, title: lab.title });
    };
    LABS.filter(lab => lab.type === 'terminal').forEach(lab => {
      if (lab.commands && lab.commands.length) lab.commands.forEach(c => add(c.cmd, c.desc, lab));
      else (lab.terminal || []).forEach(step => add(step.accepts && step.accepts[0], step.hint, lab));
    });
    return [...byCommand.values()].sort((a, b) => a.cmd.localeCompare(b.cmd));
  }

  function commandResultsMarkup() {
    const term = commandQuery.trim().toLowerCase();
    const all = buildCommandReference();
    const items = term ? all.filter(entry => entry.cmd.toLowerCase().includes(term) || entry.desc.toLowerCase().includes(term)) : all;
    if (!all.length) return `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('info')}</span><h3>No commands recorded yet</h3><p>This track doesn't have any terminal-style labs yet.</p></div></div>`;
    if (!items.length) return `<div class="empty-state"><div><h3>No commands match "${escapeHtml(commandQuery.trim())}"</h3><button class="ghost small" data-action="clear-command-search">Clear search</button></div></div>`;
    return `<div class="glossary-list">${items.map(entry => `<article class="glossary-item"><strong class="command-chip">${escapeHtml(entry.cmd)}</strong><p>${escapeHtml(entry.desc)}</p><div class="button-row" style="margin-top:8px;flex-wrap:wrap">${entry.labs.map(l => `<button class="ghost small" data-action="start-lab" data-lab="${l.id}">${icon('terminal')} ${escapeHtml(l.title)}</button>`).join('')}</div></article>`).join('')}</div>`;
  }

  function renderCommandResults() {
    const region = document.getElementById('command-results');
    if (region) { region.innerHTML = commandResultsMarkup(); hydrateIcons(region); }
  }

  function renderCommandReference() {
    const all = buildCommandReference();
    main.innerHTML = `<div class="section-head"><div><h2>Command reference</h2><p>Every command taught across ${escapeHtml(CERT.name)}'s interactive labs, gathered in one searchable, printable place.</p></div><div class="button-row"><span class="tag teal">${all.length} commands</span><button class="ghost small" data-route="labs">${icon('arrow')} Back to labs</button><button class="secondary small" data-action="print-page">${icon('download')} Print / save</button></div></div>
      <div class="field" style="max-width:380px;margin-bottom:18px"><label for="command-search">Search commands</label><input id="command-search" type="text" placeholder="Search by command or what it does…" value="${escapeHtml(commandQuery)}" autocomplete="off"></div>
      <section id="command-results">${commandResultsMarkup()}</section>`;
  }

  // ---------- Global search (guide + glossary + labs, one box) ----------
  // Distinct from the command palette, which only jumps to pages/actions by name — this searches
  // the actual content of whichever track is active, the same way the palette can't.
  function snippetAround(text, term) {
    const lower = text.toLowerCase();
    const idx = lower.indexOf(term);
    if (idx === -1) return escapeHtml(text.slice(0, 140)) + (text.length > 140 ? '…' : '');
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + term.length + 60);
    return `${start > 0 ? '…' : ''}${escapeHtml(text.slice(start, end))}${end < text.length ? '…' : ''}`;
  }

  function globalSearchResultsMarkup() {
    const term = globalSearchQuery.trim().toLowerCase();
    if (term.length < 2) return `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('search')}</span><p>Type at least 2 characters to search the Study guide, Glossary, and Labs for ${escapeHtml(CERT.name)}.</p></div></div>`;
    const guideHits = [];
    GUIDE.forEach(chapter => {
      const domain = domainById[chapter.domain];
      if (!domain) return;
      if ((chapter.overview || '').toLowerCase().includes(term)) guideHits.push({ domain, heading: 'Overview', snippet: snippetAround(chapter.overview, term) });
      (chapter.sections || []).forEach(section => {
        const haystack = `${section.heading}\n${section.body}`.toLowerCase();
        if (haystack.includes(term)) guideHits.push({ domain, heading: section.heading, snippet: snippetAround(section.body, term) });
      });
    });
    const termHits = allConcepts().filter(c => c.term.toLowerCase().includes(term) || c.definition.toLowerCase().includes(term) || (c.scenario || '').toLowerCase().includes(term));
    const labHits = LABS.filter(l => l.title.toLowerCase().includes(term) || l.summary.toLowerCase().includes(term) || (l.brief || '').toLowerCase().includes(term));
    if (!guideHits.length && !termHits.length && !labHits.length) return `<div class="empty-state"><div><h3>No matches for "${escapeHtml(globalSearchQuery.trim())}"</h3><p>Try a shorter or different word.</p></div></div>`;
    return `
      ${guideHits.length ? `<section class="panel" style="margin-bottom:16px"><div class="panel-header"><div><h2>Study guide</h2><p>${guideHits.length} match${guideHits.length === 1 ? '' : 'es'}</p></div></div><div class="panel-body"><ul class="gap-list">${guideHits.slice(0, 20).map(hit => `<li><span><strong>${escapeHtml(hit.domain.name)}</strong> — ${escapeHtml(hit.heading)}<br><span style="color:var(--muted);font-size:12px">${hit.snippet}</span></span><button class="ghost small" data-action="guide-jump" data-domain-id="${hit.domain.id}">${icon('book')} Open</button></li>`).join('')}</ul></div></section>` : ''}
      ${termHits.length ? `<section class="panel" style="margin-bottom:16px"><div class="panel-header"><div><h2>Glossary</h2><p>${termHits.length} match${termHits.length === 1 ? '' : 'es'}</p></div></div><div class="panel-body"><div class="glossary-list">${termHits.slice(0, 20).map(c => `<article class="glossary-item"><strong>${escapeHtml(c.term)}</strong><p>${escapeHtml(c.definition)}</p><button class="ghost small" data-action="practice-concept" data-concept="${c.id}">${icon('target')} Practice</button></article>`).join('')}</div></div></section>` : ''}
      ${labHits.length ? `<section class="panel"><div class="panel-header"><div><h2>Labs</h2><p>${labHits.length} match${labHits.length === 1 ? '' : 'es'}</p></div></div><div class="panel-body"><div class="lab-grid">${labHits.slice(0, 20).map(lab => `<article class="lab-card"><h3>${escapeHtml(lab.title)}</h3><p>${escapeHtml(lab.summary)}</p><div class="button-row"><button class="secondary small" data-action="start-lab" data-lab="${lab.id}">${icon('play')} Launch lab</button></div></article>`).join('')}</div></div></section>` : ''}
    `;
  }

  // Only the results region is rebuilt on every keystroke, matching the glossary/lab search
  // pattern, so the search input never loses focus the way a full main.innerHTML rebuild would.
  function renderGlobalSearchResults() {
    const region = document.getElementById('global-search-results');
    if (region) { region.innerHTML = globalSearchResultsMarkup(); hydrateIcons(region); }
  }

  function renderSearch() {
    main.innerHTML = `<div class="section-head"><div><h2>Search</h2><p>Find anything across the Study guide, Glossary, and Labs for ${escapeHtml(CERT.name)}.</p></div></div>
      <div class="field" style="max-width:480px;margin-bottom:20px"><label for="global-search-input">Search everything</label><input id="global-search-input" type="text" placeholder="Search terms, guide chapters, or labs…" value="${escapeHtml(globalSearchQuery)}" autocomplete="off"></div>
      <section id="global-search-results">${globalSearchResultsMarkup()}</section>`;
    document.getElementById('global-search-input')?.focus();
  }

  // ---------- Fill in the blank (cloze-deletion guide drills) ----------
  // A third recall modality alongside Flashcards (term shown, definition hidden, self-rated) and
  // Practice (multiple choice): here the term itself has to be produced, in the actual prose
  // context it's used in, not recognized among four options or recalled in isolation. Every
  // blank still feeds the exact same spaced-review schedule scheduleReview() maintains for
  // flashcards and quiz answers, so this is a new way to advance that one shared schedule, not a
  // second disconnected stats system.
  function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Finds real concept terms inside a real paragraph and returns where they are, so they can be
  // blanked out later. Matches against the part of the term before any parenthetical expansion
  // (mirrors crosswordAnswerFromTerm's own approach to the same "MDM (Mobile Device Management)"
  // shape) since that's normally how a term actually appears in flowing prose. Overlapping hits
  // (e.g. both "IP address" and "address" matching the same span) keep only the first found;
  // capped at 3 per paragraph so a passage doesn't turn into more blank than readable text.
  function findClozeHits(paragraph, concepts) {
    const found = [];
    concepts.forEach(concept => {
      const phrase = concept.term.split('(')[0].trim();
      if (phrase.length < 4) return;
      const match = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'i').exec(paragraph);
      if (match) found.push({ conceptId: concept.id, term: phrase, index: match.index, length: match[0].length });
    });
    found.sort((a, b) => a.index - b.index);
    const kept = [];
    found.forEach(hit => { if (!kept.some(k => hit.index < k.index + k.length && hit.index + hit.length > k.index)) kept.push(hit); });
    return kept.slice(0, 3);
  }

  function buildClozeParagraphs(domainId) {
    const domainConcepts = CONCEPTS.filter(c => c.domain === domainId);
    const items = [];
    GUIDE.filter(chapter => chapter.domain === domainId).forEach(chapter => {
      const addParagraph = (text, paraIndex, heading) => {
        const hits = findClozeHits(text || '', domainConcepts);
        if (hits.length) items.push({ domainId, heading, para: text, hits });
      };
      addParagraph(chapter.overview, -1, 'Overview');
      (chapter.sections || []).forEach(section => (section.body || '').split('\n\n').forEach((para, i) => addParagraph(para, i, section.heading)));
    });
    return items;
  }

  function renderClozeHub() {
    const rows = Object.values(domainById).map(domain => ({ domain, count: buildClozeParagraphs(domain.id).length }));
    const cards = rows.map(({ domain, count }) => `<article class="lab-card">
        <div class="lab-card-top"><span class="lab-type">${icon('edit')}</span><span class="difficulty">${count ? `${count} passage${count === 1 ? '' : 's'}` : 'No guide content yet'}</span></div>
        <h3>${escapeHtml(domain.name)}</h3>
        <p>Real Study guide paragraphs with the key terms blanked out — type them back in context instead of picking from four choices.</p>
        <div class="card-meta"><span>${escapeHtml(CERT.name)}</span></div>
        <div class="button-row">${count ? `<button class="secondary" data-action="start-cloze" data-domain-id="${domain.id}">Start drill ${icon('arrow')}</button>` : `<button class="secondary" disabled>Not enough content yet</button>`}</div>
      </article>`).join('');
    main.innerHTML = `<div class="section-head"><div><h2>Fill in the blank</h2><p>Every domain's Study guide content, turned into a different kind of recall drill — the term has to come from you, not a menu of four choices. Right or wrong, each one reschedules that concept the same way a flashcard rating would.</p></div></div>
      <section class="lab-grid">${cards}</section>`;
  }

  function startCloze(domainId) {
    const domain = domainById[domainId]; if (!domain) return;
    const pool = buildClozeParagraphs(domainId);
    if (!pool.length) { toast('Not enough guide content with recognizable terms in this domain yet.', 'error'); return; }
    const items = seededShuffle(pool, Date.now()).slice(0, Math.min(8, pool.length));
    clozeSession = { domainId, items, index: 0, startedAt: Date.now(), correct: 0, total: 0, results: null };
    navigate('cloze');
  }

  // Slices the original (unescaped) paragraph text around each hit so every non-blank segment
  // still gets escapeHtml'd individually — building this from an already-escaped string would
  // double-escape entities and corrupt the character offsets findClozeHits computed.
  function clozeParagraphMarkup(item, results) {
    let cursor = 0; let html = '';
    item.hits.forEach((hit, i) => {
      html += escapeHtml(item.para.slice(cursor, hit.index));
      if (!results) {
        html += `<input type="text" class="cloze-blank" id="cloze-blank-${i}" data-hit="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:${Math.max(70, hit.length * 9)}px" aria-label="Blank ${i + 1} of ${item.hits.length}">`;
      } else {
        const res = results[i];
        html += res.correct
          ? `<span class="cloze-answer correct">${escapeHtml(hit.term)}</span>`
          : `<span class="cloze-answer incorrect">${escapeHtml(res.typed || '(blank)')}</span> <span class="cloze-answer correct">${escapeHtml(hit.term)}</span>`;
      }
      cursor = hit.index + hit.length;
    });
    html += escapeHtml(item.para.slice(cursor));
    return html;
  }

  function renderClozePlay() {
    const session = clozeSession; if (!session) return renderClozeHub();
    if (session.index >= session.items.length) return finishClozeSession();
    const item = session.items[session.index];
    const domain = domainById[item.domainId];
    const revealed = !!session.results;
    main.innerHTML = `<section class="flash-shell">
      <div class="quiz-top"><div class="quiz-progress"><div class="quiz-progress-meta"><span>Fill in the blank</span><span>${session.index + 1} of ${session.items.length}</span></div><div class="progress-track"><div class="progress-bar" style="width:${(session.index / session.items.length) * 100}%"></div></div></div><span class="tag teal">${escapeHtml(domain.name)}</span><button class="ghost small" data-action="exit-cloze">End drill</button></div>
      <div class="recall-card" style="text-align:left">
        <span class="eyebrow">${escapeHtml(item.heading)}</span>
        <form id="cloze-check-form"><p style="font-size:16px;line-height:1.9;margin-top:12px">${clozeParagraphMarkup(item, session.results)}</p>
        ${revealed
          ? `<div class="button-row" style="margin-top:16px"><button class="primary" type="button" data-action="cloze-next">${session.index + 1 >= session.items.length ? 'See results' : 'Next passage'} ${icon('arrow')}</button></div>`
          : `<div class="button-row" style="margin-top:16px"><button class="primary" type="submit">Check answers</button></div>`}
        </form>
      </div>
    </section>`;
    hydrateIcons(main);
    if (!revealed) document.getElementById('cloze-blank-0')?.focus();
  }

  function checkClozeAnswers() {
    const session = clozeSession; if (!session) return;
    const item = session.items[session.index];
    const results = item.hits.map((hit, i) => {
      const typed = (document.getElementById(`cloze-blank-${i}`)?.value || '').trim();
      const correct = typed.toLowerCase() === hit.term.toLowerCase();
      scheduleReview(hit.conceptId, correct ? 'good' : 'again');
      session.total++; if (correct) session.correct++;
      return { typed, correct };
    });
    session.results = results;
    state.activity[todayKey()] = (state.activity[todayKey()] || 0) + 1;
    saveState();
    renderClozePlay();
  }

  function clozeNext() {
    if (!clozeSession) return;
    clozeSession.index++; clozeSession.results = null;
    renderClozePlay();
  }

  function finishClozeSession() {
    const session = clozeSession;
    const seconds = session ? Math.floor((Date.now() - session.startedAt) / 1000) : 0;
    const correct = session?.correct || 0; const total = session?.total || 0;
    clozeSession = null;
    main.innerHTML = `<section class="results-hero"><span class="stat-icon" style="margin:0 auto 16px">${icon('edit')}</span><h2>Drill complete</h2><p>${correct} of ${total} blank${total === 1 ? '' : 's'} correct in ${formatDuration(seconds)}. Every term you typed — right or wrong — just updated its spaced-review schedule, the same as a flashcard rating would.</p><div class="button-row" style="justify-content:center"><button class="primary" data-route="cloze">Try another domain</button><button class="secondary" data-route="dashboard">Back to dashboard</button></div></section>`;
    hydrateIcons(main);
  }

  // ---------- Terminal sandbox (free-form command practice) ----------
  // Distinct from the Labs' scripted terminal type: no task, no accepted-answer list, no
  // completion state — just a persistent simulated filesystem to build raw command fluency in,
  // the same way actually having a real shell open and poking around teaches it better than any
  // single scripted exercise. State lives in a plain nested-object tree, mutated directly by each
  // command handler; nothing here touches real files or a real network.
  let sandboxSession = null;
  const SANDBOX_HOME = ['home', 'tech'];
  const SANDBOX_BANNER = "Cert Study terminal sandbox — a simulated filesystem. Nothing here is real; nothing you do here can break anything. Type 'help' for a command list.\n\n";

  function buildSandboxFS() {
    return { type: 'dir', name: '/', children: {
      home: { type: 'dir', name: 'home', children: {
        tech: { type: 'dir', name: 'tech', children: {
          'notes.txt': { type: 'file', name: 'notes.txt', content: 'Ticket queue: 3 open, 1 escalated.\nRemember to check disk space on srv-02 today.' },
          'readme.md': { type: 'file', name: 'readme.md', content: '# Welcome\nThis is a simulated shell for practicing commands. Explore freely — nothing here is real.' },
          scripts: { type: 'dir', name: 'scripts', children: {
            'backup.sh': { type: 'file', name: 'backup.sh', content: '#!/bin/bash\necho "Backing up /home..."' }
          } }
        } }
      } },
      etc: { type: 'dir', name: 'etc', children: {
        hosts: { type: 'file', name: 'hosts', content: '127.0.0.1\tlocalhost\n192.168.1.10\tfileserver' },
        passwd: { type: 'file', name: 'passwd', content: 'root:x:0:0:root:/root:/bin/bash\ntech:x:1000:1000:Tech User:/home/tech:/bin/bash' }
      } },
      var: { type: 'dir', name: 'var', children: {
        log: { type: 'dir', name: 'log', children: {
          syslog: { type: 'file', name: 'syslog', content: 'Jan 01 00:00:01 host systemd[1]: Started Daily cleanup.\nJan 01 03:12:44 host sshd[812]: Accepted publickey for tech' }
        } }
      } }
    } };
  }

  function sandboxResolvePath(cwd, input) {
    const abs = input.startsWith('/');
    const parts = (abs ? input.slice(1) : input).split('/').filter(Boolean);
    const segs = abs ? [] : [...cwd];
    parts.forEach(p => { if (p === '.') return; if (p === '..') segs.pop(); else segs.push(p); });
    return segs;
  }

  function sandboxGetNode(fs, segs) {
    let node = fs;
    for (const seg of segs) { if (!node || node.type !== 'dir' || !node.children[seg]) return null; node = node.children[seg]; }
    return node;
  }

  function sandboxParentAndName(session, pathArg) {
    const segs = sandboxResolvePath(session.cwd, pathArg);
    const name = segs[segs.length - 1];
    const parentNode = sandboxGetNode(session.fs, segs.slice(0, -1));
    return { parentNode, name, segs };
  }

  function sandboxDisplayPath(cwd) {
    if (cwd.length >= SANDBOX_HOME.length && SANDBOX_HOME.every((s, i) => cwd[i] === s)) {
      const rest = cwd.slice(SANDBOX_HOME.length);
      return rest.length ? `~/${rest.join('/')}` : '~';
    }
    return '/' + cwd.join('/');
  }

  function sandboxPrompt(session) { return `tech@sandbox:${sandboxDisplayPath(session.cwd)}$ `; }

  const SANDBOX_HELP = `Available commands:
  ls [path]          list files/directories
  cd [path]          change directory
  pwd                print working directory
  cat <file>         show a file's contents
  mkdir <name>       create a directory
  touch <name>       create an empty file
  rm [-r] <name>     remove a file (or directory with -r)
  mv <src> <dest>    move or rename
  cp <src> <dest>    copy
  echo <text>        print text (supports: echo text > file)
  ipconfig           show simulated network configuration
  ping <host>        simulate a ping
  chmod <mode> <f>   simulated permission change
  whoami, date       simulated identity/time
  clear              clear the screen`;

  const SANDBOX_IPCONFIG = `Ethernet adapter Ethernet0:
   IPv4 Address. . . . . . . . . . . : 192.168.1.42
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`;

  function sandboxPing(host) {
    if (!host) return 'usage: ping <host>';
    const lines = [0, 1, 2, 3].map(i => `Reply from ${host}: bytes=32 time=${12 + i * 3}ms TTL=57`);
    return `Pinging ${host} with 32 bytes of data:\n${lines.join('\n')}\n\nPing statistics: Sent = 4, Received = 4, Lost = 0 (0% loss)`;
  }

  function sandboxLs(session, pathArg) {
    const segs = pathArg ? sandboxResolvePath(session.cwd, pathArg) : session.cwd;
    const node = sandboxGetNode(session.fs, segs);
    if (!node) return `ls: cannot access '${pathArg}': No such file or directory`;
    if (node.type === 'file') return node.name;
    const entries = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));
    return entries.map(e => e.type === 'dir' ? `${e.name}/` : e.name).join('  ');
  }

  function sandboxCd(session, pathArg) {
    if (!pathArg || pathArg === '~') { session.cwd = [...SANDBOX_HOME]; return ''; }
    const segs = sandboxResolvePath(session.cwd, pathArg);
    const node = sandboxGetNode(session.fs, segs);
    if (!node) return `cd: ${pathArg}: No such file or directory`;
    if (node.type !== 'dir') return `cd: ${pathArg}: Not a directory`;
    session.cwd = segs;
    return '';
  }

  function sandboxCat(session, pathArg) {
    if (!pathArg) return 'usage: cat <file>';
    const node = sandboxGetNode(session.fs, sandboxResolvePath(session.cwd, pathArg));
    if (!node) return `cat: ${pathArg}: No such file or directory`;
    if (node.type !== 'file') return `cat: ${pathArg}: Is a directory`;
    return node.content;
  }

  function sandboxMkdir(session, pathArg) {
    if (!pathArg) return 'usage: mkdir <name>';
    const { parentNode, name } = sandboxParentAndName(session, pathArg);
    if (!parentNode || parentNode.type !== 'dir') return `mkdir: cannot create directory '${pathArg}': No such file or directory`;
    if (parentNode.children[name]) return `mkdir: cannot create directory '${name}': File exists`;
    parentNode.children[name] = { type: 'dir', name, children: {} };
    return '';
  }

  function sandboxTouch(session, pathArg) {
    if (!pathArg) return 'usage: touch <name>';
    const { parentNode, name } = sandboxParentAndName(session, pathArg);
    if (!parentNode || parentNode.type !== 'dir') return `touch: cannot touch '${pathArg}': No such file or directory`;
    if (!parentNode.children[name]) parentNode.children[name] = { type: 'file', name, content: '' };
    return '';
  }

  function sandboxRm(session, args) {
    const recursive = args.includes('-r') || args.includes('-rf');
    const targetArg = args.find(a => !a.startsWith('-'));
    if (!targetArg) return 'usage: rm [-r] <name>';
    const { parentNode, name } = sandboxParentAndName(session, targetArg);
    if (!parentNode || !parentNode.children[name]) return `rm: cannot remove '${targetArg}': No such file or directory`;
    const target = parentNode.children[name];
    if (target.type === 'dir' && !recursive && Object.keys(target.children).length) return `rm: cannot remove '${targetArg}': Directory not empty (use -r)`;
    delete parentNode.children[name];
    return '';
  }

  function sandboxEcho(session, args) {
    const redirectIndex = args.indexOf('>');
    if (redirectIndex === -1) return args.join(' ').replace(/^"|"$/g, '');
    const text = args.slice(0, redirectIndex).join(' ').replace(/^"|"$/g, '');
    const targetArg = args[redirectIndex + 1];
    if (!targetArg) return "echo: syntax error near unexpected token `>'";
    const { parentNode, name } = sandboxParentAndName(session, targetArg);
    if (!parentNode || parentNode.type !== 'dir') return `echo: ${targetArg}: No such file or directory`;
    parentNode.children[name] = { type: 'file', name, content: text };
    return '';
  }

  function sandboxMvCp(session, args, isMove) {
    const label = isMove ? 'mv' : 'cp';
    if (args.length < 2) return `usage: ${label} <source> <dest>`;
    const [src, dest] = args;
    const srcInfo = sandboxParentAndName(session, src);
    if (!srcInfo.parentNode || !srcInfo.parentNode.children[srcInfo.name]) return `${label}: cannot stat '${src}': No such file or directory`;
    const srcNode = srcInfo.parentNode.children[srcInfo.name];
    const destNode = sandboxGetNode(session.fs, sandboxResolvePath(session.cwd, dest));
    let destParent, destName;
    if (destNode && destNode.type === 'dir') { destParent = destNode; destName = srcInfo.name; }
    else { const info = sandboxParentAndName(session, dest); destParent = info.parentNode; destName = info.name; }
    if (!destParent || destParent.type !== 'dir') return `${label}: cannot create '${dest}': No such file or directory`;
    destParent.children[destName] = { ...JSON.parse(JSON.stringify(srcNode)), name: destName };
    if (isMove) delete srcInfo.parentNode.children[srcInfo.name];
    return '';
  }

  function sandboxExecute(session, raw) {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    switch (cmd) {
      case 'help': return SANDBOX_HELP;
      case 'pwd': return '/' + session.cwd.join('/');
      case 'whoami': return 'tech';
      case 'date': return 'Thu Jan 01 00:00:00 UTC 2026 (simulated)';
      case 'ls': return sandboxLs(session, args[0]);
      case 'cd': return sandboxCd(session, args[0]);
      case 'cat': return sandboxCat(session, args[0]);
      case 'mkdir': return sandboxMkdir(session, args[0]);
      case 'touch': return sandboxTouch(session, args[0]);
      case 'rm': return sandboxRm(session, args);
      case 'mv': return sandboxMvCp(session, args, true);
      case 'cp': return sandboxMvCp(session, args, false);
      case 'echo': return sandboxEcho(session, args);
      case 'ipconfig': case 'ifconfig': return SANDBOX_IPCONFIG;
      case 'ping': return sandboxPing(args[0]);
      case 'chmod': return args.length >= 2 ? `Permissions for ${args[1]} updated to ${args[0]} (simulated — no real permission model here).` : 'usage: chmod <mode> <file>';
      default: return `${cmd}: command not found. Type 'help' for a list of available commands.`;
    }
  }

  function sandboxRunCommand() {
    const session = sandboxSession; if (!session) return;
    const input = document.getElementById('sandbox-command'); if (!input) return;
    const raw = input.value;
    if (!raw.trim()) return;
    session.history.push(raw); session.historyIndex = session.history.length;
    if (raw.trim() === 'clear') { session.transcript = SANDBOX_BANNER; renderSandbox(); return; }
    const promptLine = sandboxPrompt(session) + raw;
    const result = sandboxExecute(session, raw);
    session.transcript += `${promptLine}\n${result ? result + '\n' : ''}`;
    renderSandbox();
  }

  function renderSandbox() {
    if (!sandboxSession) sandboxSession = { fs: buildSandboxFS(), cwd: [...SANDBOX_HOME], transcript: SANDBOX_BANNER, history: [], historyIndex: 0 };
    const session = sandboxSession;
    main.innerHTML = `<div class="section-head"><div><h2>Terminal sandbox</h2><p>A free-form simulated shell — no scripted task, no right answer. Explore the filesystem and build raw command fluency beyond any one lab's script.</p></div><button class="ghost small" data-action="sandbox-reset">${icon('rotate')} Reset filesystem</button></div>
      <div class="terminal-window"><div class="terminal-bar"><i class="terminal-dot"></i><i class="terminal-dot"></i><i class="terminal-dot"></i></div><div class="terminal-output" id="sandbox-output">${escapeHtml(session.transcript)}</div><form class="terminal-input" id="sandbox-form"><span class="terminal-prompt">${escapeHtml(sandboxPrompt(session))}</span><input id="sandbox-command" autocomplete="off" spellcheck="false" placeholder="Type a command, or 'help'" aria-label="Sandbox command"></form></div>`;
    hydrateIcons(main);
    const output = document.getElementById('sandbox-output');
    if (output) output.scrollTop = output.scrollHeight;
    document.getElementById('sandbox-command')?.focus();
  }

  // ---------- Crossword ----------
  // Every puzzle is generated on demand from the same CONCEPTS bank Practice and Flashcards use,
  // one per domain of whichever cert is active — so switching tracks (or just regenerating) is
  // what supplies "several different ones" rather than a separate hand-authored puzzle bank.

  // Most terms read fine as a crossword answer once punctuation/spacing is stripped, but a few
  // use a "SHORT (long expansion)" or "Long phrase (SHORT)" pattern — taking only the text before
  // the first parenthesis reliably picks the intended short answer in both cases (e.g. "MDM
  // (Mobile Device Management)" -> MDM, "SFTP (port 22, over SSH)" -> SFTP) without needing to
  // guess which side of the parenthesis is the "real" name.
  function crosswordAnswerFromTerm(term) {
    return term.split('(')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function crosswordClueText(concept) {
    const raw = (concept.scenario || concept.definition).trim();
    const capped = raw.charAt(0).toUpperCase() + raw.slice(1);
    return /[.?!]$/.test(capped) ? capped : `${capped}.`;
  }

  function buildCrosswordPool(domainId) {
    const seen = new Set();
    const pool = [];
    CONCEPTS.filter(concept => concept.domain === domainId).forEach(concept => {
      const answer = crosswordAnswerFromTerm(concept.term);
      if (answer.length < 3 || answer.length > 16 || seen.has(answer)) return;
      seen.add(answer);
      pool.push({ answer, clue: crosswordClueText(concept), term: concept.term });
    });
    return pool;
  }

  // Standard greedy crossword placement: place the first (longest) word, then for every word
  // after it, search every already-placed word for a shared letter and try crossing there. A
  // placement is only valid if every empty cell it touches has no letter directly beside it
  // (perpendicular to the new word) and the cells immediately before/after the word are empty —
  // otherwise it would silently fuse into or graze an unrelated word.
  // The board's own box is landscape (the clue column sits fixed-width off to the side, so
  // whatever's left over is wider than it is tall) — a puzzle that grows roughly as wide as it
  // is tall still ends up cramped, because it's the TALLER dimension that determines how small
  // the cells have to shrink to fit. Scoring candidate placements against that same ratio, not
  // raw area, keeps the generated grid's shape close to the shape it actually has to fit into.
  const CW_TARGET_ASPECT = 1.3;

  // One unlucky shuffle can leave fewer than 5 words with a shared crossing letter even when
  // the domain has plenty of terms. Retry with perturbed seeds before giving up — deterministic
  // per base seed (the hub's stable per-domain count and "New puzzle" both stay consistent).
  function generateCrosswordLayout(pool, seed, maxWords = 12) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const layout = tryCrosswordLayout(pool, `${seed}-${attempt}`, maxWords);
      if (layout) return layout;
    }
    return null;
  }

  function tryCrosswordLayout(pool, seed, maxWords = 12) {
    const words = seededShuffle(pool, seed).sort((a, b) => b.answer.length - a.answer.length);
    const cells = new Map(); // "x,y" -> letter
    const placed = [];

    function canPlace(answer, x, y, dir) {
      for (let k = 0; k < answer.length; k++) {
        const cx = dir === 'across' ? x + k : x;
        const cy = dir === 'down' ? y + k : y;
        const existing = cells.get(`${cx},${cy}`);
        if (existing) {
          if (existing !== answer[k]) return false;
        } else if (dir === 'across') {
          if (cells.has(`${cx},${cy - 1}`) || cells.has(`${cx},${cy + 1}`)) return false;
        } else {
          if (cells.has(`${cx - 1},${cy}`) || cells.has(`${cx + 1},${cy}`)) return false;
        }
      }
      const beforeKey = dir === 'across' ? `${x - 1},${y}` : `${x},${y - 1}`;
      const afterKey = dir === 'across' ? `${x + answer.length},${y}` : `${x},${y + answer.length}`;
      return !cells.has(beforeKey) && !cells.has(afterKey);
    }

    function place(word, x, y, dir) {
      for (let k = 0; k < word.answer.length; k++) {
        const cx = dir === 'across' ? x + k : x;
        const cy = dir === 'down' ? y + k : y;
        cells.set(`${cx},${cy}`, word.answer[k]);
      }
      placed.push({ ...word, x, y, dir });
    }

    words.forEach(word => {
      if (placed.length >= maxWords) return;
      if (!placed.length) { place(word, 0, 0, 'across'); return; }
      // Among every valid crossing (not just the first one found), keep whichever grows the
      // bounding box the least relative to CW_TARGET_ASPECT. Taking the first fit tends to snake
      // outward and can produce a grid several times larger than the word count actually needs —
      // exactly the kind of puzzle that no longer fits on screen without scrolling.
      const curXs = placed.flatMap(w => w.dir === 'across' ? [w.x, w.x + w.answer.length - 1] : [w.x]);
      const curYs = placed.flatMap(w => w.dir === 'down' ? [w.y, w.y + w.answer.length - 1] : [w.y]);
      const curMinX = Math.min(...curXs), curMaxX = Math.max(...curXs);
      const curMinY = Math.min(...curYs), curMaxY = Math.max(...curYs);
      let best = null, bestCost = Infinity;
      for (const existing of placed) {
        for (let i = 0; i < existing.answer.length; i++) {
          for (let j = 0; j < word.answer.length; j++) {
            if (existing.answer[i] !== word.answer[j]) continue;
            const dir = existing.dir === 'across' ? 'down' : 'across';
            const x = existing.dir === 'across' ? existing.x + i : existing.x - j;
            const y = existing.dir === 'across' ? existing.y - j : existing.y + i;
            if (!canPlace(word.answer, x, y, dir)) continue;
            const endX = dir === 'across' ? x + word.answer.length - 1 : x;
            const endY = dir === 'down' ? y + word.answer.length - 1 : y;
            const boxW = Math.max(curMaxX, endX) - Math.min(curMinX, x) + 1;
            const boxH = Math.max(curMaxY, endY) - Math.min(curMinY, y) + 1;
            // The cost is how large a cell size that box would allow inside a fixed-aspect
            // target — smaller cost means bigger cells are possible, so it's what we minimize.
            const cost = Math.max(boxW / CW_TARGET_ASPECT, boxH);
            if (cost < bestCost) { bestCost = cost; best = { x, y, dir }; }
          }
        }
      }
      if (best) place(word, best.x, best.y, best.dir);
    });

    if (placed.length < 5) return null;

    const xs = placed.flatMap(w => w.dir === 'across' ? [w.x, w.x + w.answer.length - 1] : [w.x]);
    const ys = placed.flatMap(w => w.dir === 'down' ? [w.y, w.y + w.answer.length - 1] : [w.y]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const width = Math.max(...xs) - minX + 1;
    const height = Math.max(...ys) - minY + 1;
    const entries = placed.map(w => ({ ...w, x: w.x - minX, y: w.y - minY }));
    const solution = new Map([...cells].map(([key, letter]) => {
      const [x, y] = key.split(',').map(Number);
      return [`${x - minX},${y - minY}`, letter];
    }));

    // A cell numbers if it's the start of any entry there; an across/down entry starting at the
    // same cell shares one number, matching how real crosswords number their grids.
    const numbers = new Map();
    const starts = [...new Set(entries.map(e => `${e.x},${e.y}`))].sort((a, b) => {
      const [ax, ay] = a.split(',').map(Number); const [bx, by] = b.split(',').map(Number);
      return (ay - by) || (ax - bx);
    });
    starts.forEach((key, index) => numbers.set(key, index + 1));
    entries.forEach(e => { e.number = numbers.get(`${e.x},${e.y}`); });

    const cellIndex = new Map(); // "x,y" -> { across: entryIndex|null, down: entryIndex|null }
    entries.forEach((e, idx) => {
      for (let k = 0; k < e.answer.length; k++) {
        const cx = e.dir === 'across' ? e.x + k : e.x;
        const cy = e.dir === 'down' ? e.y + k : e.y;
        const key = `${cx},${cy}`;
        const cell = cellIndex.get(key) || { across: null, down: null };
        cell[e.dir] = idx;
        cellIndex.set(key, cell);
      }
    });

    return { width, height, entries, solution, numbers, cellIndex };
  }

  function crosswordActiveEntry(cw) {
    const { x, y, dir } = cw.selected;
    return cw.layout.entries.find(e => e.dir === dir && (dir === 'across'
      ? (e.y === y && x >= e.x && x < e.x + e.answer.length)
      : (e.x === x && y >= e.y && y < e.y + e.answer.length)));
  }

  function crosswordEntrySolved(cw, entry) {
    for (let k = 0; k < entry.answer.length; k++) {
      const cx = entry.dir === 'across' ? entry.x + k : entry.x;
      const cy = entry.dir === 'down' ? entry.y + k : entry.y;
      if ((cw.userGrid[`${cx},${cy}`] || '') !== entry.answer[k]) return false;
    }
    return true;
  }

  function crosswordSelectEntry(cw, entry) {
    let x = entry.x, y = entry.y;
    for (let k = 0; k < entry.answer.length; k++) {
      const cx = entry.dir === 'across' ? entry.x + k : entry.x;
      const cy = entry.dir === 'down' ? entry.y + k : entry.y;
      if (!cw.userGrid[`${cx},${cy}`]) { x = cx; y = cy; break; }
    }
    cw.selected = { x, y, dir: entry.dir };
  }

  // Called after every render that could have finished the puzzle. It re-renders itself once
  // more on the transition to complete, since the render that triggered it already happened
  // before completion was known and wouldn't otherwise show the "solved" banner or button state.
  function checkCrosswordCompletion() {
    const cw = activeCrossword; if (!cw || cw.complete) return;
    if (!cw.layout.entries.every(entry => crosswordEntrySolved(cw, entry))) return;
    cw.complete = true;
    const elapsed = Math.floor((Date.now() - cw.startedAt) / 1000);
    state.completedCrosswords[cw.domainId] = { date: new Date().toISOString(), elapsed, words: cw.layout.entries.length };
    state.activity[todayKey()] = (state.activity[todayKey()] || 0) + 5;
    saveState();
    toast('Crossword complete!');
    renderCrosswordPlay(); hydrateIcons(main);
  }

  function startCrossword(domainId) {
    const domain = domainById[domainId]; if (!domain) return;
    const layout = generateCrosswordLayout(buildCrosswordPool(domainId), Date.now());
    if (!layout) { toast('Not enough terms in this domain yet for a puzzle.', 'error'); return; }
    activeCrossword = {
      domainId, domainName: domain.name, layout, userGrid: {}, checkedCells: null,
      selected: { x: layout.entries[0].x, y: layout.entries[0].y, dir: layout.entries[0].dir },
      startedAt: Date.now(), complete: false
    };
    navigate('crossword');
  }

  function renderCrosswordHub() {
    const domains = Object.values(domainById);
    const cards = domains.map(domain => {
      const layout = generateCrosswordLayout(buildCrosswordPool(domain.id), hashNumber(domain.id));
      const wordCount = layout ? layout.entries.length : 0;
      const completed = state.completedCrosswords[domain.id];
      return `<article class="lab-card">
        <div class="lab-card-top"><span class="lab-type">${icon('crossword')}</span><span class="difficulty">${wordCount ? `${wordCount} clues` : 'Not enough terms'}</span></div>
        <h3>${escapeHtml(domain.name)}</h3>
        <p>A crossword built from ${escapeHtml(domain.name)} terms and scenarios, freshly generated from the question bank each time you play.</p>
        <div class="card-meta"><span>${escapeHtml(CERT.name)}</span>${completed ? `<i class="dot"></i><span style="color:var(--green)">Completed</span>` : ''}</div>
        <div class="button-row">${wordCount >= 5
          ? `<button class="secondary" data-action="start-crossword" data-domain-id="${domain.id}">${completed ? 'Play again' : 'Start puzzle'} ${icon('arrow')}</button>`
          : `<button class="secondary" disabled>Not enough terms yet</button>`}</div>
      </article>`;
    }).join('');
    main.innerHTML = `<div class="section-head"><div><h2>Crossword puzzles</h2><p>Every domain in ${escapeHtml(CERT.name)} gets its own puzzle, built from the same terms and scenarios used in Practice — a different way to learn them than answering multiple choice.</p></div><span class="tag teal">${Object.keys(state.completedCrosswords).length}/${domains.length} complete</span></div>
      <section class="lab-grid">${cards}</section>`;
  }

  function crosswordGridMarkup(cw) {
    const { layout } = cw;
    const activeEntry = crosswordActiveEntry(cw);
    let rows = '';
    for (let y = 0; y < layout.height; y++) {
      let row = '';
      for (let x = 0; x < layout.width; x++) {
        const key = `${x},${y}`;
        const letter = layout.solution.get(key);
        if (!letter) { row += `<div class="cw-cell block"></div>`; continue; }
        const number = layout.numbers.get(key);
        const typed = cw.userGrid[key] || '';
        const isSelected = cw.selected.x === x && cw.selected.y === y;
        const inActiveWord = !!activeEntry && (activeEntry.dir === 'across'
          ? (activeEntry.y === y && x >= activeEntry.x && x < activeEntry.x + activeEntry.answer.length)
          : (activeEntry.x === x && y >= activeEntry.y && y < activeEntry.y + activeEntry.answer.length));
        const mark = cw.checkedCells && cw.checkedCells[key] ? cw.checkedCells[key] : '';
        // Roving tabindex: only the selected cell is a tab stop, so one Tab enters the grid
        // and one Tab leaves it; arrow keys move the selection (and focus) within.
        const cellLabel = `Row ${y + 1}, column ${x + 1}${number ? `, starts clue ${number}` : ''}. ${typed ? typed : 'Empty'}.`;
        row += `<button type="button" class="cw-cell ${isSelected ? 'selected' : inActiveWord ? 'active-word' : ''} ${mark}" data-action="cw-select" data-x="${x}" data-y="${y}" tabindex="${isSelected ? '0' : '-1'}" aria-label="${cellLabel}">${number ? `<span class="cw-num">${number}</span>` : ''}<span class="cw-letter">${escapeHtml(typed)}</span></button>`;
      }
      rows += `<div class="cw-row">${row}</div>`;
    }
    return `<div class="cw-grid">${rows}</div>`;
  }

  function crosswordClueGroupMarkup(cw, dir) {
    const activeEntry = crosswordActiveEntry(cw);
    const items = cw.layout.entries.filter(entry => entry.dir === dir).sort((a, b) => a.number - b.number).map(entry => {
      const solved = crosswordEntrySolved(cw, entry);
      const active = activeEntry === entry;
      return `<div class="cw-clue-item ${active ? 'active' : ''} ${solved ? 'solved' : ''}" data-action="cw-select-clue" data-number="${entry.number}" data-dir="${dir}" title="${escapeHtml(entry.clue)}"><span class="cw-clue-num">${entry.number}</span><span class="cw-clue-text">${escapeHtml(entry.clue)}</span><span class="cw-clue-len">(${entry.answer.length})</span></div>`;
    }).join('');
    return `<div class="cw-clue-group"><h4>${dir === 'across' ? 'Across' : 'Down'}</h4><div class="cw-clue-list">${items || '<p style="color:var(--muted);font-size:11px">None in this puzzle.</p>'}</div></div>`;
  }

  // Sorted once, reused by both the Prev/Next clue-bar buttons and (implicitly) by number
  // order in the two clue columns — Across before Down when a number has both, matching how
  // solvers expect the "next clue" step to behave.
  function crosswordOrderedEntries(cw) {
    return [...cw.layout.entries].sort((a, b) => (a.number - b.number) || (a.dir === b.dir ? 0 : a.dir === 'across' ? -1 : 1));
  }

  // A single always-visible "current clue" line is the actual fix for having to scroll down to
  // a long clue list just to read the question you're already filling in — the full list still
  // exists below for browsing, but reading the active clue no longer requires it.
  function crosswordClueBarMarkup(cw) {
    const entry = crosswordActiveEntry(cw);
    if (!entry) return '';
    return `<div class="cw-clue-bar">
      <button type="button" class="ghost small cw-clue-nav" data-action="cw-prev-clue" aria-label="Previous clue"><span style="display:inline-block;transform:scaleX(-1)">${icon('chevron')}</span></button>
      <div class="cw-clue-current"><strong>${entry.number} ${entry.dir === 'across' ? 'Across' : 'Down'}</strong>${escapeHtml(entry.clue)}<em>(${entry.answer.length})</em></div>
      <button type="button" class="ghost small cw-clue-nav" data-action="cw-next-clue" aria-label="Next clue">${icon('chevron')}</button>
    </div>`;
  }

  function renderCrosswordPlay() {
    const cw = activeCrossword; if (!cw) return renderCrosswordHub();
    const cellHadFocus = document.activeElement?.classList.contains('cw-cell');
    const total = cw.layout.entries.length;
    const solved = cw.layout.entries.filter(entry => crosswordEntrySolved(cw, entry)).length;
    main.innerHTML = `<section class="lab-shell cw-shell">
      <div class="cw-header">
        <button class="ghost small" data-action="exit-crossword">← All puzzles</button>
        <h2>${escapeHtml(cw.domainName)} crossword</h2>
        <span class="tag teal">${escapeHtml(CERT.name)}</span>
        <span class="tag">${solved}/${total} solved</span>
      </div>
      ${cw.complete ? `<div class="notice cw-solved-notice">${icon('trophy')}<span>Solved! All ${total} answers are filled in correctly.</span></div>` : crosswordClueBarMarkup(cw)}
      <div class="cw-play-area">
        <div class="cw-board-wrap">${crosswordGridMarkup(cw)}</div>
        <div class="cw-clues">${crosswordClueGroupMarkup(cw, 'across')}${crosswordClueGroupMarkup(cw, 'down')}</div>
      </div>
      <div class="button-row cw-controls">
        <button class="ghost" data-action="crossword-check">${icon('check')} Check puzzle</button>
        <button class="ghost" data-action="crossword-reveal-letter">Reveal letter</button>
        <button class="ghost" data-action="crossword-reveal-word">Reveal word</button>
        <button class="ghost" data-action="crossword-reveal-puzzle">Reveal puzzle</button>
        <button class="secondary" data-action="crossword-new-puzzle">${icon('repeat')} New puzzle</button>
      </div>
    </section>`;
    fitCrosswordGrid();
    if (cellHadFocus) main.querySelector('.cw-cell.selected')?.focus({ preventScroll: true });
  }

  // Sizes cells to whatever space is actually available instead of a fixed pixel size, so a
  // large generated puzzle shrinks to fit its box rather than needing its own internal scrollbar
  // — the layout CSS bounds that box to the viewport, this is what makes the fit exact.
  function fitCrosswordGrid() {
    const cw = activeCrossword; if (!cw) return;
    const wrap = document.querySelector('.cw-board-wrap');
    const grid = document.querySelector('.cw-grid');
    if (!wrap || !grid) return;
    const { width, height } = cw.layout;
    const gap = 2;
    const availW = wrap.clientWidth - 6;
    const availH = wrap.clientHeight - 6;
    if (availW <= 0 || availH <= 0) return;
    const cellFromW = Math.floor((availW - (width - 1) * gap) / width);
    const cellFromH = Math.floor((availH - (height - 1) * gap) / height);
    // 18px is a floor, not just a preference — below that, letters stop being legible, so an
    // unusually large puzzle is better off with a small contained scrollbar on the board than
    // with cells nobody can actually read or tap accurately.
    const cell = Math.max(16, Math.min(40, cellFromW, cellFromH));
    grid.style.setProperty('--cw-cell', `${cell}px`);
    grid.style.setProperty('--cw-cell-font', `${Math.max(8, Math.round(cell * 0.5))}px`);
  }

  function startLab(labId) {
    const lab = LABS.find(item => item.id === labId); if (!lab) return;
    activeLab = { lab, startedAt: Date.now(), stage: 0, feedback: '', complete: false };
    if (lab.type === 'sequence') { activeLab.available = seededShuffle(lab.steps, Date.now()); activeLab.chosen = []; }
    if (lab.type === 'terminal') activeLab.transcript = `Cert Study lab shell\n${lab.terminal[0].prompt}\n`;
    if (lab.type === 'scenario') { activeLab.nodeId = lab.startNode; activeLab.log = []; }
    if (lab.type === 'gui') {
      activeLab.controlState = {};
      Object.values(lab.panels).forEach(panel => panel.controls.forEach(control => { activeLab.controlState[control.id] = control.initial; }));
      activeLab.activePanel = (lab.tabs && lab.tabs[0]) || Object.keys(lab.panels)[0];
      activeLab.results = null;
    }
    if (lab.type === 'visual') activeLab.stepIndex = 0;
    navigate('labs');
  }

  function renderLabWorkbench() {
    const runtime = activeLab; if (!runtime) return renderLabs();
    const lab = runtime.lab;
    const flagged = !!state.flaggedLabs[lab.id];
    main.innerHTML = `<section class="lab-shell"><div class="button-row" style="margin-bottom:14px"><button class="ghost small" data-action="exit-lab">${lab.type === 'scenario' ? '← All case studies' : '← All labs'}</button><span class="tag teal">${CERT.cores[lab.core].name}</span><span class="tag">${lab.difficulty}</span><button class="ghost small ${flagged ? 'flag-active' : ''}" data-action="toggle-lab-flag" data-lab-id="${lab.id}">${icon('flag')} ${flagged ? 'Flagged for study' : 'Flag for review'}</button></div>
      <div class="lab-brief"><span class="eyebrow">Scenario briefing</span><h2>${escapeHtml(lab.title)}</h2><p>${escapeHtml(lab.brief)}</p></div>
      <div class="lab-workbench">${lab.type === 'sequence' ? renderSequenceLab(runtime) : lab.type === 'terminal' ? renderTerminalLab(runtime) : lab.type === 'scenario' ? renderScenarioLab(runtime) : lab.type === 'gui' ? renderGuiLab(runtime) : lab.type === 'visual' ? renderVisualLab(runtime) : renderDecisionLab(runtime)}</div></section>`;
    hydrateIcons(main);
    if (lab.type === 'terminal') document.getElementById('terminal-command')?.focus();
  }

  function renderSequenceLab(runtime) {
    if (runtime.complete) return completedLabMarkup(runtime);
    return `<div class="sequence-zone"><div class="sequence-column"><h3>Available actions</h3>${runtime.available.map((step, index) => `<button class="step-chip" data-action="move-step" data-from="available" data-index="${index}"><span class="step-number">+</span><span>${escapeHtml(step)}</span></button>`).join('') || '<p style="color:var(--muted)">All actions placed.</p>'}</div><div class="sequence-column"><h3>Your sequence</h3>${runtime.chosen.map((step, index) => `<button class="step-chip" data-action="move-step" data-from="chosen" data-index="${index}"><span class="step-number">${index + 1}</span><span>${escapeHtml(step)}</span></button>`).join('') || '<p style="color:var(--muted)">Choose the first action.</p>'}</div></div>
      ${runtime.feedback ? `<div class="lab-feedback">${escapeHtml(runtime.feedback)}</div>` : ''}<div class="button-row" style="margin-top:16px"><button class="primary" data-action="check-sequence" ${runtime.chosen.length === runtime.lab.steps.length ? '' : 'disabled'}>Check sequence</button><button class="ghost" data-action="reset-lab">Reset</button></div>`;
  }

  // The real CompTIA exam's terminal-style PBQs offer a "help" command listing every command
  // available for that task — including some that aren't actually needed — rather than telling
  // you which one to run next. This mirrors that: a fixed, lab-wide reference list, separate
  // from the per-step "Show hint," which stays targeted at the single current answer.
  function terminalCommandHelp(lab) {
    const commands = lab.commands || [];
    if (!commands.length) return 'No command reference available for this simulation.';
    const width = Math.max(...commands.map(c => c.cmd.length)) + 3;
    return `Available commands:\n${commands.map(c => `  ${c.cmd.padEnd(width)}${c.desc}`).join('\n')}`;
  }

  function renderTerminalLab(runtime) {
    if (runtime.complete) return completedLabMarkup(runtime);
    return `<div class="terminal-window"><div class="terminal-bar"><i class="terminal-dot"></i><i class="terminal-dot"></i><i class="terminal-dot"></i></div><div class="terminal-output">${escapeHtml(runtime.transcript)}</div><form class="terminal-input" id="terminal-form"><span class="terminal-prompt">tech@study&gt;&nbsp;</span><input id="terminal-command" autocomplete="off" spellcheck="false" placeholder="Type a command, or 'help'" aria-label="Lab command"></form></div>${runtime.feedback ? `<div class="lab-feedback">${escapeHtml(runtime.feedback)}</div>` : ''}<div class="button-row" style="margin-top:14px"><button class="ghost small" data-action="lab-command-list">Command list</button><button class="ghost small" data-action="lab-hint">Show hint</button><button class="ghost small" data-action="reset-lab">Restart lab</button></div>`;
  }

  function renderDecisionLab(runtime) {
    if (runtime.complete) return completedLabMarkup(runtime);
    const stage = runtime.lab.stages[runtime.stage];
    return `<div class="question-meta"><span class="tag teal">Step ${runtime.stage + 1} of ${runtime.lab.stages.length}</span></div><h2>${escapeHtml(stage.question)}</h2><div class="decision-list">${stage.options.map((option, index) => `<button class="decision-button" data-action="decision-answer" data-index="${index}">${letters[index]}. ${escapeHtml(option)}</button>`).join('')}</div>${runtime.feedback ? `<div class="lab-feedback">${escapeHtml(runtime.feedback)}</div>` : ''}`;
  }

  // Ticket panel stays visible across every node so the scenario reads like a real
  // troubleshooting case, and the log builds a breadcrumb of choices actually made.
  function ticketPanelMarkup(lab) {
    return `<div class="ticket-panel"><span class="eyebrow">Ticket</span><strong>${escapeHtml(lab.ticket.subject)}</strong><ul>${lab.ticket.details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}</ul></div>`;
  }

  function scenarioLogMarkup(log) {
    if (!log.length) return '';
    return `<div class="scenario-log">${log.map(entry => `<div class="scenario-log-item"><small>${escapeHtml(entry.prompt)}</small><strong>${escapeHtml(entry.choice)}</strong></div>`).join('')}</div>`;
  }

  function renderScenarioLab(runtime) {
    const lab = runtime.lab; const node = lab.nodes[runtime.nodeId];
    if (node.end) {
      return `${ticketPanelMarkup(lab)}${scenarioLogMarkup(runtime.log)}
        <div class="empty-state ${node.success ? '' : 'scenario-fail'}"><div><span class="stat-icon" style="margin:0 auto 14px">${icon(node.success ? 'trophy' : 'alert')}</span><h2>${node.success ? 'Ticket resolved' : 'Not quite — dead end'}</h2><p>${escapeHtml(node.prompt)}</p>${node.success ? `<p style="margin-top:10px">${escapeHtml(lab.explanation)}</p>` : ''}
          <div class="button-row" style="justify-content:center;margin-top:16px">${node.success ? `<button class="primary" data-action="exit-lab">Choose another case</button><button class="secondary" data-action="reset-lab">Run again</button>` : `<button class="primary" data-action="reset-lab">Try again</button><button class="secondary" data-action="exit-lab">Choose another case</button>`}</div>
        </div></div>`;
    }
    return `${ticketPanelMarkup(lab)}${scenarioLogMarkup(runtime.log)}
      <div class="question-meta"><span class="tag teal">Step ${runtime.log.length + 1}</span></div>
      <h2>${escapeHtml(node.prompt)}</h2>
      <div class="decision-list">${node.options.map((option, index) => `<button class="decision-button" data-action="scenario-choice" data-next="${escapeHtml(option.next)}" data-label="${escapeHtml(option.label)}" data-prompt="${escapeHtml(node.prompt)}">${letters[index] || index + 1}. ${escapeHtml(option.label)}</button>`).join('')}</div>`;
  }

  function guiRequirementPass(req, value) {
    if ('equals' in req) return value === req.equals;
    if ('notEquals' in req) return !!value && value !== req.notEquals;
    return true;
  }

  function guiControlMarkup(control, value) {
    if (control.kind === 'toggle') {
      return `<div class="gui-row"><div><strong>${escapeHtml(control.label)}</strong>${control.hint ? `<small>${escapeHtml(control.hint)}</small>` : ''}</div><label class="switch"><input type="checkbox" data-action="gui-toggle" data-control="${control.id}" ${value ? 'checked' : ''}><span></span></label></div>`;
    }
    if (control.kind === 'select') {
      return `<div class="gui-row"><div><strong>${escapeHtml(control.label)}</strong>${control.hint ? `<small>${escapeHtml(control.hint)}</small>` : ''}</div><select class="gui-select" data-control="${control.id}">${control.options.map(opt => `<option value="${escapeHtml(opt)}" ${value === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('')}</select></div>`;
    }
    return `<div class="gui-row"><div><strong>${escapeHtml(control.label)}</strong>${control.hint ? `<small>${escapeHtml(control.hint)}</small>` : ''}</div><input type="text" class="gui-text-input" data-control="${control.id}" value="${escapeHtml(value || '')}" placeholder="${escapeHtml(control.placeholder || '')}"></div>`;
  }

  function guiResultsMarkup(results) {
    return `<div class="gui-results">${results.map(r => `<div class="gui-check-row ${r.pass ? 'pass' : 'fail'}">${icon(r.pass ? 'check' : 'x')}<span>${escapeHtml(r.pass ? (r.label || 'Correct.') : (r.hint || 'Not quite right yet.'))}</span></div>`).join('')}</div>`;
  }

  // Rendered as prose excerpted from a real document (policy, order form, standard) rather
  // than a clean bullet list of exactly the facts needed — a technician reads a whole
  // paragraph and pulls out what's relevant, including text that doesn't map to any control.
  function referencePanelMarkup(ref) {
    return `<div class="ticket-panel"><span class="eyebrow">${escapeHtml(ref.title)}</span>${ref.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}</div>`;
  }

  // The GUI lab type simulates a real application (settings panel, admin console, switch web
  // UI) with tabs and live controls, rather than a fixed MCQ or typed-command flow — closer to
  // the actual hands-on task than picking an answer or following a prescribed command sequence.
  // Every control's correct end state has to be derivable from lab.reference (a ticket/work
  // order/policy sheet shown the whole time) or general domain knowledge — never a fact that
  // only surfaces after guessing and hitting Verify, or this stops testing knowledge and starts
  // testing luck.
  function renderGuiLab(runtime) {
    if (runtime.complete) return completedLabMarkup(runtime);
    const lab = runtime.lab;
    const panelId = runtime.activePanel; const panel = lab.panels[panelId];
    const tabsMarkup = lab.tabs && lab.tabs.length > 1
      ? `<div class="domain-tabs">${lab.tabs.map(id => `<button class="tab-button ${id === panelId ? 'active' : ''}" data-action="gui-tab" data-panel="${id}">${escapeHtml(lab.panels[id].label)}</button>`).join('')}</div>` : '';
    return `${lab.reference ? referencePanelMarkup(lab.reference) : ''}
      <div class="notice" ${lab.reference ? 'style="margin-top:16px"' : ''}>${icon('target')}<span>${escapeHtml(lab.goal)}</span></div>
      <div class="gui-app" style="margin-top:16px">
        <div class="gui-app-bar">${escapeHtml(lab.app)}</div>
        ${tabsMarkup ? `<div style="padding:14px 18px 0">${tabsMarkup}</div>` : ''}
        <div class="gui-panel">${panel.controls.map(control => guiControlMarkup(control, runtime.controlState[control.id])).join('')}</div>
      </div>
      ${runtime.results ? guiResultsMarkup(runtime.results) : ''}
      <div class="button-row" style="margin-top:16px"><button class="primary" data-action="gui-verify">Verify configuration</button><button class="ghost" data-action="reset-lab">Reset</button></div>`;
  }

  // A reusable, theme-aware schematic of a generic 3D-app workspace (toolbar / viewport /
  // outliner / properties / timeline), used by 'visual' labs to show WHERE in the interface
  // each step happens. It's a labeled diagram, not a pixel-accurate screenshot — that's stated
  // in-app so it's never mistaken for an exact match to any specific Blender version's UI.
  // labelPos is an explicit anchor rather than derived from the zone's box — the zones span
  // wildly different shapes (a thin toolbar strip vs. the whole viewport), so a single formula
  // kept landing labels in places disconnected from the actual highlighted area.
  const BLENDER_ZONES = {
    header: { x: 1, y: 1, w: 638, h: 23, labelPos: [200, 34] },
    toolbar: { x: 1, y: 24, w: 39, h: 259, labelPos: [45, 210] },
    viewport: { x: 40, y: 24, w: 300, h: 260, labelPos: [48, 34] },
    'viewport-right': { x: 340, y: 24, w: 120, h: 260, labelPos: [348, 34] },
    outliner: { x: 460, y: 24, w: 160, h: 90, labelPos: [466, 30] },
    properties: { x: 460, y: 114, w: 160, h: 170, labelPos: [466, 120] },
    timeline: { x: 40, y: 284, w: 420, h: 55, labelPos: [48, 262] }
  };

  // Fixed Blender-dark palette for the mockup "screen" — deliberately NOT tied to the app's
  // own light/dark theme, since real Blender looks like this regardless of what theme the
  // study app itself is in. Only the highlight ring / callout label use the app's own accent
  // color, so it's visually obvious which parts are "real Blender" vs. "this app pointing at it."
  const BC = { f1: '#8c8c8c', f2: '#6f6f6f', f3: '#565656', edge: '#1e1e1e', sel: '#e8792a', light: '#f5c451', cam: '#d9d9d9', muted: '#8a8a8a', ic: '#c7c7c7', icDim: '#8f8f8f' };

  function blenderMockupShape(name) {
    const cube = (tx, ty, opts) => {
      const o = opts || {};
      if (o.dashed) return `<g transform="translate(${tx},${ty})" opacity="${o.opacity ?? 1}"><path d="M0 40 L0 90 L60 90 L60 40 Z" fill="none" stroke="${BC.edge}" stroke-width="1.3" stroke-dasharray="4 3"/></g>`;
      return `<g transform="translate(${tx},${ty})" opacity="${o.opacity ?? 1}">
        <path d="M0 40 L15 25 L75 25 L60 40 Z" fill="${BC.f1}" stroke="${BC.edge}" stroke-width="1.1"/>
        <path d="M60 40 L75 25 L75 75 L60 90 Z" fill="${BC.f3}" stroke="${BC.edge}" stroke-width="1.1"/>
        <path d="M0 40 L0 90 L60 90 L60 40 Z" fill="${BC.f2}" stroke="${BC.edge}" stroke-width="1.1"/>
        ${o.selected !== false ? `<path d="M0 40 L15 25 L75 25 L75 75 L60 90 L0 90 Z" fill="none" stroke="${BC.sel}" stroke-width="1.8" stroke-linejoin="round"/>` : ''}
      </g>`;
    };
    const light = (cx, cy, scale, opacity) => `<g transform="translate(${cx},${cy}) scale(${scale ?? 1})" opacity="${opacity ?? 1}"><circle r="16" fill="none" stroke="${BC.light}" stroke-width="2"/><circle r="4" fill="${BC.light}"/><g stroke="${BC.light}" stroke-width="1.4" opacity=".85"><line x1="0" y1="-26" x2="0" y2="-20"/><line x1="18" y1="-18" x2="14" y2="-14"/><line x1="-18" y1="-18" x2="-14" y2="-14"/><line x1="26" y1="0" x2="20" y2="0"/><line x1="-26" y1="0" x2="-20" y2="0"/></g></g>`;
    const camera = (tx, ty) => `<g transform="translate(${tx},${ty})" fill="none" stroke="${BC.cam}" stroke-width="1.5"><rect x="0" y="-4" width="20" height="16" rx="2"/><path d="M20 -8 L38 -16 L38 20 L20 12 Z"/><circle cx="10" cy="4" r="4"/></g>`;
    const cursor = (cx, cy) => `<g fill="none"><circle cx="${cx}" cy="${cy}" r="9" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="${cx}" cy="${cy}" r="9" stroke="#e2483f" stroke-width="1.5" stroke-dasharray="3 3" stroke-dashoffset="3"/><line x1="${cx - 13}" y1="${cy}" x2="${cx + 13}" y2="${cy}" stroke="#e2483f" stroke-width="1.3"/><line x1="${cx}" y1="${cy - 13}" x2="${cx}" y2="${cy + 13}" stroke="#e2483f" stroke-width="1.3"/></g>`;
    const arc = (cx, cy, r) => `<path d="M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r * 0.3} ${cy - r * 0.95}" fill="none" stroke="var(--primary)" stroke-width="2" marker-end="url(#mockup-arrow)"/>`;
    if (name === 'cube') return cube(160, 100);
    if (name === 'cube-up') return `${cube(160, 130, { opacity: .3, dashed: true })}<path d="M195 165 L195 118" stroke="var(--primary)" stroke-width="2" marker-end="url(#mockup-arrow)"/>${cube(160, 60)}`;
    if (name === 'light') return `${light(190, 90)}${cube(160, 150, { opacity: .75 })}`;
    if (name === 'light-two') return `${light(190, 80)}${light(120, 135, .55, .8)}${cube(160, 160, { opacity: .75 })}`;
    if (name === 'cube-rotate') return `${cube(160, 100)}${arc(190, 130, 34)}`;
    if (name === 'cube-scale') return `${cube(160, 100)}<g stroke="var(--primary)" stroke-width="2"><line x1="150" y1="130" x2="128" y2="152" marker-end="url(#mockup-arrow)"/><line x1="230" y1="130" x2="252" y2="152" marker-end="url(#mockup-arrow)"/><line x1="150" y1="130" x2="128" y2="108" marker-end="url(#mockup-arrow)"/><line x1="230" y1="130" x2="252" y2="108" marker-end="url(#mockup-arrow)"/></g>`;
    if (name === 'cube-array') return `${cube(110, 112, { opacity: .95 })}${cube(170, 112, { opacity: .7, selected: false })}${cube(230, 112, { opacity: .45, selected: false })}`;
    if (name === 'cube-mirror') return `<line x1="215" y1="46" x2="215" y2="278" stroke="${BC.muted}" stroke-width="1.4" stroke-dasharray="4 3"/>${cube(140, 100)}${cube(220, 100, { opacity: .55, dashed: true })}`;
    if (name === 'cube-parent') return `${cube(140, 120)}${cube(235, 85, { opacity: .7, selected: false })}<line x1="185" y1="150" x2="258" y2="112" stroke="${BC.muted}" stroke-width="1.4" stroke-dasharray="3 2"/>`;
    if (name === 'cube-collection') return `<rect x="115" y="60" width="185" height="150" rx="8" fill="none" stroke="${BC.muted}" stroke-width="1.4" stroke-dasharray="4 3"/>${cube(140, 110, { opacity: .95 })}${cube(215, 130, { opacity: .8, selected: false })}`;
    if (name === 'material-cube') return `${cube(160, 100)}<path d="M160 140 L220 140 L220 190 L160 190 Z" fill="var(--primary)" opacity=".55" stroke="var(--primary)" stroke-width="1.4"/>`;
    if (name === 'texture-cube') return `${cube(160, 100)}${Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => `<rect x="${160 + c * 15}" y="${140 + r * 12}" width="15" height="12" fill="${(r + c) % 2 ? '#cfcfcf' : '#5a5a5a'}" opacity=".55"/>`).join('')).join('')}`;
    if (name === 'shader-mix') return `${cube(120, 100, { selected: false })}<circle cx="285" cy="140" r="10" fill="${BC.sel}" opacity=".8"/><circle cx="255" cy="140" r="10" fill="var(--primary)" opacity=".8"/><path d="M245 165 L265 165" stroke="${BC.muted}" stroke-width="1.4" marker-end="url(#mockup-arrow)"/>`;
    if (name === 'camera-cube') return `${cube(150, 110)}${camera(248, 62)}<line x1="250" y1="84" x2="215" y2="112" stroke="${BC.cam}" stroke-width="1.2" stroke-dasharray="2 2"/>`;
    if (name === 'dof-cube') return `${cube(210, 100, { opacity: .3, dashed: true })}${cube(140, 130)}${camera(245, 60)}`;
    if (name === 'hdri-cube') return `<circle cx="215" cy="150" r="90" fill="none" stroke="${BC.light}" stroke-width="1.2" stroke-dasharray="3 3" opacity=".55"/>${cube(160, 105, { opacity: .95 })}`;
    if (name === 'frame-black') return `<rect x="120" y="70" width="180" height="120" fill="#141414" stroke="#c25454" stroke-width="1.6"/><text x="210" y="135" font-size="11" fill="#d97a7a" text-anchor="middle">empty render</text>`;
    if (name === 'frame-good') return `${cube(140, 100, { opacity: .9 })}<rect x="235" y="150" width="46" height="34" rx="3" fill="none" stroke="#5fbf7a" stroke-width="1.6"/><path d="M243 168 L253 178 L271 156" fill="none" stroke="#5fbf7a" stroke-width="2"/>`;
    if (name === 'sequence-frames') return Array.from({ length: 5 }, (_, i) => `<rect x="${110 + i * 40}" y="120" width="30" height="40" rx="2" fill="none" stroke="var(--primary)" stroke-width="1.4" opacity="${1 - i * 0.12}"/>`).join('');
    if (name === 'cursor-mark') return `${cube(160, 100, { opacity: .55, selected: false })}${cursor(255, 190)}`;
    if (name === 'orbit-path') return `<ellipse cx="215" cy="150" rx="88" ry="30" fill="none" stroke="${BC.muted}" stroke-width="1.4" stroke-dasharray="4 3"/>${cube(185, 135, { opacity: .8 })}${camera(270, 100)}`;
    if (name === 'bracket') return `<g transform="translate(150,80)"><path d="M0 0 L60 0 L60 30 L20 30 L20 90 L0 90 Z" fill="${BC.f2}" stroke="${BC.edge}" stroke-width="1.2"/><path d="M0 0 L15 -12 L75 -12 L60 0 Z" fill="${BC.f1}" stroke="${BC.edge}" stroke-width="1.2"/><path d="M60 0 L75 -12 L75 18 L60 30 Z" fill="${BC.f3}" stroke="${BC.edge}" stroke-width="1.2"/></g>`;
    if (name === 'wireframe-cube') return `<g transform="translate(160,100)" fill="none" stroke="#b8b8b8" stroke-width="1.2"><path d="M0 40 L15 25 L75 25 L60 40 Z"/><path d="M60 40 L75 25 L75 75 L60 90 Z"/><path d="M0 40 L0 90 L60 90 L60 40 Z"/><path d="M15 25 L15 75 M75 25 L60 40" stroke-dasharray="2 2" opacity=".6"/></g>`;
    return cube(160, 100);
  }

  function blenderToolbarIcons() {
    const T = BC.ic;
    const glyphs = [
      `<rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="${T}" stroke-width="1.3" stroke-dasharray="3 2"/>`,
      `<circle cx="12" cy="12" r="5" fill="none" stroke="${T}" stroke-width="1.2" stroke-dasharray="2 2"/><line x1="12" y1="4" x2="12" y2="20" stroke="${T}" stroke-width="1"/><line x1="4" y1="12" x2="20" y2="12" stroke="${T}" stroke-width="1"/>`,
      `<line x1="12" y1="3" x2="12" y2="21" stroke="${T}" stroke-width="1.3"/><line x1="3" y1="12" x2="21" y2="12" stroke="${T}" stroke-width="1.3"/><path d="M12 3 L9 7 M12 3 L15 7 M12 21 L9 17 M12 21 L15 17 M3 12 L7 9 M3 12 L7 15 M21 12 L17 9 M21 12 L17 15" stroke="${T}" stroke-width="1.1" fill="none"/>`,
      `<path d="M6 12a6 6 0 1 1 2 4.5" fill="none" stroke="${T}" stroke-width="1.4"/><path d="M6 12 L4 15 M6 12 L9 13.5" stroke="${T}" stroke-width="1.2" fill="none"/>`,
      `<rect x="9" y="9" width="6" height="6" fill="none" stroke="${T}" stroke-width="1.3"/><line x1="3" y1="3" x2="9" y2="9" stroke="${T}" stroke-width="1.2"/><line x1="21" y1="21" x2="15" y2="15" stroke="${T}" stroke-width="1.2"/>`
    ];
    return glyphs.map((g, i) => `<rect x="8" y="${36 + i * 44}" width="24" height="24" rx="5" fill="#383838" stroke="#232323"/><g transform="translate(8,${36 + i * 44})">${g}</g>`).join('');
  }

  function blenderShadingIcons() {
    const fills = ['none', '#9a9a9a', '#5b93c9', BC.sel];
    return fills.map((fill, i) => `<circle cx="${400 + i * 15}" cy="33" r="5" fill="${fill}" stroke="${BC.ic}" stroke-width="1"/>`).join('');
  }

  function blenderOutlinerRow(glyph, glyphColor, label, y, active) {
    return `${active ? `<rect x="480" y="${y - 8}" width="94" height="11" rx="2" fill="var(--primary)" opacity=".2"/>` : ''}<text x="486" y="${y}" font-size="8.5" fill="${glyphColor}">${glyph}</text><text x="498" y="${y}" font-size="8.5" fill="${active ? '#ffffff' : '#a3a3a3'}" font-weight="${active ? '700' : '400'}">${escapeHtml(label)}</text>`;
  }

  const PROP_TABS = [
    { key: 'render', draw: c => `<rect x="3" y="2" width="12" height="9" rx="1" fill="none" stroke="${c}" stroke-width="1.3"/><circle cx="9" cy="6.5" r="2.2" fill="none" stroke="${c}" stroke-width="1.1"/>` },
    { key: 'output', draw: c => `<rect x="2" y="4" width="14" height="8" rx="1" fill="none" stroke="${c}" stroke-width="1.3"/><rect x="5" y="1" width="8" height="4" fill="none" stroke="${c}" stroke-width="1.1"/>` },
    { key: 'world', draw: c => `<circle cx="9" cy="7" r="6.5" fill="none" stroke="${c}" stroke-width="1.3"/><path d="M2.5 7 H15.5 M9 .5 V13.5 M4 3 Q9 7 4 11 M14 3 Q9 7 14 11" stroke="${c}" stroke-width=".9" fill="none"/>` },
    { key: 'object', draw: c => `<rect x="3" y="3" width="12" height="12" rx="1.5" fill="none" stroke="${c}" stroke-width="1.3"/>` },
    { key: 'modifier', draw: c => `<path d="M4 12 L9 7 M11 3.5 a2.3 2.3 0 1 1 -3.2 3.2 L4 10 2.5 13.5 5 15 8.5 11.3 a2.3 2.3 0 0 0 2.5-1.5Z" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/>` },
    { key: 'data', draw: (c, dyn) => dyn === 'light' ? `<circle cx="9" cy="7" r="4.5" fill="none" stroke="${c}" stroke-width="1.2"/><line x1="9" y1=".5" x2="9" y2="2" stroke="${c}" stroke-width="1"/><line x1="9" y1="12" x2="9" y2="13.5" stroke="${c}" stroke-width="1"/>` : dyn === 'camera' ? `<rect x="2" y="5" width="9" height="7" rx="1" fill="none" stroke="${c}" stroke-width="1.2"/><path d="M11 6 L16 3 V13 L11 10 Z" fill="none" stroke="${c}" stroke-width="1.1"/>` : `<path d="M9 2 L16 13 H2 Z" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/>` },
    { key: 'material', draw: c => `<circle cx="9" cy="7" r="6.5" fill="none" stroke="${c}" stroke-width="1.3"/><path d="M3 4 a6.5 6.5 0 0 0 0 6" stroke="${c}" stroke-width="1" fill="none"/>` }
  ];

  function blenderPropContent() {
    return Array.from({ length: 3 }, (_, i) => `<rect x="496" y="${144 + i * 28}" width="14" height="14" rx="3" fill="#454545" stroke="#232323"/><rect x="516" y="${148 + i * 28}" width="92" height="6" rx="3" fill="#454545"/>`).join('');
  }

  function blenderMockupSvg(step) {
    const zone = BLENDER_ZONES[step.zone] || BLENDER_ZONES.viewport;
    const [zLabelX, zLabelY] = zone.labelPos;
    const labelWidth = step.note ? Math.min(260, 24 + step.note.length * 5.6) : 0;
    const labelX = Math.min(zLabelX, 636 - labelWidth);
    const activeTab = step.propTab || null;
    const dynData = activeTab === 'light' ? 'light' : activeTab === 'camera' ? 'camera' : null;
    const isLight = step.shape && step.shape.indexOf('light') !== -1;
    const isCamera = step.shape === 'camera-cube' || step.shape === 'dof-cube' || step.shape === 'orbit-path';
    return `<svg viewBox="0 0 640 340" class="blender-mockup" role="img" aria-label="${escapeHtml(step.instruction)}">
      <defs><marker id="mockup-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="var(--primary)"/></marker></defs>
      <rect x="1" y="1" width="638" height="338" rx="10" fill="#2c2c2c" stroke="var(--border)"/>
      <rect x="1" y="1" width="638" height="23" fill="#303030"/>
      <text x="12" y="16" font-size="9" fill="${BC.icDim}">File  Edit  Render  Window  Help</text>
      <rect x="478" y="4" width="152" height="16" rx="3" fill="#383838"/>
      <text x="486" y="15" font-size="7.5" fill="${BC.icDim}">Layout   Modeling   Shading</text>
      <rect x="1" y="24" width="39" height="259" fill="#303030"/>
      ${blenderToolbarIcons()}
      <rect x="40" y="24" width="420" height="260" fill="#393939"/>
      <rect x="40" y="24" width="420" height="18" fill="#333333"/>
      <rect x="46" y="27" width="74" height="12" rx="6" fill="#454545"/>
      <text x="52" y="36" font-size="7.5" fill="${BC.ic}">Object Mode ▾</text>
      ${blenderShadingIcons()}
      ${Array.from({ length: 6 }, (_, i) => `<line x1="${80 + i * 60}" y1="42" x2="${80 + i * 60}" y2="284" stroke="#3f3f3f" stroke-width="1"/>`).join('')}
      ${Array.from({ length: 5 }, (_, i) => `<line x1="40" y1="${70 + i * 43}" x2="460" y2="${70 + i * 43}" stroke="#3f3f3f" stroke-width="1"/>`).join('')}
      <line x1="40" y1="196" x2="460" y2="196" stroke="#7a4040" stroke-width="1.2"/>
      <line x1="250" y1="42" x2="250" y2="284" stroke="#3f6b3f" stroke-width="1.2"/>
      ${blenderMockupShape(step.shape)}
      ${step.shapeNote ? `<text x="250" y="272" font-size="10" fill="#9a9a9a" text-anchor="middle">${escapeHtml(step.shapeNote)}</text>` : ''}
      <g transform="translate(432,52)">
        <circle r="20" fill="#333333" opacity=".55"/>
        <line x1="0" y1="0" x2="0" y2="-13" stroke="#c65c5c" stroke-width="1.3"/><circle cx="0" cy="-13" r="5" fill="#c65c5c"/>
        <line x1="0" y1="0" x2="12" y2="7" stroke="#7fbf6a" stroke-width="1.3"/><circle cx="12" cy="7" r="5" fill="#7fbf6a"/>
        <line x1="0" y1="0" x2="-12" y2="7" stroke="#5b93c9" stroke-width="1.3"/><circle cx="-12" cy="7" r="5" fill="#5b93c9"/>
      </g>
      <rect x="460" y="24" width="160" height="90" fill="#3a3a3a" stroke="#232323"/>
      <text x="468" y="35" font-size="7.5" fill="${BC.icDim}" font-weight="700" letter-spacing="1">OUTLINER</text>
      <text x="468" y="48" font-size="8" fill="#c7c7c7">▾ Scene Collection</text>
      <text x="476" y="59" font-size="8" fill="#c7c7c7">▾ Collection</text>
      ${blenderOutlinerRow('■', BC.sel, 'Cube', 71, !isLight && !isCamera)}
      ${blenderOutlinerRow('◆', BC.light, 'Light', 83, isLight)}
      ${blenderOutlinerRow('▲', BC.cam, 'Camera', 95, isCamera)}
      <rect x="460" y="114" width="160" height="170" fill="#3a3a3a" stroke="#232323"/>
      <text x="468" y="128" font-size="7.5" fill="${BC.icDim}" font-weight="700" letter-spacing="1">PROPERTIES</text>
      ${PROP_TABS.map((p, i) => { const on = activeTab === p.key; const y = 138 + i * 20; return `${on ? `<rect x="462" y="${y - 2}" width="22" height="20" rx="3" fill="var(--primary)" opacity=".22"/>` : ''}<g transform="translate(464,${y})">${p.draw(on ? BC.sel : '#9a9a9a', dynData)}</g>`; }).join('')}
      ${blenderPropContent()}
      <rect x="40" y="284" width="420" height="55" fill="#303030"/>
      <g transform="translate(48,296)">
        <path d="M0 0 L0 8 M2 4 L-4 0 L-4 8 Z" fill="${BC.ic}"/>
        <path d="M12 4 L18 0 L18 8 Z" fill="${BC.ic}"/>
        <rect x="26" y="-1" width="34" height="10" rx="2" fill="#454545"/>
        <text x="43" y="7" font-size="7.5" fill="${BC.ic}" text-anchor="middle">1</text>
      </g>
      <text x="330" y="300" font-size="8" fill="${BC.icDim}">TIMELINE</text>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${100 + i * 38}" y1="316" x2="${100 + i * 38}" y2="332" stroke="#454545" stroke-width="1"/>`).join('')}
      ${[130, 250].map(x => `<path d="M${x} 320 l5 5 -5 5 -5 -5 Z" fill="${BC.sel}"/>`).join('')}
      <line x1="80" y1="304" x2="80" y2="335" stroke="${BC.ic}" stroke-width="1.6"/><path d="M74 304 L86 304 L80 312 Z" fill="${BC.ic}"/>
      <rect x="${zone.x}" y="${zone.y}" width="${zone.w}" height="${zone.h}" fill="none" stroke="var(--primary)" stroke-width="2.5" rx="6"/>
      ${step.note ? `<rect x="${labelX}" y="${zLabelY}" width="${labelWidth}" height="19" rx="9" fill="var(--primary)"/><text x="${labelX + 10}" y="${zLabelY + 14}" font-size="10" fill="#041310" font-weight="700">${escapeHtml(step.note)}</text>` : ''}
    </svg>`;
  }

  function renderVisualLab(runtime) {
    if (runtime.complete) return completedLabMarkup(runtime);
    const lab = runtime.lab; const index = runtime.stepIndex; const step = lab.steps[index];
    return `<div class="visual-lab">
      ${blenderMockupSvg(step)}
      <p class="visual-caption">Simplified illustrative diagram — not an exact match to your Blender version's interface.</p>
      <div class="question-meta"><span class="tag teal">Step ${index + 1} of ${lab.steps.length}</span></div>
      <h2>${escapeHtml(step.instruction)}</h2>
      <div class="button-row" style="margin-top:20px">
        <button class="ghost" data-action="visual-prev" ${index === 0 ? 'disabled' : ''}>← Back</button>
        <button class="primary" data-action="visual-next">${index === lab.steps.length - 1 ? 'Finish lab' : 'Next step'} ${icon('arrow')}</button>
      </div>
    </div>`;
  }

  function completedLabMarkup(runtime) {
    return `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 14px">${icon('trophy')}</span><h2>Lab complete</h2><p>${escapeHtml(runtime.lab.explanation)}</p><div class="button-row" style="justify-content:center"><button class="primary" data-action="exit-lab">Choose another lab</button><button class="secondary" data-action="reset-lab">Run again</button></div></div></div>`;
  }

  function completeLab() {
    if (!activeLab) return;
    activeLab.complete = true;
    const elapsed = Math.floor((Date.now() - activeLab.startedAt) / 1000);
    state.completedLabs[activeLab.lab.id] = { date: new Date().toISOString(), elapsed };
    state.stats.labsCompleted = Object.keys(state.completedLabs).length;
    state.activity[todayKey()] = (state.activity[todayKey()] || 0) + 5; saveState();
    checkMilestones();
    announce('Lab complete.');
    renderLabWorkbench();
  }

  function getGuideChapters() {
    const core = CERT.cores[objectiveCore] || Object.values(CERT.cores)[0];
    return GUIDE.filter(chapter => coreByDomain[chapter.domain] === core);
  }

  // ---------- Study guide manual-reading position (scroll-tracked, not speech-tracked) ----------
  let guideVisibilityObserver = null;
  let currentlyViewedDomain = null;

  // rootMargin shrinks the observer's effective viewport to a thin band near the top — a chapter
  // only counts as "what you're reading" once its heading has scrolled up near the top of the
  // screen, not merely anywhere on screen (a page this long can have 2-3 chapters simultaneously
  // "visible" at once; only the topmost one is the one you're actually reading right now).
  function observeGuideChapters() {
    const chapters = document.querySelectorAll('.guide-chapter');
    if (!chapters.length) return;
    guideVisibilityObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
      if (!visible.length) return;
      const topMost = visible.reduce((a, b) => (a.getBoundingClientRect().top <= b.getBoundingClientRect().top ? a : b));
      currentlyViewedDomain = topMost.dataset.domainId;
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    chapters.forEach(el => guideVisibilityObserver.observe(el));
  }

  // Called at the top of every renderRoute() (see there) — whatever chapter was being watched
  // gets banked to state right before its DOM is about to be replaced or left behind, the same
  // "save right before it'd otherwise be lost" moment saveGuideResumePoint() uses for audio.
  function disconnectGuideObserver() {
    if (guideVisibilityObserver) { guideVisibilityObserver.disconnect(); guideVisibilityObserver = null; }
    if (currentlyViewedDomain) {
      state.guideReadPosition = { core: objectiveCore, domain: currentlyViewedDomain };
      saveState();
    }
    currentlyViewedDomain = null;
  }

  // ---------- Study guide read-aloud (Web Speech API — no dependency, built into the browser) ----------
  // speechEpoch guards against a stale utterance's onend firing after that chapter's queue was
  // superseded (stopped, or restarted via a second click) — window.speechSynthesis.cancel() does
  // not reliably suppress 'onend' on the utterance that was mid-speech across every browser, so
  // comparing domain ids alone isn't enough: restarting the SAME chapter would otherwise still
  // look "unchanged" to that check and incorrectly auto-advance once the stale handler fires.
  let speakingDomain = null;
  let speechEpoch = 0;
  // { index, total, label } — which segment of the current chapter is on-air, and the section
  // heading it belongs to (or "Overview" for the opening one). Drives the floating bar only —
  // the in-page word highlight below is tracked separately since it targets real chapter DOM,
  // not the bar.
  let speechProgress = null;
  // The element currently showing the in-place highlight, and its original (unhighlighted)
  // innerHTML so it can be restored exactly — a new segment starting, a stop, or the whole
  // chapter finishing all revert whichever element was highlighted before touching anything else.
  let activeHighlightEl = null;
  let activeHighlightOriginalHtml = null;

  function clearGuideHighlight() {
    if (activeHighlightEl) activeHighlightEl.innerHTML = activeHighlightOriginalHtml;
    activeHighlightEl = null;
    activeHighlightOriginalHtml = null;
  }

  function setGuideHighlightTarget(el) {
    clearGuideHighlight();
    if (!el) return;
    activeHighlightEl = el;
    activeHighlightOriginalHtml = el.innerHTML;
  }

  // Highlights everything read so far in the current segment (not just the on-air word) — read
  // this against the actual chapter paragraph, so pausing anywhere leaves an unambiguous "read
  // vs. not yet read" boundary to resume from, not a single word that's easy to lose track of.
  function applyGuideReadHighlight(text, readTo) {
    if (!activeHighlightEl) return;
    if (readTo == null) { activeHighlightEl.innerHTML = escapeHtml(text); return; }
    activeHighlightEl.innerHTML = `<mark class="guide-audio-read">${escapeHtml(text.slice(0, readTo))}</mark>${escapeHtml(text.slice(readTo))}`;
  }

  // el is the real DOM node rendering this segment's text (so onboundary can highlight it
  // in place) — null for the one-off "Domain name." announcement, which has no matching
  // paragraph of its own. Built by index against chapter.sections / section.body.split('\n\n'),
  // which is exactly the order renderStudyGuide() renders them in, so section/paragraph n here
  // is guaranteed to be the n-th .guide-section / p rendered for this chapter.
  function buildSpeechSegments(chapter, domain, articleEl) {
    const segments = [{ text: `${domain.name}.`, label: 'Overview', el: null }];
    segments.push({ text: chapter.overview, label: 'Overview', el: articleEl?.querySelector('.guide-overview') || null });
    const sectionEls = articleEl ? [...articleEl.querySelectorAll('.guide-section')] : [];
    chapter.sections.forEach((section, si) => {
      const sectionEl = sectionEls[si];
      segments.push({ text: section.heading, label: section.heading, el: sectionEl?.querySelector('h4') || null });
      const pEls = sectionEl ? [...sectionEl.querySelectorAll('p')] : [];
      section.body.split('\n\n').forEach((p, pi) => segments.push({ text: p, label: section.heading, el: pEls[pi] || null }));
    });
    return segments;
  }

  // Remembers which segment to pick back up from for whichever chapter is currently on-air —
  // called on pause/stop/switch, never on natural completion (that clears the entry instead,
  // in speakChapter's own onend, since a finished chapter has nothing left to resume).
  function saveGuideResumePoint() {
    if (!speakingDomain || !speechProgress) return;
    state.guideResume = state.guideResume || {};
    if (speechProgress.index <= 0) delete state.guideResume[speakingDomain]; // start of chapter — nothing to resume
    else state.guideResume[speakingDomain] = speechProgress.index;
    saveState();
  }

  function guideListenLabel(domainId) {
    return (state.guideResume && state.guideResume[domainId] != null) ? 'Resume' : 'Listen';
  }

  // startIndexOverride skips the saved-progress lookup entirely — used by the rate control to
  // restart the current chapter from its live position under a new rate, which is a different
  // thing from resuming a chapter you'd previously paused/stopped (state.guideResume).
  function speakChapter(domainId, startIndexOverride) {
    if (!('speechSynthesis' in window)) { toast('Read-aloud is not supported in this browser.', 'error'); return; }
    const chapters = getGuideChapters();
    const chapter = chapters.find(c => c.domain === domainId);
    const domain = domainById[domainId];
    if (!chapter || !domain) return;
    // Jumping straight to a different chapter while one is already playing (e.g. clicking
    // another chapter's own Listen button) is a de facto "leave this chapter" — remember where
    // it was, same as pause/stop, so it still shows "Resume" if you come back to it later.
    if (speakingDomain && speakingDomain !== domainId) saveGuideResumePoint();
    window.speechSynthesis.cancel();
    const myEpoch = ++speechEpoch;
    const segments = buildSpeechSegments(chapter, domain, document.getElementById(`guide-${domainId}`));
    const startIndex = Math.min(startIndexOverride != null ? startIndexOverride : (state.guideResume?.[domainId] ?? 0), segments.length - 1);
    segments.forEach((segment, i) => {
      if (i < startIndex) return; // already read in a previous session — skip straight past it
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.rate = state.settings.speechRate || 1;
      // speechSynthesis.pause()/resume() apply asynchronously — reading .paused right after
      // calling one of them can still report the pre-call value. These fire once the browser
      // actually completes the transition, so the button label ends up correct either way.
      utterance.onpause = updateGuideSpeechUI;
      utterance.onresume = updateGuideSpeechUI;
      utterance.onstart = () => {
        if (myEpoch !== speechEpoch) return; // a stale utterance from a superseded chapter
        speechProgress = { index: i, total: segments.length, label: segment.label };
        setGuideHighlightTarget(segment.el);
        updateGuideSpeechUI();
      };
      // charLength isn't universally reported — fall back to scanning to the next word
      // boundary (whitespace or sentence punctuation) from charIndex when it's missing. Some
      // voices never fire onboundary at all; in that case the paragraph just never highlights,
      // same graceful degradation as everything else here.
      utterance.onboundary = event => {
        if (myEpoch !== speechEpoch || event.name !== 'word') return;
        const start = event.charIndex;
        const length = event.charLength || (segment.text.slice(start).match(/^\S+/) || [''])[0].length;
        applyGuideReadHighlight(segment.text, start + length);
      };
      if (i === segments.length - 1) {
        utterance.onend = () => {
          if (myEpoch !== speechEpoch) return; // superseded by a stop or a newer speakChapter call
          if (state.guideResume) delete state.guideResume[domainId]; // fully read — nothing left to resume
          saveState();
          const next = chapters[chapters.findIndex(c => c.domain === domainId) + 1];
          if (next) speakChapter(next.domain);
          else { speakingDomain = null; speechProgress = null; clearGuideHighlight(); updateGuideSpeechUI(); }
        };
      }
      window.speechSynthesis.speak(utterance);
    });
    speakingDomain = domainId;
    speechProgress = { index: startIndex, total: segments.length, label: segments[startIndex].label };
    updateGuideSpeechUI();
    document.getElementById(`guide-${domainId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cycleGuideSpeechRate() {
    const rates = [0.75, 1, 1.25, 1.5];
    const next = rates[(rates.indexOf(state.settings.speechRate || 1) + 1) % rates.length];
    state.settings.speechRate = next;
    saveState();
    // Rate only applies at speak-time, so a chapter already mid-utterance has to be restarted
    // to actually hear the new speed — but only if it's genuinely playing right now; restarting
    // a paused chapter would surprise-resume audio the user didn't ask to resume.
    if (speakingDomain && speechProgress && !window.speechSynthesis.paused) speakChapter(speakingDomain, speechProgress.index);
    else updateGuideSpeechUI();
  }

  function toggleGuideSpeechPause() {
    if (!speakingDomain || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    else { window.speechSynthesis.pause(); saveGuideResumePoint(); }
    updateGuideSpeechUI();
  }

  function stopGuideSpeech() {
    if (!speakingDomain) return;
    saveGuideResumePoint();
    speechEpoch++;
    window.speechSynthesis.cancel();
    speakingDomain = null;
    speechProgress = null;
    clearGuideHighlight();
    updateGuideSpeechUI();
  }

  // Patches just the play/pause buttons and the stop control in place, rather than a full
  // renderRoute() — a re-render would scroll back to the page top on every pause/resume click,
  // which is exactly the moment someone mid-chapter least wants to lose their scroll position.
  function updateGuideSpeechUI() {
    document.querySelectorAll('.guide-chapter').forEach(article => {
      const btn = article.querySelector('[data-action="guide-speak"], [data-action="guide-speak-toggle"]');
      if (!btn) return;
      const isActive = speakingDomain === article.dataset.domainId;
      const isPaused = isActive && window.speechSynthesis.paused;
      article.classList.toggle('guide-reading', isActive);
      btn.dataset.action = isActive ? 'guide-speak-toggle' : 'guide-speak';
      btn.innerHTML = `${icon(isActive && !isPaused ? 'pause' : 'play')} ${isActive ? (isPaused ? 'Resume' : 'Pause') : guideListenLabel(article.dataset.domainId)}`;
    });
    document.getElementById('guide-stop-speech')?.classList.toggle('hidden', !speakingDomain);
    updateGuideAudioBar();
  }

  // A small floating "now reading" overlay — fixed-position so it stays put regardless of scroll,
  // which matters most for the auto-advance case: it's the only cue that playback has moved on to
  // a new chapter while you're scrolled somewhere else on what can be a very long guide page. The
  // actual read-along highlight lives in the chapter text itself (setGuideHighlightTarget /
  // applyGuideReadHighlight above), not here — this bar is just chapter/section/progress + controls.
  function updateGuideAudioBar() {
    const bar = document.getElementById('guide-audio-bar');
    if (!bar) return;
    if (!speakingDomain || !speechProgress) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    const domain = domainById[speakingDomain];
    const isPaused = window.speechSynthesis.paused;
    const pct = speechProgress.total ? Math.round(((speechProgress.index + 1) / speechProgress.total) * 100) : 0;
    bar.classList.remove('hidden');
    bar.innerHTML = `<button class="icon-button small" type="button" data-action="guide-speak-toggle" aria-label="${isPaused ? 'Resume' : 'Pause'}">${icon(isPaused ? 'play' : 'pause')}</button>
      <button type="button" class="guide-audio-info" data-action="guide-jump" data-domain-id="${speakingDomain}">
        <strong>${escapeHtml(domain.name)}</strong>
        <small>${escapeHtml(speechProgress.label)}</small>
        <div class="guide-audio-progress"><div class="guide-audio-progress-bar" style="width:${pct}%"></div></div>
      </button>
      <button class="guide-audio-rate" type="button" data-action="guide-speak-rate" aria-label="Playback speed">${state.settings.speechRate || 1}×</button>
      <button class="icon-button small" type="button" data-action="guide-speak-stop" aria-label="Stop reading">${icon('x')}</button>`;
  }

  // ---------- Study guide highlighting (persisted, textbook-style — distinct from the temporary
  // read-along highlight above, which overwrites innerHTML transiently and never touches this data) ----------
  function guideHighlightsFor(domainId, section, para) {
    return (state.guideHighlights[domainId] || []).filter(h => h.section === section && h.para === para).sort((a, b) => a.start - b.start);
  }

  // A small real-highlighter-style pack — each name is also the exact CSS custom-property token
  // (var(--amber) etc.), already contrast-tuned for both themes, so no new color tokens needed.
  const HIGHLIGHT_COLORS = ['amber', 'green', 'blue', 'violet'];
  function guideHighlightColor(color) { return HIGHLIGHT_COLORS.includes(color) ? color : 'amber'; }

  // Injects <mark> spans around highlighted substrings of a paragraph's plain text. Ranges are
  // clamped and walked in order so out-of-date offsets (e.g. from hand-edited content) can't
  // produce overlapping or malformed markup.
  function renderGuideParagraph(domainId, section, para, text) {
    const ranges = guideHighlightsFor(domainId, section, para);
    if (!ranges.length) return escapeHtml(text);
    let html = ''; let cursor = 0;
    ranges.forEach(r => {
      const start = Math.max(cursor, Math.min(r.start, text.length));
      const end = Math.max(start, Math.min(r.end, text.length));
      if (start > cursor) html += escapeHtml(text.slice(cursor, start));
      if (end > start) html += `<mark class="guide-user-highlight" style="--hl-color:var(--${guideHighlightColor(r.color)})" data-action="remove-guide-highlight" data-domain-id="${domainId}" data-highlight-id="${r.id}" title="Click to remove this highlight">${escapeHtml(text.slice(start, end))}</mark>`;
      cursor = Math.max(cursor, end);
    });
    if (cursor < text.length) html += escapeHtml(text.slice(cursor));
    return html;
  }

  // Overlapping/adjacent ranges in the same paragraph collapse into one — highlighting across an
  // existing highlight, or re-highlighting the same sentence twice, shouldn't create nested marks.
  function mergeGuideHighlights(list, section, para) {
    const others = list.filter(h => !(h.section === section && h.para === para));
    const mine = list.filter(h => h.section === section && h.para === para).sort((a, b) => a.start - b.start);
    const merged = [];
    mine.forEach(h => {
      const last = merged[merged.length - 1];
      if (last && h.start <= last.end) last.end = Math.max(last.end, h.end);
      else merged.push({ ...h });
    });
    return [...others, ...merged];
  }

  function addGuideHighlight({ domainId, section, para, start, end, color }) {
    if (!Array.isArray(state.guideHighlights[domainId])) state.guideHighlights[domainId] = [];
    const id = `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    state.guideHighlights[domainId] = mergeGuideHighlights([...state.guideHighlights[domainId], { id, section, para, start, end, color: guideHighlightColor(color), createdAt: new Date().toISOString() }], section, para);
    saveState();
    renderStudyGuide();
  }

  function removeGuideHighlight(domainId, highlightId) {
    state.guideHighlights[domainId] = (state.guideHighlights[domainId] || []).filter(h => h.id !== highlightId);
    saveState();
    // Removing from the digest should refresh the digest in place, not bounce back to the full
    // chapter list — mirrors how review-filter/review-flag re-render whichever view is active.
    if (currentRoute() === 'guide-digest') renderHighlightsDigest();
    else renderStudyGuide();
  }

  // Character offset of (node, nodeOffset) counted across ALL text in root, in document order —
  // not just relative to whatever DOM node the browser's Selection happens to start/end in, which
  // can be nested inside an existing <mark> from a prior highlight rather than the plain <p> text.
  function guideTextOffset(root, node, nodeOffset) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let offset = 0, current;
    while ((current = walker.nextNode())) {
      if (current === node) return offset + nodeOffset;
      offset += current.textContent.length;
    }
    return offset;
  }

  let pendingGuideHighlight = null;
  function hideGuideHighlightPopover() {
    pendingGuideHighlight = null;
    document.getElementById('guide-highlight-popover')?.classList.add('hidden');
  }

  function showGuideHighlightPopover(range, data) {
    pendingGuideHighlight = data;
    const popover = document.getElementById('guide-highlight-popover');
    if (!popover) return;
    const rect = range.getBoundingClientRect();
    popover.style.top = `${window.scrollY + rect.top - 42}px`;
    popover.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
    popover.classList.remove('hidden');
  }

  // A selection confined to a single highlightable paragraph (an already-indexed <p data-hl-...>
  // or the chapter's .guide-overview) offers a "Highlight" popover near it; anything else
  // (multi-paragraph selections, selections outside the guide, plain clicks) just hides it.
  function handleGuideSelection() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { hideGuideHighlightPopover(); return; }
    const range = sel.getRangeAt(0);
    const anchor = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
    const paraEl = anchor?.closest('[data-hl-domain]');
    if (!paraEl || !paraEl.contains(range.startContainer) || !paraEl.contains(range.endContainer)) { hideGuideHighlightPopover(); return; }
    const start = guideTextOffset(paraEl, range.startContainer, range.startOffset);
    const end = guideTextOffset(paraEl, range.endContainer, range.endOffset);
    if (end <= start) { hideGuideHighlightPopover(); return; }
    showGuideHighlightPopover(range, { domainId: paraEl.dataset.hlDomain, section: Number(paraEl.dataset.hlSection), para: Number(paraEl.dataset.hlPara), start, end });
  }
  document.addEventListener('mouseup', handleGuideSelection);
  document.addEventListener('scroll', () => { if (pendingGuideHighlight) hideGuideHighlightPopover(); }, true);

  // ---------- Focus timer (Pomodoro-style, independent of any quiz/lab session) ----------
  let focusTimer = null; // { phase: 'work'|'break', workMinutes, breakMinutes, endsAt, remainingMs, running }
  let focusTimerHandle = null;

  function updateFocusTimerBar() {
    const bar = document.getElementById('focus-timer-bar');
    if (!bar) return;
    if (!focusTimer) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    const remainingMs = Math.max(0, focusTimer.running ? focusTimer.endsAt - Date.now() : (focusTimer.remainingMs || 0));
    const mins = Math.floor(remainingMs / 60000), secs = Math.floor((remainingMs % 60000) / 1000);
    bar.classList.remove('hidden');
    bar.innerHTML = `<span class="focus-timer-icon">${icon(focusTimer.phase === 'work' ? 'brain' : 'flame')}</span>
      <div class="focus-timer-info"><strong>${focusTimer.phase === 'work' ? 'Focus' : 'Break'} — ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</strong><small>${focusTimer.workMinutes}m focus / ${focusTimer.breakMinutes}m break</small></div>
      <button class="icon-button small" type="button" data-action="focus-timer-toggle" aria-label="${focusTimer.running ? 'Pause' : 'Resume'}">${icon(focusTimer.running ? 'pause' : 'play')}</button>
      <button class="icon-button small" type="button" data-action="focus-timer-stop" aria-label="Stop focus timer">${icon('x')}</button>`;
  }

  // Phase-complete tone, independent of the Practice-answer sound effect toggle — reuses the same
  // lazy AudioContext and oscillator/gain envelope technique as playAnswerSound (only reusable
  // Web Audio setup in the app), just its own three-note ascending chime.
  function playFocusChime() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      const now = audioCtx.currentTime;
      [523, 659, 784].forEach((freq, i) => osc.frequency.setValueAtTime(freq, now + i * .12));
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.18, now + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .5);
      osc.start(now); osc.stop(now + .5);
    } catch {}
  }

  function tickFocusTimer() {
    if (!focusTimer || !focusTimer.running) return;
    if (focusTimer.endsAt - Date.now() <= 0) {
      const nextPhase = focusTimer.phase === 'work' ? 'break' : 'work';
      const nextMinutes = nextPhase === 'work' ? focusTimer.workMinutes : focusTimer.breakMinutes;
      playFocusChime();
      toast(nextPhase === 'break' ? "Focus block done — take a break." : "Break's over — back to it.", 'milestone');
      focusTimer = { ...focusTimer, phase: nextPhase, endsAt: Date.now() + nextMinutes * 60000 };
    }
    updateFocusTimerBar();
  }

  function startFocusTimer(workMinutes, breakMinutes) {
    focusTimer = { phase: 'work', workMinutes, breakMinutes, endsAt: Date.now() + workMinutes * 60000, remainingMs: null, running: true };
    clearInterval(focusTimerHandle);
    focusTimerHandle = setInterval(tickFocusTimer, 1000);
    updateFocusTimerBar();
    toast(`Focus timer started — ${workMinutes}m focus / ${breakMinutes}m break. Keeps running even if you switch pages.`);
  }

  function toggleFocusTimer() {
    if (!focusTimer) return;
    if (focusTimer.running) { focusTimer.remainingMs = focusTimer.endsAt - Date.now(); focusTimer.running = false; }
    else { focusTimer.endsAt = Date.now() + (focusTimer.remainingMs || 0); focusTimer.running = true; }
    updateFocusTimerBar();
  }

  function stopFocusTimer() {
    focusTimer = null;
    clearInterval(focusTimerHandle);
    focusTimerHandle = null;
    updateFocusTimerBar();
  }

  function focusTimerDialogMarkup() {
    const work = state.settings.focusWorkMinutes || 25;
    const brk = state.settings.focusBreakMinutes || 5;
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="focus-timer-title">
      <h2 id="focus-timer-title">Focus timer</h2>
      <p>A work/break timer for reading sessions — the bar at the bottom keeps running even if you switch pages.</p>
      <div class="field"><label>Focus length</label><div class="domain-tabs" style="margin:0">${[15, 25, 45, 50].map(m => `<button class="tab-button ${work === m ? 'active' : ''}" type="button" data-action="set-focus-work" data-minutes="${m}">${m}m</button>`).join('')}</div></div>
      <div class="field" style="margin-top:14px"><label>Break length</label><div class="domain-tabs" style="margin:0">${[5, 10, 15].map(m => `<button class="tab-button ${brk === m ? 'active' : ''}" type="button" data-action="set-focus-break" data-minutes="${m}">${m}m</button>`).join('')}</div></div>
      <div class="button-row" style="margin-top:16px"><button class="primary" type="button" data-action="confirm-start-focus-timer">${icon('play')} Start</button><button class="secondary" type="button" data-action="close-dialog">Cancel</button></div>
    </div>`;
  }

  // Textbook-style prose chapters, one per domain — distinct from the Glossary (term-level quick
  // reference) and the Exam Map (blueprint/weights). Not every track has chapters written yet;
  // GUIDE gracefully degrades to [] via the same `window[entry.guideGlobal] || []` pattern LABS uses.
  function renderStudyGuide() {
    const coreEntries = Object.entries(CERT.cores);
    const core = CERT.cores[objectiveCore] || Object.values(CERT.cores)[0];
    const chapters = getGuideChapters();
    // Only offer to jump back to a saved spot if it still resolves to a real chapter — content
    // could change between sessions, and a stale/mismatched position should just quietly not
    // show a banner rather than link to a chapter that's no longer there.
    const savedPosition = state.guideReadPosition;
    const resumeDomain = savedPosition && CERT.cores[savedPosition.core] && domainById[savedPosition.domain] ? domainById[savedPosition.domain] : null;
    main.innerHTML = `<div class="section-head"><div><h2>Study guide</h2><p>Plain-language chapters on what each domain actually covers, how it's used, and why it matters — read this before drilling questions, or whenever a topic still feels unfamiliar. Select any text to highlight it.</p></div>${chapters.length ? `<div class="button-row"><button class="ghost small hidden" type="button" id="guide-stop-speech" data-action="guide-speak-stop">${icon('x')} Stop reading</button><button class="ghost small" type="button" data-action="start-focus-timer">${icon('clock')} Focus timer</button><button class="ghost small" type="button" data-route="guide-digest">${icon('spark')} View highlights</button><button class="ghost small" type="button" data-route="packet">${icon('folder')} Study packet</button><button class="ghost small" type="button" data-action="print-page">${icon('download')} Print / save</button></div>` : ''}</div>
      ${resumeDomain ? `<div class="notice" style="margin-bottom:18px">${icon('book')}<span>Continue reading <strong>${escapeHtml(resumeDomain.name)}</strong>${savedPosition.core !== objectiveCore ? ` <small style="color:var(--muted-2)">(${escapeHtml(CERT.cores[savedPosition.core].name)})</small>` : ''}</span><button class="secondary small" style="margin-left:auto" data-action="guide-resume-position">${icon('arrow')} Jump there</button></div>` : ''}
      ${coreEntries.length > 1 ? `<div class="domain-tabs">${coreEntries.map(([key, c]) => `<button class="tab-button ${objectiveCore === key ? 'active' : ''}" data-action="objective-core" data-core="${key}">${escapeHtml(c.name)} · ${escapeHtml(c.code)}</button>`).join('')}</div>` : ''}
      ${chapters.length ? `<div class="domain-tabs" style="margin-bottom:24px">${chapters.map(chapter => `<button class="tab-button" data-action="guide-jump" data-domain-id="${chapter.domain}">${escapeHtml(domainById[chapter.domain].name)}</button>`).join('')}</div>` : ''}
      ${chapters.length ? chapters.map(chapter => {
          const domain = domainById[chapter.domain];
          const openLab = LABS.find(l => l.domain === domain.id && !state.completedLabs[l.id]);
          return `<article class="guide-chapter" id="guide-${domain.id}" data-domain-id="${domain.id}">
            <div class="guide-chapter-head"><div><span class="eyebrow">Domain ${domain.number} · ${domain.weight}% of the exam</span><h3>${escapeHtml(domain.name)}</h3></div><button class="ghost small" type="button" data-action="guide-speak" data-domain-id="${domain.id}">${icon('play')} ${guideListenLabel(domain.id)}</button></div>
            <p class="guide-overview" data-hl-domain="${domain.id}" data-hl-section="-1" data-hl-para="0">${renderGuideParagraph(domain.id, -1, 0, chapter.overview)}</p>
            ${chapter.sections.map((section, si) => `<div class="guide-section"><h4>${escapeHtml(section.heading)}</h4>${section.objectives ? `<div class="guide-section-meta">Covers objective${section.objectives.length === 1 ? '' : 's'} ${section.objectives.join(', ')}</div>` : ''}${section.body.split('\n\n').map((p, pi) => `<p data-hl-domain="${domain.id}" data-hl-section="${si}" data-hl-para="${pi}">${renderGuideParagraph(domain.id, si, pi, p)}</p>`).join('')}</div>`).join('')}
            <div class="guide-section guide-practice-actions">
              <div class="guide-section-meta">Now put it into practice</div>
              <div class="button-row">
                <button class="primary small" data-action="domain-drill" data-domain="${domain.id}">${icon('target')} Practice this domain</button>
                <button class="secondary small" data-action="weak-domain-flash" data-domain="${domain.id}">${icon('layers')} Flashcards</button>
                ${openLab ? `<button class="secondary small" data-action="start-lab" data-lab="${openLab.id}">${icon('terminal')} Start lab</button>` : ''}
              </div>
            </div>
          </article>`;
        }).join('')
        : `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('book')}</span><h3>No study guide yet for ${escapeHtml(core.name)}</h3><p>Written chapters haven't been added for this track yet — the Glossary and Exam Map still cover every term and objective in the meantime.</p><button class="secondary" data-route="glossary">Open Glossary</button></div></div>`}`;
    updateGuideSpeechUI();
    if (chapters.length) observeGuideChapters();
  }

  function studyPacketDomainOptions() {
    const all = Object.values(CERT.cores).flatMap(core => core.domains);
    return `<option value="all" ${packetDomain === 'all' ? 'selected' : ''}>Whole track (${all.length} domains)</option>${all.map(domain => `<option value="${domain.id}" ${packetDomain === domain.id ? 'selected' : ''}>${escapeHtml(domain.name)}</option>`).join('')}`;
  }

  // A bundled, offline-readable packet for one domain or the whole track — guide chapters, key
  // terms, and the labs that go with them, in one page meant to be printed or saved as a PDF and
  // read somewhere this app isn't open. Uses GUIDE directly (not getGuideChapters(), which is
  // scoped to whichever core's tab is currently active on the Study guide page) so "whole track"
  // genuinely means every domain across every core, not just the one you happened to be viewing.
  function renderStudyPacket() {
    const chapters = packetDomain === 'all' ? GUIDE : GUIDE.filter(chapter => chapter.domain === packetDomain);
    const concepts = allConcepts().filter(concept => packetDomain === 'all' || concept.domain === packetDomain);
    const labs = LABS.filter(lab => packetDomain === 'all' || lab.domain === packetDomain);
    main.innerHTML = `<div class="section-head"><div><h2>Study packet</h2><p>Guide chapters, key terms, and the labs that go with them, bundled for offline reading — pick one domain or the whole track, then print or save as a PDF.</p></div></div>
      <div class="builder" style="grid-template-columns:1fr auto;margin-bottom:22px">
        <div class="field"><label for="packet-domain">Domain</label><select id="packet-domain">${studyPacketDomainOptions()}</select></div>
        <button class="secondary" type="button" data-action="print-page" style="align-self:end">${icon('download')} Print / save</button>
      </div>
      ${chapters.length ? chapters.map(chapter => {
        const domain = domainById[chapter.domain];
        return `<article class="guide-chapter">
          <div class="guide-chapter-head"><div><span class="eyebrow">Domain ${domain.number} · ${domain.weight}% of the exam</span><h3>${escapeHtml(domain.name)}</h3></div></div>
          <p class="guide-overview">${escapeHtml(chapter.overview)}</p>
          ${chapter.sections.map(section => `<div class="guide-section"><h4>${escapeHtml(section.heading)}</h4>${section.objectives ? `<div class="guide-section-meta">Covers objective${section.objectives.length === 1 ? '' : 's'} ${section.objectives.join(', ')}</div>` : ''}${section.body.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}</div>`).join('')}
        </article>`;
      }).join('') : `<div class="notice" style="margin-bottom:22px">${icon('info')}<span>No written guide chapter for this domain yet — the terms and labs below still cover it.</span></div>`}
      ${concepts.length ? `<section class="panel" style="margin-bottom:22px"><div class="panel-header"><div><h2>Key terms</h2><p>${concepts.length} term${concepts.length === 1 ? '' : 's'}.</p></div></div><div class="panel-body"><div class="glossary-list">${concepts.map(concept => `<article class="glossary-item"><strong>${escapeHtml(concept.term)}</strong><p>${escapeHtml(concept.definition)}</p></article>`).join('')}</div></div></section>` : ''}
      ${labs.length ? `<section class="panel"><div class="panel-header"><div><h2>Related labs</h2><p>Hands-on practice for this material — open the app to actually run these.</p></div></div><div class="panel-body"><ul class="gap-list">${labs.map(lab => `<li><span>${escapeHtml(lab.title)}</span><span class="tag">${lab.difficulty}</span></li>`).join('')}</ul></div></section>` : ''}`;
  }

  // Every highlighted snippet across every chapter, in one place — reconstructed on demand from
  // the stored {section,para,start,end} offsets against the same chapter.overview/section.body
  // text renderGuideParagraph() reads, so there's no separate copy of the highlighted text to
  // keep in sync as chapter content changes.
  function renderHighlightsDigest() {
    const chapters = getGuideChapters();
    const groups = chapters.map(chapter => {
      const domain = domainById[chapter.domain];
      const highlights = (state.guideHighlights[domain.id] || []).slice().sort((a, b) => a.section - b.section || a.para - b.para || a.start - b.start);
      const items = highlights.map(h => {
        const sourceText = h.section === -1 ? chapter.overview : (chapter.sections[h.section]?.body.split('\n\n')[h.para] || '');
        const snippet = sourceText.slice(h.start, h.end);
        const sectionLabel = h.section === -1 ? 'Overview' : (chapter.sections[h.section]?.heading || '');
        return snippet ? { id: h.id, snippet, sectionLabel, color: guideHighlightColor(h.color) } : null;
      }).filter(Boolean);
      return items.length ? { domain, items } : null;
    }).filter(Boolean);
    const total = groups.reduce((sum, g) => sum + g.items.length, 0);
    main.innerHTML = `<div class="section-head"><div><h2>Highlights digest</h2><p>Every snippet you've marked across the Study guide, pulled into one condensed review — good for a final pass before an exam.</p></div><div class="button-row"><button class="ghost small" type="button" data-route="guide">${icon('arrow')} Back to Study guide</button>${total ? `<button class="ghost small" type="button" data-action="print-page">${icon('download')} Print / save</button>` : ''}</div></div>
      ${total ? groups.map(group => `<section class="panel" style="margin-bottom:16px"><div class="panel-header"><div><h2>${escapeHtml(group.domain.name)}</h2><p>${group.items.length} highlight${group.items.length === 1 ? '' : 's'}</p></div></div><div class="panel-body"><div class="note-list">${group.items.map(item => `<article class="note-item">
          <div class="note-item-head"><strong>${escapeHtml(item.sectionLabel)}</strong></div>
          <blockquote class="digest-quote" style="--hl-color:var(--${item.color})">${escapeHtml(item.snippet)}</blockquote>
          <div class="button-row"><button class="ghost small" data-action="guide-jump" data-domain-id="${group.domain.id}">${icon('arrow')} Jump to chapter</button><button class="ghost small" data-action="remove-guide-highlight" data-domain-id="${group.domain.id}" data-highlight-id="${item.id}">${icon('trash')} Remove</button></div>
        </article>`).join('')}</div></div></section>`).join('')
        : `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('spark')}</span><h3>No highlights yet</h3><p>Select any text in a Study guide chapter and choose "Highlight" to start building this digest.</p><button class="primary" data-route="guide">${icon('book')} Open Study guide</button></div></div>`}`;
  }

  // getDomainMetrics().seen (total answered question forms for that domain, ever) stands in for
  // real practice reps — mastery% alone can look fine while a domain worth real exam weight is
  // quietly getting a fraction of the actual practice attention the blueprint says it deserves.
  function domainEffortRows(core) {
    const rows = core.domains.map(domain => ({ domain, seen: getDomainMetrics(domain.id).seen }));
    const totalSeen = rows.reduce((sum, row) => sum + row.seen, 0);
    return rows.map(row => ({ ...row, share: totalSeen ? Math.round((row.seen / totalSeen) * 100) : 0 }));
  }

  function renderObjectives() {
    const core = CERT.cores[objectiveCore];
    const coreEntries = Object.entries(CERT.cores);
    const domainGaps = Object.fromEntries(core.domains.map(domain => [domain.id, unmasteredConcepts(domain.id)]));
    const coreGapsTotal = Object.values(domainGaps).reduce((sum, gaps) => sum + gaps.length, 0);
    const effortRows = domainEffortRows(core);
    const totalReps = effortRows.reduce((sum, row) => sum + row.seen, 0);
    main.innerHTML = `<div class="section-head"><div><h2>The official blueprint, made usable</h2><p>Study time should follow domain weight and your evidence—not chapter length or comfort. ${coreEntries.length > 1 ? `Passing every required exam earns ${escapeHtml(CERT.name)}.` : `Passing this exam earns ${escapeHtml(CERT.name)}.`}</p></div></div>
      ${coreEntries.length > 1 ? `<div class="domain-tabs">${coreEntries.map(([key, c]) => `<button class="tab-button ${objectiveCore === key ? 'active' : ''}" data-action="objective-core" data-core="${key}">${escapeHtml(c.name)} · ${escapeHtml(c.code)}</button>`).join('')}</div>` : ''}
      ${totalReps ? `<section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Practice effort vs. exam weight</h2><p>How your ${totalReps} answered question${totalReps === 1 ? '' : 's'} in ${escapeHtml(core.name)} actually split across domains, next to what the blueprint says each is worth.</p></div></div>
        <div class="panel-body"><div class="mastery-list">${effortRows.map(row => {
          const delta = row.share - row.domain.weight;
          const deltaTag = Math.abs(delta) >= 8 ? ` <span class="tag ${delta > 0 ? '' : 'amber'}">${delta > 0 ? 'over' : 'under'}-practiced ${Math.abs(delta)} pt${Math.abs(delta) === 1 ? '' : 's'}</span>` : '';
          return `<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><span>${escapeHtml(row.domain.name)}</span><span>${row.domain.weight}% of exam · ${row.share}% of your reps${deltaTag}</span></div><div class="progress-track"><div class="progress-bar" style="width:${row.domain.weight}%"></div></div><div class="progress-track" style="margin-top:3px"><div class="progress-bar" style="width:${row.share}%;background:var(--amber)"></div></div></div>`;
        }).join('')}</div></div>
      </section>` : ''}
      <section class="objective-layout"><aside class="exam-summary-card"><span class="exam-code">${core.code}</span><h2>${core.name}</h2><p>${escapeHtml(core.description)}</p><div class="summary-list"><div class="summary-line"><span>Questions</span><strong>Maximum ${core.maxQuestions}</strong></div><div class="summary-line"><span>Time</span><strong>${core.duration} minutes</strong></div><div class="summary-line"><span>Question types</span><strong>${escapeHtml(core.questionTypes || 'Multiple choice')}</strong></div><div class="summary-line"><span>Passing score</span><strong>${core.passingScore}/900</strong></div><div class="summary-line"><span>Recommended</span><strong>${escapeHtml(core.recommendedPrep || 'Hands-on practice recommended')}</strong></div></div><div class="notice" style="margin-top:16px">${icon('info')}<span>Scaled scoring is not a raw percentage. This app uses transparent estimates for learning only.</span></div>
        ${coreGapsTotal ? `<button class="primary" style="width:100%;margin-top:14px" data-action="practice-gaps">${icon('target')} Practice all ${coreGapsTotal} remaining concept${coreGapsTotal === 1 ? '' : 's'}</button>` : `<div class="notice" style="margin-top:14px">${icon('check')}<span>You've hit the mastery bar (3+ attempts, 80%+ accuracy) on every concept in ${escapeHtml(core.name)}. Domain % scores below still climb toward 100% with total rep count, so keep practicing to push those the rest of the way.</span></div>`}
      </aside>
      <div class="objective-list">${core.domains.map(domain => { const metrics = getDomainMetrics(domain.id); const gaps = domainGaps[domain.id]; const domainLabs = LABS.filter(l => l.domain === domain.id); const openLabs = domainLabs.filter(l => !state.completedLabs[l.id]); const isOpen = expandedDomains.has(domain.id); return `<article class="objective-card">
        <div class="objective-title">
          <button type="button" class="objective-toggle" data-action="toggle-domain-card" data-domain="${domain.id}" aria-expanded="${isOpen}">
            <div><span class="eyebrow">Domain ${domain.number}</span><h3>${escapeHtml(domain.name)}</h3><p>${domain.objectives.length} objective groups · ${CONCEPTS.filter(c => c.domain === domain.id).length * CERT.questionVariants} question forms</p></div>
          </button>
          <div class="objective-title-right">
            <div style="text-align:right"><strong style="font-size:24px;color:${domainAccentColor(domain)}">${domain.weight}%</strong><small style="display:block;color:var(--muted)">${metrics.mastery}% mastery</small></div>
            ${gaps.length ? `<button type="button" class="icon-button objective-drill-btn" title="Practice ${gaps.length} remaining in ${escapeHtml(domain.name)}" aria-label="Practice ${gaps.length} remaining concepts in ${escapeHtml(domain.name)}" data-action="practice-gaps" data-domain="${domain.id}">${icon('target')}</button>` : ''}
            <button type="button" class="objective-chevron-btn" data-action="toggle-domain-card" data-domain="${domain.id}" aria-expanded="${isOpen}" aria-label="${isOpen ? 'Collapse' : 'Expand'} ${escapeHtml(domain.name)}"><span class="objective-chevron" data-icon="chevron"></span></button>
          </div>
        </div>
        <div class="progress-track" style="margin-top:14px"><div class="progress-bar" style="width:${metrics.mastery}%"></div></div>
        ${isOpen ? `<div class="objective-detail">${domain.objectives.map(objective => { const om = getObjectiveMetrics(domain.id, objective.code); return `<div class="objective-row"><div class="objective-row-body"><div class="objective-mastery-head"><strong>${objective.code} · ${escapeHtml(objective.title)}</strong><span class="objective-mastery-pct${om.seen ? '' : ' dim'}">${om.seen ? `${om.mastery}%` : 'Not started'}</span></div><div class="progress-track objective-track"><div class="progress-bar" style="width:${om.mastery}%"></div></div><p class="objective-topics-line">${objective.topics.map(topic => escapeHtml(topic)).join(' · ')}</p></div><button type="button" class="icon-button objective-drill-btn" title="Drill ${objective.code}${om.seen ? ` — ${om.accuracy}% over ${om.seen}` : ''}" aria-label="Drill ${objective.code}: ${escapeHtml(objective.title)}" data-action="drill-objective" data-domain="${domain.id}" data-objective="${objective.code}">${icon('target')}</button></div>`; }).join('')}
          ${gaps.length ? `<details class="gap-details" style="margin-top:16px"><summary>${gaps.length} concept${gaps.length === 1 ? '' : 's'} below the mastery bar (3+ attempts, 80%+)</summary><ul class="gap-list">${gaps.map(item => `<li><span>${escapeHtml(item.concept.term)}</span><span class="tag ${item.status === 'Below 80%' ? 'amber' : ''}">${item.status === 'New' ? 'Not started' : item.status === 'Building' ? `${item.seen}/${MASTERY_MIN_SEEN} attempts` : `${item.accuracy}% so far`}</span></li>`).join('')}</ul></details>` : `<div class="notice" style="margin-top:16px">${icon('check')}<span>Every concept here has hit the mastery bar. The ${metrics.mastery}% score above still climbs toward 100% with more total reps in this domain — it's not a contradiction, just a slower-moving number.</span></div>`}
          ${openLabs.length ? `<div class="notice" style="margin-top:12px">${icon('terminal')}<span>${openLabs.length} hands-on lab${openLabs.length === 1 ? '' : 's'} still open here — starting with <strong>${escapeHtml(openLabs[0].title)}</strong>${openLabs.length > 1 ? ` (+${openLabs.length - 1} more)` : ''}. Quiz mastery alone won't cover the sequencing and judgment these build.</span></div>` : ''}
          <div class="button-row" style="margin-top:17px"><button class="ghost small" data-action="domain-drill" data-domain="${domain.id}">Practice this domain</button>${gaps.length ? `<button class="secondary small" data-action="practice-gaps" data-domain="${domain.id}">Practice ${gaps.length} remaining</button>` : ''}${openLabs.length ? `<button class="secondary small" data-action="start-lab" data-lab="${openLabs[0].id}">${icon('play')} Start lab</button>` : ''}</div>
        </div>` : ''}
      </article>`; }).join('')}</div></section>`;
  }

  function chartMarkup(values, labels) {
    return `<div class="bar-chart">${values.map((value, index) => `<div class="chart-bar-wrap" title="${value}%"><div class="chart-bar" style="height:${Math.max(3, value)}%"></div><small>${labels[index]}</small></div>`).join('')}</div>`;
  }

  // Full-width readiness-over-time section for the History page: an SVG line of the daily
  // readiness snapshot series (plus a fainter first-try-accuracy line), an 80% "exam-ready"
  // reference line, and a plain-language projection built from a least-squares fit.
  function readinessTrendSection() {
    const log = (state.readinessLog || []).filter(row => row && row.date);
    const countdown = examCountdown();
    if (log.length < 2) {
      return `<section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Readiness trend</h2><p>One point is plotted per day you practice. Come back after a few sessions to see the curve and a projected exam-ready date.</p></div></div><div class="panel-body"><div class="empty-state" style="min-height:130px"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('chart')}</span><p>Not enough history yet — keep practicing and this fills in.</p></div></div></div></section>`;
    }
    const series = log.slice(-40);
    const W = 320, H = 108, padX = 3, padTop = 6, padBot = 14;
    const n = series.length;
    const xAt = i => padX + (n === 1 ? 0 : (i / (n - 1)) * (W - padX * 2));
    const yAt = v => padTop + (1 - Math.max(0, Math.min(100, v)) / 100) * (H - padTop - padBot);
    const lineFor = key => series.map((row, i) => `${xAt(i).toFixed(1)},${yAt(row[key] || 0).toFixed(1)}`).join(' ');
    const areaPath = `M ${xAt(0).toFixed(1)},${(H - padBot).toFixed(1)} L ${series.map((row, i) => `${xAt(i).toFixed(1)},${yAt(row.readiness || 0).toFixed(1)}`).join(' L ')} L ${xAt(n - 1).toFixed(1)},${(H - padBot).toFixed(1)} Z`;
    const readyY = yAt(80).toFixed(1);
    const proj = readinessProjection(80);
    const current = series[series.length - 1].readiness;
    const wkDelta = readinessDelta(7);
    let projText, projTone = '';
    if (proj && proj.reached) {
      projText = `You're at ${current}% — above the 80% exam-ready bar. Keep the reps up to hold it${countdown ? ` through ${formatPlanDate(countdown.date)}` : ''}.`;
      projTone = 'teal';
    } else if (proj && proj.projectedDate) {
      const perWeek = Math.round(proj.slope * 7);
      projText = `Trending ${perWeek >= 0 ? '+' : ''}${perWeek} pts/week. On this pace you reach 80% around ${formatPlanDate(proj.projectedDate)}.`;
      if (countdown) {
        const ok = proj.projectedDate <= countdown.date;
        projText += ` Your exam is ${formatPlanDate(countdown.date)} — ${ok ? 'on track.' : 'that lands after your exam date, so tighten the pace.'}`;
        projTone = ok ? 'teal' : 'amber';
      }
    } else {
      projText = `Readiness is roughly flat at ${current}%${wkDelta != null ? ` (${wkDelta >= 0 ? '+' : ''}${wkDelta} in 7 days)` : ''}. A weak-area or missed-question session is the fastest way to move it.`;
      projTone = 'amber';
    }
    return `<section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Readiness trend</h2><p>Daily readiness (solid) and first-try accuracy (dotted). The dashed line is the 80% exam-ready bar.</p></div>${countdown ? `<span class="tag ${countdown.days <= 14 ? 'amber' : 'teal'}">Exam in ${countdown.days} day${countdown.days === 1 ? '' : 's'}</span>` : ''}</div>
      <div class="panel-body">
        <div class="trend-chart">
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Readiness over the last ${n} recorded days, currently ${current} percent">
            <defs><linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--primary)" stop-opacity="0.28"/><stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>
            <line x1="${padX}" y1="${readyY}" x2="${W - padX}" y2="${readyY}" stroke="var(--muted-2)" stroke-width="1" stroke-dasharray="4 3"/>
            <path d="${areaPath}" fill="url(#trend-fill)"/>
            <polyline points="${lineFor('accuracy')}" fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="2 3" stroke-linejoin="round"/>
            <polyline points="${lineFor('readiness')}" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
            <circle cx="${xAt(n - 1).toFixed(1)}" cy="${yAt(current).toFixed(1)}" r="3.2" fill="var(--primary)"/>
          </svg>
          <div class="trend-scale"><span>${formatPlanDate(series[0].date)}</span><span>now · ${current}%</span></div>
        </div>
        <div class="notice ${projTone}" style="margin-top:14px">${icon(projTone === 'teal' ? 'check' : projTone === 'amber' ? 'alert' : 'info')}<span>${escapeHtml(projText)}</span></div>
      </div>
    </section>`;
  }

  // GitHub-style contribution grid for the Progress page: 26 weeks (columns) x 7 days (rows),
  // reusing state.activity — the same per-day counter the streak strip (activityMarkup) already
  // reads — just over a much longer window and with month labels. grid-auto-flow:column lets the
  // cell markup stay a flat chronological list; the CSS handles laying it out week-by-week.
  function progressHeatmapMarkup() {
    const weeks = 26;
    const todayDow = new Date().getDay();
    const firstOffset = -todayDow - (weeks - 1) * 7;
    const cells = Array.from({ length: weeks * 7 }, (_, i) => {
      const offset = firstOffset + i;
      const key = todayKey(offset);
      return { key, offset, count: offset > 0 ? 0 : (state.activity[key] || 0) };
    });
    const activeDays = cells.filter(c => c.offset <= 0 && c.count > 0).length;
    const totalActivity = cells.reduce((sum, c) => sum + c.count, 0);
    let lastMonth = null;
    let lastLabelWeek = -Infinity;
    const monthLabels = [];
    cells.forEach((cell, i) => {
      if (i % 7 !== 0) return;
      const month = cell.key.slice(0, 7);
      if (month === lastMonth) return;
      lastMonth = month;
      const week = i / 7;
      // Skip a label that would visually collide with the previous one — the window's very
      // first column is often a sliver of the prior month, too narrow to fit its own label.
      if (week - lastLabelWeek < 3) return;
      lastLabelWeek = week;
      const [y, m] = cell.key.split('-').map(Number);
      monthLabels.push({ week, label: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(y, m - 1, 1)) });
    });
    const cellsHtml = cells.map(cell => {
      if (cell.offset > 0) return `<span class="heatmap-cell is-future" aria-hidden="true"></span>`;
      const level = cell.count >= 30 ? 'l3' : cell.count >= 15 ? 'l2' : cell.count > 0 ? 'l1' : '';
      return `<span class="heatmap-cell ${level}" title="${formatDateKey(cell.key)}: ${cell.count} ${cell.count === 1 ? 'activity' : 'activities'}"></span>`;
    }).join('');
    return `<section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Study activity</h2><p>Every day you've practiced, in one glance — darker means more done that day.</p></div><span class="tag">${activeDays} active day${activeDays === 1 ? '' : 's'} · ${totalActivity.toLocaleString()} total</span></div>
      <div class="panel-body">
        <div class="heatmap-scroll">
          <div class="heatmap-months" style="grid-template-columns:repeat(${weeks},11px)">${monthLabels.map(m => `<span style="grid-column:${m.week + 1}">${escapeHtml(m.label)}</span>`).join('')}</div>
          <div class="heatmap-grid" style="grid-template-columns:repeat(${weeks},11px)">${cellsHtml}</div>
        </div>
        <div class="heatmap-legend"><span>Less</span><span class="heatmap-cell"></span><span class="heatmap-cell l1"></span><span class="heatmap-cell l2"></span><span class="heatmap-cell l3"></span><span>More</span></div>
      </div>
    </section>`;
  }

  // No quiz sessions ever exist for a program, so the accuracy charts and session table below
  // would just render empty — lab completions are the only progress signal that's real here.
  function renderProgramsHistory() {
    const completedEntries = Object.entries(state.completedLabs).map(([labId, record]) => ({ lab: LABS.find(l => l.id === labId), record })).filter(entry => entry.lab).sort((a, b) => new Date(b.record.date) - new Date(a.record.date));
    const totalMinutes = completedEntries.reduce((sum, entry) => sum + (entry.lab.minutes || 0), 0);
    main.innerHTML = `<section class="history-grid" style="grid-template-columns:repeat(3,1fr)">
        <article class="chart-card"><h3>Lab completion</h3><div class="bar-chart">${(() => { const days = Array.from({ length: 14 }, (_, i) => todayKey(i - 13)); const counts = days.map(day => completedEntries.filter(e => e.record.date.slice(0, 10) === day).length); const max = Math.max(1, ...counts); return chartMarkup(counts.map(c => Math.round((c / max) * 100)), days.map(d => d.slice(5))); })()}</div></article>
        <article class="chart-card"><h3>Labs completed</h3><div style="display:grid;place-items:center;height:150px"><div class="radial" style="--value:${pct(completedEntries.length, LABS.length)}"><div class="radial-content"><strong>${completedEntries.length}/${LABS.length}</strong><small>complete</small></div></div></div></article>
        <article class="chart-card"><h3>Time practiced</h3><div style="display:grid;place-items:center;height:150px"><div class="radial-content" style="text-align:center"><strong style="font-size:32px">${totalMinutes}</strong><small style="display:block;color:var(--muted);margin-top:6px">total minutes</small></div></div></article>
      </section>
      ${progressHeatmapMarkup()}
      <section class="panel"><div class="panel-header"><div><h2>Lab history</h2><p>Every hands-on lab you've completed, most recent first.</p></div></div>${completedEntries.length ? `<div style="overflow:auto"><table class="session-table"><thead><tr><th>Date</th><th>Lab</th><th>Difficulty</th><th>Time</th></tr></thead><tbody>${completedEntries.map(entry => `<tr><td>${formatDate(entry.record.date)}</td><td><strong>${escapeHtml(entry.lab.title)}</strong></td><td>${escapeHtml(entry.lab.difficulty)}</td><td>${formatDuration(entry.record.elapsed || 0)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('terminal')}</span><h3>No labs completed yet</h3><p>Launch your first hands-on lab to start building your history.</p><button class="primary" data-route="labs">Browse labs</button></div></div>`}</section>`;
  }

  function renderHistory() {
    if (currentDomain() === 'programs') return renderProgramsHistory();
    const recent = state.sessions.slice(0, 8); const chartSessions = [...state.sessions].slice(0, 10).reverse();
    const coreEntries = Object.entries(CERT.cores);
    const coreReadiness = coreEntries.map(([id]) => getCoreReadiness(id));
    const coreLabels = coreEntries.map(([, core]) => core.name);
    const weakDomains = Object.values(domainById).map(domain => ({ name: domain.name, ...getDomainMetrics(domain.id) })).sort((a, b) => a.mastery - b.mastery).slice(0, 4);
    const examSessionCount = state.sessions.filter(s => s.type === 'exams').length;
    main.innerHTML = `${state.streakFreezes > 0 ? `<div class="notice teal" style="margin-bottom:14px">🧊<span><strong>${state.streakFreezes} streak freeze${state.streakFreezes === 1 ? '' : 's'} banked.</strong> If you miss a day, one is used automatically to keep your streak alive — earn another every 7-day streak, up to 2 banked.</span></div>` : ''}
      <div class="button-row" style="justify-content:flex-end;margin-bottom:14px">${examSessionCount >= 2 ? `<button class="secondary small" data-action="open-exam-comparison">${icon('repeat')} Compare mock exams</button>` : ''}<button class="secondary small" data-action="export-stats-csv">${icon('download')} Export stats (CSV)</button><button class="secondary small" data-route="report">${icon('download')} Readiness report</button></div>
      <section class="history-grid"><article class="chart-card"><h3>Session accuracy</h3>${chartSessions.length ? chartMarkup(chartSessions.map(s => s.score), chartSessions.map((_, i) => i + 1)) : '<div class="empty-state" style="min-height:150px">Complete a practice set to start the trend.</div>'}</article><article class="chart-card"><h3>Readiness by core</h3>${chartMarkup(coreReadiness, coreLabels)}</article><article class="chart-card"><h3>Priority domains</h3><div class="mastery-list">${weakDomains.map(domain => `<div><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:6px"><span>${escapeHtml(domain.name)}</span><span>${domain.mastery}%</span></div><div class="progress-track"><div class="progress-bar" style="width:${domain.mastery}%"></div></div></div>`).join('')}</div></article></section>
      ${readinessTrendSection()}
      ${progressHeatmapMarkup()}
      <section class="panel"><div class="panel-header"><div><h2>Session history</h2><p>Your last 100 practice and simulation attempts, saved to your local progress file.</p></div></div>${recent.length ? `<div style="overflow:auto"><table class="session-table"><thead><tr><th>Date</th><th>Session</th><th>Questions</th><th>First-try score</th><th>Time</th><th></th></tr></thead><tbody>${recent.map(session => { const missed = session.total - session.correct; return `<tr><td>${formatDate(session.date)}</td><td><strong>${escapeHtml(session.label)}</strong></td><td>${session.total}</td><td><span class="score-pill ${session.score < 70 ? 'low' : ''}">${session.score}%</span>${session.scaled ? ` <small style="color:var(--muted)">~${session.scaled}/900</small>` : ''}</td><td>${formatDuration(session.elapsed)}</td><td>${session.review ? `<div class="button-row" style="flex-wrap:nowrap"><button class="ghost small" data-action="open-review" data-session-id="${escapeHtml(session.id)}">${icon('layers')} Review</button>${missed > 0 ? `<button class="ghost small" data-action="review-missed" data-session-id="${escapeHtml(session.id)}">${icon('target')} Missed</button>` : ''}</div>` : '<span class="tag" style="opacity:.6">—</span>'}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="empty-state"><div><span class="stat-icon" style="margin:0 auto 12px">${icon('chart')}</span><h3>No sessions yet</h3><p>Start a Quick 10 to create your baseline.</p><button class="primary" data-action="quick-practice">Start now</button></div></div>`}</section>`;
  }

  // Domain-by-domain diff between two exam attempts — built entirely from each session's own
  // `history.domains` snapshot (finishSession() already records {total,correct} per domain at
  // the time of that attempt), so no re-derivation or re-scoring is needed here at all.
  function examComparisonRows(sessionA, sessionB) {
    const domainIds = new Set([...Object.keys(sessionA.domains || {}), ...Object.keys(sessionB.domains || {})]);
    return [...domainIds].map(domainId => domainById[domainId]).filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(domain => {
        const a = sessionA.domains[domain.id]; const b = sessionB.domains[domain.id];
        const aPct = a ? pct(a.correct, a.total) : null;
        const bPct = b ? pct(b.correct, b.total) : null;
        return { domain, aPct, bPct, delta: (aPct != null && bPct != null) ? bPct - aPct : null };
      });
  }

  function openExamComparisonDialog() {
    const examSessions = state.sessions.filter(s => s.type === 'exams');
    if (examSessions.length < 2) return;
    // Sessions are stored newest-first; default to the two most recent so opening the dialog
    // immediately shows something useful without picking anything first.
    examComparisonState = { aId: examSessions[1].id, bId: examSessions[0].id };
    dialogReturnFocus = document.activeElement;
    renderExamComparisonDialog();
  }

  function examSessionOptionLabel(session) {
    return `${formatDate(session.date)} · ${escapeHtml(session.label)} · ${session.score}%`;
  }

  function renderExamComparisonDialog() {
    const examSessions = state.sessions.filter(s => s.type === 'exams');
    const sessionA = examSessions.find(s => s.id === examComparisonState.aId) || examSessions[1];
    const sessionB = examSessions.find(s => s.id === examComparisonState.bId) || examSessions[0];
    const rows = examComparisonRows(sessionA, sessionB);
    const overallDelta = sessionB.score - sessionA.score;
    const optionList = list => examSessions.map(s => `<option value="${s.id}" ${s.id === list.id ? 'selected' : ''}>${examSessionOptionLabel(s)}</option>`).join('');
    dialogLayer.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="cmp-title" style="max-width:640px">
      <h2 id="cmp-title">Compare mock exams</h2>
      <p>Domain-by-domain, not just the overall score — see exactly where an attempt actually improved.</p>
      <div class="button-row" style="gap:12px;margin:16px 0;align-items:flex-start">
        <div class="field" style="flex:1"><label for="cmp-a">Earlier attempt</label><select id="cmp-a">${optionList(sessionA)}</select></div>
        <div class="field" style="flex:1"><label for="cmp-b">Later attempt</label><select id="cmp-b">${optionList(sessionB)}</select></div>
      </div>
      <div class="notice ${overallDelta > 0 ? 'teal' : ''}" style="margin-bottom:16px">${icon(overallDelta > 0 ? 'check' : overallDelta < 0 ? 'alert' : 'info')}<span>Overall score: ${sessionA.score}% → ${sessionB.score}% (${overallDelta > 0 ? '+' : ''}${overallDelta} pt${Math.abs(overallDelta) === 1 ? '' : 's'})</span></div>
      <div class="mastery-list">${rows.map(row => `<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px"><span>${escapeHtml(row.domain.name)}</span><span>${row.aPct ?? '—'}% → ${row.bPct ?? '—'}%${row.delta != null ? ` <strong style="color:${row.delta > 0 ? 'var(--primary)' : row.delta < 0 ? 'var(--red)' : 'var(--muted)'}">(${row.delta > 0 ? '+' : ''}${row.delta})</strong>` : ''}</span></div><div class="progress-track"><div class="progress-bar" style="width:${row.bPct ?? 0}%"></div></div></div>`).join('')}</div>
      <div class="button-row" style="margin-top:18px"><button class="secondary" data-action="close-dialog">Close</button></div>
    </div>`;
    hydrateIcons(dialogLayer);
    focusDialog();
  }

  // A one-page, printable snapshot of where things stand — assembled entirely from metrics
  // already computed elsewhere (getReadiness/getCoreReadiness/getDomainMetrics/etc.) so it can
  // never drift out of sync with what the Dashboard or Progress page shows. Certs-only, same as
  // Practice/Exams/Exam Map: a program track has no mastery/readiness concept to report on.
  function renderReadinessReport() {
    const readiness = getReadiness();
    const examDay = getExamDayReadiness();
    const accuracy = pct(state.stats.firstCorrect, state.stats.answered);
    const countdown = examCountdown();
    const proj = readinessProjection(80);
    const coreEntries = Object.entries(CERT.cores);
    const weakObjectives = getWeakObjectives(3);
    const shakyWins = getShakyWins(5);
    const staleMastered = getStaleMasteredConcepts(30, 5);
    const totalMinutes = Math.round(state.sessions.reduce((sum, s) => sum + (s.elapsed || 0), 0) / 60);
    const generatedOn = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

    let timelineLine;
    if (!countdown) {
      timelineLine = 'No exam date set — add one in Settings to see a projected ready-by date here.';
    } else if (proj && proj.reached) {
      timelineLine = `Already above the 80% exam-ready bar, with ${countdown.days} day${countdown.days === 1 ? '' : 's'} left until ${formatPlanDate(countdown.date)}.`;
    } else if (proj && proj.projectedDate) {
      const onTrack = proj.projectedDate <= countdown.date;
      timelineLine = `On the current pace, projected to reach 80% around ${formatPlanDate(proj.projectedDate)} — the exam is ${formatPlanDate(countdown.date)}, so ${onTrack ? 'that\'s on track.' : 'that lands after the exam date. Consider tightening the pace.'}`;
    } else {
      timelineLine = `${countdown.days} day${countdown.days === 1 ? '' : 's'} until the exam on ${formatPlanDate(countdown.date)}. Not enough session history yet for a pace projection.`;
    }

    main.innerHTML = `<div class="section-head"><div><h2>Readiness report</h2><p>A one-page snapshot of where you stand — print it, save it, or check it before exam day.</p></div><div class="button-row report-actions"><button class="ghost small" data-route="history">${icon('arrow')} Back to Progress</button><button class="ghost small" data-route="mistakes">${icon('repeat')} Mistake patterns</button><button class="ghost small" data-route="finalreview">${icon('download')} Final review sheet</button><button class="ghost small" data-route="examday">${icon('flag')} Exam day checklist</button><button class="secondary small" data-action="print-page">${icon('download')} Print / save</button></div></div>
      <section class="report-page">
        <header class="report-head">
          <div><span class="eyebrow">${escapeHtml(CERT.name)}</span><h1>Readiness Report</h1><p>${coreEntries.map(([, c]) => escapeHtml(c.code)).join(' · ')} · Generated ${generatedOn}${metaState.displayName ? ` · Prepared for ${escapeHtml(metaState.displayName)}` : ''}</p></div>
          <div class="radial" style="--value:${readiness}"><div class="radial-content"><strong>${readiness}%</strong><small>overall readiness</small></div></div>
        </header>

        <section class="panel"><div class="panel-header"><div><h2>Exam-day readiness</h2><p>Content mastery, mock exam performance, and hands-on labs, blended into one read.</p></div><span class="tag ${examDay.value >= 80 ? 'teal' : examDay.value >= 55 ? 'amber' : ''}">${examDay.value}%</span></div>
          <div class="panel-body">
            <div class="mastery-list">${examDay.legs.map(leg => `<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px"><span>${escapeHtml(leg.label)}</span><span>${leg.value != null ? `${leg.value}%` : 'Not enough data yet'}</span></div><div class="progress-track"><div class="progress-bar" style="width:${leg.value || 0}%"></div></div></div>`).join('')}</div>
            <p style="margin-top:12px;color:var(--muted);font-size:12px">${examDay.mockExam.value == null
              ? `Take a mock exam to bring exam-condition performance into this score${examDay.mockExam.cores > 1 ? ` (${examDay.mockExam.attempts}/${examDay.mockExam.cores} exams attempted so far)` : ''}.`
              : examDay.weakest ? `${escapeHtml(examDay.weakest.label)} is what's holding this back most right now${examDay.weakest.key === 'labs' ? ` — ${examDay.labs.completed} of ${examDay.labs.total} labs done.` : '.'}` : ''}</p>
          </div>
        </section>

        <section class="stat-grid" aria-label="Study statistics">
          <div class="stat-card"><span class="stat-icon">${icon('target')}</span><div class="stat-copy"><strong>${accuracy}%</strong><span>First-try accuracy</span></div></div>
          <div class="stat-card"><span class="stat-icon">${icon('brain')}</span><div class="stat-copy"><strong>${getMasteredConcepts()}</strong><span>Concepts mastered</span></div></div>
          <div class="stat-card"><span class="stat-icon">${icon('flame')}</span><div class="stat-copy"><strong>${getStreak()}</strong><span>Day streak</span></div></div>
          <div class="stat-card"><span class="stat-icon">${icon('clock')}</span><div class="stat-copy"><strong>${totalMinutes}</strong><span>Minutes practiced</span></div></div>
        </section>

        <section class="panel"><div class="panel-header"><div><h2>Exam timeline</h2></div>${countdown ? `<span class="tag ${countdown.days <= 14 ? 'amber' : 'teal'}">Exam in ${countdown.days} day${countdown.days === 1 ? '' : 's'}</span>` : ''}</div><div class="panel-body"><p>${timelineLine}</p></div></section>

        ${coreEntries.length > 1 ? `<section class="panel"><div class="panel-header"><div><h2>Readiness by exam</h2></div></div><div class="panel-body"><div class="mastery-list">${coreEntries.map(([id, core]) => { const r = getCoreReadiness(id); return `<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px"><span>${escapeHtml(core.name)} · ${escapeHtml(core.code)}</span><span>${r}%</span></div><div class="progress-track"><div class="progress-bar" style="width:${r}%"></div></div></div>`; }).join('')}</div></div></section>` : ''}

        <section class="panel"><div class="panel-header"><div><h2>Domain breakdown</h2><p>Every domain, weighted the same as the real exam blueprint.</p></div></div><div class="panel-body"><div class="mastery-list">${coreEntries.flatMap(([, core]) => core.domains).map(domain => { const m = getDomainMetrics(domain.id); return `<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px"><span>${escapeHtml(domain.name)} <span style="color:var(--muted)">· ${domain.weight}% weight</span></span><span>${m.mastery}%</span></div><div class="progress-track"><div class="progress-bar" style="width:${m.mastery}%"></div></div></div>`; }).join('')}</div></div></section>

        ${weakObjectives.length ? `<section class="panel"><div class="panel-header"><div><h2>Focus next</h2><p>The lowest-confidence objectives right now.</p></div></div><div class="panel-body"><ul class="gap-list">${weakObjectives.map(row => `<li><span>${row.objective.code} · ${escapeHtml(row.objective.title)}</span><span class="tag ${row.mastery < 50 ? 'amber' : ''}">${row.seen ? `${row.mastery}% mastery` : 'Not started'}</span></li>`).join('')}</ul></div></section>` : ''}

        ${shakyWins.length ? `<section class="panel"><div class="panel-header"><div><h2>Correct, but not confident</h2><p>You've gotten these right at least once — but tagged it as a guess, not real recall.</p></div></div><div class="panel-body"><ul class="gap-list">${shakyWins.map(row => `<li><span>${escapeHtml(row.concept.term)}</span><span class="tag amber">${row.guessedRight} guessed right</span></li>`).join('')}</ul></div></section>` : ''}

        ${staleMastered.length ? `<section class="panel"><div class="panel-header"><div><h2>Needs a refresher</h2><p>Mastered a while ago, but not seen again since — flashcards decay on their own schedule; quiz mastery doesn't.</p></div></div><div class="panel-body"><ul class="gap-list">${staleMastered.map(row => `<li><span>${escapeHtml(row.concept.term)}</span><span class="tag amber">${row.daysSince}d since last seen</span></li>`).join('')}</ul></div></section>` : ''}

        <footer class="report-footer"><p>Scaled scores and mastery percentages are this app's own transparent estimates for learning — not an official score. Generated by Cert Study ${APP_VERSION}.</p></footer>
      </section>`;
  }

  function renderAchievementsPage() {
    const badges = getAchievements();
    const earnedCount = badges.filter(b => b.earned).length;
    main.innerHTML = `<div class="section-head"><div><h2>Achievements</h2><p>Real milestones computed from your own practice, labs, and exam history for ${escapeHtml(CERT.name)} — nothing to configure, nothing that resets.</p></div><span class="tag teal">${earnedCount}/${badges.length} earned</span></div>
      <section class="card-grid">${badges.map(badge => `<article class="mode-card ${badge.earned ? '' : 'badge-locked'}"><span class="stat-icon">${icon(badge.icon)}</span><h3>${escapeHtml(badge.title)}${badge.earned ? ` ${icon('check')}` : ''}</h3><p>${escapeHtml(badge.description)}</p><div class="card-meta"><span>${badge.earned ? 'Earned' : `${badge.current}/${badge.target}`}</span>${badge.earned ? '' : `<i class="dot"></i><span>${badge.pct}%</span>`}</div>${badge.earned ? '' : `<div class="progress-track" style="margin-top:10px"><div class="progress-bar" style="width:${badge.pct}%"></div></div>`}</article>`).join('')}</section>`;
  }

  // A single action-first page for the final stretch, distinct from the Readiness report (a
  // stats snapshot to print): a real logistics checklist, a quick read on where things stand,
  // and one-tap drills into whatever's still shakiest — instead of gathering all of that
  // yourself from Settings, Report, and the Exam Map right when there's the least time to spare.
  function renderExamDay() {
    const countdown = examCountdown();
    const weakObjectives = getWeakObjectives(5);
    const examDay = getExamDayReadiness();
    const checklist = state.examDayChecklist;
    const doneCount = EXAM_DAY_CHECKLIST.filter(item => checklist[item.id]).length;
    main.innerHTML = `<div class="section-head"><div><h2>Exam day</h2><p>Logistics, last checks, and whatever's still worth a final look — the home stretch in one place.</p></div>${countdown ? `<span class="tag ${countdown.days <= 3 ? 'amber' : 'teal'}">${countdown.days} day${countdown.days === 1 ? '' : 's'} to go</span>` : ''}</div>
      ${!countdown ? `<div class="notice" style="margin-bottom:18px">${icon('info')}<span>No exam date set yet — add one in Settings to see a real countdown and pace projection here.</span></div>` : ''}

      <section class="panel" style="margin-bottom:18px">
        <div class="panel-header"><div><h2>Before you go</h2><p>Straight from Pearson OnVUE's own candidate ID and system requirements.</p></div><span class="tag ${doneCount === EXAM_DAY_CHECKLIST.length ? 'teal' : ''}" id="examday-checklist-count">${doneCount}/${EXAM_DAY_CHECKLIST.length}</span></div>
        <div class="panel-body">${EXAM_DAY_CHECKLIST.map(item => `<div class="toggle-line" style="padding:8px 0"><label class="switch"><input type="checkbox" class="examday-check" data-item="${item.id}" ${checklist[item.id] ? 'checked' : ''}><span></span></label><span>${escapeHtml(item.label)}</span></div>`).join('')}</div>
      </section>

      <section class="panel" style="margin-bottom:18px">
        <div class="panel-header"><div><h2>Exam-day readiness</h2><p>Content mastery, mock exams, and hands-on labs, blended into one read.</p></div><span class="tag ${examDay.value >= 80 ? 'teal' : examDay.value >= 55 ? 'amber' : ''}">${examDay.value}%</span></div>
        <div class="panel-body"><div class="button-row"><button class="ghost small" data-route="report">${icon('chart')} Full readiness report</button><button class="ghost small" data-route="finalreview">${icon('download')} Final review sheet</button></div></div>
      </section>

      ${weakObjectives.length ? `<section class="panel" style="margin-bottom:18px"><div class="panel-header"><div><h2>Last-minute review</h2><p>Your lowest-confidence objectives right now.</p></div></div><div class="panel-body"><ul class="gap-list">${weakObjectives.map(row => `<li><span>${row.objective.code} · ${escapeHtml(row.objective.title)}</span><button class="ghost small" data-action="drill-objective" data-domain="${row.domain.id}" data-objective="${row.objective.code}">${icon('target')} Drill</button></li>`).join('')}</ul></div></section>` : ''}

      <div class="button-row" style="margin-bottom:18px"><button class="primary" data-action="start-cram">${icon('bolt')} Start cram session</button></div>

      <section class="panel">
        <div class="panel-header"><div><h2>After the real exam</h2><p>Record your actual score once you've taken it, official Pearson VUE result — separate from anything this app estimates — to generate a shareable pass card.</p></div></div>
        <div class="panel-body"><div class="mastery-list">${Object.entries(CERT.cores).map(([coreId, core]) => {
          const result = state.examResults[coreId];
          const passed = result && result.score >= core.passingScore;
          if (!result) return `<div class="schedule-row" style="grid-template-columns:1fr auto"><div class="mastery-label"><strong>${escapeHtml(core.name)}</strong><small>${escapeHtml(core.code)} · no result recorded yet</small></div><button class="ghost small" data-action="record-exam-result" data-core="${coreId}">${icon('edit')} Record result</button></div>`;
          return `<div class="schedule-row" style="grid-template-columns:1fr auto auto"><div class="mastery-label"><strong>${escapeHtml(core.name)}</strong><small>${escapeHtml(core.code)} · ${result.score}/900 on ${formatDateKey(result.date)}${passed ? ' · Passed' : ' · Below passing'}</small></div><button class="ghost small" data-action="record-exam-result" data-core="${coreId}">${icon('edit')} Edit</button>${passed ? `<button class="secondary small" data-action="download-pass-card" data-core="${coreId}">${icon('download')} Pass card</button>` : ''}</div>`;
        }).join('')}</div></div>
      </section>`;
  }

  // A domain mastery percentage says where you're weak; this says how you're actually getting
  // things wrong — mined from real recent wrong answers rather than aggregate accuracy.
  function renderMistakePatterns() {
    const pairs = getConfusionPairs(6);
    const phrasing = getPhrasingPatternStats();
    main.innerHTML = `<div class="section-head"><div><h2>Mistake patterns</h2><p>What keeps tripping you up, not just where — mined from your last 25 sessions' actual wrong answers.</p></div><div class="button-row"><button class="ghost small" data-route="report">${icon('arrow')} Back to Readiness report</button><button class="secondary small" data-route="finalreview">${icon('download')} Final review sheet</button></div></div>

      <section class="panel" style="margin-bottom:18px">
        <div class="panel-header"><div><h2>Terms you keep confusing</h2><p>Specific answer pairs picked wrong for each other more than once recently — not just "missed this concept," but "keeps swapping these two."</p></div></div>
        <div class="panel-body">${pairs.length ? `<ul class="gap-list">${pairs.map(p => `<li><span>${escapeHtml(p.a)} ↔ ${escapeHtml(p.b)} <span class="tag amber" style="margin-left:6px">${p.count}× confused</span></span>${p.conceptId ? `<button class="ghost small" data-action="drill-concept" data-concept="${escapeHtml(p.conceptId)}">${icon('target')} Drill</button>` : ''}</li>`).join('')}</ul>` : `<p style="color:var(--muted);font-size:13px;margin:0">Not enough recent misses yet to spot a real pattern — this needs the same two answers mixed up at least twice.</p>`}</div>
      </section>

      <section class="panel">
        <div class="panel-header"><div><h2>Question-style weak spots</h2><p>Miss rate by how a question is worded, independent of which domain it's testing.</p></div></div>
        <div class="panel-body">${phrasing.length ? `<div class="mastery-list">${phrasing.map(row => `<div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px"><span>${escapeHtml(row.label)}</span><span>${row.missRate}% missed · ${row.missed}/${row.seen}</span></div><div class="progress-track"><div class="progress-bar" style="width:${row.missRate}%"></div></div></div>`).join('')}</div>` : `<p style="color:var(--muted);font-size:13px;margin:0">Not enough recent questions in any one phrasing style yet to say anything meaningful.</p>`}</div>
      </section>`;
  }

  // A one-page printable pulled entirely from the person's own recent performance — distinct from
  // the Study packet (a domain/track's full content, regardless of how you're doing in it): this
  // is only ever the specific things this specific person is still getting wrong or hasn't closed.
  function renderFinalReview() {
    const pairs = getConfusionPairs(8);
    const missedCounts = {};
    getRecentReviewEntries().forEach(entry => { if (!entry.firstCorrect) missedCounts[entry.conceptId] = (missedCounts[entry.conceptId] || 0) + 1; });
    const mostMissed = Object.entries(missedCounts)
      .map(([conceptId, count]) => ({ concept: conceptById[conceptId], count }))
      .filter(row => row.concept)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const gapsByDomain = Object.values(CERT.cores).flatMap(core => core.domains)
      .map(domain => ({ domain, gaps: unmasteredConcepts(domain.id) }))
      .filter(row => row.gaps.length);
    const generatedOn = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
    main.innerHTML = `<div class="section-head"><div><h2>Final review sheet</h2><p>Built from your own recent performance, not a generic summary — a focused last pass.</p></div><div class="button-row"><button class="ghost small" data-route="mistakes">${icon('arrow')} Back to Mistake patterns</button><button class="secondary small" data-action="print-page">${icon('download')} Print / save</button></div></div>
      <section class="report-page">
        <header class="report-head"><div><span class="eyebrow">${escapeHtml(CERT.name)}</span><h1>Final Review Sheet</h1><p>Generated ${generatedOn}${metaState.displayName ? ` · Prepared for ${escapeHtml(metaState.displayName)}` : ''}</p></div></header>

        <section class="panel" style="margin-bottom:18px">
          <div class="panel-header"><div><h2>Terms you keep confusing</h2><p>Answer pairs mixed up more than once across your last 25 sessions.</p></div></div>
          <div class="panel-body">${pairs.length ? `<ul class="gap-list">${pairs.map(p => `<li><span>${escapeHtml(p.a)} ↔ ${escapeHtml(p.b)}</span><span class="tag amber">${p.count}×</span></li>`).join('')}</ul>` : `<p style="color:var(--muted);font-size:13px;margin:0">No repeated confusions in recent sessions.</p>`}</div>
        </section>

        <section class="panel" style="margin-bottom:18px">
          <div class="panel-header"><div><h2>Most-missed concepts recently</h2><p>Definitions worth one more read before you go in.</p></div></div>
          <div class="panel-body">${mostMissed.length ? `<div class="glossary-list">${mostMissed.map(row => `<article class="glossary-item"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><strong>${escapeHtml(row.concept.term)}</strong><span class="tag amber">${row.count}× missed</span></div><p>${escapeHtml(row.concept.definition)}</p></article>`).join('')}</div>` : `<p style="color:var(--muted);font-size:13px;margin:0">No recent misses recorded yet.</p>`}</div>
        </section>

        <section class="panel">
          <div class="panel-header"><div><h2>Remaining gaps by domain</h2><p>Concepts still below the mastery bar (3+ attempts, 80%+).</p></div></div>
          <div class="panel-body">${gapsByDomain.length ? gapsByDomain.map(row => `<details class="gap-details" style="margin-bottom:12px"><summary>${escapeHtml(row.domain.name)} — ${row.gaps.length} remaining</summary><ul class="gap-list">${row.gaps.map(item => `<li><span>${escapeHtml(item.concept.term)}</span><span class="tag ${item.status === 'Below 80%' ? 'amber' : ''}">${item.status === 'New' ? 'Not started' : item.status === 'Building' ? `${item.seen}/${MASTERY_MIN_SEEN} attempts` : `${item.accuracy}% so far`}</span></li>`).join('')}</ul></details>`).join('') : `<p style="color:var(--muted);font-size:13px;margin:0">Every concept has hit the mastery bar — nothing left to close.</p>`}</div>
        </section>

        <footer class="report-footer"><p>Built from your own recent performance — come back after more practice for an updated version. Generated by Cert Study ${APP_VERSION}.</p></footer>
      </section>`;
  }

  function renderSettings() {
    const isPrograms = currentDomain() === 'programs';
    main.innerHTML = `<div class="section-head"><div><h2>Settings and local data</h2><p>Your progress is saved locally on this machine by the local server, in its own file per account. Export a backup before wiping that file or moving to another computer.</p></div></div><section class="settings-grid">
      <article class="settings-card"><h3>Your profile</h3><p>Shown in the sidebar and on your printed readiness report — not shared anywhere, just for you.</p><div class="setting-row"><div><strong>Account</strong><small>Each account has its own completely separate progress and settings.</small></div><button class="secondary small" data-action="open-account-dialog">${icon('repeat')} Switch (${escapeHtml(currentProfile().name || 'this account')})</button></div><div class="setting-row"><div><strong>Display name</strong><small>Leave blank to keep the default.</small></div><input type="text" id="setting-display-name" class="setting-date-input" style="width:180px" placeholder="Future technician" value="${escapeHtml(metaState.displayName || '')}" autocomplete="off" maxlength="40"></div><div class="setting-row stacked"><div><strong>Avatar</strong><small>Pick a style and color, or upload your own photo.</small></div><div class="avatar-style-row"><button type="button" class="avatar-style-btn ${metaState.avatar.type === 'initials' ? 'active' : ''}" data-action="set-avatar-style" data-style="initials" title="Initials">Aa</button>${AVATAR_EMOJIS.map(e => `<button type="button" class="avatar-style-btn ${metaState.avatar.type === 'emoji' && metaState.avatar.emoji === e ? 'active' : ''}" data-action="set-avatar-style" data-style="emoji" data-emoji="${e}" title="${e}">${e}</button>`).join('')}</div><div class="swatch-row"><button type="button" class="swatch-btn none ${!metaState.avatar.color ? 'active' : ''}" data-action="set-avatar-color" data-color="" title="Default"></button>${AVATAR_COLORS.map(c => `<button type="button" class="swatch-btn ${metaState.avatar.color === c ? 'active' : ''}" style="background:${c}" data-action="set-avatar-color" data-color="${c}" title="${c}"></button>`).join('')}</div><div class="button-row" style="margin-top:2px"><button class="secondary small" data-action="choose-avatar-photo" type="button">${icon('image')} Upload photo</button>${metaState.avatar.type === 'photo' && metaState.avatar.photoVersion ? `<button class="secondary small" data-action="remove-avatar-photo" type="button">${icon('trash')} Remove photo</button>` : ''}<input type="file" id="avatar-photo-input" accept="image/*" class="hidden"></div></div></article>
      <article class="settings-card"><h3>Look &amp; feel</h3><p>Purely cosmetic — none of this changes how mastery or scoring works.</p><div class="setting-row"><div><strong>Color theme</strong><small>Dark, light, or follow your system setting automatically.</small></div><div class="domain-tabs" style="margin:0">${['dark', 'light', 'auto'].map(mode => `<button class="tab-button ${state.settings.themeMode === mode ? 'active' : ''}" type="button" data-action="set-theme-mode" data-mode="${mode}">${mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}</button>`).join('')}</div></div><div class="setting-row"><div><strong>Accent color</strong><small>Retints buttons, progress bars, and highlights across the app.</small></div><div class="swatch-row">${ACCENT_THEMES.map(a => `<button type="button" class="swatch-btn ${state.settings.accentColor === a.id ? 'active' : ''}" style="background:${a[state.settings.theme].primary}" data-action="set-accent-color" data-accent="${a.id}" title="${a.label}"></button>`).join('')}</div></div><div class="setting-row stacked"><div><strong>App font</strong><small>Start typing to see common fonts, or type any exact name of your own.</small></div><div class="button-row" style="width:100%;align-items:center"><input type="text" id="setting-font-name" class="setting-date-input" style="flex:1;min-width:200px" placeholder="e.g. Calibri, Comic Sans MS" value="${escapeHtml(state.settings.fontFamily || '')}" autocomplete="off">${'queryLocalFonts' in window ? `<button class="secondary small" type="button" data-action="browse-local-fonts">Check Installed Fonts</button>` : ''}${state.settings.fontFamily ? `<button class="secondary small" type="button" data-action="reset-font-family">Reset</button>` : ''}</div><p id="font-preview-sample" style="margin:8px 0 0;font-family:${escapeHtml(buildFontStack(state.settings.fontFamily))};font-size:13px;color:var(--muted)">The quick brown fox jumps over the lazy dog.</p></div><div class="setting-row stacked"><div><strong>Text size</strong><small>Scales the whole app, not just body text.</small></div><div class="domain-tabs" style="margin:0">${[['0.9', 'Small'], ['1', 'Default'], ['1.15', 'Large'], ['1.3', 'Extra large']].map(([size, label]) => `<button class="tab-button ${Number(state.settings.fontSize) === Number(size) ? 'active' : ''}" type="button" data-action="set-font-size" data-size="${size}">${label}</button>`).join('')}</div></div><div class="setting-row"><div><strong>Corner style</strong><small>Rounded or sharp corners across the app.</small></div><div class="domain-tabs" style="margin:0">${[['rounded', 'Rounded'], ['sharp', 'Sharp']].map(([id, label]) => `<button class="tab-button ${(state.settings.cornerStyle || 'rounded') === id ? 'active' : ''}" type="button" data-action="set-corner-style" data-corners="${id}">${label}</button>`).join('')}</div></div><div class="setting-row"><div><strong>Density</strong><small>How much breathing room cards and lists get.</small></div><div class="domain-tabs" style="margin:0">${[['comfortable', 'Comfortable'], ['compact', 'Compact']].map(([id, label]) => `<button class="tab-button ${(state.settings.density || 'comfortable') === id ? 'active' : ''}" type="button" data-action="set-density" data-density="${id}">${label}</button>`).join('')}</div></div></article>
      <article class="settings-card"><h3>Accessibility</h3><p>None of this changes how mastery or scoring works.</p><div class="setting-row"><div><strong>Reading mode</strong><small>Wider line, letter, and word spacing, a plainer font, and calmer motion — for the Study guide, notes, and quiz text.</small></div><label class="switch"><input id="setting-reading-mode" type="checkbox" ${state.settings.readingMode ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Reduce motion</strong><small>Turns off animations and transitions app-wide — independent of Reading mode, for anyone sensitive to motion who doesn't want the other changes.</small></div><label class="switch"><input id="setting-reduced-motion" type="checkbox" ${state.settings.reducedMotion ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Colorblind-safe colors</strong><small>Swaps correct/incorrect from green/red to blue/amber — one of the hardest pairs to tell apart with red-green colorblindness.</small></div><label class="switch"><input id="setting-colorblind" type="checkbox" ${state.settings.colorblindMode ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>High contrast</strong><small>Solid backgrounds instead of soft tints, and darker muted text — for low-vision readability.</small></div><label class="switch"><input id="setting-high-contrast" type="checkbox" ${state.settings.highContrast ? 'checked' : ''}><span></span></label></div></article>
      <article class="settings-card"><h3>Learning preferences</h3><p>Adjust behavior without changing how first-attempt mastery is calculated.</p><div class="setting-row"><div><strong>Second-chance learning</strong><small>One retry in practice; first attempt still drives mastery.</small></div><label class="switch"><input id="setting-second" type="checkbox" ${state.settings.secondChance ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Sound effects</strong><small>A short tone on correct/incorrect answers in Practice.</small></div><label class="switch"><input id="setting-sound" type="checkbox" ${state.settings.soundEffects ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Focus mode</strong><small>Hide the sidebar while a quiz or exam is in progress.</small></div><label class="switch"><input id="setting-focus" type="checkbox" ${state.settings.focusMode ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Fullscreen exams</strong><small>Go fullscreen automatically when starting a mock exam — closer to real testing-center conditions.</small></div><label class="switch"><input id="setting-fullscreen-exam" type="checkbox" ${state.settings.fullscreenExams ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Start page</strong><small>What loads when you open the app.</small></div><select id="setting-start-page">${[['dashboard', 'Dashboard'], ['practice', 'Practice'], ['guide', 'Study guide'], ['history', 'Progress']].map(([id, label]) => `<option value="${id}" ${(state.settings.startPage || 'dashboard') === id ? 'selected' : ''}>${label}</option>`).join('')}</select></div><div class="setting-row"><div><strong>Milestone celebrations</strong><small>What happens when you cross a real milestone.</small></div><div class="domain-tabs" style="margin:0">${[['confetti', 'Confetti'], ['simple', 'Simple'], ['off', 'Off']].map(([id, label]) => `<button class="tab-button ${(state.settings.celebrationStyle || 'confetti') === id ? 'active' : ''}" type="button" data-action="set-celebration-style" data-style="${id}">${label}</button>`).join('')}</div></div><div class="setting-row"><div><strong>Tip of the day</strong><small>A daily study tip on the Dashboard.</small></div><label class="switch"><input id="setting-show-tip" type="checkbox" ${state.settings.showTipOfDay !== false ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>All tracks at a glance</strong><small>Every track's progress, shown on the Dashboard.</small></div><label class="switch"><input id="setting-show-alltracks" type="checkbox" ${state.settings.showAllTracks !== false ? 'checked' : ''}><span></span></label></div><div class="setting-row"><div><strong>Read-aloud speed</strong><small>Used when you listen to Study guide chapters.</small></div><select id="setting-speech-rate">${[0.75, 1, 1.25, 1.5].map(rate => `<option value="${rate}" ${state.settings.speechRate === rate ? 'selected' : ''}>${rate}×</option>`).join('')}</select></div>${isPrograms ? '' : `<div class="setting-row stacked"><div><strong>Exam date</strong><small>Drives the dashboard countdown and the readiness projection.</small></div><div class="setting-date-group"><input type="date" id="settings-exam-date" class="setting-date-input" value="${state.examDate || ''}"><button class="secondary small" data-action="set-exam-date">Save</button></div></div>`}</article>
      ${isPrograms ? '' : `<article class="settings-card"><h3>Notifications</h3><p>A local browser notification — nothing leaves this machine, and nothing is sent while the app is fully closed.</p><div class="setting-row"><div><strong>Review reminders</strong><small>${!('Notification' in window) ? 'Not supported in this browser.' : Notification.permission === 'denied' ? 'Blocked — enable notifications for this site in your browser settings first.' : "A nudge when spaced-review flashcards are due for whichever track is active — checked once a day when you open or return to the app, not while it's fully closed."}</small></div><label class="switch"><input id="setting-notify-reviews" type="checkbox" ${metaState.notifyReviewsEnabled ? 'checked' : ''} ${(!('Notification' in window) || Notification.permission === 'denied') ? 'disabled' : ''}><span></span></label></div></article>`}
      <article class="settings-card"><h3>Progress backup</h3><p>Export or restore everything in one JSON file — every track's practice history, mastery, flashcards, and labs, plus your study plan. Not just ${escapeHtml(CERT.name)}.</p><div class="button-row" style="margin-top:20px"><button class="secondary" data-action="export-data">${icon('download')} Export data</button><button class="secondary" data-action="save-backup-file">${icon('folder')} Save to backup folder</button><button class="secondary" data-action="choose-import">${icon('upload')} Import data</button><input type="file" id="import-file" accept="application/json" class="hidden"></div><p style="margin-top:10px">${metaState.lastBackupDate ? `Last backup: ${formatDateKey(metaState.lastBackupDate)} (${daysBetween(metaState.lastBackupDate, todayKey()) === 0 ? 'today' : `${daysBetween(metaState.lastBackupDate, todayKey())} day${daysBetween(metaState.lastBackupDate, todayKey()) === 1 ? '' : 's'} ago`}).` : 'No backup yet.'} Saved-to-folder copies land in <code>backup/</code> next to this app, named with the version that made them.</p><div class="setting-row"><div><strong>Automatic daily backup</strong><small>Saves to the backup folder once a day, the first time you open the app.</small></div><label class="switch"><input id="setting-auto-backup" type="checkbox" ${metaState.autoBackupEnabled !== false ? 'checked' : ''}><span></span></label></div><div class="setting-row" style="margin-top:20px"><div><strong>Reset all progress</strong><small>This cannot be undone unless you exported a backup.</small></div><button class="danger-button small" data-action="confirm-reset">${icon('trash')} Reset</button></div></article>
      <article class="settings-card"><h3>${isPrograms ? 'Content' : 'Content and scoring'}</h3><p>${isPrograms ? `${LABS.length} hands-on labs and ${CONCEPTS.length} reference terms. No quizzes, exams, or flashcards — this is a purely hands-on program.` : `${QUESTIONS.length.toLocaleString()} original question forms from ${CONCEPTS.length} curated concepts, plus ${LABS.length} guided labs. No real exam items or brain dumps.`}</p><div class="setting-row"><div><strong>Current track</strong><small>${escapeHtml(CERT.name)} · ${Object.values(CERT.cores).map(core => escapeHtml(core.code)).join(' · ')}</small></div><button class="secondary small" data-action="open-cert-dialog">${icon('repeat')} Switch ${isPrograms ? 'program' : 'track'}</button></div>${isPrograms ? '' : `<div class="setting-row"><div><strong>Practice scoring</strong><small>Transparent first-attempt percentage; simulations add a clearly labeled scaled estimate.</small></div></div>`}</article>
      <article class="settings-card"><h3>Primary references</h3><p>${isPrograms ? "Reference material is mapped to the software's own public documentation. Interfaces change between versions — verify against the current release." : 'Exam facts and domain weights are mapped to each vendor\'s public materials. Objectives change—verify before scheduling.'}</p><div class="source-list">${(CERT.sources || []).map(source => `<a class="source-link" href="${source.url}" target="_blank" rel="noopener"><span>${escapeHtml(source.label)}</span>${icon('external')}</a>`).join('')}</div></article>
      <article class="settings-card"><h3>App</h3><p>Running <strong>${APP_VERSION}</strong>. ${CONCEPTS.length} concepts and ${(LABS || []).length} labs loaded for this track.</p><div class="setting-row"><div><strong>Check for updates</strong><small>Reload from within the app instead of closing and reopening it.</small></div><button class="secondary small" data-action="check-for-updates">${icon('rotate')} Check now</button></div>${deferredInstallPrompt ? `<div class="setting-row"><div><strong>Install as an app</strong><small>Opens in its own window, with a taskbar/dock icon — not just a browser tab.</small></div><button class="secondary small" data-action="install-app">${icon('download')} Install</button></div>` : ''}<div class="setting-row stacked"><div><strong>App icon</strong><small>Changes the browser tab icon right away. If you've already installed the app, remove and reinstall it to pick up the new taskbar/dock icon too — that part is cached by your OS, not something a website can refresh on its own.</small></div><div class="avatar-style-row">${ICON_SHAPES.map(shape => `<button type="button" class="avatar-style-btn ${(metaState.appIconShape || 'cap') === shape ? 'active' : ''}" data-action="set-app-icon-shape" data-shape="${shape}" title="${shape}">${icon(shape)}</button>`).join('')}</div><div class="swatch-row">${ICON_COLORS.map(c => `<button type="button" class="swatch-btn ${(metaState.appIconColor || '#2dd4bf') === c ? 'active' : ''}" style="background:${c}" data-action="set-app-icon-color" data-color="${c}" title="${c}"></button>`).join('')}</div></div><div class="setting-row"><div><strong>What's new</strong><small>Recent changes to the app.</small></div><button class="secondary small" data-action="open-whats-new">${icon('sparkles')} View</button></div><div class="setting-row"><div><strong>Keyboard shortcuts</strong><small>Everything you can do without the mouse. Press <kbd>?</kbd> any time.</small></div><button class="secondary small" data-action="open-shortcuts">${icon('keyboard')} View</button></div>${isPrograms ? '' : `<div class="setting-row"><div><strong>Replay the walkthrough</strong><small>The first-run intro and optional diagnostic.</small></div><button class="secondary small" data-action="replay-onboarding">${icon('repeat')} Replay</button></div>`}</article>
    </section>`;
  }

  // The bottom "Current track" switcher only ever lists groups within whichever domain is
  // currently active — it can no longer jump between Certs and Programs itself. That jump is
  // exclusively the top-left brand button's job (openDomainDialog below).
  function openCertDialog() {
    certDialogGroup = null;
    certDialogEntryDomain = currentDomain();
    dialogReturnFocus = document.activeElement;
    renderCertDialog();
  }

  // The top-left brand button is a pure domain switch, not a track picker: it only ever shows
  // the Certs/Programs choice, and picking one immediately activates the first track in that
  // domain. Picking a specific track within a domain is exclusively the bottom switcher's job.
  function openDomainDialog() {
    openDialog(domainPickerMarkup());
  }

  function firstTrackForDomain(domainId) {
    const group = CERT_GROUPS.find(item => item.domain === domainId);
    return group ? CERT_REGISTRY.find(entry => entry.group === group.id) || null : null;
  }

  function renderCertDialog() {
    dialogLayer.innerHTML = certDialogGroup ? certDialogTracksMarkup(certDialogGroup) : certDialogGroupsMarkup(certDialogEntryDomain);
    hydrateIcons(dialogLayer);
    focusDialog();
  }

  function domainPickerMarkup() {
    const cards = DOMAINS.map(domain => `<button class="cert-option" data-action="choose-domain" data-domain-id="${domain.id}"><span class="mini-mark">${escapeHtml(domain.short)}</span><span><strong>${escapeHtml(domain.label)}</strong><small>${escapeHtml(domain.blurb)}</small></span>${icon('chevron')}</button>`).join('');
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="domain-title"><h2 id="domain-title">What do you want to study?</h2><p>Choose a study domain to jump straight into it. You can switch to a specific track from the sidebar afterward.</p>${cards}<div class="button-row" style="margin-top:18px"><button class="secondary" data-action="close-dialog">Close</button></div></div>`;
  }

  function certDialogGroupsMarkup(domainFilter) {
    const isPrograms = domainFilter === 'programs';
    const groups = CERT_GROUPS.filter(group => group.domain === domainFilter);
    const cards = groups.map(group => {
      const tracks = CERT_REGISTRY.filter(entry => entry.group === group.id);
      const activeEntry = tracks.find(entry => entry.id === activeCertId);
      return `<button class="cert-option" data-action="open-cert-group" data-group-id="${group.id}"><span class="mini-mark">${escapeHtml(group.short)}</span><span><strong>${escapeHtml(group.label)}</strong><small>${escapeHtml(group.blurb)}${activeEntry ? ` · Active: ${escapeHtml(activeEntry.label)}` : ''}</small></span>${icon('chevron')}</button>`;
    }).join('');
    const title = isPrograms ? 'Programs library' : 'Certification library';
    const desc = isPrograms ? 'Choose a software category, then pick the specific program to learn.' : 'Choose a certification body, then pick the specific track within it. Progress is tracked separately per track.';
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="track-title"><h2 id="track-title">${title}</h2><p>${desc}</p>${cards}<div class="button-row" style="margin-top:18px"><button class="secondary" data-action="close-dialog">Close</button></div></div>`;
  }

  function certDialogTracksMarkup(groupId) {
    const group = CERT_GROUPS.find(item => item.id === groupId);
    const isPrograms = group && group.domain === 'programs';
    const options = CERT_REGISTRY.filter(entry => entry.group === groupId).map(entry => {
      const dataset = window[entry.dataGlobal];
      const labs = window[entry.labsGlobal] || [];
      const questionCount = (dataset?.concepts?.length || 0) * (dataset?.certification?.questionVariants || 0);
      const active = entry.id === activeCertId;
      const meta = `${isPrograms ? `${labs.length} hands-on labs` : `${questionCount.toLocaleString()} questions · ${labs.length} labs`}${active ? ' · Active' : ''}`;
      return active
        ? `<button class="cert-option" disabled><span class="mini-mark">${escapeHtml(entry.short)}</span><span><strong>${escapeHtml(entry.label)}</strong><small>${meta}</small></span><span class="tag teal">Selected</span></button>`
        : `<button class="cert-option" data-action="switch-cert" data-cert-id="${entry.id}"><span class="mini-mark">${escapeHtml(entry.short)}</span><span><strong>${escapeHtml(entry.label)}</strong><small>${meta}</small></span><span class="coming-badge">Switch</span></button>`;
    }).join('');
    const noun = isPrograms ? 'program' : 'certification';
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="track-title"><button class="ghost small" data-action="cert-dialog-back" style="margin-bottom:12px">← Back</button><h2 id="track-title">${escapeHtml(group ? group.label : '')} ${isPrograms ? 'courses' : 'tracks'}</h2><p>Pick which ${escapeHtml(group ? group.label : '')} ${noun} to study.</p>${options}<div class="button-row" style="margin-top:18px"><button class="secondary" data-action="close-dialog">Close</button></div></div>`;
  }

  function closeDialog() {
    if (!dialogLayer.innerHTML) return;
    dialogLayer.innerHTML = '';
    const target = dialogReturnFocus;
    dialogReturnFocus = null;
    if (target && document.contains(target)) { try { target.focus({ preventScroll: true }); } catch {} }
  }
  function closeMobileNav() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobile-backdrop').classList.remove('open'); }

  async function exportData() {
    // Re-fetch fresh (rather than trusting the in-memory copy) so the backup reflects every
    // track's latest saved progress and the study plan — not just whichever track is active
    // right now, and not a possibly-stale snapshot from whenever the page last loaded.
    await refreshRemoteProgress();
    const blob = new Blob([JSON.stringify({ app: 'Cert Study', format: 'full', exportedAt: new Date().toISOString(), progress: remoteProgress }, null, 2)], { type: 'application/json' });
    const profileSuffix = activeProfileId === DEFAULT_PROFILE_ID ? '' : `-${activeProfileId}`;
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `cert-study-backup${profileSuffix}-${todayKey()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); toast('Full backup exported — every track and your study plan.');
    metaState.lastBackupDate = todayKey(); metaState.backupSnoozeUntil = null; saveMeta();
  }

  // Writes the same full-backup payload exportData() downloads, but through the local server
  // instead of the browser's download folder — lands in a real backup/ folder next to this app,
  // named with the running version so multiple backups sort and identify themselves at a glance.
  async function saveBackupToFolder() {
    await refreshRemoteProgress();
    const payload = { app: 'Cert Study', format: 'full', exportedAt: new Date().toISOString(), version: APP_VERSION, dateKey: todayKey(), profile: activeProfileId, progress: remoteProgress };
    try {
      const res = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'save failed');
      metaState.lastBackupDate = todayKey(); metaState.backupSnoozeUntil = null; saveMeta();
      renderRoute();
      toast(`Backup saved to backup/${data.filename}`);
    } catch {
      toast('Could not save the backup file — is the local server still running?', 'error');
    }
  }

  // Runs once at boot (see the bottom of this file) rather than on every track load — a full
  // backup already covers every track at once, so there's nothing to gain from re-checking on
  // each switch, and saveBackupToFolder() setting lastBackupDate to today already makes this a
  // no-op for the rest of the day regardless of where it's called from.
  function checkAutoBackup() {
    if (metaState.autoBackupEnabled === false) return;
    if (!hasAnyProgress()) return;
    if (metaState.lastBackupDate === todayKey()) return;
    saveBackupToFolder();
  }

  // Opt-in only — toggling on requires the browser's own Notification permission, requested here
  // rather than assumed. This is a plain page-triggered Notification, not a push subscription: it
  // can only fire while this tab is open (foreground or background), never while the app is fully
  // closed, since there's no server to push from. Good enough for "I left the app open" or "I just
  // reopened it" nudges; the Settings copy is upfront about that limit rather than overpromising.
  async function setNotifyReviews(enabled) {
    if (!enabled) { metaState.notifyReviewsEnabled = false; saveMeta(); toast('Review reminders off.'); renderRoute(); return; }
    if (!('Notification' in window)) { toast('Notifications are not supported in this browser.', 'error'); renderRoute(); return; }
    if (Notification.permission === 'denied') { toast('Notifications are blocked for this site — enable them in your browser settings first.', 'error'); renderRoute(); return; }
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm !== 'granted') { toast('Notification permission was not granted.', 'error'); renderRoute(); return; }
    metaState.notifyReviewsEnabled = true; saveMeta();
    toast("Review reminders on — you'll get a nudge when cards are due.");
    renderRoute();
  }

  // Checked at boot and whenever the tab regains focus, throttled to once a day by
  // lastReviewNotifyDate — same daily-gate pattern as checkAutoBackup above. Only ever looks at
  // whichever track is active at the moment of the check, not every track at once.
  function checkDueReviewNotification() {
    if (!metaState.notifyReviewsEnabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (metaState.lastReviewNotifyDate === todayKey()) return;
    const due = getDueCards(false).length;
    if (!due) return;
    metaState.lastReviewNotifyDate = todayKey();
    saveMeta();
    try {
      const n = new Notification('Cert Study — reviews due', { body: `${due} card${due === 1 ? '' : 's'} due for review in ${CERT.name}.`, icon: '/api/app-icon.svg', tag: 'cert-study-due-reviews' });
      n.onclick = () => { window.focus(); n.close(); };
    } catch {}
  }

  // RFC 5545 requires literal backslash/semicolon/comma/newline to be backslash-escaped inside
  // TEXT values — cert and domain names in this app are plain enough that this rarely bites,
  // but a schedule someone's edited to include one shouldn't silently corrupt the whole file.
  function icsEscape(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function csvEscape(value) {
    const str = String(value ?? '');
    return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  }

  // Plain spreadsheet-friendly dump of every saved session for this track — the same rows the
  // History table already shows, just all of them (not just the last 8) and in a format a
  // spreadsheet app can sort/chart, for anyone who wants to track progress outside the app.
  function exportStatsCSV() {
    if (!state.sessions.length) { toast('No sessions to export yet.', 'error'); return; }
    const header = ['Date', 'Track', 'Type', 'Session', 'Core', 'Questions', 'Correct', 'First-try score %', 'Scaled score', 'Time (seconds)', 'Timed out'];
    const rows = state.sessions.map(s => [s.date, CERT.name, s.type, s.label, s.core, s.total, s.correct, s.score, s.scaled ?? '', s.elapsed, s.timedOut ? 'yes' : 'no']);
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `cert-study-stats-${CERT.name.replace(/\s+/g, '-')}-${todayKey()}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    toast(`Exported ${state.sessions.length} sessions to CSV.`);
  }

  // One .ics file, every phase in the plan — a personal calendar app has no idea what a
  // "domain block" is, so each one becomes a plain all-day event on its real dates. Built from
  // the exact same buildPhaseSchedule() output the Planner page itself renders, so the exported
  // calendar can never drift out of sync with what the in-app schedule actually shows.
  function exportPlanICS() {
    if (!planState.phases.length) { toast('No tracks in your plan yet.', 'error'); return; }
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const events = [];
    let cursorDate = planState.startDate;
    planState.phases.forEach(phase => {
      const schedule = buildPhaseSchedule(phase, cursorDate);
      cursorDate = phase.targetDate;
      if (!schedule) return;
      schedule.blocks.forEach((block, index) => {
        events.push({
          uid: `block-${phase.certId}-${index}-${block.start}@certstudy.local`,
          start: block.start, end: addDays(block.end, 1), // DTEND is exclusive per RFC 5545
          summary: `${block.domain.name} — ${schedule.cert.name}`,
          description: `${block.days} day${block.days === 1 ? '' : 's'} · ${block.domain.weight}% of the exam`
        });
      });
      events.push({
        uid: `review-${phase.certId}@certstudy.local`,
        start: schedule.review.start, end: addDays(schedule.review.end, 1),
        summary: `Review & mock exams — ${schedule.cert.name}`,
        description: 'Final review phase before the exam date, from your Cert Study plan.'
      });
      events.push({
        uid: `examday-${phase.certId}@certstudy.local`,
        start: phase.targetDate, end: addDays(phase.targetDate, 1),
        summary: `${schedule.cert.name} exam target date`,
        description: 'Target date set in your Cert Study plan.'
      });
    });
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cert Study//Study Plan//EN', 'CALSCALE:GREGORIAN'];
    events.forEach(event => {
      lines.push('BEGIN:VEVENT', `UID:${event.uid}`, `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${event.start.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${event.end.replace(/-/g, '')}`,
        `SUMMARY:${icsEscape(event.summary)}`, `DESCRIPTION:${icsEscape(event.description)}`, 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    // CRLF line endings are part of the ICS spec, not just style — some calendar apps
    // (older Outlook builds especially) reject or mis-parse a file with bare \n.
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `cert-study-plan-${todayKey()}.ics`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
    toast(`Exported ${events.length} calendar events — import the .ics file into Google Calendar, Outlook, or Apple Calendar.`);
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Reads the live theme's own CSS custom properties rather than hardcoding colors, so a card
  // generated in light mode looks like light mode and one generated in dark mode looks like
  // dark mode — same source of truth the rest of the app paints itself from.
  function generatePassCardCanvas({ certName, coreName, coreCode, score, passingScore, date, displayName }) {
    const styles = getComputedStyle(document.documentElement);
    const read = (name, fallback) => (styles.getPropertyValue(name) || '').trim() || fallback;
    const bg = read('--bg', '#0b1220'), surface = read('--surface-2', '#101c2b'), primary = read('--primary', '#2dd4bf'),
      text = read('--text', '#edf4fb'), muted = read('--muted', '#91a0b5'), onPrimary = read('--on-primary', '#04201c');
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, bg); grad.addColorStop(1, surface);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = primary; ctx.lineWidth = 6; roundedRectPath(ctx, 18, 18, 1164, 594, 24); ctx.stroke();

    ctx.fillStyle = muted; ctx.font = '700 22px Arial, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('CERT STUDY', 64, 84);

    roundedRectPath(ctx, 64, 112, 150, 46, 23); ctx.fillStyle = primary; ctx.fill();
    ctx.fillStyle = onPrimary; ctx.font = '800 20px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PASSED', 139, 141);
    ctx.textAlign = 'left';

    ctx.fillStyle = text; ctx.font = '800 48px Arial, sans-serif';
    ctx.fillText(certName, 64, 232);
    ctx.fillStyle = muted; ctx.font = '500 26px Arial, sans-serif';
    ctx.fillText(`${coreName} · ${coreCode}`, 64, 272);

    ctx.fillStyle = primary; ctx.font = '900 150px Arial, sans-serif';
    ctx.fillText(String(score), 60, 445);
    ctx.fillStyle = muted; ctx.font = '500 28px Arial, sans-serif';
    ctx.fillText(`out of 900 · passing score ${passingScore}`, 68, 485);

    ctx.fillStyle = muted; ctx.font = '500 22px Arial, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(displayName ? `${displayName} · ${date}` : date, 64, 566);
    ctx.textAlign = 'right';
    ctx.fillText('Self-reported — not an official CompTIA record', 1136, 566);
    ctx.textAlign = 'left';
    return canvas;
  }

  function downloadPassCard(coreId) {
    const core = CERT.cores[coreId]; const result = state.examResults[coreId];
    if (!core || !result) return;
    const canvas = generatePassCardCanvas({
      certName: CERT.name, coreName: core.name, coreCode: core.code,
      score: result.score, passingScore: core.passingScore, date: formatDateKey(result.date),
      displayName: metaState.displayName
    });
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = `${CERT.name.replace(/[^\w-]+/g, '-')}-${coreId}-pass-card.png`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    }, 'image/png');
  }

  function examResultDialogMarkup(coreId) {
    const core = CERT.cores[coreId];
    const existing = state.examResults[coreId];
    return `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="exam-result-title">
      <h2 id="exam-result-title">Record your real ${escapeHtml(core.name)} result</h2>
      <p>Separate from this app's own practice estimates — your actual scaled score from Pearson VUE, so a shareable pass card can be generated from it.</p>
      <form id="exam-result-form" data-core="${coreId}">
        <div class="field"><label for="exam-result-score">Scaled score (out of 900)</label><input type="number" id="exam-result-score" min="100" max="900" value="${existing ? existing.score : ''}" required></div>
        <div class="field"><label for="exam-result-date">Exam date</label><input type="date" id="exam-result-date" value="${existing ? existing.date : todayKey()}" required></div>
        <div class="button-row"><button class="primary" type="submit">Save result</button><button class="secondary" type="button" data-action="close-dialog">Cancel</button>${existing ? `<button class="ghost" type="button" data-action="clear-exam-result" data-core="${coreId}">${icon('trash')} Clear</button>` : ''}</div>
      </form>
    </div>`;
  }

  function openExamResultDialog(coreId) {
    openDialog(examResultDialogMarkup(coreId));
  }

  function clearExamResult(coreId) {
    delete state.examResults[coreId];
    saveState();
    closeDialog();
    toast('Result cleared.');
    renderRoute();
  }

  // Plain-text (TSV) export, not a real .apkg — Anki's own "Import File" dialog reads this
  // directly (the #-prefixed header lines are its documented plain-text-import directives:
  // separator/html/notetype/deck/tags-column), so no SQLite or zip writer is needed client-side.
  // A field can't contain a literal tab or newline in this format, so both get neutralised.
  function ankiField(text) {
    return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');
  }
  // Anki treats spaces as tag separators within the tags column, and colons as hierarchy
  // separators (shown as a nested tree in Anki's sidebar) — so track::domain reads as a
  // two-level group per track instead of one flat, unbrowsable tag per domain.
  function ankiTag(text) {
    return String(text || '').trim().replace(/[^\w\s:+-]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_');
  }
  function exportAnkiDeck(filter = {}) {
    const cards = allConcepts().filter(concept => (!filter.core || filter.core === 'all' || concept.core === filter.core) && (!filter.domain || filter.domain === 'all' || concept.domain === filter.domain));
    if (!cards.length) { toast('No cards match that filter.', 'error'); return; }
    const trackTag = ankiTag(CERT.name);
    const lines = ['#separator:tab', '#html:true', '#notetype:Basic', `#deck:${CERT.name}`, '#tags column:3',
      ...cards.map(concept => {
        const domain = domainById[concept.domain];
        const front = ankiField(concept.term);
        // Escape each raw field individually, then splice in the <br>/<i> ourselves — escaping
        // the already-assembled string would turn our own literal tags into visible "&lt;br&gt;"
        // text on the card instead of an actual line break.
        const back = concept.scenario ? `${ankiField(concept.definition)}<br><br><i>${ankiField(concept.scenario)}.</i>` : ankiField(concept.definition);
        const tags = [domain ? `${trackTag}::${ankiTag(domain.name)}` : trackTag, concept.objective ? `obj_${ankiTag(concept.objective)}` : null].filter(Boolean).join(' ');
        return `${front}\t${back}\t${tags}`;
      })];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${CERT.name.replace(/[^\w-]+/g, '-')}-anki.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
    toast(`Exported ${cards.length} card${cards.length === 1 ? '' : 's'} — in Anki, use File > Import and pick this file.`);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.format === 'full' && parsed.progress && typeof parsed.progress === 'object') {
          const entries = Object.entries(parsed.progress);
          if (!entries.length) throw new Error('Empty backup');
          // Snapshot every track's CURRENT server-side data before overwriting anything, so an
          // accidental "wrong file" import can be undone exactly — a full restore touches every
          // track at once, so undo has to be able to put all of them back, not just the active one.
          await refreshRemoteProgress();
          const previousProgress = JSON.parse(JSON.stringify(remoteProgress));
          const writeAll = payload => Promise.all(Object.entries(payload).map(([key, value]) => fetch('/api/progress', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: activeProfileId, key, value })
          })));
          // Every top-level key (each track's progress, plus the study plan) restored as its
          // own write through the same endpoint saveState/savePlan already use — no server
          // change needed, and each key's write is independently safe even run in parallel.
          await writeAll(parsed.progress);
          await reloadStateForActiveCert();
          renderRoute();
          toast('Full backup restored — every track and your study plan.', 'success', { label: 'Undo', run: async () => {
            await writeAll(previousProgress);
            await reloadStateForActiveCert();
            renderRoute();
            toast('Import undone.');
          } });
          return;
        }
        // Older single-track export, from before full-backup export existed — restore just
        // the currently active track, same as this always used to work.
        const incoming = parsed.state || parsed;
        if (!incoming.stats || !incoming.settings) throw new Error('Invalid backup');
        const previousState = state;
        state = { ...defaultState(), ...incoming, settings: { ...defaultState().settings, ...incoming.settings }, stats: { ...defaultState().stats, ...incoming.stats } };
        saveState(); renderRoute();
        toast('Progress restored — this track only (older single-track backup).', 'success', { label: 'Undo', run: () => { state = previousState; saveState(); renderRoute(); } });
      } catch { toast('That file is not a valid backup.', 'error'); }
    };
    reader.readAsText(file);
  }

  // ---------- Command palette (Ctrl/Cmd+K or "/") ----------
  let paletteIndex = [];
  let paletteMatches = [];
  let paletteSel = 0;

  function isTypingTarget(el) {
    if (!el) return false;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable;
  }

  function buildPaletteIndex() {
    const items = [];
    const domain = currentDomain();
    Object.entries(routeMeta).forEach(([route, meta]) => {
      if (domain === 'programs' && CERTS_ONLY_ROUTES.has(route)) return;
      items.push({ type: 'Page', label: meta[0], sub: meta[1], icon: 'arrow', run: () => navigate(route) });
    });
    items.push({ type: 'Action', label: 'Start Quick 10', sub: 'Balanced 10-question set', icon: 'bolt', run: () => startPractice({ count: 10, mode: 'Quick 10' }) });
    items.push({ type: 'Action', label: 'Search everything', sub: 'Guide, glossary, and labs', icon: 'search', run: () => navigate('search') });
    if (domain === 'certs') {
      items.push({ type: 'Action', label: 'Weak-area trainer', sub: 'Target your lowest-mastery domains', icon: 'target', run: () => startPractice({ count: 15, weak: true, mode: 'Weak-area trainer' }) });
      items.push({ type: 'Action', label: 'Adaptive difficulty', sub: 'Question difficulty adjusts as you answer', icon: 'bolt', run: () => startAdaptivePractice({ count: 15, mode: 'Adaptive difficulty' }) });
      items.push({ type: 'Action', label: 'Spaced review', sub: `${getDueCards(false).length} due for review`, icon: 'clock', run: () => startSpacedReviewPractice() });
      items.push({ type: 'Action', label: 'Review flagged questions', sub: `${Object.keys(state.flaggedQuestions).length} flagged`, icon: 'flag', run: () => startFlaggedReview() });
      items.push({ type: 'Action', label: 'Simulate an exam', sub: 'Full timed mock exam', icon: 'clipboard', run: () => navigate('exams') });
      items.push({ type: 'Action', label: 'Export to Anki', sub: `All ${allConcepts().length} cards as a TSV file`, icon: 'download', run: () => exportAnkiDeck() });
      items.push({ type: 'Action', label: 'Add a custom card', sub: 'Your own flashcard for this track', icon: 'edit', run: () => openCustomCardDialog() });
      if (planState.phases.length) items.push({ type: 'Action', label: 'Export study plan to calendar', sub: '.ics file for Google, Outlook, or Apple Calendar', icon: 'calendar', run: () => exportPlanICS() });
      items.push({ type: 'Action', label: 'Achievements', sub: `${getAchievements().filter(b => b.earned).length}/${ACHIEVEMENTS.length} earned`, icon: 'trophy', run: () => navigate('achievements') });
      items.push({ type: 'Action', label: 'Exam day', sub: 'Checklist and last-minute review', icon: 'flag', run: () => navigate('examday') });
    }
    // Mistake patterns and Study packet already get a palette entry from the routeMeta loop
    // above (the latter isn't certs-only, same as Study guide itself) — no need to duplicate them here.
    items.push({ type: 'Action', label: `Switch to ${state.settings.theme === 'dark' ? 'light' : 'dark'} theme`, icon: state.settings.theme === 'dark' ? 'sun' : 'moon', run: () => setThemeMode(state.settings.theme === 'dark' ? 'light' : 'dark') });
    items.push({ type: 'Action', label: 'Keyboard shortcuts', sub: 'Every shortcut in one place', icon: 'keyboard', run: () => openShortcuts() });
    items.push({ type: 'Action', label: "What's new", sub: `Changelog · ${APP_VERSION}`, icon: 'sparkles', run: () => openWhatsNew(true) });
    items.push({ type: 'Action', label: 'Export a full backup', sub: 'Download every track as JSON', icon: 'download', run: () => exportData() });
    CERT_REGISTRY.forEach(entry => {
      if (entry.id === activeCertId) return;
      items.push({ type: 'Track', label: entry.label, sub: 'Switch to this track', icon: 'repeat', run: () => switchCert(entry.id) });
    });
    if (domain === 'certs' && CERT && CERT.cores) {
      Object.values(CERT.cores).flatMap(core => core.domains).forEach(dm => {
        items.push({ type: 'Domain', label: `Drill ${dm.name}`, sub: `${dm.weight}% of the exam`, icon: 'target', run: () => startPractice({ count: 15, domain: dm.id, mode: `${dm.name} drill` }) });
      });
    }
    (LABS || []).forEach(lab => items.push({ type: 'Lab', label: lab.title, sub: `${lab.difficulty}${domainById[lab.domain] ? ' · ' + domainById[lab.domain].name : ''}`, icon: 'terminal', run: () => startLab(lab.id) }));
    if ((LABS || []).some(lab => lab.type === 'terminal')) items.push({ type: 'Action', label: 'Command reference', sub: 'Every command taught across the labs', icon: 'terminal', run: () => navigate('commands') });
    (GUIDE || []).forEach(chapter => {
      const dm = domainById[chapter.domain];
      if (!dm) return;
      // Full chapter text (not just the title) so Global Search can match a word actually
      // used mid-paragraph, not only the chapter/domain name — see scorePaletteItem's
      // separate, lower-ranked `body` check and paletteResultsFor's snippet generation below.
      const bodyText = [chapter.overview, ...(chapter.sections || []).flatMap(s => [s.heading, s.body])].filter(Boolean).join(' ');
      items.push({ type: 'Guide', label: `${dm.name} — study guide`, sub: 'Open the chapter', icon: 'brain', body: bodyText, run: () => {
        const coreKey = Object.keys(CERT.cores).find(key => CERT.cores[key].domains.some(d => d.id === chapter.domain));
        if (coreKey) objectiveCore = coreKey;
        navigate('guide');
        // renderRoute() itself just ran a smooth window.scrollTo({top:0}) — a second smooth
        // scrollIntoView call shortly after gets silently dropped in this browser rather than
        // interrupting/redirecting it (confirmed empirically, not just a timing guess: waiting
        // even 2 real seconds doesn't help, but 'instant' works immediately in the same spot).
        setTimeout(() => document.getElementById(`guide-${chapter.domain}`)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 160);
      } });
    });
    (allConcepts() || []).forEach(concept => items.push({ type: 'Term', label: concept.term, sub: domainById[concept.domain] ? domainById[concept.domain].name : '', icon: 'book', body: `${concept.definition || ''} ${concept.scenario || ''}`, run: () => { glossaryQuery = concept.term; glossaryDomain = 'all'; navigate('glossary'); } }));
    // Global Search's third source: your own notes. Concept-scoped like everywhere else notes
    // surface, so the note's own term gives it a real label instead of a bare "Note" entry.
    Object.entries(state.notes || {}).forEach(([key, value]) => {
      const conceptId = key.replace(/^note:/, '');
      const concept = conceptById[conceptId];
      if (!concept || !value.text) return;
      items.push({ type: 'Note', label: `Note: ${concept.term}`, sub: value.text, icon: 'edit', body: value.text, run: () => { navigate('notes'); setTimeout(() => document.getElementById(`note-${conceptId}`)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 160); } });
    });
    return items;
  }

  function scorePaletteItem(query, item) {
    const label = item.label.toLowerCase();
    if (label === query) return 100;
    if (label.startsWith(query)) return 82;
    if (label.split(/[\s—·/-]+/).some(word => word.startsWith(query))) return 62;
    if (label.includes(query)) return 42;
    if (item.type.toLowerCase().includes(query)) return 22;
    // Global Search: a real word found in a term's definition/scenario, a guide chapter's
    // actual paragraph text, or a note's own text — ranked above the last-resort fuzzy
    // subsequence match below, since a genuine substring hit in real content is more likely
    // what was meant than two letters that happen to appear in the right order in a label.
    if (item.body && item.body.toLowerCase().includes(query)) return 30;
    let i = 0;
    for (const ch of label) { if (ch === query[i]) i++; if (i === query.length) break; }
    return i === query.length ? 12 : -1;
  }

  // When a match came from body text rather than the label itself, swap the displayed sub-line
  // for a short excerpt centered on the match — otherwise a Term/Guide/Note result found by
  // Global Search would show its normal (irrelevant-looking) sub and give no hint why it matched.
  function paletteSnippet(item, query) {
    const label = item.label.toLowerCase();
    if (!item.body || label.includes(query)) return item.sub;
    const body = item.body; const idx = body.toLowerCase().indexOf(query);
    if (idx === -1) return item.sub;
    const start = Math.max(0, idx - 30); const end = Math.min(body.length, idx + query.length + 45);
    return `${start > 0 ? '…' : ''}${body.slice(start, end).trim()}${end < body.length ? '…' : ''}`;
  }

  function paletteResultsFor(query) {
    const q = query.trim().toLowerCase();
    if (!q) return paletteIndex.filter(item => item.type === 'Page' || item.type === 'Action').slice(0, 8);
    return paletteIndex
      .map(item => ({ item, score: scorePaletteItem(q, item) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map(entry => ({ ...entry.item, sub: paletteSnippet(entry.item, q) }));
  }

  function renderPaletteResults() {
    const input = document.getElementById('palette-input');
    const ul = document.getElementById('palette-results');
    if (!input || !ul) return;
    paletteMatches = paletteResultsFor(input.value);
    if (paletteSel >= paletteMatches.length) paletteSel = 0;
    ul.innerHTML = paletteMatches.length
      ? paletteMatches.map((item, i) => `<li id="palette-opt-${i}" role="option" aria-selected="${i === paletteSel}" class="palette-opt${i === paletteSel ? ' active' : ''}" data-palette-index="${i}"><span class="palette-opt-icon">${icon(item.icon)}</span><span class="palette-opt-body"><strong>${escapeHtml(item.label)}</strong>${item.sub ? `<small>${escapeHtml(item.sub)}</small>` : ''}</span><span class="palette-opt-type">${escapeHtml(item.type)}</span></li>`).join('')
      : `<li class="palette-empty">No matches — try a page name, a term, or an action.</li>`;
    input.setAttribute('aria-activedescendant', paletteMatches.length ? `palette-opt-${paletteSel}` : '');
    ul.querySelector('.palette-opt.active')?.scrollIntoView({ block: 'nearest' });
  }

  function openPalette() {
    if (dialogLayer.querySelector('.palette')) return;
    paletteIndex = buildPaletteIndex();
    paletteSel = 0;
    openDialog(`<div class="dialog palette" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="palette-input-wrap">${icon('command')}<input id="palette-input" type="text" placeholder="Search pages, terms, guide chapters, notes, labs, actions…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="palette-results"></div>
      <ul id="palette-results" class="palette-results" role="listbox" aria-label="Command results"></ul>
      <div class="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
    </div>`);
    renderPaletteResults();
    setTimeout(() => document.getElementById('palette-input')?.focus(), 0);
  }

  function movePaletteSel(delta) {
    if (!paletteMatches.length) return;
    paletteSel = (paletteSel + delta + paletteMatches.length) % paletteMatches.length;
    renderPaletteResults();
  }

  function activatePaletteSel(index) {
    const item = paletteMatches[index != null ? index : paletteSel];
    if (!item) return;
    closeDialog();
    item.run();
  }

  // ---------- Keyboard shortcuts reference ----------
  function openShortcuts() {
    const groups = [
      ['Global', [['Ctrl / ⌘ + K', 'Open the command palette'], ['/', 'Open the command palette'], ['?', 'Show this shortcuts list'], ['Esc', 'Close a dialog']]],
      ['Jump to a page (press G, then a letter)', [
        ['G D', 'Dashboard'], ['G P', 'Practice'], ['G E', 'Mock exams'], ['G F', 'Flashcards'],
        ['G L', 'Labs'], ['G T', 'Case studies'], ['G X', 'Terminal sandbox'], ['G C', 'Crossword'],
        ['G K', 'Fill in the blank'], ['G B', 'Browse cards'], ['G G', 'Glossary'], ['G S', 'Study guide'],
        ['G N', 'My notes'], ['G H', 'Progress'], ['G M', 'Exam map'], ['G A', 'Achievements']
      ]],
      ['Practice & exams', [['1 – 4', 'Choose answer A–D'], ['N or →', 'Next question'], ['F', 'Flag or unflag the question']]],
      ['Flashcards', [['Space / Enter', 'Flip the card'], ['1 – 4', 'Rate Again / Hard / Good / Easy']]],
      ['Crossword', [['Arrow keys', 'Move between cells'], ['A – Z', 'Type a letter'], ['Backspace', 'Clear a letter'], ['[ or ]', 'Previous / next clue']]],
      ['Terminal sandbox', [['↑ / ↓', 'Recall previous commands']]],
      ['Study guide', [['Space', 'Pause / resume read-aloud']]]
    ];
    openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="sc-title"><h2 id="sc-title">Keyboard shortcuts</h2><p>Move through the app without reaching for the mouse.</p><div class="shortcut-groups">${groups.map(([name, list]) => `<div class="shortcut-group"><h3>${name}</h3>${list.map(([keys, desc]) => `<div class="shortcut-row"><kbd>${escapeHtml(keys)}</kbd><span>${escapeHtml(desc)}</span></div>`).join('')}</div>`).join('')}</div><div class="button-row" style="margin-top:18px"><button class="secondary" data-action="close-dialog">Close</button></div></div>`);
  }

  // ---------- What's new ----------
  function openWhatsNew(force) {
    if (!force && metaState.seenVersion === APP_VERSION) return;
    openDialog(`<div class="dialog whats-new" role="dialog" aria-modal="true" aria-labelledby="wn-title">
      <h2 id="wn-title">What's new</h2>
      <p>You're on <strong>${APP_VERSION}</strong>. Recent changes:</p>
      <div class="changelog">${CHANGELOG.map(rel => `<div class="changelog-entry"><div class="changelog-head"><span class="tag${rel.version === APP_VERSION ? ' teal' : ''}">${rel.version}</span><strong>${escapeHtml(rel.title)}</strong><small>${escapeHtml(rel.date)}</small></div><ul>${rel.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>`).join('')}</div>
      <div class="button-row" style="margin-top:16px"><button class="primary" data-action="dismiss-whats-new">Got it</button></div>
    </div>`);
  }

  function markVersionSeen() {
    if (metaState.seenVersion !== APP_VERSION) { metaState.seenVersion = APP_VERSION; saveMeta(); }
  }

  function hasAnyProgress() {
    return CERT_REGISTRY.some(entry => {
      const blob = remoteProgress[entry.progressKey];
      return blob && ((blob.stats && blob.stats.answered > 0) || (Array.isArray(blob.sessions) && blob.sessions.length) || (blob.completedLabs && Object.keys(blob.completedLabs).length));
    });
  }

  // ---------- First-run walkthrough (per track) + optional diagnostic ----------
  let onboardStep = 0;
  let onboardExamDate = '';
  function openOnboarding() {
    onboardStep = 0;
    onboardExamDate = state.examDate || '';
    dialogReturnFocus = document.activeElement;
    renderOnboardingStep();
  }
  function renderOnboardingStep() {
    const domainCount = Object.values(CERT.cores).flatMap(core => core.domains).length;
    const coreCount = Object.keys(CERT.cores).length;
    const steps = [
      `<h2>Welcome to ${escapeHtml(CERT.name)}</h2><p>${QUESTIONS.length.toLocaleString()} original questions built from ${CONCEPTS.length} concepts across ${domainCount} weighted domain${domainCount === 1 ? '' : 's'} and ${coreCount} exam${coreCount === 1 ? '' : 's'}. Every answer comes with an explanation, and practice leans toward what you get wrong.</p><div class="onboard-points">${['Practice, flashcards, labs and full timed mock exams', 'A readiness score weighted like the real exam blueprint', 'A study plan that turns your exam date into a weekly schedule'].map(point => `<div class="onboard-point">${icon('check')}<span>${point}</span></div>`).join('')}</div>`,
      `<h2>When's your exam?</h2><p>Optional. Set it and the dashboard shows a countdown and the readiness trend projects whether you'll be ready in time. Change it any time in Settings.</p><div class="field"><label for="onboard-exam-date">Exam date</label><input type="date" id="onboard-exam-date" value="${onboardExamDate}"></div>`,
      `<h2>Start with a quick diagnostic?</h2><p>${DIAGNOSTIC_LEN} questions spread across every domain — no explanations, just answer. It gives your readiness a real starting point instead of zero, and takes about ${Math.round(DIAGNOSTIC_LEN * 0.6)} minutes. Your first attempts still count.</p>`
    ];
    const nav = onboardStep < 2
      ? `<div class="button-row" style="margin-top:18px"><button class="primary" data-action="onboard-next">Continue</button><button class="ghost" data-action="onboard-skip">Skip setup</button></div>`
      : `<div class="button-row" style="margin-top:18px"><button class="primary" data-action="onboard-diagnostic">${icon('play')} Start diagnostic</button><button class="ghost" data-action="onboard-skip">Not now</button></div>`;
    dialogLayer.innerHTML = `<div class="dialog onboard" role="dialog" aria-modal="true" aria-label="Getting started"><div class="onboard-progress">${[0, 1, 2].map(i => `<span class="${i <= onboardStep ? 'on' : ''}"></span>`).join('')}</div>${steps[onboardStep]}${nav}</div>`;
    hydrateIcons(dialogLayer);
    focusDialog();
  }
  function captureOnboardDate() {
    const input = document.getElementById('onboard-exam-date');
    if (input && input.value) onboardExamDate = input.value;
  }
  function finishOnboarding(startDiag) {
    captureOnboardDate();
    if (onboardExamDate) state.examDate = onboardExamDate;
    state.onboardedAt = new Date().toISOString();
    saveState();
    markVersionSeen();
    closeDialog();
    if (startDiag) startDiagnostic();
    else renderRoute();
  }

  function startDiagnostic() {
    const domains = Object.values(CERT.cores).flatMap(core => core.domains);
    const totalWeight = domains.reduce((sum, domain) => sum + (domain.weight || 0), 0) || 1;
    const seed = Date.now();
    let questions = [];
    domains.forEach(domain => {
      const n = Math.max(1, Math.round(DIAGNOSTIC_LEN * (domain.weight || 0) / totalWeight));
      questions.push(...sampleQuestions({ domain: domain.id }, n, `${seed}-${domain.id}`));
    });
    questions = seededShuffle(questions, `${seed}-diag`).slice(0, DIAGNOSTIC_LEN);
    if (!questions.length) { renderRoute(); return; }
    activeSession = {
      id: `diagnostic-${seed}`, source: 'practice', diagnostic: true, mode: 'Starting diagnostic',
      questions, index: 0, responses: Array(questions.length).fill(null), startedAt: Date.now(), secondChance: false
    };
    navigate('practice');
  }

  function handleAction(action, button) {
    if (action === 'quick-practice') startPractice({ count: 10, mode: 'Quick 10' });
    if (action === 'start-today') startTodaysSession();
    if (action === 'weak-practice') startPractice({ count: 15, weak: true, mode: 'Weak-area trainer' });
    if (action === 'adaptive-practice') startAdaptivePractice({ count: 15, mode: 'Adaptive difficulty' });
    if (action === 'spaced-review-practice') startSpacedReviewPractice();
    if (action === 'missed-practice') startPractice({ count: 20, missed: true, mode: 'Missed-question repair' });
    if (action === 'review-flagged') startFlaggedReview();
    if (action === 'domain-drill') startPractice({ count: 15, domain: button.dataset.domain, mode: `${domainById[button.dataset.domain].name} drill` });
    if (action === 'practice-gaps') startGapPractice(button.dataset.domain || null);
    if (action === 'drill-objective') {
      const dom = domainById[button.dataset.domain];
      startPractice({ count: 15, domain: button.dataset.domain, objective: button.dataset.objective, mode: `${dom ? dom.name + ' · ' : ''}Objective ${button.dataset.objective} drill` });
    }
    if (action === 'drill-concept') {
      const concept = conceptById[button.dataset.concept];
      startPractice({ count: 1, conceptIds: [button.dataset.concept], mode: concept ? `${concept.term} drill` : 'Concept drill' });
    }
    if (action === 'practice-missed') startMissedPractice(button.dataset.domain);
    if (action === 'practice-concept') {
      const concept = conceptById[button.dataset.concept];
      startPractice({ conceptIds: [button.dataset.concept], count: 6, mode: concept ? `${concept.term} — focused` : 'Concept drill' });
    }
    if (action === 'open-review') { activeReview = button.dataset.sessionId; reviewFilter = 'all'; navigate('history'); }
    if (action === 'review-missed') {
      reviewFilter = 'missed';
      if (button.dataset.sessionId) { activeReview = button.dataset.sessionId; navigate('history'); }
      else if (resultsView) {
        renderResults(resultsView.session, resultsView.result);
        hydrateIcons(main);
        requestAnimationFrame(() => document.getElementById('answer-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    }
    if (action === 'close-review') { activeReview = null; renderHistory(); hydrateIcons(main); }
    if (action === 'review-filter') {
      reviewFilter = button.dataset.filter;
      if (activeReview) renderStoredReview(activeReview);
      else if (resultsView) renderResults(resultsView.session, resultsView.result);
      hydrateIcons(main);
    }
    if (action === 'review-flag') {
      const qid = button.dataset.qid;
      if (state.flaggedQuestions[qid]) delete state.flaggedQuestions[qid];
      else state.flaggedQuestions[qid] = { conceptId: button.dataset.concept, domain: button.dataset.domain, flaggedAt: new Date().toISOString() };
      saveState();
      if (activeReview) renderStoredReview(activeReview);
      else if (resultsView) renderResults(resultsView.session, resultsView.result);
      hydrateIcons(main);
    }
    if (action === 'edit-note') openNoteDialog(button.dataset.concept);
    if (action === 'delete-note') {
      const conceptId = button.dataset.concept;
      const previous = getNote(conceptId);
      setNote(conceptId, '');
      closeDialog();
      renderRoute();
      toast('Note deleted.', 'success', previous ? { label: 'Undo', run: () => { setNote(conceptId, previous.text); renderRoute(); } } : null);
    }
    if (action === 'start-exam') startExam(button.dataset.core, button.dataset.mode);
    if (action === 'next-question') nextQuestion();
    if (action === 'flag-question') {
      const question = activeSession.questions[activeSession.index];
      if (state.flaggedQuestions[question.id]) delete state.flaggedQuestions[question.id];
      else state.flaggedQuestions[question.id] = { conceptId: question.conceptId, domain: question.domain, flaggedAt: new Date().toISOString() };
      saveState(); renderQuiz();
    }
    if (action === 'submit-exam') { closeDialog(); finishSession(); }
    if (action === 'exit-session') { openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="exit-session-title"><h2 id="exit-session-title">Leave this session?</h2><p>Your unfinished answers will not be added to history.</p><div class="button-row"><button class="danger-button" data-action="confirm-exit-session">Leave session</button><button class="secondary" data-action="close-dialog">Keep studying</button></div></div>`); }
    if (action === 'confirm-exit-session') { closeDialog(); exitFullscreenIfActive(); stopSpeakOnce(); activeSession = null; renderRoute(); }
    if (action === 'toggle-fullscreen') { if (document.fullscreenElement) exitFullscreenIfActive(); else requestExamFullscreen(); }
    if (action === 'toggle-scratchpad' && activeSession) { activeSession.scratchpadOpen = !activeSession.scratchpadOpen; renderQuiz(); }
    if (action === 'clear-scratchpad' && activeSession) { activeSession.scratchpadText = ''; renderQuiz(); }
    if (action === 'speak-question') speakCurrentQuestion();
    if (action === 'speak-flashcard') speakCurrentFlashcard();
    if (action === 'retry-session') button.dataset.source === 'exams' ? startExam(button.dataset.core, 'sprint') : startPractice({ count: 10, mode: 'Quick 10' });
    if (action === 'start-flash') startFlashcards({ count: 20 });
    if (action === 'flip-card') { flashSession.flipped = !flashSession.flipped; renderFlashSession(); }
    if (action === 'exit-flash') { stopSpeakOnce(); flashSession = null; renderFlashcards(); }
    if (action === 'start-lab') startLab(button.dataset.lab);
    if (action === 'toggle-lab-flag') {
      const labId = button.dataset.labId;
      if (state.flaggedLabs[labId]) delete state.flaggedLabs[labId];
      else state.flaggedLabs[labId] = { flaggedAt: new Date().toISOString() };
      saveState();
      if (activeLab && activeLab.lab.id === labId) renderLabWorkbench(); else renderLabs();
      hydrateIcons(main);
    }
    if (action === 'exit-lab') { const wasCase = activeLab?.lab.type === 'scenario'; activeLab = null; wasCase ? renderCaseStudiesHub() : renderLabs(); hydrateIcons(main); }
    if (action === 'move-step') {
      const source = activeLab[button.dataset.from]; const target = button.dataset.from === 'available' ? activeLab.chosen : activeLab.available;
      const moved = source.splice(Number(button.dataset.index), 1)[0]; target.push(moved); activeLab.feedback = '';
      announce(button.dataset.from === 'available' ? `Added to your sequence, position ${activeLab.chosen.length}.` : 'Moved back to available actions.');
      renderLabWorkbench();
    }
    if (action === 'check-sequence') {
      const correct = activeLab.chosen.every((step, index) => step === activeLab.lab.steps[index]);
      if (correct) completeLab(); else { const firstWrong = activeLab.chosen.findIndex((step, index) => step !== activeLab.lab.steps[index]); activeLab.feedback = `Not quite. Reconsider step ${firstWrong + 1}; sequence should follow evidence, safety, and dependencies.`; announce(activeLab.feedback); renderLabWorkbench(); }
    }
    if (action === 'decision-answer') {
      const stage = activeLab.lab.stages[activeLab.stage]; const choice = Number(button.dataset.index);
      if (choice === stage.correct) { activeLab.stage++; activeLab.feedback = stage.feedback; if (activeLab.stage >= activeLab.lab.stages.length) completeLab(); else { toast(stage.feedback); renderLabWorkbench(); } }
      else { activeLab.feedback = `Try again. ${stage.feedback}`; announce(activeLab.feedback); renderLabWorkbench(); }
    }
    if (action === 'lab-hint') { activeLab.feedback = activeLab.lab.terminal[activeLab.stage].hint; announce(`Hint: ${activeLab.feedback}`); renderLabWorkbench(); }
    if (action === 'lab-command-list') { activeLab.transcript += `\ntech@study> help\n${terminalCommandHelp(activeLab.lab)}\n`; renderLabWorkbench(); }
    if (action === 'scenario-choice') {
      const nextId = button.dataset.next;
      activeLab.log.push({ prompt: button.dataset.prompt, choice: button.dataset.label });
      activeLab.nodeId = nextId;
      const nextNode = activeLab.lab.nodes[nextId];
      if (nextNode.end && nextNode.success) completeLab(); else renderLabWorkbench();
      hydrateIcons(main);
    }
    if (action === 'reset-lab') startLab(activeLab.lab.id);
    if (action === 'gui-tab') { activeLab.activePanel = button.dataset.panel; renderLabWorkbench(); hydrateIcons(main); }
    if (action === 'gui-toggle') { activeLab.controlState[button.dataset.control] = button.checked; activeLab.results = null; renderLabWorkbench(); hydrateIcons(main); }
    if (action === 'gui-verify') {
      const results = activeLab.lab.requirements.map(req => ({ ...req, pass: guiRequirementPass(req, activeLab.controlState[req.controlId]) }));
      activeLab.results = results;
      if (results.every(r => r.pass)) completeLab(); else { renderLabWorkbench(); hydrateIcons(main); }
    }
    if (action === 'visual-next') {
      if (activeLab.stepIndex >= activeLab.lab.steps.length - 1) completeLab();
      else { activeLab.stepIndex++; renderLabWorkbench(); hydrateIcons(main); }
    }
    if (action === 'visual-prev') { activeLab.stepIndex = Math.max(0, activeLab.stepIndex - 1); renderLabWorkbench(); hydrateIcons(main); }
    if (action === 'clear-lab-filter') { labDomainFilter = null; labCoreFilter = 'all'; renderLabs(); hydrateIcons(main); }
    if (action === 'clear-lab-search') { labQuery = ''; const input = document.getElementById('lab-search'); if (input) input.value = ''; renderLabResults(); }
    if (action === 'clear-command-search') { commandQuery = ''; const input = document.getElementById('command-search'); if (input) input.value = ''; renderCommandResults(); }
    if (action === 'start-crossword') startCrossword(button.dataset.domainId);
    if (action === 'exit-crossword') { activeCrossword = null; renderCrosswordHub(); hydrateIcons(main); }
    if (action === 'start-cloze') startCloze(button.dataset.domainId);
    if (action === 'exit-cloze') { clozeSession = null; renderClozeHub(); hydrateIcons(main); }
    if (action === 'cloze-next') clozeNext();
    if (action === 'browse-sort') { browseSort = button.dataset.sort; renderBrowseTable(); }
    if (action === 'browse-drill') {
      const concept = conceptById[button.dataset.concept];
      startPractice({ conceptIds: [button.dataset.concept], count: 1, mode: concept ? `${concept.term} drill` : 'Concept drill' });
    }
    if (action === 'browse-drill-selected') {
      const ids = [...browseSelected].filter(id => conceptById[id]);
      if (!ids.length) { toast('Nothing quizzable in your selection — custom cards can only be reviewed as flashcards.', 'error'); return; }
      startPractice({ conceptIds: ids, count: ids.length, mode: 'Browse selection drill' });
    }
    if (action === 'browse-reset-selected') {
      const ids = [...browseSelected];
      if (!ids.length) return;
      const previous = {}; ids.forEach(id => { if (state.flashcards[id]) previous[id] = state.flashcards[id]; });
      ids.forEach(id => delete state.flashcards[id]);
      saveState();
      browseSelected.clear(); renderBrowseTable();
      toast(`Reset schedule for ${ids.length} card${ids.length === 1 ? '' : 's'}.`, 'success', { label: 'Undo', run: () => {
        Object.entries(previous).forEach(([id, val]) => { state.flashcards[id] = val; });
        saveState(); renderBrowseTable();
      } });
    }
    if (action === 'browse-suspend-selected') {
      const ids = [...browseSelected]; if (!ids.length) return;
      ids.forEach(id => { state.suspendedConcepts[id] = true; });
      saveState(); browseSelected.clear(); renderBrowseTable();
      toast(`Suspended ${ids.length} card${ids.length === 1 ? '' : 's'} from Practice, Exams, and Flashcards.`, 'success', { label: 'Undo', run: () => {
        ids.forEach(id => delete state.suspendedConcepts[id]); saveState(); renderBrowseTable();
      } });
    }
    if (action === 'browse-unsuspend-selected') {
      const ids = [...browseSelected]; if (!ids.length) return;
      ids.forEach(id => delete state.suspendedConcepts[id]);
      saveState(); browseSelected.clear(); renderBrowseTable();
      toast(`Unsuspended ${ids.length} card${ids.length === 1 ? '' : 's'}.`);
    }
    if (action === 'browse-clear-selection') { browseSelected.clear(); renderBrowseTable(); }
    if (action === 'sandbox-reset') { sandboxSession = null; renderRoute(); }
    if (action === 'crossword-new-puzzle' && activeCrossword) startCrossword(activeCrossword.domainId);
    if (action === 'cw-select' && activeCrossword) {
      const cw = activeCrossword;
      const x = Number(button.dataset.x), y = Number(button.dataset.y);
      const cell = cw.layout.cellIndex.get(`${x},${y}`);
      if (cell) {
        const cur = cw.selected;
        if (cur.x === x && cur.y === y) {
          const other = cur.dir === 'across' ? 'down' : 'across';
          if (cell[other] != null) cw.selected = { x, y, dir: other };
        } else {
          cw.selected = { x, y, dir: cell[cur.dir] != null ? cur.dir : (cell.across != null ? 'across' : 'down') };
        }
        renderCrosswordPlay(); hydrateIcons(main);
      }
    }
    if (action === 'cw-select-clue' && activeCrossword) {
      const number = Number(button.dataset.number); const dir = button.dataset.dir;
      const entry = activeCrossword.layout.entries.find(e => e.number === number && e.dir === dir);
      if (entry) { crosswordSelectEntry(activeCrossword, entry); renderCrosswordPlay(); hydrateIcons(main); }
    }
    if ((action === 'cw-prev-clue' || action === 'cw-next-clue') && activeCrossword) {
      crosswordGoToClue(action === 'cw-next-clue' ? 1 : -1);
    }
    if (action === 'crossword-check' && activeCrossword) {
      const cw = activeCrossword; const marks = {};
      Object.keys(cw.userGrid).forEach(key => { if (cw.userGrid[key]) marks[key] = cw.userGrid[key] === cw.layout.solution.get(key) ? 'correct' : 'incorrect'; });
      cw.checkedCells = marks;
      renderCrosswordPlay(); hydrateIcons(main);
    }
    if (action === 'crossword-reveal-letter' && activeCrossword) {
      const cw = activeCrossword; const { x, y } = cw.selected;
      cw.userGrid[`${x},${y}`] = cw.layout.solution.get(`${x},${y}`); cw.checkedCells = null;
      renderCrosswordPlay(); hydrateIcons(main); checkCrosswordCompletion();
    }
    if (action === 'crossword-reveal-word' && activeCrossword) {
      const cw = activeCrossword; const entry = crosswordActiveEntry(cw);
      if (entry) {
        for (let k = 0; k < entry.answer.length; k++) {
          const cx = entry.dir === 'across' ? entry.x + k : entry.x; const cy = entry.dir === 'down' ? entry.y + k : entry.y;
          cw.userGrid[`${cx},${cy}`] = entry.answer[k];
        }
      }
      cw.checkedCells = null;
      renderCrosswordPlay(); hydrateIcons(main); checkCrosswordCompletion();
    }
    if (action === 'crossword-reveal-puzzle' && activeCrossword) {
      const cw = activeCrossword;
      cw.layout.solution.forEach((letter, key) => { cw.userGrid[key] = letter; });
      cw.checkedCells = null;
      renderCrosswordPlay(); hydrateIcons(main); checkCrosswordCompletion();
    }
    if (action === 'weak-domain-quiz') startPractice({ count: 15, domain: button.dataset.domain, mode: `${domainById[button.dataset.domain].name} focus quiz` });
    if (action === 'weak-domain-flash') startFlashcards({ domain: button.dataset.domain, count: 15, mode: 'flip' });
    if (action === 'weak-domain-lab') { labDomainFilter = button.dataset.domain; navigate('labs'); }
    if (action === 'print-page') window.print();
    if (action === 'reveal-recall') {
      flashSession.typed = document.getElementById('recall-input')?.value || '';
      flashSession.matchHint = recallMatchHint(flashSession.typed, flashSession.cards[flashSession.index].definition);
      flashSession.submitted = true;
      renderFlashSession();
    }
    if (action === 'objective-core') { objectiveCore = button.dataset.core; renderRoute(); }
    if (action === 'toggle-domain-card') {
      const id = button.dataset.domain;
      expandedDomains.has(id) ? expandedDomains.delete(id) : expandedDomains.add(id);
      renderRoute();
    }
    if (action === 'guide-jump') {
      const domainId = button.dataset.domainId;
      if (currentRoute() === 'guide') document.getElementById(`guide-${domainId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Called from elsewhere (e.g. the highlights digest) — navigate to the guide first, same
      // 'instant' + short delay technique guide-resume-position already uses, since a smooth
      // scroll immediately after renderRoute()'s own smooth scroll-to-top gets silently dropped.
      else { navigate('guide'); setTimeout(() => document.getElementById(`guide-${domainId}`)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 160); }
    }
    if (action === 'guide-resume-position') {
      const position = state.guideReadPosition;
      if (!position || !domainById[position.domain]) return;
      if (CERT.cores[position.core]) objectiveCore = position.core;
      navigate('guide');
      // 'instant', not 'smooth' — see the identical comment on the command palette's own
      // guide-chapter jump just above: a smooth scrollIntoView shortly after renderRoute()'s
      // own smooth scroll-to-top gets silently dropped in this browser, no matter how long
      // you wait afterward; 'instant' is what actually and reliably lands on the target.
      setTimeout(() => document.getElementById(`guide-${position.domain}`)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 160);
    }
    if (action === 'guide-speak') speakChapter(button.dataset.domainId);
    if (action === 'guide-speak-toggle') toggleGuideSpeechPause();
    if (action === 'guide-speak-stop') stopGuideSpeech();
    if (action === 'guide-speak-rate') cycleGuideSpeechRate();
    if (action === 'confirm-highlight') {
      if (pendingGuideHighlight) addGuideHighlight({ ...pendingGuideHighlight, color: button.dataset.color });
      hideGuideHighlightPopover();
      window.getSelection()?.removeAllRanges();
    }
    if (action === 'remove-guide-highlight') removeGuideHighlight(button.dataset.domainId, button.dataset.highlightId);
    if (action === 'start-focus-timer') openDialog(focusTimerDialogMarkup());
    if (action === 'set-focus-work') { state.settings.focusWorkMinutes = Number(button.dataset.minutes); saveState(); openDialog(focusTimerDialogMarkup()); }
    if (action === 'set-focus-break') { state.settings.focusBreakMinutes = Number(button.dataset.minutes); saveState(); openDialog(focusTimerDialogMarkup()); }
    if (action === 'confirm-start-focus-timer') { closeDialog(); startFocusTimer(state.settings.focusWorkMinutes || 25, state.settings.focusBreakMinutes || 5); }
    if (action === 'focus-timer-toggle') toggleFocusTimer();
    if (action === 'focus-timer-stop') stopFocusTimer();
    if (action === 'start-cram') startCramSession();
    if (action === 'toggle-theme') setThemeMode(state.settings.theme === 'dark' ? 'light' : 'dark');
    if (action === 'set-theme-mode') setThemeMode(button.dataset.mode);
    if (action === 'set-accent-color') { state.settings.accentColor = button.dataset.accent; saveState(); renderRoute(); }
    if (action === 'browse-local-fonts') browseLocalFonts();
    if (action === 'set-app-icon-shape') { metaState.appIconShape = button.dataset.shape; saveMeta(); renderRoute(); }
    if (action === 'set-app-icon-color') { metaState.appIconColor = button.dataset.color; saveMeta(); renderRoute(); }
    if (action === 'set-font-size') { state.settings.fontSize = Number(button.dataset.size); saveState(); renderRoute(); }
    if (action === 'set-corner-style') { state.settings.cornerStyle = button.dataset.corners; saveState(); renderRoute(); }
    if (action === 'set-density') { state.settings.density = button.dataset.density; saveState(); renderRoute(); }
    if (action === 'set-celebration-style') { state.settings.celebrationStyle = button.dataset.style; saveState(); renderRoute(); }
    if (action === 'reset-font-family') { state.settings.fontFamily = ''; saveState(); renderRoute(); toast('Reverted to the default font.'); }
    if (action === 'set-avatar-style') {
      const style = button.dataset.style;
      metaState.avatar = { ...metaState.avatar, type: style, emoji: style === 'emoji' ? button.dataset.emoji : metaState.avatar.emoji };
      saveMeta();
      renderRoute();
    }
    if (action === 'set-avatar-color') { metaState.avatar = { ...metaState.avatar, color: button.dataset.color || '' }; saveMeta(); renderRoute(); }
    if (action === 'choose-avatar-photo') document.getElementById('avatar-photo-input').click();
    if (action === 'remove-avatar-photo') removeAvatarPhoto();
    if (action === 'tag-confidence') tagConfidence(button.dataset.value);
    if (action === 'export-data') exportData();
    if (action === 'export-plan-ics') exportPlanICS();
    if (action === 'export-stats-csv') exportStatsCSV();
    if (action === 'install-app') {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then(choice => {
        deferredInstallPrompt = null;
        if (choice.outcome !== 'accepted') renderRoute();
      });
    }
    if (action === 'save-backup-file') saveBackupToFolder();
    if (action === 'dismiss-backup-reminder') { metaState.backupSnoozeUntil = todayKey(7); saveMeta(); renderRoute(); }
    if (action === 'export-anki') exportAnkiDeck({ core: document.getElementById('flash-core')?.value, domain: document.getElementById('flash-domain')?.value });
    if (action === 'choose-import') document.getElementById('import-file').click();
    if (action === 'confirm-reset') { openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">Reset every progress signal?</h2><p>This removes session history, question mastery, flashcard schedules, settings, and completed labs from your saved progress.</p><div class="button-row"><button class="danger-button" data-action="reset-data">Reset everything</button><button class="secondary" data-action="close-dialog">Cancel</button></div></div>`); }
    if (action === 'reset-data') {
      const previousState = state;
      state = defaultState();
      saveState(); closeDialog(); renderRoute();
      toast('All progress was reset.', 'success', { label: 'Undo', run: () => { state = previousState; saveState(); renderRoute(); } });
    }
    if (action === 'check-for-updates') checkForUpdates();
    if (action === 'open-cert-dialog') openCertDialog();
    if (action === 'open-exam-comparison') openExamComparisonDialog();
    if (action === 'open-custom-card') openCustomCardDialog();
    if (action === 'edit-custom-card') openCustomCardDialog(button.dataset.id);
    if (action === 'delete-custom-card') deleteCustomCard(button.dataset.id);
    if (action === 'open-cert-group') { certDialogGroup = button.dataset.groupId; renderCertDialog(); }
    if (action === 'cert-dialog-back') { certDialogGroup = null; renderCertDialog(); }
    if (action === 'choose-domain') { const entry = firstTrackForDomain(button.dataset.domainId); if (entry) switchCert(entry.id); else closeDialog(); }
    if (action === 'switch-cert') switchCert(button.dataset.certId);
    if (action === 'plan-domain-labs') openDomainLabs(button.dataset.certId, button.dataset.domainId);
    if (action === 'record-exam-result') openExamResultDialog(button.dataset.core);
    if (action === 'clear-exam-result') clearExamResult(button.dataset.core);
    if (action === 'download-pass-card') downloadPassCard(button.dataset.core);
    if (action === 'open-account-dialog') openAccountDialog();
    if (action === 'switch-profile') {
      const id = button.dataset.profileId;
      if (switchPinRequired) { pendingSwitchId = id; renderAccountDialog(); } else switchProfile(id);
    }
    if (action === 'cancel-pin-switch') { pendingSwitchId = null; renderAccountDialog(); }
    if (action === 'manage-pin') { pinManageMode = switchPinRequired ? 'change' : 'set'; renderAccountDialog(); }
    if (action === 'open-remove-pin') { pinManageMode = 'remove'; renderAccountDialog(); }
    if (action === 'delete-profile') {
      const target = profiles.find(p => p.id === button.dataset.profileId);
      openDialog(`<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="del-account-title"><h2 id="del-account-title">Remove ${escapeHtml(target?.name || 'this account')}?</h2><p>It disappears from the switcher, but its saved progress isn't deleted from disk.</p><div class="button-row"><button class="danger-button" data-action="confirm-delete-profile" data-profile-id="${escapeHtml(button.dataset.profileId)}">${icon('trash')} Remove</button><button class="secondary" data-action="reopen-account-dialog">Cancel</button></div></div>`);
    }
    if (action === 'confirm-delete-profile') deleteProfile(button.dataset.profileId);
    if (action === 'reopen-account-dialog') { pinManageMode = null; pendingSwitchId = null; renderAccountDialog(); }
    if (action === 'comprehensive-quiz') startComprehensiveQuiz(button.dataset.certId);
    if (action === 'domain-quiz') startDomainQuiz(button.dataset.certId, button.dataset.domainId);
    if (action === 'add-plan-phase') {
      const certId = document.getElementById('plan-add-cert')?.value;
      const targetDate = document.getElementById('plan-add-date')?.value;
      if (!certId) { toast('Choose a track to add.', 'error'); return; }
      if (!targetDate) { toast('Choose a target completion date.', 'error'); return; }
      const lastDate = planState.phases.length ? planState.phases[planState.phases.length - 1].targetDate : planState.startDate;
      if (targetDate <= lastDate) { toast('Target date must come after the rest of your plan.', 'error'); return; }
      planState = { ...planState, phases: [...planState.phases, { certId, targetDate }] };
      savePlan();
      const entry = CERT_REGISTRY.find(item => item.id === certId);
      toast(`${entry ? entry.label : 'Track'} added to your study plan.`);
      renderRoute();
    }
    if (action === 'remove-plan-phase') {
      const index = Number(button.dataset.phaseIndex);
      const removed = planState.phases[index];
      planState = { ...planState, phases: planState.phases.filter((_, i) => i !== index) };
      savePlan();
      const entry = removed && CERT_REGISTRY.find(item => item.id === removed.certId);
      toast(`${entry ? entry.label : 'Track'} removed from your study plan.`, 'success', removed ? { label: 'Undo', run: () => {
        const phases = [...planState.phases];
        phases.splice(index, 0, removed);
        planState = { ...planState, phases };
        savePlan();
        renderRoute();
      } } : null);
      renderRoute();
    }
    if (action === 'open-palette') openPalette();
    if (action === 'open-shortcuts') openShortcuts();
    if (action === 'open-whats-new') openWhatsNew(true);
    if (action === 'dismiss-whats-new') { markVersionSeen(); closeDialog(); }
    if (action === 'onboard-next') { if (onboardStep === 1) captureOnboardDate(); onboardStep = Math.min(2, onboardStep + 1); renderOnboardingStep(); }
    if (action === 'onboard-skip') finishOnboarding(false);
    if (action === 'onboard-diagnostic') finishOnboarding(true);
    if (action === 'set-exam-date') {
      const value = document.getElementById('settings-exam-date')?.value || '';
      state.examDate = value || null;
      saveState();
      toast(value ? 'Exam date saved.' : 'Exam date cleared.');
      renderRoute();
    }
    if (action === 'replay-onboarding') openOnboarding();
    if (action === 'close-dialog') closeDialog();
  }

  document.addEventListener('click', event => {
    const paletteOpt = event.target.closest('[data-palette-index]');
    if (paletteOpt) { activatePaletteSel(Number(paletteOpt.dataset.paletteIndex)); return; }
    const navToggle = event.target.closest('[data-nav-toggle]');
    if (navToggle) { toggleNavGroup(navToggle.closest('.nav-group').dataset.group); return; }
    const routeButton = event.target.closest('[data-route]');
    if (routeButton) { event.preventDefault(); navigate(routeButton.dataset.route); return; }
    const answer = event.target.closest('[data-answer]');
    if (answer) { chooseAnswer(Number(answer.dataset.answer)); return; }
    const jump = event.target.closest('[data-jump]');
    if (jump && activeSession) { closeDialog(); activeSession.index = Number(jump.dataset.jump); renderQuiz(); return; }
    const rate = event.target.closest('[data-rate]');
    if (rate) { rateFlashcard(rate.dataset.rate); return; }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) handleAction(actionButton.dataset.action, actionButton);
  });

  document.addEventListener('submit', event => {
    event.preventDefault();
    if (event.target.id === 'practice-builder') {
      const core = document.getElementById('practice-core').value; const domain = document.getElementById('practice-domain').value; const count = Number(document.getElementById('practice-length').value); const secondChance = document.getElementById('practice-chance').checked;
      state.settings.secondChance = secondChance; saveState(); startPractice({ core, domain, count, secondChance, mode: domain === 'all' ? 'Custom practice' : `${domainById[domain].name} drill` });
    }
    if (event.target.id === 'flash-builder') {
      startFlashcards({ core: document.getElementById('flash-core').value, domain: document.getElementById('flash-domain').value, count: Number(document.getElementById('flash-count').value), mode: document.getElementById('flash-mode').value });
    }
    if (event.target.id === 'note-form' && noteDialogConcept) {
      const text = document.getElementById('note-text')?.value || '';
      const had = !!getNote(noteDialogConcept);
      setNote(noteDialogConcept, text);
      closeDialog();
      renderRoute();
      toast(text.trim() ? (had ? 'Note updated.' : 'Note saved.') : 'Note deleted.');
    }
    if (event.target.id === 'custom-card-form') saveCustomCard();
    if (event.target.id === 'cloze-check-form') checkClozeAnswers();
    if (event.target.id === 'sandbox-form') sandboxRunCommand();
    if (event.target.id === 'recall-form' && flashSession) {
      const typed = document.getElementById('recall-input').value;
      flashSession.typed = typed;
      flashSession.matchHint = recallMatchHint(typed, flashSession.cards[flashSession.index].definition);
      flashSession.submitted = true;
      renderFlashSession();
    }
    if (event.target.id === 'plan-builder') {
      const startInput = document.getElementById('plan-start').value;
      const targetInputs = planState.phases.map((_, index) => document.getElementById(`plan-target-${index}`).value);
      if (!startInput || targetInputs.some(value => !value)) { toast('Please fill in every date.', 'error'); return; }
      const chronological = [startInput, ...targetInputs].every((date, index, all) => index === 0 || date > all[index - 1]);
      if (!chronological) { toast('Each target date must come after the one before it.', 'error'); return; }
      planState = { ...planState, startDate: startInput, phases: planState.phases.map((phase, index) => ({ ...phase, targetDate: targetInputs[index] })) };
      savePlan();
      toast('Study plan updated.');
      renderRoute();
    }
    if (event.target.id === 'exam-result-form') {
      const coreId = event.target.dataset.core; const core = CERT.cores[coreId];
      const score = Number(document.getElementById('exam-result-score').value);
      const date = document.getElementById('exam-result-date').value;
      if (!core || !score || score < 100 || score > 900 || !date) { toast('Enter a valid score (100–900) and date.', 'error'); return; }
      state.examResults[coreId] = { score, date };
      saveState();
      closeDialog();
      checkMilestones();
      if (score >= core.passingScore) celebrateMilestone(`🎓 ${core.name} result recorded — passed with ${score}/900.`);
      else toast(`${core.name} result saved.`);
      renderRoute();
    }
    if (event.target.id === 'terminal-form' && activeLab) {
      const input = document.getElementById('terminal-command'); const command = input.value.trim(); const step = activeLab.lab.terminal[activeLab.stage];
      activeLab.transcript += `\ntech@study> ${command}\n`;
      if (/^(help|\?)$/i.test(command)) {
        activeLab.transcript += `${terminalCommandHelp(activeLab.lab)}\n`; renderLabWorkbench(); return;
      }
      if (step.accepts.some(answer => answer.toLowerCase() === command.toLowerCase())) {
        activeLab.transcript += `${step.output}\n`; activeLab.stage++;
        if (activeLab.stage >= activeLab.lab.terminal.length) completeLab();
        else { const nextPrompt = activeLab.lab.terminal[activeLab.stage].prompt; activeLab.transcript += `\n${nextPrompt}\n`; activeLab.feedback = ''; announce(`${step.output}. Next: ${nextPrompt}`); renderLabWorkbench(); }
      } else { activeLab.transcript += `Command not accepted for this task. Try again.\n`; activeLab.feedback = step.hint; announce('Command not accepted. Try again.'); renderLabWorkbench(); }
    }
  });

  document.addEventListener('change', event => {
    if (event.target.id === 'practice-core') document.getElementById('practice-domain').innerHTML = domainOptions(event.target.value);
    if (event.target.id === 'flash-core') document.getElementById('flash-domain').innerHTML = domainOptions(event.target.value);
    if (event.target.id === 'setting-second') { state.settings.secondChance = event.target.checked; saveState(); toast('Learning preference saved.'); }
    if (event.target.id === 'setting-sound') { state.settings.soundEffects = event.target.checked; saveState(); if (event.target.checked) playAnswerSound(true); toast('Sound effects ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-focus') { state.settings.focusMode = event.target.checked; saveState(); toast('Focus mode ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-fullscreen-exam') { state.settings.fullscreenExams = event.target.checked; saveState(); toast('Fullscreen exams ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-reading-mode') { state.settings.readingMode = event.target.checked; saveState(); updateChrome(); toast('Reading mode ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-reduced-motion') { state.settings.reducedMotion = event.target.checked; saveState(); updateChrome(); toast('Reduced motion ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-colorblind') { state.settings.colorblindMode = event.target.checked; saveState(); updateChrome(); toast('Colorblind-safe colors ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-high-contrast') { state.settings.highContrast = event.target.checked; saveState(); updateChrome(); toast('High contrast ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-auto-backup') { metaState.autoBackupEnabled = event.target.checked; saveMeta(); toast('Automatic daily backup ' + (event.target.checked ? 'on.' : 'off.')); }
    if (event.target.id === 'setting-notify-reviews') setNotifyReviews(event.target.checked);
    if (event.target.id === 'setting-start-page') { state.settings.startPage = event.target.value; saveState(); toast('Start page saved.'); }
    if (event.target.id === 'setting-show-tip') { state.settings.showTipOfDay = event.target.checked; saveState(); toast('Dashboard preference saved.'); }
    if (event.target.id === 'setting-show-alltracks') { state.settings.showAllTracks = event.target.checked; saveState(); toast('Dashboard preference saved.'); }
    if (event.target.id === 'setting-speech-rate') { state.settings.speechRate = Number(event.target.value); saveState(); toast('Read-aloud speed saved.'); }
    if (event.target.id === 'setting-display-name') { metaState.displayName = event.target.value.trim(); saveMeta(); updateChrome(); toast('Profile updated.'); }
    if (event.target.id === 'setting-font-name') { state.settings.fontFamily = event.target.value.trim(); saveState(); updateChrome(); toast(state.settings.fontFamily ? `Font set to "${state.settings.fontFamily}".` : 'Reverted to the default font.'); }
    if (event.target.id === 'import-file' && event.target.files[0]) importData(event.target.files[0]);
    if (event.target.id === 'avatar-photo-input' && event.target.files[0]) handleAvatarPhotoUpload(event.target.files[0]);
    if (event.target.id === 'glossary-domain') { glossaryDomain = event.target.value; renderGlossaryResults(); }
    if (event.target.id === 'packet-domain') { packetDomain = event.target.value; renderStudyPacket(); }
    if (event.target.id === 'lab-core-filter') { labCoreFilter = event.target.value; renderLabResults(); }
    if (event.target.id === 'browse-domain') { browseDomain = event.target.value; renderBrowseTable(); }
    if (event.target.id === 'browse-status') { browseStatus = event.target.value; renderBrowseTable(); }
    if (event.target.matches('.browse-row-check')) {
      const id = event.target.dataset.concept;
      event.target.checked ? browseSelected.add(id) : browseSelected.delete(id);
      renderBrowseTable();
    }
    if (event.target.matches('.examday-check')) {
      state.examDayChecklist[event.target.dataset.item] = event.target.checked;
      saveState();
      const doneCount = EXAM_DAY_CHECKLIST.filter(item => state.examDayChecklist[item.id]).length;
      const badge = document.getElementById('examday-checklist-count');
      if (badge) { badge.textContent = `${doneCount}/${EXAM_DAY_CHECKLIST.length}`; badge.classList.toggle('teal', doneCount === EXAM_DAY_CHECKLIST.length); }
    }
    if (event.target.id === 'glossary-compact-print') document.body.classList.toggle('print-compact', event.target.checked);
    if (event.target.id === 'cmp-a') { examComparisonState.aId = event.target.value; renderExamComparisonDialog(); }
    if (event.target.id === 'cmp-b') { examComparisonState.bId = event.target.value; renderExamComparisonDialog(); }
    if (event.target.matches('.gui-select') && activeLab) { activeLab.controlState[event.target.dataset.control] = event.target.value; activeLab.results = null; renderLabWorkbench(); hydrateIcons(main); }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'glossary-search') { glossaryQuery = event.target.value; renderGlossaryResults(); }
    if (event.target.id === 'lab-search') { labQuery = event.target.value; renderLabResults(); }
    if (event.target.id === 'command-search') { commandQuery = event.target.value; renderCommandResults(); }
    if (event.target.id === 'global-search-input') { globalSearchQuery = event.target.value; renderGlobalSearchResults(); }
    if (event.target.id === 'browse-search') { browseQuery = event.target.value; renderBrowseTable(); }
    if (event.target.id === 'exam-scratchpad' && activeSession) activeSession.scratchpadText = event.target.value;
    if (event.target.id === 'palette-input') { paletteSel = 0; renderPaletteResults(); }
    if (event.target.id === 'setting-font-name') { const sample = document.getElementById('font-preview-sample'); if (sample) sample.style.fontFamily = buildFontStack(event.target.value); }
    // Deliberately no re-render here (unlike toggle/select) — rebuilding the panel on every
    // keystroke would steal focus from the text field the user is actively typing in.
    if (event.target.matches('.gui-text-input') && activeLab) { activeLab.controlState[event.target.dataset.control] = event.target.value; }
  });

  // Grid cells are plain buttons, not real <input> elements — typing into a crossword is driven
  // entirely by this listener rather than per-cell text fields, which avoids managing focus
  // across dozens of inputs and keeps the grid a simple click-to-select + type-anywhere model.
  function crosswordTypeLetter(letter) {
    const cw = activeCrossword; if (!cw) return;
    const { x, y, dir } = cw.selected;
    if (!cw.layout.solution.has(`${x},${y}`)) return;
    cw.userGrid[`${x},${y}`] = letter; cw.checkedCells = null;
    const entry = crosswordActiveEntry(cw);
    if (entry) {
      const idx = dir === 'across' ? x - entry.x : y - entry.y;
      if (idx < entry.answer.length - 1) cw.selected = dir === 'across' ? { x: x + 1, y, dir } : { x, y: y + 1, dir };
    }
    renderCrosswordPlay(); hydrateIcons(main); checkCrosswordCompletion();
  }

  function crosswordBackspace() {
    const cw = activeCrossword; if (!cw) return;
    const { x, y, dir } = cw.selected;
    cw.checkedCells = null;
    if (cw.userGrid[`${x},${y}`]) {
      cw.userGrid[`${x},${y}`] = '';
    } else {
      const entry = crosswordActiveEntry(cw);
      if (entry) {
        const idx = dir === 'across' ? x - entry.x : y - entry.y;
        if (idx > 0) {
          cw.selected = dir === 'across' ? { x: x - 1, y, dir } : { x, y: y - 1, dir };
          cw.userGrid[`${cw.selected.x},${cw.selected.y}`] = '';
        }
      }
    }
    renderCrosswordPlay(); hydrateIcons(main);
  }

  function crosswordArrowMove(key) {
    const cw = activeCrossword; if (!cw) return;
    let { x, y } = cw.selected;
    if (key === 'ArrowRight') x++; else if (key === 'ArrowLeft') x--; else if (key === 'ArrowDown') y++; else if (key === 'ArrowUp') y--;
    if (!cw.layout.solution.has(`${x},${y}`)) return;
    const dir = (key === 'ArrowLeft' || key === 'ArrowRight') ? 'across' : 'down';
    const cell = cw.layout.cellIndex.get(`${x},${y}`);
    cw.selected = { x, y, dir: cell[dir] != null ? dir : cw.selected.dir };
    renderCrosswordPlay(); hydrateIcons(main);
  }

  function crosswordGoToClue(step) {
    const cw = activeCrossword; if (!cw) return;
    const ordered = crosswordOrderedEntries(cw);
    let idx = ordered.indexOf(crosswordActiveEntry(cw));
    if (idx === -1) idx = 0;
    idx = (idx + step + ordered.length) % ordered.length;
    crosswordSelectEntry(cw, ordered[idx]);
    renderCrosswordPlay(); hydrateIcons(main);
  }

  // ---------- Leader-key navigation (Gmail/Linear-style "g then <letter>") ----------
  // A curated set of the most-used destinations, not literally every route — the command
  // palette ('/' or Ctrl/Cmd+K) already covers everything else. Documented in the Shortcuts
  // dialog (?) rather than shown as an on-screen hint when armed, matching how Gmail/Linear
  // themselves work: a screen-reader announcement covers accessibility, sighted power users are
  // expected to already know the letter from the docs, same as any other muscle-memory shortcut.
  const LEADER_KEYMAP = {
    d: 'dashboard', p: 'practice', e: 'exams', f: 'flashcards', l: 'labs', t: 'casestudies', x: 'sandbox',
    c: 'crossword', k: 'cloze', b: 'browse', g: 'glossary', s: 'guide', n: 'notes',
    h: 'history', m: 'objectives', a: 'achievements'
  };
  let leaderArmed = false;
  let leaderTimeoutHandle = null;
  function disarmLeader() { leaderArmed = false; if (leaderTimeoutHandle) { clearTimeout(leaderTimeoutHandle); leaderTimeoutHandle = null; } }
  function armLeader() {
    leaderArmed = true;
    announce('Jump to mode. Press a letter for a page, or Escape to cancel.');
    clearTimeout(leaderTimeoutHandle);
    leaderTimeoutHandle = setTimeout(disarmLeader, 1500);
  }

  document.addEventListener('keydown', event => {
    const typing = isTypingTarget(document.activeElement);
    const paletteOpen = !!dialogLayer.querySelector('.palette');

    // Terminal sandbox: Up/Down recalls previous commands, same as a real shell history.
    if (event.target.id === 'sandbox-command' && sandboxSession && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const history = sandboxSession.history;
      if (!history.length) return;
      sandboxSession.historyIndex = Math.max(0, Math.min(history.length, sandboxSession.historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
      event.target.value = history[sandboxSession.historyIndex] || '';
      requestAnimationFrame(() => event.target.setSelectionRange(event.target.value.length, event.target.value.length));
      return;
    }

    // Command palette: Ctrl/Cmd+K toggles it from anywhere; while open, arrows + Enter drive it.
    if ((event.key === 'k' || event.key === 'K') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      paletteOpen ? closeDialog() : openPalette();
      return;
    }
    if (paletteOpen) {
      if (event.key === 'ArrowDown') { event.preventDefault(); movePaletteSel(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); movePaletteSel(-1); }
      else if (event.key === 'Enter') { event.preventDefault(); activatePaletteSel(); }
      else if (event.key === 'Escape') { event.preventDefault(); closeDialog(); }
      return;
    }
    if (event.key === 'Escape' && dialogLayer.innerHTML) { closeDialog(); return; }
    // Any other open dialog swallows the app-level shortcuts (its own Tab-trap still runs).
    if (dialogLayer.innerHTML) return;

    // Letter keys mean something else entirely during an active quiz (f = flag) or a live
    // crossword (every letter fills the grid) — the leader key stays off in both so "g" never
    // steals a keystroke those modes actually need.
    const blockLeaderKey = !!activeSession || (activeCrossword && !activeCrossword.complete && currentRoute() === 'crossword');
    if (!typing && !blockLeaderKey) {
      if (leaderArmed) {
        disarmLeader();
        if (event.key === 'Escape') { event.preventDefault(); return; }
        const route = !event.ctrlKey && !event.altKey && !event.metaKey ? LEADER_KEYMAP[event.key.toLowerCase()] : null;
        if (route) { event.preventDefault(); navigate(route); return; }
        // No match — silently drop back to normal handling for this same keystroke below.
      } else if (event.key === 'g' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        armLeader();
        return;
      }
    }

    if (!typing && event.key === '/') { event.preventDefault(); openPalette(); return; }
    if (!typing && event.key === '?') { event.preventDefault(); openShortcuts(); return; }

    // Read-aloud: spacebar pauses/resumes without reaching for the mouse — mirrors the
    // flash-card Space handler below, gated the same way (not while typing anywhere else).
    if (!typing && event.code === 'Space' && speakingDomain) { event.preventDefault(); toggleGuideSpeechPause(); return; }

    // 1-4: answer a quiz question, or (once revealed) rate the current flashcard.
    if (['1', '2', '3', '4'].includes(event.key) && !event.ctrlKey && !event.altKey && !event.metaKey && !typing) {
      if (activeSession) { chooseAnswer(Number(event.key) - 1); return; }
      if (flashSession && (flashSession.flipped || flashSession.submitted)) { rateFlashcard(['again', 'hard', 'good', 'easy'][Number(event.key) - 1]); return; }
    }
    if ((event.code === 'Space' || event.key === 'Enter') && document.activeElement?.classList.contains('flash-card')) { event.preventDefault(); flashSession.flipped = !flashSession.flipped; renderFlashSession(); return; }

    // Quiz: N / → advance, F flag.
    if (activeSession && !typing) {
      if (event.key === 'n' || event.key === 'N' || event.key === 'ArrowRight') { event.preventDefault(); nextQuestion(); return; }
      if (event.key === 'f' || event.key === 'F') { event.preventDefault(); handleAction('flag-question', null); return; }
    }

    if (activeCrossword && !activeCrossword.complete && currentRoute() === 'crossword' && !typing) {
      // Grid cells aren't focusable elements, so letters / backspace / arrows drive the
      // selection directly. Tab is deliberately NOT captured — hijacking it route-wide is a
      // keyboard trap (WCAG 2.1.2); the on-screen "Previous/Next clue" buttons plus arrow-key
      // movement between cells already give full keyboard access to every clue.
      if (/^[a-zA-Z]$/.test(event.key)) { event.preventDefault(); crosswordTypeLetter(event.key.toUpperCase()); }
      else if (event.key === 'Backspace') { event.preventDefault(); crosswordBackspace(); }
      else if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); crosswordArrowMove(event.key); }
      else if (event.key === '[') { event.preventDefault(); crosswordGoToClue(-1); }
      else if (event.key === ']') { event.preventDefault(); crosswordGoToClue(1); }
    }
  });

  window.addEventListener('resize', () => { if (activeCrossword && currentRoute() === 'crossword') fitCrosswordGrid(); });

  // Chromium-only (Firefox/Safari never fire this — they have their own native "Add to Home
  // Screen"/"Add to Dock" affordance instead, outside any page's control). preventDefault()
  // suppresses the browser's own mini-infobar so the Settings button is the one true trigger;
  // the deferred event is only usable once, so it's discarded after prompt() resolves either way.
  let deferredInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (currentRoute() === 'settings') renderRoute();
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    toast('Cert Study installed.');
    if (currentRoute() === 'settings') renderRoute();
  });

  // renderRoute() (not just saveState()) matters here: CSS custom-property-driven styling
  // recascades live on the data-theme attribute change alone, but a few things (domainAccentColor's
  // inline color, computed from state.settings.theme at render time) are baked into the HTML at
  // render time and would otherwise stay stale — showing the previous theme's color — until the
  // next unrelated re-render. The Settings-page equivalent action already re-renders; match it here.
  document.getElementById('theme-toggle').addEventListener('click', () => setThemeMode(state.settings.theme === 'dark' ? 'light' : 'dark'));
  // Live-follow the OS/browser theme while in 'auto' mode — checked at fire time, not
  // registration time, so this one listener (set up once) still reflects whichever track is
  // currently active if the system theme changes mid-session.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.themeMode === 'auto') { state.settings.theme = resolveTheme('auto'); saveState(); renderRoute(); }
  });
  document.getElementById('cert-button').addEventListener('click', openCertDialog);
  document.getElementById('brand-switch').addEventListener('click', openDomainDialog);
  document.getElementById('mobile-menu').addEventListener('click', () => { document.getElementById('sidebar').classList.add('open'); document.getElementById('mobile-backdrop').classList.add('open'); });
  document.getElementById('mobile-backdrop').addEventListener('click', closeMobileNav);
  window.addEventListener('hashchange', renderRoute);
  // A page-triggered Notification only fires while this tab is open — catching the moment
  // someone actually returns to it is what makes the daily reminder check meaningful at all,
  // not just the boot-time check above (which only fires once, whenever the tab first loaded).
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkDueReviewNotification(); });
  window.addEventListener('beforeunload', event => { if (activeSession && activeSession.source === 'exams') { event.preventDefault(); event.returnValue = ''; } });

  // Manual "check for updates" — forces the browser to re-fetch service-worker.js right now
  // instead of waiting for its own periodic check. If the fetched file actually changed, this
  // triggers the exact same install→activate→skipWaiting→clients.claim→controllerchange chain
  // already wired up below, which independently shows the "A new version is ready" reload toast —
  // this function only needs to kick that off, not duplicate it.
  async function checkForUpdates() {
    if (!('serviceWorker' in navigator)) { location.reload(); return; }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) { location.reload(); return; }
      await reg.update();
      toast(`Checked — you're on ${APP_VERSION}. A "Reload" prompt appears here automatically if a newer version was found.`);
    } catch {
      toast('Could not check for updates right now.', 'error');
    }
  }

  (async function main() {
    // Resolves which account's data every /api/progress, /api/avatar, and /api/app-icon.svg
    // call this boot makes will read/write — must happen before initState(), which is the
    // first of those calls.
    await fetchProfiles();
    let storedCert = null;
    try { storedCert = localStorage.getItem(ACTIVE_CERT_KEY); } catch {}
    loadCertData(CERT_REGISTRY.some(item => item.id === storedCert) ? storedCert : CERT_REGISTRY[0].id);
    await initState();
    checkAutoBackup();
    checkDueReviewNotification();
    updateCertChrome();
    hydrateIcons(); updateChrome();
    if (!location.hash) history.replaceState(null, '', `#${state.settings.startPage || 'dashboard'}`);
    renderRoute();

    // First-run walkthrough (only for a genuinely empty install) takes priority; everyone
    // else gets the "What's new" panel once per release.
    if (currentDomain() === 'certs' && !state.onboardedAt && !hasAnyProgress()) {
      openOnboarding();
    } else if (metaState.seenVersion === null) {
      if (hasAnyProgress()) openWhatsNew(true);
      markVersionSeen();
    } else if (metaState.seenVersion !== APP_VERSION) {
      openWhatsNew(true);
    }

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      const hadController = !!navigator.serviceWorker.controller;
      let reloading = false;
      // skipWaiting + clients.claim swap the new service worker in immediately, but the
      // page's already-parsed HTML/JS is still the old build until a reload — so tell the
      // user rather than leaving them on a half-updated app.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading || !hadController) return;
        toast('A new version is ready.', 'success', { label: 'Reload', run: () => { reloading = true; location.reload(); } });
      });
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  })();
})();
