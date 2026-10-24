import { getClientSideURL } from '@/platform/lib/getURL'
import { parseEmailAddress } from '@/platform/lib'

import { CONFIRM_API_PATH } from '../domain/paths'
import type { ConfirmOutcome } from '../domain/types'

/** What the browser learns when the confirm page posts the link's token. */
export type ConfirmAnswer = ConfirmOutcome | 'too-many-tries' | 'failed'

/** The answer, with the confirmed address when the endpoint gave one (`ConfirmResult`). */
export type ConfirmReply = { answer: ConfirmAnswer; email: string | null }

const OUTCOMES: readonly ConfirmOutcome[] = ['confirmed', 'already-confirmed', 'expired', 'invalid']

/**
 * Posts a link's token to the confirm endpoint and reads its answer. Rejects only when no answer
 * came back (offline); anything unexpected is `failed`.
 */
export async function postConfirmation(token: string): Promise<ConfirmReply> {
  const response = await fetch(`${getClientSideURL()}${CONFIRM_API_PATH}`, {
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (response.status === 429) return { answer: 'too-many-tries', email: null }
  if (!response.ok) return { answer: 'failed', email: null }
  try {
    const { outcome, email } = (await response.json()) as { outcome?: unknown; email?: unknown }
    const answer = OUTCOMES.find((known) => known === outcome) ?? 'failed'
    return { answer, email: parseEmailAddress(email) }
  } catch {
    return { answer: 'failed', email: null }
  }
}
