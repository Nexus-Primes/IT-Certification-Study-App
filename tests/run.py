"""Cert Study smoke tests.

    python tests/run.py                 run everything
    python tests/run.py static pages    run only these groups
    python tests/run.py --real-data     start the sandbox from a COPY of your real progress (never touches the original)

Everything runs against a throwaway copy of the app on a free port with its own data, so the live
study server and your real progress are never involved. Needs Python 3.9+ and Edge or Chrome
(set CERTSTUDY_BROWSER to its path if it is not found). PyMuPDF (`pip install pymupdf`) is optional;
without it the print checks only confirm that a PDF is produced.
"""
import argparse
import importlib
import os
import sys
import time
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from lib.cdp import Browser  # noqa: E402
from lib.framework import Reporter  # noqa: E402
from lib.sandbox import Sandbox  # noqa: E402

GROUPS = ["static", "server", "pages", "print", "interactions", "flows", "study", "surfaces", "content"]
MODULES = {"static": "static_checks", "server": "server_checks", "pages": "pages", "print": "print_checks", "interactions": "interactions", "flows": "flows", "study": "study", "surfaces": "surfaces", "content": "content"}


class Context:
    def __init__(self, real_data):
        self.t = Reporter()
        self.real_data = real_data
        self._sandboxes = []
        self._browsers = []

    def fresh_sandbox(self, seed=None):
        sandbox = Sandbox(real_data=self.real_data).start()
        self._sandboxes.append(sandbox)
        return sandbox

    def browser(self, width=1280, height=900):
        browser = Browser(width, height)
        self._browsers.append(browser)
        return browser

    def release(self):
        for browser in self._browsers:
            browser.close()
        for sandbox in self._sandboxes:
            sandbox.stop()
        self._browsers, self._sandboxes = [], []


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("groups", nargs="*", choices=GROUPS + [[]], help="groups to run (default: all)")
    parser.add_argument("--real-data", action="store_true", help="start from a copy of the real progress files")
    args = parser.parse_args()
    groups = args.groups or GROUPS

    started = time.time()
    ctx = Context(args.real_data)
    for group in groups:
        try:
            module = importlib.import_module(f"checks.{MODULES[group]}")
            module.run(ctx)
        except Exception:
            ctx.t.failed.append(f"{group}: crashed")
            print(f"\n  FAIL  {group} crashed:\n" + traceback.format_exc())
        finally:
            ctx.release()
    ok = ctx.t.summary()
    print(f"({time.time() - started:.0f}s)")
    for warning in ctx.t.warnings:
        print("  warning:", warning)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
