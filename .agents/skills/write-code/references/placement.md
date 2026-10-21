# Placement: modules, layers and entry files

Read this when you add a feature, start a module, or move template code into a module. The rules
behind it are in the [architecture map](../../../../docs/architecture/README.md); naming is in the
[conventions](../../../../docs/architecture/conventions.md).

## Which module?

Pick the business area that owns the idea, using the
[business areas table](../../../../docs/architecture/README.md#business-areas) and the
[glossary](../../../../docs/architecture/glossary.md). If two areas both seem to own it, the one
whose rules decide the outcome owns it; the other only shows it. Nothing fits? Ask on the issue
before inventing a new area.

## A module's skeleton

Only create the folders the change needs:

```text
src/modules/events/
  index.ts      client-safe: types, pure helpers, components that load no data
  server.ts     import 'server-only'; re-exports use cases and data-loading components
  actions.ts    'use server'; each action validates input and calls a use case
  cms.ts        collection and block configs for payload.config.ts (nothing server-only)
  domain/       types and rules in plain TypeScript, with tests next to them
  use-cases/    check who is asking, load through data/, apply rules, return the module's types
  data/         Local API queries, overrideAccess set, mapped with to… functions
  cms/          collections, fields, hooks, admin components
  ui/           components and headless hooks (behavior without markup)
```

Inside a module, import the folder you need directly; entry files are only for code outside it.

## Adding a feature to a module

1. Write the rule in `domain/` with its test first ([tests](tests.md)).
2. Add the query in `data/`, returning the module's own type through a `to…` mapper.
3. Add the use case in `use-cases/`; export it from `server.ts`.
4. Add the component in `ui/`. It renders props and holds no business rule. Behavior that should
   survive a redesign (filters, paging, open and closed) goes in a headless hook.
5. Add a thin page in `src/app/` that calls the use case and renders the component.

## Starting a new module

1. Add a row to the business areas table and its terms to the glossary in the same PR.
2. Create `src/modules/<area>/` with only `index.ts` and the folders the first feature needs.
3. Register its `cms.ts` in `payload.config.ts` if it owns collections.
4. Add the module to the boundaries config in `eslint.config.mjs`.

## Composing two modules

Modules never import each other ([0008](../../../../docs/architecture/decisions/0008-compose-modules-at-the-app-level.md)).
Where two areas meet:

- **On a page:** the page in `src/app/` calls both modules and passes the results down as props.
- **In the page builder:** each module exports its block components from its entry file; the
  block registry in `src/app/` maps block types to them and hands the map to `site`'s renderer.
- **In the CMS:** `site`'s `cms.ts` exports a factory that takes the layout blocks;
  `payload.config.ts` passes in the blocks from each module's `cms.ts`.
- **In a shared layout (header, footer):** the layout in `src/app/` renders the other module's
  component and passes it into a slot (a prop such as `accountMenu`).

## Moving template code into a module

1. Move the files with `git mv` so history follows.
2. Update the imports to the module's entry files; add exports there as needed.
3. Update Payload admin component paths and run `npm run generate:importmap` if any moved.
4. Remove the old file once nothing imports it; no re-export shims left behind.
5. The site must look and behave the same: run the tests, and screenshot the affected pages.
