# Agent access

How the neighborhood agents (#255) read the site's content and suggest events and posts (#336).
They use Payload's official MCP plugin (`@payloadcms/plugin-mcp`) at `/api/mcp`; the `agents`
module (`src/modules/agents/`) holds its options, two tools of ours and the run history. What
they suggest waits in the [review queue](review-queue.md) until staff publish it.

## Who can do what

An admin creates an account with the `agent` role, then an API key for it in Admin (Agents → API
Keys). Each MCP request sends the key (`Authorization: Bearer <key>`) and acts as that account,
so collection access decides, and the key's checkboxes can only narrow it. An agent has these
tools and nothing else:

| Tool                                                  | What it does                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `findEvents`, `findPosts`, `findCategories`           | Published events and posts, and categories, as allowlisted fields          |
| `submitSuggestion`                                    | Stores an event or post as an unpublished draft with status `suggested`    |
| `reportItem`                                          | Adds an item for an editor to the agent's run; never changes the content   |
| `createAgentRuns`, `findAgentRuns`, `updateAgentRuns` | Its own runs only: start one, resume from the last cursors, record the end |

The plugin's raw `create` is off for events and posts: `submitSuggestion` covers it, with the
Markdown conversion and the duplicate answer. No update, publish or delete of content, and no
`users`, `form-submissions` or other collection.

The arguments are the agents' contract in `intelligence/schemas/` (`suggestion.schema.json`,
`report.schema.json`, #344); `cms/tools/schemas.ts` checks the same names, formats and caps.

### `submitSuggestion`

Arguments: `collection` (`events` | `posts`), `title`, `bodyMarkdown`, `startsAt`, `endsAt`,
`allDay`, `venue`, `address`, `sourceName`, `sourceUrl`, `externalId` (`<source id>:<id>`),
`contentHash` (sha256, lowercase hex), `audience` (the `AUDIENCES` values, each once) and `runId`
(the `runId` of one of its own runs). The Markdown becomes the collection's `content` through
Payload's converter (`convertMarkdownToLexical`) with that field's own editor config. For an
event, `startsAt` is required (a date-time with a zone); it gives `date` and, unless `allDay`,
`timeStart` and `timeEnd` in the site timezone (`toEventSchedule`); `venue` and `address` give
`locationName` and `locationAddress`. It runs as the agent (`overrideAccess: false`), and
`holdSuggestions` keeps it a draft. It answers `{"status":"created","id"}`, or
`{"status":"duplicate","id"}` when an item with the same `externalId` or `contentHash` is stored.
The run's counts are the agent's to keep in its run log; the tool doesn't change them.

### `reportItem`

Arguments: `runId`, `kind` (`needs-review`, `update`, `cancel`, `rejected-invalid`),
`targetCollection` and `targetId` (an integer; ids are per collection, so the collection is
required with an id, and an `update` or `cancel` names both), `externalId`, `summary`,
`evidence[]` (`url`, `says`, `retrievedAt`), `flags[]` (the contract's flag values) and
`sourceUrl`. It appends the item to the run's `reviewItems`, which editors read and filter in
Admin. An agent can't rewrite or remove review items by updating its run.

**Size caps** (`SUGGESTION_CAPS` in `domain/suggestion.ts`; the tool refuses anything larger):
`runId` 100, title 120, body 3,000, venue 200, address 300, source name 200, links 2,048,
`externalId` 200, summary 1,000, 5 evidence items with `says` up to 500, 20 flags.

## Safeguards

- **Keys** (`cms/apiKeys.ts`): admin-only, and bound only to `agent` accounts. A key stops
  working when its account is no longer an agent (`checkAgentKey` in `cms/mcp.ts`).
- **No personal data to the model** (`domain/agentView.ts`): every find answer is rebuilt from
  an allowlist of fields per collection; related documents become ids; no authors, emails or
  rich text. The two tools answer only a status and an id.
- **Limits**: 60 requests a minute per key (`domain/mcpLimits.ts`), then 429. Caddy caps request
  bodies at 256 KB (`ops/caddy/form-limits.caddy`).
- **No password**: agent accounts can't sign in with a password
  (`accounts/cms/noPasswordSignInForAgents.ts`), so the key is their only credential.
- **Keys as principals**: Payload also lets a key authenticate a REST request as the key document
  itself. Role checks (`platform/payload/roles.ts`) and the site's session lookup trust only
  `users`, so such a request counts as signed out.

## Run history (`agent-runs`)

The fields of `intelligence/schemas/agent-run.schema.json`: `runId` (unique), `agentName`,
`pipelineVersion`, `repoCommit` (40 hex), `startedAt`, `finishedAt`, `status` (`running`,
`succeeded`, `partial`, `failed`, `stopped-budget`, `disabled`), `sourcesChecked` (`sourceId`,
`cursor`, `status`, `error`), `counts` (`seen`, `proposed`, `updates`, `rejected`, `duplicates`,
`needsReview`), `errors` and `cost` (`inputTokens`, `outputTokens`, `usd`). Ours on top: `agent`,
set by the server to the agent that created the run, and `reviewItems` (up to 200, from
`reportItem`). Admins read every run in Admin (Agents → Agent Runs); an agent reads only its own,
to pick up its cursors. Runs, keys and suggestions are in the Payload database, so the backups
(#148) cover them.

Tests: `src/modules/agents/domain/*.test.ts`, `src/platform/payload/accessPolicy.test.ts`,
`src/payload.config.agentAccess.test.ts` and `src/payload.config.agentTools.test.ts` (real MCP
requests on in-memory SQLite).
