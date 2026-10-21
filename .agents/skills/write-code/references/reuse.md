# Reuse first

Read this before writing a helper, a component or a query, and when you find a duplicate.

## Search before you write

In this order (the [DRY search order](../../../../docs/guidelines/development.md#dry--dont-repeat-yourself)
covers today's template folders):

1. The module you're in: all its folders, imported directly.
2. `src/platform/`: `lib/`, `ui/`, `payload/`, `email/`, `seo/`, `richtext/`.
3. Template folders that haven't moved yet: `src/utilities/`, `src/components/` (and `ui/`),
   `src/fields/`, `src/access/`, `src/hooks/`.

```bash
grep -rn "functionName\|keyword" src --include=*.ts --include=*.tsx | grep -v payload-types
```

Search for the idea, not only the name: a date rule may be called `isUpcoming`, `upcoming` or
`startOfToday`.

## Framework and libraries before custom code

Ask, in order:

1. Does Payload do it? Collections, hooks, access control, auth (verify, reset password),
   the form builder, SEO, search, redirects. The whole manual is at
   https://payloadcms.com/llms-full.txt.
2. Does Next.js do it? Routing, caching, server actions, metadata, images.
3. Does a dependency we already have do it? Radix, `cva`, `clsx` and `tailwind-merge`,
   `react-hook-form`, `lucide-react`; dates through `src/utilities/timezone.ts` and
   `formatDateTime.ts`.
4. Is there an established, maintained library for it? Check downloads, the last release and open
   issues, and run `npm audit` ([security](../../../../docs/guidelines/security.md)).

Write custom code only when none fits, and say why on the issue.

## When the same thing appears twice

- Move it to its owner: a rule into the module's `domain/`, something two modules use into
  `src/platform/`.
- Test it there, replace every copy in the same PR, and delete the copies.
- Don't build a shared version for a single use. Wait for the second use.

## Extend, don't copy

- A component that needs another look or size gets a variant (`cva`) in `src/platform/ui/`.
- A helper that needs one more case gets a parameter or a second small function, not a copy with
  edits.
- A list of options (categories, roles) is one `as const` array with a derived type, imported
  everywhere it's needed.
