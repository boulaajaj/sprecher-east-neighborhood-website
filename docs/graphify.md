# Graphify — codebase knowledge graph

**Tracking issue:** #95 · **Upstream:** [safishamsi/graphify](https://github.com/safishamsi/graphify) (PyPI `graphifyy` 0.9.54, Apache-2.0/MIT) · **Pairs with:** [CodeCohesion](codecohesion.md) (#96)

Graphify turns the repo into a queryable knowledge graph. Code is parsed structurally (tree-sitter, no LLM), and docs and images go through Claude subagents that extract named concepts, relationships, and the _why_ behind decisions. Everything is merged into one graph, clustered into communities, and exported as an interactive HTML page, a JSON file for tooling, and a plain-language audit report.

CodeCohesion answers _where the churn is_. Graphify answers _what connects to what_, including the agent rules and memory docs, not just imports.

## What is checked in

| Path                                 | What it is                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `graphify-out/graph.html`            | Interactive graph. Opens directly in a browser; needs internet for one CDN script |
| `graphify-out/graph.json`            | The graph: 1,640 nodes, 3,437 edges, 148 named communities, 37 hyperedges         |
| `graphify-out/GRAPH_REPORT.md`       | Audit report: hubs, god nodes, surprising connections, ambiguous edges, gaps      |
| `graphify-out/manifest.json`         | File hashes so `graphify update` only re-extracts what changed                    |
| `graphify-out/.graphify_labels.json` | The 148 community names used by the HTML export                                   |
| `graphify-out/cost.json`             | Token cost per run                                                                |

Ignored by git: `graphify-out/cache/` (extraction cache, 1.2 MB, rebuilt on demand) and the two interpreter sidecars, which hold local machine paths.

The corpus was the whole repo at the time of the scan:

| Corpus         | Count |
| -------------- | ----- |
| Code files     | 226   |
| Docs (md, yml) | 43    |
| Images         | 37    |
| Words          | ~647k |

Edge provenance: 86% EXTRACTED (explicit in source), 14% INFERRED (avg confidence 0.84), a handful AMBIGUOUS and listed for review in the report.

## Viewing it

Double-click `graphify-out/graph.html`. The only external dependency is the vis-network library loaded from a CDN, so it needs internet the first time. Or serve the folder:

```bash
python -m http.server 4173 -d graphify-out
```

In Claude Code the same server is registered in `.claude/launch.json` as `graphify-out`.

In the page: the right panel lists communities (toggle them to declutter), the search box jumps to any node, and clicking a node shows its type, community, source file with line number, and neighbors.

## Asking the graph questions

Once `graphify-out/graph.json` exists, `/graphify` in Claude Code answers natural-language questions from the graph instead of re-reading files. The CLI works anywhere:

```bash
graphify god-nodes --top 15                 # most connected symbols and concepts
graphify affected "formatDateBadge()"       # reverse traversal: what breaks if this changes
graphify query "How does an event get rendered on its detail page?"
graphify path "EventsPage()" "formatDateTime()"
graphify explain "revalidatePage"
```

Windows note: set `PYTHONUTF8=1` before running these; node labels contain arrows and em dashes that the default console codepage cannot print.

## PR triage by blast radius

The graph's `affected` command is the review tool: it lists every node that reaches a changed symbol within N hops, with the file and line of each edge. Sample run against PR #67 ("Improve homepage layout, card dates, and section rhythm", 7 files):

| Changed file                            | Symbol queried     | Reaches (depth 2)                                                                              |
| --------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| `src/components/Card/index.tsx`         | `Card/index.tsx`   | search page, posts index, paginated posts, CollectionArchive, RelatedPosts block, ArchiveBlock |
| `src/blocks/Content/Component.tsx`      | `ContentBlock()`   | RenderBlocks, the CMS `[slug]` page                                                            |
| `src/heros/HighImpact/index.tsx`        | `HighImpactHero()` | RenderHero, the CMS `[slug]` page                                                              |
| `src/blocks/ArchiveBlock/Component.tsx` | `ArchiveBlock()`   | RenderBlocks, the CMS `[slug]` page                                                            |
| `src/endpoints/seed/home.ts`            | `home.ts`          | seed index, `seed()`, the seed route and its `POST()` handler                                  |

Reading: the Card change is the widest (six render sites across posts, search, and archive blocks), so a reviewer should check those pages. The block and hero changes only surface through the CMS page renderer. The seed change touches nothing user-facing. That is the whole review scope in one command.

To triage a new PR:

```bash
git diff --name-only origin/main...HEAD
graphify affected "<symbol or file from the diff>" --depth 2
```

Symbols that exist in more than one place (for example `Card()` vs `Card/index.tsx`) need the file-style name; the CLI says so when a name is not unique.

## What the graph surfaced

The doc pass reads the agent rules and memory files as first-class content, which turned up drift worth follow-up issues:

- `HANDOFF.md` describes the pre-Payload Sanity setup and is linked to the current stack only by similarity.
- `.claude/agents/backend-eng.md` and `cms-eng.md` still reference the Sanity-era `src/lib/data.ts` data layer.
- `.coderabbit.yaml` path instructions enforce a ui/features/sections/layout layering that CLAUDE.md says no longer applies.
- `.claude/agents/frontend-eng.md` uses three viewports where the rules require six.
- `.claude/agents/seo-specialist.md` samples a title with the brand suffix, which the root layout template already appends.
- Several agent profiles document a `contentStatus` field; Payload drafts use `_status`.
- The god-node list is dominated by agent profiles rather than code, because the docs are densely cross-linked. For a code-only view, rebuild with `graphify extract . --code-only`.

Ambiguous edges (10) and thin communities are listed at the end of the report.

## Regenerating

Two options, depending on how much changed.

**Code changed, docs did not** (seconds, no LLM):

```bash
graphify update .
```

Re-parses changed code files from the manifest, re-clusters, and rewrites graph.json, GRAPH_REPORT.md, and graph.html. Community names come from the saved labels.

**Docs, rules, or images changed** (about 15 minutes, uses Claude subagents):

```
/graphify .
```

Run inside Claude Code from the repo root. The skill re-extracts only files whose hash changed and names new communities. Commit the refreshed `graphify-out/` files with the PR that changed the docs.

One-time setup on a new machine:

```bash
uv tool install graphifyy
graphify install        # registers the /graphify skill in ~/.claude/skills
```

Re-run after large refactors or at the end of each sprint.

## Health notes from this run

The build health check reported 398 dangling edges. All of them are AST import edges to external npm packages (`react`, `payload`, `next`, and friends), which the extractor references without creating nodes. They are expected and do not affect queries. Three self-loops and 109 multi-relation pairs collapsed into single undirected edges are also normal for this exporter.
