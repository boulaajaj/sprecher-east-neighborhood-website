import { afterEach, describe, expect, it, vi } from 'vitest'

import { isEventScope, isUpcoming } from './upcoming'

describe('isUpcoming', () => {
  const today = '2026-10-19T00:00:00.000Z'

  it('counts an event today as upcoming', () => {
    expect(isUpcoming('2026-10-19T00:00:00.000Z', today)).toBe(true)
  })

  it('counts an event on a later day as upcoming', () => {
    expect(isUpcoming('2026-10-20T00:00:00.000Z', today)).toBe(true)
  })

  it('counts an event on an earlier day as past', () => {
    expect(isUpcoming('2026-10-18T00:00:00.000Z', today)).toBe(false)
  })

  describe('with today taken from the clock in America/Chicago', () => {
    /** SITE_TIMEZONE is read when the module loads, so load a fresh copy. */
    async function todayAt(instant: string) {
      vi.resetModules()
      vi.stubEnv('SITE_TIMEZONE', 'America/Chicago')
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(instant))
      const { startOfToday } = await import('@/utilities/timezone')
      return startOfToday()
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    const oct19 = '2026-10-19T00:00:00.000Z'

    it('keeps an event upcoming until midnight in Madison, though it is already the next day in UTC', async () => {
      // 04:59:59 UTC on Oct 20 is 23:59:59 CDT on Oct 19
      expect(isUpcoming(oct19, await todayAt('2026-10-20T04:59:59.000Z'))).toBe(true)
    })

    it('makes it past at midnight in Madison', async () => {
      // 05:00 UTC on Oct 20 is 00:00 CDT on Oct 20
      expect(isUpcoming(oct19, await todayAt('2026-10-20T05:00:00.000Z'))).toBe(false)
    })

    it('turns over an hour later in winter, on standard time', async () => {
      const jan14 = '2026-01-14T00:00:00.000Z'
      // 05:59:59 UTC on Jan 15 is 23:59:59 CST on Jan 14 (UTC-6)
      expect(isUpcoming(jan14, await todayAt('2026-01-15T05:59:59.000Z'))).toBe(true)
      expect(isUpcoming(jan14, await todayAt('2026-01-15T06:00:00.000Z'))).toBe(false)
    })
  })
})

describe('isEventScope', () => {
  it('accepts only "upcoming" and "past"', () => {
    expect(isEventScope('upcoming')).toBe(true)
    expect(isEventScope('past')).toBe(true)
    expect(isEventScope('Upcoming')).toBe(false)
    expect(isEventScope('all')).toBe(false)
    expect(isEventScope(undefined)).toBe(false)
  })
})
