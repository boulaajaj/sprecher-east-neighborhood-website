// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

import { ConfirmEmail } from './ConfirmEmail.client'

const TOKEN = 'a'.repeat(43)
const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  // The page as the link opens it
  window.history.replaceState(null, '', `/confirm-email?token=${TOKEN}`)
})
afterEach(cleanup)

const answer = (status: number, body: unknown) =>
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }))

const clickConfirm = () => userEvent.click(screen.getByRole('button', { name: 'Confirm my email' }))

describe('ConfirmEmail', () => {
  it('does nothing until the button is clicked, then posts the token', async () => {
    answer(200, { outcome: 'confirmed' })
    render(
      <main>
        <ConfirmEmail token={TOKEN} retryHref="/contact">
          <p>Account offer</p>
        </ConfirmEmail>
      </main>,
    )
    await expectAccessible(document.body)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Account offer')).toBeNull()

    await clickConfirm()

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toMatch(/\/api\/email-confirmations\/confirm$/)
    expect(init).toMatchObject({ method: 'POST', body: JSON.stringify({ token: TOKEN }) })
    const status = await screen.findByRole('status')
    expect(status.textContent).toContain('your email is confirmed')
    expect(status.parentElement?.contains(document.activeElement)).toBe(true)
    expect(window.location.search).toBe('')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Account offer')).toBeTruthy()
    await expectAccessible(document.body)
  })

  it('says a reused link is already confirmed, and shows what comes after', async () => {
    answer(200, { outcome: 'already-confirmed' })
    render(
      <ConfirmEmail token={TOKEN} retryHref="/contact">
        <p>Account offer</p>
      </ConfirmEmail>,
    )
    await clickConfirm()
    expect((await screen.findByRole('status')).textContent).toContain('already confirmed')
    expect(screen.getByText('Account offer')).toBeTruthy()
  })

  it.each([
    ['expired', 200, { outcome: 'expired' }, 'This link has expired'],
    ['invalid', 200, { outcome: 'invalid' }, 'This link isn’t valid'],
  ])(
    'explains an %s link, points to the contact form and offers no button',
    async (_, status, body, text) => {
      answer(status, body)
      render(<ConfirmEmail token={TOKEN} retryHref="/contact" />)
      await clickConfirm()
      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toContain(text)
      expect(alert.parentElement?.contains(document.activeElement)).toBe(true)
      expect(
        screen.getByRole('link', { name: 'Go to the contact form' }).getAttribute('href'),
      ).toBe('/contact')
      expect(window.location.search).toBe('')
      expect(screen.queryByRole('button')).toBeNull()
    },
  )

  it.each([
    ['too many tries', () => answer(429, { error: 'x' }), 'Too many tries'],
    ['a server error', () => answer(500, { error: 'x' }), 'Something went wrong'],
    ['an unknown answer', () => answer(200, { outcome: 'hacked' }), 'Something went wrong'],
    ['no answer', () => fetchMock.mockRejectedValue(new TypeError('x')), 'couldn’t reach'],
  ])('lets the person try again after %s', async (_, setUp, text) => {
    setUp()
    render(<ConfirmEmail token={TOKEN} retryHref="/contact" />)
    await clickConfirm()
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain(text)
    expect(alert.parentElement?.contains(document.activeElement)).toBe(true)
    expect(window.location.search).toBe(`?token=${TOKEN}`)
    expect(screen.getByRole('button', { name: 'Confirm my email' })).toBeTruthy()
  })

  it('says a link without a usable token isn’t valid, without asking the server', async () => {
    render(
      <main>
        <ConfirmEmail token={null} retryHref="/contact" />
      </main>,
    )
    expect(screen.getByRole('alert').textContent).toContain('This link isn’t valid')
    expect(screen.getByRole('link', { name: 'Go to the contact form' })).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(document.body) // nothing steals focus on page load
    await expectAccessible(document.body)
  })
})
