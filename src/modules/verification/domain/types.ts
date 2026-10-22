/** One email confirmation as the rules read it: an address, and where its link stands. */
export type ConfirmationRecord = {
  id: number
  email: string
  /** When the link was clicked; `null` while unconfirmed. */
  confirmedAt: string | null
  /** When the latest link stops working. */
  tokenExpiresAt: string | null
  /** Links sent in the current window (`sendWindowStart`), for the per-address limit. */
  sendCount: number
  sendWindowStart: string | null
  welcomeSentAt: string | null
}

/**
 * What asking for a confirmation link did. For server code and logs only: the person always sees
 * the same answer, so nobody learns whether an address is known or confirmed.
 */
export type RequestOutcome =
  | 'sent'
  | 'already-confirmed'
  | 'invalid-address'
  | 'address-limit'
  | 'connection-limit'
  | 'site-limit'

/**
 * What following a confirmation link did. These the person may see: only someone holding the
 * link (an unguessable token) can ask.
 */
export type ConfirmOutcome = 'confirmed' | 'already-confirmed' | 'expired' | 'invalid'
