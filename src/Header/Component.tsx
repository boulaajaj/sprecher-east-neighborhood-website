import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React, { type ReactNode } from 'react'

import type { Header as HeaderData } from '@/payload-types'

/**
 * The site header. The account links come in as slots from the layout, which composes the
 * accounts module (decision 0008): `accountMenu` for the desktop bar, `mobileAccountMenu` for
 * the mobile menu.
 */
export async function Header({
  accountMenu,
  mobileAccountMenu,
}: {
  accountMenu: ReactNode
  mobileAccountMenu: ReactNode
}) {
  const headerData: HeaderData = await getCachedGlobal('header', 1)()

  return (
    <HeaderClient
      data={headerData}
      accountMenu={accountMenu}
      mobileAccountMenu={mobileAccountMenu}
    />
  )
}
