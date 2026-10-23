// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

const mocks = vi.hoisted(() => ({ resetPassword: vi.fn() }))
vi.mock('../actions', () => ({ resetPassword: mocks.resetPassword }))

import { ResetPasswordForm } from './ResetPasswordForm.client'

const TOKEN = '0123456789abcdef0123456789abcdef01234567'

beforeEach(() => {
  mocks.resetPassword.mockReset()
  window.history.replaceState(null, '', `/reset-password?token=${TOKEN}`)
})
afterEach(cleanup)

const send = async (password = 'correct-horse', confirmation = password) => {
  await userEvent.type(screen.getByLabelText(/^New password/), password)
  await userEvent.type(screen.getByLabelText(/^Confirm new password/), confirmation)
  await userEvent.click(screen.getByRole('button', { name: 'Set New Password' }))
}

const hrefOf = (name: string) => screen.getByRole('link', { name }).getAttribute('href')

describe('ResetPasswordForm', () => {
  it('sends the link’s token with the new password, then offers to log in', async () => {
    mocks.resetPassword.mockResolvedValue({ ok: true })
    render(<ResetPasswordForm token={TOKEN} />)
    await expectAccessible(document.body)

    await send()

    expect(mocks.resetPassword).toHaveBeenCalledExactlyOnceWith({
      token: TOKEN,
      newPassword: 'correct-horse',
      confirmPassword: 'correct-horse',
    })
    expect((await screen.findByRole('status')).textContent).toMatch(/new password is set/)
    expect(hrefOf('Log In')).toBe('/login')
    // The used token leaves the address bar and the history
    expect(window.location.search).toBe('')
  })

  it('checks the passwords match before sending', async () => {
    render(<ResetPasswordForm token={TOKEN} />)
    await send('correct-horse', 'correct-horsf')
    expect(mocks.resetPassword).not.toHaveBeenCalled()
    expect(screen.getByText('The passwords don’t match')).toBeTruthy()
  })

  it('offers a new link when the link is dead, and drops its token', async () => {
    mocks.resetPassword.mockResolvedValue({ ok: false, failure: 'invalid-link' })
    render(<ResetPasswordForm token={TOKEN} />)
    await send()
    expect((await screen.findByRole('alert')).textContent).toMatch(/expired or was already used/)
    expect(hrefOf('Get a New Link')).toBe('/forgot-password')
    expect(window.location.search).toBe('')
  })

  it('offers a new link straight away when the page has no usable token', async () => {
    render(<ResetPasswordForm token={null} />)
    expect(screen.getByRole('alert').textContent).toMatch(/expired or was already used/)
    expect(screen.queryByRole('form')).toBeNull()
    expect(hrefOf('Get a New Link')).toBe('/forgot-password')
  })

  it.each([
    ['rejected', /can’t be used/],
    ['server-error', /couldn’t set your password/],
  ])('keeps the form and shows the fixed message for %s', async (failure, message) => {
    mocks.resetPassword.mockResolvedValue({ ok: false, failure })
    render(<ResetPasswordForm token={TOKEN} />)
    await send()
    expect((await screen.findByRole('alert')).textContent).toMatch(message)
    expect(screen.getByRole('form', { name: 'Choose a new password' })).toBeTruthy()
    expect(window.location.search).toBe(`?token=${TOKEN}`)
  })
})
