'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { Field } from '@/platform/ui'

import { toSearchHref } from '../domain/search'

/** How long typing pauses before the results follow it. */
const SEARCH_PAUSE_MS = 200

/** The search box: results follow what's typed, after a short pause. */
export const SearchBox: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const [value, setValue] = useState(initialQuery)
  const router = useRouter()
  // The query the address shows (trimmed, as `parseSearchQuery` reads it), so arriving at
  // /search?q=… doesn't navigate again, and a space typed between words doesn't either
  const shownQuery = useRef(initialQuery)

  // Each change restarts the pause, and is compared with what the address shows when the pause
  // ends; a query the box was set to from the address cancels a pause still running
  useEffect(() => {
    const query = value.trim()
    if (query === shownQuery.current) return
    const pause = setTimeout(() => {
      shownQuery.current = query
      router.push(toSearchHref(query))
    }, SEARCH_PAUSE_MS)
    return () => clearTimeout(pause)
  }, [value, router])

  // The address changed without the box (back, forward, a search link): show its query. The
  // box's own navigation brings back the query it already shows, so typing is never undone.
  useEffect(() => {
    if (initialQuery === shownQuery.current) return
    shownQuery.current = initialQuery
    setValue(initialQuery)
  }, [initialQuery])

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        // Enter searches right away, without waiting for the pause
        shownQuery.current = value.trim()
        router.push(toSearchHref(value))
      }}
    >
      <Field label="Search" hideLabel>
        <Field.Input
          type="search"
          size="lg"
          leadingIcon={<SearchIcon />}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search news and events"
        />
      </Field>
    </form>
  )
}
