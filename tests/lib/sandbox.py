"""An isolated copy of the app on its own port, so tests never touch the real study data."""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

from .cdp import free_port

APP_ROOT = Path(__file__).resolve().parents[2]  # .../study-app


class Sandbox:
    def __init__(self, real_data=False):
        self.real_data = real_data
        self.dir = Path(tempfile.mkdtemp(prefix="certstudy-sandbox-"))
        self.port = free_port()
        self.proc = None
        self._copy_code()
        self.reset_data()

    @property
    def url(self):
        # 127.0.0.1, not "localhost": on Windows, resolving "localhost" tries IPv6 first and each
        # request then waits ~2 seconds for it to fail, which made the quick checks take over a minute.
        return f"http://127.0.0.1:{self.port}"

    # -- setup ------------------------------------------------------------------------------
    def _copy_code(self):
        for name in ("app", "assets"):
            shutil.copytree(APP_ROOT / name, self.dir / name)
        (self.dir / "data").mkdir()
        for js in (APP_ROOT / "data").glob("*.js"):
            shutil.copy(js, self.dir / "data" / js.name)
        for name in ("service-worker.js", "manifest.webmanifest"):
            shutil.copy(APP_ROOT / name, self.dir / name)
        source = (APP_ROOT / "server.py").read_text(encoding="utf-8")
        source = re.sub(r"^PORT = \d+", f"PORT = {self.port}", source, flags=re.M)
        source = source.replace("webbrowser.open(url)", "pass")
        (self.dir / "server.py").write_text(source, encoding="utf-8")

    def reset_data(self):
        """Back to the starting data (empty, or a copy of the real files with --real-data)."""
        data = self.dir / "data"
        for f in data.glob("progress*.json"):
            f.unlink()
        for f in data.glob("avatar*.jpg"):
            f.unlink()
        for f in data.glob("profiles.json"):
            f.unlink()
        shutil.rmtree(self.dir / "backup", ignore_errors=True)
        if self.real_data:
            for name in ("progress.json", "profiles.json"):
                if (APP_ROOT / "data" / name).exists():
                    shutil.copy(APP_ROOT / "data" / name, data / name)

    def start(self):
        self.proc = subprocess.Popen([sys.executable, "server.py"], cwd=self.dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(60):
            try:
                urllib.request.urlopen(self.url + "/app/index.html", timeout=2).read(1)
                return self
            except Exception:
                time.sleep(0.25)
        raise RuntimeError("The sandbox server did not start.")

    def pause(self):
        """Stops just the server (data and port are kept) — to see how the app behaves when it goes away."""
        if self.proc:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=10)
            except Exception:
                self.proc.kill()
            self.proc = None

    def resume(self):
        return self.start()

    def stop(self):
        if self.proc:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=10)
            except Exception:
                self.proc.kill()
        shutil.rmtree(self.dir, ignore_errors=True)

    # -- helpers ----------------------------------------------------------------------------
    def get_json(self, path):
        return json.load(urllib.request.urlopen(self.url + path))

    def post_json(self, path, body):
        request = urllib.request.Request(self.url + path, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}, method="POST")
        return json.load(urllib.request.urlopen(request))

    def progress(self, profile="default"):
        return self.get_json(f"/api/progress?profile={profile}")
