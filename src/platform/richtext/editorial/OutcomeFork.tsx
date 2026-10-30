import { ArrowRight, CircleHelp, X } from 'lucide-react'
import React from 'react'

import { cn } from '@/platform/lib/cn'

import type { Outcome, OutcomeForkProps } from './outcomeFork'
import { OUTCOME_TONE_LABELS, type OutcomeTone } from './outcomeTone'

/**
 * One question branching to two or three outcomes (#510). On wide screens the outcomes sit side
 * by side under the question, joined by a stem and a bar; on phones they stack, hung from a line
 * down the left. The connectors are decoration: the question is a heading and the outcomes a list,
 * each title read with its tone in words ("Goes ahead: If they agree"), since the icon is hidden.
 */
export function OutcomeFork({
  question,
  outcomes,
  className,
}: OutcomeForkProps & { className?: string }) {
  if (!question || outcomes.length < 2) return null
  const columns = outcomes.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
  return (
    <div className={cn('not-prose my-8 w-full', className)}>
      <h3 className="rounded-2xl border border-border bg-surface px-6 py-4 text-lg leading-snug font-semibold text-pretty text-foreground sm:text-center">
        {question}
      </h3>
      {/* The stem from the question down to the branches (wide screens) */}
      <div
        aria-hidden="true"
        className="mx-auto hidden h-6 w-0.5 bg-muted-foreground/50 sm:block"
      />
      {/* `role="list"`: Safari drops list semantics from a list without bullets */}
      <ul
        role="list"
        className={cn('relative grid grid-cols-1 gap-4 pt-4 pl-10', 'sm:pt-0 sm:pl-0', columns)}
      >
        {outcomes.map((outcome, index) => (
          <OutcomeItem
            key={`${index}-${outcome.title}`}
            outcome={outcome}
            first={index === 0}
            last={index === outcomes.length - 1}
          />
        ))}
      </ul>
    </div>
  )
}

const CARD: Record<OutcomeTone, { card: string; title: string; Icon: typeof X }> = {
  go: { card: 'border-primary/40 bg-primary/10', title: 'text-primary-strong', Icon: ArrowRight },
  stop: {
    card: 'border-destructive/30 bg-destructive/10',
    title: 'text-destructive-strong',
    Icon: X,
  },
  open: { card: 'border-border bg-muted', title: 'text-foreground', Icon: CircleHelp },
}

function OutcomeItem({
  outcome,
  first,
  last,
}: {
  outcome: Outcome
  first: boolean
  last: boolean
}) {
  const { card, title, Icon } = CARD[outcome.tone]
  return (
    <li className="relative sm:pt-6">
      {/* Phones: the line down the left, hung from the question box's flat bottom edge (16 px in,
          clear of its rounded corner) and through the gap above this card. The last card's line
          stops at its branch: 16 px gap + 24 px down to the branch + 2 px of branch (h-10.5).
          Then a short branch across to the card */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute -top-4 -left-6 w-0.5 bg-muted-foreground/50 sm:hidden',
          last ? 'h-10.5' : 'bottom-0',
        )}
      />
      <span
        aria-hidden="true"
        className="absolute top-6 -left-6 h-0.5 w-6 bg-muted-foreground/50 sm:hidden"
      />
      {/* Wide screens: the bar across the top, reaching from this card's middle to the next */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 hidden h-0.5 bg-muted-foreground/50 sm:block',
          first ? 'left-1/2' : '-left-2',
          last ? 'right-1/2' : '-right-2',
        )}
      />
      <span
        aria-hidden="true"
        className="absolute top-0 left-1/2 hidden h-6 w-0.5 -translate-x-1/2 bg-muted-foreground/50 sm:block"
      />
      <div className={cn('h-full rounded-2xl border p-6', card)}>
        <p className={cn('flex items-center gap-2 text-base font-semibold', title)}>
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          <span>
            <span className="sr-only">{OUTCOME_TONE_LABELS[outcome.tone]}: </span>
            {outcome.title}
          </span>
        </p>
        {outcome.description && (
          <p className="mt-2 text-base leading-relaxed text-foreground">{outcome.description}</p>
        )}
      </div>
    </li>
  )
}
