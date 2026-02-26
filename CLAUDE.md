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
- **CSS**: Tailwind CSS v4 (design tokens in `src/app/globals.css @theme {}`)
- **CMS**: Payload CMS v3 at `/admin` (self-hosted, SQLite `data/payload.db`)
- **Auth**: Better Auth (social login + email/password, SQLite `data/auth.db`)
- **Icons**: Lucide React
- **Hosting**: Hostinger VPS (Ubuntu 24.04, PM2 + Caddy)

## VPS / Hosting
- **VM ID**: 1371281
- **Hostname**: srv1371281.hstgr.cloud
- **IP**: 187.77.27.93
- **Domain**: sprechereast.com (transfer pending — currently served by IP)
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

## Architecture (DDD / Fractal Components)
```
src/components/
  ui/              Atomic, domain-agnostic primitives (Badge, PageHeader, EmptyState, etc.)
  features/
    events/        Event domain components (EventCard, EventList, etc.)
    posts/         Post domain components (PostCard, PostGrid, etc.)
  sections/        Full-width page sections (Hero, FeatureStrip, CTA, etc.)
  layout/          App shell (Nav, Footer, UserMenu)
```
- `ui/` = pure presentational, no domain knowledge
- `features/{domain}/` = domain-specific, composed from ui primitives
- `sections/` = full-page sections, composed from features + ui
- Barrel exports in `index.ts` per folder; files max ~300 lines

## Key Files
| File | Purpose |
|------|---------|
| `src/app/globals.css` | Tailwind v4 @theme block — all design tokens |
| `src/lib/data.ts` | Reads Payload first, falls back to JSON (`withJsonFallback`) |
| `src/lib/auth.ts` | Better Auth server config |
| `src/lib/auth-client.ts` | Better Auth client hooks |
| `src/middleware.ts` | Protects /profile routes |
| `payload.config.ts` | Payload CMS config (SQLite, collections) |
| `ecosystem.config.js` | PM2 config for VPS |
| `data/*.json` | Seed data (events, posts, board, site config) |

## Design Tokens
| Token | Value | Classes |
|-------|-------|---------|
| `--color-primary` | `#3d7a5e` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-accent` | `#e8923a` | `bg-accent`, `text-accent` |
| `--color-background` | `#f9f8f5` | `bg-background` |
| `--color-surface` | `#f0ede6` | `bg-surface` |
| `--color-foreground` | `#1a1a1a` | `text-foreground` |
| `--color-muted` | `#6b6b6b` | `text-muted` |
| `--color-border` | `#e2ddd6` | `border-border` |

## Local Dev Setup
```bash
npm install
cp .env.local.example .env.local   # fill in secrets (see Env Vars below)
node scripts/migrate-auth.mjs      # creates auth.db schema
npm run dev                         # → http://localhost:3000
# Visit /admin for first-time Payload admin setup
```

## Env Vars (all secrets go in `.env.local`, never commit)
| Var | Purpose |
|-----|---------|
| `PAYLOAD_SECRET` | Payload JWT signing (32+ random chars) |
| `DATABASE_URI` | `file:./data/payload.db` |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` (dev) or production URL |
| `BETTER_AUTH_SECRET` | Session signing (32+ random chars, different from above) |
| `NEXT_PUBLIC_APP_URL` | Must match actual running port |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth (optional) |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth (optional) |

System-level env vars (not in .env.local):
| Var | Purpose |
|-----|---------|
| `HOSTINGER_API_KEY` | Hostinger API for VPS snapshots and management |

## Known Gotchas
- **npm installs**: Always use `--legacy-peer-deps` for Payload packages
- **Payload REST route**: `REST_GET(config)` — curried, NOT `REST_GET(req, config)`
- **Payload importMap**: Auto-generated on dev server start at `src/app/(payload)/admin/importMap.js`
- **`defaultSort`**: Must be on collection root, NOT inside `admin: {}`
- **Better Auth cookies**: `nextCookies()` plugin required for Next.js 15 App Router
- **Better Auth DB init**: Run `node scripts/migrate-auth.mjs` before first use
- **`npx payload run` broken on Node v24**: Use direct node scripts instead
- **Two separate secrets**: `PAYLOAD_SECRET` ≠ `BETTER_AUTH_SECRET`
- **`graphql` package**: Must install separately from `@payloadcms/graphql`
- **Port mismatch**: `NEXT_PUBLIC_APP_URL` must match actual running port or auth CORS fails

## Connected Tools
- **Asana**: Workspace "Meadowlands Together", project "Sprecher East — Master Board"
- **Slack**: sprechereast.slack.com, channel #sprecher-east-na
- **Analytics**: PostHog (planned — cookieless mode, free cloud tier)
