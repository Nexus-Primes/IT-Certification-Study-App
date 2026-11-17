"""Checks that need no browser: version lockstep, offline precache coverage, file references."""
import py_compile
import re
import tempfile
from pathlib import Path

from lib.sandbox import APP_ROOT


def run(ctx):
    t = ctx.t
    t.suite("static: versions and precache")
    app_js = (APP_ROOT / "app" / "app.js").read_text(encoding="utf-8")
    sw = (APP_ROOT / "service-worker.js").read_text(encoding="utf-8")
    index = (APP_ROOT / "app" / "index.html").read_text(encoding="utf-8")

    version = re.search(r"const APP_VERSION = '(v\d+)'", app_js)
    cache = re.search(r"const CACHE = 'cert-study-(v\d+)'", sw)
    t.check(bool(version and cache and version.group(1) == cache.group(1)), "APP_VERSION matches the service worker cache name",
            f"{version and version.group(1)} vs {cache and cache.group(1)}")

    # The desktop app's package.json carries the same number as semver (v240 -> 240.0.0). Run
    # `node scripts/sync-version.js` after bumping APP_VERSION.
    package_json = APP_ROOT / "package.json"
    if package_json.exists() and version:
        import json
        wanted_semver = version.group(1).lstrip("v") + ".0.0"
        have = json.loads(package_json.read_text(encoding="utf-8")).get("version")
        t.check(have == wanted_semver, "package.json version matches APP_VERSION (run node scripts/sync-version.js)", f"{have} vs {wanted_semver}")

    changelog_js = (APP_ROOT / "app" / "changelog.js").read_text(encoding="utf-8")
    changelog_top = re.search(r"const CHANGELOG = \[\s*\{ version: '(v\d+)'", changelog_js)
    if not (changelog_top and version and changelog_top.group(1) == version.group(1)):
        t.warn("newest CHANGELOG entry is not the current version",
               f"{changelog_top and changelog_top.group(1)} vs {version and version.group(1)} (fine for an internal-only bump)")
    else:
        t.check(True, "newest CHANGELOG entry matches the current version")

    # Every file the page can load must be precached, or the app breaks offline after an update.
    assets = set(re.findall(r"'(/[^']+)'", re.search(r"const ASSETS = \[(.*?)\];", sw, re.S).group(1)))
    wanted = set()
    for folder, pattern in (("app", "*.js"), ("app", "*.css"), ("app", "*.html"), ("data", "*.js")):
        for f in (APP_ROOT / folder).glob(pattern):
            wanted.add(f"/{folder}/{f.name}")
    missing = sorted(w for w in wanted if w not in assets and w != "/app/index.html")
    t.check(not missing, "every app/ and data/ script, stylesheet, and page is in the service worker's ASSETS", ", ".join(missing))

    referenced = set(re.findall(r'(?:src|href)="(/(?:app|data)/[^"?]+)', index))
    t.check(all((APP_ROOT / r.lstrip("/")).exists() for r in referenced), "every file index.html references exists")
    t.check(all(r in assets for r in referenced if r.endswith(".js") or r.endswith(".css")), "every script/style index.html loads is precached")

    # Relative imports between modules: the file must exist and be precached.
    problems = []
    for module in (APP_ROOT / "app").glob("*.js"):
        for target in re.findall(r"from '\./([A-Za-z0-9_.-]+\.js)(?:\?[^']*)?'", module.read_text(encoding="utf-8")):
            if not (APP_ROOT / "app" / target).exists():
                problems.append(f"{module.name} imports missing {target}")
            elif f"/app/{target}" not in assets:
                problems.append(f"{module.name} imports {target}, which is not precached")
    t.check(not problems, "module imports resolve and are precached", "; ".join(problems))

    t.suite("static: server")
    try:
        with tempfile.TemporaryDirectory() as tmp:
            py_compile.compile(str(APP_ROOT / "server.py"), cfile=str(Path(tmp) / "server.pyc"), doraise=True)
        t.check(True, "server.py compiles")
    except py_compile.PyCompileError as error:
        t.check(False, "server.py compiles", str(error))
