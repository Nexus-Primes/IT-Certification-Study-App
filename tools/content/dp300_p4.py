"""DP-300, domain p4 (Optimize Query Performance): index review, plan reading, maintenance, configuration, and IQP."""
import svg as S

DOMAIN = 'p4'
WEIGHT = 11


def build(b):
    b.objective('4.3', 'Maintenance and configuration', ['Index maintenance', 'Statistics and integrity', 'Scoped configuration', 'Server settings', 'Intelligent query processing'])
    b.topics['4.1'] = ['Clustered vs. nonclustered', 'Missing index recommendations', 'Fragmentation', 'Unused indexes']
    b.topics['4.2'] = ['Execution plan reading', 'Parameter sniffing', 'Statistics staleness', 'Key lookups', 'Sargable predicates', 'Implicit conversion']

    # ------------------------------------------------------------------------------------------ 4.1
    b.add('4.1', 'Unused and duplicate indexes',
          'Indexes that are never read (see sys.dm_db_index_usage_stats) or that duplicate another index\'s keys only add write cost and storage, so review them over a full business cycle before dropping.',
          'find indexes that slow down inserts and updates yet are never used by any query',
          ['Missing index recommendations', 'Filtered indexes', 'Columnstore indexes'],
          'Every index taxes WRITES — check usage across a full cycle (month end!) before dropping one.',
          S.steps([('Usage stats', 'reads versus writes'), ('Review a full cycle', 'month end, reports'), ('Drop safely', 'script it first')], title='Pruning indexes', tones=['blue', 'amber', 'green']),
          caption='Unused or duplicate indexes cost write performance and space; confirm over a full cycle, then drop.')

    # ------------------------------------------------------------------------------------------ 4.2
    b.add('4.2', 'Key lookup',
          'An execution-plan operator that fetches extra columns from the clustered index for each row found through a nonclustered index; many lookups over large row counts suggest adding INCLUDE columns so the index covers the query.',
          'remove an expensive key lookup in a plan that seeks a nonclustered index and then fetches columns row by row',
          ['A table scan', 'A hash match', 'A sort spill'],
          'A seek plus a lookup PER ROW — INCLUDE the missing columns to make the index covering.',
          S.steps([('Index seek', 'finds matching keys'), ('Key lookup', 'row-by-row fetch'), ('Fix', 'INCLUDE the columns')], title='Key lookup', tones=['blue', 'amber', 'green']),
          caption='A key lookup fetches missing columns row by row; a covering index with INCLUDE columns removes it.')

    b.add('4.2', 'Sargable predicate',
          'A predicate the optimizer can answer with an index seek because the column is not wrapped in a function or expression, for example OrderDate >= @start AND OrderDate < @end instead of YEAR(OrderDate) = 2025.',
          'rewrite WHERE YEAR(OrderDate) = 2025 so that an index on OrderDate can be used',
          ['Adding NOLOCK', 'Increasing MAXDOP', 'Forcing a hash join'],
          'Never wrap the COLUMN in a function — compare the bare column with a range.',
          S.compare(('Not sargable', ['WHERE YEAR(OrderDate) = 2025', 'Function on the column', 'Scans the index']), ('Sargable', ["WHERE OrderDate >= '2025-01-01'", "AND OrderDate < '2026-01-01'", 'Seeks the index']), title='Writing seekable filters', tones=('red', 'green')),
          caption='Predicates that leave the column bare can use an index seek; functions on the column force a scan.')

    b.add('4.2', 'Implicit conversion warning',
          'When a query compares values of different data types, SQL Server converts one side; converting the column side prevents index seeks and shows as a plan warning, for example an nvarchar parameter compared with a varchar column.',
          'fix a plan warning showing an implicit conversion that turned an index seek into a scan',
          ['A missing index warning', 'Parameter sniffing', 'A spilled sort'],
          'Match the parameter\'s data type to the COLUMN — converting the column side kills the seek.',
          S.compare(('Types differ', ['nvarchar parameter', 'varchar column converted', 'Index scan plus warning']), ('Types match', ['varchar parameter', 'No conversion', 'Index seek']), title='Data type mismatch', tones=('red', 'green')),
          caption='Mismatched data types force a conversion on the column and can turn a seek into a scan.')

    # ------------------------------------------------------------------------------------------ 4.3
    b.add('4.3', 'ALTER INDEX REORGANIZE',
          'An online, lightweight defragmentation of an index\'s leaf pages suited to moderate fragmentation (roughly 5 to 30 percent); it can be stopped and resumed without losing work and does not update statistics.',
          'choose the lighter maintenance operation for an index with about 15% fragmentation on a busy system',
          ['ALTER INDEX REBUILD OFFLINE', 'DROP INDEX and CREATE INDEX', 'UPDATE STATISTICS WITH FULLSCAN'],
          'Moderate fragmentation, lightweight and interruptible — rebuild is for heavy fragmentation.',
          S.table(['Fragmentation', 'Typical action'], [('Under about 5%', 'leave it alone'), ('About 5% to 30%', 'REORGANIZE'), ('Over about 30%', 'REBUILD')], title='Fragmentation guidance', col_widths=[0.45, 0.55]),
          caption='REORGANIZE is the light, online option for moderate fragmentation.')

    b.add('4.3', 'ALTER INDEX REBUILD',
          'Recreates an index to remove heavy fragmentation, refreshes its statistics with a full scan, and can run online or as a resumable operation so it can be paused; it uses more resources than REORGANIZE.',
          'recreate a heavily fragmented index and refresh its statistics, with the option to pause the operation',
          ['ALTER INDEX REORGANIZE', 'DBCC CHECKDB', 'Clearing the plan cache'],
          'REBUILD recreates the index and its statistics — REORGANIZE only shuffles leaf pages.',
          S.compare(('REORGANIZE', ['Leaf-level defragmentation', 'Always online', 'Statistics not updated']), ('REBUILD', ['Recreates the index', 'ONLINE or RESUMABLE option', 'Statistics updated (full scan)']), title='REORGANIZE vs REBUILD'),
          caption='REBUILD recreates the index and its statistics, and can be online or resumable.')

    b.add('4.3', 'Scheduled statistics updates (FULLSCAN)',
          'Auto-update statistics can lag after very large loads, so a scheduled UPDATE STATISTICS, with FULLSCAN where accuracy matters, keeps cardinality estimates correct and prevents poor plans.',
          'refresh statistics with a full scan after loading millions of rows so the optimizer estimates row counts correctly',
          ['ALTER INDEX REORGANIZE', 'DBCC CHECKDB', 'Clearing the plan cache'],
          'Big loads outrun the auto-update threshold — update manually, and use FULLSCAN for accuracy.',
          S.steps([('Large load', 'millions of rows'), ('Stale statistics', 'wrong row estimates'), ('UPDATE STATISTICS', 'FULLSCAN, then retest')], title='Refreshing statistics', tones=['plain', 'amber', 'green']),
          caption='After big loads, update statistics (FULLSCAN if needed) so the optimizer sees the real data.')

    b.add('4.3', 'DBCC CHECKDB',
          'Checks the physical and logical integrity of a database\'s pages and structures, scheduled regularly on SQL Server VMs and Managed Instance (often against a restored copy for large databases); REPAIR_ALLOW_DATA_LOSS is a last resort.',
          'verify that a database on a SQL Server VM has no page corruption, on a schedule',
          ['UPDATE STATISTICS', 'ALTER INDEX REBUILD', 'RESTORE VERIFYONLY'],
          'It checks PAGES and structures for corruption — RESTORE VERIFYONLY only confirms a backup file is readable.',
          S.terminal(['DBCC CHECKDB (Sales) WITH NO_INFOMSGS;', 'Command(s) completed successfully.', '-- repair options are a last resort'], title='T-SQL'),
          caption='DBCC CHECKDB verifies database integrity and should run on a schedule.')

    b.add('4.3', 'Database-scoped configuration',
          'ALTER DATABASE SCOPED CONFIGURATION sets per-database options such as MAXDOP, LEGACY_CARDINALITY_ESTIMATION, and PARAMETER_SNIFFING, so one database can behave differently without changing the server; it is the main tuning surface in Azure SQL Database.',
          'set MAXDOP to 4 for one database without changing the server or any other database',
          ['sp_configure', 'A startup trace flag', 'A Resource Governor pool'],
          'PER-database — sp_configure is instance-level and is not available in Azure SQL Database.',
          S.terminal(['ALTER DATABASE SCOPED CONFIGURATION', '  SET MAXDOP = 4;', 'ALTER DATABASE SCOPED CONFIGURATION', '  SET PARAMETER_SNIFFING = OFF;'], title='T-SQL'),
          caption='Database-scoped configuration changes optimizer and execution options for one database only.')

    b.add('4.3', 'Cost threshold for parallelism',
          'On SQL Server VMs and Managed Instance, this server setting decides how expensive a plan must be before it can go parallel; the default of 5 is usually raised (often to 50) so cheap queries stay serial, alongside a sensible MAXDOP and a max server memory that leaves room for the OS.',
          'stop cheap queries from going parallel and generating excess parallelism waits by raising a server setting',
          ['Setting MAXDOP to 0', 'Lowering max server memory', 'Optimize for ad hoc workloads'],
          'The default of 5 lets cheap queries go parallel — raising it keeps parallel plans for expensive queries.',
          S.facts([('Cost threshold', 'default 5, often raised to 50'), ('MAXDOP', 'limits threads per query'), ('Max server memory', 'leave room for the OS'), ('Scope', 'SQL Server VM and MI')], title='Server settings that matter'),
          caption='Raising the cost threshold for parallelism keeps cheap queries from going parallel.')

    b.add('4.3', 'Intelligent query processing (IQP)',
          'A family of optimizer features that improve performance after raising the compatibility level, with little or no code change, including adaptive joins, memory grant feedback, table variable deferred compilation, batch mode on rowstore, scalar UDF inlining, and parameter sensitive plan optimization.',
          'speed up queries after an upgrade by raising the compatibility level instead of rewriting them',
          ['Automatic index creation', 'Query Store forced plans', 'Resource Governor'],
          'It is gated by COMPATIBILITY LEVEL — raise it and the features apply with no application change.',
          S.hub(('Intelligent query processing', 'raise the compatibility level'), [('Adaptive joins', 'runtime join choice'), ('Memory grant feedback', 'right-sizes grants'), ('PSP optimization', 'plans per parameter range')]),
          caption='IQP features improve existing queries automatically once the compatibility level is raised.')

    b.add('4.3', 'Parameter sensitive plan (PSP) optimization',
          'At compatibility level 160 the optimizer can keep multiple cached plans for one parameterized query when parameter values have very different row counts, reducing parameter sniffing problems without hints.',
          'reduce parameter sniffing without hints by letting a query keep different plans for small and large parameter values',
          ['OPTION (RECOMPILE) on every query', 'Forcing one plan in Query Store', 'Clearing the plan cache hourly'],
          'Several plans for ONE query by parameter range — it needs compatibility level 160.',
          S.compare(('Before PSP', ['One cached plan', 'Good for the first value', 'Bad for skewed values']), ('With PSP (level 160)', ['Several plans per query', 'Chosen by parameter range', 'Fewer sniffing problems']), title='Parameter sensitive plans'),
          caption='PSP optimization keeps different plans for different parameter ranges of the same query.')

    b.add('4.3', 'Memory grant feedback',
          'The engine adjusts the memory grant for a repeated query based on earlier executions, shrinking over-grants and growing under-grants that spilled to tempdb (batch mode from compatibility level 140, row mode from 150).',
          'stop a repeated query from spilling to tempdb because its memory grant is too small, without adding hints',
          ['Adaptive joins', 'Table variable deferred compilation', 'Scalar UDF inlining'],
          'It learns from earlier EXECUTIONS to right-size the grant — both spills and over-grants shrink over time.',
          S.steps([('Run 1', 'grant too small, spill'), ('Feedback', 'engine adjusts the grant'), ('Run 2', 'right-sized, no spill')], title='Memory grant feedback', tones=['amber', 'blue', 'green']),
          caption='Memory grant feedback right-sizes a repeated query\'s memory grant based on earlier runs.')

    b.add('4.3', 'Adaptive joins',
          'The optimizer defers the choice between a nested loops join and a hash join until runtime, using the actual row count of the build input, which helps queries whose input size varies; it applies to batch mode plans (compatibility level 140 and higher, including rowstore queries once batch mode on rowstore applies).',
          'let one plan switch between nested loops and hash join depending on how many rows actually arrive',
          ['Parameter sensitive plan optimization', 'Memory grant feedback', 'Forced parallelism'],
          'The JOIN type is chosen at RUNTIME from the real row count — PSP chooses between whole plans instead.',
          S.steps([('Build input', 'rows counted at runtime'), ('Threshold check', 'few or many rows?'), ('Join chosen', 'nested loops or hash')], title='Adaptive join', tones=['plain', 'blue', 'green']),
          caption='An adaptive join picks nested loops or hash join at runtime based on the actual row count.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Index pruning and reading plans', ['4.1', '4.2'],
              'Indexes help reads and tax writes, so review indexes that are never used or that duplicate another, but check usage across a full business cycle before dropping any. In an execution plan, a nonclustered seek followed by key lookups on many rows suggests adding INCLUDE columns so the index covers the query.\n\n'
              'Write filters that leave the column bare (OrderDate >= @start AND OrderDate < @end) so an index seek is possible, and match parameter data types to column types, since an implicit conversion on the column side turns a seek into a scan and appears as a plan warning.')
    b.section('Maintenance, configuration, and intelligent query processing', ['4.3'],
              'Index maintenance follows fragmentation: leave low fragmentation alone, REORGANIZE (online, lightweight, no statistics update) for moderate, and REBUILD (recreates the index and updates statistics, with online and resumable options) for heavy. After very large loads update statistics manually, using FULLSCAN where accuracy matters, and schedule DBCC CHECKDB on SQL Server VMs and Managed Instance.\n\n'
              'Database-scoped configuration changes options such as MAXDOP and PARAMETER_SNIFFING for one database and is the main surface in Azure SQL Database, while instance settings such as cost threshold for parallelism (default 5, often raised) apply to SQL Server VMs and Managed Instance. Intelligent query processing features switch on with the compatibility level: adaptive joins and batch mode memory grant feedback at 140, row mode feedback at 150, and parameter sensitive plan optimization at 160.')
