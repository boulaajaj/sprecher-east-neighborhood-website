import { randomBytes } from 'node:crypto'

import { pilotSources } from './contract.mjs'
import { mergeAcrossSources, scoutSource } from './scout.mjs'
import { runStage, runVerify, StageError } from './stages.mjs'
import { markSeen } from './state.mjs'
import { reportArguments, submitItem } from './submit.mjs'
import { isoNow } from './time.mjs'

// One run (README.md): scout every pilot source, then take each new or changed item through
// verify, curate and draft, and submit it; log the run in the CMS at the start and the end.

const COUNTS = ['seen', 'proposed', 'updates', 'rejected', 'duplicates', 'needsReview', 'deferred']
const MAX_ADAPTER_FAILURES = 3

export const newRunId = (now) =>
  `intel-${now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-')}-${randomBytes(2).toString('hex')}`

/**
 * Runs the pipeline. `cms` is a connected or dry-run CMS (cms.mjs), `ask` a model adapter
 * (model.mjs), `state` the loaded state (changed in place; the caller saves it). Answers the run
 * log as sent, plus the calls built, for the digest.
 */
export async function runPipeline({
  contract,
  cms,
  ask,
  state,
  http,
  robots,
  repoCommit,
  agentName = 'Sprecher East intelligence',
  now = () => new Date(),
}) {
  const startedAt = now()
  const { pipeline } = contract
  const budgets = pipeline.budgets ?? {}
  const runId = newRunId(startedAt)
  const counts = Object.fromEntries(COUNTS.map((k) => [k, 0]))
  const errors = []
  const cost = { inputTokens: 0, outputTokens: 0, usd: 0 }
  const calls = []
  const log = {
    runId,
    agentName,
    pipelineVersion: pipeline.version,
    repoCommit,
    startedAt: isoNow(startedAt),
    finishedAt: null,
    status: 'running',
    sourcesChecked: [],
    counts,
    errors,
    cost,
  }
  const addError = (text) => errors.length < 50 && errors.push(String(text).slice(0, 500))
  const finish = async (status) => {
    log.status = status
    log.finishedAt = isoNow(now())
    // The run's identity (runId, agent, commit, start) can't change after it starts (#336)
    const { status: s, finishedAt, sourcesChecked, counts: c, errors: e, cost: k } = log
    await cms.updateRun(docId, {
      status: s,
      finishedAt,
      sourcesChecked,
      counts: c,
      errors: e,
      cost: k,
    })
    return { log, calls }
  }

  if (pipeline.enabled === false) {
    log.status = 'disabled'
    log.finishedAt = log.startedAt
    await cms.createRun(log)
    return { log, calls }
  }
  const docId = await cms.createRun(log)

  // Measured on the real clock, whatever `now` says (tests pin it)
  const deadline = Date.now() + (budgets.maxMinutesPerRun ?? 15) * 60_000
  const taxonomy = await cms.taxonomy()
  const validateCandidate = contract.validator('schemas/candidate.schema.json')
  const validateEnvelope = contract.validator('schemas/submission.schema.json')

  // 1. Scout, in rank order
  const scouted = []
  const sources = pilotSources(contract.registry)
  for (const source of sources) {
    const result = await scoutSource(source, {
      state,
      http,
      robots,
      budgets,
      validate: validateCandidate,
      now: startedAt,
    })
    log.sourcesChecked.push(result.check)
    if (result.check.error && result.check.status !== 'skipped')
      addError(`${source.id}: ${result.check.error}`)
    for (const { candidate, errors: problems } of result.invalid) {
      const call = {
        tool: 'reportItem',
        arguments: reportArguments({ candidate }, runId, 'rejected-invalid', {
          note: `Invalid candidate: ${problems.slice(0, 3).join('; ')}.`,
          flags: [],
        }),
      }
      calls.push(call)
      await cms.reportItem(call.arguments)
      counts.rejected++
    }
    scouted.push({ source, ...result })
  }
  const candidates = mergeAcrossSources(scouted.map((s) => s.candidates))
  const deferredSources = new Set()

  // 2. Model stages and submit, one item at a time
  let modelItems = 0
  let drafts = 0
  let adapterFailures = 0
  let stopped = null
  for (const candidate of candidates) {
    const defer = () => {
      counts.deferred++
      deferredSources.add(candidate.sourceId)
    }
    if (stopped || Date.now() > deadline || modelItems >= (budgets.maxModelItemsPerRun ?? 40)) {
      stopped ??= 'stopped-budget'
      defer()
      continue
    }
    modelItems++
    const item = { candidate, taxonomy, known: await cms.known(candidate.externalId) }
    try {
      const verify = await runVerify(contract, ask, item)
      item.verification = verify.output
      const curate = await runStage(contract, ask, 'curate', item)
      item.curation = curate.output
      for (const u of [verify.usage, curate.usage]) {
        cost.inputTokens += u.input
        cost.outputTokens += u.output
      }
      const route = pipeline.routes?.[item.curation.decision] ?? 'none'
      if (route === 'submitSuggestion') {
        if (drafts >= (budgets.maxDraftsPerRun ?? 10)) {
          defer()
          continue
        }
        const draft = await runStage(contract, ask, 'draft', item)
        item.draft = draft.output
        cost.inputTokens += draft.usage.input
        cost.outputTokens += draft.usage.output
        drafts++
      }
      adapterFailures = 0
      if (route === 'none') {
        counts[item.curation.decision === 'duplicate' ? 'duplicates' : 'rejected']++
      } else {
        const result = await submitItem(item, { cms, runId, validate: validateEnvelope, route })
        calls.push(...result.calls)
        if (result.outcome === 'deferred') {
          defer()
          continue
        }
        if (result.outcome === 'created') counts.proposed++
        if (result.outcome === 'duplicate') counts.duplicates++
        if (result.outcome === 'rejected-invalid') counts.rejected++
        if (result.outcome === 'review' || item.curation.decision === 'needs-review')
          counts.needsReview++
        if (['update', 'cancel'].includes(item.curation.decision)) counts.updates++
      }
    } catch (error) {
      if (!(error instanceof StageError)) {
        // The model or the CMS is down: keep the item for the next run, and stop after a few
        adapterFailures++
        addError(`${candidate.externalId}: ${error.message}`)
        defer()
        if (adapterFailures >= MAX_ADAPTER_FAILURES) stopped = 'partial'
        continue
      }
      const call = {
        tool: 'reportItem',
        arguments: reportArguments(item, runId, 'needs-review', {
          note: `The ${error.stageId} stage failed: ${error.errors.slice(0, 3).join('; ')}.`,
        }),
      }
      calls.push(call)
      await cms.reportItem(call.arguments)
      counts.needsReview++
    }
    counts.seen++
    markSeen(state, candidate.externalId, candidate.contentHash)
  }

  // 3. A source's ETag and cursor move on only when all of its items were handled
  for (const s of scouted) {
    if (s.fetchState && !deferredSources.has(s.source.id)) state.sources[s.source.id] = s.fetchState
  }
  const status = stopped ?? (errors.length > 0 || counts.deferred > 0 ? 'partial' : 'succeeded')
  return finish(status)
}
