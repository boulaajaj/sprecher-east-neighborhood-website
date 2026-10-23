import {
  APIError,
  AuthenticationError,
  Forbidden,
  LockedAuth,
  UnauthorizedError,
  UnverifiedEmail,
  ValidationError,
} from 'payload'
import { describe, expect, it } from 'vitest'

import { isRefusal, toPasswordFailure, toSignInFailure } from './failures'

const invalid = () =>
  new ValidationError({ collection: 'users', errors: [{ message: 'Bad', path: 'password' }] })

describe('toSignInFailure', () => {
  it('gives one answer for a wrong password, an unknown email, a locked or unverified account', () => {
    for (const error of [
      new AuthenticationError(),
      new LockedAuth(),
      new UnverifiedEmail({}),
      invalid(),
      new APIError('Too many', 429),
    ]) {
      expect(toSignInFailure(error)).toBe('wrong-credentials')
    }
  })

  it('tells a failure on our side apart', () => {
    expect(toSignInFailure(new APIError('Database down', 500))).toBe('server-error')
    expect(toSignInFailure(new Error('Email is required.'))).toBe('server-error')
    expect(toSignInFailure('not an error')).toBe('server-error')
  })
})

describe('isRefusal', () => {
  it('is true for each way Payload refuses a password, whatever the account’s state', () => {
    for (const error of [
      new AuthenticationError(),
      new LockedAuth(),
      new UnverifiedEmail({}),
      invalid(),
    ]) {
      expect(isRefusal(error)).toBe(true)
    }
  })

  it('is false for a failure on our side', () => {
    expect(isRefusal(new APIError('Database down', 500))).toBe(false)
    expect(isRefusal(new Error('boom'))).toBe(false)
    expect(isRefusal('not an error')).toBe(false)
  })
})

describe('toPasswordFailure', () => {
  it('asks to sign in again when Payload no longer knows or allows the account', () => {
    expect(toPasswordFailure(new UnauthorizedError())).toBe('signed-out')
    expect(toPasswordFailure(new Forbidden())).toBe('signed-out')
  })

  it('says the password was refused when Payload rejects the value', () => {
    expect(toPasswordFailure(invalid())).toBe('rejected')
  })

  it('treats anything else as a failure on our side', () => {
    expect(toPasswordFailure(new APIError('Database down', 500))).toBe('server-error')
    expect(toPasswordFailure(new APIError('Locked', 423))).toBe('server-error')
    expect(toPasswordFailure(new Error('boom'))).toBe('server-error')
  })
})
