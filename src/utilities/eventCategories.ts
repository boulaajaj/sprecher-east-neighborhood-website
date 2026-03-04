import type { Event } from '@/payload-types'

export const categoryLabels: Record<NonNullable<Event['category']>, string> = {
  meeting: 'Meeting',
  social: 'Social',
  volunteer: 'Volunteer',
  workshop: 'Workshop',
  sports: 'Sports & Recreation',
  community: 'Community',
  other: 'Other',
}

export function getCategoryLabel(category: NonNullable<Event['category']>): string {
  return categoryLabels[category] ?? category
}
