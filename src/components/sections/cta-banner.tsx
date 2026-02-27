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
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{title}</h2>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-white/80">{description}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-primary shadow-md transition-colors hover:bg-surface"
          >
            <Users className="h-4 w-4" />
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
