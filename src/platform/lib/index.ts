// Pure helpers and shared content types, with no framework (docs/architecture/README.md).
// A module's domain may import these and nothing else from platform/.
export type { ImageRef, RichTextValue } from './content'
export { isSingleAddress } from './emailAddress'
export { MAX_PAGE, parsePageNumber, type FeedPage } from './paging'
