"""Core 2, domain 4 (Operational Procedures): new objectives 4.8 (scripting), 4.9 (remote access), and 4.10 (AI)."""
import svg as S


def build(b):
    b.objective('4.8', 'Scripting languages and risks', ['Batch files', 'PowerShell', 'Shell scripts', 'Python', 'Script risks'])
    b.objective('4.9', 'Remote access technologies', ['RDP', 'SSH', 'VNC', 'RMM', 'Quick Assist'])
    b.objective('4.10', 'AI limitations and policy', ['Hallucinations', 'Bias', 'Private vs public AI', 'Use policy', 'Plagiarism'])

    # ------------------------------------------------------------------------------------------ 4.8 Scripting
    b.add('4.8', 'Batch file (.bat)',
          'A script of Windows command-prompt commands run by cmd.exe, often used for simple tasks such as mapping drives, copying files, and launching programs at logon.',
          'write a simple Windows script that maps network drives and copies a folder at logon',
          ['A PowerShell script (.ps1)', 'A shell script (.sh)', 'A JavaScript file (.js)'],
          '.bat is the old-school cmd.exe format — .ps1 is PowerShell and .sh is for Linux and macOS shells.',
          S.terminal(['@echo off', r'net use Z: \\fs01\dept', r'robocopy C:\Docs Z:\Backup /E', 'echo Done'], title='backup.bat'),
          caption='A batch file runs a series of command-prompt commands, often for simple Windows automation.')

    b.add('4.8', 'PowerShell script (.ps1)',
          'A script in Microsoft\'s object-based shell language, used to automate Windows administration such as managing users, services, and the registry; execution is governed by the script execution policy.',
          'automate creating 50 user accounts and setting their group memberships on Windows',
          ['A batch file (.bat)', 'A shell script (.sh)', 'A VBScript (.vbs)'],
          '.ps1 is PowerShell — richer than a batch file because it works with objects, not just text.',
          S.terminal(['Get-Service -Name Spooler | Restart-Service', 'Get-LocalUser | Where-Object Enabled', "New-LocalUser -Name 'jsmith' -NoPassword"], title='PowerShell'),
          caption='PowerShell scripts automate Windows administration with an object-based command language.')

    b.add('4.8', 'Shell script (.sh)',
          'A script of commands run by a Unix shell such as Bash on Linux and macOS, used for tasks like backups, log processing, and scheduled maintenance, often started by cron.',
          'automate a nightly backup and log cleanup on a Linux server',
          ['A batch file (.bat)', 'A PowerShell script (.ps1)', 'A JavaScript file (.js)'],
          '.sh runs in Bash on Linux and macOS — .bat and .ps1 are Windows formats.',
          S.terminal(['#!/bin/bash', 'tar czf /backup/site.tgz /var/www', 'find /backup -mtime +14 -delete'], title='backup.sh'),
          caption='Shell scripts automate Linux and macOS tasks such as backups and cleanup.')

    b.add('4.8', 'Python script (.py)',
          'A script in the cross-platform Python language, popular for automation, data gathering, and APIs because it is readable and runs on Windows, macOS, and Linux.',
          'write one automation script that gathers system information and runs unchanged on Windows, macOS, and Linux',
          ['A batch file (.bat)', 'A shell script (.sh)', 'A VBScript (.vbs)'],
          '.py is CROSS-PLATFORM — batch files and shell scripts are tied to one OS family.',
          S.terminal(['import platform, shutil', 'print(platform.system())', 'print(shutil.disk_usage("/").free)'], title='check.py'),
          caption='Python scripts are readable and run on Windows, macOS, and Linux alike.')

    b.add('4.8', 'VBScript and JavaScript (.vbs, .js)',
          'VBScript (.vbs) is a legacy Windows scripting language run by Windows Script Host, while JavaScript (.js) runs in web browsers and, with Node.js, on servers; both are common vectors for malicious scripts.',
          'identify the file extensions for a legacy Windows scripting file and a browser-based web script',
          ['.bat and .ps1', '.sh and .py', '.cmd and .reg'],
          'VBScript is legacy WINDOWS scripting and JavaScript is the WEB language — both are also abused by malware.',
          S.table(['Extension', 'Language', 'Typically runs on'], [('.bat', 'batch', 'Windows cmd'), ('.ps1', 'PowerShell', 'Windows'), ('.vbs', 'VBScript', 'Windows'), ('.sh', 'shell', 'Linux, macOS'), ('.js', 'JavaScript', 'browser, Node.js'), ('.py', 'Python', 'any OS')],
                  title='Script file extensions', col_widths=[0.25, 0.3, 0.45]),
          caption='VBScript and JavaScript are common script types; know which extension maps to which language.')

    b.add('4.8', 'Script risks and precautions',
          'Running an untrusted or untested script can introduce malware, change system settings unintentionally, or crash a system by mishandling resources, so scripts should be reviewed, tested in a sandbox, and run with least privilege.',
          'reduce the risk of running a script downloaded from a forum on a production workstation',
          ['Running it as administrator immediately', 'Disabling antivirus first', 'Skipping review because it is popular'],
          'Read it and TEST it in a sandbox first — an unreviewed script has the same power as malware.',
          S.steps([('Review the code', 'what does it do?'), ('Test in a sandbox', 'not production'), ('Run least privilege', 'log what changed')], title='Running a script safely', tones=['blue', 'amber', 'green']),
          caption='Review and sandbox-test scripts, and run them with least privilege, to avoid damage or malware.')

    # ------------------------------------------------------------------------------------------ 4.9 Remote access
    b.add('4.9', 'Remote Desktop Protocol (RDP)',
          'Microsoft\'s protocol (TCP 3389) for a graphical remote session to a Windows PC; the host must run Pro or higher with remote connections allowed, ideally with Network Level Authentication, and it should not be exposed directly to the Internet.',
          'connect to a Windows PC\'s desktop remotely from another Windows computer on the company network',
          ['SSH', 'VNC', 'Telnet'],
          'Graphical Windows sessions on TCP 3389 — SSH gives a secure text-mode session, typically on TCP 22.',
          S.facts([('Port', 'TCP 3389'), ('Host', 'Windows Pro or higher'), ('Client', 'mstsc.exe (Remote Desktop)'), ('Secure it', 'NLA plus VPN, not exposed')], title='Remote Desktop'),
          caption='RDP gives a graphical remote session to Windows over TCP 3389; keep it behind a VPN.')

    b.add('4.9', 'SSH (Secure Shell)',
          'A protocol (TCP 22) providing encrypted remote command-line access and file transfer (SCP and SFTP) to Linux servers and network devices, often with key-based authentication, replacing the clear-text Telnet.',
          'securely administer a Linux server from the command line across the Internet',
          ['Telnet', 'RDP', 'FTP'],
          'ENCRYPTED text-mode access — Telnet sends everything, passwords included, in clear text.',
          S.compare(('SSH', ['TCP port 22', 'Encrypted session', 'Passwords or keys']), ('Telnet', ['TCP port 23', 'Clear text', 'Obsolete for admin work']), title='SSH vs Telnet', tones=('green', 'red')),
          caption='SSH provides encrypted command-line access and file transfer, replacing clear-text Telnet.')

    b.add('4.9', 'VNC (Virtual Network Computing)',
          'A cross-platform remote desktop system that shares a screen between Windows, macOS, and Linux, commonly on TCP 5900; its built-in security is weak, so it should be tunneled through SSH or a VPN.',
          'view and control a Linux desktop from a Windows PC using a cross-platform remote desktop tool',
          ['RDP', 'SSH', 'Telnet'],
          'CROSS-PLATFORM screen sharing — RDP is Microsoft\'s, and VNC should be tunneled for security.',
          S.facts([('Platforms', 'Windows, macOS, Linux'), ('Typical port', 'TCP 5900'), ('Weakness', 'weak native encryption'), ('Fix', 'tunnel through SSH or VPN')], title='VNC'),
          caption='VNC shares a desktop across operating systems but needs tunneling for security.')

    b.add('4.9', 'RMM (remote monitoring and management)',
          'A platform in which an agent installed on each endpoint lets IT teams and managed service providers monitor, patch, run scripts on, and remotely control many computers from one console.',
          'monitor, patch, and remotely support hundreds of client computers from a single console',
          ['Quick Assist', 'Remote Desktop to each PC', 'SSH to each PC'],
          'An AGENT on every endpoint managed from one console — Quick Assist is a one-off session.',
          S.hub(('RMM console', 'one view of every endpoint'), [('Monitoring', 'alerts and health'), ('Patching', 'updates at scale'), ('Scripting', 'run tasks remotely'), ('Remote control', 'fix problems')]),
          caption='RMM tools use an installed agent so IT can monitor, patch, and control many endpoints centrally.')

    b.add('4.9', 'Quick Assist',
          'A built-in Windows tool in which a user shares a one-time code so a helper can view or control the screen for a support session, with the user\'s consent and no permanent software.',
          'help a user remotely, at their request, with a one-time code and no permanent software installed',
          ['An RMM agent', 'Remote Desktop', 'A VPN'],
          'The USER grants one-time access with a code — RMM and RDP assume standing access.',
          S.steps([('User opens it', 'and gets a code'), ('Helper enters code', 'requests control'), ('User approves', 'session starts')], title='Quick Assist', tones=['plain', 'blue', 'green']),
          caption='Quick Assist lets a user grant a helper temporary, consent-based access with a one-time code.')

    b.add('4.9', 'Securing remote access',
          'Remote tools should require multifactor authentication, run through a VPN or gateway, use least privilege, log sessions, require user consent where appropriate, and be disabled when not needed.',
          'reduce the risk from remote support tools used by technicians and outside vendors',
          ['Exposing RDP directly to the Internet', 'Sharing one admin password', 'Turning off session logging'],
          'MFA plus VPN plus logging plus least privilege — and never put RDP directly on the Internet.',
          S.facts([('Authenticate', 'MFA, not just a password'), ('Connect', 'through a VPN or gateway'), ('Limit', 'least privilege and time-boxed'), ('Record', 'log and audit sessions')], title='Remote access hygiene'),
          caption='Secure remote access with MFA, a VPN, least privilege, and logged sessions.')

    # ------------------------------------------------------------------------------------------ 4.10 AI
    b.add('4.10', 'AI hallucination',
          'Generative AI can state false information with confidence, such as invented commands, settings, or sources, because it predicts plausible text rather than looking up facts; output should be verified against trusted documentation.',
          'explain why an AI assistant gave a convincing but non-existent PowerShell command',
          ['Training data bias', 'A network outage', 'A prompt that was too short'],
          'Confident but FABRICATED output — always verify against official documentation.',
          S.steps([('You ask', 'a how-to question'), ('Model predicts', 'plausible text'), ('You verify', 'against official docs')], title='AI hallucination', tones=['plain', 'amber', 'green']),
          caption='AI can produce confident, plausible, but false answers, so output must be verified.')

    b.add('4.10', 'AI bias',
          'AI models reflect biases in their training data and can produce skewed or unfair results, so decisions that affect people need human review and attention to data sources.',
          'explain why an AI screening tool consistently ranks candidates from one group lower than others',
          ['AI hallucination', 'Data exfiltration', 'A slow model response'],
          'Skew from the training DATA — hallucination is invented facts, while bias is an unfair pattern.',
          S.compare(('Hallucination', ['Invents facts', 'Wrong but confident', 'Verify against sources']), ('Bias', ['Reflects skewed data', 'Systematically unfair', 'Needs human review']), title='Two different AI limits', tones=('amber', 'blue')),
          caption='AI bias comes from skewed training data and produces systematically unfair outputs.')

    b.add('4.10', 'Private (enterprise) AI',
          'An AI service hosted or contracted by the organization with controls over data retention and training, unlike public chatbots that may retain or learn from prompts; sensitive data belongs only in the private option.',
          'choose where it is acceptable to paste internal customer data for AI-assisted analysis',
          ['A free public AI chatbot', 'A personal AI account', 'A browser AI extension'],
          'Public tools may keep or learn from your prompts — sensitive data stays in a PRIVATE, governed service.',
          S.compare(('Public AI', ['Prompts may be retained', 'May train future models', 'No sensitive data']), ('Private AI', ['Company-controlled', 'Retention terms agreed', 'Sensitive data allowed by policy']), title='Where data may go', tones=('red', 'green')),
          caption='Public AI may keep or learn from prompts; sensitive data belongs only in a governed private service.')

    b.add('4.10', 'AI use policy',
          'A company policy stating which AI tools are approved, what data may or may not be entered into them, and what review is required before AI-generated content is used.',
          'tell employees which AI tools are approved and which company data must never be pasted into them',
          ['A service level agreement', 'A backup policy', 'A change request'],
          'It names WHICH tools and WHICH data — the policy turns "be careful" into rules.',
          S.facts([('Approved tools', 'the list employees may use'), ('Data limits', 'what must never be entered'), ('Review', 'humans verify the output'), ('Disclosure', 'when AI use must be stated')], title='An AI use policy'),
          caption='An AI use policy sets approved tools, data limits, and review requirements.')

    b.add('4.10', 'AI plagiarism and copyright risk',
          'AI output can reproduce existing copyrighted or published text, so using it without checking sources or attributing it risks plagiarism and licensing problems.',
          'explain the risk of publishing AI-generated documentation without checking whether it copies existing copyrighted text',
          ['AI hallucination', 'AI bias', 'Data retention'],
          'The risk is COPIED material — check sources and attribution before publishing AI output.',
          S.steps([('AI generates', 'text and images'), ('May echo sources', 'copyrighted material'), ('Check and attribute', 'before publishing')], title='Plagiarism risk', tones=['plain', 'amber', 'green']),
          caption='AI-generated content can echo copyrighted work, so check and attribute before publishing.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Scripting languages and risks', ['4.8'],
              'Match the extension to the language and platform: .bat is a Windows batch file run by cmd.exe, .ps1 is PowerShell (Windows administration, governed by the execution policy), .vbs is legacy Windows scripting, .sh is a Bash or shell script for Linux and macOS, .js is JavaScript for browsers and Node.js, and .py is cross-platform Python.\n\n'
              'Scripts are powerful, which is also the risk: an untrusted or untested script can introduce malware, change settings unintentionally, or crash a system. Review the code, test it in a sandbox, and run it with least privilege.')
    b.section('Remote access technologies', ['4.9'],
              'RDP provides graphical Windows sessions over TCP 3389 (Pro or higher on the host), SSH provides encrypted command-line access and file transfer over TCP 22 and replaces clear-text Telnet, and VNC shares a desktop across operating systems but should be tunneled because its native encryption is weak. Quick Assist is a consent-based, one-time-code session, while an RMM platform installs an agent on every endpoint so IT can monitor, patch, script, and control many devices from one console.\n\n'
              'Whatever the tool, secure it: require MFA, connect through a VPN or gateway, use least privilege, log sessions, and never expose RDP directly to the Internet.')
    b.section('AI limitations, policy, and data', ['4.10'],
              'Generative AI can hallucinate (state invented facts confidently), reflect bias from its training data, and echo copyrighted material, so output is a draft to verify and attribute rather than an authority. Hallucination and bias are different problems: one is made-up information and the other is a systematic unfairness.\n\n'
              'Data handling matters most in practice: public AI services may retain or learn from prompts, so sensitive data belongs only in a private, governed service, and an AI use policy spells out which tools are approved, what data must never be entered, and what review is required.')
