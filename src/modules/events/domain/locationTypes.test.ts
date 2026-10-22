import { describe, expect, it } from 'vitest'

import { EVENT_LOCATION_TYPES, formatEventLocationType } from './locationTypes'

describe('EVENT_LOCATION_TYPES', () => {
  it('lists in person, virtual and hybrid', () => {
    expect(EVENT_LOCATION_TYPES.map(({ value }) => value)).toEqual([
      'in-person',
      'virtual',
      'hybrid',
    ])
  })
})

describe('formatEventLocationType', () => {
  it('names the format the way the site shows it', () => {
    expect(formatEventLocationType('in-person')).toBe('In Person')
    expect(formatEventLocationType('virtual')).toBe('Virtual')
    expect(formatEventLocationType('hybrid')).toBe('Hybrid')
  })
})
