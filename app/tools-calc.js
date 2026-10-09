// ---------- Tools: calculators ----------
// Subnet/CIDR, a VLSM planner, and a 3CX sizing helper (voice bandwidth, ports, hardware tier, recording
// storage). The maths is plain exported functions so it can be checked on its own; the page below only
// reads inputs and draws results. IPv4 only. Sizing results are estimates from standard VoIP formulas
// and 3CX's published baselines (hardware page last updated 23 April 2026), not a guarantee.

import { debounce, hashParams } from './tools-core.js?v=1';

// ---------------- IPv4 maths ----------------
export function parseIPv4(text) {
  const m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*$/.exec(String(text || ''));
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (parts.some((n, i) => n > 255 || (m[i + 1].length > 1 && m[i + 1].startsWith('0')))) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function ipToString(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

export function maskFromPrefix(prefix) { return prefix <= 0 ? 0 : ((0xFFFFFFFF << (32 - prefix)) >>> 0); }

function prefixFromMask(maskInt) {
  const bits = maskInt.toString(2).padStart(32, '0');
  if (!/^1*0*$/.test(bits)) return null;
  return bits.indexOf('0') === -1 ? 32 : bits.indexOf('0');
}

// Accepts "10.0.0.5/24", "10.0.0.5 /24", "10.0.0.5 255.255.255.0", or "10.0.0.5/255.255.255.0".
export function parseCidr(text) {
  const m = /^\s*(\d{1,3}(?:\.\d{1,3}){3})\s*(?:\/|\s)\s*(\d{1,2}|\d{1,3}(?:\.\d{1,3}){3})\s*$/.exec(String(text || ''));
  if (!m) return null;
  const ip = parseIPv4(m[1]);
  if (ip == null) return null;
  let prefix;
  if (m[2].includes('.')) {
    const maskInt = parseIPv4(m[2]);
    if (maskInt == null) return null;
    prefix = prefixFromMask(maskInt);
    if (prefix == null) return null;
  } else prefix = Number(m[2]);
  if (!(prefix >= 0 && prefix <= 32)) return null;
  return { ip, prefix };
}

function kindOf(ip) {
  const inside = (net, prefix) => ((ip & maskFromPrefix(prefix)) >>> 0) === net;
  if (inside(parseIPv4('10.0.0.0'), 8) || inside(parseIPv4('172.16.0.0'), 12) || inside(parseIPv4('192.168.0.0'), 16)) return 'Private (RFC 1918)';
  if (inside(parseIPv4('127.0.0.0'), 8)) return 'Loopback';
  if (inside(parseIPv4('169.254.0.0'), 16)) return 'Link-local (APIPA)';
  if (inside(parseIPv4('100.64.0.0'), 10)) return 'Shared address space (carrier-grade NAT)';
  if (inside(parseIPv4('224.0.0.0'), 4)) return 'Multicast';
  if (inside(parseIPv4('240.0.0.0'), 4)) return 'Reserved';
  if (inside(parseIPv4('0.0.0.0'), 8)) return '"This network"';
  if (inside(parseIPv4('192.0.2.0'), 24) || inside(parseIPv4('198.51.100.0'), 24) || inside(parseIPv4('203.0.113.0'), 24)) return 'Documentation';
  return 'Public';
}

export function subnetInfo(ip, prefix) {
  const mask = maskFromPrefix(prefix);
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - prefix);
  let first, last, hosts;
  if (prefix === 32) { first = last = network; hosts = 1; }
  else if (prefix === 31) { first = network; last = broadcast; hosts = 2; }
  else { first = network + 1; last = broadcast - 1; hosts = total - 2; }
  const firstOctet = ip >>> 24;
  return {
    ip: ipToString(ip), prefix, mask: ipToString(mask), wildcard: ipToString((~mask) >>> 0),
    network: ipToString(network), broadcast: prefix >= 31 ? '(none)' : ipToString(broadcast),
    first: ipToString(first), last: ipToString(last), total, hosts, kind: kindOf(ip),
    legacyClass: firstOctet < 128 ? 'A' : firstOctet < 192 ? 'B' : firstOctet < 224 ? 'C' : firstOctet < 240 ? 'D (multicast)' : 'E (reserved)',
    networkInt: network, broadcastInt: broadcast
  };
}

export function binaryDotted(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].map(o => o.toString(2).padStart(8, '0')).join('.'); }

export function inSubnet(ip, networkInt, prefix) { return ((ip & maskFromPrefix(prefix)) >>> 0) === networkInt; }

export function overlaps(aNet, aPrefix, bNet, bPrefix) {
  const p = Math.min(aPrefix, bPrefix);
  return ((aNet & maskFromPrefix(p)) >>> 0) === ((bNet & maskFromPrefix(p)) >>> 0);
}

export function splitSubnet(networkInt, prefix, newPrefix, limit = 256) {
  if (!(newPrefix > prefix && newPrefix <= 32)) return { count: 0, rows: [] };
  const count = 2 ** (newPrefix - prefix);
  const size = 2 ** (32 - newPrefix);
  const rows = [];
  for (let i = 0; i < Math.min(count, limit); i++) rows.push(subnetInfo(networkInt + i * size, newPrefix));
  return { count, rows };
}

// Allocates largest-first, each block aligned to its own size. Needs hosts + 2 addresses (network and
// broadcast), with /30 as the smallest block; use a /31 or /32 by hand for point-to-point links.
export function vlsmPlan(parentNetworkInt, parentPrefix, requests) {
  const parentSize = 2 ** (32 - parentPrefix);
  const start = parentNetworkInt, end = parentNetworkInt + parentSize;
  const ordered = requests.map((r, index) => ({ ...r, index })).filter(r => r.hosts > 0).sort((a, b) => b.hosts - a.hosts || a.index - b.index);
  let cursor = start;
  const allocations = [], errors = [];
  ordered.forEach(req => {
    const bits = Math.max(2, Math.ceil(Math.log2(req.hosts + 2)));
    const prefix = 32 - bits, size = 2 ** bits;
    cursor = Math.ceil(cursor / size) * size;
    if (cursor + size > end) { errors.push(`${req.name || 'Unnamed'} (${req.hosts} hosts) does not fit in the remaining space.`); return; }
    allocations.push({ name: req.name || 'Unnamed', needed: req.hosts, ...subnetInfo(cursor, prefix) });
    cursor += size;
  });
  return { allocations, errors, freeAddresses: Math.max(0, end - cursor), parentSize };
}

// ---------------- 3CX sizing ----------------
export const CODECS = [
  { id: 'g711', name: 'G.711 (PCMU or PCMA)', kbps: 64 },
  { id: 'g722', name: 'G.722', kbps: 64 },
  { id: 'g729', name: 'G.729', kbps: 8 },
  { id: 'opus', name: 'Opus (about 20 kbps)', kbps: 20 }
];

// One direction of one call. RTP over UDP over IPv4 adds 40 bytes a packet; SRTP adds a 10-byte
// authentication tag; Ethernet framing adds 18 more when you size a LAN or a link at layer 2.
export function bandwidthPerCall({ kbps, ptimeMs = 20, srtp = false, l2Bytes = 18 }) {
  const payload = (kbps * 1000 / 8) * (ptimeMs / 1000);
  const pps = 1000 / ptimeMs;
  const header = 40 + (srtp ? 10 : 0);
  return { payloadBytes: payload, packetsPerSecond: pps, l3Kbps: ((payload + header) * 8 * pps) / 1000, l2Kbps: ((payload + header + l2Bytes) * 8 * pps) / 1000 };
}

export const HARDWARE = [
  { name: 'Small', upTo: 10, debian: { vcpu: 2, ram: 4 }, windows: { vcpu: 2, ram: 4 }, storage: 80 },
  { name: 'Medium', upTo: 50, debian: { vcpu: 4, ram: 4 }, windows: { vcpu: 6, ram: 6 }, storage: 160 },
  { name: 'Large', upTo: 250, debian: { vcpu: 6, ram: 8 }, windows: { vcpu: 8, ram: 10 }, storage: 320 },
  { name: 'Enterprise', upTo: 1000, debian: { vcpu: 8, ram: 16 }, windows: { vcpu: 10, ram: 18 }, storage: 640 }
];

export function hardwareTier(extensions) {
  const tier = HARDWARE.find(h => extensions <= h.upTo);
  return tier || { name: 'Enterprise+', upTo: Infinity, debian: { vcpu: 8, ram: 32 }, windows: { vcpu: 10, ram: 34 }, storage: 640, plus: true };
}

export function sizingEstimate({ extensions = 0, calls = 0, codecId = 'g711', ptimeMs = 20, srtp = false, wanPercent = 100, headroomPercent = 10, recordMinutesPerDay = 0, recordDays = 30 }) {
  const codec = CODECS.find(c => c.id === codecId) || CODECS[0];
  const per = bandwidthPerCall({ kbps: codec.kbps, ptimeMs, srtp });
  const wanCalls = calls * (wanPercent / 100);
  const wanKbps = wanCalls * per.l2Kbps * (1 + headroomPercent / 100);
  const lanKbps = calls * per.l2Kbps;
  const recordingGb = (recordMinutesPerDay * recordDays) / 1024;   // 3CX: about 1 MB per recorded minute
  return {
    codec, perCall: per, wanKbps, lanKbps, rtpPortsNeeded: calls * 2, rtpPortsAvailable: 2000, maxCallsByPorts: 1000,
    tier: hardwareTier(extensions), recordingGb, lanNote: extensions > 1000 ? '10 Gb LAN required above 1,000 extensions' : 'At least a 1 Gb LAN'
  };
}

export const PORTS = [
  ['Inbound', 'UDP 5060; TCP 5060-5061', 'SIP signaling to trunks and phones'],
  ['Inbound', 'UDP 9000-10999', 'Call audio (RTP); about two ports per simultaneous call'],
  ['Inbound', 'TCP and UDP 5090', '3CX tunnel for remote apps, phones, and bridges'],
  ['Inbound', 'TCP 443 or 5001', 'HTTPS: Web Client, provisioning, presence'],
  ['Keep closed to the WAN', 'TCP 5000', 'HTTP management port'],
  ['Outbound', 'TCP 443', '3CX cloud services: activation, RPS, updates, SMTP relay, meetings'],
  ['Outbound', 'TCP 443; iOS also 2197 and 5223', 'Google and Apple push notifications for the apps'],
  ['Outbound', 'UDP 3478', 'STUN, used by the Firewall Checker'],
  ['Video meetings', 'TCP 443 inbound; UDP 48000-65535 outbound for users', 'Audio and video for 3CX Meet participants']
];

// ---------------- the page ----------------
export function createCalculators(ctx) {
  const { main, escapeHtml: esc, icon, getTools, saveTools } = ctx;
  const state = () => getTools().calc;
  const fmt = (n, digits = 1) => Number(n).toLocaleString(undefined, { maximumFractionDigits: digits });
  const TABS = [['subnet', 'Subnet / CIDR'], ['vlsm', 'VLSM planner'], ['sizing', '3CX sizing']];

  function row(label, value, mono = true) { return `<div class="calc-row"><span>${esc(label)}</span><strong${mono ? ' class="mono"' : ''}>${esc(value)}</strong></div>`; }

  function binaryRow(label, n, prefix) {
    const bits = binaryDotted(n).split('');
    // The dots do not count as bits: colour the first `prefix` bits as the network part.
    let seen = 0, html = '';
    bits.forEach(ch => { if (ch === '.') { html += '.'; return; } html += `<i class="${seen < prefix ? 'net' : 'host'}">${ch}</i>`; seen++; });
    return `<div class="calc-row"><span>${esc(label)}</span><strong class="mono bits">${html}</strong></div>`;
  }

  // ----- subnet -----
  function subnetResult(input, splitTo, probe) {
    const parsed = parseCidr(input);
    if (!parsed) return `<div class="notice">${icon('info')}<span>Enter an address with a prefix or mask, such as <code>192.168.10.37/26</code> or <code>10.1.0.9 255.255.255.0</code>. IPv4 only.</span></div>`;
    const info = subnetInfo(parsed.ip, parsed.prefix);
    const ipInt = parsed.ip;
    const options = []; for (let p = parsed.prefix + 1; p <= Math.min(32, parsed.prefix + 8); p++) options.push(p);
    const split = splitTo && splitTo > parsed.prefix ? splitSubnet(info.networkInt, parsed.prefix, splitTo, 256) : null;
    const probeInt = probe ? parseIPv4(probe) : null;
    return `<div class="calc-grid"><div class="calc-card">
        ${row('Network', `${info.network}/${info.prefix}`)}${row('Subnet mask', info.mask)}${row('Wildcard mask', info.wildcard)}
        ${row('Broadcast', info.broadcast)}${row('First usable', info.first)}${row('Last usable', info.last)}
        ${row('Usable hosts', fmt(info.hosts, 0))}${row('Total addresses', fmt(info.total, 0))}${row('Address type', info.kind, false)}${row('Legacy class', info.legacyClass, false)}
      </div><div class="calc-card">
        ${binaryRow('Address', ipInt, parsed.prefix)}${binaryRow('Mask', maskFromPrefix(parsed.prefix), parsed.prefix)}${binaryRow('Network', info.networkInt, parsed.prefix)}
        <p class="muted-line" style="margin-top:8px"><i class="net">Blue</i> bits are the network part, <i class="host">grey</i> bits are the host part.</p>
        <div class="field" style="margin-top:14px"><label for="calc-probe">Is this address in the subnet?</label><input id="calc-probe" data-calc="probe" type="text" value="${esc(probe || '')}" placeholder="192.168.10.200" autocomplete="off"></div>
        ${probe ? `<p class="calc-probe-result ${probeInt != null && inSubnet(probeInt, info.networkInt, parsed.prefix) ? 'is-yes' : 'is-no'}">${probeInt == null ? 'That is not a valid IPv4 address.' : inSubnet(probeInt, info.networkInt, parsed.prefix) ? 'Yes, it is in this subnet.' : 'No, it is outside this subnet.'}</p>` : ''}
      </div></div>
      <div class="field" style="max-width:260px;margin-top:18px"><label for="calc-split">Split into smaller subnets</label>
        <select id="calc-split" data-calc="split" data-enhanced="1"><option value="">Don't split</option>${options.map(p => `<option value="${p}"${splitTo === p ? ' selected' : ''}>/${p} — ${fmt(2 ** (p - parsed.prefix), 0)} subnet${p - parsed.prefix ? 's' : ''}</option>`).join('')}</select></div>
      ${split ? `<div class="table-wrap"><table class="net-table calc-table"><thead><tr><th>Subnet</th><th>First usable</th><th>Last usable</th><th>Broadcast</th><th>Hosts</th></tr></thead><tbody>${split.rows.map(r => `<tr><td class="mono">${r.network}/${r.prefix}</td><td class="mono">${r.first}</td><td class="mono">${r.last}</td><td class="mono">${r.broadcast}</td><td>${fmt(r.hosts, 0)}</td></tr>`).join('')}</tbody></table></div>
        ${split.count > split.rows.length ? `<p class="muted-line">Showing the first ${split.rows.length} of ${fmt(split.count, 0)} subnets.</p>` : ''}` : ''}`;
  }

  function renderSubnet() {
    const s = state();
    const input = s.subnetInput == null ? '192.168.10.37/26' : s.subnetInput;
    return `<section class="panel"><div class="panel-body" style="padding-top:22px"><div class="field" style="max-width:420px"><label for="calc-subnet">Address and prefix or mask</label>
      <input id="calc-subnet" data-calc="subnet" type="text" value="${esc(input)}" autocomplete="off" spellcheck="false"></div>
      <div id="calc-subnet-out" style="margin-top:18px">${subnetResult(input, s.subnetSplit, s.subnetProbe)}</div></div></section>`;
  }

  // ----- vlsm -----
  function vlsmResult(parentText, listText) {
    const parent = parseCidr(parentText);
    if (!parent) return `<div class="notice">${icon('info')}<span>Enter the parent network, such as <code>10.20.0.0/22</code>, then one requirement per line as <code>Name, hosts</code>.</span></div>`;
    const info = subnetInfo(parent.ip, parent.prefix);
    const requests = String(listText || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
      const m = /^(.*?)[\s,:;=]+(\d+)\s*(?:hosts?)?$/i.exec(line) || /^()(\d+)$/.exec(line);
      return m ? { name: m[1].trim(), hosts: Number(m[2]) } : { name: line, hosts: 0, bad: true };
    });
    const bad = requests.filter(r => r.bad);
    const plan = vlsmPlan(info.networkInt, parent.prefix, requests);
    return `${bad.length ? `<div class="notice">${icon('alert')}<span>Couldn't read: ${bad.map(r => esc(r.name)).join('; ')}. Use <code>Name, hosts</code>.</span></div>` : ''}
      ${plan.errors.length ? `<div class="notice" style="margin-top:10px">${icon('alert')}<span>${plan.errors.map(esc).join('<br>')}</span></div>` : ''}
      ${plan.allocations.length ? `<div class="table-wrap"><table class="net-table calc-table"><thead><tr><th>Name</th><th>Needed</th><th>Subnet</th><th>Mask</th><th>First usable</th><th>Last usable</th><th>Usable</th></tr></thead><tbody>${plan.allocations.map(a => `<tr><td>${esc(a.name)}</td><td>${fmt(a.needed, 0)}</td><td class="mono">${a.network}/${a.prefix}</td><td class="mono">${a.mask}</td><td class="mono">${a.first}</td><td class="mono">${a.last}</td><td>${fmt(a.hosts, 0)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      <p class="muted-line" style="margin-top:10px">${info.network}/${parent.prefix} holds ${fmt(info.total, 0)} addresses; ${fmt(plan.freeAddresses, 0)} are left after this plan. Blocks are allocated largest first and each needs the hosts plus two (network and broadcast); the smallest block is a /30.</p>`;
  }

  function renderVlsm() {
    const s = state();
    const parent = s.vlsmParent == null ? '10.20.0.0/22' : s.vlsmParent;
    const list = s.vlsmList == null ? 'Staff, 120\nVoice, 60\nServers, 25\nGuest, 50\nManagement, 12' : s.vlsmList;
    return `<section class="panel"><div class="panel-body" style="padding-top:22px"><div class="calc-two">
      <div class="field"><label for="calc-vparent">Parent network</label><input id="calc-vparent" data-calc="vparent" type="text" value="${esc(parent)}" autocomplete="off" spellcheck="false"></div>
      <div class="field"><label for="calc-vlist">Requirements (name, hosts)</label><textarea id="calc-vlist" data-calc="vlist" rows="6" spellcheck="false">${esc(list)}</textarea></div></div>
      <div id="calc-vlsm-out" style="margin-top:18px">${vlsmResult(parent, list)}</div></div></section>`;
  }

  // ----- sizing -----
  const SIZING_DEFAULTS = { extensions: 40, calls: 12, codecId: 'g711', ptimeMs: 20, srtp: false, wanPercent: 100, headroomPercent: 10, recordMinutesPerDay: 120, recordDays: 30, platform: 'debian' };
  const sizingInputs = () => ({ ...SIZING_DEFAULTS, ...(state().sizing || {}) });

  function sizingResult(v) {
    const r = sizingEstimate(v);
    const hw = r.tier[v.platform] || r.tier.debian;
    const mbps = kbps => (kbps / 1000 >= 10 ? fmt(kbps / 1000, 0) : fmt(kbps / 1000, 2));
    return `<div class="calc-grid"><div class="calc-card"><h3>Voice bandwidth</h3>
        ${row(`Per call, one direction (${r.codec.name}, ${v.ptimeMs} ms)`, `${fmt(r.perCall.l2Kbps)} kbps`, false)}
        ${row('...without Ethernet framing (IP level)', `${fmt(r.perCall.l3Kbps)} kbps`, false)}
        ${row('All calls on the LAN, each direction', `${mbps(r.lanKbps)} Mbps`, false)}
        ${row(`Internet link needed, each direction (${v.wanPercent}% of calls, +${v.headroomPercent}%)`, `${mbps(r.wanKbps)} Mbps`, false)}
        <p class="muted-line">Calls are full duplex, so an internet link needs this much upload <em>and</em> download. G.711 at 20 ms is about 87 kbps per direction with Ethernet framing.</p></div>
      <div class="calc-card"><h3>Server (3CX baseline for ${esc(String(v.extensions))} extensions)</h3>
        ${row('Size', r.tier.plus ? 'Enterprise+ (contact 3CX)' : `${r.tier.name} (up to ${r.tier.upTo})`, false)}
        ${row(`vCPU / memory on ${v.platform === 'debian' ? 'Debian' : 'Windows'}`, `${hw.vcpu}${r.tier.plus ? '+' : ''} vCPU / ${hw.ram}${r.tier.plus ? '+' : ''} GB`, false)}
        ${row('SSD storage (base system)', `${r.tier.storage}${r.tier.plus ? '+' : ''} GB`, false)}
        ${row('Network', r.lanNote, false)}
        ${row(`Recordings (${fmt(v.recordMinutesPerDay, 0)} min a day for ${v.recordDays} days)`, `${fmt(r.recordingGb)} GB`, false)}
        <p class="muted-line">Queues, group calls, and recording add CPU and memory load beyond the baseline. About 1 MB per recorded minute; verbose logs can use up to about 1 GB a day.</p></div></div>
      <div class="calc-card" style="margin-top:16px"><h3>Ports</h3>
        ${row('RTP ports needed for these calls', `about ${fmt(r.rtpPortsNeeded, 0)} of ${fmt(r.rtpPortsAvailable, 0)} (UDP 9000-10999)`, false)}
        ${r.rtpPortsNeeded > r.rtpPortsAvailable ? `<p class="calc-probe-result is-no">More calls than the default RTP range covers (about ${fmt(r.maxCallsByPorts, 0)} calls).</p>` : ''}
        <div class="table-wrap"><table class="net-table calc-table"><thead><tr><th>Direction</th><th>Port</th><th>Used for</th></tr></thead><tbody>${PORTS.map(p => `<tr><td>${esc(p[0])}</td><td class="mono">${esc(p[1])}</td><td>${esc(p[2])}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  function renderSizing() {
    const v = sizingInputs();
    const num = (id, label, key, attrs = '') => `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-calc="sz" data-key="${key}" type="number" value="${v[key]}" ${attrs}></div>`;
    return `<section class="panel"><div class="panel-body" style="padding-top:22px">
      <div class="calc-form">
        ${num('sz-ext', 'Extensions', 'extensions', 'min="0" step="1"')}${num('sz-calls', 'Simultaneous calls (peak)', 'calls', 'min="0" step="1"')}
        <div class="field"><label for="sz-codec">Codec</label><select id="sz-codec" data-calc="sz" data-key="codecId" data-enhanced="1">${CODECS.map(c => `<option value="${c.id}"${v.codecId === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="sz-ptime">Packet time</label><select id="sz-ptime" data-calc="sz" data-key="ptimeMs" data-num="1" data-enhanced="1">${[20, 30, 40].map(p => `<option value="${p}"${v.ptimeMs === p ? ' selected' : ''}>${p} ms</option>`).join('')}</select></div>
        <div class="field"><label for="sz-platform">Server platform</label><select id="sz-platform" data-calc="sz" data-key="platform" data-enhanced="1"><option value="debian"${v.platform === 'debian' ? ' selected' : ''}>Debian</option><option value="windows"${v.platform === 'windows' ? ' selected' : ''}>Windows</option></select></div>
        ${num('sz-wan', 'Calls that cross the internet link (%)', 'wanPercent', 'min="0" max="100" step="5"')}${num('sz-head', 'Headroom for signaling and bursts (%)', 'headroomPercent', 'min="0" max="100" step="5"')}
        ${num('sz-rec', 'Recorded minutes a day', 'recordMinutesPerDay', 'min="0" step="10"')}${num('sz-days', 'Days to keep recordings', 'recordDays', 'min="1" step="1"')}
        <div class="field"><label for="sz-srtp">Encryption</label><div class="toggle-line"><label class="switch"><input id="sz-srtp" type="checkbox" data-calc="sz" data-key="srtp" ${v.srtp ? 'checked' : ''}><span></span></label><span>SRTP (adds 10 bytes a packet)</span></div></div>
      </div><div id="calc-sizing-out" style="margin-top:20px">${sizingResult(v)}</div></div></section>`;
  }

  function render() {
    const tab = hashParams().tab || 'subnet';
    const body = tab === 'vlsm' ? renderVlsm() : tab === 'sizing' ? renderSizing() : renderSubnet();
    main.innerHTML = `<div class="tool-page" id="calc-root">
      <div class="section-head"><div><h2>Calculators</h2><p>Work out subnets, plan address blocks for VLANs, and size a 3CX system: voice bandwidth, ports to open, server tier, and recording storage.</p></div></div>
      <div class="tab-row" role="tablist" aria-label="Calculators">${TABS.map(([id, label]) => `<button class="tab-button${tab === id ? ' active' : ''}" role="tab" aria-selected="${tab === id}" data-calc-tab="${id}">${label}</button>`).join('')}</div>
      ${body}</div>`;
    wire(document.getElementById('calc-root'), tab);
  }

  function wire(root, tab) {
    const persist = debounce(() => saveTools(), 400);
    root.addEventListener('click', event => {
      const tabBtn = event.target.closest('[data-calc-tab]');
      if (tabBtn) location.hash = `calculators?tab=${tabBtn.dataset.calcTab}`;
    });
    const refresh = () => {
      const s = state();
      if (tab === 'subnet') document.getElementById('calc-subnet-out').innerHTML = subnetResult(s.subnetInput == null ? '192.168.10.37/26' : s.subnetInput, s.subnetSplit, s.subnetProbe);
      else if (tab === 'vlsm') document.getElementById('calc-vlsm-out').innerHTML = vlsmResult(document.getElementById('calc-vparent').value, document.getElementById('calc-vlist').value);
      else document.getElementById('calc-sizing-out').innerHTML = sizingResult(sizingInputs());
    };
    const onInput = event => {
      const el = event.target.closest('[data-calc]'); if (!el) return;
      const s = state(), kind = el.dataset.calc;
      if (kind === 'subnet') { s.subnetInput = el.value; s.subnetSplit = null; refresh(); }
      else if (kind === 'split') { s.subnetSplit = el.value ? Number(el.value) : null; refresh(); }
      else if (kind === 'probe') { s.subnetProbe = el.value; refreshKeepFocus(el); }
      else if (kind === 'vparent') { s.vlsmParent = el.value; refresh(); }
      else if (kind === 'vlist') { s.vlsmList = el.value; refresh(); }
      else if (kind === 'sz') {
        const next = { ...sizingInputs() };
        next[el.dataset.key] = el.type === 'checkbox' ? el.checked : (el.type === 'number' || el.dataset.num) ? Number(el.value) : el.value;
        s.sizing = next; refresh();
      }
      persist();
    };
    // The probe box lives inside the re-rendered result, so put the cursor back after a refresh.
    const refreshKeepFocus = el => { const pos = el.selectionStart; refresh(); const again = document.getElementById('calc-probe'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch {} } };
    root.addEventListener('input', onInput);
    root.addEventListener('change', onInput);
  }

  return { render };
}
