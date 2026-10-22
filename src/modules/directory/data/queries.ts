import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { PUBLISHED } from '@/platform/payload/published'

import type { FaqEntry, ResourceSummary } from '../domain/types'

/** More entries than either page will hold for a long while; both pages list everything. */
const MAX_LIST_SIZE = 200

/** Every published FAQ entry, lowest `order` first. */
export async function findFaqEntries(): Promise<FaqEntry[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'faq',
    depth: 0,
    limit: MAX_LIST_SIZE,
    sort: 'order',
    overrideAccess: false,
    where: PUBLISHED,
    select: { question: true, answer: true, category: true },
  })

  return result.docs
}

/** Every published resource, lowest `order` first. */
export async function findResources(): Promise<ResourceSummary[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'resources',
    depth: 0,
    limit: MAX_LIST_SIZE,
    sort: 'order',
    overrideAccess: false,
    where: PUBLISHED,
    select: { title: true, description: true, url: true, phone: true, category: true },
  })

  return result.docs
}
