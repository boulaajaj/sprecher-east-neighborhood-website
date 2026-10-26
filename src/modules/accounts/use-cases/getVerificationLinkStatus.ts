import 'server-only'

import { findPendingVerification, wasVerifiedWithToken } from '../data/signUp'
import { parseLinkToken } from '../domain/linkToken'
import type { VerificationLinkStatus } from '../domain/types'
import { logServerFailure } from './logServerFailure'

/**
 * Where a verification link stands when its page opens (#391), so a link opened again after the
 * account was verified says so instead of offering Confirm again. Changes nothing: verifying
 * still takes the button and the robot check (#303). If the check fails, the page offers the
 * button as before, and the button gives the real answer.
 */
export async function getVerificationLinkStatus(value: unknown): Promise<VerificationLinkStatus> {
  const token = parseLinkToken(value)
  if (!token) return 'invalid'
  try {
    if (await findPendingVerification(token)) return 'pending'
    return (await wasVerifiedWithToken(token)) ? 'already-verified' : 'invalid'
  } catch (error) {
    logServerFailure('Reading a verification link', error)
    return 'pending'
  }
}
