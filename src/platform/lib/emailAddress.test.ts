import { describe, expect, it } from 'vitest'

import { isSingleAddress } from './emailAddress'

describe('isSingleAddress', () => {
  it.each(['info@example.org', 'first.last+tag@mail.example.co.uk'])('accepts %s', (value) => {
    expect(isSingleAddress(value)).toBe(true)
  })

  it.each([
    ['a list', 'a@example.org,b@example.org'],
    ['a semicolon list', 'a@example.org;b@example.org'],
    ['a display name', 'Ana <ana@example.org>'],
    ['spaces', 'ana @example.org'],
    ['a header injection', 'ana@example.org\r\nBcc: x@example.org'],
    ['no domain dot', 'ana@localhost'],
    ['no at sign', 'example.org'],
    ['empty', ''],
  ])('rejects %s', (_label, value) => {
    expect(isSingleAddress(value)).toBe(false)
  })
})
