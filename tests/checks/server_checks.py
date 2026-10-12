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
    run_offsite_backup(ctx)
    run_shelf_api(ctx)


def run_offsite_backup(ctx):
    """tools/offsite_backup.py against a made-up app folder: what it copies, what it refuses, and that it only ever prunes its own zips."""
    import datetime as dt
    import shutil
    import subprocess
    import sys
    import tempfile
    import zipfile
    from pathlib import Path

    t = ctx.t
    sys.path.insert(0, str(APP_ROOT / "tools"))
    import offsite_backup as ob

    t.suite("offsite backup tool")
    with tempfile.TemporaryDirectory() as tmp:
        root, dest = Path(tmp) / "app", Path(tmp) / "elsewhere"
        for name, text in {"data/progress.json": "{}", "data/progress-pabc123.json": '{"a":1}', "data/profiles.json": "{}", "data/concepts.js": "not personal",
                           "backup/b.json": "{}", "files/doc.pdf": "pdf", "app/app.js": "const APP_VERSION = 'v9';"}.items():
            (root / name).parent.mkdir(parents=True, exist_ok=True)
            (root / name).write_text(text)
        have_git = shutil.which("git") is not None
        if have_git:
            git = ["git", "-C", str(root), "-c", "user.name=t", "-c", "user.email=t@t"]
            subprocess.run(git + ["init", "-q"], check=True)
            subprocess.run(git + ["add", "-A"], check=True)
            subprocess.run(git + ["commit", "-q", "-m", "x"], check=True)
        else:
            t.warn("git is not installed, so the code bundle part of the backup tool was not tested")

        dry = ob.make_backup(root, dest, dry_run=True, allow_same_disk=True)
        t.check(sorted(dry["names"]) == ["backup/b.json", "data/profiles.json", "data/progress-pabc123.json", "data/progress.json", "files/doc.pdf"],
                "it picks up progress, the PIN registry, backups, and files, and nothing else from data/", str(dry.get("names")))
        t.check(not dest.exists(), "a dry run writes nothing")
        refused = []
        for label, target, flag in (("inside the app folder", root / "out", True), ("on the same disk", dest, False)):
            try:
                ob.make_backup(root, target, allow_same_disk=flag)
            except ValueError:
                refused.append(label)
        t.check(refused == ["inside the app folder", "on the same disk"], "a destination inside the app, or on the same disk without the flag, is refused", str(refused))

        first = ob.make_backup(root, dest, keep=2, allow_same_disk=True, now=dt.datetime(2026, 1, 1, 9, 0, 0))
        with zipfile.ZipFile(first["zip"]) as archive:
            names = set(archive.namelist())
            t.check({"data/progress.json", "backup/b.json", "files/doc.pdf", "MANIFEST.txt"} <= names and "data/concepts.js" not in names, "the zip holds the personal files and a manifest, not app data files")
            t.check(archive.read("data/progress-pabc123.json") == b'{"a":1}', "files come back byte for byte")
            if have_git:
                t.check("code.bundle" in names and first["note"] is None, "the code history is included as a git bundle", str(first["note"]))
        slim = ob.make_backup(root, Path(tmp) / "slim", include_files=False, allow_same_disk=True, now=dt.datetime(2026, 1, 1, 9, 0, 1))
        with zipfile.ZipFile(slim["zip"]) as archive:
            t.check(not any(n.startswith("files/") for n in archive.namelist()), "--no-files leaves the user-supplied files out")

        (dest / "notes.txt").write_text("mine")
        for second in (1, 2, 3):
            last = ob.make_backup(root, dest, keep=2, allow_same_disk=True, now=dt.datetime(2026, 1, 2, 9, 0, second))
        left = sorted(p.name for p in dest.iterdir())
        t.check(len([n for n in left if n.endswith(".zip")]) == 2 and "notes.txt" in left, "only the newest zips are kept, and unrelated files in the destination are never touched", str(left))
        t.check(last["zip"].endswith("2026-01-02_090003.zip"), "the newest zip is the one kept")


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


def run_shelf_api(ctx):
    t = ctx.t
    sandbox = ctx.fresh_sandbox()
    t.suite("server: document shelf listing")
    t.check(sandbox.get_json("/api/files") == {"files": [], "folderExists": False}, "with no files folder the listing is empty")
    folder = sandbox.dir / "files"
    (folder / "sub" / "deep" / "deeper" / "deepest" / "too").mkdir(parents=True)
    (folder / "Guide.pdf").write_bytes(b"%PDF-1.4 test")
    (folder / ".hidden.pdf").write_bytes(b"x")
    (folder / "Résumé guide.pdf").write_bytes(b"unicode")
    (folder / "sub" / "Notes.txt").write_text("hello")
    (folder / "sub" / "deep" / "deeper" / "deepest" / "a.txt").write_text("four deep")
    (folder / "sub" / "deep" / "deeper" / "deepest" / "too" / "b.txt").write_text("five deep")
    reply = sandbox.get_json("/api/files")
    paths = [f["path"] for f in reply["files"]]
    t.check(reply["folderExists"] and paths == ["Guide.pdf", "Résumé guide.pdf", "sub/deep/deeper/deepest/a.txt", "sub/Notes.txt"],
            "files are listed with forward-slash paths, sorted, skipping hidden files and anything deeper than four folders", str(paths))
    guide = next(f for f in reply["files"] if f["name"] == "Guide.pdf")
    t.check(guide["size"] == 13 and isinstance(guide["modified"], int) and guide["modified"] > 1_000_000_000, "each entry has its size and modified time")
    raw = json.dumps(reply, ensure_ascii=False)
    t.check(str(sandbox.dir) not in raw and "\\" not in raw and ":/" not in raw, "the listing never reveals an absolute path")
    code, body = _status(sandbox.url + "/files/Guide.pdf")
    t.check(code == 200 and body == b"%PDF-1.4 test", "a listed file is served from /files/")
    code, body = _status(sandbox.url + "/files/R%C3%A9sum%C3%A9%20guide.pdf")
    t.check(code == 200 and body == b"unicode", "...including one with spaces and accents in its name")

