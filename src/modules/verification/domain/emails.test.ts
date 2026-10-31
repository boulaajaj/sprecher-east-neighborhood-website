import { describe, expect, it } from 'vitest'

import { toConfirmationEmail, toConfirmationLink, toWelcomeEmail } from './emails'

describe('toConfirmationLink', () => {
  it('points at the confirm page on this site, with the token', () => {
    expect(toConfirmationLink('https://sprechereast.com', 'abc_-1')).toBe(
      'https://sprechereast.com/confirm-email?token=abc_-1',
    )
  })
})

describe('toConfirmationEmail', () => {
  const link = 'https://sprechereast.com/confirm-email?token=abc&x="y"'

  it('has a fixed subject and the link in the text and as a button', () => {
    const email = toConfirmationEmail(link)
    expect(email.subject).toBe('Confirm your email for Sprecher East')
    expect(email.text).toContain(link)
    expect(email.text).toContain('24 hours')
    expect(email.html).toContain('Confirm my email')
  })

  it('escapes the link inside the HTML', () => {
    const { html } = toConfirmationEmail(link)
    expect(html).toContain('token=abc&amp;x=&quot;y&quot;')
    expect(html).not.toContain('"y"')
  })
})

describe('toWelcomeEmail', () => {
  it('welcomes and thanks the person, linking to the site', () => {
    const email = toWelcomeEmail('https://sprechereast.com')
    expect(email.subject).toBe('Welcome to Sprecher East')
    expect(email.text).toContain('thanks for reaching out')
    expect(email.text).toContain('https://sprechereast.com/')
    expect(email.html).toContain('href="https://sprechereast.com/"')
  })
})
