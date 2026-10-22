import type { PayloadRequest } from 'payload'

/** Logs a failure with only its kind: an error from the database or SMTP can carry the address. */
export function logFailure(req: PayloadRequest, what: string, error: unknown): void {
  const name = error instanceof Error ? error.name : typeof error
  req.payload.logger.error(`${what} failed (${name})`)
}
