'use client'

import { useEffect, useState } from 'react'

export function CopyButton({ value, label = 'Salin', className = '' }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
    }
  }

  return (
    <button type="button" onClick={copy} className={`btn btn-outline copy-btn ${copied ? 'is-copied' : ''} ${className}`}>
      {copied ? 'Tersalin ✓' : label}
    </button>
  )
}
