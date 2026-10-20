# Sprecher East Neighborhood Website

@AGENTS.md

> **Read `AGENTS.md` first.** It defines the only way changes reach `main` and production
> (issue → PR → independent review → all checks green → owner merges → CI/CD deploys).
> It applies to every agent and human and overrides anything below or in any tool's memory.

## Project Overview

Grassroots neighborhood association website for Sprecher East (Madison, WI).
Always use the brand name "Sprecher East" — never "SENA".
This is an unofficial grassroots initiative. Always be transparent about AI assistance.

**Repos:**

- Website (this repo, PUBLIC): `boulaajaj/sprecher-east-neighborhood-website`
- Strategy docs (PRIVATE): `boulaajaj/sprecher-east-strategy`

## Current Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **CSS**: Tailwind CSS v4 (design tokens in `src/app/(frontend)/globals.css @theme {}`)
- **CMS**: Payload CMS v3 Website Template at `/admin` (self-hosted, SQLite `data/payload.db`)
- **Auth**: Payload native auth (Users collection with `auth: true`); roles `admin`, `editor`, `resident`
- **Email**: `@payloadcms/email-nodemailer` over SMTP (Mailgun in production); logs to the console when `SMTP_HOST` is unset
- **Spam protection**: Cloudflare Turnstile on public forms, plus size and rate limits (decision records in `docs/architecture/decisions/`)
- **Tests**: Vitest unit tests next to the code (`*.test.ts`), run with `npm test` and in CI (#139)
- **Rich Text**: Lexical editor with slash menu, toolbars, inline images, and custom blocks
- **Icons**: Lucide React
- **Hosting**: Hostinger VPS (Ubuntu 24.04, PM2 + Caddy)

## VPS / Hosting

- **VM ID**: 1371281
- **Hostname**: srv1371281.hstgr.cloud
- **IP**: 187.77.27.93
- **Domain**: sprechereast.com (live since 2026-10-17, see #103)
- **OS**: Ubuntu 24.04 with Docker
- **Plan**: KVM 1 (1 CPU, 4 GB RAM, 50 GB disk)
- **Deploy path**: /var/www/sprecher-east
- **Process manager**: PM2 (process: sprecher-east, port 3000)
- **Web server**: Caddy (HTTPS on 443 and HTTP on 80, reverse proxy → 3000)
- **Hostinger API**: Use `$HOSTINGER_API_KEY` env var for snapshots and management
  - API base: `https://developers.hostinger.com`
  - Snapshot endpoint: `POST /api/vps/v1/virtual-machines/1371281/snapshot`
- **SSH**: User `root`, port 22, key at `~/.ssh/id_ed25519_sprecher`
- **CI/CD**: GitHub Actions → SSH deploy → `npm ci && npm run build && pm2 reload`
- **Caddy config**: `/etc/caddy/Caddyfile` — NEVER overwrite, only append new server blocks
- **Live domains**: `sprechereast.com` (HTTPS), `www.sprechereast.com` (redirects to it), IP `:80` (HTTP)
- **Caddy rule**: Always `cp Caddyfile Caddyfile.bak` before editing, always `caddy validate` before reload

## Architecture

**Read [`docs/architecture/`](docs/architecture/README.md) before writing code.** It has the
target structure (one module per business area under `src/modules/`, shared code in
`src/platform/`, routes only in `src/app/`), the dependency rules, where each kind of code goes,
naming [conventions](docs/architecture/conventions.md), the [glossary](docs/architecture/glossary.md),
the [data model](docs/architecture/data-model.md) and [decision records](docs/architecture/decisions/README.md).

The code is moving to that structure in small steps (#127). Until an area has moved, it is still in
the Payload website template's folders, sorted by technical type:

```
src/
  access/          Role checks and access functions (roles.ts, authenticatedOrPublished, anyone)
  app/             Next.js App Router
    (frontend)/    Public routes (home, posts, events, faq, resources, search, login, account, sitemaps)
    (payload)/     Payload admin and API routes (generated; leave alone)
  blocks/          Page-builder blocks: Payload config + React component each
  collections/     Payload collections (Pages, Posts, Events, FAQ, Resources, TeamMembers, Users, Media, Categories)
  components/      Shared React components; components/ui/ holds the shadcn/ui primitives
  endpoints/seed/  Seed data and script
  fields/          Reusable Payload field groups (link, linkGroup, defaultLexical)
  Header/, Footer/ Global configs and components
  heros/           Hero components and config
  hooks/           Payload hooks (form guards, publishedAt, redirects) and one React hook (useAuth)
  migrations/      Database migrations (generated)
  plugins/         Payload plugin setup (form builder, SEO, search, redirects, nested docs)
  providers/       React context providers (theme, header theme)
  search/          Search plugin config and component
  utilities/       Helpers: dates, URLs, SEO, data access, Turnstile, email
  payload.config.ts
```

## Key Files

| File                              | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `src/payload.config.ts`           | Payload CMS config (SQLite, collections, plugins) |
| `src/app/(frontend)/globals.css`  | Tailwind v4 @theme block — all design tokens      |
| `src/collections/Pages/index.ts`  | Pages collection with layout builder blocks       |
| `src/collections/Posts/index.ts`  | Blog posts collection                             |
| `src/collections/Events/index.ts` | Events collection (custom)                        |
| `src/collections/Users/index.ts`  | Users collection with Payload native auth         |
| `src/collections/Media.ts`        | Media uploads with size variants                  |
| `src/blocks/`                     | Layout builder block configs + React components   |
| `src/heros/`                      | Hero block configs + React components             |
| `src/access/`                     | Access control helpers                            |
| `src/fields/`                     | Reusable field groups (link, linkGroup, lexical)  |
| `src/Header/`                     | Header global component                           |
| `src/Footer/`                     | Footer global component                           |
| `ecosystem.config.cjs`            | PM2 config for VPS (CommonJS: package is ESM)     |

## Design Tokens

| Token                | Value     | Classes                                        |
| -------------------- | --------- | ---------------------------------------------- |
| `--color-primary`    | `#3d7a5e` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-accent`     | `#e8923a` | `bg-accent`, `text-accent`                     |
| `--color-background` | `#f9f8f5` | `bg-background`                                |
| `--color-surface`    | `#f0ede6` | `bg-surface`                                   |
| `--color-foreground` | `#1a1a1a` | `text-foreground`                              |
| `--color-muted`      | `#6b6b6b` | `text-muted`                                   |
| `--color-border`     | `#e2ddd6` | `border-border`                                |

## Payload CMS Plugins

| Plugin       | Package                           | Purpose                                           |
| ------------ | --------------------------------- | ------------------------------------------------- |
| Form Builder | `@payloadcms/plugin-form-builder` | Admin-configurable forms with submissions + email |
| SEO          | `@payloadcms/plugin-seo`          | Meta title, description, OG image per content     |
| Search       | `@payloadcms/plugin-search`       | Indexed search collection for fast queries        |
| Redirects    | `@payloadcms/plugin-redirects`    | URL redirect management for SEO                   |
| Nested Docs  | `@payloadcms/plugin-nested-docs`  | Parent/child hierarchy with breadcrumbs           |

## Local Dev Setup

```bash
npm install
cp .env.local.example .env.local   # fill in secrets (see Env Vars below)
npm run dev                         # → http://localhost:3000
# Visit /admin for first-time Payload admin setup (create first admin user)
```

## Env Vars (all secrets go in `.env.local`, never commit)

| Var                                                                                       | Purpose                                                          |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `PAYLOAD_SECRET`                                                                          | Payload JWT signing (32+ random chars)                           |
| `DATABASE_URI`                                                                            | `file:./data/payload.db`                                         |
| `NEXT_PUBLIC_SERVER_URL`                                                                  | `http://localhost:3000` (dev) or production URL                  |
| `PREVIEW_SECRET`                                                                          | Draft preview URL signing                                        |
| `SITE_TIMEZONE`                                                                           | IANA timezone for dates (default: `America/Chicago`)             |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`                                  | Robot check on public forms; set both or neither, then rebuild   |
| `TURNSTILE_ALLOWED_HOSTNAMES`                                                             | Extra hostnames a Turnstile token may come from (optional)       |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME` | Outgoing email; unset `SMTP_HOST` logs emails instead            |
| `CONTACT_NOTIFY_EMAIL`, `CONTACT_EMAIL_FROM`                                              | Used by the seed only, for the contact form's owner notification |
| `SEED_PASSWORD`                                                                           | Seed only: the demo user's password (random when unset)          |

System-level env vars (not in .env.local):
| Var | Purpose |
|-----|---------|
| `HOSTINGER_API_KEY` | Hostinger API for VPS snapshots and management |
| `ASANA_PAT` | Asana Personal Access Token for REST API (comments, full CRUD) |

## Known Gotchas

- **npm installs**: Always use `--legacy-peer-deps` for Payload packages
- **Payload REST route**: `REST_GET(config)` — curried, NOT `REST_GET(req, config)`
- **Payload importMap**: Auto-generated on dev server start at `src/app/(payload)/admin/importMap.js`
- **`defaultSort`**: Must be on collection root, NOT inside `admin: {}`
- **`npx payload run` broken on Node v24**: Use direct node scripts instead
- **`graphql` package**: Must install separately from `@payloadcms/graphql`
- **`overrideAccess: true`**: Only in server-side Payload reads — never expose to client
- **Live Preview**: Uses `window.postMessage` — component must use `useLivePreview()` hook
- **Draft Preview**: Requires `PREVIEW_SECRET` env var for signed preview URLs
- **Timezone**: Configured via `SITE_TIMEZONE` env var (default: `America/Chicago`). Use `startOfToday()` and `SITE_TIMEZONE` from `src/utilities/timezone.ts`. Never hardcode timezone strings or use bare `new Date().setHours(0,0,0,0)`. Day-only dates (midnight UTC) must be formatted with `timeZone: 'UTC'` to avoid off-by-one; `formatDateTime()` handles this automatically.

## Connected Tools

- **Asana** (REST API): `$ASANA_PAT` user env var. GIDs stored in `$ASANA_WORKSPACE_GID` and `$ASANA_PROJECT_GID` env vars. Use `curl` with Bearer auth. On Windows, pass JSON via temp file (`-d @/tmp/file.json`).
- **Slack** (MCP): sprechereast.slack.com, channel #sprecher-east-na (ID: C0AJ124LBB2)
- **Analytics**: PostHog (planned — cookieless mode, free cloud tier)
