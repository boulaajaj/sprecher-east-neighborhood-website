// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The module's component is replaced: this tests the page's wiring, not the module
vi.mock('@/modules/verification/server', () => ({
  ConfirmEmail: ({ token }: { token: string | null }) => <p>token: {String(token)}</p>,
}))

import ConfirmEmailPage, { metadata } from './page'

afterEach(cleanup)

const TOKEN = 'a'.repeat(43)
const open = async (token?: string | string[]) =>
  render(await ConfirmEmailPage({ searchParams: Promise.resolve({ token }) }))

describe('/confirm-email', () => {
  it('hands a well-formed token from the link to the confirm button', async () => {
    await open(TOKEN)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Confirm Your Email')
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
