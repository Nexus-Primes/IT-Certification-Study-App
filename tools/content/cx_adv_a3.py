"""3CX Advanced, domain a3 (Security, Backup & Maintenance): global IP blacklist, Secure SIP and SRTP, backup options, failover, and access control.

Checked against the 3CX administrator manual (advanced system features, Secure SIP, backup and storage, failover, and IP allow/deny pages, 2026).
"""
import svg as S

DOMAIN = 'a3'


def build(b):
    b.topics['3.1'] = ['3CX Tunnel', 'SBC concept', 'STUN', 'Blacklist protection', 'Global IP blacklist', 'Mobile app tunnel encryption']
    b.topics['3.2'] = ['TLS', 'SRTP', 'SRTP mode', "Let's Encrypt", 'Certificate renewal', 'Custom FQDN certificates', 'Trunk TLS', 'TLS for IP phones']
    b.topics['3.3'] = ['Scheduled backup', 'Backup options', 'Manual restore', 'Restore impact', 'Migration', 'Maintenance updates', 'Active-passive failover']
    b.topics['3.4'] = ['Role-based admin access', 'IP restriction', 'IP whitelist', 'Allowed country codes', 'Audit logging']

    # ------------------------------------------------------------------------------------------ 3.1
    b.add('3.1', 'Automatic global IP blacklist',
          'A 3CX service, joined in the Anti-Hacking settings, that distributes attacker IP addresses reported by participating systems to every participating PBX so they are blocked before they target yours.',
          'benefit from attacker addresses that other 3CX systems have already reported',
          ['Blacklist / failed authentication protection', 'IP-based access restriction', 'Caller ID blacklist'],
          'SHARED across participating PBXs — local blacklisting only reacts to YOUR own failed attempts.',
          S.steps([('A PBX sees an attacker', 'IP is reported'), ('3CX shares the list', 'with participating PBXs'), ('Your PBX blocks it', 'before any attack')], title='Global blacklist', tones=['plain', 'blue', 'green']),
          caption='The automatic global IP blacklist shares known attacker addresses among participating PBXs.')

    b.add('3.1', 'Mobile app tunnel encryption',
          'The 3CX mobile apps for Android and iOS encrypt their traffic through the tunnel by default, so TLS and SRTP cannot be configured for them and do not need to be.',
          'explain why TLS and SRTP settings are neither possible nor needed for the smartphone apps',
          ['TLS (Transport Layer Security)', 'SRTP (Secure RTP)', "Let's Encrypt certificate integration"],
          'The TUNNEL already encrypts the apps — no TLS or SRTP settings exist for them.',
          S.compare(('Smartphone apps', ['Use the tunnel', 'Encrypted by default', 'No TLS or SRTP settings']), ('IP phones', ['Use SIP and RTP', 'Encryption configured', 'TLS and SRTP options']), title='Who needs TLS and SRTP'),
          caption='The mobile apps are encrypted by the tunnel, so TLS and SRTP are not configurable for them.')

    # ------------------------------------------------------------------------------------------ 3.2
    b.add('3.2', 'Secure SIP with a custom FQDN',
          'Enabling TLS on a PBX that uses the company\'s own domain name: it needs a static public IP, a registered domain with DNS control, and a certificate from an authority that phones already trust, which is pasted into Advanced > Secure SIP before the services are restarted.',
          'enable encrypted SIP signaling on a PBX that uses the company\'s own domain name',
          ['TLS (Transport Layer Security)', "Let's Encrypt certificate integration", 'SRTP (Secure RTP)'],
          'Certificate, key, and CA bundle go in Advanced > Secure SIP — then RESTART services.',
          S.steps([('Get the certificate', 'crt, key, CA bundle'), ('Paste into Secure SIP', 'Admin > Advanced'), ('Restart PBX services', 'then it accepts TLS')], title='Custom FQDN TLS', tones=['plain', 'blue', 'green']),
          caption='Secure SIP on a custom FQDN needs a trusted certificate pasted into the PBX and a services restart.')

    b.add('3.2', 'SRTP mode (Enabled or Enforced)',
          'A per-user setting under Options > SRTP Mode: Enabled allows both secure and non-secure RTP, while Enforced accepts only secure RTP connections, so the phone must also support and be set for SRTP.',
          'refuse any unencrypted audio on a sensitive extension',
          ['TLS (Transport Layer Security)', 'Encrypted management console access', 'Call recording protection'],
          'ENABLED allows both; ENFORCED allows only secure RTP.',
          S.compare(('Enabled', ['Secure RTP allowed', 'Non-secure RTP allowed', 'Flexible']), ('Enforced', ['Secure RTP only', 'Non-secure refused', 'Strictest']), title='SRTP mode'),
          caption='SRTP mode Enabled allows both kinds of RTP while Enforced allows only secure RTP.')

    b.add('3.2', 'TLS for IP phones',
          '3CX does not officially support IP phones that use TLS; provisioning them with TLS requires a custom template, only locally provisioned phones can use it, and the phone vendor\'s instructions must be followed.',
          'know the support position before provisioning desk phones to register over an encrypted SIP channel',
          ['SRTP mode (Enabled or Enforced)', "Let's Encrypt certificate integration", '3CX Tunnel security model'],
          'NOT officially supported — it needs a custom template and works only for LOCAL phones.',
          S.facts([('Official support', 'none for phone TLS'), ('Requirement', 'custom template'), ('Which phones', 'locally provisioned only'), ('Instructions', 'from the phone vendor')], title='TLS on IP phones'),
          caption='TLS on IP phones is not officially supported and needs a custom template.')

    b.add('3.2', 'Trunk transport protocol (TLS)',
          'For supported VoIP providers, TLS is selected as the transport protocol in the SIP trunk\'s Options, which encrypts the signaling between the PBX and the provider.',
          'encrypt the SIP signaling between the phone system and a supported VoIP provider',
          ['SRTP mode (Enabled or Enforced)', 'Encrypted management console access', "Let's Encrypt certificate integration"],
          'Set on the TRUNK itself: Options > Transport Protocol > TLS.',
          S.steps([('Open the SIP trunk', 'Admin > Voice & Chat'), ('Go to Options', 'Transport Protocol'), ('Select TLS', 'signaling is encrypted')], title='Trunk TLS', tones=['plain', 'blue', 'green']),
          caption='A supported trunk\'s signaling is encrypted by choosing TLS as its transport protocol.')

    # ------------------------------------------------------------------------------------------ 3.3
    b.add('3.3', 'Backup options and notifications',
          'When running Backup Now you name the backup, choose whether to include local recordings, and may set an encryption password; the System Admin and System Owner are emailed when it completes or fails, and a local drive should be only temporary storage.',
          'protect a backup that includes call recordings with a password and be told if it fails',
          ['Scheduled backup', 'System migration', 'Call recording'],
          'Recordings are OPTIONAL, a PASSWORD is optional — and failures are EMAILED.',
          S.table(['Backup Now option', 'Effect'], [('Name', 'identifies the backup'), ('Include recordings', 'optional'), ('Encryption password', 'optional'), ('Email notice', 'Admin and Owner')], title='Backup options', col_widths=[0.5, 0.5]),
          caption='Backup Now can include recordings, encrypt the file, and emails the result.')

    b.add('3.3', 'Restore service impact',
          'Restoring a backup restarts all 3CX services, so a restore or a scheduled backup run should be placed in off-peak hours.',
          'choose the time to restore a backup so that active calls are not disrupted',
          ['Maintenance updates', 'System migration', 'Scheduled backup'],
          'Services STOP during a restore — schedule it off-peak.',
          S.steps([('Pick the backup', 'then click Restore'), ('All services restart', 'calls are interrupted'), ('Run off-peak', 'to limit disruption')], title='Restoring', tones=['plain', 'amber', 'green']),
          caption='A restore restarts all 3CX services, so it should be done off-peak.')

    b.add('3.3', 'Active-passive failover',
          'An AI edition feature (not supported on Hosted by 3CX) that keeps a standby replica: two PBXs with identical settings and their own public IPs, where the passive server monitors the active one and takes over if it fails, with configuration replication up to 24 hours apart.',
          'keep a standby server ready to take over when the main phone system stops responding',
          ['Multiple trunk redundancy', 'Scheduled backup', 'System migration'],
          'ACTIVE handles calls, PASSIVE monitors it — AI edition only, never Hosted by 3CX.',
          S.compare(('Active server', ['Processes calls', 'Handles presence', 'Backs up on a schedule']), ('Passive server', ['Monitors the active', 'Restores the backups', 'Takes over on failure']), title='Failover roles'),
          caption='In active-passive failover the passive PBX monitors the active one and takes over if it fails.')

    b.add('3.3', 'Failover monitoring and scripts',
          'On the passive server you choose whether one or all tests must fail, which services to watch (SIP, web, tunnel), the heartbeat interval (default 30 seconds), and scripts that update DNS to the new active server; a scheduled restore runs minutes after each active backup, and the old server must be shut down.',
          'make users reach the standby server after a failure without leaving two live servers',
          ['Restore service impact', 'Backup options and notifications', 'Fallback/failover routing'],
          'Scripts move the FQDN to the new server — and the OLD one must be shut down.',
          S.steps([('Passive sees failure', 'heartbeat tests fail'), ('Scripts update DNS', 'FQDN to new server'), ('Old server shut down', 'avoids a conflict')], title='Failover sequence', tones=['amber', 'blue', 'green']),
          caption='Failover scripts redirect the FQDN to the new active server and the old one must be shut down.')

    # ------------------------------------------------------------------------------------------ 3.4
    b.add('3.4', 'IP whitelist entry',
          'An Allow entry in Admin > Advanced > IP Blacklist for a single trusted address or a range, such as a remote office; traffic from it is accepted without being checked by the anti-hacking features.',
          'make sure a trusted remote office\'s traffic is never blocked by the anti-hacking checks',
          ['Blacklist / failed authentication protection', 'IP-based access restriction', 'Automatic global IP blacklist'],
          'Action ALLOW in the IP Blacklist list — those addresses SKIP the anti-hacking checks.',
          S.steps([('Open IP Blacklist', 'Admin > Advanced'), ('Add address or range', 'single IP or subnet'), ('Set Action to Allow', 'checks are skipped')], title='Whitelisting', tones=['plain', 'blue', 'green']),
          caption='An Allow entry exempts a trusted address from the anti-hacking checks.')

    b.add('3.4', 'Allowed country codes',
          'A filter that checks numbers dialed in international format (a + or the 00 prefix defined under E164) against the blocked countries; anything else is treated as a local number, so the same restriction must also be set at the VoIP provider.',
          'stop staff or a compromised extension from dialing destinations in countries the company never calls',
          ['Outbound rule conditions', 'Blacklist / failed authentication protection', 'IP-based access restriction'],
          'Only catches numbers in INTERNATIONAL format — the PROVIDER must block too.',
          S.flow_split(('Number dialed', 'is it + or 00 format?'), [('International format', 'country code checked'), ('Anything else', 'treated as local')], title='Country filter', tones=['blue', 'plain']),
          caption='Allowed country codes checks internationally formatted numbers only, so the provider must block too.')

    # ------------------------------------------------------------------------------------------ guide
    b.section('Blacklists, whitelists, and country filters', ['3.1', '3.4'],
              'Anti-hacking blocks an IP automatically after more than 10 wrong passwords or more than 5 incorrect phone registrations, so a device that can suddenly no longer authenticate may be on the blacklist. Joining the automatic global IP blacklist shares known attacker addresses across participating PBXs, and an Allow entry in the IP Blacklist exempts a trusted address from the anti-hacking checks. Console Restrictions can limit the admin console to specific public IPs or a local subnet.\n\n'
              'Allowed Country Codes checks only numbers dialed in international format (+ or 00), treats everything else as local, and does not replace blocking at the VoIP provider.')
    b.section('Encryption: TLS, SRTP, and certificates', ['3.2', '3.1'],
              'For 3CX-provided FQDNs a Let\'s Encrypt certificate is pre-configured and renews automatically; a custom FQDN needs a static public IP, a registered domain, and a certificate from an authority that phones trust, pasted into Advanced > Secure SIP followed by a services restart (a self-signed certificate must be imported on every endpoint). Choose TLS as the transport protocol on a supported trunk, and set SRTP Mode per user to Enabled (both) or Enforced (secure only).\n\n'
              'The mobile apps are encrypted through the tunnel by default, and TLS on IP phones is not officially supported (it needs a custom template and works only for local phones).')
    b.section('Backup, restore, and failover', ['3.3'],
              'Store backups off the PBX (FTP/FTPS/SFTP, SMB, Google Storage, SharePoint, or S3) rather than on a local drive, which is only temporary. Backup Now lets you name the backup, include recordings, and encrypt it with a password, and scheduled backups run hourly, daily, or weekly with a rotation count. Restoring restarts all 3CX services, so do it off-peak.\n\n'
              'Active-passive failover needs the AI edition (and is not supported on Hosted by 3CX): two PBXs with identical settings and their own public IPs, a passive server that monitors SIP, web, and tunnel services on a heartbeat, a scheduled restore a few minutes after each active backup, and scripts that update DNS to the new active server while the old one is shut down.')
