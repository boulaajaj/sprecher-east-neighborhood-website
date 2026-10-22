import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { anyone } from '@/access/anyone'
import { isAdmin, isAdminOrEditor } from '@/access/roles'

import { formBuilderOptions } from './formBuilder'
import { guardFormEmails } from './guardFormEmails'
import { limitSubmissionSize } from './limitSubmissionSize'
import { rateLimitSubmissions } from './rateLimits'

// The safeguards are only as good as their wiring: each must be registered, in this order.
const submissions = formBuilderOptions.formSubmissionOverrides
const beforeChange = submissions?.hooks?.beforeChange ?? []

/** Runs a beforeChange hook for an anonymous submission with no robot-check token. */
const runAnonymous = (hook: CollectionBeforeChangeHook | undefined) =>
  hook?.({
    data: { form: 1 },
    operation: 'create',
    req: { user: null, headers: new Headers(), payload: { logger: { warn: vi.fn() } } },
  } as unknown as Parameters<CollectionBeforeChangeHook>[0])

describe('formBuilderOptions: safeguards', () => {
  it('sends every form email through guardFormEmails', () => {
    expect(formBuilderOptions.beforeEmail).toBe(guardFormEmails)
  })

  it('checks the size before anything else', () => {
    expect(submissions?.hooks?.beforeValidate).toEqual([limitSubmissionSize])
  })

  it('rate-limits before the robot check, so a limited client never reaches Cloudflare', () => {
    expect(beforeChange).toHaveLength(2)
    expect(beforeChange[0]).toBe(rateLimitSubmissions)
  })

  it('runs the robot check second: off without keys', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
    expect(await runAnonymous(beforeChange[1])).toEqual({ form: 1 })
  })

  it('runs the robot check second: with both keys, no token is refused with 400', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA')
    const error = await Promise.resolve(runAnonymous(beforeChange[1])).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(APIError)
    expect((error as APIError).status).toBe(400)
  })

  it('turns off payments', () => {
    expect(formBuilderOptions.fields).toMatchObject({ payment: false })
  })
})

describe('formBuilderOptions: access', () => {
  it('lets anyone read a form, staff change it and admins delete it', () => {
    expect(formBuilderOptions.formOverrides?.access).toEqual({
      create: isAdminOrEditor,
      read: anyone,
      update: isAdminOrEditor,
      delete: isAdmin,
    })
  })

  it('lets anyone submit, and only admins read, change or delete submissions', () => {
    const access = submissions?.access
    expect(access?.read).toBe(isAdmin)
    expect(access?.update).toBe(isAdmin)
    expect(access?.delete).toBe(isAdmin)
    expect(access?.create?.({ req: { user: null } } as Parameters<typeof isAdmin>[0])).toBe(true)
  })
})
