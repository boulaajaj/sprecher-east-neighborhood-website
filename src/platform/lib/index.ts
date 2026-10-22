// Pure helpers and shared content types, with no framework (docs/architecture/README.md).
// A module's domain may import these and nothing else from platform/.
export { parseClientIp } from './clientIp'
export type { ImageRef, RichTextValue } from './content'
export { isSingleAddress, parseEmailAddress } from './emailAddress'
export { MAX_PAGE, parsePageNumber, toPageNumbers, type FeedPage } from './paging'
export { ROLES, type Role } from './roles'
export { SlidingWindowCounter } from './slidingWindow'
