export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { headers } from 'next/headers'
import { CopyButton } from '@/components/CopyButton'
import { getCurrentUser } from '@/lib/auth'
import { listGatewaysByOwner, listGatewayTools } from '@/lib/gateways'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const gateways = user ? await listGatewaysByOwner(user.id) : []
  const toolCounts = await Promise.all(gateways.map((g) => listGatewayTools(g.id)))
  const host = (await headers()).get('host')
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const totalTools = toolCounts.reduce((sum, t) => sum + t.length, 0)
  const activeCount = gateways.filter((g) => g.is_active).length

  return (
    <>
      <header className="page-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Gateway kamu</h1>
          <p className="page-head__sub">Setiap gateway jadi satu endpoint MCP yang bisa dipakai client AI.</p>
        </div>
        <div className="page-head__actions">
          <Link className="btn btn-outline" href="/dashboard/templates">Jelajahi template</Link>
          <Link className="btn btn-primary" href="/dashboard/gateways/new">+ Gateway baru</Link>
        </div>
      </header>

      <div className="stat-strip stat-strip--wide">
        <div className="stat">
          <span className="stat__value">{gateways.length}</span>
          <span className="stat__label">gateway</span>
        </div>
        <div className="stat">
          <span className="stat__value">{activeCount}</span>
          <span className="stat__label">aktif</span>
        </div>
        <div className="stat">
          <span className="stat__value">{totalTools}</span>
          <span className="stat__label">tool total</span>
        </div>
      </div>

      {gateways.length === 0 ? (
        <section className="empty">
          <div className="empty__icon" aria-hidden>⟟</div>
          <h2>Belum ada gateway</h2>
          <p>Mulai dari template yang sudah siap pakai, atau susun tool sendiri dari nol.</p>
          <div className="page-head__actions">
            <Link className="btn btn-primary" href="/dashboard/templates">Pilih template</Link>
            <Link className="btn btn-outline" href="/dashboard/gateways/new">Buat dari nol</Link>
          </div>
        </section>
      ) : (
        <div className="gateway-grid">
          {gateways.map((g, i) => {
            const url = `${proto}://${host}/mcp/${g.slug}`
            return (
              <article className="gateway-card" key={g.id}>
                <div className="gateway-card__head">
                  <div>
                    <h3>{g.name}</h3>
                    <span className="mono gateway-card__slug">/{g.slug}</span>
                  </div>
                  <span className={`badge ${g.is_active ? 'badge--active' : 'badge--inactive'}`}>
                    {g.is_active ? 'aktif' : 'nonaktif'}
                  </span>
                </div>

                <div className="gateway-card__url">
                  <code className="mono">{url}</code>
                  <CopyButton value={url} label="Salin" />
                </div>

                <div className="gateway-card__foot">
                  <span className="card__meta">{toolCounts[i].length} tool</span>
                  <Link className="link-arrow" href={`/dashboard/gateways/${g.id}`}>Kelola →</Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
