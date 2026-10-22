import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import { SUBMISSION_LIMITS } from '../domain/submissionSize'
import { limitSubmissionSize } from './limitSubmissionSize'

type HookArgs = Parameters<typeof limitSubmissionSize>[0]

/** Runs the hook as Payload would for a new submission and returns its result or error. */
function run(submissionData: unknown, operation: 'create' | 'update' = 'create') {
  const data = { form: 1, submissionData }
  try {
    return { result: limitSubmissionSize({ data, operation } as unknown as HookArgs) }
  } catch (error) {
    return { error: error as APIError }
  }
}

const row = (field: string, value: unknown) => ({ field, value })

// The limits themselves are tested with the rule (domain/submissionSize.test.ts); this checks
// what the hook does with its answer.
describe('limitSubmissionSize', () => {
  it('lets a normal submission through unchanged', () => {
    const data = [row('full-name', 'Ana Rivera'), row('message', 'Hello')]
    expect(run(data).result).toEqual({ form: 1, submissionData: data })
  })

  it('rejects a submission over a limit with a fixed 413', () => {
    const { error } = run([row('message', 'x'.repeat(SUBMISSION_LIMITS.maxValueLength + 1))])
    expect(error).toBeInstanceOf(APIError)
    expect(error?.status).toBe(413)
    expect(error?.message).toBe(
      'Your message is too long to send. Please shorten it and try again.',
    )
  })

  it('rejects a malformed submission with a fixed 400', () => {
    const { error } = run([row('message', { nested: true })])
    expect(error).toBeInstanceOf(APIError)
    expect(error?.status).toBe(400)
    expect(error?.message).toBe('This form couldn’t be read. Please reload the page and try again.')
  })

  it('checks only new submissions, not updates', () => {
    expect(run('not checked', 'update').error).toBeUndefined()
  })
})
