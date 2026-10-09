"""New DP-300 labs for the HA/DR domain (p6) added in v224."""
from labs_lib import decision, scenario, sequence, terminal

C = 'core1'


def labs():
    out = []

    out.append(terminal(
        'point-in-time-restore-terminal', C, 'p6', 'Advanced', 10,
        'Restore a SQL Server database to just before a mistake',
        'Use T-SQL to take a tail-log backup and restore to a point in time with STOPAT.',
        'At 14:33 on 2026-10-04 someone ran a DELETE without a WHERE clause against the Sales database on SQL Server (FULL recovery model). The last full backup and the log backups are available. Recover the database to 14:32 using T-SQL. Type commands exactly, or use an accepted equivalent.',
        [
            ('First capture the transactions that have not been backed up yet with a tail-log backup that leaves the database in a restoring state.',
             ["BACKUP LOG Sales TO DISK = 'D:\\bk\\Sales_tail.trn' WITH NORECOVERY", "BACKUP LOG Sales TO DISK = 'D:\\bk\\Sales_tail.trn' WITH NORECOVERY;", 'BACKUP LOG Sales WITH NORECOVERY'],
             'Processed 18 pages for database \'Sales\', file \'Sales_log\' on file 1.\nBACKUP LOG successfully processed 18 pages in 0.021 seconds.',
             'Use BACKUP LOG with the NORECOVERY option.'),
            ('Restore the last full backup, leaving the database ready to accept more restores.',
             ["RESTORE DATABASE Sales FROM DISK = 'D:\\bk\\Sales_full.bak' WITH NORECOVERY", "RESTORE DATABASE Sales FROM DISK = 'D:\\bk\\Sales_full.bak' WITH NORECOVERY;", 'RESTORE DATABASE Sales WITH NORECOVERY'],
             'RESTORE DATABASE successfully processed 40932 pages in 4.118 seconds.\nThe database is in a RESTORING state.',
             'Use RESTORE DATABASE with NORECOVERY so further restores can follow.'),
            ('Restore the tail-log backup, stopping at 14:32 on 2026-10-04, and bring the database online.',
             ["RESTORE LOG Sales FROM DISK = 'D:\\bk\\Sales_tail.trn' WITH STOPAT = '2026-10-04 14:32', RECOVERY", "RESTORE LOG Sales FROM DISK = 'D:\\bk\\Sales_tail.trn' WITH STOPAT = '2026-10-04 14:32', RECOVERY;", "RESTORE LOG Sales WITH STOPAT = '2026-10-04 14:32', RECOVERY"],
             'RESTORE LOG successfully processed 18 pages in 0.036 seconds.\nThe database is now online, recovered to 2026-10-04 14:32.',
             'Use RESTORE LOG with STOPAT and RECOVERY.'),
            ('Check the restored database for integrity.', ['DBCC CHECKDB (Sales)', 'DBCC CHECKDB(Sales)', 'DBCC CHECKDB (Sales);', 'DBCC CHECKDB Sales'],
             'CHECKDB found 0 allocation errors and 0 consistency errors in database \'Sales\'.',
             'Use DBCC CHECKDB on the database.'),
        ],
        [("BACKUP LOG <db> TO DISK = '<file>' WITH NORECOVERY", 'Tail-log backup that leaves the database restoring'), ("RESTORE DATABASE <db> FROM DISK = '<file>' WITH NORECOVERY", 'Restore a full backup and keep the chain open'),
         ("RESTORE LOG <db> FROM DISK = '<file>' WITH STOPAT = '<time>', RECOVERY", 'Replay the log to a moment and finish the restore'), ('DBCC CHECKDB (<db>)', 'Check database integrity'), ('RESTORE VERIFYONLY', 'Check that a backup file is readable')],
        'A tail-log backup captures the latest transactions first. The full backup is restored WITH NORECOVERY so the chain stays open, and the final log is restored with STOPAT just before the mistake and WITH RECOVERY to bring the database online. DBCC CHECKDB confirms integrity afterwards.'))

    out.append(sequence(
        'rolling-patch-ag-sequence', C, 'p6', 'Intermediate', 8,
        'Patch an availability group with minimal downtime',
        'Order a rolling update across the replicas of an Always On availability group.',
        'A two-replica availability group on Azure VMs needs a cumulative update. Arrange the steps from first to last.',
        ['Back up the databases and confirm the group is synchronized and healthy', 'Patch the secondary replica while the primary keeps serving', 'Wait for the secondary to resynchronize with the primary', 'Perform a planned manual failover to the patched secondary',
         'Patch the former primary', 'Confirm that both replicas are synchronized, and validate the applications'],
        'Patching the secondary first keeps the application online. After it resynchronizes, a planned failover (no data loss) makes it the primary, so the old primary can be patched, and the group is verified at the end.'))

    out.append(decision(
        'ha-dr-design-decision', C, 'p6', 'Intermediate', 9,
        'Turn RPO and RTO into an Azure SQL design',
        'Match three sets of recovery requirements to the right resilience options.',
        'A company runs three Azure SQL databases with different recovery requirements, and wants the least expensive option that still meets each.',
        [
            ('The payments database must not lose any committed data when a data center in the region fails, and must stay available. What fits?', ['A zone-redundant configuration', 'Geo-restore from backups', 'A weekly full backup', 'Point-in-time restore only'], 0,
             'Zone redundancy keeps synchronous copies in multiple zones of the region, giving near-zero data loss and automatic failover inside the region.'),
            ('The orders database must survive a whole-region outage with very little data loss and recover within a minute or two, without changing connection strings. What fits?', ['An auto-failover group with a secondary region', 'Geo-restore', 'Long-term retention backups', 'A larger service tier'], 0,
             'A failover group replicates asynchronously to a secondary region and provides read-write and read-only listener endpoints that follow the failover.'),
            ('A reporting archive can tolerate losing some recent data and several hours of downtime after a regional outage, and cost matters most. What fits?', ['Geo-restore from geo-redundant backups', 'A failover group with a readable secondary', 'An elastic pool', 'Zone redundancy'], 0,
             'Geo-restore is the cheapest cross-region option, which typically takes minutes or hours to recover and may lose some recent data.'),
        ],
        'Start with the RPO and RTO: zone redundancy for near-zero loss in a region, a failover group for seconds of loss across regions, and geo-restore when hours of loss and downtime are acceptable.'))

    out.append(scenario(
        'regional-outage-scenario', C, 'p6', 'Advanced', 11,
        'A regional outage hits the primary database',
        'Work through a regional failure when the database is protected by a failover group.',
        'The primary Azure region is reporting a major outage. A critical database is in a failover group with a secondary region, using a manual failover policy. Work the incident by choosing your action at each step.',
        ('Primary region outage, failover group in place', ['Reported by: Monitoring', 'Symptom: the primary database is unreachable', 'The failover group policy is manual, with a secondary region configured']),
        {
            'start': ('What is the best first action?', [
                ('Confirm the outage scope and the replication state of the secondary, then decide on a failover', 'step2', True),
                ('Restore a geo-restore copy into a new region immediately', 'end_bad_restore', False),
                ('Wait for several hours without a decision', 'end_bad_wait', False)]),
            'step2': ('The region outage is confirmed with no ETA, and the secondary was only seconds behind. What should you do?', [
                ('Initiate a forced failover of the failover group, accepting a small possible data loss', 'step3', True),
                ('Plan a failover that waits for the primary to be reachable again', 'end_bad_planned', False),
                ('Change every application\'s connection string to the secondary server name', 'end_bad_strings', False)]),
            'step3': ('The secondary is now primary and applications reconnect through the read-write listener. What next?', [
                ('Record the data-loss window, validate the applications, and rebuild geo-replication after the original region recovers', 'end_good', True),
                ('Delete the old primary immediately', 'end_bad_delete', False)]),
            'end_good': ('END', True, 'A forced failover restores service quickly when the primary cannot be reached, listener endpoints avoid connection string changes, and rebuilding replication and documenting the loss window completes the response.'),
            'end_bad_restore': ('END', False, 'Geo-restore is slower and cheaper, designed for databases without a replica. With a failover group in place, restoring from backups wastes time and discards the replica\'s newer data.'),
            'end_bad_wait': ('END', False, 'Doing nothing against a stated recovery objective prolongs the outage. A decision based on the secondary\'s state is needed.'),
            'end_bad_planned': ('END', False, 'A planned failover needs both sides healthy so it can synchronize first, which is impossible while the primary is unreachable. A forced failover is the right tool.'),
            'end_bad_strings': ('END', False, 'The failover group\'s listener endpoints exist so connection strings do not change; editing every application is slow and error-prone.'),
            'end_bad_delete': ('END', False, 'Deleting the old primary destroys the data you may need to reconcile and the ability to re-establish replication.'),
        },
        'With a manual failover group policy, you decide when to fail over. When the primary is unreachable, a forced failover accepts a small possible data loss to restore service, listener endpoints keep applications connected, and the old region is rebuilt as the new secondary afterwards.'))

    return out
