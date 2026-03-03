# Sprecher East Neighborhood Website

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
- **Auth**: Payload native auth (Users collection with `auth: true`) + `payload-oauth2` plugin for social login
- **Rich Text**: Lexical editor with slash menu, toolbars, inline images, and custom blocks
- **Icons**: Lucide React
- **Hosting**: Hostinger VPS (Ubuntu 24.04, PM2 + Caddy)

## VPS / Hosting

- **VM ID**: 1371281
- **Hostname**: srv1371281.hstgr.cloud
- **IP**: 187.77.27.93
- **Domain**: sprecher-east.org (live)
- **OS**: Ubuntu 24.04 with Docker
- **Plan**: KVM 1 (1 CPU, 4 GB RAM, 50 GB disk)
- **Deploy path**: /var/www/sprecher-east
- **Process manager**: PM2 (process: sprecher-east, port 3000)
- **Web server**: Caddy (reverse proxy port 80 → 3000)
- **Hostinger API**: Use `$HOSTINGER_API_KEY` env var for snapshots and management
  - API base: `https://developers.hostinger.com`
  - Snapshot endpoint: `POST /api/vps/v1/virtual-machines/1371281/snapshot`
- **SSH**: User `root`, port 22, key at `~/.ssh/id_ed25519_sprecher`
- **CI/CD**: GitHub Actions → SSH deploy → `npm ci && npm run build && pm2 reload`
- **Caddy config**: `/etc/caddy/Caddyfile` — NEVER overwrite, only append new server blocks
- **Live domains**: `sprecher-east.org` + `www.sprecher-east.org` (HTTPS) + IP `:80` (HTTP)
- **Caddy rule**: Always `cp Caddyfile Caddyfile.bak` before editing, always `caddy validate` before reload

## Architecture (Payload CMS Website Template)

```
src/
  access/          Access control helpers (authenticatedOrPublished, etc.)
  app/             Next.js App Router pages and layouts
    (frontend)/    Public-facing routes (home, posts, events, etc.)
    (payload)/     Payload admin panel routes
  blocks/          Layout builder block components (Archive, Banner, CTA, Content, Form, Media, etc.)
  collections/     Payload CMS collection configs (Pages, Posts, Events, Users, Media, etc.)
  components/      Shared React components (UI, Link, RichText, Media, etc.)
  endpoints/       Custom API endpoints
  fields/          Reusable Payload field groups (slug, link, hero)
  Footer/          Footer global component
  globals/         Payload global configs (Header, Footer)
  Header/          Header global component
  heros/           Hero block components (HighImpact, MediumImpact, LowImpact, PostHero)
  hooks/           Server-side hooks (revalidation, format slug, etc.)
  plugins/         Payload plugin configs
  providers/       React context providers (Theme, LivePreview, etc.)
  search/          Search plugin config
  utilities/       Shared utility functions
```

- **Blocks**: Each block in `src/blocks/` has a Payload config and a React component — pages compose content from these
- **Heros**: Hero components in `src/heros/` render per-page hero sections (4 types)
- **Collections**: Payload collection configs in `src/collections/` define data models with access control and hooks
- **Globals**: Singleton data (Header nav, Footer) in `src/globals/`
- **Components**: Shared UI in `src/components/` — no strict layer boundaries

## Key Files

| File                             | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `payload.config.ts`              | Payload CMS config (SQLite, collections, plugins) |
| `src/app/(frontend)/globals.css` | Tailwind v4 @theme block — all design tokens      |
| `src/collections/Pages.ts`       | Pages collection with layout builder blocks       |
| `src/collections/Posts.ts`       | Blog posts collection                             |
| `src/collections/Events.ts`      | Events collection (custom)                        |
| `src/collections/Users.ts`       | Users collection with Payload native auth         |
| `src/collections/Media.ts`       | Media uploads with size variants                  |
| `src/blocks/`                    | Layout builder block configs + React components   |
| `src/heros/`                     | Hero block configs + React components             |
| `src/access/`                    | Access control helpers                            |
| `src/fields/`                    | Reusable field groups (slug, link, hero)          |
| `src/Header/`                    | Header global component                           |
| `src/Footer/`                    | Footer global component                           |
| `ecosystem.config.js`            | PM2 config for VPS                                |

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
| OAuth        | `payload-oauth2`                  | Provider-agnostic OAuth2 social login             |

## Local Dev Setup

```bash
npm install
cp .env.local.example .env.local   # fill in secrets (see Env Vars below)
npm run dev                         # → http://localhost:3000
# Visit /admin for first-time Payload admin setup (create first admin user)
```

## Env Vars (all secrets go in `.env.local`, never commit)

| Var                       | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `PAYLOAD_SECRET`          | Payload JWT signing (32+ random chars)          |
| `DATABASE_URI`            | `file:./data/payload.db`                        |
| `NEXT_PUBLIC_SERVER_URL`  | `http://localhost:3000` (dev) or production URL |
| `PREVIEW_SECRET`          | Draft preview URL signing                       |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth via payload-oauth2 (optional)      |

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
- **Timezone**: Site serves Central Time (`America/Chicago`). VPS runs UTC. Always use `startOfTodayCentral()` from `src/utilities/timezone.ts` for date comparisons and `timeZone: 'America/Chicago'` in date formatting. Never use bare `new Date().setHours(0,0,0,0)` — it gives midnight in server-local time (UTC), not Central.

## Connected Tools

- **Asana** (REST API): `$ASANA_PAT` user env var. GIDs stored in `$ASANA_WORKSPACE_GID` and `$ASANA_PROJECT_GID` env vars. Use `curl` with Bearer auth. On Windows, pass JSON via temp file (`-d @/tmp/file.json`).
- **Slack** (MCP): sprechereast.slack.com, channel #sprecher-east-na (ID: C0AJ124LBB2)
- **Analytics**: PostHog (planned — cookieless mode, free cloud tier)
