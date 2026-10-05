"""Core 2, domain 4 (Operational Procedures): new concepts for the existing objectives 4.1-4.5."""
import svg as S


def build(b):
    b.topics['4.1'] = ['Tickets', 'SOPs', 'Assets', 'SLAs', 'Knowledge bases', 'Severity', 'Asset life cycle', 'Onboarding and offboarding']
    b.topics['4.2'] = ['Scope', 'Risk', 'Approval', 'Backout', 'Documentation', 'Sandbox testing', 'User acceptance', 'Maintenance window', 'Emergency change']
    b.topics['4.3'] = ['Full', 'Incremental', 'Differential', '3-2-1', 'Testing', 'Synthetic full', 'Off-site', 'RPO and RTO', 'Snapshots']
    b.topics['4.4'] = ['ESD', 'SDS', 'Disposal', 'Lifting', 'Fire safety', 'Power disconnection', 'PPE', 'Humidity', 'UPS', 'Dust']
    b.topics['4.5'] = ['Communication', 'Privacy', 'Licensing', 'AUP', 'Remote support', 'Prohibited content', 'Regulated data', 'Retention', 'Active listening']

    # ------------------------------------------------------------------------------------------ 4.1
    b.add('4.1', 'Ticket severity and priority',
          'Ranking tickets by category, impact, and urgency so critical outages are handled before minor requests, with response targets for each level.',
          'decide that a server outage affecting every employee is handled before a request for a second monitor',
          ['A first-come, first-served queue', 'A ticket closure code', 'A knowledge base article'],
          'IMPACT and urgency set the order, not arrival time.',
          S.table(['Severity', 'Example', 'Response'], [('1 Critical', 'company-wide outage', 'immediate'), ('2 High', 'department is down', 'within hours'), ('3 Medium', 'one user is blocked', 'same day'), ('4 Low', 'how-to or request', 'scheduled')],
                  title='Typical severity levels', col_widths=[0.25, 0.45, 0.3]),
          caption='Severity combines impact and urgency to decide which tickets are worked first.')

    b.add('4.1', 'Ticket progress notes and resolution',
          'Recording a clear problem description, each step taken, and the final resolution in the ticket so others can follow the work and reuse the fix.',
          'make sure a colleague taking over a case can see what was already tried and how it was solved',
          ['An escalation path', 'An asset tag', 'An SLA'],
          'It records what was TRIED and what fixed it — the raw material for a knowledge base article.',
          S.steps([('Describe', 'clear problem statement'), ('Log each step', 'what was tried'), ('Resolution', 'what finally fixed it')], title='Documenting a ticket', tones=['plain', 'blue', 'green']),
          caption='Clear descriptions, progress notes, and the resolution make a ticket useful to the next technician.')

    b.add('4.1', 'Asset life cycle',
          'The stages an asset passes through: procurement, deployment and assignment, maintenance, and retirement or disposal, with warranty, license, and owner details tracked throughout.',
          'track a laptop from purchase and warranty through assignment to a user and eventual secure disposal',
          ['A change request', 'A backup rotation', 'A ticket escalation'],
          'The device\'s whole LIFE: procure, deploy, maintain, retire — each stage needs records.',
          S.steps([('Procure', 'buy, warranty'), ('Deploy', 'tag and assign'), ('Maintain', 'repair, update'), ('Retire', 'wipe, dispose')], title='Asset life cycle', tones=['blue', 'green', 'amber', 'red']),
          caption='Asset tracking follows a device from procurement through use to secure disposal.')

    b.add('4.1', 'New-user setup checklist',
          'A document listing every onboarding task for a new employee, such as accounts, permissions, hardware, software, and training, so setup is consistent and nothing is forgotten.',
          'make sure every new hire receives the same accounts, hardware, and access without steps being missed',
          ['An end-user termination checklist', 'An incident report', 'A backup SOP'],
          'It covers ONBOARDING — the termination checklist handles accounts and equipment when someone leaves.',
          S.facts([('Accounts', 'email, directory, apps'), ('Access', 'groups and permissions'), ('Hardware', 'laptop, phone, badge'), ('Training', 'security and policies')], title='Onboarding checklist'),
          caption='A new-user checklist makes onboarding consistent: accounts, access, hardware, and training.')

    b.add('4.1', 'End-user termination checklist',
          'The offboarding steps for a departing employee: disable accounts, revoke access, collect equipment and badges, and preserve or reassign their data.',
          'make sure a departing employee\'s access is revoked and equipment is returned the same day',
          ['A new-user setup checklist', 'A change request', 'An incident report'],
          'Disable access FIRST and collect assets — the risk from an insider peaks around departure.',
          S.steps([('Disable accounts', 'and revoke access'), ('Collect assets', 'laptop, badge, keys'), ('Preserve data', 'reassign and archive')], title='Offboarding', tones=['red', 'amber', 'green']),
          caption='A termination checklist removes access and recovers assets when someone leaves.')

    # ------------------------------------------------------------------------------------------ 4.2
    b.add('4.2', 'Sandbox testing (change management)',
          'Testing a change in an isolated environment that mirrors production before deploying it, so problems are found without affecting real users.',
          'verify that a new patch does not break the line-of-business application without touching production',
          ['Deploying to production first', 'Skipping tests for small changes', 'A rollback plan'],
          'Test BEFORE production in an isolated copy — a rollback plan is for when deployment goes wrong.',
          S.steps([('Sandbox', 'isolated copy'), ('Test the change', 'verify behavior'), ('Production', 'only if it passes')], title='Test before you deploy', tones=['plain', 'blue', 'green']),
          caption='Sandbox testing proves a change works in an isolated copy before production sees it.')

    b.add('4.2', 'End-user acceptance',
          'Users confirm after implementation that the change works for their real workflows, and only then is the change closed.',
          'have the accounting team confirm that the upgraded software works for their workflows before the change is closed',
          ['Change board approval', 'Risk analysis', 'A backout plan'],
          'Users sign off AFTER implementation — change board approval happens before it.',
          S.steps([('Implement', 'change is made'), ('Users test', 'real workflows'), ('Acceptance', 'change is closed')], title='Closing a change', tones=['blue', 'amber', 'green']),
          caption='End-user acceptance confirms the finished change actually works for the people who use it.')

    b.add('4.2', 'Maintenance window',
          'A scheduled period, usually when few people are working, set aside for planned changes, announced to stakeholders in advance, with a deadline to finish or roll back.',
          'schedule a server patch for Sunday at 2 a.m., when few users are online, and tell stakeholders in advance',
          ['An emergency change', 'A backout plan', 'Risk analysis'],
          'Pick the lowest-impact TIME and announce it ahead — it is the "date and time" part of the change plan.',
          S.facts([('When', 'a low-usage period'), ('Notify', 'stakeholders in advance'), ('Deadline', 'finish or roll back by then')], title='Maintenance window'),
          caption='A maintenance window schedules a change for the least disruptive time and announces it first.')

    b.add('4.2', 'Emergency change',
          'A fast-tracked change made to fix a critical outage or security problem, approved quickly and documented and reviewed afterwards, unlike pre-approved standard changes.',
          'apply a fix to a down production system immediately and document it for review afterwards',
          ['A standard change', 'A normal scheduled change', 'Sandbox testing'],
          'Fast-tracked for a critical outage and reviewed AFTER — a standard change is pre-approved and routine.',
          S.compare(('Standard change', ['Pre-approved', 'Low risk and repeatable', 'Example: a routine patch']), ('Emergency change', ['Fast-tracked approval', 'Fixes a critical outage', 'Reviewed afterwards']), title='Change types'),
          caption='Emergency changes skip normal lead time to fix critical problems, then are reviewed afterwards.')

    # ------------------------------------------------------------------------------------------ 4.3
    b.add('4.3', 'Synthetic full backup',
          'A full backup assembled on the backup server by combining the last full backup with later incrementals, so a new full is produced without reading all the data from the source again.',
          'produce a new full backup without transferring all the data from the production server again',
          ['A differential backup', 'A snapshot', 'A full backup from the source'],
          'It is built on the BACKUP server from existing pieces — the source is not read again.',
          S.steps([('Last full', '+ incrementals'), ('Merged on server', 'no source reads'), ('New full backup', 'ready to restore')], title='Synthetic full', tones=['plain', 'blue', 'green']),
          caption='A synthetic full combines an older full with incrementals on the backup server.')

    b.add('4.3', 'Off-site backup',
          'A backup copy stored away from the primary location, such as a vault or the cloud, so it survives a site disaster; on-site copies restore faster but are lost with the building.',
          'make sure data survives a fire that destroys the office and the on-site backup drives',
          ['An on-site backup only', 'A second copy on the same server', 'A snapshot on the same storage'],
          'It survives a SITE disaster — on-site is quick to restore but dies with the building.',
          S.compare(('On-site', ['Fast restores', 'Lost in a fire or theft']), ('Off-site', ['Survives a site disaster', 'Slower to restore']), title='Backup location', tones=('amber', 'green')),
          caption='Off-site backups survive a disaster at the main site; on-site backups restore faster.')

    b.add('4.3', 'Recovery point objective (RPO)',
          'The maximum amount of data loss, measured in time, that the business will accept; it determines how often backups or replication must run.',
          'decide how often to back up so that no more than four hours of data can ever be lost',
          ['Recovery time objective (RTO)', 'Mean time to repair', 'Backup rotation'],
          'RPO is how much DATA you can lose — RTO is how long you can be down.',
          S.compare(('RPO', ['How much data can be lost', 'Drives backup frequency', 'Measured back from failure']), ('RTO', ['How long downtime may last', 'Drives recovery design', 'Measured forward to restore']), title='RPO vs RTO'),
          caption='RPO is the acceptable data loss; it sets how frequently backups must run.')

    b.add('4.3', 'Recovery time objective (RTO)',
          'The maximum time a system can be down before the business is harmed; it determines how quickly restoration must complete and what recovery methods are needed.',
          'set a target that the payroll system must be restored within two hours of a failure',
          ['Recovery point objective (RPO)', 'A service level agreement', 'Backup frequency'],
          'RTO is how long you can be DOWN — RPO is how much data you can lose.',
          S.steps([('Failure', 'system goes down'), ('Restore', 'within the RTO'), ('Back in service', 'before harm grows')], title='Recovery time objective', tones=['red', 'blue', 'green']),
          caption='RTO is the longest acceptable downtime; it sets how fast recovery has to be.')

    b.add('4.3', 'Snapshot (not a backup)',
          'A point-in-time capture of a virtual machine or volume that is quick to create and revert, but depends on the original storage and so does not replace a true backup.',
          'capture a virtual machine\'s state before a risky update so it can be reverted in minutes',
          ['A full backup', 'An off-site backup', 'A differential backup'],
          'A fast REVERT point on the same storage — it does not protect against losing that storage.',
          S.steps([('Before the update', 'take a snapshot'), ('Update fails', 'revert in minutes'), ('Not a backup', 'same storage underneath')], title='Snapshots', tones=['blue', 'amber', 'red']),
          caption='A snapshot is a quick rollback point on the same storage, not a substitute for a backup.')

    # ------------------------------------------------------------------------------------------ 4.4
    b.add('4.4', 'Power disconnection before service',
          'Before opening equipment, shut it down, unplug the power cord, remove the battery where possible, and discharge residual power by holding the power button; an ESD strap protects parts, not you from mains voltage.',
          'make a desktop PC safe to open before replacing an internal component',
          ['Wearing an ESD strap only', 'Working with the power on', 'Putting the PC to sleep'],
          'Unplug FIRST — an ESD strap protects the components, not you from the power supply.',
          S.steps([('Shut down', 'not just sleep'), ('Unplug', 'power cord and battery'), ('Discharge', 'hold power 5 seconds')], title='Before opening a PC', tones=['plain', 'amber', 'green']),
          caption='Shut down, unplug, and discharge residual power before opening equipment.')

    b.add('4.4', 'Personal protective equipment (PPE)',
          'Protective gear such as safety goggles, an air filtration mask, and gloves that protect a technician from debris, toner or dust, and sharp or hot parts.',
          'clean a toner spill and dusty fans without inhaling particles or getting debris in the eyes',
          ['An ESD strap', 'Compressed air only', 'A surge protector'],
          'PPE protects the PERSON — an ESD strap protects the components.',
          S.table(['Hazard', 'Protective item'], [('Flying debris', 'safety goggles'), ('Dust and toner', 'air filtration mask'), ('Sharp or hot parts', 'gloves')], title='Matching PPE to the hazard', col_widths=[0.45, 0.55]),
          caption='PPE such as goggles, masks, and gloves protects the technician from debris, dust, and sharp parts.')

    b.add('4.4', 'Temperature and humidity control',
          'Equipment rooms should stay cool and moderately humid, roughly 40 to 60 percent: too dry increases static discharge, too humid causes condensation and corrosion, and good ventilation prevents overheating.',
          'reduce static discharge risk in a very dry server closet without causing condensation',
          ['Raising the room temperature', 'Removing all ventilation', 'Using compressed air'],
          'Too low a humidity means STATIC, too high means corrosion — aim for roughly 40 to 60 percent.',
          S.table(['Humidity', 'Risk'], [('Below 40%', 'static discharge (ESD)'), ('40% to 60%', 'target range'), ('Above 60%', 'condensation, corrosion')], title='Humidity and equipment', col_widths=[0.35, 0.65]),
          caption='Keep equipment rooms cool and at moderate humidity to avoid static and corrosion.')

    b.add('4.4', 'UPS (uninterruptible power supply)',
          'A battery backup that keeps equipment powered through outages and sags long enough to shut down cleanly, and often conditions the line; a surge protector only absorbs voltage spikes.',
          'keep a server running long enough to shut down cleanly during a power outage',
          ['A surge protector', 'A power strip', 'A grounding strap'],
          'BATTERY runtime during outages — a surge protector only absorbs spikes and cannot keep power flowing.',
          S.compare(('Surge protector', ['Clamps voltage spikes', 'No battery', 'Cannot cover an outage']), ('UPS', ['Battery backup', 'Covers outages and sags', 'Time for a clean shutdown']), title='Surge protector vs UPS'),
          caption='A UPS supplies battery power during outages, while a surge protector only absorbs spikes.')

    b.add('4.4', 'Dust removal and air filtration',
          'Dust is removed with compressed air (holding fans still so they do not spin up), an ESD-safe vacuum, and filters or enclosures in dusty areas; a household vacuum generates static.',
          'clean dust from a PC\'s fans and heat sink safely and prevent overheating',
          ['A household vacuum cleaner', 'A damp cloth', 'A hair dryer on high'],
          'Compressed air or an ESD-safe vacuum, with fans held still — a household vacuum builds static.',
          S.steps([('Power off', 'and unplug'), ('Hold fans still', 'compressed air in bursts'), ('Check airflow', 'filters and vents')], title='Cleaning dust safely', tones=['amber', 'blue', 'green']),
          caption='Use compressed air or an ESD-safe vacuum, holding fans still, to remove dust without static.')

    # ------------------------------------------------------------------------------------------ 4.5
    b.add('4.5', 'Handling prohibited content',
          'If a technician finds illegal or prohibited content on a device, the right response is to stop, leave the device as it is to preserve evidence, and report it through the proper channel instead of deleting, copying, or showing it.',
          'respond correctly after discovering illegal material while repairing an employee\'s laptop',
          ['Delete it quietly', 'Show it to coworkers', 'Copy it to a USB drive'],
          'STOP, preserve, and REPORT — never delete, copy, or show it.',
          S.steps([('Stop work', 'do not open more'), ('Preserve', 'leave the device as is'), ('Report', 'manager, security, HR')], title='Finding prohibited content', tones=['red', 'amber', 'green']),
          caption='On finding prohibited content, stop, preserve the evidence, and report it to the proper people.')

    b.add('4.5', 'Regulated data (PCI DSS, HIPAA, GDPR)',
          'Some data is protected by law or industry rules, such as payment card data (PCI DSS), health information (HIPAA), and EU personal data (GDPR), each with requirements for handling, retention, and breach notification.',
          'handle a laptop containing patient records according to the rules that protect health information',
          ['Open-source license terms', 'The acceptable use policy alone', 'A standard operating procedure for printing'],
          'Each data type has its own rule: card data PCI DSS, health data HIPAA, EU personal data GDPR.',
          S.table(['Data', 'Governing rule'], [('Payment card numbers', 'PCI DSS'), ('Patient health records', 'HIPAA'), ('EU residents\' personal data', 'GDPR')], title='Regulated data', col_widths=[0.55, 0.45]),
          caption='Payment, health, and personal data fall under PCI DSS, HIPAA, and GDPR respectively.')

    b.add('4.5', 'Data retention policy',
          'Rules for how long each kind of record must be kept and when it must be securely destroyed, to satisfy legal, regulatory, and business needs.',
          'determine how long email and financial records must be kept before being securely destroyed',
          ['An acceptable use policy', 'A backup rotation', 'A change management process'],
          'It defines HOW LONG to keep data and when to destroy it — an AUP defines how users may use systems.',
          S.steps([('Create', 'record is made'), ('Retain', 'for the required period'), ('Destroy', 'securely, and log it')], title='Retention', tones=['blue', 'amber', 'red']),
          caption='A retention policy sets how long records are kept and when they are securely destroyed.')

    b.add('4.5', 'Personal-use license restriction',
          'Software offered free for personal or home use usually prohibits business use, so a company must buy a corporate or volume license, while open-source licenses permit use under their own conditions.',
          'check whether a utility that is free for home use may be installed on company computers',
          ['An open-source license', 'A site license', 'A volume license'],
          'Free for HOME use rarely covers business — check the license type before deploying.',
          S.table(['License', 'Typical rule'], [('Personal', 'home use only'), ('Corporate or volume', 'business use per seat or site'), ('Open source', 'use and modify under its terms')], title='License types', col_widths=[0.35, 0.65]),
          caption='Personal licenses usually exclude business use; corporate, volume, and open-source licenses differ.')

    b.add('4.5', 'Digital rights management (DRM)',
          'Technology that controls how licensed content may be used, copied, or shared and ties it to the licensed user or device; circumventing it can be illegal.',
          'explain why a licensed e-book or video cannot be copied or opened on an unauthorized device',
          ['An acceptable use policy', 'Encryption at rest', 'Data loss prevention'],
          'It enforces COPYRIGHT limits on content — DLP stops company data from leaving.',
          S.steps([('Licensed content', 'tied to an account'), ('DRM check', 'device and rights verified'), ('Allowed or blocked', 'copy and share limits')], title='DRM', tones=['plain', 'blue', 'amber']),
          caption='DRM restricts copying and use of licensed content to the authorized user or device.')

    b.add('4.5', 'Active listening',
          'Letting the customer finish without interrupting, restating the problem in your own words, taking notes, and asking clarifying questions so the real issue is understood.',
          'confirm you understood a frustrated customer\'s problem by restating it and asking clarifying questions',
          ['Interrupting with the likely fix', 'Using technical jargon', 'Taking another call during the conversation'],
          'Let them finish, RESTATE, then clarify — solving the wrong problem is the real waste of time.',
          S.steps([('Listen', 'do not interrupt'), ('Restate', 'confirm the problem'), ('Clarify', 'ask follow-up questions')], title='Active listening', tones=['plain', 'blue', 'green']),
          caption='Active listening means not interrupting, restating the issue, and asking clarifying questions.')

    b.add('4.5', 'De-escalating a difficult customer',
          'Staying calm and professional, not arguing or becoming defensive, not taking comments personally, acknowledging the frustration, focusing on the problem, and escalating when needed.',
          'handle an angry customer who is raising their voice about a repeated outage',
          ['Arguing the facts', 'Ending the call', 'Blaming another department'],
          'Stay calm, empathize, and focus on the PROBLEM — never argue or get defensive.',
          S.steps([('Stay calm', 'do not argue'), ('Empathize', 'acknowledge frustration'), ('Resolve or escalate', 'set expectations')], title='Difficult customers', tones=['blue', 'amber', 'green']),
          caption='With an upset customer, stay calm, acknowledge the frustration, and focus on resolving the issue.')

    b.add('4.5', 'Setting expectations and following up',
          'Giving honest timeframes, explaining options such as repair or replacement, documenting the conversation, and following up afterward to confirm the customer is satisfied.',
          'make sure a customer knows the repair timeline and confirms satisfaction after the fix',
          ['Closing the ticket silently', 'Promising an immediate fix', 'Skipping documentation'],
          'Honest TIMELINES and a follow-up — over-promising or silence both erode trust.',
          S.steps([('Set expectations', 'honest timeframes'), ('Keep them informed', 'status updates'), ('Follow up', 'confirm satisfaction')], title='Customer expectations', tones=['blue', 'plain', 'green']),
          caption='Set honest expectations, keep the customer informed, and follow up after the fix.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Tickets, assets, and employee lifecycle', ['4.1'],
              'Order tickets by severity — the combination of impact and urgency — rather than arrival time, and record a clear problem description, each step taken, and the resolution so the next technician (and the knowledge base) can use it. Asset records follow the full life cycle: procurement, deployment and assignment, maintenance, and retirement.\n\n'
              'Checklists keep onboarding and offboarding consistent. A new-user checklist covers accounts, access, hardware, and training; a termination checklist disables access first, collects equipment and badges, and preserves or reassigns data.')
    b.section('More change-management practice', ['4.2'],
              'Test changes in a sandbox that mirrors production before they go live, schedule them in a maintenance window when few people are affected, and announce them to stakeholders. After implementation, end users confirm the change works for their real workflows (end-user acceptance) before it is closed.\n\n'
              'Standard changes are pre-approved, low-risk, and repeatable, while an emergency change is fast-tracked to fix a critical outage and reviewed afterwards.')
    b.section('Backup objectives and storage', ['4.3'],
              'A synthetic full backup is assembled on the backup server from the last full and later incrementals, so the source is not read again. Off-site copies (a vault or the cloud) survive a site disaster, whereas on-site copies restore faster but are lost with the building. A snapshot is a quick rollback point on the same storage, not a replacement for a backup.\n\n'
              'Two targets drive the design: the recovery point objective (RPO) is how much data you can afford to lose and so sets the backup frequency, and the recovery time objective (RTO) is how long you can be down and so sets how fast recovery must be.')
    b.section('Safety and environmental controls', ['4.4'],
              'Before opening equipment, shut it down, unplug it, remove the battery where possible, and discharge residual power; an ESD strap protects components, not you. PPE protects the person: goggles for debris, an air filtration mask for dust and toner, and gloves for sharp or hot parts.\n\n'
              'Keep equipment rooms cool with humidity around 40 to 60 percent (too dry invites static, too humid causes corrosion), use a UPS for battery backup during outages (a surge protector only absorbs spikes), and remove dust with compressed air or an ESD-safe vacuum while holding fans still.')
    b.section('Policies, data rules, and customer communication', ['4.5'],
              'If you find prohibited or illegal content, stop, preserve the device as it is, and report it — never delete, copy, or show it. Regulated data has its own rules (PCI DSS for payment cards, HIPAA for health records, GDPR for EU personal data), a retention policy states how long to keep records and when to destroy them, and license type matters: free for personal use rarely covers business, and DRM restricts copying of licensed content.\n\n'
              'Good customer handling is a technical skill too: listen actively without interrupting, restate the problem, stay calm with difficult customers, set honest expectations, and follow up to confirm the customer is satisfied.')
