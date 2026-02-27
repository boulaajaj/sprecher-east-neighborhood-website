import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  viewAllHref?: string
  viewAllLabel?: string
}

export function SectionHeader({
  eyebrow,
  title,
  viewAllHref,
  viewAllLabel = 'View all',
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <p className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</p>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
        >
          {viewAllLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
