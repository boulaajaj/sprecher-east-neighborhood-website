"""Post-process a CodeCohesion viewer build for this repo and pack it into one page.

Usage:
    python scripts/codecohesion-pack.py <codecohesion-out dir> [--repo NAME] [--fragment PATH]

Run it after copying the upstream viewer build (dist/) and the processor's JSON
into <codecohesion-out dir>. It is idempotent, so re-running on an already
processed folder is safe. Steps:

1. index.html: apply small fixes on top of the upstream markup — add
   rel="noopener noreferrer" to target="_blank" links, replace the nested
   <label class="toggle-switch"> wrappers (invalid HTML) with <span>, and
   normalize line endings.
2. JSON data: set "repositoryPath" to the repo name so no local machine path
   is committed, write the files compactly, and write data/repos.json.
3. standalone.html: inline the JS bundle and all JSON with a fetch() shim so
   the page opens from file:// with no server.

--fragment writes an extra body-only copy (no doctype/html/head/body wrappers)
for hosts that wrap the page themselves.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

DEFAULT_REPO = "sprecher-east-neighborhood-website"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="codecohesion-pack.py",
        description="Post-process and pack a CodeCohesion viewer build (see module docstring).",
    )
    parser.add_argument("out_dir", type=Path, help="folder holding index.html, assets/, data/ and codecohesion/data/")
    parser.add_argument("--repo", default=DEFAULT_REPO, help=f"repo name used in the data files (default: {DEFAULT_REPO})")
    parser.add_argument("--fragment", type=Path, default=None, help="also write a body-only HTML fragment to this path")
    return parser.parse_args(argv)


def fix_index_html(index_path: Path) -> list[str]:
    """Apply the upstream-markup fixes in place. Returns a list of what changed."""
    html = index_path.read_text(encoding="utf-8")
    changes: list[str] = []

    normalized = html.replace("\r\n", "\n").replace("\r", "")
    if normalized != html:
        changes.append("normalized line endings")
    html = normalized

    def add_rel(match: re.Match[str]) -> str:
        tag = match.group(0)
        if "rel=" in tag:
            return tag
        return tag[:-1] + ' rel="noopener noreferrer">'

    fixed, n = re.subn(r'<a\b[^>]*target="_blank"[^>]*>', add_rel, html)
    if n and fixed != html:
        changes.append(f'added rel="noopener noreferrer" to {n} target="_blank" link(s)')
    html = fixed

    pattern = re.compile(
        r'<label class="toggle-switch">(\s*<input[^>]*>\s*<span class="toggle-slider"></span>\s*)</label>'
    )
    fixed, n = pattern.subn(r'<span class="toggle-switch">\1</span>', html)
    if n:
        changes.append(f'replaced {n} nested <label class="toggle-switch"> with <span>')
    html = fixed
    html = html.replace("label.toggle-switch", ".toggle-switch")

    index_path.write_text(html, encoding="utf-8", newline="\n")
    return changes


def fix_json_data(out_dir: Path, repo: str) -> list[str]:
    changes: list[str] = []
    for path in sorted(out_dir.rglob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "repositoryPath" in data and data.get("repositoryPath") != repo:
            data["repositoryPath"] = repo
            changes.append(f"{path.relative_to(out_dir)}: repositoryPath -> {repo}")
        path.write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False), encoding="utf-8", newline="\n")
    repos_path = out_dir / "data" / "repos.json"
    repos_path.parent.mkdir(parents=True, exist_ok=True)
    repos_path.write_text(json.dumps({"repos": [repo]}, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    changes.append("wrote data/repos.json")
    return changes


def js_json(obj: object) -> str:
    text = json.dumps(obj, separators=(",", ":"), ensure_ascii=False)
    return text.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def build_standalone(out_dir: Path, repo: str, fragment_path: Path | None) -> None:
    html = (out_dir / "index.html").read_text(encoding="utf-8")
    bundles = sorted((out_dir / "assets").glob("*.js"))
    if len(bundles) != 1:
        sys.exit(f"error: expected exactly one JS bundle in {out_dir / 'assets'}, found {len(bundles)}")
    bundle = bundles[0].read_text(encoding="utf-8")

    data_dir = out_dir / "data"
    coupling_dir = out_dir / "codecohesion" / "data"
    data = {
        "data/repos.json": json.loads((data_dir / "repos.json").read_text(encoding="utf-8")),
        f"data/{repo}.json": json.loads((data_dir / f"{repo}.json").read_text(encoding="utf-8")),
        f"data/{repo}-timeline-full.json": json.loads((data_dir / f"{repo}-timeline-full.json").read_text(encoding="utf-8")),
    }
    coupling = json.loads((coupling_dir / f"{repo}-coupling.json").read_text(encoding="utf-8"))
    coupling_keys = [
        f"codecohesion/data/{repo}-coupling.json",
        f"codecohesion/data/{repo}-timeline-full-coupling.json",
    ]

    shim = f"""<script>
(function () {{
  var DATA = {js_json(data)};
  var COUPLING = {js_json(coupling)};
  {json.dumps(coupling_keys)}.forEach(function (k) {{ DATA[k] = COUPLING; }});
  function key(u) {{
    var s = typeof u === 'string' ? u : (u && u.url) || String(u);
    s = s.replace(/^[a-z]+:\\/\\/[^/]+/i, '');
    s = s.replace(/^\\.?\\//, '');
    s = s.split('?')[0].split('#')[0];
    return s;
  }}
  var orig = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (u, opts) {{
    var k = key(u);
    if (Object.prototype.hasOwnProperty.call(DATA, k)) {{
      var method = (opts && opts.method) || 'GET';
      var body = method.toUpperCase() === 'HEAD' ? null : JSON.stringify(DATA[k]);
      return Promise.resolve(new Response(body, {{ status: 200, headers: {{ 'Content-Type': 'application/json' }} }}));
    }}
    if (/(^|\\/)data\\/.*\\.json$/.test(k)) {{
      return Promise.resolve(new Response(null, {{ status: 404, statusText: 'Not Found' }}));
    }}
    return orig ? orig(u, opts) : Promise.reject(new Error('fetch unavailable'));
  }};
}})();
</script>"""

    head = re.search(r"<head>(.*?)</head>", html, re.S)
    body = re.search(r"<body[^>]*>(.*?)</body>", html, re.S)
    if not head or not body:
        sys.exit("error: index.html has no <head> or <body> section")
    head_html, body_html = head.group(1), body.group(1)
    styles = "\n".join(re.findall(r"<style>.*?</style>", head_html, re.S))
    external_script = re.compile(r'<script[^>]*src="[^"]*"[^>]*></script>')
    body_html = external_script.sub("", body_html)
    head_scripts = "\n".join(re.findall(r"<script>.*?</script>", external_script.sub("", head_html), re.S))
    module = '<script type="module">\n' + bundle.replace("</script", "<\\/script") + "\n</script>"

    title = "Sprecher East — CodeCohesion"
    full = "\n".join([
        "<!DOCTYPE html>",
        '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
        f"<title>{title}</title>",
        styles,
        head_scripts,
        "</head><body>",
        body_html,
        shim,
        module,
        "</body></html>",
    ])
    standalone = out_dir / "standalone.html"
    standalone.write_text(full, encoding="utf-8", newline="\n")
    print(f"standalone: {standalone} ({standalone.stat().st_size // 1024} KB)")

    if fragment_path is not None:
        fragment = "\n".join([
            "<title>Sprecher East CodeCohesion</title>",
            '<meta name="description" content="3D solar-system view of the Sprecher East website codebase: churn, coupling clusters, and commit timeline.">',
            styles,
            "<style>html,body{margin:0;height:100%;background:#1a1a1a;color:#fff}</style>",
            head_scripts,
            body_html,
            shim,
            module,
        ])
        fragment_path.write_text(fragment, encoding="utf-8", newline="\n")
        print(f"fragment: {fragment_path} ({fragment_path.stat().st_size // 1024} KB)")


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    out_dir: Path = args.out_dir
    index_path = out_dir / "index.html"
    if not index_path.is_file():
        sys.exit(f"error: {index_path} not found — copy the upstream viewer build into {out_dir} first")
    for change in fix_index_html(index_path):
        print(f"index.html: {change}")
    for change in fix_json_data(out_dir, args.repo):
        print(f"data: {change}")
    build_standalone(out_dir, args.repo, args.fragment)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
