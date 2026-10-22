'use client'

import { cn } from '@/platform/lib/cn'
import type { ComponentProps } from 'react'

import { controlVariants } from './controlVariants'
import { useFieldControl } from './fieldContext'

export type FieldTextAreaProps = Omit<ComponentProps<'textarea'>, 'id'> & {
  /**
   * Grows with its content, from about three lines up to a cap. Browsers without CSS
   * `field-sizing` keep the `rows` height and the resize handle.
   */
  autoGrow?: boolean
}

/**
 * A multi-line text input; place it inside a `Field`. Works controlled or with react-hook-form's
 * `{...register(name)}`.
 */
export function FieldTextArea({
  rows = 3,
  autoGrow = false,
  className,
  ...rest
}: FieldTextAreaProps) {
  const field = useFieldControl('Field.TextArea')
  return (
    <textarea
      {...rest}
      {...field}
      rows={rows}
      className={cn(
        controlVariants(),
        'block resize-y py-2.5 leading-relaxed',
        autoGrow && 'field-sizing-content max-h-96 min-h-24',
        className,
      )}
    />
  )
}
