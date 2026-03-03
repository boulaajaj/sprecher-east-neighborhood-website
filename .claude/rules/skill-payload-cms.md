# Payload CMS v3 Patterns

Technical patterns for working with Payload CMS v3 Website Template in this codebase.

## Collections

Collection configs live in `src/collections/`. Every collection with public content uses:

- `access: { read: authenticatedOrPublished }` from `src/access/authenticatedOrPublished.ts`
- `access: { create/update/delete: authenticated }` from `src/access/authenticated.ts`
- `versions: { drafts: true }` for draft/publish workflow (adds `_status` field)
- `defaultPopulate` to limit fields returned in relationship queries (e.g., `{ title: true, slug: true }`)
- `hooks.afterChange` for revalidation (pattern: check `context.disableRevalidate` guard first)

Slug fields use the shared `slugField()` helper from `src/fields/slug.ts`.

## Blocks

Each block in `src/blocks/` has two files:

- `config.ts` — Payload Block config (`slug`, `interfaceName`, `fields`)
- `Component.tsx` — React component receiving block data as props

**IMPORTANT**: Adding a new block requires TWO registration steps:

1. Add the block config to `Pages.ts` layout field's `blocks` array
2. Add the component to the `blockComponents` map in `src/blocks/RenderBlocks.tsx`

Missing either step will silently fail — the block won't render.

Existing blocks: `archive`, `content`, `cta`, `formBlock`, `mediaBlock`, `banner`, `code`, `relatedPosts`.

## Heroes

Hero components live in `src/heros/`. Four types: `highImpact`, `mediumImpact`, `lowImpact`, `none`.

`src/heros/RenderHero.tsx` maps the `type` field to the correct component. `PostHero` is used directly by the post detail page, not through RenderHero.

Hero config fields are defined in `src/fields/hero.ts` as a reusable field group.

## Hooks

Server-side hooks in `src/hooks/`:

- `populatePublishedAt.ts` — Sets `publishedAt` on create if not set
- `revalidateRedirects.ts` — Revalidates redirect cache

Collection-specific hooks (e.g., `revalidatePage`, `revalidatePost`) live inside their collection directories.

**Hook rules**:

- Always accept and pass `req` from hook args
- Guard revalidation with `if (context.disableRevalidate) return` to prevent loops
- Use `revalidatePath()` or `revalidateTag()` for cache invalidation

## Fields

Reusable field helpers in `src/fields/`:

- `link.ts` — `link()` creates a group field with `type` (reference/custom), `label`, `url`, `reference`, `newTab`, `appearance`
- `linkGroup.ts` — `linkGroup()` creates an array of link fields
- `defaultLexical.ts` — Standard Lexical editor config with toolbar features
- `slug.ts` — `slugField()` creates auto-generated slug from title
- `hero.ts` — Hero field group (type selector + media + richText + links)

## Config Registration

`payload.config.ts` has `collections` and `globals` arrays. New collections/globals must be added there or Payload won't see them.

## Seed Data

Seed scripts in `src/endpoints/seed/`:

- Use `RequiredDataFromCollectionSlug<'collectionSlug'>` for type safety
- Always set `_status: 'published'` for draft-enabled collections
- Use Lexical helpers from `src/endpoints/seed/helpers/lexical.ts`: `root()`, `heading()`, `p()`, `paragraph()`, `text()`, `boldText()`, `linkNode()`
- Set `context: { disableRevalidate: true }` when creating seed docs to avoid revalidation errors
- Use `@example.com` domain for all seed email addresses
