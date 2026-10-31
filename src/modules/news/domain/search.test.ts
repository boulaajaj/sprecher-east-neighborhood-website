import { describe, expect, it } from 'vitest'

import { parseSearchQuery, toSearchHref } from './search'

describe('parseSearchQuery', () => {
  it('takes the query from the address, without spaces around it', () => {
    expect(parseSearchQuery('  council ')).toBe('council')
  })

  it('takes the first query when the address repeats it (?q=a&q=b)', () => {
    expect(parseSearchQuery(['park', 'council'])).toBe('park')
  })

  it('treats a missing query, or one of only spaces, as no query', () => {
    expect(parseSearchQuery(undefined)).toBe('')
    expect(parseSearchQuery('   ')).toBe('')
    expect(parseSearchQuery([])).toBe('')
  })
})

describe('toSearchHref', () => {
  it('puts the trimmed query in the address, encoded', () => {
    expect(toSearchHref(' bike & walk ')).toBe('/search?q=bike%20%26%20walk')
  })

  it('links to the plain search page when there is no query', () => {
    expect(toSearchHref('')).toBe('/search')
    expect(toSearchHref('   ')).toBe('/search')
  })
})
