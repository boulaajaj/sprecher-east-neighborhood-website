import { Check, CircleDashed, HelpCircle } from 'lucide-react'
import React from 'react'

import { cn } from '@/platform/lib/cn'
import { Badge, type BadgeProps } from '@/platform/ui/Badge'
import { Card } from '@/platform/ui/Card'
import { Link } from '@/platform/ui/Link'

import { CERTAINTY_LABELS, type Certainty } from './certainty'
import { FACT_ICONS } from './factIcons'
import type { KeyFact, KeyFactsProps } from './keyFacts'

/**
 * A row of small fact cards (#509), after the USWDS icon list and summary box: an icon, a big
 * short value, what it is, how sure we are in words, and the source. A list, so screen readers
 * hear how many facts there are; the label comes before the value in reading order through
 * `dt`/`dd`, while the value leads visually.
 */
export function KeyFacts({ facts, className }: KeyFactsProps & { className?: string }) {
  if (facts.length === 0) return null
  return (
    <ul
      className={cn(
        'not-prose my-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2',
        facts.length % 3 === 0 && 'lg:grid-cols-3',
        className,
      )}
    >
      {facts.map((fact, index) => (
        <li key={`${index}-${fact.label}`} className="flex">
          <FactCard fact={fact} />
        </li>
      ))}
    </ul>
  )
}

function FactCard({ fact }: { fact: KeyFact }) {
  const { Icon } = FACT_ICONS[fact.icon]
  return (
    <Card variant="muted" padding="sm" className="flex w-full flex-col gap-2">
      <Icon aria-hidden="true" className="size-6 text-primary" />
      <dl className="flex flex-col-reverse">
        <dt className="text-sm leading-snug text-muted-foreground">{fact.label}</dt>
        <dd className="text-2xl leading-tight font-bold [overflow-wrap:anywhere] text-foreground">
          {fact.value}
        </dd>
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
        <CertaintyBadge certainty={fact.certainty} />
        {fact.source && (
          <Link href={fact.source.href} external={fact.source.external} className="text-sm">
            {fact.source.label}
          </Link>
        )}
      </div>
    </Card>
  )
}

const BADGE: Record<Certainty, { variant: BadgeProps['variant']; Icon: typeof Check }> = {
  confirmed: { variant: 'category', Icon: Check },
  estimate: { variant: 'caution', Icon: CircleDashed },
  unknown: { variant: 'neutral', Icon: HelpCircle },
}

function CertaintyBadge({ certainty }: { certainty: Certainty }) {
  const { variant, Icon } = BADGE[certainty]
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {CERTAINTY_LABELS[certainty]}
    </Badge>
  )
}
