"""DP-300, domain p5 (Automate Tasks): deployment automation, Azure-side tasks, and SQL Server Agent."""
import svg as S

DOMAIN = 'p5'
WEIGHT = 18


def build(b):
    b.objective('5.3', 'SQL Server Agent', ['Jobs, steps, schedules', 'Alerts and operators', 'Job failures and proxies'])
    b.topics['5.1'] = ['ARM/Bicep templates', 'CI/CD pipelines', 'PowerShell/CLI automation', 'What-if and deployment modes', 'Failed deployments']
    b.topics['5.2'] = ['SQL Agent / Elastic Jobs', 'Automated index maintenance', 'Long-term retention backups', 'Target groups', 'Runbooks', 'Action groups']

    # ------------------------------------------------------------------------------------------ 5.1
    b.add('5.1', 'What-if and incremental deployment mode',
          'The what-if operation previews which resources a Bicep or ARM deployment would create, change, or delete before it runs; Incremental mode (the default) adds or updates the resources in the template and leaves others alone, whereas Complete mode deletes resources that are not in the template.',
          'preview a template deployment and make sure it cannot delete other resources in the resource group',
          ['Complete deployment mode', 'Running the template twice', 'An Azure Resource Graph query'],
          'what-if SHOWS the changes first — Complete mode is the one that can delete things not in the template.',
          S.compare(('Incremental (default)', ['Adds or updates resources', 'Leaves other resources alone', 'The safe default']), ('Complete', ['Makes the group match the template', 'Deletes resources not listed', 'Use with care']), title='Deployment modes', tones=('green', 'red')),
          caption='what-if previews changes; Incremental mode leaves other resources alone while Complete mode can delete them.')

    b.add('5.1', 'Azure PowerShell and Azure CLI commands',
          'New-AzSqlServer and New-AzSqlDatabase (Azure PowerShell) and az sql server create and az sql db create (Azure CLI) script the same operations imperatively, and both run in pipelines and Cloud Shell on any platform.',
          'create a logical server and a database from a pipeline script using a cross-platform command-line tool',
          ['SSMS Object Explorer', 'The Azure portal blade', 'A DACPAC deployment'],
          'Both are imperative command-line tools for Azure resources — templates are the declarative alternative.',
          S.terminal(['New-AzSqlDatabase -ServerName sql01 -DatabaseName Sales', 'az sql db create -s sql01 -n Sales -g rg1', '# PowerShell cmdlets and CLI commands do the same job'], title='Automation commands'),
          caption='Azure PowerShell cmdlets and Azure CLI commands script resource creation from pipelines.')

    b.add('5.1', 'Troubleshooting a failed deployment',
          'Read the error code and message in the resource group\'s Deployments blade or the Activity log (for example a name already taken, a quota exceeded, or an invalid parameter), fix the template or parameter, and redeploy; what-if and validation catch many problems earlier.',
          'find out why a Bicep deployment of a SQL logical server failed with a name conflict',
          ['Query Store', 'sys.dm_exec_requests', 'SQL Agent job history'],
          'Deployment history and the ACTIVITY LOG show the failing operation and its error code.',
          S.steps([('Deployment fails', 'status shows Failed'), ('Read the error', 'Deployments, Activity log'), ('Fix and redeploy', 'template or parameter')], title='Diagnosing a deployment', tones=['red', 'blue', 'green']),
          caption='The Deployments blade and Activity log reveal why a deployment failed; fix and redeploy.')

    # ------------------------------------------------------------------------------------------ 5.2
    b.add('5.2', 'Elastic job target groups',
          'An elastic job agent runs T-SQL jobs against target groups, which can include or exclude servers, elastic pools, and individual databases, so one job fans out to many Azure SQL databases using database-scoped credentials or a managed identity.',
          'run one T-SQL job against every database in two elastic pools and exclude a test database',
          ['A SQL Server Agent job on the logical server', 'A multi-statement table-valued function', 'An Azure Data Factory copy activity'],
          'Target groups include or EXCLUDE servers, pools, and databases — Azure SQL Database has no SQL Server Agent.',
          S.hub(('Elastic job', 'T-SQL steps on a schedule'), [('Server', 'all its databases'), ('Elastic pool', 'every member'), ('Database', 'a single target')]),
          caption='An elastic job fans one T-SQL job out to every server, pool, and database in its target group.')

    b.add('5.2', 'Azure Automation runbook',
          'A PowerShell or Python runbook in an Azure Automation account, started on a schedule or by a webhook and using a managed identity, can scale a database, start or stop resources, or run T-SQL for tasks that sit outside the database engine\'s own scheduler.',
          'scale a database up every weekday morning and back down in the evening on a schedule',
          ['A SQL Server Agent alert', 'Query Store', 'An elastic pool'],
          'It schedules Azure RESOURCE operations such as scaling — jobs inside the database run T-SQL.',
          S.steps([('Schedule', 'morning and evening'), ('Runbook', 'Set-AzSqlDatabase'), ('Database scales', 'up, then down')], title='Scheduled scaling', tones=['plain', 'blue', 'green']),
          caption='An Automation runbook runs on a schedule to scale or manage Azure resources outside the database.')

    b.add('5.2', 'Action groups',
          'An Azure Monitor action group is a reusable list of notification and action targets, such as email, SMS, push, a webhook, a Logic App, or a Function, that alert rules call when they fire.',
          'reuse one list of notification targets (email, SMS, and a webhook) across many alert rules',
          ['A metric alert rule', 'A diagnostic setting', 'A SQL Server Agent operator'],
          'The WHO and HOW of notification — the alert rule decides WHEN to fire.',
          S.steps([('Alert rule', 'CPU above 90%'), ('Action group', 'email, SMS, webhook'), ('Responder', 'on-call DBA is paged')], title='Alert to action', tones=['amber', 'blue', 'green']),
          caption='Action groups define who and how to notify when Azure Monitor alert rules fire.')

    b.add('5.2', 'Troubleshooting automated tasks',
          'When a scheduled task fails, read the job or runbook history for the failing step and error, confirm credentials and permissions (job credential, managed identity), check firewall and network access, then rerun the step manually to isolate the cause.',
          'find out why a scheduled maintenance task fails every night with a login error',
          ['Raising the service tier', 'Rebuilding tempdb', 'Changing the connection policy to Redirect'],
          'History first, then identity and firewall — most scheduled-task failures are credentials or network, not the T-SQL.',
          S.steps([('Read history', 'failing step and error'), ('Check identity', 'credential, permissions'), ('Check access', 'firewall, network')], title='Troubleshooting a task', tones=['blue', 'amber', 'green']),
          caption='Start with the failing step\'s history, then check identity and network access.')

    # ------------------------------------------------------------------------------------------ 5.3
    b.add('5.3', 'SQL Server Agent jobs, steps, and schedules',
          'SQL Server Agent runs jobs made of steps (T-SQL, PowerShell, command line, and more) on schedules such as recurring, one-time, at Agent start, or when the CPU is idle; it exists on SQL Server and SQL Managed Instance but not in Azure SQL Database.',
          'run a nightly backup and index maintenance as a multi-step scheduled job on a SQL Server VM or Managed Instance',
          ['Elastic jobs', 'An Azure Automation runbook', 'A Windows scheduled task only'],
          'Jobs, steps, schedules — it exists on SQL Server and Managed Instance but NOT in Azure SQL Database.',
          S.table(['Offering', 'SQL Server Agent?'], [('SQL Server on Azure VM', 'yes'), ('Managed Instance', 'yes'), ('Azure SQL Database', 'no, use elastic jobs')], title='Where Agent is available', col_widths=[0.5, 0.5]),
          caption='SQL Server Agent schedules multi-step jobs on SQL Server and Managed Instance, not Azure SQL Database.')

    b.add('5.3', 'SQL Server Agent alerts and operators',
          'An alert fires on a SQL Server error number or severity, a performance condition, or a WMI event and then notifies an operator, usually by email through Database Mail, or runs a job; operators define who is notified and when.',
          'email the DBA team whenever any error of severity 19 to 25 occurs',
          ['A job schedule', 'A proxy account', 'A maintenance plan'],
          'The ALERT detects, the OPERATOR receives, and Database Mail delivers.',
          S.steps([('Alert', 'severity 19 to 25'), ('Operator', 'DBA team on call'), ('Notification', 'Database Mail email')], title='Agent alerting', tones=['amber', 'blue', 'green']),
          caption='Agent alerts react to errors or conditions and notify operators through Database Mail.')

    b.add('5.3', 'Troubleshooting Agent job failures (history and proxies)',
          'Diagnose a failed job from its history (Job Activity Monitor or msdb.dbo.sysjobhistory), reading the step output and error; steps that need different credentials run under a proxy account, and the Agent service account\'s permissions are a common cause of failures.',
          'diagnose a job step that fails with access denied when copying files from a network share',
          ['Increasing MAXDOP', 'Rebuilding statistics', 'Running the job more often'],
          'Read the STEP output in job history, then check the account the step runs as — a proxy supplies another identity.',
          S.steps([('Job history', 'step output and error'), ('Run-as account', 'service account or proxy'), ('Permissions', 'share, folder, database')], title='Why a job step fails', tones=['blue', 'amber', 'green']),
          caption='Job history shows the failing step; check which account it runs as and what that account may access.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Deployment automation in practice', ['5.1'],
              'The what-if operation previews what a Bicep or ARM deployment would create, change, or delete. Incremental mode (the default) adds or updates only what the template lists, while Complete mode deletes anything not in the template, so it is the one to treat carefully. Azure PowerShell and Azure CLI achieve the same results imperatively, which suits scripts and pipelines.\n\n'
              'When a deployment fails, open the resource group\'s Deployments blade or the Activity log, read the error code and message (a name conflict, an exceeded quota, an invalid parameter), fix the template or parameter, and redeploy.')
    b.section('Automating work across Azure SQL', ['5.2'],
              'Azure SQL Database has no SQL Server Agent, so elastic jobs fill the gap: an elastic job agent runs T-SQL against target groups that include or exclude servers, pools, and databases. For Azure-side operations such as scaling or start and stop, use an Azure Automation runbook with a managed identity on a schedule.\n\n'
              'Alert rules decide when to fire and action groups decide who is told and how (email, SMS, webhook, Logic App). When an automated task fails, read the history for the failing step first, then check credentials and permissions and network access.')
    b.section('SQL Server Agent', ['5.3'],
              'SQL Server Agent runs multi-step jobs on schedules on SQL Server and Managed Instance, but not in Azure SQL Database. Alerts watch for error numbers, severities, performance conditions, or WMI events and notify operators, usually by email through Database Mail, or start a job.\n\n'
              'To troubleshoot a failed job, read the step output in the job history, then check the account the step runs under: steps that need different credentials use a proxy account, and the Agent service account\'s permissions are a common cause of access-denied failures.')
