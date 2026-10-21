# Tests

Read this when you add a rule, a guard or a mapper, or change one. The rules are in the
[conventions](../../../../docs/architecture/conventions.md#tests).

## Write the test first

1. Write a failing test that states the behavior: `it('turns over at midnight in the site timezone')`.
2. Write the smallest code that passes it.
3. Clean up with the test still green.

## What to test

- **Yes:** every `domain/` rule, every guard (access, robot check, rate limit), every `to…` mapper,
  every `parse…` function, and a use case's decisions with its data functions replaced.
- **No:** Payload, Next.js, React rendering details or styling. Check those by running the site and
  through the visual review.

## How

- The test sits next to the file: `upcoming.ts` and `upcoming.test.ts`.
- `describe` names the function; each `it` is a sentence about behavior.
- Deterministic: fixed dates (`vi.useFakeTimers()`, `vi.setSystemTime()`), no network
  (`vi.stubGlobal('fetch', …)`), no database.
- For an interface (`HumanVerifier`), pass a small fake implementation; don't mock modules
  you own.
- `server-only` is aliased to an empty module in Vitest, so `data/` mappers can be tested.
- Fixtures are small literal objects in the test file; build Payload-shaped documents with only
  the fields the mapper reads.

```bash
npm test                            # the whole suite, as CI runs it
npx vitest run src/modules/events   # one module while you work
```
