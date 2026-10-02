"""The local study server: saving, accounts, and backups (no browser needed)."""
import json
import urllib.error
import urllib.request


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
