import 'server-only'

import { findLinkState } from '../data/links'
import { toLinkStatus } from '../domain/rules'
import { parseConfirmationToken } from '../domain/tokenFormat'
import type { LinkStatus } from '../domain/types'

/**
 * Where a confirmation link stands when its page opens (#391), so a link opened again after
 * confirming says so instead of offering Confirm again. Changes nothing: confirming still takes
 * the button and the robot check (#303). Only someone holding the link can ask, and the answer
 * holds no address.
 */
export async function getConfirmationLinkStatus(value: unknown): Promise<LinkStatus> {
  const token = parseConfirmationToken(value)
  if (!token) return 'invalid'
  return toLinkStatus(await findLinkState(token), Date.now())
}
