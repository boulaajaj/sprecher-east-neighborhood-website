import { beforeEach, describe, expect, it, vi } from 'vitest'

import { emailAdapterFromEnv } from './emailAdapter'

/** Capture the options instead of building a real SMTP transport. */
const nodemailerAdapter = vi.hoisted(() => vi.fn((options: unknown) => ({ options })))
vi.mock('@payloadcms/email-nodemailer', () => ({ nodemailerAdapter }))

type AdapterOptions = {
  defaultFromAddress: string
  defaultFromName: string
  skipVerify: boolean
  transportOptions: Record<string, unknown>
}

const lastOptions = () => nodemailerAdapter.mock.calls.at(-1)?.[0] as AdapterOptions

function setSmtp(env: Partial<Record<string, string>>) {
  const defaults = {
    SMTP_HOST: 'smtp.example.org',
    SMTP_PORT: '',
    SMTP_USER: 'postmaster@example.org',
    SMTP_PASS: 'secret',
    SMTP_FROM_ADDRESS: 'website@example.org',
    SMTP_FROM_NAME: '',
  }
  for (const [key, value] of Object.entries({ ...defaults, ...env })) vi.stubEnv(key, value ?? '')
}

beforeEach(() => {
  nodemailerAdapter.mockClear()
})

describe('emailAdapterFromEnv', () => {
  it('returns nothing without SMTP_HOST, so Payload logs emails instead', () => {
    setSmtp({ SMTP_HOST: '' })
    expect(emailAdapterFromEnv()).toBeUndefined()
    expect(nodemailerAdapter).not.toHaveBeenCalled()
  })

  it('builds a STARTTLS adapter on the default port 587 with login', () => {
    setSmtp({})
    expect(emailAdapterFromEnv()).toBeDefined()
    const options = lastOptions()
    expect(options.defaultFromAddress).toBe('website@example.org')
    expect(options.defaultFromName).toBe('Sprecher East')
    expect(options.skipVerify).toBe(true)
    expect(options.transportOptions).toMatchObject({
      host: 'smtp.example.org',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: 'postmaster@example.org', pass: 'secret' },
    })
  })

  it('uses implicit TLS on port 465', () => {
    setSmtp({ SMTP_PORT: '465' })
    emailAdapterFromEnv()
    expect(lastOptions().transportOptions).toMatchObject({
      port: 465,
      secure: true,
      requireTLS: false,
    })
  })

  it('sends no login to a local test catcher', () => {
    setSmtp({ SMTP_PORT: '1025', SMTP_USER: '', SMTP_PASS: '' })
    emailAdapterFromEnv()
    expect(lastOptions().transportOptions).toMatchObject({ requireTLS: false })
    expect(lastOptions().transportOptions).not.toHaveProperty('auth')
  })

  it('uses SMTP_FROM_NAME when set', () => {
    setSmtp({ SMTP_FROM_NAME: 'Neighborhood Website' })
    emailAdapterFromEnv()
    expect(lastOptions().defaultFromName).toBe('Neighborhood Website')
  })

  it.each([
    ['a missing From address', { SMTP_FROM_ADDRESS: '' }, 'SMTP_FROM_ADDRESS is missing'],
    [
      'a From with a display name',
      { SMTP_FROM_ADDRESS: 'Site <website@example.org>' },
      'not a single email address',
    ],
    ['a port that is not a number', { SMTP_PORT: 'abc' }, 'SMTP_PORT'],
    ['port 0', { SMTP_PORT: '0' }, 'SMTP_PORT'],
    ['a port above 65535', { SMTP_PORT: '70000' }, 'SMTP_PORT'],
    ['a fractional port', { SMTP_PORT: '587.5' }, 'SMTP_PORT'],
    ['a user without a password', { SMTP_PASS: '' }, 'SMTP_USER and SMTP_PASS'],
  ])('falls back to logging, with a clear error, on %s', (_label, env, message) => {
    setSmtp(env)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(emailAdapterFromEnv()).toBeUndefined()
    expect(nodemailerAdapter).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledOnce()
    expect(error.mock.calls[0]?.[0]).toContain('[email] SMTP disabled')
    expect(error.mock.calls[0]?.[0]).toContain(message)
  })

  it('never logs the password', () => {
    setSmtp({ SMTP_PORT: 'abc', SMTP_PASS: 'super-secret-value' })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    emailAdapterFromEnv()
    expect(error.mock.calls.flat().join(' ')).not.toContain('super-secret-value')
  })
})
