(function () {
  'use strict';
  window.DP300_GUIDE = [
  {
    "domain": "p1",
    "overview": "Before you can secure, monitor, or tune anything, you first have to choose the right Azure SQL offering, size it correctly for the actual workload, and build in enough resilience that a regional outage doesn't become a business-ending event. This domain is about those foundational deployment decisions.",
    "sections": [
      {
        "heading": "Choosing a deployment offering",
        "objectives": ["1.1"],
        "body": "Azure SQL Database, Managed Instance, and SQL Server on an Azure VM sit on a spectrum of management scope. Azure SQL Database is fully managed PaaS with the database itself as the top-level unit — the least patching and maintenance burden, but no cross-database queries or SQL Agent. Managed Instance gives you an instance-level surface much closer to on-premises SQL Server, supporting cross-database queries and SQL Agent, at a bit more management overhead. SQL Server on an Azure VM is full IaaS — complete OS and SQL Server control, and full responsibility for patching both.\n\nWithin Azure SQL Database itself, the DTU model bundles compute, memory, and I/O into one blended unit for simple sizing, while the vCore model lets you choose compute and storage independently, mapping more directly to physical hardware specs — useful when comparing against known on-premises capacity. The Hyperscale tier is built specifically for very large databases (up to 100TB), with fast storage autogrowth and rapid backups regardless of size. And within compute, provisioned reserves a fixed amount continuously for steady, predictable workloads, while serverless auto-scales and can pause entirely during idle time — better suited to intermittent, spiky usage where the pausing genuinely saves money."
      },
      {
        "heading": "Scale and performance configuration",
        "objectives": ["1.2"],
        "body": "An elastic pool lets multiple databases share one pool of compute and storage resources instead of each being provisioned for its own worst-case peak — efficient when many databases have unpredictable, non-overlapping usage spikes. Read scale-out routes read-only connections to a secondary replica, keeping reporting or analytics load off the primary that's handling writes. The serverless compute tier moves through a simple lifecycle: active while serving connections, auto-paused after an idle timeout (billing stops), and resumed automatically the moment a new connection arrives.\n\nDatabase sharding splits one large dataset horizontally across multiple independent databases, each holding its own complete slice — distinct from an elastic pool, which shares compute across databases that each still hold their own separate, complete dataset. A resource governor limits the CPU, memory, and I/O a specific workload can consume within a single instance, preventing one runaway query from starving everything else sharing it. And it's worth planning around the fact that changing a database's compute tier or size typically causes a brief connection interruption during the switch itself — worth doing during a maintenance window, not mid-peak."
      },
      {
        "heading": "High availability and disaster recovery",
        "objectives": ["1.3"],
        "body": "An auto-failover group gives you a stable, region-spanning listener endpoint that fails over to a secondary region automatically if the primary becomes unavailable — the application never has to reconnect to a different server name. Zone-redundant configuration spreads replicas across availability zones within a single region, protecting against a single datacenter failure without the added complexity of a second region. Active geo-replication goes further still, maintaining up to four readable secondary replicas in other regions, each individually promotable to primary if needed.\n\nThe SLA a given tier guarantees — the contractual uptime percentage — varies by tier and configuration, with higher, zone-redundant tiers guaranteeing more; auto-failover groups and geo-replication are the technical mechanisms that actually help achieve that target, not the guarantee itself. Backup storage redundancy adds another layer entirely: locally-redundant (one datacenter), zone-redundant (across zones in one region), or geo-redundant (a paired region too) storage for the backups themselves, trading cost against how wide a disaster the backups can survive. Point-in-time restore rounds this out by letting you recover a database to any specific moment within the retention window — the tool for recovering from an accidental bad query, not an infrastructure failure."
      }
    ]
  },
  {
    "domain": "p2",
    "overview": "Securing an Azure SQL environment happens in layers: controlling who can even log in, protecting the data itself so it stays unreadable even if someone gets past that first layer, and compliance controls that limit exposure and prove who accessed what.",
    "sections": [
      {
        "heading": "Authentication and authorization",
        "objectives": ["2.1"],
        "body": "Azure AD authentication centralizes identity, MFA, and conditional access through Microsoft Entra ID; SQL authentication is a separate, local username-and-password credential managed entirely within SQL Server itself. A contained database user authenticates directly against a specific database, with no matching server-level login required at all — useful for portability, since the user definition moves with the database. Server-level roles govern instance-wide capability; database-level roles scope permissions to just one database — a distinction that matters because a login getting you in the door at the server doesn't automatically mean a corresponding user exists letting you do anything inside a specific database.\n\nAn Azure AD admin assignment designates a specific Azure AD user or security group as the administrator for a logical SQL server, centralizing Azure AD-based access management for every database on it. The login-versus-user distinction is foundational: a login authenticates at the server level, while a user is mapped inside a specific database and grants permissions there — both are required for normal, non-contained access. And when the built-in fixed database roles don't precisely match a needed permission set, a custom database role lets you group together an exact, tailored combination instead."
      },
      {
        "heading": "Data protection",
        "objectives": ["2.2"],
        "body": "Transparent Data Encryption (TDE) encrypts data files, logs, and backups at rest, transparently — no application changes required, encryption and decryption happen automatically. Always Encrypted goes further, encrypting data client-side so the database engine itself never sees plaintext at all — the app holds the key, not the server. TLS enforcement requires a minimum TLS version for every connection, refusing plaintext connections outright to protect data in transit.\n\nTDE normally uses a Microsoft-managed key, but TDE with customer-managed keys (BYOK) points it at a key stored in Azure Key Vault instead, giving the customer direct control over rotation and revocation — a requirement some compliance frameworks specifically demand. Always Encrypted with secure enclaves extends the standard Always Encrypted model by allowing certain limited operations, like pattern matching, to run on data that stays encrypted outside a protected hardware boundary — far more flexible than what plain Always Encrypted alone permits. Azure Key Vault integration ties all of this together as a single hardened secret store, backing TDE keys, Always Encrypted, and connection secrets from one central, auditable location rather than scattering key management across every feature separately."
      },
      {
        "heading": "Compliance controls",
        "objectives": ["2.3"],
        "body": "Dynamic Data Masking hides part of a column's value from non-privileged users specifically in query results — the underlying stored data is completely unchanged, only what's displayed to that user is altered. Row-level security applies a filtering predicate so a query only ever returns the rows a given user is allowed to see, transparently, without the application needing to add its own filtering logic. SQL Audit logs access events to a durable target — storage, Log Analytics, or Event Hub — and can be scoped down to something as specific as a single sensitive table, which is what actually makes it possible to prove who accessed what and when.\n\nMicrosoft Defender for SQL bundles vulnerability assessment and live threat detection together under one umbrella capability. Vulnerability assessment specifically runs a recurring scan against a security best-practice baseline, surfacing findings ranked by risk that need to be remediated or explicitly accepted. Data classification and labeling tags columns by sensitivity level, which is what makes it practical to actually track and audit exposure of the most sensitive data — you can't reasonably prioritize protecting what hasn't first been identified and labeled as sensitive in the first place."
      }
    ]
  },
  {
    "domain": "p3",
    "overview": "You can't fix what you can't see. This domain covers the tools available for watching a database's health and performance, and — just as important — how to actually read what those tools are telling you when something needs attention.",
    "sections": [
      {
        "heading": "Configuring monitoring",
        "objectives": ["3.1"],
        "body": "Query Store automatically captures every query's execution plan and runtime stats directly inside the database, surviving restarts and failovers — building a historical record you can compare over time without any manual setup. Extended Events is a lightweight, targeted event-capture session, replacing the older, heavier SQL Trace — you define exactly which events matter and capture only those, keeping overhead low. Azure SQL Analytics centralizes telemetry from many databases into one Log Analytics workspace, enabling dashboards and cross-database queries that a single database's own metrics never could.\n\nQuery Performance Insight ranks queries by actual resource consumption, pointing straight at the biggest tuning opportunities without you having to go hunting for them manually. Diagnostic settings route metrics and logs to a chosen destination — Log Analytics, storage, or Event Hub — continuously, once configured, with no need for repeated manual exports. Metric alerts turn a monitored value crossing a defined threshold (DTU above 90% for five minutes, say) into an automatic notification or action, closing the loop between noticing a problem and actually being told about it."
      },
      {
        "heading": "Interpreting monitoring data",
        "objectives": ["3.2"],
        "body": "Dynamic management views (DMVs) — the sys.dm_* views — are a real-time window into current server state: sessions, waits, requests, indexes, all queryable directly with T-SQL. Wait statistics show what queries were actually waiting on — CPU, I/O, locks, network — which is often the single biggest clue to a performance bottleneck's real cause, more useful than just knowing something is slow. Resource utilization metrics (CPU%, DTU%, storage%) give a fast top-level read on whether compute, DTU, or storage capacity is the actual constraint right now, before diving any deeper.\n\nsys.dm_exec_requests specifically shows every currently-executing request live — session ID, status, wait type, command — usually the first stop when something feels slow right now, in the moment. Blocking chain analysis traces which session is genuinely holding a lock (the head blocker) and which sessions are waiting behind it in a chain — fixing the head blocker resolves everyone behind it at once. tempdb contention happens when many sessions compete for shared tempdb pages or allocation structures at the same time — a commonly overlooked bottleneck precisely because tempdb is shared infrastructure, not something any one query or database owns exclusively."
      }
    ]
  },
  {
    "domain": "p4",
    "overview": "This is the most hands-on DBA skill on the exam: getting queries to run fast, and understanding exactly why they aren't when they don't. It comes down to two things — the indexes available to the optimizer, and the execution plan the optimizer actually chooses.",
    "sections": [
      {
        "heading": "Indexing",
        "objectives": ["4.1"],
        "body": "A clustered index defines a table's actual physical row order — only one per table, since a table can only be physically sorted one way — while a nonclustered index is a separate structure that just points back to the clustered index (or the heap), letting you have several nonclustered indexes supporting different query patterns on the same table. Missing index recommendations are the optimizer effectively logging what index it wished it had, surfaced through a DMV — a genuinely useful starting point, but not something to blindly auto-apply without judgment. Index fragmentation means pages have become scattered and out of logical order over time, adding extra I/O to every scan; rebuilding or reorganizing restores contiguous pages.\n\nColumnstore indexes store data column-oriented rather than row-oriented, compressing and scanning large analytical aggregations far faster than a traditional row-store index ever could — the right tool specifically for analytical workloads, not typical OLTP lookups. A filtered index covers only a subset of rows matching a WHERE condition, smaller and faster than a full-table index for queries that match that same filter. Included columns ride along at the leaf level of a nonclustered index without being part of the key itself, letting a query be answered entirely from the index — no separate lookup back to the full table required."
      },
      {
        "heading": "Query plans",
        "objectives": ["4.2"],
        "body": "Reading an execution plan means working from the bottom up: cheap operators like index seeks feed into joins, which feed into the final output — recognizing an expensive table scan sitting where an index seek should be is usually the single fastest way to spot a tuning opportunity. Parameter sniffing is what happens when a plan gets compiled and optimized for one parameter's data distribution, then gets reused for a very different value later, performing badly because the cached plan simply doesn't fit the new case. Statistics staleness means the optimizer is trusting a stale snapshot of the data's distribution that's drifted meaningfully from what the table actually looks like now, leading it toward bad plan choices.\n\nQuery Store forced plans let a DBA pin a specific, proven-good plan directly, stopping the optimizer from flip-flopping between multiple options with inconsistent performance. Automatic tuning takes this further — Azure SQL can detect a performance regression, test a better plan against the query's own history, and apply it automatically, reverting on its own if the change doesn't actually help. Plan cache bloat happens when many single-use, non-parameterized ad-hoc queries fill the plan cache with one-off entries that are never reused, crowding out the smaller number of genuinely reusable parameterized plans that would otherwise stay cached."
      }
    ]
  },
  {
    "domain": "p5",
    "overview": "The highest-weighted domain on the exam, and it reflects where the DBA role has actually moved — deploying schema changes and routine maintenance through automated, repeatable pipelines rather than doing everything by hand, one server at a time.",
    "sections": [
      {
        "heading": "Automating deployment",
        "objectives": ["5.1"],
        "body": "ARM and Bicep templates declare a database's desired end state, and Azure reconciles actual resources to match — you describe what you want, not the individual steps to get there. CI/CD pipelines extend that same discipline to schema changes specifically: a change is committed to source control, built and tested against a disposable database, then deployed automatically to staging and production, the same way application code already flows. PowerShell and CLI automation lets one script apply the same operation consistently across many databases at once, instead of repeating manual steps server by server.\n\nDACPAC and BACPAC are two related deployment packages with one key difference: DACPAC moves schema only, while BACPAC packages schema and data together. Database schema drift detection compares a live database against its declared, version-controlled definition, catching cases where someone made a change directly and out of band, bypassing the pipeline entirely. Blue-green database deployment stages a new version fully (green) before swapping traffic over from the current live version (blue), keeping rollback fast and low-risk if something's wrong with the new version."
      },
      {
        "heading": "Automating database tasks",
        "objectives": ["5.2"],
        "body": "SQL Agent (or Elastic Jobs, for running the same job across many databases at once) runs scheduled or trigger-based work with logged, alertable outcomes — the backbone of routine automated maintenance. Automated index maintenance is a scheduled job that checks fragmentation per index and applies the right fix — reorganize for lower fragmentation, rebuild for higher — without manual intervention each time. Long-term retention (LTR) backups extend selected backups far beyond the normal short-term retention window, up to ten years, specifically to satisfy compliance requirements that outlast typical operational backup needs.\n\nOla Hallengren maintenance scripts are widely-used, open-source scripts that wrap index maintenance, backups, and integrity checks together into one coordinated, scheduled job set — a common, battle-tested alternative to building all of that automation from scratch. Database mail alerts turn a job failure or an alert condition into an actual email notification, so a problem gets surfaced to a human before it quietly becomes a bigger one. And Azure SQL's automatic tuning can extend to indexes themselves — detecting a beneficial index and creating it automatically, then monitoring its real-world impact and dropping it again on its own if it turns out not to help."
      }
    ]
  }
  ];
})();
