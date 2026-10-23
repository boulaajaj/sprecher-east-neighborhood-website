// Types and pure rules only, so client components and scripts can import it without pulling in
// Payload. The confirm page's component is in server.ts; the collection and the confirmation
// service are in cms.ts.
export { parseConfirmationToken } from './domain/tokenFormat'
export type { ConfirmOutcome, RequestOutcome } from './domain/types'
