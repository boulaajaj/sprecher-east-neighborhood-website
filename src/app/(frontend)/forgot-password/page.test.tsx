// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The accounts module is replaced: this tests the page's wiring, not the module
const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT ${path}`)
  }),
}))
vi.mock('@/modules/accounts/server', () => ({
  getCurrentUser: mocks.getCurrentUser,
  ForgotPasswordForm: () => <form aria-label="Reset password" />,
}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import ForgotPasswordPage from './page'

beforeEach(() => {
  mocks.redirect.mockClear()
})
afterEach(cleanup)

describe('/forgot-password', () => {
  it('sends a signed-in user to their account, where they change their password', async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: 7, email: 'a@example.com', name: null })
    await expect(ForgotPasswordPage()).rejects.toThrow('NEXT_REDIRECT /account')
  })

  it('shows a visitor the form', async () => {
    mocks.getCurrentUser.mockResolvedValue(null)
    render(await ForgotPasswordPage())
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Forgot Your Password?')
    expect(screen.getByRole('form', { name: 'Reset password' })).toBeTruthy()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })
})
