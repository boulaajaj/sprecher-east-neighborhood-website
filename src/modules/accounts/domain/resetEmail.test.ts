import { describe, expect, it } from 'vitest'

import { toResetPasswordEmail, toResetPasswordLink } from './resetEmail'

describe('toResetPasswordLink', () => {
  it('points at the site’s reset page, not /admin, with the token', () => {
    expect(toResetPasswordLink('https://sprechereast.com', 'a1b2c3')).toBe(
      'https://sprechereast.com/reset-password?token=a1b2c3',
    )
  })
})

describe('toResetPasswordEmail', () => {
  const link = 'https://sprechereast.com/reset-password?token=abc&x="y"'

  it('has a fixed subject, says how long the link works, and links as a button', () => {
    const email = toResetPasswordEmail(link)
    expect(email.subject).toBe('Reset your Sprecher East password')
    expect(email.text).toContain(link)
    expect(email.html).toContain('one hour')
    expect(email.html).toContain('Choose a new password')
  })

  it('escapes the link inside the HTML', () => {
    const { html } = toResetPasswordEmail(link)
    expect(html).toContain('token=abc&amp;x=&quot;y&quot;')
    expect(html).not.toContain('"y"')
  })
})
