/** Where an event happens, with the label shown as its "Format". The collection's options too. */
export const EVENT_LOCATION_TYPES = [
  { value: 'in-person', label: 'In Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'hybrid', label: 'Hybrid' },
] as const

export type EventLocationType = (typeof EVENT_LOCATION_TYPES)[number]['value']

/** The label shown for a location type, for example "In Person" for `in-person`. */
export function eventLocationTypeLabel(locationType: EventLocationType): string {
  return EVENT_LOCATION_TYPES.find(({ value }) => value === locationType)?.label ?? locationType
}
