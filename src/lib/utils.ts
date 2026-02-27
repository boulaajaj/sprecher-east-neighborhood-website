export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
  return d.toLocaleDateString(
    'en-US',
    opts ?? { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
  )
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, { month: 'long', day: 'numeric', year: 'numeric' })
}

export function getDateParts(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    year: d.getFullYear(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
