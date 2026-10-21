# 0008: Modules don't import each other; the app composes them

- **Date:** 2026-10-21
- **Status:** Accepted. Replaces rule 3 of the architecture map as written for #128, where `site`
  could import any module's entry files.
- **Issues:** #127, #130, #138

## Context

The first version of the map let the `site` module import other modules to build pages, the
header and the page builder. That makes `site` depend on every area, so removing or replacing an
area means editing `site`. The owner asked on 2026-10-21 (Claude Code session, text) to "avoid all
those anti-patterns, like modules referencing other modules", and for code that is "plug and play".

Two widely used references say the same: Bulletproof React composes features "at the application
level" and forbids cross-feature imports with ESLint, and Feature-Sliced Design lets a slice import
only from layers strictly below it.

## Decision

- No module imports another module, not even through its entry files.
- Modules meet only in the composition roots:
  - **pages and layouts in `src/app/`:** they call several modules and pass results down as props
    or slots;
  - **the block registry in `src/app/`:** it maps page-builder block types to each module's block
    component and hands the map to `site`'s renderer;
  - **`payload.config.ts`:** it registers each module's `cms.ts`, and passes the layout blocks
    into `site`'s Pages collection factory.
- Shared types that two modules need (a block's props, a rich-text value) live in
  `src/platform/`.

## Consequences

- Any module can be removed or replaced by editing the composition roots only.
- `site` needs small seams: a renderer that takes a block map, and a Pages collection factory.
- The boundary lint gets a simpler rule: `modules/*` may import `platform` only.

## Links

- Bulletproof React, project structure:
  https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
- Feature-Sliced Design, layers and the import rule:
  https://github.com/feature-sliced/documentation (`src/content/docs/docs/reference/layers.mdx`)
