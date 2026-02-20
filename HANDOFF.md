# Sprecher East — Project Handoff

**Last updated:** 2026-02-19
**Status:** Next.js + Tailwind + Sanity app built. Needs `npm install` + image migration to run.

---

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 15** (App Router, TypeScript) | Most popular React framework, SSG + SSR, Vercel-native |
| CSS | **Tailwind CSS v4** | Utility-first, co-developed with Next.js team, huge ecosystem |
| CMS | **Sanity v3** | React-based Studio embedded in app at `/studio`, Git-friendly, free tier |
| Icons | **Lucide React** | Standard in the Next.js/React ecosystem |
| Hosting | **Vercel** (recommended) | Made by the Next.js team, free tier, auto-deploy from GitHub |

---

## Project Structure

```
src/
  app/
    layout.tsx                  Root layout (Poppins font via next/font, metadata)
    globals.css                 Tailwind v4 + design tokens (@theme block)
    (site)/
      layout.tsx                Wraps all public pages with Nav + Footer
      page.tsx                  Homepage (events feed + news feed)
      about/page.tsx
      association/page.tsx      Mission, board, bylaws
      events/page.tsx
      news/page.tsx
      resources/page.tsx
      get-involved/page.tsx
      contact/
        page.tsx
        ContactForm.tsx         'use client' — form state, validation, fetch
    studio/[[...tool]]/page.tsx Sanity Studio (manage content at /studio)
    api/contact/route.ts        Contact form API (log only; wire to email later)

  components/
    layout/Nav.tsx              'use client' — sticky, mobile slide-out menu
    layout/Footer.tsx           Server component
    EventCard.tsx               Compact + full-detail variants
    PostCard.tsx                Feed + card variants

  sanity/
    env.ts                      Sanity project ID / dataset from env vars
    sanity.config.ts            Studio configuration (imported by /studio route)
    schemas/
      event.ts
      post.ts
      boardMember.ts
      index.ts
    lib/
      client.ts                 Sanity client (next-sanity)
      queries.ts                GROQ queries for events, posts, board

  lib/
    types.ts                    Shared TypeScript types (Event, Post, BoardMember)
    data.ts                     Data layer — JSON fallback OR Sanity (auto-detects env var)
    utils.ts                    Date formatting, cn() class helper

data/
  events.json                   2 seeded events (I-39/90/94 hearings)
  posts.json                    2 seeded posts
  board.json                    4 placeholder board member slots
  site.json                     Site config

public/
  images/                       (MUST create — see migration steps below)
```

---

## First-Time Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Migrate images (CRITICAL — images won't load without this)
```bash
# Windows PowerShell:
Copy-Item -Recurse "assets\images" "public\images"

# Unix/macOS/Git Bash:
cp -r assets/images public/images
```

Images are referenced in components as `/images/filename.jpg` (served from `public/images/`).

### 3. Start dev server
```bash
npm run dev
# → http://localhost:3000
```

The site works fully without Sanity configured — it reads from `data/*.json` automatically.

### 4. (Optional) Connect Sanity CMS
```bash
# Create a free Sanity project
npx sanity@latest init

# Copy env file and fill in your Project ID
cp .env.local.example .env.local
# Edit .env.local with your Sanity project ID

# Visit /studio to manage content
npm run dev
# → http://localhost:3000/studio
```

---

## Design System

All design tokens live in `src/app/globals.css` inside the `@theme {}` block.
Tailwind v4 auto-generates utility classes from them:

| Token | Value | Generated class |
|-------|-------|-----------------|
| `--color-primary` | `#3d7a5e` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-accent` | `#e8923a` | `bg-accent`, `text-accent` |
| `--color-background` | `#f9f8f5` | `bg-background` |
| `--color-surface` | `#f0ede6` | `bg-surface` |
| `--color-foreground` | `#1a1a1a` | `text-foreground` |
| `--color-muted` | `#6b6b6b` | `text-muted` |
| `--color-border` | `#e2ddd6` | `border-border` |
| `--font-sans` | Poppins var | `font-sans` |

To change a color site-wide: edit one line in `globals.css`.

---

## Data Layer

`src/lib/data.ts` auto-detects whether Sanity is configured:
- **No env var set** → reads from `data/*.json` (zero-config, works immediately)
- **Env var set** → fetches from Sanity API via GROQ

Switching to Sanity is just adding 3 env vars — no code changes needed.

---

## Pages

| Route | File | Data source |
|-------|------|------------|
| `/` | `(site)/page.tsx` | events + posts |
| `/about` | `(site)/about/page.tsx` | static |
| `/association` | `(site)/association/page.tsx` | board members |
| `/events` | `(site)/events/page.tsx` | events |
| `/news` | `(site)/news/page.tsx` | posts |
| `/resources` | `(site)/resources/page.tsx` | static |
| `/get-involved` | `(site)/get-involved/page.tsx` | board members |
| `/contact` | `(site)/contact/page.tsx` | static |
| `/studio` | `studio/[[...tool]]/page.tsx` | Sanity Studio |

---

## Adding Content Without a CMS

Edit the JSON files in `data/`:
- `data/events.json` — add new events
- `data/posts.json` — add news posts
- `data/board.json` — update board members with real names

---

## Wiring Up the Contact Form

Currently the form POSTs to `/api/contact/route.ts` which logs to the server console.

**Option A — Formspree (simplest, free tier):**
1. Create account at formspree.io, create a form, copy the form ID
2. In `ContactForm.tsx`, change `fetch('/api/contact', ...)` to `fetch('https://formspree.io/f/YOUR_ID', ...)`
3. Delete `src/app/api/contact/route.ts`

**Option B — Resend (developer-friendly, generous free tier):**
```bash
npm install resend
```
Then add to `route.ts`:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({ from: 'noreply@yourdomain.com', to: 'board@sena.org', ... })
```

---

## Deployment (Vercel)

```bash
# 1. Push repo to GitHub
# 2. Go to vercel.com → New Project → Import your GitHub repo
# 3. Add env vars in Vercel dashboard:
#    NEXT_PUBLIC_SANITY_PROJECT_ID
#    NEXT_PUBLIC_SANITY_DATASET
# 4. Click Deploy — auto-deploys on every push to main
```

---

## What Still Needs Real Data

| Item | Location | Current State |
|------|---------|---------------|
| Board member names | `data/board.json` | Placeholder roles only |
| More events | `data/events.json` | 2 events from July 2024 |
| More news posts | `data/posts.json` | 2 placeholder posts |
| Contact email delivery | `src/app/api/contact/route.ts` | Console.log only |
| Sanity project | `.env.local` | Not configured |

---

## Key Architectural Decisions

1. **Nav/footer duplication solved**: Single `(site)/layout.tsx` wraps all pages with Nav + Footer. One change updates everywhere.
2. **Client/Server split**: Nav is `'use client'` (mobile menu state), all pages are Server Components (data fetching), ContactForm is `'use client'` (form state).
3. **Zero-config data**: `data/*.json` → no Sanity account needed to run the site.
4. **Sanity opt-in**: Set env vars → instantly upgrades to full CMS with Studio UI.
5. **Font**: Poppins via `next/font/google` — self-hosted at build time, no Google CDN at runtime.
6. **Design tokens**: All in `globals.css @theme {}` — one source of truth for colors, font.

---

## Session History

- **Session 1**: Full static site rebuilt (8 HTML pages, data/*.json, main.css, main.js)
- **Session 2**: User requested React. Full Next.js 15 + Tailwind v4 + Sanity v3 app built.
- Old static HTML files still exist in root but are ignored by Next.js routing.
