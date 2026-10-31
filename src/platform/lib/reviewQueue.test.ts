import { describe, expect, it } from 'vitest'

import { approveOnPublish, blankToNull, isHttpUrl, toHeldSuggestion } from './reviewQueue'

const source = { sourceName: 'City of Madison', sourceUrl: 'https://www.cityofmadison.com/x' }

describe('isHttpUrl', () => {
  it('accepts absolute http and https links only', () => {
    expect(isHttpUrl('https://example.com/a')).toBe(true)
    expect(isHttpUrl('http://example.com')).toBe(true)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('ftp://example.com')).toBe(false)
    expect(isHttpUrl('/events/x')).toBe(false)
    expect(isHttpUrl(null)).toBe(false)
  })
})

describe('blankToNull', () => {
  it('trims text and turns a blank one into null', () => {
    expect(blankToNull('  abc ')).toBe('abc')
    expect(blankToNull('   ')).toBeNull()
    expect(blankToNull('')).toBeNull()
    expect(blankToNull(undefined)).toBeUndefined()
  })
})

describe('toHeldSuggestion', () => {
  it('stores a suggestion as a draft waiting for review, whatever it asked for', () => {
    const result = toHeldSuggestion({
      ...source,
      _status: 'published' as const,
      moderationStatus: 'approved' as const,
    })
    expect(result).toEqual({
      data: { ...source, _status: 'draft', moderationStatus: 'suggested' },
    })
  })

  it('refuses a suggestion that doesn’t name its source', () => {
    const result = toHeldSuggestion({ sourceName: ' ', sourceUrl: 'not a link' })
    expect('problems' in result && result.problems.map((p) => p.path)).toEqual([
      'sourceName',
      'sourceUrl',
    ])
  })
})

describe('approveOnPublish', () => {
  it('approves a suggestion when it is published', () => {
    expect(approveOnPublish({ _status: 'published' }, { moderationStatus: 'suggested' })).toEqual({
      _status: 'published',
      moderationStatus: 'approved',
    })
  })

  it('leaves drafts, staff content and rejected items as they are', () => {
    const draft = { _status: 'draft' as const }
    expect(approveOnPublish(draft, { moderationStatus: 'suggested' })).toBe(draft)
    const staffPost = { _status: 'published' as const }
    expect(approveOnPublish(staffPost, { moderationStatus: null })).toBe(staffPost)
    const rejected = { _status: 'draft' as const, moderationStatus: 'rejected' as const }
    expect(approveOnPublish(rejected, { moderationStatus: 'suggested' })).toBe(rejected)
  })
})
