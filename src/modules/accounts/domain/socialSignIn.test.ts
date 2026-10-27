import { describe, expect, it } from 'vitest'

import {
  decideSocialSignIn,
  enabledProviders,
  parseSocialProvider,
  providerKeys,
  type SocialAccount,
  type SocialProfile,
  toAccountName,
} from './socialSignIn'

const now = new Date('2026-10-27T12:00:00Z')

const google = (over: Partial<SocialProfile> = {}): SocialProfile => ({
  provider: 'google',
  subject: 'g-1',
  email: 'ana@example.com',
  emailVerified: true,
  name: 'Ana',
  ...over,
})
const facebook = (over: Partial<SocialProfile> = {}): SocialProfile => ({
  ...google(),
  provider: 'facebook',
  subject: 'f-1',
  emailVerified: false,
  ...over,
})
const account = (over: Partial<SocialAccount> = {}): SocialAccount => ({
  id: 7,
  role: 'resident',
  verified: true,
  lockedUntil: null,
  ...over,
})

describe('providerKeys and enabledProviders', () => {
  it('turns a provider on only when both its keys are set', () => {
    expect(providerKeys('google', { GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 's' })).toEqual({
      clientId: 'id',
      clientSecret: 's',
    })
    expect(providerKeys('google', { GOOGLE_CLIENT_ID: 'id' })).toBeNull()
    expect(providerKeys('facebook', { FACEBOOK_APP_ID: ' ', FACEBOOK_APP_SECRET: 's' })).toBeNull()
  })

  it('lists the providers that are on, Google first', () => {
    expect(enabledProviders({})).toEqual([])
    expect(
      enabledProviders({
        FACEBOOK_APP_ID: 'a',
        FACEBOOK_APP_SECRET: 'b',
        GOOGLE_CLIENT_ID: 'c',
        GOOGLE_CLIENT_SECRET: 'd',
      }),
    ).toEqual(['google', 'facebook'])
  })

  it('knows only Google and Facebook', () => {
    expect(parseSocialProvider('google')).toBe('google')
    expect(parseSocialProvider('facebook')).toBe('facebook')
    expect(parseSocialProvider('apple')).toBeNull()
    expect(parseSocialProvider('__proto__')).toBeNull()
    expect(parseSocialProvider(undefined)).toBeNull()
  })
})

describe('decideSocialSignIn', () => {
  const decide = (profile: SocialProfile, bySubject: SocialAccount | null, byEmail = bySubject) =>
    decideSocialSignIn({ profile, bySubject, byEmail, now })

  it('signs a returning person in by the subject, whatever the email now is', () => {
    expect(decide(google({ email: 'new@example.com' }), account(), null)).toEqual({
      kind: 'sign-in',
      accountId: 7,
    })
    expect(decide(facebook(), account({ id: 8 }), null)).toEqual({ kind: 'sign-in', accountId: 8 })
  })

  it('refuses a locked, unverified or agent account, with one code', () => {
    const locked = account({ lockedUntil: new Date('2026-10-27T12:05:00Z') })
    for (const bySubject of [locked, account({ verified: false }), account({ role: 'agent' })]) {
      expect(decide(google(), bySubject, null)).toEqual({ kind: 'refuse', failure: 'unavailable' })
    }
    // A lock that has run out doesn't count
    const lockOver = account({ lockedUntil: new Date('2026-10-27T11:00:00Z') })
    expect(decide(google(), lockOver, null).kind).toBe('sign-in')
  })

  it('creates a verified account for a new Google address', () => {
    expect(decide(google(), null)).toEqual({ kind: 'create-verified' })
  })

  it('never links Google to an account by its email', () => {
    expect(decide(google(), null, account())).toEqual({ kind: 'refuse', failure: 'email-in-use' })
    expect(decide(google(), null, account({ verified: false }))).toEqual({
      kind: 'refuse',
      failure: 'email-in-use',
    })
  })

  it('refuses a Google email Google hasn’t verified', () => {
    expect(decide(google({ emailVerified: false }), null)).toEqual({
      kind: 'refuse',
      failure: 'failed',
    })
  })

  it('refuses a provider answer with no email when no account is linked', () => {
    expect(decide(google({ email: null }), null)).toEqual({ kind: 'refuse', failure: 'no-email' })
    expect(decide(facebook({ email: null }), null)).toEqual({ kind: 'refuse', failure: 'no-email' })
  })

  it('sends a Facebook address to the confirmation link, and never says whether it’s in use', () => {
    expect(decide(facebook(), null)).toEqual({ kind: 'create-unconfirmed' })
    expect(decide(facebook(), null, account({ id: 3, verified: false }))).toEqual({
      kind: 'resend-link',
      accountId: 3,
    })
    // A verified account: the same "check your email", and nothing is linked or sent
    expect(decide(facebook(), null, account())).toEqual({ kind: 'check-email' })
  })
})

describe('toAccountName', () => {
  it('trims a name and keeps it to 100 characters', () => {
    expect(toAccountName('  Ana  ')).toBe('Ana')
    expect(toAccountName('   ')).toBeNull()
    expect(toAccountName(null)).toBeNull()
    expect(toAccountName('x'.repeat(150))).toHaveLength(100)
  })
})
