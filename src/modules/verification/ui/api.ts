import { getClientSideURL } from '@/platform/lib/getURL'

import { CONFIRM_API_PATH } from '../domain/paths'
import type { ConfirmOutcome } from '../domain/types'

/** What the browser learns from a click on "Confirm my email". */
export type ConfirmAnswer = ConfirmOutcome | 'too-many-tries' | 'failed'

const OUTCOMES: readonly ConfirmOutcome[] = ['confirmed', 'already-confirmed', 'expired', 'invalid']

/**
 * Posts a link's token to the confirm endpoint and reads its answer. Rejects only when no answer
 * came back (offline); anything unexpected is `failed`.
 */
export async function postConfirmation(token: string): Promise<ConfirmAnswer> {
  const response = await fetch(`${getClientSideURL()}${CONFIRM_API_PATH}`, {
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (response.status === 429) return 'too-many-tries'
  if (!response.ok) return 'failed'
  try {
    const { outcome } = (await response.json()) as { outcome?: unknown }
    return OUTCOMES.find((known) => known === outcome) ?? 'failed'
  } catch {
    return 'failed'
  }
}
