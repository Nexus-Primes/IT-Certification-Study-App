(function () {
  'use strict';
  window.DP300_LABS = [
  {
    "id": "failover-group-setup-sequence",
    "core": "core1",
    "domain": "p1",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Configure an auto-failover group for business continuity",
    "summary": "Put the steps for setting up cross-region automatic failover for a production database into the correct order.",
    "brief": "A critical production database needs to fail over automatically to a secondary region if the primary region becomes unavailable. Arrange the setup steps from first to last.",
    "steps": [
      "Deploy a secondary logical SQL server in the target failover region",
      "Confirm the secondary server's firewall and networking allow the expected traffic",
      "Create an auto-failover group between the primary and secondary logical servers",
      "Add the production database to the failover group",
      "Wait for initial data replication to the secondary to complete",
      "Update the application's connection string to use the failover group's read-write listener endpoint",
      "Test a manual failover during a maintenance window to confirm the process actually works"
    ],
    "explanation": "The secondary server and its networking are prerequisites that have to exist before a failover group can even be created between the two servers. Adding the database and waiting for replication come next, and pointing the application at the failover group's stable listener endpoint (rather than a specific server name) is what actually lets failover happen without an application reconfiguration. Testing a real failover last confirms the whole chain works before a genuine disaster forces the question."
  },
  {
    "id": "deployment-option-decision",
    "core": "core1",
    "domain": "p1",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Choose the right Azure SQL deployment option for a lift-and-shift migration",
    "summary": "Work through a migration's requirements one at a time to land on the right platform, compute model, and resilience configuration.",
    "brief": "A team is migrating an on-premises SQL Server instance that relies on cross-database queries, SQL Agent jobs, and linked servers, and wants the least possible re-engineering effort.",
    "stages": [
      {
        "question": "Given the cross-database queries and SQL Agent dependency, which offering fits best?",
        "options": [
          "Azure SQL Managed Instance",
          "Azure SQL Database",
          "SQL Server on an Azure VM"
        ],
        "correct": 0,
        "feedback": "Managed Instance supports cross-database queries and SQL Agent natively at the instance level. Azure SQL Database's single-database scope would break both features without significant rework, and a VM would work but throws away PaaS management benefits unnecessarily."
      },
      {
        "question": "The workload runs fairly steady, predictable load 24/7. Which compute model fits?",
        "options": [
          "Provisioned compute",
          "Serverless compute",
          "Elastic pool"
        ],
        "correct": 0,
        "feedback": "Provisioned compute reserves a fixed amount continuously, suited to steady round-the-clock load. Serverless's auto-pause benefit only pays off for intermittent, spiky workloads, which this isn't."
      },
      {
        "question": "The database must also survive an entire Azure region outage with minimal manual intervention. What should be added?",
        "options": [
          "An auto-failover group to a secondary region",
          "A nightly backup to blob storage only",
          "Nothing further — geo-redundant backup storage alone is enough"
        ],
        "correct": 0,
        "feedback": "Auto-failover groups provide automatic failover with a stable endpoint. Geo-redundant backup storage alone protects the backup copies, but restoring from backup after a regional outage takes far longer and isn't automatic."
      }
    ],
    "explanation": "Each decision narrows scope from a different angle — platform choice by feature parity with the source environment, compute model by the actual shape of the workload, and the HA/DR add-on by the specific resilience requirement, rather than defaulting to the most familiar or most expensive option at each step."
  },
  {
    "id": "deploy-sql-db-cli-terminal",
    "core": "core1",
    "domain": "p1",
    "type": "terminal",
    "difficulty": "Beginner",
    "minutes": 8,
    "title": "Deploy a new Azure SQL Database from the Azure CLI",
    "summary": "Use a simulated Azure CLI session to provision a logical server, open access to it, and create a database on it.",
    "brief": "A new application needs its own Azure SQL Database. Provision it from the command line, start to finish.",
    "terminal": [
      {
        "prompt": "First, create the logical SQL server that will host the new database.",
        "accepts": ["az sql server create --name sql-app01 --resource-group rg-app --admin-user sqladmin --admin-password <password>", "az sql server create"],
        "output": "{\n  \"name\": \"sql-app01\",\n  \"state\": \"Ready\"\n}",
        "hint": "Use az sql server create with a name, resource group, and admin credentials."
      },
      {
        "prompt": "Add a firewall rule so your own IP address can reach the server to manage it.",
        "accepts": ["az sql server firewall-rule create --resource-group rg-app --server sql-app01 --name AllowMyIP --start-ip-address 203.0.113.10 --end-ip-address 203.0.113.10", "az sql server firewall-rule create"],
        "output": "{\n  \"name\": \"AllowMyIP\",\n  \"startIpAddress\": \"203.0.113.10\"\n}",
        "hint": "Use az sql server firewall-rule create with a start and end IP address."
      },
      {
        "prompt": "Now create the database itself on that server, using the General Purpose tier.",
        "accepts": ["az sql db create --resource-group rg-app --server sql-app01 --name appdb --service-objective GP_Gen5_2", "az sql db create"],
        "output": "{\n  \"name\": \"appdb\",\n  \"status\": \"Online\"\n}",
        "hint": "Use az sql db create with the server name and a service objective."
      }
    ],
    "explanation": "The logical server has to exist before a database can be created on it, firewall access is required before you (or an app) can reach the server at all, and creating the database with an explicit service tier avoids landing on an unintended default size."
  },
  {
    "id": "security-control-decision",
    "core": "core1",
    "domain": "p2",
    "type": "decision",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "Choose the right control for a new compliance requirement",
    "summary": "Match three distinct compliance needs to three distinct data-protection controls instead of reaching for one and hoping it covers everything.",
    "brief": "A healthcare application's database must satisfy a new requirement: support staff can see patient records but not full SSNs, every access to a billing table must be independently auditable, and even a DBA shouldn't be able to read SSNs directly.",
    "stages": [
      {
        "question": "Support staff need to see most of a patient record but not the full SSN. Which control fits best?",
        "options": [
          "Dynamic Data Masking on the SSN column",
          "Transparent Data Encryption",
          "Row-level security"
        ],
        "correct": 0,
        "feedback": "Dynamic Data Masking hides part of a column's value from non-privileged users specifically in query results. TDE protects data at rest from someone stealing the physical files, and row-level security controls which rows are visible, not which columns."
      },
      {
        "question": "Every access to the billing table specifically must be independently auditable. What should be added?",
        "options": [
          "A SQL Audit specification scoped to the billing table",
          "Always Encrypted on the whole table",
          "A stricter firewall rule"
        ],
        "correct": 0,
        "feedback": "SQL Audit logs access events to a durable target and can be scoped to a specific table. Always Encrypted protects column values from ever being seen in plaintext by the database engine — a different goal than proving who accessed what."
      },
      {
        "question": "Compliance also requires that even a DBA with full database access can't read the SSN column's data directly. What closes that gap?",
        "options": [
          "Always Encrypted on the SSN column",
          "Dynamic Data Masking alone",
          "SQL Audit alone"
        ],
        "correct": 0,
        "feedback": "Dynamic Data Masking only hides display in query results — a sufficiently privileged user can still unmask it. Always Encrypted keeps the value encrypted end-to-end, including from a privileged DBA, since only the application holds the key."
      }
    ],
    "explanation": "Three distinct requirements need three distinct controls layered together — masking for casual staff-facing exposure, audit for accountability, and Always Encrypted for protecting the value even from privileged insiders — rather than one control stretched to cover all three."
  },
  {
    "id": "tde-byok-terminal",
    "core": "core1",
    "domain": "p2",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 9,
    "title": "Enable TDE with a customer-managed key",
    "summary": "Use a simulated PowerShell session to move a server's Transparent Data Encryption over to a customer-controlled Key Vault key.",
    "brief": "A compliance requirement mandates the organization directly control its own TDE encryption key rather than relying on the default Microsoft-managed key. Configure it from PowerShell.",
    "terminal": [
      {
        "prompt": "First, check what TDE protector is currently configured for the server.",
        "accepts": ["Get-AzSqlServerTransparentDataEncryptionProtector -ResourceGroupName rg-app -ServerName sql-app01", "Get-AzSqlServerTransparentDataEncryptionProtector"],
        "output": "ServerKeyType: ServiceManaged",
        "hint": "Use Get-AzSqlServerTransparentDataEncryptionProtector."
      },
      {
        "prompt": "It's using the default service-managed key. Add your Key Vault key to the server first.",
        "accepts": ["Add-AzSqlServerKeyVaultKey -ResourceGroupName rg-app -ServerName sql-app01 -KeyId https://kv-app.vault.azure.net/keys/tde-key/abc123", "Add-AzSqlServerKeyVaultKey"],
        "output": "KeyId: https://kv-app.vault.azure.net/keys/tde-key/abc123\nType: AzureKeyVault",
        "hint": "Use Add-AzSqlServerKeyVaultKey with the Key Vault key's URI."
      },
      {
        "prompt": "Now set that Key Vault key as the server's active TDE protector.",
        "accepts": ["Set-AzSqlServerTransparentDataEncryptionProtector -ResourceGroupName rg-app -ServerName sql-app01 -Type AzureKeyVault -KeyId https://kv-app.vault.azure.net/keys/tde-key/abc123", "Set-AzSqlServerTransparentDataEncryptionProtector"],
        "output": "ServerKeyType: AzureKeyVault\nStatus: Enabled",
        "hint": "Use Set-AzSqlServerTransparentDataEncryptionProtector -Type AzureKeyVault."
      }
    ],
    "explanation": "Checking the current state first avoids assuming, the key must be registered with the server before it can be selected at all, and setting it as the active protector is the step that actually switches encryption over to customer control."
  },
  {
    "id": "defender-alert-scenario",
    "core": "core1",
    "domain": "p2",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 12,
    "title": "Microsoft Defender for SQL flags an anomalous data access pattern",
    "summary": "Trace an overnight data-exfiltration alert through the right investigative steps to its actual root cause.",
    "brief": "Microsoft Defender for SQL raised an alert overnight for unusual data extraction on a production database.",
    "ticket": {
      "subject": "Anomalous data exfiltration pattern flagged on db-customers",
      "details": [
        "Reported by: Microsoft Defender for SQL",
        "Symptom: an application service account ran a SELECT * against the full customer table at 3am, far larger than its normal query pattern",
        "The account normally runs small, filtered lookups only"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the most efficient first step?",
        "options": [
          { "label": "Review the specific query text and the account's recent activity history to understand what actually ran", "next": "step2", "correct": true },
          { "label": "Immediately revoke all access for every service account", "next": "end_bad_revoke", "correct": false },
          { "label": "Ignore it since it's just a SELECT statement", "next": "end_bad_ignore", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The query is a full, unfiltered SELECT * that doesn't match anything in the application's normal code paths, run from an unfamiliar client IP. What next?",
        "options": [
          { "label": "Check the vulnerability assessment and sign-in history for that service account's credential for signs of compromise", "next": "step3", "correct": true },
          { "label": "Assume it's a one-off reporting request and close the alert", "next": "end_bad_dismiss", "correct": false }
        ]
      },
      "step3": {
        "prompt": "You confirm the service account's credential was exposed in a recent phishing incident targeting a developer. What's the correct response?",
        "options": [
          { "label": "Rotate the exposed credential immediately, revoke its active sessions, and review exactly what data the query returned", "next": "end_good", "correct": true },
          { "label": "Leave the credential as-is since the query itself didn't modify any data", "next": "end_bad_leave", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Rotating the exposed credential and revoking its sessions closes the actual hole quickly, and reviewing what the query returned scopes the real impact — the standard measured response of investigate, contain, then assess." },
      "end_bad_revoke": { "end": true, "success": false, "prompt": "Mass-revoking every service account's access breaks legitimate application functionality without ever confirming which single account is actually compromised." },
      "end_bad_ignore": { "end": true, "success": false, "prompt": "A full, unfiltered SELECT far outside a credential's normal pattern is exactly the kind of anomaly Defender for SQL is built to catch — dismissing it risks missing real exfiltration in progress." },
      "end_bad_dismiss": { "end": true, "success": false, "prompt": "Closing the alert before checking whether the credential itself was compromised skips the step that actually explains why this happened at all." },
      "end_bad_leave": { "end": true, "success": false, "prompt": "Leaving a confirmed-compromised credential active leaves the door open for further misuse, even though this specific query didn't write any data." }
    },
    "explanation": "The efficient path investigates before reacting, follows the evidence to the actual root cause — a phished, compromised credential — and then takes proportionate containment action rather than either overreacting (mass revocation) or underreacting (dismissing the alert)."
  },
  {
    "id": "perf-drop-diagnosis-sequence",
    "core": "core1",
    "domain": "p3",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Diagnose a sudden database performance drop",
    "summary": "Put the standard monitoring toolchain into the right broad-to-narrow order for chasing down a sudden slowdown.",
    "brief": "Users report a production database has become noticeably slower over the last hour, with no known recent deployment. Work through the diagnostic toolchain in order.",
    "steps": [
      "Check current resource utilization metrics (CPU/DTU/storage) for an obvious ceiling being hit",
      "Query sys.dm_exec_requests for what's currently executing and any long-running requests",
      "Check current wait statistics to see what queries are actually waiting on",
      "Review Query Store for any regressed query plans around the time performance dropped",
      "Check for an active blocking chain among currently running sessions",
      "Identify the specific query or plan responsible for the regression",
      "Apply the fix (e.g., force a known-good plan or add a missing index) and confirm the metrics recover"
    ],
    "explanation": "The order moves from broad to narrow: a high-level resource check first, then what's actually executing right now, then what it's waiting on, cross-referenced against Query Store for a plan regression in the right time window, with blocking checked explicitly since it's such a common concrete cause — only then narrowing to the exact culprit, applying a fix, and confirming recovery rather than assuming it worked."
  },
  {
    "id": "blocking-chain-terminal",
    "core": "core1",
    "domain": "p3",
    "type": "terminal",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Find and resolve an active blocking chain",
    "summary": "Use a simulated T-SQL session to identify a head blocker and safely clear it.",
    "brief": "Multiple users are reporting timeouts on a production database right now. Investigate using T-SQL from a query tool.",
    "terminal": [
      {
        "prompt": "First, find any sessions that are currently blocked and what's blocking them.",
        "accepts": ["SELECT session_id, blocking_session_id, wait_type, wait_time FROM sys.dm_exec_requests WHERE blocking_session_id <> 0", "sp_who2"],
        "output": "session_id  blocking_session_id  wait_type   wait_time\n71          62                   LCK_M_X     18400\n84          62                   LCK_M_X     12100",
        "hint": "Query sys.dm_exec_requests, filtering for blocking_session_id <> 0."
      },
      {
        "prompt": "Session 62 is the head blocker. Check what it's currently running.",
        "accepts": ["SELECT text FROM sys.dm_exec_requests r CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS t WHERE session_id = 62", "DBCC INPUTBUFFER(62)"],
        "output": "text\nUPDATE Orders SET Status = 'Shipped' WHERE CustomerId = 4471",
        "hint": "Join sys.dm_exec_requests to sys.dm_exec_sql_text, or use DBCC INPUTBUFFER."
      },
      {
        "prompt": "It's an open transaction that's sat uncommitted for 18 minutes with no client activity. End it to unblock the others.",
        "accepts": ["KILL 62"],
        "output": "Command(s) completed successfully.\nSession 62 terminated.",
        "hint": "Use KILL followed by the session id."
      }
    ],
    "explanation": "Identifying the blocking chain first avoids guessing which session is even the problem, confirming exactly what the head blocker is doing before acting against it avoids killing legitimate in-progress work, and the kill is applied only once it's confirmed to be a genuinely stuck, abandoned transaction."
  },
  {
    "id": "query-tuning-workflow-sequence",
    "core": "core1",
    "domain": "p4",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 10,
    "title": "Work through the standard query-tuning workflow for a slow report",
    "summary": "Put the standard steps for tuning a suddenly-slow query into the right cheapest-check-first order.",
    "brief": "A monthly report query has gone from 4 seconds to over 2 minutes, with no code change. Work through the standard tuning workflow in order.",
    "steps": [
      "Confirm the query's actual current execution plan, not an assumed one, using STATISTICS or the graphical plan",
      "Check whether statistics on the underlying tables are stale",
      "Update statistics if they're stale and re-test the query",
      "If the plan still performs poorly, check for a missing index recommendation for this query",
      "Test the query's performance with the recommended index added in a non-production environment",
      "Review the query for parameter sniffing symptoms if performance varies wildly between calls",
      "Apply the validated fix to production and monitor its impact"
    ],
    "explanation": "Always confirm the real plan before guessing at a cause. Stale statistics are the cheapest, most common cause to rule out first, missing indexes come next since they directly reshape the plan, and parameter sniffing is checked specifically when performance is inconsistent rather than uniformly bad. Any fix is validated outside production before being applied and monitored."
  },
  {
    "id": "parameter-sniffing-decision",
    "core": "core1",
    "domain": "p4",
    "type": "decision",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Diagnose a query that's fast for most customers and slow for a few",
    "summary": "Recognize the signature of parameter sniffing, confirm it with evidence, and apply a fix scoped to the actual cause.",
    "brief": "A stored procedure runs in under a second for most customers but takes over a minute for a handful of large enterprise customers, using the exact same query text every time.",
    "stages": [
      {
        "question": "What's the most likely cause of this specific pattern?",
        "options": [
          "Parameter sniffing — the cached plan was compiled for a small customer and doesn't suit large ones",
          "The database is simply out of storage space",
          "TLS is misconfigured",
          "The stored procedure has a syntax error"
        ],
        "correct": 0,
        "feedback": "Identical query text with wildly different performance by input size is the classic signature of parameter sniffing — a plan optimized for one parameter's data distribution performing poorly for a very different one."
      },
      {
        "question": "How can you confirm this diagnosis quickly?",
        "options": [
          "Check Query Store for multiple plans against the same query with very different average durations",
          "Rewrite the stored procedure from scratch",
          "Restart the SQL Server service",
          "Add more CPU cores to the server"
        ],
        "correct": 0,
        "feedback": "Query Store directly shows whether one query has multiple compiled plans and how their real runtime performance differs — the fastest way to confirm the suspicion without guessing."
      },
      {
        "question": "What's an appropriate fix?",
        "options": [
          "Force the better-performing plan via Query Store, or add OPTION (RECOMPILE) if plan reuse isn't valuable here",
          "Permanently disable the plan cache for the whole server",
          "Convert the stored procedure to a view",
          "Grant sysadmin to the application account"
        ],
        "correct": 0,
        "feedback": "Forcing a proven-good plan, or recompiling per-call when reuse doesn't help, directly targets the actual cause. Disabling the plan cache server-wide would hurt every other query on the instance for the sake of one problem query."
      }
    ],
    "explanation": "Recognizing the parameter-sniffing signature, confirming it concretely via Query Store rather than guessing, and applying a scoped fix rather than a blunt server-wide change is the efficient path through this exact class of problem."
  },
  {
    "id": "cicd-pipeline-sequence",
    "core": "core1",
    "domain": "p5",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Set up a CI/CD pipeline that deploys schema changes safely",
    "summary": "Put the steps for building an automated, tested schema-deployment pipeline into the correct order.",
    "brief": "A team wants schema changes to flow through the same automated pipeline as their application code, instead of being applied by hand. Arrange the setup steps.",
    "steps": [
      "Store the database schema definition (e.g., as a SQL Server Database Project) in source control",
      "Configure a build step that compiles the project into a DACPAC",
      "Add an automated test stage that deploys the DACPAC to a disposable test database",
      "Run schema-validation and data-integrity tests against that test database",
      "Gate the pipeline so it only proceeds to staging on a passing test stage",
      "Deploy the DACPAC to the staging database and run a final validation pass",
      "Deploy to production during an approved release window, with the pipeline logging exactly what changed"
    ],
    "explanation": "Source control comes first so schema changes are versioned like any other code. Build and test stages validate against a disposable database before anything touches staging or production, a gate prevents a broken change from progressing further, and the final production deployment happens in a controlled window with a clear audit trail of what actually changed."
  },
  {
    "id": "failed-maintenance-job-scenario",
    "core": "core1",
    "domain": "p5",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 12,
    "title": "A scheduled index-maintenance job silently stopped running",
    "summary": "Trace three weeks of creeping performance degradation back to a broken automation job, and fix the actual cause rather than just the symptom.",
    "brief": "Query performance has been slowly degrading over the past three weeks. Investigation reveals the nightly index-maintenance job hasn't actually run successfully in that entire time.",
    "ticket": {
      "subject": "Index maintenance job IX_Nightly_Maint has not completed successfully in 21 days",
      "details": [
        "Reported by: monthly performance review",
        "Symptom: index fragmentation has climbed steadily across several key tables",
        "SQL Agent shows the job as \"scheduled\" but its last 21 run history entries are all failures"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What's the most efficient first step?",
        "options": [
          { "label": "Open the job's step history to see the actual error message from a recent failed run", "next": "step2", "correct": true },
          { "label": "Immediately delete and recreate the job from scratch", "next": "end_bad_recreate", "correct": false },
          { "label": "Manually rebuild every index right now without checking why the job failed", "next": "end_bad_manual", "correct": false }
        ]
      },
      "step2": {
        "prompt": "The error shows the job's proxy account credential expired 21 days ago — right when the failures started. What should you check next?",
        "options": [
          { "label": "Confirm exactly what permissions the job step actually needs and whether a valid replacement credential is available", "next": "step3", "correct": true },
          { "label": "Grant the job's account full sysadmin rights to eliminate any possible permission issue", "next": "end_bad_sysadmin", "correct": false }
        ]
      },
      "step3": {
        "prompt": "A valid service account with the right permissions already exists but isn't yet linked to this job. What's the correct fix?",
        "options": [
          { "label": "Update the job step's credential to the valid service account, then run the job manually once to confirm it now succeeds", "next": "end_good", "correct": true },
          { "label": "Leave the job as-is and just rebuild indexes manually going forward", "next": "end_bad_manual2", "correct": false }
        ]
      },
      "end_good": { "end": true, "success": true, "prompt": "Fixing the actual expired-credential problem restores the automated job for the long term, and confirming with a manual run verifies the fix before trusting the next scheduled run." },
      "end_bad_recreate": { "end": true, "success": false, "prompt": "Recreating the job from scratch discards its configuration and history without ever finding out why it was actually failing, likely reintroducing the exact same problem." },
      "end_bad_manual": { "end": true, "success": false, "prompt": "Manually rebuilding indexes treats the symptom once but leaves the automation itself broken, guaranteeing the same slow degradation resumes." },
      "end_bad_sysadmin": { "end": true, "success": false, "prompt": "Granting sysadmin far exceeds what a maintenance job needs and violates least privilege for the sake of a problem that was actually just an expired credential." },
      "end_bad_manual2": { "end": true, "success": false, "prompt": "A one-time manual fix without repairing the job means fragmentation simply starts climbing again on the very same schedule." }
    },
    "explanation": "Checking the actual error before acting, scoping the fix to exactly what's needed rather than over-granting access, and confirming the automated path is truly restored — not just patched once by hand — is the efficient path through this class of problem."
  },
  {
    "id": "point-in-time-restore-terminal",
    "core": "core1",
    "domain": "p6",
    "type": "terminal",
    "difficulty": "Advanced",
    "minutes": 10,
    "title": "Restore a SQL Server database to just before a mistake",
    "summary": "Use T-SQL to take a tail-log backup and restore to a point in time with STOPAT.",
    "brief": "At 14:33 on 2026-10-04 someone ran a DELETE without a WHERE clause against the Sales database on SQL Server (FULL recovery model). The last full backup and the log backups are available. Recover the database to 14:32 using T-SQL. Type commands exactly, or use an accepted equivalent.",
    "explanation": "A tail-log backup captures the latest transactions first. The full backup is restored WITH NORECOVERY so the chain stays open, and the final log is restored with STOPAT just before the mistake and WITH RECOVERY to bring the database online. DBCC CHECKDB confirms integrity afterwards.",
    "terminal": [
      {
        "prompt": "First capture the transactions that have not been backed up yet with a tail-log backup that leaves the database in a restoring state.",
        "accepts": [
          "BACKUP LOG Sales TO DISK = 'D:\\bk\\Sales_tail.trn' WITH NORECOVERY",
          "BACKUP LOG Sales TO DISK = 'D:\\bk\\Sales_tail.trn' WITH NORECOVERY;",
          "BACKUP LOG Sales WITH NORECOVERY"
        ],
        "output": "Processed 18 pages for database 'Sales', file 'Sales_log' on file 1.\nBACKUP LOG successfully processed 18 pages in 0.021 seconds.",
        "hint": "Use BACKUP LOG with the NORECOVERY option."
      },
      {
        "prompt": "Restore the last full backup, leaving the database ready to accept more restores.",
        "accepts": [
          "RESTORE DATABASE Sales FROM DISK = 'D:\\bk\\Sales_full.bak' WITH NORECOVERY",
          "RESTORE DATABASE Sales FROM DISK = 'D:\\bk\\Sales_full.bak' WITH NORECOVERY;",
          "RESTORE DATABASE Sales WITH NORECOVERY"
        ],
        "output": "RESTORE DATABASE successfully processed 40932 pages in 4.118 seconds.\nThe database is in a RESTORING state.",
        "hint": "Use RESTORE DATABASE with NORECOVERY so further restores can follow."
      },
      {
        "prompt": "Restore the tail-log backup, stopping at 14:32 on 2026-10-04, and bring the database online.",
        "accepts": [
          "RESTORE LOG Sales FROM DISK = 'D:\\bk\\Sales_tail.trn' WITH STOPAT = '2026-10-04 14:32', RECOVERY",
          "RESTORE LOG Sales FROM DISK = 'D:\\bk\\Sales_tail.trn' WITH STOPAT = '2026-10-04 14:32', RECOVERY;",
          "RESTORE LOG Sales WITH STOPAT = '2026-10-04 14:32', RECOVERY"
        ],
        "output": "RESTORE LOG successfully processed 18 pages in 0.036 seconds.\nThe database is now online, recovered to 2026-10-04 14:32.",
        "hint": "Use RESTORE LOG with STOPAT and RECOVERY."
      },
      {
        "prompt": "Check the restored database for integrity.",
        "accepts": [
          "DBCC CHECKDB (Sales)",
          "DBCC CHECKDB(Sales)",
          "DBCC CHECKDB (Sales);",
          "DBCC CHECKDB Sales"
        ],
        "output": "CHECKDB found 0 allocation errors and 0 consistency errors in database 'Sales'.",
        "hint": "Use DBCC CHECKDB on the database."
      }
    ],
    "commands": [
      {
        "cmd": "BACKUP LOG <db> TO DISK = '<file>' WITH NORECOVERY",
        "desc": "Tail-log backup that leaves the database restoring"
      },
      {
        "cmd": "RESTORE DATABASE <db> FROM DISK = '<file>' WITH NORECOVERY",
        "desc": "Restore a full backup and keep the chain open"
      },
      {
        "cmd": "RESTORE LOG <db> FROM DISK = '<file>' WITH STOPAT = '<time>', RECOVERY",
        "desc": "Replay the log to a moment and finish the restore"
      },
      {
        "cmd": "DBCC CHECKDB (<db>)",
        "desc": "Check database integrity"
      },
      {
        "cmd": "RESTORE VERIFYONLY",
        "desc": "Check that a backup file is readable"
      }
    ]
  },
  {
    "id": "rolling-patch-ag-sequence",
    "core": "core1",
    "domain": "p6",
    "type": "sequence",
    "difficulty": "Intermediate",
    "minutes": 8,
    "title": "Patch an availability group with minimal downtime",
    "summary": "Order a rolling update across the replicas of an Always On availability group.",
    "brief": "A two-replica availability group on Azure VMs needs a cumulative update. Arrange the steps from first to last.",
    "explanation": "Patching the secondary first keeps the application online. After it resynchronizes, a planned failover (no data loss) makes it the primary, so the old primary can be patched, and the group is verified at the end.",
    "steps": [
      "Back up the databases and confirm the group is synchronized and healthy",
      "Patch the secondary replica while the primary keeps serving",
      "Wait for the secondary to resynchronize with the primary",
      "Perform a planned manual failover to the patched secondary",
      "Patch the former primary",
      "Confirm that both replicas are synchronized, and validate the applications"
    ]
  },
  {
    "id": "ha-dr-design-decision",
    "core": "core1",
    "domain": "p6",
    "type": "decision",
    "difficulty": "Intermediate",
    "minutes": 9,
    "title": "Turn RPO and RTO into an Azure SQL design",
    "summary": "Match three sets of recovery requirements to the right resilience options.",
    "brief": "A company runs three Azure SQL databases with different recovery requirements, and wants the least expensive option that still meets each.",
    "explanation": "Start with the RPO and RTO: zone redundancy for near-zero loss in a region, a failover group for seconds of loss across regions, and geo-restore when hours of loss and downtime are acceptable.",
    "stages": [
      {
        "question": "The payments database must not lose any committed data when a data center in the region fails, and must stay available. What fits?",
        "options": [
          "A zone-redundant configuration",
          "Geo-restore from backups",
          "A weekly full backup",
          "Point-in-time restore only"
        ],
        "correct": 0,
        "feedback": "Zone redundancy keeps synchronous copies in multiple zones of the region, giving near-zero data loss and automatic failover inside the region."
      },
      {
        "question": "The orders database must survive a whole-region outage with very little data loss and recover within a minute or two, without changing connection strings. What fits?",
        "options": [
          "An auto-failover group with a secondary region",
          "Geo-restore",
          "Long-term retention backups",
          "A larger service tier"
        ],
        "correct": 0,
        "feedback": "A failover group replicates asynchronously to a secondary region and provides read-write and read-only listener endpoints that follow the failover."
      },
      {
        "question": "A reporting archive can tolerate losing some recent data and several hours of downtime after a regional outage, and cost matters most. What fits?",
        "options": [
          "Geo-restore from geo-redundant backups",
          "A failover group with a readable secondary",
          "An elastic pool",
          "Zone redundancy"
        ],
        "correct": 0,
        "feedback": "Geo-restore is the cheapest cross-region option, which typically takes minutes or hours to recover and may lose some recent data."
      }
    ]
  },
  {
    "id": "regional-outage-scenario",
    "core": "core1",
    "domain": "p6",
    "type": "scenario",
    "difficulty": "Advanced",
    "minutes": 11,
    "title": "A regional outage hits the primary database",
    "summary": "Work through a regional failure when the database is protected by a failover group.",
    "brief": "The primary Azure region is reporting a major outage. A critical database is in a failover group with a secondary region, using a manual failover policy. Work the incident by choosing your action at each step.",
    "explanation": "With a manual failover group policy, you decide when to fail over. When the primary is unreachable, a forced failover accepts a small possible data loss to restore service, listener endpoints keep applications connected, and the old region is rebuilt as the new secondary afterwards.",
    "ticket": {
      "subject": "Primary region outage, failover group in place",
      "details": [
        "Reported by: Monitoring",
        "Symptom: the primary database is unreachable",
        "The failover group policy is manual, with a secondary region configured"
      ]
    },
    "startNode": "start",
    "nodes": {
      "start": {
        "prompt": "What is the best first action?",
        "options": [
          {
            "label": "Confirm the outage scope and the replication state of the secondary, then decide on a failover",
            "next": "step2",
            "correct": true
          },
          {
            "label": "Restore a geo-restore copy into a new region immediately",
            "next": "end_bad_restore",
            "correct": false
          },
          {
            "label": "Wait for several hours without a decision",
            "next": "end_bad_wait",
            "correct": false
          }
        ]
      },
      "step2": {
        "prompt": "The region outage is confirmed with no ETA, and the secondary was only seconds behind. What should you do?",
        "options": [
          {
            "label": "Initiate a forced failover of the failover group, accepting a small possible data loss",
            "next": "step3",
            "correct": true
          },
          {
            "label": "Plan a failover that waits for the primary to be reachable again",
            "next": "end_bad_planned",
            "correct": false
          },
          {
            "label": "Change every application's connection string to the secondary server name",
            "next": "end_bad_strings",
            "correct": false
          }
        ]
      },
      "step3": {
        "prompt": "The secondary is now primary and applications reconnect through the read-write listener. What next?",
        "options": [
          {
            "label": "Record the data-loss window, validate the applications, and rebuild geo-replication after the original region recovers",
            "next": "end_good",
            "correct": true
          },
          {
            "label": "Delete the old primary immediately",
            "next": "end_bad_delete",
            "correct": false
          }
        ]
      },
      "end_good": {
        "end": true,
        "success": true,
        "prompt": "A forced failover restores service quickly when the primary cannot be reached, listener endpoints avoid connection string changes, and rebuilding replication and documenting the loss window completes the response."
      },
      "end_bad_restore": {
        "end": true,
        "success": false,
        "prompt": "Geo-restore is slower and cheaper, designed for databases without a replica. With a failover group in place, restoring from backups wastes time and discards the replica's newer data."
      },
      "end_bad_wait": {
        "end": true,
        "success": false,
        "prompt": "Doing nothing against a stated recovery objective prolongs the outage. A decision based on the secondary's state is needed."
      },
      "end_bad_planned": {
        "end": true,
        "success": false,
        "prompt": "A planned failover needs both sides healthy so it can synchronize first, which is impossible while the primary is unreachable. A forced failover is the right tool."
      },
      "end_bad_strings": {
        "end": true,
        "success": false,
        "prompt": "The failover group's listener endpoints exist so connection strings do not change; editing every application is slow and error-prone."
      },
      "end_bad_delete": {
        "end": true,
        "success": false,
        "prompt": "Deleting the old primary destroys the data you may need to reconcile and the ability to re-establish replication."
      }
    }
  }
  ];
})();
