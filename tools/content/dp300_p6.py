"""DP-300, new domain p6 (Plan and Configure HA/DR): strategy, backup and restore, and availability technologies."""
import svg as S

DOMAIN = 'p6'
WEIGHT = 20
NEW_DOMAIN = {'id': 'p6', 'number': '6.0', 'name': 'Plan and Configure HA/DR', 'weight': 20, 'color': '#34d399'}
OVERVIEW = ('A database that cannot be recovered or reached when something fails is not production-ready. This domain turns recovery point and recovery time objectives into a design, '
            'covers backup and restore with native tools and Azure automation, and walks through the availability technologies for Azure SQL and SQL Server: availability groups, failover cluster instances, '
            'log shipping, and failover groups, plus how to test, monitor, and troubleshoot them. It matches the "Plan and configure a high availability and disaster recovery environment" area of Microsoft\'s DP-300 outline.')


def build(b):
    b.objective('6.1', 'HA/DR strategy', ['RPO and RTO mapping', 'Planned vs forced failover', 'DR testing', 'Geo-restore'])
    b.objective('6.2', 'Backup and restore', ['Recovery models', 'Backup chain', 'Automated backups', 'LTR policy', 'STOPAT and tail-log', 'Backup to URL'])
    b.objective('6.3', 'Configure HA/DR', ['Availability groups', 'Commit modes', 'FCI on Azure VMs', 'Log shipping', 'Monitoring and troubleshooting'])

    # ------------------------------------------------------------------------------------------ 6.1
    b.add('6.1', 'RPO and RTO to solution mapping',
          'The recovery point objective (acceptable data loss) and recovery time objective (acceptable downtime) pick the technology: zone redundancy for near-zero loss within a region, geo-replication or a failover group for seconds of loss across regions, point-in-time restore for same-region mistakes, and geo-restore when hours of loss and downtime are acceptable.',
          'translate the stated tolerances for data loss and downtime into the matching Azure SQL resilience options',
          ['Choosing the largest compute tier', 'Adding read replicas', 'Turning on Query Store'],
          'Tight RPO and RTO cost more — match the cheapest option that still meets BOTH numbers.',
          S.table(['Requirement', 'Typical option'], [('Near-zero loss in region', 'zone-redundant tier'), ('Seconds of loss, region failure', 'failover group'), ('Undo a mistake, same region', 'point-in-time restore'), ('Hours of loss and downtime', 'geo-restore')], title='From RPO and RTO to a design', col_widths=[0.5, 0.5]),
          caption='RPO and RTO decide which Azure SQL resilience option fits, balancing protection against cost.')

    b.add('6.1', 'Planned failover',
          'A planned failover waits for the secondary to synchronize so no data is lost and is used for maintenance and DR drills, whereas a forced failover switches immediately when the primary is unavailable and can lose recent transactions.',
          'fail over a failover group for a DR drill with no data loss while both regions are healthy',
          ['Forced failover', 'Geo-restore', 'Point-in-time restore'],
          'PLANNED means no data loss and healthy regions — FORCED is for when the primary is gone and some loss is accepted.',
          S.compare(('Planned failover', ['Waits for synchronization', 'No data loss', 'Drills and maintenance']), ('Forced failover', ['Switches immediately', 'Recent data may be lost', 'Primary is unavailable']), title='Failover types', tones=('green', 'amber')),
          caption='A planned failover loses no data and needs healthy regions; a forced failover accepts data loss.')

    b.add('6.1', 'DR testing procedure',
          'A written, scheduled test: define success criteria from the RPO and RTO, perform a planned failover in a maintenance window, validate application connectivity through the listener or failover group endpoint, measure the real RTO and RPO, document the results, and fail back.',
          'prove that the DR design really meets the agreed RTO before an outage happens',
          ['Reading the SLA document', 'Running DBCC CHECKDB', 'Taking another full backup'],
          'An untested plan is a hope — measure the real RTO and RPO in a drill and document the result.',
          S.steps([('Plan', 'criteria and window'), ('Fail over', 'validate the apps'), ('Measure, fail back', 'document RTO and RPO')], title='A DR drill', tones=['plain', 'blue', 'green']),
          caption='Regular DR drills measure the real RTO and RPO and give you a documented, rehearsed procedure.')

    b.add('6.1', 'Geo-restore',
          'Restoring an Azure SQL Database from geo-redundant backup copies into any region when the primary region is unavailable and no geo-replica exists; it is the lowest-cost recovery option but also the slowest, typically taking minutes or hours depending on database size and storage replication, with some data loss.',
          'recover in another region after a regional outage when no geo-replica or failover group was configured',
          ['Point-in-time restore in the same region', 'Active geo-replication', 'Zone-redundant configuration'],
          'Cheapest but slowest — typically minutes or hours to recover; a failover group recovers in about a minute.',
          S.steps([('Regional outage', 'primary unavailable'), ('Geo-restore', 'from geo-redundant backup'), ('New database', 'in another region')], title='Geo-restore', tones=['red', 'blue', 'green']),
          caption='Geo-restore rebuilds a database in another region from geo-redundant backups, slowly and cheaply.')

    # ------------------------------------------------------------------------------------------ 6.2
    b.add('6.2', 'FULL recovery model',
          'The FULL recovery model logs every operation and keeps the log until it is backed up, which allows transaction log backups and point-in-time restore; SIMPLE truncates the log automatically and permits neither, and BULK_LOGGED minimally logs bulk operations.',
          'configure a database so the log can be backed up every five minutes and restored to any moment',
          ['SIMPLE recovery model', 'BULK_LOGGED recovery model', 'Differential backups only'],
          'FULL is what makes LOG backups and point-in-time restore possible — SIMPLE gives up both.',
          S.table(['Model', 'Log backups', 'Point-in-time restore'], [('FULL', 'yes', 'yes'), ('BULK_LOGGED', 'yes', 'limited'), ('SIMPLE', 'no', 'no')], title='Recovery models', col_widths=[0.3, 0.3, 0.4]),
          caption='FULL recovery enables log backups and point-in-time restore; SIMPLE does not.')

    b.add('6.2', 'Full, differential, and log backup chain',
          'A full backup captures everything, a differential captures changes since the last full, and log backups capture transactions since the last log backup; a restore needs the full, the latest differential, then each log in order, and the log backup interval sets the RPO.',
          'design weekly full, daily differential, and 10-minute log backups so that at most about ten minutes of data can be lost',
          ['Nightly full backups only', 'A snapshot every hour', 'A differential backup every minute'],
          'The LOG backup interval sets the RPO, and a restore needs the chain in order.',
          S.steps([('Full', 'weekly'), ('Differential', 'daily'), ('Log', 'every 10 minutes')], title='A backup strategy', tones=['blue', 'primary', 'green']),
          caption='Full, differential, and log backups together allow restores to a point in time; the log interval sets the RPO.')

    b.add('6.2', 'Automated backups in Azure SQL',
          'Azure SQL Database and Managed Instance take backups automatically: a full backup weekly, differential backups every 12 or 24 hours, and log backups about every 10 minutes, supporting point-in-time restore within a retention of 1 to 35 days (7 by default).',
          'explain which backups Azure SQL Database takes without any configuration, and how often',
          ['Backups only when an administrator runs them', 'A daily full backup and nothing else', 'A snapshot every minute'],
          'Weekly full, 12 or 24-hour differential, and about 10-minute log — there is nothing to schedule.',
          S.facts([('Full', 'weekly'), ('Differential', 'every 12 or 24 hours'), ('Log', 'about every 10 minutes'), ('PITR retention', '1 to 35 days, 7 by default')], title='Automated backup schedule'),
          caption='Azure SQL takes weekly full, 12- or 24-hour differential, and roughly 10-minute log backups automatically.')

    b.add('6.2', 'Long-term retention policy (W, M, Y)',
          'A long-term retention policy keeps full backups for up to 10 years using weekly (W), monthly (M), and yearly (Y) retention settings plus the week of the year to keep; restoring from one creates a new database.',
          'keep a yearly full backup for seven years to meet a compliance requirement',
          ['Raising point-in-time retention to 35 days', 'Geo-redundant backup storage', 'Active geo-replication'],
          'PITR tops out at 35 days — compliance retention needs the LTR policy.',
          S.facts([('W', 'weeks to keep weekly fulls'), ('M', 'months to keep monthly fulls'), ('Y', 'years to keep a yearly full'), ('WeekOfYear', 'which week is the yearly')], title='LTR policy settings'),
          caption='An LTR policy sets weekly, monthly, and yearly retention, up to 10 years, for compliance.')

    b.add('6.2', 'RESTORE ... STOPAT',
          'On SQL Server and Managed Instance, restore the full, any differential, and log backups WITH NORECOVERY, apply the final log with STOPAT to stop just before the mistake, then finish WITH RECOVERY to bring the database online.',
          'restore a database to 14:32, one minute before an accidental DELETE, using native backups',
          ['RESTORE ... WITH RECOVERY on the first file', 'RESTORE VERIFYONLY', 'DBCC CHECKDB'],
          'NORECOVERY until the last log, STOPAT before the error, then RECOVERY — recover too early and you cannot continue the chain.',
          S.terminal(['RESTORE DATABASE Sales FROM DISK = ... WITH NORECOVERY;', 'RESTORE LOG Sales FROM DISK = ...', "  WITH STOPAT = '2026-10-04 14:32', RECOVERY;"], title='T-SQL'),
          caption='STOPAT replays logs up to a chosen moment; NORECOVERY keeps the chain open until the last step.')

    b.add('6.2', 'Tail-log backup',
          'A log backup taken before restoring (BACKUP LOG ... WITH NORECOVERY, or NO_TRUNCATE if the database is damaged) that captures transactions not yet backed up, so the restore can reach the latest possible point.',
          'capture the last transactions from a damaged database before starting a restore so no committed data is lost',
          ['A differential backup', 'A COPY_ONLY full backup', 'A snapshot'],
          'Back up the log FIRST — otherwise the most recent transactions are lost when you restore over the database.',
          S.steps([('Database fails', 'log still readable'), ('Tail-log backup', 'NORECOVERY or NO_TRUNCATE'), ('Restore chain', 'full, diff, logs, tail')], title='Tail-log backup', tones=['red', 'amber', 'green']),
          caption='A tail-log backup saves the final transactions before a restore so no committed data is lost.')

    b.add('6.2', 'Backup to URL (Blob storage)',
          'BACKUP ... TO URL writes backups directly to Azure Blob storage using a credential (a shared access signature or a managed identity), giving off-site storage without local disks, and RESTORE ... FROM URL reads them back.',
          'send SQL Server backups straight to Azure Blob storage for off-site retention',
          ['A backup to a local tape drive', 'Log shipping', 'A BACPAC export'],
          'The destination is a BLOB URL with a credential — the backup goes off-site without local disks.',
          S.terminal(["CREATE CREDENTIAL [https://acct.blob.core.windows.net/bk]", "  WITH IDENTITY = 'SHARED ACCESS SIGNATURE', SECRET = '...';", "BACKUP DATABASE Sales TO URL = '.../Sales.bak';"], title='T-SQL'),
          caption='Backup to URL writes native backups straight to Blob storage using a credential.')

    b.add('6.2', 'Restoring a deleted database',
          'Azure SQL Database and Managed Instance can restore a dropped database from automated backups within the retention period, creating a new database as of the time it was deleted.',
          'recover a database that was dropped by mistake yesterday',
          ['A failover to the geo-replica', 'Changing the compatibility level', 'Moving it into an elastic pool'],
          'It works only within the retention period, from the automated backups — it creates a NEW database.',
          S.steps([('Database dropped', 'by mistake'), ('Restore deleted', 'from automated backups'), ('New database', 'as of deletion time')], title='Undeleting a database', tones=['red', 'blue', 'green']),
          caption='A dropped database can be restored from automated backups within the retention window.')

    b.add('6.2', 'Restore testing and RESTORE VERIFYONLY',
          'RESTORE VERIFYONLY (with CHECKSUM) confirms a backup file is readable and complete, but only an actual test restore to another server followed by DBCC CHECKDB proves the data can really be recovered.',
          'prove that last night\'s backup can actually be restored and the data inside is intact',
          ['Counting the backup files', 'Checking the backup size', 'Reading the SQL error log'],
          'VERIFYONLY checks readability — only a test RESTORE plus CHECKDB proves the backup works.',
          S.steps([('Test restore', 'on another server'), ('DBCC CHECKDB', 'verify integrity'), ('Record the time', 'compare with RTO')], title='Proving a backup', tones=['plain', 'blue', 'green']),
          caption='A test restore plus an integrity check is the only real proof a backup works.')

    # ------------------------------------------------------------------------------------------ 6.3
    b.add('6.3', 'Always On availability group',
          'A set of databases that fail over together between replicas on separate servers, each holding its own copy of the data; one primary accepts writes, secondaries can be readable, a listener gives clients one name, and automatic failover needs synchronous commit.',
          'protect a set of databases on SQL Server VMs with separate data copies and automatic failover',
          ['A failover cluster instance', 'Log shipping', 'Active geo-replication'],
          'Separate COPIES of the data on separate servers — a failover cluster instance shares one copy of the storage.',
          S.hub(('Availability group', 'databases fail over together'), [('Primary', 'accepts writes'), ('Synchronous secondary', 'automatic failover'), ('Asynchronous secondary', 'remote DR copy')]),
          caption='An availability group keeps separate database copies on replicas and fails them over together.')

    b.add('6.3', 'Asynchronous commit',
          'With asynchronous commit the primary does not wait for the secondary to harden the log before committing, giving lower latency across distance but possible data loss on failover; synchronous commit waits and is required for automatic failover.',
          'choose the commit mode for a replica in a distant region where latency must stay low and some data loss is acceptable',
          ['Synchronous commit', 'Automatic failover mode', 'Read-only routing'],
          'ASYNC trades possible data loss for low latency — synchronous is for nearby replicas that need automatic failover.',
          S.compare(('Synchronous', ['Waits for the secondary', 'No data loss', 'Automatic failover possible']), ('Asynchronous', ['Does not wait', 'Possible data loss', 'Suits remote regions']), title='Commit modes'),
          caption='Asynchronous commit favors latency over zero data loss and suits distant replicas.')

    b.add('6.3', 'Availability group listener',
          'A virtual network name and IP that clients connect to so they always reach the current primary; on Azure VMs it uses a load balancer or a distributed network name (DNN), and read-only routing can send read-intent connections to a readable secondary.',
          'give applications one connection string that always points to the current primary after a failover',
          ['The primary replica\'s computer name', 'A DNS record that someone updates by hand', 'A linked server'],
          'ONE name that follows the primary — on Azure VMs it needs a load balancer or a DNN.',
          S.steps([('Clients', 'connect to the listener'), ('Listener', 'load balancer or DNN'), ('Current primary', 'follows each failover')], title='Listener', tones=['plain', 'blue', 'green']),
          caption='The listener gives clients one name that always resolves to the current primary replica.')

    b.add('6.3', 'Failover cluster instance (FCI) on Azure VMs',
          'A Windows Server Failover Cluster hosts one SQL Server instance that moves between nodes using shared storage (Azure shared disks, premium file shares, or Storage Spaces Direct); it protects the whole instance against node failure, but there is only one copy of the data.',
          'provide instance-level failover on Azure VMs using shared storage, protecting logins and jobs along with the databases',
          ['An availability group', 'Log shipping', 'Active geo-replication'],
          'One INSTANCE moving between nodes on shared storage — an availability group keeps separate copies of the databases.',
          S.compare(('Failover cluster instance', ['One instance, shared storage', 'Protects the whole instance', 'Single copy of the data']), ('Availability group', ['Separate copies per replica', 'Protects selected databases', 'Each node has its own storage']), title='FCI vs availability group'),
          caption='An FCI moves one instance between nodes on shared storage; an availability group keeps separate copies.')

    b.add('6.3', 'Log shipping',
          'Automatically backs up the transaction log on a primary, copies it to one or more secondaries, and restores it there on a schedule; simple and usable across Azure and on-premises, but failover is manual and the RPO depends on the interval.',
          'maintain a warm standby copy of a database that is refreshed every 15 minutes and failed over manually',
          ['An availability group with automatic failover', 'A failover cluster instance', 'Zone redundancy'],
          'Backup, copy, and restore jobs on a schedule — failover is manual and the RPO equals the interval.',
          S.steps([('Backup job', 'primary log backup'), ('Copy job', 'to the secondary'), ('Restore job', 'NORECOVERY or STANDBY')], title='Log shipping', tones=['blue', 'plain', 'green']),
          caption='Log shipping backs up, copies, and restores logs on a schedule to keep a warm standby.')

    b.add('6.3', 'Failover group grace period and policy',
          'A failover group uses a customer-managed (manual, recommended) or a Microsoft-managed (automatic) failover policy; with the Microsoft-managed policy, the grace period with data loss sets how long Azure waits before forcing a failover that may lose recent data, and it cannot be set below one hour.',
          'configure how long Azure waits before automatically forcing a failover that may lose data',
          ['The read-only listener', 'A planned failover', 'Backup retention'],
          'The GRACE PERIOD is how long recovery is attempted before a forced failover — it ties the policy to your acceptable data loss.',
          S.facts([('Policy', 'customer or Microsoft managed'), ('Grace period', 'wait before a forced failover'), ('Minimum', 'one hour'), ('Trade-off', 'shorter risks more data loss')], title='Failover group settings'),
          caption='The grace period controls how long Azure waits before forcing an automatic failover.')

    b.add('6.3', 'WSFC quorum and Cloud Witness',
          'Failover clusters (FCI and availability groups) depend on Windows Server Failover Clustering quorum, meaning a majority of votes must be online; on Azure a Cloud Witness, a small blob in a storage account, is an easy tie-breaker vote for clusters with an even number of nodes.',
          'add a tie-breaking vote to a two-node cluster on Azure VMs without building a third server',
          ['A file share on one of the nodes', 'A third SQL Server replica', 'An extra load balancer'],
          'Quorum is a MAJORITY of votes — a Cloud Witness blob is the simple extra vote on Azure.',
          S.steps([('Two nodes', 'one vote each'), ('Cloud Witness', 'a blob adds a third vote'), ('Quorum kept', 'one node can fail')], title='Cloud Witness', tones=['plain', 'blue', 'green']),
          caption='A Cloud Witness gives an Azure cluster a tie-breaking vote so quorum survives a node failure.')

    b.add('6.3', 'AG health DMVs and queues',
          'sys.dm_hadr_database_replica_states and the availability group dashboard show synchronization_state, log_send_queue_size, and redo_queue_size; a growing log send queue points to network or throughput trouble, and a growing redo queue to a secondary that applies logs slowly.',
          'tell whether a secondary is behind because of network throughput or because of slow log redo',
          ['sys.dm_exec_requests', 'sys.dm_db_index_usage_stats', 'Query Store runtime statistics'],
          'LOG SEND queue means the network or send side; REDO queue means the secondary is slow to apply.',
          S.table(['Indicator', 'Points to'], [('log_send_queue_size', 'network or send rate'), ('redo_queue_size', 'slow redo on the secondary'), ('synchronization_state', 'SYNCHRONIZED or not')], title='Reading AG health', col_widths=[0.5, 0.5]),
          caption='The send and redo queues show whether a lagging secondary has a network or a redo problem.')

    b.add('6.3', 'Geo-replication lag monitoring',
          'sys.dm_geo_replication_link_status reports replication state and replication_lag_sec for active geo-replication, and the portal shows failover group status; alerting on lag shows whether the agreed RPO is still being met.',
          'verify that geo-replication lag is still within the agreed RPO',
          ['sys.dm_db_resource_stats', 'sys.dm_exec_sessions', 'sys.dm_os_wait_stats'],
          'Replication LAG is your live RPO — alert on it.',
          S.terminal(['SELECT partner_server, replication_lag_sec', 'FROM sys.dm_geo_replication_link_status;', '-- compare the lag with the agreed RPO'], title='T-SQL'),
          caption='Replication lag from the geo-replication DMV shows how much data a failover could lose right now.')

    b.add('6.3', 'Log growth from a lagging replica',
          'A primary\'s transaction log can keep growing, even with log backups running, because it cannot truncate log records a lagging or disconnected secondary still needs; log_reuse_wait_desc shows AVAILABILITY_REPLICA, and the fix is to restore the replica\'s health.',
          'explain why the log on an availability group primary keeps growing even though log backups run on schedule',
          ['A missing index', 'Stale statistics', 'A deadlock'],
          'Check log_reuse_wait_desc — AVAILABILITY_REPLICA means a lagging replica is holding the log.',
          S.terminal(['SELECT name, log_reuse_wait_desc', 'FROM sys.databases;', '-- AVAILABILITY_REPLICA: a replica is behind'], title='T-SQL'),
          caption='A lagging or disconnected replica prevents log truncation, so the primary log grows until it recovers.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Turning RPO and RTO into a design', ['6.1'],
              'Start from the two numbers the business gives you: how much data can be lost (RPO) and how long it can be unavailable (RTO). Zone redundancy covers near-zero loss within a region, geo-replication or a failover group covers seconds of loss across regions, point-in-time restore undoes mistakes in the same region, and geo-restore, the cheapest and slowest option, suits hours of loss and downtime (typically minutes or hours to recover).\n\n'
              'A planned failover waits for synchronization and loses no data, so use it for drills and maintenance; a forced failover switches immediately and accepts data loss. Rehearse the design: define success criteria, fail over in a window, validate connectivity through the listener or failover group endpoint, measure the real RTO and RPO, document them, and fail back.')
    b.section('Backup and restore', ['6.2'],
              'The FULL recovery model keeps the log until it is backed up, which makes log backups and point-in-time restore possible; SIMPLE allows neither. A typical chain is weekly full, daily differential, and frequent log backups, and the log interval sets the RPO. Azure SQL takes these automatically (weekly full, 12 or 24-hour differential, roughly 10-minute log) with 1 to 35 days of point-in-time restore, and a long-term retention policy (W, M, Y) keeps fulls for up to 10 years.\n\n'
              'On SQL Server and Managed Instance, restore with NORECOVERY until the last step, use STOPAT to stop before a mistake, and take a tail-log backup first so the latest transactions are not lost. BACKUP TO URL writes to Blob storage using a credential, a deleted Azure SQL database can be restored within retention, and RESTORE VERIFYONLY only checks readability, so schedule real test restores followed by DBCC CHECKDB.')
    b.section('Availability technologies and their health', ['6.3'],
              'An availability group keeps separate copies of databases on replicas that fail over together: synchronous commit waits for the secondary (no data loss, required for automatic failover), asynchronous commit does not (lower latency, possible loss, suits remote regions), and the listener gives clients one name that follows the primary. A failover cluster instance instead moves one instance between nodes on shared storage, with a single copy of the data, and both rely on cluster quorum, where a Cloud Witness is the easy extra vote on Azure. Log shipping keeps a warm standby with scheduled backup, copy, and restore jobs and a manual failover.\n\n'
              'For failover groups, prefer the customer-managed (manual) policy; with the Microsoft-managed policy, the grace period, never below one hour, sets how long Azure waits before forcing a failover that may lose data. Monitor with the availability group dashboard and sys.dm_hadr_database_replica_states (a growing log send queue means network trouble, a growing redo queue means a slow secondary) and with replication lag from sys.dm_geo_replication_link_status. A primary log that keeps growing can be held by a lagging replica: log_reuse_wait_desc shows AVAILABILITY_REPLICA.')
