// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

const mocks = vi.hoisted(() => ({ changePassword: vi.fn() }))
vi.mock('../actions', () => ({ changePassword: mocks.changePassword }))

import { ChangePasswordForm } from './ChangePasswordForm.client'

beforeEach(() => {
  mocks.changePassword.mockReset()
})
afterEach(cleanup)

const newPassword = () => screen.getByLabelText<HTMLInputElement>(/^New password/)
const confirmation = () => screen.getByLabelText<HTMLInputElement>(/^Confirm new password/)

const fillAndSend = async (password = 'correct-horse') => {
  await userEvent.type(newPassword(), password)
  await userEvent.type(confirmation(), password)
  await userEvent.click(screen.getByRole('button', { name: 'Update Password' }))
}

describe('ChangePasswordForm', () => {
  it('sends only the two passwords, then confirms and clears the fields', async () => {
    mocks.changePassword.mockResolvedValue({ ok: true })
    render(<ChangePasswordForm />)
    await expectAccessible(document.body)

    await fillAndSend()

    expect(mocks.changePassword).toHaveBeenCalledWith({
      newPassword: 'correct-horse',
      confirmPassword: 'correct-horse',
    })
    expect((await screen.findByRole('status')).textContent).toContain('Password updated.')
    expect(newPassword().value).toBe('')
  })

  it('doesn’t send a password that is too short', async () => {
    render(<ChangePasswordForm />)
    await fillAndSend('short')
    expect(mocks.changePassword).not.toHaveBeenCalled()
  })

  it.each([
    ['signed-out', 'Your session has ended. Log in again, then change your password.'],
    ['rejected', 'That password can’t be used. Choose a different one and try again.'],
    ['server-error', 'We couldn’t update your password. Please try again in a few minutes.'],
  ])('shows the fixed message for %s', async (failure, message) => {
    mocks.changePassword.mockResolvedValue({ ok: false, failure })
    render(<ChangePasswordForm />)

    await fillAndSend()

    expect((await screen.findByRole('alert')).textContent).toContain(message)
  })

  it('says the site couldn’t be reached when the action gets no answer', async () => {
    mocks.changePassword.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<ChangePasswordForm />)

    await fillAndSend()

    expect((await screen.findByRole('alert')).textContent).toMatch(/connection/)
  })

  it('keeps a password typed before the page finished loading', async () => {
    const container = document.body.appendChild(document.createElement('div'))
    container.innerHTML = renderToString(<ChangePasswordForm />)
    newPassword().value = 'typed-early'

    const root = await act(async () => hydrateRoot(container, <ChangePasswordForm />))

    expect(newPassword().value).toBe('typed-early')
    act(() => root.unmount())
    container.remove()
  })
})
