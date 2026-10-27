import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SocialProfile } from '../domain/socialSignIn'

vi.mock('server-only', () => ({}))

const data = vi.hoisted(() => ({
  newSocialFlow: vi.fn(),
  authorizationUrl: vi.fn(),
  finishAuthorization: vi.fn(),
  findAccountBySubject: vi.fn(),
  findAccountByEmail: vi.fn(),
  createVerifiedAccount: vi.fn(),
  createUnconfirmedAccount: vi.fn(),
  linkSubject: vi.fn(),
  startSessionFor: vi.fn(),
  saveSocialFlow: vi.fn(),
  takeSocialFlow: vi.fn(),
  savePendingLink: vi.fn(),
  takePendingLink: vi.fn(),
  resendVerification: vi.fn(),
  deleteFailedSignUp: vi.fn(),
}))
vi.mock('../data/oauthProviders', () => ({
  newSocialFlow: data.newSocialFlow,
  authorizationUrl: data.authorizationUrl,
  finishAuthorization: data.finishAuthorization,
}))
vi.mock('../data/socialAccounts', () => ({
  findAccountBySubject: data.findAccountBySubject,
  findAccountByEmail: data.findAccountByEmail,
  createVerifiedAccount: data.createVerifiedAccount,
  createUnconfirmedAccount: data.createUnconfirmedAccount,
  linkSubject: data.linkSubject,
  startSessionFor: data.startSessionFor,
  saveSocialFlow: data.saveSocialFlow,
  takeSocialFlow: data.takeSocialFlow,
  savePendingLink: data.savePendingLink,
  takePendingLink: data.takePendingLink,
}))
vi.mock('../data/signUp', () => ({
  resendVerification: data.resendVerification,
  deleteFailedSignUp: data.deleteFailedSignUp,
}))

const { finishSocialSignIn, linkWaitingSocialAccount, startSocialSignIn } =
  await import('./socialSignIn')

const flow = { provider: 'google', state: 's', codeVerifier: 'v', nonce: 'n' }
const profile = (over: Partial<SocialProfile> = {}): SocialProfile => ({
  provider: 'google',
  subject: 'g-1',
  email: 'ana@example.com',
  emailVerified: true,
  name: 'Ana',
  ...over,
})
const resident = { id: 7, role: 'resident', verified: true, lockedUntil: null }

// Each test is a different connection, so the new-account limit counts each on its own
let connection = 0
const finish = (provider: 'google' | 'facebook' = 'google', ip = `10.0.0.${++connection}`) =>
  finishSocialSignIn(provider, '?code=c&state=s', ip)

beforeEach(() => {
  for (const fn of Object.values(data)) fn.mockReset()
  vi.stubEnv('GOOGLE_CLIENT_ID', 'google-id')
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret')
  vi.stubEnv('FACEBOOK_APP_ID', 'facebook-id')
  vi.stubEnv('FACEBOOK_APP_SECRET', 'facebook-secret')
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.com')
  data.takeSocialFlow.mockResolvedValue(flow)
  data.finishAuthorization.mockResolvedValue(profile())
  data.findAccountBySubject.mockResolvedValue(null)
  data.findAccountByEmail.mockResolvedValue(null)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('startSocialSignIn', () => {
  it('keeps the checks in this browser and sends the person to the provider', async () => {
    data.newSocialFlow.mockReturnValue(flow)
    data.authorizationUrl.mockResolvedValue(new URL('https://accounts.google.com/o/oauth2/auth?x'))
    expect(await startSocialSignIn('google')).toBe('https://accounts.google.com/o/oauth2/auth?x')
    expect(data.authorizationUrl).toHaveBeenCalledWith(
      flow,
      'https://sprechereast.com/auth/google/callback',
    )
    expect(data.saveSocialFlow).toHaveBeenCalledWith(flow, expect.any(Date))
  })

  it('answers the log-in page when the provider is off or can’t be reached', async () => {
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '')
    expect(await startSocialSignIn('google')).toBe('/login?social=failed')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-secret')
    data.newSocialFlow.mockReturnValue(flow)
    data.authorizationUrl.mockRejectedValue(new Error('discovery failed'))
    expect(await startSocialSignIn('google')).toBe('/login?social=failed')
    expect(data.saveSocialFlow).not.toHaveBeenCalled()
  })
})

describe('finishSocialSignIn', () => {
  it('refuses a callback this browser didn’t start, or started for another provider', async () => {
    data.takeSocialFlow.mockResolvedValue(null)
    expect(await finish()).toBe('/login?social=failed')
    data.takeSocialFlow.mockResolvedValue(flow)
    expect(await finish('facebook')).toBe('/login?social=failed')
    expect(data.finishAuthorization).not.toHaveBeenCalled()
  })

  it('checks the answer on this site’s own callback address', async () => {
    data.findAccountBySubject.mockResolvedValue(resident)
    await finish()
    expect(data.finishAuthorization).toHaveBeenCalledWith(
      flow,
      new URL('https://sprechereast.com/auth/google/callback?code=c&state=s'),
    )
  })

  it('logs a failed check and shows only the fixed message', async () => {
    data.finishAuthorization.mockRejectedValue(new Error('state mismatch'))
    expect(await finish()).toBe('/login?social=failed')
    expect(console.error).toHaveBeenCalledOnce()
    expect(data.startSessionFor).not.toHaveBeenCalled()
  })

  it('signs a returning person in to their account', async () => {
    data.findAccountBySubject.mockResolvedValue(resident)
    expect(await finish()).toBe('/account')
    expect(data.startSessionFor).toHaveBeenCalledWith(7)
    expect(data.createVerifiedAccount).not.toHaveBeenCalled()
  })

  it('creates a verified resident for a new Google address and signs them in', async () => {
    data.createVerifiedAccount.mockResolvedValue(12)
    expect(await finish()).toBe('/account')
    expect(data.createVerifiedAccount).toHaveBeenCalledWith(profile())
    expect(data.startSessionFor).toHaveBeenCalledWith(12)
  })

  it('refuses a Google address an account already uses, and links nothing', async () => {
    data.findAccountByEmail.mockResolvedValue(resident)
    expect(await finish()).toBe('/login?social=email-in-use')
    expect(data.startSessionFor).not.toHaveBeenCalled()
    expect(data.linkSubject).not.toHaveBeenCalled()
  })

  it('sends a new Facebook address the confirmation link and remembers the link in this browser', async () => {
    data.takeSocialFlow.mockResolvedValue({ ...flow, provider: 'facebook' })
    data.finishAuthorization.mockResolvedValue(
      profile({ provider: 'facebook', subject: 'f-1', emailVerified: false }),
    )
    data.createUnconfirmedAccount.mockResolvedValue(21)
    expect(await finish('facebook')).toBe('/login?social=check-email')
    expect(data.startSessionFor).not.toHaveBeenCalled()
    expect(data.savePendingLink).toHaveBeenCalledWith(
      { provider: 'facebook', subject: 'f-1', accountId: 21, email: 'ana@example.com' },
      expect.any(Date),
    )
  })

  it('removes the Facebook account whose email failed to send, and says only that it failed', async () => {
    data.takeSocialFlow.mockResolvedValue({ ...flow, provider: 'facebook' })
    data.finishAuthorization.mockResolvedValue(profile({ provider: 'facebook' }))
    data.createUnconfirmedAccount.mockRejectedValue(new Error('SMTP down'))
    data.deleteFailedSignUp.mockResolvedValue(undefined)
    expect(await finish('facebook')).toBe('/login?social=failed')
    expect(data.deleteFailedSignUp).toHaveBeenCalledWith('ana@example.com', expect.any(Date))
    expect(data.savePendingLink).not.toHaveBeenCalled()
  })

  it('resends an unverified account’s link for Facebook, and the same answer for a verified one', async () => {
    data.takeSocialFlow.mockResolvedValue({ ...flow, provider: 'facebook' })
    data.finishAuthorization.mockResolvedValue(profile({ provider: 'facebook' }))
    data.findAccountByEmail.mockResolvedValue({ ...resident, id: 3, verified: false })
    data.resendVerification.mockResolvedValue('sent')
    expect(await finish('facebook')).toBe('/login?social=check-email')
    expect(data.savePendingLink).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 3 }),
      expect.any(Date),
    )

    data.savePendingLink.mockClear()
    data.takeSocialFlow.mockResolvedValue({ ...flow, provider: 'facebook' })
    data.findAccountByEmail.mockResolvedValue(resident)
    expect(await finish('facebook')).toBe('/login?social=check-email')
    expect(data.resendVerification).toHaveBeenCalledOnce()
    expect(data.savePendingLink).not.toHaveBeenCalled()
  })

  it('stops new accounts from one connection past the sign-up limit', async () => {
    data.createVerifiedAccount.mockResolvedValue(12)
    const answers = []
    for (let i = 0; i < 6; i++) answers.push(await finish('google', '10.9.9.9'))
    expect(answers.slice(0, 5)).toEqual(Array(5).fill('/account'))
    expect(answers[5]).toBe('/login?social=too-many')
  })
})

describe('linkWaitingSocialAccount', () => {
  const link = { provider: 'facebook', subject: 'f-1', accountId: 4, email: 'a@example.com' }

  it('links the Facebook account this browser waited to link, for that account only', async () => {
    data.takePendingLink.mockResolvedValue(link)
    await linkWaitingSocialAccount({ id: 4, email: 'a@example.com' })
    expect(data.linkSubject).toHaveBeenCalledWith(4, 'facebook', 'f-1')
  })

  it('links nothing for another account, or with no waiting link', async () => {
    data.takePendingLink.mockResolvedValue(link)
    await linkWaitingSocialAccount({ id: 5, email: 'b@example.com' })
    data.takePendingLink.mockResolvedValue(null)
    await linkWaitingSocialAccount({ id: 4, email: 'a@example.com' })
    expect(data.linkSubject).not.toHaveBeenCalled()
  })

  it('logs a link that fails: the account is verified either way', async () => {
    data.takePendingLink.mockResolvedValue(link)
    data.linkSubject.mockRejectedValue(new Error('UNIQUE constraint failed'))
    await expect(
      linkWaitingSocialAccount({ id: 4, email: 'a@example.com' }),
    ).resolves.toBeUndefined()
    expect(console.error).toHaveBeenCalledOnce()
  })
})
