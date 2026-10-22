'use client'
import { Button } from '@/platform/ui'
import { Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const [text, setText] = useState('Copy')

  function updateCopyStatus() {
    if (text === 'Copy') {
      setText(() => 'Copied!')
      setTimeout(() => {
        setText(() => 'Copy')
      }, 1000)
    }
  }

  return (
    <div className="flex justify-end">
      <Button
        // The code block is black in both themes
        variant="inverse-outline"
        size="sm"
        iconStart={<Copy aria-hidden="true" />}
        aria-live="polite"
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
        }}
      >
        {text}
      </Button>
    </div>
  )
}
