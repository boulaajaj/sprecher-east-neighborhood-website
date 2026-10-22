import { describe, expect, it } from 'vitest'

import { EVENT_LOCATION_TYPES, eventLocationTypeLabel } from './locationTypes'

describe('EVENT_LOCATION_TYPES', () => {
  it('lists in person, virtual and hybrid', () => {
    expect(EVENT_LOCATION_TYPES.map(({ value }) => value)).toEqual([
      'in-person',
      'virtual',
      'hybrid',
    ])
  })
})

describe('eventLocationTypeLabel', () => {
  it('names the format the way the site shows it', () => {
    expect(eventLocationTypeLabel('in-person')).toBe('In Person')
    expect(eventLocationTypeLabel('virtual')).toBe('Virtual')
    expect(eventLocationTypeLabel('hybrid')).toBe('Hybrid')
  })
})
