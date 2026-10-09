"""DP-300, domain p3 (Monitor and Optimize Operational Resources): baselines, metric sources, and reading the numbers."""
import svg as S

DOMAIN = 'p3'
WEIGHT = 11


def build(b):
    b.topics['3.1'] = ['Query Store', 'Extended Events', 'Azure SQL Analytics', 'Baselines', 'Platform metrics', 'Database watcher', 'Intelligent Insights']
    b.topics['3.2'] = ['Dynamic management views', 'Wait statistics', 'Resource utilization metrics', 'Resource history DMVs', 'Blocking and deadlocks']

    # ------------------------------------------------------------------------------------------ 3.1
    b.add('3.1', 'Operational performance baseline',
          'A record of normal CPU, I/O, memory, wait, and query metrics captured over representative periods, including peaks, used as the reference for judging whether current behavior is abnormal and for capacity planning.',
          'decide whether today\'s 70% CPU is a problem by comparing it with what is normal for this database at this time of the week',
          ['A single snapshot taken today', 'The default alert threshold', 'A forced query plan'],
          'Without a BASELINE you cannot tell normal from abnormal — capture it before problems start.',
          S.steps([('Collect', 'CPU, IO, waits, queries'), ('Cover peaks', 'weekdays, month end'), ('Compare', 'today versus normal')], title='Building a baseline', tones=['blue', 'amber', 'green']),
          caption='A baseline records what normal looks like so abnormal behavior and growth are easy to see.')

    b.add('3.1', 'Azure Monitor platform metrics',
          'Built-in numeric metrics such as CPU percentage, DTU or data IO percentage, storage used, and deadlocks, collected automatically and chartable or alertable with no configuration inside the database.',
          'chart CPU percentage and set an alert on it without running any T-SQL',
          ['Query Store', 'Extended Events', 'sys.dm_exec_requests'],
          'Automatic outside-in numbers — Query Store and DMVs explain WHAT inside the database used the resources.',
          S.compare(('Platform metrics', ['CPU, DTU, storage percent', 'No setup needed', 'Chart and alert']), ('Inside the database', ['DMVs and Query Store', 'Shows which query', 'Needs T-SQL']), title='Where the numbers come from'),
          caption='Platform metrics come from Azure Monitor automatically; DMVs and Query Store show what inside the database caused them.')

    b.add('3.1', 'Database watcher',
          'A managed monitoring solution, currently in preview, that collects detailed workload data from DMVs for Azure SQL Database (including elastic pools) and Managed Instance into a data store in your subscription, Azure Data Explorer or Real-Time Analytics in Fabric, with ready-made dashboards; you create a watcher resource instead of installing agents.',
          'monitor a large fleet of Azure SQL databases in one set of dashboards without deploying agents',
          ['Query Performance Insight', 'SQL Server Profiler', 'Intelligent Insights'],
          'Fleet-wide DMV collection into a central store with dashboards — Query Performance Insight looks at one database.',
          S.steps([('Watcher', 'collects DMV data'), ('Data store', 'Data Explorer or Fabric'), ('Dashboards', 'fleet and single database')], title='Database watcher', tones=['plain', 'blue', 'green']),
          caption='Database watcher collects DMV data from many Azure SQL resources into central dashboards.')

    b.add('3.1', 'Intelligent Insights',
          'Built-in intelligence that detects disruptive events in Azure SQL Database, such as reaching resource limits, locking, and plan regressions, and writes a diagnostics log with root-cause analysis once the SQLInsights log is enabled.',
          'get automatic root-cause analysis of a performance degradation without digging through DMVs by hand',
          ['Automatic tuning', 'Query Store forced plans', 'A metric alert'],
          'It EXPLAINS a degradation (root cause) — automatic tuning is the feature that FIXES some of them.',
          S.steps([('Detect', 'a disruptive event'), ('Analyze', 'root cause'), ('Diagnostics log', 'SQLInsights output')], title='Intelligent Insights', tones=['amber', 'blue', 'green']),
          caption='Intelligent Insights detects performance events and writes a root-cause diagnostics log.')

    # ------------------------------------------------------------------------------------------ 3.2
    b.add('3.2', 'sys.dm_db_resource_stats and sys.resource_stats',
          'sys.dm_db_resource_stats, in the user database, reports CPU, data IO, log IO, and memory in 15-second samples for about the last hour, while sys.resource_stats, in master, keeps 5-minute samples for about two weeks.',
          'find where to see resource usage for the last hour at fine detail and for the last two weeks at coarse detail',
          ['sys.dm_exec_sessions and sys.dm_exec_connections', 'sys.dm_os_wait_stats', 'sys.dm_tran_locks'],
          'Two views, two time scales — fine and recent in the database, coarse and longer in master.',
          S.compare(('sys.dm_db_resource_stats', ['In the user database', '15-second samples', 'About the last hour']), ('sys.resource_stats', ['In master', '5-minute samples', 'About 14 days']), title='Resource history'),
          caption='dm_db_resource_stats gives recent fine detail; sys.resource_stats gives about two weeks at coarser detail.')

    b.add('3.2', 'Reading CPU, data IO, and log IO percentages',
          'High CPU percent with low data IO suggests compute-bound queries (tune the queries or add compute), high data IO percent suggests scans or missing indexes, and high log IO percent suggests heavy write activity; values sustained near 100% mean a tier limit is being hit.',
          'decide whether to tune queries or scale up when CPU stays near 100% while data IO stays low',
          ['Adding a read replica', 'Switching to a smaller tier', 'Disabling Query Store'],
          'Which percentage is high says WHAT is constrained — look at the queries before simply scaling.',
          S.table(['Metric high', 'Likely cause'], [('CPU %', 'compute-heavy queries'), ('Data IO %', 'scans, missing indexes'), ('Log IO %', 'heavy write activity'), ('Workers %', 'too many concurrent requests')], title='Reading the percentages', col_widths=[0.35, 0.65]),
          caption='The metric that is high points to the constrained resource and the likely kind of workload problem.')

    b.add('3.2', 'Row versioning (RCSI) to reduce blocking',
          'READ_COMMITTED_SNAPSHOT lets readers use row versions instead of shared locks so readers stop blocking writers; it is on by default in Azure SQL Database and costs version store space in tempdb or the database.',
          'reduce readers blocking writers without rewriting the application',
          ['Raising the isolation level to SERIALIZABLE', 'Adding NOLOCK hints everywhere', 'Increasing the service tier'],
          'Readers use VERSIONS instead of locks — NOLOCK risks dirty reads and does not fix the design.',
          S.compare(('Without row versioning', ['Readers take shared locks', 'Writers wait for readers', 'More blocking']), ('With RCSI', ['Readers use row versions', 'Readers do not block writers', 'Version store grows']), title='Read committed behavior', tones=('amber', 'green')),
          caption='Row versioning removes reader-writer blocking at the cost of version store space.')

    b.add('3.2', 'Deadlock (error 1205)',
          'Two or more sessions each hold a lock the other needs, so the engine ends one as the victim with error 1205; capture the deadlock graph with the system_health Extended Events session and fix it with a consistent access order, shorter transactions, or better indexes.',
          'diagnose intermittent error 1205 in which the engine chose one transaction as a victim',
          ['Plain blocking', 'A lock timeout (error 1222)', 'A full transaction log'],
          'A CYCLE of waits ends with a victim — plain blocking clears once the head blocker finishes.',
          S.steps([('Session A', 'holds lock 1, wants 2'), ('Session B', 'holds lock 2, wants 1'), ('Victim killed', 'error 1205')], title='Anatomy of a deadlock', tones=['blue', 'amber', 'red']),
          caption='A deadlock is a cycle of lock waits that the engine resolves by killing one session.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Baselines and where metrics come from', ['3.1'],
              'Start with a baseline: record normal CPU, I/O, memory, waits, and query behavior across representative periods, including peaks, so abnormal behavior and growth are obvious. Metrics come from layers: Azure Monitor platform metrics (CPU, DTU, storage) arrive automatically and can be alerted on, while DMVs, Query Store, and Extended Events inside the database show which queries used the resources.\n\n'
              'For fleets, database watcher collects DMV data from many Azure SQL resources into a central store with dashboards and needs no agents. Intelligent Insights detects disruptive events such as resource limits, locking, and plan regressions and writes a root-cause diagnostics log; it explains problems, whereas automatic tuning fixes some of them.')
    b.section('Reading metrics and resolving contention', ['3.2'],
              'sys.dm_db_resource_stats (in the database) gives about an hour of 15-second samples and sys.resource_stats (in master) gives about two weeks of 5-minute samples. Read the percentages: high CPU with low data IO suggests compute-bound queries, high data IO suggests scans or missing indexes, and high log IO suggests heavy writes.\n\n'
              'Readers blocking writers is reduced by row versioning (READ_COMMITTED_SNAPSHOT, on by default in Azure SQL Database), not by NOLOCK. A deadlock is a cycle of waits that ends with a victim (error 1205); capture the graph with the system_health session and fix the access order, transaction length, or indexing.')
