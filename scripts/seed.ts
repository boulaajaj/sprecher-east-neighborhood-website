/**
 * One-time seed script — imports data/events.json, posts.json, board.json into Payload CMS.
 * Run after first setup: npx payload run scripts/seed.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  console.log('🌱 Seeding database...')
  const payload = await getPayload({ config })

  // ── Events ────────────────────────────────────────────────────────────────
  const eventsData = await import('../data/events.json')
  const rawEvents = eventsData.default as { events: any[] }
  const events = Array.isArray(rawEvents) ? rawEvents : (rawEvents.events ?? [])

  console.log(`  → Seeding ${events.length} events...`)
  for (const e of events) {
    const slug = e.slug?.current ?? e.slug ?? e.title.toLowerCase().replace(/\s+/g, '-')
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
          category: e.category ?? 'community',
          locationType: e.location?.type ?? e.locationType ?? 'in-person',
          locationName: e.location?.name ?? e.locationName ?? undefined,
          locationAddress: e.location?.address ?? e.locationAddress ?? undefined,
          locationCity: e.location?.city ?? e.locationCity ?? 'Madison',
          mapsUrl: e.location?.maps_url ?? e.mapsUrl ?? undefined,
          registrationUrl: e.registrationUrl ?? undefined,
          description: e.description,
          featured: e.featured ?? false,
        },
      })
    } catch (err: any) {
      console.warn(`    ⚠ Skipped event "${e.title}": ${err.message}`)
    }
  }

  // ── Posts ─────────────────────────────────────────────────────────────────
  const postsData = await import('../data/posts.json')
  const rawPosts = postsData.default as { posts: any[] }
  const posts = Array.isArray(rawPosts) ? rawPosts : (rawPosts.posts ?? [])

  console.log(`  → Seeding ${posts.length} posts...`)
  for (const p of posts) {
    const slug = p.slug?.current ?? p.slug ?? p.title.toLowerCase().replace(/\s+/g, '-')
    try {
      await payload.create({
        collection: 'posts',
        overrideAccess: true,
        data: {
          title: p.title,
          slug,
          publishedAt: p.publishedAt ?? p.date ?? new Date().toISOString(),
          author: p.author ?? 'SENA',
          category: p.category ?? 'announcement',
          tags: (p.tags ?? []).map((tag: string) => ({ tag })),
          featured: p.featured ?? false,
          excerpt: p.excerpt,
        },
      })
    } catch (err: any) {
      console.warn(`    ⚠ Skipped post "${p.title}": ${err.message}`)
    }
  }

  // ── Board Members ─────────────────────────────────────────────────────────
  const boardData = await import('../data/board.json')
  const rawBoard = boardData.default as { board: any[] }
  const board = Array.isArray(rawBoard) ? rawBoard : (rawBoard.board ?? [])

  console.log(`  → Seeding ${board.length} board members...`)
  for (const m of board) {
    try {
      await payload.create({
        collection: 'board-members',
        overrideAccess: true,
        data: {
          name: m.name,
          role: m.role,
          bio: m.bio ?? undefined,
          email: m.email ?? undefined,
          order: m.order ?? 99,
        },
      })
    } catch (err: any) {
      console.warn(`    ⚠ Skipped member "${m.name}": ${err.message}`)
    }
  }

  console.log('✅ Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
