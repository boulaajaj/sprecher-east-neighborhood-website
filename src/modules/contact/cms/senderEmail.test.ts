import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import type { EmailConfirmer } from '@/platform/payload/emailConfirmer'

import {
  markSubmissionsConfirmed,
  recordSenderEmail,
  requestSenderConfirmation,
  senderEmailFields,
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
      // Emails a visitor writes themselves would go out as written once they confirm (#287)
      heldEmails: [{ to: 'victim@example.net', from: 'ceo@bank.example', html: '<p>Pay</p>' }],
      submissionData: [{ field: 'name', value: 'Ana' }],
    })
    expect(result).toMatchObject({ senderEmail: null, emailConfirmed: false, heldEmails: null })
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

const heldEmail = {
  to: 'info@example.org',
  from: 'Sprecher East <website@example.org>',
  subject: 'Website message',
  html: '<p>Hello</p>',
}

describe('heldEmails field', () => {
  it('can’t be written or read through the API: only the server sets it (#287)', () => {
    const field = senderEmailFields.find((f) => 'name' in f && f.name === 'heldEmails')
    const access = field && 'access' in field ? field.access : undefined
    expect(field).toMatchObject({ type: 'json', hidden: true })
    for (const operation of ['create', 'update', 'read'] as const) {
      expect(access?.[operation]?.({} as never)).toBe(false)
    }
  })
})

describe('requestSenderConfirmation', () => {
  const run = (
    confirmer: EmailConfirmer,
    data: Record<string, unknown>,
    operation = 'create',
    context: Record<string, unknown> = {},
  ) => {
    const updateOne = vi.fn(async () => {})
    const req = { context, payload: { db: { updateOne }, logger: { error: vi.fn() } } }
    return requestSenderConfirmation(confirmer)({
      data,
      doc: { id: 7 },
      operation,
      req,
    } as unknown as AfterArgs).then(() => ({ req, updateOne }))
  }

  it('stores the held emails on the new message, then asks the sender to confirm (#287)', async () => {
    const confirmer = fakeConfirmer()
    const { req, updateOne } = await run(
      confirmer,
      { senderEmail: 'ana@example.com', emailConfirmed: false },
      'create',
      { heldFormEmails: [heldEmail] },
    )
    expect(updateOne).toHaveBeenCalledExactlyOnceWith({
      collection: 'form-submissions',
      id: 7,
      data: { heldEmails: [heldEmail] },
      req,
      returning: false,
    })
    expect(confirmer.request).toHaveBeenCalledWith('ana@example.com', req)
  })

  it('still asks the sender when storing the held emails fails, and logs it', async () => {
    const confirmer = fakeConfirmer()
    const updateOne = vi.fn(async () => {
      throw new Error('locked')
    })
    const error = vi.fn()
    const req = {
      context: { heldFormEmails: [heldEmail] },
      payload: { db: { updateOne }, logger: { error } },
    }
    await requestSenderConfirmation(confirmer)({
      data: { senderEmail: 'ana@example.com', emailConfirmed: false },
      doc: { id: 7 },
      operation: 'create',
      req,
    } as unknown as AfterArgs)
    expect(error).toHaveBeenCalledWith(
      'Form emails of submission 7 could not be held for confirmation (Error)',
    )
    expect(confirmer.request).toHaveBeenCalled()
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
  /** A Payload whose find returns these held messages */
  const payloadWith = (docs: unknown[]) => ({
    find: vi.fn(async () => ({ docs })),
    update: vi.fn(async () => ({ docs: [] })),
    sendEmail: vi.fn(async () => {}),
    db: { updateOne: vi.fn(async () => {}) },
    logger: { warn: vi.fn(), error: vi.fn() },
  })

  it('sends each held email once, marked confirmed, then marks the messages confirmed', async () => {
    const payload = payloadWith([
      { id: 7, heldEmails: [heldEmail] },
      { id: 8, heldEmails: null },
    ])
    const req = { payload } as unknown as PayloadRequest
    await markSubmissionsConfirmed('ana@example.com', req)

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'form-submissions',
        where: {
          and: [
            { senderEmail: { equals: 'ana@example.com' } },
            { emailConfirmed: { not_equals: true } },
          ],
        },
        overrideAccess: true,
        showHiddenFields: true,
      }),
    )
    // Cleared before it's sent, so a second confirmation finds nothing to send
    expect(payload.db.updateOne).toHaveBeenCalledExactlyOnceWith({
      collection: 'form-submissions',
      id: 7,
      data: { heldEmails: null },
      req,
      returning: false,
    })
    expect(payload.db.updateOne.mock.invocationCallOrder[0]).toBeLessThan(
      payload.sendEmail.mock.invocationCallOrder[0] ?? 0,
    )
    expect(payload.sendEmail).toHaveBeenCalledExactlyOnceWith({
      ...heldEmail,
      html: '<p>Hello</p><p>Sender’s email: confirmed.</p>',
    })
    expect(payload.update).toHaveBeenCalledWith({
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

  it('keeps releasing the other messages when one fails, and logs its id', async () => {
    const payload = payloadWith([
      { id: 7, heldEmails: [heldEmail] },
      { id: 8, heldEmails: [{ ...heldEmail, subject: 'Second' }] },
    ])
    payload.db.updateOne.mockRejectedValueOnce(new Error('locked'))
    const req = { payload } as unknown as PayloadRequest
    await markSubmissionsConfirmed('ana@example.com', req)
    expect(payload.logger.error).toHaveBeenCalledWith(
      'Held emails of form submission 7 could not be released (Error)',
    )
    expect(payload.sendEmail).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ subject: 'Second' }),
    )
  })

  it('logs a held email that fails to send, and still marks the messages', async () => {
    const payload = payloadWith([{ id: 7, heldEmails: [heldEmail] }])
    payload.sendEmail.mockRejectedValue(new Error('SMTP down for info@example.org'))
    const req = { payload } as unknown as PayloadRequest
    await markSubmissionsConfirmed('ana@example.com', req)
    expect(payload.logger.error).toHaveBeenCalledWith(
      'Held email of form submission 7 could not be sent (Error)',
    )
    expect(payload.update).toHaveBeenCalled()
  })
})

describe('takeHeldEmails', () => {
  it('hands the held emails over once, so a second submission can’t pick them up', async () => {
    const { takeHeldEmails } = await import('./heldEmails')
    const context: Record<string, unknown> = { heldFormEmails: [heldEmail] }
    expect(takeHeldEmails(context)).toEqual([heldEmail])
    expect(takeHeldEmails(context)).toEqual([])
  })
})
