import { describe, expect, it } from 'vitest'

import { formatAuthors } from './authors'

describe('formatAuthors', () => {
  it('returns an empty string when there are no authors', () => {
    expect(formatAuthors([])).toBe('')
  })

  it('returns a single name as it is', () => {
    expect(formatAuthors(['Ana'])).toBe('Ana')
  })

  it('joins two names with "and"', () => {
    expect(formatAuthors(['Ana', 'Ben'])).toBe('Ana and Ben')
  })

  it('separates three or more names with commas and "and" before the last, without a serial comma', () => {
    expect(formatAuthors(['Ana', 'Ben', 'Cy'])).toBe('Ana, Ben and Cy')
    expect(formatAuthors(['Ana', 'Ben', 'Cy', 'Di'])).toBe('Ana, Ben, Cy and Di')
  })
})
