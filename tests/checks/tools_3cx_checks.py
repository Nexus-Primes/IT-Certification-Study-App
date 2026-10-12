"""Tools: the 3CX bulk user import file built from the Network sheet."""
import time

from checks.tools_calc_net import capture_downloads, last_download, text_of
from checks.tools_checks import audit_view, click, wait_saved
from lib.framework import go, open_app


def run_3cx_export(ctx, sandbox, browser):
    t = ctx.t
    t.suite("tools: 3CX import file")
    r = browser.eval("""import('/app/tools-3cx.js').then(async m => {
      const core = await import('/app/tools-core.js');
      const rows = [
        { ext: '101', name: 'Mary Jane Smith', email: 'mary@example.com', mobile: '+44 7700 900123', department: 'Sales', role: 'Manager', phone: 'Yealink T43U', mac: 'aa:bb:cc:dd:ee:ff', did: '+441632960123' },
        { ext: '102', name: 'Bob', email: '', role: 'Supervisor', mac: 'zz', did: '12345' },
        { ext: '102', name: 'Dup Ext', email: 'd@example.com' },
        { ext: '', name: '', email: 'nobody@example.com' },
        { ext: 'x1', name: 'Odd Ext', email: 'o@example.com', role: '' } ];
      const plain = m.build3cxImport(rows, { templateFile: 'yealinkT4x.ph.xml' });
      const grid = core.parseCsv(plain.csv);
      const tpl = m.parseTemplate('Number,FirstName,LastName,EmailAddress,Role,VMEnable,AllowLanOnly,SIPID,WebMeetingFriendlyName,Language\\r\\n100,Old,User,old@x.com,"<role name=""users"" />",1,1,old-sip,old-link,French\\r\\n');
      const withTpl = m.build3cxImport([rows[0]], { template: tpl, templateFile: 'yealinkT4x.ph.xml' });
      const tplGrid = core.parseCsv(withTpl.csv);
      return { docCols: m.DOCUMENTED_COLUMNS.length, first: m.DOCUMENTED_COLUMNS.slice(0, 9), last: m.DOCUMENTED_COLUMNS[m.DOCUMENTED_COLUMNS.length - 1],
        names: [m.splitName('Mary Jane Smith'), m.splitName('Bob'), m.splitName('  '), m.splitName('Ana  Lopez')],
        roles: Object.keys(m.ROLE_VALUES).map(k => m.roleCell(k)), badTpl: m.parseTemplate('a,b,c\\n1,2,3'), emptyTpl: m.parseTemplate(''),
        plain: { ok: plain.ok, exported: plain.exported, skipped: plain.skipped, header: grid[0], row1: grid[1], row2: grid[2], row4: grid[4], warnings: plain.warnings, rows: grid.length },
        tpl: { header: tplGrid[0], row: tplGrid[1] }, none: m.build3cxImport([{ name: '' }]) }; })""")
    cols = r["docCols"]
    t.check(cols == 54 and r["first"] == ["Number", "FirstName", "LastName", "EmailAddress", "MobileNumber", "OutboundCallerID", "DID", "Role", "Department"] and r["last"] == "BLF",
            "the documented columns are 3CX's, in its order, from Number to BLF", str(cols))
    t.check(r["names"] == [{"first": "Mary Jane", "last": "Smith"}, {"first": "Bob", "last": ""}, {"first": "", "last": ""}, {"first": "Ana", "last": "Lopez"}], "names split into first and last, keeping a middle name with the first")
    t.check(r["roles"] == ['<role name="users" />', '<role name="receptionists" />', '<role name="managers" />', '<role name="group_admins" />', '<role name="group_owners" />', '<role name="system_admins" />', '<role name="system_owners" />'],
            "roles use the exact value format the import expects")
    t.check(r["badTpl"]["ok"] is False and "does not look like" in r["badTpl"]["error"] and r["emptyTpl"]["ok"] is False, "a file that is not a 3CX export is refused with a reason")
    p = r["plain"]
    header = p["header"]
    at = {name: header.index(name) for name in header}
    row1 = dict(zip(header, p["row1"]))
    t.check(p["ok"] and p["exported"] == 4 and p["skipped"] == 1 and len(header) == cols and p["rows"] == 5, "a row without a name is left out and the rest are kept")
    t.check((row1["Number"], row1["FirstName"], row1["LastName"], row1["EmailAddress"], row1["MobileNumber"], row1["DID"], row1["OutboundCallerID"], row1["Department"]) == ("101", "Mary Jane", "Smith", "mary@example.com", "+44 7700 900123", "+441632960123", "+441632960123", "Sales"),
            "the person's details land in the right columns")
    t.check(row1["Role"] == '<role name="managers" />' and row1["MAC"] == "AABBCCDDEEFF" and row1["Model"] == "Yealink T43U" and row1["Template"] == "yealinkT4x.ph.xml", "role, MAC (no separators, upper case), model, and template are set")
    t.check(all(v == "" for k, v in row1.items() if k not in ("Number", "FirstName", "LastName", "EmailAddress", "MobileNumber", "DID", "OutboundCallerID", "Role", "Department", "MAC", "Model", "Template")), "every setting we do not manage is left blank when no 3CX export is used")
    row2 = dict(zip(header, p["row2"]))
    t.check(row2["Role"] == '<role name="users" />' and row2["MAC"] == "" and row2["Model"] == "", "a supervisor is imported as a user and a bad MAC adds no phone")
    row4 = dict(zip(header, p["row4"]))
    t.check(row4["Number"] == "" and row4["Role"] == '<role name="users" />', "a non-numeric extension is left blank for 3CX to assign, and a missing role becomes User")
    text = " | ".join(p["warnings"])
    t.check("no email address" in text and "Supervisor cannot be set by import" in text and "MAC address \"zz\" is not valid" in text and "appears twice" in text and "is not numeric" in text and "E.164" in text
            and "only creates new extensions" in text and "every setting other than" in text and "must already exist on a trunk" in text, "the report explains every problem and the limits of the import", text[:400])
    tpl = r["tpl"]
    row = dict(zip(tpl["header"], tpl["row"]))
    t.check(tpl["header"] == ["Number", "FirstName", "LastName", "EmailAddress", "Role", "VMEnable", "AllowLanOnly", "SIPID", "WebMeetingFriendlyName", "Language"]
            and row["VMEnable"] == "1" and row["AllowLanOnly"] == "1" and row["Language"] == "French" and row["SIPID"] == "" and row["WebMeetingFriendlyName"] == "" and row["FirstName"] == "Mary Jane" and row["Number"] == "101",
            "with a 3CX export as the template its columns and default settings are used, but unique settings are not copied")
    t.check(r["none"]["ok"] is False, "nothing to export gives an error rather than an empty file")

    t.suite("tools: 3CX export on the page")
    open_app(browser, sandbox)            # the Today-strip tests left the browser on their own sandbox
    capture_downloads(browser)
    go(browser, "netsheet?tab=extensions", wait=0.8)
    t.check(browser.eval("!!document.querySelector('.net-3cx')"), "the Extensions tab offers the 3CX export")
    go(browser, "netsheet?tab=subnets", wait=0.6)
    t.check(browser.eval("!document.querySelector('.net-3cx')"), "...and only that tab does")
    go(browser, "netsheet?tab=extensions", wait=0.6)
    browser.eval("""(() => { const input = document.getElementById('net-file'); const dt = new DataTransfer();
      dt.items.add(new File(['Extension,Name,Email,Mobile,Department,Role,Phone model,MAC address,Assigned DID\\r\\n101,Mary Smith,mary@example.com,07700900123,Sales,Manager,Yealink T43U,aa:bb:cc:dd:ee:ff,+441632960123\\r\\n102,Bob Jones,bob@example.com,,Sales,User,,,\\r\\n'], 'ext.csv', { type: 'text/csv' }));
      input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()""")
    time.sleep(0.8)
    t.check(wait_saved(sandbox, lambda s: len(s.get("network", {}).get("extensions", [])) == 2), "the new Email and Mobile columns import and save")
    browser.eval("document.querySelector('.net-3cx').open = true")
    click(browser, '[data-net="export-3cx"]')
    time.sleep(0.6)
    csv = last_download(browser)
    t.check(bool(csv) and csv.splitlines()[0].startswith("Number,FirstName,LastName,EmailAddress,MobileNumber,OutboundCallerID,DID,Role,Department") and "Mary,Smith,mary@example.com" in csv and '"<role name=""managers"" />"' in csv,
            "Download builds the file from the table", (csv or "")[:200])
    report = text_of(browser, "net-3cx-report")
    t.check("Exported 2 extensions" in report and "only creates new extensions" in report, "the page reports what was exported and the import's limits")
    browser.eval("""(() => { const input = document.getElementById('net-3cx-file'); const dt = new DataTransfer();
      dt.items.add(new File(['Number,FirstName,LastName,EmailAddress,VMEnable,SIPID\\r\\n200,Ex,Ample,e@x.com,1,sip200\\r\\n'], 'export.csv', { type: 'text/csv' }));
      input.files = dt.files; })()""")
    click(browser, '[data-net="export-3cx"]')
    time.sleep(0.8)
    csv = last_download(browser)
    t.check(bool(csv) and csv.splitlines()[0] == "Number,FirstName,LastName,EmailAddress,VMEnable,SIPID" and csv.splitlines()[1].endswith(",1,"), "choosing your own 3CX export uses its columns and copies its settings")
    browser.eval("""(() => { const input = document.getElementById('net-3cx-file'); const dt = new DataTransfer(); dt.items.add(new File(['a,b\\r\\n1,2\\r\\n'], 'bad.csv')); input.files = dt.files; })()""")
    click(browser, '[data-net="export-3cx"]')
    time.sleep(0.6)
    t.check("does not look like a 3CX extension export" in text_of(browser, "net-3cx-report"), "a wrong file gives a clear message")
    browser.eval("document.getElementById('net-3cx-file').value = ''")
    audit_view(t, browser, "the Extensions tab with the 3CX export open")
    t.check(not browser.errors(), "no JavaScript errors in the 3CX export", "; ".join(browser.errors()[:3]))
