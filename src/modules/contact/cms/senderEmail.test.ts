import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import type { EmailConfirmer } from '@/platform/payload/emailConfirmer'

import {
  markSubmissionsConfirmed,
  recordSenderEmail,
  requestSenderConfirmation,
} from './senderEmail'

const CONTACT_FORM = {
  fields: [
    { blockType: 'text', name: 'name' },
    { blockType: 'email', name: 'email' },
  ],
}

/** A confirmer that answers `confirmed` and records what it was asked to send. */
const fakeConfirmer = (confirmed = false) =>
  ({
    isConfirmed: vi.fn(async () => confirmed),
    request: vi.fn(async () => {}),
  }) satisfies EmailConfirmer

type BeforeArgs = Parameters<CollectionBeforeChangeHook>[0]
type AfterArgs = Parameters<CollectionAfterChangeHook>[0]

/** Runs recordSenderEmail for a submission with these values. */
async function record(
  confirmer: EmailConfirmer,
  data: Record<string, unknown>,
  operation = 'create',
) {
  const findByID = vi.fn(async () => CONTACT_FORM)
  const result = await recordSenderEmail(confirmer)({
    data: { form: 1, ...data },
    operation,
    req: { payload: { findByID } },
  } as unknown as BeforeArgs)
  return { result, findByID }
}

describe('recordSenderEmail', () => {
  it('records the address from the form’s email field and whether it is confirmed', async () => {
    const confirmer = fakeConfirmer(true)
    const { result, findByID } = await record(confirmer, {
      submissionData: [{ field: 'email', value: 'Ana@Example.com' }],
    })
    expect(result).toMatchObject({ senderEmail: 'ana@example.com', emailConfirmed: true })
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'forms', id: 1, overrideAccess: false }),
    )
  })

  it('overwrites what a visitor sent for these fields', async () => {
    const { result } = await record(fakeConfirmer(), {
      senderEmail: 'someone-else@example.com',
      emailConfirmed: true,
      submissionData: [{ field: 'name', value: 'Ana' }],
    })
    expect(result).toMatchObject({ senderEmail: null, emailConfirmed: false })
  })

  it('looks the form up without failing, so an unknown form gets the usual validation error', async () => {
    const { findByID } = await record(fakeConfirmer(), {
      submissionData: [{ field: 'email', value: 'ana@example.com' }],
    })
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ disableErrors: true }))
  })

  it('records no sender when the form is gone', async () => {
    const confirmer = fakeConfirmer(true)
    const result = await recordSenderEmail(confirmer)({
      data: { form: 99, submissionData: [{ field: 'email', value: 'ana@example.com' }] },
      operation: 'create',
      req: { payload: { findByID: vi.fn(async () => null) } },
    } as unknown as BeforeArgs)
    expect(result).toMatchObject({ senderEmail: null, emailConfirmed: false })
    expect(confirmer.isConfirmed).not.toHaveBeenCalled()
  })

  it('leaves updates alone', async () => {
    const confirmer = fakeConfirmer(true)
    const { result, findByID } = await record(confirmer, { emailConfirmed: true }, 'update')
    expect(result).toEqual({ form: 1, emailConfirmed: true })
    expect(findByID).not.toHaveBeenCalled()
  })
})

describe('requestSenderConfirmation', () => {
  const run = (confirmer: EmailConfirmer, data: Record<string, unknown>, operation = 'create') =>
    requestSenderConfirmation(confirmer)({
      data,
      doc: {},
      operation,
      req: {},
    } as unknown as AfterArgs)

  it('asks an unconfirmed sender to confirm', async () => {
    const confirmer = fakeConfirmer()
    await run(confirmer, { senderEmail: 'ana@example.com', emailConfirmed: false })
    expect(confirmer.request).toHaveBeenCalledWith('ana@example.com', {})
  })

  it('sends nothing to a confirmed sender, without an address, or on update', async () => {
    const confirmer = fakeConfirmer()
    await run(confirmer, { senderEmail: 'ana@example.com', emailConfirmed: true })
    await run(confirmer, { senderEmail: null, emailConfirmed: false })
    await run(confirmer, { senderEmail: 'ana@example.com', emailConfirmed: false }, 'update')
    expect(confirmer.request).not.toHaveBeenCalled()
  })
})

describe('markSubmissionsConfirmed', () => {
  it('marks every unconfirmed message from that address as confirmed', async () => {
    const update = vi.fn(async () => ({ docs: [] }))
    const req = { payload: { update } } as unknown as PayloadRequest
    await markSubmissionsConfirmed('ana@example.com', req)
    expect(update).toHaveBeenCalledWith({
      collection: 'form-submissions',
      where: {
        and: [
          { senderEmail: { equals: 'ana@example.com' } },
          { emailConfirmed: { not_equals: true } },
        ],
      },
      data: { emailConfirmed: true },
      depth: 0,
      overrideAccess: true,
      req,
    })
  })
})
