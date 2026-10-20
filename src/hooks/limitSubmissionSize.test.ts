import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import { limitSubmissionSize, SUBMISSION_LIMITS } from './limitSubmissionSize'

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

describe('limitSubmissionSize: accepts', () => {
  it('a normal contact message', () => {
    const data = [
      row('full-name', 'Ana Rivera'),
      row('email', 'ana@example.com'),
      row('message', 'Hello'),
    ]
    expect(run(data).result).toEqual({ form: 1, submissionData: data })
  })

  it('numbers and true/false values', () => {
    expect(run([row('guests', 3), row('newsletter', true)]).error).toBeUndefined()
  })

  it('a value exactly at the length limit', () => {
    expect(
      run([row('message', 'x'.repeat(SUBMISSION_LIMITS.maxValueLength))]).error,
    ).toBeUndefined()
  })

  it('submissions without data, and updates (only new submissions are checked)', () => {
    expect(run(undefined).error).toBeUndefined()
    expect(run(null).error).toBeUndefined()
    expect(run('not checked', 'update').error).toBeUndefined()
  })
})

describe('limitSubmissionSize: rejects as too large (413)', () => {
  const tooLarge = (data: unknown) => {
    const { error } = run(data)
    expect(error).toBeInstanceOf(APIError)
    expect(error?.status).toBe(413)
  }

  it('more fields than allowed', () => {
    tooLarge(Array.from({ length: SUBMISSION_LIMITS.maxFields + 1 }, (_, i) => row(`f${i}`, 'v')))
  })

  it('a field name over the limit', () => {
    tooLarge([row('f'.repeat(SUBMISSION_LIMITS.maxFieldNameLength + 1), 'v')])
  })

  it('a value over the limit', () => {
    tooLarge([row('message', 'x'.repeat(SUBMISSION_LIMITS.maxValueLength + 1))])
  })

  it('a total over the limit even when each value fits', () => {
    const half = 'x'.repeat(SUBMISSION_LIMITS.maxValueLength)
    tooLarge([row('a', half), row('b', half), row('c', 'x')])
  })
})

describe('limitSubmissionSize: rejects as malformed (400)', () => {
  it.each([
    ['submission data that is not a list', { field: 'x', value: 'y' }],
    ['a row that is not an object', ['text']],
    ['a row that is a list', [['field', 'value']]],
    ['a row that is null', [null]],
    ['a field name that is not text', [{ field: 5, value: 'v' }]],
    ['an object value', [row('message', { nested: true })]],
    ['a null value', [row('message', null)]],
  ])('%s', (_label, data) => {
    const { error } = run(data)
    expect(error).toBeInstanceOf(APIError)
    expect(error?.status).toBe(400)
  })
})
