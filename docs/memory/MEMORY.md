# Sprecher East Neighborhood Website

## Single Source of Truth

- **Strategy docs (private):** GitHub: `boulaajaj/sprecher-east-strategy` (PRIVATE)
- **Website code (public):** This repo → GitHub: `boulaajaj/sprecher-east-neighborhood-website` (PUBLIC)
- **Asana role tags:** All tasks use `[R#-Role]` prefix — see `Asana-Task-Reference.md` in strategy repo

## Project Summary

Full rebuild of sprechereast.com. Phase 1 was static HTML. Phase 2 is migrating to the
Payload CMS v3 Website Template with native auth + payload-oauth2 plugin. Single SQLite database.

## Current Stack (Phase 2 — Migration In Progress)

- **Framework**: Next.js 15 (App Router, TypeScript)
- **CSS**: Tailwind CSS v4 (design tokens in `src/app/globals.css @theme {}`)
- **UI Components**: shadcn/ui (Radix UI + Tailwind styling)
- **CMS**: Payload CMS v3 Website Template at `/admin` (self-hosted, SQLite `data/payload.db`)
  - Layout builder with 8 block types (Archive, CallToAction, Content, FormBlock, MediaBlock, etc.)
  - Lexical rich text editor, live preview, draft preview, scheduled publishing
  - Plugins: SEO, Form Builder, Search, Redirects, Nested Docs
- **Auth**: Payload CMS native auth + `payload-oauth2` by Wilson Le (replaces Better Auth)
  - Single `data/payload.db` database (no separate auth.db)
  - JWT tokens, cookie-based sessions, built-in login/logout/forgot-password
- **Icons**: Lucide React
- **Hosting**: Hostinger VPS (Ubuntu 24.04, PM2 + Caddy) — live at http://187.77.27.93
- **Docs**: https://payloadcms.com/llms-full.txt (Payload CMS LLM reference)

## Component Architecture (DDD / Fractal)

```
src/components/
  ui/                         ← atomic, domain-agnostic primitives
    badge.tsx                   CategoryBadge, StatusBadge, TagBadge
    page-header.tsx             PageHeader (eyebrow, h1, description)
    empty-state.tsx             EmptyState (icon, title, description)
    section-header.tsx          SectionHeader (eyebrow, h2, view-all link)
    container.tsx               Container (max-w-6xl wrapper)
    index.ts
  features/
    events/                   ← events domain components
      event-card.tsx, event-detail-card.tsx, event-date-badge.tsx, event-list.tsx, index.ts
    posts/                    ← posts domain components
      post-card.tsx, post-feed-item.tsx, post-grid.tsx, post-feed.tsx, index.ts
  sections/                   ← full-width page sections
    hero.tsx, feature-strip.tsx, about-preview.tsx, events-news.tsx, cta-banner.tsx, index.ts
  layout/
    Nav.tsx                   'use client' — includes UserMenu (auth widget)
    Footer.tsx                Server component
    UserMenu.tsx              'use client' — shows Sign In or user avatar + dropdown
```

## Project File Structure (Legacy — will be replaced by Website Template scaffold)

```
src/
  app/
    layout.tsx                Root (Poppins via next/font, metadata)
    globals.css               Tailwind v4 @theme block (all design tokens)
    (site)/layout.tsx         Shared Nav + Footer wrapper
    (site)/page.tsx           Homepage — uses sections/*
    (site)/about/page.tsx
    (site)/association/page.tsx
    (site)/events/page.tsx
    (site)/news/page.tsx
    (site)/resources/page.tsx
    (site)/get-involved/page.tsx
    (site)/contact/page.tsx + ContactForm.tsx ('use client')
    (site)/login/page.tsx     'use client' — social + email login
    (payload)/admin/[[...segments]]/page.tsx   Payload admin UI
    (payload)/api/[...slug]/route.ts           Payload REST API
    api/auth/[...all]/route.ts  Better Auth catch-all
    api/contact/route.ts      Contact form handler (logs only — needs email wired)
  lib/
    types.ts                  Shared TS types (Event, Post, BoardMember)
    data.ts                   Reads from Payload Local API, falls back to JSON
    auth.ts                   Better Auth server config (server-only)
    auth-client.ts            Better Auth client hooks (useSession, signIn, signOut)
    utils.ts                  formatDate, getDateParts, cn()
  middleware.ts               Protects /profile routes via session cookie check
  payload/collections/        Payload CMS schemas
    Events.ts, Posts.ts, BoardMembers.ts, Users.ts, Media.ts
payload.config.ts             Payload config (SQLite, collections, admin)
scripts/seed.ts               One-time: imports data/*.json into Payload DB
data/
  events.json, posts.json, board.json, site.json   (source of truth until seeded)
  payload.db, auth.db         (SQLite — gitignored, created at runtime)
public/images/               (must copy from assets/images — see setup)
```

## Design Tokens (src/app/globals.css @theme block)

- `--color-primary: #3d7a5e` → `bg-primary`, `text-primary`, `border-primary`
- `--color-accent: #e8923a` → `bg-accent`, `text-accent`
- `--color-background: #f9f8f5` → `bg-background`
- `--color-surface: #f0ede6` → `bg-surface`
- `--color-foreground: #1a1a1a` → `text-foreground`
- `--color-muted: #6b6b6b` → `text-muted`
- `--color-border: #e2ddd6` → `border-border`

## Local Setup (Post-Migration)

```bash
npm install
cp .env.local.example .env.local   # fill in PAYLOAD_SECRET + DATABASE_URI + SERVER_URL (see env vars below)
mkdir -p data                       # already exists if repo was cloned with data/
npm run dev                         # → http://localhost:3000 (dev server also generates importMap.js)
# First visit to /admin → one-time "Create first admin" setup screen (creates payload.db)
```

## Env Vars Required (Post-Migration)

| Var                       | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `PAYLOAD_SECRET`          | Payload JWT signing (32+ chars)                 |
| `DATABASE_URI`            | `file:./data/payload.db`                        |
| `NEXT_PUBLIC_SERVER_URL`  | `http://localhost:3000` (dev) or production URL |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth via payload-oauth2 (optional)      |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth via payload-oauth2 (optional)      |

> **Legacy note:** `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_APP_URL` are no longer needed. Better Auth was removed in Sprint 2.

## CMS & Auth Key Notes

- **Single database**: All data (content + users + auth) in `data/payload.db` (SQLite)
- **Better Auth REMOVED**: Was causing sign-up hangs, password bugs, dual-DB complexity
- **Payload native auth**: `auth: true` on Users collection, JWT sessions, built-in login/register
- **payload-oauth2**: Plugin by Wilson Le (provider-agnostic OAuth2; Google tested with examples, Apple has example config). Starting with Google; more providers configured as needed.
- First Payload admin created by visiting `/admin` on a fresh DB (one-time setup UI)
- `overrideAccess: true` required in all server-side Payload reads (no session in RSC)
- Website Template provides: layout builder, live preview, draft system, SEO plugin, form builder

## Navigation

Home → About → Events → News → Resources → Get Involved → [Contact] (CTA) + [Sign In] (UserMenu)
Association page at `/association` (footer link, not in main nav)

## Known Gotchas (build-verified)

- **Payload REST route**: `REST_GET(config)` — curried; NOT `REST_GET(req, config)`
- **Payload admin importMap**: Auto-generated by Payload dev server on first run. Committed to repo.
  Lives at `src/app/(payload)/admin/importMap.js`
- **`defaultSort`**: Must be on collection root level, NOT inside `admin: {}`
- **npm installs**: Always use `--legacy-peer-deps` for Payload packages (peer dep conflicts)
- **`graphql` package**: Must install separately — `@payloadcms/graphql` doesn't bundle it
- **`npx payload run` fails on Node v24**: `payload/dist/bin/loadEnv.js` incompatible. Use direct node scripts instead.
- **Asana REST API**: Use `$ASANA_PAT` (user env var) with `curl` instead of MCP tools. Supports comments, subtasks, attachments. On Windows, pass JSON via temp file to avoid escaping issues.
- **MCP tools limitation**: Slack MCP tools only work in the main conversation, NOT in spawned subagents
- **Write tool requires prior Read**: Always read a file before writing it

## DDD Architecture Guidelines

- `ui/` = pure presentational, no domain knowledge
- `features/{domain}/` = domain-specific, composed from ui primitives
- `sections/` = full-page sections, composed from features + ui
- `layout/` = app shell (Nav, Footer, UserMenu)
- Barrel exports in `index.ts` per folder; files max ~300 lines

## VPS Info

See `memory/vps.md` for full server details.
Site live at http://187.77.27.93 (PM2 + Caddy reverse proxy).
CI/CD: push to `main` → GitHub Actions → SSH deploy → `npm ci && npm run build && pm2 reload`.
VPS first-deploy extra steps: create `data/` dir, set env vars, run seed script, create admin user at /admin.

## Sprint 2 — Payload CMS Migration

**Status**: In progress (started March 1, 2026)

**Key Decisions Made:**

- Migrate from Better Auth to Payload native auth + payload-oauth2
- Rebuild from Payload CMS v3 Website Template (Option A — fresh scaffold, same repo)
- Single SQLite database (no more separate auth.db)
- All content CMS-driven via layout builder blocks
- Sprint retrospective practice added to all 12 agents (biweekly cycle)

**Current Priorities:**

1. Update CLAUDE.md to reflect new architecture
2. Scaffold website template on feature branch
3. Configure CMS collections (Events, BoardMembers, FAQ)
4. Implement auth (payload-oauth2 for Google/GitHub)
5. Migrate content and deploy

See `docs/memory/progress.md` for full history and `docs/memory/retro/sprint-2.md` for retrospective log.

## Standing Instructions From Amine (2026-09-13)

- **Merging is delegated.** Amine (2026-09-13): "whenever the PRs are ready and green, merge and move to the next items on the list, don't need to wait for me to merge manually." A PR is ready when CI is green on its head, the Copilot review has no open findings, every review thread is resolved, and there is no merge conflict. Merge it (squash preferred), verify linked issues close, then continue with the next tracked item. Applies to `boulaajaj/amibou-os` and this repo. Owner login, consent, or judgment calls are still reported and left to Amine.
- **amibou-os merged under that rule (2026-09-13):** #128 (hardening, squash 2c4f363) and #129 (personal pilot, provider-independent, squash ffd80f7, 2.0.0-beta.2). Legacy triage #84 posted: 27 of 33 closed, #3/#6 under #77, #10/#15/#17/#38 and the five V1 milestones wait on Amine. Next: #138 (owner's run), #139 (cadence, after #138), #105 (owner's judgement).

## Seamless brain (2026-09-22), the last owner prompt: the brain used without saying "search my brain"

- **Gap analysis posted on #74; issues #175 to #179 created under the existing Four-Cs; #139 rescoped by comment.** Order: #175 reconciliation → #176 recall → #177 conversation observations → #178 acceptance → #139 cadence. One issue, one PR. Owner constraints held: no transcripts, no provider semantics in the contract, conversation content untrusted, proposals only (auto-approval is a separate ADR issue #179), synthetic fixtures (Stayhaven, Tessomar Solar, Norvane Power), no client name in the brain.
- **#175 merged:** PR #180 squash 699c37a (two Copilot rounds). `mergeProposal` with `candidates` (ambiguous when `into` is null, sorted), `identityUpdateProposal` (id `identity:<node id>`), `chooseProposal`, `before` on field proposals, `proposeIdentities` on events; reuse test 10 (a thing named in five runs is one node; two held nodes of one name is a choice, never a third node).
- **#139 merged:** PR #182 squash 3ff6b74 (five Copilot rounds). `src/cursors.mjs` (cursor per account `<source>:<label>`, `advanceCursor` forward only, `readCursors` tolerant of any non-object JSON); `discover import` advances the cursor to `window.to` once the whole import landed (`report.cursor`); `cadence run` on a host-managed source reports the capability due per verified account with the window since the cursor and `DEFAULT_MAX_RECORDS`, advancing nothing (`dueWindows`); no verified account is a failed run naming the cursor the ledger holds. Runtime gate unchanged (needs the owner's recorded run, #138).
- **#176 merged:** PR #181 squash 5038507 (eleven Copilot rounds, each "Findings: None" plus one previously-missed nit: HOOK_SHA, brand and dates in the fixture, `mergeHooks` canonical JSON, manual lines, unused import, `judge` counting distinct words not score, `isOurHook` exact command, refusals echoing `prompt`, the recall test through `cli()` with stdin, manuals' stdin line, `RENTAL_PROMPT`). `src/recall.mjs` (`judge`: named, or at least two distinct words with no tie; 600-token ceiling, three nodes), `amibou recall --stdin` reads the hook JSON (`prompt|user_input|user_input_raw`, `cwd`), `brain_recall`, the bridge installs `HOOK_ENTRY` into `.claude/settings.json` and `.codex/hooks.json`. CI gotcha again: one push (b731e05) did not update the PR head (refs/pull/N/head stale while the branch moved); a later push resynced it; `ci.yml` was dispatched by hand meanwhile.
- **#177 merged:** PR #183 squash 3275952 (ten Copilot rounds). `src/connections/conversation.mjs` (source `conversation`, medium `chat`, record `exchange`), `src/conversation.mjs` (`checkConversation`: every string checked, titles and references included; a field of one kind on another refused; `on` a day; `importConversation` resolves through the identity order; a memory node's id, page and identity carry one slug `<day>-<name>`; one event per observation that lands, a skipped one writes nothing; skipped.observation numeric), `amibou observe conversation <brain> <file> | --schema | --guide` (the flags take no path), `brain_observe` (write grant; refusals `read-only`, `invalid`, `observation`; the refusal names the client's own directory, never the brain's or home's location), tools `[brain_query, brain_recall, brain_observe, brain_expand]`; `src/observe.mjs`: a field a source records without a status stands alone (approving it later never sets a newer status back; note says field or status). The vocabulary test bans `conversations` (plural), not the singular source.
- **#178 in review:** PR #184 from branch `seamless` (worktree `v2seam`), retargeted to main after #183, head 4891d16: `tests/seamless.test.mjs` runs the eight scenarios through the hook (`cli()` with `input`), the tools and the commands on a synthetic travel brain with the two invariants (context/ untouched before approve; no client named under context/, sources/, proposals, the walk asserting it read files); the vertical slice has steps 15 (recall unasked, with source and handle asserted) and 16 (one conversation fact proposed, approved, re-imported to no change); `tests/acceptance.test.mjs` expects sixteen steps. Rounds 2 to 10 "Approval recommended" (round 1: walk entries as strings, wording; round 6: trace wording, count; round 8: source assertion).
- **Open question noted to the owner (#74):** ChatGPT needs a remote MCP transport; out of scope.

## Brain rebuild, decided as adviser (2026-09-14)

- **Amine's judgement:** the first real brain (27 nodes, 116 word-overlap edges, one repository's decision log as the hub) was "quite useless". Correct. The plan and the reference models are on the private plan page (claude.ai artifact 987cbf7e); the private 3D preview is artifact 580adbe2. GitHub Pages was refused: the brain is private.
- **Decisions taken without asking, as Amine instructed ("act like an adviser"):** kind names `domain` and `connector` (Backstage, DDD, Claude's own vocabulary); domains follow PARA areas; Amibou OS and ai-mise stay in the brain as projects with their decisions folded under them; catalog first and graph second from one projection.
- **Epic amibou-os #142**, six phases. Built so far as a stacked chain: #141 P0 ontology (16 kinds, 18 predicates with inverses and provenance, summary/outcome, validator, schema, contract page) → #143 P1 repository extractors (components from directory conventions with import dependencies, skills with bridge collapse, agents, routines from triggers and hooks, connectors shared, memory with ring and token cost, decisions scoped to the repository; one `new-graph` proposal per repository, applied atomically, edges on held nodes proposed too) → #144 P5 with the Level 3 half of P4 (index carries edges, typed neighbours, typed projection links, decisions/memory/connectors as legend categories, discovery `follows`/`related` become typed edges). Merge in that order under the delegation rule, retargeting each base to `main` as the one below merges. Remaining: P2 project cards, P3 matters as their own kind with domains and summaries, the rest of P4, the catalog view.
- **Rehearsal result:** four repositories plus six mailbox matters project to 276 nodes and 458 typed connections, validating clean. The matters are the only orphans until P3 adds `owns`.
- **Branch name gotcha:** `projection` already exists on amibou-os from V1; the P5 branch is `typed-projection`.
- **Chain merged (2026-09-14, under the standing delegation):** #141 squash 18d3992, #143 squash 54c05ea, #144 squash 4f5c454; `main` is 2.0.0-beta.3 with P0, P1 and P5 (plus the Level 3 half of P4). Copilot took seven passes on #143 alone; each pass surfaced findings it had suppressed before, so re-request after every push and read the "suppressed" section of the review body, not only the threads. CodeRabbit's free tier skips PRs whose base is not `main` and allows one review an hour.
- **Stacked-PR gotcha (phase F item):** after a squash merge of the base PR, the upper branch still carries the squashed commits and conflicts with `main`; GitHub runs no `pull_request` workflow on an unmergeable PR, so CI looks skipped rather than red. Rebase the upper branch onto `main` (`git rebase --onto origin/main <old-base-tip> <branch>`) before or when retargeting, and read `mergeable_state` before the check list.
- **Course correction (2026-09-14, Amine's directive supersedes plan v2):** proceed without another architecture cycle; pause only for security, credentials, a destructive migration or an irreducible owner decision. Order: 1 identity and graph-delta, 2 provider-neutral source record, 3 project/area model, cards, catalog-first UI, guided first run, 4 bounded retrieval and the eval at scale, 5 vertical-slice acceptance and the owner report. Epic #142, milestone M7; #139 stays blocked; #138 is not re-asked; PR #127 stays apart.
- **Slice 1 merged:** #146 squash f425b76 (issue #145): identities, aliases, paths, lifecycle; resolver order in `src/identity.mjs`; `graph-delta` and `merge` proposals; workspace identity on extracted nodes; `src/links.mjs` references edges. Reuse tests 1 to 3 and 5 to 9 in `tests/reuse.test.mjs`. Five Copilot rounds; findings fixed: exact-edge unlink, schema and validator share one `PREVIOUS_PATH` pattern, whitespace encoded in folder identities and anchors, `unchanged` excludes linked and unlinked nodes, broken links reported once. Copilot stopped answering re-review requests after the fifth round; merged on the repository rule (checks green, threads resolved, no conflict).
- **Slice 2 merged:** #148 squash eeb1f52 (issue #147): `src/sourcerecord.mjs` envelope, discovery version 2 with version 1 read on the way in, resolution before proposal (status, merge, or a node into `context/inbox/`; `DEFAULT_DOMAIN` gone), events carry `title` (`subject` still read), vocabulary test, reuse test 4; the demo trip fixture names a fictional place (Lakeside). Two Copilot rounds.
- **Retarget gotcha, second form:** rebasing a stacked branch onto `main` and retargeting its PR fires no `pull_request` run, and a `workflow_dispatch` run of `ci.yml` on the branch does not count for the ruleset's required checks (`check`, `build-preview`): "2 of 2 required status checks are expected". Only a push to the head fires the run. Push a real change; never an empty commit or a close-and-reopen. Also: `git add -A` on the wrong branch swept a new file into the other slice's commit; amend and force-with-lease on my own branch put it right.
- **Decisions taken as adviser (slices 1 and 2):** readable `kind:name` ids minted once, durability through identities and aliases rather than opaque ids; link edges derived in the index only, never written to sidecars; broken links are warnings; a discovered project that resembles a held node is one merge proposal and no page, and a rejected merge makes the next import propose the node; a page without a sidecar is never changed by a delta.
- **Slice 3 merged:** #150 squash 483759d (issue #149): `area` the standing kind, `domain` and `matter` read as `area` and `project` (`KIND_ALIASES`, `canonicalKind`, `isKind`); `src/cards.mjs` and `src/catalog.mjs` (`nextAction`, `openQuestions` on the sidecar and in the index; `amibou cards`, `/api/cards`, `/catalog` as the door, `/brain` the untouched renderer, `/focus` sets an HttpOnly cookie and `focusOf` serves two steps and thirty nodes); `amibou setup --scan` / `--apply` as step 3 of six. Six Copilot rounds, each surfacing "suppressed" findings in code that had not moved: page reads guarded by the router's `insideBrain`, `eventShape` had been dropping `proposeFields` entirely (no refresh had ever carried the card fields), the scan applies only its own repositories' proposals, empty `openQuestions` never proposed, adjacency built in place, an area's section id slugged, actors keyed once per index, `project()` alone builds the index in setup, id-kind message names the alias as written. Rule confirmed: keep re-requesting until a review says "0 new" with no suppressed section.
- **Slice 4 merged:** PR #152 (issue #151, squash 155c40f, nine Copilot rounds) from branch `retrieval`: `LEVEL1_SERVED` (25 lines of the nodes the question touched, best first, `levels.level1Note`; a brain of at most 25 nodes is served whole), `SOURCE_CAP` (12,000 chars) at Level 4, `coverage` on candidates so a project outranks the decision or component whose id carries its name while two projects named alike still tie and an untyped page stays in a tie; `levelCosts().level1Served` measures the 25 longest lines by bytes. `eval/run.mjs` with four arms (native search = top three files by question words), counted tokens beside bytes/4 (`--tokenizer`, else a regex pre-tokenizer labelled approximate), hallucination rate for every kind (unanswerable answered, or a cited file not shown), candidates, `--repeat` with spread, `--size` from `eval/brains.mjs` (8, 72, 970 nodes, `participle` with four irregular verbs), `--window` recording overflow. Runs committed (`eval/results/2026-09-14-*`, two repeats; `latest.md` is the fixture run): fixture router 90% at 36% of whole-brain tokens (met), medium 100% at 10% (met), large whole brain overflows 180k and router 100% at ~1,700 tokens (met), small 86% vs 93% at 51% (not met, said so). No hallucination anywhere. Weekly review reads `amibou cards --json`, not Level 1. No em dash characters in source: use `\u2014` escapes.
- **Slice 5 merged:** PR #154 (issue #153, squash 2ccd748, five Copilot rounds): `scripts/acceptance/vertical-slice.mjs` (ten asserted steps; `runSlice({out, log, env, run})` takes the suite's `cli()` as its runner; `prepareOut` refuses a directory inside a git repository by walking for `.git`, no git needed), `unchanged` proposal state (held from a source the node knows, its sidecar `source` or an identity, read no later than its `updated`; a source it does not know or a later reading is pending and refreshes provenance), `ownText` strips the bridge block (title, summary and `tokenBudget` from the own text), catalog Needs you as an index. Epic #142's five slices are done.
- **Orientation epic #155 (course correction 6):** north star: a tiny map of the person's world first, then progressive discovery of only the branches a prompt needs; workers get explicitly scoped slices. Contract `docs/ORIENTATION.md` merged as slice 0 (PR #162, squash f74fff0, closes #156). Six slice issues #156 to #161. Decisions: level numbers stay (0 = map, 1 = branch, 2 to 4 unchanged); lexical router stays, the model does the semantic part over area summaries; folders remain storage, implied ownership from a folder is read never written; one kind `asset` + predicate `concerns`, `contains` from area, `owns` to asset; scope = {roots, areas, depth, also} on the grant, out of scope invisible, `outside-scope` refusal names `amibou brain allow <repo> --also`; executor interface = work order / work result as schemas, no Ruflo. No embeddings or vector store.
- **Slice 1 merged:** PR #163 squash fb98347 (issue #157) from branch `worldmap`: `renderLevel0` = the map (estate line, `area:x | Title | meaning | also: a, b | 3 projects, 1 asset | next: area:x@1`, inbox line, bare folder lines, `domains:` counts last for compat); `index.areas`, `index.estate`, `ownedBy` on entries (`areasOf`); `MAP_TOKEN_CEILING` 800 for `MAP_AREAS` 12; `SURFACE_FOLDERS` = memory, inbox, connectors; a folder holding exactly one project directly is a project folder (shown as placed in no area yet, never proposed as an area); `src/areas.mjs` `proposeAreas` writes `sources/areas/<folder>.json` events and observes them (graph-delta create with `adopt: true` when the page exists without a sidecar; approval writes only the sidecar); `amibou build --propose-areas`; setup drafts areas after the scan (`steps.scan.areas`); router BUDGETS query = 1500 + 800. 325 tests. Four Copilot rounds: fallback `area.md` adopted, both paths taken reported, a project's own folder is one named after it or `<folder>/project.md`, ids that normalise alike (`a-b`/`a_b`, a folder named after an area page elsewhere) reported as `skipped`.
- **Course correction clarified 2026-09-15 (two owner messages):** agents are things in the world, not a concern of the brain; no executor interface; resolution by meaning (smallest meaningful unit, files and lines are evidence); Amibou is the context and routing layer for prompts, semantic navigation primary and the router assisting; the brain never built once; the human's seven questions; access control not expanded. `docs/ORIENTATION.md` rewritten on branch `contract`; slice 3 trimmed (no work order/result, `src/context.mjs` holds `contextPackage`, worker→client everywhere; #159 rewritten); slice 6 opened as #165 (branch `semantic`: `AREA_PARAPHRASE`, orientation `mode` lexical/semantic, harness rows per mode). The Actions billing blocker was lifted by the owner on 2026-09-15 (~00:40Z).
- **Slice 2 merged:** PR #164 (issue #158) squash-merged to main as f6ba11b on 2026-09-15 after 22 Copilot rounds (rounds fixed: `meaning:` hits, cycle-safe `branchMembers`, handles equal to lines shown, `branchServed` bound with the overflow line, `<branch>@1` wording everywhere, refusals with the map and their tokens logged, `within` deduped / capped / empty and malformed refused, matched areas open only when spoken of, older index without `vocabulary` routes from summary+aliases, one `branchHeader` builder, `levelCosts` one pass, `open()` cap on branches not reasons, `amibou build` prints the branch bound). Process rule confirmed: Copilot to "0 new" with **no suppressed comments** before merging; each round ~5.5 min; re-request after every push.
- **#171 course correction merged:** PR #173 squash 9de2e9e (2026-09-15 ~19:50Z) after eight Copilot rounds (fixed: `policyOf` returns a present key as written; every matching rule applies via a folded map, not `find`; `brain allow` derived line asserted against `scopeOf`; docs define discoverable as named or derived; `typedEdgesOf` shared by the scope walk and the derivation so cost follows the slice; `amibou scope` stops on a corrupt config instead of the framework's rules). Design as built, branch `policy`: discovery is automatic: `DISCOVERY_POLICY` in `src/authorization.mjs` (`dependsOn`, `concerns`, `realizes`, both directions, `extracted` only; not `owns`/`contains`/`involves`/`decides`/`references`/`relatesTo`), `checkPolicy`, `derivedDiscoverable(index, readable, policy)` one edge from readable, never a walk; `scopeOf(index, spec, { policy })` adds `derived` Set; manifest lists the owner's `discover` first then derived; config `policy.discover` replaces the default (`policyOf(config)` in home.mjs; resolver returns `policy` and refuses `policy-malformed`); `amibou brain allow` prints "Discoverable by policy: ..."; `amibou scope` marks `[by policy]`. 341 tests. Owner's rule verbatim: "semantic relationships inform automated policy, but only policy-approved relationship types can grant discover. Arbitrary graph edges must not widen access. The owner should only need to intervene for ambiguous relationships or broader read access."
- **#171 discover/read:** branch `authz` (worktree `scratchpad/v2authz`), PR #172 merged to main (squash 57b9b91, 2026-09-15 ~18:20Z) after five Copilot rounds (docs syntaxes with --discover, neighbours' ownedBy trimmed, held scope normalised once, manifest title/alias bounds MANIFEST_TITLE_CHARS=80 / MANIFEST_ALIAS_CHARS=32); Copilot's last note asked for a human look at the authorization changes, told to the owner on epic #155. Design: `src/authorization.mjs` (`authorize`, `may`, `manifestOf`, `MANIFEST_ITEMS=12`, `MANIFEST_TOKEN_CEILING=1600`); scope spec gains `discover`; `scopeOf` walks a root to depth inside its home branch only (a folder anchored by an area counts as that area), an `also` node is read at depth 0 and brings no branch, `discoverable` set; `branches = home ∪ nested`; `others` kept for the owner's catalog only, never rendered (map says "the rest of the map is outside the scope granted... and not shown"); area lines under scope count readable members only; router decides `may(scope,'read',id)` before existence checks (identical `outside-scope` for hidden and absent ids), `read-denied` for discoverable; page/sidecar `relations` and `ownedBy` trimmed to discoverable; MCP maps both refusals to the concrete `--also` command; `--discover` on `brain allow` and `scope`; docs ORIENTATION ("Discover and read", behaviour 9, slice 7), RETRIEVAL, BRIDGE, README, CHANGELOG. 340 tests. Pending PR review of the website repo: none reviewed-and-green (see session report).
- **Stack after #164, #166, #167 and #168:** `contract` merged as PR #166 (53fc8d2); `scope` as PR #167 (73fdd0e, nine rounds); `views` as PR #168 (squash 9ee4ee2, 2026-09-15 ~06:25Z, nine Copilot rounds: separator before the branch link, branch focus via a children index, every catalog map link lands on a section, overflow bucket known by an `other` mark, branches first under the twelve-category cap then root and kinds, a view carries only the categories its nodes use, test anchors and text built as the catalog builds them). `proof` merged as PR #169 (slice 5, #161, squash 57c2707, 2026-09-15 ~07:02Z, four Copilot rounds: step 12 claims reworded to "the area's name on the map, no project's title", compat test reads keys by name not order, focus cookie asserted before use, step 11 builds the index once); `semantic` merged as PR #170 (slice 6, #165, squash ba9bc1b, 2026-09-15 ~07:28Z, three Copilot rounds: changelog depth clause made consistent with the report, the contract qualified on what a semantic question does to the router, the harness token assertion split from the row). The orientation stack #155 is complete on main; rebased with `git rebase --onto <new-base> <old-base> <branch>` after every push below. Semantic rerun done and committed on `semantic` (`eval/results/2026-09-15-semantic-*`): branch reached 4/4 small, 6/6 large on semantic questions; accuracy 50%/67% semantic vs 100%/83% lexical; medium generates no orientation question; CHANGELOG, RETRIEVAL and ORIENTATION carry the numbers. Owner's report artifact https://claude.ai/artifact/L3v6gNmEh1h9h9enQ3Z2Vy republished (version 3, 2026-09-15 ~07:32Z) with every slice merged, the billing note removed and the slice 6 table; nothing of the epic remains open except the owner's decisions it lists. Lesson from #168: chain `npm test` to the commit with a real exit check (`if npm test | grep -q '^# fail 0'`), not `grep && git commit`, which pushed two red commits.
- **Slice 2 implemented earlier (superseded by the line above):** branch `branches` (worktree `v2slice`, commit cf700ef on top of worldmap): `renderBranches`, `branchOf`, `isBranch`, `branchMembers`, `BRANCH_LINES` 40, `BRANCHES_OPENED` 3, `query({within})`, `expand('<branch>@1')`, area vocabulary as a field, `isStrong` = name hit, orientation questions in the generator with `expect.branch`, `rows[arm].orientation`; skill body 300 words. The model eval reruns (`scratchpad/eval-runs/orientation.log`, results `eval/results/2026-09-14-orientation-*`) were in progress at demo done, small running. After they finish: rebase `branches` onto main (`git rebase --onto origin/main worldmap branches`), commit results, PR closing #158.
- **Slice 3 in progress:** branch `scope` (worktree `v2scope`, off branches): `src/scope.mjs` (`normalizeScope`, `checkScope`, `scopeOf` → nodes/branches/others/missing, `scopeFolders`, `describeScope`), `src/work.mjs` (`CONSTRAINTS`, `checkWorkOrder`, `checkWorkResult`, `contextPackage`, `workOrderOf`), `renderLevel0(index, {scope})`, `renderBranches(..., {only})`, router `query/expand({scope})` with `outside-scope` refusal, `level3(..., {only})`, `grant({scope})` (also-only widens), `resolve` returns `scope` (`scope-malformed` refusal), mcp resolves scope per call (`scope-missing`), `allowed` reads `grant.scope.folders`, schemas `work-order`/`work-result`. Remaining: bin (`brain allow --scope/--depth/--also`, `amibou scope`), tests, docs.
- **Eval harness gotcha:** the echo runner quoted only 4,000 characters of context, which hid page phrases behind a bounded Level 1 on large brains; it quotes 20,000 now. `pkill -f` on a stamp string killed my own shell (exit 144); start long runs with `nohup sh -c` and wait on result files with an `until` loop in a background Bash.
