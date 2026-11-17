"""Lists what is inside a built app.asar and fails if anything private or unwanted is in it.

    npx @electron/asar list release/win-unpacked/resources/app.asar > asar.txt
    python scripts/scan-package.py asar.txt
"""
import collections
import re
import sys

lines = [l.strip().replace("\\", "/") for l in open(sys.argv[1], encoding="utf-8", errors="replace") if l.strip()]
own = [l for l in lines if "/node_modules/" not in l]
counts = collections.Counter("/".join(l.split("/")[:3]) for l in own)
print(f"{len(lines)} entries; {len(own)} outside node_modules")
for key, n in sorted(counts.items()):
    print(f"  {n:4d}  {key}")
forbidden = re.compile(r"progress|profiles|/backup|/files/|\.lnk|/tests/|legacy|\.pdf|avatar|\.env|\.md$|\.py$|\.git", re.I)
bad = [l for l in own if forbidden.search(l)]
print("data/*.js files:", sum(1 for l in own if re.match(r"^/data/[^/]+\.js$", l)))
print("top-level:", sorted({l.split('/')[1] for l in own if l.count('/') >= 1}))
if bad:
    print("FORBIDDEN ENTRIES:", bad)
    sys.exit(1)
print("OK: no progress, profile, backup, shelf, test, markdown, python or git files in the package")
