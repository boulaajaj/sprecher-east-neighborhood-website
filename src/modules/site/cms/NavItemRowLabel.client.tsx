'use client'
import type { Header } from '@/payload-types'
import type { RowLabelProps } from '@payloadcms/ui'
import { useRowLabel } from '@payloadcms/ui'

/** Admin row label for a header or footer link: "Nav item 2: Events". */
export const NavItemRowLabel: React.FC<RowLabelProps> = () => {
  // The header's and the footer's nav items have the same fields
  const data = useRowLabel<NonNullable<Header['navItems']>[number]>()

  const label = data?.data?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Row'

  return <div>{label}</div>
}
