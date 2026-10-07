"""python tools/content/smoke_track.py netplus [module]  -- builds modules leniently and lists every diagram that does not fit."""
import sys

import build_track

track = sys.argv[1]
config = build_track.TRACKS[track]
names = sys.argv[2:] or config['modules']
total = 0
for name in names:
    loaded = build_track.load(config, name, lenient=True)
    if not loaded:
        continue
    _module, batch = loaded
    total += len(batch.concepts)
    print(f'{name}: {len(batch.concepts)} concepts, {len(batch.guide)} guide sections, {len(batch.objectives)} new objectives, {len(batch.errors)} diagram problems')
    for line in batch.errors:
        print('    ', line)
print(f'{total} concepts in all')
