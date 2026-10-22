'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { Field } from '@/platform/ui'
import { useDebounce } from '@/utilities/useDebounce'

import { toSearchHref } from '../domain/search'

/** The search box: results follow what's typed, after a short pause. */
export const SearchBox: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const [value, setValue] = useState(initialQuery)
  const router = useRouter()
  // The query the URL already shows, so arriving at /search?q=… doesn't navigate again
  const shownQuery = useRef(initialQuery)

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    if (debouncedValue === shownQuery.current) return
    shownQuery.current = debouncedValue
    router.push(toSearchHref(debouncedValue))
  }, [debouncedValue, router])

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        // Enter searches right away, without waiting for the pause
        shownQuery.current = value
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
