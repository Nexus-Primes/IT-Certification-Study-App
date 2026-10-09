"""3CX Advanced, domain a2 (Integrations & Unified Communications): the CRM integration wizard, Microsoft 365 sync, Teams presence, Live Chat, and video conferencing ports.

Checked against the 3CX administrator manual (CRM integration, Microsoft 365, live chat, and firewall pages, 2026).
"""
import svg as S

DOMAIN = 'a2'


def build(b):
    b.topics['2.1'] = ['CRM connectors', 'CRM Integration Wizard', 'Authentication methods', 'Contact lookup', 'Testing the API', 'Click-to-call', 'Screen pop', 'Call logging']
    b.topics['2.2'] = ['SSO', 'M365 user sync', 'Contact sync', 'Phonebook sync', 'Teams presence', 'Presence loops', 'M365 email', 'Calendar presence']
    b.topics['2.3'] = ['Live chat widget', 'Chat fallback calling', 'Website embedding', 'SMS/WhatsApp', 'Video conferencing', 'Video ports', 'Screen sharing']

    # ------------------------------------------------------------------------------------------ 2.1
    b.add('2.1', 'CRM Integration Wizard',
          'A Windows tool downloaded from the Customer Portal (the 3CX CRM Template Generator) that builds a template for any CRM with a REST API, walking through authentication, contact lookup, search, creation, and optional call and chat journaling before the template is uploaded to 3CX.',
          'build a template that matches callers to customers using the REST API of a CRM that 3CX does not support out of the box',
          ['CRM connector', 'Screen pop', 'Click-to-call'],
          'Any CRM with a REST API — you describe the API calls, the wizard builds the TEMPLATE.',
          S.steps([('Test the API calls', 'Postman first'), ('Run the wizard', 'auth, lookup, journaling'), ('Upload the template', 'to 3CX')], title='CRM template', tones=['plain', 'blue', 'green']),
          caption='The CRM Integration Wizard builds a template for any CRM that exposes a REST API.')

    b.add('2.1', 'CRM authentication methods',
          'The authentication choices in the wizard: None, Basic (with a username and password or an API key), or OAuth2, which also needs the authorization endpoint URL, the token endpoint URL, and optionally a scope and additional query string.',
          'choose the right sign-in setting for a CRM that requires an authorization endpoint and a token endpoint',
          ['Extension authentication credentials', 'Single sign-on (SSO) integration', 'Two-factor authentication (2FA)'],
          'OAuth2 adds two ENDPOINT URLs; Basic uses a login or an API key; None needs nothing.',
          S.table(['Method', 'What you supply'], [('None', 'nothing'), ('Basic', 'username and password, or API key'), ('OAuth2', 'authorization and token URLs')], title='CRM authentication', col_widths=[0.25, 0.75]),
          caption='The wizard supports None, Basic, and OAuth2 authentication for the CRM\'s API.')

    b.add('2.1', 'CRM contact lookup',
          'A GET call to the CRM that 3CX makes with the caller\'s number (for calls, SMS, and WhatsApp) or email address (for Live Chat) to identify the customer; a match is added to the 3CX contacts, shows the caller name, and links to the CRM record.',
          'have the phone system match an incoming caller\'s number to a customer record in the CRM',
          ['Screen pop', 'Click-to-call', 'Call activity logging'],
          'By NUMBER for calls, SMS, and WhatsApp — by EMAIL for Live Chat.',
          S.compare(('Lookup by number', ['Phone calls', 'SMS and WhatsApp', 'Uses the caller\'s number']), ('Lookup by email', ['Live Chat', 'Uses the visitor\'s email', 'Matches the contact']), title='Contact lookup'),
          caption='3CX looks up CRM contacts by number for calls and messages and by email for Live Chat.')

    b.add('2.1', 'Testing CRM API calls first',
          'Trying the CRM\'s lookup, search, creation, and journaling web calls in a tool such as Postman before building the template, because Postman has better debugging tools than 3CX and shows each response in real time.',
          'verify what the CRM returns for a lookup before building the integration template',
          ['Packet capture', 'SIP trace / activity log', 'Testing and debugging a call flow'],
          'Test in POSTMAN first — it shows more detail than 3CX will.',
          S.steps([('Collect the API URLs', 'lookup, search, journal'), ('Try them in Postman', 'see each response'), ('Build the template', 'in the wizard')], title='Before the wizard', tones=['plain', 'blue', 'green']),
          caption='Test the CRM\'s API calls in Postman before building the 3CX template.')

    # ------------------------------------------------------------------------------------------ 2.2
    b.add('2.2', 'Microsoft 365 consent and licensing',
          'The integration needs a Microsoft 365 plan that includes Exchange (for example Business Basic, Standard, or Premium, or F3, E3, or E5), and an Azure administrator must connect through the 3CX wizard and consent on behalf of the organization.',
          'authorize the phone system to synchronize with the company\'s Microsoft 365 tenant using an administrator account',
          ['Single sign-on (SSO) integration', 'Extension authentication credentials', 'Role-based admin access'],
          'An Azure ADMIN must consent on behalf of the organization — and the plan must include Exchange.',
          S.steps([('Admin > Integrations', 'open the M365 wizard'), ('Sign in as Azure admin', 'tick the consent box'), ('3CX app is created', 'then configure sync')], title='M365 consent', tones=['plain', 'blue', 'green']),
          caption='A Microsoft 365 integration needs an Exchange plan and Azure administrator consent.')

    b.add('2.2', 'Microsoft 365 user synchronization',
          'A one-way nightly sync from Microsoft 365 that creates 3CX users for up to 650 people; deleting a user only in 3CX makes them reappear next day, and deleting or disabling one in Microsoft 365 leaves the 3CX user to be removed manually.',
          'create 3CX users automatically from the company\'s Microsoft 365 directory',
          ['Contact sync', 'Bulk extension import', 'Single sign-on (SSO) integration'],
          'ONE-WAY and NIGHTLY — deleting in M365 does NOT remove the 3CX user.',
          S.table(['Event', 'Result'], [('Delete user in 3CX only', 'returns the next day'), ('Delete or disable in M365', 'stays in 3CX'), ('Number of users', 'up to 650'), ('Sync direction', 'M365 to 3CX only')], title='User sync rules', col_widths=[0.55, 0.45]),
          caption='Microsoft 365 user sync is one-way, nightly, and limited to 650 users.')

    b.add('2.2', 'Microsoft 365 department sync',
          'An option to synchronize only users from selected Microsoft 365 departments; new 3CX departments are created from the M365 group names and existing 3CX departments are never overwritten, so a clash creates a new one with a number appended.',
          'limit the user sync to the sales and support groups in Microsoft 365',
          ['Group membership management', 'Microsoft 365 user synchronization', 'Shared mailbox phonebook sync'],
          'Departments are CREATED from M365 group names — existing 3CX departments are not reused.',
          S.flow_split(('M365 department name', 'compared with 3CX'), [('Name is new', 'department created'), ('Name already exists', 'new one, number appended')], title='Department sync', tones=['green', 'amber']),
          caption='Selected Microsoft 365 departments create new 3CX departments; existing ones are not overwritten.')

    b.add('2.2', 'Shared mailbox phonebook sync',
          'A one-way sync that copies the contacts of selected shared mailboxes from Microsoft 365 into the 3CX company phonebook, covering everything in the default (well-known) folders; personal contacts sync one way into each user\'s personal phonebook.',
          'make the contacts of a shared mailbox searchable in the company phonebook',
          ['CRM contact lookup', 'Bulk extension import', 'Calendar-based presence'],
          'SHARED mailboxes feed the COMPANY phonebook; personal contacts feed the personal one.',
          S.table(['Microsoft 365 source', '3CX destination'], [('Shared mailbox contacts', 'Company phonebook'), ('User personal contacts', 'Personal phonebook'), ('Direction', 'one way, M365 to 3CX')], title='Phonebook sync', col_widths=[0.5, 0.5]),
          caption='Shared mailbox contacts sync one way into the company phonebook.')

    b.add('2.2', 'Teams presence loop',
          'A conflict in two-way presence sync when the status mappings disagree, for example 3CX Away becoming Teams Away while Teams Away becomes 3CX Do Not Disturb, so each side keeps overriding the other.',
          'explain why a user\'s status keeps flipping between Away and Do Not Disturb after two-way presence sync was enabled',
          ['Calendar-based presence', 'Switch Status', 'Presence status'],
          'Map BOTH directions to the SAME status or the two systems overwrite each other.',
          S.compare(('Mismatched mapping', ['3CX Away becomes Teams Away', 'Teams Away becomes 3CX DND', 'Loop: statuses flip']), ('Matching mapping', ['3CX Away becomes Teams Away', 'Teams Away becomes 3CX Away', 'Stable statuses']), title='Avoiding loops'),
          caption='Mismatched two-way presence mappings can make 3CX and Teams overwrite each other.')

    b.add('2.2', 'Sending email through Microsoft 365',
          'An option that makes 3CX send its notification emails through the company\'s Microsoft 365 account; the originating address configured under System > Email must exist in the tenant and be licensed for sending mail.',
          'send voicemail and welcome emails through the company\'s own Microsoft 365 mailbox',
          ['Email-to-voicemail', 'Welcome email', 'Single sign-on (SSO) integration'],
          'The sending ADDRESS must exist in M365 and hold a license that can send mail.',
          S.steps([('Choose the M365 option', 'in the integration wizard'), ('Set the sender address', 'Admin > System > Email'), ('3CX emails via M365', 'address must be licensed')], title='M365 email', tones=['plain', 'blue', 'green']),
          caption='3CX can send its emails through Microsoft 365 if the sender address exists and is licensed.')

    # ------------------------------------------------------------------------------------------ 2.3
    b.add('2.3', 'Live Chat fallback calling',
          'A Live Chat option that rings a queue or ring group when no agent is handling the chat, which works only if the chat\'s destination is itself a queue or ring group; availability follows the destination department\'s office hours.',
          'make a website chat bubble ring a queue when no agent picks up the chat',
          ['Website live chat widget', 'SMS/WhatsApp channel integration', 'Omnichannel agent view'],
          'The destination must be a QUEUE or RING GROUP — an extension cannot ring a fallback.',
          S.flow_split(('Visitor starts a chat', 'agent available?'), [('Agent handles it', 'chat continues'), ('No agent', 'queue or ring group rings')], title='Chat fallback', tones=['green', 'amber']),
          caption='Live Chat can ring a queue or ring group when no agent handles the chat.')

    b.add('2.3', 'Live Chat website embedding',
          'Adding the chat bubble to a site by installing the 3CX Free Live Chat, Calls & WhatsApp plugin on WordPress (one chat URL per site), or by pasting the generated HTML code before the closing body tag on other sites.',
          'add the chat bubble to a company site that is not built on WordPress',
          ['3CX Talk link', 'Website live chat widget', 'Custom API/webhook integration'],
          'WordPress: plugin with ONE URL per site — other sites: paste the HTML before </body>.',
          S.compare(('WordPress site', ['Install the 3CX plugin', 'Paste the chat URL', 'One chat URL per site']), ('Other site', ['Copy the HTML code', 'Paste before </body>', 'Repeat on each page']), title='Embedding Live Chat'),
          caption='Live Chat is embedded with a WordPress plugin or by pasting HTML into other sites.')

    b.add('2.3', 'Video conferencing ports',
          'For web meetings the PBX must allow inbound TCP 443 so participants can connect and outbound TCP 443 to 3CX\'s cloud, and users need outbound TCP 443 plus UDP 48000 to 65535 to exchange audio and video.',
          'open the right ports so participants can join video conferences hosted by the phone system',
          ['Inbound firewall ports for 3CX', 'Push notification connectivity', 'Outbound services 3CX contacts'],
          'TCP 443 for the web side, UDP 48000 to 65535 for the AUDIO and VIDEO.',
          S.table(['Who', 'Ports needed'], [('PBX, inbound', 'TCP 443'), ('PBX, outbound', 'TCP 443 to 3CX cloud'), ('Users, outbound', 'TCP 443; UDP 48000-65535')], title='Meeting ports', col_widths=[0.4, 0.6]),
          caption='Web meetings need TCP 443 both ways at the PBX and UDP 48000 to 65535 for media.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('CRM integration with the wizard', ['2.1'],
              'Any CRM with a REST API can be integrated: test the lookup, search, creation, and journaling calls in Postman, then download the CRM Integration Wizard (the 3CX CRM Template Generator) from the Customer Portal on a Windows computer. Choose the authentication method (None, Basic with a username and password or API key, or OAuth2 with authorization and token endpoint URLs), configure the contact lookup by number (calls, SMS, WhatsApp) and by email (Live Chat), optionally contact search, creation, and call and chat journaling, map the JSON response fields, test, and upload the template to 3CX.')
    b.section('Microsoft 365 integration', ['2.2'],
              'The integration needs an Exchange-capable Microsoft 365 plan and an Azure administrator who consents on behalf of the organization. User synchronization is one way (M365 to 3CX), runs nightly, supports up to 650 users, optionally limits by selected departments (new 3CX departments are created from M365 group names), and can set a starting extension number; deleting a user only in 3CX brings them back and removing one from M365 does not remove the 3CX user. Contacts from shared mailboxes sync into the company phonebook and personal contacts into each personal phonebook.\n\n'
              'Teams presence can sync from 3CX to Teams, from Teams to 3CX, or both, for synced users with a Teams-enabled license; make both mappings use the same status or the two systems can loop. 3CX can also send its emails through the Microsoft 365 account if the sender address exists and is licensed.')
    b.section('Live Chat and web meetings', ['2.3'],
              'Add Live Chat under Voice & Chat > Add Messaging, choose an extension or queue as the destination (availability follows its department\'s office hours), optionally let visitors call over WebRTC, and show a GDPR notice. To ring a queue or ring group when no agent handles the chat, the destination itself must be a queue or ring group. Embed the bubble with the WordPress plugin (one chat URL per site) or by pasting the HTML before the closing body tag.\n\n'
              'Web meetings need inbound TCP 443 to the PBX, outbound TCP 443 to the 3CX cloud, and, for users, outbound TCP 443 and UDP 48000 to 65535 for audio and video.')
