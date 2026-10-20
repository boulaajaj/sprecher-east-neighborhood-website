# 0001: Organize code as a modular monolith by business area

- **Date:** 2026-10-19
- **Status:** Accepted
- **Issues:** #127 (tracking), #128

## Context

The code came from Payload's website template, which sorts files by technical type
(`collections/`, `components/`, `hooks/`, `utilities/`). An architecture review on `main` at
`190cb3d` found files small and typed, but each business area spread over 5 to 7 folders, 10 pages
querying Payload directly, and rules duplicated (the "upcoming" rule in 3 files, category labels in
4 places). Planned features (an events calendar, resident accounts, comments, permissions) would
spread further.

## Decision

One Next.js app, organized by business area under `src/modules/<area>/`, each layered inside
(`domain/`, `data/`, `cms/`, `ui/`, and entry files; see the [README](../README.md#inside-a-module)), with shared code in
`src/platform/` and routes only in `src/app/`. Only a module's `data/` and `cms/` talk to Payload.
Rules are enforced with ESLint (`eslint-plugin-boundaries`) and `server-only`.

Rejected: keeping the template layout (the cost grows with every feature); Feature-Sliced Design
(seven layers and folder renames for Next.js: too heavy for six areas); full hexagonal
architecture everywhere (ports and adapters only where there is a real outside service, see
[conventions](../conventions.md#interfaces-and-adapters)).

## Consequences

- Each area can be read, changed and tested in one place; duplicated rules collapse to one.
- Moving code takes several PRs (#128 to #137), and Payload admin component paths must be updated
  and the import map regenerated when admin components move.
- Contributors must learn the entry-file rule; lint enforces it.

## Links

- Next.js, data security: "For new projects, we recommend creating a dedicated Data Access Layer"
  (https://nextjs.org/docs/app/guides/data-security)
- Martin Fowler, Presentation Domain Data Layering: split the top level "into domain oriented
  modules which are internally layered" (https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- Martin Fowler, Bounded Context (https://martinfowler.com/bliki/BoundedContext.html)
- Payload, collections: collections in separate files, imported into the config
  (https://payloadcms.com/docs/configuration/collections)
