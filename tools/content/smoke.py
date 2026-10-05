"""python tools/content/smoke.py c2d2   -- builds a domain leniently and lists every diagram that does not fit."""
import importlib
import sys

import build_core2
import spec

domain = sys.argv[1]
batch = spec.Batch(domain, lenient=True)
for name in build_core2.MODULES[domain]:
    try:
        importlib.import_module(name).build(batch)
    except ModuleNotFoundError as error:
        if error.name != name:
            raise
print(f'{len(batch.concepts)} concepts, {len(batch.guide)} guide sections, {len(batch.objectives)} new objectives, {len(batch.errors)} diagram problems')
for line in batch.errors:
    print('  ', line)
