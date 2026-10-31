# Reuse first

Read this before writing a helper, a component or a query, and when you find a duplicate.

## Search before you write

In this order (the [DRY search order](../../../../docs/guidelines/development.md#dry--dont-repeat-yourself)
says what each shared folder holds):

1. The module you're in: all its folders, imported directly.
2. `src/platform/`: `lib/`, `ui/`, `payload/`, `email/`, `seo/`, `richtext/`, `theme/`.

```bash
grep -rn "functionName\|keyword" src --include=*.ts --include=*.tsx | grep -v payload-types
```

Search for the idea, not only the name: a date rule may be called `isUpcoming`, `upcoming` or
`startOfToday`.

## Native first, then plugins, then our code

Go down the
[ladder](../../../../docs/guidelines/development.md#native-first-then-plugins-then-our-code) in
order and stop at the first step that does the job: native Payload, Next.js and React features
and config (and the dependencies we already have), official plugins, well-established free
open-source plugins, and only then our own code. Before writing our own code, record what each
step found on the issue, as the ladder says.

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
