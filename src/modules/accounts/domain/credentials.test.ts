import { describe, expect, it } from 'vitest'

import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  passwordChangeSchema,
  signInSchema,
} from './credentials'

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

  it('refuses any other field', () => {
    const extra = { email: 'a@example.com', password: 'x', role: 'admin' }
    expect(signInSchema.safeParse(extra).success).toBe(false)
  })

  it('refuses an email or a password longer than any real one', () => {
    const email = (length: number) => `${'a'.repeat(length - 12)}@example.com`
    expect(signInSchema.safeParse({ email: email(MAX_EMAIL_LENGTH), password: 'x' }).success).toBe(
      true,
    )
    expect(
      signInSchema.safeParse({ email: email(MAX_EMAIL_LENGTH + 1), password: 'x' }).success,
    ).toBe(false)
    const password = (length: number) => ({ email: 'a@example.com', password: 'p'.repeat(length) })
    expect(signInSchema.safeParse(password(MAX_PASSWORD_LENGTH)).success).toBe(true)
    expect(signInSchema.safeParse(password(MAX_PASSWORD_LENGTH + 1)).success).toBe(false)
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

  it('refuses a new password longer than any real one', () => {
    const at = (length: number) => {
      const password = 'p'.repeat(length)
      return passwordChangeSchema.safeParse({ newPassword: password, confirmPassword: password })
    }
    expect(MAX_PASSWORD_LENGTH).toBe(1024)
    expect(at(MAX_PASSWORD_LENGTH).success).toBe(true)
    const tooLong = at(MAX_PASSWORD_LENGTH + 1)
    expect(tooLong.success).toBe(false)
    expect(tooLong.error?.issues.map((issue) => issue.path[0])).toContain('newPassword')
  })

  it('refuses any other field, so nobody can name another account', () => {
    const withId = { newPassword: long, confirmPassword: long, id: 1 }
    expect(passwordChangeSchema.safeParse(withId).success).toBe(false)
  })
})
