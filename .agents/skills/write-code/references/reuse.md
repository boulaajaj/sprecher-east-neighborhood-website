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

Follow the ladder in
[`development.md`](../../../../docs/guidelines/development.md#native-first-then-plugins-then-our-code)
and stop at the first step that does the job:

1. **Native.** Payload: collections, hooks, access control, auth (`verify`, forgot and reset
   password, lockout), jobs, email (manual: https://payloadcms.com/llms-full.txt). Next.js:
   routing, caching, server actions, metadata, images. React. And the dependencies we already
   have: Radix, `cva`, `clsx` and `tailwind-merge`, `react-hook-form`, `lucide-react`.
2. **Official plugins:** `@payloadcms/*` and the frameworks' own packages, used or not yet.
3. **Well-established, free, open-source plugins or libraries:** maintained, widely used,
   permissive license, clean `npm audit` ([security](../../../../docs/guidelines/security.md)).
   Prefer one that does more than we need.
4. **Our code**, in the module's `domain/` and `use-cases/`, only when nothing above fits.

Before step 4, write one line per step on the issue: what you checked, the link, and why it
doesn't fit. When step 4 replaces something steps 1–3 offer, add a decision record.

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
