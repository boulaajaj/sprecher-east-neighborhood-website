// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The module's component is replaced: this tests the page's wiring, not the module
vi.mock('@/modules/accounts/server', () => ({
  VerifyAccount: ({ token }: { token: string | null }) => <p>token: {String(token)}</p>,
}))

import VerifyAccountPage, { metadata } from './page'

afterEach(cleanup)

const TOKEN = '0123456789abcdef0123456789abcdef01234567'
const open = async (token?: string | string[]) =>
  render(await VerifyAccountPage({ searchParams: Promise.resolve({ token }) }))

describe('/verify-account', () => {
  it('hands the link’s token to the confirm button', async () => {
    await open(TOKEN)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Confirm Your Account')
    expect(screen.getByText(`token: ${TOKEN}`)).toBeTruthy()
  })

  it.each([[undefined], ['short'], [[TOKEN, TOKEN]]])('hands on no token for %j', async (token) => {
    await open(token)
    expect(screen.getByText('token: null')).toBeTruthy()
  })

  it('sends no referrer and asks not to be indexed, as the token is in its address', () => {
    expect(metadata.referrer).toBe('no-referrer')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })
})
