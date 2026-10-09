"""AZ-802, domain ws2 (Manage Windows Server instances and workloads in a hybrid environment): remote management and Azure services."""
import svg as S

DOMAIN = 'ws2'


def build(b):
    b.topics['2.1'] = ['Windows Admin Center modes', 'PowerShell remoting', 'Double-hop and JEA', 'SSH', 'Remote Desktop and RD Gateway']
    b.topics['2.2'] = ['Azure Arc agent and onboarding', 'Extensions and policy', 'Update Manager', 'Hotpatch', 'Automation runbooks']

    # ------------------------------------------------------------------------------------------ 2.1
    b.add('2.1', 'Windows Admin Center deployment modes',
          'Windows Admin Center can run in desktop mode on a Windows client, in gateway mode on a shared server that administrators reach by browser over HTTPS, or in the Azure portal for Arc-enabled servers and Azure VMs.',
          'install a shared management portal on one server that several administrators reach with a web browser',
          ['Remote Server Administration Tools (RSAT)', 'Server Manager remote management', 'Azure Bastion'],
          'DESKTOP for one admin, GATEWAY for a team, AZURE PORTAL for cloud-connected servers.',
          S.table(['Mode', 'Where it runs'], [('Desktop', 'a Windows 10 or 11 client'), ('Gateway', 'a shared Windows Server'), ('Azure portal', 'the Azure portal')], title='Windows Admin Center modes', col_widths=[0.35, 0.65]),
          caption='Windows Admin Center runs as a desktop app, a shared gateway server, or inside the Azure portal.')

    b.add('2.1', 'Windows Admin Center in the Azure portal',
          'Managing an Arc-enabled server or Azure VM from the browser in the Azure portal, authorized by the Windows Admin Center Administrator Login Azure role; Arc-enabled servers need no inbound ports because the Arc agent opens an outbound reverse proxy, while an Azure VM is reached on the extension port (6516 by default), preferably over a private IP address in its virtual network.',
          'open a management console for an Arc-connected server from the Azure portal without a VPN',
          ['Azure Bastion', 'Just-in-time (JIT) VM access', 'Azure Automation runbooks'],
          'Authorized by an AZURE role — Arc servers need no inbound ports; Azure VMs use port 6516 by default.',
          S.steps([('Azure portal', 'sign in with Entra ID'), ('Admin Center blade', 'Azure role checked'), ('Managed server', 'no inbound ports on Arc')], title='Admin Center in Azure', tones=['blue', 'primary', 'green']),
          caption='The Azure portal hosts Windows Admin Center for Arc-enabled servers and Azure VMs.')

    b.add('2.1', 'Remote Server Administration Tools (RSAT)',
          'Optional features on Windows 10 and 11, installed with Add-WindowsCapability, that provide the management consoles and PowerShell modules for roles such as AD DS, DNS, DHCP, and Group Policy so servers can be administered from a client.',
          'manage DNS and Group Policy from an administrator\'s Windows 11 workstation without installing a server role on it',
          ['Windows Admin Center deployment modes', 'Server Manager remote management', 'Azure Arc-enabled Windows Server'],
          'Consoles and modules on a CLIENT — nothing is installed on the servers.',
          S.steps([('Windows 11 client', 'admin workstation'), ('Add RSAT features', 'Add-WindowsCapability'), ('Manage roles', 'AD, DNS, DHCP, GPMC')], title='RSAT', tones=['plain', 'blue', 'green']),
          caption='RSAT installs server management consoles and PowerShell modules on a Windows client.')

    b.add('2.1', 'Server Manager remote management',
          'Server Manager can add many servers to a server group, then show their status and manage roles and features on them; Windows Server accepts remote management by default.',
          'watch the status of several servers from one console and add a role to one of them',
          ['Windows Admin Center deployment modes', 'Remote Server Administration Tools (RSAT)', 'Performance Monitor'],
          'ONE console, many servers — add them to the server group first.',
          S.hub(('Server Manager',), [('Server groups', 'many servers'), ('Add roles', 'on remote hosts'), ('Status tiles', 'events, services')], title='Managing many servers'),
          caption='Server Manager groups remote servers so roles and status can be managed from one console.')

    b.add('2.1', 'Invoke-Command',
          'A PowerShell cmdlet that runs a script block on one or many remote computers at once over WinRM (or SSH), returning the results to the caller; the throttle limit defaults to 32 simultaneous connections.',
          'restart a service on forty servers with a single command from a management workstation',
          ['Enter-PSSession', 'PowerShell Direct', 'SSH Direct for Linux guests'],
          'ONE-TO-MANY — Enter-PSSession is the one-to-one interactive shell.',
          S.terminal(['Invoke-Command -ComputerName $servers {', '  Restart-Service Spooler', '}', 'PSComputerName   Status', 'SRV01            Running'], title='Windows PowerShell'),
          caption='Invoke-Command runs the same script block on many remote computers at once.')

    b.add('2.1', 'Enter-PSSession',
          'A cmdlet that opens an interactive one-to-one remote shell on another computer, where the prompt shows the remote name and typed commands run there until Exit-PSSession.',
          'open an interactive shell on one remote server and work as if sitting at its console prompt',
          ['Invoke-Command', 'PowerShell Direct', 'Remote Desktop access configuration'],
          'ONE server, interactive — the prompt changes to [ServerName].',
          S.terminal(['Enter-PSSession -ComputerName SRV01', '[SRV01]: PS C:\\> Get-Service Spooler', 'Running  Spooler', '[SRV01]: PS C:\\> Exit-PSSession'], title='Windows PowerShell'),
          caption='Enter-PSSession opens an interactive shell on one remote computer.')

    b.add('2.1', 'WinRM ports and listeners',
          'PowerShell remoting uses Windows Remote Management, listening on TCP 5985 for HTTP and 5986 for HTTPS (traffic is encrypted either way inside Kerberos); Enable-PSRemoting creates the listener and firewall rules.',
          'open the correct firewall ports for PowerShell remoting over a certificate-secured listener',
          ['Remote Desktop access configuration', 'SMB over QUIC', 'DHCP relay agent'],
          '5985 is HTTP, 5986 is HTTPS — Enable-PSRemoting sets up the listener.',
          S.facts([('HTTP listener', 'TCP 5985'), ('HTTPS listener', 'TCP 5986'), ('Enable remoting', 'Enable-PSRemoting'), ('Domain auth', 'Kerberos by default')], title='WinRM basics'),
          caption='WinRM listens on TCP 5985 for HTTP and 5986 for HTTPS.')

    b.add('2.1', 'CredSSP',
          'An authentication option that delegates the user\'s full credentials to the first remote server so it can use them to reach a second one, solving the double-hop problem but exposing reusable credentials if that server is compromised.',
          'let a remote session use the administrator\'s own credentials to reach a second server by handing them in full to the first',
          ['Resource-based Kerberos constrained delegation', 'Just Enough Administration (JEA)', 'WinRM trusted hosts and remoting prerequisites'],
          'It WORKS but sends reusable credentials to the middle server — a security trade-off.',
          S.steps([('Admin', 'starts remote session'), ('Server 1', 'receives full credentials'), ('Server 2', 'reached with them')], title='CredSSP delegation', tones=['plain', 'amber', 'red']),
          caption='CredSSP delegates full credentials to the first server so it can reach a second.')

    b.add('2.1', 'Resource-based Kerberos constrained delegation',
          'A double-hop solution where the second server\'s account is configured, with Set-ADComputer -PrincipalsAllowedToDelegateToAccount, to accept delegation from the first server, so no reusable credentials are sent and the owner of the resource controls which servers may delegate to it.',
          'let a remoting session reach a second server without sending reusable credentials to the middle server',
          ['CredSSP', 'Just Enough Administration (JEA)', 'WinRM trusted hosts and remoting prerequisites'],
          'Configured on the BACK-END resource — it names which front end may delegate to it.',
          S.steps([('Admin', 'Kerberos ticket'), ('Server 1 (front end)', 'allowed to delegate'), ('Server 2 (resource)', 'trusts Server 1')], title='Resource-based delegation', tones=['plain', 'blue', 'green']),
          caption='The resource server\'s account lists which front-end servers may delegate to it.')

    b.add('2.1', 'JEA role capability and session configuration files',
          'JEA uses role capability files (.psrc) that list the cmdlets, functions, and parameters a role may run, and a session configuration file (.pssc) that maps groups to those roles and runs commands under a virtual account; the endpoint is registered with Register-PSSessionConfiguration.',
          'define exactly which cmdlets a help desk group may run in a remote session and publish that restricted endpoint',
          ['PowerShell execution policy', 'Windows Defender Application Control', 'WinRM trusted hosts and remoting prerequisites'],
          '.PSRC lists WHAT a role can do; .PSSC says WHO gets which role.',
          S.compare(('Role capability (.psrc)', ['Allowed cmdlets', 'Allowed functions', 'Allowed parameters']), ('Session config (.pssc)', ['Maps groups to roles', 'Virtual account RunAs', 'Registered endpoint']), title='JEA files'),
          caption='JEA role capability files list allowed commands; the session configuration maps groups to roles.')

    b.add('2.1', 'PowerShell remoting over SSH',
          'PowerShell 7 can open remoting sessions through SSH with the -HostName parameter, using an sshd subsystem for PowerShell, so the same cmdlets work across Windows and Linux with key-based authentication.',
          'connect to both Windows and Linux machines with the same remoting cmdlets and key-based sign-in',
          ['WinRM ports and listeners', 'Remote Desktop access configuration', 'Enter-PSSession'],
          '-HostName means SSH; -ComputerName means WinRM.',
          S.compare(('-HostName', ['Uses SSH', 'Key-based sign-in', 'Windows and Linux']), ('-ComputerName', ['Uses WinRM', 'Kerberos in a domain', 'Windows targets']), title='Remoting transports'),
          caption='PowerShell 7 remoting can ride on SSH using the -HostName parameter.')

    b.add('2.1', 'Network Level Authentication (NLA)',
          'A Remote Desktop security setting that requires users to authenticate before a full session is created, which reduces the resources an unauthenticated connection can use and blunts some attacks.',
          'require users to prove who they are before a full remote desktop session is built on the server',
          ['Remote Desktop Gateway', 'Enhanced Session Mode', 'Azure Bastion'],
          'Authenticate FIRST, then build the session — on by default and worth keeping on.',
          S.steps([('Client connects', 'RDP to server'), ('Authenticates first', 'credentials checked'), ('Session created', 'only after success')], title='Network Level Authentication', tones=['plain', 'blue', 'green']),
          caption='NLA requires authentication before a Remote Desktop session is created.')

    b.add('2.1', 'Remote Desktop Gateway',
          'A role service that tunnels Remote Desktop traffic over HTTPS (TCP 443) to internal hosts, with authorization policies, so remote users do not need a VPN and TCP 3389 is not exposed to the Internet.',
          'let remote staff reach internal desktops over port 443 without a VPN or opening the standard RDP port',
          ['Azure Bastion', 'Just-in-time (JIT) VM access', 'Network Level Authentication (NLA)'],
          'RDP wrapped in HTTPS on 443 — policies decide who reaches which host.',
          S.steps([('Remote user', 'any network'), ('RD Gateway', 'HTTPS 443 and policy'), ('Internal host', 'RDP 3389 inside')], title='Remote Desktop Gateway', tones=['plain', 'primary', 'green']),
          caption='RD Gateway tunnels RDP over HTTPS so internal hosts are reachable without a VPN.')

    b.add('2.1', 'Remote Desktop Users group',
          'The local group whose members may sign in over Remote Desktop even though they are not administrators; Administrators can connect by default.',
          'allow a standard user to sign in over Remote Desktop to a member server',
          ['Remote Management Users group', 'Protected Users group', 'Server Operators group'],
          'Members of Remote Desktop Users may CONNECT by RDP — it does not make them administrators.',
          S.compare(('Remote Desktop Users', ['RDP sign-in allowed', 'No admin rights', 'Local group']), ('Remote Management Users', ['WinRM access allowed', 'For PowerShell and WAC', 'Local group']), title='Remote access groups'),
          caption='Remote Desktop Users may sign in over RDP; Remote Management Users may use WinRM.')

    b.add('2.1', 'Remote Management Users group',
          'The local group whose members may use WinRM-based management, such as PowerShell remoting and Windows Admin Center, without being administrators.',
          'let a monitoring engineer run remote PowerShell sessions on a server without making them an administrator',
          ['Remote Desktop Users group', 'Protected Users group', 'Server Operators group'],
          'WinRM access without admin rights — Remote Desktop Users is the RDP equivalent.',
          S.steps([('Engineer', 'standard user'), ('In the group', 'Remote Management Users'), ('Remoting works', 'no admin rights')], title='Remote Management Users', tones=['plain', 'blue', 'green']),
          caption='Remote Management Users may connect with WinRM without being administrators.')

    # ------------------------------------------------------------------------------------------ 2.2
    b.add('2.2', 'Azure Connected Machine agent',
          'The agent installed on a non-Azure server that connects it to Azure Arc; it needs only outbound HTTPS (TCP 443), and azcmagent commands such as connect, show, and check manage and test it.',
          'verify that an on-premises server can reach the endpoints Azure Arc requires',
          ['Azure Monitor Agent', 'Azure Automation Hybrid Runbook Worker', 'Azure Site Recovery mobility service'],
          'OUTBOUND 443 only — no inbound ports; azcmagent check tests connectivity.',
          S.terminal(['azcmagent check', 'Checking connectivity to Azure endpoints...', 'management.azure.com   Reachable', 'login.microsoftonline.com   Reachable'], title='Command Prompt'),
          caption='The Connected Machine agent needs only outbound HTTPS; azcmagent check tests the endpoints.')

    b.add('2.2', 'Arc onboarding with a service principal',
          'Registering many servers non-interactively with a service principal that holds the Azure Connected Machine Onboarding role, so the script carries a credential limited to onboarding rather than an administrator\'s sign-in.',
          'onboard hundreds of servers without prompts using a credential that can only register machines',
          ['Per-server interactive sign-in', 'Azure Site Recovery', 'Windows Admin Center deployment modes'],
          'The ONBOARDING role limits what a leaked script can do.',
          S.steps([('Create principal', 'onboarding role only'), ('Run script at scale', 'GPO or deployment tool'), ('Servers appear', 'in Azure Arc')], title='Onboarding at scale', tones=['blue', 'plain', 'green']),
          caption='A service principal with the onboarding role lets scripts register many servers unattended.')

    b.add('2.2', 'Custom Script Extension',
          'A VM extension that downloads and runs a script on an Azure VM or Arc-enabled server from the portal, PowerShell, or a template, so a configuration step can be applied without signing in to each machine.',
          'run a configuration script once on many Arc-enabled servers from the portal without logging in to each',
          ['Azure Automation runbooks', 'Azure Update Manager', 'Azure Arc device configuration'],
          'An EXTENSION pushes the script to the machine — no sign-in to each server.',
          S.steps([('Script in storage', 'or inline'), ('Extension deployed', 'to selected servers'), ('Runs on each', 'results reported')], title='Custom Script Extension', tones=['plain', 'blue', 'green']),
          caption='The Custom Script Extension runs a script on Azure VMs or Arc-enabled servers remotely.')

    b.add('2.2', 'Periodic assessment',
          'An Azure Update Manager setting that checks machines for missing updates automatically about every 24 hours, so compliance data is current without anyone starting a manual scan.',
          'see which updates are missing on every connected server without running a scan on each',
          ['Maintenance configurations', 'One-time update deployment', 'Hotpatch'],
          'ASSESSES (finds missing updates) — it does not install anything.',
          S.steps([('Setting enabled', 'on the machine'), ('Scan every 24 h', 'automatic'), ('Compliance view', 'missing updates listed')], title='Periodic assessment', tones=['blue', 'plain', 'green']),
          caption='Periodic assessment scans machines for missing updates about every 24 hours.')

    b.add('2.2', 'Maintenance configurations',
          'Azure Update Manager schedules that define a maintenance window, recurrence, and update classifications, applied to machines directly or through dynamic scopes that select them by subscription, location, tag, or OS.',
          'install critical updates on all servers tagged production every second Saturday night',
          ['Periodic assessment', 'One-time update deployment', 'Hotpatch'],
          'A SCHEDULE plus a SCOPE — dynamic scopes pick machines by tag, location, or subscription.',
          S.table(['Part', 'Example'], [('Window', 'Sat 22:00, 3 hours'), ('Recurrence', 'every 2 weeks'), ('Classification', 'critical, security'), ('Dynamic scope', 'tag env=prod')], title='Maintenance configuration', col_widths=[0.4, 0.6]),
          caption='A maintenance configuration pairs a schedule with a scope that selects machines.')

    b.add('2.2', 'One-time update deployment',
          'An immediate, manual Azure Update Manager run that installs chosen updates on selected machines now, rather than waiting for a scheduled maintenance window.',
          'install an emergency security patch on selected servers right now instead of at the next scheduled window',
          ['Maintenance configurations', 'Periodic assessment', 'Hotpatch'],
          'NOW and manual — maintenance configurations are scheduled.',
          S.compare(('One-time deployment', ['Starts immediately', 'Chosen machines', 'Chosen updates']), ('Maintenance configuration', ['Runs on a schedule', 'Scope by tag or location', 'Repeats']), title='Update runs'),
          caption='A one-time deployment installs updates immediately on selected machines.')

    b.add('2.2', 'Hotpatch',
          'Installing security updates in memory without restarting, available for Windows Server 2025 through Azure Arc enablement or on Azure Edition VMs; the quarterly baseline months (four a year), the occasional unplanned baseline, and non-security, .NET, and driver updates still require a restart.',
          'apply monthly security updates to a Windows Server 2025 machine without rebooting it in most months',
          ['One-time update deployment', 'Maintenance configurations', 'Periodic assessment'],
          'Most months NO reboot — the periodic BASELINE months still need one.',
          S.steps([('Baseline month', 'update + restart'), ('Hotpatch months', 'no restart'), ('Baseline again', 'update + restart')], title='Hotpatch cycle', tones=['amber', 'green', 'amber']),
          caption='Hotpatch installs most monthly updates without a restart; baseline months still reboot.')

    b.add('2.2', 'Azure Automation Hybrid Runbook Worker',
          'A role that lets Azure Automation run runbooks directly on a machine in your datacenter or another cloud, rather than in the Azure sandbox, so they can reach resources that are not exposed to Azure.',
          'run an Automation runbook against servers inside the datacenter that the cloud sandbox cannot reach',
          ['Azure Connected Machine agent', 'Custom Script Extension', 'Azure Update Manager'],
          'Runs the runbook ON-PREMISES — the default Azure sandbox only reaches what Azure can reach.',
          S.compare(('Azure sandbox', ['Runs in Azure', 'Reaches public endpoints', 'No on-prem access']), ('Hybrid worker', ['Runs on your server', 'Reaches internal systems', 'Registered via Arc']), title='Where a runbook runs'),
          caption='A Hybrid Runbook Worker runs Automation runbooks on your own machines instead of the Azure sandbox.')

    b.add('2.2', 'Graphical runbooks',
          'A runbook type built by connecting activities and cmdlets on a canvas instead of writing script; the other types are PowerShell, PowerShell Workflow, and Python.',
          'let a team that does not write scripts build automation by dragging activities onto a design surface',
          ['PowerShell Workflow runbooks', 'Python runbooks', 'Runbook webhooks'],
          'Built on a CANVAS — no script writing.',
          S.table(['Runbook type', 'Authored as'], [('Graphical', 'drag-and-drop canvas'), ('PowerShell', 'PowerShell script'), ('Python', 'Python script'), ('PowerShell Workflow', 'workflow script')], title='Runbook types', col_widths=[0.45, 0.55]),
          caption='Graphical runbooks are built on a canvas; other types are written as scripts.')

    b.add('2.2', 'Runbook webhooks',
          'A URL that starts a runbook when an external system sends an HTTP POST to it, with a secret token embedded in the URL and an expiry date; schedules start runbooks at set times instead.',
          'start a runbook when a ticketing system makes an HTTP call to Azure',
          ['Graphical runbooks', 'Python runbooks', 'Azure Update Manager'],
          'The URL IS the secret — treat it like a password, and it expires.',
          S.steps([('External system', 'sends HTTP POST'), ('Webhook URL', 'token in the URL'), ('Runbook starts', 'parameters from body')], title='Runbook webhook', tones=['plain', 'amber', 'green']),
          caption='A webhook starts an Automation runbook when an external system posts to its URL.')

    b.add('2.2', 'Managed identity for Automation runbooks',
          'A system-assigned managed identity on the Automation account that a runbook uses to authenticate to Azure resources with role assignments, so no password or certificate is stored; it replaces the retired Run As accounts.',
          'let a runbook manage Azure resources without storing any password or certificate',
          ['A stored service principal secret', 'A shared access key', 'Azure Automation Hybrid Runbook Worker'],
          'No stored secret — it replaced the retired RUN AS accounts.',
          S.steps([('Runbook starts', 'Connect-AzAccount -Identity'), ('Identity token', 'issued by Azure'), ('Resources managed', 'by role assignment')], title='Managed identity in a runbook', tones=['plain', 'blue', 'green']),
          caption='A managed identity lets runbooks sign in to Azure without any stored credential.')

    b.add('2.2', 'Azure Policy for Arc-enabled servers',
          'Assigning Azure Policy to Arc-enabled servers to audit or enforce settings, such as requiring an extension, a tag, or a baseline, and showing compliance in the portal alongside Azure VMs.',
          'check that every on-premises server connected to Azure has the monitoring extension installed',
          ['Azure Automation runbooks', 'Azure Update Manager', 'Microsoft Defender for Servers'],
          'Same POLICY engine as Azure resources — compliance covers Arc machines too.',
          S.steps([('Assign a policy', 'at the scope'), ('Arc machines evaluated', 'same as Azure VMs'), ('Compliance shown', 'remediate if needed')], title='Azure Policy on Arc', tones=['blue', 'plain', 'green']),
          caption='Azure Policy evaluates Arc-enabled servers like Azure VMs and reports compliance.')

    b.add('2.2', 'Managed identity for Arc-enabled servers',
          'Each Arc-enabled server has a system-assigned managed identity that an application on it can use to obtain tokens for Azure services such as Key Vault, without storing credentials.',
          'let an application on an on-premises server read secrets from Azure Key Vault without storing a password',
          ['A stored service principal secret', 'A shared access signature', 'Arc onboarding with a service principal'],
          'The Arc server gets an IDENTITY from Azure — grant it a role, store nothing.',
          S.steps([('App on Arc server', 'asks local endpoint'), ('Token issued', 'for the server identity'), ('Key Vault read', 'role assignment checked')], title='Arc managed identity', tones=['plain', 'blue', 'green']),
          caption='An Arc-enabled server\'s managed identity lets its apps call Azure services without secrets.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Remote management in depth', ['2.1'],
              'Windows Admin Center runs in desktop mode on a client, gateway mode on a shared server that administrators reach over HTTPS, or in the Azure portal for Arc-enabled servers and Azure VMs, where an Azure role authorizes access (Arc-enabled servers need no inbound ports; Azure VMs are reached on port 6516 by default, preferably over a private IP). RSAT installs consoles and modules on a Windows client, and Server Manager manages many servers from one console.\n\n'
              'PowerShell remoting uses WinRM on TCP 5985 (HTTP) and 5986 (HTTPS); Invoke-Command runs a script block on many computers at once and Enter-PSSession opens one interactive shell. The double-hop problem is solved with CredSSP (works but sends reusable credentials) or resource-based Kerberos constrained delegation (preferred), and JEA limits what a remote user can do through .psrc role capability files and a .pssc session configuration. PowerShell 7 can remote over SSH with -HostName. Network Level Authentication makes users authenticate before an RDP session is built, Remote Desktop Gateway tunnels RDP over HTTPS on 443, and the Remote Desktop Users and Remote Management Users groups grant RDP and WinRM access without administrator rights.')
    b.section('Azure Arc, Update Manager, and Automation in depth', ['2.2'],
              'The Connected Machine agent needs only outbound HTTPS. Onboard servers at scale with a service principal that holds the onboarding role, then use extensions (for example the Custom Script Extension) to push configuration, Azure Policy to audit compliance, and the machine\'s managed identity so apps can reach Azure services without secrets.\n\n'
              'Azure Update Manager performs periodic assessment about every 24 hours, installs on a schedule through maintenance configurations (with dynamic scopes by tag, location, or subscription), or runs one-time deployments immediately. Hotpatch installs most monthly updates on Windows Server 2025 without a restart, except baseline months. In Azure Automation, runbooks can be graphical, PowerShell, PowerShell Workflow, or Python; start them on a schedule or from a webhook, run them on a Hybrid Runbook Worker to reach on-premises systems, and authenticate with a managed identity instead of the retired Run As accounts.')
