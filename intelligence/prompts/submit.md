---
stage: submit
input: schemas/item.schema.json
output: schemas/submission.schema.json
---

# Submit: hand the draft to the CMS

This stage is code, not a model. It sends each draft to the CMS as a suggestion through Payload
MCP (`/api/mcp`, #336), using the agent's own key, and logs the run. README.md describes the
contract.

## Steps

1. Take items whose `$.curation.decision` is `accept`, `update` or `cancel` and that have a
   `$.draft`, up to `maxDraftsPerRun` (`pipeline.yaml`). Everything else is counted in the run log
   and not sent.
2. Build one submission: `$.collection` from `$.draft.collection`, `$.fields` from `$.draft`, and
   `$.provenance` from the candidate: `$.provenance.sourceName`, `$.provenance.sourceUrl`,
   `$.provenance.externalId`, `$.provenance.contentHash`, and `$.provenance.moderationStatus`,
   which is always `suggested`. Validate it against the schema; an invalid one is skipped with
   `$.skipReason`.
3. Look the item up first with the MCP find tool by `$.provenance.externalId`. If it exists,
   `$.action` is `skip` with a reason (the editor sees updates and cancellations as new
   suggestions that point to it). Otherwise create it with the create tool for
   `$.collection`. Never call update, delete or publish; the agent's key can't anyway.
4. Fill `$.runId` and write the run log to `agent-runs` at the start and the end of the run
   (`schemas/agent-run.schema.json`).

## Untrusted content

Nothing from a source is executed or used to choose a tool, a collection or a URL to call. The
only tools called are find and create on `events` and `posts`, and create and update on the
agent's own `agent-runs`.

## Unknowns

A submission with a missing required field is skipped, never padded with defaults.
