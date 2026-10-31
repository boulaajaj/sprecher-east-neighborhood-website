import { getClientSideURL } from '@/platform/lib/getURL'
import { parseEmailAddress } from '@/platform/lib'
import { HUMAN_CHECK_TOKEN_HEADER } from '@/platform/lib/humanCheck'

import { CONFIRM_API_PATH, ROBOT_CHECK_ERROR } from '../domain/paths'
import type { ConfirmOutcome } from '../domain/types'

/** What the browser learns from a click on "Confirm my email". */
export type ConfirmAnswer = ConfirmOutcome | 'too-many-tries' | 'robot-check' | 'failed'

/** The answer, with the confirmed address when the endpoint gave one (`ConfirmResult`). */
export type ConfirmReply = { answer: ConfirmAnswer; email: string | null }

const OUTCOMES: readonly ConfirmOutcome[] = ['confirmed', 'already-confirmed', 'expired', 'invalid']

/**
 * Posts a link's token to the confirm endpoint, with the robot check's token when there is one
 * (#303), and reads its answer. Rejects only when no answer came back (offline); anything
 * unexpected is `failed`.
 */
export async function postConfirmation(
  token: string,
  robotCheckToken: string | null,
): Promise<ConfirmReply> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (robotCheckToken) headers[HUMAN_CHECK_TOKEN_HEADER] = robotCheckToken
  const response = await fetch(`${getClientSideURL()}${CONFIRM_API_PATH}`, {
    body: JSON.stringify({ token }),
    headers,
    method: 'POST',
  })
  if (response.status === 429) return { answer: 'too-many-tries', email: null }
  if (response.status === 400 && (await readError(response)) === ROBOT_CHECK_ERROR) {
    return { answer: 'robot-check', email: null }
  }
  if (!response.ok) return { answer: 'failed', email: null }
  try {
    const { outcome, email } = (await response.json()) as { outcome?: unknown; email?: unknown }
    const answer = OUTCOMES.find((known) => known === outcome) ?? 'failed'
    return { answer, email: parseEmailAddress(email) }
  } catch {
    return { answer: 'failed', email: null }
  }
}

/** The `error` code of an error answer, or null. */
async function readError(response: Response): Promise<unknown> {
  try {
    const body = (await response.json()) as { error?: unknown }
    return body.error ?? null
  } catch {
    return null
  }
}
