# Review queue

How suggested events and posts wait for staff (#123). A suggestion is anything that isn't written
by staff: later, the neighborhood agents (#255) send theirs this way. Nothing reaches the site
until an editor or admin publishes it.

## Fields

Posts and events share these sidebar fields (`REVIEW_QUEUE_FIELDS` in
`src/platform/payload/reviewQueue.ts`; the option lists in `src/platform/lib/reviewQueue.ts`):

| Field              | Type                  | Notes                                                                           |
| ------------------ | --------------------- | ------------------------------------------------------------------------------- |
| `moderationStatus` | select, indexed       | `suggested`, `approved`, `rejected`. Empty for content staff write themselves   |
| `sourceName`       | text                  | Who published it first, for example a city calendar. Required on a suggestion   |
| `sourceUrl`        | text                  | An absolute http(s) link. Required on a suggestion                              |
| `externalId`       | text, unique, indexed | The source's own ID                                                             |
| `contentHash`      | text, unique, indexed | A fingerprint of the content, computed by whoever suggests it                   |
| `audience`         | select, many          | `everyone`, `families`, `youth`, `seniors`, `volunteers`, `association-leaders` |

Events also have `cancelled` (checkbox, default false). Showing it on the site is #122.

Dates stay as they are: an event's `date` (day only) with `timeStart` and `timeEnd` in the site
timezone. Moving to Payload's timezone-aware date fields is a later decision (#270).

## Rules

`holdSuggestions` (the first `beforeChange` hook on both collections) decides:

- **Staff** (admin, editor) write as usual. When they publish an item whose status is
  `suggested`, it becomes `approved`, so it leaves the queue.
- **Anyone else**, through REST, GraphQL, MCP or a Local API call made as their user: a create
  is stored as a draft with status `suggested` whatever it sent, and is refused (400) without
  `sourceName` and an http(s) `sourceUrl`. Any other write is stored as a draft. Collection access
  already lets only staff update, so only staff can publish.
- **Our own server code** calling the Local API with no user (the seed) is not a creator, and
  is left alone.

Why a status beside `_status`: a draft can be an editor's work in progress, a suggestion waiting
for review, or a suggestion staff turned down. Drafts alone can't tell those apart.

## De-duplication

`externalId` and `contentHash` have unique indexes on the collection tables (not on the version
tables), so a second item with the same value is refused by the database. Blank values are
stored as NULL, which SQLite allows any number of times, so items without them never collide.

## In Admin

The events and posts lists show a "Review status" column and, above the table, a link to the
suggestions waiting for review (`SuggestionsFilter`, the list's `beforeListTable` slot). The link
uses the list view's own filter (`?where[moderationStatus][equals]=suggested`). Each item shows
its source in the sidebar.

Tests: `src/platform/lib/reviewQueue.test.ts` (the rules) and
`src/payload.config.reviewQueue.test.ts` (the hook and the unique indexes, on in-memory SQLite).
