'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import type { User } from '@/payload-types'

type AuthState = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user || null)
        } else {
          setUser(null)
        }
      } catch {
        // Network error — treat as not authenticated
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [pathname])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore — cookie will expire
    }
    setUser(null)
    router.push('/')
    router.refresh()
  }, [router])

  return { user, loading, logout }
}
