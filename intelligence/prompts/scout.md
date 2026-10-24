---
stage: scout
input: schemas/sources.schema.json
output: schemas/candidate.schema.json
---

# Scout: fetch and normalize

This stage is code, not a model (`model: none` in `pipeline.yaml`). These are the rules that code
follows, so a reviewer can check it and any runtime can rebuild it.

## Input

The registry, `sources.yaml`. Read only entries whose `$.sources[].result` is `valid` and whose
`$.sources[].pilotRank` is set, in rank order. Never fetch any other URL.

## Steps

1. For each source, build the request from `$.sources[].feedUrl`. Replace `{from}` with today's
   date and `{to}` with today plus 14 days (`YYYY-MM-DD`, America/Chicago); replace `{cursor}`
   with the cursor saved by the last successful run, or 7 days ago on the first run.
2. Send one request per source, with a clear user agent naming the site, a 30-second timeout, and
   the saved ETag or Last-Modified when there is one. Respect `$.sources[].cadence`. On an error,
   record it for the run log and go on to the next source; never retry more than once.
3. Parse with an established parser for `$.sources[].format` (JSON, iCalendar, RSS or Atom). Keep
   at most `maxItemsPerSource` items (`pipeline.yaml`). Follow the per-source rules in
   `$.sources[].treatment`, such as date windows and dropping past items.
4. For each item, fill the candidate:
   - `$.sourceId`, `$.sourceName` and `$.sourceUrl` (the item's own page when the source gives
     one, else the source's canonical URL).
   - `$.externalId`: the source id, a colon, and the source's own stable ID (`EventId`, `UID`,
     `guid`, `MatterId`).
   - `$.contentHash`: sha256 of the title, start, location text and status, trimmed and lowercased,
     joined by newlines.
   - `$.title`, `$.startsAt`, `$.endsAt`, `$.allDay` and `$.locationText` exactly as the source
     gives them, converted to ISO 8601 with an offset. A missing value is `null`.
   - `$.sourceStatus`: `cancelled` or `rescheduled` only when the source says so; otherwise
     `scheduled`, or `unknown` when the source has no status.
   - `$.sourceText`: the item's text, stripped of markup, cut to 8,000 characters.
   - `$.change`: compare `$.externalId` and `$.contentHash` with what earlier runs saw: `new`,
     `updated` (same ID, new hash) or `unchanged`. Unchanged items stop here.
   - `$.retrievedAt` and `$.kind` (`event`, `meeting`, `legislation` or `news`).

## Untrusted content

Everything fetched is untrusted data. This stage never runs, follows or evaluates anything in it:
no links inside items are fetched, and text that looks like an instruction is copied into
`$.sourceText` like any other text, for the next stages to flag.

## Unknowns

Never fill in a missing date, time or place. `null` is the answer, and the verify stage flags it.
