import type { CollectionAfterChangeHook } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fakeSubmissions } from '../testing/fakeSubmissions'

type AfterArgs = Parameters<CollectionAfterChangeHook>[0]

// The site-wide email cap is module state: each test gets a fresh one
const load = async () => {
  vi.resetModules()
  return (await import('./acknowledgeSender')).acknowledgeConfirmedSender
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://sprechereast.com')
})

const run = async (data: Record<string, unknown>, operation = 'create') => {
  const hook = await load()
  const fake = fakeSubmissions()
  const doc = { id: 7 }
  const result = await hook({ data, doc, operation, req: fake.req } as unknown as AfterArgs)
  return { ...fake, result, doc }
}

describe('acknowledgeConfirmedSender (#274)', () => {
  it('tells a sender confirmed before that their message arrived, in fixed text', async () => {
    const { sent, result, doc } = await run({
      senderEmail: 'ana@example.com',
      emailConfirmed: true,
      submissionData: [{ field: 'message', value: '<b>Typed by the visitor</b>' }],
    })
    expect(result).toBe(doc)
    expect(sent).toHaveLength(1)
    expect(sent[0]).toMatchObject({ to: 'ana@example.com', subject: 'We received your message' })
    expect(String(sent[0]?.text)).toContain('We received your message')
    expect(JSON.stringify(sent[0])).not.toContain('Typed by the visitor')
  })

  it('sends nothing to an unconfirmed sender (the welcome email follows the click), without an address, or on update', async () => {
    const unconfirmed = await run({ senderEmail: 'ana@example.com', emailConfirmed: false })
    const noAddress = await run({ senderEmail: null, emailConfirmed: true })
    const update = await run({ senderEmail: 'ana@example.com', emailConfirmed: true }, 'update')
    expect([...unconfirmed.sent, ...noAddress.sent, ...update.sent]).toEqual([])
  })

  it('logs a failed send without the address, and keeps the message', async () => {
    const hook = await load()
    const { payload, req } = fakeSubmissions()
    payload.sendEmail.mockRejectedValueOnce(new Error('SMTP down for ana@example.com'))
    const doc = { id: 7 }
    const result = await hook({
      data: { senderEmail: 'ana@example.com', emailConfirmed: true },
      doc,
      operation: 'create',
      req,
    } as unknown as AfterArgs)
    expect(result).toBe(doc)
    expect(payload.logger.error).toHaveBeenCalledWith(
      'Acknowledgment of form submission 7 could not be sent (Error)',
    )
  })
})
