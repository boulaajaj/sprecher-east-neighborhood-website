import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import { z } from 'zod'

const REQUIRED = 'This field is required'
const CHOOSE = 'Choose an option'
const TICK = 'Tick this box to continue'
const EMAIL = 'Enter an email address, like name@example.com'
/** The check the email field has always made: text, an @, more text, and no spaces */
const EMAIL_PATTERN = /^\S[^\s@]*@\S+$/

/** The value fields this site renders. The plugin's types leave out `number`. */
export type ValueField =
  | Extract<
      FormFieldBlock,
      { blockType: 'text' | 'email' | 'textarea' | 'select' | 'state' | 'country' | 'checkbox' }
    >
  | {
      blockType: 'number'
      name: string
      label?: string
      required?: boolean
      width?: number
      defaultValue?: number | string
    }

/** A field block as the CMS sends it, `number` included */
export type FormField = FormFieldBlock | ValueField

const VALUE_FIELD_TYPES = new Set<string>([
  'text',
  'email',
  'number',
  'textarea',
  'select',
  'state',
  'country',
  'checkbox',
])

export const isValueField = (field: FormField): field is ValueField =>
  VALUE_FIELD_TYPES.has(field.blockType)

type ChoiceField = Extract<ValueField, { blockType: 'select' | 'state' | 'country' }>

/** Fields drawn as a select, through a Controller rather than a registered input */
const isChoiceField = (field: ValueField): field is ChoiceField =>
  field.blockType === 'select' || field.blockType === 'state' || field.blockType === 'country'

function toFieldSchema(field: ValueField): z.ZodType {
  if (field.blockType === 'checkbox') {
    return field.required ? z.boolean().refine((ticked) => ticked, TICK) : z.boolean()
  }
  const text = z.string().trim()
  const choice = isChoiceField(field)
  const filled = field.required ? text.min(1, choice ? CHOOSE : REQUIRED) : text
  if (field.blockType !== 'email') return filled
  return filled.refine((value) => value === '' || EMAIL_PATTERN.test(value), EMAIL)
}

/**
 * The Zod schema for a form built in the CMS: one entry per value field, checked the way the
 * fields always were (required, and the email pattern). Values are trimmed; anything that isn't
 * one of the form's fields is dropped.
 */
export function toFormSchema(fields: readonly FormField[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of fields) {
    if (isValueField(field)) shape[field.name] = toFieldSchema(field)
  }
  return z.object(shape)
}

/**
 * Starting values: checkboxes start unticked and selects empty, unless the form gives them a
 * default. A text field gets one only when the form sets it: with none, its input keeps what the
 * visitor typed or the browser autofilled before the page loaded.
 */
export function toDefaultValues(fields: readonly FormField[]) {
  const values: Record<string, string | boolean> = {}
  for (const field of fields) {
    if (!isValueField(field)) continue
    if (field.blockType === 'checkbox') {
      values[field.name] = field.defaultValue ?? false
    } else if (isChoiceField(field)) {
      values[field.name] = field.defaultValue ?? ''
    } else if (field.defaultValue !== undefined && field.defaultValue !== null) {
      // A number field's default is a number; its input holds text
      values[field.name] = String(field.defaultValue)
    }
  }
  return values
}
