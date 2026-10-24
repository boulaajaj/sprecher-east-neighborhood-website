import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { FeedPage } from '@/platform/lib'
import { PUBLISHED } from '@/platform/payload/published'

import type { PostDetail, PostSitemapEntry, PostSummary } from '../domain/types'
import { latestPostsWhere, searchMatch } from './filters'
import {
  SEARCH_RESULT_FIELDS,
  SUMMARY_FIELDS,
  toPostDetail,
  toPostSummary,
  toSearchResult,
} from './mappers'

/** Posts per page on /posts, its numbered pages and each "Load more". */
export const POSTS_PAGE_SIZE = 12

/** One page of published posts, newest first. */
export async function findPostPage(page: number): Promise<FeedPage<PostSummary>> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PAGE_SIZE,
    page,
    sort: '-publishedAt',
    overrideAccess: false,
    where: PUBLISHED,
    select: SUMMARY_FIELDS,
  })

  return {
    docs: result.docs.map(toPostSummary),
    page: result.page ?? page,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
    limit: POSTS_PAGE_SIZE,
  }
}

/**
 * The newest published posts, leaving out `excludeIds`, and only those in `categoryIds` when
 * any are given.
 */
export async function findLatestPosts({
  limit,
  excludeIds,
  categoryIds,
}: {
  limit: number
  excludeIds?: number[]
  categoryIds?: number[]
}): Promise<PostSummary[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    sort: '-publishedAt',
    overrideAccess: false,
    where: latestPostsWhere({ excludeIds, categoryIds }),
    select: SUMMARY_FIELDS,
  })

  return result.docs.map(toPostSummary)
}

/**
 * The post at `slug`, or `null`. With `draft`, the latest draft, read past access control so
 * editors can preview it; otherwise only what a visitor may see.
 */
export async function getPostBySlug(
  slug: string,
  { draft }: { draft: boolean },
): Promise<PostDetail | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  const doc = result.docs[0]
  return doc ? toPostDetail(doc) : null
}

/** Every published post's slug and last edit. */
export async function listPostSlugs(): Promise<PostSitemapEntry[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    where: PUBLISHED,
    select: { slug: true, updatedAt: true },
  })

  return result.docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}

/** How many posts are published. */
export async function countPublishedPosts(): Promise<number> {
  const payload = await getPayload({ config: configPromise })

  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
    where: PUBLISHED,
  })

  return totalDocs
}

/** How many results the search page shows. */
const SEARCH_RESULTS_LIMIT = 12

/**
 * Search entries (posts and events) whose title, slug or search-engine title or description
 * contains `query`; every entry when `query` is empty.
 */
export async function findSearchResults(query: string): Promise<PostSummary[]> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'search',
    depth: 1,
    limit: SEARCH_RESULTS_LIMIT,
    // No page count needed: the page shows the first results only
    pagination: false,
    overrideAccess: false,
    select: SEARCH_RESULT_FIELDS,
    // Only which collection the entry copies is read, not the post or event itself
    populate: { posts: { slug: true }, events: { slug: true } },
    where: searchMatch(query),
  })

  return result.docs.flatMap((doc) => toSearchResult(doc) ?? [])
}
