import { describe, expect, it } from 'vitest'

import { checkSubmissionSize, SUBMISSION_LIMITS } from './submissionSize'

const row = (field: string, value: unknown) => ({ field, value })

describe('checkSubmissionSize: accepts', () => {
  it('a normal contact message', () => {
    expect(
      checkSubmissionSize([
        row('full-name', 'Ana Rivera'),
        row('email', 'ana@example.com'),
        row('message', 'Hello'),
      ]),
    ).toBe('ok')
  })

  it('numbers and true/false values', () => {
    expect(checkSubmissionSize([row('guests', 3), row('newsletter', true)])).toBe('ok')
  })

  it('a value exactly at the length limit', () => {
    expect(
      checkSubmissionSize([row('message', 'x'.repeat(SUBMISSION_LIMITS.maxValueLength))]),
    ).toBe('ok')
  })

  it('no submission data at all (Payload’s own validation handles that)', () => {
    expect(checkSubmissionSize(undefined)).toBe('ok')
    expect(checkSubmissionSize(null)).toBe('ok')
  })
})

describe('checkSubmissionSize: too large', () => {
  it('more fields than allowed', () => {
    const rows = Array.from({ length: SUBMISSION_LIMITS.maxFields + 1 }, (_, i) =>
      row(`f${i}`, 'v'),
    )
    expect(checkSubmissionSize(rows)).toBe('too-large')
  })

  it('a field name over the limit', () => {
    expect(
      checkSubmissionSize([row('f'.repeat(SUBMISSION_LIMITS.maxFieldNameLength + 1), 'v')]),
    ).toBe('too-large')
  })

  it('a value over the limit', () => {
    expect(
      checkSubmissionSize([row('message', 'x'.repeat(SUBMISSION_LIMITS.maxValueLength + 1))]),
    ).toBe('too-large')
  })

  it('a total over the limit even when each value fits', () => {
    const half = 'x'.repeat(SUBMISSION_LIMITS.maxValueLength)
    expect(checkSubmissionSize([row('a', half), row('b', half), row('c', 'x')])).toBe('too-large')
  })
})

describe('checkSubmissionSize: malformed', () => {
  it.each([
    ['submission data that is not a list', { field: 'x', value: 'y' }],
    ['a row that is not an object', ['text']],
    ['a row that is a list', [['field', 'value']]],
    ['a row that is null', [null]],
    ['a field name that is not text', [{ field: 5, value: 'v' }]],
    ['an object value', [row('message', { nested: true })]],
    ['a null value', [row('message', null)]],
  ])('%s', (_label, rows) => {
    expect(checkSubmissionSize(rows)).toBe('malformed')
  })
})
