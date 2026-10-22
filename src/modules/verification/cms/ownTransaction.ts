import { isolateObjectProperty, type PayloadRequest } from 'payload'

/**
 * The caller's request, with a transaction of its own. Everything else (headers, user, the
 * Payload instance) is the caller's.
 *
 * Why: no transaction runs today (the SQLite adapter has no `transactionOptions`). If one is ever
 * turned on, a Local API call that fails rolls back the request's whole transaction (Payload's
 * `killTransaction`), even when the error is caught. A confirmation that fails, such as two
 * requests for one new address racing on its unique index, would then undo the contact message
 * that asked. With its own `transactionID` it can't. Payload isolates `transactionID` the same way
 * in its own operations.
 */
export function withOwnTransaction(req: PayloadRequest): PayloadRequest {
  const own = isolateObjectProperty(req, 'transactionID')
  delete own.transactionID
  return own
}
