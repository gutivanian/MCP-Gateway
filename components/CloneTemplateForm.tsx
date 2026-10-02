'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { CredentialFieldDef } from '@/lib/types'

export function CloneTemplateForm({
  templateSlug,
  defaultName,
  defaultBaseUrl,
  credentialFields,
}: {
  templateSlug: string
  defaultName: string
  defaultBaseUrl: string
  credentialFields: CredentialFieldDef[]
}) {
  const router = useRouter()
  const [name, setName] = useState(defaultName)
  const [slug, setSlug] = useState('')
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl)
  const [creds, setCreds] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/templates/${templateSlug}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, baseUrl, credentials: creds }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Gagal clone template')
      setToken(data.data.rawToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal clone template')
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
        <label htmlFor="name">Gateway name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required />
      </div>
      <div className="field">
        <label htmlFor="slug">Slug (used in the MCP URL: /mcp/&lt;slug&gt;)</label>
        <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={loading} required pattern="[a-z][a-z0-9-]{1,62}" />
      </div>
      <div className="field">
        <label htmlFor="baseUrl">Base URL</label>
        <input id="baseUrl" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} disabled={loading} required />
      </div>
      {credentialFields.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={f.key}>{f.label}</label>
          <input
            id={f.key}
            type={f.type === 'secret' ? 'password' : 'text'}
            required={f.required}
            disabled={loading}
            value={creds[f.key] ?? ''}
            onChange={(e) => setCreds((c) => ({ ...c, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
        {loading ? 'Cloning…' : 'Clone template'}
      </button>
    </form>
  )
}
