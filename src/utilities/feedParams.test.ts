import { describe, expect, it } from 'vitest'

import { isEventScope, MAX_PAGE, parsePageNumber } from './feedParams'

describe('parsePageNumber', () => {
  it.each([
    ['1', 1],
    ['12', 12],
    [String(MAX_PAGE), MAX_PAGE],
    [3, 3],
  ])('accepts %j', (input, expected) => {
    expect(parsePageNumber(input)).toBe(expected)
  })

  it.each([
    ['zero', '0'],
    ['a leading zero (a duplicate URL for page 2)', '02'],
    ['a negative number', '-1'],
    ['hex', '0x10'],
    ['exponent notation', '2e2'],
    ['a decimal', '1.5'],
    ['surrounding spaces', ' 2 '],
    ['above the sanity bound', String(MAX_PAGE + 1)],
    ['a huge number', '99999'],
    ['a non-integer number', 2.5],
    ['NaN', Number.NaN],
    ['true', true],
    ['an array', [2]],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_label, input) => {
    expect(parsePageNumber(input)).toBeNull()
  })
})

describe('isEventScope', () => {
  it('accepts only "upcoming" and "past"', () => {
    expect(isEventScope('upcoming')).toBe(true)
    expect(isEventScope('past')).toBe(true)
    expect(isEventScope('Upcoming')).toBe(false)
    expect(isEventScope('all')).toBe(false)
    expect(isEventScope(undefined)).toBe(false)
  })
})
