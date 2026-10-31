import React, { type ReactNode } from 'react'

import { getHeader } from '../data/globals'
import { SiteHeaderBar } from './SiteHeaderBar.client'

/**
 * The site header. The account links come in as slots from the layout, which composes the
 * accounts module (decision 0008): `accountMenu` for the desktop bar, `mobileAccountMenu` for
 * the mobile menu.
 */
export async function SiteHeader({
  accountMenu,
  mobileAccountMenu,
}: {
  accountMenu: ReactNode
  mobileAccountMenu: ReactNode
}) {
  const headerData = await getHeader()

  return (
    <SiteHeaderBar
      data={headerData}
      accountMenu={accountMenu}
      mobileAccountMenu={mobileAccountMenu}
    />
  )
}
