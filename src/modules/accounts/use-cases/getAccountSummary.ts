import 'server-only'

import type { AccountSummary } from '../domain/types'
import { getCurrentUser } from './getCurrentUser'

/** The header's view of the signed-in account (its name only), or null for a visitor. */
export async function getAccountSummary(): Promise<AccountSummary | null> {
  const user = await getCurrentUser()
  return user ? { name: user.name } : null
}
