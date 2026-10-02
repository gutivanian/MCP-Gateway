export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { listGatewaysByOwner, listGatewayTools } from '@/lib/gateways'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const gateways = user ? await listGatewaysByOwner(user.id) : []
  const toolCounts = await Promise.all(gateways.map((g) => listGatewayTools(g.id)))

  return (
    <>
      <div className="dash__header">
        <h1>Your gateways</h1>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Link className="btn btn-outline" href="/dashboard/templates">Browse templates</Link>
          <Link className="btn btn-primary" href="/dashboard/gateways/new">New gateway</Link>
        </div>
      </div>

      {gateways.length === 0 ? (
        <div className="empty-state">
          <h3>No gateways yet</h3>
          <p>Clone a template or build a custom one to get your first MCP endpoint.</p>
        </div>
      ) : (
        gateways.map((g, i) => (
          <div className="card" key={g.id}>
            <div className="card__row">
              <div>
                <h3>{g.name}</h3>
                <p className="card__meta mono">/mcp/{g.slug} · {toolCounts[i].length} tools</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <span className={`badge ${g.is_active ? 'badge--active' : 'badge--inactive'}`}>
                  {g.is_active ? 'active' : 'inactive'}
                </span>
                <Link className="btn btn-outline" href={`/dashboard/gateways/${g.id}`}>Manage</Link>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}
