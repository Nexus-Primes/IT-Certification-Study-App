#!/usr/bin/env python3
"""
Cert Study App - local server
Run with:  python server.py
Then open: http://localhost:8420
No internet connection is used; everything is served from this machine.
"""

import base64
import binascii
import hashlib
import http.server
import json
import os
import re
import secrets
import threading
import time
import webbrowser
from urllib.parse import urlparse, parse_qs

PORT = 8420
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
PROGRESS_FILE = os.path.join(DATA_DIR, "progress.json")
BACKUP_DIR = os.path.join(ROOT, "backup")
AVATAR_FILE = os.path.join(DATA_DIR, "avatar.jpg")
PROFILES_FILE = os.path.join(DATA_DIR, "profiles.json")
# The very first account this app ever had. Its data stays in the original progress.json /
# avatar.jpg paths forever, byte-for-byte unchanged by the multi-account feature below — every
# other account gets its own new, separate file instead of any of this one being touched, moved,
# or migrated.
DEFAULT_PROFILE_ID = "default"
progress_lock = threading.Lock()

# Mirrors a handful of app.js's own iconPaths entries — kept as a small, deliberately-duplicated
# copy rather than a shared file, since it's just 6 path strings and this is a different runtime
# (Python here, JS there) than the in-app icon() renderer.
ICON_SHAPE_PATHS = {
    "cap": '<path d="M21.42 10.92a1 1 0 0 0-.02-1.83L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.9a2 2 0 0 0 1.66 0l8.59-3.9Z"/><path d="M22 10v6"/><path d="M6 12.5V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-3.5"/>',
    "book": '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    "bolt": '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>',
    "brain": '<path d="M9.5 4A3 3 0 0 0 4 5.7 3 3 0 0 0 3.5 11 3.5 3.5 0 0 0 6 17a3 3 0 0 0 3.5 3V4ZM14.5 4A3 3 0 0 1 20 5.7a3 3 0 0 1 .5 5.3 3.5 3.5 0 0 1-2.5 6 3 3 0 0 1-3.5 3V4ZM9.5 9H7M14.5 9H17M9.5 14H7M14.5 14H17"/>',
    "trophy": '<path d="M8 3h8v5a4 4 0 0 1-8 0V3Z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6"/>',
}

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(PROGRESS_FILE):
    with open(PROGRESS_FILE, "w") as f:
        json.dump({}, f)

profiles_lock = threading.Lock()


def _read_json_file(path, fallback):
    # Same tolerance the progress endpoints already use: a missing or half-written file reads
    # back as the fallback rather than 500ing, and the on-disk file is left untouched either way.
    try:
        with open(path, "r") as f:
            data = json.load(f)
        return data
    except (json.JSONDecodeError, OSError):
        return fallback


def _default_registry():
    # First run: the account already sitting in progress.json (real practice history, real
    # name) becomes the "default" account named Chandler — nothing about that file moves,
    # renames, or changes shape; this registry entry is purely a new pointer at it.
    return {"pinHash": None, "profiles": [{"id": DEFAULT_PROFILE_ID, "name": "Chandler", "createdAt": None}]}


def load_registry():
    registry = _read_json_file(PROFILES_FILE, None)
    if isinstance(registry, list) and registry:
        # Pre-PIN-feature shape was a bare list — wrap it once and persist the new shape rather
        # than re-migrating on every single read.
        registry = {"pinHash": None, "profiles": registry}
        save_registry(registry)
        return registry
    if isinstance(registry, dict) and isinstance(registry.get("profiles"), list) and registry["profiles"]:
        registry.setdefault("pinHash", None)
        return registry
    registry = _default_registry()
    save_registry(registry)
    return registry


def save_registry(registry):
    with open(PROFILES_FILE, "w") as f:
        json.dump(registry, f, indent=2)


def hash_pin(pin):
    return hashlib.sha256(pin.encode("utf-8")).hexdigest()


def resolve_profile_id(requested_id):
    # Never trust a client-supplied id as a filename ingredient directly — only an id that's
    # actually present in the registry (ids are server-generated at creation time, see
    # POST /api/profiles) is allowed through; anything else silently falls back to the default
    # account rather than risking a path built from an arbitrary string.
    with profiles_lock:
        profiles = load_registry()["profiles"]
    if requested_id and any(p.get("id") == requested_id for p in profiles):
        return requested_id
    return DEFAULT_PROFILE_ID


def progress_path_for(profile_id):
    if profile_id == DEFAULT_PROFILE_ID:
        return PROGRESS_FILE
    return os.path.join(DATA_DIR, f"progress-{profile_id}.json")


def avatar_path_for(profile_id):
    if profile_id == DEFAULT_PROFILE_ID:
        return AVATAR_FILE
    return os.path.join(DATA_DIR, f"avatar-{profile_id}.jpg")


class Handler(http.server.SimpleHTTPRequestHandler):
    # A cold page load fires ~15 concurrent requests (every deferred <script>, the
    # stylesheet, the manifest) and the service worker's install-time cache.addAll()
    # fetches another ~15 on top of that, plus its own per-navigation script re-fetch —
    # 30+ near-simultaneous connections. The default HTTP/1.0 (one TCP connection per
    # request, closed after each response) forced the OS to accept and tear down that
    # many sockets at once, and occasionally lost one with a raw connection reset —
    # which Chrome surfaces as "An unknown error occurred when fetching the script"
    # whenever the lost request happened to be the service worker's own script fetch.
    # HTTP/1.1 keep-alive lets the browser reuse one connection for many requests
    # instead of opening a new one each time, cutting the concurrent-connection burst
    # down to a handful.
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # This is a local dev server for files that change often during development;
        # without this, browsers happily cache HTML/CSS/JS and silently serve stale
        # versions after an edit. no-cache forces revalidation on every request.
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _send_json(self, obj, status=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        if path == "/api/profiles":
            with profiles_lock:
                registry = load_registry()
            # The hash itself never leaves the server — the client only ever needs to know
            # whether switching is currently PIN-gated at all.
            return self._send_json({"profiles": registry["profiles"], "defaultId": DEFAULT_PROFILE_ID, "hasPin": bool(registry.get("pinHash"))})
        if path == "/api/app-icon.svg":
            profile_id = resolve_profile_id((query.get("profile") or [None])[0])
            # Read-only, no lock contention concerns worth guarding here the way writes need —
            # a stale read during a concurrent write just means this particular icon request
            # sees the previous choice for one request, not a corrupted file.
            with progress_lock:
                data = _read_json_file(progress_path_for(profile_id), {})
                if not isinstance(data, dict):
                    data = {}
            meta = data.get("app-meta") if isinstance(data.get("app-meta"), dict) else {}
            # Both values come from client-saved progress.json and get embedded directly into
            # server-generated SVG/XML below — whitelist the shape and regex-validate the color
            # first, same discipline as every other client-influenced value this server touches
            # before it reaches a filesystem path or, here, raw markup output.
            shape = meta.get("appIconShape")
            if shape not in ICON_SHAPE_PATHS:
                shape = "cap"
            color = meta.get("appIconColor")
            if not isinstance(color, str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
                color = "#2dd4bf"
            svg = (
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
                f'<rect width="64" height="64" rx="14" fill="{color}"/>'
                '<g transform="translate(16,16) scale(1.3333)" fill="none" stroke="#ffffff" '
                'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
                f'{ICON_SHAPE_PATHS[shape]}</g></svg>'
            )
            body = svg.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/progress":
            profile_id = resolve_profile_id((query.get("profile") or [None])[0])
            # Tolerate a corrupt / half-written file the same way do_POST does and the
            # client already does — return an empty blob rather than a 500 so the app
            # still loads (the on-disk file is left untouched for manual recovery).
            with progress_lock:
                data = _read_json_file(progress_path_for(profile_id), {})
                if not isinstance(data, dict):
                    data = {}
            return self._send_json(data)
        if path == "/":
            self.path = "/app/index.html"
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/profiles":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            name = (incoming.get("name") or "").strip() if isinstance(incoming, dict) else ""
            if not name:
                return self._send_json({"error": "name is required"}, 400)
            name = name[:40]
            # The id is server-generated (never taken from client input) specifically so it's
            # always safe to build a filename from later — resolve_profile_id() only trusts an
            # id that's actually in this registry, and this is the only place new ones are added.
            profile_id = f"p{secrets.token_hex(6)}"
            record = {"id": profile_id, "name": name, "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
            with profiles_lock:
                registry = load_registry()
                registry["profiles"].append(record)
                save_registry(registry)
            # Pre-create an empty progress file so the new account's data lives on disk from the
            # moment it exists, rather than only appearing lazily on its first save.
            with progress_lock:
                if not os.path.exists(progress_path_for(profile_id)):
                    with open(progress_path_for(profile_id), "w") as f:
                        json.dump({}, f)
            return self._send_json({"ok": True, "profile": record})
        if path == "/api/profiles/delete":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            profile_id = incoming.get("id") if isinstance(incoming, dict) else None
            if profile_id == DEFAULT_PROFILE_ID:
                return self._send_json({"error": "the default account can't be removed"}, 400)
            with profiles_lock:
                registry = load_registry()
                remaining = [p for p in registry["profiles"] if p.get("id") != profile_id]
                if len(remaining) == len(registry["profiles"]):
                    return self._send_json({"error": "no such account"}, 404)
                # Deliberately does not delete the account's progress/avatar files — only removes
                # it from the switcher. A mistaken removal stays recoverable by hand rather than
                # being an unrecoverable data-loss action, same spirit as the rest of this app's
                # undo-covered destructive actions.
                registry["profiles"] = remaining
                save_registry(registry)
            return self._send_json({"ok": True})
        if path == "/api/profiles/verify-pin":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            pin = incoming.get("pin") if isinstance(incoming, dict) else None
            with profiles_lock:
                registry = load_registry()
            pin_hash = registry.get("pinHash")
            if not pin_hash:
                return self._send_json({"ok": True})
            ok = isinstance(pin, str) and secrets.compare_digest(hash_pin(pin), pin_hash)
            return self._send_json({"ok": ok})
        if path == "/api/profiles/set-pin":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            if not isinstance(incoming, dict):
                return self._send_json({"error": "expected a JSON object"}, 400)
            new_pin = incoming.get("pin")
            current_pin = incoming.get("currentPin")
            if new_pin is not None and not re.fullmatch(r"\d{4,8}", str(new_pin)):
                return self._send_json({"error": "PIN must be 4-8 digits"}, 400)
            with profiles_lock:
                registry = load_registry()
                existing_hash = registry.get("pinHash")
                # Changing or removing an already-set PIN requires proving you know the current
                # one first — otherwise anyone at the switcher could clear someone else's lock
                # without ever guessing it. Setting a PIN for the first time needs no prior proof.
                if existing_hash:
                    if not (isinstance(current_pin, str) and secrets.compare_digest(hash_pin(current_pin), existing_hash)):
                        return self._send_json({"error": "current PIN is incorrect"}, 403)
                registry["pinHash"] = hash_pin(str(new_pin)) if new_pin else None
                save_registry(registry)
            return self._send_json({"ok": True, "hasPin": bool(registry["pinHash"])})
        if path == "/api/progress":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            if not isinstance(incoming, dict) or "key" not in incoming or "value" not in incoming:
                return self._send_json({"error": "expected {key, value}"}, 400)
            profile_id = resolve_profile_id(incoming.get("profile"))
            target = progress_path_for(profile_id)
            # Merge just this cert's key into the freshest on-disk copy instead of
            # overwriting the whole file, so two tracks (or two tabs) saving around
            # the same time can't clobber each other's progress. The lock keeps this
            # read-modify-write atomic now that the server handles requests concurrently.
            with progress_lock:
                existing = _read_json_file(target, {})
                if not isinstance(existing, dict):
                    existing = {}
                existing[incoming["key"]] = incoming["value"]
                with open(target, "w") as f:
                    json.dump(existing, f, indent=2)
            return self._send_json({"ok": True})
        if path == "/api/backup":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            if not isinstance(incoming, dict):
                return self._send_json({"error": "expected a JSON object"}, 400)
            date_key = incoming.get("dateKey")
            if not isinstance(date_key, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date_key):
                return self._send_json({"error": "expected dateKey as YYYY-MM-DD"}, 400)
            # version comes from the client's own APP_VERSION — strip it down to filename-safe
            # characters before touching the filesystem with it, same reasoning as validating
            # date_key above: this string ends up in a path, so it can't be trusted as-is.
            version = re.sub(r"[^A-Za-z0-9.-]+", "", str(incoming.get("version") or "")) or "unknown"
            profile_id = resolve_profile_id(incoming.get("profile"))
            # The default account's backup filename is unchanged from before multi-account
            # support existed — only a non-default account gets an extra id segment, so existing
            # backups and any tooling around their naming keep working exactly as before.
            filename = (
                f"cert-study-backup-{version}-{date_key}.json"
                if profile_id == DEFAULT_PROFILE_ID
                else f"cert-study-backup-{profile_id}-{version}-{date_key}.json"
            )
            os.makedirs(BACKUP_DIR, exist_ok=True)
            with open(os.path.join(BACKUP_DIR, filename), "w") as f:
                json.dump(incoming, f, indent=2)
            return self._send_json({"ok": True, "filename": filename})
        if path == "/api/avatar":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            try:
                incoming = json.loads(raw)
            except json.JSONDecodeError:
                return self._send_json({"error": "bad json"}, 400)
            if not isinstance(incoming, dict) or "dataUrl" not in incoming:
                return self._send_json({"error": "expected {dataUrl}"}, 400)
            avatar_file = avatar_path_for(resolve_profile_id(incoming.get("profile")))
            data_url = incoming["dataUrl"]
            if data_url is None:
                if os.path.exists(avatar_file):
                    os.remove(avatar_file)
                return self._send_json({"ok": True})
            # The client always sends a JPEG it already downscaled to a small square, and the
            # only variable part of the target filename (the profile id) is server-generated and
            # registry-checked by resolve_profile_id() above — no path-traversal surface here.
            prefix = "data:image/jpeg;base64,"
            if not isinstance(data_url, str) or not data_url.startswith(prefix):
                return self._send_json({"error": "expected a data:image/jpeg;base64 URL"}, 400)
            try:
                image_bytes = base64.b64decode(data_url[len(prefix):], validate=True)
            except (binascii.Error, ValueError):
                return self._send_json({"error": "bad base64"}, 400)
            # The client already downscaled to ~160px square before sending; this cap is a
            # sanity backstop against a malformed/oversized payload, not the normal path.
            if len(image_bytes) > 1_000_000:
                return self._send_json({"error": "image too large"}, 400)
            with open(avatar_file, "wb") as f:
                f.write(image_bytes)
            return self._send_json({"ok": True})
        self.send_response(404)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, format, *args):
        pass  # keep the console quiet


class Server(http.server.ThreadingHTTPServer):
    # Default TCP listen backlog is 5 -- too small for the concurrent-connection burst
    # a cold page load produces (see the protocol_version comment on Handler above).
    # Raised well past what this app ever actually needs, as cheap insurance.
    request_queue_size = 128


if __name__ == "__main__":
    # Threaded so one slow or half-open connection can't block every other request —
    # the original single-threaded server would occasionally wedge and stop responding.
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Cert Study App running at {url}")
        print("Press Ctrl+C to stop.")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
