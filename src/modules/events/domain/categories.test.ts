import { describe, expect, it } from 'vitest'

import { formatEventCategories } from './categories'

describe('formatEventCategories', () => {
  it('names every category in order', () => {
    expect(
      formatEventCategories([
        { id: 2, title: 'Parks' },
        { id: 5, title: 'Volunteer' },
      ]),
    ).toBe('Parks, Volunteer')
  })

  it('is empty when there are none', () => {
    expect(formatEventCategories([])).toBe('')
  })
})
