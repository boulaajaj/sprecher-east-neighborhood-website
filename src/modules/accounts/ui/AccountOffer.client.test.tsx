// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConfirmedEmailContext } from '@/platform/ui/ConfirmedEmail.client'
import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

const mocks = vi.hoisted(() => ({ signUp: vi.fn() }))
vi.mock('../actions', () => ({ signUp: mocks.signUp }))

import { AccountOffer } from './AccountOffer.client'

afterEach(cleanup)

const renderOffer = (email: string | null) =>
  render(
    <main>
      <ConfirmedEmailContext value={email}>
        <AccountOffer />
      </ConfirmedEmailContext>
    </main>,
  )

describe('AccountOffer', () => {
  it('asks Yes or No; Yes only opens the sign-up page with the confirmed email', async () => {
    renderOffer('ana@example.com')
    await expectAccessible(document.body)
    expect(
      screen.getByRole('heading', { name: 'Create a free Sprecher East account?' }),
    ).toBeTruthy()
    const yes = screen.getByRole('link', { name: 'Yes, Create an Account' })
    expect(yes.getAttribute('href')).toBe('/sign-up?email=ana%40example.com')
    expect(mocks.signUp).not.toHaveBeenCalled()
  })

  it('opens the plain sign-up page when no email came with the answer', () => {
    renderOffer(null)
    expect(screen.getByRole('link', { name: 'Yes, Create an Account' }).getAttribute('href')).toBe(
      '/sign-up',
    )
  })

  it('No creates nothing and sends nothing, and says an account can come later', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderOffer('ana@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'No, Thanks' }))

    expect(screen.queryByRole('button')).toBeNull()
    const answer = screen.getByText(/no account was made/)
    expect(answer.contains(document.activeElement) || answer === document.activeElement).toBe(true)
    expect(screen.getByRole('link', { name: 'sign-up page' }).getAttribute('href')).toBe('/sign-up')
    expect(mocks.signUp).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    await expectAccessible(document.body)
    vi.unstubAllGlobals()
  })
})
