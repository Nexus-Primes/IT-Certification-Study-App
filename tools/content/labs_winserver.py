"""New AZ-802 labs added in v230: operations masters, trusts, RODCs, Group Policy scope, Update Manager, remote management,
Hyper-V Replica, Azure VM storage, hybrid DNS, DHCP failover, Azure File Sync, FSRM, Storage Spaces, LAPS, Kerberoasting,
Recycle Bin restore, Azure Monitor, and authoritative restore."""
from labs_lib import decision, scenario, sequence, terminal

C = 'core1'


def labs():
    out = []

    # ------------------------------------------------------------------------------------------ ws1
    out.append(terminal(
        'fsmo-transfer-terminal', C, 'ws1', 'Intermediate', 9,
        'Hand every operations master role to a new domain controller before retiring the old one',
        'Find the role holders, transfer all five roles with PowerShell, verify, and demote the old controller.',
        'The contoso.com domain has two domain controllers, DC1 and DC2. DC1 holds every operations master role and is being retired, so the roles must be transferred gracefully to DC2 first. Type commands exactly, or use an accepted equivalent.',
        [
            ('List which servers currently hold the five operations master roles.',
             ['netdom query fsmo'],
             'Schema master          DC1.contoso.com\nDomain naming master    DC1.contoso.com\nPDC                    DC1.contoso.com\nRID pool manager       DC1.contoso.com\nInfrastructure master  DC1.contoso.com\nThe command completed successfully.',
             'Use netdom with the query fsmo option.'),
            ('Transfer all five roles to DC2 with one PowerShell command (roles 0 through 4, or their names).',
             ['Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole 0,1,2,3,4',
              'Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole 0,1,2,3,4 -Confirm:$false',
              'Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster,SchemaMaster,DomainNamingMaster',
              'Move-ADDirectoryServerOperationMasterRole -Identity DC2 -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster,SchemaMaster,DomainNamingMaster -Confirm:$false'],
             'Move operation master role... [Y] Yes\nAll five operations master roles were transferred to DC2.',
             'Use Move-ADDirectoryServerOperationMasterRole with -Identity DC2 and every role number from 0 to 4 (no -Force, so it is a graceful transfer).'),
            ('Confirm that DC2 now holds the roles, using the same command as the first step.',
             ['netdom query fsmo'],
             'Schema master          DC2.contoso.com\nDomain naming master    DC2.contoso.com\nPDC                    DC2.contoso.com\nRID pool manager       DC2.contoso.com\nInfrastructure master  DC2.contoso.com\nThe command completed successfully.',
             'Run netdom query fsmo again.'),
            ('On DC1, which now holds no roles, remove Active Directory Domain Services cleanly.',
             ['Uninstall-ADDSDomainController'],
             'Prompting for LocalAdministratorPassword...\nDC1 was demoted and its directory entries were removed.',
             'Use the cmdlet that demotes a live domain controller; it begins with Uninstall.'),
        ],
        [('netdom query fsmo', 'List the five operations master role holders'), ('Move-ADDirectoryServerOperationMasterRole', 'Transfer roles to another domain controller (add -Force to seize)'),
         ('Uninstall-ADDSDomainController', 'Demote a live domain controller'), ('Get-ADDomain', 'Shows the domain-wide role holders')],
        'netdom query fsmo shows all five holders. Move-ADDirectoryServerOperationMasterRole without -Force is a graceful transfer, which requires both controllers to be online; seizing (-Force) is only for a holder that is permanently lost. After the roles move, Uninstall-ADDSDomainController demotes the old controller and cleans its metadata.'))

    out.append(decision(
        'trust-type-decision', C, 'ws1', 'Intermediate', 8,
        'Pick the right trust for four different directories',
        'Match forest, external, shortcut, and realm trusts to the situation each one is built for.',
        'Contoso is connecting its directory to several others. For each requirement, choose the trust that does the job and no more.',
        [
            ('Every domain of a merged partner\'s forest must be reachable by users in every Contoso domain, without creating many separate trusts.', ['Forest trust', 'External trust', 'Shortcut trust', 'Realm trust'], 0,
             'A forest trust is transitive between forest roots, so every domain on both sides is included.'),
            ('A subsidiary in another forest needs access to one Contoso file server, and nothing else about its forest should be trusted.', ['Forest trust', 'External trust', 'Shortcut trust', 'Realm trust'], 1,
             'An external trust is non-transitive and links one domain to one domain, which limits exposure.'),
            ('A Linux team that runs MIT Kerberos wants Active Directory users to sign in to its application servers.', ['Forest trust', 'External trust', 'Shortcut trust', 'Realm trust'], 3,
             'A realm trust is the type that targets a non-Windows Kerberos v5 realm.'),
            ('Sign-ins between two deeply nested child domains in the same forest are slow because tickets walk through several parent domains.', ['Forest trust', 'External trust', 'Shortcut trust', 'Realm trust'], 2,
             'A shortcut trust gives the two child domains a direct authentication path inside one forest.'),
        ],
        'Forest trusts join whole forests, external trusts join a single domain to a single domain, shortcut trusts shorten paths inside one forest, and realm trusts connect to non-Windows Kerberos realms. Prefer the narrowest trust that satisfies the requirement, and remember SID filtering and selective authentication can narrow it further.'))

    out.append(sequence(
        'rodc-staged-sequence', C, 'ws1', 'Intermediate', 8,
        'Deploy a read-only domain controller at a branch with a staged installation',
        'Order the steps so that a branch technician can finish the promotion without domain administrator rights.',
        'A new branch office needs a read-only domain controller. The branch technician must finish the installation but must not receive domain administrator rights. Arrange the steps from first to last.',
        ['Pre-create the RODC account in AD DS and delegate its installation to the branch technician',
         'Set the password replication policy so only branch users and computers can be cached',
         'Install the AD DS role on the branch server',
         'Promote the server by attaching it to the pre-created RODC account',
         'Confirm that the RODC replicates and caches only the intended accounts',
         'Check that the branch contact can patch the server without any domain rights'],
        'A staged installation creates the account centrally, so the delegated technician only attaches the server. The password replication policy limits what a stolen RODC could expose, and administrator role separation lets the branch contact manage only that server.'))

    out.append(scenario(
        'gpo-scope-scenario', C, 'ws1', 'Intermediate', 10,
        'A policy is not applying to the Sales users',
        'Work out why a linked Group Policy object is being denied, and fix it without widening its scope.',
        'A new Group Policy object for the Sales OU was configured weeks ago, yet the Sales users are not getting its settings. Work the ticket by choosing your action at each step.',
        ('Policy not applying to Sales users', ['Reported by: Help desk', 'The GPO is linked to the Sales OU and enabled', 'An administrator recently narrowed its security filtering to the Sales group']),
        {
            'start': ('What is the best first diagnostic step?', [
                ('Run gpresult as an affected user to see which policies applied and which were denied, and why', 'step2', True),
                ('Delete the GPO and recreate it', 'end_bad_recreate', False),
                ('Enforce the link at the domain level', 'end_bad_enforce', False)]),
            'step2': ('gpresult lists the GPO under denied policies with the reason "Inaccessible (Security)". Authenticated Users was removed from the GPO when its filtering was narrowed. What is the cause and the fix?', [
                ('The Sales users and computers can no longer read the GPO: grant Authenticated Users (or the computers) Read, and keep Apply only for the Sales group', 'step3', True),
                ('The OU is blocking inheritance, so turn on Enforced for the GPO', 'end_bad_block', False),
                ('The link order is wrong, so move the GPO to link order 1', 'end_bad_order', False)]),
            'step3': ('The test user now shows the GPO as applied after a refresh. Other users still show the old setting an hour later. What next?', [
                ('Allow the normal background refresh (about 90 minutes plus a random offset) or run gpupdate /force, then confirm again with gpresult', 'end_good', True),
                ('Turn on loopback processing in Replace mode for the Sales OU', 'end_bad_loopback', False)]),
            'end_good': ('END', True, 'The policy applies once the principals can read it. Security filtering controls who applies the GPO, but Read permission must remain for the users and computers, and clients pick up the change at the next refresh or with gpupdate /force.'),
            'end_bad_recreate': ('END', False, 'Recreating the GPO repeats the same narrowed filtering and loses its history. Diagnose with gpresult first.'),
            'end_bad_enforce': ('END', False, 'Enforcing a link changes precedence and overrides blocking; it does not fix a GPO the users cannot read.'),
            'end_bad_block': ('END', False, 'The denial reason was security, not inheritance. Enforcement would not restore the missing Read permission.'),
            'end_bad_order': ('END', False, 'Link order only matters among GPOs that already apply. This GPO was being denied before any ordering.'),
            'end_bad_loopback': ('END', False, 'Loopback processing changes where user settings come from; it is not a fix for a denied GPO and would alter unrelated settings.'),
        },
        'gpresult shows both what applied and why a policy was denied. When security filtering is narrowed, keep Read for the users and computers and Apply only for the intended group, then let the refresh interval pass or run gpupdate /force.'))

    # ------------------------------------------------------------------------------------------ ws2
    out.append(sequence(
        'update-manager-rollout-sequence', C, 'ws2', 'Intermediate', 8,
        'Roll out patching for Arc-enabled servers with Azure Update Manager',
        'Order the steps from first assessment to a scoped production schedule.',
        'Your datacenter servers are connected to Azure Arc and you want a controlled monthly patching process in Azure Update Manager. Arrange the steps from first to last.',
        ['Enable periodic assessment so every connected server reports missing updates',
         'Review the compliance results and tag servers as pilot or production',
         'Create a maintenance configuration with a window, a recurrence, and update classifications',
         'Add a dynamic scope that selects the pilot servers by tag and run the first cycle',
         'Check the pilot results and the update history for failures',
         'Extend the scope to the production tag for the next maintenance window'],
        'Assessment shows what is missing, tags separate pilot from production, and a maintenance configuration with a dynamic scope applies updates on a schedule. Proving the process on the pilot group first limits the blast radius of a bad update.'))

    out.append(decision(
        'remote-management-decision', C, 'ws2', 'Intermediate', 8,
        'Choose the right remote management feature for four situations',
        'Match JEA, Remote Desktop Gateway, Windows Admin Center in Azure, and delegation to each requirement.',
        'You administer a hybrid Windows Server environment. For each situation, choose the feature that fits.',
        [
            ('Help desk staff must restart a service and reset passwords on a file server, but run no other command.', ['Just Enough Administration (JEA)', 'CredSSP', 'WinRM trusted hosts', 'Remote Server Administration Tools (RSAT)'], 0,
             'JEA publishes a restricted PowerShell endpoint that exposes only the allowed commands.'),
            ('Remote staff need Remote Desktop access to internal hosts over TCP 443, without a VPN or exposing port 3389.', ['Network Level Authentication (NLA)', 'Remote Desktop Gateway', 'Windows Admin Center gateway mode', 'Just Enough Administration (JEA)'], 1,
             'Remote Desktop Gateway tunnels RDP over HTTPS so internal hosts stay unexposed.'),
            ('An administrator must manage an Arc-enabled branch server from the Azure portal while its firewall allows no inbound connections.', ['PowerShell remoting over WinRM HTTP', 'Remote Desktop Gateway', 'Windows Admin Center in the Azure portal', 'RSAT on a workstation'], 2,
             'Windows Admin Center in Azure reaches Arc-enabled servers through the Arc agent\'s outbound connection, so no inbound ports are needed.'),
            ('A remote script on server 1 must read a share on server 2 without sending reusable credentials to server 1.', ['CredSSP', 'Enable-PSRemoting', 'Resource-based Kerberos constrained delegation', 'Server Manager remote management'], 2,
             'Resource-based constrained delegation lets server 2 accept delegation from server 1, so no reusable credentials are exposed. CredSSP would send them.'),
        ],
        'Pick the narrowest tool: JEA to limit commands, RD Gateway to publish RDP over HTTPS, Windows Admin Center in Azure for Arc-enabled servers with no inbound ports, and resource-based constrained delegation for the double-hop problem instead of CredSSP.'))

    # ------------------------------------------------------------------------------------------ ws3
    out.append(terminal(
        'hyperv-replica-terminal', C, 'ws3', 'Advanced', 11,
        'Replicate a virtual machine to a disaster recovery host and rehearse a failover',
        'Enable Hyper-V Replica, start the initial copy, check health, and run then clean up a test failover.',
        'The SQL01 virtual machine on host HV01 must be replicated to the disaster recovery host HVDR01 over Kerberos on HTTP, sending changes every five minutes. Type commands exactly, or use an accepted equivalent.',
        [
            ('Enable replication of SQL01 to HVDR01 on port 80 with Kerberos authentication and a five minute (300 second) interval.',
             ['Enable-VMReplication -VMName SQL01 -ReplicaServerName HVDR01 -ReplicaServerPort 80 -AuthenticationType Kerberos -ReplicationFrequencySec 300',
              'Enable-VMReplication -VMName SQL01 -ReplicaServerName HVDR01.contoso.com -ReplicaServerPort 80 -AuthenticationType Kerberos -ReplicationFrequencySec 300'],
             'VMName  State                         Health\nSQL01   ReadyForInitialReplication    Normal',
             'Use Enable-VMReplication with -VMName, -ReplicaServerName, -ReplicaServerPort 80, -AuthenticationType Kerberos, and -ReplicationFrequencySec 300.'),
            ('Start the initial replication of SQL01 over the network.',
             ['Start-VMInitialReplication -VMName SQL01', 'Start-VMInitialReplication SQL01'],
             'Initial replication of SQL01 started.',
             'Use Start-VMInitialReplication with the VM name.'),
            ('Check the replication health of SQL01.',
             ['Get-VMReplication -VMName SQL01', 'Get-VMReplication SQL01', 'Get-VMReplication'],
             'VMName  State        Health  Mode\nSQL01   Replicating  Normal  Primary',
             'Use Get-VMReplication.'),
            ('On the replica host, start a test failover of SQL01 that does not disturb production.',
             ['Start-VMFailover -VMName SQL01 -AsTest', 'Start-VMFailover SQL01 -AsTest'],
             "A test virtual machine named 'SQL01 - Test' was created from the replica.",
             'Use Start-VMFailover with the -AsTest switch.'),
            ('When the test is finished, remove the test virtual machine.',
             ['Stop-VMFailover -VMName SQL01', 'Stop-VMFailover SQL01'],
             'The test virtual machine was removed and replication continues.',
             'Use Stop-VMFailover on the same VM name.'),
        ],
        [('Enable-VMReplication', 'Turn on replication for a VM'), ('Start-VMInitialReplication', 'Send the first full copy'), ('Get-VMReplication', 'Show replication state and health'),
         ('Start-VMFailover -AsTest', 'Create a disposable test copy on the replica host'), ('Stop-VMFailover', 'Remove the test copy')],
        'Enable-VMReplication sets the replica host, port, authentication, and interval; the initial copy follows, then deltas every interval. A test failover creates a disposable copy without affecting production or the replication, and Stop-VMFailover cleans it up, which makes rehearsals safe to do regularly.'))

    out.append(decision(
        'azure-vm-storage-decision', C, 'ws3', 'Intermediate', 8,
        'Choose disk types, caching, and encryption for Azure VMs',
        'Pick the right managed disk, host caching setting, and encryption option for four workloads.',
        'You are building Windows Server VMs in Azure and must make storage choices for each workload.',
        [
            ('A production SQL Server VM needs low-latency data disks with steady performance, but not the highest and most expensive tier.', ['Premium SSD', 'Standard HDD', 'Ultra Disk', 'The temporary disk'], 0,
             'Premium SSD is the usual production choice; Ultra Disk is for the most demanding latency and IOPS needs, and the temporary disk loses its data when the VM moves.'),
            ('The same VM has a read-heavy reporting data disk. Which host caching setting suits it?', ['ReadWrite', 'ReadOnly', 'None'], 1,
             'ReadOnly speeds up repeated reads without risking cached writes; None suits write-heavy disks such as logs.'),
            ('Security requires that even the temporary disk and the disk caches are encrypted, with nothing installed in the guest.', ['Azure Disk Encryption', 'Encryption at host', 'A BitLocker password typed at startup'], 1,
             'Encryption at host starts at the VM host and covers the temporary disk and caches without a guest agent.'),
            ('Developers\' test VMs hold only disposable data and cost is the priority.', ['Premium SSD', 'Ultra Disk', 'Standard HDD'], 2,
             'Standard HDD is the lowest-cost managed disk and fits backup and dev/test data.'),
        ],
        'Match the disk to the workload (Premium SSD for production, Ultra only when required, Standard for dev/test), set caching by read and write pattern, and use encryption at host when the temporary disk and caches must also be encrypted.'))

    # ------------------------------------------------------------------------------------------ ws4
    out.append(terminal(
        'hybrid-dns-terminal', C, 'ws4', 'Advanced', 9,
        'Make on-premises DNS resolve an Azure private endpoint name',
        'Create a conditional forwarder to the Azure resolver, test it, and clear stale answers.',
        'On-premises clients must resolve a storage account\'s private endpoint through an Azure DNS Private Resolver inbound endpoint at 10.1.0.4. Your on-premises DNS server is at 10.0.0.10. Type commands exactly, or use an accepted equivalent.',
        [
            ('Create a conditional forwarder zone for privatelink.file.core.windows.net that points to 10.1.0.4 and is stored in Active Directory for the whole forest.',
             ['Add-DnsServerConditionalForwarderZone -Name privatelink.file.core.windows.net -MasterServers 10.1.0.4 -ReplicationScope Forest',
              'Add-DnsServerConditionalForwarderZone -Name "privatelink.file.core.windows.net" -MasterServers 10.1.0.4 -ReplicationScope Forest',
              'Add-DnsServerConditionalForwarderZone -Name privatelink.file.core.windows.net -MasterServers "10.1.0.4" -ReplicationScope Forest'],
             'Conditional forwarder zone privatelink.file.core.windows.net created (replication scope: Forest).',
             'Use Add-DnsServerConditionalForwarderZone with -Name, -MasterServers, and -ReplicationScope Forest.'),
            ('Test resolution of mystore.file.core.windows.net against the on-premises DNS server.',
             ['Resolve-DnsName mystore.file.core.windows.net -Server 10.0.0.10', 'Resolve-DnsName -Name mystore.file.core.windows.net -Server 10.0.0.10', 'nslookup mystore.file.core.windows.net 10.0.0.10'],
             'Name                                   Type   IPAddress\nmystore.privatelink.file.core.windows.net  A     10.1.2.5',
             'Use Resolve-DnsName with -Server 10.0.0.10.'),
            ('The DNS server still holds an old public answer. Clear its cache.',
             ['Clear-DnsServerCache', 'Clear-DnsServerCache -Force', 'Clear-DnsServerCache -Confirm:$false'],
             'The DNS server cache was cleared.',
             'Use Clear-DnsServerCache.'),
            ('Clear the cache on this client too, so it asks the server again.',
             ['Clear-DnsClientCache', 'ipconfig /flushdns'],
             'The DNS client resolver cache was flushed.',
             'Use Clear-DnsClientCache or ipconfig /flushdns.'),
        ],
        [('Add-DnsServerConditionalForwarderZone', 'Create a conditional forwarder'), ('Resolve-DnsName', 'Query DNS, optionally against one server'), ('Clear-DnsServerCache', 'Empty the DNS server cache'), ('Clear-DnsClientCache', 'Empty the client resolver cache')],
        'A conditional forwarder sends queries for the privatelink zone to the resolver\'s inbound endpoint, which answers with the private IP address. Testing with Resolve-DnsName -Server isolates the on-premises server, and the server and client caches must be cleared so stale public answers do not linger.'))

    out.append(sequence(
        'dhcp-failover-sequence', C, 'ws4', 'Intermediate', 7,
        'Make DHCP highly available with a failover relationship',
        'Order the steps to give a subnet a second DHCP server that shares the scope.',
        'A single DHCP server leases addresses for the head office subnet. Add a second server so leasing continues if one fails. Arrange the steps from first to last.',
        ['Install and authorize the DHCP role on both servers',
         'Create and activate the scope on the primary server',
         'Create the failover relationship with the partner and choose load balance or hot standby',
         'Replicate the scope configuration to the partner',
         'Test by stopping the primary DHCP service and renewing a client lease',
         'Restore the primary and confirm both servers show a normal state'],
        'DHCP failover shares the whole scope and the lease database, unlike a split scope. After authorizing both servers and creating the relationship, test it by stopping the primary, then bring it back and confirm normal state.'))

    # ------------------------------------------------------------------------------------------ ws5
    out.append(sequence(
        'azure-file-sync-sequence', C, 'ws5', 'Intermediate', 9,
        'Connect an on-premises file server to an Azure file share with Azure File Sync',
        'Order the steps from the storage account to a monitored, tiered sync relationship.',
        'A branch file server must sync with an Azure file share and tier its coldest files to the cloud. Arrange the steps from first to last.',
        ['Create a storage account and an Azure file share for the cloud endpoint',
         'Deploy a Storage Sync Service in the same region',
         'Install the Azure File Sync agent on the Windows server and register it',
         'Create a sync group that uses the Azure file share as its cloud endpoint',
         'Add a server endpoint on the server and set a cloud tiering policy',
         'Check sync status and set up alerts in Azure Monitor'],
        'The cloud endpoint is the Azure file share, the Storage Sync Service holds the sync groups and registered servers, and each sync group has one cloud endpoint and one or more server endpoints. The tiering policy keeps the server volume from filling.'))

    out.append(terminal(
        'fsrm-quota-terminal', C, 'ws5', 'Intermediate', 8,
        'Limit and protect a department share with File Server Resource Manager',
        'Install FSRM, apply a hard quota, block audio and video files, and review usage.',
        'The Sales folder at D:\\Shares\\Sales on FS1 keeps growing and filling with media files. Install FSRM, cap the folder at 50 GB, and block audio and video files. Type commands exactly, or use an accepted equivalent.',
        [
            ('Install the File Server Resource Manager role service with its management tools.',
             ['Install-WindowsFeature FS-Resource-Manager -IncludeManagementTools', 'Install-WindowsFeature -Name FS-Resource-Manager -IncludeManagementTools'],
             'Success  Restart Needed: No  Feature Result: {File Server Resource Manager}',
             'Use Install-WindowsFeature with FS-Resource-Manager and -IncludeManagementTools.'),
            ('Create a hard quota of 50 GB on D:\\Shares\\Sales.',
             ['New-FsrmQuota -Path D:\\Shares\\Sales -Size 50GB', 'New-FsrmQuota -Path "D:\\Shares\\Sales" -Size 50GB', 'New-FsrmQuota -Path \'D:\\Shares\\Sales\' -Size 50GB'],
             'Path: D:\\Shares\\Sales   Size: 50 GB   SoftLimit: False',
             'Use New-FsrmQuota with -Path and -Size 50GB (a hard quota is the default).'),
            ('Block audio and video files in the folder with an active file screen.',
             ['New-FsrmFileScreen -Path D:\\Shares\\Sales -IncludeGroup "Audio and Video Files" -Active', 'New-FsrmFileScreen -Path "D:\\Shares\\Sales" -IncludeGroup "Audio and Video Files" -Active'],
             'Path: D:\\Shares\\Sales   Active: True   IncludeGroup: Audio and Video Files',
             'Use New-FsrmFileScreen with -IncludeGroup "Audio and Video Files" and -Active.'),
            ('Review the quota and its current usage on the folder.',
             ['Get-FsrmQuota', 'Get-FsrmQuota -Path D:\\Shares\\Sales', 'Get-FsrmQuota -Path "D:\\Shares\\Sales"'],
             'Path                Size   Usage\nD:\\Shares\\Sales      50 GB  41.7 GB',
             'Use Get-FsrmQuota.'),
        ],
        [('Install-WindowsFeature FS-Resource-Manager', 'Add the FSRM role service'), ('New-FsrmQuota', 'Create a hard or soft quota'), ('New-FsrmFileScreen', 'Block file groups (active) or log them (passive)'), ('Get-FsrmQuota', 'Show quotas and usage')],
        'A hard quota blocks writes at its limit, and an active file screen denies the blocked file group rather than only logging it. Templates apply the same settings to many folders, and storage reports show where the space went.'))

    out.append(decision(
        'storage-resiliency-decision', C, 'ws5', 'Intermediate', 8,
        'Choose resiliency and replication for four storage requirements',
        'Match parity, mirror, synchronous Storage Replica, and Azure File Sync cloud tiering to the right job.',
        'You are designing storage for several workloads and must pick the layout or replication that fits each requirement.',
        [
            ('An archive of old project files must survive one drive failure while using as little extra raw capacity as possible; writes are rare.', ['Parity resiliency', 'Mirror resiliency', 'Simple space'], 0,
             'Parity is capacity-efficient and suits archives; its slower writes do not matter here.'),
            ('Busy Hyper-V virtual machine storage must survive a drive failure and keep good write performance.', ['Parity resiliency', 'Mirror resiliency', 'Simple space'], 1,
             'Mirror keeps copies of the data, which gives better write performance for active virtual machines.'),
            ('Two datacenters 2 km apart on a very low latency link must hold identical volumes with no data loss.', ['Asynchronous Storage Replica', 'Synchronous Storage Replica', 'DFS Replication', 'Hyper-V Replica'], 1,
             'Synchronous replication commits each write at both sites before acknowledging it, so no data is lost, and it needs a low-latency link.'),
            ('A branch file server must keep only recently used files locally so the volume stays under a free-space target.', ['Data Deduplication', 'Storage Spaces parity', 'Azure File Sync with a volume free space policy'], 2,
             'Cloud tiering with a volume free space policy moves the coldest files to Azure and leaves stubs on the server.'),
        ],
        'Parity for capacity-efficient archives, mirror for busy virtual machines, synchronous replication for zero data loss over a fast link, and cloud tiering to keep a branch volume from filling.'))

    # ------------------------------------------------------------------------------------------ ws6
    out.append(sequence(
        'laps-rollout-sequence', C, 'ws6', 'Intermediate', 8,
        'Roll out Windows LAPS with passwords stored in Active Directory',
        'Order the steps from the schema change to verifying that a managed password was stored.',
        'Local administrator accounts on member servers share passwords. Deploy Windows LAPS so each computer has its own rotated password stored in AD. Arrange the steps from first to last.',
        ['Extend the Active Directory schema for Windows LAPS',
         'Give computers permission to update their own passwords on the target OU',
         'Create a GPO that sets the backup directory, password age, and length',
         'Link the GPO and let the computers refresh policy',
         'Retrieve a password with Get-LapsADPassword to confirm it was stored',
         'Review who can read passwords and consider a post-authentication reset action'],
        'The schema is extended once, computers need permission to write their own passwords, policy tells the client where and how to store them, and Get-LapsADPassword proves it works. Restricting who can read passwords and resetting them after use limits exposure.'))

    out.append(scenario(
        'kerberoasting-response-scenario', C, 'ws6', 'Advanced', 11,
        'A burst of service ticket requests targets a SQL service account',
        'Recognize likely Kerberoasting, contain it, and harden the account and the domain.',
        'The SIEM flagged unusual Kerberos activity against the production SQL service account. Work the incident by choosing your action at each step.',
        ('Unusual service ticket requests for the SQL service account', ['Reported by: SIEM', 'Many event 4769 requests for MSSQLSvc/sql01 from one workstation, outside working hours', 'Tickets requested with the RC4 encryption type', 'The svc-sql password was last set in 2019']),
        {
            'start': ('What is the best first action?', [
                ('Treat it as a likely Kerberoasting attempt: isolate the workstation and plan to rotate the service account password', 'step2', True),
                ('Ignore it, because event 4769 is a normal event', 'end_bad_ignore', False),
                ('Stop the SQL Server service', 'end_bad_stop', False)]),
            'step2': ('The workstation is isolated. What should happen to the service account?', [
                ('Reset its password to a long random value now, and move the service to a gMSA or dMSA so the password is managed and not crackable', 'step3', True),
                ('Add it to Domain Admins so it cannot be locked out', 'end_bad_admin', False),
                ('Leave the password as is because tickets are encrypted', 'end_bad_leave', False)]),
            'step3': ('Which hardening reduces the chance of a repeat?', [
                ('Require AES for Kerberos, disable RC4, and alert on bursts of 4769 events for accounts with service principal names', 'end_good', True),
                ('Raise the account lockout threshold', 'end_bad_lockout', False)]),
            'end_good': ('END', True, 'Kerberoasting cracks service tickets offline, so a weak, old password is the real exposure. Isolating the source, replacing the password with a managed account, and moving to AES with monitoring close the gap.'),
            'end_bad_ignore': ('END', False, 'Event 4769 is normal in isolation, but a burst for one service principal name from one workstation with RC4 tickets is the classic signature.'),
            'end_bad_stop': ('END', False, 'Stopping the service causes an outage and does nothing about the tickets, which can already be cracked offline.'),
            'end_bad_admin': ('END', False, 'Granting privilege to a service account whose password may be cracked makes the compromise far worse.'),
            'end_bad_leave': ('END', False, 'Ticket encryption does not help here: the attacker cracks the ticket offline, so a weak password remains the weakness.'),
            'end_bad_lockout': ('END', False, 'Lockout does not apply, because offline cracking makes no failed sign-in attempts.'),
        },
        'Kerberoasting requests tickets for accounts with service principal names and cracks them offline. Replace weak static passwords with managed accounts (gMSA or dMSA), require AES, and alert on unusual 4769 bursts.'))

    # ------------------------------------------------------------------------------------------ ws7
    out.append(terminal(
        'ad-restore-terminal', C, 'ws7', 'Advanced', 9,
        'Restore a deleted organizational unit with the AD Recycle Bin',
        'Confirm the Recycle Bin is on, find the deleted OU, restore it, and verify.',
        'The Marketing organizational unit in contoso.com was deleted by mistake. The Active Directory Recycle Bin should be enabled. Type commands exactly, or use an accepted equivalent.',
        [
            ('Check that the Recycle Bin optional feature exists and is enabled.',
             ['Get-ADOptionalFeature \'Recycle Bin Feature\'', 'Get-ADOptionalFeature "Recycle Bin Feature"', 'Get-ADOptionalFeature -Identity \'Recycle Bin Feature\''],
             'Name: Recycle Bin Feature   EnabledScopes: {CN=Partitions...}   IsDisableable: False',
             'Use Get-ADOptionalFeature with the Recycle Bin Feature name.'),
            ('List the deleted objects in the directory.',
             ['Get-ADObject -Filter \'isDeleted -eq $true\' -IncludeDeletedObjects', 'Get-ADObject -IncludeDeletedObjects -Filter \'isDeleted -eq $true\''],
             'Name                       ObjectClass\nMarketing\\0ADEL:...        organizationalUnit',
             'Use Get-ADObject with -IncludeDeletedObjects and a filter on isDeleted.'),
            ('Restore the deleted Marketing OU by filtering for its name with an LDAP filter and piping to the restore cmdlet.',
             ['Get-ADObject -LDAPFilter \'(&(isDeleted=TRUE)(name=Marketing*))\' -IncludeDeletedObjects | Restore-ADObject',
              'Get-ADObject -IncludeDeletedObjects -LDAPFilter \'(&(isDeleted=TRUE)(name=Marketing*))\' | Restore-ADObject'],
             'The deleted object was restored: OU=Marketing,DC=contoso,DC=com',
             'Pipe Get-ADObject -LDAPFilter (with -IncludeDeletedObjects) to Restore-ADObject.'),
            ('Verify that the OU exists again.',
             ['Get-ADOrganizationalUnit -Identity \'OU=Marketing,DC=contoso,DC=com\'', 'Get-ADOrganizationalUnit -Identity "OU=Marketing,DC=contoso,DC=com"'],
             'DistinguishedName: OU=Marketing,DC=contoso,DC=com   Name: Marketing',
             'Use Get-ADOrganizationalUnit with the OU distinguished name.'),
        ],
        [('Get-ADOptionalFeature', 'Check whether the Recycle Bin is enabled'), ('Get-ADObject -IncludeDeletedObjects', 'Find deleted objects'), ('Restore-ADObject', 'Restore a deleted object (parents before children)'), ('Get-ADOrganizationalUnit', 'Confirm an OU exists')],
        'With the Recycle Bin enabled, deleted objects keep all their attributes and can be restored with Restore-ADObject during the deleted object lifetime. Restore a parent container before its children, and enable the feature before you need it, because it is irreversible.'))

    out.append(decision(
        'monitoring-decision', C, 'ws7', 'Intermediate', 8,
        'Choose the right Azure Monitor and Windows Server monitoring tools',
        'Match metrics, the Azure Monitor Agent, log search alerts, and System Insights to four monitoring jobs.',
        'You are building monitoring for hybrid Windows Server machines. For each job, choose the tool that fits.',
        [
            ('Chart CPU percentage in near real time and alert within a minute when it stays above 85 percent.', ['A metric alert rule on Azure Monitor metrics', 'A Log Analytics query alert', 'An Automation runbook schedule'], 0,
             'Metrics are fast numeric values that suit near real-time charts and quick alerts.'),
            ('Collect event logs and performance counters from on-premises Arc-enabled servers into one queryable store.', ['The retired Log Analytics agent', 'Windows Event Forwarding only', 'The Azure Monitor Agent with a data collection rule and a Log Analytics workspace'], 2,
             'The Azure Monitor Agent, driven by data collection rules, replaced the Log Analytics agent and sends data to a workspace.'),
            ('Alert when a query finds more than five failed sign-ins in ten minutes, email the team, and start a runbook.', ['A metric alert with no action group', 'A log search alert rule with an action group', 'A Performance Monitor data collector set'], 1,
             'A log search alert runs a query on a schedule, and an action group supplies the email and the runbook.'),
            ('Predict that a volume will run out of space and run a cleanup script automatically when the forecast turns critical.', ['Resource Monitor', 'System Insights with a remediation action', 'Reliability Monitor'], 1,
             'System Insights forecasts capacity on the server and can run a script when a forecast reaches a chosen status.'),
        ],
        'Use metrics for fast numeric alerting, the Azure Monitor Agent with data collection rules for collection, log search alerts with action groups for query-based alerting, and System Insights for on-server forecasts with automatic remediation.'))

    out.append(sequence(
        'dc-authoritative-restore-sequence', C, 'ws7', 'Advanced', 9,
        'Recover deleted Active Directory objects with an authoritative restore',
        'Order the steps so restored objects overwrite the deleted state on the other domain controllers.',
        'Objects were deleted and replicated, and the Recycle Bin was not enabled. Restore them from a system state backup so that they replicate back out. Arrange the steps from first to last.',
        ['Boot the domain controller into Directory Services Restore Mode',
         'Restore the most recent system state backup that contains the deleted objects',
         'Mark the deleted subtree as authoritative with ntdsutil',
         'Restart the domain controller normally',
         'Let replication carry the restored objects to the other domain controllers',
         'Verify with repadmin /replsummary and check that the objects are back'],
        'An authoritative restore raises the version numbers of the restored objects so they overwrite the deleted copies on other domain controllers. It is performed in Directory Services Restore Mode, before a normal restart, and then verified with repadmin.'))

    return out
