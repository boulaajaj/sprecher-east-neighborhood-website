'use client'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Controller } from 'react-hook-form'

import { Field, type FormApi, type SelectOption } from '@/platform/ui'

import { Message } from './Message'
import { countryOptions } from './countryOptions'
import { type FormField, type ValueField, isValueField } from './schema'
import { stateOptions } from './stateOptions'

export type FormValues = Record<string, unknown>

type Props = {
  field: FormField
  form: FormApi<FormValues, FormValues>
}

const choices = (field: ValueField): { options: readonly SelectOption[]; placeholder: string } => {
  if (field.blockType === 'select') {
    return { options: field.options, placeholder: field.placeholder || 'Choose one' }
  }
  if (field.blockType === 'state') return { options: stateOptions, placeholder: 'Choose a state' }
  return { options: countryOptions, placeholder: 'Choose a country' }
}

/** One field of a form built in the CMS, drawn with the shared `Field`. */
export function FormBuilderField({ field, form }: Props) {
  if (field.blockType === 'message') {
    return <Message message={field.message as DefaultTypedEditorState} />
  }
  // The plugin's radio, date and upload fields aren't offered on this site
  if (!isValueField(field)) return null

  const { name } = field
  const frame = {
    label: field.label || name,
    required: field.required,
    // The CMS stores a percentage; anything up to half shares a row from 640 px
    width: field.width && field.width <= 50 ? 'half' : 'full',
  } as const

  switch (field.blockType) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <Field {...frame} error={form.formState.errors[name]?.message}>
          <Field.Input
            type={field.blockType}
            autoComplete={field.blockType === 'email' ? 'email' : undefined}
            {...form.register(name)}
          />
        </Field>
      )
    case 'textarea':
      return (
        <Field {...frame} error={form.formState.errors[name]?.message}>
          <Field.TextArea autoGrow {...form.register(name)} />
        </Field>
      )
    case 'checkbox':
      // Radix controls have no native input to register, so they go through a Controller
      return (
        <Controller
          control={form.control}
          name={name}
          render={({ field: control, fieldState }) => (
            <Field {...frame} error={fieldState.error?.message}>
              <Field.Checkbox
                name={control.name}
                checked={control.value === true}
                onCheckedChange={control.onChange}
                onBlur={control.onBlur}
                ref={control.ref}
              />
            </Field>
          )}
        />
      )
    default:
      return (
        <Controller
          control={form.control}
          name={name}
          render={({ field: control, fieldState }) => (
            <Field {...frame} error={fieldState.error?.message}>
              <Field.Select
                {...choices(field)}
                name={control.name}
                value={typeof control.value === 'string' ? control.value : ''}
                onValueChange={control.onChange}
                onBlur={control.onBlur}
                ref={control.ref}
              />
            </Field>
          )}
        />
      )
  }
}
