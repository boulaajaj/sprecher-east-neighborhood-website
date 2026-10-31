import { describe, expect, it } from 'vitest'

import { recentPostExclusions } from './related'

describe('recentPostExclusions', () => {
  it('leaves out the post being read', () => {
    expect(recentPostExclusions({ id: 5, relatedPosts: [] })).toEqual([5])
  })

  it('also leaves out its related posts, which the sidebar already lists', () => {
    expect(recentPostExclusions({ id: 5, relatedPosts: [{ id: 2 }, { id: 9 }] })).toEqual([5, 2, 9])
  })
})
