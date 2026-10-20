---
name: self-review
description: Review and clean up your own change before opening or updating a pull request — reuse of existing helpers, code quality, efficiency, the repo's guidelines, and a visual design review for UI changes — then fix what it finds. Use when a change is done and before asking for the independent review.
---

# Self-review before a PR

The author's own pass over a change. It catches the easy things before the independent review
([`pr-review`](../pr-review/SKILL.md)), and doesn't replace it. Fix every Critical and High finding
before opening the PR.

## 1. Find the change

```bash
git diff <base>...HEAD   # <base>: origin/main, or the branch below for a stacked PR
git diff HEAD            # plus anything not committed yet
```

If there are no changes, review the files you edited in this session.

## 2. Review it four ways

Give each review the full diff. If your tool can run sub-agents, run the four in parallel, one
each; otherwise do them one after another.

### Reuse

1. Search for existing utilities and helpers that could replace new code: the shared folders in
   the [DRY search order](../../../docs/guidelines/development.md#dry--dont-repeat-yourself),
   and files next to the changed ones.
2. Flag any new function that duplicates an existing one, and name the one to use instead.
3. Flag inline logic an existing utility already covers: hand-rolled string or path handling,
   custom environment checks, ad-hoc type guards.

### Quality

1. **Redundant state**: state that duplicates other state, cached values that could be derived,
   effects that could be direct calls.
2. **Parameter sprawl**: new parameters added instead of generalizing or restructuring.
3. **Copy-paste with slight variation**: near-duplicates that should share one abstraction.
4. **Leaky abstractions**: internals exposed, or module boundaries crossed (see the dependency
   rules in [`docs/architecture/`](../../../docs/architecture/README.md)).
5. **Stringly-typed code**: raw strings where a constant, a string union or a branded type
   already exists.
6. **Guidelines**: anything against [development](../../../docs/guidelines/development.md) or
   [security](../../../docs/guidelines/security.md).

### Efficiency

1. **Unnecessary work**: repeated computations, file reads or API calls; N+1 queries.
2. **Missed concurrency**: independent operations run one after another.
3. **Hot-path bloat**: new blocking work at startup or on every request or render.
4. **Existence checks before acting** (TOCTOU): do the operation and handle the error instead.
5. **Memory**: unbounded structures, missing cleanup, listener leaks.
6. **Overly broad operations**: reading or loading everything when a part is enough.

### Visual design

Only when the diff touches CSS, Tailwind classes, HTML structure, component markup or image
treatment: follow [`visual-design-review`](../visual-design-review/SKILL.md).

## 3. Fix

Collect the findings and fix each one. If a finding is a false positive or not worth doing, note
it and move on. Then say briefly what you fixed, or that the change was already clean.
