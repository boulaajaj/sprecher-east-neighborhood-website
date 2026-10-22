import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** The email cap keeps a per-process counter, so every test loads a fresh copy. */
async function loadGuards() {
  vi.resetModules()
  return import('./guardFormEmails')
}

type Guards = Awaited<ReturnType<typeof loadGuards>>
type BeforeEmailArgs = Parameters<Guards['guardFormEmails']>
type Email = BeforeEmailArgs[0][number]

const HOUR = 60 * 60 * 1000

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-20T12:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('guardFormEmails', () => {
  type Template = {
    emailTo?: string
    cc?: string
    bcc?: string
    replyTo?: string
    emailFrom?: string
  }

  /** Runs the guard against a form whose email settings are `templates`. */
  async function send(
    emails: Email[],
    templates: Template[],
    formId: unknown = 1,
    guards?: Guards,
  ) {
    const g = guards ?? (await loadGuards())
    const warn = vi.fn()
    const findByID = vi.fn(async () => ({ id: 1, emails: templates }))
    const result = await g.guardFormEmails(emails, {
      data: { form: formId },
      req: { payload: { findByID, logger: { warn } } },
    } as unknown as BeforeEmailArgs[1])
    return { result, warn, findByID }
  }

  const email = (overrides: Partial<Email> = {}): Email =>
    ({
      to: 'info@example.org',
      from: 'Sprecher East <website@example.org>',
      subject: 'Website message',
      html: '<p>Hello</p>',
      ...overrides,
    }) as Email

  it('sends an email addressed to a configured recipient unchanged', async () => {
    const owner = email({ replyTo: 'ana@example.com' })
    const { result, warn } = await send(
      [owner],
      [{ emailTo: 'info@example.org', replyTo: '{{email}}' }],
    )
    expect(result).toEqual([owner])
    expect(warn).not.toHaveBeenCalled()
  })

  it.each([
    ['To', { emailTo: '{{email}}' }],
    ['CC', { emailTo: 'info@example.org', cc: '{{email}}' }],
    ['BCC', { emailTo: 'info@example.org', bcc: 'x@example.org, {{email}}' }],
  ])('drops an email whose %s comes from what the visitor typed', async (_label, template) => {
    const { result, warn } = await send([email({ to: 'victim@example.com' })], [template])
    expect(result).toEqual([])
    expect(warn).toHaveBeenCalledWith('Form email addressed from submitted data was not sent')
  })

  it('decides per email, keeping the owner notification when the visitor copy is dropped', async () => {
    const visitorCopy = email({ to: 'ana@example.com' })
    const owner = email()
    const { result } = await send(
      [visitorCopy, owner],
      [{ emailTo: '{{email}}' }, { emailTo: 'info@example.org' }],
    )
    expect(result).toEqual([owner])
  })

  it('drops emails it cannot match to a form setting, and everything without a form', async () => {
    expect((await send([email(), email()], [{ emailTo: 'info@example.org' }])).result).toHaveLength(
      1,
    )
    const noForm = await send([email()], [{ emailTo: 'info@example.org' }], null)
    expect(noForm.result).toEqual([])
    expect(noForm.findByID).not.toHaveBeenCalled()
  })

  it('reads the form id from a populated form too', async () => {
    const { result, findByID } = await send([email()], [{ emailTo: 'info@example.org' }], { id: 1 })
    expect(result).toHaveLength(1)
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', id: 1 }))
  })

  it('sends from the default address when From comes from the visitor', async () => {
    const { result, warn } = await send(
      [email({ from: 'ana@example.com', replyTo: 'ana@example.com' })],
      [{ emailTo: 'info@example.org', emailFrom: '{{email}}' }],
    )
    // An empty From makes the email adapter use SMTP_FROM_NAME <SMTP_FROM_ADDRESS>
    expect(result).toEqual([email({ from: '', replyTo: 'ana@example.com' })])
    expect(warn).toHaveBeenCalledWith(
      'Form email From used submitted data; sent from the default address',
    )
  })

  it.each([
    ['a list', 'a@example.com, b@example.com'],
    ['a header injection', 'ana@example.com\r\nBcc: x@example.com'],
    ['junk', 'not an address'],
    ['nothing', ''],
  ])('replaces a visitor Reply-To that is %s with the From address', async (_label, replyTo) => {
    const { result, warn } = await send(
      [email({ replyTo })],
      [{ emailTo: 'info@example.org', replyTo: '{{email}}' }],
    )
    expect(result).toEqual([email({ replyTo: 'Sprecher East <website@example.org>' })])
    expect(warn).toHaveBeenCalledOnce()
  })

  it('caps form emails at 30 an hour across all submissions, warning once', async () => {
    const guards = await loadGuards()
    const templates = [{ emailTo: 'info@example.org' }]
    let sent = 0
    let warnings = 0
    for (let i = 0; i < 35; i++) {
      const { result, warn } = await send([email()], templates, 1, guards)
      sent += result.length
      warnings += warn.mock.calls.length
    }
    expect(sent).toBe(30)
    expect(warnings).toBe(1)

    vi.setSystemTime(Date.now() + HOUR)
    expect((await send([email()], templates, 1, guards)).result).toHaveLength(1)
  })
})
