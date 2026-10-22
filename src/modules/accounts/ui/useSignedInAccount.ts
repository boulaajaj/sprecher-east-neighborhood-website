'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { getSignedInAccount, signOut } from '../actions'
import type { AccountSummary } from '../domain/types'

export type SignedInAccountState = {
  /** `null` for a visitor, and until the first answer */
  account: AccountSummary | null
  /** True until the first answer */
  loading: boolean
  /** Signs out, then opens the home page */
  signOut: () => Promise<void>
}

/**
 * Who is signed in, for the header. The header stays mounted while visitors move between pages
 * and most pages are static, so it asks the server again on every navigation: signing in or out
 * always ends on another page.
 */
export function useSignedInAccount(): SignedInAccountState {
  const [account, setAccount] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let current = true
    getSignedInAccount()
      .then((next) => {
        if (current) setAccount(next)
      })
      .catch(() => {
        // No answer (offline): keep what the header shows
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [pathname])

  const signOutAndLeave = useCallback(async () => {
    try {
      await signOut()
    } catch {
      // No answer: the cookie still expires on its own
    }
    setAccount(null)
    router.push('/')
    router.refresh()
  }, [router])

  return { account, loading, signOut: signOutAndLeave }
}
