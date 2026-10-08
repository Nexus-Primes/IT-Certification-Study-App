"""AZ-802, domain ws6 (Secure Windows Server infrastructure): the operating system and AD DS."""
import svg as S

DOMAIN = 'ws6'


def build(b):
    b.topics['6.1'] = ['Exploit protection XML', 'App Control audit and supplemental policies', 'AppLocker', 'VBS and HVCI', 'Remote Credential Guard', 'OSConfig drift control', 'LAPS retrieval', 'Defender plans', 'Firewall profiles', 'Domain isolation']
    b.topics['6.2'] = ['Fine-grained password policies', 'Lockout', 'Tiered administration and PAWs', 'Authentication policy silos', 'AdminSDHolder', 'NTLM, Kerberos, LDAP hardening', 'Time-based membership', 'Auditing']

    # ------------------------------------------------------------------------------------------ 6.1
    b.add('6.1', 'Exploit protection XML deployment',
          'Exploit protection settings, such as DEP, ASLR, and Control Flow Guard, can be exported to an XML file with Get-ProcessMitigation or the Windows Security app and then applied to many servers through Group Policy or Set-ProcessMitigation.',
          'apply the same memory-corruption mitigations to every server through policy instead of configuring each by hand',
          ['Attack surface reduction rules', 'App Control audit mode', 'Microsoft Defender SmartScreen'],
          'Export the settings to XML ONCE, then deploy that file with Group Policy.',
          S.steps([('Tune on one server', 'system and per-app'), ('Export to XML', 'settings file'), ('Deploy with GPO', 'common settings path')], title='Exploit protection deployment', tones=['blue', 'plain', 'green']),
          caption='Exploit protection settings are exported to XML and distributed with Group Policy.')

    b.add('6.1', 'App Control audit mode',
          'Running an App Control for Windows policy in audit mode so applications that would be blocked are only logged, letting administrators refine the allow-list before switching to enforced mode.',
          'test a new allow-list policy by logging what it would block without actually blocking anything',
          ['Supplemental application control policies', 'AppLocker', 'Exploit protection XML deployment'],
          'AUDIT logs would-be blocks; ENFORCED blocks them — always audit first.',
          S.steps([('Deploy in audit mode', 'nothing blocked'), ('Review events', 'would-be blocks'), ('Switch to enforced', 'after refining the policy')], title='Rolling out App Control', tones=['blue', 'amber', 'green']),
          caption='Audit mode logs what an application control policy would block before enforcement.')

    b.add('6.1', 'Supplemental application control policies',
          'Additional App Control for Windows policies that extend a base policy for specific devices or roles, so extra applications can be allowed without editing the base allow-list.',
          'allow one more application on a single group of servers without changing the shared base allow-list',
          ['App Control audit mode', 'AppLocker', 'Exploit protection XML deployment'],
          'EXTENDS a base policy — add an exception without touching the base.',
          S.hub(('Base policy',), [('Supplemental A', 'finance servers'), ('Supplemental B', 'build servers')], title='Base and supplemental policies'),
          caption='Supplemental policies extend a base App Control policy for specific devices.')

    b.add('6.1', 'AppLocker',
          'A rule-based feature that allows or blocks executables, scripts, installers, DLLs, and packaged apps by path, publisher, or hash, and can target specific users or groups; it works in user mode only and is a complement to App Control for Windows.',
          'restrict which applications a specific user group may run by using publisher rules',
          ['App Control audit mode', 'Supplemental application control policies', 'Microsoft Defender SmartScreen'],
          'Rules can target USERS and GROUPS — App Control for Windows applies to the whole device.',
          S.compare(('AppLocker', ['Per user or group rules', 'Path, publisher, hash', 'User mode only']), ('App Control (WDAC)', ['Whole-device policy', 'Kernel and user mode', 'Stronger protection']), title='AppLocker vs. App Control'),
          caption='AppLocker rules can target users and groups; App Control applies device-wide.')

    b.add('6.1', 'Virtualization-based security (VBS)',
          'A hardware-backed isolation layer that uses the hypervisor to create a protected region of memory the operating system kernel cannot reach, hosting protections such as Credential Guard and memory integrity.',
          'isolate secrets in a hypervisor-protected area of memory that even the kernel cannot read',
          ['Secure Boot for Generation 2 VMs', 'BitLocker Drive Encryption', 'Windows Defender Application Control'],
          'The ISOLATION layer — Credential Guard and memory integrity run on top of it.',
          S.layers([('Credential Guard', 'protects secrets', 'green'), ('Memory integrity', 'checks drivers', 'blue'), ('VBS', 'hypervisor isolation', 'primary'), ('Hardware', 'virtualization, TPM, UEFI', 'plain')], title='What builds on VBS'),
          caption='VBS uses the hypervisor to isolate memory and underpins Credential Guard and memory integrity.')

    b.add('6.1', 'Memory integrity (HVCI)',
          'Hypervisor-protected code integrity, which runs the code integrity checks in the isolated environment so only validly signed drivers load into the kernel and malicious code cannot tamper with them.',
          'stop malicious or vulnerable drivers from loading into the kernel by running validation in an isolated environment',
          ['Credential Guard', 'Exploit protection', 'Microsoft Defender SmartScreen'],
          'Protects the KERNEL from bad drivers — it relies on VBS.',
          S.steps([('Driver loads', 'kernel request'), ('Isolated check', 'signature and policy'), ('Allowed or blocked', 'tampering prevented')], title='Memory integrity', tones=['plain', 'blue', 'green']),
          caption='Memory integrity validates kernel code in an isolated environment before it loads.')

    b.add('6.1', 'Remote Credential Guard',
          'A Remote Desktop option that redirects Kerberos requests back to the client, so the user\'s credentials are never sent to or stored on the remote server, protecting against credential theft on a compromised host.',
          'sign in to a remote server over Remote Desktop without leaving reusable credentials on it',
          ['Credential Guard', 'Network Level Authentication (NLA)', 'CredSSP'],
          'Credentials STAY on the client — tickets are requested back through the RDP connection.',
          S.steps([('Admin starts RDP', 'mstsc /remoteGuard'), ('Server needs a ticket', 'sends request back'), ('Client supplies it', 'no credentials sent')], title='Remote Credential Guard', tones=['plain', 'blue', 'green']),
          caption='Remote Credential Guard keeps credentials on the client and redirects Kerberos requests to it.')

    b.add('6.1', 'OSConfig drift control',
          'A Windows Server 2025 OSConfig feature that keeps a security baseline in force by checking its settings regularly and restoring any that changed, so the configuration cannot silently drift from the baseline.',
          'automatically restore a security setting when someone changes it away from the approved baseline',
          ['Group Policy refresh', 'Azure Policy for Arc-enabled servers', 'Windows LAPS (Local Administrator Password Solution)'],
          'Re-APPLIES the baseline when a setting drifts — set and forget.',
          S.steps([('Baseline applied', 'member server'), ('Setting changed', 'drift detected'), ('Value restored', 'baseline enforced')], title='Drift control', tones=['green', 'amber', 'green']),
          caption='OSConfig drift control restores baseline settings that have been changed.')

    b.add('6.1', 'Security Compliance Toolkit',
          'A Microsoft download with recommended security baseline GPOs and tools such as Policy Analyzer to compare current policy settings against a baseline, and LGPO to apply local policy.',
          'compare the policies currently applied in a domain against Microsoft\'s recommended baseline settings',
          ['Windows Server security baseline via OSConfig', 'Group Policy Modeling', 'Group Policy Results'],
          'POLICY ANALYZER compares your GPOs with the baseline GPOs.',
          S.hub(('Security Compliance Toolkit',), [('Baseline GPOs', 'recommended'), ('Policy Analyzer', 'compare settings'), ('LGPO', 'apply locally')], title='Toolkit contents'),
          caption='The Security Compliance Toolkit provides baseline GPOs and tools to compare and apply them.')

    b.add('6.1', 'Retrieving a LAPS password',
          'An authorized administrator reads the current managed local administrator password from AD with Get-LapsADPassword (or from Microsoft Entra ID), and the password is rotated on its schedule or after use.',
          'look up the current local administrator password of a server from the directory',
          ['BitLocker recovery key backup to AD DS', 'KDS root key', 'Resetting passwords cached on a stolen RODC'],
          'Get-LapsADPassword reads it — and only authorized groups may.',
          S.terminal(['Get-LapsADPassword -Identity SRV01 -AsPlainText', 'ComputerName       : SRV01', 'Account            : Administrator', 'PasswordExpiration : 2026-11-02 08:14'], title='Windows PowerShell'),
          caption='Get-LapsADPassword retrieves the current managed local administrator password.')

    b.add('6.1', 'LAPS post-authentication actions',
          'A Windows LAPS policy that, after the managed account is used and a grace period passes, resets the password and can also log off the session or reboot the machine, so an exposed password is quickly replaced.',
          'make the managed local administrator password change shortly after someone has used it to sign in',
          ['Retrieving a LAPS password', 'OSConfig drift control', 'Protected Users group'],
          'RESET after use — the action can also sign out or reboot the machine.',
          S.steps([('Admin uses password', 'signs in'), ('Grace period ends', 'for example 24 hours'), ('Password reset', 'optional logoff or reboot')], title='Post-authentication action', tones=['plain', 'amber', 'green']),
          caption='LAPS post-authentication actions reset the password after it has been used.')

    b.add('6.1', 'Defender for Servers plans',
          'Plan 1 provides Microsoft Defender for Endpoint protection on servers at a lower, per-hour price, while Plan 2 adds capabilities such as just-in-time VM access and file integrity monitoring.',
          'choose the server protection plan that adds just-in-time access and file integrity monitoring',
          ['Defender for Cloud free tier', 'Azure Policy for Arc-enabled servers', 'Windows Defender Application Control'],
          'PLAN 2 adds JIT access and file integrity monitoring on top of Plan 1.',
          S.table(['Plan', 'Adds'], [('Plan 1', 'Defender for Endpoint'), ('Plan 2', 'JIT access, file integrity')], title='Defender for Servers', col_widths=[0.3, 0.7]),
          caption='Defender for Servers Plan 2 adds capabilities such as JIT access and file integrity monitoring.')

    b.add('6.1', 'Windows Firewall profiles',
          'Windows Firewall keeps separate rule sets for the Domain, Private, and Public profiles and applies the one matching the network location, so a laptop can be stricter on a public network than on the corporate network.',
          'apply stricter inbound rules when a laptop is on an untrusted network than when it is on the corporate network',
          ['Domain isolation', 'Windows Firewall and connection security rules', 'Network security groups (NSGs)'],
          'The profile follows the NETWORK — Domain, Private, or Public.',
          S.table(['Profile', 'Used on'], [('Domain', 'a network with a DC'), ('Private', 'trusted home or work'), ('Public', 'untrusted networks')], title='Firewall profiles', col_widths=[0.3, 0.7]),
          caption='Windows Firewall applies the Domain, Private, or Public profile by network location.')

    b.add('6.1', 'New-NetFirewallRule',
          'The PowerShell cmdlet that creates a Windows Firewall rule with a display name, direction, protocol, port, action, and profile, for example allowing inbound TCP 443 on the Domain profile.',
          'open an inbound port for a web service from a script and limit the rule to the domain network',
          ['Enable-PSRemoting', 'Set-NetFirewallProfile', 'Test-NetConnection'],
          'DIRECTION, PROTOCOL, PORT, ACTION, PROFILE — the five things a rule needs.',
          S.terminal(['New-NetFirewallRule -DisplayName "Web HTTPS" -Direction Inbound', '  -Protocol TCP -LocalPort 443 -Action Allow -Profile Domain', 'Name          : {a3f1c9d2-...}', 'Enabled       : True'], title='Windows PowerShell'),
          caption='New-NetFirewallRule creates a firewall rule from a script.')

    b.add('6.1', 'Domain isolation',
          'Using connection security rules so that domain-joined computers accept traffic only from other computers that authenticate with domain credentials, which blocks unmanaged devices from reaching servers.',
          'make servers accept connections only from computers that can authenticate as domain members',
          ['Windows Firewall profiles', 'Network security groups (NSGs)', 'Selective authentication'],
          'IPsec authentication with DOMAIN credentials — an unmanaged device cannot connect.',
          S.compare(('Domain member', ['Authenticates with Kerberos', 'Connection allowed', 'Reaches the server']), ('Unmanaged device', ['No domain credentials', 'Connection dropped', 'Cannot reach the server']), title='Domain isolation'),
          caption='Domain isolation lets only authenticated domain members connect to protected servers.')

    b.add('6.1', 'Secured-core server',
          'A class of server hardware certified with a TPM, firmware protection using DRTM, Secure Boot, and virtualization-based security enabled, providing a hardware root of trust from firmware to the operating system.',
          'buy hardware that protects firmware and boots with a hardware root of trust and virtualization-based protections turned on',
          ['Shielded virtual machines', 'BitLocker Drive Encryption', 'Windows Server security baseline via OSConfig'],
          'HARDWARE and firmware protection from the start — not only OS settings.',
          S.layers([('OS protections', 'VBS and memory integrity', 'green'), ('Boot', 'Secure Boot, measured boot', 'blue'), ('Firmware', 'DRTM protection', 'amber'), ('Hardware', 'TPM 2.0 root of trust', 'plain')], title='Secured-core stack'),
          caption='Secured-core servers combine a TPM, firmware protection, Secure Boot, and VBS.')

    b.add('6.1', 'Defender Antivirus automatic exclusions',
          'Microsoft Defender Antivirus on Windows Server automatically excludes the files and processes of installed roles, such as AD DS, DNS, and Hyper-V, to avoid performance problems and conflicts, in addition to any custom exclusions.',
          'avoid scan-related slowdowns on a host because the antivirus keeps scanning role data files',
          ['Tamper protection', 'Attack surface reduction rules', 'Microsoft Defender SmartScreen'],
          'Role-based exclusions are applied AUTOMATICALLY — custom exclusions are extra.',
          S.steps([('Role installed', 'AD DS or Hyper-V'), ('Exclusions added', 'automatically'), ('Scans skip them', 'less contention')], title='Automatic exclusions', tones=['plain', 'blue', 'green']),
          caption='Defender Antivirus automatically excludes the files of installed server roles.')

    b.add('6.1', 'Tamper protection',
          'A Microsoft Defender setting that stops malware and unauthorized changes from disabling real-time protection or other security settings, even by a local administrator, unless done through approved management.',
          'prevent malware or a local administrator from turning off real-time protection',
          ['Defender Antivirus automatic exclusions', 'Attack surface reduction rules', 'Credential Guard'],
          'Protects the PROTECTION itself from being switched off.',
          S.compare(('Without it', ['Malware can disable AV', 'Local admin can switch off', 'Silent weakening']), ('With it', ['Settings are locked', 'Changes need approved path', 'Protection stays on']), title='Tamper protection'),
          caption='Tamper protection prevents unauthorized changes to Defender security settings.')

    # ------------------------------------------------------------------------------------------ 6.2
    b.add('6.2', 'Fine-grained password policy',
          'Password Settings Objects that apply different password and lockout rules to specific users or global security groups in the same domain, with precedence deciding which applies when several match; created in Active Directory Administrative Center or with New-ADFineGrainedPasswordPolicy.',
          'require longer passwords and stricter lockout for service administrators than for regular users in one domain',
          ['AD DS password policies', 'Default Domain Policy', 'Microsoft Entra Password Protection for AD DS'],
          'Applies to USERS and GLOBAL GROUPS — the lowest precedence number wins.',
          S.compare(('Default Domain Policy', ['One policy per domain', 'Applies to everyone', 'Set in a GPO']), ('Fine-grained (PSO)', ['Targets users or groups', 'Precedence decides', 'Set in ADAC or PowerShell']), title='Password policy scope'),
          caption='A fine-grained password policy gives chosen users or groups stricter password rules.')

    b.add('6.2', 'Account lockout policy',
          'Settings for the lockout threshold (failed attempts), duration, and the window after which the counter resets; a locked account blocks further guessing, but too tight a threshold lets attackers lock users out on purpose.',
          'temporarily disable an account after several failed sign-ins to slow down password guessing',
          ['Fine-grained password policy', 'Protected Users group', 'Security options for user accounts'],
          'THRESHOLD, DURATION, and RESET window — event 4740 records a lockout.',
          S.facts([('Threshold', 'failed attempts allowed'), ('Duration', 'how long it stays locked'), ('Reset counter', 'window for counting'), ('Event ID', '4740 on the PDC emulator')], title='Account lockout'),
          caption='Account lockout settings stop password guessing by temporarily disabling an account.')

    b.add('6.2', 'Tiered administration model',
          'Separating administrative accounts into tiers, such as Tier 0 for domain controllers and identity, Tier 1 for servers, and Tier 2 for workstations, so credentials from a higher tier are never exposed on a lower tier.',
          'prevent domain administrator credentials from ever being used to sign in to user workstations',
          ['Privileged access workstations', 'Delegation of control', 'Protected Users group'],
          'Higher-tier credentials NEVER touch lower-tier machines — it stops credential theft escalating.',
          S.layers([('Tier 0', 'domain controllers, identity', 'red'), ('Tier 1', 'servers and applications', 'amber'), ('Tier 2', 'workstations and devices', 'green')], title='Administrative tiers'),
          caption='The tiered model keeps privileged credentials away from lower-trust machines.')

    b.add('6.2', 'Privileged access workstations',
          'Dedicated, hardened devices used only for sensitive administrative tasks, with no email or web browsing, so a compromise of the normal desktop cannot expose administrator credentials.',
          'give administrators a locked-down dedicated device for sensitive tasks and nothing else',
          ['Tiered administration model', 'Remote Credential Guard', 'Windows Admin Center deployment modes'],
          'ADMIN work only — no email, no browsing, no daily-driver use.',
          S.compare(('Normal desktop', ['Email and web', 'Daily work apps', 'Higher compromise risk']), ('Privileged workstation', ['Admin tasks only', 'Hardened and monitored', 'Credentials kept safe']), title='Privileged access workstation'),
          caption='A privileged access workstation is a hardened device used only for administration.')

    b.add('6.2', 'Authentication policy silos',
          'Authentication policies and silos restrict where privileged accounts can sign in, set Kerberos ticket lifetimes, and require devices to be in the silo, limiting how stolen credentials can be used.',
          'restrict domain-level administrator accounts so they can only authenticate from specific devices',
          ['Selective authentication', 'Protected Users group', 'Fine-grained password policy'],
          'Controls WHERE an account may authenticate from — silos group the accounts and devices.',
          S.steps([('Silo created', 'accounts and devices'), ('Policy assigned', 'allowed sign-in sources'), ('Other devices refused', 'tickets denied')], title='Authentication silo', tones=['blue', 'plain', 'red']),
          caption='Authentication policy silos restrict which devices privileged accounts can sign in from.')

    b.add('6.2', 'AdminSDHolder and SDProp',
          'AdminSDHolder holds the security descriptor template for protected accounts and groups, and the SDProp process, roughly hourly on the PDC emulator, overwrites their permissions with it and sets adminCount to 1.',
          'work out why permissions edited on a privileged account keep reverting about every hour',
          ['Delegation of control', 'Protected Users group', 'Restoring objects from AD Recycle Bin'],
          'Permissions on protected accounts are RESET hourly from the template — edit AdminSDHolder instead.',
          S.steps([('AdminSDHolder', 'template ACL'), ('SDProp runs hourly', 'on the PDC emulator'), ('Protected accounts', 'ACL overwritten')], title='SDProp', tones=['primary', 'blue', 'amber']),
          caption='SDProp periodically overwrites protected accounts\' permissions with the AdminSDHolder template.')

    b.add('6.2', 'Restricting NTLM authentication',
          'Auditing and then blocking NTLM through Group Policy so clients and applications use Kerberos, which is stronger against relay and pass-the-hash attacks; auditing first reveals what still depends on NTLM.',
          'find which applications still use legacy challenge-response sign-in and then block it in favor of Kerberos',
          ['Kerberos AES encryption types', 'LDAP signing and channel binding', 'Authentication protocols and methods for AD DS'],
          'AUDIT before you BLOCK — otherwise legacy apps break.',
          S.steps([('Audit NTLM use', 'who still uses it'), ('Fix or exempt', 'applications'), ('Restrict NTLM', 'Kerberos preferred')], title='Retiring NTLM', tones=['blue', 'plain', 'green']),
          caption='Audit NTLM usage first, then restrict it so Kerberos is used instead.')

    b.add('6.2', 'Kerberos AES encryption types',
          'Configuring which encryption types Kerberos accepts so tickets use AES-128 or AES-256 and the weak RC4 cipher is disabled, which makes stolen service tickets much harder to crack.',
          'stop domain controllers from issuing tickets that use the weak legacy cipher',
          ['Restricting NTLM authentication', 'Kerberoasting', 'LDAP signing and channel binding'],
          'AES in, RC4 out — weak ciphers make offline cracking easy.',
          S.compare(('RC4', ['Legacy cipher', 'Fast to crack offline', 'Disable it']), ('AES-128 / AES-256', ['Strong ciphers', 'Hard to crack offline', 'Require it']), title='Kerberos ciphers'),
          caption='Require AES for Kerberos tickets and disable the weak RC4 cipher.')

    b.add('6.2', 'Kerberoasting',
          'An attack in which any domain user requests service tickets for accounts with service principal names and cracks them offline to recover the account\'s password; managed service accounts, long random passwords, and AES-only tickets defend against it.',
          'recognize an attack that requests tickets for service accounts and cracks them offline to recover passwords',
          ['Pass-the-hash', 'Golden ticket', 'DCSync'],
          'Targets SERVICE ACCOUNTS with SPNs — gMSAs have passwords too long to crack.',
          S.steps([('Request service ticket', 'any domain user'), ('Crack offline', 'weak password falls'), ('Service account owned', 'privileges abused')], title='Kerberoasting', tones=['plain', 'amber', 'red']),
          caption='Kerberoasting cracks service tickets offline to recover weak service-account passwords.')

    b.add('6.2', 'LDAP signing and channel binding',
          'Domain controller policies that require LDAP traffic to be signed and LDAPS to use channel binding tokens, which prevents attackers from relaying or tampering with LDAP authentication.',
          'stop an attacker from relaying directory authentication to a domain controller over an unsigned connection',
          ['Restricting NTLM authentication', 'Kerberos AES encryption types', 'SMB signing'],
          'REQUIRE signing on the DCs and channel binding for LDAPS — it defeats relay attacks.',
          S.steps([('Client binds', 'LDAP connection'), ('DC requires signing', 'and channel binding'), ('Relay fails', 'unsigned bind refused')], title='LDAP hardening', tones=['plain', 'blue', 'green']),
          caption='Requiring LDAP signing and channel binding stops relay and tampering attacks.')

    b.add('6.2', 'Server Core for domain controllers',
          'Installing domain controllers as Server Core, without the desktop experience, which removes components, reduces the attack surface, and cuts patching, and managing them remotely with Windows Admin Center, RSAT, or PowerShell.',
          'reduce the attack surface and patching load of domain controllers by installing no graphical shell on them',
          ['Hardening domain controllers', 'Restricting access to domain controllers', 'Read-Only Domain Controller (RODC)'],
          'FEWER components, fewer patches — manage it remotely.',
          S.compare(('Server Core', ['No desktop experience', 'Smaller attack surface', 'Fewer patches']), ('Desktop Experience', ['Full graphical shell', 'More components', 'More to patch']), title='Installation options'),
          caption='Server Core reduces a domain controller\'s attack surface by omitting the desktop experience.')

    b.add('6.2', 'Privileged built-in operator groups',
          'Legacy groups such as Account Operators, Server Operators, Backup Operators, and Print Operators carry powerful rights; they should normally be empty, with delegated permissions used instead.',
          'reduce risk by emptying the old groups that can restore files, change accounts, or log on to domain controllers',
          ['Delegation of control', 'Protected Users group', 'AdminSDHolder and SDProp'],
          'EMPTY by default — use targeted delegation instead of these legacy groups.',
          S.table(['Group', 'Risky right'], [('Backup Operators', 'back up and restore files'), ('Server Operators', 'log on to DCs'), ('Account Operators', 'manage most accounts'), ('Print Operators', 'load drivers on DCs')], title='Legacy operator groups', col_widths=[0.45, 0.55]),
          caption='Legacy operator groups hold powerful rights and should normally be empty.')

    b.add('6.2', 'Time-based group membership',
          'The Privileged Access Management optional feature lets a user be added to a group, such as Domain Admins, with a time to live using Add-ADGroupMember -MemberTimeToLive, so the elevation expires automatically; it needs forest functional level 2016.',
          'give an administrator membership in a privileged group that ends by itself after two hours',
          ['Delegation of control', 'Just Enough Administration (JEA)', 'Authentication policy silos'],
          'The membership EXPIRES by itself — needs the PAM optional feature enabled.',
          S.terminal(['Add-ADGroupMember "Domain Admins" -Members ana', '  -MemberTimeToLive (New-TimeSpan -Hours 2)', 'Get-ADGroup "Domain Admins" -Properties member', '  -ShowMemberTimeToLive'], title='Windows PowerShell'),
          caption='Time-to-live group membership makes privileged access expire automatically.')

    b.add('6.2', 'Entra Password Protection agents',
          'Password protection for AD DS needs a DC agent on every domain controller, which evaluates password changes against the banned lists, and a proxy service on a non-domain-controller server that downloads policy from Microsoft Entra ID.',
          'install the components that let domain controllers check password changes against the cloud banned password list',
          ['Microsoft Entra Connect Sync', 'Azure Connected Machine agent', 'Fine-grained password policy'],
          'DC AGENT on every DC, PROXY service on a member server — the DCs never talk to the cloud directly.',
          S.steps([('Microsoft Entra ID', 'banned password policy'), ('Proxy service', 'member server'), ('DC agent', 'checks every change')], title='Password Protection components', tones=['primary', 'blue', 'green']),
          caption='Entra Password Protection uses a proxy service and a DC agent on every domain controller.')

    b.add('6.2', 'Custom banned password list',
          'A list of organization-specific terms, such as the company or product name, that users may not include in passwords, in addition to Microsoft\'s global list, evaluated with fuzzy matching and substitutions.',
          'block passwords that include the company\'s brand name even with simple character substitutions',
          ['AD DS password policies', 'Fine-grained password policy', 'Account lockout policy'],
          'Adds YOUR words to Microsoft\'s global list — substitutions like 0 for o are still caught.',
          S.flow_split(('Password submitted', 'Contoso2026!'), [('Matches banned term', 'rejected'), ('No match', 'accepted')], title='Banned list check', tones=['red', 'green']),
          caption='A custom banned list blocks organization-specific terms in passwords.')

    b.add('6.2', 'Advanced Audit Policy for AD DS',
          'Granular audit subcategories configured by Group Policy that record events such as successful and failed logons (4624, 4625), Kerberos tickets (4768, 4769), and account lockouts (4740), for detecting attacks.',
          'record failed sign-ins and ticket requests on domain controllers so unusual patterns can be detected',
          ['Event log management', 'Reliability Monitor', 'Data collector sets'],
          'Subcategories, not just the legacy categories — 4625 failure, 4768 TGT, 4740 lockout.',
          S.table(['Event ID', 'Meaning'], [('4624', 'successful logon'), ('4625', 'failed logon'), ('4768', 'Kerberos TGT requested'), ('4740', 'account locked out')], title='Useful security events', col_widths=[0.3, 0.7]),
          caption='Advanced Audit Policy records logons, Kerberos tickets, and lockouts for detection.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Operating system protections in depth', ['6.1'],
              'Exploit protection mitigations (DEP, ASLR, Control Flow Guard) can be tuned on one server, exported to XML, and deployed with Group Policy. App Control for Windows is a device-wide allow-list: test it in audit mode, refine it, enforce it, and extend it with supplemental policies, while AppLocker targets users and groups in user mode. Virtualization-based security isolates memory with the hypervisor and underpins Credential Guard and memory integrity (HVCI), and Remote Credential Guard keeps credentials on the client during RDP.\n\n'
              'OSConfig applies and, with drift control, re-applies a security baseline; the Security Compliance Toolkit provides baseline GPOs and Policy Analyzer. Windows LAPS stores managed local administrator passwords in AD or Entra ID (read with Get-LapsADPassword) and can reset them after use. Defender for Servers Plan 2 adds JIT access and file integrity monitoring to Plan 1. Windows Firewall applies the Domain, Private, or Public profile by network, New-NetFirewallRule scripts rules, and domain isolation uses connection security rules so only authenticated domain members connect. Secured-core hardware adds firmware and TPM protection, Defender Antivirus auto-excludes server role files, and tamper protection stops settings being switched off.')
    b.section('Securing AD DS in depth', ['6.2'],
              'Fine-grained password policies (Password Settings Objects) give specific users or global groups their own password and lockout rules, with the lowest precedence number winning. Account lockout uses a threshold, duration, and reset window (event 4740). Entra Password Protection needs a DC agent on every domain controller and a proxy service on a member server, and supports a custom banned list.\n\n'
              'Reduce privilege exposure with the tiered administration model, privileged access workstations, authentication policy silos, emptied legacy operator groups, and time-based group membership from the Privileged Access Management feature. Remember that SDProp resets protected accounts\' permissions hourly from AdminSDHolder. Harden protocols by auditing then restricting NTLM, requiring AES for Kerberos (defeating Kerberoasting), and requiring LDAP signing and channel binding. Install domain controllers as Server Core, and use Advanced Audit Policy to record logons (4624, 4625), Kerberos tickets (4768, 4769), and lockouts (4740).')
