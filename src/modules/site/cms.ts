// Payload entry: the Pages collection factory and its layout blocks, the header and footer
// globals, and the redirects hook, for payload.config.ts and the plugin setup. Nothing here may
// be server-only, because the Payload CLI (migrations, seed) loads it outside Next.js.
export { SITE_LAYOUT_BLOCKS } from './cms/layoutBlocks'
export { Footer, Header } from './cms/navGlobal'
export { createPagesCollection } from './cms/pages'
export { revalidateRedirects } from './cms/revalidateRedirects'
