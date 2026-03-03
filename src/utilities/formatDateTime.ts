const TIMEZONE = 'America/Chicago'

export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp)

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  })
}

export const formatDateShort = (timestamp: string): string => {
  const date = new Date(timestamp)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  })
}
