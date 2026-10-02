"""The local study server: saving, accounts, and backups (no browser needed)."""
import datetime
import importlib.util
import json
import os
import urllib.error
import urllib.request

from lib.sandbox import APP_ROOT


def _status(url, data=None):
    request = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
                                     headers={"Content-Type": "application/json"}, method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(request) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def run(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()

    t.suite("server: saving progress")
    t.check(sandbox.progress() == {}, "a brand-new account starts empty")
    sandbox.post_json("/api/progress", {"profile": "default", "key": "track-a", "value": {"n": 1}})
    sandbox.post_json("/api/progress", {"profile": "default", "key": "track-b", "value": {"n": 2}})
    saved = sandbox.progress()
    t.check(saved.get("track-a") == {"n": 1} and saved.get("track-b") == {"n": 2}, "saving one track never overwrites another")
    sandbox.post_json("/api/progress", {"profile": "default", "key": "track-a", "value": {"n": 3}})
    t.check(sandbox.progress()["track-a"] == {"n": 3} and sandbox.progress()["track-b"] == {"n": 2}, "re-saving a track replaces only that track")
    code, _ = _status(sandbox.url + "/api/progress", {"profile": "default", "oops": 1})
    t.check(code == 400, "a malformed save is rejected", f"HTTP {code}")

    t.suite("server: accounts")
    made = sandbox.post_json("/api/profiles", {"name": "Test Person"})
    pid = made["profile"]["id"]
    sandbox.post_json("/api/progress", {"profile": pid, "key": "k", "value": {"mine": True}})
    t.check(sandbox.progress(pid).get("k") == {"mine": True}, "a second account keeps its own data")
    t.check("k" not in sandbox.progress(), "...and the default account's data is unaffected")
    t.check(sandbox.progress("not-a-real-id") == sandbox.progress(), "an unknown account id falls back to the default account (never builds a path from it)")

    t.suite("server: backups")
    reply = sandbox.post_json("/api/backup", {"app": "Cert Study", "format": "full", "version": "v1", "dateKey": "2026-01-02", "profile": "default", "progress": {"k": 1}})
    t.check(reply.get("filename") == "cert-study-backup-v1-2026-01-02.json", "a backup is written with a version-and-date name", str(reply))
    code, _ = _status(sandbox.url + "/api/backup", {"dateKey": "../../x", "version": "v1"})
    t.check(code == 400, "a backup with a hostile date is rejected", f"HTTP {code}")
    reply = sandbox.post_json("/api/backup", {"version": "../../evil", "dateKey": "2026-01-03", "progress": {}})
    t.check("/" not in reply["filename"] and "\\" not in reply["filename"], "the version in a backup name cannot smuggle in a path", reply["filename"])
    code, _ = _status(sandbox.url + "/nope")
    t.check(code == 404, "unknown paths return 404", f"HTTP {code}")
    run_backup_retention(ctx)
    run_backup_api(ctx)


def _load_server_module():
    spec = importlib.util.spec_from_file_location("certstudy_server_under_test", APP_ROOT / "server.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_backup_retention(ctx):
    t = ctx.t
    srv = _load_server_module()
    t.suite("server: backup naming and thinning (pure)")
    t.check(srv.parse_backup_name("cert-study-backup-v206-2026-10-01.json")["profile"] == "default", "a default-account backup name parses")
    t.check(srv.parse_backup_name("cert-study-backup-pabcdef012345-v1-2026-01-02.json")["profile"] == "pabcdef012345", "another account's backup is attributed to that account, not the default")
    t.check(srv.parse_backup_name("pre-multiuser-safety-copy-2026-09-22_092221.json") is None, "files the app did not make are never treated as backups")
    t.check(srv.parse_backup_name("cert-study-backup-v1-2026-13-45.json") is None, "an impossible date is rejected")
    t.check(srv.parse_backup_name("cert-study-prerestore-v1-2026-01-02-101112.json")["kind"] == "prerestore", "a pre-restore snapshot is recognized")

    today = datetime.date(2026, 10, 2)
    day = lambda n: (today - datetime.timedelta(days=n)).isoformat()
    entries = [{"name": f"b{n}", "date": day(n), "modified": float(1000 - n)} for n in list(range(0, 31)) + [36, 37, 38, 90, 91, 150, 200, 201, 202, 400, 410]]
    doomed = set(srv.plan_backup_pruning(entries, today))
    t.check(not any(f"b{n}" in doomed for n in range(0, 31)), "every backup from the last 30 days is kept")
    # 36/37/38 days old are Wed/Tue/Mon of one ISO week (2026-08-27 .. 08-25): only the newest survives.
    kept_week = [n for n in (36, 37, 38) if f"b{n}" not in doomed]
    t.check(kept_week == [36], "within the weekly window, only the newest backup of a week survives", f"kept {kept_week}")
    t.check("b90" not in doomed and "b91" not in doomed or ("b90" in doomed) != ("b91" in doomed), "different weeks each keep one")
    t.check("b150" not in doomed, "an isolated week keeps its backup")
    older = [n for n in (200, 201, 202) if f"b{n}" not in doomed]
    t.check(len(older) <= 2, "beyond six months, backups thin to one per month", f"kept {older}")
    t.check(len([n for n in (400, 410) if f"b{n}" not in doomed]) >= 1, "very old months still keep one")
    t.check(srv.plan_backup_pruning([{"name": "future", "date": day(-5), "modified": 1.0}], today) == [], "a backup dated in the future is left alone")


def run_backup_api(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    t.suite("server: listing, reading, and thinning backups over HTTP")
    today = datetime.date.today()
    day = lambda n: (today - datetime.timedelta(days=n)).isoformat()
    # Three days in one ISO week, well past 30 days: Mon, Tue, Wed of the week 6 weeks back.
    monday = today - datetime.timedelta(days=today.weekday() + 42)
    week = [monday, monday + datetime.timedelta(days=1), monday + datetime.timedelta(days=2)]
    pruned_total = 0
    for d in week + [today - datetime.timedelta(days=3)]:
        reply = sandbox.post_json("/api/backup", {"format": "full", "version": "v1", "dateKey": d.isoformat(), "progress": {"k": "recent" if d == today - datetime.timedelta(days=3) else d.isoformat()}})
        pruned_total += reply["pruned"]
    reply = sandbox.post_json("/api/backup", {"format": "full", "version": "v1", "dateKey": day(0), "kind": "pre-restore", "progress": {"k": "snapshot"}})
    t.check("prerestore" in reply["filename"], "a pre-restore snapshot is saved under its own name", reply["filename"])
    # Writing a normal backup is what triggers thinning.
    reply = sandbox.post_json("/api/backup", {"format": "full", "version": "v1", "dateKey": day(0), "progress": {"k": "today"}})
    listing = sandbox.get_json("/api/backups?profile=default")
    names = [b["name"] for b in listing["backups"]]
    survivors = [d for d in week if f"cert-study-backup-v1-{d.isoformat()}.json" in names]
    t.check(survivors == [week[2]], "an old week was thinned to its newest backup when a new one was written", str(names))
    pruned_total += reply["pruned"]
    t.check(pruned_total == 2, "each reply reports how many old backups it thinned (two in all)", str(pruned_total))
    t.check(any("prerestore" in n for n in names), "pre-restore snapshots are listed and never thinned")
    t.check(any(b["kind"] == "pre-restore" for b in listing["backups"]) and any(b["kind"] == "daily" for b in listing["backups"]), "the list tells the two kinds apart")
    t.check([b["date"] for b in listing["backups"]] == sorted([b["date"] for b in listing["backups"]], reverse=True), "newest first")

    data = sandbox.get_json(f"/api/backup-file?profile=default&name=cert-study-backup-v1-{day(3)}.json")
    t.check(data["progress"] == {"k": "recent"}, "a backup can be read back exactly")
    for bad in ("../data/progress.json", "..%2F..%2Fserver.py", "cert-study-backup-v1-2026-01-01.json/../../server.py", "nothing.json", ""):
        code, _ = _status(f"{sandbox.url}/api/backup-file?profile=default&name={bad}")
        t.check(code == 404, f"reading '{bad or '(empty)'}' as a backup is refused", f"HTTP {code}")
    made = sandbox.post_json("/api/profiles", {"name": "Other"})["profile"]["id"]
    code, _ = _status(f"{sandbox.url}/api/backup-file?profile={made}&name=cert-study-backup-v1-{day(3)}.json")
    t.check(code == 404, "one account cannot read another account's backup")
    t.check(sandbox.get_json(f"/api/backups?profile={made}")["backups"] == [], "...or see it in its list")
    t.check(os.path.exists(os.path.join(sandbox.dir, "backup")) and True, "backups live in the backup/ folder")
