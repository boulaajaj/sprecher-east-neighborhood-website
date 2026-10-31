import { describe, expect, it } from 'vitest'

import { toAcknowledgmentEmail } from './acknowledgment'

describe('toAcknowledgmentEmail (#274)', () => {
  it('says the message arrived, in fixed text with a link to the site', () => {
    const email = toAcknowledgmentEmail('https://sprechereast.com')
    expect(email.subject).toBe('We received your message')
    expect(email.text).toContain('We received your message')
    expect(email.text).toContain('https://sprechereast.com/')
    expect(email.html).toContain('href="https://sprechereast.com/"')
  })
})
