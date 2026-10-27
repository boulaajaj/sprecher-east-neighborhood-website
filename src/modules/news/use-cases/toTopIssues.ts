import 'server-only'

import type { TopIssuesBlock } from '@/payload-types'

import { toTopIssuesBlockProps } from '../data/mappers'
import type { TopIssuesBlockProps } from '../domain/topIssues'

/**
 * "Top issues" as the page draws it (#484), for the block registry: the block arrives as the
 * page's layout stores it, with its links' posts and pages populated by the page query, and is
 * mapped here (decision 0013, point 3). `null` when no issue can be shown.
 */
export function toTopIssues(
  block: Pick<TopIssuesBlock, 'id' | 'heading' | 'reviewedAt' | 'items'>,
): TopIssuesBlockProps | null {
  return toTopIssuesBlockProps(block)
}
