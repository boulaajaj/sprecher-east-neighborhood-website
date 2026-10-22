import { describe, expect, it } from 'vitest'

import { parseEmailAddress } from './emailAddress'

describe('parseEmailAddress', () => {
  it('trims and lowercases one address', () => {
    expect(parseEmailAddress('  Ana@Example.com ')).toBe('ana@example.com')
  })

  it('refuses lists, display names, header tricks and non-strings', () => {
    for (const value of [
      'a@example.com, b@example.com',
      'Ana <ana@example.com>',
      'ana@example.com\r\nBcc: b@example.com',
      'not an address',
      '',
      42,
      null,
      undefined,
    ]) {
      expect(parseEmailAddress(value)).toBeNull()
    }
  })

  it('refuses an address longer than SMTP allows', () => {
    expect(parseEmailAddress(`${'a'.repeat(250)}@example.com`)).toBeNull()
  })
})
