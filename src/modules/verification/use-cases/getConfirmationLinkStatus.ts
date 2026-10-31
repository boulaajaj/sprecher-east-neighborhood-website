import 'server-only'

import { findLinkState } from '../data/links'
import { toLinkStatus } from '../domain/rules'
import { parseConfirmationToken } from '../domain/tokenFormat'
import type { LinkStatus } from '../domain/types'

/**
 * Where a confirmation link stands when its page opens (#391), so a link opened again after
 * confirming says so instead of offering Confirm again. Changes nothing: confirming still takes
 * the button and the robot check (#303). Only someone holding the link can ask, and the answer
 * holds no address. If the read fails, the page offers the button as before.
 */
export async function getConfirmationLinkStatus(value: unknown): Promise<LinkStatus> {
  const token = parseConfirmationToken(value)
  if (!token) return 'invalid'
  try {
    return toLinkStatus(await findLinkState(token), Date.now())
  } catch (error) {
    // The page falls back to the Confirm button, whose answer is the real one. Only the error's
    // kind is logged: a database error can carry the address
    const name = error instanceof Error ? error.name : typeof error
    console.error(`Reading a confirmation link failed (${name})`)
    return 'pending'
  }
}
