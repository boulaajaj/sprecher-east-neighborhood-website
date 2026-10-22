/** Every event category, with the label editors and visitors see. The collection's options too. */
export const EVENT_CATEGORIES = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'social', label: 'Social' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]['value']

/** The label shown for a category, for example "Sports & Recreation" for `sports`. */
export function formatEventCategory(category: EventCategory): string {
  return EVENT_CATEGORIES.find(({ value }) => value === category)?.label ?? category
}
