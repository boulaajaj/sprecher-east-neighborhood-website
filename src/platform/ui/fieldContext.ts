import { createContext, use } from 'react'

/** What a `Field` hands its one control, so no control repeats the wiring. */
export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

export const FieldContext = createContext<FieldControlProps | null>(null)

/**
 * The id and ARIA links of the `Field` around a control. A control outside a `Field` would have
 * no label, so it fails loudly instead of rendering an unlabelled input.
 */
export function useFieldControl(part: string): FieldControlProps {
  const field = use(FieldContext)
  if (!field) throw new Error(`${part} must be placed inside a <Field>, which gives it its label`)
  return field
}
