import React, { Fragment } from 'react'

import type { MediaProps } from './mediaProps'

import { ImageMedia } from './ImageMedia.client'
import { VideoMedia } from './VideoMedia.client'

export const Media: React.FC<MediaProps> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
    </Tag>
  )
}
