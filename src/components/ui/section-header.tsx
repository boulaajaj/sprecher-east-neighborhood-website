import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  viewAllHref?: string
  viewAllLabel?: string
}

export function SectionHeader({ eyebrow, title, viewAllHref, viewAllLabel = 'View all' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{eyebrow}</p>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          {viewAllLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}
