# Sprecher East Neighborhood Website

## Single Source of Truth

- **Strategy docs (private):** `~/OneDrive/sprecher-east-strategy/` → GitHub: `boulaajaj/sprecher-east-strategy` (PRIVATE)
- **Website code (public):** This repo → GitHub: `boulaajaj/sprecher-east-neighborhood-website` (PUBLIC)
- **Asana role tags:** All tasks use `[R#-Role]` prefix — see `Asana-Task-Reference.md` in strategy repo

## Project Summary

Full rebuild of sprechereast.com. Phase 1 was static HTML. Phase 2 (current) is a
Next.js 15 + Tailwind v4 + Payload CMS v3 + Better Auth app with DDD component architecture.

## Current Stack (Phase 2)

- **Framework**: Next.js 15 (App Router, TypeScript)
- **CSS**: Tailwind CSS v4 (design tokens in `src/app/globals.css @theme {}`)
- **CMS**: Payload CMS v3 at `/admin` (self-hosted, SQLite `data/payload.db`)
- **Auth**: Better Auth (social login + email/password, SQLite `data/auth.db`)
- **Icons**: Lucide React
- **Hosting**: Hostinger VPS (Ubuntu 24.04, PM2 + Caddy) — live at http://187.77.27.93

## Component Architecture (DDD / Fractal)

```
src/components/
  ui/                         ← atomic, domain-agnostic primitives
    badge.tsx                   CategoryBadge, StatusBadge, TagBadge
    page-header.tsx             PageHeader (eyebrow, h1, description)
    empty-state.tsx             EmptyState (icon, title, description)
    section-header.tsx          SectionHeader (eyebrow, h2, view-all link)
    container.tsx               Container (max-w-6xl wrapper)
    index.ts
  features/
    events/                   ← events domain components
      event-card.tsx, event-detail-card.tsx, event-date-badge.tsx, event-list.tsx, index.ts
    posts/                    ← posts domain components
      post-card.tsx, post-feed-item.tsx, post-grid.tsx, post-feed.tsx, index.ts
  sections/                   ← full-width page sections
    hero.tsx, feature-strip.tsx, about-preview.tsx, events-news.tsx, cta-banner.tsx, index.ts
  layout/
    Nav.tsx                   'use client' — includes UserMenu (auth widget)
    Footer.tsx                Server component
    UserMenu.tsx              'use client' — shows Sign In or user avatar + dropdown
```

## Project File Structure

```
src/
  app/
    layout.tsx                Root (Poppins via next/font, metadata)
    globals.css               Tailwind v4 @theme block (all design tokens)
    (site)/layout.tsx         Shared Nav + Footer wrapper
    (site)/page.tsx           Homepage — uses sections/*
    (site)/about/page.tsx
    (site)/association/page.tsx
    (site)/events/page.tsx
    (site)/news/page.tsx
    (site)/resources/page.tsx
    (site)/get-involved/page.tsx
    (site)/contact/page.tsx + ContactForm.tsx ('use client')
    (site)/login/page.tsx     'use client' — social + email login
    (payload)/admin/[[...segments]]/page.tsx   Payload admin UI
    (payload)/api/[...slug]/route.ts           Payload REST API
    api/auth/[...all]/route.ts  Better Auth catch-all
    api/contact/route.ts      Contact form handler (logs only — needs email wired)
  lib/
    types.ts                  Shared TS types (Event, Post, BoardMember)
    data.ts                   Reads from Payload Local API, falls back to JSON
    auth.ts                   Better Auth server config (server-only)
    auth-client.ts            Better Auth client hooks (useSession, signIn, signOut)
    utils.ts                  formatDate, getDateParts, cn()
  middleware.ts               Protects /profile routes via session cookie check
  payload/collections/        Payload CMS schemas
    Events.ts, Posts.ts, BoardMembers.ts, Users.ts, Media.ts
payload.config.ts             Payload config (SQLite, collections, admin)
scripts/seed.ts               One-time: imports data/*.json into Payload DB
data/
  events.json, posts.json, board.json, site.json   (source of truth until seeded)
  payload.db, auth.db         (SQLite — gitignored, created at runtime)
public/images/               (must copy from assets/images — see setup)
```

## Design Tokens (src/app/globals.css @theme block)

- `--color-primary: #3d7a5e` → `bg-primary`, `text-primary`, `border-primary`
- `--color-accent: #e8923a` → `bg-accent`, `text-accent`
- `--color-background: #f9f8f5` → `bg-background`
- `--color-surface: #f0ede6` → `bg-surface`
- `--color-foreground: #1a1a1a` → `text-foreground`
- `--color-muted: #6b6b6b` → `text-muted`
- `--color-border: #e2ddd6` → `border-border`

## First-Time Local Setup

```bash
npm install
cp .env.local.example .env.local   # fill in PAYLOAD_SECRET + BETTER_AUTH_SECRET (32 char random strings)
mkdir -p data                       # already exists if repo was cloned with data/
node scripts/migrate-auth.mjs      # creates auth.db schema (user/session/account/verification tables)
npm run dev                         # → http://localhost:3000 (dev server also generates importMap.js)
# First visit to /admin → one-time "Create first admin" setup screen (creates payload.db)
# Seed content via /admin UI or wait for npx payload run fix on Node 24
```

## Env Vars Required

| Var                       | Purpose                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `PAYLOAD_SECRET`          | Payload JWT signing (32+ chars)                               |
| `DATABASE_URI`            | `file:./data/payload.db`                                      |
| `NEXT_PUBLIC_SERVER_URL`  | `http://localhost:3000` (dev)                                 |
| `BETTER_AUTH_SECRET`      | Better Auth session signing (32+ chars, different from above) |
| `NEXT_PUBLIC_APP_URL`     | `http://localhost:3000` (dev)                                 |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth (optional — social login)                        |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth (optional — social login)                        |

## CMS & Auth Key Notes

- Payload admin users (email/password) stored in `payload.db` — separate from public users
- Better Auth residents stored in `auth.db` — social login + email/password
- First Payload admin created by visiting `/admin` on a fresh DB (one-time setup UI)
- Seed script: `npx payload run scripts/seed.ts` — maps JSON field names to Payload schema
- `data.ts` uses `withJsonFallback()` — Payload Local API first, JSON files if DB not ready
- `overrideAccess: true` required in all server-side Payload reads (no session in RSC)

## Navigation

Home → About → Events → News → Resources → Get Involved → [Contact] (CTA) + [Sign In] (UserMenu)
Association page at `/association` (footer link, not in main nav)

## Known Gotchas (build-verified)

- **Payload REST route**: `REST_GET(config)` — curried; NOT `REST_GET(req, config)`
- **Payload admin importMap**: Auto-generated by Payload dev server on first run. Committed to repo.
  Lives at `src/app/(payload)/admin/importMap.js`
- **`defaultSort`**: Must be on collection root level, NOT inside `admin: {}`
- **`staticURL`**: Not a valid property in `UploadConfig` in Payload 3.77 — omit it
- **Better Auth `nextCookies()` plugin**: Required for Next.js 15 App Router cookie forwarding
- **Better Auth DB init**: Run `node scripts/migrate-auth.mjs` before first use — creates user/session/account/verification tables in auth.db
- **Better Auth `!` char bug**: v1.4.19 has a JSON parse bug with `!` in passwords (position 57). Minor edge case; most passwords work fine.
- **`npx payload run` fails on Node v24**: `payload/dist/bin/loadEnv.js` incompatible with Node 24. Use `node scripts/migrate-auth.mjs` for auth migration. Seed via a Next.js API route or wait for Payload fix.
- **Two separate secrets**: `PAYLOAD_SECRET` ≠ `BETTER_AUTH_SECRET` — never share
- **`graphql` package**: Must install separately — `@payloadcms/graphql` doesn't bundle it
- **npm installs**: Always use `--legacy-peer-deps` for Payload packages (peer dep conflicts)
- **JSON data shape**: `data/*.json` nest arrays under keys. `data.ts` unwraps with `raw.events ?? []`
- **Write tool requires prior Read**: Always read a file before writing it

## DDD Architecture Guidelines

- `ui/` = pure presentational, no domain knowledge
- `features/{domain}/` = domain-specific, composed from ui primitives
- `sections/` = full-page sections, composed from features + ui
- `layout/` = app shell (Nav, Footer, UserMenu)
- Barrel exports in `index.ts` per folder; files max ~300 lines

## VPS Info

See `memory/vps.md` for full server details.
Site live at http://187.77.27.93 (PM2 + Caddy reverse proxy).
CI/CD: push to `main` → GitHub Actions → SSH deploy → `npm ci && npm run build && pm2 reload`.
VPS first-deploy extra steps: create `data/` dir, set env vars, run seed script, create admin user at /admin.

## Progress Tracker

See `memory/progress.md` for full list of completed work and open issues.
Current open issues (priority order):

1. Browser email sign-up hangs ("Creating account…" freezes)
2. Better Auth `!` in passwords causes 500
3. Payload seed script broken on Node v24 → Payload DB is empty (JSON fallback works)
4. GitHub Actions secrets not set (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT)
5. VPS still running Phase 1 (Phase 2 not deployed yet)
