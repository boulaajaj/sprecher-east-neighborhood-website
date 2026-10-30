import type { ArrayField } from 'payload'
import { describe, expect, it } from 'vitest'

import { TimelineBlockConfig } from './timelineBlockConfig'

const entries = TimelineBlockConfig.fields.find(
  (field): field is ArrayField => 'name' in field && field.name === 'entries',
)
if (!entries?.validate) throw new Error('The timeline has no validated entries field')
const validate = entries.validate

// What Payload passes the array's validator, as far as these checks read it
const args = {
  minRows: 2,
  maxRows: 12,
  required: true,
  req: { t: (key: string) => key },
} as unknown as Parameters<typeof validate>[1]

describe('the timeline block', () => {
  it('lets one milestone be "Next up"', async () => {
    const value = [{ status: 'done' }, { status: 'next' }, { status: 'later' }]
    expect(await validate(value, args)).toBe(true)
  })

  it('refuses two milestones marked "Next up"', async () => {
    const value = [{ status: 'next' }, { status: 'next' }]
    expect(await validate(value, args)).toMatch(/only one milestone/)
  })

  it('still applies the row limits', async () => {
    expect(await validate([{ status: 'done' }], args)).not.toBe(true)
  })
})
