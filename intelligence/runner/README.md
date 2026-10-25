# Intelligence runner

Runs the pipeline in [`../`](../README.md) once: scout the pilot sources, take each new or changed
item through verify, curate and draft, and submit suggestions and review items to the CMS
(#364). Fetching, parsing, hashing, schema checks, routing and submitting are code here; only the
three model stages go to a model, through one adapter function.

It is not site code: the website never imports it, and it has its own dependencies.

## Run it

```bash
cd intelligence/runner
npm ci
node run.mjs --dry-run --digest digest.json   # reads the CMS if a key is set, writes nothing
node run.mjs                                   # a real run
npm test                                       # unit tests and the scout and submit evals
```

| Setting                       | What it is                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `SPRECHER_EAST_MCP_KEY`       | The `agent` account's API key (Admin → Agents → API Keys). Never commit it.                    |
| `SPRECHER_EAST_MCP_URL`       | Default `https://sprechereast.com/api/mcp`                                                     |
| `SPRECHER_EAST_MODEL_COMMAND` | JSON argv that starts the OpenClaw CLI, default `["openclaw"]`                                 |
| `SPRECHER_EAST_AGENT_ID`      | The OpenClaw agent for the model stages, default `sprecher-east`                               |
| `SPRECHER_EAST_STATE`         | State file (ETags, cursors, items handled), default `~/.sprecher-east-intelligence/state.json` |

The run prints one line (what was suggested, sent for review, deferred, and errors) and exits 1
only when the run failed; the run log is in Admin → Agents → Agent Runs.

## How the parts fit

| File                  | Does                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------- |
| `lib/contract.mjs`    | Loads `pipeline.yaml`, `sources.yaml`, `coverage.md`, the prompts and the JSON Schemas |
| `lib/fetchSource.mjs` | Direct fetch: ETag and Last-Modified, 3 redirects, one retry, gates, robots.txt        |
| `lib/parsers.mjs`     | Legistar events and matters (JSON), iCalendar (recurrences expanded), RSS and Atom     |
| `lib/scout.mjs`       | Candidates with `externalId`, `contentHash` and `change`; the Legistar area filter     |
| `lib/model.mjs`       | The model adapter: OpenClaw (`openclaw agent --agent … --json`), or a fake for tests   |
| `lib/stages.mjs`      | One stage: prompt + coverage + item, schema check, one retry; verify's escalation      |
| `lib/submit.mjs`      | Routing, the MCP envelope, validation, one retry, follow-up review and image reports   |
| `lib/cms.mjs`         | The MCP client with the key, and the dry-run CMS that records writes                   |
| `lib/pipeline.mjs`    | One run: budgets, the kill switch, state and the run log                               |

## Not built yet

- **The Playwright fallback** (#352) and **HTML sources**: no pilot source needs them. A source
  without a parser is logged as `skipped`, and its evals are skipped in the tests.
- **Cost in dollars**: runs use the owner's flat subscription, so `cost.usd` is 0; token counts
  are logged when OpenClaw reports them.
