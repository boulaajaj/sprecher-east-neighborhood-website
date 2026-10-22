// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// The signed-in user Payload's bar reports from /api/users/me, set per test
let me: unknown = null

vi.mock('@payloadcms/admin-bar', () => ({
  PayloadAdminBar: ({ onAuthChange }: { onAuthChange: (user: unknown) => void }) => {
    useEffect(() => onAuthChange(me), [onAuthChange])
    return null
  },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSelectedLayoutSegments: () => [],
}))
vi.mock('./index.scss', () => ({}))

import { AdminBar } from '.'

afterEach(cleanup)

const barFor = async (user: unknown) => {
  me = user
  const { container } = render(<AdminBar />)
  const bar = container.querySelector<HTMLElement>('.admin-bar')
  if (!bar) throw new Error('AdminBar did not render its wrapper')
  return bar
}

describe('AdminBar', () => {
  it('shows for admins and editors', async () => {
    for (const role of ['admin', 'editor']) {
      const bar = await barFor({ id: '1', email: 'staff@example.com', role })
      await waitFor(() => expect(bar.classList.contains('hidden')).toBe(false))
      cleanup()
    }
  })

  it('stays hidden for residents and visitors', async () => {
    for (const user of [{ id: '2', email: 'resident@example.com', role: 'resident' }, null]) {
      const bar = await barFor(user)
      // Give the effect a chance to run, then check it didn't show the bar
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(bar.classList.contains('hidden')).toBe(true)
      cleanup()
    }
  })
})
