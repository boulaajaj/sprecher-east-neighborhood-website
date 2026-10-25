import { composeMessage, extractJson } from './model.mjs'

// One model stage (README.md, "How a runtime loads it", step 4): the stage's prompt, coverage.md
// and the item go to the model; the answer must validate against the stage's output schema. An
// answer that doesn't validate is retried once, with the errors; then the item goes to review.

export class StageError extends Error {
  constructor(stageId, errors) {
    super(`${stageId}: the answer failed its schema twice: ${errors.slice(0, 5).join('; ')}`)
    this.stageId = stageId
    this.errors = errors
  }
}

/** Thinking levels for the pipeline's `model` setting (`none` stages never reach here). */
const THINKING = { low: 'low', medium: 'medium', high: 'high' }

/**
 * Runs `stageId` on `item` with `ask` (a model adapter). Answers `{ output, usage, attempts }`.
 * `effort` overrides the stage's own level, as verify's escalation does.
 */
export async function runStage(contract, ask, stageId, item, { effort } = {}) {
  const stage = contract.stage(stageId)
  const validate = contract.validator(stage.output)
  const base = composeMessage({
    stageId,
    prompt: contract.prompts[stageId],
    coverage: contract.coverage,
    schemas: contract.schemas,
    outputSchema: stage.output,
    item,
  })
  const usage = { input: 0, output: 0 }
  let message = base
  let errors = []
  for (let attempt = 1; attempt <= 2; attempt++) {
    const answer = await ask({ stageId, message, item, thinking: THINKING[effort ?? stage.model] })
    usage.input += answer.usage?.input ?? 0
    usage.output += answer.usage?.output ?? 0
    let output
    try {
      output = extractJson(answer.text)
      errors = validate(output)
    } catch (error) {
      errors = [error.message]
    }
    if (errors.length === 0) return { output, usage, attempts: attempt }
    message = `${base}\n\n## Your previous answer was invalid\n${errors.slice(0, 10).join('\n')}\nAnswer again with one valid JSON object.`
  }
  throw Object.assign(new StageError(stageId, errors), { usage })
}

/**
 * Verify, rerun once at high effort when its confidence is below the pipeline's threshold
 * (`escalation` in pipeline.yaml). Answers the stage result and whether it escalated.
 */
export async function runVerify(contract, ask, item) {
  const first = await runStage(contract, ask, 'verify', item)
  const { verifyBelowConfidence = 0.6, to = 'high' } = contract.pipeline.escalation ?? {}
  if (first.output.confidence >= verifyBelowConfidence) return { ...first, escalated: false }
  const second = await runStage(contract, ask, 'verify', item, { effort: to })
  const usage = {
    input: first.usage.input + second.usage.input,
    output: first.usage.output + second.usage.output,
  }
  return { ...second, usage, escalated: true }
}
