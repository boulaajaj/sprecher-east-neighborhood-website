import { describe, expect, it } from 'vitest'

import { findSenderEmail, toEmailDelivery, toSenderEmailNote } from './senderEmail'

const FIELDS = [
  { blockType: 'text', name: 'name' },
  { blockType: 'email', name: 'email' },
  { blockType: 'textarea', name: 'message' },
]

describe('findSenderEmail', () => {
  it('reads the email field, trimmed and lowercase', () => {
    const rows = [
      { field: 'name', value: 'Ana' },
      { field: 'email', value: ' Ana@Example.com ' },
    ]
    expect(findSenderEmail(FIELDS, rows)).toBe('ana@example.com')
  })

  it.each(['josé@example.com', 'ana@example.c'])(
    'keeps %s, which Payload’s stricter email check would refuse',
    (address) => {
      expect(findSenderEmail(FIELDS, [{ field: 'email', value: address }])).toBe(address)
    },
  )

  it('ignores an address typed into a field that is not an email field', () => {
    expect(findSenderEmail(FIELDS, [{ field: 'message', value: 'ana@example.com' }])).toBeNull()
  })

  it('finds nothing when the email field holds a list or junk, or the form has none', () => {
    const list = [{ field: 'email', value: 'a@example.com, b@example.com' }]
    expect(findSenderEmail(FIELDS, list)).toBeNull()
    expect(findSenderEmail([{ blockType: 'text', name: 'email' }], list)).toBeNull()
    expect(findSenderEmail(undefined, undefined)).toBeNull()
  })

  it('takes the first email field that holds an address', () => {
    const fields = [...FIELDS, { blockType: 'email', name: 'otherEmail' }]
    const rows = [
      { field: 'email', value: '' },
      { field: 'otherEmail', value: 'ben@example.com' },
    ]
    expect(findSenderEmail(fields, rows)).toBe('ben@example.com')
  })
})

describe('toEmailDelivery', () => {
  const withEmail = [
    { blockType: 'text', name: 'name' },
    { blockType: 'email', name: 'email' },
  ]
  const withoutEmail = [{ blockType: 'text', name: 'name' }]

  it('holds a message whose sender hasn’t confirmed their address yet (#287)', () => {
    expect(
      toEmailDelivery({ senderEmail: 'ana@example.com', confirmed: false, fields: withEmail }),
    ).toBe('hold')
    expect(
      toEmailDelivery({ senderEmail: 'ana@example.com', confirmed: undefined, fields: withEmail }),
    ).toBe('hold')
  })

  it('sends at once when the address is confirmed, or the form asks for no email', () => {
    expect(
      toEmailDelivery({ senderEmail: 'ana@example.com', confirmed: true, fields: withEmail }),
    ).toBe('send')
    expect(toEmailDelivery({ senderEmail: null, confirmed: false, fields: withoutEmail })).toBe(
      'send',
    )
    expect(toEmailDelivery({ senderEmail: null, confirmed: false, fields: undefined })).toBe('send')
  })

  it('sends nothing when the form asks for an email but the message has none', () => {
    // A request built by hand can leave the email out to skip the confirmation
    expect(toEmailDelivery({ senderEmail: null, confirmed: false, fields: withEmail })).toBe('drop')
    expect(toEmailDelivery({ senderEmail: '', confirmed: true, fields: withEmail })).toBe('drop')
  })
})

describe('toSenderEmailNote', () => {
  it('says the sender confirmed their address: emails only go out once they have', () => {
    expect(toSenderEmailNote('ana@example.com')).toBe('Sender’s email: confirmed.')
  })

  it('says nothing when there is no sender address', () => {
    expect(toSenderEmailNote(null)).toBeNull()
    expect(toSenderEmailNote('')).toBeNull()
  })
})
