'use client'

import { Check, Circle, X } from 'lucide-react'
import React from 'react'

import { formatDayLabel } from '@/platform/lib/formatDateTime'
import { Button } from '@/platform/ui/Button'
import { HeatMap } from '@/platform/ui/HeatMap'

import { usePlanFilter } from './PlanFilter.client'

export type DayCount = { finished: number; opened: number }

/**
 * The four-week activity map as the plan's day filter: press a day to filter the missions and
 * projects below to the issues opened or finished on it, press it again to take it out. Each
 * chosen day is a pill under the map with its two counts (a check for finished, a dot for opened)
 * and a button to remove it. Pills wrap onto new lines. Nothing is chosen until someone presses a day.
 */
export function DayFilterMap({
  days,
  values,
  counts,
  label,
}: {
  days: string[]
  values: number[]
  /** Finished and opened on each day, in the order of `days` */
  counts: DayCount[]
  label: string
}) {
  const { top, toggleTop } = usePlanFilter()

  return (
    <div className="space-y-3">
      <HeatMap
        variant="calendar"
        days={days}
        values={values}
        label={label}
        selection={{ selected: top, onToggle: toggleTop }}
      />
      {top.length > 0 && (
        <ul aria-label="Days chosen" className="flex flex-wrap justify-center gap-2">
          {top.map((day) => {
            const { finished, opened } = counts[days.indexOf(day)] ?? { finished: 0, opened: 0 }
            return (
              <li key={day}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleTop(day)}
                  aria-label={`Remove ${formatDayLabel(day)}: ${finished} finished, ${opened} opened`}
                  iconEnd={<X aria-hidden="true" />}
                >
                  <span>{formatDayLabel(day)}</span>
                  <span className="inline-flex items-center gap-1 text-done-strong tabular-nums">
                    <Check aria-hidden="true" />
                    {finished}
                  </span>
                  <span className="inline-flex items-center gap-1 text-success-strong tabular-nums">
                    <Circle aria-hidden="true" className="fill-current" />
                    {opened}
                  </span>
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
