import { afterEach, describe, expect, it, vi } from 'vitest'

/** SITE_TIMEZONE is read when the module loads, so each test loads a fresh copy. */
async function loadTimezone(siteTimezone?: string) {
  vi.resetModules()
  if (siteTimezone) vi.stubEnv('SITE_TIMEZONE', siteTimezone)
  else vi.stubEnv('SITE_TIMEZONE', '')
  return import('./timezone')
}

afterEach(() => {
  vi.useRealTimers()
})

describe('SITE_TIMEZONE', () => {
  it('defaults to America/Chicago', async () => {
    const { SITE_TIMEZONE } = await loadTimezone()
    expect(SITE_TIMEZONE).toBe('America/Chicago')
  })

  it('reads the SITE_TIMEZONE env var', async () => {
    const { SITE_TIMEZONE } = await loadTimezone('America/New_York')
    expect(SITE_TIMEZONE).toBe('America/New_York')
  })
})

describe('startOfToday', () => {
  it('is still yesterday in Madison when it is already tomorrow in UTC', async () => {
    const { startOfToday } = await loadTimezone()
    vi.useFakeTimers({ toFake: ['Date'] })
    // 04:30 UTC on Oct 20 is 23:30 CDT on Oct 19
    vi.setSystemTime(new Date('2026-10-20T04:30:00.000Z'))
    expect(startOfToday()).toBe('2026-10-19T00:00:00.000Z')
  })

  it('turns over at midnight in the site timezone, not at midnight UTC', async () => {
    const { startOfToday } = await loadTimezone()
    vi.useFakeTimers({ toFake: ['Date'] })
    // 05:30 UTC on Oct 20 is 00:30 CDT on Oct 20
    vi.setSystemTime(new Date('2026-10-20T05:30:00.000Z'))
    expect(startOfToday()).toBe('2026-10-20T00:00:00.000Z')
  })

  it('uses the standard-time offset in winter', async () => {
    const { startOfToday } = await loadTimezone()
    vi.useFakeTimers({ toFake: ['Date'] })
    // 05:30 UTC on Jan 15 is 23:30 CST on Jan 14 (UTC-6)
    vi.setSystemTime(new Date('2026-01-15T05:30:00.000Z'))
    expect(startOfToday()).toBe('2026-01-14T00:00:00.000Z')
  })

  it('follows a configured timezone', async () => {
    const { startOfToday } = await loadTimezone('Asia/Tokyo')
    vi.useFakeTimers({ toFake: ['Date'] })
    // 16:00 UTC on Oct 19 is 01:00 on Oct 20 in Tokyo
    vi.setSystemTime(new Date('2026-10-19T16:00:00.000Z'))
    expect(startOfToday()).toBe('2026-10-20T00:00:00.000Z')
  })
})

describe('siteTimeZoneLabel', () => {
  it('names the default timezone in words', async () => {
    const { siteTimeZoneLabel } = await loadTimezone()
    expect(siteTimeZoneLabel()).toBe('Central Time')
  })
})
