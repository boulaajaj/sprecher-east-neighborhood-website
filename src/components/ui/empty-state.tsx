import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-10 text-center', className)}>
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
    </div>
  )
}
