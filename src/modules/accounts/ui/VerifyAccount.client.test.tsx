// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
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

describe('VerifyAccount', () => {
  it('verifies as soon as the page loads, without a click, and offers to log in (#300)', async () => {
    mocks.verifyAccount.mockResolvedValue({ ok: true })
    render(
      <main>
        <VerifyAccount token={TOKEN} />
      </main>,
    )
    expect(screen.getByRole('status').textContent).toMatch(/Confirming your account/)
    expect(window.location.search).toBe('')
    await expectAccessible(document.body)

    const status = await screen.findByText(/account is ready/)
    expect(mocks.verifyAccount).toHaveBeenCalledExactlyOnceWith({ token: TOKEN })
    expect(status.getAttribute('role')).toBe('status')
    expect(document.activeElement).toBe(document.body) // nothing steals focus on page load
    expect(screen.getByRole('link', { name: 'Log In' }).getAttribute('href')).toBe('/login')
    await expectAccessible(document.body)
  })

  it('says a used or unknown link is dead, and offers to log in', async () => {
    mocks.verifyAccount.mockResolvedValue({ ok: false, failure: 'invalid-link' })
    render(<VerifyAccount token={TOKEN} />)
    expect((await screen.findByRole('alert')).textContent).toMatch(/already used/)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('link', { name: 'Log In' })).toBeTruthy()
  })

  it.each([
    [
      'no answer',
      () => mocks.verifyAccount.mockRejectedValueOnce(new TypeError('x')),
      /connection/,
    ],
    [
      'a server error',
      () => mocks.verifyAccount.mockResolvedValueOnce({ ok: false, failure: 'server-error' }),
      /try again in a few minutes/,
    ],
  ])('offers to try again after %s', async (_, setUp, text) => {
    setUp()
    render(<VerifyAccount token={TOKEN} />)
    expect((await screen.findByRole('alert')).textContent).toMatch(text)

    mocks.verifyAccount.mockResolvedValueOnce({ ok: true })
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    const status = await screen.findByText(/account is ready/)
    expect(mocks.verifyAccount).toHaveBeenCalledTimes(2)
    expect(status.parentElement?.contains(document.activeElement)).toBe(true)
  })

  it('verifies once even when React runs the page-load effect twice (strict mode)', async () => {
    mocks.verifyAccount.mockResolvedValue({ ok: true })
    render(
      <React.StrictMode>
        <VerifyAccount token={TOKEN} />
      </React.StrictMode>,
    )
    await screen.findByText(/account is ready/)
    expect(mocks.verifyAccount).toHaveBeenCalledTimes(1)
  })

  it('asks for a password on a resent link, then sets it and verifies in one step (#289)', async () => {
    mocks.verifyAccount.mockResolvedValueOnce({ ok: false, failure: 'needs-password' })
    mocks.verifyAccount.mockResolvedValueOnce({ ok: true })
    render(
      <main>
        <VerifyAccount token={TOKEN} />
      </main>,
    )

    expect(await screen.findByText(/Choose a password to finish/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull()
    await expectAccessible(document.body)

    await userEvent.type(screen.getByLabelText(/^Password/), 'correct-horse')
    await userEvent.type(screen.getByLabelText(/Confirm password/), 'correct-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Set Password and Confirm' }))

    expect(mocks.verifyAccount).toHaveBeenLastCalledWith({
      token: TOKEN,
      newPassword: 'correct-horse',
      confirmPassword: 'correct-horse',
    })
    expect((await screen.findByRole('status')).textContent).toMatch(/account is ready/)
    expect(screen.getByRole('link', { name: 'Log In' }).getAttribute('href')).toBe('/login')
  })

  it('checks the chosen passwords match before sending', async () => {
    mocks.verifyAccount.mockResolvedValue({ ok: false, failure: 'needs-password' })
    render(<VerifyAccount token={TOKEN} />)
    await userEvent.type(await screen.findByLabelText(/^Password/), 'correct-horse')
    await userEvent.type(screen.getByLabelText(/Confirm password/), 'other-horse')
    await userEvent.click(screen.getByRole('button', { name: 'Set Password and Confirm' }))
    expect(await screen.findByText('The passwords don’t match')).toBeTruthy()
    expect(mocks.verifyAccount).toHaveBeenCalledTimes(1)
  })

  it('shows a link with no token as dead, without asking the server', () => {
    render(<VerifyAccount token={null} />)
    expect(screen.getByRole('alert').textContent).toMatch(/isn’t valid/)
    expect(mocks.verifyAccount).not.toHaveBeenCalled()
  })
})
