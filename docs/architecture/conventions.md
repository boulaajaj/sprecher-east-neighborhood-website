# Conventions

Rules that keep the code predictable. When code and this page disagree, fix one of them in the same
PR. Where things go is in the [architecture map](README.md).

## Naming

| Thing                    | Convention                                         | Examples                            |
| ------------------------ | -------------------------------------------------- | ----------------------------------- |
| Module and layer folders | lowercase, kebab-case                              | `src/modules/events/data/`          |
| React component file     | PascalCase, named after its one exported component | `EventCard.tsx`                     |
| Client component file    | `.client.tsx` suffix, starts with `'use client'`   | `EventsFeed.client.tsx`             |
| Other TypeScript file    | camelCase, named after what it holds               | `categories.ts`, `upcoming.ts`      |
| Test file                | same name plus `.test.ts`, next to the file        | `upcoming.test.ts`                  |
| Type or interface        | PascalCase noun, no `I` prefix                     | `EventSummary`, `HumanVerifier`     |
| Constant value           | UPPER_SNAKE_CASE                                   | `UPCOMING_EVENTS_PAGE_SIZE`         |
| Fixed list of options    | `as const` array plus a derived union type         | `EVENT_CATEGORIES`, `EventCategory` |

Folders that came from the template (`src/components/EventCard/index.tsx`) keep their names until
their module moves (#127).

### Function names say what they do

| Prefix                | Meaning                                                     | Example                      |
| --------------------- | ----------------------------------------------------------- | ---------------------------- |
| `find…`               | Database query that returns a list or a page (may be empty) | `findEventPage(scope, page)` |
| `get…`                | One item by key, or `null`                                  | `getEventBySlug(slug)`       |
| `require…`            | Like `get…`, but throws or redirects when missing           | `requireUser()`              |
| `list…`               | A light list of keys for routing or sitemaps                | `listEventSlugs()`           |
| `is…`, `has…`, `can…` | Returns a boolean                                           | `isUpcoming(date, today)`    |
| `parse…`              | Untrusted input to a typed value, or `null` when invalid    | `parsePageNumber(value)`     |
| `to…`                 | Converts one shape into another                             | `toEventSummary(doc)`        |
| `format…`             | Builds text for display                                     | `formatDateShort(timestamp)` |

### Types that cross a boundary

Data functions return the module's own types, not Payload documents:

- `…Summary`: what a list or card needs (`EventSummary`).
- `…Detail`: what a detail page needs (`EventDetail`).

A `to…` mapper in `data/` builds them from Payload documents. Generated Payload types
(`@/payload-types`) stay inside `data/` and `cms/`.

## Entry files

- `index.ts` exports what any code, including client components, may import: types, UI parts,
  pure helpers. It never imports server-only code.
- `server.ts` starts with `import 'server-only'` and exports queries and actions.
- Nothing outside a module imports from its inner folders. If something is missing from an entry
  file, add it there.

## Interfaces and adapters

Add an interface only where it pays:

- the code talks to an outside service (Cloudflare Turnstile, Mailgun, a city calendar feed), or
- there are, or soon will be, two implementations, or
- a test needs to replace a real dependency.

Name the interface after the capability and the adapter after the provider: `HumanVerifier`,
`TurnstileVerifier`. Don't wrap Payload collections in repository interfaces; the typed Local API
plus a module's `data/` functions is the boundary ([decision 0002](decisions/0002-no-repository-layer.md)).
Values that change between environments come from env vars read in one place, never literals in
code.

## One rule, one place

Every rule, list and query exists once and is imported everywhere it's needed. Before writing
logic, search for it. When the same logic appears a second time, move it to the right shared place
(the module's `domain/` or `src/platform/`), test it there, and replace the copy in the same PR.

## Size

- Files: at most 250 lines, blank lines and comments excluded (ESLint `max-lines`, lowered from 300
  in #137). Data lists (for example a country list) and generated files are exempt.
- Functions: aim for under 50 lines. A long component usually hides a smaller component.

## Comments

- Explain _why_, not _what_. A comment that repeats the code goes stale.
- Exported functions get a one-line JSDoc that says what they return and any surprise (time zone,
  access rules, what `null` means).
- Link the issue when a comment records a decision or a workaround (`#118`).

## Errors and messages

- Visitors see short, fixed, friendly messages. Sign-in and password flows never reveal whether an
  account exists.
- Server logs say what failed and why, never passwords, tokens or what a visitor typed.
- Payload hooks reject with `APIError(message, status, null, true)`.

## Tests

- Unit-test every `domain/` rule, every guard, and every `to…` mapper.
- Don't test Payload, Next.js or styling.
- Tests are deterministic: fixed dates (`vi.useFakeTimers`), no network (`vi.stubGlobal('fetch', …)`),
  no database.
- `describe` names the function; each `it` reads as a sentence about behavior:
  `it('turns over at midnight in the site timezone')`.
- Run `npm test`. CI runs the same suite on every PR that changes code.
