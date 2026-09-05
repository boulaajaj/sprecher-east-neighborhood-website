"""Pack codecohesion-out/ into a single self-contained HTML file.

The upstream viewer loads its data with fetch('./data/...') and
fetch('/codecohesion/data/...'). This script inlines the JS bundle and the JSON
data and installs a fetch shim so the page works with no server at all
(file:// or an Artifact iframe).

Usage: python pack_codecohesion.py <codecohesion-out dir> <out-standalone.html> <out-artifact-fragment.html>
"""
import json
import re
import sys
from pathlib import Path

src = Path(sys.argv[1])
out_full = Path(sys.argv[2])
out_frag = Path(sys.argv[3])
REPO = "sprecher-east-neighborhood-website"

html = (src / "index.html").read_text(encoding="utf-8")
js_path = next((src / "assets").glob("*.js"))
bundle = js_path.read_text(encoding="utf-8")

data = {
    "data/repos.json": json.loads((src / "data" / "repos.json").read_text(encoding="utf-8")),
    f"data/{REPO}.json": json.loads((src / "data" / f"{REPO}.json").read_text(encoding="utf-8")),
    f"data/{REPO}-timeline-full.json": json.loads((src / "data" / f"{REPO}-timeline-full.json").read_text(encoding="utf-8")),
}
coupling = json.loads((src / "codecohesion" / "data" / f"{REPO}-coupling.json").read_text(encoding="utf-8"))
# The coupling graph is referenced under two names; alias it in JS instead of embedding twice.
COUPLING_KEYS = [f"codecohesion/data/{REPO}-coupling.json", f"codecohesion/data/{REPO}-timeline-full-coupling.json"]


def js_json(obj) -> str:
    s = json.dumps(obj, separators=(",", ":"), ensure_ascii=False)
    return s.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


shim = f"""<script>
(function () {{
  var DATA = {js_json(data)};
  var COUPLING = {js_json(coupling)};
  {json.dumps(COUPLING_KEYS)}.forEach(function (k) {{ DATA[k] = COUPLING; }});
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

# Pull the pieces out of the upstream index.html
head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
body = re.search(r"<body[^>]*>(.*?)</body>", html, re.S).group(1)
styles = "\n".join(re.findall(r"<style>.*?</style>", head, re.S))
body = re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', "", body)
head_scripts = re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', "", head)
head_scripts = "\n".join(re.findall(r"<script>.*?</script>", head_scripts, re.S))

module = "<script type=\"module\">\n" + bundle.replace("</script", "<\\/script") + "\n</script>"

fragment = "\n".join([
    "<title>Sprecher East CodeCohesion</title>",
    '<meta name="description" content="3D solar-system view of the Sprecher East website codebase: churn, coupling clusters, and commit timeline.">',
    styles,
    "<style>html,body{margin:0;height:100%;background:#1a1a1a;color:#fff}</style>",
    head_scripts,
    body,
    shim,
    module,
])
out_frag.write_text(fragment, encoding="utf-8")

full = "\n".join([
    "<!DOCTYPE html>",
    '<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
    "<title>Sprecher East — CodeCohesion</title>",
    styles,
    head_scripts,
    "</head><body>",
    body,
    shim,
    module,
    "</body></html>",
])
out_full.write_text(full, encoding="utf-8")
print(f"fragment: {out_frag} ({out_frag.stat().st_size // 1024} KB)")
print(f"standalone: {out_full} ({out_full.stat().st_size // 1024} KB)")
