'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GatewayToolRow } from '@/lib/types'
import { CopyButton } from './CopyButton'
import { Icon } from './Icon'
import { SecretReveal } from './SecretReveal'
import { SnippetTabs } from './SnippetTabs'

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
  const jsonConfig = JSON.stringify(
    { mcpServers: { [slug]: { type: 'http', url: mcpUrl, headers: { Authorization: `Bearer ${tokenForSnippet}` } } } },
    null,
    2
  )
  const hasKey = credentialKeys.includes('API_KEY')

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
    <>
      {error && <div className="alert alert--error">{error}</div>}
      {notice && <div className="alert alert--success">{notice}</div>}

      <div className="manage-grid">
        <div className="manage-main">
          <section className="panel">
            <header className="panel__head">
              <div>
                <p className="eyebrow">Endpoint MCP</p>
                <h2>Hubungkan ke client AI</h2>
              </div>
              <span className={`status ${isActive ? 'status--on' : 'status--off'}`}>
                <span className="dot" aria-hidden />
                {isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </header>

            <div className="field-row">
              <span className="field-row__label">URL</span>
              <code className="field-row__value mono">{mcpUrl}</code>
              <CopyButton value={mcpUrl} label="Salin URL" className="btn-sm" />
            </div>

            <div className="field-row">
              <span className="field-row__label">Token</span>
              <code className="field-row__value mono">
                {newToken ?? `${tokenPrefix}${'•'.repeat(28)}`}
              </code>
              {newToken ? (
                <CopyButton value={newToken} label="Salin token" className="btn-sm" />
              ) : (
                <span className="field-row__hint">tersembunyi</span>
              )}
            </div>

            {newToken && (
              <SecretReveal title="Token baru dibuat" value={newToken} onDone={() => setNewToken(null)} />
            )}

            <div className="panel__section">
              <p className="panel__caption">Pasang di client</p>
              <SnippetTabs claudeCommand={claudeCommand} jsonConfig={jsonConfig} />
              {!newToken && (
                <p className="panel__hint">
                  Ganti <code>&lt;TOKEN_GATEWAY&gt;</code> dengan token yang kamu simpan. Token lengkap hanya tampil saat dibuat atau diregenerasi.
                </p>
              )}
            </div>
          </section>

          <section className="panel">
            <header className="panel__head">
              <div>
                <p className="eyebrow">Tools</p>
                <h2>{tools.length} tool terdaftar</h2>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEditor((v) => !v)}>
                <Icon name="json" size={15} />
                {showEditor ? 'Tutup editor' : 'Edit JSON'}
              </button>
            </header>

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
                    <div className="chips">
                      {t.input_fields.map((f) => (
                        <span key={f.key} className={`chip ${f.required ? 'chip--req' : ''}`}>
                          <span className="mono">{f.key}</span>
                          <span className="chip__type">{f.type}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {showEditor && (
              <div className="editor">
                <label className="label" htmlFor="tools-json">Definisi tool (JSON)</label>
                <textarea id="tools-json" className="textarea mono" value={toolsJson} onChange={(e) => setToolsJson(e.target.value)} disabled={loading} spellCheck={false} />
                <div className="row-actions">
                  <button className="btn btn-primary" disabled={loading} onClick={() => patch({ toolsJson }, 'Tools tersimpan')}>
                    Simpan tools
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="manage-aside">
          <section className="panel">
            <header className="panel__head">
              <div>
                <p className="eyebrow">Token gateway</p>
                <h2>Akses client</h2>
              </div>
              <Icon name="shield" size={20} className="panel__icon" />
            </header>
            <p className="panel__hint">Dipakai client MCP untuk memanggil gateway ini. Terpisah dari API key backend.</p>
            <button className="btn btn-secondary btn-block" onClick={regenerateToken} disabled={loading}>
              <Icon name="refresh" size={16} />
              Buat token baru
            </button>
          </section>

          <section className="panel">
            <header className="panel__head">
              <div>
                <p className="eyebrow">Credentials</p>
                <h2>API key backend</h2>
              </div>
              <span className={`status ${hasKey ? 'status--on' : 'status--off'}`}>
                <span className="dot" aria-hidden />
                {hasKey ? 'Tersimpan' : 'Kosong'}
              </span>
            </header>
            <p className="panel__hint">Disimpan terenkripsi dan tidak pernah ditampilkan ulang.</p>
            <label className="label" htmlFor="apiKey">API key baru</label>
            <input id="apiKey" className="input mono" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={loading} placeholder="Tempel API key" autoComplete="off" />
            <button
              className="btn btn-primary btn-block"
              disabled={loading || !apiKey}
              onClick={() => {
                patch({ credentials: { API_KEY: apiKey } }, 'API key tersimpan')
                setApiKey('')
              }}
            >
              <Icon name="key" size={16} />
              Simpan API key
            </button>
          </section>

          <section className="panel panel--danger">
            <header className="panel__head">
              <div>
                <p className="eyebrow eyebrow--danger">Zona berbahaya</p>
                <h2>Status & hapus</h2>
              </div>
            </header>
            <button
              className="btn btn-secondary btn-block"
              disabled={loading}
              onClick={() => patch({ isActive: !isActive }, isActive ? 'Gateway dinonaktifkan' : 'Gateway diaktifkan')}
            >
              <Icon name="power" size={16} />
              {isActive ? 'Nonaktifkan gateway' : 'Aktifkan gateway'}
            </button>
            <button className="btn btn-danger btn-block" disabled={loading} onClick={deleteGateway}>
              <Icon name="trash" size={16} />
              Hapus gateway
            </button>
          </section>
        </aside>
      </div>
    </>
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
