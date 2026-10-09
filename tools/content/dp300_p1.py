"""DP-300, domain p1 (Plan and Implement Data Platform Resources): hybrid offerings, partitioning, compression, migration."""
import svg as S

DOMAIN = 'p1'
WEIGHT = 18


def build(b):
    b.objective('1.4', 'Hybrid, Arc, and Fabric offerings', ['Azure Arc', 'SQL database in Fabric', 'Hybrid solutions', 'Patching IaaS', 'Declarative deployment'])
    b.objective('1.5', 'Partitioning and compression', ['Table partitioning', 'Partition switching', 'Row and page compression', 'Partition elimination'])
    b.objective('1.6', 'Migration strategy', ['Offline vs online', 'DMS and Log Replay Service', 'Managed Instance link', 'BACPAC', 'Post-migration fixes'])

    # ------------------------------------------------------------------------------------------ 1.4
    b.add('1.4', 'Azure Arc-enabled SQL services',
          'Azure Arc extends Azure management to SQL Server instances that stay outside Azure through an agent, adding inventory, Microsoft Defender for SQL, Microsoft Entra authentication, and best-practices assessment; Arc-enabled SQL Managed Instance runs the managed-instance engine on Kubernetes you operate.',
          'manage and secure on-premises SQL Server instances from the Azure portal without migrating them',
          ['Azure SQL Managed Instance', 'SQL Server on Azure Virtual Machines', 'Azure Database Migration Service'],
          'It gives Azure management to servers that STAY where they are — migrating them into Azure is a different path.',
          S.hub(('Azure Arc', 'manages SQL outside Azure'), [('Inventory', 'instances and versions'), ('Defender for SQL', 'threat protection'), ('Entra authentication', 'central sign-in')]),
          caption='Azure Arc brings Azure inventory, security, and sign-in to SQL Server that stays on-premises.')

    b.add('1.4', 'Azure SQL Database in Microsoft Fabric',
          'A transactional database built on the Azure SQL Database engine that is created and managed inside Microsoft Fabric, with its data replicated automatically to OneLake for analytics, aimed at application workloads that sit beside analytics.',
          'give an application team a transactional SQL database that is available to Fabric analytics automatically, with no pipeline to build',
          ['Azure SQL Managed Instance', 'SQL Server on Azure Virtual Machines', 'An elastic pool'],
          'It runs INSIDE Fabric and mirrors to OneLake — a standalone Azure SQL Database lives in your own Azure subscription.',
          S.steps([('Fabric workspace', 'creates the database'), ('SQL engine', 'Azure SQL Database'), ('OneLake', 'data copied automatically')], title='SQL database in Fabric', tones=['blue', 'primary', 'green']),
          caption='SQL database in Fabric is a transactional Azure SQL database inside Fabric that feeds OneLake automatically.')

    b.add('1.4', 'Rolling patching of replicas',
          'On SQL Server running on Azure VMs or hybrid servers you own operating system and SQL Server patching: schedule it in a maintenance window, patch secondary replicas first, perform a planned failover, then patch the former primary.',
          'apply a cumulative update to an availability group on Azure VMs with minimal downtime',
          ['Patch the primary first', 'Patch every replica at once', 'Wait for Microsoft to patch it'],
          'Secondaries FIRST, then fail over — on IaaS the patching is your job, unlike PaaS.',
          S.steps([('Patch secondary', 'primary keeps serving'), ('Planned failover', 'no data loss'), ('Patch old primary', 'then rejoin the group')], title='Rolling patch', tones=['blue', 'amber', 'green']),
          caption='Patch secondaries first, fail over in a planned way, then patch the former primary.')

    b.add('1.4', 'Hybrid SQL Server solution',
          'An architecture where SQL Server stays on-premises while Azure supplies part of the solution, such as a disaster recovery replica, a Managed Instance link target, backups to Blob storage, or Arc-based management.',
          'keep the primary SQL Server on-premises while using Azure as the disaster recovery site',
          ['A single Azure SQL Database', 'An elastic pool', 'The serverless compute tier'],
          'The primary stays ON-PREMISES with Azure as a partner — it is not a migration.',
          S.compare(('On-premises', ['Primary SQL Server', 'Local applications', 'Full control']), ('Azure', ['DR replica or MI link', 'Backups to Blob storage', 'Arc management']), title='Hybrid layout'),
          caption='A hybrid solution keeps SQL Server on-premises and uses Azure for DR, backups, or management.')

    b.add('1.4', 'Declarative deployment (Bicep or ARM)',
          'Describing the desired end state of Azure resources in a Bicep or ARM template that Azure reconciles, which is repeatable and can be previewed with what-if, unlike an imperative script that lists the steps.',
          'choose a repeatable deployment method that describes the desired state of SQL resources and can be previewed before it runs',
          ['Clicking through the Azure portal', 'A one-off script with no template', 'Cloud Shell command history'],
          'Declare the END STATE and preview with what-if — imperative scripts describe steps and drift easily.',
          S.compare(('Declarative', ['Bicep or ARM template', 'Describes the end state', 'what-if preview']), ('Imperative', ['PowerShell or CLI script', 'Lists the steps', 'Easy to drift']), title='Choosing a deployment method'),
          caption='Declarative templates state the end result and can be previewed; scripts state the steps.')

    # ------------------------------------------------------------------------------------------ 1.5
    b.add('1.5', 'Table partitioning',
          'Dividing a large table into partitions by a column such as date using a partition function and scheme, so maintenance, loading, and archiving can work on one partition at a time within a single database.',
          'archive the oldest month of a very large table without a long, logged DELETE',
          ['Database sharding', 'Data compression', 'A columnstore index'],
          'ONE database with many partitions — sharding spreads data across separate databases.',
          S.steps([('Partition function', 'boundary values'), ('Partition scheme', 'maps to filegroups'), ('Partitioned table', 'switch or merge')], title='Building a partitioned table', tones=['blue', 'primary', 'green']),
          caption='Table partitioning splits a big table by a key so each partition can be managed on its own.')

    b.add('1.5', 'Partition switching',
          'ALTER TABLE ... SWITCH PARTITION is a metadata-only operation that moves an entire partition in or out of a table almost instantly, used for fast loads and archiving.',
          'load a month of staged data into a fact table in seconds with a metadata-only operation',
          ['INSERT ... SELECT', 'BULK INSERT', 'bcp import'],
          'It moves a whole partition by changing METADATA — the other options physically copy every row.',
          S.steps([('Staging table', 'matches the structure'), ('SWITCH PARTITION', 'metadata only'), ('Fact table', 'new partition appears')], title='Partition switching', tones=['plain', 'amber', 'green']),
          caption='Switching moves a whole partition between tables as a near-instant metadata change.')

    b.add('1.5', 'Partition elimination',
          'The optimizer reads only the partitions that can contain the requested rows when a query filters on the partition key, reducing I/O on large partitioned tables.',
          'make a date-range query read only the relevant month\'s partition of a partitioned table',
          ['Partition switching', 'Row compression', 'An index rebuild'],
          'It depends on filtering by the PARTITION KEY — without that predicate every partition is scanned.',
          S.compare(('Filter on the key', ['WHERE OrderDate in a range', 'Only matching partitions read', 'Less I/O']), ('No key filter', ['WHERE on another column', 'Every partition scanned', 'No benefit']), title='Partition elimination', tones=('green', 'red')),
          caption='Filtering on the partition key lets the optimizer skip partitions that cannot match.')

    b.add('1.5', 'Row and page data compression',
          'ROW compression stores fixed-length data compactly and PAGE compression adds prefix and dictionary compression on top, saving storage and I/O at a CPU cost; sp_estimate_data_compression_savings predicts the benefit before ALTER ... REBUILD WITH (DATA_COMPRESSION = PAGE).',
          'reduce storage and I/O for a large read-heavy table by trading some CPU, after estimating the savings first',
          ['Transparent data encryption', 'Partition switching', 'Database sharding'],
          'PAGE saves more than ROW but costs more CPU — estimate the savings before rebuilding.',
          S.compare(('ROW', ['Compact fixed-length types', 'Lower CPU cost', 'Smaller saving']), ('PAGE', ['Row plus prefix and dictionary', 'Higher CPU cost', 'Bigger saving']), title='Data compression levels'),
          caption='Row and page compression trade CPU for smaller storage and less I/O; estimate savings first.')

    # ------------------------------------------------------------------------------------------ 1.6
    b.add('1.6', 'Offline migration',
          'A migration in which the source is unavailable or read-only while data is copied, using methods such as BACPAC export and import, native backup and restore, or Database Migration Service offline mode; it is simpler but requires an outage window.',
          'migrate a small departmental database where a weekend outage is acceptable',
          ['Online migration', 'Continuous transactional replication', 'Active geo-replication'],
          'The source is down or read-only during the copy — online migration keeps syncing until cutover.',
          S.steps([('Stop writes', 'outage begins'), ('Copy data', 'backup, BACPAC, DMS'), ('Cut over', 'point apps at Azure')], title='Offline migration', tones=['amber', 'blue', 'green']),
          caption='Offline migration copies data while the source is unavailable, so it needs an outage window.')

    b.add('1.6', 'Online migration',
          'A migration in which the source stays operational while changes are continuously synchronized to the target, leaving only a short cutover window; examples are Database Migration Service online mode, Log Replay Service, and the Managed Instance link.',
          'migrate a 24/7 order system with only minutes of downtime allowed',
          ['Offline migration', 'A BACPAC import', 'A one-time native restore'],
          'The source keeps WORKING while changes sync — only the final cutover causes downtime.',
          S.steps([('Initial copy', 'source stays online'), ('Sync changes', 'continuously'), ('Cutover', 'minutes of downtime')], title='Online migration', tones=['blue', 'primary', 'green']),
          caption='Online migration keeps the source running and syncs changes until a brief cutover.')

    b.add('1.6', 'Azure Database Migration Service (DMS)',
          'A managed service that moves databases from SQL Server to Azure SQL targets, with assessment and both offline and online modes, so you do not have to build and monitor the transfer yourself.',
          'run a managed, assessed migration from on-premises SQL Server to Azure SQL Managed Instance',
          ['A BACPAC export and import', 'Transactional replication', 'SSMS Generate Scripts'],
          'A managed service with online AND offline modes — a BACPAC is a manual file transfer.',
          S.steps([('Assess', 'find blockers'), ('Migrate', 'offline or online'), ('Cut over', 'validate, switch apps')], title='Using DMS', tones=['plain', 'blue', 'green']),
          caption='DMS assesses and migrates SQL Server databases to Azure SQL, offline or online.')

    b.add('1.6', 'Log Replay Service (LRS)',
          'A service that migrates databases to SQL Managed Instance by continuously restoring native full, differential, and log backups from Blob storage, finishing automatically (autocomplete mode) or at a cutover you trigger yourself (continuous mode); a single job runs for at most 30 days.',
          'migrate a large database to Managed Instance by restoring backups from Blob storage and cutting over at a chosen moment',
          ['A BACPAC import', 'Managed Instance link', 'An Azure Data Factory copy'],
          'It keeps RESTORING backups from storage until you cut over — the MI link uses a distributed availability group instead.',
          S.steps([('Backups', 'to Blob storage'), ('LRS restores', 'full, diff, and log'), ('Cutover', 'complete and switch')], title='Log Replay Service', tones=['plain', 'blue', 'green']),
          caption='Log Replay Service restores backups from Blob storage continuously until you complete the cutover.')

    b.add('1.6', 'Managed Instance link',
          'A feature that uses a distributed availability group to replicate near real time from SQL Server to Managed Instance (and in supported cases back), for disaster recovery, read offloading, or an online migration.',
          'replicate an on-premises SQL Server to Managed Instance in near real time for read scale-out and a later low-downtime cutover',
          ['Log shipping', 'A BACPAC import', 'DMS offline mode'],
          'A near REAL-TIME distributed availability group — Log Replay Service restores backups in batches.',
          S.steps([('SQL Server', 'primary replica'), ('Distributed AG', 'near real time'), ('Managed Instance', 'readable secondary')], title='Managed Instance link', tones=['plain', 'primary', 'green']),
          caption='The MI link replicates SQL Server to Managed Instance in near real time using a distributed availability group.')

    b.add('1.6', 'BACPAC export and import',
          'A BACPAC is a portable file holding a database\'s schema and data, created and loaded with SqlPackage or the portal; it works for Azure SQL Database where native backups do not, but is slow for very large databases and not transactionally consistent unless the source is quiesced.',
          'move a small Azure SQL Database to another server when native backup and restore is not available',
          ['A native RESTORE FROM URL', 'A DACPAC deployment', 'Log shipping'],
          'Schema plus DATA in one portable file — a DACPAC carries the schema only.',
          S.compare(('BACPAC', ['Schema and data', 'Export then import', 'Slow for huge databases']), ('DACPAC', ['Schema only', 'Deploy or upgrade', 'No table data']), title='BACPAC vs DACPAC'),
          caption='A BACPAC carries schema and data for portable moves; a DACPAC carries the schema only.')

    b.add('1.6', 'Native restore from URL to Managed Instance',
          'Managed Instance can restore native COPY_ONLY backups placed in Azure Blob storage with RESTORE DATABASE ... FROM URL, an offline method that preserves the source database; Azure SQL Database does not support native restore.',
          'migrate a SQL Server database to Managed Instance by taking a copy-only backup to Blob storage and restoring it',
          ['A BACPAC import', 'Azure SQL Database native restore', 'Log shipping to Azure SQL Database'],
          'MI supports native RESTORE FROM URL — Azure SQL Database does not, which is why BACPAC exists for it.',
          S.terminal(['BACKUP DATABASE Sales TO URL =', "  'https://acct.blob.core.windows.net/bk/Sales.bak'", '  WITH COPY_ONLY, COMPRESSION;', 'RESTORE DATABASE Sales FROM URL = ...'], title='T-SQL'),
          caption='Managed Instance restores native copy-only backups from Blob storage; Azure SQL Database cannot.')

    b.add('1.6', 'Managed Instance database copy and move',
          'A managed capability for copying a database to, or moving it between, SQL managed instances, for example to rebalance workloads or split a busy instance, without manually taking and restoring native backups.',
          'move a database from one busy Managed Instance to another without taking and restoring backups by hand',
          ['A BACPAC export and import', 'Active geo-replication', 'An elastic pool move'],
          'It is a built-in COPY or MOVE between managed instances — geo-replication targets Azure SQL Database, not instance rebalancing.',
          S.steps([('Source instance', 'busy managed instance'), ('Copy or move', 'service handles the data'), ('Target instance', 'database available')], title='Copy and move', tones=['plain', 'blue', 'green']),
          caption='Managed Instance can copy or move a database between instances without hand-made backups.')

    b.add('1.6', 'Orphaned users after a migration',
          'A restored or migrated database carries its users but not the server-level logins, so users appear orphaned and cannot sign in until the login is recreated with the same SID or the user is remapped to an existing login.',
          'fix database users that cannot sign in after a database was restored to a new server where their logins do not exist',
          ['Re-running the migration offline', 'Resetting the compatibility level', 'Updating statistics'],
          'Logins live in master and users in the database — recreate the login with the same SID or remap the user.',
          S.steps([('Restore database', 'users come along'), ('No matching login', 'users are orphaned'), ('Recreate or remap', 'same SID or ALTER USER')], title='Orphaned users', tones=['plain', 'red', 'green']),
          caption='After a restore, recreate the missing logins or remap the users so they can sign in again.')

    b.add('1.6', 'Compatibility level after migration',
          'A migrated database keeps its compatibility level until you change it; keeping the original level first, testing with Query Store, and then raising it step by step avoids surprise plan regressions.',
          'avoid sudden query regressions after migrating a database to a newer SQL engine version',
          ['Raising the level on day one without testing', 'Dropping the database and recreating it', 'Disabling Query Store'],
          'Migrate first, then raise the compatibility level in a controlled step with Query Store as the safety net.',
          S.steps([('Migrate', 'keep the old level'), ('Capture baseline', 'Query Store on'), ('Raise the level', 'compare, force plans')], title='Raising compatibility level', tones=['plain', 'blue', 'green']),
          caption='Raise the compatibility level only after migrating and capturing a Query Store baseline.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Hybrid offerings, Arc, and Fabric', ['1.4'],
              'Not every SQL Server moves to Azure. Azure Arc-enabled SQL services bring Azure management, security (Microsoft Defender for SQL), and Microsoft Entra sign-in to instances that stay on-premises or in another cloud, and a hybrid design might keep the primary on-premises with an Azure replica for disaster recovery. SQL database in Microsoft Fabric is a transactional Azure SQL engine database that lives inside Fabric and replicates to OneLake for analytics.\n\n'
              'On IaaS and hybrid servers patching is your responsibility: schedule a maintenance window, patch secondary replicas first, fail over in a planned way, and then patch the former primary. Prefer declarative deployment (Bicep or ARM) for repeatability, since a template states the end result and can be previewed with what-if, whereas imperative scripts list steps and drift.')
    b.section('Partitioning and compression', ['1.5'],
              'Table partitioning divides one large table by a key such as date using a partition function and scheme, which makes maintenance, loading, and archiving practical: switching a partition in or out is a metadata operation, and queries that filter on the partition key benefit from partition elimination. It is different from sharding, which spreads data over separate databases.\n\n'
              'Row compression stores fixed-length data compactly and page compression adds prefix and dictionary compression, saving storage and I/O at the cost of CPU; estimate the savings with sp_estimate_data_compression_savings before rebuilding.')
    b.section('Migration strategy', ['1.6'],
              'Choose online or offline first: offline migration accepts an outage while data is copied, online migration keeps the source running and syncs changes until a short cutover. Database Migration Service assesses and migrates in either mode, Log Replay Service restores backups from Blob storage into Managed Instance until you cut over, and the Managed Instance link replicates in near real time with a distributed availability group. Native COPY_ONLY backups can be restored to Managed Instance with RESTORE FROM URL, while Azure SQL Database has no native restore, which is why BACPAC (schema and data) exists; a DACPAC carries schema only.\n\n'
              'Plan for what breaks afterwards: logins do not travel with a restored database, so users appear orphaned until the login is recreated with the same SID or the user is remapped. Keep the original compatibility level at first, capture a Query Store baseline, and raise the level later in a controlled step.')
