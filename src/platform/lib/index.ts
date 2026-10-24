// Pure helpers and shared content types, with no framework (docs/architecture/README.md).
// A module's domain may import these and nothing else from platform/.
export { parseClientIp } from './clientIp'
export type { ImageRef, RichTextValue } from './content'
export { isSingleAddress, parseEmailAddress } from './emailAddress'
export { escapeMarkup } from './escapeMarkup'
export { toEmailHtml, type OutgoingEmail } from './emailLayout'
export { MAX_PAGE, parsePageNumber, toPageNumbers, type FeedPage } from './paging'
export { RETENTION, toConfirmedCutoff, toUnconfirmedCutoff } from './retention'
export { AUDIENCES, MODERATION_STATUSES, type Audience, type ModerationStatus } from './reviewQueue'
export { ACCOUNTS_COLLECTION, ROLES, type Role } from './roles'
export { SlidingWindowCounter } from './slidingWindow'
export {
  HUMAN_CHECK_TOKEN_HEADER,
  TURNSTILE_ACTION,
  type HumanCheck,
  type HumanVerifier,
} from './humanCheck'
