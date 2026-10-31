// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The accounts module is replaced: this tests the page's wiring, not the module
const accounts = vi.hoisted(() => ({ requireUser: vi.fn(), getCurrentUser: vi.fn() }))
vi.mock('@/modules/accounts/server', () => ({
  requireUser: accounts.requireUser,
  getCurrentUser: accounts.getCurrentUser,
  ChangePasswordForm: () => <form aria-label="Change password" />,
}))

import AccountPage from './page'

afterEach(cleanup)

describe('/account', () => {
  it('lets only a signed-in user in, through requireUser', async () => {
    accounts.requireUser.mockRejectedValue(new Error('NEXT_REDIRECT /login'))
    accounts.getCurrentUser.mockResolvedValue(null)
    await expect(AccountPage()).rejects.toThrow('NEXT_REDIRECT /login')
  })

  it('shows the signed-in user’s name and email, and the password form', async () => {
    accounts.requireUser.mockResolvedValue({
      id: 7,
      email: 'ada@example.com',
      name: 'Ada',
      role: 'resident',
    })
    render(await AccountPage())
    expect(screen.getByText('Ada')).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
    expect(screen.getByRole('form', { name: 'Change password' })).toBeTruthy()
  })
})
