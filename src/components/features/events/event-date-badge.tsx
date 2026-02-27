import { getDateParts } from '@/lib/utils'

interface EventDateBadgeProps {
  date: string
}

export function EventDateBadge({ date }: EventDateBadgeProps) {
  const parts = getDateParts(date)
  return (
    <div className="flex w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/8 px-1 py-2 text-center">
      <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
        {parts.month}
      </span>
      <span className="mt-0.5 text-2xl leading-none font-bold text-primary">{parts.day}</span>
    </div>
  )
}
