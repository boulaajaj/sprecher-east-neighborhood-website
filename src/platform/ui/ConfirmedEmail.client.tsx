'use client'

import { createContext, useContext } from 'react'

/**
 * The address a visitor has just confirmed by link (#183), for what the confirm page offers next
 * in its slot, such as an account (#187). The `verification` module provides it and another
 * module reads it, so neither imports the other (decision 0008). `null` outside a confirmed
 * answer. Only a prefill: confirming here never confirms anything in the reading module.
 */
export const ConfirmedEmailContext = createContext<string | null>(null)

/** The address the confirm page just confirmed, or `null`. */
export const useConfirmedEmail = (): string | null => useContext(ConfirmedEmailContext)
