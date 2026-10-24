// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useConfirmedEmail } from '@/platform/ui/ConfirmedEmail.client'
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

const clickTryAgain = () => userEvent.click(screen.getByRole('button', { name: 'Try Again' }))

describe('ConfirmEmail', () => {
  it('confirms as soon as the page loads, without a click (#300)', async () => {
    answer(200, { outcome: 'confirmed' })
    render(
      <main>
        <ConfirmEmail token={TOKEN} retryHref="/contact">
          <p>Account offer</p>
        </ConfirmEmail>
      </main>,
    )
    expect(screen.getByRole('status').textContent).toContain('Confirming your email')
    expect(screen.queryByText('Account offer')).toBeNull()
    await expectAccessible(document.body)

    await screen.findByText(/your email is confirmed/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(String(url)).toMatch(/\/api\/email-confirmations\/confirm$/)
    expect(init).toMatchObject({ method: 'POST', body: JSON.stringify({ token: TOKEN }) })
    // The same live region that said "Confirming" now holds the answer, so it is announced
    expect(screen.getByRole('status').textContent).toContain('your email is confirmed')
    expect(document.activeElement).toBe(document.body) // nothing steals focus on page load
    expect(window.location.search).toBe('')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Account offer')).toBeTruthy()
    await expectAccessible(document.body)
  })

  it('gives what comes after the confirmed address the endpoint answered with', async () => {
    answer(200, { outcome: 'confirmed', email: 'ana@example.com' })
    const Slot = () => <p>Offer for {useConfirmedEmail() ?? 'nobody'}</p>
    render(
      <ConfirmEmail token={TOKEN} retryHref="/contact">
        <Slot />
      </ConfirmEmail>,
    )
    expect(await screen.findByText('Offer for ana@example.com')).toBeTruthy()
  })

  it('gives no address when the answer has none, or not a plain one', async () => {
    answer(200, { outcome: 'already-confirmed', email: 'a@b.co, c@d.co' })
    const Slot = () => <p>Offer for {useConfirmedEmail() ?? 'nobody'}</p>
    render(
      <ConfirmEmail token={TOKEN} retryHref="/contact">
        <Slot />
      </ConfirmEmail>,
    )
    expect(await screen.findByText('Offer for nobody')).toBeTruthy()
  })

  it('says a reused link is already confirmed, and shows what comes after', async () => {
    answer(200, { outcome: 'already-confirmed' })
    render(
      <ConfirmEmail token={TOKEN} retryHref="/contact">
        <p>Account offer</p>
      </ConfirmEmail>,
    )
    expect(await screen.findByText(/already confirmed/)).toBeTruthy()
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
      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toContain(text)
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
    expect((await screen.findByRole('alert')).textContent).toContain(text)
    expect(window.location.search).toBe(`?token=${TOKEN}`)

    answer(200, { outcome: 'confirmed' })
    await clickTryAgain()
    await screen.findByText(/your email is confirmed/)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(document.activeElement).toBe(screen.getByRole('status'))
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('ignores an answer that arrives after the person left the page', async () => {
    let reply: (r: Response) => void = () => {}
    fetchMock.mockReturnValue(new Promise<Response>((r) => (reply = r)))
    const { unmount } = render(<ConfirmEmail token={TOKEN} retryHref="/contact" />)
    unmount()
    window.history.replaceState(null, '', '/search?q=garden')
    reply(new Response(JSON.stringify({ outcome: 'confirmed' }), { status: 200 }))
    await new Promise((r) => setTimeout(r, 0))
    expect(window.location.search).toBe('?q=garden')
  })

  it('confirms once even when React runs the page-load effect twice (strict mode)', async () => {
    answer(200, { outcome: 'confirmed' })
    render(
      <React.StrictMode>
        <ConfirmEmail token={TOKEN} retryHref="/contact" />
      </React.StrictMode>,
    )
    await screen.findByText(/your email is confirmed/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
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
