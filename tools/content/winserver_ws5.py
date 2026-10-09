"""AZ-802, domain ws5 (Manage storage and file services): Azure Files, Windows Server file shares, Windows Server storage."""
import svg as S

DOMAIN = 'ws5'


def build(b):
    b.topics['5.1'] = ['Protocols and tiers', 'Redundancy, snapshots, soft delete', 'Roles, SAS, TCP 445', 'Sync groups and agents', 'Free space policy', 'Data Box, SMS, Robocopy, AzCopy']
    b.topics['5.2'] = ['Access-based enumeration', 'Quotas, screens, reports', 'DFS Namespaces and Replication', 'SMB encryption and signing', 'Multichannel and SOFS', 'Effective Access']
    b.topics['5.3'] = ['MBR and GPT', 'Pools and resiliency', 'S2D design', 'Storage Replica modes', 'Dedup usage types', 'ReFS integrity', 'MPIO and CHAP', 'BitLocker protectors and escrow']

    # ------------------------------------------------------------------------------------------ 5.1
    b.add('5.1', 'Azure Files protocols (SMB and NFS)',
          'Azure file shares can be mounted with SMB 3.x from Windows, Linux, and macOS, or with NFS 4.1 from Linux on premium shares, and can also be reached through the REST API.',
          'mount a cloud file share from Linux servers with a native network file system protocol',
          ['Azure Blob Storage', 'Azure File Sync cloud tiering', 'Azure NetApp Files'],
          'SMB for Windows (and others), NFS for Linux on PREMIUM shares.',
          S.compare(('SMB', ['Windows, Linux, macOS', 'Identity-based access', 'TCP port 445']), ('NFS 4.1', ['Linux workloads', 'Premium shares only', 'No SMB sign-in model']), title='Azure Files protocols'),
          caption='Azure Files supports SMB 3.x broadly and NFS 4.1 on premium shares.')

    b.add('5.1', 'Azure Files tiers',
          'Premium shares use SSD storage for low latency, while standard shares on HDD storage come in transaction optimized, hot, and cool tiers that trade storage cost against transaction cost.',
          'match a latency-sensitive database share, a general-purpose share, and a rarely used archive share to storage options',
          ['Azure managed disk types', 'Azure Blob Storage', 'Azure File Sync cloud tiering'],
          'PREMIUM is SSD; the standard tiers are all HDD — cool is cheapest to store, dearest per transaction.',
          S.layers([('Premium', 'SSD, lowest latency', 'red'), ('Transaction optimized', 'HDD, busy shares', 'amber'), ('Hot', 'HDD, general purpose', 'blue'), ('Cool', 'HDD, infrequent access', 'green')], title='Azure Files tiers'),
          caption='Azure Files offers premium SSD shares and standard HDD tiers from transaction optimized to cool.')

    b.add('5.1', 'Azure Files redundancy options',
          'Locally redundant storage keeps three copies in one datacenter, zone-redundant storage spreads them across zones in a region, and geo-redundant or geo-zone-redundant storage also replicates to a paired region; premium shares support only LRS and ZRS.',
          'keep file share data available through the loss of an entire availability zone in the region',
          ['Locally redundant storage only', 'Azure File Sync cloud tiering', 'Soft delete for Azure file shares'],
          'ZRS survives a ZONE loss, GRS survives a REGION loss — premium shares offer LRS and ZRS only.',
          S.table(['Option', 'Survives loss of'], [('LRS', 'a drive or rack'), ('ZRS', 'a whole zone'), ('GRS', 'the primary region'), ('GZRS', 'a zone and the region')], title='Redundancy', col_widths=[0.3, 0.7]),
          caption='LRS, ZRS, GRS, and GZRS protect file shares against progressively larger failures.')

    b.add('5.1', 'Azure file share snapshots',
          'Read-only, point-in-time, incremental copies of a whole share that are stored with it; users can restore earlier versions of files through Previous Versions, and Azure Backup uses them for scheduled protection.',
          'let users recover an earlier version of a file on a cloud share by using the Previous Versions tab',
          ['Soft delete for Azure file shares', 'Azure File Sync cloud tiering', 'Zone-redundant storage'],
          'Per-SHARE, incremental, and read-only — soft delete protects against deleting the SHARE itself.',
          S.steps([('Snapshot taken', 'whole share'), ('File changed or lost', 'later'), ('Restore from snapshot', 'Previous Versions')], title='Share snapshots', tones=['blue', 'amber', 'green']),
          caption='Share snapshots keep read-only, incremental point-in-time copies for file recovery.')

    b.add('5.1', 'Soft delete for Azure file shares',
          'A protection that keeps a deleted file share, with its data and snapshots, for a retention period from 1 to 365 days so it can be undeleted.',
          'recover an entire cloud share that an administrator deleted by mistake',
          ['Azure file share snapshots', 'Azure Backup vault', 'Azure File Sync cloud tiering'],
          'Protects against deleting the SHARE — a snapshot protects individual files.',
          S.steps([('Share deleted', 'by mistake'), ('Held in soft delete', '1 to 365 days'), ('Undeleted', 'data and snapshots back')], title='Soft delete', tones=['red', 'amber', 'green']),
          caption='Soft delete keeps a deleted share for a retention period so it can be restored.')

    b.add('5.1', 'Microsoft Entra Kerberos for Azure Files',
          'An identity option in which Microsoft Entra ID issues the Kerberos tickets, so hybrid and cloud-only users on Entra-joined or hybrid-joined devices can reach an Azure file share without a line of sight to a domain controller; setting Windows ACLs for hybrid identities still needs a client that can reach one, and a storage account can use only one identity source.',
          'let hybrid users on cloud-joined laptops open a cloud file share with Kerberos when they cannot reach a domain controller',
          ['On-premises AD DS authentication', 'Microsoft Entra Domain Services', 'Shared access signature (SAS)'],
          'ACCESS needs no line of sight to a DC — Entra ID issues the tickets — but setting ACLs for hybrid users does.',
          S.steps([('Entra-joined laptop', 'off the corporate LAN'), ('Entra Kerberos ticket', 'for the storage account'), ('Share mounted', 'no DC connection')], title='Entra Kerberos', tones=['plain', 'blue', 'green']),
          caption='Entra Kerberos gives hybrid users access to Azure Files without domain controller connectivity.')

    b.add('5.1', 'Storage File Data SMB Share roles',
          'Azure roles that grant share-level access over SMB: Reader for read, Contributor for read, write, and delete, and Elevated Contributor which can also change NTFS permissions; Windows ACLs then refine access at the file and folder level.',
          'grant a group read-only access to every share in a storage account by using Azure roles',
          ['Shared access signature (SAS)', 'Storage account access key', 'NTFS vs. share permission interaction'],
          'Azure roles set SHARE-level access; NTFS ACLs set FILE-level access on top.',
          S.table(['Role', 'Allows'], [('SMB Share Reader', 'read'), ('SMB Share Contributor', 'read, write, delete'), ('SMB Elevated Contributor', 'plus change NTFS ACLs')], title='Share-level roles', col_widths=[0.5, 0.5]),
          caption='Storage File Data SMB Share roles set share-level access; NTFS ACLs refine it.')

    b.add('5.1', 'Shared access signature (SAS)',
          'A signed URL token that grants limited, time-bound access to storage resources with chosen permissions, so a client can be given access without sharing the storage account key.',
          'give a contractor time-limited, restricted access to a storage resource without sharing the account key',
          ['Storage account access key', 'Storage File Data SMB Share roles', 'Azure Disk Encryption'],
          'Limited and EXPIRING — the account key gives full access to everything.',
          S.facts([('Scope', 'one resource or more'), ('Permissions', 'read, write, list...'), ('Expiry', 'start and end time'), ('Signed with', 'a key or Entra ID')], title='SAS token'),
          caption='A SAS grants limited, time-bound access to storage without sharing the account key.')

    b.add('5.1', 'TCP 445 connectivity for Azure Files',
          'SMB access to Azure Files uses outbound TCP 445, which some ISPs and networks block; test it with Test-NetConnection and use a VPN, ExpressRoute, or a private endpoint when it is blocked.',
          'mount a cloud file share from a home office where the provider blocks the SMB port',
          ['Windows Firewall and connection security rules', 'WinRM ports and listeners', 'SMB over QUIC'],
          'Test-NetConnection -Port 445 — if it fails, use a VPN, ExpressRoute, or private endpoint.',
          S.terminal(['Test-NetConnection mystore.file.core.windows.net -Port 445', 'ComputerName     : mystore.file.core.windows.net', 'RemotePort       : 445', 'TcpTestSucceeded : False'], title='Windows PowerShell'),
          caption='Azure Files over SMB needs outbound TCP 445; test it and use a private path if it is blocked.')

    b.add('5.1', 'Azure File Sync sync group',
          'The set of locations kept in sync: exactly one cloud endpoint (an Azure file share) and one or more server endpoints (folders on registered Windows servers), with changes flowing in every direction.',
          'keep an Azure file share and the folders on two branch file servers synchronized in every direction',
          ['Storage Sync Service', 'Registered server', 'Cloud tiering policy'],
          'ONE cloud endpoint plus any number of server endpoints.',
          S.hub(('Sync group',), [('Cloud endpoint', 'Azure file share'), ('Server endpoint', 'folder on server A'), ('Server endpoint', 'folder on server B')], title='Azure File Sync topology'),
          caption='A sync group has one cloud endpoint and one or more server endpoints.')

    b.add('5.1', 'Storage Sync Service',
          'The top-level Azure resource for Azure File Sync that holds the sync groups and registered servers.',
          'create the Azure resource that will contain sync groups and the servers registered to it',
          ['Azure File Sync sync group', 'Registered server', 'Recovery Services vault'],
          'The CONTAINER for sync groups and registered servers.',
          S.layers([('Storage Sync Service', 'top-level Azure resource', 'primary'), ('Sync group', 'one cloud endpoint', 'blue'), ('Registered server', 'agent installed', 'green')], title='Azure File Sync hierarchy'),
          caption='The Storage Sync Service holds the sync groups and registered servers.')

    b.add('5.1', 'Registered server',
          'A Windows file server that has the Azure File Sync agent installed and is registered with a Storage Sync Service, so it can host server endpoints.',
          'make a file server eligible to host a synchronized folder by installing a software agent and linking it to the cloud resource',
          ['Storage Sync Service', 'Azure File Sync sync group', 'Azure Connected Machine agent'],
          'Agent installed + REGISTERED — then you can add server endpoints on it.',
          S.steps([('Install agent', 'Azure File Sync'), ('Register server', 'with the sync service'), ('Add server endpoint', 'a folder path')], title='Registering a server', tones=['blue', 'plain', 'green']),
          caption='A registered server has the File Sync agent installed and linked to a Storage Sync Service.')

    b.add('5.1', 'Cloud tiering policy',
          'Settings that decide which files become cloud-tiered stubs: a volume free space policy keeps a percentage of the server volume free, and a date policy tiers files not accessed for a number of days.',
          'keep at least 20 percent free space on a server volume by moving the coldest files to Azure automatically',
          ['Azure File Sync sync group', 'Storage tiering', 'Data Deduplication'],
          'FREE SPACE policy keeps a percentage empty; DATE policy tiers old files.',
          S.compare(('Volume free space', ['Keep a percentage free', 'Coldest files tier first', 'Protects the server']), ('Date policy', ['Tier after N days idle', 'Based on last access', 'Predictable rule']), title='Tiering policies'),
          caption='Cloud tiering policies use free space or file age to choose which files become stubs.')

    b.add('5.1', 'Azure Data Box',
          'A Microsoft shipping appliance that is loaded with data on premises and sent to an Azure datacenter, used to seed large data sets, such as an initial Azure Files or File Sync upload, when bandwidth is too low.',
          'move tens of terabytes of existing file server data to Azure when the internet link would take months',
          ['AzCopy', 'Robocopy for file migration', 'Storage Migration Service'],
          'Ships the data PHYSICALLY — use it when bandwidth is the bottleneck.',
          S.steps([('Copy data', 'to the appliance'), ('Ship to Azure', 'carrier'), ('Imported', 'to the storage account')], title='Offline data transfer', tones=['plain', 'blue', 'green']),
          caption='Data Box ships large datasets to Azure when network upload is too slow.')

    b.add('5.1', 'Storage Migration Service',
          'A Windows Server feature, driven from Windows Admin Center, that inventories a source file server, transfers its data and shares to a newer server or an Azure VM, and cuts over so users keep the old name and address.',
          'move a legacy file server\'s data and shares to a new server and have the new one take over the old identity',
          ['Robocopy for file migration', 'AzCopy', 'Azure Data Box'],
          'INVENTORY, TRANSFER, CUT OVER — the new server takes over the old name and IP.',
          S.steps([('Inventory', 'source server'), ('Transfer', 'data and shares'), ('Cut over', 'new server takes the name')], title='Storage Migration Service', tones=['blue', 'plain', 'green']),
          caption='Storage Migration Service inventories, transfers, and cuts over a file server.')

    b.add('5.1', 'Robocopy for file migration',
          'A command-line copy tool that preserves timestamps, security descriptors, and attributes when moving files, usually with options such as /MIR, /COPYALL, and /R and /W for retries.',
          'copy a large folder tree to a new server while keeping the permissions and timestamps intact',
          ['AzCopy', 'Storage Migration Service', 'Azure Data Box'],
          '/COPYALL keeps the ACLs; /MIR mirrors the tree (and DELETES extras at the destination).',
          S.terminal(['robocopy D:\\Shares \\\\newsrv\\Shares /MIR /COPYALL /R:2 /W:5', 'Total    Copied   Skipped  Mismatch  FAILED', 'Files :  18420    18420        0         0       0'], title='Command Prompt'),
          caption='Robocopy with /MIR and /COPYALL copies a tree and preserves permissions and timestamps.')

    b.add('5.1', 'AzCopy',
          'A command-line utility optimized for copying data to and from Azure Storage, including Azure Files, with resumable transfers and options to preserve SMB permissions.',
          'upload a large folder to an Azure file share with a resumable command-line tool built for Azure Storage',
          ['Robocopy for file migration', 'Storage Migration Service', 'Azure Data Box'],
          'Built for AZURE Storage — resumable, and it can preserve SMB permissions.',
          S.steps([('Local files', 'on the server'), ('azcopy copy', 'resumable upload'), ('Azure file share', 'permissions preserved')], title='AzCopy', tones=['plain', 'blue', 'green']),
          caption='AzCopy uploads data to Azure Storage with resumable transfers and optional permission preservation.')

    # ------------------------------------------------------------------------------------------ 5.2
    b.add('5.2', 'Access-based enumeration',
          'A share setting that shows users only the files and folders they have permission to access, which hides the rest from the listing.',
          'hide folders from users who do not have permission to open them when they browse a share',
          ['File screens', 'Hard and soft quotas', 'Offline files'],
          'Hides what you cannot open — it improves tidiness, not security by itself.',
          S.compare(('Without it', ['All folders listed', 'Access denied on open', 'Clutter and curiosity']), ('With it', ['Only permitted items', 'Others invisible', 'Cleaner browsing']), title='Access-based enumeration'),
          caption='Access-based enumeration lists only the items a user is allowed to open.')

    b.add('5.2', 'Hard and soft quotas',
          'FSRM quotas limit a folder\'s size, with a hard quota blocking writes past the limit and a soft quota only reporting it; thresholds can email users or run actions, and templates apply the same quota to many folders.',
          'stop a department\'s folder from growing beyond its limit',
          ['File screens', 'FSRM storage reports', 'Data Deduplication'],
          'HARD blocks writes at the limit; SOFT only notifies.',
          S.table(['Quota', 'At the limit'], [('Hard', 'blocks further writes'), ('Soft', 'logs or notifies only')], title='FSRM quotas', col_widths=[0.35, 0.65]),
          caption='A hard quota blocks writes at its limit; a soft quota only monitors.')

    b.add('5.2', 'File screens',
          'FSRM rules that block, or in passive mode only log, saving certain file types such as audio or executables, based on file groups.',
          'prevent users from saving music files to a shared department folder',
          ['Hard and soft quotas', 'Access-based enumeration', 'File classification and management tasks'],
          'BLOCKS file TYPES by file group — active screening denies, passive just logs.',
          S.steps([('User saves .mp3', 'to the share'), ('File screen checks', 'audio file group'), ('Save blocked', 'event logged or emailed')], title='File screening', tones=['plain', 'blue', 'red']),
          caption='File screens stop users from saving blocked file types to a folder.')

    b.add('5.2', 'FSRM storage reports',
          'Scheduled or on-demand reports from File Server Resource Manager that list duplicate files, large files, files by owner or type, and least recently accessed files.',
          'find out which users store the largest and duplicate files on a share',
          ['Hard and soft quotas', 'File screens', 'Data Deduplication'],
          'REPORTS show where the space went — duplicates, large files, and stale files.',
          S.hub(('Storage reports',), [('Large files', 'biggest consumers'), ('Duplicate files', 'wasted space'), ('Least accessed', 'archive candidates')], title='FSRM reports'),
          caption='FSRM storage reports identify large, duplicate, and rarely used files.')

    b.add('5.2', 'File classification and management tasks',
          'FSRM can tag files with classification properties through rules, for example finding card numbers, and then run file management tasks that expire, move, or encrypt files based on those properties.',
          'automatically label files that contain credit card numbers and move aging ones to an archive',
          ['File screens', 'FSRM storage reports', 'Hard and soft quotas'],
          'CLASSIFY first, then act — rules set properties, tasks move or expire files.',
          S.steps([('Classification rule', 'finds the pattern'), ('Property set', 'for example Confidential'), ('Management task', 'expire or move')], title='Classification', tones=['blue', 'plain', 'green']),
          caption='FSRM classification rules tag files and management tasks act on those tags.')

    b.add('5.2', 'DFS Namespaces',
          'A virtual folder tree that presents shares from many servers under one stable path, such as \\\\contoso.com\\Files, with namespace servers and folder targets; domain-based namespaces live in AD and standalone ones on a single server or cluster.',
          'present shares from several file servers under one path that does not change when a server is replaced',
          ['DFS Replication', 'Storage Migration Service', 'Azure File Sync sync group'],
          'One PATH in front of many servers — it does not copy data; DFS Replication does.',
          S.hub(('\\\\contoso.com\\Files',), [('Folder target 1', '\\\\FS1\\Sales'), ('Folder target 2', '\\\\FS2\\Sales'), ('Folder target 3', '\\\\FS3\\HR')], title='Namespace'),
          caption='DFS Namespaces give shares from many servers one stable path.')

    b.add('5.2', 'DFS Replication',
          'A multi-master engine that keeps folders synchronized between servers using remote differential compression so only changed blocks cross the network, with schedules, throttling, a staging folder, and conflict resolution where the last writer wins.',
          'keep a folder synchronized between on-premises file servers at two sites with bandwidth-friendly updates',
          ['DFS Namespaces', 'Storage Replica', 'Azure File Sync sync group'],
          'Only CHANGED BLOCKS cross the link — the last writer wins a conflict.',
          S.steps([('Change on server A', 'file edited'), ('Block-level delta', 'compressed'), ('Applied on server B', 'conflicts: last writer')], title='DFS Replication', tones=['plain', 'blue', 'green']),
          caption='DFS Replication synchronizes folders between servers using block-level differences.')

    b.add('5.2', 'DFS referral ordering',
          'The order in which a namespace server hands clients the folder targets: lowest cost puts targets in the client\'s own site first, and you can also exclude targets outside the client\'s site.',
          'make clients use the file server in their own office first and fall back to others only if it is down',
          ['DFS Replication', 'DFS Namespaces', 'SMB Multichannel'],
          'SITE COSTING decides which target a client gets first.',
          S.table(['Order', 'Clients get'], [('Lowest cost', 'own site, then nearest'), ('Random order', 'any target equally'), ('Exclude outside site', 'only same-site targets')], title='Referral ordering', col_widths=[0.4, 0.6]),
          caption='Referral ordering decides which folder target a DFS client is offered first.')

    b.add('5.2', 'SMB encryption',
          'Encrypts SMB traffic end to end with AES, enabled per share with Set-SmbShare -EncryptData or for the whole server, so file data is protected on untrusted networks without a VPN.',
          'protect file data on an untrusted network by encrypting it between clients and one specific share',
          ['SMB signing', 'SMB over QUIC', 'BitLocker Drive Encryption'],
          'Secrecy of data IN TRANSIT — signing only proves it was not altered.',
          S.compare(('SMB encryption', ['Confidentiality', 'AES in transit', 'Per share or server']), ('SMB signing', ['Integrity only', 'Detects tampering', 'Data stays readable']), title='Encryption vs. signing'),
          caption='SMB encryption hides file data in transit; signing only detects tampering.')

    b.add('5.2', 'SMB signing',
          'A digital signature on each SMB message that lets the receiver verify it came from the expected party and was not altered in transit, preventing relay and tampering attacks; it does not hide the data.',
          'verify that file-sharing messages were not altered in transit by an on-path attacker, without hiding the data',
          ['SMB encryption', 'SMB over QUIC', 'SMB Direct (SMB over RDMA)'],
          'INTEGRITY, not secrecy — require it to stop relay attacks.',
          S.steps([('Message signed', 'sender key'), ('Sent over network', 'readable but sealed'), ('Signature checked', 'altered messages fail')], title='SMB signing', tones=['blue', 'plain', 'green']),
          caption='SMB signing proves messages are unaltered, but does not encrypt them.')

    b.add('5.2', 'SMB Multichannel',
          'Uses several network connections between an SMB client and server at once, detected automatically, for more throughput and resilience if one path fails, when multiple NICs or RSS-capable NICs are present.',
          'use two network cards between a client and a file server for more throughput and resilience without configuring teaming',
          ['SMB Direct (SMB over RDMA)', 'Switch Embedded Teaming (SET)', 'Storage QoS'],
          'Automatic MULTIPLE connections — throughput plus failover without NIC teaming.',
          S.flow_split(('SMB client',), [('NIC 1 path', 'connection A'), ('NIC 2 path', 'connection B')], title='SMB Multichannel', tones=['blue', 'blue']),
          caption='SMB Multichannel spreads one SMB session across several network paths.')

    b.add('5.2', 'Continuously available file shares',
          'Shares on a failover cluster with SMB Transparent Failover, so clients keep their open handles and work without interruption when the cluster moves the share to another node.',
          'let clients keep their open files without interruption when a clustered file server fails over',
          ['Scale-Out File Server (SOFS)', 'DFS Replication', 'Storage Replica'],
          'Open handles SURVIVE a node failover — transparent to the client.',
          S.steps([('Client has file open', 'on node 1'), ('Node 1 fails', 'cluster moves share'), ('Client continues', 'on node 2, no error')], title='Transparent failover', tones=['plain', 'amber', 'green']),
          caption='Continuously available shares keep client handles open through a cluster failover.')

    b.add('5.2', 'Scale-Out File Server (SOFS)',
          'An active-active clustered file server role that serves application data such as Hyper-V and SQL Server over continuously available SMB shares on Cluster Shared Volumes, with every node accepting client connections.',
          'serve Hyper-V virtual disks from a cluster in which every node accepts client connections at the same time',
          ['Continuously available file shares', 'DFS Namespaces', 'Storage Spaces Direct'],
          'ACTIVE-ACTIVE for APPLICATION data — not for general user file shares.',
          S.compare(('Scale-Out File Server', ['Active-active nodes', 'On Cluster Shared Volumes', 'Hyper-V and SQL data']), ('General-use file server', ['Active-passive', 'User documents', 'One node owns the share']), title='Two clustered file server types'),
          caption='A Scale-Out File Server is active-active and meant for application workloads.')

    b.add('5.2', 'Effective Access tool',
          'A tab in a folder\'s advanced security settings that calculates what a chosen user or group can actually do after combining share permissions, NTFS permissions, and group memberships.',
          'check what a particular user can really do on a folder once all permissions and group memberships combine',
          ['Access-based enumeration', 'NTFS vs. share permission interaction', 'Group Policy Results'],
          'CALCULATES the result — you pick the user and read the answer.',
          S.steps([('Select the user', 'or group'), ('Tool evaluates', 'NTFS, share, groups'), ('Effective rights shown', 'allowed and denied')], title='Effective Access', tones=['plain', 'blue', 'green']),
          caption='The Effective Access tool calculates a user\'s real permissions on a folder.')

    b.add('5.2', 'Administrative shares',
          'Hidden shares created automatically, such as C$ for each volume, ADMIN$ for the Windows folder, and IPC$ for named pipes, that administrators use for remote management and are not listed when browsing.',
          'reach a server\'s system volume remotely through a default hidden share that browsing does not display',
          ['Access-based enumeration', 'SMB share settings and management', 'Remote Desktop access configuration'],
          'A trailing DOLLAR sign hides a share — C$, ADMIN$, and IPC$ exist by default.',
          S.table(['Share', 'Points to'], [('C$', 'the C: volume'), ('ADMIN$', 'the Windows folder'), ('IPC$', 'named pipes for remoting')], title='Default hidden shares', col_widths=[0.3, 0.7]),
          caption='Administrative shares such as C$ and ADMIN$ exist by default for remote management.')

    b.add('5.2', 'Disabling SMB 1.0',
          'Removing the legacy SMB 1.0 protocol, which lacks modern security protections and is exploited by wormable attacks; current Windows Server versions no longer install it by default.',
          'remove the insecure legacy file sharing protocol that old devices still ask for',
          ['SMB signing', 'SMB encryption', 'SMB over QUIC'],
          'SMB 1.0 has no modern protections — remove the feature, do not just ignore it.',
          S.terminal(['Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol', 'Get-SmbServerConfiguration | Select EnableSMB1Protocol', 'EnableSMB1Protocol', 'False'], title='Windows PowerShell'),
          caption='Disable SMB 1.0, a legacy protocol without modern security protections.')

    # ------------------------------------------------------------------------------------------ 5.3
    b.add('5.3', 'MBR and GPT partition styles',
          'MBR supports disks up to 2 TB with four primary partitions and BIOS boot, while GPT supports much larger disks with many partitions and is required to boot from UEFI.',
          'initialize a new 6 TB data disk so that all of its capacity can be used',
          ['Storage pools', 'NTFS vs. ReFS file systems', 'Thin vs. fixed provisioning'],
          'MBR stops at 2 TB — GPT for big disks and UEFI boot.',
          S.compare(('MBR', ['Up to 2 TB', 'Four primary partitions', 'BIOS boot']), ('GPT', ['Far larger disks', 'Up to 128 partitions', 'UEFI boot']), title='Partition styles'),
          caption='MBR is limited to 2 TB and four primary partitions; GPT supports far larger disks.')

    b.add('5.3', 'Storage pools',
          'A collection of physical disks that Storage Spaces combines into one pool, from which virtual disks are created with chosen resiliency and size.',
          'aggregate several physical drives and carve flexible virtual disks out of them',
          ['MBR and GPT partition styles', 'Storage tiering', 'Thin vs. fixed provisioning'],
          'POOL the disks first, then create virtual disks from the pool.',
          S.steps([('Physical disks', 'added to a pool'), ('Storage pool', 'combined capacity'), ('Virtual disks', 'resiliency chosen')], title='Storage Spaces layers', tones=['plain', 'primary', 'green']),
          caption='Storage Spaces pools physical disks and builds virtual disks from the pool.')

    b.add('5.3', 'Simple space',
          'A Storage Spaces layout that stripes data across disks for speed and full capacity but gives no resiliency, so one failed disk loses the space.',
          'create scratch storage for temporary rendering data that needs maximum speed and capacity but does not need to survive a failure',
          ['Mirror resiliency', 'Parity resiliency', 'Storage tiering'],
          'STRIPING only — fast and full capacity, but no fault tolerance.',
          S.table(['Layout', 'Fault tolerance'], [('Simple', 'none'), ('Two-way mirror', '1 disk'), ('Three-way mirror', '2 disks'), ('Parity', '1 or 2 disks')], title='Space layouts', col_widths=[0.5, 0.5]),
          caption='A simple space stripes data for speed and capacity with no fault tolerance.')

    b.add('5.3', 'Mirror resiliency',
          'A Storage Spaces layout that keeps two or three copies of data, so two-way tolerates one disk failure and three-way tolerates two, with strong write performance at the cost of capacity.',
          'protect busy virtual machine storage against a drive failure while keeping good write performance',
          ['Parity resiliency', 'Simple space', 'Storage tiering'],
          'COPIES of data: great performance, costs capacity — parity is cheaper but slower to write.',
          S.compare(('Two-way mirror', ['Two copies', 'Survives 1 failure', 'Half of raw capacity']), ('Three-way mirror', ['Three copies', 'Survives 2 failures', 'A third of raw capacity']), title='Mirror options'),
          caption='Mirror resiliency stores two or three copies of data for fault tolerance and fast writes.')

    b.add('5.3', 'Parity resiliency',
          'A Storage Spaces layout that stores parity information, like RAID 5 or 6, to use less raw capacity than a mirror while tolerating one or two failures, but with slower writes; suited to archives and backup data.',
          'store archive data efficiently so it survives a drive failure while using the least extra capacity',
          ['Mirror resiliency', 'Simple space', 'Data Deduplication'],
          'Capacity-EFFICIENT but write-SLOW — good for archives, not for VMs.',
          S.steps([('Data split', 'into stripes'), ('Parity calculated', 'single or dual'), ('Disk fails', 'data rebuilt')], title='Parity', tones=['plain', 'blue', 'green']),
          caption='Parity resiliency uses less capacity than a mirror but writes more slowly.')

    b.add('5.3', 'Hyperconverged deployment',
          'A Storage Spaces Direct design in which the same cluster nodes run both the virtual machines and the storage, which keeps the infrastructure small; a converged design separates compute and storage into different clusters.',
          'run virtual machines and their storage on the same set of cluster nodes',
          ['Scale-Out File Server (SOFS)', 'Cluster Shared Volumes (CSV)', 'Storage Replica'],
          'COMPUTE and STORAGE on the same nodes — converged splits them into two clusters.',
          S.compare(('Hyperconverged', ['VMs and storage together', 'One cluster', 'Small footprint']), ('Converged', ['Compute and storage apart', 'Storage cluster serves SMB', 'Scale each independently']), title='S2D designs'),
          caption='Hyperconverged S2D runs VMs and storage on the same nodes.')

    b.add('5.3', 'Storage Spaces Direct cache',
          'S2D automatically uses the fastest drives, such as NVMe, as a cache for slower SSD or HDD capacity drives, binding each cache device to capacity devices without extra configuration.',
          'speed up a cluster that mixes fast NVMe drives with large hard disks without manual tiering rules',
          ['Storage tiering', 'Thin vs. fixed provisioning', 'Storage QoS'],
          'FASTEST drives become the cache automatically — no manual binding.',
          S.layers([('Cache drives', 'NVMe or SSD, read and write', 'red'), ('Capacity drives', 'SSD or HDD, bulk data', 'blue'), ('Automatic binding', 'configured when enabled', 'green')], title='S2D cache'),
          caption='S2D uses its fastest drives as a cache for slower capacity drives.')

    b.add('5.3', 'Synchronous replication',
          'A Storage Replica mode in which a write is acknowledged only after it is committed at both sites, giving zero data loss but needing a fast, low-latency link between the sites, typically under about 5 ms round trip.',
          'replicate volumes between two datacenters with no data loss over a short, fast link',
          ['Asynchronous replication', 'Hyper-V Replica', 'DFS Replication'],
          'Acknowledged at BOTH sites — zero loss, but latency must be low.',
          S.steps([('Write received', 'site A'), ('Copied to site B', 'committed at both'), ('Acknowledged', 'zero data loss')], title='Synchronous replication', tones=['plain', 'blue', 'green']),
          caption='Synchronous replication commits every write at both sites before acknowledging it.')

    b.add('5.3', 'Asynchronous replication',
          'A Storage Replica mode in which a write is acknowledged at the source first and copied afterward, tolerating high latency over long distances but allowing some data loss if the source fails.',
          'replicate data between continents over a high-latency link and accept that the last few seconds could be lost',
          ['Synchronous replication', 'Hyper-V Replica', 'DFS Replication'],
          'Acknowledged at the SOURCE first — works across distance, but can lose recent writes.',
          S.steps([('Write received', 'site A'), ('Acknowledged now', 'source only'), ('Copied later', 'to site B')], title='Asynchronous replication', tones=['plain', 'green', 'amber']),
          caption='Asynchronous replication acknowledges writes first and copies them later, so some loss is possible.')

    b.add('5.3', 'Deduplication usage types',
          'Data Deduplication ships with tuned profiles: general purpose file server, virtual desktop infrastructure, and virtualized backup server, each with different settings for which files to optimize and how aggressively; boot and system volumes are not eligible.',
          'turn on deduplication for a volume that stores virtual desktop disks with settings tuned for that workload',
          ['Storage tiering', 'Thin vs. fixed provisioning', 'ReFS integrity streams'],
          'Choose the PROFILE to match the workload — VDI, backup, or general file server.',
          S.table(['Usage type', 'Tuned for'], [('General purpose', 'user file shares'), ('VDI', 'virtual desktop disks'), ('Backup', 'virtualized backup targets')], title='Deduplication profiles', col_widths=[0.4, 0.6]),
          caption='Deduplication profiles tune the feature for file servers, VDI, or backup targets.')

    b.add('5.3', 'ReFS integrity streams',
          'A ReFS feature that stores checksums for metadata, and optionally data, so corruption is detected; on a mirrored or parity Storage Spaces volume ReFS can repair the damaged data automatically from a good copy.',
          'detect and automatically repair silent data corruption on a mirrored volume',
          ['Data Deduplication', 'BitLocker Drive Encryption', 'Storage tiering'],
          'CHECKSUMS find the corruption; a mirror or parity copy supplies the repair.',
          S.steps([('Read data', 'checksum verified'), ('Mismatch found', 'silent corruption'), ('Repaired', 'from the good mirror copy')], title='ReFS self-healing', tones=['plain', 'amber', 'green']),
          caption='ReFS integrity streams detect corruption and repair it from a good copy on resilient storage.')

    b.add('5.3', 'Multipath I/O (MPIO)',
          'A feature that lets a server use several physical paths to the same storage, such as two iSCSI adapters, for redundancy and load balancing, managed through a device-specific module.',
          'keep a server connected to its storage if one network path or adapter fails, using several paths at once',
          ['iSCSI CHAP authentication', 'SMB Multichannel', 'NIC teaming (host and VM level)'],
          'Several PATHS to the SAME storage — it fails over and balances load.',
          S.flow_split(('Server with MPIO',), [('Path 1', 'adapter and switch A'), ('Path 2', 'adapter and switch B')], title='Multipath I/O', tones=['blue', 'blue']),
          caption='MPIO uses several paths to storage for redundancy and load balancing.')

    b.add('5.3', 'iSCSI CHAP authentication',
          'The Challenge-Handshake Authentication Protocol lets an iSCSI target verify that an initiator knows a shared secret before it can connect, so only authorized servers can attach to a LUN.',
          'make an iSCSI target accept connections only from initiators that prove they know a shared secret',
          ['Multipath I/O (MPIO)', 'iSCSI configuration', 'BitLocker Drive Encryption'],
          'A shared SECRET proves the initiator — IQN filtering alone only trusts a name.',
          S.steps([('Initiator connects', 'presents its IQN'), ('Target challenges', 'CHAP exchange'), ('Secret proven', 'LUN presented')], title='iSCSI CHAP', tones=['plain', 'blue', 'green']),
          caption='CHAP lets an iSCSI target verify an initiator\'s shared secret before connecting.')

    b.add('5.3', 'TPM and PIN startup protector',
          'A BitLocker protector that needs both the TPM to validate the boot state and a PIN typed at startup, protecting against a stolen powered-off machine whose TPM alone would release the key.',
          'require a PIN at startup in addition to a hardware check before the operating system volume is unlocked',
          ['BitLocker Network Unlock', 'BitLocker recovery key backup to AD DS', 'Credential Guard'],
          'TPM checks the machine, the PIN checks the PERSON.',
          S.steps([('TPM validates boot', 'trusted state'), ('PIN typed', 'at startup'), ('Volume unlocked', 'OS starts')], title='TPM and PIN', tones=['blue', 'amber', 'green']),
          caption='A TPM and PIN protector needs both the hardware check and a PIN to unlock the volume.')

    b.add('5.3', 'BitLocker recovery key backup to AD DS',
          'Group Policy can make BitLocker store each volume\'s recovery password in Active Directory under the computer object, where authorized administrators retrieve it, so a locked volume can be recovered.',
          'make sure help desk staff can retrieve a recovery password for any company laptop or server from the directory',
          ['TPM and PIN startup protector', 'BitLocker Network Unlock', 'Windows LAPS (Local Administrator Password Solution)'],
          'ESCROW the password in AD under the computer object — set the policy BEFORE encrypting.',
          S.steps([('Policy enabled', 'store in AD DS'), ('BitLocker turned on', 'password escrowed'), ('Admin retrieves', 'when volume locks')], title='Recovery key escrow', tones=['blue', 'plain', 'green']),
          caption='Group Policy can escrow BitLocker recovery passwords in AD DS for later retrieval.')

    b.add('5.3', 'BitLocker Network Unlock',
          'A feature that automatically unlocks a TPM and PIN protected volume at startup when the machine is on the trusted corporate wired network, using a Windows Deployment Services server, so reboots do not need someone to type a PIN.',
          'avoid typing a PIN on servers that reboot while they are on the corporate network',
          ['TPM and PIN startup protector', 'BitLocker recovery key backup to AD DS', 'Recovering encrypted volumes'],
          'Unlocks automatically on the TRUSTED wired network — off the network, the PIN is required again.',
          S.steps([('Server reboots', 'on corporate LAN'), ('WDS server responds', 'trusted network'), ('Volume unlocks', 'no PIN typed')], title='Network Unlock', tones=['plain', 'blue', 'green']),
          caption='Network Unlock unlocks a PIN-protected volume automatically on the trusted corporate network.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Azure Files in depth', ['5.1'],
              'Azure file shares speak SMB 3.x (outbound TCP 445) and, on premium shares, NFS 4.1. Premium shares use SSDs; standard shares run on HDD in transaction optimized, hot, and cool tiers. Redundancy runs from LRS and ZRS (premium supports only these) to GRS and GZRS for a region loss. Protect data with share snapshots (file recovery through Previous Versions) and soft delete (undelete a whole share, 1 to 365 days). Access uses an identity source (AD DS, Entra Domain Services, or Entra Kerberos for hybrid users) plus Azure roles such as Storage File Data SMB Share Contributor for the share level and NTFS ACLs for files; use a SAS rather than the account key for limited access.\n\n'
              'Azure File Sync uses a Storage Sync Service containing sync groups, each with one cloud endpoint (the Azure file share) and one or more server endpoints on registered servers that have the agent. Cloud tiering uses a volume free space policy and a date policy. To migrate, use Storage Migration Service (inventory, transfer, cut over), Robocopy (/MIR /COPYALL), AzCopy for Azure Storage, or Azure Data Box when bandwidth is the limit.')
    b.section('Windows Server file services in depth', ['5.2'],
              'Share-level features include access-based enumeration (hide what a user cannot open), SMB encryption (confidentiality), SMB signing (integrity only), SMB Multichannel (multiple paths automatically), and disabling SMB 1.0. FSRM adds quotas (hard blocks, soft notifies), file screens (block file types), storage reports, and classification with file management tasks. Use the Effective Access tool to see the real result of share and NTFS permissions.\n\n'
              'DFS Namespaces provide one path in front of many servers (referral ordering uses site costing), and DFS Replication synchronizes folders with block-level differences and last-writer-wins conflicts. Clustered shares can be continuously available (transparent failover), and a Scale-Out File Server is active-active for application data on Cluster Shared Volumes, not for ordinary user file shares.')
    b.section('Windows Server storage in depth', ['5.3'],
              'Use GPT for disks over 2 TB and UEFI boot. Storage Spaces pools disks and offers simple (no resiliency), mirror (two-way tolerates one failure, three-way two), and parity (efficient but slower to write) layouts. Storage Spaces Direct can be hyperconverged (VMs and storage on the same nodes) or converged, and it uses its fastest drives as a cache automatically. Storage Replica replicates synchronously (zero loss, low latency) or asynchronously (distance, possible loss). Data Deduplication has usage types for file servers, VDI, and backup, and ReFS integrity streams detect and repair corruption on resilient storage.\n\n'
              'For iSCSI, MPIO provides multiple paths and CHAP authenticates initiators. BitLocker can combine a TPM with a PIN, escrow recovery passwords in AD DS through Group Policy (set it before encrypting), and use Network Unlock to skip the PIN on the trusted wired network.')
