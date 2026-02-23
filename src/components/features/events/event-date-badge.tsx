import { getDateParts } from '@/lib/utils'

interface EventDateBadgeProps {
  date: string
}

export function EventDateBadge({ date }: EventDateBadgeProps) {
  const parts = getDateParts(date)
  return (
    <div className="flex-shrink-0 w-14 flex flex-col items-center justify-center bg-primary/8 rounded-xl py-2 px-1 text-center">
      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{parts.month}</span>
      <span className="text-2xl font-bold text-primary leading-none mt-0.5">{parts.day}</span>
    </div>
  )
}
