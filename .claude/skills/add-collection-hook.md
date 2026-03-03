# Skill: Add a Hook to an Existing Collection

## When to Use

Use this skill when adding a new server-side hook to an existing Payload CMS collection. Common use cases:
- **afterChange**: Revalidate cached pages, send notifications, sync to external services
- **beforeChange**: Set default values, transform data, validate business rules
- **afterRead**: Populate computed fields, transform data for the frontend
- **afterDelete**: Clean up related data, revalidate cache
- **beforeValidate**: Normalize or sanitize input before validation runs

## Required Input

- **Collection name**: Which collection to add the hook to (e.g., `Events`, `Posts`)
- **Hook type**: `beforeValidate`, `beforeChange`, `afterChange`, `afterRead`, `afterDelete`
- **Hook purpose**: What the hook should do

## Procedure

### Step 1: Create the hook file

Place collection-specific hooks in the collection's hooks directory:
```
src/collections/{CollectionName}/hooks/{hookName}.ts
```

For hooks shared across multiple collections, place in:
```
src/hooks/{hookName}.ts
```

### Step 2: Write the hook

Use the correct Payload hook type signature. Reference: `src/collections/Events/hooks/revalidateEvent.ts`, `src/hooks/populatePublishedAt.ts`

**afterChange hook:**
```typescript
import type { CollectionAfterChangeHook } from 'payload'

export const {hookName}: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
  operation,  // 'create' or 'update'
}) => {
  // Always check disableRevalidate to avoid loops during seeding/migrations
  if (!context.disableRevalidate) {
    // Hook logic here
  }

  return doc
}
```

**beforeChange hook:**
```typescript
import type { CollectionBeforeChangeHook } from 'payload'

export const {hookName}: CollectionBeforeChangeHook = ({
  data,
  req,
  operation,  // 'create' or 'update'
}) => {
  // Modify and return data
  return data
}
```

**afterRead hook:**
```typescript
import type { CollectionAfterReadHook } from 'payload'

export const {hookName}: CollectionAfterReadHook = async ({
  doc,
  req: { payload },
}) => {
  // Transform doc for the frontend
  return doc
}
```

**afterDelete hook:**
```typescript
import type { CollectionAfterDeleteHook } from 'payload'

export const {hookName}: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  // Clean up after deletion
  return doc
}
```

**Key conventions:**
- Always use Payload's typed hook signatures (`CollectionAfterChangeHook`, etc.)
- Always return the `doc` (or `data` for beforeChange) — hooks are pipelines
- Use `context.disableRevalidate` guard for any cache invalidation
- Use `payload.logger.info()` for logging, not `console.log()`
- Use `operation` parameter to distinguish create vs update behavior
- Access the Payload Local API via `req.payload` (e.g., `payload.find()`, `payload.update()`)

### Step 3: Wire the hook into the collection config

Edit `src/collections/{CollectionName}/index.ts`:

1. Import the hook:
   ```typescript
   import { {hookName} } from './hooks/{hookName}'
   ```

2. Add to the appropriate hooks array:
   ```typescript
   hooks: {
     afterChange: [revalidate{Name}, {hookName}],  // Add to existing array
     // OR
     beforeChange: [populatePublishedAt, {hookName}],
     // etc.
   },
   ```

**Key conventions:**
- Hooks execute in array order — put revalidation hooks first, data transformation hooks after
- Multiple hooks of the same type are supported — each receives the output of the previous
- For shared hooks (used across collections), import from `src/hooks/`

### Step 4: Verify

```bash
npm run build
```

Test the hook by creating/editing/deleting content in the admin panel and verifying the expected behavior.

## Checklist

- [ ] Hook file created in `src/collections/{CollectionName}/hooks/` (or `src/hooks/` if shared)
- [ ] Hook uses correct Payload type signature
- [ ] Hook imported and wired into collection config's hooks object
- [ ] `disableRevalidate` guard added (if hook touches cache or external services)
- [ ] `npm run build` passes
- [ ] Hook tested via admin panel

## Reference Files

- `src/collections/Events/hooks/revalidateEvent.ts` — afterChange + afterDelete revalidation pattern
- `src/hooks/populatePublishedAt.ts` — Shared beforeChange hook (sets default publishedAt)
- `src/collections/Posts/hooks/populateAuthors.ts` — afterRead hook (populates related data)
- `src/collections/Posts/hooks/revalidatePost.ts` — afterChange revalidation with unpublish handling
