import Link from 'next/link'
import { Users } from 'lucide-react'

interface CtaBannerProps {
  title?: string
  description?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function CtaBanner({
  title = 'Join Your Neighbors',
  description = 'Membership is free and optional. Come to a meeting, volunteer for a project, or just say hello — every neighbor is welcome.',
  primaryHref = '/get-involved',
  primaryLabel = 'Get Involved',
  secondaryHref = '/contact',
  secondaryLabel = 'Contact Us',
}: CtaBannerProps) {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-surface transition-colors shadow-md"
          >
            <Users className="w-4 h-4" />
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white/70 hover:bg-white/10 transition-colors"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
