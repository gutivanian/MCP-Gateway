'use client'

import { useState } from 'react'
import { CopyButton } from './CopyButton'

export function SnippetTabs({ claudeCommand, jsonConfig }: { claudeCommand: string; jsonConfig: string }) {
  const [tab, setTab] = useState<'claude' | 'json'>('claude')
  const current = tab === 'claude' ? claudeCommand : jsonConfig

  return (
    <div className="snippet-tabs">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'claude'} className={`tab ${tab === 'claude' ? 'is-active' : ''}`} onClick={() => setTab('claude')}>
          Claude Code
        </button>
        <button role="tab" aria-selected={tab === 'json'} className={`tab ${tab === 'json' ? 'is-active' : ''}`} onClick={() => setTab('json')}>
          JSON (Desktop, Cursor)
        </button>
        <div className="tabs__spacer" />
        <CopyButton value={current} label={tab === 'claude' ? 'Salin perintah' : 'Salin JSON'} className="btn-sm" />
      </div>
      <pre className="codeblock"><code>{current}</code></pre>
    </div>
  )
}
