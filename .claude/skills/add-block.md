# Skill: Add a New Layout Builder Block

## When to Use

Use this skill when adding a new block type that can be placed in page layouts via the Payload CMS admin panel. Every block needs a Payload config and a React component, plus registration in two places.

## Required Input

- **Block name**: PascalCase (e.g., `Testimonial`, `Timeline`, `PricingTable`)
- **Block slug**: camelCase (e.g., `testimonial`, `timeline`, `pricingTable`)
- **Fields**: What data the block stores (describe the fields needed)

## Procedure

### Step 1: Create the block directory

```
src/blocks/{BlockName}/
  config.ts
  Component.tsx
```

### Step 2: Write `config.ts`

Follow this exact pattern (reference: `src/blocks/Banner/config.ts`, `src/blocks/Content/config.ts`):

```typescript
import type { Block } from 'payload'

// Import only the Lexical features you need:
// import { FixedToolbarFeature, InlineToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
// Import reusable fields if needed:
// import { link } from '@/fields/link'

export const {BlockName}: Block = {
  slug: '{blockSlug}',
  interfaceName: '{BlockName}Block',  // MUST end with "Block" — this becomes the TypeScript type
  fields: [
    // Define fields here — use tabs, rows, arrays, selects, richText, upload, relationship, etc.
  ],
}
```

**Key conventions:**
- `interfaceName` always follows the pattern `{BlockName}Block` (e.g., `BannerBlock`, `ContentBlock`)
- For rich text fields, configure the lexical editor inline with only the features needed
- Use `admin.initCollapsed: true` on array fields
- Use `admin.condition` for conditional field visibility
- Import `link` from `@/fields/link` if the block has CMS links

### Step 3: Write `Component.tsx`

Follow this exact pattern (reference: `src/blocks/Banner/Component.tsx`, `src/blocks/Content/Component.tsx`):

```typescript
import type { {BlockName}Block as {BlockName}BlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
// Import shared components as needed:
// import RichText from '@/components/RichText'
// import { CMSLink } from '@/components/Link'
// import { Media } from '@/components/Media'

export const {BlockName}Block: React.FC<{BlockName}BlockProps> = (props) => {
  // Destructure the fields from props
  const { /* field1, field2 */ } = props

  return (
    <div className="container my-16">
      {/* Render the block content using Tailwind + shared components */}
    </div>
  )
}
```

**Key conventions:**
- Import types from `@/payload-types` (these are auto-generated — run `npm run generate:types` after adding the config)
- Use `cn()` from `@/utilities/ui` for conditional classnames
- Use `RichText` component for any richText fields
- Use `CMSLink` component for any link fields
- Use `Media` component for any upload/relationship-to-media fields
- Wrap content in `<div className="container my-16">` for consistent page spacing

### Step 4: Register in `RenderBlocks.tsx`

Edit `src/blocks/RenderBlocks.tsx`:

1. Add the import at the top:
   ```typescript
   import { {BlockName}Block } from '@/blocks/{BlockName}/Component'
   ```

2. Add to the `blockComponents` map:
   ```typescript
   const blockComponents = {
     // ... existing blocks
     {blockSlug}: {BlockName}Block,
   }
   ```

### Step 5: Register in the Pages collection layout builder

Edit `src/collections/Pages/index.ts`:

1. Add the import at the top:
   ```typescript
   import { {BlockName} } from '../../blocks/{BlockName}/config'
   ```

2. Add to the `blocks` array in the layout field:
   ```typescript
   blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock, {BlockName}],
   ```

### Step 6: Generate types

Run `npm run generate:types` to create the TypeScript interface for the new block.

### Step 7: Verify

Run `npm run build` to confirm the block compiles without errors.

## Checklist

- [ ] `src/blocks/{BlockName}/config.ts` created with correct `slug`, `interfaceName`, and fields
- [ ] `src/blocks/{BlockName}/Component.tsx` created with correct type imports and rendering
- [ ] Block imported and added to `blockComponents` map in `src/blocks/RenderBlocks.tsx`
- [ ] Block config imported and added to `blocks` array in `src/collections/Pages/index.ts`
- [ ] `npm run generate:types` ran successfully
- [ ] `npm run build` passes

## Reference Files

- `src/blocks/Banner/config.ts` — Simple block with select + richText
- `src/blocks/Content/config.ts` — Complex block with array of columns and conditional links
- `src/blocks/RenderBlocks.tsx` — Block component registry
- `src/collections/Pages/index.ts` — Layout builder block list (lines 75-76)
