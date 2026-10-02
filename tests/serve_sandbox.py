"""Starts a throwaway copy of the app (empty data, or --real-data for a copy of yours) and keeps it
running until you press Ctrl+C, so you can click around in it without touching your real progress.

    python tests/serve_sandbox.py [--real-data]
"""
import argparse
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.sandbox import Sandbox  # noqa: E402

parser = argparse.ArgumentParser()
parser.add_argument("--real-data", action="store_true")
args = parser.parse_args()
sandbox = Sandbox(real_data=args.real_data).start()
print(f"Sandbox running at {sandbox.url}  (Ctrl+C to stop; it is deleted on exit)", flush=True)
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    pass
finally:
    sandbox.stop()
