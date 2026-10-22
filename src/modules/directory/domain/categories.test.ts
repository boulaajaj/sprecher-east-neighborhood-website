import { describe, expect, it } from 'vitest'

import { FAQ_CATEGORIES, RESOURCE_CATEGORIES } from './categories'

describe('FAQ_CATEGORIES', () => {
  it('lists the FAQ categories in the order the page shows them', () => {
    expect(FAQ_CATEGORIES).toEqual([
      { value: 'general', label: 'General' },
      { value: 'membership', label: 'Membership' },
      { value: 'events', label: 'Events' },
      { value: 'neighborhood', label: 'Neighborhood' },
    ])
  })
})

describe('RESOURCE_CATEGORIES', () => {
  it('lists the resource categories in the order the page shows them', () => {
    expect(RESOURCE_CATEGORIES).toEqual([
      { value: 'elected-officials', label: 'Elected Officials' },
      { value: 'public-safety', label: 'Public Safety' },
      { value: 'childcare', label: 'Childcare & Education' },
      { value: 'renting', label: 'Renting & Housing' },
      { value: 'parks', label: 'Parks & Recreation' },
      { value: 'community', label: 'Community Organizations' },
      { value: 'utilities', label: 'Utilities & Services' },
      { value: 'other', label: 'Other' },
    ])
  })
})

describe.each([
  ['FAQ_CATEGORIES', FAQ_CATEGORIES],
  ['RESOURCE_CATEGORIES', RESOURCE_CATEGORIES],
])('%s', (_, categories) => {
  it('stores each category under its own value', () => {
    const values = categories.map(({ value }) => value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('gives every category a label', () => {
    for (const { label } of categories) expect(label.trim()).not.toBe('')
  })
})
