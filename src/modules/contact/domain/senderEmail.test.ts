import { describe, expect, it } from 'vitest'

import { findSenderEmail, toSenderEmailNote } from './senderEmail'

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

describe('toSenderEmailNote', () => {
  it('says whether the sender confirmed their address', () => {
    expect(toSenderEmailNote('ana@example.com', true)).toBe('Sender’s email: confirmed.')
    expect(toSenderEmailNote('ana@example.com', false)).toMatch(
      /^Sender’s email: not confirmed yet/,
    )
  })

  it('says nothing when there is no sender address', () => {
    expect(toSenderEmailNote(null, false)).toBeNull()
    expect(toSenderEmailNote('', true)).toBeNull()
  })
})
