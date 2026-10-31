import { describe, expect, it } from 'vitest'

import { PUBLISHED } from '@/platform/payload/published'

import { latestPostsWhere, searchMatch } from './filters'

describe('searchMatch', () => {
  it('matches the query anywhere in the title, slug, or search-engine title or description', () => {
    expect(searchMatch('council')).toEqual({
      or: [
        { title: { like: 'council' } },
        { 'meta.description': { like: 'council' } },
        { 'meta.title': { like: 'council' } },
        { slug: { like: 'council' } },
      ],
    })
  })

  it('has no filter for an empty query, so every search entry is listed', () => {
    expect(searchMatch('')).toBeUndefined()
  })
})

describe('latestPostsWhere', () => {
  it('keeps only published posts', () => {
    expect(latestPostsWhere({})).toEqual({ and: [PUBLISHED] })
  })

  it('leaves out the given posts', () => {
    expect(latestPostsWhere({ excludeIds: [5, 2] })).toEqual({
      and: [PUBLISHED, { id: { not_in: [5, 2] } }],
    })
  })

  it('keeps only posts in one of the given categories', () => {
    expect(latestPostsWhere({ categoryIds: [1, 3] })).toEqual({
      and: [PUBLISHED, { categories: { in: [1, 3] } }],
    })
  })

  it('applies both when both are given', () => {
    expect(latestPostsWhere({ excludeIds: [5], categoryIds: [1] })).toEqual({
      and: [PUBLISHED, { id: { not_in: [5] } }, { categories: { in: [1] } }],
    })
  })

  it('ignores empty lists', () => {
    expect(latestPostsWhere({ excludeIds: [], categoryIds: [] })).toEqual({ and: [PUBLISHED] })
  })
})
