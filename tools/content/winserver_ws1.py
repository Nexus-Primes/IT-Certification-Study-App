"""AZ-802, domain ws1 (Deploy and manage AD DS): domain controllers, sites and trusts, security principals, Group Policy."""
import svg as S

DOMAIN = 'ws1'


def build(b):
    b.topics['1.1'] = ['Local and Azure-hosted DCs', 'IFM and cloning', 'RODCs and staged installs', 'FSMO roles', 'Transfer and seize', 'Microsoft Entra Domain Services']
    b.topics['1.2'] = ['Trust types', 'SID filtering', 'Sites and bridgeheads', 'Replication and partitions', 'SYSVOL and DFSR', 'DC locator']
    b.topics['1.3'] = ['Group scopes and AGDLP', 'OUs', 'Service accounts', 'UPN suffixes', 'Entra Connect', 'Offline domain join']
    b.topics['1.4'] = ['GPOs', 'LSDOU order', 'Filtering', 'Loopback', 'Preferences and targeting', 'Backup and templates']

    # ------------------------------------------------------------------------------------------ 1.1
    b.add('1.1', 'Install from Media (IFM)',
          'Promoting a domain controller from a backup of AD DS made with ntdsutil and copied to the new server, so most of the database does not replicate across the network and only changes made since the backup do.',
          'add a domain controller at a site with a slow WAN link without sending the whole directory across it',
          ['Staged RODC installation', 'Domain controller cloning', 'Offline domain join'],
          'Seeds the new DC from a BACKUP — only the recent changes cross the WAN.',
          S.steps([('Create IFM media', 'ntdsutil on a DC'), ('Copy to new server', 'USB or file share'), ('Promote from media', 'only changes replicate')], title='Install from Media', tones=['blue', 'plain', 'green']),
          caption='IFM promotes a domain controller from a copied backup so little data crosses the WAN.')

    b.add('1.1', 'Domain controller cloning',
          'Creating additional virtual domain controllers by copying an existing one after adding it to the Cloneable Domain Controllers group and creating DCCloneConfig.xml; it needs a hypervisor that supports VM-GenerationID and a PDC emulator running Windows Server 2012 or later.',
          'deploy several more virtual domain controllers quickly from one prepared virtual machine',
          ['Install from Media (IFM)', 'Hyper-V checkpoints', 'Staged RODC installation'],
          'Needs the Cloneable Domain Controllers group and DCCloneConfig.xml — and the PDC emulator online.',
          S.steps([('Authorize source DC', 'Cloneable DCs group'), ('Create clone config', 'DCCloneConfig.xml'), ('Copy the VM', 'clone starts as a DC')], title='Cloning a virtual DC', tones=['blue', 'plain', 'green']),
          caption='Cloning copies a prepared virtual DC after it is authorized and given a clone configuration file.')

    b.add('1.1', 'Staged RODC installation',
          'A two-phase read-only domain controller deployment: an administrator pre-creates the RODC computer account in AD DS, then a delegated user at the branch attaches the server to that account during promotion, so no domain administrator credentials are needed on site.',
          'let a branch technician finish setting up a read-only domain controller without giving them domain administrator rights',
          ['Install from Media (IFM)', 'Domain controller cloning', 'Offline domain join'],
          'PRE-CREATE the account centrally, ATTACH it locally — the branch tech never needs Domain Admins.',
          S.steps([('Admin pre-creates', 'RODC account in AD'), ('Branch tech attaches', 'server joins that account'), ('RODC online', 'no domain admin used')], title='Staged RODC installation', tones=['blue', 'plain', 'green']),
          caption='A staged RODC install pre-creates the account so a delegated user can finish promotion on site.')

    b.add('1.1', 'RODC administrator role separation',
          'Delegating local administrative rights on a read-only domain controller to a chosen user or group, so they can manage the server, such as patching, drivers, and services, without belonging to any domain-level administrative group.',
          'let a branch IT contact patch and restart a read-only domain controller without making them a domain administrator',
          ['RODC password replication policy', 'Delegation of control', 'Protected Users group'],
          'LOCAL admin on that one RODC — nothing in the domain itself is granted.',
          S.compare(('Role separation', ['Local admin on the RODC', 'Patch, drivers, services', 'No domain rights']), ('Domain Admins', ['Control of every DC', 'Not needed at the branch', 'Far higher risk']), title='Who manages the RODC'),
          caption='Role separation gives a branch user local admin rights on one RODC without domain-level rights.')

    b.add('1.1', 'Resetting passwords cached on a stolen RODC',
          'If a read-only domain controller is stolen or compromised, deleting its computer account in Active Directory Users and Computers offers to reset the passwords of every account that was cached on it, and lists those accounts.',
          'invalidate every credential held by a branch-office server that was taken from an unlocked closet',
          ['Seizing FSMO roles', 'Enabling the AD Recycle Bin', 'Forcing replication with repadmin'],
          'Deleting the RODC account offers to RESET every password it had cached.',
          S.steps([('RODC stolen', 'branch office'), ('Delete RODC account', 'ADUC offers a reset'), ('Cached passwords reset', 'users sign in anew')], title='Responding to a stolen RODC', tones=['red', 'amber', 'green']),
          caption='Deleting a compromised RODC account resets the passwords of the accounts it had cached.')

    b.add('1.1', 'Transferring FSMO roles',
          'Gracefully moving an operations master role to another domain controller while both are online, using Active Directory snap-ins or Move-ADDirectoryServerOperationMasterRole; the old holder keeps working as an ordinary domain controller.',
          'hand a role to another domain controller before the current holder is retired from service',
          ['Seizing FSMO roles', 'Demoting a domain controller', 'Metadata cleanup'],
          'GRACEFUL and both DCs online — the old holder stays a normal domain controller.',
          S.steps([('Both DCs online', 'holder is reachable'), ('Transfer the role', 'snap-in or PowerShell'), ('Role moved', 'old DC stays a DC')], title='Transferring a role', tones=['blue', 'plain', 'green']),
          caption='A transfer moves an FSMO role between two online domain controllers.')

    b.add('1.1', 'Seizing FSMO roles',
          'Forcing a role onto a surviving domain controller when its holder is permanently lost, using ntdsutil or Move-ADDirectoryServerOperationMasterRole with -Force; the old holder must never return to the network unless it is rebuilt first.',
          'move a role to a working domain controller after its holder was destroyed and cannot be repaired',
          ['Transferring FSMO roles', 'Demoting a domain controller', 'Domain controller cloning'],
          'The old holder is GONE for good — never reconnect it without a rebuild.',
          S.steps([('Holder is lost', 'offline for good'), ('Seize the role', 'ntdsutil or -Force'), ('Never reconnect it', 'rebuild if it returns')], title='Seizing a role', tones=['red', 'amber', 'plain']),
          caption='Seizing forces an FSMO role onto another domain controller when the holder is permanently lost.')

    b.add('1.1', 'PDC emulator role',
          'The domain-wide operations master that serves as the domain\'s time source, receives urgent password changes and lockouts, and is the default domain controller for Group Policy edits; in the forest root domain it is the top of the time hierarchy.',
          'find the domain controller that other servers forward bad-password lockouts to and that should sync time from an outside source',
          ['RID master', 'Infrastructure master', 'Forest-wide FSMO roles'],
          'TIME, password changes, lockouts, and GPO edits all point at the PDC emulator.',
          S.hub(('PDC emulator',), [('Time source', 'all DCs sync'), ('Passwords', 'urgent changes'), ('Lockouts', 'processed here'), ('GPO edits', 'default target')], title='What the PDC emulator does'),
          caption='The PDC emulator handles time, urgent password changes, lockouts, and default GPO edits.')

    b.add('1.1', 'RID master',
          'The domain-wide operations master that hands out pools of relative identifiers to each domain controller, so every new user, group, and computer receives a unique security identifier.',
          'keep new accounts receiving unique security identifiers after a domain controller used up its allocated pool',
          ['PDC emulator role', 'Infrastructure master', 'Forest-wide FSMO roles'],
          'Hands out RID POOLS — a dead RID master only hurts when a DC\'s pool runs dry.',
          S.steps([('RID master', 'owns the RID space'), ('Pools issued', '500 RIDs per DC'), ('New SID', 'domain SID + RID')], title='RID allocation', tones=['primary', 'plain', 'green']),
          caption='The RID master issues pools of RIDs so every new object gets a unique SID.')

    b.add('1.1', 'Infrastructure master',
          'The domain-wide operations master that updates cross-domain object references, such as a group in one domain that contains a user from another; in a multi-domain forest it should not sit on a global catalog server unless every domain controller is one.',
          'keep group memberships that include users from another domain showing the right names',
          ['PDC emulator role', 'RID master', 'Forest-wide FSMO roles'],
          'Fixes CROSS-DOMAIN references — keep it off a global catalog server in a multi-domain forest.',
          S.compare(('Multi-domain forest', ['Not on a global catalog', 'Unless all DCs are GCs', 'Or Recycle Bin enabled']), ('Single domain', ['Placement does not matter', 'No cross-domain refs', 'Any DC works']), title='Infrastructure master placement'),
          caption='The infrastructure master updates cross-domain references and normally avoids global catalog servers.')

    b.add('1.1', 'Forest-wide FSMO roles',
          'The schema master, which is the only domain controller that can change the AD schema (members of Schema Admins), and the domain naming master, which adds and removes domains in the forest; each exists once per forest.',
          'extend the directory for a new application and then add a child domain to the forest, each needing a single role holder',
          ['PDC emulator role', 'RID master', 'Infrastructure master'],
          'Only TWO roles are forest-wide — schema master and domain naming master.',
          S.table(['Role', 'Scope'], [('Schema master', 'one per forest'), ('Domain naming master', 'one per forest'), ('PDC emulator', 'one per domain'), ('RID master', 'one per domain'), ('Infrastructure master', 'one per domain')], title='FSMO scope', col_widths=[0.6, 0.4]),
          caption='Schema master and domain naming master are forest-wide; the other three roles are per domain.')

    b.add('1.1', 'Finding FSMO role holders',
          'Listing which domain controllers hold the five operations master roles, with netdom query fsmo or by reading Get-ADForest and Get-ADDomain properties.',
          'list which servers currently hold all five operations master roles',
          ['Checking replication health', 'Locating a global catalog server', 'Reviewing site link costs'],
          'netdom query fsmo shows all five at once; Get-ADDomain and Get-ADForest split them by scope.',
          S.terminal(['netdom query fsmo', 'Schema master          DC1.contoso.com', 'Domain naming master    DC1.contoso.com', 'PDC                    DC2.contoso.com', 'RID pool manager       DC2.contoso.com', 'Infrastructure master  DC2.contoso.com'], title='Command Prompt'),
          caption='netdom query fsmo lists the holders of all five operations master roles.')

    b.add('1.1', 'Microsoft Entra Domain Services',
          'A managed domain service in Azure that provides domain join, LDAP, Kerberos and NTLM authentication, and Group Policy without deploying or patching domain controllers; it syncs from Microsoft Entra ID and gives you no Domain Admin or DC access.',
          'let lifted-and-shifted Azure VMs use domain join and legacy LDAP sign-in without running any domain controller VMs',
          ['Domain controller in Azure (IaaS)', 'Active Directory Federation Services (AD FS)', 'Microsoft Entra Connect Sync'],
          'MANAGED by Microsoft — you get no Domain Admin, no schema access, and no DC to patch.',
          S.compare(('Entra Domain Services', ['Managed by Microsoft', 'No DC or Domain Admin access', 'Syncs from Entra ID']), ('DCs on Azure VMs', ['You deploy and patch them', 'Full Domain Admin control', 'Extends your own forest']), title='Two ways to get AD in Azure'),
          caption='Entra Domain Services is a managed domain; DCs on Azure VMs are yours to run and patch.')

    b.add('1.1', 'Azure domain controller disk and network guidance',
          'Recommended practice for a domain controller VM in Azure: keep the AD DS database, logs, and SYSVOL on a data disk with host caching set to None, give the VM a static private IP and no public IP, and point the virtual network\'s DNS at the domain controllers.',
          'keep a domain controller VM\'s directory database on a separate data disk with write caching turned off',
          ['Azure VM capacity planning', 'Just-in-time (JIT) VM access', 'Availability sets vs. availability zones'],
          'DATA disk with caching None for the database, STATIC private IP, and no public IP.',
          S.layers([('Data disk', 'AD DS database, logs, SYSVOL', 'blue'), ('Host caching', 'set to None for that disk', 'amber'), ('Private IP', 'static, with no public IP', 'green'), ('Virtual network DNS', 'points at the domain controllers', 'primary')], title='Domain controller VM in Azure'),
          caption='An Azure DC keeps its database on a no-cache data disk with a static private IP and no public IP.')

    b.add('1.1', 'Demoting a domain controller',
          'Gracefully removing AD DS from a server with Uninstall-ADDSDomainController or the Remove Roles wizard while it can still reach the domain, which moves its roles away and cleans its metadata; the last controller in a domain also needs -LastDomainControllerInDomain.',
          'retire an old domain controller cleanly so its entries are removed from the directory',
          ['Metadata cleanup', 'Seizing FSMO roles', 'Domain controller cloning'],
          'GRACEFUL removal while the server is alive — metadata cleanup is for DCs that are already dead.',
          S.steps([('Move roles away', 'FSMO and GC checked'), ('Run the demotion', 'removes the AD DS role'), ('Metadata removed', 'server stays a member')], title='Demotion', tones=['blue', 'plain', 'green']),
          caption='Demotion removes AD DS from a live domain controller and cleans its directory entries.')

    # ------------------------------------------------------------------------------------------ 1.2
    b.add('1.2', 'Forest trust',
          'A transitive trust between the root domains of two forests, one-way or two-way, that lets users in any domain of either forest authenticate to resources in any domain of the other; it requires the forest functional level to be Windows Server 2003 or higher.',
          'let every domain in a merged company\'s directory reach resources in your directory without building many separate trusts',
          ['External trust', 'Shortcut trust', 'Realm trust'],
          'FOREST-to-forest and TRANSITIVE — an external trust reaches only one domain.',
          S.steps([('Forest A root', 'contoso.com'), ('Forest trust', 'transitive'), ('Forest B root', 'fabrikam.com')], title='Forest trust', tones=['blue', 'primary', 'amber']),
          caption='A forest trust connects two forests so users in any domain can reach resources in the other.')

    b.add('1.2', 'External trust',
          'A non-transitive trust between one domain in a forest and a single domain in another forest (or a Windows NT 4.0 domain), used when a full forest trust is not possible or not wanted.',
          'give users from one domain in a partner\'s directory access to a single file server without trusting their whole directory',
          ['Forest trust', 'Shortcut trust', 'Realm trust'],
          'NON-transitive and domain-to-domain — only the two named domains are involved.',
          S.compare(('External trust', ['One domain to one domain', 'Non-transitive', 'Different forests']), ('Forest trust', ['Forest root to forest root', 'Transitive', 'Whole forests']), title='External vs. forest trust'),
          caption='An external trust links one domain to one domain and is not transitive.')

    b.add('1.2', 'Shortcut trust',
          'A manually created transitive trust between two domains in the same forest that shortens the authentication path, which otherwise has to walk up and down the parent-child trust chain.',
          'speed up sign-ins between two deeply nested child domains whose requests currently pass through several parent domains',
          ['External trust', 'Forest trust', 'Realm trust'],
          'Shortens the PATH inside one forest — it adds no new access, only speed.',
          S.steps([('Child domain A', 'deep in tree one'), ('Shortcut trust', 'skips the parents'), ('Child domain B', 'deep in tree two')], title='Shortcut trust', tones=['blue', 'primary', 'amber']),
          caption='A shortcut trust gives two domains in one forest a direct authentication path.')

    b.add('1.2', 'Realm trust',
          'A trust between an AD DS domain and a non-Windows Kerberos version 5 realm, such as an MIT Kerberos realm; it is non-transitive by default and can be made transitive.',
          'let Active Directory users authenticate to a UNIX environment that runs MIT Kerberos',
          ['External trust', 'Forest trust', 'Shortcut trust'],
          'The ONLY trust type that targets a non-Windows Kerberos realm.',
          S.compare(('AD DS domain', ['Windows Kerberos', 'Domain controllers', 'contoso.com']), ('Kerberos realm', ['MIT or other Kerberos v5', 'UNIX or Linux KDC', 'EXAMPLE.ORG']), title='Realm trust'),
          caption='A realm trust connects an AD DS domain to a non-Windows Kerberos v5 realm.')

    b.add('1.2', 'Trust direction and transitivity',
          'In a one-way trust the trusting domain holds the resources and the trusted domain holds the users who may be granted access, so access flows opposite to the trust arrow; a transitive trust also extends to the domains that the partner trusts.',
          'decide whose accounts can be given access to whose resources when only a one-way trust exists',
          ['SID filtering', 'Selective authentication', 'Name suffix routing'],
          'Users live in the TRUSTED domain, resources in the TRUSTING domain.',
          S.facts([('Trusting domain', 'owns the resources'), ('Trusted domain', 'its users get access'), ('Transitive', 'extends to partner trusts'), ('Non-transitive', 'only the two domains')], title='Trust vocabulary'),
          caption='Access flows from the trusted domain\'s users to the trusting domain\'s resources.')

    b.add('1.2', 'SID filtering',
          'A trust protection that removes any security identifiers from a user\'s token that do not belong to the trusted domain, such as SID history values, so a compromised partner cannot inject privileged SIDs; it is on by default for external and forest trusts.',
          'stop users from a partner domain from presenting extra privileged identifiers in their tokens when they cross a trust',
          ['Selective authentication', 'Name suffix routing', 'Trust direction and transitivity'],
          'Strips FOREIGN SIDs from tokens crossing the trust — it blocks privilege escalation via SID history.',
          S.steps([('Token crosses trust', 'SIDs from partner'), ('SID filter checks', 'foreign SIDs removed'), ('Access evaluated', 'only the true domain')], title='SID filtering', tones=['plain', 'blue', 'green']),
          caption='SID filtering removes SIDs that do not belong to the trusted domain from tokens crossing a trust.')

    b.add('1.2', 'Name suffix routing',
          'A forest trust setting that controls which name suffixes, such as UPN suffixes, are routed across the trust for authentication; individual suffixes can be enabled or disabled, and conflicting suffixes are excluded automatically.',
          'control which user principal name suffixes from a partner directory are allowed to authenticate across a trust',
          ['SID filtering', 'Selective authentication', 'Trust direction and transitivity'],
          'Decides WHICH name suffixes route across a forest trust.',
          S.table(['Suffix', 'Routed?'], [('fabrikam.com', 'Enabled'), ('eu.fabrikam.com', 'Enabled'), ('legacy.fabrikam.com', 'Disabled')], title='Name suffix routing', col_widths=[0.65, 0.35]),
          caption='Name suffix routing enables or disables the suffixes that route across a forest trust.')

    b.add('1.2', 'DNS prerequisites for trusts',
          'Each side of a trust must be able to resolve the other forest\'s domain controllers and SRV records, usually through conditional forwarders, stub zones, or secondary zones, before a trust can be created and validated.',
          'get a new trust to validate after it fails because neither directory can resolve the other\'s domain controllers',
          ['Name suffix routing', 'SID filtering', 'Selective authentication'],
          'Fix NAME RESOLUTION first — a trust cannot be created if the other forest\'s DCs cannot be found.',
          S.steps([('Forest A DNS', 'conditional forwarder'), ('Finds partner DCs', 'SRV records resolve'), ('Trust validates', 'creation succeeds')], title='Preparing for a trust', tones=['blue', 'plain', 'green']),
          caption='Trusts need each forest\'s DNS to resolve the other forest\'s domain controllers.')

    b.add('1.2', 'Bridgehead servers',
          'The domain controllers in a site that the KCC chooses to exchange changes with other sites; changes cross the site link through bridgeheads and then spread to the other domain controllers in the site by intrasite replication.',
          'identify the domain controller in each office that exchanges directory changes with the other offices',
          ['Global Catalog server', 'PDC emulator role', 'Site link bridges'],
          'The DC that talks to OTHER sites — everyone else in the site gets changes from it.',
          S.steps([('Site A DCs', 'replicate inside'), ('Bridgeheads', 'cross the site link'), ('Site B DCs', 'replicate inside')], title='Intersite replication', tones=['blue', 'primary', 'blue']),
          caption='Bridgehead servers carry changes between sites; other DCs receive them by intrasite replication.')

    b.add('1.2', 'Change notification between sites',
          'A site link option that makes domain controllers notify partners at once when a change occurs, instead of waiting for the replication interval; within a site, notification is already on, with a default delay of about 15 seconds.',
          'make changes reach a remote office within seconds instead of waiting for the next scheduled replication',
          ['Site links and replication cost', 'Bridgehead servers', 'Universal group membership caching'],
          'Intersite replication is SCHEDULED by default — notification makes it near-immediate.',
          S.compare(('Within a site', ['Change notification', 'About 15 second delay', 'Not compressed']), ('Between sites', ['Scheduled by default', 'Interval 180 min default', 'Compressed']), title='Replication timing'),
          caption='Inside a site changes notify partners quickly; between sites they follow a schedule unless notification is on.')

    b.add('1.2', 'Site link bridges',
          'By default all site links are transitive, so sites replicate through intermediate sites; on a network that is not fully routed you disable Bridge all site links and create site link bridges by hand to model the real paths.',
          'stop the directory from assuming every office can reach every other office directly across a partially routed network',
          ['Bridgehead servers', 'Site links and replication cost', 'Change notification between sites'],
          'Transitive links are the default — DISABLE bridging when the network is not fully routed.',
          S.steps([('Site A to B link', 'cost 100'), ('Site B to C link', 'cost 100'), ('Bridged A to C', 'cost 200 (sum)')], title='Site link bridging', tones=['plain', 'plain', 'primary']),
          caption='Site link bridging makes links transitive; the bridged path cost is the sum of its links.')

    b.add('1.2', 'AD DS directory partitions',
          'The directory is split into partitions that replicate to different sets of domain controllers: the schema and configuration partitions go to every DC in the forest, a domain partition to the DCs of that domain, and application partitions, such as DNS zones, to chosen DCs.',
          'work out which domain controllers receive a change to forest topology compared with a change to a user account',
          ['Global Catalog server', 'KCC-driven AD DS replication topology', 'Bridgehead servers'],
          'Schema and configuration go EVERYWHERE; domain data stays in its domain.',
          S.table(['Partition', 'Replicates to'], [('Schema', 'every DC in the forest'), ('Configuration', 'every DC in the forest'), ('Domain', 'DCs of that domain'), ('Application', 'chosen DCs (DNS)')], title='Directory partitions', col_widths=[0.4, 0.6]),
          caption='Each directory partition replicates to a different set of domain controllers.')

    b.add('1.2', 'SYSVOL replication with DFS Replication',
          'SYSVOL, which holds Group Policy templates and logon scripts, replicates between domain controllers using DFS Replication; the older File Replication Service is deprecated, and a domain must be migrated from FRS to DFSR.',
          'move the replication of Group Policy templates and logon scripts off the older File Replication Service',
          ['Universal group membership caching', 'KCC-driven AD DS replication topology', 'Change notification between sites'],
          'DFSR is the SYSVOL engine now — FRS is the deprecated one.',
          S.compare(('FRS (legacy)', ['Legacy engine, deprecated', 'Whole-file replication', 'Migrate away from it']), ('DFSR (current)', ['Current engine', 'Block-level transfers', 'Default for new domains']), title='SYSVOL replication engines'),
          caption='SYSVOL replicates with DFS Replication; FRS is the deprecated engine to migrate from.')

    b.add('1.2', 'Universal group membership caching',
          'A site setting that lets domain controllers in a site without a global catalog cache the universal group memberships of users who sign in, so logons do not need a global catalog across the WAN.',
          'let a small office sign users in to a multi-domain forest without placing a global catalog server on site',
          ['Global Catalog server', 'Read-Only Domain Controller (RODC)', 'RODC password replication policy'],
          'The DC CACHES universal group memberships — no remote global catalog lookup at each logon.',
          S.steps([('User signs in', 'branch domain controller'), ('Memberships cached', 'from a GC, refreshed'), ('No GC lookup', 'on later logons')], title='Membership caching', tones=['plain', 'blue', 'green']),
          caption='Membership caching lets a site without a global catalog authenticate users locally.')

    b.add('1.2', 'DC Locator and SRV records',
          'Clients find domain controllers by querying DNS SRV records, such as _ldap._tcp.dc._msdcs.<domain> and the site-specific records under _sites, which the Netlogon service registers; clients prefer controllers in their own site.',
          'identify which DNS records a workstation queries to locate a domain controller for its domain',
          ['AD DS sites and subnets', 'Site links and replication cost', 'KCC-driven AD DS replication topology'],
          'DCs register SRV records through NETLOGON — missing records mean clients cannot find them.',
          S.terminal(['nslookup -type=SRV _ldap._tcp.dc._msdcs.contoso.com', '_ldap._tcp.dc._msdcs.contoso.com SRV', '   svr hostname = dc1.contoso.com', '   port         = 389'], title='Command Prompt'),
          caption='Clients locate domain controllers through DNS SRV records registered by Netlogon.')

    # ------------------------------------------------------------------------------------------ 1.3
    b.add('1.3', 'Domain local groups',
          'A group scope used to assign permissions to resources in its own domain; its members can come from any domain in the forest and from trusted domains, and it can contain global and universal groups.',
          'create a group that controls access to a file share in one domain while allowing members from other domains in the forest',
          ['Global groups', 'Universal groups', 'Distribution groups'],
          'Scoped to RESOURCES in its own domain, but members can come from anywhere.',
          S.steps([('Accounts and globals', 'from any domain'), ('Domain local group', 'in the resource domain'), ('Permissions', 'on the shared folder')], title='Domain local group', tones=['plain', 'primary', 'green']),
          caption='Domain local groups grant access to resources in their own domain and accept members from any domain.')

    b.add('1.3', 'Global groups',
          'A group scope whose members can only come from its own domain, but which can be granted permissions or nested in groups in any domain of the forest or a trusted domain; usually used to organize users by role.',
          'organize accounts from a single domain by department so the group can be nested into permission groups elsewhere',
          ['Domain local groups', 'Universal groups', 'Distribution groups'],
          'Members from ONE domain, usable ANYWHERE.',
          S.compare(('Global group', ['Members: own domain only', 'Used in: any domain', 'Organizes users by role']), ('Domain local group', ['Members: any domain', 'Used in: its own domain', 'Controls resource access']), title='Global vs. domain local'),
          caption='A global group takes members from its own domain and can be used in any domain.')

    b.add('1.3', 'Universal groups',
          'A group scope whose members can come from any domain in the forest and which can be used anywhere; its membership is stored in the global catalog, so keep it stable by nesting global groups instead of individual users.',
          'create a forest-wide group for executives whose members come from several domains',
          ['Domain local groups', 'Global groups', 'Distribution groups'],
          'Membership lives in the GLOBAL CATALOG — nest global groups to limit replication churn.',
          S.table(['Scope', 'Members from', 'Usable in'], [('Domain local', 'any domain', 'own domain'), ('Global', 'own domain', 'any domain'), ('Universal', 'any domain', 'any domain')], title='Group scopes', col_widths=[0.3, 0.35, 0.35]),
          caption='Universal groups accept members from any domain and can be used in any domain.')

    b.add('1.3', 'AGDLP nesting strategy',
          'The recommended pattern of placing Accounts in Global groups, those in Domain Local groups, and assigning Permissions to the domain local group; with universal groups the pattern becomes AGUDLP.',
          'permission a shared resource through nested groups instead of giving access to individual users',
          ['Delegation of control', 'Security filtering', 'Selective authentication'],
          'Accounts → Global → Domain local → Permissions — people never get rights directly.',
          S.steps([('Accounts', 'users'), ('Global', 'by role'), ('Domain local', 'by access'), ('Permissions', 'on the resource')], title='AGDLP', tones=['plain', 'blue', 'primary', 'green']),
          caption='AGDLP nests accounts into global groups, then domain local groups that hold the permissions.')

    b.add('1.3', 'Distribution groups',
          'A group type used only for email distribution lists; it has no security identifier role in access tokens, so it cannot be used to assign permissions.',
          'create an email list for a project team that will never be used to grant access to anything',
          ['Global groups', 'Domain local groups', 'Universal groups'],
          'Mail ONLY — it cannot appear in an ACL; security groups can do both.',
          S.compare(('Security group', ['Has a SID in tokens', 'Can be given permissions', 'Can also receive mail']), ('Distribution group', ['Email list only', 'Never in access tokens', 'Cannot be given permissions']), title='Group types'),
          caption='Distribution groups are email lists only and cannot be used for permissions.')

    b.add('1.3', 'Foreign security principals',
          'Placeholder objects in the ForeignSecurityPrincipals container, created automatically when a user or group from a trusted domain in another forest is added to a group in this domain.',
          'find the objects that represent accounts from another directory after they were added to a local group',
          ['Contact objects', 'Computer accounts', 'Universal groups'],
          'Created when you add an account from a TRUSTED domain to a local group.',
          S.steps([('Trusted-domain user', 'other forest'), ('Added to local group', 'in this domain'), ('Placeholder created', 'ForeignSecurityPrincipals')], title='Foreign security principal', tones=['amber', 'plain', 'blue']),
          caption='A foreign security principal represents an outside account that was added to a local group.')

    b.add('1.3', 'Active Directory Administrative Center (ADAC)',
          'A task-oriented management console built on PowerShell for managing users, groups, and OUs, restoring deleted objects from the Recycle Bin, and creating fine-grained password policies; it shows the PowerShell commands behind each action.',
          'restore a deleted user and create a password settings object from a modern console that shows the commands it runs',
          ['Active Directory Users and Computers', 'Active Directory Domains and Trusts', 'Group Policy Management Console'],
          'Recycle Bin and fine-grained password policies are right in this console — and it shows the PowerShell.',
          S.hub(('ADAC',), [('Users and groups', 'create and edit'), ('Recycle Bin', 'restore objects'), ('Password policies', 'PSO management')], title='Active Directory Administrative Center'),
          caption='ADAC is a PowerShell-based console with Recycle Bin and fine-grained password policy tools.')

    b.add('1.3', 'Bulk account creation with PowerShell and CSV',
          'Creating many accounts at once by reading a CSV file with Import-Csv and piping each row to New-ADUser; csvde and ldifde are older import tools.',
          'create two hundred new employee accounts from a spreadsheet saved as a CSV file',
          ['Active Directory Administrative Center (ADAC)', 'Offline domain join', 'Group Policy preferences'],
          'Import-Csv → ForEach-Object → New-ADUser; one row becomes one account.',
          S.terminal(['Import-Csv hires.csv | ForEach-Object {', '  New-ADUser -Name $_.Name -Path $_.OU', '}', '200 accounts created'], title='Windows PowerShell'),
          caption='Import-Csv piped to New-ADUser creates many accounts from one file.')

    b.add('1.3', 'Alternative UPN suffixes',
          'Extra user principal name suffixes added in Active Directory Domains and Trusts so users can sign in with an email-style name that matches a routable domain verified in Microsoft Entra ID instead of the internal domain name.',
          'let users in an internal .local domain sign in to cloud services with their public email-style name',
          ['Name suffix routing', 'Microsoft Entra Connect Sync', 'DNS forwarding and conditional forwarding'],
          'Add the suffix in DOMAINS AND TRUSTS, then set each user\'s UPN to it.',
          S.steps([('Add suffix', 'Domains and Trusts'), ('Set user UPN', 'ana@contoso.com'), ('Sync to Entra ID', 'matches verified domain')], title='UPN suffix', tones=['blue', 'plain', 'green']),
          caption='Alternative UPN suffixes let users sign in with a routable name that matches Entra ID.')

    b.add('1.3', 'Microsoft Entra Connect Sync',
          'A synchronization service that copies on-premises AD users, groups, and optionally password hashes to Microsoft Entra ID so people use one identity for both; Entra Cloud Sync is a lighter, agent-based alternative.',
          'keep on-premises accounts and cloud sign-ins in sync so people use a single identity for both',
          ['Microsoft Entra Domain Services', 'Active Directory Federation Services (AD FS)', 'Azure Arc-enabled Windows Server'],
          'SYNCS identities to the cloud — Entra Domain Services is a managed DOMAIN, not a sync tool.',
          S.steps([('On-premises AD', 'users and groups'), ('Entra Connect', 'sync + password hash'), ('Microsoft Entra ID', 'one identity')], title='Hybrid identity', tones=['blue', 'primary', 'green']),
          caption='Entra Connect Sync copies on-premises identities to Microsoft Entra ID.')

    b.add('1.3', 'Organizational units (OUs)',
          'Containers within a domain used to organize objects, delegate administration, and scope Group Policy; unlike groups, an OU is not a security principal and cannot be given permissions.',
          'separate the finance computers so they receive their own policy settings and a local team can manage them',
          ['Global groups', 'AD DS sites and subnets', 'Distribution groups'],
          'OUs hold OBJECTS and scope GPOs and delegation — groups hold MEMBERS and grant access.',
          S.compare(('Organizational unit', ['Holds objects', 'Scopes GPOs', 'Target of delegation']), ('Security group', ['Holds members', 'Grants permissions', 'Not a GPO scope']), title='OU vs. group'),
          caption='OUs organize objects and scope policy; groups collect members and grant access.')

    b.add('1.3', 'Offline domain join',
          'Joining a computer to a domain without a connection to a domain controller: djoin /provision creates the account and saves a blob file, and djoin /requestodj applies it, which suits unattended and virtual machine deployments.',
          'join a new server to the domain during deployment when it has no network path to a domain controller yet',
          ['Staged RODC installation', 'Install from Media (IFM)', 'Domain controller cloning'],
          'PROVISION the account ahead of time and apply the blob file on the new machine.',
          S.terminal(['djoin /provision /domain contoso /machine SRV7 /savefile odj.txt', 'Computer provisioning completed successfully.', 'djoin /requestodj /loadfile odj.txt /windowspath %windir% /localos', 'The operation completed successfully.'], title='Command Prompt'),
          caption='djoin provisions a computer account ahead of time so the machine can join with no domain controller.')

    b.add('1.3', 'KDS root key',
          'The forest-wide key, created once with Add-KdsRootKey, from which the Key Distribution Service derives gMSA passwords; in production it is not usable for about ten hours while it replicates, though a lab can back-date its effective time.',
          'prepare a forest to create its first account whose password the directory manages automatically',
          ['Windows LAPS (Local Administrator Password Solution)', 'Fine-grained password policy', 'Credential Guard'],
          'ONE key per forest, and about ten hours of replication unless you back-date it in a lab.',
          S.terminal(['Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))', 'Guid', '----', 'a1b2c3d4-0000-4e5f-9a8b-123456789abc'], title='Windows PowerShell'),
          caption='A KDS root key must exist in the forest before any gMSA can be created.')

    b.add('1.3', 'Standalone managed service account (sMSA)',
          'A service account whose password the domain manages and rotates automatically, usable on only one computer; it cannot be shared across servers or used in clusters.',
          'run one service on a single server with an automatically rotated password',
          ['Group managed service account (gMSA)', 'Delegated managed service account (dMSA)', 'KDS root key'],
          'One account, ONE computer — a gMSA is the version that works across many servers.',
          S.compare(('sMSA', ['One computer only', 'Automatic password', 'No clusters or farms']), ('gMSA', ['Many computers', 'Automatic password', 'Farms and clusters']), title='sMSA vs. gMSA'),
          caption='An sMSA is tied to a single computer; a gMSA can serve many hosts.')

    b.add('1.3', 'Group managed service account (gMSA)',
          'A service account with a directory-managed password that many servers can retrieve, created with New-ADServiceAccount and a list of allowed hosts; used by web farms, clusters, and scheduled tasks and installed on each host.',
          'run an application pool on every node of a web farm under one identity with an automatically rotated password',
          ['Standalone managed service account (sMSA)', 'Delegated managed service account (dMSA)', 'Windows LAPS (Local Administrator Password Solution)'],
          'ONE identity shared by a FARM — the allowed hosts retrieve the managed password.',
          S.terminal(['New-ADServiceAccount WebFarm -DNSHostName webfarm.contoso.com', '  -PrincipalsAllowedToRetrieveManagedPassword WebServers', 'Install-ADServiceAccount WebFarm', 'Test-ADServiceAccount WebFarm   True'], title='Windows PowerShell'),
          caption='A gMSA is created once and installed on each allowed host in the farm.')

    b.add('1.3', 'Delegated managed service account (dMSA)',
          'A Windows Server 2025 account type that binds authentication to specific machine identities, uses managed random keys that Credential Guard can protect, and lets an existing traditional service account migrate to it (a gMSA or sMSA cannot be migrated), which disables the old account password and reduces Kerberoasting exposure.',
          'replace a traditional service account on a Windows Server 2025 domain with one bound to its machine identity to resist credential theft',
          ['Group managed service account (gMSA)', 'Standalone managed service account (sMSA)', 'Protected Users group'],
          'Newest option — keys are tied to the MACHINE, and a legacy account can migrate to it.',
          S.steps([('Legacy account', 'start migration'), ('dMSA linked', 'keys bound to machine'), ('Old account disabled', 'dMSA takes over')], title='Migrating to a dMSA', tones=['amber', 'blue', 'green']),
          caption='A dMSA binds a service identity to machines and can replace a traditional service account.')

    # ------------------------------------------------------------------------------------------ 1.4
    b.add('1.4', 'GPO processing order (LSDOU)',
          'Policies are applied in the order Local, Site, Domain, then Organizational Unit, so when settings conflict the one applied last, from the OU closest to the object, wins; at one level a lower link order number is applied later and wins.',
          'predict which of two conflicting settings wins when one policy is linked high in the tree and another sits on the user\'s own container',
          ['Group Policy refresh', 'Group Policy Modeling', 'Group Policy Results'],
          'The LAST one applied wins — and the OU closest to the object is applied last.',
          S.steps([('Local', 'first'), ('Site', 'second'), ('Domain', 'third'), ('OU', 'last wins')], title='Policy application order', tones=['plain', 'blue', 'primary', 'green']),
          caption='Group Policy applies Local, Site, Domain, then OU, and the last setting applied wins.')

    b.add('1.4', 'Block Inheritance',
          'An OU setting that stops it from receiving GPOs linked at higher levels, except those with an enforced link.',
          'stop one OU from receiving the settings of policies linked at the domain level',
          ['Enforced GPO link', 'Security filtering', 'Loopback processing'],
          'Blocks what COMES DOWN — but an ENFORCED link still gets through.',
          S.steps([('Domain GPO', 'linked at domain'), ('Block Inheritance', 'set on the OU'), ('OU objects', 'do not receive it')], title='Block Inheritance', tones=['blue', 'amber', 'plain']),
          caption='Block Inheritance stops an OU from receiving policies linked above it unless they are enforced.')

    b.add('1.4', 'Enforced GPO link',
          'A link option that makes a GPO\'s settings win over conflicts in lower-level GPOs and apply even to OUs that block inheritance.',
          'make a security baseline apply to every OU even where administrators have blocked inherited policy',
          ['Block Inheritance', 'Security filtering', 'Starter GPOs'],
          'ENFORCED beats Block Inheritance — and it wins conflicts against lower-level GPOs.',
          S.compare(('Enforced link', ['Wins conflicts below it', 'Applies despite blocking', 'Set on the link']), ('Block Inheritance', ['Stops inherited GPOs', 'Cannot stop enforced ones', 'Set on the OU']), title='Enforced vs. block'),
          caption='An enforced link overrides lower-level conflicts and Block Inheritance.')

    b.add('1.4', 'Security filtering',
          'Limiting a GPO to chosen users, groups, or computers by granting the Apply Group Policy permission only to them (the default is Authenticated Users); Read permission must still be available to the computer or user.',
          'apply a policy only to the members of one security group inside an OU',
          ['WMI filtering', 'Item-level targeting', 'Block Inheritance'],
          'Uses the APPLY permission on the GPO — remove Authenticated Users from Apply, add the group.',
          S.steps([('GPO linked to OU', 'applies to all'), ('Security filter', 'Apply permission'), ('Only the group', 'gets the settings')], title='Security filtering', tones=['plain', 'blue', 'green']),
          caption='Security filtering applies a GPO only to the principals granted Apply Group Policy.')

    b.add('1.4', 'WMI filtering',
          'Restricting a GPO with a WMI query evaluated on each client, so the policy applies only when the query returns true, for example only on a certain operating system version.',
          'apply a setting only to computers that run a particular server operating system version',
          ['Security filtering', 'Item-level targeting', 'Loopback processing'],
          'A WQL QUERY runs on the client — true means the GPO applies.',
          S.terminal(['SELECT * FROM Win32_OperatingSystem', 'WHERE Version LIKE "10.%"', 'AND ProductType = "3"'], title='WMI filter (WQL)', prompt_first=False),
          caption='A WMI filter applies a GPO only when its query returns true on the client.')

    b.add('1.4', 'Loopback processing',
          'A computer policy setting that makes user settings come from the GPOs that apply to the computer, in Replace mode (ignore the user\'s own) or Merge mode (add them, with the computer\'s winning conflicts); used on kiosks, lab machines, and RDS hosts.',
          'force the same user settings on everyone who signs in to a shared Remote Desktop session host regardless of their normal policy',
          ['Security filtering', 'Block Inheritance', 'Item-level targeting'],
          'The COMPUTER\'s location decides user settings — Replace ignores the user\'s own GPOs.',
          S.compare(('Replace mode', ['User\'s own GPOs ignored', 'Computer\'s user GPOs only', 'Kiosks and labs']), ('Merge mode', ['User GPOs applied first', 'Computer\'s user GPOs next', 'Computer wins conflicts']), title='Loopback modes'),
          caption='Loopback processing applies user settings based on the computer, in Replace or Merge mode.')

    b.add('1.4', 'Central store for administrative templates',
          'A PolicyDefinitions folder in SYSVOL holding ADMX and ADML files so every administrator who edits a GPO sees the same, current policy settings instead of whatever templates are on their own machine.',
          'make settings for a newly released Windows version appear for every administrator who edits policies, without copying files to each workstation',
          ['Starter GPOs', 'GPO backup, import, and copy', 'Group Policy preferences'],
          'ONE copy of ADMX/ADML in SYSVOL — update it once for all administrators.',
          S.layers([('PolicyDefinitions', 'folder in SYSVOL', 'blue'), ('ADMX files', 'define the settings', 'primary'), ('ADML files', 'language strings', 'green')], title='Central store'),
          caption='The central store keeps one copy of ADMX and ADML files in SYSVOL for all GPO editors.')

    b.add('1.4', 'Group Policy refresh',
          'Clients re-evaluate policy every 90 minutes with a random offset of up to 30, domain controllers every 5 minutes; computer policy also applies at startup and user policy at sign-in, and gpupdate /force triggers it on demand.',
          'apply a newly linked policy right away on a workstation without waiting for the normal background interval',
          ['Group Policy Results', 'Group Policy Modeling', 'GPO processing order (LSDOU)'],
          'gpupdate /force is the immediate refresh — background refresh is 90 minutes plus a random offset.',
          S.terminal(['gpupdate /force', 'Updating policy...', 'Computer Policy update has completed successfully.', 'User Policy update has completed successfully.'], title='Command Prompt'),
          caption='Group Policy refreshes in the background every 90 minutes; gpupdate /force applies it now.')

    b.add('1.4', 'GPO backup, import, and copy',
          'Backup-GPO saves a policy\'s settings, Import-GPO loads them into another GPO or domain, and Copy-GPO duplicates one; a migration table maps users, groups, and paths from the source domain to the target.',
          'reuse a policy tested in a lab domain in production by exporting its settings to files',
          ['Starter GPOs', 'Central store for administrative templates', 'Group Policy Modeling'],
          'A MIGRATION TABLE maps accounts and paths when the target is a different domain.',
          S.steps([('Backup-GPO', 'saves settings'), ('Migration table', 'maps accounts'), ('Import-GPO', 'applies in target')], title='Moving a GPO', tones=['blue', 'amber', 'green']),
          caption='Backup-GPO and Import-GPO move policy settings between domains using a migration table.')

    b.add('1.4', 'Item-level targeting',
          'A Group Policy preferences feature that applies a single preference item only when conditions match, such as group membership, operating system, IP range, or a WMI query.',
          'map a network drive only for users in one group and only when they are on a particular subnet, within a single preference policy',
          ['Security filtering', 'WMI filtering', 'Loopback processing'],
          'Targets ONE preference item — security filtering scopes the whole GPO.',
          S.compare(('Item-level targeting', ['One preference item', 'Group, OS, IP, WMI', 'Preferences only']), ('Security filtering', ['The whole GPO', 'Users, groups, computers', 'All settings in it']), title='Targeting scope'),
          caption='Item-level targeting conditions a single preference item; security filtering scopes a whole GPO.')

    b.add('1.4', 'Group Policy preference actions (Create, Replace, Update, Delete)',
          'Each preference item has an action: Create adds it only if missing, Replace deletes and re-creates it, Update changes only the listed properties, and Delete removes it.',
          'change only one property of an existing registry value without removing and re-creating it',
          ['Item-level targeting', 'Security filtering', 'Group Policy Results'],
          'UPDATE changes listed properties; REPLACE wipes and recreates.',
          S.table(['Action', 'Effect'], [('Create', 'Add if missing'), ('Replace', 'Delete and recreate'), ('Update', 'Change listed properties'), ('Delete', 'Remove the item')], title='Preference actions', col_widths=[0.35, 0.65]),
          caption='Preference actions control whether an item is added, rebuilt, modified, or removed.')

    b.add('1.4', 'Default Domain Policy',
          'The GPO linked at the domain root that carries the default account policies, namely password, account lockout, and Kerberos settings; keep it for those settings and use separate GPOs for everything else.',
          'find where a domain\'s default password rules and Kerberos ticket lifetimes are configured',
          ['Default Domain Controllers Policy', 'Fine-grained password policy', 'Starter GPOs'],
          'Domain-wide ACCOUNT policy lives here — user rights for DCs are in the Domain Controllers policy.',
          S.compare(('Default Domain Policy', ['Linked to the domain', 'Password and lockout', 'Kerberos settings']), ('Domain Controllers policy', ['Linked to DC OU', 'User rights on DCs', 'Audit settings']), title='The two default GPOs'),
          caption='The Default Domain Policy holds domain-wide password, lockout, and Kerberos settings.')

    b.add('1.4', 'Starter GPOs',
          'Read-only templates holding Administrative Templates settings that serve as a baseline when you create new GPOs.',
          'create each new department\'s policy from a common template that already has approved administrative template settings',
          ['GPO backup, import, and copy', 'Central store for administrative templates', 'Group Policy preferences'],
          'TEMPLATES for new GPOs — and they hold Administrative Templates settings only.',
          S.steps([('Starter GPO', 'baseline settings'), ('New GPO from it', 'copy of the baseline'), ('Customize', 'department changes')], title='Starter GPO', tones=['blue', 'plain', 'green']),
          caption='A Starter GPO is a read-only baseline used to create new GPOs.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Cloning, staging, and operating master roles', ['1.1'],
              'You can seed a new domain controller from a backup (Install from Media, made with ntdsutil) so only recent changes cross the WAN, or clone a virtual one: authorize the source in the Cloneable Domain Controllers group, create DCCloneConfig.xml, and copy the VM. A staged RODC installation lets an administrator pre-create the RODC account while a delegated branch user finishes promotion, and administrator role separation gives that user local admin rights without any domain privileges. If an RODC is stolen, deleting its account offers to reset every password it had cached.\n\n'
              'Of the five FSMO roles, the schema master and domain naming master are forest-wide, while the PDC emulator (time, password changes, lockouts, GPO edits), RID master (RID pools for unique SIDs), and infrastructure master (cross-domain references) are per domain. Use netdom query fsmo to see the holders. Transfer roles while both domain controllers are online; seize them only when the holder is permanently lost, and never bring that holder back without a rebuild. Demote a live controller gracefully; metadata cleanup is for dead ones. In Azure, put the database on a data disk with host caching None, use a static private IP, and compare running your own DCs with Microsoft Entra Domain Services, which is managed and gives no Domain Admin access.')
    b.section('Trusts, sites, and replication in depth', ['1.2'],
              'Know the four trust types. A forest trust is transitive between forest roots, an external trust is non-transitive between two domains, a shortcut trust shortens the path inside a forest, and a realm trust connects to a non-Windows Kerberos realm. In a one-way trust, users in the trusted domain get access to resources in the trusting domain. SID filtering strips foreign SIDs from tokens, selective authentication limits who may authenticate to which servers, and name suffix routing controls which suffixes cross a forest trust. DNS must resolve the partner forest before any trust can be created.\n\n'
              'Inside a site, replication is quick (about 15 seconds after a change); between sites it follows the site link interval (180 minutes by default, minimum 15) and is compressed, unless change notification is enabled. Bridgehead servers carry changes between sites, and site link bridges (transitive by default) can be disabled on partially routed networks. The directory replicates in partitions: schema and configuration forest-wide, domain data within the domain, and application partitions such as DNS to chosen DCs. SYSVOL replicates with DFS Replication, universal group membership caching spares small sites a global catalog, and clients find DCs through SRV records that Netlogon registers.')
    b.section('Groups, OUs, and service accounts', ['1.3'],
              'Group scope decides who can be a member and where the group can be used: domain local groups hold permissions in their own domain, global groups hold users from one domain, and universal groups span the forest and are stored in the global catalog. The standard pattern is AGDLP, accounts into global groups into domain local groups that receive the permissions. Distribution groups are for email only, OUs organize objects and scope GPOs and delegation, and foreign security principals represent accounts from trusted domains in your groups.\n\n'
              'For service accounts, a standalone managed service account serves one computer, a group managed service account serves many and needs a KDS root key (created once per forest), and a delegated managed service account in Windows Server 2025 binds to machine identities and can replace a traditional account. Bulk-create accounts with Import-Csv and New-ADUser, add alternative UPN suffixes so users sign in with a routable name, synchronize identities with Microsoft Entra Connect Sync, and use djoin for offline domain join.')
    b.section('Group Policy scoping and management', ['1.4'],
              'Policy applies in the order Local, Site, Domain, OU, and the last applied wins, with a lower link order number applied later at the same level. Enforced links override conflicts and Block Inheritance, while Block Inheritance stops unenforced policies from above. To narrow a GPO, use security filtering (the Apply permission), WMI filtering (a query run on the client), or, for one preference item, item-level targeting. Loopback processing in Replace or Merge mode applies user settings by computer, for kiosks and RDS hosts.\n\n'
              'Clients refresh policy every 90 minutes plus a random offset of up to 30 (domain controllers every 5), and gpupdate /force refreshes at once. Keep one central store of ADMX/ADML files in SYSVOL, use Starter GPOs as baselines, move policies between domains with Backup-GPO, Import-GPO, and a migration table, and remember that preference actions are Create, Replace, Update, and Delete. The Default Domain Policy holds the domain\'s account policies.')
