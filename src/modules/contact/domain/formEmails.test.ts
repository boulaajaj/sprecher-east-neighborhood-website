import { describe, expect, it } from 'vitest'

import { type FormEmailSetting, toSafeFormEmail, hasSubmittedValue } from './formEmails'

const OWNER_FROM = 'Sprecher East <website@example.org>'

const email = (overrides: { from?: string; replyTo?: string; to?: string } = {}) => ({
  to: 'info@example.org',
  from: OWNER_FROM,
  replyTo: '',
  subject: 'Website message',
  html: '<p>Hello</p>',
  ...overrides,
})

const owner: FormEmailSetting = { emailTo: 'info@example.org' }

describe('hasSubmittedValue', () => {
  it('is true for a setting that pulls in a submitted value', () => {
    expect(hasSubmittedValue('{{email}}')).toBe(true)
    expect(hasSubmittedValue('x@example.org, {{email}}')).toBe(true)
  })

  it('is false for a fixed setting or none', () => {
    expect(hasSubmittedValue('info@example.org')).toBe(false)
    expect(hasSubmittedValue('')).toBe(false)
    expect(hasSubmittedValue(null)).toBe(false)
    expect(hasSubmittedValue(undefined)).toBe(false)
  })
})

describe('toSafeFormEmail: who it goes to', () => {
  it('sends an email to a configured recipient unchanged', () => {
    const sent = email({ replyTo: 'ana@example.com' })
    expect(toSafeFormEmail(sent, { ...owner, replyTo: '{{email}}' })).toEqual({
      send: true,
      email: sent,
      fromReplaced: false,
      replyToReplaced: false,
    })
  })

  it.each([
    ['To', { emailTo: '{{email}}' }],
    ['CC', { emailTo: 'info@example.org', cc: '{{email}}' }],
    ['BCC', { emailTo: 'info@example.org', bcc: 'x@example.org, {{email}}' }],
  ])('drops an email whose %s comes from what the visitor typed', (_label, setting) => {
    expect(toSafeFormEmail(email({ to: 'victim@example.com' }), setting)).toEqual({ send: false })
  })

  it('drops an email it cannot match to a form setting', () => {
    expect(toSafeFormEmail(email(), undefined)).toEqual({ send: false })
  })
})

describe('toSafeFormEmail: From', () => {
  it('blanks a From that comes from the visitor, so the default sender is used', () => {
    const result = toSafeFormEmail(email({ from: 'ana@example.com', replyTo: 'ana@example.com' }), {
      ...owner,
      emailFrom: '{{email}}',
    })
    // An empty From makes the email adapter use SMTP_FROM_NAME <SMTP_FROM_ADDRESS>
    expect(result).toEqual({
      send: true,
      email: email({ from: '', replyTo: 'ana@example.com' }),
      fromReplaced: true,
      replyToReplaced: false,
    })
  })
})

describe('toSafeFormEmail: Reply-To', () => {
  it('keeps a visitor Reply-To that is one address, trimmed or not', () => {
    const sent = email({ replyTo: ' ana@example.com ' })
    expect(toSafeFormEmail(sent, { ...owner, replyTo: '{{email}}' })).toMatchObject({
      send: true,
      email: sent,
      replyToReplaced: false,
    })
  })

  it.each([
    ['a list', 'a@example.com, b@example.com'],
    ['a header injection', 'ana@example.com\r\nBcc: x@example.com'],
    ['junk', 'not an address'],
    ['nothing', ''],
  ])('replaces a visitor Reply-To that is %s with the From address', (_label, replyTo) => {
    expect(toSafeFormEmail(email({ replyTo }), { ...owner, replyTo: '{{email}}' })).toEqual({
      send: true,
      email: email({ replyTo: OWNER_FROM }),
      fromReplaced: false,
      replyToReplaced: true,
    })
  })

  it('treats a missing Reply-To setting as the From setting, as the plugin does', () => {
    const result = toSafeFormEmail(email({ from: 'junk', replyTo: 'junk' }), {
      ...owner,
      emailFrom: '{{email}}',
    })
    expect(result).toEqual({
      send: true,
      email: email({ from: '', replyTo: '' }),
      fromReplaced: true,
      replyToReplaced: true,
    })
  })

  it('leaves a Reply-To the admin wrote alone', () => {
    const sent = email({ replyTo: 'not checked' })
    expect(toSafeFormEmail(sent, { ...owner, replyTo: 'board@example.org' })).toMatchObject({
      email: sent,
      replyToReplaced: false,
    })
  })
})
