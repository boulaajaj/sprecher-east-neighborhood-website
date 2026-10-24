import { describe, expect, it } from 'vitest'

import { JOB_RUNNERS } from './jobRunners'

/**
 * Pins the job runners the app starts in its one PM2 process (#141, #274). A change here changes
 * when scheduled posts go live or when personal data is deleted, so it has to be deliberate.
 */
describe('JOB_RUNNERS', () => {
  it('runs the retention queue every 10 minutes and scheduled publishing every minute', () => {
    expect(JOB_RUNNERS).toEqual([
      { cron: '*/10 * * * *', queue: 'retention' },
      { cron: '* * * * *', queue: 'default', limit: 10, disableScheduling: true },
    ])
  })

  it('never runs every queue at once', () => {
    for (const runner of JOB_RUNNERS) expect(runner.allQueues).toBeUndefined()
  })
})
