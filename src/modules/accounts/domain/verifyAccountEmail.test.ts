import { describe, expect, it } from 'vitest'

import { toVerifyAccountEmail, toVerifyAccountLink } from './verifyAccountEmail'

describe('toVerifyAccountLink', () => {
  it('points at the site’s verify page, not /admin, with the token', () => {
    expect(toVerifyAccountLink('https://sprechereast.com', 'a1b2c3')).toBe(
      'https://sprechereast.com/verify-account?token=a1b2c3',
    )
  })
})

describe('toVerifyAccountEmail', () => {
  const link = 'https://sprechereast.com/verify-account?token=abc&x="y"'

  it('has a fixed subject, says what to ignore, and links as a button', () => {
    const email = toVerifyAccountEmail(link)
    expect(email.subject).toBe('Confirm your email to finish your Sprecher East account')
    expect(email.text).toContain(link)
    expect(email.html).toContain('ignore this email')
    expect(email.html).toContain('Confirm my email')
  })

  it('escapes the link inside the HTML', () => {
    const { html } = toVerifyAccountEmail(link)
    expect(html).toContain('token=abc&amp;x=&quot;y&quot;')
    expect(html).not.toContain('"y"')
  })
})
