'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const EXAMPLE_TOOLS = JSON.stringify(
  [
    {
      tool_key: 'example_tool',
      title: 'Example Tool',
      description: 'Describe what this tool does.',
      http_method: 'GET',
      path_template: '/api/v1/example/{{input.id}}',
      response_path: null,
      input_fields: [{ key: 'id', type: 'string', required: true, in: 'path' }],
    },
  ],
  null,
  2
)

export function NewGatewayForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [authHeaderValueTemplate, setAuthHeaderValueTemplate] = useState('Bearer {{credentials.API_KEY}}')
  const [apiKey, setApiKey] = useState('')
  const [toolsJson, setToolsJson] = useState(EXAMPLE_TOOLS)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          baseUrl,
          authHeaderValueTemplate,
          credentials: apiKey ? { API_KEY: apiKey } : {},
          toolsJson,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Gagal membuat gateway')
      setToken(data.data.rawToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat gateway')
    } finally {
      setLoading(false)
    }
  }

  if (token) {
    return (
      <div className="card">
        <h3>Gateway created</h3>
        <p className="card__meta">Copy this token now — it won&apos;t be shown again.</p>
        <div className="token-reveal mono">{token}</div>
        <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required />
      </div>
      <div className="field">
        <label htmlFor="slug">Slug (used in the MCP URL: /mcp/&lt;slug&gt;)</label>
        <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={loading} required pattern="[a-z][a-z0-9-]{1,62}" />
      </div>
      <div className="field">
        <label htmlFor="baseUrl">Base URL</label>
        <input id="baseUrl" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} disabled={loading} required placeholder="https://api.example.com" />
      </div>
      <div className="field">
        <label htmlFor="authTemplate">Auth header value template</label>
        <input id="authTemplate" value={authHeaderValueTemplate} onChange={(e) => setAuthHeaderValueTemplate(e.target.value)} disabled={loading} />
      </div>
      <div className="field">
        <label htmlFor="apiKey">API_KEY credential</label>
        <input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={loading} />
      </div>
      <div className="field">
        <label htmlFor="tools">Tools (JSON)</label>
        <textarea id="tools" value={toolsJson} onChange={(e) => setToolsJson(e.target.value)} disabled={loading} spellCheck={false} />
      </div>
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
        {loading ? 'Creating…' : 'Create gateway'}
      </button>
    </form>
  )
}
