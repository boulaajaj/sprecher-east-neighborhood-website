// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { expectAccessible } from '@/platform/ui/testing/expectAccessible'

import { continuePage } from './continuePage'
import { SocialSignIn } from './SocialSignIn'

afterEach(cleanup)

describe('SocialSignIn', () => {
  it('shows nothing when no provider is on and no sign-in came back', () => {
    const { container } = render(<SocialSignIn providers={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('links each provider that is on to its start, as a plain link', async () => {
    const { container } = render(
      <main>
        <SocialSignIn providers={['google', 'facebook']} />
      </main>,
    )
    const google = screen.getByRole('link', { name: 'Continue with Google' })
    expect(google.getAttribute('href')).toBe('/auth/google')
    expect(screen.getByRole('link', { name: 'Continue with Facebook' }).getAttribute('href')).toBe(
      '/auth/facebook',
    )
    await expectAccessible(container)
  })

  it('shows a fixed message for a known outcome, and nothing for anything else', () => {
    render(<SocialSignIn providers={[]} result="email-in-use" />)
    expect(screen.getByRole('alert').textContent).toContain('An account already uses this email')
    cleanup()
    render(<SocialSignIn providers={['google']} result="check-email" />)
    expect(screen.getByRole('status').textContent).toContain('Check your email')
    cleanup()
    const { container } = render(<SocialSignIn providers={[]} result="<script>" />)
    expect(container.innerHTML).toBe('')
    cleanup()
    render(<SocialSignIn providers={[]} result="toString" />)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('continuePage', () => {
  it('moves on to the path with a meta refresh and a link, and is never cached', async () => {
    const response = continuePage('/account')
    expect(response.headers.get('cache-control')).toBe('no-store')
    const html = await response.text()
    expect(html).toContain('<meta http-equiv="refresh" content="0;url=/account">')
    expect(html).toContain('<a href="/account">')
    expect(html).not.toContain('<script')
  })

  it('keeps only path characters', async () => {
    const html = await continuePage('/account"><script>').text()
    expect(html).toContain('url=/accountscript')
    expect(html).not.toContain('<script>')
  })
})
