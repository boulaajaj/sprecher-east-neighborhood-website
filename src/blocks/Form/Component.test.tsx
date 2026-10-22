// @vitest-environment jsdom
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TURNSTILE_TOKEN_HEADER } from '@/utilities/turnstileHeader'

// The robot check, replaced by a widget that hands out a token for each reset
const turnstile = vi.hoisted(() => ({
  tokenFor: (reset: number): string | null => `token-${reset}`,
}))
vi.mock('@/components/TurnstileWidget', async () => {
  const { useEffect } = await import('react')
  return {
    TURNSTILE_SITE_KEY: 'test-site-key',
    TurnstileWidget: ({
      onToken,
      resetSignal = 0,
    }: {
      onToken: (token: string | null) => void
      resetSignal?: number
    }) => {
      useEffect(() => onToken(turnstile.tokenFor(resetSignal)), [onToken, resetSignal])
      return null
    },
  }
})
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
// The CMS rich text isn't under test; the confirmation is a fixed line
vi.mock('@/components/RichText', () => ({
  default: () => <p>Thanks, your message is on its way.</p>,
}))

import { FormBlock } from './Component'

const form = {
  id: '7',
  title: 'Contact',
  confirmationType: 'message',
  confirmationMessage: {},
  submitButtonLabel: 'Send Message',
  fields: [
    { blockType: 'text', name: 'name', label: 'Name', required: true },
    { blockType: 'email', name: 'email', label: 'Email', required: true },
    { blockType: 'message', message: {} },
  ],
} as unknown as FormType

const fetchMock = vi.fn()

beforeEach(() => {
  turnstile.tokenFor = (reset) => `token-${reset}`
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(cleanup)

const fillAndSend = async () => {
  await userEvent.type(screen.getByRole('textbox', { name: /Name/ }), 'Ada')
  await userEvent.type(screen.getByRole('textbox', { name: /Email/ }), 'ada@example.com')
  await userEvent.click(screen.getByRole('button', { name: 'Send Message' }))
}

const sent = (call: number) => {
  const [url, init] = fetchMock.mock.calls[call] as [string, RequestInit]
  return {
    url,
    token: (init.headers as Record<string, string>)[TURNSTILE_TOKEN_HEADER],
    body: JSON.parse(String(init.body)),
  }
}

describe('FormBlock', () => {
  it('sends the robot-check token and only the form’s fields, then confirms', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 201 }))
    render(<FormBlock enableIntro={false} form={form} />)

    await fillAndSend()

    expect(fetchMock).toHaveBeenCalledOnce()
    const { url, token, body } = sent(0)
    expect(url).toMatch(/\/api\/form-submissions$/)
    expect(token).toBe('token-0')
    expect(body).toEqual({
      form: '7',
      submissionData: [
        { field: 'name', value: 'Ada' },
        { field: 'email', value: 'ada@example.com' },
      ],
    })
    expect((await screen.findByRole('status')).textContent).toBe(
      'Thanks, your message is on its way.',
    )
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('after a failure shows a fixed text, never the server’s, and retries with a fresh token', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ message: 'SQLITE_ERROR: raw detail' }] }), {
        status: 500,
      }),
    )
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 201 }))
    render(<FormBlock enableIntro={false} form={form} />)

    await fillAndSend()

    const alert = await screen.findByText(/wasn’t sent/)
    expect(alert.closest('[role="alert"]')).not.toBeNull()
    expect(document.body.textContent).not.toContain('SQLITE_ERROR')

    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(sent(0).token).toBe('token-0')
    expect(sent(1).token).toBe('token-1')
  })

  it('waits for the robot check instead of sending without a token', async () => {
    turnstile.tokenFor = () => null
    render(<FormBlock enableIntro={false} form={form} />)

    await fillAndSend()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(
      (await screen.findByText(/spam check is still running/)).closest('[role="alert"]'),
    ).not.toBeNull()
  })
})
