'use client'

import React, { createContext, useContext, type ReactNode } from 'react'

import { type SignedInAccountState, useSignedInAccount } from './useSignedInAccount'

const AccountContext = createContext<SignedInAccountState | null>(null)

/**
 * Holds who is signed in for everything inside it, so the header's two account menus (bar and
 * mobile drawer) share one answer and one request per navigation.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const state = useSignedInAccount()
  return <AccountContext value={state}>{children}</AccountContext>
}

/** The signed-in account from the nearest `AccountProvider`. */
export function useAccount(): SignedInAccountState {
  const state = useContext(AccountContext)
  if (!state) throw new Error('useAccount needs an AccountProvider around it')
  return state
}
