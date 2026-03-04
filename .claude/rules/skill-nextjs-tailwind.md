# Next.js 15 and Tailwind CSS v4 Patterns

Technical patterns for Next.js App Router pages and Tailwind styling in this codebase.

## CMS Page Routes

The `src/app/(frontend)/[slug]/page.tsx` pattern:

1. `generateStaticParams()` — queries all pages, returns `{ slug }` array
2. `Page` component — resolves slug (default `'home'`), fetches page via cached query, renders `<RenderHero>` + `<RenderBlocks>`
3. `generateMetadata()` — calls `generateMeta({ doc })` from `src/utilities/generateMeta.ts`

All page queries use `cache()` from React to deduplicate fetches between Page and generateMetadata.

## Custom Collection Routes

For non-CMS pages like `/posts`, `/events`, `/resources`, `/faq`:

```
export const dynamic = 'force-static'
export const revalidate = 600
```

Fetch data directly with `payload.find()` (not Route Handlers). Use `select` to limit returned fields and `depth` to control relationship population.

## Metadata and SEO

**IMPORTANT**: The root layout (`src/app/(frontend)/layout.tsx`) has `title.template: '%s — Sprecher East'`. This automatically appends the brand name to every page title.

- **Never append brand name** in `generateMeta()`, page metadata, or seed data `meta.title`
- Set `meta.title` to the page name only: `'Home'`, `'About'`, `'Contact'`
- The layout template handles branding — setting `title: 'About'` produces `'About — Sprecher East'`
- Use `generateMeta()` from `src/utilities/generateMeta.ts` for CMS pages
- **OG URL override for collection detail pages**: `generateMeta()` produces generic `/${slug}` URLs. Collection detail pages (`/posts/[slug]`, `/events/[slug]`) MUST override `openGraph.url` with the full route prefix:
  ```typescript
  const meta = await generateMeta({ doc })
  return { ...meta, openGraph: { ...(meta.openGraph ?? {}), url: `/posts/${doc.slug}` } }
  ```
  Top-level CMS pages (`/[slug]`) are fine with the default `/${slug}`.
- For custom routes, return `{ title: 'Page Name', description: '...' }` directly
- When writing fallback strings with template literals, always guard against null/undefined: `event?.title ? \`Details for ${event.title}\` : ''`— never`\`Details for ${event?.title}\``which produces`"Details for undefined"`
- The SEO plugin `generateTitle` (`src/plugins/index.ts`) returns the page name only — never append brand name there either. Fallback should be `'Sprecher East'` (not empty string) so the admin UI pre-fill is useful

## Server vs Client Components

- Default to Server Components (no directive needed)
- Push `'use client'` to leaf components that need interactivity (forms, theme toggle, search)
- Use children-as-props pattern to keep parents as Server Components
- Never import server-only code (Payload, fs, crypto) in client components

## Caching

- Use React `cache()` to deduplicate server-side fetches within a request
- Use `revalidatePath()` or `revalidateTag()` in afterChange hooks for on-demand revalidation
- Never call Route Handlers from Server Components — use the Payload Local API directly
- For site URL, use the shared `getServerSideURL()` from `src/utilities/getURL.ts` (see DRY principle in `development.md`)
- Static pages use `revalidate = 600` (10 minutes) as default ISR interval

## Styling Rules

**IMPORTANT**: Never use inline CSS (`style={}`) or hardcoded hex colors. All styling goes through Tailwind utility classes using design token names.

- Use semantic token classes: `bg-primary`, `text-foreground`, `border-border`, `bg-surface`
- All design tokens defined in `src/app/(frontend)/globals.css` inside `@theme {}`
- Dark mode uses `[data-theme='dark']` selector — tokens auto-switch, no manual dark: prefixes needed for token colors
- Container: use the `container` class (max-width with auto margins)
- Font: Poppins loaded via `next/font/google` in layout, applied as `--font-poppins` CSS variable

## Design Tokens

Defined in `globals.css @theme`:

| Token                      | Light     | Dark      |
| -------------------------- | --------- | --------- |
| `--color-primary`          | `#3d7a5e` | `#4e9b76` |
| `--color-accent`           | `#e8923a` | `#f0a04b` |
| `--color-background`       | `#f9f8f5` | `#0f1117` |
| `--color-surface`          | `#f0ede6` | `#1e2130` |
| `--color-foreground`       | `#1a1a1a` | `#e8e6e3` |
| `--color-muted-foreground` | `#6b6b6b` | `#9ca3af` |
| `--color-border`           | `#e2ddd6` | `#2d3040` |

## Dates and Timezone

The site timezone is configured via `SITE_TIMEZONE` env var (default: `America/Chicago`). All timezone logic lives in `src/utilities/timezone.ts` — never hardcode timezone strings elsewhere.

- **All date comparisons** (e.g., "upcoming" vs "past" events) must use the site timezone, not server-local time. The VPS runs UTC — `new Date().setHours(0,0,0,0)` gives midnight UTC, not midnight site time.
- Use `startOfToday()` from `src/utilities/timezone.ts` for "today" cutoffs in Payload queries
- Use `SITE_TIMEZONE` from `src/utilities/timezone.ts` when you need the raw timezone string (e.g., for `toLocaleDateString`)
- **Day-only dates vs datetimes**: Payload stores day-only dates (`pickerAppearance: 'dayOnly'`) as midnight UTC (e.g., `2026-03-03T00:00:00.000Z`). When **displaying** these, use `timeZone: 'UTC'` so "March 3" doesn't render as "March 2". When displaying actual datetimes with time components, use `SITE_TIMEZONE`.
- `formatDateTime()` and `formatDateShort()` in `src/utilities/formatDateTime.ts` handle this automatically — they detect day-only timestamps (ending in `T00:00:00.000Z`) and use UTC, otherwise use the site timezone.
- `startOfToday()` converts the current site-local date to midnight UTC to match Payload's day-only storage format for correct query comparisons.

## Images

- Use `next/image` for all images — never raw `<img>` tags
- Set `priority` on hero/above-fold images
- Below-fold images use default lazy loading
- Payload Media component (`src/components/Media/`) handles both image and video
