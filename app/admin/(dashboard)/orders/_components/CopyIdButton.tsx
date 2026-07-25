'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortId = id.length > 10 ? id.substring(0, 10) + '...' : id

  return (
    <div className="flex items-center gap-1.5 group/copy">
      <span className="text-stone-400 text-xs" title={id}>
        {shortId}
      </span>
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
        title="Copy full ID"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-600" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  )
}
