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
  it('clears the token from the address bar and the history as soon as it loads', () => {
    render(<ResetPasswordForm token={TOKEN} />)
    expect(window.location.pathname).toBe('/reset-password')
    expect(window.location.search).toBe('')
    expect(window.location.href).not.toContain(TOKEN)
  })

  it('keeps the link’s token when the page renders again from the cleaned address', async () => {
    mocks.resetPassword.mockResolvedValue({ ok: true })
    const { rerender } = render(<ResetPasswordForm token={TOKEN} />)
    rerender(<ResetPasswordForm token={null} />)
    await send()
    expect(mocks.resetPassword).toHaveBeenCalledWith(expect.objectContaining({ token: TOKEN }))
  })

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
  })

  it('offers a new link straight away when the page has no usable token', async () => {
    window.history.replaceState(null, '', '/reset-password?token=short')
    render(<ResetPasswordForm token={null} />)
    expect(window.location.search).toBe('')
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
    // The token is still in the form, so the person can try again
    await send()
    expect(mocks.resetPassword).toHaveBeenLastCalledWith(expect.objectContaining({ token: TOKEN }))
  })
})
