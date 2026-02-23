import { cn } from '@/lib/utils'

const EVENT_CATEGORY_STYLES: Record<string, string> = {
  government: 'bg-blue-50 text-blue-700 border-blue-200',
  community:  'bg-green-50 text-green-700 border-green-200',
  social:     'bg-purple-50 text-purple-700 border-purple-200',
  other:      'bg-surface text-muted border-border',
}

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const label = category.charAt(0).toUpperCase() + category.slice(1)
  const style = EVENT_CATEGORY_STYLES[category] ?? EVENT_CATEGORY_STYLES.other
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', style, className)}>
      {label}
    </span>
  )
}

interface StatusBadgeProps {
  label: string
  className?: string
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-muted border border-border', className)}>
      {label}
    </span>
  )
}

interface TagBadgeProps {
  tag: string
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="text-xs px-2 py-0.5 bg-surface text-muted rounded-full">
      {tag}
    </span>
  )
}
