import type { PayloadRequest } from 'payload'

/**
 * Confirming that an email address belongs to the person who typed it (#183). The `verification`
 * module provides it; `contact` (and sign-up, #187) use it. `payload.config.ts` hands one to the
 * other, so neither module imports the other (decision 0008).
 *
 * Both methods take the caller's request (for its headers and Payload instance) but never join
 * its transaction, so a failure in them can't roll back the caller's work. Neither throws, for a
 * limit, a bad address or a failure: the caller answers the person the same way whatever
 * happened, and nobody learns whether an address is known or confirmed.
 */
export interface EmailConfirmer {
  /** Whether this address was confirmed before. False for anything that isn't one address. */
  isConfirmed(email: string, req: PayloadRequest): Promise<boolean>
  /** Sends a confirmation link to the address, within the limits; does nothing once it is confirmed. */
  request(email: string, req: PayloadRequest): Promise<void>
}

/**
 * Runs once when an address is confirmed, in the confirming request: a module that asked for the
 * confirmation marks its own records (a contact message becomes confirmed, for example).
 * `payload.config.ts` hands these to the verification module. The address is normalized
 * (trimmed, lowercase).
 */
export type EmailConfirmedListener = (email: string, req: PayloadRequest) => Promise<void>
