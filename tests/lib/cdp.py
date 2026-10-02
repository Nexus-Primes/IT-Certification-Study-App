"""A tiny Chrome DevTools Protocol client (standard library only).

Drives a headless Edge/Chrome so the suite needs no pip packages, no Node, and no Selenium.
"""
import base64
import json
import os
import shutil
import socket
import struct
import subprocess
import tempfile
import time
import urllib.request

BROWSER_CANDIDATES = [
    os.environ.get("CERTSTUDY_BROWSER", ""),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "/usr/bin/microsoft-edge", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]


def find_browser():
    for path in BROWSER_CANDIDATES:
        if path and os.path.exists(path):
            return path
    raise RuntimeError("No Edge/Chrome found. Set CERTSTUDY_BROWSER to its executable path.")


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class _WebSocket:
    def __init__(self, url):
        assert url.startswith("ws://"), url
        hostport, path = url[5:].split("/", 1)
        host, port = hostport.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=120)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall((f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
                           f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.sock.recv(4096)
        self.buf = buf.split(b"\r\n\r\n", 1)[1]

    def _read(self, n):
        while len(self.buf) < n:
            chunk = self.sock.recv(1 << 20)
            if not chunk:
                raise EOFError("browser closed the connection")
            self.buf += chunk
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def send(self, text):
        data = text.encode()
        header = bytearray([0x81])
        n = len(data)
        if n < 126:
            header.append(0x80 | n)
        elif n < 65536:
            header.append(0x80 | 126)
            header += struct.pack(">H", n)
        else:
            header.append(0x80 | 127)
            header += struct.pack(">Q", n)
        mask = os.urandom(4)
        header += mask
        self.sock.sendall(bytes(header) + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def recv(self):
        message = b""
        while True:
            b1, b2 = self._read(2)
            fin, opcode, n = b1 & 0x80, b1 & 0x0F, b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self._read(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self._read(8))[0]
            payload = self._read(n)
            if opcode in (0, 1, 2):
                message += payload
            if fin and opcode in (0, 1, 2):
                return message.decode()


class Browser:
    """One headless browser with one page. Collects JS exceptions and console errors."""

    def __init__(self, width=1280, height=900):
        self.profile = tempfile.mkdtemp(prefix="certstudy-test-")
        port = free_port()
        self.proc = subprocess.Popen(
            [find_browser(), "--headless=new", "--disable-gpu", f"--remote-debugging-port={port}",
             f"--user-data-dir={self.profile}", "--no-first-run", "--no-default-browser-check", "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        page = None
        for _ in range(80):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json"))
                page = next(t for t in tabs if t["type"] == "page")
                break
            except Exception:
                time.sleep(0.25)
        if not page:
            raise RuntimeError("Could not attach to the browser's DevTools port.")
        self.ws = _WebSocket(page["webSocketDebuggerUrl"])
        self._id = 0
        self.events = []
        self.call("Page.enable")
        self.call("Runtime.enable")
        self.resize(width, height)

    # -- protocol ---------------------------------------------------------------------------
    def call(self, method, **params):
        self._id += 1
        mid = self._id
        self.ws.send(json.dumps({"id": mid, "method": method, "params": params}))
        while True:
            message = json.loads(self.ws.recv())
            if message.get("id") == mid:
                if "error" in message:
                    raise RuntimeError(f"{method}: {message['error']}")
                return message.get("result", {})
            self.events.append(message)

    def pump(self, seconds=0.2):
        """Read pending events (exceptions, console output) without sending anything."""
        self.ws.sock.settimeout(seconds)
        try:
            while True:
                self.events.append(json.loads(self.ws.recv()))
        except (socket.timeout, TimeoutError):
            pass
        finally:
            self.ws.sock.settimeout(120)

    def resize(self, width, height):
        self.call("Emulation.setDeviceMetricsOverride", width=width, height=height, deviceScaleFactor=1, mobile=False)

    def eval(self, expression, await_promise=True):
        result = self.call("Runtime.evaluate", expression=expression, returnByValue=True, awaitPromise=await_promise)
        if "exceptionDetails" in result:
            details = result["exceptionDetails"]
            raise RuntimeError(details.get("exception", {}).get("description") or details.get("text") or str(details))
        return result["result"].get("value")

    def goto(self, url, wait=3.0):
        self.call("Page.navigate", url=url)
        time.sleep(wait)

    def wait_for(self, expression, timeout=15.0, interval=0.15):
        end = time.time() + timeout
        while time.time() < end:
            try:
                if self.eval(expression):
                    return True
            except RuntimeError:
                pass
            time.sleep(interval)
        return False

    def press(self, key, code=None, vk=0, modifiers=0):
        for kind in ("keyDown", "keyUp"):
            self.call("Input.dispatchKeyEvent", type=kind, key=key, code=code or key, windowsVirtualKeyCode=vk, modifiers=modifiers)

    def emulate_media(self, media):
        self.call("Emulation.setEmulatedMedia", media=media)

    def pdf(self, path):
        result = self.call("Page.printToPDF", printBackground=True, preferCSSPageSize=True, displayHeaderFooter=False)
        with open(path, "wb") as f:
            f.write(base64.b64decode(result["data"]))
        return path

    def errors(self):
        """JS exceptions and console.error calls seen so far (after a short drain)."""
        self.pump(0.3)
        found = []
        for event in self.events:
            if event.get("method") == "Runtime.exceptionThrown":
                d = event["params"]["exceptionDetails"]
                found.append("exception: " + (d.get("exception", {}).get("description") or d.get("text", "")).splitlines()[0])
            elif event.get("method") == "Runtime.consoleAPICalled" and event["params"].get("type") == "error":
                found.append("console.error: " + " ".join(str(a.get("value", a.get("description", ""))) for a in event["params"]["args"])[:200])
        return found

    def close(self):
        try:
            self.call("Browser.close")
        except Exception:
            pass
        try:
            self.proc.wait(timeout=10)
        except Exception:
            self.proc.kill()
        shutil.rmtree(self.profile, ignore_errors=True)
