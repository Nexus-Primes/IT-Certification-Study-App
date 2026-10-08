"""AZ-802, domain ws7 (Monitor and troubleshoot Windows Server environments): monitoring, server troubleshooting, Active Directory recovery."""
import svg as S

DOMAIN = 'ws7'


def build(b):
    b.topics['7.1'] = ['Counters and baselines', 'Resource Monitor', 'Event subscriptions', 'Azure Monitor Agent and workspaces', 'KQL', 'Metrics, alerts, action groups', 'System Insights remediation']
    b.topics['7.2'] = ['Test-NetConnection and Resolve-DnsName', 'DISM and SFC', 'Time and Kerberos skew', 'Extension logs', 'BitLocker and Key Vault', 'Storage repair', 'pktmon and Network Watcher']
    b.topics['7.3'] = ['Recycle Bin and tombstones', 'Authoritative and non-authoritative restore', 'System state backup', 'repadmin and dcdiag', 'Duplicate SPNs and klist', 'Secure channel repair', 'DSRM and metadata cleanup']

    # ------------------------------------------------------------------------------------------ 7.1
    b.add('7.1', 'Avg. Disk sec/Read counter',
          'The PhysicalDisk performance counter that shows the average time, in seconds, a read takes to complete; sustained values above roughly 20 milliseconds suggest the storage is a bottleneck.',
          'tell whether a slow application is waiting on storage by measuring how long each read takes',
          ['Processor % Processor Time', 'Memory Available MBytes', 'Network Interface Bytes Total/sec'],
          'It measures LATENCY — a long queue or high throughput alone does not prove a slow disk.',
          S.table(['Counter', 'Warning sign'], [('% Processor Time', 'above 85% for long'), ('Available MBytes', 'very low, paging up'), ('Avg. Disk sec/Read', 'above about 20 ms'), ('Bytes Total/sec', 'near link capacity')], title='Core counters', col_widths=[0.5, 0.5]),
          caption='Avg. Disk sec/Read measures storage latency; consistently high values indicate a bottleneck.')

    b.add('7.1', 'Performance baseline',
          'A recording of how a server normally behaves, captured with a data collector set during typical load, so later slowdowns can be compared against known-good counter values.',
          'record how a server behaves on a normal day so later slowdowns can be compared against it',
          ['Resource Monitor', 'Reliability Monitor', 'Event Viewer custom views'],
          'Capture it WHEN the server is healthy — you cannot judge a number without a baseline.',
          S.steps([('Capture while healthy', 'typical workload'), ('Problem appears', 'slow response'), ('Compare to baseline', 'find what changed')], title='Baselining', tones=['green', 'amber', 'blue']),
          caption='A baseline records normal performance so later problems can be measured against it.')

    b.add('7.1', 'Resource Monitor',
          'A real-time tool that shows CPU, memory, disk, and network use per process, including which process holds a file open or is writing to disk right now, and can end a process tree.',
          'see which process is writing to the disk right now and which one is holding a file open',
          ['Performance baseline', 'Reliability Monitor', 'Data collector sets'],
          'LIVE and per-PROCESS — Performance Monitor records counters over time.',
          S.hub(('Resource Monitor',), [('CPU', 'processes, handles'), ('Memory', 'working sets'), ('Disk', 'per-file activity'), ('Network', 'connections')], title='Resource Monitor tabs'),
          caption='Resource Monitor shows live CPU, memory, disk, and network use per process.')

    b.add('7.1', 'Event log subscriptions',
          'Windows Event Forwarding sends events from many servers to a collector, either pulled by the collector or pushed by sources through Group Policy, and stores them in the Forwarded Events log for central review.',
          'gather security events from dozens of servers into one log on a central server',
          ['Azure Monitor data collection rules', 'Data collector sets', 'Event Viewer custom views'],
          'Source-initiated (push through GPO) scales best — the collector holds the Forwarded Events log.',
          S.flow_split(('Collector server', 'Forwarded Events log'), [('Source server 1', 'forwards events'), ('Source server 2', 'forwards events'), ('Source server 3', 'forwards events')], title='Event forwarding', tones=['green', 'green', 'green']),
          caption='Event log subscriptions forward events from many servers to a central collector.')

    b.add('7.1', 'Event Viewer custom views',
          'Saved filters that combine events by level, source, ID, or time from several logs, and on a collector across servers, so the events that matter can be reopened without rebuilding the filter.',
          'save a filter that shows only critical and error events from several logs',
          ['Event log subscriptions', 'Performance baseline', 'Reliability Monitor'],
          'SAVES a multi-log filter — and Administrative Events is a built-in custom view.',
          S.steps([('Choose logs', 'System, Application'), ('Set level and IDs', 'critical, error'), ('Save the view', 'reopen any time')], title='Custom view', tones=['plain', 'blue', 'green']),
          caption='A custom view saves a filter that spans several event logs.')

    b.add('7.1', 'Azure Monitor Agent',
          'The current agent that collects guest operating system performance counters and event logs from Azure VMs and Arc-enabled servers and sends them to Azure Monitor as directed by data collection rules, replacing the retired Log Analytics agent.',
          'collect guest performance counters and event logs from Azure VMs and Arc-enabled servers with the current supported agent',
          ['Log Analytics agent (retired)', 'Azure Connected Machine agent', 'Dependency agent'],
          'The one agent driven by DATA COLLECTION RULES — the Log Analytics (MMA) agent is retired.',
          S.steps([('Agent installed', 'extension on VM or Arc'), ('DCR assigned', 'what to collect'), ('Data sent', 'workspace or metrics')], title='Azure Monitor Agent', tones=['blue', 'plain', 'green']),
          caption='The Azure Monitor Agent collects data as directed by data collection rules.')

    b.add('7.1', 'Log Analytics workspace',
          'A central store for logs collected by Azure Monitor and other services, queried with Kusto Query Language and used by alerts and workbooks; data is kept for a configurable retention period.',
          'store collected event and performance records in a central place that can be queried and alerted on',
          ['Azure Monitor metrics', 'Azure storage account', 'Azure Event Hubs'],
          'A queryable LOG store — metrics are lightweight numbers kept separately.',
          S.layers([('Sources', 'VMs, Arc servers, services', 'plain'), ('Workspace', 'stores the log tables', 'primary'), ('Consumers', 'KQL, alerts, workbooks', 'green')], title='Log Analytics'),
          caption='A Log Analytics workspace stores collected logs for querying and alerting.')

    b.add('7.1', 'Kusto Query Language (KQL)',
          'The read-only query language used in Log Analytics, where tables are piped through operators such as where, summarize, and project to filter and aggregate log data.',
          'write a query that averages processor use per computer from records stored in a log workspace',
          ['Windows PowerShell pipeline', 'Structured Query Language (SQL)', 'Windows Management Instrumentation Query Language (WQL)'],
          'TABLE | where | summarize — pipes data through operators.',
          S.terminal(['Perf', '| where CounterName == "% Processor Time"', '| summarize avg(CounterValue) by Computer', '| order by avg_CounterValue desc'], title='Log Analytics query', prompt_first=False),
          caption='KQL pipes a table through operators such as where and summarize to analyze logs.')

    b.add('7.1', 'Azure Monitor metrics',
          'Lightweight numeric time-series values collected at regular intervals, available almost immediately, which can be charted and used for alerts that fire within about a minute without querying logs.',
          'chart near real-time CPU percentage and alert quickly without running log queries',
          ['Log Analytics workspace', 'Azure Activity log', 'Application Insights'],
          'NUMBERS over time, fast — logs hold rich records you query with KQL.',
          S.compare(('Metrics', ['Numeric time series', 'Near real-time', 'Fast metric alerts']), ('Logs', ['Rich records', 'Queried with KQL', 'Log search alerts']), title='Metrics vs. logs'),
          caption='Metrics are quick numeric values; logs are queryable records.')

    b.add('7.1', 'Action groups',
          'Reusable sets of notifications and actions, such as email, SMS, a webhook, an Automation runbook, or a Logic App, that Azure Monitor alert rules trigger when they fire.',
          'send an email and start an Automation runbook whenever any of several alerts fires',
          ['Azure Monitor alerts', 'Azure Policy for Arc-enabled servers', 'Maintenance configurations'],
          'WHO is told and WHAT runs — one group reused by many alert rules.',
          S.flow_split(('Alert fires',), [('Email the team', 'notification'), ('Run a runbook', 'remediation'), ('Call a webhook', 'ticket system')], title='Action group', tones=['amber', 'blue', 'green']),
          caption='An action group defines the notifications and actions an alert triggers.')

    b.add('7.1', 'Log search alert rules',
          'Alert rules that run a KQL query on a schedule against a workspace and fire when the result meets a condition, such as more than five failed sign-in events within ten minutes.',
          'raise an alert when a stored query finds more than five failed sign-ins within ten minutes',
          ['Metric alert rules', 'Activity log alert rules', 'Action groups'],
          'A QUERY on a schedule — metric alerts watch a numeric value instead.',
          S.steps([('Query runs', 'every few minutes'), ('Result evaluated', 'count above 5'), ('Alert fires', 'action group runs')], title='Log search alert', tones=['blue', 'plain', 'amber']),
          caption='A log search alert runs a KQL query on a schedule and fires when a condition is met.')

    b.add('7.1', 'System Insights remediation actions',
          'A System Insights setting that runs a script automatically when a capability\'s forecast reaches a chosen status, for example extending a volume or cleaning up files when volume consumption is predicted to run out.',
          'run a script automatically when a forecast predicts that a volume will run out of space',
          ['Azure Monitor alerts', 'Windows Admin Center monitoring and alerts', 'Data collector sets'],
          'Forecast status triggers a SCRIPT — prediction first, then automatic response.',
          S.steps([('Forecast made', 'volume consumption'), ('Status changes', 'predicted to run out'), ('Script runs', 'remediation action')], title='System Insights remediation', tones=['blue', 'amber', 'green']),
          caption='System Insights can run a script when a forecast reaches a chosen status.')

    # ------------------------------------------------------------------------------------------ 7.2
    b.add('7.2', 'Test-NetConnection',
          'A PowerShell cmdlet that tests connectivity to a host, checking ping, a specific TCP port with -Port, and the route with -TraceRoute, and reports whether the TCP test succeeded.',
          'check whether TCP port 443 on a remote server is reachable and see the path taken to it',
          ['Resolve-DnsName', 'Get-NetIPConfiguration', 'Clear-DnsClientCache'],
          'TcpTestSucceeded says whether the PORT answers — ping alone does not.',
          S.terminal(['Test-NetConnection web01 -Port 443', 'ComputerName     : web01', 'RemotePort       : 443', 'TcpTestSucceeded : True'], title='Windows PowerShell'),
          caption='Test-NetConnection checks whether a remote TCP port can be reached.')

    b.add('7.2', 'Bottom-up connectivity method',
          'Troubleshooting connectivity in layers, starting with the physical link, then IP configuration, gateway reachability, name resolution, and finally the port and application, to isolate which layer fails.',
          'work through a connection problem starting at the cable and moving up to the application one layer at a time',
          ['Performance bottleneck analysis', 'Test-NetConnection', 'Reliability Monitor'],
          'Start at the LINK and move up — the first layer that fails is the problem.',
          S.layers([('5. Application', 'service responds', 'green'), ('4. Port', 'TCP port open', 'blue'), ('3. Name resolution', 'DNS answers', 'amber'), ('2. IP and gateway', 'address and route', 'violet'), ('1. Link', 'cable and adapter up', 'plain')], title='Troubleshoot upward'),
          caption='Check connectivity layer by layer from the physical link up to the application.')

    b.add('7.2', 'Resolve-DnsName',
          'A PowerShell cmdlet that queries DNS for a record type, optionally against a specific server with -Server, so you can compare answers from different resolvers.',
          'query one specific DNS server directly for a record and compare its answer with another server',
          ['Test-NetConnection', 'Get-NetIPConfiguration', 'Clear-DnsClientCache'],
          '-Server picks the resolver to ask — comparing two answers shows stale or split DNS.',
          S.terminal(['Resolve-DnsName app.contoso.com -Server 10.0.0.10 -Type A', 'Name              Type  TTL  IPAddress', 'app.contoso.com    A     300  10.0.1.25'], title='Windows PowerShell'),
          caption='Resolve-DnsName queries a chosen DNS server for a specific record type.')

    b.add('7.2', 'DISM and SFC repair',
          'SFC /scannow repairs corrupted protected system files from the component store, and DISM /Online /Cleanup-Image /RestoreHealth repairs the component store itself, so DISM is run first when SFC cannot fix files.',
          'repair corrupted system files after updates keep failing, starting with the source that supplies replacement files',
          ['Get-WindowsUpdateLog', 'Repair-Volume', 'Test-ComputerSecureChannel'],
          'DISM fixes the STORE, then SFC fixes the FILES from it.',
          S.steps([('DISM RestoreHealth', 'repairs component store'), ('SFC /scannow', 'repairs system files'), ('Retry the update', 'should succeed')], title='Repair order', tones=['blue', 'plain', 'green']),
          caption='DISM repairs the component store and SFC then repairs system files from it.')

    b.add('7.2', 'Get-WindowsUpdateLog',
          'A cmdlet that merges Windows Update event trace files into a readable WindowsUpdate.log, used to see why a server fails to detect, download, or install updates.',
          'turn the binary Windows Update traces into a readable log to find why an update will not install',
          ['DISM and SFC repair', 'Event log subscriptions', 'Periodic assessment'],
          'The log is TRACE-based — this cmdlet converts it to readable text.',
          S.steps([('Update fails', 'error code shown'), ('Get-WindowsUpdateLog', 'merges ETL traces'), ('Read WindowsUpdate.log', 'find the failing step')], title='Windows Update log', tones=['red', 'blue', 'green']),
          caption='Get-WindowsUpdateLog converts update traces to a readable log.')

    b.add('7.2', 'Kerberos clock skew',
          'Kerberos rejects tickets when the client and domain controller clocks differ by more than the allowed tolerance, five minutes by default, so a drifting clock causes authentication failures that look like password problems.',
          'explain why sign-ins fail with a ticket error when a server\'s clock is ten minutes wrong',
          ['Duplicate SPNs', 'Account lockout policy', 'LDAP signing and channel binding'],
          'FIVE minutes by default — fix time before blaming credentials.',
          S.compare(('Clock within 5 minutes', ['Ticket accepted', 'Sign-in works', 'Normal operation']), ('Clock off by 10 minutes', ['Ticket rejected', 'Sign-in fails', 'Fix time sync']), title='Kerberos time tolerance'),
          caption='Kerberos fails when clocks differ by more than the default five-minute tolerance.')

    b.add('7.2', 'Configuring the PDC emulator time source',
          'The PDC emulator of the forest root should sync from a reliable external NTP source configured with w32tm /config /manualpeerlist /syncfromflags:manual /reliable:yes, and all other domain members then sync down the hierarchy.',
          'point the top of the domain time hierarchy at an external time source',
          ['Kerberos clock skew', 'Troubleshooting Time service', 'Hotpatch'],
          'Configure it on the FOREST ROOT PDC emulator — everyone else follows the hierarchy.',
          S.terminal(['w32tm /config /manualpeerlist:"0.pool.ntp.org"', '  /syncfromflags:manual /reliable:yes /update', 'The command completed successfully.', 'w32tm /query /status'], title='Command Prompt'),
          caption='The forest root PDC emulator syncs from an external NTP source; others follow the hierarchy.')

    b.add('7.2', 'Memory pressure indicators',
          'Signs that a server needs more memory or has a leak: low Available MBytes, heavy hard paging shown by Pages Input/sec, and a committed-bytes total approaching the commit limit.',
          'recognize a memory shortage from counters that show the server constantly paging to disk',
          ['Avg. Disk sec/Read counter', 'Smart Paging', 'Processor % Processor Time'],
          'LOW available memory plus HEAVY paging — look for a leak before adding RAM.',
          S.table(['Counter', 'Sign of pressure'], [('Available MBytes', 'persistently low'), ('Pages Input/sec', 'sustained high'), ('Committed Bytes', 'near commit limit')], title='Memory counters', col_widths=[0.5, 0.5]),
          caption='Low available memory with heavy paging indicates memory pressure.')

    b.add('7.2', 'Extension log locations',
          'Extension installs write logs on the machine, such as C:\\ProgramData\\GuestConfig\\extension_logs on Arc-enabled servers and C:\\WindowsAzure\\Logs\\Plugins on Azure VMs, which show why an extension failed.',
          'find the file that explains why an extension failed to install on an Arc-enabled server',
          ['Windows Update log', 'Security event log', 'Reliability Monitor'],
          'Look on the MACHINE — the portal status only shows a summary error.',
          S.table(['Where', 'Log folder'], [('Arc-enabled server', 'GuestConfig\\extension_logs'), ('Azure VM', 'WindowsAzure\\Logs\\Plugins'), ('Arc agent', 'AzureConnectedMachineAgent')], title='Extension log folders', col_widths=[0.4, 0.6]),
          caption='Extension logs on the machine explain failures that the portal only summarizes.')

    b.add('7.2', 'Azure VM Agent',
          'The in-guest Windows Azure Guest Agent that carries out extension installs and other platform requests; if its service is stopped or the agent is not Ready, extensions fail or stay in a transitioning state.',
          'diagnose why no extension can be installed on a VM because the in-guest component does not answer',
          ['Azure Connected Machine agent', 'Azure Monitor Agent', 'Custom Script Extension'],
          'Agent not READY means extensions cannot run — check the WindowsAzureGuestAgent service.',
          S.steps([('Extension requested', 'from the portal'), ('VM Agent receives it', 'must be Ready'), ('Extension installs', 'or fails if not')], title='Guest agent', tones=['plain', 'blue', 'green']),
          caption='The Azure VM Agent must be running and Ready for extensions to install.')

    b.add('7.2', 'Suspending BitLocker',
          'Suspend-BitLocker temporarily disables the protectors without decrypting the volume, for a set number of restarts, so a firmware or boot configuration change does not trigger a recovery prompt.',
          'avoid a recovery key prompt after a firmware update by pausing protection for one restart',
          ['TPM and PIN startup protector', 'BitLocker Network Unlock', 'BitLocker recovery key backup to AD DS'],
          'PAUSES protection for a few restarts — the volume is not decrypted.',
          S.terminal(['Suspend-BitLocker -MountPoint C: -RebootCount 1', 'manage-bde -status C:', 'Protection Status:    Protection Off', 'Resume-BitLocker -MountPoint C:'], title='Windows PowerShell'),
          caption='Suspend-BitLocker pauses protection for a set number of restarts without decrypting.')

    b.add('7.2', 'Key Vault prerequisites for disk encryption',
          'Azure Disk Encryption needs a key vault in the same region and subscription as the VM that is enabled for disk encryption and grants the service access; a vault missing these settings makes the encryption extension fail.',
          'fix a failed disk encryption extension on an Azure VM because the key vault is not set up for it',
          ['Azure Disk Encryption', 'Encryption at host', 'Managed identity for Arc-enabled servers'],
          'Same REGION and subscription, and the vault must be ENABLED for disk encryption.',
          S.facts([('Region', 'same as the VM'), ('Subscription', 'same as the VM'), ('Setting', 'enabled for disk encryption'), ('Access', 'granted to the service')], title='Key vault requirements'),
          caption='Azure Disk Encryption needs a vault in the VM\'s region and subscription that is enabled for it.')

    b.add('7.2', 'Repair-Volume',
          'The PowerShell equivalent of chkdsk that scans a volume for file system errors online with -Scan and repairs them with -SpotFix or -OfflineScanAndFix, taking the volume offline only briefly.',
          'scan a data volume for file system errors while it stays online and fix them with a short outage',
          ['Get-PhysicalDisk', 'Repair-VirtualDisk', 'DISM and SFC repair'],
          '-Scan online, then -SpotFix for a brief offline repair.',
          S.terminal(['Repair-Volume -DriveLetter D -Scan', 'ScanOnly: errors found', 'Repair-Volume -DriveLetter D -SpotFix', 'NoErrorsFound'], title='Windows PowerShell'),
          caption='Repair-Volume scans a volume online and repairs errors with a short outage.')

    b.add('7.2', 'Get-PhysicalDisk',
          'A cmdlet that lists physical disks with their HealthStatus and OperationalStatus, showing whether a pool member is Healthy, Warning, or Unhealthy and whether it is retired or lost communication.',
          'see which drive in a storage pool reports a warning or failed state',
          ['Repair-Volume', 'Repair-VirtualDisk', 'Get-VirtualDisk'],
          'HealthStatus and OperationalStatus identify the BAD disk before you replace it.',
          S.terminal(['Get-PhysicalDisk | Select FriendlyName, HealthStatus', 'FriendlyName   HealthStatus', 'PhysicalDisk1   Healthy', 'PhysicalDisk2   Warning'], title='Windows PowerShell'),
          caption='Get-PhysicalDisk shows the health and operational status of each physical disk.')

    b.add('7.2', 'Repair-VirtualDisk',
          'A cmdlet that rebuilds a Storage Spaces virtual disk\'s resiliency after a failed disk is replaced, with progress visible through Get-StorageJob.',
          'rebuild redundancy for a storage space after swapping in a replacement drive',
          ['Repair-Volume', 'Get-PhysicalDisk', 'Resize-VHD'],
          'REBUILDS resiliency after you replace the disk — watch it with Get-StorageJob.',
          S.steps([('Disk fails', 'space degraded'), ('Replace and add', 'to the pool'), ('Repair-VirtualDisk', 'resiliency rebuilt')], title='Rebuilding a space', tones=['red', 'plain', 'green']),
          caption='Repair-VirtualDisk rebuilds resiliency after a failed disk is replaced.')

    b.add('7.2', 'pktmon',
          'A built-in command-line packet capture and drop-counting tool that traces packets through the networking stack and can convert its capture to a format Wireshark opens, with no extra software installed.',
          'capture network traffic on a server with a tool that is already installed',
          ['Test-NetConnection', 'Resolve-DnsName', 'Performance Monitor'],
          'BUILT IN to Windows — start, stop, then convert the capture for analysis.',
          S.terminal(['pktmon start --capture', 'pktmon stop', 'pktmon etl2pcap PktMon.etl', 'Converted to PktMon.pcapng'], title='Command Prompt'),
          caption='pktmon captures and counts packets using only tools built into Windows.')

    b.add('7.2', 'Azure Network Watcher',
          'An Azure service of network diagnostic tools: IP flow verify names the NSG rule that allows or denies a packet, next hop shows where traffic is routed, and connection troubleshoot tests reachability between endpoints.',
          'find out which network security group rule is blocking traffic to an Azure VM',
          ['Network security groups (NSGs)', 'Azure Load Balancer', 'Azure Firewall'],
          'IP FLOW VERIFY names the exact NSG rule; NEXT HOP shows the route.',
          S.hub(('Network Watcher',), [('IP flow verify', 'which NSG rule'), ('Next hop', 'where it routes'), ('Connection test', 'is it reachable')], title='Network Watcher tools'),
          caption='Network Watcher diagnoses NSG rules, routes, and reachability in Azure.')

    # ------------------------------------------------------------------------------------------ 7.3
    b.add('7.3', 'Enabling the AD Recycle Bin',
          'Turning on the Recycle Bin optional feature with Enable-ADOptionalFeature, which needs forest functional level 2008 R2 and cannot be undone, so deleted objects keep all their attributes and can be restored intact during the deleted object lifetime.',
          'prepare the forest so deleted objects can later be restored with all of their attributes and group memberships',
          ['Authoritative restore', 'Tombstone lifetime and lingering objects', 'System state backup'],
          'IRREVERSIBLE and forest-wide — enable it BEFORE you need it.',
          S.steps([('Raise functional level', '2008 R2 or higher'), ('Enable the feature', 'one-way, forest-wide'), ('Deleted objects kept', 'restorable intact')], title='Recycle Bin', tones=['blue', 'amber', 'green']),
          caption='The AD Recycle Bin must be enabled in advance; it is irreversible.')

    b.add('7.3', 'Tombstone lifetime and lingering objects',
          'A deleted object is kept as a tombstone for a period, 180 days by default, so deletions replicate; a domain controller offline longer than that must not be reconnected, because it can reintroduce deleted objects called lingering objects.',
          'decide what to do with a domain controller that was offline longer than deletions are kept for replication',
          ['Metadata cleanup', 'Non-authoritative restore', 'USN rollback'],
          'Offline LONGER than the tombstone lifetime? Do not reconnect it — rebuild it.',
          S.steps([('DC offline too long', 'beyond the lifetime'), ('Reconnected', 'old objects return'), ('Lingering objects', 'cleanup needed')], title='Lingering objects', tones=['amber', 'red', 'plain']),
          caption='A DC offline past the tombstone lifetime can reintroduce deleted objects.')

    b.add('7.3', 'Authoritative restore',
          'Restoring AD objects from backup in DSRM and then using ntdsutil to mark them authoritative, which raises their version numbers so they replicate out and overwrite the newer, deleted state on every other domain controller.',
          'bring back a deleted OU from backup and make the restored data overwrite the other domain controllers',
          ['Non-authoritative restore', 'Enabling the AD Recycle Bin', 'Authoritative DFSR SYSVOL restore'],
          'The restored data WINS and replicates out — a non-authoritative restore receives data instead.',
          S.steps([('Restore in DSRM', 'from system state'), ('Mark it authoritative', 'ntdsutil'), ('Replicates outward', 'overwrites other DCs')], title='Authoritative restore', tones=['plain', 'blue', 'green']),
          caption='An authoritative restore makes restored objects overwrite the copies on other DCs.')

    b.add('7.3', 'Non-authoritative restore',
          'The default restore of a domain controller from backup, after which replication from partners brings it up to date; changes made since the backup are received from other controllers rather than overwritten.',
          'restore a failed domain controller from backup and let the other controllers bring it up to date',
          ['Authoritative restore', 'Seizing FSMO roles', 'Domain controller cloning'],
          'The restored DC CATCHES UP from partners — it does not push anything out.',
          S.steps([('Restore from backup', 'domain controller back'), ('Reconnect to network', 'normal boot'), ('Replication catches up', 'receives newer changes')], title='Non-authoritative restore', tones=['plain', 'blue', 'green']),
          caption='A non-authoritative restore returns a DC to a past state and replication updates it.')

    b.add('7.3', 'System state backup',
          'A backup type, made with wbadmin start systemstatebackup, that includes the AD DS database, SYSVOL, the registry, and boot files of a domain controller, and is the basis for restoring Active Directory.',
          'back up the directory database, SYSVOL, and registry of a domain controller together',
          ['Authoritative restore', 'Install from Media (IFM)', 'Azure file share snapshots'],
          'AD database + SYSVOL + registry in ONE backup — what a DC restore needs.',
          S.terminal(['wbadmin start systemstatebackup -backupTarget:E:', 'Creating a shadow copy of the volumes...', 'Backup of the system state completed successfully'], title='Command Prompt'),
          caption='A system state backup captures the AD database, SYSVOL, and registry of a domain controller.')

    b.add('7.3', 'Authoritative DFSR SYSVOL restore',
          'Making one domain controller\'s SYSVOL the authoritative source by setting msDFSR-Options to 1 on its replication subscription, with other controllers set to non-authoritative, so its contents replace the copies elsewhere.',
          'make one domain controller\'s Group Policy files overwrite the copies on every other controller after a folder was deleted',
          ['SYSVOL recovery', 'Authoritative restore', 'SYSVOL replication with DFS Replication'],
          'One DC is made the SOURCE; all the others take their copy from it.',
          S.compare(('Authoritative DC', ['msDFSR-Options set to 1', 'Its SYSVOL is the source', 'Replicates outward']), ('Other DCs', ['Set non-authoritative', 'Copy from the source', 'Local changes replaced']), title='Authoritative SYSVOL'),
          caption='An authoritative DFSR SYSVOL restore makes one controller\'s SYSVOL the source for the others.')

    b.add('7.3', 'Checking replication with repadmin',
          'repadmin /replsummary shows replication results and the largest delta for every domain controller, and repadmin /showrepl lists each inbound connection with its last attempt and error code.',
          'get a one-screen summary of which domain controllers are failing to replicate and for how long',
          ['Forcing replication with repadmin', 'dcdiag', 'Common replication errors'],
          '/replsummary for the OVERVIEW, /showrepl for the per-connection DETAIL and errors.',
          S.terminal(['repadmin /replsummary', 'Source DSA     largest delta    fails/total', 'DC1                  02m:11s      0 / 5', 'DC2                  38h:12m      4 / 5'], title='Command Prompt'),
          caption='repadmin /replsummary shows replication results and the largest delta per controller.')

    b.add('7.3', 'Forcing replication with repadmin',
          'repadmin /syncall /AdeP synchronizes every partition across all sites and pushes changes out, and repadmin /kcc makes a domain controller recalculate its replication topology.',
          'push pending directory changes out to every domain controller in every site now',
          ['Checking replication with repadmin', 'dcdiag', 'Change notification between sites'],
          '/syncall /AdeP pushes to ALL partners in ALL sites — /kcc rebuilds the topology.',
          S.steps([('Change made on DC1', 'pending'), ('Run /syncall /AdeP', 'forces replication'), ('All DCs updated', 'every site')], title='Forcing replication', tones=['plain', 'blue', 'green']),
          caption='repadmin /syncall /AdeP forces replication of all partitions across sites.')

    b.add('7.3', 'dcdiag',
          'A diagnostic tool that runs health tests on a domain controller covering connectivity, DNS, replication, services, and FSMO roles; /test:dns and /e extend it to DNS specifics or all controllers.',
          'run a suite of health tests on a domain controller that cover DNS, replication, and required services',
          ['Checking replication with repadmin', 'nltest', 'Reliability Monitor'],
          'One tool, many TESTS — add /test:dns for name resolution and /e for every DC.',
          S.hub(('dcdiag',), [('Connectivity', 'DC reachable'), ('DNS', '/test:dns'), ('Replications', 'inbound health')], title='dcdiag tests'),
          caption='dcdiag runs health tests on domain controllers, including connectivity, DNS, and replication.')

    b.add('7.3', 'Common replication errors',
          'Frequently seen replication errors: 1722 means the RPC server is unavailable (network or name resolution), 8453 means replication access was denied (permissions or time), and 8524 means a DNS lookup failure prevented the operation.',
          'interpret the error code that says a domain controller\'s DNS lookup failed during replication',
          ['Checking replication with repadmin', 'Kerberos clock skew', 'Tombstone lifetime and lingering objects'],
          '1722 RPC down, 8453 access denied, 8524 DNS lookup failure.',
          S.table(['Error', 'Meaning'], [('1722', 'RPC server unavailable'), ('8453', 'replication access denied'), ('8524', 'DNS lookup failure')], title='Replication errors', col_widths=[0.25, 0.75]),
          caption='Errors 1722, 8453, and 8524 point to network, permission, and DNS problems.')

    b.add('7.3', 'Duplicate SPNs',
          'When two accounts hold the same service principal name, Kerberos cannot choose a ticket target, so authentication fails or falls back to NTLM; setspn -X finds duplicates and setspn -D removes the wrong one.',
          'fix a service whose Kerberos sign-in fails because two accounts claim the same service name',
          ['Kerberoasting', 'Kerberos clock skew', 'Test-ComputerSecureChannel'],
          'setspn -X FINDS duplicates; delete the extra with -D.',
          S.terminal(['setspn -X', 'Processing forest DC=contoso,DC=com', 'MSSQLSvc/sql01.contoso.com is registered on:', '   CN=svc-sql  CN=svc-sql-old'], title='Command Prompt'),
          caption='Duplicate SPNs break Kerberos authentication; setspn -X finds them.')

    b.add('7.3', 'klist',
          'A command that lists the Kerberos tickets cached for a session, and klist purge clears them, so you can test authentication with fresh tickets or confirm whether a recent group membership change has taken effect.',
          'view and clear cached Kerberos tickets to test a fresh sign-in after a group membership change',
          ['setspn', 'nltest', 'gpresult'],
          'PURGE forces new tickets — needed after a group change, until logoff.',
          S.terminal(['klist', 'Cached Tickets: (3)', '#0>  Client: ana @ CONTOSO.COM', '     Server: krbtgt/CONTOSO.COM @ CONTOSO.COM'], title='Command Prompt'),
          caption='klist shows cached Kerberos tickets and klist purge clears them.')

    b.add('7.3', 'Test-ComputerSecureChannel',
          'A cmdlet run on a domain member that verifies the secure channel with its domain, and with -Repair resets the machine account password so a "trust relationship failed" error can be fixed without rejoining the domain.',
          'fix a domain-joined server that says it cannot authenticate, without removing it from the domain',
          ['Duplicate SPNs', 'klist', 'Restoring objects from AD Recycle Bin'],
          '-Repair resets the MACHINE account password — it avoids unjoining and rejoining.',
          S.terminal(['Test-ComputerSecureChannel -Repair -Credential contoso\\admin', 'True'], title='Windows PowerShell'),
          caption='Test-ComputerSecureChannel -Repair resets a broken machine account trust.')

    b.add('7.3', 'Booting a domain controller into DSRM',
          'Starting a domain controller in Directory Services Restore Mode, with bcdedit /set safeboot dsrepair and a restart, so AD DS is offline for restores and repairs; bcdedit /deletevalue safeboot returns it to normal boot.',
          'start a domain controller with its directory service offline so a restore can be performed',
          ['DSRM password management', 'Non-authoritative restore', 'Install from Media (IFM)'],
          'bcdedit sets the boot flag — remember to DELETE it afterward or the DC keeps booting into DSRM.',
          S.terminal(['bcdedit /set safeboot dsrepair', 'shutdown /r /t 0', '(restore work in DSRM)', 'bcdedit /deletevalue safeboot'], title='Command Prompt'),
          caption='bcdedit /set safeboot dsrepair makes a DC boot into DSRM on the next restart.')

    b.add('7.3', 'DSRM password management',
          'The DSRM administrator password is set per domain controller and used only in Directory Services Restore Mode; ntdsutil "set dsrm password" resets it, and it can be synchronized with a domain account.',
          'reset the offline recovery administrator password on a domain controller whose password is unknown',
          ['Booting a domain controller into DSRM', 'Windows LAPS (Local Administrator Password Solution)', 'Retrieving a LAPS password'],
          'A LOCAL password per DC — unrelated to Domain Admins, and often forgotten.',
          S.steps([('Open ntdsutil', 'set dsrm password'), ('Reset or sync', 'new value or domain account'), ('Store it safely', 'needed during recovery')], title='DSRM password', tones=['plain', 'blue', 'green']),
          caption='The DSRM password is local to each DC and is reset with ntdsutil.')

    b.add('7.3', 'Metadata cleanup',
          'Removing the leftover directory entries of a domain controller that failed permanently and could not be demoted, by deleting its computer object in Active Directory Users and Computers or by using ntdsutil; it also removes DNS records and cleans FSMO references.',
          'remove the leftover entries of a domain controller that failed permanently and cannot be demoted',
          ['Demoting a domain controller', 'Seizing FSMO roles', 'Tombstone lifetime and lingering objects'],
          'For DEAD controllers; demotion is for live ones. Seize any roles it held first.',
          S.steps([('DC fails for good', 'cannot demote'), ('Delete DC object', 'ADUC or ntdsutil'), ('Entries removed', 'then check DNS records')], title='Metadata cleanup', tones=['red', 'blue', 'green']),
          caption='Metadata cleanup removes the directory entries of a domain controller that cannot be demoted.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Monitoring tools and Azure Monitor in depth', ['7.1'],
              'Build a performance baseline with data collector sets while a server is healthy, then compare counters later: Avg. Disk sec/Read for storage latency (sustained values over about 20 ms are a bottleneck), % Processor Time, and Available MBytes. Resource Monitor shows live per-process activity. Event log subscriptions forward events from many servers to a collector, and custom views save multi-log filters.\n\n'
              'In Azure Monitor, the Azure Monitor Agent collects guest data as directed by data collection rules (the Log Analytics agent is retired). Logs go to a Log Analytics workspace and are queried with KQL, while metrics are lightweight numbers with fast alerts. Alert rules (metric, log search, activity log) trigger action groups that send notifications or run runbooks. System Insights can run a remediation script when a forecast reaches a chosen status.')
    b.section('Troubleshooting Windows Server in depth', ['7.2'],
              'Troubleshoot connectivity bottom-up: link, IP and gateway, name resolution, port, application. Test-NetConnection tests a TCP port, Resolve-DnsName queries a chosen DNS server, and pktmon captures packets with no extra software. In Azure, Network Watcher IP flow verify names the NSG rule that blocks traffic.\n\n'
              'For updates, read Get-WindowsUpdateLog output and repair the component store with DISM before SFC. Kerberos fails when clocks differ by more than five minutes, so configure the forest root PDC emulator with an external NTP source. For extensions, check the logs on the machine (Arc: GuestConfig\\extension_logs; Azure VM: WindowsAzure\\Logs\\Plugins) and confirm the Azure VM Agent is Ready. Suspend BitLocker before firmware changes, and make sure the key vault for Azure Disk Encryption is in the same region and subscription and enabled for disk encryption. For storage, use Get-PhysicalDisk, Repair-Volume, and Repair-VirtualDisk.')
    b.section('Recovering and troubleshooting Active Directory in depth', ['7.3'],
              'Enable the AD Recycle Bin before you need it, because it is irreversible and makes deleted objects restorable with their attributes. A domain controller offline longer than the tombstone lifetime (180 days by default) must not be reconnected, since it can reintroduce lingering objects. Back up with a system state backup (wbadmin), boot a DC into DSRM with bcdedit /set safeboot dsrepair, and know the DSRM password is local and reset with ntdsutil. A non-authoritative restore catches up from partners; an authoritative restore makes the restored objects overwrite other DCs; an authoritative DFSR restore does the same for SYSVOL.\n\n'
              'Diagnose with dcdiag, repadmin /replsummary and /showrepl, and force replication with repadmin /syncall /AdeP; remember errors 1722 (RPC unavailable), 8453 (access denied), and 8524 (DNS lookup failure). For authentication, find duplicate SPNs with setspn -X, inspect and purge tickets with klist, and fix a broken machine trust with Test-ComputerSecureChannel -Repair. Use metadata cleanup for domain controllers that failed permanently, and demotion for live ones.')
