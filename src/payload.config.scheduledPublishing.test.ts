import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { SCHEDULED_PUBLISH_QUEUE } from '@/platform/payload/jobRunners'

/**
 * Scheduled publishing (#141): the Admin's Schedule button queues Payload's `schedulePublish`
 * task, and the app runs `SCHEDULED_PUBLISH_QUEUE`. This checks that Payload puts the task in
 * that queue, and that running the queue publishes a post that is due. Payload runs on an
 * in-memory SQLite database: no file, no network.
 */

// The posts' revalidation hook needs a Next.js request, which a test doesn't have
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

let payload: Payload

beforeAll(async () => {
  vi.stubEnv('DATABASE_URI', 'file::memory:')
  vi.stubEnv('PAYLOAD_SECRET', 'scheduled-publishing-test-secret-0123456789')
  vi.stubEnv('SMTP_HOST', '')
  const { getPayload } = await import('payload')
  const config = await (await import('@payload-config')).default
  payload = await getPayload({ config })
}, 60_000)

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal' }],
      },
    ],
  },
})

describe('scheduled publishing', () => {
  it('publishes a due post when the app’s runner runs its queue', async () => {
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title: 'Scheduled',
        slug: 'scheduled',
        content: paragraph('Soon.'),
        _status: 'draft',
      },
      draft: true,
      overrideAccess: true,
    })

    // What the Admin's Schedule button queues (`schedulePublishHandler` in @payloadcms/ui)
    const job = await payload.jobs.queue({
      task: 'schedulePublish',
      input: { type: 'publish', doc: { relationTo: 'posts', value: draft.id } },
      waitUntil: new Date(Date.now() - 1000),
    })
    expect(job.queue).toBe(SCHEDULED_PUBLISH_QUEUE)

    await payload.jobs.run({ queue: SCHEDULED_PUBLISH_QUEUE })

    const post = await payload.findByID({
      collection: 'posts',
      id: draft.id,
      depth: 0,
      overrideAccess: true,
    })
    expect(post._status).toBe('published')
  })

  it('leaves a post that isn’t due yet as a draft', async () => {
    const draft = await payload.create({
      collection: 'posts',
      data: { title: 'Later', slug: 'later', content: paragraph('Later.'), _status: 'draft' },
      draft: true,
      overrideAccess: true,
    })
    await payload.jobs.queue({
      task: 'schedulePublish',
      input: { type: 'publish', doc: { relationTo: 'posts', value: draft.id } },
      waitUntil: new Date(Date.now() + 60 * 60 * 1000),
    })

    await payload.jobs.run({ queue: SCHEDULED_PUBLISH_QUEUE })

    const post = await payload.findByID({
      collection: 'posts',
      id: draft.id,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    expect(post._status).toBe('draft')
  })
})
