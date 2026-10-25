import { isTransient } from './cms.mjs'

// Submit (submit.md): route each item by its curate decision, build the whole MCP call, validate
// it against submission.schema.json, then send it, retrying a transient failure once. Code only.

const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

/** The `submitSuggestion` arguments, from the draft and the candidate (submit.md step 2). */
export function suggestionArguments(item, runId) {
  const { draft, candidate } = item
  return {
    collection: draft.collection,
    title: draft.title,
    bodyMarkdown: draft.bodyMarkdown,
    summary: draft.summary,
    categories: draft.categories,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    allDay: draft.allDay,
    venue: draft.venue,
    address: draft.address,
    audience: draft.audience,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    externalId: candidate.externalId,
    contentHash: candidate.contentHash,
    runId,
  }
}

/** One line about the candidate and the decision, for an editor (report.schema.json `summary`). */
function summaryOf(item, note) {
  const { candidate, curation } = item
  const when = candidate.startsAt ? candidate.startsAt.slice(0, 16).replace('T', ' ') : 'no date'
  const parts = [
    note,
    `${candidate.title} (${when}${candidate.locationText ? `, ${candidate.locationText}` : ''}).`,
    curation ? `Decision: ${curation.decision}. ${curation.reasons.join(' ')}` : '',
  ]
  return clip(parts.filter(Boolean).join(' '), 1000)
}

/** The `reportItem` arguments for `kind` (submit.md step 2). */
export function reportArguments(item, runId, kind, { note = '', target, flags, evidence } = {}) {
  const { candidate, curation, verification } = item
  const targetCollection = target?.collection ?? curation?.targetCollection ?? null
  const targetId = target?.id ?? curation?.targetId ?? null
  return {
    runId,
    kind,
    targetCollection,
    targetId,
    externalId: candidate.externalId ?? null,
    summary: summaryOf(item, note),
    evidence: (evidence ?? verification?.evidence ?? []).slice(0, 5),
    flags: flags ?? verification?.flags ?? [],
    sourceUrl: candidate.sourceUrl ?? null,
  }
}

/** The image-candidate evidence lines (submit.md step 4): page link, image link and credit. */
export const imageEvidence = (item) =>
  (item.draft?.imageCandidates ?? []).map((image) => ({
    url: image.pageUrl,
    says: clip(`${image.imageUrl} — credit: ${image.credit}`, 500),
    retrievedAt: item.candidate.retrievedAt,
  }))

const envelope = (tool, runId, args) => ({
  tool,
  action: 'call',
  skipReason: null,
  runId,
  arguments: args,
})

/** Sends with one retry on a transient failure; throws after the second. */
async function send(fn) {
  try {
    return await fn()
  } catch (error) {
    if (!isTransient(error)) throw error
    return fn()
  }
}

/**
 * Submits one item. `cms` has `submitSuggestion` and `reportItem`; `validate` checks an envelope
 * against submission.schema.json. Answers `{ outcome, id?, calls }`, where `calls` lists every
 * envelope built (for the dry-run digest), and outcome is one of `created`, `duplicate`,
 * `reported`, `rejected-invalid`, `review` (sent for review after a failure) or `deferred`.
 */
export async function submitItem(item, { cms, runId, validate, route }) {
  const calls = []
  const report = async (kind, options) => {
    const call = envelope('reportItem', runId, reportArguments(item, runId, kind, options))
    calls.push(call)
    await send(() => cms.reportItem(call.arguments))
  }

  if (route === 'reportItem') {
    const kind = item.curation.decision === 'needs-review' ? 'needs-review' : item.curation.decision
    await report(kind)
    return { outcome: 'reported', calls }
  }

  const call = envelope('submitSuggestion', runId, suggestionArguments(item, runId))
  calls.push(call)
  const errors = validate(call)
  if (errors.length > 0) {
    call.action = 'skip'
    call.skipReason = clip(errors.join('; '), 300)
    await report('rejected-invalid', {
      note: `Invalid suggestion: ${errors.slice(0, 3).join('; ')}.`,
      flags: [],
    })
    return { outcome: 'rejected-invalid', calls }
  }

  let answer
  try {
    answer = await send(() => cms.submitSuggestion(call.arguments))
  } catch (error) {
    try {
      await report('needs-review', {
        note: `Could not store the suggestion: ${String(error.message).slice(0, 200)}.`,
      })
      return { outcome: 'review', calls }
    } catch {
      return { outcome: 'deferred', calls }
    }
  }
  if (answer.status === 'duplicate') return { outcome: 'duplicate', id: answer.id, calls }

  const target = { collection: item.draft.collection, id: answer.id }
  const missing = item.draft.missing ?? []
  if (missing.length > 0 || item.draft.confidence === 'low') {
    await report('needs-review', {
      target,
      note: `Check before publishing: ${missing.join(', ') || 'low confidence'}.`,
    })
  }
  const images = imageEvidence(item)
  if (images.length > 0) {
    await report('needs-review', {
      target,
      flags: ['image-candidate'],
      evidence: images,
      note: 'The source shows an image. Ask for permission before using it, or keep the category image.',
    })
  }
  return { outcome: 'created', id: answer.id, calls }
}
