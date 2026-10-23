import { describe, expect, it } from 'vitest'

import { parseLinkToken, toLinkWithToken } from './linkToken'

describe('parseLinkToken', () => {
  it('keeps a token like the ones Payload makes', () => {
    const token = '0123456789abcdef0123456789abcdef01234567'
    expect(parseLinkToken(token)).toBe(token)
  })

  it.each([
    [undefined],
    [''],
    ['short'],
    ['a'.repeat(129)],
    ['abc def ghi jkl mno'],
    [['a'.repeat(40)]],
  ])('refuses %j', (value) => {
    expect(parseLinkToken(value)).toBeNull()
  })
})

describe('toLinkWithToken', () => {
  it('puts the token in the query string of the site’s page', () => {
    expect(toLinkWithToken('https://sprechereast.com', '/verify-account', 'a1b2c3')).toBe(
      'https://sprechereast.com/verify-account?token=a1b2c3',
    )
  })

  it('encodes the token, so it can’t add parameters', () => {
    expect(toLinkWithToken('https://sprechereast.com', '/x', 'a&b=c')).toBe(
      'https://sprechereast.com/x?token=a%26b%3Dc',
    )
  })
})
