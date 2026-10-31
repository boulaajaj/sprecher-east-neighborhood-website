import 'server-only'

import { endSession } from '../data/session'

/** Ends the current session and clears the auth cookie. Signing out with no session is fine. */
export async function signOutCurrentUser(): Promise<void> {
  await endSession()
}
