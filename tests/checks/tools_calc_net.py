"""Tools: the calculators and the network sheet."""
import os
import tempfile
import time

from checks.tools_checks import audit_view, click, wait_saved
from lib.framework import go, reload

try:
    import pymupdf  # type: ignore
except ImportError:  # optional
    pymupdf = None


def capture_downloads(browser):
    browser.eval("window.__blobs = []; if (!window.__origCreate) { window.__origCreate = URL.createObjectURL; URL.createObjectURL = b => { window.__blobs.push(b); return window.__origCreate(b); }; }")


def last_download(browser):
    return browser.eval("window.__blobs.length ? window.__blobs[window.__blobs.length - 1].text() : null")


def fill(browser, selector, value):
    browser.eval(f"(() => {{ const e = document.querySelector({selector!r}); e.value = {value!r}; e.dispatchEvent(new Event('input', {{ bubbles: true }})); e.dispatchEvent(new Event('change', {{ bubbles: true }})); }})()")
    time.sleep(0.3)


def text_of(browser, element_id):
    return browser.eval(f"document.getElementById({element_id!r}).innerText")


def run_calculators(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: calculator maths")
    r = browser.eval("""import('/app/tools-calc.js').then(c => {
      const info = (text) => { const p = c.parseCidr(text); return p && c.subnetInfo(p.ip, p.prefix); };
      const a = info('192.168.10.37/26'), b = info('10.0.0.0/8'), d = info('172.16.5.130/26'), e = info('192.0.2.5/30'), f = info('10.0.0.0/31'), g = info('8.8.8.8/32'), h = info('0.0.0.0/0');
      const split = c.splitSubnet(c.parseIPv4('192.168.10.0'), 24, 26);
      const plan = c.vlsmPlan(c.parseIPv4('10.20.0.0'), 22, [{ name: 'Staff', hosts: 120 }, { name: 'Voice', hosts: 60 }, { name: 'Servers', hosts: 25 }, { name: 'Guest', hosts: 50 }, { name: 'Management', hosts: 12 }]);
      const tooBig = c.vlsmPlan(c.parseIPv4('10.0.0.0'), 24, [{ name: 'Big', hosts: 300 }]);
      const g711 = c.bandwidthPerCall({ kbps: 64 }), g729 = c.bandwidthPerCall({ kbps: 8 }), srtp = c.bandwidthPerCall({ kbps: 64, srtp: true }), p30 = c.bandwidthPerCall({ kbps: 64, ptimeMs: 30 });
      const sz = c.sizingEstimate({ extensions: 40, calls: 12, recordMinutesPerDay: 120, recordDays: 30 });
      return { a, b, d, e, f, g, h, mask: c.parseCidr('10.1.0.9 255.255.255.0'), mask2: c.parseCidr('10.1.0.9/255.255.255.0'),
        bad: [c.parseCidr('255.0.255.0'), c.parseCidr('300.1.1.1/24'), c.parseCidr('01.2.3.4/24'), c.parseCidr('10.0.0.1/33'), c.parseIPv4('1.2.3'), c.parseCidr('10.0.0.1 255.0.255.0')],
        split: { count: split.count, first: split.rows[0].network + '/' + split.rows[0].prefix, last: split.rows[3].network + '/' + split.rows[3].prefix },
        over: [c.overlaps(c.parseIPv4('10.0.0.0'), 24, c.parseIPv4('10.0.0.128'), 25), c.overlaps(c.parseIPv4('10.0.0.0'), 24, c.parseIPv4('10.0.1.0'), 24)],
        plan: plan.allocations.map(x => `${x.name} ${x.network}/${x.prefix}`), free: plan.freeAddresses, tooBig: tooBig.errors.length + ':' + tooBig.allocations.length,
        bw: [g711.l3Kbps, g711.l2Kbps, g729.l3Kbps, g729.l2Kbps, srtp.l3Kbps, p30.l3Kbps],
        tiers: [c.hardwareTier(10).name, c.hardwareTier(11).name, c.hardwareTier(250).name, c.hardwareTier(1001).name, c.hardwareTier(1001).plus === true],
        sz: { lan: sz.lanKbps, wan: sz.wanKbps, ports: sz.rtpPortsNeeded, rec: sz.recordingGb, tier: sz.tier.name } }; })""")
    a = r["a"]
    t.check((a["network"], a["broadcast"], a["mask"], a["wildcard"], a["first"], a["last"], a["hosts"]) == ("192.168.10.0", "192.168.10.63", "255.255.255.192", "0.0.0.63", "192.168.10.1", "192.168.10.62", 62) and a["kind"].startswith("Private"),
            "192.168.10.37/26 gives the right network, broadcast, mask, range, and 62 hosts")
    t.check(r["b"]["hosts"] == 16777214 and r["b"]["mask"] == "255.0.0.0", "a /8 has 16,777,214 usable hosts")
    t.check((r["d"]["network"], r["d"]["broadcast"]) == ("172.16.5.128", "172.16.5.191"), "172.16.5.130/26 sits in 172.16.5.128 to .191")
    t.check((r["e"]["network"], r["e"]["first"], r["e"]["last"], r["e"]["broadcast"], r["e"]["hosts"], r["e"]["kind"]) == ("192.0.2.4", "192.0.2.5", "192.0.2.6", "192.0.2.7", 2, "Documentation"), "a /30 has two usable hosts")
    t.check((r["f"]["hosts"], r["f"]["first"], r["f"]["last"], r["f"]["broadcast"]) == (2, "10.0.0.0", "10.0.0.1", "(none)"), "a /31 is a point-to-point pair with no broadcast")
    t.check((r["g"]["hosts"], r["g"]["first"], r["g"]["kind"]) == (1, "8.8.8.8", "Public") and r["h"]["total"] == 4294967296, "a /32 is one host and a /0 is the whole address space")
    t.check(r["mask"] == r["mask2"] and r["mask"]["prefix"] == 24, "a dotted mask is understood, with a space or a slash")
    t.check(all(x is None for x in r["bad"]), "bad masks, octets over 255, leading zeros, and prefixes over 32 are refused")
    t.check(r["split"] == {"count": 4, "first": "192.168.10.0/26", "last": "192.168.10.192/26"}, "a /24 splits into four /26 subnets")
    t.check(r["over"] == [True, False], "overlapping subnets are detected")
    t.check(r["plan"] == ["Staff 10.20.0.0/25", "Voice 10.20.0.128/26", "Guest 10.20.0.192/26", "Servers 10.20.1.0/27", "Management 10.20.1.32/28"] and r["free"] == 720,
            "the VLSM plan allocates largest first on size boundaries")
    t.check(r["tooBig"] == "1:0", "a requirement that does not fit is reported, not placed")
    bw = r["bw"]
    t.check(abs(bw[0] - 80) < 0.01 and abs(bw[1] - 87.2) < 0.01 and abs(bw[2] - 24) < 0.01 and abs(bw[3] - 31.2) < 0.01,
            "G.711 is 80 kbps (87.2 with Ethernet) and G.729 is 24 kbps (31.2) per call direction at 20 ms")
    t.check(abs(bw[4] - 84) < 0.01 and abs(bw[5] - 74.667) < 0.01, "SRTP adds 10 bytes a packet and 30 ms packets use less bandwidth")
    t.check(r["tiers"] == ["Small", "Medium", "Large", "Enterprise+", True], "the hardware tier follows 3CX's 10, 50, 250, and 1,000 extension steps")
    sz = r["sz"]
    t.check(abs(sz["lan"] - 1046.4) < 0.01 and abs(sz["wan"] - 1151.04) < 0.01 and sz["ports"] == 24 and abs(sz["rec"] - 3.515625) < 0.0001 and sz["tier"] == "Medium",
            "12 calls need about 1.05 Mbps on the LAN, 1.15 Mbps over the internet link with headroom, 24 RTP ports, and 3.5 GB of recordings a month")

    t.suite("tools: calculators page")
    go(browser, "calculators", wait=0.8)
    out = text_of(browser, "calc-subnet-out")
    t.check("192.168.10.0/26" in out and "255.255.255.192" in out and "62" in out, "the subnet tab opens with a worked example")
    fill(browser, "#calc-subnet", "10.1.2.200/22")
    out = text_of(browser, "calc-subnet-out")
    t.check("10.1.0.0/22" in out and "1,022" in out, "typing a new address updates the result")
    fill(browser, "#calc-subnet", "not an address")
    t.check("IPv4 only" in text_of(browser, "calc-subnet-out"), "an unreadable address gets a helpful hint instead of an error")
    fill(browser, "#calc-subnet", "192.168.10.0/24")
    fill(browser, "#calc-split", "26")
    t.check(browser.eval("document.querySelectorAll('#calc-subnet-out tbody tr').length") == 4, "choosing /26 lists the four subnets")
    fill(browser, "#calc-probe", "192.168.10.77")
    t.check("Yes" in browser.eval("document.querySelector('.calc-probe-result').innerText"), "the membership check says yes for an address inside")
    fill(browser, "#calc-probe", "192.168.11.1")
    t.check("No" in browser.eval("document.querySelector('.calc-probe-result').innerText"), "...and no for one outside")
    t.check(wait_saved(sandbox, lambda s: s.get("calc", {}).get("subnetInput") == "192.168.10.0/24"), "the last inputs are remembered")

    go(browser, "calculators?tab=vlsm", wait=0.8)
    t.check(browser.eval("document.querySelectorAll('#calc-vlsm-out tbody tr').length") == 5, "the VLSM tab plans the example's five networks")
    fill(browser, "#calc-vlist", "Only, 5000")
    t.check("does not fit" in text_of(browser, "calc-vlsm-out"), "an oversized requirement is called out")

    go(browser, "calculators?tab=sizing", wait=0.8)
    out = text_of(browser, "calc-sizing-out")
    t.check("Medium" in out and "UDP 9000-10999" in out and "Mbps" in out, "the sizing tab shows a tier, the ports to open, and bandwidth")
    before = out
    fill(browser, "#sz-calls", "120")
    after = text_of(browser, "calc-sizing-out")
    t.check(after != before and "240 of 2,000" in after, "more simultaneous calls raise the bandwidth and port count")
    fill(browser, "#sz-calls", "1500")
    t.check("More calls than the default RTP range" in text_of(browser, "calc-sizing-out"), "too many calls for the default RTP range is flagged")
    fill(browser, "#sz-ext", "300")
    t.check("Enterprise" in text_of(browser, "calc-sizing-out"), "300 extensions lands in the Enterprise tier")
    time.sleep(1.0)
    reload(browser, wait=2.5)
    t.check(browser.eval("document.getElementById('sz-calls').value") == "1500", "sizing inputs survive a reload")
    for tab in ("subnet", "vlsm", "sizing"):
        go(browser, f"calculators?tab={tab}", wait=0.7)
        audit_view(t, browser, f"calculators ({tab})")
    t.check(not browser.errors(), "no JavaScript errors in the calculators", "; ".join(browser.errors()[:3]))


def run_network(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: network sheet checks")
    r = browser.eval("""import('/app/tools-network.js').then(n => {
      const row = (o) => ({ id: Math.random().toString(36).slice(2), ...o });
      const warn = (net) => n.findNetworkWarnings({ subnets: [], devices: [], extensions: [], dids: [], ...net }).messages.map(m => m.text);
      const subs = [row({ vlan: '10', name: 'Staff', cidr: '10.0.10.0/24', gateway: '10.0.10.1' }), row({ vlan: '10', name: 'Voice', cidr: '10.0.10.128/25', gateway: '10.0.99.1' }), row({ vlan: '30', name: 'Bad', cidr: '10.0.30.0/33' })];
      const dev = [row({ name: 'PBX', ip: '10.0.10.5', mac: 'aa:bb:cc:dd:ee:ff' }), row({ name: 'Phone', ip: '10.0.10.5', mac: 'AABBCCDDEEFF' }), row({ name: 'Far', ip: '172.16.0.9' }), row({ name: 'Typo', ip: '10.0.10.300', mac: 'zz' })];
      const ext = [row({ ext: '101', name: 'A', did: '+441632960123' }), row({ ext: '101', name: 'B', did: '01632960123' }), row({ ext: '1a2', name: 'C' })];
      const dids = [row({ number: '+44 1632 960123' }), row({ number: '+441632960123' }), row({ number: '12345' })];
      return { subs: warn({ subnets: subs }), dev: warn({ subnets: [subs[0]], devices: dev }), ext: warn({ extensions: ext }), dids: warn({ dids }), clean: warn({ subnets: [subs[0]], devices: [dev[0]], extensions: [ext[0]], dids: [dids[0]] }),
        mac: ['aa:bb:cc:dd:ee:ff', 'AA-BB-CC-DD-EE-FF', 'aabb.ccdd.eeff', 'aabbccddeeff', 'aa:bb:cc:dd:ee', 'g0:bb:cc:dd:ee:ff'].map(n.validMac),
        digits: n.macDigits('AA-BB-CC-dd-ee-ff'),
        csv: n.tableToCsv('extensions', [{ id: '1', ext: '101', name: 'Smith, Jo', department: 'Sales', role: 'User', phone: '', mac: '', did: '', notes: 'say "hi"' }]),
        rows: n.csvToRows('devices', 'Name,IP address,Colour\\r\\nSwitch 1,10.0.0.2,red\\r\\n,,\\r\\n"Core, A",10.0.0.3,blue\\r\\n').map(x => [x.name, x.ip]),
        noHeader: n.csvToRows('devices', 'x,y\\n1,2\\n').length }; })""")
    joined = lambda key: " | ".join(r[key])
    t.check("not a valid subnet" in joined("subs") and "VLAN 10 is used more than once" in joined("subs") and "overlap" in joined("subs") and "outside 10.0.10.128/25" in joined("subs"),
            "bad subnets, repeated VLAN IDs, overlaps, and a gateway outside its subnet are flagged")
    t.check("is used by PBX and Phone" in joined("dev") and "MAC AABBCCDDEEFF is used by PBX and Phone" in joined("dev") and "not inside any subnet" in joined("dev") and "10.0.10.300" in joined("dev") and "zz" in joined("dev"),
            "duplicate addresses and MACs, a device outside every subnet, and bad addresses are flagged")
    t.check("used by A and B" in joined("ext") and "E.164" in joined("ext") and "digits only" in joined("ext"), "duplicate or non-numeric extensions and non-E.164 DIDs are flagged")
    t.check("listed twice" in joined("dids") and "E.164" in joined("dids"), "a DID written two ways is caught as a duplicate, and a short number as invalid")
    t.check(r["clean"] == [], "a consistent sheet raises no warnings")
    t.check(r["mac"] == [True, True, True, True, False, False] and r["digits"] == "aabbccddeeff", "MAC addresses are accepted in the common notations")
    t.check(r["csv"].splitlines()[0] == "Extension,Name,Department,Role,Phone model,MAC address,Assigned DID,Notes" and '"Smith, Jo"' in r["csv"] and '"say ""hi"""' in r["csv"],
            "the CSV export has the column names and quotes commas and quotes")
    t.check(r["rows"] == [["Switch 1", "10.0.0.2"], ["Core, A", "10.0.0.3"]] and r["noHeader"] == 0, "the CSV import maps columns by name, skips blank rows, and ignores files without matching columns")

    t.suite("tools: network sheet page")
    capture_downloads(browser)
    go(browser, "netsheet", wait=0.8)
    t.check(browser.eval("document.querySelectorAll('#net-root .tab-button').length") == 4, "four tabs: VLANs, devices, extensions, DIDs")
    t.check("yet" in text_of(browser, "net-table"), "an empty table says how to get started")
    click(browser, '[data-net="add"]')
    time.sleep(0.4)
    fill(browser, 'input[data-k="vlan"]', "10")
    fill(browser, 'input[data-k="name"]', "Staff")
    fill(browser, 'input[data-k="cidr"]', "10.0.10.0/24")
    t.check(wait_saved(sandbox, lambda s: bool(s.get("network", {}).get("subnets")) and s["network"]["subnets"][0].get("cidr") == "10.0.10.0/24"), "a row's cells are saved as you type")
    click(browser, '[data-net="add"]')
    time.sleep(0.4)
    fill(browser, 'tr:nth-child(2) input[data-k="cidr"]', "10.0.10.128/25")
    t.check("overlap" in text_of(browser, "net-warnings"), "an overlapping subnet raises a warning straight away")
    t.check(browser.eval("document.querySelectorAll('input[aria-invalid=true]').length") >= 1, "the cell at fault is marked invalid")
    fill(browser, 'tr:nth-child(2) input[data-k="cidr"]', "10.0.20.0/24")
    t.check(text_of(browser, "net-warnings").strip() == "", "fixing it clears the warning")
    fill(browser, 'tr:nth-child(2) input[data-k="name"]', "Voice")
    fill(browser, "#net-filter", "voice")
    t.check(browser.eval("[...document.querySelectorAll('#net-table tbody tr')].filter(r => !r.hidden).length") == 1, "the filter shows only matching rows")
    fill(browser, "#net-filter", "")
    click(browser, '[data-net="sort"][data-k="name"]')
    first = browser.eval("document.querySelector('#net-table tbody tr input[data-k=name]').value")
    click(browser, '[data-net="sort"][data-k="name"]')
    t.check(first == "Staff" and browser.eval("document.querySelector('#net-table tbody tr input[data-k=name]').value") == "Voice", "clicking a heading sorts, and again reverses")

    click(browser, '[data-net="export"]')
    time.sleep(0.4)
    csv = last_download(browser)
    t.check(bool(csv) and csv.splitlines()[0] == "VLAN,Name,Subnet (CIDR),Gateway,DHCP range,Notes" and "Staff" in csv and "10.0.20.0/24" in csv, "Export CSV downloads the table")

    click(browser, '[data-net="delete"]')
    time.sleep(0.4)
    t.check(browser.eval("document.querySelectorAll('#net-table tbody tr').length") == 1, "a row can be deleted")
    browser.eval("document.querySelector('.toast-action').click()")
    time.sleep(0.5)
    t.check(browser.eval("document.querySelectorAll('#net-table tbody tr').length") == 2, "...and Undo brings it back")

    browser.eval("""(() => { const input = document.getElementById('net-file'); const dt = new DataTransfer();
      dt.items.add(new File(['VLAN,Name,Subnet (CIDR),Gateway\\r\\n30,Guest,10.0.30.0/24,10.0.30.1\\r\\n40,IoT,10.0.40.0/24,10.0.40.1\\r\\n'], 'vlans.csv', { type: 'text/csv' }));
      input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()""")
    time.sleep(0.8)
    t.check(browser.eval("document.querySelectorAll('#net-table tbody tr').length") == 4, "Import CSV adds the file's rows")
    t.check(wait_saved(sandbox, lambda s: len(s.get("network", {}).get("subnets", [])) == 4), "...and saves them")

    click(browser, '[data-net-tab="devices"]')
    time.sleep(0.6)
    click(browser, '[data-net="add"]')
    time.sleep(0.4)
    fill(browser, 'input[data-k="name"]', "PBX")
    fill(browser, 'input[data-k="ip"]', "10.9.9.9")
    t.check("not inside any subnet" in text_of(browser, "net-warnings"), "a device outside every listed subnet is flagged")
    fill(browser, 'input[data-k="ip"]', "10.0.10.9")
    browser.eval("(() => { const s = document.querySelector('select[data-k=type]'); s.value = 'PBX'; s.dispatchEvent(new Event('change', { bubbles: true })); })()")
    t.check(wait_saved(sandbox, lambda s: bool(s["network"]["devices"]) and s["network"]["devices"][0].get("type") == "PBX"), "a device's type is chosen from a list and saved")
    click(browser, '[data-net-tab="extensions"]')
    time.sleep(0.5)
    t.check(browser.eval("document.querySelector('#net-root .tab-button.active').innerText").startswith("Extensions"), "tabs switch, with their own row counts")

    t.suite("tools: network sheet pages")
    for tab in ("subnets", "devices", "extensions", "dids"):
        go(browser, f"netsheet?tab={tab}", wait=0.6)
        audit_view(t, browser, f"network sheet ({tab})")
    if pymupdf is not None:
        go(browser, "netsheet", wait=0.6)
        browser.eval("window.dispatchEvent(new Event('beforeprint'))")
        path = browser.pdf(os.path.join(tempfile.mkdtemp(prefix="certstudy-tools-"), "net.pdf"))
        browser.eval("window.dispatchEvent(new Event('afterprint'))")
        doc = pymupdf.open(path)
        text = "\n".join(page.get_text() for page in doc)
        t.check("VLANs & subnets" in text and "10.0.10.0/24" in text and "Devices" in text and "Add row" not in text, "the printout lists every table with rows and no editing controls")
    t.check(not browser.errors(), "no JavaScript errors in the network sheet", "; ".join(browser.errors()[:3]))
