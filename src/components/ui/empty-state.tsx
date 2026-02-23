import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('bg-surface rounded-2xl border border-border p-10 text-center', className)}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-sm mx-auto">{description}</p>
    </div>
  )
}
