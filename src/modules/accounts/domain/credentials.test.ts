import { describe, expect, it } from 'vitest'

import { MIN_PASSWORD_LENGTH, passwordChangeSchema, signInSchema } from './credentials'

describe('signInSchema', () => {
  it('accepts an email and a password, and trims the email', () => {
    expect(signInSchema.parse({ email: ' ada@example.com ', password: ' secret ' })).toEqual({
      email: 'ada@example.com',
      password: ' secret ',
    })
  })

  it('refuses a missing or blank email and an empty password', () => {
    expect(signInSchema.safeParse({ email: '   ', password: 'secret' }).success).toBe(false)
    expect(signInSchema.safeParse({ email: 'ada@example.com', password: '' }).success).toBe(false)
    expect(signInSchema.safeParse({ password: 'secret' }).success).toBe(false)
    expect(signInSchema.safeParse(null).success).toBe(false)
  })

  it('passes on only the email and the password', () => {
    const parsed = signInSchema.parse({ email: 'a@example.com', password: 'x', role: 'admin' })
    expect(Object.keys(parsed).sort()).toEqual(['email', 'password'])
  })
})

describe('passwordChangeSchema', () => {
  const long = 'a'.repeat(MIN_PASSWORD_LENGTH)

  it('needs at least 8 characters', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8)
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1)
    expect(
      passwordChangeSchema.safeParse({ newPassword: short, confirmPassword: short }).success,
    ).toBe(false)
    expect(passwordChangeSchema.parse({ newPassword: long, confirmPassword: long })).toEqual({
      newPassword: long,
      confirmPassword: long,
    })
  })

  it('needs the two passwords to match, and says so on the confirmation', () => {
    const result = passwordChangeSchema.safeParse({
      newPassword: long,
      confirmPassword: `${long}b`,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword'])
  })

  it('refuses any other field, so nobody can name another account', () => {
    const withId = { newPassword: long, confirmPassword: long, id: 1 }
    expect(passwordChangeSchema.safeParse(withId).success).toBe(false)
  })
})
