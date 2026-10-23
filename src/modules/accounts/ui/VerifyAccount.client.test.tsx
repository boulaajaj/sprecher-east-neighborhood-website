// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

const mocks = vi.hoisted(() => ({ verifyAccount: vi.fn() }))
vi.mock('../actions', () => ({ verifyAccount: mocks.verifyAccount }))

import { VerifyAccount } from './VerifyAccount.client'

const TOKEN = '0123456789abcdef0123456789abcdef01234567'

beforeEach(() => {
  mocks.verifyAccount.mockReset()
  window.history.replaceState(null, '', `/verify-account?token=${TOKEN}`)
})
afterEach(cleanup)

const clickConfirm = () =>
  userEvent.click(screen.getByRole('button', { name: 'Confirm My Account' }))

describe('VerifyAccount', () => {
  it('does nothing until the button is clicked, then verifies and offers to log in', async () => {
    mocks.verifyAccount.mockResolvedValue({ ok: true })
    render(
      <main>
        <VerifyAccount token={TOKEN} />
      </main>,
    )
    await expectAccessible(document.body)
    expect(window.location.search).toBe('')
    expect(mocks.verifyAccount).not.toHaveBeenCalled()

    await clickConfirm()

    expect(mocks.verifyAccount).toHaveBeenCalledExactlyOnceWith({ token: TOKEN })
    const status = await screen.findByRole('status')
    expect(status.textContent).toMatch(/account is ready/)
    expect(status.parentElement?.contains(document.activeElement)).toBe(true)
    expect(screen.getByRole('link', { name: 'Log In' }).getAttribute('href')).toBe('/login')
    await expectAccessible(document.body)
  })

  it('says a used or unknown link is dead, and offers to log in', async () => {
    mocks.verifyAccount.mockResolvedValue({ ok: false, failure: 'invalid-link' })
    render(<VerifyAccount token={TOKEN} />)
    await clickConfirm()
    expect((await screen.findByRole('alert')).textContent).toMatch(/already used/)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('link', { name: 'Log In' })).toBeTruthy()
  })

  it('keeps the button to try again after a server error or no answer', async () => {
    mocks.verifyAccount.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    render(<VerifyAccount token={TOKEN} />)
    await clickConfirm()
    expect((await screen.findByRole('alert')).textContent).toMatch(/connection/)
    expect(screen.getByRole('button', { name: 'Confirm My Account' })).toBeTruthy()
  })

  it('shows a link with no token as dead, without asking the server', () => {
    render(<VerifyAccount token={null} />)
    expect(screen.getByRole('alert').textContent).toMatch(/isn’t valid/)
    expect(mocks.verifyAccount).not.toHaveBeenCalled()
  })
})
