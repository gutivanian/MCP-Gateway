'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GatewayToolRow } from '@/lib/types'

export function GatewayManage({
  gatewayId,
  slug,
  mcpUrl,
  isActive,
  tools,
}: {
  gatewayId: number
  slug: string
  mcpUrl: string
  isActive: boolean
  tools: GatewayToolRow[]
}) {
  const router = useRouter()
  const [toolsJson, setToolsJson] = useState(() => JSON.stringify(tools, null, 2))
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function patch(body: Record<string, unknown>, successMessage: string) {
    setError(null)
    setNotice(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/gateways/${gatewayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Gagal menyimpan')
      setNotice(successMessage)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setLoading(false)
    }
  }

  async function regenerateToken() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/gateways/${gatewayId}/regenerate-token`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Gagal regenerate token')
      setNewToken(data.data.rawToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal regenerate token')
    } finally {
      setLoading(false)
    }
  }

  async function deleteGateway() {
    if (!confirm('Delete this gateway? This cannot be undone.')) return
    setLoading(true)
    try {
      await fetch(`/api/gateways/${gatewayId}`, { method: 'DELETE' })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <h3>MCP endpoint</h3>
        <div className="token-reveal mono">{mcpUrl}</div>
        <p className="card__meta">Slug: {slug}</p>
      </div>

      {error && <div className="form-error">{error}</div>}
      {notice && <div className="form-success">{notice}</div>}

      <div className="card">
        <h3>Token</h3>
        {newToken ? (
          <div className="token-reveal mono">{newToken}</div>
        ) : (
          <p className="card__meta">Hidden after creation. Regenerate to get a new one (invalidates the old token).</p>
        )}
        <button className="btn btn-outline" onClick={regenerateToken} disabled={loading}>
          Regenerate token
        </button>
      </div>

      <div className="card">
        <h3>Credentials</h3>
        <p className="card__meta">Write-only — existing values are never shown back.</p>
        <div className="field">
          <label htmlFor="apiKey">API_KEY</label>
          <input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={loading} placeholder="Leave blank to keep current value" />
        </div>
        <button
          className="btn btn-outline"
          disabled={loading || !apiKey}
          onClick={() => {
            patch({ credentials: { API_KEY: apiKey } }, 'Credentials updated')
            setApiKey('')
          }}
        >
          Update credential
        </button>
      </div>

      <div className="card">
        <h3>Tools (JSON)</h3>
        <div className="field">
          <textarea value={toolsJson} onChange={(e) => setToolsJson(e.target.value)} disabled={loading} spellCheck={false} style={{ minHeight: '20rem' }} />
        </div>
        <button className="btn btn-primary" disabled={loading} onClick={() => patch({ toolsJson }, 'Tools updated')}>
          Save tools
        </button>
      </div>

      <div className="card">
        <h3>Danger zone</h3>
        <div className="card__row">
          <button className="btn btn-outline" disabled={loading} onClick={() => patch({ isActive: !isActive }, isActive ? 'Gateway deactivated' : 'Gateway activated')}>
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button className="btn btn-danger" disabled={loading} onClick={deleteGateway}>
            Delete gateway
          </button>
        </div>
      </div>
    </>
  )
}
