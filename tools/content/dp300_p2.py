"""DP-300, domain p2 (Implement a Secure Environment): identity, encryption, compliance, and network security."""
import svg as S

DOMAIN = 'p2'
WEIGHT = 22


def build(b):
    b.objective('2.4', 'Network security', ['Server firewall rules', 'Database firewall rules', 'Private endpoints', 'Service endpoints', 'Connection policy'])
    b.topics['2.1'] = ['Microsoft Entra ID vs. SQL auth', 'Contained database users', 'Server vs. database roles', 'GRANT, DENY, REVOKE', 'Managed identities', 'Troubleshooting sign-in']
    b.topics['2.2'] = ['Transparent Data Encryption', 'Always Encrypted', 'TLS enforcement', 'Deterministic vs randomized', 'Cell-level encryption']
    b.topics['2.3'] = ['Dynamic Data Masking', 'Row-level security', 'SQL Audit', 'Ledger', 'Change tracking and CDC', 'Audit destinations']

    # ------------------------------------------------------------------------------------------ 2.1
    b.add('2.1', 'Creating users from Microsoft Entra identities',
          'With a Microsoft Entra admin set on the server, CREATE USER [name] FROM EXTERNAL PROVIDER creates a contained database user for an Entra user, group, or application, which then receives permissions through roles.',
          'give an Entra group access to one database by creating a user for it with T-SQL',
          ['CREATE LOGIN ... WITH PASSWORD', 'CREATE USER ... WITHOUT LOGIN', 'sp_addlogin'],
          'FROM EXTERNAL PROVIDER means a Microsoft Entra identity — run it while connected as an Entra account.',
          S.terminal(['-- connected as the Entra admin', 'CREATE USER [dba-team] FROM EXTERNAL PROVIDER;', 'ALTER ROLE db_datareader ADD MEMBER [dba-team];'], title='T-SQL'),
          caption='FROM EXTERNAL PROVIDER creates a database user for a Microsoft Entra user, group, or application.')

    b.add('2.1', 'Microsoft Entra-only authentication',
          'A server setting that disables SQL authentication entirely, so only Microsoft Entra identities (including managed identities) can sign in, enabling MFA, Conditional Access, and central lifecycle control.',
          'force every connection to use Entra identities with MFA and Conditional Access and disable SQL logins',
          ['Contained database users', 'Assigning an Entra admin', 'Always Encrypted'],
          'It turns SQL authentication OFF completely — an Entra admin alone still allows SQL logins.',
          S.compare(('Both methods on', ['SQL logins still work', 'Passwords can be shared', 'Weaker audit trail']), ('Entra-only', ['SQL authentication disabled', 'MFA and Conditional Access', 'Central lifecycle control']), title='Authentication modes', tones=('amber', 'green')),
          caption='Entra-only authentication disables SQL logins so every sign-in goes through Microsoft Entra ID.')

    b.add('2.1', 'Managed identity authentication',
          'An Azure-managed identity lets an application, such as an App Service or Function, connect to the database with no password stored anywhere, after a database user is created for that identity FROM EXTERNAL PROVIDER.',
          'let an App Service connect to the database with no password in its configuration',
          ['SQL authentication with a stored password', 'A shared access signature', 'A service endpoint'],
          'The identity belongs to the AZURE RESOURCE — there is no secret to store, leak, or rotate.',
          S.steps([('App Service', 'has a managed identity'), ('Database user', 'created for that identity'), ('Token sign-in', 'no password stored')], title='Passwordless access', tones=['plain', 'blue', 'green']),
          caption='A managed identity signs an Azure app in to the database without any stored password.')

    b.add('2.1', 'GRANT, DENY, and REVOKE',
          'GRANT gives a permission, DENY explicitly blocks it and overrides any GRANT, including one inherited through a role, and REVOKE removes a previous GRANT or DENY; granting on schemas and roles supports least privilege.',
          'stop one user from reading a sensitive table even though a role they belong to can read it',
          ['REVOKE', 'GRANT', 'Removing the user from the database'],
          'DENY beats GRANT — REVOKE only removes an entry and would leave the role\'s access in place.',
          S.table(['Statement', 'Effect'], [('GRANT', 'allows the permission'), ('DENY', 'blocks it, overrides GRANT'), ('REVOKE', 'removes a GRANT or DENY')], title='Permission statements', col_widths=[0.3, 0.7]),
          caption='DENY overrides GRANT, and REVOKE simply removes either one.')

    b.add('2.1', 'Effective permissions check',
          'sys.fn_my_permissions and HAS_PERMS_BY_NAME report what the current user can actually do after role membership, GRANTs, and DENYs combine, which is the starting point for a permission denied (error 229) problem.',
          'work out why a user in a reader role still gets "SELECT permission was denied" on one table',
          ['Resetting the user\'s password', 'Raising the service tier', 'Rebuilding the table\'s indexes'],
          'A DENY somewhere beats the role\'s GRANT — check EFFECTIVE permissions, not just membership.',
          S.terminal(["SELECT * FROM sys.fn_my_permissions('dbo.Salary','OBJECT');", "SELECT HAS_PERMS_BY_NAME('dbo.Salary','OBJECT','SELECT');", '-- 0 means the user cannot SELECT'], title='T-SQL'),
          caption='Checking effective permissions shows the combined result of roles, GRANTs, and DENYs.')

    b.add('2.1', 'Login failed (error 18456) and firewall errors',
          'Error 18456 means authentication failed and its state number says why (state 8 a wrong password, state 5 an unknown login), whereas error 40615 means the server firewall blocked the client IP and 40613 means the database is unavailable.',
          'tell whether a failed connection is a wrong password or an unknown login using the number in the error',
          ['Error 40615', 'Error 1205 (deadlock victim)', 'Error 1222 (lock timeout)'],
          '18456 plus its STATE gives the reason — 40615 is the firewall, which is a different problem.',
          S.table(['Error', 'Meaning'], [('18456, state 8', 'wrong password'), ('18456, state 5', 'unknown login'), ('40615', 'firewall blocked the IP'), ('40613', 'database unavailable')], title='Common connection errors', col_widths=[0.4, 0.6]),
          caption='Error 18456 states identify authentication failures; 40615 points to the firewall instead.')

    # ------------------------------------------------------------------------------------------ 2.2
    b.add('2.2', 'Cell-level (object-level) encryption',
          'Encrypting individual columns inside the database with T-SQL (ENCRYPTBYKEY and DECRYPTBYKEY) using symmetric keys protected by a certificate or password, where the database engine holds the keys and can decrypt for authorized users.',
          'encrypt a single column inside the database with T-SQL where the server can decrypt it for authorized users',
          ['Always Encrypted', 'Transparent data encryption', 'TLS enforcement'],
          'The SERVER holds the keys here — in Always Encrypted the client driver does, so the server never sees plaintext.',
          S.compare(('Cell-level encryption', ['T-SQL ENCRYPTBYKEY', 'Server holds the keys', 'Admins may decrypt']), ('Always Encrypted', ['Client driver encrypts', 'Server never sees plaintext', 'Protects from DBAs']), title='Who holds the keys'),
          caption='Cell-level encryption uses server-side keys; Always Encrypted keeps the keys with the client.')

    b.add('2.2', 'Deterministic vs randomized encryption',
          'Always Encrypted can use deterministic encryption, where the same plaintext always yields the same ciphertext so equality lookups, joins, and grouping work, or randomized encryption, which is stronger but cannot be searched.',
          'choose an Always Encrypted type for a column that must still support equality lookups such as WHERE SSN = @ssn',
          ['Randomized encryption', 'Transparent data encryption', 'Dynamic data masking'],
          'Same plaintext gives the same ciphertext, so equality works — randomized is stronger but unsearchable.',
          S.compare(('Deterministic', ['Same input, same output', 'Equality, join, group by', 'Patterns may leak']), ('Randomized', ['Different output each time', 'No equality lookups', 'Strongest protection']), title='Always Encrypted types'),
          caption='Deterministic encryption allows equality searches; randomized encryption is stronger but cannot be searched.')

    # ------------------------------------------------------------------------------------------ 2.3
    b.add('2.3', 'Ledger tables',
          'Ledger makes data tamper-evident: updatable ledger tables keep a history table and hash-chained blocks, append-only tables forbid updates and deletes, and digests stored outside the database let you verify that nothing was altered.',
          'prove to auditors that financial records have not been altered, even by a privileged administrator',
          ['Dynamic data masking', 'Row-level security', 'Transparent data encryption'],
          'Tamper EVIDENCE through hash-chained blocks and external digests — encryption and masking cannot prove data is unchanged.',
          S.steps([('Transactions', 'recorded in blocks'), ('Hash chain', 'each block links the last'), ('Digest', 'stored outside the database')], title='How ledger works', tones=['plain', 'blue', 'green']),
          caption='Ledger chains transaction blocks with hashes and external digests so tampering can be detected.')

    b.add('2.3', 'Change tracking',
          'A lightweight feature that records which rows changed (their primary key and a version number) so applications can synchronize incrementally; it does not store the old or new values.',
          'let a mobile app sync only the rows that changed since its last sync, without storing history',
          ['Change data capture', 'Temporal tables', 'SQL Audit'],
          'It only says WHICH rows changed — change data capture records what they changed from and to.',
          S.compare(('Change tracking', ['Row key plus version', 'Which rows changed', 'No old or new values']), ('Change data capture', ['Reads the transaction log', 'Before and after values', 'Retention and cleanup job']), title='Tracking changes'),
          caption='Change tracking flags changed rows for sync; it does not keep their values.')

    b.add('2.3', 'Change data capture (CDC)',
          'Reads the transaction log asynchronously and writes the before and after values of inserts, updates, and deletes into change tables, for ETL or history; it has a retention and cleanup job and in Azure SQL Database needs a service objective of S3 or higher or a vCore tier.',
          'feed a data warehouse with the full history of row changes, including old and new values, without altering the application',
          ['Change tracking', 'Temporal tables', 'A database audit'],
          'CDC captures old and new VALUES from the log — change tracking only flags that a row changed.',
          S.steps([('Transaction log', 'inserts, updates, deletes'), ('Capture job', 'reads the log'), ('Change tables', 'before and after values')], title='Change data capture', tones=['plain', 'blue', 'green']),
          caption='CDC reads the log and stores before and after values of every change in change tables.')

    b.add('2.3', 'Audit destinations and scope',
          'Azure SQL auditing writes events to Azure Storage, Log Analytics, or Event Hubs and can be set on the server (covering all databases) or on a single database; SQL Server uses a server audit with server and database audit specifications.',
          'send database audit events to Log Analytics so they can be queried alongside other logs',
          ['Query Store', 'An Extended Events ring buffer', 'A metrics-only diagnostic setting'],
          'Choose the DESTINATION (Storage, Log Analytics, Event Hubs) and the scope (server or database) of the audit.',
          S.hub(('SQL auditing', 'server or database scope'), [('Storage account', 'blob files'), ('Log Analytics', 'query with Kusto'), ('Event Hubs', 'stream to a SIEM')]),
          caption='Auditing can be scoped to a server or database and written to Storage, Log Analytics, or Event Hubs.')

    # ------------------------------------------------------------------------------------------ 2.4
    b.add('2.4', 'Server-level firewall rule',
          'An IP address rule stored in the master database and applied to every database on the logical server, managed in the portal or with sp_set_firewall_rule; a client outside the rules receives error 40615.',
          'allow an office\'s public IP range to reach all databases on a logical server',
          ['A database-level firewall rule', 'A private endpoint', 'A service endpoint'],
          'It covers ALL databases on the server — a database-level rule covers one and travels with the database.',
          S.steps([('Client IP', 'checked at the gateway'), ('Server rules', 'stored in master'), ('Allowed or 40615', 'applies to every database')], title='Server-level rule', tones=['plain', 'blue', 'green']),
          caption='A server-level firewall rule allows an IP range to reach every database on the logical server.')

    b.add('2.4', 'Database-level firewall rule',
          'An IP rule stored in a user database (sp_set_database_firewall_rule) that applies only to that database and moves with it during a restore or geo-replication, useful for portable, contained access.',
          'allow one application\'s IP to reach a single database and have the rule follow the database to a geo-replica',
          ['A server-level firewall rule', 'A network security group', 'A private endpoint'],
          'Scoped to ONE database and portable — server rules cover everything on the server.',
          S.compare(('Server-level rule', ['Stored in master', 'All databases', 'Portal, PowerShell, T-SQL']), ('Database-level rule', ['Stored in the database', 'That database only', 'Moves with replicas and restores']), title='Firewall rule scope'),
          caption='A database-level rule is stored in one database and travels with it.')

    b.add('2.4', 'Allow Azure services and resources setting',
          'A setting that creates a 0.0.0.0 rule so any Azure resource, from any subscription, can attempt to connect to the server; authentication still applies, but it is much broader than it sounds.',
          'explain why enabling "Allow Azure services and resources to access this server" also lets other tenants\' Azure resources reach the server',
          ['A private endpoint', 'A server-level rule for one office IP', 'Transparent data encryption'],
          'It means ANY Azure resource in any subscription — restrict with private endpoints or virtual network rules instead.',
          S.facts([('Rule created', '0.0.0.0 start and end'), ('Who can connect', 'any Azure resource'), ('Still required', 'valid authentication'), ('Safer option', 'private endpoint')], title='Allow Azure services'),
          caption='Allow Azure services opens the server to every Azure resource, so tighter options are safer.')

    b.add('2.4', 'Private endpoint (Private Link)',
          'A private IP address in your virtual network that maps to the logical server, keeping traffic on the Microsoft backbone and allowing public network access to be disabled; DNS must resolve the server name to that private IP.',
          'make a database reachable only from a virtual network, with public network access turned off',
          ['A service endpoint', 'A server-level firewall rule', 'Allow Azure services'],
          'A private IP for the SERVER inside your VNet — a service endpoint still connects to the public IP.',
          S.steps([('Virtual network', 'private IP assigned'), ('Private Link', 'maps to the server'), ('Public access off', 'DNS points to private IP')], title='Private endpoint', tones=['plain', 'primary', 'green']),
          caption='A private endpoint gives the server a private IP so public access can be disabled.')

    b.add('2.4', 'Virtual network service endpoint',
          'A service endpoint extends a subnet\'s identity to the SQL service over the Azure backbone so a virtual network rule can allow that subnet, while the server still keeps its public endpoint.',
          'allow only a specific subnet to reach the database through a virtual network rule while the server keeps its public IP',
          ['A private endpoint', 'A database-level firewall rule', 'Allow Azure services'],
          'A subnet allow-list over the PUBLIC endpoint — a private endpoint gives the server a private IP instead.',
          S.compare(('Service endpoint', ['VNet rule allows a subnet', 'Server keeps its public IP', 'No extra IP address']), ('Private endpoint', ['Private IP in your VNet', 'Public access can be off', 'Needs private DNS']), title='Service vs private endpoint'),
          caption='Service endpoints allow a subnet over the public endpoint; private endpoints give a private IP.')

    b.add('2.4', 'Connection policy (Redirect vs Proxy)',
          'With Redirect, clients connect straight to the node hosting the database after the gateway handshake (ports 11000 to 11999 must be open), while Proxy sends every packet through the gateway on port 1433; Default uses Redirect from inside Azure and Proxy from outside.',
          'choose the policy that works for clients behind a firewall that only allows outbound port 1433',
          ['Redirect', 'Private endpoint', 'Service endpoint'],
          'Proxy keeps everything on port 1433 through the gateway — Redirect is faster but needs 11000 to 11999 open.',
          S.compare(('Proxy', ['All traffic via the gateway', 'Only port 1433 needed', 'Higher latency']), ('Redirect', ['Direct to the database node', 'Ports 11000 to 11999 too', 'Lower latency']), title='Connection policy'),
          caption='Proxy routes through the gateway on 1433; Redirect connects directly but needs extra ports open.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Identity, permissions, and sign-in problems', ['2.1'],
              'Microsoft Entra ID is the preferred identity source: set an Entra admin, create contained users and groups with CREATE USER ... FROM EXTERNAL PROVIDER, use managed identities so applications connect without stored passwords, and consider Entra-only authentication to switch SQL logins off entirely. Grant roles and schema-level permissions for least privilege, and remember that DENY overrides GRANT while REVOKE just removes an entry; sys.fn_my_permissions and HAS_PERMS_BY_NAME show the effective result.\n\n'
              'For failed connections, read the error: 18456 is an authentication failure and its state tells you why (state 8 wrong password, state 5 unknown login), 40615 means the firewall blocked the client IP, and 40613 means the database is unavailable.')
    b.section('Column encryption and compliance features', ['2.2', '2.3'],
              'Cell-level encryption in T-SQL keeps the keys on the server, whereas Always Encrypted keeps them with the client driver so even administrators cannot see plaintext; deterministic Always Encrypted supports equality lookups, randomized does not. Ledger adds tamper evidence with hash-chained blocks and external digests, which encryption and masking cannot provide.\n\n'
              'Change tracking records only which rows changed (for sync), while change data capture reads the log and stores the before and after values. Auditing can be scoped to the server or a database and sent to Storage, Log Analytics, or Event Hubs.')
    b.section('Network security for Azure SQL', ['2.4'],
              'Server-level firewall rules live in master and cover every database; database-level rules live in the database, cover only it, and move with restores and replicas. Allow Azure services creates a 0.0.0.0 rule that admits any Azure resource from any subscription, so prefer tighter options: a virtual network service endpoint allows a subnet over the public endpoint, while a private endpoint gives the server a private IP and lets you turn public access off.\n\n'
              'The connection policy decides the path: Proxy sends everything through the gateway on port 1433, Redirect connects directly after the handshake but needs ports 11000 to 11999, and Default uses Redirect from inside Azure and Proxy from outside.')
