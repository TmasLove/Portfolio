#!/usr/bin/env python3
"""Tell search engines which pages just changed, through IndexNow.

Bing (and Yandex, Seznam, Naver) read IndexNow; Google does not. Without it, Bing only notices a
change whenever it next gets around to the sitemap, which for a small site with few inbound links
can be weeks.

Run by the Publish workflow after every deploy. It works out which pages a push changed and
submits only those, so a one-line edit does not resubmit the whole site:

  site/index.html            -> https://tommyroldan.com/
  site/about/index.html      -> https://tommyroldan.com/about/
  site/privacy.html          -> https://tommyroldan.com/privacy.html
  shell.js, *.css, other js  -> the homepage, since they change what the desktop shows

Anything not in the sitemap is dropped, so redirect stubs and noindex pages are never sent.

  python3 scripts/indexnow.py --all                  submit every page in the sitemap
  python3 scripts/indexnow.py --before A --after B   submit what changed between two commits
  add --dry-run to print the list without sending anything

It never fails the deploy: problems are printed and it exits 0.
"""
import argparse, json, re, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

HOST = "tommyroldan.com"
BASE = f"https://{HOST}"
ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
ENDPOINT = "https://api.indexnow.org/indexnow"


def find_key():
    # the key file is named after the key and contains exactly the key
    for p in SITE.glob("*.txt"):
        if re.fullmatch(r"[0-9a-f]{32}", p.stem) and p.read_text().strip() == p.stem:
            return p.stem
    return None


def sitemap_urls():
    return re.findall(r"<loc>([^<]+)</loc>", (SITE / "sitemap.xml").read_text())


def changed_files(before, after):
    out = subprocess.run(["git", "diff", "--name-only", before, after, "--", "site/"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return [l for l in out.splitlines() if l]


def to_url(path):
    rel = path[len("site/"):]
    if rel == "index.html":
        return BASE + "/"
    if rel.endswith("/index.html"):
        return f"{BASE}/{rel[:-len('index.html')]}"
    if rel.endswith(".html"):
        return f"{BASE}/{rel}"
    if rel.endswith((".js", ".css")) and "/" not in rel:
        return BASE + "/"          # the desktop shell itself
    return None                    # images, fonts, the arena game's files, etc.


def wait_for(url, seconds):
    # GitHub Pages goes live a little after the gh-pages push; IndexNow checks the key file
    deadline = time.time() + seconds
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                if r.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(10)
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--before")
    ap.add_argument("--after")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    key = find_key()
    if not key:
        print("indexnow: no key file in site/, skipping"); return
    known = sitemap_urls()

    if a.all or not a.before or set(a.before) == {"0"}:
        urls = known
    else:
        try:
            files = changed_files(a.before, a.after or "HEAD")
        except subprocess.CalledProcessError as e:
            print("indexnow: could not diff, submitting everything:", e.stderr.strip()); files = None
        if files is None:
            urls = known
        else:
            mapped = {u for u in map(to_url, files) if u}
            urls = [u for u in known if u in mapped]

    if not urls:
        print("indexnow: no indexable pages changed"); return
    print(f"indexnow: {len(urls)} url(s)"); [print("  ", u) for u in urls]
    if a.dry_run:
        return

    key_url = f"{BASE}/{key}.txt"
    if not wait_for(key_url, 300):
        print("indexnow: key file never came live at", key_url, "- skipping"); return

    body = json.dumps({"host": HOST, "key": key, "keyLocation": key_url, "urlList": urls}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"indexnow: HTTP {r.status} (200 = accepted, 202 = accepted, key check pending)")
    except urllib.error.HTTPError as e:
        meaning = {400: "bad request", 403: "key not valid", 422: "urls do not match the host",
                   429: "too many requests"}.get(e.code, "")
        print(f"indexnow: HTTP {e.code} {meaning}")
    except Exception as e:
        print("indexnow: request failed:", e)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:   # never fail the deploy over this
        print("indexnow: unexpected error:", e)
    sys.exit(0)
