# Modules

One folder per business area: `events`, `news`, `contact`, `accounts`, `directory` and `site`.
Each holds that area's rules, data access, CMS config and components, so the folder tree reads like
the site. Areas move here from the template folders one at a time (#127).

- **Inside a module:** `domain/`, `use-cases/`, `data/`, `cms/` and `ui/`, with only the folders
  it needs, plus the entry files `index.ts`, `server.ts`, `actions.ts` and `cms.ts`.
- **From outside:** import a module only through its entry files.
- **Between modules:** none. A module never imports another; pages, layouts and the block
  registry in `src/app/`, and `payload.config.ts`, put modules together
  ([0008](../../docs/architecture/decisions/0008-compose-modules-at-the-app-level.md)).

Lint warns when code breaks these rules (`eslint.boundaries.config.mjs`). The full map is in
[`docs/architecture/`](../../docs/architecture/README.md#inside-a-module).
