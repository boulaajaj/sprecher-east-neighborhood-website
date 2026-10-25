#!/usr/bin/env node
// Runs the Sprecher East intelligence pipeline once (#364). See README.md in this folder.
//
//   node run.mjs                 a real run: suggestions and review items go to the CMS
//   node run.mjs --dry-run       reads the CMS (with a key) but writes nothing; prints the calls
//
// Environment: SPRECHER_EAST_MCP_KEY (the agent's API key; never in the repo),
// SPRECHER_EAST_MCP_URL, SPRECHER_EAST_MODEL_COMMAND (JSON argv of the OpenClaw CLI),
// SPRECHER_EAST_AGENT_ID, SPRECHER_EAST_STATE (state file).
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { connectCms, dryRunCms } from './lib/cms.mjs'
import { loadContract } from './lib/contract.mjs'
import { robotsChecker } from './lib/fetchSource.mjs'
import { openclawAdapter } from './lib/model.mjs'
import { runPipeline } from './lib/pipeline.mjs'
import { loadState, saveState } from './lib/state.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const { values: flags } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    intelligence: { type: 'string', default: path.resolve(here, '..') },
    state: { type: 'string' },
    digest: { type: 'string' },
  },
})
const env = process.env
const dryRun = flags['dry-run']
const statePath =
  flags.state ??
  env.SPRECHER_EAST_STATE ??
  path.join(homedir(), '.sprecher-east-intelligence', 'state.json')

function repoCommit(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {
    return '0'.repeat(40)
  }
}

function modelCommand() {
  if (!env.SPRECHER_EAST_MODEL_COMMAND) return ['openclaw']
  const argv = JSON.parse(env.SPRECHER_EAST_MODEL_COMMAND)
  if (!Array.isArray(argv) || argv.length === 0)
    throw new Error('SPRECHER_EAST_MODEL_COMMAND must be a JSON array')
  return argv
}

async function main() {
  const contract = loadContract(flags.intelligence)
  const key = env.SPRECHER_EAST_MCP_KEY
  if (!key && !dryRun)
    throw new Error('Set SPRECHER_EAST_MCP_KEY (the agent API key), or use --dry-run.')
  const url = env.SPRECHER_EAST_MCP_URL ?? 'https://sprechereast.com/api/mcp'
  const reader = key ? await connectCms({ url, apiKey: key }) : null
  const cms = dryRun ? dryRunCms(reader) : reader
  const state = loadState(statePath)
  const ask = openclawAdapter({
    command: modelCommand(),
    agentId: env.SPRECHER_EAST_AGENT_ID ?? 'sprecher-east',
  })
  try {
    const { log, calls } = await runPipeline({
      contract,
      cms,
      ask,
      state,
      http: fetch,
      robots: robotsChecker(fetch),
      repoCommit: repoCommit(flags.intelligence),
    })
    if (!dryRun) saveState(statePath, state)
    if (flags.digest)
      writeFileSync(flags.digest, `${JSON.stringify({ dryRun, log, calls }, null, 2)}\n`)
    const c = log.counts
    console.log(
      `Sprecher East intelligence ${dryRun ? 'dry run' : 'run'} ${log.runId}: ${log.status}. ` +
        `${c.proposed} suggested, ${c.needsReview} for review, ${c.updates} updates, ${c.rejected} rejected, ` +
        `${c.duplicates} duplicates, ${c.deferred} deferred.` +
        (log.errors.length ? ` Errors: ${log.errors.slice(0, 3).join(' | ')}` : ''),
    )
    process.exitCode = log.status === 'failed' ? 1 : 0
  } finally {
    await cms?.close?.()
  }
}

main().catch((error) => {
  console.error(`Sprecher East intelligence run failed: ${error.message}`)
  process.exitCode = 1
})
