import {
  FAQ_CATEGORIES,
  RESOURCE_CATEGORIES,
  type FaqCategory,
  type ResourceCategory,
} from './categories'
import type { CategorySection, FaqEntry, ResourceSummary } from './types'

/**
 * `items` in one section per category, in the list's order and keeping the items' order within
 * each. An item with no category, or one the list doesn't have, goes under `fallback`. Categories
 * with no items are left out.
 */
function groupByCategory<Category extends string, Item extends { category?: Category | null }>(
  items: readonly Item[],
  categories: readonly { value: Category; label: string }[],
  fallback: Category,
): CategorySection<Category, Item>[] {
  const known = new Set<string>(categories.map(({ value }) => value))
  const byCategory = new Map<Category, Item[]>()

  for (const item of items) {
    const category = item.category && known.has(item.category) ? item.category : fallback
    const grouped = byCategory.get(category)
    if (grouped) grouped.push(item)
    else byCategory.set(category, [item])
  }

  return categories.flatMap(({ value, label }) => {
    const grouped = byCategory.get(value)
    return grouped ? [{ category: value, label, items: grouped }] : []
  })
}

/** FAQ entries in sections by category; one with no category, or one no longer listed, is General. */
export function toFaqSections(
  entries: readonly FaqEntry[],
): CategorySection<FaqCategory, FaqEntry>[] {
  return groupByCategory(entries, FAQ_CATEGORIES, 'general')
}

/** Resources in sections by category; one whose category is no longer listed is Other. */
export function toResourceSections(
  resources: readonly ResourceSummary[],
): CategorySection<ResourceCategory, ResourceSummary>[] {
  return groupByCategory(resources, RESOURCE_CATEGORIES, 'other')
}
