'use client'
import { Search as SearchIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

import { Field } from '@/platform/ui'

const toSearchURL = (query: string) => `/search${query ? `?q=${encodeURIComponent(query)}` : ''}`

/** The search box: results follow what's typed, after a short pause. */
export const Search: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const [value, setValue] = useState(initialQuery)
  const router = useRouter()
  // The query the URL already shows, so arriving at /search?q=… doesn't navigate again
  const shownQuery = useRef(initialQuery)

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    if (debouncedValue === shownQuery.current) return
    shownQuery.current = debouncedValue
    router.push(toSearchURL(debouncedValue))
  }, [debouncedValue, router])

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        // Enter searches right away, without waiting for the pause
        shownQuery.current = value
        router.push(toSearchURL(value))
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
