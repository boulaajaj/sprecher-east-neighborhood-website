import { describe, expect, it } from 'vitest'

import { toEventSchedule, toSuggestionSlug } from './suggestion'

const CHICAGO = 'America/Chicago'

describe('toEventSchedule', () => {
  it('turns a start and end into the day and times in the site timezone', () => {
    expect(
      toEventSchedule(
        { startsAt: '2026-11-07T23:30:00.000Z', endsAt: '2026-11-08T01:00:00.000Z' },
        CHICAGO,
      ),
    ).toEqual({ date: '2026-11-07T00:00:00.000Z', timeStart: '5:30 PM', timeEnd: '7:00 PM' })
  })

  it('reads an offset, so the day is the local one', () => {
    expect(toEventSchedule({ startsAt: '2026-11-08T00:30:00-06:00' }, CHICAGO)).toEqual({
      date: '2026-11-08T00:00:00.000Z',
      timeStart: '12:30 AM',
      timeEnd: null,
    })
  })

  it('gives no times for a day alone or an all-day event', () => {
    const none = { timeStart: null, timeEnd: null }
    expect(toEventSchedule({ startsAt: '2026-11-07' }, CHICAGO)).toEqual({
      date: '2026-11-07T00:00:00.000Z',
      ...none,
    })
    expect(
      toEventSchedule({ startsAt: '2026-11-07T18:00:00-06:00', allDay: true }, CHICAGO),
    ).toEqual({ date: '2026-11-07T00:00:00.000Z', ...none })
  })

  it('leaves out an end on another day', () => {
    expect(
      toEventSchedule(
        { startsAt: '2026-11-07T18:00:00-06:00', endsAt: '2026-11-09T18:00:00-06:00' },
        CHICAGO,
      ).timeEnd,
    ).toBeNull()
  })
})

describe('toSuggestionSlug', () => {
  it('is the title in URL form with the start of the fingerprint', () => {
    expect(toSuggestionSlug('Café Night at the Park!', 'ABCDEF0123456789')).toBe(
      'cafe-night-at-the-park-abcdef01',
    )
  })

  it('stays short and never empty', () => {
    expect(toSuggestionSlug('x'.repeat(300), 'ff').length).toBeLessThanOrEqual(63)
    expect(toSuggestionSlug('!!!', '12')).toBe('suggestion-12')
  })
})
