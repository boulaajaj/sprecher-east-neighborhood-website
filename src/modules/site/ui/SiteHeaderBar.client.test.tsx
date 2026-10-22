// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Header } from '@/payload-types'
import { Button, Link } from '@/platform/ui'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('@/providers/HeaderTheme', () => ({
  useHeaderTheme: () => ({ headerTheme: null, setHeaderTheme: () => {} }),
}))

import { SiteHeaderBar } from './SiteHeaderBar.client'

const data = { id: 1, navItems: [] } as unknown as Header

beforeEach(() => {
  // jsdom has no matchMedia; the header listens for the desktop breakpoint
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
})
afterEach(cleanup)

const renderHeader = () =>
  render(
    <SiteHeaderBar
      data={data}
      accountMenu={<Link href="/account">Bar account</Link>}
      mobileAccountMenu={
        <>
          <Link href="/account">Drawer account</Link>
          <Button>Drawer sign out</Button>
        </>
      }
    />,
  )

describe('SiteHeaderBar', () => {
  it('shows the account menu it is given in the bar, and the mobile one only in the menu', async () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Bar account' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Drawer account' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('link', { name: 'Drawer account' })).toBeTruthy()
  })

  it.each([
    ['link', 'Drawer account'],
    ['button', 'Drawer sign out'],
  ] as const)('closes the mobile menu when an account %s is used', async (role, name) => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))

    await userEvent.click(screen.getByRole(role, { name }))

    expect(document.getElementById('mobile-menu')).toBeNull()
  })
})
