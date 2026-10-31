import { describe, expect, it } from 'vitest'

import { isEventScope } from './scope'

describe('isEventScope', () => {
  it('accepts only "upcoming" and "past"', () => {
    expect(isEventScope('upcoming')).toBe(true)
    expect(isEventScope('past')).toBe(true)
    expect(isEventScope('Upcoming')).toBe(false)
    expect(isEventScope('all')).toBe(false)
    expect(isEventScope(undefined)).toBe(false)
  })
})
