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

### `submitSuggestion`

Arguments: `collection` (`events` | `posts`), `title`, `bodyMarkdown`, `startsAt`, `endsAt`,
`allDay`, `venue`, `address`, `sourceName`, `sourceUrl`, `externalId`, `contentHash`, `audience`
(the `AUDIENCES` values) and `runId` (its own run). The Markdown becomes the collection's
`content` through Payload's converter (`convertMarkdownToLexical`) with that field's own editor
config. For an event, `startsAt` is required: a day (`YYYY-MM-DD`) or a date-time with offset
gives `date` and, unless `allDay`, `timeStart` and `timeEnd` in the site timezone
(`toEventSchedule`); `venue` and `address` give `locationName` and `locationAddress`. It runs as
the agent (`overrideAccess: false`), and `holdSuggestions` keeps it a draft. It answers
`{"status":"created","id"}`, or `{"status":"duplicate","id"}` when an item with the same
`externalId` or `contentHash` is stored, and counts `proposed` or `duplicates` on the run.

### `reportItem`

Arguments: `runId`, `kind` (`needs-review`, `update`, `cancel`, `rejected-invalid`),
`targetCollection` and `targetId` (ids are per collection, so the collection is required with an
id), `externalId`, `summary`, `evidence[]`, `flags[]` and `sourceUrl`. It appends the item to the
run's `reviewItems`, which editors read and filter in Admin. An agent can't rewrite or remove
review items by updating its run.

**Size caps** (`SUGGESTION_CAPS` in `domain/suggestion.ts`; the tool refuses anything larger):
title 200, body 20,000, venue 200, address 300, source name 200, source link 2,000, `externalId`
200, `contentHash` 128, summary 2,000, 20 evidence items of 1,000, 20 flags of 50.

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

`agent` (set by the server to the agent that created it), `agentName`, `repoCommit` (required:
the commit of the agents' prompts and code, 7 to 40 hex), `status` (`running`, `succeeded`,
`failed`), `startedAt` (required), `finishedAt`, `sources` (up to 100: `name`, `url`, `cursor`,
`checkedAt`), `counts` (`seen`, `proposed`, `rejected`, `duplicates`), `errorMessages` (up to 50),
`cost` (US dollars) and `reviewItems` (up to 200, from `reportItem`). Admins read every run in
Admin (Agents → Agent Runs); an agent reads only its own. Runs, keys and suggestions are in the
Payload database, so the backups (#148) cover them.

Tests: `src/modules/agents/domain/*.test.ts`, `src/platform/payload/accessPolicy.test.ts`,
`src/payload.config.agentAccess.test.ts` and `src/payload.config.agentTools.test.ts` (real MCP
requests on in-memory SQLite).
