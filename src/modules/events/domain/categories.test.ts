import { describe, expect, it } from 'vitest'

import { EVENT_CATEGORIES, eventCategoryLabel } from './categories'

describe('EVENT_CATEGORIES', () => {
  it('lists the categories in the order editors see them', () => {
    expect(EVENT_CATEGORIES.map(({ label }) => label)).toEqual([
      'Meeting',
      'Social',
      'Volunteer',
      'Workshop',
      'Sports & Recreation',
      'Community',
      'Other',
    ])
  })

  it('stores each category under its own value', () => {
    const values = EVENT_CATEGORIES.map(({ value }) => value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('eventCategoryLabel', () => {
  it('names a category the way the site shows it', () => {
    expect(eventCategoryLabel('sports')).toBe('Sports & Recreation')
    expect(eventCategoryLabel('meeting')).toBe('Meeting')
  })
})
