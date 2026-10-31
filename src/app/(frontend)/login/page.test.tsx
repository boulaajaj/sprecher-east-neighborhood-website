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
  SignInForm: () => <form aria-label="Log in" />,
}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import LoginPage from './page'

beforeEach(() => {
  mocks.redirect.mockClear()
})
afterEach(cleanup)

describe('/login', () => {
  it('sends a signed-in user to their account', async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: 7, email: 'a@example.com', name: null })
    await expect(LoginPage()).rejects.toThrow('NEXT_REDIRECT /account')
  })

  it('shows a visitor the sign-in form', async () => {
    mocks.getCurrentUser.mockResolvedValue(null)
    render(await LoginPage())
    expect(screen.getByRole('form', { name: 'Log in' })).toBeTruthy()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })
})
