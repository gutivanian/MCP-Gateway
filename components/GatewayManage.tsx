'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GatewayToolRow } from '@/lib/types'
import { CopyButton } from './CopyButton'
import { SecretReveal } from './SecretReveal'

export function GatewayManage({
  gatewayId,
  slug,
  mcpUrl,
  isActive,
  tokenPrefix,
  credentialKeys,
  tools,
}: {
  gatewayId: number
  slug: string
  mcpUrl: string
  isActive: boolean
  tokenPrefix: string
  credentialKeys: string[]
  tools: GatewayToolRow[]
}) {
  const router = useRouter()
  const [toolsJson, setToolsJson] = useState(() => JSON.stringify(tools.map(stripMeta), null, 2))
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  const tokenForSnippet = newToken ?? '<TOKEN_GATEWAY>'
  const claudeCommand = `claude mcp add --transport http ${slug} ${mcpUrl} --header "Authorization: Bearer ${tokenForSnippet}"`
  const genericJson = JSON.stringify(
    {
      mcpServers: {
        [slug]: {
          type: 'http',
          url: mcpUrl,
          headers: { Authorization: `Bearer ${tokenForSnippet}` },
        },
      },
    },
    null,
    2
  )

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
    if (!confirm('Buat token baru? Token lama langsung tidak berlaku. Client MCP yang masih pakai token lama harus diupdate.')) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/gateways/${gatewayId}/regenerate-token`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Gagal membuat token baru')
      setNewToken(data.data.rawToken)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat token baru')
    } finally {
      setLoading(false)
    }
  }

  async function deleteGateway() {
    if (!confirm('Hapus gateway ini? Tindakan ini tidak bisa dibatalkan.')) return
    setLoading(true)
    try {
      await fetch(`/api/gateways/${gatewayId}`, { method: 'DELETE' })
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="manage">
      {error && <div className="form-error">{error}</div>}
      {notice && <div className="form-success">{notice}</div>}

      <section className="card connect">
        <div className="card__head">
          <div>
            <p className="eyebrow">Endpoint MCP</p>
            <h2>Hubungkan ke client AI</h2>
          </div>
          <span className={`badge ${isActive ? 'badge--active' : 'badge--inactive'}`}>{isActive ? 'aktif' : 'nonaktif'}</span>
        </div>

        <div className="copy-row">
          <span className="copy-row__label">URL</span>
          <code className="copy-row__value mono">{mcpUrl}</code>
          <CopyButton value={mcpUrl} label="Salin URL" />
        </div>

        <div className="copy-row">
          <span className="copy-row__label">Token</span>
          <code className="copy-row__value mono">
            {newToken ?? `${tokenPrefix}••••••••••••••••••••••••••••••••••`}
          </code>
          {newToken ? (
            <CopyButton value={newToken} label="Salin token" />
          ) : (
            <span className="copy-row__hint">disembunyikan</span>
          )}
        </div>

        {newToken && (
          <SecretReveal
            title="Token baru dibuat"
            value={newToken}
            onDone={() => setNewToken(null)}
          />
        )}

        <div className="snippets">
          <div className="snippet">
            <div className="snippet__head">
              <span>Claude Code</span>
              <CopyButton value={claudeCommand} label="Salin perintah" />
            </div>
            <pre className="snippet__code"><code>{claudeCommand}</code></pre>
          </div>
          <div className="snippet">
            <div className="snippet__head">
              <span>Konfigurasi JSON (Claude Desktop, Cursor, dll.)</span>
              <CopyButton value={genericJson} label="Salin JSON" />
            </div>
            <pre className="snippet__code"><code>{genericJson}</code></pre>
          </div>
        </div>
        {!newToken && (
          <p className="card__meta">Token lengkap hanya muncul saat dibuat atau diregenerasi. Ganti <code>&lt;TOKEN_GATEWAY&gt;</code> dengan token yang kamu simpan.</p>
        )}
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <p className="eyebrow">Token</p>
            <h2>Token gateway</h2>
          </div>
        </div>
        <p className="card__meta">Dipakai client MCP untuk memanggil gateway ini. Terpisah dari API key backend.</p>
        <div className="row-actions">
          <button className="btn btn-outline" onClick={regenerateToken} disabled={loading}>Buat token baru</button>
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <p className="eyebrow">Credentials</p>
            <h2>API key backend</h2>
          </div>
          <span className="badge">{credentialKeys.includes('API_KEY') ? 'tersimpan' : 'belum diisi'}</span>
        </div>
        <p className="card__meta">Disimpan terenkripsi. Tidak pernah ditampilkan ulang setelah disimpan.</p>
        <div className="field">
          <label htmlFor="apiKey">API key baru</label>
          <input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={loading} placeholder="Tempel API key baru" autoComplete="off" />
        </div>
        <div className="row-actions">
          <button
            className="btn btn-primary"
            disabled={loading || !apiKey}
            onClick={() => {
              patch({ credentials: { API_KEY: apiKey } }, 'API key tersimpan')
              setApiKey('')
            }}
          >
            Simpan API key
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card__head">
          <div>
            <p className="eyebrow">Tools</p>
            <h2>{tools.length} tool</h2>
          </div>
          <button className="btn btn-outline" onClick={() => setShowEditor((v) => !v)}>
            {showEditor ? 'Tutup editor' : 'Edit JSON'}
          </button>
        </div>

        <ul className="tool-list">
          {tools.map((t) => (
            <li key={t.id} className="tool">
              <div className="tool__top">
                <span className="tool__name mono">{t.tool_key}</span>
                <span className={`method method--${t.http_method.toLowerCase()}`}>{t.http_method}</span>
              </div>
              <code className="tool__path mono">{t.path_template}</code>
              <p className="tool__desc">{t.description}</p>
              {t.input_fields.length > 0 && (
                <div className="tool__fields">
                  {t.input_fields.map((f) => (
                    <span key={f.key} className="field-chip mono">
                      {f.key}
                      <span className="field-chip__type">{f.type}{f.required ? '·wajib' : ''}</span>
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {showEditor && (
          <div className="editor">
            <div className="field">
              <label htmlFor="tools-json">Definisi tool (JSON)</label>
              <textarea id="tools-json" value={toolsJson} onChange={(e) => setToolsJson(e.target.value)} disabled={loading} spellCheck={false} />
            </div>
            <div className="row-actions">
              <button className="btn btn-primary" disabled={loading} onClick={() => patch({ toolsJson }, 'Tools tersimpan')}>
                Simpan tools
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="card card--danger">
        <div className="card__head">
          <div>
            <p className="eyebrow">Zona berbahaya</p>
            <h2>Status & hapus</h2>
          </div>
        </div>
        <div className="row-actions">
          <button className="btn btn-outline" disabled={loading} onClick={() => patch({ isActive: !isActive }, isActive ? 'Gateway dinonaktifkan' : 'Gateway diaktifkan')}>
            {isActive ? 'Nonaktifkan gateway' : 'Aktifkan gateway'}
          </button>
          <button className="btn btn-danger" disabled={loading} onClick={deleteGateway}>Hapus gateway</button>
        </div>
      </section>
    </div>
  )
}

function stripMeta(t: GatewayToolRow) {
  return {
    tool_key: t.tool_key,
    title: t.title,
    description: t.description,
    http_method: t.http_method,
    path_template: t.path_template,
    response_path: t.response_path,
    sort_order: t.sort_order,
    input_fields: t.input_fields,
  }
}
