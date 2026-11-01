#!/usr/bin/env python3
"""Serve this site on your own computer the way GitHub Pages does, and reload the
browser whenever a file changes.

    python3 tools/serve.py          # then open http://localhost:8000
    python3 tools/serve.py 8080     # use another port

Like GitHub Pages: a folder serves its index.html, "/policy" redirects to
"/policy/", and any address with no file behind it gets 404.html with status 404,
so http://localhost:8000/XFETYZ behaves as https://codes.petermgrund.com/XFETYZ
will. Unlike GitHub Pages: each HTML page gets a small script that reloads it when
you save a file. Standard library only; press Ctrl-C to stop.
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RELOAD_SCRIPT = (
    b"<script>(function () { let seen = null; setInterval(async () => {"
    b" try { const r = await fetch('/__changed', { cache: 'no-store' });"
    b" const t = await r.text(); if (seen !== null && t !== seen) location.reload();"
    b" seen = t; } catch (e) {} }, 700); })();</script>"
)


def latest_change() -> str:
    newest = 0.0
    for folder, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d != ".git"]
        for name in files:
            try:
                newest = max(newest, os.path.getmtime(os.path.join(folder, name)))
            except OSError:
                pass
    return str(newest)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path, _, query = self.path.partition("?")
        path = path.split("#", 1)[0]
        if path == "/__changed":
            return self.reply(200, latest_change().encode(), "text/plain")
        target = self.translate_path(path)
        if os.path.isdir(target):
            if not path.endswith("/"):
                self.send_response(301)
                self.send_header("Location", path + "/" + ("?" + query if query else ""))
                self.end_headers()
                return None
            target = os.path.join(target, "index.html")
        status = 200
        if not os.path.isfile(target):
            target, status = os.path.join(ROOT, "404.html"), 404
        with open(target, "rb") as fh:
            body = fh.read()
        ctype = self.guess_type(target)
        if ctype == "text/html":
            body = body.replace(b"</body>", RELOAD_SCRIPT + b"</body>", 1)
        return self.reply(status, body, ctype)

    def reply(self, status, body, ctype):
        self.send_response(status)
        charset = "; charset=utf-8" if ctype.startswith("text/") else ""
        self.send_header("Content-Type", ctype + charset)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        if "/__changed" not in str(args[0] if args else ""):
            super().log_message(fmt, *args)


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    base = f"http://localhost:{port}"
    print(f"Serving {ROOT} at {base}  (Ctrl-C to stop)")
    print(f"Try: {base}/   {base}/XFETYZ   {base}/xfe-tyz/   {base}/XFETYZ_v01.jpg")
    print(f"     {base}/a000277   {base}/B2.C3.F1   {base}/JYMZ   {base}/policy/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
