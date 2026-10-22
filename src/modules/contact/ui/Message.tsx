import RichText from '@/components/RichText'
import React from 'react'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

/** Text between a form's fields: a full-width grid cell, lined up with the fields (no gutter). */
export const Message: React.FC<{ message: DefaultTypedEditorState }> = ({ message }) => {
  if (!message) return null
  return <RichText data={message} enableGutter={false} />
}
