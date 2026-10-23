import { describe, expect, it } from 'vitest'

import { parseResetToken } from './resetToken'

describe('parseResetToken', () => {
  it('keeps a token like the ones Payload makes', () => {
    const token = '0123456789abcdef0123456789abcdef01234567'
    expect(parseResetToken(token)).toBe(token)
  })

  it.each([
    [undefined],
    [''],
    ['short'],
    ['a'.repeat(129)],
    ['abc def ghi jkl mno'],
    [['a'.repeat(40)]],
  ])('refuses %j', (value) => {
    expect(parseResetToken(value)).toBeNull()
  })
})
