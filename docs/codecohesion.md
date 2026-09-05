# CodeCohesion — 3D architecture and churn view

**Tracking issue:** #96 · **Upstream:** [virtualgenius/codecohesion](https://github.com/virtualgenius/codecohesion) (MIT) · **Pairs with:** [Graphify](graphify.md) (#95)

CodeCohesion turns the git history into an interactive 3D "solar system": directories are hubs, files are satellites, and color modes show churn, age, ownership, hotspots, and temporal-coupling clusters (files that keep changing together). A Gource-style timeline replays every commit.

Graphify answers _what connects to what_ (imports, calls, concepts). CodeCohesion answers _where the churn and coupling hotspots live_ and _how the repo grew over time_.

## What is checked in

`codecohesion-out/` is a self-contained static build of the upstream viewer with this repo's data baked in (about 4 MB):

| Path                                                         | What it is                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `index.html`, `assets/*.js`, `favicon-*.svg`                 | Upstream viewer, built with a relative base so it runs anywhere               |
| `data/sprecher-east-neighborhood-website.json`               | HEAD snapshot: 335 files, 106k LOC, per-file git metadata                     |
| `data/sprecher-east-neighborhood-website-timeline-full.json` | Timeline V2: every commit as a delta (295 commits, Feb–Sep 2026)              |
| `data/repos.json`                                            | Repo manifest the viewer reads on load                                        |
| `standalone.html`                                            | Single-file build (viewer + data inlined); opens by double-click, no server   |
| `codecohesion/data/*-coupling.json`                          | Temporal-coupling graph: 763 files, 5,156 co-change edges, 8 Louvain clusters |

The coupling file lives under `codecohesion/data/` because the upstream viewer fetches it from the absolute path `/codecohesion/data/<repo>-coupling.json` (a leftover from its GitHub Pages deployment). It is duplicated under the timeline name so the "Coupling Clusters" color mode also works during timeline playback.

Local machine paths were stripped from the JSON (`repositoryPath` is the repo name only). Everything else in the data comes from public git history.

## Viewing it

Fastest: double-click `codecohesion-out/standalone.html`. It inlines the viewer and all data behind a small `fetch()` shim, so it works from `file://` and on a phone.

The multi-file build needs a static file server (the viewer fetches its data with `fetch()`, which browsers block on `file://`):

```bash
python -m http.server 4174 -d codecohesion-out
```

Then open <http://localhost:4174>. In Claude Code the same server is registered in `.claude/launch.json` as `codecohesion-out`.

Things worth trying first:

- **Color by → Coupling Clusters** (HEAD Analysis): the 8 bounded contexts detected from co-change history.
- **Color by → Hotspot**: churn × recency; red satellites are the files that keep getting touched.
- **Timeline → Play**: watch the Feb 2026 static site become the Payload CMS app.
- Click any node for its commit history; **Show labels** turns on file names.

The **Analyze Repository** panel needs the upstream API server and does nothing in the static build.

## Regenerating

The upstream monorepo is cloned once, outside this repo (`~/tools/codecohesion`). Windows note: the worktree was exposed through a directory junction named after the repo (`~/tools/repos/sprecher-east-neighborhood-website`) because the processor names its output files after the folder name.

```bash
# one-time
git clone https://github.com/virtualgenius/codecohesion.git ~/tools/codecohesion
cd ~/tools/codecohesion && npm install

# 1. analyze (run from ~/tools/codecohesion/processor)
REPO=/path/to/sprecher-east-neighborhood-website
npm run dev -- "$REPO" --full-delta                                   # timeline V2
npm run dev -- "$REPO" output/sprecher-east-neighborhood-website.json # HEAD snapshot
npm run coupling -- output/sprecher-east-neighborhood-website-timeline-full.json

# 2. build the viewer with the data baked in (from ~/tools/codecohesion/viewer)
cp ../processor/output/sprecher-east-neighborhood-website*.json public/data/
npx vite build --base ./

# 3. copy into this repo
#    dist/index.html, dist/assets, dist/favicon-*.svg      -> codecohesion-out/
#    dist/data/<repo>.json, <repo>-timeline-full.json     -> codecohesion-out/data/
#    <repo>-coupling.json (+ copy as <repo>-timeline-full-coupling.json)
#                                                          -> codecohesion-out/codecohesion/data/
#    write codecohesion-out/data/repos.json as {"repos":["sprecher-east-neighborhood-website"]}
#    set "repositoryPath" to the repo name in every JSON (no local paths in the public repo)

# 4. single-file build
python scripts/codecohesion-pack.py codecohesion-out codecohesion-out/standalone.html /tmp/unused-fragment.html
```

Regenerate after large refactors or roughly once per sprint. The full-delta run takes under a minute for this repo.

## Known limitations

- The coupling analysis includes files deleted during the CMS migration (763 files tracked vs 335 at HEAD), so some clusters mix live and dead files. Filter by directory in the legend to focus.
- Author color mode shows git author names; these are already public in the commit history.
- The 3D view is heavy on low-end phones. The timeline mode with 295 commits works but can take a few seconds to load.
