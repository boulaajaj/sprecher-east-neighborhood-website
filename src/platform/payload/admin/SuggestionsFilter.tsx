import type { BeforeListTableServerProps } from 'payload'
import React from 'react'

import { countSuggestions } from '../reviewQueue'
import './SuggestionsFilter.scss'

const baseClass = 'suggestions-filter'
// The list view's own filter, as a URL query (the same one its Filters menu builds)
const FILTER_KEY = 'where[moderationStatus][equals]'

/**
 * Above the events and posts lists in Admin: how many suggestions wait for review, with a link
 * that filters the list to them, and one back to everything (#123).
 */
const SuggestionsFilter = async ({
  collectionSlug,
  payload,
  searchParams,
  user,
}: BeforeListTableServerProps) => {
  const totalDocs = await countSuggestions(payload, collectionSlug, user)
  const filtered = searchParams?.[FILTER_KEY] === 'suggested'
  const listUrl = `${payload.config.routes.admin}/collections/${collectionSlug}`

  return (
    <div className={baseClass}>
      {filtered ? (
        <a href={listUrl}>Show everything</a>
      ) : totalDocs === 0 ? (
        <span>No suggestions waiting for review</span>
      ) : (
        <a href={`${listUrl}?${encodeURIComponent(FILTER_KEY)}=suggested`}>
          {totalDocs === 1 ? '1 suggestion' : `${totalDocs} suggestions`} waiting for review
        </a>
      )}
    </div>
  )
}

export default SuggestionsFilter
