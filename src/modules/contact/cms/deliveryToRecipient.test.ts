import type { FormattedEmail } from '@payloadcms/plugin-form-builder/types'
import type { CollectionAfterChangeHook } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import type { EmailConfirmer } from '@/platform/payload/emailConfirmer'

import { fakeSubmissions } from '../testing/fakeSubmissions'

type AfterArgs = Parameters<CollectionAfterChangeHook>[0]

// The whole way of one message from an unconfirmed sender (#274): held when it is sent, stored on
// the message, then released when the sender confirms, to the recipient the form names in Admin
const CONTACT_FORM = {
  id: 1,
  fields: [{ blockType: 'email', name: 'email' }],
  emails: [{ emailTo: 'team@example.org', replyTo: '{{email}}', subject: 'Website message' }],
}

/** The email the form builder makes from that setting: To is the configured recipient. */
const ownerEmail: FormattedEmail = {
  to: 'team@example.org',
  from: '',
  replyTo: 'ana@example.com',
  subject: 'Website message',
  html: '<div>New message</div>',
}

describe('a verified message reaches the form’s configured recipient (#274)', () => {
  it('holds it until the click, then sends it to that recipient only, once', async () => {
    // Fresh email cap
    vi.resetModules()
    const { guardFormEmails } = await import('./guardFormEmails')
    const { markSubmissionsConfirmed, requestSenderConfirmation } = await import('./senderEmail')

    const data = { form: 1, senderEmail: 'ana@example.com', emailConfirmed: false }
    const { docs, sent, req } = fakeSubmissions(
      [{ id: 7, ...data, heldEmails: null }],
      CONTACT_FORM,
    )
    const confirmer: EmailConfirmer = { isConfirmed: vi.fn(), request: vi.fn(async () => {}) }

    // 1. Sent: nothing goes out, the emails wait on the message
    expect(await guardFormEmails([ownerEmail], { data, req } as never)).toEqual([])
    await requestSenderConfirmation(confirmer)({
      data,
      doc: { id: 7 },
      operation: 'create',
      req,
    } as unknown as AfterArgs)
    expect(sent).toEqual([])
    expect(confirmer.request).toHaveBeenCalledWith('ana@example.com', req)
    expect(docs[0]?.heldEmails).toEqual([ownerEmail])

    // 2. Confirmed: the message goes to the form's recipient, marked confirmed
    await markSubmissionsConfirmed('ana@example.com', req)
    expect(sent).toEqual([
      { ...ownerEmail, html: '<div>New message</div><p>Sender’s email: confirmed.</p>' },
    ])
    expect(docs[0]).toMatchObject({ emailConfirmed: true, heldEmails: null })

    // 3. A second confirmation sends nothing more
    await markSubmissionsConfirmed('ana@example.com', req)
    expect(sent).toHaveLength(1)
  })
})
