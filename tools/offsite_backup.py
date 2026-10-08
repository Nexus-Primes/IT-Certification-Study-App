"""Copy your study progress and a full copy of the code history to a folder on another disk.

    python tools/offsite_backup.py E:/Backups/CertStudy            write one verified zip there
    python tools/offsite_backup.py E:/Backups/CertStudy --dry-run  show what would be copied, write nothing
    python tools/offsite_backup.py <folder> --keep 12 --no-files   keep the 12 newest zips; leave user-supplied PDFs out
    python tools/offsite_backup.py <folder> --allow-same-disk      for a cloud-synced folder (OneDrive) that lives on this disk

What goes in the zip: data/progress*.json and data/profiles.json (the PIN registry), everything in backup/, everything
in files/ (unless --no-files), and code.bundle, a `git bundle` of every branch, because this repository has no remote.
The app itself is never modified. The only thing deleted is an older offsite zip in the destination, found by its own
file name, once more than --keep of them exist.

To restore: unzip, stop the study server, copy the data/ and backup/ files back into the app folder, and run
`git clone code.bundle study-app` to get the code and its history.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
NAME = re.compile(r'^cert-study-offsite-\d{4}-\d{2}-\d{2}_\d{6}\.zip$')
PROGRESS = re.compile(r'^progress(-[A-Za-z0-9]+)?\.json$')


def personal_files(root, include_files=True):
    """(name inside the zip, absolute path) for every personal file that exists."""
    found = []
    data = os.path.join(root, 'data')
    if os.path.isdir(data):
        for name in sorted(os.listdir(data)):
            if name == 'profiles.json' or PROGRESS.match(name):
                found.append((f'data/{name}', os.path.join(data, name)))
    for folder in ('backup',) + (('files',) if include_files else ()):
        for dirpath, _dirs, names in os.walk(os.path.join(root, folder)):
            for name in sorted(names):
                full = os.path.join(dirpath, name)
                found.append((os.path.relpath(full, root).replace(os.sep, '/'), full))
    return found


def app_version(root):
    try:
        text = open(os.path.join(root, 'app', 'app.js'), encoding='utf-8').read()
        return re.search(r"APP_VERSION = '(v\d+)'", text).group(1)
    except (OSError, AttributeError):
        return 'unknown'


def make_bundle(root, target):
    """Write a git bundle of every branch to target. Returns an explanation if it could not."""
    if not os.path.isdir(os.path.join(root, '.git')):
        return 'no .git folder, so no code history was included'
    try:
        done = subprocess.run(['git', '-C', root, 'bundle', 'create', target, '--all'], capture_output=True, text=True)
    except OSError:
        return 'git is not installed, so no code history was included'
    if done.returncode != 0:
        return 'git bundle failed: ' + (done.stderr.strip().splitlines() or ['unknown error'])[-1]
    return None


def inside(folder, path):
    try:
        return os.path.commonpath([folder, path]) == folder
    except ValueError:                      # different drives (Windows) cannot be nested
        return False


def same_disk(a, b):
    while not os.path.exists(b):            # the destination folder may not exist yet; its nearest existing parent decides
        b = os.path.dirname(b)
    return os.stat(a).st_dev == os.stat(b).st_dev


def make_backup(root, dest, keep=8, include_files=True, dry_run=False, allow_same_disk=False, now=None):
    """Create the zip. Returns a dict describing what happened; raises ValueError for an unsafe destination."""
    root, dest = os.path.abspath(root), os.path.abspath(dest)
    if inside(root, dest):
        raise ValueError('the destination is inside the app folder, so it would not protect anything')
    if not os.path.isdir(os.path.dirname(dest)):
        raise ValueError(f'the folder {os.path.dirname(dest)} does not exist')
    if same_disk(root, dest) and not allow_same_disk:
        raise ValueError('the destination is on the same disk as the app; pick another drive, or pass --allow-same-disk for a cloud-synced folder')

    now = now or datetime.datetime.now()
    files = personal_files(root, include_files)
    result = {'files': len(files), 'bytes': sum(os.path.getsize(p) for _n, p in files), 'zip': None, 'note': None, 'pruned': []}
    if dry_run:
        result['names'] = [n for n, _p in files]
        return result

    os.makedirs(dest, exist_ok=True)
    final = os.path.join(dest, now.strftime('cert-study-offsite-%Y-%m-%d_%H%M%S.zip'))
    partial = final + '.part'
    with tempfile.TemporaryDirectory() as scratch:
        bundle = os.path.join(scratch, 'code.bundle')
        result['note'] = make_bundle(root, bundle)
        entries, hashes = [], {}
        with zipfile.ZipFile(partial, 'w', zipfile.ZIP_DEFLATED) as archive:
            for name, path in files + ([('code.bundle', bundle)] if result['note'] is None else []):
                data = open(path, 'rb').read()
                hashes[name] = hashlib.sha256(data).hexdigest()
                info = zipfile.ZipInfo(name, date_time=datetime.datetime.fromtimestamp(os.path.getmtime(path)).timetuple()[:6])
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, data)
                entries.append(f'{hashes[name]}  {len(data):>10}  {name}')
            archive.writestr('MANIFEST.txt',
                             f'Cert Study offsite backup\nCreated {now:%Y-%m-%d %H:%M:%S} by app {app_version(root)}\n\n'
                             + '\n'.join(entries) + '\n\nTo restore: unzip, stop the study server, copy data/ and backup/ back into the app folder,\n'
                             'and run `git clone code.bundle study-app` for the code and its history.\n')
        # verify what was written before it replaces anything: zip integrity, then every file against the hash taken when it was read
        with zipfile.ZipFile(partial) as archive:
            if archive.testzip() is not None:
                os.remove(partial)
                raise RuntimeError('the zip failed its integrity test and was discarded')
            for name, expected in hashes.items():
                if hashlib.sha256(archive.read(name)).hexdigest() != expected:
                    os.remove(partial)
                    raise RuntimeError(f'{name} did not read back identically and the zip was discarded')
        if result['note'] is None:
            check = subprocess.run(['git', 'bundle', 'verify', bundle], capture_output=True, text=True, cwd=root)
            if check.returncode != 0:
                result['note'] = 'the code bundle did not verify: ' + (check.stderr.strip().splitlines() or ['unknown'])[-1]
    os.replace(partial, final)
    result['zip'] = final

    mine = sorted(n for n in os.listdir(dest) if NAME.match(n))
    for old in mine[:-keep] if keep > 0 else []:
        os.remove(os.path.join(dest, old))
        result['pruned'].append(old)
    return result


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('destination')
    parser.add_argument('--keep', type=int, default=8, help='how many offsite zips to keep in the destination (default 8)')
    parser.add_argument('--no-files', action='store_true', help='leave the user-supplied files/ folder (PDFs) out')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--allow-same-disk', action='store_true', help='accept a destination on this disk, such as a OneDrive folder')
    args = parser.parse_args(argv)
    try:
        result = make_backup(ROOT, args.destination, args.keep, not args.no_files, args.dry_run, args.allow_same_disk)
    except (ValueError, RuntimeError) as error:
        print('Not written:', error)
        return 2
    size = result['bytes'] / 1e6
    if args.dry_run:
        print(f'Would copy {result["files"]} files ({size:.1f} MB) plus the code history:')
        for name in result['names']:
            print('  ', name)
        return 0
    print(f'Wrote {result["zip"]}')
    print(f'  {result["files"]} files ({size:.1f} MB before compression); every file read back identically.')
    if result['note']:
        print('  Note:', result['note'])
    for name in result['pruned']:
        print('  Removed older offsite zip', name)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
