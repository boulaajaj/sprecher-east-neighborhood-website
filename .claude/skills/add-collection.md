# Skill: Add a New Payload CMS Collection

## When to Use

Use this skill when adding a new content type to the CMS (e.g., Testimonials, Newsletters, Sponsors). Every collection needs a config, revalidation hooks, and registration in the Payload config.

## Required Input

- **Collection name**: PascalCase singular or plural matching the data model (e.g., `Testimonials`, `Resources`)
- **Collection slug**: lowercase plural (e.g., `testimonials`, `resources`)
- **Fields**: What data the collection stores
- **Has public-facing pages?**: Whether items have their own URL routes (e.g., `/testimonials/[slug]`)
- **Has drafts/versions?**: Whether content editors need draft/publish workflow

## Procedure

### Step 1: Create the collection directory

```
src/collections/{CollectionName}/
  index.ts
  hooks/
    revalidate{SingleName}.ts
```

### Step 2: Write the revalidation hook

Create `src/collections/{CollectionName}/hooks/revalidate{SingleName}.ts`:

Follow this exact pattern (reference: `src/collections/Events/hooks/revalidateEvent.ts`):

```typescript
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidate{SingleName}: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating {singleName} at /{slug}/${doc.slug}`)
      revalidatePath(`/{slug}/${doc.slug}`)
      revalidatePath('/{slug}')
      revalidateTag('{slug}')
    }

    // Handle unpublish: revalidate the old published path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old {singleName} at /{slug}/${previousDoc.slug}`)
      revalidatePath(`/{slug}/${previousDoc.slug}`)
      revalidatePath('/{slug}')
      revalidateTag('{slug}')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/{slug}/${doc.slug}`)
    revalidatePath('/{slug}')
    revalidateTag('{slug}')
  }

  return doc
}
```

**Key conventions:**
- Always check `!context.disableRevalidate` to avoid loops during seeding/migrations
- Revalidate both the individual item path and the listing page path
- Use `revalidateTag` for cache tag-based invalidation
- Handle the unpublish case (was published, now isn't)
- If the collection has NO public-facing pages, skip the individual path and only revalidate listing/tag

### Step 3: Write the collection config

Create `src/collections/{CollectionName}/index.ts`:

Follow this exact pattern (reference: `src/collections/Events/index.ts`):

```typescript
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateDelete, revalidate{SingleName} } from './hooks/revalidate{SingleName}'

// Import Lexical features only if the collection has richText fields:
// import { FixedToolbarFeature, HeadingFeature, HorizontalRuleFeature, InlineToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

export const {CollectionName}: CollectionConfig = {
  slug: '{slug}',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    // Add other fields that should be populated by default when this collection is referenced
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: '{Tab Label}',
          fields: [
            // Collection-specific fields go here
            // Use type: 'row' for side-by-side layout
            // Use admin.condition for conditional visibility
            // Use admin.placeholder for helpful hints
            // Use admin.description for field help text
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'richText',
              // Configure lexical editor with needed features
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidate{SingleName}],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
}
```

**Key conventions:**
- Always use `authenticated` / `authenticatedOrPublished` access control from `src/access/`
- Always include `slugField()` for URL-friendly slugs
- Always include `publishedAt` in the sidebar
- Always wire up `populatePublishedAt` as a `beforeChange` hook
- Use `tabs` to organize fields into logical groups
- Use `type: 'row'` inside tabs for side-by-side field layout
- Use `admin.condition` for fields that should only show based on other field values
- Set `defaultPopulate` to the minimal fields needed when this collection is referenced elsewhere
- If NO drafts needed, remove the entire `versions` block and change `authenticatedOrPublished` to `anyone` for reads

### Step 4: Register in `payload.config.ts`

Edit `src/payload.config.ts`:

1. Add the import:
   ```typescript
   import { {CollectionName} } from './collections/{CollectionName}'
   ```

2. Add to the `collections` array:
   ```typescript
   collections: [Pages, Posts, Events, {CollectionName}, /* ... rest */],
   ```

### Step 5: Generate types

```bash
npm run generate:types
```

### Step 6: Create the frontend route (if the collection has public pages)

If items have their own pages, create:
```
src/app/(frontend)/{slug}/page.tsx          # Listing page
src/app/(frontend)/{slug}/[slug]/page.tsx   # Individual item page
```

Follow the pattern in `src/app/(frontend)/events/` for reference.

### Step 7: Verify

```bash
npm run build
```

## Checklist

- [ ] `src/collections/{CollectionName}/hooks/revalidate{SingleName}.ts` created
- [ ] `src/collections/{CollectionName}/index.ts` created with access control, fields, hooks, versions
- [ ] Collection imported and added to `collections` array in `src/payload.config.ts`
- [ ] `npm run generate:types` ran successfully
- [ ] Frontend route created (if applicable)
- [ ] `npm run build` passes
- [ ] Admin panel accessible and collection appears in sidebar

## Reference Files

- `src/collections/Events/index.ts` — Full collection with tabs, hooks, versions, conditional fields
- `src/collections/Events/hooks/revalidateEvent.ts` — Revalidation hook pattern
- `src/collections/Posts/index.ts` — Collection with author relationships and SEO fields
- `src/collections/Pages/index.ts` — Collection with layout builder blocks and live preview
- `src/access/authenticated.ts` — Auth access control
- `src/access/authenticatedOrPublished.ts` — Public read access control
- `src/hooks/populatePublishedAt.ts` — Shared beforeChange hook
