/**
 * Seed script — imports data/events.json, posts.json, board.json into Payload CMS.
 * Run after first setup: npx payload run scripts/seed.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

// Convert plain text to Lexical richText JSON
function textToLexical(text: string) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return {
    root: {
      type: 'root',
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: p.trim(),
            format: 0,
            detail: 0,
            mode: 'normal' as const,
            style: '',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// Map JSON categories to Payload event category options
const eventCategoryMap: Record<string, string> = {
  government: 'meeting',
  community: 'community',
  social: 'social',
  volunteer: 'volunteer',
  workshop: 'workshop',
  sports: 'sports',
  other: 'other',
}

async function seed() {
  console.log('Seeding database...')
  const payload = await getPayload({ config })

  // ── Events ────────────────────────────────────────────────────────────────
  const eventsData = await import('../data/events.json')
  const rawEvents = eventsData.default as { events: any[] }
  const events = Array.isArray(rawEvents) ? rawEvents : (rawEvents.events ?? [])

  console.log(`  -> Seeding ${events.length} events...`)
  for (const e of events) {
    const slug = e.slug ?? e.title.toLowerCase().replace(/\s+/g, '-')
    try {
      await payload.create({
        collection: 'events',
        overrideAccess: true,
        data: {
          title: e.title,
          slug,
          date: e.date,
          timeStart: e.time_start ?? e.timeStart ?? undefined,
          timeEnd: e.time_end ?? e.timeEnd ?? undefined,
          category: (eventCategoryMap[e.category] ?? 'community') as
            | 'meeting'
            | 'community'
            | 'social'
            | 'volunteer'
            | 'workshop'
            | 'sports'
            | 'other',
          locationType: e.location?.type ?? e.locationType ?? 'in-person',
          locationName: e.location?.name ?? e.locationName ?? undefined,
          locationAddress: e.location?.address ?? e.locationAddress ?? undefined,
          mapsUrl: e.location?.maps_url ?? e.mapsUrl ?? undefined,
          registrationUrl: e.registrationUrl ?? undefined,
          description: e.description,
          featured: e.featured ?? false,
          _status: 'published',
        },
      })
    } catch (err: any) {
      console.warn(`    ! Skipped event "${e.title}": ${err.message}`)
    }
  }

  // ── Posts ─────────────────────────────────────────────────────────────────
  const postsData = await import('../data/posts.json')
  const rawPosts = postsData.default as { posts: any[] }
  const posts = Array.isArray(rawPosts) ? rawPosts : (rawPosts.posts ?? [])

  console.log(`  -> Seeding ${posts.length} posts...`)
  for (const p of posts) {
    const slug = p.slug ?? p.title.toLowerCase().replace(/\s+/g, '-')
    try {
      await payload.create({
        collection: 'posts',
        overrideAccess: true,
        data: {
          title: p.title,
          slug,
          publishedAt: p.date ?? new Date().toISOString(),
          content: textToLexical(p.content ?? p.excerpt ?? ''),
          _status: 'published',
        },
      })
    } catch (err: any) {
      console.warn(`    ! Skipped post "${p.title}": ${err.message}`)
    }
  }

  // ── Team Members (Board) ──────────────────────────────────────────────────
  const boardData = await import('../data/board.json')
  const rawBoard = boardData.default as { board: any[] }
  const board = Array.isArray(rawBoard) ? rawBoard : (rawBoard.board ?? [])

  console.log(`  -> Seeding ${board.length} team members...`)
  for (let i = 0; i < board.length; i++) {
    const m = board[i]
    try {
      await payload.create({
        collection: 'team-members',
        overrideAccess: true,
        data: {
          memberType: 'board-member',
          name: m.name,
          role: m.role,
          bio: m.bio ?? undefined,
          email: m.email || undefined,
          status: 'active',
          order: i + 1,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    } catch (err: any) {
      console.warn(`    ! Skipped member "${m.name}": ${err.message}`)
    }
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
